# Endurance Playbook: Cycling, Swimming, Triathlon, Hybrid (HYROX)

Compiled 2026-11-12. Machine-readable version: `endurance.json` (same folder).

**Labels used in this file**
- Plain facts: read on a fetched source page (listed per sport).
- **[unverified]**: seen only in search snippets or secondary summaries. Check it before treating it as a hard rule.
- **[derived]**: a Somax design choice built on the sourced facts. No source makes this claim. Tune it with real user data.

## Shared rules (all sports)

- **Gap engine [derived]:** `weeks = ceil(gap / expectedWeeklyRate(level)) + taper/test week`, clamped to each sport's min/max. If the result is over the max, split the plan into milestone blocks. Each block ends with a retest and a recalculated target.
- **Taper:** Bosquet et al. 2007 meta-analysis found ~2 weeks works best. Cut volume by 41–60%, progressively. Keep intensity and frequency. **[unverified]**: PubMed blocked the fetch, but the numbers matched across several secondary results.
- **Intensity distribution:** Seiler's polarized split (~80% easy, ~20% hard) describes how elite athletes train. It isn't a prescription. Stöggl & Sperlich 2014 ran a 9-week trial on well-trained athletes. The polarized group (68/6/26) gained 11.7% VO2peak. The threshold-only and high-volume groups showed no significant change. **Somax default [derived]:** most minutes easy, plus 1–2 hard sessions a week.
- **Recovery weeks:** Stöggl & Sperlich used blocks of 2 loading weeks + 1 recovery week. The FitnessVolt HYROX plan deloads in week 4 at ~60% volume. **[derived]:** every 3rd week (beginners or age 40+) or 4th week, drop to 60–70% volume.
- **Ramp limits:** In novice runners, Buist 2008 found the 10%/week rule didn't reduce injuries **[unverified]**. CTS instead caps the longest single session at about +10% per month and judges weekly volume by recovery: soreness that clears within 24–48 h is fine. **[derived]:** use per-sport long-session caps. If soreness lasts more than 48 h, repeat the week.

---

## 1. Cycling

**Benchmarks**
- **FTP, 20-min test:** FTP = 0.95 × 20-min average power.
- **FTP, ramp test:** start at 100 W, add 20 W each minute until you can't continue. FTP = 0.75 × the last stage's power.
- **FTP, 2 × 8-min test:** FTP = 0.90 × the better of the two efforts.
- **Body weight**, for W/kg.
- **Longest comfortable ride**, in km or minutes.
- Caveat: the 0.95 factor fits only ~50–60% of riders. Observed range is 86–96% (TrainingPeaks). Retest no sooner than ~6 weeks, ideally after a recovery week (CTS).

**Level placement (Allen & Coggan FTP ratings, via Garmin)**

| Level (W/kg) | Untrained | Fair | Good | Excellent | Superior |
|---|---|---|---|---|---|
| Men | <2.23 | 2.23–2.78 | 2.79–3.92 | 3.93–5.04 | ≥5.05 |
| Women | <1.90 | 1.90–2.35 | 2.36–3.32 | 3.33–4.29 | ≥4.30 |

- **Mapping [derived]:** untrained → beginner, fair → novice, good → intermediate, excellent/superior → advanced.
- **Without power [derived]:** place by longest ride. Under 25 km is beginner, 25–60 km novice, 60–100 km intermediate, over 100 km advanced.

**Zones.** Watts = FTP × %.

| Zone | Coggan % FTP | Use |
|---|---|---|
| Z1 Recovery | <55 | spins |
| Z2 Endurance | 56–75 | long rides |
| Z3 Tempo | 76–90 | steady |
| Sweet spot | 88–94 (TrainerRoad/TrainingPeaks) | time-efficient FTP work |
| Z4 Threshold | 91–105 | 10–30 min repeats |
| Z5 VO2max | 106–120 | 3–8 min reps, ≤30–40 min total |
| Z6 Anaerobic | >121 | 30 s – 3 min |

- **No power meter:** use the Coggan HR bands (% of threshold HR) or the Cycling UK talk test. Easy means you can hold a conversation. Steady means you can talk in short sentences.

