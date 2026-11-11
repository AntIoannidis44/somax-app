# AFL (Australian rules football) playbook

The machine-readable version is `afl.json` in this folder. The library programs are in `../afl-programs.json`. Researched 2026-11-12.

## How to read the labels

- **Verified**: read on a fetched page or PDF listed under Sources. For the Prep to Play posters, we rendered the poster to an image and read it directly.
- **UNVERIFIED**: seen only in a search snippet or secondary write-up, or it's a Somax coaching convention.
- **DERIVED**: our own arithmetic on verified numbers.
- **Shared rules** come from `sports.json` (football section), which is already verified. They aren't repeated here. They cover the Haugen sprint table, NSCA plyometric contacts and periodisation, Rønnestad's in-season strength finding, Yo-Yo and beep protocols, and the Nordic meta-analysis.

## Library programs (`afl-programs.json`, 41 entries)

### Credited public programs (29 entries, all `verified: true`)

| Series | Publisher | Entries | Levels | Licence / notes |
|---|---|---|---|---|
| FootyFirst Levels 1-5 | NoGAPS research team with the AFL | 5 | L1-2 beginner, L3-4 intermediate, L5 advanced | Free manual, read in full from the Australian Army CoVE copy. No reproduction wording found. Warm-up included in every level. |
| Prep to Play Dynamic Warm-up (Option A, Option C) | AFL & La Trobe University | 2 | beginner, advanced | Official play.afl posters. Doses read from the rendered image. |
| Prep to Play Strength (Options A, B, C) | AFL & La Trobe University | 3 | beginner, intermediate, advanced | As above. |
| Musashi AFL Off-season, Pre-season and In-season, Days 1-3 each | Musashi Performance Lab | 9 | 6 intermediate, 3 beginner | See the Musashi caveats below. |
| Rob Jackson's Strength Series A/B | Rob Jackson (AFL Umpires HP Manager), Play AFL | 2 | intermediate | Written for umpires. Free on Play AFL. |
| Rob Jackson's Body Armour A/B/C | as above | 3 | beginner, intermediate, advanced | Post-run prehab circuits. |
| Rob Jackson's Body Weight Flush Recovery | as above | 1 | beginner | Recovery mobility. |
| Rob Jackson's Movement Prep + T1 Drills | as above | 1 | intermediate | Warm-up and running drills. |
| Rob Jackson's Strength Maintenance L1-3 | as above | 3 | beginner, intermediate, advanced | No-equipment circuits. |

Musashi caveats:
- The PDF is a free download from a brand page, and it opened without a login. The site also advertises a members-only area.
- Day 1 of each phase matches the musashi.com page. Days 2-3 are assigned from the PDF's goal headings.
- The PDF's column order (off/pre/in-season) doesn't match the web pages, so we followed the pages.
- The pre-season Day 1 page lists 4 reps for the right-side kneeling sprint start. The PDF lists 3, and we used 3.
- It is commercial content. We copied facts only and kept the link.

### Somax originals (12 entries, `verified: false`, `basedOn` points to the credited ids)

| Level | Programs |
|---|---|
| Beginner (4) | Pre-season Aerobic Base; Game-Day Recovery (MD+1); AFLW Knee-Smart Warm-up (Prep to Play style); Junior AFL Fundamentals |
| Intermediate (6) | 2km Time-Trial Builder; Repeat-Sprint Conditioning; Speed & Agility; Upper-Body & Contact Strength; In-Season Maintenance (1 day); Hamstring & Groin Bulletproofing |
| Advanced (2) | Lower-Body Strength & Power; Advanced Pre-season Running |

**Totals by level across all 41 entries:** 14 beginner, 20 intermediate, 7 advanced.

### Sources looked at but not used

- **Paid programs** weren't reproduced:
  - TrainHeroic, FinalSurge, TrainingPeaks and Payhip AFL plans;
  - Tom Couch's "Off the Couch" club program ($445 per club; only its structure is cited);
  - the Health Project course.
- **Rob Jackson's own site** (robjackson.com.au) blocks automated fetching.
- **Community-club PDFs:** none found that were free to use. The Warrandyte JFC link returned an error page.
- **No source we used forbids reproduction.** None of the fetched documents contained "do not reproduce" wording.

## Benchmarks

### 2 km time trial
- This is the test community clubs actually run.
- The AFL Combine changed from a 3 km run to 2 km in 2017.
- AFLW Combine girls ran 1.6 km in 2026.

### 20 m sprint
- Combine protocol: gates at 5, 10 and 20 m, best of 3 attempts.
- Hand timing isn't comparable with gate timing.

### Yo-Yo IR1
- Replaced the beep test at the Combine in 2017.
- The beep test is the fallback. Never mix the two.

### Vertical jump
- The Combine uses a Vertec for a standing two-foot jump and a running one-foot jump.
- App countermovement-jump (CMJ) scores are a different measure and can't be compared with Combine scores.

### Repeat-sprint test (6 x 30 m, one every 20 s)
- Protocol UNVERIFIED.

### Optional: AFL agility test
- Not in the brief; added as an optional benchmark.
- The course is described (weave around poles), but the dimensions are unverified.

## Level placement (2 km)

| Band | Men | Women |
|---|---|---|
| Elite reference (verified) | Combine record 5:28; recent best 5:59-6:05 | AFLW 2 km record 7:02 (2024) |
| Elite | < 6:30 | < 7:40 |
| Sub-elite | 6:30-7:15 | 7:40-8:30 |
| Community strong | 7:15-8:00 | 8:30-9:30 |
| Community | 8:00-9:00 | 9:30-10:30 |
| Developing | > 9:00 | > 10:30 |

