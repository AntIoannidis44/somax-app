"""Credited (verified) gym programs for the expansion pass: strength-training, bodybuilding,
powerlifting, calisthenics. Every entry was read from its sourceUrl on 2026-11-13.
Only facts are recorded (exercise names, sets, reps, loads, timings); all prose is our own.

Usage: python3 gen_gym_sourced.py <out.json>
"""
import json, sys

OUT = sys.argv[1]


def E(name, sets, reps, weight=None, distance=None, group=None):
    d = {"name": name, "sets": sets, "reps": str(reps)}
    if weight: d["weight"] = weight
    if distance: d["distance"] = distance
    if group: d["group"] = group
    return d


P = []


def add(id, name, category, level, sport, goals, minutes, dpw, equipment, description, who, lifestyle, how,
        exercises, credit, url, note, series=None, day=None, n=None):
    d = dict(id=id, name=name)
    if series:
        d.update(series=series, day=day, daysInSeries=n)
    d.update(category=category, level=level, sport=sport, goals=goals, duration=f"{minutes} min", daysPerWeek=dpw,
             sessionMinutes=minutes, equipment=equipment, description=description, whoItsFor=who, lifestyle=lifestyle,
             howToRun=how, exercises=exercises, credit=credit, sourceUrl=url, sourceNote=note, verified=True)
    P.append(d)


# =========================================================== StrengthLog (free articles)
SLG = "© StrengthLog. Free program published in full in the article (also free in the StrengthLog app). No reuse licence stated, so only exercises/sets/reps are recorded; descriptions are our own. Keep the credit and link out."

# --- Beginner Strength Training Program (Andreas Abelsson)
U = "https://www.strengthlog.com/beginner-strength-training-program/"
C = "Andreas Abelsson (StrengthLog)"
who = "New lifters in a commercial gym who want a simple two-workout plan that mixes the big barbell lifts with a few machine and isolation moves. About 45-50 minutes, two or three times a week."
how = ["Alternate A and B: A-B-A one week, B-A-B the next, with a rest day between sessions (or just A and B if you can only train twice).",
       "Work in the rep range: when every set hits the top number, add the smallest step of weight and drop back to the bottom of the range.",
       "Rest about 2-3 minutes on squats, deadlifts and presses and 1-2 minutes on the smaller exercises.",
       "Don't stress if a lift doesn't go up every session. After 3-6 months, move on to an intermediate plan such as an upper/lower split."]
add("x-gym-strengthlog-beginner-strength-a", "StrengthLog Beginner Strength – Workout A", "gym", "beginner", "strength-training",
    ["strength", "muscle", "general-fitness"], 50, 3, ["barbell", "squat rack", "cables", "machines"],
    "Squat, overhead press and barbell rows, then triceps, hamstrings and abs. A balanced full-body session that alternates with Workout B.",
    who, ["full-gym"], how,
    [E("Back Squat", 3, "6-8"), E("Overhead Press", 3, "8-10"), E("Barbell Row", 3, "8-10"), E("Triceps Pushdown", 2, "8-10"),
     E("Seated Leg Curl", 2, "8-10"), E("Crunch or Hanging Knee Raise", 2, "10-12")],
    C, U, SLG, "StrengthLog Beginner Strength Training Program", 1, 2)
add("x-gym-strengthlog-beginner-strength-b", "StrengthLog Beginner Strength – Workout B", "gym", "beginner", "strength-training",
    ["strength", "muscle", "general-fitness"], 50, 3, ["barbell", "bench", "cables", "machines"],
    "Deadlifts, bench press and pulldowns, with curls, leg extensions and calf raises to round it out.",
    who, ["full-gym"], how,
    [E("Deadlift", 3, "5-6"), E("Bench Press", 3, "8-10"), E("Lat Pulldown", 3, "8-10"), E("Barbell Curl", 2, "8-10"),
     E("Leg Extension", 2, "8-10"), E("Standing Calf Raise", 2, "10-12")],
    C, U, SLG, "StrengthLog Beginner Strength Training Program", 2, 2)

# --- Beginner Dumbbell Program (Andreas Abelsson)
U = "https://www.strengthlog.com/beginner-dumbbell-program/"
who = "Beginners training at home or in a small gym with a few pairs of dumbbells. Three short sessions a week, about 30 minutes each."
how = ["Alternate A and B three times a week (A-B-A, then B-A-B), ideally with a rest day between.",
       "Double progression: build up to 3 x 10 on every exercise, then move to the next heaviest pair and start again at fewer reps.",
       "Rest 1-2 minutes between sets.",
       "No bench? Do the chest press on the floor. When your heaviest dumbbells are easy for 3 x 10, slow the lowering down or move to a gym plan."]
add("x-gym-strengthlog-beginner-dumbbell-a", "StrengthLog Beginner Dumbbell – Workout A", "fitness", "beginner", "strength-training",
    ["strength", "muscle", "general-fitness"], 30, 3, ["dumbbells"],
    "Three moves that cover legs, chest and back with just dumbbells: goblet squats, a chest press and rows.",
    who, ["home", "minimal-equipment", "time-efficient"], how,
    [E("Goblet Squat", 3, "10"), E("Dumbbell Chest Press (floor press if no bench)", 3, "10"), E("One-arm Dumbbell Row", 3, "10/arm")],
    C, U, SLG, "StrengthLog Beginner Dumbbell Program", 1, 2)
add("x-gym-strengthlog-beginner-dumbbell-b", "StrengthLog Beginner Dumbbell – Workout B", "fitness", "beginner", "strength-training",
    ["strength", "muscle", "general-fitness"], 30, 3, ["dumbbells"],
    "The second dumbbell session: a hip hinge, a single-leg move and an overhead press.",
    who, ["home", "minimal-equipment", "time-efficient"], how,
    [E("Dumbbell Romanian Deadlift", 3, "10"), E("Reverse Dumbbell Lunge", 3, "10/leg"), E("Dumbbell Shoulder Press", 3, "10")],
    C, U, SLG, "StrengthLog Beginner Dumbbell Program", 2, 2)

