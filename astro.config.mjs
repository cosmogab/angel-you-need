import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://theangelyouneed.com',
  integrations: [
    react(),
    mdx(),
    sitemap({
      // OG SVGs are image endpoints — they don't belong in the sitemap.
      filter: (page) => !page.includes('/og/'),
    }),
  ],
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
