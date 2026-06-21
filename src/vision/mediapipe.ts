import {
  FilesetResolver,
  FaceLandmarker,
  HandLandmarker,
  type FaceLandmarkerResult,
  type HandLandmarkerResult,
} from '@mediapipe/tasks-vision';
import {
  MEDIAPIPE_WASM_CDN,
  FACE_LANDMARKER_MODEL,
  HAND_LANDMARKER_MODEL,
} from './visionConfig';

/**
 * mediapipe.ts
 *
 * Thin, typed factory helpers around MediaPipe Tasks Vision. Each detector is
 * created in `VIDEO` running mode (for per-frame `detectForVideo` calls) and
 * tries the GPU delegate first, transparently falling back to CPU so it works
 * on any machine.
 *
 * Extend these (or copy the pattern) to add other tasks — gesture recognizer,
 * pose landmarker, image segmenter, object detector, etc.
 */

export type { FaceLandmarkerResult, HandLandmarkerResult };

// The WASM fileset is shared by every task — resolve it once.
let filesetPromise: ReturnType<typeof FilesetResolver.forVisionTasks> | null = null;
function getFileset() {
  filesetPromise ??= FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_CDN);
  return filesetPromise;
}

/** Create a face-mesh detector (468 landmarks, 1 face). */
export async function createFaceLandmarker(): Promise<FaceLandmarker> {
  const fileset = await getFileset();
  try {
    return await FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: FACE_LANDMARKER_MODEL, delegate: 'GPU' },
      runningMode: 'VIDEO',
      numFaces: 1,
    });
  } catch {
    // Fall back to CPU if the GPU delegate is unavailable.
    return FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: FACE_LANDMARKER_MODEL, delegate: 'CPU' },
      runningMode: 'VIDEO',
      numFaces: 1,
    });
  }
}

/** Create a hand-landmark detector (21 landmarks per hand, up to 2 hands). */
export async function createHandLandmarker(): Promise<HandLandmarker> {
  const fileset = await getFileset();
  try {
    return await HandLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: HAND_LANDMARKER_MODEL, delegate: 'GPU' },
      runningMode: 'VIDEO',
      numHands: 2,
    });
  } catch {
    return HandLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: HAND_LANDMARKER_MODEL, delegate: 'CPU' },
      runningMode: 'VIDEO',
      numHands: 2,
    });
  }
}

// Re-export the constants used for drawing connectors, so consumers don't need
// to import from the SDK directly.
export const FACE_CONNECTORS = {
  tesselation: FaceLandmarker.FACE_LANDMARKS_TESSELATION,
  faceOval: FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
  lips: FaceLandmarker.FACE_LANDMARKS_LIPS,
  leftEye: FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
  rightEye: FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
};
export const HAND_CONNECTIONS = HandLandmarker.HAND_CONNECTIONS;
