import sys
import bpy
lat_data = bpy.data.lattices.new("T")
lat_data.points_u, lat_data.points_v, lat_data.points_w = 4, 2, 3
for i, p in enumerate(lat_data.points[:12]):
    print("PT", i, tuple(round(c, 3) for c in p.co), tuple(round(c, 3) for c in p.co_deform))
print("UVW", lat_data.points_u, lat_data.points_v, lat_data.points_w, "count", len(lat_data.points))
