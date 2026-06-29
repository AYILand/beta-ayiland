-- AYILAND BETA · schema initial
-- À exécuter dans Supabase Dashboard → SQL Editor → New query → Run

-- 1. Table des candidats
create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz,
  xp int not null default 0,
  linkedin_handle text,
  twitter_handle text,
  whatsapp text,
  linkedin_proof_url text,
  twitter_proof_url text,
  flow_state jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists candidates_status_idx on public.candidates(status);
create index if not exists candidates_submitted_at_idx on public.candidates(submitted_at desc nulls last);

-- 2. Quests custom (gérées par l'admin)
create table if not exists public.custom_quests (
  id uuid primary key default gen_random_uuid(),
  title_fr text not null,
  title_en text not null,
  desc_fr text,
  desc_en text,
  url text,
  points int not null default 100,
  require_screenshot boolean not null default false,
  active boolean not null default true,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists custom_quests_active_idx on public.custom_quests(active, position);

-- 3. Trigger updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists candidates_touch on public.candidates;
create trigger candidates_touch
  before update on public.candidates
  for each row execute function public.touch_updated_at();

-- 4. RLS (Row Level Security)
alter table public.candidates enable row level security;
alter table public.custom_quests enable row level security;

-- Candidats : upsert ouvert (identifié par email), pas de lecture publique
drop policy if exists "Insert candidates" on public.candidates;
create policy "Insert candidates"
  on public.candidates for insert
  to anon
  with check (true);

drop policy if exists "Update own candidate" on public.candidates;
create policy "Update own candidate"
  on public.candidates for update
  to anon
  using (true)
  with check (true);

-- Quests custom : lecture publique des actives uniquement
drop policy if exists "Read active quests" on public.custom_quests;
create policy "Read active quests"
  on public.custom_quests for select
  to anon
  using (active = true);

-- Toutes les opérations admin passent par la service_role key (bypass RLS)

-- 5. Storage bucket pour les screenshots
insert into storage.buckets (id, name, public)
values ('proofs', 'proofs', true)
on conflict (id) do nothing;

-- Policy d'upload : anonyme peut uploader dans son propre dossier (email-keyed)
drop policy if exists "Upload proofs" on storage.objects;
create policy "Upload proofs"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'proofs');

-- Lecture publique des proofs (URL signée optionnelle plus tard)
drop policy if exists "Read proofs" on storage.objects;
create policy "Read proofs"
  on storage.objects for select
  to anon
  using (bucket_id = 'proofs');
