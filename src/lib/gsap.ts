import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

let registered = false;

export function registerGsap(): typeof gsap {
  if (!registered) {
    gsap.registerPlugin(MotionPathPlugin);
    gsap.defaults({
      ease: 'power2.out',
      duration: 0.42,
    });
    registered = true;
  }
  return gsap;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export { gsap, MotionPathPlugin };
