# Loose torso (singlet or tee body) from the body's own torso skin: keep the torso faces,
# push out a loose shell, cut the hem at the waist and the top edge with flat planes.
# Run: Blender -b --python 3d/scripts/make_torso_bool.py -- <body.gltf> <out.gltf> <render.png>
# Env: WAIST_LINE (hem), TOP_LINE (top edge), THICK (looseness).
import sys
import math
import os
import bmesh
import bpy

argv = sys.argv[sys.argv.index("--") + 1:]
src, out_gltf, render_png = argv[0], argv[1], argv[2]
WAIST = float(os.environ.get("WAIST_LINE", "1.02"))
TOP = float(os.environ.get("TOP_LINE", "1.34"))
THICK = float(os.environ.get("THICK", "0.03"))

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
body = max((o for o in bpy.data.objects if o.type == "MESH" and o.name not in ("Eyes", "Eyebrows") and not o.name.startswith("Icosphere")),
           key=lambda o: len(o.data.vertices))
arm = [o for o in bpy.data.objects if o.type == "ARMATURE"][0]

bm = bmesh.new()
bm.from_mesh(body.data)
def keep(c):
    return WAIST - 0.05 < c.z < TOP + 0.05 and abs(c.x) < 0.3 and abs(c.y) < 0.2
drop = [f for f in bm.faces if not keep(f.calc_center_median())]
bmesh.ops.delete(bm, geom=drop, context="FACES")
me = bpy.data.meshes.new("Torso")
bm.to_mesh(me)
bm.free()
top = bpy.data.objects.new("Torso", me)
bpy.context.scene.collection.objects.link(top)
bpy.context.view_layer.objects.active = top
top.select_set(True)

sol = top.modifiers.new("Loose", "SOLIDIFY")
sol.thickness = THICK
sol.offset = 1.0
sol.use_even_offset = True
bpy.context.view_layer.objects.active = top
bpy.ops.object.modifier_apply(modifier=sol.name)

def box(name, z0, z1):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, (z0 + z1) / 2))
    c = bpy.context.active_object
    c.name = name
    c.scale = (4.0, 4.0, z1 - z0)
    bpy.ops.object.transform_apply(scale=True)
    return c
cuts = [box("Hem", -2, WAIST), box("TopEdge", TOP, TOP + 2)]
for c in cuts:
    bpy.context.view_layer.objects.active = top
    m = top.modifiers.new("Cut", "BOOLEAN")
    m.operation = "DIFFERENCE"
    m.object = c
    m.solver = "FLOAT"
    bpy.context.view_layer.objects.active = top
    bpy.ops.object.modifier_apply(modifier=m.name)
    bpy.data.objects.remove(c, do_unlink=True)

for g in body.vertex_groups:
    top.vertex_groups.new(name=g.name)
dt = top.modifiers.new("Weights", "DATA_TRANSFER")
dt.object = body
dt.use_vert_data = True
dt.data_types_verts = {"VGROUP_WEIGHTS"}
dt.vert_mapping = "POLYINTERP_NEAREST"
dt.layers_vgroup_select_dst = "NAME"
dt.layers_vgroup_select_src = "ALL"
bpy.context.view_layer.objects.active = top
bpy.ops.object.modifier_apply(modifier=dt.name)
am = top.modifiers.new("Armature", "ARMATURE")
am.object = arm
top.parent = arm
mat = bpy.data.materials.new("TorsoColor"); mat.use_nodes = True
mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.2, 0.3, 0.6, 1)
top.data.materials.clear(); top.data.materials.append(mat)
for p_ in top.data.polygons:
    p_.use_smooth = True
print("TORSO verts", len(top.data.vertices), "groups", len(top.vertex_groups))

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
