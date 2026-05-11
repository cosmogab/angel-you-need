# Claude Code — Working Rules for "The Angel You Need"

> Read this file at the start of every session. Read `SPEC.md` alongside it.
> Everything else follows from these rules.

---

## Project context

The project is a manga-style interactive portfolio for Gabriel Miro,
featuring an original character named **Gabo** (a blond angel in early
Akira Toriyama style) who rides his magical cloud **Cumul** across a sky
of project clouds.

**`SPEC.md` is the source of truth.** If something in SPEC.md is
ambiguous or missing, ask me before inventing.

---

## Core principles

### 1. Never invent content
All copy and project data must come from `SPEC.md` or from me directly.
If a text is missing, ask — do not fill in generic placeholder prose.
This includes microcopy (tooltips, labels, error states).

### 2. Plan before coding
For any task larger than a single file edit, propose a step-by-step plan
and wait for my approval before executing. I prefer "ask twice, code
once" over "code twice, ship once".

### 3. Small, logical commits
One concern per commit. Use conventional commits:
- `feat:` new feature
- `fix:` bug fix
- `refactor:` code change that neither fixes a bug nor adds a feature
- `chore:` tooling, config, dependencies
- `docs:` documentation only
- `style:` formatting, missing semi-colons, etc.
- `perf:` performance improvement
- `test:` adding or fixing tests

### 4. Respect the existing style
Match naming conventions, import order, and formatting of files already
in the repo. Do not reformat unrelated code in the same commit.

### 5. Semantic HTML first
Use `<section>`, `<article>`, `<nav>`, `<main>`, `<header>`, `<footer>`,
and proper heading hierarchy. Div soup is a smell. ARIA only when native
HTML can't do it.

### 6. CSS before JS
Prefer CSS animations and transitions when possible. GSAP is for
orchestration, trajectories (MotionPath), and complex timelines — not
for things `transition: transform 0.3s ease` can do.

### 7. Accessibility is non-negotiable
Every interactive element needs a keyboard path and an accessible name.
Respect `prefers-reduced-motion`. Color contrast WCAG AA minimum.

### 8. Performance budget
- Before adding a dependency, justify it
- Before adding a heavy asset, optimize it (SVGO for SVG, WebP for images)
- Lighthouse scores must stay green (see SPEC §14)

### 9. Design tokens are law
All colors, fonts, and spacing come from the design tokens defined in
SPEC §11. If you need a new token, propose it — don't hardcode values.

### 10. Gabo and Cumul are sacred
The angel and his cloud are the core of the site. Their SVG structure,
animation states, and costume swap system should be designed for
longevity. V2 will replace the V1 AI-generated artwork with
professional illustration — your structure must allow that swap
without rewriting components.

---

## Tech conventions

### Astro components (`.astro`)
Use for static layout, pages, SEO-critical content. Examples: `Nav`,
`Footer`, `BaseLayout`, `ProjectPage`.

### React islands (`.tsx`)
Only for genuine interactivity. Examples: `SkyMap`, `Gabo`, `Cumul`,
`InteriorScene`, `MiniMap`.

**Hydration strategy:**
- `client:visible` — default for below-the-fold islands
- `client:idle` — for non-critical interactivity
- `client:load` — only when justified (rare)

### TypeScript
- Strict mode on
- No `any` without a comment explaining why
- Prefer `type` for objects, `interface` when extending
- Narrow types aggressively — avoid `unknown` as a cop-out

### GSAP
- Import only what you use
- Register plugins once in `src/lib/gsap.ts`
- Always clean up timelines in `useEffect` return
- Respect `prefers-reduced-motion`:
  ```ts
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  if (reduceMotion) {
    gsap.set(target, finalState);  // jump to end
  } else {
    gsap.to(target, animation);
  }
  ```

### Tailwind
- Prefer utility classes
- Extract to components only when reused 3+ times
- Use design tokens via arbitrary values: `bg-[var(--sky-base)]`
- Never use arbitrary colors — always reference CSS variables

### File naming
- `kebab-case` for files: `sky-map.tsx`, `gabo-base.tsx`
- `PascalCase` for component names: `SkyMap`, `GaboBase`
- `camelCase` for utilities and hooks: `useAngelState`, `getCloudPath`
- `SCREAMING_SNAKE_CASE` for constants: `MAX_SKY_WIDTH`

---

## Folder conventions

