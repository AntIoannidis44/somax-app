import * as THREE from 'three';

// Reshapes the outfit pack's garments onto the Teen and Athletic (Superhero) builds.
//
// Every outfit in the Quaternius Modular Character Outfits pack is sculpted on, and
// bound to, the Regular body's skeleton (verified: identical inverse bind matrices).
// Regular wears them unmodified. For any other build the garment is fitted without
// changing that build's body:
//   1. Carry Regular's body and the garment into the target build's bind space, the
//      same way skinning would at rest (per-bone targetBind * regularInverseBind).
//   2. For every Regular body vertex, cast a ray along its normal to the target
//      body's skin, accepting only skin facing the same way, so a ray never lands
//      on the far side of a neck or limb. That gives a body-difference vector there.
//   3. Anchor each garment vertex to its closest point on Regular's skin and move it
//      by the body difference at that spot, without rotating it. The garment keeps
//      exactly the gap over the skin it has on Regular, and far-off parts like a hood
//      can't swing around. That movement is smoothed once over the garment's own
//      surface (welded at UV seams) so neighbouring cloth points never tear apart.
//   4. Carry the result back into the garment's own bind space, so it binds to the
//      target skeleton exactly like an unmodified piece.
// Prototyped and signed off in the Fitting Room artifact before being ported here.

const SKIN_RE = /^MI_(Superhero|Regular|Teen)_(Male|Female)$/;
const RAY_MAX = 0.06;
const FACING_MIN = 0.3;
const GRID_CELL = 0.04;

export interface OutfitFit {
  fitGeometry(mesh: THREE.SkinnedMesh): THREE.BufferGeometry;
}

function skinnedMeshes(root: THREE.Object3D): THREE.SkinnedMesh[] {
  const out: THREE.SkinnedMesh[] = [];
  root.traverse((o) => {
    if ((o as THREE.SkinnedMesh).isSkinnedMesh) out.push(o as THREE.SkinnedMesh);
  });
  return out;
}

function bodySkin(root: THREE.Object3D): THREE.SkinnedMesh {
  const m = skinnedMeshes(root).find((s) => SKIN_RE.test((s.material as THREE.Material).name));
  if (!m) throw new Error('outfitFit: body has no skin mesh');
  return m;
}

function closestOnTri(p: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, out: THREE.Vector3) {
  const ab = b.clone().sub(a), ac = c.clone().sub(a), ap = p.clone().sub(a);
  const d1 = ab.dot(ap), d2 = ac.dot(ap);
  if (d1 <= 0 && d2 <= 0) return out.copy(a);
  const bp = p.clone().sub(b), d3 = ab.dot(bp), d4 = ac.dot(bp);
  if (d3 >= 0 && d4 <= d3) return out.copy(b);
  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) return out.copy(a).addScaledVector(ab, d1 / (d1 - d3));
  const cp = p.clone().sub(c), d5 = ab.dot(cp), d6 = ac.dot(cp);
  if (d6 >= 0 && d5 <= d6) return out.copy(c);
  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) return out.copy(a).addScaledVector(ac, d2 / (d2 - d6));
  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
    return out.copy(b).addScaledVector(c.clone().sub(b), (d4 - d3) / (d4 - d3 + (d5 - d6)));
  }
  const den = 1 / (va + vb + vc);
  return out.copy(a).addScaledVector(ab, vb * den).addScaledVector(ac, vc * den);
}

// Möller-Trumbore, both ray directions allowed: signed distance along `d`, or null.
function rayTri(o: THREE.Vector3, d: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3): number | null {
  const e1 = b.clone().sub(a), e2 = c.clone().sub(a), p = d.clone().cross(e2), det = e1.dot(p);
  if (Math.abs(det) < 1e-10) return null;
  const inv = 1 / det, tv = o.clone().sub(a), u = tv.dot(p) * inv;
  if (u < -1e-4 || u > 1 + 1e-4) return null;
  const q = tv.cross(e1), v = d.dot(q) * inv;
  if (v < -1e-4 || u + v > 1 + 1e-4) return null;
  return e2.dot(q) * inv;
}

