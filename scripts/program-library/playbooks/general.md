# Somax Playbook: General Fitness, Fat Loss, HIIT, Pilates, Mobility, Older Adults

Research compiled 2026-11-12 for adaptive goal-linked weekly plans. Machine-readable twin: `general.json` (this file is generated from it).

## Conventions

- Numbers credited to a source were read from a fetched page, a fetched PDF, or a PubMed abstract pulled through the Europe PMC API. Each source's `verification` field says which.
- **unverified** = seen only in search-result summaries (page not fetched or blocked), or common guidance not confirmed on a fetched page.
- **heuristic** = a Somax design choice (thresholds, rates, buffers) with no source behind it. These are the knobs to tune with real user data.
- All prose is paraphrased; no source text is reproduced.

## Cross-cutting rules

- Baseline for everyone: WHO 2020 = 150-300 min moderate or 75-150 min vigorous per week, plus strength on 2+ days, plus less sitting. Age 65+ adds multicomponent balance+strength on 3+ days.
- Talk test: moderate = can talk, not sing (RPE 12-13). Vigorous = a few words only (RPE 14-17).
- Health screen before any plan: PAR-Q+ style questions (use the official form). NHS: see a GP first if inactive for a while or with medical concerns. Universal stop signs: chest pain, dizziness, breathlessness that stops you talking.
- Fat loss = diet-led deficit (~600 kcal/day → ~0.5 kg/wk) + activity building to >250 min/week + 2 strength days. Never plan faster than 1 kg/week or below ~1,200 kcal/day.


---

## fat-loss

Lose body fat with a modest calorie deficit (diet does most of the work) plus progressive activity: build toward >250 min/week of moderate activity and 2 strength days/week. Planning is based on a safe rate of 0.5-1 kg/week, and big goals are split into ~5%-of-bodyweight milestones.

### Benchmarks

| id | label | unit | how to test |
|---|---|---|---|
| `bodyweight_kg` | Body weight | kg | Weigh first thing in the morning after using the toilet, before eating or drinking, minimally clothed, on the same scale on a hard floor. Log 2-3 weigh-ins a week and plan from the 7-day average, not a single reading. (Protocol is a Somax heuristic; the averaging is there because day-to-day water swings hide the trend.) |
| `target_weight_kg` | Target weight | kg | User-entered goal. The app turns it into milestones of ~5% of current bodyweight (see planLengthRule). |
| `waist_cm` | Waist circumference | cm | Tape measure around the bare waist, midway between the bottom of the ribs and the top of the hip bone, after breathing out normally. Repeat every 2-4 weeks. (Method unverified: not confirmed on a fetched page.) Useful because HIIT/MICT trials cut waist and fat mass even when scale weight barely moved (Wewege 2017). |
| `weekly_active_minutes` | Current moderate-or-harder activity | min/week | Self-report the minutes in a typical week of activity where you can talk but not sing (moderate) or can only say a few words (vigorous). Count 1 vigorous minute as 2 moderate minutes (WHO/NHS equivalence 150 mod = 75 vig). |
| `daily_steps` | Average daily steps | steps/day | 7-day average from phone or watch (HealthKit). |
| `resting_hr_bpm` | Resting heart rate | bpm | Sit quietly for a few minutes (ideally on waking), then count the pulse at the thumb side of the wrist or beside the windpipe for a full 60 s, or use a watch reading. Normal adult range is about 60-100 bpm; very fit people can be below 60. |

### levelPlacement

- **method**: Place by current activity volume, then bump down a level if resting HR >100 or the user flags any PAR-Q-style health issue (which also triggers the doctor prompt).
- **levels**:
  - level: beginner; rule: weekly_active_minutes < 150 (below the WHO/NHS minimum) OR no regular strength training; basis: WHO 2020 / NHS adult guidelines
  - level: intermediate; rule: 150-250 min/week and some strength training; basis: WHO 150-300 band; ACSM 2009 says 150-250 gives only modest loss
  - level: advanced; rule: >250 min/week with 2+ strength days; basis: ACSM 2009: >250 min/week is linked to clinically significant loss

### improvementModel

- **safeRate**: 0.5-1 kg (1-2 lb) per week is the rate health professionals typically recommend (British Nutrition Foundation; CDC 1-2 lb/week). Faster loss is less likely to last (CDC).
- **deficit**: A ~600 kcal/day deficit usually gives about 0.5 kg/week (BNF), which works out to roughly 1,400 kcal/day for women and 1,900 kcal/day for men. NHS average needs are 2,000 kcal (women) and 2,500 kcal (men). Individual needs vary with age, size and activity.
- **dynamicsWarning**: Loss slows over time. Hall et al. 2011 (Lancet): for adults with overweight, every 10 kcal/day of permanent intake change eventually moves weight by about 1 lb (~22-24 kcal/day per kg), with about half the change reached in 1 year and ~95% in 3 years. The old 3,500 kcal-per-pound rule overestimates loss, roughly doubling the predicted first-year loss for a large cut. Plans must not promise linear loss.
- **healthMilestones**: A first goal of 5% bodyweight over ~6 months is reasonable (NIDDK). 5% improves blood pressure, cholesterol and blood sugar (CDC). ACSM 2009 notes a 3-5% loss already lowers health risk, and NHLBI encourages 10%.
- **trainingVsDiet**:
  - 150-250 min/week of moderate activity prevents weight gain but gives only modest loss on its own. >250 min/week is associated with clinically significant loss (ACSM 2009 abstract).
  - Kravitz's summary of ACSM 2009: <150 min/week has minimal effect, >150 gives ~2-3 kg, and 225-420 min/week gives ~5-7.5 kg.
  - Exercise adds to diet when the deficit is moderate: with a 500-700 kcal/day deficit, diet plus exercise gives ~20% more loss than diet alone. With severe restriction (700-1,000 kcal/day) the extra benefit disappears (Kravitz summary of ACSM 2009). Somax should therefore pair training with a moderate deficit, not an aggressive one.
  - Resistance training does not boost scale weight loss but may raise fat-free mass and increase fat-mass loss, and it reduces health risk (ACSM 2009).
  - After weight loss, maintenance is better with >250 min/week (ACSM 2009). Those who kept off >10% averaged ~275 min/week (Kravitz summary). NHS: diet changes help lose weight, moving more helps keep it off.
  - HIIT and moderate continuous training cut fat mass and waist by similar amounts. Over ~10 weeks at 3 sessions/week, HIIT took ~40% less time, but changes were modest and often had no scale-weight change. Running worked for fat loss but cycling did not (Wewege 2017).
- **expectedChange**: Scale: plan 0.5 kg/week by default (allow the user to pick 0.25-1.0). Waist: no sourced rate; show as trend only (unverified).

### planLengthRule

- **inputs**:
  - bodyweight_kg (7-day avg)
  - target_weight_kg
  - chosen rate (default 0.5 kg/wk, allowed 0.25-1.0)
- **formula**: gapKg = current - target. If gapKg <= 0 → maintenance plan. milestoneKg = round(0.05 * current, 0.5). Split the gap into milestones of at most milestoneKg (the last one may be smaller). For each milestone: weeks = ceil(milestoneSize / rate * 1.15). The 1.15 is a Somax heuristic buffer for the slowdown Hall 2011 describes. Clamp each block to 4-12 weeks. Insert a 2-week maintenance block (eat at estimated maintenance, keep training) between milestones. That last step is a heuristic for adherence, not from a source.
- **minWeeks**: 4
- **maxWeeksPerBlock**: 12
- **milestoneSplitting**: Each block targets ~5% of bodyweight (health benefit per CDC/NIDDK/ACSM). Example: 90 kg → 80 kg at 0.5 kg/wk: milestones 4.5 + 4.5 + 1 kg → blocks of 11, 11, 4 weeks with 2-week maintenance gaps. Re-estimate the rate from the logged 3-week trend at each block end.
- **neverDo**: Never plan faster than 1 kg/week. Never prescribe under ~1,200 kcal/day. NICE NG246 (search result, unverified) restricts low-energy diets (800-1,200 kcal) and very-low-energy diets (<800 kcal) to specialist services, max 12 weeks, nutritionally complete.

### volumeModel

- **aerobic**: Start at max(current weekly_active_minutes, 60) min/week moderate. Add ~10-15% per week (heuristic: ACSM says progress gradually, without a fixed %) until 150, then continue toward 250-300. The WHO 150-300 moderate band gives substantial benefit, and ACSM 2009 ties >250 to meaningful loss.
- **steps**: If using steps: raise the daily average by about 2,000 steps at a time, aiming for at least 7,000/day (ACSM 2011 via Kravitz summary).
- **strength**: 2 days/week minimum, all major muscle groups (WHO/NHS). Beginners: 1 set of 10-15 reps at a light-moderate load (40-50% 1RM). Novice-intermediate: 2-4 sets of 8-12 at 60-70% 1RM. Leave 48 h before training the same muscles again (ACSM 2011).
- **intensity**: Moderate means you can talk but not sing (RPE 12-13). Vigorous means only a few words (RPE 14-17) (NHS; ACSM 2011).
- **hiit**: Optional once 150 min/week is comfortable. At most 2 HIIT sessions/week inside a fat-loss block (heuristic). It saves time but is not superior for fat loss (Wewege 2017).

### nutritionNotes

- Deficit target: ~600 kcal/day below maintenance → ~0.5 kg/week (BNF). Show users ranges, not exact promises (Hall 2011).
- Floors: do not set targets below ~1,200 kcal/day. Below 800 kcal/day is a very-low-energy diet that needs specialist supervision (NICE NG246, search result; unverified).
- Before a diet plan, ask an eating-disorder screening question. If positive, do not show calorie targets; suggest a GP instead (NICE NG246 says to screen; unverified detail).
- Protein targets during a deficit were not researched in this pass (open question; unverified).

### safety

- **seeDoctorFirst**:
  - Inactive for a while, or any medical condition or concern (NHS: speak to a GP first).
  - Known heart condition or high blood pressure, chest pain, dizziness/fainting, or a bone/joint problem made worse by activity. These are PAR-Q+ style questions; exact wording is unverified, so use the official PAR-Q+ form.
  - BMI ≥ 40, type 1/2 diabetes on insulin or sulfonylureas, pregnancy, or eating-disorder history, before any calorie target (heuristic list; unverified).
