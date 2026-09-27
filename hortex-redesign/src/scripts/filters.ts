/**
 * Filtry list (produkty, przepisy). Stan w URL (?kategoria=…&czas=30), Flip przy zmianie,
 * "Pokaż więcej" zamiast paginacji. Bez JS lista pokazuje wszystko.
 *
 * Markup:
 *  [data-filter-root]
 *    [data-filter-group][data-param="czas"][data-attr="time"][data-mode="lte"] > button[data-value]
 *    select[data-filter-select][data-param][data-attr]
 *    input[data-filter-search]
 *    [data-filter-list] > [data-item data-*]
 *    [data-filter-count], [data-filter-empty], button[data-filter-more], button[data-filter-reset]
 */
import { flipUpdate } from './motion/listFlip';

type Group = { param: string; attr: string; mode: 'has' | 'lte'; get: () => string; set: (v: string) => void };

export function initFilters(root: HTMLElement) {
  const list = root.querySelector<HTMLElement>('[data-filter-list]')!;
  const items = Array.from(list.querySelectorAll<HTMLElement>('[data-item]'));
  const count = root.querySelector('[data-filter-count]');
  const empty = root.querySelector<HTMLElement>('[data-filter-empty]');
  const more = root.querySelector<HTMLButtonElement>('[data-filter-more]');
  const search = root.querySelector<HTMLInputElement>('[data-filter-search]');
  const pageSize = Number(root.dataset.pageSize || 0);
  const noun = (root.dataset.noun || 'wynik|wyniki|wyników').split('|');
  let limit = pageSize;

  const groups: Group[] = [];
  root.querySelectorAll<HTMLElement>('[data-filter-group]').forEach((g) => {
    const buttons = Array.from(g.querySelectorAll<HTMLButtonElement>('[data-value]'));
    let value = buttons.find((b) => b.getAttribute('aria-pressed') === 'true')?.dataset.value ?? '';
    const set = (v: string) => {
      value = v;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.value === v)));
      if (g.dataset.tint !== undefined) {
        const active = buttons.find((b) => b.dataset.value === v);
        root.style.setProperty('--section-tint', active?.dataset.tint || 'var(--c-sunk)');
      }
    };
    buttons.forEach((b) => b.addEventListener('click', () => { set(b.dataset.value === value && v0(b) ? '' : b.dataset.value!); limit = pageSize; apply(); }));
    const v0 = (b: HTMLButtonElement) => b.dataset.value !== '' && g.dataset.toggle !== undefined;
    groups.push({ param: g.dataset.param!, attr: g.dataset.attr!, mode: (g.dataset.mode as 'lte') || 'has', get: () => value, set });
  });
  root.querySelectorAll<HTMLSelectElement>('[data-filter-select]').forEach((s) => {
    s.addEventListener('change', () => { limit = pageSize; apply(); });
    groups.push({ param: s.dataset.param!, attr: s.dataset.attr!, mode: 'has', get: () => s.value, set: (v) => (s.value = v) });
  });

  const matches = (el: HTMLElement) => {
    for (const g of groups) {
      const v = g.get();
      if (!v) continue;
      const data = el.dataset[g.attr] ?? '';
      if (g.mode === 'lte' ? Number(data) > Number(v) : !data.split(' ').includes(v)) return false;
    }
    const q = search?.value.trim().toLowerCase();
    if (q && !(el.dataset.title ?? el.textContent ?? '').toLowerCase().includes(q)) return false;
    return true;
  };

  const plural = (n: number) => (n === 1 ? noun[0] : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? noun[1] : noun[2]);

  const syncUrl = () => {
    const url = new URL(location.href);
    groups.forEach((g) => (g.get() ? url.searchParams.set(g.param, g.get()) : url.searchParams.delete(g.param)));
    const q = search?.value.trim();
    q ? url.searchParams.set('q', q) : url.searchParams.delete('q');
    history.replaceState(null, '', url);
  };

  function apply(animate = true) {
    const run = () => {
      let shown = 0;
      let total = 0;
      items.forEach((el) => {
        const ok = matches(el);
        if (ok) total++;
        const visible = ok && (!limit || shown < limit);
        if (visible) shown++;
        el.hidden = !visible;
      });
      if (count) count.textContent = `${total} ${plural(total)}`;
      if (empty) empty.hidden = total > 0;
      if (more) more.hidden = !limit || total <= shown;
    };
    animate ? flipUpdate(items, run) : run();
    syncUrl();
  }

  // Stan startowy z URL
  const params = new URL(location.href).searchParams;
  groups.forEach((g) => { const v = params.get(g.param); if (v !== null) g.set(v); });
  if (search && params.get('q')) search.value = params.get('q')!;

  let debounce: number | undefined;
  search?.addEventListener('input', () => { clearTimeout(debounce); debounce = window.setTimeout(() => { limit = pageSize; apply(); }, 180); });
  more?.addEventListener('click', () => {
    const firstHidden = items.find((el) => el.hidden && matches(el));
    limit += pageSize;
    apply();
    firstHidden?.querySelector<HTMLElement>('a')?.focus({ preventScroll: false });
  });
  root.querySelectorAll('[data-filter-reset]').forEach((b) => b.addEventListener('click', () => {
    groups.forEach((g) => g.set(''));
    if (search) search.value = '';
    limit = pageSize;
    apply();
  }));

  apply(false);
}

document.querySelectorAll<HTMLElement>('[data-filter-root]').forEach(initFilters);
