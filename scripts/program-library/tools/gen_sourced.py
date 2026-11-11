import json, sys

OUT = sys.argv[1]


def E(name, sets, reps, weight=None, distance=None, group=None):
    d = {"name": name, "sets": sets, "reps": str(reps)}
    if weight: d["weight"] = weight
    if distance: d["distance"] = distance
    if group: d["group"] = group
    return d


P = []


def add(**kw):
    kw.setdefault("verified", True)
    P.append(kw)


# ---------------------------------------------------------------- StrongLifts
SL_URL = "https://stronglifts.com/stronglifts-5x5/workout-program/"
SL_CREDIT = "Mehdi Hadim (StrongLifts)"
SL_NOTE = "Free program publicly posted on stronglifts.com (© Stronglifts™). Only sets/reps/exercise structure recorded; StrongLifts is a trademark, so keep the credit and link out for full guidance."
add(id="stronglifts-5x5-workout-a", name="StrongLifts 5x5 – Workout A", series="StrongLifts 5x5", day=1, daysInSeries=2,
    category="gym", level="beginner", sport="strength-training", goals=["strength", "muscle"], duration="45 min", daysPerWeek=3,
    equipment=["barbell", "bench", "squat rack"],
    description="Three big barbell lifts for five heavy sets of five, alternated with Workout B three times a week. Add a little weight every session you complete all reps.",
    exercises=[E("Back Squat", 5, "5", "start 20-40kg (empty bar for new lifters)"),
               E("Bench Press", 5, "5", "start 20-40kg"),
               E("Barbell Row", 5, "5", "start 30-40kg")],
    credit=SL_CREDIT, sourceUrl=SL_URL, sourceNote=SL_NOTE)
add(id="stronglifts-5x5-workout-b", name="StrongLifts 5x5 – Workout B", series="StrongLifts 5x5", day=2, daysInSeries=2,
    category="gym", level="beginner", sport="strength-training", goals=["strength", "muscle"], duration="45 min", daysPerWeek=3,
    equipment=["barbell", "squat rack"],
    description="The second StrongLifts session: squats again, overhead press, and a single heavy set of deadlifts. Rest about 3 minutes between work sets.",
    exercises=[E("Back Squat", 5, "5", "same as last session + 2.5kg"),
               E("Overhead Press", 5, "5", "start 20-30kg"),
               E("Deadlift", 1, "5", "start 40-60kg")],
    credit=SL_CREDIT, sourceUrl=SL_URL, sourceNote=SL_NOTE)

# ---------------------------------------------------------- r/Fitness BBR
BBR_URL = "https://thefitness.wiki/routines/r-fitness-basic-beginner-routine/"
BBR_NOTE = "Free community routine on The Fitness Wiki (modified from Phrak's GSLP). '5+' = last set as many reps as possible, leaving 1-2 in reserve."
add(id="rfitness-basic-beginner-a", name="r/Fitness Basic Beginner – Workout A", series="r/Fitness Basic Beginner Routine", day=1, daysInSeries=2,
    category="gym", level="beginner", sport="strength-training", goals=["strength", "general-fitness"], duration="45 min", daysPerWeek=3,
    equipment=["barbell", "bench", "squat rack"],
    description="A simple three-lift barbell day with an AMRAP final set to drive progress. Alternate with Workout B, resting a day between sessions.",
    exercises=[E("Barbell Row", 3, "5+"), E("Bench Press", 3, "5+"), E("Back Squat", 3, "5+")],
    credit="r/Fitness community (The Fitness Wiki)", sourceUrl=BBR_URL, sourceNote=BBR_NOTE)
add(id="rfitness-basic-beginner-b", name="r/Fitness Basic Beginner – Workout B", series="r/Fitness Basic Beginner Routine", day=2, daysInSeries=2,
    category="gym", level="beginner", sport="strength-training", goals=["strength", "general-fitness"], duration="45 min", daysPerWeek=3,
    equipment=["barbell", "pull-up bar", "squat rack"],
    description="Chin-ups, overhead press and deadlifts with an AMRAP last set. Pair with some light and some hard cardio twice a week.",
    exercises=[E("Chin-up", 3, "5+", "bodyweight"), E("Overhead Press", 3, "5+"), E("Deadlift", 3, "5+")],
    credit="r/Fitness community (The Fitness Wiki)", sourceUrl=BBR_URL, sourceNote=BBR_NOTE)

# ---------------------------------------------------------------- GZCLP
GZ_URL = "https://thefitness.wiki/routines/gzclp/"
GZ_NOTE = "Free program by Cody LeFever (GZCL), summarised on The Fitness Wiki. Stage 1 shown: T1 5x3+, T2 3x10, T3 3x15+ (last set AMRAP)."
gz = [("Squat", "Bench Press", "Lat Pulldown"), ("Overhead Press", "Deadlift", "Dumbbell Row"),
      ("Bench Press", "Squat", "Lat Pulldown"), ("Deadlift", "Overhead Press", "Dumbbell Row")]
for i, (t1, t2, t3) in enumerate(gz, 1):
    add(id=f"gzclp-day-{i}", name=f"GZCLP – Day {i} ({t1})", series="GZCLP", day=i, daysInSeries=4,
        category="gym", level="beginner", sport="powerlifting", goals=["strength", "muscle"], duration="60 min", daysPerWeek=3,
        equipment=["barbell", "dumbbells", "machines", "squat rack"],
        description=f"Tiered linear progression: heavy {t1} triples, volume {t2} tens, then a high-rep {t3} finisher. Leave a rest day between workouts.",
        exercises=[E(f"{t1} (T1)", 5, "3+", "~85% of 5RM to start"), E(f"{t2} (T2)", 3, "10"), E(f"{t3} (T3)", 3, "15+")],
        credit="Cody LeFever (GZCL)", sourceUrl=GZ_URL, sourceNote=GZ_NOTE)

# ---------------------------------------------------------- Metallicdpa PPL
PPL_URL = "https://thefitness.wiki/reddit-archive/a-linear-progression-based-ppl-program-for-beginners/"
PPL_NOTE = "Free program posted by u/Metallicdpa on r/Fitness, archived on The Fitness Wiki. Run PPLPPL-rest; the Legs day is repeated on day 6."
PPL_C = "u/Metallicdpa (r/Fitness)"
pull_acc = [E("Lat Pulldown or Pull-up", 3, "8-12"), E("Seated Cable Row", 3, "8-12"), E("Face Pull", 5, "15-20"),
            E("Hammer Curl", 4, "8-12"), E("Dumbbell Curl", 4, "8-12")]
push_acc = [E("Incline Dumbbell Press", 3, "8-12"),
            E("Triceps Pushdown", 3, "8-12", group="A"), E("Lateral Raise", 3, "15-20", group="A"),
            E("Overhead Triceps Extension", 3, "8-12", group="B"), E("Lateral Raise", 3, "15-20", group="B")]