- **stopAndSeekHelp**: Stop and contact a doctor for chest pain, dizziness, or breathlessness so bad you cannot speak (Otago safety rules, generalisable). Resting HR above 100, or below 60 when that is unusual for you or comes with an irregular beat, needs a doctor's advice. Faintness, chest pain or a racing irregular heart needs urgent care (healthdirect).
- **appRules**: Rate cap 1 kg/week. Calorie floor 1,200. If logged loss is >1 kg/week for 3 straight weeks, raise intake and show a check-in prompt (heuristic).

### weekStructure (by days/week)

- **2**: full-body strength + 20 min brisk walk | full-body strength + 20 min brisk walk
- **3**: full-body strength A | brisk walk / steady cardio 30-45 min | full-body strength B
- **4**: full-body strength A | steady cardio 30-45 min | full-body strength B | long walk 45-60 min
- **5**: strength A | steady cardio 30-45 | strength B | intervals (low-impact) OR steady cardio | long walk 45-60
- **6**: strength A | steady cardio | strength B | intervals | steady cardio | long walk
- **notes**: Non-training days: daily walking/step target, as WHO/NHS advise being active every day and breaking up sitting. Strength days should not be back-to-back for the same muscle groups (48 h rule, ACSM 2011).

### Session templates

#### Full-Body Strength A (beginner) (`fl_strength_a_beginner`, strength)
*Use when:* beginner level, any day count; first 4-6 weeks

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| Bodyweight squat to chair | 1 | 10-15 | light, RPE 12-13 | legs |
| Incline push-up (hands on bench/wall) | 1 | 10-15 | light | chest |
| Glute bridge | 1 | 10-15 |  | hips |
| Band or dumbbell row | 1 | 10-15 | 40-50% 1RM | back |
| Dumbbell overhead press (seated) | 1 | 10-15 | light | shoulders |
| Dead bug | 1 | 8 per side |  | core |

#### Full-Body Strength B (intermediate) (`fl_strength_b_intermediate`, strength)
*Use when:* intermediate/advanced, or a beginner after ~6 weeks of consistent sessions

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| Goblet squat | 3 | 8-12 | 60-70% 1RM / moderate-hard | legs |
| Romanian deadlift (dumbbell) | 3 | 8-12 |  | hips |
| Push-up (or incline) | 3 | 8-12 |  | chest |
| One-arm dumbbell row | 3 | 8-12 per side |  | back |
| Reverse lunge | 2 | 8-10 per leg |  | legs |
| Front plank | 2 | 20-40 s |  | core |

#### Steady Cardio (`fl_steady_cardio`, cardio)
*Use when:* all levels; duration scales with the weekly minutes target

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| Warm-up easy walk | 1 | 5 min | easy |  |
| Brisk walk / easy jog / bike / swim | 1 | 20-45 min | moderate: can talk, not sing (RPE 12-13) |  |
| Cool-down walk | 1 | 5 min | easy |  |

#### Long Walk (`fl_long_walk`, cardio)
*Use when:* 4+ days/week; a key way to reach 250+ min/week

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| Continuous walk (hills optional) | 1 | 45-60 min | moderate |  |

#### Low-Impact Intervals (`fl_low_impact_intervals`, intervals)
*Use when:* intermediate+, at most 2x/week, once 150 min/week is comfortable

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| Warm-up | 1 | 5-10 min | easy-moderate |  |
| Fast incline walk / bike / rower hard effort | 8 | 60 s | hard: few words only (~85-90% HRmax) | work |
| Easy recovery between efforts | 8 | 60-90 s | easy | recover |
| Cool-down | 1 | 5 min | easy |  |

### Sources

