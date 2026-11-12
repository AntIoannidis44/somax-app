# Field sports expansion: AFL, soccer, basketball, tennis, boxing

Researched 2026-11-13. Id prefix `x-field-`.

**Files**
- `field-sourced.json`: 14 credited programs, all `verified: true`.
- `field-somax.json`: 105 Somax originals, all `verified: false`, each with a `basedOn` list.

**Scripts** (in `../tools/`)
- `gen_field_sourced.py` and `gen_field_somax.py` regenerate the two JSON files.
- `validate_field.py` checks them. Last run: 0 errors. It checks that the files parse, the keys and their order match `afl-programs.json`, the enums, the exercise keys, unique prefixed ids, that every `basedOn` id exists, that `howToRun` has exactly 4 items, and that `duration` matches `sessionMinutes`.

Nothing outside `expansion/` and the three new tool scripts was edited. No commits were made and the database was not touched.

## Confidence bar for credited entries

An entry goes in `field-sourced.json` only if all of these are true:
1. We fetched the actual page or PDF and read it in full. Every number in the entry was read there; none come from search snippets or summaries. The IABA pages were re-read as raw HTML to confirm the numbers.
2. It is free and needs no login.
3. The publisher is reputable: a governing body or FIFA's medical centre.
4. It is clear enough to transcribe as sets, reps and times.
5. There is no "do not reproduce" wording on the page or in the document.

Only facts are recorded: exercise names, sets, reps and times. Descriptions and coaching text are in our own words.

## Sources used

| Entries | Publisher / document | URL read | Licence notes |
|---|---|---|---|
| FIFA 11+ Level 2, Level 3 | F-MARC "11+" posters (basic and advanced strength/plyo/balance), reproduced by WakeMed Sports Medicine | wakemed.org `injury prevention warmup.pdf` (Part 2 levels) + `fifa basic warm up exercises.pdf` (Parts 1/3) | Freely distributed injury-prevention programme. No restriction on either poster. Same host as the existing Level 1 entry. |
| FIFA 11+ for Kids Levels 1, 3, 5 (series of 3) | Official 82-page *FIFA 11+ for Kids* manual (F-MARC 2016; Rössler, Faude, Bizzini, Junge, Dvořák) | tcomn.com (Twin Cities Orthopedics) copy of the manual | No reproduction wording in the manual. The same manual is catalogued by BISp (lida record 4043938). Levels 2 and 4 were left out because they are near-duplicates of 1/3 and 3/5. |
| IABA sessions: 25/05/21, 27/03/21 (boxing only), 11/06/21, 15/08/21, 04/09/21 (boxing + S&C, series of 2), 11-12/09/21 (boxing + S&C, series of 2) | Irish Athletic Boxing Association, National Youth & Junior Team home sessions | iaba.ie/iaba-home-training-sessions-{10,5,12,15,18,19}/ | Free posts with no copyright or reproduction wording. |
| England Boxing skipping rounds | England Boxing (week-12 drills, coach Q Shillingford) | englandboxing.org/news_articles/england-boxing-drills-week-12/ | Free article with no copyright or reproduction wording. |

