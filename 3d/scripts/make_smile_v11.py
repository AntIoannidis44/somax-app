# Smile v11: corner-anchored. Lip corners (|x| ~ 0.011) move out and up;
# the lip centre (x ~ 0) doesn't move, and nothing is rotated, so the upper lip
# can't be pulled inward (the cause of the pucker in v6-v8).
# Run: Blender -b --python 3d/scripts/make_smile_v11.py -- <in.gltf> <out.gltf> <render_prefix>
import sys
import math
import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
src, out_gltf, prefix = argv[0], argv[1], argv[2]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
body = bpy.data.objects["Female_Regular"]
me = body.data

CORNER_X = 0.011          # lip corner, from the probe
LIP_Z = 1.6100            # lip line, from the probe
near = [v for v in me.vertices if abs(v.co.x) < 0.05 and abs(v.co.z - LIP_Z) < 0.05]
front_y = min(v.co.y for v in near)

if not me.shape_keys:
    body.shape_key_add(name="Basis", from_mix=False)
smile = body.shape_key_add(name="Smile", from_mix=False)

OUT = 0.0030   # corner moves out (metres)
UP = 0.0050    # corner moves up

moved = 0
for v in me.vertices:
    if v.co.y > front_y + 0.012:
        continue
    x = v.co.x
    dz = v.co.z - LIP_Z
    if abs(x) < 0.0015 and abs(dz) > 0.006:
        continue
    if abs(x) > 0.02 or abs(dz) > 0.012:
        continue
    # Weight 1 at the corner, 0 at the lip centre, falling off smoothly.
    t = min(1.0, abs(x) / CORNER_X)
    w = t * t * (3 - 2 * t)
    # Only the lip band near the corner moves, not the cheek or chin.
    band = max(0.0, 1.0 - abs(dz) / 0.008)
    weight = w * band
    if weight <= 0:
        continue
    side = 1.0 if x >= 0 else -1.0
    p = smile.data[v.index].co
    p.x += side * OUT * weight
    p.z += UP * weight
    moved += 1
print("SMILE verts moved", moved, "front_y", front_y)

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
cam.location = (0, front_y - 0.9, LIP_Z + 0.02)
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
