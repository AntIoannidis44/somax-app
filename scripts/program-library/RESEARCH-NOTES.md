# Program & Meal Library: research notes

Compiled 2026-11-12. Every entry marked `verified: true` was read from the page in its `sourceUrl` during this research pass. Somax originals are `verified: false` and list the sourced ids that informed them in `basedOn`.

Files in this folder:
- `sourced-programs.json`: 43 sessions from 23 public programs
- `somax-programs.json`: 36 original "Programs by Somax"
- `sourced-meals.json`: 18 NHS Healthier Families recipes
- `somax-meals.json`: 21 original Somax meals
- `tools/`: the generator and validator scripts that produced the JSON. Edit the data in the generators and re-run them; don't hand-edit the JSON.

## What we copied and what we didn't
- **Programs:** we copied only facts: exercise names, sets, reps, loads/percentages, timings and distances. Descriptions, `whoItsFor` and `howToRun` are written in our own words. Coaching rules (progressions, rest times) are paraphrased from the source.
- **Meals:** we copied the ingredient lists (facts) and the published per-serving nutrition. The method steps were rewritten briefly in our own words.

## Sources consulted and used

| Program / recipe set | Credit | URL read | Notes |
|---|---|---|---|
| StrongLifts 5x5 A/B | Mehdi Hadim (StrongLifts) | stronglifts.com/stronglifts-5x5/workout-program/ | Free. "Stronglifts" is a trademark (TM), so keep the credit and link out. |
| r/Fitness Basic Beginner Routine | r/Fitness / The Fitness Wiki | thefitness.wiki/routines/r-fitness-basic-beginner-routine/ | Free community routine |
| GZCLP (4 days) | Cody LeFever | thefitness.wiki/routines/gzclp/ | Free |
| Metallicdpa PPL (5 distinct days) | u/Metallicdpa | thefitness.wiki/reddit-archive/... | Free; the Legs day repeats on day 6 |
| 5/3/1 for Beginners (3 days) | Jim Wendler (via Fitness Wiki) | thefitness.wiki/routines/5-3-1-for-beginners/ | See the licensing caveats below |
| 5/3/1 Boring But Big (4 days) | Jim Wendler | jimwendler.com/blogs/jimwendler-com/101077382-boring-but-big | Free article. Assistance set counts are our placeholder. |
| NHS Couch to 5K (weeks 1, 5, 9) | NHS Better Health | nhs.uk/better-health/get-active/get-running-with-couch-to-5k/couch-to-5k-running-plan | Crown copyright. Timings only. |
| 4x4 intervals | CERG, NTNU | ntnu.edu/cerg/advice | University advice page |
| 7-Minute Workout | Klika & Jordan, ACSM HFJ 2013 | topendsports.com/fitness/programs/7min-workout.htm | Research protocol. We read a secondary summary because the journal is paywalled. |
| HYROX race simulation | HYROX format, standards via Hyranking | hyranking.com/learn/explainers/... | Third-party explainer, see the caveats below |
| FIFA 11+ (level 1) | F-MARC / FIFA | wakemed.org (PDF reproduction of the F-MARC poster) | Freely distributed injury-prevention programme |
| BWF Recommended Routine | r/bodyweightfitness | redditbwf.github.io/wiki/recommended_routine.html | Reddit blocks fetching, so we read the subreddit's GitHub wiki mirror. It doesn't name the progression steps, so entries say "Pull-up progression" and similar. |
| Simple & Sinister | Pavel Tsatsouline (StrongFirst) | strongfirst.com/sinister/ | See the caveats below |
| USMS swims (x3) | Hilary Topper; Kris Goodrich (USMS) | usms.org articles | Free articles. Distances are in yards, as published. |
| British Cycling 20-min warm-up; 2x20 sweet spot | British Cycling | britishcycling.org.uk supporting-document PDFs | Free plan support PDFs |
| Boxing metabolic conditioning | Nuffield Health | nuffieldhealth.com/article/boxing-metabolic-conditioning-workout | Has no warm-up, so add one |
| Basic boxing routine | Johnny N (ExpertBoxing) | expertboxing.com/basic-boxing-training-routine | Round length (3 min) comes from the author's own comment |
| USTA dynamic warm-up | USTA Player Development | usta.com/.../dynamic-warm-up-and-flexibility-training.html | Distances not given; we wrote "1 length" |
| 5-minute golf warm-up | Jon Hodgkinson (TPI-certified) via Golfshake | golfshake.com/news/view/21262/... | Free article |
| Classical mat Pilates, first 15 | Rosemary Godfrey (Pilates Body) | pilatesbody.co.uk/2015/11/23/the-first-fifteen-exercises | The exercise names are traditional |
| Sun Salutation | Lynda Robinson (Cleveland Clinic) | health.clevelandclinic.org/sun-salutation | Traditional sequence |
| NHS strength exercises; NHS flexibility | NHS | nhs.uk/live-well/exercise/... | Crown copyright |
| NHS walking plan | Wirral Community Health & Care NHS FT | wchc.nhs.uk walking-plans PDF | Free leaflet |
| 18 recipes | NHS Healthier Families | nhs.uk/healthier-families/recipes/... | Crown copyright. Ingredients and nutrition copied; method rewritten. |

