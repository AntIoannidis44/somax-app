import * as THREE from 'three';

// Painted garments: seconds to build on a phone, so never on the main thread.
export const isHeavyGarment = (key: string) => /^(jeans|cargo|trackJacket|puffer)/.test(key);

type Waiter = { resolve: (g: THREE.BufferGeometry | null) => void; reject: (e: Error) => void };
let worker: Worker | null = null;
let nextId = 1;
const waiting = new Map<number, Waiter>();

function unpackTex(t: any): THREE.DataTexture {
  const tex = new THREE.DataTexture(t.data, t.w, t.h, THREE.RGBAFormat);
  tex.wrapS = t.wrapS; tex.wrapT = t.wrapT; tex.magFilter = t.magFilter; tex.minFilter = t.minFilter;
  tex.anisotropy = t.anisotropy; tex.colorSpace = t.colorSpace; tex.flipY = t.flipY;
  tex.generateMipmaps = true; tex.needsUpdate = true;
  return tex;
}
function unpack(p: any): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  for (const [name, a] of Object.entries<any>(p.attributes)) g.setAttribute(name, new THREE.BufferAttribute(a.array, a.itemSize, a.normalized));
  g.setIndex(new THREE.BufferAttribute(p.index, 1));
  g.userData = { hemY: p.hemY };
  if (p.hideMask) g.userData.hide = { mask: p.hideMask };
  if (p.maps) g.userData.maps = { map: unpackTex(p.maps.map), normalMap: unpackTex(p.maps.normalMap) };
  return g;
}
function failAll(message: string) {
  waiting.forEach((w) => w.reject(new Error(message)));
  waiting.clear();
  worker = null;
}
function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./gymWorker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => {
      const w = waiting.get(data.id);
      if (!w) return;
      waiting.delete(data.id);
      if (data.error) w.reject(new Error(data.error));
      else w.resolve(data.geo ? unpack(data.geo) : null);
    };
    worker.onerror = (e) => failAll(e.message || 'gym worker failed');
  }
  return worker;
}

export function buildInWorker(srcSkin: THREE.SkinnedMesh, U: any, key: string, build: string, patch?: object): Promise<THREE.BufferGeometry | null> {
  return new Promise((resolve, reject) => {
    const g = srcSkin.geometry, attributes: Record<string, any> = {};
    for (const name of ['position', 'normal', 'uv', 'skinIndex', 'skinWeight']) {
      const a = g.attributes[name] as THREE.BufferAttribute;
      attributes[name] = { array: a.array, itemSize: a.itemSize, normalized: a.normalized };
    }
    const bones = srcSkin.skeleton.boneInverses, inv = new Float32Array(bones.length * 16);
    bones.forEach((m, i) => inv.set(m.elements, i * 16));
    const skin = { attributes, index: g.index!.array, boneNames: srcSkin.skeleton.bones.map((b) => b.name), boneInverses: inv };
    const id = nextId++;
    waiting.set(id, { resolve, reject });
    try { getWorker().postMessage({ id, job: { key, build, patch, skin, U } }); } catch (e) { waiting.delete(id); reject(e as Error); }
  });
}
