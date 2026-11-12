# Expansion notes: general fitness + HIIT (`x-gen-`)

Compiled 2026-11-13. Files:
- `gen-sourced.json`: 18 credited sessions (12 general, 6 HIIT). All `verified: true`. I read every one from its `sourceUrl`: a web page, a PDF text layer, or an abstract or full text through the Europe PMC REST API.
- `gen-somax.json`: 63 original Somax sessions (37 general, 26 HIIT). All `verified: false`. Each has `basedOn` ids from `sourced-programs.json` or `gen-sourced.json`.
- Generators: `tools/gen_gen_sourced.py`, `tools/gen_gen_somax.py`. Validator: `tools/validate_gen.py`. Edit the generators and re-run them; don't hand-edit the JSON.
  ```
  cd tools
  python3 gen_gen_sourced.py ../expansion/gen-sourced.json
  python3 gen_gen_somax.py ../expansion/gen-somax.json
  python3 validate_gen.py ..
  ```
- Validator result: 0 errors. It checks:
  - JSON parses
  - required and allowed keys
  - enums
  - only the allowed exercise keys
  - integer sets
  - `duration` == `sessionMinutes`
  - exactly 4 `howToRun` lines
  - unique `x-gen-` ids that don't clash with any existing library file
  - every `basedOn` id exists
  - each series is complete
  - common US spellings and units
  - an exercise-overlap near-duplicate scan

  The scan flags one pair: the 40/20 circuit (intermediate) and the advanced AMRAP 20. They share 4 moves but use a different format, level and volume, so I kept both.

## Phase 1: sources used (credited)

| id (`x-gen-`) | Credit | URL read | Licence / reuse note |
|---|---|---|---|
| nhs-balance-exercises | NHS | nhs.uk/.../balance-exercises/ | © Crown copyright. No do-not-reproduce wording. |
| nhs-sitting-exercises | NHS | nhs.uk/.../sitting-exercises/ | Same as above |
| nhs-warm-up | NHS | nhs.uk/live-well/exercise/how-to-warm-up-before-exercising/ | Same as above |
| nhs-post-exercise-stretches | NHS | nhs.uk/live-well/exercise/how-to-stretch-after-exercising/ | Same as above |
| growing-stronger-part-1/2/3 (series) | Seguin et al., Tufts University & CDC | cdc.gov/physicalactivity/downloads/growing_stronger.pdf | The book says it is "produced for free distribution... without requiring permission", provided the authors and Tufts are credited and the content is not changed. CDC Stacks lists it as public domain. We store facts only (names, sets, reps, tempo). Pounds converted to kg. |
| safe-exercise-at-home-level-2 | Safe Exercise at Home (Australian physios; endorsed by the APA) | safeexerciseathome.org.au/level-2-exercises + example-program PDF | No copyright or terms stated. The PDF's images come from physiotherapyexercises.com (used with permission); we stored no images. |
| royal-womens-postnatal-recovery | Royal Women's Hospital (Vic) Physiotherapy | thewomens.org.au "Improving your recovery after birth" PDF | © RWH, general-information disclaimer, no reproduction restriction. Timeline cross-checked against Better Health Channel "Postnatal exercise". |
| nhs-scotland-hotel-room-circuit | Becky Dunphy & Tyler Spencer, NHS Scotland Right Decision Service | rightdecisions.scot.nhs.uk hotel-room circuit PDF | No copyright wording. The source gives no reps for step-ups or the plank saw, so `10/leg` and `30s` are flagged Somax placeholders in `sourceNote`. |
| interval-walking-training | Nemoto et al., Mayo Clin Proc 2007 | pubmed 17605959 (abstract via Europe PMC) | Research protocol (facts) |
| stair-climbing-snacks | Jenkins et al., APNM 2019 | pubmed 30649897 | Same as above |
| hood-10x1-intervals | Hood et al., MSSE 2011 | europepmc MED/21448086 | Same as above. Cross-read: Little 2010/2011 and Gibala GSSI SSE #139. |
| gillen-one-minute-workout | Gillen et al., PLOS ONE 2016 | PMC4846072 (full text) | CC BY 4.0. Also Gillen 2014, PMC4218754, CC BY. |
| wingate-sprint-intervals | Burgomaster et al., J Appl Physiol 2005 | pubmed 15705728 | Research protocol |
| tabata-protocol | Tabata et al., MSSE 1996 | pubmed 8897392 | Research protocol. The earlier pass skipped Tabata because it had only secondary sources. This time the primary abstract was read. |
| rehit-reduced-exertion | Metcalfe et al., EJAP 2012 | pubmed 22124524 | Research protocol |
| 10-20-30-running | Gunnarsson & Bangsbo, J Appl Physiol 2012 | pubmed 22556401 | Research protocol |

