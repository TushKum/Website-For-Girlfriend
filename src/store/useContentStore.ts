import { create } from 'zustand';
import type { Memory } from '../types/memory';
import { listMemories, addMemory as dbAddMemory, type MemoryInput } from '../services/db';

/**
 * useContentStore.ts
 *
 * Shared state for the memories she adds herself. The Gallery's "Photos" tab
 * writes here; the 3D `PhotoCarousel` reads here and merges these with the seed
 * memories — so a freshly-added photo pops into the carousel immediately.
 * Persistence is handled by the `db` layer (local-first → Supabase).
 */
interface ContentState {
  /** Memories she has added (newest first). */
  memories: Memory[];
  loaded: boolean;
  loadMemories: () => Promise<void>;
  addMemory: (input: MemoryInput, file: File) => Promise<Memory>;
}

export const useContentStore = create<ContentState>((set, get) => ({
  memories: [],
  loaded: false,

  loadMemories: async () => {
    if (get().loaded) return;
    const memories = await listMemories();
    set({ memories, loaded: true });
  },

  addMemory: async (input, file) => {
    const memory = await dbAddMemory(input, file);
    set((s) => ({ memories: [memory, ...s.memories] }));
    return memory;
  },
}));
