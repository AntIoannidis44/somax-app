# Fit a piece to another body by carrying its offsets across.
# 1. Fit and cut the piece on the regular body (the design).
# 2. Record each vertex's offset from the regular body surface.
# 3. On the target body, place each vertex at the nearest surface point + the same offset.
# Run: Blender -b --python 3d/scripts/fit_by_offset.py -- <regular.gltf> <piece.gltf> <target.gltf> <render.png>
import sys
import math
import bmesh
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree

argv = sys.argv[sys.argv.index("--") + 1:]
reg_path, piece_path, target_path, out = argv[0], argv[1], argv[2], argv[3]

def body_mesh():
    return max((o for o in bpy.data.objects if o.type == "MESH" and o.name not in ("Eyes", "Eyebrows")
                and not o.name.startswith("Icosphere") and not o.name.startswith("GymTop")),
               key=lambda o: len(o.data.vertices))

def bvh_of(obj):
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.transform(obj.matrix_world)
    tree = BVHTree.FromBMesh(bm)
    bm.free()
    return tree

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=reg_path)
reg_body = body_mesh()
reg_tree = bvh_of(reg_body)

before = set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=piece_path)
new = [o for o in bpy.data.objects if o not in before]
pieces = [o for o in new if o.type == "MESH" and not o.name.startswith("Icosphere")]
junk = [o for o in new if o.type == "ARMATURE" or (o.type == "MESH" and o.name.startswith("Icosphere"))]
piece = pieces[0]
for o in junk:
    bpy.data.objects.remove(o, do_unlink=True)

# Flatten a ragged top edge (e.g. a waistband): snap the top few millimetres to one height.
import os as _os
if _os.environ.get("FLAT_TOP", "0") == "1":
    zmax = max(v.co.z for v in piece.data.vertices)
    snapped = 0
    for v in piece.data.vertices:
        if v.co.z > zmax - float(_os.environ.get('FLAT_BAND', '0.03')):
            v.co.z = zmax
            snapped += 1
    piece.data.update()
    print("FLAT_TOP snapped", snapped, "to z", round(zmax, 4))

# Fill the small holes in the source piece (the navel notches), so no skin shows through.
bm = bmesh.new()
bm.from_mesh(piece.data)
bm.edges.ensure_lookup_table()
boundary = [e for e in bm.edges if e.is_boundary]
# Group boundary edges into loops; fill only the SMALL ones (the navel and bust gaps),
# never the big open edges of the top (neck, armholes, hem).
parent = {}
def find(a):
    while parent.setdefault(a, a) != a:
        parent[a] = parent[parent[a]]
        a = parent[a]
    return a
for e in boundary:
    a, b = e.verts
    parent[find(a)] = find(b)
clusters = {}
for e in boundary:
    clusters.setdefault(find(e.verts[0]), []).append(e)
small = []
for key, edges in clusters.items():
    length = sum(e.calc_length() for e in edges)
    if length < 0.12:
        small.extend(edges)
print("LOOPS", len(clusters), "small edges to fill", len(small))
if small:
    bmesh.ops.holes_fill(bm, edges=small, sides=32)
bm.to_mesh(piece.data)
bm.free()
piece.data.update()
print("FILLED boundary edges", len(boundary))
# Make every face point outward, so no faces render dark or inside-out.
bm = bmesh.new()
bm.from_mesh(piece.data)
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
bm.normal_update()
bm.to_mesh(piece.data)
bm.free()
piece.data.update()
print("NORMALS recalculated")

# 1) Cut the design on the regular body (crop and sports cut), using the same
# shapes as fit_outfit_piece_v9 with k = 1.
import os
bm = bmesh.new()
bm.from_mesh(piece.data)
import os as _os
HEM_Z = float(_os.environ.get("HEM_Z", "1.12"))
EASE = float(_os.environ.get("EASE", "1.0"))
drop = [v for v in bm.verts if v.co.z < HEM_Z]
bmesh.ops.delete(bm, geom=drop, context="VERTS")
bm.to_mesh(piece.data)
bm.free()
piece.data.update()

def cutter_sphere(name, loc, sc):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=48, ring_count=24, location=loc)
    c = bpy.context.active_object; c.name = name; c.scale = sc
    bpy.ops.object.transform_apply(scale=True)
    return c
def cutter_cyl(name, loc, r, depth):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, rotation=(math.pi / 2, 0, 0), vertices=48)
    c = bpy.context.active_object; c.name = name
    return c
cutters = [cutter_sphere("NeckCut", (0.0, 0.0, 1.53), (0.10, 0.4, 0.15)),
           cutter_cyl("ArmL", (0.24, 0.0, 1.18), 0.085, 1.0),
           cutter_cyl("ArmR", (-0.24, 0.0, 1.18), 0.085, 1.0)]
