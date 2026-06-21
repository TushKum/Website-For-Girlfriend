/**
 * sceneConfig.ts
 *
 * Shared spatial constants for the 3D scene. Centralised so the camera, the
 * carousel, the hand pointer, and the heart emitter all agree on the same
 * geometry — change the feel of the whole scene from one place.
 */

/** Radius of the polaroid carousel ring. */
export const CAROUSEL_RADIUS = 5.2;

/** Default camera distance down the +Z axis. */
export const CAMERA_Z = 9.5;

/**
 * The world depth at which the user's hand "touches" the scene. Slightly in
 * front of the carousel centre so the hand pointer and heart bursts read as
 * floating between the viewer and the photos.
 */
export const HAND_PLANE_Z = 2.2;
