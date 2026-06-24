import { useCallback, useEffect, useRef } from 'react';
import CanvasContainer from './components/CanvasContainer';
import Overlay from './components/Overlay';
import LoadingScreen from './components/LoadingScreen';
import Onboarding from './components/Onboarding';
import WebcamPiP from './components/WebcamPiP';
import SceneErrorBoundary from './components/SceneErrorBoundary';
import LoginGate from './components/LoginGate';
import Guestbook from './components/Guestbook';
import Gallery from './components/Gallery';
import CupcakeWidget from './components/Cupcake';
import AddMemory from './components/AddMemory';
import LoveDeck from './components/LoveDeck';
import LoveLetter from './components/LoveLetter';
import LoveCursor from './components/LoveCursor';
import Sparkles from './components/Sparkles';
import MusicToggle from './components/MusicToggle';
import MomentOverlay from './components/MomentOverlay';
import { recordVisit } from './services/db';
import { useImagePreloader } from './hooks/useImagePreloader';
import { IMAGE_URLS } from './data/memories';
import { useVisionStore } from './store/useVisionStore';
import { useGateStore } from './store/useGateStore';
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
  const setError = useVisionStore((s) => s.setError);
  const unlocked = useGateStore((s) => s.unlocked);

  /**
   * Request the camera, enter the experience as soon as it's granted, then warm
   * up hand tracking in the background. Crucially we do NOT block entry on the
   * MediaPipe model download — if that CDN fetch is slow or blocked, the camera
   * and scene still come up immediately (gestures simply arrive a moment later,
   * or degrade to the mouse fallback) instead of getting stuck on "Waking the
   * camera…" or wrongly reporting the camera as blocked.
   */
  const handleAllow = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        window.isSecureContext
          ? 'No camera is available on this device.'
          : 'The camera needs a secure page — open this over https or on localhost.',
      );
      setStatus('denied');
      return;
    }

    setError(null);
    setStatus('requesting');

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(WEBCAM_CONSTRAINTS);
    } catch (err) {
      console.error('[camera] getUserMedia failed:', err);
      setError(
        'Camera permission was blocked. Allow it via the camera icon in your browser’s address bar, then try again.',
      );
      setStatus('denied');
      return;
    }

    streamRef.current = stream;
    const video = videoRef.current!;
    video.srcObject = stream;
    try {
      await video.play();
    } catch (err) {
      // Autoplay can reject on some browsers; the stream is still live.
      console.warn('[camera] video.play() was interrupted:', err);
    }

    // Camera is live — enter the experience right away.
    setStatus('running');
    start();

    // Bring hand tracking online in the background. Non-fatal: a failure here
    // leaves the camera + scene working (mouse fallback for control).
    startHandEngine(video).catch((err) => {
      console.error('[gestures] hand tracking failed to start (camera still works):', err);
    });
  }, [setStatus, setError, start]);

  /** Continue with the mouse-only fallback (no camera). */
  const handleSkip = useCallback(() => {
    setStatus('unavailable');
    start();
  }, [setStatus, start]);

  // Count the visit once she's through the gate ("she opened it").
  useEffect(() => {
    if (unlocked) void recordVisit();
  }, [unlocked]);

  // Tear everything down on unmount.
  useEffect(() => {
    return () => {
      stopHandEngine();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  // The login gate stands in front of everything until she signs in.
  if (!unlocked) {
    return (
      <main className="relative h-screen w-screen overflow-hidden">
        <LoginGate />
        <LoveCursor />
      </main>
    );
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <SceneErrorBoundary>
        <CanvasContainer />
      </SceneErrorBoundary>

      <Sparkles />
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
      <Guestbook />
      <Gallery />
      <CupcakeWidget />
      <AddMemory />
      <LoveDeck />
      <LoveLetter />
      <MusicToggle />
      <Onboarding onAllow={handleAllow} onSkip={handleSkip} />
      <MomentOverlay />
      <LoadingScreen />
      <LoveCursor />
    </main>
  );
}
