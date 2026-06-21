import * as THREE from 'three';

/**
 * coords.ts
 *
 * The exact, documented logic for mapping MediaPipe's 2D landmarks into
 * Three.js 3D space — the crux of "reach into the scene with your hand".
 *
 * ── The coordinate journey ───────────────────────────────────────────────
 * 1. MediaPipe normalized landmark:  x,y ∈ [0,1], ORIGIN TOP-LEFT, y DOWN.
 *    (x grows right, y grows down — image convention.)
 * 2. Selfie mirroring: the webcam preview is mirrored so moving your hand
 *    right moves it right on screen, so we flip x.
 * 3. Clip space / NDC:  x,y ∈ [-1,1], ORIGIN CENTER, y UP (GL convention).
 *        ndcX = (1 - x) * 2 - 1  = 1 - 2x      (mirror + remap)
 *        ndcY = -(y * 2 - 1)     = 1 - 2y      (flip y to point up)
 * 4. World space: cast a ray from the camera through that NDC point and
 *    intersect it with a chosen depth plane (z = targetZ). That gives the
 *    precise world position "under" the fingertip at the carousel's depth.
 */

/** Step 2+3: normalized image landmark → mirrored NDC. */
export function landmarkToNDC(x: number, y: number): { x: number; y: number } {
  return { x: 1 - 2 * x, y: 1 - 2 * y };
}

// Reusable scratch objects — coordinate mapping runs every frame, so we never
// allocate inside the hot path.
const _ray = new THREE.Raycaster();
const _ndc = new THREE.Vector2();
const _plane = new THREE.Plane();
const _planeNormal = new THREE.Vector3(0, 0, 1);
const _coplanar = new THREE.Vector3();

/**
 * Step 4: project an NDC point onto the world plane z = `targetZ`, as seen by
 * `camera`. Writes into `out` (pass a persistent vector to stay allocation-free)
 * and returns it.
 */
export function ndcToWorldAtZ(
  ndcX: number,
  ndcY: number,
  camera: THREE.Camera,
  targetZ: number,
  out: THREE.Vector3,
): THREE.Vector3 {
  _ray.setFromCamera(_ndc.set(ndcX, ndcY), camera);
  _plane.setFromNormalAndCoplanarPoint(_planeNormal, _coplanar.set(0, 0, targetZ));
  const hit = _ray.ray.intersectPlane(_plane, out);
  // If the ray is parallel to the plane (never, for our forward camera), fall
  // back to a sensible point so consumers never read NaN.
  if (!hit) out.set(ndcX * 5, ndcY * 3, targetZ);
  return out;
}
