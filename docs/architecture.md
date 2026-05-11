# Architecture

How the sky-map system is wired. Read this when something breaks or when
you're adding a feature that crosses multiple pieces.

This is a companion to [SPEC.md](../SPEC.md) (design source of truth) and
[CLAUDE.md](../CLAUDE.md) (collaboration rules). The code itself has block
comments at each non-obvious decision point.

---

## Rendering model

The home page ([pages/index.astro](../src/pages/index.astro)) is a thin Astro shell
that serialises the project content collection into props and mounts
[SkyMap.tsx](../src/components/react/SkyMap.tsx) as `client:only="react"`. Everything
interactive lives inside that island. The sky is NOT server-rendered —
the first paint shows the `<noscript>` fallback and the SkyBackground
gradient; hydration takes over immediately.

Standalone routes `/projects/<slug>` ([pages/projects/[slug].astro](../src/pages/projects/[slug].astro))
are fully server-rendered Astro pages — no JS required. They're the SEO +
no-JS fallback.

Build output is **static** (`output: 'static'` in Astro config) + Vercel
adapter handles hosting.

---

## State ownership (inside SkyMap)

All sky-map state is centralised in `SkyMap.tsx`:

| State / ref | Purpose |
|---|---|
| `camera` | Viewport center in world coords. Drives the world `translate3d` |
| `angelPosition` | Where Gabo + Cumul are in world coords. `AngelSystem` reads this |
| `angelPosRef` | Mirror of `angelPosition` for synchronous reads in rAF |
| `angelState` (via `useAngelState`) | `idle ⟂ whistle ⟂ flying ⟂ arriving ⟂ working ⟂ idle-mischief` |
| `mischief` (via `useAngelState`) | `wave ⟂ yawn ⟂ balance ⟂ spin-halo ⟂ null` |
| `costume` | Active `CostumeSlug` or `null` — driven by proximity |
| `openProject` | `string \| null` — which project's overlay is open |
| `overlayOrigin` | Screen coords for the cloud-expand clipPath origin |
| `streakAngleDeg` | Direction of motion for the manga speed lines |
| `hintVisible` | `true` until user's first interaction or 4s elapsed |
| `currentSky` (ref) | Slug of the theme currently applied — de-dupe guard |
| `seekStateRef` | Active state of the press-and-hold seek (active, target, pointerId, rafId, lastTime) |
| `viewport` | `{ w, h }` measured from a `ResizeObserver` on the viewport div |

`AngelSystem.tsx` is a dumb component — it renders Cumul + GaboBase driven
by the props SkyMap passes down (`position`, `state`, `mischief`, `costume`).

---

## Input pipeline

Three parallel paths feed camera and angel position:

### Press-and-hold seek

`onPointerDown` → captures pointer → `seekFrame` runs via `requestAnimationFrame`
→ each frame: step angel toward `seekStateRef.targetWorld` at `SEEK_SPEED` world
units/sec → updates `angelPosition` + `camera` + `streakAngleDeg` → sets
state to `'flying'` (or `'idle'` when arrived within 2 units).

`onPointerMove` updates the target in world coords on each pointer move.
`onPointerUp` cancels the rAF and resets state to `'idle'`.

Returns early if the target is a cloud button (`data-sky-interactive`) or
the mini-map — those have their own click handlers.

### Programmatic flight (GSAP MotionPath)

Used by cloud clicks, nav dropdown, mini-map clicks, and the intro "Home"
button. Goes through [`useFlyTo`](../src/lib/use-fly-to.ts):

- Builds a 3-point curve: `from → perpendicular control → to`
- Control point offset is 18% of flight distance, gives a gentle arc
- Duration scales with distance (clamped 0.9s–2.2s)
- Eases `power2.inOut`
- Fires `onApproach` at 50% progress (unused in current flow — proximity
  effect handles costume swap organically)
- Fires `onArrive(slug)` when the path completes; then a 620ms
  "arriving" tail before resolving to `idle` or `working`
- Reduced-motion: snaps to target, fires callbacks synchronously

### Independent camera panning

