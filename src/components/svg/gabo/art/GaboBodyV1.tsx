import rawGabo from './_raw/gabo.svg?raw';
import { processSvgArt } from './processSvgArt';

const { viewBox, inner } = processSvgArt(rawGabo, { scope: 'gabo' });

interface Props {
  className?: string;
}

export default function GaboBodyV1({ className }: Props) {
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
