/* Climoo X5 · wspólny skrypt dla wszystkich podstron */
(() => {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const group = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const zl = n => (n < 0 ? '-' : '') + group(Math.abs(n)) + ' zł';
const zl2 = n => { const [a, b] = Math.abs(n).toFixed(2).split('.'); return group(+a) + ',' + b + ' zł'; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PAGE = document.body.dataset.page;

/* =====================================================
   STATE · koszyk współdzielony między podstronami
   ===================================================== */
const KEY = 'climoo.v1';
const storageOK = (() => { try { localStorage.setItem('__c', '1'); localStorage.removeItem('__c'); return true; } catch (e) { return false; } })();
const S = (() => {
  let st = null;
  try {
    const u = new URL(location.href), p = u.searchParams.get('s');
    if (p) {
      st = JSON.parse(decodeURIComponent(escape(atob(p))));
      u.searchParams.delete('s');
      history.replaceState(null, '', u.pathname.split('/').pop() + u.search + u.hash);
    }
  } catch (e) {}
  if (!st && storageOK) { try { st = JSON.parse(localStorage.getItem(KEY)); } catch (e) {} }
  return Object.assign({ cart: [], promo: null, order: null }, st || {});
})();
function save() { if (storageOK) { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} } paintBagCount(); }
// Gdy localStorage jest niedostępny (np. podgląd w piaskownicy), przenosimy stan w adresie URL.
function withState(href) {
  if (storageOK) return href;
  const enc = btoa(unescape(encodeURIComponent(JSON.stringify(S))));
  const [p, h] = href.split('#');
  return p + (p.includes('?') ? '&' : '?') + 's=' + encodeURIComponent(enc) + (h ? '#' + h : '');
}
function go(href) { location.href = withState(href); }
document.addEventListener('click', e => {
  if (storageOK) return;
  const a = e.target.closest('a[href]'); if (!a) return;
  const h = a.getAttribute('href');
  if (/^[\w-]+\.html/.test(h)) { e.preventDefault(); go(h); }
});

/* =====================================================
   DATA
   ===================================================== */
const MODELS = {
  '25': { name: 'X5 25', kw: '2,5 kW', heat: '3,2 kW', area: 30, price: 5499 },
  '35': { name: 'X5 35', kw: '3,5 kW', heat: '4,0 kW', area: 45, price: 6299 },
  '50': { name: 'X5 50', kw: '5,0 kW', heat: '5,8 kW', area: 65, price: 7499 }
};
const FINISHES = { white: 'Arktyczna biel', graphite: 'Grafit', sage: 'Szałwia', sand: 'Piasek' };
const INSTALLS = {
  none: { name: 'Bez montażu', desc: 'Mam własnego instalatora z uprawnieniami F-gaz.', price: 0 },
  standard: { name: 'Montaż Standard', desc: 'Do 3 m instalacji, uruchomienie i konfiguracja.', price: 899, tag: 'Polecany' },
  premium: { name: 'Montaż Premium', desc: 'Instalacja podtynkowa do 5 m i maskownica w kolorze X5.', price: 1499 }
};
const CARES = {
  none: { name: 'Bez Climoo Care+', desc: 'Standardowa gwarancja 7 lat.', price: 0 },
  care: { name: 'Climoo Care+ na 5 lat', desc: 'Przegląd co roku, filtry w cenie, priorytetowy serwis w 24 h.', price: 699 }
};
const ICONS = {
  dial: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 4v2"/></svg>',
  sense: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="3" width="12" height="18" rx="6"/><path d="M12 14v-4"/><circle cx="12" cy="16" r="1.5"/></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 5v14M12 5v14M16 5v14"/></svg>',
  cover: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 10 12 4l9 6"/><rect x="5" y="10" width="14" height="10" rx="1"/><circle cx="12" cy="15" r="3"/></svg>'
};
const ACCS = {
  dial: { name: 'Pilot Climoo Dial', desc: 'Aluminiowe pokrętło z ekranem e-ink.', price: 249, icon: 'dial' },
  sense: { name: 'Czujnik Climoo Sense', desc: 'Mierzy temperaturę tam, gdzie siedzisz.', price: 199, icon: 'sense' },
  filter: { name: 'Zestaw filtrów na rok', desc: 'HEPA H13 i filtr węglowy.', price: 149, icon: 'filter' },
  cover: { name: 'Osłona jednostki zewnętrznej', desc: 'Stal lakierowana proszkowo, chroni przed śniegiem.', price: 399, icon: 'cover' }
};
const PROMOS = { LATO26: 0.05, CLIMOO10: 0.10 };
const RATY = 20;
const recommend = a => a <= 30 ? '25' : a <= 45 ? '35' : '50';

const unitPrice = l => MODELS[l.model].price + INSTALLS[l.install].price + CARES[l.care].price;
const linePrice = l => (l.kind === 'unit' ? unitPrice(l) : ACCS[l.id].price) * l.qty;
function totals() {
  const sub = S.cart.reduce((s, l) => s + linePrice(l), 0);
  const disc = S.promo && PROMOS[S.promo] ? Math.round(sub * PROMOS[S.promo]) : 0;
  const total = sub - disc;
  return { sub, disc, total, vat: Math.round(total - total / 1.23), count: S.cart.reduce((s, l) => s + l.qty, 0) };
}
const hasInstall = () => S.cart.some(l => l.kind === 'unit' && l.install !== 'none');
const DAYN = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'];
const DAYL = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
const MONN = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
const fmtDate = iso => { const d = new Date(iso + 'T12:00:00'); return `${DAYL[d.getDay()]}, ${d.getDate()} ${MONN[d.getMonth()]}`; };
function addDays(n) { const d = new Date(); d.setDate(d.getDate() + n); if (d.getDay() === 0) d.setDate(d.getDate() + 1); return d; }
const shortDate = d => `${DAYN[d.getDay()].toLowerCase()}. ${d.getDate()} ${MONN[d.getMonth()]}`;

/* =====================================================
   SHELL · nawigacja i stopka
   ===================================================== */
const base = PAGE === 'home' ? '' : 'index.html';
const LOGO_SYGNET = '<path d="M24.18 0L29.14 0.62L28.21 12.4H25.11L24.18 0Z"/><path d="M37.8423 2.33176L41.8277 5.3487L35.1323 15.0855L32.4477 13.5355L37.8423 2.33176Z"/><path d="M42.1377 48.5082L37.5323 50.4513L32.4477 39.7845L35.1323 38.2345L42.1377 48.5082Z"/><path d="M29.14 53.32L24.18 52.7L25.11 40.92H28.21L29.14 53.32Z"/><path d="M15.4777 50.9882L11.4923 47.9713L18.1877 38.2345L20.8723 39.7845L15.4777 50.9882Z"/><path d="M4.81176 42.1377L2.8687 37.5323L13.5355 32.4477L15.0855 35.1323L4.81176 42.1377Z"/><path d="M0 29.14L0.62 24.18L12.4 25.11V28.21L0 29.14Z"/><path d="M2.33176 15.4777L5.3487 11.4923L15.0855 18.1877L13.5355 20.8723L2.33176 15.4777Z"/><path d="M11.1823 4.81176L15.7877 2.8687L20.8723 13.5355L18.1877 15.0855L11.1823 4.81176Z"/>';
const LOGO_WORD = '<path d="M61.3789 41.8965C67.7181 41.8965 72.2751 37.7704 72.5684 32.0824H66.0938C65.6652 34.67 64.1537 36.3484 61.4691 36.3484C58.1303 36.3484 56.1225 33.5277 56.1225 29.0519C56.1225 24.5528 58.1077 21.7088 61.4691 21.7088C64.1311 21.7088 65.8005 23.4105 66.1389 25.9282H72.5684C72.1398 20.1935 67.6504 16.1607 61.3789 16.1607C54.2275 16.1607 49.4223 21.429 49.4223 29.0519C49.4223 36.6748 54.2049 41.8965 61.3789 41.8965Z"/><path d="M82.8167 8.01776H75.7268V41.3636H82.8167V8.01776Z"/><path d="M87.4732 41.3636H94.0798V16.8148H87.4732V41.3636ZM90.7653 13.723C92.9376 13.723 94.5277 12.1654 94.5277 10.0732C94.5277 7.981 92.9376 6.42346 90.7653 6.42346C88.5929 6.42346 87.0029 7.981 87.0029 10.0732C87.0029 12.1654 88.5929 13.723 90.7653 13.723Z"/><path d="M98.3916 41.3636H105.057V26.7548C105.057 23.5658 106.955 21.7836 109.328 21.7836C111.655 21.7836 113.282 23.4485 113.282 26.0279V41.3636H119.699V26.45C119.699 23.683 121.303 21.7836 123.879 21.7836C126.161 21.7836 127.923 23.2375 127.923 26.2155V41.3636H134.566V24.9493C134.566 19.2746 131.154 16.0855 126.568 16.0855C123.111 16.0855 120.173 17.8911 118.93 20.916C117.936 17.8911 115.248 16.0855 112.039 16.0855C109.011 16.0855 106.232 17.7035 104.809 21.0567V16.6014H98.3916V41.3636Z"/><path d="M149.917 41.8965C157.27 41.8965 162.218 36.7645 162.218 29.0432C162.218 21.3219 157.27 16.1432 149.917 16.1432C142.587 16.1432 137.64 21.3219 137.64 29.0432C137.64 36.7645 142.587 41.8965 149.917 41.8965ZM149.917 36.3213C146.642 36.3213 144.443 33.6154 144.443 29.0432C144.443 24.4477 146.665 21.7184 149.917 21.7184C153.193 21.7184 155.415 24.4477 155.415 29.0432C155.415 33.6154 153.216 36.3213 149.917 36.3213Z"/><path d="M176.597 41.8647C183.95 41.8647 188.898 36.7391 188.898 29.0273C188.898 21.3155 183.95 16.1432 176.597 16.1432C169.267 16.1432 164.319 21.3155 164.319 29.0273C164.319 36.7391 169.267 41.8647 176.597 41.8647ZM176.597 36.2964C173.321 36.2964 171.122 33.5938 171.122 29.0273C171.122 24.4375 173.344 21.7115 176.597 21.7115C179.873 21.7115 182.095 24.4375 182.095 29.0273C182.095 33.5938 179.896 36.2964 176.597 36.2964Z"/>';
const LOGO = `<a class="logo" href="index.html" aria-label="Climoo, strona główna"><svg viewBox="0 0 189 54" fill="currentColor" aria-hidden="true">${LOGO_SYGNET}${LOGO_WORD}</svg></a>`;
const LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="15" height="15"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
const NAV_LINKS = [['przeglad', 'Przegląd', 2], ['tryby', 'Tryby pracy'], ['miejsca', 'Zastosowania'], ['porownanie', 'Porównaj'], ['specyfikacja', 'Dane techniczne'], ['faq', 'Wsparcie', 2]];
const BAG_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z"/><path d="M8.5 8V6.5a3.5 3.5 0 0 1 7 0V8"/></svg>';
const NAV = `<header class="gnav" id="siteNav"><div class="wide">${LOGO}
  <nav aria-label="Sekcje strony"><ul class="nav-links" id="navLinks">
    ${NAV_LINKS.map(([id, label, pri]) => `<li${pri ? ` data-pri="${pri}"` : ''}><a href="${base}#${id}" data-sec="${id}">${label}</a></li>`).join('')}
    <li class="nav-ind" aria-hidden="true"></li></ul></nav>
  <div class="nav-act">
    <a class="bag" href="koszyk.html" aria-label="Koszyk">${BAG_ICON}<span class="bag-count" id="bagCount">0</span></a>
    <a class="btn nav-kup" href="kup.html">Kup</a>
    <button class="menu-btn" type="button" id="menuBtn" aria-label="Otwórz menu" aria-expanded="false" aria-controls="navSheet"><span></span></button>
  </div>
  <div class="nav-progress" id="navProgress" aria-hidden="true"></div>
</div></header>
<div class="nav-sheet" id="navSheet" aria-label="Menu">
  <ul>${NAV_LINKS.map(([id, label]) => `<li><a href="${base}#${id}">${label}</a></li>`).join('')}</ul>
  <div class="sheet-foot"><a href="kup.html">Konfigurator</a><a href="koszyk.html">Koszyk</a><span>Darmowa dostawa · Montaż w 72 godziny</span></div>
</div>`;
const NAV_MIN = `<header class="gnav gnav-min"><div class="wide">${LOGO}<span class="secure">${LOCK} Bezpieczne zamówienie</span><a class="back" href="koszyk.html">Wróć do koszyka</a></div></header>`;
const FOOTER = `<footer><div class="wide">
  <div class="notes">
    <p>* Raty 0% na 20 miesięcy, RRSO 0%. Przykład dla X5 25: cena 5 499 zł, 20 rat po 274,95 zł. Oferta podlega ocenie zdolności kredytowej.</p>
    <p>² Pomiar w pomieszczeniu 25 m² o wysokości 2,6 m z modelem X5 35 w trybie Turbo Chill, temperatura zewnętrzna 32°C.</p>
    <p>³ Skuteczność filtra HEPA H13 dla cząstek 0,3 µm zgodnie z normą EN 1822. Lampa UV-C działa wewnątrz obudowy.</p>
    <p>⁴ W porównaniu z klimatyzatorem klasy A++ (SEER 6,1, SCOP 4,0) przy identycznym profilu użytkowania.</p>
    <p>Climoo jest marką fikcyjną stworzoną na potrzeby projektu koncepcyjnego. Produkt, parametry, ceny i proces zakupu są przykładowe. Żadne płatności nie są realizowane.</p>
  </div>
  <div class="cols">
    <div><h5>Produkty</h5><ul><li><a href="${base}#przeglad">Climoo X5</a></li><li><a href="${base}#porownanie">Porównanie modeli</a></li><li><a href="kup.html">Akcesoria</a></li></ul></div>
    <div><h5>Zakupy</h5><ul><li><a href="kup.html">Konfigurator</a></li><li><a href="koszyk.html">Koszyk</a></li><li><a href="${base}#faq">Raty 0%</a></li></ul></div>
    <div><h5>Wsparcie</h5><ul><li><a href="${base}#montaz">Montaż</a></li><li><a href="${base}#faq">Zwroty</a></li><li><a href="${base}#faq">Gwarancja</a></li></ul></div>
    <div><h5>Climoo</h5><ul><li><a href="${base}#chip">Technologia</a></li><li><a href="${base}#miejsca">Dla firm</a></li><li><a href="${base}#faq">Kontakt</a></li></ul></div>
  </div>
  <div class="legal"><span>Copyright © 2026 Climoo. Projekt koncepcyjny.</span><span>Polska</span></div>
</div></footer>`;
{ const g = $('#gnav'); if (g) g.outerHTML = PAGE === 'checkout' ? NAV_MIN : NAV; const f = $('#footer'); if (f) f.outerHTML = FOOTER; }
/* Pasek nawigacji: stan po przewinięciu i menu mobilne */
const siteNav = $('#siteNav');
if (siteNav) {
  const btn = $('#menuBtn'), sheet = $('#navSheet');
  const setMenu = open => {
    siteNav.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', open); btn.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
    document.documentElement.style.overflow = open ? 'hidden' : '';
  };
  btn.onclick = () => setMenu(!siteNav.classList.contains('menu-open'));
  $$('a', sheet).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && siteNav.classList.contains('menu-open')) { setMenu(false); btn.focus(); } });
  addEventListener('resize', () => { if (innerWidth > 834) setMenu(false); });
  const onNavScroll = () => siteNav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onNavScroll, { passive: true }); onNavScroll();
}
if (!$('#toast')) document.body.insertAdjacentHTML('beforeend', '<div class="toast" id="toast" role="status" aria-live="polite"></div>');

