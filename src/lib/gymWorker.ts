// @ts-nocheck
// Heavy garments (jeans, cargos, jackets, puffers) take seconds to build on a phone. They're built here, off the
// main thread, so the app stays responsive. gymWear.ts checks a few debug flags on `window`.
self.window = self;
import * as THREE from 'three';
import { GARMENTS, buildGarment, joints, seedUnderwear } from './gymWear';

const packTex = (t) => ({ data: t.image.data, w: t.image.width, h: t.image.height, wrapS: t.wrapS, wrapT: t.wrapT, magFilter: t.magFilter, minFilter: t.minFilter, anisotropy: t.anisotropy, colorSpace: t.colorSpace, flipY: t.flipY });

self.onmessage = ({ data: { id, job } }) => {
  try {
    const { key, build, patch, skin: S, U } = job;
    const geometry = new THREE.BufferGeometry();
    for (const [name, a] of Object.entries(S.attributes)) geometry.setAttribute(name, new THREE.BufferAttribute(a.array, a.itemSize, a.normalized));
    geometry.setIndex(new THREE.BufferAttribute(S.index, 1));
    const inv = S.boneNames.map((_, i) => new THREE.Matrix4().fromArray(S.boneInverses, i * 16));
    const skin = { geometry, skeleton: { bones: S.boneNames.map((name) => ({ name })), boneInverses: inv } };
    seedUnderwear(skin, U);
    const base = { ...GARMENTS[key], ...(patch || {}) }, spec = base.perBuild?.[build] ? { ...base, ...base.perBuild[build] } : base;
    const g = buildGarment(spec, skin, joints(skin));
    if (!g) { self.postMessage({ id, geo: null }); return; }
    const attributes = {}, transfer = [];
    for (const [name, a] of Object.entries(g.attributes)) { attributes[name] = { array: a.array, itemSize: a.itemSize, normalized: a.normalized }; transfer.push(a.array.buffer); }
    const index = g.index.array; transfer.push(index.buffer);
    const { maps, hide, hemY } = g.userData;
    let hideMask = null;
    if (hide) { // the closure can't cross threads, so hand back its answer for each body vertex
      const pos = geometry.attributes.position, V = new THREE.Vector3(); hideMask = new Uint8Array(pos.count);
      for (let i = 0; i < pos.count; i++) { V.fromBufferAttribute(pos, i); hideMask[i] = (hide.fn ? hide.fn(V) : V.y > hide.y0 && V.y < hide.y1) ? 1 : 0; }
      transfer.push(hideMask.buffer);
    }
    const packed = maps ? { map: packTex(maps.map), normalMap: packTex(maps.normalMap) } : null;
    if (packed) transfer.push(packed.map.data.buffer, packed.normalMap.data.buffer);
    self.postMessage({ id, geo: { attributes, index, hemY, hideMask, maps: packed } }, transfer);
  } catch (e) {
    self.postMessage({ id, error: String(e) });
  }
};