# --- Beginner Machine Program (Daniel Richter)
U = "https://www.strengthlog.com/beginner-machine-program/"
C = "Daniel Richter (StrengthLog)"
who = "Anyone nervous about free weights, or wanting the lowest-skill start possible. Twice a week on gym machines, about 40 minutes."
how = ["Do A and B once each per week with 3-4 days between them (for example Monday and Thursday).",
       "Start light enough to get every rep; add a small step (about 2.5kg) each session you complete all sets of 10.",
       "If you miss reps, stay at that weight until you get them all.",
       "Rest 1-2 minutes between sets. After a couple of months, add a third day or move to a free-weight beginner plan."]
add("x-gym-strengthlog-beginner-machine-a", "StrengthLog Beginner Machine – Workout A", "gym", "beginner", "strength-training",
    ["strength", "general-fitness", "muscle"], 40, 2, ["machines"],
    "Leg press, leg extensions, a chest press, seated rows and a machine crunch. Every exercise is on a guided machine.",
    who, ["full-gym", "busy"], how,
    [E("Leg Press", 3, "10"), E("Leg Extension", 2, "10"), E("Machine Chest Press", 3, "10"), E("Seated Machine Row", 3, "10"),
     E("Machine Crunch", 3, "10")],
    C, U, SLG, "StrengthLog Beginner Machine Program", 1, 2)
add("x-gym-strengthlog-beginner-machine-b", "StrengthLog Beginner Machine – Workout B", "gym", "beginner", "strength-training",
    ["strength", "general-fitness", "muscle"], 40, 2, ["machines", "cables"],
    "Leg press again, leg curls, a machine shoulder press, lat pulldowns and back extensions.",
    who, ["full-gym", "busy"], how,
    [E("Leg Press", 3, "10"), E("Seated Leg Curl", 2, "10"), E("Machine Shoulder Press", 3, "10"), E("Lat Pulldown", 3, "10"),
     E("Back Extension", 3, "10")],
    C, U, SLG, "StrengthLog Beginner Machine Program", 2, 2)

# --- Full Body Workout Routine 2x/week (Daniel Richter)
U = "https://www.strengthlog.com/strengthlogs-full-body-workout-2x-week/"
who = "Beginners who can only lift twice a week, and experienced lifters who are short on time or coming back from a break and want to hold on to strength."
how = ["Two sessions a week, alternating A and B, with at least two days between them.",
       "Start with weights you can lift for 3 x 10 with good form, stopping about one rep short of failure. Add 2.5kg each time you hit 3 x 10.",
       "When 3 x 10 stops moving (often after a month or two), switch to 3 x 5 and keep adding 2.5kg whenever you complete all sets.",
       "Rest 2-3 minutes between sets, up to 5 for very hard ones. Short on time? Drop the Romanian deadlift (A) or front squat (B)."]
add("x-gym-strengthlog-full-body-2x-a", "StrengthLog Full Body 2x/Week – Workout A", "gym", "beginner", "strength-training",
    ["strength", "muscle"], 60, 2, ["barbell", "squat rack", "bench"],
    "Four barbell lifts: squats, bench press, Romanian deadlifts and rows. All 3 sets of 5-10.",
    who, ["full-gym", "busy"], how,
    [E("Back Squat", 3, "5-10"), E("Bench Press", 3, "5-10"), E("Romanian Deadlift", 3, "5-10"), E("Barbell Row", 3, "5-10")],
    C, U, SLG, "StrengthLog Full Body 2x/Week", 1, 2)
add("x-gym-strengthlog-full-body-2x-b", "StrengthLog Full Body 2x/Week – Workout B", "gym", "beginner", "strength-training",
    ["strength", "muscle"], 60, 2, ["barbell", "squat rack", "cables"],
    "Deadlifts, overhead press, front squats and lat pulldowns. The second of two weekly sessions.",
    who, ["full-gym", "busy"], how,
    [E("Deadlift", 3, "5-10"), E("Overhead Press", 3, "5-10"), E("Front Squat", 3, "5-10"), E("Lat Pulldown", 3, "5-10")],
    C, U, SLG, "StrengthLog Full Body 2x/Week", 2, 2)

# --- Full Body Workout Routine 3x/week (Andreas Abelsson) - intermediate/advanced
U = "https://www.strengthlog.com/strengthlogs-full-body-hypertrophy/"
C = "Andreas Abelsson (StrengthLog)"
who = "Intermediate and advanced lifters who like full-body training and want both size and strength. Not a first program: you should already know the main lifts."
how = ["Three sessions a week on non-consecutive days, in order 1-2-3. With only two days, keep Workout 1 and add 2 or 3.",
       "Where reps are written like 8, 6, 4, add weight each set. Make the last rep of each set hard but not a grind.",
       "Add weight once you hit the target reps two sessions in a row. If you recover well after the first month, add a set per exercise.",
       "Rest as long as you need on the heavy lifts (2-4 min) and 1-2 minutes on the isolation work."]
add("x-gym-strengthlog-full-body-3x-1", "StrengthLog Full Body 3x/Week – Workout 1", "gym", "intermediate", "bodybuilding",
    ["muscle", "strength"], 70, 3, ["barbell", "squat rack", "bench", "pull-up bar"],
    "The heavy day: squats, bench, rows and presses in ramping sets of 8-6-4, then RDLs, close-grip bench, curls and leg raises.",
    who, ["full-gym"], how,
    [E("Back Squat", 4, "8, 6, 4, 4", "add weight on sets 2 and 4"), E("Bench Press", 3, "8, 6, 4", "add weight every set"),
     E("Barbell Row", 3, "8, 6, 4", "add weight every set"), E("Overhead Press", 3, "8, 6, 4", "add weight every set"),
     E("Romanian Deadlift", 2, "8, 6", "add weight on set 2"), E("Close-grip Bench Press", 2, "8"),
     E("Barbell Curl", 2, "8, 6", "add weight on set 2"), E("Hanging Leg Raise", 3, "max")],
    C, U, SLG, "StrengthLog Full Body 3x/Week", 1, 3)
