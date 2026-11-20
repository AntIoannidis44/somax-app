-- Full energy accounting (2026-11-21): calories were rebuilt from protein/carbs/fat only (4/4/9), dropping
-- alcohol, fibre and the real label/scan figure. kcal now stores the TRUE energy per unit; these optional
-- columns record the extra nutrients that contribute to it. Existing rows are untouched (all nullable).
alter table public.food_log_entries
  add column if not exists alcohol_g numeric,
  add column if not exists fiber_g numeric,
  add column if not exists sugar_g numeric,
  add column if not exists kcal_source text;  -- 'label' | 'estimate' | 'formula' (how kcal was obtained)
