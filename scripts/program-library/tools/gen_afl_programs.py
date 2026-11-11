import json, sys
OUT = sys.argv[1]

def ex(name, sets, reps, weight=None, distance=None, group=None):
    e = {"name": name, "sets": sets, "reps": reps}
    if weight: e["weight"] = weight
    if distance: e["distance"] = distance
    if group: e["group"] = group
    return e

def P(**k):
    base = dict(id=None, name=None, category="other", level="beginner", sport="afl", goals=[], duration=None,
                daysPerWeek=2, sessionMinutes=30, equipment=[], description="", whoItsFor="", lifestyle=[],
                howToRun=[], exercises=[], credit="", sourceUrl="", sourceNote="", verified=True)
    base.update(k)
    base["duration"] = f"{base['sessionMinutes']} min"
    order = ["id","name","series","day","daysInSeries","category","level","sport","goals","duration","daysPerWeek","sessionMinutes",
             "equipment","description","whoItsFor","lifestyle","howToRun","exercises","credit","sourceUrl","sourceNote","basedOn","verified"]
    return {kk: base[kk] for kk in order if kk in base}

FF_URL = "https://cove.army.gov.au/sites/default/files/2022-05/AFL%20Footy%20First.pdf"
FF_CREDIT = "FootyFirst - NoGAPS research team (Federation Uni/Monash/Griffith) with the AFL"
FF_NOTE = ("Free community AFL injury-prevention manual (FootyFirst, NoGAPS project, NHMRC-funded with the AFL and partners; endorsed by the AFL "
           "Medical Officers, Physiotherapists and Sports Science associations). Read from the full 48-page manual hosted publicly on the Australian Army's CoVE site; "
           "no copyright/reproduction wording found in the text layer. Only exercise names, sets, reps, tempos and distances recorded; descriptions are ours.")

FF_WARMUP = [
    ex("FootyFirst warm-up: jog (20 m lane)", 1, "1 lane", "jogging pace", group="WU"),
    ex("FootyFirst warm-up: side-to-side run (feet don't cross)", 2, "1 lane each side", "jogging pace", group="WU"),
    ex("FootyFirst warm-up: carioca/grapevine with high knees", 2, "1 lane each side", "jogging pace", group="WU"),
    ex("FootyFirst warm-up: backward running with high feet", 1, "1 lane", "jogging pace", group="WU"),
    ex("FootyFirst warm-up: butt kicks", 2, "1 lane", "jogging pace", group="WU"),
    ex("FootyFirst warm-up: hands to ground (4 touches per 20 m)", 1, "1 lane", "jogging pace", group="WU"),
    ex("Calf stretch, straight leg (dynamic)", 1, "5/leg"),
    ex("Calf stretch, bent knee (dynamic)", 1, "5/leg"),
    ex("Hip rotation (knee circles)", 1, "4/leg"),
    ex("Leg swings forward/back", 1, "6/leg"),
    ex("Leg swings across body", 1, "6/leg"),
    ex("Walking lunge", 1, "8 total"),
]

FF_LEVELS = {
 1: ("Weeks 1-4", "beginner", [
    ex("Hamstring lower (partner-held Nordic, fall slowly)", 1, "6"),
    ex("Ball squeeze, knees bent (2-2-2 tempo, 5 s rest)", 1, "5"),
    ex("Ball squeeze, legs straight (2-2-2 tempo, 5 s rest)", 1, "5"),
    ex("Side plank with arm raise (2-2-2 tempo)", 1, "5/side"),
    ex("Single-leg balance, handball with partner 3 m apart", 1, "12/leg"),
    ex("Single-leg shallow squat (solo, partners 3 m apart)", 1, "6/leg"),
    ex("Single-leg shallow squat (hands on partner's shoulders)", 1, "6/leg"),
    ex("Single-leg shallow squat after receiving a handball", 1, "6/leg"),
 ]),
 2: ("Weeks 5-8", "beginner", [
    ex("Hamstring lower (partner-held Nordic)", 2, "5"),
    ex("Side-lying leg lift, bottom leg (2-2-2 tempo)", 3, "5/leg"),
    ex("Side plank lift and lower hips (2-2 tempo, 5 s between sets)", 2, "5/side"),
    ex("Jump forward and land on one leg (alternate legs)", 1, "20 (10/leg)"),
    ex("Jump backward and land on one leg (alternate legs)", 1, "20 (10/leg)"),
 ]),
 3: ("Weeks 9-12", "intermediate", [
    ex("Hamstring lower (partner-held Nordic)", 2, "8"),
    ex("Running man single-leg squat (2-2 tempo, 10 s between sets)", 2, "15/leg"),
    ex("Side plank side-to-side (front-side-front-side, 1 s holds)", 1, "5"),
    ex("Single-leg jump forward and back, arms up as if marking", 2, "20 (10 fwd, 10 back), start each leg"),
    ex("Run forward (3-step run-up), jump and land on the other leg", 1, "20 (10/leg)"),
 ]),
 4: ("Weeks 13-16", "intermediate", [
    ex("Hamstring lower (partner-held Nordic)", 2, "10"),
    ex("Ball squeeze with legs lifted to 90/90 (2-2-2 tempo, 3 s rest)", 1, "5"),
    ex("Side plank with arm and top-leg lift (5 s hold, 3 s rest)", 1, "5/side"),
    ex("Run (3 steps), jump 45 degrees to the side and land", 1, "10/leg"),
    ex("Pre-planned side-step at 45 degrees (cut 2 m before marker 10 m away)", 1, "20 (10/side)"),
 ]),
 5: ("Weeks 17+", "advanced", [
    ex("Hamstring lower (partner-held Nordic)", 2, "12"),
    ex("Body lift (partner holds top ankle; Copenhagen-style, 2 s phases)", 3, "5/leg (build from 3)"),
    ex("Side plank side-to-side with leg lift (5 s holds)", 1, "5"),
    ex("Run (3-5 steps), jump, land and run on 5 m; coach adds a ball to mark", 1, "16 (8/leg)"),
    ex("Unanticipated side-step: react to attacker 10 m away", 1, "16 side-steps as defender"),
 ]),
}

