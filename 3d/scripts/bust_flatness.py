# Bust flatness: front depth at the chest centre vs the bust side, at a few heights.
# A flat garment front has a small difference; a body-hugging one follows the bust.
# Run: Blender -b --python 3d/scripts/bust_flatness.py -- <file.gltf>
import sys
import bpy
src = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
meshes = [o for o in bpy.data.objects if o.type == "MESH" and not o.name.startswith("Icosphere") and o.name not in ("Eyes", "Eyebrows")]
pts = [o.matrix_world @ v.co for o in meshes for v in o.data.vertices]
for z in (1.20, 1.26):
    centre = [p.y for p in pts if abs(p.z - z) < 0.012 and abs(p.x) < 0.03]
    side = [p.y for p in pts if abs(p.z - z) < 0.012 and 0.06 < abs(p.x) < 0.10]
    if centre and side:
        c = min(centre); s = min(side)
        print("FLAT z", z, "centre_front", round(c, 4), "bust_side_front", round(s, 4), "bulge", round(abs(s - c), 4))
    else:
        print("FLAT z", z, "missing", len(centre), len(side))
