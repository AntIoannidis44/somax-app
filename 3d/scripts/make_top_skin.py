# Activewear top from the body's own skin: torso, shoulders and arms as one copy, pushed out
# by a thin shell. Sleeve ends and the waist are flat boolean cuts (clean edges).
# Run: Blender -b --python 3d/scripts/make_top_skin.py -- <body.gltf> <out.gltf> <render.png> long|short
import sys
import math
import os
import bmesh
import bpy

argv = sys.argv[sys.argv.index("--") + 1:]
src, out_gltf, render_png = argv[0], argv[1], argv[2]
SLEEVE = argv[3] if len(argv) > 3 else "long"
WAIST = float(os.environ.get("WAIST_LINE", "1.05"))
SLEEVE_X = float(os.environ.get("LONG_X", "0.64")) if SLEEVE == "long" else float(os.environ.get("SHORT_X", "0.42"))
THICK = 0.008

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
body = max((o for o in bpy.data.objects if o.type == "MESH" and o.name not in ("Eyes", "Eyebrows") and not o.name.startswith("Icosphere")),
           key=lambda o: len(o.data.vertices))
arm = [o for o in bpy.data.objects if o.type == "ARMATURE"][0]

# 1) Keep only the faces of the torso, shoulders and arms (by centroid).
bm = bmesh.new()
bm.from_mesh(body.data)
def keep(c):
    torso = 1.05 < c.z < 1.36 and abs(c.x) < 0.2 and abs(c.y) < 0.2
    shoulder = 1.30 < c.z < 1.46 and 0.10 < abs(c.x) < 0.22 and abs(c.y) < 0.2
    arms = 1.20 < c.z < 1.50 and 0.22 < abs(c.x) < SLEEVE_X + 0.02 and abs(c.y) < 0.14
    return torso or shoulder or arms
drop = [f for f in bm.faces if not keep(f.calc_center_median())]
bmesh.ops.delete(bm, geom=drop, context="FACES")
mesh = bpy.data.meshes.new("Top")
bm.to_mesh(mesh)
bm.free()
top = bpy.data.objects.new("Top", mesh)
bpy.context.scene.collection.objects.link(top)

# 2) Shell: push the copy out by THICK along the skin.
bpy.context.view_layer.objects.active = top
top.select_set(True)
sol = top.modifiers.new("Skin", "SOLIDIFY")
sol.thickness = THICK
sol.offset = 1.0
sol.use_even_offset = True
bpy.ops.object.modifier_apply(modifier=sol.name)

# 3) Planar cuts: waist line and sleeve ends.
def box(name, x0, x1, z0, z1):
    bpy.ops.mesh.primitive_cube_add(size=1, location=((x0 + x1) / 2, 0, (z0 + z1) / 2))
    c = bpy.context.active_object
    c.name = name
    c.scale = (x1 - x0, 2.0, z1 - z0)
    bpy.ops.object.transform_apply(scale=True)
    return c
cuts = [box("Waist", -2, 2, -2, WAIST), box("SleevePos", SLEEVE_X, 2, -2, 3), box("SleeveNeg", -2, -SLEEVE_X, -2, 3)]
for c in cuts:
    bpy.context.view_layer.objects.active = top
    m = top.modifiers.new("Cut", "BOOLEAN")
    m.operation = "DIFFERENCE"
    m.object = c
    m.solver = "EXACT"
    bpy.ops.object.modifier_apply(modifier=m.name)
    bpy.data.objects.remove(c, do_unlink=True)

# 4) Skin weights from the body, bind to the skeleton.
for g in body.vertex_groups:
    top.vertex_groups.new(name=g.name)
dt = top.modifiers.new("Weights", "DATA_TRANSFER")
dt.object = body
dt.use_vert_data = True
dt.data_types_verts = {"VGROUP_WEIGHTS"}
dt.vert_mapping = "POLYINTERP_NEAREST"
dt.layers_vgroup_select_dst = "NAME"
dt.layers_vgroup_select_src = "ALL"
bpy.ops.object.modifier_apply(modifier=dt.name)
am = top.modifiers.new("Armature", "ARMATURE")
am.object = arm
top.parent = arm
mat = bpy.data.materials.new("TopCharcoal"); mat.use_nodes = True
mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.12, 0.12, 0.14, 1)
top.data.materials.clear(); top.data.materials.append(mat)
for p_ in top.data.polygons:
    p_.use_smooth = True
print("TOP", SLEEVE, "verts", len(top.data.vertices), "groups", len(top.vertex_groups))

for o in list(bpy.data.objects):
    if o.type == "MESH" and o is not top:
        bpy.data.objects.remove(o, do_unlink=True)
bpy.ops.export_scene.gltf(filepath=out_gltf, export_format="GLTF_SEPARATE", export_apply=False)
print("EXPORTED", out_gltf)

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 700
scene.render.resolution_y = 700
scene.view_settings.view_transform = "Standard"
world = bpy.data.worlds.new("W"); scene.world = world; world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.92, 0.94, 0.97, 1)
cam_data = bpy.data.cameras.new("Cam"); cam_data.lens = 60
cam = bpy.data.objects.new("Cam", cam_data); scene.collection.objects.link(cam)
cam.location = (0, -3.6, 1.2)
cam.rotation_euler = (math.radians(90), 0, 0)
scene.camera = cam
sun = bpy.data.lights.new("Sun", "SUN"); sun.energy = 3
sl = bpy.data.objects.new("Sun", sun); scene.collection.objects.link(sl)
sl.rotation_euler = (math.radians(45), 0, math.radians(30))
scene.render.filepath = render_png
bpy.ops.render.render(write_still=True)
print("RENDERED", render_png)
