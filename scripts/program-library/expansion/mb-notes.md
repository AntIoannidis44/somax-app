# MB expansion: golf, Pilates, yoga-mobility (2026-11-13)

Files: `mb-sourced.json` (16 credited programs), `mb-somax.json` (65 Somax originals).
Generators: `tools/gen_mb_sourced.py`, `tools/gen_mb_somax.py`. Validator: `tools/validate_mb.py`.

```
cd somax-app/scripts/program-library
python3 tools/gen_mb_sourced.py expansion/mb-sourced.json
python3 tools/gen_mb_somax.py   expansion/mb-somax.json
python3 tools/validate_mb.py .      # 0 errors at time of writing
```

The validator checks that the JSON parses, that required fields are present and in the same order as the brief, that enums are valid (category, level, sport, goals, lifestyle), that exercises only use `{name, sets, reps, weight?, distance?, group?}` with int `sets` and string `reps`, that every id starts with `x-mb-` and is unique (including against `sourced-programs.json`, `somax-programs.json`, `afl-programs.json` and the other agents' `expansion/*.json` files), that `howToRun` has exactly 4 lines, that series days are complete, that each `basedOn` exists in `sourced-programs.json` or `mb-sourced.json`, and that nothing is a near-duplicate (exercise-name Jaccard below 0.6 within a sport). It also cross-checks overlap with the existing library. The highest overlap is 0.33, between Somax Full Mat Pilates 45 and Classical First Fifteen.

## The confidence bar I used for credited programs

I credited a program only when all of these held:
1. It is free and public, with no login or paywall, and I fetched and read the actual page or PDF myself (curl, PDF text extraction, Europe PMC full text, or viewing the figure image).
2. It comes from a reputable source: an NHS body, a university, a peer-reviewed open-access journal, a national public-health program, or a hospital or university clinic.
3. It is clear enough to transcribe. Every exercise has a stated rep count, hold or time. I did not invent any numbers. Where a range of sets was given (3-5), I stored the lower number and said so in `sourceNote`.
4. It has no "do not reproduce" wording. **I checked each site's terms of use, not just the page.** Six otherwise-good sources failed this check (listed below). Open licences (NHS OGL v3, CC BY 4.0) were preferred. Where no terms page could be found and the document has no restriction, I included it and noted that in `sourceNote`.

I recorded only exercise names, sets, reps and structure. All prose is Somax paraphrase.

## Sources used (credited, `mb-sourced.json`)

| id | source | licence / reuse status |
|---|---|---|
| x-mb-gripp-golf-warm-up | Gladdines et al., BMC Sports Sci Med Rehabil 2022 (GRIPP trial protocol, Dutch Golf Federation) | CC BY 4.0. Exercises read from Fig. 3 images |
| x-mb-bliss-bodyweight-potentiated-golf-warm-up | Bliss, Livingstone, Tallent, J Sport & Exercise Science 2021 (St Mary's Univ.) | Free journal PDF, no licence or restriction stated |
| x-mb-utah-golf-day-1/2/3 (series) | Shane Thoreson DPT, University of Utah Health Golf Clinic | Free article. University disclaimer has no reuse prohibition |
| x-mb-peerj-youth-golf-phase-1/2/3 (series) | Redondo et al., PeerJ 2020 (concurrent training, elite youth golfers) | CC BY 4.0 |
| x-mb-togu-golf-core-week-1 / weeks-2-4 (series) | Li, Ruan, Zhang, J Funct Morphol Kinesiol 2024 | CC BY 4.0 |
| x-mb-lpt-physio-based-pilates | Leicestershire Partnership NHS Trust, leaflet 608 | Free NHS leaflet, no restriction stated, no site terms found |
| x-mb-nhs-sitting-exercises | NHS (nhs.uk) | OGL v3. Attribution statement is in `sourceNote` |
| x-mb-nhs-stretch-after-exercising | NHS (nhs.uk) | OGL v3 |
| x-mb-bhft-low-back-pain-exercises | Berkshire Healthcare NHS FT, leaflet BH1165n (Feb 2026) | Free NHS leaflet, no restriction stated |
| x-mb-livelighter-office-worker-routine | LiveLighter (Australian public-health program) 5x5x5 guide | Free PDF, no restriction stated. **Site terms page not located**, so this is the softest licence in the set |
| x-mb-emory-ten-stretches-as-you-age | Emory Healthy Aging Study. Exercises credited to NIH (US federal public domain) | Free PDF, no restriction |

**Licensing caveat for the app:** the NHS OGL requires the attribution statement "Information from the NHS website is licensed under the Open Government Licence v3.0" to be shown somewhere prominent. It is stored in `sourceNote`, but the app UI should display it (for example on the program detail or an About/credits page).

## Sources skipped, and why

**Explicit no-reproduction or no-commercial-use terms** (good content, but it failed the bar):
- **TPI (mytpi.com)**: several free articles had full rep schemes (7 Anti-Rotation Exercises, 8 Scapula/Shoulder Exercises, Robbie Cannon's pre-workout warm-up, the Langdown and Wells band warm-up, Fit For Golf home circuits). TPI's terms say "You agree not to modify, publish, transmit... [or] create derivative works". I used them for learning only and never cite them in `basedOn`.
- **British Heart Foundation**: the 15-minute lower-back routine and the 10-minute flexibility routine were both excellent. BHF terms: "Commercial use or publication of all or any Material is strictly prohibited".
- **MetroHealth** (4 golf warm-ups by a PT): terms limit use to "personal, and non-commercial purposes".
- **Steadman Clinic** (15-minute range routine): terms prohibit any use without written authorisation. Several items also had no rep counts.
- **Aurora Health Care** (two golf home-exercise PDFs, otherwise very clear): terms say "You may not download, reproduce or otherwise distribute".
- **HSS** (golf back stretches): terms allow "personal non-commercial use only".
- **Wirral University Teaching Hospitals Pilates leaflet**: printed "Do Not Copy."
- **WWL NHS low back pain levels 1 and 2**: terms say "must not copy, reproduce... redistribute". The Pilates class leaflet was also unreadable as text.
- **POGP Pilates booklet**: "Reproduction of any part of this booklet without permission is not allowed."
- **IJSPT Golfer's Fore / Fore+ / Advanced Fore+** (Thomas and Wilk 2023): a great three-level golf program, but licensed CC BY-NC 4.0 (non-commercial). Skipped for consistency with the no-commercial-use skips above. The BMJ Open SEM GRIPP pilot paper (CC BY-NC) was skipped for the same reason. GRIPP itself is credited from the CC BY protocol paper.

**Not clear enough to transcribe:**
- Calderdale and Huddersfield NHS "Pilates Exercises" (31-page leveled leaflet): it is excellent for progressions, but gives no rep counts apart from "up to a hundred" pulses. I used it to learn the level structure.
- Cambridge University Hospitals back-pain stretches: three movement items have no counts.
- AOA "Golfer's Ten": reps are blank fill-ins for the clinician.
- UW Medicine golf program: a service description with no exercises.
- TPI rotational-power progression, T-spine and glute articles: exercises shown only in video.
- Pelvic Floor First (Continence Health Australia): guidance and an exercise library, not a routine. I used it for learning (see below).
- Dental-professional yoga papers (MDPI, CC BY): "remain for some breaths", with no countable dose.
- Pilates RCTs on Europe PMC (CC BY): they use reformer or apparatus, or give no reps.
- All nhs.uk Pilates and yoga pages: video only.
- Go4Life sample workouts: the domain no longer resolves, so I used the Emory/NIH PDF instead.

**Near-duplicates:** NHS Fife back exercises and Sherwood Forest back leaflet overlap Berkshire's (I kept the current 2026 Berkshire leaflet). NHS knee exercises for runners is out of scope for these three sports.

**Blocked (403):** Titleist instruction pages, PGA.com, Golf Australia (golf.org.au), Intermountain, WashU ortho PDF, the defense.gov yoga study. **Golf Australia and PGA of Australia had no fetchable routine**, so there is no Australian golf-body content. Australian representation comes from LiveLighter only.

## What I learned (applied in the Somax originals)

1. **Golf warm-ups should be dynamic, club-based and short.** Older club golfers will only do a warm-up that takes 5-10 minutes beside the tee with just a club (GRIPP). Save static stretching for after the round. This led to Post-Round Recovery as a separate program.
2. **Potentiation works acutely.** Ten countermovement jumps x 3 plus plyo push-ups raised clubhead speed about as much as speed sticks (Bliss). Somax speed sessions therefore prime with jumps and med-ball throws first. I say plainly that overspeed alone is not proven to give lasting gains (playbook rule).
3. **Golf training periodises well as strength, then power, then golf-specific** in about 6-week phases, 2-3 sessions a week (PeerJ, Utah, TPI). This gave the Somax Gym Strength A/B/C, Off-Season Power A/B, Advanced Speed and In-Season Maintenance programs, plus "not the day before a competition round".
4. **Golf needs mobility in the hips and T-spine, not the lumbar spine.** Every Somax golf mobility program keeps the pelvis still for thoracic work and trains hip internal rotation. Back-care work avoids loaded lumbar twisting.
5. **Anti-rotation is as important as rotation** (Utah Pallof work, TOGU). I gave it its own Anti-Rotation Core program.
6. **Pilates evidence (playbook):** 2-3 sessions a week for 12 weeks improves abdominal endurance and hamstring flexibility but **not posture or balance**. For back pain it is better than minimal care but not better than other exercise. All Pilates copy is framed as core endurance, flexibility and "back comfort". The desk program says outright that it isn't shown to change posture. The NHS Leicestershire leaflet makes the same point.
7. **NHS physio Pilates is built in levels** (CHT, Leicestershire, WUTH): neutral and breathing, then table-top, leg slides, bridges, clams and swimming, then classical moves. This shaped Breath & Neutral 15, then Beginner 20, then Intermediate 30 and Full Mat 45, then Advanced 45.
8. **Pelvic-floor safety** (Pelvic Floor First): avoid the Hundred, crunches, double leg lowers and full planks for at-risk users. Lift the pelvic floor before the effort and never hold your breath. This led to a dedicated Pelvic-Floor-Friendly Core program, and every rolling or curl-up Pilates program carries a safety line (osteoporosis, pregnancy, pelvic floor).
9. **Flexibility dose (ACSM, Thomas, Bandy via playbook):** 30-second holds (30-60 s for older adults), at least 60 s per muscle, at least 5 days a week. Weekly total time matters most, and progress shows by about 6 weeks. Applied in Hips & Hamstrings 20 and the Touch-Your-Toes Builder (including the 5-minute micro version and PNF from week 3). I avoid saying stretching prevents injury.
10. **Older adults** (NHS sitting exercises, Emory/NIH, playbook): chair-based options, support within reach for balance, longer holds, and "fallen in the last 12 months, see your GP first".
11. **Desk workers** (LiveLighter 5x5x5): five minutes, five times a week is realistic. The Somax Desk Reset is a 10-minute standing-plus-seated step up from it.

## Coverage table (this work only; existing library adds 1 golf, 1 Pilates, 2 yoga sourced and 1 golf, 1 Pilates, 2 yoga Somax)

| sport | credited B / I / A | Somax B / I / A | total |
|---|---|---|---|
| golf | 4 / 3 / 3 (10) | 8 / 10 / 3 (21) | 31 |
| pilates | 1 / 0 / 0 (1) | 8 / 9 / 3 (20) | 21 |
| yoga-mobility | 5 / 0 / 0 (5) | 11 / 10 / 3 (24) | 29 |
| **all** | **16** | **65** | **81** |

Gap coverage, as briefed:
- **Golf:** warm-ups (GRIPP, Bliss, plus a pre-session dynamic block inside speed days), mobility and rotation (Hip 15, Thoracic 10), back care (Back-Care 10), power and clubhead speed (Rotational Power Home, Clubhead Speed, Off-Season Power A/B, Advanced Speed, PeerJ phases), strength at gym (Gym Strength A/B/C, Utah, In-Season) and at home (Home Strength A/B), older golfers (Senior Strength & Balance), stamina (18-Hole Stamina), recovery (Post-Round), travel (Golf Trip Hotel), and shoulder, elbow and wrist care.
- **Pilates:** mat levels from foundation to advanced; core endurance (Plank Builder, Core Endurance 30, Advanced Core Power); lower-back friendly (Back-Friendly 20, LPT leaflet); reformer-free home versions (Band 30, Band 45 Advanced); 12/15/20/25/30/45-minute options; chair, standing and pelvic-floor-friendly versions; runners and golfers.
- **Yoga-mobility:** runners (Post-Run 15, Runner's Mobility 25), lifters (Warm-Up 10, Squat Depth, Overhead & Shoulders), desk workers (Desk Reset 10, LiveLighter), older adults (Chair Yoga, Balance & Mobility, NHS sitting, Emory), sleep and recovery (Bedtime Wind-Down, Restorative, Active Recovery, Yin), hips, hamstrings and shoulders (Hips & Hamstrings, Hip Opener, Touch-Your-Toes, Neck & Shoulder), travel, and flows from 5 to 45 minutes. Advanced options: Power Vinyasa, Arm Balance & Inversion Prep, and Advanced Joint Control (which complements the existing Deep Flexibility Flow).

## Known soft spots / follow-ups

- Credited Pilates (1) and credited intermediate/advanced yoga (0) are thin. Free, reproducible, dosed Pilates and yoga routines from reputable bodies are rare: most are videos or carry no-copy terms. I'd rather leave gaps than lower the bar. A future pass could ask NHS trusts or Australian bodies (APA, Pilates Alliance Australasia, Yoga Australia) for permission.
- The PeerJ golf phases come from a study of elite 16-year-old male golfers. I labelled them advanced and added a coaching caveat. Utah session lengths are Somax estimates (the article gives none).
- TOGU equipment is brand-specific. I stored generic names ("balance disc", "balance cushion").
- LiveLighter's site terms could not be located (the PDF itself carries no restriction). Re-check before launch if you want zero ambiguity.
- I did not touch the database, other library files or git.