## Skipped and why
- **PHUL (Muscle & Strength):** the site returned 403 to our fetch, so we couldn't verify it. Not included.
- **Starting Strength:** startingstrength.com returned 403. Not included. It is also a registered trademark, and the program lives in a paid book.
- **nSuns LP:** the Fitness Wiki page only links to a spreadsheet, so the set-by-set percentages couldn't be verified. Not included.
- **Hundred Pushups (hundredpushups.com):** **excluded for licensing.** The site says the content may not be distributed or stored on another website or retrieval system without written permission (Steve Speirs LLC).
- **Hal Higdon plans (Novice 5K, Novice 1 Half):** we read them, but the page says "All contents © Hal Higdon, LLC. All rights reserved." and promotes paid versions. A full schedule is a creative compilation, so we left them out of the JSON. They informed our general running guidance only (no copied schedules). Linking out to halhigdon.com is fine.
- **Joe DeFranco's Limber 11:** we couldn't find a page listing all 11 movements with doses (the official page returned 404). Not included.
- **Tabata protocol:** only secondary sources described it, so it wasn't verified. Not included as a sourced entry.
- **TPI / Titleist golf warm-ups, British Cycling HTML articles, Mayo Clinic core, NSCA basketball, PGA.com:** these returned 403, or the exercise list only existed in a video.
- **Basketball:** no official NBA, USA Basketball or FIBA routine was retrievable. Basketball is covered only by a Somax original.
- **BBC Good Food:** blocked to our crawler. **MyPlate (USDA):** the DNS lookup failed from this environment. Both would be good meal sources on a later pass. MyPlate recipes are US-government public domain.

## Licensing caveats
1. **Trademarks and brand names.** StrongLifts™, 5/3/1 and Boring But Big (Jim Wendler), StrongFirst® / Simple & Sinister, and HYROX® are brands. Using the names to credit a program is nominative use. The app must not imply endorsement, and it should link to the source for the full program. Wendler's and Pavel's full programs are sold as books, so we store only the session structure.
2. **NHS content (Crown copyright).** Recipes and plans are generally reusable under the Open Government Licence. **However, the NHS website's own terms should be checked before we ship**, because some nhs.uk content is excluded from the OGL. We stored ingredient lists (facts), the published nutrition, and our own method text, with credit and a link.
3. **HYROX standards** came from a third-party explainer, not hyrox.com. Re-check them against the current official rulebook before we label anything "official".
4. **USMS, Nuffield, ExpertBoxing, Golfshake, Pilates Body, Cleveland Clinic, USTA and British Cycling** pages are free articles. We kept only exercise facts and credited the authors. None of these pages had an explicit open licence.
5. **Somax meal macros** are estimates calculated from standard food-composition values. On two NHS recipes the nutrition panel was incomplete or had a typo:
   - **Pesto salmon:** protein and carbs were missing, so we estimated them.
   - **Chicken jalfrezi:** the page lists 79g of fat, an obvious typo, so we estimated 11g.

   Both are noted in each entry's `sourceNote`.

