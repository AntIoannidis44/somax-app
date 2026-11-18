"""After `gen_batch.py fetch <label>`: build labelled contact sheets of every returned image
(spec name, gender, camera, the panel-2 'delta' it must show) so each one can be checked
by eye against its spec. Sheets go to ../review_sheets/<label>/s<NN>.jpg, 6 per sheet.

  python3 review_batch.py main
"""
import json, os, sys, textwrap
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
label = sys.argv[1] if len(sys.argv) > 1 else "main"
specs = {s["variantId"]: s for s in json.load(open(os.path.join(HERE, "specs_v2.json")))}
specs.update({s["variantId"]: s for s in json.load(open(os.path.join(HERE, "specs_extra.json")))})
fixes = json.load(open(os.path.join(HERE, "fixes_retry.json"))) if os.path.exists(os.path.join(HERE, "fixes_retry.json")) else {}
src = os.path.join(HERE, "attempts_v2")
files = sorted(f for f in os.listdir(src) if f.endswith(f"_{label}_a.png") or f.endswith(f"_{label}_b.png"))
out = os.path.join(HERE, "..", "review_sheets", label)
os.makedirs(out, exist_ok=True)
W, H, C, R, HEAD = 440, 656, 3, 2, 92
try:
    font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 15)
except OSError:
    font = ImageFont.load_default()
for n in range(0, len(files), C * R):
    sheet = Image.new("RGB", (W * C, (H + HEAD) * R), "white")
    d = ImageDraw.Draw(sheet)
    for k, f in enumerate(files[n:n + C * R]):
        vid = f.rsplit(f"_{label}_", 1)[0]
        s = specs.get(vid, {})
        im = Image.open(os.path.join(src, f)).convert("RGB")
        im.thumbnail((W - 6, H))
        x, y = (k % C) * W, (k // C) * (H + HEAD)
        sheet.paste(im, (x + 3, y + HEAD))
        d.text((x + 4, y + 2), f"{vid} [{s.get('gender', '?')[:1].upper()}] {s.get('cameraPreset', '')}", fill="black", font=font)
        d.text((x + 4, y + 20), str(s.get("canonicalName", ""))[:48], fill="blue", font=font)
        delta = ("FIX: " + fixes[vid]) if vid in fixes else (s.get("delta") or "(single panel)")
        for i, line in enumerate(textwrap.wrap(("" if delta.startswith("FIX") else "Δ ") + delta, 58)[:3]):
            d.text((x + 4, y + 40 + i * 16), line, fill=(120, 60, 0), font=font)
    sheet.save(os.path.join(out, f"s{n // (C * R):02d}.jpg"), quality=86)
print(f"{len(files)} images -> {out} ({(len(files) + C * R - 1) // (C * R)} sheets)")
