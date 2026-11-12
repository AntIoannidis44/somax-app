# Endurance expansion: cycling, swimming, hybrid

Compiled 2026-11-13. All ids use the prefix `x-end-`.

**Files**
- `end-sourced.json`: 86 credited sessions, all `verified: true`.
- `end-somax.json`: 63 original Somax sessions, all `verified: false`, each with `basedOn`.
- Generators: `tools/gen_end_sourced.py` and `tools/gen_end_somax.py`.
- Validator: `tools/validate_end.py`.

Edit the generators and re-run them. Don't hand-edit the JSON:

```
python3 tools/gen_end_sourced.py expansion/end-sourced.json
python3 tools/gen_end_somax.py expansion/end-somax.json
python3 tools/validate_end.py .
```

**What the validator checks**
- Both files parse, and every required field is present.
- Enums are valid: category, level, sport, goals and lifestyle.
- `howToRun` has exactly 4 items.
- `duration` equals `sessionMinutes`.
- Exercises use only the allowed keys, with `sets` as an int and `reps` as a string.
- Every series entry has `day` and `daysInSeries`.
- Ids are unique, start with `x-end-`, and don't clash with ids in the main library.
- Every `basedOn` id exists in `sourced-programs.json` or `end-sourced.json`.
- No two sessions share a name or an identical exercise list (including sets and reps).

Current result: **0 errors**.

## Coverage

Each cell shows credited / Somax sessions.

| Sport | Beginner | Intermediate | Advanced | Total |
|---|---|---|---|---|
| Cycling | 7 / 8 | 8 / 8 | 9 / 5 | 45 |
| Swimming | 12 / 10 | 27 / 8 | 15 / 6 | 78 |
| Hybrid | 0 / 6 | 5 / 9 | 3 / 3 | 26 |
| **Total** | 19 / 24 | 40 / 25 | 27 / 14 | **149** |

These are on top of what the main library already has: 2 British Cycling, 3 USMS and 1 HYROX simulation credited, plus 2 cycling, 2 swim and 2 hybrid Somax originals.

**Gap coverage by request**

*Cycling*
- Indoor trainer sessions: 18 British Cycling sessions, plus the Somax First Ride, First Intervals, Sweet Spot 45, Threshold, VO2 and Time-Crunched sessions.
- Gym spin bike: Somax Gym Spin 45.
- Outdoor:
  - Cycling UK steady and interval rides.
  - Somax Explorer, Hill Repeats, Sprint Starts, Endurance 90 and the 3 h Long Ride.
- Each training type:
  - Endurance: Zone Build, Endurance 90, Long Ride.
  - Tempo: BC Tempo.
  - Sweet spot: BC SS Intervals, BC 3x10, Somax SS 45.
  - Threshold: BC Pyramid 1, BC Under/Over, Somax 4x8 and 3x15.
  - VO2: BC Improvers and Ramped VO2, Somax 6x2 and 30/30s.
  - Sprints: BC Russian Steps, Pyramid 2, Geared Pyramid, Neuromuscular and 20/40s, plus Somax Sprint Starts.
  - Cadence: BC Spin Out and Leg Speed, Somax Pedalling Skills.
  - Torque: BC Big Gear.
- FTP tests: CTS 20-min, 2x8 and ramp.
- Strength and mobility: Somax gym, home, advanced power and mobility sessions.
- Older adults: Somax Gentle Ride.
- Session lengths run from 15 to 180 min, with most between 30 and 90 min.

*Swimming*
- Learn-to-lap progression: the Somax Lap Builder series, 4 stages from 50 m reps to 400 m non-stop. It follows on from the existing Swim Confidence Builder.
- Technique and drills:
  - Somax: Breathing & Rotation, Kick & Body Position, Breaststroke, Catch & Pull.
  - USMS: Use Toys (butterfly), Improve Your Stroke (backstroke), Try New Things (IM).
- CSS work:
  - Swim Smooth CSS Test and Goldilocks.
  - Somax CSS Starter 50s, CSS 10x100, Threshold 300s, Above-CSS 50s and Steady 400s.