add("x-gym-strengthlog-full-body-3x-2", "StrengthLog Full Body 3x/Week – Workout 2", "gym", "intermediate", "bodybuilding",
    ["muscle", "strength"], 70, 3, ["barbell", "bench", "dumbbells", "machines", "cables"],
    "A moderate day built on deadlifts, then sets of 10 for incline bench, pulldowns, leg press, shoulders and arms.",
    who, ["full-gym"], how,
    [E("Deadlift", 3, "8, 6, 6", "add weight on set 2"), E("Incline Bench Press", 3, "10"), E("Lat Pulldown (overhand)", 3, "10"),
     E("Leg Press", 3, "10"), E("Lying Leg Curl", 2, "10"), E("Dumbbell Shoulder Press", 3, "10"),
     E("Barbell Lying Triceps Extension", 2, "10"), E("Hammer Curl", 2, "10"), E("Cable Crunch", 2, "10")],
    C, U, SLG, "StrengthLog Full Body 3x/Week", 2, 3)
add("x-gym-strengthlog-full-body-3x-3", "StrengthLog Full Body 3x/Week – Workout 3", "gym", "intermediate", "bodybuilding",
    ["muscle"], 65, 3, ["barbell", "dumbbells", "cables", "machines", "bench"],
    "The lighter pump day: lunges, flyes, rows, laterals and arms for 12-15 reps, finishing with ab rollouts and a plank.",
    who, ["full-gym"], how,
    [E("Barbell Lunge", 3, "12/leg"), E("Leg Extension", 2, "15"), E("Standing Cable Chest Fly", 3, "12"),
     E("One-arm Dumbbell Row", 3, "12/arm"), E("Lying Leg Curl", 3, "15, 12, 12", "add weight on set 2"),
     E("Dumbbell Lateral Raise", 3, "12"), E("Triceps Pushdown", 3, "12"), E("Barbell Preacher Curl", 3, "12"),
     E("Kneeling Ab Wheel Roll-out", 2, "max"), E("Plank", 1, "max time")],
    C, U, SLG, "StrengthLog Full Body 3x/Week", 3, 3)

# --- Bodybuilding for Beginners (Andreas Abelsson)
U = "https://www.strengthlog.com/beginner-bodybuilding-program/"
who = "Beginners whose main goal is building muscle and changing how they look. Three full-body gym sessions a week of about an hour."
how = ["Alternate A and B three times a week, with a rest day between sessions. A two-day week of one A and one B also works.",
       "Double progression: build every set up to 10 reps, then add the smallest weight step and go back to 8.",
       "Rest about 2 minutes on the compound lifts and 60-90 seconds on isolation exercises. The calf raises are optional.",
       "Stay on it for at least 2-3 months before moving to an intermediate split. Add sets slowly, not all at once."]
add("x-gym-strengthlog-bodybuilding-beginners-a", "StrengthLog Bodybuilding for Beginners – Workout A", "gym", "beginner", "bodybuilding",
    ["muscle"], 60, 3, ["barbell", "squat rack", "bench", "dumbbells", "cables"],
    "Squats, RDLs, bench and pulldowns, then shoulders, arms and abs. Everything is in the 8-10 rep range.",
    who, ["full-gym"], how,
    [E("Back Squat", 3, "8-10"), E("Romanian Deadlift", 3, "8-10"), E("Bench Press", 3, "8-10"), E("Lat Pulldown", 3, "8-10"),
     E("Seated Dumbbell Shoulder Press", 2, "8-10"), E("Dumbbell Curl", 2, "8-10"), E("Triceps Pushdown", 2, "8-10"),
     E("Hanging Knee Raise", 2, "max"), E("Standing Calf Raise (optional)", 3, "8-10")],
    C, U, SLG, "StrengthLog Bodybuilding for Beginners", 1, 2)
add("x-gym-strengthlog-bodybuilding-beginners-b", "StrengthLog Bodybuilding for Beginners – Workout B", "gym", "beginner", "bodybuilding",
    ["muscle"], 55, 3, ["barbell", "bench", "machines", "dumbbells"],
    "Leg extensions and curls, close-grip bench, barbell rows, lateral raises, curls and crunches.",
    who, ["full-gym"], how,
    [E("Leg Extension", 3, "8-10"), E("Leg Curl", 3, "8-10"), E("Close-grip Bench Press", 3, "8-10"), E("Barbell Row", 3, "8-10"),
     E("Dumbbell Lateral Raise", 3, "8-10"), E("Barbell Curl", 2, "8-10"), E("Crunch", 2, "15-20"),
     E("Standing Calf Raise (optional)", 3, "8-10")],
    C, U, SLG, "StrengthLog Bodybuilding for Beginners", 2, 2)

# --- Training Program for Seniors (Andreas Abelsson) - two stand-alone variants
U = "https://www.strengthlog.com/strengthlogs-training-program-for-seniors/"
how = ["Two full-body sessions a week for the first month (e.g. Mon and Thu), then add a third if you feel good. Keep a rest day between sessions.",
       "Start with 1 set of each exercise. Go to 2 sets after a few weeks to a couple of months, and later up to 3.",
       "Stay in 10-12 reps. When you reach 12 on every set, make it a little harder (more weight or a harder version) and build back up.",
       "Finish each set feeling you could do a couple more reps; going to failure isn't needed. Check with your doctor first if you have a health condition."]
