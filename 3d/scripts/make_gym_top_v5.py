# Gym top v5: a clean tube (regular rings) shrink-wrapped onto the torso.
# Clean topology gives smooth edges; shrinkwrap fits it to the body surface.
# Skin weights are copied from the body; a colour is applied for review.
# Run: Blender -b --python 3d/scripts/make_gym_top_v2.py -- <in.gltf> <out.gltf> <render_prefix>
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

SEGS = 56
RING_Z = [1.03, 1.055, 1.08, 1.105, 1.13, 1.155, 1.18, 1.205, 1.23, 1.255, 1.28]   # hip band to under the bust
RADIUS = 0.19                                    # starts outside the torso
CENTER = Vector((0.0, 0.0, 0.0))

bm = bmesh.new()
rings = []
for z in RING_Z:
    ring = []
    for i in range(SEGS):
        a = 2 * math.pi * i / SEGS
        ring.append(bm.verts.new((RADIUS * math.cos(a), RADIUS * math.sin(a) * 0.62, z)))
    rings.append(ring)
for r0, r1 in zip(rings, rings[1:]):
    for i in range(SEGS):
        j = (i + 1) % SEGS
        bm.faces.new([r0[i], r0[j], r1[j], r1[i]])
bm.normal_update()
mesh = bpy.data.meshes.new("GymTop")
bm.to_mesh(mesh)
bm.free()
top = bpy.data.objects.new("GymTop", mesh)
bpy.context.scene.collection.objects.link(top)
bpy.context.view_layer.objects.active = top
top.select_set(True)

# Shrinkwrap onto the body surface, 8 mm outside it.
sw = top.modifiers.new("Fit", "SHRINKWRAP")
sw.target = body
sw.wrap_method = "NEAREST_SURFACEPOINT"
sw.offset = 0.018
bpy.ops.object.modifier_apply(modifier=sw.name)

# Smooth shading across the faces.
for p in top.data.polygons:
    p.use_smooth = True

# Remove shrinkwrap spikes: any top vertex pulled out onto the arms (|x| too wide).
bm2 = bmesh.new()
bm2.from_mesh(top.data)
bad = [v for v in bm2.verts if abs(v.co.x) > 0.15 and v.co.z > 1.15]
bmesh.ops.delete(bm2, geom=bad, context="VERTS")
bm2.to_mesh(top.data)
bm2.free()
print("PRUNED", len(bad))

# Skin weights from the body. Create the groups first so the transfer has targets.
for g in body.vertex_groups:
    top.vertex_groups.new(name=g.name)
dt = top.modifiers.new("Weights", "DATA_TRANSFER")
dt.object = body
dt.use_vert_data = True
dt.data_types_verts = {"VGROUP_WEIGHTS"}
dt.layers_vgroup_select_dst = "NAME"
dt.layers_vgroup_select_src = "ALL"
dt.vert_mapping = "POLYINTERP_NEAREST"
bpy.ops.object.modifier_apply(modifier=dt.name)

# Colour: one navy material for review.
mat = bpy.data.materials.new("GymTopNavy")
mat.use_nodes = True
mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.07, 0.13, 0.32, 1)
mat.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.6
top.data.materials.append(mat)

arm_mod = top.modifiers.new("Armature", "ARMATURE")
arm_mod.object = arm
top.parent = arm
print("GYMTOP v2 verts", len(top.data.vertices), "groups", len(top.vertex_groups))

scene = bpy.context.scene
bpy.ops.export_scene.gltf(filepath=out_gltf, export_format="GLTF_SEPARATE", export_apply=False)
print("EXPORTED", out_gltf)

scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 700
scene.render.resolution_y = 700
scene.view_settings.view_transform = "Standard"
world = bpy.data.worlds.new("W"); scene.world = world; world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.92, 0.94, 0.97, 1)
cam_data = bpy.data.cameras.new("Cam"); cam_data.lens = 85
cam = bpy.data.objects.new("Cam", cam_data); scene.collection.objects.link(cam)
cam.location = (0, -1.8, 1.2)
cam.rotation_euler = (math.radians(90), 0, 0)
scene.camera = cam
sun = bpy.data.lights.new("Sun", "SUN"); sun.energy = 3
sl = bpy.data.objects.new("Sun", sun); scene.collection.objects.link(sl)
sl.rotation_euler = (math.radians(45), 0, math.radians(30))
scene.render.filepath = f"{prefix}_front.png"
bpy.ops.render.render(write_still=True)
print("RENDERED", scene.render.filepath)
