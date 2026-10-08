# Smile v13: lift the corners by a measured amount, relative to the lip centre.
# Measured on the neutral face (measure_lip.py):
#   centre mean z 1.61369 (24 verts), corner mean z 1.61615 (8 verts): rise +0.00246.
# Target rise for a smile: +0.0065. So the corners need about +0.0040 more,
# with the centre unchanged.
# Run: Blender -b --python 3d/scripts/make_smile_v13.py -- <in.gltf> <out.gltf> <render_prefix>
import sys
import math
import bpy

argv = sys.argv[sys.argv.index("--") + 1:]
src, out_gltf, prefix = argv[0], argv[1], argv[2]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
body = bpy.data.objects["Female_Regular"]
me = body.data

LIP_Z = 1.6100
near = [v for v in me.vertices if abs(v.co.x) < 0.05 and abs(v.co.z - LIP_Z) < 0.05]
front_y = min(v.co.y for v in near)

CORNER_LIFT = 0.0040   # extra lift at the corners
CORNER_OUT = 0.0025    # corners move out
LOWER_LIFT = 0.0010    # lower lip follows a little (curve)

def smooth(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)

if not me.shape_keys:
    body.shape_key_add(name="Basis", from_mix=False)
smile = body.shape_key_add(name="Smile", from_mix=False)

moved = 0
for v in me.vertices:
    if v.co.y > front_y + 0.012:
        continue
    x = v.co.x
    dz = v.co.z - LIP_Z
    ax = abs(x)
    if abs(dz) > 0.010 or ax > 0.016:
        continue
    # 0 at the centre, 1 at the corners.
    corner = smooth((ax - 0.003) / 0.008)
    band = smooth(1.0 - abs(dz) / 0.010)
    w = corner * band
    if w <= 0:
        continue
    side = 1.0 if x >= 0 else -1.0
    p = smile.data[v.index].co
    p.x += side * CORNER_OUT * w
    p.z += CORNER_LIFT * w
    if dz < 0:
        p.z += LOWER_LIFT * w
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
