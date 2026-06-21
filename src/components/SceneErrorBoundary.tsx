import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Rendered when the 3D subtree throws. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * SceneErrorBoundary.tsx
 *
 * A class-based error boundary placed *outside* the <Canvas>. react-three-fiber
 * re-throws WebGL/render errors up to the host React tree, so this catches them
 * and shows a graceful fallback instead of a white screen — and logs the real
 * underlying error so failures are never silent.
 */
export default class SceneErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface the true cause for diagnostics.
    console.error('[SceneError]', error.message, '\n', error.stack, '\n', info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-obsidian px-8 text-center">
            <p className="font-display text-xl text-champagne">
              The memories couldn&rsquo;t bloom just now.
            </p>
            <p className="mt-3 font-sans text-sm text-white/40">
              Please refresh — a stronger connection or device will bring them to life.
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
