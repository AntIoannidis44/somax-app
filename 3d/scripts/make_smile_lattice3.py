# Smile via a lattice: a grid of control points around the mouth, the way an
# artist bends a face with a deform cage. Moving the inner corner points up
# gives a smooth falloff to zero at the lattice edge, so nothing outside moves.
# Then the deformed mesh is baked into the "Smile" shape key.
# Run: Blender -b --python 3d/scripts/make_smile_lattice.py -- <in.gltf> <out.gltf> <render_prefix>
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

LIP_Z = 1.6100
near = [v for v in me.vertices if abs(v.co.x) < 0.05 and abs(v.co.z - LIP_Z) < 0.05]
front_y = min(v.co.y for v in near)

# Lattice box around the mouth. Local points sit at x = -2..2, z = -1..1, y = +/-0.5.
# Scale maps local units to world units, so the corners (local x = +/-1) land on
# the real lip corners (world x = +/-0.011), and the centre (local x = 0) sits on
# the lip centre with no lift of its own.
SCALE_X = 0.011          # world per local unit in x (corners at local +/-1)
SCALE_Z = 0.020          # world per local unit in z
SCALE_Y = 0.100          # world per local unit in y (depth)
lat_data = bpy.data.lattices.new("MouthCage")
lat_data.points_u, lat_data.points_v, lat_data.points_w = 5, 2, 3
lat_data.interpolation_type_u = "KEY_LINEAR"
lat_data.interpolation_type_v = "KEY_LINEAR"
lat_data.interpolation_type_w = "KEY_LINEAR"
lat = bpy.data.objects.new("MouthCage", lat_data)
scene = bpy.context.scene
scene.collection.objects.link(lat)
lat.location = (0.0, front_y, LIP_Z)
lat.scale = (SCALE_X, SCALE_Y, SCALE_Z)

LIFT = 0.016     # world: corners up
OUT = 0.002      # world: corners out
for i, p in enumerate(lat_data.points):
    u = i % lat_data.points_u
    v = (i // lat_data.points_u) % lat_data.points_v
    w = i // (lat_data.points_u * lat_data.points_v)
    if u in (1, 3) and w == 1:           # the two corner columns, at the lip line
        side = -1.0 if u == 1 else 1.0
        p.co_deform.z += LIFT / SCALE_Z
        p.co_deform.x += side * OUT / SCALE_X

# Apply the cage to a copy of the body, then bake it into the Smile key.
if not me.shape_keys:
    body.shape_key_add(name="Basis", from_mix=False)
bpy.context.view_layer.objects.active = body
mod = body.modifiers.new("MouthCage", "LATTICE")
mod.object = lat
mod.strength = 1.0
bpy.ops.object.modifier_apply_as_shapekey(keep_modifier=False, modifier=mod.name)
smile_key = body.data.shape_keys.key_blocks[-1]
smile_key.name = "Smile"
print("SMILE key", smile_key.name)

# Measure corner vs centre on the baked key.
band = [(v.co.x, v.co.z) for v in me.vertices if v.co.y < front_y + 0.012 and abs(v.co.z - LIP_Z) < 0.03 and abs(v.co.x) < 0.015]
def pos(sel):
    zs = [z for x, z in band if sel(x)]
    return sum(zs) / len(zs)
rise_n = None
smile_pts = [(v.co.x, v.co.z) for v in smile_key.data if v.co.y < front_y + 0.012 and abs(v.co.z - LIP_Z) < 0.03 and abs(v.co.x) < 0.015]
def mean_z(pts, sel):
    zs = [z for x, z in pts if sel(x)]
    return sum(zs) / len(zs)
c_sel = lambda x: abs(x) < 0.003
k_sel = lambda x: abs(x) > 0.009
print("RISE neutral", round(mean_z(band, k_sel) - mean_z(band, c_sel), 5))
print("RISE smile", round(mean_z(smile_pts, k_sel) - mean_z(smile_pts, c_sel), 5), "target >= 0.0065")

body.data.shape_keys.key_blocks["Smile"].value = 0.0
bpy.ops.export_scene.gltf(filepath=out_gltf, export_format="GLTF_SEPARATE", export_morph=True, export_apply=False)
print("EXPORTED", out_gltf)

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
