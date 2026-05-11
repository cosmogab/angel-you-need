import type { AngelState } from '~/lib/angel-state';

interface Props {
  state?: AngelState;
}

/**
 * Cumul — Gabo's personal cloud mount (SPEC §5).
 *
 * V1 geometry is placeholder primitives. The group IDs below are the
 * swap contract — a V2 illustrator must deliver SVG with the same
 * `#cumul-*` group IDs so the CSS animations and state attributes keep
 * working without component changes.
 */
export default function Cumul({ state = 'idle-home' }: Props) {
  return (
    <svg
      className="cumul"
      viewBox="0 0 260 140"
      data-angel-state={state}
      aria-hidden="true"
      focusable="false"
    >
      <g id="cumul-tail">
        <path
          className="cumul-tail__wisp cumul-tail__wisp--a"
          d="M 46 72 Q 26 68 6 60"
          fill="none"
          stroke="var(--cumul-base)"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          className="cumul-tail__wisp cumul-tail__wisp--b"
          d="M 42 86 Q 22 88 4 84"
          fill="none"
          stroke="var(--cumul-base)"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.65"
        />
        <path
          className="cumul-tail__wisp cumul-tail__wisp--c"
          d="M 48 100 Q 30 104 14 100"
          fill="none"
          stroke="var(--cumul-base)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.45"
        />
      </g>

      <g id="cumul-base">
        <path
          d="M 60 110
             C 36 108 28 80 52 72
             C 40 54 62 40 86 48
             C 90 28 132 24 150 44
             C 168 28 206 38 212 64
             C 232 66 234 98 212 108
             C 210 126 174 126 158 114
             C 140 128 106 128 94 114
             C 70 124 48 118 60 110 Z"
          fill="var(--cumul-base)"
          stroke="var(--ink)"
          strokeWidth="var(--stroke-weight)"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </g>

      <g id="cumul-shadows">
        <path
          d="M 70 114 Q 110 126 170 116"
          fill="none"
          stroke="var(--cumul-shadow)"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.65"
        />
      </g>

      <g id="cumul-highlights">
        <path
          d="M 68 58 Q 92 50 122 56"
          fill="none"
          stroke="var(--cumul-highlight)"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.95"
        />
        <path
          d="M 160 52 Q 186 50 204 62"
          fill="none"
          stroke="var(--cumul-highlight)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.8"
        />
      </g>

      <g id="cumul-puffs">
        <circle
          className="cumul-puff cumul-puff--a"
          cx="30"
          cy="118"
          r="4"
          fill="var(--cumul-base)"
          stroke="var(--ink)"
          strokeWidth="1.5"
        />
        <circle
          className="cumul-puff cumul-puff--b"
          cx="222"
          cy="124"
          r="3"
          fill="var(--cumul-base)"
          stroke="var(--ink)"
          strokeWidth="1.5"
        />
        <circle
          className="cumul-puff cumul-puff--c"
          cx="120"
          cy="134"
          r="2.5"
          fill="var(--cumul-base)"
          stroke="var(--ink)"
          strokeWidth="1.25"
        />
      </g>
    </svg>
  );
}
