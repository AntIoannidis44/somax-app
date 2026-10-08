# Skin-tight leggings from the body's own leg skin: copy the leg faces, push them out a few mm.
# Run: Blender -b --python 3d/scripts/make_leggings_skin.py -- <body.gltf> <out.gltf> <render.png> [long|short]
import sys
import math
import bmesh
import bpy

argv = sys.argv[sys.argv.index("--") + 1:]
src, out_gltf, render_png = argv[0], argv[1], argv[2]
LENGTH = argv[3] if len(argv) > 3 else "long"
import os as _os
TOP_Z = float(_os.environ.get("TOP_LINE", "1.03"))          # underwear waistband line
BOTTOM_Z = float(_os.environ.get("ANKLE_LINE", "0.08")) if LENGTH == "long" else float(_os.environ.get("SHORT_LINE", "0.70"))
THICK = 0.008

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
body = max((o for o in bpy.data.objects if o.type == "MESH" and o.name not in ("Eyes", "Eyebrows") and not o.name.startswith("Icosphere")),
           key=lambda o: len(o.data.vertices))
arm = [o for o in bpy.data.objects if o.type == "ARMATURE"][0]

# 1) Copy the body faces in the leg band (leg faces only: outside the centre, below the hips).
bm = bmesh.new()
bm.from_mesh(body.data)
keep = []
for f in bm.faces:
    c = f.calc_center_median()
    legs_ok = BOTTOM_Z < c.z < TOP_Z and abs(c.x) > 0.03 and abs(c.y) < 0.12 and abs(c.x) < 0.2
    # Crotch and seat: the pelvis band joins the two legs, so no skin shows between them.
    pelvis_ok = (TOP_Z - 0.14) < c.z < TOP_Z + 0.04 and abs(c.y) < 0.12 and abs(c.x) < 0.2
    if legs_ok or pelvis_ok:
        keep.append(f)
print("LEG FACES", len(keep))
out = bmesh.new()
vmap = {}
for f in keep:
    for v in f.verts:
        if v not in vmap:
            vmap[v] = out.verts.new(v.co)
for f in keep:
    try:
        out.faces.new([vmap[v] for v in f.verts])
    except ValueError:
        pass
bm.free()
out.normal_update()
mesh = bpy.data.meshes.new("Leggings")
out.to_mesh(mesh)
out.free()
legs = bpy.data.objects.new("Leggings", mesh)
bpy.context.scene.collection.objects.link(legs)

# Shape the waist and hem edges. The waist follows the underwear curve (higher at the sides,
# a little lower at the front); the hem is a straight line at the ankle or mid-thigh.
DIP = float(_os.environ.get("WAIST_DIP", "0.010"))
def waist_z(x):
    return TOP_Z - DIP * (1.0 - min(1.0, (x / 0.12) ** 2))

def pin(v):
    if v.co.z > TOP_Z - 0.03:
        v.co.z = waist_z(v.co.x)
    elif v.co.z < BOTTOM_Z + 0.03:
        v.co.z = BOTTOM_Z

for v in legs.data.vertices:
    pin(v)
legs.data.update()

# Smooth the cut edges along their loops (removes the stair-step), keeping the pins.
bm2 = bmesh.new()
bm2.from_mesh(legs.data)
bm2.verts.ensure_lookup_table()
bnd = {}
for e in bm2.edges:
    if len(e.link_faces) == 1:
        a, b = e.verts
        bnd.setdefault(a, []).append(b)
        bnd.setdefault(b, []).append(a)
for _ in range(int(_os.environ.get("SMOOTH_IT", "25"))):
    moves = {}
    for v, nbs in bnd.items():
        near_nbs = [n for n in nbs if (n.co - v.co).length < 0.02]
        if len(near_nbs) == 2:
            avg = (near_nbs[0].co + near_nbs[1].co) * 0.5
            moves[v] = v.co.lerp(avg, 0.5)
    for v, co in moves.items():
        v.co = co
    for v in bnd:
        pin_v = v
        if pin_v.co.z > TOP_Z - 0.03:
            pin_v.co.z = waist_z(pin_v.co.x)
        elif pin_v.co.z < BOTTOM_Z + 0.03:
            pin_v.co.z = BOTTOM_Z
bm2.to_mesh(legs.data)
bm2.free()
legs.data.update()

# 2) Push the copy outward by THICK along the skin normal.
sol = legs.modifiers.new("Skin", "SOLIDIFY")
sol.thickness = THICK
sol.offset = 1.0
sol.use_even_offset = True
bpy.context.view_layer.objects.active = legs
bpy.ops.object.modifier_apply(modifier=sol.name)

# 3) Skin weights from the body, then bind to the skeleton.
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
am = legs.modifiers.new("Armature", "ARMATURE")
am.object = arm
legs.parent = arm
mat = bpy.data.materials.new("LegNavy"); mat.use_nodes = True
mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.07, 0.13, 0.32, 1)
legs.data.materials.append(mat)
for p_ in legs.data.polygons:
    p_.use_smooth = True
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
