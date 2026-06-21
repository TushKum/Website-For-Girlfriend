import { OPENCV_CDN } from './visionConfig';

/**
 * opencv.ts
 *
 * Lazy CDN loader for OpenCV.js plus a single, purpose-built image op: a soft,
 * romantic bloom used to make the webcam picture-in-picture match the dreamy
 * aesthetic. OpenCV is ~9MB, so it's loaded only when the PiP actually mounts —
 * never in the critical path of the main experience.
 *
 * OpenCV ships no types; we treat its global as `any` (aliased `CV`) and keep
 * all the loose access quarantined to this one module.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CV = any;

declare global {
  interface Window {
    cv?: CV;
  }
}

let loadPromise: Promise<CV> | null = null;

/** Load (once) and resolve the ready OpenCV runtime. */
export function loadOpenCV(): Promise<CV> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<CV>((resolve, reject) => {
    // Already present and initialised?
    if (window.cv && window.cv.Mat) {
      resolve(window.cv);
      return;
    }

    const script = document.createElement('script');
    script.src = OPENCV_CDN;
    script.async = true;
    script.onerror = () => reject(new Error('Failed to load OpenCV.js'));
    script.onload = () => {
      const cv = window.cv;
      if (!cv) {
        reject(new Error('OpenCV global missing after load'));
        return;
      }
      // Builds vary: some expose a Promise, some `onRuntimeInitialized`,
      // some are ready immediately. Handle all three.
      if (typeof cv.then === 'function') {
        cv.then((ready: CV) => {
          window.cv = ready;
          resolve(ready);
        });
      } else if (cv.Mat) {
        resolve(cv);
      } else {
        cv.onRuntimeInitialized = () => resolve(cv);
      }
    };
    document.body.appendChild(script);
  });

  return loadPromise;
}

/**
 * Apply a soft, warm bloom to `input` and paint the result into `output`.
 * Gaussian-blurred copy screened back over the original lifts the highlights
 * into a dreamy glow; a small positive bias warms and lifts the shadows.
 *
 * Mats are allocated and freed each call — fine for the tiny PiP resolution,
 * and it keeps the emscripten heap from leaking.
 */
export function applyRomanticBloom(
  cv: CV,
  input: HTMLCanvasElement,
  output: HTMLCanvasElement,
): void {
  const src = cv.imread(input);
  const blur = new cv.Mat();
  const out = new cv.Mat();
  try {
    cv.GaussianBlur(src, blur, new cv.Size(0, 0), 6, 6, cv.BORDER_DEFAULT);
    // out = 0.85*src + 0.55*blur + 10  → soft bloom + gentle lift.
    cv.addWeighted(src, 0.85, blur, 0.55, 10, out);
    cv.imshow(output, out);
  } finally {
    src.delete();
    blur.delete();
    out.delete();
  }
}