- Endurance:
  - Swim Serpentine sets.
  - USMS 2,000 yd and 1-mile series.
  - MSQ 300s, 40x50 and the Easy/Fast ladder.
  - Somax 1,500 m Builder.
- Open water:
  - USMS open-water adapted sets.
  - USA Swimming Gemmell and Kase sessions.
  - Somax OW Skills in the Pool, First Open-Water Swim and OW Race Prep.
- Triathlon swim: MSQ Triathlete and Somax Sprint Tri Swim Prep.
- Dryland: 4 USMS sessions (mobility, band home, upper body, freestyle strength/power), plus Somax gym and advanced power.
- Older adults: Somax Easy Lengths for Joints.
- Somax sessions use metres in a 25 m pool and run 20–60 min. Sourced sessions keep their published units.

*Hybrid*
- HYROX station work:
  - Somax Station Technique (beginner) and Station Strength.
  - Wall Ball & Lunge Endurance.
  - Dearden sessions.
- Compromised running:
  - Somax Compromised Run Primer and Threshold Runs + 100 Wall Balls.
  - Dearden 3x15 AMRAP.
- Engine work: Somax Run + Erg Intervals and the Dearden 45-min AMRAP.
- Simulation: Somax Half Simulation. The full simulation already exists in the main library.
- Race week: Somax Race-Week Opener.
- No-sled gym and home versions: Somax Basic Gym, Somax Home Hybrid Starter and the Dearden 10m shuttle.
- Strength and recovery: Somax Hybrid Strength Foundations and Recovery Flow.
- Triathlon and duathlon bricks: First Brick, Race-Pace Brick, Brick Repeats, Gym Triathlon, Sprint Tri Dress Rehearsal and Run-Bike-Run.

## Sources used

We copied only facts: efforts, durations, distances, cadence and zone targets, send-offs and loads. Descriptions, `whoItsFor` and `howToRun` are written in Somax's own words. Every sourced page or PDF was fetched and read on 2026-11-13.

| Source | Count | URL(s) | Notes |
|---|---|---|---|
| British Cycling indoor trainer session PDFs | 18 | `britishcycling.org.uk/zuvvi/media/bc_files/sportivetrainingplans/...` (one per entry) | See note 1 below. |
| Cycling UK 10-week 100 km plan | 3 | cyclinguk.org/article/10-week-training-plan-100km-ride | See note 2 below. |
| CTS (Chris Carmichael) FTP tests | 3 | trainright.com/?p=27294 | See note 3 below. |
| U.S. Masters Swimming articles | 34 | See below this table | See note 4 below. |
| USA Swimming Open Water Workout Examples PDF | 2 | usaswimming.org/docs/.../open-water-workout-examples.pdf | See note 5 below. |
| London Marathon Events, Swim Serpentine one-mile pool plan | 4 | londonmarathonevents.co.uk/.../one-mile-pool-training-plan.pdf | See note 6 below. |
| Swim Smooth (Paul Newsome), Feel For The Water blog | 2 | swimsmoothtips.blogspot.com/2014/04/css-training-for-absolute-beginners.html | CSS test protocol and the Goldilocks set. |
| Masters Swimming Queensland training programs | 12 | mastersswimmingqld.org.au/coaching/training-programs/ (sets 35–40 and 51–60 PDFs) | See note 7 below. |
| Jake Dearden, HYROX Master Trainer, #WOTW on Built for Athletes | 8 | builtforathletes.com/blogs/news/wotw-jake-dearden-hyrox-... | See note 8 below. |

The USMS sessions come from these articles:
- 5 Best 30-minute
- Best for Beginners
- 5 Best 2,000-yard
- 5 Best 1-Mile
- Best for Masters
- Best for Weight Loss
- Best for Strong Abs
- Pool Sets Adapted for Open Water
- Four dryland articles by Bo Hickey

