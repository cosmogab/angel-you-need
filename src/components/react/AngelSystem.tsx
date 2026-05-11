import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import Cumul from '~/components/svg/gabo/Cumul';
import CumulHomeV1 from '~/components/svg/gabo/art/CumulHomeV1';
import SmokePuff from '~/components/svg/gabo/SmokePuff';
import { GaboPose1, GaboPose2 } from '~/components/svg/gabo/poses';
import type { AngelState, MischiefAction } from '~/lib/angel-state';
import type { Vec2 } from './sky-types';

interface Props {
  /** World-coord anchor point. Gabo+Cumul are drawn centered on this point. */
  position: Vec2;
  /** Controlled state — set by the parent SkyMap via useAngelState + useFlyTo. */
  state: AngelState;
  /** Mischief action (only meaningful when state === 'idle-mischief'). */
  mischief?: MischiefAction | null;
  /**
   * Flight bearing in degrees (atan2(dy,dx)*180/π). Used during `traveling`
   * to lean Gabo into the wind via `--flight-angle`/`--flight-flip`.
   */
  flightAngleDeg?: number;
}

type PoseKey = 'pose-1' | 'pose-2';

/** Duration the kanji impact overlay stays mounted on any pose change.
 *  Must match the `kanji-snap` / `kanji-spatter-scatter` durations in
 *  src/styles/global.css — change them together. */
const PUFF_DURATION_MS = 1000;

/** Wait this long after a `poseKey` change before firing the puff. If
 *  `poseKey` flips again within the window (micro-stop / state flicker
 *  / glitch), the trigger is dropped — only stable transitions get a
 *  puff. Short enough to still feel snappy on legitimate clicks. */
const PUFF_DEBOUNCE_MS = 80;

/**
 * Picks the pose to render for the current state.
 *
 * - `idle-home` / `idle-mischief` / `arriving` / `parked`: pos1 (base outfit, next to Cumul)
 * - `traveling`: pos2 (clinging to Cumul in flight)
 *
 * V1 ships only pos1/pos2; project-specific costumes are deferred.
 */
function resolvePose(state: AngelState): { key: PoseKey; Component: ComponentType } {
  switch (state) {
    case 'traveling':
      return { key: 'pose-2', Component: GaboPose2 };
    case 'idle-home':
    case 'idle-mischief':
    case 'arriving':
    case 'parked':
      return { key: 'pose-1', Component: GaboPose1 };
  }
}

/**
 * Anchors Gabo + Cumul as a single visual unit at a world coordinate.
 *
 * The current pose is derived from `state` via `resolvePose`. Pose changes
 * fire a POUF! overlay for PUFF_DURATION_MS to cover the crossfade
 * (SPEC §5 "Transitions").
 */
export default function AngelSystem({
  position,
  state,
  mischief = null,
  flightAngleDeg,
}: Props) {
  const { key: poseKey, Component: Pose } = resolvePose(state);

  // atan2 returns [-180,180]. Rotating Gabo by 180° would put him upside
  // down, so when the flight vector points "left" we mirror horizontally
  // and roll the angle back into [-90,90] for a natural lean.
  const gaboStyle: CSSProperties = {};
  if (flightAngleDeg !== undefined && state === 'traveling') {
    const flyingLeft = Math.abs(flightAngleDeg) > 90;
    const visualAngle = flyingLeft
      ? flightAngleDeg - 180 * Math.sign(flightAngleDeg)
      : flightAngleDeg;
    (gaboStyle as Record<string, string>)['--flight-angle'] = `${visualAngle}deg`;
    (gaboStyle as Record<string, string>)['--flight-flip'] = flyingLeft ? '-1' : '1';
  }

  const [puffVisible, setPuffVisible] = useState(false);
  // Bumped every time the puff actually fires. Used as React `key` on
  // <SmokePuff /> so consecutive transitions remount the node and
  // restart the CSS animations (and re-roll the random kanji). Without
  // it, a second `setPuffVisible(true)` while the puff is still mounted
  // is a no-op and the animation appears to "skip".
  const [puffNonce, setPuffNonce] = useState(0);
  const prevPoseKey = useRef<PoseKey>(poseKey);
  const puffTimerRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevPoseKey.current === poseKey) return;

    // Don't fire immediately — debounce so a brief flicker through a
    // transient pose (state machine micro-stop, click race) doesn't
    // trigger a spurious puff. If poseKey stabilizes back to the
    // previous value within the window, the cleanup below cancels the
    // pending trigger and the puff never plays.
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = window.setTimeout(() => {
      debounceTimerRef.current = null;
      prevPoseKey.current = poseKey;
      setPuffNonce((n) => n + 1);
      setPuffVisible(true);
      if (puffTimerRef.current !== null) {
        window.clearTimeout(puffTimerRef.current);
      }
      puffTimerRef.current = window.setTimeout(() => {
        setPuffVisible(false);
        puffTimerRef.current = null;
      }, PUFF_DURATION_MS);
    }, PUFF_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [poseKey]);

  // Unmount-only timer cleanup. Kept separate from the effect above so
  // re-runs on poseKey change don't kill the in-flight puff timer.
  useEffect(() => {
    return () => {
      if (puffTimerRef.current !== null) {
        window.clearTimeout(puffTimerRef.current);
      }
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      className="angel-system"
      data-angel-state={state}
      data-mischief={mischief ?? undefined}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="angel-system__cumul">
        {state === 'idle-home' || state === 'idle-mischief' ? (
          <CumulHomeV1 />
        ) : state === 'traveling' ? null : (
          // gabo2.svg already includes the cloud during traveling.
          <Cumul state={state} />
        )}
      </div>
      <div className="angel-system__gabo" key={poseKey} style={gaboStyle}>
        <Pose />
      </div>
      {puffVisible &&
        createPortal(
          // Rendered to <body> via a portal so the kanji is centered on
          // the viewport, not on Gabo. `.angel-system` lives inside the
          // pannable world and has its own transform, so any descendant
          // `position: fixed` would resolve relative to it instead of the
          // viewport — the portal sidesteps that. Safe during SSR because
          // `puffVisible` only flips to true inside an effect on the
          // client.
          <div className="kanji-puff-screen" aria-hidden="true">
            <SmokePuff key={puffNonce} />
          </div>,
          document.body
        )}
    </div>
  );
}
