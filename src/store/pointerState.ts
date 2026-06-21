/**
 * pointerState.ts
 *
 * Tiny mutable singleton describing the mouse-drag fallback (for users without
 * a webcam). Lives outside React for the same reason as `handState`: the
 * carousel reads it every frame. `moved` lets cards distinguish a genuine click
 * from the tail end of a drag, so dragging the carousel never accidentally
 * opens a memory.
 */
export const pointerState = {
  dragging: false,
  /** Set true once a drag passes the slop threshold; cleared on next press. */
  moved: false,
  /** Horizontal movement (px) accumulated since the carousel last consumed it. */
  dx: 0,
};
