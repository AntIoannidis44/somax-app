"""v2 how-to image generator - see GEN_BRIEF.md. Sequential, spec-driven, edit-based fixes.

  python3 gen_v2.py render <variantId>                 # fresh render from specs_v2.json
  python3 gen_v2.py fix <variantId> <failed.png> "<exact fix>"   # edit the failed render
  python3 gen_v2.py prompt <variantId>                 # print the prompt only (no cost)
Renders go to attempts_v2/<id>_c<N>.png; the caller checks them, then runs postprocess.py.
"""
import base64, json, os, re, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
KEY = [l.split("=", 1)[1].strip().strip("\"'") for l in open(os.path.join(ROOT, "somax-app", ".env"))
       if l.startswith("GEMINI_API_KEY=")][0]
MODEL = "gemini-3-pro-image"
COST_PER_CALL = 0.134
HARD_STOP = 0.0          # USD - owner sets this per run; 0 = no spend allowed
COST_LOG = os.path.join(HERE, "cost_log_v2.json")
SPECS = os.path.join(HERE, "specs_v2.json")
OUT = os.path.join(HERE, "attempts_v2")

CAMERA = {
    "standing": "Camera at chest height, about 20 degrees off a straight side-on view, whole body head to feet in frame.",
    "floor-supine": "Camera slightly elevated (about 25 degrees above the floor), side-on to the mat from her/his hip side, whole body and mat in frame; torso clearly visible, not foreshortened.",
    "floor-prone": "Camera slightly elevated (about 25 degrees), side-on to the mat, whole body in frame, head end on the left.",
    "floor-side": "Camera slightly elevated, looking at the front of the body while lying on the side, whole body in frame.",
    "quadruped": "Camera at hip height, about 20 degrees off side-on, whole body including hands and feet in frame.",
    "bench": "Camera slightly above bench height, near the foot end of the bench, about 15-20 degrees off side-on; bench reads nearly horizontal; whole body and bench legs in frame.",
    "machine": "Camera at chest height, about 25 degrees off side-on so both the body and the machine's moving part are clearly visible; whole machine and body in frame.",
    "hanging": "Camera at chest height, straight-on to slightly off-side, the bar and the whole hanging body in frame.",
    "front": "Camera at chest height, straight in front of the person (they face the camera), whole body head to feet in frame, so sideways movement reads left-right across the image.",
    "seated": "Camera at seated eye height, about 20 degrees off side-on, whole body and seat in frame.",
}

IDENTITY = {
    "female": "the EXACT SAME FEMALE character from the reference photo - same bald head, face, skin tone, feminine chest and waist shape through her fitted blue top, black leggings, white sneakers; do not change her gender",
    "male": "the EXACT SAME MALE character from the reference photo - same bald head, face, skin tone and build, white t-shirt, grey shorts, white sneakers",
}


def build_prompt(s):
    single = s.get("layout") == "single"
    layout = ("ONE panel only, portrait, plain light-grey background, empty top-left corner."
              if single else
              "Exactly TWO panels of equal size stacked vertically (panel 1 top = start, panel 2 bottom = end), "
              "separated by a thin plain white horizontal line at exactly half the image height, plain light-grey "
              "background, identical camera in both, the top-left corner of each panel left empty.")
    sec = ""
    if s.get("secondary"):
        sec = f" Tint the secondary muscles ({s['secondary']}) in a lighter flat orange."
    p = [
        "Clean stylised 3D game-render instructional diagram, like the exercise graphics printed on gym machines.",
        f"The person is {IDENTITY[s['gender']]}.",
        f"Exercise: {s['canonicalName']}. Equipment: {s['equipment']}.",
        f"Camera: {CAMERA[s['cameraPreset']]}",
        f"Layout: {layout}",
        f"Panel 1 (start): {s['panel1']}." + ("" if single else f" Panel 2 (end): {s['panel2']}."),
        f"Muscle highlight: tint ONLY {s['paintOn']} in flat solid red (primary: {s['primary']}).{sec} "
        f"Flat tint like an anatomy chart, not realistic skinned muscle. Do NOT tint: {s.get('doNotPaint', 'any other body part')}.",
        "Do NOT draw any numbers, arrows, labels, text, logos, frames or borders.",
    ]
    if s.get("mustNot"):
        p.append(f"Must NOT appear: {s['mustNot']}.")
    if s.get("rotation"):
        # v1 data: twists passed first time 3 of 12. "Twist" alone is ambiguous in a
        # still image - pin which way the chest faces relative to the CAMERA in each panel.
        p.append(f"Torso direction: in panel 1 {s['rotation'][0]}; in panel 2 {s['rotation'][1]}.")
    if not single:
        p.append(f"The difference between panel 1 and panel 2 MUST be obvious: {s['delta']}.")
    return " ".join(p)