- Band cut-offs below the elite reference are **UNVERIFIED** Somax heuristics.
- Combine figures are verified. They come from the best 18-year-olds in the country, so use them only as the top of the scale.
- No AFL-specific Yo-Yo norms were found on a fetched page, so the app should use the football bands in sports.json.

## Season and match-week rules

### Season calendar
- **Pre-season:** about Nov-Mar (UNVERIFIED for players).
  - Play AFL's umpire plan uses 4-6 weeks of pre-season.
  - SMA recommends at least 4 weeks of pre-season (verified).
- **In-season:** about Apr-Aug (UNVERIFIED for players). Play AFL's umpire plan uses 18-20 weeks.
- Let users enter their own round 1 date.

### Saturday-game week
- **MD+1 (Sunday):** recovery only.
- **MD-4/MD-3 (Tue/Wed):** main strength and speed day.
- **MD-2 (Thu):** club training night, with no extra conditioning.
- **MD-1 (Fri):** rest, or 10-15 min of activation.
- Keep at least 48 h between max sprint or plyometric efforts and the game.
- No alcohol for 48 h before a game (SMA).

### In-season maintenance
- One strength session a week maintains strength.
- Run Copenhagens and Nordics weekly.
- On match day, use the Prep to Play warm-up only.

## Plan length

1. Simulate the 2 km time week by week, with the band-based rate shown below (DERIVED).

   | Band | Weekly improvement |
   |---|---|
   | Developing | 1.0% |
   | Community | 0.7% |
   | Community strong | 0.5% |
   | Sub-elite | 0.35% |
   | Elite | 0.2% |

2. Apply multipliers for phase (in-season x0.3) and for days per week.
3. Round up to 4-week blocks.
4. Limits:
   - minimum 4 weeks, maximum 16;
   - capped by the weeks left until the club time trial or round 1.
5. If the goal is too far away, set a conservative milestone target, then retest and plan the next block.
6. Calibration check: a ~7:30 player gains ~35-45 s in 12 weeks. This matches one provider's claim (unverified) and Daniels' ~1 VDOT per 4-6 weeks.
7. Sprint, jump and Yo-Yo rates come from sports.json.

## Injury prevention (verified)

### FootyFirst
- **Frequency:** at least twice a week, at the start of every session, all year.
- **Session:** about a 5-min warm-up, then about 15 min of hamstring, groin, hip and landing/side-step work.
- **Levels:** five, about 4 weeks (8 sessions) each.
- **Nordic progression by level:** 1x6, 2x5, 2x8, 2x10, 2x12.
- **Evidence:**
  - The manual quotes a meta-analysis of similar programs: -39% lower-limb, -54% acute knee and -50% ankle-sprain injuries.
  - Finch 2019 compared regions over 2 years:

    | Group | Change in hospital-treated lower-limb injuries |
    |---|---|
    | Region where clubs got implementation support | -20.0% |
    | Region without support | +21.5% |
    | Rest of Victoria | +12.6% |

  - Supporting clubs to deliver the program is what made the difference.

### Prep to Play (women and girls)
- **Every training and game:** 10-min warm-up of 8 activities, each with options A, B or C.
- **Every training:** at least 5 min of contact skills, and 3 strength activities taking 5-10 min.
- **Match day:** the warm-up only.
- **Why it matters:**
  - AFLW players had a 9.2x higher ACL risk than AFL men.
  - 70-80% of ACL injuries happen without contact.
- **Evidence:**
  - In the 2026 trial, higher adherence was associated with fewer injuries (IRR 0.95).
  - SMA says programs like this cut lower- and upper-limb injuries by up to 40-60% when done for at least 10 min, twice a week.

### Nordics
- Opar 2015, elite AFL players: eccentric strength below 256 N at the start of pre-season, or 279 N at the end, carried 2.7x and 4.3x the hamstring injury risk.
- An imbalance between legs didn't raise the risk.

### Copenhagen
- Harøy 2019 dose: 3x a week in pre-season, then 1x a week in-season.
- Result: 41% lower risk of groin problems.
- The trial was in soccer players, not AFL.

## Safety highlights

### Concussion
- Community players return to matches no earlier than day 21.
- They must be 14 days symptom-free and have medical clearance first.
- The app should block contact and game sessions during that window.

### General
- Wear a mouthguard.
- Previous injury is the biggest risk factor for the next one.
- Juniors: ideally no more than 2 games a week and 25 games a season (AFL Junior Rules).
- Masters players need longer gaps between plyometric sessions (sports.json; UNVERIFIED for AFL specifically).
- Pair women's running plans with Prep to Play.

## Open questions

1. **Community and sub-elite 2 km and sprint bands** are heuristics. A state-league or club dataset would let us verify them.
2. **No fetched AFL-specific Yo-Yo IR1 norms.** Veale 2010 has them, but the abstract gives no numbers.
3. **Repeat-sprint protocol and weekly high-speed-running targets** for community players are unverified.
4. **Musashi:** the Terms of Service weren't checked. It's a commercial brand, so legal may want to sign off before we show those 9 entries.
5. **Rob Jackson's resources** were written for umpires. They're credited as such, and whoItsFor says players can use them too.
6. **FootyFirst's official home:** the copy we read is hosted by the Australian Army. The AFL/Federation University original URL wasn't found, so `sourceUrl` points to the Army copy.
7. **The AFLW Combine moved from 2 km to 1.6 km in 2026.** Should the app offer 1.6 km as a women's benchmark too?