## Data notes
- Each program entry is one session. Multi-day programs share a `series` field and carry `day` and `daysInSeries`.
- Supersets and circuits use a shared `group` letter. For timed circuits (the 7-Minute Workout, Sun Salutation, the boxing circuit), `sets` is the number of rounds.
- Swim and run segments use `distance`, with `reps: "1"` and the send-off or rest written into the exercise name.
- Coverage gaps in the sourced set:
  - Only one advanced sourced program (the HYROX simulation).
  - No sourced basketball program.
  - Few fat-loss and mobility entries.

  The Somax set fills every level × goal cell, plus basketball, home-only, travel and older-adult sessions.

## Mobility / stretching expansion (compiled 2026-11-18)

A program-count check found only about 19 of the 780 programs then in the library even mentioned stretching, warm-up or cool-down, almost all as a line or two appended to another sport's session, with no real library of standalone stretching/mobility/warm-up/cool-down routines. This batch fills that gap.

Files (all ids prefixed `x-mobility-`):
- `expansion/mobility-sourced.json`: 4 credited sessions from 2 publishers (`verified: true`)
- `expansion/mobility-somax.json`: 20 original "Programs by Somax" (`credit: "Somax"`, `verified: false`, `basedOn` ids that all point into `mobility-sourced.json`)

Generators: `tools/gen_mobility_sourced.py`, `tools/gen_mobility_somax.py`. Validator: `tools/validate_mobility_expansion.py` (modelled on `tools/validate_gym_expansion.py`, but with the full `sport` enum from `tools/validate.py` rather than the four gym sports, and an existing-id collision check against every `*.json` already in `scripts/program-library/` and `scripts/program-library/expansion/`, not just three files).

```
cd somax-app/scripts/program-library
python3 tools/gen_mobility_sourced.py expansion/mobility-sourced.json
python3 tools/gen_mobility_somax.py   expansion/mobility-somax.json
python3 tools/validate_mobility_expansion.py .      # 0 errors
```

**One rule applied throughout, because it's a factual claim about the body, not a style choice:** dynamic stretches/movements only ever appear in a *warm-up* program (before activity); static (held) stretches only ever appear in a *cool-down* or standalone *flexibility* program (after activity, or on their own, never as a cold pre-activity warm-up). No stretch exercise is described as "activating" or "working" a muscle the way a strength exercise is - a stretch's claim is "lengthens" or "eases tension in", never "works" or "activates". This follows the same rule set out in `exercise-howto/research/muscle-sourcing-and-design.md` (one level above `somax-app`) for why-this-exercise claims.

### Confidence bar for credited entries

Same bar as the gym and mb expansions: free and public with no login/paywall; read from the actual page ourselves; a reputable publisher; the page states enough (hold time, reps, or at minimum named exercises) to transcribe without guessing; and no "do not reproduce" wording. This niche turned out to have very few pages that cleared all five at once - most public stretching advice is general ("stretch regularly, hold 10-30 seconds") rather than a named, transcribable session, which is itself a finding worth recording: it's not just that nobody built a stretching library before, it's that the free, primary, sets-and-reps-style source material for stretching is thinner than it is for strength or running.

### Sources used (credited, `mobility-sourced.json`)

| Program | Credit | URL read | Licence / notes |
|---|---|---|---|
| NHS Flexibility Exercises | NHS | nhs.uk/live-well/exercise/strength-and-flexibility-exercises/flexibility-exercises/ | Page footer states "© Crown copyright" (other NHS entries in this library cite OGL v3.0 for nhs.uk generally). Four stretches with hold times/reps; the page gives no hold time for the calf stretch, which is noted on that exercise rather than invented. |
| Cleveland Clinic Everyday Flexibility Stretches | Christopher Travers, MS (Cleveland Clinic, Health Essentials) | health.clevelandclinic.org/flexibility-exercises-training-stretches | Free article, no reuse terms stated - same situation as the existing Cleveland Clinic Sun Salutation entry. Five static stretches, 20-30s building to 1-2 min. |
| Cleveland Clinic Dynamic Warm-Up Movements | Dr. Anne Rex, DO (Cleveland Clinic, Health Essentials) | health.clevelandclinic.org/understanding-the-difference-between-dynamic-and-static-stretching | Free article, no reuse terms stated. Dynamic half of the article: leg pendulum (10-12 swings/leg, exact), walking lunges and hip circles (no rep count given by the source - flagged rather than invented). |
| Cleveland Clinic Static Cool-Down Stretches | Dr. Anne Rex, DO (Cleveland Clinic, Health Essentials) | same URL as above | Static half of the same article: hamstring, calf, triceps, quad, shoulder, each held 30-90s as stated. Split into its own entry because the article itself frames dynamic-before/static-after as two different things, not one routine. |

