import { gsap, prefersReducedMotion, loadDraggable } from './gsap';
import { initMotion } from './motion';
import { cart, cartCount, hydrateCart, removeFromCart, setQty, MAX_QTY } from './cart';
import { productThumb } from './product-thumb';
import { now } from './clock';
import { readJson, writeJson } from './storage';
import { CONSENT_KEY, track, type Consent } from './analytics';

const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));

interface CatalogItem { slug: string; name: string; price: number; href: string; kind: string; bg: string; fg: string }
interface CatalogLabels { lang: 'pl' | 'en'; remove: string; qty: string; decrease: string; increase: string; size: string }

export function formatMoney(value: number, lang: 'pl' | 'en') {
  return lang === 'en' ? `PLN ${value.toFixed(2)}` : `${value.toFixed(2).replace('.', ',')} zł`;
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/* ---------- Koszyk (drawer, M11) ---------- */
function initCart() {
  hydrateCart();
  const dialog = $<HTMLDialogElement>('[data-cart-drawer]');
  const data = dialog?.querySelector('[data-catalog]');
  if (!dialog || !data) return;
  const { catalog, labels } = JSON.parse(data.textContent || '{}') as { catalog: CatalogItem[]; labels: CatalogLabels };
  const bySlug = new Map(catalog.map((c) => [c.slug, c]));
  const sheet = $('[data-cart-sheet]', dialog)!;
  const lines = $('[data-cart-lines]', dialog)!;
  const foot = $('[data-cart-foot]', dialog)!;
  const total = $('[data-cart-total]', dialog)!;
  const counts = $$('[data-cart-count]');
  const srCounts = $$('[data-cart-count-sr]');
  const isMobile = () => window.matchMedia('(max-width: 767px)').matches;

  const render = () => {
    const items = cart.get().filter((i) => bySlug.has(i.slug));
    $$('[data-cart-empty]', dialog).forEach((el) => (el.hidden = items.length > 0));
    foot.hidden = items.length === 0;
    lines.innerHTML = items.map((i) => {
      const p = bySlug.get(i.slug)!;
      return `<li class="line" data-sku="${esc(i.sku)}">
        ${productThumb(p.kind, p.bg, p.fg)}
        <div>
          <a class="line-name" href="${p.href}">${esc(p.name)}</a>
          ${i.size ? `<div class="line-meta">${labels.size}: ${esc(i.size)}</div>` : ''}
          <div class="line-row">
            <div class="qty" role="group" aria-label="${labels.qty}: ${esc(p.name)}">
              <button type="button" data-dec aria-label="${labels.decrease}"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16" stroke="currentColor" stroke-width="3"/></svg></button>
              <output aria-live="polite">${i.qty}</output>
              <button type="button" data-inc aria-label="${labels.increase}" ${i.qty >= MAX_QTY ? 'disabled' : ''}><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16M4 12h16" stroke="currentColor" stroke-width="3"/></svg></button>
            </div>
            <span class="line-price">${formatMoney(p.price * i.qty, labels.lang)}</span>
          </div>
          <button type="button" class="remove" data-remove>${labels.remove}<span class="visually-hidden">: ${esc(p.name)}</span></button>
        </div>
      </li>`;
    }).join('');
    total.textContent = formatMoney(items.reduce((s, i) => s + bySlug.get(i.slug)!.price * i.qty, 0), labels.lang);
  };

  const renderCount = (n: number) => {
    counts.forEach((el) => { el.textContent = String(n); el.hidden = n === 0; });
    srCounts.forEach((el) => (el.textContent = n ? `${n}` : ''));
  };

  cart.subscribe(render);
  cartCount.subscribe(renderCount);

  lines.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const li = target.closest<HTMLElement>('[data-sku]');
    if (!li) return;
    const sku = li.dataset.sku!;
    const item = cart.get().find((i) => i.sku === sku);
    if (!item) return;
    const focusSel = target.closest('[data-inc]') ? '[data-inc]' : target.closest('[data-dec]') ? '[data-dec]' : null;
    if (target.closest('[data-inc]')) setQty(sku, item.qty + 1);
    else if (target.closest('[data-dec]')) setQty(sku, item.qty - 1);
    else if (target.closest('[data-remove]')) removeFromCart(sku);
    // Zachowujemy fokus po przerenderowaniu
    const again = focusSel && lines.querySelector<HTMLElement>(`[data-sku="${CSS.escape(sku)}"] ${focusSel}`);
    (again || $('[data-cart-close]', dialog))?.focus();
  });

  let closing = false;
  const open = () => {
    if (dialog.open) return;
    dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
    if (prefersReducedMotion()) gsap.fromTo(sheet, { opacity: 0 }, { opacity: 1, duration: 0.15 });
    else gsap.fromTo(sheet, isMobile() ? { yPercent: 100, xPercent: 0 } : { xPercent: 100, yPercent: 0 }, { xPercent: 0, yPercent: 0, duration: 0.55, ease: 'power4.out' });
  };
  const close = () => {
    if (!dialog.open || closing) return;
    closing = true;
    const done = () => { dialog.close(); gsap.set(sheet, { clearProps: 'transform,opacity' }); document.documentElement.style.overflow = ''; closing = false; };
    if (prefersReducedMotion()) gsap.to(sheet, { opacity: 0, duration: 0.15, onComplete: done });
    else gsap.to(sheet, { ...(isMobile() ? { yPercent: 100 } : { xPercent: 100 }), duration: 0.35, ease: 'power2.in', onComplete: done });
  };

  $$('[data-cart-open]').forEach((b) => b.addEventListener('click', open));
  $$('[data-cart-close]', dialog).forEach((b) => b.addEventListener('click', close));
  dialog.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
  document.addEventListener('ofca:cart-open', open);

  // Przeciąganie w dół zamyka (mobile)
  const handle = $('[data-cart-handle]', dialog);
  if (handle) {
    loadDraggable().then(({ Draggable }) => {
      Draggable.create(sheet, {
        type: 'y', trigger: handle, bounds: { minY: 0, maxY: window.innerHeight }, inertia: false,
        onDragEnd() { if (this.y > 110) close(); else gsap.to(sheet, { y: 0, duration: 0.3, ease: 'back.out(1.6)' }); },
      });
    });
  }
}

