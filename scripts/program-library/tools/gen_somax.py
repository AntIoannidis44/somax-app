import json, sys

OUT = sys.argv[1]


def E(name, sets, reps, weight=None, distance=None, group=None):
    d = {"name": name, "sets": sets, "reps": str(reps)}
    if weight: d["weight"] = weight
    if distance: d["distance"] = distance
    if group: d["group"] = group
    return d


P = []


def add(id, name, category, level, sport, goals, minutes, dpw, equipment, description, who, lifestyle, how, exercises, basedOn, **kw):
    d = dict(id=id, name=name)
    d.update(kw)
    d.update(category=category, level=level, sport=sport, goals=goals, duration=f"{minutes} min", daysPerWeek=dpw,
             sessionMinutes=minutes, equipment=equipment, description=description, whoItsFor=who, lifestyle=lifestyle,
             howToRun=how, exercises=exercises, credit="Somax", sourceUrl="", sourceNote="Original Somax program.",
             basedOn=basedOn, verified=False)
    P.append(d)


GYM_WU = [E("Warm-up: easy bike or rower", 1, "5 min"), E("Warm-up: bodyweight squats + arm circles", 2, "10")]
HOME_WU = [E("Warm-up: march on the spot", 1, "2 min"), E("Warm-up: arm circles", 1, "10 each way"), E("Warm-up: hip circles", 1, "10 each way")]
RUN_WU = [E("Brisk walk / easy jog", 1, "5 min"), E("Leg swings", 1, "10/leg"), E("Walking lunges", 1, "10")]
RIDE_WU = [E("Easy spin", 1, "10 min", "zone 1-2, 85-95 rpm")]
STRETCH = E("Cool-down stretch (hips, hamstrings, chest)", 1, "5 min")

# ============================================================== GYM / STRENGTH
add("somax-first-steps-full-body", "Somax First Steps Full Body", "gym", "beginner", "strength-training",
    ["general-fitness", "strength", "muscle"], 45, 3, ["machines", "dumbbells", "cables"],
    "A confidence-building full-body session using machines and dumbbells so you can learn the movement patterns before loading a barbell.",
    "Complete beginners in a commercial gym who want a simple plan they can follow without a coach, around a busy week.",
    ["full-gym", "busy"],
    ["Mon/Wed/Fri or any 3 days with a rest day between.",
     "Pick weights that leave 2-3 reps in the tank; when you hit the top of the rep range on every set, go up the next increment.",
     "Rest 60-90s between sets.",
     "After 8-12 weeks, move to Somax Strength Foundations or StrongLifts 5x5."],
    GYM_WU + [E("Leg Press", 3, "10-12"), E("Chest Press Machine", 3, "10-12"), E("Lat Pulldown", 3, "10-12"),
              E("Dumbbell Romanian Deadlift", 3, "10-12"), E("Seated Cable Row", 3, "10-12"),
              E("Dead Bug", 2, "8/side", group="A"), E("Glute Bridge", 2, "12", group="A"), STRETCH],
    ["stronglifts-5x5-workout-a", "rfitness-basic-beginner-a", "nhs-home-strength-exercises"])

add("somax-home-dumbbell-full-body", "Somax Home Dumbbell Full Body", "fitness", "beginner", "strength-training",
    ["muscle", "strength", "general-fitness"], 35, 3, ["dumbbells", "bodyweight"],
    "A full-body muscle-building session with just a pair of dumbbells, paired into supersets to save time.",
    "Beginners training at home with one or two pairs of dumbbells - ideal for parents, shift workers or anyone who can't get to a gym.",
    ["home", "minimal-equipment", "busy", "time-efficient"],
    ["3 days a week, non-consecutive.",
     "Use a weight you can lift for the top of the range with 1-2 reps to spare; add reps first, then weight.",
     "Rest 60s after each superset round.",
     "When the heaviest dumbbells feel light for 15 reps, slow the lowering to 3 seconds or move to a gym plan."],
    HOME_WU + [E("Goblet Squat", 3, "10-15", group="A"), E("Dumbbell Floor Press", 3, "10-15", group="A"),
               E("Dumbbell Romanian Deadlift", 3, "10-15", group="B"), E("One-arm Dumbbell Row", 3, "10/arm", group="B"),
               E("Dumbbell Reverse Lunge", 2, "8/leg", group="C"), E("Dumbbell Shoulder Press (seated)", 2, "10-12", group="C"),
               E("Plank", 2, "30s"), STRETCH],
    ["rfitness-basic-beginner-a", "bwf-recommended-routine"])

add("somax-strength-foundations", "Somax Strength Foundations", "gym", "intermediate", "strength-training",
    ["strength", "muscle"], 60, 3, ["barbell", "squat rack", "dumbbells", "pull-up bar"],
    "A barbell session with one heavy top lift, a lighter second lift and targeted accessories - the bridge from beginner linear progress to wave loading.",
    "Lifters 6-18 months in who have stalled on a beginner 5x5 and can train three times a week around work.",
    ["full-gym", "busy"],
    ["3 days a week; rotate the main lift (squat, bench, deadlift, press) each session.",
     "Work up to a top set of 5 at RPE 8, then 3 back-off sets at 90% of that weight. Add 2.5kg to the top set when it moves well.",
     "Rest 3 min on main lifts, 90s on accessories.",
     "Every 4th week take a lighter deload week."],
    GYM_WU + [E("Back Squat – top set", 1, "5", "RPE 8"), E("Back Squat – back-off", 3, "5", "90% of top set"),
              E("Bench Press", 3, "8", "RPE 7"), E("Chin-up", 3, "6-8", "bodyweight or assisted", group="A"),
              E("Dumbbell Split Squat", 3, "8/leg", group="A"), E("Hanging Knee Raise", 3, "10-12"), STRETCH],
    ["wendler-531-beginners-day-1", "gzclp-day-1", "stronglifts-5x5-workout-a"])

