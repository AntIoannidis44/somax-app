# 3D character work: notes

## Status
- Base model: `public/models/characters/Regular_Female_FullBody.gltf` (Quaternius, CC0). 65 bones, about 7,000 body vertices, no shape keys.
- Smile shape key: NOT passing. Attempts v1 to v11 are in `3d/out/` and renders in `3d/reports/`.
- Nothing has been pushed to the app. No app code changed for this work.

## Measured anchors (from `scripts/mouth_probe.py`)
- Lip line: z ~ 1.610 (Blender Z-up). Lower lip ~1.6066, upper lip ~1.6139.
- Lip corners: x ~ +/-0.011, z ~ 1.612.
- Front of the face: y ~ -0.112 (camera side).
- Mouth region: about 30 vertices in the front band. The mouth is about 0.02 wide.

## Lessons
- Scale: any move must be on the scale of the lips (about 0.02 wide). Moves of 0.004 to 0.007 push the whole mouth and cause a pucker.
- Pivot: rotating the mouth about the lip line swings the upper lip inward, which pulls the lips together (the pucker in v6 to v8).
- Falloff: radii should be sized to the lips, not the face. Wide falloffs drag in the nose and chin.
- Corners only (v11): no pucker, but still reads as neutral. Cheeks and the surrounding area also need to change for a smile to read.
- Vetting: check each render before showing it. Render at the same framing as the neutral, and compare side by side.

## Next step
- Commission a face artist to sculpt the expression shapes (smile, blink, eye shape) on the base. Give them the anchors above and the vetting checklist.
- Or find a licensed face rig with expression controls, if its licence allows embedding in an app.

## Licensing (short)
- Reallusion: embedding in an app needs an Enterprise licence.
- Daz: shipping extractable meshes in an app is blocked by its interactive addendum.
- Quaternius (CC0): fine for commercial use.
- Unity Asset Store EULA: allows embedding as components of interactive media. Check it covers an iOS app.

## Lattice attempts (smile_lat1 to lat4)
- Method: a Blender lattice cage around the mouth, baked to the Smile key.
- lat1 (5 columns): the centre inherited lift from the corners, so the rise went down. Cause: no lattice point at the centre.
- lat2 (5 columns, centre point fixed): rise 0.0025 to 0.0039. Right direction, too small.
- lat3 (lift 0.016, 5 columns): rise 0.009 with the measurement band widened to 0.03. Upper lip rises in the middle, so it reads as a sneer. Fails.
- lat4 (9 columns, corner-only lift): nose wings distorted and the upper lip still peaks. Fails.
- Lesson: linear lattice falloff spreads the lift onto the upper lip and nose. A proper smile needs a lip-line curve plus cheek and nose-wing movement, which a single cage doesn't give.
- Measurement band: the 0.012 band loses the corners once they lift. Use 0.03 (and compare neutral and smile on the same band).

## Face-rig search
- CC0 smile assets found (Meshy) are icons, not human face shapes. Sketchfab study is CC-BY. No suitable free rig found yet.

## Gym top (procedural): status
- v1 (ragged, box selection): fails. Jagged edges and holes.
- v2: clean tube, shrinkwrapped to the torso. Shoulder spikes, bust clipped, no skin weights.
- v3: skin weights copied (65 groups, the top now moves with the skeleton). Spikes and bust clipping remain.
- v4: lower top ring, spikes pruned. Clean band under the bust. Faceted.
- v5 (script `make_gym_top_v5.py`): more rings and segments, smooth shading. PASSES at base body size. Crop band, under the bust, bra visible above it. Output `3d/out/gym_top_v5.gltf`.
- Body-size test (script `make_gym_top_size.py`, BODY_WIDTH=1.15): FAILS. The top has a hole where the body's belly sits in front of the shell. The test widens the body by scaling vertices by hand, so it isn't a true body-size change. Next: build proper body-size shape keys on the base body before fitting the top, then re-test.
- Lesson: fixed thresholds (the spike limit) break on any other body. Scale thresholds to the body.

