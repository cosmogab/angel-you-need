/**
 * KanjiPuff — manga onomatopoeia impact that plays during pose
 * crossfades. A brush-style kanji snaps in with overshoot, holds long
 * enough to obscure the pose swap underneath, then fades while four
 * ink-spatter dots scatter outward.
 *
 * On every mount one word is picked at random from `WORDS` (early
 * Toriyama / Dr. Slump-era onomatopoeias). Pass an explicit `word` prop
 * to lock a specific cue — useful later if we want per-state choices.
 *
 * Replaces the previous SmokePuff implementation (cream cloud SVG with
 * "POUF !" lettering). The filename is kept so the import path in
 * AngelSystem.tsx doesn't have to move — the default export is the new
 * KanjiPuff component.
 *
 * Coordinates with the `.kanji-puff` CSS in src/styles/global.css. The
 * total animation window must match PUFF_DURATION_MS in AngelSystem.tsx
 * (1400ms — change in both places together).
 */
import { useMemo, type CSSProperties } from 'react';

type KanjiPuffProps = {
  /** Force a specific kanji. When omitted, one is picked at random from `WORDS`. */
  word?: string;
};

/**
 * Curated Toriyama-era onomatopoeias. Mostly 2–3 katakana characters so
 * the visual weight stays similar across picks. Skews toward magical /
 * appearance cues (パッ, ドロン, シュッ) rather than violent ones — Gabo
 * is an angel, not a fighter.
 */
const WORDS = [
  'ドン',    // don — heavy impact, the classic
  'バン',    // ban — bang
  'パッ',    // pa' — sudden flash, perfect for an appearance
  'ポン',    // pon — light pop
  'ドロン',  // doron — magical vanishing trick
  'シュッ',  // shu' — swift movement
  'ピカッ',  // pika' — flash of light
  'ドカン',  // dokan — boom
] as const;

/**
 * Asymmetric scatter — NW big, NE small, SW medium, SE tiny — so the
 * four dots read as ink spit, not a symmetric flower.
 */
const SPATTERS: ReadonlyArray<{
  modifier: 'nw' | 'ne' | 'sw' | 'se';
  style: CSSProperties;
}> = [
  { modifier: 'nw', style: { '--dx': '-46px', '--dy': '-38px', '--size': '14px' } as CSSProperties },
  { modifier: 'ne', style: { '--dx': '40px',  '--dy': '-28px', '--size': '8px'  } as CSSProperties },
  { modifier: 'sw', style: { '--dx': '-34px', '--dy': '36px',  '--size': '11px' } as CSSProperties },
  { modifier: 'se', style: { '--dx': '44px',  '--dy': '42px',  '--size': '6px'  } as CSSProperties },
];

export default function KanjiPuff({ word }: KanjiPuffProps) {
  // Locked at first render so re-renders during the 1400ms lifetime
  // don't swap the kanji mid-animation. The component remounts on every
  // pose change (AngelSystem mounts/unmounts via puffVisible state), so
  // each transition still gets a fresh roll.
  const chosen = useMemo(
    () => word ?? WORDS[Math.floor(Math.random() * WORDS.length)],
    [word]
  );

  return (
    <div className="kanji-puff">
      <span className="kanji-puff__word">{chosen}</span>
      {SPATTERS.map(({ modifier, style }) => (
        <span
          key={modifier}
          className={`kanji-puff__spatter kanji-puff__spatter--${modifier}`}
          style={style}
        />
      ))}
    </div>
  );
}
