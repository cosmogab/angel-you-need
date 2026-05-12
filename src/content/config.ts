import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const hexColor = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Expected 6-digit hex color like #FFB347');

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    period: z.string(),
    role: z.string(),
    team: z.string(),
    status: z.string(),

    /** Sky theme applied when this project is visited. */
    sky: z.object({
      /** kebab-case slug used on [data-sky="..."] in CSS. */
      theme: z.enum([
        'told',
        'culture-relax',
        'evolt',
        'cosmodinos',
        'eveia',
        'fofly',
      ]),
      description: z.string(),
      base: hexColor,
      accent: hexColor,
    }),

    /** Paragraphs describing why the project existed. */
    context: z.array(z.string()).min(1),
    /** Short paragraph describing what Gabriel owned. */
    myRole: z.string(),
    /** Concrete deliverables, each with a heading and detail paragraph. */
    whatIBuilt: z
      .array(
        z.object({
          title: z.string(),
          detail: z.string(),
        })
      )
      .min(1),
    /** Tech stack — slug drives the Simple Icons CDN icon. */
    techStack: z
      .array(
        z.object({
          slug: z.string(),
          label: z.string(),
          note: z.string(),
        })
      )
      .min(1),
    /** 1-4 display-size stat blocks. */
    impact: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        })
      )
      .min(1)
      .max(4),
    /** Optional list of client logos / names to surface as "Trusted by". */
    clients: z.array(z.string()).optional(),
    /** Optional trade-off paragraph explaining the project's main constraint. */
    tradeoff: z.string().optional(),
    /** Optional outbound links (live site, repo, case study). */
    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.string().url(),
        })
      )
      .optional(),

    /** Hand-placed coordinates on the 16000x11200 sky map. */
    position: z.object({
      x: z.number().min(0).max(16000),
      y: z.number().min(0).max(11200),
    }),
    /** Tab order on the sky map (1-indexed). */
    order: z.number().int().positive(),
    /** Ambient decoration type rendered inside the interior scene. */
    ambient: z.string(),

    /** SEO — per-page meta description. */
    metaDescription: z.string().max(160),
    /** Optional subtitle used on Open Graph images. */
    ogSubtitle: z.string().optional(),
  }),
});

export const collections = { projects };
