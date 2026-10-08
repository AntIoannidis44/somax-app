# Close-up wireframe of the mouth, to see the lip topology.
# Run: Blender -b --python 3d/scripts/mouth_wire.py -- <in.gltf> <out.png>
import sys
import math
import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
src, out = argv[0], argv[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
body = bpy.data.objects["Female_Regular"]
body.hide_render = False
LIP_Z = 1.6100
me = body.data
near = [v for v in me.vertices if abs(v.co.x) < 0.05 and abs(v.co.z - LIP_Z) < 0.05]
front_y = min(v.co.y for v in near)

scene = bpy.context.scene
scene.render.engine = "BLENDER_WORKBENCH"
scene.render.resolution_x = 900
scene.render.resolution_y = 600
scene.display.shading.show_cavity = False
scene.display.shading.light = "STUDIO"
scene.display.shading.color_type = "SINGLE"
scene.display.shading.single_color = (0.85, 0.85, 0.9)
body.display_type = "SOLID"
bpy.context.view_layer.objects.active = body
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="DESELECT")
bpy.ops.object.mode_set(mode="OBJECT")
# Overlay wireframe on the solid body.
body.show_wire = True
body.show_in_front = False
wire = body.modifiers  # keep as-is
cam_data = bpy.data.cameras.new("Cam"); cam_data.lens = 120
cam = bpy.data.objects.new("Cam", cam_data); scene.collection.objects.link(cam)
cam.location = (0, front_y - 0.35, LIP_Z)
cam.rotation_euler = (math.radians(90), 0, 0)
scene.camera = cam
scene.render.filepath = out
bpy.ops.render.render(write_still=True)
print("RENDERED", out)
