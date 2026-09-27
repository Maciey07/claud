/**
 * Warstwa ruchu. Wszystko przez gsap.matchMedia(): osobne warianty desktop / mobile
 * i pusty wariant dla prefers-reduced-motion. matchMedia sam robi revert przy zmianie warunków.
 */
import { gsap, ScrollTrigger } from './gsap';
import { heroIngredients } from './heroIngredients';
import { imageReveal, imageRevealStatic } from './imageReveal';
import { headingSplit } from './headingSplit';
import { categoryMotifs } from './categoryMotifs';
import { parallax } from './parallax';
import { micro } from './micro';

function init() {
  const mm = gsap.matchMedia();
  mm.add(
    {
      isDesktop: '(min-width: 1025px) and (prefers-reduced-motion: no-preference)',
      isMobile: '(max-width: 1024px) and (prefers-reduced-motion: no-preference)',
      reduce: '(prefers-reduced-motion: reduce)',
    },
    (ctx) => {
      const { isDesktop, reduce } = ctx.conditions as Record<string, boolean>;
      if (reduce) {
        document.documentElement.classList.remove('motion-ok');
        imageRevealStatic();
        gsap.set('[data-split]', { visibility: 'visible' });
        return;
      }
      heroIngredients(isDesktop);
      imageReveal();
      headingSplit();
      categoryMotifs();
      parallax();
      const cleanupMicro = micro();
      return () => cleanupMicro();
    },
  );
  // Przy nawigacji (bfcache) sprzątamy kontekst
  window.addEventListener('pagehide', (e) => { if (!e.persisted) mm.revert(); });
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => document.fonts.ready.then(init));
else document.fonts.ready.then(init);
