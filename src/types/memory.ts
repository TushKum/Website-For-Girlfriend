/**
 * The canonical shape of a single memory.
 *
 * Everything the experience needs to render a photo plane, its tooltip, and
 * its full-screen reveal modal is described here. Keep this the single source
 * of truth — components consume `Memory`, never loose props.
 */
export interface Memory {
  /** Stable unique identifier (also used as React key). Numbers for the seed
   *  set; string UUIDs for memories she adds herself. */
  id: number | string;
  /** Fully-qualified media URL. For a photo it's the image; for a video it's
   *  the video file (played muted+looping on the card, with sound in the modal). */
  imageURL: string;
  /** What `imageURL` points at. Absent → treat as 'image' (the seed set). */
  mediaType?: 'image' | 'video';
  /** Short, evocative title shown in the tooltip and modal headline. */
  title: string;
  /** Human-readable date string, e.g. "12 February 2024". */
  date: string;
  /** Where the memory happened, e.g. "Lake Como, Italy". */
  location: string;
  /** A heartfelt, longer-form narrative shown in the reveal modal. */
  caption: string;
}

/**
 * A memory enriched with its computed position on the Fibonacci sphere.
 * Produced by `PhotoGlobe` and handed to each `PhotoPlane`.
 */
export interface PositionedMemory extends Memory {
  /** Unit-sphere position (x, y, z) scaled to the globe radius. */
  position: [number, number, number];
}
