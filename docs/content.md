# Content editing guide

Projects live in [`src/content/projects/<slug>.md`](../src/content/projects/) as
typed Astro Content Collection entries. The Zod schema in
[`src/content/config.ts`](../src/content/config.ts) is the source of truth — edits must
match it or `pnpm astro check` will fail.

---

## Adding a new project

1. **Create the markdown file**: `src/content/projects/<slug>.md`. The slug
   must be kebab-case — it becomes the URL `/projects/<slug>`.

2. **Add frontmatter** (required fields, see schema):

   ```yaml
   ---
   title: My Project
   category: SaaS Platform
   period: Jan 2024 – Dec 2024
   role: Lead Developer
   team: Solo
   status: Shipped

   sky:
     theme: my-project          # kebab-case — must exist in [data-sky] CSS
     description: golden dawn
     base: '#FFB347'            # 6-digit hex
     accent: '#FF6B35'

   context: One or two sentences on why the project existed.
   myRole: One sentence on what you owned.
   whatIBuilt:
     - First concrete deliverable
     - Second deliverable
   stack:
     - typescript               # Simple Icons slugs (see below)
     - react
   impactStats:
     - value: '10M'
       label: events processed
     - value: '3'
       label: developers led

   position:
     x: 2000                    # world coords on 4000 × 2800 sky
     y: 1400
   order: 7                     # tab order; bigger numbers = later

   costume: my-project          # slug of costume file (see below)
   ambient: event-dots          # existing ambient type

   metaDescription: One-line SEO description (≤ 160 chars).
   ogSubtitle: Optional Open Graph subtitle (~55 chars).
   ---
   ```

3. **Register the sky theme** in [../src/styles/global.css](../src/styles/global.css):

   ```css
   [data-sky='my-project'] {
     --sky-base: #FFB347;
     --sky-accent: #FF6B35;
   }
   ```

4. **Add the costume** (see [illustrator-brief.md](./illustrator-brief.md) — body + head split).
   Register it in [../src/components/svg/gabo/costumes/index.ts](../src/components/svg/gabo/costumes/index.ts), and extend the
   `CostumeSlug` union + `COSTUMES` record.

5. **Place on the sky map** — pick an `(x, y)` that doesn't overlap another
   cloud. Current positions for reference:

   | Project | Position |
   |---|---|
   | Told | (700, 500) |
   | Evolt | (3300, 500) |
   | Culture-Relax | (500, 1750) |
   | Eveia | (3500, 1500) |
   | Cosmdinos | (1400, 2400) |
   | Fofly API | (3400, 2400) |
   | *(intro — not a project)* | (2000, 1400) |

   Zod enforces `0 ≤ x ≤ 4000` and `0 ≤ y ≤ 2800`. If you need to grow the
   world, update `WORLD_W` / `WORLD_H` in [../src/components/react/sky-types.ts](../src/components/react/sky-types.ts)
   and the Zod `max()` in [../src/content/config.ts](../src/content/config.ts).

6. **Pick an ambient**. Existing templates handled by [`AmbientDecor.tsx`](../src/components/react/AmbientDecor.tsx):
   - `event-dots` — colored dots floating up
   - `drifting-leaves` — orange leaves falling
   - `blueprint-grid` — architectural grid pattern
   - `eth-symbols` — twinkling diamond shapes
   - `heartbeat-pulse` — concentric ring pulses
   - `tiny-planes` — plane silhouettes crossing

   To add a new one, add a `case` to the switch in `AmbientDecor.tsx`, a
   template component, and corresponding keyframes + styles in
   [global.css](../src/styles/global.css) under the **Ambient decor** section.

7. **Verify**:
   ```bash
   pnpm astro check       # schema valid, no type errors
   pnpm dev               # visit localhost:4321 and navigate to the cloud
   pnpm build             # per-project OG SVG generates at /og/<slug>.svg
   ```

---

## Editing an existing project

Just edit the `.md` file — all fields propagate to both the sky-map
overlay scene *and* the standalone `/projects/<slug>` fallback page.

Things to double-check after a content edit:

- **metaDescription** stays ≤ 160 chars (truncated in search previews otherwise).
- **stack** uses valid [Simple Icons](https://simpleicons.org) slugs (the scene + standalone page pull icons from `https://cdn.simpleicons.org/<slug>/1A1613`). Wrong slug → broken icon.
- **impactStats** arrays: 1–4 entries (schema enforces). Value should be a short string (`"10M+"`, `"3"`, `"Live"`), label is 1–4 words.

---

## Simple Icons stack slugs — common ones

| Tech | Slug |
|---|---|
| TypeScript | `typescript` |
| React | `react` |
| Node.js | `nodedotjs` |
| Next.js | `nextdotjs` |
| Vue | `vuedotjs` |
| GraphQL | `graphql` |
| MongoDB | `mongodb` |
| PostgreSQL | `postgresql` |
| Redis | `redis` |
| AWS | `amazonaws` |
| Kubernetes | `kubernetes` |
| Docker | `docker` |
| Jest | `jest` |
| Strapi | `strapi` |
| Supabase | `supabase` |
| Solidity | `solidity` |
| Ethereum | `ethereum` |
| Web3.js | `web3dotjs` |
| React Native | `react` *(no distinct slug)* |
| OpenAI | `openai` |
| GitLab | `gitlab` |

Full list: https://simpleicons.org. Note that some technologies use
`*dotjs` format instead of `*.js`.

---

## Where text appears

A single `.md` file feeds **four** surfaces:

1. **The sky-map overlay scene** (in-app, rendered by [`InteriorScene.tsx`](../src/components/react/InteriorScene.tsx))
2. **The standalone `/projects/<slug>` page** ([`[slug].astro`](../src/pages/projects/[slug].astro) — SEO / no-JS fallback)
3. **The Open Graph image** (`/og/<slug>.svg` — auto-generated from `title`, `category`, `ogSubtitle`, and `sky.{base,accent}`)
4. **The mini-map tooltip** (hover title on the project dot — uses `title`)

Don't duplicate text across fields; keep each crisp.
