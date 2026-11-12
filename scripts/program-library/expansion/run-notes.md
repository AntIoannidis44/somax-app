# Running and walking expansion: research notes

Compiled on 2026-11-13. This covers running (5K to marathon, trail and track) and walking/general fitness. Every id starts with `x-run-`.

## Files

| File | Contents |
|---|---|
| `run-sourced.json` | **71 credited sessions** (65 running, 6 walking). Each one was read from the page or PDF in its `sourceUrl` today. All have `verified: true`. |
| `run-somax.json` | **37 Somax originals** (27 running, 10 walking). All have `verified: false`, `credit: "Somax"`, and a `basedOn` list pointing at credited ids. |
| `../tools/gen_run_sourced.py` | Generator for the credited file. Edit the data here, not in the JSON. |
| `../tools/gen_run_somax.py` | Generator for the Somax file. Edit the data here, not in the JSON. |
| `../tools/validate_run_expansion.py` | Validator (see below). |

**Regenerate and validate** from `program-library/`:

```
python3 tools/gen_run_sourced.py expansion/run-sourced.json
python3 tools/gen_run_somax.py expansion/run-somax.json
python3 tools/validate_run_expansion.py .
```

The last run gave **0 errors**. The validator checks:

- the JSON parses;
- required fields are present, with no unexpected keys;
- enums: level, sport (running/general), category, goals and lifestyle;
- exercise keys are limited to name/sets/reps/weight/distance/group, with the right types;
- `howToRun` has exactly 4 items;
- `duration` matches `sessionMinutes`;
- ids carry the `x-run-` prefix and are unique, including against the existing library;
- Somax and sourced entries follow their own field rules;
- every `basedOn` id exists;
- no exercise list duplicates another anywhere in the library.

Library total once merged: **running = 100** (8 existing + 92 new), which is the ceiling. **Walking/general = 18** (2 existing + 16 new).

## Confidence bar

An entry went into `run-sourced.json` only if it met every one of these tests:

1. It is free and public, with no login and no paywall.
2. I fetched it and read the actual text. For PDFs, I extracted the text with pypdf.
3. It comes from a reputable body or a named, credentialed coach: national health bodies (NHS, NIH), a university, the official program of an Australian mass-participation event, or a peer-reviewed protocol.
4. It is clear enough to transcribe without guessing.
5. It has no "do not reproduce" or "all rights reserved" wording.

**What I copied and what I wrote:**

- **Copied:** only facts, meaning timings, distances, reps, recoveries and efforts as written.
- **Written in our own words:** `description`, `whoItsFor` and `howToRun`.

**Gaps in a source:** where a source leaves something out, I said so in the exercise text rather than inventing it. Examples:

- the warm-up length in Kellie Angel's plan;
- the dose for wall squats on the NHS knee page;
- the warm-up in the 10-20-30 abstract.

## Sources used

