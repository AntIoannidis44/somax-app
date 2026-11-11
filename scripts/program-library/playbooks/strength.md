# Strength & Physique Playbook (Somax plan engine)

Companion to `strength.json`, which is the machine-readable version. This file explains the reasoning. Confidence tags are the same in both files:
**sourced** (from a page we fetched), **secondary** (a third-party write-up of a named program), **derived** (we computed it from sourced numbers), **unverified** (recalled or common practice, not confirmed on a fetched page), **somaxHeuristic** (our own engineering choice).

Researched 2026-11-12.

---

## 1. Benchmarks and 1RM estimation

- **Required:** bodyweight, sex (only used to pick the standards table), and at least one lift or calisthenics max. Training age in months is optional but strongly recommended.
- **Lifts:** squat, bench, deadlift and OHP. Users log a 3-5 rep max at good bar speed, not a true single (beginners especially). 5/3/1 also sets its training max from a crisp 3-5 rep set.
- **Estimation:** e1RM is the mean of Epley `w(1+r/30)` and Brzycki `w·36/(37−r)` for 2-10 reps. The two match at 10 reps and diverge sharply above it, and both can be off by 10% or more (sourced, Wikipedia). For 11-12 reps we use Brzycki only and flag low confidence. Sets above 12 reps are rejected.
- **RPE/RIR:** a set of `r` reps at `x` RIR is treated as an `r+x` rep max. This follows the Tuchscherer/RTS chart, where 3 @ RPE 10 sits at the same ~92% as 1 @ RPE 8 (secondary). Lifters misjudge RIR by about 2-5 reps on hard or high-rep sets (sourced, Barbell Medicine), so the engine prefers sets of 8 reps or fewer.
- **Calisthenics:** max strict pull-ups, chin-ups, push-ups and dips. If pull-ups = 0, we also ask for negative time and whether the user can dead-hang for 30 s.

## 2. Level placement

The source is the **Symmetric Strength** standards page. It gives absolute 1RMs for a 180 lb man and a 140 lb woman across 8 bands (untrained to world class). The site says these are *model bands built from a Wilks-based chain, not population percentiles*. We divided them by reference bodyweight to get ratios (derived):

| Male (×BW) | Untrained | Novice | **Intermediate** | Proficient | **Advanced** | Elite |
|---|---|---|---|---|---|---|
| Squat | 0.75 | 1.14 | **1.50** | 1.89 | **2.19** | 2.83 |
| Bench | 0.56 | 0.83 | **1.11** | 1.42 | **1.64** | 2.11 |
| Deadlift | 0.86 | 1.31 | **1.72** | 2.17 | **2.53** | 3.25 |
| OHP | 0.36 | 0.56 | **0.72** | 0.92 | **1.06** | 1.36 |

| Female (×BW) | Untrained | Novice | **Intermediate** | Proficient | **Advanced** | Elite |
|---|---|---|---|---|---|---|
| Squat | 0.61 | 0.93 | **1.25** | 1.54 | **1.79** | 2.32 |
| Bench | 0.43 | 0.64 | **0.82** | 1.04 | **1.21** | 1.57 |
| Deadlift | 0.75 | 1.11 | **1.46** | 1.82 | **2.14** | 2.75 |
| OHP | 0.29 | 0.39 | **0.54** | 0.68 | **0.79** | 1.04 |

- **Somax mapping (heuristic):** below Intermediate is *beginner*, Intermediate to Proficient is *intermediate*, and Advanced or higher is *advanced*. Level is set per lift, and the overall level is the median.
- **Bodyweight correction (heuristic, exponent unverified):** threshold × (BW/refBW)^(−1/3), because strength-to-bodyweight ratios fall as lifters get heavier.
- **Training-age override:** this follows Barbell Medicine's argument that progression speed reflects distance from your ceiling, not a label. Under 6 months of training stays on beginner progression whatever the ratios say. 24+ months without recent linear progression uses intermediate progression.
- **Calisthenics cut-offs** (0 / 1-4 / 5-11 / 12+ pull-ups) are our own (somaxHeuristic). We found no reputable standard. The r/bodyweightfitness wiki treats 3×8 pull-ups as the point to start weighted work, but we only saw that in search snippets because Reddit blocked fetching.

## 3. Progression model

