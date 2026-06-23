import { createHandLandmarker } from './mediapipe';
import type { HandLandmarker, NormalizedLandmark } from '@mediapipe/tasks-vision';
import { landmarkToNDC } from './coords';
import { pinchInfo, isOpenPalm, pinchMidpoint } from './gestures';
import { handState, clearHand, queueBurst } from '../store/handState';
import { useVisionStore } from '../store/useVisionStore';

/**
 * handEngine.ts
 *
 * The decoupled computer-vision loop. It owns NO React state and lives entirely
 * outside the render tree:
 *
 *  - Detection is driven by `requestVideoFrameCallback` (one inference per
 *    actual camera frame, ~30fps) — falling back to rAF — so it's naturally
 *    throttled and never competes with Three.js's 60fps display loop.
 *  - Results are written to the mutable `handState` singleton, which the scene
 *    reads in `useFrame`. React only hears about discrete changes (a hand
 *    appearing/disappearing) via `useVisionStore`, so it virtually never
 *    re-renders from tracking.
 *
 * The caller supplies an already-playing <video> (App owns the single webcam
 * stream, shared with the picture-in-picture); the engine just analyses it.
 */

const SMOOTH = 0.5; // NDC smoothing (0 = frozen, 1 = raw/jittery)
const BURST_SPEED = 2.2; // NDC/sec hand speed that spawns a heart burst
const BURST_INTERVAL_MS = 90; // min gap between bursts

// ── Clap detection (two hands) ───────────────────────────────────────────
const CLAP_DIST = 0.22; // normalized palm-to-palm distance counted as "met"
const CLAP_SPEED = 0.7; // normalized closing speed (per sec) required
const CLAP_COOLDOWN_MS = 500; // min gap between claps
const CLAP_POWER = 3.5; // burst magnitude of a clap flurry

// ── Prayer pose (two hands together, fingers up) ─────────────────────────
const PRAY_DIST = 0.34; // palm-to-palm distance counted as "pressed together"
const PRAY_HOLD_MS = 280; // pose must be held this long before lilies come

let landmarker: HandLandmarker | null = null;
let video: HTMLVideoElement | null = null;
let running = false;

// rAF / rVFC handles for clean teardown.
let rafId = 0;
let rvfcId = 0;

// Smoothing + velocity bookkeeping.
let smoothX = 0;
let smoothY = 0;
let prevRawX = 0;
let prevRawY = 0;
let prevTime = 0;
let lastTs = 0;
let lastBurst = 0;

// Clap bookkeeping.
let clapPrevDist = 1;
let clapPrevTime = 0;
let lastClap = 0;

// Prayer bookkeeping.
let prayStart = 0;
let wasPraying = false;

// Minimal typing for the (still not-everywhere-in-lib) rVFC API.
type RVFCVideo = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: (now: number) => void) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};

/**
 * Begin analysing `videoEl`. Lazily creates the hand landmarker on first call
 * (downloading the model from CDN). Resolves once detection is live.
 */
export async function startHandEngine(videoEl: HTMLVideoElement): Promise<void> {
  video = videoEl;
  if (!landmarker) landmarker = await createHandLandmarker();
  running = true;
  prevTime = performance.now();
  schedule();
}

/** Stop analysing and reset hand state (the model stays cached for restart). */
export function stopHandEngine(): void {
  running = false;
  const v = video as RVFCVideo | null;
  if (rvfcId && v?.cancelVideoFrameCallback) v.cancelVideoFrameCallback(rvfcId);
  if (rafId) cancelAnimationFrame(rafId);
  rvfcId = 0;
  rafId = 0;
  clearHand();
  setHandPresent(false);
  clapPrevDist = 1;
}

function schedule(): void {
  if (!running || !video) return;
  const v = video as RVFCVideo;
  if (v.requestVideoFrameCallback) {
    rvfcId = v.requestVideoFrameCallback((now) => tick(now));
  } else {
    rafId = requestAnimationFrame((now) => tick(now));
  }
}

function tick(now: number): void {
  if (!running || !video || !landmarker) return;

  if (video.readyState >= 2 /* HAVE_CURRENT_DATA */) {
    // MediaPipe demands strictly-increasing timestamps.
    const ts = Math.max(now, lastTs + 1);
    lastTs = ts;

    const result = landmarker.detectForVideo(video, ts);
    process(result.landmarks[0], now);
    detectClap(result.landmarks, now);
    detectPrayer(result.landmarks, now);
    // Expose two-hand (clapping) posture so the carousel can hold still.
    handState.twoHands = (result.landmarks?.length ?? 0) >= 2;
  }

  schedule();
}

/** Palm centre of a hand (midpoint of wrist and middle-finger knuckle). */
function palmCenter(lm: NormalizedLandmark[]): { x: number; y: number } {
  return { x: (lm[0].x + lm[9].x) / 2, y: (lm[0].y + lm[9].y) / 2 };
}

