# Worker 1 copy of gen.py (see GEN_BRIEF.md). Changes: own COST_LOG, HARD_STOP 12.0,
# cost reserved under a file lock BEFORE each call so the cap can never be passed,
# plus the brief's prompt rules (circled badges, dark-grey arrow, gender lock).
import base64, json, sys, os, fcntl, urllib.request, concurrent.futures as cf

ROOT = "/Users/ngalnyaatkinson/claude project/fitness app"
ENV = os.path.join(ROOT, "somax-app", ".env")
REF_DIR = os.path.join(ROOT, "exercise-howto", "concepts")
COST_LOG = os.path.join(ROOT, "exercise-howto", "concepts", "cost_log_w1.json")
LOCK = COST_LOG + ".lock"
COST_PER_IMAGE = 0.134
HARD_STOP = 12.0

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

EXTRA = (" PANEL NUMBERS: each panel's number is a bold digit (1 or 2) centred inside a thin dark-grey circle "
         "OUTLINE (an unfilled ring, digit dark grey on the light background, not a filled disc) at the panel's "
         "top-left corner - never a bare numeral. ARROW: the arrow between the panels "
         "is short, plain dark grey/near-black, pointing down - never red or coloured. No other text anywhere.")

GENDER = {
    'female': (" CHARACTER: the EXACT SAME FEMALE character from the reference photo - same face, feminine chest "
               "and waist shape through her fitted blue short-sleeve top, black full-length leggings, white "
               "trainers; do not change her gender and do not make her look male in any pose."),
    'male': (" CHARACTER: the EXACT SAME MALE character from the reference photo - same face, white short-sleeve "
             "t-shirt, dark grey shorts, white trainers."),
}


def build_text(spec):
    sec = spec.get('secondary')
    sec_clause = " and the secondary working muscle group in a lighter orange tint" if sec else ""
    rules = RULES.format(SEC_CLAUSE=sec_clause)
    sec_sentence = (f" Secondary muscle (orange): {sec}." if sec else
                    " Highlight ONLY the primary muscle in red - no orange, no other highlighted muscles.")
    body = (f"{spec['movement']} - {spec['setup']}. Panel 1: {spec['p1']}. Panel 2: {spec['p2']}. "
            f"Primary muscle (red): {spec['primary']}.{sec_sentence}")
    return rules + body + EXTRA + GENDER[spec['gender']] + (" " + spec['extra'] if spec.get('extra') else "")


def reserve(label):
    with open(LOCK, 'w') as lf:
        fcntl.flock(lf, fcntl.LOCK_EX)
        state = json.load(open(COST_LOG)) if os.path.exists(COST_LOG) else {"total": 0.0, "count": 0, "entries": []}
        if state["total"] + COST_PER_IMAGE > HARD_STOP + 1e-9:
            return None
        state["total"] = round(state["total"] + COST_PER_IMAGE, 4)
        state["count"] += 1
        state["entries"].append({"out": label, "result": "reserved", "running_total": state["total"]})
        json.dump(state, open(COST_LOG, "w"), indent=1)
        return len(state["entries"]) - 1


def record(idx, result):
    with open(LOCK, 'w') as lf:
        fcntl.flock(lf, fcntl.LOCK_EX)
        state = json.load(open(COST_LOG))
        state["entries"][idx]["result"] = result
        json.dump(state, open(COST_LOG, "w"), indent=1)


def gen_one(spec, out_path):
    idx = reserve(out_path)
    if idx is None:
        return "BUDGET_STOP"
    img = base64.b64encode(open(os.path.join(REF_DIR, f"ref_{spec['gender']}.png"), 'rb').read()).decode()
    reqbody = {'contents': [{'parts': [{'inline_data': {'mime_type': 'image/png', 'data': img}},
                                        {'text': build_text(spec)}]}],
               'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'imageSize': '2K'}}}
    req = urllib.request.Request(
        f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent',
        data=json.dumps(reqbody).encode(),
        headers={'x-goog-api-key': KEY, 'content-type': 'application/json'})
    try:
        d = json.load(urllib.request.urlopen(req, timeout=300))
        result = None
        for part in d['candidates'][0]['content']['parts']:
            if 'inlineData' in part:
                os.makedirs(os.path.dirname(out_path), exist_ok=True)
                open(out_path, 'wb').write(base64.b64decode(part['inlineData']['data']))
                result = "ok"
                break
        if not result:
            result = f"NO_IMAGE: {json.dumps(d)[:300]}"
    except Exception as e:
        result = f"ERR {e} {getattr(e, 'read', lambda: b'')()[:300]}"
    record(idx, result)
    return result


if __name__ == "__main__":
    # usage: gen_w1.py specs.json outdir id1:attempt id2:attempt ...
    specs = json.load(open(sys.argv[1]))
    outdir = sys.argv[2]
    jobs = []
    for a in sys.argv[3:]:
        vid, att = a.split(':')
        jobs.append((vid, os.path.join(outdir, f"{vid}_a{att}.png")))
    def run(j):
        return j[0], j[1], gen_one(specs[j[0]], j[1])
    with cf.ThreadPoolExecutor(4) as ex:
        for vid, p, r in ex.map(run, jobs):
            print(vid, os.path.basename(p), r, flush=True)
    s = json.load(open(COST_LOG))
    print("TOTAL", s["total"], "COUNT", s["count"])