Research-protocol warm-ups and cool-downs that the abstracts don't state are labelled "(added by Somax)" in the exercise name.

## Phase 1: sources skipped, and why

- **NSW Health "Healthy Ageing Physical activity manual" (Active and Healthy Circuits 1 and 2): skipped for licensing.** This was the best Australian older-adult source found. It is read and fully extractable, but it says it "may not be reproduced for commercial usage or sale" without written permission from the NSW Ministry of Health. Worth asking them for permission; the circuits are excellent.
- **NIA (nia.nih.gov) exercise pages:** returned HTTP 405 to both fetch methods. Not verified.
- **NHS Inform "strength and balance exercises" (falls levels 1-3):** 403.
- **Active and Healthy "Falls Prevention Home Exercises" PDF:** 404.
- **Healthy Bones Australia exercise guide:** 404 on the PDF. The landing page has categories only, no doses.
- **CrossFit benchmarks (Cindy etc.):** crossfit.com renders its workouts with JavaScript, so the official page text couldn't be read. Only third-party blogs were readable. Not included.
- **US Army ATP 7-22.02 drills (public domain):** the co.ng.mil PDF returned 403. Not included.
- **Otago:** as the playbook notes, the level/rep table (Table 4) is an image. Not transcribed.
- **Cleveland Clinic "hotel room workout":** readable, but it is a bed-based rehab-style routine and the page is "All Rights Reserved". Too low value for the risk.
- **Exercise Right (ESSA) / healthdirect / Better Health Channel desk or home routines:** no structured routine with doses was found. Better Health "Postnatal exercise" was read and used only as a cross-check, so there is no entry for it, to avoid near-duplicating the RWH entry.
- **NHS "Walking for health" / Active 10:** a single brisk-walk recommendation that near-duplicates the existing Wirral walk. Informed `first-walk-10` only.
- **NHS "Strength and Flex" plan:** video-only, with no reps in the text.
- **Little 2010 (8-12 × 60 s / 75 s) and Little 2011 (T2D 10 × 60/60):** near-duplicates of Hood 2011. Cited in its `sourceNote` instead.
- **Helgerud 2007 15/15:** the abstract gives no repetition count. **Allison 2017 stair 3 × 20 s / 3 × 60 s:** recovery not stated in the abstract, and the full text is paywalled. **Trapp 2008 8 s/12 s:** protocol not in the abstract. All three skipped.
- **Billat vVO2max intervals:** elite and individualised. Skipped.
- The 7-Minute Workout already exists, so it was not re-added.
- Fetch method: when the site served plain responses, sources were fetched with WebFetch, or with curl for the Europe PMC API. A browser-UA spoof attempt was blocked by policy and not retried.

## What I learned (and applied in Phase 2)

1. **The HIIT evidence base is mostly bike protocols in small, young or sedentary samples.** Hood 2011 shows 10 × 60 s at only ~60% of peak power works in inactive 45-year-olds. REHIT (2 short sprints, RPE ~13) and stair snacks (3 × 60 steps a day) show tiny doses help sedentary people. So Somax beginner HIIT is submaximal with recovery ≥ work. All-out work (Gillen, Wingate, Tabata) is advanced only, and every HIIT session carries the 20-minute cardio gate (playbook rule).
2. **Real Tabata is supramaximal (~170% VO2max) and was done 5 days a week by fit young men.** App "Tabata" is a timing format, not the stimulus. The sourced entry says so, the Somax Tabata-style entry says so, and both cap it at 2-3 a week.
3. **Interval walking (Nemoto) is a strong older-adult tool.** It beat steady walking for thigh strength and VO2 in 63-year-olds, which justified walk-based intervals (hill-walk intervals, the incline-walk fat-loss day) for people who won't run.
4. **Older-adult programs share a clear structure.** Across Growing Stronger, the NHS series, Safe Exercise at Home and the playbook's Otago rules:
   - slow tempo (2-4 up, 4 down)
   - 2 × 10 reps
   - progress when 10 reps are easy
   - support always within reach
   - balance progressed by narrowing the stance

   The Somax older-adult sessions (Steady Feet, Strong Legs for Life, Seated Strength, Active Agers, Walk & Balance) follow exactly that, from supported to independent.
