# The Angel You Need

> An interactive 2D portfolio where **Gabo**, a blond angel drawn in early
> Akira Toriyama style, rides his magical cloud **Cumul** across a living
> sky and helps projects take flight.

Built as the signature portfolio of **Gabriel Miro** — senior full-stack
engineer, 7+ years shipping SaaS products, APIs, and AI features.

Not a CV page. A playground.

---

## Quickstart

```bash
pnpm install
pnpm dev        # localhost:4321
pnpm build      # static output → dist/
pnpm preview    # serve built output locally
pnpm astro check  # type + content schema check
```

Requires Node 22+ and pnpm 10+.

---

## What's shipped (Phases 1–6)

| Phase | Highlights |
|---|---|
| 0 | Scaffold, design tokens, fonts, content schema, BaseLayout, standalone pages |
| 1 | Sky map 3000×2000 (later 4000×2800) — pointer/wheel/keyboard pan, mini-map, 6 cloud markers |
| 2 | Gabo + Cumul placeholder SVGs with V2-swap-compatible group structure, state machine, idle animations (bob, halo wobble, blink, cloud pulse, tail wisps) |
| 3 | GSAP MotionPath flights, flying posture, sky theming via CSS var tweens, manga speed lines that follow flight direction |
| 4 | 6 costume overlays with two-slot split (body / head), cloud-expand interior scene with URL routing (`history.pushState` + popstate), 6 ambient decor templates |
| 5 | Intro cloud landing with tagline + welcome wave + hint that fades, home button (Tab-first), mini-map home marker, motion polish |
| 6 | Lazy-loaded InteriorScene, per-project `CreativeWork` JSON-LD, per-project SVG OG images at build, contrast fix on dark themes, focus restoration on overlay close |

**Not yet run (manual steps before first deploy):**
Lighthouse audits · axe pass · keyboard walkthrough · reduced-motion walkthrough · responsive 375/768/1440/2560 audit · Vercel deploy. See [docs/deploy.md](./docs/deploy.md).

---

## Interaction model

- **Press & hold** anywhere on the sky — Gabo seeks toward the pointer while held (900 world units/sec). Release → stops.
- **Click a project cloud** — GSAP flight with curved arc + costume swap + sky tween + cloud-expand scene.
- **Wheel / arrow keys** — pan the camera only (Gabo stays put).
- **Mini-map click** — one-shot fly-to-point.
- **Nav Projects dropdown** — flight (or snap when an overlay is open).
- **Proximity** — whenever a cloud's center is inside the visible viewport, sky theme + costume tween to that project. Responsive via `viewport.w/h`.

---

## Project structure

```
src/
├── components/
│   ├── astro/           # static layout (Head, Nav, Footer, BaseLayout, SkyBackground)
│   ├── react/           # interactive islands (SkyMap, AngelSystem, InteriorScene, IntroCloud, CloudMarker, MiniMap, SpeedLines, AmbientDecor)
│   └── svg/
│       └── gabo/        # Cumul.tsx, SmokePuff.tsx, poses/{GaboPose1,GaboPose2,GaboTold,GaboCultureRelax,GaboEvolt,GaboCosmdinos,GaboEveia,GaboFofly}.tsx
├── content/
│   ├── config.ts        # Zod schema for projects
│   └── projects/        # 6 markdown files — one per project
├── layouts/             # BaseLayout.astro
├── lib/
│   ├── angel-state.ts   # Gabo state machine + useAngelState hook
│   ├── gsap.ts          # GSAP registration + prefersReducedMotion helper
│   ├── sky.ts           # CSS-var-tween helpers for sky theming
│   └── use-fly-to.ts    # GSAP MotionPath flight hook
├── pages/
│   ├── index.astro      # home — mounts SkyMap as client:only="react"
│   ├── about.astro · contact.astro · 404.astro
│   ├── og/[slug].svg.ts # build-time per-project Open Graph images
│   └── projects/[slug].astro  # standalone SEO / no-JS fallback per project
├── styles/
│   └── global.css       # SPEC §11 design tokens + all animations
└── types/
    └── project.ts
```

See [docs/architecture.md](./docs/architecture.md) for how it fits together.

---

## Authoring a project

Each project lives in `src/content/projects/<slug>.md`. To add or edit one,
see [docs/content.md](./docs/content.md).

---

## Key references

- **[SPEC.md](./SPEC.md)** — source of truth for design, content, scope, tokens, non-goals. **Always check first.**
- **[CLAUDE.md](./CLAUDE.md)** — working rules for Claude Code collaboration (naming, commits, conventions).
- **[docs/architecture.md](./docs/architecture.md)** — how the sky map system is wired.
- **[docs/content.md](./docs/content.md)** — how to author or edit a project.
- **[docs/illustrator-brief.md](./docs/illustrator-brief.md)** — V2 manga artwork handoff contract.
- **[docs/deploy.md](./docs/deploy.md)** — pre-deploy manual audit + deploy steps.

---

## Tech

Astro 5 · React 19 · TypeScript strict · Tailwind 4 · GSAP 3.x +
MotionPathPlugin · @fontsource (Fraunces / Bangers / Inter Tight /
JetBrains Mono) · Astro Content Collections · Vercel static output.

---

## V1 placeholder notice

The Gabo and Cumul SVGs in [src/components/svg/gabo/](./src/components/svg/gabo/) are **placeholder geometric primitives** matching the Toriyama-era silhouette. V2 replaces them with commissioned artwork that must honor the SVG group structure documented in [docs/illustrator-brief.md](./docs/illustrator-brief.md).
