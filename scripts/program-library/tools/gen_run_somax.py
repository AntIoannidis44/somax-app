"""Generate expansion/run-somax.json: original 'Programs by Somax' for running + walking.

Written 2026-11-13 to fill gaps left by the credited sessions (run-sourced.json) and the
existing library. Rules follow playbooks/running.json (Daniels zones, >=80% easy, T <=10%,
I <=8%, R <=5% of weekly km, long run <=150 min and <=30% of weekly km, no structured
intervals until 30 min continuous) and playbooks/general.json (walking, older adults).
Example paces are from the running playbook pace table for a 25:00 5K (VDOT 38.3).
Usage:
    python3 gen_run_somax.py ../expansion/run-somax.json
"""
import json, sys

OUT = sys.argv[1]
P = []


def E(name, sets, reps, weight=None, distance=None, group=None):
    d = {"name": name, "sets": sets, "reps": str(reps)}
    if weight: d["weight"] = weight
    if distance: d["distance"] = distance
    if group: d["group"] = group
    return d


def add(id, name, category, level, sport, goals, minutes, dpw, equipment, description, who, lifestyle, how,
        exercises, basedOn):
    assert id.startswith("x-run-somax-"), id
    assert len(how) == 4, id
    P.append(dict(id=id, name=name, category=category, level=level, sport=sport, goals=goals, duration=f"{minutes} min",
                  daysPerWeek=dpw, sessionMinutes=minutes, equipment=equipment, description=description, whoItsFor=who,
                  lifestyle=lifestyle, howToRun=how, exercises=exercises, credit="Somax", sourceUrl="",
                  sourceNote="Original Somax program.", basedOn=basedOn, verified=False))


# Pace text (Daniels zones; examples for a 25:00 5K from the running playbook table)
EASY = "easy, conversational (e.g. 6:07-6:52/km for a 25:00 5K)"
T = "threshold - comfortably hard (e.g. 5:16/km for a 25:00 5K)"
I = "interval - about 3K-5K race pace (e.g. 4:51/km for a 25:00 5K)"
R = "repetition - about mile race pace, fast and relaxed (e.g. 4:36/km for a 25:00 5K)"
M = "goal marathon pace"
HM = "goal half-marathon pace (e.g. 5:27/km for a 1:55 half)"
JOG_WU = E("Easy jog warm-up", 1, "10 min", "easy")
DRILLS = E("Leg swings + walking lunges", 1, "10/leg")
STRIDES4 = E("Strides (walk back)", 4, "20s", "fast, relaxed")
JOG_CD = E("Easy jog cool-down", 1, "10 min", "easy")
WALK_CD = E("Walk cool-down", 1, "5 min")
BW = ["bodyweight"]
OUT_LS = ["outdoor", "minimal-equipment"]

# ===================================================================== EASY / RECOVERY / LONG
add("x-run-somax-recovery-run", "Somax Recovery Run 25", "run", "intermediate", "running",
    ["endurance", "general-fitness"], 25, 5, BW,
    "A genuinely slow 25-minute run the day after a hard session - the slow end of easy, nothing more.",
    "Runners doing 5-6 days a week who need an extra day of mileage without extra fatigue.",
    OUT_LS + ["time-efficient", "busy"],
    ["Only use the day after a workout or long run, never before one.",
     "Run at the slow end of your easy range - slower than feels necessary.",
     "Flat route, soft surface if you have one; walk breaks are fine.",
     "If legs still feel heavy after 10 minutes, cut it to 15 or walk instead."],
    [E("Very easy run", 1, "25 min", "slow end of easy - you could sing")],
    ["x-run-kieser-jog-strides", "x-run-nhs-c25k-week-7"])

add("x-run-somax-easy-aerobic-45", "Somax Easy Aerobic 45", "run", "intermediate", "running",
    ["endurance", "fat-loss", "general-fitness"], 45, 4, BW,
    "The bread-and-butter run: 45 steady minutes at a fully conversational pace to build your aerobic engine.",
    "Runners who can run 30+ minutes and want the easy run that should make up most of their week.",
    OUT_LS,
    ["At least 80% of your weekly running time should feel like this.",
     "Talk test: full sentences the whole way. Heart rate roughly 65-75% of max.",
     "Grow it by 5 minutes at a time, keeping weekly increases around 5-10%.",
     "Hot day? Run by effort, not pace, and slow down."],
    [E("Easy run", 1, "45 min", EASY)],
    ["x-run-pat-carroll-long-run-walk-breaks", "x-run-dinneen-long-run-pickup"])

add("x-run-somax-first-long-run-60", "Somax First Long Run 60", "run", "beginner", "running",
    ["endurance"], 60, 3, BW,
    "Your first hour on your feet: 60 minutes easy, with an optional 1-minute walk every 10 minutes.",
    "Couch to 5K graduates moving towards 10 km or a first half marathon.",
    OUT_LS,
    ["Once a week, on a day with rest or easy activity after it.",
     "Planned walk breaks are smart, not cheating - they keep the pace honest.",
     "Grow your long run by about 5-10 minutes a week, cutting back every third week.",
     "Keep it under a third of your weekly running time."],
    [E("Easy run", 6, "9 min", EASY, group="A"), E("Walk break (optional)", 5, "1 min", group="A"), E("Easy run or walk", 1, "1 min")],
    ["x-run-pat-carroll-long-run-walk-breaks", "x-run-nhs-c25k-week-7"])

