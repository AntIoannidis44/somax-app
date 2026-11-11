-- Ant's "The Full Body Workout" into the Library as a community share,
-- credited "Shared by Ant Ioannidis". Exercises copied straight from the
-- saved custom_workouts row (no retyping). Idempotent via slug.
insert into public.library_items (slug, kind, name, level, sport, goals, tags, category, duration, description, content, source, credit_name, submitted_by)
select
  'community-ant-full-body',
  'program',
  'The Full Body Workout',
  'intermediate',
  'strength-training',
  array['muscle', 'strength', 'general-fitness'],
  array['dumbbells', 'barbell', 'machines', 'cables'],
  'gym',
  '45 min',
  'A whole-body session in 45 minutes, built for intermediate lifters with a busy schedule who can only get to the gym 2-3 times a week. Run it 3x a week: drop sets and supersets keep it dense, and it finishes with a core circuit.',
  jsonb_build_object(
    'exercises', w.exercises,
    'daysPerWeek', 3,
    'sessionMinutes', 45,
    'whoItsFor', 'Intermediate gym-goers with a busy lifestyle who can only get to the gym 2-3 times a week - every session hits the whole body, so missing a day never leaves a muscle group untrained.',
    'lifestyle', jsonb_build_array('busy', 'time-efficient', 'full-gym'),
    'howToRun', jsonb_build_array(
      'Run it 3 times a week where you can (2 still works), with at least one rest day between sessions.',
      'Each lift is 4 sets of 12-10-8-6 reps - go heavier as the reps drop.',
      'Same-letter exercises are supersets: do them back to back, then rest.',
      'Finish with the core circuit - plank, side planks, crunches, toe touches, Russian twists.',
      'When the last set of 6 feels easy, move that lift up a weight next session.'
    )
  ),
  'community',
  'Ant Ioannidis',
  w.user_id
from public.custom_workouts w
where w.id = 'a7305491-a26d-4b5c-80c7-b766a0ace1fd'
on conflict (slug) do update set
  name = excluded.name, level = excluded.level, goals = excluded.goals, description = excluded.description, content = excluded.content;