add("somax-upper-builder", "Somax Upper Builder", "gym", "intermediate", "bodybuilding", ["muscle", "strength"], 55, 4,
    ["barbell", "dumbbells", "cables", "bench"],
    "Chest, back, shoulders and arms with a heavier compound start and supersets to finish. Pairs with Somax Lower Builder.",
    "Intermediate gym-goers who want to build muscle on four days a week without spending hours per session.",
    ["full-gym", "time-efficient"],
    ["Upper/Lower/rest/Upper/Lower/rest/rest (e.g. Mon, Tue, Thu, Fri).",
     "Double progression: when all sets hit the top of the rep range, add 2.5kg (or the next dumbbell).",
     "Rest 2 min on the first two lifts, 60-90s on supersets.",
     "After 8-12 weeks, move to a push/pull/legs split for more volume."],
    GYM_WU + [E("Bench Press", 4, "6-8"), E("Chest-supported Row", 4, "8-10"),
              E("Incline Dumbbell Press", 3, "10-12", group="A"), E("Lat Pulldown", 3, "10-12", group="A"),
              E("Lateral Raise", 3, "12-15", group="B"), E("Face Pull", 3, "15", group="B"),
              E("EZ-bar Curl", 2, "10-12", group="C"), E("Triceps Pushdown", 2, "10-12", group="C")],
    ["metallicdpa-ppl-push-a", "metallicdpa-ppl-pull-a"], series="Somax Upper/Lower", day=1, daysInSeries=2)

add("somax-lower-builder", "Somax Lower Builder", "gym", "intermediate", "bodybuilding", ["muscle", "strength"], 55, 4,
    ["barbell", "machines", "dumbbells"],
    "Quads, glutes, hamstrings and calves: a heavy squat, a hinge, then single-leg and machine work.",
    "Intermediate gym-goers on a four-day upper/lower split who want stronger, bigger legs.",
    ["full-gym", "time-efficient"],
    ["Run with Somax Upper Builder: Upper/Lower x2 per week.",
     "Add 2.5-5kg to squat and RDL when you hit the top of the range on all sets.",
     "Rest 2-3 min on squats and RDLs, 60-90s elsewhere.",
     "Deload every 5th-6th week."],
    GYM_WU + [E("Back Squat", 4, "6-8"), E("Romanian Deadlift", 3, "8-10"), E("Bulgarian Split Squat", 3, "8-10/leg"),
              E("Leg Curl", 3, "10-12", group="A"), E("Standing Calf Raise", 3, "12-15", group="A"),
              E("Cable Pallof Press", 2, "10/side"), STRETCH],
    ["metallicdpa-ppl-legs", "wendler-bbb-day-4"], series="Somax Upper/Lower", day=2, daysInSeries=2)

add("somax-heavy-singles-power-day", "Somax Heavy Singles Power Day", "gym", "advanced", "powerlifting", ["strength"], 75, 4,
    ["barbell", "squat rack", "bench", "plates"],
    "A peaking-style day for experienced lifters: a long warm-up ladder, heavy singles, then volume back-offs and minimal accessories.",
    "Advanced lifters (2+ years, solid technique) training for a powerlifting meet or a new max. Needs a proper rack with safeties.",
    ["full-gym"],
    ["Use once a week per main lift within a 4-day plan.",
     "Work up in small jumps to a single at RPE 8-9 - never a grinder. Then 3x3 at ~85% of today's single.",
     "Rest 3-5 min between heavy sets.",
     "Run 3 weeks heavier, then 1 lighter week. Test maxes no more than every 8-12 weeks."],
    [E("Warm-up: bike + hip and thoracic mobility", 1, "8 min"), E("Squat – warm-up ladder", 5, "5, 3, 2, 1, 1", "40-80% 1RM"),
     E("Squat – heavy single", 1, "1", "RPE 8-9 (~90% 1RM)"), E("Squat – back-off", 3, "3", "~85% of today's single"),
     E("Paused Bench Press", 4, "3", "80% 1RM"), E("Barbell Row", 3, "6-8"), E("Ab Wheel Rollout", 3, "8-10")],
    ["gzclp-day-1", "wendler-bbb-day-4"])

add("somax-advanced-push-hypertrophy", "Somax Advanced Push Hypertrophy", "gym", "advanced", "bodybuilding", ["muscle"], 70, 6,
    ["barbell", "dumbbells", "cables", "machines"],
    "High-volume chest, shoulder and triceps work with a drop set and supersets for experienced lifters chasing size.",
    "Advanced lifters running a 6-day push/pull/legs split who recover well and want more volume than a beginner PPL.",
    ["full-gym"],
    ["Use in a PPL-PPL-rest week.",
     "Leave 1-2 reps in reserve on compounds; take isolation work close to failure.",
     "Rest 2-3 min on presses, 60s on isolation and supersets.",
     "Add a set to one exercise every 2 weeks, then deload and reset volume every 6-8 weeks."],
    GYM_WU + [E("Incline Barbell Press", 4, "6-8"), E("Machine Chest Press", 3, "8-10"), E("Seated Dumbbell Shoulder Press", 3, "8-10"),
              E("Cable Fly", 3, "12-15", group="A"), E("Lateral Raise (last set drop set)", 4, "12-15", group="A"),
              E("Weighted Dip", 3, "8-10", group="B"), E("Overhead Cable Triceps Extension", 3, "12-15", group="B")],
    ["metallicdpa-ppl-push-a", "metallicdpa-ppl-push-b"])