add("x-run-somax-long-run-90", "Somax Long Run 90 with Fuel Practice", "run", "intermediate", "running",
    ["endurance"], 90, 4, BW,
    "A 90-minute easy long run (about 14-18 km) with a gel or sports drink every 30-40 minutes to train your gut.",
    "Half-marathon and marathon runners in the build phase.",
    OUT_LS,
    ["Long run = no more than 25-30% of weekly km and no more than 150 minutes.",
     "Easy pace throughout; it's time on feet that counts.",
     "Practise the fuel and drink you'll use on race day (aim ~30-60 g carbohydrate per hour).",
     "Every third or fourth week, cut it back by about a quarter."],
    [E("Easy long run", 3, "30 min", EASY, group="A"), E("Fuel: gel or sports drink (while running)", 2, "1", group="A")],
    ["x-run-kellie-angel-lsd-32km", "x-run-dinneen-long-run-pickup"])

add("x-run-somax-hot-day-easy-run", "Somax Hot-Day Easy Run", "run", "beginner", "running",
    ["endurance", "general-fitness"], 30, 3, BW,
    "An Aussie-summer version of your easy run: early or late, shorter, run by effort with planned drink stops.",
    "Any runner training through summer heat and humidity.",
    OUT_LS + ["time-efficient"],
    ["Go before 7 am or after sunset; shaded or coastal routes help.",
     "Run by feel - expect to be 20-60 s/km slower than usual. That's fine.",
     "Drink before you go and carry water; stop at the halfway drink.",
     "Stop and get into shade if you feel dizzy, sick or stop sweating."],
    [E("Brisk walk warm-up", 1, "5 min"), E("Easy run (by effort, not pace)", 2, "10 min", "easy - full sentences", group="A"),
     E("Drink + shade stop", 1, "1-2 min", group="A"), WALK_CD],
    ["x-run-nhs-c25k-week-7", "x-run-unimelb-z5k-week-7-run-3"])

# ===================================================================== TREADMILL
add("x-run-somax-treadmill-easy", "Somax Treadmill Easy Run", "run", "beginner", "running",
    ["endurance", "fat-loss", "general-fitness"], 35, 3, ["treadmill"],
    "A 30-minute easy treadmill run at 1% incline, bookended by walks - the indoor version of your easy day.",
    "New runners, gym-goers, shift workers and anyone dodging rain, dark or heat.",
    ["full-gym", "busy", "travel"],
    ["Set incline to 1% to mimic outdoor effort.",
     "Pick a speed you can talk at - most beginners run 7-9 km/h.",
     "Look ahead, not down, and don't hold the rails.",
     "Graduate from Couch to 5K? This is your treadmill easy day."],
    [E("Walk warm-up (5-6 km/h)", 1, "5 min"), E("Easy run, 1% incline", 1, "25 min", "conversational speed (often 7-9 km/h)"),
     E("Walk cool-down", 1, "5 min")],
    ["x-run-nhs-c25k-week-7", "x-run-unimelb-z5k-week-7-run-3"])

add("x-run-somax-treadmill-intervals", "Somax Treadmill 6 x 2 min", "run", "intermediate", "running",
    ["endurance", "sport-performance", "fat-loss"], 35, 4, ["treadmill"],
    "Six 2-minute efforts at 5K effort with 2-minute walk/jog recoveries - easy to control on a treadmill.",
    "Runners who can run 30 minutes continuously and want a first interval session indoors.",
    ["full-gym", "time-efficient", "busy", "travel"],
    ["Incline 1%. Effort speed = what you could hold for about 5 km.",
     "Straddle the belt or drop to a walk/jog for recovery - don't jump off at speed.",
     "Once a week; keep the other runs easy.",
     "When all six feel strong, add 0.5 km/h to the efforts."],
    [E("Easy jog warm-up, 1% incline", 1, "8 min"), E("Effort", 6, "2 min", "5K effort", group="A"),
     E("Walk/jog recovery", 6, "2 min", group="A"), E("Easy jog cool-down", 1, "3 min")],
    ["x-run-pat-carroll-6x2min", "x-run-kellie-angel-8x2min-fartlek"])

add("x-run-somax-treadmill-hill-pyramid", "Somax Treadmill Hill Pyramid", "run", "intermediate", "running",
    ["strength", "endurance", "fat-loss"], 40, 4, ["treadmill"],
    "Steady running while the incline climbs 2-4-6-8% and back down, two minutes at each step.",
    "Runners without hills nearby - great prep for City2Surf's Heartbreak Hill or a hilly trail race.",
    ["full-gym", "busy", "travel"],
    ["Keep the speed steady and let effort rise with the incline.",
     "If you can't hold form at 8%, drop the speed rather than grabbing the rails.",
     "Once a week in place of a hill session.",
     "Progress by adding a second pyramid or a 10% step."],
    [E("Easy jog warm-up, 1% incline", 1, "8 min"), E("Run at 2% incline", 2, "2 min", "steady"),
     E("Run at 4% incline", 2, "2 min", "steady"), E("Run at 6% incline", 2, "2 min", "steady"),
     E("Run at 8% incline", 1, "2 min", "steady - strong"), E("Easy jog, 1% incline", 1, "4 min"), E("Walk cool-down", 1, "4 min")],
    ["x-run-440-hill-repeats", "x-run-kellie-angel-60s-hill-repeats"])

