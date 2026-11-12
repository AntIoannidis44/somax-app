# Gym expansion: strength-training, bodybuilding, powerlifting, calisthenics

Researched 2026-11-13. Every id is prefixed `x-gym-`.

| File | What it holds |
|---|---|
| `gym-sourced.json` | 37 credited sessions from 15 public programs by 6 publishers: StrengthLog, r/Fitness, Jim Wendler, Layne Norton, Tufts/CDC and the US Army (`verified: true`) |
| `gym-somax.json` | 85 Somax original sessions (`credit: "Somax"`, `verified: false`, `basedOn` ids) |

The JSON comes from three scripts in `../tools/`. Edit the scripts and re-run them rather than hand-editing the JSON:

```
python3 tools/gen_gym_sourced.py expansion/gym-sourced.json
python3 tools/gen_gym_somax.py   expansion/gym-somax.json
python3 tools/validate_gym_expansion.py .
```

The validator checks:
- the schema and enums, and that exercises only use the keys name/sets/reps/weight/distance/group
- exactly 4 `howToRun` bullets
- the `x-gym-` prefix, unique ids and names, and no collisions with sourced/somax/afl-programs.json
- that every `basedOn` id exists, and that series day numbering is complete

The final run had 0 errors. The original `tools/validate.py` still passes, and no other files were touched.

## Confidence bar for credited entries

All of these had to be true:
1. Free and public, with no login, email gate or paywall for the program itself.
2. We fetched and read the page ourselves, including PDF text extraction for the CDC and Army documents.
3. The author or publisher is reputable.
4. The page lists exercises, sets and reps clearly enough to transcribe without guessing.
5. There is no "do not reproduce" or non-commercial wording.

Programs that failed any of these were skipped, and are listed under "Skipped" below. Only facts were recorded (exercise names, sets, reps, loads, timings). Every description, `whoItsFor` and `howToRun` is written in our own words, in Australian English and metric. Pounds were converted to kg.

## Sources used (credited)

| Program (sessions) | Credit | URL read | Licence / notes |
|---|---|---|---|
| Beginner Strength Training Program A/B (2) | Andreas Abelsson, StrengthLog | strengthlog.com/beginner-strength-training-program/ | © StrengthLog. Free; full tables in the article. No reuse terms stated. |
| Beginner Dumbbell Program A/B (2) | Andreas Abelsson, StrengthLog | strengthlog.com/beginner-dumbbell-program/ | As above |
| Beginner Machine Program A/B (2) | Daniel Richter, StrengthLog | strengthlog.com/beginner-machine-program/ | As above |
| Full Body Workout 2x/week A/B (2) | Daniel Richter, StrengthLog | strengthlog.com/strengthlogs-full-body-workout-2x-week/ | As above |
| Full Body Workout Routine 3x/week (3) | Andreas Abelsson, StrengthLog | strengthlog.com/strengthlogs-full-body-hypertrophy/ | Article says "100% free". Intermediate to advanced. |
| Bodybuilding for Beginners A/B (2) | Andreas Abelsson, StrengthLog | strengthlog.com/beginner-bodybuilding-program/ | Free |
| Training Program for Seniors, gym + home (2) | Andreas Abelsson, StrengthLog | strengthlog.com/strengthlogs-training-program-for-seniors/ | Sets stored as the target of 3; the note says to start at 1 |
| Beginner Strength Without Equipment A/B/C (3) | Sandrine Quignaudon, StrengthLog | strengthlog.com/beginner-strength-training-program-without-equipment/ | Free |
| Beginner Calisthenics Plan 1/2/3 (3) | Andreas Abelsson, StrengthLog | strengthlog.com/calisthenics-workout-plan/ | The article shows one week, and progression lives in the app. **Intermediate plan is premium, not used.** |
| Dumbbell Stopgap PPL (3) | u/gregariousHermit (r/Fitness) | thefitness.wiki/reddit-archive/dumbbell-stopgap-ppl/ | Community routine, no notice |
| Building the Monolith Mon/Wed/Fri (3) | Jim Wendler | jimwendler.com/blogs/jimwendler-com/101078918-building-the-monolith-5-3-1-for-size | © JimWendler.com. Free article. **Week 1 only**; the 6-week % table is left in the article. Trademark: keep credit and link. |
| PHAT, 5 days (5) | Dr Layne Norton via Simply Shredded | simplyshredded.com/mega-feature-layne-norton-training-series-full-powerhypertrophy-routine-updated-2011.html | © Simplyshredded.com. No reuse terms stated. |
| Growing Stronger Parts I/II/III (3) | Tufts University & CDC | stacks.cdc.gov/view/cdc/11447 (PDF) | The book says it is "produced for free distribution… without requiring permission", provided the authors and Tufts are credited and the content isn't changed. CDC lists it as public domain. We store the exercise list, sets and reps only and point to the book for instructions. |
| Army PRT Strength & Mobility session (1) | U.S. Army FM 7-22 (2012) | armyrotc.siu.edu/_common/documents/fm-7-22.pdf | "Approved for public release; distribution is unlimited." This is session 6-2 from the sustaining-phase schedule. FM 7-22 chapters 1-6 were superseded in 2020 (H2F). Don't imply Army endorsement. |
| Army Strength Training Circuit (1) | U.S. Army FM 7-22 | same PDF, §9-55 and Table 9-10 | Same as above. Kettlebell weights converted from lb. |