Where we resolved ambiguity in a source (each is noted in that entry's `sourceNote`):
- **IABA 27/03/21:** the S&C AMRAP says both "x 3" and "(2 sets!!)", so it was skipped. Only the boxing session was kept.
- **IABA 15/08/21:** round 2 is headed "back hand only" but its text repeats round 1. We followed the heading.
- **IABA 12/09/21:** the page says "7 x 3" but describes six rounds. Only the six described rounds are recorded.
- **IABA 25/05/21 and 11/06/21:** rest between rounds isn't stated. We suggest 1 minute in `howToRun` and flag it as our default.
- **IABA "6 inches":** converted to about 15 cm.

## Sources looked at but NOT used, and why

| Source | Why skipped |
|---|---|
| **Football Australia Perform+** (warm-up and performance/cool-down PDFs, 3 levels) | The best Australian soccer source, and we read it in full. But footballaustralia.com.au/legal says no part of the content may be reproduced "in any form" without written consent from Football Australia. Under the rules for this task, that wording rules it out. Worth asking FA for permission: it is the FIFA 11+ with added hip/groin work (Copenhagen-style groin levels 1-3, Nordic 1x3-5 to 3x8-10). |
| **Journal of Sports Science & Medicine**: Fernandez-Fernandez et al. 2013, 6-week junior tennis serve program | Clear, transcribable protocol: core 2x20, 9 elastic-tube exercises 2x20, 7 med-ball throws 2x8. But the licence is CC BY-NC-ND (non-commercial) and the site says "It is forbidden the total or partial reproduction". Skipped, but used as background knowledge. |
| JSSM 16-527 basketball plyometric table | Gives only totals per week, not an exercise-by-exercise prescription, so it can't be transcribed as a session. JSSM reproduction notice applies too. |
| LTA (UK) Tennis Fitness series | Video only; the page text has no exercises or doses. |
| USTA Strength & Conditioning at home, single-leg balance article | One is tips with no doses; the other is video only. The USTA dynamic warm-up is already in the library. |
| ITF conditioning PDFs (itftennis.com → world.tennis) | The PDF came back empty and wouldn't download. |
| Basketball England "Starting Five" warm-up | 403 to automated fetch. |
| Basketball NSW "Game Ready" warm-up (Bird 2021) | Only a citation record is online; the newsletter itself isn't. |
| Jr. NBA practice plans | Team practice plans, mostly skill drills linked to videos, with no individual conditioning prescription. Footer reads "All Rights Reserved". |
| Stojanović 2023 / Owoeye 2018 basketball neuromuscular warm-ups | Full text paywalled or not confirmed open access. |
| PMC boxing training study (PMC6189260) | Blocked by a reCAPTCHA; the protocol couldn't be read. |
| FIFA 11+ Referee manual | Readable, but written for referees. Left for a possible later "officials" pass. |
| Prep to Play 2026 poster and coaches manual (play.afl) | Same content as the 2023 posters already in the library. The new contact and aerial sections are team drills (groups of 3-30), not individual sessions. |
| Prep to Play warm-up Option B | A near-duplicate of the A/C entries already in the library. |
| England Boxing shadow drills weeks 2-11 | 3-round, opponent-visualisation scenarios with no rest or doses. Too thin for a session, and similar to the IABA rounds we did take. |
| IABA S&C 27/03/21 AMRAP | Set count contradicts itself on the page. |
| Paid or commercial: TrainHeroic, CoachLife, Payhip, Centr, Men's Health, FightCamp, etc. | Paywalled or commercial blog content, not reputable governing-body material. |

**Result:** no new credited programs for AFL, basketball or tennis passed the bar. Gaps there are filled by Somax originals.

## What we learned (used in the Somax originals)

1. **The 11+ family is the template for every field and court warm-up.** It has three parts: running drills, then strength/balance/plyo, then faster running.
   - Strength exercises progress in 3 levels of about 4 weeks each. It's fine to be on different levels for different exercises.
   - Before matches, do only the running parts.
   - Nordic doses by level: 3-5, then 7-10, then 12-15 (adult 11+); Perform+ uses 1x3-5 to 3x8-10.
   - Copenhagen-style groin work also comes in 3 levels.
   - We used this structure for the basketball "Knee-Smart Court Warm-up", the tennis and AFL MD-1 primers, and the warm-up block of most field sessions.
2. **Kids' programs are game-based and coach-called.** In FIFA 11+ Kids:
   - children freeze on one leg on command;
   - landing, balance and falling/rolling are taught explicitly;
   - press-up and spider positions are done with a ball;
   - there are no stretches in the warm-up.

   Our junior sessions for all five sports use this pattern, keep jump landings to 30-40, and include no max testing.
3. **Boxing squads train in themed rounds.** The IABA uses 3 min (youth) or 2 min (junior) rounds with 30-60 s rest:
   - shadow rounds each have one tactical theme: defence-only movement, lead hand only, feints, counters off slips and blocks, close-range pressure, then an open round;
   - skipping is used as conditioning: either a 5-minute ladder (50, 60, 70, 80, 100%) or rounds of 50 s medium + 10 s flat out;
   - S&C is a 20-minute run plus 30-rep bodyweight circuits and plank series.

   England Boxing changes skipping skills every 10 s. Our 8-round, 12-round, fight-camp and travel sessions copy the one-theme-per-round structure, and the within-round 10 s bursts come from the playbook.
4. **Every session follows the playbook's dosing rules:**
   - plyo contacts per session stay inside the NSCA budgets (largest: basketball advanced vertical at 91 of 140; landing foundations at 85 of 100);
   - sprint volumes follow Haugen (flying runs 140 m; MD-2 primer 120 m; speed endurance 640 m; tempo 1.8 km);
   - none of the MD-1, game-eve or MD+1 sessions include plyos or max sprints;
   - in-season strength is one heavy, low-volume session a week, as in Rønnestad;
   - tennis drills are 5-20 s at 1:3-1:5, and repeated sprints are under 10 s at 1:4;
   - boxing uses 3-minute rounds with 1-minute rest, scaled from 5 x 2 min (beginner) to 12 x 3 min (advanced).
5. **Safety from the playbooks is built into `howToRun`:**
   - AFL concussion return no earlier than day 21;
   - no alcohol in the 48 h before an AFL game;
   - AFL Junior Rules game limits;
   - depth-jump cap of about 45 cm for players over 100 kg;
   - landing readiness checks before plyos;
   - masters players get 3-4 days between plyo sessions;
   - boxing heart-screen note; no head contact or weight-cutting in the app.

## Coverage after this pass (new entries only: credited + Somax)

Counts by level (beginner/intermediate/advanced):

| Sport | Credited | Somax | Total new |
|---|---|---|---|
| AFL | 0 | 6/4/3 = 13 | 13 (library now 54) |
| Soccer | 2/2/1 = 5 | 9/12/5 = 26 | 31 (+2 existing) |
| Basketball | 0 | 10/9/4 = 23 | 23 (+1 existing) |
| Tennis | 0 | 11/8/2 = 21 | 21 (+2 existing) |
| Boxing | 1/6/2 = 9 | 9/9/4 = 22 | 31 (+4 existing) |

Coverage by need (Somax + credited):

| Need | AFL | Soccer | Basketball | Tennis | Boxing |
|---|---|---|---|---|---|
| Junior | junior strength | 11+ Kids x3, junior ball mastery, youth strength | junior footwork, junior strength | junior fundamentals, junior strength + shoulder | junior non-contact |
| Masters / older | masters footy | over-35s | masters/social | masters | over-40s |
| Off-season | home strength, gym size, low-impact aerobic | tempo runs, strength A/B | lower/upper, advanced strength, aerobic base | strength A/B, aerobic base | roadwork, strength A/B, advanced |
| Pre-season | ruck power, midfield repeat-effort, kick-run | 4x4, Yo-Yo shuttles, RSA, strength-power, speed endurance | court conditioning, total-body power, advanced RSA | point-play intervals, advanced RSA, advanced power | fight-camp rounds, 12-round engine |
| In-season / MD-1 / MD+1 | MD-1 activation, 20-min top-up | MD-4 strength, MD-2 speed, MD-1, MD+1, two-game week | 30-min lift, game-eve, post-game, low-minutes top-up | pre-match, between-match, in-season strength | fight-week sharpener, recovery |
| Speed / agility | max-velocity | decel & COD, max-velocity | accel/decel | decel & recovery footwork | alactic, footwork |
| Injury prevention | shoulder/contact, AFLW gym | 11+ L2/L3, hamstring/groin, women's ACL | ankle armour, knee-smart warm-up, landing foundations | shoulder care, elbow/wrist, lower body | shoulder/wrist prehab |
| Mobility / recovery | (existing flush/recovery) | hip & groin mobility, MD+1 | mobility, post-game | mobility flow, between-match | recovery & mobility |
| Skill-conditioning | kick-run | solo ball conditioning, goalkeeper | shooting under fatigue | serve power | partner pads, IABA rounds x7 |
| Home / travel | home strength, 20-min top-up | home strength, hotel | home bodyweight | home band, tournament travel | no-bag HIIT, travel shadow, upper endurance |
| 15-20 / 30 / 45 / 60 min | 15-60 | 20-60 | 15-60 | 15-55 | 15-90 |

## Open questions

1. **Football Australia Perform+:** ask FA for written permission to reproduce it. It is the strongest Australian soccer source.
2. **JSSM tennis protocol:** licence is non-commercial (NC). Ask the authors/journal, or keep it as background only.
3. **Australian governing-body content:** no free, transcribable programs from Basketball Australia or Tennis Australia were found in this pass. A manual check of their coaching portals, which may need a login, could turn some up.
4. **Unverified Somax heuristics:** a few entries use our own coaching defaults that aren't from a fetched source:
   - the 30 s down-and-back cycle in basketball repeat sprints;
   - the "about 5% drop-off" stop rule;
   - the protein guidance in the AFL hypertrophy session.

   They are flagged as Somax conventions and are consistent with the playbooks.
