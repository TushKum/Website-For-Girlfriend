import { create } from 'zustand';
import * as THREE from 'three';
import type { Memory } from '../types/memory';

/**
 * Global experience store.
 *
 * Zustand (rather than React Context) is deliberate: state here is read and
 * written from *both* sides of the <Canvas> boundary — the DOM overlay/modal
 * and the WebGL scene graph — and Zustand's external store crosses that
 * reconciler boundary without context-bridging gymnastics. It's also the
 * idiomatic choice in the react-three ecosystem.
 */
interface MemoryState {
  /** Id of the currently hovered plane (drives slow-down + scale + glow). */
  hoveredId: number | null;
  /** The memory whose reveal modal is open, or null when browsing. */
  selected: Memory | null;
  /**
   * World-space position of the selected plane, captured at click time so the
   * camera rig can frame it precisely even though the globe group rotates.
   */
  focusPoint: THREE.Vector3 | null;
  /** True once preloading has settled (all images loaded or failed). */
  isReady: boolean;
  /** How many images have settled so far — drives the loading counter/bar. */
  loaded: number;

  // ── actions ────────────────────────────────────────────────────────────
  setHovered: (id: number | null) => void;
  /** Open a memory and remember where it sits in world space. */
  select: (memory: Memory, worldPosition: THREE.Vector3) => void;
  /** Close the modal and hand the camera back to the user. */
  close: () => void;
  setReady: (ready: boolean) => void;
  /** Increment the settled-image counter (called per image, success or fail). */
  bumpLoaded: () => void;
}

export const useMemoryStore = create<MemoryState>((set) => ({
  hoveredId: null,
  selected: null,
  focusPoint: null,
  isReady: false,
  loaded: 0,

  setHovered: (id) => set({ hoveredId: id }),

  select: (memory, worldPosition) =>
    set({ selected: memory, focusPoint: worldPosition.clone() }),

  close: () => set({ selected: null, focusPoint: null }),

  setReady: (ready) => set({ isReady: ready }),

  bumpLoaded: () => set((s) => ({ loaded: s.loaded + 1 })),
}));

/**
 * Convenience selector: the globe should keep its gentle spin only while the
 * user is neither hovering a photo nor reading one.
 */
export const selectIsIdle = (s: MemoryState): boolean =>
  s.hoveredId === null && s.selected === null;