/* ---------- Menu mobilne ---------- */
function initMenu() {
  const menu = $<HTMLDialogElement>('[data-menu]');
  if (!menu) return;
  const items = $$('[data-menu-item]', menu);
  $('[data-menu-open]')?.addEventListener('click', () => {
    menu.showModal();
    if (!prefersReducedMotion()) {
      gsap.fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.5, ease: 'power4.out' });
      gsap.from(items, { y: 40, opacity: 0, duration: 0.5, stagger: 0.035, delay: 0.1, ease: 'back.out(1.6)' });
    }
  });
  $('[data-menu-close]', menu)?.addEventListener('click', () => menu.close());
  menu.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('a')) menu.close(); });
}

/* ---------- Komunikaty ---------- */
function initAlerts() {
  const DISMISSED = 'ofca-alerts-dismissed';
  const dismissed = new Set(readJson<string[]>(DISMISSED, []));
  const t = now().getTime();
  $$('[data-alert]').forEach((el) => {
    if (el.dataset.forceVisible) return;
    const active = t >= Date.parse(el.dataset.from!) && t <= Date.parse(el.dataset.to!);
    el.hidden = !active || dismissed.has(el.dataset.alert!);
  });
  $$('[data-alert-close]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const id = btn.dataset.alertClose!;
      dismissed.add(id);
      writeJson(DISMISSED, [...dismissed]);
      $$(`[data-alert="${CSS.escape(id)}"]`).forEach((el) => (el.hidden = true));
      $<HTMLElement>('#main')?.focus();
    }),
  );
}

/* ---------- Cookies ---------- */
function initCookies() {
  const box = $('[data-cookie]');
  if (!box) return;
  const form = $<HTMLFormElement>('[data-cookie-form]', box)!;
  const toggle = $('[data-cookie-toggle]', box)!;
  const save = (analytics: boolean) => {
    writeJson(CONSENT_KEY, { necessary: true, analytics, decided: true } satisfies Consent);
    box.hidden = true;
  };
  const consent = readJson<Consent | null>(CONSENT_KEY, null);
  box.hidden = !!consent?.decided;
  $('[data-cookie-all]', box)!.addEventListener('click', () => save(true));
  $('[data-cookie-necessary]', box)!.addEventListener('click', () => save(false));
  toggle.addEventListener('click', () => {
    form.hidden = !form.hidden;
    toggle.setAttribute('aria-expanded', String(!form.hidden));
    const current = readJson<Consent | null>(CONSENT_KEY, null);
    (form.elements.namedItem('analytics') as HTMLInputElement).checked = !!current?.analytics;
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    save((form.elements.namedItem('analytics') as HTMLInputElement).checked);
  });
  $$('[data-cookie-settings]').forEach((b) => b.addEventListener('click', () => {
    box.hidden = false;
    form.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    (form.elements.namedItem('analytics') as HTMLInputElement).focus();
  }));
}

/* ---------- Podgląd trybów (dev/preview) ---------- */
function initPreview() {
  const el = $('[data-preview]');
  if (!el || !window.__OFCA) return;
  $('[data-preview-mode]', el)!.textContent = window.__OFCA.mode + (window.__OFCA.preview ? ' (podgląd)' : '');
  $('[data-preview-now]', el)!.textContent = `Symulowany czas: ${new Date(window.__OFCA.now).toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}`;
}

export function initLayout() {
  initCart();
  initMenu();
  initAlerts();
  initCookies();
  initPreview();
  initMotion();
  $$('[data-lang-switch]').forEach((a) => a.addEventListener('click', () => track('lang_switch', { to: a.getAttribute('hreflang') })));
}