add("somax-kettlebell-express", "Somax Kettlebell Express", "fitness", "intermediate", "strength-training",
    ["strength", "fat-loss", "general-fitness"], 25, 3, ["kettlebell"],
    "A 25-minute one-bell session: swing and goblet squat practice, then an EMOM of presses, rows and carries.",
    "Busy people with one kettlebell and the basic swing already learned, training at home or in a hotel.",
    ["home", "minimal-equipment", "time-efficient", "busy", "travel"],
    ["3 non-consecutive days a week.",
     "Pick a bell you can press 5 times per arm with good form.",
     "In the EMOM, start each exercise at the top of the minute and rest for the rest of it.",
     "When the EMOM leaves you 25s+ rest every minute, move to a heavier bell."],
    HOME_WU + [E("Kettlebell Deadlift", 2, "10"), E("Kettlebell Swing", 5, "15"), E("Goblet Squat", 3, "10"),
               E("EMOM: Single-arm Press", 4, "5/arm", group="A"), E("EMOM: Single-arm Row", 4, "8/arm", group="A"),
               E("EMOM: Suitcase Carry", 4, "30s/side", group="A")],
    ["strongfirst-simple-and-sinister", "seven-minute-workout"])

# ============================================================== HIIT / FAT LOSS
add("somax-low-impact-hiit-20", "Somax Low-Impact HIIT 20", "fitness", "beginner", "hiit", ["fat-loss", "general-fitness"], 20, 3,
    ["bodyweight"],
    "A joint-friendly interval session with no jumping: 30 seconds on, 30 seconds off, done quietly in a living room.",
    "Beginners, larger bodies, people with sore knees, and anyone in a flat where jumping isn't an option.",
    ["home", "minimal-equipment", "time-efficient", "busy", "travel"],
    ["3 days a week, non-consecutive.",
     "Work at a 6-7/10 effort; you should be breathing hard but in control.",
     "Rest 30s between moves; 60s between rounds.",
     "Progress to 40s on / 20s off, then to the 7-Minute Workout."],
    HOME_WU + [E(n, 3, "30s", group="A") for n in ["Squat to Calf Raise", "Incline Push-up (on a table)", "Standing Knee Drive (alternating)",
                                                   "Reverse Lunge (alternating)", "Standing Cross-body Punches", "Glute Bridge"]] + [STRETCH],
    ["seven-minute-workout", "nhs-home-strength-exercises"])

add("somax-dumbbell-fat-loss-circuit", "Somax Dumbbell Fat-Loss Circuit", "fitness", "intermediate", "hiit", ["fat-loss", "muscle", "endurance"], 35, 3,
    ["dumbbells"],
    "A full-body dumbbell circuit that keeps your heart rate up while still training every muscle - strength and conditioning in one.",
    "Intermediate exercisers who want to lose fat while keeping muscle, with only 35 minutes and a set of dumbbells.",
    ["home", "minimal-equipment", "time-efficient", "busy"],
    ["3 days a week; walk on rest days for extra activity.",
     "Move straight from one exercise to the next; rest 90s after each round.",
     "Add a 5th round, or go heavier, once 4 rounds feel manageable.",
     "Pair with a modest calorie deficit and enough protein for real fat loss."],
    HOME_WU + [E("Dumbbell Thruster", 4, "10", group="A"), E("Renegade Row", 4, "8/arm", group="A"),
               E("Dumbbell Walking Lunge", 4, "10/leg", group="A"), E("Push-up", 4, "10-15", group="A"),
               E("Dumbbell Swing", 4, "15", group="A"), E("Mountain Climbers", 4, "30s", group="A"), STRETCH],
    ["seven-minute-workout", "nuffield-boxing-conditioning"])

add("somax-advanced-metcon", "Somax Advanced Engine Metcon", "fitness", "advanced", "hiit", ["fat-loss", "endurance", "general-fitness"], 40, 2,
    ["rower", "kettlebell", "pull-up bar", "box"],
    "A demanding conditioning session: rower sprints followed by a 20-minute AMRAP of kettlebell and gymnastics work.",
    "Very fit people with solid technique on swings, pull-ups and box jumps who want maximum conditioning in under an hour.",
    ["full-gym"],
    ["No more than 2 times a week, at least 48h apart.",
     "Row intervals at near-max effort; the AMRAP at a pace you can hold for the full 20 minutes.",
     "Rest 90s between row sprints.",
     "Track rounds completed and try to beat it in 3-4 weeks."],
    GYM_WU + [E("Row sprint (90s rest)", 6, "1", "max effort", distance="250m"),
              E("AMRAP 20 min: Kettlebell Swing", 1, "15", "24kg men / 16kg women", group="A"),
              E("AMRAP 20 min: Pull-up", 1, "10", group="A"), E("AMRAP 20 min: Box Jump (step down)", 1, "10", group="A"),
              E("AMRAP 20 min: Burpee", 1, "10", group="A"), STRETCH],
    ["hyrox-race-simulation", "ntnu-4x4-intervals", "seven-minute-workout"])

add("somax-bodyweight-starter-20", "Somax Bodyweight Starter 20", "fitness", "beginner", "calisthenics", ["general-fitness", "strength"], 20, 3,
    ["bodyweight", "chair"],
    "A 20-minute no-equipment session that teaches the basic squat, push, hinge and plank patterns.",
    "Complete beginners and returning exercisers who want to start at home with nothing but a chair.",
    ["home", "minimal-equipment", "time-efficient", "busy", "travel"],
    ["3 days a week, e.g. Mon/Wed/Fri.",
     "Add 2 reps per set each week until you reach 15, then move to the harder version (e.g. floor push-ups).",
     "Rest 45-60s between rounds.",
     "When everything feels easy at 15 reps, move on to the r/bodyweightfitness Recommended Routine."],
    HOME_WU + [E("Chair Squat", 3, "10", group="A"), E("Incline Push-up (hands on chair)", 3, "8", group="A"),
               E("Glute Bridge", 3, "12", group="A"), E("Bird Dog", 3, "6/side", group="A"), E("Plank (knees allowed)", 3, "20s", group="A"), STRETCH],
    ["nhs-home-strength-exercises", "bwf-recommended-routine", "seven-minute-workout"])