progs = []
for lvl, (wk, level, main) in FF_LEVELS.items():
    progs.append(P(
        id=f"footyfirst-level-{lvl}", name=f"FootyFirst Level {lvl} ({wk})", series="FootyFirst", day=lvl, daysInSeries=5,
        category="other", level=level, goals=["sport-performance", "strength", "general-fitness"], daysPerWeek=2, sessionMinutes=20,
        equipment=["bodyweight", "cones", "ball", "partner"],
        description=f"The AFL-endorsed leg-injury prevention routine for community footy, level {lvl}: a 5-minute group warm-up, then hamstring, groin and hip strength and a balance/landing/side-stepping drill.",
        whoItsFor="Community AFL players (senior and older junior) who want fewer hamstring, groin, knee and ankle injuries. Done on the footy ground with a partner and a ball.",
        lifestyle=["outdoor", "minimal-equipment", "time-efficient"],
        howToRun=[
            "Do it at the start of every club training session, at least twice a week, through pre-season and in-season.",
            "Warm-up about 5 minutes, then the strength and landing work about 15 minutes, in the order listed.",
            "Stay on a level for about 4 weeks (8 sessions) and only move up when every exercise is done with good technique.",
            "Stop any exercise that hurts and drop back a level; follow it with your normal kicking/handball warm-up.",
        ],
        exercises=FF_WARMUP + main, credit=FF_CREDIT, sourceUrl=FF_URL, sourceNote=FF_NOTE))

P2P_W_URL = "https://play.afl/sites/default/files/2023-10/AFLW%20Prep%20to%20Play%20-%20Dynamic%20Warm%20Up%20Program%20%28Poster%29.pdf"
P2P_S_URL = "https://play.afl/sites/default/files/2023-10/AFLW%20Prep%20to%20Play%20-%20Strength%20Program%20%28Poster%29.pdf"
P2P_CREDIT = "AFL & La Trobe University (Prep to Play)"
P2P_NOTE = ("Free official AFL/La Trobe poster on play.afl (coach.afl). Doses read from the poster image itself (rendered and checked), cross-checked with the Player Manual. "
            "No reproduction wording on the poster; only names and doses recorded, descriptions are ours. Videos at coach.afl/female-football.")

w_opts = {
 "A": [("Jog at least 200 m + hamstring sweep", "x5 each side"), ("Stutter step at each cone (3 s fast feet)", "repeat x2"),
       ("45-degree zig-zag cuts", "repeat x2"), ("Dot the i (jump forward then straight up)", "repeat x10"),
       ("Partner push (double-leg jump, bumped in the air)", "x5 each side"), ("Partner bump/check", "x5 each side"),
       ("Sprints 30 m, build to 80-90% top speed", "repeat x2-3"), ("Single-leg balance, handball with partner", "1 min each side")],
 "C": [("Jog at least 200 m + open/close gate", "x5 each side"), ("Forward 2 cones, backward 1", "repeat x2"),
       ("Partner zig-zag with contact, compete for ball", "repeat x2"), ("Hops forward as far as you can", "repeat x10 each side"),
       ("Running partner push with 90-degree twist", "x5 each side"), ("Falling/rolling technique", "x3-5 each side"),
       ("Sprints 30 m, build to 80-90% top speed (race from lying)", "repeat x2-3"), ("Single-leg balance, handball with partner", "1 min each side")],
}
for i, (opt, lvl) in enumerate([("A", "beginner"), ("C", "advanced")]):
    exs = []
    for n, r in w_opts[opt]:
        exs.append(ex(n, 1, r, "80-90% top speed" if n.startswith("Sprints") else None, "30m" if n.startswith("Sprints") else None))
    progs.append(P(
        id=f"prep-to-play-warm-up-option-{opt.lower()}", name=f"Prep to Play Dynamic Warm-up (Option {opt})", series="Prep to Play Warm-up",
        day=i + 1, daysInSeries=2, category="other", level=lvl, goals=["sport-performance", "mobility", "general-fitness"],
        daysPerWeek=3, sessionMinutes=10, equipment=["cones", "ball", "partner"],
        description=f"The AFL's 10-minute knee and head-injury reduction warm-up for women and girls, all 8 activities at the {'easiest' if opt=='A' else 'hardest'} option: deceleration, cutting, landing, contact, sprinting and balance.",
        whoItsFor="Women and girls (14+) playing community AFL, and any player who wants a warm-up that trains landing and change of direction. Needs 16 cones and a partner.",
        lifestyle=["outdoor", "minimal-equipment", "time-efficient"],
        howToRun=[
            "Do all 8 activities at the start of every training session and every game (about 10 minutes).",
            "Pick option A, B or C per activity; aim to work up to C, and use A/B for variety or when sore.",
            "On match day do only this warm-up; at training follow it with contact skills and the 3 strength activities.",
            "Benefits come with doing it every session; movement quality improves in 3-4 weeks, strength in 6-8 weeks at 2-3 sessions a week.",
        ],
        exercises=exs, credit=P2P_CREDIT, sourceUrl=P2P_W_URL, sourceNote=P2P_NOTE))

s_opts = {
 "A": [("Lunges", "2x10 each side", 2, "10/side"), ("Single-leg glute bridge", "", 2, "10/side"), ("Front plank or wheelbarrow hold", "", 2, "30-60s")],
 "B": [("Clockface (mini squat, tap 12-3-6-9)", "", 3, "1 round/side"), ("Single-leg hamstring bridge (foot on bench/ball)", "", 2, "10/side"), ("Side plank", "", 2, "30-60s/side")],
 "C": [("Reverse Nordic", "", 2, "5"), ("Nordic hamstring lowers", "", 2, "5"), ("Copenhagen groin (modified at knee or full at ankle)", "", 2, "10/side")],
}
for i, (opt, lvl) in enumerate([("A", "beginner"), ("B", "intermediate"), ("C", "advanced")]):
    exs = [ex(n, s, r) for (n, _, s, r) in s_opts[opt]]
    progs.append(P(
        id=f"prep-to-play-strength-option-{opt.lower()}", name=f"Prep to Play Strength Program (Option {opt})", series="Prep to Play Strength",
        day=i + 1, daysInSeries=3, category="fitness", level=lvl, goals=["strength", "sport-performance"],
        daysPerWeek=3, sessionMinutes=10, equipment=["bodyweight", "partner"] + (["bench"] if opt == "B" else []),
        description=f"Three no-equipment strength activities from the AFL's Prep to Play program (lower limb, hamstring/glute, core/hip), option {opt}.",
        whoItsFor="Female community AFL players and juniors 14+ (and anyone else) wanting a 10-minute leg, hamstring and groin strength routine at every training.",
        lifestyle=["outdoor", "minimal-equipment", "time-efficient", "home"],
        howToRun=[
            "Do one activity from each of the 3 groups, about 10 minutes, before, during or after every training session.",
            "Choose A, B or C per group; aim to progress to C.",
            "Some soreness 24-48 h after is expected; if soreness stops you training, see a physio.",
            "Replaces static stretching or a cool-down lap (SMA recommendation).",
        ],
        exercises=exs, credit=P2P_CREDIT, sourceUrl=P2P_S_URL, sourceNote=P2P_NOTE))

