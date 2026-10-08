# Render a close front view of the head for review.
# Run: Blender -b --python 3d/scripts/render_front.py -- <file.gltf> <out.png>
import sys
import math
import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
src, out = argv[0], argv[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)

meshes = [o for o in bpy.data.objects if o.type == "MESH" and o.name in ("Female_Regular", "RegularMale")]
body = meshes[0]
corners = [body.matrix_world @ Vector(c) for c in body.bound_box]
zmin = min(c.z for c in corners); zmax = max(c.z for c in corners)
print("BBOX z", zmin, zmax, "height", zmax - zmin)
print("BBOX x", min(c.x for c in corners), max(c.x for c in corners))
print("BBOX y", min(c.y for c in corners), max(c.y for c in corners))

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 900
scene.render.resolution_y = 900
scene.render.filepath = out
scene.view_settings.view_transform = "Standard"
world = bpy.data.worlds.new("W"); scene.world = world; world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.92, 0.94, 0.97, 1)

head_z = zmax - (zmax - zmin) * 0.1
cam_data = bpy.data.cameras.new("Cam"); cam_data.lens = 85
cam = bpy.data.objects.new("Cam", cam_data); scene.collection.objects.link(cam)
cam.location = (0, -2.4, head_z)
cam.rotation_euler = (math.radians(90), 0, 0)
scene.camera = cam

sun = bpy.data.lights.new("Sun", "SUN"); sun.energy = 3
sl = bpy.data.objects.new("Sun", sun); scene.collection.objects.link(sl)
sl.rotation_euler = (math.radians(45), 0, math.radians(30))

bpy.ops.render.render(write_still=True)
print("RENDERED", out)
