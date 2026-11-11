# Running playbook (Somax plan engine)

Machine-readable version: `running.json` (same folder). This file explains the model in plain English. Everything is in our own words. Each figure is labelled:

- **sourced**: taken from a page we actually fetched (or from an abstract summary we searched).
- **derived**: computed from a sourced formula.
- **unverified** or **Somax heuristic**: our own engineering choice, or a figure we could not confirm on a fetched page.

## 1. Benchmarks

The primary benchmark is a **5 km time** from a recent time trial, parkrun or race (last 6 weeks). A 1 mile, 10K, half or marathon result also works: every result is converted to VDOT, and from there to a 5K-equivalent time. The supporting inputs are:

- the longest continuous run in minutes (this places new runners);
- average weekly km over the last 4 weeks (caps the starting volume);
- the longest recent run (caps the first long run);
- days per week (3 to 6);
- months of consistent running.

## 2. Level placement

The runner's level is the **lower** of two placements: performance and history.

- **New runner**: can't run 30 min (or 5 km) without walking. They start on the NHS Couch to 5K progression (9 weeks, 3 runs a week, rest days between runs). *Sourced.*
- **Performance by sex.** Based on RunRepeat percentiles for 2018 US 5K finishers (about 2.6M people, parkrun excluded):
  - medians: men 31:18, women 36:24;
  - fastest 10%: men 22:06, women 25:16.
  - Placement: slower than the median is **beginner**, median to the top 10% is **intermediate**, top 10% is **advanced**. *The percentiles are sourced; using them as level cut points is our heuristic.*
- **Sex-neutral fallback by VDOT**: under 33 is beginner, 33 to 45 is intermediate, over 45 is advanced. *Heuristic.*
- **History.** Intermediate means at least 12 months at 3-4 days a week and 20-40 km a week. This is anchored on Higdon's Intermediate 5K prerequisite of 1-2 years at 15-20 mi/wk. Advanced means at least 24 months and over 40 km a week. This is anchored on Pfitzinger's lowest 10K tier, which expects 25-35 mi/wk already.
- **Age (optional).** WMA age grading. USATF Masters class bands are: 60% local, 70% regional, 80% national, 90% world class. *Sourced.* Suggested use for runners 40+: an age grade of 60% or more places them at least intermediate, 70% or more places them advanced. *Heuristic.* The WMA factor tables are **not bundled** and still need sourcing.

## 3. Pace model (Daniels / Gilbert VDOT)

**Formulas.** These are sourced: they come from Daniels & Gilbert, reproduced in Bill Mill's notes and in several calculators.

- Oxygen cost: `VO2(v) = -4.60 + 0.182258·v + 0.000104·v²`, with v in m/min.
- Fraction of VO2max sustainable for t minutes: `F(t) = 0.8 + 0.1894393·e^(-0.012778·t) + 0.2989558·e^(-0.1932605·t)`.
- `VDOT = VO2(d/t) / F(t)`.
- Check: a 10K in 40:00 gives VDOT 51.9, which matches the worked example.

**Training paces** are the speed where VO2 equals a fraction of VDOT:

| Zone | How derived | Calibration |
|---|---|---|
| Easy / long | 0.63 to 0.73 × VDOT | Daniels E = 59-74% VO2max. Book excerpt for VDOT 51 gives 4:52-5:29/km, which we reproduce |
| Marathon | equivalent marathon race pace | VDOT 51 gives 4:27/km, matching the book excerpt |
| Threshold | 0.88 × VDOT | VDOT 51 gives 4:11/km, matching |
| Interval | 0.975 × VDOT | VDOT 51 gives 3:51/km, matching. Daniels I = 95-100% |
| Repetition | faster of: 1 mile race-equivalent pace, or 5% faster than I | Daniels R = 105-120% VO2max. **This approximation is unverified against the printed R column** |

The VDOT 51 calibration row came from a search snippet of Daniels' Table 5.2, not a fetched page. Treat it as partially verified.

**Rules:**