**Beginner: linear, session to session**
- **Increments (StrongLifts, BBR; sourced):** squat +2.5 kg. Deadlift +5 kg while it is easy, then +2.5 kg. Bench +2.5 kg for men and +1.25 kg for women. OHP and row +1.25-2.5 kg.
- **BBR AMRAP bump (sourced):** if the AMRAP set goes past 10 reps, the next jump is doubled.
- **When jumps get hard:** add weight every 2-3 sessions instead (StrongLifts).
- **Failure (sourced):**
  - A miss, including a rep with broken form, means repeat the weight (StrongLifts).
  - BBR: fewer than 15 total reps on 3×5+ means −10%.
  - GZCLP fallback: T1 5×3+ → 6×2+ → 10×1+, then retest the 5RM and restart at 85%.
  - Somax default: 2 failed sessions trigger −10%. A 3rd reset within 8 weeks moves that lift to intermediate progression.
- **Starting weight:** ramp up from the empty bar and start at the last clean set, conservatively (BBR).
- **Expected gain (sourced, Barbell Medicine):** untrained lifters gain **15-30% on 1RM in 12 weeks**. The first measurable gain shows up after about 4.3 weeks on average. Engine rates are 1.25 / 1.875 / 2.5% of the starting 1RM per week (derived).
- **Phase length:** BBR says to run linear progression for at most about 3 months, then move to GZCLP or 5/3/1 for Beginners. Following the SBS **linear-log** model (each equal gain takes about twice as long as the last), the engine halves the rate for weeks 13-24.

**Intermediate: weekly or monthly**
- **Texas Method (secondary):**
  - Monday: 5×5 at ~90% of 5RM, plus deadlift 1×5.
  - Wednesday: ~80% of Monday's load.
  - Friday: a new 5RM.
  - Squat and deadlift go up about +2.5 kg/week, bench about +2.5 kg every 2 weeks.
- **5/3/1 (sourced):**
  - Training max (TM) = 90% of e1RM.
  - 3-week wave: 65/75/85, then 70/80/90, then 75/85/95% of TM.
  - TM goes up +2.5 kg (upper) or +5 kg (lower) per cycle.
  - If reps are missed consistently, cut the TM by 3 increments.
- **nSuns (sourced):** the TM goes up each week based on reps in the AMRAP set: 0-1 reps +0, 2-3 reps +2.5, 4-5 reps +2.5-5, over 5 reps +5-7.5 kg.
- **Expected gain (sourced):**
  - Powerlifters average +0.58%/month (men) and +0.92%/month (women), with very wide spread (SBS).
  - Median progress drops from 0.78%/month to 0.26%/month between early and later meets.
  - Latella 2020 found about +55 kg/yr (men) and +44 kg/yr (women) on total.
  - Engine rates are 0.5 / 1.25 / 2.5% per month (derived).
- **Stall (sourced, Barbell Medicine):**
  - A stall means no improvement for 3-4 weeks despite consistent training and recovery. Compare against the best of the last 6-8 weeks.
  - Flat but fresh: add a little volume. Grinding, sore and declining: reduce load. A few flat sessions are just noise.
- **Deload:** 3 loading weeks plus 1 deload week (heuristic). This fits RP's model of a 4-5 week accumulation followed by a drop to about 6 sets per muscle.

**Advanced: block or monthly.** Well-trained lifters gain about **2-6% per year**, and day-to-day noise is about 3-5% (sourced). Programming uses RPE top sets with back-off sets and a deload every 4-6 weeks (heuristic).

**Layoffs:** strength is largely kept for about 28 days (sourced). Resume at 95%, 90% or 85% for gaps of up to 2 weeks, 2-4 weeks, and over 4 weeks (heuristic).

## 4. Plan length

The engine simulates week by week at the lifter's phase rate:
- beginner weeks 1-12 at the full rate
- beginner weeks 13-24 at half rate
- intermediate monthly rate after that, and advanced once the lift crosses the advanced band.

On top of that, it multiplies by **1.15** for missed sessions and reports optimistic, expected and conservative weeks. Lifts trained once a week get a ×0.85 rate.

**Blocks** run 4-12 weeks. A goal longer than 12 weeks is split into milestones of up to 12 weeks, with a re-benchmark and re-projection at each one. Over 52 weeks is labelled a long-term goal. A target above the Elite band triggers a warning.

**Worked example.** A 75 kg man with a 60 kg bench wants 80 kg.
- He is a beginner (0.80×BW vs an adjusted intermediate threshold of about 1.14).
- Expected: 73.5 kg by week 12 and 80 kg around week 24, so **~28 weeks with buffer**. The optimistic case is about 17 weeks. The conservative case runs past a year.
- Milestones: 72.5 kg at week 12, then 77.5-80 kg at week 24.

**Calisthenics (unverified/heuristic):**
- First pull-up: 6-12 weeks. That figure comes from blogs only.
- Rep goals: about +1 rep every 1-2 weeks below 10 reps, and +1 every 2-4 weeks from 10 to 20.
- Re-test every 2 weeks.

