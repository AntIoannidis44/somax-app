// @ts-nocheck
// Gym wear: garments generated from each body build's own skin mesh.
// Ported unchanged from the Gym Wardrobe artifact (gym-wardrobe/index.html), where every
// piece was reviewed and approved per build; keep the two in step if either changes.
import * as THREE from 'three';

const SKIN_RE = /^MI_(Superhero|Regular|Teen)_(Male|Female)$/;

// ---------------------------------------------------------------- garments
// Cuts are placed from the build's own joints (J), in bind pose (T-pose, Y up, facing +Z).
// Each garment: a list of keep-fields (vertex kept where field >= 0), a fit, and a look.
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

const waistY = (J, k) => J.spine_01.y + k;
// Rounded joins between two cut lines (k = corner radius in metres): no notch where they meet.
const smax = (a, b, k = 0.012) => (a + b + Math.sqrt((a - b) ** 2 + k * k)) / 2;
const smin = (a, b, k = 0.012) => (a + b - Math.sqrt((a - b) ** 2 + k * k)) / 2;
const legY = (J, t) => lerp(J.calf.y, J.thigh.y, t); // t=0 knee, 1 hip joint
// Neckline: a line across the front and back of the chest. Above it is removed; it dips by
// `frontDrop`/`backDrop` at the centre and rises back to the neck base over `halfW` either side,
// so it scoops like a real neckline and never reaches round into the chest.
const neckField = (J, frontDrop, backDrop, halfW, backHalfW = halfW * 0.85, round = 1, narrowCap = false) => (p) => {
  // One smooth scoop: deepest at the centre, easing out to the neck base with no corner, so the
  // neckline runs straight into the straps or shoulders. Front and back blend over the neck's depth.
  const dz = p.z - J.neck.z, front = smooth(-0.07, 0.07, dz);
  const hw = lerp(backHalfW, halfW, front), t = p.x / hw;
  const yLine = J.neck.y - 0.012 - lerp(backDrop, frontDrop, front) * Math.exp(-1.6 * Math.pow(t * t, round));
  // Only within a collar-sized ring around the neck: shoulders and straps outside it are never cut,
  // however high the trapezius rises (it rises higher on the male bodies).
  const ring = Math.hypot(p.x / (hw * 1.6), dz / 0.13) - 1;
  // nothing above the neck base: across the whole body by default (women's tops, approved), or only
  // over the neck and head when narrowCap is set, so a high trapezius keeps its strap (men's tops)
  const cap = narrowCap ? smin(smax(J.neck.y + 0.02 - p.y, (Math.hypot(p.x / 0.075, dz / 0.2) - 1) * 0.05), J.neck.y + 0.05 - p.y) : J.neck.y + 0.02 - p.y;
  return smin(smax(yLine - p.y, ring * 0.05), cap);
};
const sleeveField = (J, t) => (p) => lerp(J.upperarm.x, J.lowerarm.x, t) - Math.abs(p.x);
// Angled sleeve hem, like a cut-and-sewn tee: shorter underneath (toward the armpit) than on top,
// so no cloth hangs into the armpit corner when the arm is down.
const sleeveAngled = (J, t, under) => (p) => {
  const below = smooth(J.upperarm.y + 0.01, J.upperarm.y - 0.05, p.y); // 0 on top of the arm, 1 underneath
  return lerp(J.upperarm.x, J.lowerarm.x, t) - under * below - Math.abs(p.x);
};
// Armhole for sleeveless pieces: the arm is cut off just inside the shoulder joint, and the opening
// continues down the side of the torso as an oval seen from the side (front-to-back and
// up-and-down), so it opens the side under the arm without ever reaching the chest or back.
const armholeField = (J, inset, depth, halfDepthZ, strapX = null, U = null, hipSafe = false) => (p) => {
  const ax = Math.abs(p.x), x0 = Math.max(J.upperarm.x - inset, U?.hasBra ? U.braOuterX + 0.012 : 0);
  const yc = J.upperarm.y - depth * 0.45, zc = J.upperarm.z + 0.005;
  const oval = Math.hypot((p.y - yc) / depth, (p.z - zc) / halfDepthZ) - 1;
  const side = Math.max(J.upperarm.x - 0.075, U?.hasBra ? U.braOuterX + 0.012 : 0) - ax; // only the side wall, outside the bra
  const armCut = hipSafe ? smax(x0 - ax, (yc - depth - 0.03) - p.y) : x0 - ax; // hipSafe: never reaches the hips
  let f = smin(armCut, smax(oval * 0.04, side));
  if (strapX !== null) {
    // straps: beyond the strap line the top of the shoulder is removed, the cut sloping down to meet the armhole
    const yCut = J.upperarm.y + 0.01 - 1.1 * Math.max(0, ax - strapX);
    f = smin(f, smax(strapX - ax, yCut - p.y));
  }
  return f;
};

const GARMENTS = {
  // bottoms
  leggingsLong: { label: 'Leggings', slot: 'bottom', fit: 'tight', ease: 0.004, sheen: true, color: '#1f2933',
    keep: (J) => [(p) => waistY(J, 0.015) - p.y, (p) => p.y - (J.foot.y + 0.06)], waistband: 0.05 },
  leggingsShort: { label: 'Bike shorts', slot: 'bottom', fit: 'tight', ease: 0.004, sheen: true, color: '#3b3f6b',
    keep: (J) => [(p) => waistY(J, 0.015) - p.y, (p) => p.y - legY(J, 0.38)], waistband: 0.05 },
  bikeShortsMale: { label: 'Bike shorts', slot: 'bottom', fit: 'tight', ease: 0.004, sheen: true, color: '#23262b',
    keep: (J) => [(p) => waistY(J, 0.015) - p.y, (p) => p.y - legY(J, 0.35)], waistband: 0.05 },
  shorts: { label: 'Shorts', slot: 'bottom', fit: 'loose', fine: true, ease: 0.009, flare: 0.012, color: '#2d3a4a', inner: true,
    keep: (J, U) => [(p) => Math.max(waistY(J, -0.02), U.briefsTop + 0.012) - p.y, (p) => p.y - legY(J, 0.55)], waistband: 0.035 },
  shortsMale: { label: 'Shorts', slot: 'bottom', fit: 'loose', fine: true, ease: 0.01, flare: 0.016, color: '#2d3a4a', inner: true,
    keep: (J, U) => [(p) => Math.max(waistY(J, -0.025), U.briefsTop + 0.012) - p.y, (p) => p.y - legY(J, 0.3)], waistband: 0.035 },
  trackpants: { label: 'Track pants', slot: 'bottom', fit: 'loose', ease: 0.006, bag: 0.018, cuff: 0.045, stripes: true, color: '#262a30',
    keep: (J) => [(p) => waistY(J, -0.02) - p.y, (p) => p.y - (J.foot.y + 0.075)], waistband: 0.04 },
  // tops
  cropTight: { label: 'Crop (tight)', slot: 'top', fit: 'tight', fine: true, ease: 0.004, sheen: true, color: '#b8455a', inner: true,
    keep: (J, U) => [neckField(J, 0.1, 0.04, 0.065), armholeField(J, 0.02, 0.05, 0.05, 0.1, U), (p) => p.y - Math.min(J.spine_03.y - 0.085, U.braBottom - 0.015)], hemBand: 0.03 },
  cropLoose: { label: 'Crop (loose)', slot: 'top', fit: 'loose', fine: true, hemDamp: 0.015, ease: 0.014, flare: 0.0, fallCurve: { a: 0.0, b: 1.2 }, sleeveFlare: 0.012, tent: -0.03, baggy: 60, smoothSkin: 6, color: '#d9d2c5', inner: true,
    keep: (J) => [neckField(J, 0.05, 0.015, 0.075), sleeveField(J, 0.42), (p) => p.y - (J.spine_02.y + 0.01)] },
  singletTight: { label: 'Singlet (tight)', slot: 'top', fit: 'tight', fine: true, ease: 0.004, color: '#2b2e33', inner: true,
    keep: (J, U) => [neckField(J, 0.06, 0.025, 0.055), armholeField(J, 0.035, 0.09, 0.065, 0.135, U), (p) => p.y - (J.pelvis.y + 0.07)] },
  singletLoose: { innerDark: 0.88, strapHug: 0.008, label: 'Singlet (loose)', slot: 'top', fit: 'loose', fine: true, ease: 0.014, flare: 0.016, tent: 0.05, baggy: 40, trim: 0.012, color: '#5b6b5a', inner: true,
    keep: (J, U) => [neckField(J, 0.055, 0.03, 0.05, 0.045, 2, true), armholeField(J, 0.035, 0.075, 0.065, 0.13, U, true), (p) => p.y - (J.pelvis.y + 0.08)] },
  singletTightM: { innerDark: 0.88, label: 'Singlet (tight)', slot: 'top', fit: 'tight', fine: true, ease: 0.0065, trim: 0.01, color: '#2b2e33', inner: true,
    keep: (J, U) => [neckField(J, 0.05, 0.025, 0.048, 0.045, 2, true), armholeField(J, 0.035, 0.09, 0.065, 0.13, U, true), (p) => p.y - (J.pelvis.y + 0.07)] },
  teeTight: { innerDark: 0.88, armpitEase: 0.013, label: 'Tee (tight)', slot: 'top', fit: 'tight', fine: true, ease: 0.0065, smoothSkin: 4, trim: 0.012, color: '#e8e6e1', inner: true,
    keep: (J) => [neckField(J, 0.035, 0.01, 0.06, 0.05, 2, true), sleeveField(J, 0.4), (p) => p.y - (J.pelvis.y + 0.07)] },
  teeLoose: { perBuild: { superhero: { dBlend: 3 } }, label: 'Tee', slot: 'top', fit: 'loose', fine: true, ease: 0.014, flare: 0.012, fallCurve: { a: 0.0, b: 2.5 }, sleeveFlare: 0.014, tent: -0.02, baggy: 60, folds: { amp: 0.02, n: [5, 9, 13] }, smoothSkin: 6, color: '#4a6fa5', inner: true,
    keep: (J) => [neckField(J, 0.04, 0.012, 0.07), sleeveField(J, 0.5), (p) => p.y - (J.pelvis.y + 0.06)] },
  teeLooseM: { perBuild: { superhero: { dBlend: 25, ease: 0.022, armpitEase: 0.012, sleeveRigid: true, sleeveFlare: 0.0, capFit: 0.12, keep: (J) => [neckField(J, 0.035, 0.01, 0.06, 0.05, 2, true), sleeveAngled(J, 0.5, 0.06), (p) => p.y - (J.pelvis.y + 0.06)] } }, innerDark: 0.88, armpitEase: 0.006, strapHug: 0.008, capFit: 0.05, label: 'Tee (loose)', slot: 'top', fit: 'loose', fine: true, ease: 0.016, flare: 0.026, sleeveFlare: 0.02, tent: -0.03, baggy: 80, folds: { amp: 0.022, n: [4, 7, 11] }, smoothSkin: 3, trim: 0.012, color: '#4a6fa5', inner: true,
    keep: (J) => [neckField(J, 0.035, 0.01, 0.06, 0.05, 2, true), sleeveField(J, 0.5), (p) => p.y - (J.pelvis.y + 0.06)] },
};
// Footwear: one pair of trainers, built from each build's own foot like the clothing. A padded
// upper over the foot (toes bridged into one toe box), a collar at the ankle, and a thick sole
// that sticks out a little past the foot all round.
GARMENTS.trainers = { label: 'Trainers', slot: 'shoes', fit: 'tight', ease: 0.005, collar: 0.04, shoe: true, color: '#f2f2f0',
  keep: (J) => [] };