add("x-gym-strengthlog-seniors-gym", "StrengthLog Strength for Seniors – Gym", "gym", "beginner", "strength-training",
    ["strength", "general-fitness", "muscle"], 45, 2, ["machines", "cables", "dumbbells"],
    "Ten machine-based exercises covering every major muscle group, done for 1-3 easy-to-moderate sets of 10-12.",
    "Older adults (roughly 60+) starting strength training in a gym, or getting back into it, who want safe, guided machines.",
    ["older-adults", "full-gym"], how,
    [E("Leg Press", 3, "10-12"), E("Lying or Seated Leg Curl", 3, "10-12"), E("Machine Row or Lat Pulldown", 3, "10-12"),
     E("Machine Chest Press", 3, "10-12"), E("Machine Shoulder Press", 3, "10-12"), E("Machine or Dumbbell Biceps Curl", 3, "10-12"),
     E("Triceps Pushdown", 3, "10-12"), E("Standing Calf Raise or Heel Raise", 3, "10-12"), E("Crunch or Machine Crunch", 3, "10-12"),
     E("Floor or Machine Back Extension", 3, "10-12")],
    C, U, SLG + " Sets shown as 3 = the target; start with 1.")
add("x-gym-strengthlog-seniors-home", "StrengthLog Strength for Seniors – Home", "fitness", "beginner", "strength-training",
    ["strength", "general-fitness", "mobility"], 30, 2, ["bodyweight", "step", "chair"],
    "The equipment-free version: wall or kneeling push-ups, squats, step-ups and simple core and hip work.",
    "Older adults who'd rather train at home with just their body weight, a wall and a step.",
    ["older-adults", "home", "minimal-equipment"], how,
    [E("Wall or Kneeling Push-up", 3, "10-12"), E("Air Squat or Lunge", 3, "10-12"), E("Crunch or Kneeling Plank", 3, "10-12 or 30s"),
     E("Step-up or Glute Bridge", 3, "10-12"), E("Oblique Crunch or Kneeling Side Plank", 3, "10-12 or 30s"), E("Heel Raise", 3, "10-12"),
     E("Side Lunge", 3, "10-12"), E("Clamshell or Fire Hydrant", 3, "10-12/side")],
    C, U, SLG + " Sets shown as 3 = the target; start with 1.")

# --- Beginner Strength Training Without Equipment (Sandrine Quignaudon)
U = "https://www.strengthlog.com/beginner-strength-training-program-without-equipment/"
C = "Sandrine Quignaudon (StrengthLog)"
who = "True beginners, or people returning after a long break, who want to start strength training at home with no equipment. Sessions are short and gentle."
how = ["Three sessions a week on alternate days: A on Monday, B on Wednesday, C on Friday.",
       "Aim for the listed reps. Once they feel manageable, add reps or a set, or do the same work in less time.",
       "Then move to harder versions: half squats to full squats, kneeling incline push-ups to full push-ups, and so on.",
       "For inverted rows, use a sturdy table or a low bar. Rest about 60-90 seconds between sets."]
for d, (sfx, desc, ex, eq) in enumerate([
    ("a", "Half squats, kneeling incline push-ups, inverted rows and crunches.",
     [E("Half Air Squat", 2, "10"), E("Kneeling Incline Push-up", 2, "10"), E("Inverted Row (under a sturdy table)", 2, "max"), E("Crunch", 2, "15")],
     ["bodyweight"]),
    ("b", "Step-ups, shallow lunges, kneeling incline push-ups and glute bridges.",
     [E("Step-up", 2, "10/leg"), E("Shallow Lunge", 2, "10/leg"), E("Kneeling Incline Push-up", 2, "10"), E("Glute Bridge", 2, "10")],
     ["bodyweight", "step"]),
    ("c", "Half squats, inverted rows, bench dips and a kneeling plank.",
     [E("Half Air Squat", 2, "10"), E("Inverted Row (under a sturdy table)", 2, "max"), E("Bench Dip (chair or bench)", 2, "10"), E("Kneeling Plank", 1, "max time")],
     ["bodyweight", "chair"]),
], start=1):
    add(f"x-gym-strengthlog-no-equipment-{sfx}", f"StrengthLog No-Equipment Beginner – Workout {sfx.upper()}", "fitness", "beginner", "calisthenics",
        ["strength", "general-fitness"], 20, 3, eq, desc, who, ["home", "minimal-equipment", "time-efficient"], how, ex,
        C, U, SLG, "StrengthLog Beginner Strength Training Without Equipment", d, 3)

# --- Beginner Calisthenics Workout Plan (Andreas Abelsson) - beginner plan only (intermediate is premium)
U = "https://www.strengthlog.com/calisthenics-workout-plan/"
C = "Andreas Abelsson (StrengthLog)"
NOTE_CAL = SLG.replace("Free program published in full in the article", "Beginner plan shown in the article as a one-week snapshot (progression is in the app)") + " The intermediate plan is premium and was not used."
who = "Beginners who want to build strength with body weight and a pull-up bar, at home or in a park. Three sessions a week of about 40 minutes."
how = ["Train three days a week with a rest day between (e.g. Mon/Wed/Fri). If you can only do two, pick any two workouts.",
       "No pull-up yet? Use inverted rows for the pull-up sets and keep practising.",
       "Progress by adding reps, then harder versions (incline to full push-ups, assisted to full dips), slower lowering, or a weight vest.",
       "Once you can do more than 12-15 good reps of a move, make it harder. Rest 1-2 minutes between sets."]