add(id="metallicdpa-ppl-pull-a", name="Beginner PPL – Pull A (Deadlift)", series="Metallicdpa PPL", day=1, daysInSeries=6,
    category="gym", level="intermediate", sport="bodybuilding", goals=["muscle", "strength"], duration="60 min", daysPerWeek=6,
    equipment=["barbell", "dumbbells", "cables", "machines"],
    description="Back and biceps day led by one all-out set of deadlifts, followed by rows, pulldowns and plenty of curls and face pulls.",
    exercises=[E("Deadlift", 1, "5+")] + pull_acc, credit=PPL_C, sourceUrl=PPL_URL, sourceNote=PPL_NOTE)
add(id="metallicdpa-ppl-push-a", name="Beginner PPL – Push A (Bench)", series="Metallicdpa PPL", day=2, daysInSeries=6,
    category="gym", level="intermediate", sport="bodybuilding", goals=["muscle", "strength"], duration="60 min", daysPerWeek=6,
    equipment=["barbell", "dumbbells", "cables", "bench"],
    description="Chest, shoulders and triceps built around five sets of bench press, with supersetted triceps and lateral raise work.",
    exercises=[E("Bench Press", 5, "5 (last set 5+)"), E("Overhead Press", 3, "8-12")] + push_acc,
    credit=PPL_C, sourceUrl=PPL_URL, sourceNote=PPL_NOTE)
add(id="metallicdpa-ppl-legs", name="Beginner PPL – Legs", series="Metallicdpa PPL", day=3, daysInSeries=6,
    category="gym", level="intermediate", sport="bodybuilding", goals=["muscle", "strength"], duration="60 min", daysPerWeek=6,
    equipment=["barbell", "machines", "squat rack"],
    description="Squat-focused leg day with Romanian deadlifts, leg press, curls and calves. The same session is repeated on day 6.",
    exercises=[E("Back Squat", 3, "5 (last set 5+)"), E("Romanian Deadlift", 3, "8-12"), E("Leg Press", 3, "8-12"),
               E("Leg Curl", 3, "8-12"), E("Calf Raise", 5, "8-12")],
    credit=PPL_C, sourceUrl=PPL_URL, sourceNote=PPL_NOTE)
add(id="metallicdpa-ppl-pull-b", name="Beginner PPL – Pull B (Row)", series="Metallicdpa PPL", day=4, daysInSeries=6,
    category="gym", level="intermediate", sport="bodybuilding", goals=["muscle", "strength"], duration="60 min", daysPerWeek=6,
    equipment=["barbell", "dumbbells", "cables", "machines"],
    description="The second pull day swaps deadlifts for five sets of heavy barbell rows; accessories stay the same.",
    exercises=[E("Barbell Row", 5, "5 (last set 5+)")] + pull_acc, credit=PPL_C, sourceUrl=PPL_URL, sourceNote=PPL_NOTE)
add(id="metallicdpa-ppl-push-b", name="Beginner PPL – Push B (Overhead Press)", series="Metallicdpa PPL", day=5, daysInSeries=6,
    category="gym", level="intermediate", sport="bodybuilding", goals=["muscle", "strength"], duration="60 min", daysPerWeek=6,
    equipment=["barbell", "dumbbells", "cables", "bench"],
    description="Overhead press takes the lead, with bench press moved to moderate-rep volume work.",
    exercises=[E("Overhead Press", 5, "5 (last set 5+)"), E("Bench Press", 3, "8-12")] + push_acc,
    credit=PPL_C, sourceUrl=PPL_URL, sourceNote=PPL_NOTE)

# ---------------------------------------------------------- 5/3/1 for Beginners
W_URL = "https://thefitness.wiki/routines/5-3-1-for-beginners/"
W_NOTE = "Jim Wendler's free '5/3/1 for Beginners' variant as summarised on The Fitness Wiki. 5/3/1 is Wendler's brand and his books are paid; we store only the set/rep/percentage structure (week 1 shown) and credit him."
W_C = "Jim Wendler (summary via The Fitness Wiki)"


def w531(lift):
    return [E(f"{lift} – 5/3/1 sets", 3, "5, 5, 5+", "65% / 75% / 85% TM (week 1)"),
            E(f"{lift} – First Set Last", 5, "5", "65% TM")]


asst = [E("Push assistance (e.g. dips or push-ups)", 5, "10-20", group="A"),
        E("Pull assistance (e.g. chin-ups or rows)", 5, "10-20", group="A"),
        E("Single-leg / core (e.g. lunges or ab work)", 5, "10-20", group="A")]
jumps = E("Box Jumps or Med Ball Throws", 3, "5", "bodyweight")
for i, (a, b) in enumerate([("Squat", "Bench Press"), ("Deadlift", "Overhead Press"), ("Bench Press", "Squat")], 1):
    add(id=f"wendler-531-beginners-day-{i}", name=f"5/3/1 for Beginners – Day {i} ({a} + {b})", series="5/3/1 for Beginners",
        day=i, daysInSeries=3, category="gym", level="beginner", sport="strength-training", goals=["strength", "muscle"],
        duration="60 min", daysPerWeek=3, equipment=["barbell", "bench", "squat rack", "pull-up bar"],
        description=f"Two main lifts ({a}, {b}) on the 5/3/1 wave plus five back-off sets each, then 50-100 reps of push, pull and single-leg/core work.",
        exercises=[jumps] + w531(a) + w531(b) + asst, credit=W_C, sourceUrl=W_URL, sourceNote=W_NOTE)

# ---------------------------------------------------------- Boring But Big
BBB_URL = "https://jimwendler.com/blogs/jimwendler-com/101077382-boring-but-big"
BBB_NOTE = ("Free article on jimwendler.com (© JimWendler.com). Day layout and 5x10 @50-60% TM come from that page; main-set percentages follow "
            "the standard 5/3/1 week-1 wave (see wendler-531-beginners). The page does not give set counts for lat/ab assistance - 3 sets shown is a placeholder.")
for i, (lift, extra) in enumerate([("Overhead Press", "Lat work (chin-ups or rows)"), ("Deadlift", "Ab work (hanging leg raise)"),
                                    ("Bench Press", "Lat work (chin-ups or rows)"), ("Squat", "Ab work (hanging leg raise)")], 1):
    add(id=f"wendler-bbb-day-{i}", name=f"5/3/1 Boring But Big – Day {i} ({lift})", series="5/3/1 Boring But Big", day=i, daysInSeries=4,
        category="gym", level="intermediate", sport="strength-training", goals=["strength", "muscle"], duration="60 min", daysPerWeek=4,
        equipment=["barbell", "squat rack", "pull-up bar"],
        description=f"One main lift ({lift}) on the 5/3/1 wave followed by five sets of ten with the same lift for size, then a little assistance.",
        exercises=[E(f"{lift} – 5/3/1 sets", 3, "5, 5, 5+", "65% / 75% / 85% TM (week 1)"),
                   E(f"{lift} – BBB", 5, "10", "50-60% TM"), E(extra, 3, "10-15")],
        credit="Jim Wendler", sourceUrl=BBB_URL, sourceNote=BBB_NOTE)

