import { lazy } from 'react';

export const ISLANDS = {
  told: lazy(() => import('./IslandTold')),
  evolt: lazy(() => import('./IslandEvolt')),
  cosmodinos: lazy(() => import('./IslandCosmodinos')),
  eveia: lazy(() => import('./IslandEveia')),
  'fofly-api': lazy(() => import('./IslandFoflyApi')),
  'culture-relax': lazy(() => import('./IslandCultureRelax')),
} as const;

export type IslandSlug = keyof typeof ISLANDS;
