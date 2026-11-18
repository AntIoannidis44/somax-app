# Sample exercise how-to images, made with Nano Banana Pro from renders of
# the app's own base/neutral characters, same approach as gym-wardrobe's
# clothing concepts - keeps the exact same character identity (body, face,
# skin tone, style) so these read as "our character doing the exercise",
# not a generic stock illustration.
import base64, json, sys, urllib.request, concurrent.futures as cf, os
ENV = os.path.join(os.path.dirname(__file__), '..', '..', 'somax-app', '.env')
KEY = [l.split('=', 1)[1].strip().strip('"\'') for l in open(ENV) if l.startswith('GEMINI_API_KEY=')][0]
MODEL = 'gemini-3-pro-image'
RULES = ("This is a render of a 3D game character, used as a gym exercise how-to graphic, in the style of the "
         "instructional diagrams found on gym machines. Keep the character's identity the same - same bald head, "
         "face, skin tone, body proportions and the same clean stylised 3D game render look - but change the pose "
         "and setting to perform the exercise described below. CAMERA (use exactly this gentle framing, identical "
         "for every exercise and every character so the whole library matches): a mild three-quarter angle, "
         "camera only slightly elevated above the equipment's own height, positioned close to the foot end of the "
         "bench/equipment and turned only about 15-20 degrees off a straight side-on view - NOT a steep diagonal. "
         "The bench and barbell should read as close to horizontal across the frame as the pose allows, with both "
         "weight plates clearly visible near the left and right edges of the frame and the character's whole body "
         "and the equipment's legs fully inside the frame, not cropped. Lay the image out as a "
         "SINGLE graphic, portrait orientation, on a plain light-grey background, containing exactly 2 panels of "
         "EQUAL size stacked directly on top of each other (panel 1 above, panel 2 directly below it, identical "
         "camera framing as specified above in both), each numbered in a small circle at its own top-left corner: "
         "panel 1 is the starting position, panel 2 is the end position of the movement. Add a short vertical "
         "arrow in the gap between the two panels showing the direction of motion. On the body in both panels, "
         "overlay the primary working muscle group in a solid flat red tint and the secondary muscle group in a "
         "lighter orange tint, like an anatomical muscle-highlight diagram, without hiding the character's "
         "identity underneath. No other text, labels or watermarks. Exercise: "
         )
EXERCISES = {
  'bench-press': 'Barbell bench press - lying on a flat bench, gripping a loaded barbell slightly wider than shoulder width. Panel 1: arms fully extended holding the bar above the chest. Panel 2: bar lowered to touch the mid-chest, elbows at roughly 45 degrees. Primary muscle: chest (pectorals). Secondary muscle: front shoulders and triceps.',
}
def gen(exercise, base):
    img = base64.b64encode(open(f'ref_{base}.png', 'rb').read()).decode()
    body = {'contents': [{'parts': [{'inline_data': {'mime_type': 'image/png', 'data': img}}, {'text': RULES + EXERCISES[exercise]}]}],
            'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'imageSize': '2K'}}}
    req = urllib.request.Request(f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent',
                                 data=json.dumps(body).encode(), headers={'x-goog-api-key': KEY, 'content-type': 'application/json'})
    try:
        d = json.load(urllib.request.urlopen(req, timeout=300))
        for part in d['candidates'][0]['content']['parts']:
            if 'inlineData' in part:
                open(f'{exercise}_{base}.png', 'wb').write(base64.b64decode(part['inlineData']['data'])); return f'{exercise}_{base} ok'
        return f'{exercise}_{base} no image: {json.dumps(d)[:300]}'
    except Exception as e:
        return f'{exercise}_{base} ERR {e} {getattr(e, "read", lambda: b"")()[:300]}'
jobs = [(e, b) for e in (sys.argv[1:] or EXERCISES) for b in ('female', 'male')]
with cf.ThreadPoolExecutor(4) as ex:
    for r in ex.map(lambda j: gen(*j), jobs): print(r, flush=True)