function paintBagCount() {
  const el = $('#bagCount'); if (!el) return;
  const n = totals().count; el.textContent = n; el.classList.toggle('show', n > 0);
}
function toast(msg, action) {
  const t = $('#toast');
  t.innerHTML = esc(msg) + (action ? ` <button type="button">${esc(action.label)}</button>` : '');
  if (action) $('button', t).onclick = () => { action.fn(); t.classList.remove('show'); };
  t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), action ? 5000 : 2600);
}
paintBagCount();

/* =====================================================
   PRODUCT RENDER (SVG)
   ===================================================== */
let uid = 0;
function unitSVG(temp) {
  const i = ++uid;
  return `<svg viewBox="0 0 1000 300" aria-hidden="true">
  <defs>
    <linearGradient id="ub${i}" x1="0" y1="0" x2="0" y2="1" class="stops"><stop offset="0" style="stop-color:var(--u1)"/><stop offset=".6" style="stop-color:var(--u2)"/><stop offset="1" style="stop-color:var(--u3)"/></linearGradient>
    <linearGradient id="us${i}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".16"/><stop offset=".06" stop-color="#000" stop-opacity="0"/><stop offset=".94" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>
    <linearGradient id="ul${i}" x1="0" y1="0" x2="0" y2="1" class="stops"><stop offset="0" style="stop-color:var(--lv)"/><stop offset="1" style="stop-color:var(--u3)"/></linearGradient>
    <linearGradient id="ug${i}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5ac8fa" stop-opacity="0"/><stop offset=".5" stop-color="#5ac8fa"/><stop offset="1" stop-color="#5ac8fa" stop-opacity="0"/></linearGradient>
    <filter id="uf${i}" x="-20%" y="-50%" width="140%" height="220%"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="ud${i}"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect x="70" y="70" width="860" height="200" rx="60" fill="#000" opacity=".22" filter="url(#uf${i})"/>
  <rect x="30" y="24" width="940" height="212" rx="52" fill="url(#ub${i})"/>
  <rect x="30" y="24" width="940" height="212" rx="52" fill="url(#us${i})"/>
  <rect x="30.5" y="24.5" width="939" height="211" rx="51.5" fill="none" stroke="#000" stroke-opacity=".07"/>
  <path d="M84 27.5H916" stroke="#fff" stroke-opacity=".85" stroke-width="3" stroke-linecap="round"/>
  <path d="M60 184H940" stroke="#000" stroke-opacity=".07" stroke-width="1.5"/>
  <path d="M60 185.5H940" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>
  <g transform="translate(92 96) scale(.62) translate(-49.42 -6.42)" style="fill:var(--mark)">${LOGO_WORD}</g>
  <g class="disp">
    <rect x="806" y="92" width="96" height="36" rx="18" fill="#000" fill-opacity=".05"/>
    <circle cx="854" cy="110" r="24" fill="#5ac8fa" opacity=".25" filter="url(#ud${i})"/>
    <text x="854" y="118" text-anchor="middle" font-family="Inter,sans-serif" font-size="22" font-weight="500" fill="#2aa7ff">${temp || '22°'}</text>
  </g>
  <rect class="slot" x="78" y="206" width="844" height="26" rx="13" fill="#0e1014" opacity=".9"/>
  <g class="slot"><path d="M110 219H890" stroke="#2a2e36" stroke-width="10" stroke-dasharray="2 8"/></g>
  <g class="louver"><rect x="66" y="198" width="868" height="36" rx="18" fill="url(#ul${i})"/><path d="M96 199.5H904" stroke="#fff" stroke-opacity=".45" stroke-width="1.2"/></g>
  <rect class="led" x="300" y="182" width="400" height="3" rx="1.5" fill="url(#ug${i})"/>
</svg>`;
}
$$('[data-unit]').forEach(el => { el.innerHTML = unitSVG(el.dataset.temp); });

