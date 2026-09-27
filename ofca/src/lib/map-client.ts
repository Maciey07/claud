import { gsap, loadDraggable, loadInertia, prefersReducedMotion } from './gsap';
import { now } from './clock';
import { formatTime } from './format';
import { readJson, writeJson } from './storage';
import { track } from './analytics';

interface MapData {
  events: { id: string; loc: string; title: string; start: string; end: string }[];
  lang: 'pl' | 'en';
  nothing: string;
  nothingNext: string;
  touchHint: string;
  wheelHint: string;
}

const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;
const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));

const MIN = 1;
const MAX = 4;
const MAP_W = 1200;
const MAP_H = 900;

export async function initMap() {
  const page = $('[data-map-page]');
  const data = JSON.parse($('[data-map-data]').textContent!) as MapData;
  const stage = $('[data-stage]', page);
  const viewport = $('[data-viewport]', page);
  const layer = $('[data-map-layer]', page);
  const pins = $$<HTMLButtonElement>('[data-pin]', page);
  const panel = $('[data-panel]', page);
  const hint = $('[data-hint]', page);
  const reduced = prefersReducedMotion();
  const isDesktop = () => window.matchMedia('(min-width: 900px)').matches;
  const placeParam = data.lang === 'pl' ? 'miejsce' : 'place';

  // ---------- Geometria ----------
  const st = { x: 0, y: 0, s: 1 };
  let lw = 0, lh = 0, vw = 0, vh = 0;

  const measure = () => {
    vw = viewport.clientWidth;
    vh = viewport.clientHeight;
    // mapa „contain” przy s = 1, ale nie mniejsza niż 560 px szerokości (na telefonie od razu da się przesuwać)
    lw = Math.max(Math.min(vw, vh * (MAP_W / MAP_H)), Math.min(560, vw * 1.5));
    lh = lw * (MAP_H / MAP_W);
    layer.style.width = `${lw}px`;
    layer.style.height = `${lh}px`;
  };
  const bounds = (s = st.s) => {
    const w = lw * s, h = lh * s, m = 60;
    return {
      minX: Math.min(0, vw - w) - m, maxX: Math.max(0, vw - w) + m,
      minY: Math.min(0, vh - h) - m, maxY: Math.max(0, vh - h) + m,
    };
  };
  const clamp = () => {
    const b = bounds();
    st.x = Math.min(b.maxX, Math.max(b.minX, st.x));
    st.y = Math.min(b.maxY, Math.max(b.minY, st.y));
  };
  const apply = () => {
    layer.style.transform = `translate3d(${st.x}px, ${st.y}px, 0) scale(${st.s})`;
    layer.style.setProperty('--inv', String(1 / st.s));
    layer.classList.toggle('show-labels', st.s >= 2.2);
  };
  const center = () => {
    st.s = MIN;
    st.x = (vw - lw) / 2;
    st.y = (vh - lh) / 2;
  };
  const tweenTo = (to: Partial<typeof st>, duration = 0.6) => {
    gsap.killTweensOf(st);
    if (reduced) { Object.assign(st, to); clamp(); apply(); return; }
    gsap.to(st, { ...to, duration, ease: 'power3.inOut', onUpdate: apply });
  };
  const zoomAt = (factor: number, px = vw / 2, py = vh / 2, animate = true) => {
    const s = Math.min(MAX, Math.max(MIN, st.s * factor));
    const k = s / st.s;
    const target = { s, x: px - (px - st.x) * k, y: py - (py - st.y) * k };
    if (animate) {
      const prev = { ...st };
      Object.assign(st, target); clamp();
      const clamped = { ...st };
      Object.assign(st, prev);
      tweenTo(clamped, 0.35);
    } else {
      Object.assign(st, target); clamp(); apply();
    }
  };
  const focusOn = (id: string, animate = true) => {
    const pin = pins.find((p) => p.dataset.pin === id);
    if (!pin) return;
    const fx = parseFloat(pin.style.left) / 100, fy = parseFloat(pin.style.top) / 100;
    const s = Math.max(st.s, 2);
    const areaW = isDesktop() && !panel.hidden ? vw - 26 * 16 : vw;
    const areaH = !isDesktop() && !panel.hidden ? vh * 0.3 : vh;
    const prev = { ...st };
    Object.assign(st, { s, x: areaW / 2 - fx * lw * s, y: areaH / 2 + (isDesktop() ? 0 : 20) - fy * lh * s });
    clamp();
    const target = { ...st };
    Object.assign(st, prev);
    if (animate) tweenTo(target); else { Object.assign(st, target); apply(); }
  };

  measure();
  center();
  apply();
  new ResizeObserver(() => { const rel = { x: (st.x - (vw - lw * st.s) / 2), y: (st.y - (vh - lh * st.s) / 2) }; measure(); st.x = (vw - lw * st.s) / 2 + rel.x; st.y = (vh - lh * st.s) / 2 + rel.y; clamp(); apply(); }).observe(viewport);

  // ---------- Pan / pinch / inercja (M12) ----------
  await loadInertia();
  const pointers = new Map<number, { x: number; y: number }>();
  let last = { x: 0, y: 0, t: 0 };
  let vel = { x: 0, y: 0 };
  let pinchDist = 0;
  let moved = 0;

  viewport.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    gsap.killTweensOf(st);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    last = { x: e.clientX, y: e.clientY, t: performance.now() };
    vel = { x: 0, y: 0 };
    moved = 0;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
    }
  });
  viewport.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId)!;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
      moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 6 && !viewport.hasPointerCapture(e.pointerId)) viewport.setPointerCapture(e.pointerId);
      st.x += dx; st.y += dy;
      const t = performance.now(), dt = Math.max(1, t - last.t);
      vel = { x: ((e.clientX - last.x) / dt) * 1000, y: ((e.clientY - last.y) / dt) * 1000 };
      last = { x: e.clientX, y: e.clientY, t };
      apply();
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const rect = viewport.getBoundingClientRect();
      if (pinchDist) zoomAt(dist / pinchDist, (a.x + b.x) / 2 - rect.left, (a.y + b.y) / 2 - rect.top, false);
      pinchDist = dist;
      moved = 99;
    }
  });
  const end = (e: PointerEvent) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    pinchDist = 0;
    if (pointers.size === 0 && moved > 6) {
      const b = bounds();
      if (reduced || performance.now() - last.t > 80) { clamp(); tweenTo({ x: st.x, y: st.y }, 0.2); return; }
      gsap.to(st, {
        inertia: { x: { velocity: vel.x, min: b.minX, max: b.maxX }, y: { velocity: vel.y, min: b.minY, max: b.maxY } },
        onUpdate: apply,
      });
    }
  };
  viewport.addEventListener('pointerup', end);
  viewport.addEventListener('pointercancel', end);
  // Klik po przeciągnięciu nie otwiera pinu
  viewport.addEventListener('click', (e) => { if (moved > 6) { e.stopPropagation(); e.preventDefault(); } }, true);

  // ---------- Zoom: kółko z modyfikatorem, przyciski, klawiatura ----------
  const showHint = (text: string, key?: string) => {
    if (key && readJson<boolean>(key, false)) return;
    $('[data-hint-text]', hint).textContent = text;
    hint.hidden = false;
    hint.dataset.key = key ?? '';
  };
  $('[data-hint-ok]', hint).addEventListener('click', () => { hint.hidden = true; if (hint.dataset.key) writeJson(hint.dataset.key, true); viewport.focus(); });
  let wheelHintTimer = 0;
  viewport.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const rect = viewport.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * 0.0022), e.clientX - rect.left, e.clientY - rect.top, false);
    } else {
      showHint(data.wheelHint);
      clearTimeout(wheelHintTimer);
      wheelHintTimer = window.setTimeout(() => (hint.hidden = true), 1800);
    }
  }, { passive: false });
  if (window.matchMedia('(pointer: coarse)').matches) showHint(data.touchHint, 'ofca-map-touch-hint');

  $$('[data-zoom]', page).forEach((b) => b.addEventListener('click', () => {
    const z = b.dataset.zoom;
    if (z === 'in') zoomAt(1.5);
    else if (z === 'out') zoomAt(1 / 1.5);
    else { const prev = { ...st }; center(); const target = { ...st }; Object.assign(st, prev); tweenTo(target); }
  }));
  viewport.addEventListener('keydown', (e) => {
    const step = 80;
    const map: Record<string, () => void> = {
      ArrowLeft: () => tweenTo({ x: Math.min(bounds().maxX, st.x + step) }, 0.25),
      ArrowRight: () => tweenTo({ x: Math.max(bounds().minX, st.x - step) }, 0.25),
      ArrowUp: () => tweenTo({ y: Math.min(bounds().maxY, st.y + step) }, 0.25),
      ArrowDown: () => tweenTo({ y: Math.max(bounds().minY, st.y - step) }, 0.25),
      '+': () => zoomAt(1.5), '=': () => zoomAt(1.5), '-': () => zoomAt(1 / 1.5), '0': () => { const p = { ...st }; center(); const t = { ...st }; Object.assign(st, p); tweenTo(t); },
    };
    if (e.target !== viewport && e.key.startsWith('Arrow')) return; // strzałki na pinie nie przesuwają mapy
    const fn = map[e.key];
    if (fn) { e.preventDefault(); fn(); }
  });

  // ---------- Karta miejsca (PlaceSheet, M11) ----------
  const events = data.events.slice().sort((a, b) => a.start.localeCompare(b.start));
  const fillLive = (id: string) => {
    const box = page.querySelector<HTMLElement>(`[data-live-box="${id}"]`);
    if (!box) return;
    const t = now().getTime();
    const here = events.filter((e) => e.loc === id);
    const cur = here.filter((e) => Date.parse(e.start) <= t && Date.parse(e.end) > t);
    const next = here.find((e) => Date.parse(e.start) > t);
    const fmt = (e: MapData['events'][number]) => {
      const day = new Intl.DateTimeFormat(data.lang === 'pl' ? 'pl-PL' : 'en-GB', { timeZone: 'Europe/Warsaw', weekday: 'short', day: '2-digit', month: '2-digit' }).format(new Date(e.start));
      return `${e.title}, ${day} ${formatTime(e.start)}–${formatTime(e.end)}`;
    };
    $('[data-live-now]', box).textContent = cur.length ? cur.map(fmt).join(' · ') : data.nothing;
    $('[data-live-next]', box).textContent = next ? fmt(next) : data.nothingNext;
  };

  let openId: string | null = null;
  let Draggable: Awaited<ReturnType<typeof loadDraggable>>['Draggable'] | null = null;
  loadDraggable().then((m) => {
    Draggable = m.Draggable;
    Draggable.create(panel, {
      type: 'y', trigger: $('[data-panel-handle]', panel), bounds: { minY: 0, maxY: 800 },
      onDragEnd() { if (this.y > 90) closePanel(); else gsap.to(panel, { y: 0, duration: 0.3, ease: 'back.out(1.6)' }); },
    });
  });

  const openPlace = (id: string, { animate = true, focus = true } = {}) => {
    const wasHidden = panel.hidden;
    openId = id;
    $$('[data-place]', panel).forEach((a) => (a.hidden = a.dataset.place !== id));
    pins.forEach((p) => p.setAttribute('aria-expanded', String(p.dataset.pin === id)));
    fillLive(id);
    panel.hidden = false;
    gsap.set(panel, { y: 0 });
    if (wasHidden && animate && !reduced) gsap.from(panel, isDesktop() ? { x: 60, opacity: 0, duration: 0.45, ease: 'power3.out' } : { yPercent: 100, duration: 0.5, ease: 'power4.out' });
    focusOn(id, animate);
    if (focus) panel.focus();
    const url = new URL(location.href);
    url.searchParams.set(placeParam, id);
    history.replaceState(null, '', url);
    track('open_place', { id });
  };
  const closePanel = () => {
    if (panel.hidden) return;
    const id = openId;
    const done = () => {
      panel.hidden = true;
      gsap.set(panel, { clearProps: 'transform,opacity' });
      pins.forEach((p) => p.setAttribute('aria-expanded', 'false'));
      const url = new URL(location.href);
      url.searchParams.delete(placeParam);
      history.replaceState(null, '', url);
      pins.find((p) => p.dataset.pin === id)?.focus();
      openId = null;
    };
    if (reduced) done();
    else gsap.to(panel, isDesktop() ? { x: 60, opacity: 0, duration: 0.25, onComplete: done } : { yPercent: 100, duration: 0.3, ease: 'power2.in', onComplete: done });
  };
  pins.forEach((p) => p.addEventListener('click', () => openPlace(p.dataset.pin!)));
  $('[data-panel-close]', panel).addEventListener('click', closePanel);
  page.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { e.preventDefault(); closePanel(); } });
  $$('[data-nav-link]', panel).forEach((a) => a.addEventListener('click', () => track('navigate_click', { id: openId })));

  // ---------- Warstwy (piny wyskakują sekwencyjnie) ----------
  const active = new Set($$('[data-layer]', page).map((b) => b.dataset.layer!));
  const layerCount = $('[data-layer-count]', page);
  const applyLayers = (animate: boolean) => {
    const appearing: HTMLElement[] = [];
    pins.forEach((p) => {
      const on = p.dataset.layers!.split(' ').some((l) => active.has(l));
      if (on && p.classList.contains('is-off')) appearing.push(p);
      p.classList.toggle('is-off', !on);
    });
    $$('[data-list-item]', page).forEach((li) => (li.hidden = !li.dataset.layers!.split(' ').some((l) => active.has(l))));
    $$('[data-layer]', page).forEach((b) => b.setAttribute('aria-pressed', String(active.has(b.dataset.layer!))));
    const total = $$('[data-layer]', page).length;
    layerCount.textContent = active.size === total ? '' : `(${active.size}/${total})`;
    if (animate && !reduced && appearing.length) {
      gsap.fromTo(appearing.map((p) => p.querySelector('svg')), { scale: 0, y: 20 }, { scale: 1, y: 0, duration: 0.5, ease: 'back.out(2.4)', stagger: 0.06, transformOrigin: '50% 100%' });
    }
    if (openId && pins.find((p) => p.dataset.pin === openId)?.classList.contains('is-off')) closePanel();
  };
  $$('[data-layer]', page).forEach((b) => b.addEventListener('click', () => {
    const id = b.dataset.layer!;
    if (active.has(id)) active.delete(id); else active.add(id);
    applyLayers(true);
  }));

  // ---------- Widok Mapa / Lista ----------
  const listView = $('[data-list-view]', page);
  const setView = (v: 'map' | 'list') => {
    stage.hidden = v === 'list';
    listView.hidden = v !== 'list';
    $$('[data-view]', page).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
    if (v === 'map') { measure(); clamp(); apply(); }
  };
  $$('[data-view]', page).forEach((b) => b.addEventListener('click', () => setView(b.dataset.view as 'map' | 'list')));
  $$('[data-show-on-map]', page).forEach((b) => b.addEventListener('click', () => {
    setView('map');
    stage.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    openPlace(b.dataset.showOnMap!);
  }));

  // ---------- Start ----------
  applyLayers(false);
  const loader = $('[data-map-loader]', page);
  loader.classList.add('is-done');
  if (!reduced) gsap.from(pins.map((p) => p.querySelector('svg')), { scale: 0, y: 24, duration: 0.55, ease: 'back.out(2.2)', stagger: 0.04, transformOrigin: '50% 100%', delay: 0.1 });
  const deep = new URLSearchParams(location.search).get(placeParam) ?? new URLSearchParams(location.search).get('miejsce');
  if (deep && pins.some((p) => p.dataset.pin === deep)) openPlace(deep, { animate: false, focus: false });
}
