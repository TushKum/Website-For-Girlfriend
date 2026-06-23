import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * supabase.ts
 *
 * Lazily creates the Supabase client from env vars. If they're absent the
 * client is `null`, and the data layer transparently falls back to
 * localStorage — so the app always runs, with or without a backend.
 *
 * Set these in `.env` (see .env.example + SUPABASE.md):
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 */
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;