/**
 * Clap detection: when two hands are present and their palms rush together —
 * crossing below the "met" distance with enough closing speed — we release a
 * flurry of hearts from the point where the hands meet. A cooldown keeps a
 * sustained press from machine-gunning bursts.
 */
function detectClap(hands: NormalizedLandmark[][] | undefined, now: number): void {
  if (!hands || hands.length < 2) {
    clapPrevDist = 1; // reset so re-entry needs a fresh approach
    return;
  }

  const a = palmCenter(hands[0]);
  const b = palmCenter(hands[1]);
  const dist = Math.hypot(a.x - b.x, a.y - b.y);
  const dt = Math.max(0.001, (now - clapPrevTime) / 1000);
  const closing = (clapPrevDist - dist) / dt;

  const justMet = clapPrevDist >= CLAP_DIST && dist < CLAP_DIST;
  if (justMet && closing > CLAP_SPEED && now - lastClap > CLAP_COOLDOWN_MS) {
    const ndc = landmarkToNDC((a.x + b.x) / 2, (a.y + b.y) / 2);
    queueBurst(ndc.x, ndc.y, CLAP_POWER);
    useVisionStore.getState().triggerMoment('heart'); // freeze + giant heart
    lastClap = now;
  }

  clapPrevDist = dist;
  clapPrevTime = now;
}

/** A hand whose index + middle fingertips sit clearly above its wrist. */
function fingersUp(lm: NormalizedLandmark[]): boolean {
  // Image y grows downward, so "up" means a smaller y than the wrist.
  return lm[12].y < lm[0].y - 0.05 && lm[8].y < lm[0].y - 0.05;
}

/**
 * Prayer detection: two hands pressed together with fingers pointing up, held
 * briefly. Distinct from a clap (which is a fast impact) because this requires
 * the upward orientation and a sustained hold. While held, `praying` stays true
 * and the lily shower falls.
 */
function detectPrayer(hands: NormalizedLandmark[][] | undefined, now: number): void {
  if (!hands || hands.length < 2) {
    prayStart = 0;
    handState.praying = false;
    return;
  }
  const a = palmCenter(hands[0]);
  const b = palmCenter(hands[1]);
  const dist = Math.hypot(a.x - b.x, a.y - b.y);
  const posed = dist < PRAY_DIST && fingersUp(hands[0]) && fingersUp(hands[1]);

  if (posed) {
    if (prayStart === 0) prayStart = now;
    handState.praying = now - prayStart >= PRAY_HOLD_MS;
  } else {
    prayStart = 0;
    handState.praying = false;
  }

  // Fire the giant-lily moment once, on the rising edge of the prayer pose.
  if (handState.praying && !wasPraying) {
    useVisionStore.getState().triggerMoment('lily');
  }
  wasPraying = handState.praying;
}

function process(landmarks: NormalizedLandmark[] | undefined, now: number): void {
  if (!landmarks || landmarks.length === 0) {
    if (handState.present) {
      clearHand();
      setHandPresent(false);
    }
    return;
  }

  // The cursor follows the index/thumb midpoint, mapped to mirrored NDC.
  const mid = pinchMidpoint(landmarks);
  const ndc = landmarkToNDC(mid.x, mid.y);

  // Velocity from the RAW point (responsive), in NDC units/sec.
  const dt = Math.max(0.001, (now - prevTime) / 1000);
  const speed = Math.hypot(ndc.x - prevRawX, ndc.y - prevRawY) / dt;
  prevRawX = ndc.x;
  prevRawY = ndc.y;
  prevTime = now;

  // Exponentially smooth the cursor used for positioning.
  if (!handState.present) {
    smoothX = ndc.x;
    smoothY = ndc.y;
  } else {
    smoothX += (ndc.x - smoothX) * SMOOTH;
    smoothY += (ndc.y - smoothY) * SMOOTH;
  }

  const { pinch, strength } = pinchInfo(landmarks);

  handState.present = true;
  handState.ndcX = smoothX;
  handState.ndcY = smoothY;
  handState.pinch = pinch;
  handState.pinchStrength = strength;
  handState.openPalm = !pinch && isOpenPalm(landmarks);
  handState.speed = speed;
  handState.lastSeen = now;

  if (!useVisionStore.getState().handPresent) setHandPresent(true);

  // A quick flick of the hand sprays hearts from the fingertip.
  if (speed > BURST_SPEED && now - lastBurst > BURST_INTERVAL_MS) {
    queueBurst(smoothX, smoothY);
    lastBurst = now;
  }
}

function setHandPresent(present: boolean): void {
  useVisionStore.getState().setHandPresent(present);
}