## Quaternius fantasy outfit pieces (from ~/Desktop/Ant)
- Packs: "Modular Character Outfits - Fantasy" Standard and Source. Licence: CC0 (both).
- glTF pieces live in `Exports/glTF (Godot-Unreal)/Modular Parts/`. Torso piece used: `Female_Peasant_Body.gltf`.
- Skeleton: the same 65 bones and names as our base. Verified with `3d/scripts/inspect_outfit.py`.
- Fit check on the base body: `3d/scripts/fit_outfit_piece.py` renders the piece on our base. Peasant bodice fits the bust and waist with no clipping. Output `3d/reports/fit_peasant_body.png`.
- Crop top v1 (`CUT_Z=1.12`): peplum removed, bodice kept. PASSES fit and edge quality. Output `3d/reports/crop_top_v1.png`. Still reads as armour (high collar, shoulder caps).
- Sport cut v2 (`SPORT=1`, delete-based neckline and armholes): FAILS. Ragged holes and strap stubs. Vertex deletion can't make clean edge loops. Next step: clean cuts with bisect or boolean shapes.
- Sport cut v3 (boolean neckline ellipsoid, armhole cylinders at x 0.19, z 1.27, r 0.075): clean edges, but armholes barely show. `3d/reports/sport_top_v3.png`
- v4 (armholes r 0.1, x 0.17, z 1.25): too deep, cuts into the ribs. FAILS. `sport_top_v4.png`
- v5 (armholes r 0.085, x 0.17, z 1.31): cuts into the bust, bra shows. FAILS. `sport_top_v5.png`
- v6 (armholes r 0.07, x 0.225, z 1.20, outside the bust): clean edges and bust covered, shallow armholes. BEST SO FAR. `sport_top_v6.png`
- Still to do: deeper armholes beside the bust, navy colour, and a fit test on a second body size.