**Licensing caveats.** StrengthLog, Simply Shredded and JimWendler.com show a copyright footer but state no reuse terms. This is the same situation as the existing StrongLifts and BBB entries. We store facts only and keep the credit and link.

Before shipping, it would be worth a courtesy email to StrengthLog, because it is the largest single source here, with 21 sessions. 5/3/1 and Building the Monolith are Jim Wendler's brands, and PHAT is Layne Norton's. Name them only to credit them, never to imply endorsement.

## Skipped and why

| Candidate | Why skipped |
|---|---|
| StrengthLog Beginner Barbell and Beginner Powerlifting | Read in full, but they near-duplicate the existing BBR and StrongLifts entries (3x5 or 3x8-10 of squat/bench/row, then deadlift/press/pulldown) |
| StrengthLog Thicc (women's plan) | The article lists exercises but says sets and reps are app-only |
| StrengthLog Bench Press program | The article shows only the first 11 workouts. The full program is in the app. |
| StrengthLog PPL, 3-Day Bodybuilding Split, Home Workout Plan, Intermediate/Advanced Powerlifting, Intermediate Calisthenics | Premium (paid) in the app, so left alone out of respect for the paywall |
| Dumbbell Stopgap (u/Cammorak) | Read in full, but it near-duplicates StrengthLog Beginner Dumbbell (A/B, 3x10). We kept the more authoritative one. |
| Westside Barbell conjugate templates | Read the Basic and Standard Template articles. They give exercise slots, not a fixed session, and are © "All rights reserved". Used only as learning input for the Somax Max & Speed series. |
| JTS Limited Equipment Training Template (PDF) | Read. It's a choose-your-own template with no fixed exercises. Used as learning input only. |
| LIFTMOR / HiRIT (Griffith Uni, Bone Clinic) | We read the protocol in BMJ Open 2019 (PMC6731910): 5x5 deadlift/squat/OHP at 80-85% 1RM, jumping chin-ups, 2x/week, 4-week familiarisation. The article is **CC BY-NC (no commercial re-use)**, so it isn't a credited entry. The *ideas* informed Somax Bone Strength. |
| LiftOff: Couch to Barbell (Casey Johnston) | Paid book. The website names no exercises. |
| Antranik bodyweight routine | The main strength section sits behind a sign-up, and the page says "All Rights Reserved" |
| Hybrid Calisthenics | Free, but sets and reps are spread over video and progression pages, not one readable routine |
| StartBodyweight Basic Routine | The site refused the connection twice ("socket closed") |
| r/bodyweightfitness Minimalist / Move / Skill Day | Reddit blocks fetching, and the GitHub mirror doesn't host these pages (404) |
| Lyle McDonald Generic Bulking Routine | The original forum is offline (404). Only secondary write-ups exist. |
| Candito 6-Week, Sheiko, Smolov, Calgary Barbell, Barbell Medicine templates | Only on third-party apps, spreadsheets or Scribd uploads, or behind an email gate. No primary free page found. |
| Texas Method, Madcow 5x5, WS4SB | Only secondary write-ups, or the original page returned 404 (DeFranco) |
| Stronger by Science "No gym" | A guide, not a fixed program |
| ADF "Training for the PFA" brochure | 502 errors, and the PDF link served HTML. It also points to the ADF Active app rather than giving a program. |
| ATP 7-22.02 Workouts PDF (co.ng.mil) | 403. We used the FM 7-22 drills instead. |
| NIA, Better Health Channel, Healthdirect, NHS Strength & Flex | Fetch blocked (NIA: 405), or the page gives general guidance or podcasts without a transcribable session |

**Powerlifting has no new credited entries.** We couldn't find a free, primary, transcribable powerlifting program that isn't already in the library (GZCLP is). The Somax originals cover the gap.

## What we learned (applied in the Somax originals)

- **Simple beats clever for beginners.** Every reputable beginner plan we read (StrengthLog x6, Growing Stronger, the Army drills) uses 2-3 full-body days, 2-4 sets, and double or linear progression. Somax beginner sessions copy that shape and keep 2-3 reps in reserve.
- **Older-adult programs build volume, not intensity, first.** Growing Stronger runs Part I for 2 weeks, Part II for 4, then Part III. StrengthLog Seniors starts at 1 set and builds to 3. LIFTMOR spends 4 weeks on bodyweight and broomstick technique before 5x5 at 80-85%. Somax Bone Strength and Active Ageing use the same staged on-ramp.
- **Time-poor training works with supersets and fewer exercises.** StrengthLog 2x/week tells people to drop an exercise when short of time. JTS uses density (EMOM, rest-pause) with limited kit. These shaped the 20- and 30-minute Somax sessions.
- **Advanced plans rotate exercises and autoregulate.** PHAT rotates power moves every 2-3 weeks and limits failure to the last 1-2 sets. Westside rotates max-effort variations and uses 50-60% speed work in 3-week waves. Monolith uses fixed % waves with very high assistance totals. Somax advanced sessions use RPE top sets, back-off sets and a rotating variation.
- **Bands and kettlebells need tempo and proximity to failure to count.** Light-load hypertrophy only works close to failure (playbook: Schoenfeld). Band and travel sessions use 3-second lowering and 0-2 RIR.
- **Military PRT is a ready-made outdoor calisthenics system.** It has a cadenced 5-10 rep cap, adds whole sets rather than reps, and builds climbing and pulling progressions. It informed the park and ladder sessions.
- **Deloads appear everywhere** (PHAT 1-3 weeks at 60-70% every 6-12 weeks; playbook 3:1). There are separate deload sessions for strength (barbell, about -10%), muscle (half sets, 3-4 RIR) and powerlifting (60-70% triples).

**Playbook rules followed:**
- Weekly sets per muscle: beginner about 8-12, intermediate about 12-20, advanced about 15-25.
- No more than about 11 fractional sets per muscle per session.
- Compounds at 4-12 reps and 1-3 RIR, isolations at 10-20 reps and 0-2 RIR.
- No 1RM tests for beginners. AMRAPs stop short of failure.
- Increments of +2.5 kg on the squat and +5 kg then +2.5 kg on the deadlift.
- Layoff restart at 85-95% depending on the gap.
- Deload every 4-6 weeks.

## Somax originals by gap filled

| Gap | Somax sessions |
|---|---|
| 20/30-min busy gym | 20-Minute Gym Express (beg). 30-Minute Barbell A/B/C (int). 30-Minute Muscle A/B (int). Arms & Delts Pump 20 (int). |
| 4-day upper/lower strength | Upper/Lower Strength x4 (int) |
| Returning from a break | Back-to-Training Restart A/B |
| Deload weeks | Strength Deload. Muscle Deload. Powerlifting Deload. |
| Home / travel | Band Starter (beg). Band Strength Circuit (int). Travel Band Pump (int). Home Dumbbell Upper/Lower x4 (int). Home Fat-Loss Strength Circuit (beg). Kettlebell Strength A/B (int). Desk-Worker Strength & Mobility (beg). |
| Fat loss in the strength sports | Fat-Loss Strength Circuit (beg, gym). Home Fat-Loss Circuit (beg). Barbell Complex & Supersets (int). Calisthenics Ladder (int). |
| Sport performance | Athletic Strength & Power A/B (int). Advanced Max & Speed x2. Meet-week Openers. Mock Meet. |
| Older adults | Bone Strength 50+ (int, supervised). Active Ageing Strength & Balance (beg). Masters Powerlifting 40+ x3. |
| Bodybuilding progression | Beginner Upper/Lower x4. 3-Day PPL x3 (int). Advanced 5-Day ULPPL x5. Glute Builder x3. |
| Powerlifting path | Intro to Powerlifting x3 (beg). 3-Day PL x3 (int). 4-Day PL x4 (int). Advanced Block x4. Bench Specialisation x2. GPP & Conditioning. |
| Calisthenics path | First Pull-up Builder (beg). Push-up Builder (beg). Park Beginner / Intermediate. Calisthenics PPL x3 (int). Pistol Squat (int). Handstand & L-sit (int). Rings Foundations (int). Weighted Calisthenics A/B (adv). |

We stopped at 85 originals. More variants (for example 6-day bodybuilding, deadlift specialisation, an advanced home dumbbell plan) would have been near-duplicates of what exists.

## Session counts

| Sport | Credited (beg / int / adv) | Somax (beg / int / adv) | New total | Existing in library* |
|---|---|---|---|---|
| strength-training | 13 / 4 / 0 = 17 | 8 / 15 / 2 = 25 | 42 | 16 |
| bodybuilding | 2 / 6 / 5 = 13 | 4 / 15 / 5 = 24 | 37 | 8 |
| powerlifting | 0 / 0 / 0 = 0 | 3 / 14 / 6 = 23 | 23 | 5 |
| calisthenics | 6 / 1 / 0 = 7 | 3 / 8 / 2 = 13 | 20 | 4 |
| **Total** | **37** | **85** | **122** | 33 |

\*Existing counts cover sourced-programs.json, somax-programs.json and afl-programs.json for these four sports. Every sport stays well under the ceiling of about 100.

## Coverage: level × goal × place (existing + new sessions)

Each cell shows existing + new sessions for the four sports. Place is derived as follows:
- **gym:** category gym or the `full-gym` tag
- **outdoor:** the `outdoor` tag on a non-gym session
- **home:** everything else

A session counts once per goal it lists.

**Gym**

| Level | strength | muscle | fat-loss | endurance | mobility | general-fitness | sport-perf |
|---|---|---|---|---|---|---|---|
| Beginner | 12+19 | 10+17 | 0+1 | 0+0 | 0+1 | 3+10 | 0+0 |
| Intermediate | 12+37 | 12+29 | 0+1 | 0+2 | 0+4 | 0+4 | 0+2 |
| Advanced | 1+12 | 1+11 | 0+0 | 0+0 | 0+0 | 0+0 | 0+3 |

**Home** (dumbbells, bands, kettlebell, bodyweight)

| Level | strength | muscle | fat-loss | endurance | mobility | general-fitness | sport-perf |
|---|---|---|---|---|---|---|---|
| Beginner | 2+13 | 1+3 | 0+1 | 0+0 | 0+5 | 2+13 | 0+0 |
| Intermediate | 2+8 | 0+9 | 1+0 | 1+1 | 0+0 | 2+0 | 0+0 |
| Advanced | 0+0 | 0+0 | 0+0 | 0+0 | 0+0 | 0+0 | 0+0 |

**Outdoor** (park bars, kettlebell, bodyweight)

| Level | strength | muscle | fat-loss | endurance | mobility | general-fitness | sport-perf |
|---|---|---|---|---|---|---|---|
| Beginner | 1+5 | 1+4 | 0+0 | 0+0 | 0+0 | 1+4 | 0+0 |
| Intermediate | 1+12 | 1+7 | 0+1 | 0+3 | 0+3 | 0+4 | 0+1 |
| Advanced | 1+2 | 1+2 | 0+0 | 0+0 | 0+0 | 0+0 | 1+0 |

**Remaining thin cells (deliberately not filled):**
- Advanced fat-loss, endurance or mobility in these sports. Those users are better served by the HIIT, hybrid and mobility libraries.
- Beginner sport-performance. The AFL and soccer sets cover it.
- Advanced home. Weighted Calisthenics A/B carries the `home` tag, but the table counts it under outdoor.

**Length and frequency of the new sessions:**
- Session length: 7 sessions at 20 min or less, 22 at 25-35 min, 31 at 40-45 min, 28 at 50-60 min, 33 at 65-80 min, and 1 two-hour mock meet.
- Days per week: 2 days (19), 3 days (64), 4 days (25), 5 days (10), 6 days (3), 1 day (1).
