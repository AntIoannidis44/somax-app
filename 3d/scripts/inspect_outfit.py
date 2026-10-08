# Inspect an outfit piece: meshes, vertex groups (skin bones), and whether it has an armature.
# Run: Blender -b --python 3d/scripts/inspect_outfit.py -- <file.gltf>
import sys
import bpy
src = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
print("FILE", src)
for o in bpy.data.objects:
    if o.type == "MESH":
        groups = [g.name for g in o.vertex_groups]
        mods = [m.type for m in o.modifiers]
        print("MESH", o.name, "verts", len(o.data.vertices), "groups", len(groups), "mods", mods, "sample", groups[:6])
    elif o.type == "ARMATURE":
        print("ARM", o.name, "bones", len(o.data.bones))
