import { atom } from 'nanostores';
import { readJson, writeJson } from './storage';

const KEY = 'ofca-plan-2026';
export const plan = atom<string[]>([]);

let hydrated = false;
export function hydratePlan() {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  plan.set(readJson<string[]>(KEY, []));
  plan.listen((ids) => writeJson(KEY, ids));
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) plan.set(readJson<string[]>(KEY, []));
  });
}

export function togglePlan(id: string): boolean {
  const ids = plan.get();
  const added = !ids.includes(id);
  plan.set(added ? [...ids, id] : ids.filter((x) => x !== id));
  return added;
}

export interface Slot { id: string; start: string; end: string }

/** Pary wydarzeń z planu, które nakładają się w czasie. */
export function overlaps(slots: Slot[]): Map<string, string[]> {
  const out = new Map<string, string[]>();
  const sorted = [...slots].sort((a, b) => a.start.localeCompare(b.start));
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i], b = sorted[j];
      if (Date.parse(b.start) >= Date.parse(a.end)) break;
      out.set(a.id, [...(out.get(a.id) ?? []), b.id]);
      out.set(b.id, [...(out.get(b.id) ?? []), a.id]);
    }
  }
  return out;
}
