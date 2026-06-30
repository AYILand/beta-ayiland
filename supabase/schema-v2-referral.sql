-- AYILAND BETA v2 — système de parrainage + leaderboard
-- À exécuter dans Supabase SQL Editor → New query → Run
-- Sans risque : peut être lancé plusieurs fois (idempotent).

-- 1. Colonnes referral sur candidates
alter table public.candidates
  add column if not exists ref_code text unique,
  add column if not exists referred_by text references public.candidates(email) on delete set null,
  add column if not exists display_name text,
  add column if not exists display_mode text not null default 'name_initial'
    check (display_mode in ('name_initial', 'handle', 'anonymous', 'hidden'));

create index if not exists candidates_ref_code_idx on public.candidates(ref_code);
create index if not exists candidates_referred_by_idx on public.candidates(referred_by);

-- 2. Génération automatique du ref_code (6 chars hex)
create or replace function public.gen_ref_code()
returns text language sql volatile as $$
  select lower(substring(md5(random()::text || clock_timestamp()::text), 1, 6));
$$;

create or replace function public.set_candidate_ref_code()
returns trigger language plpgsql as $$
begin
  if new.ref_code is null then
    new.ref_code := public.gen_ref_code();
  end if;
  return new;
end;
$$;

drop trigger if exists candidates_set_ref_code on public.candidates;
create trigger candidates_set_ref_code
  before insert on public.candidates
  for each row execute function public.set_candidate_ref_code();

-- 3. Backfill : assigne un ref_code aux candidats existants qui n'en ont pas
update public.candidates set ref_code = public.gen_ref_code() where ref_code is null;

-- 4. Vue leaderboard (top 10 par parrainages valides + XP)
create or replace view public.leaderboard as
select
  c.ref_code,
  c.linkedin_handle,
  c.display_name,
  c.display_mode,
  c.xp,
  (
    select count(*)
    from public.candidates r
    where r.referred_by = c.email
      and r.submitted_at is not null
  ) as referral_count
from public.candidates c
where c.display_mode <> 'hidden'
  and c.submitted_at is not null
order by referral_count desc, c.xp desc
limit 10;

-- 5. Stat globale (pour décider si on affiche le leaderboard)
create or replace view public.leaderboard_stats as
select
  count(*) as total_candidates,
  count(*) filter (where submitted_at is not null) as total_submitted,
  (
    select max(referral_count) from public.leaderboard
  ) as top_referrals
from public.candidates;

-- 6. RLS : autoriser la lecture publique des vues
grant select on public.leaderboard to anon;
grant select on public.leaderboard_stats to anon;
