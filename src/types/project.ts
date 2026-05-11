import type { CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;
export type ProjectData = Project['data'];
export type SkyTheme = ProjectData['sky']['theme'];

export interface SkyPosition {
  x: number;
  y: number;
}
