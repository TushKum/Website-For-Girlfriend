import { supabase } from './supabase';
import type { Memory } from '../types/memory';

/**
 * db.ts — the data layer.
 *
 * A small, async, backend-agnostic API for the gift's persistent features
 * (love notes, visit counts, …). It runs against **Supabase** when configured
 * (see supabase.ts / supabase-schema.sql), and otherwise **local-first** on
 * localStorage — so it works with zero setup and upgrades to a shared backend
 * the moment you paste your keys. Remote calls fall back to local on any error,
 * so the gift never breaks.
 */

export interface GuestNote {
  id: string;
  name: string;
  message: string;
  createdAt: number;
}

/** True when a real backend (Supabase) is wired up. */
export const IS_REMOTE = supabase !== null;

const NOTES_KEY = 'mg-notes';
const VISITS_KEY = 'mg-visits';

// ── localStorage helpers (safe against quota / parse errors) ───────────────
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors — the gift degrades gracefully */
  }
}

function genId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface NoteRow {
  id: string | number;
  name: string;
  message: string;
  created_at: string;
}
const rowToNote = (r: NoteRow): GuestNote => ({
  id: String(r.id),
  name: r.name,
  message: r.message,
  createdAt: new Date(r.created_at).getTime(),
});

// ── Love notes (guestbook) ─────────────────────────────────────────────────

/** Newest-first list of all guestbook notes. */
export async function listNotes(): Promise<GuestNote[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) return (data as NoteRow[]).map(rowToNote);
    console.warn('[db] listNotes fell back to local:', error?.message);
  }
  return read<GuestNote[]>(NOTES_KEY, []).sort((a, b) => b.createdAt - a.createdAt);
}

/** Append a note and return the saved record. */
export async function addNote(name: string, message: string): Promise<GuestNote> {
  const clean = { name: name.trim() || 'Anonymous', message: message.trim() };

  if (supabase) {
    const { data, error } = await supabase.from('notes').insert(clean).select().single();
    if (!error && data) return rowToNote(data as NoteRow);
    console.warn('[db] addNote fell back to local:', error?.message);
  }

  const note: GuestNote = { id: genId(), ...clean, createdAt: Date.now() };
  const notes = read<GuestNote[]>(NOTES_KEY, []);
  notes.push(note);
  write(NOTES_KEY, notes);
  return note;
}

// ── Visit tracking ("she opened it") ───────────────────────────────────────

/** Record a visit and return the new total. */
export async function recordVisit(): Promise<number> {
  if (supabase) {
    const { error } = await supabase.from('visits').insert({});
    if (!error) return getVisitCount();
    console.warn('[db] recordVisit fell back to local:', error.message);
  }
  const count = read<number>(VISITS_KEY, 0) + 1;
  write(VISITS_KEY, count);
  return count;
}

/** Current total visit count. */
export async function getVisitCount(): Promise<number> {
  if (supabase) {
    const { count, error } = await supabase
      .from('visits')
      .select('*', { count: 'exact', head: true });
    if (!error) return count ?? 0;
    console.warn('[db] getVisitCount fell back to local:', error.message);
  }
  return read<number>(VISITS_KEY, 0);
}

// ── Her creative corner: poems + paintings ─────────────────────────────────

export interface Poem {
  id: string;
  title: string;
  body: string;
  createdAt: number;
}

export interface Painting {
  id: string;
  title: string;
  caption: string;
  /** Public URL (Supabase) or a downscaled data-URL (local). */
  imageURL: string;
  createdAt: number;
}

const POEMS_KEY = 'mg-poems';
const PAINTINGS_KEY = 'mg-paintings';

interface PoemRow {
  id: string | number;
  title: string;
  body: string;
  created_at: string;
}
const rowToPoem = (r: PoemRow): Poem => ({
  id: String(r.id),
  title: r.title,
  body: r.body,
  createdAt: new Date(r.created_at).getTime(),
});

