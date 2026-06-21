import { useCallback, useEffect, useRef } from 'react';
import CanvasContainer from './components/CanvasContainer';
import Overlay from './components/Overlay';
import LoadingScreen from './components/LoadingScreen';
import Onboarding from './components/Onboarding';
import WebcamPiP from './components/WebcamPiP';
import SceneErrorBoundary from './components/SceneErrorBoundary';
import { useImagePreloader } from './hooks/useImagePreloader';
import { IMAGE_URLS } from './data/memories';
import { useVisionStore } from './store/useVisionStore';
import { startHandEngine, stopHandEngine } from './vision/handEngine';
import { WEBCAM_CONSTRAINTS } from './vision/visionConfig';

/**
 * App.tsx
 *
 * Composition root for the gesture-driven memory experience. Stacked layers:
 *   1. CanvasContainer — the WebGL scene (carousel, hearts, hand pointer).
 *   2. Overlay         — DOM chrome: title, hints, and the reveal modal.
 *   3. WebcamPiP       — the OpenCV-bloomed picture-in-picture of the user.
 *   4. Onboarding      — the camera-permission + how-to-gesture welcome.
 *   5. LoadingScreen   — the preloader veil that fades once photos are ready.
 *
 * App owns the single shared webcam <video> (consumed by both the hand engine
 * and the PiP) and orchestrates the permission flow. The blush radial gradient
 * lives on <body> (index.css) and reads through the transparent canvas.
 */
export default function App() {
  // Warm the image cache (fault-tolerant) and drive the loading veil.
  useImagePreloader(IMAGE_URLS);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const status = useVisionStore((s) => s.status);
  const setStatus = useVisionStore((s) => s.setStatus);
  const start = useVisionStore((s) => s.start);

  /** Request the camera, attach the stream, and begin hand tracking. */
  const handleAllow = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('denied');
      return;
    }
    setStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia(WEBCAM_CONSTRAINTS);
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      await startHandEngine(video);
      setStatus('running');
      start(); // leave onboarding
    } catch {
      // Permission refused or no camera — fall back gracefully.
      setStatus('denied');
    }
  }, [setStatus, start]);

  /** Continue with the mouse-only fallback (no camera). */
  const handleSkip = useCallback(() => {
    setStatus('unavailable');
    start();
  }, [setStatus, start]);

  // Tear everything down on unmount.
  useEffect(() => {
    return () => {
      stopHandEngine();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <SceneErrorBoundary>
        <CanvasContainer />
      </SceneErrorBoundary>

      <Overlay />

      {/* The single shared webcam feed — offscreen, muted, inline. */}
      <video
        ref={videoRef}
        className="pointer-events-none fixed left-0 top-0 h-px w-px opacity-0"
        playsInline
        muted
        aria-hidden
      />

      <WebcamPiP videoRef={videoRef} active={status === 'running'} />
      <Onboarding onAllow={handleAllow} onSkip={handleSkip} />
      <LoadingScreen />
    </main>
  );
}
