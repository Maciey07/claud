import { gsap, loadFlip, prefersReducedMotion } from './gsap';
import { hydratePlan, overlaps, plan, togglePlan } from './plan';
import { buildIcs, type IcsEvent } from './ics';
import { currentMode, now } from './clock';
import { dayKeyOf } from './format';
import { track } from './analytics';

interface Config {
  lang: 'pl' | 'en';
  q: { day: string; type: string; place: string; kids: string; nolang: string; ticket: string; view: string };
  daySlugs: string[];
  days: string[];
  typeSlugs: Record<string, string>;
  labels: { conflict: string; added: string; removed: string };
  resultsForms: { one: string; few: string; many: string };
  siteUrl: string;
  programPath: string;
}

interface State { day: string; types: Set<string>; kids: boolean; nolang: boolean; ticket: '' | 'free' | 'paid'; place: string }

const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;
const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function initProgram() {
  const root = $('[data-program]');
  const cfg = JSON.parse($('[data-program-config]').textContent!) as Config;
  const { q } = cfg;
  const cards = $$('.event', root);
  const groups = $$('[data-day-group]', root);
  const tabs = $$<HTMLButtonElement>('[data-tab]', root);
  const panel = $('[data-panel]', root);
  const typeSlugToKey = Object.fromEntries(Object.entries(cfg.typeSlugs).map(([k, v]) => [v, k]));
  const cardById = new Map(cards.map((c) => [c.dataset.event!, c]));
  hydratePlan();

  const toIcs = (c: HTMLElement): IcsEvent => ({
    uid: c.dataset.event!, title: c.dataset.title!, location: `${c.dataset.locationName}, Oleśnica`, start: c.dataset.start!, end: c.dataset.end!,
    url: `${cfg.siteUrl}${cfg.programPath}`,
  });

  // ---------- Stan z URL ----------
  const params = new URLSearchParams(location.search);
  const defaultDay = () => {
    if (currentMode() === 'live') {
      const idx = cfg.days.indexOf(dayKeyOf(now()));
      if (idx > -1) return cfg.daySlugs[idx];
    }
    return cfg.daySlugs[0];
  };
  const state: State = {
    day: params.get(q.view) === 'plan' ? 'plan' : cfg.daySlugs.includes(params.get(q.day) ?? '') ? params.get(q.day)! : defaultDay(),
    types: new Set((params.get(q.type) ?? '').split(',').map((s) => typeSlugToKey[s]).filter(Boolean)),
    kids: params.get(q.kids) === '1',
    nolang: params.get(q.nolang) === '1',
    ticket: ({ bezplatne: 'free', free: 'free', biletowane: 'paid', paid: 'paid' } as Record<string, 'free' | 'paid'>)[params.get(q.ticket) ?? ''] ?? '',
    place: params.get(q.place) ?? params.get('miejsce') ?? params.get('place') ?? '',
  };

  // Wejście z mapy (?miejsce=…) bez dnia: pierwszy dzień z wydarzeniami w tym miejscu
  if (state.place && !params.get(q.day) && params.get(q.view) !== 'plan') {
    const first = cards.find((c) => c.dataset.place === state.place);
    const idx = first ? cfg.days.indexOf(first.dataset.day!) : -1;
    const current = cards.some((c) => c.dataset.place === state.place && c.dataset.day === cfg.days[cfg.daySlugs.indexOf(state.day)]);
    if (idx > -1 && !current) state.day = cfg.daySlugs[idx];
  }

  const writeUrl = () => {
    const p = new URLSearchParams();
    if (state.day === 'plan') p.set(q.view, 'plan'); else p.set(q.day, state.day);
    if (state.types.size) p.set(q.type, [...state.types].map((ty) => cfg.typeSlugs[ty]).join(','));
    if (state.kids) p.set(q.kids, '1');
    if (state.nolang) p.set(q.nolang, '1');
    if (state.ticket) p.set(q.ticket, cfg.lang === 'pl' ? (state.ticket === 'free' ? 'bezplatne' : 'biletowane') : state.ticket);
    if (state.place) p.set(q.place, state.place);
    history.replaceState(null, '', `${location.pathname}?${p}`);
  };

  // ---------- Render ----------
  let Flip: Awaited<ReturnType<typeof loadFlip>> | null = null;
  loadFlip().then((f) => (Flip = f));

  const matches = (c: HTMLElement) =>
    (!state.types.size || state.types.has(c.dataset.type!)) &&
    (!state.kids || c.dataset.kids === '1') &&
    (!state.nolang || c.dataset.nolang === '1') &&
    (!state.ticket || c.dataset.ticket === state.ticket) &&
    (!state.place || c.dataset.place === state.place);

  const resultsText = (n: number) => {
    const f = cfg.resultsForms;
    const form = n === 1 ? f.one : cfg.lang === 'pl' && [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? f.few : f.many;
    return form.replace('{n}', String(n));
  };

  const render = (animate = true) => {
    const flipState = animate && Flip && !prefersReducedMotion() ? Flip.getState(cards) : null;
    const planIds = new Set(plan.get());
    const isPlan = state.day === 'plan';
    const dayKey = isPlan ? null : cfg.days[cfg.daySlugs.indexOf(state.day)];
    let visible = 0;
    cards.forEach((c) => {
      const show = isPlan ? planIds.has(c.dataset.event!) && matches(c) : c.dataset.day === dayKey && matches(c);
      c.hidden = !show;
      if (show) visible++;
    });
    groups.forEach((g) => {
      g.hidden = isPlan ? !$$('.event', g).some((c) => !c.hidden) : g.dataset.dayGroup !== dayKey;
      $('.day-title', g).classList.toggle('visually-hidden', !isPlan);
    });
    $('[data-empty]', root).hidden = visible > 0 || (isPlan && planIds.size === 0);
    $('[data-plan-empty]', root).hidden = !(isPlan && planIds.size === 0);
    $('[data-plan-tools]', root).hidden = !(isPlan && planIds.size > 0);
    $('[data-results]', root).textContent = resultsText(visible);

    tabs.forEach((tab) => {
      const on = tab.dataset.tab === state.day;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', `tab-${state.day}`);

    $$<HTMLButtonElement>('[data-filter-type]', root).forEach((b) => b.setAttribute('aria-pressed', String(state.types.has(b.dataset.filterType!))));
    $('[data-filter-all]', root).setAttribute('aria-pressed', String(!state.types.size && !state.kids && !state.nolang && !state.ticket && !state.place));
    $$<HTMLButtonElement>('[data-filter-flag]', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filterFlag === 'kids' ? state.kids : state.nolang)));
    $$<HTMLButtonElement>('[data-filter-ticket]', root).forEach((b) => b.setAttribute('aria-pressed', String(state.ticket === b.dataset.filterTicket)));
    $<HTMLSelectElement>('[data-filter-place]', root).value = state.place;
    const active = state.types.size + (state.kids ? 1 : 0) + (state.nolang ? 1 : 0) + (state.ticket ? 1 : 0) + (state.place ? 1 : 0);
    $('[data-filter-count]', root).textContent = active ? `(${active})` : '';

    // Teraz / minione (live)
    if (currentMode() === 'live') {
      const t = now().getTime();
      cards.forEach((c) => {
        const s = Date.parse(c.dataset.start!), e = Date.parse(c.dataset.end!);
        c.classList.toggle('is-now', s <= t && e > t);
        c.classList.toggle('is-past', e <= t);
        $('[data-now-flag]', c).hidden = !(s <= t && e > t);
      });
    }

    if (flipState && Flip) Flip.from(flipState, { duration: 0.45, ease: 'power3.inOut', absolute: false, onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.35 }), onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.2 }) });
    writeUrl();
  };

  const renderPlan = () => {
    const ids = plan.get();
    $('[data-plan-count]', root).textContent = String(ids.length);
    $$<HTMLButtonElement>('[data-plan-toggle]', root).forEach((b) => {
      const on = ids.includes(b.dataset.planToggle!);
      b.setAttribute('aria-pressed', String(on));
      const label = $('[data-plan-label]', b);
      label.textContent = on ? label.dataset.added! : label.dataset.add!;
    });
    const slots = ids.map((id) => cardById.get(id)).filter(Boolean).map((c) => ({ id: c!.dataset.event!, start: c!.dataset.start!, end: c!.dataset.end! }));
    const conflicts = overlaps(slots);
    cards.forEach((c) => {
      const box = $('[data-conflict]', c);
      const other = conflicts.get(c.dataset.event!);
      box.hidden = !other;
      if (other) box.textContent = cfg.labels.conflict.replace('{x}', other.map((id) => cardById.get(id)?.dataset.title).join(', '));
    });
  };

  // ---------- Zdarzenia ----------
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => { state.day = tab.dataset.tab!; render(); });
    tab.addEventListener('keydown', (e) => {
      const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (e.key === 'Home' || e.key === 'End' || dir) {
        e.preventDefault();
        const next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + dir + tabs.length) % tabs.length;
        tabs[next].focus();
        tabs[next].click();
      }
    });
  });
  $('[data-filter-all]', root).addEventListener('click', () => {
    state.types.clear(); state.kids = false; state.nolang = false; state.ticket = ''; state.place = '';
    render(); track('filter_program', { filter: 'reset' });
  });
  $$('[data-filter-type]', root).forEach((b) => b.addEventListener('click', () => {
    const ty = b.dataset.filterType!;
    if (state.types.has(ty)) state.types.delete(ty); else state.types.add(ty);
    render(); track('filter_program', { filter: 'type', value: ty });
  }));
  $$('[data-filter-flag]', root).forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.filterFlag === 'kids') state.kids = !state.kids; else state.nolang = !state.nolang;
    render(); track('filter_program', { filter: b.dataset.filterFlag });
  }));
  $$('[data-filter-ticket]', root).forEach((b) => b.addEventListener('click', () => {
    const v = b.dataset.filterTicket as 'free' | 'paid';
    state.ticket = state.ticket === v ? '' : v;
    render(); track('filter_program', { filter: 'ticket', value: v });
  }));
  $<HTMLSelectElement>('[data-filter-place]', root).addEventListener('change', (e) => {
    state.place = (e.target as HTMLSelectElement).value;
    render(); track('filter_program', { filter: 'place', value: state.place });
  });

  root.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const planBtn = target.closest<HTMLElement>('[data-plan-toggle]');
    if (planBtn) {
      const added = togglePlan(planBtn.dataset.planToggle!);
      $('[data-plan-announce]', root).textContent = `${added ? cfg.labels.added : cfg.labels.removed}: ${cardById.get(planBtn.dataset.planToggle!)?.dataset.title}`;
      if (added) {
        track('add_to_plan', { id: planBtn.dataset.planToggle });
        if (!prefersReducedMotion()) gsap.fromTo(planBtn.querySelector('.on'), { scale: 0.2, rotate: -90 }, { scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(2.5)' });
      }
      if (state.day === 'plan') render();
      return;
    }
    const icsBtn = target.closest<HTMLElement>('[data-ics]');
    if (icsBtn) {
      const card = cardById.get(icsBtn.dataset.ics!)!;
      download(`ofca-${card.dataset.event}.ics`, buildIcs([toIcs(card)]));
      track('export_ics', { scope: 'event' });
      return;
    }
    if (target.closest('[data-ics-all]')) {
      const list = plan.get().map((id) => cardById.get(id)).filter(Boolean).map((c) => toIcs(c!));
      download('ofca-2026-moj-plan.ics', buildIcs(list));
      track('export_ics', { scope: 'plan', count: list.length });
    }
  });

  plan.subscribe(renderPlan);
  render(false);
  track('view_program');
}