/* =====================================================
   AIRFLOW (canvas)
   ===================================================== */
const AIRCOL = { light: [64, 160, 255], cool: [120, 195, 255], heat: [255, 160, 80], dry: [110, 225, 210], auto: [170, 150, 255], night: [150, 190, 255] };
class Air {
  constructor(cv) {
    this.cv = cv; this.ctx = cv.getContext('2d'); this.p = []; this.vis = false; this.power = +(cv.dataset.power || 1);
    this.unit = cv.parentElement.querySelector('.unit');
    this.resize(); addEventListener('resize', () => this.resize());
    new IntersectionObserver(e => { this.vis = e[0].isIntersecting; if (this.vis) this.loop(); }).observe(cv);
  }
  resize() {
    const r = this.cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    this.w = r.width; this.h = r.height; this.cv.width = r.width * d; this.cv.height = r.height * d;
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  active() { return !reduce && ('always' in this.cv.dataset ? true : !!(this.unit && this.unit.classList.contains('open'))); }
  loop() {
    if (this.running) return; this.running = true;
    const step = () => {
      if (!this.vis || !this.cv.offsetParent) { this.running = false; return; }
      const { ctx, w, h } = this, col = AIRCOL[this.cv.dataset.air] || AIRCOL.light;
      const alpha = this.cv.dataset.air === 'night' ? 0.3 : this.cv.dataset.air === 'light' ? 0.5 : 0.65;
      const speed = this.cv.dataset.air === 'night' ? 0.45 : 1;
      ctx.clearRect(0, 0, w, h);
      if (this.active()) for (let k = 0; k < 3 * this.power; k++) {
        const x = w * (0.1 + Math.random() * 0.8), c = (x / w - 0.5);
        this.p.push({ x, y: 2, vx: c * (0.8 + Math.random()) * speed, vy: (0.9 + Math.random() * 1.3) * speed, life: 0, max: (70 + Math.random() * 70) / Math.max(speed, .6) });
      }
      ctx.lineCap = 'round'; ctx.lineWidth = 1.2;
      for (let i = this.p.length - 1; i >= 0; i--) {
        const q = this.p[i]; q.life++; q.x += q.vx; q.y += q.vy; q.vy *= 0.992; q.vx *= 1.004;
        const t = q.life / q.max; if (t >= 1 || q.y > h) { this.p.splice(i, 1); continue; }
        ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${Math.sin(t * Math.PI) * alpha})`;
        ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(q.x - q.vx * 9, q.y - q.vy * 9); ctx.stroke();
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}
const airs = $$('canvas.air').map(c => new Air(c));

/* =====================================================
   REVEAL & COUNTERS
   ===================================================== */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; e.target.classList.add('in'); io.unobserve(e.target);
}), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
$$('.rv, .tile').forEach(el => io.observe(el));
const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; cio.unobserve(e.target);
  const el = e.target, to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), t0 = performance.now(), dur = reduce ? 1 : 1600;
  const tick = now => { const k = clamp((now - t0) / dur); el.textContent = (to * (1 - Math.pow(1 - k, 4))).toFixed(dec).replace('.', ','); if (k < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}), { threshold: 0.6 });
$$('[data-count]').forEach(el => cio.observe(el));
function setRangeFill(r) { r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%'); }

/* Pozioma karuzela ze strzałkami (miejsca) */
function carousel(track, prev, next, counter) {
  const cards = [...track.children];
  const idx = () => {
    if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 4) return cards.length - 1;
    let b = 0, bd = 1e9; cards.forEach((c, i) => { const d = Math.abs(c.offsetLeft - cards[0].offsetLeft - track.scrollLeft); if (d < bd) { bd = d; b = i; } }); return b;
  };
  const goTo = i => track.scrollTo({ left: cards[i].offsetLeft - cards[0].offsetLeft, behavior: 'smooth' });
  const paint = () => { const i = idx(); prev.disabled = i === 0; next.disabled = i === cards.length - 1; if (counter) counter.textContent = `${i + 1} / ${cards.length}`; };
  prev.onclick = () => goTo(Math.max(0, idx() - 1)); next.onclick = () => goTo(Math.min(cards.length - 1, idx() + 1));
  let t; track.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(paint, 80); }, { passive: true });
  paint();
}

/* =====================================================
   HOME
   ===================================================== */
function home() {
  requestAnimationFrame(() => document.documentElement.classList.add('loaded'));

  /* highlights */
  const track = $('#hlTrack'), slides = $$('.hl', track), dotsEl = $('#hlDots');
  let hlIdx = 0, hlPlaying = !reduce, hlT0 = performance.now(), hlVisible = false;
  const hlDur = 5200;
  slides.forEach((_, i) => {
    const d = document.createElement('button'); d.className = 'dot'; d.setAttribute('aria-label', 'Slajd ' + (i + 1)); d.innerHTML = '<i></i>';
    d.onclick = () => goHl(i, true); dotsEl.appendChild(d);
  });
  const dots = $$('.dot', dotsEl);
  const paintDots = () => dots.forEach((d, i) => { d.classList.toggle('on', i === hlIdx); d.firstChild.style.transform = 'scaleX(0)'; });
  function goHl(i, user) {
    hlIdx = (i + slides.length) % slides.length;
    track.scrollTo({ left: slides[hlIdx].offsetLeft - slides[0].offsetLeft, behavior: 'smooth' });
    hlT0 = performance.now(); paintDots();
    if (user) { hlPlaying = false; setPlayIcon(); }
  }
  function setPlayIcon() {
    $('#hlPlay').innerHTML = hlPlaying
      ? '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="2" width="3.5" height="12" rx="1"/><rect x="9.5" y="2" width="3.5" height="12" rx="1"/></svg>'
      : '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5v11a.8.8 0 0 0 1.2.7l9-5.5a.8.8 0 0 0 0-1.4l-9-5.5A.8.8 0 0 0 4 2.5Z"/></svg>';
    $('#hlPlay').setAttribute('aria-label', hlPlaying ? 'Wstrzymaj' : 'Odtwórz');
  }
  $('#hlPlay').onclick = () => { hlPlaying = !hlPlaying; hlT0 = performance.now(); setPlayIcon(); };
  let hto;
  track.addEventListener('scroll', () => {
    clearTimeout(hto);
    hto = setTimeout(() => {
      const x = track.scrollLeft; let best = 0, bd = 1e9;
      slides.forEach((s, i) => { const d = Math.abs(s.offsetLeft - slides[0].offsetLeft - x); if (d < bd) { bd = d; best = i; } });
      if (best !== hlIdx) { hlIdx = best; hlT0 = performance.now(); paintDots(); }
    }, 120);
  }, { passive: true });
  new IntersectionObserver(e => { hlVisible = e[0].isIntersecting; if (hlVisible) hlT0 = performance.now(); }, { threshold: 0.4 }).observe(track);
  (function hlTick(now) {
    if (hlPlaying && hlVisible) {
      const k = clamp((now - hlT0) / hlDur);
      dots[hlIdx].firstChild.style.transform = `scaleX(${k})`;
      if (k >= 1) goHl(hlIdx + 1);
    }
    requestAnimationFrame(hlTick);
  })(performance.now());
  paintDots(); setPlayIcon();

  /* scroll-driven */
  const words = $('#words');
  words.innerHTML = words.textContent.trim().split(/\s+/).map(w => `<span>${w}</span>`).join(' ');
  const wSpans = $$('span', words);
  const story = $('#design'), storyStage = $('#storyStage'), storyUnit = $('.unit', storyStage), storySteps = $$('.story-step', story), storyBars = $$('.story-progress b', story), dims = $('#dims');
  const storyAir = airs.find(a => a.cv.parentElement === storyStage);
  const marq = $('#marq');
  const navLinks = $$('#navLinks a'), navInd = $('#navLinks .nav-ind'), navProg = $('#navProgress');
  let navActive = null;
  function moveInd(a) {
    if (!a || !a.offsetWidth) { navInd.classList.remove('show'); return; }
    navInd.style.width = a.offsetWidth + 'px'; navInd.style.transform = `translateX(${a.offsetLeft}px)`; navInd.classList.add('show');
  }
  function onScroll() {
    const vh = innerHeight;
    const wr = words.getBoundingClientRect();
    const lit = Math.round(clamp((vh * 0.85 - wr.top) / (wr.height + vh * 0.35)) * wSpans.length);
    wSpans.forEach((s, i) => s.classList.toggle('on', i < lit));
    const sr = story.getBoundingClientRect();
    const sp = clamp(-sr.top / (sr.height - vh));
    const stepI = sp < 0.33 ? 0 : sp < 0.66 ? 1 : 2;
    storySteps.forEach((s, i) => s.classList.toggle('on', i === stepI));
    storyBars.forEach((b, i) => b.style.transform = `scaleX(${clamp(sp * 3 - i)})`);
    storyUnit.classList.toggle('open', sp >= 0.33);
    storyUnit.classList.toggle('on', sp >= 0.2);
    dims.classList.toggle('on', sp < 0.3);
    const rx = stepI === 0 ? 0 : sp < 0.66 ? (sp - 0.33) / 0.33 * 16 : 16;
    storyStage.style.transform = reduce ? '' : `rotateX(${-rx}deg) scale(${0.92 + sp * 0.14})`;
    if (storyAir) storyAir.power = sp >= 0.66 ? 2 : 1;
    const mr = marq.getBoundingClientRect();
    marq.style.transform = `translateX(${-(vh - mr.top) * 0.35}px)`;
    let active = null;
    navLinks.forEach(a => { const el = document.getElementById(a.dataset.sec); if (el && el.getBoundingClientRect().top < vh * 0.4) active = a; });
    if (active && !active.offsetWidth) active = null;
    if (active !== navActive) { navLinks.forEach(a => a.classList.toggle('on', a === active)); if (active) active.setAttribute('aria-current', 'location'); navLinks.forEach(a => { if (a !== active) a.removeAttribute('aria-current'); }); moveInd(active); navActive = active; }
    const doc = document.documentElement;
    navProg.style.transform = `scaleX(${clamp(scrollY / (doc.scrollHeight - vh))})`;
  }
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { onScroll(); ticking = false; }); } }, { passive: true });
  addEventListener('resize', () => { navActive = undefined; onScroll(); });
  onScroll();

  /* noise bars */
  const nio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; nio.unobserve(e.target);
    $$('.nbar i', e.target).forEach((b, i) => setTimeout(() => b.style.width = (b.dataset.w / 45 * 100) + '%', i * 120));
  }), { threshold: 0.3 });
  nio.observe($('#noise'));

  /* modes */
  initModes();

  /* colors */
  const colorSec = $('#kolory'), colorUnit = $('#colorUnit');
  $$('#colorSw .sw').forEach(b => b.onclick = () => {
    const f = b.dataset.f;
    $$('#colorSw .sw').forEach(x => x.setAttribute('aria-pressed', x === b));
    colorUnit.dataset.finish = f; colorSec.dataset.finish = f; $('#swName').textContent = FINISHES[f];
    $('#colorBuy').href = `kup.html?finish=${f}`;
  });

  /* energy */
  const cArea = $('#cArea'), cHours = $('#cHours'); let cMode = 'both';
  function calc() {
    const a = +cArea.value, h = +cHours.value, price = 1.15;
    const coolTh = a * 0.07 * h * 120, heatTh = cMode === 'both' ? a * 0.055 * h * 180 : 0;
    const x5 = (coolTh / 8.8 + heatTh / 5.2) * price, std = (coolTh / 6.1 + heatTh / 4.0) * price;
    $('#oArea').textContent = a + ' m²'; $('#oHours').textContent = h + ' h';
    $('#oX5').textContent = zl(x5); $('#oStd').textContent = zl(std);
    $('#oSave').textContent = zl(std - x5); $('#o10').textContent = zl((std - x5) * 10);
    const m = recommend(a); $('#oModel').textContent = MODELS[m].name; $('#oBuy').href = 'kup.html?model=' + m;
    setRangeFill(cArea); setRangeFill(cHours);
  }
  cArea.oninput = cHours.oninput = calc;
  $$('#cMode button').forEach(b => b.onclick = () => { cMode = b.dataset.m; $$('#cMode button').forEach(x => x.setAttribute('aria-pressed', x === b)); calc(); });
  calc();

  /* app mock */
  let appT = 22, appM = 'cool';
  const MODECOL = { cool: ['#5ac8fa', '#0a84ff', 'Chłodzenie'], heat: ['#ffb340', '#ff5e3a', 'Grzanie'], auto: ['#7ee0b0', '#1a9e55', 'Auto'], quiet: ['#b9a8ff', '#5b3df5', 'Tryb nocny · 17 dB'] };
  function paintApp() {
    $('#dialArc').setAttribute('stroke-dasharray', `${Math.max(8, 433.5 * (appT - 16) / 14)} 578`);
    $('#appT').textContent = appT + '°';
    const c = MODECOL[appM]; $('#dG1').setAttribute('stop-color', c[0]); $('#dG2').setAttribute('stop-color', c[1]); $('#appMode').textContent = c[2];
  }
  $('#appPlus').onclick = () => { appT = Math.min(30, appT + 1); paintApp(); };
  $('#appMinus').onclick = () => { appT = Math.max(16, appT - 1); paintApp(); };
  $$('#appModes button').forEach(b => b.onclick = () => { appM = b.dataset.m; $$('#appModes button').forEach(x => x.setAttribute('aria-pressed', x === b)); paintApp(); });
  paintApp();

  /* places */
  carousel($('#placeTrack'), $('#plPrev'), $('#plNext'), $('#plCount'));
}

/* ---------- Tryby pracy ---------- */
const MODES = {
  cool: {
    name: 'Chłodzenie', t: '21°', head: 'Z 30° do 22° w trzy minuty.',
    desc: 'Turbo Chill rusza z pełną mocą, a gdy pokój osiągnie zadaną temperaturę, X5 płynnie zwalnia do 17% mocy. Radar Aura prowadzi strumień wokół ludzi, więc nikt nie siedzi w przeciągu.',
    stats: [['3 min', 'do 22° w Turbo Chill²'], ['16 do 30°', 'zakres ustawień'], ['8,8', 'SEER, klasa A+++']],
    when: 'Upalne popołudnia, praca z domu, pokoje od strony południowej.'
  },
  heat: {
    name: 'Grzanie', t: '23°', head: 'Pompa ciepła, która zastępuje grzejnik.',
    desc: 'Z 1 kWh prądu X5 oddaje średnio 5,2 kWh ciepła. Ciepłe powietrze płynie nisko, przy podłodze, dzięki czemu stopy są ciepłe, a głowa chłodna, jak przy ogrzewaniu podłogowym.',
    stats: [['5,2', 'SCOP, klasa A+++'], ['-25°C', 'praca przy mrozie'], ['30 s', 'do pierwszego ciepłego powiewu']],
    when: 'Okres przejściowy, chłodne wieczory, dogrzewanie domu zamiast pieca.'
  },
  dry: {
    name: 'Osuszanie', t: '22°', head: 'Koniec z duchotą. Bez wychładzania.',
    desc: 'Tryb Dry usuwa wilgoć, prawie nie zmieniając temperatury. Parne dni stają się rześkie, a na szybach i w narożnikach nie ma miejsca na pleśń.',
    stats: [['1,8 l/h', 'usuwanej wilgoci'], ['45%', 'docelowa wilgotność'], ['0,5°', 'maksymalny spadek temperatury']],
    when: 'Deszczowe lato, suszenie prania, mieszkania na parterze.'
  },
  auto: {
    name: 'Auto AI', t: '22°', head: 'Chip C2 wybiera tryb za ciebie.',
    desc: 'Co sekundę analizuje temperaturę, wilgotność, CO₂ i obecność ludzi. Sam przełącza chłodzenie, grzanie i osuszanie, a po tygodniu zna twój rytm dnia i zaczyna działać, zanim poczujesz różnicę.',
    stats: [['12', 'czujników środowiska'], ['-22%', 'zużycia energii⁴'], ['7 dni', 'nauki twoich nawyków']],
    when: 'Na co dzień. Ustawiasz raz i zapominasz, że masz klimatyzator.'
  },
  night: {
    name: 'Tryb nocny', t: '21°', head: 'Śpij. X5 czuwa po cichu.',
    desc: 'Wyświetlacz przygasa do 5%, wentylator zwalnia do 17 dB, a strumień kieruje się pod sufit, z dala od łóżka. W nocy temperatura rośnie łagodnie o stopień, zgodnie z naturalnym rytmem snu, a nad ranem wraca do ustawień.',
    stats: [['17 dB', 'ciszej niż szelest liści'], ['5%', 'jasności wyświetlacza'], ['+1°', 'łagodna krzywa snu']],
    when: 'Sypialnie, pokoje dzieci, gorące letnie noce.'
  }
};
const SLEEP_SVG = `<figure class="sleep"><figcaption>Krzywa snu · temperatura w nocy</figcaption>
  <svg viewBox="0 0 400 130" role="img" aria-label="Temperatura rośnie z 21 do 22 stopni w nocy i wraca do 21 rano">
    <defs><linearGradient id="slg" x1="0" x2="1"><stop offset="0" stop-color="#5ac8fa"/><stop offset="1" stop-color="#7a6bff"/></linearGradient>
    <linearGradient id="sla" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#7a6bff" stop-opacity=".22"/><stop offset="1" stop-color="#7a6bff" stop-opacity="0"/></linearGradient></defs>
    <g stroke="#e3e3e8"><path d="M20 30H390M20 65H390M20 100H390"/></g>
    <g font-size="10" fill="#86868b" font-family="Inter,sans-serif"><text x="0" y="33">22°</text><text x="0" y="68">21,5°</text><text x="0" y="103">21°</text>
    <text x="36" y="124">22:00</text><text x="120" y="124">0:00</text><text x="205" y="124">2:00</text><text x="290" y="124">4:00</text><text x="360" y="124">6:30</text></g>
    <path d="M40 100 C 90 100, 110 70, 140 62 S 210 30, 240 30 S 320 30, 340 50 S 370 100, 385 100 L385 110 L40 110Z" fill="url(#sla)"/>
    <path class="sleep-line" d="M40 100 C 90 100, 110 70, 140 62 S 210 30, 240 30 S 320 30, 340 50 S 370 100, 385 100" fill="none" stroke="url(#slg)" stroke-width="3" stroke-linecap="round"/>
  </svg></figure>`;
function initModes() {
  const sc = $('#scene'); if (!sc) return;
  const tabs = $$('#modeTabs [role="tab"]'), panel = $('#modePanel'), air = $('#sceneAir');
  function set(m, focus) {
    const d = MODES[m];
    sc.dataset.mode = m; sc.dataset.time = m === 'night' ? 'night' : 'day';
    tabs.forEach(t => { const on = t.dataset.m === m; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
    $$('#dayNight button').forEach(b => b.setAttribute('aria-pressed', b.dataset.t === sc.dataset.time));
    $('#tagT').textContent = d.t; $('#tagM').textContent = d.name; air.dataset.air = m;
    panel.innerHTML = `<div><p class="eyebrow">${d.name}</p><h3 class="h3">${d.head}</h3><p class="lede">${d.desc}</p></div>
      <div><div class="mode-stats">${d.stats.map(s => `<div><b>${s[0]}</b><span>${s[1]}</span></div>`).join('')}</div>
      ${m === 'night' ? SLEEP_SVG : ''}<p class="mode-when"><b>Kiedy używać:</b> ${d.when}</p></div>`;
    panel.classList.remove('mode-anim'); void panel.offsetWidth; panel.classList.add('mode-anim');
  }
  tabs.forEach((t, i) => {
    t.onclick = () => { set(t.dataset.m); t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest', inline: 'center' }); };
    t.onkeydown = e => {
      const k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (k) { e.preventDefault(); set(tabs[(i + k + tabs.length) % tabs.length].dataset.m, true); }
    };
  });
  $$('#dayNight button').forEach(b => b.onclick = () => {
    if (b.dataset.t === 'night') set('night'); else if (sc.dataset.mode === 'night') set('cool');
  });
  set('cool');
}

/* =====================================================
   KUP · konfigurator
   ===================================================== */
function buy() {
  const q = new URLSearchParams(location.search);
  const cfg = {
    model: MODELS[q.get('model')] ? q.get('model') : '35',
    finish: FINISHES[q.get('finish')] ? q.get('finish') : 'white',
    install: INSTALLS[q.get('install')] ? q.get('install') : 'standard',
    care: CARES[q.get('care')] ? q.get('care') : 'none',
    accs: new Set()
  };
  const optHTML = (key, val, o) => `<button class="opt" role="radio" data-k="${key}" data-v="${val}" aria-checked="false">
    <span>${o.tag ? `<span class="tag">${o.tag}</span>` : ''}<b>${o.name}</b><small>${o.desc}</small></span>
    <span class="p">${o.price ? '+ ' + zl(o.price) : 'W cenie'}</span></button>`;
  $('#optModel').innerHTML = Object.entries(MODELS).map(([k, m]) =>
    `<button class="opt" role="radio" data-k="model" data-v="${k}" aria-checked="false">
      <span><span class="tag" data-rec="${k}"></span><b>Climoo ${m.name}</b><small>${m.kw} chłodzenia · ${m.heat} grzania · do ${m.area} m²</small></span>
      <span class="p">${zl(m.price)}<br><small>lub ${zl2(m.price / RATY)}/mies.</small></span></button>`).join('');
  $('#optFin').innerHTML = Object.entries(FINISHES).map(([k, n]) =>
    `<button class="fin" role="radio" data-k="finish" data-v="${k}" aria-checked="false" aria-label="${n}"><span class="sw sw-${k}"></span>${n}</button>`).join('');
  $('#optInst').innerHTML = Object.entries(INSTALLS).map(([k, o]) => optHTML('install', k, o)).join('');
  $('#optCare').innerHTML = Object.entries(CARES).map(([k, o]) => optHTML('care', k, o)).join('');
  $('#optAcc').innerHTML = Object.entries(ACCS).map(([k, a]) =>
    `<label class="check-opt"><input type="checkbox" value="${k}"><span class="acc-ico">${ICONS[a.icon]}</span><span class="t"><b>${a.name}</b><small>${a.desc}</small></span><span class="p">${zl(a.price)}</span></label>`).join('');
  $$('[role="radio"]', $('.buy')).forEach(b => b.onclick = () => { cfg[b.dataset.k] = b.dataset.v; paint(); });
  $$('#optAcc input').forEach(c => c.onchange = () => { c.checked ? cfg.accs.add(c.value) : cfg.accs.delete(c.value); paint(); });
  const bArea = $('#bArea');
  bArea.value = Math.min(MODELS[cfg.model].area - 5, 70);
  bArea.oninput = () => {
    const m = recommend(+bArea.value);
    $('#bAreaO').textContent = bArea.value + ' m²';
    $('#bHint').innerHTML = +bArea.value > 65 ? 'Powyżej 65 m² polecamy dwa urządzenia. <a href="index.html#faq">Zapytaj eksperta</a>.' : `Polecamy <b>Climoo ${MODELS[m].name}</b>.`;
    cfg.model = m; paint();
  };
  const vis = $('#buyVis');
  $$('#galTabs button').forEach(b => b.onclick = () => { vis.dataset.view = b.dataset.view; $$('#galTabs button').forEach(x => x.setAttribute('aria-pressed', x === b)); });
  function paint() {
    $$('[role="radio"]', $('.buy')).forEach(b => b.setAttribute('aria-checked', cfg[b.dataset.k] === b.dataset.v));
    const rec = recommend(+bArea.value);
    $('#bAreaO').textContent = bArea.value + ' m²'; setRangeFill(bArea);
    $$('[data-rec]').forEach(t => t.textContent = t.dataset.rec === rec ? 'Polecany dla twojego metrażu' : '');
    const m = MODELS[cfg.model];
    vis.dataset.finish = cfg.finish; $('#buyUnit').dataset.finish = cfg.finish;
    $$('.gal-photo img', vis).forEach(img => img.classList.toggle('on', img.dataset.f === cfg.finish));
    $('#galNote').textContent = `Climoo ${m.name} · ${FINISHES[cfg.finish]}`;
    $('#buyLabel').textContent = `Climoo ${m.name} · ${FINISHES[cfg.finish]}`;
    $('#buyFit').textContent = `82 × 28,5 × 17,8 cm · do ${m.area} m²`; $('#buyKw').textContent = `${m.kw} chłodzenia · ${m.heat} grzania`;
    $('#finName').textContent = FINISHES[cfg.finish];
    const total = m.price + INSTALLS[cfg.install].price + CARES[cfg.care].price + [...cfg.accs].reduce((s, a) => s + ACCS[a].price, 0);
    $('#bbTotal').textContent = zl(total);
    $('#bbMonthly').textContent = `lub ${zl2(total / RATY)}/mies. w ${RATY} ratach 0%`;
    $('#bbEta').textContent = cfg.install === 'none' ? `Dostawa: ${shortDate(addDays(2))}` : `Montaż możliwy od: ${shortDate(addDays(3))}`;
  }
  $('#addToBag').onclick = () => {
    const key = ['u', cfg.model, cfg.finish, cfg.install, cfg.care].join('-');
    const ex = S.cart.find(l => l.key === key);
    if (ex) ex.qty = Math.min(9, ex.qty + 1); else S.cart.push({ key, kind: 'unit', model: cfg.model, finish: cfg.finish, install: cfg.install, care: cfg.care, qty: 1 });
    cfg.accs.forEach(a => { const k = 'a-' + a, e = S.cart.find(l => l.key === k); if (e) e.qty = Math.min(9, e.qty + 1); else S.cart.push({ key: k, kind: 'acc', id: a, qty: 1 }); });
    save();
    const btn = $('#addToBag'); btn.disabled = true; btn.textContent = 'Dodano';
    setTimeout(() => go('koszyk.html'), 350);
  };
  bArea.oninput();
}

/* =====================================================
   KOSZYK
   ===================================================== */
const lineThumb = l => l.kind === 'unit'
  ? `<img class="thumb-photo" src="img/x5-${l.finish}.webp" alt="Climoo X5 w kolorze ${FINISHES[l.finish]}" loading="lazy">`
  : `<span class="acc-ico">${ICONS[ACCS[l.id].icon]}</span>`;
const lineTitle = l => l.kind === 'unit' ? `Climoo ${MODELS[l.model].name} · ${FINISHES[l.finish]}` : ACCS[l.id].name;
const TRUST = `<div class="trust">
  <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z"/><path d="m9 12 2 2 4-4"/></svg>7 lat gwarancji producenta</div>
  <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12a8 8 0 1 0 3-6.3"/><path d="M4 4v4h4"/></svg>30 dni na zwrot, odbiór gratis</div>
  <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>Bezpieczna, szyfrowana płatność</div>
</div>`;
function totalsHTML() {
  const t = totals();
  return `<div class="srow"><span>Wartość produktów</span><span>${zl(t.sub)}</span></div>
    ${t.disc ? `<div class="srow disc"><span>Kod ${esc(S.promo)}</span><span>${zl(-t.disc)}</span></div>` : ''}
    <div class="srow"><span>Dostawa</span><span>Bezpłatna</span></div>
    <div class="srow total"><span>Do zapłaty</span><span>${zl(t.total)}</span></div>
    <div class="srow"><span class="muted">w tym VAT 23%</span><span class="muted">${zl(t.vat)}</span></div>
    <p class="monthly">lub ${zl2(t.total / RATY)}/mies. w ${RATY} ratach 0%</p>`;
}
function bag() {
  const body = $('#bagBody');
  function render() {
    paintBagCount();
    if (!S.cart.length) {
      $('#bagTitle').textContent = 'Twój koszyk jest pusty.'; $('#bagSub').textContent = '';
      body.innerHTML = `<div class="empty"><p class="lede" style="margin:0 auto">Lato nie czeka. Skonfiguruj swojego Climoo X5 w mniej niż minutę.</p><a class="btn lg" href="kup.html">Skonfiguruj X5</a></div>`;
      return;
    }
    const t = totals();
    $('#bagTitle').textContent = `Łącznie w koszyku: ${zl(t.total)}.`;
    $('#bagSub').innerHTML = `Darmowa dostawa i zwrot w ciągu 30 dni. <a href="kup.html" class="more">Kontynuuj zakupy</a>`;
    const missing = Object.keys(ACCS).filter(a => !S.cart.some(l => l.kind === 'acc' && l.id === a));
    body.innerHTML = `<div class="bag-grid"><div>
      ${S.cart.map((l, i) => {
        const isU = l.kind === 'unit', m = isU && MODELS[l.model];
        const eta = isU ? (l.install === 'none' ? `Dostawa kurierem: ${shortDate(addDays(2))}` : `Montaż możliwy od ${shortDate(addDays(3))}. Termin wybierzesz w kasie.`) : `Dostawa: ${shortDate(addDays(2))}`;
        const sub = isU ? `<ul>
          <li><span>Urządzenie (${m.kw}, do ${m.area} m²)</span><span>${zl(m.price)}</span></li>
          <li><span>${INSTALLS[l.install].name}</span><span>${INSTALLS[l.install].price ? zl(INSTALLS[l.install].price) : '0 zł'}</span></li>
          ${l.care !== 'none' ? `<li><span>${CARES[l.care].name}</span><span>${zl(CARES[l.care].price)}</span></li>` : ''}
          ${l.qty > 1 ? `<li><span>Cena za sztukę</span><span>${zl(unitPrice(l))}</span></li>` : ''}
        </ul>` : `<ul><li><span>${ACCS[l.id].desc}</span></li></ul>`;
        return `<div class="line">
          <div class="line-img">${lineThumb(l)}</div>
          <div>
            <div class="line-top"><h3>${lineTitle(l)}</h3><div class="lp">${zl(linePrice(l))}</div></div>
            ${sub}
            <p class="eta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>${eta}</p>
            <div class="line-act">
              <div class="qty"><button data-q="-1" data-i="${i}" aria-label="Mniej">−</button><span aria-label="Ilość">${l.qty}</span><button data-q="1" data-i="${i}" aria-label="Więcej" ${l.qty >= 9 ? 'disabled' : ''}>+</button></div>
              ${isU ? `<a class="linkbtn" href="kup.html?model=${l.model}&finish=${l.finish}&install=${l.install}&care=${l.care}" data-edit="${i}">Zmień konfigurację</a>` : ''}
              <button class="linkbtn" data-rm="${i}">Usuń</button>
            </div>
          </div></div>`;
      }).join('')}
      ${missing.length ? `<div class="upsell"><h3>Często dokupowane z X5</h3><div class="upsell-grid">${missing.map(a => `
        <div class="ups"><span class="acc-ico">${ICONS[ACCS[a].icon]}</span><div class="t"><b>${ACCS[a].name}</b><small>${zl(ACCS[a].price)}</small></div><button class="btn ghost sm" data-add="${a}">Dodaj</button></div>`).join('')}</div></div>` : ''}
      </div>
      <aside class="summary"><h3>Podsumowanie</h3>${totalsHTML()}
        <div class="promo"><input id="promoIn" placeholder="Kod rabatowy" value="${esc(S.promo || '')}" aria-label="Kod rabatowy" ${S.promo ? 'readonly' : ''}><button class="btn ghost sm" style="height:44px" id="promoBtn">${S.promo ? 'Usuń' : 'Zastosuj'}</button></div>
        <p class="promo-msg ${S.promo ? 'ok' : ''}" id="promoMsg">${S.promo ? `Kod aktywny: -${PROMOS[S.promo] * 100}%.` : 'Masz kod? Wypróbuj LATO26.'}</p>
        <a class="btn block lg" href="kasa.html">Przejdź do kasy</a>
        ${TRUST}
      </aside></div>`;
    $$('[data-q]', body).forEach(b => b.onclick = () => {
      const i = +b.dataset.i, l = S.cart[i]; l.qty = Math.min(9, l.qty + +b.dataset.q);
      if (l.qty <= 0) remove(i); else { save(); render(); }
    });
    $$('[data-rm]', body).forEach(b => b.onclick = () => remove(+b.dataset.rm));
    $$('[data-edit]', body).forEach(a => a.onclick = e => { e.preventDefault(); const href = a.getAttribute('href'); S.cart.splice(+a.dataset.edit, 1); save(); go(href); });
    $$('[data-add]', body).forEach(b => b.onclick = () => { S.cart.push({ key: 'a-' + b.dataset.add, kind: 'acc', id: b.dataset.add, qty: 1 }); save(); render(); toast(`Dodano: ${ACCS[b.dataset.add].name}.`); });
    const apply = () => {
      if (S.promo) { S.promo = null; save(); render(); return; }
      const code = $('#promoIn').value.trim().toUpperCase();
      if (PROMOS[code]) { S.promo = code; save(); render(); toast(`Kod ${code} obniżył cenę o ${PROMOS[code] * 100}%.`); }
      else { const m = $('#promoMsg'); m.textContent = code ? 'Ten kod jest nieprawidłowy lub wygasł.' : 'Wpisz kod rabatowy.'; m.className = 'promo-msg err'; }
    };
    $('#promoBtn').onclick = apply;
    $('#promoIn').onkeydown = e => { if (e.key === 'Enter') apply(); };
  }
  function remove(i) {
    const [l] = S.cart.splice(i, 1); save(); render();
    toast(`Usunięto: ${lineTitle(l)}.`, { label: 'Cofnij', fn: () => { S.cart.splice(i, 0, l); save(); render(); } });
  }
  render();
}

/* =====================================================
   KASA
   ===================================================== */
function checkout() {
  if (!S.cart.length) { location.replace(withState('koszyk.html')); return; }
  const co = { date: null, slot: null, delivery: 'courier', pay: 'blik' };
  const SLOTS = ['8:00 do 12:00', '12:00 do 16:00', '16:00 do 20:00'];
  const inst = hasInstall();
  $('#addrLegend').textContent = inst ? 'Adres montażu' : 'Adres dostawy';
  $('#addrNote').textContent = inst ? 'Instalator przyjedzie pod ten adres. Tu dostarczymy też urządzenie.' : 'Tu dostarczymy twoje zamówienie.';
  $('#whenLegend').textContent = inst ? 'Termin montażu' : 'Sposób dostawy';
  $('#whenNote').textContent = inst ? 'Wybierz dzień i przedział godzin. Instalator zadzwoni dzień wcześniej.' : 'Wysyłka w 24 godziny od zaksięgowania płatności.';
  const wb = $('#whenBody');
  if (inst) {
    const days = []; const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 3);
    for (let n = 0; days.length < 14; n++) { if (d.getDay() !== 0) days.push({ iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`, d: new Date(d), full: (n * 7 + 3) % 5 === 0 }); d.setDate(d.getDate() + 1); }
    wb.innerHTML = `<div class="chips" role="radiogroup" aria-label="Dzień montażu">${days.map(x =>
      `<button type="button" class="chip-d" role="radio" data-date="${x.iso}" aria-checked="false" ${x.full ? 'disabled title="Brak wolnych terminów"' : ''}><small>${DAYN[x.d.getDay()]}</small><b>${x.d.getDate()}</b><small>${MONN[x.d.getMonth()].slice(0, 3)}</small></button>`).join('')}</div>
      <div class="slots" role="radiogroup" aria-label="Godzina">${SLOTS.map(s => `<button type="button" class="slot-b" role="radio" data-slot="${s}" aria-checked="false">${s}</button>`).join('')}</div>`;
    $$('[data-date]', wb).forEach(b => b.onclick = () => { co.date = b.dataset.date; $$('[data-date]', wb).forEach(x => x.setAttribute('aria-checked', x === b)); $('#whenErr').style.display = 'none'; });
    $$('[data-slot]', wb).forEach(b => b.onclick = () => { co.slot = b.dataset.slot; $$('[data-slot]', wb).forEach(x => x.setAttribute('aria-checked', x === b)); $('#whenErr').style.display = 'none'; });
  } else {
    wb.innerHTML = `<div class="opts" role="radiogroup">
      <button type="button" class="opt" role="radio" data-del="courier" aria-checked="true"><span><b>Kurier z wniesieniem</b><small>Dostawa ${shortDate(addDays(2))}</small></span><span class="p">Bezpłatnie</span></button>
      <button type="button" class="opt" role="radio" data-del="pickup" aria-checked="false"><span><b>Odbiór w Climoo Studio</b><small>Warszawa, ul. Chłodna 22 · od ${shortDate(addDays(1))}</small></span><span class="p">Bezpłatnie</span></button></div>`;
    $$('[data-del]', wb).forEach(b => b.onclick = () => { co.delivery = b.dataset.del; $$('[data-del]', wb).forEach(x => x.setAttribute('aria-checked', x === b)); });
  }
  const t = totals();
  $('#ratyInfo').textContent = `${RATY} × ${zl2(t.total / RATY)}`;
  $('#sumToggleTotal').textContent = zl(t.total);
  $('#coSummary').innerHTML = `<h3>Twoje zamówienie</h3>
    ${S.cart.map(l => `<div class="mini-line"><div class="mi">${lineThumb(l)}</div><div class="t">${l.kind === 'unit' ? `Climoo ${MODELS[l.model].name}<small>${FINISHES[l.finish]} · ${INSTALLS[l.install].name}${l.care !== 'none' ? ' · Care+' : ''}</small>` : ACCS[l.id].name}${l.qty > 1 ? `<small>Ilość: ${l.qty}</small>` : ''}</div><b>${zl(linePrice(l))}</b></div>`).join('')}
    <a class="linkbtn" href="koszyk.html" style="display:inline-block;margin:12px 0 6px">Edytuj koszyk</a>
    ${totalsHTML()}
    <button class="btn block lg place-order" type="submit" form="coForm">Zamawiam i płacę</button>
    ${TRUST}`;
  $('#sumToggle').onclick = () => { const s = $('#coSummary'), open = s.classList.toggle('open'); $('#sumToggle').setAttribute('aria-expanded', open); $('#sumToggleLabel').textContent = open ? 'Ukryj podsumowanie' : 'Pokaż podsumowanie'; };

  $$('#payOpts input[name=pay]').forEach(r => r.onchange = () => {
    co.pay = r.value; $$('.pay-opt').forEach(p => p.classList.toggle('on', p.dataset.pay === r.value));
  });
  $('#fInvoice').onchange = e => { $('#invoiceBox').hidden = !e.target.checked; };
  const mask = (id, fn) => $(id).addEventListener('input', e => { const el = e.target, v = fn(el.value); if (v !== el.value) el.value = v; el.closest('.inp').classList.remove('bad'); });
  mask('#fZip', v => { const d = v.replace(/\D/g, '').slice(0, 5); return d.length > 2 ? d.slice(0, 2) + '-' + d.slice(2) : d; });
  mask('#fBlik', v => { const d = v.replace(/\D/g, '').slice(0, 6); return d.length > 3 ? d.slice(0, 3) + ' ' + d.slice(3) : d; });
  mask('#fCard', v => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '));
  mask('#fExp', v => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; });
  mask('#fCvc', v => v.replace(/\D/g, '').slice(0, 3));
  mask('#fNip', v => v.replace(/\D/g, '').slice(0, 10));
  mask('#fPhone', v => v.replace(/[^\d+ ]/g, '').slice(0, 15));
  ['#fEmail', '#fFirst', '#fLast', '#fStreet', '#fCity', '#fCompany'].forEach(id => $(id).addEventListener('input', e => e.target.closest('.inp').classList.remove('bad')));
  $('#fTerms').onchange = () => $('#cTerms').classList.remove('bad');

  const V = {
    req: v => v.trim().length > 1,
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    phone: v => v.replace(/\D/g, '').replace(/^48(?=\d{9}$)/, '').length === 9,
    zip: v => /^\d{2}-\d{3}$/.test(v),
    nip: v => /^\d{10}$/.test(v),
    reqinv: v => v.trim().length > 1,
    blik: v => /^\d{6}$/.test(v.replace(/\s/g, '')),
    card: v => /^\d{16}$/.test(v.replace(/\s/g, '')),
    exp: v => { const m = /^(\d{2})\/(\d{2})$/.exec(v); if (!m) return false; const mm = +m[1], yy = 2000 + +m[2]; if (mm < 1 || mm > 12) return false; const now = new Date(); return yy > now.getFullYear() || (yy === now.getFullYear() && mm >= now.getMonth() + 1); },
    cvc: v => /^\d{3}$/.test(v)
  };
  function validate() {
    let first = null;
    const check = el => { const ok = V[el.dataset.v](el.value); el.closest('.inp').classList.toggle('bad', !ok); if (!ok && !first) first = el; };
    ['#fEmail', '#fPhone', '#fFirst', '#fLast', '#fStreet', '#fZip', '#fCity'].forEach(id => check($(id)));
    if ($('#fInvoice').checked) ['#fNip', '#fCompany'].forEach(id => check($(id)));
    if (inst && (!co.date || !co.slot)) { $('#whenErr').style.display = 'block'; if (!first) first = $('#fsWhen'); }
    if (co.pay === 'blik') check($('#fBlik'));
    if (co.pay === 'card') ['#fCard', '#fExp', '#fCvc'].forEach(id => check($(id)));
    if (!$('#fTerms').checked) { $('#cTerms').classList.add('bad'); if (!first) first = $('#fTerms'); }
    $('#coErr').classList.toggle('show', !!first);
    if (first) { first.scrollIntoView({ behavior: 'smooth', block: 'center' }); if (first.focus) setTimeout(() => first.focus({ preventScroll: true }), 400); }
    return !first;
  }
  $('#coForm').addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) return;
    $$('.place-order').forEach(b => { b.disabled = true; b.innerHTML = `<span class="spin"></span> ${co.pay === 'blik' ? 'Potwierdź w aplikacji banku' : 'Przetwarzanie płatności'}`; });
    setTimeout(() => {
      const tt = totals();
      S.order = {
        no: 'CL-' + String(new Date().getFullYear()).slice(2) + String(Math.floor(100000 + Math.random() * 899999)),
        name: $('#fFirst').value.trim(), email: $('#fEmail').value.trim(),
        addr: `${$('#fStreet').value.trim()}, ${$('#fZip').value} ${$('#fCity').value.trim()}`,
        install: inst, date: co.date, slot: co.slot, delivery: co.delivery, pay: co.pay, total: tt.total,
        lines: S.cart.map(l => ({ title: lineTitle(l), qty: l.qty, price: linePrice(l) }))
      };
      S.cart = []; S.promo = null; save();
      location.replace(withState('zamowienie.html'));
    }, 1800);
  });
}