- Train at **current** fitness, not goal fitness. Goal pace appears only in peak-phase race-pace reps.
- Without a new test, raise VDOT by **at most 1 point every 4-6 weeks**, and only if sessions are going well. This is Daniels' own Q&A. *Sourced.*
- Re-test every 4-6 weeks and reset VDOT to the result.
- Riegel (`T2 = T1·(D2/D1)^1.06`, valid for about 3.5-230 min) is only a cross-check. It predicts optimistically at long distances.

**Pace table** (min:sec per km). Rows marked * have VDOT under 30. Those values are formula extrapolations below most published tables, so for new or slow runners use effort (the talk test) instead.

| 5K | VDOT | Easy/Long | M | T | I | R | 10K eq | Half eq | Mar eq | |
|---|---|---|---|---|---|---|---|---|---|---|
| 16:00 | 64.6 | 4:01-4:32 | 3:38 | 3:27 | 3:11 | 2:53 | 33:13 | 1:13:19 | 2:33:26 |
| 17:00 | 60.2 | 4:15-4:48 | 3:52 | 3:40 | 3:22 | 3:04 | 35:16 | 1:17:56 | 2:42:56 |
| 18:00 | 56.3 | 4:30-5:04 | 4:05 | 3:52 | 3:33 | 3:15 | 37:20 | 1:22:33 | 2:52:25 |
| 19:00 | 52.9 | 4:44-5:19 | 4:19 | 4:04 | 3:44 | 3:27 | 39:24 | 1:27:11 | 3:01:52 |
| 20:00 | 49.8 | 4:58-5:35 | 4:32 | 4:16 | 3:56 | 3:38 | 41:28 | 1:31:50 | 3:11:17 |
| 21:00 | 47.0 | 5:12-5:51 | 4:45 | 4:28 | 4:07 | 3:50 | 43:32 | 1:36:28 | 3:20:41 |
| 22:00 | 44.5 | 5:26-6:06 | 4:59 | 4:40 | 4:18 | 4:01 | 45:37 | 1:41:07 | 3:30:03 |
| 23:00 | 42.3 | 5:39-6:22 | 5:12 | 4:52 | 4:29 | 4:13 | 47:42 | 1:45:46 | 3:39:22 |
| 24:00 | 40.2 | 5:53-6:37 | 5:25 | 5:04 | 4:40 | 4:24 | 49:48 | 1:50:25 | 3:48:40 |
| 25:00 | 38.3 | 6:07-6:52 | 5:38 | 5:16 | 4:51 | 4:36 | 51:53 | 1:55:04 | 3:57:55 |
| 26:00 | 36.6 | 6:21-7:07 | 5:51 | 5:28 | 5:02 | 4:47 | 53:59 | 1:59:42 | 4:07:08 |
| 27:00 | 35.0 | 6:35-7:22 | 6:04 | 5:40 | 5:14 | 4:58 | 56:05 | 2:04:20 | 4:16:19 |
| 28:00 | 33.5 | 6:48-7:37 | 6:17 | 5:52 | 5:25 | 5:09 | 58:11 | 2:08:57 | 4:25:28 |
| 29:00 | 32.1 | 7:02-7:52 | 6:30 | 6:04 | 5:36 | 5:19 | 1:00:17 | 2:13:34 | 4:34:35 |
| 30:00 | 30.8 | 7:15-8:07 | 6:43 | 6:16 | 5:47 | 5:30 | 1:02:23 | 2:18:10 | 4:43:39 |
| 31:00 | 29.6 | 7:29-8:22 | 6:56 | 6:28 | 5:58 | 5:40 | 1:04:29 | 2:22:45 | 4:52:41 | *
| 32:00 | 28.5 | 7:42-8:37 | 7:09 | 6:40 | 6:09 | 5:51 | 1:06:35 | 2:27:20 | 5:01:42 | *
| 33:00 | 27.5 | 7:56-8:51 | 7:22 | 6:52 | 6:20 | 6:01 | 1:08:41 | 2:31:53 | 5:10:40 | *
| 34:00 | 26.5 | 8:09-9:06 | 7:34 | 7:03 | 6:31 | 6:11 | 1:10:47 | 2:36:26 | 5:19:36 | *
| 35:00 | 25.6 | 8:22-9:20 | 7:47 | 7:15 | 6:42 | 6:22 | 1:12:53 | 2:40:59 | 5:28:30 | *
| 36:00 | 24.7 | 8:35-9:35 | 8:00 | 7:27 | 6:53 | 6:32 | 1:14:59 | 2:45:30 | 5:37:22 | *
| 37:00 | 23.9 | 8:48-9:49 | 8:12 | 7:39 | 7:04 | 6:43 | 1:17:05 | 2:50:01 | 5:46:13 | *
| 38:00 | 23.1 | 9:02-10:03 | 8:25 | 7:51 | 7:15 | 6:53 | 1:19:11 | 2:54:30 | 5:55:01 | *
| 39:00 | 22.4 | 9:15-10:17 | 8:37 | 8:02 | 7:26 | 7:04 | 1:21:17 | 2:58:59 | 6:03:48 | *
| 40:00 | 21.7 | 9:28-10:31 | 8:50 | 8:14 | 7:37 | 7:14 | 1:23:22 | 3:03:27 | 6:12:33 | *
| 41:00 | 21.0 | 9:41-10:45 | 9:02 | 8:26 | 7:48 | 7:25 | 1:25:28 | 3:07:55 | 6:21:17 | *
| 42:00 | 20.4 | 9:54-10:59 | 9:15 | 8:37 | 7:59 | 7:35 | 1:27:33 | 3:12:21 | 6:29:59 | *
| 43:00 | 19.8 | 10:07-11:13 | 9:27 | 8:49 | 8:10 | 7:46 | 1:29:39 | 3:16:47 | 6:38:39 | *
| 44:00 | 19.2 | 10:19-11:27 | 9:39 | 9:00 | 8:21 | 7:56 | 1:31:44 | 3:21:11 | 6:47:18 | *
| 45:00 | 18.7 | 10:32-11:41 | 9:51 | 9:12 | 8:31 | 8:05 | 1:33:49 | 3:25:35 | 6:55:55 | *