## Looser tops (carried offsets + drape)
- Script: `3d/scripts/fit_by_offset.py`. Environment settings: HEM_Z (hem height), EASE (scales the gap to the body), CLEAR (pushes out along the body normal), BLEND and CLEAR_TUBE (blend toward a smooth tube sized to the body at each height, so the bust doesn't show).
- Relaxed (`top_relaxed4.png`): HEM_Z=1.08 EASE=1.4 CLEAR=0.01 BLEND=0.5 CLEAR_TUBE=0.02. Clean scoop neck, looser, bust softened.
- Loose (`top_loose8.png`): HEM_Z=1.08 EASE=1.8 CLEAR=0.02 BLEND=0.9 CLEAR_TUBE=0.045. Bust not visible as a shape. Neckline and shoulders at normal fit.
- Rejected: loose with BLEND above 1.27 spread the neckline into a boat neck (`top_loose5.png`). Clearance alone (`top_loose4.png`) kept the bust shape.
- Known defects still open: the navel gaps (regular) and the bust specks (superhero). The blend settings have not been tested on the superhero body.

## Non-peasant reference: Knight cloth top (best so far)
- Source: `Modular Character Outfits - Fantasy[Source]`, `Female_Knight_Body_Cloth.gltf` (CC0). The chest is a smooth flat panel, which is what we want.
- Recipe: `NOCUT=1 HEM_Z=1.14 python 3d/scripts/fit_by_offset.py -- <regular> <piece> <target> <render>`. No sports cut (the piece already has a crew neck). Hem at 1.14 removes the belt.
- Regular body: `3d/reports/knight_fit_regular.png`. Clean crew-neck crop tank, chest smooth. PASSES.
- Superhero body: `3d/reports/knight_fit_superhero.png`. Fits, but has the known dark specks at the bust and small hem points at the sides.
- The Noble and Wizard bodies are armour-like, so they aren't useful for a gym top.

## Leggings (skin-tight, from the body's own leg skin)
- Script: `3d/scripts/make_leggings_skin.py <body> <out> <render> long|short`.
- Method: copy the body's leg faces (plus the pelvis band to join the legs), push them out 8 mm, flatten the waist and hem edges, skin weights from the body.
- Long (ankle to waist): `3d/reports/leggings_long_v6.png`. Smooth, full length, no bust detail. Small notch at the crotch top and a few specks of underwear at the waist sides.
- Short (knee length): `3d/reports/leggings_short_v6.png`. Smooth. Small teeth along the knee hem.
- Rejected: the Ranger leg piece (rectangle at the hip, stops at mid-calf); ring-based legs (`make_leggings.py`, shrink-wrap and slice-measure versions, broken shapes).
- Measured lines (close-up `3d/scripts/waist_closeup.py`, `3d/reports/waist_closeup.png`): underwear waistband top at z ~1.05. Ankle line used at z 0.08.
- Leggings v8 (`TOP_LINE=1.05`): long `3d/reports/leggings_long_v8.png`, short `3d/reports/leggings_short_v8.png`. Waist set to the underwear top line; ankle set to the ankle line.
- Short leggings v9 (`TOP_LINE=1.05 SHORT_LINE=0.70`): mid-thigh, well above the knee. `3d/reports/leggings_short_v9.png`. Small gap at the crotch top still open.

## Leggings: boolean cut (current best)
- Script: `3d/scripts/make_leggings_bool.py <body> <out> <render> long|short`. Env: TOP_LINE=1.05 (underwear top), ANKLE_LINE=0.08 (long), SHORT_LINE=0.70 (short, mid-thigh), CURVE_DIP=0.010 (underwear curve).
- Method: copy the body's legs and pelvis (keeps skin weights), cut with planes and a U-shaped cylinder at the underwear line, cut at the ankle or mid-thigh, then a 8 mm shell.
- Outputs: `3d/out/leggings_long_b3.gltf`, `3d/out/leggings_short_b3.gltf`. Renders: `3d/reports/leggings_long_b3.png`, `leggings_short_b3.png`.
- Result: clean smooth edges, underwear curve at the waist, skin-tight. Not yet tested on the superhero body.

## Sleeved tops: modular approach (current)
- Torso: Knight cloth piece fitted by offset (`3d/out/knight_torso.gltf`, crop at 1.14).
- Sleeves: body arm skin copied, shelled 8 mm, sleeve end cut flat. `3d/scripts/make_sleeves.py <body> <out_prefix> <render> long|short`. Long to the wrist (`3d/out/sleeves_long.gltf`), short to mid-arm (`3d/out/sleeves_short.gltf`). Two pieces, one per side.
- Combined renders: `3d/reports/top_combined_long.png`, `3d/reports/top_combined_short.png` (via `3d/scripts/combine_render.py`).
- Open: the torso is a crop length (long-sleeve top would need the hem at the waist), the sleeves are a flat grey (colour to match), and the superhero body is not tested.
- Rejected: Knight arm pieces (armour bracers), Wizard arms (puffy sleeves), Ranger arms (bracers).

## Sleeves: accepted as a separate add-on layer
- Shoulder join fixed: sleeve region now starts at |x| 0.12 (was 0.22), so it overlaps the torso's armhole instead of leaving a gap. Re-rendered long and short: `top_combined_long2.png`, `top_combined_short2.png`.
- Colour is now a parameter: `SLEEVE_COLOR="r,g,b"` env on `make_sleeves.py`, so sleeves can be a different colour from the top (an add-on), the same way outfit colours work elsewhere. Demo: navy top + crimson sleeves, `3d/reports/top_combined_addon.png`.
- Still open: the chest specks, torso length (still crop), and testing on the superhero body.

## Men's set (started)
- Singlet: male Knight cloth piece, belt removed (`NOCUT=1 HEM_Z=1.16 fit_by_offset.py`). Clean, sleeveless, no bust. APPROVED candidate: `3d/reports/singlet_male.png`, `3d/out/singlet_male.gltf`. Crop-length hem (1.16).
- Shorts: male boolean leggings, SHORT_LINE=0.62. Clean. `3d/reports/shorts_male.png`, `3d/out/shorts_male.gltf`.
- Trackpants: male boolean leggings, THICK=0.012, ANKLE_LINE=0.12 (raised from 0.08 to stop the ankle flares). Clean. `3d/reports/trackpants_male2.png`, `3d/out/trackpants_male.gltf` (the file on disk is from the first run; re-run with ANKLE_LINE=0.12 THICK=0.012 before use).
- Tee: NOT approved. Torso (HEM 1.02) keeps the belt band; sleeves (`make_sleeves.py` male, short) show spikes at the shoulder join. Render: `3d/reports/tee_combined_male.png`.
- Loose shorts (THICK=0.03, SHORT_LINE=0.55): `3d/reports/shorts_loose_male.png`, `3d/out/shorts_loose_male.gltf`. Clean. Uniform looseness, no drape.
- Loose trackpants (THICK=0.03, ANKLE_LINE=0.12): `3d/reports/trackpants_loose_male.png`, `3d/out/trackpants_loose_male.gltf`. Clean. Uniform looseness, no drape or cuff.
- Bike shorts and skins (tight) for men: the same script with THICK=0.008.

## Men's singlet and tee: NOT approved (status)
- Singlet v1 (Knight male cloth, belt removed): crop length. Rejected by the user.
- Torso from the body's own skin (`make_torso_bool.py`): first try selected too narrow a chest (`singlet_loose_male.png`, bowl-shaped); widened (`singlet_loose_male2.png`): shows chest and abs through the shell, so it hugs the body. Rejected.
- Baggy fit needs a real garment shape (flat front panel, hem that hangs free), not a uniform shell on the body skin.
- Tee sleeves: spikes at the shoulder join (`tee_combined_male.png`).
- Next options: a flat-front male tee/singlet from another piece in the pack, or model the panels by hand.
