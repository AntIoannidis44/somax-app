# Arm extent along x (T-pose): max |x| of the body's arm vertices, and the spread by x band.
import sys
import bpy
src = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
body = max((o for o in bpy.data.objects if o.type == "MESH" and o.name not in ("Eyes", "Eyebrows") and not o.name.startswith("Icosphere")), key=lambda o: len(o.data.vertices))
pts = [v.co for v in body.data.vertices if abs(v.co.x) > 0.2 and 1.15 < v.co.z < 1.5]
print("ARM max_x", round(max(abs(p.x) for p in pts), 3), "min_x", round(min(abs(p.x) for p in pts), 3), "n", len(pts))
for x0 in (0.25, 0.35, 0.45, 0.55, 0.65, 0.75):
    band = [p for p in pts if x0 <= abs(p.x) < x0 + 0.1]
    if band:
        zs = [p.z for p in band]
        print("BAND x", x0, "z", round(min(zs), 3), round(max(zs), 3), "n", len(band))
