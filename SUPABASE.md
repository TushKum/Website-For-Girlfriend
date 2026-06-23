# Turning on the real backend (Supabase)

The app runs **local-first** out of the box — love notes and visit counts save
to the browser, no account needed. To make them **shared** (notes she writes
reach you on any device, real visit tracking, and photo uploads), wire up
Supabase. It's free and takes ~5 minutes.

## Steps

1. **Create a project** at [supabase.com](https://supabase.com) → _New project_.
   Pick a name + database password, wait for it to provision.

2. **Run the schema.** In the dashboard, open **SQL Editor → New query**, paste
   the contents of [`supabase-schema.sql`](./supabase-schema.sql), and **Run**.
   This creates the `notes`, `visits`, and `memories` tables (+ a public
   `memories` storage bucket) with the right access policies.

3. **Grab your keys.** Go to **Project Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

4. **Add them to the app.** Locally, copy `.env.example` to `.env` and paste the
   values. On **Vercel**, add the same two variables under
   **Project → Settings → Environment Variables**, then redeploy.

That's it — the data layer detects the keys and switches from localStorage to
Supabase automatically (no code changes). Until they're set, everything keeps
working locally.

## Notes

- The `anon` key is safe to expose in a frontend (that's its purpose); the
  policies in the schema scope what it can do.
- **Email alerts** ("she just opened your gift") need one more piece: a Supabase
  Edge Function (or Vercel function) that calls an email API like
  [Resend](https://resend.com). Ask and I'll add it — you'd provide a Resend API
  key.
- **Photo uploads** use the `memories` bucket created by the schema; the upload
  UI is the next feature to wire in.
