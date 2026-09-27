/** Reveal zdjęć: clip-path od dołu + scale 1.08 → 1 obrazu. Stan startowy w CSS (html.motion-ok). */
import { gsap, ScrollTrigger, D } from './gsap';

export function imageReveal() {
  const els = gsap.utils.toArray<HTMLElement>('[data-reveal]');
  if (!els.length) return;
  ScrollTrigger.batch(els, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, { clipPath: 'inset(0% 0% 0% 0%)', duration: D.reveal, stagger: 0.08 });
      gsap.to(batch.map((b) => b.querySelector('img')).filter(Boolean), { scale: 1, duration: D.hero, stagger: 0.08 });
    },
  });
  // Elementy już w widoku przy starcie
  ScrollTrigger.refresh();
}

/** Wariant bez ruchu: zdjęcia od razu widoczne */
export function imageRevealStatic() {
  gsap.set('[data-reveal]', { clipPath: 'none' });
  gsap.set('[data-reveal] > img', { scale: 1 });
}