function bary(p: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3): [number, number, number] {
  const v0 = b.clone().sub(a), v1 = c.clone().sub(a), v2 = p.clone().sub(a);
  const d00 = v0.dot(v0), d01 = v0.dot(v1), d11 = v1.dot(v1), d20 = v2.dot(v0), d21 = v2.dot(v1);
  const den = d00 * d11 - d01 * d01 || 1e-12;
  const v = (d11 * d20 - d01 * d21) / den, w = (d00 * d21 - d01 * d20) / den;
  return [1 - v - w, v, w];
}

// Per-vertex rest transform (16 floats each) from a mesh's own bind space into the
// target build's, plus each vertex's most-weighted bone name.
function restMatrices(mesh: THREE.SkinnedMesh, K: Map<string, THREE.Matrix4>) {
  const j = mesh.geometry.attributes.skinIndex, w = mesh.geometry.attributes.skinWeight;
  const names = mesh.skeleton.bones.map((b) => b.name);
  const n = j.count, mats = new Float32Array(n * 16), dom: string[] = new Array(n);
  for (let i = 0; i < n; i++) {
    let best = '', bw = -1;
    for (let k = 0; k < 4; k++) {
      const wt = w.getComponent(i, k);
      if (wt <= 0) continue;
      const name = names[j.getComponent(i, k)];
      const e = K.get(name)!.elements;
      for (let q = 0; q < 16; q++) mats[i * 16 + q] += wt * e[q];
      if (wt > bw) { bw = wt; best = name; }
    }
    dom[i] = best;
  }
  return { mats, dom };
}

function applyMat(mats: Float32Array, i: number, v: THREE.Vector3) {
  const o = i * 16, x = v.x, y = v.y, z = v.z;
  return v.set(
    mats[o] * x + mats[o + 4] * y + mats[o + 8] * z + mats[o + 12],
    mats[o + 1] * x + mats[o + 5] * y + mats[o + 9] * z + mats[o + 13],
    mats[o + 2] * x + mats[o + 6] * y + mats[o + 10] * z + mats[o + 14],
  );
}

function boneLists(mesh: THREE.SkinnedMesh, minW: number) {
  const j = mesh.geometry.attributes.skinIndex, w = mesh.geometry.attributes.skinWeight;
  const names = mesh.skeleton.bones.map((b) => b.name);
  const lists = new Map<string, number[]>();
  for (let i = 0; i < j.count; i++) {
    for (let k = 0; k < 4; k++) {
      if (w.getComponent(i, k) < minW) continue;
      const nm = names[j.getComponent(i, k)];
      let l = lists.get(nm);
      if (!l) lists.set(nm, (l = []));
      l.push(i);
    }
  }
  return lists;
}

