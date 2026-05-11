import rawHalo from './_raw/halo.svg?raw';
import { processSvgArt } from './processSvgArt';

const { viewBox, inner } = processSvgArt(rawHalo, {
  scope: 'halo',
  rootGroupId: 'gabo-halo',
});

interface Props {
  className?: string;
}

export default function HaloV1({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}
