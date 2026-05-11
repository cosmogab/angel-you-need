import type { CSSProperties } from 'react';

interface Props {
  /** True while Gabo is flying; lines fade in. */
  active: boolean;
  /**
   * Flight direction in degrees (CSS/CW, 0° = flying east).
   * Streaks in the container's local frame flow right-to-left, so when
   * the container is rotated by this angle the streaks trail Gabo
   * *opposite* his motion in screen space.
   */
  angleDeg: number;
}

const STREAK_COUNT = 14;

/**
 * Manga-style motion streaks. Screen-space overlay: 14 ink lines flow
 * along the rotated local −x axis of the container, so they always
 * trail Gabo from behind regardless of flight direction.
 */
export default function SpeedLines({ active, angleDeg }: Props) {
  const style = { '--streak-angle': `${angleDeg}deg` } as CSSProperties;
  return (
    <div className="speed-lines" data-visible={active} style={style} aria-hidden="true">
      {Array.from({ length: STREAK_COUNT }, (_, i) => (
        <span key={i} className="speed-line" />
      ))}
    </div>
  );
}
