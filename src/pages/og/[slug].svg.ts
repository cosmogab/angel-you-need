import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';

/**
 * Build-time per-project Open Graph image. Renders an SVG card using the
 * project's sky theme as a gradient backdrop. Modern crawlers (Discord,
 * Slack, Telegram, recent Facebook/X) render SVG OG images directly.
 *
 * No external rendering deps — keeps the build lean. For strict PNG-only
 * crawlers, the og-default.svg fallback referenced from Head.astro covers it.
 */

interface OgProps {
  title: string;
  category: string;
  subtitle: string;
  skyBase: string;
  skyAccent: string;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const entries = await getCollection('projects');
  return entries.map((entry) => ({
    params: { slug: entry.id },
    props: {
      title: entry.data.title,
      category: entry.data.category,
      subtitle: entry.data.ogSubtitle ?? entry.data.metaDescription,
      skyBase: entry.data.sky.base,
      skyAccent: entry.data.sky.accent,
    } satisfies OgProps,
  }));
};

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '"':
        return '&quot;';
      default:
        return '&apos;';
    }
  });
}

/** Wraps long subtitle text into ~2 lines of ≤60 chars. */
function wrap(text: string, max = 60, maxLines = 2): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= max) {
      current = next;
    } else {
      lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines;
}

export const GET: APIRoute = ({ props }) => {
  const { title, category, subtitle, skyBase, skyAccent } = props as OgProps;
  const subtitleLines = wrap(subtitle, 58, 2);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${escapeXml(title)} — Gabriel Miro">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${skyBase}"/>
      <stop offset="1" stop-color="${skyAccent}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.72" cy="0.22" r="0.7">
      <stop offset="0" stop-color="#FFFBF0" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#FFFBF0" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#sky)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <!-- Decorative cloud shape -->
  <g opacity="0.28" transform="translate(880, 430)">
    <path d="M 0 40 C -24 40 -30 12 -10 2 C -20 -14 2 -28 20 -20 C 24 -36 60 -40 76 -22 C 92 -36 124 -30 130 -6 C 156 -6 160 22 140 32 C 138 50 110 52 96 42 C 80 54 50 54 42 42 C 22 50 -2 48 0 40 Z" fill="#FFFBF0" stroke="#1A1613" stroke-width="2.5"/>
  </g>
  <!-- Halo mark -->
  <g transform="translate(100, 120)">
    <ellipse cx="0" cy="0" rx="28" ry="6" fill="#FFD93D" stroke="#1A1613" stroke-width="2"/>
  </g>
  <!-- Kicker -->
  <text x="100" y="230" font-family="Georgia, 'Times New Roman', serif" font-size="28" fill="#1A1613" font-style="italic" opacity="0.85">The Angel You Need.</text>
  <!-- Category -->
  <text x="100" y="280" font-family="Impact, 'Arial Black', sans-serif" font-size="22" fill="#1A1613" letter-spacing="2" opacity="0.7">${escapeXml(category.toUpperCase())}</text>
  <!-- Title -->
  <text x="100" y="410" font-family="Impact, 'Arial Black', sans-serif" font-size="124" font-weight="700" fill="#1A1613" letter-spacing="1">${escapeXml(title)}</text>
  <!-- Subtitle -->
  ${subtitleLines
    .map(
      (line, i) =>
        `<text x="100" y="${475 + i * 40}" font-family="Georgia, 'Times New Roman', serif" font-size="28" fill="#1A1613" opacity="0.8">${escapeXml(line)}</text>`
    )
    .join('\n  ')}
  <!-- Byline -->
  <text x="100" y="582" font-family="Georgia, 'Times New Roman', serif" font-size="22" fill="#1A1613" opacity="0.65">Gabriel Miro · Senior Full-Stack Engineer</text>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