**Improvement and plan length**
- **Observed FTP gains (TrainerRoad):** riders following plans gained ~5% in 20-min power after 2 months, ~9% after 4 months and ~10% by summer. Riders doing 3 hard days a week improved more than those doing 2.
- **Distance progression (Cycling UK 100 km plan):** the long ride grows from 15–25 km to 90–100 km over 9 weeks, about +10 km a week. Week 10 is a taper.
- **Expected FTP rate [derived]:**
  - Beginner: 1.0%/wk for the first 8 weeks, then 0.5%.
  - Novice: 0.7%/wk.
  - Intermediate: 0.5%/wk.
  - Advanced: 0.25%/wk.
  - The FTP plan runs 6–16 weeks. Cap one block's gain at 10% (15% for beginners) and split anything larger into blocks.
- **Distance goals [derived]:** add +10 km/week to the long ride (+15 km/week once it's past 60 km), and never more than +30% in a week. Distance plans run 4–16 weeks. Peak at 90–100% of the target 1–2 weeks out.

**Volume and week structure**
- British Cycling's beginner plan: 25 weeks, 3–7.5 h/week, 3 rides (1 midweek, 2 at the weekend).
- Cycling UK's plan: 3–4 rides and 2–3 rest days a week. Harder efforts start in week 5, progressing 3×5 → 4×5 → 2×10 min.
- **Weekly pattern [derived]:** Tue quality, Thu easy, weekend long ride. Keep hard days apart.

**Session templates**
- Endurance ride
- Long ride
- Steady-middle ride (Cycling UK)
- Beginner harder efforts
- Sweet spot 3×12 with 3 min recovery (TrainerRoad)
- Threshold 4×9 with 4 min recovery (TrainerRoad)
- VO2: 3 sets × 5 reps × 1:00–1:20 at 120–125% FTP (TrainerRoad)
- 4×4 min at 90–95% HRpeak with 3 min recovery (Stöggl)
- Recovery spin
- FTP test

**Safety**
- Check with a doctor if you've been inactive.
- Stop when ill. When you come back, resume where you left off rather than skipping ahead (Cycling UK).
- Warm up and cool down.
- **[derived]:** no VO2 or anaerobic work for untrained riders in their first 4 weeks.

---

## 2. Swimming

**Benchmarks**
- **CSS test (Swim Smooth):**
  1. Warm up.
  2. Swim 400 m all-out, evenly paced.
  3. Rest 5–10 min with easy swimming.
  4. Swim 200 m all-out.
  5. Calculate CSS = (T400 − T200) / 2 per 100 m. The 200 must be faster per 100 m than the 400, or the result is invalid. Test in your usual pool length.
- Other benchmarks: 400 m time, 100 m time and longest continuous swim.

**Level placement [derived]**
- Longest continuous swim under 100 m: refer to adult lessons (Swim England Adult Swimming Framework). No plan and no CSS test.
- 100–399 m: beginner. Use the 100 m time and RPE, no CSS test.
- 400–999 m: novice. The CSS test is now valid.
- 1000 m or more: intermediate.
- For context, the Triathlete beginner plan requires 100 yd nonstop and gets swimmers to 1000 nonstop by week 6.

**Zones.** Offsets are from CSS pace per 100 m.
- Easy/technique: CSS +8 to +10 s
- Steady: CSS +6 s, e.g. 10×400 with 30 s rest
- Threshold: CSS pace, e.g. Goldilocks sets with ~20 s rest
- Above threshold: CSS −3 s **[unverified]**
- No CSS yet: use the Triathlete RPE zones 1–5.
- Pace per length = CSS × pool length / 100.

**Improvement and plan length**
- **Observed (Swim Smooth):** beginners often gain 5–10 s/100 m. For well-trained swimmers, 1–2 s is significant. A gain of 3–4 s/100 m is a good target.
- **Retesting:** every 4–6 weeks. Swim Smooth's newer blog advises retesting less often and nudging the pace by under 1 s/100 m instead.
- **Pace goals [derived]:** expected rate is 0.75 s/100 m per week for beginner/novice, 0.4 for intermediate, 0.15 for advanced. Plans run 4–12 weeks. For 400 m goals, use 400 m pace rather than CSS. Example: 400 m in under 8:00 means 2:00/100 m.
- **Distance goals [derived]:**
  - Under 400 m: +50% a week.
  - From 400 m to 1000 m: +100–150 m a week.
  - Past 1000 m: +200 m a week.
  - Build distance with short-rest reps that add up to the target, as in Swim Serpentine's 1000 m = 10×100, then try it continuous. Plans run 3–12 weeks.
- **Combined goals:** if the goal has a pace but you can't yet swim the distance continuously, run the distance plan first.

**Volume and week structure**
- Every session follows warm-up → main set → contrast set (kick/drills) → warm-down (Swim Serpentine).
- Swim Smooth's 3-session week: technique, open-water skills, CSS.
- **Start volumes [derived]:** beginners 2 sessions of ~300–600 m. Novices 2–3 sessions of 1000–1800 m.
- **Progression:** add reps or lengthen the last rep (Goldilocks Baby → Mama → Papa) before trying to swim faster.

**Session templates**
- CSS test
- Beginner short reps (16×25 with 30 s rest → 10×50 → 8×75), from Swim England session 1 and the Triathlete plan
- Distance builder
- Goldilocks: 2×100 + 200/300/400 at CSS with 20 s rest
- Steady 400s
- Big step pyramid (1150 m)
- 5×400 broken
- Speed 50s
- Technique and drills: single arm, catch-up, kick on side, 3-point touch, clenched fist

**Safety**
- RLSS open-water hazards: cold water shock, currents, unknown depth, hidden objects, water quality.
- **[derived]:** open-water sessions are optional only and must be at organised or lifeguarded venues.
- Always warm up before CSS tests.

---

## 3. Triathlon

**Distances**
- Super sprint: 400 m / 10 km / 2.5 km
- Sprint: 750 m / 20 km / 5 km
- Both **[unverified]**: they matched across search snippets, but organisers vary them. Use the user's actual event distances.

**Prerequisites and level (Triathlete)**
- Prerequisites: healthy, 100 yd nonstop swim, 20 min nonstop bike, 10 min continuous run.
- **[derived]:** if any discipline is below prerequisite, run a 4–6 week foundation block first. Plans run 8 weeks for active people and 12 for newer athletes **[unverified, ACTIVE.com]**. Overall clamp is 8–20 weeks.

**Zones**
- Swim: CSS offsets.
- Bike: % FTP.
- Run: the Triathlete RPE zones. Z4 is roughly your 15-min all-out swim pace or 30-min all-out bike/run pace. Z5 is all-out for 1–5 min.

**Plan model**
- Triathlete's 8-week plan uses 5 days a week, 1 session a day, with rest on Mon and Fri.
  - Weeks 1–3: 2 swims, plus alternating (2 bikes + 1 run) and (1 bike + 2 runs).
  - Weeks 4–8: 2 of each sport, with a Sunday brick.
  - Peaks: 1000 m nonstop swim, 80 min bike, 40 min run.
  - Week 8 is a light race week.
- **[derived]:** weeks = the maximum of the three per-discipline gap calculations + taper. Add a recovery week every 4th week for plans longer than 8 weeks.

**Session templates**
- Brick: bike 40–60 min, transition in under 3 min, run 15–20 min Z2
- Run-walk intervals, 5–6 × (2 min walk + 3 min run)
- Bike endurance with tempo
- Bike race-pace intervals
- Run with race-pace finish
- Race-distance continuous swim

---

## 4. Hybrid (HYROX)

**Format (hyrox.com, fetched)**

The race is 8 × (1 km run + station). Roxzone transitions count toward your time, and the average finish is ~90 min.

| # | Station | Work | Open men | Open women |
|---|---|---|---|---|
| 1 | SkiErg | 1000 m | | |
| 2 | Sled push | 2×25 m | 152 kg | 102 kg |
| 3 | Sled pull | 2×25 m | 103 kg | 78 kg |
| 4 | Burpee broad jump | 80 m | | |
| 5 | Row | 1000 m | | |
| 6 | Farmers carry | 200 m | 2×24 kg | 2×16 kg |
| 7 | Sandbag lunges | 100 m | 20 kg | 10 kg |
| 8 | Wall balls | 100 reps | 6 kg | 4 kg |

Sled weights include the sled. Two sources conflict with this table:
- FitnessVolt lists wall balls at 9/6 kg, which is likely Pro or an older standard.
- hyrox.com's preparation page mentions a 125 kg sled.

Confirm weights per season and division.

**Benchmarks**
- 5 km run. The 8-week plan's prerequisite is running 5 km comfortably, ideally under 30 min (FitnessVolt).
- 1 km run
- 1000 m SkiErg and 1000 m row
- Half simulation **[derived]**
- Max unbroken wall balls

**Level placement [derived]**
- Can't run 5 km: foundation.
- 5 km in 30 min or more, or new to the gym: beginner.
- 5 km under 30 min and can do every station at Open weight: novice.
- Has finished a HYROX or can complete a full simulation: intermediate.

**Zones and pacing**
- Run intervals (FitnessVolt): 1 km at race pace, ~80% effort and 85–90% HRmax, with 60–90 s rest.
- Pacing (hyrox.com): don't start fast, treat it like a half marathon, and control your HR.
- Station pacing (Red Bull): pause briefly on the sled push. Don't over-pull the row.
- **Race pace [derived]:** (goal time − station estimate − Roxzone) / 8.

**Plan model (FitnessVolt, third-party)**
- 8 weeks, 3 days a week, ~3–3.5 h a week.
- **Day 1:** run + erg intervals, building 3 → 6 × 1 km.
- **Day 2:** station strength, done as quality sets with full rest.
- **Day 3:** simulation. Build from 2 km + 2 stations to the full 8 + 8 by week 6.
- Week 4 is a deload at ~60%. Week 7 is the peak, at 6 + 6 race effort. Week 8 is the taper.
- **[derived]:** foundation users get 4–8 extra weeks of run-building first. Advanced users get 10–12 weeks. Overall clamp is 6–16 weeks.
- No published HYROX improvement-rate data was found **[unverified]**.

**Session templates**
- Run + erg intervals
- Station strength (FitnessVolt week 5–7 sample): sled push 4×50 m, farmers carry 3×100 m, lunges 3×30 m, wall balls 3×30, burpee broad jumps 2×20 m
- Race simulation
- Compromised running **[derived]**, from hyrox.com's advice to practise running on fatigued legs
- Easy run
- Station technique and standards

**Safety**
- Learn the official movement standards (hyrox.com).
- Rest, eat and hydrate through training (hyrox.com).
- A gym sled won't feel the same as the race sled (Red Bull).
- **[derived]:** scale station loads to 50–70% early and build up to race weight by week 5.

---

## Sources

Each sport's `sources` array in the JSON lists the URLs. The main ones were:
- TrainingPeaks Coggan levels
- TrainerRoad zones and blog data
- CTS FTP tests
- TrainingPeaks FTP physiology
- Garmin/Allen-Coggan FTP ratings
- Cycling UK 100 km plan
- British Cycling beginner plan (via Marie Curie)
- Stöggl & Sperlich 2014 (Frontiers)
- Swim Smooth: CSS for beginners, training zones, tweaking
- MyProCoach CSS
- London Marathon Events Swim Serpentine pool plan
- Swim England fitness plan (session 1)
- Triathlete 8-week sprint plan
- RLSS open-water safety
- hyrox.com race page and preparation page
- FitnessVolt 3-day plan
- Red Bull stations guide

## Open questions

1. A strict 80/20 split is not proven for amateurs. Should Somax default to sweet-spot (time-efficient) or polarized for users training ≤5 h/week?
2. Swim Smooth's own pages on the CSS −3 s zone and the Red Mist set returned 404. If an exact table is wanted, it needs a manual check or the paid GURU.
3. None of the expected weekly improvement rates are sourced; they're all **[derived]**. Calibrate them against Somax users' logged retests.
4. HYROX weights change by season and division. Should the app ask for the user's division and season, or store an editable table?
5. Running zones for triathlon and HYROX should come from the running playbook, if one exists, to keep them consistent.
