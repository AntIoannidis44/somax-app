"""Deterministic finishing for how-to images (v2 pipeline).

The image model is only asked for the two stacked panels (bodies, equipment,
muscle tint). Everything that has a fixed house style is drawn here in code so
it can never fail: canvas size, divider line, outlined number badges, arrow.

Usage:
  python3 postprocess.py <in.png> <out.png>            # v2 image, no badges/arrow drawn by the model
  python3 postprocess.py --scrub-badges <in> <out>     # legacy image: paint over the model's own badges first
"""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageStat

W, H = 1696, 2528            # house canvas (matches the 140 live images)
BG = (233, 230, 225)         # house light-grey background
INK = (58, 58, 60)           # dark grey for badges + arrow
FONT = "/System/Library/Fonts/Helvetica.ttc"


def find_divider(im):
    """Row index of the bright divider between the two panels (searches 35-65% of height)."""
    g = im.convert("L")
    w, h = g.size
    best, best_row = -1, h // 2
    for y in range(int(h * 0.35), int(h * 0.65)):
        row = g.crop((int(w * 0.05), y, int(w * 0.95), y + 1))
        px = list(row.getdata())
        score = sum(1 for p in px if p >= 246) / len(px)   # share of near-white pixels (arrow/limbs may cross it)
        if score > best:
            best, best_row = score, y
    return best_row


def fit_canvas(im):
    """Scale to fit the house canvas without cropping. Padding repeats the image's own edge
    pixels, so it continues the render's background exactly instead of showing a different grey."""
    im = im.convert("RGB")
    s = min(W / im.width, H / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    c = Image.new("RGB", (W, H), BG)
    x0, y0 = (W - im.width) // 2, (H - im.height) // 2
    c.paste(im, (x0, y0))
    if x0 > 0:
        c.paste(im.crop((0, 0, 1, im.height)).resize((x0, im.height)), (0, y0))
        right = W - x0 - im.width
        c.paste(im.crop((im.width - 1, 0, im.width, im.height)).resize((right, im.height)), (x0 + im.width, y0))
    if y0 > 0:
        c.paste(c.crop((0, y0, W, y0 + 1)).resize((W, y0)), (0, 0))
        bottom = H - y0 - im.height
        c.paste(c.crop((0, y0 + im.height - 1, W, y0 + im.height)).resize((W, bottom)), (0, y0 + im.height))
    return c


def scrub_badges(im, div):
    """Cover the model-drawn badge in the top-left of each panel with the local background."""
    d = ImageDraw.Draw(im)
    for top in (0, div + 6):
        sample = im.getpixel((260, top + 30))
        d.rectangle((0, top + 4, 230, top + 230), fill=sample)
    return im


def fix_filled_badges(im):
    """Legacy images: find the model's filled dark badge discs in the left strip, paint them out,
    and redraw house-style outlined badges at the same centres. Returns number of badges fixed."""
    g = im.convert("L")
    w, h = g.size
    rows = {}
    for y in range(h):
        xs = [x for x in range(0, 360, 2) if g.getpixel((x, y)) < 80]
        if len(xs) >= 6:
            rows[y] = xs
    blobs, cur = [], []
    for y in sorted(rows):
        if cur and y - cur[-1] > 6:
            blobs.append(cur); cur = []
        cur.append(y)
    if cur:
        blobs.append(cur)
    blobs = [b for b in blobs if 50 <= len(b) <= 260][:2]
    d = ImageDraw.Draw(im)
    font = ImageFont.truetype(FONT, 78)
    for n, b in enumerate(blobs, 1):
        y0, y1 = b[0], b[-1]
        xs = [x for y in b for x in rows[y]]
        x0, x1 = min(xs), max(xs)
        cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
        bg = im.getpixel((min(w - 1, x1 + 40), cy))
        d.rectangle((x0 - 10, y0 - 10, x1 + 10, y1 + 10), fill=bg)
        r = 62
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=INK, width=7)
        d.text((cx, cy + 2), str(n), fill=INK, font=font, anchor="mm")
    return len(blobs)


def _bgish(p):
    r, g, b = p[:3]
    return min(r, g, b) > 150 and max(r, g, b) - min(r, g, b) < 22


def clean_corner(im, top, bottom):
    """Remove the stray light boxes/lines the model sometimes draws where it was told to leave the
    top-left corner empty. Each row is refilled from the background just to the right of the corner
    (so it blends with the render's own shading); only near-grey light pixels are touched, never a
    body part or prop."""
    w = im.width
    x1, y1 = int(w * 0.38), top + int((bottom - top) * 0.40)
    px = im.load()
    for y in range(top, y1):
        samples = [px[x, y] for x in range(x1, min(w, x1 + 60), 3) if _bgish(px[x, y])]
        if not samples:
            continue
        ref = tuple(sorted(c[i] for c in samples)[len(samples) // 2] for i in range(3))
        for x in range(0, x1):
            if _bgish(px[x, y]):
                px[x, y] = ref
    return im


def arrow_x(im, div):
    """A column near the centre where the arrow (div-70 .. div+92) crosses only background."""
    px = im.load()
    for off in [0] + [d * s for d in range(40, 520, 40) for s in (1, -1)]:
        x = im.width // 2 + off
        if 120 < x < im.width - 120 and all(_bgish(px[xx, y]) for xx in range(x - 34, x + 35, 6)
                                              for y in list(range(div - 75, div - 6, 4)) + list(range(div + 8, div + 96, 4))):
            return x
    return im.width // 2


def draw_finish(im, div, legacy=False):
    d = ImageDraw.Draw(im)
    if not legacy:
        d.rectangle((0, div - 4, W, div + 4), fill=(255, 255, 255))   # divider
    font = ImageFont.truetype(FONT, 78)
    for n, top in ((1, 0), (2, div + 4)):
        cx, cy, r = 110, top + 110, 62
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=INK, width=7)
        d.text((cx, cy + 2), str(n), fill=INK, font=font, anchor="mm")
    if legacy:          # legacy image already has its own divider + arrow
        return im
    # arrow straddling the divider, in a clear column near the centre
    x = arrow_x(im, div)
    d.line((x, div - 70, x, div + 50), fill=INK, width=9)
    d.polygon([(x - 30, div + 40), (x + 30, div + 40), (x, div + 92)], fill=INK)
    return im


def main(argv):
    scrub = "--scrub-badges" in argv
    args = [a for a in argv if not a.startswith("--")]
    src, dst = args
    im = fit_canvas(Image.open(src))
    if scrub:
        n = fix_filled_badges(im)
        im.save(dst)
        print(dst, "legacy badges fixed:", n)
        return
    if "--single" in argv:
        clean_corner(im, 0, H)
        im.save(dst)
        print(dst, "single panel")
        return
    div = find_divider(im)
    clean_corner(im, 0, div)
    clean_corner(im, div, H)
    im = draw_finish(im, div)
    im.save(dst)
    print(dst, "divider at", div)


if __name__ == "__main__":
    main(sys.argv[1:])