| Source (credit) | URL read | Entries | Licence / notes |
|---|---|---|---|
| NHS Couch to 5K, remaining weeks | nhs.uk/better-health/.../couch-to-5k-running-plan/ | 8 | © Crown copyright. Timings only, the same treatment as the existing weeks 1, 5 and 9. I dropped week 6 run 3 (identical to week 7) and week 8 (a near-duplicate). |
| Melbourne University Sport, *Beginner Run plan – Zero to 5k!* | sport.unimelb.edu.au/pdfs/Beginner-Run-plan-week-3 / -Week-5 / -Week-7.pdf | 6 | University PDF with no copyright notice. The week-7 PDF holds all 21 sessions; week numbers come from its day grid. I chose sessions that add something beyond C25K: RPE 6-7 work, 30/30s, a ladder, and 3 x 10. |
| NHLBI (NIH), *Your Guide to Physical Activity and Your Heart* | nhlbi.nih.gov/files/docs/public/heart/phy_active.pdf | 4 | US federal publication, **public domain**. Walking weeks 1 and 12; jogging weeks 4 and 10. The Texas A&M walking plan is adapted from this, so I skipped it as a duplicate. |
| Wirral Community Health & Care NHS FT walking plans | wchc.nhs.uk/.../Walking-plans-Beginners.pdf, -Advanced.pdf | 3 | Free NHS trust leaflets. The intermediate plan was already in the library, and I dropped the week-9 brisk walk as a near-duplicate. |
| Shinshu University (Nose, Masuki et al.), Interval Walking Training | europepmc.org/article/MED/31477320 (+ PMC9024697, CC BY) | 1 | Research protocol from abstracts: 3 min fast at ≥70% / 3 min slow at about 40%, ≥5 sets, ≥4 days a week. |
| Gunnarsson & Bangsbo 2012, 10-20-30 | europepmc.org/article/MED/22556401 | 1 | PubMed abstract. pubmed.ncbi.nlm.nih.gov itself returned a cookie wall, so I read the abstract through the Europe PMC API. |
| Newcastle upon Tyne Hospitals NHS FT, *Injury prevention advice for runners* | newcastle-hospitals.nhs.uk/services/injury-prevention-advice-for-runners/ | 1 | © the trust. Physio doses copied as stated. |
| NHS, *Knee exercises for runners* | nhs.uk/live-well/exercise/knee-exercises-for-runners/ | 1 | © Crown copyright. Two exercises have no dose on the page, and the entry says so. |
| **Pat Carroll** (Australian All-Comers half-marathon record, 61:11), Great Ocean Road (GOR) Running Festival plans, 2017 | greatoceanroadrunfest.com.au/wp-content/uploads/2017/02/{Beginner,Intermediate,Advanced}-Half-Marathon.pdf, Advanced-Marathon.pdf | 12 | Free PDFs on the official festival site with no copyright notice. Pat sells personalised plans, so credit him and link out. |
| **Dr Kellie Angel**, Endurance Edge (AA Level 3 Recreational Running Coach; AA course developer), RACV Solar Marathon plan | greatoceanroadrunfest.com.au/.../2023/03/RACV-SOLAR-MARATHON-TRAINING-PLAN-5.pdf | 11 | Free PDF on the official festival site, no notice. It assumes 40-50 km a week, so these are all advanced. |
| **Kieser** physios and EPs (Paul Percy, Josh Miller), *Strength to Run*, GOR 2022 | .../2022/03/Running-program_{Marathon,14km}-GORRF.pdf | 8 | Free booklets, no notice. The booklets call for 2 strength sessions a week but don't detail them. |
| **Dinneen Runners x Brooks Running**, GOR 2023 (5 km beginner; 14 km beginner and intermediate) | .../2023/03/Brooks-Running-X-Dinneen-5km-run-program.pdf, Dinneen-Brooks-14km-*.pdf | 9 | Free PDFs, no notice. Dinneen Runners is the festival's training-camp group, led by Steve Dinneen, the 2018 GOR half winner. The PDFs name no individual, so the credit stays at group level. |
| **The 440 Running Club** (Todd Liubinskas & Trent Knox), rebel x 440 City2Surf Official Training Program 2023 | rebelsport.com.au/.../City2Surf-TrainingProgram.pdf | 6 | Free official event PDF from a commercial partnership (rebel/adidas), no notice. Credit The 440 and don't imply endorsement. |

## Skipped and why

- **Hal Higdon:** the terms are unchanged ("All rights reserved"), so nothing was copied, as before.
- **AHA/ACE six-week walking plan** (bu.edu PDF): "©2011 American Council on Exercise. All rights reserved." Excluded.
- **Heart Foundation (Australia) walking plans:** you need to register to get a plan, and the plan subdomain (walkingplans.heartfoundation.org.au) didn't resolve. Excluded.
- **Athletics Australia 5 km plan:** athletics.com.au/keep-fit/5km-training-plan now returns 404. Its authors, Adam Didyk and Tim Crosbie, appear only in a search snippet, so I couldn't verify it.
- **Victoria University Melbourne Marathon plans:** all three PDFs return 404.
- **Nuffield Health 5k plan:** 404.
- **Red Socks Run (Kidney Health Australia):** the asset link has no plan in it.
- **Gold Coast Marathon junior diaries:** 403.
- **Older City2Surf PDFs (UA x 440):** the 2023 rebel x 440 program supersedes them. Their round counts for the conditioning circuit were also ambiguous.
- **rebel x 440 "Run + Conditioning" day:** the rounds aren't clear, so I left it out.
- **Brooks 12-week half and marathon PDFs** (GOR 2022/2024/2025): no coach is named, and the content is mostly generic easy kilometres. Not included.
- **GOR 2017 ultra plans:** I didn't read them, so they're unverified. A candidate for later trail and ultra work.
- **Medibank 8-week 10K guide:** a commercial insurer, and the sessions are distance-only, so it added little. Skipped.
- **Kieser 6 km program:** a near-copy of C25K's progression. Skipped.
- **Texas A&M walking plan:** a derivative of NHLBI. Skipped.
- **Pat Carroll's "15 km at goal half pace"** from the beginner plan: too aggressive to label "beginner" without his context. Left out.
- **Kellie Angel's "Mona fartlek":** the PDF names it but gives no structure, so I didn't add one from memory.
- **Not attempted, or open questions for later:**
  - Mayo Clinic: its terms restrict reproduction.
  - Jeff Galloway run-walk: terms not checked.
  - parkrun: publishes no training sessions.
  - Runner's World and Yasso 800s: commercial magazine, not checked.