# ---------------------------------------------------------- NHS Couch to 5K
C25_URL = "https://www.nhs.uk/better-health/get-active/get-running-with-couch-to-5k/couch-to-5k-running-plan"
C25_NOTE = "Free NHS programme (© Crown copyright). Only the run/walk timings are recorded; credit the NHS and link to the official plan/app."
add(id="nhs-couch-to-5k-week-1", name="Couch to 5K – Week 1", series="NHS Couch to 5K",
    category="run", level="beginner", sport="running", goals=["endurance", "fat-loss", "general-fitness"], duration="30 min", daysPerWeek=3,
    equipment=["bodyweight"],
    description="The very first Couch to 5K session: alternate one minute of easy running with 90 seconds of walking, bookended by brisk walks.",
    exercises=[E("Brisk walk warm-up", 1, "5 min"), E("Run (easy pace)", 8, "1 min", group="A"), E("Walk recovery", 7, "90s", group="A"),
               E("Cool-down walk", 1, "5 min")],
    credit="NHS (Better Health)", sourceUrl=C25_URL, sourceNote=C25_NOTE)
add(id="nhs-couch-to-5k-week-5-run-3", name="Couch to 5K – Week 5, Run 3 (20 min)", series="NHS Couch to 5K",
    category="run", level="beginner", sport="running", goals=["endurance", "fat-loss", "general-fitness"], duration="30 min", daysPerWeek=3,
    equipment=["bodyweight"],
    description="The famous mid-plan milestone: your first 20-minute continuous run.",
    exercises=[E("Brisk walk warm-up", 1, "5 min"), E("Continuous run", 1, "20 min"), E("Cool-down walk", 1, "5 min")],
    credit="NHS (Better Health)", sourceUrl=C25_URL, sourceNote=C25_NOTE)
add(id="nhs-couch-to-5k-week-9", name="Couch to 5K – Week 9 (30 min)", series="NHS Couch to 5K",
    category="run", level="beginner", sport="running", goals=["endurance", "fat-loss", "general-fitness"], duration="40 min", daysPerWeek=3,
    equipment=["bodyweight"],
    description="The graduation session: 30 minutes of running without stopping.",
    exercises=[E("Brisk walk warm-up", 1, "5 min"), E("Continuous run", 1, "30 min"), E("Cool-down walk", 1, "5 min")],
    credit="NHS (Better Health)", sourceUrl=C25_URL, sourceNote=C25_NOTE)

# ---------------------------------------------------------- NTNU 4x4
add(id="ntnu-4x4-intervals", name="4x4 Interval Training", category="run", level="intermediate", sport="running",
    goals=["endurance", "general-fitness"], duration="40 min", daysPerWeek=2, equipment=["bodyweight"],
    description="Four hard four-minute efforts with three-minute active recoveries, a protocol from NTNU's exercise research group shown to raise aerobic fitness. Works running, cycling or rowing.",
    exercises=[E("Warm-up (easy)", 1, "10 min", "60-70% max HR"), E("Hard interval", 4, "4 min", "85-95% max HR", group="A"),
               E("Active recovery", 3, "3 min", "60-70% max HR", group="A"), E("Cool-down (easy)", 1, "5 min", "60-70% max HR")],
    credit="Cardiac Exercise Research Group (CERG), NTNU", sourceUrl="https://www.ntnu.edu/cerg/advice",
    sourceNote="Free public advice page from a university research group. Determine max HR by testing where possible.")

# ---------------------------------------------------------- 7-minute workout
add(id="seven-minute-workout", name="The 7-Minute Workout", category="fitness", level="intermediate", sport="hiit",
    goals=["fat-loss", "general-fitness"], duration="25 min", equipment=["bodyweight", "chair"],
    description="Twelve bodyweight moves for 30 seconds each with 10 seconds rest. The authors suggest two or three rounds; they note it is not ideal for complete beginners.",
    exercises=[E(n, 3, r, group="A") for n, r in [("Jumping Jacks", "30s"), ("Wall Sit", "30s"), ("Push-up", "30s"), ("Crunch", "30s"),
                                                   ("Step-up onto Chair", "30s"), ("Squat", "30s"), ("Triceps Dip on Chair", "30s"), ("Plank", "30s"),
                                                   ("High Knees / Running in Place", "30s"), ("Lunge", "30s"), ("Push-up with Rotation", "30s"),
                                                   ("Side Plank", "15s/side")]],
    credit="Brett Klika & Chris Jordan (ACSM's Health & Fitness Journal, 2013)",
    sourceUrl="https://www.topendsports.com/fitness/programs/7min-workout.htm",
    sourceNote="Published research protocol (Klika & Jordan, ACSM Health Fit J 2013;17(3):8-13); exercise list read from Topend Sports' summary. 10s rest between exercises.")

# ---------------------------------------------------------- HYROX race simulation
hx = []
stations = [("SkiErg", "1000m", None), ("Sled Push", "50m", "Open: 152kg men / 102kg women incl. sled"),
            ("Sled Pull", "50m", "Open: 103kg men / 78kg women incl. sled"), ("Burpee Broad Jumps", "80m", "bodyweight"),
            ("Row", "1000m", None), ("Farmers Carry", "200m", "Open: 2x24kg men / 2x16kg women"),
            ("Sandbag Lunges", "100m", "Open: 20kg men / 10kg women")]
for n, d, w in stations:
    hx.append(E("Run", 1, "1", distance="1km"))
    hx.append(E(n, 1, "1", w, distance=d))
hx.append(E("Run", 1, "1", distance="1km"))
hx.append(E("Wall Balls", 1, "100 (men) / 75 (women)", "Open: 6kg to 3.0m men / 4kg to 2.7m women"))
add(id="hyrox-race-simulation", name="HYROX Race Simulation (Open)", category="fitness", level="advanced", sport="hybrid",
    goals=["endurance", "sport-performance", "general-fitness"], duration="90 min",
    equipment=["ski erg", "rower", "sled", "kettlebell", "sandbag", "wall ball"],
    description="The full HYROX race order: eight 1km runs, each followed by a functional station. Use as a full simulation or scale distances down for practice.",
    exercises=hx, credit="HYROX race format (station standards via Hyranking)",
    sourceUrl="https://hyranking.com/learn/explainers/hyrox-stations-explained-all-8-workouts-in-race-order",
    sourceNote="Race format is public; standards read from a third-party explainer, not hyrox.com. HYROX is a registered trademark - credit the format and do not imply endorsement.")

