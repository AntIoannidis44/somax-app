"""Build somax-app/public/data/exercise-howto.json from every finished how-to image.

Sources (later ones override earlier ones, so the most-reviewed decision wins):
  1. live images (images/manifest.json) + the current public lookup (names already live)
  2. research/final-coverage.json   name -> variantId (original classification)
  3. research/review_mapping.json + review_noise.json   remaps / aliases / new variants (full review pass)
  4. research/remaining_316_decided.json   names of every remaining item + SHARE decisions (manual pass)
Images:
  - live:        images/<pattern>/<file>.jpg in Supabase (unchanged paths)
  - v1 accepted: images/_pending/<vid>.png   -> uploaded as v2/<vid>.jpg
  - v2 finished: images/_pending_v2/<vid>.png -> uploaded as v2/<vid>.jpg
  - female redraws (v1 kind 'regen', existing-NNN) replace the live male image of that variant (new path, so the
    live app is untouched until a new build ships this JSON).
Exercises with no image but an outside source get a link entry instead ({"link":..., "linkLabel":...}).

  python3 build_lookup.py            # dry run: prints the numbers, writes build/lookup_preview.json
  python3 build_lookup.py --write    # also writes somax-app/public/data/exercise-howto.json
"""
import json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
EH = os.path.join(ROOT, "exercise-howto")
J = lambda *p: json.load(open(os.path.join(EH, *p)))
PUBLIC = os.path.join(ROOT, "somax-app", "public", "data", "exercise-howto.json")

def norm(n):
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", n.lower())).strip()

man = J("images", "manifest.json")
cur = json.load(open(os.path.join(EH, "build", "live_base.json")))  # the LIVE lookup (140 images), never our own output
specs = {s["variantId"]: s for s in J("concepts", "specs_v2.json")}
specs.update({s["variantId"]: s for s in J("concepts", "specs_extra.json")})
queue = {i["variantId"]: i for i in J("concepts", "gen_queue.json")}
decided = J("research", "remaining_316_decided.json")

# ---- entries: start with the live ones (same order => current lookup indexes stay valid)
entries = [dict(e) for e in cur["entries"]]
path_to_idx = {m["filePath"]: k for k, m in enumerate(man)}

# ---- finished new images
V1_REJECTED = {"existing-071", "existing-074", "gap-n030", "new-031"}
v1 = {f[:-4] for f in os.listdir(os.path.join(EH, "images", "_pending")) if f.endswith(".png")} - V1_REJECTED
v2 = {f[:-4] for f in os.listdir(os.path.join(EH, "images", "_pending_v2")) if f.endswith(".png")}
v1 -= v2  # a v2 image of the same id is newer

def muscles(vid):
    s = specs.get(vid) or queue.get(vid) or {}
    conf = s.get("confidence") or "moderate"
    best = conf == "best-practice"
    prim = s.get("primary") or s.get("primaryMuscle") or ""
    if isinstance(prim, list): prim = ", ".join(prim)
    sec = None if best or conf in ("low", "low-moderate") else (s.get("secondary") or s.get("secondaryMuscle") or None)
    if isinstance(sec, list): sec = ", ".join(sec) or None
    return {"primary": prim, "secondary": sec, "confidence": "moderate" if best else conf, "bestPractice": best}

# v1 worker corrections to queue muscle data (see results_w3 notes)
MUSCLE_FIX = {"existing-075": {"secondary": None}, "new-018": {"secondary": None}}

vid_idx = {}
replaced_live = 0
for vid in sorted(v1 | v2):
    url = f"exercise-howto/v2/{vid}.jpg"
    q = queue.get(vid, {})
    if q.get("kind") == "regen" and q.get("existingImagePath") in path_to_idx:
        k = path_to_idx[q["existingImagePath"]]
        entries[k] = {**entries[k], "url": url}          # female redraw replaces the male render, same names
        vid_idx[vid] = k
        replaced_live += 1
        continue
    if q.get("kind") == "defect-redo" and vid in v2:
        # defect redos replace the live faulty image
        live = {"defect-barbell-shrug": "Barbell Shrug", "defect-standing-barbell-calf-raise": "Standing Barbell Calf Raise"}[vid]
        k = next(i for i, m in enumerate(man) if m["variant"] == live)
        entries[k] = {**entries[k], "url": url}
        vid_idx[vid] = k
        replaced_live += 1
        continue
    e = {"url": url, **muscles(vid), **MUSCLE_FIX.get(vid, {})}
    vid_idx[vid] = len(entries)
    entries.append(e)

# ---- variant id -> entry index for ids that point at LIVE images
vv = J("research", "visual-variants.json")
for r in vv:
    if r.get("existingImagePath") in path_to_idx and r["variantId"] not in vid_idx:
        vid_idx[r["variantId"]] = path_to_idx[r["existingImagePath"]]
