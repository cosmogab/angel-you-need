# The Angel You Need — Portfolio of Gabriel Miro

> An interactive 2D portfolio where Gabo — a blond angel drawn in early
> Akira Toriyama style — rides his magical cloud Cumul across a living sky
> and helps projects take flight.

---

## 1. Project Overview

**Tagline:** The Angel You Need.

**Concept:** An interactive 2D portfolio where a cartoon angel named Gabo
(representing Gabriel, a senior full-stack engineer) rides his magical
cloud "Cumul" across a living sky dotted with floating project islands.
Gabo "helps" each project — when a visitor clicks an island, he flies to
it on Cumul, lands beside it, and the island opens into a full interior
scene showing the work done.

**Goal:** Land senior / lead / freelance roles by being memorable. This
is not a CV page — it's a signature piece that demonstrates craft,
product thinking, and narrative sensibility alongside technical skills.

**Audience priority:**
1. CTOs and tech leads evaluating a senior hire
2. Founders looking for a lead engineer or technical co-founder
3. Agencies / freelance clients for contract work

---

## 2. Tone & Personality

- Playful but premium (not childish)
- Confident without being arrogant
- Narrative-driven (tells a story, doesn't just list facts)
- Craft-obsessed (every detail matters)
- Warm and helpful — the angel metaphor is generous, not cold

**Three adjectives to guide every decision:** playful, confident, crafted —
with a hand-drawn manga warmth.

---

## 3. Inspirations

- **Akira Toriyama's early Dragon Ball art** (1984-1988 era, kid Goku period)
- **Dr. Slump** (Toriyama's earlier, rounder work)
- **Studio Ghibli films** (sky aesthetic, warmth, 2D charm)
- **Monument Valley** (geometric dreaminess, puzzle-like clarity)
- **Awwwards "Site of the Day" winners** (for polish benchmark)
- **Apple product pages** (transitions and scroll choreography)

**Anti-inspirations (avoid at all costs):**
- Generic developer portfolios (dark bg, green terminal text, Matrix vibe)
- Corporate agency sites (stock photos, gradients, "let's talk" CTAs)
- Over-designed Wix / Squarespace templates
- Any use of emojis in the UI
- AI-generated illustrations that look synthetic or 3D-rendered
- Modern anime tropes post-2010 (over-detailed, over-muscled)
- Dark edgy aesthetic

---

## 4. Core Concept — The Sky Map

**Main view:** A 2D sky map (16000×11200px world) with scattered
project islands, explorable via click-and-drag panning (like Google
Maps). Gabo roams freely on his cloud; clicking an island sends him
flying toward it on a curved path.

**Navigation:**
- Drag to pan the sky
- Click a project island → Gabo flies to it + interior scene opens
- Click empty sky → Gabo flies to that point and idles
- Mini-map (bottom-right corner) shows the full sky and current position
- Project index dropdown (in nav bar) for direct access
- Keyboard: arrow keys pan, Tab cycles islands, Enter opens focused island

**Sky theming:** The world sky is a stable double gradient anchored to
the world coordinates — a horizontal time-of-day sweep (night → sunset →
midday → golden hour → pre-dawn, left to right), interpolated in OKLCH
so warm↔cool transitions stay clean instead of dipping through muddy
gray, plus a soft vertical atmospheric depth overlay. It pans with the
islands and never animates. Per-project ambiance lives on the islands
themselves (architecture, inhabitants, ambient decoration) and inside
the interior scene, not in the sky around them.

**No imposed order:** Visitors explore freely. No "scroll down for more".
The sky is a playground.

---

## 5. The Character — Gabo & His Cloud

### Identity
- **Name:** Gabo (diminutive, friendly, memorable)
- **Role in narrative:** An angel who helps products take flight. He
  doesn't fight — he lifts things up.
- **Age appearance:** 10-12 years old
- **Personality:** Playful, curious, confident, helpful. Never arrogant.

### Visual Design
- **Hair:** Vivid golden blond (`#FFD93D`) in medium-length pointed
  spikes, combed slightly back — signature element, distinct from Goku
- **Body:** Chibi-leaning proportions, small frame, large head
- **Eyes:** Large, shiny black pupils with single white highlight dot,
  expressive brows
- **Default expression:** Cheeky confident smile, mouth slightly open
- **Halo:** Small golden ring (`#FFD93D` glowing) floating above head,
  wobbles slightly on movement
- **Wings:** Small white feathered cartoon wings on back, visible in
  3/4 and side views
- **Base outfit:** White sleeveless monk tunic (`#FFFFFF`) with gold belt
  (`#E8A94A`) and small gold buckle, bare feet

### Art style rules (non-negotiable)
- **Ligne claire** — bold consistent black outlines (2.5px, round caps)
- **Flat fills** — no gradients, no soft shadows, no blending
- **Cel-shading** — shadows = distinct darker flat-color zones
- **Saturated vibrant palette** — early Toriyama energy
- **Reference era:** Akira Toriyama 1985-1988 (early Dragon Ball +
  Dr. Slump), NOT DBZ late era

### The Cloud Mount — "Cumul"
- Gabo's personal magical cloud, his only mode of transport
- **Color:** Pearl white (`#FFFBF0`) with warm gold highlights (`#FFE8B0`)
  and soft cream shadows (`#E6D9B8`)
- **Shape:** Oval base with 5-7 rounded fluffy puffs, wispy trailing tail
- **Distinct from project islands:** Cumul is the only cloud Gabo rides
  — the projects themselves are floating islands. Cumul has a tail and
  animates constantly; islands are stationary anchors that hold scenes.
- **Behavior:** Follows Gabo, summoned by whistle, hovers in place,
  glides smoothly on path
- **Animation:** Constant subtle pulsing (scale 0.98 → 1.02 over 2s),
  tail wisps ondulate, occasional small puff-particles detach and fade

### Poses — 2 bundled illustrations (V1)

Gabo is not a modular paper-doll. He is drawn as **2 complete poses** for
V1, each a self-contained SVG with identical `viewBox` (`0 0 200 240`) so
the browser can crossfade between them. Project-specific costumes are
deferred to a later version.

| # | Component | Pose |
|---|---|---|
| 1 | `GaboPose1` | Standing next to Cumul at home, waving |
| 2 | `GaboPose2` | Clinging to Cumul in flight, hair trailing, leaning forward |

Each pose SVG must contain the sub-groups `gabo-wings`, `gabo-halo`,
`gabo-eyes`, `gabo-mouth` (plus `gabo-body`, `gabo-head`, `gabo-hair`,
`gabo-face`, `gabo-expression`) so the shared CSS keyframes (halo wobble,
blink, wing flap, mouth yawn) keep working across every pose.

### States (animated)

| State | What happens |
|---|---|
| `idle-home` | pos1 — Gabo stands next to Cumul, waves periodically, halo wobbles, wings twitch, Cumul bobs (2s loop) |
| `idle-mischief` | After ~30s idle at home: random mini-anim on pos1 (wave variant / yawn / balance / halo spin) |
| `departing` | pos1 → pos2 via POUF! smoke puff transition (~500ms) |
| `traveling` | pos2 — Gabo clings to Cumul along the GSAP MotionPath toward the target island, hair trailing |
| `arriving` | pos2 — Gabo lands at the island anchor on Cumul |
| `parked` | pos1 — Gabo idles on Cumul next to the island while the interior scene is open |
| `leaving` | pos1 → pos2 via POUF! smoke puff |
| `returning` | pos2 — flies back to home anchor along return path |
| (home reached) | pos2 → pos1 via POUF! smoke puff |

### Transitions — the "POUF !" crossfade

Pose-to-pose changes use a **crossfade with a cartoon smoke puff** (style
Toriyama, "POUF !") rather than SVG path morphing. This is both
stylistically honest and technically simple — no paid GSAP plugin, no
brittle path interpolation.

Sequence (~500ms, GSAP timeline):
1. Outgoing pose: fade-out + scale 0.9 (180ms)
2. `SmokePuff` SVG: expand + fade at pose center (300ms, overlaps)
3. Incoming pose: fade-in + scale 1 from 0.9 (180ms, overlaps)
4. `SmokePuff` dissipates

`prefers-reduced-motion` → skip puff, jump straight to final pose.

### Implementation plan

**V1 (AI-assisted vectorization):**
- Generate raster references with Midjourney v6/v7 using `--sref` pointed
  at scans of early Toriyama pages (1985–1988). pos1 is generated first;
  pos2 follows using pos1 as character reference (`--cref`).
- Vectorize each pose manually in Adobe Illustrator (pen tool over a
  locked raster reference layer — never Image Trace).
- Export SVG, optimize with SVGO, replace hex values with CSS tokens,
  inline into the corresponding React component under
  `src/components/svg/gabo/poses/`.

**V2 (professional illustrator upgrade + project costumes, post-v1):**
- Commission a manga illustrator to redraw pos1 + pos2 and to author the
  6 project costume poses (one per project island).
- Same `viewBox`, same required sub-group IDs, same CSS token palette →
  V2 files drop into the existing components with minimal code changes.
- The full contract lives in `docs/illustrator-brief.md`.

---

## 6. Site Structure

```
/                        → Sky map (main experience)
/projects/told           → Told interior scene
/projects/culture-relax  → Culture-Relax interior scene
/projects/evolt          → Evolt interior scene
/projects/cosmodinos     → Cosmodinos interior scene
/projects/eveia          → Eveia interior scene
/projects/fofly-api      → Fofly API interior scene
/about                   → Long-form about page (fallback)
/contact                 → Contact page (fallback)
```

**Note:** Interior scenes open as immersive overlays from the sky map
(preferred flow). The dedicated URLs exist for SEO, direct linking,
and accessibility fallback. They render the same scene content as
standalone pages with a "← Back to sky" button.

---

## 7. Intro Cloud (Landing)

When the site first loads, the camera centers on the intro cloud.
Gabo stands next to Cumul (pos1, `idle-home` state), waving. A large
title reads:

> **The Angel You Need.**
>
> Gabriel Miro — Senior Full-Stack Engineer.
>
> Seven years helping SaaS products, APIs, and AI features take flight.
>
> *Drag the sky to explore. Click an island to land.*

Hint text fades after 4 seconds of inactivity.

---

## 8. Interior Scene Template

Each project island opens into a scene. Structure:

### A. Entrance transition (GSAP timeline, ~1.5s)
- Gabo flies to the island anchor on Cumul (pos2, `traveling` state)
- On arrival: pose returns to pos1 (`parked` state) next to the island
- Island opens into the interior scene that fills the viewport
- Sky color tweens to project's theme
- UI fades in
- Cumul remains visible at a corner (he "parked" outside)

### B. Scene content (all inside the opened scene)
1. **Project title** — huge display font, italic/accent on one word
2. **Meta row** — date · role · team size · status
3. **The Context** — 2 short paragraphs (why the project existed)
4. **My Role** — 1 paragraph (what I owned)
5. **What I Built** — bulleted list of concrete deliverables
6. **Tech Stack** — grid of tech with icons + one-line notes
7. **Impact** — 1-4 big stat blocks (display-font numbers)
8. **Ambient decoration** — project-specific background elements that
   drift slowly (e.g. Told: floating event dots; Cosmodinos: ETH symbols;
   Fofly: tiny planes)

### C. Exit
- "← Back to sky" button top-left
- Reverse transition: scene closes back into the island, sky returns to previous theme
- POUF! smoke puff crossfade → Gabo back to pos2 (`leaving`), flies home
  along return path (`returning`), final POUF! at home anchor → pos1
  (`idle-home`)

---

## 9. Project Data

All project content lives in `src/content/projects/*.md` as Astro Content
Collections with typed frontmatter. One file per project. This keeps
content editable without touching components.

### Told
- **Category:** SaaS Platform
- **Period:** 2023 – 2026
- **Role:** Senior Full-Stack Engineer
- **Team:** 2–3 developers (led)
- **Status:** Shipped and running
- **Sky theme:** golden dawn
- **Context:** Told is a B2B SaaS survey product that embeds conversational
  surveys directly into client websites.
- **My role:** End-to-end ownership — system design, frontend, backend,
  data modeling, infrastructure, and leading a small remote team. Also
  shipped all AI and MCP features.
- **What I built:**
  - Full product architecture from scratch: React/TypeScript frontend,
    Node.js/GraphQL backend, MongoDB data layer
  - Embeddable JavaScript survey widget deployed across 1,000–5,000
    client websites with cross-domain integration
  - Backend processing 10M+ events/month on Kubernetes with AWS S3/RDS
  - LLM-powered text and voice chatbot for product feedback
  - MCP tooling to expose product capabilities to AI workflows
  - Onboarding flows improving activation and self-serve adoption
  - Led a remote team of 2–3 developers
- **Tech stack:** typescript, react, nodejs, graphql, mongodb, aws,
  kubernetes, docker, jest
- **Impact stats:**
  - 10M+ events processed monthly
  - 5K client websites using the widget
  - 3 developers led remotely

### Culture-Relax
- **Category:** Contract — Full-Stack
- **Period:** Jun 2025 – Dec 2025
- **Role:** Full-Stack Developer (Contract)
- **Team:** Solo
- **Status:** Shipped
- **Sky theme:** orange sunset
- **Context:** A cultural leisure platform serving over 400,000 monthly
  visitors, with legacy debt slowing down feature delivery.
- **My role:** Contract engineer brought in to modernize the stack,
  ship major features, and improve maintainability.
- **What I built:**
  - Refactored legacy frontend and back-office
  - Migrated and upgraded Strapi CMS with zero downtime
  - Shipped several major product features
  - Integrated email automation and marketing systems
- **Tech stack:** strapi, nodejs, react, typescript, postgresql
- **Impact stats:**
  - 400K+ monthly visitors
  - Zero downtime during migration

### Evolt
- **Category:** SaaS for Enterprise
- **Period:** Jan 2019 – Dec 2022
- **Role:** Lead Full-Stack Developer
- **Team:** 4–5 developers (led)
- **Status:** Shipped
- **Sky theme:** clear corporate blue
- **Context:** Collaborative SaaS apps for product ideation, persona design,
  and UX mapping — used by Royal Canin, SNCF, and Crédit Agricole.
- **My role:** Technical lead managing 4–5 developers across product
  delivery and architecture.
- **What I built:**
  - Led development of multiple collaborative SaaS apps
  - Managed a team of 4–5 developers
  - Designed GraphQL architecture for multiple enterprise deployments
  - Implemented CI/CD pipelines and automated testing with Jest
  - Delivered platforms used by Royal Canin, SNCF, Crédit Agricole
- **Tech stack:** graphql, nodejs, react, typescript, jest, gitlab, docker
- **Impact stats:**
  - 4 years leading the team
  - 3 Fortune-tier enterprise clients
  - 4–5 developers managed

### Cosmodinos
- **Category:** Web3 / NFT
- **Period:** 2022
- **Role:** Tech Lead (Contract)
- **Team:** Solo
- **Status:** Shipped
- **Sky theme:** purple night with stars
- **Context:** A Web3 platform built around a custom NFT marketplace,
  enabling peer-to-peer trading without OpenSea fees and friction.
- **My role:** Tech lead for full-stack implementation and smart contract
  layer.
- **What I built:**
  - Led full-stack Web3 platform and NFT marketplace
  - Developed Ethereum smart contracts in Solidity enabling direct trading
  - Platform reached 10,000+ users and 3,000 ETH trading volume
- **Tech stack:** solidity, ethereum, react, nodejs, typescript, web3js
- **Impact stats:**
  - 10,000+ users
  - 3,000 ETH trading volume

### Eveia
- **Category:** Connected Health / Mobile
- **Period:** Jan 2022 – Dec 2022
- **Role:** Full-Stack & Mobile Lead
- **Team:** Cross-functional
- **Status:** Shipped
- **Sky theme:** soft pastel mint
- **Context:** A connected health product combining a mobile app, a
  back-office, and wearable integrations for daily wellness tracking.
- **My role:** Led the entire product — design, architecture, roadmap,
  team.
- **What I built:**
  - End-to-end product leadership
  - Back-office and backend with Node.js + GraphQL
  - Mobile apps on React Native (iOS + Android)
  - Features: activity tracking, step counting, wellness metrics
- **Tech stack:** reactnative, nodejs, graphql, typescript, mongodb
- **Impact stats:**
  - End-to-end product ownership
  - iOS + Android shipped

### Fofly API
- **Category:** API Platform — In Progress
- **Period:** Mar 2026 – Present
- **Role:** Founder (solo)
- **Team:** Solo
- **Status:** Live, shipping
- **Sky theme:** tech deep blue with stars and data-viz cloud accents
- **Context:** A developer-first API aggregating flight, weather, and
  turbulence data into a single normalized product.
- **My role:** Founder and sole builder.
- **What I built:**
  - API platform aggregating flight, weather, turbulence data
  - Stack: Supabase, Docker, Next.js with AI processing
  - Data pipelines normalizing external travel signals
- **Tech stack:** nextjs, supabase, docker, typescript, openai
- **Impact stats:**
  - Live — currently shipping
  - 3 data sources aggregated

---

## 10. Tech Stack

- **Framework:** Astro (v5+)
- **UI islands:** React 19 + TypeScript (only where interactivity needed)
- **Animation:** GSAP 3.x with MotionPathPlugin
- **Styling:** Tailwind CSS 4
- **Content:** Astro Content Collections (typed Markdown with Zod schemas)
- **Icons (tech stack):** Simple Icons via CDN
- **Illustrations:** Custom hand-authored SVG (Gabo, Cumul, islands, decor)
- **Sound (phase 2, optional):** Howler.js
- **Deployment:** Vercel (free tier)
- **Node version:** LTS (22+)
- **Package manager:** pnpm

---

## 11. Design Tokens

### Character palette (Gabo)
```css
--gabo-hair:         #FFD93D;  /* vivid golden blond */
--gabo-hair-shadow:  #E8B820;  /* cel-shading */
--gabo-skin:         #FFE0B8;  /* warm peach */
--gabo-skin-shadow:  #E8B88A;
--gabo-tunic:        #FFFFFF;
--gabo-tunic-shadow: #E8E0D0;
--gabo-belt:         #E8A94A;  /* gold */
--gabo-halo:         #FFD93D;  /* glowing gold */
```

### Cloud palette (Cumul — personal mount)
```css
--cumul-base:      #FFFBF0;  /* pearl white */
--cumul-highlight: #FFE8B0;  /* warm gold */
--cumul-shadow:    #E6D9B8;  /* cream shadow */
```

### Sky base (default)
```css
--sky-base:   #7DC4F0;  /* vivid cartoon sky blue */
--sky-accent: #FFD97A;  /* warm golden highlight */
--ink:        #1A1613;  /* line work, ligne claire */
--cream:      #FFF8E8;  /* text backgrounds on dark */
```

### World sky (composite gradients)
The world map's sky is a stable double gradient that spans the full
16000×11200 world and pans with the islands. Defined as composite tokens
so the gradients live in one place; encapsulating the whole stop list
behind a single token avoids creating a dozen one-off color tokens.
```css
--world-sky-horizontal: /* night → sunset → midday → golden → pre-dawn */
--world-sky-vertical:   /* dark zenith, transparent middle, warm horizon */
```
The horizontal sweep uses `linear-gradient(in oklch ...)` so the
warm↔cool transitions interpolate perceptually and avoid the muddy gray
midpoints RGB blending produces. Authoritative reference:
`references/sky-mockup.html`. Both layers are plain alpha-composited; no
`mix-blend-mode`. The sky never animates.

### Per-project sky themes
The `--sky-base` / `--sky-accent` palettes below are used for **island
tinting and interior scenes only** — not for the world sky. Applied via
`html[data-sky="..."]` on standalone project pages and on the
`InteriorScene` overlay.

- **Told:** `--sky-base: #FFB347`, `--sky-accent: #FF6B35` (vivid sunrise)
- **Culture-Relax:** `--sky-base: #FF6B5B`, `--sky-accent: #C62E1F` (sunset)
- **Evolt:** `--sky-base: #5BA3E0`, `--sky-accent: #2D6FAF` (corporate blue)
- **Cosmodinos:** `--sky-base: #2E1B5C`, `--sky-accent: #9B5FE0` (night purple)
- **Eveia:** `--sky-base: #7ED8B0`, `--sky-accent: #3FB085` (vivid mint)
- **Fofly API:** `--sky-base: #1E3A7A`, `--sky-accent: #FFC947` (blue + gold)

### Typography
- **Display / serif:** Fraunces (italic axis, for editorial prose)
- **Display / cartoon:** Bangers (manga-panel punch, short words only)
- **Body sans:** Inter Tight
- **Monospace:** JetBrains Mono

**Rule:** Fraunces for elegance and long text. Bangers ONLY for project
names, stats, and hero titles — never for body text.

### Line work
- Ligne claire stroke weight: 2.5px consistent
- Stroke color: `--ink` (#1A1613), never pure black
- Line caps and joins: round
- No drop shadows on characters, only cel-shading

### Spacing & layout
- Tailwind default spacing scale
- Border radius: `rounded-lg` for UI cards, organic paths for clouds

---

## 12. Non-Goals (out of scope, first version)

- No blog
- No dark mode toggle (sky theming already provides variation)
- No i18n (English only, French intro optional in nav)
- No CMS / admin panel (content lives in Markdown)
- No analytics beyond Vercel's built-in
- No contact form (mailto link is enough)
- No 3D, no WebGL (2D SVG only — simpler and more stylish)
- No mobile app
- No animation library beyond GSAP
- No login / user accounts ever
- No AI chatbot / assistant on the site

---

## 13. Accessibility

- Full keyboard navigation (Tab through islands, Enter to open)
- Each island has a meaningful `aria-label`
- `prefers-reduced-motion` respected:
  - Gabo stops animating but remains visible
  - Cumul becomes static
  - Scene transitions become instant
  - Parallax disabled
  - Floating decorations paused
- Color contrast WCAG AA minimum on all text
- Semantic HTML on fallback pages
- Alt text on all illustrations
- Focus indicators visible (custom halo-style ring)
- Skip-to-content link for screen readers

---

## 14. Performance Targets

- Lighthouse Performance: ≥ 95
- Lighthouse Accessibility: 100
- Lighthouse Best Practices: 100
- Lighthouse SEO: 100
- Bundle size per page: < 150 KB JS gzipped
- LCP: < 1.5s
- CLS: 0
- Total SVG character assets: < 80 KB combined

---

## 15. SEO

- Unique title + meta description per project page
- Open Graph image per project (generated at build from a template)
- Structured data: `Person` + `WebSite` JSON-LD schemas on home
- Sitemap.xml auto-generated
- robots.txt with proper rules
- Canonical URLs
- French + English hreflang tags if i18n is added later

---

## 16. Definition of Done

The site is "done" (v1.0) when:

- [ ] Sky map navigation works (drag, click, mini-map, keyboard)
- [ ] Gabo cycles through `idle-home` / `traveling` / `parked` states
      smoothly, with POUF! crossfade transitions between pos1 and pos2
- [ ] Cumul animates constantly and distinctly from project islands
- [ ] All 6 project islands are placed and clickable
- [ ] All 6 interior scenes render with full content
- [ ] Sky theming transitions per project
- [ ] Intro cloud with tagline displays on first load
- [ ] Fully responsive (works on phone with touch pan + tap)
- [ ] `prefers-reduced-motion` disables animations gracefully
- [ ] Lighthouse scores hit targets above
- [ ] Keyboard navigation complete
- [ ] Deployed on Vercel with custom domain

---

## 17. Future Ideas (post-v1)

- Sound design (ambient sky + SFX on interactions, mute toggle)
- Hidden easter-egg islands (Konami code reveals a bonus island)
- Animated transitions between projects via Gabo flying path
- "Visit me" cloud that zooms to current location (Medellín)
- French language toggle
- Open-source the Gabo SVG system as a kit
- Commission a professional manga illustrator (V2 of character assets)
- Ambient weather effects per sky theme (stars on Cosmodinos, aurora on
  Fofly, leaves drifting on Culture-Relax sunset)
- Visitor counter shown as "souls helped" on the intro cloud
