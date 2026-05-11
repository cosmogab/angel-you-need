/**
 * Stable double-gradient sky covering the full 16000×11200 world.
 * Layer 1: horizontal time-of-day sweep (OKLCH-interpolated to keep
 * warm↔cool transitions clean). Layer 2: vertical atmospheric depth.
 * Both are static — the sky never animates and never reacts to Gabo's
 * position. Mount as the first child of `.sky-map__world` so it pans
 * with the islands.
 *
 * Authoritative reference: references/sky-mockup.html. Gradient values
 * live in --world-sky-horizontal / --world-sky-vertical (global.css).
 */
import { WORLD_H, WORLD_W } from './sky-types';

interface Props {
  className?: string;
}

export default function WorldSky({ className }: Props) {
  return (
    <div
      className={className ? `world-sky ${className}` : 'world-sky'}
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: WORLD_W,
        height: WORLD_H,
      }}
    >
      <div
        className="world-sky__horizontal"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--world-sky-horizontal)',
          pointerEvents: 'none',
        }}
      />
      <div
        className="world-sky__vertical"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--world-sky-vertical)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
