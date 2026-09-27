/* Interakcje wspólne dla całej strony. Bez zależności, działa bez GSAP. */

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));

/* ---------- Sticky header chowany przy przewijaniu w dół ---------- */
function initHeader() {
  const header = $('[data-header]');
  if (!header) return;
  let lastY = window.scrollY;
  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    const menuOpen = !!$('.nav.is-open') || !!$('[data-mega]:not([hidden])');
    header.classList.toggle('is-scrolled', y > 8);
    header.classList.toggle('is-hidden', !menuOpen && y > 240 && y > lastY + 2);
    if (y < lastY - 2 || y < 240) header.classList.remove('is-hidden');
    lastY = y;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
}

/* ---------- Mega menu ---------- */
function initMega() {
  const toggles = $$<HTMLButtonElement>('[data-mega-toggle]');
  const desktop = window.matchMedia('(min-width: 1025px) and (hover: hover)');
  const close = (btn: HTMLButtonElement, focus = false) => {
    btn.setAttribute('aria-expanded', 'false');
    const panel = document.getElementById(btn.getAttribute('aria-controls')!);
    if (panel) panel.hidden = true;
    if (focus) btn.focus();
  };
  const open = (btn: HTMLButtonElement) => {
    toggles.forEach((b) => b !== btn && close(b));
    btn.setAttribute('aria-expanded', 'true');
    const panel = document.getElementById(btn.getAttribute('aria-controls')!);
    if (panel) panel.hidden = false;
  };
  toggles.forEach((btn) => {
    const item = btn.closest('.nav__item')!;
    let timer: number | undefined;
    btn.addEventListener('click', () => (btn.getAttribute('aria-expanded') === 'true' ? close(btn) : open(btn)));
    item.addEventListener('pointerenter', (e) => {
      if (!desktop.matches || (e as PointerEvent).pointerType !== 'mouse') return;
      clearTimeout(timer);
      timer = window.setTimeout(() => open(btn), 90);
    });
    item.addEventListener('pointerleave', (e) => {
      if (!desktop.matches || (e as PointerEvent).pointerType !== 'mouse') return;
      clearTimeout(timer);
      timer = window.setTimeout(() => close(btn), 180);
    });
    item.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') close(btn, true);
    });
    item.addEventListener('focusout', (e) => {
      if (desktop.matches && !item.contains((e as FocusEvent).relatedTarget as Node)) close(btn);
    });
  });
  document.addEventListener('click', (e) => {
    if (!(e.target as Element).closest('.nav__item.has-mega')) toggles.forEach((b) => desktop.matches && close(b));
  });
}

/* ---------- Menu mobilne ---------- */
function initMobileMenu() {
  const btn = $<HTMLButtonElement>('[data-menu-toggle]');
  const nav = $('[data-nav]');
  if (!btn || !nav) return;
  const header = $('[data-header]');
  const set = (open: boolean) => {
    // Panel zaczyna się pod headerem (górny pasek może być jeszcze widoczny)
    if (open && header) nav.style.top = `${Math.max(0, header.getBoundingClientRect().bottom)}px`;
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Zamknij menu' : 'Menu');
    nav.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { set(false); btn.focus(); }
  });
  window.matchMedia('(min-width: 1025px)').addEventListener('change', (e) => e.matches && set(false));
}

/* ---------- Wyszukiwarka (statyczny indeks) ---------- */
type Hit = { t: string; u: string; i: string; m: string; k: string };
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l');

