/**
 * PIXI.js v8 + @pixi/react replacement for the CSS-mask decor pipeline.
 *
 * One <canvas> for all five active strata (stars · high_clouds · low_clouds
 * · mountains_front · mountains_foreground). Each item is a PIXI Sprite
 * sharing a single white-fill texture per asset; per-instance color comes
 * from `Sprite.tint`, which multiplies the texture (white × tint = tint),
 * eliminating the per-frame mask rasterization that bottlenecked the DOM
 * version.
 *
 * Camera updates flow via refs (not props) so React never re-renders the
 * 195-sprite tree when panning. Each frame, useTick reads the current
 * camera/viewport from refs and mutates the layer container's `x`/`y`
 * directly. Sprite positions and tints are static React props (computed
 * once on render); only star alpha is animated per-frame for twinkle.
 *
 * Stacking order: this canvas sits in `.sky-map__decor` between the DOM
 * sky pane (gradient, behind) and the world plane (markers + Gabo, in
 * front). Background is transparent, so the sky gradient shows through.
 *
 * Texture sources: `public/references/sky-mask/*.svg` — copies of the
 * originals with all `fill=` attributes replaced by `#FFFFFF` so tinting
 * produces the desired layer color exactly.
 */
import { Application, extend, useTick } from '@pixi/react';
import { Assets, Container, Sprite, type Texture } from 'pixi.js';
import {
  memo,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ASPECT,
  ASSET_BASE_MASK,
  PARALLAX_Y,
  REFERENCE_VIEWPORT_H,
  SKIP_ITEMS,
  VIEWBOX_W,
  type DecorAsset,
  type DecorItem,
  type DecorLayerData,
} from './decor-types';
import {
  SKY_CENTER,
  WORLD_H,
  WORLD_W,
  type Vec2,
  type Viewport,
} from './sky-types';

extend({ Container, Sprite });

interface Props {
  layers: DecorLayerData[];
  /** Camera position is read each frame via this ref (mutated by the parent
   *  on every camera change). Using a ref instead of a prop is the whole
   *  reason DecorCanvas can be memoized — otherwise the ~160-sprite tree
   *  would re-render every frame during seek/flight. */
  cameraRef: RefObject<Vec2>;
  viewport: Viewport;
}

/** Per-asset SVG → texture rasterization resolution, computed from the
 *  largest sprite that uses the asset. PIXI's loadSVG rasterizes to a
 *  canvas of `width * resolution` px; we want that bitmap to match (or
 *  slightly exceed) the largest on-screen sprite size so there's no
 *  upscale blur.
 *
 *  Capped at 3 to keep GPU memory in check — the biggest mountain
 *  (~5500 CSS px) accepts a mild ~1.25× upscale from a 1456×3 texture,
 *  which is imperceptible on stylized silhouettes. Without this cap a
 *  perfect-fit texture for mountain_5 would be ~76 MB on its own. */
const MAX_RESOLUTION = 3;
function svgResolutionFor(id: DecorAsset, maxRenderWidth: number): number {
  const ratio = maxRenderWidth / VIEWBOX_W[id];
  return Math.max(1, Math.min(MAX_RESOLUTION, Math.ceil(ratio)));
}

function useTextures(layers: DecorLayerData[]) {
  const [textures, setTextures] = useState<Record<string, Texture> | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    const maxWidthByAsset = new Map<DecorAsset, number>();
    for (const l of layers) {
      for (const it of l.items) {
        const cur = maxWidthByAsset.get(it.asset) ?? 0;
        if (it.width > cur) maxWidthByAsset.set(it.asset, it.width);
      }
    }
    Promise.all(
      [...maxWidthByAsset.entries()].map(async ([id, maxWidth]) => {
        // SVGs in this set ship with only a `viewBox` (no `width`/`height`
        // attributes), so the loader's <img>.naturalWidth fallback is
        // browser-dependent (often 0 or 300). We pass viewBox dimensions
        // explicitly so the rasterized canvas size is predictable:
        // `VIEWBOX_W[id] × resolution` device pixels.
        const w = VIEWBOX_W[id];
        const h = w * ASPECT[id];
        const tex = await Assets.load<Texture>({
          src: `${ASSET_BASE_MASK}/${id}.svg`,
          data: {
            width: w,
            height: h,
            resolution: svgResolutionFor(id, maxWidth),
          },
        });
        return [id, tex] as const;
      })
    ).then((pairs) => {
      if (!cancelled) setTextures(Object.fromEntries(pairs));
    });
    return () => {
      cancelled = true;
    };
  }, [layers]);

  return textures;
}

