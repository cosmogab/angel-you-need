/**
 * Debug overlay rendering identification badges for every decor item.
 * Mounted only when `?debug=decor` is in the URL. Lives at top-level of
 * the `.sky-map` (sibling AFTER `.sky-map__world`) and uses
 * `position: fixed` + a very high `z-index` so badges are *always* on top
 * of clouds, mountains, IslandMarkers, Gabo and any overlay — the user
 * needs to read the indices reliably to thin the scene.
 *
 * Items already filtered by SKIP_ITEMS are NOT labeled (they're gone from
 * the rendered scene, so a label on a ghost would be misleading).
 *
 * Labels use the SAME parallax math as DecorLayer, computed at screen-px
 * coords here (since this overlay isn't inside the parallax wrapper, it
 * needs the final post-transform position for each label).
 */
import {
  ASPECT,
  LAYER_CODE,
  PARALLAX_Y,
  REFERENCE_VIEWPORT_H,
  SKIP_ITEMS,
  type DecorLayerData,
} from './decor-types';
import { SKY_CENTER, WORLD_H, type Vec2, type Viewport } from './sky-types';

interface Props {
  layers: DecorLayerData[];
  camera: Vec2;
  viewport: Viewport;
}

const LABEL_MARGIN = 80;

export default function DecorDebugOverlay({ layers, camera, viewport }: Props) {
  const viewportHRef = Math.min(viewport.h, REFERENCE_VIEWPORT_H);
  const scaleY = viewportHRef / WORLD_H;
  const offsetYCenter = (viewport.h - viewportHRef) / 2;

  return (
    <div
      className="decor-debug-overlay"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      {layers.flatMap((layer) => {
        const parallaxX = layer.parallax;
        const parallaxY = PARALLAX_Y[layer.id] ?? 0;
        const skip = SKIP_ITEMS[layer.id];
        const code = LAYER_CODE[layer.id] ?? layer.id;

        const tx =
          viewport.w / 2 -
          SKY_CENTER.x -
          parallaxX * (camera.x - SKY_CENTER.x);
        const ty = offsetYCenter - parallaxY * (camera.y - SKY_CENTER.y);

        return layer.items
          .map((item, i) => {
            if (skip?.has(i)) return null;

            const aspect = ASPECT[item.asset];
            const itemH = item.width * aspect;
            const cx = item.x + item.width / 2 + tx;
            const cy = item.y * scaleY + itemH / 2 + ty;

            // Cull labels far outside the viewport so we don't render
            // 138 stars worth of off-screen badges every frame.
            if (
              cx < -LABEL_MARGIN ||
              cx > viewport.w + LABEL_MARGIN ||
              cy < -LABEL_MARGIN ||
              cy > viewport.h + LABEL_MARGIN
            ) {
              return null;
            }

            return (
              <div
                key={`${layer.id}-${i}`}
                style={{
                  position: 'absolute',
                  left: cx,
                  top: cy,
                  transform: 'translate(-50%, -50%)',
                  fontFamily: 'ui-monospace, Menlo, monospace',
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#fff',
                  background: 'rgba(220, 38, 38, 0.95)',
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: '2px solid #fff',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                }}
              >
                {code}#{i}
              </div>
            );
          })
          .filter(Boolean);
      })}
    </div>
  );
}
