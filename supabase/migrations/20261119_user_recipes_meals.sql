-- Meal tags on saved recipes so Favourites / My recipes can be filtered by Breakfast / Lunch / Dinner / Snacks.
-- Additive and safe for older app builds (they select * and ignore the new column).
alter table public.user_recipes add column if not exists meals text[] not null default '{}';

-- Backfill: every meal the owner has already logged this recipe under (matched by name, case-insensitive).
update public.user_recipes r
set meals = sub.meals
from (
  select r2.id, array_agg(distinct f.meal order by f.meal) as meals
  from public.user_recipes r2
  join public.food_log_entries f on f.user_id = r2.user_id and lower(f.name) = lower(r2.name)
  where f.meal in ('breakfast', 'lunch', 'dinner', 'snacks')
  group by r2.id
) sub
where r.id = sub.id and r.meals = '{}';