interface PaintingRow {
  id: string | number;
  title: string;
  caption: string;
  image_path: string;
  created_at: string;
}
const rowToPainting = (r: PaintingRow): Painting => ({
  id: String(r.id),
  title: r.title,
  caption: r.caption,
  imageURL: r.image_path,
  createdAt: new Date(r.created_at).getTime(),
});

/** Newest-first poems. */
export async function listPoems(): Promise<Poem[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('poems')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) return (data as PoemRow[]).map(rowToPoem);
    console.warn('[db] listPoems fell back to local:', error?.message);
  }
  return read<Poem[]>(POEMS_KEY, []).sort((a, b) => b.createdAt - a.createdAt);
}

/** Save a poem. */
export async function addPoem(title: string, body: string): Promise<Poem> {
  const clean = { title: title.trim() || 'Untitled', body: body.trim() };
  if (supabase) {
    const { data, error } = await supabase.from('poems').insert(clean).select().single();
    if (!error && data) return rowToPoem(data as PoemRow);
    console.warn('[db] addPoem fell back to local:', error?.message);
  }
  const poem: Poem = { id: genId(), ...clean, createdAt: Date.now() };
  const poems = read<Poem[]>(POEMS_KEY, []);
  poems.push(poem);
  write(POEMS_KEY, poems);
  return poem;
}

/** Newest-first paintings. */
export async function listPaintings(): Promise<Painting[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('paintings')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) return (data as PaintingRow[]).map(rowToPainting);
    console.warn('[db] listPaintings fell back to local:', error?.message);
  }
  return read<Painting[]>(PAINTINGS_KEY, []).sort((a, b) => b.createdAt - a.createdAt);
}