function initSearch() {
  const dialog = $<HTMLDialogElement>('[data-search]');
  if (!dialog) return;
  const input = $<HTMLInputElement>('[data-search-input]', dialog)!;
  const list = $('[data-search-results]', dialog)!;
  let index: Record<string, Hit[]> = { produkty: [], przepisy: [], porady: [] };
  let loaded: Promise<void> | null = null;
  const load = () => (loaded ??= fetch('/search.json').then((r) => r.json()).then((d) => { index = d; }).catch(() => {}));
  let scope = 'produkty';

  const highlight = (text: string, q: string) => {
    if (!q) return text;
    const stem = q.length >= 5 ? q.slice(0, -1) : q;
    const at = norm(text).indexOf(norm(stem));
    if (at < 0) return text;
    return `${text.slice(0, at)}<mark>${text.slice(at, at + stem.length)}</mark>${text.slice(at + stem.length)}`;
  };
  const render = () => {
    const q = input.value.trim();
    // Prosty "stemming" dla odmiany: kurki → kurk (trafia w kurkami, kurkowym)
    const nq = norm(q.length >= 5 ? q.slice(0, -1) : q);
    const results: Record<string, Hit[]> = {};
    for (const key of Object.keys(index)) results[key] = index[key].filter((h) => !nq || norm(h.t + ' ' + h.k).includes(nq));
    $$('[data-count]', dialog).forEach((el) => (el.textContent = q ? String(results[el.dataset.count!].length) : ''));
    const hits = results[scope].slice(0, 12);
    list.innerHTML = hits.length
      ? hits.map((h) => `<li><a href="${h.u}"><img src="${h.i}" alt="" width="56" height="56" loading="lazy"><span>${highlight(h.t, q)}</span><span class="m">${h.m}</span></a></li>`).join('')
      : `<li class="empty">Brak wyników dla „${q.replace(/[<>&]/g, '')}”. Sprawdź inną zakładkę albo wpisz inną nazwę.</li>`;
  };
  $$<HTMLButtonElement>('[data-scope]', dialog).forEach((tab) =>
    tab.addEventListener('click', () => {
      scope = tab.dataset.scope!;
      $$<HTMLButtonElement>('[data-scope]', dialog).forEach((t) => {
        t.setAttribute('aria-selected', String(t === tab));
        t.setAttribute('aria-pressed', String(t === tab));
      });
      render();
    }),
  );
  input.addEventListener('input', render);
  const open = () => {
    dialog.showModal();
    input.focus();
    load().then(render);
  };
  $$('[data-search-open]').forEach((b) => b.addEventListener('click', open));
  $$('[data-search-close]', dialog).forEach((b) => b.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  document.addEventListener('keydown', (e) => {
    const tag = (e.target as HTMLElement).tagName;
    if (e.key === '/' && !dialog.open && !/INPUT|TEXTAREA|SELECT/.test(tag)) { e.preventDefault(); open(); }
  });
}

/* ---------- Lista zapytania B2B (localStorage, bez wysyłki) ---------- */
const KEY = 'hortex-inquiry';
export function getInquiry(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function setInquiry(list: string[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* prywatne okno: lista działa do przeładowania */ }
  memory = list;
  document.dispatchEvent(new CustomEvent('inquiry:change', { detail: list }));
}
let memory: string[] = getInquiry();

function initInquiry() {
  const sync = () => {
    const list = memory;
    $$('[data-inquiry-count]').forEach((el) => (el.textContent = String(list.length)));
    $$('[data-inquiry-link]').forEach((el) => (el.hidden = list.length === 0));
    $$<HTMLButtonElement>('[data-inquiry-add]').forEach((btn) => {
      const on = list.includes(btn.dataset.inquiryAdd!);
      btn.setAttribute('aria-pressed', String(on));
      const label = btn.querySelector('[data-label]');
      if (label) label.textContent = on ? 'W zapytaniu' : 'Dodaj do zapytania';
    });
  };
  document.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>('[data-inquiry-add]');
    if (btn) {
      const slug = btn.dataset.inquiryAdd!;
      const list = memory.includes(slug) ? memory.filter((s) => s !== slug) : [...memory, slug];
      setInquiry(list);
      btn.dispatchEvent(new CustomEvent('inquiry:toggled', { bubbles: true, detail: { on: list.includes(slug) } }));
    }
    const rm = (e.target as Element).closest<HTMLButtonElement>('[data-inquiry-remove]');
    if (rm) setInquiry(memory.filter((s) => s !== rm.dataset.inquiryRemove));
  });
  document.addEventListener('inquiry:change', sync);
  (window as any).__inquiry = { get: () => memory, set: setInquiry };
  sync();
}

/* ---------- Zakładki (ARIA tabs) ---------- */
function initTabs() {
  $$('[data-tabs]').forEach((root) => {
    const tabs = $$<HTMLButtonElement>('[role="tab"]', root);
    const select = (tab: HTMLButtonElement, focus = false) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls')!);
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
        if (e.key === 'Home') { e.preventDefault(); select(tabs[0], true); }
        if (e.key === 'End') { e.preventDefault(); select(tabs[tabs.length - 1], true); }
      });
    });
  });
}

/* ---------- Formularze demo: walidacja + stan sukcesu, bez wysyłki ---------- */
export function validateForm(form: HTMLFormElement) {
  let firstInvalid: HTMLElement | null = null;
  $$<HTMLInputElement>('input, select, textarea', form).forEach((el) => {
    const field = el.closest('.field');
    if (!field || el.type === 'hidden') return;
    const ok = el.checkValidity();
    field.toggleAttribute('data-invalid', !ok);
    el.setAttribute('aria-invalid', String(!ok));
    const err = field.querySelector('.error');
    if (err && !err.id) err.id = `${el.id || el.name}-error`;
    if (err) el.setAttribute('aria-describedby', err.id);
    if (!ok && !firstInvalid) firstInvalid = el;
  });
  if (firstInvalid) (firstInvalid as HTMLElement).focus();
  return !firstInvalid;
}

function initDemoForms() {
  $$<HTMLFormElement>('[data-demo-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(form)) return;
      const success = $('[data-success]', form) ?? $(`#${form.dataset.successTarget}`);
      form.dispatchEvent(new CustomEvent('demo:success', { bubbles: true }));
      if (form.dataset.replace !== undefined && success) {
        // Pola formularza znikają, zostaje stan sukcesu
        Array.from(form.children).forEach((el) => { if (el !== success) (el as HTMLElement).hidden = true; });
        success.hidden = false;
        success.focus?.();
      } else if (success) {
        success.hidden = false;
        form.reset();
      }
    });
    form.addEventListener('input', (e) => {
      const el = e.target as HTMLInputElement;
      const field = el.closest('.field');
      if (field?.hasAttribute('data-invalid') && el.checkValidity()) {
        field.removeAttribute('data-invalid');
        el.setAttribute('aria-invalid', 'false');
      }
    });
  });
}

/* ---------- Drukuj / udostępnij ---------- */
function initShare() {
  $$('[data-print]').forEach((b) => b.addEventListener('click', () => window.print()));
  $$<HTMLButtonElement>('[data-share]').forEach((b) =>
    b.addEventListener('click', async () => {
      const data = { title: document.title, url: location.href };
      try {
        if (navigator.share) await navigator.share(data);
        else {
          await navigator.clipboard.writeText(location.href);
          const label = b.querySelector('[data-label]');
          if (label) { const prev = label.textContent; label.textContent = 'Skopiowano link'; setTimeout(() => (label.textContent = prev), 2000); }
        }
      } catch { /* anulowano */ }
    }),
  );
}

initHeader();
initMega();
initMobileMenu();
initSearch();
initInquiry();
initTabs();
initDemoForms();
initShare();
