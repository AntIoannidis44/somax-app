# Inspect a base character glTF: meshes, bones, shape keys (morph targets).
# Run: Blender -b --python 3d/scripts/inspect_base.py -- <file.gltf>
import sys
import bpy

path = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=path)

print("FILE", path)
for obj in bpy.data.objects:
    line = f"OBJ {obj.name} type={obj.type}"
    if obj.type == "MESH":
        me = obj.data
        line += f" verts={len(me.vertices)} faces={len(me.polygons)}"
        keys = me.shape_keys.key_blocks if me.shape_keys else []
        line += f" shape_keys={len(keys)}"
        print(line)
        for k in keys[:60]:
            print("   KEY", k.name)
    elif obj.type == "ARMATURE":
        print(line, f"bones={len(obj.data.bones)}")
        print("   BONES", ", ".join(b.name for b in obj.data.bones[:80]))
    else:
        print(line)