/** True iff the item's bounding box could intersect the viewport for some
 *  camera position within the SkyMap's clamped camera range. Used to drop
 *  items that — given their world position and the layer's parallax — are
 *  unreachable in practice (e.g. with stars at parallax 0.05, the layer
 *  shifts only 700 px across the full 16000 px world pan, so most stars
 *  positioned in absolute world coords end up perpetually off-screen).
 *
 *  Math: layer container x = halfW − SKY_CENTER.x − parallaxX·(camera.x −
 *  SKY_CENTER.x). The screen-space sprite x is layer.x + item.x. We solve
 *  for the camera.x range that satisfies `screen_right ≥ 0 ∧ screen_left
 *  ≤ viewport.w`, then check it intersects the camera clamp [camMin,
 *  camMax]. Same logic per axis. Independent because parallaxX/Y act on
 *  independent camera coordinates. */
function isReachable(
  item: DecorItem,
  parallaxX: number,
  parallaxY: number,
  scaleY: number,
  viewport: Viewport
): boolean {
  const halfW = viewport.w / 2;
  const halfH = viewport.h / 2;
  const camMinX = Math.min(WORLD_W / 2, halfW);
  const camMaxX = WORLD_W - camMinX;
  const camMinY = Math.min(WORLD_H / 2, halfH);
  const camMaxY = WORLD_H - camMinY;

  const aspect = ASPECT[item.asset];
  const sw = item.width;
  const sh = item.width * aspect;
  const sx = item.x;
  const sy = item.y * scaleY;

  const offsetX = halfW - SKY_CENTER.x * (1 - parallaxX);
  if (parallaxX === 0) {
    if (!(offsetX + sx + sw >= 0 && offsetX + sx <= viewport.w)) return false;
  } else {
    const camLowerX = (offsetX + sx - viewport.w) / parallaxX;
    const camUpperX = (offsetX + sx + sw) / parallaxX;
    if (camUpperX < camMinX || camLowerX > camMaxX) return false;
  }

  const viewportHRef = Math.min(viewport.h, REFERENCE_VIEWPORT_H);
  const offsetYCenter = (viewport.h - viewportHRef) / 2;
  const offsetY = offsetYCenter + parallaxY * SKY_CENTER.y;
  if (parallaxY === 0) {
    if (!(offsetY + sy + sh >= 0 && offsetY + sy <= viewport.h)) return false;
  } else {
    const camLowerY = (offsetY + sy - viewport.h) / parallaxY;
    const camUpperY = (offsetY + sy + sh) / parallaxY;
    if (camUpperY < camMinY || camLowerY > camMaxY) return false;
  }

  return true;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return reduced;
}

interface LayerProps {
  layer: DecorLayerData;
  cameraRef: RefObject<Vec2>;
  /** Latest viewport dimensions for the static reachability memo and
   *  the per-frame cull rect. Held alongside `viewportRef` so the memo
   *  invalidates on resize (a stable ref alone wouldn't do it). */
  viewport: Viewport;
  viewportRef: RefObject<Viewport>;
  scaleY: number;
  textures: Record<string, Texture>;
  reducedMotion: boolean;
}

