import { SKY_CENTER } from './sky-types';

interface Props {
  /** True until the user's first interaction OR 4s elapse. */
  hintVisible: boolean;
}

/**
 * The landing experience (SPEC §7). A non-project anchor at SKY_CENTER
 * containing the tagline block and a hint that fades on first interaction
 * or after 4s.
 */
export default function IntroCloud({ hintVisible }: Props) {
  return (
    <div
      className="intro-cloud"
      style={{
        left: `${SKY_CENTER.x}px`,
        top: `${SKY_CENTER.y}px`,
      }}
    >
      <div className="intro-cloud__tagline">
        <p className="intro-cloud__kicker font-display">The Angel You Need.</p>
        <p className="intro-cloud__subtitle">
          Gabriel Miro — <em>Senior Full-Stack Engineer</em>
        </p>
      </div>

      <p className="intro-cloud__hint" data-visible={hintVisible}>
        <em>Drag the sky to explore. Click a cloud to land.</em>
      </p>
    </div>
  );
}