if _os.environ.get("NOCUT", "0") != "1":
  for c in cutters:
      bpy.context.view_layer.objects.active = piece
      m = piece.modifiers.new("SportCut", "BOOLEAN")
      m.operation = "DIFFERENCE"; m.object = c; m.solver = "EXACT"
      bpy.ops.object.modifier_apply(modifier=m.name)
      bpy.data.objects.remove(c, do_unlink=True)

# 2) Record offsets from the regular body surface.
offsets = []
for v in piece.data.vertices:
    p = piece.matrix_world @ v.co
    loc, nrm, idx, dist = reg_tree.find_nearest(p)
    offsets.append((loc, p - loc, nrm))
print("OFFSETS", len(offsets))

# 3) Remove the regular body, load the target body, and carry the offsets across.
for o in list(bpy.data.objects):
    if o is not piece and o.type in ("MESH", "ARMATURE") and o.name != piece.name:
        bpy.data.objects.remove(o, do_unlink=True)
bpy.ops.import_scene.gltf(filepath=target_path)
tgt_body = body_mesh()
tgt_arm = [o for o in bpy.data.objects if o.type == "ARMATURE"][-1]
tgt_tree = bvh_of(tgt_body)
CLEAR = float(_os.environ.get("CLEAR", "0"))
BLEND = float(_os.environ.get("BLEND", "0"))
PANEL = float(_os.environ.get("PANEL", "0"))
EXPORT = _os.environ.get("EXPORT", "")
CLEAR_TUBE = float(_os.environ.get("CLEAR_TUBE", "0.02"))
for v, (loc, off, rn) in zip(piece.data.vertices, offsets):
    near, nrm, idx, dist = tgt_tree.find_nearest(loc)
    # Shoulder caps keep the normal fit (extra ease there flares them into spikes).
    shoulder = abs(near.x) > 0.13 and near.z > 1.2
    # Clearance: push the fabric outward from the body, so it drapes (bust included).
    push = 0.0 if shoulder else CLEAR
    fit = near + off * (1.0 if shoulder else EASE) + rn.normalized() * push
    if not shoulder and BLEND > 0 and near.z < 1.33 and abs(near.x) < 0.16:
        # Drape: blend toward a smooth tube sized to the body at this height,
        # so the bust and waist shapes don't show through.
        vz = near.z
        band = [b for b in tgt_body.data.vertices if abs(b.co.z - vz) < 0.012 and abs(b.co.x) < 0.2]
        rx = max(abs(b.co.x) for b in band) + CLEAR_TUBE
        ry = max(abs(b.co.y) for b in band) + CLEAR_TUBE
        a = math.atan2(near.y, near.x)
        env = Vector((rx * math.cos(a), ry * math.sin(a), vz))
        fit = fit.lerp(env, BLEND)
    # Flat front panel: over the chest, the fabric sits in front of the centre line by PANEL,
    # so the bust doesn't show as a shape.
    if PANEL > 0 and not shoulder and 1.08 < near.z < 1.33 and abs(near.x) < 0.14:
        # Front-most point of the chest (the bust tip), not the cleavage.
        centre_front = min(b.co.y for b in tgt_body.data.vertices if abs(b.co.z - near.z) < 0.012 and abs(b.co.x) < 0.12)
        fit.y = min(fit.y, centre_front - PANEL)
    v.co = piece.matrix_world.inverted() @ fit
piece.data.update()
print("CARRIED to", tgt_body.name)

# Bind to the target skeleton.
for m in piece.modifiers:
    if m.type == "ARMATURE":
        m.object = tgt_arm
piece.parent = tgt_arm
mat = bpy.data.materials.new("GymNavy"); mat.use_nodes = True
mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.07, 0.13, 0.32, 1)
piece.data.materials.clear(); piece.data.materials.append(mat)

if EXPORT:
    for o in list(bpy.data.objects):
        if o.type == "MESH" and o is not piece:
            bpy.data.objects.remove(o, do_unlink=True)
    bpy.ops.export_scene.gltf(filepath=EXPORT, export_format="GLTF_SEPARATE", export_apply=False)
    print("EXPORTED", EXPORT)

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 700
scene.render.resolution_y = 700
scene.view_settings.view_transform = "Standard"
world = bpy.data.worlds.new("W"); scene.world = world; world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.92, 0.94, 0.97, 1)
cam_data = bpy.data.cameras.new("Cam"); cam_data.lens = float(_os.environ.get("LENS", "85"))
cam = bpy.data.objects.new("Cam", cam_data); scene.collection.objects.link(cam)
_cl = [float(x) for x in _os.environ.get("CAM_LOC", "0,-2.6,1.2").split(",")]
cam.location = tuple(_cl)
cam.rotation_euler = (math.radians(90), 0, 0)
scene.camera = cam
sun = bpy.data.lights.new("Sun", "SUN"); sun.energy = 3
sl = bpy.data.objects.new("Sun", sun); scene.collection.objects.link(sl)
sl.rotation_euler = (math.radians(45), 0, math.radians(30))
scene.render.filepath = out
bpy.ops.render.render(write_still=True)
print("RENDERED", out)
