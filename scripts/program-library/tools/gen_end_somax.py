"""Generate expansion/end-somax.json: original Somax cycling / swimming / hybrid sessions.

Built from the endurance playbook (playbooks/endurance.json/.md) and the credited sessions in end-sourced.json /
sourced-programs.json (listed per entry in basedOn). Zones: cycling % FTP (Coggan / sweet spot 88-94%), swimming
CSS offsets per 100m, HYROX loads per hyrox.com Open standards. Pools are 25m unless stated; all metric.
Run: python3 tools/gen_end_somax.py expansion/end-somax.json
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


def S(id, name, category, level, sport, goals, mins, days, eq, desc, who, lifestyle, how, ex, based, series=None, day=None, n=None):
    p = {"id": "x-end-somax-" + id, "name": name}
    if series: p.update(series=series, day=day, daysInSeries=n)
    p.update(category=category, level=level, sport=sport, goals=goals, duration=f"{mins} min", daysPerWeek=days, sessionMinutes=mins,
             equipment=eq, description=desc, whoItsFor=who, lifestyle=lifestyle, howToRun=how, exercises=ex, credit="Somax", sourceUrl="",
             sourceNote="Original Somax program.", basedOn=based, verified=False)
    P.append(p)


BCWU = E("British Cycling 20-min warm-up (or 15 min easy building to tempo)", 1, "20 min")
EASY_CD = E("Cool-down, easy spin", 1, "10 min", "<55% FTP")

# =========================================================================================
# CYCLING
# =========================================================================================
S("cyc-first-ride-30", "Somax First Ride 30", "ride", "beginner", "cycling", ["general-fitness", "endurance", "fat-loss"], 30, 3,
  ["bike", "indoor trainer, spin bike or gym bike"],
  "Your first structured ride: 20 easy minutes with short cadence lifts so you learn to pedal smoothly without pushing hard.",
  "Complete beginners or anyone returning to exercise who wants a gentle, low-impact start on a trainer or gym bike.",
  ["home", "full-gym", "busy", "time-efficient"],
  ["3 times a week on non-consecutive days.", "Easy = you can hold a full conversation (Zone 1-2, under 75% FTP).",
   "Add 5 minutes to the steady block each week until you reach 45 minutes.",
   "Then move to Somax First Intervals 40 or the Somax Indoor Endurance Ride."],
  [E("Easy spin, light gear", 1, "5 min", "Z1, 80-90 rpm"), E("Steady, conversational", 4, "4 min 30s", "Z2 (56-75% FTP)", group="A"),
   E("Cadence lift - same gear, spin faster", 4, "30s", "95-100 rpm", group="A"), E("Easy cool-down", 1, "5 min", "Z1")],
  ["x-end-bc-zone-build", "british-cycling-20-min-warm-up"])

S("cyc-first-intervals-40", "Somax First Intervals 40", "ride", "beginner", "cycling", ["endurance", "general-fitness"], 40, 1,
  ["bike", "indoor trainer, spin bike or gym bike"],
  "Five 2-minute 'comfortably hard' efforts with equal easy recovery - the gentlest way into interval training.",
  "Beginners who can ride 30-45 minutes easily and want their first harder session of the week.",
  ["home", "full-gym", "time-efficient"],
  ["Once a week, after at least 4 weeks of easy riding.", "Efforts = Zone 3 / RPE 6: you can speak in short sentences only.",
   "Progress to 5 x 3 minutes, then 4 x 5 minutes over 4-6 weeks.", "Next step: British Cycling Tempo Intervals or Sweet-Spot Intervals."],
  [E("Easy spin building gradually", 1, "10 min", "Z1-Z2"), E("Comfortably hard effort", 5, "2 min", "Z3 / RPE 6, 85-95 rpm", group="A"),
   E("Easy spin", 5, "2 min", "Z1", group="A"), EASY_CD],
  ["x-end-bc-tempo-intervals", "x-end-cuk-harder-efforts-3x5"])

S("cyc-outdoor-easy-explorer", "Somax Outdoor Easy Explorer Ride", "ride", "beginner", "cycling", ["endurance", "general-fitness"], 60, 2,
  ["bike", "helmet", "water bottle", "lights"],
  "A relaxed hour outside that builds base fitness and the basic skills: gear changes before hills, drinking on the move and smooth braking.",
  "New riders getting comfortable on the road or bike paths, building towards longer weekend rides.",
  ["outdoor"],
  ["1-2 times a week, ideally on quiet roads or shared paths.", "Keep it conversational the whole way, including up hills - use your easiest gears.",
   "Add about 10km a week to your longest ride, as Cycling UK's plan does.", "Check tyres, brakes and lights before every ride."],
  [E("Easy rolling on the flat", 1, "10 min", "Z1-Z2"), E("Conversational riding", 1, "40 min", "Z2 / talk test"),
   E("Skill: shift to an easier gear before each climb", 1, "every hill"), E("Skill: drink on the move", 4, "every 10-15 min"),
   E("Easy spin home", 1, "10 min", "Z1")],
  ["x-end-cuk-steady-session", "x-end-cuk-harder-efforts-3x5"])

S("cyc-recovery-spin-30", "Somax Recovery Spin 30", "ride", "beginner", "cycling", ["mobility", "endurance"], 30, 1,
  ["bike", "indoor trainer or gym bike"],
  "A truly easy spin the day after a hard session or long ride, with a few smooth high-cadence minutes to flush the legs.",
  "Riders of any level on a recovery day; also suits older riders and anyone with heavy legs.",
  ["home", "full-gym", "time-efficient", "older-adults"],
  ["The day after your hardest session of the week.", "Never above Zone 1 (under 55% FTP) - it should feel almost too easy.",
   "Skip it and rest if you're unwell or very tired.", "Pairs well with Somax Cyclist Mobility 15 afterwards."],
  [E("Very easy spin", 1, "10 min", "Z1, 85-95 rpm"), E("Smooth high cadence, light gear", 4, "1 min", "100-105 rpm", group="A"),
   E("Very easy spin", 4, "2 min", "Z1", group="A"), E("Very easy spin", 1, "8 min", "Z1")],
  ["x-end-bc-spin-out", "x-end-bc-leg-speed"])

S("cyc-gym-spin-45", "Somax Gym Spin Bike 45", "ride", "beginner", "cycling", ["fat-loss", "endurance", "general-fitness"], 45, 2,
  ["spin bike or gym bike"],
  "A structured spin-class style session for a gym bike using effort (RPE) instead of power: seated climbs, cadence surges and a standing finish.",
  "Gym members who want a cycling workout without a power meter or class timetable.",
  ["full-gym", "time-efficient"],
  ["2 times a week, not on consecutive days.", "RPE scale: 3 easy, 5 steady, 7 hard but controlled, 8-9 very hard.",
   "Adjust the resistance knob to hit the RPE, not someone else's numbers.", "Stand up only on a heavy resistance so the pedals don't spin away from you."],
  [E("Warm-up, light resistance", 1, "8 min", "RPE 3 building to 5"),
   E("Seated climb, heavy resistance", 3, "3 min", "RPE 7, 65-75 rpm", group="A"), E("Easy spin", 3, "2 min", "RPE 3", group="A"),
   E("Cadence surge, light-moderate resistance", 6, "30s", "RPE 8, 100-110 rpm", group="B"), E("Easy spin", 6, "30s", "RPE 3", group="B"),
   E("Standing climb, heavy resistance", 2, "2 min", "RPE 7-8", group="C"), E("Easy spin", 2, "2 min", "RPE 3", group="C"),
   E("Cool-down", 1, "6 min", "RPE 2-3")],
  ["x-end-bc-big-gear-low-cadence", "x-end-bc-leg-speed", "x-end-cuk-harder-efforts-3x5"])

S("cyc-gentle-ride-older-adults", "Somax Gentle Ride for Strong Hearts", "ride", "beginner", "cycling", ["general-fitness", "endurance"], 30, 3,
  ["upright or recumbent exercise bike"],
  "A gentle 30 minutes on a stationary bike with four short 'brisk' blocks, plus seated stretches. Joint-friendly and easy to fit in.",
  "Older adults or anyone managing joint pain who wants safe, low-impact cardio at home or the gym.",
  ["older-adults", "home", "full-gym", "time-efficient"],
  ["3 times a week; check with your GP first if you've been inactive or have a heart condition.",
   "Brisk = breathing harder but you can still talk in sentences; ease off if you feel dizzy or have chest pain.",
   "A recumbent bike is fine if getting on and off an upright is hard.", "Add a minute to each brisk block every 2 weeks."],
  [E("Easy pedalling", 1, "8 min", "can chat"), E("Brisk pedalling", 4, "2 min", "short sentences", group="A"),
   E("Easy pedalling", 4, "2 min", "can chat", group="A"), E("Easy pedalling", 1, "6 min"),
   E("Seated stretches - calves, hamstrings, chest", 1, "3 min")],
  ["x-end-cuk-harder-efforts-3x5", "x-end-bc-zone-build", "nhs-flexibility-exercises"])

S("cyc-sweet-spot-45", "Somax Sweet Spot 45 Express", "ride", "intermediate", "cycling", ["endurance", "sport-performance"], 45, 2,
  ["bike", "smart trainer or power meter"],
  "Two 12-minute sweet-spot efforts in 45 minutes - the most FTP-building bang for your buck on a busy day.",
  "Time-poor riders with an FTP who can only train indoors for 45 minutes midweek.",
  ["home", "busy", "time-efficient"],
  ["1-2 times a week with an easy day between.", "Sweet spot = 88-94% FTP; it should feel 'comfortably hard', not a race.",
   "Progress to 2 x 15, then 2 x 18 minutes, before moving to the British Cycling 2 x 20.", "Retest FTP every 6-8 weeks."],
  [E("Easy, building", 1, "7 min", "Z1-Z2"), E("High-cadence spin-up", 3, "1 min", "100-110 rpm, Z3"),
   E("Sweet-spot effort", 2, "12 min", "88-94% FTP, 85-95 rpm", group="A"), E("Easy spin", 1, "4 min", "<55% FTP", group="A"),
   E("Cool-down", 1, "7 min", "<55% FTP")],
  ["x-end-bc-3x10-sweet-spot", "british-cycling-2x20-sweet-spot", "x-end-bc-sweet-spot-intervals"])

S("cyc-threshold-4x8", "Somax Threshold 4 x 8", "ride", "intermediate", "cycling", ["endurance", "sport-performance"], 65, 1,
  ["bike", "smart trainer or power meter"],
  "Four 8-minute efforts right at threshold with 4 minutes recovery - the core session for raising FTP.",
  "Intermediate riders with a recent FTP who have done several weeks of sweet-spot work.",
  ["home"],
  ["Once a week in a build phase; keep the day before and after easy.", "Threshold = 95-100% FTP; pace evenly and keep cadence 85-95 rpm.",
   "If power drops more than 5% in the last rep, stop there.", "Progress to 4 x 10, then 3 x 15 (Somax Threshold 3 x 15)."],
  [E("Warm-up, building", 1, "12 min", "Z1-Z3"), E("Threshold effort", 4, "8 min", "95-100% FTP", group="A"),
   E("Easy spin", 3, "4 min", "<55% FTP", group="A"), EASY_CD],
  ["x-end-bc-pyramid-intervals-1", "x-end-cts-20-min-ftp-test", "x-end-bc-3x10-sweet-spot"])

S("cyc-threshold-3x15", "Somax Threshold 3 x 15", "ride", "advanced", "cycling", ["endurance", "sport-performance"], 85, 1,
  ["bike", "smart trainer or power meter"],
  "Three 15-minute threshold blocks with 5 minutes easy - long, steady time at FTP for time trials, triathlon and climbing.",
  "Advanced riders and triathletes in a build phase who can already complete 4 x 10 at threshold.",
  ["home"],
  ["Once a week at most.", "Ride at 95-100% FTP; time triallists can use race position for the middle block.",
   "Fuel: a bottle with carbohydrate (30-60g) for sessions this long.", "Retest FTP after 6 weeks; then progress to 2 x 20 at threshold."],
  [BCWU, E("Threshold effort", 3, "15 min", "95-100% FTP, 85-95 rpm", group="A"), E("Easy spin", 2, "5 min", "<55% FTP", group="A"), EASY_CD],
  ["x-end-bc-under-over", "british-cycling-2x20-sweet-spot", "x-end-cts-20-min-ftp-test"])

S("cyc-first-vo2-6x2", "Somax First VO2 6 x 2", "ride", "intermediate", "cycling", ["endurance", "sport-performance"], 45, 1,
  ["bike", "smart trainer, power meter or HR monitor"],
  "Six 2-minute hard efforts with equal recovery: a short, manageable introduction to VO2max work in 45 minutes.",
  "Intermediate riders who have done tempo and sweet-spot work and want to start lifting their top end.",
  ["home", "time-efficient"],
  ["Once a week; never two hard days in a row.", "Efforts at 106-115% FTP (or RPE 8-9; heart rate will lag in the first rep).",
   "Progress to 5 x 3 (British Cycling Improvers VO2), then 5 x 4.", "Not for the first 4 weeks of training if you're new."],
  [E("Warm-up, building", 1, "12 min", "Z1-Z3"), E("High-cadence spin-up", 2, "1 min", "105-110 rpm"),
   E("VO2 effort", 6, "2 min", "106-115% FTP, 95+ rpm", group="A"), E("Easy spin", 6, "2 min", "<55% FTP", group="A"), E("Cool-down", 1, "7 min", "<55% FTP")],
  ["x-end-bc-improvers-vo2", "ntnu-4x4-intervals"])

S("cyc-vo2-30-30s", "Somax VO2 30/30s", "ride", "advanced", "cycling", ["endurance", "sport-performance"], 55, 1,
  ["bike", "smart trainer or power meter"],
  "Two sets of 10 x 30 seconds hard / 30 seconds easy: lots of time near VO2max with less suffering than long reps.",
  "Advanced riders and racers in a build phase who want a VO2 session that's different from long 4-5 minute reps.",
  ["home", "time-efficient"],
  ["Once a week; alternate weeks with longer VO2 reps.", "Hard = 120% FTP; easy = 50% FTP. Keep the hard reps even rather than sprinting.",
   "Add a third set once two feel controlled.", "Stop if power drops more than 10%."],
  [BCWU, E("Hard", 2, "10 x 30s", "120% FTP, 100+ rpm", group="A"), E("Easy between reps", 2, "10 x 30s", "50% FTP", group="A"),
   E("Easy spin between sets", 1, "5 min", "<55% FTP"), EASY_CD],
  ["x-end-bc-20-40s", "x-end-bc-ramped-vo2"])

S("cyc-time-crunched-30", "Somax Time-Crunched 30", "ride", "intermediate", "cycling", ["fat-loss", "endurance", "sport-performance"], 30, 2,
  ["bike", "indoor trainer or spin bike"],
  "Ten 1-minute hard efforts with 1 minute easy, in 30 minutes total - a full workout when there's no time for more.",
  "Busy riders who can only squeeze in half an hour but still want a quality session.",
  ["home", "full-gym", "busy", "time-efficient"],
  ["Up to twice a week, never on consecutive days.", "Hard = 110-120% FTP or RPE 8: hard but repeatable for all ten.",
   "Easy minutes really are easy (<55% FTP).", "Pair with longer easy rides at the weekend for base fitness."],
  [E("Warm-up, building", 1, "7 min", "Z1-Z3"), E("Hard effort", 10, "1 min", "110-120% FTP / RPE 8", group="A"),
   E("Easy spin", 10, "1 min", "<55% FTP", group="A"), E("Cool-down", 1, "3 min")],
  ["x-end-bc-improvers-vo2", "x-end-bc-20-40s", "ntnu-4x4-intervals"])

S("cyc-hill-repeats", "Somax Outdoor Hill Repeats", "ride", "intermediate", "cycling", ["strength", "endurance", "sport-performance"], 70, 1,
  ["bike", "helmet", "water bottle"],
  "Six 3-minute climbs on a steady hill, mixing seated and standing, with a roll-down recovery each time.",
  "Riders preparing for hilly sportives or club rides who have a 3-5% hill of 1km or so nearby.",
  ["outdoor"],
  ["Once a week; choose a quiet hill with a safe place to turn.", "Climb at threshold effort (Zone 4 / RPE 7-8): steady, not a sprint.",
   "Ride the first 2 minutes seated at 70-80 rpm, then stand for the last minute.", "Roll back down easily and start again when breathing settles (3-4 min)."],
  [E("Easy ride to the hill", 1, "15 min", "Z1-Z2"), E("Hill climb - 2 min seated, 1 min standing", 6, "3 min", "Z4 / RPE 7-8", group="A"),
   E("Roll down and recover", 6, "3-4 min", "Z1", group="A"), E("Easy ride home", 1, "15 min", "Z1-Z2")],
  ["x-end-bc-big-gear-low-cadence", "x-end-cuk-harder-efforts-2x10"])

S("cyc-sprint-starts", "Somax Outdoor Sprint Starts", "ride", "advanced", "cycling", ["sport-performance", "strength"], 65, 1,
  ["bike", "helmet"],
  "Short maximal sprints from a slow rolling start, then longer sprints from speed, with full recovery between.",
  "Racers and crit riders who need a stronger jump and acceleration.",
  ["outdoor"],
  ["Once a week in the pre-season or race season; only on a closed circuit or very quiet, straight road.",
   "Jump out of the saddle for the first 6-8 seconds, then sit and spin it out.", "Take the full 4-5 minutes between sprints - quality over quantity.",
   "Stop the session when your peak speed drops noticeably."],
  [E("Easy ride with 3 short accelerations", 1, "20 min", "Z1-Z2"), E("Sprint from rolling ~15 km/h, mid gear", 6, "12s", "max", group="A"),
   E("Easy recovery", 6, "4 min", "Z1", group="A"), E("Sprint from ~30 km/h, bigger gear", 3, "20s", "max", group="B"),
   E("Easy recovery", 3, "5 min", "Z1", group="B"), E("Easy ride home", 1, "10 min")],
  ["x-end-bc-geared-sprint-pyramid", "x-end-bc-russian-steps", "x-end-bc-neuromuscular-intervals"])

S("cyc-endurance-90-tempo", "Somax Endurance Ride 90 + Tempo Finish", "ride", "intermediate", "cycling", ["endurance", "fat-loss"], 90, 1,
  ["bike", "helmet", "2 bottles", "snacks"],
  "A 90-minute aerobic ride with a 15-minute tempo block near the end, practising eating and drinking on the bike.",
  "Intermediate riders building towards 60-100km rides or sportives.",
  ["outdoor"],
  ["Once a week, usually at the weekend.", "Zone 2 = 56-75% FTP or conversational; tempo = 76-90% FTP, short sentences.",
   "Eat 30-60g of carbohydrate per hour from the first 30 minutes; drink to thirst.", "Add 15 minutes of Zone 2 every 1-2 weeks; drop back every 4th week."],
  [E("Easy start", 1, "10 min", "Z1-Z2"), E("Endurance riding", 1, "50 min", "Z2"), E("Fuel and drink", 3, "every 20 min"),
   E("Tempo block", 1, "15 min", "Z3 (76-90% FTP)"), E("Easy spin home", 1, "15 min", "Z1-Z2")],
  ["x-end-cuk-steady-session", "x-end-bc-tempo-intervals"])

S("cyc-long-ride-3h", "Somax Advanced Long Ride", "ride", "advanced", "cycling", ["endurance", "sport-performance"], 180, 1,
  ["bike", "helmet", "2-3 bottles", "food", "repair kit"],
  "Three hours of endurance riding with three 20-minute tempo/sweet-spot blocks - the classic long ride for 100km+ events.",
  "Advanced riders and long-course triathletes preparing for 100-160km sportives or half/full-distance events.",
  ["outdoor"],
  ["Once a week; plan a route with few stops and a café option.", "Blocks at 80-90% FTP; everything else Zone 2.",
   "Fuel 60-90g carbohydrate per hour; practise your race-day food.", "Increase by no more than 30 minutes every 2 weeks; take a lighter week every 4th week."],
  [E("Easy start", 1, "20 min", "Z1-Z2"), E("Endurance riding", 1, "40 min", "Z2"), E("Tempo/sweet-spot block", 3, "20 min", "80-90% FTP", group="A"),
   E("Endurance riding between blocks", 2, "20 min", "Z2", group="A"), E("Endurance riding", 1, "20 min", "Z2"), E("Easy spin home", 1, "20 min", "Z1"),
   E("Fuel: carbohydrate", 6, "every 30 min", "60-90 g/h")],
  ["x-end-cuk-steady-session", "british-cycling-2x20-sweet-spot", "x-end-bc-3x10-sweet-spot"])

S("cyc-cadence-skills-45", "Somax Pedalling Skills 45", "ride", "intermediate", "cycling", ["sport-performance", "endurance"], 45, 1,
  ["bike", "indoor trainer"],
  "Single-leg pedalling, high-cadence spin-ups and low-cadence torque blocks to build a smoother, stronger pedal stroke.",
  "Riders who bounce at high cadence, mash at low cadence, or want a technical session on an easy week.",
  ["home"],
  ["Once a week, any time of year; not on the road (single-leg drills need a trainer).",
   "Single-leg: unclip one foot and rest it on a stool; light gear, focus on pulling through the bottom.",
   "Spin-ups: build cadence until you start to bounce, then back off 5 rpm.", "Low-cadence blocks stay seated and smooth; skip them with knee pain."],
  [E("Easy spin", 1, "10 min", "Z1-Z2"), E("Single-leg pedalling, each leg", 4, "1 min/leg", "light gear", group="A"),
   E("Both legs, easy", 4, "1 min", group="A"), E("Spin-up to max smooth cadence", 5, "1 min", "light gear, 110-120 rpm", group="B"),
   E("Easy spin", 5, "1 min", group="B"), E("Seated low-cadence torque", 3, "3 min", "Z3, 60 rpm", group="C"),
   E("Easy spin", 3, "2 min", group="C"), E("Cool-down", 1, "4 min")],
  ["x-end-bc-leg-speed", "x-end-bc-big-gear-low-cadence", "x-end-bc-spin-out"])

# --- strength & mobility for cyclists
S("cyc-strength-gym", "Somax Cyclist Gym Strength", "fitness", "intermediate", "cycling", ["strength", "sport-performance"], 50, 2,
  ["barbell or dumbbells", "bench or box", "cable or band"],
  "Leg, hip and trunk strength for cyclists: squats, hinges, single-leg work and anti-rotation core.",
  "Road, gravel and indoor riders who want more power on climbs and fewer niggles, training 2 times a week in a gym.",
  ["full-gym"],
  ["2 times a week in the off-season, once a week in season; not the day before hard rides.",
   "Leave 2-3 reps in reserve; add load when you hit the top of the rep range on all sets.", "Rest 2 minutes on squats and deadlifts, 60-90s on the rest.",
   "Keep it 48 hours away from your hardest bike session where possible."],
  [E("Warm-up: easy bike", 1, "5 min"), E("Goblet squat (warm-up sets)", 2, "8"), E("Back squat or goblet squat", 4, "6-8"),
   E("Romanian deadlift", 3, "8"), E("Bulgarian split squat", 3, "8/leg"), E("Step-up to bench", 3, "10/leg"),
   E("Single-leg calf raise", 3, "12/leg", group="A"), E("Pallof press", 3, "10/side", group="A"), E("Side plank", 3, "30s/side", group="B"),
   E("Dead bug", 3, "8/side", group="B")],
  ["x-end-bc-big-gear-low-cadence", "x-end-usms-dry-freestyle-strength-power", "stronglifts-5x5-workout-a"])

S("cyc-strength-home", "Somax Cyclist Home Strength", "fitness", "beginner", "cycling", ["strength", "general-fitness"], 25, 2,
  ["none (a step or stair)"],
  "A no-equipment circuit for riders: squats, split squats, single-leg bridges, step-ups and core holds.",
  "Beginner and busy riders who want to start strength work at home in under half an hour.",
  ["home", "minimal-equipment", "busy", "time-efficient", "travel"],
  ["2 times a week on easy-ride or rest days.", "3 rounds; rest 60s between rounds.",
   "Make it harder by slowing the lowering phase to 3 seconds or holding a backpack.", "Graduate to Somax Cyclist Gym Strength when 3 rounds feel easy."],
  [E("Bodyweight squat", 3, "15", group="A"), E("Split squat", 3, "10/leg", group="A"), E("Single-leg glute bridge", 3, "10/leg", group="A"),
   E("Step-up on a stair", 3, "12/leg", group="A"), E("Wall sit", 3, "30-45s", group="A"), E("Side plank", 3, "20-30s/side", group="A"),
   E("Bird dog", 3, "8/side", group="A")],
  ["nhs-home-strength-exercises", "x-end-usms-dry-band-home"])

S("cyc-mobility-15", "Somax Cyclist Mobility 15", "other", "beginner", "cycling", ["mobility"], 15, 3,
  ["mat"],
  "Fifteen minutes to undo hours in the saddle: hip flexors, glutes, hamstrings, upper back and chest.",
  "Any cyclist with tight hips, a stiff back or desk-and-bike posture.",
  ["home", "minimal-equipment", "time-efficient", "travel", "older-adults"],
  ["After rides or on rest days, 3+ times a week.", "Move slowly; stretch to mild tension, never pain.",
   "Breathe out as you ease into each position.", "Hold static stretches for the full time each side."],
  [E("Cat/cow", 1, "10"), E("Half-kneeling hip flexor stretch", 2, "45s/side"), E("Figure-4 glute stretch (lying)", 2, "45s/side"),
   E("Supine hamstring floss with strap or towel", 2, "10/side"), E("Open-book thoracic rotation", 2, "8/side"),
   E("Doorway chest stretch", 2, "30s"), E("Wall calf stretch", 2, "30s/side")],
  ["x-end-usms-dry-recovery-mobility", "nhs-flexibility-exercises"])

S("cyc-power-gym-advanced", "Somax Cyclist Power Gym", "fitness", "advanced", "cycling", ["strength", "sport-performance"], 60, 1,
  ["trap bar or barbell", "box", "squat rack", "dumbbells"],
  "Heavy, low-rep strength plus jumps to build the force behind sprints and steep climbs.",
  "Experienced lifters who race or sprint and already do regular gym strength work.",
  ["full-gym"],
  ["Once a week in the pre-season (twice in the off-season); at least 48h before key bike sessions.",
   "Lift heavy with perfect form: 1-2 reps in reserve, rest 2-3 minutes.", "Jumps are about height and speed - step down, don't rebound.",
   "Drop to 2 sets during race weeks."],
  [E("Warm-up: easy bike + leg swings", 1, "8 min"), E("Box jump (step down)", 4, "3"), E("Trap-bar deadlift", 4, "4"), E("Back squat", 4, "5"),
   E("Single-leg Romanian deadlift", 3, "6/leg"), E("Rear-foot-elevated split squat", 3, "6/leg"), E("Landmine rotation or cable chop", 3, "6/side")],
  ["x-end-bc-neuromuscular-intervals", "x-end-bc-big-gear-low-cadence", "wendler-bbb-day-4"])

# =========================================================================================
# SWIMMING (25m pool unless stated)
# =========================================================================================
LAP = "Somax Lap Builder"
LAP_WHO = "Adults who can swim at least a length but not yet 400m without stopping - the step after Somax Swim Confidence Builder."
LAP_HOW = ["2-3 swims a week; repeat a stage until it feels comfortable, then move on.",
           "Rest at the wall as long as you need - finishing every length matters more than speed.",
           "Breathe out steadily underwater; roll your head to breathe rather than lifting it.",
           "Once Stage 4 is easy, try the CSS Test or Somax CSS Starter 50s."]
S("swim-lap-builder-1", "Somax Lap Builder - Stage 1 (50s)", "swim", "beginner", "swimming", ["endurance", "general-fitness"], 25, 2,
  ["pool", "kickboard"], "Join two lengths together: eight 50m swims with rest, plus easy kick. 600m.", LAP_WHO,
  ["time-efficient", "busy"], LAP_HOW,
  [E("Easy swim, any stroke (rest 20s)", 4, "1", distance="25m"), E("Freestyle or choice (rest 30-40s)", 8, "1", distance="50m"),
   E("Kick with board (rest 20s)", 4, "1", distance="25m")],
  ["usms-quick-hit-swim", "x-end-serpentine-distance-builder"], LAP, 1, 4)
S("swim-lap-builder-2", "Somax Lap Builder - Stage 2 (75s)", "swim", "beginner", "swimming", ["endurance", "general-fitness"], 30, 2,
  ["pool", "kickboard", "pull buoy"], "Three-length swims and a 200m warm-up you can break if needed. 850m.", LAP_WHO,
  ["time-efficient", "busy"], LAP_HOW,
  [E("Easy swim, stop at walls if needed", 1, "1", distance="200m"), E("Freestyle or choice (rest 30s)", 6, "1", distance="75m"),
   E("Alternate kick with board / pull with buoy (rest 20s)", 4, "1", distance="50m")],
  ["x-end-serpentine-distance-builder", "x-end-usms-steady-cruise"], LAP, 2, 4)
S("swim-lap-builder-3", "Somax Lap Builder - Stage 3 (100s & 200)", "swim", "beginner", "swimming", ["endurance", "fat-loss"], 35, 2,
  ["pool"], "Four 100m swims, then your first non-stop 200m. 1,000m.", LAP_WHO, ["time-efficient"], LAP_HOW,
  [E("Easy swim", 1, "1", distance="200m"), E("Freestyle (rest 30s)", 4, "1", distance="100m"), E("Continuous freestyle, slow and relaxed", 1, "1", distance="200m"),
   E("Backstroke or choice, easy (rest 20s)", 4, "1", distance="25m"), E("Easy swim-down", 1, "1", distance="100m")],
  ["x-end-serpentine-distance-builder", "usms-beginner-breathe-swim"], LAP, 3, 4)
S("swim-lap-builder-4", "Somax Lap Builder - Stage 4 (400 Non-Stop)", "swim", "beginner", "swimming", ["endurance", "general-fitness"], 35, 2,
  ["pool"], "The milestone: 400m without stopping, at any pace, with drills and an easy finish. 1,000m.", LAP_WHO, ["time-efficient"], LAP_HOW,
  [E("Easy swim", 1, "1", distance="200m"), E("Continuous swim, slow and steady - 16 lengths", 1, "1", distance="400m"),
   E("Drill/swim by 25 - catch-up or kick on side (rest 20s)", 4, "1", distance="50m"), E("Easy swim-down", 1, "1", distance="200m")],
  ["x-end-serpentine-build-set", "x-end-serpentine-distance-builder"], LAP, 4, 4)

S("swim-breathing-rotation", "Somax Freestyle Breathing & Rotation", "swim", "beginner", "swimming", ["general-fitness", "endurance"], 30, 2,
  ["pool", "fins (optional)"],
  "Drills that fix the two big beginner problems - lifting the head to breathe and swimming flat - with swims between to lock it in. 900m.",
  "Beginner and returning swimmers who get breathless quickly or can only breathe to one side.",
  ["time-efficient"],
  ["1-2 times a week alongside your other swims.", "Short fins make the drills easier while you learn them.",
   "Keep one goggle in the water when you breathe - 'half a face'.", "Aim to breathe every 3 strokes on the swims; every 2 is fine if you need it."],
  [E("Easy swim (rest 20s)", 4, "1", distance="50m"), E("Kick on side, bottom arm extended - switch sides each length (rest 20s)", 4, "1", distance="25m"),
   E("Six-arm switch: 6 kicks on side, 1 stroke, roll to other side (rest 20s)", 4, "1", distance="25m"),
   E("Freestyle, breathe every 3 (rest 20s)", 4, "1", distance="50m"), E("Catch-up drill (rest 20s)", 4, "1", distance="25m"),
   E("Freestyle, smooth and long (rest 20s)", 2, "1", distance="100m"), E("Easy backstroke", 1, "1", distance="100m")],
  ["x-end-serpentine-big-step-pyramid", "usms-technique-tune-up-swim"])

S("swim-kick-body-position", "Somax Kick & Body Position", "swim", "beginner", "swimming", ["general-fitness", "endurance"], 30, 1,
  ["pool", "kickboard", "fins (optional)"],
  "Streamline push-offs, kick on front, side and back, and short swims to get your hips up and your kick from the hips. 800m.",
  "Swimmers whose legs sink, who kick from the knees, or who tire quickly from kicking.",
  ["time-efficient"],
  ["Once a week as a technique session.", "Kick from the hips with loose ankles; small, fast kicks beat big ones.",
   "Press your chest gently down to lift your hips.", "Fins are fine for the drills; take them off for the swims."],
  [E("Easy swim", 1, "1", distance="100m"), E("Streamline push-off and glide, then swim easy (rest 20s)", 4, "1", distance="25m"),
   E("Kick with board, hips high (rest 20s)", 4, "1", distance="50m"), E("Kick on back, arms by sides (rest 20s)", 4, "1", distance="25m"),
   E("Kick on side, bottom arm extended (rest 20s)", 4, "1", distance="25m"), E("Freestyle, focus on a quiet, steady kick (rest 20s)", 4, "1", distance="50m"),
   E("Easy swim-down", 1, "1", distance="100m")],
  ["x-end-usms-improve-your-stroke", "x-end-serpentine-big-step-pyramid"])

S("swim-breaststroke-technique", "Somax Breaststroke Technique", "swim", "beginner", "swimming", ["general-fitness", "endurance"], 30, 1,
  ["pool", "kickboard", "pull buoy"],
  "Timing drills for breaststroke - kick on your front and back, pull with a buoy, and 'pull, breathe, kick, glide' swims. 750m.",
  "Swimmers who rely on breaststroke and want it smoother and less tiring, or who want a second stroke.",
  ["time-efficient", "older-adults"],
  ["Once a week; skip the kick sets if you have knee pain.", "Glide for a count of 2 in streamline after each kick.",
   "Heels to bottom, feet turned out, then snap them together.", "Count strokes per length and try to lower it by 1-2."],
  [E("Easy swim, any stroke", 1, "1", distance="100m"), E("Breaststroke kick with board (rest 20s)", 4, "1", distance="25m"),
   E("Breaststroke kick on back, arms by sides (rest 20s)", 4, "1", distance="25m"), E("Breaststroke arms with pull buoy (rest 20s)", 4, "1", distance="25m"),
   E("2 kicks, 1 pull drill (rest 20s)", 4, "1", distance="25m"), E("Breaststroke, pull-breathe-kick-glide, count strokes (rest 20s)", 4, "1", distance="50m"),
   E("Easy freestyle or backstroke", 1, "1", distance="50m")],
  ["x-end-msq-39-aerobic-free", "x-end-usms-try-new-things"])

S("swim-catch-pull", "Somax Catch & Pull Technique", "swim", "intermediate", "swimming", ["sport-performance", "endurance"], 40, 1,
  ["pool", "pull buoy"],
  "Sculling, clenched-fist and chicken-wing drills plus stroke-count swims for a stronger catch and longer stroke. 1,500m.",
  "Regular lap swimmers who feel they 'slip' through the water or take lots of strokes per length.",
  ["time-efficient"],
  ["Once a week as your technique swim.", "Keep elbows high and fingertips pointing down early in the stroke.",
   "Count strokes on the swims; aim for 1-2 fewer per length without slowing.", "Use the drills in warm-ups for your other sessions."],
  [E("Easy swim", 1, "1", distance="300m"), E("Front scull, legs on buoy (rest 15s)", 4, "1", distance="25m"),
   E("Clenched-fist freestyle / normal by 25 (rest 15s)", 4, "1", distance="50m"), E("Chicken wing (thumb to armpit) / normal by 25 (rest 15s)", 4, "1", distance="50m"),
   E("Single-arm freestyle, alternate arms by 25 (rest 15s)", 4, "1", distance="50m"), E("Freestyle, count strokes, hold the count (rest 20s)", 4, "1", distance="100m"),
   E("Easy swim-down", 1, "1", distance="200m")],
  ["x-end-serpentine-big-step-pyramid", "x-end-usms-mile-stroke-efficiency", "usms-technique-tune-up-swim"])

S("swim-css-starter-50s", "Somax CSS Starter 50s", "swim", "beginner", "swimming", ["endurance", "sport-performance"], 35, 1,
  ["pool", "pace clock"],
  "Your first pace-based set: 12 x 50m just slower than CSS with short rest. Teaches even pacing on the clock. 1,100m.",
  "Newer swimmers who can swim 400m continuously and have just done a CSS test.",
  ["time-efficient"],
  ["Once a week.", "Target = CSS +3s per 100m (so CSS/2 + 1.5s per 50m); e.g. CSS 2:10/100m -> 1:06-1:07 per 50m.",
   "If you can't hold the time, add 5s rest rather than slowing down.", "When all 12 feel steady, move to Somax CSS 10 x 100."],
  [E("Easy swim", 1, "1", distance="300m"), E("Drill/swim by 25 (rest 15s)", 4, "1", distance="50m"),
   E("Freestyle at CSS +3s/100m (rest 20s)", 12, "1", "CSS +3s/100m", distance="50m"), E("Easy swim-down", 1, "1", distance="200m")],
  ["x-end-swimsmooth-css-test", "x-end-swimsmooth-goldilocks"])

S("swim-css-10x100", "Somax CSS 10 x 100", "swim", "intermediate", "swimming", ["endurance", "sport-performance"], 45, 1,
  ["pool", "pace clock"],
  "The bread-and-butter threshold set: 10 x 100m at CSS pace on 15 seconds rest. 1,800m.",
  "Swimmers and triathletes with a CSS time who want one key fitness set a week.",
  ["time-efficient"],
  ["Once a week; retest CSS every 4-6 weeks.", "Hold CSS pace exactly - the first rep should feel too easy.",
   "If you miss pace by more than 2s on two reps, take 10s extra rest.", "Progress: 12 x 100, then 8 x 150, then Goldilocks Papa Bear."],
  [E("Easy swim", 1, "1", distance="400m"), E("Drill/swim by 25 (rest 15s)", 4, "1", distance="50m"), E("Build 1-4 (rest 15s)", 4, "1", distance="25m"),
   E("Freestyle at CSS pace (rest 15s)", 10, "1", "CSS", distance="100m"), E("Easy kick with board", 1, "1", distance="100m"), E("Easy swim-down", 1, "1", distance="200m")],
  ["x-end-swimsmooth-goldilocks", "x-end-swimsmooth-css-test", "x-end-usms-masters-test-set"])

S("swim-css-300s", "Somax CSS Threshold 300s", "swim", "advanced", "swimming", ["endurance", "sport-performance"], 55, 1,
  ["pool", "pace clock", "pull buoy"],
  "Five 300s a touch slower than CSS on short rest - long threshold reps for distance swimmers and triathletes. 2,700m.",
  "Strong swimmers and triathletes comfortable with 2,500m+ who are building towards 1.5-3.8km events.",
  [],
  ["Once a week in a build phase.", "Target CSS +2s/100m; even splits from the first rep.",
   "Swim the 3rd rep with a pull buoy if your kick fades.", "Progress to 6 x 300, then 4 x 400 at CSS +2s."],
  [E("Easy swim", 1, "1", distance="400m"), E("Kick/drill/swim by 25 (rest 15s)", 4, "1", distance="75m"), E("Build to CSS pace (rest 15s)", 4, "1", distance="50m"),
   E("Freestyle at CSS +2s/100m (rest 20s)", 5, "1", "CSS +2s/100m", distance="300m"), E("Easy kick", 4, "1", distance="50m"), E("Easy swim-down", 1, "1", distance="200m")],
  ["x-end-swimsmooth-goldilocks", "x-end-msq-51-heart-rate-300s", "x-end-serpentine-5x400-broken"])

S("swim-css-speed-50s", "Somax Above-CSS Speed 50s", "swim", "advanced", "swimming", ["sport-performance"], 45, 1,
  ["pool", "pace clock", "fins (optional)"],
  "Twelve fast 50s a few seconds quicker than CSS with generous rest, then a steady 400 to finish. 2,100m.",
  "Advanced swimmers who need more top-end speed for race starts, surges and sprint triathlons.",
  ["time-efficient"],
  ["Once a week at most; keep it apart from your CSS 100s day.", "Target CSS -2 to -3s per 100m (a guide only - hold form first).",
   "Full 30s rest: these should be fast and smooth, not desperate.", "Stop the set if your stroke falls apart."],
  [E("Easy swim", 1, "1", distance="400m"), E("Drill/swim by 25 (rest 15s)", 4, "1", distance="50m"),
   E("Freestyle at CSS -2 to -3s/100m (rest 30s)", 12, "1", "CSS -2 to -3s/100m", distance="50m"), E("Easy swim", 1, "1", distance="100m"),
   E("Steady freestyle", 1, "1", "CSS +6s/100m", distance="400m"), E("Easy swim-down", 1, "1", distance="200m")],
  ["x-end-swimsmooth-css-test", "x-end-usms-2000-speed-development", "x-end-msq-55-ins-and-outs"])

S("swim-steady-400s", "Somax Steady 400s", "swim", "advanced", "swimming", ["endurance", "fat-loss"], 60, 1,
  ["pool", "pull buoy", "paddles (optional)"],
  "Four aerobic 400s at steady pace (CSS +6s/100m), alternating swim and pull - endurance without the threshold sting. 2,400m.",
  "Advanced swimmers and long-course triathletes building aerobic volume.",
  [],
  ["Once a week as your long aerobic swim.", "Steady = CSS +6s/100m: you could keep going much longer.",
   "Reps 2 and 4 with a pull buoy (paddles optional) to work the upper body.", "Add a fifth 400 when four feel easy."],
  [E("Easy swim", 1, "1", distance="300m"), E("Drill/swim by 25 (rest 15s)", 4, "1", distance="50m"),
   E("Freestyle swim (rest 30s)", 2, "1", "CSS +6s/100m", distance="400m", group="A"), E("Freestyle pull (rest 30s)", 2, "1", "CSS +6s/100m", distance="400m", group="A"),
   E("Easy swim-down", 1, "1", distance="300m")],
  ["x-end-swimsmooth-goldilocks", "x-end-serpentine-5x400-broken", "x-end-msq-56-fins-paddles-200s"])

S("swim-1500-builder", "Somax 1,500m Continuous Builder", "swim", "intermediate", "swimming", ["endurance", "fat-loss"], 45, 1,
  ["pool"],
  "Build to swimming 1.5km without stopping: three 500s with short rest that become one continuous swim. 2,000m.",
  "Swimmers who can do 1km continuously and are aiming for an Olympic-distance triathlon or a 1.5km ocean swim.",
  [],
  ["Once a week.", "Week 1-2: 3 x 500 with 30s rest. Week 3-4: 2 x 750. Week 5+: 1,500 straight.",
   "Steady pace (CSS +6-8s/100m); you should finish feeling you could do more.", "Count lengths with a lap counter or by 100s on the clock."],
  [E("Easy swim, mixed strokes", 1, "1", distance="300m"), E("Steady freestyle (rest 30s) - combine as you progress", 3, "1", "CSS +6-8s/100m", distance="500m"),
   E("Easy swim-down", 1, "1", distance="200m")],
  ["x-end-serpentine-build-set", "x-end-usms-2000-building-endurance"])

S("swim-lunchtime-20", "Somax Lunchtime Swim 20", "swim", "intermediate", "swimming", ["endurance", "fat-loss"], 20, 2,
  ["pool"],
  "In and out in 20 minutes: a short warm-up, 10 x 50m alternating easy and strong, and a quick swim-down. 900m.",
  "Busy swimmers with a short lunch break who still want a purposeful session.",
  ["busy", "time-efficient"],
  ["2-3 times a week.", "Odd 50s easy, even 50s strong (about CSS pace).", "Keep rest to 15 seconds; the whole session fits in 20 minutes.",
   "Add a 100m to the warm-up and two more 50s when you have 25 minutes."],
  [E("Easy swim", 1, "1", distance="200m"), E("Odds easy, evens strong (rest 15s)", 10, "1", "evens ~CSS", distance="50m"),
   E("Easy swim-down", 1, "1", distance="200m")],
  ["usms-quick-hit-swim", "x-end-usms-steady-cruise"])

S("swim-pull-strength", "Somax Pull & Paddles Strength", "swim", "intermediate", "swimming", ["strength", "endurance"], 45, 1,
  ["pool", "pull buoy", "paddles"],
  "Upper-body strength-endurance in the water: descending pull reps with and without paddles, then easy kick. 2,000m.",
  "Intermediate swimmers wanting a stronger pull, including triathletes who swim in wetsuits.",
  [],
  ["Once a week; build paddle use gradually to protect your shoulders.", "Use small paddles and stop if your shoulder hurts.",
   "Focus on a high elbow and pushing water back, not down.", "Swap paddles for fists-closed swimming if you have no paddles."],
  [E("Easy swim", 1, "1", distance="300m"), E("Pull, no paddles (rest 20s)", 4, "1", distance="100m"), E("Pull with paddles (rest 20s)", 4, "1", distance="100m"),
   E("Pull with paddles, strong (rest 15s)", 4, "1", distance="50m"), E("Swim, no equipment, feel the catch (rest 15s)", 4, "1", distance="50m"),
   E("Easy kick with board", 1, "1", distance="200m"), E("Easy swim-down", 1, "1", distance="200m")],
  ["x-end-msq-52-pull-im-paddles", "x-end-usms-abs-stay-tight"])

S("swim-open-water-skills-pool", "Somax Open-Water Skills in the Pool", "swim", "intermediate", "swimming", ["sport-performance", "endurance"], 45, 1,
  ["pool", "buddy (for drafting)"],
  "Practise sighting, deep-water starts, turning without a wall and swimming close to others - before you need them in open water. 1,600m.",
  "Pool swimmers preparing for a first triathlon, ocean swim or open-water event.",
  [],
  ["Once a week in the 6-8 weeks before an event.", "Sight by lifting just your eyes ('crocodile eyes') then rolling to breathe.",
   "Deep-water starts: begin from treading water mid-lane, not a push-off.", "Check your pool's rules before practising starts or drafting with others."],
  [E("Easy swim", 1, "1", distance="300m"), E("Sight every 6 strokes on a target at the end (rest 15s)", 6, "1", distance="50m"),
   E("Deep-water start: tread 10s then sprint 10 strokes, easy to the end (rest 20s)", 6, "1", distance="25m"),
   E("Swim without touching the walls - open turn mid-pool (rest 20s)", 4, "1", distance="100m"),
   E("Draft on a buddy's feet, swap leader each 100 (rest 20s)", 4, "1", distance="100m"), E("Easy swim-down", 1, "1", distance="200m")],
  ["x-end-usms-mile-race-simulator", "x-end-usa-swimming-ow-kase-ladder", "x-end-usms-ow-sprint-recovery"])

S("swim-first-open-water", "Somax First Open-Water Swim", "swim", "beginner", "swimming", ["general-fitness", "endurance"], 35, 1,
  ["patrolled beach or organised venue", "bright swim cap", "goggles", "wetsuit if water is cold", "swim buddy"],
  "A calm first session outside the pool: acclimatise, short swims parallel to shore and simple sighting, finishing with 10 minutes continuous.",
  "Swimmers who can swim 400m continuously in a pool and want to try the ocean, a lake or a harbour pool.",
  ["outdoor"],
  ["Only between the flags at a patrolled beach, or at an organised open-water session - never alone.",
   "Enter slowly; let your breathing settle before you swim (cold water shock passes in 1-2 minutes).",
   "Swim parallel to the shore in water you can stand in; stop and float on your back if you feel anxious.",
   "Get out if you feel cold, tired or conditions change. Check surf and water-quality reports first."],
  [E("Wade in and acclimatise - splash face, blow bubbles", 1, "3-5 min"), E("Swim parallel to shore, then stand or float", 5, "1 min swim / 1 min rest"),
   E("Sighting: lift eyes to a landmark every 6-8 strokes", 4, "1 min"), E("Continuous easy swim between two markers", 1, "10 min"),
   E("Easy float and wade out", 1, "2 min")],
  ["x-end-usa-swimming-ow-kase-ladder", "x-end-usms-ow-sprint-recovery"])

S("swim-open-water-race-prep", "Somax Open-Water Race Prep", "swim", "advanced", "swimming", ["sport-performance", "endurance"], 50, 1,
  ["supervised open-water venue", "wetsuit (if needed)", "bright swim cap", "waterproof watch"],
  "Race-pace blocks with sighting, fast starts and a steady finish in open water - for ocean swims and triathlons.",
  "Experienced open-water swimmers 2-6 weeks out from an ocean swim or triathlon.",
  ["outdoor"],
  ["Once a week at a supervised venue or with a squad.", "Race pace blocks: sight every 6 strokes; breathe both sides if you can.",
   "Fast starts mimic the first 200m of a race: hard for 20 strokes, then settle.", "Practise wetsuit-on swimming if you'll race in one."],
  [E("Easy swim", 1, "10 min"), E("Race pace with sighting every 6 strokes", 6, "3 min", "race effort", group="A"), E("Easy swim", 6, "1 min", group="A"),
   E("Fast start: 20 strokes hard, then settle to race pace", 4, "1 min", group="B"), E("Easy", 4, "1 min", group="B"),
   E("Steady swim, practise drafting if in a group", 1, "8 min"), E("Easy swim-down", 1, "3 min")],
  ["x-end-usa-swimming-ow-gemmell", "x-end-usms-ow-sprint-recovery", "x-end-usms-mile-race-simulator"])

S("swim-sprint-tri-prep", "Somax Sprint Triathlon Swim Prep", "swim", "intermediate", "swimming", ["sport-performance", "endurance"], 45, 1,
  ["pool", "pace clock"],
  "Race-specific pool work for a 750m triathlon swim: fast starts, sighting practice and race-pace 250s. 1,900m.",
  "Triathletes training for a sprint (750m) or super-sprint (400m) swim leg.",
  ["time-efficient"],
  ["Once a week in the 6-8 weeks before your race.", "Race pace is about CSS +2-3s/100m for a 750m.",
   "Lift your eyes to sight on the end wall every 6 strokes in the 250s.", "Super-sprint racers: do 3 x 150 instead of 3 x 250."],
  [E("Easy swim", 1, "1", distance="300m"), E("Drill/swim by 25 (rest 15s)", 4, "1", distance="50m"),
   E("Fast first 25, steady second 25 - race start (rest 20s)", 8, "1", distance="50m"),
   E("Race pace, sight every 6 strokes (rest 20s)", 3, "1", "CSS +2-3s/100m", distance="250m"), E("Easy kick", 1, "1", distance="100m"),
   E("Easy swim-down", 1, "1", distance="200m")],
  ["x-end-msq-37-triathlete", "x-end-swimsmooth-goldilocks", "x-end-usms-mile-race-simulator"])

S("swim-speed-turns", "Somax Speed 25s & Turns", "swim", "advanced", "swimming", ["sport-performance"], 45, 1,
  ["pool", "fins (optional)"],
  "Fast 25s, turn practice from mid-pool and build 50s - sharpening speed and walls. 2,000m.",
  "Advanced pool swimmers and masters competitors who want faster starts, turns and top speed.",
  ["time-efficient"],
  ["Once a week; keep the rest long so every rep is fast.", "Push off in a tight streamline with 3-5 dolphin or flutter kicks before breaking out.",
   "Turns: approach fast, tuck tight, push off on your side.", "Never do breath-holding challenges - breathe whenever you need to."],
  [E("Easy swim", 1, "1", distance="400m"), E("Kick/drill/swim by 25 (rest 15s)", 4, "1", distance="75m"),
   E("Fast from a push (rest 40s)", 8, "1", "max, good form", distance="25m"), E("From mid-pool: fast into the wall, turn, fast to mid-pool (rest 30s)", 8, "1", distance="25m"),
   E("Easy pull", 1, "1", distance="300m"), E("Build each 50 to fast (rest 20s)", 6, "1", distance="50m"), E("Easy swim-down", 1, "1", distance="200m")],
  ["x-end-msq-35-sprints", "x-end-msq-55-ins-and-outs", "x-end-usms-2000-speed-development"])

S("swim-easy-lengths-joints", "Somax Easy Lengths for Joints", "swim", "beginner", "swimming", ["general-fitness", "mobility"], 30, 2,
  ["pool (with a shallow end)", "kickboard"],
  "Water walking, mixed easy strokes and gentle kick with plenty of rest - a joint-friendly way to stay active. About 500m plus walking.",
  "Older adults, people with arthritis or back pain, and anyone easing back into exercise.",
  ["older-adults", "time-efficient"],
  ["2-3 times a week; warm water pools are ideal.", "Rest as long as you like between lengths; nothing should hurt.",
   "Any stroke counts - backstroke is often kindest on the neck.", "Finish with gentle stretches holding the pool edge."],
  [E("Water walking in the shallow end (forwards, sideways)", 4, "1", distance="width or 10m"), E("Easy swim, any stroke (rest 30-45s)", 8, "1", distance="25m"),
   E("Gentle kick with board (rest 30s)", 4, "1", distance="25m"), E("Easy backstroke or breaststroke (rest 30s)", 4, "1", distance="25m"),
   E("Poolside stretches - calves, hamstrings, shoulders", 1, "5 min")],
  ["x-end-usms-mixed-stroke-mini", "nhs-flexibility-exercises"])

S("swim-gym-strength", "Somax Swimmer's Gym Strength", "fitness", "intermediate", "swimming", ["strength", "sport-performance"], 50, 2,
  ["cable machine or band", "dumbbells", "pull-up bar or lat pulldown"],
  "Pulling strength, shoulder health and legs for push-offs: pull-ups, rows, external rotation, squats and core.",
  "Lap swimmers and triathletes who want a stronger pull and healthier shoulders from 2 gym sessions a week.",
  ["full-gym"],
  ["2 times a week, ideally after an easy swim or on a non-swim day.", "Leave 2-3 reps in reserve; prioritise form over load.",
   "Rest 90s on the big lifts, 45-60s on the shoulder and core work.", "Drop to 1 session a week in race weeks."],
  [E("Warm-up: band pull-aparts + arm circles", 2, "15"), E("Pull-up or lat pulldown", 4, "6-8"), E("Single-arm dumbbell row", 3, "10/side"),
   E("Goblet squat", 3, "10"), E("Romanian deadlift", 3, "8"), E("Cable or band external rotation", 3, "12/side", group="A"),
   E("Prone Y-T-W raises", 2, "8 each", group="A"), E("Pallof press", 3, "10/side", group="B"), E("Dead bug", 3, "8/side", group="B")],
  ["x-end-usms-dry-upper-body", "x-end-usms-dry-freestyle-strength-power", "x-end-usms-dry-band-home"])

S("swim-power-dryland-advanced", "Somax Swimmer's Power Dryland", "fitness", "advanced", "swimming", ["strength", "sport-performance"], 50, 1,
  ["pull-up bar", "medicine ball", "box", "dumbbells", "band"],
  "Explosive dryland for starts, turns and a powerful pull: weighted pull-ups, med-ball throws, jumps and rotational core.",
  "Advanced and masters competitive swimmers with a solid strength base.",
  ["full-gym"],
  ["Once a week in the build-up to competition, 48h before key swims.", "Move fast on throws and jumps; rest fully (90s) so every rep is quality.",
   "Weighted pull-ups only once you can do 10 strict bodyweight reps.", "Finish with band external rotations to look after your shoulders."],
  [E("Warm-up: band pull-aparts, streamline squats", 2, "10"), E("Box jump (streamline arms, step down)", 4, "3"), E("Medicine-ball slam", 4, "6"),
   E("Weighted pull-up", 4, "4-6"), E("Rear-foot-elevated split squat", 3, "6/leg"), E("Medicine-ball rotational throw to wall", 3, "6/side"),
   E("Band external rotation", 2, "15/side")],
  ["x-end-usms-dry-freestyle-strength-power", "x-end-usms-dry-band-home"])

# =========================================================================================
# HYBRID (HYROX-style, triathlon bricks)
# =========================================================================================
OPEN = "Open: "
S("hyb-station-technique", "Somax HYROX Station Technique", "fitness", "beginner", "hybrid", ["general-fitness", "strength", "endurance"], 50, 1,
  ["ski erg", "sled", "rower", "kettlebells", "sandbag", "wall ball"],
  "Learn all eight HYROX stations at light loads, with short reps and full rest, before you start training them hard.",
  "First-timers signing up for HYROX who have never pushed a sled or done wall balls.",
  ["full-gym"],
  ["Do this 2-4 times before any hard station work.", "Use 50-60% of race weight; this session is about technique and standards.",
   "Learn the official movement standards (wall ball depth and target, burpee broad jump rules) from hyrox.com.",
   "A gym sled feels different from race turf - expect race day to feel heavier."],
  [E("Warm-up: easy row + bodyweight squats", 1, "6 min"), E("SkiErg - long arms, hip hinge", 3, "1", "easy-moderate", distance="250m"),
   E("Sled push - low hips, short fast steps", 4, "1", "50-60% of " + OPEN + "152/102kg", distance="12.5m"),
   E("Sled pull - hand over hand, walk back", 4, "1", "50-60% of " + OPEN + "103/78kg", distance="12.5m"),
   E("Burpee broad jump - chest to floor, jump forward", 3, "5"), E("Row - legs, hips, arms", 3, "1", "easy-moderate", distance="250m"),
   E("Farmers carry", 3, "1", "2 x 16/12kg", distance="50m"), E("Sandbag lunge - back knee touches", 3, "1", "10/6kg", distance="10m"),
   E("Wall balls - full squat, hit the target", 3, "10", "6/4kg")],
  ["hyrox-race-simulation", "x-end-dearden-partner-bbj-carry", "x-end-dearden-row-wallball-amrap"])

S("hyb-station-strength", "Somax HYROX Station Strength", "fitness", "intermediate", "hybrid", ["strength", "sport-performance", "endurance"], 55, 1,
  ["sled", "kettlebells", "sandbag", "wall ball"],
  "Quality station work with full rest: sled pushes, farmers carries, sandbag lunges, wall balls and burpee broad jumps.",
  "Intermediate HYROX athletes who can do every station and want stronger, more efficient stations.",
  ["full-gym"],
  ["Once a week; 48h away from your hardest run.", "Build from 70% to race weight over 4-5 weeks; rest 90s-2 min between sets.",
   "Wall balls in sets you can finish unbroken; note how many you can do.", "Pair with Somax Compromised Run Primer later in the week."],
  [E("Warm-up: row + walking lunges + inchworms", 1, "8 min"), E("Sled push", 4, "1", OPEN + "152/102kg incl. sled", distance="50m"),
   E("Farmers carry", 3, "1", OPEN + "2 x 24/16kg", distance="100m"), E("Sandbag walking lunge", 3, "1", OPEN + "20/10kg", distance="30m"),
   E("Wall balls", 3, "30", OPEN + "6/4kg"), E("Burpee broad jump", 2, "1", distance="20m")],
  ["hyrox-race-simulation", "x-end-dearden-3x15-amrap", "x-end-dearden-partner-bbj-carry"])

S("hyb-compromised-run-primer", "Somax Compromised Run Primer", "fitness", "intermediate", "hybrid", ["endurance", "sport-performance", "fat-loss"], 50, 1,
  ["treadmill or running route", "wall ball", "sandbag", "rower"],
  "Six 500m runs straight off a station - wall balls, lunges or row - to teach your legs to run tired.",
  "HYROX athletes who can run 5km comfortably and have trained each station.",
  ["full-gym"],
  ["Once a week, 6-12 weeks out.", "Run at goal race pace - controlled, not a sprint; HR around 85-90% max is normal.",
   "1 minute rest after each round; progress to 1km runs (Somax Hybrid Race Prep).", "Station loads at race weight once you're comfortable."],
  [E("Warm-up: easy jog + drills", 1, "10 min"), E("Run", 6, "1", "goal race pace", distance="500m", group="A"),
   E("Station rotating: 20 wall balls / 20m sandbag lunges / 250m row", 6, "1", "race weight", group="A"), E("Rest", 6, "1 min", group="A"),
   E("Easy jog cool-down", 1, "5 min")],
  ["hyrox-race-simulation", "x-end-dearden-shuttle-10-rounds"])

S("hyb-run-erg-intervals", "Somax Run + Erg Intervals", "fitness", "intermediate", "hybrid", ["endurance", "sport-performance"], 55, 1,
  ["treadmill or track", "ski erg", "rower"],
  "Race-pace 1km runs followed by hard SkiErg and row 500s - the engine that powers a good HYROX time.",
  "HYROX athletes building aerobic capacity who can run 1km repeats at goal pace.",
  ["full-gym"],
  ["Once a week; keep other runs that week easy.", "1km runs at race pace (~80% effort, 85-90% HRmax), 90s rest.",
   "Erg 500s strong but not all-out; don't over-pull the row.", "Build from 3 to 5 x 1km over 6 weeks."],
  [E("Warm-up: easy jog + strides", 1, "10 min"), E("Run", 4, "1", "race pace, 85-90% HRmax", distance="1km", group="A"), E("Rest", 4, "90s", group="A"),
   E("SkiErg", 2, "1", "strong", distance="500m", group="B"), E("Row", 2, "1", "strong", distance="500m", group="B"), E("Rest", 4, "1 min", group="B"),
   E("Easy jog or row cool-down", 1, "5 min")],
  ["hyrox-race-simulation", "ntnu-4x4-intervals", "x-end-dearden-45-min-amrap"])

S("hyb-half-simulation", "Somax HYROX Half Simulation", "fitness", "intermediate", "hybrid", ["endurance", "sport-performance"], 60, 1,
  ["ski erg", "sled", "rower", "kettlebells", "sandbag", "wall ball"],
  "Four 1km runs, each followed by one station, at controlled race effort - choose the first or second half of the race.",
  "Intermediate HYROX athletes 4-8 weeks out who haven't yet done a full simulation.",
  ["full-gym"],
  ["Every 2-3 weeks, alternating first half and second half.", "Stations at 70-100% race weight depending on how far out you are.",
   "Practise transitions: walk briskly in, start the station straight away.", "Record split times and compare next time."],
  [E("Warm-up: easy jog + station prep", 1, "10 min"), E("Run", 4, "1", "race effort", distance="1km", group="A"),
   E("First half: SkiErg 1000m / sled push 50m / sled pull 50m / burpee broad jump 80m - or second half: row 1000m / farmers 200m / lunges 100m / wall balls 100",
     4, "1 station", "70-100% race weight", group="A"), E("Easy cool-down + stretch", 1, "8 min")],
  ["hyrox-race-simulation"])

S("hyb-wall-ball-lunge-endurance", "Somax Wall Ball & Lunge Endurance", "fitness", "intermediate", "hybrid", ["endurance", "strength", "sport-performance"], 40, 1,
  ["wall ball", "sandbag", "rower or bike"],
  "An EMOM and a 'chunked' finish for the two stations that wreck most race times: sandbag lunges and wall balls.",
  "HYROX athletes whose legs fade at the end of a race.",
  ["full-gym", "time-efficient"],
  ["Once a week, not before a hard run day.", "EMOM: finish the work with 20-30s to spare; scale reps if not.",
   "Finisher: break 50 wall balls into planned sets (e.g. 15-15-10-10) and stick to the plan.", "Use race weights once 2 EMOM rounds feel controlled."],
  [E("Warm-up: easy row + goblet squats", 1, "6 min"), E("EMOM odd minutes: wall balls", 10, "15", OPEN + "6/4kg", group="A"),
   E("EMOM even minutes: sandbag walking lunge", 10, "1", OPEN + "20/10kg", distance="10m", group="A"), E("Easy row or bike", 1, "3 min"),
   E("Wall balls for time in planned sets", 1, "50"), E("Cool-down stretch: quads, hips, calves", 1, "5 min")],
  ["hyrox-race-simulation", "x-end-dearden-row-wallball-amrap", "x-end-dearden-partner-bbj-carry"])

S("hyb-no-sled-gym", "Somax Hybrid at a Basic Gym (No Sled)", "fitness", "intermediate", "hybrid", ["endurance", "strength", "fat-loss"], 50, 1,
  ["treadmill", "dumbbells", "kettlebell", "rower or bike"],
  "HYROX-style rounds with smart swaps for gyms with no sled or SkiErg: motor-off treadmill pushes, heavy carries and dumbbell work.",
  "People training for hybrid races at a standard commercial gym.",
  ["full-gym"],
  ["Once a week alongside easy running.", "Motor-off treadmill push: hands on the rails, drive the belt with your legs (a common sled substitute).",
   "Rest 90s between rounds; keep runs at steady race pace.", "Do one real sled session every few weeks if you can access one."],
  [E("Warm-up: easy jog + mobility", 1, "8 min"), E("Run (treadmill)", 5, "1", "race pace", distance="800m", group="A"),
   E("Motor-off treadmill push", 5, "30s", "hard", group="A"), E("Heavy dumbbell farmers carry", 5, "1", "2 x 22.5/15kg", distance="50m", group="A"),
   E("Dumbbell thruster (wall-ball substitute)", 5, "15", "2 x 10/7.5kg", group="A"), E("Row or bike", 5, "1", "strong", distance="250m", group="A"),
   E("Cool-down stretch", 1, "5 min")],
  ["x-end-dearden-45-min-amrap", "hyrox-race-simulation", "x-end-dearden-shuttle-10-rounds"])

S("hyb-home-starter", "Somax Home Hybrid Starter", "fitness", "beginner", "hybrid", ["general-fitness", "fat-loss", "endurance"], 40, 2,
  ["running shoes", "backpack with books or water bottles"],
  "Run-and-station rounds you can do from your front door: short runs, backpack squats and lunges, step-back burpees and planks.",
  "Beginners curious about hybrid fitness who don't have gym access, or anyone training at home or travelling.",
  ["home", "minimal-equipment", "outdoor", "travel"],
  ["2 times a week; you should be able to jog 15-20 minutes first.", "Runs at a steady 6/10 effort; walk if you need to.",
   "Rest 1 minute between rounds; start with 3 rounds and build to 5.", "When 5 rounds feel easy, try Somax Hybrid Starter at the gym."],
  [E("Warm-up: brisk walk then easy jog", 1, "5 min"), E("Run", 5, "1", "steady 6/10", distance="400m", group="A"),
   E("Backpack squat", 5, "15", "5-8kg backpack", group="A"), E("Step-back burpee (no jump)", 5, "8", group="A"),
   E("Backpack reverse lunge", 5, "10/leg", group="A"), E("Plank", 5, "30s", group="A"), E("Walk + stretch", 1, "5 min")],
  ["x-end-dearden-shuttle-10-rounds", "nhs-home-strength-exercises"])

S("hyb-threshold-runs-wall-balls", "Somax Hybrid Threshold Runs + 100 Wall Balls", "fitness", "advanced", "hybrid", ["endurance", "sport-performance"], 70, 1,
  ["running route or treadmill", "wall ball"],
  "Five 2km runs a little faster than race pace, then 100 wall balls for time on tired legs.",
  "Advanced HYROX athletes chasing a faster finish time who run 25km+ a week.",
  ["full-gym"],
  ["Once a week in the build phase; keep the next day easy.", "2km reps at threshold (comfortably hard, just faster than HYROX race pace); 2 min jog/walk recovery.",
   "Go straight from the last run to the wall balls, as in the race.", "Log your wall-ball time and break pattern."],
  [E("Warm-up: easy jog + drills + strides", 1, "12 min"), E("Run", 5, "1", "threshold, slightly faster than race pace", distance="2km", group="A"),
   E("Jog/walk recovery", 4, "2 min", group="A"), E("Wall balls for time", 1, "100", OPEN + "6/4kg"), E("Easy jog cool-down", 1, "5 min")],
  ["x-end-dearden-3x15-amrap", "hyrox-race-simulation", "ntnu-4x4-intervals"])

S("hyb-race-week-opener", "Somax Hybrid Race-Week Opener", "fitness", "intermediate", "hybrid", ["sport-performance", "endurance"], 30, 1,
  ["running route or treadmill", "wall ball", "rower or ski erg"],
  "A short, sharp session 2-3 days before race day: a few race-pace runs and station touches to feel fresh, not tired.",
  "Anyone in the final week before a HYROX or hybrid race.",
  ["full-gym", "time-efficient"],
  ["Do it 2-3 days before the race; otherwise rest or easy movement.", "Race pace on the runs, but stop well short of fatigue.",
   "Rehearse your transitions and pacing plan.", "Eat, sleep and hydrate well all week (hyrox.com advice)."],
  [E("Easy jog", 1, "10 min"), E("Run", 4, "1", "race pace", distance="500m", group="A"), E("Wall balls", 4, "10", "race weight", group="A"),
   E("Easy walk", 4, "1 min", group="A"), E("Erg, relaxed", 1, "1", distance="500m"), E("Strides", 4, "15s")],
  ["hyrox-race-simulation", "x-end-dearden-row-wallball-amrap"])

S("hyb-strength-foundations", "Somax Hybrid Strength Foundations", "fitness", "beginner", "hybrid", ["strength", "general-fitness"], 50, 2,
  ["dumbbells", "kettlebell", "TRX or rings", "mat"],
  "Whole-body strength for hybrid racing: squats, hinges, lunges, push-ups, rows and loaded carries to build grip and trunk strength.",
  "Beginners who want to get strong enough to train HYROX stations safely.",
  ["full-gym"],
  ["2 times a week for 6-8 weeks before station-heavy training.", "Leave 2-3 reps in reserve; add load when all sets hit the top of the range.",
   "Rest 60-90s between sets.", "Then move to Somax HYROX Station Strength."],
  [E("Warm-up: row + bodyweight squats + inchworms", 1, "6 min"), E("Goblet squat", 3, "10-12"), E("Kettlebell deadlift", 3, "10"),
   E("Dumbbell walking lunge", 3, "10/leg"), E("Push-up (knees or incline OK)", 3, "8-12"), E("TRX or ring row", 3, "10"),
   E("Farmers carry", 4, "1", "moderate-heavy", distance="40m"), E("Plank", 3, "30-45s")],
  ["rfitness-basic-beginner-a", "x-end-dearden-zpress-row-emom", "hyrox-race-simulation"])

S("hyb-recovery-mobility", "Somax Hybrid Recovery Flow", "other", "beginner", "hybrid", ["mobility"], 20, 2,
  ["mat", "foam roller (optional)", "bike or rower (optional)"],
  "An easy spin and mobility flow for the day after racing or a hard hybrid session: hips, quads, calves and upper back.",
  "Hybrid and HYROX athletes of any level on recovery days.",
  ["home", "full-gym", "minimal-equipment", "time-efficient"],
  ["The day after a hard session or race.", "Keep the spin genuinely easy - just get the blood moving.",
   "Hold stretches to mild tension; breathe slowly.", "Add foam rolling on quads and calves if you have a roller."],
  [E("Easy bike or row", 1, "8 min", "very easy"), E("Couch stretch (quads/hip flexors)", 2, "45s/side"), E("World's greatest stretch", 2, "5/side"),
   E("90/90 hip switches", 2, "8/side"), E("Wall calf stretch", 2, "30s/side"), E("Open-book thoracic rotation", 2, "8/side"),
   E("Child's pose with side reach", 1, "60s")],
  ["x-end-usms-dry-recovery-mobility", "nhs-flexibility-exercises"])

# --- triathlon / multisport bricks
S("hyb-first-brick", "Somax First Brick (Bike to Run)", "fitness", "beginner", "hybrid", ["endurance", "sport-performance"], 50, 1,
  ["bike (trainer or outdoors)", "running shoes"],
  "A gentle bike-to-run: 30 easy minutes on the bike, a quick change, then 10-15 minutes of easy running so you learn how 'jelly legs' feel.",
  "Beginners training for a first sprint or super-sprint triathlon or duathlon who can ride 30 min and run 10 min continuously.",
  ["home", "outdoor"],
  ["Once every 1-2 weeks in the 6-8 weeks before your race.", "Both legs easy (Zone 2); walk breaks on the run are fine.",
   "Lay out your run kit before you start so the change takes under 3 minutes.", "Increase the run by 5 minutes every 2 weeks."],
  [E("Bike, easy", 1, "30 min", "Z2 / conversational"), E("Transition - shoes, helmet off", 1, "under 3 min"),
   E("Run, easy - walk breaks OK", 1, "10-15 min", "Z2"), E("Walk + stretch calves and quads", 1, "5 min")],
  ["x-end-cuk-steady-session", "nhs-couch-to-5k-week-5-run-3"])

S("hyb-race-pace-brick", "Somax Race-Pace Brick", "fitness", "intermediate", "hybrid", ["endurance", "sport-performance"], 75, 1,
  ["bike (trainer or outdoors)", "running shoes", "power meter or HR monitor (optional)"],
  "Three race-effort bike blocks, a fast transition, then a run that settles in before building to race pace.",
  "Sprint and Olympic-distance triathletes 4-10 weeks out.",
  ["home", "outdoor"],
  ["Every 1-2 weeks in the build phase.", "Bike blocks at race effort: ~88-95% FTP for sprint, 85-90% for Olympic.",
   "Run the first 10 minutes easy, then build to race pace; don't chase pace off the bike.", "Fuel and drink as you would on race day."],
  [E("Bike, easy building", 1, "15 min", "Z1-Z2"), E("Bike at race effort", 3, "8 min", "88-95% FTP", group="A"), E("Bike, easy", 3, "3 min", "Z1", group="A"),
   E("Bike, easy spin", 1, "3 min"), E("Transition", 1, "under 3 min"), E("Run, easy-steady", 1, "10 min", "Z2"),
   E("Run, build to race pace", 1, "10 min", "race pace"), E("Easy jog/walk", 1, "3 min")],
  ["x-end-cuk-harder-efforts-2x10", "x-end-bc-3x10-sweet-spot"])

S("hyb-brick-repeats", "Somax Brick Repeats", "fitness", "advanced", "hybrid", ["sport-performance", "endurance"], 80, 1,
  ["bike on trainer", "treadmill or run loop next to the bike", "power meter or HR monitor"],
  "Four rounds of 10 minutes hard on the bike straight into a 1.5km race-pace run - transitions and run legs, over and over.",
  "Advanced triathletes and duathletes sharpening for a race.",
  ["home", "outdoor"],
  ["Once every 2 weeks in the last 6 weeks before a race; not in race week.", "Bike at race effort (90-95% FTP); run at goal 5-10km race pace.",
   "Set up a mini transition area; time every change.", "2 minutes easy between rounds; stop if run form falls apart."],
  [E("Bike warm-up, building", 1, "15 min", "Z1-Z3"), E("Bike at race effort", 4, "10 min", "90-95% FTP", group="A"), E("Transition", 4, "fast", group="A"),
   E("Run at race pace", 4, "1", "goal race pace", distance="1.5km", group="A"), E("Easy walk/spin", 3, "2 min", group="A"), E("Easy spin cool-down", 1, "5 min")],
  ["x-end-bc-under-over", "x-end-bc-3x10-sweet-spot", "x-end-cuk-harder-efforts-2x10"])

S("hyb-gym-triathlon", "Somax Gym Triathlon", "fitness", "beginner", "hybrid", ["general-fitness", "endurance"], 50, 1,
  ["pool", "gym bike", "treadmill"],
  "Swim, bike and run in one gym visit: 400m in the pool, 20 minutes on the bike and 10 minutes on the treadmill.",
  "Beginners curious about triathlon, or anyone with a gym that has a pool who wants a fun, varied session.",
  ["full-gym"],
  ["Once every 1-2 weeks.", "All three legs at an easy-steady effort (Zone 2).",
   "Move between areas promptly but safely - dry off before the bike.", "Build to 750m / 30 min / 20 min over 6-8 weeks for a sprint-distance feel."],
  [E("Swim, any stroke, rest at walls if needed", 1, "1", "easy-steady", distance="400m"), E("Change", 1, "5 min"),
   E("Gym bike", 1, "20 min", "Z2, 85-95 rpm"), E("Treadmill run (walk breaks OK)", 1, "10 min", "Z2"), E("Walk + stretch", 1, "5 min")],
  ["x-end-serpentine-distance-builder", "x-end-cuk-steady-session", "nhs-couch-to-5k-week-5-run-3"])

S("hyb-sprint-tri-rehearsal", "Somax Sprint Triathlon Dress Rehearsal", "fitness", "advanced", "hybrid", ["sport-performance", "endurance"], 90, 1,
  ["pool or supervised open water", "bike", "running shoes", "race kit"],
  "A full sprint-distance rehearsal - 750m swim, 20km bike, 5km run - at controlled race effort, with real transitions.",
  "Advanced triathletes 2-4 weeks before a sprint race (or intermediates as a 'longer brick' at easier effort).",
  ["outdoor", "full-gym"],
  ["Once, 2-4 weeks before your race; then ease off.", "Swim at race pace (CSS +2-3s/100m); bike at 88-95% FTP; run at goal pace for the last 3km.",
   "Use exactly the kit, food and drink you'll race with.", "Open-water swims only at a supervised venue."],
  [E("Swim, race pace", 1, "1", "CSS +2-3s/100m", distance="750m"), E("Transition 1", 1, "fast"),
   E("Bike", 1, "1", "88-95% FTP", distance="20km"), E("Transition 2", 1, "fast"), E("Run - first km steady, then race pace", 1, "1", "race pace", distance="5km"),
   E("Easy walk + stretch", 1, "5 min")],
  ["x-end-usms-mile-race-simulator", "x-end-bc-3x10-sweet-spot", "hyrox-race-simulation"])

S("hyb-duathlon-run-bike-run", "Somax Duathlon Run-Bike-Run", "fitness", "intermediate", "hybrid", ["endurance", "sport-performance"], 70, 1,
  ["running shoes", "bike (trainer or outdoors)"],
  "Run, bike, run: a steady 2.5km, 30 minutes on the bike with three race-effort blocks, then a second 2.5km on tired legs.",
  "Duathletes and triathletes who want to practise both transitions.",
  ["outdoor", "home"],
  ["Every 2 weeks in the 8 weeks before a duathlon.", "Run 1 steady (Zone 3), not race pace; run 2 aim for the same pace.",
   "Bike blocks at 88-94% FTP; easy spin between.", "Keep transitions under 2 minutes each."],
  [E("Warm-up jog", 1, "5 min"), E("Run 1, steady", 1, "1", "Z3", distance="2.5km"), E("Transition", 1, "under 2 min"),
   E("Bike, easy", 1, "6 min", "Z2"), E("Bike at race effort", 3, "5 min", "88-94% FTP", group="A"), E("Bike, easy", 3, "3 min", "Z1", group="A"),
   E("Transition", 1, "under 2 min"), E("Run 2, steady to race pace", 1, "1", "Z3-Z4", distance="2.5km"), E("Easy walk", 1, "5 min")],
  ["x-end-cuk-harder-efforts-3x5", "x-end-bc-sweet-spot-intervals"])

json.dump(P, open(OUT, "w"), indent=1, ensure_ascii=False)
print(len(P), "Somax entries ->", OUT)