/** Upload + save a painting (image → Supabase Storage, or a local data-URL). */
export async function addPainting(
  title: string,
  caption: string,
  file: File,
): Promise<Painting> {
  const meta = { title: title.trim() || 'Untitled', caption: caption.trim() };

  if (supabase) {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${genId()}.${ext}`;
    const up = await supabase.storage.from('paintings').upload(path, file);
    if (!up.error) {
      const { data: pub } = supabase.storage.from('paintings').getPublicUrl(path);
      const { data, error } = await supabase
        .from('paintings')
        .insert({ ...meta, image_path: pub.publicUrl })
        .select()
        .single();
      if (!error && data) return rowToPainting(data as PaintingRow);
      console.warn('[db] addPainting insert fell back to local:', error?.message);
    } else {
      console.warn('[db] addPainting upload fell back to local:', up.error.message);
    }
  }

  const imageURL = await fileToDataURL(file);
  const painting: Painting = { id: genId(), ...meta, imageURL, createdAt: Date.now() };
  const paintings = read<Painting[]>(PAINTINGS_KEY, []);
  paintings.push(painting);
  write(PAINTINGS_KEY, paintings);
  return painting;
}

// ── Cupcake: quick photos & videos 🧁 ─────────────────────────────────────

export interface Cupcake {
  id: string;
  title: string;
  /** Can be image/* or video/* */
  mediaType: 'image' | 'video';
  /** Public URL (Supabase) or a data-URL (local). */
  mediaURL: string;
  createdAt: number;
}

const CUPCAKES_KEY = 'mg-cupcakes';

interface CupcakeRow {
  id: string | number;
  title: string;
  media_type: 'image' | 'video';
  media_path: string;
  created_at: string;
}
const rowToCupcake = (r: CupcakeRow): Cupcake => ({
  id: String(r.id),
  title: r.title,
  mediaType: r.media_type,
  mediaURL: r.media_path,
  createdAt: new Date(r.created_at).getTime(),
});

/** Newest-first cupcakes (quick photo/video uploads). */
export async function listCupcakes(): Promise<Cupcake[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('cupcakes')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) return (data as CupcakeRow[]).map(rowToCupcake);
    console.warn('[db] listCupcakes fell back to local:', error?.message);
  }
  return read<Cupcake[]>(CUPCAKES_KEY, []).sort((a, b) => b.createdAt - a.createdAt);
}

/** Upload + save a photo or video (Supabase Storage or local data-URL). */
export async function addCupcake(title: string, file: File): Promise<Cupcake> {
  const meta = { title: title.trim() || 'Untitled' };
  const mediaType: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image';

  if (supabase) {
    const ext = file.name.split('.').pop() || (mediaType === 'video' ? 'mp4' : 'jpg');
    const path = `${genId()}.${ext}`;
    const up = await supabase.storage.from('cupcakes').upload(path, file);
    if (!up.error) {
      const { data: pub } = supabase.storage.from('cupcakes').getPublicUrl(path);
      const { data, error } = await supabase
        .from('cupcakes')
        .insert({ ...meta, media_type: mediaType, media_path: pub.publicUrl })
        .select()
        .single();
      if (!error && data) return rowToCupcake(data as CupcakeRow);
      console.warn('[db] addCupcake insert fell back to local:', error?.message);
    } else {
      console.warn('[db] addCupcake upload fell back to local:', up.error.message);
    }
  }

  const mediaURL = await fileToDataURL(file);
  const cupcake: Cupcake = { id: genId(), ...meta, mediaType, mediaURL, createdAt: Date.now() };
  const cupcakes = read<Cupcake[]>(CUPCAKES_KEY, []);
  cupcakes.unshift(cupcake);
  write(CUPCAKES_KEY, cupcakes);
  return cupcake;
}

// ── Her own photo memories (shown in the 3D carousel) ──────────────────────

export interface MemoryInput {
  title: string;
  date: string;
  location: string;
  caption: string;
}

const MEMS_KEY = 'mg-user-memories';

interface MemoryRow {
  id: string | number;
  title: string;
  date: string;
  location: string;
  caption: string;
  image_path: string;
  created_at: string;
}
const rowToMemory = (r: MemoryRow): Memory => ({
  id: String(r.id),
  imageURL: r.image_path,
  title: r.title,
  date: r.date,
  location: r.location,
  caption: r.caption,
});

/** Newest-first list of memories she has added herself. */
export async function listMemories(): Promise<Memory[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) return (data as MemoryRow[]).map(rowToMemory);
    console.warn('[db] listMemories fell back to local:', error?.message);
  }
  return read<Memory[]>(MEMS_KEY, []);
}

/** Upload + save a photo memory (image → Supabase Storage, or a local data-URL). */
export async function addMemory(input: MemoryInput, file: File): Promise<Memory> {
  const meta = {
    title: input.title.trim() || 'Untitled',
    date: input.date.trim(),
    location: input.location.trim(),
    caption: input.caption.trim(),
  };

  if (supabase) {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${genId()}.${ext}`;
    const up = await supabase.storage.from('memories').upload(path, file);
    if (!up.error) {
      const { data: pub } = supabase.storage.from('memories').getPublicUrl(path);
      const { data, error } = await supabase
        .from('memories')
        .insert({ ...meta, image_path: pub.publicUrl })
        .select()
        .single();
      if (!error && data) return rowToMemory(data as MemoryRow);
      console.warn('[db] addMemory insert fell back to local:', error?.message);
    } else {
      console.warn('[db] addMemory upload fell back to local:', up.error.message);
    }
  }

  const imageURL = await fileToDataURL(file);
  const memory: Memory = { id: genId(), imageURL, ...meta };
  const list = read<Memory[]>(MEMS_KEY, []);
  list.unshift(memory);
  write(MEMS_KEY, list);
  return memory;
}

/** Load an image file, downscale it, and return a compact JPEG data-URL. */
function fileToDataURL(file: File, maxDim = 1100): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image'));
    };
    img.src = url;
  });
}