for d, (desc, ex, eq) in enumerate([
    ("Push-ups, pull-ups or rows, squats, lunges and hanging leg raises.",
     [E("Push-up", 4, "8-15"), E("Pull-up or Inverted Row", 4, "max (rows 8-15)"), E("Bodyweight Squat", 3, "20-25"), E("Lunge", 3, "10-12/leg"),
      E("Hanging Leg Raise", 3, "12-15")], ["bodyweight", "pull-up bar"]),
    ("Dips, pull-ups or rows, step-ups, box jumps and a plank.",
     [E("Dip", 4, "8-15"), E("Pull-up or Inverted Row", 4, "max (rows 8-15)"), E("Step-up", 3, "20-25"), E("Box Jump", 3, "10-12"),
      E("Plank", 3, "45-60s")], ["bodyweight", "pull-up bar", "dip bars", "box"]),
    ("Bulgarian split squats, max push-ups, pull-ups or rows, glute bridges and core twists.",
     [E("Bulgarian Split Squat", 4, "8-15/leg"), E("Push-up", 4, "max"), E("Pull-up or Inverted Row", 3, "max (rows 8-15)"),
      E("Glute Bridge", 3, "10-12"), E("Core Twist", 3, "12-15/side")], ["bodyweight", "pull-up bar", "bench"]),
], start=1):
    add(f"x-gym-strengthlog-calisthenics-beginner-{d}", f"StrengthLog Beginner Calisthenics – Workout {d}", "fitness", "beginner", "calisthenics",
        ["strength", "muscle", "general-fitness"], 40, 3, eq, desc, who, ["home", "outdoor", "minimal-equipment"], how, ex,
        C, U, NOTE_CAL, "StrengthLog Beginner Calisthenics", d, 3)

# =========================================================== Dumbbell Stopgap PPL (r/Fitness)
U = "https://thefitness.wiki/reddit-archive/dumbbell-stopgap-ppl/"
C = "u/gregariousHermit (r/Fitness, archived on The Fitness Wiki)"
N = "Free community routine archived on The Fitness Wiki; no copyright or reproduction notice. Only exercises, sets and reps recorded."
who = "Home lifters with adjustable dumbbells, a bench and a pull-up bar who want a push/pull/legs split. Best once the basics are learnt."
how = ["Run Push/Pull/Legs twice a week with one rest day, or Push/Pull/Legs/Rest on a rolling four-day cycle if you need more recovery.",
       "Do 3 sets of as many reps as you can, up to 12. When all three sets reach 12, go to the next dumbbell.",
       "If an exercise stalls for three sessions in a row, drop two weight steps and work back up. Rest about 90 seconds between sets.",
       "Can't do a pull-up yet? Do slow negatives. When goblet squats outgrow your heaviest dumbbell, switch to Bulgarian split squats."]
add("x-gym-dumbbell-stopgap-ppl-push", "Dumbbell Stopgap PPL – Push", "fitness", "intermediate", "bodybuilding", ["muscle", "strength"], 40, 6,
    ["dumbbells", "bench"], "Chest press, incline flyes, Arnold presses and overhead triceps extensions, all with dumbbells.",
    who, ["home", "minimal-equipment"], how,
    [E("Dumbbell Chest Press", 3, "max (up to 12)"), E("Incline Dumbbell Fly (flat if no incline)", 3, "max (up to 12)"),
     E("Arnold Press", 3, "max (up to 12)"), E("Overhead Dumbbell Triceps Extension", 3, "max (up to 12)"),
     E("Hanging Leg Raise (every other workout)", 3, "max (up to 12)")], C, U, N, "Dumbbell Stopgap PPL", 1, 3)
add("x-gym-dumbbell-stopgap-ppl-pull", "Dumbbell Stopgap PPL – Pull", "fitness", "intermediate", "bodybuilding", ["muscle", "strength"], 40, 6,
    ["dumbbells", "pull-up bar"], "Pull-ups, bent-over rows, reverse flyes, shrugs and curls.",
    who, ["home", "minimal-equipment"], how,
    [E("Pull-up (negatives if needed)", 3, "max (up to 12)"), E("Dumbbell Bent-over Row", 3, "max (up to 12)"),
     E("Dumbbell Reverse Fly", 3, "max (up to 12)"), E("Dumbbell Shrug", 3, "max (up to 12)"), E("Dumbbell Biceps Curl", 3, "max (up to 12)"),
     E("Hanging Leg Raise (every other workout)", 3, "max (up to 12)")], C, U, N, "Dumbbell Stopgap PPL", 2, 3)
add("x-gym-dumbbell-stopgap-ppl-legs", "Dumbbell Stopgap PPL – Legs", "fitness", "intermediate", "bodybuilding", ["muscle", "strength"], 40, 6,
    ["dumbbells"], "Goblet squats, lunges, single-leg deadlifts and calf raises.",
    who, ["home", "minimal-equipment"], how,
    [E("Goblet Squat", 3, "max (up to 12)"), E("Dumbbell Lunge", 3, "max (up to 12)/leg"), E("Single-leg Dumbbell Deadlift", 3, "max (up to 12)/leg"),
     E("Dumbbell Calf Raise", 3, "max (up to 12)"), E("Hanging Leg Raise (every other workout)", 3, "max (up to 12)")],
    C, U, N, "Dumbbell Stopgap PPL", 3, 3)

# =========================================================== Building the Monolith (Jim Wendler)
U = "https://jimwendler.com/blogs/jimwendler-com/101078918-building-the-monolith-5-3-1-for-size"
C = "Jim Wendler"
N = "Free article on jimwendler.com (© JimWendler.com; 5/3/1 is Jim Wendler's brand). Week-1 sets/reps recorded only; the 6-week percentage table, conditioning and diet guidance are in the article and the 5/3/1 Forever book. Keep credit and link out."
who = "Intermediate lifters who know their training maxes and want a hard, high-volume 6-week block for size and strength. Three lifting days plus 3-4 conditioning sessions."
how = ["Lift Mon/Wed/Fri and do 3-4 short conditioning sessions (sled pushes, weighted-vest walks or bike) on the other days.",
       "Set training maxes at about 85% of your best, then follow the article's 6-week percentage table (week 1 shown here).",
       "Squat, press and deadlift/bench are the must-dos. Chins, dips, face pulls, curls and shrugs can be done in any set/rep split to hit the totals.",
       "Eat plenty: it's a size block. Read the full article before starting and take a lighter week afterwards."]