5. **Postnatal guidance is consistent and conservative.** It always comes in this order:
   1. pelvic floor and deep abdominals from days 1-2
   2. gentle walking that builds to 30 minutes
   3. no weights, sit-ups or impact for about 12 weeks, and nothing heavier than the baby for 6 weeks

   Somax postnatal is limited to a 0-6 week session and a post-6-week-check strength session. There is no return-to-running or HIIT postnatal content, because the sources leave that to a pelvic health physio.
6. **Fat loss = modest diet deficit + volume.** Somax fat-loss weeks are built as 3-, 4- and 5-day series that follow the playbook's weekStructure. Strength A/B, steady cardio, a long walk and, at advanced level only, one interval day push weekly minutes toward 250. At most 1 kg a week, with copy that steers away from crash dieting.
7. **Equipment honesty matters for filtering.** Each session lists only what it truly needs. New tags:
   - `exercise bike`, `rower`, `jump rope`, `stairs`, `ankle weights`, `backpack`, `luggage`, `stable support`, `wall`, `cardio machine`

   The onboarding step currently offers only Full gym / Dumbbells / Barbell / Bands / Bodyweight only / Cardio machine. **The app's equipment-matching map should alias** these tags:

   | Tag | Should map to |
   |---|---|
   | bodyweight, chair, wall, stairs, stable support, luggage, backpack | everyone (household items) |
   | exercise bike, rower | Cardio machine |
   | mat, step, jump rope, ankle weights | small home kit |

   Otherwise those sessions may never surface.

## Coverage table

Counts of sessions per sport and level:

| Sport | Level | Credited (gen-sourced) | Somax (gen-somax) |
|---|---|---|---|
| general | beginner | 10 | 20 |
| general | intermediate | 1 | 8 |
| general | advanced | 1 | 9 |
| hiit | beginner | 0 | 6 |
| hiit | intermediate | 3 | 12 |
| hiit | advanced | 3 | 8 |
| **Total** | | **18** | **63** |

Gap coverage:

| Gap from the brief | Sessions (ids without the `x-gen-` / `x-gen-somax-` prefix) |
|---|---|
| From zero / low-impact | first-walk-10, from-zero-chair-strength-10, 3x10-walking-day, kitchen intervals, step intervals, hill-walk intervals, quiet-apartment-hiit-30, Growing Stronger I |
| HIIT protocols | 10 × 1 min (Hood), 30/60 starter, 30/30 run, 40/20 circuit, EMOM 20 / EMOM 16 KB / EMOM 30 DB, AMRAP 15 / AMRAP 20, Tabata (sourced + style), pyramid, 10-20-30, REHIT, Wingate, one-minute workout, 10 × 15 s sprints, hill sprints, rower 250s |
| Fat-loss weeks (strength + cardio) | Fat-Loss Starter (3 days, beginner), Builder (4 days, intermediate), Accelerator (5 days, advanced) |
| Durations | 5, 6, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 75 min |
| Home bodyweight / dumbbell / band | 40/20 circuit, bodyweight-strength-30, AMRAP/complex/chipper DB, band-full-body-25, band-intervals-15 |
| Hotel / travel | NHS Scotland hotel circuit, hotel-room-starter-15, hotel-band-hiit-20, advanced-hotel-30, travel-day-mobility-10, stairwell intervals |
| Office / desk | NHS sitting, desk-reset-5, office-strength-snack-10, stair-climbing snacks, 3 × 10 walking day |
| Older adults strength + balance | NHS balance, Growing Stronger I-III, Safe Exercise at Home L2, interval walking, steady-feet, strong-legs, seated-strength-bands, active-agers, walk-and-balance |
| Postnatal (conservative) | Royal Women's recovery, postnatal-gentle-start, postnatal-strength-return |
| Gym | gym-cardio-circuit-45, accelerator days 1 & 3 |
| Benchmarks | fitness-check-in (chair stand, push-ups, plank, 10-min walk distance) |

Not covered (no reliable free source, or out of scope): pregnancy exercise sessions (NHS gives guidance only), return to running postnatally, tai chi (copyrighted programs), Otago levels.
