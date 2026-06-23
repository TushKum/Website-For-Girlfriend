import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * useGateStore.ts
 *
 * The login/entry gate. Persists to localStorage so a returning visitor walks
 * straight in. The "name" she enters greets her and signs her guestbook notes.
 *
 * An optional shared passcode can be required via the `VITE_GATE_CODE` env var
 * (e.g. your anniversary). If unset, the gate is name-only — works out of the
 * box, no secret to forget.
 */
interface GateState {
  unlocked: boolean;
  visitorName: string;
  unlock: (name: string) => void;
  lock: () => void;
}

export const useGateStore = create<GateState>()(
  persist(
    (set) => ({
      unlocked: false,
      visitorName: '',
      unlock: (name) => set({ unlocked: true, visitorName: name.trim() }),
      lock: () => set({ unlocked: false }),
    }),
    { name: 'mg-gate' },
  ),
);

/** The configured passcode, or '' when the gate is name-only. */
export const GATE_CODE: string = (import.meta.env.VITE_GATE_CODE as string | undefined)?.trim() ?? '';