# ---------------------------------------------------------- FIFA 11+
F_URL = "https://www.wakemed.org/sites/default/files/pdf/Ortho/fifa%20basic%20warm%20up%20exercises.pdf"
add(id="fifa-11-plus-warm-up", name="FIFA 11+ Injury Prevention Warm-up (Level 1)", category="other", level="beginner", sport="football",
    goals=["sport-performance", "general-fitness", "mobility"], duration="20 min", daysPerWeek=2, equipment=["bodyweight", "cones", "ball"],
    description="The 20-minute football warm-up developed with FIFA's medical centre to cut injury risk: running drills, then strength, balance and jumps, then faster running. Before matches do only the running parts.",
    exercises=[E("Running – straight ahead (cone course)", 2, "1 course"), E("Running – hip out", 2, "1 course"),
               E("Running – hip in", 2, "1 course"), E("Running – circling partner", 2, "1 course"),
               E("Running – shoulder contact jumps", 2, "1 course"), E("Running – quick forwards & backwards", 2, "1 course"),
               E("The Bench (static plank)", 3, "20-30s"), E("Sideways Bench (static)", 3, "20-30s/side"),
               E("Nordic Hamstrings (beginner)", 1, "3-5"), E("Single-leg Stance, hold the ball", 2, "30s/leg"),
               E("Squats with Toe Raise", 2, "30s"), E("Vertical Jumps", 2, "30s"),
               E("Running across the pitch", 2, "1 width", "75-80% max pace"), E("Bounding", 2, "1 width"),
               E("Plant & Cut", 2, "1 width", "80-90% max pace")],
    credit="FIFA Medical Assessment and Research Centre (F-MARC)", sourceUrl=F_URL,
    sourceNote="Freely distributed injury-prevention programme; read from WakeMed Sports Medicine's reproduction of the F-MARC 11+ poster. Credit F-MARC/FIFA.")

# ---------------------------------------------------------- BWF Recommended Routine
add(id="bwf-recommended-routine", name="r/bodyweightfitness Recommended Routine", category="fitness", level="beginner", sport="calisthenics",
    goals=["strength", "muscle", "general-fitness"], duration="60 min", daysPerWeek=3, equipment=["bodyweight", "pull-up bar", "rings or dip bars", "bands"],
    description="The classic full-body bodyweight plan: a short dynamic warm-up, three supersetted strength pairs, and a core triplet. Pick the hardest progression you can do for 3 sets of 5-8.",
    exercises=[E("Yuri's Shoulder Band Warm-up", 1, "5-10"), E("Squat Sky Reaches", 1, "5-10"), E("Wrist Prep", 1, "10"), E("Deadbugs", 1, "30s"),
               E("Pull-up progression", 3, "5-8", group="A"), E("Squat progression", 3, "5-8", group="A"),
               E("Dip progression", 3, "5-8", group="B"), E("Hinge progression", 3, "5-8", group="B"),
               E("Row progression", 3, "5-8", group="C"), E("Push-up progression", 3, "5-8", group="C"),
               E("Anti-extension progression", 3, "8-12", group="D"), E("Anti-rotation progression", 3, "8-12", group="D"),
               E("Extension progression", 3, "8-12", group="D")],
    credit="r/bodyweightfitness community", sourceUrl="https://redditbwf.github.io/wiki/recommended_routine.html",
    sourceNote="Free community routine; read from the subreddit's GitHub wiki mirror (reddit itself blocks fetching). 90s rest in pairs, 60s in the core triplet.")

# ---------------------------------------------------------- Simple & Sinister
add(id="strongfirst-simple-and-sinister", name="Kettlebell Simple & Sinister", category="fitness", level="intermediate", sport="strength-training",
    goals=["strength", "general-fitness", "endurance"], duration="20 min", equipment=["kettlebell"],
    description="Pavel Tsatsouline's minimalist daily practice: 100 one-arm swings then 10 Turkish get-ups, both by the clock. Assumes you can already swing and get up with good form.",
    exercises=[E("One-arm Kettlebell Swing (switch hands each set, every 30s)", 10, "10", "goal: 32kg men / 24kg women"),
               E("Rest", 1, "1 min"),
               E("Turkish Get-up (alternate sides, 1 per minute)", 10, "1", "goal: 32kg men / 16kg women")],
    credit="Pavel Tsatsouline (StrongFirst)", sourceUrl="https://www.strongfirst.com/sinister/",
    sourceNote="Session standard posted publicly on strongfirst.com. StrongFirst® is a registered trademark and the full program is a paid book - record structure only, credit, and link out.")

# ---------------------------------------------------------- USMS swims
U1 = "https://www.usms.org/fitness-and-training/articles-and-videos/articles/the-5-best-30-minute-swim-workouts"
add(id="usms-quick-hit-swim", name="USMS 30-min Swim – The Quick Hit", category="swim", level="beginner", sport="swimming",
    goals=["endurance", "general-fitness"], duration="30 min", equipment=["pool"],
    description="A tidy 1,050-yard session: easy warm-up, three short technique drills, a steady freestyle main set, and an easy cool-down.",
    exercises=[E("Warm-up – choice, easy (rest 30s)", 1, "1", distance="200yd"),
               E("Drill – 25 catch-up / 25 freestyle", 1, "1", distance="50yd"),
               E("Drill – single-arm freestyle (R then L)", 1, "1", distance="50yd"),
               E("Drill – 25 six-kick switch / 25 freestyle", 1, "1", distance="50yd"),
               E("Freestyle – steady aerobic (rest 30s)", 1, "1", distance="200yd"),
               E("Freestyle – hold pace per 50 (rest 25s)", 1, "1", distance="150yd"),
               E("Freestyle – smooth (rest 15s)", 4, "1", distance="50yd"),
               E("Cool-down – backstroke easy", 1, "1", distance="100yd"),
               E("Cool-down – freestyle easy", 1, "1", distance="50yd")],
    credit="Hilary Topper (U.S. Masters Swimming)", sourceUrl=U1, sourceNote="Free article on usms.org. Sets/distances only; credit USMS and the author.")
add(id="usms-technique-tune-up-swim", name="USMS 30-min Swim – Technique Tune-Up", category="swim", level="beginner", sport="swimming",
    goals=["endurance", "general-fitness"], duration="30 min", equipment=["pool"],
    description="A technique-first 1,050 yards: drills for balance and catch, then stroke-count work to swim longer with fewer strokes.",
    exercises=[E("Warm-up – choice, balanced body line (rest 30s)", 1, "1", distance="200yd"),
               E("Drill – 25 single-arm / 25 swim (rest 20s)", 3, "1", distance="50yd"),
               E("Drill – 25 fingertip drag / 25 swim (rest 20s)", 2, "1", distance="50yd"),
               E("Freestyle – count strokes per length (rest 20s)", 4, "1", distance="75yd"),
               E("Freestyle – low natural stroke count (rest 15s)", 6, "1", distance="25yd"),
               E("Cool-down – backstroke easy", 1, "1", distance="100yd"),
               E("Cool-down – freestyle easy", 1, "1", distance="50yd")],
    credit="Hilary Topper (U.S. Masters Swimming)", sourceUrl=U1, sourceNote="Free article on usms.org. Sets/distances only; credit USMS and the author.")
