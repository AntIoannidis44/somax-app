
import bpy, sys
from mathutils import Vector
src=sys.argv[sys.argv.index("--")+1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
me=bpy.data.objects["Female_Regular"].data
LIP_Z=1.6100
near=[v for v in me.vertices if abs(v.co.x)<0.05 and abs(v.co.z-LIP_Z)<0.05]
front_y=min(v.co.y for v in near)
band=[v for v in me.vertices if v.co.y<front_y+0.012 and abs(v.co.z-LIP_Z)<0.012 and abs(v.co.x)<0.015]
centre=[v.co.z for v in band if abs(v.co.x)<0.003]
corner=[v.co.z for v in band if abs(v.co.x)>0.009]
cen=[v.co.z for v in band if abs(v.co.x)>=0.003 and abs(v.co.x)<=0.009]
print("N_centre",len(centre),"mean_z",round(sum(centre)/len(centre),5))
print("N_mid",len(cen),"mean_z",round(sum(cen)/len(cen),5))
print("N_corner",len(corner),"mean_z",round(sum(corner)/len(corner),5))
print("front_y",round(front_y,4))