## 4. Improvement model and plan length

**Evidence:**

- Daniels caps pace increases at 1 VDOT per 4-6 weeks, which is about 0.17-0.25 VDOT a week.
- 7 weeks of 10-20-30 training took 48 s off moderately trained runners' 5 km times (Gunnarsson & Bangsbo 2012).
- 8 weeks took 38 s off for 160 recreational runners (Gliemann et al.).
- No fetched source gave a % improvement figure for true novices. The idea that they improve faster is **unverified**, but it is standard coaching knowledge.

**Somax heuristic.** Expected VDOT gain per week depends on current VDOT:

| Current VDOT | Gain per week |
|---|---|
| under 30 | 0.50 |
| 30-35 | 0.40 |
| 35-42 | 0.25 |
| 42-50 | 0.18 |
| 50-58 | 0.10 |
| 58+ | 0.05 |

- Days-per-week multiplier: 3 days ×0.85, 4 days ×1.0, 5 days ×1.1, 6 days ×1.15.
- Scenarios: conservative ×0.7, expected ×1.0, optimistic ×1.3.
- The engine simulates week by week, so gains slow as the runner gets fitter.

**Plan length algorithm:**

1. Work out current VDOT and target VDOT.
2. If the goal has already been reached, offer a sharpening plan or a harder goal.
3. Count the build weeks needed (expected scenario) and add the taper: 1 week for 5K/10K, 2 for a half, 3 for a marathon.
4. Clamp the result to the minimum weeks for the goal: 5K 6, 10K 8, half 10, marathon 16, first 5K 9.
5. If the plan is longer than the maximum block (16 weeks; 18 for advanced; 20 for a marathon), use a **stepping stone**:
   - Block 1's goal is the time the conservative scenario reaches in 16 weeks, rounded to a friendly time (to the slower :30).
   - Retest after block 1, then plan the next block.
6. If the total is over 52 weeks, label the goal long-term and show only the first stepping stone.

**Worked examples** (from simulating the model):

- 30:00 to 25:00 at 4 days a week needs 24 build weeks. That is two blocks: 16 weeks to 27:00, retest, then about 8-10 weeks to 25:00.
- 26:00 to 25:00 at 4 days a week needs 7 build weeks plus a 1-week taper: an **8-week** plan.
- 22:00 to 20:00 at 5 days a week needs 27 weeks: two blocks, the first ending around 21:00-21:15.
- 20:00 to 18:00 at 6 days a week needs about 56 weeks, so it is a long-term goal.

