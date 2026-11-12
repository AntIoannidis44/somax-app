"""Generate expansion/end-sourced.json: credited, publicly available cycling / swimming / hybrid sessions.

Every entry was read from its sourceUrl on 2026-11-13. Only facts are recorded (efforts, durations,
distances, cadence/zone targets, send-offs). Descriptions, whoItsFor and howToRun are Somax wording.
Run: python3 tools/gen_end_sourced.py expansion/end-sourced.json
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


def add(**kw):
    kw.setdefault("verified", True)
    kw.setdefault("duration", f"{kw['sessionMinutes']} min")
    P.append(kw)


# =========================================================================================
# CYCLING - British Cycling indoor trainer session PDFs
# =========================================================================================
BC = "https://www.britishcycling.org.uk/zuvvi/media/bc_files/sportivetrainingplans/"
BC_NOTE = ("Free British Cycling indoor trainer session PDF (training plan supporting documents). Only the "
           "time/cadence/zone structure is recorded; credit British Cycling and link out. HRZ/PZ = British "
           "Cycling heart-rate/power zones.")
BC_EQ = ["bike", "turbo trainer, rollers or static bike", "heart rate monitor or power meter"]
WU20 = E("British Cycling 20-min warm-up (cadence build + 3 x 6s rev-outs)", 1, "20 min")
CD10 = E("Cool-down, easy spin", 1, "10 min")


def bc(id, name, path, level, goals, mins, desc, who, how, ex, note_extra="", lifestyle=None, eq=None, days=1):
    add(id=id, name=name, series="British Cycling Indoor Sessions", category="ride", level=level, sport="cycling",
        goals=goals, sessionMinutes=mins, daysPerWeek=days, equipment=eq or BC_EQ, description=desc,
        whoItsFor=who, lifestyle=lifestyle or ["home"], howToRun=how, exercises=ex, credit="British Cycling",
        sourceUrl=BC + path, sourceNote=BC_NOTE + (" " + note_extra if note_extra else ""))


bc("x-end-bc-zone-build", "British Cycling Zone Build", "improver_plan/IMPROVERS_ZONE_BUILD.pdf", "beginner",
   ["endurance", "general-fitness"], 60,
   "A gentle hour that steps through heart-rate zones 1 to 3 so you learn what each zone feels like. Cadence stays at 90rpm or more throughout.",
   "Newer riders who have just done a threshold test and want to learn their zones on an indoor trainer or gym bike.",
   ["Use early in a plan or as a light session; 1-2 times a week.",
    "Build into each zone gradually: heart rate lags behind effort by a minute or so.",
    "Aim for the middle of each zone halfway through the block; push towards the top only if you feel good.",
    "Drop the gear right off in the zone 1 blocks so cadence stays high."],
   [E("Warm-up", 1, "10 min", "HRZ 1"), E("Steady", 1, "20 min", "HRZ 2, 90+ rpm"), E("Tempo", 1, "5 min", "HRZ 3, 90+ rpm"),
    E("Easy", 1, "5 min", "HRZ 1"), E("Steady", 1, "5 min", "HRZ 2, 90+ rpm"), E("Tempo", 1, "5 min", "HRZ 3, 90+ rpm"), CD10])

bc("x-end-bc-tempo-intervals", "British Cycling Tempo Intervals", "improver_plan/IMPROVERS_TEMPO_INTERVALS.pdf", "beginner",
   ["endurance", "general-fitness"], 64,
   "Three 10-minute tempo blocks in low-to-mid zone 3 with 5 minutes easy between: a first taste of interval training.",
   "Riders early in a structured plan, or anyone wanting a light but purposeful indoor hour.",
   ["Once or twice a week in the first weeks of a plan.",
    "Hold 90rpm+ and keep heart rate steady; don't stomp on the pedals as you tire.",
    "Spin a light gear in the 5-minute recoveries.",
    "When this feels comfortable, move on to the 3 x 10 sweet-spot session."],
   [E("British Cycling WU T1 warm-up (progressive)", 1, "14 min"),
    E("Tempo effort", 3, "10 min", "low-mid HRZ 3, 90+ rpm", group="A"), E("Easy spin", 2, "5 min", "light gear", group="A"), CD10],
   "WU T1 is British Cycling's 14-minute warm-up, linked from the PDF.")

bc("x-end-bc-sweet-spot-intervals", "British Cycling Sweet-Spot Intervals", "indoor_sessions/IZ_Rollers_Sessions_Sweet-Spot_Intervals.pdf",
   "beginner", ["endurance", "sport-performance"], 62,
   "25 minutes of sweet-spot work broken into manageable chunks: two 5-minute and five 3-minute efforts with 1 minute easy between.",
   "Less experienced riders who find a 2 x 20 too daunting but want to start building threshold power.",
   ["Use in the early off-season alongside base riding; once or twice a week.",
    "Start each effort at the low end of the zone (88-93% FTP, or high HRZ 3-low HRZ 4) and build through it.",
    "Progress by adding a minute to the first 3-minute effort, then the next, until you can do seven 5-minute blocks.",
    "Then graduate to the 3 x 10 and 2 x 20 sessions."],
   [WU20, E("Sweet-spot effort", 2, "5 min", "88-93% FTP / high HRZ 3-low HRZ 4, 90+ rpm"),
    E("Sweet-spot effort", 5, "3 min", "88-93% FTP, 90+ rpm"), E("Easy spin between every effort", 6, "1 min", "minimal resistance"), CD10])

bc("x-end-bc-spin-out", "British Cycling Spin Out", "2014/IZ_Rollers_Sessions_Spin_Out.pdf", "beginner",
   ["endurance", "sport-performance"], 42,
   "Low-gear leg-speed work: four efforts where you wind cadence up to near max and hold 130rpm+ for a minute. Freshens the legs without much fatigue.",
   "Any rider wanting some 'zip' in the legs, including during a taper or a recovery week.",
   ["Use any time of year, or 3-5 days before an event.",
    "Keep resistance and gearing low throughout; it's about leg speed, not force.",
    "If you start bouncing in the saddle, back the cadence off slightly to regain control.",
    "Skip the final 4-minute recovery and go straight into the cool-down."],
   [E("British Cycling WU T1 warm-up (progressive)", 1, "14 min"),
    E("Increase cadence to near max", 4, "30s", "low gear", group="A"), E("Hold cadence", 4, "1 min", "130+ rpm", group="A"),
    E("Recovery spin", 3, "4 min", group="A"), CD10])

bc("x-end-bc-leg-speed", "British Cycling Leg Speed", "2015/LEG_SPEED.pdf", "intermediate",
   ["endurance", "sport-performance"], 58,
   "A cadence ladder from 90rpm up to a maximal 15-second spin, then back down - done twice. Low resistance throughout.",
   "Riders who want smoother, faster pedalling, or a technical session that doubles as active recovery.",
   ["Any time you want to sharpen leg speed; also works as a recovery-day ride.",
    "Keep gearing low and focus only on the cadence targets.",
    "Run through the ladder twice; after the final effort skip the recovery and cool down.",
    "Stay relaxed in the upper body at the top cadences."],
   [WU20, E("Cadence", 2, "3 min", "90 rpm", group="A"), E("Cadence", 2, "2 min", "100 rpm", group="A"),
    E("Cadence", 2, "1 min", "110 rpm", group="A"), E("Cadence", 2, "30s", "115 rpm", group="A"), E("Cadence", 2, "15s", "120 rpm", group="A"),
    E("Maximal cadence", 2, "15s", "max", group="A"), E("Recovery", 2, "2 min", group="A"), E("Maximal cadence", 2, "15s", "max", group="A"),
    E("Cadence", 2, "15s", "120 rpm", group="A"), E("Cadence", 2, "30s", "115 rpm", group="A"), E("Cadence", 2, "1 min", "110 rpm", group="A"),
    E("Cadence", 2, "2 min", "100 rpm", group="A"), E("Recovery (skip after the 2nd round)", 1, "2 min"), CD10])

bc("x-end-bc-3x10-sweet-spot", "British Cycling 3 x 10 Minutes", "improver_plan/IMPROVERS_3X10_MINUTES.pdf", "intermediate",
   ["endurance", "sport-performance"], 80,
   "Three evenly paced 10-minute sweet-spot efforts with 10 minutes easy between: the stepping stone to the classic 2 x 20.",
   "Improving riders building their ability to ride at sweet spot and threshold.",
   ["1-2 times a week with easy days between.",
    "Sweet spot = high HRZ/PZ 3 to low 4; pace evenly and keep cadence 90rpm+.",
    "Hold a stable position without rocking; have a bottle handy.",
    "As you get stronger, ride the efforts mostly in zone 4, then move to 2 x 20."],
   [WU20, E("Sweet-spot effort", 3, "10 min", "HRZ/PZ high 3-low 4, 90+ rpm", group="A"),
    E("Active recovery", 2, "10 min", "easy spin", group="A"), CD10])

bc("x-end-bc-improvers-vo2", "British Cycling Improvers VO2 Intervals", "improver_plan/IMPROVERS_VO2_INTERVALS.pdf", "intermediate",
   ["endurance", "sport-performance"], 65,
   "Five 3-minute zone 5 efforts with 5 minutes easy spinning between: a first step into VO2max work.",
   "Riders who have already done tempo, sweet-spot and threshold sessions and want to lift their ceiling for steep climbs.",
   ["Once a week at most, with an easy day before and after.",
    "Build through zones 3 and 4 in the first minute, then edge into zone 5 and hold it.",
    "Keep a strong, even pedal stroke at 95rpm+.",
    "If you struggle on the 4th effort, go straight to the cool-down."],
   [WU20, E("VO2 effort", 5, "3 min", "HRZ/PZ 5, 95+ rpm", group="A"), E("Recovery spin", 4, "5 min", "very low resistance", group="A"), CD10])

bc("x-end-bc-big-gear-low-cadence", "British Cycling Big Gear / Low Cadence", "indoor_sessions/IZ_Rollers_Sessions_Big_Gear_Low_Cadence.pdf",
   "intermediate", ["strength", "endurance", "sport-performance"], 75,
   "An on-the-bike strength session: seated 5-minute efforts in a heavy gear at just 50-60rpm.",
   "Riders in the early off-season who want more pedalling force for climbing and accelerating.",
   ["Start with four 5-minute reps and build to six over a few weeks.",
    "Stay seated; pick a gear that just lets you hold 50-60rpm.",
    "Keep the pedal stroke smooth and the upper body relaxed - don't wrestle the bike.",
    "Skip this if you have knee pain; heavy low-cadence work loads the knees."],
   [WU20, E("Seated big-gear effort", 6, "5 min", "50-60 rpm, hard resistance", group="A"),
    E("Recovery spin", 5, "3 min", "light resistance", group="A"), CD10])

bc("x-end-bc-pyramid-intervals-1", "British Cycling Pyramid Intervals 1 (Threshold)", "2014/IZ_Rollers_Sessions_Pyramid_Intervals_1.pdf",
   "intermediate", ["endurance", "sport-performance"], 75,
   "Threshold efforts climbing from 1 to 5 minutes and back down again, with recoveries matching the effort length.",
   "Riders with accurate, recent zones who want to get better at finding and holding threshold, including time triallists.",
   ["Any time of year; once a week.",
    "Efforts in HRZ/PZ 4 at 95rpm+; spin in zone 1 for recoveries.",
    "Pace so there's no drop-off - the last effort should match the first.",
    "Time triallists: ride the efforts in race position."],
   [WU20] + [E("Threshold effort", 1, f"{m} min", "HRZ/PZ 4, 95+ rpm") if i % 2 == 0 else E("Active recovery", 1, f"{m} min", "HRZ/PZ 1")
             for i, m in enumerate([1, 1, 2, 2, 3, 3, 4, 4, 5, 4, 4, 3, 3, 2, 2, 1, 1])] + [CD10],
   "Recoveries on the way down mirror the way up (4, 3, 2, 1 min); this matches the PDF's 75-minute total.")

bc("x-end-bc-ramped-vo2", "British Cycling Ramped VO2 Intervals", "2014/IZ_Rollers_Sessions_Ramped_Intervals.pdf", "advanced",
   ["endurance", "sport-performance"], 75,
   "Five 5-minute zone 5 efforts, each finishing with a maximal last-minute surge, with 5 minutes recovery between.",
   "Well-rested, experienced riders in the late off-season or pre-season.",
   ["Once a week at most; this is a tough session, so come in fresh.",
    "Hold 95rpm+ in zone 5, then build cadence for a maximal final minute.",
    "With heart rate, build through zones 3-4 rather than forcing it up too fast.",
    "Recover at 90rpm with very low resistance."],
   [WU20, E("VO2 effort, max surge in last minute", 5, "5 min", "HRZ/PZ 5, 95+ rpm", group="A"),
    E("Active recovery", 4, "5 min", "90 rpm, very low resistance", group="A"), CD10])

bc("x-end-bc-under-over", "British Cycling Under/Over", "2014/IZ_Rollers_Sessions_Threshold_Under-Overs.pdf", "advanced",
   ["endurance", "sport-performance"], 85,
   "Four 10-minute blocks alternating 1 minute just under and 1 minute just over threshold.",
   "Riders in the late off-season or pre-season who already have plenty of threshold work behind them.",
   ["Once a week; test FTP/FTHR first so the zones are accurate.",
    "Under = 90% FTP/FTHR, over = 110%; keep cadence above 90rpm.",
    "The shift is subtle - often just one gear - so don't jump or slow abruptly.",
    "After the 4th block skip the recovery and cool down."],
   [WU20, E("Under", 4, "5 x 1 min", "90% FTP/FTHR, 90+ rpm", group="A"), E("Over (alternate with under)", 4, "5 x 1 min", "110% FTP/FTHR, 90+ rpm", group="A"),
    E("Active recovery", 3, "5 min", group="A"), CD10])

bc("x-end-bc-under-over-surges", "British Cycling Under/Over with Surges", "indoor_sessions/Under_-_over_with_surges.pdf", "advanced",
   ["endurance", "sport-performance"], 70,
   "Three 10-minute blocks of a repeating 2-minute cycle: 90s sweet spot, 20s zone 5, then a 10-second maximal sprint.",
   "Pre-season road and crit riders who need to recover while still working hard and kick when already on the limit.",
   ["Once a week in the pre-season.",
    "Under = mid Z3-mid Z4 sweet spot, over = zone 5, both at 90rpm; the sprint is maximal.",
    "Shift up a gear or two for the over but hold the cadence; keep the gear for the sprint and spin it out.",
    "Get straight back into sweet-spot rhythm after each sprint."],
   [WU20, E("Under (sweet spot)", 3, "5 x 90s", "HRZ/PZ 3.5, 90 rpm", group="A"), E("Over", 3, "5 x 20s", "HRZ/PZ 5, 90 rpm", group="A"),
    E("Maximal sprint", 3, "5 x 10s", "max", group="A"), E("Recovery between blocks", 2, "5 min"), CD10],
   "Each 10-minute block repeats the 90s/20s/10s cycle five times.")

bc("x-end-bc-neuromuscular-intervals", "British Cycling One-Minute Neuromuscular Intervals", "2014/IZ_Rollers_Sessions_Neuromuscular_Intervals.pdf",
   "advanced", ["sport-performance", "strength"], 59,
   "Maximal 1-minute efforts with long 3-minute recoveries to build top-end power.",
   "Racers towards the end of the off-season who want more raw power.",
   ["Once a week, well rested.",
    "Accelerate hard for the first 20 seconds at 95rpm+; expect to fade and don't pace it.",
    "Drop the gear and spin easy in the recoveries.",
    "Keep a strong, stable position throughout."],
   [WU20, E("Maximal effort", 8, "1 min", "max, 95+ rpm", group="A"), E("Easy spin", 7, "3 min", "low gear", group="A"), CD10],
   "The PDF shows two efforts repeated 'four times in total'; its 59-minute total confirms 8 efforts.")

bc("x-end-bc-20-40s", "British Cycling 20/40s", "2014/IZ_Rollers_Sessions_20-40s.pdf", "advanced",
   ["sport-performance", "endurance"], 65,
   "Sets of five 20-second hard efforts with 40 seconds easy, to train sprinting and recovering from repeated hard efforts.",
   "Crit, cyclo-cross and track riders in the final build-up to competition.",
   ["Once a week in the final build-up to racing.",
    "Efforts at 95rpm+ and 120%+ FTP (a sustained sprint with heart rate).",
    "Grip the bars firmly and brace your core; slow the cadence if you bounce.",
    "On the last set, skip the long recovery and cool down."],
   [WU20, E("Hard effort", 4, "5 x 20s", "120%+ FTP, 95+ rpm", group="A"), E("Easy spin between efforts", 4, "4 x 40s", group="A"),
    E("Recovery between sets", 3, "5 min 40s", group="A"), CD10],
   "The PDF says to repeat the set four times; its printed 55-minute total is shorter than four sets add up to, so three sets is a reasonable shorter option.")

bc("x-end-bc-russian-steps", "British Cycling Russian Steps", "indoor_sessions/IZ_Rollers_Sessions_Russian_Steps.pdf", "advanced",
   ["sport-performance", "endurance"], 63,
   "Maximal efforts that step up from 15 seconds to 1 minute and back down, with shrinking then growing recoveries - three times through.",
   "Experienced riders going into a race season who want sprint speed and tolerance to repeated hard efforts.",
   ["Once a week going into the season.",
    "All efforts maximal; choose a gear you won't spin out of, but not too heavy.",
    "Pace the 60-second effort slightly: start just below max and finish strong.",
    "After the final 15-second effort of set 3, go straight to the cool-down."],
   [WU20, E("Max 15s / recover 45s", 3, "1", group="A"), E("Max 30s / recover 30s", 3, "1", group="A"), E("Max 45s / recover 15s", 3, "1", group="A"),
    E("Max 1 min / recover 1 min", 3, "1", group="A"), E("Max 45s / recover 15s", 3, "1", group="A"), E("Max 30s / recover 30s", 3, "1", group="A"),
    E("Max 15s / recover 5 min 45s", 3, "1", group="A"), CD10])

bc("x-end-bc-pyramid-intervals-2", "British Cycling Pyramid Intervals 2 (Sprint)", "2014/IZ_Rollers_Sessions_Pyramid_Intervals_2.pdf",
   "advanced", ["sport-performance", "endurance"], 60,
   "All-out efforts from 10 to 50 seconds and back down, with equal recoveries, done three times.",
   "Racers heading into the season who need sprint speed, speed endurance and fast recovery.",
   ["Once a week going into the race season.",
    "100% efforts at 100rpm+; don't pace them.",
    "Try to match your numbers going up and coming down the pyramid.",
    "Bigger gear for strength, lighter gear for speed. Skip the last 3-minute recovery."],
   [WU20] + [E(f"Max effort / easy spin", 3, f"{s}s / {s}s", "100+ rpm", group="A") for s in [10, 20, 30, 40, 50, 40, 30, 20]] +
   [E("Max effort", 3, "10s", "100+ rpm", group="A"), E("Easy spin between sets", 2, "3 min"), CD10])

bc("x-end-bc-geared-sprint-pyramid", "British Cycling Geared Sprint Pyramid", "indoor_sessions/IZ_Rollers_Sessions_Geared_sprint_pyramid.pdf",
   "advanced", ["sport-performance", "strength"], 72,
   "30-second sprints that climb through the gears from 39x21 to 53x12, repeat the top gear, then work back down, with 3 minutes recovery each.",
   "Road and track racers who want top-end sprint power and leg speed going into the season. Suits rollers.",
   ["Once a week in the pre-season.",
    "Jump out of the saddle, get on top of the gear, then sit and hold the speed to 30 seconds.",
    "Gears are suggestions - adjust to your bike and ability.",
    "End a rep when you can't hold maximal cadence; quality over quantity."],
   [WU20] + [E(f"Sprint, gear {g}", 1, "30s", "max") for g in ["39x21", "39x18", "53x21", "53x18", "53x15", "53x12", "53x12 (repeat)", "53x15", "53x18", "53x21", "39x18", "39x21"]] +
   [E("Recovery between sprints", 11, "3 min"), CD10],
   "The PDF says to repeat the 53x12 sprint then work back down to 39x21; its printed 69-minute total is a few minutes shorter than this adds up to.")

bc("x-end-bc-intensity-slide", "British Cycling Intensity Slide", "indoor_sessions/IZ_Rollers_Sessions_Intensity_Slide.pdf", "advanced",
   ["sport-performance", "endurance"], 100,
   "A long session that slides from flat-out 15-second sprints to 1-minute zone 6 efforts to three 5-minute zone 4-5 efforts.",
   "Experienced riders in the late off-season or pre-season who want more intensity while keeping volume.",
   ["Once a week at most; schedule recovery after it.",
    "Sprints are flat out; adjust gear and cadence to the effort length (90rpm+ on the long ones).",
    "First time through, pace the 5-minute efforts conservatively and record your numbers to beat next time.",
    "Go straight to the cool-down after the 3rd 5-minute effort."],
   [WU20, E("Max sprint / recover", 8, "15s / 45s", "max", group="A"), E("Recovery", 1, "10 min"),
    E("Hard effort / recover", 6, "1 min / 2 min", "HRZ/PZ 6", group="B"), E("Recovery", 1, "10 min"),
    E("Sustained effort / recover", 3, "5 min / 6 min", "HRZ/PZ 4-5, 90+ rpm", group="C"), CD10])

# ---------------------------------------------------------------------------- Cycling UK
CUK = "https://www.cyclinguk.org/article/10-week-training-plan-100km-ride"
CUK_NOTE = ("Free article on cyclinguk.org (Copyright CTC). Session structure and effort cues only (easy = can chat; "
            "steady = short sentences; harder = out of breath); credit Cycling UK and link out.")
for id, name, mins, desc, ex, how in [
    ("x-end-cuk-steady-session", "Cycling UK Steady Session", 70,
     "Easy riding either side of a continuous steady block where you can only talk in short sentences.",
     [E("Easy warm-up", 1, "20 min", "conversational"), E("Steady effort", 1, "20-30 min", "short sentences only"), E("Easy cool-down", 1, "20 min")],
     ["Once a week, on a day after an easy ride or rest.", "Weeks 3-4 of the plan: 20 min steady; weeks 5-6: 25 min; weeks 7-9: 30 min.",
      "Stretch for 5-10 minutes afterwards.", "If you've been inactive, check with your doctor before starting."]),
    ("x-end-cuk-harder-efforts-3x5", "Cycling UK Intervals: 3 x 5 Minutes", 60,
     "An easy hour with three 5-minute harder efforts spaced evenly through the ride.",
     [E("Easy warm-up", 1, "5 min"), E("Harder effort (out of breath)", 3, "5 min", "harder", group="A"), E("Easy riding between efforts", 3, "about 10 min", "conversational", group="A"),
      E("Easy cool-down", 1, "5-10 min")],
     ["Once a week from week 5 of a beginner plan.", "Spread the efforts evenly through the ride.",
      "The next week, progress to 4 x 5 minutes.", "If you miss sessions through illness, resume where you left off rather than skipping ahead."]),
    ("x-end-cuk-harder-efforts-2x10", "Cycling UK Intervals: 2 x 10 Minutes", 60,
     "An easy hour with two 10-minute harder efforts, the last step in Cycling UK's 100km build.",
     [E("Easy warm-up", 1, "5 min"), E("Harder effort (out of breath)", 2, "10 min", "harder", group="A"), E("Easy riding between efforts", 2, "about 15 min", "conversational", group="A"),
      E("Easy cool-down", 1, "5-10 min")],
     ["Once a week in weeks 7-9 of the plan.", "Hold the effort evenly; you should be breathing hard but not sprinting.",
      "Keep the other rides that week easy.", "Stretch for 5-10 minutes afterwards."]),
]:
    add(id=id, name=name, series="Cycling UK 100km Plan", category="ride", level="beginner", sport="cycling",
        goals=["endurance", "general-fitness"], sessionMinutes=mins, daysPerWeek=1, equipment=["bike", "helmet"],
        description=desc, whoItsFor="Newer riders building towards a first 100km ride or sportive, riding outdoors 3-4 times a week.",
        lifestyle=["outdoor"], howToRun=how, exercises=ex, credit="Cycling UK", sourceUrl=CUK, sourceNote=CUK_NOTE)

# ---------------------------------------------------------------------------- CTS FTP tests
CTS = "https://trainright.com/?p=27294"
CTS_NOTE = ("Free article by Chris Carmichael (CTS) on trainright.com. Test protocol and FTP formula only; the source "
            "doesn't set a warm-up length, so the warm-up line is a Somax suggestion.")
for id, name, mins, desc, ex, level, eq in [
    ("x-end-cts-20-min-ftp-test", "CTS 20-Minute FTP Test", 50,
     "One all-out but evenly paced 20-minute time trial. FTP = 0.95 x average power.",
     [E("Warm-up (Somax suggestion: British Cycling 20-min warm-up)", 1, "15-20 min"), E("20-minute time trial", 1, "20 min", "highest power you can sustain"),
      E("Cool-down, easy spin", 1, "10 min")], "intermediate", ["bike", "smart trainer or power meter"]),
    ("x-end-cts-8-min-ftp-test", "CTS 2 x 8-Minute FTP Test", 50,
     "Two 8-minute time trials with 10 minutes easy between. FTP = 0.90 x the better effort's average power.",
     [E("Warm-up (Somax suggestion: British Cycling 20-min warm-up)", 1, "15-20 min"), E("8-minute time trial", 2, "8 min", "max sustainable", group="A"),
      E("Easy spin between efforts", 1, "10 min", group="A"), E("Cool-down, easy spin", 1, "10 min")], "intermediate", ["bike", "smart trainer or power meter"]),
    ("x-end-cts-ramp-ftp-test", "CTS Ramp FTP Test", 40,
     "Start at 100W and add 20W every minute until you can't continue. FTP = 0.75 x the last stage's power.",
     [E("Warm-up (Somax suggestion)", 1, "10-15 min", "easy"), E("Ramp stages (+20W each minute) to failure", 1, "until failure", "start 100W"),
      E("Cool-down, easy spin", 1, "10 min")], "intermediate", ["bike", "smart trainer or power meter"]),
]:
    add(id=id, name=name, series="CTS FTP Tests", category="ride", level=level, sport="cycling", goals=["sport-performance", "endurance"],
        sessionMinutes=mins, daysPerWeek=1, equipment=eq, description=desc,
        whoItsFor="Riders with a power meter or smart trainer who want an FTP to set training zones.",
        lifestyle=["home"], howToRun=[
            "Test rested, ideally after a recovery week; retest no sooner than about 6 weeks.",
            "Indoors, use slope/resistance mode, not ERG mode.",
            "Use the same test each time so results are comparable.",
            "Set zones from the result: Z2 56-75%, sweet spot 88-94%, threshold 91-105%, VO2 106-120% FTP."],
        exercises=ex, credit="Chris Carmichael (CTS)", sourceUrl=CTS, sourceNote=CTS_NOTE)

# =========================================================================================
# SWIMMING
# =========================================================================================
USMS_NOTE = "Free article on usms.org. Sets, distances and intervals only, in yards as published (swim the same numbers in metres in a 25m pool); credit USMS and the author."
SWIM_HOW_BEG = ["Swim 2-3 times a week.", "Rest the stated time; take more if your form falls apart.",
                "Progress by shortening rest or adding a repeat before adding new sets.",
                "Distances are in yards as published; in a 25m pool swim the same number of lengths."]
SWIM_HOW_INT = ["2-3 swims a week, with an easy or technique swim between harder ones.",
                "Hold the effort cues; if pace falls apart, take 5-10 seconds extra rest rather than swimming sloppy.",
                "Progress by trimming rest by 5 seconds or adding a repeat to the main set.",
                "Yards as published; in a 25m pool swim the same number of lengths."]


def usms(id, name, url, author, level, goals, mins, total, desc, ex, eq=None, who=None, how=None, series=None, lifestyle=None, note=None):
    add(id=id, name=name, series=series, category="swim", level=level, sport="swimming", goals=goals, sessionMinutes=mins, daysPerWeek=2,
        equipment=eq or ["pool"], description=desc + f" Total {total}.",
        whoItsFor=who or {"beginner": "Adults who can swim a few lengths and want structured, approachable pool sessions.",
                          "intermediate": "Regular lap swimmers comfortable with 1,500+ yards/metres who want variety and structure.",
                          "advanced": "Fit masters, triathletes and club swimmers who can handle 3,000+ yards/metres in a session."}[level],
        lifestyle=lifestyle or (["time-efficient"] if mins <= 45 else []), howToRun=how or (SWIM_HOW_BEG if level == "beginner" else SWIM_HOW_INT),
        exercises=ex, credit=f"{author} (U.S. Masters Swimming)", sourceUrl=url, sourceNote=note or USMS_NOTE)


U30 = "https://www.usms.org/fitness-and-training/articles-and-videos/articles/the-5-best-30-minute-swim-workouts"
usms("x-end-usms-variety-sprint", "USMS 30-min Swim - The Variety Sprint", U30, "Hilary Topper", "beginner", ["endurance", "general-fitness"], 30, "1,100 yards",
     "A quick session that mixes steady freestyle with short fast/easy 25s and a little kick with fins.",
     [E("Warm-up - choice, easy (rest 30s)", 1, "1", distance="150yd"), E("Kick with board and fins, moderate (rest 20s)", 1, "1", distance="50yd"),
      E("Drill - 25 drill of choice / 25 swim (rest 15s)", 3, "1", distance="50yd"), E("Freestyle - steady (rest 30s)", 1, "1", distance="200yd"),
      E("Freestyle - moderate (rest 15s)", 4, "1", distance="50yd"), E("Freestyle - 25 fast / 25 easy (rest 20s)", 4, "1", distance="50yd"),
      E("Cool-down - backstroke easy (rest 30s)", 1, "1", distance="100yd"), E("Cool-down - freestyle easy", 1, "1", distance="50yd")],
     eq=["pool", "kickboard", "fins"], series="USMS 5 Best 30-Minute Swims", lifestyle=["time-efficient", "busy"])
usms("x-end-usms-steady-cruise", "USMS 30-min Swim - The Steady Cruise", U30, "Hilary Topper", "beginner", ["endurance", "fat-loss"], 30, "1,100 yards",
     "Eight steady 75s on short rest after a catch-up drill set - a simple aerobic session.",
     [E("Warm-up - choice, easy, building (rest 30s)", 1, "1", distance="150yd"), E("Kick with board, moderate (rest 20s)", 1, "1", distance="50yd"),
      E("Drill - 25 catch-up / 25 freestyle (rest 15s)", 3, "1", distance="50yd"), E("Freestyle - steady/moderate (rest 15s)", 8, "1", distance="75yd"),
      E("Cool-down - backstroke easy (rest 30s)", 1, "1", distance="100yd"), E("Cool-down - freestyle easy, long strokes", 1, "1", distance="50yd")],
     eq=["pool", "kickboard"], series="USMS 5 Best 30-Minute Swims", lifestyle=["time-efficient", "busy"])
usms("x-end-usms-mixed-stroke-mini", "USMS 30-min Swim - The Mixed-Stroke Mini", U30, "Hilary Topper", "beginner", ["endurance", "general-fitness"], 30, "1,100 yards",
     "A short session that mixes backstroke, breaststroke and freestyle to spread the work across more muscles.",
     [E("Warm-up - choice, easy (rest 30s)", 1, "1", distance="100yd"), E("25 backstroke / 25 breaststroke (rest 20s)", 2, "1", distance="50yd"),
      E("Drill - 25 drill of choice / 25 swim (rest 15s)", 3, "1", distance="50yd"), E("25 backstroke / 25 freestyle (rest 15s)", 4, "1", distance="50yd"),
      E("Freestyle - steady (rest 20s)", 4, "1", distance="75yd"), E("Breaststroke - moderate (rest 15s)", 2, "1", distance="50yd"),
      E("Cool-down - backstroke easy (rest 30s)", 1, "1", distance="100yd"), E("Cool-down - freestyle easy", 1, "1", distance="50yd")],
     series="USMS 5 Best 30-Minute Swims", lifestyle=["time-efficient", "busy"])

UB = "https://usms.org/fitness-and-training/articles-and-videos/articles/best-swimming-workouts-for-beginners"
usms("x-end-usms-learn-your-intervals", "USMS Beginner Swim - Learn Your Intervals", UB, "Kris Goodrich", "beginner", ["endurance", "general-fitness"], 50, "1,800 yards",
     "Teaches you to swim on a pace clock: short warm-up repeats, then a long set of 50s on a 1:30 send-off.",
     [E("Choice (on :30)", 4, "1", distance="25yd"), E("Choice (on 1:00)", 2, "1", distance="50yd"),
      E("Choice, 15 or fewer strokes per 25 (on 2:00)", 1, "1", distance="100yd"), E("Choice (on 1:15)", 4, "1", distance="50yd"),
      E("Choice - hold best average time and stroke count (on 1:30)", 20, "1", distance="50yd"), E("Cool-down - choice", 1, "1", distance="300yd")],
     series="USMS Best Workouts for Beginners")
usms("x-end-usms-use-toys", "USMS Beginner Swim - Use Toys (Butterfly)", UB, "Kris Goodrich", "beginner", ["general-fitness", "endurance"], 45, "1,250 yards",
     "A gentle introduction to butterfly using fins: body-roll kicks on your side, front and back, then single-arm and 3-3-3 drills.",
     [E("Choice - free, kick, scull, free by 25 (on 2:00)", 4, "1", distance="100yd"),
      E("Kick - arms at sides, roll chest/belly/toes (on :30)", 4, "1", distance="25yd"), E("Kick - arms in streamline, same roll (on :30)", 4, "1", distance="25yd"),
      E("Choice (on 1:00)", 1, "1", distance="50yd"), E("Kick - 2 kicks each on side, belly, back, belly (on :45)", 4, "1", distance="25yd"),
      E("Single-arm butterfly, alternating arms (on :30)", 4, "1", distance="25yd"), E("Choice (on :45)", 2, "1", distance="25yd"),
      E("Drill - 3 right arm, 3 left arm, 3 full stroke (on :30)", 4, "1", distance="25yd"), E("Choice (on :45)", 2, "1", distance="25yd"),
      E("Cool-down - choice", 1, "1", distance="200yd")], eq=["pool", "long-blade fins"], series="USMS Best Workouts for Beginners")
usms("x-end-usms-improve-your-stroke", "USMS Beginner Swim - Improve Your Stroke (Backstroke)", UB, "Kris Goodrich", "beginner", ["general-fitness", "endurance"], 45, "1,600 yards",
     "Backstroke body-position kicks and arm drills, then backstroke 50s and two build-by-50 freestyle 200s.",
     [E("Freestyle (on 2:00)", 1, "1", distance="100yd"), E("Kick (on 1:00)", 2, "1", distance="50yd"), E("Pull (on 2:00)", 1, "1", distance="100yd"),
      E("Kick on back, arms at sides - body position (on :30)", 8, "1", distance="25yd"), E("Drill - backstroke kick, one arm forward one at side, switch (on :30)", 6, "1", distance="25yd"),
      E("Drill - lift and switch arms (on :30)", 4, "1", distance="25yd"), E("Backstroke (on 1:00)", 4, "1", distance="50yd"), E("Choice (on 1:00)", 1, "1", distance="50yd"),
      E("Freestyle - build each 50 (on 3:30)", 2, "1", distance="200yd"), E("Cool-down - odds easy free, evens easy back (on :30)", 8, "1", distance="25yd")],
     eq=["pool", "pull buoy"], series="USMS Best Workouts for Beginners")
usms("x-end-usms-try-new-things", "USMS Beginner Swim - Try New Things (IM)", UB, "Kris Goodrich", "beginner", ["general-fitness", "endurance"], 40, "1,250 yards",
     "An individual-medley session: kick, drill and swim 100 IMs, a reverse-order IM, then a 200 IM.",
     [E("Choice (on 3:30)", 2, "1", distance="200yd"), E("IM kick (on 2:00)", 1, "1", distance="100yd"), E("IM drill (on 2:00)", 1, "1", distance="100yd"),
      E("IM swim (on 2:00)", 1, "1", distance="100yd"), E("IM reverse order (on 2:00)", 1, "1", distance="100yd"), E("Choice (on :55)", 1, "1", distance="50yd"),
      E("IM swim (then :30 rest)", 1, "1", distance="200yd"), E("Cool-down - choice, distance per stroke (on 2:00)", 2, "1", distance="100yd")],
     series="USMS Best Workouts for Beginners")

U2K = "https://www.usms.org/fitness-and-training/articles-and-videos/articles/the-5-best-2000-yard-swim-workouts"
S2K = "USMS 5 Best 2,000-Yard Swims"
usms("x-end-usms-2000-staying-focused", "USMS 2,000yd - Staying Focused", U2K, "Hilary Topper", "intermediate", ["endurance", "sport-performance"], 50, "2,000 yards",
     "A busy, varied main set: descending 100s, kick, sprint 25s, a rotation-focused pull and descending 50s.",
     [E("Warm-up - choice (rest 30s)", 4, "1", distance="100yd"), E("25 drill / 25 swim (rest 15s)", 4, "1", distance="50yd"),
      E("Freestyle, descend 1-3 (rest 20s)", 3, "1", distance="100yd"), E("Kick with board and fins (rest 20s)", 4, "1", distance="50yd"),
      E("Freestyle sprint (on :30)", 4, "1", distance="25yd"), E("Pull with buoy (optional paddles), focus on rotation (rest 30s)", 1, "1", distance="200yd"),
      E("Freestyle, descend 1-4, #4 very hard (on 1:15)", 4, "1", distance="50yd"), E("Easy choice", 1, "1", distance="100yd"),
      E("Sprint, focus on push-offs and breakouts (on :30)", 4, "1", distance="25yd"), E("Cool-down - 25 free / 25 back or breast, very easy", 4, "1", distance="50yd")],
     eq=["pool", "kickboard", "fins", "pull buoy", "paddles (optional)"], series=S2K)
usms("x-end-usms-2000-building-endurance", "USMS 2,000yd - Building Endurance", U2K, "Hilary Topper", "intermediate", ["endurance", "fat-loss"], 50, "2,000 yards",
     "Steady aerobic 200s and descending 100s after a drill set - a solid endurance builder.",
     [E("Easy choice (rest 30s)", 1, "1", distance="100yd"), E("Kick (rest 30s)", 1, "1", distance="100yd"), E("Pull (rest 30s)", 1, "1", distance="100yd"),
      E("Single-arm freestyle, switch arms each wall (rest 20s)", 1, "1", distance="100yd"),
      E("25 drill / 25 swim - catch-up, fingertip drag, dog paddle, pull breathing every 3rd (rest 10s)", 4, "1", distance="50yd"),
      E("Freestyle - steady aerobic (rest 30s)", 3, "1", distance="200yd"), E("Freestyle - moderate, descend 1-3 and 4-6 (rest 15s)", 6, "1", distance="100yd"),
      E("Cool-down - backstroke easy", 1, "1", distance="100yd"), E("Cool-down - freestyle easy", 1, "1", distance="100yd")],
     eq=["pool", "kickboard", "pull buoy"], series=S2K)
usms("x-end-usms-2000-speed-development", "USMS 2,000yd - Speed Development", U2K, "Hilary Topper", "intermediate", ["sport-performance", "endurance"], 50, "2,000 yards",
     "Descending 100s, split-sprint 50s, strong/easy 75s and all-out 25s for speed.",
     [E("Easy choice", 1, "1", distance="200yd"), E("Kick", 1, "1", distance="100yd"), E("Pull", 1, "1", distance="100yd"),
      E("25 fingertip drag / 25 swim (rest 10s)", 2, "1", distance="50yd"), E("25 single-arm / 25 swim (rest 15s)", 2, "1", distance="50yd"),
      E("Fast with sound technique (rest 20s)", 2, "1", distance="25yd"), E("Freestyle - strong but sustainable, descend 1-4 (rest 15s)", 4, "1", distance="100yd"),
      E("Odds: sprint first 25; evens: sprint second 25 (rest 20s)", 5, "1", distance="50yd"), E("50 strong / 25 easy (rest 15s)", 4, "1", distance="75yd"),
      E("All-out from a push (rest 30s)", 6, "1", distance="25yd"), E("Cool-down - backstroke easy", 1, "1", distance="100yd"),
      E("Cool-down - freestyle easy", 1, "1", distance="100yd"), E("Cool-down - choice easy", 1, "1", distance="50yd")],
     eq=["pool", "kickboard", "pull buoy"], series=S2K)
usms("x-end-usms-2000-descending-pyramid", "USMS 2,000yd - The Descending Pyramid", U2K, "Hilary Topper", "intermediate", ["endurance", "general-fitness"], 50, "2,000 yards",
     "A 400-300-200-100-50 freestyle pyramid that gets stronger as it gets shorter.",
     [E("Easy choice", 1, "1", distance="300yd"), E("Kick with board and fins", 1, "1", distance="100yd"), E("Pull with buoy (optional paddles)", 1, "1", distance="100yd"),
      E("Single-arm freestyle, switch at walls", 1, "1", distance="100yd"), E("Freestyle - moderate (rest 30s)", 1, "1", distance="400yd"),
      E("Freestyle - moderate (rest 30s)", 1, "1", distance="300yd"), E("Freestyle - moderate (rest 30s)", 1, "1", distance="200yd"),
      E("Freestyle - moderate to strong (rest 30s)", 1, "1", distance="100yd"), E("Fast (rest 10s)", 1, "1", distance="50yd"), E("Easy choice (rest 10s)", 1, "1", distance="50yd"),
      E("Cool-down - easy, alternate back/breast/free", 1, "1", distance="300yd")], eq=["pool", "kickboard", "fins", "pull buoy"], series=S2K)
usms("x-end-usms-2000-hiit", "USMS 2,000yd - High-Intensity Intervals", U2K, "Hilary Topper", "intermediate", ["sport-performance", "fat-loss"], 50, "2,000 yards",
     "Strong repeatable 100s, very hard 75s, fast/easy/fast 75s and sprint 25s.",
     [E("Easy choice", 1, "1", distance="100yd"), E("Pull - steady, relaxed", 1, "1", distance="100yd"), E("Kick - moderate", 1, "1", distance="100yd"),
      E("25 fingertip drag / 25 swim (rest 10s)", 4, "1", distance="50yd"), E("25 single-arm / 25 swim (rest 15s)", 2, "1", distance="50yd"),
      E("Freestyle - strong, repeatable pace (rest 20s)", 5, "1", distance="100yd"), E("Freestyle - very hard but controlled (rest 25s)", 4, "1", distance="75yd"),
      E("25 fast / 25 easy / 25 fast (rest 20s)", 2, "1", distance="75yd"), E("Freestyle sprint (rest 30s)", 6, "1", distance="25yd"),
      E("Cool-down - backstroke easy", 1, "1", distance="100yd"), E("Cool-down - freestyle easy", 1, "1", distance="100yd"), E("Cool-down - choice easy", 1, "1", distance="100yd")],
     eq=["pool", "kickboard", "pull buoy"], series=S2K)

UMI = "https://www.usms.org/fitness-and-training/articles-and-videos/articles/the-5-best-1-mile-swim-workouts"
SMI = "USMS 5 Best 1-Mile Swims"
usms("x-end-usms-mile-negative-split", "USMS 1-Mile Swim - Negative-Split Challenge", UMI, "Hilary Topper", "intermediate", ["endurance", "sport-performance"], 45, "1,650 yards",
     "Every main-set repeat is negative split: controlled first half, faster second half. Effort 4-7 out of 10.",
     [E("Choice, easy, long strokes (rest 30s)", 1, "1", distance="200yd"), E("Kick with board, moderate (rest 20s)", 1, "1", distance="100yd"),
      E("25 catch-up / 25 freestyle (rest 15s)", 4, "1", distance="50yd"), E("Freestyle, negative split (rest 30s)", 2, "1", distance="200yd"),
      E("Freestyle, negative split (rest 20s)", 4, "1", distance="100yd"), E("Freestyle, negative split (rest 15s)", 4, "1", distance="50yd"),
      E("Cool-down - backstroke easy (rest 20s)", 1, "1", distance="50yd"), E("Cool-down - freestyle easy", 1, "1", distance="100yd")],
     eq=["pool", "kickboard", "pace clock"], series=SMI)
usms("x-end-usms-mile-ladder-climber", "USMS 1-Mile Swim - The Ladder Climber", UMI, "Hilary Topper", "intermediate", ["endurance", "general-fitness"], 45, "1,650 yards",
     "A 100-200-300-200-100 ladder that builds from steady to fast but controlled. Compare pace per 100 across lengths.",
     [E("Choice, easy (rest 30s)", 1, "1", distance="150yd"), E("Pull, steady (rest 20s)", 1, "1", distance="100yd"), E("Kick, moderate (rest 20s)", 1, "1", distance="100yd"),
      E("25 fingertip drag / 25 freestyle (rest 15s)", 3, "1", distance="50yd"), E("Freestyle, steady aerobic (rest 15s)", 1, "1", distance="100yd"),
      E("Freestyle, steady aerobic (rest 20s)", 1, "1", distance="200yd"), E("Freestyle, build steady to strong (rest 25s)", 1, "1", distance="300yd"),
      E("Freestyle, strong (rest 20s)", 1, "1", distance="200yd"), E("Freestyle, fast but controlled (rest 15s)", 1, "1", distance="100yd"),
      E("Choice, easy (rest 30s)", 1, "1", distance="100yd"), E("Cool-down - backstroke easy (rest 20s)", 1, "1", distance="50yd"), E("Cool-down - freestyle easy", 1, "1", distance="100yd")],
     eq=["pool", "pull buoy", "kickboard"], series=SMI)
usms("x-end-usms-mile-stroke-efficiency", "USMS 1-Mile Swim - Stroke Efficiency", UMI, "Hilary Topper", "intermediate", ["endurance", "general-fitness"], 45, "1,650 yards",
     "Stroke-count work: lowest sustainable count on 100s, then add a stroke per length while swimming faster. Effort 3-6 out of 10.",
     [E("Choice, easy, count strokes (rest 30s)", 1, "1", distance="100yd"), E("Kick with board, moderate (rest 20s)", 1, "1", distance="100yd"),
      E("Pull with buoy, relaxed (rest 20s)", 1, "1", distance="100yd"), E("25 single-arm / 25 swim (rest 15s)", 4, "1", distance="50yd"),
      E("25 dog paddle / 25 freestyle (rest 15s)", 1, "1", distance="50yd"), E("Freestyle, lowest sustainable stroke count (rest 20s)", 4, "1", distance="100yd"),
      E("Freestyle, ~1 more stroke per length, faster (rest 15s)", 4, "1", distance="75yd"), E("Freestyle, low natural stroke count (rest 15s)", 4, "1", distance="50yd"),
      E("Choice, easy, no counting (rest 30s)", 1, "1", distance="100yd"), E("Cool-down - choice easy", 1, "1", distance="100yd")],
     eq=["pool", "kickboard", "pull buoy"], series=SMI)
usms("x-end-usms-mile-tempo-builder", "USMS 1-Mile Swim - The Tempo Builder", UMI, "Hilary Topper", "intermediate", ["endurance", "sport-performance"], 45, "1,650 yards",
     "Strong, sustainable 100s and 75s on short rest, aiming for a narrow range of splits. Effort 6-7 out of 10.",
     [E("Choice, easy (rest 30s)", 1, "1", distance="150yd"), E("Kick with board, moderate (rest 20s)", 1, "1", distance="50yd"),
      E("Pull with buoy, steady (rest 20s)", 1, "1", distance="50yd"), E("25 catch-up / 25 freestyle (rest 15s)", 4, "1", distance="50yd"),
      E("Kick with board and fins (rest 30s)", 1, "1", distance="50yd"), E("Freestyle, strong sustainable tempo, even splits (rest 15s)", 6, "1", distance="100yd"),
      E("Freestyle, same effort (rest 10s)", 4, "1", distance="75yd"), E("Choice, easy (rest 30s)", 1, "1", distance="100yd"),
      E("Cool-down - backstroke easy (rest 20s)", 1, "1", distance="50yd"), E("Cool-down - freestyle easy", 1, "1", distance="100yd")],
     eq=["pool", "kickboard", "fins", "pull buoy"], series=SMI)
usms("x-end-usms-mile-race-simulator", "USMS 1-Mile Swim - The Race Simulator", UMI, "Hilary Topper", "intermediate", ["sport-performance", "endurance"], 45, "1,650 yards",
     "A race rehearsal: a strong 'start' 100, then 600 at planned race effort with sighting, flowing straight into a 200 that builds to a hard finish.",
     [E("Choice, easy with relaxed builds (rest 30s)", 1, "1", distance="200yd"), E("Pull, steady, bilateral breathing if comfortable (rest 20s)", 1, "1", distance="100yd"),
      E("Kick with board, moderate (rest 20s)", 1, "1", distance="50yd"), E("25 single-arm / 25 swim (rest 15s)", 4, "1", distance="50yd"),
      E("Freestyle, strong but controlled race start (rest 20s)", 1, "1", distance="100yd"), E("Freestyle at race effort, practise sighting (no rest)", 1, "1", distance="600yd"),
      E("Freestyle, build to a hard finish (rest 30s)", 1, "1", distance="200yd"), E("Choice, easy (rest 30s)", 1, "1", distance="100yd"),
      E("Cool-down - choice easy", 1, "1", distance="100yd")], eq=["pool", "pull buoy", "kickboard"], series=SMI,
     who="Experienced swimmers preparing for a mile-ish pool or open-water event.")

UMS = "https://www.usms.org/en/fitness-and-training/articles-and-videos/articles/best-workouts-for-masters-swimmers"
SMS = "USMS Best Workouts for Masters Swimmers"
usms("x-end-usms-masters-pace", "USMS Masters - Pace Workout", UMS, "Kris Goodrich", "advanced", ["sport-performance", "endurance"], 70, "3,300 yards",
     "Hold your 500 race pace on 100s, then prove it on a broken-down 500, 400 and 300.",
     [E("Choice (rest 15s)", 1, "1", distance="400yd"), E("25 kick / 25 drill / 25 build (rest 15s)", 4, "1", distance="75yd"),
      E("Choice at 500 pace (rest 10s)", 5, "1", distance="100yd"), E("Choice, hold the 100 pace (on 10:00)", 1, "1", distance="500yd"),
      E("Choice at 500 pace (rest 15s)", 4, "1", distance="100yd"), E("Choice, strong (on 8:00)", 1, "1", distance="400yd"),
      E("Choice at 500 pace (rest 20s)", 3, "1", distance="100yd"), E("Choice, best effort (on 6:00)", 1, "1", distance="300yd"),
      E("Cool-down - choice (on 3:00)", 1, "1", distance="200yd")], series=SMS)
usms("x-end-usms-masters-usrpt", "USMS Masters - Ultra-Short Race-Pace Training", UMS, "Kris Goodrich", "advanced", ["sport-performance"], 70, "3,300 yards",
     "USRPT: 20 x 50 at 200 race pace with short rest. Miss your target and you sit one out; miss two in a row and the set ends.",
     [E("Choice (rest 15s)", 1, "1", distance="400yd"), E("Choice with fins - distance per stroke, breathing patterns, dolphin kicks off walls (on 3:30)", 3, "1", distance="200yd"),
      E("Choice, build (on 1:00)", 4, "1", distance="50yd"), E("Choice at 200 race pace (send-off = goal 50 time + 20s)", 20, "1", distance="50yd"),
      E("Choice, then 2:00 rest", 1, "1", distance="300yd"), E("Alternate 2 stroke / 2 free at 100 race pace (send-off = goal 25 time + 20s)", 20, "1", distance="25yd"),
      E("Cool-down - choice", 1, "1", distance="300yd")], eq=["pool", "fins"], series=SMS)
usms("x-end-usms-masters-test-set", "USMS Masters - Test Set", UMS, "Kris Goodrich", "advanced", ["sport-performance", "endurance"], 65, "3,000 yards",
     "IM-rotation 150s, then 10 x 100 freestyle holding your best average - a benchmark you can repeat every few weeks.",
     [E("Choice (rest 20s)", 1, "1", distance="400yd"), E("IM - 25 drill / 25 build (rest 20s)", 1, "1", distance="400yd"),
      E("Choice, IM rotation - 50 of each stroke (on 3:15)", 6, "1", distance="150yd"), E("Freestyle, hold best average (on 2:00 / 15-20s rest)", 10, "1", distance="100yd"),
      E("Cool-down - descending 50s (rest 10s)", 1, "1", distance="300yd"), E("Choice, descending (rest 10s)", 6, "1", distance="50yd")], series=SMS)
usms("x-end-usms-masters-recovery", "USMS Masters - Recovery Workout", UMS, "Kris Goodrich", "intermediate", ["endurance", "mobility"], 65, "3,100 yards",
     "An easy-effort day built on kick, drill and choice swimming, with a 25/50/75/100 free-and-stroke 500 in each round.",
     [E("Choice (rest 15s)", 1, "1", distance="400yd"), E("50 kick / 50 drill (rest 15s)", 4, "1", distance="100yd"), E("IM reverse order (rest 30s)", 1, "1", distance="100yd"),
      E("Kick (on :40)", 4, "2", distance="25yd", group="A"), E("Drill (on 1:00)", 4, "2", distance="50yd", group="A"), E("Choice (on 2:30), then 2:00 rest", 4, "2", distance="100yd", group="A"),
      E("Free/stroke by 25/25, 50/50, 75/75, 100/100 (then :30 rest)", 4, "1", distance="500yd", group="A"), E("Cool-down - choice (on 5:00)", 1, "1", distance="300yd")],
     series=SMS)

UWL = "https://lanemate.usms.org/fitness-and-training/articles-and-videos/articles/best-swimming-workouts-for-weight-loss"
SWL = "USMS Best Swimming Workouts for Weight Loss"
usms("x-end-usms-wl-moderate", "USMS Fat-Burn Swim - Moderate Intensity", UWL, "Kris Goodrich", "advanced", ["fat-loss", "endurance"], 80, "3,800 yards",
     "Three rounds of steady 200s, 100s on a fixed send-off, IM kick and a stroke-mixed pull 300.",
     [E("Warm-up - free, pull, kick (rest :05 each)", 1, "1", distance="600yd"), E("Warm-up - free, pull, kick 100 each (rest :05)", 1, "1", distance="300yd"),
      E("Freestyle, steady (rest :10)", 3, "2", distance="200yd", group="A"), E("Freestyle, one send-off for all rounds (on 1:45)", 3, "3", distance="100yd", group="A"),
      E("Kick, IM order, fins or board (rest :10)", 3, "4", distance="75yd", group="A"), E("Pull, every 3rd length back or breast", 3, "1", distance="300yd", group="A"),
      E("Cool-down - choice", 1, "1", distance="200yd")], eq=["pool", "pull buoy", "kickboard", "fins"], series=SWL)
usms("x-end-usms-wl-high-intensity", "USMS Fat-Burn Swim - High Intensity", UWL, "Kris Goodrich", "intermediate", ["fat-loss", "sport-performance"], 55, "2,500 yards",
     "A descending fast set (125, 100, 75, 50, 25) with easy 25s between, done twice.",
     [E("Freestyle (on 8:00)", 1, "1", distance="400yd"), E("IM drill/swim, build by 25 (on 4:00)", 1, "1", distance="200yd"),
      E("Kick with short fins (on 4:30)", 2, "1", distance="250yd"), E("Easy (on :50)", 2, "2", distance="25yd", group="A"),
      E("Fast (on 2:05)", 2, "1", distance="125yd", group="A"), E("Easy (on :50)", 2, "1", distance="25yd", group="A"), E("Fast (on 1:40)", 2, "1", distance="100yd", group="A"),
      E("Easy (on :50)", 2, "1", distance="25yd", group="A"), E("Fast (on 1:20)", 2, "1", distance="75yd", group="A"), E("Easy (on :50)", 2, "1", distance="25yd", group="A"),
      E("Fast (on :55)", 2, "1", distance="50yd", group="A"), E("Easy (on :50)", 2, "1", distance="25yd", group="A"), E("Fast (on :35)", 2, "1", distance="25yd", group="A"),
      E("Recovery (on 2:15)", 2, "1", distance="100yd", group="A"), E("Cool-down - freestyle, breathe every 3 or 5 (on 1:00)", 4, "1", distance="50yd")],
     eq=["pool", "short fins"], series=SWL)
usms("x-end-usms-wl-best-of-both", "USMS Fat-Burn Swim - Best of Both Worlds", UWL, "Kris Goodrich", "advanced", ["fat-loss", "endurance"], 85, "4,100 yards",
     "Odds fast, evens smooth through 25s, 50s and 100s, then three negative-split 200s.",
     [E("Choice - 75 free / 25 stroke (on 9:00)", 2, "1", distance="500yd"), E("IM drill (on 1:50)", 2, "1", distance="100yd"),
      E("Kick with short fins (on 1:05)", 4, "1", distance="50yd"), E("Choice, odds fast / evens smooth (on :30)", 12, "1", distance="25yd"),
      E("Choice, odds fast / evens smooth (on :55)", 12, "1", distance="50yd"), E("Choice, odds fast / evens smooth (on 1:35)", 6, "1", distance="100yd"),
      E("Choice, build by 50, negative split (on 3:10)", 3, "1", distance="200yd"), E("Cool-down - freestyle, breathe every 3 or 5 (on 1:00)", 4, "1", distance="50yd")],
     eq=["pool", "short fins"], series=SWL)
usms("x-end-usms-wl-mix-it-up", "USMS Fat-Burn Swim - Mix It Up", UWL, "Kris Goodrich", "intermediate", ["fat-loss", "general-fitness"], 60, "2,800 yards",
     "Each stroke as 50 kick, 50 sprint, 50 drill, twice through, plus sprint 25s and recovery.",
     [E("Free / pull / kick / choice", 1, "1", distance="700yd"), E("Freestyle, build slow to fast (rest :15)", 4, "1", distance="25yd"),
      E("Butterfly - 50 dolphin kick / 50 sprint / 50 drill (rest :15)", 2, "1", distance="150yd", group="A"),
      E("Backstroke - 50 kick / 50 sprint / 50 drill (rest :15)", 2, "1", distance="150yd", group="A"),
      E("Breaststroke - 50 kick / 50 sprint / 50 drill (rest :15)", 2, "1", distance="150yd", group="A"),
      E("Freestyle - 50 kick / 50 sprint / 50 drill (rest :15)", 2, "1", distance="150yd", group="A"),
      E("Choice sprint (rest :15)", 4, "1", distance="25yd"), E("Freestyle recovery (rest :10)", 1, "1", distance="200yd"), E("Kick (rest :10)", 1, "1", distance="200yd"),
      E("Choice, build fast to slow (rest :10)", 4, "1", distance="25yd"), E("Backstroke (rest :10)", 1, "1", distance="100yd"), E("Easy freestyle", 1, "1", distance="100yd")],
     series=SWL)

UAB = "https://www.usms.org/fitness-and-training/articles-and-videos/articles/best-swimming-workouts-for-strong-abs"
SAB = "USMS Best Swimming Workouts for Strong Abs"
usms("x-end-usms-abs-undulate", "USMS Core Swim - Undulate", UAB, "Kris Goodrich", "intermediate", ["endurance", "strength"], 60, "2,800 yards",
     "250s with dolphin kick on your back in the middle, plus pull and core-focused dolphin kick 100s.",
     [E("Freestyle (rest :15)", 1, "1", distance="200yd"), E("Pull (rest :15)", 1, "1", distance="200yd"), E("Kick (rest :15)", 1, "1", distance="200yd"),
      E("Choice (rest :15)", 1, "1", distance="100yd"), E("Freestyle, build slow to fast (rest :15)", 4, "1", distance="25yd"),
      E("Freestyle - 100 pace / 50 dolphin kick on back / 100 pace (rest :15)", 4, "1", distance="250yd"), E("Pull (rest :10)", 4, "1", distance="100yd"),
      E("Kick - 25 flutter / 50 dolphin (core focus) / 25 flutter (rest :10)", 3, "1", distance="100yd"), E("Choice, build fast to slow (rest :10)", 4, "1", distance="25yd"),
      E("Backstroke (rest :10)", 1, "1", distance="100yd"), E("Freestyle, easy", 1, "1", distance="100yd")], eq=["pool", "pull buoy", "kickboard"], series=SAB)
usms("x-end-usms-abs-swim-tall", "USMS Core Swim - Swim Tall", UAB, "Kris Goodrich", "advanced", ["endurance", "strength"], 65, "2,900 yards",
     "Four 500s that work breathing sides, distance per stroke with snorkel and paddles, a 3-5-7-5-3 breathing pull and a descending finish.",
     [E("Choice (rest :15)", 1, "1", distance="400yd"), E("25 kick / 25 drill / 25 build (rest :15)", 4, "1", distance="75yd"),
      E("Freestyle, alternate breathing side every 50 (rest 2:00)", 1, "1", distance="500yd"), E("Freestyle with snorkel and paddles, distance per stroke (rest 2:00)", 1, "1", distance="500yd"),
      E("Pull with paddles, breathe 3-5-7-5-3 per 100 (rest 2:00)", 1, "1", distance="500yd"), E("Freestyle with paddles and fins, descend by 100 (rest 2:00)", 1, "1", distance="500yd"),
      E("Cool-down - choice", 1, "1", distance="200yd")], eq=["pool", "snorkel", "paddles", "fins", "pull buoy"], series=SAB,
     note=USMS_NOTE + " Breath-pattern work means fewer breaths per stroke cycle, never breath-holding for distance (shallow-water blackout risk).")
usms("x-end-usms-abs-stay-tight", "USMS Core Swim - Stay Tight", UAB, "Kris Goodrich", "intermediate", ["endurance", "strength"], 65, "3,200 yards",
     "A descending pull ladder with the buoy at your ankles to force a tight core, alternated with faster 50s.",
     [E("Choice (rest :15)", 1, "1", distance="400yd"), E("50 kick / 50 drill / 50 swim (rest :15)", 4, "1", distance="150yd"),
      E("Pull, buoy at ankles for first 200 (rest :30)", 1, "1", distance="400yd"), E("Choice (on :45)", 8, "1", distance="50yd"),
      E("Pull, buoy at ankles for first 100 (rest :30)", 1, "1", distance="300yd"), E("Choice (on :50)", 6, "1", distance="50yd"),
      E("Pull, buoy at ankles for first 100 (rest :30)", 1, "1", distance="200yd"), E("Choice (on :55)", 4, "1", distance="50yd"),
      E("Pull, long and relaxed (rest :30)", 1, "1", distance="100yd"), E("Choice (on 1:00)", 2, "1", distance="50yd"), E("Cool-down - choice", 1, "1", distance="200yd")],
     eq=["pool", "pull buoy", "snorkel (optional)"], series=SAB)

UOW = "https://www.usms.org/fitness-and-training/articles-and-videos/articles/pool-sets-adapted-for-open-water"
OW_NOTE = ("Free article on usms.org. Set structure only; credit USMS and the author. Swim open water only at a lifeguarded or "
           "organised venue, never alone - this is a Somax safety rule, not part of the source.")
OW_HOW = ["Only swim at a lifeguarded beach or organised open-water session, with a buddy or escort.",
          "Warm up with 5-10 minutes of easy swimming first (the article gives no warm-up).",
          "Use buoys, jetty posts or a timed out-and-back to mark the course; a waterproof watch helps.",
          "Get out early if you get cold, tired or the conditions change."]
usms("x-end-usms-ow-sprint-recovery", "USMS Open-Water Sprint & Recovery Ladder", UOW, "Molly Hoover", "intermediate", ["sport-performance", "endurance"], 40,
     "about 1,500-2,000 yards",
     "Fast-length ladders (1, 2, 3, then 4 fast) each followed by an easy length, on a short 25-50 yard course.",
     [E("Warm-up, easy (not in source)", 1, "5-10 min"), E("1 length fast + 1 easy (rest 20s)", 4, "1", group="A"), E("2 lengths fast + 1 easy (rest 20s)", 4, "1", group="A"),
      E("3 lengths fast + 1 easy (rest 20s)", 4, "1", group="A"), E("4 lengths fast + 1 easy (rest 20s)", 4, "1", group="A")],
     eq=["open water venue", "waterproof watch", "bright swim cap"], series="USMS Pool Sets Adapted for Open Water", lifestyle=["outdoor"], how=OW_HOW, note=OW_NOTE,
     who="Confident pool swimmers who want structure in open-water sessions; course length 25-50 yards between markers. Do 3-4 rounds.")
usms("x-end-usms-ow-im-training", "USMS Open-Water IM Training", UOW, "Molly Hoover", "advanced", ["endurance", "sport-performance"], 60, "2,000 yards",
     "Ten rounds of a stroke-count IM (12 fly, 18 back, 10 breast, then free) and a build freestyle on a 100-yard course.",
     [E("Warm-up, easy (not in source)", 1, "5-10 min"), E("IM by stroke count - 12 fly, 18 back, 10 breast, free to the marker (rest 20s)", 10, "1", distance="100yd", group="A"),
      E("Freestyle build (rest 30s)", 10, "1", distance="100yd", group="A")],
     eq=["open water venue", "waterproof watch", "bright swim cap"], series="USMS Pool Sets Adapted for Open Water", lifestyle=["outdoor"], how=OW_HOW, note=OW_NOTE,
     who="Experienced open-water swimmers with all four strokes who want variety in a lake or calm bay.")

# USMS dryland (Bo Hickey)
DRY_NOTE = "Free article on usms.org. Exercise names, sets and reps only; see the article for exercise demonstrations. Credit USMS and the author."
for id, name, url, level, goals, mins, eq, desc, who, how, ex, lifestyle in [
    ("x-end-usms-dry-recovery-mobility", "USMS Swimmer's Recovery Mobility",
     "https://www.usms.org/fitness-and-training/articles-and-videos/articles/exercises-to-help-you-recover-from-swim-workouts",
     "beginner", ["mobility", "general-fitness"], 35, ["foam roller"],
     "Foam rolling, then three short mobility circuits for shoulders and back, hips and hamstrings, and ankles.",
     "Swimmers of any level who want to recover between pool sessions and keep shoulders, hips and ankles moving well.",
     ["Use on rest days or after a swim, 1-3 times a week.", "Move slowly and stay pain-free.",
      "Do 3 rounds of each circuit before moving to the next.", "Look up the article's videos for the less common moves (Brettzel, ankle driver)."],
     [E("Top-down foam rolling", 1, "10-15 min"), E("Prone floor angel", 3, "10 of each type", group="A"), E("Brettzel", 3, "10 + 30s hold each side", group="A"),
      E("Quadruped shoulder circles", 3, "5/side", group="A"), E("Hamstring pump", 3, "6/side", group="B"), E("90/90 hip hold", 3, "45s/side", group="B"),
      E("Spiderman + leg drive", 3, "6/side", group="B"), E("Ankle press (5s hold)", 3, "5", group="C"), E("Standing ankle circles", 3, "5 each way", group="C"),
      E("Ankle driver (5s hold)", 3, "5/side", group="C")], ["home", "minimal-equipment"]),
    ("x-end-usms-dry-freestyle-strength-power", "USMS Dryland for Freestylers",
     "https://www.usms.org/fitness-and-training/articles-and-videos/articles/build-strength-and-power-with-these-dryland-exercises-for-freestylers",
     "intermediate", ["strength", "sport-performance"], 40, ["resistance band", "dumbbells"],
     "A warm-up circuit, a band-and-dumbbell strength circuit for the pull and kick, and short band power bursts.",
     "Freestylers and triathletes who want more pulling strength and kick power from 2 dryland sessions a week.",
     ["Twice a week, not right before a hard swim.", "Warm-up: 3 rounds, minimal rest.",
      "Strength: 4 rounds, minimal rest between moves, 2 min between rounds. Power: 3 rounds, 1 min rest between moves.",
      "Anchor the band securely at about chest height."],
     [E("Prone floor angels", 3, "10 of each type", group="A"), E("Hinge matrix", 3, "2 of each position", group="A"), E("Squat swings", 3, "8/side", group="A"),
      E("Hinge and elbow pull (band)", 4, "8/side", group="B"), E("Single-leg deadlift (dumbbell)", 4, "8/side", group="B"),
      E("Waiter farmer carry (dumbbell)", 4, "30s/side", group="B"), E("Hip flexor kick (band)", 4, "30s/side", group="B"),
      E("Stationary sprint (band)", 3, "15s", group="C"), E("Speed skiers (band)", 3, "15s", group="C")], ["home", "minimal-equipment"]),
    ("x-end-usms-dry-band-home", "USMS Resistance Band Workout for Swimmers",
     "https://www.usms.org/fitness-and-training/articles-and-videos/articles/resistance-band-workout-you-can-do-from-home",
     "beginner", ["strength", "mobility"], 45, ["resistance band"],
     "A four-phase band session: warm-up, starts and walls, pulling strength and kick strength.",
     "Swimmers training at home or travelling with only a band, who want to keep their pull and kick strong.",
     ["Twice a week with at least 24 hours between sessions.", "Warm-up: 2 sets, minimal rest. Starts and walls: 2 sets, 2 min rest.",
      "Pulling and kick strength: 4 sets each, 2 min rest between sets.", "Use a band that lets you finish every rep with good form."],
     [E("Kneeling external rotation + press", 2, "8/side"), E("T-spine rotation + band", 2, "8/side"), E("Ankle circles + band", 2, "8 each way"),
      E("Staggered RDL + band", 2, "8/side"), E("Overhead squat + band", 2, "8"), E("Streamline jumps + band", 2, "5"), E("Plank + reach + band", 2, "10/side"),
      E("I-raise + band", 2, "10/side"), E("Hinge elbow pull + band", 4, "8/side"), E("Bridge pullover + band", 4, "8"), E("Plank wide pull + band", 4, "8/side"),
      E("Flutter kick + band", 4, "30s"), E("Overhead reverse lunge", 4, "8/side"), E("Single-leg hip hinge + band", 4, "8/side")], ["home", "travel", "minimal-equipment"]),
    ("x-end-usms-dry-upper-body", "USMS Upper-Body Exercises for Swimmers",
     "https://www.usms.org/en/fitness-and-training/articles-and-videos/articles/upper-body-exercises-for-swimmers",
     "beginner", ["strength", "mobility"], 30, ["resistance band", "dumbbell", "pull-up bar"],
     "Shoulder range-of-motion work followed by a band, dumbbell and hanging circuit to build a resilient swimmer's upper body.",
     "Swimmers who want healthier, stronger shoulders with a short session at home or the gym.",
     ["2-3 times a week.", "Do 3 rounds of the range-of-motion circuit, then 3 rounds of the strength circuit.",
      "Lower the push-up over 3 seconds; keep the low back on the wall for wall angels.", "Rest as needed; the article doesn't set rest times."],
     [E("Wall angels", 3, "12", group="A"), E("Shoulder mobility + band", 3, "12/side", group="A"), E("Cat/cow", 3, "12", group="A"),
      E("Shoulder pull-apart + band", 3, "8 of each type", group="B"), E("Single-arm row + dumbbell", 3, "8/side", group="B"),
      E("Around the world + weight", 3, "8 each way", group="B"), E("Dropdown push-up (3s lower)", 3, "8", group="B"), E("Active hang", 3, "30s total", group="B")],
     ["home", "minimal-equipment"]),
]:
    add(id=id, name=name, series="USMS Dryland for Swimmers", category="fitness", level=level, sport="swimming", goals=goals, sessionMinutes=mins, daysPerWeek=2,
        equipment=eq, description=desc, whoItsFor=who, lifestyle=lifestyle, howToRun=how, exercises=ex, credit="Bo Hickey (U.S. Masters Swimming)",
        sourceUrl=url, sourceNote=DRY_NOTE)

# ---------------------------------------------------------------------------- USA Swimming open water
USAOW = "https://www.usaswimming.org/docs/default-source/open-water-resources/open-water-workout-examples.pdf"
USAOW_NOTE = ("Free USA Swimming resource PDF (Open Water Workout Examples, 2020). Coach-written club sessions; structure only. "
              "Written for supervised club groups with kayak/escort cover - never swim open water alone.")
add(id="x-end-usa-swimming-ow-gemmell", name="USA Swimming Open-Water Workout (Bruce Gemmell)", category="swim", level="advanced", sport="swimming",
    goals=["endurance", "sport-performance"], sessionMinutes=95, daysPerWeek=1, equipment=["open water venue", "fins (optional)", "waterproof watch"],
    description="A continuous 36-minute swim, then 100s, 200s and 50s on a roughly 100m stretch of shoreline, finishing with stroke-count sprints.",
    whoItsFor="Experienced open-water swimmers training with a squad or escort who want a structured long session outside the pool.",
    lifestyle=["outdoor"], howToRun=[
        "Only at a supervised venue or with a squad and safety craft.",
        "Mark about 100m with buoys or shore landmarks (1:00-1:20 of swimming); stroke counts work too.",
        "Fins are fine on the continuous swim and the fly 50s.",
        "Do 1-3 rounds of the stroke-count finish depending on time and conditions."],
    exercises=[E("Warm-up - 1:00 swim / 1:00 kick / 1:00 fly drill or breaststroke", 4, "3 min"),
               E("Continuous swim block - 4:00 swim + :30 rest or easy, descend 1-4 / 5-8", 8, "4.5 min"),
               E("Swim, every 4th one fast (on 1:30)", 12, "1", distance="~100m"), E("Swim - odds free, evens free/fly by 50 (on 3:00)", 4, "1", distance="~200m"),
               E("Swim, descend 1-4 and 5-8 (on 1:00)", 8, "1", distance="~50m"),
               E("40 strokes out easy, turn and sprint back", 3, "1", group="A"), E("20 strokes out easy, sprint back", 3, "1", group="A"),
               E("10 strokes out easy, sprint back", 3, "1", group="A")],
    credit="Bruce Gemmell (USA Swimming)", sourceUrl=USAOW, sourceNote=USAOW_NOTE)
add(id="x-end-usa-swimming-ow-kase-ladder", name="USA Swimming Open-Water Time Ladder (Catherine Kase)", category="swim", level="intermediate", sport="swimming",
    goals=["endurance", "sport-performance"], sessionMinutes=55, daysPerWeek=1, equipment=["open water venue", "waterproof watch"],
    description="A time-based ladder (2-4-6-8-6-4-2 minutes) mixing speed play, IM, descending and negative-split swimming, then breathing and sighting practice.",
    whoItsFor="Intermediate open-water swimmers who want an engaging session that needs no measured course - just a watch.",
    lifestyle=["outdoor"], howToRun=[
        "Only at a supervised venue or with a squad and safety craft.",
        "Reset and check in with how you feel after each step of the ladder.",
        "Sight every few strokes, keep the hips up and pick landmarks.",
        "Swap any IM block for freestyle if other strokes aren't safe in the conditions."],
    exercises=[E("Warm-up - swim, kick, IM, easy/build/easy/fast (about 10 min)", 1, "10 min"),
               E("Speed play - e.g. 10 strokes easy, 10 fast, 10 easy, 20 fast", 1, "2 min"), E("IM", 1, "4 min"),
               E("Descend effort every 2 minutes", 1, "6 min"), E("Negative split (halfway at 4:00)", 1, "8 min"),
               E("Alternate easy/fast with strong kick", 1, "6 min"), E("IM", 1, "4 min"), E("All-out swim", 1, "2 min"),
               E("Breathing/sighting - 20 strokes breathe right, 20 left, 20 every 3", 2, "60 strokes")],
    credit="Catherine Kase (USA Swimming)", sourceUrl=USAOW, sourceNote=USAOW_NOTE)

# ---------------------------------------------------------------------------- Swim Serpentine (London Marathon Events)
SERP = "https://www.londonmarathonevents.co.uk/sites/default/files/2025-01/one-mile-pool-training-plan.pdf"
SERP_NOTE = ("Free one-mile pool training plan PDF from London Marathon Events (Swim Serpentine). Main sets, contrast set and drills "
             "are as published; the source gives warm-up/warm-down guidance but no distances, so those lines are Somax suggestions.")
WU_S = E("Warm-up - easy, building pace over short distances (Somax: ~200m)", 1, "5-8 min")
CON_S1 = E("Contrast - kick with board", 8, "1", distance="50m")
CON_S2 = E("Contrast - 25m drill (single arm, catch-up, 3-point touch...) / 25m swim", 8, "1", distance="50m")
WD_S = E("Warm-down - easy, think technique (Somax: ~200m)", 1, "5 min")
SERP_HOW = ["2-3 swims a week, with one long continuous swim to test yourself.",
            "Every session: warm-up, main set, contrast set (kick/drills), warm-down.",
            "Use the drills (catch-up, chicken wing, clenched fist, kick on side) in the contrast set.",
            "A mile in a 25m pool is 64 lengths (1,600m)."]
for id, name, level, mins, desc, main in [
    ("x-end-serpentine-distance-builder", "Swim Serpentine 10 x 100m Distance Builder", "beginner", 50,
     "A 1,000m target broken into 10 x 100m with a minute's rest, so you can swim each one faster than a straight 1,000m.",
     [E("Freestyle (rest 1 min)", 10, "1", distance="100m")]),
    ("x-end-serpentine-big-step-pyramid", "Swim Serpentine Big Step Pyramid", "intermediate", 55,
     "A 1,150m pyramid from 25m up to 400m and back down, with rest growing from 5 to 30 seconds.",
     [E("Swim (rest 5s)", 1, "1", distance="25m"), E("Swim (rest 10s)", 1, "1", distance="50m"), E("Swim (rest 15s)", 1, "1", distance="100m"),
      E("Swim (rest 20s)", 1, "1", distance="200m"), E("Swim (rest 30s)", 1, "1", distance="400m"), E("Swim (rest 20s)", 1, "1", distance="200m"),
      E("Swim (rest 15s)", 1, "1", distance="100m"), E("Swim (rest 10s)", 1, "1", distance="50m"), E("Swim", 1, "1", distance="25m")]),
    ("x-end-serpentine-build-set", "Swim Serpentine Build Set", "intermediate", 60,
     "A 1,475m ladder climbing from 25m to 400m in 50m steps, with rest growing by 5 seconds each step.",
     [E(f"Swim (rest {r}s)", 1, "1", distance=f"{d}m") for d, r in [(25, 5), (50, 10), (100, 15), (150, 20), (200, 25), (250, 30), (300, 35), (350, 40), (400, 45)]]),
    ("x-end-serpentine-5x400-broken", "Swim Serpentine 5 x 400m (Broken)", "advanced", 70,
     "2,000m as five 400s that get less broken each time: 16 x 25, 8 x 50, 4 x 100, 2 x 200, then a straight 400.",
     [E("400 as 25m reps (rest 5s each), then 30s", 16, "1", distance="25m"), E("400 as 50m reps (rest 10s each), then 30s", 8, "1", distance="50m"),
      E("400 as 100m reps (rest 15s each), then 30s", 4, "1", distance="100m"), E("400 as 200m reps (rest 30s each), then 30s", 2, "1", distance="200m"),
      E("Straight 400", 1, "1", distance="400m")]),
]:
    add(id=id, name=name, series="Swim Serpentine One-Mile Pool Plan", category="swim", level=level, sport="swimming", goals=["endurance", "general-fitness"],
        sessionMinutes=mins, daysPerWeek=2, equipment=["pool", "kickboard"], description=desc,
        whoItsFor="Swimmers training for a 1-mile (1.6km) open-water event or simply wanting to swim a mile, in a 25m pool.",
        lifestyle=[], howToRun=SERP_HOW, exercises=[WU_S] + main + [CON_S1, CON_S2, WD_S],
        credit="London Marathon Events (Swim Serpentine)", sourceUrl=SERP, sourceNote=SERP_NOTE)

# ---------------------------------------------------------------------------- Swim Smooth
SS = "https://swimsmoothtips.blogspot.com/2014/04/css-training-for-absolute-beginners.html"
SS_NOTE = "Free post on Swim Smooth's Feel For The Water blog (Paul Newsome). Protocol/set structure only; credit Swim Smooth and link out."
add(id="x-end-swimsmooth-css-test", name="Swim Smooth CSS Test", category="swim", level="intermediate", sport="swimming",
    goals=["sport-performance", "endurance"], sessionMinutes=40, daysPerWeek=1, equipment=["pool", "stopwatch or pace clock"],
    description="Time a 400m then a 200m, each as fast as you can evenly pace it. CSS per 100m = (T400 - T200) / 2.",
    whoItsFor="Swimmers who can swim 400m continuously and want a threshold pace (CSS) to set training sets.",
    lifestyle=["time-efficient"], howToRun=[
        "Warm up thoroughly first (a coach reply suggests 600-1,000m of mixed swimming and drills with a mini-build).",
        "Check the 200 was faster per 100m than the 400; if not, the test isn't valid.",
        "Test in your usual pool length and retest every 4-6 weeks.",
        "Use CSS for sets: CSS pace for threshold reps, CSS +6s/100m for steady, CSS +8-10s for easy."],
    exercises=[E("Warm-up, progressive (heart rate building)", 1, "1", distance="600-1000m"), E("400m time trial, evenly paced", 1, "1", distance="400m"),
               E("Recovery - very easy laps", 1, "5-10 min"), E("200m time trial", 1, "1", distance="200m"), E("Easy cool-down", 1, "1", distance="200m")],
    credit="Paul Newsome (Swim Smooth)", sourceUrl=SS, sourceNote=SS_NOTE)
add(id="x-end-swimsmooth-goldilocks", name="Swim Smooth Goldilocks Set (CSS)", category="swim", level="intermediate", sport="swimming",
    goals=["endurance", "sport-performance"], sessionMinutes=40, daysPerWeek=1, equipment=["pool", "pace clock or beeper"],
    description="All at CSS pace with no rest inside each block: 2 x 100m, 20 seconds, then 200m (Baby Bear), 300m (Mama Bear) or 400m (Papa Bear).",
    whoItsFor="Swimmers with a CSS time who want a threshold set that grows with them.",
    lifestyle=["time-efficient"], howToRun=[
        "Do a thorough warm-up first.",
        "Don't swim the 100s faster than CSS; if you can't hold pace, swim slightly slower rather than resting longer.",
        "Progress Baby (200) -> Mama (300) -> Papa (400) before getting faster.",
        "For a longer set, raise the opening 100s to 3 or 4."],
    exercises=[E("Warm-up (thorough, own choice)", 1, "1", distance="400-600m"), E("Swim at CSS pace (no rest between)", 2, "1", "CSS", distance="100m"),
               E("Rest", 1, "20s"), E("Swim at CSS pace - Baby 200 / Mama 300 / Papa 400", 1, "1", "CSS", distance="200-400m"), E("Easy cool-down", 1, "1", distance="200m")],
    credit="Paul Newsome (Swim Smooth)", sourceUrl=SS, sourceNote=SS_NOTE)

# ---------------------------------------------------------------------------- Masters Swimming Queensland
MSQ_IDX = "https://mastersswimmingqld.org.au/coaching/training-programs/"
MSQ31 = "https://mastersswimmingqld.org.au/wp-content/uploads/sites/15/2018/12/Training-Programs31-40.pdf"
MSQ51 = "https://mastersswimmingqld.org.au/wp-content/uploads/sites/15/2018/12/Training-Programs-51-60.pdf"
MSQ_NOTE = ("Free Masters Swimming Queensland program PDF (index: " + MSQ_IDX + "). MSQ says these programs may be used by individuals, "
            "coaches or clubs and to adjust to suit. Distances in metres as published. Credit MSQ and link out.")
MSQ_HOW = ["2-3 swims a week; rest whenever you need to - send-offs are suggestions.",
           "Fins are fine whenever the program lists them as optional.",
           "Swim the warm-up and cool-down easy and focus on technique.",
           "Scale reps down if the total is more than you usually swim."]


def msq(id, name, url, level, goals, mins, total, desc, ex, eq=None, note_extra=""):
    add(id=id, name=name, series="Masters Swimming Queensland Programs", category="swim", level=level, sport="swimming", goals=goals,
        sessionMinutes=mins, daysPerWeek=2, equipment=eq or ["pool"], description=desc + f" About {total}.",
        whoItsFor={"beginner": "Adult lap swimmers who can swim a few hundred metres and want a varied club-style session.",
                   "intermediate": "Masters and fitness swimmers comfortable with 2km sessions who want structured variety.",
                   "advanced": "Strong masters, triathletes and ex-club swimmers who handle 3-5km sessions."}[level],
        lifestyle=[], howToRun=MSQ_HOW, exercises=ex, credit="Masters Swimming Queensland", sourceUrl=url,
        sourceNote=MSQ_NOTE + (" " + note_extra if note_extra else ""))


msq("x-end-msq-35-sprints", "MSQ Set 35 - Sprints", MSQ31, "intermediate", ["sport-performance", "general-fitness"], 50, "2.1km",
    "Short sprints of 15, 25, 35 and 50 metres - swim, then with fins, then kick - between easy recovery swims.",
    [E("Freestyle", 1, "1", distance="200m"), E("Pull", 1, "1", distance="200m"), E("Kick with fins", 1, "1", distance="200m"),
     E("Sprints 15m, 25m, 35m, 50m (with or without fins)", 2, "4 sprints"), E("Easy backstroke kick/swim", 1, "1", distance="200m"),
     E("Sprints 15m, 25m, 35m, 50m with fins", 2, "4 sprints"), E("Easy swim, choice", 1, "1", distance="200m"),
     E("Kick sprints 15m, 25m, 35m, 50m with fins and board", 2, "4 sprints"), E("Cool-down swim", 1, "1", distance="200m"),
     E("Cool-down pull", 1, "1", distance="200m"), E("Cool-down kick", 1, "1", distance="200m")], ["pool", "fins", "kickboard", "pull buoy"])
msq("x-end-msq-36-aerobic-mixed", "MSQ Set 36 - Aerobic Mixed Activities", MSQ31, "intermediate", ["endurance", "fat-loss"], 45, "1.9km",
    "Three blocks of 5 x 100m - swim, pull and kick - plus a breathing-pattern and drill cool-down.",
    [E("Freestyle", 1, "1", distance="200m"), E("IM switch (or IM)", 1, "1", distance="200m"), E("Freestyle (on 1:45 / 2:00)", 5, "1", distance="100m"),
     E("Pull (on 2:00 / 2:15)", 5, "1", distance="100m"), E("Free kick (on 2:00 / 2:15)", 5, "1", distance="100m"),
     E("Free - breathe every 2nd, 3rd, 4th, 5th stroke by 25", 4, "1", distance="25m"), E("Streamline underwater butterfly kick", 4, "1", distance="25m"),
     E("Drills", 4, "1", distance="25m"), E("Free, slower each 25", 4, "1", distance="25m")], ["pool", "pull buoy", "kickboard"])
msq("x-end-msq-37-triathlete", "MSQ Set 37 - Triathlete Program", MSQ31, "intermediate", ["endurance", "sport-performance"], 55, "2.5km",
    "Mainly freestyle for triathletes: 20 x 50 with every 5th fast, then fast/easy kick 100s and pull 100s.",
    [E("Freestyle, every 5th 50 fast (on 1:00)", 20, "1", distance="50m"), E("Kick, fast/easy (on 2:00)", 6, "1", distance="100m"),
     E("Pull (on 1:45)", 6, "1", distance="100m"), E("100m free + 50m not-free", 2, "1", distance="150m")], ["pool", "pull buoy", "kickboard"])
msq("x-end-msq-38-medley", "MSQ Set 38 - Medley Program", MSQ31, "intermediate", ["general-fitness", "endurance"], 45, "2.0km",
    "All four strokes: IM-order 25s, IM-switch 50s with fins and IM/free 100s.",
    [E("50 free / 50 back / 50 breast (fins optional)", 4, "1", distance="150m"), E("IM order (on :40 / :45)", 12, "1", distance="25m"),
     E("IM switch with fins (on 1:00 / 1:15)", 8, "1", distance="50m"), E("IM / free (on 2:00)", 6, "1", distance="100m"),
     E("Swim to halfway, walk back", 4, "1", distance="25m")], ["pool", "fins"],
    "IM switch = 25m of one stroke then 25m of the next in IM order.")
msq("x-end-msq-39-aerobic-free", "MSQ Set 39 - Mainly Freestyle Aerobic", MSQ31, "intermediate", ["endurance", "general-fitness"], 45, "2.0km",
    "A steady session stepping from freestyle to backstroke to breaststroke, each a continuous swim followed by fast-ish 25s.",
    [E("Easy choice", 1, "1", distance="300m"), E("25 catch-up free / 25 choice", 1, "1", distance="200m"), E("Choice", 1, "1", distance="100m"),
     E("Freestyle", 1, "1", distance="300m"), E("Free (on :40)", 16, "1", distance="25m"), E("Backstroke (fins optional)", 1, "1", distance="200m"),
     E("Backstroke (on :45)", 12, "1", distance="25m"), E("Breaststroke", 1, "1", distance="100m"), E("Breaststroke (on :50)", 8, "1", distance="25m"),
     E("Easy swim", 1, "1", distance="200m")])
msq("x-end-msq-40-mixed", "MSQ Set 40 - Mixed Activities", MSQ31, "beginner", ["general-fitness", "endurance"], 35, "1.5km",
    "Short 25m repeats rotating pull, catch-up, pull and kick, then fly-kick push-offs and an easy side-kick cool-down.",
    [E("Easy choice", 1, "1", distance="300m"), E("25s on :45 - free pull, catch-up free, free pull, free kick", 6, "4 x 25m"),
     E("Fast fly kick off the wall (6-8 kicks) then freestyle", 1, "1", distance="200m"), E("Easy choice", 1, "1", distance="200m"),
     E("50 kick on side / 50 free / 50 kick on side / 50 free, easy", 1, "1", distance="200m")], ["pool", "pull buoy"],
    "The PDF labels this 'approx. 2km'; the listed sets add up to about 1.5km.")
msq("x-end-msq-51-heart-rate-300s", "MSQ Set 51 - Heart-Rate 300s", MSQ51, "advanced", ["endurance", "sport-performance"], 70, "3.6km",
    "Eight 300s on a 6-minute send-off as a heart-rate set, after an IM warm-up.",
    [E("Warm-up, alternating 100 free / 100 IM", 1, "1", distance="600m"), E("Free (on :45) - or 6 x 60m on 1:00", 8, "1", distance="50m"),
     E("Heart-rate set (on 6:00)", 8, "1", distance="300m"), E("Choice (on :45)", 4, "1", distance="50m")])
msq("x-end-msq-52-pull-im-paddles", "MSQ Set 52 - 200s: Pull, IM, Paddles", MSQ51, "advanced", ["endurance", "strength"], 100, "5.6km",
    "A big mainly-freestyle session: four blocks of 5 x 200 (pull, IM with fins, paddles, reverse IM with fins).",
    [E("Alternate free / backstroke (on 1:00)", 12, "1", distance="50m"), E("Pull (on 3:30)", 5, "1", distance="200m"),
     E("IM with fins (on 3:20)", 5, "1", distance="200m"), E("Free with paddles (on 3:30)", 5, "1", distance="200m"),
     E("Reverse IM with fins (on 3:20)", 5, "1", distance="200m"), E("Swim", 1, "1", distance="400m"), E("Pull", 1, "1", distance="300m"),
     E("Kick", 1, "1", distance="200m"), E("Choice", 1, "1", distance="100m")], ["pool", "pull buoy", "fins", "paddles", "kickboard"])
msq("x-end-msq-55-ins-and-outs", "MSQ Set 55 - Ins and Outs", MSQ51, "advanced", ["sport-performance", "endurance"], 65, "3.4km",
    "Explosive push-offs and fast finishes on 50s, a breathing-pattern 400 and turn practice from mid-pool.",
    [E("Free (on :55)", 20, "1", distance="50m"), E("Breast or back (on 1:00 / 1:15)", 8, "1", distance="50m"),
     E("Free - odds explode off the wall 8 strokes, evens explode last 8-10 strokes (on 1:00)", 20, "1", distance="50m"),
     E("Free, good turns, breathe every 2/3/4/5 by 50, twice through", 1, "1", distance="400m"),
     E("From mid-pool, mixed strokes, practise turns (on 1:15)", 12, "1", distance="50m")], note_extra="The PDF labels this 'approx. 5km'; the listed sets add up to about 3.4km.")
msq("x-end-msq-56-fins-paddles-200s", "MSQ Set 56 - Fins & Paddles 200s", MSQ51, "advanced", ["endurance", "strength"], 70, "3.6km",
    "A mixed warm-up, then 8-10 x 200 freestyle with fins and paddles on 3 minutes.",
    [E("100 free + 50 breast", 2, "1", distance="150m"), E("100 free + 50 back", 2, "1", distance="150m"),
     E("Alternate 50 kick / 50 swim, choice (on 1:00 / 1:10)", 12, "1", distance="50m"), E("Free with fins and paddles (on 3:00)", 10, "1", "8-10 reps", distance="200m"),
     E("Easy choice", 1, "1", distance="400m")], ["pool", "fins", "paddles"], "The PDF labels this 'approx. 5km'; the listed sets add up to about 3.2-3.6km.")
msq("x-end-msq-59-40x50-fins", "MSQ Set 59 - 40 x 50 Aerobic", MSQ51, "advanced", ["endurance", "fat-loss"], 60, "3.3km",
    "A simple, big aerobic main set: 40 x 50 freestyle with fins on 1:10.",
    [E("Alternate 50 free / 50 back (on 1:00)", 12, "1", distance="50m"), E("IM order (on :40)", 16, "1", distance="25m"),
     E("Free with fins (on 1:10)", 40, "1", distance="50m"), E("Easy choice", 1, "1", distance="300m")], ["pool", "fins"])
msq("x-end-msq-60-easy-fast-ladder", "MSQ Set 60 - Easy/Fast Ladder", MSQ51, "advanced", ["endurance", "sport-performance"], 70, "3.7km",
    "A ladder of matched easy and fast swims: 50/50, 100/100, 200/200, 300/300, 400/400.",
    [E("Swim", 1, "1", distance="400m"), E("Drill/swim", 1, "1", distance="300m"), E("Kick/swim", 1, "1", distance="200m"), E("Choice", 1, "1", distance="100m"),
     E("50m easy / 50m fast", 1, "1", distance="100m"), E("100m easy / 100m fast", 1, "1", distance="200m"), E("200m easy / 200m fast", 1, "1", distance="400m"),
     E("300m easy / 300m fast", 1, "1", distance="600m"), E("400m easy / 400m fast", 1, "1", distance="800m"),
     E("Underwater with fins, easy (on 1:00) - surface to breathe whenever needed", 12, "1", distance="50m")], ["pool", "fins"],
    "Underwater work: never hold your breath for distance (shallow-water blackout risk); surface whenever you need air.")

# =========================================================================================
# HYBRID - Jake Dearden (HYROX Master Trainer) #WOTW series, Built for Athletes
# =========================================================================================
BFA = "https://builtforathletes.com/blogs/news/"
BFA_NOTE = ("Free #WOTW article on builtforathletes.com featuring HYROX Master Trainer Jake Dearden. Exercises, reps, distances and "
            "loads only; credit the coach and link out. HYROX is a registered trademark - credit the format, don't imply endorsement.")
HYB_HOW = ["Warm up properly, even where the post lists no warm-up.",
           "Scale loads to 50-70% of race weight while you learn the stations; build to race weight over several weeks.",
           "Keep runs controlled - this trains running on tired legs, not sprinting.",
           "1-2 hybrid sessions a week alongside easy running and strength."]


def bfa(id, name, slug, date, level, goals, mins, eq, desc, who, ex, lifestyle=None, how=None):
    add(id=id, name=name, series="Jake Dearden HYROX #WOTW", category="fitness", level=level, sport="hybrid", goals=goals, sessionMinutes=mins,
        daysPerWeek=1, equipment=eq, description=desc, whoItsFor=who, lifestyle=lifestyle or ["full-gym"], howToRun=how or HYB_HOW,
        exercises=ex, credit="Jake Dearden, HYROX Master Trainer (Built for Athletes)", sourceUrl=BFA + slug,
        sourceNote=BFA_NOTE + f" Posted {date}.")


bfa("x-end-dearden-master-trainer-1", "Dearden HYROX: Squat, Sled & Run EMOM", "wotw-jake-dearden-hyrox-master-trainer-series-1", "3 Oct 2024", "advanced",
    ["strength", "sport-performance", "endurance"], 70, ["barbell", "squat rack", "sled", "bike erg", "cable or band"],
    "Back squats building to a 5RM, rack reverse lunges, a heavy sled-push + 200m run EMOM, sled pull walk-backs and core.",
    "Experienced hybrid athletes with sled access who want strength and race-specific leg endurance in one session.",
    [E("Bike erg", 1, "3 min"), E("Air squats / chest-to-floor walkouts / plank", 2, "10 / 5 / 30s"),
     E("Back squat (every 90s), build to a 5RM", 8, "5"), E("Barbell reverse lunge, back knee touches floor (rest 2 min)", 3, "16 (8/leg)"),
     E("EMOM: sled push 12.5m, then 200m run on alternate minutes", 12, "1 min", "HYROX weight + 30kg on sled"),
     E("Sled pull walk-back (every 2 min)", 5, "1", "HYROX weight", distance="25m"),
     E("Pallof press (cable/band)", 3, "12/arm", group="A"), E("Strict hanging leg raise", 3, "10", group="A"), E("Dead bug", 3, "45s", group="A")])
bfa("x-end-dearden-partner-bbj-carry", "Dearden HYROX: Partner Lunge & Carry AMRAP", "wotw-jake-dearden-hyrox-series-1", "2 Jan 2025", "intermediate",
    ["endurance", "strength", "sport-performance"], 45, ["sandbag", "kettlebells", "skipping rope"],
    "A partner workout: three 8-minute rounds of a burpee-broad-jump buy-in, then sandbag lunges and farmers carries for the rest of the round.",
    "Training partners preparing for HYROX Doubles, or anyone wanting a station-heavy session with a friend.",
    [E("Alternating single unders", 3, "50", group="A"), E("Squat-to-stand", 3, "5", group="A"), E("Push-ups (kneeling OK)", 3, "10", group="A"),
     E("Alternating Cossack squat (2s pause)", 3, "10", group="A"),
     E("Buy-in: burpee broad jumps, split between partners", 3, "50 x 1m", group="B"),
     E("AMRAP rest of 8 min: sandbag walking lunge", 3, "1", "Open 20/10kg, Pro 30/20kg", distance="20m", group="B"),
     E("AMRAP rest of 8 min: farmers carry", 3, "1", "Open 2x24/16kg, Pro 2x32/24kg", distance="40m", group="B"),
     E("Rest between rounds", 2, "2 min"), E("EMOM: Copenhagen plank, alternate sides each minute", 6, "15-20 reps")])
bfa("x-end-dearden-shuttle-10-rounds", "Dearden HYROX: 10-Round Shuttle (10m Space)", "wotw-jake-dearden-hyrox-series-2", "19 Feb 2025", "intermediate",
    ["endurance", "fat-loss", "general-fitness"], 50, ["none (10m of floor)"],
    "10 rounds for time of 100m shuttle runs, burpee broad jumps and walking lunges - all in a 10m space. 40-minute cap.",
    "Anyone training for HYROX with only a small space and no equipment: home, hotel car park or a crowded gym.",
    [E("Run / air squats / walking lunges / burpees", 3, "200m / 10 / 10 / 5"),
     E("Shuttle run (5 down-and-backs of 10m)", 10, "1", distance="100m", group="A"), E("Burpee broad jumps", 10, "1", distance="20m", group="A"),
     E("Shuttle run", 10, "1", distance="100m", group="A"), E("Walking lunges, bodyweight", 10, "1", distance="20m", group="A")],
    lifestyle=["home", "minimal-equipment", "travel", "time-efficient"],
    how=["Steady pace every round: focus on breathing and consistency.", "40-minute time cap; note your time and try to beat it next time.",
         "Scale to 6-8 rounds if you're new to burpee broad jumps.", "Good on a day you can't get to a gym."])
bfa("x-end-dearden-row-wallball-amrap", "Dearden HYROX: Squat/RDL + Row & Wall-Ball Rounds", "wotw-jake-dearden-hyrox-series-3", "2 Apr 2025", "intermediate",
    ["strength", "endurance", "sport-performance"], 55, ["rower", "barbell", "dumbbells", "wall ball", "med ball"],
    "Back squat and dumbbell RDL strength, then four 4-minute rounds of a row buy-in and a wall-ball/sit-up/lunge AMRAP.",
    "Gym-goers building towards HYROX who want leg strength plus wall-ball endurance.",
    [E("Erg / hip flow / squat-to-stand / shoulder dislocates", 2, "30s each"),
     E("Back squat (every 3 min)", 4, "6-8", group="A"), E("Dumbbell Romanian deadlift", 4, "10-12", group="A"),
     E("Buy-in: row (men 500m / women 400m)", 4, "1", distance="400-500m", group="B"),
     E("AMRAP rest of 4 min: med-ball sit-ups", 4, "10", group="B"), E("AMRAP: wall balls", 4, "10", "20/14 lb (as published)", group="B"),
     E("AMRAP: alternating lunges, wall-ball bear hug", 4, "10", group="B"), E("Rest between rounds", 3, "2 min")])
bfa("x-end-dearden-3x15-amrap", "Dearden HYROX: 3 x 15-Min Station AMRAPs", "wotw-jake-dearden-hyrox-series-4", "15 Aug 2025", "advanced",
    ["endurance", "sport-performance", "strength"], 65, ["sled", "wall ball", "ski erg", "rower", "kettlebells or dumbbells"],
    "Three 15-minute AMRAPs that cover every HYROX station plus running, then a 100m walking-lunge finisher. HYROX weights.",
    "Experienced HYROX athletes who want a long, race-specific engine session.",
    [E("1000m run, then 2 rounds: 20 cal row / 15 air squats / 10 burpees", 1, "1"),
     E("AMRAP 1 (15 min): sled push 25m / wall balls / butterfly sit-ups", 1, "25m / 25 / 25", "HYROX weight"),
     E("AMRAP 2 (15 min): sled pull 25m / farmers carry 100m / burpee broad jumps", 1, "25m / 100m / 10", "HYROX weight"),
     E("AMRAP 3 (15 min): ski / row / run", 1, "250m each"), E("Finisher: walking lunges", 1, "1", distance="100m")])
bfa("x-end-dearden-deadlift-box-ski", "Dearden HYROX: Deadlift + Box Jump/Wall-Ball Intervals", "wotw-jake-dearden-hyrox-series-5", "26 Aug 2025", "advanced",
    ["strength", "sport-performance", "endurance"], 60, ["barbell", "box", "wall ball", "ski erg", "rower", "dumbbells"],
    "Deadlifts and static split squats, then 10 rounds of 1 minute on / 1 minute off alternating box jump-overs + SkiErg with wall balls + row.",
    "Experienced hybrid athletes wanting strength plus repeatable high-intensity station work.",
    [E("Deadlift, reset each rep (every 3 min)", 3, "5", "~70-80% max, 2-3 reps in reserve"),
     E("Static split squat, 2-3s lower (every 2:30)", 3, "6/leg"),
     E("A) 10 box jump-overs, then max cal SkiErg to the minute", 5, "1 min on / 1 min off", "24/20 in box", group="A"),
     E("B) 10 wall balls unbroken, then max cal row to the minute", 5, "1 min on / 1 min off", "9/6kg to 10/9ft", group="A")])
bfa("x-end-dearden-45-min-amrap", "Dearden HYROX: 45-Minute Engine AMRAP", "wotw-jake-dearden-hyrox-series-6", "19 Sep 2025", "intermediate",
    ["endurance", "fat-loss", "sport-performance"], 55, ["rower", "ski erg", "dumbbells", "box"],
    "A 45-minute AMRAP at RPE 6-7: row and run 1000m, dumbbell deadlifts, push presses and box step-overs, then ski and run, repeat.",
    "Intermediate hybrid athletes building aerobic capacity with light dumbbells.",
    [E("Warm-up (not in post): easy erg + mobility", 1, "10 min"),
     E("Row", 1, "1", distance="1000m", group="A"), E("Run", 1, "1", distance="1000m", group="A"), E("Dumbbell deadlift", 1, "30", "2 x 15/10kg", group="A"),
     E("Dumbbell push press", 1, "25", "2 x 15/10kg", group="A"), E("Dumbbell box step-over", 1, "20", "2 x 15/10kg", group="A"),
     E("Ski", 1, "1", distance="1000m", group="A"), E("Run", 1, "1", distance="1000m", group="A"), E("Dumbbell deadlift", 1, "30", group="A"),
     E("Dumbbell push press", 1, "25", group="A"), E("Dumbbell box step-over", 1, "20", group="A")],
    how=["Keep going for 45 minutes at a 'comfortably hard but maintainable' pace (RPE 6-7).",
         "Pick dumbbells you can finish each movement with in no more than 2 sets.", "Record rounds + reps to compare next time.",
         "Warm up first; the post lists no warm-up."])
bfa("x-end-dearden-zpress-row-emom", "Dearden HYROX: Z-Press/Row EMOM + Erg, Wall Ball & Carry", "wotw-jake-dearden-hyrox-series-7", "9 Oct 2025", "intermediate",
    ["strength", "endurance", "sport-performance"], 45, ["dumbbells", "rower or ski erg", "wall ball", "kettlebells"],
    "A 12-minute dumbbell Z-press and single-arm row EMOM, then four 3-minute rounds of erg calories, wall balls and max-distance farmers carry.",
    "Intermediate hybrid athletes who want upper-body strength and a short, repeatable conditioning piece. Designed to repeat weekly.",
    [E("Warm-up (not in post): easy erg + mobility", 1, "8 min"),
     E("EMOM min 1: dumbbell Z-press", 4, "8-12", "2-3 reps in reserve first round", group="A"), E("EMOM min 2: single-arm dumbbell row (left)", 4, "8-12", group="A"),
     E("EMOM min 3: single-arm dumbbell row (right)", 4, "8-12", group="A"),
     E("Erg calories", 4, "20/15 cal", group="B"), E("Wall balls", 4, "25", "9/6kg", group="B"),
     E("Kettlebell farmers carry, max distance in the time left", 4, "rest of 3 min", "32/24kg", group="B"), E("Rest between rounds", 3, "90s")])

# Number sessions within each series (matches day/daysInSeries in sourced-programs.json).
from collections import Counter, defaultdict
tot = Counter(p.get("series") for p in P if p.get("series"))
seen = defaultdict(int)
for p in P:
    assert p["id"].startswith("x-end-"), p["id"]
    if not p.get("series"):
        p.pop("series", None); continue
    seen[p["series"]] += 1
    p["day"], p["daysInSeries"] = seen[p["series"]], tot[p["series"]]
ORDER = ["id", "name", "series", "day", "daysInSeries", "category", "level", "sport", "goals", "duration", "daysPerWeek", "sessionMinutes",
         "equipment", "description", "whoItsFor", "lifestyle", "howToRun", "exercises", "credit", "sourceUrl", "sourceNote", "verified"]
P = [{k: p[k] for k in ORDER if k in p} for p in P]
json.dump(P, open(OUT, "w"), indent=1, ensure_ascii=False)
print(len(P), "sourced entries ->", OUT)
