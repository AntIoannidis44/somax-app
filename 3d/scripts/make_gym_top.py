# Procedural gym top: a thin shell cut from the torso of the base body.
# The shell copies the body's skin weights so it moves with the skeleton.
# Run: Blender -b --python 3d/scripts/make_gym_top.py -- <in.gltf> <out.gltf> <render_prefix>
import sys
import math
import bmesh
import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
src, out_gltf, prefix = argv[0], argv[1], argv[2]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
body = bpy.data.objects["Female_Regular"]
arm = bpy.data.objects["Armature"]

# 1) Torso faces: between hips and shoulders, inside the torso width.
bm = bmesh.new()
bm.from_mesh(body.data)
TORSO_Z = (1.02, 1.42)
TORSO_X = 0.135
faces = [f for f in bm.faces
         if all(TORSO_Z[0] < v.co.z < TORSO_Z[1] and abs(v.co.x) < TORSO_X for v in f.verts)]
print("TORSO faces", len(faces))

# Copy the selected faces into a new mesh.
top_mesh = bpy.data.meshes.new("GymTop")
top_bm = bmesh.new()
vmap = {}
for f in faces:
    for v in f.verts:
        if v not in vmap:
            vmap[v] = top_bm.verts.new(v.co)
for f in faces:
    try:
        top_bm.faces.new([vmap[v] for v in f.verts])
    except ValueError:
        pass
top_bm.normal_update()
top_bm.to_mesh(top_mesh)
top_bm.free()
bm.free()
top = bpy.data.objects.new("GymTop", top_mesh)
bpy.context.scene.collection.objects.link(top)

# 2) Skin weights: copy from the body by nearest face.
dt = top.modifiers.new("Weights", "DATA_TRANSFER")
dt.object = body
dt.use_vert_data = True
dt.data_types_verts = {"VGROUP_WEIGHTS"}
dt.vert_mapping = "POLYINTERP_NEAREST"
bpy.context.view_layer.objects.active = top
bpy.ops.object.datalayout_transfer(modifier=dt.name)
bpy.ops.object.modifier_apply(modifier=dt.name)

# 3) Thickness: a thin shell pushed outward from the body.
sol = top.modifiers.new("Shell", "SOLIDIFY")
sol.thickness = 0.008
sol.offset = 1.0
sol.use_even_offset = True
bpy.ops.object.modifier_apply(modifier=sol.name)

# 4) Bind to the armature.
arm_mod = top.modifiers.new("Armature", "ARMATURE")
arm_mod.object = arm
top.parent = arm
print("GYMTOP verts", len(top.data.vertices), "groups", len(top.vertex_groups))

scene = bpy.context.scene
bpy.context.view_layer.update()
bpy.ops.export_scene.gltf(filepath=out_gltf, export_format="GLTF_SEPARATE", export_apply=False)
print("EXPORTED", out_gltf)

scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 700
scene.render.resolution_y = 700
scene.view_settings.view_transform = "Standard"
world = bpy.data.worlds.new("W"); scene.world = world; world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.92, 0.94, 0.97, 1)
cam_data = bpy.data.cameras.new("Cam"); cam_data.lens = 50
cam = bpy.data.objects.new("Cam", cam_data); scene.collection.objects.link(cam)
cam.location = (0, -3.2, 1.25)
cam.rotation_euler = (math.radians(90), 0, 0)
scene.camera = cam
sun = bpy.data.lights.new("Sun", "SUN"); sun.energy = 3
sl = bpy.data.objects.new("Sun", sun); scene.collection.objects.link(sl)
sl.rotation_euler = (math.radians(45), 0, math.radians(30))
scene.render.filepath = f"{prefix}_front.png"
bpy.ops.render.render(write_still=True)
print("RENDERED", scene.render.filepath)