## Licensing caveats

1. **Event PDFs** (GOR, City2Surf) and the **Melbourne Uni Sport** plan have no explicit licence and no prohibition. We store only the session facts, credit the coach or organisation, and link to the PDF. Several are from earlier event years, so the links could disappear. It's worth archiving the PDFs ourselves before shipping.
2. **Commercial names** (Brooks, rebel, adidas, Kieser, Endurance Edge) are used only to credit. The app must not imply endorsement.
3. **NHS content** is Crown copyright, the same caveat as `RESEARCH-NOTES.md`: check the NHS website terms before shipping. **NHLBI** is US public domain. **PMC9024697** is CC BY.
4. **Dinneen attribution** stays at the "Dinneen Runners" group level, because no individual is named in the PDFs.

## What I learned (and applied to the Somax originals)

- **Australian event coaches teach pacing by effort and by time.**
  - Pat Carroll prescribes nearly everything as "80% effort", time-based runs and standing or jog recoveries.
  - His A-B-A out-and-back reps teach even pacing without a watch. That's a neat device, and I used the idea in Somax how-tos.
  - Somax originals therefore give an effort cue first and an example pace second. The examples come from the playbook VDOT table for a 25:00 5K: E 6:07-6:52, T 5:16, I 4:51, R 4:36 per km.
- **Short recoveries are the norm in Australian road plans.**
  - The examples: 30 s jog (Pat), 1 min walk (Dinneen), and 500 m or 1 min floats (Kieser, Kellie Angel).
  - "Float" recoveries, meaning steady running rather than walking, are a recurring marathon tool.
  - The Somax Over-Unders and Cruise Intervals follow the same logic, inside the playbook's caps: T ≤10%, I ≤8%, R ≤5% of weekly km.
- **The plans rely heavily on hills.**
  - Hills appear in every GOR plan and in the City2Surf program (Heartbreak Hill).
  - The 440 explicitly gives a treadmill alternative (incline 8-10).
  - So I added a treadmill hill pyramid, a trail climb-and-descend session and hill sprints, each with a distinct stimulus from the sourced hill sessions.
