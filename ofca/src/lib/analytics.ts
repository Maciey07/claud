import { readJson } from './storage';

export type AnalyticsEvent =
  | 'view_program' | 'filter_program' | 'add_to_plan' | 'export_ics' | 'open_place' | 'navigate_click'
  | 'view_item' | 'add_to_cart' | 'begin_checkout' | 'purchase' | 'lang_switch';

export const CONSENT_KEY = 'ofca-consent-v1';
export interface Consent { necessary: true; analytics: boolean; decided: boolean }

/** Zdarzenia trafiają do dataLayer (GA4 lub Plausible) tylko po zgodzie na analitykę (PRD 10.7). */
export function track(name: AnalyticsEvent, params: Record<string, unknown> = {}) {
  const consent = readJson<Consent | null>(CONSENT_KEY, null);
  if (!consent?.analytics) return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: name, ...params });
}
