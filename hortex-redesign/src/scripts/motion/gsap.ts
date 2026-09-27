/* Jedna instancja GSAP z pluginami i krzywą marki. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import { CustomEase } from 'gsap/CustomEase';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, CustomEase, MotionPathPlugin);

// Krzywa "hortex": miękkie wyjście, odpowiednik cubic-bezier(0.22, 1, 0.36, 1) z tokenów.
CustomEase.create('hortex', 'M0,0 C0.22,1 0.36,1 1,1');

/** Trzy czasy z design systemu */
export const D = { ui: 0.4, reveal: 0.8, hero: 1.2 } as const;

gsap.defaults({ ease: 'hortex', duration: D.reveal });

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export { gsap, ScrollTrigger, SplitText, Flip, MotionPathPlugin };
