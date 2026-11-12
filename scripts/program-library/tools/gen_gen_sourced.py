"""Sourced (credited) general-fitness + HIIT sessions for the Somax library expansion.

Every entry here was read from its sourceUrl (page, PDF text layer, or abstract via the
Europe PMC REST API) on 2026-11-13. Only facts are recorded (exercise names, sets, reps,
holds, timings, loads); description / whoItsFor / howToRun are Somax's own words.
Run:  python3 gen_gen_sourced.py ../expansion/gen-sourced.json
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
        exercises, credit, url, note, **kw):
    d = dict(id="x-gen-" + id, name=name)
    d.update(kw)
    d.update(category=category, level=level, sport=sport, goals=goals, duration=f"{minutes} min", daysPerWeek=dpw,
             sessionMinutes=minutes, equipment=equipment, description=description, whoItsFor=who, lifestyle=lifestyle,
             howToRun=how, exercises=exercises, credit=credit, sourceUrl=url, sourceNote=note, verified=True)
    P.append(d)


NHS_NOTE = "Free NHS guidance (© Crown copyright; no reproduction restriction on the page). Exercise names, reps and holds only; descriptions are ours. Credit and link to NHS."
EPMC = "Abstract read via the Europe PMC REST API on 2026-11-13."

# ============================================================== NHS (UK) routines
add("nhs-balance-exercises", "NHS Balance Exercises", "fitness", "beginner", "general",
    ["general-fitness", "mobility"], 10, 2, ["bodyweight", "wall", "step"],
    "Five short balance drills from the NHS older-adult series: side-stepping, a grapevine, heel-to-toe walking, a supported one-leg stand and a step-up.",
    "Older adults and anyone who feels a bit unsteady and wants to build balance safely at home, next to a wall or sturdy chair.",
    ["home", "older-adults", "minimal-equipment", "time-efficient"],
    ["At least twice a week, alongside the NHS strength, sitting and flexibility routines.",
     "Always do these next to a wall or stable chair you can grab.",
     "Build the reps up slowly; smaller grapevine steps and moving away from the wall make it harder.",
     "If you've had a fall in the last year, check with your GP before starting."],
    [E("Sideways Walking", 1, "10 steps each way"),
     E("Simple Grapevine", 1, "5 cross-steps/side"),
     E("Heel-to-toe Walk (fingers on wall if needed)", 1, "5+ steps"),
     E("One-leg Stand (fingertips on wall)", 3, "5-10s hold/side"),
     E("Step-up (rail or wall nearby)", 1, "up to 5/leg")],
    "NHS", "https://www.nhs.uk/live-well/exercise/strength-and-flexibility-exercises/balance-exercises/", NHS_NOTE)

add("nhs-sitting-exercises", "NHS Sitting Exercises", "fitness", "beginner", "general",
    ["mobility", "general-fitness"], 10, 2, ["chair"],
    "A gentle seated routine from the NHS: chest stretch, upper-body twist, hip marching, ankle stretches and neck rotations, all from a sturdy chair.",
    "People with limited mobility, older adults, and desk workers who want a gentle seated reset they can do without standing up.",
    ["home", "older-adults", "busy", "travel", "minimal-equipment", "time-efficient"],
    ["At least twice a week; at a desk you can do it daily.",
     "Use a solid chair without wheels or arms, and sit upright away from the backrest.",
     "Move only as far as is comfortable and build the reps up over time.",
     "If you haven't exercised for a while or are unsure it suits you, check with your GP first."],
    [E("Chest Stretch (seated)", 5, "5-10s hold"),
     E("Upper-body Twist (seated)", 5, "5s hold/side"),
     E("Hip Marching (seated)", 1, "5/leg"),
     E("Ankle Stretch (point and flex, leg raised)", 2, "5/foot"),
     E("Neck Rotation (seated)", 3, "5s hold/side")],
    "NHS", "https://www.nhs.uk/live-well/exercise/strength-and-flexibility-exercises/sitting-exercises/", NHS_NOTE)

add("nhs-warm-up", "NHS 6-Minute Warm-up", "fitness", "beginner", "general",
    ["general-fitness", "mobility"], 6, 3, ["bodyweight"],
    "The NHS's simple warm-up routine of marching, heel digs, knee lifts, shoulder rolls and shallow knee bends, taking at least 6 minutes.",
    "Anyone about to exercise who wants a quick, quiet warm-up to raise their heart rate and loosen the joints first.",
    ["home", "travel", "minimal-equipment", "time-efficient"],
    ["Do it before any workout or brisk walk.",
     "Keep the movements smooth and build the pace gradually.",
     "Keep the knee bends shallow (no more than about 10 cm).",
     "Go straight into your main session afterwards so you don't cool down."],
    [E("March on the Spot (then forwards/backwards, pumping arms)", 1, "3 min"),
     E("Heel Digs", 1, "60 in 60s"),
     E("Knee Lifts", 1, "30 in 30s"),
     E("Shoulder Rolls while marching (5 forward, 5 back)", 2, "10"),
     E("Knee Bends (lower no more than 10 cm)", 1, "10")],
    "NHS", "https://www.nhs.uk/live-well/exercise/how-to-warm-up-before-exercising/", NHS_NOTE)

add("nhs-post-exercise-stretches", "NHS Post-exercise Stretches", "fitness", "beginner", "general",
    ["mobility", "general-fitness"], 5, 3, ["bodyweight"],
    "A five-minute NHS cool-down covering the buttocks, hamstrings, inner thighs, calves and thighs, each held 15-20 seconds.",
    "Anyone finishing a walk, run or workout who wants a short, simple lower-body cool-down.",
    ["home", "travel", "minimal-equipment", "time-efficient"],
    ["Do it straight after exercise while you're still warm.",
     "Hold each stretch for 15-20 seconds without bouncing.",
     "Stretch to mild tension, never pain.",
     "Spend longer on any area that feels tight."],
    [E("Buttock Stretch", 1, "15-20s/leg"),
     E("Hamstring Stretch", 1, "15-20s/leg"),
     E("Inner Thigh Stretch", 1, "15-20s"),
     E("Calf Stretch", 1, "15-20s/leg"),
     E("Thigh Stretch", 1, "15-20s/side")],
    "NHS", "https://www.nhs.uk/live-well/exercise/how-to-stretch-after-exercising/", NHS_NOTE)

# ============================================================== Growing Stronger (Tufts / CDC)
GS_URL = "https://www.cdc.gov/physicalactivity/downloads/growing_stronger.pdf"
GS_NOTE = ("Read from the full CDC-hosted PDF (text layer). The book states it was produced for free distribution without permission, "
           "provided the authors and Tufts University are credited and the content is not changed; CDC Stacks lists it as public domain. "
           "We store only exercise names, sets, reps, tempo and holds. Weights converted from pounds (2-3 lb dumbbells, 1-3 lb ankle weights) to kg.")
GS_CREDIT = "Seguin, Epping, Buchner, Bloch & Nelson - Tufts University & CDC (Growing Stronger, 2002)"
GS_WU = [E("Warm-up: 5-minute walk (or bike/rower)", 1, "5 min")]
GS_P1 = [E("Squat to Chair (4 counts down, 2 up)", 2, "10"),
         E("Wall Push-up (4 counts down, 4 up)", 2, "10"),
         E("Toe Stand (hold 2-4s at top)", 2, "10"),
         E("Finger Marching (3 movements, ~10s hold each)", 3, "1 sequence")]
GS_P2 = [E("Biceps Curl (2 up, 4 down)", 2, "10", weight="start 1-1.5 kg"),
         E("Step-up (stairs, hold handrail)", 2, "10/leg"),
         E("Overhead Press (2 up, 4 down)", 2, "10", weight="start 1-1.5 kg"),
         E("Side Hip Raise (behind chair)", 2, "10/leg"),
         E("Grip Squeeze with a ball (optional, hold 3-5s)", 2, "10/hand")]
GS_P3 = [E("Knee Extension (seated, ankle weights)", 2, "10/leg", weight="start 0.5-1.5 kg"),
         E("Knee Curl (standing, ankle weights)", 2, "10/leg", weight="start 0.5-1.5 kg"),
         E("Pelvic Tilt (lying)", 2, "10"),
         E("Floor Back Extension (opposite arm and leg)", 2, "10/side")]
GS_CD = [E("Cool-down: Chest and Arm Stretch", 2, "20-30s"),
         E("Cool-down: Hamstring/Calf Stretch (hands on chair)", 2, "20-30s"),
         E("Cool-down: Quadriceps Stretch (hold chair)", 1, "20-30s/leg"),
         E("Cool-down: Neck, Upper Back and Shoulder Stretch", 2, "20-30s")]
GS_HOW_END = "Rest about 1 minute between sets (1-2 min in Part III); breathe throughout and never hold your breath."

add("growing-stronger-part-1", "Growing Stronger - Part I (Weeks 1-2)", "fitness", "beginner", "general",
    ["strength", "general-fitness"], 30, 3, ["chair", "wall"],
    "The gentle bodyweight start of the Tufts/CDC strength program for older adults: chair squats, wall push-ups, toe stands and finger marching, with a walk to warm up and four stretches to finish.",
    "Older adults new to strength training who want a research-built program they can start at home with just a chair and a wall.",
    ["home", "older-adults", "minimal-equipment"],
    ["Three non-consecutive days a week (e.g. Mon/Wed/Fri) for at least 2 weeks.",
     "Lower slowly to a count of 4 and rise to a count of 2-4; pillows on the chair make the squat easier.",
     GS_HOW_END,
     "After 2 weeks, move on to Part II."],
    GS_WU + GS_P1 + GS_CD, GS_CREDIT, GS_URL, GS_NOTE, series="Growing Stronger", day=1, daysInSeries=3)

add("growing-stronger-part-2", "Growing Stronger - Part II (Weeks 3-6)", "fitness", "beginner", "general",
    ["strength", "general-fitness"], 40, 3, ["chair", "wall", "dumbbells", "step"],
    "Part II adds light dumbbells and stairs: biceps curls, step-ups, overhead presses and side hip raises on top of the Part I exercises.",
    "Older adults who have done Part I for two weeks and are ready to add light dumbbells.",
    ["home", "older-adults", "minimal-equipment"],
    ["Two or three times a week for 4 weeks, keeping a rest day between.",
     "Start with 1-1.5 kg dumbbells; the right weight lets you do 10 reps and no more in good form.",
     "Reassess after each week; go heavier when you can do more than 10 reps well. " + GS_HOW_END,
     "After 4 weeks of Parts I and II, move on to Part III."],
    GS_WU + GS_P1 + GS_P2 + GS_CD, GS_CREDIT, GS_URL, GS_NOTE, series="Growing Stronger", day=2, daysInSeries=3)

add("growing-stronger-part-3", "Growing Stronger - Part III (Weeks 7+)", "fitness", "intermediate", "general",
    ["strength", "general-fitness"], 50, 3, ["chair", "wall", "dumbbells", "step", "ankle weights", "mat"],
    "The full 12-exercise program: Parts I and II plus ankle-weight knee extensions and curls, pelvic tilts and floor back extensions.",
    "Older adults who have completed Parts I and II and want the complete long-term strength program.",
    ["home", "older-adults"],
    ["Two or three non-consecutive days a week, ongoing.",
     "Do the knee extension and knee curl together, and the pelvic tilt and back extension together.",
     "Start ankle weights at 0.5-1.5 kg; progress when 10 reps feel easy. Never walk or jog wearing ankle weights.",
     GS_HOW_END],
    GS_WU + GS_P1 + GS_P2 + GS_P3 + GS_CD, GS_CREDIT, GS_URL, GS_NOTE, series="Growing Stronger", day=3, daysInSeries=3)

# ============================================================== Safe Exercise at Home (Australian physios)
add("safe-exercise-at-home-level-2", "Safe Exercise at Home - Level 2 Program", "fitness", "beginner", "general",
    ["general-fitness", "strength", "mobility"], 15, 5, ["chair", "stable support"],
    "The free example program from Australia's Safe Exercise at Home site (Level 2 - Moderate): stepping to targets, calf raises, sit-to-stands and a semi-tandem balance hold, plus hourly activity breaks.",
    "Older Australians at a moderate level who want a short physio-designed strength and balance routine at home, with a kitchen bench or sturdy support nearby.",
    ["home", "older-adults", "minimal-equipment", "time-efficient"],
    ["Little and often works best: most days of the week, plus a 5-minute activity break every hour.",
     "Keep a stable support (kitchen bench, table) within reach; use hand support whenever you feel unsteady.",
     "Harder: use less hand support, a lower chair, or bigger steps; easier: a higher chair or hands to help.",
     "If you've had two or more falls in the past year, start at Level 1 and talk to your doctor or physio."],
    [E("Stepping to Targets (hand support nearby, alternate legs)", 1, "practise each leg"),
     E("Bilateral Calf Raise (holding support)", 1, "10-15"),
     E("Sit-to-Stand (narrow base, weight even on both feet)", 1, "10-15"),
     E("Semi-tandem Stance (support nearby)", 3, "up to 30s each foot forward"),
     E("Activity Break (walk around the house)", 1, "5 min every hour")],
    "Safe Exercise at Home (Australian physiotherapists; endorsed by the Australian Physiotherapy Association)",
    "https://www.safeexerciseathome.org.au/level-2-exercises",
    "Free site and example-program PDF read 2026-11-13; no copyright or reproduction terms stated. The PDF's exercises and images are credited to physiotherapyexercises.com (used with permission); we store names and reps only, no images. Activity-break dose is from the Level 2 page.")

# ============================================================== Postnatal (Royal Women's Hospital, Melbourne)
add("royal-womens-postnatal-recovery", "Royal Women's Postnatal Recovery Exercises", "other", "beginner", "general",
    ["general-fitness", "strength"], 20, 7, ["bodyweight"],
    "The Royal Women's Hospital physiotherapy routine for after birth: pelvic floor long holds and quick squeezes, a deep abdominal hold, and gentle walking that builds towards 30 minutes a day.",
    "New mums in the days and weeks after birth (vaginal or caesarean) who want the hospital physio basics before any return to harder exercise.",
    ["home", "minimal-equipment", "time-efficient"],
    ["Pelvic floor and deep abdominal exercises 3 times a day; they can start 1-2 days after birth if they don't increase pain.",
     "Breathe normally and keep your bottom, thighs and upper tummy relaxed; build holds from 2-3s towards 10s.",
     "Walk gently as comfort allows, gradually building distance and speed towards 30 minutes a day.",
     "Avoid weights, sit-ups, running and other strenuous or high-impact exercise for the first 12 weeks, and lift nothing heavier than your baby for 6 weeks. Report any leaking to your midwife, physio or doctor."],
    [E("Pelvic Floor Long Hold (5s rest between)", 1, "10 x 2-3s hold, building to 10 x 10s"),
     E("Pelvic Floor Quick Squeeze (1s)", 1, "10-20"),
     E("Deep Abdominal Hold (lying knees bent, or on hands and knees)", 1, "6-10 x 3-5s hold"),
     E("Functional Brace (pelvic floor squeeze when coughing, sneezing or lifting)", 1, "as needed"),
     E("Gentle Walk", 1, "as comfortable, building to 30 min")],
    "The Royal Women's Hospital (Victoria) Physiotherapy Department",
    "https://www.thewomens.org.au/images/uploads/fact-sheets/Improving-your-recovery-after-birth-240219.pdf",
    "Free patient fact sheet (© The Royal Women's Hospital 2013-2019; general-information disclaimer, no reproduction restriction). Read from the PDF text layer. Timeline cross-checked against Better Health Channel (Vic) 'Postnatal exercise' page.")

# ============================================================== Travel (NHS Scotland Right Decisions)
add("nhs-scotland-hotel-room-circuit", "Hotel Room Circuit (NHS Scotland)", "fitness", "advanced", "general",
    ["general-fitness", "strength", "endurance"], 50, 3, ["bodyweight", "chair", "luggage", "stairs"],
    "A minimal-equipment circuit from an NHS lower-limb rehab group, built for holidays and working away: planks, luggage deadlifts and rows, step-ups, dips, push-ups, 20/10 burpee and mountain-climber blocks, wall squats and stair runs.",
    "Fit travellers who want a long, hard full-body session in a hotel room using a chair, the bed, a suitcase and the stairs.",
    ["travel", "minimal-equipment", "home"],
    ["Up to 3 times a week while away; it is long, so trim exercises on short days.",
     "Warm up first with a slow jog outside or jumping jacks.",
     "Hold planks and wall squats for as long as you can with good form; split the flutter-kick minute with 10s rests if needed.",
     "Choose incline push-ups if decline push-ups are too hard; stop anything that hurts."],
    [E("Warm-up: slow jog or jumping jacks", 1, "until warm"),
     E("Plank (max hold)", 3, "max"),
     E("Single-leg Deadlift holding luggage", 1, "10-15"),
     E("Contralateral Limb Raise (lying face down, 10s hold)", 1, "10/side"),
     E("Superman / Bird Dog on hands and knees (10s hold)", 1, "10/side"),
     E("Flutter Kicks", 1, "60s"),
     E("Step-up onto bed or chair", 1, "10/leg"),
     E("Mountain Climber (20s on / 10s off)", 8, "20s"),
     E("Triceps Dip (chair, bath or bed edge)", 3, "6-8"),
     E("Incline Push-up (or Decline Push-up, 5 x 10)", 3, "10-15"),
     E("Luggage Row", 3, "15/side"),
     E("Single-leg Prisoner Squat from bed or chair", 3, "8/leg"),
     E("Plank Saw", 1, "30s"),
     E("Burpee (20s on / 10s off)", 8, "20s"),
     E("Plank to Push-up", 3, "10"),
     E("Wall Squat", 3, "30-60s"),
     E("Stair Run (1-2 flights up, walk or jog down)", 10, "1 climb")],
    "Becky Dunphy & Tyler Spencer (NHS Scotland Right Decision Service)",
    "https://rightdecisions.scot.nhs.uk/media/1guhiwn5/hotel-room-circuit-with-minimal-equipment.pdf",
    "Free NHS Scotland PDF (created July 2019) read from its text layer; no copyright or reproduction wording. The source gives no reps for the step-ups or plank saw, so '10/leg' and '30s' are Somax placeholders; stair runs are 10-15 in the source (we list 10). Names and doses only.")

# ============================================================== Research protocols (walking / stairs)
add("interval-walking-training", "Interval Walking Training (3 min fast / 3 min slow)", "walk", "beginner", "general",
    ["endurance", "strength", "general-fitness"], 30, 4, ["bodyweight"],
    "The Japanese interval-walking protocol: alternate 3 minutes of slow walking with 3 minutes of fast walking, 5 or more times. In 63-year-olds over 5 months it raised thigh strength and aerobic fitness more than steady walking.",
    "Middle-aged and older adults who walk already and want more benefit from the same time, with no running.",
    ["outdoor", "older-adults", "minimal-equipment"],
    ["4 or more days a week.",
     "Slow sections are an easy stroll; fast sections are a brisk, purposeful walk where talking gets hard.",
     "Do at least 5 slow/fast pairs (30 minutes); you can add more pairs as you get fitter.",
     "Check with your GP first if you have a heart condition or high blood pressure."],
    [E("Slow Walk (~40% of peak walking capacity)", 5, "3 min", group="A"),
     E("Fast Walk (above 70% of peak walking capacity)", 5, "3 min", group="A")],
    "Nemoto K, Gen-no H, Masuki S, Okazaki K, Nose H, Mayo Clin Proc 2007",
    "https://pubmed.ncbi.nlm.nih.gov/17605959/",
    EPMC + " Protocol (5+ sets of 3 min at 40% / 3 min above 70% of peak aerobic capacity for walking, 4+ days/week, 5 months) taken from the abstract; talk-test wording is our interpretation.")

add("stair-climbing-snacks", "Stair-Climbing Exercise Snacks", "fitness", "beginner", "general",
    ["endurance", "general-fitness"], 5, 3, ["stairs"],
    "Three short bursts a day of climbing a 3-flight (60-step) stairwell briskly, spaced 1-4 hours apart. Sedentary young adults improved their aerobic fitness after 6 weeks.",
    "Office workers and busy people with access to stairs who can't fit in a full workout but can take three 1-minute breaks a day.",
    ["busy", "time-efficient", "minimal-equipment"],
    ["3 days a week for 6 weeks (the study dose).",
     "Climb the 3 flights vigorously (fast, breathing hard), then walk or take the lift down.",
     "Leave 1-4 hours between bouts; it fits around meetings and breaks.",
     "Use the handrail, and skip it if you have chest pain, dizziness or a heart condition without clearance."],
    [E("Vigorous Stair Climb (3 flights, 60 steps)", 3, "1 climb, 1-4 h apart")],
    "Jenkins EM, Nairn LN, Skelly LE, Little JP, Gibala MJ, Appl Physiol Nutr Metab 2019",
    "https://pubmed.ncbi.nlm.nih.gov/30649897/", EPMC)

# ============================================================== HIIT research protocols
WU_ADD = E("Warm-up: easy cycling (added by Somax; not stated in the abstract)", 1, "5 min")
CD_ADD = E("Cool-down: easy cycling (added by Somax)", 1, "3-5 min")

add("hood-10x1-intervals", "10 x 1-Minute Intervals (Hood/Gibala, sedentary adults)", "fitness", "intermediate", "hiit",
    ["endurance", "general-fitness"], 30, 3, ["exercise bike"],
    "The submaximal 'practical' HIIT model tested in sedentary middle-aged adults: ten 1-minute cycling efforts with 1 minute easy between. Six sessions over 2 weeks raised muscle oxidative capacity and insulin sensitivity by about 35%.",
    "Previously inactive adults who now have a base of 20+ minutes' continuous cardio and want a proven, hard-but-not-all-out interval session.",
    ["home", "time-efficient", "busy"],
    ["3 non-consecutive days a week (6 sessions over 2 weeks in the study).",
     "Efforts are hard but steady (~80-95% of heart-rate reserve; only a few words possible), not sprints.",
     "Keep pedalling easily during the 1-minute recoveries.",
     "Only start once you can do 20 minutes of continuous moderate cardio and have no heart-health red flags."],
    [WU_ADD,
     E("Hard Cycling Effort (~60% of peak power, ~80-95% HR reserve)", 10, "60s", group="A"),
     E("Easy Recovery Cycling", 10, "60s", group="A"),
     CD_ADD],
    "Hood MS, Little JP, Tarnopolsky MA, Myslik F, Gibala MJ, Med Sci Sports Exerc 2011",
    "https://europepmc.org/article/MED/21448086",
    EPMC + " Same 10 x 60 s model as Little et al. 2010/2011 and Gibala's GSSI SSE #139 review (also read). Warm-up/cool-down added by Somax.")

add("gillen-one-minute-workout", "The One-Minute Workout (3 x 20s sprints, 10 min)", "fitness", "advanced", "hiit",
    ["endurance", "fat-loss", "general-fitness"], 10, 3, ["exercise bike"],
    "Gibala's group's 10-minute sprint protocol: 2 minutes easy, three 20-second all-out sprints with 2 minutes easy between, 3 minutes cool-down. Over 12 weeks it improved VO2peak by 19%, the same as 45 minutes of moderate cycling.",
    "Already-fit, health-cleared people who are very short of time and have a bike with adjustable resistance.",
    ["home", "time-efficient", "busy"],
    ["3 sessions a week on non-consecutive days (12 weeks in the study).",
     "Sprints are genuinely all-out against heavy resistance (about 5% of body mass on a lab bike).",
     "Keep spinning very easily (~50 W) between sprints; don't stop dead.",
     "Advanced only: build up from easier intervals first and get medical clearance if you have any heart risk."],
    [E("Warm-up: easy cycling (~50 W)", 1, "2 min"),
     E("All-out Sprint", 3, "20s", weight="resistance ~5% body mass", group="A"),
     E("Easy Cycling between sprints (~50 W)", 2, "2 min", group="A"),
     E("Cool-down: easy cycling (~50 W)", 1, "3 min")],
    "Gillen JB, Martin BJ, MacInnis MJ, Skelly LE, Tarnopolsky MA, Gibala MJ, PLOS ONE 2016",
    "https://pmc.ncbi.nlm.nih.gov/articles/PMC4846072/",
    "Full text read on PMC; open access under CC BY 4.0. Same protocol in overweight adults: Gillen et al. PLOS ONE 2014 (PMC4218754, CC BY).")

add("wingate-sprint-intervals", "Wingate Sprint Intervals (4-7 x 30s)", "fitness", "advanced", "hiit",
    ["endurance", "sport-performance"], 35, 3, ["exercise bike"],
    "The classic sprint-interval protocol: four to seven 30-second all-out cycling sprints with 4 minutes of recovery. Six sessions over 2 weeks doubled cycling endurance capacity in recreationally active people.",
    "Fit, health-cleared people chasing a big fitness jump in a short block, with a bike that can take hard sprints.",
    ["home", "time-efficient"],
    ["3 sessions a week with 1-2 rest days between (6 sessions over 2 weeks in the study).",
     "Start at 4 sprints and add one per session or two, up to 7.",
     "Each sprint is maximal from the first second; recover with very easy pedalling.",
     "Very demanding: advanced users only, never on consecutive days, and stop for chest pain or dizziness."],
    [WU_ADD,
     E("All-out Sprint (Wingate)", 4, "30s (build to 7 sprints)", group="A"),
     E("Recovery (very easy cycling)", 4, "4 min", group="A"),
     CD_ADD],
    "Burgomaster KA, Hughes SC, Heigenhauser GJ, Bradwell SN, Gibala MJ, J Appl Physiol 2005",
    "https://pubmed.ncbi.nlm.nih.gov/15705728/",
    EPMC + " Protocol also described in Gibala's GSSI SSE #139 (read). Warm-up/cool-down added by Somax.")

add("tabata-protocol", "Tabata Protocol (original 20s/10s)", "fitness", "advanced", "hiit",
    ["endurance", "sport-performance"], 20, 2, ["exercise bike"],
    "The original Tabata study protocol: seven to eight 20-second efforts at about 170% of VO2max with 10 seconds' rest, to exhaustion. It raised both VO2max and anaerobic capacity in young, fit men.",
    "Already very fit people who want the real Tabata stimulus. Most app 'Tabata' workouts are far easier than this.",
    ["home", "time-efficient"],
    ["The study trained 5 days a week for 6 weeks in fit young men; Somax suggests 2-3 a week at most.",
     "Each 20s effort is supramaximal - harder than you could hold for even a minute; stop when you can no longer hold the pace.",
     "Rest is only 10 seconds: stay on the bike.",
     "Advanced only, with no heart-health red flags."],
    [WU_ADD,
     E("Supramaximal Effort (~170% VO2max)", 8, "20s (7-8 to exhaustion)", group="A"),
     E("Rest", 8, "10s", group="A"),
     CD_ADD],
    "Tabata I, Nishimura K, Kouzaki M, Hirai Y, Ogita F, Miyachi M, Yamamoto K, Med Sci Sports Exerc 1996",
    "https://pubmed.ncbi.nlm.nih.gov/8897392/",
    EPMC + " Mechanically braked cycle ergometer in the study. Warm-up/cool-down added by Somax.")

add("rehit-reduced-exertion", "REHIT - Reduced-Exertion HIIT (10 min)", "fitness", "intermediate", "hiit",
    ["endurance", "general-fitness"], 10, 3, ["exercise bike"],
    "A 10-minute session of easy cycling with just two short all-out sprints, building from 10s to 20s over 6 weeks. Sedentary adults rated it only 'somewhat hard' and still improved aerobic capacity by 12-15%.",
    "Inactive adults who find classic HIIT too punishing and want the smallest effective dose on a stationary bike.",
    ["home", "time-efficient", "busy"],
    ["3 sessions a week for 6 weeks.",
     "Week 1: 10s sprints (just one in your first session); weeks 2-3: 15s; weeks 4-6: 20s.",
     "Everything outside the two sprints is easy pedalling at light resistance.",
     "You still need a 20-minute continuous cardio base and no heart-health red flags first."],
    [E("Easy Cycling (light resistance, ~60 W), whole session", 1, "10 min"),
     E("All-out Sprint within the 10 minutes", 2, "10s wk1 / 15s wk2-3 / 20s wk4-6")],
    "Metcalfe RS, Babraj JA, Fawkner SG, Vollaard NB, Eur J Appl Physiol 2012",
    "https://pubmed.ncbi.nlm.nih.gov/22124524/",
    EPMC + " The abstract does not say where in the 10 minutes the sprints fall.")

add("10-20-30-running", "10-20-30 Running Intervals", "run", "intermediate", "hiit",
    ["endurance", "sport-performance", "general-fitness"], 35, 3, ["bodyweight"],
    "The 10-20-30 concept: repeat 30 seconds easy, 20 seconds moderate and 10 seconds near-sprint five times in a row (5 minutes), for 3-4 blocks with 2 minutes' recovery. Runners improved 5 km time and blood pressure on half their usual volume.",
    "Runners who can already jog 30 minutes and want a time-efficient, fun interval session on a flat route or oval.",
    ["outdoor", "minimal-equipment", "time-efficient"],
    ["2-3 times a week in place of other runs (frequency is a Somax suggestion; the study replaced all training for 7 weeks).",
     "Easy = under 30% effort, moderate = under 60%, the 10s = over 90% (near flat-out).",
     "Start with 3 blocks and build to 4.",
     "Warm up with 10 minutes of easy jogging first."],
    [E("Warm-up: easy jog (added by Somax)", 1, "10 min"),
     E("10-20-30 block: 30s easy jog / 20s moderate run / 10s near-sprint, x5", 4, "5 min (3-4 blocks)", group="A"),
     E("Recovery between blocks", 3, "2 min", group="A"),
     E("Cool-down: easy jog or walk", 1, "5 min")],
    "Gunnarsson TP & Bangsbo J, J Appl Physiol 2012",
    "https://pubmed.ncbi.nlm.nih.gov/22556401/",
    EPMC + " Warm-up/cool-down added by Somax.")

json.dump(P, open(OUT, "w"), indent=2, ensure_ascii=False)
print(len(P), "sourced written")
