# Prototype: add a "Smile" shape key to the female base, export glTF with the
# morph target, and render neutral vs smile for review.
# Run: Blender -b --python 3d/scripts/make_smile.py -- <in.gltf> <out.gltf> <render_prefix>
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

# Mouth centre, measured from the front render (world units, Blender Z up).
MOUTH = Vector((0.0, 0.0, 1.584))
# The face front is the most negative Y (camera side) near the mouth.
near = [v for v in me.vertices
        if abs(v.co.x) < 0.05 and abs(v.co.z - MOUTH.z) < 0.05]
front_y = min(v.co.y for v in near)
centre = Vector((0.0, front_y, MOUTH.z))
RADIUS = 0.05

if not me.shape_keys:
    body.shape_key_add(name="Basis", from_mix=False)
smile = body.shape_key_add(name="Smile", from_mix=False)

def smooth(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)

moved = 0
for v in me.vertices:
    # Front of the face only, so the back of the head and neck don't move.
    if v.co.y > front_y + 0.03:
        continue
    dx_m = v.co.x
    dz_m = v.co.z - MOUTH.z
    # Mouth: lips widen, and the corners lift more than the centre (the curve).
    mouth_w = 0.03
    mouth_h = 0.022
    mouth_fall = smooth(1.0 - (abs(dx_m) / mouth_w) ** 2 - (dz_m / mouth_h) ** 2) * smooth((abs(dx_m) - 0.006) / 0.01)
    dz = 0.0
    dx = 0.0
    if mouth_fall > 0:
        corner = smooth(abs(dx_m) / 0.02)           # 0 at centre, 1 at the corners
        # Corners only: the centre stays put, so the lips don't push forward.
        dz += 0.006 * corner * mouth_fall           # corners up
        dx += (1.0 if dx_m >= 0 else -1.0) * 0.005 * corner * mouth_fall  # widen
    # Cheeks: lift gently, outside the mouth, under the eyes.
    cheek_c = Vector((0.0, 0.0, 0.0))
    cheek_fall = 0.0
    if abs(dx_m) > 0.02:
        cheek_fall = smooth(1.0 - ((abs(dx_m) - 0.045) / 0.03) ** 2 - ((dz_m - 0.05) / 0.035) ** 2)
        dz += 0.006 * cheek_fall
    if mouth_fall <= 0 and cheek_fall <= 0:
        continue
    p = smile.data[v.index].co
    p.x += dx
    p.z += dz
    moved += 1
print("SMILE verts moved", moved, "front_y", front_y)

body.active_shape_key_index = len(body.data.shape_keys.key_blocks) - 1
body.data.shape_keys.key_blocks["Smile"].value = 0.0

bpy.ops.export_scene.gltf(filepath=out_gltf, export_format="GLTF_SEPARATE",
                          export_morph=True, export_apply=False)
print("EXPORTED", out_gltf)

# Render neutral and smile close-ups for review.
scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 700
scene.render.resolution_y = 700
scene.view_settings.view_transform = "Standard"
world = bpy.data.worlds.new("W"); scene.world = world; world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.92, 0.94, 0.97, 1)
cam_data = bpy.data.cameras.new("Cam"); cam_data.lens = 85
cam = bpy.data.objects.new("Cam", cam_data); scene.collection.objects.link(cam)
cam.location = (0, front_y - 1.2, MOUTH.z + 0.02)
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
