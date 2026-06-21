import { create } from 'zustand';

/**
 * useVisionStore.ts
 *
 * The LOW-frequency, React-facing companion to `handState`. Only discrete UI
 * facts live here — things that change a handful of times per session, not per
 * frame — so subscribing components re-render rarely.
 */
export type VisionStatus =
  | 'idle' // onboarding, not yet started
  | 'requesting' // asking for camera permission
  | 'running' // tracking live
  | 'denied' // permission refused
  | 'unavailable'; // no camera / continuing without gestures

interface VisionState {
  status: VisionStatus;
  /** Whether the engine currently sees a hand (updated only on change). */
  handPresent: boolean;
  /** True once the user has left onboarding (with or without the camera). */
  started: boolean;

  setStatus: (s: VisionStatus) => void;
  setHandPresent: (present: boolean) => void;
  start: () => void;
}

export const useVisionStore = create<VisionState>((set) => ({
  status: 'idle',
  handPresent: false,
  started: false,

  setStatus: (status) => set({ status }),
  setHandPresent: (handPresent) => set({ handPresent }),
  start: () => set({ started: true }),
}));