add("x-run-somax-treadmill-threshold", "Somax Treadmill 2 x 15 min Threshold", "run", "advanced", "running",
    ["endurance", "sport-performance"], 50, 5, ["treadmill"],
    "Two 15-minute threshold blocks with a 3-minute jog - precise pacing for half-marathon and 10K runners.",
    "Experienced runners (30+ km/week) who want a controlled tempo indoors.",
    ["full-gym", "travel"],
    ["Threshold = comfortably hard, the pace you could race for about an hour.",
     "Set the speed from your threshold pace (e.g. 5:16/km = 11.4 km/h) at 1% incline.",
     "Keep threshold work under ~10% of weekly km.",
     "Too hard to finish block 2? You set the speed too high - drop 0.3 km/h next time."],
    [E("Easy jog warm-up, 1% incline", 1, "10 min", "easy"), E("Threshold block", 2, "15 min", T, group="A"),
     E("Easy jog recovery", 1, "3 min", group="A"), E("Easy jog cool-down", 1, "7 min", "easy")],
    ["x-run-kieser-3x10-tempo", "x-run-kieser-tempo-ladder"])

# ===================================================================== TRAIL
add("x-run-somax-trail-run-walk", "Somax Trail Starter Run-Walk", "run", "beginner", "running",
    ["endurance", "general-fitness"], 40, 3, ["trail shoes"],
    "A time-based trail outing: run the flats and gentle downs, power-hike every climb.",
    "Road runners and bushwalkers trying trail running for the first time.",
    ["outdoor"],
    ["Run by time, not distance - trail kilometres are slower.",
     "Walk every hill you can't run while talking. Short, quick steps on descents.",
     "Tell someone your route, carry water and a phone, and pick a well-marked loop.",
     "Watch for roots, rocks and snakes in warmer months."],
    [E("Brisk walk warm-up", 1, "5 min"), E("Easy trail running (flats + gentle downs)", 1, "25 min", "easy, conversational"),
     E("Power-hike every climb (within the 25 min)", 1, "as needed", "hands on thighs on steep bits"), E("Walk cool-down + calf stretch", 1, "10 min")],
    ["x-run-kieser-walk-jog-run-fartlek", "x-run-unimelb-z5k-week-6-run-2"])

add("x-run-somax-trail-hills-technique", "Somax Trail Climb & Descend", "run", "intermediate", "running",
    ["strength", "endurance", "sport-performance"], 60, 4, ["trail shoes"],
    "Uphill power-hiking reps plus downhill technique reps on a trail, inside an easy 60-minute run.",
    "Trail runners training for 10-25 km events with real climbing.",
    ["outdoor"],
    ["Find a 200-400 m trail climb with a runnable descent.",
     "Climbs: alternate 1 rep running, 1 rep power-hiking - learn which is faster for you.",
     "Descents: light quick feet, eyes 3-4 m ahead, arms out for balance. Controlled, not reckless.",
     "Once a week; leave a day of easy running or rest after it."],
    [E("Easy trail run warm-up", 1, "15 min", "easy"), E("Climb (alternate run / power-hike)", 6, "1", "strong", "200-400 m", group="A"),
     E("Descent technique (easy, quick feet)", 6, "1", "controlled", "200-400 m", group="A"), E("Easy trail run cool-down", 1, "15 min", "easy")],
    ["x-run-kellie-angel-u-shaped-hills", "x-run-pat-carroll-15-hill-reps"])

add("x-run-somax-trail-long-run", "Somax Trail Time-on-Feet Long Run", "run", "advanced", "running",
    ["endurance"], 150, 5, ["trail shoes", "hydration pack"],
    "Two to two-and-a-half hours on trails, mixing easy running and power-hiking, with fuel every 30-45 minutes.",
    "Experienced trail runners preparing for 30-50 km or ultra events.",
    ["outdoor"],
    ["Measure in time, not km. Keep it easy - power-hike anything steep.",
     "Eat and drink from the first 30 minutes (~30-60 g carbs/hour); carry enough water for the conditions.",
     "Carry a phone, first-aid/snake bandage and a jacket; tell someone your route and finish time.",
     "Keep long runs to about 150 minutes unless you're in a specific ultra block with a coach."],
    [E("Easy trail running + power-hiking", 5, "30 min", "easy, conversational", group="A"),
     E("Fuel + drink (while moving)", 4, "1", group="A")],
    ["x-run-kellie-angel-surge-hills", "x-run-kellie-angel-lsd-32km"])

# ===================================================================== THRESHOLD / INTERVALS / SPEED
add("x-run-somax-cruise-intervals", "Somax Cruise Intervals 4 x 1 km", "run", "intermediate", "running",
    ["endurance", "sport-performance"], 45, 4, BW,
    "Four 1 km reps at threshold pace with 60-second jogs - the 'little and often' way to raise your threshold.",
    "Intermediate runners training for 10K to half marathon.",
    OUT_LS,
    ["Threshold = comfortably hard - not a race. You should finish wanting one more.",
     "Recoveries are short (about 1 minute per 5 of running) - jog, don't stop.",
     "Progress to 5-6 x 1 km, then 3-4 x 1.6 km, keeping it under ~10% of weekly km.",
     "No more than one threshold session a week alongside one other quality day."],
    [JOG_WU, DRILLS, E("Threshold rep", 4, "1", T, "1 km", group="A"), E("Jog recovery", 3, "60s", "easy", group="A"), JOG_CD],
    ["x-run-kieser-3x10-tempo", "x-run-pat-carroll-5x1km"])