add(id="usms-beginner-breathe-swim", name="USMS Beginner Swim – Breathe", category="swim", level="beginner", sport="swimming",
    goals=["endurance"], duration="45 min", equipment=["pool", "pull buoy"],
    description="A 1,500-yard beginner workout alternating short choice swims with pull-buoy hundreds, on generous send-off intervals.",
    exercises=[E("Warm-up – freestyle (on 2:00)", 1, "1", distance="100yd"), E("Warm-up – choice (on 2:00)", 1, "1", distance="100yd"),
               E("Warm-up – pull (on 2:00)", 1, "1", distance="100yd"), E("Choice (on :30)", 4, "1", distance="25yd"),
               E("Pull (on 2:00)", 1, "1", distance="100yd"), E("Choice (on :30)", 2, "1", distance="25yd"),
               E("Pull (on 3:30)", 2, "1", distance="100yd"), E("Choice (on :50)", 1, "1", distance="50yd"),
               E("Pull (on 3:30)", 3, "1", distance="100yd"), E("Choice (on 1:00)", 4, "1", distance="50yd"),
               E("Cool-down – choice (on 2:00)", 4, "1", distance="50yd")],
    credit="Kris Goodrich (U.S. Masters Swimming)", sourceUrl="https://usms.org/fitness-and-training/articles-and-videos/articles/best-swimming-workouts-for-beginners",
    sourceNote="Free article on usms.org. Sets/distances/intervals only; credit USMS and the author.")

# ---------------------------------------------------------- British Cycling
BC_NOTE = "Free supporting document from British Cycling's training plans (PDF). Cadence/time structure only; credit British Cycling."
add(id="british-cycling-20-min-warm-up", name="British Cycling 20-Minute Turbo Session", category="ride", level="beginner", sport="cycling",
    goals=["endurance", "general-fitness"], duration="20 min", equipment=["bike", "turbo trainer or static bike", "cadence sensor"],
    description="British Cycling's standard warm-up, used by all levels: cadence climbs step by step from 90 to 130rpm, then three six-second max rev-outs. Use it before hard sessions or on its own.",
    exercises=[E("Smooth pedalling", 1, "5 min", "90 rpm"), E("Smooth pedalling", 1, "2 min", "95 rpm"),
               E("Smooth pedalling", 1, "2 min", "100 rpm"), E("Smooth pedalling", 1, "2 min", "105 rpm"),
               E("Smooth pedalling", 1, "90s", "110 rpm"), E("Maintain form", 1, "30s", "120-130 rpm"),
               E("Relax and recover", 1, "2 min", "90 rpm"), E("Max rev-out", 3, "6s", "max cadence", group="A"),
               E("Smooth pedalling between efforts", 2, "1 min", "90 rpm", group="A"), E("Relax and recover", 1, "2 min 45s", "90 rpm")],
    credit="British Cycling", sourceUrl="https://www.britishcycling.org.uk/zuvvi/media/bc_files/sportivetrainingplans/20_MINUTE_WARM_UP.pdf", sourceNote=BC_NOTE)
add(id="british-cycling-2x20-sweet-spot", name="British Cycling 2x20 Sweet Spot", category="ride", level="intermediate", sport="cycling",
    goals=["endurance", "sport-performance"], duration="80 min", equipment=["bike", "turbo trainer or rollers"],
    description="A classic threshold-builder: two evenly paced 20-minute efforts at sweet-spot intensity (high zone 3 to mid zone 4), cadence 90rpm+.",
    exercises=[E("British Cycling 20-min warm-up", 1, "20 min"), E("Sweet spot effort", 1, "20 min", "high Z3-mid Z4, 90+ rpm"),
               E("Recovery spin", 1, "10 min", "easy"), E("Sweet spot effort", 1, "20 min", "high Z3-mid Z4, 90+ rpm"),
               E("Cool-down", 1, "10 min", "easy spin")],
    credit="British Cycling", sourceUrl="https://www.britishcycling.org.uk/zuvvi/media/bc_files/sportivetrainingplans/indoor_sessions/IZ_Rollers_Sessions_2x20_indoor_session.pdf", sourceNote=BC_NOTE)

# ---------------------------------------------------------- Boxing
add(id="nuffield-boxing-conditioning", name="Boxing Metabolic Conditioning", category="fitness", level="intermediate", sport="boxing",
    goals=["fat-loss", "endurance", "sport-performance"], duration="40 min", equipment=["bodyweight", "pull-up bar or TRX"],
    description="Six bodyweight moves done as a circuit, aiming to finish each round inside a 3-minute boxing round, with 60s rest. Build from a few rounds up to ten.",
    exercises=[E("Pull-up or TRX Row", 5, "15", group="A"), E("Press-up (full or kneeling)", 5, "20", group="A"),
               E("Bodyweight Squat", 5, "25", group="A"), E("Frog Jump or Squat Jump", 5, "25", group="A"),
               E("Jump Lunge or Alternating Lunge", 5, "20", group="A"), E("Burpee (no jump)", 5, "15", group="A")],
    credit="Nuffield Health", sourceUrl="https://nuffieldhealth.com/article/boxing-metabolic-conditioning-workout",
    sourceNote="Free article on nuffieldhealth.com. Page says up to 10 rounds; 5 shown as a default. The page has no warm-up - add one.")
add(id="expertboxing-basic-routine", name="Basic Boxing Training Routine", category="fitness", level="intermediate", sport="boxing",
    goals=["sport-performance", "endurance"], duration="60 min", equipment=["jump rope", "heavy bag", "focus mitts", "speed bag", "double-end bag"],
    description="A traditional boxing-gym session in 3-minute rounds: skipping, stretching, mitts, heavy bag, speed bag and double-end bag. Mitts need a partner.",
    exercises=[E("Jump Rope (skip through the 1 min breaks)", 3, "3 min"), E("Stretching", 1, "3 min"),
               E("Focus Mitts – speed & accuracy", 3, "3 min"), E("Heavy Bag", 3, "3 min"), E("Speed Bag", 2, "3 min"),
               E("Double-end Bag", 2, "3 min"), E("Warm-down Stretching", 1, "3 min")],
    credit="Johnny N (ExpertBoxing)", sourceUrl="https://expertboxing.com/basic-boxing-training-routine",
    sourceNote="Free article on expertboxing.com. Round length assumed 3 min per the author's own comment on the article.")

# ---------------------------------------------------------- USTA
usta = ["Jog with Progressive Arm Circles", "Carioca", "Knee-to-Chest Tuck", "Lunge with Reach Back", "Side Shuffle",
        "High Step with Trunk Rotation", "Three-way Jumping Jacks", "Inverted Hamstring", "Lateral Lunge",
        "Walking Spiderman with Rotation", "Leg Swings (forward/back & side)", "High Knees", "Butt Kicks", "Inchworms",
        "A-Skips", "Reverse Skip with Hip Rotation", "Build-up Sprints (50% / 75% / 100%)"]
ux = []
for n in usta:
    if n.startswith("Three-way"): ux.append(E(n, 1, "10"))
    elif n.startswith("Leg Swings"): ux.append(E(n, 1, "10 each way/leg"))
    elif n.startswith("Build-up"): ux.append(E(n, 3, "1 length"))
    else: ux.append(E(n, 1, "1 length"))
