import * as THREE from 'three';

/**
 * Fibonacci (golden-spiral) sphere distribution.
 *
 * Places `count` points as evenly as possible across the surface of a sphere.
 * Unlike naïve lat/long grids, this never clusters or over-samples at the
 * poles, so our photos stay beautifully, uniformly spaced — no overlap, no
 * clipping, no crowding.
 *
 * The maths:
 *  - We walk `i` from 0..count-1 and map it to a latitude `y` in (-1, 1).
 *    The `+ 0.5` offset nudges samples off the exact poles so the top and
 *    bottom photos sit cleanly rather than degenerating to a single point.
 *  - `radius` is the circle radius at that latitude (Pythagoras on the unit
 *    sphere: r = √(1 - y²)).
 *  - We rotate around the Y axis by the golden angle (~137.5°) each step, the
 *    same angle sunflowers use to pack seeds without gaps.
 *
 * @param count  Number of points to generate.
 * @param radius Sphere radius to scale the unit positions onto.
 * @returns      Array of THREE.Vector3 positions on the sphere surface.
 */
export function fibonacciSphere(count: number, radius = 1): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];

  // The golden angle in radians: π · (3 − √5).
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    // Latitude coordinate, evenly stepped through (-1, 1), poles avoided.
    const y = 1 - ((i + 0.5) / count) * 2;

    // Radius of the latitude ring at height y.
    const ringRadius = Math.sqrt(Math.max(0, 1 - y * y));

    // Longitude: advance by the golden angle each step.
    const theta = goldenAngle * i;

    const x = Math.cos(theta) * ringRadius;
    const z = Math.sin(theta) * ringRadius;

    points.push(new THREE.Vector3(x * radius, y * radius, z * radius));
  }

  return points;
}