# ============================================================== CALISTHENICS
add("somax-calisthenics-skill-strength", "Somax Calisthenics Skill & Strength", "fitness", "intermediate", "calisthenics",
    ["strength", "muscle"], 55, 3, ["pull-up bar", "parallettes or dip bars", "bodyweight"],
    "Skill practice (handstand and L-sit) while fresh, then harder strength pairs: pull-ups, dips, pistol progressions and core.",
    "Intermediate bodyweight trainees who can do at least 5 pull-ups and 10 push-ups and want to work toward skills. Great for park or home training.",
    ["home", "outdoor", "minimal-equipment"],
    ["3 days a week with rest days between.",
     "Skill work: short, perfect holds - stop before form breaks.",
     "Strength pairs: when you hit 3x8, add weight or move to a harder progression.",
     "Rest 90s between paired exercises."],
    [E("Wrist & shoulder prep", 1, "5 min"), E("Wall Handstand Hold (chest to wall)", 4, "20-30s"), E("L-sit (tuck if needed)", 4, "10-15s"),
     E("Pull-up", 3, "5-8", group="A"), E("Assisted Pistol Squat", 3, "5-8/leg", group="A"),
     E("Parallel Bar Dip", 3, "6-10", group="B"), E("Nordic Curl (eccentric)", 3, "3-5", group="B"),
     E("Archer Push-up", 3, "5/side", group="C"), E("Hanging Leg Raise", 3, "8-10", group="C")],
    ["bwf-recommended-routine"])

add("somax-advanced-calisthenics", "Somax Advanced Calisthenics Strength", "fitness", "advanced", "calisthenics",
    ["strength", "muscle", "sport-performance"], 70, 4, ["pull-up bar", "rings", "dip belt"],
    "Weighted pull-ups and dips, front-lever and planche progressions, and unilateral leg strength for very experienced athletes.",
    "Advanced calisthenics athletes (15+ pull-ups, 20+ dips) who train skills seriously and want structured strength work.",
    ["minimal-equipment", "outdoor"],
    ["4 days a week (upper/lower or two full-body pairs).",
     "Weighted work at RPE 8; add 1-2.5kg when all sets hit the top of the range.",
     "Rest 2-3 minutes between heavy sets; skills before strength.",
     "Deload every 5th week; retest max holds every 6-8 weeks."],
    [E("Wrist, shoulder & scapular prep", 1, "8 min"), E("Front Lever progression hold", 5, "8-10s"), E("Planche Lean / Tuck Planche", 5, "8-10s"),
     E("Weighted Pull-up", 4, "4-6", "RPE 8"), E("Weighted Ring Dip", 4, "5-8", "RPE 8"), E("Pistol Squat", 3, "5-6/leg"),
     E("Ring Row (feet elevated)", 3, "10-12", group="A"), E("Dragon Flag negative", 3, "4-6", group="A")],
    ["bwf-recommended-routine"])

# ============================================================== RUNNING / WALKING
add("somax-easy-run-strides", "Somax Easy Run & Strides", "run", "beginner", "running", ["endurance", "general-fitness"], 35, 3, ["bodyweight"],
    "A relaxed conversational run with short, fast strides at the end to build easy speed and good form.",
    "New runners who can already run 20-30 minutes non-stop (e.g. Couch to 5K graduates).",
    ["outdoor", "minimal-equipment", "busy"],
    ["3 runs a week; keep at least 2 of them fully easy.",
     "Easy = you can talk in full sentences.",
     "Strides: 20s quick but relaxed, walk back to recover.",
     "Add 5 minutes to one run per week, no more than ~10% total weekly increase."],
    RUN_WU + [E("Easy run", 1, "25 min", "conversational pace"), E("Strides", 4, "20s", "fast, relaxed"), E("Walk cool-down", 1, "5 min")],
    ["nhs-couch-to-5k-week-9", "ntnu-4x4-intervals"])

add("somax-tempo-run", "Somax Tempo Run", "run", "intermediate", "running", ["endurance", "sport-performance"], 45, 1, ["bodyweight"],
    "A sustained 'comfortably hard' run that lifts your lactate threshold - the key session for faster 5K-half marathon times.",
    "Runners covering 20+ km a week who want to race faster.",
    ["outdoor", "minimal-equipment"],
    ["Once a week, with easy runs either side.",
     "Tempo pace: around your 10K-to-half-marathon pace, 7/10 effort - you can speak a few words only.",
     "Build from 2x8 min to 2x12 min or 20-25 min continuous over 6-8 weeks.",
     "Don't race the tempo; finishing feeling you could do more is right."],
    RUN_WU + [E("Easy jog", 1, "10 min"), E("Tempo", 2, "10 min", "comfortably hard, 7/10", group="A"),
              E("Easy jog recovery", 2, "2 min", group="A"), E("Easy jog cool-down", 1, "8 min")],
    ["ntnu-4x4-intervals", "nhs-couch-to-5k-week-9"])

add("somax-track-800s", "Somax Track 800s", "run", "advanced", "running", ["endurance", "sport-performance"], 60, 1, ["track or measured route"],
    "Classic VO2max intervals: six 800m repeats at around 5K race pace with equal-time jog recoveries.",
    "Experienced runners (30+ km/week, consistent for a year) training for 5K-10K races.",
    ["outdoor"],
    ["Once a week; never on back-to-back days with another hard session.",
     "Run each rep at 5K race pace; the last rep should match the first.",
     "Jog 400m (or 2-3 min) between reps.",
     "Progress to 8x800m, then to 5x1000m."],
    RUN_WU + [E("Easy jog", 1, "15 min"), E("Drills: A-skips, high knees, butt kicks", 2, "20m each"),
              E("800m rep", 6, "1", "5K race pace", distance="800m", group="A"), E("Recovery jog", 6, "1", distance="400m", group="A"),
              E("Easy jog cool-down", 1, "10 min")],
    ["ntnu-4x4-intervals"])