MU_PDF = "https://cdn.shopify.com/s/files/1/0528/3718/7753/files/Muashi_Sports_Training_Program_AFL.pdf"
MU_CREDIT = "Musashi Performance Lab (Musashi Nutrition)"
def mu_note(page):
    return ("Free 'Download PDF' from Musashi's AFL training-program pages (PDF opened without a login; the pages also advertise a members-only area). "
            f"Day 1 checked against {page}; Days 2-3 assigned from the PDF's goal headings (the PDF's phase column order doesn't match the web pages, so we followed the pages). "
            "No named author. Site footer '(c) 1987-2026 Musashi Nutrition'; no reproduction terms found. Commercial brand content: facts only, link out.")
MU = {
 "off-season": ("Sport-Specific Strength", "https://musashi.com/pages/off-season-afl-training-program", "intermediate", ["strength", "sport-performance"], "gym", [
   [ex("Paced jog", 1, "15 min"), ex("Tibialis raises", 3, "25"), ex("Half squat", 4, "8"), ex("Forward lunge", 4, "8"), ex("Reverse lunge knee drive", 3, "12"), ex("Paced jog", 1, "15 min")],
   [ex("Glute bridge bench press", 5, "12"), ex("Banded single-arm press (left)", 3, "6"), ex("Banded single-arm press (right)", 3, "6"), ex("Single-arm plank (left)", 3, "30s"), ex("Single-arm plank (right)", 3, "30s"), ex("Push-ups", 3, "AMAP")],
   [ex("Trap bar or barbell deadlift", 5, "12"), ex("Banded rows", 4, "8"), ex("Step-back banded row", 3, "8"), ex("Single-leg shoulder press (left)", 2, "6"), ex("Single-leg shoulder press (right)", 2, "6"), ex("Upright row", 3, "8")],
 ]),
 "pre-season": ("Power & Explosiveness", "https://musashi.com/pages/pre-season-afl-training-program", "intermediate", ["sport-performance", "strength"], "gym", [
   [ex("Split squat", 5, "8"), ex("Kneeling sprint start (left)", 3, "3"), ex("Kneeling sprint start (right)", 3, "3"), ex("Lateral skater deceleration", 3, "30s"), ex("Triple high-knee skater", 3, "30s"), ex("Box jumps", 3, "6")],
   [ex("Rotational med ball slams", 3, "6"), ex("Glute bridge bench press", 5, "8"), ex("Plyo bench push-ups", 2, "6"), ex("Kneeling med ball throw (left)", 3, "6"), ex("Kneeling med ball throw (right)", 3, "6"), ex("Med ball push-ups, swap hands", 3, "AMAP")],
   [ex("Single-leg deadlift (left)", 4, "6"), ex("Single-leg deadlift (right)", 4, "6"), ex("Skater ball slam", 3, "30s"), ex("Glute bridge bench press", 3, "12"), ex("Glute bridge pullover", 3, "12"), ex("Bulgarian jumps", 3, "6")],
 ]),
 "in-season": ("Endurance & Movement", "https://musashi.com/pages/during-season-afl-training-program", "beginner", ["endurance", "sport-performance"], "fitness", [
   [ex("Jog", 1, "15 min"), ex("Run", 1, "3 min"), ex("Jog", 1, "5 min"), ex("Run", 1, "2 min"), ex("Jog", 1, "5 min"), ex("Run", 1, "1 min")],
   [ex("Box jumps", 3, "3"), ex("Zercher squats", 4, "5"), ex("Chin-ups", 4, "AMAP"), ex("Bulgarian jumps side to side", 3, "6"), ex("Step-up jumps", 3, "4"), ex("Burpee side shuffle", 3, "1 min")],
   [ex("Fast feet on plate", 3, "30s"), ex("Side-to-side plate agility", 3, "30s"), ex("Hip switches", 3, "1 min"), ex("Lunge kettlebell under-swings (left)", 3, "12"), ex("Lunge kettlebell under-swings (right)", 3, "12"), ex("Burpee side roll", 4, "1 min")],
 ]),
}
for phase, (goal, page, lvl, goals, cat, days) in MU.items():
    for d, exs in enumerate(days, 1):
        eq = ["bodyweight"]
        names = " ".join(e["name"].lower() for e in exs)
        for k, v in [("bar", "barbell"), ("band", "resistance band"), ("med ball", "medicine ball"), ("box", "plyo box"), ("bench", "bench"), ("kettlebell", "kettlebell"), ("plate", "weight plate"), ("chin", "pull-up bar")]:
            if k in names and v not in eq: eq.append(v)
        note = mu_note(page)
        if phase == "pre-season" and d == 1:
            note += " The web page shows 4 reps for the right-side kneeling sprint start; the PDF shows 3 - we used the PDF."
        progs.append(P(
            id=f"musashi-afl-{phase}-day-{d}", name=f"Musashi AFL {phase.title()} - {goal} Day {d}", series=f"Musashi AFL {phase.title()}",
            day=d, daysInSeries=3, category=cat, level=lvl, goals=goals, daysPerWeek=3, sessionMinutes=45, equipment=eq,
            description=f"Day {d} of the free 3-day Musashi AFL {phase} plan ('{goal}'), built to sit between club training and games.",
            whoItsFor=f"AFL players wanting a simple {phase} gym/field block to add to club training. Some days need a gym (bar, bands, medicine ball, box).",
            lifestyle=["full-gym"] if cat == "gym" else ["outdoor", "minimal-equipment"],
            howToRun=[
                "Rotate Days 1-3 across the week around club training, with at least a day between the hardest sessions.",
                "Musashi says to adjust sets/reps and add position-specific exercises once you're used to the program.",
                "AMAP = as many as possible with good form.",
                "Keep it away from the day before a game in-season.",
            ],
            exercises=exs, credit=MU_CREDIT, sourceUrl=MU_PDF, sourceNote=note))

