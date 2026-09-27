/** Filtrowanie list: Flip.from() przy zmianie filtra; natychmiastowa zmiana przy reduced motion */
import { gsap, Flip, reducedMotion } from './gsap';

export function flipUpdate(items: HTMLElement[], apply: () => void) {
  if (reducedMotion()) { apply(); return; }
  const state = Flip.getState(items);
  apply();
  Flip.from(state, {
    duration: 0.6,
    ease: 'hortex',
    absolute: true,
    nested: true,
    prune: true,
    onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.5 }),
  });
}
