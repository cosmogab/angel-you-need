# Deploy runbook

The site targets **Vercel static output** via `@astrojs/vercel`. First-time
deploy needs the manual browser audits below — they couldn't be automated
headlessly during development.

---

## Pre-deploy: manual audits

### 1. Lighthouse (Chrome DevTools → Lighthouse)

Run on the home and at least two project pages (dark theme + light theme).

Targets per SPEC §14:

| Category | Target |
|---|---|
| Performance | ≥ 95 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

Common gotchas:

- **LCP** can be dragged by the lazy InteriorScene chunk if it's fetched
  before first paint — it isn't, but verify. If LCP falls below 1.5s, add
  a `<link rel="modulepreload">` for the main SkyMap chunk to the head.
- **CLS** must be 0. Check that font loading doesn't shift layout
  (@fontsource files are self-hosted — they should not).
- **"Avoid long main-thread tasks"** may flag GSAP. Only matters if the
  flag is red; yellow is fine for the budget.

### 2. axe DevTools (Chrome extension)

Scan home + one project page. Expected: **0 issues**.

Watch for false positives:

- The `.angel-system` SVG has `pointer-events: none` + `aria-hidden="true"` — axe might flag it; it's decorative.
- "Landmarks must have a unique role" — the `role="application"` on `.sky-map` is intentional (it's an interactive experience region).

### 3. Keyboard walkthrough

Fresh page load:

1. Tab → Skip-to-content link (visible top-left)
2. Tab → Nav brand, Projects dropdown, About, Contact
3. Tab → **Home button** in the intro area (first focusable inside the sky)
4. Tab through the 6 project clouds in `order` sequence (Told → Evolt → Culture-Relax → Eveia → Cosmdinos → Fofly API)
5. Enter on Home → Gabo flies back to center
6. Enter on Told → flight + overlay opens + close button auto-focused
7. ESC → overlay closes + focus returns to the Told cloud button
8. Verify the halo ring focus indicator is visible on every step

### 4. Reduced-motion

DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`. Reload.

- Gabo still visible, static (no bob, halo wobble, blink)
- Cumul static (no pulse, no tail ondulation, no puff detach)
- **No speed lines during flights** (`.speed-lines { display: none }`)
- Sky tweens snap instantly
- Cloud-expand overlay snaps open/closed (no 1.1s GSAP clipPath)
- Hint transition snaps instead of fading
- Ambient decor paused in scenes

### 5. Responsive

Test: **375 × 667** (iPhone SE), **768 × 1024** (iPad), **1440 × 900**
(laptop), **2560 × 1440** (desktop ultra-wide).

- Tagline wraps cleanly on 375, doesn't overflow
- Home button doesn't collide with tagline or Gabo on small screens
- Mini-map is scaled down at 640px breakpoint, still tappable
- Interior scene content readable, no horizontal scroll
- Speed lines container (160vmax square) covers the ultra-wide viewport after rotation

### 6. Social preview validators (post-deploy)

Paste the production URL into:

- https://cards-dev.twitter.com/validator
- https://developers.facebook.com/tools/debug/
- https://www.linkedin.com/post-inspector/

**Known caveat**: X/Twitter's SVG OG support is historically inconsistent.
If the preview is missing on X only, you have two options:

1. **Ship a static 1200×630 PNG** at `public/og-default.png` and use that as
   the only OG image (edit [Head.astro](../src/components/astro/Head.astro)). Lose the per-project theme.
2. **Install satori + @resvg/resvg-js**, rename `src/pages/og/[slug].svg.ts`
   → `[slug].png.ts`, render the same SVG through satori + resvg. Gains
   proper PNG but adds ~10 MB of build deps.

Discord, Slack, Telegram, Facebook all handle SVG correctly as of 2026.

---

## Deploy to Vercel

### First-time setup

```bash
# 1. Initialize git (if you haven't)
git init
git add -A
git commit -m "feat: initial Angel portfolio (phases 1–6)"

# 2. Push to a new GitHub repo
gh repo create angel-portfolio --private --source=. --push

# 3. Import to Vercel
#    vercel.com → Add New → Project → Import the repo
#    Vercel auto-detects Astro, uses pnpm
```

### Required Vercel settings

| Setting | Value |
|---|---|
| Framework preset | Astro |
| Build command | `pnpm build` (default) |
| Output directory | `.vercel/output` (Astro Vercel adapter handles it) |
| Install command | `pnpm install` |
| Node version | 22.x |

### Environment variables

Currently **none** — the site is fully static.

If you later add Howler sounds, analytics, or a CMS, set them in the Vercel
dashboard → Settings → Environment Variables. Never commit secrets.

### Update the site URL

Edit [../astro.config.mjs](../astro.config.mjs):

```js
export default defineConfig({
  site: 'https://your-actual-domain.com',
  // …
});
```

This affects canonical URLs, OG image absolute URLs, JSON-LD `@id`, and the
sitemap. Rebuild after changing.

### Custom domain

Vercel dashboard → Settings → Domains. Add the domain, follow the DNS
instructions. A-record or CNAME depending on registrar.

---

## Continuous deploy

- **`main` branch** → auto-deploys to production
- **Any other branch** → preview deploy with a `*.vercel.app` URL
- **Pull requests** → get a preview deploy linked from the PR

---

## Post-deploy smoke test

Hit the live URL and verify:

1. `/` → sky-map loads, Gabo waves, hint fades after 4s
2. Click a cloud → flight + costume swap + cloud-expand scene
3. Back button → returns to sky, URL goes back to `/`
4. `/projects/told` (direct) → standalone fallback page renders
5. `/projects/nonexistent` → 404 page
6. `/og/told.svg` → Open Graph image renders as SVG
7. `/sitemap-index.xml` → lists 9 canonical URLs (no `/og/*` entries)
8. `/robots.txt` → allows everything + points at sitemap

---

## Rollback

Vercel keeps every deployment. Bad release?

Vercel dashboard → Deployments → locate a good previous build → **Promote
to Production**. Instant rollback, no git revert needed.

For code-level rollback, `git revert <sha>` then push — normal flow.
