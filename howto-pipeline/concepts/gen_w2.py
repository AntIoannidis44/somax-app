"""Worker 2 generator. Copy of gen.py pipeline with own cost log + $12 cap.
Usage: python3 gen_w2.py <variantId> [<variantId> ...]   (runs them in parallel, one attempt each)
Prompts live in prompts_w2.json keyed by variantId.
Attempt images go to ATT_DIR/<variantId>_a<k>.png; accepted ones are copied to ../images/_pending by hand.
"""
import base64, json, sys, os, threading, urllib.request, fcntl
from concurrent.futures import ThreadPoolExecutor

ROOT = "/Users/ngalnyaatkinson/claude project/fitness app"
ENV = os.path.join(ROOT, "somax-app", ".env")
REF_DIR = os.path.join(ROOT, "exercise-howto", "concepts")
COST_LOG = os.path.join(REF_DIR, "cost_log_w2.json")
PROMPTS = os.path.join(REF_DIR, "prompts_w2.json")
ATT_DIR = os.path.join(ROOT, "exercise-howto", "concepts", "attempts_w2")
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
         "identical camera framing as specified above in both). Each panel is numbered at its own top-left corner "
         "with a circular badge drawn as an OUTLINE ONLY: a thin dark-grey ring with a bold dark-grey digit (1 or 2) "
         "centred inside, the inside of the ring the same light-grey as the background - NOT a filled/solid dark "
         "disc, and never a bare numeral without its ring. Panel 1 is the starting position, panel 2 is the end "
         "position of the movement, and the two panels must show clearly different body positions. The character "
         "faces the SAME direction and is seen from the SAME camera angle in both panels (not mirrored), and her/his "
         "whole body including raised hands and feet sits fully inside each panel with a clear margin. Add a short "
         "plain dark-grey/black downward-pointing vertical arrow in the gap between the two panels (the arrow must "
         "be dark grey or black, never red or any other colour). On the body in both panels, overlay the primary "
         "working muscle group in a solid flat red tint{SEC_CLAUSE}, like an anatomical muscle-highlight diagram, "
         "without hiding the character's identity underneath; colour ONLY the muscles named below, on the limb/side named, and leave every other body part uncoloured. No other text,labels or watermarks - only the two "
         "circled numbers and the arrow. ")

CHAR = {
    "female": ("CHARACTER: the EXACT SAME FEMALE character from the reference photo - same face, bald head, "
               "feminine chest and waist shape through her fitted blue short-sleeved top, black leggings and white "
               "trainers; she is a woman in both panels - do not change her gender, face or outfit. "),
    "male": ("CHARACTER: the EXACT SAME MALE character from the reference photo - same face, bald head, white "
             "t-shirt, grey shorts and white trainers; do not change his gender, face or outfit. "),
}

lock = threading.Lock()

def load_cost():
    if os.path.exists(COST_LOG):
        return json.load(open(COST_LOG))
    return {"total": 0.0, "count": 0, "entries": []}

def save_cost(state):
    tmp = COST_LOG + ".tmp"
    json.dump(state, open(tmp, "w"), indent=1)
    os.replace(tmp, COST_LOG)

def build_text(gender, p):
    sec = p.get("secondary")
    sec_clause = " and the secondary working muscle group in a lighter orange tint" if sec else \
        " (highlight ONLY this primary group, no other muscles coloured)"
    sec_sentence = f" Secondary muscle (lighter orange): {sec}." if sec else ""
    extra = (" " + p["extra"]) if p.get("extra") else ""
    return (RULES.format(SEC_CLAUSE=sec_clause) + CHAR[gender] + "Exercise: " +
            f"{p['name']} - {p['setup']}. Panel 1: {p['p1']}. Panel 2: {p['p2']}. "
            f"Primary muscle (solid red): {p['primary']}.{sec_sentence}{extra}")

class FileLock:
    def __enter__(self):
        self.f = open(COST_LOG + ".lock", "w"); fcntl.flock(self.f, fcntl.LOCK_EX); return self
    def __exit__(self, *a):
        fcntl.flock(self.f, fcntl.LOCK_UN); self.f.close()

def reserve(out_path):
    with lock, FileLock():
        st = load_cost()
        if round(st["total"] + COST_PER_IMAGE, 4) > HARD_STOP:
            return False
        st["total"] = round(st["total"] + COST_PER_IMAGE, 4)
        st["count"] += 1
        st["entries"].append({"out": out_path, "result": "pending", "running_total": st["total"]})
        save_cost(st)
        return True

def finish(out_path, result):
    with lock, FileLock():
        st = load_cost()
        for e in reversed(st["entries"]):
            if e["out"] == out_path and e["result"] == "pending":
                e["result"] = result
                break
        save_cost(st)

def gen_one(vid, gender, prompt_text):
    os.makedirs(ATT_DIR, exist_ok=True)
    k = 1
    while os.path.exists(os.path.join(ATT_DIR, f"{vid}_a{k}.png")) or os.path.exists(os.path.join(ATT_DIR, f"{vid}_a{k}.claim")):
        k += 1
    out_path = os.path.join(ATT_DIR, f"{vid}_a{k}.png")
    open(out_path[:-4] + ".claim", "w").write(prompt_text)
    if not reserve(out_path):
        os.remove(out_path[:-4] + ".claim")
        return vid, "BUDGET_STOP", None
    img = base64.b64encode(open(os.path.join(REF_DIR, f'ref_{gender}.png'), 'rb').read()).decode()
    reqbody = {'contents': [{'parts': [{'inline_data': {'mime_type': 'image/png', 'data': img}},
                                        {'text': prompt_text}]}],
               'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'imageSize': '2K'}}}
    req = urllib.request.Request(
        f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent',
        data=json.dumps(reqbody).encode(),
        headers={'x-goog-api-key': KEY, 'content-type': 'application/json'})
    result = None
    try:
        d = json.load(urllib.request.urlopen(req, timeout=300))
        result = f"NO_IMAGE: {json.dumps(d)[:300]}"
        for part in d['candidates'][0]['content']['parts']:
            if 'inlineData' in part:
                open(out_path, 'wb').write(base64.b64decode(part['inlineData']['data']))
                result = "ok"
                break
    except Exception as e:
        body = getattr(e, "read", lambda: b"")()
        result = f"ERR {e} {body[:300]}"
    finish(out_path, result)
    return vid, result, out_path

if __name__ == "__main__":
    prompts = json.load(open(PROMPTS))
    ids = sys.argv[1:]
    with ThreadPoolExecutor(max_workers=6) as ex:
        futs = [ex.submit(gen_one, v, prompts[v]["gender"], build_text(prompts[v]["gender"], prompts[v])) for v in ids]
        for f in futs:
            vid, res, path = f.result()
            print(vid, res, path)
    print("TOTAL", load_cost()["total"])
