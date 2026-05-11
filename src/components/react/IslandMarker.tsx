import { Suspense } from 'react';
import type { SkyProject } from './sky-types';
import { ISLANDS, type IslandSlug } from '../svg/islands';

interface Props {
  project: SkyProject;
  onOpen: (slug: string) => void;
}

export default function IslandMarker({ project, onOpen }: Props) {
  const { id, title, category, position } = project;
  const IslandSvg = ISLANDS[id as IslandSlug];

  const handleClick = () => onOpen(id);
  const handleKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(id);
    }
  };

  return (
    <button
      type="button"
      className="island-marker"
      data-sky-interactive
      data-island-slug={id}
      aria-label={`Open ${title} — ${category}`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onClick={handleClick}
      onKeyDown={handleKey}
    >
      {IslandSvg ? (
        <Suspense fallback={null}>
          <IslandSvg className="island-marker__svg" />
        </Suspense>
      ) : null}
      <span className="island-marker__label font-display">{title}</span>
    </button>
  );
}
