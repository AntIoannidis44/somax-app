# Full-length, skin-tight leggings built from the body: one tube per leg, ankle to waist.
# Rings follow each leg's centre line (measured from the body), then shrink-wrap onto the skin.
# Skin weights copied from the body so they move with the skeleton.
# Run: Blender -b --python 3d/scripts/make_leggings.py -- <body.gltf> <out.gltf> <render.png> [short|long]
import sys
import math
import bmesh
import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
src, out_gltf, render_png = argv[0], argv[1], argv[2]
LENGTH = argv[3] if len(argv) > 3 else "long"
TOP_Z = 0.98
BOTTOM_Z = 0.06 if LENGTH == "long" else 0.50

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
body = max((o for o in bpy.data.objects if o.type == "MESH" and o.name not in ("Eyes", "Eyebrows") and not o.name.startswith("Icosphere")),
           key=lambda o: len(o.data.vertices))
arm = [o for o in bpy.data.objects if o.type == "ARMATURE"][0]
pts = [v.co for v in body.data.vertices]

EASE = 0.008   # skin-tight: a few millimetres outside the leg

def leg_section(sign, z):
    # Centre and radius of this leg at height z, measured from the body's skin.
    band = [p for p in pts if abs(p.z - z) < 0.005 and sign * p.x > 0.02 and abs(p.x) < 0.2 and abs(p.y) < 0.12]
    if not band:
        return sign * 0.09, 0.0, RADIUS
    cx = sum(p.x for p in band) / len(band)
    cy = sum(p.y for p in band) / len(band)
    dists = sorted(math.hypot(p.x - cx, p.y - cy) for p in band)
    r = dists[int(0.95 * (len(dists) - 1))] + EASE
    return cx, cy, r

RINGS = [TOP_Z - i * (TOP_Z - BOTTOM_Z) / 22 for i in range(23)]
SEGS = 28
RADIUS = 0.07
bm = bmesh.new()
for sign in (1.0, -1.0):
    grid = []
    for z in RINGS:
        cx, cy, r = leg_section(sign, z)
        ring = []
        for i in range(SEGS):
            a = 2 * math.pi * i / SEGS
            ring.append(bm.verts.new((cx + r * math.cos(a), cy + r * math.sin(a), z)))
        grid.append(ring)
    for r0, r1 in zip(grid, grid[1:]):
        for i in range(SEGS):
            j = (i + 1) % SEGS
            bm.faces.new([r0[i], r0[j], r1[j], r1[i]])
bm.normal_update()
mesh = bpy.data.meshes.new("Leggings")
bm.to_mesh(mesh)
bm.free()
legs = bpy.data.objects.new("Leggings", mesh)
bpy.context.scene.collection.objects.link(legs)
bpy.context.view_layer.objects.active = legs
legs.select_set(True)


for g in body.vertex_groups:
    legs.vertex_groups.new(name=g.name)
dt = legs.modifiers.new("Weights", "DATA_TRANSFER")
dt.object = body
dt.use_vert_data = True
dt.data_types_verts = {"VGROUP_WEIGHTS"}
dt.vert_mapping = "POLYINTERP_NEAREST"
dt.layers_vgroup_select_dst = "NAME"
dt.layers_vgroup_select_src = "ALL"
bpy.ops.object.modifier_apply(modifier=dt.name)

for p in legs.data.polygons:
    p.use_smooth = True
mat = bpy.data.materials.new("LegNavy"); mat.use_nodes = True
mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.07, 0.13, 0.32, 1)
legs.data.materials.append(mat)
am = legs.modifiers.new("Armature", "ARMATURE")
am.object = arm
legs.parent = arm
print("LEGGINGS", LENGTH, "verts", len(legs.data.vertices), "groups", len(legs.vertex_groups))

bpy.ops.export_scene.gltf(filepath=out_gltf, export_format="GLTF_SEPARATE", export_apply=False)
print("EXPORTED", out_gltf)

import math as _m
scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 700
scene.render.resolution_y = 700
scene.view_settings.view_transform = "Standard"
world = bpy.data.worlds.new("W"); scene.world = world; world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.92, 0.94, 0.97, 1)
cam_data = bpy.data.cameras.new("Cam"); cam_data.lens = 60
cam = bpy.data.objects.new("Cam", cam_data); scene.collection.objects.link(cam)
cam.location = (0, -3.6, 0.85)
cam.rotation_euler = (_m.radians(90), 0, 0)
scene.camera = cam
sun = bpy.data.lights.new("Sun", "SUN"); sun.energy = 3
sl = bpy.data.objects.new("Sun", sun); scene.collection.objects.link(sl)
sl.rotation_euler = (_m.radians(45), 0, _m.radians(30))
scene.render.filepath = render_png
bpy.ops.render.render(write_still=True)
print("RENDERED", render_png)