add("x-gym-wendler-monolith-mon", "Building the Monolith – Monday", "gym", "intermediate", "strength-training", ["muscle", "strength"], 75, 3,
    ["barbell", "squat rack", "pull-up bar", "dip bars", "cables or bands"],
    "Week 1: squat 5 x 5 at 90% after two ramp sets, press with an AMRAP back-off, then 100 chins, 100 face pulls and up to 200 dips.",
    who, ["full-gym"], how,
    [E("Back Squat", 7, "5", "70%, 80%, then 5 x 5 at 90% TM (week 1)"), E("Overhead Press", 4, "5, 5, 5, max", "70/80/90% TM, then max reps at 70%"),
     E("Chin-up", 1, "100 total"), E("Face Pull or Band Pull-apart", 1, "100 total"), E("Dip", 1, "100-200 total")],
    C, U, N, "Building the Monolith", 1, 3)
add("x-gym-wendler-monolith-wed", "Building the Monolith – Wednesday", "gym", "intermediate", "strength-training", ["muscle", "strength"], 70, 3,
    ["barbell", "bench", "dumbbells"],
    "Week 1: deadlifts up to 3 x 5 at 90%, bench 5 x 5 at 90%, heavy dumbbell rows and 100 curls.",
    who, ["full-gym"], how,
    [E("Deadlift", 5, "5", "70%, 80%, then 3 x 5 at 90% TM (week 1)"), E("Bench Press", 7, "5", "70%, 80%, then 5 x 5 at 90% TM"),
     E("Dumbbell Row", 5, "10-20"), E("Curl (any)", 1, "100 total")],
    C, U, N, "Building the Monolith", 2, 3)
add("x-gym-wendler-monolith-fri", "Building the Monolith – Friday", "gym", "intermediate", "strength-training", ["muscle", "strength"], 75, 3,
    ["barbell", "squat rack", "pull-up bar", "cables or bands"],
    "Week 1: squat with a 20-rep finishing set, 10 x 5 presses at 70%, weighted chins, face pulls and 100 shrugs.",
    who, ["full-gym"], how,
    [E("Back Squat", 3, "5", "70/80/90% TM"), E("Back Squat (20-rep set)", 1, "20", "45% TM (week 1)"), E("Overhead Press", 10, "5", "70% TM (week 1)"),
     E("Weighted Chin-up", 5, "5"), E("Face Pull or Band Pull-apart", 1, "100 total"), E("Shrug", 1, "100 total")],
    C, U, N, "Building the Monolith", 3, 3)

# =========================================================== PHAT (Layne Norton)
U = "http://simplyshredded.com/mega-feature-layne-norton-training-series-full-powerhypertrophy-routine-updated-2011.html"
C = "Dr Layne Norton (via Simply Shredded)"
N = "Free feature article on Simplyshredded.com (© Simplyshredded.com; no reproduction terms stated). Exercises, sets and reps recorded only; read the article for the full rationale."
who = "Advanced lifters with solid technique and good recovery who want a five-day power + hypertrophy split. Not for beginners."
how = ["Mon Upper Power, Tue Lower Power, Wed rest, Thu Back & Shoulders, Fri Lower Hypertrophy, Sat Chest & Arms, Sun rest.",
       "Power days: rest as long as needed (up to 5-6 min) between heavy sets. Speed sets: 65-70% of your 3-5RM, moved fast, under 90 seconds rest. Hypertrophy work: 1-2 min rest.",
       "Stop 1-2 reps short of failure for the first few weeks; later, take only the last set or two of an exercise to failure. Rotate the power movements every 2-3 weeks.",
       "Take 1-3 lighter weeks at 60-70% of normal loads every 6-12 weeks. Newer lifters can cut one assistance exercise per day."]
PH = "PHAT (Power Hypertrophy Adaptive Training)"
add("x-gym-phat-upper-power", "PHAT – Upper Body Power", "gym", "advanced", "bodybuilding", ["strength", "muscle"], 75, 5,
    ["barbell", "dumbbells", "pull-up bar", "dip bars", "bench", "squat rack"],
    "Heavy rows and dumbbell presses for 3-5 reps, then weighted pull-ups, dips, presses and arms for 6-10.",
    who, ["full-gym"], how,
    [E("Bent-over or Pendlay Row", 3, "3-5"), E("Weighted Pull-up", 2, "6-10"), E("Rack Chin", 2, "6-10"), E("Flat Dumbbell Press", 3, "3-5"),
     E("Weighted Dip", 2, "6-10"), E("Seated Dumbbell Shoulder Press", 3, "6-10"), E("Cambered Bar Curl", 3, "6-10"), E("Skull Crusher", 3, "6-10")],
    C, U, N, PH, 1, 5)
add("x-gym-phat-lower-power", "PHAT – Lower Body Power", "gym", "advanced", "bodybuilding", ["strength", "muscle"], 70, 5,
    ["barbell", "squat rack", "machines"],
    "Heavy squats for 3-5, then hack squats, leg extensions, stiff-legged deadlifts, leg curls and calves.",
    who, ["full-gym"], how,
    [E("Back Squat", 3, "3-5"), E("Hack Squat", 2, "6-10"), E("Leg Extension", 2, "6-10"), E("Stiff-legged Deadlift", 3, "5-8"),
     E("Glute-ham Raise or Lying Leg Curl", 2, "6-10"), E("Standing Calf Raise", 3, "6-10"), E("Seated Calf Raise", 2, "6-10")],
    C, U, N, PH, 2, 5)
add("x-gym-phat-back-shoulders-hypertrophy", "PHAT – Back & Shoulders Hypertrophy", "gym", "advanced", "bodybuilding", ["muscle"], 70, 5,
    ["barbell", "cables", "dumbbells", "bench", "pull-up bar"],
    "Fast speed rows, then high-volume back and shoulder work for 8-20 reps.",
    who, ["full-gym"], how,
    [E("Barbell Row – speed work", 6, "3", "65-70% of 3-5RM"), E("Rack Chin", 3, "8-12"), E("Seated Cable Row", 3, "8-12"),
     E("Incline-braced Dumbbell Row or Shrug", 2, "12-15"), E("Close-grip Pulldown", 2, "15-20"), E("Seated Dumbbell Press", 3, "8-12"),
     E("Upright Row", 2, "12-15"), E("Side Lateral Raise (dumbbell or cable)", 3, "12-20")],
    C, U, N, PH, 3, 5)
