"""Generates recolored variants of each outfit's BaseColor texture, used by
the Character Studio's Outfit Color picker.

Unlike the body's skin texture (see generate_complexion_textures.py), an
outfit's BaseColor texture is ENTIRELY garment fabric - no skin-vs-garment
split needed here, it's baked into a separate texture file per outfit and
shared by every piece (body/legs/arms/hood/etc all reference the same one
atlas), confirmed via the pack's own file listing. So the whole image can be
retinted directly.

Same ratio-tint technique as the complexion script: compute the texture's
own mean color as a reference tone, then for each target color multiply by
(target / reference) per channel. This preserves fold/shadow/ambient-
occlusion detail while genuinely shifting the overall garment hue, rather
than a flat multiply (which would just darken/muddy the existing baked-in
color instead of actually recoloring it).

Run from anywhere; paths below are relative to this file.
"""
import os
import numpy as np
from PIL import Image

OUTFITS_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'models', 'outfits')

OUTFITS = ['peasant', 'ranger', 'noble', 'wizard', 'knight']
OUTFIT_FILE_PREFIX = {'peasant': 'Peasant', 'ranger': 'Ranger', 'noble': 'Noble', 'wizard': 'Wizard', 'knight': 'Knight'}

# Keep in sync with OUTFIT_COLORS in src/data/catalog.ts - 'default' is the
# pack's own unmodified texture (no file generated, no-op at runtime).
TARGETS = {
    'Charcoal': np.array([58.0, 58.0, 63.0]),
    'Crimson': np.array([165.0, 41.0, 58.0]),
    'Forest': np.array([47.0, 107.0, 63.0]),
    'Slate': np.array([61.0, 90.0, 115.0]),
    'Gold': np.array([201.0, 150.0, 47.0]),
}


def generate(outfit: str) -> None:
    prefix = OUTFIT_FILE_PREFIX[outfit]
    src_path = os.path.join(OUTFITS_DIR, outfit, f'T_{prefix}_BaseColor.png')
    base_arr = np.array(Image.open(src_path).convert('RGB')).astype(np.float64)

    ref_tone = base_arr.reshape(-1, 3).mean(axis=0)
    print(f'{outfit}: ref_tone={ref_tone.round(1)}')

    for color_name, target in TARGETS.items():
        ratio = target / np.maximum(ref_tone, 1e-6)
        recolored = np.clip(base_arr * ratio[None, None, :], 0, 255)
        out_path = os.path.join(OUTFITS_DIR, outfit, f'T_{prefix}_{color_name}_BaseColor.png')
        Image.fromarray(recolored.astype(np.uint8)).save(out_path)
        print(f'  -> {out_path}')


if __name__ == '__main__':
    for outfit in OUTFITS:
        generate(outfit)
