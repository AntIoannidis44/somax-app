"""Generate expansion/run-sourced.json: credited running + walking sessions.

Every entry was read from the page/PDF in its sourceUrl on 2026-11-13. Only facts
(timings, distances, reps, efforts) are transcribed. Descriptions, whoItsFor and
howToRun are written in our own words. Usage:
    python3 gen_run_sourced.py ../expansion/run-sourced.json
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
        exercises, credit, url, note, series=None, day=None, daysInSeries=None):
    assert id.startswith("x-run-"), id
    assert len(how) == 4, id
    d = {"id": id, "name": name}
    if series: d["series"] = series
    if day: d["day"] = day
    if daysInSeries: d["daysInSeries"] = daysInSeries
    d.update(category=category, level=level, sport=sport, goals=goals, duration=f"{minutes} min", daysPerWeek=dpw,
             equipment=equipment, description=description, exercises=exercises, credit=credit, sourceUrl=url,
             sourceNote=note, verified=True, whoItsFor=who, lifestyle=lifestyle, howToRun=how,
             sessionMinutes=minutes)
    P.append(d)


WALK5 = E("Brisk walk warm-up", 1, "5 min")
COOL5 = E("Cool-down walk", 1, "5 min")

# ============================================================ NHS COUCH TO 5K (remaining distinct weeks)
NHS_URL = "https://www.nhs.uk/better-health/get-active/get-running-with-couch-to-5k/couch-to-5k-running-plan/"
NHS_CREDIT = "NHS (Better Health)"
NHS_NOTE = ("Free NHS programme (© Crown copyright). Only the run/walk timings are recorded; credit the NHS and "
            "link to the official plan/app. Weeks 1, 5 (run 3) and 9 are already in sourced-programs.json; "
            "week 6 run 3 is identical to week 7 and week 8 (28 min) is a near-duplicate of weeks 7/9, so both are omitted.")
NHS_SERIES = "NHS Couch to 5K"
NHS_WHO = "Couch to 5K runners part-way through the 9-week plan. Only do this week once the previous week felt manageable."
NHS_LS = ["outdoor", "minimal-equipment", "busy", "time-efficient"]


def nhs_how(next_step):
    return ["Three runs a week on non-consecutive days.",
            "Run slowly enough to talk; the walks are part of the plan, not a failure.",
            "Repeat the week if it felt too hard - taking longer is fine.",
            next_step]


add("x-run-nhs-c25k-week-2", "Couch to 5K – Week 2", "run", "beginner", "running",
    ["endurance", "fat-loss", "general-fitness"], 30, 3, ["bodyweight"],
    "Week 2 stretches each run to 90 seconds with two-minute walks in between.",
    NHS_WHO, NHS_LS, nhs_how("Next: Couch to 5K Week 3."),
    [WALK5, E("Run (easy pace)", 6, "90s", group="A"), E("Walk recovery", 5, "2 min", group="A"), COOL5],
    NHS_CREDIT, NHS_URL, NHS_NOTE, series=NHS_SERIES)

add("x-run-nhs-c25k-week-3", "Couch to 5K – Week 3", "run", "beginner", "running",
    ["endurance", "fat-loss", "general-fitness"], 28, 3, ["bodyweight"],
    "The first mixed week: two rounds of a 90-second run and a 3-minute run, each followed by an equal walk.",
    NHS_WHO, NHS_LS, nhs_how("Next: Couch to 5K Week 4."),
    [WALK5, E("Run (easy pace)", 2, "90s", group="A"), E("Walk", 2, "90s", group="A"),
     E("Run (easy pace)", 2, "3 min", group="A"), E("Walk (skip after the final run)", 1, "3 min", group="A"), COOL5],
    NHS_CREDIT, NHS_URL, NHS_NOTE, series=NHS_SERIES)

add("x-run-nhs-c25k-week-4", "Couch to 5K – Week 4", "run", "beginner", "running",
    ["endurance", "fat-loss", "general-fitness"], 32, 3, ["bodyweight"],
    "Sixteen minutes of running in total: 3- and 5-minute runs with shorter walks than run time.",
    NHS_WHO, NHS_LS, nhs_how("Next: Couch to 5K Week 5, Run 1."),
    [WALK5, E("Run (easy pace)", 2, "3 min", group="A"), E("Walk", 2, "90s", group="A"),
     E("Run (easy pace)", 2, "5 min", group="A"), E("Walk (skip after the final run)", 1, "2 min 30s", group="A"), COOL5],
    NHS_CREDIT, NHS_URL, NHS_NOTE, series=NHS_SERIES)

add("x-run-nhs-c25k-week-5-run-1", "Couch to 5K – Week 5, Run 1", "run", "beginner", "running",
    ["endurance", "fat-loss", "general-fitness"], 31, 3, ["bodyweight"],
    "Three 5-minute runs with 3-minute walks - the start of the jump to 20 minutes non-stop.",
    NHS_WHO, NHS_LS, nhs_how("Next: Week 5, Run 2 (two 8-minute runs)."),
    [WALK5, E("Run (easy pace)", 3, "5 min", group="A"), E("Walk", 2, "3 min", group="A"), COOL5],
    NHS_CREDIT, NHS_URL, NHS_NOTE, series=NHS_SERIES)

add("x-run-nhs-c25k-week-5-run-2", "Couch to 5K – Week 5, Run 2", "run", "beginner", "running",
    ["endurance", "fat-loss", "general-fitness"], 31, 3, ["bodyweight"],
    "Two 8-minute runs split by a 5-minute walk.",
    NHS_WHO, NHS_LS, nhs_how("Next: Week 5, Run 3 (20 minutes non-stop)."),
    [WALK5, E("Run (easy pace)", 1, "8 min"), E("Walk", 1, "5 min"), E("Run (easy pace)", 1, "8 min"), COOL5],
    NHS_CREDIT, NHS_URL, NHS_NOTE, series=NHS_SERIES)

add("x-run-nhs-c25k-week-6-run-1", "Couch to 5K – Week 6, Run 1", "run", "beginner", "running",
    ["endurance", "fat-loss", "general-fitness"], 34, 3, ["bodyweight"],
    "A 5-8-5 minute run sandwich with 3-minute walks.",
    NHS_WHO, NHS_LS, nhs_how("Next: Week 6, Run 2 (two 10-minute runs)."),
    [WALK5, E("Run (easy pace)", 1, "5 min"), E("Walk", 1, "3 min"), E("Run (easy pace)", 1, "8 min"),
     E("Walk", 1, "3 min"), E("Run (easy pace)", 1, "5 min"), COOL5],
    NHS_CREDIT, NHS_URL, NHS_NOTE, series=NHS_SERIES)

add("x-run-nhs-c25k-week-6-run-2", "Couch to 5K – Week 6, Run 2", "run", "beginner", "running",
    ["endurance", "fat-loss", "general-fitness"], 33, 3, ["bodyweight"],
    "Two 10-minute runs with one 3-minute walk in the middle.",
    NHS_WHO, NHS_LS, nhs_how("Next: Week 6, Run 3 (25 minutes non-stop - same as Week 7)."),
    [WALK5, E("Run (easy pace)", 1, "10 min"), E("Walk", 1, "3 min"), E("Run (easy pace)", 1, "10 min"), COOL5],
    NHS_CREDIT, NHS_URL, NHS_NOTE, series=NHS_SERIES)

add("x-run-nhs-c25k-week-7", "Couch to 5K – Week 7 (25 min)", "run", "beginner", "running",
    ["endurance", "fat-loss", "general-fitness"], 35, 3, ["bodyweight"],
    "Twenty-five minutes of continuous easy running, three times this week (also week 6, run 3).",
    NHS_WHO, NHS_LS, nhs_how("Week 8 adds 3 minutes (28 min); week 9 is 30 minutes."),
    [WALK5, E("Continuous run (easy pace)", 1, "25 min"), COOL5],
    NHS_CREDIT, NHS_URL, NHS_NOTE, series=NHS_SERIES)

# ============================================================ MELBOURNE UNIVERSITY SPORT – ZERO TO 5K
UM_CREDIT = "Melbourne University Sport (University of Melbourne)"
UM_NOTE = ("Free PDF published by Melbourne University Sport; no copyright or reproduction notice in the document. "
           "Run intervals at RPE 4-5 unless marked. Only the timings are recorded; credit and link to the PDF. "
           "Week numbers follow the PDF's day grid (3 run days a week).")
UM_SERIES = "Melbourne Uni Sport Zero to 5k"
UM_W3 = "https://sport.unimelb.edu.au/pdfs/Beginner-Run-plan-week-3.pdf"
UM_W5 = "https://sport.unimelb.edu.au/pdfs/Beginner-Run-plan-Week-5.pdf"
UM_W7 = "https://sport.unimelb.edu.au/pdfs/Beginner-Run-plan-Week-7.pdf"
UM_LS = ["outdoor", "minimal-equipment", "busy"]
UM_HOW = ["Three run days a week with a rest day, easy walk or mobility class between them.",
          "Comfortable pace (RPE 4-5 out of 10) unless the session says otherwise.",
          "Not running yet? Swap the run intervals for fast walking. Already run a bit? Lift intervals to RPE 6-7.",
          "Can't run outdoors? Ride a bike instead: push the work intervals, pedal easy on recoveries."]
UM_WHO = "Beginners building from zero to 5 km, especially students and staff after a structured, university-backed plan."

add("x-run-unimelb-z5k-week-3-run-1", "Zero to 5k – Week 3, Run 1 (2s and 1s)", "run", "beginner", "running",
    ["endurance", "general-fitness", "fat-loss"], 38, 3, ["bodyweight"],
    "Four 2-minute runs with short 1-minute walks, then eight 1:1 run-walk reps to finish.",
    UM_WHO, UM_LS, UM_HOW,
    [E("Walk warm-up (easy pace)", 1, "5 min"), E("Run (RPE 4-5)", 4, "2 min", group="A"), E("Walk recovery", 4, "1 min", group="A"),
     E("Run (RPE 4-5)", 8, "1 min", group="B"), E("Walk recovery", 8, "1 min", group="B"), E("Walk cool-down (easy pace)", 1, "5 min")],
    UM_CREDIT, UM_W3, UM_NOTE, series=UM_SERIES)

add("x-run-unimelb-z5k-week-5-run-2", "Zero to 5k – Week 5, Run 2 (4 x 6 min)", "run", "beginner", "running",
    ["endurance", "general-fitness", "fat-loss"], 46, 3, ["bodyweight"],
    "Four 6-minute runs with 3-minute walks - 24 minutes of running.",
    UM_WHO, UM_LS, UM_HOW,
    [E("Walk warm-up (easy pace)", 1, "5 min"), E("Run (RPE 4-5)", 4, "6 min", group="A"), E("Walk", 4, "3 min", group="A"),
     E("Walk cool-down (easy pace)", 1, "5 min")],
    UM_CREDIT, UM_W5, UM_NOTE, series=UM_SERIES)

add("x-run-unimelb-z5k-week-6-run-1", "Zero to 5k – Week 6, Run 1 (first speed)", "run", "beginner", "running",
    ["endurance", "general-fitness"], 42, 3, ["bodyweight"],
    "The plan's first quicker session: ten 1:1 run-walks at RPE 6-7, a 2-minute walk, then ten 30-second runs with 30-second jog/walks.",
    UM_WHO, UM_LS, UM_HOW,
    [E("Walk warm-up (easy pace)", 1, "5 min"), E("Run", 10, "1 min", "RPE 6-7", group="A"), E("Walk recovery", 10, "1 min", group="A"),
     E("Walk", 1, "2 min"), E("Run", 10, "30s", "RPE 6-7", group="B"), E("Jog/walk recovery", 10, "30s", group="B"),
     E("Walk cool-down (easy pace)", 1, "5 min")],
    UM_CREDIT, UM_W7, UM_NOTE, series=UM_SERIES)

add("x-run-unimelb-z5k-week-6-run-2", "Zero to 5k – Week 6, Run 2 (4-3-2-1 ladder)", "run", "beginner", "running",
    ["endurance", "general-fitness"], 40, 3, ["bodyweight"],
    "A descending ladder done twice: 4, 3, 2 and 1-minute runs with 1-minute walks (2 minutes after the 1-minute run).",
    UM_WHO, UM_LS, UM_HOW,
    [E("Walk warm-up (easy pace)", 1, "5 min"), E("Run (RPE 4-5)", 2, "4 min", group="A"), E("Walk", 2, "1 min", group="A"),
     E("Run (RPE 4-5)", 2, "3 min", group="A"), E("Walk", 2, "1 min", group="A"), E("Run (RPE 4-5)", 2, "2 min", group="A"),
     E("Walk", 2, "1 min", group="A"), E("Run (RPE 4-5)", 2, "1 min", group="A"), E("Walk", 2, "2 min", group="A"),
     E("Walk cool-down (easy pace)", 1, "5 min")],
    UM_CREDIT, UM_W7, UM_NOTE, series=UM_SERIES)

add("x-run-unimelb-z5k-week-7-run-1", "Zero to 5k – Week 7, Run 1 (20 x 1 min)", "run", "beginner", "running",
    ["endurance", "fat-loss", "general-fitness"], 50, 3, ["bodyweight"],
    "Twenty 1-minute runs at RPE 6-7 with 1-minute walks - the plan's biggest interval day.",
    UM_WHO, UM_LS, UM_HOW,
    [E("Walk warm-up (easy pace)", 1, "5 min"), E("Run", 20, "1 min", "RPE 6-7", group="A"), E("Walk recovery", 20, "1 min", group="A"),
     E("Walk cool-down (easy pace)", 1, "5 min")],
    UM_CREDIT, UM_W7, UM_NOTE, series=UM_SERIES)

add("x-run-unimelb-z5k-week-7-run-3", "Zero to 5k – Week 7, Run 3 (3 x 10 min)", "run", "beginner", "running",
    ["endurance", "general-fitness", "fat-loss"], 49, 3, ["bodyweight"],
    "Three 10-minute runs with 3-minute walks - 30 minutes of running, close to a full 5 km.",
    UM_WHO, UM_LS, UM_HOW,
    [E("Walk warm-up (easy pace)", 1, "5 min"), E("Run (RPE 4-5)", 3, "10 min", group="A"), E("Walk", 3, "3 min", group="A"),
     E("Walk cool-down (easy pace)", 1, "5 min")],
    UM_CREDIT, UM_W7, UM_NOTE, series=UM_SERIES)

# ============================================================ NHLBI (US public domain)
NH_URL = "https://www.nhlbi.nih.gov/files/docs/public/heart/phy_active.pdf"
NH_CREDIT = "National Heart, Lung, and Blood Institute (NIH) – Your Guide to Physical Activity and Your Heart"
NH_NOTE = ("US federal government publication (NIH Pub. No. 06-5714), public domain. Sample programs on pp. 27-29. "
           "Credit NHLBI. The guide sets intensity by target heart-rate zone; we show it as talk-test effort too.")

add("x-run-nhlbi-walking-week-1", "NHLBI Sample Walking Program – Week 1", "walk", "beginner", "general",
    ["general-fitness", "endurance", "fat-loss"], 15, 5, ["bodyweight"],
    "A 15-minute starter walk: 5 minutes easy, 5 minutes brisk, 5 minutes easy.",
    "Inactive adults and older adults starting from scratch, including people over 40 who haven't exercised for a while.",
    ["outdoor", "minimal-equipment", "older-adults", "busy", "time-efficient"],
    ["Aim for brisk walking on at least 5 days this week.",
     "Brisk = breathing harder but still able to talk; check your pulse sits in your target zone if you use one.",
     "Each week the brisk section grows by about 2 minutes (Week 12: 30 minutes).",
     "Check with your GP first if you have a heart condition or take blood-pressure medicine."],
    [E("Slow walk warm-up", 1, "5 min"), E("Brisk walk", 1, "5 min", "target heart-rate zone / can talk, breathing harder"),
     E("Slow walk cool-down", 1, "5 min")],
    NH_CREDIT, NH_URL, NH_NOTE, series="NHLBI Sample Walking Program")

add("x-run-nhlbi-walking-week-12", "NHLBI Sample Walking Program – Week 12", "walk", "beginner", "general",
    ["general-fitness", "endurance", "fat-loss"], 40, 5, ["bodyweight"],
    "The final week of the 12-week walking program: 30 minutes of brisk walking between easy warm-up and cool-down walks.",
    "Walkers who have built up through the program and can now walk briskly for 30 minutes.",
    ["outdoor", "minimal-equipment", "older-adults"],
    ["Walk briskly on at least 5 days a week.",
     "As fitness improves, walk in the upper half of your target heart-rate zone.",
     "From week 13, keep building brisk time from 30 towards 60 minutes on most days.",
     "Over 40 and ready to jog? NHLBI suggests starting its jogging program at Week 3 after this."],
    [E("Slow walk warm-up", 1, "5 min"), E("Brisk walk", 1, "30 min", "target heart-rate zone / can talk, breathing harder"),
     E("Slow walk cool-down", 1, "5 min")],
    NH_CREDIT, NH_URL, NH_NOTE, series="NHLBI Sample Walking Program")

add("x-run-nhlbi-jogging-week-4", "NHLBI Sample Jogging Program – Week 4", "run", "beginner", "running",
    ["endurance", "general-fitness", "fat-loss"], 28, 5, ["bodyweight"],
    "Walk-jog session from the NIH heart guide: two rounds of a 4-minute walk and 5-minute jog.",
    "Adults moving from walking to jogging, including over-40s who have completed the NHLBI walking program first.",
    ["outdoor", "minimal-equipment", "older-adults"],
    ["The guide suggests jogging on at least 5 days a week; most beginners do better with 3-4 and rest days between.",
     "Warm up with a 5-minute walk and stretch; cool down with a 3-minute walk and 2 minutes of stretching.",
     "Jog in your target heart-rate zone - if you can't talk, slow down.",
     "Repeat a week before moving on if it felt hard."],
    [E("Walk warm-up, then stretch", 1, "5 min"), E("Walk", 2, "4 min", group="A"), E("Jog", 2, "5 min", "target heart-rate zone", group="A"),
     E("Cool-down walk", 1, "3 min"), E("Stretch", 1, "2 min")],
    NH_CREDIT, NH_URL, NH_NOTE, series="NHLBI Sample Jogging Program")

add("x-run-nhlbi-jogging-week-10", "NHLBI Sample Jogging Program – Week 10", "run", "beginner", "running",
    ["endurance", "general-fitness", "fat-loss"], 27, 5, ["bodyweight"],
    "One 4-minute walk then a 13-minute continuous jog - the program's first long, unbroken jog.",
    "Walk-joggers about two-thirds of the way through the 16-week NHLBI program.",
    ["outdoor", "minimal-equipment", "older-adults"],
    ["Jog most days the guide suggests; keep at least one or two rest days if you're new.",
     "Weeks 11-12 grow the jog to 15 then 17 minutes; by week 15 it's 20 minutes of jogging.",
     "Stay in your target zone - slow jogging is still jogging.",
     "Afterwards, build jogging time gradually from 20 to 30 minutes (or up to 60)."],
    [E("Walk warm-up, then stretch", 1, "5 min"), E("Walk", 1, "4 min"), E("Continuous jog", 1, "13 min", "target heart-rate zone"),
     E("Cool-down walk", 1, "3 min"), E("Stretch", 1, "2 min")],
    NH_CREDIT, NH_URL, NH_NOTE, series="NHLBI Sample Jogging Program")

# ============================================================ WIRRAL NHS WALKING PLANS (beginner + advanced)
WI_CREDIT = "Wirral Community Health and Care NHS Foundation Trust"
WI_NOTE = ("Free NHS trust leaflet (PDF), no reproduction restriction stated. Every scheduled walk is wrapped in a "
           "10-minute slower warm-up and 10-minute cool-down. The intermediate plan is already in sourced-programs.json.")
WI_B = "https://www.wchc.nhs.uk/wp-content/uploads/2021/02/Walking-plans-Beginners.pdf"
WI_A = "https://www.wchc.nhs.uk/wp-content/uploads/2021/02/Walking-plans-Advanced.pdf"

add("x-run-wirral-beginner-walk-week-1", "NHS Beginners Walking Plan – Week 1 Walk", "walk", "beginner", "general",
    ["general-fitness", "endurance"], 30, 3, ["bodyweight"],
    "Ten minutes at a comfortable pace, wrapped in a slow 10-minute warm-up and cool-down.",
    "Anyone starting to walk for health - including older adults, people returning after illness and those with low fitness.",
    ["outdoor", "minimal-equipment", "older-adults"],
    ["Three walks this week with a rest day between each.",
     "Comfortable = you could chat the whole way.",
     "The plan adds a fourth walk in week 2 and introduces medium-pace walks in week 4.",
     "By week 10 you'll be doing 35-40 minute walks and short brisk walks six days a week."],
    [E("Slow walk warm-up", 1, "10 min"), E("Walk", 1, "10 min", "comfortable pace"), E("Slow walk cool-down", 1, "10 min")],
    WI_CREDIT, WI_B, WI_NOTE, series="NHS Wirral Walking Plans")

add("x-run-wirral-advanced-long-walk", "NHS Advanced Walking Plan – 75-min Long Walk", "walk", "advanced", "general",
    ["endurance", "fat-loss", "general-fitness"], 95, 6, ["bodyweight"],
    "The advanced plan's longest walk: 75 minutes at a comfortable pace plus warm-up and cool-down.",
    "Regular walkers who already walk 45 minutes or more most days and want a long, steady walk each week.",
    ["outdoor", "minimal-equipment"],
    ["Appears from week 8 of the advanced plan, up to three times a week alongside medium and brisk walks.",
     "Comfortable pace - this is about time on your feet, not speed.",
     "Take water on warm days and pick a route with somewhere to stop.",
     "Weekly rhythm: long comfortable walks, 55-60 min medium walks and one 30-40 min brisk walk."],
    [E("Slow walk warm-up", 1, "10 min"), E("Walk", 1, "75 min", "comfortable pace"), E("Slow walk cool-down", 1, "10 min")],
    WI_CREDIT, WI_A, WI_NOTE, series="NHS Wirral Walking Plans")

add("x-run-wirral-advanced-brisk-walk", "NHS Advanced Walking Plan – 40-min Brisk Walk", "walk", "advanced", "general",
    ["endurance", "fat-loss", "general-fitness"], 60, 6, ["bodyweight"],
    "A sustained 40-minute brisk walk, the hardest walk in the advanced plan (week 10).",
    "Fit walkers who want a harder cardio session without running.",
    ["outdoor", "minimal-equipment", "time-efficient"],
    ["Brisk walks start at 30 minutes in week 3 and reach 40 minutes by week 10.",
     "Do it once or twice a week, not on back-to-back days.",
     "Brisk = breathing hard enough that you can only speak in short phrases.",
     "Pair with the 75-minute comfortable walk for a well-rounded walking week."],
    [E("Slow walk warm-up", 1, "10 min"), E("Walk", 1, "40 min", "brisk pace"), E("Slow walk cool-down", 1, "10 min")],
    WI_CREDIT, WI_A, WI_NOTE, series="NHS Wirral Walking Plans")

# ============================================================ RESEARCH PROTOCOLS
add("x-run-shinshu-interval-walking", "Interval Walking Training (3 min fast / 3 min slow)", "walk", "beginner", "general",
    ["endurance", "general-fitness", "fat-loss"], 30, 4, ["bodyweight"],
    "The Japanese interval walking method: alternate 3 minutes of fast walking with 3 minutes of slow walking, five or more times.",
    "Middle-aged and older adults who want more fitness than ordinary walking gives, without running. Studied in thousands of people aged ~60-75.",
    ["outdoor", "minimal-equipment", "older-adults", "time-efficient"],
    ["Do at least 4 days a week; the studies aimed for about 60 minutes of fast walking per week.",
     "Fast = as quick as you can walk until you're puffing and talking is hard (about 70% of your walking capacity).",
     "Slow = a relaxed stroll to recover (about 40%).",
     "You can split sets through the day; walking alone doesn't prevent falls, so add strength and balance work too."],
    [E("Fast walk", 5, "3 min", "≥70% peak walking capacity (puffing, hard to talk)", group="A"),
     E("Slow walk", 5, "3 min", "~40% peak (easy stroll)", group="A")],
    "Shinshu University – Nose H, Masuki S et al. (Interval Walking Training)",
    "https://europepmc.org/article/MED/31477320",
    ("Research protocol read from Europe PMC abstracts (Masuki et al., Mayo Clin Proc 2019, 679 adults aged ~65; "
     "also PMC9024697, CC BY). Protocol: ≥5 sets of 3 min fast (≥70% peak VO2 for walking) and 3 min slow (~40%), "
     "≥4 days/week. Credit the Shinshu group; the original trials used accelerometers to check intensity."))

add("x-run-10-20-30-running", "10-20-30 Running Intervals", "run", "intermediate", "running",
    ["endurance", "sport-performance"], 30, 3, ["bodyweight"],
    "Five-minute blocks of 30 s jog, 20 s steady, 10 s near-sprint, repeated 3-4 times with 2 minutes' rest.",
    "Moderately trained runners (the study group averaged VO2max 52) who want more speed on less weekly mileage.",
    ["outdoor", "minimal-equipment", "time-efficient"],
    ["Warm up with easy jogging first (the abstract doesn't set a warm-up; ~10 min is typical).",
     "Each block: 5 x [30 s easy, 20 s moderate, 10 s close to flat out], no break inside the block.",
     "In the study this replaced all running for 7 weeks; most people do it 1-2 times a week with easy runs on other days.",
     "Results reported: 5 km about 48 s faster, VO2max +4%, lower resting blood pressure."],
    [E("Jog", 4, "30s", "<30% of max speed", group="A"), E("Steady run", 4, "20s", "<60% of max speed", group="A"),
     E("Near-sprint", 4, "10s", ">90% of max speed", group="A"),
     E("Rest between blocks (each block = 5 x 30-20-10; 3-4 blocks)", 3, "2 min")],
    "Gunnarsson TP & Bangsbo J, University of Copenhagen (J Appl Physiol 2012)",
    "https://europepmc.org/article/MED/22556401",
    ("Read from the PubMed abstract via Europe PMC. Abstract: 3 or 4 x 5-min intervals of 30/20/10 s at <30/<60/>90% of "
     "max intensity, 2 min recovery between. 'sets' on the 30-20-10 rows = up to 4 blocks; each block repeats the "
     "30-20-10 cycle 5 times. Warm-up not stated in the abstract."))

# ============================================================ RUNNER STRENGTH (NHS)
add("x-run-newcastle-nhs-runner-strength", "NHS Physio Runner Strength & Flexibility", "fitness", "beginner", "running",
    ["strength", "mobility", "sport-performance"], 35, 3, ["bodyweight", "chair"],
    "An NHS physiotherapy injury-prevention routine for runners: single-leg strength, core and calf work, plus three stretches.",
    "Runners of any level who want a simple home routine to stay injury-free, especially beginners and returners.",
    ["home", "minimal-equipment", "time-efficient"],
    ["Do it 2-3 times a week on easy or non-running days.",
     "3 sets of 3-10 reps unless stated; start at the low end and build.",
     "Progress the bridge to single-leg when double-leg is easy.",
     "Hold the kitchen bench for heel raises; stop anything that causes pain."],
    [E("Bridge (progress to single-leg)", 3, "3-10"), E("Dead bug", 3, "3-10/side"), E("Forward plank", 3, "15-60s"),
     E("Forward lunge", 3, "3-10/leg"), E("Single-leg deadlift", 3, "3-10/leg"),
     E("Single-leg heel raise (straight knee, hold bench)", 3, "3-10/leg"), E("Single-leg heel raise (slight knee bend)", 3, "3-10/leg"),
     E("Squat", 3, "3-10"), E("Single-leg sit to stand (chair)", 3, "3-10/leg"), E("Fire hydrants", 3, "3-10/side"),
     E("Calf stretch (straight knee)", 3, "20s/side"), E("Calf stretch (both knees bent)", 3, "20s/side"),
     E("Seated hamstring stretch", 3, "20s/side")],
    "Newcastle upon Tyne Hospitals NHS Foundation Trust (physiotherapy)",
    "https://www.newcastle-hospitals.nhs.uk/services/injury-prevention-advice-for-runners/",
    ("Free NHS trust page (© Newcastle upon Tyne Hospitals NHS FT). Page sets 3 sets of 3-10 reps, 2-3x/week unless "
     "stated; plank 15-60 s x2-3; stretches ~20 s x3. Exercise names and doses only; credit and link."))

add("x-run-nhs-knee-exercises-runners", "NHS Knee Exercises for Runners", "fitness", "beginner", "running",
    ["strength", "mobility"], 15, 3, ["bodyweight", "wall", "chair"],
    "Five quick NHS knee exercises to use as a running warm-up or cool-down: wall squats, thigh squeezes, hamstring stretch, squats and lunges.",
    "Runners without a current knee injury who want simple knee-strength work they can do anywhere.",
    ["home", "outdoor", "minimal-equipment", "time-efficient", "busy"],
    ["Use before a run as a warm-up or after as a cool-down.",
     "Wall squats and squats have no set dose on the page - do slow, controlled reps you can manage pain-free.",
     "Squat only to a right angle at the knee and keep your back straight.",
     "You shouldn't feel pain; if you do, stop and get advice. Not for people with an existing knee injury."],
    [E("Wall squat (slide down and up)", 1, "slow, controlled reps (no dose set)"),
     E("Seated thigh contraction (hold)", 10, "5s/leg"), E("Hamstring stretch with thigh contraction (chair)", 3, "15s/leg"),
     E("Squat", 1, "slow, controlled reps (no dose set)"), E("Lunge", 3, "5/leg")],
    "NHS", "https://www.nhs.uk/live-well/exercise/knee-exercises-for-runners/",
    "Free NHS guidance (© Crown copyright), reviewed 20 Sep 2024. Names and doses only; where the page gives no dose we say so. Credit and link to NHS.")

# ============================================================ PAT CARROLL – GREAT OCEAN ROAD (2017)
PC_CREDIT = "Pat Carroll (Australian All-Comers half-marathon record holder, 61:11) for the Great Ocean Road Running Festival"
PC_NOTE = ("Free 12-week plan PDF on the official Great Ocean Road Running Festival website (2017 edition); no copyright "
           "or reproduction notice. Effort percentages, reps and recoveries recorded as written; SR = standing recovery, "
           "JR = jog recovery. Pat's notes say every speed session starts with a 10-15 min warm-up jog and ends with a "
           "cool-down jog and stretching. Credit Pat Carroll and link out.")
GOR17 = "https://greatoceanroadrunfest.com.au/wp-content/uploads/2017/02/"
PC_WU = E("Warm-up jog", 1, "10-15 min", "easy")
PC_CD = E("Cool-down jog + stretch", 1, "10 min", "easy")
PC_LS = ["outdoor", "minimal-equipment"]


def pc_how(extra):
    return ["Run out of your comfort zone on the efforts; everything else stays relaxed and conversational.",
            "Hold the same pace from the first rep to the last - if you slow badly, you started too fast.",
            extra,
            "In Pat's plans this is one of two speed/hill sessions a week, with 1-3 rest or cross-training days."]


add("x-run-pat-carroll-15x30-30", "Pat Carroll 15 x 30/30", "run", "beginner", "running",
    ["endurance", "sport-performance"], 40, 4, ["bodyweight"],
    "Fifteen 30-second efforts at 80% with 30-second jog recoveries and an extra minute's jog after rep 10.",
    "Newer half-marathon and 10K runners doing their first structured speed work; also the race-week sharpener in Pat's advanced plans.",
    PC_LS, pc_how("Ideally the first and last fast 30 s cover the same ground."),
    [PC_WU, E("Fast", 15, "30s", "80% effort", group="A"), E("Jog recovery", 14, "30s", group="A"),
     E("Extra jog recovery (after rep 10)", 1, "1 min"), PC_CD],
    PC_CREDIT, GOR17 + "Beginner-Half-Marathon.pdf", PC_NOTE, series="Pat Carroll GOR Plans")

add("x-run-pat-carroll-8x1min", "Pat Carroll 8 x 1 min / 30 s jog", "run", "intermediate", "running",
    ["endurance", "sport-performance"], 40, 5, ["bodyweight"],
    "Eight 1-minute efforts at 80% with only 30 seconds of jogging between, plus a minute's jog at halfway.",
    "Half-marathon and marathon runners in the early weeks of a 12-week block.",
    PC_LS, pc_how("Later in the block this becomes 10 x 1 min (extra jog after rep 5)."),
    [PC_WU, E("Fast", 8, "1 min", "80% effort", group="A"), E("Jog recovery", 7, "30s", group="A"),
     E("Extra jog recovery (between reps 4 and 5)", 1, "1 min"), PC_CD],
    PC_CREDIT, GOR17 + "Advanced-Marathon.pdf", PC_NOTE, series="Pat Carroll GOR Plans")

add("x-run-pat-carroll-6x2min", "Pat Carroll 6 x 2 min / 30 s jog", "run", "intermediate", "running",
    ["endurance", "sport-performance"], 42, 4, ["bodyweight"],
    "Six 2-minute efforts at 80% with short 30-second jog recoveries - a step up from the 1-minute session.",
    "Intermediate half-marathoners mid-block.",
    PC_LS, pc_how("Short recoveries are the point - don't stop and stand."),
    [PC_WU, E("Fast", 6, "2 min", "80% effort", group="A"), E("Jog recovery", 5, "30s", group="A"), PC_CD],
    PC_CREDIT, GOR17 + "Intermediate-Half-Marathon.pdf", PC_NOTE, series="Pat Carroll GOR Plans")

add("x-run-pat-carroll-15-hill-reps", "Pat Carroll 15 Hill Reps", "run", "intermediate", "running",
    ["strength", "endurance", "sport-performance"], 45, 4, ["bodyweight"],
    "Fifteen ~30-second hill reps on a moderate slope, jogging back down, with a 1-minute standing rest after rep 10.",
    "Road runners building strength and form for a half or full marathon (beginners in Pat's plans start with 10 reps).",
    PC_LS, pc_how("Pick a hill you can run quickly all the way up - not so steep you labour. Drive off the balls of the feet, knees up, shoulders relaxed."),
    [PC_WU, E("Hill rep (moderate slope)", 15, "~30s", "strong, same speed throughout"), E("Jog back down (recovery)", 14, "walk/jog down"),
     E("Standing recovery (after rep 10)", 1, "1 min"), PC_CD],
    PC_CREDIT, GOR17 + "Advanced-Half-Marathon.pdf", PC_NOTE, series="Pat Carroll GOR Plans")

add("x-run-pat-carroll-aba-4x4", "Pat Carroll A-B-A 4 x 4 min", "run", "intermediate", "running",
    ["endurance", "sport-performance"], 45, 4, ["bodyweight"],
    "Out-and-back pacing reps: run 2 minutes out at 80%, turn, and try to arrive back at the start at exactly 4 minutes. 45 s standing rest.",
    "Half and full marathoners learning even pacing without a GPS watch.",
    PC_LS, pc_how("Back too early? You went out too slow. Not back in 4 min? Too fast. Aim for an even out-and-back."),
    [PC_WU, E("A-B-A rep: 2 min out + 2 min back", 4, "4 min", "80% effort", group="A"),
     E("Standing recovery", 3, "45s", group="A"), PC_CD],
    PC_CREDIT, GOR17 + "Advanced-Half-Marathon.pdf", PC_NOTE, series="Pat Carroll GOR Plans")

add("x-run-pat-carroll-aba-5-5-10", "Pat Carroll A-B-A 5 + 5 + 10", "run", "advanced", "running",
    ["endurance", "sport-performance"], 45, 5, ["bodyweight"],
    "Two 5-minute efforts out at 75% (30 s rest between), then a non-stop return at 80% - try to pass the start before 10 minutes.",
    "Experienced half-marathoners practising a negative-split, progressive effort.",
    PC_LS, pc_how("The return leg has to be quicker than the outward 10 minutes - that's the test."),
    [PC_WU, E("Run out", 1, "5 min", "75% effort"), E("Standing recovery", 1, "30s"), E("Run out", 1, "5 min", "75% effort"),
     E("Standing recovery", 1, "1 min"), E("Return to start without stopping", 1, "≤10 min", "80% effort"), PC_CD],
    PC_CREDIT, GOR17 + "Advanced-Half-Marathon.pdf", PC_NOTE, series="Pat Carroll GOR Plans")

add("x-run-pat-carroll-6x500", "Pat Carroll 6 x 500 m", "run", "beginner", "running",
    ["endurance", "sport-performance"], 40, 4, ["bodyweight", "track or measured route"],
    "Six 500 m efforts at 80% with 1-minute standing recoveries - the beginner half plan's measured session.",
    "Newer half-marathoners in week 6 of a 12-week plan (advanced runners do 8 x 500 m).",
    PC_LS, pc_how("By the sixth rep you should be starting to tire, not dying."),
    [PC_WU, E("500 m effort", 6, "1", "80% effort", "500 m", group="A"), E("Standing recovery", 5, "1 min", group="A"), PC_CD],
    PC_CREDIT, GOR17 + "Beginner-Half-Marathon.pdf", PC_NOTE, series="Pat Carroll GOR Plans")

add("x-run-pat-carroll-5x1km", "Pat Carroll 5 x 1 km", "run", "advanced", "running",
    ["endurance", "sport-performance"], 50, 5, ["bodyweight", "track or measured route"],
    "Five 1 km reps at 80% with just 1 minute of standing recovery.",
    "Experienced half and full marathoners (beginners in Pat's plans do 4 x 1 km).",
    PC_LS, pc_how("Use the 1 km splits to help set a realistic goal pace for your race."),
    [PC_WU, E("1 km effort", 5, "1", "80% effort", "1 km", group="A"), E("Standing recovery", 4, "1 min", group="A"), PC_CD],
    PC_CREDIT, GOR17 + "Advanced-Half-Marathon.pdf", PC_NOTE, series="Pat Carroll GOR Plans")

add("x-run-pat-carroll-3km-time-trial", "Pat Carroll 3 km Time Trial", "run", "intermediate", "running",
    ["endurance", "sport-performance"], 35, 4, ["bodyweight", "track or measured route"],
    "A solo 3 km time trial used mid-plan to gauge fitness and set a realistic race goal.",
    "Runners mid-way through a half or full marathon block (also used by Pat's beginner plans in week 8).",
    PC_LS, pc_how("Run it as an even, hard effort - like a race - on a flat, measured course."),
    [PC_WU, E("3 km time trial", 1, "1", "race effort, even pace", "3 km"), PC_CD],
    PC_CREDIT, GOR17 + "Advanced-Half-Marathon.pdf", PC_NOTE, series="Pat Carroll GOR Plans")

add("x-run-pat-carroll-long-run-walk-breaks", "Pat Carroll 1 hr 40 Long Run with Walk Breaks", "run", "beginner", "running",
    ["endurance"], 100, 4, ["bodyweight"],
    "A 100-minute comfortable long run with a 1-minute walk every 20 minutes - the beginner half-marathon peak long run.",
    "First-time half-marathoners in the final month of training.",
    PC_LS, pc_how("Run to time, not distance - your longest run doesn't need to cover the race distance."),
    [E("Comfortable run", 5, "19 min", "conversational", group="A"), E("Walk break", 4, "1 min", group="A")],
    PC_CREDIT, GOR17 + "Beginner-Half-Marathon.pdf", PC_NOTE, series="Pat Carroll GOR Plans")

add("x-run-pat-carroll-long-run-hmp-finish", "Pat Carroll 1 hr 40 Long Run, Last 4 km at Half Pace", "run", "advanced", "running",
    ["endurance", "sport-performance"], 100, 5, ["bodyweight"],
    "A 100-minute long run, comfortable throughout except the final 4 km at goal half-marathon pace.",
    "Experienced half-marathoners chasing a time goal.",
    PC_LS, pc_how("Only the last 4 km is at goal pace - resist speeding up earlier."),
    [E("Comfortable run", 1, "~80 min", "conversational"), E("Goal half-marathon pace", 1, "1", "goal HM pace", "4 km")],
    PC_CREDIT, GOR17 + "Advanced-Half-Marathon.pdf", PC_NOTE, series="Pat Carroll GOR Plans")

add("x-run-pat-carroll-3hr-long-run-mp-finish", "Pat Carroll 3 hr Long Run, Last 5 km at Marathon Pace", "run", "advanced", "running",
    ["endurance", "sport-performance"], 180, 5, ["bodyweight"],
    "The advanced marathon peak: three hours comfortable with the final 5 km at goal marathon pace.",
    "Experienced marathoners in the peak weeks of a 12-week block.",
    PC_LS, pc_how("Practise race-day fuel and drinks on this run."),
    [E("Comfortable run", 1, "~2 hr 35 min", "conversational"), E("Goal marathon pace", 1, "1", "goal marathon pace", "5 km")],
    PC_CREDIT, GOR17 + "Advanced-Marathon.pdf", PC_NOTE, series="Pat Carroll GOR Plans")

# ============================================================ DR KELLIE ANGEL – RACV SOLAR MARATHON PLAN (GOR 2023)
KA_CREDIT = "Dr Kellie Angel, Endurance Edge (Athletics Australia Level 3 Recreational Running Coach) – Great Ocean Road Running Festival"
KA_URL = "https://greatoceanroadrunfest.com.au/wp-content/uploads/2023/03/RACV-SOLAR-MARATHON-TRAINING-PLAN-5.pdf"
KA_NOTE = ("Free 12-week marathon plan PDF on the official Great Ocean Road Running Festival website; no copyright or "
           "reproduction notice. Plan assumes medical clearance, 40-50 km/week and a recent half marathon. 'Float' = "
           "steady running recovery, not walking. The plan says to warm up and cool down for every quality session but "
           "doesn't set lengths. Credit Dr Kellie Angel / Endurance Edge and link out.")
KA_WU = E("Warm-up jog (length not set in plan)", 1, "10-15 min", "easy")
KA_CD = E("Cool-down jog (length not set in plan)", 1, "10 min", "easy")
KA_WHO = "Marathoners already running 40-50 km a week with a recent half marathon, in a 12-week build."
KA_LS = ["outdoor", "minimal-equipment"]


def ka_how(extra):
    return ["One of two quality sessions a week (Tuesday/Thursday in the plan), with a long slow run on Saturday.",
            "Floats are steady running, a little slower than the efforts - keep moving.",
            extra,
            "Cut reps or distance if the first week feels too hard; the half marathon may suit you better."]


add("x-run-kellie-angel-10x30-fartlek", "Kellie Angel 10 x 30 s Fartlek", "run", "intermediate", "running",
    ["endurance", "sport-performance"], 35, 5, ["bodyweight"],
    "Ten 30-second surges, each followed by a 30-second float.",
    KA_WHO, KA_LS, ka_how("Week 3 doubles the reps to 60 s with 60 s floats; week 4 uses 60 s on / 30 s float."),
    [KA_WU, E("Surge", 10, "30s", "hard but controlled", group="A"), E("Float", 10, "30s", "steady", group="A"), KA_CD],
    KA_CREDIT, KA_URL, KA_NOTE, series="RACV Solar Marathon Plan (Kellie Angel)")

add("x-run-kellie-angel-8x2min-fartlek", "Kellie Angel 8 x 2 min Fartlek", "run", "advanced", "running",
    ["endurance", "sport-performance"], 45, 5, ["bodyweight"],
    "Eight 2-minute efforts with 60-second floats (week 7 version: 10 x 2 min with 30 s floats).",
    KA_WHO, KA_LS, ka_how("Aim for even efforts - the last rep should match the first."),
    [KA_WU, E("Effort", 8, "2 min", "hard, sustainable", group="A"), E("Float", 8, "60s", "steady", group="A"), KA_CD],
    KA_CREDIT, KA_URL, KA_NOTE, series="RACV Solar Marathon Plan (Kellie Angel)")

add("x-run-kellie-angel-pyramid", "Kellie Angel 1-2-3-4-3-2-1 Pyramid", "run", "advanced", "running",
    ["endurance", "sport-performance"], 50, 5, ["bodyweight"],
    "A time pyramid of 1, 2, 3, 4, 3, 2 and 1-minute efforts, each with the same time as recovery.",
    KA_WHO, KA_LS, ka_how("Run the longer reps slightly slower than the short ones."),
    [KA_WU, E("Effort", 1, "1 min"), E("Recovery", 1, "1 min"), E("Effort", 1, "2 min"), E("Recovery", 1, "2 min"),
     E("Effort", 1, "3 min"), E("Recovery", 1, "3 min"), E("Effort", 1, "4 min"), E("Recovery", 1, "4 min"),
     E("Effort", 1, "3 min"), E("Recovery", 1, "3 min"), E("Effort", 1, "2 min"), E("Recovery", 1, "2 min"),
     E("Effort", 1, "1 min"), KA_CD],
    KA_CREDIT, KA_URL, KA_NOTE, series="RACV Solar Marathon Plan (Kellie Angel)")

add("x-run-kellie-angel-telford-fartlek", "Kellie Angel Telford Fartlek", "run", "advanced", "running",
    ["endurance", "sport-performance"], 45, 5, ["bodyweight"],
    "A descending fartlek: 1 x 4 min, 2 x 3 min, 3 x 2 min and 4 x 1 min, all with 60-second recoveries.",
    KA_WHO, KA_LS, ka_how("Let the pace rise as the reps get shorter."),
    [KA_WU, E("Effort", 1, "4 min"), E("Effort", 2, "3 min"), E("Effort", 3, "2 min"), E("Effort", 4, "1 min"),
     E("Recovery after each effort", 9, "60s"), KA_CD],
    KA_CREDIT, KA_URL, KA_NOTE, series="RACV Solar Marathon Plan (Kellie Angel)")

add("x-run-kellie-angel-table-top", "Kellie Angel Table-Top 1-3-3-1", "run", "advanced", "running",
    ["endurance", "sport-performance"], 35, 5, ["bodyweight"],
    "A short 'table-top' set of 1, 3, 3 and 1-minute efforts with equal recovery - the pre-race-week sharpener.",
    KA_WHO, KA_LS, ka_how("Two weeks out from race day: sharp, not exhausting."),
    [KA_WU, E("Effort", 1, "1 min"), E("Recovery", 1, "1 min"), E("Effort", 2, "3 min", group="A"), E("Recovery", 2, "3 min", group="A"),
     E("Effort", 1, "1 min"), KA_CD],
    KA_CREDIT, KA_URL, KA_NOTE, series="RACV Solar Marathon Plan (Kellie Angel)")

add("x-run-kellie-angel-60s-hill-repeats", "Kellie Angel 8-10 x 60 s Hill Repeats", "run", "advanced", "running",
    ["strength", "endurance", "sport-performance"], 45, 5, ["bodyweight"],
    "Eight to ten 60-second hill repeats (the plan builds from 30 s to 45 s to 60 s over six weeks).",
    KA_WHO, KA_LS, ka_how("Jog back down for recovery; keep form tall and quick."),
    [KA_WU, E("Hill repeat (uphill)", 10, "60s", "strong"), E("Jog down recovery", 10, "jog down"), KA_CD],
    KA_CREDIT, KA_URL, KA_NOTE, series="RACV Solar Marathon Plan (Kellie Angel)")

add("x-run-kellie-angel-u-shaped-hills", "Kellie Angel U-shaped Hill Reps", "run", "advanced", "running",
    ["strength", "endurance", "sport-performance"], 45, 5, ["bodyweight"],
    "Four to six reps that run down one side of a dip and up the other - practice for hilly courses like the Great Ocean Road.",
    KA_WHO, ["outdoor", "minimal-equipment"], ka_how("Run the downhill relaxed and quick; drive the uphill."),
    [KA_WU, E("U-shaped rep: downhill then uphill", 6, "1", "strong"), E("Easy jog recovery", 6, "to start point"), KA_CD],
    KA_CREDIT, KA_URL, KA_NOTE, series="RACV Solar Marathon Plan (Kellie Angel)")

add("x-run-kellie-angel-8km-race-pace", "Kellie Angel 2-8-2 km Marathon-Pace Tempo", "run", "advanced", "running",
    ["endurance", "sport-performance"], 70, 5, ["bodyweight"],
    "2 km easy, 8 km at marathon race pace, 2 km easy (builds from 4 km and 6 km in earlier weeks).",
    KA_WHO, KA_LS, ka_how("Lock into goal pace early and hold it - no faster."),
    [E("Easy", 1, "1", "easy", "2 km"), E("Marathon race pace", 1, "1", "goal marathon pace", "8 km"), E("Easy", 1, "1", "easy", "2 km")],
    KA_CREDIT, KA_URL, KA_NOTE, series="RACV Solar Marathon Plan (Kellie Angel)")

add("x-run-kellie-angel-progressive-run", "Kellie Angel Progressive Run to Race Pace", "run", "advanced", "running",
    ["endurance", "sport-performance"], 45, 5, ["bodyweight"],
    "A 6-8 km run that starts easy and builds steadily to marathon race pace by the end.",
    KA_WHO, KA_LS, ka_how("Speed up gradually every kilometre or two - finish at goal pace, not faster."),
    [E("Progressive run (easy building to race pace)", 1, "1", "easy → goal marathon pace", "6-8 km")],
    KA_CREDIT, KA_URL, KA_NOTE, series="RACV Solar Marathon Plan (Kellie Angel)")

add("x-run-kellie-angel-surge-hills", "Kellie Angel 8 km Hilly Surge Run", "run", "advanced", "running",
    ["strength", "endurance"], 50, 5, ["bodyweight"],
    "An 8 km run on a hilly route: surge up every hill, recover on the downs and flats.",
    KA_WHO, ["outdoor", "minimal-equipment"], ka_how("Pick a rolling loop; trails work too."),
    [E("Hilly run - surge the hills, recover downs and flats", 1, "1", "surge uphill, easy elsewhere", "8 km")],
    KA_CREDIT, KA_URL, KA_NOTE, series="RACV Solar Marathon Plan (Kellie Angel)")

add("x-run-kellie-angel-lsd-32km", "Kellie Angel 32 km Long Slow Distance", "run", "advanced", "running",
    ["endurance"], 190, 5, ["bodyweight"],
    "A 32 km long slow distance run at a pace where you can still talk (the plan peaks at 36 km for the 44 km GOR marathon).",
    KA_WHO, KA_LS, ka_how("Resist running it fast - save speed for the quality days. Practise fuelling."),
    [E("Long slow distance run", 1, "1", "conversational", "32 km")],
    KA_CREDIT, KA_URL, KA_NOTE, series="RACV Solar Marathon Plan (Kellie Angel)")

# ============================================================ KIESER 'STRENGTH TO RUN' (GOR 2022)
KI_CREDIT = "Kieser physiotherapists & exercise physiologists (Paul Percy, Josh Miller) – Strength to Run, Great Ocean Road Running Festival"
KI_NOTE = ("Free program booklet (PDF) on the official Great Ocean Road Running Festival website (2022); no copyright or "
           "reproduction notice. Kieser pairs each week with 2 strength sessions (not detailed in the booklet - do the "
           "Somax or NHS runner strength sessions). Run sessions recorded as written; credit and link out.")
GOR22 = "https://greatoceanroadrunfest.com.au/wp-content/uploads/2022/03/"

add("x-run-kieser-3x2km-10k-pace", "Kieser 3 x 2 km at 10K Pace", "run", "advanced", "running",
    ["endurance", "sport-performance"], 55, 4, ["bodyweight"],
    "2 km warm-up, three 2 km reps at 10K pace with 500 m floats at long-run pace, 2 km cool-down.",
    "Marathoners (Kieser marathon program) or strong 10K-half runners.",
    ["outdoor", "minimal-equipment"],
    ["Done every second week in the marathon block, alternating with the 6 x 3 min session.",
     "Floats are running, not walking - long-run pace.",
     "Two strength sessions a week sit alongside the running.",
     "Total ~11.5 km."],
    [E("Warm-up", 1, "1", "easy", "2 km"), E("Rep", 3, "1", "10K pace", "2 km", group="A"),
     E("Float", 2, "1", "long-run pace", "500 m", group="A"), E("Cool-down", 1, "1", "easy", "2 km")],
    KI_CREDIT, GOR22 + "Running-program_Marathon-GORRF.pdf", KI_NOTE, series="Kieser Strength to Run")

add("x-run-kieser-6x3min", "Kieser 6 x 3 min Faster than 5K Pace", "run", "advanced", "running",
    ["endurance", "sport-performance"], 50, 4, ["bodyweight"],
    "Six 3-minute efforts quicker than 5K pace with 1-minute floats, made up to 10 km with warm-up and cool-down.",
    "Experienced marathoners and half-marathoners wanting VO2max work inside a marathon block.",
    ["outdoor", "minimal-equipment"],
    ["Alternates weekly with 3 x 2 km at 10K pace.",
     "Floats are steady long-run pace - keep moving.",
     "Warm up and cool down enough to total ~10 km.",
     "Skip it in a down week if legs are heavy."],
    [E("Warm-up jog", 1, "1", "easy", "~2.5 km"), E("Effort", 6, "3 min", "faster than 5K pace", group="A"),
     E("Float", 5, "1 min", "long-run pace", group="A"), E("Cool-down jog (to make 10 km total)", 1, "1", "easy", "~2.5 km")],
    KI_CREDIT, GOR22 + "Running-program_Marathon-GORRF.pdf", KI_NOTE, series="Kieser Strength to Run")

add("x-run-kieser-28km-mgp-sandwich", "Kieser 28 km with 8 km at Marathon Goal Pace", "run", "advanced", "running",
    ["endurance", "sport-performance"], 160, 4, ["bodyweight"],
    "A 28 km long run: 10 km easy, 8 km at marathon goal pace, 10 km easy.",
    "Marathoners mid-block who want race-pace practice on tired legs.",
    ["outdoor", "minimal-equipment"],
    ["Week 6 of the Kieser marathon program; previous long runs reached 24 km.",
     "Hold goal pace exactly - this is rehearsal, not a race.",
     "Practise race fuel and drinks.",
     "Easy the day before and after."],
    [E("Easy", 1, "1", "easy", "10 km"), E("Marathon goal pace", 1, "1", "goal marathon pace", "8 km"), E("Easy", 1, "1", "easy", "10 km")],
    KI_CREDIT, GOR22 + "Running-program_Marathon-GORRF.pdf", KI_NOTE, series="Kieser Strength to Run")

add("x-run-kieser-6x400-5k-pace", "Kieser 6 x 400 m at 5K Pace", "run", "intermediate", "running",
    ["endurance", "sport-performance"], 30, 4, ["bodyweight", "track or measured route"],
    "The race-week sharpener: 2 km warm-up, six 400 m reps at 5K pace with 200 m walk/jog, 1 km cool-down.",
    "Any runner in the final week before a half or full marathon; also a good intro to 400s.",
    ["outdoor", "minimal-equipment", "time-efficient"],
    ["Used in race week of the Kieser marathon program.",
     "5K pace, not faster - it should feel sharp, not hard.",
     "Walk or jog the 200 m recoveries.",
     "Follow with easy days before the race."],
    [E("Warm-up", 1, "1", "easy", "2 km"), E("Rep", 6, "1", "5K pace", "400 m", group="A"),
     E("Walk/jog recovery", 5, "1", "easy", "200 m", group="A"), E("Cool-down", 1, "1", "easy", "1 km")],
    KI_CREDIT, GOR22 + "Running-program_Marathon-GORRF.pdf", KI_NOTE, series="Kieser Strength to Run")

add("x-run-kieser-tempo-ladder", "Kieser 8-6-4-2 Tempo Ladder", "run", "intermediate", "running",
    ["endurance", "sport-performance"], 40, 4, ["bodyweight"],
    "Tempo efforts of 8, 6, 4 and 2 minutes with 2-minute recoveries, between 5-minute warm-up and cool-down.",
    "10-14 km runners (Kieser 14 km program) building threshold.",
    ["outdoor", "minimal-equipment", "time-efficient"],
    ["Tempo = comfortably hard, a few words at a time.",
     "You can lift the pace slightly as the efforts shorten.",
     "Recover with easy jogging.",
     "Earlier weeks use 4 x 5 min; later weeks 3 x 10 min."],
    [E("Warm-up jog", 1, "5 min"), E("Tempo effort", 1, "8 min", "comfortably hard"), E("Tempo effort", 1, "6 min", "comfortably hard"),
     E("Tempo effort", 1, "4 min", "comfortably hard"), E("Tempo effort", 1, "2 min", "comfortably hard"),
     E("Recovery jog between efforts", 3, "2 min"), E("Cool-down jog", 1, "5 min")],
    KI_CREDIT, GOR22 + "Running-program_14km-GORRF.pdf", KI_NOTE, series="Kieser Strength to Run")

add("x-run-kieser-3x10-tempo", "Kieser 3 x 10 min Tempo", "run", "intermediate", "running",
    ["endurance", "sport-performance"], 46, 4, ["bodyweight"],
    "Three 10-minute tempo efforts with 3-minute recoveries.",
    "10-14 km and half-marathon runners late in a build.",
    ["outdoor", "minimal-equipment"],
    ["Tempo = comfortably hard; you should finish feeling you could do one more.",
     "Jog the recoveries.",
     "Once a week at most, with easy runs either side.",
     "The 8-6-4-2 ladder is the lighter version."],
    [E("Warm-up jog", 1, "5 min"), E("Tempo effort", 3, "10 min", "comfortably hard", group="A"),
     E("Recovery jog", 2, "3 min", group="A"), E("Cool-down jog", 1, "5 min")],
    KI_CREDIT, GOR22 + "Running-program_14km-GORRF.pdf", KI_NOTE, series="Kieser Strength to Run")

add("x-run-kieser-walk-jog-run-fartlek", "Kieser Walk-Jog-Run Fartlek", "run", "beginner", "running",
    ["endurance", "general-fitness"], 30, 4, ["bodyweight"],
    "A playful beginner fartlek: 20 minutes freely mixing walking, jogging and running, between 5-minute warm-up and cool-down.",
    "Newer runners on a 10-14 km plan who want variety without strict intervals.",
    ["outdoor", "minimal-equipment", "time-efficient"],
    ["No set structure - run to a tree, jog to the corner, walk when you need to.",
     "Earlier weeks use 15 minutes; build to 20.",
     "Keep the 'run' bits brisk but relaxed.",
     "Later the plan switches to structured 8-10 x (2 min run, 1 min jog)."],
    [E("Warm-up walk/jog", 1, "5 min"), E("Free fartlek: alternate walk, jog and run", 1, "20 min", "by feel"), E("Cool-down walk/jog", 1, "5 min")],
    KI_CREDIT, GOR22 + "Running-program_14km-GORRF.pdf", KI_NOTE, series="Kieser Strength to Run")

add("x-run-kieser-jog-strides", "Kieser 20 min Jog + 6 x 100 m Strides", "run", "beginner", "running",
    ["endurance", "sport-performance"], 28, 4, ["bodyweight"],
    "A pre-race shakeout: 20 minutes easy, then six 100 m strides with walk-back recovery.",
    "Any runner 1-2 days before a race (used in race week of the Kieser 14 km and marathon programs).",
    ["outdoor", "minimal-equipment", "time-efficient", "busy"],
    ["Strides are smooth and quick, not sprints.",
     "Walk back to the start between strides.",
     "Keep it short - you want fresh legs on race day.",
     "Also useful any week as a light day."],
    [E("Easy jog", 1, "20 min", "easy"), E("Stride", 6, "1", "fast, relaxed", "100 m"), E("Walk-back recovery", 6, "1", "walk", "100 m")],
    KI_CREDIT, GOR22 + "Running-program_Marathon-GORRF.pdf", KI_NOTE, series="Kieser Strength to Run")

# ============================================================ DINNEEN RUNNERS x BROOKS (GOR 2023)
DB_CREDIT = "Dinneen Runners x Brooks Running – Great Ocean Road Running Festival"
DB_NOTE = ("Free program PDFs on the official Great Ocean Road Running Festival website (2023); no copyright or "
           "reproduction notice. Dinneen Runners is the festival's training-camp coaching group (Steve Dinneen, 2018 "
           "GOR half-marathon winner). Paces written relative to your 5K target or 10K/14K race pace. Credit and link out.")
GOR23 = "https://greatoceanroadrunfest.com.au/wp-content/uploads/2023/03/"
DB_5K = GOR23 + "Brooks-Running-X-Dinneen-5km-run-program.pdf"
DB_14B = GOR23 + "Dinneen-Brooks-14km-Beginners-run-program-1.pdf"
DB_14I = GOR23 + "Dinneen-Brooks-14km-Intermediate-run-program.pdf"
DB_STRIDES = [E("Easy jog", 1, "10 min"), E("Break", 1, "2 min"), E("Relaxed stride (walk back)", 4, "1", "70-80% effort", "80 m")]


def db_how(extra):
    return ["Easy jogs should let you chat; 'pick-up' pace is 10-15 s/km faster than easy.",
            "Run efforts on flat ground - bike path, athletics track or oval.",
            extra,
            "Days off are part of the plan; swap days around to suit your week."]


add("x-run-dinneen-strides-session", "Dinneen 10 min Jog + 4 x 80 m Strides", "run", "beginner", "running",
    ["endurance", "general-fitness"], 26, 5, ["bodyweight"],
    "10 minutes easy, a 2-minute break, four relaxed 80 m strides with walk-back recovery, then another 10 minutes easy.",
    "Beginners in the first weeks of a 12-week 5 km plan, learning to run tall and smooth.",
    ["outdoor", "minimal-equipment", "time-efficient"], db_how("Strides are 70-80% effort - fast feet, relaxed shoulders."),
    DB_STRIDES + [E("Easy jog", 1, "10 min")],
    DB_CREDIT, DB_5K, DB_NOTE, series="Dinneen x Brooks GOR Plans")

add("x-run-dinneen-4x5min-5k-pace", "Dinneen 4 x 5 min at 5K Target Pace", "run", "beginner", "running",
    ["endurance", "sport-performance"], 45, 5, ["bodyweight"],
    "Strides, then four 5-minute efforts at your 5K target pace with 2-minute walk recoveries.",
    "Beginners about a month into a 5 km plan with a time goal (e.g. 25:00 = 5:00/km).",
    ["outdoor", "minimal-equipment"], db_how("Earlier weeks: 2 then 3 x 6 min; week 6 lengthens the warm-up jog to 15 min."),
    DB_STRIDES + [E("Effort", 4, "5 min", "5K target pace (e.g. 5:00-5:05/km for a 25:00 goal)", group="A"),
                  E("Walk recovery", 3, "2 min", group="A"), E("Cool-down easy jog", 1, "10 min")],
    DB_CREDIT, DB_5K, DB_NOTE, series="Dinneen x Brooks GOR Plans")

add("x-run-dinneen-3x10min", "Dinneen 3 x 10 min at 5K Pace + 10 s", "run", "beginner", "running",
    ["endurance", "sport-performance"], 60, 5, ["bodyweight"],
    "Strides, then three 10-minute efforts just slower than 5K target pace (+10 s/km), 2-minute walks between.",
    "5 km plan runners in weeks 7-8 building stamina at near-race pace.",
    ["outdoor", "minimal-equipment"], db_how("For a 25:00 goal, the efforts are at 5:10/km."),
    [E("Easy jog", 1, "15 min"), E("Break", 1, "2 min"), E("Stride (walk back)", 4, "1", "70-80% effort", "80 m"),
     E("Effort", 3, "10 min", "5K target pace + 10 s/km", group="A"), E("Walk recovery", 2, "2 min", group="A"),
     E("Cool-down easy jog", 1, "10 min")],
    DB_CREDIT, DB_5K, DB_NOTE, series="Dinneen x Brooks GOR Plans")

add("x-run-dinneen-15min-plus-1min-reps", "Dinneen 15 min Tempo + 2 x 1 min", "run", "beginner", "running",
    ["endurance", "sport-performance"], 55, 5, ["bodyweight"],
    "A 15-minute effort at 5K target pace +15 s/km, 4 minutes' rest, then two 1-minute reps 5-10 s/km faster than 5K target.",
    "5 km plan runners in the last month, mixing stamina with a taste of race-speed.",
    ["outdoor", "minimal-equipment"], db_how("Taper weeks swap to 10 min + 2-3 x 1 min."),
    [E("Easy jog", 1, "15 min"), E("Break", 1, "2 min"), E("Stride (walk back)", 4, "1", "70-80% effort", "80 m"),
     E("Sustained effort", 1, "15 min", "5K target pace + 15 s/km"), E("Break", 1, "4 min"),
     E("Fast rep", 2, "1 min", "5-10 s/km faster than 5K target", group="A"), E("Walk", 1, "1 min", group="A"),
     E("Cool-down", 1, "10 min")],
    DB_CREDIT, DB_5K, DB_NOTE, series="Dinneen x Brooks GOR Plans")

add("x-run-dinneen-5x4min-10k-pace", "Dinneen 5 x 4 min at 10K Pace", "run", "beginner", "running",
    ["endurance", "sport-performance"], 55, 4, ["bodyweight"],
    "15-minute jog warm-up, five 4-minute efforts at 10K pace with 1-minute walk recoveries, 15-minute cool-down.",
    "Runners starting a 10-week 14 km plan (used in both the beginner and intermediate versions).",
    ["outdoor", "minimal-equipment"], db_how("The plan grows this to 4-5 x 5 min, then 5 x 6 min."),
    [E("Warm-up jog", 1, "15 min"), E("Effort", 5, "4 min", "10K pace", group="A"), E("Walk recovery", 4, "1 min", group="A"),
     E("Cool-down jog", 1, "15 min")],
    DB_CREDIT, DB_14B, DB_NOTE, series="Dinneen x Brooks GOR Plans")

add("x-run-dinneen-8x1min-hills", "Dinneen 8 x 1 min Hill Reps", "run", "beginner", "running",
    ["strength", "endurance"], 45, 4, ["bodyweight"],
    "Eight 1-minute hill reps at a strong (not flat-out) effort on a steady incline, jogging back down.",
    "14 km and 10K runners building leg strength for a hilly course.",
    ["outdoor", "minimal-equipment"], db_how("You only need a steady incline, not a steep hill. Beginners start at 7 reps."),
    [E("Warm-up jog", 1, "15 min"), E("Hill rep", 8, "1 min", "strong, not flat out"), E("Jog-down recovery", 8, "jog down"),
     E("Cool-down jog", 1, "15 min")],
    DB_CREDIT, DB_14B, DB_NOTE, series="Dinneen x Brooks GOR Plans")

add("x-run-dinneen-5x90s-hills", "Dinneen 5 x 90 s Hill Reps", "run", "intermediate", "running",
    ["strength", "endurance", "sport-performance"], 45, 5, ["bodyweight"],
    "Five longer 90-second hill reps at a strong effort with jog-down recoveries.",
    "Intermediate 14 km runners who have done the 8 x 1 min hills.",
    ["outdoor", "minimal-equipment"], db_how("Hold your form at the top - that's where the race is won on the Great Ocean Road."),
    [E("Warm-up jog", 1, "15 min"), E("Hill rep", 5, "90s", "strong, not flat out"), E("Jog-down recovery", 5, "jog down"),
     E("Cool-down jog", 1, "15 min")],
    DB_CREDIT, DB_14I, DB_NOTE, series="Dinneen x Brooks GOR Plans")

add("x-run-dinneen-4x8min-race-pace", "Dinneen 4 x 8 min at 14K Race Pace", "run", "intermediate", "running",
    ["endurance", "sport-performance"], 60, 5, ["bodyweight"],
    "Four 8-minute efforts at goal 14 km (10-15 km) race-pace effort with 2-minute walk or slow-jog recoveries.",
    "Intermediate runners in the final month before a 12-15 km race such as City2Surf or the GOR 14 km.",
    ["outdoor", "minimal-equipment"], db_how("Beginners do 3 x 8 min. Race week drops to 2 x 5 min."),
    [E("Warm-up jog", 1, "15 min"), E("Effort", 4, "8 min", "14 km race-pace effort", group="A"),
     E("Walk or slow-jog recovery", 3, "2 min", group="A"), E("Cool-down jog", 1, "10 min")],
    DB_CREDIT, DB_14I, DB_NOTE, series="Dinneen x Brooks GOR Plans")

add("x-run-dinneen-long-run-pickup", "Dinneen 16 km Long Run with Pick-up Finish", "run", "intermediate", "running",
    ["endurance"], 100, 5, ["bodyweight"],
    "A 16 km easy long run, lifting the pace slightly (10-15 s/km faster than easy) over the last 3-4 km.",
    "Intermediate 14 km - half-marathon runners at the peak of a 10-week plan.",
    ["outdoor", "minimal-equipment"], db_how("Weekly long runs in the plan range 12-16 km; parkrun can replace a short easy run."),
    [E("Easy long run", 1, "1", "easy, chatty", "12-13 km"), E("Pick-up finish", 1, "1", "10-15 s/km faster than easy", "3-4 km")],
    DB_CREDIT, DB_14I, DB_NOTE, series="Dinneen x Brooks GOR Plans")

# ============================================================ THE 440 – rebel x 440 CITY2SURF OFFICIAL PROGRAM 2023
R4_CREDIT = "The 440 Running Club (Todd Liubinskas & Trent Knox) – rebel x 440 City2Surf Official Training Program"
R4_URL = ("https://www.rebelsport.com.au/on/demandware.static/-/Library-Sites-rebel-shared-library/default/"
          "dwe52ea364/downloads/City2Surf-TrainingProgram.pdf")
R4_NOTE = ("Free 2023 official City2Surf training program PDF from rebel (with adidas) and The 440 Running Club, Bondi; "
           "no copyright or reproduction notice. Efforts are easy / moderate / hard as written (no paces). Commercial "
           "partnership - credit The 440 and link out; don't imply endorsement.")
R4_WU = E("440 warm-up: 3 min run, then 20 s each of high skips, high knees, walking lunges, hamstring stretch, butt kicks, straight-leg kicks", 2, "1 round")
R4_LS = ["outdoor", "minimal-equipment"]


def r4_how(extra):
    return ["Do the 440 warm-up before every run day.",
            "Easy = chatty, moderate = a few sentences, hard = a few words.",
            extra,
            "Rest/recovery days: an hour of stretching, yoga or massage, or 15 min stretching per 45 min of training."]


add("x-run-440-dynamic-warm-up", "The 440 Runner Warm-up", "run", "beginner", "running",
    ["mobility", "sport-performance"], 10, 4, ["bodyweight"],
    "The City2Surf program's warm-up: a 3-minute run then six 20-second drills, twice through.",
    "Any runner who wants a quick, structured warm-up before a run or race.",
    ["outdoor", "minimal-equipment", "time-efficient", "busy"],
    r4_how("Use it before every run in the program (Mon/Wed/Fri/Sun)."),
    [E("Easy run", 2, "3 min", group="A"), E("High skips", 2, "20s", group="A"), E("High knees", 2, "20s", group="A"),
     E("Walking lunges", 2, "20s", group="A"), E("Hamstring stretches", 2, "20s", group="A"), E("Butt kicks", 2, "20s", group="A"),
     E("Straight-leg kicks", 2, "20s", group="A")],
    R4_CREDIT, R4_URL, R4_NOTE, series="rebel x 440 City2Surf Program")

add("x-run-440-descending-splits", "The 440 10-8-6 Interval Splits", "run", "beginner", "running",
    ["endurance", "general-fitness"], 35, 4, ["bodyweight"],
    "Three runs that get shorter and harder: 10 minutes easy, 8 minutes moderate, 6 minutes harder, with 2-minute rests.",
    "Beginners in phase 1 of a 12-week 14 km (City2Surf) plan.",
    R4_LS, r4_how("Only the last 6 minutes should feel hard."),
    [R4_WU, E("Run", 1, "10 min", "easy"), E("Rest", 1, "2 min"), E("Run", 1, "8 min", "moderate"), E("Rest", 1, "2 min"),
     E("Run", 1, "6 min", "harder")],
    R4_CREDIT, R4_URL, R4_NOTE, series="rebel x 440 City2Surf Program")

add("x-run-440-40min-stage-run", "The 440 40-min Stage Run", "run", "beginner", "running",
    ["endurance", "fat-loss", "general-fitness"], 45, 4, ["bodyweight"],
    "A 40-minute run in 5-minute stages, alternating easy/moderate and harder, finishing with a 5-minute slow jog.",
    "Beginner 14 km runners in phase 2 learning to change gears.",
    R4_LS, r4_how("Treat the harder stages as 'comfortably hard', not sprints."),
    [R4_WU, E("Easy/moderate stage", 4, "5 min", "easy/moderate", group="A"), E("Harder stage", 3, "5 min", "harder", group="A"),
     E("Slow jog cool-down", 1, "5 min")],
    R4_CREDIT, R4_URL, R4_NOTE, series="rebel x 440 City2Surf Program")

add("x-run-440-3-2-continuous", "The 440 6 x (3 min Moderate + 2 min Hard)", "run", "intermediate", "running",
    ["endurance", "sport-performance", "fat-loss"], 35, 4, ["bodyweight"],
    "A non-stop 30-minute run: six rounds of 3 minutes moderate then 2 minutes hard.",
    "Intermediate 14 km runners in phase 2 who want a tough, time-efficient session.",
    R4_LS + ["time-efficient"], r4_how("No breaks - the moderate sections are your recovery."),
    [R4_WU, E("Moderate", 6, "3 min", "moderate", group="A"), E("Hard", 6, "2 min", "hard", group="A")],
    R4_CREDIT, R4_URL, R4_NOTE, series="rebel x 440 City2Surf Program")

add("x-run-440-hill-repeats", "The 440 Hill Repeats (440 m up, 260 m jog)", "run", "beginner", "running",
    ["strength", "endurance", "sport-performance"], 50, 4, ["bodyweight"],
    "Ten hill repeats of roughly 440 m, each followed by a 260 m flat or downhill recovery jog. Treadmill version: incline 8-10 with flat recovery.",
    "City2Surf runners preparing for Heartbreak Hill - it is in the beginner track (weeks 5-8); the intermediate track builds to 7 km of hill repeats in total.",
    R4_LS + ["full-gym"], r4_how("No hill nearby? Use a treadmill hill program at incline 8-10 with flat recoveries."),
    [R4_WU, E("Hill repeat (or treadmill incline 8-10)", 10, "1", "hard", "~440 m", group="A"),
     E("Recovery jog (flat or downhill)", 10, "1", "easy", "260 m", group="A")],
    R4_CREDIT, R4_URL, R4_NOTE, series="rebel x 440 City2Surf Program")

add("x-run-440-10x400", "The 440 10 x 400 m", "run", "intermediate", "running",
    ["endurance", "sport-performance"], 45, 4, ["bodyweight", "track or measured route"],
    "Ten 400 m efforts with 2 minutes' rest after each.",
    "Intermediate/experienced runners in phase 1 of the 440 City2Surf program.",
    R4_LS, r4_how("Aim for even 400s - note your times and keep them within a few seconds."),
    [R4_WU, E("400 m effort", 10, "1", "hard", "400 m", group="A"), E("Rest", 9, "2 min", group="A")],
    R4_CREDIT, R4_URL, R4_NOTE, series="rebel x 440 City2Surf Program")

# ---------------------------------------------------------------------------- write
ids = [p["id"] for p in P]
assert len(ids) == len(set(ids)), "duplicate ids"
json.dump(P, open(OUT, "w"), indent=2, ensure_ascii=False)
print(f"wrote {len(P)} sourced entries -> {OUT}")