Wheel and arrow keys pan the camera only (Gabo stays put). Useful for
looking around without committing Gabo somewhere. `KEY_PAN_STEP = 64`
world units per arrow keypress.

Any interaction (press, wheel, arrow) also kills an in-flight seek or
GSAP tween via `killFlight` / `cancelAnimationFrame`.

---

## Proximity-driven theme + costume

One `useEffect` watches `camera.x`, `camera.y`, `viewport.w`, `viewport.h`.
Each time any of them change:

1. Compute which project clouds are inside the viewport rectangle
   (`|cloud.x - camera.x| ≤ viewport.w/2 && |cloud.y - camera.y| ≤ viewport.h/2`)
2. Among visible clouds, pick the one closest to viewport center
3. If that cloud differs from `currentSky.current`, tween `--sky-base` +
   `--sky-accent` on `<html>` via GSAP (duration 0.85s), and update
   `costume` state

Skipped when an overlay is open — the overlay already has the right theme
and we don't want flicker underneath.

The "visible zone" scales with `viewport` so mobile (375×667) has a much
tighter activation zone than desktop (1920×1080). Responsive by construction.

---

## URL routing

Home stays at `/`. Cloud overlays pushState to `/projects/<slug>`.
`closeOverlay` pushes back to `/`.

`popstate` listener parses `window.location.pathname`:
- Match `/projects/<slug>` → `snapToProject(project)` (no flight —
  browser navigation should feel instant) + open overlay
- Otherwise → close overlay

Direct navigation to `/projects/<slug>` (refresh, deep link) renders the
standalone Astro page — not the sky-map with overlay-open. This keeps
the SEO + no-JS fallback clean.

Ctrl/Cmd/Shift/middle-click on the nav dropdown → normal navigation to
the standalone page (preserves browser conventions).

---

## V2 swap contract (SVG structure)

Gabo and Cumul are **placeholder V1 primitives**. V2 will replace them
with commissioned artwork. The contract is a set of group IDs that all
animation CSS + costume slotting depends on. See [illustrator-brief.md](./illustrator-brief.md).

---

## Performance

- Initial home bundle: ~107 kB gz (under 150 kB budget)
- `InteriorScene` + `AmbientDecor` lazy-loaded on first overlay open (~2 kB gz)
- All animations use `transform` + `opacity` only → GPU-accelerated
- `will-change: transform` on the world container and speed lines
- No images shipped — everything is inline SVG, self-hosted fonts,
  CSS gradients
- OG images generated at build time as SVG (no runtime deps)

---

## Where the tokens live

Every color, font, stroke width, and duration is a CSS custom property
defined at `:root` or under `[data-sky="<theme>"]` in
[../src/styles/global.css](../src/styles/global.css). Never hardcode values in components — reference
tokens via `var(--…)`. New tokens should be proposed rather than added
silently (see [CLAUDE.md](../CLAUDE.md) §9).

---

## Where the animations live

- **Constant loops** (bob, halo wobble, blink, pulse, tail wisps, puff
  detach): CSS `@keyframes` in [global.css](../src/styles/global.css)
- **State-driven postures** (flying lean, arriving hop, mischief): CSS
  using `[data-angel-state="…"]` and `[data-mischief="…"]` selectors
- **Flights** (cloud, empty-sky, home, mini-map): GSAP timelines via
  [`use-fly-to.ts`](../src/lib/use-fly-to.ts)
- **Seek mode**: plain `requestAnimationFrame` loop in SkyMap (no GSAP)
- **Sky theme transitions**: GSAP tweens of CSS custom properties via
  [`sky.ts`](../src/lib/sky.ts)
- **Overlay expand/contract**: GSAP tween of `clipPath` in [`InteriorScene.tsx`](../src/components/react/InteriorScene.tsx)
- **Ambient decor**: pure CSS keyframes with per-instance `--delay` / `--duration`
- **Costume fade-in**: CSS animation on the slot group, triggered by React
  `key` remount when the slug changes

`prefers-reduced-motion: reduce` globally drops `animation` and
`transition` durations to ~0, hides speed lines, pauses decor, and
snaps all GSAP tweens via `prefersReducedMotion()` guards.
