/**
 * handState.ts
 *
 * The performance-critical bridge between the computer-vision loop and the
 * WebGL render loop — and the heart of the "decoupled from React" requirement.
 *
 * This is a plain, MUTABLE singleton object. The hand-tracking engine writes
 * to it ~30×/sec; the Three.js `useFrame` loops read from it ~60×/sec. Neither
 * path touches React state, so tracking never triggers a re-render and the
 * scene stays at a buttery 60 FPS. Discrete, low-frequency facts (camera
 * status, "is a hand visible at all") live in the React `useVisionStore`.
 *
 * All coordinates here are in mirrored NDC space (x,y ∈ [-1, 1], y up) — i.e.
 * already screen-aligned for a selfie view. Mapping NDC → Three.js world space
 * is done by the consumers that own a camera (see `vision/coords.ts`).
 */

export interface BurstEvent {
  /** NDC origin of the burst (mapped to world by the heart system). */
  x: number;
  y: number;
  /** Burst magnitude: 1 = a flick spray, higher = a clap flurry. */
  power: number;
}

export interface HandState {
  /** Is a hand currently tracked? */
  present: boolean;
  /** Smoothed pinch-midpoint (index+thumb) in mirrored NDC. */
  ndcX: number;
  ndcY: number;
  /** Pinch gesture (index↔thumb together). */
  pinch: boolean;
  /** 0 (open) → 1 (fully pinched), for analog feedback. */
  pinchStrength: number;
  /** Open-palm gesture (all fingers extended). */
  openPalm: boolean;
  /** Hand speed in NDC units/sec (drives the heart emitter). */
  speed: number;
  /** Queue of pending heart bursts, consumed by the heart system each frame. */
  bursts: BurstEvent[];
  /** performance.now() of the last successful update. */
  lastSeen: number;
}

export const handState: HandState = {
  present: false,
  ndcX: 0,
  ndcY: 0,
  pinch: false,
  pinchStrength: 0,
  openPalm: false,
  speed: 0,
  bursts: [],
  lastSeen: 0,
};

const EMPTY: BurstEvent[] = [];

/** Reset to the "no hand" baseline (called when tracking loses the hand). */
export function clearHand(): void {
  handState.present = false;
  handState.pinch = false;
  handState.pinchStrength = 0;
  handState.openPalm = false;
  handState.speed = 0;
}

/** Push a burst, capped so a frantic hand can never unbounded-grow the queue. */
export function queueBurst(x: number, y: number, power = 1): void {
  if (handState.bursts.length < 8) handState.bursts.push({ x, y, power });
}

/** Atomically drain the burst queue (returns the events, empties the buffer). */
export function drainBursts(): BurstEvent[] {
  if (handState.bursts.length === 0) return EMPTY;
  const out = handState.bursts.slice();
  handState.bursts.length = 0;
  return out;
}

// Dev-only manual trigger: `__queueBurst(ndcX, ndcY, power)` from the console
// lets us fire heart bursts without a webcam (handy for tuning). Stripped from
// production builds.
if (import.meta.env.DEV) {
  (window as unknown as { __queueBurst?: typeof queueBurst }).__queueBurst = queueBurst;
}
