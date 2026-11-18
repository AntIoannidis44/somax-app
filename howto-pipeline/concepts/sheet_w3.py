import sys, os
from PIL import Image, ImageDraw
fs = sys.argv[2:]
ims = [Image.open(os.path.join("w3_attempts", f + "_s.jpg")).convert("RGB") for f in fs]
ims = [i.resize((int(i.width * 1000 / i.height), 1000)) for i in ims]
W = sum(i.width for i in ims) + 10 * len(ims)
c = Image.new("RGB", (W, 1000), "black"); x = 0
for i in ims: c.paste(i, (x, 0)); x += i.width + 10
c.save(sys.argv[1], quality=90)