RJ_CREDIT = "Rob Jackson (AFL Umpires High Performance Manager) via Play AFL"
RJ_NOTE = ("Free resource on Play AFL's Community Umpire Training page, written for field/boundary umpires (whose running loads are footy-like). "
           "Read from the PDF text; no reproduction wording found. Facts only, descriptions ours.")
rj_str = {
 "A": [("Goblet squat with heel raise", ["2x15", "3x10", "3x8", "3x6"]), ("Sliding leg curl", ["2x5", "3x6", "3x8", "3x10"]), ("Walking lunge", ["2x15/leg", "3x10/leg", "3x8/leg", "3x6/leg"])],
 "B": [("Trap bar deadlift", ["2x10", "3x8", "3x6", "4x4"]), ("B-stance hip thrust", ["2x10/side", "3x10/side", "3x8/side", "3x6/side"]), ("Patrick step-downs", ["2x10/side", "3x10/side", "3x8/side", "3x6/side"])],
}
for i, (k, rows) in enumerate(rj_str.items(), 1):
    exs = []
    for n, plan in rows:
        s, r = plan[0].split("x", 1)
        exs.append(ex(f"{n} (wk 3-4 {plan[1]}, wk 5-6 {plan[2]}, wk 7-8 {plan[3]})", int(s), r, "weeks 1-2 dose shown"))
    progs.append(P(
        id=f"rob-jackson-strength-series-{k.lower()}", name=f"Rob Jackson's Strength Series {k}", series="Rob Jackson's Strength Series", day=i, daysInSeries=2,
        category="gym", level="intermediate", goals=["strength", "sport-performance"], daysPerWeek=2, sessionMinutes=30,
        equipment=(["dumbbells", "slider"] if k == "A" else ["trap bar", "barbell", "bench", "step"]),
        description=f"Session {k} of a short, 8-week, three-exercise strength series from the AFL umpires' high-performance manager, aimed at running, throwing and bouncing strength.",
        whoItsFor="Footy umpires and players who want the minimum effective gym dose alongside a heavy running load. Needs a basic gym.",
        lifestyle=["full-gym", "time-efficient", "busy"],
        howToRun=["Alternate A and B, 1-2 strength sessions a week (Play AFL training-year guidance).",
                  "Weeks 1-2 start light with more reps; sets go up and reps come down every 2 weeks to week 8.",
                  "Add load as reps drop; keep 1-2 reps in reserve.",
                  "Leave at least a day before your hardest running session or game."],
        exercises=exs, credit=RJ_CREDIT, sourceUrl="https://play.afl/sites/default/files/2024-08/Rob%20Jacksons%20Strength%20Series%20AB.pdf", sourceNote=RJ_NOTE))

armour = {
 "A": [("Split squat with 2 s pause", "10/side"), ("Short-lever static Copenhagen", "15-20s/side"), ("Single-leg 90/90 hip extension from floor", "10/side"), ("Bear crawl rotations", "5 each way"),
       ("Supported Cossack squat", "5/side"), ("Two-leg calf raise", "12-15"), ("Hamstring walkouts", "10/side"), ("Static inchworm", "5 out/back")],
 "B": [("Static split squat with calf raise", "10/side"), ("Long-lever static Copenhagen", "15-20s/side"), ("Single-leg 90/90 hip extension from bench", "10/side"), ("Bear crawl rotations", "5 each way"),
       ("Non-supported Cossack squat", "5/side"), ("Single-leg calf raise", "12-15"), ("Hamstring walkouts", "10/side"), ("Dynamic inchworm", "5 out/back")],
 "C": [("Static split squat with calf raise", "10/side"), ("Long-lever static Copenhagen", "15-20s/side"), ("Single-leg 90/90 hip extension from bench", "10/side"), ("Bear crawl rotations", "5 each way"),
       ("Non-supported Cossack squat", "5/side"), ("Sprinter calf raise", "12-15"), ("Hamstring walkouts with end switches", "10/side"), ("Dynamic inchworm", "5 out/back")],
}
for i, (k, rows) in enumerate(armour.items(), 1):
    exs = [ex(n, 2, r, group=f"{k}1" if j < 4 else f"{k}2") for j, (n, r) in enumerate(rows)]
    progs.append(P(
        id=f"rob-jackson-body-armour-{k.lower()}", name=f"Rob Jackson's Body Armour Series {k}", series="Rob Jackson's Body Armour Series", day=i, daysInSeries=3,
        category="fitness", level=["beginner", "intermediate", "advanced"][i - 1], goals=["strength", "mobility", "sport-performance"],
        daysPerWeek=2, sessionMinutes=20, equipment=["bodyweight", "bench"] if k != "A" else ["bodyweight"],
        description=f"Body Armour {k}: two short circuits targeting the most common running-injury sites (groin, hamstring, calf, hips), done straight after track work.",
        whoItsFor="AFL players and umpires doing lots of running who want a bodyweight 'prehab' circuit after their run. Grass or gym floor.",
        lifestyle=["outdoor", "minimal-equipment", "time-efficient", "home"],
        howToRun=["Do it after track work: circuit 1 twice through, then circuit 2 twice through.",
                  "Move from series A to B to C as the static holds and single-leg work feel controlled.",
                  "Copenhagen holds are 15-20 seconds a side; stop if groin pain is sharp.",
                  "2 sessions a week fits most pre-season running programs."],
        exercises=exs, credit=RJ_CREDIT, sourceUrl="https://play.afl/sites/default/files/2024-08/Rob%20Jacksons%20Body%20Armour%20Series.pdf", sourceNote=RJ_NOTE))

progs.append(P(
    id="rob-jackson-body-weight-flush", name="Rob Jackson's Body Weight Flush Recovery", category="fitness", level="beginner",
    goals=["mobility", "general-fitness"], daysPerWeek=1, sessionMinutes=15, equipment=["bodyweight"],
    description="An easy active-recovery mobility walk-through: five 10 m crawling, squatting and lunging patterns that open the hips and lower back.",
    whoItsFor="Players and umpires the day after a game or hard session who want to move without adding fatigue.",
    lifestyle=["outdoor", "home", "minimal-equipment", "time-efficient"],
    howToRun=["Use on recovery days (e.g. the day after the game).", "It's not meant to be hard; move smoothly through range.",
              "Repeat the whole sequence 1-3 times depending on how you feel.", "Range improves quickly with regular use."],
    exercises=[ex("Duck walk", 1, "10 m up and back"), ex("Lateral squat and reach walk", 1, "10 m left, 10 m right"), ex("Reverse duck walk", 1, "10 m up and back"),
               ex("Inchworm to push-up", 1, "10 m up and back"), ex("Deep squat and rotate walk", 1, "10 m up and back")],
    credit=RJ_CREDIT, sourceUrl="https://play.afl/sites/default/files/2024-08/RobJacksons%20Body%20Weight%20Flush%20Recovery.pdf", sourceNote=RJ_NOTE))

