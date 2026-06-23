-- ─────────────────────────────────────────────────────────────────────────
-- Memory Globe — Supabase schema
-- Run this once in your project's SQL Editor (Supabase dashboard).
-- Policies are intentionally permissive: this is a personal gift accessed with
-- the public anon key, no user accounts. (Tighten later if you ever need to.)
-- ─────────────────────────────────────────────────────────────────────────

-- Love notes (guestbook) ----------------------------------------------------
create table if not exists public.notes (
  id         uuid primary key default gen_random_uuid(),
  name       text not null default 'Anonymous',
  message    text not null,
  created_at timestamptz not null default now()
);
alter table public.notes enable row level security;
create policy "read notes"  on public.notes for select using (true);
create policy "add notes"   on public.notes for insert with check (true);

-- Visits ("she opened it") --------------------------------------------------
create table if not exists public.visits (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);
alter table public.visits enable row level security;
create policy "read visits" on public.visits for select using (true);
create policy "add visits"  on public.visits for insert with check (true);

-- Her uploaded memories (for the photo-upload feature) ----------------------
create table if not exists public.memories (
  id         uuid primary key default gen_random_uuid(),
  title      text,
  date       text,
  location   text,
  caption    text,
  image_path text,
  created_at timestamptz not null default now()
);
alter table public.memories enable row level security;
create policy "read memories" on public.memories for select using (true);
create policy "add memories"  on public.memories for insert with check (true);

-- Her poems ------------------------------------------------------------------
create table if not exists public.poems (
  id         uuid primary key default gen_random_uuid(),
  title      text not null default 'Untitled',
  body       text not null,
  created_at timestamptz not null default now()
);
alter table public.poems enable row level security;
create policy "read poems" on public.poems for select using (true);
create policy "add poems"  on public.poems for insert with check (true);

-- Her paintings (image_path = public URL in the 'paintings' bucket) ----------
create table if not exists public.paintings (
  id         uuid primary key default gen_random_uuid(),
  title      text not null default 'Untitled',
  caption    text,
  image_path text not null,
  created_at timestamptz not null default now()
);
alter table public.paintings enable row level security;
create policy "read paintings" on public.paintings for select using (true);
create policy "add paintings"  on public.paintings for insert with check (true);

-- Public storage bucket for uploaded photos ---------------------------------
insert into storage.buckets (id, name, public)
values ('memories', 'memories', true)
on conflict (id) do nothing;

create policy "read memories bucket"
  on storage.objects for select using (bucket_id = 'memories');
create policy "upload to memories bucket"
  on storage.objects for insert with check (bucket_id = 'memories');

-- Public storage bucket for her uploaded paintings --------------------------
insert into storage.buckets (id, name, public)
values ('paintings', 'paintings', true)
on conflict (id) do nothing;

create policy "read paintings bucket"
  on storage.objects for select using (bucket_id = 'paintings');
create policy "upload to paintings bucket"
  on storage.objects for insert with check (bucket_id = 'paintings');
