# Muscle-verification dataset — summary

Produced 2026-11-18, continuing directly from `muscle-sourcing-and-design.md` (2026-11-18 seed research).
No images generated, no app code changed — this is the data/research deliverable only.
Full dataset: `muscle-verification.json` (1,250 records).

## 1. Scope and totals

| | Count |
|---|---|
| Total exercise-line references scanned (`src/data/library/**/*.json`, meal files excluded) | 5,708 |
| Raw distinct movement strings | 3,226 |
| Warm-up/cool-down freeform multi-exercise lines (excluded, not single movements) | 166 |
| Distinct movement strings after tier-suffix stripping ("(T1)", "– BBB", "(easy)") + dedup | 3,046 |
| **Real strength/calisthenics movements covered (this pass)** | **1,194** (7 movements that were actually stretches mis-caught by keyword matching — all 4 "Figure-4 Glute Stretch" variants, "Low Lunge Hip Flexor Stretch" — were moved to the correct stretch pattern during QA; one compound multi-element description line was dropped entirely, matching the same rule already used for warm-up/cool-down freeform lines) |
| Shared movement patterns used for the strength/calisthenics set | 60 (42 base patterns, further split into sub-cases where the research found a genuine muscle-target difference, e.g. chest fly vs. reverse fly, hip abduction vs. adduction) |
| **Stretching/mobility/dynamic-warm-up movements covered (coordinator addition, mid-task)** | **58** (exactly the list supplied; 1 of those 58 — "Walking Lunge" — turned out to already be present verbatim in the original library's strength extraction, so it has a single shared record rather than a duplicate row) |
| Patterns used for that addition | 29 (13 static stretches, 11 active-ROM/mobility, 5 dynamic-warm-up/running-drill; 3 of the 58 reuse an already-verified strength pattern — see §4) |
| **Grand total distinct movements in `muscle-verification.json`** | **1,250** |
| Distinct patterns across the whole file | 87 |

The real strength/calisthenics count (1,194) is higher than yesterday's rough approximate split ("~728") — that number was explicitly labeled a rough split in the seed doc, not a derived count. The gap mainly comes from this pass: (a) keeping equipment-prefix variants as distinct named movements (e.g. "Dumbbell Row" / "Barbell Row" / "Cable Row" are 3 strings, 1 pattern) rather than collapsing them before counting, and (b) including some categories (Pilates mat work, loaded carries, plyometrics, rotational med-ball throws, advanced calisthenics statics) that a narrower strength/calisthenics definition might have left out. The methodology (script-based extraction + explicit, documented inclusion/exclusion rules) is in the companion file `exercise-howto/research/` scratch notes; happy to re-run with a narrower definition if a tighter number is wanted.

Noise explicitly excluded from the strength/calisthenics set: sport-specific drills (AFL/footy, golf, tennis, boxing, basketball/netball/soccer), swim/run/bike pacing and interval labels, pure balance/fall-prevention holds (single-leg stance, tandem stance), neck/wrist/shoulder rehab-prep drills (CARs, wall slides, pelvic floor, pelvic tilt), and band-assisted mobility drills with no clear strength-training analogue.

## 2. Verification standard applied

Per the hard rule: primary (ExRx.net Target) + secondary (ExRx.net Synergist/Stabilizer) muscles, corroborated by at least one more source (NASM, a peer-reviewed EMG study, or a second independent fitness-education site), cited per record. For stretches: "lengthens/stretches X" framing with stretching/flexibility-specific sourcing (NASM flexibility library, ACE, PT/clinical sources, peer-reviewed flexibility studies) — never the strength "works/activates X" claim. For dynamic warm-up/running drills: verified like a light strength movement (prime movers), sourced from NASM/ACE/track-biomechanics/EMG where available.

Confidence breakdown across all 1,250 records: **high 812, moderate-high 93, moderate 291, low-moderate 15, low 39.**

Note on access: ExRx.net blocks direct automated fetches (403/Cloudflare challenge) for every research agent; all ExRx content was retrieved through text-extraction proxies or Wayback Machine snapshots of the same canonical URLs, cross-checked for consistency. Physiopedia and several NASM/ACE library pages also returned 403s in some passes — flagged per-pattern where it affected source-tier.

## 3. Movements needing individual (non-pattern) verification, per the task's own rule

Most patterns genuinely share one muscle answer per the seed research's hypothesis. These did **not** fit cleanly into a shared pattern and were separated into their own sub-cases or flagged as singly-sourced:

- **Pistol Squat** — ExRx gives it a distinct stabilizer set (adds Gluteus Medius/Minimus, Quadratus Lumborum, Obliques, Iliopsoas, TFL for the raised leg/balance) beyond the standard squat.
- **Cossack Squat** (5 movement strings) — no ExRx page found at all; unconfirmed, flagged rather than guessed.
- **Reverse/Rear-Delt Fly** vs. **Chest Fly** — biomechanically unrelated exercises despite sharing the word "fly" (filed under separate ExRx muscle directories); split into `chest_fly_pecs` / `chest_fly_reardelt`.
- **Hip Abduction** vs. **Hip Adduction** (Copenhagen Plank etc.) — different primary muscles (Gluteus Medius vs. Adductor group); split.
- **Crunch → Sit-up → V-up → Hanging Leg Raise** — a real, ExRx-confirmed escalating hierarchy where the target itself shifts from Rectus Abdominis to Iliopsoas (hip flexors) as the movement adds hip flexion; split into 4 sub-patterns rather than one "ab exercise" bucket.
- **Dip** — triceps-primary confirmed across bench/chair/parallel-bar/ring variants (no "chest-lean dip" variant exists by name in this library's real data, so no split was needed there).
- **Rotator cuff external vs. internal rotation** — genuinely different target muscles (Infraspinatus vs. Subscapularis); split.
- **Sled Push vs. Sled Pull/Drag** — split; see disagreements below.
- **Rotational med-ball throws** — ExRx's own joint-articulation data cleanly differentiates side/rotational throw, overhead slam, chest pass, and scoop toss as 4 distinct sub-movements, not one "throw" pattern.
- **Side Plank** vs. **Front Plank** — ExRx files Side Plank under Obliques, not Rectus Abdominis; split.
- **Bird-Dog / Superman / Contralateral Limb Raise** — pulled into their own `plank_antirotation_birddog` sub-case because NASM classifies Bird-Dog as an *anti-rotation* exercise, not anti-extension (see §5).
- **Pallof Press** — no ExRx page exists at all; kept separate from the woodchop/Russian-twist family because it's biomechanically anti-rotation (isometric) rather than rotation-producing.
- **Pilates mat family** (Hundred, Teaser, Roll-up, Roll Over, Criss-Cross, Saw, Scissors, Jackknife, Corkscrew, Single Straight Leg Lower — 20 movement strings) — **no ExRx coverage and no certifying-body (e.g. Pilates Method Alliance) or peer-reviewed source was found at all.** Rests on fitness-media consensus only. **Does not clear the two-source verification bar as sourced — flagged for exclusion from any shipped how-to claim, or further sourcing, before use.**
- **Advanced calisthenics statics** (Front Lever, Planche, Dragon Flag, Handstand Hold, L-sit — 12 movement strings) — no ExRx or NASM coverage exists for any of them. Best sourcing found was narrow peer-reviewed EMG (Handstand Hold: shoulder muscles only; Planche: one university repository study). Front Lever, Dragon Flag, L-sit rest on fitness-media consensus only. None should ship at "high" confidence.
- **Mountain Climber** (7 strings) — no ExRx page, no EMG study found; flagged as genuinely different from the static crunch family (combines plank-style stabilization with dynamic hip flexion; at least one database tags it "cardio").
- **Kettlebell Halo** — fails the two-source bar outright: no ExRx page, no EMG study, and the handful of fitness-media sources found actively disagree with each other on whether deltoids or the rotator cuff is primary.
- **Crab Walk** — ExRx's own page for it returned a subscriber paywall; only secondary blog sources available. Flagged lower-confidence than its paired Bear Crawl.
- **Turkish Get-up** — no source gives one primary/secondary breakdown for the whole lift; reported as "whole-body, no single dominant target" per the one real EMG study found (shoulder-only).
- **Dead Hang / Active Hang** — no ExRx page exists; grip/forearm target is solid but the lat/shoulder-stabilizer secondary claim is multi-source-agreed but not ExRx-anchored.
- **IT Band Side Stretch** — the IT band itself is dense fascia; two cited cadaver/biomechanics studies found it barely elongates under stretching at all. Do not word this as "stretches the IT band" — reworded to target the TFL/outer-hip region, limitation stated.
- **Figure-4/Piriformis Stretch family** — NASM's own blog disputes that the piriformis commonly needs stretching at all, and says the standard figure-4 position "gets much more than the piriformis." Softened accordingly.

## 4. Movements that reuse an already-verified strength pattern (no new research needed)

Three of the 58 new stretching/mobility movements are the same underlying exercise as one already verified in the strength set, just in a dynamic-warm-up context — the muscle data was reused rather than re-derived from scratch:
- **Bodyweight Squat to Stand** → `squat_pattern` (Quadriceps + Gluteus Maximus)
- **Walking Lunge** → `lunge_pattern` (Quadriceps + Gluteus Maximus)
- **Walking Lunge with Reach** → `lunge_pattern` + the torso-rotation pattern's obliques for the reach component (reported as a hybrid, not forced into one pattern)

## 5. Real disagreements flagged (not resolved — both positions stated in the JSON `notes` field)

1. **RDL vs. conventional deadlift** (reconfirmed from the seed research) — gym lore + ExRx's own labeling convention suggest RDL loads hamstrings more directly, but Lee et al. 2018 (EMG, n=21) found conventional deadlift produces *higher* rectus femoris and glute-max EMG, with *no* significant hamstring difference between the two lifts.
2. **Reverse hyperextension vs. standard back extension** — ExRx's own taxonomy supports reverse hyper shifting the target to glutes, but the one peer-reviewed EMG study found (Lawrence et al. 2019) found comparable activation between the two, if anything higher glute/hamstring EMG on the *standard* back extension.
3. **Bulgarian split squat / rear-foot-elevated split squat "more glute/quad dominant" than a flat lunge** — this popular claim is *not* supported by ExRx's identical classification of the two, nor by a 2019 EMG study (Fort-Vanmeerhaeghe et al.) that found no significant difference.
4. **Sled push vs. pull/drag quad-vs-hamstring emphasis** — secondary sources directly contradict each other; no peer-reviewed EMG comparison located. Also: ExRx's only verified "sled pull" variant shows the arms as passive, whereas a different, commonly-pictured rope/hand-over-hand sled pull variant does add real lat/upper-back pulling demand — these are not the same exercise.
5. **"Hip thrust beats glute bridge"** (reconfirmed from the seed research) — no direct head-to-head EMG study between the two was found; the usual citation (Contreras 2016) compared hip-thrust *load variants* against each other, not against a floor bridge. Phrase as practitioner consensus, not settled fact.
6. **Pallof press (anti-rotation) vs. woodchop/Russian twist (rotational)** — a small 4-subject pilot study found the rotational exercises produced *greater* deep-core EMG than the anti-rotational ones, cutting against the common assumption that anti-rotation work is "more effective" for deep stabilizers.
7. **Bird-Dog classification** — NASM's own exercise library classifies Bird-Dog as *anti-rotation*, not anti-extension/core-bracing, unlike Dead Bug (same family in this app's grouping) which NASM does classify as anti-extension.
8. **Shoulder Cross-Body Stretch secondary muscle** — the one peer-reviewed RCT found (Yamauchi et al. 2016) found it reduces *teres minor* stiffness specifically, not infraspinatus (a different stretch reduced infraspinatus stiffness). If the app's existing copy says "infraspinatus," that's the less-supported of the two per this study.
9. **Arm Circles → rotator cuff claim** — one source credits only the rotator cuff, another credits the full deltoid group; a clinical dissent (unverified independently) argues fixed-plane circles don't meaningfully load the cuff at all since that needs humeral rotation, not circular swinging.
10. **High Knees primary mover** — one source names glutes as primary, another names hip flexors/iliopsoas; directly contradicted, not resolved.
11. **Butt Kicks' hip-flexor role** — one source lists hip flexors as a secondary mover, another frames hip-flexor dominance specifically as a sign of poor form, not productive assistance.
12. **Torso rotation vs. lateral side-bend** — one source claims rotation and lateral flexion "activate the exact same muscles" including psoas; the sources used for each sub-case individually don't list psoas/quadratus lumborum for the rotation sub-case. Split into two sub-patterns here, but noted as disputed.
13. **Kettlebell Halo primary muscle** — sources disagree outright on whether deltoids (broadly) or the rotator cuff specifically is primary; no tiebreaker source found.
14. **Brachialis as a pull-up/chin-up synergist** (reconfirmed from the seed research) — remains weakly sourced; no primary EMG study measuring brachialis in this movement was found. Treat as an anatomical inference, not a measured result.
15. **Triceps long-head-vs-lateral/medial-head claim** (overhead extension vs. pushdown) — not given by ExRx at all (no head-level breakdown); the usual supporting studies could only be reached via secondary blog summaries this pass. Held at low confidence pending a direct read of the primary papers.

## 6. Things that could not be confidently verified at all (listed explicitly, not guessed)

- The entire **Pilates mat exercise family** (20 movement strings — Hundred, Teaser, Roll-up, Roll Over, Criss-Cross, Saw, Scissors, Jackknife, Corkscrew, Single Straight Leg Lower).
- **Advanced calisthenics statics**: Front Lever, Planche, Dragon Flag, L-sit (Handstand Hold has the best — though still narrow — EMG sourcing of the five).
- **Kettlebell Halo** (no ExRx page, no EMG, disagreeing secondary sources).
- **Pallof Press** (no ExRx page at all; NASM covers it only in blog posts, not its structured library).
- **Dead Hang / Active Hang** (no ExRx page; secondary-source-only for the lat/shoulder-stabilizer claim).
- **Mountain Climber** (no ExRx page, no EMG study).
- **Superman** (no ExRx or NASM page; fitness-media consensus only).
- **Crab Walk** (ExRx page paywalled; secondary sources only).
- **Cossack Squat** (no ExRx page found; unconfirmed).
- **Cuban Press** — does not actually appear in the app's real movement data (it came up only as a research example), so it is correctly absent from the dataset; noting it here only so it isn't later assumed to have been verified.
- **Thruster** and the **trapezius/grip-strength half of the Loaded Carry claim** — ExRx has no page for either; both rest on secondary fitness-media sources that agree with each other but aren't ExRx- or EMG-anchored.

## 7. Files produced

- `exercise-howto/research/muscle-verification.json` — 1,253 records, `{movement, pattern, primary[], secondary[], sources[], confidence, notes}`.
- `exercise-howto/research/muscle-verification-summary.md` — this file.

No app code or images were touched.
