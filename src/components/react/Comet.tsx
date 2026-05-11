/**
 * Comet overlay. Lives outside `.sky-map__world` — fixed to the viewport
 * so it sweeps across the screen on a slow loop independently of camera
 * pan. Animation, timing, and reduced-motion guard live in global.css
 * (`.comet-track`, `.comet`, `@keyframes comet-pass`).
 */

export default function Comet() {
  return (
    <div className="comet-track" aria-hidden="true">
      <div className="comet" />
    </div>
  );
}