add("x-gym-phat-lower-hypertrophy", "PHAT – Lower Body Hypertrophy", "gym", "advanced", "bodybuilding", ["muscle"], 75, 5,
    ["barbell", "squat rack", "machines"],
    "Speed squats, then hack squats, leg press, extensions, RDLs, two kinds of leg curl and two calf raises.",
    who, ["full-gym"], how,
    [E("Back Squat – speed work", 6, "3", "65-70% of 3-5RM"), E("Hack Squat", 3, "8-12"), E("Leg Press", 2, "12-15"), E("Leg Extension", 3, "15-20"),
     E("Romanian Deadlift", 3, "8-12"), E("Lying Leg Curl", 2, "12-15"), E("Seated Leg Curl", 2, "15-20"), E("Donkey Calf Raise", 4, "10-15"),
     E("Seated Calf Raise", 3, "15-20")],
    C, U, N, PH, 4, 5)
add("x-gym-phat-chest-arms-hypertrophy", "PHAT – Chest & Arms Hypertrophy", "gym", "advanced", "bodybuilding", ["muscle"], 75, 5,
    ["dumbbells", "bench", "machines", "cables", "barbell"],
    "Speed dumbbell presses, then chest, biceps and triceps volume for 8-20 reps.",
    who, ["full-gym"], how,
    [E("Flat Dumbbell Press – speed work", 6, "3", "65-70% of 3-5RM"), E("Incline Dumbbell Press", 3, "8-12"), E("Machine Chest Press", 3, "12-15"),
     E("Incline Cable Fly", 2, "15-20"), E("Cambered Bar Preacher Curl", 3, "8-12"), E("Dumbbell Concentration Curl", 2, "12-15"),
     E("Incline Spider Curl", 2, "15-20"), E("Seated Cambered Bar Triceps Extension", 3, "8-12"), E("Rope Pressdown", 2, "12-15"),
     E("Cable Kickback", 2, "15-20")],
    C, U, N, PH, 5, 5)

# =========================================================== Growing Stronger (Tufts / CDC)
U = "https://stacks.cdc.gov/view/cdc/11447"
C = "Tufts University & CDC (Seguin, Epping, Buchner, Bloch, Nelson) – Growing Stronger"
N = "Growing Stronger: Strength Training for Older Adults (© 2002 Tufts University; CDC Stacks lists it as public domain). The book says it may be freely distributed without permission provided the authors and Tufts are credited and the content isn't changed. We record the exercise list, sets and reps only and point to the original for the instructions."
who = "Older adults, including people with arthritis or low bone density, starting strength training at home. Needs a sturdy chair, and from Part II light dumbbells, ankle weights and a step."
how = ["Two or three sessions a week on non-consecutive days. Start every session with a 5-minute walk and finish with the stretches.",
       "Lift to a count of 2-4 and lower to a count of 4, breathing throughout. Do 2 sets of 10 with 1-2 minutes' rest.",
       "Part I for 2 weeks, then Part II for 4 weeks, then Part III from week 7. When you can do more than 10 good reps, go up to the next weight.",
       "Check with your doctor before starting if you have a health condition, and see the book for how to do each exercise."]
GS = "Growing Stronger (Tufts/CDC)"
STR = E("Cool-down stretches: chest & arms, hamstrings, quadriceps, neck & back", 1, "hold each 20-30s")
WALK = E("Warm-up walk", 1, "5 min")
P1 = [E("Chair Squat", 2, "10"), E("Wall Push-up", 2, "10"), E("Toe Stand", 2, "10"), E("Finger Marching", 1, "3 each movement")]
P2 = [E("Dumbbell Biceps Curl", 2, "10", "start ~1-2.5kg"), E("Step-up", 2, "10/leg"), E("Dumbbell Overhead Press", 2, "10", "start ~1-2.5kg"),
      E("Side Hip Raise", 2, "10/leg", "ankle weights optional, 0.5-1.5kg")]
P3 = [E("Knee Extension (seated)", 2, "10/leg", "ankle weights 0.5-1.5kg to start"), E("Knee Curl (standing)", 2, "10/leg", "ankle weights"),
      E("Pelvic Tilt", 2, "10"), E("Floor Back Extension", 2, "10/side")]
add("x-gym-growing-stronger-part-1", "Growing Stronger – Part I: Getting Started", "fitness", "beginner", "strength-training",
    ["strength", "general-fitness", "mobility"], 25, 3, ["bodyweight", "chair"],
    "Weeks 1-2: four gentle bodyweight exercises (chair squats, wall push-ups, toe stands, finger marching) to build a base.",
    who, ["older-adults", "home", "minimal-equipment"], how, [WALK] + P1 + [STR], C, U, N, GS, 1, 3)
add("x-gym-growing-stronger-part-2", "Growing Stronger – Part II: Stepping Up", "fitness", "beginner", "strength-training",
    ["strength", "general-fitness"], 35, 3, ["chair", "dumbbells", "ankle weights", "step"],
    "Weeks 3-6: adds dumbbell curls and presses, step-ups and side hip raises to the Part I moves.",
    who, ["older-adults", "home", "minimal-equipment"], how, [WALK] + P1 + P2 + [STR], C, U, N, GS, 2, 3)
add("x-gym-growing-stronger-part-3", "Growing Stronger – Part III: Full Program", "fitness", "beginner", "strength-training",
    ["strength", "general-fitness", "mobility"], 45, 3, ["chair", "dumbbells", "ankle weights", "step"],
    "Week 7 onwards: the full 12-exercise routine, adding knee extensions, knee curls, pelvic tilts and back extensions.",
    who, ["older-adults", "home", "minimal-equipment"], how, [WALK] + P1 + P2 + P3 + [STR], C, U, N, GS, 3, 3)