const MENU = {
  female: { shoes: ['none', 'trainers'], top: ['none', 'cropTight', 'cropLoose', 'singletTight', 'teeLoose'], bottom: ['none', 'leggingsLong', 'leggingsShort', 'shorts', 'trackpants'] },
  male: { shoes: ['none', 'trainers'], top: ['none', 'singletTightM', 'singletLoose', 'teeTight', 'teeLooseM'], bottom: ['none', 'bikeShortsMale', 'shortsMale', 'trackpants'] },
};

// ---------------------------------------------------------------- mesh plumbing
// A plain editable mesh: positions, normals, uvs, skin (4 joints/weights), triangles.
function meshFrom(geo) {
  const g = geo.index ? geo : geo.toIndexed?.() || geo;
  const n = g.attributes.position.count;
  return {
    pos: Array.from({ length: n }, (_, i) => new THREE.Vector3().fromBufferAttribute(g.attributes.position, i)),
    nrm: Array.from({ length: n }, (_, i) => new THREE.Vector3().fromBufferAttribute(g.attributes.normal, i)),
    uv: Array.from({ length: n }, (_, i) => new THREE.Vector2().fromBufferAttribute(g.attributes.uv, i)),
    sj: Array.from({ length: n }, (_, i) => [0, 1, 2, 3].map((k) => g.attributes.skinIndex.getComponent(i, k))),
    sw: Array.from({ length: n }, (_, i) => [0, 1, 2, 3].map((k) => g.attributes.skinWeight.getComponent(i, k))),
    tris: Array.from(g.index.array),
    src: Array.from({ length: n }, (_, i) => i),
  };
}
function mixSkin(ja, wa, jb, wb, t) {
  const m = new Map();
  for (let k = 0; k < 4; k++) { if (wa[k] > 0) m.set(ja[k], (m.get(ja[k]) || 0) + wa[k] * (1 - t)); if (wb[k] > 0) m.set(jb[k], (m.get(jb[k]) || 0) + wb[k] * t); }
  const top = [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const s = top.reduce((a, e) => a + e[1], 0) || 1;
  while (top.length < 4) top.push([0, 0]);
  return [top.map((e) => e[0]), top.map((e) => e[1] / s)];
}
// Clip triangles to field >= 0, splitting every triangle the cut line crosses, so edges are exact
// curves instead of the jagged outline of whole triangles. New vertices on an edge are shared by
// both triangles that use that edge.
function clip(mesh, field) {
  const f = mesh.pos.map((p) => field(p));
  const out = { pos: [], nrm: [], uv: [], sj: [], sw: [], tris: [], src: [] };
  const remap = new Map(), edge = new Map();
  const keepV = (i) => { if (!remap.has(i)) { remap.set(i, out.pos.length); out.pos.push(mesh.pos[i].clone()); out.nrm.push(mesh.nrm[i].clone()); out.uv.push(mesh.uv[i].clone()); out.sj.push(mesh.sj[i]); out.sw.push(mesh.sw[i]); out.src.push(mesh.src[i]); if (mesh.dp) (out.dp ??= []).push(mesh.dp[i].clone()); if (mesh.dn) (out.dn ??= []).push(mesh.dn[i].clone()); } return remap.get(i); };
  const cutV = (a, b) => {
    const key = a < b ? `${a}_${b}` : `${b}_${a}`;
    if (edge.has(key)) return edge.get(key);
    const t = f[a] / (f[a] - f[b]);
    const [j, w] = mixSkin(mesh.sj[a], mesh.sw[a], mesh.sj[b], mesh.sw[b], t);
    const id = out.pos.length;
    out.pos.push(mesh.pos[a].clone().lerp(mesh.pos[b], t)); out.nrm.push(mesh.nrm[a].clone().lerp(mesh.nrm[b], t).normalize());
    out.uv.push(mesh.uv[a].clone().lerp(mesh.uv[b], t)); out.sj.push(j); out.sw.push(w); out.src.push(-1); if (mesh.dp) (out.dp ??= []).push(mesh.dp[a].clone().lerp(mesh.dp[b], t)); if (mesh.dn) (out.dn ??= []).push(mesh.dn[a].clone().lerp(mesh.dn[b], t).normalize());
    edge.set(key, id); return id;
  };
  for (let t = 0; t < mesh.tris.length; t += 3) {
    const v = [mesh.tris[t], mesh.tris[t + 1], mesh.tris[t + 2]];
    const ins = v.map((i) => f[i] >= 0);
    if (!ins[0] && !ins[1] && !ins[2]) continue;
    if (ins[0] && ins[1] && ins[2]) { out.tris.push(keepV(v[0]), keepV(v[1]), keepV(v[2])); continue; }
    const poly = [];
    for (let k = 0; k < 3; k++) {
      const a = v[k], b = v[(k + 1) % 3];
      if (f[a] >= 0) poly.push(keepV(a));
      if ((f[a] >= 0) !== (f[b] >= 0)) poly.push(cutV(a, b));
    }
    for (let k = 1; k + 1 < poly.length; k++) out.tris.push(poly[0], poly[k], poly[k + 1]);
  }
  return out;
}
// Weld coincident vertices (UV seams) for topology work.
function weld(mesh) {
  const map = new Map(), id = new Int32Array(mesh.pos.length);
  mesh.pos.forEach((p, i) => { const k = `${Math.round(p.x * 1e4)},${Math.round(p.y * 1e4)},${Math.round(p.z * 1e4)}`; if (!map.has(k)) map.set(k, map.size); id[i] = map.get(k); });
  const W = map.size, nb = Array.from({ length: W }, () => new Set()), edgeCount = new Map();
  for (let t = 0; t < mesh.tris.length; t += 3) for (let a = 0; a < 3; a++) {
    const i = id[mesh.tris[t + a]], j = id[mesh.tris[t + (a + 1) % 3]];
    if (i !== j) { nb[i].add(j); nb[j].add(i); const k = i < j ? `${i}_${j}` : `${j}_${i}`; edgeCount.set(k, (edgeCount.get(k) || 0) + 1); }
  }
  const boundary = new Uint8Array(W);
  edgeCount.forEach((c, k) => { if (c === 1) { const [i, j] = k.split('_').map(Number); boundary[i] = boundary[j] = 1; } });
  return { id, W, nb, boundary, edgeCount };
}
function weldedNormals(mesh, w, P) {
  const n = Array.from({ length: w.W }, () => new THREE.Vector3());
  const a = new THREE.Vector3(), b = new THREE.Vector3();
  for (let t = 0; t < mesh.tris.length; t += 3) {
    const i0 = w.id[mesh.tris[t]], i1 = w.id[mesh.tris[t + 1]], i2 = w.id[mesh.tris[t + 2]];
    a.subVectors(P[i1], P[i0]); b.subVectors(P[i2], P[i0]);
    const c = a.clone().cross(b); n[i0].add(c); n[i1].add(c); n[i2].add(c);
  }
  return n.map((v) => v.normalize());
}

// The base bodies have underwear painted into the skin texture (flat untinted grey). Garments that
// should hide it measure it on the body they're cut from: top of the briefs, bottom and outer edge of the bra.
const uwCache = new WeakMap();
function underwear(skin, J) {
  if (uwCache.has(skin.geometry)) return uwCache.get(skin.geometry);
  const img = skin.material.map.image, cv = document.createElement('canvas'); cv.width = cv.height = 512;
  const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0, 512, 512); const px = cx.getImageData(0, 0, 512, 512).data;
  const pos = skin.geometry.attributes.position, uv = skin.geometry.attributes.uv;
  const mask = new Uint8Array(pos.count);
  const U = { mask, briefsTop: -Infinity, braBottom: Infinity, braOuterX: 0, hasBra: false };
  for (let i = 0; i < pos.count; i++) {
    const u = Math.min(511, Math.floor(uv.getX(i) * 512)), v = Math.min(511, Math.floor(uv.getY(i) * 512)), o = (v * 512 + u) * 4;
    const r = px[o], g = px[o + 1], b = px[o + 2];
    if (r + g + b > 260 || Math.max(r, g, b) - Math.min(r, g, b) > 12) continue;
    mask[i] = 1;
    const y = pos.getY(i);
    if (y < J.spine_02.y) U.briefsTop = Math.max(U.briefsTop, y);
    else { U.hasBra = true; U.braBottom = Math.min(U.braBottom, y); U.braOuterX = Math.max(U.braOuterX, Math.abs(pos.getX(i))); }
  }
  uwCache.set(skin.geometry, U);
  return U;
}

