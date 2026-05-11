import rawWing from './_raw/wing.svg?raw';
import { processSvgArt } from './processSvgArt';

const { viewBox, inner } = processSvgArt(rawWing, { scope: 'wing' });

interface Props {
  className?: string;
}

export default function WingV1({ className }: Props) {
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
