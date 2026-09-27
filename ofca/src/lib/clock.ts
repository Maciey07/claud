import type { FestivalMode } from './festival-mode';

declare global {
  interface Window {
    __OFCA?: { mode: FestivalMode; now: string; preview: boolean; motionReady?: boolean };
    dataLayer?: unknown[];
  }
}

/** Tryb ustalony przez skrypt w <head> (daty lub podgląd ?mode=). */
export function currentMode(): FestivalMode {
  return window.__OFCA?.mode ?? (document.documentElement.dataset.mode as FestivalMode) ?? 'offseason';
}

/** „Teraz” dla logiki programu. W podglądzie przesunięte na symulowaną chwilę, dalej płynie w czasie rzeczywistym. */
const loadedAt = Date.now();
export function now(): Date {
  const base = window.__OFCA?.now ? Date.parse(window.__OFCA.now) : loadedAt;
  return new Date(base + (Date.now() - loadedAt));
}
