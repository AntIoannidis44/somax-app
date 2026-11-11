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