add("x-run-somax-progression-run", "Somax Progression Run 40", "run", "intermediate", "running",
    ["endurance", "sport-performance"], 40, 4, BW,
    "Forty minutes in thirds: easy, then steady, then a final 10-13 minutes at threshold.",
    "Runners who like a single continuous run that finishes strong.",
    OUT_LS + ["time-efficient"],
    ["Start slower than you think; the finish is the workout.",
     "Steady = marathon-ish effort; final third = threshold, comfortably hard.",
     "Counts as a quality day - don't put it next to intervals or a long run.",
     "Progress to 50 minutes or make the final third the last 15 minutes."],
    [E("Easy", 1, "14 min", EASY), E("Steady", 1, "13 min", "steady - marathon effort"), E("Threshold finish", 1, "13 min", T)],
    ["x-run-kellie-angel-progressive-run", "x-run-dinneen-long-run-pickup"])

add("x-run-somax-200s-speed", "Somax 10 x 200 m Speed", "run", "advanced", "running",
    ["sport-performance", "endurance"], 40, 5, ["track or measured route"],
    "Ten fast-but-relaxed 200 m reps at mile pace with full 200 m jog recoveries to sharpen speed and form.",
    "Advanced 5K-10K runners in the peak phase who want top-end speed without heavy fatigue.",
    ["outdoor", "minimal-equipment"],
    ["Repetition pace = about your mile race pace. Smooth, tall and relaxed.",
     "Recovery is long on purpose (2-3x the rep time) - jog the full 200 m.",
     "Keep R-pace volume under ~5% of weekly km.",
     "Every rep the same time; if form breaks, stop the set."],
    [JOG_WU, DRILLS, STRIDES4, E("200 m rep", 10, "1", R, "200 m", group="A"),
     E("Jog recovery", 10, "1", "easy", "200 m", group="A"), JOG_CD],
    ["x-run-kieser-6x400-5k-pace", "x-run-440-10x400"])

add("x-run-somax-track-ladder", "Somax Track Ladder 1200-400", "run", "advanced", "running",
    ["endurance", "sport-performance"], 55, 5, ["track or measured route"],
    "A 5K-specific descending ladder: 1200, 1000, 800, 600 and 400 m at interval pace, getting slightly quicker as reps shorten.",
    "Advanced runners sharpening for a 5K or parkrun PB.",
    ["outdoor", "minimal-equipment"],
    ["1200-800 at interval pace; 600 and 400 a touch faster.",
     "Jog recovery about equal to 2/3 of the rep time.",
     "Total 4 km of quality - within the ~8% weekly cap only if you run 50+ km/week; otherwise drop the 1200.",
     "Don't race the first rep; the 400 should be the fastest."],
    [JOG_WU, DRILLS, STRIDES4, E("1200 m", 1, "1", I, "1200 m"), E("1000 m", 1, "1", I, "1000 m"), E("800 m", 1, "1", I, "800 m"),
     E("600 m", 1, "1", "slightly faster than interval pace", "600 m"), E("400 m", 1, "1", "slightly faster than interval pace", "400 m"),
     E("Jog recovery between reps", 4, "2-3 min", "easy"), JOG_CD],
    ["x-run-pat-carroll-5x1km", "x-run-kieser-6x400-5k-pace"])

add("x-run-somax-over-unders", "Somax Over-Unders", "run", "advanced", "running",
    ["endurance", "sport-performance"], 50, 5, BW,
    "Three continuous blocks that surge above and settle just below threshold - teaches you to recover while still running fast.",
    "Advanced half-marathon and 10K runners in the build phase.",
    OUT_LS,
    ["Each block: 2 min just under threshold, 1 min at 10K-5K effort, repeated 3 times without stopping.",
     "3 minutes' easy jog between blocks.",
     "Hard session - easy days either side.",
     "Start with 2 blocks if threshold work is new."],
    [JOG_WU, DRILLS, E("Under: just below threshold", 9, "2 min", "steady-hard, just under T", group="A"),
     E("Over: 10K-5K effort", 9, "1 min", "10K-5K effort", group="A"), E("Easy jog between blocks (3 blocks of 3 rounds)", 2, "3 min", "easy"), JOG_CD],
    ["x-run-kieser-tempo-ladder", "x-run-kellie-angel-8x2min-fartlek"])

add("x-run-somax-hill-sprints", "Somax Easy Run + Hill Sprints", "run", "intermediate", "running",
    ["sport-performance", "strength"], 35, 4, BW,
    "A 25-minute easy run finished with eight 10-second all-out hill sprints and full walk-back recovery.",
    "Intermediate runners wanting power and better running economy with almost no fatigue cost.",
    OUT_LS + ["time-efficient"],
    ["Steep-ish hill; sprint 10 seconds at near-max effort, tall posture, powerful arms.",
     "Walk back down and rest fully (about 90 seconds) - these are about power, not fitness.",
     "Start with 4-6 sprints; build to 8-10.",
     "Do them on an easy day, not before a workout."],
    [E("Easy run", 1, "25 min", EASY), E("Hill sprint", 8, "10s", "near-max, steep hill"), E("Walk-back recovery", 8, "~90s")],
    ["x-run-pat-carroll-15-hill-reps", "x-run-dinneen-8x1min-hills"])