add("somax-runners-strength", "Somax Runner's Strength", "gym", "intermediate", "running", ["sport-performance", "strength"], 40, 2,
    ["dumbbells", "bodyweight", "step or box"],
    "Single-leg strength, calf and hip work and a little plyometrics to make runners more resilient and economical.",
    "Runners of any distance who currently do no strength work, training at home or in a gym twice a week.",
    ["home", "minimal-equipment", "time-efficient"],
    ["2 sessions a week, ideally on easy-run days (after the run) - not before a key workout.",
     "Use dumbbells that make the last 2 reps hard; add weight when all reps are smooth.",
     "Rest 60-90s.",
     "Reduce to 1 session a week in the last 10 days before a race."],
    HOME_WU + [E("Pogo Hops", 3, "20"), E("Rear-foot Elevated Split Squat", 3, "8/leg"), E("Single-leg Romanian Deadlift", 3, "8/leg"),
               E("Step-up", 3, "10/leg", group="A"), E("Single-leg Calf Raise (bent & straight knee)", 3, "12/leg", group="A"),
               E("Side Plank with Leg Lift", 3, "8/side", group="B"), E("Copenhagen Plank (short lever)", 3, "15s/side", group="B")],
    ["bwf-recommended-routine", "fifa-11-plus-warm-up"])

add("somax-brisk-walk-hills", "Somax Brisk Walk & Hills", "walk", "beginner", "general", ["fat-loss", "general-fitness", "endurance"], 35, 4,
    ["bodyweight"],
    "A brisk walk with short uphill or fast-pace intervals to raise your heart rate without running.",
    "Beginners, older adults, and anyone who prefers walking to running and wants more from their daily walk.",
    ["outdoor", "older-adults", "minimal-equipment", "busy"],
    ["4-5 days a week; this is the hard walk - make the other walks easy.",
     "Push sections: walk fast or uphill until slightly breathless but able to talk.",
     "Add one push interval per week up to 8.",
     "Once 8 intervals are easy, try Couch to 5K."],
    [E("Easy walk warm-up", 1, "5 min"), E("Brisk / uphill walk", 6, "2 min", "breathless but can talk", group="A"),
     E("Easy walk recovery", 6, "2 min", group="A"), E("Easy walk cool-down", 1, "5 min"), E("Calf & hip flexor stretch", 1, "30s/side")],
    ["nhs-wirral-walking-plan-medium-walk", "nhs-couch-to-5k-week-1"])

# ============================================================== CYCLING / SWIM
add("somax-indoor-ride-endurance", "Somax Indoor Endurance Ride", "ride", "beginner", "cycling", ["endurance", "fat-loss"], 45, 3,
    ["bike", "turbo trainer or static bike"],
    "A steady zone-2 ride with gentle cadence drills - builds the aerobic base everything else sits on.",
    "New cyclists, gym exercise-bike users, and anyone who wants low-impact cardio at home.",
    ["home", "minimal-equipment", "busy"],
    ["2-4 times a week.",
     "Zone 2: you can hold a conversation; nose breathing is a good check.",
     "Add 5-10 minutes per week to the steady block.",
     "When 60 minutes is comfortable, add British Cycling's 20-min warm-up efforts or the 2x20 session."],
    RIDE_WU + [E("Steady zone 2", 1, "15 min", "conversational"), E("High-cadence spin-up", 3, "1 min", "100-110 rpm", group="A"),
               E("Easy spin", 3, "2 min", "85-90 rpm", group="A"), E("Easy cool-down", 1, "5 min")],
    ["british-cycling-20-min-warm-up"])

add("somax-cycling-vo2-intervals", "Somax Cycling VO2 Intervals", "ride", "advanced", "cycling", ["endurance", "sport-performance"], 60, 1,
    ["bike", "turbo trainer", "power meter or HR monitor"],
    "Five hard 4-minute efforts just above threshold to push your aerobic ceiling, for riders who already train with power or heart rate.",
    "Experienced cyclists training for racing, crits or hilly sportives, who know their FTP or max HR.",
    ["home"],
    ["Once a week in build phases; never two days in a row.",
     "Efforts at 106-120% FTP (or 90-95% max HR); recover at under 55% FTP.",
     "If you can't hold power on the 4th rep, stop the session there.",
     "Progress from 4x4 to 5x5 minutes over 6 weeks."],
    [E("British Cycling 20-min warm-up", 1, "20 min"), E("VO2 effort", 5, "4 min", "106-120% FTP", group="A"),
     E("Recovery spin", 5, "4 min", "<55% FTP", group="A"), E("Easy cool-down", 1, "5 min")],
    ["british-cycling-2x20-sweet-spot", "british-cycling-20-min-warm-up", "ntnu-4x4-intervals"])

add("somax-swim-confidence", "Somax Swim Confidence Builder", "swim", "beginner", "swimming", ["endurance", "general-fitness"], 30, 2,
    ["pool", "kickboard"],
    "Short lengths with plenty of rest, kick and breathing drills to build comfort in the water.",
    "Adults who can swim a length but get out of breath quickly, or are returning to swimming after years away.",
    ["time-efficient", "busy"],
    ["2 swims a week.",
     "Rest 20-30s (or as long as you need) after each length.",
     "Breathe out steadily underwater; turn the head to breathe rather than lifting it.",
     "When you can do 4x50 with 20s rest, move to the USMS Quick Hit."],
    [E("Easy swim (any stroke)", 4, "1", "rest 30s", distance="25m"), E("Kick with board", 4, "1", "rest 30s", distance="25m"),
     E("Bubble-breathing drill at the wall", 3, "10 breaths"), E("Freestyle, breathe every 2-3 strokes", 6, "1", "rest 20-30s", distance="25m"),
     E("Backstroke easy", 2, "1", distance="25m")],
    ["usms-beginner-breathe-swim", "usms-technique-tune-up-swim"])

