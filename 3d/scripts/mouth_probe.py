# List mouth-region vertices (x, z, y) so the smile can target the right ones.
# Run: Blender -b --python 3d/scripts/mouth_probe.py -- <in.gltf>
import sys
import bpy
from mathutils import Vector

src = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
body = bpy.data.objects["Female_Regular"]
me = body.data
MOUTH = Vector((0.0, 0.0, 1.584))
near = [v for v in me.vertices if abs(v.co.x) < 0.05 and abs(v.co.z - MOUTH.z) < 0.05]
front_y = min(v.co.y for v in near)
rows = [(round(v.co.x, 4), round(v.co.z, 4), round(v.co.y, 4)) for v in me.vertices
        if abs(v.co.x) < 0.04 and abs(v.co.z - MOUTH.z) < 0.03 and v.co.y < front_y + 0.01]
rows.sort(key=lambda r: (r[1], r[0]))
print("FRONT_Y", round(front_y, 4), "COUNT", len(rows))
for r in rows:
    print("V", r)
