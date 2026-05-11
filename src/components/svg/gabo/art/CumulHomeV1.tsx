import rawNuage from './_raw/nuage.svg?raw';
import { processSvgArt } from './processSvgArt';

const { viewBox, inner } = processSvgArt(rawNuage, { scope: 'nuage' });

interface Props {
  className?: string;
}

export default function CumulHomeV1({ className }: Props) {
  const cls = className ? `cumul-home ${className}` : 'cumul-home';
  return (
    <svg
      className={cls}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}