**Completion goals** (sourced):

| Goal | Plan length | Source plan | Prerequisite |
|---|---|---|---|
| First 5K | 9 weeks | NHS Couch to 5K | none |
| 5K finish | 8 weeks | Higdon Novice | some jogging; week 1 runs are 1.5 mi |
| Half marathon | 12 weeks | Higdon Novice 1 | can run 3 mi, 3-4 times a week |
| Marathon | 18 weeks | Higdon Novice 1 | — |

The Higdon Novice 10K plan exists, but we didn't fetch its details (unverified).

## 5. Volume model

**Starting weekly km by level and days** (3 / 4 / 5 / 6 days):

| Level | 3 days | 4 days | 5 days | 6 days |
|---|---|---|---|---|
| Beginner | 7-12 | 10-16 | 12-20 | 15-22 |
| Intermediate | 15-22 | 20-30 | 25-38 | 30-45 |
| Advanced | 25-35 | 35-48 | 45-60 | 50-75 |

- Never start above 1.1 × the runner's current weekly volume.
- Anchors (sourced):
  - Higdon Novice 5K week 1 is 4.5 mi (7.2 km).
  - Higdon Intermediate 5K prerequisite is 15-20 mi (24-32 km) a week.
  - Pfitzinger's 10K tiers start at 30, 45 and 60 mi (48, 72 and 97 km) and peak at 42, 57 and 76 mi.
- Higdon novice peaks: half about 20-23 mi; marathon about 40 mi with a 20 mi long run.
- The ranges between these anchors are our heuristic.

**Progression:**

- Default +8% a week (+5 to 10%). Under 20 km a week, add 2 km instead.
- Never more than +30% over any 2 weeks. In Nielsen 2014 (874 novices), increases over 30% in 2 weeks were linked to more distance-related injuries than increases under 10%.
- The 10% rule itself is weakly supported. In Buist 2008's RCT, a graded 10% programme had 20.8% injuries against 20.3% for a faster standard programme. So we treat 10% as a conservative default, not a proven threshold.

**Long run** (Daniels):

- No more than 25-30% of weekly km, up to about 64 km a week.
- No more than 150 min.
- Grow it by 1-2 km a week.

**Intensity:**

- At least 80% of time easy (Seiler's observation of elite athletes; Fitzgerald's 80/20).
- Per-session caps: T ≤ 10% of weekly km; I ≤ 8% (and ≤ 10 km); R ≤ 5% (and ≤ 8 km).

**Cutback weeks:**

- Every 3rd week for beginners and marathon plans (Higdon Novice 1 Marathon). Every 4th week otherwise.
- Cut volume by 20-30%. *That size is unverified.*

**Taper:**

- Bosquet 2007 meta-analysis: about 2 weeks, cutting volume progressively by 41-60% while keeping intensity and frequency.
- Our version:
  - 5K/10K: 7-10 days.
  - Half: 10-14 days.
  - Marathon: 3 weeks (Higdon), about 80%, 60% and 40% of peak. *Those splits are our heuristic.*

## 6. Session templates

All of these are in the JSON with structured steps:

- **Walk/run:** C25K weeks 1-9 (exact NHS intervals).
- **Easy:** easy run, easy + strides, recovery run.
- **Long:** long run, long run with an M-pace finish.
- **Threshold:**
  - steady tempo (15-20 min at T, Daniels);
  - Higdon tempo (30-40 min building to 10K effort);
  - cruise intervals (3-6 × 1-1.6 km at T, 5:1 work:rest).
- **Faster work:**
  - VO2max intervals: 4-6 × 800-1200 m at I, each 3-5 min, with a jog slightly shorter than the rep.
  - Higdon 400s: 5 building to 8, equal-distance recovery.
  - R 200s: full recovery, 1:2-3 work:rest.
  - Fartlek. *Unverified structure.*
  - 10-20-30 (Gunnarsson & Bangsbo): 1 km warm-up, then 3-4 blocks of 5 × [30 s easy, 20 s moderate, 10 s near-max], 2 min between blocks.
  - Goal race-pace reps. *Heuristic.*
