# Smile v7: rotate the lip corners up around the mouth centre (no subdivision).
# Run: Blender -b --python 3d/scripts/make_smile_v5.py -- <in.gltf> <out.gltf> <render_prefix>
import sys
import math
import bmesh
import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
src, out_gltf, prefix = argv[0], argv[1], argv[2]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
body = bpy.data.objects["Female_Regular"]
me = body.data

MOUTH = Vector((0.0, 0.0, 1.584))
near = [v for v in me.vertices if abs(v.co.x) < 0.05 and abs(v.co.z - MOUTH.z) < 0.05]
front_y = min(v.co.y for v in near)
centre = Vector((0.0, front_y, MOUTH.z))

# 2) Shape the smile on the new geometry.
if not me.shape_keys:
    body.shape_key_add(name="Basis", from_mix=False)
smile = body.shape_key_add(name="Smile", from_mix=False)

def smooth(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)

moved = 0
ANGLE = math.radians(40)
for v in me.vertices:
    if v.co.y > front_y + 0.03:
        continue
    x = v.co.x
    dz_m = v.co.z - MOUTH.z
    mouth = smooth(1.0 - (abs(x) / 0.034) ** 2 - (dz_m / 0.026) ** 2)
    if mouth <= 0 or abs(x) < 0.003:
        continue
    side = 1.0 if x >= 0 else -1.0
    # Rotate the corner in the face plane about the mouth centre, so the
    # lip corner lifts and moves out, as a real smile does.
    corner = smooth((abs(x) - 0.003) / 0.014)
    a = ANGLE * corner * mouth * side
    rx = x * math.cos(a) - dz_m * math.sin(a)
    rz = x * math.sin(a) + dz_m * math.cos(a)
    p = smile.data[v.index].co
    p.x += (rx - x)
    p.z += (rz - dz_m) - 0.0
    moved += 1
print("SMILE verts moved", moved)

body.data.shape_keys.key_blocks["Smile"].value = 0.0
bpy.ops.export_scene.gltf(filepath=out_gltf, export_format="GLTF_SEPARATE", export_morph=True, export_apply=False)
print("EXPORTED", out_gltf)

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 700
scene.render.resolution_y = 700
scene.view_settings.view_transform = "Standard"
world = bpy.data.worlds.new("W"); scene.world = world; world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.92, 0.94, 0.97, 1)
cam_data = bpy.data.cameras.new("Cam"); cam_data.lens = 85
cam = bpy.data.objects.new("Cam", cam_data); scene.collection.objects.link(cam)
cam.location = (0, front_y - 0.9, MOUTH.z + 0.02)
cam.rotation_euler = (math.radians(90), 0, 0)
scene.camera = cam
sun = bpy.data.lights.new("Sun", "SUN"); sun.energy = 3
sl = bpy.data.objects.new("Sun", sun); scene.collection.objects.link(sl)
sl.rotation_euler = (math.radians(45), 0, math.radians(30))
for label, value in (("neutral", 0.0), ("smile", 1.0)):
    body.data.shape_keys.key_blocks["Smile"].value = value
    scene.render.filepath = f"{prefix}_{label}.png"
    bpy.ops.render.render(write_still=True)
    print("RENDERED", scene.render.filepath)