add("somax-swim-endurance-builder", "Somax Swim Endurance Builder", "swim", "intermediate", "swimming", ["endurance", "fat-loss"], 45, 3,
    ["pool", "pull buoy"],
    "A 2,000m aerobic session with a descending main set and pull work for steady endurance.",
    "Swimmers comfortable with 1,000m+ continuous freestyle, including triathletes in base training.",
    ["time-efficient"],
    ["2-3 swims a week.",
     "Main set: hold an even pace; descend effort 1-3 within each round.",
     "Rest 15-20s between 100s.",
     "Shorten rest by 5s every two weeks, then add a round."],
    [E("Warm-up – choice, easy", 1, "1", distance="300m"), E("Drill/swim by 25", 4, "1", "rest 15s", distance="50m"),
     E("Freestyle, descend 1-3", 3, "3", "rest 20s", distance="100m", group="A"), E("Easy backstroke", 3, "1", distance="50m", group="A"),
     E("Pull with buoy, steady", 4, "1", "rest 20s", distance="100m"), E("Cool-down – easy", 1, "1", distance="200m")],
    ["usms-quick-hit-swim", "usms-beginner-breathe-swim"])

# ============================================================== SPORT SPECIFIC
add("somax-footballers-speed-power", "Somax Footballer's Speed & Power", "other", "intermediate", "football", ["sport-performance", "strength"], 50, 2,
    ["cones", "dumbbells", "bodyweight"],
    "Acceleration, change of direction and lower-body power, built on a FIFA 11+-style warm-up to keep hamstrings and knees healthy.",
    "Amateur and youth footballers (14+) who want to be quicker over the first 10 metres and stronger in duels, off a pitch or field.",
    ["outdoor", "minimal-equipment"],
    ["2 sessions a week in-season, not within 48h before a match.",
     "Sprints are maximal with full recovery (walk back + 60s); stop if speed drops.",
     "Land jumps softly with knees tracking over toes.",
     "In pre-season, add a third session and increase sprint reps by 2."],
    [E("FIFA 11+ Part 1 running drills", 1, "8 min"), E("Nordic Hamstring Curl", 3, "4-6"), E("Broad Jump (stick the landing)", 4, "3"),
     E("10m Acceleration Sprint", 6, "1", "max", distance="10m"), E("5-10-5 Pro Agility", 4, "1", "max"),
     E("Dumbbell Split Squat", 3, "6/leg", group="A"), E("Lateral Bound (stick)", 3, "5/side", group="A"),
     E("Copenhagen Plank", 2, "20s/side"), STRETCH],
    ["fifa-11-plus-warm-up"])

add("somax-basketball-jump-agility", "Somax Basketball Jump & Agility", "other", "intermediate", "basketball", ["sport-performance", "strength"], 45, 2,
    ["dumbbells", "box", "cones"],
    "Vertical jump, landing mechanics, lateral quickness and ankle-knee resilience for hoopers.",
    "Teen and adult basketball players who want to jump higher and move better laterally, training around team practice.",
    ["minimal-equipment"],
    ["2 sessions a week, away from the day before games.",
     "Keep jump reps low and every rep explosive; rest 60-90s between jump sets.",
     "Add load to squats/RDLs when all reps are crisp.",
     "Taper to one lighter session in heavy game weeks."],
    [E("Dynamic warm-up: skips, lateral shuffles, leg swings", 1, "8 min"), E("Drop Landing (from low box)", 3, "5"),
     E("Box Jump (step down)", 4, "4"), E("Lateral Shuffle to Sprint", 4, "1", distance="10m"),
     E("Goblet Squat", 3, "8", group="A"), E("Single-leg Romanian Deadlift", 3, "8/leg", group="A"),
     E("Single-leg Calf Raise", 3, "12/leg", group="B"), E("Pallof Press", 3, "10/side", group="B")],
    ["fifa-11-plus-warm-up", "usta-dynamic-warm-up"])

add("somax-tennis-footwork-rotation", "Somax Tennis Footwork & Rotational Power", "other", "intermediate", "tennis", ["sport-performance", "mobility"], 45, 2,
    ["medicine ball", "bands", "cones"],
    "Split-step footwork, rotational med-ball power and shoulder care to support faster movement and stronger groundstrokes.",
    "Club and junior tennis players who want better court speed and fewer shoulder issues, training twice a week alongside hitting.",
    ["outdoor", "minimal-equipment"],
    ["2 sessions a week, ideally after a hitting session or on non-match days.",
     "Med-ball throws: maximum intent, full rest between sets.",
     "Shoulder band work is light - it should never cause pain.",
     "Before tournaments, keep only the warm-up and band work."],
    [E("USTA-style dynamic warm-up", 1, "10 min"), E("Split-step to First Step (react to call)", 5, "4"),
     E("Spider Drill (5 cones)", 4, "1"), E("Rotational Med Ball Throw (side to wall)", 4, "5/side"),
     E("Med Ball Overhead Slam", 3, "6"), E("Band External Rotation", 3, "12/arm", group="A"),
     E("Band Y-T-W Raise", 3, "8 each", group="A"), E("Lateral Lunge", 3, "8/side"), STRETCH],
    ["usta-dynamic-warm-up"])

add("somax-boxing-conditioning", "Somax Boxing Conditioning", "fitness", "intermediate", "boxing", ["fat-loss", "endurance", "sport-performance"], 45, 3,
    ["jump rope", "heavy bag", "bodyweight"],
    "Boxing-round conditioning: skipping, heavy-bag combinations and bodyweight finishers on a 3-minute work, 1-minute rest clock.",
    "People who train boxing or want boxing-style fitness, with access to a bag (gym or garage).",
    ["full-gym"],
    ["3 times a week, non-consecutive.",
     "Keep hands up and breathe out on every punch; quality beats volume.",
     "Rounds: 3 min on, 1 min off; drop to 2 min rounds if you're new.",
     "Add a bag round every 2 weeks up to 8."],
    [E("Jump Rope", 2, "3 min"), E("Shadow Boxing (footwork + jab-cross)", 2, "3 min"),
     E("Heavy Bag: jab-cross-hook combos", 4, "3 min"), E("Heavy Bag: 30s all-out flurries", 1, "3 min"),
     E("Push-up", 3, "12", group="A"), E("Squat Jump", 3, "12", group="A"), E("Russian Twist", 3, "20", group="A"), STRETCH],
    ["expertboxing-basic-routine", "nuffield-boxing-conditioning"])