- [WHO 2020 guidelines on physical activity and sedentary behaviour](https://pmc.ncbi.nlm.nih.gov/articles/PMC7719906/), Bull FC et al., Br J Sports Med 2020. *Used:* 150-300 min moderate or 75-150 vigorous, strength ≥2 d/wk, limit sedentary time. *Verification:* fetched
- [Physical activity guidelines for adults aged 19 to 64](https://www.nhs.uk/live-well/exercise/exercise-guidelines/physical-activity-guidelines-for-adults-aged-19-to-64/), NHS. *Used:* 150/75 min, spread over 4-5 days, strength 2 d, talk test, see GP if inactive. *Verification:* fetched
- [Overweight, obesity and weight loss](https://www.nutrition.org.uk/health-conditions/overweight-obesity-and-weight-loss), British Nutrition Foundation. *Used:* 0.5-1 kg/week, 600 kcal/day deficit ≈ 0.5 kg/week, ~1,400 / 1,900 kcal. *Verification:* fetched
- [Understanding calories](https://www.nhs.uk/live-well/healthy-weight/managing-your-weight/understanding-calories/), NHS. *Used:* average needs 2,000 kcal women / 2,500 kcal men. *Verification:* fetched
- [Losing Weight](https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html), CDC. *Used:* 1-2 lb/week; 5% loss improves BP, cholesterol, glucose. *Verification:* fetched
- [Treatment for Overweight & Obesity](https://www.niddk.nih.gov/health-information/weight-management/adult-overweight-obesity/treatment), NIDDK (NIH). *Used:* 5% over 6 months as initial goal; programs include ≥150 min/week. *Verification:* fetched
- [ACSM Position Stand: Appropriate physical activity intervention strategies for weight loss and prevention of weight regain for adults](https://pubmed.ncbi.nlm.nih.gov/19127177/), Donnelly JE et al., MSSE 2009. *Used:* 150-250 min modest loss, >250 clinically significant, resistance training role, 3-5% lowers risk. *Verification:* abstract fetched via Europe PMC API
- [Physical Activity, Weight Loss and Weight Regain (summary of ACSM 2009)](https://www.unm.edu/~lkravitz/Article%20folder/RegainUNM.html), Len Kravitz, UNM. *Used:* 225-420 min → 5-7.5 kg; 500-700 kcal deficit +20% with exercise; 275 min/week maintainers. *Verification:* fetched (secondary summary)
- [Quantification of the effect of energy imbalance on bodyweight](https://pmc.ncbi.nlm.nih.gov/articles/PMC3880593), Hall KD et al., Lancet 2011. *Used:* 10 kcal/day per lb rule, ~1-yr half-time, 3,500 kcal rule overestimates. *Verification:* fetched
- [HIIT vs MICT on body composition in overweight and obese adults: systematic review and meta-analysis](https://pubmed.ncbi.nlm.nih.gov/28401638/), Wewege M et al., Obesity Reviews 2017. *Used:* similar fat/waist loss, ~40% less time, 10 wk × 3/wk, running vs cycling. *Verification:* abstract fetched via Europe PMC API
- [ACSM 2011 guidelines summary (Garber et al.) tables](https://www.unm.edu/~lkravitz/Article%20folder/ACSMGuidelinesUNM.pdf), Len Kravitz, UNM. *Used:* resistance %1RM/reps/sets by level, 48 h rest, RPE bands, +2,000 steps to ≥7,000. *Verification:* fetched (PDF text extracted)
- [Resting heart rate](https://www.healthdirect.gov.au/resting-heart-rate), healthdirect Australia. *Used:* 60-100 bpm normal, how to measure, when to see a doctor. *Verification:* fetched
- [Overweight and obesity management (NG246)](https://www.nice.org.uk/guidance/NG246/chapter/physical-activity-and-diet), NICE 2025. *Used:* low-/very-low-energy diet limits, ED screening. *Verification:* unverified (page returned 403; search-result summary only)

---

## general-fitness

Get fit from zero to meeting WHO/NHS guidelines: 150+ min moderate cardio, 2+ strength days, daily movement. Cardio progression follows NHS Couch to 5K's 9-week walk-run structure. Strength follows ACSM 2011 novice loading.

### Benchmarks

| id | label | unit | how to test |
|---|---|---|---|
| `continuous_run_min` | Continuous jog/run | minutes | On flat ground, jog at a conversational pace for as long as you can without walking, up to 30 min. 0 = cannot jog yet. |
| `brisk_walk_min` | Continuous brisk walk | minutes | Walk briskly (can talk, not sing) for as long as is comfortable, up to 45 min. Use for people who cannot jog yet. |
| `pushups_max` | Push-ups in one set | reps | Full push-ups (or from knees; record which), with chest to about a fist's height from the floor and the body in a straight line. Count good reps until form breaks; no rest. Norms differ widely by source (CSEP vs ACSM tables), so Somax uses the user's own baseline, not a norm rating (unverified norms). |
| `plank_s` | Front plank hold | seconds | Forearms under shoulders, elbows at 90°, feet hip-width, neutral pelvis. Hold until form breaks. Only norm found: athletic 18-25-year-olds, median 95 s (F) / 110 s (M) (WKU IJESAB). Do not use it to rate general users. |
| `resting_hr_bpm` | Resting heart rate | bpm | Seated, rested, count the pulse for 60 s or use a watch. Track the 7-day average. Fitness training often lowers it (healthdirect). |
| `weekly_active_minutes` | Moderate-or-harder minutes | min/week | Self-report or from HealthKit exercise minutes. |

### levelPlacement

- **levels**:
  - level: zero; rule: continuous_run_min = 0 AND weekly_active_minutes < 60; plan: walk-based start, then walk-run
  - level: beginner; rule: weekly_active_minutes 60-149, or can jog < 10 min; plan: Couch-to-5K-style progression from the matching week
  - level: intermediate; rule: meets 150 min/week, can jog 20-30 min; plan: add vigorous work / intervals, 2-3 strength days
  - level: advanced; rule: ≥ 300 min/week or regular vigorous training; plan: route to HIIT/strength-specific playbooks
- **basis**: Thresholds sit on WHO/NHS 150-minute marks; the cut-points between them are Somax heuristics.

### improvementModel

- **cardio**: NHS Couch to 5K takes complete beginners from alternating 1-min runs/1.5-min walks to 30 min continuous running in about 9 weeks, at 3 runs/week with rest days between. Users may repeat weeks (NHS says you can take longer).
- **aerobicCapacity**: Sedentary men improved VO2peak by ~19% over 12 weeks of 3 sessions/week, with sprint intervals and 45-min moderate cycling working equally well (Gillen 2016). Use this as the upper expectation for a 12-week block, not a promise.
- **strength**: No sourced weekly rep-gain rate. Somax heuristic: beginners add 1-2 reps per session per exercise until the top of the rep range, then make it harder. Push-up max expected to rise ~10%/week in the first 6-8 weeks for novices (heuristic, unverified).
- **restingHR**: Directional only: it usually falls with training (healthdirect). No sourced rate, so do not set RHR targets (unverified).

### planLengthRule

- **formula**: Primary driver is the cardio benchmark. Map continuous_run_min to the C25K week whose longest run first equals or exceeds it, then weeks = 9 - startWeek + 1. For walk-only users (zero level), add a 2-4 week walking lead-in (brisk walk to 30 min continuous) first; the lead-in is a heuristic. For strength targets (e.g. 20 push-ups): weeks = ceil(ln(target/current)/ln(1.10)) using the 10%/week heuristic. Plan length = max of the cardio and strength weeks, clamped.
- **minWeeks**: 4
- **maxWeeksPerBlock**: 12
- **milestoneSplitting**: Milestone 1 = 30 min continuous jog OR 150 min/week (guideline met). Milestone 2 = 150 min + 2 strength days sustained 4 weeks. Beyond that, roll into HIIT or a specific goal. Re-test benchmarks every 4 weeks; if behind, repeat the last week rather than skip ahead (C25K repeat-week idea).

### volumeModel

- **aerobic**: Build to ≥150 min moderate (≥30 min on ≥5 days) or ≥75 min vigorous (≥20 min on ≥3 days), or a mix (ACSM 2011; WHO). Bouts can be accumulated, with ACSM giving ≥10 min chunks. Progress intensity, duration and frequency gradually.
- **strength**: 2-3 days/week for all major muscle groups, 48 h apart per muscle group. Beginners: single set, 10-15 reps, light load (40-50% 1RM). Then 2-4 sets of 8-12 at moderate-hard (60-70% 1RM). Rest 2-3 min between multiple sets (ACSM 2011). NHS: work until you need a short rest before repeating.
- **flexibilityNeuromotor**: Stretch major muscle groups ≥2-3 days/week. Balance/agility work 2-3 days/week, 20-30 min (ACSM 2011).

### safety

- **seeDoctorFirst**:
  - Inactive for a while or any medical concern (NHS, Couch to 5K page).
  - Any PAR-Q+ 'yes' answer (official form; exact items unverified).
- **stopAndSeekHelp**: Chest pain, dizziness, faintness, or breathlessness out of proportion to effort: stop and seek medical advice (Otago/healthdirect).
- **general**: Running outdoors: stay aware with headphones, run with others, and use well-lit routes and reflective kit in the dark (NHS C25K). Joint pain that changes your gait means repeat the week or switch to walking/cycling (heuristic).

### weekStructure (by days/week)

- **2**: cardio (walk-run) + 15 min strength circuit | cardio (walk-run) + 15 min strength circuit
- **3**: walk-run C25K session | full-body strength | walk-run C25K session
- **4**: walk-run | full-body strength A | walk-run | full-body strength B
- **5**: walk-run | strength A | walk-run | strength B | long easy walk or mobility
- **6**: walk-run | strength A | walk-run | strength B | walk-run (or easy cardio) | mobility/balance
- **notes**: Keep C25K runs at 3/week max with rest days between (NHS). Extra days go to strength, walking or mobility.

### Session templates

#### Walk-Run Week 1 (`gf_walk_run_w1`, cardio)
*Use when:* zero/beginner starting the run progression

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| Brisk warm-up walk | 1 | 5 min | moderate |  |
| Jog | 8 | 60 s | comfortable pace | interval |
| Walk | 8 | 90 s | easy-brisk | interval |
| Cool-down walk | 1 | 5 min | easy |  |

#### Brisk Walk Builder (`gf_brisk_walk_builder`, cardio)
*Use when:* zero level lead-in, before walk-run

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| Brisk walk | 1 | 15-30 min (+5 min/week) | talk, not sing |  |

#### Bodyweight Strength Circuit (`gf_strength_circuit_bw`, strength)
*Use when:* zero/beginner, no equipment

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| Sit-to-stand / squat | 1 | 10-15 |  | legs |
| Wall or incline push-up | 1 | 10-15 |  | chest |
| Glute bridge | 1 | 10-15 |  | hips |
| Backpack/towel row | 1 | 10-15 |  | back |
| Bird dog | 1 | 8 per side |  | core |
| Front plank | 1 | 15-30 s |  | core |

#### Full-Body Strength A (`gf_strength_full_a`, strength)
*Use when:* after 4+ weeks of the circuit, or intermediate

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| Goblet squat | 3 | 8-12 | moderate-hard | legs |
| Push-up | 3 | max-2 (leave 2 in reserve) |  | chest |
| Dumbbell row | 3 | 8-12 |  | back |
| Hip hinge / RDL | 3 | 8-12 |  | hips |
| Side plank | 2 | 20-30 s per side |  | core |

#### Push-Up Builder (`gf_push_up_ladder`, strength)
*Use when:* user goal is a push-up count; add to 2 sessions/week

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| Push-up (level the user can do 5+ of) | 4 | 50-60% of current max | submaximal, crisp form | chest |
| Slow eccentric push-up | 2 | 3-5 (3 s down) |  | chest |

### Sources

- [Get running with Couch to 5K](https://www.nhs.uk/live-well/exercise/running-and-aerobic-exercises/get-running-with-couch-to-5k/), NHS. *Used:* 9 weeks, 3 runs/week, week 1 = 1 min run / 1.5 min walk, 30 min continuous by the end. *Verification:* fetched
- [WHO 2020 guidelines on physical activity and sedentary behaviour](https://pmc.ncbi.nlm.nih.gov/articles/PMC7719906/), Bull FC et al.. *Used:* aerobic and strength minimums. *Verification:* fetched
- [Physical activity guidelines for adults aged 19 to 64](https://www.nhs.uk/live-well/exercise/exercise-guidelines/physical-activity-guidelines-for-adults-aged-19-to-64/), NHS. *Used:* talk test, strength to need a short rest, examples. *Verification:* fetched
- [ACSM Position Stand: Quantity and quality of exercise...](https://pubmed.ncbi.nlm.nih.gov/21694556/), Garber CE et al., MSSE 2011. *Used:* ≥30 min × ≥5 d moderate / ≥20 min × ≥3 d vigorous; 2-3 d resistance; flexibility ≥2 d. *Verification:* abstract fetched via Europe PMC API
- [ACSM 2011 guidelines summary tables](https://www.unm.edu/~lkravitz/Article%20folder/ACSMGuidelinesUNM.pdf), Len Kravitz, UNM. *Used:* %1RM / reps / sets by level, rest, neuromotor dose, RPE. *Verification:* fetched (PDF text extracted)
- [Twelve weeks of sprint interval training improves indices of cardiometabolic health similar to traditional endurance training...](https://pmc.ncbi.nlm.nih.gov/articles/PMC4846072), Gillen JB et al., PLOS ONE 2016. *Used:* +19% VO2peak in 12 weeks, both protocols. *Verification:* fetched
- [Fitness norms for the plank exercise](https://digitalcommons.wku.edu/ijesab/vol8/iss2/14), Int J Exerc Sci Abstracts (WKU). *Used:* plank protocol and athlete percentiles. *Verification:* fetched
- [Resting heart rate](https://www.healthdirect.gov.au/resting-heart-rate), healthdirect. *Used:* RHR measurement and thresholds. *Verification:* fetched

---

## hiit

Time-efficient interval training. Use proven protocols (Gibala/Little 10×60 s; Gillen 3×20 s; Tabata 20/10 only for already-fit users) after an aerobic base. 2-3 sessions/week; HIIT matches but does not beat moderate cardio for fat loss.

### Benchmarks

| id | label | unit | how to test |
|---|---|---|---|
| `continuous_cardio_min` | Continuous moderate cardio | minutes | Longest comfortable continuous session (jog/bike/row) at talk-not-sing effort. |
| `resting_hr_bpm` | Resting heart rate | bpm | As in general-fitness. |
| `hr_max_est` | Estimated max heart rate | bpm | Use the watch's estimate or 220 − age (common estimate; formula not verified from a fetched page, so unverified). Used only to show intensity zones. |
| `interval_test` | Interval repeatability | rounds | After a 5-10 min warm-up, do 60 s hard (few words only) / 60 s easy. Count how many rounds you complete at steady effort before form or pace drops sharply. Cap at 10. (Somax field test; heuristic.) |

### levelPlacement

- **prerequisite**: Only prescribe HIIT once the user can do ≥20 min continuous moderate cardio and has no PAR-Q+ flags (heuristic gate). Otherwise route to general-fitness.
- **levels**:
  - level: beginner; rule: interval_test 3-5 rounds; protocol: submaximal 30-60 s efforts, recovery ≥ work (1:2 to 1:1); basis: ACSM brochure work/recovery guidance (unverified, search-only); Hood 2011 submaximal design
  - level: intermediate; rule: interval_test 6-9 rounds; protocol: Little/Gibala 10×60 s at ~85-90% HRmax with 60 s recovery; basis: Gibala SSE #139; Hood 2011
  - level: advanced; rule: 10 rounds + already regularly vigorous; protocol: sprint intervals (Gillen 3×20 s all-out) or Tabata-style 20/10; basis: Gillen 2016; Tabata 1996

### improvementModel

- **evidence**:
  - Low-volume HIIT (10×60 s at ~90% HRmax, 1:1 recovery) raised muscle oxidative capacity in 2 weeks (6 sessions). VO2peak had not measurably changed after 2 weeks in the core studies (Gibala SSE #139).
  - Sedentary middle-aged adults (45 y, BMI 27): 10×1 min at ~80-95% HR reserve, 1 min recovery, 6 sessions in 2 weeks gave ~35% higher muscle oxidative capacity and ~35% better insulin sensitivity (Hood 2011).
  - Sedentary men, 3×20 s all-out sprints with 2 min easy, ~10 min total, 3×/week for 12 weeks: VO2peak +19%, the same as 45 min moderate cycling. Body fat % fell ~2 points with no change in weight (Gillen 2016).
  - Tabata 1996: 7-8 × 20 s at ~170% VO2max with 10 s rest, 5 d/wk for 6 weeks, in young active men: VO2max +7 ml/kg/min, anaerobic capacity +28%. This is exhausting, supramaximal work and not realistic for beginners; most app 'Tabata' workouts are not this intensity.
  - For fat loss HIIT ≈ MICT, with ~40% less time (Wewege 2017).
- **expectedChange**: Expect fitness gains to show by ~4-6 weeks and up to ~19% VO2peak by 12 weeks. Present this as a typical research-group average, not a guarantee.

### planLengthRule

- **formula**: HIIT plans are fixed-length blocks, not gap-driven. Block 1 = 6 weeks (matches Tabata/many 6-wk studies), block 2 = 6 weeks at the next level; 12 weeks total mirrors Gillen 2016. If the goal is a benchmark (e.g. 10 interval rounds), weeks = clamp((targetRounds − currentRounds) × 1, 4, 12), assuming +1 round/week (heuristic).
- **minWeeks**: 4
- **maxWeeksPerBlock**: 12
- **milestoneSplitting**: Milestone per level: beginner protocol → 10×60 s → sprint/advanced. Retest interval_test every 3 weeks.

### volumeModel

- **frequency**: 2-3 HIIT sessions/week, never on consecutive days (research protocols used 3/week; the spacing is a heuristic).
- **sessionLength**: Warm-up 5-10 min and cool-down 5-10 min (ACSM brochure; unverified). Work period 1-10 min of hard effort in total.
- **progression**: Order: add rounds (to 8-10) → lengthen work (30→60 s) → shorten recovery (2:1 → 1:1) → raise intensity. Change one variable per week (heuristic).
- **background**: Keep the rest of the week at moderate cardio + 2 strength days so WHO totals are still met. 1 vigorous minute counts as 2 moderate minutes.
- **modality**: Cycling, rowing or swimming carry lower injury risk than running for HIIT (Gibala notes greater injury risk, especially with running). For fat loss, though, running showed effects and cycling did not (Wewege).

### safety

- **seeDoctorFirst**:
  - Any known heart disease, high blood pressure, chest pain, or fainting history. In cardiac rehab, cardiac arrests were rare (1 per 23,182 HIIT hours vs 1 per 129,456 moderate hours, Rognmo 2012). That was under supervision and too few events to conclude HIIT is more dangerous, so app HIIT for these users must wait for a doctor's OK.
  - Pregnant, over 65 and new to exercise, or recent injury (heuristic list; unverified).
- **stopAndSeekHelp**: Chest pain/pressure, dizziness, palpitations or an irregular racing heart, or unusual breathlessness: stop immediately and seek urgent care (healthdirect).
- **appRules**: Gate HIIT behind the 20-min continuous cardio prerequisite and a negative health screen. Max 3/week. Don't sit or lie down during recovery; keep moving (common guidance, unverified). Running HIIT carries more injury risk than cycling (Gibala).

### weekStructure (by days/week)

- **2**: HIIT | HIIT (≥48 h later)
- **3**: HIIT | strength full-body | HIIT
- **4**: HIIT | strength A | moderate cardio 30-40 min | HIIT or strength B
- **5**: HIIT | strength A | moderate cardio | HIIT | strength B
- **6**: HIIT | strength A | moderate cardio | HIIT | strength B | long easy cardio / mobility
- **notes**: Never more than 3 HIIT sessions/week. 2-day users get 2 HIIT sessions plus advice to walk on other days.

### Session templates

#### Starter Intervals 30/60 (`hiit_beginner_30_60`, hiit)
*Use when:* beginner HIIT level

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| Warm-up (bike/jog/brisk walk) | 1 | 8 min | easy → moderate |  |
| Hard effort | 6 | 30 s | ~80-85% HRmax, few words only | work |
| Easy recovery | 6 | 60 s | easy, keep moving | recover |
| Cool-down | 1 | 5 min | easy |  |

#### 10 × 1 Minute (Gibala model) (`hiit_little_gibala_10x60`, hiit)
*Use when:* intermediate; the evidence-based workhorse

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| Warm-up | 1 | 5-10 min | easy-moderate |  |
| Hard effort (bike preferred) | 10 | 60 s | ~85-90% HRmax (≈80-95% HR reserve) | work |
| Easy recovery | 10 | 60 s | easy | recover |
| Cool-down | 1 | 5 min | easy |  |

#### 3 × 20 s Sprint (one-minute workout) (`hiit_gillen_3x20`, sit)
*Use when:* advanced only; bike sprints; a time-crunched user who is already fit and cleared

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| Warm-up easy cycling | 1 | 2 min | easy |  |
| All-out sprint | 3 | 20 s | maximal | work |
| Easy cycling between sprints | 3 | 2 min | very easy | recover |
| Cool-down | 1 | 3 min | easy |  |

#### Tabata-Style 20/10 (`hiit_tabata_style`, hiit)
*Use when:* advanced, already vigorous-active users only. True Tabata intensity (~170% VO2max) is supramaximal, and the app version will be less intense; say so

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| Warm-up | 1 | 10 min | progressive |  |
| Bike sprint or burpee/squat-jump (low-impact alt: fast step-ups) | 8 | 20 s | maximal sustainable | work |
| Rest | 8 | 10 s | rest | recover |
| Cool-down | 1 | 5-10 min | easy |  |

#### Low-Impact Bodyweight Intervals (`hiit_bodyweight_low_impact`, hiit)
*Use when:* beginner/intermediate with no equipment, or joint-sensitive users

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| March / step-touch warm-up | 1 | 5 min | easy |  |
| Fast squats to box | 2 | 40 s | hard | circuit |
| Step-ups (fast) | 2 | 40 s | hard | circuit |
| Incline mountain climbers | 2 | 40 s | hard | circuit |
| Skater steps (no jump) | 2 | 40 s | hard | circuit |
| Recovery after each exercise | 8 | 40-60 s | easy | recover |

### Sources

- [Physiological Adaptations to Low-Volume High-Intensity Interval Training (SSE #139)](https://www.gssiweb.org/en/sports-science-exchange/article/sse-139-physiological-adaptations-to-low-volume-high-intensity-interval-training), Martin J. Gibala, GSSI 2015. *Used:* Wingate 4-6×30 s, 10×60 s ~90% HRmax model, 2-week adaptations, injury note. *Verification:* fetched
- [Low-volume interval training improves muscle oxidative capacity in sedentary adults](https://europepmc.org/article/MED/21448086), Hood MS et al., MSSE 2011. *Used:* 10×1 min ~80-95% HRR, sedentary middle-aged adults, outcomes. *Verification:* abstract fetched via Europe PMC API
- [Twelve weeks of sprint interval training improves indices of cardiometabolic health...](https://pmc.ncbi.nlm.nih.gov/articles/PMC4846072), Gillen JB et al., PLOS ONE 2016. *Used:* 3×20 s protocol, VO2peak +19%, body fat change. *Verification:* fetched
- [Effects of moderate-intensity endurance and high-intensity intermittent training on anaerobic capacity and VO2max](https://pubmed.ncbi.nlm.nih.gov/8897392/), Tabata I et al., MSSE 1996. *Used:* 7-8×20 s at ~170% VO2max/10 s, 5 d/wk, 6 wk, +7 ml/kg/min, +28% anaerobic. *Verification:* abstract fetched via Europe PMC API
- [HIIT vs MICT on body composition: meta-analysis](https://pubmed.ncbi.nlm.nih.gov/28401638/), Wewege M et al., Obes Rev 2017. *Used:* HIIT ≈ MICT, 40% less time. *Verification:* abstract fetched via Europe PMC API
- [Cardiovascular risk of high- versus moderate-intensity aerobic exercise in coronary heart disease patients](https://europepmc.org/article/MED/22879367), Rognmo Ø et al., Circulation 2012. *Used:* event rates per exercise hour in cardiac rehab. *Verification:* abstract fetched via Europe PMC API
- [High-Intensity Interval Training (ACSM information brochure)](https://push.fiu.edu/wp-content/uploads/2019/01/High_Intensity_Interval_Training___Efficient.3.pdf), ACSM / Brad Roy. *Used:* 15 s-4 min at 80-95% HRmax, recovery ≥ work, 5-10 min warm-up. *Verification:* unverified (host unreachable; search summary only)

---

## pilates

Pilates core strength using the classical mat order in Basic → Intermediate → Advanced levels, built on the six principles. Evidence: 12 weeks of 2×60-min mat classes improved abdominal endurance, hamstring flexibility and upper-body endurance, but not posture or balance (Kloubec 2010). For low back pain it beats minimal intervention but is not clearly better than other exercise (Cochrane 2015).

### Benchmarks

| id | label | unit | how to test |
|---|---|---|---|
| `plank_s` | Front plank hold | seconds | Forearms under shoulders (90° elbows), feet hip-width, neutral pelvis. Stop when form breaks. Athletic 18-25 y median: 95 s F / 110 s M (WKU). |
| `roll_up_reps` | Controlled Roll Up | reps | Lying with arms overhead, roll up to sit-and-reach one vertebra at a time without feet lifting or using momentum, then roll back down. Count clean reps (max 5). |
| `hundred_completed` | The Hundred | breath cycles of 10 (max 10) | Head and shoulders lifted, legs in tabletop (easier) or extended at 45° (harder), pump the arms 5 counts in and 5 counts out. Record cycles held with the lower back stable (record the leg position). |
| `sit_and_reach_cm` | Sit-and-reach | cm (box with 26 cm zero) | See mobility.sit_and_reach_cm. |
| `pilates_level_check` | Classical level check | level | Can the user complete every exercise of the Basic list at its rep range with control? If yes, test Intermediate. |

### principles

- Centering
- Concentration
- Control
- Precision
- Breath
- Flow

### principlesNote

- The six principles are the ones widely taught by Joseph Pilates' students (consistent across secondary sources; no single primary page fetched, so unverified).

### levelPlacement

- **levels**:
  - level: foundation; rule: cannot complete Roll Up ×3 or plank < 20 s; content: pre-Pilates: breathing, pelvic neutral/imprint, dead bug, bridge, tabletop holds, modified Hundred (heuristic; typical studio pre-Pilates content, unverified)
  - level: basic; rule: Roll Up ≥3 with control; content: Classical Basic order: Hundred (100 pumps), Roll Up 3-5, Single Leg Circles 5-10 each way, Rolling Like a Ball 5-10, Single Leg Stretch 5-10 sets, Double Leg Stretch 5-10, Spine Stretch Forward 3-5
  - level: intermediate; rule: Basic list completed with control at the top of rep ranges for 2 sessions; content: Basic + Single/Double Straight Leg Stretch, Criss Cross, Open Leg Rocker, Corkscrew, Saw, Neck Roll, Single & Double Leg Kicks, Neck Pull, Side Kick series, Teaser 1, Seal
  - level: advanced; rule: Intermediate list completed with control (instructor-level skill); content: Adds Roll Over, Corkscrew with hips over, Swan, Scissors, Bicycle, Shoulder Bridge, Spine Twist, Jackknife, full Side Kick series, Teaser 1-3 and more, up to the full 34 from Return to Life
- **basis**: Level lists and reps are from the Pilatesology Classical Mat Basic/Intermediate/Advanced order sheet. Level advance rules are Somax heuristics.

### improvementModel

- **evidence**:
  - 12 weeks of 2×60-min mat classes (~25 basic exercises) brought significant gains in abdominal endurance, hamstring flexibility and upper-body muscular endurance, in active middle-aged adults. Posture and balance did not improve vs control (Kloubec 2010).
  - Chronic low back pain: Pilates reduces pain and disability vs minimal intervention, with low-moderate quality evidence. It is not shown to be better than other exercise. Trial programs ran 10-90 days, sessions ~1 h, from daily to weekly, supervised by trained instructors. Adverse effects were rare and mild (Cochrane 2015 via AAFP).
- **plankRate**: No sourced plank-progression rate. Somax heuristic: +10% hold time per week for novices, slowing to +5% after week 6 (unverified).
- **posture**: Do not promise posture change from Pilates alone; the Kloubec RCT found none. Frame it as 'back comfort and core endurance' (sourced).

### planLengthRule

- **formula**: Default block = 12 weeks at 2-3 sessions/week (Kloubec dose). For a timed goal such as a 3-minute plank: weeks = ceil(ln(target/current)/ln(1.10)) for the first 6 weeks, then at 5%/week (heuristic). Clamp to 4-12 weeks per block. If the result is >12 weeks, split milestones at 60 s, 90 s, 120 s, 180 s. For a level goal ('Pilates core strength'), give 6 weeks per level (Basic → Intermediate), heuristic.
- **minWeeks**: 4
- **maxWeeksPerBlock**: 12
- **milestoneSplitting**: Plank: 30 → 60 → 90 → 120 → 180 s. Classical: Foundation → Basic → Intermediate. Re-test each 3-4 weeks.

### volumeModel

- **frequency**: 2-3 sessions/week (Kloubec used 2×60 min; Cochrane trials ranged from daily to weekly).
- **duration**: Beginners 20-30 min, building to 45-60 min (heuristic, capped at the 60 min used in trials).
- **progression**: Reps first (bottom → top of the classical range), then levers (bent → straight legs, lower leg angle), then the next exercise in the classical order. The classical order is fixed; skip exercises the user is not ready for rather than reorder (heuristic, based on Pilates' insistence on the order).
- **pairWith**: Pilates counts toward strength days (NHS lists pilates as muscle-strengthening). It does not replace 150 min aerobic.

### safety

- **seeDoctorFirst**:
  - Back pain with leg numbness/weakness, bladder/bowel changes, night pain, fever, or after trauma: urgent medical review, not exercise (red-flag list is standard clinical guidance, unverified here).
  - Osteoporosis: avoid loaded spinal flexion (Roll Up, Roll Over, Teaser, Jackknife, Rolling Like a Ball) unless a clinician clears it (common guidance; unverified).
  - Pregnancy: avoid prolonged lying on the back after the first trimester and deep abdominal flexion; get midwife/clinician advice (unverified).
  - Neck problems: keep the head down in the Hundred and curl-up variations (heuristic).
- **stopAndSeekHelp**: Sharp or radiating pain, numbness, dizziness: stop. Mild muscle soreness was the only common adverse effect in the Cochrane trials.
- **appRules**: Rolling exercises (Rolling Like a Ball, Open Leg Rocker, Seal, Roll Over) are hidden for users flagged osteoporosis/neck issues/pregnancy.

### weekStructure (by days/week)

- **2**: Pilates mat (level) | Pilates mat (level) + plank builder
- **3**: Pilates mat | brisk walk 30 min | Pilates mat + plank builder
- **4**: Pilates mat | cardio 30 min | Pilates mat | mobility flow
- **5**: Pilates mat | cardio | Pilates mat | strength (legs/back) | Pilates mat (short) + mobility
- **6**: Pilates mat | cardio | Pilates mat | strength | Pilates mat | mobility / long walk
- **notes**: Max 3-4 Pilates mat sessions/week; non-Pilates days cover WHO aerobic minutes.

### Session templates

#### Pilates Foundations (`pil_foundation`, pilates)
*Use when:* foundation level, first 2-4 weeks, or back-sensitive users

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| Breathing (lateral rib breathing) | 1 | 8 breaths |  |  |
| Pelvic tilts (neutral ↔ imprint) | 1 | 10 |  |  |
| Bridge (articulating) | 1 | 8 |  |  |
| Dead bug (tabletop, arms reach) | 2 | 6 per side |  |  |
| Modified Hundred (legs tabletop, head down if needed) | 1 | 50 pumps |  |  |
| Side-lying leg lifts | 1 | 10 per side |  |  |
| Swimming prep (prone opposite arm/leg) | 1 | 8 per side |  |  |
| Forearm plank | 2 | 15-30 s |  |  |

#### Classical Mat - Basic Order (`pil_classical_basic`, pilates)
*Use when:* basic level

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| The Hundred | 1 | 100 pumps |  |  |
| Roll Up | 1 | 3-5 |  |  |
| Single Leg Circles | 1 | 5-10 each direction, each leg |  |  |
| Rolling Like a Ball | 1 | 5-10 |  |  |
| Single Leg Stretch | 1 | 5-10 sets |  |  |
| Double Leg Stretch | 1 | 5-10 |  |  |
| Spine Stretch Forward | 1 | 3-5 |  |  |

#### Classical Mat - Intermediate Order (`pil_classical_intermediate`, pilates)
*Use when:* intermediate level

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| The Hundred | 1 | 100 pumps |  |  |
| Roll Up | 1 | 3-5 |  |  |
| Single Leg Circles | 1 | 3-5 each way |  |  |
| Rolling Like a Ball | 1 | 5-10 |  |  |
| Single Leg Stretch | 1 | 5-10 sets |  |  |
| Double Leg Stretch | 1 | 5-10 |  |  |
| Single Straight Leg Stretch | 1 | 5-10 sets |  |  |
| Double Straight Leg Stretch | 1 | 5-10 |  |  |
| Criss Cross | 1 | 5-10 sets |  |  |
| Spine Stretch Forward | 1 | 3-5 |  |  |
| Open Leg Rocker | 1 | 6 |  |  |
| Corkscrew | 1 | 3-5 sets |  |  |
| Saw | 1 | 3-4 sets |  |  |
| Neck Roll | 1 | 3 sets |  |  |
| Single Leg Kicks | 1 | 5 sets |  |  |
| Double Leg Kicks | 1 | 3 sets |  |  |
| Neck Pull | 1 | 5 |  |  |
| Side Kick Series (front/back, up/down, small circles) | 1 | 5-10 each |  |  |
| Teaser 1 | 1 | 3 |  |  |
| Seal | 1 | 6 |  |  |

#### Core Endurance & Plank Builder (`pil_core_plank_builder`, core)
*Use when:* user goal is a timed plank; add 2-3×/week after a mat session

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| Forearm plank | 3 | 60-70% of current max hold | perfect form | plank |
| Side plank (knees or feet) | 2 | 50% of front plank time per side |  | plank |
| Leg Pull Front prep (plank with leg lift) | 2 | 5 per side |  | plank |
| Rest between sets | 3 | 45-60 s |  | recover |

#### Back-Care Pilates (`pil_back_care`, pilates)
*Use when:* goal 'improve posture / back health'; non-specific back pain cleared by clinician

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| Pelvic tilts | 1 | 10 |  |  |
| Bridge (articulating) | 2 | 8 |  |  |
| Cat-cow (quadruped) | 1 | 8 |  |  |
| Bird dog / Swimming prep | 2 | 6 per side |  |  |
| Side-lying clam | 2 | 10 per side |  |  |
| Swan prep (prone chest lift) | 1 | 6 |  |  |
| Spine Stretch Forward (seated) | 1 | 5 |  |  |
| Child's pose rest | 1 | 30-60 s |  |  |

### Sources

- [Pilates for improvement of muscle endurance, flexibility, balance, and posture](https://pubmed.ncbi.nlm.nih.gov/20145572/), Kloubec JA, J Strength Cond Res 2010. *Used:* 12 wk × 2×60 min, outcomes improved / not improved. *Verification:* abstract fetched via Europe PMC API
- [Pilates for low back pain](https://europepmc.org/article/MED/26133923), Yamato TP et al., Cochrane 2015. *Used:* 10 RCTs, Pilates > minimal intervention, not > other exercise, rare adverse events. *Verification:* abstract fetched via Europe PMC API (partial)
- [Pilates for the Treatment of Low Back Pain (Cochrane for Clinicians)](https://www.aafp.org/afp/2016/0401/p556), American Family Physician 2016. *Used:* session frequency/duration in trials, program length 10-90 days. *Verification:* fetched
- [Classical Mat Exercises: Basic, Intermediate, Advanced (order & repetitions)](https://pilatesology.com/wp-content/uploads/2024/04/Classical-Mat-Exercises-Basic-Intermediate-Advanced-With-LINKS.pdf), Pilatesology. *Used:* level exercise lists and rep ranges. *Verification:* fetched (PDF text extracted)
- [Return to Life Through Contrology (34 mat exercises in fixed order)](https://www.pilatesanytime.com/blog/mat/the-34-pilates-mat-exercises-), Joseph H. Pilates. *Used:* the fixed classical order (concept only). *Verification:* unverified (search-result summary only)
- [Fitness norms for the plank exercise](https://digitalcommons.wku.edu/ijesab/vol8/iss2/14), WKU IJESAB. *Used:* plank protocol and percentiles. *Verification:* fetched
- [Physical activity guidelines for adults](https://www.nhs.uk/live-well/exercise/exercise-guidelines/physical-activity-guidelines-for-adults-aged-19-to-64/), NHS. *Used:* pilates counts as muscle-strengthening. *Verification:* fetched

---

## mobility

Flexibility goals (e.g. touch my toes) with ACSM/meta-analysis stretching doses: 10-30 s holds (30-60 s for older adults), 2-4 reps, ≥60 s total per muscle group, ideally ≥5 days/week. Measure with the CSEP sit-and-reach. ROM gains show within ~6 weeks.

### Benchmarks

| id | label | unit | how to test |
|---|---|---|---|
| `sit_and_reach_cm` | Sit-and-reach | cm (box zero at 26 cm) | Warm up 5 min. Sit shoes-off with legs straight and feet flat against the box. One hand on top of the other, reach forward slowly as far as possible and hold 2 s. Best of 2 tries. On a 26-cm-zero box the toes sit at 26 cm, so 26 = touching toes. With a 23 cm box, subtract 3 cm from norms. (Box geometry from CSEP; trial/hold protocol unverified.) |
| `toe_touch_cm` | Standing toe-touch gap (home version) | cm (negative = short of toes, 0 = touching, positive = past toes) | Stand on a step, knees straight, and reach down slowly. Measure fingertip distance above (−) or below (+) the toes' level. Home proxy without a box. Conversion: sit_and_reach_equivalent ≈ 26 + toe_touch_cm (heuristic, unverified). |
| `shoulder_reach_cm` | Back-scratch (shoulder) reach | cm (gap −, overlap +) | One hand over the shoulder, the other up the back. Measure the distance between middle fingertips; test both sides. (Senior Fitness Test item; protocol and norms unverified.) |
| `stiffness_rating` | Self-rated stiffness / back comfort | 0-10 | Weekly self-rating (0 = none) for posture/back goals. |

### sitAndReachNorms

- **source**: CSEP CPAFLA 3rd ed. Table 4-15 (box zero = 26 cm). The extracted table's band edges overlap by 1 cm (Good low = Fair high), so treat each lower edge as inclusive.
- **male**:
  - **20-29**:
    - **excellent**: 40
    - **veryGood**:
      - 34
      - 39
    - **good**:
      - 29
      - 33
    - **fair**:
      - 25
      - 29
    - **needsImprovement**: 24
  - **30-39**:
    - **excellent**: 38
    - **veryGood**:
      - 33
      - 37
    - **good**:
      - 27
      - 32
    - **fair**:
      - 23
      - 27
    - **needsImprovement**: 22
  - **40-49**:
    - **excellent**: 35
    - **veryGood**:
      - 29
      - 34
    - **good**:
      - 23
      - 28
    - **fair**:
      - 18
      - 23
    - **needsImprovement**: 17
  - **50-59**:
    - **excellent**: 35
    - **veryGood**:
      - 28
      - 34
    - **good**:
      - 23
      - 27
    - **fair**:
      - 16
      - 23
    - **needsImprovement**: 15
  - **60-69**:
    - **excellent**: 33
    - **veryGood**:
      - 25
      - 32
    - **good**:
      - 19
      - 24
    - **fair**:
      - 15
      - 19
    - **needsImprovement**: 14
- **female**:
  - **20-29**:
    - **excellent**: 41
    - **veryGood**:
      - 37
      - 40
    - **good**:
      - 32
      - 36
    - **fair**:
      - 28
      - 32
    - **needsImprovement**: 27
  - **30-39**:
    - **excellent**: 41
    - **veryGood**:
      - 36
      - 40
    - **good**:
      - 31
      - 35
    - **fair**:
      - 27
      - 31
    - **needsImprovement**: 26
  - **40-49**:
    - **excellent**: 38
    - **veryGood**:
      - 34
      - 37
    - **good**:
      - 29
      - 33
    - **fair**:
      - 25
      - 29
    - **needsImprovement**: 24
  - **50-59**:
    - **excellent**: 39
    - **veryGood**:
      - 33
      - 38
    - **good**:
      - 29
      - 32
    - **fair**:
      - 25
      - 29
    - **needsImprovement**: 24
  - **60-69**:
    - **excellent**: 35
    - **veryGood**:
      - 31
      - 34
    - **good**:
      - 26
      - 30
    - **fair**:
      - 23
      - 26
    - **needsImprovement**: 22
- **notes**: 'excellent' = at or above the value; 'needsImprovement' = at or below. Touching toes (26 cm) is 'needs improvement' for 20-29 F but 'good' for men 40-59 and 'very good' for men 60-69, so frame the goal by age/sex.

### levelPlacement

- **levels**:
  - level: restricted; rule: sit_and_reach in 'needs improvement' for age/sex, or toe_touch_cm < −15; plan: daily short static + gentle dynamic mobility
  - level: average; rule: fair-good; plan: 5×/week static stretching, add PNF
  - level: flexible; rule: very good/excellent; plan: maintenance 2-3×/week plus goal-specific (splits, pike) work
- **basis**: Bands from CSEP norms; the level mapping is a heuristic.

### improvementModel

- **dose**:
  - ACSM 2011: stretch each major muscle group ≥2-3 days/week (daily gives greater gains), to the point of mild tightness. Hold 10-30 s for most adults, 30-60 s for older adults, 2-4 reps, for ≥60 s total per muscle group. PNF = 3-6 s contraction at 20-75% of max, then 10-30 s assisted stretch.
  - Thomas 2018 meta-analysis: weekly stretching time matters more than per-session time. ≥5 min/week per muscle and ≥5 days/week of static stretching is linked to ROM gains, and static beat ballistic/PNF.
  - Bandy 1997 RCT: 30 s hamstring holds, 5 days/week for 6 weeks increased ROM vs control. 60 s holds or 3×/day gave no extra benefit.
- **rate**: No sourced cm-per-week rate for sit-and-reach. Somax heuristic: about +1 cm/week in the first 6 weeks for restricted users, then +0.5 cm/week, plateauing after ~12 weeks (unverified). A related Bandy 1998 study reported ~11° knee-extension ROM gain over 6 weeks of 30 s static stretching (search-result only; unverified).
- **caveat**: ACSM 2011 notes that a link between flexibility and lower injury risk is not established, so do not claim stretching prevents injury.

### planLengthRule

- **formula**: gapCm = target − current (target default: toes = 26 cm on box, or next CSEP band). weeks = gapCm ≤ 6 ? max(6, gapCm) : 6 + ceil((gapCm − 6) / 0.5). The 6-week floor comes from Bandy's 6-week trial; the rates are heuristic. Clamp 6-12 per block.
- **minWeeks**: 6
- **maxWeeksPerBlock**: 12
- **milestoneSplitting**: Gap > 12 cm: milestones = each CSEP band boundary (e.g. needs improvement → fair → good → touching toes). Re-test every 2 weeks, same time of day after a warm-up.

### volumeModel

- **frequency**: 5-7 days/week for the target muscle group (Thomas 2018; ACSM 'daily is better'). Minimum 2-3 days for maintenance.
- **perMuscle**: ≥60 s per session (e.g. 2×30 s or 4×15 s) and ≥5 min/week in total.
- **sessionLength**: 10-20 min. Can be stacked after workouts when muscles are warm (warm-up guidance, heuristic).
- **progression**: Weeks 1-2: 2×30 s static. Weeks 3-6: 3×30 s or add PNF contract-relax. Weeks 7+: add loaded mobility (Jefferson curl light, RDL), heuristic.

### safety

- **rules**: Stretch to mild tightness/slight discomfort only, never sharp pain (ACSM). No bouncing for beginners (ballistic is less effective per Thomas 2018; safety framing heuristic). Warm muscles first.
- **seeDoctorFirst**: Recent joint surgery, hypermobility syndromes, acute back pain with neurological symptoms, or osteoporosis (avoid loaded forward flexion), heuristic/unverified list.
- **stopAndSeekHelp**: Numbness, tingling or shooting pain down a limb during a stretch: stop and get it checked (heuristic).

### weekStructure (by days/week)

- **2**: full-body mobility 20 min | full-body mobility 20 min | + daily 5-min hamstring/hip 'micro' stretch on other days
- **3**: mobility A (posterior chain) | mobility B (hips/spine/shoulders) | mobility A
- **4**: mobility A | mobility B | mobility A | mobility B
- **5**: A | B | A | B | A
- **6**: A | B | A | B | A | B / yoga-style flow
- **notes**: For a single-region goal (touch toes) the target muscles get ≥5 exposures a week even on 2-3 day plans, via 5-min micro-sessions (Thomas 2018 frequency finding).

### Session templates

#### Touch-Your-Toes (Posterior Chain) (`mob_posterior_chain`, mobility)
*Use when:* hamstring/sit-and-reach goals

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| Gentle warm-up (march, leg swings) | 1 | 3-5 min |  |  |
| Supine hamstring stretch with strap | 3 | 30 s per leg | mild tightness, not pain |  |
| Seated forward fold (sit-and-reach position) | 2 | 30 s |  |  |
| Hamstring contract-relax (PNF) | 2 | 5 s press + 20 s stretch per leg |  |  |
| Standing calf stretch (wall) | 2 | 30 s per leg |  |  |
| Figure-4 glute stretch | 2 | 30 s per side |  |  |
| Cat-cow | 1 | 8 |  |  |

#### Hips, Spine & Shoulders (`mob_hips_spine_shoulders`, mobility)
*Use when:* general mobility, posture/back goals

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| Kneeling hip flexor stretch | 2 | 30 s per side |  |  |
| Thoracic open-book rotation | 1 | 8 per side |  |  |
| Doorway chest stretch | 2 | 30 s |  |  |
| Sideways bend (standing) | 1 | 3 per side, 2 s hold |  |  |
| Neck rotation (seated) | 1 | 3 per side, 5 s hold |  |  |
| Child's pose with side reach | 1 | 30 s per side |  |  |
| Wall angels | 2 | 8 |  |  |

#### 5-Minute Micro Stretch (`mob_micro_5min`, mobility)
*Use when:* extra daily exposures to reach ≥5 days/week

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| Standing hamstring stretch (heel on step) | 2 | 30 s per leg |  |  |
| Ragdoll forward hang (knees soft) | 2 | 30 s |  |  |
| Calf stretch (wall) | 1 | 30 s per leg |  |  |

#### Posture Reset (`mob_posture_desk`, mobility)
*Use when:* 'improve posture / back health' goal, desk workers; pair with Pilates back-care

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| Chin tucks | 2 | 10 |  |  |
| Band pull-apart | 2 | 12-15 |  | strength |
| Prone Y-T raises | 2 | 8 each |  | strength |
| Hip flexor stretch | 2 | 30 s per side |  |  |
| Glute bridge | 2 | 12 |  | strength |
| Thoracic extension over chair/foam roller | 1 | 60 s |  |  |

### Sources

- [ACSM 2011 guidelines summary (Garber et al.) Table 3 flexibility](https://www.unm.edu/~lkravitz/Article%20folder/ACSMGuidelinesUNM.pdf), Len Kravitz, UNM. *Used:* holds, reps, 60 s volume, frequency, PNF, no injury link. *Verification:* fetched (PDF text extracted)
- [ACSM Position Stand 2011](https://pubmed.ncbi.nlm.nih.gov/21694556/), Garber CE et al.. *Used:* 60 s per exercise ≥2 d/wk. *Verification:* abstract fetched via Europe PMC API
- [The Relation Between Stretching Typology and Stretching Duration: The Effects on Range of Motion](https://pubmed.ncbi.nlm.nih.gov/29506306/), Thomas E et al., Int J Sports Med 2018. *Used:* ≥5 min/week, ≥5 d/wk, static > PNF/ballistic. *Verification:* abstract fetched via Europe PMC API
- [The effect of time and frequency of static stretching on flexibility of the hamstring muscles](https://pubmed.ncbi.nlm.nih.gov/9327823/), Bandy WD, Irion JM, Briggler M, Phys Ther 1997. *Used:* 30 s, 5 d/wk, 6 wk; no extra gain from 60 s or 3×/day. *Verification:* abstract fetched via Europe PMC API
- [CPAFLA 3rd ed. Table 4-15: Trunk forward flexion (sit-and-reach) norms](https://www.lsuhsc.edu/administration/wellness/docs/Trunk%20Forward%20Flexion.pdf), Canadian Society for Exercise Physiology (via LSU Health). *Used:* age/sex norm bands, 26 cm zero box. *Verification:* fetched (PDF text extracted)
- [Flexibility exercises](https://www.nhs.uk/live-well/exercise/strength-and-flexibility-exercises/flexibility-exercises/), NHS. *Used:* neck rotation, neck stretch, sideways bend, calf stretch reps/holds. *Verification:* fetched

---

## older-adults

Stay active over 60/65: WHO 150-300 min moderate, strength ≥2 days, and multicomponent balance+strength ≥3 days/week. Falls-prevention core uses the Otago programme (3×/week ~30 min strength+balance, walk ≥2×/week). Tested with the 30-s chair stand, 5× sit-to-stand and the four-test balance scale.

### Benchmarks

| id | label | unit | how to test |
|---|---|---|---|
| `chair_stand_30s` | 30-second chair stand | reps | Armless 43 cm (17 in) chair against a wall. Sit mid-seat, feet flat shoulder-width, arms crossed at the chest. Count full stands in 30 s, sitting fully each time; more than halfway up at the bell counts. Using arms = 0. Allow 1-2 practice reps (SRALab, Rikli & Jones). |
| `five_sts_s` | Five-times sit-to-stand | seconds | Straight-backed armless chair against a wall, arms folded. Stand up and sit down 5 times as fast as safely possible; record the time (max 2 min allowed). Otago baseline test (Guralnik 1994). |
| `four_stage_balance` | Four-test balance scale | highest stage held 10 s (0-4) | Barefoot, no aids, no practice: (1) feet together, (2) semi-tandem, (3) tandem (heel-to-toe), (4) one-leg stand. Hold each 10 s before progressing. Stop if feet move, support is needed, or the person touches the wall. Have a helper or a wall/counter within reach for safety (Otago appendix). |
| `walk_minutes_week` | Walking per week | min/week | Self-report or HealthKit. |
| `falls_last_12m` | Falls in the past 12 months | count | Self-report. Any fall → see safety (GP check) and supported-only balance work. |

### norms

- **chairStand30s_25th_75th_percentile**:
  - **source**: Rikli & Jones 1999 (n=7,183, ages 60-94), via SRALab
  - **women**:
    - **60-64**:
      - 12
      - 17
    - **65-69**:
      - 11
      - 16
    - **70-74**:
      - 10
      - 15
    - **75-79**:
      - 10
      - 15
    - **80-84**:
      - 9
      - 14
    - **85-89**:
      - 8
      - 13
    - **90-94**:
      - 4
      - 11
  - **men**:
    - **60-64**:
      - 14
      - 19
    - **65-69**:
      - 12
      - 18
    - **70-74**:
      - 12
      - 17
    - **75-79**:
      - 11
      - 17
    - **80-84**:
      - 10
      - 15
    - **85-89**:
      - 8
      - 14
    - **90-94**:
      - 7
      - 12
- **chairStand30s_independenceStandard**:
  - **source**: Rikli & Jones 2013 criterion standards for keeping physical independence, via SRALab
  - **women**:
    - **60-64**: 15
    - **65-69**: 15
    - **70-74**: 14
    - **75-79**: 13
    - **80-84**: 12
    - **85-89**: 11
    - **90-94**: 9
  - **men**:
    - **60-64**: 17
    - **65-69**: 16
    - **70-74**: 15
    - **75-79**: 14
    - **80-84**: 13
    - **85-89**: 11
    - **90-94**: 9

### levelPlacement

- **levels**:
  - level: supported; rule: chair_stand below the 25th percentile for age/sex, OR uses arms (score 0), OR balance stage ≤2, OR a fall in the last 12 months; plan: Otago-style with support at all times, seated/supported exercises, NHS chair-based
  - level: standard; rule: chair_stand within the 25th-75th percentile and balance stage 3; plan: Otago progression + walking + NHS strength/balance
  - level: active; rule: chair_stand above the 75th percentile, balance stage 4, already ≥150 min/week; plan: general-fitness/Pilates with balance add-ons; vigorous is OK if already active (NHS)
- **basis**: Percentile bands from Rikli & Jones; mapping is a heuristic.

### improvementModel

- **evidence**:
  - Otago: individually prescribed leg strength + balance exercises, 3×/week (~30 min) plus walking ≥2×/week, cut falls and fall injuries by 35% across 4 trials (n=1,016, ages 65-97). It worked best in people aged 80+ and those with a prior fall. Chair stand and balance scores improved.
  - Cochrane 2019 (108 RCTs, 23,407 people): exercise lowers the rate of falls by 23% and the number of fallers by 15% (high certainty). Balance and functional exercise alone gave about a 24% rate reduction. Programmes mixing balance, functional and resistance work were ~34%, though that 34% figure came from a search snippet and is unverified.
  - A later UK trial (ProAct65+) found Otago less effective in more functionally able older adults (search result; unverified). So 'active' users get more challenging multicomponent work.
- **rate**: No sourced weekly chair-stand gain. Somax heuristic: +1 rep per 2 weeks for supported/standard users over the first 12 weeks (unverified). Target: reach the Rikli & Jones independence standard for age/sex first.
- **maintenance**: Benefits need ongoing exercise; Otago says the exercises must be kept up to sustain the gains.

### planLengthRule

- **formula**: Default first block 8 weeks (Otago visits at weeks 1, 2, 4, 8), then a 6-month review cadence. For a chair-stand goal: weeks = clamp((target − current) × 2, 8, 12). If the gap is > 6 reps, milestone 1 = 25th percentile, milestone 2 = independence standard, milestone 3 = 75th percentile.
- **minWeeks**: 8
- **maxWeeksPerBlock**: 12
- **milestoneSplitting**: Balance: progress one stage of the four-test scale per milestone. Strength: progress after 2 sets of 10 are comfortable (Otago rule). Re-test every 4 weeks.

### volumeModel

- **guidelines**: WHO: all adult recommendations (150-300 min moderate or 75-150 vigorous; strength ≥2 d) plus varied multicomponent activity stressing functional balance and strength at moderate+ intensity on ≥3 days/week. NHS 65+: be active daily, even if lightly; strength, balance and flexibility ≥2 days; break up sitting.
- **otagoDose**: 3 sessions/week of ~30 min with rest days between, each starting with 5 min gentle warm-up. Sessions can be split up through the day. Walk up to 30 min at usual pace ≥2×/week if safe, which can be 3×10 min. Walking alone does not reduce falls.
- **strengthLoading**: Otago: choose the ankle-cuff weight that allows 8-10 good reps before fatigue (age 80+ usually 1-2 kg; trials went up to 8 kg). Lift 2-3 s, lower 4-5 s, rest 1-2 min between sets. Progress weight or sets once 2×10 are achieved. Keep it moderate, not exhausting. ACSM: beginners 40-50% 1RM, 10-15 reps, single set. Power work at 20-50% 1RM for older adults.
- **flexibility**: Static holds of 30-60 s for older adults (ACSM 2011).
- **neuromotor**: Balance/agility/gait work ≥2-3 days/week, ≥20-30 min (ACSM 2011).

### safety

- **seeDoctorFirst**:
  - Haven't exercised for a while, or have medical conditions/concerns (NHS 65+).
  - Any fall in the past year: see a doctor (Otago advises a doctor visit after any fall), and do all balance work with support until reviewed.
  - Painful conditions such as rheumatoid or osteoarthritis: work in a pain-free range (Otago).
- **stopAndSeekHelp**: Stop and contact a doctor for dizziness, chest pain, breathlessness (unable to speak), or muscle pain that won't stop (Otago).
- **appRules**:
  - Hold only stable objects (bench/solid table), never a chair that can move, unless the exercise says so (Otago booklet).
  - After illness, check in before restarting (Otago). App: show a 'returning after illness' easy week.
  - Start light. Otago notes that starting light cuts soreness and dropout; mild stiffness at first is normal.
  - Balance tests and unsupported balance exercises only with a wall/counter within reach. Never prescribe unsupported balance to 'supported' level users.

### weekStructure (by days/week)

- **2**: Strength & balance (Otago-style) + 10 min walk | Strength & balance + 10 min walk | advise daily light activity and walks on other days
- **3**: Strength & balance | Walk 20-30 min | Strength & balance | (walk any other day)
- **4**: Strength & balance | Walk | Strength & balance | Walk + flexibility
- **5**: Strength & balance | Walk | Strength & balance | Walk + flexibility | Strength & balance
- **6**: Strength & balance | Walk | Strength & balance | Walk + flexibility | Strength & balance | Longer walk / tai chi-style flow
- **notes**: To meet WHO's ≥3 multicomponent days, 2-day users get balance 'snacks' (heel-to-toe walk, one-leg stand at the counter) on 1+ other days. Strength & balance sessions are not back-to-back (Otago 'rest days between').

### Session templates

#### Strength & Balance (NHS) (`oa_nhs_strength_balance`, strength-balance)
*Use when:* supported/standard; first weeks; needs a sturdy armless chair and a wall/counter

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| Warm-up: march on the spot | 1 | 2-5 min | gentle |  |
| Sit-to-stand (no hands if possible) | 1 | 5 |  | strength |
| Mini-squats holding chair back | 1 | 5 |  | strength |
| Calf raises holding chair | 1 | 5 |  | strength |
| Sideways leg lift holding chair | 1 | 5 per leg |  | strength |
| Leg extension (back leg lift) holding chair | 1 | 5 per leg, up to 5 s hold |  | strength |
| Wall press-up | 3 | 5-10 |  | strength |
| Biceps curl (water bottles) | 3 | 5 per arm |  | strength |
| Sideways walking | 1 | 10 steps each way |  | balance |
| Heel-to-toe walk (wall nearby) | 1 | ≥5 steps |  | balance |
| One-leg stand (fingertips on wall) | 3 | 5-10 s per side |  | balance |

#### Otago-Style Falls Prevention (`oa_otago_style`, strength-balance)
*Use when:* any fall history, age 80+, or supported level; progress balance from holding support → no support

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| Warm-up flexibility (neck, trunk, ankle movements) | 1 | 5 min | gentle |  |
| Front knee strengthening (seated knee extension, ankle cuff) | 2 | 8-10 per leg | cuff weight allowing 8-10 good reps; 2-3 s up, 4-5 s down | strength |
| Back knee strengthening (standing knee curl, cuff) | 2 | 8-10 per leg |  | strength |
| Side hip strengthening (standing leg out to side, cuff) | 2 | 8-10 per leg |  | strength |
| Calf raises - hold support | 1 | 10-20 |  | strength |
| Toe raises - hold support | 1 | 20 |  | strength |
| Knee bends / mini-squats - hold support | 1 | 10 |  | balance |
| Backwards walking (support nearby) | 1 | 10 steps × 4 |  | balance |
| Sideways walking | 1 | 10 steps × 4 |  | balance |
| Tandem stance (heel-to-toe) - hold support | 1 | 10 s per side |  | balance |
| Tandem walk | 1 | 10 steps × 2 |  | balance |
| One-leg stand - hold support | 1 | 10 s per side |  | balance |
| Sit-to-stand | 1 | 5-10 |  | balance |
| Rest between sets | 1 | 1-2 min |  | recover |

> Only 'front knee strengthening' and 'toe raises - hold support ×20' were confirmed by name in the extracted Otago manual text. The other exercise names follow the published Otago list, and their reps/levels (Table 4 is an image) are unverified.

#### Walking Plan (`oa_walk`, cardio)
*Use when:* all levels, ≥2×/week on non-strength days

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| March on the spot warm-up | 1 | 2 min |  |  |
| Walk at usual pace (heel lands first, look ahead) | 1 | 10-30 min (or 3×10 min) | comfortable → moderate (talk, not sing) |  |
| March on the spot warm-down | 1 | 2 min |  |  |

#### Gentle Flexibility (NHS) (`oa_flexibility`, mobility)
*Use when:* after walks, ≥2×/week

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| Neck rotation (seated) | 1 | 3 per side, 5 s hold |  |  |
| Neck stretch (seated) | 1 | 3 per side, 5 s hold |  |  |
| Sideways bend (standing) | 1 | 3 per side, 2 s hold |  |  |
| Calf stretch at wall | 1 | 3 per side (30-60 s holds per ACSM for older adults) |  |  |

#### Active Agers Multicomponent (`oa_active_multicomponent`, strength-balance)
*Use when:* 'active' level (above the 75th percentile), already ≥150 min/week

| exercise | sets | reps | intensity | group |
|---|---|---|---|---|
| Goblet squat to chair | 2 | 10-15 | moderate | strength |
| Step-up (rail nearby) | 2 | 5-10 per leg |  | strength |
| Dumbbell row | 2 | 10-15 |  | strength |
| Wall/incline push-up | 2 | 10-15 |  | strength |
| Fast sit-to-stand (power) | 2 | 5-8 | light (20-50% 1RM equivalent), fast up | power |
| Grapevine | 1 | 5 cross-steps per side |  | balance |
| Heel-to-toe walk, eyes forward, no support | 2 | 10 steps |  | balance |
| One-leg stand with head turns | 2 | 10-20 s per side |  | balance |

### Sources

- [WHO 2020 guidelines on physical activity and sedentary behaviour](https://pmc.ncbi.nlm.nih.gov/articles/PMC7719906/), Bull FC et al.. *Used:* older-adult multicomponent ≥3 d/wk. *Verification:* fetched
- [Physical activity guidelines for older adults](https://www.nhs.uk/live-well/exercise/exercise-guidelines/physical-activity-guidelines-older-adults/), NHS. *Used:* daily activity, 150/75, strength-balance-flex ≥2 d, falls, see GP. *Verification:* fetched
- [Otago Exercise Programme to prevent falls in older adults (manual)](https://regionvasterbotten.se/VLL/Filer/Otago-Exercise-Programme2.pdf), Campbell AJ, Robertson MC et al., ACC New Zealand 2003/2007. *Used:* dose, cuff weights, tempo, progression rule, walking plan, tests, safety, 35% result. *Verification:* fetched (PDF text extracted; Table 4 is an image, so levels/reps there are unverified)
- [Exercise for preventing falls in older people living in the community](https://pubmed.ncbi.nlm.nih.gov/30703272/), Sherrington C et al., Cochrane 2019. *Used:* 23% fewer falls, 15% fewer fallers. *Verification:* abstract fetched via Europe PMC API (truncated; 24%/34% from search snippet)
- [30 Second Sit to Stand Test](https://www.sralab.org/rehabilitation-measures/30-second-sit-stand-test), Shirley Ryan AbilityLab Rehabilitation Measures. *Used:* protocol, Rikli & Jones norms and independence standards. *Verification:* fetched
- [Strength exercises](https://www.nhs.uk/live-well/exercise/strength-and-flexibility-exercises/strength-exercises/), NHS. *Used:* exercise list, reps, progressions. *Verification:* fetched
- [Balance exercises](https://www.nhs.uk/live-well/exercise/strength-and-flexibility-exercises/balance-exercises/), NHS. *Used:* exercise list, reps, holds, safety. *Verification:* fetched
- [Flexibility exercises](https://www.nhs.uk/live-well/exercise/strength-and-flexibility-exercises/flexibility-exercises/), NHS. *Used:* gentle stretch list. *Verification:* fetched
- [ACSM 2011 guidelines summary tables](https://www.unm.edu/~lkravitz/Article%20folder/ACSMGuidelinesUNM.pdf), Len Kravitz, UNM. *Used:* older-adult loads (40-50% 1RM, 20-50% power), 30-60 s stretches, neuromotor. *Verification:* fetched (PDF text extracted)
- [ProAct65+ cluster RCT (Otago vs FaME in UK general practice)](https://nottingham-repository.worktribe.com/output/829197), Iliffe S et al.. *Used:* Otago less effective in fitter older adults. *Verification:* unverified (search-result summary only)

---

## Open questions

- Protein and macro targets during a deficit were not researched. A nutrition expert pass is needed before Somax shows macros.
- Push-up and plank norms conflict between sources (CSEP vs ACSM tables; plank norms exist only for athletic 18-25-year-olds). The current design uses the user's own baseline rather than population ratings.
- Weekly improvement rates for push-ups, plank, sit-and-reach and chair stand are heuristics (10%/wk, 1 cm/wk, +1 rep/2 wk). Calibrate them from logged Somax data.
- The Otago Table 4 level/rep progression is an image in the manual and was not extracted. If Somax wants a faithful Otago clone, get the official ACC/Later Life Training levels.
- NICE NG246 and the full ACSM HIIT brochure could not be fetched (403/DNS). Their figures are marked unverified.
- The waist measurement method, the 220-age HRmax formula, osteoporosis/pregnancy Pilates contraindications and the PAR-Q+ item wording are unverified. A clinician should review the safety copy before launch.
- Should Somax gate HIIT behind a hard prerequisite (20 min continuous cardio + clean screen) or just warn? The design currently gates.
