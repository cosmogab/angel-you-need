import { useCallback, useEffect, useRef } from 'react';
import type { Vec2 } from '~/components/react/sky-types';
import type { AngelState } from './angel-state';
import { gsap, prefersReducedMotion, registerGsap } from './gsap';

interface FlyOptions {
  /** Cloud slug being targeted. `null` means empty-sky landing. */
  slug?: string | null;
  /** Fires at `approachThreshold` progress — kept for future use. */
  onApproach?: () => void;
  /** Fires when the flight motion path finishes (before the arriving → settle tail). */
  onArrive?: (slug: string | null) => void;
  /** 0..1 fraction of flight path at which `onApproach` fires. Default 0.5. */
  approachThreshold?: number;
}

interface UseFlyToOptions {
  /** Called with the current tweened position on every frame. */
  onPositionChange: (pos: Vec2) => void;
  /** Called on state transitions (idle-home → traveling → arriving → idle-home/parked). */
  onStateChange: (state: AngelState) => void;
}

const ARRIVING_TAIL_MS = 620;

/**
 * Animates a curved flight between two world coords using GSAP MotionPath.
 *
 * The tween runs on a proxy `{x, y}`; each frame the consumer receives the
 * current position and can use it to position the angel + follow the camera.
 *
 * Duration scales with distance (clamped 0.9s … 2.2s). A single control
 * point perpendicular to the line gives a gentle arc — passing through
 * the midpoint offset by 18% of the flight length.
 *
 * Respects `prefers-reduced-motion`: snaps to target immediately, fires
 * callbacks synchronously, no tween.
 */
export function useFlyTo({ onPositionChange, onStateChange }: UseFlyToOptions) {
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const arrivingTimerRef = useRef<number | null>(null);

  const kill = useCallback(() => {
    tweenRef.current?.kill();
    tweenRef.current = null;
    if (arrivingTimerRef.current !== null) {
      window.clearTimeout(arrivingTimerRef.current);
      arrivingTimerRef.current = null;
    }
  }, []);

  useEffect(() => kill, [kill]);

  const flyTo = useCallback(
    (from: Vec2, to: Vec2, opts: FlyOptions = {}) => {
      registerGsap();
      kill();

      const slug = opts.slug ?? null;
      if (prefersReducedMotion()) {
        onPositionChange(to);
        opts.onApproach?.();
        opts.onArrive?.(slug);
        onStateChange(slug ? 'parked' : 'idle-home');
        return;
      }

      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 2) {
        onPositionChange(to);
        onStateChange('idle-home');
        return;
      }

      const duration = Math.max(0.9, Math.min(2.2, distance / 900));

      // Perpendicular arc — bulge the midpoint 18% of flight length
      // sideways (always in the same rotational direction so the
      // flight feels consistent).
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      const perp = 0.18;
      const ctlX = midX - dy * perp;
      const ctlY = midY + dx * perp;

      const proxy: Vec2 = { x: from.x, y: from.y };
      const threshold = opts.approachThreshold ?? 0.5;
      let approachFired = false;

      onStateChange('traveling');

      tweenRef.current = gsap.to(proxy, {
        motionPath: {
          path: [
            { x: from.x, y: from.y },
            { x: ctlX, y: ctlY },
            { x: to.x, y: to.y },
          ],
          curviness: 1.25,
        },
        duration,
        ease: 'power2.inOut',
        onUpdate: function () {
          onPositionChange({ x: proxy.x, y: proxy.y });
          if (!approachFired && this.progress() >= threshold) {
            approachFired = true;
            opts.onApproach?.();
          }
        },
        onComplete: () => {
          onStateChange('arriving');
          opts.onArrive?.(slug);
          arrivingTimerRef.current = window.setTimeout(() => {
            onStateChange(slug ? 'parked' : 'idle-home');
            tweenRef.current = null;
            arrivingTimerRef.current = null;
          }, ARRIVING_TAIL_MS);
        },
      });
    },
    [kill, onPositionChange, onStateChange]
  );

  return { flyTo, kill };
}
