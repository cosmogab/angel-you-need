/**
 * Types and asset metadata for the parallax decor layers behind the world
 * plane (stars, clouds, mountains, foreground hills). The composition itself
 * lives in `references/scene_data.json` — this module only describes its
 * shape and the per-asset aspect ratios needed to render each item.
 *
 * Aspect ratio = svg viewBox height / svg viewBox width. Element box height
 * is computed at render time as `item.width * ASPECT[item.asset]`. Verified
 * against `references/canvas_preview.html` (e.g. cloud_5 width 2135 → height
 * 1033, ratio 654/1352 ≈ 0.4837).
 */

export type DecorAsset =
  | 'cloud_1' | 'cloud_2' | 'cloud_3' | 'cloud_5'
  | 'cloud_6' | 'cloud_7' | 'cloud_8' | 'cloud_9'
  | 'mountain_1' | 'mountain_2' | 'mountain_3' | 'mountain_4' | 'mountain_5'
  | 'star_01' | 'star_06'
  | 'comet';

export interface DecorItem {
  asset: DecorAsset;
  x: number;
  y: number;
  width: number;
  color: string;
  opacity?: number;
  /** Mountain-only authoring metadata. Not used at render time — kept for
   *  type compatibility with the JSON. Render height is always
   *  `width * ASPECT[asset]`. */
  compress_h?: number;
}

export interface DecorLayerData {
  id: string;
  parallax: number;
  animations: string[];
  items: DecorItem[];
}

export interface SceneData {
  canvas: { width: number; height: number; background_color: string };
  layers: DecorLayerData[];
}

export const ASPECT: Record<DecorAsset, number> = {
  cloud_1: 600 / 1320,
  cloud_2: 591 / 1372,
  cloud_3: 590 / 1369,
  cloud_5: 654 / 1352,
  cloud_6: 726 / 1399,
  cloud_7: 546 / 1279,
  cloud_8: 758 / 1433,
  cloud_9: 693 / 1456,
  mountain_1: 757 / 1456,
  mountain_2: 753 / 1456,
  mountain_3: 816 / 1456,
  mountain_4: 816 / 1456,
  mountain_5: 816 / 1456,
  star_01: 1,
  star_06: 1,
  comet: 786 / 1445,
};

/** SVG viewBox width per asset (third value of the `viewBox` attribute).
 *  Passed to PIXI's loadSVG via `data.width` so the SVG rasterizes at a
 *  predictable size — without this, the loader falls back to the
 *  `<img>.naturalWidth` of an SVG that has no width/height attributes,
 *  which is browser-dependent (typically 0 or 300, never the viewBox
 *  dimensions). Texture height is implicit: `width * ASPECT[asset]`. */
export const VIEWBOX_W: Record<DecorAsset, number> = {
  cloud_1: 1320,
  cloud_2: 1372,
  cloud_3: 1369,
  cloud_5: 1352,
  cloud_6: 1399,
  cloud_7: 1279,
  cloud_8: 1433,
  cloud_9: 1456,
  mountain_1: 1456,
  mountain_2: 1456,
  mountain_3: 1456,
  mountain_4: 1456,
  mountain_5: 1456,
  star_01: 49,
  star_06: 31,
  comet: 1445,
};

/** Public-served asset path for the original colored SVG silhouettes
 *  (used by the legacy CSS-mask renderer, kept for the debug overlay /
 *  potential fallbacks). */
export const ASSET_BASE = '/references/sky';

/** Public-served asset path for the WHITE-fill SVG variants used as PIXI
 *  textures. White textures multiplied by sprite tint produce arbitrary
 *  per-instance colors. */
export const ASSET_BASE_MASK = '/references/sky-mask';

/** Vertical drift parallax per layer. The JSON only carries a single
 *  `parallax` value (treated as horizontal). Two regimes coexist on this
 *  tall (11200-px) canvas: SKY layers (stars, clouds) get ~50% of X to
 *  give a real sense of motion when panning vertically, while GROUND
 *  layers (mountains) stay much lower (0.15–0.22) so the horizon doesn't
 *  "take off" — a fast Y parallax on the foreground mountains decouples
 *  them from their visual ground position and they appear to fly. */
export const PARALLAX_Y: Record<string, number> = {
  stars: 0.025,
  high_clouds: 0.075,
  mid_clouds: 0.11,
  low_clouds: 0.15,
  mountains_back: 0.15,
  mountains_front: 0.18,
  mountains_foreground: 0.22,
};

/** Reference viewport height used to compute the canvas → screen vertical
 *  scale. On taller viewports the bands keep their 800-px-equivalent
 *  proportions and get centered with sky padding above and below, so the
 *  composition stays consistent across screen sizes. */
export const REFERENCE_VIEWPORT_H = 800;

/** Item indices to skip at render time, per layer. The JSON stays the
 *  source-of-truth scene composition; this is a thinning pass tuned to
 *  reduce visual density (and per-frame paint cost). Indices are 0-based
 *  and refer to the item's position in `layer.items` in the JSON. */
export const SKIP_ITEMS: Partial<Record<string, ReadonlySet<number>>> = {
  stars: new Set([19, 31, 35, 44, 46, 48, 63, 64, 69, 91]),
  high_clouds: new Set([1]),
  low_clouds: new Set([0, 1, 7, 8, 9]),
  mountains_foreground: new Set([0, 8, 13]),
};

/** Toggle per-decor-item index badges by appending `?debug=decor` to the
 *  URL. Read once at module load — a refresh applies / clears it. */
export const DEBUG_DECOR =
  typeof window !== 'undefined' &&
  window.location.search.includes('debug=decor');

/** Short layer codes shown in the debug badges (kept tight to fit on
 *  small items). */
export const LAYER_CODE: Record<string, string> = {
  stars: 'S',
  high_clouds: 'H',
  mid_clouds: 'M',
  low_clouds: 'L',
  mountains_back: 'MB',
  mountains_front: 'MF',
  mountains_foreground: 'MG',
};
