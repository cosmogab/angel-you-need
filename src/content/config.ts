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
        'fofly-api',
      ]),
      description: z.string(),
      base: hexColor,
      accent: hexColor,
    }),

    /** Short paragraph describing why the project existed. */
    context: z.string(),
    /** Short paragraph describing what Gabriel owned. */
    myRole: z.string(),
    /** Bulleted list of concrete deliverables. */
    whatIBuilt: z.array(z.string()).min(1),
    /** Simple Icons slugs — render via CDN. */
    stack: z.array(z.string()).min(1),
    /** 1-4 display-size stat blocks. */
    impactStats: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        })
      )
      .min(1)
      .max(4),

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
