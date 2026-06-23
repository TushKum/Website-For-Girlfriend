import { supabase } from './supabase';

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