Both Cleveland Clinic entries read the page directly (not a secondary summary). No entry in this batch required reading a secondary source for a primary that was paywalled or blocked - where a source was blocked, it's simply not included (see below).

### Skipped and why

| Candidate | Why skipped |
|---|---|
| Mayo Clinic "Stretching: Focus on flexibility" (art-20047931), "Stretching and flexibility" (hlv-20049447), and "A guide to basic stretches" (art-20546848) | All three Mayo Clinic URLs returned 403 to our fetch. Mayo Clinic Health System's "Stretching exercises for flexibility" article also 403'd. Four attempts, four blocks - documented once rather than per-URL. |
| British Cycling "Intermediate: Warming Up and Cooling Down" (img.britishcycling.org.uk) | 403. Consistent with the original research notes' finding that British Cycling HTML articles return 403 to this fetcher; no stretching-specific PDF (as used for the original British Cycling warm-up/sweet-spot entries) could be located for cool-down/stretching specifically. |
| FIFA 11+ cool-down | Checked directly: the FIFA 11+ programme (already a credited sourced-programs.json entry, `fifa-11-plus-warm-up`) is a warm-up only - parts 1-3 are all pre-session/pre-match. No official F-MARC cool-down section exists to source. Re-using the warm-up itself here would duplicate an existing library entry rather than fill the stretching gap. |
| USTA "Strength & Conditioning: Flexibility Training" and "Prevention of knee injuries" (playerdevelopment.usta.com) | Both URLs 404'd on direct fetch; only secondary search snippets described their content (hold 20-30s, repeat 2-3x), which isn't a page we read ourselves, so it wasn't used. USTA's dynamic warm-up page is already a credited sourced-programs.json entry (`usta-dynamic-warm-up`); re-sourcing the same URL here would duplicate it. |
| CDC dedicated flexibility/stretching page | No such page could be located; the CDC's physical activity guidance pages that do exist don't give a named, transcribable stretch routine. The CDC/Tufts "Growing Stronger" book (already credited in the gym expansion for its strength chapters) couldn't be re-fetched here to check for a separate stretching chapter (its catalog page has no readable table of contents from this fetcher). |
| ACSM stretching/flexibility guidelines (acsm.org blog, 2011 position stand) | Read, but it's FITT-VP guidance (frequency/intensity/time/type), not a named routine with specific exercises - nothing to transcribe into a session. Used only as general background for the Somax originals' hold-time and frequency choices, consistent with how the original research notes use the CERG/NTNU and ACSM HFJ sources as protocol references rather than sourced sessions. |
| Better Health Channel / betterhealth.vic.gov.au stretching page | Could not locate a current stretching/flexibility page on this domain via search or direct guesses; the Victorian government's "Get Active Victoria" site has general guidance (dynamic before, static after) but only in PDF flyers with no full named routine. |
| NHS "top 10 back care tips", NHS "Body Blast Cool Down" (video), various NHS trust back-pain PDFs | Read directly. The back-care-tips page names no specific stretches. The Body Blast Cool Down page is a video-only "General cool down" with no named exercises in the text. NHS trust PDFs (Berkshire, Cambridge, Calderdale & Huddersfield, Southern Tees) were either already credited elsewhere in this library (the mb expansion's Berkshire low-back leaflet) or carry explicit "do not copy" wording (documented in the mb expansion's notes already). |
| American Heart Association "Flexibility Exercise (Stretching)" | Read directly. Footer states "All rights reserved. Unauthorized use prohibited," and the article names only one generic stretch (a forward bend) - failed both the licence and the transcribability bar. |
| Harvard Health Publishing "The Importance of Stretching" | Read directly (not paywalled). Names only one stretch (hamstring) and links to separate "Content Licensing"/"Permissions" pages rather than a plain copyright notice, suggesting reuse needs clearance - too thin and too uncertain on licence to include. |
| US Dept. of Veterans Affairs "Improving Flexibility" (Whole Health Library PDF) | Read in full (PDF text extracted locally). It's a clinician background document on *why* flexibility matters (ACSM citations, measurement tests) with no named stretches or routine - used only as general background, same treatment as the ACSM source above. |
| National Institute on Aging flexibility pages (nia.nih.gov and an archived mirror) | The live nia.nih.gov page returned 405 to our fetch (matching the pattern already noted for NIA in the gym expansion's skip list); the UNT web-archive mirror of the old NIA exercise guide returned no readable text. Not included. |
| British Athletics / UK Athletics dynamic warm-up | No official governing-body PDF could be located; only third-party coaching sites (Men's Fitness UK, a personal site by a former British Athletics coach) came up, which don't meet the "reputable publisher" bar used elsewhere in this batch. |

### Licensing caveats

1. **NHS content.** As with every other NHS entry in this library, the page itself states only "© Crown copyright"; other NHS entries already in the library cite the Open Government Licence v3.0 for nhs.uk content generally, and that same caveat applies here - the OGL has some exclusions, so it's still worth checking nhs.uk's own terms before shipping, as the original research notes already flag.
2. **Cleveland Clinic.** Three sessions in this batch (one sourced split into two) come from two free Cleveland Clinic Health Essentials articles with no stated reuse terms - the same situation as the existing Cleveland Clinic Sun Salutation entry elsewhere in this library. Facts only (exercise names, hold times) were copied; all prose is ours.
3. **Concentration risk.** This batch has only two credited publishers (NHS and Cleveland Clinic) behind its four sourced entries, fewer than any other batch in this library. That's a direct result of how thin verifiable, licence-clear, transcribable stretching routines are online (see "Skipped and why" above) rather than a shortcut - every other strong-looking candidate was either blocked, too generic to transcribe, or carried explicit no-reproduction wording.

### Somax originals: purpose and level spread

| Purpose | Beginner | Intermediate | Advanced |
|---|---|---|---|
| Pre-workout dynamic warm-up (general/runner/lifter/team-sport/competition) | Pre-Workout Dynamic Warm-Up 10, Runner's Pre-Run Dynamic Warm-Up 10 | Lifter's Pre-Lift Dynamic Warm-Up 10, Dynamic Warm-Up for Team Sports 12 | Pre-Competition Dynamic Activation 15 |
| Post-workout static cooldown (general/runner/lifter/cyclist) | Post-Workout Static Cooldown 10 | Lifter's Post-Lift Static Cooldown 12, Runner's Post-Run Static Stretch 12, Cyclist's Post-Ride Static Stretch 12 | Lifter's Mobility & Static Cooldown 20, Runner's Flexibility & Static Cooldown 20 |
| General flexibility-building (standalone) | General Flexibility Builder 15 | General Flexibility Builder 20, Hip-Opener Flexibility Flow 20, Yin-Style Long-Hold Flexibility 25 | Advanced Mobility & Flexibility Circuit 30 |
| Morning mobility | Morning Mobility Flow 12 | - | - |
| Desk-job / sedentary relief | Desk-Job Hip & Neck Relief 10 | Desk-Job Full Flexibility Reset 20 | - |
| Older-adult gentle mobility | Older-Adult Gentle Mobility 15 | - | - |

7 beginner, 9 intermediate, 4 advanced - 20 total. Every Somax entry's `basedOn` names at least one id from `mobility-sourced.json`; dynamic-warm-up entries cite the Cleveland Clinic dynamic entry, static-cooldown and flexibility-builder entries cite the NHS and/or Cleveland Clinic static entries, matching the dynamic-before/static-after rule above.
