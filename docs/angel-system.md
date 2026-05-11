# Angel system — dev reference

> Engineering reference for the runtime behaviour of Gabo + Cumul: how
> poses switch, how the POUF! transitions fire, where each concern lives,
> and how to tune the common knobs without breaking the V2 illustrator
> contract.
>
> **Scope:** React/TypeScript/CSS architecture only. For the SVG contract
> (viewBox, required `<g>` IDs, style rules), read
> [docs/illustrator-brief.md](illustrator-brief.md). For the product
> intent, read [SPEC.md §5](../SPEC.md#5-the-character--gabo--his-cloud).

---

## 1. Mental model

Gabo is **not** a modular paper-doll. He is drawn as **8 complete
poses**, each a self-contained SVG with the same `viewBox` and the same
required sub-group IDs. The browser crossfades between them on state
change, and a "POUF !" smoke puff plays over the crossfade to cover
the visual discontinuity (Toriyama-style cartoon cut).

Three things decide what the user sees:

| Input | Source | What it drives |
|---|---|---|
| `state` | [src/lib/angel-state.ts](../src/lib/angel-state.ts) state machine | Which CSS posture rules apply (lean, hair trail, Cumul stretch) |
| `project` | proximity effect in [SkyMap.tsx](../src/components/react/SkyMap.tsx) | Which project pose (3–8) to render when arrived / parked |
| `mischief` | `useAngelState` timer | Which `data-mischief` CSS anim overlays on pos1 |

The pose SVG to render is a pure function of `(state, project)` —
see [`resolvePose`](../src/components/react/AngelSystem.tsx).

---

## 2. The 8 poses

All live under [src/components/svg/gabo/poses/](../src/components/svg/gabo/poses/).

| # | Component | Used when | Costume |
|---|---|---|---|
| 1 | `GaboPose1` | `idle-home`, `idle-mischief` | base outfit |
| 2 | `GaboPose2` | `traveling` (empty-sky or cloud flight) | base outfit |
| 3 | `GaboTold` | `arriving` / `parked` at Told cloud | architect |
| 4 | `GaboCultureRelax` | ditto, Culture-Relax | doctor |
| 5 | `GaboEvolt` | ditto, Evolt | formal |
| 6 | `GaboCosmdinos` | ditto, Cosmdinos | hooded |
| 7 | `GaboEveia` | ditto, Eveia | athletic |
| 8 | `GaboFofly` | ditto, Fofly API | aviator |

Each pose file is independent — the illustrator replaces one pose at a
time without touching the others. The V1 placeholders share primitives
through [_skeleton.tsx](../src/components/svg/gabo/poses/_skeleton.tsx),
an internal helper that will be discarded as each pose is redrawn for
real.

The project-slug → component mapping lives in
[poses/index.ts](../src/components/svg/gabo/poses/index.ts) as
`PROJECT_POSES`.

---

## 3. State machine

Defined in [src/lib/angel-state.ts](../src/lib/angel-state.ts). V1
collapses the aspirational "departing / leaving / returning" phases
from SPEC into simpler transitions — they exist conceptually as visual
windows during crossfades, not as distinct states.

```
                 ┌─── idle-mischief ───┐
                 │   (30s auto, 3s)    │
                 ▼                     │
          ┌─── idle-home ──────────────┘
          │        ▲
          │        │ (on click: flyTo)
          ▼        │
     traveling ◄───┤
          │        │ (arrival settles after ~620ms)
          ▼        │
       arriving ───┤
          │        │
          ▼        │
        parked ────┘
```

States exposed to CSS via `data-angel-state` on
`.angel-system`:

| State | CSS effect (see [global.css](../src/styles/global.css)) |
|---|---|
| `idle-home` | Default — angel-bob, halo wobble, blink, wings, Cumul pulse |
| `idle-mischief` | Same + `data-mischief` CSS (wave / yawn / balance / spin-halo) |
| `traveling` | Lean forward, hair skew, Cumul stretched, tail elongated, bob paused |
| `arriving` | Deceleration tilt + Cumul hop keyframe (620ms), bob paused |
| `parked` | Bob paused, no lean — project pose holds still |

Transitions are validated by the `TRANSITIONS` table in
`angel-state.ts`. Invalid transitions log a dev warning and no-op.

---

## 4. Pose resolution (the only "logic")

[AngelSystem.tsx](../src/components/react/AngelSystem.tsx) decides
which pose to render from `(state, project)`:

```ts
function resolvePose(state, project) {
  switch (state) {
    case 'idle-home':
    case 'idle-mischief':
      return { key: 'pose-1', Component: GaboPose1 };
    case 'traveling':
      return { key: 'pose-2', Component: GaboPose2 };
    case 'arriving':
    case 'parked':
      return project
        ? { key: project,  Component: PROJECT_POSES[project] }
        : { key: 'pose-1', Component: GaboPose1 }; // returning home
  }
}
```

The returned `key` is passed to `<div key={...}>` around the pose —
**when it changes, React remounts the pose node**. This is what fires
the CSS `pose-appear` animation (opacity fade-in, 300ms) and our POUF!
overlay below.

---

## 5. The POUF! transition

Two coordinated pieces:

1. **JS side** ([AngelSystem.tsx](../src/components/react/AngelSystem.tsx)): a
   `useEffect` watches `poseKey`. When it changes, it mounts the
   `SmokePuff` overlay and clears it `PUFF_DURATION_MS` later.
2. **CSS side** ([global.css](../src/styles/global.css)): three keyframes
   run in parallel for the duration of the mount —
   - `smoke-puff-life` scales + fades the central puff
   - `smoke-puff-satellite` scatters the 5 satellite blobs outward (via
     per-satellite `--dx` / `--dy` custom properties)
   - `smoke-puff-word` pops + drifts the "POUF !" lettering upward

The durations on both sides **must stay aligned**. Change in one place,
change in the other. Search for the number together:

```
grep -rn "900ms\|PUFF_DURATION_MS" src
```

The SmokePuff SVG itself
([SmokePuff.tsx](../src/components/svg/gabo/SmokePuff.tsx)) uses the same
`0 0 200 240` viewBox as Gabo poses so it overlays centered — but its
container is intentionally **bigger** than `.angel-system__gabo` so the
puff engulfs the character at peak (current ratio ~1.7×).

`prefers-reduced-motion`: the puff is hidden outright
(`display: none`) and `.angel-system__gabo` skips the fade-in animation.
Pose changes become instant cuts, which matches user intent.

---

## 6. File map

```
src/
├── components/
│   ├── react/
│   │   ├── AngelSystem.tsx      ← pose resolver + POUF! mount/unmount
│   │   └── SkyMap.tsx           ← owns angel state + activeProject slug
│   └── svg/gabo/
│       ├── Cumul.tsx            ← cloud mount (unchanged across poses)
│       ├── SmokePuff.tsx        ← POUF! SVG (all-cream flash)
│       └── poses/
│           ├── _skeleton.tsx    ← V1 placeholder primitives (internal)
│           ├── GaboPose1.tsx    ← idle-home
│           ├── GaboPose2.tsx    ← traveling
│           ├── GaboTold.tsx     ← 6 project poses ↓
│           ├── GaboCultureRelax.tsx
│           ├── GaboEvolt.tsx
│           ├── GaboCosmdinos.tsx
│           ├── GaboEveia.tsx
│           ├── GaboFofly.tsx
│           └── index.ts         ← PROJECT_POSES registry + ProjectSlug type
├── lib/
│   ├── angel-state.ts           ← state machine + useAngelState hook
│   └── use-fly-to.ts            ← GSAP MotionPath flight tween
└── styles/
    └── global.css               ← all pose / puff / mischief CSS keyframes
```

---

## 7. Tuning recipes

### Make POUF! bigger or smaller

Three coordinated knobs in [global.css](../src/styles/global.css) under
`.angel-system__puff`:

```css
.angel-system__puff {
  width:  240px;  /* container scales the whole SVG */
  height: 280px;
  bottom: 20px;   /* raise/lower to center on Gabo */
}
```

The satellites use `--dx` / `--dy` for their scatter distance — scale
these proportionally with the container:

```css
.smoke-puff__satellite--nw { --dx: -44px; --dy: -36px; }
/* ... */
```

### Make POUF! longer or shorter

**Change both** (they must match):

1. `PUFF_DURATION_MS` in
   [AngelSystem.tsx](../src/components/react/AngelSystem.tsx) — how long
   the DOM node stays mounted
2. The `900ms` values on `smoke-puff-life` / `smoke-puff-satellite` /
   `smoke-puff-word` in [global.css](../src/styles/global.css) — how
   long the CSS animations run

If JS < CSS, the puff is cut off. If JS > CSS, it fades to invisible
before unmounting — harmless but wasteful.

### Change the state timings

- Idle → mischief delay: `IDLE_MISCHIEF_AFTER_MS` (default 30s) in
  [angel-state.ts](../src/lib/angel-state.ts)
- Mischief duration before returning to idle: `MISCHIEF_DURATION_MS`
  (default 3s), same file
- Arrival tail (time in `arriving` before settling to `parked` /
  `idle-home`): `ARRIVING_TAIL_MS` (default 620ms) in
  [use-fly-to.ts](../src/lib/use-fly-to.ts)

### Adjust per-state posture

The CSS rules under `/* --- Travelling posture --- */` in
[global.css](../src/styles/global.css) are the single source of truth
for the flight lean, hair skew, Cumul stretch, and arrival hop. All
selectors key off `data-angel-state="..."` on `.angel-system`.

### Swap a pose for final artwork (V1 → V2 path)

1. Open the target placeholder, e.g.
   [GaboTold.tsx](../src/components/svg/gabo/poses/GaboTold.tsx)
2. Replace the entire `<svg>...</svg>` content with the illustrator's
   export, keeping:
   - `viewBox="0 0 200 240"`
   - The required sub-group IDs (`gabo-wings`, `gabo-body`, `gabo-head`,
     `gabo-hair`, `gabo-halo`, `gabo-eyes`, `gabo-mouth`, etc.)
3. Remove the `GaboSkeleton` import — that scaffold helper is only for
   placeholders
4. Run `pnpm optimize:svg` to SVGO-optimize the result
5. `pnpm astro check && pnpm build` to confirm the contract still holds

---

## 8. Common gotchas

- **Don't rename sub-group IDs**. `#gabo-halo`, `#gabo-eyes`, etc. are
  referenced by shared CSS keyframes across all 8 poses. Renaming in one
  pose silently breaks its animations.
- **Don't add a `transform` to the `pose-appear` keyframe**. The
  per-state posture rules (`translateX(-50%) rotate(-8deg)` for
  traveling, etc.) use CSS transitions on the same property — an
  animation-driven transform will fight them mid-transition. Keep
  `pose-appear` opacity-only.
- **Don't forget to sync JS and CSS timings** when tuning POUF! duration
  (see §7).
- **Don't introduce `<svg>` imports**. Poses and Cumul are inline JSX on
  purpose — that's what lets `var(--ink)` and the `#gabo-*` animations
  reach inside the SVG.
