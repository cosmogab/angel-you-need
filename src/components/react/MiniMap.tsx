import {
  type SkyProject,
  type Vec2,
  type Viewport,
  WORLD_W,
  WORLD_H,
} from './sky-types';

const MINIMAP_W = 220;
const MINIMAP_H = Math.round((MINIMAP_W * WORLD_H) / WORLD_W); // 154 at 16000×11200

interface Props {
  projects: SkyProject[];
  camera: Vec2;
  viewport: Viewport;
  /** Optional home (intro) marker rendered distinctly from project dots. */
  home?: Vec2;
  onRecenter: (pos: Vec2) => void;
}

export default function MiniMap({ projects, camera, viewport, home, onRecenter }: Props) {
  const scaleX = MINIMAP_W / WORLD_W;
  const scaleY = MINIMAP_H / WORLD_H;

  const vw = Math.min(viewport.w, WORLD_W);
  const vh = Math.min(viewport.h, WORLD_H);
  const vpW = vw * scaleX;
  const vpH = vh * scaleY;
  const vpX = (camera.x - vw / 2) * scaleX;
  const vpY = (camera.y - vh / 2) * scaleY;

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    onRecenter({
      x: (px / rect.width) * WORLD_W,
      y: (py / rect.height) * WORLD_H,
    });
  };

  return (
    <aside className="mini-map" aria-label="Sky mini-map">
      <p className="mini-map__title">Sky</p>
      <svg
        viewBox={`0 0 ${MINIMAP_W} ${MINIMAP_H}`}
        width={MINIMAP_W}
        height={MINIMAP_H}
        role="img"
        aria-label="Click anywhere on the mini-map to recenter the sky."
        onClick={handleClick}
      >
        <rect
          x="0"
          y="0"
          width={MINIMAP_W}
          height={MINIMAP_H}
          fill="var(--sky-base)"
          opacity="0.55"
        />
        {projects.map((p) => (
          <g key={p.id}>
            <circle
              cx={p.position.x * scaleX}
              cy={p.position.y * scaleY}
              r="5"
              fill={p.sky.base}
              stroke="var(--ink)"
              strokeWidth="1.25"
            >
              <title>{p.title}</title>
            </circle>
          </g>
        ))}
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
  );
}