## 5. Hypertrophy

- **Counting sets:** use fractional sets. The prime mover counts as 1 set and a synergist as 0.5 (SBS).
- **Weekly sets per muscle:**
  - Maintenance: about 6 (RP).
  - Beginner: 8-12, around SBS's "~10 is a good start" (derived).
  - Intermediate: 12-20 (RP example, 2021 meta-analysis).
  - Advanced: 15-25 (SBS).
- **Per session:** about 11 fractional sets per muscle at most (SBS PUOS). Train each muscle at least twice a week.
- **Loads and reps:** hypertrophy works across a wide range of loads, and heavy loads are still best for 1RM strength (Schoenfeld 2021). RP counts working sets at 30-85% of 1RM, 5-30 reps and 0-4 RIR. ACSM recommends 8-12RM for novices.
  - Defaults: compounds 4-12 reps at 1-3 RIR, isolations 10-20 reps at 0-2 RIR.
- **Effort:** sets closer to failure grow more muscle (Robinson, via SBS), while strength gains were similar from 0 to 10 RIR.
- **Progression:**
  - Volume: +1-3 sets a week based on soreness and performance feedback (RP).
  - Load: double progression, adding about 2.5 kg once the top of the rep range is reached (PHUL). ACSM puts the increase at +2-10%.
  - Mesocycle: 4-6 weeks of loading, then a deload.

## 6. Splits by days per week

ACSM frequency guidance: novices 2-3 days/week, intermediates 3-4, advanced 4-5.

| Days | Beginner | Intermediate | Build muscle |
|---|---|---|---|
| 2 | Full-body A/B (BBR-style) | 5/3/1 two-day (heuristic) | Full-body hypertrophy A/B |
| 3 | BBR A/B, then GZCLP rotation | 5/3/1 for Beginners or Texas Method | Full body ×3 or PPL ×1 |
| 4 | GZCLP 4-day | 5/3/1 BBB or PHUL | PHUL |
| 5 | Suggest 3 lifting + 2 conditioning days | Upper/Lower + PPL hybrid, nSuns 5-day | ULPPL, PHAT |
| 6 | Metallicadpa PPL ×2 (0-12 months) only if the user insists | PPL ×2, nSuns 6-day | PPL ×2 |

For pull-up or push-up goals, the calisthenics templates are added 2-3 times a week.

## 7. Session templates

The JSON has 35 templates:
- BBR A/B and GZCLP days 1-4 (sourced)
- 5/3/1 Beginners days 1-3, with week percentage schemes (sourced)
- BBB press/deadlift/bench/squat (sourced)
- Texas Mon/Wed/Fri and PHUL ×4 (secondary)
- StrongLifts A/B and PPL push/pull/legs (layouts unverified)
- 2-day full body, hypertrophy full body A/B, pull-up foundation, pull-up reps, push-up reps, and deload (heuristic or derived)

Superset pairs use `group` letters.

## 8. Safety (summary)

- Broken form counts as a missed rep (StrongLifts).
- No true 1RM tests for beginners. Treat every e1RM as ±10%.
- AMRAP sets stop 1-2 reps short of failure, with no grinding (BBR, GZCLP, 5/3/1).
- Start with an empty-bar ramp. Keep load increases within ACSM's 2-10% per step.
- Tendons need 6-8+ weeks to adapt, and novices get injured more often, so don't speed up progression just because the muscles feel fine (Barbell Medicine).
- Self-rated RIR is often wrong, so bias beginners toward more reserve.
- *Unverified common practice:*
  - Use safeties or a spotter.
  - Pain stops progression of that lift until it is cleared.
  - Run a pre-participation health screen.
  - Allow at most 2 heavy deadlift sessions a week.

## 9. Sources

All sources, with URLs and what we took from each, are in `strength.json → sources`. The main ones:
- **r/Fitness wiki:** GZCLP, 5/3/1 for Beginners, BBR, nSuns, routines index
- **Programs:** Jim Wendler (BBB challenge), StrongLifts progress page, Fitness Volt (Texas Method, RPE chart), StrengthLog (PHUL)
- **Volume and progression research:** RP volume landmarks, Stronger by Science (volume, modelling strength gains, predicting strength gains), Latella 2020, Barbell Medicine (novice-intermediate-advanced article)
- **Standards and formulas:** Symmetric Strength standards, Wikipedia 1RM
- **Guidelines and studies:** ACSM 2009, Schoenfeld 2017 and 2021

**Could not fetch:** Starting Strength (403 / connection refused), Reddit (blocked), the ExRx standards (not attempted), RTS's own pages, and the Muscle & Strength PHUL original (403). Nothing specific to Starting Strength is used.
