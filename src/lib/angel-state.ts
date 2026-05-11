import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Gabo's animation state machine (SPEC §5).
 *
 * The machine is intentionally small — V1 collapses the aspirational
 * `departing` / `leaving` / `returning` phases from SPEC into simpler
 * transitions. The only POUF!-bearing state in V1 is `arriving`. Pose
 * changes that happen outside `arriving` (e.g. pos1→pos2 at flight
 * start) crossfade via CSS without an explicit puff state.
 */
export type AngelState =
  | 'idle-home'
  | 'traveling'
  | 'arriving'
  | 'parked'
  | 'idle-mischief';

const TRANSITIONS: Record<AngelState, readonly AngelState[]> = {
  'idle-home': ['traveling', 'idle-mischief', 'parked'],
  traveling: ['arriving', 'idle-home'],
  arriving: ['parked', 'idle-home', 'traveling'],
  parked: ['idle-home', 'traveling'],
  'idle-mischief': ['idle-home', 'traveling'],
};

export function canTransition(from: AngelState, to: AngelState): boolean {
  if (from === to) return true;
  return TRANSITIONS[from].includes(to);
}

/** Returns `next` if the transition is valid, else returns `from` unchanged. */
export function transition(from: AngelState, to: AngelState): AngelState {
  if (canTransition(from, to)) return to;
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn(`[angel-state] invalid transition: ${from} → ${to}`);
  }
  return from;
}

/** Time of uninterrupted idle-home before mischief fires. */
export const IDLE_MISCHIEF_AFTER_MS = 30_000;
/** Duration a mischief action plays before returning to idle-home. */
export const MISCHIEF_DURATION_MS = 3_000;

export type MischiefAction = 'wave' | 'yawn' | 'balance' | 'spin-halo';
export const MISCHIEF_ACTIONS: readonly MischiefAction[] = [
  'wave',
  'yawn',
  'balance',
  'spin-halo',
];

function pickMischief(): MischiefAction {
  const i = Math.floor(Math.random() * MISCHIEF_ACTIONS.length);
  return MISCHIEF_ACTIONS[i] ?? 'wave';
}

export interface UseAngelStateResult {
  state: AngelState;
  mischief: MischiefAction | null;
  /** Attempts a transition; no-ops if the transition is invalid. */
  setState: (next: AngelState) => void;
  /** Returns true if the requested transition is currently legal. */
  canGo: (next: AngelState) => boolean;
  /** Manually trigger a named mischief action (e.g. welcome wave on load). */
  startMischief: (action: MischiefAction) => void;
}

/**
 * Drives Gabo's state + the idle-mischief timer in one hook.
 * 30s of uninterrupted `idle-home` → random mischief action → returns
 * to `idle-home` 3s later.
 */
export function useAngelState(
  initial: AngelState = 'idle-home'
): UseAngelStateResult {
  const [state, setRaw] = useState<AngelState>(initial);
  const [mischief, setMischief] = useState<MischiefAction | null>(null);
  const mischiefTimerRef = useRef<number | null>(null);
  const returnTimerRef = useRef<number | null>(null);

  const setState = useCallback((next: AngelState) => {
    setRaw((current) => transition(current, next));
  }, []);

  const canGo = useCallback(
    (next: AngelState) => canTransition(state, next),
    [state]
  );

  useEffect(() => {
    return () => {
      if (mischiefTimerRef.current !== null) {
        window.clearTimeout(mischiefTimerRef.current);
      }
      if (returnTimerRef.current !== null) {
        window.clearTimeout(returnTimerRef.current);
      }
    };
  }, []);

  // idle-home → mischief after IDLE_MISCHIEF_AFTER_MS.
  useEffect(() => {
    if (state !== 'idle-home') {
      setMischief(null);
      return;
    }
    const id = window.setTimeout(() => {
      setMischief(pickMischief());
      setRaw('idle-mischief');
    }, IDLE_MISCHIEF_AFTER_MS);
    mischiefTimerRef.current = id;
    return () => {
      window.clearTimeout(id);
      mischiefTimerRef.current = null;
    };
  }, [state]);

  // Mischief auto-returns to idle-home after MISCHIEF_DURATION_MS.
  useEffect(() => {
    if (state !== 'idle-mischief') return;
    const id = window.setTimeout(() => {
      setRaw('idle-home');
      setMischief(null);
    }, MISCHIEF_DURATION_MS);
    returnTimerRef.current = id;
    return () => {
      window.clearTimeout(id);
      returnTimerRef.current = null;
    };
  }, [state]);

  const startMischief = useCallback((action: MischiefAction) => {
    setMischief(action);
    setRaw('idle-mischief');
  }, []);

  return { state, mischief, setState, canGo, startMischief };
}