add(id="usta-dynamic-warm-up", name="USTA Tennis Dynamic Warm-up", category="other", level="beginner", sport="tennis",
    goals=["mobility", "sport-performance"], duration="15 min", equipment=["bodyweight"],
    description="USTA Player Development's movement-based warm-up for tennis, progressing from jogging and lunges to skips and build-up sprints.",
    exercises=ux, credit="USTA Player Development",
    sourceUrl="https://www.usta.com/en/home/improve/tips-and-instruction/national/dynamic-warm-up-and-flexibility-training.html",
    sourceNote="Free article on usta.com. Distances are not specified on the page ('1 length' = roughly a baseline-to-net length).")

# ---------------------------------------------------------- Golf
add(id="golfshake-5-minute-golf-warm-up", name="5-Minute Golf Warm-up", category="other", level="beginner", sport="golf",
    goals=["mobility", "sport-performance"], duration="5 min", equipment=["bodyweight", "bands", "golf club"],
    description="A quick standing warm-up for the range or first tee: rotation and chest-opening drills, band activation, then a few full-speed swings.",
    exercises=[E("Kickstance Rotations", 1, "8/side"), E("Standing Chest Openers", 1, "8/side"), E("Address Position Overhead Raise", 1, "12"),
               E("Band-resisted Takeaway", 1, "6/side"), E("Step and Load Sequence", 1, "6 per phase"), E("Full-speed Practice Swings", 1, "2-3")],
    credit="Jon Hodgkinson, TPI-certified coach (via Golfshake)",
    sourceUrl="https://www.golfshake.com/news/view/21262/The_5Minute_Golf_WarmUp_Routine_You_Should_Be_Doing.html",
    sourceNote="Free article on golfshake.com. Exercise names/reps only.")

# ---------------------------------------------------------- Pilates
add(id="classical-mat-pilates-first-fifteen", name="Classical Mat Pilates – First Fifteen", category="fitness", level="intermediate", sport="pilates",
    goals=["mobility", "general-fitness"], duration="30 min", equipment=["mat", "bands", "pilates ball"],
    description="The opening sequence of classical mat Pilates, from the Hundred through rolling, stretches and spinal articulation. Best learned with an instructor first.",
    exercises=[E(n, s, r) for n, s, r in [("The Hundred", 1, "100 beats"), ("Roll Up", 1, "6"), ("Roll Over Prep (on ball)", 1, "3 each way"),
                                          ("Single Leg Circles (with band)", 1, "5 each direction/leg"), ("Rolling Like a Ball", 1, "6"),
                                          ("Single Leg Stretch", 1, "16 changes"), ("Double Leg Stretch", 1, "5"),
                                          ("Single Straight Leg Lower", 1, "10 changes"), ("Double Toe Taps", 1, "6"), ("Criss Cross", 1, "12 changes"),
                                          ("Spine Stretch Forward", 1, "3"), ("Open Leg Rocker Prep", 1, "6"), ("Advanced Hip Rolls", 3, "1"),
                                          ("Saw", 3, "1"), ("Cobra / Double Leg Lift Combo", 1, "6")]],
    credit="Rosemary Godfrey (Pilates Body)", sourceUrl="https://pilatesbody.co.uk/2015/11/23/the-first-fifteen-exercises",
    sourceNote="Free blog post by a Pilates teacher. Classical exercise names are traditional (Joseph Pilates); rep counts are from the post.")

# ---------------------------------------------------------- Sun salutation
sun = ["Prayer Pose (Pranamasana)", "Raised Arms (Hasta Uttanasana)", "Hands to Feet (Pada Hastasana)", "Equestrian Lunge – left (Ashwa Sanchalanasana)",
       "Downward Dog (Parvatasana)", "Eight-limbed Pose (Ashtanga Namaskara)", "Cobra (Bhujangasana)", "Downward Dog (Parvatasana)",
       "Equestrian Lunge – right (Ashwa Sanchalanasana)", "Hands to Feet (Pada Hastasana)", "Raised Arms (Hasta Uttanasana)", "Prayer Pose (Pranamasana)"]
add(id="sun-salutation-flow", name="Sun Salutation (Surya Namaskar)", category="other", level="beginner", sport="yoga-mobility",
    goals=["mobility", "general-fitness"], duration="12 min", equipment=["mat"],
    description="The traditional 12-step flow, each pose linked to an inhale or exhale. Four passes (alternating the lead leg) make two full salutations.",
    exercises=[E(n, 4, "1 breath", group="A") for n in sun],
    credit="Lynda Robinson, OT/L, RYT-500 (Cleveland Clinic)", sourceUrl="https://health.clevelandclinic.org/sun-salutation",
    sourceNote="Free health article. Sequence is traditional; easier options: cow pose instead of eight-limbed pose, cat instead of cobra.")

# ---------------------------------------------------------- NHS strength / flexibility / walking
add(id="nhs-home-strength-exercises", name="NHS Home Strength Exercises", category="fitness", level="beginner", sport="general",
    goals=["strength", "general-fitness"], duration="15 min", daysPerWeek=2, equipment=["bodyweight", "chair", "light weights or water bottles"],
    description="Gentle strength moves you can do at home with a chair and a light weight, suitable for new exercisers and older adults. Build the reps up over time.",
    exercises=[E("Sit-to-Stand (slowly)", 1, "5"), E("Mini Squat", 1, "5"), E("Calf Raise", 1, "5"), E("Sideways Leg Lift", 1, "5/leg"),
               E("Seated Leg Extension (hold up to 5s)", 1, "5/leg"), E("Wall Press-up", 3, "5-10"), E("Biceps Curl", 3, "5/arm", "light")],
    credit="NHS", sourceUrl="https://www.nhs.uk/live-well/exercise/strength-exercises/",
    sourceNote="Free NHS guidance (© Crown copyright). Exercise names/reps only; credit and link to NHS.")
add(id="nhs-flexibility-exercises", name="NHS Gentle Flexibility Routine", category="other", level="beginner", sport="yoga-mobility",
    goals=["mobility", "general-fitness"], duration="10 min", daysPerWeek=2, equipment=["bodyweight", "wall"],
    description="A short set of gentle neck, side and calf stretches to do at least twice a week.",
    exercises=[E("Neck Rotation (hold 5s)", 1, "3/side"), E("Neck Stretch (hold 5s)", 1, "3/side"), E("Sideways Bend (hold 2s)", 1, "3/side"),
               E("Calf Stretch against Wall", 1, "3/side")],
    credit="NHS", sourceUrl="https://www.nhs.uk/live-well/exercise/flexibility-exercises/",
    sourceNote="Free NHS guidance (© Crown copyright). Exercise names/reps only.")
add(id="nhs-wirral-walking-plan-medium-walk", name="NHS Walking Plan – Medium-Pace Walk", category="walk", level="beginner", sport="general",
    goals=["general-fitness", "fat-loss", "endurance"], duration="20 min", daysPerWeek=5, equipment=["bodyweight"],
    description="A week-1 session from an NHS community walking plan: a steady 20 minutes at medium pace, mixed through the week with longer comfortable-pace walks.",
    exercises=[E("Walk – medium pace", 1, "20 min")],
    credit="Wirral Community Health and Care NHS Foundation Trust", sourceUrl="https://www.wchc.nhs.uk/wp-content/uploads/2021/02/Walking-plans-Intermediate.pdf",
    sourceNote="Free NHS trust leaflet (PDF). Week 1 alternates 15-25 min walks at comfortable/medium pace, 5 walks per week.")

