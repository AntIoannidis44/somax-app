import json, sys
OUT = sys.argv[1]
V, U, D = "verified", "UNVERIFIED", "DERIVED"

pb = {
 "sport": "afl",
 "version": 1,
 "generated": "2026-11-12",
 "notes": "Australian rules football (AFL/AFLW, community to elite). Labels: 'verified' = read on a fetched page/PDF listed in sources; 'UNVERIFIED' = search snippet, secondary summary or Somax coaching convention; 'DERIVED' = our arithmetic on verified numbers. Shared sprint/plyo/periodisation rules (Haugen 2019, NSCA) are already verified in sports.json (football) and are referenced, not repeated. Library programs live in ../afl-programs.json.",
 "benchmarks": [
  {"id": "tt_2km", "label": "2 km time trial", "unit": "mm:ss",
   "howToTest": "Flat measured 2 km (5 laps of a 400 m track, or a measured oval course). Run as fast as possible at even effort; walking allowed but discouraged; record finish time. Test fresh (48 h after hard training), same course each time. The AFL Draft Combine replaced its 3 km run with the 2 km time trial in 2017; girls at the 2026 AFLW combine ran 1.6 km instead.",
   "confidence": V},
  {"id": "sprint_20m", "label": "20 m sprint (with 5 m and 10 m splits)", "unit": "seconds",
   "howToTest": "Combine protocol: crouched/standing start, sprint 20 m, gates at 5, 10 and 20 m, best of 3 attempts. In the app: phone timing gate/video app or partner with a stopwatch from first movement - hand timing is unreliable over 20 m (see sports.json), so only compare like with like.",
   "confidence": V + " (combine protocol via Wikipedia/AFL.com.au); timing caveat from sports.json"},
  {"id": "yoyo_ir1", "label": "Yo-Yo Intermittent Recovery Test Level 1", "unit": "metres (or level.shuttle)",
   "howToTest": "2 x 20 m shuttles to the beep with 10 s active recovery around a cone 5 m behind the start; speed rises each level; two misses ends it. Score = total metres. Replaced the 20 m beep test at the AFL combine in 2017. Fallback: 20 m multistage (beep) test - record level.shuttle, never mix the two. Full protocol in sports.json (football).",
   "confidence": V + " (combine change); protocol from sports.json"},
  {"id": "vertical_jump", "label": "Vertical jump (standing two-foot and running one-foot)", "unit": "cm",
   "howToTest": "Combine: standing two-foot jump and one-foot running jump touching the highest vane on a Vertec (reach-and-jump). In the app: countermovement jump (hands on hips) via jump app/mat, best of 3, ~1 min rest; record which method so retests match. Running-VJ and Vertec scores are NOT comparable with app CMJ scores.",
   "confidence": V + " (combine protocol); app method per sports.json"},
  {"id": "rsa_6x30", "label": "Repeat-sprint test 6 x 30 m", "unit": "seconds (total and % decrement)",
   "howToTest": "6 x 30 m all-out sprints starting every 20 s (jog/walk back), standardised warm-up first. Record best, total and decrement % = (total / (best x 6) - 1) x 100. No AFL-specific fetched protocol found.",
   "confidence": U},
  {"id": "agility_afl", "label": "AFL agility test (optional)", "unit": "seconds",
   "howToTest": "Combine: start upright, pass through the gates and weave a set pole course without touching poles, finishing through the gates. Exact course dimensions not on a fetched page, so the app should treat it as a club-run test only (log the club's time).",
   "confidence": V + " (description); dimensions UNVERIFIED"}
 ],
 "levelPlacement": {
  "method": "Place by 2 km time first (it is the test community clubs actually run), then sanity-check with 20 m sprint/Yo-Yo. Use the LOWER of aerobic and speed placement for overall session intensity. Ask sex because AFLW and AFL bands differ; juniors (<16) are never placed above 'community'.",
  "tt2km_men": {
   "elite_reference": "Draft combine top 10 typically ~5:59-6:10; record 5:28 (Harry Sharp, 2020); 2024 best 6:05, 2026 best 5:59. (verified)",
   "elite": "< 6:30 (" + U + ")",
   "subElite": "6:30-7:15 (" + U + ")",
   "communityStrong": "7:15-8:00 (" + U + ")",
   "community": "8:00-9:00 (" + U + ")",
   "developing": "> 9:00 (" + U + ")"
  },
  "tt2km_women": {
   "elite_reference": "AFLW combine 2 km record 7:02 (Sarah Poustie, 2024; previous best 7:09, 2023). From 2026 the girls' combine uses 1.6 km (best 5:27). (verified)",
   "elite": "< 7:40 (" + U + ")",
   "subElite": "7:40-8:30 (" + U + ")",
   "communityStrong": "8:30-9:30 (" + U + ")",
   "community": "9:30-10:30 (" + U + ")",
   "developing": "> 10:30 (" + U + ")"
  },
  "sprint20m_reference": "Men: combine record 2.75 s (2010); 2024 best 2.815, 2026 best 2.827. Women: 2024 best 3.125, 2026 best 3.059 (second-fastest ever). (verified) App bands UNVERIFIED: men elite <2.95, sub-elite 2.95-3.10, community >3.10; women elite <3.25, sub-elite 3.25-3.45, community >3.45 (electronic timing; add ~0.15-0.25 s tolerance for phone/hand timing).",
  "verticalJump_reference": "Combine standing VJ: boys 2024 best 76 cm, 2026 best 88 cm; girls 63 cm (2024), 61 cm (2026). Running VJ: boys 2026 record 114 cm (prior record 107 cm, 2021); girls 67 cm (2024), 75 cm (2026). (verified) These are Vertec reach heights, not app CMJ heights.",
  "yoyoIR1": "No fetched AFL-specific norm table. Elite junior AF players covered significantly more Yo-Yo IR1 distance than sub-elite juniors (Veale 2010, verified abstract, no numbers). Use the football bands in sports.json (TopEndSports, guidance only). UNVERIFIED.",
  "caveat": "Combine numbers are the best ~18-year-old draft prospects in the country - use them only as the ceiling of the 'elite' band. Community/sub-elite cut-offs are Somax heuristics pending a club or state-league dataset."
 },
 "seasonPhases": {
  "calendar": "Community senior footy: off-season ~Sep-Oct, pre-season ~Nov-Mar (Christmas break, practice matches Feb-Mar), home-and-away ~Apr-Aug, finals Aug-Sep. Play AFL's umpire training-year plans pre-season 4-6 weeks and in-season 18-20 weeks (verified, umpire document). Exact dates vary by league - let users set round 1. UNVERIFIED for players.",
  "offSeason": {"goal": "Recover (2-4 weeks active rest), then rebuild aerobic base and general strength.", "sessions": "2-4/week: easy runs, cross-training, 2 strength sessions (hypertrophy/basic strength per NSCA in sports.json).", "confidence": D},
  "preSeason": {"goal": "Build 2 km/Yo-Yo fitness, high-speed running and repeat-sprint ability; peak strength/power; FootyFirst or Prep to Play every session.", "rules": ["SMA: ideally at least 4 weeks of pre-season training; keep active during breaks (verified).", "Play AFL (umpires): build up slowly - increasing too fast leads to overuse injuries; 1 day on/1 day off for the same type of training (verified).", "Club 2 km time trials are run at the start and through pre-season (e.g. 3 dates in a 14-week program, AFL Players article - verified)."], "sessions": "Club 2 nights + 1-3 individual sessions (running, strength x2-3)."},
  "inSeason": {"goal": "Maintain strength/power and fitness; arrive fresh on Saturday.", "rules": ["1 strength session per week maintains pre-season strength and sprint (Ronnestad 2011, verified in sports.json).", "Copenhagen once a week in-season was the groin-programme dose (Haroy 2019, verified).", "Prep to Play: warm-up only on match day (verified)."]},
  "matchDayRules": {
   "MD": "Game (Saturday). Warm-up = Prep to Play dynamic warm-up (10 min) or FootyFirst warm-up + footy skills.",
   "MD+1": "Recovery only: easy walk/swim/bike 15-20 min + mobility flush; no sprinting, plyos or heavy lifting. (Play AFL Prep to Play lists walking, swimming, bike riding as active recovery - verified; the 'no intensity' rule is UNVERIFIED convention.)",
   "MD+2": "Rest or light.",
   "MD-4/MD-3": "Main strength/power + speed day (Tue/Wed). Typical club training night.",
   "MD-2": "Club training night (Thu): skills, moderate running. Keep extra conditioning off this day.",
   "MD-1": "Rest or 10-15 min activation (warm-up drills + 3-4 strides). No Nordics, no heavy legs, no conditioning.",
   "spacing": ">=48 h between maximal sprint/plyo days and before a game (Haugen in sports.json). Avoid alcohol 48 h before a game (SMA, verified).",
   "confidence": "Labels UNVERIFIED convention; spacing rules verified via sports.json/SMA."
  }
 },
 "improvementModel": {
  "tt2km": {
   "evidence": [
    {"fact": "A commercial 12-week AFL running block claims an average 35 s improvement in 2 km TT (provider claim, search snippet only).", "confidence": U},
    {"fact": "For runners, VDOT rises ~1 point per 4-6 weeks for trained athletes (Daniels, verified in running.json).", "confidence": V + " (running.json)"}
   ],
   "weeklyRatePct": {"developing": 1.0, "community": 0.7, "communityStrong": 0.5, "subElite": 0.35, "elite": 0.2},
   "phaseMultiplier": {"offSeason": 0.8, "preSeason": 1.0, "inSeason": 0.3},
   "daysPerWeekMultiplier": {"2": 0.8, "3": 1.0, "4": 1.1, "5": 1.15, "6": 1.2},
   "confidence": D + "/" + U + ": calibrated so a ~7:30 community player gains ~35-45 s in 12 weeks (matches the provider claim and ~1 VDOT per 4-6 weeks). Alternative: convert 2 km time to VDOT and reuse running.json's engine.",
   "integration": "Simulate week by week: time *= (1 - rate(level(time))/100 * multipliers); re-look-up the band each week so gains slow as the player gets fitter."
  },
  "sprint20m": "Use sports.json sprint rates (beginner 0.4%/wk, intermediate 0.2%/wk, advanced 0.1%/wk; DERIVED). Changes < ~1% are noise.",
  "verticalJump": "Use sports.json CMJ rates (Markovic 2007: ~8.7% over a 6-10 week plyo block; DERIVED weekly 1.0/0.6/0.3%).",
  "yoyo": "Use sports.json Yo-Yo rates (DERIVED 4/3/1.5% of baseline per week, in-season = maintain).",
  "rsa": "UNVERIFIED: repeat-sprint decrement improves alongside Yo-Yo; target decrement <5-6% for sub-elite. Plan from Yo-Yo/2 km goal instead."
 },
 "planLengthRule": {
  "formula": "gapPct = (current - target) / current x 100 (time-based tests); weeks = simulated weeks to reach target under improvementModel; round up to whole 4-week blocks; insert a lighter week every 3rd-4th week (Haugen 3:1 / 2:1, sports.json).",
  "minWeeks": 4,
  "maxWeeks": 16,
  "preSeasonWindowCap": "If the goal is a club time-trial date or round 1, plan length = min(weeks needed, weeks until that date). If weeks needed > weeks available, set a milestone target reachable by the date (conservative scenario x0.7) and tell the user the full goal continues in-season/next pre-season.",
  "milestoneSplitting": "If weeks > 16: block 1 target = time reachable in 16 weeks (conservative), rounded to the nearest 5 s; retest; generate next block. If total > 52 weeks, mark 'long-term'.",
  "inSeasonCap": "In-season the 2 km goal is maintain/±small gains only: lengthen the plan rather than add running volume, because club training + game already carry the load.",
  "retest": "2 km every 4-6 weeks in pre-season (clubs commonly run 3 trials across pre-season); sprint/jump every 4 weeks; never retest MD-1 or MD+1.",
  "workedExamples": [
   "Male community player, 2 km 8:20, target 7:45 by round 1 in 14 weeks, 3 days/week, pre-season: 0.7%/wk to 8:00 (~6 wk) then 'communityStrong' 0.5%/wk to 7:45 (~6 wk) -> ~12 weeks -> plan 12 weeks (3 x 4-week blocks), fits the 14-week window. DERIVED.",
   "Female player, 2 km 10:40, target 9:00 in 10 weeks: needs ~27 weeks (1.0% -> 0.7% -> 0.5%/wk as bands change) -> 10-week milestone ~9:55 expected / ~10:10 conservative (use 10:10), retest, then further blocks. DERIVED."
  ]
 },
 "volumeModel": {
  "matchDemands": "Elite men cover ~12.9 km (12,897 ± 1,601 m) per game at ~129 m/min over 100+ minutes (Johnston 2018 via Wing 2021 review, verified); high-speed thresholds vary from >14.4 to >20 km/h between studies (verified). AFLW (Clarke 2018, verified abstract): relative distance ~102-107 m/min for tall backs/forwards and higher for mids; HSR (>14.4 km/h) ~28 m/min for midfielders and small backs vs 17 m/min tall backs. Elite matches are more intense than sub-elite (~9% higher relative distance, review via search, UNVERIFIED).",
  "runningKmPerWeek": {
   "developing": "8-15 km (" + U + ")",
   "community": "12-20 km incl. club training (" + U + ")",
   "subElite": "20-30 km (" + U + "; Play AFL plans 25-30 km/week for state-league/AFLW field umpires in pre-season, verified)",
   "elite": "30-40 km (" + U + ")",
   "rule": "Count club training and games toward the weekly total; increase gradually (Play AFL: build up slowly; no fetched % cap - Somax uses <=10%/week, UNVERIFIED)."
  },
  "highSpeedRunning": "1 dedicated HSR session/week in pre-season (Play AFL umpire week: 'High Speed x1 (200 m max)', threshold x1, aerobic x1-2, verified). Somax: weekly HSR (>~80% max speed) 400-1200 m community, 800-2000 m sub-elite (UNVERIFIED).",
  "sprintExposures": "Expose to >=90-95% max speed 1-2x/week (build-ups/flying 10s), 50-150 m per max-velocity session, 100-300 m acceleration work (Haugen table in sports.json).",
  "strengthSessions": {"offSeason": "2-3/week", "preSeason": "2/week", "inSeason": "1/week (2 if only 1 club session)", "source": "Play AFL umpires 1-2/week (verified); Ronnestad in sports.json (1/week maintains)."},
  "plyoContacts": "NSCA (sports.json): beginner 80-100, intermediate 100-120, advanced 120-140 per session, 48-72 h apart; in-season ~50-60% and never MD-1. Note FootyFirst/Prep to Play landings (~20-40 contacts) count toward the total.",
  "injuryPreventionDose": "FootyFirst or Prep to Play at least 2x/week, every session ideally (verified)."
 },
 "weekStructure": {
  "assumption": "Club training Tuesday + Thursday nights, game Saturday. Shift labels if the user's nights differ. Sessions below are the user's OWN sessions in addition to club training unless marked 'club'.",
  "preSeason": {
   "2": ["Mon: strength (lower) + Hamstring & Groin", "Sat: running (aerobic base / 2 km builder)"],
   "3": ["Mon: strength (lower) + Body Armour", "Wed: running intervals (2 km builder or repeat sprint)", "Sat: strength (upper/contact) + easy run"],
   "4": ["Mon: strength (lower)", "Wed: running intervals", "Fri: speed & agility (short)", "Sat: long easy run or repeat sprint + strength (upper)"],
   "5": ["Mon: strength (lower)", "Tue: club", "Wed: running intervals + Body Armour", "Thu: club", "Sat: strength (upper) + speed"],
   "6": ["Mon: strength (lower)", "Tue: club", "Wed: running (threshold/200s)", "Thu: club", "Fri: easy run/mobility", "Sat: speed + strength (upper)"]
  },
  "inSeason": {
   "2": ["Sun (MD+1): game-day recovery", "Tue or Wed (MD-4/3): in-season maintenance (1 day)"],
   "3": ["Sun: recovery", "Tue/Wed: maintenance strength + short speed", "Thu: club only (no extra)"],
   "4": ["Sun: recovery", "Mon: easy run/swim (if not playing much game time)", "Tue/Wed: maintenance strength", "Thu: club; Fri: rest (MD-1)"],
   "5": ["Sun: recovery", "Mon: top-up running for low-minutes players", "Tue: club", "Wed: maintenance strength + speed", "Thu: club"],
   "6": ["As 5 + Fri MD-1 activation only (10-15 min)"],
   "byeWeek": "Keep strength, add one aerobic session, take an extra rest day."
  },
  "offSeason": {"2-6": "Weeks 1-2-4 active rest (any sport, 2-3 easy sessions); then 2 strength + 1-3 easy/aerobic runs; no club sessions."},
  "confidence": U + " (structure); built from verified constraints: MD-1 light, >=48 h between max efforts, 1 strength/week in-season, injury-prevention >=2x/week."
 },
 "sessionTemplates": [
  {"id": "afl_footyfirst_wu", "name": "FootyFirst warm-up + level block", "type": "injury_prevention_warmup",
   "useWhen": "Start of every club or solo training session, >=2x/week, pre-season and in-season. Advance a level every ~4 weeks (8 sessions).",
   "exercises": [
    {"name": "Group warm-up: jog, side-to-side, carioca, backward run, butt kicks x2, hands-to-ground (20 m lanes, 9 trips)", "sets": 1, "reps": "about 5 min", "intensity": "jog"},
    {"name": "Dynamic stretches: calf straight/bent 5/leg, hip rotation 4/leg, leg swings fwd/across 6/leg, walking lunge 8", "sets": 1, "reps": "as listed"},
    {"name": "Hamstring lower (Nordic) by level: L1 1x6, L2 2x5, L3 2x8, L4 2x10, L5 2x12", "sets": 2, "reps": "per level", "group": "hamstring"},
    {"name": "Groin by level: ball squeeze -> side-lying lift -> running man -> squeeze w/ leg lift -> body lift (Copenhagen-style)", "sets": 2, "reps": "per level", "group": "groin"},
    {"name": "Hip by level: side plank variations, 5 reps/side", "sets": 1, "reps": "5/side", "group": "hip"},
    {"name": "Balance/landing/change of direction by level (single-leg balance -> hops/landings -> pre-planned -> unanticipated side-steps)", "sets": 1, "reps": "per level", "group": "landing"}
   ]},
  {"id": "afl_p2p_wu", "name": "Prep to Play dynamic warm-up", "type": "injury_prevention_warmup",
   "useWhen": "Every training and game for women/girls (and suitable for all). Match day: this only.",
   "exercises": [
    {"name": "Jog >=200 m + mobility (A hamstring sweep / B leg swing / C open-close gate)", "sets": 1, "reps": "x5 each side"},
    {"name": "Deceleration (A stutter step x2 / B one-leg stop x1 each side / C forward 2 back 1 x2)", "sets": 1, "reps": "as listed"},
    {"name": "Change of direction (A 45-degree cuts / B partner zig-zag no contact / C with contact)", "sets": 2, "reps": "1"},
    {"name": "Jump and land (A dot the i x10 / B bounding x10 each side / C hops x10 each side)", "sets": 1, "reps": "as listed"},
    {"name": "Jump and land with contact (A partner push / B running partner push / C with twist)", "sets": 1, "reps": "x5 each side"},
    {"name": "Contact (A bump/check x5 each side / B tackling breakdown 2x30 s / C falling-rolling x3-5 each side)", "sets": 1, "reps": "as listed"},
    {"name": "Sprints 30 m build to 80-90%", "sets": 1, "reps": "x2-3", "distance": "30m", "intensity": "80-90%"},
    {"name": "Single-leg balance + handball", "sets": 1, "reps": "1 min each side"}
   ]},
  {"id": "afl_aerobic_base", "name": "Aerobic base run", "type": "conditioning_aerobic",
   "useWhen": "Off-season and early pre-season; developing/community players; 1-3x/week.",
   "exercises": [
    {"name": "Easy jog", "sets": 1, "reps": "12-25 min", "intensity": "conversational"},
    {"name": "Run/jog ladder 3-2-1 min with equal jog", "sets": 1, "reps": "1 ladder", "intensity": "comfortably hard"},
    {"name": "Strides", "sets": 4, "reps": "1", "distance": "60m", "intensity": "70-80%"}
   ]},
  {"id": "afl_2km_intervals", "name": "2 km time-trial intervals", "type": "conditioning_intervals",
   "useWhen": "Pre-season, goal = 2 km time; 1x/week + 1 tempo + 1 easy run.",
   "exercises": [
    {"name": "400 m at goal 2 km pace (goal/5)", "sets": 6, "reps": "1", "distance": "400m", "intensity": "goal 2km pace, 60-90 s rest"},
    {"name": "Progression: +1 rep/week to 10, then retest", "sets": 1, "reps": "-"}
   ]},
  {"id": "afl_threshold_200s", "name": "Threshold kms + 200 m repeats", "type": "conditioning_intervals",
   "useWhen": "Sub-elite/advanced pre-season, 1x/week, not within 48 h of match-sim.",
   "exercises": [
    {"name": "1 km threshold", "sets": 3, "reps": "1", "distance": "1000m", "intensity": "2 km TT pace + 10-15 s/km, 2 min jog"},
    {"name": "200 m repeats, 60 s rest, 3 min between sets", "sets": 3, "reps": "4", "distance": "200m", "intensity": "~90%"}
   ]},
  {"id": "afl_rsa", "name": "Repeat-sprint conditioning", "type": "conditioning_rsa",
   "useWhen": "Mid-late pre-season, 1-2x/week, >=48 h from games/other max sprint days.",
   "exercises": [
    {"name": "30 m sprint every 20 s", "sets": 2, "reps": "6", "distance": "30m", "intensity": "max; stop set at >5% drop-off (UNVERIFIED cut-off)"},
    {"name": "15 s run / 15 s walk", "sets": 2, "reps": "8", "intensity": "~90%"}
   ]},
  {"id": "afl_speed_agility", "name": "Speed & agility", "type": "speed",
   "useWhen": "Pre-season 2x/week; in-season 1x at MD-4/MD-3.",
   "exercises": [
    {"name": "Kneeling/split-stance acceleration", "sets": 6, "reps": "1", "distance": "10m", "intensity": "max, full recovery"},
    {"name": "Flying 10 m after 30 m build-up", "sets": 4, "reps": "1", "distance": "10m", "intensity": "max"},
    {"name": "Pre-planned 45-degree side-step", "sets": 1, "reps": "10/side"},
    {"name": "Reactive side-step vs partner", "sets": 1, "reps": "8/side"}
   ]},
  {"id": "afl_lower_strength", "name": "Lower-body strength & power", "type": "strength",
   "useWhen": "Off/pre-season 2x/week; in-season use afl_inseason_maint.",
   "exercises": [
    {"name": "Box jump", "sets": 4, "reps": "3"},
    {"name": "Trap bar deadlift", "sets": 4, "reps": "4-6", "intensity": "RPE 8"},
    {"name": "Split squat", "sets": 3, "reps": "6/leg", "intensity": "RPE 8", "group": "A"},
    {"name": "B-stance hip thrust", "sets": 3, "reps": "8/side", "group": "A"},
    {"name": "Nordic hamstring lower", "sets": 3, "reps": "5", "group": "B"},
    {"name": "Copenhagen (dynamic)", "sets": 2, "reps": "8-10/side", "group": "B"}
   ]},
  {"id": "afl_upper_contact", "name": "Upper-body & contact strength", "type": "strength",
   "useWhen": "Off/pre-season 1-2x/week; 16+ for barbell work.",
   "exercises": [
    {"name": "Bench press", "sets": 4, "reps": "6", "intensity": "RPE 8", "group": "A"},
    {"name": "Chin-ups", "sets": 4, "reps": "6-8", "group": "A"},
    {"name": "Plyo push-up", "sets": 3, "reps": "5"},
    {"name": "Rotational med ball slam", "sets": 3, "reps": "6/side"},
    {"name": "Tackling breakdown", "sets": 2, "reps": "30s"},
    {"name": "Falling/rolling", "sets": 1, "reps": "3-5/side"}
   ]},
  {"id": "afl_inseason_maint", "name": "In-season maintenance", "type": "strength",
   "useWhen": "1x/week MD-4 or MD-3 through the season.",
   "exercises": [
    {"name": "Box jump", "sets": 3, "reps": "3"},
    {"name": "Trap bar deadlift", "sets": 3, "reps": "4", "intensity": "~85%, RPE 7-8"},
    {"name": "Split squat", "sets": 2, "reps": "6/leg"},
    {"name": "Chin-ups / bench or push-up", "sets": 3, "reps": "5-6"},
    {"name": "Nordic hamstring lower", "sets": 2, "reps": "5"},
    {"name": "Copenhagen", "sets": 2, "reps": "10/side"}
   ]},
  {"id": "afl_md1_recovery", "name": "Game-day recovery (MD+1)", "type": "recovery",
   "useWhen": "Day after every game.",
   "exercises": [
    {"name": "Easy walk/swim/bike", "sets": 1, "reps": "15-20 min", "intensity": "easy"},
    {"name": "Body weight flush (duck walk, lateral squat-reach, reverse duck walk, inchworm, deep squat-rotate)", "sets": 1, "reps": "10 m each"}
   ]},
  {"id": "afl_ham_groin", "name": "Hamstring & groin bulletproofing", "type": "injury_prevention_strength",
   "useWhen": "Pre-season 2-3x/week, in-season 1x/week (not MD-1/MD-2).",
   "exercises": [
    {"name": "Nordic hamstring lower", "sets": 2, "reps": "5-12 (FootyFirst progression)"},
    {"name": "Copenhagen short -> long lever", "sets": 2, "reps": "6-10/side or 15-20 s holds"},
    {"name": "Sliding leg curl", "sets": 3, "reps": "6-8"},
    {"name": "Reverse Nordic", "sets": 2, "reps": "5"}
   ]},
  {"id": "afl_md_minus1", "name": "MD-1 activation", "type": "activation",
   "useWhen": "Optional, day before the game.",
   "exercises": [
    {"name": "Warm-up drills (A-skips, pogos, dribbles)", "sets": 1, "reps": "8 min"},
    {"name": "Build-up strides", "sets": 3, "reps": "1", "distance": "40m", "intensity": "60-70-80%"}
   ]}
 ],
 "injuryPrevention": {
  "footyFirst": {
   "what": "Exercise-training program for community Australian football to reduce leg (hamstring, groin, knee, ankle) injuries. Developed by the NoGAPS team (Young, Cook, Lloyd, Gabbe; Donaldson, Finch); endorsed by AFL Medical Officers, Physiotherapists and Sports Science associations.",
   "components": ["Warm-up (~5 min, group, 20 m lanes, 6 running activities over 9 trips + dynamic stretches)", "Hamstring strength (Nordic 'hamstring lower')", "Groin strength", "Hip strength (side plank variants)", "Balance, landing and changing direction"],
   "dose": "Start of every training session, at least twice a week, pre-season and in-season; warm-up ~5 min + ~15 min strength/landing; 5 levels, ~4 weeks (8 sessions) per level; players who miss training should still do it 2x/week.",
   "nordicProgression": "L1 1x6, L2 2x5, L3 2x8, L4 2x10, L5 2x12",
   "evidence": "Manual cites a meta-analysis of similar programs: lower-limb injuries -39%, acute knee -54%, ankle sprain -50% (other sports). Population-level evaluation (Finch 2019, BJSM): region with supported implementation had a 20.0% reduction in hospital-treated lower-limb injuries after 2 years vs a 21.5% increase without support and 12.6% increase in the rest of Victoria - support for implementation matters.",
   "confidence": V
  },
  "prepToPlay": {
   "what": "AFL + La Trobe University program for women and girls in community football: dynamic warm-up (8 activities, A/B/C), football contact skills (tackling, being tackled, aerial, ground balls; >=5 min per session), 3 strength activities, 2 x 10-min education sessions.",
   "dose": "Warm-up 10 min every training and game; strength 5-10 min before/during/after every training; match day warm-up only. Movement quality improves in 3-4 weeks, strength 6-8 weeks at 2-3 sessions/week. Continue as long as playing.",
   "aclContext": "AFLW players had 9.2x the ACL injury risk of AFL men (first 2 AFLW seasons); 70-80% of ACL injuries are non-contact (decelerating/changing direction or landing on one leg); 70-80% of AFLW head injuries occur in tackling, ground balls or aerial contests. Benefit 'up to 50%' is based on similar programs.",
   "evidence": "Stepped-wedge cluster RCT (Patterson 2026, BJSM; 165 teams, 2481 players): supported implementation lifted use (13.1% -> 29.7% of team-weeks, OR 3.7); higher adherence was associated with fewer total injuries (IRR 0.95); effect on ACL/concussion incidence unclear. SMA: such programs reduce lower and upper limb injuries by up to 40-60% when used >=10 min, twice weekly, all season.",
   "ages": "Being evaluated in players 14+; similar programs (FIFA 11+) effective from age 7 in other sports.",
   "confidence": V
  },
  "nordics": "Opar 2015 (210 elite AFL players): eccentric Nordic strength below 256 N at start / 279 N at end of pre-season -> 2.7x / 4.3x hamstring strain risk; high eccentric strength offset the extra risk from age and previous HSI; between-limb imbalance >10% did not raise risk (verified abstract). Programs including Nordics cut hamstring injuries ~51% (Al Attar 2017 via PEDro, verified in sports.json).",
  "copenhagen": "Haroy 2019 cluster RCT (652 semi-pro footballers): Copenhagen-based Adductor Strengthening Programme, 3x/week pre-season (6-8 weeks) then 1x/week in-season (28 weeks): groin-problem risk 41% lower (OR 0.59; season prevalence 13.5% vs 21.3%). Soccer, self-reported outcomes (verified abstract). FootyFirst L5 'body lift' and Prep to Play option C both include Copenhagen-style work.",
  "appRules": ["Default every AFL plan to include FootyFirst (men/boys) or Prep to Play (women/girls) >=2x/week; offer the other as an option.", "Nordics + Copenhagen at least weekly year-round.", "Surface adherence (sessions done/week) - adherence is what drives the benefit (FootyFirst, Prep to Play, FIFA 11+)."]
 },
 "safety": [
  "Concussion (SMA/AFL community guidelines, verified): suspected concussion = no return that day; community players return to matches no earlier than day 21 (injury day = day 0); 14 days symptom-free, graded loading and medical clearance before full contact. The app must block game/contact sessions in that window.",
  "Previous injury is the biggest risk factor for future injury - complete rehab before returning (SMA, verified).",
  "Mouthguard (preferably custom-fitted) at all times in contact; soft headgear has no evidence of preventing concussion (SMA, verified).",
  "Ankle brace/tape may help prevent ankle re-sprain (SMA, verified).",
  "Avoid alcohol 48 h before a game and after it for recovery (SMA, verified).",
  "Juniors: AFL Junior Rules - ideally no more than 2 games a week and 25 games a season across club, school and talent squads (verified). No maximal lifting; bodyweight and technique; 2-3 days between plyo sessions (sports.json).",
  "Masters (35+, Play AFL has a Masters category): longer warm-up, 3-4 days between plyo sessions, fewer and lower-intensity contacts (NSCA via sports.json), prioritise calves/hamstrings; UNVERIFIED for AFL masters specifically.",
  "Women/girls: higher ACL risk - always pair running/agility plans with Prep to Play; menstrual-cycle symptoms (severe cramping, irregular periods) warrant medical advice (Prep to Play manual, verified).",
  "Stop and refer: sudden hamstring tightness/pain while sprinting, groin pain on kicking, knee giving way or swelling, any head knock.",
  "Build running volume slowly (Play AFL: too fast -> overuse injuries); 1 day on/1 day off for the same kind of training (verified, umpire document)."
 ],
 "sources": [
  {"id": "footyfirst", "title": "FootyFirst: A training program to prevent leg injuries in community Australian Football (manual)", "author": "NoGAPS project - Young W, Cook J, Lloyd D, Gabbe B, Donaldson A, Finch C; AFL", "url": "https://cove.army.gov.au/sites/default/files/2022-05/AFL%20Footy%20First.pdf", "whatWeUsed": "Full 48-page manual extracted: warm-up, all 5 levels with sets/reps/tempos, frequency, progression, FAQ evidence. Fetched."},
  {"id": "p2p_player_manual", "title": "AFLW Prep to Play - Player Manual", "author": "AFL & La Trobe University", "url": "https://play.afl/sites/default/files/2023-10/AFLW%20Prep%20to%20Play%20-%20Player%20Manual.pdf", "whatWeUsed": "Program components, dose, match-day rule, ACL/concussion stats, recovery tips, modified exercises. Fetched + text extracted."},
  {"id": "p2p_warmup_poster", "title": "Prep to Play Dynamic Warm-up Program (poster)", "author": "AFL (coach.afl) & La Trobe University", "url": "https://play.afl/sites/default/files/2023-10/AFLW%20Prep%20to%20Play%20-%20Dynamic%20Warm%20Up%20Program%20%28Poster%29.pdf", "whatWeUsed": "All 8 activities x A/B/C with doses - rendered to image and read. Fetched."},
  {"id": "p2p_strength_poster", "title": "Prep to Play Strength Program (poster)", "author": "AFL (coach.afl) & La Trobe University", "url": "https://play.afl/sites/default/files/2023-10/AFLW%20Prep%20to%20Play%20-%20Strength%20Program%20%28Poster%29.pdf", "whatWeUsed": "3 groups x A/B/C exercises and doses - rendered to image and read. Fetched."},
  {"id": "p2p_coach_manual", "title": "Prep to Play Coaches Manual (2023)", "author": "AFL & La Trobe University", "url": "https://play.afl/sites/default/files/2026-02/ICL_GD_2023_93558_Prep%20to%20Play_Coaches%20Manual_D1.pdf", "whatWeUsed": "FAQ: 15-20 min total, timelines (3-4 wk movement, 6-8 wk strength at 2-3 sessions/wk), age 14+ evaluation, continue while playing. Fetched."},
  {"id": "patterson2026", "title": "Supported implementation enhances injury prevention programme (Prep-to-Play) use in women and girls playing Australian Football: stepped wedge cluster RCT", "author": "Patterson BE et al., Br J Sports Med 2026 (PMID 42091212)", "url": "https://europepmc.org/article/MED/42091212", "whatWeUsed": "Use rates, adherence-injury IRR 0.95, ACL/concussion incidence. Abstract fetched via Europe PMC API."},
  {"id": "finch2019", "title": "Controlled ecological evaluation of an implemented exercise-training programme to prevent lower limb injuries in sport: population-level trends in hospital-treated injuries", "author": "Finch CF et al., Br J Sports Med 2019 (PMC6579505)", "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6579505/", "whatWeUsed": "FootyFirst population results (-20.0% supported vs +21.5% unsupported). Abstract fetched via Europe PMC API."},
  {"id": "opar2015", "title": "Eccentric hamstring strength and hamstring injury risk in Australian footballers", "author": "Opar DA et al., Med Sci Sports Exerc 2015 (PMID 25137368)", "url": "https://europepmc.org/article/MED/25137368", "whatWeUsed": "256 N / 279 N thresholds, RR 2.7 / 4.3, imbalance not a risk factor. Abstract fetched."},
  {"id": "haroy2019", "title": "The Adductor Strengthening Programme prevents groin problems among male football players: a cluster-randomised controlled trial", "author": "Haroy J et al., Br J Sports Med 2019 (PMID 29891614)", "url": "https://europepmc.org/article/MED/29891614", "whatWeUsed": "Dose (3x/wk pre-season, 1x/wk in-season), OR 0.59, prevalence 13.5 vs 21.3%. Abstract fetched."},
  {"id": "wing2021", "title": "Evaluating match running performance in elite Australian football: a narrative review", "author": "Wing C, Hart NH, Ma'ayah F, Nosaka K. BMC Sports Sci Med Rehabil 2021;13:136", "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8549340", "whatWeUsed": "12,897 m / ~129 m/min, HSR threshold variety, positional differences, finals data. Fetched."},
  {"id": "clarke2018", "title": "Physical demands and technical performance in AFLW match-play", "author": "Clarke AC et al., J Sci Med Sport 2018 (PMID 29233465)", "url": "https://europepmc.org/article/MED/29233465", "whatWeUsed": "AFLW relative distance and HSR by position. Abstract fetched (truncated)."},
  {"id": "sma_afl", "title": "AFL fact sheet", "author": "Sports Medicine Australia", "url": "https://sma.org.au/resources/sport-fact-sheets/afl-fact-sheet/", "whatWeUsed": "Injury stats, 40-60% program effect, Prep to Play endorsement, >=4 wk pre-season, concussion return (day 21), mouthguard, alcohol, juniors. Fetched."},
  {"id": "afl_combine_2026", "title": "2026 Telstra AFL/AFLW Draft Combine results", "author": "AFL.com.au", "url": "https://www.afl.com.au/news/1627482/combine", "whatWeUsed": "Top results all tests; girls 1.6 km TT; records (running VJ 114 cm, girls agility 8.106 s). Fetched."},
  {"id": "afl_combine_2024", "title": "2024 Telstra AFL/AFLW Draft Combine testing results", "author": "AFL.com.au", "url": "https://www.afl.com.au/news/1241350/2024-telstra-aflw-draft-combine-testing-results", "whatWeUsed": "Top results; AFLW 2 km record 7:02. Fetched."},
  {"id": "wiki_combine", "title": "AFL Draft Combine", "author": "Wikipedia", "url": "https://en.wikipedia.org/wiki/AFL_Draft_Combine", "whatWeUsed": "Test protocols (20 m sprint 3 attempts with 5/10/20 m gates; Vertec jumps; agility), 2017 changes (beep -> Yo-Yo, 3 km -> 2 km), all-time records. Secondary source - fetched."},
  {"id": "topend_2km", "title": "2 km run test", "author": "TopEndSports", "url": "https://www.topendsports.com/testing/tests/2-km-run.htm", "whatWeUsed": "2 km test protocol. Fetched."},
  {"id": "playafl_training_year", "title": "Training Year, Training Principles and Fitness Components (umpires)", "author": "Play AFL (AFL umpiring)", "url": "https://play.afl/sites/default/files/2025-11/Training%20Year%2C%20Training%20Principles%20and%20Fitness%20Components.pdf", "whatWeUsed": "Season calendar, sessions/week, 25-30 km/wk pre-season, HSR x1 (200 m max), 1-2 strength sessions, build-up rules, interval types. Fetched."},
  {"id": "rj_strength", "title": "Rob Jackson's Strength Series A/B", "author": "Rob Jackson (AFL Umpires HP Manager), Play AFL", "url": "https://play.afl/sites/default/files/2024-08/Rob%20Jacksons%20Strength%20Series%20AB.pdf", "whatWeUsed": "8-week A/B strength series. Fetched."},
  {"id": "rj_armour", "title": "Rob Jackson's Body Armour Series", "author": "Rob Jackson, Play AFL", "url": "https://play.afl/sites/default/files/2024-08/Rob%20Jacksons%20Body%20Armour%20Series.pdf", "whatWeUsed": "Post-track prehab circuits A/B/C. Fetched."},
  {"id": "rj_flush", "title": "Rob Jackson's Body Weight Flush Recovery", "author": "Rob Jackson, Play AFL", "url": "https://play.afl/sites/default/files/2024-08/RobJacksons%20Body%20Weight%20Flush%20Recovery.pdf", "whatWeUsed": "Recovery mobility sequence. Fetched."},
  {"id": "rj_moveprep", "title": "Movement Preparation + Extras", "author": "Rob Jackson, Play AFL", "url": "https://play.afl/sites/default/files/2024-02/Movement%20Preparation%20%2B%20Extras%20%28Rob%20Jackson%29.pdf", "whatWeUsed": "Movement prep options, running prep T1/T2, COD drills, strength maintenance levels 1-3 and progression rules. Fetched."},
  {"id": "musashi_afl", "title": "AFL Training Program (off-season / pre-season / during season)", "author": "Musashi Performance Lab", "url": "https://cdn.shopify.com/s/files/1/0528/3718/7753/files/Muashi_Sports_Training_Program_AFL.pdf", "whatWeUsed": "3 x 3-day phase programs; Day 1 of each checked on musashi.com pages. Fetched."},
  {"id": "aflplayers_couch", "title": "Off the Couch: the key to a great pre-season", "author": "AFL Players Association (Kav Di Pietro)", "url": "https://www.aflplayers.com.au/news-feed/stories/off-the-couch-the-key-to-a-great-pre-season", "whatWeUsed": "Community pre-season structure: 14-week running guide, 3 time trials, sessions <=20 min, 12 x 200 m example. Fetched (program itself is paid - not reproduced)."},
  {"id": "afl_junior_rules", "title": "Junior Rules", "author": "Play AFL", "url": "https://play.afl/junior-rules", "whatWeUsed": "Max 25 games/season, ideally <=2 games/week; progressive contact. Fetched."},
  {"id": "veale2010", "title": "The Yo-Yo IR1 test to discriminate elite junior Australian football players", "author": "Veale JP et al., J Sci Med Sport 2010 (PMID 19451033)", "url": "https://europepmc.org/article/MED/19451033", "whatWeUsed": "Yo-Yo IR1 discriminates elite vs sub-elite juniors (no norms in abstract). Abstract fetched."},
  {"id": "sports_json", "title": "Somax sports playbook (football section)", "author": "Somax research 2026-11-12", "url": "sports.json", "whatWeUsed": "Already-verified Haugen sprint table, NSCA plyo/periodisation, Ronnestad in-season strength, Yo-Yo/beep protocols and bands, Nordic meta-analysis."}
 ],
 "notUsed": [
  "Paid AFL programs (TrainHeroic marketplace, FinalSurge, TrainingPeaks, Payhip, 'Off the Couch' $445 club program, Health Project course) - not free, not reproduced.",
  "Rob Jackson's own site (robjackson.com.au) blocked automated fetching (mod_security) - not used.",
  "FootyFirst Scribd copy - not needed (official text read from Army CoVE copy).",
  "No community-club PDF running program with a verifiable free licence was found (Warrandyte JFC chapter 6 link returned an HTML error page)."
 ]
}
json.dump(pb, open(OUT, "w"), indent=1, ensure_ascii=False)
print("ok")
