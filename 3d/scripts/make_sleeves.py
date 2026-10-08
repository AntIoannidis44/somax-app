# Sleeves from the body's own arm skin: copy the arm faces (one side), push out a thin shell,
# and cut the sleeve end with a flat plane (clean edge). Export one piece per side.
# Run: Blender -b --python 3d/scripts/make_sleeves.py -- <body.gltf> <out_prefix> <render.png> long|short
import sys
import math
import os
import bmesh
import bpy

argv = sys.argv[sys.argv.index("--") + 1:]
src, out_prefix, render_png = argv[0], argv[1], argv[2]
SLEEVE = argv[3] if len(argv) > 3 else "long"
SLEEVE_X = float(os.environ.get("LONG_X", "0.64")) if SLEEVE == "long" else float(os.environ.get("SHORT_X", "0.42"))
THICK = 0.008

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
body = max((o for o in bpy.data.objects if o.type == "MESH" and o.name not in ("Eyes", "Eyebrows") and not o.name.startswith("Icosphere")),
           key=lambda o: len(o.data.vertices))
arm = [o for o in bpy.data.objects if o.type == "ARMATURE"][0]
body_mesh_name = body.name

def make_side(sign):
    bm = bmesh.new()
    bm.from_mesh(body.data)
    def keep(c):
        return 1.20 < c.z < 1.50 and 0.12 < sign * c.x < SLEEVE_X + 0.03 and abs(c.y) < 0.16
    drop = [f for f in bm.faces if not keep(f.calc_center_median())]
    bmesh.ops.delete(bm, geom=drop, context="FACES")
    me = bpy.data.meshes.new(f"Sleeve{'R' if sign > 0 else 'L'}")
    bm.to_mesh(me)
    print("DBG kept faces", len(bm.faces), "verts", len(me.vertices))
    bm.free()
    ob = bpy.data.objects.new(me.name, me)
    bpy.context.scene.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    sol = ob.modifiers.new("Skin", "SOLIDIFY")
    sol.thickness = THICK
    sol.offset = 1.0
    sol.use_even_offset = True
    bpy.ops.object.modifier_apply(modifier=sol.name)
    print("DBG after solidify", len(ob.data.vertices), "cube?")
    bpy.ops.mesh.primitive_cube_add(size=1, location=(sign * (SLEEVE_X + 1.0), 0, 1.3))
    cut = bpy.context.active_object
    cut.name = "SleeveEnd"
    cut.scale = (2.0, 2.0, 2.0)
    bpy.ops.object.transform_apply(scale=True)
    bpy.context.view_layer.objects.active = ob
    m = ob.modifiers.new("Cut", "BOOLEAN")
    m.operation = "DIFFERENCE"
    m.object = cut
    m.solver = "FLOAT"
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.modifier_apply(modifier=m.name)
    print("DBG after cut", len(ob.data.vertices), "cut scale", tuple(round(c,3) for c in cut.dimensions))
    bpy.data.objects.remove(cut, do_unlink=True)
    for g in body.vertex_groups:
        if g.name not in ob.vertex_groups:
            ob.vertex_groups.new(name=g.name)
    dt = ob.modifiers.new("Weights", "DATA_TRANSFER")
    dt.object = body
    dt.use_vert_data = True
    dt.data_types_verts = {"VGROUP_WEIGHTS"}
    dt.vert_mapping = "POLYINTERP_NEAREST"
    dt.layers_vgroup_select_dst = "NAME"
    dt.layers_vgroup_select_src = "ALL"
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.modifier_apply(modifier=dt.name)
    am = ob.modifiers.new("Armature", "ARMATURE")
    am.object = arm
    ob.parent = arm
    col = tuple(float(x) for x in os.environ.get("SLEEVE_COLOR", "0.12,0.12,0.14").split(",")) + (1,)
    mat = bpy.data.materials.new("SleeveColor"); mat.use_nodes = True
    mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = col
    ob.data.materials.clear(); ob.data.materials.append(mat)
    for p_ in ob.data.polygons:
        p_.use_smooth = True
    print("SLEEVE", "R" if sign > 0 else "L", "verts", len(ob.data.vertices), "groups", len(ob.vertex_groups))
    return ob

sides = [make_side(1.0), make_side(-1.0)]
for o in list(bpy.data.objects):
    if o.type == "MESH" and o not in sides:
        bpy.data.objects.remove(o, do_unlink=True)
bpy.ops.export_scene.gltf(filepath=out_prefix + ".gltf", export_format="GLTF_SEPARATE", export_apply=False)
print("EXPORTED", out_prefix)

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
cam.location = (0, -3.6, 1.2)
cam.rotation_euler = (_m.radians(90), 0, 0)
scene.camera = cam
sun = bpy.data.lights.new("Sun", "SUN"); sun.energy = 3
sl = bpy.data.objects.new("Sun", sun); scene.collection.objects.link(sl)
sl.rotation_euler = (_m.radians(45), 0, _m.radians(30))
scene.render.filepath = render_png
bpy.ops.render.render(write_still=True)
print("RENDERED", render_png)