# ---------------------------------------------------------- coaching metadata
# key = id prefix -> (daysPerWeek, whoItsFor, lifestyle, howToRun)
META = {
    "stronglifts-5x5": (3, "Brand-new or returning lifters who want to learn the main barbell lifts and get stronger fast on a simple plan. Needs a gym with a squat rack and about 45 minutes, three times a week.",
        ["full-gym", "time-efficient"],
        ["Alternate A and B on Mon/Wed/Fri (A-B-A, then B-A-B the next week), with at least one rest day between.",
         "Start light (empty bar is fine) and add 2.5kg to squat/deadlift and 1.25-2.5kg to upper-body lifts every time you complete all 5x5.",
         "Rest about 3 minutes between work sets, up to 5 after a hard set.",
         "If you fail the same weight three sessions running, take 10% off and build back. When linear gains stall for good (usually 3-6 months), move to an intermediate plan such as 5/3/1 or GZCLP."]),
    "rfitness-basic-beginner": (3, "Total beginners who want the simplest possible start with a barbell, including people short on time. Each session is only three lifts.",
        ["full-gym", "time-efficient", "busy"],
        ["Alternate A and B three days a week with a full rest day between sessions.",
         "Add 1kg (2.5lb) to upper-body lifts and 2.5kg (5lb) to squat/deadlift each session; double the jump if your AMRAP set passes 10 reps.",
         "If you total fewer than 15 reps on a lift, cut that weight by 10%.",
         "Rest 2-3 minutes between sets. Run it for up to three months, then move to GZCLP or 5/3/1 for Beginners."]),
    "gzclp": (3, "Beginners and early intermediates who want strength with a bit more volume and structure than a pure 5x5, especially those interested in powerlifting.",
        ["full-gym"],
        ["Rotate Days 1-4 across three sessions a week (e.g. Mon/Wed/Fri), with a rest day between.",
         "Add 2.5kg to bench/OHP and 5kg to squat/deadlift every session you hit all reps; add T3 weight when the last set reaches 25 reps.",
         "When you miss reps, move to the next stage (T1: 5x3 -> 6x2 -> 10x1; T2: 3x10 -> 3x8 -> 3x6).",
         "Rest 3-5 min on T1, 2-3 min on T2, 60-90s on T3. When T1 stalls after stage 3, retest a 5RM and restart, or move to an intermediate GZCL program."]),
    "metallicdpa-ppl": (6, "Lifters with a few months of training who mainly want to build muscle and can train most days of the week. Not for busy schedules.",
        ["full-gym"],
        ["Run Pull-Push-Legs-Pull-Push-Legs-Rest (or PPL-Rest-PPL if you need more recovery).",
         "Add 2.5kg per session to bench, OHP, row and squat and 5kg to deadlift; push the last AMRAP set with good form.",
         "On accessories, add weight once you hit 3x12; stay in 8-12.",
         "Rest 3-5 min on the first lift, 1-3 min on the rest. Deload 10% after three failed sessions; move to a periodised plan when linear progress stops."]),
    "wendler-531-beginners": (3, "Newer lifters who have finished a first linear program (or want steadier progress) and like a structured percentage plan. Good for people training three days a week with some cardio on other days.",
        ["full-gym"],
        ["Train three non-consecutive days (Mon/Wed/Fri); do easy cardio or conditioning on off days.",
         "Set a Training Max at ~90% of your 1RM. Weeks 1-3 use 65/75/85, 70/80/90 and 75/85/95% of TM; repeat the cycle.",
         "After each 3-week cycle add 2.5kg to bench/OHP and 5kg to squat/deadlift TMs.",
         "Rest 1.5-3 min; assistance can be circuited. After several cycles, move to a variant such as Boring But Big."]),
    "wendler-bbb": (4, "Intermediate lifters who want size and strength together and can train four days a week. The 5x10 work is hard on recovery.",
        ["full-gym"],
        ["Four days a week (e.g. Mon/Tue/Thu/Fri), one main lift per day.",
         "Main sets follow the 5/3/1 three-week wave; BBB sets start lighter (30-50% TM) for newer lifters and build to 60%.",
         "Raise TMs by 2.5kg (upper) / 5kg (lower) each cycle.",
         "Rest 2-3 min on main sets, ~90s on BBB sets. Deload every 4th week or after 2-3 cycles."]),
    "nhs-couch-to-5k": (3, "Complete beginners and people returning to exercise who want to run 5K or 30 minutes non-stop. No equipment beyond trainers.",
        ["outdoor", "minimal-equipment", "busy", "time-efficient"],
        ["Three runs a week on non-consecutive days.",
         "Follow the weeks in order over 9 weeks; repeat a week if it felt too hard.",
         "Run at a pace where you can still talk; walk 5 minutes before and after every run.",
         "After week 9, try a parkrun or move to a 10K plan or the Somax Easy Run & Strides session."]),
    "ntnu-4x4": (2, "Anyone already active for 20-30 minutes who wants a big aerobic fitness boost in little time. Works on a treadmill, bike, rower or uphill outdoors.",
        ["time-efficient", "busy", "outdoor"],
        ["Do 2-3 sessions a week; one a week maintains fitness.",
         "Reach ~90% of max HR by the end of the first interval and within 1-2 minutes on later ones.",
         "Keep moving in the recoveries rather than stopping.",
         "When it feels easy at the same heart rate, increase speed or incline rather than adding intervals."]),
    "seven-minute-workout": (3, "Busy people with some exercise background who want a no-equipment workout at home, in a hotel room or at the office.",
        ["busy", "home", "travel", "minimal-equipment", "time-efficient"],
        ["Use 3 non-consecutive days a week, or daily if you keep it to one round.",
         "Work 30s, rest 10s; repeat the circuit 2-3 times for ~20 minutes.",
         "Progress by adding a round or doing harder versions (e.g. jump squats), not by cutting rest.",
         "True beginners should start with moderate pace and one round."]),
    "hyrox-race-simulation": (1, "Experienced hybrid athletes preparing for a HYROX race who already run 5K+ comfortably and have trained each station.",
        ["full-gym"],
        ["Use as a race rehearsal every 3-6 weeks, not as a weekly session.",
         "Scale early simulations to half distances/reps, building to the full race.",
         "Practise transitions and pacing: the runs should feel controlled, not all-out.",
         "Allow 2-3 easy days afterwards."]),
    "fifa-11-plus": (2, "Footballers of all ages and levels, including youth and amateur teams, who want to reduce knee, ankle and hamstring injuries.",
        ["outdoor", "minimal-equipment"],
        ["Do it at the start of every training session, at least twice a week.",
         "Before matches do only the running parts (Parts 1 and 3).",
         "Master level 1 of the strength/balance exercises before moving to levels 2 and 3.",
         "Watch knee alignment on every landing: knees should not buckle inwards."]),
    "bwf-recommended-routine": (3, "Beginners who want to build strength and muscle at home or in a park with minimal kit (a bar and rings or dip bars). Also suits travellers.",
        ["home", "minimal-equipment", "outdoor", "travel"],
        ["Three full-body sessions a week with a rest or skill day between.",
         "Choose the hardest progression you can do for 3x5; once you hit 3x8, move to the next progression.",
         "Rest 90s between exercises in each pair (up to 3 min if needed), 60s in the core triplet.",
         "Once you reach the end of most progressions, move to an intermediate calisthenics routine."]),
    "strongfirst-simple-and-sinister": (5, "People who want a short, repeatable daily practice for strength and conditioning with one kettlebell, at home or travelling. Learn the swing and get-up with a coach first.",
        ["home", "minimal-equipment", "time-efficient", "busy", "travel"],
        ["Practise 5-6 days a week; go lighter on tired days.",
         "Most men start around 16-24kg and most women around 12-16kg; stay below the goal weights until form is solid.",
         "Move up a bell size only when every set feels strong and controlled.",
         "The timed standards (5 min swings, 10 min get-ups) are the goal - build up to them over months."]),
    "usms-": (2, "Adults who can swim a few lengths continuously and want structured pool sessions, including those fitting a swim into a lunch break.",
        ["time-efficient", "busy"],
        ["Swim 2-3 times a week.",
         "Rest the stated time between repeats; take extra rest if form falls apart.",
         "Progress by shortening rest or adding a repeat to the main set before adding new sets.",
         "Once 1,500 yards/metres feels easy, move to intermediate endurance sets."]),
    "british-cycling-20-min": (3, "Indoor or gym cyclists of any level, including busy riders with only 20 minutes.",
        ["home", "time-efficient", "busy"],
        ["Use before every hard indoor session, or repeat it as a short workout on its own.",
         "Use one fairly high gear throughout and change cadence only.",
         "Max rev-outs are 6 seconds all-out; recover fully between them.",
         "When you want more, move to the 2x20 sweet-spot session."]),
    "british-cycling-2x20": (2, "Riders with some structured training behind them who want to raise sustainable power for sportives, time trials or racing.",
        ["home"],
        ["1-2 times a week with easy days between.",
         "Start at sweet-spot (high zone 3-mid zone 4) in the off-season; build towards FTP/threshold as the season nears.",
         "Pace both efforts evenly and keep cadence 90rpm+.",
         "Have a bottle ready; long efforts need fluids."]),
    "nuffield-boxing": (3, "Fit people who like boxing-style training and want a tough bodyweight conditioning session with almost no kit.",
        ["home", "minimal-equipment", "time-efficient"],
        ["2-3 times a week on non-consecutive days.",
         "Aim to finish each round inside 3 minutes, then rest 60s.",
         "Beginners start with 2-3 rounds and add one each session, up to 10.",
         "Warm up for 5-10 minutes first (skipping or shadow boxing)."]),
    "expertboxing-basic": (3, "Boxers and boxing-gym members with access to bags and a pad-holding partner.",
        ["full-gym"],
        ["Up to 3-4 times a week; beginners should not train hard daily.",
         "3-minute rounds with 1 minute rest; keep skipping lightly through the jump-rope breaks.",
         "Focus on speed and accuracy on the mitts, not power.",
         "Add rounds gradually as conditioning improves."]),
    "usta-dynamic-warm-up": (3, "Tennis players of every level, especially club and junior players who currently warm up by just hitting.",
        ["outdoor", "minimal-equipment", "time-efficient"],
        ["Do it before every practice or match.",
         "Each drill covers roughly a baseline-to-net length; walk back between drills.",
         "Build speed through the session, finishing with the 50/75/100% sprints.",
         "Keep static stretching for after play."]),
    "golfshake-5-minute": (3, "Golfers of any level, including older players, who want a quick warm-up on the range or at the first tee without lying down.",
        ["time-efficient", "busy", "outdoor", "older-adults", "minimal-equipment"],
        ["Do it before every round or range session.",
         "Move smoothly through comfortable range; it should not feel like a workout.",
         "Finish within 10-15 minutes of your tee time.",
         "For lasting mobility gains, add the Somax Golf Mobility & Rotation session twice a week."]),
    "classical-mat-pilates": (3, "People with some Pilates experience who want a classical mat session for core control and spinal mobility at home.",
        ["home", "minimal-equipment"],
        ["2-3 times a week.",
         "Quality over quantity: stop a set when you lose control of your breath or pelvis.",
         "Modify the Roll Up and rolling exercises with bent knees if needed.",
         "New to Pilates? Start with the Somax Pilates Core Foundations session first."]),
    "sun-salutation": (5, "Anyone wanting a short daily mobility and breathing routine, from beginners to experienced yogis. Ideal as a morning wake-up.",
        ["home", "travel", "minimal-equipment", "time-efficient", "busy"],
        ["Daily or most days; it takes 5-15 minutes.",
         "Link each pose to one breath (inhale on upward/backward moves, exhale on folds).",
         "Start with two full salutations and add rounds over time.",
         "Use cow and cat instead of eight-limbed pose and cobra if your back or wrists complain."]),
    "nhs-home-strength": (2, "New exercisers and older adults who want to build everyday strength at home with a chair.",
        ["home", "older-adults", "minimal-equipment", "time-efficient"],
        ["At least twice a week on non-consecutive days.",
         "Build reps gradually towards 10-15 before adding a heavier weight.",
         "Move slowly and with control; hold a chair for balance if needed.",
         "When it feels easy, move on to the Somax Bodyweight Starter."]),
    "nhs-flexibility": (2, "Anyone stiff from sitting, including older adults and desk workers.",
        ["home", "older-adults", "minimal-equipment", "time-efficient", "busy"],
        ["At least twice a week; daily is fine.",
         "Stretch gently - mild tension, never pain.",
         "Breathe normally and do not bounce.",
         "Add the Somax Mobility Reset for a fuller routine."]),
    "nhs-wirral-walking": (5, "Inactive people starting out, older adults, and anyone who wants low-impact daily activity.",
        ["outdoor", "older-adults", "minimal-equipment", "busy"],
        ["Walk 5 days a week, mixing comfortable-pace and medium-pace walks.",
         "Medium pace = slightly breathless but still able to talk.",
         "Add 5 minutes to your walks every week or two.",
         "Once 30 minutes at medium pace is easy, try Couch to 5K."]),
}
for p in P:
    key = next((k for k in META if p["id"].startswith(k)), None)
    assert key, p["id"]
    dpw, who, life, how = META[key]
    p["daysPerWeek"] = p.get("daysPerWeek", dpw)
    p["whoItsFor"] = who
    p["lifestyle"] = life
    p["howToRun"] = how
    p["sessionMinutes"] = int(p["duration"].split()[0])

json.dump(P, open(OUT, "w"), indent=2, ensure_ascii=False)
print(len(P), "sourced programs")
