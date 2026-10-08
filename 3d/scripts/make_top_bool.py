# Activewear top by boolean cut: copy the body's torso and arms, cut the hem at the waist,
# the sleeve ends at x (wrist for long, mid-arm for short), and the neckline above the collar.
# Run: Blender -b --python 3d/scripts/make_top_bool.py -- <body.gltf> <out.gltf> <render.png> long|short
import sys
import math
import os
import bpy

argv = sys.argv[sys.argv.index("--") + 1:]
src, out_gltf, render_png = argv[0], argv[1], argv[2]
SLEEVE = argv[3] if len(argv) > 3 else "long"
WAIST = float(os.environ.get("WAIST_LINE", "1.05"))
SLEEVE_X = float(os.environ.get("LONG_X", "0.64")) if SLEEVE == "long" else float(os.environ.get("SHORT_X", "0.42"))
NECK_Z = float(os.environ.get("NECK_Z", "1.40"))
THICK = 0.008

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
body = max((o for o in bpy.data.objects if o.type == "MESH" and o.name not in ("Eyes", "Eyebrows") and not o.name.startswith("Icosphere")),
           key=lambda o: len(o.data.vertices))
arm = [o for o in bpy.data.objects if o.type == "ARMATURE"][0]

top = body.copy()
top.data = body.data.copy()
top.name = "Top"
bpy.context.scene.collection.objects.link(top)
for m in list(top.modifiers):
    top.modifiers.remove(m)
bpy.context.view_layer.objects.active = top
top.select_set(True)

def box(name, x0, x1, z0, z1, y0=-1.0, y1=1.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2))
    c = bpy.context.active_object
    c.name = name
    c.scale = ((x1 - x0), (y1 - y0), (z1 - z0))
    bpy.ops.object.transform_apply(scale=True)
    return c

def neck_cylinder():
    bpy.ops.mesh.primitive_cylinder_add(radius=float(os.environ.get("NECK_R", "0.12")), depth=1.5, location=(0, 0, NECK_Z + 0.75), vertices=64)
    c = bpy.context.active_object
    c.name = "AboveNeck"
    return c

cutters = [
    box("BelowWaist", -2, 2, -2, WAIST),                      # legs and lower body
    box("OutsideX", SLEEVE_X, 2, -2, 3),                        # sleeve ends (+x)
    box("OutsideX2", -2, -SLEEVE_X, -2, 3),                     # sleeve ends (-x)
    # Round neckline: a vertical cylinder over the neck and head.
    neck_cylinder(),
]
for c in cutters:
    bpy.context.view_layer.objects.active = top
    m = top.modifiers.new("Cut", "BOOLEAN")
    m.operation = "DIFFERENCE"
    m.object = c
    m.solver = "EXACT"
    bpy.ops.object.modifier_apply(modifier=m.name)
    bpy.data.objects.remove(c, do_unlink=True)

sol = top.modifiers.new("Skin", "SOLIDIFY")
sol.thickness = THICK
sol.offset = 1.0
sol.use_even_offset = True
bpy.ops.object.modifier_apply(modifier=sol.name)

am = top.modifiers.new("Armature", "ARMATURE")
am.object = arm
top.parent = arm
mat = bpy.data.materials.new("TopCharcoal"); mat.use_nodes = True
mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.12, 0.12, 0.14, 1)
top.data.materials.clear()
top.data.materials.append(mat)
for p_ in top.data.polygons:
    p_.use_smooth = True
print("TOP", SLEEVE, "verts", len(top.data.vertices))

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
