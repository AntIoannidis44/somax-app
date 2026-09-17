"""Generates the Light/Medium/Dark Complexion texture variants used by the
Character Studio's skin-tone slider.

Each body build ships exactly ONE base color texture from the source asset
pack (T_{Build}_{Base}_Dark_BaseColor.png - "Dark" is just the pack's file
name, not a skin tone). That single texture bakes in both real skin AND a
default garment (underwear) in one image. To make the tone slider only
affect skin:

1. Classify pixels as skin vs garment by HSV saturation. Garment (the
   baked-in underwear) is a near-neutral grey/navy (saturation ~0), while
   skin is consistently well-saturated warm tan (~0.45-0.55) across every
   build/gender pack checked. A threshold of 0.12 separates them cleanly
   with wide margin on both sides - verified per-build, ~91-95% of each
   texture is skin.
2. For skin pixels, remap color via a per-channel tint ratio
   (target_tone / source_average_skin_tone), which preserves the
   texture's existing shading detail (ambient occlusion, blush, creases)
   while shifting the overall tone. Garment pixels are left untouched so
   they render identically regardless of the chosen complexion.

Run from anywhere; paths below are relative to this file.
"""
import os
import numpy as np
from PIL import Image

CHAR_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'models', 'characters')

TARGETS = {
    'Light': np.array([230.0, 189.0, 154.0]),
    'Medium': np.array([177.0, 128.0, 90.0]),
    'Dark': np.array([101.0, 67.0, 46.0]),
}

BUILDS = ['Regular', 'Superhero', 'Teen']
BASES = ['Male', 'Female']


def generate(build: str, base: str) -> None:
    src_path = os.path.join(CHAR_DIR, f'T_{build}_{base}_Dark_BaseColor.png')
    base_arr = np.array(Image.open(src_path).convert('RGB')).astype(np.float64)

    maxc = base_arr.max(axis=2)
    minc = base_arr.min(axis=2)
    sat = np.where(maxc > 0, (maxc - minc) / np.maximum(maxc, 1e-6), 0)
    skin_mask = sat > 0.12

    skin_frac = skin_mask.mean()
    ref_tone = base_arr[skin_mask].mean(axis=0)
    print(f'{build} {base}: skin={skin_frac*100:.1f}% ref_tone={ref_tone.round(1)}')
    assert 0.7 < skin_frac < 0.99, f'unexpected skin fraction {skin_frac} for {build} {base} - check mask'

    for tone_name, target in TARGETS.items():
        ratio = target / np.maximum(ref_tone, 1e-6)
        recolored = np.clip(base_arr * ratio[None, None, :], 0, 255)
        out = np.where(skin_mask[:, :, None], recolored, base_arr)
        out_path = os.path.join(CHAR_DIR, f'T_{build}_{base}_Complexion_{tone_name}.png')
        Image.fromarray(out.astype(np.uint8)).save(out_path)


if __name__ == '__main__':
    for build in BUILDS:
        for base in BASES:
            generate(build, base)
