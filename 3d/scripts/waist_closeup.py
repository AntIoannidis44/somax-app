# Close-up of the waist on the bare body, to find the underwear top line.
# Run: Blender -b --python 3d/scripts/waist_closeup.py -- <body.gltf> <out.png> <z_centre>
import sys
import math
import bpy
argv = sys.argv[sys.argv.index("--") + 1:]
src, out, zc = argv[0], argv[1], float(argv[2])
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 700
scene.render.resolution_y = 700
scene.view_settings.view_transform = "Standard"
world = bpy.data.worlds.new("W"); scene.world = world; world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.92, 0.94, 0.97, 1)
cam_data = bpy.data.cameras.new("Cam"); cam_data.lens = 110
cam = bpy.data.objects.new("Cam", cam_data); scene.collection.objects.link(cam)
cam.location = (0, -1.0, zc)
cam.rotation_euler = (math.radians(90), 0, 0)
scene.camera = cam
sun = bpy.data.lights.new("Sun", "SUN"); sun.energy = 3
sl = bpy.data.objects.new("Sun", sun); scene.collection.objects.link(sl)
sl.rotation_euler = (math.radians(45), 0, math.radians(30))
scene.render.filepath = out
bpy.ops.render.render(write_still=True)
print("RENDERED", out, "centre z", zc)
