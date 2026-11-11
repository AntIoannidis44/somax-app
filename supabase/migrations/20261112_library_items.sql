-- Program & Meal Library: one browsable catalogue of programs and meals,
-- filterable by level / sport / goal. Three sources share the table:
--   somax     - written by us ("Programs by Somax")
--   credited  - a well-known public program/recipe, credited to its author
--   community - shared by a user from the app (named or anonymous)
-- Additive only: no existing table is touched.

create table if not exists public.library_items (
  id uuid primary key default gen_random_uuid(),
  -- Stable key for curated (seeded) rows so re-running the seed script
  -- updates instead of duplicating. Null for community uploads.
  slug text unique,
  kind text not null check (kind in ('program', 'meal')),
  name text not null,
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  -- programs: sport id (running, strength-training, ...); meals: null
  sport text,
  goals text[] not null default '{}',
  -- programs: equipment; meals: diet tags (vegan, high-protein, ...)
  tags text[] not null default '{}',
  -- programs: workout type id (gym/run/...) for the icon; meals: meal type
  category text not null default 'other',
  duration text,
  description text,
  -- programs: { exercises, series?, day?, daysPerWeek? }
  -- meals:    { servings, kcal, proteinG, carbsG, fatG, ingredients, steps, imageUrl? }
  content jsonb not null,
  source text not null check (source in ('somax', 'credited', 'community')),
  -- What the card shows: "Shared by <credit_name>" / "Program by <credit_name>".
  -- Null on a community row = the sharer chose to stay anonymous.
  credit_name text,
  source_url text,
  -- Who uploaded it. Deliberately NOT readable by clients (see grants
  -- below), so an anonymous share can't be traced back to its account.
  submitted_by uuid references auth.users (id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now()
);

create index if not exists library_items_kind_idx on public.library_items (kind, created_at desc);

alter table public.library_items enable row level security;

drop policy if exists "library read" on public.library_items;
create policy "library read" on public.library_items for select using (true);

drop policy if exists "library community insert" on public.library_items;
create policy "library community insert" on public.library_items for insert to authenticated
  with check (source = 'community' and submitted_by = auth.uid());

-- Column-level grants: everything readable except submitted_by.
revoke all on public.library_items from anon, authenticated;
grant select (id, slug, kind, name, level, sport, goals, tags, category, duration, description, content, source, credit_name, source_url, created_at)
  on public.library_items to anon, authenticated;
grant insert (kind, name, level, sport, goals, tags, category, duration, description, content, source, credit_name)
  on public.library_items to authenticated;

-- Which library items did I share? (for "Remove from library")
create or replace function public.my_library_item_ids()
returns setof uuid language sql security definer set search_path = public stable as $$
  select id from public.library_items where submitted_by = auth.uid();
$$;

create or replace function public.delete_my_library_item(item_id uuid)
returns void language sql security definer set search_path = public as $$
  delete from public.library_items where id = item_id and submitted_by = auth.uid();
$$;

revoke all on function public.my_library_item_ids() from public;
revoke all on function public.delete_my_library_item(uuid) from public;
grant execute on function public.my_library_item_ids() to authenticated;
grant execute on function public.delete_my_library_item(uuid) to authenticated;

-- Goal plans: one row per plan a user runs. Start benchmark, every retest
-- and the finish result are what calibrate the plan engines over time
-- (e.g. src/lib/plans/running.ts CALIBRATION.vdotGainPerWeek) from real
-- outcomes instead of textbook rates.
create table if not exists public.goal_plan_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  sport text not null,
  goal_label text not null,
  input jsonb not null,           -- engine input (distance, current, target, days/week)
  results jsonb not null default '[]', -- [{date, sec, kind: start|retest|finish}]
  engine_version text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  outcome text check (outcome in ('hit', 'missed', 'abandoned'))
);
alter table public.goal_plan_runs enable row level security;
drop policy if exists "own plan runs" on public.goal_plan_runs;
create policy "own plan runs" on public.goal_plan_runs for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Saves: who added which library item to their programs / recipes.
-- item_id is text because bundled curated items have string ids
-- (e.g. 'credited-gzclp-day-1'), not uuids. Counts are public (via the
-- function below); who saved what is not.
create table if not exists public.library_saves (
  item_id text not null,
  kind text not null check (kind in ('program', 'meal')),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (item_id, user_id)
);
alter table public.library_saves enable row level security;
drop policy if exists "own saves" on public.library_saves;
create policy "own saves" on public.library_saves for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.library_save_counts(k text)
returns table (item_id text, saves bigint) language sql security definer set search_path = public stable as $$
  select item_id, count(*) from public.library_saves where kind = k group by item_id;
$$;
revoke all on function public.library_save_counts(text) from public;
grant execute on function public.library_save_counts(text) to anon, authenticated;