add("somax-shadow-boxing-starter", "Somax Shadow Boxing Starter", "fitness", "beginner", "boxing", ["fat-loss", "general-fitness"], 25, 3,
    ["bodyweight"],
    "Learn stance, guard and basic punches through 2-minute shadow-boxing rounds with simple bodyweight moves between.",
    "Beginners who want fun cardio at home with no equipment, including those curious about starting boxing.",
    ["home", "minimal-equipment", "time-efficient", "busy", "travel"],
    ["3 times a week.",
     "2-minute rounds, 1 minute rest; stay light on your feet.",
     "Punch at speed but never lock the elbows.",
     "When 6 rounds feel easy, move to 3-minute rounds or Somax Boxing Conditioning."],
    HOME_WU + [E("Shadow box: stance & footwork", 1, "2 min"), E("Shadow box: jab-cross", 2, "2 min"),
               E("Shadow box: jab-cross-hook", 2, "2 min"), E("Shadow box: freestyle with slips", 1, "2 min"),
               E("Squat", 2, "15", group="A"), E("Plank", 2, "30s", group="A"), STRETCH],
    ["expertboxing-basic-routine", "nuffield-boxing-conditioning"])

add("somax-golf-mobility-rotation", "Somax Golf Mobility & Rotation", "other", "beginner", "golf", ["mobility", "sport-performance"], 25, 2,
    ["bands", "mat", "golf club"],
    "Hip and thoracic mobility plus rotational strength so you can turn more freely and swing with less strain on your lower back.",
    "Golfers of all ages - including older players - who feel stiff in the swing, training at home twice a week.",
    ["home", "older-adults", "minimal-equipment", "time-efficient"],
    ["2 sessions a week at home; do the 5-minute warm-up before every round.",
     "Move into stretches slowly and breathe; hold end range 2 seconds on rotations.",
     "Add band resistance once the movements feel easy.",
     "Pain in the lower back means reduce range and seek advice."],
    [E("Cat-Cow", 1, "8"), E("Open Book (side-lying T-spine rotation)", 2, "8/side"), E("90/90 Hip Switches", 2, "8/side"),
     E("Half-kneeling Hip Flexor Stretch", 2, "30s/side"), E("Glute Bridge", 3, "12", group="A"),
     E("Half-kneeling Band Chop", 3, "10/side", group="A"), E("Pallof Press", 3, "10/side", group="B"),
     E("Club-across-shoulders Trunk Turns", 2, "10/side", group="B")],
    ["golfshake-5-minute-golf-warm-up", "sun-salutation-flow"])

# ============================================================== HYBRID
add("somax-hybrid-starter", "Somax Hybrid Starter", "fitness", "beginner", "hybrid", ["general-fitness", "endurance", "strength"], 40, 2,
    ["rower or bike", "dumbbells", "kettlebell"],
    "A taste of hybrid racing: short run or erg intervals alternating with simple strength stations.",
    "Gym-goers curious about HYROX-style events who can jog 15-20 minutes and want an approachable first step.",
    ["full-gym", "time-efficient"],
    ["2 times a week alongside normal training.",
     "Run/erg at a steady 6/10 effort; stations controlled, not rushed.",
     "Rest 1 minute between rounds.",
     "After 6 weeks, add a 4th round and move toward Somax Hybrid Race Prep."],
    GYM_WU + [E("Run or row", 3, "1", "steady 6/10", distance="400m", group="A"), E("Goblet Squat", 3, "12", group="A"),
              E("Farmer's Carry", 3, "1", "moderate dumbbells", distance="40m", group="A"), E("Wall Ball or DB Thruster", 3, "10", group="A"), STRETCH],
    ["hyrox-race-simulation", "ntnu-4x4-intervals"])

add("somax-hybrid-race-prep", "Somax Hybrid Race Prep", "fitness", "advanced", "hybrid", ["endurance", "sport-performance", "general-fitness"], 70, 1,
    ["ski erg", "rower", "sled", "kettlebell", "sandbag", "wall ball"],
    "Race-pace compromised running: 1km repeats straight off the hardest HYROX stations to train running on tired legs.",
    "Experienced hybrid athletes 6-12 weeks out from a HYROX-style race.",
    ["full-gym"],
    ["Once a week; the other sessions should be easy runs and strength.",
     "Run at goal race pace; stations at race standard.",
     "Rest 2 minutes between rounds.",
     "Do the full race simulation 3-4 weeks before race day, then taper."],
    GYM_WU + [E("Run", 4, "1", "goal race pace", distance="1km", group="A"),
              E("Rotating station: sled push / burpee broad jump / sandbag lunge / wall balls", 4, "1", "race standard", group="A"),
              E("SkiErg", 1, "1", "steady", distance="1000m"), STRETCH],
    ["hyrox-race-simulation"])

# ============================================================== PILATES / MOBILITY
add("somax-pilates-core-foundations", "Somax Pilates Core Foundations", "fitness", "beginner", "pilates", ["mobility", "general-fitness"], 30, 3,
    ["mat"],
    "Beginner-friendly mat Pilates with modified versions of the classical exercises: breathing, pelvic control and gentle core work.",
    "Pilates newcomers, desk workers with stiff backs and older adults who want controlled core work at home.",
    ["home", "older-adults", "minimal-equipment", "time-efficient"],
    ["3 times a week.",
     "Move slowly; keep the lower back gently in contact with the mat during abdominal work.",
     "Add 2 reps per exercise every couple of weeks.",
     "When these feel easy, move to the Classical Mat Pilates First Fifteen."],
    [E("Diaphragmatic breathing", 1, "10 breaths"), E("Pelvic Tilts", 1, "10"), E("Hundred (knees bent, feet down)", 1, "50 beats"),
     E("Half Roll Down", 1, "6"), E("Single Leg Circles (bent knee)", 1, "5 each way/leg"), E("Single Leg Stretch (head down)", 1, "10 changes"),
     E("Bridge with spinal roll", 1, "8"), E("Side-lying Clam", 1, "10/side"), E("Swimming prep (opposite arm/leg)", 1, "8/side"),
     E("Child's Pose", 1, "45s")],
    ["classical-mat-pilates-first-fifteen", "nhs-flexibility-exercises"])