function ParallaxLayer({
  layer,
  cameraRef,
  viewport,
  viewportRef,
  scaleY,
  textures,
  reducedMotion,
}: LayerProps) {
  const parallaxX = layer.parallax;
  const parallaxY = PARALLAX_Y[layer.id] ?? 0;
  const isStars = layer.id === 'stars';

  const containerRef = useRef<Container | null>(null);
  const spriteRefs = useRef<Map<number, Sprite>>(new Map());

  // Items kept after merging the SKIP_ITEMS thinning pass with the
  // reachability filter. With parallax 0.05, ~118/138 stars and a few
  // mountains/clouds positioned outside their parallax-shifted band are
  // never visible at any camera position — those are filtered out here so
  // they're never instantiated as sprites.
  const renderedItems = useMemo(() => {
    const skip = SKIP_ITEMS[layer.id];
    if (viewport.w === 0 || viewport.h === 0) return [];
    return layer.items
      .map((item, i) => ({ item, i }))
      .filter(({ i, item }) => {
        if (skip?.has(i)) return false;
        return isReachable(item, parallaxX, parallaxY, scaleY, viewport);
      });
  }, [
    layer.id,
    layer.items,
    parallaxX,
    parallaxY,
    scaleY,
    viewport.w,
    viewport.h,
  ]);

  // Per-frame: re-position the layer container (parallax), cull sprites
  // that fell outside the current viewport, and animate stars. All via
  // direct PIXI mutation — no React re-render.
  useTick(() => {
    const camera = cameraRef.current;
    const vp = viewportRef.current;
    const container = containerRef.current;
    if (!camera || !vp || !container) return;

    const viewportHRef = Math.min(vp.h, REFERENCE_VIEWPORT_H);
    const offsetYCenter = (vp.h - viewportHRef) / 2;
    const tx =
      vp.w / 2 - SKY_CENTER.x - parallaxX * (camera.x - SKY_CENTER.x);
    const ty = offsetYCenter - parallaxY * (camera.y - SKY_CENTER.y);
    container.x = tx;
    container.y = ty;

    // Per-frame culling: a sprite outside the screen rect costs only a
    // vertex pass on the GPU but PIXI still records a draw call and
    // walks the scene node — `visible=false` short-circuits both.
    const t = isStars && !reducedMotion ? performance.now() / 1000 : 0;
    spriteRefs.current.forEach((sprite, i) => {
      const item = layer.items[i];
      if (!item) return;
      const aspect = ASPECT[item.asset];
      const sw = item.width;
      const sh = item.width * aspect;
      const screenLeft = tx + item.x;
      const screenTop = ty + item.y * scaleY;
      const visible =
        screenLeft + sw >= 0 &&
        screenLeft <= vp.w &&
        screenTop + sh >= 0 &&
        screenTop <= vp.h;
      sprite.visible = visible;
      if (visible && isStars && !reducedMotion) {
        const baseAlpha = item.opacity ?? 1;
        const phase = t * 2.1 + (i % 7) * 0.4;
        sprite.alpha = baseAlpha * (0.55 + 0.45 * Math.cos(phase));
      }
    });
  });

  return (
    <pixiContainer ref={containerRef}>
      {renderedItems.map(({ item, i }) => {
        const tex = textures[item.asset];
        if (!tex) return null;
        const aspect = ASPECT[item.asset];
        const tint = parseInt(item.color.slice(1), 16);
        return (
          <pixiSprite
            key={i}
            ref={(s) => {
              if (s) spriteRefs.current.set(i, s);
              else spriteRefs.current.delete(i);
            }}
            texture={tex}
            x={item.x}
            y={item.y * scaleY}
            width={item.width}
            height={item.width * aspect}
            tint={tint}
            alpha={item.opacity ?? 1}
          />
        );
      })}
    </pixiContainer>
  );
}

function DecorCanvasInner({ layers, cameraRef, viewport }: Props) {
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;

  const textures = useTextures(layers);
  const reducedMotion = useReducedMotion();

  if (!textures || viewport.w === 0 || viewport.h === 0) return null;

  // Static sprite Y positions need scaleY at render time. Recomputes on
  // viewport resize (rare); per-frame camera updates take the parallax
  // path via refs and don't trigger this re-render.
  const viewportHRef = Math.min(viewport.h, REFERENCE_VIEWPORT_H);
  const scaleY = viewportHRef / WORLD_H;

  return (
    <Application
      width={viewport.w}
      height={viewport.h}
      backgroundAlpha={0}
      // antialias off: stylized silhouettes don't benefit from MSAA, and
      // turning it off cuts fragment-shader cost on the large mountain
      // and cloud sprites. resolution=1 (instead of devicePixelRatio)
      // halves the per-frame fill cost on Retina; the ~1.25× upscale on
      // the largest mountain (5438 CSS px / 4368 texture px at SVG ×3
      // rasterization) is imperceptible on cartoon shapes.
      antialias={false}
      resolution={1}
      autoDensity
    >
      {layers.map((layer) => (
        <ParallaxLayer
          key={layer.id}
          layer={layer}
          cameraRef={cameraRef}
          viewport={viewport}
          viewportRef={viewportRef}
          scaleY={scaleY}
          textures={textures}
          reducedMotion={reducedMotion}
        />
      ))}
    </Application>
  );
}

// Memoized: with cameraRef instead of a `camera` prop, DecorCanvas no
// longer needs to re-render on every frame during seek/flight. It only
// re-renders when `layers` (module-stable) or `viewport` (resize) change.
const DecorCanvas = memo(DecorCanvasInner);
export default DecorCanvas;
