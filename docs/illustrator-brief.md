# V2 illustrator brief — Gabo 8-pose SVG handoff

> Read this when you're about to commission a manga illustrator to replace
> the V1 placeholder SVGs. This is a **contract**: hitting these IDs,
> viewBox, and conventions means your files drop into the existing React
> components with **zero code changes**.

---

## Who this is for

A manga illustrator (or Gabriel doing it himself later) delivering
polished SVG for:

- **Cumul** — Gabo's personal cloud mount (one file, unchanged)
- **8 Gabo poses** — complete, self-contained illustrations (no modular
  overlays, no costume swapping system)

Style reference: **Akira Toriyama, 1985–1988** (early Dragon Ball + Dr.
Slump). See [SPEC §5](../SPEC.md#5-the-character--gabo--his-cloud) for
the full design brief.

---

## The 8 poses

Each pose is a **complete, standalone SVG** drawn in full — including
the project costume when applicable. There is **no base file** and no
costume overlay slot. Each pose targets its own React component.

| # | Component file | Pose description | Costume baked in |
|---|---|---|---|
| 1 | `poses/GaboPose1.tsx` | Standing next to Cumul at home, waving cheekily | none (base outfit) |
| 2 | `poses/GaboPose2.tsx` | Clinging to Cumul in flight, hair + tunic trailing back, leaning forward | none (base outfit) |
| 3 | `poses/GaboTold.tsx` | Architect confident squint, blueprint scroll tucked under arm | white architect helmet with "T" logo, tool belt strap |
| 4 | `poses/GaboCultureRelax.tsx` | Focused doctor pose | surgical coat over tunic, stethoscope around neck, round medical glasses |
| 5 | `poses/GaboEvolt.tsx` | Formal polished stance | tiny jacket over tunic, red bow tie, gold "LEAD" pin |
| 6 | `poses/GaboCosmdinos.tsx` | Hooded silhouette with smirk | dark hooded cape with gold chain links, small round crypto-glasses |
| 7 | `poses/GaboEveia.tsx` | Energetic ready-to-run stance | green sport headband, athletic stethoscope, smartwatch on wrist |
| 8 | `poses/GaboFofly.tsx` | Adventurous aviator grin | leather aviator cap with goggles on forehead, white flowing scarf |

---

## Non-negotiable style rules (SPEC §5)

- **Ligne claire** — bold, consistent black outlines
- **Stroke weight**: `2.5px` (use the CSS variable `var(--stroke-weight)`)
- **Stroke color**: `var(--ink)` (= `#1A1613`, never pure black)
- **Line caps / joins**: `round`
- **Fills**: flat only — no gradients, no soft shadows, no blending
- **Shadows**: cel-shaded discrete darker flat zones only
- **No drop shadows on characters**

---

## Use CSS variables for all colors

Every `fill` and `stroke` must reference a token from the palette, not a
hard-coded hex. The design token layer lives in
[../src/styles/global.css](../src/styles/global.css).

| Purpose | Token | V1 value |
|---|---|---|
| Hair (blond) | `var(--gabo-hair)` | `#FFD93D` |
| Hair shadow | `var(--gabo-hair-shadow)` | `#E8B820` |
| Skin | `var(--gabo-skin)` | `#FFE0B8` |
| Skin shadow | `var(--gabo-skin-shadow)` | `#E8B88A` |
| Tunic | `var(--gabo-tunic)` | `#FFFFFF` |
| Tunic shadow | `var(--gabo-tunic-shadow)` | `#E8E0D0` |
| Belt (gold) | `var(--gabo-belt)` | `#E8A94A` |
| Halo | `var(--gabo-halo)` | `#FFD93D` |
| Cumul base | `var(--cumul-base)` | `#FFFBF0` |
| Cumul highlight | `var(--cumul-highlight)` | `#FFE8B0` |
| Cumul shadow | `var(--cumul-shadow)` | `#E6D9B8` |
| Line work | `var(--ink)` | `#1A1613` |

Per-costume accent colors (bow tie red, Cosmdinos gold chain, Eveia
headband green, etc.) should be added as new tokens in
[global.css](../src/styles/global.css) before use. **Do not inline hex
values in the SVG.**

---

## Required SVG structure (identical across all 8 poses)

Every pose SVG must use **exactly** this viewBox and top-level group
hierarchy. The CSS animations (halo wobble, blink, wing flap, mouth
yawn) target these IDs — rename or remove them and the animations
break.

```xml
<svg class="gabo" viewBox="0 0 200 240"
     data-pose="1 | 2 | told | culture-relax | evolt | cosmdinos | eveia | fofly"
     data-expression="neutral | wave | yawn | smirk | focus | grin"
     aria-hidden="true" focusable="false">

  <g id="gabo-wings">…</g>       <!-- behind body -->
  <g id="gabo-body">             <!-- torso, arms, legs, costume body parts if bundled -->
    …
  </g>
  <g id="gabo-head">             <!-- face, hair, halo, costume head parts if bundled -->
    <g id="gabo-face">…</g>
    <g id="gabo-hair">…</g>
    <g id="gabo-halo">…</g>
  </g>
  <g id="gabo-expression">       <!-- always on top: expression renders over hats/hoods/glasses -->
    <g id="gabo-eyebrows">…</g>
    <g id="gabo-eyes">…</g>
    <path id="gabo-mouth" … />
  </g>
</svg>
```

### Z-order rationale

The expression group is always last (= on top) so eyes/mouth render over
any accessory that would otherwise cover them (aviator goggles resting on
the forehead, crypto-glasses over hooded face, medical glasses over
eyes). Draw the accessory in `gabo-head` and leave the expression free
on top.

Costumes that include a hood, hat, or glasses should be drawn **inside
`gabo-head`** (above hair/halo if they cover them, or below if they sit
behind). Costumes that include clothing should be drawn **inside
`gabo-body`** merged with the base tunic.

### Required sub-elements (all poses)

These must exist in every pose for the shared CSS keyframes to find
them:

| Element | Animation | Trigger |
|---|---|---|
| `#gabo-halo` | `halo-wobble` rotation ±1.5° | always, on every pose |
| `#gabo-halo` | `halo-spin` 360° | `[data-mischief="spin-halo"]` (pos1 only) |
| `#gabo-wings` | `wing-flap` subtle scaleY | always |
| `#gabo-eyes` | `blink` scaleY 1 → 0.08 | every ~5s, every pose |
| `#gabo-mouth` | `mouth-yawn` scaleY 2.6 | `[data-mischief="yawn"]` (pos1 only) |

**Optional (pose1 only):** `.gabo-arm--right` class on the right arm
group enables the `arm-wave` mischief. Keep `transform-origin` near the
shoulder.

---

## Shared anchor points (viewBox `0 0 200 240`)

To keep poses visually coherent under a crossfade, keep these anchors
roughly consistent across poses — a viewer's eye shouldn't jump:

- Head center: approx. `(100, 80)`, radius ~40
- Halo: `(100, 22)`
- Torso center of mass: around `(100, 150)`
- Pose silhouette should fit inside the margin `x: 20–180`, `y: 10–230`

pos1 and pos2 may place Cumul adjacent to Gabo — pos1 has Cumul floating
to the **right** of Gabo at roughly `(140, 180)`, pos2 has Gabo on top
of Cumul centered. Project poses (3–8) do **not** include Cumul (Cumul
is rendered separately and parked off to the side during `parked`
state).

---

## Cumul — `src/components/svg/gabo/Cumul.tsx` (unchanged from V1)

**viewBox**: `0 0 260 140`
**Orientation**: faces right by default; tail trails to the left.

Required group IDs, in this document order (z-bottom → z-top):

```xml
<svg class="cumul" viewBox="0 0 260 140"
     data-state="idle | traveling | parked"
     aria-hidden="true" focusable="false">
  <g id="cumul-tail">…</g>         <!-- 3 wispy trails fading backward -->
  <g id="cumul-base">…</g>         <!-- main silhouette, filled -->
  <g id="cumul-shadows">…</g>      <!-- underside cel-shade arcs -->
  <g id="cumul-highlights">…</g>   <!-- top cel-shade arcs -->
  <g id="cumul-puffs">…</g>        <!-- detachable particles -->
</svg>
```

### Class requirements inside the groups

| Element | Class |
|---|---|
| 3 tail wisps inside `#cumul-tail` | `cumul-tail__wisp cumul-tail__wisp--a` / `--b` / `--c` |
| Detachable particles inside `#cumul-puffs` | `cumul-puff cumul-puff--a` / `--b` / `--c` |

These classes drive CSS keyframes (pulse, ondulation, puff-detach)
defined in [global.css](../src/styles/global.css). The wisps must be
positioned so they read as "trailing behind" — the `cumul-tail__wisp`
animation translates them leftward with a scale skew.

---

## SmokePuff — `src/components/svg/gabo/SmokePuff.tsx`

The POUF! transition flourish played during every pose crossfade.

**viewBox**: `0 0 200 240` (same as Gabo poses, so it overlays centered)

Loose structural requirements:

- A small central cloud-puff silhouette (approx. 60–80px radius at
  center `(100, 120)`)
- 4–6 small puff satellites around the edges, ready to animate outward
- Optional: a tiny "POUF !" hand-lettered text above the puff
- Line work `var(--ink)`, fills `var(--cumul-base)` + `var(--cumul-highlight)`

GSAP will tween the outer puffs outward + fade, and scale the central
blob, over ~300ms.

---

## Build-time verification

After dropping new files in place:

```bash
pnpm dev        # visit localhost:4321
pnpm astro check
pnpm build
```

Check in-browser:
1. Home renders pos1 next to an animated Cumul; halo wobbles, wings
   flap, Cumul bobs + tail wisps + puff particles animate
2. Click a project cloud → pos1 fades out + POUF! → pos2 appears →
   Cumul flies along MotionPath → POUF! on arrival → project pose
   appears (`parked`)
3. Click "← Back to sky" → reverse flow, POUF! on departure, POUF! at
   home → pos1 idle again
4. Every pose blinks, halo wobbles; no drop-shadow filters; strokes
   consistent 2.5px
5. `prefers-reduced-motion` → all POUF! and scaling disabled; transitions
   cut instantly

---

## Things **not** to do

- ❌ Don't change the `viewBox` on any Gabo pose (must stay `0 0 200 240`)
- ❌ Don't change the Cumul `viewBox` (must stay `0 0 260 140`)
- ❌ Don't rename any `id` attribute listed above
- ❌ Don't delete a required sub-group (`gabo-wings`, `gabo-halo`,
  `gabo-eyes`, `gabo-mouth` etc.) even if it's not visually prominent in
  a specific pose — the shared CSS keyframes target these selectors
- ❌ Don't bring back `gabo-costume-body` / `gabo-costume-head` slots —
  the old overlay system is deprecated
- ❌ Don't hardcode colors — always use CSS variables from the token
  layer
- ❌ Don't add drop-shadow filters on character parts
- ❌ Don't convert inline SVG to `.svg` imports — the components are
  intentionally inline JSX so CSS variables + animations work

---

## Questions?

Open the placeholder files in
[../src/components/svg/gabo/poses/](../src/components/svg/gabo/poses/)
— they demonstrate the expected structure, just with primitive shapes
instead of illustrated ones.

When in doubt, match the reference images in `../references/` for
silhouette + proportion, but respect the ligne-claire style rules above.
