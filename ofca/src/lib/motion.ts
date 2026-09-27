/**
 * Katalog animacji globalnych (PRD 9.2). Uruchamiane raz na stronę z BaseLayout.
 * Każda animacja ma wariant dla prefers-reduced-motion (gsap.matchMedia).
 * Animujemy wyłącznie transform, opacity, clip-path i font-variation-settings (przez --wdth / --notch).
 */
import { gsap, ScrollTrigger, MOTION_OK, MOTION_REDUCED, loadSplitText } from './gsap';
import './clock';

/** Tylko elementy faktycznie wyrenderowane (sekcje innych trybów mają display: none). */
const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel)).filter((el) => el.getClientRects().length > 0);

export function initMotion() {
  if (window.__OFCA) window.__OFCA.motionReady = true;
  const mm = gsap.matchMedia();

  mm.add(MOTION_OK, () => {
    // M1 Rozciąganie: nagłówek rozciąga się z wąskiego do docelowej szerokości osi wdth
    $$('[data-stretch]').forEach((el) => {
      const target = Number(el.dataset.stretch) || 130;
      gsap.fromTo(el, { '--wdth': 62 }, {
        '--wdth': target,
        duration: 1.1,
        // szerokie nagłówki bez przestrzelenia osi (żadnego chwilowego wyjścia poza kontener)
        ease: target >= 140 ? 'power3.out' : 'back.out(1.3)',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });

    // M3 Chorągiewka: prostokąt → wcięcie, lekki zoom zdjęcia
    $$('[data-flag-anim]').forEach((el) => {
      const img = el.querySelector('img');
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
      tl.fromTo(el, { '--notch': '0%' }, { '--notch': el.dataset.flagAnim || '6%', duration: 0.9, ease: 'back.out(1.6)' });
      if (img) tl.fromTo(img, { scale: 1.12 }, { scale: 1, duration: 1.4, ease: 'power3.out' }, 0);
    });

    // Wejścia sekcji
    $$('[data-reveal]').forEach((el) => {
      gsap.from(el.children.length && el.dataset.reveal === 'stagger' ? el.children : el, {
        y: 40, opacity: 0, duration: 0.7, stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });

    // M8 Liczniki
    $$('[data-count-to]').forEach((el) => {
      const to = Number(el.dataset.countTo);
      const obj = { v: 0 };
      gsap.to(obj, {
        v: to, duration: 1.6, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => { el.textContent = Math.round(obj.v).toLocaleString('pl-PL'); },
      });
    });

    // M7 Lustrzane namioty
    $$('[data-tents]').forEach((el) => {
      const top = el.querySelector('[data-tent-top]');
      const bottom = el.querySelector('[data-tent-bottom]');
      const text = el.querySelector('[data-tent-text]');
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 80%', once: true } });
      if (top) tl.from(top, { yPercent: -110, duration: 0.8, ease: 'power4.out' }, 0);
      if (bottom) tl.from(bottom, { yPercent: 110, duration: 0.8, ease: 'power4.out' }, 0);
      if (text) tl.from(text, { scale: 1.6, opacity: 0, duration: 0.55, ease: 'back.out(2.2)' }, 0.45);
    });

    // M6 Odliczanie: cyfra przewraca się, postać się kołysze
    $$('[data-countdown]').forEach((el) => {
      const digits = el.querySelectorAll('[data-digit]');
      gsap.from(digits, { rotateX: -100, yPercent: -30, opacity: 0, transformOrigin: '50% 0%', duration: 0.9, stagger: 0.12, ease: 'back.out(1.7)', delay: 0.2 });
      const figure = el.querySelector('[data-sway]');
      if (figure) gsap.fromTo(figure, { rotate: -2.5 }, { rotate: 2.5, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 100%' });
    });

    // M4 Highliner: linka na górze ekranu, sylwetka idzie wraz ze scrollem
    const walker = document.querySelector<HTMLElement>('[data-highliner-walker]');
    if (walker) {
      gsap.to(walker, {
        x: () => window.innerWidth - walker.offsetWidth - 8,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.4, invalidateOnRefresh: true },
      });
      gsap.to(walker.querySelector('svg'), { rotate: 6, yoyo: true, repeat: -1, duration: 0.9, ease: 'sine.inOut', transformOrigin: '50% 100%' });
    }

    // M9 Marquee: przesuw, zwolnienie na hover, pauza poza ekranem
    $$('[data-marquee]').forEach((el) => {
      const track = el.querySelector<HTMLElement>('[data-marquee-track]');
      if (!track) return;
      const tween = gsap.to(track, { xPercent: -50, ease: 'none', duration: Number(el.dataset.marquee) || 30, repeat: -1 });
      el.addEventListener('mouseenter', () => gsap.to(tween, { timeScale: 0.25, duration: 0.4 }));
      el.addEventListener('mouseleave', () => gsap.to(tween, { timeScale: 1, duration: 0.4 }));
      ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? tween.play() : tween.pause()) });
    });

    // M14 Rozsypanie liter w hero
    const splitTargets = $$('[data-split]');
    if (splitTargets.length) {
      loadSplitText().then((SplitText) => {
        splitTargets.forEach((el) => {
          const split = SplitText.create(el, { type: 'chars,words', aria: 'auto' });
          // bez opacity: litery są widoczne od pierwszej klatki (LCP), tylko spadają i łapią pozycję
          gsap.from(split.chars, { yPercent: -120, rotate: () => gsap.utils.random(-25, 25), duration: 0.9, ease: 'bounce.out', stagger: { each: 0.03, from: 'random' } });
        });
      });
    }
  });

  mm.add(MOTION_REDUCED, () => {
    // Bez ruchu: krótkie przenikanie (≤ 200 ms), bez parallaksy, M2/M4/M9/M14 wyłączone.
    $$('[data-reveal], [data-tents] [data-tent-text]').forEach((el) => {
      gsap.from(el, { opacity: 0, duration: 0.2, ease: 'none', scrollTrigger: { trigger: el, start: 'top 95%', once: true } });
    });
  });
}
