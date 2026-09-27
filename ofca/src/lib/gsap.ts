/**
 * Jedyne miejsce rejestracji wtyczek GSAP (CLAUDE.md).
 * Rdzeń + ScrollTrigger ładujemy wszędzie, cięższe wtyczki dopiero na stronach, które ich potrzebują.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: 'power3.out', duration: 0.7 });

export { gsap, ScrollTrigger };

export const MOTION_OK = '(prefers-reduced-motion: no-preference)';
export const MOTION_REDUCED = '(prefers-reduced-motion: reduce)';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia(MOTION_REDUCED).matches;

export async function loadFlip() {
  const { Flip } = await import('gsap/Flip');
  gsap.registerPlugin(Flip);
  return Flip;
}

export async function loadDraggable() {
  const [{ Draggable }, { InertiaPlugin }] = await Promise.all([import('gsap/Draggable'), import('gsap/InertiaPlugin')]);
  gsap.registerPlugin(Draggable, InertiaPlugin);
  return { Draggable, InertiaPlugin };
}

export async function loadInertia() {
  const { InertiaPlugin } = await import('gsap/InertiaPlugin');
  gsap.registerPlugin(InertiaPlugin);
  return InertiaPlugin;
}

export async function loadMotionPath() {
  const { MotionPathPlugin } = await import('gsap/MotionPathPlugin');
  gsap.registerPlugin(MotionPathPlugin);
  return MotionPathPlugin;
}

export async function loadSplitText() {
  const { SplitText } = await import('gsap/SplitText');
  gsap.registerPlugin(SplitText);
  return SplitText;
}
