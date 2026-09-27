/**
 * Motywy kategorii (jak u Dawtony, ale z wyciętych ilustracji zamiast renderów 3D).
 * Każdy motyw startuje, gdy sekcja wchodzi w widok. Wariant statyczny = kompozycja z CSS.
 */
import { gsap, ScrollTrigger, D } from './gsap';

type Ctx = { root: HTMLElement; pieces: HTMLElement[] };

const center = (el: Element) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

const motifs: Record<string, (c: Ctx) => gsap.core.Timeline | gsap.core.Tween | void> = {
  // Warzywa: różyczki, groszek i fasolka "wysypują się" z opakowania
  warzywa({ root, pieces }) {
    const origin = root.querySelector('[data-motif-origin]') ?? root;
    const o = center(origin);
    const or = origin.getBoundingClientRect();
    return gsap.timeline().from(pieces, {
      x: (i, el) => o.x - center(el).x,
      y: (i, el) => or.top + or.height * 0.18 - center(el).y,
      scale: 0.2,
      rotation: () => gsap.utils.random(-200, 200),
      autoAlpha: 0,
      duration: D.hero,
      stagger: 0.06,
      ease: 'back.out(1.3)',
    });
  },
  // Owoce: spadają i lekko się odbijają
  owoce({ root, pieces }) {
    const top = root.getBoundingClientRect().top;
    return gsap.timeline().from(pieces, {
      y: (i, el) => top - el.getBoundingClientRect().bottom - 40,
      rotation: () => gsap.utils.random(-60, 60),
      autoAlpha: 0,
      duration: 1.1,
      stagger: { each: 0.08, from: 'random' },
      ease: 'bounce.out',
    });
  },
  // Zupy: składniki wpadają po łuku do garnka widzianego z góry
  zupy({ root, pieces }) {
    const pot = root.querySelector('[data-pot]') ?? root;
    const p = center(pot);
    const tl = gsap.timeline();
    pieces.forEach((el, i) => {
      const c = center(el);
      const side = i % 2 ? 1 : -1;
      const sx = p.x - c.x + side * (180 + i * 18);
      const sy = p.y - c.y - 220;
      gsap.set(el, { x: sx, y: sy, scale: 1.35, autoAlpha: 0 });
      tl.to(el, {
        motionPath: { path: [{ x: sx * 0.4, y: sy - 60 }, { x: 0, y: 0 }], curviness: 1.4 },
        scale: 1,
        autoAlpha: 1,
        rotation: side * 180,
        duration: 1,
        ease: 'power2.in',
      }, i * 0.1);
    });
    const liquid = root.querySelector('[data-pot-liquid]');
    if (liquid) tl.fromTo(liquid, { scale: 0.96 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' }, '-=0.2');
    return tl;
  },
  // Dania i frytki: talerz obraca się, składniki układają się wokół
  dania({ root, pieces }) {
    const plate = root.querySelector('[data-plate]');
    const p = center(plate ?? root);
    const tl = gsap.timeline();
    if (plate) tl.from(plate, { rotation: -140, scale: 0.9, duration: D.hero });
    tl.from(pieces, {
      x: (i, el) => p.x - center(el).x,
      y: (i, el) => p.y - center(el).y,
      scale: 0,
      rotation: -90,
      duration: D.reveal,
      stagger: 0.07,
    }, plate ? 0.25 : 0);
    return tl;
  },
  // Lody (kampania): gałki unoszą się, zatrzymane poza widokiem
  lody({ root, pieces }) {
    const tweens = pieces.map((el, i) =>
      gsap.to(el, { y: -16 - (i % 3) * 6, rotation: i % 2 ? 4 : -4, duration: 2 + (i % 3) * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true }),
    );
    ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'bottom top', onToggle: (self) => tweens.forEach((t) => (self.isActive ? t.play() : t.pause())) });
  },
};

export function categoryMotifs() {
  gsap.utils.toArray<HTMLElement>('[data-motif]').forEach((root) => {
    const pieces = Array.from(root.querySelectorAll<HTMLElement>('[data-piece]'));
    const fn = motifs[root.dataset.motif!];
    if (!fn || !pieces.length) return;
    if (root.dataset.motif === 'lody') { fn({ root, pieces }); return; }
    // Budujemy animację dopiero przy wejściu w widok (pozycje liczone z aktualnego layoutu)
    gsap.set(pieces, { autoAlpha: 0 });
    const trigger = (root.dataset.motifTrigger && root.querySelector(root.dataset.motifTrigger)) || root;
    ScrollTrigger.create({
      trigger,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.set(pieces, { autoAlpha: 1 });
        fn({ root, pieces });
      },
    });
  });
}
