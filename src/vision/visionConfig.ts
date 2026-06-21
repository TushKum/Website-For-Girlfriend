/**
 * visionConfig.ts
 *
 * Central configuration for the computer-vision module. Pinned versions and
 * model URLs live here so they're trivial to bump in one place.
 *
 * Everything is loaded lazily from a CDN at runtime — none of it is in the main
 * bundle, so the memory globe stays fast; the vision engines download only when
 * the user actually opens the Vision Lab.
 */

/** Must match the installed `@mediapipe/tasks-vision` version (package.json). */
export const MEDIAPIPE_VERSION = '0.10.35';

/** WASM runtime for MediaPipe Tasks Vision. */
export const MEDIAPIPE_WASM_CDN = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;

/** Pre-trained model bundles (Google's hosted, stable URLs). */
export const FACE_LANDMARKER_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

export const HAND_LANDMARKER_MODEL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

/** OpenCV.js (official build). Large (~9MB) — loaded only on demand. */
export const OPENCV_CDN = 'https://docs.opencv.org/4.10.0/opencv.js';

/** Requested webcam resolution. */
export const WEBCAM_CONSTRAINTS: MediaStreamConstraints = {
  video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
  audio: false,
};