MP_URL = "https://play.afl/sites/default/files/2024-02/Movement%20Preparation%20%2B%20Extras%20%28Rob%20Jackson%29.pdf"
progs.append(P(
    id="rob-jackson-movement-prep-t1", name="Rob Jackson's Movement Prep + T1 Running Drills", category="other", level="intermediate",
    goals=["mobility", "sport-performance"], daysPerWeek=3, sessionMinutes=20, equipment=["bodyweight", "cones"],
    description="A pre-training mobility/activation sequence (option 1) followed by the T1 running-drill series that finishes with build-up strides and flying 10 m sprints.",
    whoItsFor="Players and umpires who want a structured warm-up before speed or running sessions. Needs a 40 m strip of grass.",
    lifestyle=["outdoor", "minimal-equipment"],
    howToRun=["Do before running or speed sessions.", "Mobility first, then drills over 10-30 m with the stated return (jog, shuffle or carioca).",
              "Strides build 60-70-80%; the flying 10 m is the only near-max effort.", "Swap to option 2 or T2 drills for variety."],
    exercises=[ex("Prone belly breaths", 1, "10 each"), ex("Single-leg glute bridge", 1, "10/side"), ex("Prone Y-W", 1, "10"), ex("Hip flexor pulses", 1, "10/side"),
               ex("90-90 reach through", 1, "6/side"), ex("Cat-camel", 1, "8"), ex("Lateral rocks", 1, "6/side"), ex("World's greatest stretch", 1, "5/side"),
               ex("Knee hug + arabesque", 1, "5/side"), ex("Skipping / lateral skip / high-knee skip", 1, "30 each"),
               ex("Calf pump", 1, "1", distance="10m"), ex("Pogo forwards (lateral shuffle return)", 1, "1", distance="10m"),
               ex("Pogo backwards (lateral shuffle return)", 1, "1", distance="10m"), ex("Split pogo (carioca return)", 1, "1", distance="10m"),
               ex("A-skip (carioca return)", 1, "1", distance="10m"), ex("Ankle dribble (backward jog return)", 1, "1", distance="10m"),
               ex("Ankle-calf dribble", 1, "1", distance="20m"), ex("Ankle-calf-knee dribble", 1, "1", distance="30m"),
               ex("Dribble transition (speed focus)", 1, "1", distance="30m"), ex("Build-up strides", 3, "1", "60-70-80%", "40m"),
               ex("30-40 m build-up, flying 10 m sprint + decel", 2, "1", "max over the flying 10 m", "10m")],
    credit=RJ_CREDIT, sourceUrl=MP_URL, sourceNote=RJ_NOTE))

maint = {1: ["Isometric lunge", "Spiderman lunge", "Y-W glides", "Plank", "Hamstring holds", "Bent-knee curl-up", "Side plank", "Bird dog (elbows)"],
         2: ["Reverse lunge", "Isometric lateral lunge", "Scapula push-up", "Plank rocks", "Single-leg hamstring holds", "Hollow hold", "Side plank hip lifts", "Bird dog (hands)"],
         3: ["Sprinter lunge", "Lateral lunge", "Push-up", "Plank up-downs", "Hamstring switches", "Dead bug", "Side plank leg lifts", "Bear dog"]}
static = {"Isometric lunge", "Plank", "Hamstring holds", "Side plank", "Isometric lateral lunge", "Single-leg hamstring holds", "Hollow hold"}
for lvl, names in maint.items():
    progs.append(P(
        id=f"rob-jackson-strength-maintenance-level-{lvl}", name=f"Rob Jackson's Strength Maintenance Level {lvl}", series="Rob Jackson's Strength Maintenance",
        day=lvl, daysInSeries=3, category="fitness", level=["beginner", "intermediate", "advanced"][lvl - 1], goals=["strength", "general-fitness"],
        daysPerWeek=2, sessionMinutes=25, equipment=["bodyweight"],
        description=f"Level {lvl} of a no-equipment strength-maintenance circuit for legs, trunk and shoulders, done for 3 rounds.",
        whoItsFor="Players and umpires without gym access (travel, lockdown, home) who need to hold strength for running, jumping and contact.",
        lifestyle=["home", "travel", "minimal-equipment", "time-efficient"],
        howToRun=["2 sessions a week, 3 rounds of the circuit.", "Option 1: 10 reps per exercise, adding 1-2 reps every second session up to 20; holds start at 20 s, adding 5 s every second session up to 45 s.",
                  "Option 2: 20 s per exercise in rotation, adding 5 s every second session.", "Move up a level when you reach 20 reps / 45 s holds."],
        exercises=[ex(n, 3, "20s" if n in static else "10") for n in names],
        credit=RJ_CREDIT, sourceUrl=MP_URL, sourceNote=RJ_NOTE))

credited_ids = [p["id"] for p in progs]

# ---------------- Somax originals ----------------
def S(**k):
    k.setdefault("credit", "Somax"); k.setdefault("sourceUrl", ""); k.setdefault("sourceNote", "Original Somax program."); k["verified"] = False
    return P(**k)

WU_FF = ex("FootyFirst-style warm-up (jog, side-to-side, carioca, butt kicks, leg swings, lunges)", 1, "6 min")
WU_P2P = ex("Prep to Play-style warm-up (decel, cuts, landings, 30 m build-ups)", 1, "10 min")

