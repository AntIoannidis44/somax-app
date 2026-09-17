import * as THREE from 'three';
import { tierFor } from './character';

interface MatOpts {
  rough?: number;
  metal?: number;
  emissive?: THREE.ColorRepresentation;
  ei?: number;
}

function mat(color: THREE.ColorRepresentation, o: MatOpts = {}): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: o.rough != null ? o.rough : 0.72,
    metalness: o.metal || 0,
    emissive: o.emissive != null ? new THREE.Color(o.emissive) : new THREE.Color(0x000000),
    emissiveIntensity: o.ei || 0,
  });
}

function mesh(geo: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const o = new THREE.Mesh(geo, m);
  o.position.set(x, y, z);
  o.castShadow = true;
  return o;
}

export function disposeGroup(g: THREE.Object3D): void {
  g.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(material)) material.forEach((m) => m.dispose());
    else if (material?.dispose) material.dispose();
  });
}

export function addLights(scene: THREE.Scene, shadows: boolean): void {
  scene.add(new THREE.HemisphereLight(0xffffff, 0x1c2b57, 0.95));
  const key = new THREE.DirectionalLight(0xffffff, 1.05);
  key.position.set(2.6, 5, 3.4);
  if (shadows) {
    key.castShadow = true;
    key.shadow.mapSize.set(512, 512);
    key.shadow.camera.left = -2;
    key.shadow.camera.right = 2;
    key.shadow.camera.top = 3.5;
    key.shadow.camera.bottom = -1;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 14;
    key.shadow.radius = 4;
  }
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x7aa6ff, 0.75);
  rim.position.set(-3, 3, -3.5);
  scene.add(rim);
}

export function buildPedestal(level: number): THREE.Group {
  const t = tierFor(level);
  const g = new THREE.Group();
  const base = mesh(new THREE.CylinderGeometry(1.08, 1.2, 0.16, 56), mat(t.c2, { rough: 0.35, metal: 0.35 }), 0, -0.08, 0);
  base.castShadow = false;
  base.receiveShadow = true;
  g.add(base);
  const top = mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.02, 56), mat('#0a1230', { rough: 0.5, metal: 0.2 }), 0, 0.005, 0);
  top.castShadow = false;
  top.receiveShadow = true;
  g.add(top);
  const ring = mesh(new THREE.TorusGeometry(1.08, 0.022, 10, 80), mat(t.c1, { emissive: t.c1, ei: 1.4, rough: 0.3 }), 0, 0.0, 0);
  ring.rotation.x = Math.PI / 2;
  ring.castShadow = false;
  g.add(ring);

  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const ctx = cv.getContext('2d')!;
  const grd = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  grd.addColorStop(0, t.c1 + '99');
  grd.addColorStop(0.55, t.c1 + '22');
  grd.addColorStop(1, t.c1 + '00');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(cv);
  const glow = new THREE.Mesh(new THREE.CircleGeometry(2.1, 48), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = -0.165;
  g.add(glow);
  return g;
}