/** Builds the fit from Regular's body onto `targetBody` (both the pack's FullBody scenes). */
export function buildOutfitFit(regularBody: THREE.Object3D, targetBody: THREE.Object3D): OutfitFit {
  const R = bodySkin(regularBody);
  const T = bodySkin(targetBody);
  const tBind = new Map(T.skeleton.bones.map((b, i) => [b.name, T.skeleton.boneInverses[i].clone().invert()]));
  const K = new Map(R.skeleton.bones.map((b, i) => [b.name, tBind.get(b.name)!.clone().multiply(R.skeleton.boneInverses[i])]));

  // Target body skin, and a spatial grid of its triangles.
  const tPosA = T.geometry.attributes.position, tIdx = T.geometry.index!.array;
  const tP = Array.from({ length: tPosA.count }, (_, i) => new THREE.Vector3().fromBufferAttribute(tPosA, i));
  const triN: THREE.Vector3[] = [];
  const grid = new Map<string, number[]>();
  const key = (x: number, y: number, z: number) => `${x},${y},${z}`;
  for (let t = 0; t < tIdx.length; t += 3) {
    const A = tP[tIdx[t]], B = tP[tIdx[t + 1]], C = tP[tIdx[t + 2]];
    triN[t / 3] = B.clone().sub(A).cross(C.clone().sub(A)).normalize();
    const mn = A.clone().min(B).min(C), mx = A.clone().max(B).max(C);
    for (let x = Math.floor(mn.x / GRID_CELL); x <= Math.floor(mx.x / GRID_CELL); x++)
      for (let y = Math.floor(mn.y / GRID_CELL); y <= Math.floor(mx.y / GRID_CELL); y++)
        for (let z = Math.floor(mn.z / GRID_CELL); z <= Math.floor(mx.z / GRID_CELL); z++) {
          const k = key(x, y, z);
          let cell = grid.get(k);
          if (!cell) grid.set(k, (cell = []));
          cell.push(t);
        }
  }
  const trisNear = (p: THREE.Vector3, r: number) => {
    const out = new Set<number>();
    for (let x = Math.floor((p.x - r) / GRID_CELL); x <= Math.floor((p.x + r) / GRID_CELL); x++)
      for (let y = Math.floor((p.y - r) / GRID_CELL); y <= Math.floor((p.y + r) / GRID_CELL); y++)
        for (let z = Math.floor((p.z - r) / GRID_CELL); z <= Math.floor((p.z + r) / GRID_CELL); z++)
          grid.get(key(x, y, z))?.forEach((t) => out.add(t));
    return out;
  };

  // Regular's skin carried into the target's space, with normals and topology.
  const rRest = restMatrices(R, K);
  const rPosA = R.geometry.attributes.position, rNrmA = R.geometry.attributes.normal, rN = rPosA.count;
  const rP = Array.from({ length: rN }, (_, i) => applyMat(rRest.mats, i, new THREE.Vector3().fromBufferAttribute(rPosA, i)));
  const m3 = new THREE.Matrix3(), m4 = new THREE.Matrix4();
  const rNn = Array.from({ length: rN }, (_, i) => {
    m3.setFromMatrix4(m4.fromArray(rRest.mats, i * 16));
    return new THREE.Vector3().fromBufferAttribute(rNrmA, i).applyMatrix3(m3).normalize();
  });
  const rIdx = R.geometry.index!.array;
  const rTris: number[][] = Array.from({ length: rN }, () => []);
  for (let t = 0; t < rIdx.length; t += 3) for (let k = 0; k < 3; k++) rTris[rIdx[t + k]].push(t);

  // Body difference at each Regular vertex.
  const off: THREE.Vector3[] = new Array(rN);
  const q = new THREE.Vector3();
  for (let i = 0; i < rN; i++) {
    const p = rP[i], n = rNn[i], tris = trisNear(p, RAY_MAX);
    let bestT = Infinity, hit: THREE.Vector3 | null = null;
    for (const t of tris) {
      if (triN[t / 3].dot(n) < FACING_MIN) continue;
      const d = rayTri(p, n, tP[tIdx[t]], tP[tIdx[t + 1]], tP[tIdx[t + 2]]);
      if (d !== null && Math.abs(d) < Math.abs(bestT) && Math.abs(d) < RAY_MAX) bestT = d;
    }
    if (bestT !== Infinity) hit = p.clone().addScaledVector(n, bestT);
    else {
      let cd = RAY_MAX * RAY_MAX;
      for (const t of tris) {
        if (triN[t / 3].dot(n) < FACING_MIN) continue;
        closestOnTri(p, tP[tIdx[t]], tP[tIdx[t + 1]], tP[tIdx[t + 2]], q);
        const d = q.distanceToSquared(p);
        if (d < cd) { cd = d; hit = q.clone(); }
      }
    }
    off[i] = hit ? hit.sub(p) : new THREE.Vector3();
  }
  // Light smoothing so a single stray ray can't dent the cloth.
  const nb: Set<number>[] = Array.from({ length: rN }, () => new Set());
  for (let t = 0; t < rIdx.length; t += 3)
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) if (a !== b) nb[rIdx[t + a]].add(rIdx[t + b]);
  for (let it = 0; it < 2; it++) {
    const next = off.map((o, i) => {
      if (!nb[i].size) return o.clone();
      const avg = new THREE.Vector3();
      nb[i].forEach((j) => avg.add(off[j]));
      return o.clone().multiplyScalar(0.5).addScaledVector(avg, 0.5 / nb[i].size);
    });
    next.forEach((o, i) => off[i].copy(o));
  }
  const rLists = boneLists(R, 0.05);

  const fitGeometry = (mesh: THREE.SkinnedMesh) => {
    const geo = mesh.geometry.clone();
    const rest = restMatrices(mesh, K);
    const pos = geo.attributes.position as THREE.BufferAttribute, n = pos.count;
    const P = Array.from({ length: n }, (_, i) => applyMat(rest.mats, i, new THREE.Vector3().fromBufferAttribute(pos, i)));

    const D = P.map((v, i) => {
      const cand = rLists.get(rest.dom[i]) ?? [];
      const near: [number, number][] = [];
      for (const c of cand) {
        const d = v.distanceToSquared(rP[c]);
        if (near.length < 4 || d < near[near.length - 1][1]) {
          near.push([c, d]);
          near.sort((x, y) => x[1] - y[1]);
          if (near.length > 4) near.pop();
        }
      }
      let cp: THREE.Vector3 | null = null, tri = -1, cd = Infinity;
      const seen = new Set<number>();
      for (const [c] of near) for (const t of rTris[c]) {
        if (seen.has(t)) continue;
        seen.add(t);
        closestOnTri(v, rP[rIdx[t]], rP[rIdx[t + 1]], rP[rIdx[t + 2]], q);
        const d = q.distanceToSquared(v);
        if (d < cd) { cd = d; cp = q.clone(); tri = t; }
      }
      if (!cp) return new THREE.Vector3();
      const ia = rIdx[tri], ib = rIdx[tri + 1], ic = rIdx[tri + 2];
      const [u, w1, w2] = bary(cp, rP[ia], rP[ib], rP[ic]);
      return new THREE.Vector3().addScaledVector(off[ia], u).addScaledVector(off[ib], w1).addScaledVector(off[ic], w2);
    });

    // Weld coincident vertices (UV seams), then smooth the movement once over the garment.
    const weld = new Map<string, number>(), wid = new Int32Array(n);
    P.forEach((v, i) => {
      const k = `${Math.round(v.x * 2e3)},${Math.round(v.y * 2e3)},${Math.round(v.z * 2e3)}`;
      if (!weld.has(k)) weld.set(k, weld.size);
      wid[i] = weld.get(k)!;
    });
    const W = weld.size, wd = Array.from({ length: W }, () => new THREE.Vector3()), wc = new Float32Array(W);
    D.forEach((d, i) => { wd[wid[i]].add(d); wc[wid[i]]++; });
    wd.forEach((d, k) => d.multiplyScalar(1 / wc[k]));
    const wnb: Set<number>[] = Array.from({ length: W }, () => new Set());
    const idx = geo.index!.array;
    for (let t = 0; t < idx.length; t += 3)
      for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) if (a !== b) wnb[wid[idx[t + a]]].add(wid[idx[t + b]]);
    const smoothed = wd.map((d, k) => {
      if (!wnb[k].size) return d.clone();
      const avg = new THREE.Vector3();
      wnb[k].forEach((j) => avg.add(wd[j]));
      return d.clone().multiplyScalar(0.5).addScaledVector(avg, 0.5 / wnb[k].size);
    });

    const inv = new THREE.Matrix4();
    P.forEach((v, i) => {
      v.add(smoothed[wid[i]]);
      inv.fromArray(rest.mats, i * 16).invert();
      v.applyMatrix4(inv);
      pos.setXYZ(i, v.x, v.y, v.z);
    });
    pos.needsUpdate = true;
    return geo;
  };

  return { fitGeometry };
}