// Build one garment from this body's skin mesh.
// 1 -> 4 midpoint subdivision (carries skin weights, uvs and the displacement along).
function subdivide(mesh) {
  const out = { pos: mesh.pos.slice(), nrm: mesh.nrm.slice(), uv: mesh.uv.slice(), sj: mesh.sj.slice(), sw: mesh.sw.slice(), src: mesh.src.slice(), dp: mesh.dp.slice(), dn: mesh.dn.slice(), tris: [] };
  const mid = new Map();
  const m = (a, b) => {
    const k = a < b ? `${a}_${b}` : `${b}_${a}`;
    if (mid.has(k)) return mid.get(k);
    const [j, w] = mixSkin(mesh.sj[a], mesh.sw[a], mesh.sj[b], mesh.sw[b], 0.5), id = out.pos.length;
    out.pos.push(mesh.pos[a].clone().lerp(mesh.pos[b], 0.5)); out.nrm.push(mesh.nrm[a].clone().add(mesh.nrm[b]).normalize());
    out.uv.push(mesh.uv[a].clone().lerp(mesh.uv[b], 0.5)); out.sj.push(j); out.sw.push(w); out.src.push(-1);
    out.dp.push(mesh.dp[a].clone().lerp(mesh.dp[b], 0.5)); out.dn.push(mesh.dn[a].clone().add(mesh.dn[b]).normalize());
    mid.set(k, id); return id;
  };
  for (let t = 0; t < mesh.tris.length; t += 3) {
    const a = mesh.tris[t], b = mesh.tris[t + 1], c = mesh.tris[t + 2], ab = m(a, b), bc = m(b, c), ca = m(c, a);
    out.tris.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca);
  }
  return out;
}

// Shapes the cloth on a coarse, generously trimmed piece of skin (so the shaping never sees the real
// edges), then subdivides it twice and makes the exact cuts on that fine mesh, so necklines, armholes
// and hems are smooth curves rather than the outline of the body's large triangles.
function buildGarmentFine(spec, skinMesh, J) {
  const U = underwear(skinMesh, J);
  const fields = spec.keep(J, U);
  let c = meshFrom(skinMesh.geometry);
  for (const f of fields) c = clip(c, (p) => f(p) + 0.04);
  const w = weld(c);
  const P0 = Array.from({ length: w.W }, () => new THREE.Vector3()), cnt = new Float32Array(w.W);
  c.pos.forEach((p, i) => { P0[w.id[i]].add(p); cnt[w.id[i]]++; });
  P0.forEach((p, k) => p.multiplyScalar(1 / cnt[k]));
  const N0 = weldedNormals(c, w, P0);
  // Tops are worn over the waistband of any bottom: below the ribs they sit one layer further out.
  const armpit = (p) => {
    // a little more room in the armpit, where the body folds as the arm comes down
    if (!spec.armpitEase) return 0;
    const ax = J.upperarm.x - 0.035, ay = J.upperarm.y - 0.055;
    const d = Math.hypot(Math.abs(p.x) - ax, p.y - ay, (p.z - J.upperarm.z) * 0.7);
    return spec.armpitEase * Math.max(0, 1 - d / 0.09);
  };
  const layer = (p) => (spec.slot === 'top' ? 0.014 * smooth(J.spine_02.y, J.spine_01.y + 0.02, p.y) : 0) + armpit(p);
  const P = P0.map((p, k) => p.clone().addScaledVector(N0[k], spec.ease + layer(p)));
  // Bridge hollows (outward only): cleavage, between the glutes, the crotch, the line of the abs.
  // Muscle and bust shapes stay, so the cloth follows the body's sculpture.
  const iters = spec.fit === 'tight' ? 16 : 60;
  for (let it = 0; it < iters; it++) {
    const N = weldedNormals(c, w, P);
    const next = P.map((p, k) => {
      if (w.boundary[k] || !w.nb[k].size) return p;
      const avg = new THREE.Vector3(); w.nb[k].forEach((j) => avg.add(P[j])); avg.multiplyScalar(1 / w.nb[k].size);
      const push = avg.sub(p).dot(N[k]);
      return push > 0 ? p.clone().addScaledVector(N[k], push * 0.6) : p;
    });
    next.forEach((p, k) => P[k].copy(p));
  }
  if (spec.fit !== 'tight') softFlare(spec, P, P0, N0, c, w, J, skinMesh, fields);
  if (spec.strapHug) {
    // Straps sit on the shoulder like the tight singlet's; the loose fit starts below the armpit.
    // (sleeves: only where they meet the shoulder; further down the arm they keep their room)
    P.forEach((p, k) => {
      let t = smooth(J.upperarm.y - 0.09, J.upperarm.y - 0.03, P0[k].y);
      t *= 1 - smooth(J.upperarm.x + (spec.capFit ?? -0.01), J.upperarm.x + (spec.capFit ?? -0.01) + 0.06, Math.abs(P0[k].x));
      p.lerp(P0[k].clone().addScaledVector(N0[k], spec.strapHug), t);
    });
  }
  if (spec.smoothSkin) smoothSkinWeights(spec, c, w, skinMesh);
  if (spec.baggy) {
    // On near-vertical cloth (sides, back, under the bust) the shaping only needs to move it in and
    // out; uneven up/down drift there turns a straight hem into a sawtooth. Keep vertical movement
    // only where the surface faces up (tops of the shoulders), and anywhere well above the hem.
    let hem = Infinity; P0.forEach((p) => { if (fields.every((f) => f(p) >= 0)) hem = Math.min(hem, p.y); });
    P.forEach((p, k) => { const keepY = Math.max(smooth(0.35, 0.7, Math.abs(N0[k].y)), smooth(hem + (spec.hemDamp ?? 0.06), hem + (spec.hemDamp ?? 0.06) + 0.05, P0[k].y)); p.y = P0[k].y + (p.y - P0[k].y) * keepY; });
  }
  c.dp = c.pos.map((_, i) => P[w.id[i]].clone().sub(P0[w.id[i]]));
  const NS = weldedNormals(c, w, P);
  c.dn = c.pos.map((_, i) => NS[w.id[i]].clone());
  let m = subdivide(subdivide(c));
  for (const f of fields) m = clip(m, f);
  if (!m.tris.length) return null;
  const fw = weld(m);
  const FP0 = Array.from({ length: fw.W }, () => new THREE.Vector3()), FD = Array.from({ length: fw.W }, () => new THREE.Vector3()), fc = new Float32Array(fw.W);
  m.pos.forEach((p, i) => { FP0[fw.id[i]].add(p); FD[fw.id[i]].add(m.dp[i]); fc[fw.id[i]]++; });
  FP0.forEach((p, k) => p.multiplyScalar(1 / fc[k])); FD.forEach((d, k) => d.multiplyScalar(1 / fc[k]));
  const FN0 = weldedNormals(m, fw, FP0);
  const FP = FP0.map((p, k) => p.clone().add(FD[k]));
  const FN = Array.from({ length: fw.W }, () => new THREE.Vector3());
  m.pos.forEach((_, i) => FN[fw.id[i]].add(m.dn[i]));
  FN.forEach((n) => n.normalize());
  // Even out the cut line (Taubin steps: smooths kinks without shrinking the loop into the body).
  const bnb = FP.map((_, k) => (fw.boundary[k] ? [...fw.nb[k]].filter((j) => fw.boundary[j]) : []));
  for (let it = 0; it < 8; it++) {
    const f = it % 2 ? -0.53 : 0.5;
    const nx = FP.map((p, k) => (bnb[k].length === 2 ? p.clone().lerp(FP[bnb[k][0]].clone().add(FP[bnb[k][1]]).multiplyScalar(0.5), f) : p));
    nx.forEach((p, k) => FP[k].copy(p));
  }
  // Distance from each vertex to the nearest garment edge (along the surface), for the binding.
  const edgeD = new Float32Array(fw.W).fill(1);
  if (spec.trim) {
    const queue = [];
    for (let k = 0; k < fw.W; k++) if (fw.boundary[k]) { edgeD[k] = 0; queue.push(k); }
    for (let qi = 0; qi < queue.length; qi++) {
      const k = queue[qi];
      for (const j of fw.nb[k]) {
        const d = edgeD[k] + FP0[k].distanceTo(FP0[j]);
        if (d < edgeD[j] && d < spec.trim * 2) { edgeD[j] = d; queue.push(j); }
      }
    }
    // a slightly raised, rolled edge
    FP.forEach((p, k) => p.addScaledVector(FN[k], 0.0016 * smooth(spec.trim, spec.trim * 0.3, edgeD[k])));
  }
  m.edgeD = m.pos.map((_, i) => edgeD[fw.id[i]]);
  return emitGeometry(spec, m, fw, FP, FP0, FN0, FN);
}