add("somax-mobility-reset-15", "Somax Mobility Reset 15", "other", "beginner", "yoga-mobility", ["mobility", "general-fitness"], 15, 5,
    ["mat"],
    "A daily 15-minute routine for hips, spine and shoulders - perfect after a day at a desk or as a rest-day session.",
    "Anyone stiff from sitting, travelling or training - busy people, older adults and lifters on rest days.",
    ["home", "travel", "older-adults", "minimal-equipment", "time-efficient", "busy"],
    ["Daily or on rest days.",
     "Hold each stretch with slow nasal breathing; ease off if anything pinches.",
     "Gradually increase holds from 30s to 60s.",
     "Combine with the Sun Salutation for a longer flow."],
    [E("Cat-Cow", 1, "10"), E("World's Greatest Stretch", 1, "5/side"), E("90/90 Hip Switches", 1, "8/side"),
     E("Thread the Needle", 1, "6/side"), E("Deep Squat Hold (hold support)", 2, "30s"), E("Half-kneeling Hip Flexor Stretch", 1, "45s/side"),
     E("Downward Dog with calf pedal", 1, "45s"), E("Doorway Chest Stretch", 1, "30s/side")],
    ["nhs-flexibility-exercises", "sun-salutation-flow"])

add("somax-deep-flexibility-flow", "Somax Deep Flexibility Flow", "other", "advanced", "yoga-mobility", ["mobility", "sport-performance"], 45, 3,
    ["mat", "yoga blocks", "bands"],
    "End-range strength and long holds for splits, pancake and overhead mobility - flexibility you can actually use.",
    "Experienced trainees, martial artists, dancers and climbers who already stretch regularly and want advanced flexibility.",
    ["home", "minimal-equipment"],
    ["3 times a week, not before heavy leg training.",
     "Active end-range work: contract at the end of the stretch for 5-10s, then relax deeper.",
     "Never force range; aim for a 6/10 stretch intensity.",
     "Track range monthly (e.g. hands-to-floor in pancake)."],
    [E("Sun Salutation flow", 3, "1 round"), E("Jefferson Curl (light)", 3, "8", "2-5kg"), E("Pancake with PNF contract-relax", 3, "60s"),
     E("Front Split (blocks) with contract-relax", 3, "60s/side"), E("Cossack Squat", 3, "6/side"),
     E("Elevated Pigeon", 2, "60s/side"), E("Band Shoulder Dislocates", 3, "10"), E("Bridge (wheel) or Wall Walks", 3, "20s")],
    ["sun-salutation-flow", "nhs-flexibility-exercises", "classical-mat-pilates-first-fifteen"])

# ============================================================== OLDER ADULTS / TRAVEL
add("somax-strong-and-steady", "Somax Strong & Steady", "fitness", "beginner", "general", ["strength", "mobility", "general-fitness"], 25, 2,
    ["chair", "light dumbbells", "bands"],
    "Strength and balance for everyday life: sit-to-stands, step-ups, rows and balance holds with a chair for support.",
    "Older adults and people new to exercise who want to stay strong, steady on their feet and independent.",
    ["home", "older-adults", "minimal-equipment", "time-efficient"],
    ["2-3 times a week on non-consecutive days.",
     "Hold a chair or counter for balance work; progress by lightly touching, then letting go.",
     "Build to 12-15 reps before adding a band or heavier weight.",
     "Stop and seek advice if you feel dizzy or have chest pain."],
    [E("Marching on the spot", 1, "2 min"), E("Sit-to-Stand", 2, "8-12"), E("Step-up to low step (hold rail)", 2, "8/leg"),
     E("Band Row", 2, "10-12"), E("Wall Press-up", 2, "8-12"), E("Single-leg Stand (hold chair)", 2, "20s/leg"),
     E("Heel-to-Toe Walk", 2, "10 steps"), E("Seated Calf & Hamstring Stretch", 1, "30s/side")],
    ["nhs-home-strength-exercises", "nhs-flexibility-exercises"])

add("somax-hotel-room-full-body", "Somax Hotel Room Full Body", "fitness", "intermediate", "general", ["general-fitness", "muscle", "fat-loss"], 30, 3,
    ["bodyweight", "chair"],
    "A no-equipment workout that fits a hotel room: slow-tempo strength supersets and a short finisher.",
    "Frequent travellers and busy professionals who want to keep training on the road with nothing but the floor and a chair.",
    ["travel", "home", "minimal-equipment", "time-efficient", "busy"],
    ["Use 2-3 times a week while travelling.",
     "Use a 3-second lowering phase to make bodyweight harder.",
     "Rest 60s after each superset.",
     "Back home, return to your normal gym plan - this keeps your fitness ticking over."],
    HOME_WU + [E("Tempo Bulgarian Split Squat (rear foot on bed/chair)", 3, "10/leg", group="A"),
               E("Tempo Push-up", 3, "10-15", group="A"), E("Single-leg Hip Thrust (shoulders on bed)", 3, "12/leg", group="B"),
               E("Chair Dip", 3, "12", group="B"), E("Finisher: Burpee", 3, "10", group="C"), E("Finisher: Hollow Hold", 3, "20s", group="C"), STRETCH],
    ["seven-minute-workout", "bwf-recommended-routine"])

json.dump(P, open(OUT, "w"), indent=2, ensure_ascii=False)
print(len(P), "somax programs")