add("x-run-somax-drills-strides", "Somax Form Drills & Strides", "run", "intermediate", "running",
    ["sport-performance", "mobility"], 30, 4, BW,
    "Running drills (A-skips, B-skips, high knees, butt kicks, carioca) then six strides - better form in half an hour.",
    "Runners who want smoother, more efficient form; ideal before a workout or on an easy day.",
    OUT_LS + ["time-efficient"],
    ["Drills over 20-30 m each, walking back as recovery.",
     "Quality over speed - tall posture, quick feet, relaxed shoulders.",
     "Strides build to about 90% then float to a stop.",
     "Twice a week; replaces strides on an easy day."],
    [E("Easy jog", 1, "10 min", "easy"), E("A-skips", 2, "1", distance="20-30 m"), E("B-skips", 2, "1", distance="20-30 m"),
     E("High knees", 2, "1", distance="20-30 m"), E("Butt kicks", 2, "1", distance="20-30 m"), E("Carioca (each way)", 2, "1", distance="20-30 m"),
     E("Strides (walk back)", 6, "1", "build to ~90%, relaxed", "80-100 m"), E("Easy jog", 1, "5 min", "easy")],
    ["x-run-440-dynamic-warm-up", "x-run-dinneen-strides-session"])

add("x-run-somax-lunchtime-20", "Somax Lunchtime 20 with Pick-ups", "run", "beginner", "running",
    ["endurance", "general-fitness", "fat-loss"], 20, 3, BW,
    "Twenty minutes door-to-door: easy running with six 30-second pick-ups to keep it lively.",
    "Busy runners who can run 20-30 minutes continuously and only have a lunch break.",
    OUT_LS + ["busy", "time-efficient"],
    ["Pick-ups are brisk, not sprints - about 5K effort.",
     "Recover with easy running between them.",
     "Fine on 2-3 days a week; keep one longer easy run on the weekend.",
     "No time to shower? Drop the pick-ups and keep it easy."],
    [E("Easy run", 1, "5 min", EASY), E("Pick-up", 6, "30s", "5K effort", group="A"), E("Easy run", 6, "90s", "easy", group="A"),
     E("Easy run", 1, "3 min", "easy")],
    ["x-run-pat-carroll-15x30-30", "x-run-unimelb-z5k-week-6-run-1"])

# ===================================================================== RACE-SPECIFIC / TESTING
add("x-run-somax-5k-time-trial", "Somax 5K Benchmark Time Trial", "run", "intermediate", "running",
    ["endurance", "sport-performance"], 50, 3, ["track or measured route"],
    "A full warm-up then a 5 km time trial (or parkrun) to set your training paces. Repeat every 4-6 weeks.",
    "Any runner who can run 5 km continuously and wants accurate paces for their plan.",
    ["outdoor", "minimal-equipment"],
    ["Flat, accurately measured route or a parkrun. Rested legs - easy days beforehand.",
     "Start at a pace you can hold, then push the last kilometre.",
     "Enter your time in Somax to update your easy, threshold and interval paces.",
     "Retest every 4-6 weeks; in between, paces rise by no more than about 1 VDOT."],
    [JOG_WU, DRILLS, STRIDES4, E("5 km time trial", 1, "1", "race effort, even pace", "5 km"), E("Easy jog / walk cool-down", 1, "10 min")],
    ["x-run-pat-carroll-3km-time-trial", "x-run-dinneen-15min-plus-1min-reps"])

add("x-run-somax-half-marathon-pace", "Somax 3 x 3 km Half-Marathon Pace", "run", "intermediate", "running",
    ["endurance", "sport-performance"], 70, 4, BW,
    "Three 3 km reps at goal half-marathon pace with 2-minute jogs - lock in race rhythm.",
    "Intermediate half-marathoners in the last 6-8 weeks before race day.",
    OUT_LS,
    ["Goal pace only - faster is not better here.",
     "Jog the 2-minute recoveries.",
     "Progress to 2 x 5 km, then 8 km continuous at goal pace two to three weeks out.",
     "Use race shoes and fuel to rehearse."],
    [JOG_WU, DRILLS, E("Half-marathon pace rep", 3, "1", HM, "3 km", group="A"), E("Jog recovery", 2, "2 min", "easy", group="A"), JOG_CD],
    ["x-run-pat-carroll-long-run-hmp-finish", "x-run-dinneen-4x8min-race-pace"])

# ===================================================================== RETURN / MASTERS
add("x-run-somax-return-to-running", "Somax Return-to-Running 4:1", "run", "beginner", "running",
    ["endurance", "general-fitness"], 35, 3, BW,
    "Five rounds of a 4-minute easy run and 1-minute walk - a safe first step back after 2+ weeks off.",
    "Runners returning after illness, injury (cleared by a health professional), travel or a long break.",
    OUT_LS + ["busy"],
    ["Restart at about half to two-thirds of your old weekly volume.",
     "Pain that changes how you run = stop and walk; if it persists, see a physio.",
     "When this feels easy three times, move to 30 minutes continuous, then rebuild.",
     "Retest your 5K after 3-4 weeks before returning to old paces."],
    [E("Brisk walk warm-up", 1, "5 min"), E("Easy run", 5, "4 min", "easy, conversational", group="A"),
     E("Walk", 5, "1 min", group="A"), WALK_CD],
    ["x-run-nhs-c25k-week-5-run-1", "x-run-unimelb-z5k-week-5-run-2"])

