# Leggings by boolean cut: copy the body (legs and pelvis), cut with clean planes at the
# underwear line (top) and the ankle or mid-thigh line (bottom), then add a thin shell.
# Clean planar cuts give smooth edges, with no stair-steps.
# Run: Blender -b --python 3d/scripts/make_leggings_bool.py -- <body.gltf> <out.gltf> <render.png> long|short
import sys
import math
import os
import bpy

argv = sys.argv[sys.argv.index("--") + 1:]
src, out_gltf, render_png = argv[0], argv[1], argv[2]
LENGTH = argv[3] if len(argv) > 3 else "long"
TOP = float(os.environ.get("TOP_LINE", "1.05"))
BOTTOM = float(os.environ.get("ANKLE_LINE", "0.08")) if LENGTH == "long" else float(os.environ.get("SHORT_LINE", "0.70"))
THICK = float(os.environ.get("THICK", "0.008"))

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
body = max((o for o in bpy.data.objects if o.type == "MESH" and o.name not in ("Eyes", "Eyebrows") and not o.name.startswith("Icosphere")),
           key=lambda o: len(o.data.vertices))
arm = [o for o in bpy.data.objects if o.type == "ARMATURE"][0]

# Copy the body (keeps its vertex groups for the skin weights).
legs = body.copy()
legs.data = body.data.copy()
legs.name = "Leggings"
bpy.context.scene.collection.objects.link(legs)
for m in list(legs.modifiers):
    legs.modifiers.remove(m)
bpy.context.view_layer.objects.active = legs
legs.select_set(True)

def cutter_box(name, z0, z1):
    bpy.ops.mesh.primitive_cube_add(size=4, location=(0, 0, (z0 + z1) / 2))
    c = bpy.context.active_object
    c.name = name
    c.scale = (2.0, 2.0, (z1 - z0) / 4.0)
    bpy.ops.object.transform_apply(scale=True)
    return c

top_cut = cutter_box("TopCut", TOP, TOP + 2.0)      # everything above the underwear line
bottom_cut = cutter_box("BottomCut", BOTTOM - 2.0, BOTTOM)  # everything below the ankle / mid-thigh line
# The underwear curve: a cylinder (axis across the body) whose lower edge is U-shaped,
# so the waist dips by DIP in the middle and meets the flat line at the sides (|x| = 0.12).
DIP = float(os.environ.get("CURVE_DIP", "0.010"))
HALF = 0.12
R = (HALF ** 2 + DIP ** 2) / (2 * DIP)
ZC = (TOP - DIP) + R
bpy.ops.mesh.primitive_cylinder_add(radius=R, depth=2.0, location=(0, 0, ZC), rotation=(math.pi / 2, 0, 0), vertices=96)
curve_cut = bpy.context.active_object
curve_cut.name = "CurveCut"
cuts = [top_cut, bottom_cut] + ([curve_cut] if DIP > 0 else [])
for c in cuts:
    bpy.context.view_layer.objects.active = legs
    m = legs.modifiers.new("Cut", "BOOLEAN")
    m.operation = "DIFFERENCE"
    m.object = c
    m.solver = "EXACT"
    bpy.ops.object.modifier_apply(modifier=m.name)
    bpy.data.objects.remove(c, do_unlink=True)

# Thin skin-tight shell over the cut body.
sol = legs.modifiers.new("Skin", "SOLIDIFY")
sol.thickness = THICK
sol.offset = 1.0
sol.use_even_offset = True
bpy.ops.object.modifier_apply(modifier=sol.name)

am = legs.modifiers.new("Armature", "ARMATURE")
am.object = arm
legs.parent = arm
mat = bpy.data.materials.new("LegNavy"); mat.use_nodes = True
mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.07, 0.13, 0.32, 1)
legs.data.materials.clear()
legs.data.materials.append(mat)
for p_ in legs.data.polygons:
    p_.use_smooth = True
print("LEGGINGS", LENGTH, "verts", len(legs.data.vertices), "groups", len(legs.vertex_groups))

# Hide the bare body so only the leggings are shown in the render and export.
for o in list(bpy.data.objects):
    if o.type == "MESH" and o is not legs:
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
cam.location = (0, -3.6, 0.85)
cam.rotation_euler = (math.radians(90), 0, 0)
scene.camera = cam
sun = bpy.data.lights.new("Sun", "SUN"); sun.energy = 3
sl = bpy.data.objects.new("Sun", sun); scene.collection.objects.link(sl)
sl.rotation_euler = (math.radians(45), 0, math.radians(30))
scene.render.filepath = render_png
bpy.ops.render.render(write_still=True)
print("RENDERED", render_png)