- **Tests and other days:** time trial (retest), race, cross-training, rest.

## 7. Week structure

**Phases:**

| Phase | Share of plan | Focus |
|---|---|---|
| Base | about 35% | easy + strides/fartlek |
| Build | about 35% | threshold + short reps |
| Peak | about 20% | VO2max intervals + goal pace |
| Taper | per goal distance | less volume, same frequency |

Base is always at least 2 weeks. *The phase split is our heuristic.*

**Layouts by days per week:**

- **3 days:** Tue, Thu, Sat (never consecutive for beginners, following the C25K and Higdon Novice pattern). One quality session plus easy plus long.
- **4 days:** Tue Q1, Wed easy, Fri Q2 or easy, Sun long. Beginners do only one quality session.
- **5 days:** Higdon Intermediate pattern. Mon and Fri rest, Wed workout, Tue and Thu easy, Sat fast or easy, Sun long.
- **6 days:** intermediate and advanced only. Tue Q1, Wed recovery, Fri Q2, Sun long, everything else easy.

**Rules:**

- No back-to-back hard days.
- For beginners, the long run counts as a hard day.
- In a cutback week, drop Q2.
- In a retest week, the time trial replaces Q1.

## 8. Safety

- Health screen first.
- New runners walk/run and can repeat weeks.
- Novices get about 2.3× more injuries per 1000 h than recreational runners (17.8 vs 7.7, Videbaek 2015 meta-analysis). That's why beginners get extra rest days.
- Follow the volume and progression caps above.
- No structured intervals until the runner can run 30 min continuously. *Heuristic.*
- Stop if pain changes how you run. *General guidance, unverified.*
- After 2 or more weeks off, restart at 50-70% of previous volume and retest. *Unverified.*
- In heat or at altitude, run by effort.

## 9. Open questions

- The R-pace column and the slow-runner rows (VDOT under 30) are formula extrapolations. Validate them against the official V.O2 calculator before showing exact R paces.
- The improvement rates are our heuristic, fitted around Daniels' rule and two 10-20-30 trials. Novice rates especially need checking against real Somax user data once retests come in.
- Age grading needs the WMA 2023 factor tables (not fetched).
- The Higdon Novice 10K and Pfitzinger 5K specifics weren't fetched.

## Sources

