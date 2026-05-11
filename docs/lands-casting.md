# Lands casting — The Angel You Need

> Visual casting of the six project lands. Each land is a floating
> piece of territory carrying its project's identity through
> architecture and inhabitants, not through logos.
>
> See [SPEC.md](../SPEC.md) for the broader product spec and
> [angel-system.md](angel-system.md) for the character runtime.

---

## 1. World concept

Gabo and Cumul travel across a sky populated by **floating lands** —
small pieces of territory suspended in mid-air, each one home to one
project. Lands are cross-sectioned (Laputa-style: rock and earth
visible underneath), all roughly the same size, viewed from the front.

The sky background stays stable — a clean Toriyama blue, not tweened
per project. Each project's identity lives **on its land**, not in the
sky around it.

Cumul remains the only cloud-like element in this world. The contrast
makes him more special, not less.

---

## 2. Design principles

- **Icon-level readability from afar.** The silhouette and one or two
  distinctive elements must announce which project this is at a glance.
  Detail is reserved for the interior scene.
- **All lands are the same size.** No project is visually privileged
  over another from the world map. Hierarchy lives in the content,
  not in the geometry.
- **Architecture and inhabitants carry the brand**, not logos.
  Toriyama reference: Bulma's capsule house, Karin's tower, Kaio's
  planet — each place has a signature silhouette that *is* its mark.
- **Brand palette tints the land**, but the line work stays consistent
  with the rest of the world (ligne claire, flat fills, cel-shading).
- **Ambient decoration belongs to the land**, drifting in its
  immediate vicinity rather than altering the global sky.

---

## 3. The six lands

### Told — The Toldies' village

Round rocky plateau with a small central kiosk or village square.
The land itself is intentionally simple — its identity is carried by
its **inhabitants**: a population of Toldies (the product mascots)
going about their day, queueing, holding feedback signs, milling
around.

- **Land shape:** soft circular plateau, slightly curved underside
- **Signature elements:** crowd of Toldies, central gathering point
- **Ambient motion:** Toldies pacing, occasional small clusters forming
- **Palette:** golden / warm orange (existing `golden dawn` theme)

---

### Culture-Relax — The neighbourhood cinema

A stylised cinema façade sits on the land: lit marquee, painted
poster, a small queue at the entrance. Film reels orbit gently
overhead and a projector beam crosses the local sky.

- **Land shape:** wider rectangular plateau (theatre footprint)
- **Signature elements:** marquee with bulbs, painted poster, ticket queue
- **Ambient motion:** floating film reels, projector beam pulse
- **Palette:** sunset orange / red (existing theme)

---

### Evolt — The workshop table

Open plateau with a large central meeting table. Coloured post-its
(yellow, pink, blue) orbit the land, occasionally re-arranging into a
grid (persona mapping) or columns (kanban board). A modern building
silhouette sits in the background to hint at the enterprise context
(Royal Canin, SNCF, Crédit Agricole) without making it the focus.

- **Land shape:** flat rectangular plateau, slightly tilted
- **Signature elements:** workshop table, post-it constellation,
  background corporate silhouette
- **Ambient motion:** post-its drifting and re-snapping into formations
- **Palette:** corporate blue (existing theme)

---

### Cosmdinos — The space-dino asteroid

Pointy, irregular rocky asteroid. ETH crystals erupt from the surface
like geodes. Small dinosaurs in space suits roam the land — Toriyama
already drew dinosaurs in Dr. Slump and early Dragon Ball, so the
visual lineage is direct. A ring of smaller asteroids orbits the main
land; local stars dot the immediate sky.

- **Land shape:** jagged asteroid, irregular silhouette
- **Signature elements:** ETH crystal geodes, space-suited dinos,
  asteroid ring
- **Ambient motion:** dinos walking, asteroids orbiting, stars twinkling
- **Palette:** night purple / NFT accents (existing theme)

---

### Eveia — The heart monument

A giant cartoon heart sits on the land like a monument, beating
slowly. Vital-sign waveforms rise around it as holographic graphs.
More metaphorical than the others, more signature — Eveia's identity
is the *symbol* of health, not the equipment.

- **Land shape:** soft green hill, organic
- **Signature elements:** monumental beating heart, floating
  ECG-style waveforms
- **Ambient motion:** heart pulse (slow scale), waveforms scrolling
- **Palette:** mint pastel green (existing theme)

---

### Fofly API — The perched runway

Plateau with a short runway, a small hangar, and a windsock. Cartoon
planes loop in and out — taking off, banking, landing. Stylised
clouds drift nearby to signal altitude and travel.

- **Land shape:** elongated rocky plateau, runway-shaped
- **Signature elements:** runway with markings, hangar, windsock,
  looping planes
- **Ambient motion:** planes on a loop trajectory, windsock wavering
- **Palette:** deep blue + gold (existing theme)

---

## 4. Open decisions

- **Terminology** (`island` vs `land`) — pending. Affects component
  names, ARIA labels, and prose copy across the site.
- **Asset pipeline** — AI generation + vectorisation (à la Gabo) vs
  hand-authored SVG.
- **Build order** — prototype one land first (Cosmdinos is the
  visually richest candidate) to validate the grammar before
  migrating the remaining five.
- **Migration impact** — `SPEC.md` sections 4, 7, 8, 9, 11, 13, 16
  to update; `CloudMarker` → `IslandMarker` rename; sky-background
  colour tween to remove. The Gabo + Cumul system (state machine,
  poses, POUF!, `useFlyTo`) stays untouched.