- **Beginner plans converge on the same shape.**
  - NHS, Melbourne Uni, NHLBI and Kieser 6 km all use 5-minute walks either side, run-walk blocks and 3 days a week.
  - Uni Melb is the only one to introduce RPE 6-7 and 30/30s before 5 km.
  - Somax doesn't add another C25K clone. Instead it fills the gaps either side:
    - a **walk-to-jog bridge**, from walking plans into C25K week 1;
    - a **return-to-running 4:1**, at a 50-70% volume restart (the playbook's heuristic).
- **Race week is light everywhere.** Kieser does 6 x 400 at 5K pace plus 20 min with strides, and Kellie Angel uses a table-top 1-3-3-1. That's why Somax has no separate taper session.
- **Strength is the gap the coaches name but don't fill.** Kieser schedules 2 strength sessions a week and never details them. Melbourne Uni points to online classes instead.
  - **Sourced coverage:** the NHS physio routines (Newcastle, NHS knee).
  - **Somax coverage:** advanced plyometrics, calf and Achilles work, and mobility, which a beginner routine doesn't reach.
- **Walking research** (Interval Walking Training, IWT): the fitness gains plateau at about 50 min a week of fast walking. Walking alone doesn't cut falls.
  - **Somax 60+ sessions:** they pair walks with Otago/NHS-style balance work at the kitchen bench, with support always within reach, following the general playbook's older-adults safety rules.
- **Australian context sessions added:**
  - Hot-Day Easy Run: run by effort, early or late, with drink stops.
  - parkrun power-walk.
  - Bushwalk prep hike, aimed at Overland Track and Larapinta-type goals.

## Coverage table (new + existing library)

| Session type | Credited | Somax |
|---|---|---|
| Run-walk / Couch to 5K | NHS C25K wks 1-7, 9 (11 total), Uni Melb x6, NHLBI jog x2 | Return-to-Running 4:1, Walk-to-Jog Bridge |
| Easy / recovery | — | Easy Aerobic 45, Recovery 25, Hot-Day Easy, Lunchtime 20, (existing) Easy Run & Strides |
| Long run | Pat Carroll walk-break 1:40, HMP-finish 1:40, 3 h MP-finish; Kellie Angel 32 km LSD; Kieser 28 km MGP; Dinneen 16 km pick-up | First Long Run 60, Long Run 90 + fuel, Trail Long Run |
| Tempo / threshold | Kieser 8-6-4-2, 3 x 10; Kellie Angel progressive, 2-8-2 MP; Dinneen 15 min + 2 x 1 | Cruise 4 x 1 km, Progression 40, Treadmill 2 x 15, Over-Unders, (existing) Tempo Run |
| Intervals: 200/400/800/km | Kieser 6 x 400; 440 10 x 400; Pat 6 x 500, 5 x 1 km; Kieser 3 x 2 km, 6 x 3 min; NTNU 4x4 (existing) | 10 x 200 R, Track Ladder 1200-400, (existing) Track 800s |
| Short intervals / fartlek | Pat 15 x 30/30, 8 x 1, 6 x 2, A-B-A x2; Kellie Angel 10 x 30, 8 x 2, pyramid, Telford, table-top; 440 stage run, 3+2 continuous, 10-8-6; 10-20-30; Kieser walk-jog-run; Dinneen 4 x 5, 3 x 10 (5K) | Treadmill 6 x 2 |
| Hills | Pat 15 reps; Kellie Angel 60 s, U-shaped, surge run; Dinneen 8 x 1 min, 5 x 90 s; 440 hill repeats (+ treadmill option) | Hill Sprints, Treadmill Hill Pyramid, Trail Climb & Descend |
| Strides / drills / warm-up | Dinneen strides, Kieser jog + strides, 440 warm-up | Form Drills & Strides |
| Race-pace / race-specific | Dinneen 4 x 8 (14 km), Kellie Angel 2-8-2 MP, Kieser MGP | 3 x 3 km HMP |
| Testing | Pat 3 km TT | 5K Benchmark TT (VDOT retest) |
| Treadmill | (440 hill option) | Easy, 6 x 2, Hill Pyramid, 2 x 15 Threshold, Incline Walk |
| Trail | — | Trail Run-Walk, Climb & Descend, Time-on-Feet Long Run |
| Masters | — | Masters (50+) Quality |
| Strength & mobility | Newcastle NHS physio routine, NHS knee exercises, (existing Somax Runner's Strength, gym) | Plyo Power (adv), Calf & Achilles, Runner's Mobility 15 |
| Walking: general / fat loss | NHLBI wk 1 & 12, Wirral beginner wk 1, advanced 75 min & 40 min brisk, (existing Wirral intermediate) | Treadmill Incline, Lunchtime Power Walk, Stair Climb, Ruck, parkrun 5 km Power Walk, Weekend Long Walk 60, Bushwalk Prep, (existing Brisk Walk & Hills) |
| Walking: older adults | IWT 3/3 (Shinshu), NHLBI | Walk & Balance 60+, 3 x 10 Walking Snacks (supported) |

**Counts by level** (new files only):

| Group | Beginner | Intermediate | Advanced |
|---|---|---|---|
| Credited running | 33 | 15 | 17 |
| Somax running | 7 | 14 | 6 |
| Credited walking | 4 | — | 2 |
| Somax walking | 5 | 5 | — |

**Durations** (all new entries):

| Sport | ≤20 min | 21-30 | 31-45 | 46-60 | 61+ |
|---|---|---|---|---|---|
| Running | 5 | 13 | 43 | 21 | 10 |
| Walking | 2 | 5 | 4 | 3 | 2 |

**Equipment:** these values are new to the library's equipment vocabulary: `treadmill`, `trail shoes`, `hydration pack`, `daypack`, `walking shoes`, `backpack with weight` and `stairs or step`. The app's equipment filter may need to map them.
