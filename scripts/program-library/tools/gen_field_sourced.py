"""Generate expansion/field-sourced.json - credited, publicly available field-sport programs.

Sports: soccer, boxing (afl/basketball/tennis: no new source passed the bar - see field-notes.md).
Every entry was read in full from the URL in sourceUrl on 2026-11-13. Only exercise names,
sets, reps and timings (facts) are recorded; descriptions are our own words.
Run: python3 tools/gen_field_sourced.py
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "expansion", "field-sourced.json")


def E(name, sets, reps, weight=None, distance=None, group=None):
    e = {"name": name, "sets": sets, "reps": reps}
    if weight: e["weight"] = weight
    if distance: e["distance"] = distance
    if group: e["group"] = group
    return e


def P(id, name, category, level, sport, goals, minutes, days, equipment, description, who,
      lifestyle, how, exercises, credit, url, note, series=None, day=None, n_in_series=None):
    p = {"id": id, "name": name}
    if series:
        p.update({"series": series, "day": day, "daysInSeries": n_in_series})
    p.update({
        "category": category, "level": level, "sport": sport, "goals": goals,
        "duration": f"{minutes} min", "daysPerWeek": days, "sessionMinutes": minutes,
        "equipment": equipment, "description": description, "whoItsFor": who,
        "lifestyle": lifestyle, "howToRun": how, "exercises": exercises,
        "credit": credit, "sourceUrl": url, "sourceNote": note, "verified": True,
    })
    return p


# ---------------------------------------------------------------- FIFA 11+ (adult) levels 2-3
FIFA_CREDIT = "FIFA Medical Assessment and Research Centre (F-MARC)"
FIFA_ADV_URL = "https://www.wakemed.org/sites/default/files/pdf/Ortho/injury%20prevention%20warmup.pdf"
FIFA_BASIC_URL = "https://www.wakemed.org/sites/default/files/pdf/Ortho/fifa%20basic%20warm%20up%20exercises.pdf"
FIFA_NOTE = ("Read in full from WakeMed Sports Medicine's reproduction of the F-MARC '11+' posters "
             "(advanced strength/plyometrics/balance poster for Part 2; basic poster for Parts 1 and 3, "
             "same host as the existing Level 1 entry). Freely distributed injury-prevention programme; "
             "no reproduction restriction on either poster. Credit F-MARC/FIFA.")

PART1 = [
    E("Running - straight ahead (6-10 cone pairs, 5-6 m apart)", 2, "1 course", group="Part 1"),
    E("Running - hip out", 2, "1 course", group="Part 1"),
    E("Running - hip in", 2, "1 course", group="Part 1"),
    E("Running - circling partner", 2, "1 course", group="Part 1"),
    E("Running - shoulder contact jumps", 2, "1 course", group="Part 1"),
    E("Running - quick forwards & backwards", 2, "1 course", group="Part 1"),
]
PART3 = [
    E("Running across the pitch", 2, "1 width", weight="75-80% max pace", group="Part 3"),
    E("Bounding", 2, "1 width", group="Part 3"),
    E("Plant & cut", 2, "1 width", weight="80-90% max pace", group="Part 3"),
]

fifa_l2 = P(
    "x-field-fifa-11-plus-level-2", "FIFA 11+ Injury Prevention Warm-up (Level 2)", "other",
    "intermediate", "soccer", ["sport-performance", "strength", "general-fitness"], 20, 2,
    ["bodyweight", "cones", "ball", "partner"],
    "The intermediate version of FIFA's 20-minute injury-prevention warm-up: the same running drills, "
    "with harder planks, partner Nordics, walking lunges, partner throwing balance and lateral jumps.",
    "Soccer players aged 14+ who have done Level 1 cleanly for about 4 weeks and want to keep cutting "
    "knee, ankle, hamstring and groin injury risk. Done on the pitch with a partner and a ball.",
    ["outdoor", "minimal-equipment", "time-efficient"],
    ["Start of every training session, at least twice a week, in this order: Part 1, Part 2, Part 3.",
     "Move here from Level 1 when every exercise is done with good technique; each level takes about 4 weeks to master.",
     "Before matches do only the running parts (Parts 1 and 3) - the strength block is not done pre-match.",
     "Knees never buckle inwards on squats, lunges or landings; keep the pelvis level on single-leg work."],
    PART1 + [
        E("The bench - alternate legs (hold each lift 2 s)", 3, "40-60s", group="Part 2"),
        E("Sideways bench - raise & lower hip", 3, "20-30s/side", group="Part 2"),
        E("Nordic hamstrings - intermediate (partner holds ankles)", 1, "7-10", group="Part 2"),
        E("Single-leg stance - throwing ball with partner (2-3 m apart)", 2, "30s/leg", group="Part 2"),
        E("Squats - walking lunges", 2, "10/leg", group="Part 2"),
        E("Jumping - lateral jumps (about 1 m side to side)", 2, "30s", group="Part 2"),
    ] + PART3,
    FIFA_CREDIT, FIFA_ADV_URL, FIFA_NOTE)

fifa_l3 = P(
    "x-field-fifa-11-plus-level-3", "FIFA 11+ Injury Prevention Warm-up (Level 3)", "other",
    "advanced", "soccer", ["sport-performance", "strength", "general-fitness"], 20, 2,
    ["bodyweight", "cones", "ball", "partner"],
    "The advanced level of FIFA's injury-prevention warm-up: one-leg plank holds, side plank with leg "
    "lift, 12-15 Nordics, partner push balance, one-leg squats and explosive multi-direction box jumps.",
    "Experienced soccer players (14+) who have mastered Level 2 and want the hardest version of the "
    "11+ inside their normal warm-up time.",
    ["outdoor", "minimal-equipment", "time-efficient"],
    ["Start of every training session, at least twice a week, in this order: Part 1, Part 2, Part 3.",
     "Only progress here after about 4 weeks of clean Level 2 work; it is fine to be on Level 3 for one exercise and Level 2 for another.",
     "Before matches do only Parts 1 and 3.",
     "If Nordic or one-leg squat technique breaks down, drop back a level for that exercise."],
    PART1 + [
        E("The bench - one leg lift & hold (10-15 cm)", 3, "20-30s/leg", group="Part 2"),
        E("Sideways bench - with leg lift", 3, "20-30s/side", group="Part 2"),
        E("Nordic hamstrings - advanced (partner holds ankles)", 1, "12-15", group="Part 2"),
        E("Single-leg stance - test your partner (push off balance)", 2, "30s/leg", group="Part 2"),
        E("Squats - one-leg squats (hold partner lightly)", 2, "10/leg", group="Part 2"),
        E("Jumping - box jumps (across an imaginary cross)", 2, "30s", group="Part 2"),
    ] + PART3,
    FIFA_CREDIT, FIFA_ADV_URL, FIFA_NOTE)

# ---------------------------------------------------------------- FIFA 11+ Kids
KIDS_URL = "https://tcomn.com/wp-content/uploads/2024/08/FIFA-11-Football.pdf"
KIDS_NOTE = ("Read in full from the official 82-page 'FIFA 11+ for Kids' manual (publisher FIFA Medical "
             "and Research Centre, 2016; content Rossler, Faude, Bizzini, Junge, Dvorak) hosted by "
             "Twin Cities Orthopedics. No reproduction restriction in the manual. Only exercise names and "
             "doses recorded; the manual has full coaching cues and error corrections.")
KIDS_CREDIT = "FIFA Medical and Research Centre (F-MARC) - FIFA 11+ for Kids"
KIDS_HOW = [
    "Replaces the normal warm-up at the start of every training session (at least twice a week); takes 15-20 minutes once learned.",
    "Do the 7 exercises in this order - the manual says the order should not change.",
    "Move a child up a level for an exercise only when they do it correctly over several sessions; levels are never skipped and children can be on different levels for different exercises.",
    "Leave plenty of space between players for the jumps and rolls; wait at least 5 s between rolls.",
]
KIDS_WHO = ("Children aged 7-13 at club or school football. Needs a coach calling commands, one ball per "
            "player and a space from penalty-area to half-pitch size. Players over 14 use the adult 11+.")

kids_l1 = P(
    "x-field-fifa-11-plus-kids-level-1", "FIFA 11+ for Kids (Level 1)", "other", "beginner", "soccer",
    ["sport-performance", "general-fitness"], 20, 2, ["ball", "bodyweight"],
    "FIFA's injury-prevention warm-up for 7-13 year olds, level 1: a stop-on-one-leg running game, "
    "landing practice, partner throwing balance, a press-up tunnel, one-leg jumps, a spider-position "
    "ball drill and learning to fall and roll safely.",
    KIDS_WHO, ["outdoor", "minimal-equipment", "time-efficient"], KIDS_HOW,
    [E("Alertness running game - listen for the stop command (stand on one leg 3 s)", 3, "5 stops"),
     E("Skating jumps - learning how to land (hold 3 s)", 2, "10 jumps (5/leg)"),
     E("Single-leg stance - throwing the ball with a partner", 1, "5 throws/leg"),
     E("Press-ups - tunnel (press-up position, max 8 per group)", 2, "1 ball roll each"),
     E("Single-leg jumps - forwards (hold 3 s)", 2, "5/leg"),
     E("Spiderman - stroking the ball", 3, "15s"),
     E("Sideways roll - from squatting position", 1, "5/side")],
    KIDS_CREDIT, KIDS_URL, KIDS_NOTE, "FIFA 11+ for Kids", 1, 3)

kids_l3 = P(
    "x-field-fifa-11-plus-kids-level-3", "FIFA 11+ for Kids (Level 3)", "other", "beginner", "soccer",
    ["sport-performance", "general-fitness"], 20, 2, ["ball", "bodyweight"],
    "Level 3 of FIFA 11+ for Kids: the running game with a ball in the hands, one-hand ball balance on "
    "landing, a one-leg passing game, rolling the ball around the hands in press-up position, sideways "
    "one-leg jumps, the crab walk and rolls from standing.",
    KIDS_WHO, ["outdoor", "minimal-equipment", "time-efficient"], KIDS_HOW,
    [E("Alertness running game - ball in the hands, listen for the stop command", 3, "5 stops"),
     E("Skating jumps - balancing with the ball in one hand", 2, "10 jumps (5/leg)"),
     E("Single-leg stance - passing game (instep pass and stop)", 1, "5 passes/leg"),
     E("Press-ups - rolling the ball around the hands (figure eight)", 3, "15s"),
     E("Single-leg jumps - sideways (coach gives direction)", 2, "5/leg"),
     E("Spiderman - the crab (on all fours, feet first)", 3, "1", distance="5-10 m"),
     E("Sideways roll - dynamically from a standing position", 1, "5/side")],
    KIDS_CREDIT, KIDS_URL, KIDS_NOTE, "FIFA 11+ for Kids", 2, 3)

kids_l5 = P(
    "x-field-fifa-11-plus-kids-level-5", "FIFA 11+ for Kids (Level 5)", "other", "intermediate", "soccer",
    ["sport-performance", "general-fitness"], 20, 2, ["ball", "bodyweight", "partner"],
    "The top level of FIFA 11+ for Kids: dribbling into one-leg stops, dynamic balance reaches with the "
    "ball, a partner push-balance game, press-up holds on the ball, one-leg jumps in any direction "
    "holding a ball, 'ball bearing' spider walks and rolls from a jog.",
    KIDS_WHO + " Level 5 is for children who have mastered levels 1-4.",
    ["outdoor", "minimal-equipment", "time-efficient"], KIDS_HOW,
    [E("Alertness running game - dribble the ball, listen for the stop command", 3, "5 stops"),
     E("Skating jumps - dynamic balancing with ball (reach ball forward, leg back)", 2, "10 jumps (5/leg)"),
     E("Single-leg stance - testing the partner's balance (balls pressed together)", 1, "20s/leg"),
     E("Press-ups - hands on the ball (walk feet back and forth)", 3, "10s"),
     E("Single-leg jumps - coach indicates direction, ball in both hands", 2, "5/leg"),
     E("Spiderman - ball bearing (roll ball under feet)", 3, "1", distance="3-7 m"),
     E("Sideways roll - from a faster forward movement (quick walk/jog)", 1, "5/side")],
    KIDS_CREDIT, KIDS_URL, KIDS_NOTE, "FIFA 11+ for Kids", 3, 3)

# ---------------------------------------------------------------- IABA home sessions (boxing)
IABA_CREDIT = "Irish Athletic Boxing Association (IABA) - National Youth & Junior Team"
IABA_NOTE_T = ("Free session posted on iaba.ie ({date}) for the IABA National Youth & Junior Teams; read in "
               "full. No copyright or reproduction wording on the page. Round contents summarised in our own "
               "words; Youth (17-18) rounds are 3 min, Junior rounds 2 min.{extra}")


def iaba_note(date, extra=""):
    return IABA_NOTE_T.format(date=date, extra=(" " + extra) if extra else "")


IABA_WHO = ("Amateur boxers and boxing-fit trainees who know their stance, guard and basic punches. Written for "
            "Ireland's youth and junior national squads, so it suits experienced juniors and adults. No partner "
            "or bag needed - just space to move.")

iaba_10 = P(
    "x-field-iaba-school-of-boxing-bodyweight-circuit", "IABA School of Boxing + Bodyweight Circuit",
    "fitness", "intermediate", "boxing", ["sport-performance", "endurance", "fat-loss"], 70, 3,
    ["bodyweight", "mat"],
    "Six themed shadow-boxing rounds (defence-only movement, back-foot boxing, feint-and-counter, jab "
    "ladders, close-range pressure, open round) followed by a 4-set bodyweight circuit on a 30 s on, 5 s off clock.",
    IABA_WHO, ["home", "minimal-equipment", "busy"],
    ["Use 3-minute rounds (2-minute for juniors) with 1 minute rest; visualise an opponent every round.",
     "Keep rounds 1, 5 and 6 at 50-70% effort as written - the quality of movement is the point.",
     "The circuit is 8 moves x 30 s with a 5 s change-over, all bodyweight; rest 1-2 minutes between the 4 sets.",
     "Rest times between rounds and circuit sets are not given by the IABA here - 1 minute and 1-2 minutes are sensible defaults."],
    [E("Warm-up: general warm-up and stretch", 1, "12-15 min"),
     E("Shadow round 1: movement only, defence (60-70%, no punches)", 1, "3 min", group="Rounds"),
     E("Shadow round 2: back-foot boxing, single defensive shots", 1, "3 min", group="Rounds"),
     E("Shadow round 3: lead feint, step off, back-hand attack (1-2 punches)", 1, "3 min", group="Rounds"),
     E("Shadow round 4: full-extension jab ladder (1-2-3 jabs forward and back)", 1, "3 min", group="Rounds"),
     E("Shadow round 5: close-range pressure, no punching, cut off angles", 1, "3 min", group="Rounds"),
     E("Shadow round 6: open round, all ranges (60-70%)", 1, "3 min", group="Rounds"),
     E("Lunges", 4, "30s", group="Circuit"),
     E("Press-ups", 4, "30s", group="Circuit"),
     E("Tuck jumps", 4, "30s", group="Circuit"),
     E("Sit-ups", 4, "30s", group="Circuit"),
     E("Squats", 4, "30s", group="Circuit"),
     E("Plank", 4, "30s", group="Circuit"),
     E("Leg raises (up and down)", 4, "30s", group="Circuit"),
     E("Ankle grabs", 4, "30s", group="Circuit")],
    IABA_CREDIT, "https://iaba.ie/iaba-home-training-sessions-10/",
    iaba_note("25/05/2021", "Rest between rounds and between circuit sets is not stated on the page; 1 min is the IABA default used in its other sessions."))

iaba_5 = P(
    "x-field-iaba-counter-attack-rounds-skipping", "IABA Counter-Attack Rounds + Skipping Ladder",
    "fitness", "advanced", "boxing", ["sport-performance", "endurance"], 90, 2,
    ["bodyweight", "jump rope"],
    "A long technical session: 6 school-of-boxing shadow rounds, then 8 counter-attack rounds (jabs, slips, "
    "blocks, side steps, shifts, step-backs, lean-backs) and a 5-minute skipping ladder from 50% to flat out.",
    IABA_WHO + " Best for boxers who already shadow box comfortably for 6+ rounds.",
    ["home", "minimal-equipment"],
    ["School-of-boxing rounds: 3 min (juniors 2 min) with 1 minute rest; sip water between rounds.",
     "Counter-attack rounds: follow the rep counts in each round (x5 each), then rest 2 minutes before skipping.",
     "Skip 5 minutes without stopping, lifting the pace every minute: 50, 60, 70, 80, then 100%.",
     "Cool down with 5 minutes light skipping and 15 minutes of stretching, rolling any problem areas."],
    [E("Warm-up", 1, "12 min"),
     E("Stretch", 1, "3 min"),
     E("School of boxing: shadow rounds (defence, feints, attacks)", 6, "3 min"),
     E("Counter round 1: from front station - jab x5, back hand x5, 2-1 x5", 1, "1 round", group="Counter"),
     E("Counter round 2: same as round 1, after slips", 1, "1 round", group="Counter"),
     E("Counter round 3: slip in, close distance, up to 3 punches (x5 each side)", 1, "1 round", group="Counter"),
     E("Counter round 4: after blocks, 1-3 punches of choice", 1, "1 round", group="Counter"),
     E("Counter round 5: side step x5, shifts x5, then up to 3 punches after each defence", 1, "1 round", group="Counter"),
     E("Counter round 6: step back + counter defence, 1-3 punches each side", 1, "1 round", group="Counter"),
     E("Counter round 7: step back with same-time punch, rotating sides", 1, "1 round", group="Counter"),
     E("Counter round 8: after lean back, 1-3 punches both hands (x5)", 1, "1 round", group="Counter"),
     E("Rest", 1, "2 min"),
     E("Skipping ladder (50-60-70-80-100%, 1 min each, no break)", 1, "5 min"),
     E("Recovery", 1, "1 min"),
     E("Cool-down: light skipping", 1, "5 min"),
     E("Stretch and roll (feet to head)", 1, "15 min")],
    IABA_CREDIT, "https://iaba.ie/iaba-home-training-sessions-5/",
    iaba_note("27/03/2021", "Counter-attack round length is not stated; use your normal round length. The same day's S&C AMRAP was skipped because its set count is contradictory on the page."))

iaba_12 = P(
    "x-field-iaba-school-of-boxing-shuttle-sprints", "IABA School of Boxing + Shuttle Sprints",
    "fitness", "intermediate", "boxing", ["sport-performance", "endurance", "strength"], 55, 3,
    ["bodyweight"],
    "Six shadow rounds (defence-only movement, high-tempo feints, lead-hand feints, second-phase combos, "
    "close-range pressure, open round), then 25 m shuttle sprints with jog-back recovery and a short "
    "press-up, sit-up and squat-thrust finisher.",
    IABA_WHO + " Needs about 25 m of safe running space for the sprints.",
    ["home", "outdoor", "minimal-equipment"],
    ["Shadow rounds 3 min (juniors 2 min) with about 1 minute rest.",
     "Warm up the legs well before sprinting; sprint the 25 m flat out and jog slowly back as the recovery, letting your breathing settle before the next one.",
     "Youths do 5 sets of 5 sprints, juniors 5 sets of 4 (the page writes '5 x 5 sets' / '5 x 4 sets').",
     "Core finisher 3 x 15 of each; stretch afterwards."],
    [E("Warm-up: general warm-up and stretch", 1, "12-15 min"),
     E("Shadow round 1: movement only at 50%, defence", 1, "3 min", group="Rounds"),
     E("Shadow round 2: high-tempo movement and feints only", 1, "3 min", group="Rounds"),
     E("Shadow round 3: lead hand only - feint head/throw body, feint body/throw head", 1, "3 min", group="Rounds"),
     E("Shadow round 4: 2nd-phase combos - draw, slip/step, return 2-3 punches", 1, "3 min", group="Rounds"),
     E("Shadow round 5: close range - short hooks and uppercuts, high guard", 1, "3 min", group="Rounds"),
     E("Shadow round 6: open round, all ranges (60-70%)", 1, "3 min", group="Rounds"),
     E("Shuttle sprint, jog back recovery", 5, "5", distance="25 m", weight="flat out"),
     E("Press-ups", 3, "15", group="Core"),
     E("Sit-ups", 3, "15", group="Core"),
     E("Squat thrusts", 3, "15", group="Core")],
    IABA_CREDIT, "https://iaba.ie/iaba-home-training-sessions-12/",
    iaba_note("11/06/2021", "Sprint dose recorded as 5 sets x 5 sprints (youth); juniors 5 x 4. Rest between rounds is not stated on this page."))

iaba_15 = P(
    "x-field-iaba-technical-rounds-skipping-planks", "IABA Technical Rounds, Skipping & Planks",
    "fitness", "intermediate", "boxing", ["sport-performance", "endurance"], 80, 3,
    ["bodyweight", "jump rope", "mat"],
    "Six technical shadow rounds on a short 30 s rest (lead hand only, back hand only, spin-offs, rolls, "
    "uppercut/hook leads, open round), then 6 x 3-minute skipping rounds with a 10 s sprint finish each "
    "minute and 5 x 1-minute front planks.",
    IABA_WHO, ["home", "minimal-equipment"],
    ["Technical rounds 3 min (juniors 2 min) with only 30 s rest - then a full 3-minute break.",
     "Skipping: 50 s medium pace then 10 s as fast as you can, repeated through each 3-minute round, 1 minute rest between rounds.",
     "Front plank: forearms down, elbows under shoulders, legs together, back flat; 30 s between holds.",
     "Finish with a 10-minute cool-down stretch."],
    [E("Warm-up: general warm-up and stretching", 1, "12-15 min"),
     E("Technical round 1: lead hand only, any distance (back hand defends)", 1, "3 min", group="Rounds"),
     E("Technical round 2: back hand only, any distance", 1, "3 min", group="Rounds"),
     E("Technical round 3: 3-4 punch combos at long range, turn/spin off every 15 s", 1, "3 min", group="Rounds"),
     E("Technical round 4: 3-4 punch combos at short range, roll out every 15 s", 1, "3 min", group="Rounds"),
     E("Technical round 5: 2-3 shot combos led by uppercut or hook", 1, "3 min", group="Rounds"),
     E("Technical round 6: open round, correct technique at high pace", 1, "3 min", group="Rounds"),
     E("Rest", 1, "3 min"),
     E("Skipping rounds (50 s medium + 10 s max, repeat)", 6, "3 min"),
     E("Front plank", 5, "1 min"),
     E("Cool-down stretch", 1, "10 min")],
    IABA_CREDIT, "https://iaba.ie/iaba-home-training-sessions-15/",
    iaba_note("15/08/2021", "Round 2 is headed 'back hand only' but its description repeats round 1's wording; we followed the heading."))

iaba_18a = P(
    "x-field-iaba-shadow-feints-counters", "IABA Shadow Rounds: Feints & Counters",
    "fitness", "intermediate", "boxing", ["sport-performance", "endurance"], 60, 2,
    ["bodyweight", "jump rope"],
    "Six detailed shadow rounds built around shape and feints: movement-only, long-range feints, feints "
    "into mid-range uppercut counters, side-step attacks, defence-then-counter and a free round, finished "
    "with 10 minutes of light skipping.",
    IABA_WHO, ["home", "minimal-equipment"],
    ["Morning session; pair it with the IABA run + circuit + planks session later the same day, or do it on its own.",
     "Rounds 3 min (juniors 2 min) with 1 minute rest; sip water between rounds.",
     "Hands high and elbows tucked through every round; mix the two patterns in the last 30 s of rounds 2 and 3.",
     "Cool down with 10 minutes of light skipping and 10 minutes of full-body stretching."],
    [E("Warm-up", 1, "12 min"),
     E("Stretch", 1, "3 min"),
     E("Round 1: shape, movement, slips/ducks/rolls and feints - no punching", 1, "3 min", group="Rounds"),
     E("Round 2: long-range feints (show lead, body back hand; show back hand, lead to head)", 1, "3 min", group="Rounds"),
     E("Round 3: feints with mid-range uppercut counters, finish with explosive hook", 1, "3 min", group="Rounds"),
     E("Round 4: side-step with same-time punch, add straight shot then back-hand hooks", 1, "3 min", group="Rounds"),
     E("Round 5: step back + counter defence, then 3-4 punches head and body", 1, "3 min", group="Rounds"),
     E("Round 6: free round - attack, defence, guard, movement", 1, "3 min", group="Rounds"),
     E("Cool-down: light skipping", 1, "10 min"),
     E("Full-body stretch", 1, "10 min")],
    IABA_CREDIT, "https://iaba.ie/iaba-home-training-sessions-18/", iaba_note("04/09/2021"),
    "IABA Home Session 4 Sep 2021", 1, 2)

iaba_18b = P(
    "x-field-iaba-run-circuit-planks", "IABA Run, Power Circuit & Plank Series",
    "fitness", "intermediate", "boxing", ["endurance", "strength", "fat-loss"], 70, 2,
    ["bodyweight", "mat"],
    "Boxing S&C at home: 20 minutes running at a good pace, two rounds of a 7-station circuit (30 reps "
    "each of star jumps, paused squats, push-ups, sit-ups, tuck jumps, Russian twists, burpees) and a "
    "6-minute front and side plank series.",
    "Boxers and boxing-fitness trainees who want a no-equipment strength-endurance session. Written for "
    "the IABA youth and junior squads, so expect it to be hard; scale reps down if 30 is too many.",
    ["home", "outdoor", "minimal-equipment"],
    ["Afternoon session paired with the IABA feints & counters shadow rounds, or on its own on a conditioning day.",
     "Run 20 minutes at a good, steady pace before the circuit.",
     "Circuit: 15 s between stations, 2 minutes between the two circuits.",
     "Plank series with 30 s between stations; cool down with 5 minutes light skipping or jogging on the spot and 10 minutes of stretching."],
    [E("Warm-up: general warm-up and stretch", 1, "10 min"),
     E("Run at a good pace", 1, "20 min"),
     E("Explosive star jumps", 2, "30", group="Circuit"),
     E("Squats with 3 s hold at the bottom", 2, "30", group="Circuit"),
     E("Push-ups", 2, "30", group="Circuit"),
     E("Sit-ups", 2, "30", group="Circuit"),
     E("Tuck jumps (knees to chest)", 2, "30", group="Circuit"),
     E("Russian twists", 2, "30", group="Circuit"),
     E("Burpees", 2, "30", group="Circuit"),
     E("Front plank", 1, "1 min", group="Planks"),
     E("Left side plank with arm raises", 1, "1 min", group="Planks"),
     E("Right side plank with arm raises", 1, "1 min", group="Planks"),
     E("Front plank rising to full arms (alternate)", 1, "1 min", group="Planks"),
     E("Front plank with alternate leg raise", 1, "1 min", group="Planks"),
     E("Side plank with top-leg raises (30 s each side, no rest)", 1, "1 min", group="Planks"),
     E("Cool-down: light skipping or jog on the spot", 1, "5 min"),
     E("Stretch (feet to head)", 1, "10 min")],
    IABA_CREDIT, "https://iaba.ie/iaba-home-training-sessions-18/", iaba_note("04/09/2021"),
    "IABA Home Session 4 Sep 2021", 2, 2)

iaba_19a = P(
    "x-field-iaba-shadow-rounds-skipping-ladder", "IABA Shadow Boxing Rounds + Skipping Ladder",
    "fitness", "advanced", "boxing", ["sport-performance", "endurance"], 65, 2,
    ["bodyweight", "jump rope"],
    "A school-of-boxing session that builds from footwork and defence to counters off slips and "
    "blocks, an intense close-range round and a hard free round, then 2 x 5 minutes of skipping that gets "
    "faster each minute.",
    IABA_WHO,
    ["home", "minimal-equipment"],
    ["Dynamic warm-up 12 minutes plus a 3-minute stretch.",
     "Rounds 3 min (juniors 2 min) with 1 minute rest; the page sets 7 rounds but describes six - do the six below, adding a seventh free round only if you are used to 7.",
     "Skipping: two 5-minute blocks, starting light and lifting speed every minute.",
     "Cool down and stretch for 10 minutes. Pair with the IABA core session the same day if you want a double."],
    [E("Dynamic warm-up", 1, "12 min"),
     E("Stretch", 1, "3 min"),
     E("Round 1: footwork and defence only, build intensity", 1, "3 min", group="Rounds"),
     E("Round 2: open round - 1-4 punch combos, then defence + double attack", 1, "3 min", group="Rounds"),
     E("Round 3: counters - slip and close distance, 1-4 punches", 1, "3 min", group="Rounds"),
     E("Round 4: counters off blocks - 1-3 punches, then block + double attack", 1, "3 min", group="Rounds"),
     E("Round 5: intense close range - hooks, uppercuts, body-head shifts", 1, "3 min", group="Rounds"),
     E("Round 6: free round with intensity and power", 1, "3 min", group="Rounds"),
     E("Skipping, light then faster each minute", 2, "5 min"),
     E("Cool-down and stretch", 1, "10 min")],
    IABA_CREDIT, "https://iaba.ie/iaba-home-training-sessions-19/",
    iaba_note("12/09/2021", "The page lists 7 rounds (7 x 3 min youth, 7 x 2 min junior) but describes six themes; only the six described rounds are recorded."),
    "IABA Home Session 11-12 Sep 2021", 1, 2)

iaba_19b = P(
    "x-field-iaba-run-core-series", "IABA Run + Boxer's Core Series",
    "fitness", "intermediate", "boxing", ["endurance", "strength", "general-fitness"], 60, 2,
    ["bodyweight", "mat"],
    "A 60-minute S&C session: 20 minutes running at a good pace, then two rounds of a 10-exercise floor core "
    "series (sit-ups, crunch pulses, rotations, side sways, elbow-to-knee, leg holds, criss-cross, supermans) "
    "and a long stretch.",
    "Boxers and anyone wanting a tough no-equipment run-and-core session. Written for the IABA youth and "
    "junior squads.",
    ["home", "outdoor", "minimal-equipment"],
    ["Warm up for 10 minutes, then run 20 minutes at a good pace and recover for 3 minutes.",
     "Core series: knees bent hip-width, neck neutral ('an apple between chin and chest'); do the list once, rest 2 minutes, repeat.",
     "Jog lightly on the spot with arm crosses and trunk twists for 5 minutes after the core work.",
     "Stretch for 10 minutes, rolling any tight spots."],
    [E("Warm-up: general warm-up and stretch", 1, "10 min"),
     E("Run at a good pace", 1, "20 min"),
     E("Recovery", 1, "3 min"),
     E("Sit-ups, knees bent", 2, "30", group="Core"),
     E("Crunches with finger slide and 1-inch pulse", 2, "30", group="Core"),
     E("Bent-leg crunch, push arms between legs", 2, "30", group="Core"),
     E("Sit-up with hands rotating outside alternate legs", 2, "30", group="Core"),
     E("Low side sways (touch sides of feet)", 2, "30", group="Core"),
     E("Elbow to opposite knee", 2, "15/side", group="Core"),
     E("Leg hold 15 cm off floor, open and close", 2, "30", group="Core"),
     E("Leg criss-cross 15 cm off floor", 2, "30", group="Core"),
     E("Criss-cross with leg rise, 4-count", 2, "4", group="Core"),
     E("Superman hold (3 s)", 2, "4", group="Core"),
     E("Light jog on the spot with arm crosses and trunk twists", 1, "5 min"),
     E("Full-body stretch with roller", 1, "10 min")],
    IABA_CREDIT, "https://iaba.ie/iaba-home-training-sessions-19/",
    iaba_note("12/09/2021", "S&C session dated Saturday 11 September 2021 on the page; '6 inches' converted to about 15 cm."),
    "IABA Home Session 11-12 Sep 2021", 2, 2)

eb_skip = P(
    "x-field-england-boxing-skipping-rounds", "England Boxing Skipping Rounds",
    "fitness", "beginner", "boxing", ["endurance", "sport-performance", "fat-loss"], 15, 3,
    ["jump rope"],
    "Three skipping rounds that rotate normal skipping, high knees, cross-overs and double unders every "
    "10 seconds in a different order each round, to mimic the changing pace of a bout.",
    "Boxers and boxing-fitness beginners who can already skip steadily for a minute. Rounds are 1.5 min "
    "for schools-age, 2 min for juniors and 3 min for youths and seniors. Use double unders only once you "
    "can do them; otherwise swap in fast singles.",
    ["home", "minimal-equipment", "time-efficient", "travel"],
    ["Warm up for a few minutes first, with suitable footwear on a safe, non-slip surface.",
     "Each round: change the skill every 10 s and keep cycling the four skills until the bell.",
     "Rest about 1 minute between rounds (England Boxing does not state the rest).",
     "Use it as a finisher after shadow or bag work, or as a short stand-alone session."],
    [E("Warm-up: easy skipping and mobility", 1, "5 min"),
     E("Round 1: normal - high knees - cross-overs - double unders (10 s each, repeat)", 1, "3 min"),
     E("Round 2: high knees - cross-overs - double unders - normal (10 s each, repeat)", 1, "3 min"),
     E("Round 3: cross-overs - double unders - normal - high knees (10 s each, repeat)", 1, "3 min")],
    "England Boxing (drills led by England Talent Assistant Coach Q Shillingford)",
    "https://www.englandboxing.org/news_articles/england-boxing-drills-week-12/",
    "Free article on englandboxing.org (8 June 2020), part of Performance Coach Mick Driscoll's weekly home-drill "
    "series; read in full. No copyright or reproduction wording on the page. Round lengths by age are as stated; "
    "rest between rounds is not stated.")

PROGRAMS = [fifa_l2, fifa_l3, kids_l1, kids_l3, kids_l5,
            iaba_10, iaba_5, iaba_12, iaba_15, iaba_18a, iaba_18b, iaba_19a, iaba_19b, eb_skip]

if __name__ == "__main__":
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(PROGRAMS, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print("wrote", OUT, len(PROGRAMS))