# =========================================================== US Army FM 7-22 (public domain)
U = "https://armyrotc.siu.edu/_common/documents/fm-7-22.pdf"
C = "U.S. Army – FM 7-22 Army Physical Readiness Training (2012)"
N = "US Government field manual: 'Approved for public release; distribution is unlimited.' Read from a university ROTC copy of FM 7-22 (Oct 2012). Chapters 1-6 were superseded by FM 7-22 Holistic Health & Fitness (2020); the drills themselves continue in ATP 7-22.02. No endorsement by the U.S. Army is implied."
add("x-gym-army-prt-strength-mobility", "Army PRT – Strength & Mobility Session", "fitness", "intermediate", "calisthenics",
    ["strength", "endurance", "mobility", "general-fitness"], 55, 3, ["bodyweight", "pull-up bar"],
    "A full US Army PRT strength session (schedule session 6-2): preparation drill, Four for the Core, Conditioning Drills 1 and 2, Climbing Drill 1, push-up/sit-up drill and the recovery drill.",
    "People who like structured, military-style bodyweight training outdoors, and anyone preparing for a defence or emergency-services fitness test. Needs a pull-up bar.",
    ["outdoor", "minimal-equipment"],
    ["Run it two or three times a week, alternating with running days. Do every drill in the order listed.",
     "Move at a controlled, moderate cadence. Precision beats speed: stop a set rather than lose form.",
     "Start at 5 reps per exercise. Build towards 10, but never go past 10; for more work, repeat the whole drill.",
     "If you can't do the pull-ups yet, use a spotter or band and work towards 5 clean reps of each Climbing Drill exercise."],
    [E("Preparation Drill: bend and reach, rear lunge, high jumper, rower, squat bender, windmill, forward lunge, prone row, bent-leg body twist, push-up", 1, "5 each"),
     E("Four for the Core: Bent-leg Raise", 1, "60s", group="4C"), E("Four for the Core: Side Bridge", 1, "60s", group="4C"),
     E("Four for the Core: Back Bridge", 1, "60s", group="4C"), E("Four for the Core: Quadraplex", 1, "60s", group="4C"),
     E("CD1: Power Jump", 1, "5", group="CD1"), E("CD1: V-up", 1, "5", group="CD1"), E("CD1: Mountain Climber", 1, "5", group="CD1"),
     E("CD1: Leg Tuck and Twist", 1, "5", group="CD1"), E("CD1: Single-leg Push-up", 1, "5", group="CD1"),
     E("CD2: Turn and Lunge", 1, "5", group="CD2"), E("CD2: Supine Bicycle", 1, "5", group="CD2"), E("CD2: Half Jacks", 1, "5", group="CD2"),
     E("CD2: Swimmer", 1, "5", group="CD2"), E("CD2: 8-count Push-up", 1, "5", group="CD2"),
     E("CL1: Straight-arm Pull", 1, "5", group="CL1"), E("CL1: Heel Hook", 1, "5", group="CL1"), E("CL1: Pull-up", 1, "5", group="CL1"),
     E("CL1: Leg Tuck", 1, "5", group="CL1"), E("CL1: Alternating-grip Pull-up", 1, "5", group="CL1"),
     E("Push-up / Sit-up Drill: Push-up", 2, "60s", group="PSD"), E("Push-up / Sit-up Drill: Sit-up", 2, "60s", group="PSD"),
     E("Recovery Drill: overhead arm pull, rear lunge, extend and flex, thigh stretch, single-leg over", 1, "20s each")],
    C, U, N)
add("x-gym-army-strength-training-circuit", "Army PRT – Strength Training Circuit", "fitness", "intermediate", "strength-training",
    ["strength", "endurance", "general-fitness"], 45, 2, ["kettlebell", "pull-up bar"],
    "The US Army's 10-station kettlebell and climbing-bar circuit: 60 seconds per station for 2-3 rounds, moving between stations as active recovery.",
    "Intermediate exercisers with a kettlebell or two and a bar to hang from, who want a full-body strength and work-capacity circuit outdoors.",
    ["outdoor", "minimal-equipment", "time-efficient"],
    ["Start with the Army preparation drill (or your own 10-minute dynamic warm-up) and finish with a few minutes of stretching.",
     "Work 60 seconds at each station in order, then jog or do a movement drill (side shuffles, high knees) on the way to the next station.",
     "Do 2 rounds to begin with and build to 3. Pick a kettlebell you can move with good form for the whole 60 seconds.",
     "The manual gives a heavier and a lighter kettlebell for each station (shown in kg below). Move up when the lighter one stays smooth for the full 60 seconds."],
    [E("Station 1: Sumo Squat", 3, "60s", "~22kg or ~11kg"), E("Station 2: Straight-leg Deadlift", 3, "60s", "~18kg or ~11kg"),
     E("Station 3: Forward Lunge", 3, "60s", "~9kg or ~4.5kg"), E("Station 4: 8-count Step-up", 3, "60s", "~13.5kg or ~7kg"),
     E("Station 5: Pull-up or Straight-arm Pull", 3, "60s"), E("Station 6: Supine Chest Press", 3, "60s", "~18kg or ~7kg"),
     E("Station 7: Bent-over Row", 3, "60s", "~9kg or ~4.5kg"), E("Station 8: Overhead Push Press", 3, "60s", "~13.5kg or ~7kg"),
     E("Station 9: Supine Body Twist", 3, "60s", "~11kg or ~4.5kg"), E("Station 10: Leg Tuck", 3, "60s")],
    C, U, N + " Kettlebell weights converted from the manual's pounds (e.g. 50/25 lb).")

json.dump(P, open(OUT, "w"), indent=1, ensure_ascii=False)
print(len(P), "sourced programs ->", OUT)