Notes on each source:
1. **British Cycling:** the HTML index page returns 403. A Wayback Machine snapshot (2023) listed the PDF filenames, and every PDF was then fetched live from britishcycling.org.uk.
2. **Cycling UK:** the plan has more sessions than we used. The easy rides and the long ride were too trivial to record as sessions. Copyright © CTC.
3. **CTS:** the source doesn't say how long to warm up, so the warm-up line is labelled as a Somax suggestion.
4. **USMS:** distances are in yards, as published, matching the existing USMS entries. Two of the 30-min swims and the Beginner "Breathe" swim were already in the library, so we didn't add them again.
5. **USA Swimming:** the PDF dates from 2020 and carries COVID-era notes. It's written for club squads with kayak or escort cover.
6. **Swim Serpentine:** the main sets, contrast set and drills are as published. The warm-up and warm-down have no distances in the source, so ours are labelled Somax suggestions.
7. **MSQ:** the page says the programs "may be used by individuals training on their own, a coach or by members of a club", and the PDFs say "feel free to modify". Distances are in metres. Where the PDF's "approx. X km" label doesn't match the listed sets, we used the real total and noted it in `sourceNote`.
8. **Jake Dearden / Built for Athletes:** this is a brand blog that names the coach. Dates are recorded in `sourceNote`. HYROX Series 4 and "Jake Dearden Series" (June 2025) are the same workout, so we included it once.

## Skipped, and why

**Login, paywall or members-only**
- **Swim England Swimming Fitness Training Plan:** members-only. Session 1 is a free teaser but needs registration. The swim fitness cards on third-party leisure-centre sites are reproductions with unclear licensing, so we left them out.
- **Triathlete.com 8-week sprint plan:** redirects to an Outside login.
- **USMS Workout Library and six-week plans:** members-only. The public "sample fitness series" page gave only summaries, not full sets.

**Blocked or unreachable**
- **AusTriathlon "Starting Line" program:** 403.
- **The old Triathlon Australia archive:** connection refused.
- **AusCycling:** no free sessions found.
- **Red Bull HYROX 3-days-a-week:** 403 and an empty page.
- **The British Cycling index page:** 403. We got around this through the archived list of filenames.

**No workouts on the page**
- **hyrox.com:** describes the race format only. There are no training sessions, and the page says "All rights reserved".
- **Swimming Australia, Swimming Victoria, Swimming NSW:** no public workout PDFs found.
- **The Masters Swimming Australia 50x50x50 PDFs:** blank templates.

**Not confident in the source or its author**
- **PureGym HYROX plan:** the author is a gym PT, not described as a HYROX partner. The fetch tool would only summarise it, so we couldn't transcribe it confidently.
- **FitnessVolt HYROX plan:** third-party; already used only as a playbook reference.
- **Built for Athletes posts with no coach credit** ("Hybrid 30", "Triathlon Brick Workout"): no named coach.
- **The Velites HYROX program:** gated download.

**Could not transcribe with confidence**
- **The British Cycling beginner plan overviews:** weekly schedules only, with no session structures.
- **MSQ multi-level programs (1–34, 41–50, 61–100):** three-column level tables don't extract cleanly. Programs 81–100 are also broken files on the server.
- **USMS "Quick Turns" and "Rotate" (abs article):** the listed sets don't add up to the stated totals, which suggests text is missing.

**Safety**
- **USMS "Breathing Workout":** no-breath sprint 25s. The article itself warns about shallow-water blackout.
- **MSQ sets 57 and 58:** dive starts, which many public pools ban.
- **MSQ set 54:** includes a pre-pool run warm-up that doesn't fit a single swim session.

**Too long or redundant**
- **USMS weight-loss "Low Intensity":** 6,100 yd, about 2 h. It's too long for a typical app session and its structure is close to the "Moderate" swim.

## Licensing caveats

1. **Brands:** HYROX®, British Cycling, USMS, Swim Smooth, CTS and Swim Serpentine are named only to credit the source, which is nominative use. Don't imply endorsement, and always link out.
2. **No open licences:** apart from MSQ's explicit permission to use its programs, none of these pages carry an open licence. We stored only workout facts, which aren't copyrightable as such, and wrote all the prose ourselves. Re-check terms before any marketing use.
3. **HYROX weights:** Somax entries use the Open standards from the playbook (hyrox.com): sled push 152/102 kg, sled pull 103/78 kg, farmers carry 2×24/16 kg, sandbag 20/10 kg and wall ball 6/4 kg. Dearden's posts use other weights in places (wall balls 9/6 kg, 20/14 lb), and those are recorded as published. Confirm weights per season and division.
4. **Open-water safety:** every open-water entry says to swim only between the flags at a patrolled beach or at an organised or supervised venue, never alone. Several sources don't say this themselves, and the sourceNotes mark it as a Somax rule.

