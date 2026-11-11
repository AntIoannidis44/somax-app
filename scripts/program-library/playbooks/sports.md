# Sport performance playbook (football, basketball, tennis/padel, boxing, golf)

Machine-readable version: `sports.json` (same folder). This file explains the reasoning and gives a quick reference. Researched 2026-11-12.

## How to read the labels

- **Verified**: the number or structure was read on a fetched page (listed under Sources).
- **UNVERIFIED**: seen only in a search-result summary or secondary write-up, or it's our own coaching convention. It's safe to ship as a default, but it needs checking before we present it to users as "evidence".
- **DERIVED**: our own arithmetic on verified numbers (for example, weekly improvement rates).

## Shared engine rules (all sports)

### Plyometric volume per session (NSCA, via CSCS ch.18)

| Level | Foot contacts per session |
|---|---|
| Beginner | 80-100 |
| Intermediate | 100-120 |
| Advanced | 120-140 |

- When intensity goes up, volume comes down.
- Don't train the same body area on consecutive days.
- Leave 48-72 h between plyo sessions, with 2-4 sessions per week at most.
- Adolescents need 2-3 days of recovery. Masters need 3-4 days, with fewer, lower-intensity drills.
- Readiness checks:
  - squat about 1.5x bodyweight (technique matters more);
  - 30 s single-leg stand;
  - 30 s single-leg half squat.
- Athletes over 100 kg: no depth jumps above about 45 cm.

### Sprint sessions (Haugen et al. 2019, Table 2)

| Method | Distance | Intensity | Rest | Session volume | Next hard session |
|---|---|---|---|---|---|
| Acceleration | 10-50 m | >98% | 2-7 min | 100-300 m | 48 h |
| Max velocity (flying) | 10-30 m | >98% | 4-15 min | 50-150 m | 48-72 h |
| Speed endurance | 60-80 m | 90-95% | 2-4 min (8-15 between series) | 600-2000 m | 48-72 h |
| Resisted | 10-30 m | 80-95% | 3-6 min | 50-200 m | 48 h |
| Tempo | 100-300 m | 60-70% | 1-3 min | 1000-2000 m | 24 h |

- Sled loads are graded by how much they slow the athlete: light under 10%, moderate 10-15%, heavy 15-30%, very heavy over 30%.
- Speed work is either 95% or more, or under 70%. Avoid the 70-95% "grey zone".
- Weeks follow a 2:1 or 3:1 pattern (two or three loading weeks, then one easy week).
- A taper (strength/power sports) lasts 2-3 weeks and cuts volume by 40-60%.

### Periodization (NSCA, via CSCS ch.21)

| Phase | Loading |
|---|---|
| Off-season, hypertrophy | 50-75% 1RM, 3-6 sets x 8-20 reps |
| Off-season, basic strength | 80-95% 1RM, 2-6 sets x 2-6 reps |
| Pre-season, strength/power | 30-95% 1RM, 2-5 sets x 2-5 reps |
| In-season, maintenance | 85-93% 1RM, 2-5 sets x 3-6 reps |
| Postseason, active rest | Low volume and intensity, under 4 weeks |

- Training blocks (mesocycles) last 2-6 weeks, most often 4.
- One strength session a week in-season kept strength and 40 m sprint gains for 12 weeks in pro footballers. One session every second week lost them (Rønnestad 2011).

### Plan length (DERIVED)

- `gapPct = |target - current| / current x 100`
- `weeks = ceil(gapPct / weeklyRate[level][benchmark])`
- Clamp the result to 4-16 weeks.
- Round up to 4-week blocks, with a deload after 2-3 loading weeks.
- Re-test at the end of each block.
- In-season goals are capped at maintenance or small gains.
- If the gap would need more than 16 weeks, set a milestone target and re-plan after the re-test.

Weekly rates (% of baseline per week, DERIVED):

| Benchmark | Beginner | Intermediate | Advanced | Basis |
|---|---|---|---|---|
| CMJ / vertical | 1.0 | 0.6 | 0.3 | Markovic 2007: plyo gives CMJ +8.7% over typical 6-10 wk programs |
| Sprint time | 0.4 | 0.2 | 0.1 | UNVERIFIED. Haugen: elite sprinters improve only about 0.1-0.2%/yr; test noise is about 1% |
| Yo-Yo IR1 distance | 4 | 3 | 1.5 | UNVERIFIED. Bangsbo: elite players typically gain 20-40% over pre-season |
| Beep test | 0.3-0.5 levels | 0.2 levels | 0.1 levels | UNVERIFIED |
| Golf clubhead speed (CHS) | 0.5 | 0.35 | 0.2 | UNVERIFIED. Uthoff 2021: combined training +4.1% CHS in about 8 wk |
| Boxing rounds | +1 round / 1.5 wk | +1 round / 2.5 wk | +1 round / 3.5 wk | UNVERIFIED app heuristic |

The engine should treat changes smaller than about 1% on sprint times or about 1 cm on CMJ as noise.

## Sport summaries