```
src/
├── components/
│   ├── astro/              # .astro static components
│   │   ├── Head.astro
│   │   ├── Nav.astro
│   │   └── Footer.astro
│   ├── react/              # .tsx interactive islands
│   │   ├── SkyMap.tsx
│   │   ├── CloudMarker.tsx
│   │   ├── InteriorScene.tsx
│   │   ├── MiniMap.tsx
│   │   └── SkyBackground.tsx
│   └── svg/                # hand-authored SVG
│       ├── gabo/
│       │   ├── GaboBase.tsx
│       │   ├── Cumul.tsx
│       │   ├── costumes/
│       │   └── expressions/
│       └── clouds/
├── content/
│   ├── config.ts           # Zod schemas
│   └── projects/           # *.md project content
├── layouts/
│   └── BaseLayout.astro
├── lib/
│   ├── gsap.ts             # GSAP registration + shared
│   ├── sky.ts              # sky theming logic
│   ├── angel-state.ts      # state machine for Gabo
│   └── utils.ts
├── pages/
│   ├── index.astro
│   ├── projects/[slug].astro
│   ├── about.astro
│   └── contact.astro
├── styles/
│   └── global.css          # design tokens as CSS vars
└── types/
    └── project.ts
```

---

## Ask me first before

- Adding any dependency not listed in SPEC §10
- Creating a new page or route
- Changing design tokens (colors, fonts, spacing scale)
- Inventing content text
- Refactoring shared infrastructure (GSAP init, sky theming, angel system)
- Anything that touches the SVG structure of Gabo or Cumul — they are
  the core of the site and must stay swap-compatible with V2 illustrator
  work
- Changing the state machine for Gabo's animations
- Adding a new animation library or a 3D engine

---

## Ask me clarifying questions

At the start of each session, if my instruction is not fully specific,
ask **one round** of clarifying questions before proposing a plan.
Examples of good clarifying questions:
- "SPEC says X but Y is unclear. Which interpretation do you want?"
- "This could be implemented with approach A (trade-off X) or B
  (trade-off Y). Which do you prefer?"
- "Should I prioritize getting this working roughly first, or polish
  each phase before moving on?"

Don't ask questions that are already answered in `SPEC.md`.

---

## Testing & verification

Before declaring a task done:

- [ ] Run `pnpm dev` and verify the feature works in the browser
- [ ] Test keyboard navigation if you added interactive elements
- [ ] Test `prefers-reduced-motion` if you added animations (toggle in
      DevTools → Rendering)
- [ ] Test on mobile viewport (375px) if you changed layout
- [ ] Run `pnpm astro check` for type errors
- [ ] Run `pnpm build` to catch build-time issues
- [ ] For animation-heavy changes, describe the motion in your report
      (e.g. "Gabo eases out over 1.2s, halo wobbles on arrival")

---

## When stuck

If you're uncertain between two approaches:
1. Present both with concrete trade-offs
2. State which you'd pick and why
3. Let me decide

Do not pick silently and ship. I'd rather wait 2 minutes than refactor
later.

---

## Illustrations & references

Reference images for Gabo and Cumul live in `references/` (AI-generated
character sheets + style refs from early Toriyama work).

When implementing SVG illustrations:
- Match the reference silhouette and proportions
- Keep strokes consistent (2.5px, round caps, `--ink` color)
- Organize SVG into logical `<g>` groups for animation:
  - `<g id="gabo-head">` (hair, face, halo)
  - `<g id="gabo-body">` (torso, arms, legs)
  - `<g id="gabo-costume">` (swappable per project)
  - `<g id="gabo-wings">` (separate layer for animation)
- Use `<defs>` for reusable shapes
- Inline SVG in React, not imports from `.svg` files (for CSS var
  theming and easier animation)

---

## Content workflow

Project content lives in `src/content/projects/*.md` with typed
frontmatter. One file per project. Never hardcode project data in
components — always read it from Content Collections.

When I update SPEC.md with new or changed content, propagate it to
the matching `.md` file in the next commit.

---

## Deployment

- Target: Vercel (free tier)
- Branch `main` auto-deploys to production
- Pull requests get preview deploys
- Environment variables (if any) set in Vercel dashboard, never
  committed to the repo

---

## Final reminders

- This is a **signature piece**, not a quick freelance site. Take time.
- When something feels generic, it probably is. Push for specificity.
- When something feels over-engineered, it probably is. Simplify.
- Gabo should make the visitor smile. If it doesn't, something is off.
- Ship small, ship often, but never ship something you'd be embarrassed
  to show a design-sensitive CTO.
