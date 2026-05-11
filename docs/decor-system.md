# Parallax decor system

How the multi-strata sky decoration is composed, rendered, and tuned.
Read this when you're touching the decor pipeline, asset thinning, the
PIXI integration, or the parallax math.

Companion to [architecture.md](./architecture.md) (rendering model + state
ownership for the home page) and [SPEC.md](../SPEC.md) (design intent).

---

## What it is

Five vertical bands stacked behind Gabo + the project island markers,
giving the home page a sense of depth and place:

| Band (top → bottom) | Layer id | Items (JSON) | Native depth |
|---|---|---|---|
| Stratosphere — sparkles | `stars` | 138 | far |
| High clouds | `high_clouds` | 11 | mid-far |
| Empty atmosphere (intentional pause) | — | 0 | — |
| Low clouds | `low_clouds` | 10 | mid-near |
| Mountains (back / front / foreground) | `mountains_back`, `mountains_front`, `mountains_foreground` | 14 + 7 + 15 | near |

The `mountains_back` stratum is **not rendered** — dropped at runtime in
[SkyMap.tsx](../src/components/react/SkyMap.tsx) (`DECOR_LAYERS = SCENE.layers.filter((l) => l.id !== 'mountains_back')`)
because the 14 large items were the dominant cost driver and visually
redundant with `mountains_front` + `mountains_foreground`.