## What we learned (used to design the Somax originals)

**Cycling**
- **Shared warm-up:** British Cycling builds every session on a standard 20-min warm-up (cadence ladder plus 6 s rev-outs).
- **Clear on-ramp:** Zone Build → Tempo 3×10 → Sweet-Spot Intervals (5,5,3,3,3,3,3) → 3×10 → 2×20. Somax filled the steps *below* that ladder (First Ride 30, First Intervals 40) and the time-crunched gaps (SS 45, Time-Crunched 30).
- **"Why" and "when":** each BC session states both. Neuromuscular work is for the end of the off-season, 20/40s for the final build-up, Spin Out for tapers. We put the same timing guidance into each `howToRun`.
- **Progress duration before intensity:**
  - BC Sweet-Spot Intervals grow 3-min reps into 5-min reps.
  - BC Big Gear starts at 4 reps and builds to 6.
  - Swim Smooth grows the Goldilocks set from Baby to Papa.
  - The Somax progressions copy this pattern.
- **Low-cadence work:** BC says to skip it if you have knee pain. That caution is in Somax Pedalling Skills and Big Gear-style work.
- **Cycling UK's outdoor beginner cues:** easy means you can chat, steady means short sentences, harder means out of breath. Somax used this talk test wherever we can't assume the rider has a power meter.

**Swimming**
- **Structure:** every source uses warm-up → drill → main → contrast or kick → warm-down. Serpentine names the contrast set explicitly.
- **Masters material:** written in send-offs ("on 1:30"). Beginners need rest-based instructions instead, so Somax beginner sessions use "rest 20–30 s".
- **Distance builds through short-rest reps:** 10×100 → 1,000 m, and 5×400 broken down from 16×25 to a straight 400. The Lap Builder series and the 1,500 m Builder are built the same way.
- **CSS work:** CSS pace, steady at +6 s and easy at +8–10 s have been verified. Any faster zone, such as "CSS −2 to −3 s", is marked as a guide only (it's unverified in the playbook).
- **Breath-holding:** USMS explicitly warns against using breath-control sets as distance challenges. Somax never prescribes breath-holding, and underwater work always says to surface when needed.
- **Open water:** the open-water sources are all club or squad sessions with escort cover. A gap existed for a *first* open-water swim for an individual, and Somax filled it with Australian beach-safety framing (swim between the flags, cold water shock).

**Hybrid**
- **Building blocks:** Dearden's sessions follow a consistent pattern: a strength block (squat or deadlift) plus a station conditioning block, either an EMOM, a 4 on / 2 off round or an AMRAP, with race weights or above. They are mostly intermediate to advanced. **There was no free credited beginner HYROX session**, so Somax added Station Technique, Home Hybrid Starter and Strength Foundations.
- **Small-space and no-sled versions:** practical options exist, such as Dearden's 10 m shuttle and the motor-off treadmill push. Somax added a Basic Gym (no sled) session.
- **Bricks:** no free bricks from a reputable, named-coach source were found, so all the triathlon and duathlon bricks are Somax originals. They follow the playbook template: bike 40–60 min, transition under 3 min, run 15–20 min Z2, building to race pace.

## Open items

- **HYROX weights:** confirm the current season's standards in the official rulebook before labelling anything "official".
- **Re-check later:** AusTriathlon's Starting Line PDF and AusCycling, from a browser. Both were blocked to our fetcher and would add Australian credited content.
- **More MSQ programs:** a human could transcribe MSQ's multi-level programs (1–34, 41–50, 61–80) by reading the PDFs directly. That would add about 60 more credited, metric, Australian sessions with explicit permission to use.
