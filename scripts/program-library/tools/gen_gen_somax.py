"""Somax ORIGINAL general-fitness + HIIT sessions (library expansion, 2026-11-13).

Designed from playbooks/general.json (fat-loss, general-fitness, hiit, older-adults) and the
credited sessions in sourced-programs.json + expansion/gen-sourced.json (listed in basedOn).
Rules followed: HIIT gated behind 20 min continuous cardio for beginners; beginner HIIT uses
submaximal 30-60 s efforts with recovery >= work; Tabata-style only at advanced; max 3 HIIT/wk;
older-adult balance work always next to support; postnatal kept conservative (pelvic floor first,
no crunches/planks/impact before 12 weeks and clearance).
Run:  python3 gen_gen_somax.py ../expansion/gen-somax.json
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
        exercises, basedOn, **kw):
    assert len(how) == 4, id
    d = dict(id="x-gen-somax-" + id, name=name)
    d.update(kw)
    d.update(category=category, level=level, sport=sport, goals=goals, duration=f"{minutes} min", daysPerWeek=dpw,
             sessionMinutes=minutes, equipment=equipment, description=description, whoItsFor=who, lifestyle=lifestyle,
             howToRun=how, exercises=exercises, credit="Somax", sourceUrl="", sourceNote="Original Somax program.",
             basedOn=basedOn, verified=False)
    P.append(d)


# ---- shared blocks
HOME_WU = [E("Warm-up: march on the spot", 1, "2 min"), E("Warm-up: arm circles", 1, "10 each way"),
           E("Warm-up: hip circles", 1, "10 each way"), E("Warm-up: bodyweight squat (easy)", 1, "10")]
NHS_WU = [E("Warm-up: march on the spot, heel digs, knee lifts", 1, "4 min"), E("Warm-up: shoulder rolls", 1, "10")]
BIKE_WU = [E("Warm-up: easy cycling, building gradually", 1, "8 min")]
BIKE_CD = E("Cool-down: easy cycling", 1, "5 min")
WALK_WU = E("Warm-up: easy walk", 1, "5 min")
WALK_CD = E("Cool-down: easy walk", 1, "5 min")
JOG_WU = [E("Warm-up: easy jog", 1, "10 min"), E("Leg swings (front/back and side)", 1, "10/leg"), E("Walking lunge", 1, "10")]
STRETCH = E("Cool-down stretch (calves, thighs, hips, chest)", 1, "5 min")
GENTLE_STRETCH = E("Cool-down: gentle stretches (calf, thigh, chest), 20-30s holds", 1, "4 min")

HIIT_GATE = "Only start interval training once you can do 20 minutes of continuous moderate cardio and have no heart-health red flags (chest pain, dizziness, known heart condition)."
ADV_GATE = "Advanced only: you should already train hard regularly. Stop for chest pain, dizziness or a racing, irregular heartbeat."
MAX_HIIT = "No more than 3 interval sessions a week, never on back-to-back days; walk or do strength on the other days."

# ===================================================================================== HIIT - BEGINNER
add("starter-intervals-bike", "Somax Starter Intervals (Bike 30/60)", "fitness", "beginner", "hiit",
    ["endurance", "fat-loss", "general-fitness"], 22, 2, ["exercise bike"],
    "Your first proper interval session: six 30-second hard efforts with a full minute of easy pedalling after each. Hard but never all-out.",
    "New interval trainers who can already ride or walk briskly for 20 minutes and want a safe first step into HIIT on a stationary bike.",
    ["home", "time-efficient", "busy"],
    [HIIT_GATE,
     "Efforts are about 7-8/10: breathing hard, only a few words possible. Recoveries are easy spinning.",
     "Progress one thing at a time each week: 6 -> 8 -> 10 efforts, then 30s -> 45s, then shorter recoveries.",
     "When 10 x 45s feels controlled, move on to the 10 x 1-minute intervals."],
    BIKE_WU + [E("Hard Effort (7-8/10)", 6, "30s", group="A"), E("Easy Spin", 6, "60s", group="A"), BIKE_CD],
    ["x-gen-hood-10x1-intervals", "x-gen-rehit-reduced-exertion"])

add("starter-hill-walk-intervals", "Somax Starter Hill-Walk Intervals", "walk", "beginner", "hiit",
    ["endurance", "fat-loss", "general-fitness"], 30, 2, ["bodyweight"],
    "Walk-based intervals for people who don't run: power-walk up a hill for 45 seconds, then stroll back down, eight times.",
    "Walkers, larger bodies and anyone with cranky knees who want to lift their fitness without running or jumping.",
    ["outdoor", "minimal-equipment", "older-adults", "time-efficient"],
    [HIIT_GATE,
     "Uphill sections are a fast, driving walk with arms pumping (7/10); the walk back down is your recovery.",
     "No hill? Use a flight of stairs, a ramp, or a treadmill incline of 6-10%.",
     "Build from 6 to 10 climbs, then lengthen each climb to 60-90 seconds."],
    [WALK_WU, E("Power Walk Uphill (7/10)", 8, "45s", group="A"), E("Easy Walk Back Down", 8, "90s", group="A"), WALK_CD],
    ["x-gen-interval-walking-training", "nhs-wirral-walking-plan-medium-walk"])

add("band-intervals-15", "Somax Resistance Band Intervals 15", "fitness", "beginner", "hiit",
    ["fat-loss", "general-fitness", "strength"], 15, 3, ["bands"],
    "A quick standing circuit with one resistance band: 30 seconds on, 30 seconds off, two rounds. It works the whole body and gets you breathing hard with no jumping.",
    "Beginners with a band at home or in a suitcase who want a short, quiet session that mixes strength and cardio.",
    ["home", "travel", "minimal-equipment", "time-efficient", "busy"],
    [HIIT_GATE,
     "Work steadily for 30s at about 7/10, rest 30s, and rest 1 minute between rounds.",
     "Shorten your grip on the band or step further away to make it harder.",
     "Progress to 3 rounds, then to 40s on / 20s off."],
    HOME_WU + [E("Band Squat to Overhead Press", 2, "30s", group="A"), E("Band Bent-over Row", 2, "30s", group="A"),
               E("Fast March / Step-touch", 2, "30s", group="A"), E("Band Chest Press (anchored behind)", 2, "30s", group="A"),
               E("Band Pull-apart", 2, "30s", group="A"), E("Standing Knee Drive (alternating)", 2, "30s", group="A")],
    ["seven-minute-workout", "x-gen-hood-10x1-intervals"])

add("step-cardio-intervals", "Somax Step Cardio Intervals", "fitness", "beginner", "hiit",
    ["fat-loss", "endurance", "general-fitness"], 20, 3, ["step"],
    "Low-impact intervals on a single step or the bottom stair: step-ups, toe taps and side step-overs for 40 seconds, then 40 seconds easy.",
    "Beginners who want their heart rate up without jumping, and people in flats where noise matters.",
    ["home", "minimal-equipment", "time-efficient"],
    [HIIT_GATE,
     "Use a stable step 15-20 cm high; hold a rail or wall if you need balance.",
     "40s at 7/10, then 40s of easy marching; 2 rounds, 1 minute rest between rounds.",
     "Progress to 3 rounds or a slightly higher step - not both in the same week."],
    HOME_WU + [E("Alternating Step-up", 2, "40s", group="A"), E("Easy March", 2, "40s", group="A"),
               E("Fast Toe Taps on the Step", 2, "40s", group="A"), E("Easy March", 2, "40s", group="A"),
               E("Side Step-over (across the step)", 2, "40s", group="A"), E("Easy March", 2, "40s", group="A"),
               E("Step-up with Knee Drive", 2, "40s/side", group="A"), GENTLE_STRETCH],
    ["x-gen-interval-walking-training", "x-gen-growing-stronger-part-2", "seven-minute-workout"])

add("dumbbell-hiit-starter-20", "Somax Dumbbell HIIT Starter 20", "fitness", "beginner", "hiit",
    ["fat-loss", "general-fitness", "strength"], 20, 3, ["dumbbells"],
    "Light dumbbells, 30 seconds on and 30 off: squats, rows, presses and hinges in a gentle circuit that builds work capacity and strength together.",
    "Beginners with a light pair of dumbbells (2-6 kg) who want a 20-minute home session they can grow into.",
    ["home", "minimal-equipment", "time-efficient", "busy"],
    [HIIT_GATE,
     "Pick dumbbells you could lift 15+ times; this is about smooth, continuous reps, not heavy lifting.",
     "30s on / 30s off, 2 rounds with 1 minute rest between.",
     "Progress to 3 rounds, then to the Somax Dumbbell Fat-Loss Circuit."],
    HOME_WU + [E("Dumbbell Goblet Squat", 2, "30s", group="A"), E("Dumbbell Bent-over Row", 2, "30s", group="A"),
               E("Dumbbell Romanian Deadlift", 2, "30s", group="A"), E("Dumbbell Shoulder Press", 2, "30s", group="A"),
               E("Dumbbell Step-back Lunge (alternating)", 2, "30s", group="A"), E("Dumbbell Punches (light)", 2, "30s", group="A"), STRETCH],
    ["seven-minute-workout", "nhs-home-strength-exercises", "x-gen-hood-10x1-intervals"])

add("10-minute-kitchen-intervals", "Somax 10-Minute Kitchen Intervals", "fitness", "beginner", "hiit",
    ["fat-loss", "general-fitness"], 10, 3, ["bodyweight"],
    "A standing-only 10 minutes you can do while the kettle boils: 2 minutes' warm-up, five 30-second efforts with 30 seconds easy, and a short cool-down.",
    "Busy parents and beginners who need something they can fit in anywhere, in work clothes, with no floor work.",
    ["home", "busy", "time-efficient", "minimal-equipment", "travel"],
    [HIIT_GATE,
     "Work at 7/10 for 30s, then march easily for 30s.",
     "Use the kitchen bench for the incline push-ups.",
     "Do it twice in a day (morning and evening) for a 20-minute total."],
    [E("Warm-up: march, arm swings, hip circles", 1, "2 min"),
     E("Fast Bodyweight Squat", 1, "30s", group="A"), E("Incline Push-up on Bench", 1, "30s", group="A"),
     E("Step-back Lunge (alternating)", 1, "30s", group="A"), E("Skater Step (no jump)", 1, "30s", group="A"),
     E("Fast Feet March", 1, "30s", group="A"), E("Easy March between efforts", 5, "30s", group="A"),
     E("Cool-down: slow march and calf stretch", 1, "2 min")],
    ["seven-minute-workout", "x-gen-nhs-warm-up"])

# ===================================================================================== HIIT - INTERMEDIATE
add("hill-repeats-8x60", "Somax Hill Repeats 8 x 60s", "run", "intermediate", "hiit",
    ["endurance", "fat-loss", "sport-performance"], 35, 2, ["bodyweight"],
    "Eight 60-second hard runs up a steady hill, walking or jogging back down to recover. Hills build aerobic power with less pounding than flat sprints.",
    "Runners and joggers who can run 30 minutes continuously and want one hard session a week outdoors.",
    ["outdoor", "minimal-equipment", "time-efficient"],
    ["1-2 times a week, with at least 48 hours between hard sessions.",
     "Run up at 8/10 - strong and repeatable, the same pace on rep 8 as rep 1.",
     "Walk or jog slowly back down; start the next rep when you reach the bottom.",
     "Progress to 10 reps, then to 90-second hills."],
    JOG_WU + [E("Uphill Run (8/10)", 8, "60s", group="A"), E("Walk/Jog Back Down", 8, "90s", group="A"),
              E("Cool-down: easy jog or walk", 1, "5 min")],
    ["ntnu-4x4-intervals", "x-gen-hood-10x1-intervals"])

add("emom-20-bodyweight", "Somax EMOM 20 (Bodyweight)", "fitness", "intermediate", "hiit",
    ["fat-loss", "general-fitness", "strength"], 28, 3, ["bodyweight"],
    "Every minute on the minute for 20 minutes: four rotating stations of squats, push-ups, lunges and a plank, with whatever's left of each minute as rest.",
    "People who can do 8+ push-ups and want a structured, self-paced bodyweight session that's easy to track.",
    ["home", "travel", "minimal-equipment", "time-efficient"],
    ["3 non-consecutive days a week.",
     "Start each station at the top of the minute; finish the reps and rest until the next minute starts.",
     "If you can't finish with at least 15s spare, drop the reps for the next round.",
     "Progress by adding 2 reps per station or a 6th round (24 minutes)."],
    HOME_WU + [E("Minute 1: Bodyweight Squat", 5, "15", group="A"), E("Minute 2: Push-up (knees or incline if needed)", 5, "8-10", group="A"),
               E("Minute 3: Reverse Lunge (alternating)", 5, "12 total", group="A"), E("Minute 4: Plank", 5, "30s", group="A"), STRETCH],
    ["seven-minute-workout", "bwf-recommended-routine"])

add("amrap-15-dumbbell", "Somax AMRAP 15 (Dumbbells)", "fitness", "intermediate", "hiit",
    ["fat-loss", "strength", "general-fitness"], 25, 2, ["dumbbells"],
    "As many rounds as possible in 15 minutes of goblet squats, push presses, rows and lunges. Log your rounds and try to beat them next time.",
    "People who train at home with a pair of moderate dumbbells and like a score to chase.",
    ["home", "minimal-equipment", "time-efficient"],
    ["Twice a week, with at least 2 days between.",
     "Move continuously at a pace you can hold for 15 minutes - most people manage 4-6 rounds.",
     "Rest only as needed; put the dumbbells down rather than letting form slip.",
     "Write down your rounds + reps; beat them by a few reps next time, or go up a dumbbell size."],
    HOME_WU + [E("Dumbbell Goblet Squat", 5, "8", group="A"), E("Dumbbell Push Press", 5, "8", group="A"),
               E("Dumbbell Bent-over Row", 5, "8/arm", group="A"), E("Dumbbell Reverse Lunge (alternating)", 5, "10 total", group="A"), STRETCH],
    ["seven-minute-workout", "strongfirst-simple-and-sinister"])

add("kettlebell-swing-emom", "Somax Kettlebell Swing EMOM 16", "fitness", "intermediate", "hiit",
    ["fat-loss", "endurance", "strength"], 25, 2, ["kettlebell"],
    "Sixteen minutes alternating swings and goblet squats every minute - the kettlebell's classic fat-burning, posterior-chain-building combo.",
    "People who already know how to hip-hinge and swing a kettlebell safely and want a short, sweaty session.",
    ["home", "minimal-equipment", "time-efficient"],
    ["Twice a week, not on consecutive days.",
     "Odd minutes: 15 swings. Even minutes: 8 goblet squats. Rest for the remainder of each minute.",
     "Swings are a hip snap, not a squat or an arm lift; stop the set if your back takes over.",
     "Progress to 20 swings, or a heavier bell once all 16 minutes feel smooth."],
    HOME_WU + [E("Kettlebell Deadlift (practice)", 1, "10"),
               E("Odd Minutes: Two-hand Kettlebell Swing", 8, "15", group="A"),
               E("Even Minutes: Kettlebell Goblet Squat", 8, "8", group="A"), STRETCH],
    ["strongfirst-simple-and-sinister", "x-gen-hood-10x1-intervals"])

add("jump-rope-intervals", "Somax Jump Rope Intervals", "fitness", "intermediate", "hiit",
    ["endurance", "fat-loss", "sport-performance"], 25, 2, ["jump rope"],
    "Three blocks of five 30-second skipping bursts with 30 seconds' rest, plus 2 minutes between blocks. Great for footwork, calves and fitness.",
    "People who can already skip for a minute or two without tripping and want a portable cardio session.",
    ["home", "travel", "outdoor", "minimal-equipment", "time-efficient"],
    [HIIT_GATE,
     "Skip on a forgiving surface (wood, rubber, grass), staying light on the balls of your feet.",
     "Work at 8/10; rest by walking around.",
     "Progress to 40s on / 20s off, then add a fourth block."],
    HOME_WU + [E("Easy Skipping (warm-up)", 1, "2 min"),
               E("Fast Skipping", 15, "30s", group="A"), E("Rest (walk around)", 15, "30s", group="A"),
               E("Block break (every 5 rounds)", 2, "2 min", group="A"), E("Calf and Achilles Stretch", 1, "30s/leg")],
    ["seven-minute-workout", "x-gen-hood-10x1-intervals"])

add("pyramid-bike-intervals", "Somax Pyramid Bike Intervals", "fitness", "intermediate", "hiit",
    ["endurance", "fat-loss"], 30, 2, ["exercise bike"],
    "Hard efforts climbing from 30 seconds to 2 minutes and back down again, each followed by the same time easy. Variety that keeps a bike session interesting.",
    "Indoor-bike users who've done the starter intervals and want something longer and more varied.",
    ["home", "time-efficient"],
    [HIIT_GATE,
     "Shorter efforts are harder (8/10); the 2-minute effort is strong but steady (7/10).",
     "Recover with easy spinning for the same time as the effort just done.",
     "Progress by adding a second 2-minute effort at the top of the pyramid."],
    BIKE_WU + [E("Hard 30s", 1, "30s", group="A"), E("Hard 60s", 1, "60s", group="A"), E("Hard 90s", 1, "90s", group="A"),
               E("Hard 2 min", 1, "2 min", group="A"), E("Hard 90s", 1, "90s", group="A"), E("Hard 60s", 1, "60s", group="A"),
               E("Hard 30s", 1, "30s", group="A"), E("Easy Spin after each effort (equal time)", 7, "equal to effort", group="A"), BIKE_CD],
    ["x-gen-hood-10x1-intervals", "ntnu-4x4-intervals"])

add("40-20-bodyweight-circuit", "Somax 40/20 Bodyweight Circuit 25", "fitness", "intermediate", "hiit",
    ["fat-loss", "general-fitness", "endurance"], 25, 3, ["bodyweight"],
    "Eight moves, 40 seconds on and 20 off, two rounds - a step up from the 7-Minute Workout with longer work periods and jump options.",
    "People who find the 7-Minute Workout comfortable and want a longer, harder no-equipment session at home or away.",
    ["home", "travel", "minimal-equipment", "time-efficient"],
    [MAX_HIIT,
     "40s at 8/10, 20s to transition; 1 minute between rounds.",
     "Every jumping move has a no-jump option in brackets - use it on noisy floors or sore days.",
     "Progress to 3 rounds."],
    HOME_WU + [E("Jump Squat (or fast squat)", 2, "40s", group="A"), E("Push-up", 2, "40s", group="A"),
               E("Mountain Climber", 2, "40s", group="A"), E("Reverse Lunge to Knee Drive", 2, "40s", group="A"),
               E("Plank Shoulder Taps", 2, "40s", group="A"), E("Skater Jump (or skater step)", 2, "40s", group="A"),
               E("Glute Bridge March", 2, "40s", group="A"), E("Burpee (or step-back burpee)", 2, "40s", group="A"), STRETCH],
    ["seven-minute-workout", "x-gen-nhs-scotland-hotel-room-circuit"])

add("rower-250m-repeats", "Somax Rower 250 m Repeats", "fitness", "intermediate", "hiit",
    ["endurance", "fat-loss", "general-fitness"], 30, 2, ["rower"],
    "Eight hard 250-metre pieces on the rower with 90 seconds of easy rowing between. Full-body, low-impact and kind to the knees.",
    "Rower owners and gym-goers who know the basic stroke (legs, body, arms) and want a hard, joint-friendly session.",
    ["home", "full-gym", "time-efficient"],
    [HIIT_GATE,
     "Row each 250 m at 8/10 with a stroke rate of about 26-30; keep the split steady across all eight.",
     "Recover with 90s of very light rowing.",
     "Progress to 10 pieces, then cut the recovery to 60s."],
    [E("Warm-up: easy rowing, building", 1, "8 min"), E("Hard Row", 8, "1", distance="250 m", group="A"),
     E("Easy Row", 8, "90s", group="A"), E("Cool-down: easy rowing", 1, "5 min")],
    ["x-gen-hood-10x1-intervals", "ntnu-4x4-intervals"])

add("hotel-band-hiit-20", "Somax Hotel Band HIIT 20", "fitness", "intermediate", "hiit",
    ["fat-loss", "strength", "general-fitness"], 20, 3, ["bands", "bodyweight"],
    "A suitcase-friendly 20 minutes: band strength moves paired with bodyweight cardio, 40 seconds on and 20 off.",
    "Travellers and FIFO workers with a resistance band who want a hard session in a small room.",
    ["travel", "home", "minimal-equipment", "time-efficient"],
    [MAX_HIIT,
     "Anchor the band under your feet or in a closed door hinge (door closing towards you).",
     "40s on / 20s off, 2 rounds, 1 minute between rounds.",
     "Keep cardio moves low-impact if you're above other guests."],
    HOME_WU + [E("Band Squat to Press", 2, "40s", group="A"), E("Fast Feet (quiet)", 2, "40s", group="A"),
               E("Band Row (door anchor)", 2, "40s", group="A"), E("Mountain Climber", 2, "40s", group="A"),
               E("Band Romanian Deadlift", 2, "40s", group="A"), E("Push-up", 2, "40s", group="A"),
               E("Band Woodchop", 2, "20s/side", group="A"), STRETCH],
    ["seven-minute-workout", "x-gen-nhs-scotland-hotel-room-circuit"])

add("stairwell-intervals", "Somax Stairwell Intervals", "fitness", "intermediate", "hiit",
    ["endurance", "fat-loss", "general-fitness"], 25, 2, ["stairs", "bodyweight"],
    "Eight brisk climbs of a 2-3 flight stairwell, walking down to recover, with a short strength set on the landing every second climb.",
    "Office and apartment dwellers, and hotel guests, with a stairwell and 25 minutes.",
    ["travel", "busy", "minimal-equipment", "time-efficient"],
    [HIIT_GATE,
     "Climb fast but in control (8/10), using the rail; always walk down.",
     "After climbs 2, 4, 6 and 8 do the landing set, then walk down.",
     "Progress to 10 climbs or take two steps at a time if you're steady."],
    [E("Warm-up: easy stair walk up and down", 2, "1 climb"),
     E("Brisk Stair Climb (2-3 flights)", 8, "1 climb", group="A"), E("Walk Down (recovery)", 8, "1 descent", group="A"),
     E("Landing: Incline Push-up on Rail or Step", 4, "10", group="B"), E("Landing: Bodyweight Squat", 4, "15", group="B"),
     E("Cool-down: calf and thigh stretch", 1, "3 min")],
    ["x-gen-stair-climbing-snacks", "x-gen-nhs-scotland-hotel-room-circuit"])

add("dumbbell-complex-20", "Somax Dumbbell Complex 20", "fitness", "intermediate", "hiit",
    ["fat-loss", "strength", "muscle"], 20, 2, ["dumbbells"],
    "Five moves back-to-back without putting the dumbbells down - deadlift, row, hang clean, press, squat - then rest and repeat five times.",
    "Home lifters with moderate dumbbells who want strength and conditioning in one short session.",
    ["home", "minimal-equipment", "time-efficient"],
    ["Twice a week, 2+ days apart.",
     "Choose a weight you can press 8 times; the press limits the whole complex.",
     "Rest 90s between complexes; reduce to 60s as you get fitter.",
     "Progress by adding a rep per move (to 8) before going heavier."],
    HOME_WU + [E("Dumbbell Romanian Deadlift", 5, "6", group="A"), E("Dumbbell Bent-over Row", 5, "6", group="A"),
               E("Dumbbell Hang Clean", 5, "6", group="A"), E("Dumbbell Shoulder Press", 5, "6", group="A"),
               E("Dumbbell Front Squat", 5, "6", group="A"), E("Rest between complexes", 5, "90s"), STRETCH],
    ["strongfirst-simple-and-sinister", "seven-minute-workout"])

add("quiet-apartment-hiit-30", "Somax Quiet Apartment HIIT 30", "fitness", "intermediate", "hiit",
    ["fat-loss", "general-fitness", "endurance"], 30, 3, ["bodyweight", "mat"],
    "A harder no-jump session for flats and sore joints: 40/20 low-impact moves, three rounds. Tough on the heart and lungs, silent on the floor.",
    "People who've outgrown the Somax Low-Impact HIIT 20 but still can't (or don't want to) jump.",
    ["home", "minimal-equipment", "time-efficient"],
    [MAX_HIIT,
     "40s at 8/10, 20s rest; 1 minute between rounds.",
     "Move fast but keep one foot on the floor at all times.",
     "Progress to 45s on / 15s off."],
    HOME_WU + [E("Squat Pulse to Stand", 3, "40s", group="A"), E("Plank Shoulder Taps", 3, "40s", group="A"),
               E("Fast Step-back Lunge (alternating)", 3, "40s", group="A"), E("Speed Skater Step (no jump)", 3, "40s", group="A"),
               E("Bear Crawl Hold with Knee Taps", 3, "40s", group="A"), E("High-knee Power March", 3, "40s", group="A"), STRETCH],
    ["seven-minute-workout", "x-gen-hood-10x1-intervals"])

# ===================================================================================== HIIT - ADVANCED
add("tabata-style-bodyweight", "Somax Tabata-Style Bodyweight (4 blocks)", "fitness", "advanced", "hiit",
    ["fat-loss", "endurance", "sport-performance"], 25, 2, ["bodyweight"],
    "Four 4-minute blocks of 20 seconds flat out and 10 seconds rest, one move per block. Note: the original Tabata study used a supramaximal bike effort; this is a bodyweight take on the timing.",
    "Already-fit people who train vigorously most weeks and want a brutal, short, equipment-free session.",
    ["home", "travel", "minimal-equipment", "time-efficient"],
    [ADV_GATE,
     "Each block: 8 x (20s max effort / 10s rest). Rest 1 minute between blocks.",
     "Keep form tidy - fewer good reps beat sloppy fast ones.",
     "Max 2 a week; it doesn't replace your steady cardio and strength days."],
    HOME_WU + [E("Warm-up: 2 x 20s easy versions of each move", 1, "3 min"),
               E("Block 1: Burpee", 8, "20s on / 10s off", group="A"), E("Block 2: Jump Squat", 8, "20s on / 10s off", group="B"),
               E("Block 3: Mountain Climber", 8, "20s on / 10s off", group="C"), E("Block 4: High Knees", 8, "20s on / 10s off", group="D"),
               E("Rest between blocks", 3, "1 min"), STRETCH],
    ["x-gen-tabata-protocol", "seven-minute-workout"])

add("30-30-run-intervals", "Somax 30/30 Run Intervals", "run", "advanced", "hiit",
    ["endurance", "sport-performance", "fat-loss"], 40, 2, ["bodyweight"],
    "Two sets of ten 30-second fast runs with 30 seconds' jog, separated by 3 minutes easy. A classic way to spend a lot of time near your max heart rate.",
    "Experienced runners who can run 5 km comfortably and want a VO2-style session on a track, oval or flat path.",
    ["outdoor", "minimal-equipment", "time-efficient"],
    [ADV_GATE,
     "Fast reps are about your 3 km race pace (8-9/10); recoveries are a genuine slow jog, not a stop.",
     "If the pace drops sharply before rep 8 of a set, end the set there.",
     "Progress to 2 x 12, then 3 x 10."],
    JOG_WU + [E("Strides (build to fast)", 4, "15s"),
              E("Fast Run", 20, "30s", group="A"), E("Recovery Jog", 20, "30s", group="A"),
              E("Easy Jog between sets", 1, "3 min"), E("Cool-down: easy jog", 1, "8 min")],
    ["ntnu-4x4-intervals", "x-gen-10-20-30-running"])

add("advanced-emom-30-dumbbell", "Somax Advanced EMOM 30 (Dumbbells)", "fitness", "advanced", "hiit",
    ["fat-loss", "strength", "endurance"], 38, 2, ["dumbbells"],
    "Thirty minutes, three rotating stations - thrusters, renegade rows and burpees - ten rounds. Big volume, big engine.",
    "Advanced home trainers with moderate-to-heavy dumbbells who are comfortable with thrusters and renegade rows.",
    ["home", "minimal-equipment", "time-efficient"],
    [ADV_GATE,
     "Minute 1: thrusters. Minute 2: renegade rows. Minute 3: burpees. Repeat 10 times.",
     "Aim to finish each station in 35-40s; scale reps down if you lose the rest window.",
     "Twice a week at most, not on back-to-back days."],
    HOME_WU + [E("Minute 1: Dumbbell Thruster", 10, "10", group="A"), E("Minute 2: Renegade Row (each arm)", 10, "6/arm", group="A"),
               E("Minute 3: Burpee", 10, "10", group="A"), STRETCH],
    ["seven-minute-workout", "x-gen-tabata-protocol"])

add("advanced-amrap-20-bodyweight", "Somax Advanced AMRAP 20 (Bodyweight)", "fitness", "advanced", "hiit",
    ["fat-loss", "endurance", "general-fitness"], 30, 2, ["bodyweight"],
    "Twenty minutes of as many rounds as possible: burpees, jump squats, mountain climbers and push-ups. Track your score month to month.",
    "Fit people who want a no-equipment benchmark workout they can do anywhere.",
    ["home", "travel", "outdoor", "minimal-equipment", "time-efficient"],
    [ADV_GATE,
     "Pace it: the first round should feel like 7/10, not 10/10. Most fit people manage 6-10 rounds.",
     "Record rounds + reps and re-test every 4-6 weeks.",
     "Twice a week at most."],
    HOME_WU + [E("Burpee", 8, "10", group="A"), E("Jump Squat", 8, "15", group="A"),
               E("Mountain Climber", 8, "20 total", group="A"), E("Push-up", 8, "10", group="A"), STRETCH],
    ["seven-minute-workout", "x-gen-nhs-scotland-hotel-room-circuit"])

add("hill-sprints-20s", "Somax Hill Sprints 20s", "run", "advanced", "hiit",
    ["sport-performance", "endurance"], 35, 2, ["bodyweight"],
    "Six to ten 20-second all-out uphill sprints with a full 2-minute walk-back recovery. Builds speed and power with less hamstring risk than flat sprinting.",
    "Fit runners, footy and team-sport players who want genuine sprint work outdoors.",
    ["outdoor", "minimal-equipment", "time-efficient"],
    [ADV_GATE,
     "Use a moderate hill (not steep), and sprint tall with a strong arm drive.",
     "Walk back down and take the full 2 minutes - quality matters more than fatigue.",
     "Start with 6 and add one sprint a week to 10."],
    JOG_WU + [E("Build-up Strides", 3, "15s"), E("All-out Uphill Sprint", 6, "20s (build to 10)", group="A"),
              E("Walk-back Recovery", 6, "2 min", group="A"), E("Cool-down: easy jog", 1, "5 min")],
    ["x-gen-gillen-one-minute-workout", "x-gen-wingate-sprint-intervals"])

add("dumbbell-chipper-30", "Somax Dumbbell Chipper 30", "fitness", "advanced", "hiit",
    ["fat-loss", "endurance", "strength"], 35, 1, ["dumbbells"],
    "Work your way down a long list once - 50 squats, 40 lunges, 30 push presses, 20 renegade rows and 10 man-makers - for time.",
    "Advanced trainers who like a one-off weekly test of grit and pacing.",
    ["home", "minimal-equipment"],
    [ADV_GATE,
     "Break each movement into sets that let you keep moving (e.g. 50 squats as 5 x 10).",
     "Use moderate dumbbells you could press 12 times when fresh.",
     "Once a week; write down your time and repeat in 4-6 weeks."],
    HOME_WU + [E("Dumbbell Goblet Squat", 1, "50"), E("Dumbbell Walking Lunge", 1, "40 total"),
               E("Dumbbell Push Press", 1, "30"), E("Renegade Row", 1, "20 total"), E("Dumbbell Man-maker", 1, "10"), STRETCH],
    ["seven-minute-workout", "strongfirst-simple-and-sinister"])

add("bike-sprints-10x15", "Somax Bike Sprints 10 x 15s", "fitness", "advanced", "hiit",
    ["endurance", "sport-performance", "fat-loss"], 25, 2, ["exercise bike"],
    "Ten 15-second hard sprints with 45 seconds of easy spinning - a 1:3 work-rest sprint session that sits between REHIT and Wingate in difficulty.",
    "Fit bike users who've done the starter and 10 x 1-minute intervals and want short, sharp speed work.",
    ["home", "time-efficient"],
    [ADV_GATE,
     "Sprints are near-maximal against high resistance; recoveries are very easy.",
     "If sprint power drops a lot before rep 8, stop there.",
     "Progress to 12 sprints, then to 20s sprints with 60s easy."],
    BIKE_WU + [E("Near-max Sprint", 10, "15s", group="A"), E("Easy Spin", 10, "45s", group="A"), BIKE_CD],
    ["x-gen-rehit-reduced-exertion", "x-gen-wingate-sprint-intervals", "x-gen-gillen-one-minute-workout"])

add("advanced-strength-intervals-45", "Somax Advanced Strength + Intervals 45", "fitness", "advanced", "hiit",
    ["fat-loss", "strength", "endurance"], 45, 2, ["dumbbells", "exercise bike"],
    "A complete 45-minute session: two dumbbell strength supersets, then 10 x 1-minute bike intervals to finish.",
    "Advanced trainers with dumbbells and a bike at home who want strength and conditioning in one longer session.",
    ["home", "time-efficient"],
    [ADV_GATE,
     "Strength first while fresh: 3-4 sets of 8-10, resting 60-90s after each superset.",
     "Then 10 x 1 min hard (8/10) / 1 min easy on the bike.",
     "Twice a week, with an easy cardio or rest day between."],
    HOME_WU + [E("Dumbbell Front Squat", 4, "8-10", group="A"), E("Dumbbell Bench or Floor Press", 4, "8-10", group="A"),
               E("Dumbbell Romanian Deadlift", 4, "8-10", group="B"), E("One-arm Dumbbell Row", 4, "8-10/arm", group="B"),
               E("Bike: Hard Effort", 10, "60s", group="C"), E("Bike: Easy Spin", 10, "60s", group="C"), BIKE_CD],
    ["x-gen-hood-10x1-intervals", "strongfirst-simple-and-sinister"])

# ===================================================================================== GENERAL - FROM ZERO / BEGINNER
add("first-walk-10", "Somax First Walk 10", "walk", "beginner", "general",
    ["general-fitness", "endurance"], 10, 5, ["bodyweight"],
    "Where everyone can start: a 10-minute walk that finishes brisk. Ten brisk minutes a day already counts towards the 150 minutes a week adults need.",
    "People starting from zero - after a long break, illness, or a mostly sitting life - who want a no-pressure first habit.",
    ["outdoor", "minimal-equipment", "time-efficient", "older-adults", "busy"],
    ["Most days of the week; consistency beats distance.",
     "Brisk means you can talk but couldn't sing.",
     "Add 5 minutes of brisk walking a week until you reach 30 minutes, then try the Somax 3 x 10 Walking Day or a walking plan.",
     "See your GP first if you've been inactive for a long time or have a medical condition."],
    [E("Easy walk", 1, "3 min"), E("Brisk walk (talk, not sing)", 1, "5 min"), E("Easy walk and calf stretch", 1, "2 min")],
    ["x-gen-nhs-warm-up", "nhs-wirral-walking-plan-medium-walk"])

add("3x10-walking-day", "Somax 3 x 10 Walking Day", "walk", "beginner", "general",
    ["general-fitness", "fat-loss", "endurance"], 30, 5, ["bodyweight"],
    "Three 10-minute brisk walks spread across the day - before work, at lunch and after dinner - for 30 minutes without finding a 30-minute gap.",
    "Busy people and desk workers who can't block out a long session but can break up their sitting.",
    ["busy", "outdoor", "minimal-equipment", "time-efficient"],
    ["5 days a week gets you to the 150-minute weekly guideline.",
     "Each walk: 1-2 minutes easy, then brisk (talk, not sing) for the rest.",
     "A walk after meals is a great time to fit one in.",
     "When it's easy, make one of the three a 20-minute walk with a hill."],
    [E("Walk 1 (morning): brisk", 1, "10 min"), E("Walk 2 (lunch): brisk", 1, "10 min"), E("Walk 3 (after dinner): brisk", 1, "10 min")],
    ["nhs-wirral-walking-plan-medium-walk", "x-gen-stair-climbing-snacks"])

add("from-zero-chair-strength-10", "Somax From-Zero Chair Strength 10", "fitness", "beginner", "general",
    ["strength", "general-fitness"], 10, 2, ["chair", "wall"],
    "Ten minutes, one chair, one wall: the first strength moves for people who've never trained - standing up, pushing, stepping and rising onto your toes.",
    "Complete beginners, people returning after illness, and anyone nervous about the gym.",
    ["home", "minimal-equipment", "time-efficient", "older-adults"],
    ["2-3 days a week, not back-to-back.",
     "Move slowly: about 3 seconds down and 2 up.",
     "When you can do 2 sets of 12 of everything, move on to the Somax Fat-Loss Starter Week or Growing Stronger Part II.",
     "Use your hands on the chair whenever you need to."],
    [E("Sit-to-Stand (hands on thighs if needed)", 2, "8-12"), E("Wall Push-up", 2, "8-12"),
     E("Calf Raise holding chair back", 2, "10-12"), E("Seated Knee Lift (alternating)", 2, "8/leg"),
     E("Standing Side Leg Lift holding chair", 1, "8/leg"), E("Seated Chest Stretch", 1, "20s")],
    ["nhs-home-strength-exercises", "x-gen-growing-stronger-part-1"])

add("band-full-body-25", "Somax Band Full Body 25", "fitness", "beginner", "general",
    ["strength", "general-fitness", "muscle"], 25, 3, ["bands"],
    "A complete strength session with one long loop or tube band: squats, rows, presses, hinges and pull-aparts in straight sets.",
    "Beginners at home or travelling who want proper strength training with almost no gear.",
    ["home", "travel", "minimal-equipment"],
    ["2-3 non-consecutive days a week.",
     "Choose a band tension where the last 2-3 reps of each set are hard but tidy.",
     "Rest 45-60s between sets.",
     "Progress with a stronger band, a shorter grip, or a slow 3-second lowering."],
    HOME_WU + [E("Band Squat", 2, "12-15"), E("Band Bent-over Row", 2, "12-15"), E("Band Chest Press (anchored behind)", 2, "10-12"),
               E("Band Romanian Deadlift", 2, "12-15"), E("Band Overhead Press", 2, "10-12"), E("Band Pull-apart", 2, "15"),
               E("Dead Bug", 2, "8/side"), STRETCH],
    ["nhs-home-strength-exercises", "x-gen-growing-stronger-part-2"])

add("mat-core-posture-15", "Somax Mat Core & Posture 15", "fitness", "beginner", "general",
    ["general-fitness", "mobility", "strength"], 15, 3, ["mat"],
    "Fifteen minutes on the floor for a stronger trunk and better posture: dead bugs, bird dogs, bridges, side planks from the knees and back raises.",
    "Beginners and desk workers with stiff backs who want gentle, spine-friendly core work.",
    ["home", "minimal-equipment", "time-efficient", "busy"],
    ["3 days a week, or daily as a short routine.",
     "Move slowly and breathe out on the effort; stop anything that causes back pain.",
     "Rest 30s between sets.",
     "Progress to full side planks and longer holds, then the Somax Plank & Core Builder."],
    [E("Cat-Cow", 1, "8"), E("Dead Bug", 2, "6/side"), E("Bird Dog (3s hold)", 2, "6/side"),
     E("Glute Bridge", 2, "12"), E("Side Plank from Knees", 2, "15-20s/side"), E("Prone Y Raise", 2, "8"),
     E("Child's Pose", 1, "30s")],
    ["x-gen-growing-stronger-part-3", "nhs-flexibility-exercises"])

add("desk-reset-5", "Somax Desk Reset 5", "other", "beginner", "general",
    ["mobility", "general-fitness"], 5, 5, ["chair"],
    "Five minutes at your desk to undo the hunch: shoulder rolls, chin tucks, twists, a standing hip-flexor stretch and calf raises.",
    "Office and work-from-home desk workers who sit for hours and feel it in their neck, back and hips.",
    ["busy", "time-efficient", "minimal-equipment", "travel"],
    ["Once or twice every working day - e.g. mid-morning and mid-afternoon.",
     "Set a reminder to stand up and move at least every 30-60 minutes as well.",
     "Every move is gentle; nothing should hurt.",
     "Pair it with a 3 x 10 Walking Day for a desk-worker week."],
    [E("Shoulder Rolls (back and down)", 1, "10"), E("Chin Tuck (2s hold)", 1, "8"),
     E("Seated Upper-body Twist", 1, "5s hold x3/side"), E("Standing Hip-flexor Stretch (hold desk)", 1, "20s/side"),
     E("Standing Calf Raise", 1, "15"), E("Wrist and Forearm Stretch", 1, "15s/side")],
    ["x-gen-nhs-sitting-exercises", "nhs-flexibility-exercises"])

add("office-strength-snack-10", "Somax Office Strength Snack 10", "fitness", "beginner", "general",
    ["strength", "general-fitness"], 10, 3, ["chair"],
    "A 10-minute strength break in office clothes: sit-to-stands, desk push-ups, calf raises, a wall sit and a stair climb if you have one.",
    "Desk workers who want to keep their legs and upper body strong without changing clothes or getting sweaty.",
    ["busy", "time-efficient", "minimal-equipment", "travel"],
    ["2-3 workdays a week, or swap one in for a coffee run.",
     "2 rounds; rest 30-60s between rounds.",
     "Use a stable desk (not a wheeled chair) for the push-ups.",
     "Add a third round or a stair climb when it feels easy."],
    [E("Sit-to-Stand from Office Chair (chair against desk)", 2, "10", group="A"), E("Desk Push-up", 2, "10", group="A"),
     E("Calf Raise", 2, "15", group="A"), E("Wall Sit", 2, "20-30s", group="A"), E("Optional: Brisk Stair Climb", 1, "1-2 flights")],
    ["x-gen-stair-climbing-snacks", "nhs-home-strength-exercises"])

add("hotel-room-starter-15", "Somax Hotel Room Starter 15", "fitness", "beginner", "general",
    ["general-fitness", "strength"], 15, 3, ["bodyweight", "chair"],
    "A gentle 15-minute hotel-room routine for beginners: squats to the bed edge, incline push-ups on the desk, bridges, step-backs and a plank.",
    "Beginners who travel for work and want to keep a habit going on the road without a gym.",
    ["travel", "home", "minimal-equipment", "time-efficient"],
    ["Every second day while travelling.",
     "2 rounds, 30-60s rest between rounds.",
     "Use the bed edge, desk or a sturdy chair - never a wheeled office chair.",
     "When it's easy, step up to the Somax Hotel Room Full Body."],
    HOME_WU + [E("Squat to Bed Edge", 2, "10-12", group="A"), E("Incline Push-up on Desk", 2, "8-10", group="A"),
               E("Glute Bridge", 2, "12", group="A"), E("Reverse Lunge holding chair", 2, "6/leg", group="A"),
               E("Plank (knees if needed)", 2, "20s", group="A")],
    ["x-gen-nhs-scotland-hotel-room-circuit", "nhs-home-strength-exercises"])

add("travel-day-mobility-10", "Somax Travel Day Mobility 10", "other", "beginner", "general",
    ["mobility", "general-fitness"], 10, 1, ["chair"],
    "Seated and aisle-friendly moves for long flights, drives and train trips: ankle pumps, knee hugs, twists, neck turns and calf raises.",
    "Travellers on long-haul flights or road trips who want to stay loose and keep blood moving.",
    ["travel", "busy", "minimal-equipment"],
    ["Do the seated part every hour or so on long trips; stand and do the calf raises when you can.",
     "Drink water regularly and walk the aisle when the seatbelt sign is off.",
     "Nothing should hurt; keep movements small in tight seats.",
     "Seek urgent help for calf pain, swelling, chest pain or breathlessness during or after travel."],
    [E("Seated Ankle Pumps", 2, "15"), E("Seated Ankle Circles", 1, "10 each way"), E("Seated Knee Hug", 1, "5/leg (5s hold)"),
     E("Seated Upper-body Twist", 1, "5s hold x3/side"), E("Neck Rotation", 1, "3/side"), E("Shoulder Rolls", 1, "10"),
     E("Standing Calf Raise (aisle or galley)", 2, "15")],
    ["x-gen-nhs-sitting-exercises"])

add("fitness-check-in", "Somax Fitness Check-in", "fitness", "beginner", "general",
    ["general-fitness"], 25, 1, ["chair", "mat"],
    "A simple re-test to run every 4 weeks: 30-second chair stand, max push-ups, plank hold, and how far you walk briskly in 10 minutes.",
    "Anyone on a Somax plan who wants to see real progress beyond the scales.",
    ["home", "minimal-equipment", "older-adults"],
    ["Once every 4 weeks, on a fresh day, same time of day.",
     "Chair stand: armless chair (about 43 cm) against a wall, arms crossed; count full stands in 30s.",
     "Push-ups: record whether full or from the knees, and use the same version each time. Plank: hold until form breaks.",
     "Walk test: brisk 10 minutes on the same flat route; record distance from your watch or phone. Skip anything that hurts."],
    [NHS_WU[0], E("30-Second Chair Stand (count reps)", 1, "max in 30s"), E("Rest", 1, "2 min"),
     E("Push-up Test (full or knees, record which)", 1, "max reps"), E("Rest", 1, "2 min"),
     E("Front Plank Hold", 1, "max time"), E("10-Minute Brisk Walk (record distance)", 1, "10 min")],
    ["x-gen-growing-stronger-part-1", "nhs-home-strength-exercises"])

# ===================================================================================== GENERAL - OLDER ADULTS
add("steady-feet-supported", "Somax Steady Feet (Supported Balance)", "fitness", "beginner", "general",
    ["general-fitness", "mobility", "strength"], 15, 3, ["stable support"],
    "A balance routine done entirely at the kitchen bench: narrowing your stance step by step, heel and toe raises, side-stepping and supported sit-to-stands.",
    "Older adults who feel unsteady, have had a fall, or are just starting balance work - everything is done holding on.",
    ["home", "older-adults", "minimal-equipment", "time-efficient"],
    ["3 days a week (rest days between), plus short balance 'snacks' on other days.",
     "Stand at a kitchen bench or solid table - never a chair that can move. Hold on with both hands, then one, then fingertips as you improve.",
     "Only move on to the next stance when you can hold the current one steadily for 10 seconds.",
     "If you've fallen in the past year, see your GP before starting and keep a support within reach at all times."],
    [E("Feet-together Stand (hold bench)", 3, "10s"), E("Semi-tandem Stand (hold bench)", 3, "10s/side"),
     E("Tandem (heel-to-toe) Stand (hold bench)", 2, "10s/side"), E("Heel Raise (hold bench)", 2, "10"),
     E("Toe Raise (hold bench)", 2, "10"), E("Sideways Walking along the Bench", 2, "10 steps each way"),
     E("Sit-to-Stand (hands allowed)", 2, "5-8")],
    ["x-gen-nhs-balance-exercises", "x-gen-safe-exercise-at-home-level-2", "nhs-home-strength-exercises"])

add("strong-legs-for-life", "Somax Strong Legs for Life", "fitness", "beginner", "general",
    ["strength", "general-fitness"], 30, 3, ["chair", "step", "ankle weights"],
    "Leg strength for independence: slow sit-to-stands, step-ups, ankle-weight knee extensions and hip raises, single-leg calf raises and a balance finish.",
    "Older adults who can stand from a chair without their hands and want to keep doing stairs, gardening and getting up off the floor.",
    ["home", "older-adults", "minimal-equipment"],
    ["3 non-consecutive days a week, plus walking on 2 other days.",
     "Lift for 2-3 seconds, lower for 4-5 seconds; rest 1-2 minutes between sets.",
     "Pick an ankle weight that allows 8-10 good reps; go heavier once 2 x 10 is comfortable.",
     "Hold a rail or bench for step-ups and balance work; stop for dizziness, chest pain or pain that won't settle."],
    [E("Warm-up: march on the spot", 1, "3 min"), E("Slow Sit-to-Stand (no hands)", 2, "10"),
     E("Step-up (rail nearby)", 2, "8/leg"), E("Seated Knee Extension (ankle weights)", 2, "8-10/leg"),
     E("Standing Side Hip Raise (ankle weights, hold bench)", 2, "8-10/leg"), E("Single-leg Calf Raise (hold bench)", 2, "8/leg"),
     E("Heel-to-toe Walk (wall nearby)", 2, "10 steps"), E("One-leg Stand (fingertips on bench)", 2, "10s/side"), GENTLE_STRETCH],
    ["x-gen-growing-stronger-part-3", "x-gen-nhs-balance-exercises", "nhs-home-strength-exercises"])

add("active-agers-power-balance", "Somax Active Agers Power & Balance", "fitness", "intermediate", "general",
    ["strength", "general-fitness", "mobility"], 40, 3, ["dumbbells", "chair", "step"],
    "For fit, active older adults: goblet squats, fast sit-to-stands for power, step-ups, rows, push-ups, a carry, and harder balance drills without support.",
    "Active over-60s who already walk 150+ minutes a week and find chair-based programs too easy.",
    ["home", "older-adults"],
    ["2-3 non-consecutive days a week.",
     "Fast sit-to-stands: stand up as quickly as you safely can, sit down slowly - that's the power part.",
     "Rest 60-90s between sets; reps should feel moderate-hard, never maximal.",
     "Do the no-support balance drills near a wall or bench in case you need it."],
    [E("Warm-up: brisk march and arm swings", 1, "4 min"), E("Goblet Squat to Chair", 2, "10-15"),
     E("Fast Sit-to-Stand (power, slow lower)", 2, "6-8"), E("Step-up (rail nearby)", 2, "8-10/leg"),
     E("One-arm Dumbbell Row", 2, "10-12/arm"), E("Incline Push-up", 2, "10-15"),
     E("Farmer Carry (dumbbells)", 2, "30 m"), E("Grapevine", 1, "5 cross-steps/side"),
     E("Heel-to-toe Walk, no support", 2, "10 steps"), E("One-leg Stand with Head Turns", 2, "10-20s/side"), GENTLE_STRETCH],
    ["x-gen-growing-stronger-part-3", "x-gen-nhs-balance-exercises", "x-gen-interval-walking-training"])

add("seated-strength-bands", "Somax Seated Strength (Bands)", "fitness", "beginner", "general",
    ["strength", "general-fitness"], 20, 3, ["chair", "bands"],
    "A complete strength session without standing: seated band rows, presses, leg presses and pull-aparts, plus marching and toe raises.",
    "Older adults with poor balance, people recovering from illness or using a walking aid, and anyone who needs to stay seated.",
    ["home", "older-adults", "minimal-equipment"],
    ["2-3 days a week, not back-to-back.",
     "Sit tall on a solid chair without wheels, feet flat; use a light band to start.",
     "Move slowly (2 seconds out, 3-4 back) and breathe out on the effort.",
     "When 2 x 12 feels easy, use a firmer band or move on to Growing Stronger Part I."],
    [E("Seated Marching", 1, "1 min"), E("Seated Band Row", 2, "10-12"), E("Seated Band Chest Press (band behind back)", 2, "10-12"),
     E("Seated Band Leg Press (band around foot)", 2, "10/leg"), E("Seated Knee Extension (hold 2s)", 2, "10/leg"),
     E("Seated Band Overhead Press", 2, "8-10"), E("Seated Band Pull-apart", 2, "10-12"), E("Seated Toe Raises", 2, "15"),
     E("Seated Chest Stretch", 1, "20s")],
    ["x-gen-nhs-sitting-exercises", "x-gen-growing-stronger-part-1", "nhs-home-strength-exercises"])

add("walk-and-balance", "Somax Walk & Balance", "walk", "beginner", "general",
    ["general-fitness", "endurance", "mobility"], 30, 3, ["bodyweight"],
    "A 25-minute walk with three short balance stops at a fence, bench or rail - so your walking day also counts as a balance day.",
    "Older adults who walk regularly and want to tick off balance practice at the same time.",
    ["outdoor", "older-adults", "minimal-equipment"],
    ["2-3 days a week, on days you're not doing strength work.",
     "Walk at a comfortable-to-brisk pace (talk, not sing); heel lands first, eyes ahead.",
     "At each stop, hold the rail or bench for every balance drill.",
     "Walking alone doesn't prevent falls - keep your strength and balance sessions going too."],
    [E("Walk (comfortable)", 1, "5 min"), E("Stop 1: Heel Raises holding rail", 1, "10"), E("Walk (brisk)", 1, "8 min"),
     E("Stop 2: Semi-tandem Stand holding rail", 1, "10s/side"), E("Walk (brisk)", 1, "8 min"),
     E("Stop 3: One-leg Stand holding rail", 1, "5-10s/side"), E("Walk (easy) home", 1, "4 min")],
    ["x-gen-nhs-balance-exercises", "x-gen-interval-walking-training", "nhs-wirral-walking-plan-medium-walk"])

# ===================================================================================== GENERAL - POSTNATAL (conservative)
add("postnatal-gentle-start", "Somax Postnatal Gentle Start (0-6 weeks)", "other", "beginner", "general",
    ["general-fitness", "strength"], 20, 7, ["bodyweight"],
    "The early weeks after birth: pelvic floor and deep tummy work a few times a day, gentle posture moves for feeding and carrying, and a pram walk that grows as you feel ready.",
    "New mums in the first 6 weeks after birth (vaginal or caesarean) who want a gentle, physio-informed routine before their postnatal check.",
    ["home", "outdoor", "minimal-equipment", "time-efficient"],
    ["Pelvic floor and deep tummy holds 3 times a day; walk most days as comfort allows, starting with 5-10 minutes.",
     "Breathe normally throughout; keep your bottom and upper tummy relaxed during pelvic floor work.",
     "No crunches, planks, running, jumping or weights yet; lift nothing heavier than your baby.",
     "Stop and see your GP or a women's health physio for pain, leaking, heavier or returning bright-red bleeding, or if anything feels wrong. Caesarean, complicated births and health conditions may need longer."],
    [E("Pelvic Floor Long Hold (5s rest between)", 1, "10 x 3-10s"), E("Pelvic Floor Quick Squeeze", 1, "10"),
     E("Deep Tummy Hold (lying knees bent)", 1, "6-10 x 3-5s"), E("Seated Shoulder Rolls", 1, "10"),
     E("Seated Chest Stretch", 1, "20s x2"), E("Pram Walk (easy, building gradually)", 1, "5-20 min")],
    ["x-gen-royal-womens-postnatal-recovery", "x-gen-nhs-sitting-exercises"])

add("postnatal-strength-return", "Somax Postnatal Strength Return (6+ weeks)", "fitness", "beginner", "general",
    ["strength", "general-fitness"], 30, 3, ["bodyweight", "bands", "chair"],
    "After your 6-week check: gentle full-body strength with your pelvic floor switched on - bridges, sit-to-stands, wall push-ups, band rows, clams and bird dogs - plus a brisk walk.",
    "Mums who have been cleared at their postnatal check and want to rebuild strength safely before any return to running or high-impact exercise.",
    ["home", "minimal-equipment"],
    ["2-3 non-consecutive days a week, plus walking on other days towards 150 minutes a week.",
     "Gently squeeze your pelvic floor and breathe out as you lift or push (the effort part of each rep).",
     "Still no crunches, sit-ups, planks or impact until at least 12 weeks and a women's health physio says your pelvic floor and tummy are ready.",
     "Stop for leaking, heaviness or dragging in the pelvis, back pain, or a tummy 'doming' down the middle, and get checked."],
    [E("Pelvic Floor Long Hold", 1, "10 x 10s"), E("Glute Bridge (exhale and brace on the way up)", 2, "10-12"),
     E("Sit-to-Stand", 2, "10-12"), E("Wall Push-up", 2, "10-12"), E("Band Row (door anchor or seated)", 2, "12"),
     E("Side-lying Clam", 2, "12/side"), E("Bird Dog", 2, "6/side"), E("Brisk Walk (with or without pram)", 1, "15-20 min")],
    ["x-gen-royal-womens-postnatal-recovery", "nhs-home-strength-exercises"])

# ===================================================================================== GENERAL - INTERMEDIATE / ADVANCED
add("bodyweight-strength-30", "Somax Bodyweight Strength 30", "fitness", "intermediate", "general",
    ["strength", "muscle", "general-fitness"], 30, 3, ["bodyweight", "backpack"],
    "Proper strength work with no gym: push-ups, split squats, single-leg bridges, loaded-backpack rows and pike push-ups, in three straight sets.",
    "People who've outgrown beginner circuits and want to get stronger at home with just their body and a backpack.",
    ["home", "travel", "minimal-equipment"],
    ["3 non-consecutive days a week.",
     "Pick the version of each move that makes 8-12 reps hard; leave 1-2 reps in reserve.",
     "Rest 60-90s between sets.",
     "Progress by slowing the lowering to 3s, adding backpack weight, or moving to harder versions (deficit push-ups, rear-foot-elevated split squats)."],
    HOME_WU + [E("Push-up", 3, "8-12"), E("Split Squat", 3, "10/leg"), E("Single-leg Glute Bridge", 3, "10/leg"),
               E("Backpack Bent-over Row (loaded with books)", 3, "10-12"), E("Pike Push-up", 3, "6-10"),
               E("Side Plank", 2, "20-30s/side"), STRETCH],
    ["bwf-recommended-routine", "nhs-home-strength-exercises"])

add("push-up-builder", "Somax Push-up Builder", "fitness", "beginner", "general",
    ["strength", "general-fitness"], 15, 2, ["bodyweight"],
    "A short add-on to grow your push-up number: four easy sets at about half your max, slow lowering reps, and a plank.",
    "Anyone with a push-up goal (first full push-up, 10, 20 or more), whatever level they start from.",
    ["home", "travel", "minimal-equipment", "time-efficient"],
    ["Add it to 2 sessions a week, 2+ days apart.",
     "Choose the push-up level you can do at least 5 of (wall, bench, knees, full).",
     "Main sets: about 50-60% of your current max, crisp and fast; re-test your max every 2 weeks.",
     "When you hit 15 of your current level, move to the next harder level."],
    [E("Warm-up: arm circles and wall push-ups", 1, "1 min"), E("Push-up at your level", 4, "50-60% of max"),
     E("Slow Lowering Push-up (3s down)", 2, "3-5"), E("Plank", 2, "20-30s")],
    ["bwf-recommended-routine", "x-gen-growing-stronger-part-1"])

add("plank-core-builder", "Somax Plank & Core Builder", "fitness", "intermediate", "general",
    ["strength", "general-fitness"], 20, 3, ["mat"],
    "Twenty minutes of harder trunk work: front and side planks, hollow holds, dead bugs with reach and slow mountain climbers.",
    "People who've mastered the beginner core work and want a stronger, more stable midsection for lifting, running and sport.",
    ["home", "travel", "minimal-equipment", "time-efficient"],
    ["3 days a week.",
     "Quality over time: end each hold when your hips sag or your lower back arches.",
     "Rest 30-45s between sets.",
     "Add 5s to each hold per week, up to 60s planks and 45s side planks."],
    [E("Dead Bug with Reach", 2, "8/side"), E("Front Plank", 3, "30-45s"), E("Side Plank", 2, "20-30s/side"),
     E("Hollow Hold (tuck)", 3, "15-20s"), E("Slow Mountain Climber", 2, "10/side"), E("Glute Bridge Hold", 2, "30s"),
     E("Child's Pose", 1, "30s")],
    ["bwf-recommended-routine", "x-gen-growing-stronger-part-3"])

add("gym-cardio-circuit-45", "Somax Gym Cardio + Circuit 45", "gym", "intermediate", "general",
    ["general-fitness", "fat-loss", "strength"], 45, 3, ["machines", "cardio machine"],
    "A full gym hour in 45 minutes: steady cardio, a machine circuit for every major muscle, then a second cardio block.",
    "Gym members who want an all-round fitness session without needing to plan, and who like machines over free weights.",
    ["full-gym", "busy"],
    ["3 days a week, with a rest day between.",
     "Cardio blocks at a moderate effort (talk, not sing) on any machine you like.",
     "Circuit: move station to station with ~30s between; 3 rounds, 12-15 reps at a weight that's hard by the last 2-3.",
     "Progress the circuit weights first, then lengthen the cardio blocks to 15 minutes."],
    [E("Bike, Cross-trainer or Incline Walk (moderate)", 1, "10 min"),
     E("Leg Press", 3, "12-15", group="A"), E("Chest Press Machine", 3, "12-15", group="A"), E("Seated Row Machine", 3, "12-15", group="A"),
     E("Leg Curl Machine", 3, "12-15", group="A"), E("Shoulder Press Machine", 3, "12-15", group="A"), E("Cable Woodchop", 3, "10/side", group="A"),
     E("Rower or Cross-trainer (moderate)", 1, "10 min"), STRETCH],
    ["nhs-home-strength-exercises", "seven-minute-workout", "ntnu-4x4-intervals"])

add("advanced-bodyweight-conditioning-45", "Somax Advanced Bodyweight Conditioning 45", "fitness", "advanced", "general",
    ["general-fitness", "strength", "endurance"], 45, 3, ["bodyweight", "chair"],
    "Three 12-minute blocks for very fit people with no equipment: a strength block, a lower-body power block and an engine block.",
    "Advanced trainers who want a long, varied session at home, outdoors or travelling.",
    ["home", "travel", "outdoor", "minimal-equipment"],
    [ADV_GATE,
     "Block A (strength): 4 rounds, rest 60s. Block B (power): 4 rounds, rest 60s. Block C (engine): continuous 12 minutes.",
     "Leave a rep or two in reserve on the strength moves; save the all-out effort for block C.",
     "2-3 times a week; swap one for an easy walk or run if you're feeling flat."],
    HOME_WU + [E("Decline Push-up (feet on chair)", 4, "10-15", group="A"), E("Rear-foot-elevated Split Squat", 4, "8-10/leg", group="A"),
               E("Single-leg Romanian Deadlift (bodyweight)", 4, "10/leg", group="A"),
               E("Broad Jump (walk back)", 4, "5", group="B"), E("Skater Jump", 4, "10 total", group="B"), E("Lateral Lunge", 4, "8/side", group="B"),
               E("Engine: Burpee", 4, "8", group="C"), E("Engine: Mountain Climber", 4, "30 total", group="C"), E("Engine: Squat Jump", 4, "12", group="C"), STRETCH],
    ["bwf-recommended-routine", "x-gen-nhs-scotland-hotel-room-circuit", "seven-minute-workout"])

add("advanced-dumbbell-strength-endurance-45", "Somax Advanced Dumbbell Strength-Endurance 45", "fitness", "advanced", "general",
    ["strength", "muscle", "endurance"], 45, 3, ["dumbbells", "bench"],
    "Heavier dumbbell supersets for strength, then a 6-minute finisher of carries and swings. Built for experienced lifters training at home.",
    "Experienced home lifters with heavier adjustable dumbbells and a bench.",
    ["home"],
    ["3 days a week, 48 hours apart.",
     "Supersets A and B: 4 sets of 6-10, resting 90s after each pair; add weight when you hit 10 on all sets.",
     "Finisher: 3 rounds without rest, then stretch.",
     "Deload every 5th week (half the sets)."],
    HOME_WU + [E("Dumbbell Bench Press", 4, "6-10", group="A"), E("Dumbbell Bulgarian Split Squat", 4, "6-10/leg", group="A"),
               E("Chest-supported Dumbbell Row", 4, "8-10", group="B"), E("Dumbbell Romanian Deadlift", 4, "8-10", group="B"),
               E("Finisher: Dumbbell Farmer Carry", 3, "40 m", group="C"), E("Finisher: Single-dumbbell Swing", 3, "15", group="C"), STRETCH],
    ["strongfirst-simple-and-sinister", "bwf-recommended-routine"])

add("weighted-ruck-60", "Somax Weighted Ruck 60", "walk", "advanced", "general",
    ["endurance", "strength", "fat-loss"], 60, 1, ["backpack"],
    "An hour's brisk walk with a loaded backpack and some hills - big calorie burn and leg and trunk strength with no running impact.",
    "Fit walkers, hikers in training and anyone wanting a tough low-impact endurance session outdoors.",
    ["outdoor", "minimal-equipment"],
    ["Once a week, in place of a long walk.",
     "Start with 5-8 kg packed high and tight (water bottles or books in a towel); build by 1-2 kg a week, up to about 15% of body weight.",
     "Walk briskly (talk in short sentences) and choose a route with hills.",
     "Wear supportive shoes, carry water, and skip it if your back, knees or feet are sore."],
    [WALK_WU, E("Brisk Ruck (loaded backpack)", 1, "50 min", weight="5-8 kg to start"), WALK_CD],
    ["x-gen-interval-walking-training", "nhs-wirral-walking-plan-medium-walk"])

add("advanced-hotel-30", "Somax Advanced Hotel Workout 30", "fitness", "advanced", "general",
    ["strength", "general-fitness", "endurance"], 30, 3, ["bodyweight", "chair"],
    "A hard 30-minute hotel session: bed-supported Bulgarian split squats, decline push-ups, single-leg deadlifts, chair dips and a burpee finisher.",
    "Fit travellers who want to keep their strength up on long work trips with only the room furniture.",
    ["travel", "home", "minimal-equipment", "time-efficient"],
    ["Every second day while away.",
     "Supersets: 3-4 rounds of each pair, resting 60s after the pair.",
     "Use the bed edge or a sturdy chair against the wall, never a wheeled chair.",
     "Finish with the 5-minute finisher only if you have quiet floors or can do the no-jump option."],
    HOME_WU + [E("Bulgarian Split Squat (rear foot on bed)", 4, "8-12/leg", group="A"), E("Decline Push-up (feet on bed)", 4, "8-15", group="A"),
               E("Single-leg Romanian Deadlift (holding luggage)", 3, "10/leg", group="B"), E("Chair Dip", 3, "10-15", group="B"),
               E("Finisher: Burpee (or step-back burpee)", 5, "10 every minute"), STRETCH],
    ["x-gen-nhs-scotland-hotel-room-circuit", "seven-minute-workout"])

# ===================================================================================== FAT-LOSS WEEKS (series)
S1 = "Somax Fat-Loss Starter Week"
add("fat-loss-starter-day-1", "Fat-Loss Starter Week - Day 1: Strength A + Walk", "fitness", "beginner", "general",
    ["fat-loss", "strength", "general-fitness"], 35, 3, ["bodyweight", "chair", "bands"],
    "Day 1 of a 3-day beginner fat-loss week: one easy set of six full-body strength moves, then a 15-minute brisk walk.",
    "Beginners doing less than 150 minutes of activity a week who want to lose fat with a plan that's realistic from day one.",
    ["home", "minimal-equipment", "busy"],
    ["Do Day 1, 2 and 3 on non-consecutive days (e.g. Mon/Wed/Fri) and walk on other days if you can.",
     "Food does most of the fat-loss work: aim for a modest deficit (about 0.5 kg a week), not a crash diet.",
     "Strength: one set of 10-15 reps, light to moderate; add a second set after 2-3 weeks.",
     "After 4-6 consistent weeks, move to the Fat-Loss Builder Week."],
    HOME_WU + [E("Squat to Chair", 1, "10-15"), E("Incline Push-up (bench or wall)", 1, "10-15"), E("Glute Bridge", 1, "10-15"),
               E("Band Row", 1, "10-15"), E("Band or Water-bottle Overhead Press (seated)", 1, "10-15"), E("Dead Bug", 1, "8/side"),
               E("Brisk Walk (talk, not sing)", 1, "15 min")],
    ["nhs-home-strength-exercises", "nhs-wirral-walking-plan-medium-walk", "x-gen-growing-stronger-part-1"],
    series=S1, day=1, daysInSeries=3)

add("fat-loss-starter-day-2", "Fat-Loss Starter Week - Day 2: Brisk Walk 30", "walk", "beginner", "general",
    ["fat-loss", "endurance", "general-fitness"], 30, 3, ["bodyweight"],
    "Day 2: a 30-minute walk - 5 easy, 20 brisk, 5 easy. Steady cardio is the backbone of fat loss.",
    "Beginners on the Fat-Loss Starter Week.",
    ["outdoor", "minimal-equipment", "busy"],
    ["Do it on a day between your two strength days.",
     "Brisk = you can talk but couldn't sing.",
     "Add 5 minutes to the brisk section every week or two until you reach 40 minutes.",
     "Bike, swim or cross-trainer at the same effort all count instead."],
    [WALK_WU, E("Brisk Walk", 1, "20 min"), WALK_CD],
    ["nhs-wirral-walking-plan-medium-walk", "x-gen-interval-walking-training"],
    series=S1, day=2, daysInSeries=3)

add("fat-loss-starter-day-3", "Fat-Loss Starter Week - Day 3: Strength B + Walk", "fitness", "beginner", "general",
    ["fat-loss", "strength", "general-fitness"], 35, 3, ["bodyweight", "dumbbells"],
    "Day 3: a second full-body strength session with light dumbbells, then another 15-minute brisk walk.",
    "Beginners on the Fat-Loss Starter Week with a light pair of dumbbells (2-6 kg).",
    ["home", "minimal-equipment", "busy"],
    ["Leave at least a day after Day 1 so your muscles recover.",
     "One or two sets of 10-15 reps; the last few reps should feel moderately hard.",
     "Rest 60s between sets.",
     "Log your weights - you should be able to go up a little every couple of weeks."],
    HOME_WU + [E("Dumbbell Goblet Squat", 2, "10-15"), E("Dumbbell Romanian Deadlift", 2, "10-15"), E("One-arm Dumbbell Row", 2, "10-12/arm"),
               E("Incline Push-up", 2, "10-12"), E("Dumbbell Step-back Lunge (hold chair if needed)", 1, "8/leg"), E("Bird Dog", 1, "6/side"),
               E("Brisk Walk", 1, "15 min")],
    ["nhs-home-strength-exercises", "x-gen-growing-stronger-part-2"],
    series=S1, day=3, daysInSeries=3)

S2 = "Somax Fat-Loss Builder Week"
add("fat-loss-builder-day-1", "Fat-Loss Builder Week - Day 1: Dumbbell Strength A", "fitness", "intermediate", "general",
    ["fat-loss", "strength", "muscle"], 40, 4, ["dumbbells", "bench"],
    "Day 1 of a 4-day intermediate fat-loss week: 3 sets of 8-12 on the big dumbbell lifts to hold on to muscle while you lose fat.",
    "People already doing 150+ minutes of activity a week who want a structured strength + cardio fat-loss week.",
    ["home", "minimal-equipment"],
    ["4 days: strength A, steady cardio, strength B, long walk - with rest or easy walking between.",
     "3 sets of 8-12 at a moderate-hard effort (2 reps in reserve); rest 60-90s.",
     "Keep the deficit modest; aim for 0.5-1 kg a week at most.",
     "Re-test your waist and benchmarks every 4 weeks rather than weighing daily."],
    HOME_WU + [E("Dumbbell Goblet Squat", 3, "8-12"), E("Dumbbell Bench or Floor Press", 3, "8-12"), E("One-arm Dumbbell Row", 3, "8-12/arm"),
               E("Dumbbell Romanian Deadlift", 3, "8-12"), E("Front Plank", 2, "30-40s"), STRETCH],
    ["nhs-home-strength-exercises", "strongfirst-simple-and-sinister", "x-gen-growing-stronger-part-3"],
    series=S2, day=1, daysInSeries=4)

add("fat-loss-builder-day-2", "Fat-Loss Builder Week - Day 2: Steady Cardio 40", "fitness", "intermediate", "general",
    ["fat-loss", "endurance"], 40, 4, ["bodyweight"],
    "Day 2: 40 minutes of steady, moderate cardio - brisk walk, easy jog, bike or swim.",
    "People on the Fat-Loss Builder Week.",
    ["outdoor", "minimal-equipment", "busy"],
    ["Moderate effort the whole way: you can talk in sentences but not sing.",
     "Any mode counts; running tends to help fat loss more than cycling in the research.",
     "Add 5 minutes every fortnight up to 50 minutes.",
     "If you're sore from Day 1, choose a flatter walk or the bike."],
    [WALK_WU, E("Brisk Walk / Easy Jog / Bike (moderate)", 1, "30 min"), WALK_CD],
    ["nhs-wirral-walking-plan-medium-walk", "nhs-couch-to-5k-week-9"],
    series=S2, day=2, daysInSeries=4)

add("fat-loss-builder-day-3", "Fat-Loss Builder Week - Day 3: Dumbbell Strength B", "fitness", "intermediate", "general",
    ["fat-loss", "strength", "muscle"], 40, 4, ["dumbbells"],
    "Day 3: the second strength day - lunges, push-ups, single-leg hinges, presses and side planks.",
    "People on the Fat-Loss Builder Week.",
    ["home", "minimal-equipment"],
    ["At least 48 hours after Day 1.",
     "3 sets of 8-12; rest 60-90s.",
     "Add a rep each week, then go up a dumbbell size when you hit 12 on all sets.",
     "Keep a short walk after dinner on strength days if you can."],
    HOME_WU + [E("Dumbbell Reverse Lunge", 3, "8-10/leg"), E("Push-up (or incline)", 3, "8-12"), E("Single-leg Dumbbell Romanian Deadlift", 3, "8/leg"),
               E("Dumbbell Shoulder Press", 3, "8-12"), E("Dumbbell Bent-over Row (both arms)", 3, "10-12"), E("Side Plank", 2, "20-30s/side"), STRETCH],
    ["nhs-home-strength-exercises", "x-gen-growing-stronger-part-3"],
    series=S2, day=3, daysInSeries=4)

add("fat-loss-builder-day-4", "Fat-Loss Builder Week - Day 4: Long Walk 55", "walk", "intermediate", "general",
    ["fat-loss", "endurance"], 55, 4, ["bodyweight"],
    "Day 4: a long walk of 45-60 minutes with a few hills - the easiest way to push your week past 250 minutes.",
    "People on the Fat-Loss Builder Week.",
    ["outdoor", "minimal-equipment"],
    ["Weekends suit this one; walk with family or a friend.",
     "Steady moderate pace, faster on the hills.",
     "Build from 45 to 60 minutes over a few weeks.",
     "A bushwalk or beach walk counts - take water and sun protection."],
    [WALK_WU, E("Continuous Walk with Hills (moderate)", 1, "45 min"), WALK_CD],
    ["nhs-wirral-walking-plan-medium-walk", "x-gen-interval-walking-training"],
    series=S2, day=4, daysInSeries=4)

S3 = "Somax Fat-Loss Accelerator Week"
add("fat-loss-accelerator-day-1", "Fat-Loss Accelerator Week - Day 1: Strength A", "gym", "advanced", "general",
    ["fat-loss", "strength", "muscle"], 50, 5, ["dumbbells", "bench", "barbell", "squat rack"],
    "Day 1 of a 5-day advanced fat-loss week: heavier compound lifts (4 x 6-10) to keep strength and muscle while dieting.",
    "Experienced trainers already doing 250+ minutes a week with 2+ strength days who want to tighten up their fat loss.",
    ["full-gym"],
    ["5 days: strength A, intervals, strength B, steady cardio, long walk; 2 rest or easy days.",
     "4 sets of 6-10 with 2 reps in reserve; rest 2 minutes on squats and presses.",
     "In a deficit, aim to keep your weights steady - not to set records.",
     "Cap loss at about 1 kg a week; if you're losing faster for 3 weeks, eat a little more."],
    [E("Warm-up: rower or bike", 1, "5 min"), E("Barbell Back Squat", 4, "6-8"), E("Dumbbell Bench Press", 4, "8-10"),
     E("Chest-supported Dumbbell Row", 4, "8-10"), E("Dumbbell Walking Lunge", 3, "10/leg"), E("Hanging Knee Raise or Dead Bug", 3, "10-12"), STRETCH],
    ["stronglifts-5x5-workout-a", "x-gen-hood-10x1-intervals"],
    series=S3, day=1, daysInSeries=5)

add("fat-loss-accelerator-day-2", "Fat-Loss Accelerator Week - Day 2: Low-Impact Intervals", "walk", "advanced", "general",
    ["fat-loss", "endurance"], 35, 5, ["bodyweight"],
    "Day 2: eight 60-second hard efforts of fast incline walking (hill or treadmill) with 90 seconds easy - hard on the lungs, easy on the joints.",
    "People on the Fat-Loss Accelerator Week.",
    ["outdoor", "minimal-equipment", "time-efficient"],
    ["Use a steep hill or a treadmill at 10-15% incline.",
     "Efforts at 8/10 (only a few words possible); walk easy for 90s between.",
     "A bike or rower at the same effort works too.",
     "This is the week's only hard cardio day - keep the others moderate."],
    [WALK_WU, E("Fast Incline Walk (8/10)", 8, "60s", group="A"), E("Easy Walk", 8, "90s", group="A"), WALK_CD],
    ["x-gen-hood-10x1-intervals", "x-gen-interval-walking-training"],
    series=S3, day=2, daysInSeries=5)

add("fat-loss-accelerator-day-3", "Fat-Loss Accelerator Week - Day 3: Strength B", "gym", "advanced", "general",
    ["fat-loss", "strength", "muscle"], 50, 5, ["barbell", "dumbbells", "pull-up bar"],
    "Day 3: hinge, pull and press - Romanian deadlifts, pull-ups, overhead presses and split squats.",
    "People on the Fat-Loss Accelerator Week.",
    ["full-gym"],
    ["At least 48 hours after Day 1.",
     "4 sets of 6-10; rest 2 minutes on the barbell lifts.",
     "Use bands or a machine for assisted pull-ups if needed.",
     "Finish with a 10-minute easy walk or bike."],
    [E("Warm-up: rower or bike", 1, "5 min"), E("Barbell Romanian Deadlift", 4, "6-8"), E("Pull-up (or assisted)", 4, "6-10"),
     E("Standing Dumbbell Overhead Press", 4, "8-10"), E("Dumbbell Bulgarian Split Squat", 3, "8-10/leg"),
     E("Side Plank", 2, "30-45s/side"), E("Easy Walk or Bike", 1, "10 min")],
    ["wendler-bbb-day-2", "stronglifts-5x5-workout-b"],
    series=S3, day=3, daysInSeries=5)

add("fat-loss-accelerator-day-4", "Fat-Loss Accelerator Week - Day 4: Steady Cardio 45", "fitness", "advanced", "general",
    ["fat-loss", "endurance"], 45, 5, ["bodyweight"],
    "Day 4: 45 minutes of moderate cardio - a steady run, ride or swim.",
    "People on the Fat-Loss Accelerator Week.",
    ["outdoor", "minimal-equipment"],
    ["Conversational effort the whole way.",
     "Running suits fat loss well; cycling and swimming are kinder if you're sore.",
     "Don't turn it into a second interval day.",
     "Hydrate well; heat and humidity raise the effort."],
    [E("Warm-up: easy pace", 1, "5 min"), E("Steady Run / Ride / Swim (moderate)", 1, "35 min"), E("Cool-down: easy pace", 1, "5 min")],
    ["nhs-couch-to-5k-week-9", "x-gen-interval-walking-training"],
    series=S3, day=4, daysInSeries=5)

add("fat-loss-accelerator-day-5", "Fat-Loss Accelerator Week - Day 5: Long Hike 75", "walk", "advanced", "general",
    ["fat-loss", "endurance"], 75, 5, ["bodyweight"],
    "Day 5: a 60-90 minute hike or long hilly walk - low-stress, high-volume movement that gets your week well past 250 minutes.",
    "People on the Fat-Loss Accelerator Week.",
    ["outdoor", "minimal-equipment"],
    ["Weekend friendly; pick a bush track or a long coastal walk.",
     "Moderate pace with short breaks; it should leave you pleasantly tired, not wrecked.",
     "Take water, a snack and sun protection.",
     "Swap for the Somax Weighted Ruck 60 once a fortnight for variety."],
    [E("Hike or Hilly Walk (moderate)", 1, "75 min")],
    ["nhs-wirral-walking-plan-medium-walk", "x-gen-interval-walking-training"],
    series=S3, day=5, daysInSeries=5)

json.dump(P, open(OUT, "w"), indent=2, ensure_ascii=False)
print(len(P), "somax written")
