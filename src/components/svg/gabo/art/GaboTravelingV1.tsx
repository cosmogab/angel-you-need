import rawGabo2 from './_raw/gabo2.svg?raw';
import { processSvgArt } from './processSvgArt';

const { viewBox, inner } = processSvgArt(rawGabo2, { scope: 'gabo2' });

interface Props {
  className?: string;
}

export default function GaboTravelingV1({ className }: Props) {
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
