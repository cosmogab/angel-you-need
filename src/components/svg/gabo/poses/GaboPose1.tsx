import GaboBodyV1 from '~/components/svg/gabo/art/GaboBodyV1';
// import HaloV1 from '~/components/svg/gabo/art/HaloV1';
import WingV1 from '~/components/svg/gabo/art/WingV1';

/**
 * pos1 — Gabo standing (idle-home, idle-mischief).
 *
 * V1 composition of SVG layers (cloud lives on AngelSystem.cumul slot).
 * Halo temporarily disabled — the V1 art's intrinsic size inside its
 * 1024 viewBox renders far too large in the layered composition; needs
 * a sizing/positioning pass before re-enabling.
 */
export default function GaboPose1() {
  return (
    <div className="gabo-pose1" data-pose="1" aria-hidden="true">
      <WingV1 className="gabo-pose1__wing gabo-pose1__wing--left" />
      <WingV1 className="gabo-pose1__wing gabo-pose1__wing--right" />
      <GaboBodyV1 className="gabo-pose1__body" />
      {/* <HaloV1 className="gabo-pose1__halo" /> */}
    </div>
  );
}