fg = J("research", "full-gap-variants.json")
for r in (fg if isinstance(fg, list) else fg.get("variants", [])):
    p = r.get("existingImagePath") or r.get("existingImage")
    if p in path_to_idx:
        vid_idx.setdefault(r["variantId"], path_to_idx[p])
for k, m in enumerate(man):
    vid_idx.setdefault(f"L{k:03d}", k)
# defect redos that failed again keep pointing at the original live image (old picture beats none)
for vid, live in {"defect-barbell-shrug": "Barbell Shrug", "defect-standing-barbell-calf-raise": "Standing Barbell Calf Raise"}.items():
    vid_idx.setdefault(vid, next(i for i, m in enumerate(man) if m["variant"] == live))

lookup = dict(cur["lookup"])   # names already live
links = {}
def put(name, vid):
    if vid in vid_idx:
        lookup[norm(name)] = vid_idx[vid]
        return True
    return False

# 2. original classification
for r in J("research", "final-coverage.json"):
    if r["status"] in ("accurate", "needs-new-image", "needs-regeneration-wrong-gender") and r["variantId"]:
        for n in r.get("allPhrasingVariantsInLibrary") or [r["movement"]]:
            put(n, r["variantId"])
# 3. full review pass
for r in J("research", "review_mapping.json") + J("research", "review_noise.json"):
    v = r["verdict"]
    if v in ("remap", "alias-needed") and r.get("variantId"):
        put(r["exerciseName"], r["variantId"])
    elif v == "needs-new-variant" and r.get("newVariant"):
        if not put(r["exerciseName"], r["newVariant"]["key"]):
            lookup.pop(norm(r["exerciseName"]), None)   # never leave it on the wrong (old) image
# 4. manual pass on the remaining items
NAME_MOVES = {  # research 2026-11-18: names that belong to a different item than the one they were filed under
    "Band Frog": "nv-pilates-band-frog",
}
NAME_DROPS = {  # names whose movement differs from the drawn image - no image rather than a wrong one
    "gap-n004": ["Bulgarian jumps", "Bulgarian jumps side to side", "Split pogo (carioca return)"],
    "new-p3-006": ["Foam roll or massage-ball forearms, calves"],
}
# Owner-approved 2026-11-18: blank items share the nearest existing picture (no new spend)
ITEM_SHARE = {
    "nv-bw-calf-raise": "L063", "nv-single-leg-calf-raise": "L063", "nv-single-leg-db-calf-raise": "L063",
    "nv-standing-toe-raise-support": "existing-130", "nv-ankle-rocks": "nv-ankle-driver-hold",
    "new-025": "existing-002", "new-033": "new-115", "new-030": "new-115", "nv-scapular-pullup": "L032",
    "new-009": "L088",
}
for d in decided:
    vid = d["id"]
    tgt = ITEM_SHARE.get(vid, vid) if vid not in vid_idx else vid
    if d["decision"] == "SHARE":
        t = (d.get("nearest") or "").split(" ")[0]
        tgt = decided[int(t[1:])]["id"] if t.startswith("#") else t
    for n in d["names"]:
        if n in NAME_DROPS.get(vid, []):
            lookup.pop(norm(n), None); continue
        if n in NAME_MOVES:
            put(n, NAME_MOVES[n]); continue
        if not put(n, tgt):
            lookup.pop(norm(n), None)   # its old mapping was judged wrong; no image beats a wrong image

# coverage items that were never connected
for name, tgt in {"Dumbbell box step-over": "new-115", "A-skip (carioca return)": "L057", "Hands to Feet (Pada Hastasana)": "L124",
                  "Modified Hundred (legs table top, head down if needed)": "nv-hundred-modified"}.items():
    put(name, tgt)

# split-pose items generated under new ids for names that belonged to a different item
for name, tgt in {"Split pogo (carioca return)": "gap-n004b", "Foam roll or massage-ball forearms, calves": "new-p3-006b",
                  "90/90 Hip Lift-offs (5s hold)": "gap-n011", "90/90 Hip Switches": "gap-n011", "90/90 Hold with forward lean": "gap-n011",
                  "90/90 Hold with lean": "gap-n011", "90/90 hip hold": "gap-n011", "90/90 Hip Hold": "gap-n011", "Band Y-T-W Raise": "new-128", "Prone Y-T-W Raise": "new-128",
                  "Wrist Prep": "new-p3-008", "Wrist Flexor & Extensor Stretch": "new-p3-008", "Wrist flexor and extensor stretch": "new-p3-008",
                  "Wrist and Forearm Stretch": "new-p3-008", "Wrist circles and flexor/extensor stretch": "new-p3-008",
                  "Wrist Prep (circles, palm lifts, rocks)": "new-p3-008", "Wrist & shoulder prep": "new-p3-008",
                  "Wrist, shoulder & scapular prep": "new-p3-008", "Radial and ulnar deviation": "new-p3-008",
                  "Finger Marching": "nv-finger-marching", "Finger Marching (3 movements, ~10s hold each)": "nv-finger-marching",
                  "Spine Twist": "gap-n-exist-004", "Spine Twist (seated)": "gap-n-exist-004", "Spine Stretch Forward": "gap-n-exist-003",
                  "Lizard Pose": "gap-y-exist-002", "Garland Squat (Malasana)": "new-039", "Plank + reach + band": "nv-band-plank-reach", "T-spine rotation + band": "nv-band-tspine-rotation",
                  "Reverse Wrist Curl (slow lower)": "new-080"}.items():
    put(name, tgt)