add("x-run-somax-masters-quality", "Somax Masters (50+) Quality Session", "run", "intermediate", "running",
    ["endurance", "sport-performance"], 50, 3, BW,
    "A longer warm-up, six 2-minute efforts at 10K effort with generous 2-minute jog/walk recoveries, and a mobility cool-down.",
    "Runners aged 50+ who want quality work with more recovery built in.",
    OUT_LS + ["older-adults"],
    ["One quality session a week; most other running easy, plus 2 strength sessions.",
     "Warm up longer than you used to - 15 minutes plus drills.",
     "If legs aren't recovered in 48 hours, cut to 4 efforts or add a rest day.",
     "Strength training (Newcastle NHS physio routine or Somax runner strength) matters more with age."],
    [E("Easy jog warm-up", 1, "15 min", "easy"), DRILLS, E("Effort", 6, "2 min", "10K effort", group="A"),
     E("Jog/walk recovery", 6, "2 min", group="A"), E("Easy jog", 1, "5 min", "easy"),
     E("Calf, hip flexor and hamstring stretches", 1, "5 min")],
    ["x-run-pat-carroll-6x2min", "x-run-newcastle-nhs-runner-strength"])

# ===================================================================== STRENGTH & MOBILITY (home)
add("x-run-somax-runner-plyo-power", "Somax Runner Plyo Power", "fitness", "advanced", "running",
    ["sport-performance", "strength"], 30, 2, ["bodyweight", "step or box"],
    "Bodyweight plyometrics for springier running: pogos, skips for height, bounds, single-leg hops and step-up drives.",
    "Advanced runners with a solid strength base and no current lower-limb injury.",
    ["home", "outdoor", "minimal-equipment", "time-efficient"],
    ["Twice a week on easy days, never the day before a workout.",
     "Quality over quantity: full recovery (60-90 s) between sets, stop when contacts get slow or heavy.",
     "Soft grass or a sprung floor - not concrete.",
     "Must be able to do 20 single-leg calf raises and 10 single-leg squats to a box first."],
    [E("Skipping warm-up + leg swings", 1, "5 min"), E("Pogo jumps (stiff ankles)", 3, "20"), E("Skips for height", 3, "10/leg"),
     E("Bounding", 3, "1", distance="20-30 m"), E("Single-leg hop in place", 3, "10/leg"), E("Box/step drive (explosive step-up)", 3, "6/leg"),
     E("Lateral skater hop", 3, "8/side")],
    ["x-run-newcastle-nhs-runner-strength", "x-run-440-dynamic-warm-up"])

add("x-run-somax-calf-achilles", "Somax Calf & Achilles Bulletproofing", "fitness", "intermediate", "running",
    ["strength", "sport-performance"], 15, 3, ["bodyweight", "step or box"],
    "Fifteen minutes of calf and Achilles strength - straight and bent-knee raises, slow lowers off a step and an isometric hold.",
    "Runners increasing mileage or prone to calf strains and Achilles niggles.",
    ["home", "minimal-equipment", "time-efficient", "busy"],
    ["Three times a week, after an easy run or on a rest day.",
     "Lower slowly (3 seconds) every rep; hold a rail for balance.",
     "Mild discomfort (up to 3/10) that settles by next morning is OK; sharp pain isn't.",
     "Add a backpack with books when 3 x 15 single-leg raises feel easy."],
    [E("Single-leg calf raise (straight knee) on step", 3, "12-15/leg", "3 s lower"),
     E("Single-leg calf raise (bent knee) on step", 3, "12-15/leg", "3 s lower"),
     E("Slow heel drop off step (up on two, down on one)", 2, "10/leg"), E("Isometric calf raise hold (mid-range)", 3, "30s/leg"),
     E("Tibialis raise (back against wall)", 2, "15")],
    ["x-run-newcastle-nhs-runner-strength", "x-run-nhs-knee-exercises-runners"])

add("x-run-somax-runner-mobility-15", "Somax Runner's Mobility 15", "other", "beginner", "running",
    ["mobility"], 15, 4, ["bodyweight", "mat"],
    "A 15-minute post-run mobility flow for runners' tight spots: ankles, calves, hips, hamstrings and upper back.",
    "Any runner who feels stiff after runs or sits a lot during the day.",
    ["home", "minimal-equipment", "time-efficient", "busy", "travel"],
    ["Best straight after a run or in the evening.",
     "Hold stretches 30 seconds (60 if you're 65+), breathe slowly, no bouncing.",
     "Mild stretch only - never pain.",
     "Do it 3-5 days a week; noticeable range gains usually take about 6 weeks."],
    [E("Knee-to-wall ankle mobilisation", 2, "10/side"), E("Calf stretch (straight + bent knee)", 2, "30s/side"),
     E("Half-kneeling hip flexor stretch", 2, "30s/side"), E("90/90 hip switches", 2, "8/side"),
     E("Supine hamstring stretch (strap or towel)", 2, "30s/side"), E("Figure-4 glute stretch", 2, "30s/side"),
     E("Open-book thoracic rotation", 2, "8/side")],
    ["x-run-newcastle-nhs-runner-strength", "nhs-flexibility-exercises"])