The actual sprite count after the SKIP_ITEMS thinning + automatic
reachability filter (see ["Item thinning — two passes"](#item-thinning--two-passes))
is closer to ~38 sprites total, *not* the JSON-level 195. As the camera
pans, each layer translates at its own rate (parallax), producing the
depth effect.

---

## Three-pane stacking

Inside `.sky-map`, the home page composes three sibling panes:

```
.sky-map (overflow:hidden, fills viewport)
├── .sky-map__sky      (DOM, world transform 1:1)   — gradient time-of-day
├── .sky-map__decor    (PIXI canvas, transparent)   — 5 parallax strata
├── .sky-map__world    (DOM, world transform 1:1)   — IntroCloud, IslandMarkers, AngelSystem
├── SpeedLines, Comet, MiniMap, InteriorScene, DecorDebugOverlay…
```

The `__sky` pane carries [WorldSky.tsx](../src/components/react/WorldSky.tsx) — the
authoritative double-gradient (horizontal time-of-day OKLCH sweep +
vertical depth fade, definitions in [global.css](../src/styles/global.css)).
It pans 1:1 with the camera so the gradient region under the viewport
matches the canvas-x position.

The `__decor` pane carries the PIXI canvas. Background transparent, so
the gradient shows through. The canvas is **not** part of the world
plane — it has its own transforms per layer, computed from camera+viewport
each frame. Rendered between sky and world so item silhouettes always
sit visually behind markers + Gabo.

The `__world` pane carries everything interactive (markers, Gabo) and
stays as DOM for accessibility + focus management.

---

## Data sources

### [`references/scene_data.json`](../references/scene_data.json) — source of truth

Authored composition. Six layers with `id`, `parallax` (X factor), and an
`items` array (one entry per silhouette). Each item has `asset` (svg id),
`x`, `y` (canvas-px coords), `width`, `color` (hex `#RRGGBB`), and
optionally `opacity` (0–1) and `compress_h` (mountain authoring metadata,
unused at render).

Canvas size: `16000 × 11200` (logical px), 5 horizontal bands of 2240 each.

Never edit this file as a thinning pass — use `SKIP_ITEMS` (below) instead.

### [`public/references/sky/`](../public/references/sky/) — colored originals

The original potrace-vectorized SVGs with hardcoded fills (clouds at
`#87cbee`, mountains at `#4e06ed`, stars at `#FFFFFF`). Kept in case we
ever go back to the CSS-mask path or want to recolor by recopying.

### [`public/references/sky-mask/`](../public/references/sky-mask/) — white-fill variants

Copies of the colored SVGs with every `fill="…"` rewritten to
`fill="#FFFFFF"`. PIXI loads these as textures so `Sprite.tint =
parseInt(item.color.slice(1), 16)` produces arbitrary per-instance colors
by multiplication: `white × tint = tint`. This eliminates the per-frame
mask rasterization that was the bottleneck of the prior CSS-mask approach.

---

## Render pipeline (PIXI.js v8 + @pixi/react v8)

### Orchestration

[`SkyMap.tsx`](../src/components/react/SkyMap.tsx) lazy-imports
[`DecorCanvas.tsx`](../src/components/react/DecorCanvas.tsx) and mounts it inside
[`<Suspense fallback={null}>`](https://react.dev/reference/react/Suspense) wrapped
by a custom [`DecorErrorBoundary`](../src/components/react/DecorErrorBoundary.tsx).
The error boundary catches PIXI init failures (no WebGL, etc.) without
taking the rest of the page down — the sky gradient + markers + Gabo
keep working.

### DecorCanvas

One `<Application>` per home page, rendering one `<ParallaxLayer>` per
non-skip stratum. The whole component is wrapped in `React.memo`; the
camera flows in via a `RefObject<Vec2>` (not a prop value), so the
canvas only re-renders on viewport resize — never on the per-frame
camera updates that drive seek/flight.

```tsx
extend({ Container, Sprite });

<Application
  width={viewport.w}
  height={viewport.h}
  backgroundAlpha={0}      // transparent so gradient shows through
  antialias={false}        // stylized silhouettes don't benefit from MSAA
  resolution={1}           // halves Retina fill-rate; ≤1.25× upscale on
                           // largest mountain stays imperceptible
  autoDensity
>
  {layers.map((layer) =>
    <ParallaxLayer
      key={layer.id}
      layer={layer}
      cameraRef={cameraRef}
      viewport={viewport}      // value: invalidates the reachability memo on resize
      viewportRef={viewportRef}// ref: read each frame in useTick
      scaleY={scaleY}
      textures={textures}
      reducedMotion={reducedMotion}
    />
  )}
</Application>
```

`antialias={false}` and `resolution={1}` are deliberate: enabling MSAA
or matching `devicePixelRatio` quadruples fragment-shader work on the
large mountain/cloud sprites for no perceptible gain on the cartoon
silhouettes.

### Per-layer container, no per-frame React renders

Each `ParallaxLayer` returns a single `<pixiContainer ref={containerRef}>`
holding all visible sprites. Camera + viewport are passed as **refs**, not
props, so React never re-renders the sprite tree on pan. Each frame:

```tsx
useTick(() => {
  const camera = cameraRef.current;
  const vp = viewportRef.current;
  // … parallax math (sets container.x / container.y) …
  spriteRefs.current.forEach((sprite, i) => {
    // bbox check vs viewport → toggle sprite.visible (per-frame culling)
    // if visible & isStars & !reducedMotion → mutate sprite.alpha (twinkle)
  });
});
```

This is the critical perf pattern: the React reconciler sees stable
props and skips reconciliation; PIXI's scene graph is mutated directly
each frame.

### Parallax math

Anchored at `SKY_CENTER = (8000, 5600)` so the home camera shows each
band at its authored position:

```
viewportHRef = min(viewport.h, REFERENCE_VIEWPORT_H)   // 800
scaleY       = viewportHRef / WORLD_H                  // 800 / 11200 ≈ 0.0714
offsetYCenter = (viewport.h - viewportHRef) / 2        // sky-pads tall viewports

screen.x = item.x + viewport.w/2 - SKY_CENTER.x
                  - parallax_x · (camera.x - SKY_CENTER.x)
screen.y = item.y · scaleY + offsetYCenter
                  - parallax_y · (camera.y - SKY_CENTER.y)
```

X uses the JSON's `parallax` value. Y uses a much gentler drift,
calibrated 5× smaller than X, defined in
[`decor-types.ts`](../src/components/react/decor-types.ts):

```ts
PARALLAX_Y = {
  stars: 0.01,
  high_clouds: 0.06,
  low_clouds: 0.10,
  mountains_back: 0.11,
  mountains_front: 0.15,
  mountains_foreground: 0.20,
};
```

The 11200-tall canvas is compressed onto an 800-px reference viewport so
all 5 bands stay visible at the home camera. Tall viewports keep the
reference proportions and pad with sky above/below (`offsetYCenter`).

### Texture loading

Done once on mount via PIXI `Assets.load`. Each unique `asset` id is
loaded once into a shared `Texture`; 138 stars sharing `star_06.svg` use
**one** texture in GPU memory.

Two non-obvious gotchas are handled here.

**1. SVGs without `width`/`height` rasterize to browser-default sizes.**
The mask SVGs ship with a `viewBox` only — no explicit `width`/`height`.
PIXI's `loadSVG` parser reads `<img>.naturalWidth/Height`, which for
viewBox-only SVGs is browser-dependent (often 0 or 300, never the
viewBox dimensions). We pass the viewBox dimensions explicitly via
`data.width` / `data.height` so the rasterized canvas size is
deterministic. The per-asset values live in `VIEWBOX_W` in
[`decor-types.ts`](../src/components/react/decor-types.ts) (height is
derived as `width * ASPECT[asset]`).

**2. Per-asset adaptive resolution.** Each asset rasterizes at a
resolution sized to its largest on-screen sprite, capped at
`MAX_RESOLUTION = 3`:

```ts
function svgResolutionFor(id: DecorAsset, maxRenderWidth: number): number {
  const ratio = maxRenderWidth / VIEWBOX_W[id];
  return Math.max(1, Math.min(MAX_RESOLUTION, Math.ceil(ratio)));
}

// In useTextures, maxWidth is precomputed by walking layer.items.
await Assets.load({
  src: `${ASSET_BASE_MASK}/${id}.svg`,
  data: {
    width: VIEWBOX_W[id],
    height: VIEWBOX_W[id] * ASPECT[id],
    resolution: svgResolutionFor(id, maxWidth),
  },
});
```

PIXI rasterizes the SVG to a canvas of `viewBox.w × resolution` px. With
`canvas resolution=1` (above), a sprite at its CSS width × 1 device
pixel maps directly. The cap at 3 avoids ballooning GPU memory: the
biggest mountain (~5500 CSS px) accepts a mild 1.25× upscale from a
4368-px texture instead of demanding a perfect-fit 76 MB texture.

**GPU memory budget**: ~150–250 MB depending on viewport (mountains
dominate). If lower-end hardware chokes, lower `MAX_RESOLUTION` to 2
(roughly halves the mountain texture footprint at the cost of softer
edges on `mountains_front`).

### Twinkle (stars only)

Per-sprite alpha animated each frame from `useTick`:

```ts
const phase = t * 2.1 + (i % 7) * 0.4;
sprite.alpha = baseAlpha * (0.55 + 0.45 * Math.cos(phase));
```

Desync via `(i % 7) * 0.4` so stars don't pulse in lockstep. Bypassed
when `prefers-reduced-motion: reduce` (read via `useReducedMotion` hook +
`matchMedia` change listener).

---

## Item thinning — two passes

### Authoring thinning — `SKIP_ITEMS`

Runtime filter in [`decor-types.ts`](../src/components/react/decor-types.ts) that
tells `DecorCanvas` to skip specific item indices per layer. The JSON
stays untouched — this is the iteration knob for visual composition.

```ts
SKIP_ITEMS = {
  stars: new Set([19, 31, 35, 44, 46, 48, 63, 64, 69, 91]),
  high_clouds: new Set([1]),
  low_clouds: new Set([0, 1, 7, 8, 9]),
  mountains_foreground: new Set([0, 8, 13]),
};
```

Indices are 0-based, matching the order in `layer.items` in the JSON.

### Reachability filter (automatic)

Items in `scene_data.json` are positioned in absolute world coordinates
(0 → 16000 on X) but most layers have small parallax factors
(stars=0.05, high_clouds=0.3, etc.). Net effect: the layer container
shifts at most `parallax × world_span` across the full pan, so an item
positioned far from `SKY_CENTER.x` never ends up in the viewport at any
camera position. The user *literally cannot ever see it*, no matter
what.

`isReachable()` in [`DecorCanvas.tsx`](../src/components/react/DecorCanvas.tsx)
solves the camera range that would put each item's bbox in the viewport
and intersects it with the camera-clamp range from `SkyMap`. Items
whose visible-camera range is empty are dropped from the render tree
entirely. Run once per layer in a `useMemo`, recomputed on viewport
resize.

### Effective scene density (representative 1920×1080 viewport)

| Layer | JSON | After SKIP | After reachable |
|---|---|---|---|
| stars | 138 | 128 | **10** |
| high_clouds | 11 | 10 | **6** |
| low_clouds | 10 | 5 | **4** |
| mountains_front | 7 | 7 | **6** |
| mountains_foreground | 15 | 12 | **12** |
| (mountains_back) | 14 | 0 | (layer dropped at SkyMap) |

**Total sprites instantiated: ~38 instead of ~160**. The 92% drop on
stars is from items positioned outside the parallax-shifted reachable
band — they were structurally invisible all along.

### Per-frame culling

On top of the static reachability filter, `useTick` toggles
`sprite.visible` based on a screen-space bbox check against the
viewport at the current camera. PIXI skips both the draw call and the
scene-tree traversal for invisible sprites, and the star twinkle (`cos`
+ alpha write) is skipped for off-screen sprites.

---

## Debug overlay — `?debug=decor`

Append `?debug=decor` to any URL to toggle
[`DecorDebugOverlay.tsx`](../src/components/react/DecorDebugOverlay.tsx) — a
position-fixed, z-index 9999 React tree that draws an identifier badge on
every visible decor item. Used to identify which items to add to
`SKIP_ITEMS`.

Badge format: `{LAYER_CODE}#{index}`. Codes:
- `S` (stars), `H` (high_clouds), `L` (low_clouds)
- `MF` (mountains_front), `MG` (mountains_foreground), `MB` (mountains_back, currently dropped)

Re-uses the same parallax math as `DecorCanvas` so badges follow their
items as the camera pans. Badges of items already in `SKIP_ITEMS` are
**not** shown (consistent with what's actually rendered).

The badge layer is plain DOM, not in the PIXI scene graph — that's why
it sits cleanly on top of the canvas regardless of WebGL stacking.

---

## Critical files

- [src/components/react/DecorCanvas.tsx](../src/components/react/DecorCanvas.tsx) — PIXI Application + ParallaxLayer + textures + twinkle
- [src/components/react/DecorDebugOverlay.tsx](../src/components/react/DecorDebugOverlay.tsx) — `?debug=decor` badge layer
- [src/components/react/DecorErrorBoundary.tsx](../src/components/react/DecorErrorBoundary.tsx) — catches PIXI init failures, falls back to no decor
- [src/components/react/decor-types.ts](../src/components/react/decor-types.ts) — types, ASPECT, VIEWBOX_W, PARALLAX_Y, SKIP_ITEMS, DEBUG_DECOR, LAYER_CODE, ASSET_BASE_MASK, REFERENCE_VIEWPORT_H
- [src/components/react/SkyMap.tsx](../src/components/react/SkyMap.tsx) — orchestrator; lazy-mounts DecorCanvas, owns camera state
- [references/scene_data.json](../references/scene_data.json) — authoring composition (do not edit for thinning)
- [public/references/sky-mask/](../public/references/sky-mask/) — white-fill SVG variants used as PIXI textures
- [public/references/sky/](../public/references/sky/) — original colored SVGs (legacy / spare)

---

## Dependencies added

- `pixi.js@^8` — WebGL/Canvas2D renderer, sprite batching, native tint
- `@pixi/react@^8` — declarative React bindings (`Application`, `extend`, `useTick`)

Lazy-loaded chunk size: ~120 KB gzipped (PIXI core + bindings tree-shaken
to Container + Sprite). First paint is unblocked — sky + markers + Gabo
appear immediately, the decor canvas mounts a few hundred ms later.

---

## Out of scope / known limits

- **`mountains_front` softness on largest items** — items up to 5500 px
  wide rendered against a 4368-px texture (res=3, the `MAX_RESOLUTION`
  cap). Mild 1.25× upscale, smooth with linear filtering, but not
  pixel-perfect. Bumping to res=4 covers it but adds ~170 MB of GPU
  memory. Hold off until / unless someone complains.
- **Star reachability is parallax-induced, not by design** —
  `scene_data.json` was authored as if positions were rendered at
  parallax 1.0, but stars use 0.05; the reachability filter above
  reclaims the cost but the *visible* star pattern is determined by an
  arbitrary slice of the original data rather than a designed layout.
  If we later want denser/sparser stars we should regenerate the data
  with the parallax factor in mind, not just retune `SKIP_ITEMS`.
- **Camera fade for stars when looking at mountains** — proposed but not
  implemented. Trivial to add now: wrap the stars `<pixiContainer>` in a
  `<pixiContainer alpha={fadeBasedOnCameraY}>`. Linear interp from full
  alpha at `camera.y < 8500` to zero at `camera.y > 10000` would do it.
- **Comet** — `Comet.tsx` and `comet.svg` still in repo, currently not
  mounted in `SkyMap`. Reactivation as a PIXI sprite is the right next
  step (rather than the previous CSS-mask overlay).
