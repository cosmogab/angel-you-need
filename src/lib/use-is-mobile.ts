/**
 * Coarse pointer + narrow viewport detection. Used to gate mobile-only
 * trade-offs (lower PIXI texture resolution, denser decor thinning) that
 * would otherwise crash the iOS WebKit renderer under GPU memory pressure.
 * Subscribes to `matchMedia` so rotating the device or resizing a desktop
 * window across the breakpoint flips the value without a reload.
 */
import { useEffect, useState } from 'react';

const MOBILE_QUERY = '(pointer: coarse) and (max-width: 900px)';

export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia(MOBILE_QUERY).matches
  );
  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return mobile;
}
