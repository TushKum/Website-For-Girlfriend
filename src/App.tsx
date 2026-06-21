import CanvasContainer from './components/CanvasContainer';
import Overlay from './components/Overlay';
import LoadingScreen from './components/LoadingScreen';
import SceneErrorBoundary from './components/SceneErrorBoundary';
import { useImagePreloader } from './hooks/useImagePreloader';
import { IMAGE_URLS } from './data/memories';

/**
 * App.tsx
 *
 * Composition root. Three stacked layers fill the viewport:
 *   1. CanvasContainer — the WebGL memory globe (bottom).
 *   2. Overlay         — DOM chrome: vignette, title, hint, and reveal modal.
 *   3. LoadingScreen   — the preloader veil that fades once textures are ready.
 *
 * The obsidian→midnight gradient lives on <body> (see index.css) and reads
 * through the transparent canvas as the gallery backdrop.
 */
export default function App() {
  // Warm the image cache (fault-tolerant) and drive the loading veil.
  useImagePreloader(IMAGE_URLS);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <SceneErrorBoundary>
        <CanvasContainer />
      </SceneErrorBoundary>
      <Overlay />
      <LoadingScreen />
    </main>
  );
}
