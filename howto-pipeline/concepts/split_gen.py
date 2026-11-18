"""One pose per call (owner 2026-11-18: 'no fails'). Batch A: start pose for new items + end pose for items whose
start pose already exists. Batch B: end pose for the new items, generated FROM their approved start pose so the
person, outfit, camera and props carry over. compose() stacks the two and adds badges/arrow (postprocess).

  python3 split_gen.py build A|B      python3 split_gen.py submit A|B      python3 split_gen.py fetch A|B
  python3 split_gen.py compose
"""
import base64, io, json, os, sys
from PIL import Image
import gen_batch as gb
from gen_v2 import CAMERA, IDENTITY

HERE = os.path.dirname(os.path.abspath(__file__))
SP = os.path.join(HERE, "split")
specs = json.load(open(os.path.join(SP, "specs_split.json")))
gb.HARD_BUDGET_AUD = 10.0            # owner: whatever is left (~AUD 10), nothing more
gb.BUDGET_EPOCH = 3
gb.HARD_BUDGET_USD = round(gb.HARD_BUDGET_AUD / gb.AUD_PER_USD_PESSIMISTIC, 2)


def b64(path, fmt="PNG", maxw=None):
    im = Image.open(path).convert("RGB")
    if maxw:
        im.thumbnail((maxw, maxw * 2))
    buf = io.BytesIO(); im.save(buf, fmt, quality=90)
    return base64.b64encode(buf.getvalue()).decode()


def tint(s):
    return (f"Muscle highlight: tint ONLY {s['paintOn']} in flat solid red (primary: {s['primary']}), like an anatomy chart, "
            f"not realistic skinned muscle. Do NOT tint {s['doNotPaint']}.")


COMMON = ("ONE single image (not split into panels), portrait, plain light-grey background, whole body and all equipment "
          "inside the frame. Clean stylised 3D game-render instructional style like the graphics on gym machines. "
          "No numbers, arrows, labels, text, logos, frames or borders.")


def start_text(s):
    t = (f"Draw {IDENTITY[s['gender']]}. Exercise: {s['canonicalName']}. Equipment: {s['equipment']}. "
         f"Camera: {CAMERA[s['camera']]} Pose: {s['p1']}. {tint(s)} {COMMON}")
    if s.get("poseRef"):
        t += (f" POSE REFERENCE: the SECOND image is a real photo of this exercise ({s['poseRefNote']}). Copy that body "
              "position exactly, drawn as the character from the FIRST image - do not copy the photo's person, room or clothes.")
    return t


def end_text(s):
    t = ("The FIRST image is the START position of an exercise how-to. Draw the END position as ONE new image: the EXACT same "
         "person, face, outfit, skin tone, equipment, background, lighting and camera angle as the first image - change ONLY the "
         f"body position. Exercise: {s['canonicalName']}. END position: {s['p2']}. {tint(s)} {COMMON} "
         "The end position MUST look clearly different from the start position.")
    if s.get("poseRef"):
        t += f" POSE REFERENCE: the LAST image is a real photo ({s['poseRefNote']}) - copy that body position."
    return t


def req(parts):
    return {"contents": [{"role": "user", "parts": parts}],
            "generationConfig": {"responseModalities": ["IMAGE"], "candidateCount": 1, "imageConfig": {"imageSize": "2K"}}}


def build(phase):
    out = os.path.join(SP, f"batch_{phase}.jsonl")
    n = 0
    with open(out, "w") as f:
        for s in specs:
            v = s["variantId"]
            ref = {"inline_data": {"mime_type": "image/png", "data": b64(os.path.join(HERE, f"ref_{s['gender']}.png"))}}
            pose = ([{"inline_data": {"mime_type": "image/jpeg", "data": b64(os.path.join(HERE, s["poseRef"]), "JPEG")}}]
                    if s.get("poseRef") else [])
            p1 = os.path.join(SP, f"{v}_p1.png")
            if phase == "A" and s["p1"]:
                parts = [ref] + pose + [{"text": start_text(s)}]; key = f"{v}#p1"
            elif (phase == "A" and not s["p1"]) or (phase == "B" and s["p1"] and not s["single"]):
                if not os.path.exists(p1):
                    print("skip (no approved start pose yet)", v); continue
                parts = ([{"inline_data": {"mime_type": "image/jpeg", "data": b64(p1, "JPEG", 1100)}}, ref]
                         + pose + [{"text": end_text(s)}]); key = f"{v}#p2"
            else:
                continue
            f.write(json.dumps({"key": key, "request": req(parts)}) + "\n"); n += 1
    print(f"phase {phase}: {n} requests, US${n * gb.BATCH_PRICE:.2f} (~AUD {n * gb.BATCH_PRICE * gb.AUD_PER_USD_PESSIMISTIC:.2f}); "
          f"epoch cap AUD {gb.HARD_BUDGET_AUD}, already committed US${gb._spent()[1]:.2f}")


def fetch(phase):
    st, j = gb._job(f"split-{phase}")
    job = gb._req(f"{gb.API}/v1beta/{j['batch']}")
    if not job.get("done"):
        sys.exit("not finished")
    out = (job.get("response") or {}).get("responsesFile") or job.get("metadata", {}).get("output", {}).get("responsesFile")
    body, _ = gb._req(f"{gb.API}/download/v1beta/{out}:download?alt=media", raw=True)
    got = extra = 0
    for line in body.decode().splitlines():
        r = json.loads(line); vid, which = r["key"].split("#")
        parts = (((r.get("response") or {}).get("candidates") or [{}])[0].get("content") or {}).get("parts", [])
        imgs = [p for p in parts if "inlineData" in p]
        if not imgs: print("missing", r["key"]); continue
        extra += len(imgs) - 1
        name = f"{vid}_{which}.png" if which == "p2" else f"{vid}_p1_new.png"
        open(os.path.join(SP, name), "wb").write(base64.b64decode(imgs[0]["inlineData"]["data"])); got += 1
    print(f"saved {got}, extra images billed {extra}")


def compose():
    import postprocess as pp
    from PIL import ImageDraw
    done = 0
    for s in specs:
        v = s["variantId"]; p1 = os.path.join(SP, f"{v}_p1.png"); p2 = os.path.join(SP, f"{v}_p2.png")
        dst = os.path.join(HERE, "..", "images", "_pending_v2", f"{v}.png")
        if s["single"] and os.path.exists(p1):
            pp.fit_canvas(Image.open(p1)).save(dst); done += 1; continue
        if not (os.path.exists(p1) and os.path.exists(p2)):
            continue
        W, H = pp.W, pp.H; half = (H - 8) // 2
        canvas = Image.new("RGB", (W, H), pp.BG)
        for k, src in enumerate((p1, p2)):
            im = Image.open(src).convert("RGB"); sc = min(W / im.width, half / im.height)
            im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
            tile = pp.fit_canvas.__globals__["Image"].new("RGB", (W, half), im.getpixel((5, 5)))
            tile.paste(im, ((W - im.width) // 2, (half - im.height) // 2))
            canvas.paste(tile, (0, k * (half + 8)))
        div = half + 4
        pp.clean_corner(canvas, 0, div); pp.clean_corner(canvas, div, H)
        pp.draw_finish(canvas, div).save(dst); done += 1
    print("composed", done)


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "build": build(sys.argv[2])
    elif cmd == "submit": gb.submit(os.path.join(SP, f"batch_{sys.argv[2]}.jsonl"), f"split-{sys.argv[2]}")
    elif cmd == "fetch": fetch(sys.argv[2])
    elif cmd == "compose": compose()