/* =====================================================
   ZAMÓWIENIE · potwierdzenie
   ===================================================== */
function done() {
  const o = S.order;
  if (!o) { location.replace('index.html'); return; }
  const PAYN = { blik: 'BLIK', card: 'Karta płatnicza', raty: `Raty 0% (${RATY} × ${zl2(o.total / RATY)})`, transfer: 'Przelew tradycyjny' };
  const steps = o.install ? [
    ['Zamówienie przyjęte', 'Potwierdzenie wysłaliśmy na ' + o.email, true],
    ['Wideoweryfikacja', 'Technik zadzwoni w ciągu 24 godzin, by umówić 15-minutową rozmowę.'],
    ['Montaż', `${fmtDate(o.date)}, ${o.slot}. Urządzenie przywiezie instalator.`],
    ['Pierwszy chłodny wieczór', 'Pobierz aplikację Climoo Home, by sparować X5 od razu po montażu.']
  ] : [
    ['Zamówienie przyjęte', 'Potwierdzenie wysłaliśmy na ' + o.email, true],
    ['Pakowanie', 'Wysyłka w ciągu 24 godzin.'],
    [o.delivery === 'pickup' ? 'Odbiór w Climoo Studio' : 'Dostawa kurierem', o.delivery === 'pickup' ? 'Powiadomimy cię SMS-em, gdy paczka będzie gotowa.' : 'Kurier wniesie przesyłkę pod wskazany adres.'],
    ['Montaż', 'Pamiętaj, że instalację musi wykonać osoba z uprawnieniami F-gaz.']
  ];
  $('#doneBody').innerHTML = `
    <svg class="check" viewBox="0 0 96 96" fill="none" aria-hidden="true"><circle cx="48" cy="48" r="45" stroke="#0071e3" stroke-width="3"/><path d="M30 49l12 12 24-26" stroke="#0071e3" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <h1 class="h2">Dziękujemy, ${esc(o.name)}.<br><span class="grad">Chłód jest w drodze.</span></h1>
    <p class="lede">Twoje zamówienie zostało złożone. Wszystko, co ważne, znajdziesz też w e-mailu.</p>
    <span class="order-no">Numer zamówienia: ${o.no}</span>
    <ol class="timeline">${steps.map(s => `<li class="${s[2] ? 'ok' : ''}"><b>${s[0]}</b><span>${esc(s[1])}</span></li>`).join('')}</ol>
    <div class="done-sum">
      ${o.lines.map(l => `<div class="srow"><span>${esc(l.title)}${l.qty > 1 ? ' × ' + l.qty : ''}</span><span>${zl(l.price)}</span></div>`).join('')}
      <div class="srow" style="margin-top:8px"><span class="muted">Adres</span><span class="muted" style="text-align:right">${esc(o.addr)}</span></div>
      <div class="srow"><span class="muted">Płatność</span><span class="muted">${PAYN[o.pay]}</span></div>
      <div class="srow total"><span>${o.pay === 'transfer' ? 'Do zapłaty przelewem' : 'Zapłacono'}</span><span>${zl(o.total)}</span></div>
    </div>
    <div class="hero-cta" style="margin-top:40px"><a class="btn lg" href="index.html">Wróć do Climoo X5</a><a class="btn lg ghost" href="kup.html">Kup kolejny X5</a></div>`;
}

({ home, buy, bag, checkout, done })[PAGE]?.();
})();
