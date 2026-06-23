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

/** A full-screen "moment": clap → giant heart, prayer → giant lily. */
export type MomentType = 'heart' | 'lily';

interface VisionState {
  status: VisionStatus;
  /** Whether the engine currently sees a hand (updated only on change). */
  handPresent: boolean;
  /** True once the user has left onboarding (with or without the camera). */
  started: boolean;
  /** Human-readable reason the camera/gestures failed, shown in onboarding. */
  error: string | null;
  /** Active full-screen moment (freezes the scene), or null. */
  moment: MomentType | null;
  /** Bumped on every trigger so repeats of the same moment re-fire. */
  momentId: number;

  setStatus: (s: VisionStatus) => void;
  setHandPresent: (present: boolean) => void;
  start: () => void;
  setError: (msg: string | null) => void;
  triggerMoment: (t: MomentType) => void;
  clearMoment: () => void;
}

export const useVisionStore = create<VisionState>((set) => ({
  status: 'idle',
  handPresent: false,
  started: false,
  error: null,
  moment: null,
  momentId: 0,

  setStatus: (status) => set({ status }),
  setHandPresent: (handPresent) => set({ handPresent }),
  start: () => set({ started: true }),
  setError: (error) => set({ error }),
  triggerMoment: (moment) => set((s) => ({ moment, momentId: s.momentId + 1 })),
  clearMoment: () => set({ moment: null }),
}));

// Dev-only: `__moment('heart' | 'lily')` from the console to preview the
// freeze + giant-graphic moment without a webcam. Stripped from production.
if (import.meta.env.DEV) {
  (window as unknown as { __moment?: (t: MomentType) => void }).__moment = (t) =>
    useVisionStore.getState().triggerMoment(t);
}
