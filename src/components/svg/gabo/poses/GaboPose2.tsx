import GaboTravelingV1 from '~/components/svg/gabo/art/GaboTravelingV1';

/**
 * pos2 — Gabo clinging to Cumul in flight (traveling).
 *
 * V1 art is a single SVG that bundles Gabo + Cumul together. The
 * separate `<Cumul/>` slot is skipped in AngelSystem during traveling.
 * The directional rotation (lean into the flight vector + horizontal
 * flip when going left) lives on `.angel-system__gabo` via the
 * `--flight-angle` / `--flight-flip` CSS vars set by AngelSystem.
 */
export default function GaboPose2() {
  return (
    <div className="gabo-pose2" data-pose="2" aria-hidden="true">
      <GaboTravelingV1 className="gabo-pose2__art" />
    </div>
  );
}