somax = [
 S(id="somax-afl-preseason-aerobic-base", name="Somax AFL Pre-season Aerobic Base", category="run", level="beginner",
   goals=["endurance", "sport-performance", "general-fitness"], daysPerWeek=3, sessionMinutes=40, equipment=["bodyweight", "cones"],
   description="Easy running plus short run/jog surges to build the aerobic engine you need before club pre-season gets hard.",
   whoItsFor="Community players coming back from the off-season (or new to footy) who can jog 15-20 minutes and want to turn up to pre-season fit.",
   lifestyle=["outdoor", "minimal-equipment", "busy"],
   howToRun=["3 runs a week on non-consecutive days (e.g. Mon/Wed/Sat), 4-8 weeks before club pre-season.",
             "Jog parts are conversational; 'run' parts are comfortably hard, not sprints.",
             "Add 2-3 minutes of easy running a week; every 4th week cut the session by a third.",
             "Do a 2 km time trial at the start and after 6 weeks to track progress."],
   exercises=[WU_FF, ex("Easy jog", 1, "12 min", "conversational"), ex("Run (comfortably hard)", 1, "3 min"), ex("Jog recovery", 1, "3 min"),
              ex("Run", 1, "2 min"), ex("Jog recovery", 1, "2 min"), ex("Run", 1, "1 min"), ex("Easy jog cool-down", 1, "5 min"),
              ex("Strides", 4, "1", "70-80%", "60m"), ex("Prep to Play strength: lunges + glute bridge + plank", 1, "5 min")],
   basedOn=["musashi-afl-in-season-day-1", "footyfirst-level-1", "prep-to-play-strength-option-a"]),
 S(id="somax-afl-2km-time-trial-builder", name="Somax AFL 2km Time-Trial Builder", category="run", level="intermediate",
   goals=["endurance", "sport-performance"], daysPerWeek=3, sessionMinutes=45, equipment=["bodyweight", "cones"],
   description="Goal-pace 400s and a weekly tempo run to knock time off your club's 2 km time trial.",
   whoItsFor="Players with a current 2 km time of roughly 7:00-9:30 who want to hit a pre-season time-trial target. Needs a 400 m track or measured oval lap.",
   lifestyle=["outdoor", "minimal-equipment"],
   howToRun=["Week: this interval session + a 20-25 min tempo run (comfortably hard) + one easy 30-40 min run.",
             "Run the 400s at goal 2 km pace (goal time / 5); rest 60-90 s standing or walking.",
             "Add one 400 every week up to 10, then retest the 2 km; set new paces from the result.",
             "Keep at least 48 h between this session and a hard club session or game."],
   exercises=[WU_FF, ex("400 m repeats at goal 2km pace", 6, "1", "goal 2km pace", "400m"), ex("Walk/stand recovery", 6, "60-90s"),
              ex("Strides", 4, "1", "80%", "100m"), ex("Easy jog cool-down", 1, "5 min"),
              ex("Body Armour circuit (Copenhagen hold, calf raise, hamstring walkouts)", 2, "1 round")],
   basedOn=["rob-jackson-body-armour-a", "footyfirst-level-1", "musashi-afl-in-season-day-1"]),
 S(id="somax-afl-repeat-sprint-conditioning", name="Somax AFL Repeat-Sprint Conditioning", category="run", level="intermediate",
   goals=["endurance", "sport-performance"], daysPerWeek=2, sessionMinutes=40, equipment=["cones"],
   description="Short sprints on short rest plus 15:15 intervals - the stop-start fitness you need to keep presenting at contests late in the last quarter.",
   whoItsFor="Sub-elite and keen community players in mid-to-late pre-season who already have an aerobic base.",
   lifestyle=["outdoor", "minimal-equipment", "time-efficient"],
   howToRun=["2 sessions a week in pre-season, never on consecutive days and not within 48 h of a game.",
             "Sprints start every 20 s (sprint 30 m, jog back); stop the set if you're more than ~5% slower than your first rep.",
             "Rest 4 min between sets; build from 2 to 3 sets over 4 weeks.",
             "In-season, drop to 1 set or let club training cover it."],
   exercises=[ex("Rob Jackson T1 running drills + build-up strides", 1, "12 min"),
              ex("Repeat sprints, start every 20 s (jog back)", 2, "6", "max", "30m"), ex("Rest between sets", 2, "4 min"),
              ex("15 s run / 15 s walk intervals", 2, "8", "~90% effort"), ex("Easy jog cool-down", 1, "5 min")],
   basedOn=["rob-jackson-movement-prep-t1", "prep-to-play-warm-up-option-a"]),
 S(id="somax-afl-speed-agility", name="Somax AFL Speed & Agility", category="other", level="intermediate",
   goals=["sport-performance"], daysPerWeek=2, sessionMinutes=45, equipment=["cones", "ball", "partner"],
   description="First-step acceleration, flying speed and safe side-stepping - pre-planned, then reacting to an opponent.",
   whoItsFor="Midfielders, small forwards and defenders (15+) who want to win the first few metres to the ball. Needs a partner and some cones.",
   lifestyle=["outdoor", "minimal-equipment"],
   howToRun=["2 sessions a week in pre-season; 1 in-season at MD-4 or MD-3 (e.g. Tuesday for a Saturday game).",
             "Every sprint is max effort with full recovery (walk back + 60-90 s); quality over volume.",
             "Plant the foot close to your midline, trunk upright, knee bent when side-stepping.",
             "Only do the reactive drill once the pre-planned side-step looks clean."],
   exercises=[ex("Rob Jackson T1 running drills", 1, "10 min"), ex("Kneeling sprint start", 6, "1", "max", "10m"),
              ex("Flying sprint after 30 m build-up", 4, "1", "max", "10m"), ex("5 m cone change-of-direction pattern (left then right turns)", 3, "1/side", "30 s rest"),
              ex("Pre-planned 45-degree side-step", 1, "10/side"), ex("Reactive side-step vs partner (defender)", 1, "8/side"),
              ex("Lateral skater deceleration", 3, "30s")],
   basedOn=["rob-jackson-movement-prep-t1", "musashi-afl-pre-season-day-1", "footyfirst-level-4", "footyfirst-level-5"]),
 S(id="somax-afl-lower-body-strength-power", name="Somax AFL Lower-Body Strength & Power", category="gym", level="advanced",
   goals=["strength", "sport-performance", "muscle"], daysPerWeek=2, sessionMinutes=60, equipment=["trap bar", "barbell", "plyo box", "dumbbells", "bench", "slider"],
   description="Heavy hinge and single-leg strength paired with jumps, plus Nordics and Copenhagens to protect hamstrings and groins.",
   whoItsFor="Experienced lifters playing sub-elite or senior footy (VFL/SANFL/WAFL level or strong local leagues) in off- and pre-season.",
   lifestyle=["full-gym"],
   howToRun=["2 sessions a week off/pre-season (e.g. Mon/Thu), 1 in-season at MD-4/MD-3.",
             "Heavy sets at about RPE 8 (2 reps in reserve); add load when all reps feel solid.",
             "Jumps are low-rep and fully recovered; stop when height drops.",
             "Never in the 48 h before a game."],
   exercises=[WU_FF, ex("Box jump (step down)", 4, "3"), ex("Trap bar deadlift", 4, "4-6", "RPE 8"), ex("Rear-foot-elevated split squat", 3, "6/leg", "RPE 8", group="A"),
              ex("Lateral bound (stick landing)", 3, "4/side", group="A"), ex("B-stance hip thrust", 3, "8/side", group="B"),
              ex("Nordic hamstring lower", 3, "5", group="B"), ex("Long-lever Copenhagen (dynamic)", 2, "8/side"), ex("Single-leg calf raise", 3, "12")],
   basedOn=["rob-jackson-strength-series-b", "musashi-afl-pre-season-day-1", "prep-to-play-strength-option-c", "footyfirst-level-5"]),
 S(id="somax-afl-upper-body-contact-strength", name="Somax AFL Upper-Body & Contact Strength", category="gym", level="intermediate",
   goals=["strength", "muscle", "sport-performance"], daysPerWeek=2, sessionMinutes=50, equipment=["barbell", "bench", "pull-up bar", "dumbbells", "medicine ball", "resistance band", "partner"],
   description="Pressing, pulling and rotational power to win contests, plus safe tackling and falling technique.",
   whoItsFor="Senior and older-junior (16+) players who want to be harder to tackle and stronger over the ball.",
   lifestyle=["full-gym"],
   howToRun=["2 sessions a week off/pre-season, 1 in-season; pair with the lower-body day or run it on its own.",
             "Main lifts at RPE 7-8; add reps before load.",
             "Tackling breakdown and falling practice are technique work - controlled, with a partner of similar size.",
             "Under-16s: skip the barbell work and use push-ups, rows and the contact drills."],
   exercises=[ex("Band pull-aparts + shoulder circles", 2, "15"), ex("Bench press", 4, "6", "RPE 8", group="A"), ex("Chin-ups", 4, "6-8", group="A"),
              ex("Half-kneeling single-arm dumbbell press", 3, "8/side", group="B"), ex("Single-arm dumbbell row", 3, "10/side", group="B"),
              ex("Plyo push-up", 3, "5"), ex("Rotational med ball slam", 3, "6/side"), ex("Wheelbarrow hold or front plank", 2, "30-60s"),
              ex("Tackling breakdown with partner", 2, "30s"), ex("Falling/rolling technique", 1, "3-5/side")],
   basedOn=["musashi-afl-pre-season-day-2", "musashi-afl-off-season-day-2", "prep-to-play-warm-up-option-c", "prep-to-play-strength-option-a"]),
 S(id="somax-afl-in-season-maintenance", name="Somax AFL In-Season Maintenance (1 day)", category="gym", level="intermediate",
   goals=["strength", "sport-performance"], daysPerWeek=1, sessionMinutes=40, equipment=["trap bar", "bench", "pull-up bar", "plyo box", "partner"],
   description="One compact full-body session a week to hold your pre-season strength and power through a Saturday-game season.",
   whoItsFor="Players training 2 nights a week with their club plus a Saturday game who have time for one extra gym visit.",
   lifestyle=["full-gym", "time-efficient", "busy"],
   howToRun=["Once a week at MD-4 or MD-3 (Tuesday/Wednesday for a Saturday game), ideally before or after the lighter club session.",
             "Keep the weights heavy but the sets few - leave 2-3 reps in reserve and never grind.",
             "Skip it in a bye week only if you're carrying soreness; otherwise keep it - one session a week is what holds strength.",
             "No new exercises mid-season (soreness costs games)."],
   exercises=[WU_FF, ex("Box jump", 3, "3"), ex("Trap bar deadlift", 3, "4", "about 85% / RPE 7-8"), ex("Split squat", 2, "6/leg", group="A"),
              ex("Chin-ups", 3, "5", group="A"), ex("Bench press or push-up", 3, "6", group="B"), ex("Nordic hamstring lower", 2, "5", group="B"),
              ex("Copenhagen groin (modified or full)", 2, "10/side")],
   basedOn=["rob-jackson-strength-series-b", "prep-to-play-strength-option-c", "musashi-afl-off-season-day-3"]),
 S(id="somax-afl-game-day-recovery", name="Somax AFL Game-Day Recovery (MD+1)", category="fitness", level="beginner",
   goals=["mobility", "general-fitness"], daysPerWeek=1, sessionMinutes=30, equipment=["bodyweight"],
   description="The day-after-the-game session: easy cardio, a bodyweight mobility 'flush' and a quick body check.",
   whoItsFor="Any player the day after a game (Sunday for a Saturday game) - no gym needed; a pool or bike is a bonus.",
   lifestyle=["home", "outdoor", "minimal-equipment", "time-efficient"],
   howToRun=["Do it the day after the game; keep everything easy (could hold a conversation the whole time).",
             "Pick a walk, swim or bike ride for the cardio part.",
             "Rehydrate, eat well, aim for 8 hours' sleep, and skip alcohol to help recovery.",
             "Any sharp pain, a head knock or swelling: get it checked before the next training."],
   exercises=[ex("Easy walk, swim or bike", 1, "15-20 min", "easy"), ex("Duck walk", 1, "10 m up and back"), ex("Lateral squat and reach walk", 1, "10 m each way"),
              ex("Reverse duck walk", 1, "10 m up and back"), ex("Inchworm to push-up", 1, "10 m up and back"), ex("Deep squat and rotate walk", 1, "10 m up and back"),
              ex("90-90 reach through", 1, "5/side"), ex("Glute bridge hold", 1, "30s")],
   basedOn=["rob-jackson-body-weight-flush", "rob-jackson-movement-prep-t1"]),
 S(id="somax-afl-hamstring-groin-bulletproofing", name="Somax AFL Hamstring & Groin Bulletproofing", category="fitness", level="intermediate",
   goals=["strength", "sport-performance"], daysPerWeek=2, sessionMinutes=20, equipment=["bodyweight", "partner", "ball", "slider"],
   description="Nordics, Copenhagens and friends - the strength work with the best evidence for keeping AFL players' hamstrings and groins on the park.",
   whoItsFor="Players with a history of hamstring or groin trouble, or anyone heading into a running-heavy pre-season. Needs a partner (or a heavy anchor) and a mat.",
   lifestyle=["outdoor", "home", "minimal-equipment", "time-efficient"],
   howToRun=["Pre-season: 2-3 times a week; in-season: once a week, early in the week (not MD-1 or MD-2).",
             "Nordics: progress the reps the FootyFirst way - 1x6, 2x5, 2x8, 2x10, 2x12 - roughly every 4 weeks.",
             "Copenhagen: start short-lever (partner holds the knee), move to long-lever (ankle) when 2x10/side is easy.",
             "Expect some soreness for the first 2 weeks; sharp pain means stop and see a physio."],
   exercises=[ex("Nordic hamstring lower", 2, "5-8"), ex("Sliding leg curl", 3, "6-8"), ex("Single-leg 90/90 hip extension", 2, "10/side"),
              ex("Ball squeeze, knees bent (2-2-2 tempo)", 1, "5"), ex("Copenhagen groin (short then long lever)", 2, "6-10/side"),
              ex("Reverse Nordic", 2, "5"), ex("Hamstring walkouts", 2, "10/side")],
   basedOn=["footyfirst-level-3", "prep-to-play-strength-option-c", "rob-jackson-body-armour-b", "rob-jackson-strength-series-a"]),
 S(id="somax-aflw-knee-smart-warm-up", name="Somax AFLW Knee-Smart Warm-up (Prep to Play style)", category="other", level="beginner",
   goals=["sport-performance", "mobility", "general-fitness"], daysPerWeek=3, sessionMinutes=15, equipment=["cones", "ball", "partner"],
   description="A 10-minute warm-up plus 5 minutes of strength that drills the landing, deceleration and cutting positions linked to ACL injuries in women's footy.",
   whoItsFor="Women and girls 14+ playing community or school footy, especially those new to the game. Coaches can run it for the whole team.",
   lifestyle=["outdoor", "minimal-equipment", "time-efficient"],
   howToRun=["Every training and every game (game day: warm-up part only).",
             "Land in an athletic stance: knees in line with hips and toes, bend at hips and knees, quiet feet.",
             "Decelerate with short quick steps; plant the outside foot and push off when cutting.",
             "Start with the easiest version of each drill and progress every 2-3 weeks; the official Prep to Play posters are the reference."],
   exercises=[ex("Jog at least 200 m + leg swings", 1, "x5 each side"), ex("One-leg stop (decelerate to athletic stance)", 1, "1 each side"),
              ex("Partner zig-zag, no contact (race)", 2, "1"), ex("Bounding", 1, "10 each side"), ex("Running partner push (bumped in the air)", 1, "5 each side"),
              ex("Tackling breakdown", 2, "30s"), ex("Build-up sprints", 2, "1", "80-90%", "30m"), ex("Single-leg balance + handball", 1, "1 min/side"),
              ex("Single-leg glute bridge", 2, "10/side"), ex("Side plank", 2, "30-60s/side"), ex("Clockface", 3, "1 round/side")],
   basedOn=["prep-to-play-warm-up-option-a", "prep-to-play-warm-up-option-c", "prep-to-play-strength-option-b"]),
 S(id="somax-junior-afl-fundamentals", name="Somax Junior AFL Fundamentals", category="other", level="beginner",
   goals=["general-fitness", "sport-performance"], daysPerWeek=2, sessionMinutes=45, equipment=["cones", "ball", "bodyweight"],
   description="Fun, skill-first athletic development for young AFL players: running technique, safe landing and falling, bodyweight strength and kick-handball games.",
   whoItsFor="Junior AFL players about 10-15 (with a parent or coach) who want to get fitter and more coordinated without adult-style training.",
   lifestyle=["outdoor", "minimal-equipment"],
   howToRun=["Up to 2 extra sessions a week on top of club training; keep at least one full rest day.",
             "Bodyweight only - no maximal lifting; technique first, effort second.",
             "AFL Junior Rules: ideally no more than 2 games a week and 25 games a season across club, school and talent teams.",
             "Finish with a game; if it stops being fun, do less."],
   exercises=[ex("Tag/chasey warm-up game", 1, "5 min"), ex("Single-leg balance + handball with partner", 1, "12/leg"),
              ex("Single-leg shallow squat (hands on partner's shoulders)", 1, "6/leg"), ex("Jump forward, land on one leg and stick", 1, "10/leg"),
              ex("Falling/rolling technique on grass", 1, "3/side"), ex("Sprint technique: build-ups", 4, "1", "80%", "20m"),
              ex("Side plank", 2, "15-20s/side"), ex("Hamstring lower (gentle, partner-held)", 1, "4-6"),
              ex("Kick-and-handball circuit / small-sided game", 1, "15 min")],
   basedOn=["footyfirst-level-1", "footyfirst-level-2", "prep-to-play-warm-up-option-c"]),
 S(id="somax-afl-advanced-preseason-running", name="Somax AFL Advanced Pre-season Running", category="run", level="advanced",
   goals=["endurance", "sport-performance"], daysPerWeek=3, sessionMinutes=60, equipment=["cones"],
   description="Threshold kilometres, 200 m repeats and fast build-ups in one session - the high-speed running dose of a serious footy pre-season.",
   whoItsFor="Sub-elite and top local-league players (2 km roughly under 7:15 for men / 8:15 for women) chasing a big pre-season.",
   lifestyle=["outdoor", "minimal-equipment"],
   howToRun=["Once a week, plus one easy run and one repeat-sprint or speed session; not within 48 h of club match-sim or a practice match.",
             "Threshold kms at about 2 km TT pace + 10-15 s per km; 200s fast but repeatable (all within ~2 s of each other).",
             "Every 4th week drop the 200s to 2 sets.",
             "Pair with Body Armour or the Hamstring & Groin session afterwards."],
   exercises=[ex("Rob Jackson movement prep + T1 drills", 1, "15 min"), ex("Threshold 1 km", 3, "1", "2km TT pace +10-15 s/km", "1000m"),
              ex("Jog recovery between kms", 3, "2 min"), ex("200 m repeats (60 s rest; 3 min between sets of 4)", 3, "4", "about 90%", "200m"),
              ex("Build-up to max", 4, "1", "max", "40m"), ex("Easy jog cool-down", 1, "5 min")],
   basedOn=["rob-jackson-movement-prep-t1", "rob-jackson-body-armour-c", "musashi-afl-in-season-day-1"]),
]
progs += somax
ids = [p["id"] for p in progs]
assert len(ids) == len(set(ids)), "dup ids"
for p in somax:
    for b in p["basedOn"]:
        assert b in credited_ids, (p["id"], b)
json.dump(progs, open(OUT, "w"), indent=2, ensure_ascii=False)
print(len(progs), "programs;", len(credited_ids), "credited;", len(somax), "somax")
