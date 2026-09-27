/**
 * Rozkład produktu na składniki (hero strony głównej i karta produktu).
 * Packshot (element LCP) jest widoczny od pierwszej klatki: animujemy tylko jego skalę.
 * Desktop: intro + pin/scrub. Mobile: samo intro, bez pinowania.
 */
import { gsap, D } from './gsap';

export function heroIngredients(isDesktop: boolean) {
  gsap.utils.toArray<HTMLElement>('[data-hero-visual]').forEach((root) => {
    const pack = root.querySelector<HTMLElement>('[data-hero-pack]');
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-hero-ing]'));
    if (!pack || !items.length) return;
    // Intro i scroll na osobnych elementach, żeby tweeny nie nadpisywały sobie wartości startowych
    const intros = items.map((i) => i.querySelector<HTMLElement>('[data-hero-intro]') ?? i);
    const captions = items.map((i) => i.querySelector('figcaption')).filter(Boolean) as HTMLElement[];

    const pr = pack.getBoundingClientRect();
    const cx = pr.left + pr.width / 2;
    const cy = pr.top + pr.height * 0.42;
    const offsets = items.map((el) => {
      const r = el.getBoundingClientRect();
      return { dx: cx - (r.left + r.width / 2), dy: cy - (r.top + r.height / 2) };
    });

    // Intro: składniki wychodzą z opakowania
    const intro = gsap.timeline({ defaults: { ease: 'hortex' } });
    intro.from(pack, { scale: 0.94, duration: D.hero });
    intro.from(intros, {
      x: (i) => offsets[i].dx,
      y: (i) => offsets[i].dy,
      scale: 0.25,
      rotation: () => gsap.utils.random(-120, 120),
      // Bez autoAlpha: składniki mogą być elementem LCP na mobile, więc są widoczne od pierwszej klatki
      duration: D.hero,
      stagger: 0.07,
    }, 0.15);
    if (captions.length) intro.from(captions, { autoAlpha: 0, y: 8, duration: D.ui, stagger: 0.05 }, '-=0.5');

    const trigger = root.closest<HTMLElement>('[data-hero-pin]') ?? root;
    if (isDesktop && trigger.hasAttribute('data-hero-pin')) {
      // Scroll: składniki rozjeżdżają się szerzej po okręgu, packshot lekko się oddala
      const tl = gsap.timeline({
        scrollTrigger: { trigger, start: 'top top', end: '+=70%', pin: true, scrub: 0.6, anticipatePin: 1 },
      });
      // Wartości względne: GSAP wchłania pozycję z CSS translate do x/y, więc przesuwamy od niej
      tl.to(items, {
        x: (i) => `+=${-offsets[i].dx * 0.3}`,
        y: (i) => `+=${-offsets[i].dy * 0.3}`,
        scale: 1.08,
        ease: 'none',
      }, 0);
      tl.to(items.map((i) => i.querySelector('img')), { rotation: (i) => `+=${i % 2 ? 20 : -20}`, ease: 'none' }, 0);
      tl.to(pack, { scale: 0.9, rotation: -3, ease: 'none' }, 0);
      const copy = trigger.querySelector('[data-hero-copy]');
      if (copy) tl.to(copy, { y: -40, autoAlpha: 0.5, ease: 'none' }, 0);
    } else {
      // Mobile: delikatny parallax zamiast pinowania
      gsap.to(items, { y: (i) => `+=${i % 2 ? -24 : -12}`, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true } });
    }
  });
}
