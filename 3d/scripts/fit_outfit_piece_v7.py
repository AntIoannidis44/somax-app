# Put an outfit piece on the base body (same skeleton), optionally cut it into a crop top, and render the front.
# Run: Blender -b --python 3d/scripts/fit_outfit_piece.py -- <base.gltf> <piece.gltf> <render.png>
import sys
import math
import bpy

argv = sys.argv[sys.argv.index("--") + 1:]
base, piece, out = argv[0], argv[1], argv[2]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=base)
base_arm = bpy.data.objects["Armature"]
before = set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=piece)
new = [o for o in bpy.data.objects if o not in before]
meshes = [o for o in new if o.type == "MESH"]
armatures = [o for o in new if o.type == "ARMATURE"]
import os
import bmesh
CUT_Z = float(os.environ.get("CUT_Z", "0"))
for o in meshes:
    if CUT_Z > 0 and o.name.startswith("Icosphere") is False:
        bm = bmesh.new()
        bm.from_mesh(o.data)
        drop = [v for v in bm.verts if v.co.z < CUT_Z]
        bmesh.ops.delete(bm, geom=drop, context="VERTS")
        bm.to_mesh(o.data)
        bm.free()
        o.data.update()
        print("CROPPED below z", CUT_Z, "removed", len(drop))
    if os.environ.get("SPORT", "0") == "1" and not o.name.startswith("Icosphere"):
        # Sports cut with boolean shapes (clean edges): a scoop neckline and two armholes.
        import math as _m
        def cutter_sphere(name, loc, sc):
            bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=48, ring_count=24, location=loc)
            c = bpy.context.active_object; c.name = name
            c.scale = sc
            bpy.ops.object.transform_apply(scale=True)
            return c
        def cutter_cyl(name, loc, r, depth):
            bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, rotation=(_m.pi / 2, 0, 0), vertices=48)
            c = bpy.context.active_object; c.name = name
            return c
        cutters = [
            cutter_sphere("NeckCut", (0.0, 0.0, 1.53), (0.10, 0.4, 0.15)),
            cutter_cyl("ArmL", (0.24, 0.0, 1.18), 0.085, 1.0),
            cutter_cyl("ArmR", (-0.24, 0.0, 1.18), 0.085, 1.0),
        ]
        for c in cutters:
            bpy.context.view_layer.objects.active = o
            m = o.modifiers.new("SportCut", "BOOLEAN")
            m.operation = "DIFFERENCE"
            m.object = c
            m.solver = "EXACT"
            bpy.ops.object.modifier_apply(modifier=m.name)
        for c in cutters:
            bpy.data.objects.remove(c, do_unlink=True)
        print("SPORT boolean cuts applied")
    for m in o.modifiers:
        if m.type == "ARMATURE":
            m.object = base_arm
    o.parent = base_arm
    mat = bpy.data.materials.new("GymNavy"); mat.use_nodes = True
    mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.07, 0.13, 0.32, 1)
    o.data.materials.clear()
    o.data.materials.append(mat)
    for poly in o.data.polygons:
        poly.material_index = 0
    o.active_material = mat
    print("PIECE", o.name, len(o.data.vertices))
for a in armatures:
    bpy.data.objects.remove(a, do_unlink=True)

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 700
scene.render.resolution_y = 700
scene.view_settings.view_transform = "Standard"
world = bpy.data.worlds.new("W"); scene.world = world; world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.92, 0.94, 0.97, 1)
cam_data = bpy.data.cameras.new("Cam"); cam_data.lens = 85
cam = bpy.data.objects.new("Cam", cam_data); scene.collection.objects.link(cam)
cam.location = (0, -2.6, 1.2)
cam.rotation_euler = (math.radians(90), 0, 0)
scene.camera = cam
sun = bpy.data.lights.new("Sun", "SUN"); sun.energy = 3
sl = bpy.data.objects.new("Sun", sun); scene.collection.objects.link(sl)
sl.rotation_euler = (math.radians(45), 0, math.radians(30))
scene.render.filepath = out
bpy.ops.render.render(write_still=True)
print("RENDERED", out)