def lint_spec(s):
    """Free pre-flight check - every rule here comes from v1's 56 failures vs 58 first-try passes.
    Returns a list of problems; gen_v2.py refuses to spend on a spec that has any."""
    probs = []
    text = " ".join(str(s.get(k, "")) for k in ("panel1", "panel2", "paintOn", "doNotPaint", "delta"))
    if re.search(r"\b(left|right)\b", text, re.I):
        probs.append("uses left/right (failed specs used it 66% vs 47% of first-try passes) - say 'the leg nearest the camera' / 'the raised leg'")
    if s.get("layout") != "single" and len(str(s.get("delta", "")).split()) < 6:
        probs.append("delta missing or vague - first-try passes stated how panel 2 differs 66% of the time vs 46% of failures")
    if re.search(r"rotat|twist", " ".join(str(s.get(k, "")) for k in ("canonicalName", "panel1", "panel2")), re.I) and not s.get("rotation"):
        probs.append("rotation exercise without a per-panel torso direction")
    for k in ("canonicalName", "gender", "equipment", "cameraPreset", "panel1", "paintOn", "primary"):
        if not s.get(k):
            probs.append(f"missing {k}")
    if s.get("cameraPreset") not in CAMERA:
        probs.append("unknown cameraPreset")
    return probs


def _cost():
    return json.load(open(COST_LOG)) if os.path.exists(COST_LOG) else {"total": 0.0, "calls": []}


def _call(parts, out_path, label):
    st = _cost()
    if st["total"] + COST_PER_CALL > HARD_STOP + 1e-9:
        sys.exit(f"BUDGET_STOP: spent {st['total']:.3f} of cap {HARD_STOP}")
    body = {"contents": [{"parts": parts}],
            "generationConfig": {"responseModalities": ["IMAGE"], "candidateCount": 1,
                                 "imageConfig": {"imageSize": "2K"}}}
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
        data=json.dumps(body).encode(), headers={"x-goog-api-key": KEY, "content-type": "application/json"})
    result = "ERR"
    try:
        d = json.load(urllib.request.urlopen(req, timeout=300))
        for part in d["candidates"][0]["content"]["parts"]:
            if "inlineData" in part:
                os.makedirs(OUT, exist_ok=True)
                open(out_path, "wb").write(base64.b64decode(part["inlineData"]["data"]))
                result = "ok"
                break
    except Exception as e:
        result = f"ERR {e}"
    st = _cost()                                     # bill every call, success or not
    st["total"] = round(st["total"] + COST_PER_CALL, 4)
    st["calls"].append({"label": label, "out": out_path, "result": result, "running_total": st["total"]})
    json.dump(st, open(COST_LOG, "w"), indent=1)
    print(result, out_path, f"spent {st['total']:.3f}")


def _img(path):
    return {"inline_data": {"mime_type": "image/png", "data": base64.b64encode(open(path, "rb").read()).decode()}}


def _next(vid):
    n = 1
    while os.path.exists(os.path.join(OUT, f"{vid}_c{n}.png")):
        n += 1
    return os.path.join(OUT, f"{vid}_c{n}.png")


if __name__ == "__main__":
    cmd, vid = sys.argv[1], sys.argv[2]
    spec = {s["variantId"]: s for s in json.load(open(SPECS))}[vid]
    if cmd in ("prompt", "render"):
        probs = lint_spec(spec)
        if probs:
            sys.exit("SPEC REJECTED (no money spent):\n- " + "\n- ".join(probs))
    if cmd == "prompt":
        print(build_prompt(spec))
    elif cmd == "render":
        _call([_img(os.path.join(HERE, f"ref_{spec['gender']}.png")), {"text": build_prompt(spec)}], _next(vid), f"{vid} render")
    elif cmd == "fix":
        failed, fix = sys.argv[3], sys.argv[4]
        text = (f"Edit this image. Keep EVERYTHING identical - same person, pose, camera, equipment, colours, layout - "
                f"except this one change: {fix}. Still no numbers, arrows or text.")
        _call([_img(failed), _img(os.path.join(HERE, f"ref_{spec['gender']}.png")), {"text": text}], _next(vid), f"{vid} fix")