- **Get running with Couch to 5K / Couch to 5K running plan** — NHS (UK). <https://www.nhs.uk/better-health/get-active/get-running-with-couch-to-5k/couch-to-5k-running-plan/> — used for: 9-week walk/run progression, week-by-week intervals, 3 runs/week with rest days, 5 min warm-up/cool-down walks
- **Novice 5K** — Hal Higdon. <https://www.halhigdon.com/training-programs/5k-training/novice-5k/> — used for: 8 weeks, 3 runs from 1.5 to 3 mi, walk days, conversational pace, prerequisites
- **Intermediate 5K** — Hal Higdon. <https://www.halhigdon.com/training-programs/5k-training/intermediate-5k/> — used for: 5-day layout, 400 m repeats 5->8, 30-40 min tempo, long run 5->7 mi, week-4 test 5K, prerequisites 15-20 mi/wk
- **Novice 1 Half Marathon** — Hal Higdon. <https://www.halhigdon.com/training-programs/half-marathon-training/novice-1-half-marathon/> — used for: 12 weeks, 4 run days, long run 4->10 mi, ~20-23 mi peak, 65-75% HRmax easy, 1-week taper
- **Novice 1 Marathon** — Hal Higdon. <https://www.halhigdon.com/training-programs/marathon-training/novice-1-marathon/> — used for: 18 weeks, long run 6->20 mi, ~40 mi peak, step-back every 3rd week, 3-week taper
- **Training for an 8K or 10K race (Faster Road Racing excerpt)** — Pete Pfitzinger & Philip Latter (Human Kinetics). <https://us.humankinetics.com/blogs/excerpt/training-for-an-8k-or-10k-race> — used for: 12-week schedules, mileage tiers 30-42 / 45-57 / 60-76 mi, entry prerequisites, peak 3 weeks out then taper
- **Jack Daniels (coach)** — Wikipedia. <https://en.wikipedia.org/wiki/Jack_Daniels_(coach)> — used for: VDOT concept, E/M/T/I/R purposes, %HRmax, session caps (T 10%, I 8%, R 5%), 3-5 min intervals
- **Reading Daniels' Running Formula - Chapter 4** — C. D. Baca (book notes). <https://cdbaca.github.io/ssg/reading-daniels-running-formula-chapter-4.html> — used for: %VO2max per zone (E 59-74, I 95-100, R 105-120), E/long run caps, cruise interval 5:1, R recovery 1:2-3
- **Calculating VO2max** — Bill Mill (notes). <https://notes.billmill.org/fitness/calculating_v02_max.html> — used for: Daniels/Gilbert oxygen-cost and %max equations with worked 10K example
- **VDOT pace table search results (Daniels' Running Formula Table 5.2 excerpt for VDOT 51)** — various (search snippet). <https://test.knowt.com/note/c9a27c0b-2f67-49ce-8736-e000492dbdae/Daniels-Running-Formula--Comprehensive> — used for: Calibration point VDOT 51: E 4:52-5:29, M 4:27, T 4:11, I 3:51 per km (from search snippet, page not fetched — treat as partially verified)
- **Ask Dr. Jack Daniels** — V.O2 / Run SMART Project. <https://news.vdoto2.com/2010/03/02/ask-dr-jack-daniels/> — used for: +1 VDOT every 4-6 weeks max without a race
- **Peter Riegel** — Wikipedia. <https://en.wikipedia.org/wiki/Peter_Riegel> — used for: T2 = T1*(D2/D1)^1.06, valid ~3.5-230 min, optimistic for longer distances
- **McMillan Running** — Greg McMillan. <https://www.mcmillanrunning.com/> — used for: Principle: combine physiology with real-world results; heat/altitude adjustments; paces from recent race or goal
- **No effect of a graded training program on the number of running-related injuries in novice runners (Buist et al. 2008, AJSM)** — Buist et al.. <https://research.rug.nl/en/publications/no-effect-of-a-graded-training-program-on-the-number-of-running-r/> — used for: 10% rule RCT: 20.8% vs 20.3% injuries (via search summary of abstract)
- **Excessive progression in weekly running distance and risk of running-related injuries (Nielsen et al. 2014, JOSPT)** — Nielsen et al.. <https://vbn.aau.dk/da/publications/excessive-progression-in-weekly-running-distance-and-risk-of-runn> — used for: 874 novices; >30% increase over 2 weeks linked to more injuries (via search summary of abstract)
- **Incidence of running-related injuries per 1000 h (Videbaek et al. 2015, Sports Med)** — Videbaek et al.. <https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4473093/> — used for: Novice 17.8 vs recreational 7.7 injuries per 1000 h (via search summary)
- **Effects of tapering on performance: a meta-analysis (Bosquet et al. 2007, MSSE)** — Bosquet et al.. <https://pubmed.ncbi.nlm.nih.gov/17762369/> — used for: 2-week taper, 41-60% volume cut, maintain intensity and frequency (via search summary)
- **Polarized training has greater impact on key endurance variables... (Stöggl & Sperlich) / Seiler reviews** — Seiler; Stöggl & Sperlich. <https://pmc.ncbi.nlm.nih.gov/articles/PMC4621419/> — used for: ~80% low intensity in elite endurance athletes; polarized > threshold-heavy (via search summary)
- **80/20 Endurance articles** — Matt Fitzgerald. <https://www.8020endurance.com/i-would-pack-the-ventilatory-threshold-heres-why/> — used for: ~80% below VT1; talk test as VT1 marker (via search summary)
- **The 10-20-30 training concept improves performance... (Gunnarsson & Bangsbo 2012)** — Gunnarsson & Bangsbo. <https://pubmed.ncbi.nlm.nih.gov/22556401/> — used for: 7 weeks, 5 km -48 s, VO2max +4%; session structure (via search summary)
- **US 5K stats page** — RunRepeat. <https://runrepeat.com/the-us-5k-stats-page> — used for: 5K percentiles by sex (2018 US races) for level placement
- **Age Grading** — USATF Masters. <https://usatfmasters.org/age-grading/> — used for: Age-grade class bands 60/70/80/90%, WMA 2023 tables
