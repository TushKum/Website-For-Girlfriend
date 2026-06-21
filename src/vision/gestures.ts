import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

/**
 * gestures.ts
 *
 * Pure, stateless gesture analysis from a single hand's 21 landmarks. Keeping
 * these as side-effect-free functions makes them trivial to test and reason
 * about; the stateful bits (smoothing, velocity, burst rate-limiting) live in
 * the engine that calls them.
 *
 * MediaPipe hand landmark indices (the ones we use):
 *   0  wrist
 *   4  thumb tip          2  thumb mcp
 *   8  index tip          6  index pip      5  index mcp
 *   12 middle tip        10  middle pip      9  middle mcp
 *   16 ring tip          14  ring pip
 *   20 pinky tip         18  pinky pip
 */

export const WRIST = 0;
export const THUMB_TIP = 4;
export const INDEX_TIP = 8;
export const MIDDLE_MCP = 9;

/** 2D (image-plane) distance between two landmarks. */
function dist2(a: NormalizedLandmark, b: NormalizedLandmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * A scale-invariant reference length for the hand: wrist → middle-finger
 * knuckle. Dividing finger distances by this makes thresholds independent of
 * how close the hand is to the camera.
 */
function handScale(lm: NormalizedLandmark[]): number {
  return Math.max(1e-4, dist2(lm[WRIST], lm[MIDDLE_MCP]));
}

export interface PinchInfo {
  pinch: boolean;
  /** 0 (fully open) → 1 (tightly pinched). */
  strength: number;
}

/** Pinch = index tip and thumb tip drawn together, relative to hand size. */
export function pinchInfo(lm: NormalizedLandmark[]): PinchInfo {
  const ratio = dist2(lm[THUMB_TIP], lm[INDEX_TIP]) / handScale(lm);
  // ratio ~0.9+ when open, ~0.2 when pinched. Map [0.55 → 0.25] to [0 → 1].
  const strength = clamp01((0.55 - ratio) / 0.3);
  return { pinch: ratio < 0.4, strength };
}

/** Is a given finger extended? Tip farther from the wrist than its mid-joint. */
function fingerExtended(
  lm: NormalizedLandmark[],
  tip: number,
  pip: number,
): boolean {
  return dist2(lm[tip], lm[WRIST]) > dist2(lm[pip], lm[WRIST]) * 1.05;
}

/**
 * Open palm = the four fingers (index, middle, ring, pinky) all extended.
 * We ignore the thumb (its extension is ambiguous from the front).
 */
export function isOpenPalm(lm: NormalizedLandmark[]): boolean {
  const index = fingerExtended(lm, 8, 6);
  const middle = fingerExtended(lm, 12, 10);
  const ring = fingerExtended(lm, 16, 14);
  const pinky = fingerExtended(lm, 20, 18);
  return index && middle && ring && pinky;
}

/** Midpoint of index tip and thumb tip — the natural "cursor" of the hand. */
export function pinchMidpoint(lm: NormalizedLandmark[]): { x: number; y: number } {
  return {
    x: (lm[THUMB_TIP].x + lm[INDEX_TIP].x) / 2,
    y: (lm[THUMB_TIP].y + lm[INDEX_TIP].y) / 2,
  };
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