# ===================================================================== WALKING (sport: general)
add("x-run-somax-treadmill-incline-walk", "Somax Treadmill Incline Walk", "walk", "intermediate", "general",
    ["fat-loss", "endurance", "general-fitness"], 35, 4, ["treadmill"],
    "A steady uphill treadmill walk - high calorie burn and low impact, with the incline doing the work.",
    "People wanting fat loss and fitness without running, or runners on a low-impact day.",
    ["full-gym", "busy", "time-efficient"],
    ["Hands off the rails - holding on cuts the effort a lot.",
     "Breathing hard but able to speak in short sentences.",
     "Start at 5% incline; add 1% a week up to about 10-12%.",
     "3-4 times a week alongside 2 strength days for best fat-loss results."],
    [E("Flat walk warm-up (5 km/h)", 1, "5 min"), E("Incline walk", 1, "25 min", "6-10% incline, 5-5.5 km/h, breathing hard"),
     E("Flat walk cool-down", 1, "5 min")],
    ["x-run-wirral-advanced-brisk-walk", "x-run-nhlbi-walking-week-12"])

add("x-run-somax-lunchtime-power-walk", "Somax Lunchtime Power Walk 20", "walk", "beginner", "general",
    ["fat-loss", "general-fitness"], 20, 5, BW,
    "A brisk 20-minute walk with three 1-minute power bursts - fits in a lunch break, no change of clothes needed.",
    "Office workers and busy parents who want to get to 150 minutes a week a few minutes at a time.",
    ["outdoor", "minimal-equipment", "busy", "time-efficient"],
    ["Most days of the week - it adds 100 minutes towards the 150-minute weekly target.",
     "Brisk = you can talk but not sing; power bursts = short phrases only.",
     "Swing your arms and take quicker, not longer, steps.",
     "Raise your daily steps by about 2,000 at a time, aiming for 7,000+."],
    [E("Easy walk", 1, "3 min"), E("Brisk walk", 3, "4 min", "talk, not sing", group="A"), E("Power walk", 3, "1 min", "short phrases only", group="A"),
     E("Easy walk", 1, "2 min")],
    ["x-run-nhlbi-walking-week-12", "x-run-shinshu-interval-walking"])

add("x-run-somax-stair-walk", "Somax Stair Climb Session", "walk", "intermediate", "general",
    ["fat-loss", "endurance", "strength"], 30, 3, ["stairs or step"],
    "Walking intervals on a staircase or step: climb steadily, walk down carefully, repeat - great for legs and lungs.",
    "Apartment dwellers, office workers with a stairwell, or anyone with a local stair climb.",
    ["home", "minimal-equipment", "time-efficient", "busy"],
    ["Hold the rail on the way down and step carefully.",
     "Climb at a pace where you're puffing but in control.",
     "No stairs? Step-ups on a sturdy step (20-30 cm) work too.",
     "Not suitable if you have balance problems - choose a flat walk instead."],
    [E("Flat walk warm-up", 1, "5 min"), E("Climb stairs (2-4 flights / step-ups 2 min)", 8, "1", "puffing, steady", group="A"),
     E("Walk down carefully / easy walk", 8, "1-2 min", group="A"), E("Flat walk cool-down", 1, "5 min")],
    ["x-run-wirral-advanced-brisk-walk", "nhs-home-strength-exercises"])

add("x-run-somax-older-walk-balance", "Somax Walk & Balance (60+)", "walk", "beginner", "general",
    ["general-fitness", "mobility", "strength"], 35, 3, ["bodyweight", "chair"],
    "A 20-minute comfortable walk followed by 10 minutes of balance and leg strength at the kitchen bench.",
    "Adults 60+ who walk already and want to stay steady on their feet. Walking alone doesn't prevent falls - this adds what's missing.",
    ["older-adults", "home", "outdoor", "minimal-equipment"],
    ["Three days a week with a rest day between; walk on other days too.",
     "Always have the bench or a sturdy chair within reach for balance work.",
     "Progress balance by touching the bench less, then not at all.",
     "Any fall in the past year? Check with your GP first and keep a hand on support."],
    [E("Comfortable walk", 1, "20 min", "can chat the whole way"), E("Sit to stand (chair)", 2, "10"),
     E("Heel-to-toe walk along the bench", 2, "10 steps"), E("Sideways walking along the bench", 2, "10 steps each way"),
     E("Single-leg stand (hold bench)", 2, "10-30s/leg"), E("Calf raise (hold bench)", 2, "10")],
    ["x-run-wirral-beginner-walk-week-1", "nhs-home-strength-exercises"])

add("x-run-somax-older-walking-snacks", "Somax 3 x 10 Walking Snacks (Supported)", "walk", "beginner", "general",
    ["general-fitness", "endurance"], 30, 5, BW,
    "Three 10-minute walks spread through the day, each finished with one simple balance drill at the bench.",
    "Older or deconditioned adults who find a 30-minute walk too much in one go.",
    ["older-adults", "home", "minimal-equipment", "busy"],
    ["Split the day: e.g. after breakfast, lunch and dinner.",
     "Usual comfortable pace; use your walking aid if you have one.",
     "Do the balance drill holding the bench every time.",
     "When 10 minutes feels easy, make one walk 15 minutes, then 20."],
    [E("Walk (morning)", 1, "10 min", "comfortable"), E("Balance: heel-to-toe stand, hold bench", 1, "10s each side"),
     E("Walk (midday)", 1, "10 min", "comfortable"), E("Balance: sideways walking along the bench", 1, "10 steps each way"),
     E("Walk (evening)", 1, "10 min", "comfortable"), E("Balance: single-leg stand, hold bench", 1, "10s/leg")],
    ["x-run-nhlbi-walking-week-1", "x-run-wirral-beginner-walk-week-1"])

