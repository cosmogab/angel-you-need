/**
 * Tiny error boundary specifically for the DecorCanvas branch. If PIXI
 * fails to initialize (e.g. WebGL unavailable, asset load throws, JSX
 * pragma mismatch), we'd otherwise crash the whole React island and the
 * page goes blank. Here we just swallow the error and keep the rest of
 * the SkyMap (sky gradient + markers + Gabo) on screen.
 *
 * Errors are logged to the console with a clear prefix so they're easy
 * to find in DevTools.
 */
import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class DecorErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: unknown, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('[DecorCanvas] crashed — falling back to no decor:', error, info);
  }

  override render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
