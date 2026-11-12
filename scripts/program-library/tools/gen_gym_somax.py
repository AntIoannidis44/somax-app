"""Somax ORIGINAL gym programs for the expansion pass (strength-training, bodybuilding, powerlifting,
calisthenics). Built to fill gaps left by the credited set, following playbooks/strength.json:
- weekly sets per muscle: beginner 8-12, intermediate 12-20, advanced 15-25; <= ~11 fractional sets/muscle/session
- compounds 4-12 reps @ 1-3 RIR, isolation 10-20 @ 0-2 RIR; beginners biased to more reserve, no 1RM tests
- beginner linear / double progression, intermediate weekly-monthly, advanced RPE top set + back-offs
- deload: ~half the sets, -10% load, 3+ RIR, every 4-6 weeks (3:1 default)
Usage: python3 gen_gym_somax.py <out.json>
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


def add(id, name, category, level, sport, goals, minutes, dpw, equipment, description, who, lifestyle, how, exercises,
        basedOn, series=None, day=None, n=None):
    d = dict(id=id, name=name)
    if series:
        d.update(series=series, day=day, daysInSeries=n)
    d.update(category=category, level=level, sport=sport, goals=goals, duration=f"{minutes} min", daysPerWeek=dpw,
             sessionMinutes=minutes, equipment=equipment, description=description, whoItsFor=who, lifestyle=lifestyle,
             howToRun=how, exercises=exercises, credit="Somax", sourceUrl="", sourceNote="Original Somax program.",
             basedOn=basedOn, verified=False)
    P.append(d)


GYM_WU = [E("Warm-up: easy bike, rower or incline walk", 1, "5 min"), E("Warm-up: ramp-up sets of the first lift", 1, "3-4 sets, building up")]
SHORT_WU = [E("Warm-up: ramp-up sets of the first lift", 1, "2-3 sets, building up")]
HOME_WU = [E("Warm-up: march or skip on the spot", 1, "2 min"), E("Warm-up: world's greatest stretch", 1, "5/side"),
           E("Warm-up: arm circles + wall slides", 1, "10 each")]
CAL_WU = [E("Warm-up: wrist circles + scapular shrugs on the bar", 1, "10 each"), E("Warm-up: cat-cow + deep squat hold", 1, "10 + 30s"),
          E("Warm-up: easy push-ups and inverted rows", 1, "5 each")]
STRETCH = E("Cool-down stretch (hips, hamstrings, chest, upper back)", 1, "5 min")

R2 = "2 reps in reserve"
R1 = "1-2 reps in reserve"
R3 = "3 reps in reserve"

# ######################################################################## STRENGTH-TRAINING

# --- 20-minute gym express (beginner, busy)
add("x-gym-somax-20-minute-gym-express", "Somax 20-Minute Gym Express", "gym", "beginner", "strength-training",
    ["strength", "general-fitness", "muscle"], 20, 3, ["dumbbells", "machines", "cables"],
    "Three supersets that hit legs, push, pull and core in 20 minutes flat. Short rests, no barbell set-up, nothing complicated.",
    "Beginners with only a lunch break or a gap before school pick-up, who'd rather do something short three times a week than nothing at all.",
    ["full-gym", "busy", "time-efficient"],
    ["Three days a week, any days. Move straight between the paired exercises and rest 60 seconds after each pair.",
     "Choose weights that leave 2-3 reps in the tank. When every set hits 12, go up one step next time.",
     "Keep the gear close together (dumbbells and one cable station) so you're not wandering the gym.",
     "After 8-12 weeks, or once you can give it 45 minutes, move to Somax First Steps Full Body or StrengthLog Beginner Strength."],
    [E("Warm-up: goblet squat + band or cable pull-apart", 1, "2 rounds of 8"),
     E("Goblet Squat", 3, "8-12", R2, group="A"), E("Lat Pulldown", 3, "8-12", R2, group="A"),
     E("Dumbbell Romanian Deadlift", 3, "8-12", R2, group="B"), E("Machine Chest Press", 3, "8-12", R2, group="B"),
     E("Cable Pallof Press", 2, "10/side", group="C"), E("Dumbbell Farmer Carry", 2, "30m", group="C")],
    ["x-gym-strengthlog-beginner-strength-a", "x-gym-strengthlog-beginner-machine-a", "rfitness-basic-beginner-a"])

# --- Busy 3x30 barbell (intermediate)
S = "Somax 30-Minute Barbell Strength"
who = "Intermediate lifters who are past beginner gains but now have only 30 minutes, three times a week. Needs a rack, bar and bench."
how = ["Run A, B and C across the week (e.g. Mon/Wed/Fri). Each day has one heavy lift, one second lift, and a superset finisher.",
       "Heavy lift: work up to a top set of 3-5 at about RPE 8 (two reps left), then do 2 back-off sets at 90% of that weight.",
       "Each week, try to beat last week's top set by a rep or by 2.5kg. If you can't for 3 weeks, take a lighter week, then restart 5% lower.",
       "Superset rests are 60-90 seconds. Every 4th week, cut all sets in half and lift about 10% lighter."]
add("x-gym-somax-30-minute-barbell-a", "Somax 30-Minute Barbell – A (Squat)", "gym", "intermediate", "strength-training",
    ["strength", "muscle"], 30, 3, ["barbell", "squat rack", "bench", "dumbbells"],
    "Heavy squats, a bench press, then a rows-and-core superset. Done in 30 minutes.",
    who, ["full-gym", "busy", "time-efficient"], how,
    SHORT_WU + [E("Back Squat – top set", 1, "3-5", "RPE 8"), E("Back Squat – back-off", 2, "5", "90% of top set"),
                E("Bench Press", 3, "6-8", R2), E("Chest-supported Dumbbell Row", 2, "10-12", R1, group="A"),
                E("Dead Bug", 2, "8/side", group="A")],
    ["wendler-531-beginners-day-1", "x-gym-strengthlog-full-body-2x-a", "gzclp-day-1"], S, 1, 3)
add("x-gym-somax-30-minute-barbell-b", "Somax 30-Minute Barbell – B (Press)", "gym", "intermediate", "strength-training",
    ["strength", "muscle"], 30, 3, ["barbell", "squat rack", "pull-up bar", "dumbbells"],
    "Heavy overhead press, Romanian deadlifts, then chin-ups paired with split squats.",
    who, ["full-gym", "busy", "time-efficient"], how,
    SHORT_WU + [E("Overhead Press – top set", 1, "3-5", "RPE 8"), E("Overhead Press – back-off", 2, "5", "90% of top set"),
                E("Romanian Deadlift", 3, "6-8", R2), E("Chin-up (assisted if needed)", 2, "5-8", R1, group="A"),
                E("Dumbbell Split Squat", 2, "8/leg", R2, group="A")],
    ["wendler-531-beginners-day-2", "x-gym-strengthlog-full-body-2x-b", "gzclp-day-2"], S, 2, 3)
add("x-gym-somax-30-minute-barbell-c", "Somax 30-Minute Barbell – C (Deadlift + Bench)", "gym", "intermediate", "strength-training",
    ["strength", "muscle"], 30, 3, ["barbell", "bench", "dumbbells", "cables"],
    "Heavy deadlifts, heavy bench, then a shoulders-and-hamstrings superset.",
    who, ["full-gym", "busy", "time-efficient"], how,
    SHORT_WU + [E("Deadlift – top set", 1, "3-5", "RPE 8"), E("Deadlift – back-off", 1, "5", "90% of top set"),
                E("Bench Press – top set", 1, "3-5", "RPE 8"), E("Bench Press – back-off", 2, "6", "90% of top set"),
                E("Dumbbell Lateral Raise", 2, "12-15", R1, group="A"), E("Cable or Swiss-ball Leg Curl", 2, "10-12", R1, group="A")],
    ["wendler-531-beginners-day-3", "x-gym-strengthlog-full-body-2x-a", "gzclp-day-4"], S, 3, 3)

# --- Upper/Lower strength 4-day (intermediate)
S = "Somax Upper/Lower Strength"
who = "Intermediate lifters (roughly 6-24 months of steady training) who want a stronger squat, bench, deadlift and press on four days a week."
how = ["Mon Upper Heavy, Tue Lower Heavy, Thu Upper Volume, Fri Lower Volume (or any 4 days with no more than 2 in a row).",
       "Heavy days: a top set at RPE 8, then back-offs. Volume days: fixed sets at RPE 7. Add 2.5kg (upper) or 5kg (lower) to the main lifts when every set looks crisp.",
       "Rest 3-4 minutes on main lifts and 90 seconds on accessories.",
       "Weeks 1-3 load, week 4 deload (half the sets, 10% lighter). If a lift stalls for 3-4 weeks despite sleeping and eating well, add a set; if you're beat up, take weight off."]
add("x-gym-somax-upper-lower-strength-upper-heavy", "Somax Upper/Lower Strength – Upper Heavy", "gym", "intermediate", "strength-training",
    ["strength", "muscle"], 60, 4, ["barbell", "bench", "squat rack", "pull-up bar", "dumbbells", "cables"],
    "Heavy bench press and weighted chin-ups, then a press and back and arm accessories.",
    who, ["full-gym"], how,
    GYM_WU + [E("Bench Press – top set", 1, "3-5", "RPE 8"), E("Bench Press – back-off", 3, "5", "88-90% of top set"),
              E("Weighted Chin-up or Lat Pulldown", 4, "4-6", R2), E("Seated Dumbbell Overhead Press", 3, "6-8", R2),
              E("Chest-supported Row", 3, "8-10", R1), E("Face Pull", 2, "15", R1, group="A"), E("EZ-bar Curl", 2, "10-12", R1, group="A")],
    ["wendler-bbb-day-3", "x-gym-strengthlog-full-body-3x-1", "x-gym-phat-upper-power"], S, 1, 4)
add("x-gym-somax-upper-lower-strength-lower-heavy", "Somax Upper/Lower Strength – Lower Heavy", "gym", "intermediate", "strength-training",
    ["strength", "muscle"], 60, 4, ["barbell", "squat rack", "machines"],
    "Heavy squats, a moderate deadlift, then single-leg and hamstring work.",
    who, ["full-gym"], how,
    GYM_WU + [E("Back Squat – top set", 1, "3-5", "RPE 8"), E("Back Squat – back-off", 3, "5", "88-90% of top set"),
              E("Deadlift", 2, "4", "about 80% of your best 4-rep set"), E("Walking Lunge", 3, "8/leg", R2),
              E("Lying Leg Curl", 3, "8-10", R1), E("Hanging Knee Raise", 3, "10-15")],
    ["wendler-bbb-day-4", "x-gym-phat-lower-power", "gzclp-day-1"], S, 2, 4)
add("x-gym-somax-upper-lower-strength-upper-volume", "Somax Upper/Lower Strength – Upper Volume", "gym", "intermediate", "strength-training",
    ["strength", "muscle"], 60, 4, ["barbell", "squat rack", "bench", "dumbbells", "cables"],
    "Overhead press as the main lift, close-grip bench, rows and pump work in moderate reps.",
    who, ["full-gym"], how,
    GYM_WU + [E("Overhead Press", 4, "5", "RPE 7"), E("Close-grip Bench Press", 3, "8", R2), E("Barbell or Pendlay Row", 4, "6-8", R2),
              E("Incline Dumbbell Press", 2, "10-12", R1), E("Single-arm Cable Row", 2, "10-12/arm", R1),
              E("Triceps Rope Pushdown", 2, "12-15", R1, group="A"), E("Dumbbell Lateral Raise", 2, "15", R1, group="A")],
    ["wendler-bbb-day-1", "x-gym-strengthlog-full-body-3x-2"], S, 3, 4)
add("x-gym-somax-upper-lower-strength-lower-volume", "Somax Upper/Lower Strength – Lower Volume", "gym", "intermediate", "strength-training",
    ["strength", "muscle"], 60, 4, ["barbell", "squat rack", "machines", "bench"],
    "Deadlifts as the main lift, front or paused squats, and glute and calf work.",
    who, ["full-gym"], how,
    GYM_WU + [E("Deadlift", 4, "4", "RPE 7"), E("Front Squat or Paused Back Squat", 3, "6", R2), E("Barbell Hip Thrust", 3, "8-10", R1),
              E("Leg Press", 2, "12", R1), E("Standing Calf Raise", 3, "10-15", R1), E("Side Plank", 2, "30s/side")],
    ["wendler-bbb-day-2", "x-gym-phat-lower-hypertrophy"], S, 4, 4)

# --- Returning from a break (2-day re-entry)
S = "Somax Back-to-Training Restart"
who = "Anyone who used to train and has had a month or more off (injury, travel, new baby, busy patch). Gets you back without the brutal soreness."
how = ["Three sessions a week for 3-4 weeks, alternating A and B, before going back to your normal plan.",
       "Week 1: start at about 85% of your old working weights if you've been off for over a month (90% for 2-4 weeks off). Stop every set with 3 reps in reserve.",
       "Add weight each session as long as it feels easy and you're not sore for days. Most strength comes back within a few weeks.",
       "Tendons lag behind muscles, so don't rush back to heavy singles. If something aches, keep that lift easy until it settles."]
add("x-gym-somax-restart-a", "Somax Back-to-Training Restart – A", "gym", "beginner", "strength-training",
    ["strength", "general-fitness", "muscle"], 45, 3, ["barbell", "squat rack", "bench", "dumbbells", "cables"],
    "Squats, bench and rows at easy effort, plus a little arm and core work to get the feel back.",
    who, ["full-gym"], how,
    GYM_WU + [E("Back Squat (or Goblet Squat)", 3, "6-8", R3), E("Bench Press (or Dumbbell Press)", 3, "6-8", R3),
              E("Seated Cable Row", 3, "8-10", R3), E("Dumbbell Step-up", 2, "8/leg", R3), E("Plank", 2, "30s"), STRETCH],
    ["x-gym-strengthlog-full-body-2x-a", "rfitness-basic-beginner-a", "stronglifts-5x5-workout-a"], S, 1, 2)
add("x-gym-somax-restart-b", "Somax Back-to-Training Restart – B", "gym", "beginner", "strength-training",
    ["strength", "general-fitness", "muscle"], 45, 3, ["barbell", "dumbbells", "cables", "machines"],
    "Deadlifts from blocks or a trap bar, overhead press, pulldowns and lunges, all well short of failure.",
    who, ["full-gym"], how,
    GYM_WU + [E("Trap-bar or Block Deadlift", 3, "5", R3), E("Dumbbell Overhead Press", 3, "8", R3), E("Lat Pulldown", 3, "8-10", R3),
              E("Reverse Lunge", 2, "8/leg", R3), E("Back Extension", 2, "10-12"), STRETCH],
    ["x-gym-strengthlog-full-body-2x-b", "rfitness-basic-beginner-b", "stronglifts-5x5-workout-b"], S, 2, 2)

# --- Deload week (strength)
add("x-gym-somax-strength-deload-week", "Somax Strength Deload Session", "gym", "intermediate", "strength-training",
    ["strength", "general-fitness"], 40, 3, ["barbell", "squat rack", "bench", "dumbbells", "cables"],
    "A lighter week template for barbell plans: the same big lifts at about 10% less weight and half the sets, plus easy accessory work and mobility.",
    "Intermediate and advanced lifters at the end of a 3-5 week training block, or anyone feeling run down, achy or stuck.",
    ["full-gym", "time-efficient"],
    ["Use it for one week every 4-6 weeks, in place of your normal sessions (repeat it 2-3 times that week).",
     "Swap in your own main lifts if your plan uses different ones. Keep the reps, use about 90% of the weight and do half the sets.",
     "Every set should feel easy, with 3 or more reps left. No AMRAPs, no testing.",
     "Use the spare time to sleep, walk and stretch. Next week, go back to your plan where you left off."],
    GYM_WU + [E("Back Squat", 2, "5", "about 90% of last week's working weight"), E("Bench Press", 2, "5", "about 90% of last week's"),
              E("Deadlift or Romanian Deadlift", 1, "5", "about 90% of last week's"), E("Chin-up or Lat Pulldown", 2, "6-8", R3),
              E("Band Pull-apart", 2, "15"), E("Hip flexor + thoracic mobility", 1, "5 min")],
    ["wendler-531-beginners-day-1", "wendler-bbb-day-1", "gzclp-day-1"])

# --- Bands-only
add("x-gym-somax-band-strength-starter", "Somax Resistance Band Starter", "fitness", "beginner", "strength-training",
    ["strength", "general-fitness", "mobility"], 30, 3, ["bands"],
    "A whole-body strength session with just a set of loop or tube bands. Squats, rows, presses and hinges, plus shoulder health work.",
    "Beginners at home or travelling with only a few bands in a bag, and anyone wanting low-impact strength work that's easy on the joints.",
    ["home", "travel", "minimal-equipment", "time-efficient"],
    ["Three times a week on non-consecutive days. Anchor the band in a closed door (hinge side) or under your feet.",
     "Pick a band that makes the last 2-3 reps of each set hard. Slow the lowering to 3 seconds.",
     "When 15 reps get easy, step further from the anchor, double the band, or move to a heavier one.",
     "Rest 45-60 seconds between sets. Check bands for nicks before use."],
    HOME_WU + [E("Band Squat (standing on band)", 3, "12-15", R2), E("Band Bent-over Row", 3, "12-15", R2),
               E("Band Chest Press (door anchor)", 3, "12-15", R2), E("Band Romanian Deadlift", 3, "12-15", R2),
               E("Band Overhead Press", 2, "10-12", R2), E("Band Pull-apart", 2, "15", group="A"), E("Band Pallof Press", 2, "10/side", group="A"), STRETCH],
    ["nhs-home-strength-exercises", "x-gym-strengthlog-beginner-dumbbell-a", "x-gym-strengthlog-seniors-home"])
add("x-gym-somax-band-strength-intermediate", "Somax Resistance Band Strength Circuit", "fitness", "intermediate", "strength-training",
    ["strength", "muscle", "endurance"], 35, 3, ["bands", "bodyweight"],
    "A harder band-and-bodyweight session using single-leg work, paused reps and supersets to make light resistance count.",
    "People with some training experience who are travelling or stuck at home with bands and want a real workout, not just a stretch.",
    ["home", "travel", "minimal-equipment"],
    ["Two to four times a week. Do the paired moves back to back and rest 60 seconds after each pair.",
     "Take every set within 1-2 reps of failure. Bands get harder at the end of the move, so pause for a second there.",
     "Progress by using a heavier band, adding a 3-second lowering, or adding 2-3 reps per set each week.",
     "Pair it with Somax Hotel Room Full Body on alternate days for a full travel week."],
    HOME_WU + [E("Band Bulgarian Split Squat", 3, "10-12/leg", R1, group="A"), E("Band Single-arm Row (1s pause)", 3, "12/arm", R1, group="A"),
               E("Push-up with Band Across Back", 3, "8-15", R1, group="B"), E("Band Good Morning", 3, "15", R1, group="B"),
               E("Band Lateral Walk", 2, "15 steps/side", group="C"), E("Band Face Pull", 2, "15", group="C"),
               E("Band Biceps Curl", 2, "15", R1, group="D"), E("Band Overhead Triceps Extension", 2, "15", R1, group="D"), STRETCH],
    ["x-gym-strengthlog-calisthenics-beginner-1", "nhs-home-strength-exercises", "x-gym-dumbbell-stopgap-ppl-push"])

# --- Kettlebell strength A/B
S = "Somax Kettlebell Strength"
who = "Intermediate exercisers with one or two kettlebells at home or in the park who want strength, not just sweat. Know a basic swing already."
how = ["Alternate A and B 2-4 times a week. Rest 60-90 seconds between sets; the paired moves can be supersetted.",
       "Men often use 16-24kg, women 8-16kg. Use a lighter bell for presses than for swings and squats.",
       "Double progression: build to the top of the rep range on every set, then move to the next bell (or add a set).",
       "Learn the swing and get-up from a coach or Simple & Sinister before going heavy. Stop if your lower back takes over."]
add("x-gym-somax-kettlebell-strength-a", "Somax Kettlebell Strength – A", "fitness", "intermediate", "strength-training",
    ["strength", "muscle", "general-fitness"], 40, 3, ["kettlebell"],
    "Goblet squats, single-arm presses and rows, then heavy swings and loaded carries.",
    who, ["home", "outdoor", "minimal-equipment"], how,
    HOME_WU + [E("Kettlebell Goblet Squat", 4, "6-10", R2), E("Single-arm Kettlebell Press", 3, "5-8/arm", R2, group="A"),
               E("Kettlebell Gorilla Row", 3, "8-10/arm", R2, group="A"), E("Two-hand Kettlebell Swing", 5, "10"),
               E("Suitcase Carry", 3, "30m/side")],
    ["strongfirst-simple-and-sinister", "x-gym-army-strength-training-circuit"], S, 1, 2)
add("x-gym-somax-kettlebell-strength-b", "Somax Kettlebell Strength – B", "fitness", "intermediate", "strength-training",
    ["strength", "muscle", "general-fitness"], 40, 3, ["kettlebell"],
    "Single-leg deadlifts, front-rack reverse lunges, floor presses and Turkish get-ups.",
    who, ["home", "outdoor", "minimal-equipment"], how,
    HOME_WU + [E("Single-leg Kettlebell Deadlift", 3, "8/leg", R2), E("Front-rack Reverse Lunge", 3, "6-8/leg", R2, group="A"),
               E("Kettlebell Floor Press", 3, "8-10/arm", R2, group="A"), E("Turkish Get-up", 3, "1/side, slow"),
               E("Kettlebell Halo", 2, "5 each way")],
    ["strongfirst-simple-and-sinister", "x-gym-army-strength-training-circuit"], S, 2, 2)

# --- Fat-loss strength
add("x-gym-somax-fat-loss-strength-circuit-beginner", "Somax Fat-Loss Strength Circuit", "gym", "beginner", "strength-training",
    ["fat-loss", "strength", "general-fitness"], 40, 3, ["machines", "dumbbells", "cables"],
    "A machine-and-dumbbell circuit that keeps your heart rate up while you lift. Strength training keeps muscle while you're eating less.",
    "Beginners whose main goal is losing body fat and who want a gym session that feels like a workout but stays safe and simple.",
    ["full-gym", "time-efficient"],
    ["Three times a week, plus daily walking. Do the circuit's 6 moves back to back, rest 90 seconds, repeat 3 times.",
     "Use weights that are hard by rep 12 but leave 2 reps in reserve. Effort over speed: control every rep.",
     "Each week, add a rep per move or one more round (up to 4).",
     "Fat loss comes mostly from food. Lift to keep your muscle, walk to burn more, and eat enough protein."],
    [E("Warm-up: rower or bike", 1, "5 min"), E("Leg Press", 3, "12", R2, group="A"), E("Lat Pulldown", 3, "12", R2, group="A"),
     E("Dumbbell Walking Lunge", 3, "10/leg", R2, group="A"), E("Machine Chest Press", 3, "12", R2, group="A"),
     E("Cable Romanian Deadlift", 3, "12", R2, group="A"), E("Farmer Carry", 3, "30m", group="A"),
     E("Finisher: bike or rower intervals", 1, "6 x 20s hard / 40s easy"), STRETCH],
    ["x-gym-strengthlog-beginner-machine-a", "seven-minute-workout", "x-gym-strengthlog-beginner-strength-a"])
add("x-gym-somax-fat-loss-barbell-complex", "Somax Barbell Complex & Supersets", "gym", "intermediate", "strength-training",
    ["fat-loss", "strength", "endurance"], 45, 3, ["barbell", "squat rack", "dumbbells", "pull-up bar"],
    "One heavy lift to keep strength, then supersets and a barbell complex to burn energy. Built to hold muscle during a cut.",
    "Intermediate lifters in a fat-loss phase who don't want to lose the strength they've built.",
    ["full-gym", "time-efficient"],
    ["Three days a week. Keep the heavy lift heavy (same weight as before your diet if you can); trim volume elsewhere if recovery drops.",
     "Supersets: 60 seconds' rest after each pair. The complex: do all 5 moves without putting the bar down, rest 90s, repeat.",
     "Start the complex with an empty or light bar. Add 2.5-5kg when every round feels smooth.",
     "Pair with 2 extra walking or cycling days and a modest calorie deficit."],
    GYM_WU + [E("Back Squat or Deadlift (alternate sessions)", 3, "5", "RPE 8, hold your pre-diet weight"),
              E("Dumbbell Bench Press", 3, "8-10", R2, group="A"), E("Chin-up or Lat Pulldown", 3, "6-10", R2, group="A"),
              E("Dumbbell Reverse Lunge", 3, "10/leg", R2, group="B"), E("Push-up", 3, "max-2", group="B"),
              E("Barbell Complex: 6 deadlifts, 6 rows, 6 hang cleans, 6 front squats, 6 push presses", 4, "1 round", "empty bar to 40kg")],
    ["x-gym-strengthlog-full-body-2x-a", "seven-minute-workout", "x-gym-army-strength-training-circuit"])

# --- Desk-worker strength & mobility
add("x-gym-somax-desk-worker-strength-mobility", "Somax Desk-Worker Strength & Mobility", "fitness", "beginner", "strength-training",
    ["mobility", "strength", "general-fitness"], 25, 3, ["bands", "bodyweight"],
    "Strengthens the muscles long hours of sitting switch off (glutes, upper back, deep core) and loosens tight hips and chest.",
    "Office and remote workers with stiff backs, hips and necks who want 25 minutes of useful strength work at home.",
    ["home", "busy", "minimal-equipment", "time-efficient"],
    ["Three days a week. It also works as a warm-up before other training.",
     "Move slowly and own each position. Holds and reps should feel strong, not painful.",
     "When everything feels easy, use a stronger band or add 5 reps or 10 seconds to each move.",
     "Get up from the desk every 30-45 minutes as well. See a physio if you have back pain that spreads into your leg."],
    [E("90/90 Breathing", 1, "8 breaths"), E("Cat-Cow", 1, "10"), E("Half-kneeling Hip Flexor Stretch", 2, "30s/side"),
     E("Glute Bridge (2s squeeze)", 3, "12"), E("Band Pull-apart", 3, "15", group="A"), E("Bird Dog", 3, "8/side", group="A"),
     E("Band Face Pull or Wall Slide", 3, "12", group="B"), E("Side Plank", 2, "20-30s/side", group="B"),
     E("Bodyweight Squat to Box or Chair", 3, "12"), E("Thoracic Open Book", 1, "8/side"), E("Doorway Chest Stretch", 1, "30s")],
    ["nhs-home-strength-exercises", "nhs-flexibility-exercises", "x-gym-army-prt-strength-mobility"])

# --- Athletic strength & power A/B
S = "Somax Athletic Strength & Power"
who = "Intermediate lifters and weekend athletes (footy, netball, touch, basketball) who want to jump higher, sprint faster and be harder to knock over."
how = ["Two days a week alongside sport (3 in the off-season). Keep at least 48 hours between these and hard games.",
       "Do jumps and throws first while you're fresh: full rest (60-90s), every rep fast and crisp. Stop when speed drops.",
       "Strength lifts at RPE 7-8. Add 2.5-5kg when the top of the rep range moves fast.",
       "In-season, keep the jumps and the first strength lift and drop the rest."]
add("x-gym-somax-athletic-power-a", "Somax Athletic Strength & Power – A", "gym", "intermediate", "strength-training",
    ["sport-performance", "strength"], 55, 2, ["barbell", "trap bar", "box", "medicine ball", "dumbbells", "squat rack"],
    "Box jumps and med-ball throws, then trap-bar deadlifts, split squats and a push press.",
    who, ["full-gym"], how,
    GYM_WU + [E("Box Jump (step down)", 4, "3"), E("Medicine Ball Chest Pass to Wall", 3, "5"), E("Trap-bar Deadlift", 4, "4", "RPE 7-8"),
              E("Rear-foot-elevated Split Squat", 3, "6/leg", R2), E("Push Press", 3, "5", R2),
              E("Nordic Hamstring Curl (partner or anchor)", 3, "3-5"), E("Copenhagen Side Plank", 2, "15-20s/side")],
    ["x-gym-strengthlog-full-body-2x-b", "fifa-11-plus-warm-up", "x-gym-phat-lower-power"], S, 1, 2)
add("x-gym-somax-athletic-power-b", "Somax Athletic Strength & Power – B", "gym", "intermediate", "strength-training",
    ["sport-performance", "strength"], 55, 2, ["barbell", "bench", "squat rack", "pull-up bar", "medicine ball", "dumbbells", "cables"],
    "Broad jumps and rotational throws, then front squats, bench press, chin-ups and anti-rotation core.",
    who, ["full-gym"], how,
    GYM_WU + [E("Broad Jump (stick the landing)", 4, "3"), E("Rotational Med Ball Throw", 3, "5/side"), E("Front Squat", 4, "5", "RPE 7-8"),
              E("Bench Press", 3, "5", R2), E("Weighted or Bodyweight Chin-up", 3, "5-8", R2),
              E("Single-leg Romanian Deadlift", 3, "8/leg", R2), E("Cable Pallof Press", 2, "10/side")],
    ["x-gym-strengthlog-full-body-2x-a", "fifa-11-plus-warm-up", "x-gym-phat-upper-power"], S, 2, 2)

# --- Older adults: bone-strength (supervised HiRIT-style)
add("x-gym-somax-bone-strength-older-adults", "Somax Bone Strength (Heavy Lifting for 50+)", "gym", "intermediate", "strength-training",
    ["strength", "general-fitness"], 35, 2, ["barbell", "squat rack", "pull-up bar"],
    "A short, heavy twice-weekly session of deadlifts, squats and presses, plus a jump-and-land drill. Based on Australian research into heavy lifting for bone density in older women.",
    "Adults over about 50, including those with low bone density, who have learnt the lifts and have clearance from their doctor. Best done with a coach or exercise physiologist.",
    ["older-adults", "full-gym", "time-efficient"],
    ["Twice a week on non-consecutive days, about 30-40 minutes. Get medical clearance first, and ideally coaching, especially with osteoporosis.",
     "Weeks 1-2: bodyweight versions only (box squats, hip hinges with a dowel). Weeks 3-4: a broomstick or empty bar, focused on technique.",
     "From week 5, work up to 5 sets of 5 that feel hard (about 8/10 effort), adding 2.5kg to squats and deadlifts and 1-1.5kg to the press when every rep is clean.",
     "Landings start as gentle heel drops and build slowly. Stop any exercise that causes pain and get it checked."],
    [E("Warm-up: brisk walk + bodyweight squats and hip hinges", 1, "5 min"), E("Deadlift", 5, "5", "build to ~80-85% of your max over months"),
     E("Back Squat (or Box Squat)", 5, "5", "build to ~80-85% of your max"), E("Overhead Press", 5, "5", "build to ~80-85% of your max"),
     E("Jumping Chin-up with Flat-foot Landing (or heel drops)", 5, "5"), E("Balance: single-leg stand / tandem walk", 2, "30s each"),
     E("Cool-down walk and stretch", 1, "5 min")],
    ["x-gym-growing-stronger-part-3", "x-gym-strengthlog-seniors-gym", "stronglifts-5x5-workout-b"])

# --- Older adults gym machines + balance (beginner, 3x) - complements StrengthLog seniors
add("x-gym-somax-active-ageing-strength-balance", "Somax Active Ageing Strength & Balance", "gym", "beginner", "strength-training",
    ["strength", "mobility", "general-fitness"], 40, 2, ["machines", "dumbbells", "step", "chair"],
    "Machine strength work combined with balance and get-up-from-the-floor practice, so everyday life feels steadier.",
    "Older adults (about 65+), or anyone worried about falls, who want strength plus balance in one gym session.",
    ["older-adults", "full-gym"],
    ["Two or three times a week on non-consecutive days. Use the chair or rail for support whenever you need it.",
     "Strength moves: 2 sets of 10-12 with 2-3 reps in reserve. Add a little weight when 12 feels comfortable.",
     "Balance moves: progress from holding on to fingertip support to hands-free, then eyes moving or head turning.",
     "Stop and seek advice if you feel dizzy, chest pain or unusual breathlessness."],
    [E("Warm-up: bike or walk", 1, "5-8 min"), E("Sit-to-Stand from Chair", 2, "10"), E("Leg Press", 2, "10-12", R2),
     E("Seated Row Machine", 2, "10-12", R2), E("Chest Press Machine", 2, "10-12", R2), E("Step-up (low step, hold rail)", 2, "8/leg"),
     E("Standing Calf Raise (hold support)", 2, "12"), E("Tandem Stance", 2, "20-30s/side"), E("Single-leg Stand", 2, "15-30s/side"),
     E("Floor Get-up Practice (with chair)", 1, "3"), E("Farmer Carry (light dumbbells)", 2, "20m")],
    ["x-gym-strengthlog-seniors-gym", "x-gym-growing-stronger-part-2", "nhs-home-strength-exercises"])

# --- Home fat-loss strength circuit (beginner)
add("x-gym-somax-home-fat-loss-strength-circuit", "Somax Home Fat-Loss Strength Circuit", "fitness", "beginner", "strength-training",
    ["fat-loss", "strength", "general-fitness"], 30, 3, ["dumbbells", "bodyweight"],
    "A low-impact dumbbell and bodyweight circuit for the lounge room: strength moves back to back so you build muscle and burn energy without jumping.",
    "Beginners at home who want to lose body fat, with a pair of light-to-medium dumbbells and 30 minutes. No jumping, so it's neighbour- and knee-friendly.",
    ["home", "minimal-equipment", "time-efficient", "busy"],
    ["Three times a week on non-consecutive days, plus a daily walk if you can.",
     "Work 40 seconds, rest 20 seconds, moving through all 6 moves. Rest 90 seconds and repeat for 3 rounds (4 once it feels easy).",
     "Choose dumbbells you can control for the full 40 seconds with 2 reps left in the tank. Slow down rather than rush.",
     "Food drives fat loss. This keeps your muscle and fitness while you eat a little less."],
    HOME_WU + [E("Dumbbell Goblet Squat", 3, "40s", group="A"), E("Dumbbell Bent-over Row", 3, "40s", group="A"),
               E("Alternating Reverse Lunge", 3, "40s", group="A"), E("Incline Push-up (bench or couch)", 3, "40s", group="A"),
               E("Dumbbell Romanian Deadlift", 3, "40s", group="A"), E("Standing Dumbbell Press + March", 3, "40s", group="A"), STRETCH],
    ["x-gym-strengthlog-beginner-dumbbell-a", "seven-minute-workout", "x-gym-army-strength-training-circuit"])

# --- Advanced max-effort / dynamic-effort (concurrent) strength
S = "Somax Advanced Max & Speed Strength"
who = "Advanced strength trainees (well past intermediate standards) who've stalled on straight percentage plans and want to rotate heavy variations and speed work."
how = ["Two to four days a week: Max-Effort and Dynamic-Effort sessions at least 72 hours apart (e.g. ME Mon, DE Thu; or ME lower/upper and DE lower/upper over 4 days).",
       "Max-effort: work up to a top single or triple of a variation at RPE 9 and rotate the variation every 1-3 weeks so you can keep going heavy.",
       "Dynamic-effort: 50-60% of your best (plus bands or chains if you have them) for fast doubles and triples on 45-60 seconds' rest, in 3-week waves.",
       "Accessories make up most of the volume: pick them for your weak points. Finish with sled or carry work. Deload every 4-6 weeks."]
add("x-gym-somax-advanced-max-effort", "Somax Advanced Max & Speed – Max-Effort Day", "gym", "advanced", "strength-training",
    ["strength"], 75, 2, ["barbell", "squat rack", "bench", "dumbbells", "machines", "sled"],
    "A heavy single or triple on a rotating squat, deadlift or press variation, then weak-point accessories and conditioning.",
    who, ["full-gym"], how,
    GYM_WU + [E("Max-effort Variation (e.g. safety-bar squat, rack pull, floor press) – work up", 1, "1-3", "top set RPE 9"),
              E("Max-effort Variation – back-off", 2, "3", "85% of top set"), E("Primary Accessory (e.g. close-grip bench, front squat)", 4, "5-8", R2),
              E("Upper-back Accessory (row or pulldown)", 4, "8-12", R1), E("Hamstring or Triceps Isolation", 3, "10-12", R1),
              E("Core (ab wheel or hanging leg raise)", 3, "10-15"), E("Sled Drag or Farmer Carry", 6, "20-30m")],
    ["wendler-bbb-day-4", "x-gym-phat-upper-power", "x-gym-phat-lower-power"], S, 1, 2)
add("x-gym-somax-advanced-dynamic-effort", "Somax Advanced Max & Speed – Dynamic-Effort Day", "gym", "advanced", "strength-training",
    ["strength", "sport-performance"], 70, 2, ["barbell", "squat rack", "bench", "bands", "dumbbells", "cables"],
    "Fast box squats and speed bench in short-rest doubles and triples, then higher-rep accessories.",
    who, ["full-gym"], how,
    GYM_WU + [E("Speed Box Squat", 10, "2", "50 / 55 / 60% by week, +bands optional"), E("Speed Deadlift", 6, "1", "60-70%, fast"),
              E("Speed Bench Press", 9, "3", "50-55%, change grip every 3 sets"), E("Dumbbell Row", 4, "10-12/arm", R1),
              E("Reverse Hyper or Back Extension", 3, "12-15"), E("Triceps Pushdown", 3, "15-20", R1), E("Face Pull", 3, "15-20")],
    ["x-gym-phat-back-shoulders-hypertrophy", "x-gym-phat-lower-hypertrophy", "wendler-bbb-day-3"], S, 2, 2)

# ######################################################################## BODYBUILDING

# --- Beginner hypertrophy upper/lower 4-day
S = "Somax Beginner Muscle Builder (Upper/Lower)"
who = "Beginners with 2-6 months in the gym who want to build muscle and have four days a week. A good next step after a 3-day full-body plan."
how = ["Upper A, Lower A, rest, Upper B, Lower B, rest, rest. Each muscle is trained twice a week.",
       "Stop every set with 1-3 reps in reserve. Double progression: hit the top of the range on every set, then add weight.",
       "Rest 2 minutes on the first two exercises and 60-90 seconds on the rest.",
       "Every 6th week, do half the sets at the same weights. After about 4-6 months, step up to an intermediate plan."]
add("x-gym-somax-beginner-muscle-upper-a", "Somax Beginner Muscle Builder – Upper A", "gym", "beginner", "bodybuilding", ["muscle", "strength"], 50, 4,
    ["dumbbells", "bench", "cables", "machines"],
    "Dumbbell bench, pulldowns, seated rows, shoulders and arms. About 10 working sets per main muscle across the week.",
    who, ["full-gym"], how,
    GYM_WU + [E("Dumbbell Bench Press", 3, "8-12", R2), E("Lat Pulldown", 3, "8-12", R2), E("Seated Cable Row", 2, "10-12", R2),
              E("Machine Shoulder Press", 2, "10-12", R2), E("Dumbbell Curl", 2, "10-15", R1, group="A"), E("Triceps Pushdown", 2, "10-15", R1, group="A")],
    ["x-gym-strengthlog-bodybuilding-beginners-a", "metallicdpa-ppl-push-a", "x-gym-strengthlog-beginner-strength-b"], S, 1, 4)
add("x-gym-somax-beginner-muscle-lower-a", "Somax Beginner Muscle Builder – Lower A", "gym", "beginner", "bodybuilding", ["muscle", "strength"], 50, 4,
    ["barbell", "squat rack", "machines", "dumbbells"],
    "Squats, Romanian deadlifts, leg press, leg curls and calves.",
    who, ["full-gym"], how,
    GYM_WU + [E("Back Squat or Hack Squat", 3, "6-10", R2), E("Dumbbell Romanian Deadlift", 3, "8-12", R2), E("Leg Press", 2, "10-15", R2),
              E("Seated Leg Curl", 2, "10-15", R1), E("Standing Calf Raise", 3, "10-15", R1), E("Dead Bug", 2, "8/side")],
    ["x-gym-strengthlog-bodybuilding-beginners-a", "metallicdpa-ppl-legs"], S, 2, 4)
add("x-gym-somax-beginner-muscle-upper-b", "Somax Beginner Muscle Builder – Upper B", "gym", "beginner", "bodybuilding", ["muscle", "strength"], 50, 4,
    ["dumbbells", "bench", "cables", "machines", "pull-up bar"],
    "Incline press, assisted chin-ups, chest-supported rows, lateral raises and arms.",
    who, ["full-gym"], how,
    GYM_WU + [E("Incline Dumbbell Press", 3, "8-12", R2), E("Assisted Chin-up or Neutral-grip Pulldown", 3, "6-10", R2),
              E("Chest-supported Dumbbell Row", 2, "10-12", R2), E("Dumbbell Lateral Raise", 3, "12-15", R1),
              E("Cable Curl", 2, "10-15", R1, group="A"), E("Overhead Cable Triceps Extension", 2, "10-15", R1, group="A")],
    ["x-gym-strengthlog-bodybuilding-beginners-b", "metallicdpa-ppl-pull-a"], S, 3, 4)
add("x-gym-somax-beginner-muscle-lower-b", "Somax Beginner Muscle Builder – Lower B", "gym", "beginner", "bodybuilding", ["muscle", "strength"], 50, 4,
    ["barbell", "machines", "dumbbells", "bench"],
    "Hip thrusts, split squats, leg extensions and curls, and calves.",
    who, ["full-gym"], how,
    GYM_WU + [E("Barbell or Machine Hip Thrust", 3, "8-12", R2), E("Dumbbell Bulgarian Split Squat", 3, "8-10/leg", R2),
              E("Leg Extension", 2, "12-15", R1), E("Lying Leg Curl", 2, "10-15", R1), E("Seated Calf Raise", 3, "12-15", R1),
              E("Cable Crunch", 2, "12-15")],
    ["x-gym-strengthlog-bodybuilding-beginners-b", "metallicdpa-ppl-legs"], S, 4, 4)

# --- Intermediate PPL 3-day
S = "Somax 3-Day Push/Pull/Legs"
who = "Intermediate lifters who like a push/pull/legs split but can only train three days. Each session is longer to make up the volume."
how = ["Push, Pull, Legs on three non-consecutive days (e.g. Mon/Wed/Fri). Each muscle gets about 10-14 hard sets a week.",
       "Main lifts: add weight when you hit the top of the range on every set. Isolation: take the last set close to failure.",
       "Rest 2-3 minutes on the first two lifts and 60-90 seconds on the rest.",
       "Run 5 weeks, then a lighter week (half the sets). Ready for more? Move to the Metallicdpa 6-day PPL."]
add("x-gym-somax-3-day-ppl-push", "Somax 3-Day PPL – Push", "gym", "intermediate", "bodybuilding", ["muscle", "strength"], 65, 3,
    ["barbell", "bench", "dumbbells", "cables", "dip bars"],
    "Bench press, overhead press, incline dumbbells, dips, laterals and triceps.",
    who, ["full-gym"], how,
    GYM_WU + [E("Bench Press", 4, "5-8", R2), E("Standing Overhead Press", 3, "6-10", R2), E("Incline Dumbbell Press", 3, "8-12", R1),
              E("Dip (or Machine Dip)", 2, "8-12", R1), E("Cable Lateral Raise", 3, "12-20", "0-1 rep in reserve"),
              E("Overhead Rope Triceps Extension", 3, "10-15", R1)],
    ["metallicdpa-ppl-push-a", "metallicdpa-ppl-push-b", "x-gym-phat-chest-arms-hypertrophy"], S, 1, 3)
add("x-gym-somax-3-day-ppl-pull", "Somax 3-Day PPL – Pull", "gym", "intermediate", "bodybuilding", ["muscle", "strength"], 65, 3,
    ["barbell", "pull-up bar", "cables", "dumbbells", "machines"],
    "Deadlifts or rack pulls, pull-ups, rows, rear delts and biceps.",
    who, ["full-gym"], how,
    GYM_WU + [E("Deadlift or Rack Pull", 3, "5", R2), E("Pull-up or Lat Pulldown", 4, "6-10", R2), E("Chest-supported Row", 3, "8-12", R1),
              E("Single-arm Cable Row", 2, "10-12/arm", R1), E("Reverse Pec Deck or Face Pull", 3, "12-20", R1),
              E("Incline Dumbbell Curl", 3, "10-15", R1), E("Hammer Curl", 2, "10-12", R1)],
    ["metallicdpa-ppl-pull-a", "metallicdpa-ppl-pull-b", "x-gym-phat-back-shoulders-hypertrophy"], S, 2, 3)
add("x-gym-somax-3-day-ppl-legs", "Somax 3-Day PPL – Legs", "gym", "intermediate", "bodybuilding", ["muscle", "strength"], 65, 3,
    ["barbell", "squat rack", "machines", "dumbbells"],
    "Squats, Romanian deadlifts, leg press, leg curls, extensions and calves.",
    who, ["full-gym"], how,
    GYM_WU + [E("Back Squat", 4, "5-8", R2), E("Romanian Deadlift", 3, "6-10", R2), E("Leg Press", 3, "10-15", R1),
              E("Seated Leg Curl", 3, "10-15", R1), E("Leg Extension", 2, "12-20", R1), E("Standing Calf Raise", 4, "8-15", R1),
              E("Hanging Leg Raise", 3, "10-15")],
    ["metallicdpa-ppl-legs", "x-gym-phat-lower-hypertrophy"], S, 3, 3)

# --- Advanced ULPPL 5-day
S = "Somax Advanced 5-Day (Upper/Lower/Push/Pull/Legs)"
who = "Advanced lifters (2+ years of consistent training) who recover well and want 15-25 hard sets per muscle a week across five sessions."
how = ["Upper, Lower, rest, Push, Pull, Legs, rest. The first two days lean heavy; the last three lean on volume.",
       "Heavy lifts use a top set at RPE 8-9 plus back-offs. Volume work stops 0-2 reps short of failure, with the last set of isolation taken to failure.",
       "Add a set to lagging muscles every week or two while you recover well. If performance drops two sessions running, go to a deload.",
       "Run 4-6 weeks, then deload for a week: half the sets, 3+ reps in reserve."]
add("x-gym-somax-advanced-5-day-upper", "Somax Advanced 5-Day – Upper (Heavy)", "gym", "advanced", "bodybuilding", ["muscle", "strength"], 70, 5,
    ["barbell", "bench", "pull-up bar", "dumbbells", "cables"],
    "Heavy bench and weighted pull-ups, then rows, presses and arms in moderate reps.",
    who, ["full-gym"], how,
    GYM_WU + [E("Bench Press – top set", 1, "4-6", "RPE 8-9"), E("Bench Press – back-off", 3, "6-8", "85-90% of top set"),
              E("Weighted Pull-up", 4, "5-8", R1), E("Seal Row or T-bar Row", 3, "8-10", R1), E("Seated Dumbbell Shoulder Press", 3, "8-10", R1),
              E("EZ-bar Curl", 2, "8-12", "0-1 rep in reserve", group="A"), E("Skull Crusher", 2, "8-12", "0-1 rep in reserve", group="A")],
    ["x-gym-phat-upper-power", "x-gym-strengthlog-full-body-3x-1", "metallicdpa-ppl-push-a"], S, 1, 5)
add("x-gym-somax-advanced-5-day-lower", "Somax Advanced 5-Day – Lower (Heavy)", "gym", "advanced", "bodybuilding", ["muscle", "strength"], 70, 5,
    ["barbell", "squat rack", "machines"],
    "Heavy squats, stiff-legged deadlifts, hack squats, leg curls and calves.",
    who, ["full-gym"], how,
    GYM_WU + [E("Back Squat – top set", 1, "4-6", "RPE 8-9"), E("Back Squat – back-off", 3, "6-8", "85-90% of top set"),
              E("Stiff-legged Deadlift", 3, "6-8", R1), E("Hack Squat", 3, "8-12", R1), E("Lying Leg Curl", 3, "10-12", "0-1 rep in reserve"),
              E("Standing Calf Raise", 4, "8-12", "0-1 rep in reserve")],
    ["x-gym-phat-lower-power", "metallicdpa-ppl-legs"], S, 2, 5)
add("x-gym-somax-advanced-5-day-push", "Somax Advanced 5-Day – Push (Volume)", "gym", "advanced", "bodybuilding", ["muscle"], 65, 5,
    ["dumbbells", "bench", "machines", "cables"],
    "Incline presses, machine chest work, flyes, laterals and triceps for 8-20 reps.",
    who, ["full-gym"], how,
    GYM_WU + [E("Incline Dumbbell Press", 4, "8-12", R1), E("Machine Chest Press", 3, "10-12", R1), E("Cable Fly (low to high)", 3, "12-15", "0-1 rep in reserve"),
              E("Machine Shoulder Press", 3, "10-12", R1), E("Cable Lateral Raise", 4, "12-20", "last set to failure"),
              E("Rope Pressdown", 3, "12-15", "0-1 rep in reserve"), E("Overhead Cable Triceps Extension", 2, "12-15", "last set to failure")],
    ["x-gym-phat-chest-arms-hypertrophy", "metallicdpa-ppl-push-b"], S, 3, 5)
add("x-gym-somax-advanced-5-day-pull", "Somax Advanced 5-Day – Pull (Volume)", "gym", "advanced", "bodybuilding", ["muscle"], 65, 5,
    ["cables", "machines", "dumbbells", "pull-up bar"],
    "Pulldowns, rows, pullovers, rear delts and biceps for 8-20 reps.",
    who, ["full-gym"], how,
    GYM_WU + [E("Neutral-grip Lat Pulldown", 4, "8-12", R1), E("Chest-supported Machine Row", 3, "10-12", R1), E("Single-arm Cable Row", 3, "10-12/arm", R1),
              E("Cable Pullover", 3, "12-15", "0-1 rep in reserve"), E("Reverse Pec Deck", 3, "15-20", "last set to failure"),
              E("Preacher Curl", 3, "10-12", "0-1 rep in reserve"), E("Cable Hammer Curl", 2, "12-15", "last set to failure")],
    ["x-gym-phat-back-shoulders-hypertrophy", "metallicdpa-ppl-pull-b"], S, 4, 5)
add("x-gym-somax-advanced-5-day-legs", "Somax Advanced 5-Day – Legs (Volume)", "gym", "advanced", "bodybuilding", ["muscle"], 65, 5,
    ["machines", "dumbbells", "barbell", "bench"],
    "Leg press, Bulgarian split squats, hip thrusts, leg extensions, curls and calves.",
    who, ["full-gym"], how,
    GYM_WU + [E("Leg Press", 4, "10-15", R1), E("Dumbbell Bulgarian Split Squat", 3, "8-12/leg", R1), E("Barbell Hip Thrust", 3, "8-12", R1),
              E("Leg Extension", 3, "12-20", "last set to failure"), E("Seated Leg Curl", 3, "10-15", "last set to failure"),
              E("Seated Calf Raise", 4, "12-20", "0-1 rep in reserve"), E("Cable Crunch", 3, "12-15")],
    ["x-gym-phat-lower-hypertrophy", "metallicdpa-ppl-legs"], S, 5, 5)

# --- Home dumbbell upper/lower (intermediate)
S = "Somax Home Dumbbell Upper/Lower"
who = "Home lifters with adjustable dumbbells and a bench (a pull-up bar helps) who've outgrown beginner full-body sessions and want four days a week."
how = ["Upper A, Lower A, rest, Upper B, Lower B, rest, rest.",
       "Light dumbbells? Make each set count: 1-second pauses, 3-second lowering, and take sets within 0-2 reps of failure.",
       "Double progression: hit the top of the range on every set, then add 1-2kg per hand or 2 reps.",
       "Every 5th week, halve the sets. Maxed out your dumbbells? Switch to single-leg and single-arm versions or add a set."]
add("x-gym-somax-home-db-upper-a", "Somax Home Dumbbell – Upper A", "fitness", "intermediate", "bodybuilding", ["muscle", "strength"], 45, 4,
    ["dumbbells", "bench", "pull-up bar"],
    "Dumbbell bench press, pull-ups, rows, shoulder presses and arms.",
    who, ["home", "minimal-equipment"], how,
    HOME_WU + [E("Dumbbell Bench Press", 4, "8-12", R1), E("Pull-up or Chin-up (band-assisted if needed)", 4, "5-10", R1),
               E("One-arm Dumbbell Row", 3, "10-12/arm", R1), E("Seated Dumbbell Shoulder Press", 3, "8-12", R1),
               E("Dumbbell Curl", 2, "10-15", R1, group="A"), E("Dumbbell Skull Crusher", 2, "10-15", R1, group="A")],
    ["x-gym-dumbbell-stopgap-ppl-push", "x-gym-dumbbell-stopgap-ppl-pull", "x-gym-strengthlog-beginner-dumbbell-a"], S, 1, 4)
add("x-gym-somax-home-db-lower-a", "Somax Home Dumbbell – Lower A", "fitness", "intermediate", "bodybuilding", ["muscle", "strength"], 45, 4,
    ["dumbbells", "bench"],
    "Goblet squats, Romanian deadlifts, step-ups, single-leg hip thrusts and calves.",
    who, ["home", "minimal-equipment"], how,
    HOME_WU + [E("Dumbbell Goblet Squat (3s lowering)", 4, "10-15", R1), E("Dumbbell Romanian Deadlift", 4, "10-12", R1),
               E("Dumbbell Step-up onto Bench", 3, "10/leg", R1), E("Single-leg Hip Thrust (shoulders on bench)", 3, "10-15/leg", R1),
               E("Single-leg Dumbbell Calf Raise", 3, "12-15/leg", R1)],
    ["x-gym-dumbbell-stopgap-ppl-legs", "x-gym-strengthlog-beginner-dumbbell-b"], S, 2, 4)
add("x-gym-somax-home-db-upper-b", "Somax Home Dumbbell – Upper B", "fitness", "intermediate", "bodybuilding", ["muscle", "strength"], 45, 4,
    ["dumbbells", "bench", "pull-up bar"],
    "Incline press, chin-ups, chest-supported rows, lateral raises, rear-delt flyes and arms.",
    who, ["home", "minimal-equipment"], how,
    HOME_WU + [E("Incline Dumbbell Press", 4, "8-12", R1), E("Chin-up", 3, "5-10", R1), E("Chest-supported Dumbbell Row (incline bench)", 3, "10-12", R1),
               E("Dumbbell Lateral Raise", 3, "12-20", "0-1 rep in reserve"), E("Dumbbell Rear-delt Fly", 2, "15", R1),
               E("Hammer Curl", 2, "10-15", R1, group="A"), E("Close-grip Push-up", 2, "max-2", group="A")],
    ["x-gym-dumbbell-stopgap-ppl-push", "x-gym-dumbbell-stopgap-ppl-pull"], S, 3, 4)
add("x-gym-somax-home-db-lower-b", "Somax Home Dumbbell – Lower B", "fitness", "intermediate", "bodybuilding", ["muscle", "strength"], 45, 4,
    ["dumbbells", "bench"],
    "Bulgarian split squats, single-leg Romanian deadlifts, reverse lunges, glute bridges and core.",
    who, ["home", "minimal-equipment"], how,
    HOME_WU + [E("Dumbbell Bulgarian Split Squat", 4, "8-12/leg", R1), E("Single-leg Dumbbell Romanian Deadlift", 3, "8-10/leg", R1),
               E("Dumbbell Reverse Lunge", 3, "10/leg", R1), E("Dumbbell Glute Bridge (2s pause)", 3, "12-15", R1),
               E("Dumbbell Side Bend or Suitcase Hold", 2, "12/side"), E("Hollow Hold", 2, "20-30s")],
    ["x-gym-dumbbell-stopgap-ppl-legs", "x-gym-strengthlog-beginner-dumbbell-b"], S, 4, 4)

# --- Glute builder (3-day)
S = "Somax Glute Builder"
who = "Beginners to intermediates (often women, but not only) whose top priority is glutes and legs, with one upper-body day to keep things balanced."
how = ["Three days a week: Glutes & Hamstrings, Upper Body, Glutes & Quads, with a rest day after each if you can.",
       "Glute work goes close to failure (0-2 reps in reserve). Pause and squeeze at the top of every hip thrust and bridge.",
       "Add weight or reps to hip thrusts and squats every week you can. Small jumps (2.5kg) are fine.",
       "After 8-12 weeks, take a lighter week, then change one exercise per day (e.g. swap the hip thrust for a B-stance version)."]
add("x-gym-somax-glute-builder-hamstrings", "Somax Glute Builder – Glutes & Hamstrings", "gym", "intermediate", "bodybuilding", ["muscle", "strength"], 55, 3,
    ["barbell", "bench", "machines", "cables", "dumbbells"],
    "Heavy hip thrusts, Romanian deadlifts, back extensions and cable kickbacks.",
    who, ["full-gym"], how,
    GYM_WU + [E("Barbell Hip Thrust (1s squeeze)", 4, "6-10", R1), E("Romanian Deadlift", 3, "8-10", R2), E("45° Back Extension (glute bias)", 3, "12-15", R1),
              E("Seated Leg Curl", 3, "10-15", R1), E("Cable Glute Kickback", 2, "12-15/leg", "0-1 rep in reserve"),
              E("Seated Hip Abduction Machine", 2, "15-20", "last set to failure")],
    ["x-gym-strengthlog-bodybuilding-beginners-a", "x-gym-phat-lower-hypertrophy", "x-gym-strengthlog-full-body-3x-3"], S, 1, 3)
add("x-gym-somax-glute-builder-upper", "Somax Glute Builder – Upper Body", "gym", "intermediate", "bodybuilding", ["muscle", "strength"], 45, 3,
    ["dumbbells", "bench", "cables", "machines"],
    "A balanced upper session: pulldowns, presses, rows and shoulders so the whole body keeps pace.",
    who, ["full-gym"], how,
    GYM_WU + [E("Lat Pulldown", 3, "8-12", R2), E("Incline Dumbbell Press", 3, "8-12", R2), E("Seated Cable Row", 3, "10-12", R2),
              E("Dumbbell Lateral Raise", 3, "12-15", R1), E("Face Pull", 2, "15", R1, group="A"), E("Triceps Pushdown", 2, "12-15", R1, group="A")],
    ["x-gym-strengthlog-bodybuilding-beginners-b"], S, 2, 3)
add("x-gym-somax-glute-builder-quads", "Somax Glute Builder – Glutes & Quads", "gym", "intermediate", "bodybuilding", ["muscle", "strength"], 55, 3,
    ["barbell", "squat rack", "machines", "dumbbells", "bench"],
    "Squats, Bulgarian split squats, leg press with high feet, step-ups and glute bridges.",
    who, ["full-gym"], how,
    GYM_WU + [E("Back Squat or Hack Squat", 4, "6-10", R2), E("Dumbbell Bulgarian Split Squat (lean forward)", 3, "8-12/leg", R1),
              E("Leg Press (feet high and wide)", 3, "10-15", R1), E("Dumbbell Step-up", 2, "10/leg", R1),
              E("Single-leg Glute Bridge", 2, "12-15/leg", "0-1 rep in reserve"), E("Banded Lateral Walk", 2, "15 steps/side")],
    ["x-gym-strengthlog-bodybuilding-beginners-a", "x-gym-phat-lower-hypertrophy"], S, 3, 3)

# --- Arms & delts 20
add("x-gym-somax-arms-delts-pump-20", "Somax Arms & Delts Pump 20", "gym", "intermediate", "bodybuilding", ["muscle"], 20, 2,
    ["cables", "dumbbells"],
    "A 20-minute add-on of supersets for biceps, triceps and side delts, the muscles that most change how a T-shirt fits.",
    "Intermediate lifters who want bigger arms and shoulders and have 20 spare minutes once or twice a week, on top of a main plan.",
    ["full-gym", "time-efficient", "busy"],
    ["Add it after a lower-body session or on its own day, once or twice a week. Leave 48 hours before your next upper session.",
     "Superset each pair with 60 seconds' rest after the pair. Take the last set of each exercise to failure, with good form.",
     "Progress by adding reps up to the top of the range, then a little weight.",
     "Skip it during deload weeks, and drop it if your main pressing or pulling starts to suffer."],
    [E("Cable Lateral Raise", 3, "12-20", R1, group="A"), E("Incline Dumbbell Curl", 3, "10-15", R1, group="A"),
     E("Overhead Cable Triceps Extension", 3, "10-15", R1, group="B"), E("Dumbbell Rear-delt Fly", 3, "15-20", R1, group="B"),
     E("Cable Hammer Curl", 2, "12-15", "to failure", group="C"), E("Rope Pressdown", 2, "12-15", "to failure", group="C")],
    ["x-gym-phat-chest-arms-hypertrophy", "x-gym-strengthlog-full-body-3x-3"])

# --- Express hypertrophy full body 30 (intermediate) A/B
S = "Somax 30-Minute Muscle"
who = "Intermediate lifters who want to keep building muscle on three or four short 30-minute sessions a week."
how = ["Alternate A and B 3-4 times a week. Each muscle gets about 10-14 sets across the week.",
       "Supersets of non-competing muscles save time: 60-75 seconds' rest after each pair. Take sets within 1-2 reps of failure.",
       "Double progression: top of the rep range on all sets, then add weight.",
       "Every 6th week, do one set per exercise instead of three."]
add("x-gym-somax-30-minute-muscle-a", "Somax 30-Minute Muscle – A", "gym", "intermediate", "bodybuilding", ["muscle"], 30, 4,
    ["machines", "dumbbells", "cables", "bench"],
    "Three supersets: hack squat with pulldowns, incline press with leg curls, then laterals with curls.",
    who, ["full-gym", "busy", "time-efficient"], how,
    SHORT_WU + [E("Hack Squat or Leg Press", 3, "8-12", R1, group="A"), E("Lat Pulldown", 3, "8-12", R1, group="A"),
                E("Incline Dumbbell Press", 3, "8-12", R1, group="B"), E("Seated Leg Curl", 3, "10-15", R1, group="B"),
                E("Cable Lateral Raise", 2, "12-20", R1, group="C"), E("Dumbbell Curl", 2, "10-15", R1, group="C")],
    ["x-gym-strengthlog-full-body-3x-2", "x-gym-strengthlog-bodybuilding-beginners-a"], S, 1, 2)
add("x-gym-somax-30-minute-muscle-b", "Somax 30-Minute Muscle – B", "gym", "intermediate", "bodybuilding", ["muscle"], 30, 4,
    ["dumbbells", "cables", "machines", "bench"],
    "Romanian deadlifts with chest press, split squats with rows, then triceps and rear delts.",
    who, ["full-gym", "busy", "time-efficient"], how,
    SHORT_WU + [E("Dumbbell Romanian Deadlift", 3, "8-12", R1, group="A"), E("Machine Chest Press", 3, "8-12", R1, group="A"),
                E("Dumbbell Split Squat", 3, "8-12/leg", R1, group="B"), E("Chest-supported Row", 3, "10-12", R1, group="B"),
                E("Rope Pressdown", 2, "12-15", R1, group="C"), E("Reverse Pec Deck", 2, "15-20", R1, group="C")],
    ["x-gym-strengthlog-full-body-3x-3", "x-gym-strengthlog-bodybuilding-beginners-b"], S, 2, 2)

# --- Hypertrophy deload
add("x-gym-somax-hypertrophy-deload", "Somax Muscle Deload Session", "gym", "intermediate", "bodybuilding", ["muscle", "general-fitness"], 35, 4,
    ["machines", "cables", "dumbbells"],
    "A recovery-week full-body session: one or two easy sets per muscle on machines and cables, enough to hold your gains while fatigue drops.",
    "Intermediate and advanced bodybuilders at the end of a 4-6 week block, or anyone whose joints ache and lifts are going backwards.",
    ["full-gym", "time-efficient"],
    ["Use it 2-4 times in your deload week in place of your normal split.",
     "Same weights as last week, but stop every set with 3-4 reps left. About half your usual weekly sets.",
     "No failure, no new personal bests. You should leave feeling better than when you came in.",
     "Next week, return to your plan at your normal volume (or one set less per muscle than you finished on)."],
    [E("Warm-up: bike", 1, "5 min"), E("Leg Press", 2, "10", "3-4 reps in reserve"), E("Chest-supported Row", 2, "10", "3-4 reps in reserve"),
     E("Machine Chest Press", 2, "10", "3-4 reps in reserve"), E("Seated Leg Curl", 2, "12", "3-4 reps in reserve"),
     E("Cable Lateral Raise", 1, "15", "3-4 reps in reserve"), E("Cable Curl", 1, "12", "3-4 reps in reserve", group="A"),
     E("Rope Pressdown", 1, "12", "3-4 reps in reserve", group="A"), STRETCH],
    ["x-gym-phat-lower-hypertrophy", "metallicdpa-ppl-legs"])

# --- Band hypertrophy (travel)
add("x-gym-somax-travel-band-pump", "Somax Travel Band Pump", "fitness", "intermediate", "bodybuilding", ["muscle"], 30, 3,
    ["bands", "bodyweight"],
    "A hotel-room muscle session with bands and body weight: high reps, slow lowering and short rests to keep the stimulus up while you're away.",
    "Lifters on a work trip or holiday for 1-3 weeks who want to hold on to (or keep building) muscle without a gym.",
    ["travel", "home", "minimal-equipment", "time-efficient"],
    ["Three or four times a week while away. Do each pair back to back with 45 seconds' rest.",
     "Bands are light, so go to 0-1 reps from failure and use a 3-second lowering on everything.",
     "Short trip? You'll keep your muscle with as little as one hard set per muscle per session.",
     "Back home, return to your normal plan at about 90% of your usual weights for the first week."],
    HOME_WU + [E("Feet-elevated Push-up", 3, "max-1", group="A"), E("Band Row (door anchor)", 3, "15-25", "0-1 rep in reserve", group="A"),
               E("Band Front Squat", 3, "20-25", "0-1 rep in reserve", group="B"), E("Band Romanian Deadlift", 3, "20", "0-1 rep in reserve", group="B"),
               E("Band Lateral Raise", 3, "20-25", group="C"), E("Band Curl", 3, "15-20", group="C"),
               E("Bench or Chair Dip", 2, "max-1", group="D"), E("Band Face Pull", 2, "20", group="D")],
    ["x-gym-dumbbell-stopgap-ppl-push", "x-gym-strengthlog-calisthenics-beginner-1"])

# ######################################################################## POWERLIFTING

# --- Intro to powerlifting (beginner 3-day)
S = "Somax Intro to Powerlifting"
who = "Beginners who have learnt the basic lifts and want to try a local powerlifting meet in 3-6 months. Teaches competition-standard squats, paused bench and deadlifts."
how = ["Three days a week (e.g. Mon/Wed/Fri). Every rep meets the meet standard: squat hip crease below the knee, bench paused on the chest, deadlift locked out.",
       "Main lifts: add 2.5kg (squat/bench) or 5kg (deadlift) each session you get all reps with good form. A rep with broken form counts as a miss.",
       "Miss two sessions in a row on a lift? Take 10% off it and build back. No true 1RM testing yet.",
       "After about 3 months, or once session-to-session jumps stall, move to Somax 3-Day Powerlifting or GZCLP."]
add("x-gym-somax-intro-powerlifting-1", "Somax Intro to Powerlifting – Day 1", "gym", "beginner", "powerlifting", ["strength"], 60, 3,
    ["barbell", "squat rack", "bench"],
    "Competition squat and paused bench press, plus rows and a little core.",
    who, ["full-gym"], how,
    GYM_WU + [E("Competition Back Squat", 3, "5", "linear: +2.5kg per session"), E("Paused Bench Press (1s on chest)", 3, "5", "linear: +2.5kg per session"),
              E("Barbell Row", 3, "8", R2), E("Plank", 3, "30-45s")],
    ["rfitness-basic-beginner-a", "stronglifts-5x5-workout-a", "gzclp-day-1"], S, 1, 3)
add("x-gym-somax-intro-powerlifting-2", "Somax Intro to Powerlifting – Day 2", "gym", "beginner", "powerlifting", ["strength"], 60, 3,
    ["barbell", "squat rack", "pull-up bar"],
    "Competition deadlift, overhead press for upper-body strength, and chin-ups.",
    who, ["full-gym"], how,
    GYM_WU + [E("Competition Deadlift", 1, "5", "linear: +5kg per session, then +2.5kg"), E("Deadlift – back-off", 2, "5", "90% of top set"),
              E("Overhead Press", 3, "5", "linear: +1.25-2.5kg per session"), E("Chin-up (assisted if needed)", 3, "5-8", R2),
              E("Back Extension", 2, "10-12")],
    ["rfitness-basic-beginner-b", "stronglifts-5x5-workout-b", "gzclp-day-2"], S, 2, 3)
add("x-gym-somax-intro-powerlifting-3", "Somax Intro to Powerlifting – Day 3", "gym", "beginner", "powerlifting", ["strength", "muscle"], 60, 3,
    ["barbell", "squat rack", "bench", "dumbbells"],
    "A second squat and bench day with lighter, higher-rep technique work and assistance.",
    who, ["full-gym"], how,
    GYM_WU + [E("Paused Back Squat (2s in the hole)", 3, "4", "about 80% of Day 1 weight"), E("Paused Bench Press", 4, "6", "about 85% of Day 1 weight"),
              E("Dumbbell Romanian Deadlift", 3, "8-10", R2), E("Dumbbell Row", 3, "10/arm", R2), E("Triceps Pushdown or Dip", 2, "10-12", R2)],
    ["gzclp-day-3", "x-gym-strengthlog-beginner-strength-a"], S, 3, 3)

# --- Intermediate 3-day powerlifting (busy)
S = "Somax 3-Day Powerlifting"
who = "Intermediate lifters (beginner gains used up) who want to raise their squat, bench and deadlift total on three days a week."
how = ["Three days a week. Squat 2x, bench 3x and deadlift 1x a week, plus one variation of each.",
       "Weekly wave: week 1 top sets at RPE 7, week 2 RPE 8, week 3 RPE 9, week 4 deload (half the sets, RPE 6). Then start again a little heavier.",
       "Back-off sets use 85-90% of the day's top set. Rest 3-5 minutes on main lifts, 2 minutes on variations.",
       "Expect about 1% a month on your total at this stage. Re-test e1RMs from a top set every 4-8 weeks rather than maxing out."]
add("x-gym-somax-3-day-powerlifting-1", "Somax 3-Day Powerlifting – Day 1 (Squat/Bench)", "gym", "intermediate", "powerlifting", ["strength"], 75, 3,
    ["barbell", "squat rack", "bench", "dumbbells"],
    "Heavy competition squat and bench, then rows and triceps.",
    who, ["full-gym"], how,
    GYM_WU + [E("Competition Squat – top set", 1, "3", "RPE 7 / 8 / 9 by week"), E("Competition Squat – back-off", 3, "5", "85% of top set"),
              E("Competition Bench – top set", 1, "3", "RPE 7 / 8 / 9 by week"), E("Competition Bench – back-off", 3, "5", "87% of top set"),
              E("Chest-supported Row", 3, "8-10", R2), E("Dumbbell Triceps Extension", 2, "10-12", R2)],
    ["wendler-531-beginners-day-1", "gzclp-day-1", "x-gym-wendler-monolith-mon"], S, 1, 3)
add("x-gym-somax-3-day-powerlifting-2", "Somax 3-Day Powerlifting – Day 2 (Deadlift/Bench volume)", "gym", "intermediate", "powerlifting", ["strength", "muscle"], 75, 3,
    ["barbell", "bench", "pull-up bar", "machines"],
    "Heavy deadlift, a close-grip or Larsen bench for volume, and pull-ups.",
    who, ["full-gym"], how,
    GYM_WU + [E("Competition Deadlift – top set", 1, "3", "RPE 7 / 8 / 9 by week"), E("Competition Deadlift – back-off", 2, "4", "85% of top set"),
              E("Close-grip or Larsen Bench Press", 4, "6-8", R2), E("Pull-up or Lat Pulldown", 4, "6-10", R2),
              E("Leg Curl", 2, "10-12", R2), E("Hanging Knee Raise", 3, "12")],
    ["wendler-531-beginners-day-2", "gzclp-day-4", "x-gym-wendler-monolith-wed"], S, 2, 3)
add("x-gym-somax-3-day-powerlifting-3", "Somax 3-Day Powerlifting – Day 3 (Variations)", "gym", "intermediate", "powerlifting", ["strength", "muscle"], 70, 3,
    ["barbell", "squat rack", "bench", "dumbbells"],
    "A variation day for weak points: paused or tempo squats, a third bench session and Romanian deadlifts.",
    who, ["full-gym"], how,
    GYM_WU + [E("Paused or Tempo Squat", 4, "4", "RPE 7"), E("Paused Bench Press (2s)", 4, "5", "RPE 7-8"), E("Romanian Deadlift", 3, "6-8", R2),
              E("Dumbbell Shoulder Press", 3, "8-10", R2), E("Face Pull", 3, "15")],
    ["wendler-531-beginners-day-3", "gzclp-day-3"], S, 3, 3)

# --- Intermediate 4-day powerlifting
S = "Somax 4-Day Powerlifting"
who = "Intermediate powerlifters training for a meet or a bigger total, with four days a week and about 75 minutes per session."
how = ["Mon Squat/Bench heavy, Tue Deadlift/accessories, Thu Bench heavy/Squat volume, Sat Deadlift variation/Bench volume.",
       "Run 3-week waves at top-set RPE 7, 8, 9, then a deload week. Each new wave starts about 2.5kg heavier on every lift.",
       "Back-off sets at 85-90% of the top set. If the top set comes in a whole RPE higher than planned, skip the back-offs that day.",
       "Hold accessories at 1-3 reps in reserve. A good intermediate result is a total that climbs about 1-2.5% per block."]
add("x-gym-somax-4-day-powerlifting-1", "Somax 4-Day Powerlifting – Day 1 (Squat/Bench)", "gym", "intermediate", "powerlifting", ["strength"], 75, 4,
    ["barbell", "squat rack", "bench", "dumbbells"],
    "Heavy squat and heavy bench, then rows.",
    who, ["full-gym"], how,
    GYM_WU + [E("Competition Squat – top set", 1, "3", "RPE 7 / 8 / 9 by week"), E("Competition Squat – back-off", 3, "4", "87% of top set"),
              E("Competition Bench – top set", 1, "3", "RPE 7 / 8 / 9 by week"), E("Competition Bench – back-off", 3, "5", "87% of top set"),
              E("Pendlay Row", 4, "6", R2)],
    ["wendler-bbb-day-4", "gzclp-day-1", "x-gym-phat-upper-power"], S, 1, 4)
add("x-gym-somax-4-day-powerlifting-2", "Somax 4-Day Powerlifting – Day 2 (Deadlift)", "gym", "intermediate", "powerlifting", ["strength"], 70, 4,
    ["barbell", "squat rack", "machines", "pull-up bar"],
    "Heavy deadlifts, then upper back, hamstrings and core to support the pull.",
    who, ["full-gym"], how,
    GYM_WU + [E("Competition Deadlift – top set", 1, "2-3", "RPE 7 / 8 / 9 by week"), E("Competition Deadlift – back-off", 3, "3", "85% of top set"),
              E("Front Squat", 3, "5", R2), E("Weighted Pull-up or Pulldown", 4, "6-8", R2), E("Glute-ham Raise or Leg Curl", 3, "8-10", R2),
              E("Ab Wheel Rollout", 3, "8-10")],
    ["wendler-bbb-day-2", "gzclp-day-4", "x-gym-phat-lower-power"], S, 2, 4)
add("x-gym-somax-4-day-powerlifting-3", "Somax 4-Day Powerlifting – Day 3 (Bench/Squat volume)", "gym", "intermediate", "powerlifting", ["strength", "muscle"], 75, 4,
    ["barbell", "squat rack", "bench", "dumbbells"],
    "A second heavy bench, then volume squats and shoulder and triceps work.",
    who, ["full-gym"], how,
    GYM_WU + [E("Competition Bench – top set", 1, "4", "RPE 7 / 8 / 9 by week"), E("Competition Bench – back-off", 3, "6", "85% of top set"),
              E("Back Squat (volume)", 4, "6", "about 75% of your best squat"), E("Seated Dumbbell Press", 3, "8-10", R2),
              E("Dip or Close-grip Push-up", 3, "8-12", R2), E("Band Pull-apart", 3, "20")],
    ["wendler-bbb-day-3", "gzclp-day-3"], S, 3, 4)
add("x-gym-somax-4-day-powerlifting-4", "Somax 4-Day Powerlifting – Day 4 (Variations)", "gym", "intermediate", "powerlifting", ["strength", "muscle"], 70, 4,
    ["barbell", "bench", "dumbbells", "machines"],
    "Deadlift and bench variations aimed at weak points, plus back and leg accessories.",
    who, ["full-gym"], how,
    GYM_WU + [E("Deficit or Paused Deadlift", 3, "4", "RPE 7"), E("Spoto Press or Larsen Press", 4, "6", "RPE 7-8"), E("Chest-supported Row", 3, "10", R2),
              E("Bulgarian Split Squat", 3, "8/leg", R2), E("Hammer Curl", 2, "10-12"), E("Side Plank", 2, "30s/side")],
    ["wendler-bbb-day-1", "gzclp-day-2"], S, 4, 4)

# --- Advanced 4-day block
S = "Somax Advanced Powerlifting Block"
who = "Advanced powerlifters (well past intermediate standards, several meets done) who autoregulate with RPE and train in 4-6 week blocks."
how = ["Four days a week: heavy squat, heavy bench, heavy deadlift, then a bench-and-variation day.",
       "Work up to the day's top single at RPE 8, then 3-4 back-off sets of 3-4 at 80-85% of that single. On a bad day, cap the single at RPE 7.",
       "Block plan: weeks 1-2 accumulate (more back-offs), weeks 3-4 intensify (fewer back-offs, heavier), week 5 deload or test.",
       "Day-to-day strength moves around 3-5%, so judge progress across weeks. Expect 2-6% a year at this level."]
add("x-gym-somax-advanced-powerlifting-squat", "Somax Advanced Powerlifting – Squat Day", "gym", "advanced", "powerlifting", ["strength"], 80, 4,
    ["barbell", "squat rack", "machines"],
    "A heavy squat single and back-offs, a squat variation, and posterior-chain accessories.",
    who, ["full-gym"], how,
    GYM_WU + [E("Competition Squat – top single", 1, "1", "RPE 8"), E("Competition Squat – back-off", 4, "3", "80-85% of top single"),
              E("Pin or Paused Squat", 3, "3", "RPE 7"), E("Romanian Deadlift", 3, "6", R2), E("Leg Press", 2, "10", R2), E("Weighted Plank", 3, "30s")],
    ["x-gym-wendler-monolith-mon", "x-gym-phat-lower-power"], S, 1, 4)
add("x-gym-somax-advanced-powerlifting-bench", "Somax Advanced Powerlifting – Bench Day", "gym", "advanced", "powerlifting", ["strength"], 75, 4,
    ["barbell", "bench", "dumbbells", "pull-up bar"],
    "A heavy bench single and back-offs, a close-grip press, and upper-back volume.",
    who, ["full-gym"], how,
    GYM_WU + [E("Competition Bench – top single", 1, "1", "RPE 8"), E("Competition Bench – back-off", 4, "4", "82-85% of top single"),
              E("Close-grip Bench Press", 3, "5", "RPE 7-8"), E("Weighted Pull-up", 4, "5", R2), E("Dumbbell Row", 3, "8-10/arm", R2),
              E("Dumbbell Triceps Extension", 3, "10-12", R2)],
    ["x-gym-wendler-monolith-wed"], S, 2, 4)
add("x-gym-somax-advanced-powerlifting-deadlift", "Somax Advanced Powerlifting – Deadlift Day", "gym", "advanced", "powerlifting", ["strength"], 75, 4,
    ["barbell", "squat rack", "machines"],
    "A heavy deadlift single and back-offs, a light front squat, and back and core work.",
    who, ["full-gym"], how,
    GYM_WU + [E("Competition Deadlift – top single", 1, "1", "RPE 8"), E("Competition Deadlift – back-off", 3, "3", "80-85% of top single"),
              E("Front Squat", 3, "4", "RPE 7"), E("Barbell or Seal Row", 3, "6-8", R2), E("Back Extension", 3, "10-12", R2), E("Hanging Leg Raise", 3, "10")],
    ["x-gym-wendler-monolith-wed"], S, 3, 4)
add("x-gym-somax-advanced-powerlifting-variation", "Somax Advanced Powerlifting – Bench Volume & Variation Day", "gym", "advanced", "powerlifting", ["strength", "muscle"], 75, 4,
    ["barbell", "bench", "squat rack", "dumbbells", "cables"],
    "Bench volume, a deadlift variation for your weak point, and shoulder health work.",
    who, ["full-gym"], how,
    GYM_WU + [E("Paused Bench Press", 5, "5", "75-80% of top single"), E("Block Pull or Deficit Deadlift", 3, "3", "RPE 7-8"),
              E("Incline Dumbbell Press", 3, "8-10", R2), E("Chest-supported Row", 3, "10", R2), E("Face Pull", 3, "15-20"),
              E("Belt Squat or Leg Extension", 2, "12-15", R2)],
    ["x-gym-phat-chest-arms-hypertrophy", "wendler-bbb-day-3"], S, 4, 4)

# --- Meet prep: opener day + mock meet
add("x-gym-somax-powerlifting-openers-session", "Somax Meet Week – Openers Session", "gym", "advanced", "powerlifting", ["strength", "sport-performance"], 45, 2,
    ["barbell", "squat rack", "bench"],
    "The last heavy-ish session 5-7 days before a meet: practise your openers under meet commands, then go home fresh.",
    "Intermediate to advanced lifters in the final week before a powerlifting meet.",
    ["full-gym", "time-efficient"],
    ["Do this 5-7 days out from the meet. Two or three days later, do an easy session at about 60% for a few crisp triples.",
     "Your opener should be a weight you could triple on a bad day (often about 90% of your best). Practise it with commands: 'squat', 'rack'; 'start', 'press', 'rack'; 'down'.",
     "Take one single at opener weight per lift. If it moves slowly, lower your opener; don't add more attempts.",
     "Rest the 2 days before the meet. Check your kit, weigh-in time and rack heights now."],
    GYM_WU + [E("Squat: warm-ups as on meet day", 1, "5 sets", "bar, 40%, 60%, 75%, 85%"), E("Squat opener (with commands)", 1, "1", "planned opener (~90%)"),
              E("Bench: warm-ups as on meet day", 1, "5 sets", "bar to 85%"), E("Bench opener (paused, with commands)", 1, "1", "planned opener"),
              E("Deadlift: warm-ups as on meet day", 1, "4 sets", "60% to 85%"), E("Deadlift opener", 1, "1", "planned opener")],
    ["gzclp-day-1"])
add("x-gym-somax-powerlifting-mock-meet", "Somax Mock Meet Day", "gym", "advanced", "powerlifting", ["strength", "sport-performance"], 120, 1,
    ["barbell", "squat rack", "bench"],
    "A full practice meet: three attempts on squat, bench and deadlift with meet-style warm-ups, commands and rest, to find your total.",
    "Intermediate to advanced lifters at the end of a training block who want to test their total, or a rehearsal 4-6 weeks before a first meet.",
    ["full-gym"],
    ["Do it after a lighter week, never in the middle of a hard block. Bring a training partner to give commands and judge depth.",
     "Attempt 1 is an easy single (~90%), attempt 2 is about a recent best (~95-100%), and attempt 3 is a small PB attempt only if attempt 2 was quick.",
     "Rest 8-12 minutes between attempts and about 20-30 minutes between lifts. Eat and drink during the session.",
     "Take 3-5 easy days afterwards, then use the numbers to set your next block."],
    [E("Squat warm-ups", 1, "6 sets", "bar, 40%, 55%, 70%, 80%, 87%"), E("Squat attempts", 3, "1", "~90%, ~97%, PB attempt"),
     E("Bench warm-ups", 1, "6 sets", "bar to 87%"), E("Bench attempts (paused)", 3, "1", "~90%, ~97%, PB attempt"),
     E("Deadlift warm-ups", 1, "5 sets", "50% to 87%"), E("Deadlift attempts", 3, "1", "~90%, ~97%, PB attempt")],
    ["x-gym-wendler-monolith-mon"])

# --- Powerlifting deload
add("x-gym-somax-powerlifting-deload", "Somax Powerlifting Deload Session", "gym", "intermediate", "powerlifting", ["strength", "mobility"], 45, 3,
    ["barbell", "squat rack", "bench"],
    "A recovery-week session for powerlifters: the competition lifts at about 60-70% for crisp triples, focused on technique, plus mobility.",
    "Intermediate and advanced powerlifters at the end of a training wave or after a meet.",
    ["full-gym", "time-efficient"],
    ["Use it 2-3 times in a deload week, every 4-6 weeks or straight after a meet.",
     "Triples at 60-70% of your best, moved fast. Film a set of each and look at bar path and depth.",
     "Skip the accessories or keep them very light. Nothing should feel hard.",
     "Start the next wave just above where the last one started."],
    GYM_WU + [E("Competition Squat", 3, "3", "60-70% of best"), E("Paused Bench Press", 3, "3", "60-70% of best"),
              E("Competition Deadlift", 2, "3", "60-70% of best"), E("Hip and thoracic mobility circuit", 1, "8 min")],
    ["gzclp-day-1", "wendler-531-beginners-day-1"])

# --- Bench specialisation (2 sessions)
S = "Somax Bench Press Specialisation"
who = "Intermediate lifters who want to push up their bench press in particular, run alongside a simple leg and back routine."
how = ["Two bench days a week, at least 72 hours apart (e.g. Mon and Thu). Keep your other training easy for 6-8 weeks.",
       "Heavy day: add 2.5kg to the top set when you get all its reps at RPE 8 or lower. Volume day: add a rep per set each week, then reset 2.5kg heavier.",
       "Pause every rep on the chest and keep your shoulder blades pinned. Rest 3 minutes on bench sets.",
       "Every 4th week, halve the bench sets. Shoulder pain means drop the volume, not push through."]
add("x-gym-somax-bench-specialisation-heavy", "Somax Bench Specialisation – Heavy Day", "gym", "intermediate", "powerlifting", ["strength", "muscle"], 55, 2,
    ["barbell", "bench", "dumbbells", "cables"],
    "A heavy top triple and back-offs, then pin presses and triceps.",
    who, ["full-gym"], how,
    GYM_WU + [E("Paused Bench Press – top set", 1, "3", "RPE 8"), E("Paused Bench Press – back-off", 4, "4", "87% of top set"),
              E("Pin Press (just above sticking point)", 3, "3", "RPE 7"), E("Chest-supported Row", 4, "8", R2),
              E("Overhead Cable Triceps Extension", 3, "10-12", R1)],
    ["x-gym-wendler-monolith-wed", "gzclp-day-3"], S, 1, 2)
add("x-gym-somax-bench-specialisation-volume", "Somax Bench Specialisation – Volume Day", "gym", "intermediate", "powerlifting", ["strength", "muscle"], 55, 2,
    ["barbell", "bench", "dumbbells", "pull-up bar"],
    "Moderate bench in sets of 6-8, incline dumbbells, chin-ups and shoulder health work.",
    who, ["full-gym"], how,
    GYM_WU + [E("Bench Press (touch-and-go allowed)", 5, "6-8", "about 72-75% of best"), E("Incline Dumbbell Press", 3, "8-10", R1),
              E("Chin-up", 4, "6-8", R2), E("Dumbbell Lateral Raise", 3, "12-15", R1), E("Band Pull-apart", 3, "20")],
    ["x-gym-wendler-monolith-mon", "metallicdpa-ppl-push-b"], S, 2, 2)

# --- Masters powerlifting (40+) 3-day
S = "Somax Masters Powerlifting (40+)"
who = "Lifters aged about 40 and up, intermediate level, who want to keep getting stronger while respecting slower recovery and older joints."
how = ["Three days a week with at least one rest day between. Only one lift goes heavy each day; the others are moderate.",
       "Heavy lift: one top set at RPE 8 (never above 9), then 2 back-offs. Moderate lifts: RPE 6-7 technique sets.",
       "Warm up longer (10 minutes plus ramp sets). Swap lifts that hurt for friendly variations (box squat, trap bar, floor press).",
       "Deload every 4th week. Sleep, protein and walking are part of the program, not extras."]
add("x-gym-somax-masters-powerlifting-1", "Somax Masters Powerlifting – Day 1 (Squat heavy)", "gym", "intermediate", "powerlifting", ["strength", "mobility"], 65, 3,
    ["barbell", "squat rack", "bench", "dumbbells"],
    "Heavy squat (or box squat), moderate bench, and joint-friendly accessories.",
    who, ["full-gym", "older-adults"], how,
    [E("Warm-up: bike + hip and shoulder mobility", 1, "10 min")] +
    [E("Squat or Box Squat – top set", 1, "3-5", "RPE 8"), E("Squat – back-off", 2, "5", "88% of top set"), E("Bench Press", 3, "5", "RPE 6-7"),
     E("Dumbbell Row", 3, "10/arm", R2), E("Goblet Squat Hold (mobility)", 2, "30s"), E("Suitcase Carry", 2, "30m/side")],
    ["wendler-531-beginners-day-1", "x-gym-strengthlog-full-body-2x-a"], S, 1, 3)
add("x-gym-somax-masters-powerlifting-2", "Somax Masters Powerlifting – Day 2 (Bench heavy)", "gym", "intermediate", "powerlifting", ["strength", "mobility"], 60, 3,
    ["barbell", "bench", "dumbbells", "cables"],
    "Heavy bench (or floor press), light deadlift technique work and upper-back care.",
    who, ["full-gym", "older-adults"], how,
    [E("Warm-up: rower + band shoulder series", 1, "10 min")] +
    [E("Bench Press or Floor Press – top set", 1, "3-5", "RPE 8"), E("Bench – back-off", 2, "6", "88% of top set"),
     E("Trap-bar or Conventional Deadlift", 3, "3", "RPE 6-7"), E("Face Pull", 3, "15"), E("Seated Cable Row", 3, "10", R2),
     E("Dead Bug", 2, "8/side")],
    ["wendler-531-beginners-day-3", "x-gym-strengthlog-full-body-2x-b"], S, 2, 3)
add("x-gym-somax-masters-powerlifting-3", "Somax Masters Powerlifting – Day 3 (Deadlift heavy)", "gym", "intermediate", "powerlifting", ["strength", "mobility"], 60, 3,
    ["barbell", "squat rack", "bench", "dumbbells"],
    "Heavy deadlift (or trap-bar deadlift), moderate squat and bench, and hamstrings.",
    who, ["full-gym", "older-adults"], how,
    [E("Warm-up: bike + hip hinge drills", 1, "10 min")] +
    [E("Deadlift or Trap-bar Deadlift – top set", 1, "3", "RPE 8"), E("Deadlift – back-off", 1, "3", "88% of top set"),
     E("Paused Squat", 3, "3", "RPE 6-7"), E("Paused Bench Press", 3, "3", "RPE 6-7"), E("Dumbbell Romanian Deadlift", 2, "10", R2),
     E("Side Plank", 2, "30s/side")],
    ["wendler-531-beginners-day-2", "x-gym-strengthlog-seniors-gym"], S, 3, 3)

# --- Powerlifting GPP
add("x-gym-somax-powerlifting-gpp", "Somax Powerlifter GPP & Conditioning", "gym", "intermediate", "powerlifting", ["endurance", "general-fitness", "strength"], 30, 2,
    ["sled", "kettlebell", "dumbbells", "bike"],
    "A 30-minute general fitness session for strength athletes: sled work, carries and easy bike intervals to boost recovery and work capacity without hurting your lifting.",
    "Intermediate powerlifters and strength trainees who get puffed between sets or want better recovery between heavy days.",
    ["full-gym", "time-efficient"],
    ["Once or twice a week on non-lifting days, or after an upper-body session. Keep it at 6-7/10 effort.",
     "No muscle soreness allowed: sled and carries have almost no lowering, so they don't eat into recovery.",
     "Progress by adding a sled trip or a minute of bike each week. If tomorrow's lifting suffers, cut it back.",
     "No sled? Do loaded farmer walks and incline walking instead."],
    [E("Sled Push", 6, "20m", "moderate, steady"), E("Farmer Carry", 4, "40m", "heavy, good posture"), E("Kettlebell Swing", 4, "15"),
     E("Bike Intervals", 1, "8 x 30s brisk / 60s easy"), E("Hip and ankle mobility", 1, "5 min")],
    ["x-gym-wendler-monolith-fri", "strongfirst-simple-and-sinister"])

# ######################################################################## CALISTHENICS

# --- First pull-up builder
add("x-gym-somax-first-pull-up-builder", "Somax First Pull-up Builder", "fitness", "beginner", "calisthenics", ["strength", "muscle"], 20, 3,
    ["pull-up bar", "bands"],
    "Dead hangs, scapular pulls, band-assisted pull-ups and slow negatives: a step-by-step path to your first strict pull-up.",
    "Anyone who can't yet do a pull-up (or can do only one) and has a bar at home, at the gym or in the park.",
    ["home", "outdoor", "minimal-equipment", "time-efficient"],
    ["Three times a week on non-consecutive days. Add it to the end of another workout or do it on its own.",
     "Build the dead hang to 30-60 seconds, then add scapular pulls. Negatives: jump to the top and take 5 seconds to lower.",
     "Each week, use a lighter band or add a negative. Test a strict pull-up every 2 weeks; most people get one in 6-12 weeks.",
     "Once you can do 3 strict reps, move on to the BWF Recommended Routine or Somax Park Calisthenics – Intermediate."],
    [E("Warm-up: arm circles + scapular shrugs", 1, "10 each"), E("Dead Hang", 3, "max, build to 30-60s"), E("Scapular Pull-up", 3, "5-10"),
     E("Band-assisted Pull-up", 3, "5-8"), E("Negative Pull-up (5s lowering)", 3, "3"), E("Inverted Row", 2, "8-12"),
     E("Hollow Body Hold", 2, "20-30s")],
    ["bwf-recommended-routine", "x-gym-army-prt-strength-mobility", "x-gym-strengthlog-calisthenics-beginner-1"])

# --- Push-up builder
add("x-gym-somax-push-up-builder", "Somax Push-up Builder", "fitness", "beginner", "calisthenics", ["strength", "muscle", "general-fitness"], 15, 3,
    ["bodyweight"],
    "Incline push-ups, eccentrics and practice sets to go from zero (or a few) to 20 strict push-ups.",
    "Beginners who can't do many full push-ups yet and want a 15-minute routine at home, three times a week.",
    ["home", "minimal-equipment", "time-efficient", "travel"],
    ["Three times a week. Find your level: wall, kitchen bench, low table or floor. Use the lowest height you can do 8 good reps from.",
     "Practice sets: do about 60-70% of your max per set, stopping 1-2 reps short of failure.",
     "When you hit 4 x 12 at one height, go lower. Test your max floor push-ups every 2 weeks.",
     "Keep a straight line from head to heels and elbows at about 45 degrees from your body."],
    [E("Warm-up: wrist circles + arm circles + cat-cow", 1, "1 min each"), E("Incline Push-up (your level)", 4, "60-70% of max"),
     E("Eccentric Floor Push-up (4s lowering)", 3, "3-5"), E("Plank Shoulder Taps", 2, "10/side"), E("Prone Y-raise", 2, "10")],
    ["bwf-recommended-routine", "x-gym-strengthlog-no-equipment-a", "nhs-home-strength-exercises"])

# --- Park calisthenics (beginner & intermediate)
add("x-gym-somax-park-calisthenics-beginner", "Somax Park Calisthenics – Beginner", "fitness", "beginner", "calisthenics", ["strength", "general-fitness"], 35, 3,
    ["pull-up bar", "bench", "bodyweight"],
    "A full-body workout using an outdoor fitness station or playground: bar hangs and rows, bench push-ups, step-ups and lunges.",
    "Beginners who'd rather train outdoors for free. Most local parks and beaches in Australia have a bar and a bench.",
    ["outdoor", "minimal-equipment"],
    ["Three days a week. Bring water and a towel, and check the equipment is dry and solid.",
     "Do the exercises as a circuit (one set of each in a row), rest 90 seconds, and repeat 3 times.",
     "Progress row and push-up angles: lower the body (or the bar) a little each week. Add reps before making it harder.",
     "Sun-smart: train early or late in summer, and wear sunscreen and a hat."],
    [E("Warm-up: brisk walk or easy jog", 1, "5 min"), E("Dead Hang", 3, "20-30s", group="A"), E("Inverted Row (low bar)", 3, "8-12", group="A"),
     E("Incline Push-up on Bench", 3, "8-15", group="A"), E("Step-up onto Bench", 3, "10/leg", group="A"), E("Walking Lunge", 3, "10/leg", group="A"),
     E("Bench Glute Bridge", 3, "12-15", group="A"), E("Plank", 3, "30s", group="A"), STRETCH],
    ["x-gym-strengthlog-calisthenics-beginner-1", "bwf-recommended-routine", "x-gym-army-prt-strength-mobility"])
add("x-gym-somax-park-calisthenics-intermediate", "Somax Park Calisthenics – Intermediate", "fitness", "intermediate", "calisthenics", ["strength", "muscle"], 45, 3,
    ["pull-up bar", "dip bars", "bench"],
    "Pull-ups, dips, archer push-ups, Bulgarian split squats and hanging core work at the outdoor gym.",
    "Intermediate exercisers who can do at least 5 pull-ups and 10 dips and want to keep progressing outdoors.",
    ["outdoor", "minimal-equipment"],
    ["Three days a week, or four alternating with running. Rest 90-120 seconds between sets of the main moves.",
     "Stop 1-2 reps short of failure. When you hit 3 x 12 of a move, use a harder version (e.g. slower pull-ups, archer push-ups).",
     "Short of a dip station? Use parallel bars or a bench (bench dips) and add a pause.",
     "Track your reps. Plateaued for 3 weeks? Take an easy week, then switch to harder versions with fewer reps."],
    CAL_WU + [E("Pull-up", 4, "5-10", R1), E("Parallel Bar Dip", 4, "8-12", R1), E("Archer or Decline Push-up", 3, "6-10/side", R1),
              E("Bulgarian Split Squat on Bench", 3, "10-15/leg", R1), E("Hanging Knee or Leg Raise", 3, "8-12"),
              E("Single-leg Bench Hip Thrust", 3, "12/leg")],
    ["bwf-recommended-routine", "x-gym-army-prt-strength-mobility", "x-gym-strengthlog-calisthenics-beginner-2"])

# --- Intermediate calisthenics PPL (3 sessions)
S = "Somax Calisthenics Push/Pull/Legs"
who = "Intermediate bodyweight trainees (5+ pull-ups, 15+ push-ups) who want a structured split for more muscle and strength, at home or in the park."
how = ["Push, Pull, Legs, rest, repeat (6 days on, 1 off) or once each per week plus skill practice on other days.",
       "Pick the hardest version you can do for the target reps with 1-2 in reserve. Move up a step when you hit the top of the range on all sets.",
       "Legs are the weak spot of most calisthenics plans: don't skip them, and add a backpack load when they get easy.",
       "Every 5th week, halve the sets. Wrists and elbows sore? Do fewer high-rep sets and more slow, controlled reps."]
add("x-gym-somax-calisthenics-ppl-push", "Somax Calisthenics PPL – Push", "fitness", "intermediate", "calisthenics", ["muscle", "strength"], 45, 3,
    ["dip bars", "bodyweight"],
    "Dips, pike push-ups, pseudo-planche push-ups and diamond push-ups.",
    who, ["home", "outdoor", "minimal-equipment"], how,
    CAL_WU + [E("Parallel Bar Dip", 4, "6-12", R1), E("Pike Push-up (feet elevated as you progress)", 4, "6-10", R1),
              E("Pseudo-planche Push-up", 3, "6-10", R1), E("Diamond Push-up", 3, "8-15", R1), E("Support Hold on Bars", 2, "30s")],
    ["bwf-recommended-routine", "x-gym-strengthlog-calisthenics-beginner-2"], S, 1, 3)
add("x-gym-somax-calisthenics-ppl-pull", "Somax Calisthenics PPL – Pull", "fitness", "intermediate", "calisthenics", ["muscle", "strength"], 45, 3,
    ["pull-up bar", "bodyweight"],
    "Pull-ups, chin-ups, inverted rows, tuck front-lever holds and hanging core.",
    who, ["home", "outdoor", "minimal-equipment"], how,
    CAL_WU + [E("Pull-up", 4, "5-10", R1), E("Chin-up (slow 3s lowering)", 3, "5-8", R1), E("Feet-elevated Inverted Row", 3, "8-12", R1),
              E("Tuck Front Lever Hold", 3, "8-15s"), E("Hanging Leg Raise", 3, "8-12"), E("Prone Y-T-W Raise", 2, "8 each")],
    ["bwf-recommended-routine", "x-gym-army-prt-strength-mobility"], S, 2, 3)
add("x-gym-somax-calisthenics-ppl-legs", "Somax Calisthenics PPL – Legs", "fitness", "intermediate", "calisthenics", ["muscle", "strength"], 40, 3,
    ["bodyweight", "bench"],
    "Shrimp or Bulgarian split squats, Nordic or sliding leg curls, single-leg hip thrusts, jumps and calf raises.",
    who, ["home", "outdoor", "minimal-equipment"], how,
    CAL_WU + [E("Bulgarian Split Squat or Shrimp Squat", 4, "8-12/leg", R1), E("Nordic Curl Negative or Sliding Leg Curl", 3, "4-8"),
              E("Single-leg Hip Thrust", 3, "10-15/leg", R1), E("Squat Jump", 3, "6"), E("Single-leg Calf Raise on Step", 3, "12-20/leg"),
              E("Side Plank with Leg Lift", 2, "8/side")],
    ["x-gym-strengthlog-calisthenics-beginner-3", "bwf-recommended-routine"], S, 3, 3)

# --- Pistol squat / leg strength
add("x-gym-somax-pistol-squat-progression", "Somax Pistol Squat Progression", "fitness", "intermediate", "calisthenics", ["strength", "mobility"], 25, 2,
    ["bodyweight", "bench"],
    "Box pistols, assisted pistols, cossack squats and ankle mobility on the way to a full single-leg squat.",
    "Bodyweight trainees with decent squats who want real leg strength without weights, and the balance and mobility that come with it.",
    ["home", "outdoor", "minimal-equipment", "time-efficient"],
    ["Twice a week, after your main workout or on its own.",
     "Start with box pistols to a height you control on the way down. Lower the box a few centimetres each week.",
     "Holding a pole or doorframe for balance is fine early on. A light weight held in front can help you stay balanced.",
     "Knee pain means a higher box or slower lowering. Tight ankles? Raise your heel on a small plate."],
    [E("Ankle Rocks (knee over toes)", 2, "10/side"), E("Cossack Squat", 3, "6/side"), E("Box Pistol (sit to bench)", 3, "5-8/leg"),
     E("Assisted Pistol (hold pole)", 3, "3-6/leg"), E("Pistol Negative (5s lowering)", 2, "3/leg"), E("Single-leg Balance Reach", 2, "6/leg")],
    ["x-gym-strengthlog-calisthenics-beginner-3", "bwf-recommended-routine"])

# --- Skills: handstand & L-sit
add("x-gym-somax-handstand-l-sit-skills", "Somax Handstand & L-sit Skills", "fitness", "intermediate", "calisthenics", ["mobility", "strength", "sport-performance"], 30, 3,
    ["bodyweight", "parallettes or dip bars"],
    "Practice time for two classic skills: wall handstands and L-sits, with wrist prep and compression drills.",
    "Intermediate trainees who can hold a 60-second plank and do 10 push-ups and want their first freestanding handstand and L-sit.",
    ["home", "outdoor", "minimal-equipment"],
    ["Three short sessions a week, before strength work while you're fresh. Treat it as practice: quality holds, never to failure.",
     "Chest-to-wall handstand: build to 60 seconds total, then add kick-ups and toe pulls off the wall.",
     "L-sit: progress foot-supported, then one leg, tuck, one leg straight, then full L. Build to 3 x 15-20 seconds per stage.",
     "Wrists take time: always do the wrist prep, and ease off if they ache for more than a day."],
    [E("Wrist Prep (circles, palm lifts, rocks)", 1, "3 min"), E("Hollow Body Hold", 2, "30s"), E("Chest-to-wall Handstand", 4, "20-45s"),
     E("Wall Toe-pulls / Balance Attempts", 4, "3-5 attempts"), E("L-sit Progression on Bars", 4, "10-20s"),
     E("Seated Pike Leg Lift (compression)", 3, "8-10"), E("Pike Stretch", 1, "60s")],
    ["bwf-recommended-routine"])

# --- Rings foundations
add("x-gym-somax-rings-foundations", "Somax Gymnastic Rings Foundations", "fitness", "intermediate", "calisthenics", ["strength", "muscle"], 45, 3,
    ["rings", "pull-up bar"],
    "Ring support holds, ring rows, ring push-ups, ring dips and false-grip hangs: the base for muscle-ups and stronger shoulders.",
    "Intermediate trainees who own a set of rings (hung from a bar, beam or tree) and want to build stability and pulling and pushing strength.",
    ["home", "outdoor", "minimal-equipment"],
    ["Three times a week. Hang the rings so you can stand under them for rows and reach them from the ground for dips.",
     "Support hold first: 3 x 30 seconds, rings turned out, before you try ring dips.",
     "Make it harder by changing your body angle (rows, push-ups) or the ring height, then by adding reps.",
     "Rings are unstable: go slowly, keep reps clean and stop when your shoulders shake past control."],
    CAL_WU + [E("Ring Support Hold", 3, "15-30s"), E("Ring Row", 3, "8-12", R1), E("Ring Push-up", 3, "6-12", R1),
              E("Ring Dip (band-assisted if needed)", 3, "3-8", R1), E("False-grip Hang", 3, "10-20s"), E("Ring Body Saw or Fallout", 2, "6-10")],
    ["bwf-recommended-routine", "x-gym-army-prt-strength-mobility"])

# --- Weighted calisthenics (advanced) A/B
S = "Somax Weighted Calisthenics"
who = "Advanced calisthenics trainees (12+ pull-ups, 20+ dips) who want maximal upper-body strength using a dip belt or weighted vest."
how = ["Alternate A and B 3-4 times a week. Rest 2-3 minutes on weighted sets and 90 seconds on the rest.",
       "Weighted lifts: a top set of 3-5 at RPE 8, then 2-3 back-off sets at 90%. Add 1.25-2.5kg when the top set moves well.",
       "Keep strict form: full lockout on dips, chin over the bar and a dead hang at the bottom of pull-ups.",
       "Deload every 5th week (bodyweight only, half the sets). Elbow pain? Reduce weighted volume first."]
add("x-gym-somax-weighted-calisthenics-a", "Somax Weighted Calisthenics – A", "fitness", "advanced", "calisthenics", ["strength", "muscle"], 55, 4,
    ["pull-up bar", "dip bars", "dip belt or weight vest", "bodyweight"],
    "Heavy weighted pull-ups and dips, then archer pull-ups and hanging leg raises.",
    who, ["home", "outdoor", "minimal-equipment"], how,
    CAL_WU + [E("Weighted Pull-up – top set", 1, "3-5", "RPE 8"), E("Weighted Pull-up – back-off", 3, "5", "90% of top load"),
              E("Weighted Dip – top set", 1, "3-5", "RPE 8"), E("Weighted Dip – back-off", 3, "6", "90% of top load"),
              E("Archer Pull-up", 3, "3-5/side", R1), E("Toes-to-bar", 3, "8-12")],
    ["bwf-recommended-routine", "x-gym-wendler-monolith-mon"], S, 1, 2)
add("x-gym-somax-weighted-calisthenics-b", "Somax Weighted Calisthenics – B", "fitness", "advanced", "calisthenics", ["strength", "muscle"], 55, 4,
    ["pull-up bar", "dip bars", "dip belt or weight vest", "bodyweight"],
    "Weighted chin-ups and push-ups, front lever work, and weighted pistols or shrimp squats for legs.",
    who, ["home", "outdoor", "minimal-equipment"], how,
    CAL_WU + [E("Weighted Chin-up", 4, "4-6", "RPE 8"), E("Weighted Push-up (vest or plate)", 4, "6-10", R1),
              E("Advanced Tuck or Straddle Front Lever Hold", 4, "8-12s"), E("Weighted Pistol or Shrimp Squat", 3, "5-8/leg", R1),
              E("Dragon Flag Negative", 3, "3-5")],
    ["bwf-recommended-routine"], S, 2, 2)

# --- Calisthenics ladder conditioning (fat loss)
add("x-gym-somax-calisthenics-ladder-conditioning", "Somax Calisthenics Ladder Conditioning", "fitness", "intermediate", "calisthenics",
    ["fat-loss", "endurance", "strength"], 30, 3, ["pull-up bar", "bodyweight"],
    "Pull-up, push-up and squat ladders against the clock: lots of quality reps, a big calorie burn and better work capacity.",
    "Intermediate exercisers who can do a few pull-ups and want a tough 30-minute fat-loss session with just a bar.",
    ["outdoor", "home", "minimal-equipment", "time-efficient"],
    ["Up to three times a week, not on back-to-back days. Keep 1-2 reps in reserve on every rung so form holds up.",
     "Ladder: 1 pull-up, 2 push-ups, 3 squats; then 2-4-6; keep climbing to 5-10-15, then start again at 1 until the 20 minutes are up.",
     "Track total rounds and try to beat it next time. Swap in inverted rows if pull-ups run out.",
     "Fat loss comes mostly from your eating; this session builds fitness and holds muscle."],
    CAL_WU + [E("Ladder: Pull-up 1-5 / Push-up 2-10 / Air Squat 3-15 (20 min AMRAP)", 1, "20 min"),
              E("Finisher: Hollow Hold", 2, "30s"), STRETCH],
    ["x-gym-army-prt-strength-mobility", "seven-minute-workout", "bwf-recommended-routine"])

json.dump(P, open(OUT, "w"), indent=1, ensure_ascii=False)
print(len(P), "Somax programs ->", OUT)