add("x-run-somax-bushwalk-prep", "Somax Bushwalk Prep Hike", "walk", "intermediate", "general",
    ["endurance", "strength", "fat-loss"], 90, 2, ["daypack", "walking shoes"],
    "A 90-minute hilly walk carrying a light daypack - builds the legs and stamina for day hikes and multi-day walks.",
    "Walkers training for bushwalks like the Overland Track, Larapinta or a big day hike.",
    ["outdoor"],
    ["Once a week; start with 3-4 kg in the pack and add 1 kg a week to about 8-10 kg.",
     "Pick a route with real climbs; short steps uphill, poles help on the descents.",
     "Carry water, snacks, a phone and sun protection; tell someone your route.",
     "Build towards 2-3 hours if your goal hike is a long day."],
    [E("Easy walk warm-up", 1, "10 min"), E("Hilly walk with daypack", 1, "70 min", "steady - can talk in sentences, harder on climbs"),
     E("Easy walk cool-down + calf/hip stretches", 1, "10 min")],
    ["x-run-wirral-advanced-long-walk", "x-run-kellie-angel-surge-hills"])

add("x-run-somax-ruck-walk", "Somax Ruck Walk 45", "walk", "intermediate", "general",
    ["strength", "endurance", "fat-loss"], 45, 2, ["backpack with weight"],
    "A brisk 45-minute walk with a weighted backpack - more work for legs, back and heart without running.",
    "Fit walkers who want a tougher low-impact session; useful for hikers and tradies alike.",
    ["outdoor", "minimal-equipment"],
    ["Start with 5 kg high and tight on your back; add 1-2 kg a week, keeping it under ~15% of bodyweight.",
     "Walk tall - don't lean forward; shorten your stride if needed.",
     "Twice a week, not on back-to-back days.",
     "Skip it if you have back or knee pain."],
    [E("Unloaded walk warm-up", 1, "5 min"), E("Weighted ruck walk", 1, "35 min", "brisk, 5-10 kg pack"),
     E("Unloaded walk cool-down", 1, "5 min")],
    ["x-run-wirral-advanced-brisk-walk", "x-run-nhlbi-walking-week-12"])

add("x-run-somax-walk-to-jog-bridge", "Somax Walk-to-Jog Bridge", "walk", "beginner", "general",
    ["endurance", "fat-loss", "general-fitness"], 30, 3, BW,
    "Brisk walking with eight 30-second gentle jogs - the bridge between a walking plan and Couch to 5K.",
    "Walkers who can walk briskly for 30 minutes and want to try jogging gently.",
    ["outdoor", "minimal-equipment", "busy"],
    ["Three times a week, rest days between.",
     "Jog so slowly you could almost walk faster - that's right.",
     "When all eight feel comfortable twice, start Couch to 5K Week 1.",
     "Sore joints? Stay with brisk walking another week."],
    [E("Brisk walk warm-up", 1, "5 min"), E("Gentle jog", 8, "30s", "very easy", group="A"), E("Brisk walk", 8, "2 min", group="A"), WALK_CD],
    ["x-run-nhlbi-walking-week-12", "nhs-couch-to-5k-week-1"])

add("x-run-somax-parkrun-walk", "Somax 5 km Power Walk (parkrun pace)", "walk", "intermediate", "general",
    ["endurance", "fat-loss", "general-fitness"], 55, 3, BW,
    "A brisk 5 km walk aiming for 9-10 minutes per km - perfect practice for walking a Saturday parkrun.",
    "Regular walkers who want a measurable goal and a weekly community event.",
    ["outdoor", "minimal-equipment"],
    ["Time yourself - aim to knock 15-30 s off each month.",
     "Quick, short steps and a strong arm swing; stay tall.",
     "Brisk = breathing harder, short sentences.",
     "parkrun welcomes walkers - many finish in 45-60 minutes."],
    [E("Easy walk warm-up", 1, "5 min"), E("Power walk", 1, "1", "brisk, about 9-10 min/km", "5 km"), WALK_CD],
    ["x-run-wirral-advanced-brisk-walk", "x-run-nhlbi-walking-week-12"])

add("x-run-somax-weekend-long-walk", "Somax Weekend Long Walk 60", "walk", "beginner", "general",
    ["endurance", "fat-loss", "general-fitness"], 60, 1, BW,
    "One relaxed hour of walking at a comfortable pace - the walking equivalent of a runner's long run.",
    "Walkers who have built up to 30-40 minutes and want one longer walk each weekend.",
    ["outdoor", "minimal-equipment"],
    ["Once a week; keep weekday walks shorter and brisker.",
     "Comfortable pace - you can chat the whole way. Coastal paths, parks and rail trails are ideal.",
     "Grow from 45 to 60 minutes, then towards 75-90 minutes.",
     "Bring water and a hat in summer."],
    [E("Easy walk", 1, "5 min"), E("Comfortable walk", 1, "50 min", "can chat the whole way"), E("Easy walk + calf stretch", 1, "5 min")],
    ["x-run-wirral-advanced-long-walk", "x-run-nhlbi-walking-week-12"])

# ---------------------------------------------------------------------------- write
ids = [p["id"] for p in P]
assert len(ids) == len(set(ids)), "duplicate ids"
json.dump(P, open(OUT, "w"), indent=2, ensure_ascii=False)
print(f"wrote {len(P)} Somax entries -> {OUT}")
