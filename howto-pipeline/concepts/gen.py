import base64, json, sys, os, time, urllib.request, urllib.error

ROOT = "/Users/ngalnyaatkinson/claude project/fitness app"
ENV = os.path.join(ROOT, "somax-app", ".env")
REF_DIR = os.path.join(ROOT, "exercise-howto", "concepts")
IMG_DIR = os.path.join(ROOT, "exercise-howto", "images")
COST_LOG = os.path.join(ROOT, "exercise-howto", "concepts", "cost_log.json")
COST_PER_IMAGE = 0.134
HARD_STOP = 36.0

KEY = [l.split('=', 1)[1].strip().strip('"\'') for l in open(ENV) if l.startswith('GEMINI_API_KEY=')][0]
MODEL = 'gemini-3-pro-image'

RULES = ("This is a render of a 3D game character, used as a gym exercise how-to graphic, in the style of the "
         "instructional diagrams found on gym machines. Keep the character's identity the same - same bald head, "
         "face, skin tone, body proportions and the same clean stylised 3D game render look - but change the pose "
         "and setting to perform the exercise described below. CAMERA (use exactly this gentle framing, identical "
         "for every exercise and every character so the whole library matches): a mild three-quarter angle, "
         "camera only slightly elevated above the equipment's own height, positioned close to the foot end of the "
         "bench/equipment and turned only about 15-20 degrees off a straight side-on view - NOT a steep diagonal. "
         "The bench and any equipment should read as close to horizontal across the frame as the pose allows, with "
         "the character's whole body and the equipment's legs fully inside the frame, not cropped. Lay the image "
         "out as a SINGLE graphic, portrait orientation, on a plain light-grey background, containing exactly 2 "
         "panels of EQUAL size stacked directly on top of each other (panel 1 above, panel 2 directly below it, "
         "identical camera framing as specified above in both), each numbered in a small circle at its own "
         "top-left corner: panel 1 is the starting position, panel 2 is the end position of the movement. Add a "
         "short vertical arrow in the gap between the two panels showing the direction of motion. On the body in "
         "both panels, overlay the primary working muscle group in a solid flat red tint{SEC_CLAUSE}, like an "
         "anatomical muscle-highlight diagram, without hiding the character's identity underneath. No other text, "
         "labels or watermarks. Exercise: ")

def load_cost():
    if os.path.exists(COST_LOG):
        return json.load(open(COST_LOG))
    return {"total": 0.0, "count": 0, "entries": []}

def save_cost(state):
    json.dump(state, open(COST_LOG, "w"), indent=1)

def build_text(movement, setup, p1, p2, primary, secondary):
    sec_clause = " and the secondary working muscle group in a lighter orange tint" if secondary else ""
    rules = RULES.format(SEC_CLAUSE=sec_clause)
    sec_sentence = f" Secondary muscle: {secondary}." if secondary else ""
    body = (f"{movement} - {setup}. Panel 1: {p1}. Panel 2: {p2}. "
            f"Primary muscle: {primary}.{sec_sentence}")
    return rules + body

def gen_one(gender, prompt_text, out_path):
    state = load_cost()
    if state["total"] >= HARD_STOP:
        return False, "BUDGET_STOP", state
    img = base64.b64encode(open(os.path.join(REF_DIR, f'ref_{gender}.png'), 'rb').read()).decode()
    reqbody = {'contents': [{'parts': [{'inline_data': {'mime_type': 'image/png', 'data': img}},
                                        {'text': prompt_text}]}],
               'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'imageSize': '2K'}}}
    req = urllib.request.Request(
        f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent',
        data=json.dumps(reqbody).encode(),
        headers={'x-goog-api-key': KEY, 'content-type': 'application/json'})
    result = None
    err = None
    try:
        d = json.load(urllib.request.urlopen(req, timeout=300))
        got = False
        for part in d['candidates'][0]['content']['parts']:
            if 'inlineData' in part:
                os.makedirs(os.path.dirname(out_path), exist_ok=True)
                open(out_path, 'wb').write(base64.b64decode(part['inlineData']['data']))
                got = True
                result = "ok"
                break
        if not got:
            result = f"NO_IMAGE: {json.dumps(d)[:400]}"
    except Exception as e:
        body = getattr(e, "read", lambda: b"")()
        err = f"ERR {e} {body[:400]}"
        result = err
    # count this attempt toward spend regardless of success per instructions
    state = load_cost()
    state["total"] = round(state["total"] + COST_PER_IMAGE, 4)
    state["count"] += 1
    state["entries"].append({"out": out_path, "result": result, "running_total": state["total"]})
    save_cost(state)
    return (result == "ok"), result, state

if __name__ == "__main__":
    # simple CLI test hook, not used for the bulk run
    pass
