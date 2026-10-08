# Smile v12: four features, each with a stated target.
# 1. Corner rise: the lip corners rise so corner_z - centre_z reaches TARGET_RISE.
# 2. Corner width: corners move out a little.
# 3. Lower lip: its centre follows, lifting a fraction of the corner rise (curve).
# 4. Cheek raise: a smooth lift on the cheek beside each corner.
# Measured before export, and rendered for review.
# Run: Blender -b --python 3d/scripts/make_smile_v12.py -- <in.gltf> <out.gltf> <render_prefix>
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

CORNER_X = 0.011
LIP_Z = 1.6100
near = [v for v in me.vertices if abs(v.co.x) < 0.05 and abs(v.co.z - LIP_Z) < 0.05]
front_y = min(v.co.y for v in near)

TARGET_RISE = 0.006   # corners sit this far above the lip centre

def smooth(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)

if not me.shape_keys:
    body.shape_key_add(name="Basis", from_mix=False)
smile = body.shape_key_add(name="Smile", from_mix=False)

# Measure the corner and centre heights on the neutral shape.
lip_pts = [v for v in me.vertices if v.co.y < front_y + 0.012 and abs(v.co.z - LIP_Z) < 0.012 and abs(v.co.x) < 0.015]
centre_z = min((v for v in lip_pts if abs(v.co.x) < 0.003), key=lambda v: v.co.z).co.z
corner_z = max((v for v in lip_pts if abs(v.co.x) > 0.009), key=lambda v: v.co.z).co.z
neutral_rise = corner_z - centre_z
print("NEUTRAL rise", round(neutral_rise, 5), "centre_z", round(centre_z, 5), "corner_z", round(corner_z, 5))

RISE_ADD = TARGET_RISE - neutral_rise   # extra corner lift needed
print("RISE_ADD", round(RISE_ADD, 5))

moved = 0
for v in me.vertices:
    if v.co.y > front_y + 0.02:
        continue
    x = v.co.x
    dz = v.co.z - LIP_Z
    side = 1.0 if x >= 0 else -1.0
    p = smile.data[v.index].co
    ax = abs(x)
    dx_total = 0.0
    dz_total = 0.0
    # 1 + 2. Lip band: corners rise and widen; centre stays.
    if abs(dz) < 0.010 and ax < 0.016:
        corner = smooth(ax / CORNER_X)
        band = smooth(1.0 - abs(dz) / 0.010)
        dz_total += (RISE_ADD * corner) * band
        dx_total += side * 0.0025 * corner * band
        # 3. Lower lip follows, a fraction of the rise.
        if dz < 0:
            dz_total += 0.25 * RISE_ADD * corner * band
    # 4. Cheek raise beside the corner.
    cheek = smooth(1.0 - ((ax - 0.026) / 0.018) ** 2 - ((dz - 0.012) / 0.014) ** 2)
    if cheek > 0:
        dz_total += 0.0035 * cheek
    if dx_total == 0.0 and dz_total == 0.0:
        continue
    p.x += dx_total
    p.z += dz_total
    moved += 1
print("SMILE verts moved", moved)

# Measure the corner and centre heights on the smile shape.
sc = [(v.co.x, v.co.z) for v in smile.data if v.co.y < front_y + 0.012 and abs(v.co.z - LIP_Z) < 0.012 and abs(v.co.x) < 0.015]
centre_s = min((z for x, z in sc if abs(x) < 0.003))
corner_s = max((z for x, z in sc if abs(x) > 0.009))
print("SMILE rise", round(corner_s - centre_s, 5), "target", TARGET_RISE)

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