// Cloth is rigged smoother than skin: weights are blended across the garment so neighbouring areas
// move together, and on sleeveless tops the arm bones' pull on the fabric is reduced, so the
// armhole and straps don't twist with the arm when it comes down.
function smoothSkinWeights(spec, c, w, skinMesh) {
  const names = skinMesh.skeleton.bones.map((b) => b.name);
  const W = Array.from({ length: w.W }, () => new Map());
  const seen = new Uint8Array(w.W);
  c.pos.forEach((_, i) => {
    const k = w.id[i]; if (seen[k]) return; seen[k] = 1;
    // torsoArmPull: on the body of the shirt (not the sleeves), how much the arm bones may pull
    let domArm = false, bw = -1; for (let q = 0; q < 4; q++) if (c.sw[i][q] > bw) { bw = c.sw[i][q]; domArm = /upperarm|lowerarm|hand/.test(names[c.sj[i][q]]); }
    for (let q = 0; q < 4; q++) {
      const j = c.sj[i][q], wt = c.sw[i][q]; if (wt <= 0) continue;
      const arm = /upperarm|lowerarm|hand/.test(names[j]);
      const pull = arm ? (spec.armPull ?? 1) * (!domArm && spec.torsoArmPull !== undefined ? spec.torsoArmPull : 1) : 1;
      W[k].set(j, (W[k].get(j) || 0) + wt * pull);
    }
  });
  for (let it = 0; it < spec.smoothSkin; it++) {
    const next = W.map((m, k) => {
      const out = new Map(); m.forEach((v, j) => out.set(j, v * 0.5));
      const n = w.nb[k].size; if (!n) return m;
      w.nb[k].forEach((o) => W[o].forEach((v, j) => out.set(j, (out.get(j) || 0) + (0.5 * v) / n)));
      return out;
    });
    next.forEach((m, k) => (W[k] = m));
  }
  c.pos.forEach((_, i) => {
    if (spec.sleeveRigid) {
      // sleeves keep the arm's own weights, so they follow the arm exactly (no bell flare)
      let bw = -1, armDom = false; for (let q = 0; q < 4; q++) if (c.sw[i][q] > bw) { bw = c.sw[i][q]; armDom = /upperarm|lowerarm|hand/.test(names[c.sj[i][q]]); }
      if (armDom) return;
    }
    const top = [...W[w.id[i]].entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
    const sum = top.reduce((a, e) => a + e[1], 0) || 1;
    while (top.length < 4) top.push([0, 0]);
    c.sj[i] = top.map((e) => e[0]); c.sw[i] = top.map((e) => e[1] / sum);
  });
}

// Loose pieces: a little extra room everywhere, and a gentle flare toward the hem and sleeve ends.
function softFlare(spec, P, P0, N0, c, w, J, skinMesh, fields) {
  const names = skinMesh.skeleton.bones.map((b) => b.name);
  const first = new Int32Array(w.W).fill(-1);
  c.pos.forEach((_, i) => { if (first[w.id[i]] < 0) first[w.id[i]] = i; });
  const dom = (k) => { const i = first[k], j = c.sj[i], wt = c.sw[i]; let b = 0; for (let q = 1; q < 4; q++) if (wt[q] > wt[b]) b = q; return names[j[b]]; };
  const lowest = (pred) => { let y = Infinity; P0.forEach((p, k) => { if (pred(k) && fields.every((f) => f(p) >= 0)) y = Math.min(y, p.y); }); return y; };
  const disp = P.map(() => new THREE.Vector3());
  let tentFront = null;
  if (spec.slot === 'top') {
    const isArm = (k) => /upperarm|lowerarm|hand/.test(dom(k));
    const hemY = lowest((k) => !isArm(k));
    if (spec.tent !== undefined || spec.baggy) { // tent 0 = straight drop
    tentFront = () => {
      if (spec.baggy) {
        // Baggy, step 2: the whole chest becomes one broad soft surface (relaxed, never closer to the skin
        // than the ease), so neither the bust nor the pecs read as separate shapes.
        const zone = []; P0.forEach((p, k) => { if (!isArm(k) && p.y < J.upperarm.y + 0.02 && p.y > hemY - 0.06 && !w.boundary[k]) zone.push(k); });
        for (let it = 0; it < spec.baggy; it++) {
          const nx = zone.map((k) => { const avg = new THREE.Vector3(); w.nb[k].forEach((j) => avg.add(P[j])); return P[k].clone().lerp(avg.multiplyScalar(1 / w.nb[k].size), 0.5); });
          zone.forEach((k, i) => { P[k].copy(nx[i]); const h = P[k].clone().sub(P0[k]).dot(N0[k]); if (h < spec.ease) P[k].addScaledVector(N0[k], spec.ease - h); });
        }
        // Baggy, then: at every height the cross-section of the torso becomes its convex outline:
        // the cloth spans straight between the outermost points (bust or pec to the side of the
        // body) instead of curving back around each one.
        const rowsAll = new Map();
        P0.forEach((p, k) => { if (isArm(k) || p.y > J.upperarm.y - 0.01 || p.y < hemY - 0.01) return; const r = Math.round(p.y / 0.008); if (!rowsAll.has(r)) rowsAll.set(r, []); rowsAll.get(r).push(k); });
        const hullOut = new Map();
        rowsAll.forEach((ks) => {
          if (ks.length < 6) return;
          const pts = ks.map((k) => [P[k].x, P[k].z]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
          const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
          const lo = [], hi = [];
          for (const q of pts) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
          for (let i = pts.length - 1; i >= 0; i--) { const q = pts[i]; while (hi.length >= 2 && cross(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
          const hull = lo.slice(0, -1).concat(hi.slice(0, -1));
          const cx = hull.reduce((a, q) => a + q[0], 0) / hull.length, cz = hull.reduce((a, q) => a + q[1], 0) / hull.length;
          for (const k of ks) {
            const dx = P[k].x - cx, dz = P[k].z - cz, r = Math.hypot(dx, dz); if (r < 1e-4) continue;
            const ux = dx / r, uz = dz / r;
            let best = r;
            for (let i = 0; i < hull.length; i++) {
              const a1 = hull[i], a2 = hull[(i + 1) % hull.length];
              const ex = a2[0] - a1[0], ez = a2[1] - a1[1], den = ux * ez - uz * ex;
              if (Math.abs(den) < 1e-9) continue;
              const t = ((a1[0] - cx) * ez - (a1[1] - cz) * ex) / den, u = ((a1[0] - cx) * uz - (a1[1] - cz) * ux) / den;
              if (t > 0 && u >= -1e-6 && u <= 1 + 1e-6) best = Math.max(best, t);
            }
            hullOut.set(k, [ux * (best - r), uz * (best - r)]);
          }
        });
        hullOut.forEach(([ox, oz], k) => { P[k].x += ox; P[k].z += oz; });
      }
      // Front drape. Across: on each horizontal line of the front, the cloth spans straight from high
      // point to high point (upper hull in x-z), so it never dips into the cleavage or between the pecs.
      // Down: below the fullest point it falls from it, z = max over everything above of
      // (its z - slope * drop). Only ever forward.
      const front = [];
      P0.forEach((p, k) => { if (!isArm(k) && p.z > J.spine_03.z + 0.01 && p.y < (spec.baggy ? J.neck.y : J.upperarm.y - 0.01) && p.y > hemY - 0.06) front.push(k); });
      const Z = new Map(front.map((k) => [k, P[k].z]));
      const rows = new Map();
      front.forEach((k) => { const r = Math.round(P0[k].y / 0.01); if (!rows.has(r)) rows.set(r, []); rows.get(r).push(k); });
      rows.forEach((ks) => {
        const pts = ks.map((k) => [P[k].x, Z.get(k)]).sort((a, b) => a[0] - b[0]);
        const hull = [];
        for (const q of pts) {
          while (hull.length >= 2) { const [a1, a2] = [hull[hull.length - 2], hull[hull.length - 1]]; if ((a2[0] - a1[0]) * (q[1] - a1[1]) - (a2[1] - a1[1]) * (q[0] - a1[0]) >= 0) hull.pop(); else break; }
          hull.push(q);
        }
        for (const k of ks) {
          const x = P[k].x; let i = 0; while (i < hull.length - 2 && hull[i + 1][0] < x) i++;
          const [a1, a2] = [hull[i], hull[Math.min(i + 1, hull.length - 1)]];
          const t = a2[0] === a1[0] ? 0 : (x - a1[0]) / (a2[0] - a1[0]);
          Z.set(k, Math.max(Z.get(k), a1[1] + (a2[1] - a1[1]) * t));
        }
      });
      if (spec.baggy) {
        // Baggy fall: all around the front and sides, the cloth falls from the fullest point above it
        // (radially, per direction around the torso), fading out only toward the back.
        const cz = J.spine_03.z, BINS = 64, Rm = new Float32Array(BINS).fill(-1), yLast = new Float32Array(BINS), apR = new Float32Array(BINS), apY = new Float32Array(BINS);
        const ring = []; P0.forEach((p, k) => { if (!isArm(k) && p.y < J.upperarm.y - 0.04 && p.y > hemY - 0.06) ring.push(k); });
        ring.sort((a, b) => P0[b].y - P0[a].y);
        for (const k of ring) {
          const dx = P[k].x, dz = P[k].z - cz, r = Math.hypot(dx, dz); if (r < 1e-4) continue;
          const ang = Math.atan2(dx, dz), b = ((Math.floor(((ang + Math.PI) / (2 * Math.PI)) * BINS) % BINS) + BINS) % BINS;
          if (Rm[b] < 0) { Rm[b] = r; yLast[b] = P0[k].y; apR[b] = r; apY[b] = P0[k].y; continue; }
          if (spec.fallCurve && Math.cos(ang) > 0) {
            // front: hang from the fullest point, then curve back in toward the body (no shelf)
            const dropA = apY[b] - P0[k].y, cand = apR[b] - spec.fallCurve.a * dropA - spec.fallCurve.b * dropA * dropA;
            if (r >= cand) { apR[b] = r; apY[b] = P0[k].y; }
            const grow = (Math.max(r, cand) - r) * smooth(-0.6, -0.15, Math.cos(ang));
            if (grow > 0) { P[k].x += (dx / r) * grow; P[k].z += (dz / r) * grow; }
            yLast[b] = P0[k].y; continue;
          }
          // front falls from the bust; the sides hang from the armpit with a slight inward taper,
          // like a side seam, which is what hides the outer curve of the bust or pecs
          const side = Math.abs(Math.sin(ang)), slope = lerp(spec.tent, spec.sideTaper ?? 0.12, side * side);
          Rm[b] = Math.max(r, Rm[b] - slope * (yLast[b] - P0[k].y)); yLast[b] = P0[k].y;
          const wgt = smooth(-0.6, -0.15, Math.cos(ang)); // everywhere but the back
          const grow = (Rm[b] - r) * wgt;
          if (grow > 0) { P[k].x += (dx / r) * grow; P[k].z += (dz / r) * grow; }
        }
      }
      const strips = new Map();
      front.forEach((k) => { const b = Math.round(P0[k].x / 0.012); if (!strips.has(b)) strips.set(b, []); strips.get(b).push(k); });
      strips.forEach((ks) => {
        ks.sort((a, b) => P0[b].y - P0[a].y);
        if (spec.baggy) {
          // Down the front: from the upper chest the cloth runs straight to the fullest point
          // (upper hull of the strip's side profile), so the top curve of the bust doesn't show.
          const pts = ks.map((k) => [P0[k].y, Z.get(k)]);
          const hull = [];
          for (const q of pts) {
            while (hull.length >= 2) { const [a1, a2] = [hull[hull.length - 2], hull[hull.length - 1]]; if ((a2[0] - a1[0]) * (q[1] - a1[1]) - (a2[1] - a1[1]) * (q[0] - a1[0]) <= 0) hull.pop(); else break; }
            hull.push(q);
          }
          for (const k of ks) {
            const y = P0[k].y; let i = 0; while (i < hull.length - 2 && hull[i + 1][0] > y) i++;
            const [a1, a2] = [hull[i], hull[Math.min(i + 1, hull.length - 1)]];
            const t = a2[0] === a1[0] ? 0 : (y - a1[0]) / (a2[0] - a1[0]);
            Z.set(k, Math.max(Z.get(k), a1[1] + (a2[1] - a1[1]) * t));
          }
        }
        let best = -Infinity, yPrev = null, apZ = -Infinity, apYs = 0;
        for (const k of ks) {
          if (spec.fallCurve) {
            const drop = apYs - P0[k].y, cand = apZ - spec.fallCurve.a * drop - spec.fallCurve.b * drop * drop;
            if (Z.get(k) >= cand) { apZ = Z.get(k); apYs = P0[k].y; } else Z.set(k, cand);
            continue;
          }
          if (yPrev !== null) best -= spec.tent * (yPrev - P0[k].y);
          yPrev = P0[k].y;
          best = Math.max(best, Z.get(k)); Z.set(k, best);
        }
      });
      // full drape across the front, fading out toward the sides so there is no fold where it ends
      front.forEach((k) => { const wgt = smooth(J.spine_03.z + 0.01, J.spine_03.z + 0.06, P0[k].z); P[k].z = Math.max(P[k].z, P[k].z + wgt * (Z.get(k) - P[k].z)); });
    };
    }
    const cz = lerp(J.spine_02.z, J.spine_03.z, 0.5);
    P0.forEach((p, k) => {
      if (isArm(k)) {
        const x0 = J.upperarm.x, dy = p.y - J.upperarm.y, dz = p.z - J.upperarm.z, r = Math.hypot(dy, dz) || 1;
        const t = smooth(x0 - 0.02, x0 + 0.12, Math.abs(p.x)) * (spec.sleeveFlare || 0);
        disp[k].set(0, (dy / r) * t, (dz / r) * t);
      } else {
        const dx = p.x, dz = p.z - cz, r = Math.hypot(dx, dz) || 1, t = smooth(hemY + 0.18, hemY, p.y) * spec.flare;
        disp[k].set((dx / r) * t, 0, (dz / r) * t);
      }
    });
  } else {
    let crotchY = Infinity; P0.forEach((p) => { if (Math.abs(p.x) < 0.015 && p.y > J.calf.y && p.y < J.pelvis.y) crotchY = Math.min(crotchY, p.y); });
    const hemY = lowest((k) => P0[k].y < crotchY);
    P0.forEach((p, k) => {
      if (p.y > crotchY) return;
      const cx = Math.sign(p.x) * J.thigh.x, cz = lerp(J.calf.z, J.thigh.z, 0.5);
      const dx = p.x - cx, dz = p.z - cz, r = Math.hypot(dx, dz) || 1, t = smooth(crotchY - 0.03, hemY, p.y) * spec.flare;
      disp[k].set((dx / r) * t, 0, (dz / r) * t);
    });
  }
  for (let it = 0; it < 8; it++) {
    const nx = disp.map((d, k) => { if (!w.nb[k].size) return d; const avg = new THREE.Vector3(); w.nb[k].forEach((j) => avg.add(disp[j])); return d.clone().multiplyScalar(0.5).addScaledVector(avg, 0.5 / w.nb[k].size); });
    nx.forEach((d, k) => disp[k].copy(d));
  }
  P.forEach((p, k) => p.add(disp[k]));
  if (tentFront) {
    // the drape is worked out in strips and rows; blend it across the surface so neighbouring
    // strips (and the hem) stay continuous
    const before = P.map((p) => p.clone());
    tentFront();
    const D = P.map((p, k) => p.clone().sub(before[k]));
    // a few passes only, and never less than what the drape asked for (so it can't sink back in)
    const D0 = D.map((d) => d.clone());
    for (let it = 0; it < 3; it++) {
      const nx = D.map((d, k) => { if (!w.nb[k].size) return d; const avg = new THREE.Vector3(); w.nb[k].forEach((j) => avg.add(D[j])); return d.clone().multiplyScalar(0.5).addScaledVector(avg, 0.5 / w.nb[k].size); });
      nx.forEach((d, k) => D[k].copy(d.lengthSq() >= D0[k].lengthSq() ? d : D0[k]));
    }
    if (spec.dBlend) {
      // even out the row-by-row drape along the body (removes horizontal ridges on muscular builds)
      for (let it = 0; it < spec.dBlend; it++) {
        const nx = D.map((d, k) => { if (!w.nb[k].size) return d; const avg = new THREE.Vector3(); w.nb[k].forEach((j) => avg.add(D[j])); return d.clone().multiplyScalar(0.5).addScaledVector(avg, 0.5 / w.nb[k].size); });
        nx.forEach((d, k) => D[k].copy(d));
      }
    }
    if (spec.round) {
      // Round off the drape: the flat front and the corners where it turns to the sides are what made
      // it look boxy. Blend the drape across the cloth freely, keeping at least `round` of it everywhere.
      const D1 = D.map((d) => d.clone());
      for (let it = 0; it < 30; it++) {
        const nx = D.map((d, k) => { if (!w.nb[k].size) return d; const avg = new THREE.Vector3(); w.nb[k].forEach((j) => avg.add(D[j])); return d.clone().multiplyScalar(0.5).addScaledVector(avg, 0.5 / w.nb[k].size); });
        nx.forEach((d, k) => { const floor = spec.round * D1[k].length(); D[k].copy(d.length() >= floor ? d : (d.length() > 1e-6 ? d.setLength(floor) : D1[k].clone().multiplyScalar(spec.round))); });
      }
    }
    P.forEach((p, k) => p.copy(before[k]).add(D[k]));
  }
  if (spec.folds && spec.slot === 'top') {
    // Soft vertical folds: baggy cloth falls from the chest in gentle folds that deepen toward the
    // hem, instead of one smooth shell. Only ever outward (each fold is a bump between valleys).
    const names = skinMesh.skeleton.bones.map((b) => b.name);
    const firstC = new Int32Array(w.W).fill(-1); c.pos.forEach((_, i) => { if (firstC[w.id[i]] < 0) firstC[w.id[i]] = i; });
    const armV = (k) => { const i = firstC[k], j = c.sj[i], wt = c.sw[i]; let b = 0; for (let q = 1; q < 4; q++) if (wt[q] > wt[b]) b = q; return /upperarm|lowerarm|hand/.test(names[j[b]]); };
    let hem = Infinity; P0.forEach((p, k) => { if (!armV(k) && fields.every((f) => f(p) >= 0)) hem = Math.min(hem, p.y); });
    const top = J.upperarm.y - 0.09, cz = lerp(J.spine_02.z, J.spine_03.z, 0.5);
    const phase = [0.7, 2.1, 4.0];
    P.forEach((p, k) => {
      if (armV(k) || P0[k].y > top) return;
      const a = Math.atan2(p.x, p.z - cz), r = Math.hypot(p.x, p.z - cz); if (r < 1e-4) return;
      let f = 0; spec.folds.n.forEach((n, i) => { f += (0.5 - 0.5 * Math.cos(n * a + phase[i])) / (i + 1); });
      f /= spec.folds.n.reduce((acc, _, i) => acc + 1 / (i + 1), 0);
      const amp = spec.folds.amp * smooth(top, hem + 0.01, P0[k].y);
      p.x += (p.x / r) * amp * f; p.z += ((p.z - cz) / r) * amp * f;
    });
  }
  for (let it = 0; it < 16; it++) {
    const f = it % 2 ? -0.53 : 0.5;
    const nx = P.map((p, k) => { if (w.boundary[k] || w.nb[k].size < 2) return p; const avg = new THREE.Vector3(); w.nb[k].forEach((j) => avg.add(P[j])); return p.clone().lerp(avg.multiplyScalar(1 / w.nb[k].size), f); });
    nx.forEach((p, k) => P[k].copy(p));
    P.forEach((p, k) => { const e = spec.ease + (spec.slot === 'top' ? 0.014 * smooth(J.spine_02.y, J.spine_01.y + 0.02, P0[k].y) : 0); const h = p.clone().sub(P0[k]).dot(N0[k]); if (h < e) p.addScaledVector(N0[k], e - h); });
  }
}

// Trainers, built as their own shape around each foot (not from the toes). At each height the
// cross-section is the convex outline of all of the foot above that height, plus a little room: full
// footprint at the sole, sloping over the toes up to the ankle collar. A sole goes underneath.
// Each shoe point takes its skin weights from the nearest point of the foot, so it moves with it.
function buildShoe(spec, skinMesh, J) {
  const g = skinMesh.geometry, pa = g.attributes.position, sj = g.attributes.skinIndex, sw = g.attributes.skinWeight;
  const top = J.foot.y + spec.collar, M = 56, H = [0, 0.004, 0.009, 0.016, 0.024, 0.033, 0.043, 0.054, 0.066, 0.078, 0.09, 0.105, 0.12, 0.14];
  const hull2 = (pts) => {
    pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], hi = [];
    for (const q of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (let i = pts.length - 1; i >= 0; i--) { const q = pts[i]; while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
    return lo.slice(0, -1).concat(hi.slice(0, -1));
  };
  // radius of a convex hull along a direction from c
  const rayR = (hull, c, a) => {
    const ux = Math.sin(a), uz = Math.cos(a); let best = 0;
    for (let i = 0; i < hull.length; i++) {
      const a1 = hull[i], a2 = hull[(i + 1) % hull.length], ex = a2[0] - a1[0], ez = a2[1] - a1[1], den = ux * ez - uz * ex;
      if (Math.abs(den) < 1e-12) continue;
      const t = ((a1[0] - c[0]) * ez - (a1[1] - c[1]) * ex) / den, u = ((a1[0] - c[0]) * uz - (a1[1] - c[1]) * ux) / den;
      if (t > 0 && u >= -1e-6 && u <= 1 + 1e-6) best = Math.max(best, t);
    }
    return best;
  };
  const out = { pos: [], sj: [], sw: [], tris: [] };
  for (const side of [1, -1]) {
    const idx = []; for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), y = pa.getY(i); if (Math.sign(x) === side && y <= top && y < J.calf.y - 0.1) idx.push(i); }
    const P = idx.map((i) => [pa.getX(i), pa.getY(i), pa.getZ(i)]);
    const heights = H.map((h) => h * (top / 0.14));
    const foot = hull2(P.map((p) => [p[0], p[2]]));
    const fc = [foot.reduce((a, q) => a + q[0], 0) / foot.length, foot.reduce((a, q) => a + q[1], 0) / foot.length];
    const rings = [];
    // sole: outsole ring below the foot, widened; then the upper, slice by slice
    const sole = (dy, grow) => { const r = []; for (let m = 0; m < M; m++) { const a = (m / M) * 2 * Math.PI, R = rayR(foot, fc, a) + spec.ease + grow; r.push([fc[0] + Math.sin(a) * R, dy, fc[1] + Math.cos(a) * R]); } return r; };
    rings.push(sole(-0.014, 0.006), sole(-0.004, 0.009), sole(0.012, 0.008));
    for (let hi = 2; hi < heights.length; hi++) {
      const h = heights[hi], above = P.filter((p) => p[1] >= h - 0.003);
      if (above.length < 4) break;
      const hull = hull2(above.map((p) => [p[0], p[2]]));
      const c = [hull.reduce((a, q) => a + q[0], 0) / hull.length, hull.reduce((a, q) => a + q[1], 0) / hull.length];
      const r = []; for (let m = 0; m < M; m++) { const a = (m / M) * 2 * Math.PI, R = rayR(hull, c, a) + spec.ease + 0.004 * (1 - hi / heights.length); r.push([c[0] + Math.sin(a) * R, h, c[1] + Math.cos(a) * R]); }
      rings.push(r);
    }
    // collar: roll the top edge in a little
    const last = rings[rings.length - 1], lc = [last.reduce((a, q) => a + q[0], 0) / M, last.reduce((a, q) => a + q[2], 0) / M];
    rings.push(last.map((q) => [lc[0] + (q[0] - lc[0]) * 0.9, q[1] + 0.004, lc[1] + (q[2] - lc[1]) * 0.9]));
    // smooth each ring and between rings a little (rounder toe, no facets)
    for (let it = 0; it < 3; it++) rings.forEach((r) => { const c = r.map((q, m) => { const a = r[(m + M - 1) % M], b = r[(m + 1) % M]; return [(a[0] + 2 * q[0] + b[0]) / 4, q[1], (a[2] + 2 * q[2] + b[2]) / 4]; }); c.forEach((q, m) => (r[m] = q)); });
    const base = out.pos.length;
    rings.forEach((r) => r.forEach((q) => out.pos.push(new THREE.Vector3(...q))));
    for (let ri = 0; ri + 1 < rings.length; ri++) for (let m = 0; m < M; m++) {
      const a = base + ri * M + m, b = base + ri * M + ((m + 1) % M), c2 = a + M, d = b + M;
      out.tris.push(a, b, d, a, d, c2);
    }
    // bottom cap
    const cIdx = out.pos.length; out.pos.push(new THREE.Vector3(fc[0], -0.014, fc[1]));
    for (let m = 0; m < M; m++) out.tris.push(cIdx, base + ((m + 1) % M), base + m);
    // weights from the nearest foot point
    const n0 = out.sj.length;
    for (let i = n0; i < out.pos.length; i++) {
      const p = out.pos[i]; let best = 0, bd = Infinity;
      idx.forEach((vi, t) => { const d = (P[t][0] - p.x) ** 2 + (Math.max(P[t][1], 0.0) - Math.max(p.y, 0)) ** 2 + (P[t][2] - p.z) ** 2; if (d < bd) { bd = d; best = vi; } });
      out.sj.push([0, 1, 2, 3].map((k) => sj.getComponent(best, k))); out.sw.push([0, 1, 2, 3].map((k) => sw.getComponent(best, k)));
    }
  }
  const geo = new THREE.BufferGeometry();
  const flat = out.pos.flatMap((v) => [v.x, v.y, v.z]);
  geo.setAttribute('position', new THREE.Float32BufferAttribute(flat, 3));
  geo.setAttribute('restPos', new THREE.Float32BufferAttribute(flat, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Array(out.pos.length * 2).fill(0), 2));
  geo.setAttribute('edgeD', new THREE.Float32BufferAttribute(new Array(out.pos.length).fill(1), 1));
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(out.sj.flat(), 4));
  geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(out.sw.flat(), 4));
  geo.setIndex(out.tris);
  geo.computeVertexNormals();
  return geo;
}

function buildGarment(spec, skinMesh, J) {
  if (spec.shoe) return buildShoe(spec, skinMesh, J);
  if (spec.fine) return buildGarmentFine(spec, skinMesh, J);
  let m = meshFrom(skinMesh.geometry);
  const U = underwear(skinMesh, J);
  for (const field of spec.keep(J, U)) m = clip(m, field);
  if (!m.tris.length) return null;
  const w = weld(m);
  // welded rest positions
  const P0 = Array.from({ length: w.W }, () => new THREE.Vector3()), cnt = new Float32Array(w.W);
  m.pos.forEach((p, i) => { P0[w.id[i]].add(p); cnt[w.id[i]]++; });
  P0.forEach((p, k) => p.multiplyScalar(1 / cnt[k]));
  const N0 = weldedNormals(m, w, P0);
  const P = P0.map((p, k) => p.clone().addScaledVector(N0[k], spec.ease));

  // Stretch fabric bridges hollows (cleavage, small of the back, between the glutes): smooth that
  // only ever moves the surface outward, never into the body.
  const bridge = spec.fit === 'tight' ? 14 : spec.fit === 'drape' ? 260 : 70;
  for (let it = 0; it < bridge; it++) {
    const N = weldedNormals(m, w, P);
    const next = P.map((p, k) => {
      if (w.boundary[k] || !w.nb[k].size) return p;
      const avg = new THREE.Vector3(); w.nb[k].forEach((j) => avg.add(P[j])); avg.multiplyScalar(1 / w.nb[k].size);
      const push = avg.sub(p).dot(N[k]);
      return push > 0 ? p.clone().addScaledVector(N[k], push * 0.6) : p;
    });
    next.forEach((p, k) => P[k].copy(p));
  }

  if (spec.fit === 'loose') {
    // Loose fabric doesn't follow muscle: relax the surface hard (edges relax along themselves),
    // then never let it sit closer to the skin than the ease, measured along the skin's normal.
    const S = P.map((p) => p.clone());
    const bnb = S.map((_, k) => (w.boundary[k] ? [...w.nb[k]].filter((j) => w.boundary[j]) : null));
    for (let it = 0; it < 45; it++) {
      const nx = S.map((p, k) => {
        const nbs = bnb[k] ?? [...w.nb[k]];
        if (nbs.length < 2) return p;
        const avg = new THREE.Vector3(); nbs.forEach((j) => avg.add(S[j]));
        return p.clone().lerp(avg.multiplyScalar(1 / nbs.length), 0.6);
      });
      nx.forEach((p, k) => S[k].copy(p));
      S.forEach((p, k) => { const h = p.clone().sub(P0[k]).dot(N0[k]); if (h < spec.ease) p.addScaledVector(N0[k], spec.ease - h); });
    }
    S.forEach((p, k) => P[k].copy(p));
    looseShape(spec, P, P0, w, J);
    // Final drape: Taubin smoothing (alternating shrink/inflate steps, so the hang keeps its size)
    // removes ripples left by the hang, still never closer to the skin than the ease.
    for (let it = 0; it < 60; it++) {
      const f = it % 2 ? -0.53 : 0.5;
      const nx = P.map((p, k) => {
        const nbs = bnb[k] ?? [...w.nb[k]];
        if (nbs.length < 2) return p;
        const avg = new THREE.Vector3(); nbs.forEach((j) => avg.add(P[j]));
        return p.clone().lerp(avg.multiplyScalar(1 / nbs.length), f);
      });
      nx.forEach((p, k) => P[k].copy(p));
      P.forEach((p, k) => { const h = p.clone().sub(P0[k]).dot(N0[k]); if (h < spec.ease) p.addScaledVector(N0[k], spec.ease - h); });
    }
  }

  if (spec.fit === 'drape') drapeShape(spec, P, P0, N0, m, w, J, skinMesh);

  // Garment edges (neckline, armholes, hems) follow a smooth line instead of the body's triangles.
  if (spec.edges || spec.fit === 'drape') {
    const bnb = P.map((_, k) => (w.boundary[k] ? [...w.nb[k]].filter((j) => w.boundary[j]) : []));
    for (let it = 0; it < 14; it++) {
      const nx = P.map((p, k) => (bnb[k].length === 2 ? p.clone().lerp(P[bnb[k][0]].clone().add(P[bnb[k][1]]).multiplyScalar(0.5), 0.5) : p));
      nx.forEach((p, k) => P[k].copy(p));
    }
  }

  return emitGeometry(spec, m, w, P, P0, N0);
}

function emitGeometry(spec, m, w, P, P0, N0, shadeN = null) {
  // Hem: tight pieces tuck to the skin (closes the edge); loose pieces get a fabric-thickness rim.
  const N = shadeN ?? weldedNormals(m, w, P);
  // expand back to per-corner vertices
  const outPos = m.pos.map((_, i) => P[w.id[i]].clone());
  const outNrm = m.pos.map((_, i) => N[w.id[i]].clone());
  const extra = { pos: [], nrm: [], uv: [], sj: [], sw: [], tris: [] };
  const base = outPos.length;
  const rimDepth = spec.fit === 'tight' ? null : spec.fine ? 0.004 : 0.006;
  const done = new Set();
  for (let t = 0; t < m.tris.length; t += 3) for (let a = 0; a < 3; a++) {
    const va = m.tris[t + a], vb = m.tris[t + (a + 1) % 3];
    const ia = w.id[va], ib = w.id[vb];
    const key = ia < ib ? `${ia}_${ib}` : `${ib}_${ia}`;
    if (w.edgeCount.get(key) !== 1 || done.has(key)) continue;
    done.add(key);
    const inner = (v, k) => rimDepth === null ? P0[k].clone().addScaledVector(N0[k], -0.0015) : P[k].clone().addScaledVector(N[k], -rimDepth);
    const q = [va, vb].map((v, s) => {
      const k = s ? ib : ia, id = base + extra.pos.length;
      extra.pos.push(inner(v, k)); extra.nrm.push(N[k].clone()); extra.uv.push(m.uv[v].clone()); extra.sj.push(m.sj[v]); extra.sw.push(m.sw[v]);
      return id;
    });
    // winding: edge va->vb belongs to a front-facing triangle; the strip folds under it
    extra.tris.push(va, q[0], vb, vb, q[0], q[1]);
  }
  const allPos = outPos.concat(extra.pos), allNrm = outNrm.concat(extra.nrm), allUv = m.uv.concat(extra.uv);
  const allSj = m.sj.concat(extra.sj), allSw = m.sw.concat(extra.sw), tris = m.tris.concat(extra.tris);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(allPos.flatMap((v) => [v.x, v.y, v.z]), 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(allNrm.flatMap((v) => [v.x, v.y, v.z]), 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(allUv.flatMap((v) => [v.x, v.y]), 2));
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(allSj.flat(), 4));
  geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(allSw.flat(), 4));
  // Bind-pose coordinates for the fabric shader (bands, stripes): y, and the outward side of each leg.
  const rest = m.pos.concat(extra.pos.map((_, i) => extra.pos[i]));
  geo.setAttribute('restPos', new THREE.Float32BufferAttribute(m.pos.map((p) => [p.x, p.y, p.z]).flat().concat(extra.pos.flatMap((v) => [v.x, v.y, v.z])), 3));
  geo.setAttribute('edgeD', new THREE.Float32BufferAttribute(m.edgeD ? m.edgeD.concat(extra.pos.map(() => 0)) : new Array(allPos.length).fill(1), 1));
  geo.setIndex(tris);
  void rest;
  geo.userData.src = m.src;
  return geo;
}

// Drape (loose pieces): after the outward-only bridging has closed every crease, the cloth falls
// from the widest section of each part (chest for tops, top of the thigh for shorts) as a gently
// tapering tube, and sleeves hang as a slightly flared tube from the shoulder. Everything only ever
// moves outward, so the body can never poke through.
function drapeShape(spec, P, P0, N0, m, w, J, skinMesh) {
  const names = skinMesh.skeleton.bones.map((b) => b.name);
  const firstCorner = new Int32Array(w.W).fill(-1);
  m.pos.forEach((_, i) => { if (firstCorner[w.id[i]] < 0) firstCorner[w.id[i]] = i; });
  const domBone = (k) => { const i = firstCorner[k], j = m.sj[i], wt = m.sw[i]; let b = 0; for (let q = 1; q < 4; q++) if (wt[q] > wt[b]) b = q; return names[j[b]]; };
  const isTop = spec.slot === 'top';
  let crotchY = -1;
  if (!isTop) { crotchY = Infinity; P0.forEach((p) => { if (Math.abs(p.x) < 0.015 && p.y > J.calf.y && p.y < J.pelvis.y) crotchY = Math.min(crotchY, p.y); }); }
  const group = P0.map((p, k) => {
    if (isTop) return /upperarm|lowerarm|hand/.test(domBone(k)) ? (p.x > 0 ? 'armL' : 'armR') : 'torso';
    return p.y > crotchY ? 'hip' : p.x > 0 ? 'legL' : 'legR';
  });
  const disp = P.map(() => new THREE.Vector3());
  const BINS = 48;
  const binOf = (a) => ((Math.floor(((a + Math.PI) / (2 * Math.PI)) * BINS) % BINS) + BINS) % BINS;
  const hang = (g, refY) => {
    const idx = P.map((_, k) => k).filter((k) => group[k] === g);
    const ring = idx.filter((k) => Math.abs(P0[k].y - refY) < 0.01);
    if (ring.length < 8) return;
    const c = new THREE.Vector2(); ring.forEach((k) => c.add(new THREE.Vector2(P[k].x, P[k].z))); c.multiplyScalar(1 / ring.length);
    const R = new Float32Array(BINS);
    ring.forEach((k) => { const dx = P[k].x - c.x, dz = P[k].z - c.y, b = binOf(Math.atan2(dz, dx)); R[b] = Math.max(R[b], Math.hypot(dx, dz)); });
    for (let b = 0; b < BINS; b++) if (!R[b]) { let l = b, r = b; while (!R[(l + BINS) % BINS] && l > b - BINS) l--; while (!R[r % BINS] && r < b + BINS) r++; R[b] = Math.max(R[(l + BINS) % BINS], R[r % BINS]); }
    for (let it = 0; it < 2; it++) { const c2 = R.slice(); for (let b = 0; b < BINS; b++) R[b] = Math.max(c2[b], (c2[(b + BINS - 1) % BINS] + 2 * c2[b] + c2[(b + 1) % BINS]) / 4); }
    for (const k of idx) {
      const p = P[k]; if (p.y > refY) continue;
      const dx = p.x - c.x, dz = p.z - c.y, r = Math.hypot(dx, dz); if (r < 1e-4) continue;
      const drop = refY - p.y;
      const target = R[binOf(Math.atan2(dz, dx))] * (1 - spec.taper * drop) + spec.flare * smooth(0, 0.12, drop);
      if (target > r) disp[k].set((dx / r) * (target - r), 0, (dz / r) * (target - r));
    }
  };
  if (isTop) {
    // the chest: the widest slice between the bottom of the ribs and the armpit
    let best = -1, refY = J.spine_03.y;
    for (let y = J.spine_02.y; y < J.upperarm.y - 0.03; y += 0.005) {
      const ring = P.filter((p, k) => group[k] === 'torso' && Math.abs(P0[k].y - y) < 0.006);
      if (ring.length < 8) continue;
      let xs = 0, zs = 0; ring.forEach((p) => { xs = Math.max(xs, Math.abs(p.x)); });
      const zMin = Math.min(...ring.map((p) => p.z)), zMax = Math.max(...ring.map((p) => p.z)); zs = zMax - zMin;
      if (xs * 2 + zs > best) { best = xs * 2 + zs; refY = y; }
    }
    hang('torso', refY);
    for (const g of ['armL', 'armR']) {
      const idx = P.map((_, k) => k).filter((k) => group[k] === g);
      if (!idx.length) continue;
      const sx = g === 'armL' ? 1 : -1, cy = J.upperarm.y, cz = J.upperarm.z;
      const xs = idx.map((k) => Math.abs(P0[k].x)), x0 = Math.min(...xs), x1 = Math.max(...xs);
      let ref = 0; idx.forEach((k) => { if (Math.abs(P0[k].x) < x0 + 0.03) ref = Math.max(ref, Math.hypot(P[k].y - cy, P[k].z - cz)); });
      for (const k of idx) {
        const p = P[k], dy = p.y - cy, dz = p.z - cz, r = Math.hypot(dy, dz); if (r < 1e-4) continue;
        const t = (Math.abs(p.x) - x0) / Math.max(0.01, x1 - x0);
        const target = ref * (1 + (spec.sleeveFlare || 0) * t);
        if (target > r) disp[k].set(0, (dy / r) * (target - r), (dz / r) * (target - r));
        void sx;
      }
    }
  } else {
    hang('legL', crotchY - 0.02); hang('legR', crotchY - 0.02);
  }
  for (let it = 0; it < 10; it++) {
    const nx = disp.map((d, k) => { if (!w.nb[k].size) return d; const avg = new THREE.Vector3(); w.nb[k].forEach((j) => avg.add(disp[j])); return d.clone().multiplyScalar(0.5).addScaledVector(avg, 0.5 / w.nb[k].size); });
    nx.forEach((d, k) => disp[k].copy(d));
  }
  P.forEach((p, k) => p.add(disp[k]));
  // light Taubin smoothing for an even surface, never closer to the skin than the ease
  for (let it = 0; it < 24; it++) {
    const f = it % 2 ? -0.53 : 0.5;
    const nx = P.map((p, k) => { if (w.boundary[k] || w.nb[k].size < 2) return p; const avg = new THREE.Vector3(); w.nb[k].forEach((j) => avg.add(P[j])); return p.clone().lerp(avg.multiplyScalar(1 / w.nb[k].size), f); });
    nx.forEach((p, k) => P[k].copy(p));
    P.forEach((p, k) => { const h = p.clone().sub(P0[k]).dot(N0[k]); if (h < spec.ease) p.addScaledVector(N0[k], spec.ease - h); });
  }
}

// Loose fit: around a limb or the torso, the fabric hangs at the widest radius of the section above,
// so it falls straight from the hips/chest instead of following every curve underneath.
function looseShape(spec, P, P0, w, J) {
  const disp = P.map(() => new THREE.Vector3());
  const isBottom = spec.slot === 'bottom';
  // which axis each vertex hangs around
  const axisOf = (p) => {
    if (isBottom) {
      if (p.y > J.thigh.y - 0.02) return null; // hips/seat: no hang, just ease
      const side = Math.sign(p.x) || 1;
      return { kind: 'leg', side, c: new THREE.Vector2(side * J.thigh.x, lerp(J.calf.z, J.thigh.z, 0.5)) };
    }
    if (Math.abs(p.x) > J.upperarm.x - 0.01) return { kind: 'arm', side: Math.sign(p.x) };
    return { kind: 'torso', c: new THREE.Vector2(0, lerp(J.spine_02.z, J.spine_03.z, 0.5)) };
  };
  const ax = P0.map(axisOf);
  if (isBottom) {
    // per leg: radius profile r(y) = max radius at or above y (fabric hangs), per angle bin
    for (const side of [-1, 1]) {
      const idx = P.map((_, k) => k).filter((k) => ax[k]?.kind === 'leg' && ax[k].side === side);
      const bins = 24, rMax = new Float32Array(bins).fill(0);
      const ang = (p, c) => Math.atan2(p.z - c.y, p.x - c.x);
      idx.sort((a, b) => P[b].y - P[a].y);
      const c = new THREE.Vector2(side * J.thigh.x, lerp(J.calf.z, J.thigh.z, 0.5));
      for (const k of idx) {
        const p = P[k], a = ang(p, c), b = Math.floor(((a + Math.PI) / (2 * Math.PI)) * bins) % bins;
        const r = Math.hypot(p.x - c.x, p.z - c.y);
        // taper: the hang radius may shrink slowly going down (fabric drapes inward a little)
        rMax[b] = Math.max(r, rMax[b] * 0.997);
        let target = rMax[b] + spec.bag * smooth(J.thigh.y - 0.02, J.thigh.y - 0.12, p.y);
        if (spec.cuff) target = lerp(target, r + 0.006, smooth(J.foot.y + 0.075 + spec.cuff, J.foot.y + 0.075 + 0.01, p.y));
        const dir = new THREE.Vector2(p.x - c.x, p.z - c.y).normalize();
        const grow = Math.max(0, target - r);
        disp[k].set(dir.x * grow, 0, dir.y * grow);
      }
    }
  } else {
    const c = new THREE.Vector2(0, lerp(J.spine_02.z, J.spine_03.z, 0.5));
    const bins = 36, rMax = new Float32Array(bins).fill(0);
    const torso = P.map((_, k) => k).filter((k) => ax[k]?.kind === 'torso').sort((a, b) => P[b].y - P[a].y);
    const chestTop = J.upperarm.y - 0.04;
    for (const k of torso) {
      const p = P[k], a = Math.atan2(p.z - c.y, p.x - c.x), b = Math.floor(((a + Math.PI) / (2 * Math.PI)) * bins) % bins;
      const r = Math.hypot(p.x - c.x, p.z - c.y);
      if (p.y > chestTop) { rMax[b] = Math.max(rMax[b], r); continue; }
      rMax[b] = Math.max(r, rMax[b] * 0.999);
      const target = rMax[b] + spec.bag * smooth(chestTop, chestTop - 0.12, p.y);
      const dir = new THREE.Vector2(p.x - c.x, p.z - c.y).normalize();
      const grow = Math.max(0, target - r);
      disp[k].set(dir.x * grow, 0, dir.y * grow);
    }
    // sleeves: a looser tube around the arm, widening toward the open end
    for (let k = 0; k < P.length; k++) {
      if (ax[k]?.kind !== 'arm') continue;
      const p = P[k], cy = J.upperarm.y, cz = J.upperarm.z;
      const r = Math.hypot(p.y - cy, p.z - cz), dir = new THREE.Vector2(p.y - cy, p.z - cz).normalize();
      const grow = spec.bag * 0.6 * smooth(J.upperarm.x - 0.01, J.upperarm.x + 0.06, Math.abs(p.x));
      disp[k].set(0, dir.x * grow, dir.y * grow);
      void r;
    }
  }
  // smooth the hang over the garment so sections blend (seat into legs, chest into sleeves)
  for (let it = 0; it < 8; it++) {
    const nx = disp.map((d, k) => { if (!w.nb[k].size) return d; const avg = new THREE.Vector3(); w.nb[k].forEach((j) => avg.add(disp[j])); return d.clone().multiplyScalar(0.5).addScaledVector(avg, 0.5 / w.nb[k].size); });
    nx.forEach((d, k) => disp[k].copy(d));
  }
  // along the edges themselves (hems, armholes), even out the hang so the edge line stays clean
  const bnb = disp.map((_, k) => (w.boundary[k] ? [...w.nb[k]].filter((j) => w.boundary[j]) : []));
  for (let it = 0; it < 12; it++) {
    const nx = disp.map((d, k) => { if (bnb[k].length < 2) return d; const avg = new THREE.Vector3(); bnb[k].forEach((j) => avg.add(disp[j])); return d.clone().multiplyScalar(0.4).addScaledVector(avg, 0.6 / bnb[k].length); });
    nx.forEach((d, k) => disp[k].copy(d));
  }
  P.forEach((p, k) => p.add(disp[k]));
}

// Fabric material: knit/lycra look, plus waistband, cuffs and side stripes drawn in the shader
// from bind-pose coordinates so they stay crisp at any mesh density.
function fabricMaterial(spec, color, J, U) {
  const mat = new THREE.MeshPhysicalMaterial({ color, roughness: spec.sheen ? 0.48 : 0.86, sheen: spec.sheen ? 0.4 : 0.6, sheenRoughness: 0.6, sheenColor: new THREE.Color(0xffffff), side: THREE.DoubleSide });
  const u = {
    uWaist: { value: spec.slot === 'bottom' ? waistY(J, spec.keep === undefined ? 0 : 0) : -9 },
    uBand: { value: spec.waistband || 0 }, uHemY: { value: -9 }, uHemBand: { value: spec.hemBand || 0 },
    uCuffY: { value: spec.cuff ? J.foot.y + 0.075 : -9 }, uCuff: { value: spec.cuff || 0 },
    uStripes: { value: spec.stripes ? 1 : 0 }, uLegX: { value: J.thigh.x }, uLegZ: { value: lerp(J.calf.z, J.thigh.z, 0.5) }, uInner: { value: spec.inner ? 1 : 0 }, uTrim: { value: spec.trim || 0 }, uInnerDark: { value: spec.innerDark ?? 0.4 }, uShoe: { value: spec.shoe ? 1 : 0 }, uFootX: { value: J.foot.x }, uHeelZ: { value: J.foot.z - 0.05 }, uAccent: { value: new THREE.Color(spec.accent || '#c2412d') },
  };
  // top edge of a bottom = its waist cut; read back from the spec's first field (zero crossing)
  if (spec.slot === 'bottom') { let y = J.spine_01.y + 0.1; const f = spec.keep(J, U)[0]; while (f(new THREE.Vector3(0, y, 0)) < 0 && y > 0) y -= 0.001; u.uWaist.value = y; }
  if (spec.slot === 'top' && spec.hemBand) { let y = J.spine_03.y; const fs = spec.keep(J, U); const f = fs[fs.length - 1]; while (f(new THREE.Vector3(0, y, 0.05)) >= 0 && y > 0) y -= 0.001; u.uHemY.value = y; }
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec3 restPos;\nattribute float edgeD;\nvarying vec3 vRest;\nvarying float vEdge;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvRest = restPos; vEdge = edgeD;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vRest; varying float vEdge; uniform vec3 uAccent; uniform float uShoe, uFootX, uHeelZ, uInnerDark, uTrim, uWaist, uBand, uHemY, uHemBand, uCuffY, uCuff, uStripes, uLegX, uLegZ, uInner;`)
      .replace('#include <color_fragment>', `#include <color_fragment>
      float band = 0.0;
      if (uBand > 0.0) band = max(band, step(uWaist - uBand, vRest.y) * step(vRest.y, uWaist + 0.01));
      if (uHemBand > 0.0) band = max(band, step(vRest.y, uHemY + uHemBand));
      if (uCuff > 0.0) band = max(band, step(vRest.y, uCuffY + uCuff));
      diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.62, band);
      if (uInner > 0.5 && !gl_FrontFacing) diffuseColor.rgb *= uInnerDark;
      if (uShoe > 0.5) {
        // midsole (off-white), outsole (dark), heel tab and a side swoosh-free stripe pair
        float mid = 1.0 - smoothstep(0.024, 0.028, vRest.y);
        float outsole = 1.0 - smoothstep(0.004, 0.007, vRest.y);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93, 0.92, 0.88), mid);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.16), outsole);
        float line = smoothstep(0.027, 0.029, vRest.y) * (1.0 - smoothstep(0.032, 0.034, vRest.y));
        diffuseColor.rgb = mix(diffuseColor.rgb, uAccent, line);
        float heel = (1.0 - smoothstep(uHeelZ - 0.004, uHeelZ, vRest.z)) * smoothstep(0.06, 0.065, vRest.y) * (1.0 - smoothstep(0.012, 0.016, abs(abs(vRest.x) - uFootX)));
        diffuseColor.rgb = mix(diffuseColor.rgb, uAccent, heel);
      }
      if (uTrim > 0.0 && vEdge < uTrim) {
        float rib = 0.5 + 0.5 * sin((vRest.x + vRest.z) * 1400.0 + vRest.y * 1400.0);
        diffuseColor.rgb *= 0.86 - 0.05 * rib;
      }
      if (uStripes > 0.5 && vRest.y < uWaist - uBand && vRest.y > uCuffY + uCuff) {
        // three stripes down the outseam, placed by angle around the leg
        float a = atan(vRest.z - uLegZ, abs(vRest.x) - uLegX);
        float st = 0.0;
        for (int i = -1; i <= 1; i++) { float c = float(i) * 0.2; st += smoothstep(0.045, 0.035, abs(a - c)); }
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93), clamp(st, 0.0, 1.0));
      }
      // fine knit texture
      float knit = sin(vRest.y * 2400.0) * sin(vRest.x * 900.0 + vRest.z * 900.0);
      diffuseColor.rgb *= 1.0 + knit * 0.025;`);
  };
  mat.customProgramCacheKey = () => `fabric-${spec.shoe ? 1 : 0}-${spec.label}-${u.uStripes.value}-${u.uInner.value}-${u.uTrim.value}`;
  return mat;
}


export function joints(skin): Record<string, any> {
  const J: Record<string, any> = {};
  const alias = { neck_01: 'neck', thigh_l: 'thigh', calf_l: 'calf', foot_l: 'foot', ball_l: 'ball', upperarm_l: 'upperarm', lowerarm_l: 'lowerarm' };
  skin.skeleton.bones.forEach((b, i) => {
    const p = new THREE.Vector3().setFromMatrixPosition(skin.skeleton.boneInverses[i].clone().invert());
    J[b.name] = p; if (alias[b.name]) J[alias[b.name]] = p;
  });
  return J;
}


// Typed loosely on purpose: the garment specs are free-form data, tuned per piece in the artifact.
const GARMENTS_ANY: Record<string, any> = GARMENTS;
export { GARMENTS_ANY as GARMENTS, MENU, buildGarment, fabricMaterial, underwear };
