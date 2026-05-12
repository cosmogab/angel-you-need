/**
 * Serializable project data passed into React islands.
 * Defined in a plain .ts file so it's shared between SkyMap, IslandMarker,
 * MiniMap and InteriorScene without re-importing Astro's content types
 * into the client bundle.
 */
export interface SkyProject {
  id: string;
  title: string;
  category: string;
  order: number;
  period: string;
  role: string;
  team: string;
  status: string;
  position: { x: number; y: number };
  sky: {
    theme: string;
    base: string;
    accent: string;
  };
  context: string[];
  myRole: string;
  whatIBuilt: { title: string; detail: string }[];
  techStack: { slug: string; label: string; note: string }[];
  impact: { value: string; label: string }[];
  clients?: string[];
  tradeoff?: string;
  links?: { label: string; url: string }[];
  ambient: string;
  metaDescription: string;
  href: string;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface Viewport {
  w: number;
  h: number;
}

export const WORLD_W = 16000;
export const WORLD_H = 11200;
export const SKY_CENTER: Vec2 = { x: WORLD_W / 2, y: WORLD_H / 2 };
