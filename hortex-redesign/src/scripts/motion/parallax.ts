/** Parallax dekoracyjnych składników: małe przesunięcia y, maks. 60 px */
import { gsap } from './gsap';

export function parallax() {
  gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
    const amount = Math.min(60, Number(el.dataset.parallax) || 40);
    gsap.fromTo(el, { y: amount / 2 }, { y: -amount / 2, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}
