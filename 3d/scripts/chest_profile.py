# Measure the front depth (min y) and half-width (max |x|) of a mesh at chest heights.
# Run: Blender -b --python 3d/scripts/chest_profile.py -- <file.gltf>
import sys
import bpy
src = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
meshes = [o for o in bpy.data.objects if o.type == "MESH" and not o.name.startswith("Icosphere") and o.name not in ("Eyes", "Eyebrows")]
pts = [o.matrix_world @ v.co for o in meshes for v in o.data.vertices]
for z in (1.14, 1.20, 1.26, 1.32):
    band = [p for p in pts if abs(p.z - z) < 0.01 and abs(p.x) < 0.2]
    if not band:
        print("PROFILE", z, "none"); continue
    front = min(p.y for p in band)
    half = max(abs(p.x) for p in band)
    print("PROFILE z", z, "front_y", round(front, 4), "half_x", round(half, 4), "n", len(band))