- **Football.**
  - **Benchmarks:** Yo-Yo IR1, beep test, 30 m sprint, CMJ, 6x30 m repeated sprints.
  - **Level placement:** Yo-Yo bands. Men: average 1040-1480 m, elite over 2400 m. Women: average 680-960 m, elite over 1600 m. Reference values: male international about 2420 m, male elite about 2190 m.
  - **FIFA 11+ (fetched in full from Soligard 2008):**
    - The full routine is the warm-up for every session; use only the running parts (1 and 3) before matches.
    - In young female players it cut injuries: all injuries RR 0.68, overuse RR 0.47, severe RR 0.55.
    - Higher compliance gave lower risk.
  - **Nordic programs:** cut hamstring injury by about 51% (RR 0.49).
  - **Week structure:** built around match day (MD) with hard rules: no plyo or max sprint on MD-1 or MD+1; at least 48 h between sprint days; at least one strength session per week.
- **Basketball.**
  - **Game demands:** about 4.4 km, about 45 jumps, 43-145 accelerations, average heart rate 150-175 bpm (Petway 2020).
  - **Season structure (NSCA basketball example):**
    - pre-season: lifting 3x/week, with plyo and anaerobic work as top priorities;
    - in-season: about 30 min lifting 1-3x/week, alternated with plyo.
  - **Jump budget:** games count toward the plyo budget (DERIVED).
- **Tennis / padel.**
  - **Tennis demands (Kovacs 2006):**
    - points average about 8 s, with 20 s between points, 90 s at changeovers and 120 s between sets;
    - the ball is in play 20-30% of the time, and work:rest is 1:2 to 1:5;
    - drills should be 5-20 s at 1:3 to 1:5, with sprints under 20 m;
    - aim for VO2max above 50.
  - **Shoulder:** work on external rotation strength and range of motion, both concentric and eccentric.
  - **Padel:** intermittent with moderate load. Detailed padel numbers are UNVERIFIED.
- **Boxing.**
  - **Demands (Bruzas 2023, amateur 3x3-min bouts):**
    - heart rate above 93% of max in rounds 1-2 and above 97% in round 3;
    - lactate about 15 mmol/L;
    - energy split 73% aerobic, 19% alactic, 8% glycolytic.
  - **Training:** 3-min rounds with 1-min rest, plus alactic sprints, strength/rotational power and roadwork.
  - **Professional fights:** prescriptions for 12-round fights are UNVERIFIED (extrapolated from amateur data).
- **Golf.**
  - **Clubhead speed norms (Trackman):** PGA Tour 115 mph, scratch 110, 10 handicap 95, average golfer 94; LPGA 96, female scratch 90.
  - **TPI screens:** pelvic rotation, torso rotation, seated trunk rotation, pelvic tilt and single-leg balance decide whether a corrective block comes first.
  - **Sequence (TPI case study):** correctives, then strength 3x/week for 8-10 weeks, then speed training.
  - **Overspeed:** evidence for lasting gains from overspeed alone was not found; potentiation warm-ups help acutely (UNVERIFIED).

## Sources (fetched)

- Soligard et al., BMJ 2008, FIFA 11+ RCT: https://pmc.ncbi.nlm.nih.gov/articles/PMC2600961/
- PEDro summary of Al Attar 2017 (Nordic hamstring): https://pedro.org.au/english/systematic-review-found-injury-prevention-programs-include-nordic-hamstring-exercises-decrease-risk-hamstring-injuries-among-soccer-players/
- CSCS ch.18 plyometrics (NSCA summary): https://www.ptpioneer.com/personal-training/certifications/nsca-cscs/cscs-chapter-18/
- CSCS ch.21 periodization (NSCA summary): https://origin.ptpioneer.com/personal-training/certifications/nsca-cscs/cscs-chapter-21/
- Haugen et al. 2019, elite sprint training: https://pmc.ncbi.nlm.nih.gov/articles/PMC6872694/
- Rønnestad et al. 2011, in-season maintenance: https://lida.sport-iat.de/dfb/Record/4023410?lng=en
- Yo-Yo norms (TopEndSports): https://www.topendsports.com/testing/norms/yo-yo.htm
- Yo-Yo protocol (Wikipedia): https://en.wikipedia.org/wiki/Yo-Yo_intermittent_test
- Beep test (TopEndSports): https://www.topendsports.com/testing/tests/20mshuttle.htm
- Markovic 2007, plyo meta-analysis: https://lida.sport-iat.de/ta/Record/4013060
- Haugen et al. 2021, CMJ in national-team athletes: https://lida.sport-iat.de/ta/Record/4068651?lng=en
- Petway et al. 2020, basketball demands: https://pmc.ncbi.nlm.nih.gov/articles/PMC7058381
- Kovacs 2006, tennis physiology: https://pmc.ncbi.nlm.nih.gov/articles/2653871/
- Mellado-Arbelo & Baiget 2022, padel review: https://ojs.srce.hr/index.php/kinesiology/article/view/9871
- Bruzas et al. 2023, boxing 3x3 min: https://lida.sport-iat.de/ta/Record/4082828?lng=en
- Trackman club speed: https://www.trackman.com/blog/golf/what-is-club-speed
- TPI case study: https://www.mytpi.com/articles/health/offseason-golf-performance-program-case-study-it's-never-too-late-to-improve-your-body

Not fetched (UNVERIFIED, search summaries only): van Dyk 2019, Petersen 2011 Nordic protocol, Cuthbert 2020, Ramirez-Campillo/Moran plyo dosing, Bangsbo pre-season Yo-Yo change, Uthoff 2021 golf review, Bliss 2021 golf warm-ups, Ruddock 2016 pro boxing (site blocked us), ITF repeated-sprint guidance, NBA combine norms, padel ball-in-play %.
