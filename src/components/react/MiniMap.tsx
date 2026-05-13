import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  type SkyProject,
  type Vec2,
  type Viewport,
  WORLD_W,
  WORLD_H,
} from './sky-types';

const MINIMAP_W = 220;
const MINIMAP_H = Math.round((MINIMAP_W * WORLD_H) / WORLD_W); // 154 at 16000×11200

// Keep these in sync with the .mini-map[data-expanded='true'] > svg rule.
// Used by the layout effect to predict the centered position before CSS
// has finished growing the element.
const EXPANDED_MAX_PX = 560;
const EXPANDED_VW_PCT = 0.88;
const EXPANDED_RATIO = MINIMAP_H / MINIMAP_W; // 154/220 = 0.7
// Container chrome around the SVG (px): 2 × padding (0.5rem) + 2 × border (3.5px).
const CHROME_X = 16 + 7;
// Vertical chrome adds the title row height (≈ 0.85rem + gap).
const CHROME_Y = 16 + 7 + 22;
// Corner margin matches `.mini-map { right: 1rem; bottom: 1rem }`.
const CORNER_MARGIN_PX = 16;

/** Per-project dot color override for projects whose sky.base is too dark
    to read as a small mark on the cream-tinted mini-map. Defaults to
    p.sky.base when not listed. */
const DOT_COLOR: Record<string, string> = {
  // Navy theme — swap to the lighter cyan that's also present in the SVG.
  cosmodinos: '#49bfec',
  // Navy theme — use the project's golden accent instead.
  fofly: '#FFC947',
};

interface Props {
  projects: SkyProject[];
  camera: Vec2;
  viewport: Viewport;
  /** Optional home (intro) marker rendered distinctly from project dots. */
  home?: Vec2;
  onRecenter: (pos: Vec2) => void;
  /** Tap a project dot → fly Gabo to it and open its overlay. */
  onOpenIsland: (slug: string) => void;
}

export default function MiniMap({ projects, camera, viewport, home, onRecenter, onOpenIsland }: Props) {
  const scaleX = MINIMAP_W / WORLD_W;
  const scaleY = MINIMAP_H / WORLD_H;

  const vw = Math.min(viewport.w, WORLD_W);
  const vh = Math.min(viewport.h, WORLD_H);
  const vpW = vw * scaleX;
  const vpH = vh * scaleY;
  const vpX = (camera.x - vw / 2) * scaleX;
  const vpY = (camera.y - vh / 2) * scaleY;

  const [expanded, setExpanded] = useState(false);
  const asideRef = useRef<HTMLElement>(null);

  // Compute the translation needed to move the expanded container's center
  // close to the viewport center. We can't read the post-expansion bounds
  // before the CSS transition runs, so we predict them from the same
  // formulas the CSS uses for the expanded width.
  useLayoutEffect(() => {
    const el = asideRef.current;
    if (!el) return;
    if (!expanded) {
      el.style.removeProperty('--center-tx');
      el.style.removeProperty('--center-ty');
      return;
    }
    const innerW = window.innerWidth;
    const innerH = window.innerHeight;
    const svgW = Math.min(EXPANDED_MAX_PX, innerW * EXPANDED_VW_PCT);
    const svgH = svgW * EXPANDED_RATIO;
    const containerW = svgW + CHROME_X;
    const containerH = svgH + CHROME_Y;
    // Container is anchored bottom-right via CSS (right/bottom = 1rem). Its
    // current center sits at (innerW - margin - W/2, innerH - margin - H/2).
    // Translate so that center lands at (innerW/2, innerH/2).
    const tx = innerW / 2 - (innerW - CORNER_MARGIN_PX - containerW / 2);
    const ty = innerH / 2 - (innerH - CORNER_MARGIN_PX - containerH / 2);
    el.style.setProperty('--center-tx', `${tx}px`);
    el.style.setProperty('--center-ty', `${ty}px`);
  }, [expanded]);

  // ESC dismisses the expanded state.
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    // Stop the click from also reaching the container's frame toggle.
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    onRecenter({
      x: (px / rect.width) * WORLD_W,
      y: (py / rect.height) * WORLD_H,
    });
    if (expanded) setExpanded(false);
  };

  const handleFrameClick = (e: React.MouseEvent<HTMLElement>) => {
    // Don't propagate to the sky-map (which would otherwise treat this as a
    // pointerdown on empty sky). SkyMap already excludes .mini-map from its
    // seek handler, but tapping the frame still bubbles a click event.
    e.stopPropagation();
    setExpanded((v) => !v);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setExpanded(false);
  };

  return (
    <>
      <div
        className="mini-map-backdrop"
        data-visible={expanded}
        data-sky-interactive
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      <aside
        ref={asideRef}
        className="mini-map"
        data-expanded={expanded}
        aria-label="Sky mini-map"
        onClick={handleFrameClick}
      >
        <p className="mini-map__title">Sky</p>
        <svg
          viewBox={`0 0 ${MINIMAP_W} ${MINIMAP_H}`}
          role="img"
          aria-label="Click anywhere on the mini-map to recenter the sky."
          onClick={handleSvgClick}
        >
          <rect
            x="0"
            y="0"
            width={MINIMAP_W}
            height={MINIMAP_H}
            fill="var(--sky-base)"
            opacity="0.55"
          />
          {projects.map((p) => {
            const cx = p.position.x * scaleX;
            const cy = p.position.y * scaleY;
            const onDotClick = (e: React.MouseEvent<SVGGElement>) => {
              // Beat the SVG-level recenter handler so the tap opens the
              // project rather than just recentering the camera at the dot.
              e.stopPropagation();
              if (expanded) setExpanded(false);
              onOpenIsland(p.id);
            };
            return (
              <g
                key={p.id}
                className="mini-map__dot"
                onClick={onDotClick}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r="5"
                  fill={DOT_COLOR[p.id] ?? p.sky.base}
                  stroke="var(--ink)"
                  strokeWidth="1.25"
                />
                {/* Transparent hit-area: enlarges the tap target without
                    visually growing the dot. */}
                <circle cx={cx} cy={cy} r="10" fill="transparent">
                  <title>{p.title}</title>
                </circle>
              </g>
            );
          })}
          {home && (
            <g className="mini-map__home">
              <circle
                cx={home.x * scaleX}
                cy={home.y * scaleY}
                r="7"
                fill="var(--gabo-halo)"
                stroke="var(--ink)"
                strokeWidth="1.5"
              />
              <circle
                cx={home.x * scaleX}
                cy={home.y * scaleY}
                r="2.25"
                fill="var(--ink)"
              />
              <title>Home — the intro</title>
            </g>
          )}
          <rect
            x={vpX}
            y={vpY}
            width={vpW}
            height={vpH}
            fill="none"
            stroke="var(--gabo-halo)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            pointerEvents="none"
          />
        </svg>
      </aside>
    </>
  );
}