# ---- AUDIT 2026-11-18 (owner found pelvic tilt on a bridge picture): every name checked against its picture by eye.
# "-" = movement not shown by that picture (removed); otherwise moved to the picture that does show it.
for name, act in json.load(open(os.path.join(EH, "build", "audit_fixes.json"))).items():
    k = norm(name)
    if act == "-":
        # -1 = "known name, no picture": the app's matcher stops here instead of falling back to a
        # shorter name ("Cable Fly (low to high)" must not open the high-pulley fly via "cable fly").
        lookup[k] = -1
    else:
        tgt = act
        if tgt in vid_idx:
            lookup[k] = vid_idx[tgt]
        else:
            lookup.pop(k, None)
            print("AUDIT target missing, removed:", name, "->", tgt)

# ---- STANDARD NAMES (audit 2026-11-19): one canonical name per picture, pattern
# "Equipment Position/Angle Movement (variation)". Added only where the name is not already mapped or blocked.
canon_path = os.path.join(EH, "audit", "canonical_names.json")
if os.path.exists(canon_path):
    for name, tgt in json.load(open(canon_path)).items():
        for k in {norm(name), norm(re.sub(r"\([^)]*\)", " ", name))}:
            if k and k not in lookup and tgt in vid_idx:
                lookup[k] = vid_idx[tgt]

# ---- common gym wording for movements we already show (each checked against its picture, 2026-11-18)
for name, tgt in {"flat dumbbell bench press": "L003", "dumbbell bench press flat": "L003", "flat bench dumbbell press": "L003",
                  "barbell bicep curl": "nv-barbell-curl", "barbell biceps curl": "nv-barbell-curl", "bicep curl": "L073",
                  "tricep extension": "L072", "triceps extension": "L072", "tricep overhead extension": "L072",
                  "crunches": "L075", "russian twist": "L025", "side plank": "L110", "plank": "L109",
                  "lat pull down": "L020", "cable row": "L010", "leg curl machine": "L097", "leg extension machine": "L098",
                  "incline barbell bench press": "L005", "machine shoulder press": "new-062", "shoulder press machine": "new-062"}.items():
    put(name, tgt)

# ---- outside-source links for exercises left without an image
SOURCE_LINKS = {
    "Burpee side roll": ("https://cdn.shopify.com/s/files/1/0528/3718/7753/files/Muashi_Sports_Training_Program_AFL.pdf", "Musashi AFL program (PDF)"),
}
extra = json.load(open(os.path.join(EH, "concepts", "source_links.json"))) if os.path.exists(os.path.join(EH, "concepts", "source_links.json")) else {}
for n, (url, label) in {**SOURCE_LINKS, **{k: tuple(v) for k, v in extra.items()}}.items():
    if lookup.get(norm(n), -1) == -1:
        links[norm(n)] = {"link": url, "linkLabel": label}

# ---- PICTURE NAMES (audit 2026-11-19): every picture carries its exercise name + reviewed alternative names.
# tests/howto-name-gate.test.ts fails if any exercise name opens a picture whose name it does not match.
names_path = os.path.join(EH, "audit", "picture_names.json")
if os.path.exists(names_path):
    for vid, rec in json.load(open(names_path)).items():
        for e in entries:
            if e["url"].split("/")[-1][:-4] == vid:
                e["name"] = rec["name"]
                if rec.get("aka"):
                    e["aka"] = rec["aka"]

out = {"entries": entries, "lookup": lookup, "links": links}
os.makedirs(os.path.join(EH, "build"), exist_ok=True)
json.dump(out, open(os.path.join(EH, "build", "lookup_preview.json"), "w"))
uploads = sorted((vid, "_pending_v2" if vid in v2 else "_pending") for vid in (v1 | v2))
json.dump(uploads, open(os.path.join(EH, "build", "uploads.json"), "w"), indent=0)
print(f"entries {len(entries)} (live 140, new {len(entries) - 140}, live replaced by redraws {replaced_live}); "
      f"names with an image {sum(1 for v in lookup.values() if v >= 0)}, blocked {sum(1 for v in lookup.values() if v < 0)} (was {len(cur['lookup'])}); source links {len(links)}; images to upload {len(uploads)}")
if "--write" in sys.argv:
    json.dump(out, open(PUBLIC, "w"))
    print("wrote", PUBLIC)
