import * as THREE from 'three';
import { HAIR_COLORS, SHOES, SKIN_TONES, TOPS, BOTTOMS } from '../data/catalog';
import { findItem, tierFor } from './character';
import type { CharacterConfig } from '../types';

export type CharacterStyle = 'real' | 'toon';

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

function limb(rTop: number, rBot: number, len: number, m: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(rTop, rBot, len, 18), m, 0, -len / 2, 0));
  g.add(mesh(new THREE.SphereGeometry(rTop, 16, 12), m, 0, 0, 0));
  g.add(mesh(new THREE.SphereGeometry(rBot, 16, 12), m, 0, -len, 0));
  return g;
}

function cap(r: number, theta: number, m: THREE.Material, y: number, z = 0): THREE.Mesh {
  return mesh(new THREE.SphereGeometry(r, 28, 18, 0, Math.PI * 2, 0, theta), m, 0, y, z);
}

export function buildCharacter(cfg: CharacterConfig, style: CharacterStyle): THREE.Group {
  const toon = style === 'toon';
  const g = new THREE.Group();
  const fem = cfg.base !== 'male';
  const top = findItem(TOPS, cfg.top);
  const bot = findItem(BOTTOMS, cfg.bottom);
  const shoe = findItem(SHOES, cfg.shoes);
  const hairC = findItem(HAIR_COLORS, cfg.hairColor).c;
  const skinC = SKIN_TONES[cfg.skin] || SKIN_TONES[2];

  function M(color: THREE.ColorRepresentation, o: MatOpts = {}): THREE.Material {
    if (toon) {
      const c = new THREE.Color(color);
      const hsl = { h: 0, s: 0, l: 0 };
      c.getHSL(hsl);
      c.setHSL(hsl.h, Math.min(1, hsl.s * 1.25 + 0.05), Math.min(0.92, hsl.l * 1.08));
      return new THREE.MeshToonMaterial({
        color: c,
        emissive: o.emissive != null ? new THREE.Color(o.emissive) : new THREE.Color(0x000000),
        emissiveIntensity: o.ei || 0,
      });
    }
    return mat(color, o);
  }

  const skinM = M(skinC, { rough: 0.62 });
  const topM = M(top.c, { rough: 0.82 });
  const botM = M(bot.c, { rough: 0.82 });
  const shoeM = M(shoe.c, { rough: 0.45 });
  const hairM = M(hairC, { rough: 0.55 });
  const dark = M('#0f1524', { rough: 0.4 });

  interface Proportions {
    hipY: number;
    shoulderY: number;
    hy: number;
    k: number;
    shW: number;
    waist: number;
    hip: number;
    LU: number;
    LS: number;
    AU: number;
    AL: number;
    lr: number;
    ar: number;
    shoeW: number;
    shoeH: number;
    shoeL: number;
  }

  const P: Proportions = toon
    ? {
        hipY: 0.86,
        shoulderY: 1.42,
        hy: 1.86,
        k: 1.5,
        shW: fem ? 0.27 : 0.34,
        waist: fem ? 0.21 : 0.27,
        hip: fem ? 0.27 : 0.27,
        LU: 0.4,
        LS: 0.36,
        AU: 0.28,
        AL: 0.26,
        lr: 1.28,
        ar: 1.3,
        shoeW: 0.27,
        shoeH: 0.16,
        shoeL: 0.44,
      }
    : {
        hipY: 1.0,
        shoulderY: 1.64,
        hy: 1.98,
        k: 1,
        shW: fem ? 0.245 : 0.315,
        waist: fem ? 0.185 : 0.235,
        hip: fem ? 0.245 : 0.245,
        LU: 0.46,
        LS: 0.42,
        AU: 0.3,
        AL: 0.28,
        lr: 1,
        ar: 1,
        shoeW: 0.19,
        shoeH: 0.12,
        shoeL: 0.33,
      };

  const { hipY, shoulderY, hy, k, shW } = P;
  const T = shoulderY - hipY;
  const lowerH = T * 0.36;
  const upperH = T * 0.64;

  g.add(mesh(new THREE.CylinderGeometry(shW, P.waist, upperH, 26), topM, 0, hipY + lowerH + upperH / 2, 0));
  g.add(mesh(new THREE.CylinderGeometry(P.waist, P.hip, lowerH, 26), topM, 0, hipY + lowerH / 2, 0));
  const shM = top.style === 'tank' ? skinM : topM;
  const shR = 0.105 * P.ar;
  g.add(mesh(new THREE.SphereGeometry(shR, 18, 14), shM, shW - 0.01, shoulderY - 0.02, 0));
  g.add(mesh(new THREE.SphereGeometry(shR, 18, 14), shM, -(shW - 0.01), shoulderY - 0.02, 0));

  const headBottom = hy - 0.24 * k;
  g.add(
    mesh(
      new THREE.CylinderGeometry(0.075 * k, 0.085 * k, Math.max(0.1, headBottom - shoulderY + 0.12), 16),
      skinM,
      0,
      (shoulderY + headBottom) / 2 + 0.02,
      0,
    ),
  );

  const H = new THREE.Group();
  H.position.set(0, hy, 0);
  H.scale.setScalar(k);
  const head = mesh(new THREE.SphereGeometry(0.24, 32, 24), skinM, 0, 0, 0);
  head.scale.set(1, 1.06, 0.98);
  H.add(head);
  H.add(mesh(new THREE.SphereGeometry(0.042, 12, 10), skinM, 0.235, -0.01, 0));
  H.add(mesh(new THREE.SphereGeometry(0.042, 12, 10), skinM, -0.235, -0.01, 0));

  if (toon) {
    const white = M('#ffffff');
    [1, -1].forEach((s) => {
      const eye = mesh(new THREE.SphereGeometry(0.062, 16, 12), white, s * 0.092, 0.02, 0.2);
      eye.scale.set(1, 1.15, 0.7);
      eye.userData.noOutline = true;
      H.add(eye);
      const pupil = mesh(new THREE.SphereGeometry(0.03, 12, 10), dark, s * 0.088, 0.015, 0.245);
      pupil.userData.noOutline = true;
      H.add(pupil);
      const glint = mesh(new THREE.SphereGeometry(0.011, 8, 6), white, s * 0.082 + 0.012, 0.03, 0.27);
      glint.userData.noOutline = true;
      H.add(glint);
      const brow = mesh(new THREE.BoxGeometry(0.09, 0.022, 0.014), hairM, s * 0.092, 0.1, 0.225);
      brow.rotation.z = s * -0.18;
      H.add(brow);
    });
    const grin = mesh(new THREE.TorusGeometry(0.075, 0.013, 6, 16, Math.PI), dark, 0, -0.07, 0.222);
    grin.rotation.z = Math.PI;
    grin.userData.noOutline = true;
    H.add(grin);
  } else {
    H.add(mesh(new THREE.SphereGeometry(0.024, 10, 8), dark, 0.085, 0.015, 0.215));
    H.add(mesh(new THREE.SphereGeometry(0.024, 10, 8), dark, -0.085, 0.015, 0.215));
    const smile = mesh(new THREE.TorusGeometry(0.052, 0.009, 6, 14, Math.PI), dark, 0, -0.075, 0.222);
    smile.rotation.z = Math.PI;
    H.add(smile);
    H.add(mesh(new THREE.BoxGeometry(0.075, 0.014, 0.012), hairM, 0.085, 0.08, 0.222));
    H.add(mesh(new THREE.BoxGeometry(0.075, 0.014, 0.012), hairM, -0.085, 0.08, 0.222));
  }

  const st = cfg.hair;
  if (cfg.extra !== 'cap' || st === 'long' || st === 'ponytail' || st === 'curls') {
    if (st === 'buzz') {
      H.add(cap(0.25, Math.PI * 0.47, hairM, 0.005));
    } else if (st === 'short') {
      H.add(cap(0.258, Math.PI * 0.56, hairM, 0.01));
      H.add(mesh(new THREE.BoxGeometry(0.34, 0.07, 0.11), hairM, 0, 0.16, 0.19));
      if (toon) {
        const sp = mesh(new THREE.ConeGeometry(0.07, 0.16, 8), hairM, 0.05, 0.3, 0.02);
        sp.rotation.z = -0.3;
        H.add(sp);
      }
    } else if (st === 'long') {
      H.add(cap(0.258, Math.PI * 0.6, hairM, 0.01));
      const back = mesh(new THREE.SphereGeometry(0.28, 24, 18), hairM, 0, -0.24, -0.12);
      back.scale.set(0.9, 1.2, 0.5);
      H.add(back);
    } else if (st === 'ponytail') {
      H.add(cap(0.258, Math.PI * 0.58, hairM, 0.01));
      const tail = limb(0.085, 0.035, 0.46, hairM);
      tail.position.set(0, 0.02, -0.26);
      tail.rotation.x = 0.42;
      H.add(tail);
    } else if (st === 'bun') {
      H.add(cap(0.258, Math.PI * 0.56, hairM, 0.01));
      H.add(mesh(new THREE.SphereGeometry(0.12, 18, 14), hairM, 0, 0.29, -0.03));
    } else if (st === 'curls') {
      const puff = cap(0.31, Math.PI * 0.62, hairM, 0.03);
      puff.scale.set(1, 0.92, 1);
      H.add(puff);
      H.add(mesh(new THREE.SphereGeometry(0.125, 16, 12), hairM, 0.24, -0.02, -0.02));
      H.add(mesh(new THREE.SphereGeometry(0.125, 16, 12), hairM, -0.24, -0.02, -0.02));
    } else if (st === 'mohawk') {
      H.add(cap(0.25, Math.PI * 0.47, hairM, 0.005));
      H.add(mesh(new THREE.BoxGeometry(0.075, toon ? 0.28 : 0.2, 0.42), hairM, 0, toon ? 0.34 : 0.3, -0.02));
    }
  }

  const accent = M('#ffffff', { rough: 0.9 });
  if (cfg.extra === 'headband') {
    const hb = mesh(new THREE.TorusGeometry(0.255, 0.03, 10, 44), accent, 0, 0.08, 0);
    hb.rotation.x = Math.PI / 2;
    H.add(hb);
  }
  if (cfg.extra === 'cap') {
    const capM = M('#1554e6', { rough: 0.7 });
    H.add(cap(0.268, Math.PI * 0.5, capM, 0.02));
    H.add(mesh(new THREE.BoxGeometry(0.34, 0.03, 0.24), capM, 0, 0.03, 0.3));
  }
  if (cfg.extra === 'glasses') {
    const gl = M('#0b0f1a', { rough: 0.25, metal: 0.4 });
    H.add(mesh(new THREE.BoxGeometry(toon ? 0.16 : 0.13, toon ? 0.11 : 0.085, 0.022), gl, 0.09, 0.015, toon ? 0.27 : 0.232));
    H.add(mesh(new THREE.BoxGeometry(toon ? 0.16 : 0.13, toon ? 0.11 : 0.085, 0.022), gl, -0.09, 0.015, toon ? 0.27 : 0.232));
    H.add(mesh(new THREE.BoxGeometry(0.05, 0.016, 0.02), gl, 0, 0.025, toon ? 0.27 : 0.232));
  }
  g.add(H);

  function arm(side: number): THREE.Group {
    const upM = top.style === 'tank' ? skinM : topM;
    const loM = top.style === 'long' ? topM : skinM;
    const a = limb(0.078 * P.ar, 0.07 * P.ar, P.AU, upM);
    a.position.set(side * (shW + 0.03), shoulderY - 0.03, 0);
    a.rotation.z = side * 0.22;
    const fore = limb(0.068 * P.ar, 0.06 * P.ar, P.AL, loM);
    fore.position.set(0, -P.AU, 0);
    fore.rotation.x = -0.32;
    fore.add(mesh(new THREE.SphereGeometry(0.075 * P.ar * (toon ? 1.25 : 1), 14, 12), skinM, 0, -P.AL - 0.01, 0));
    if (cfg.extra === 'wristbands') {
      const wb = mesh(new THREE.TorusGeometry(0.075 * P.ar, 0.024, 10, 24), M('#ffffff', { rough: 0.9 }), 0, -P.AL + 0.045, 0);
      wb.rotation.x = Math.PI / 2;
      fore.add(wb);
    }
    a.add(fore);
    a.userData.side = side;
    return a;
  }
  const armR = arm(1);
  const armL = arm(-1);
  g.add(armR);
  g.add(armL);

  function leg(side: number): THREE.Group {
    const upM = botM;
    const loM = bot.style === 'long' ? botM : skinM;
    const l = limb(0.125 * P.lr, 0.105 * P.lr, P.LU, upM);
    l.position.set(side * 0.135 * (toon ? 1.15 : 1), hipY, 0);
    l.rotation.z = side * 0.04;
    const shin = limb(0.098 * P.lr, 0.078 * P.lr, P.LS, loM);
    shin.position.set(0, -P.LU, 0);
    const s = mesh(new THREE.BoxGeometry(P.shoeW, P.shoeH, P.shoeL), shoeM, 0, -(P.LS + 0.02), 0.055);
    const sole = mesh(
      new THREE.BoxGeometry(P.shoeW + 0.01, 0.04, P.shoeL + 0.02),
      M(shoe.id === 'white' ? '#d7dae0' : '#f4f5f7', { rough: 0.9 }),
      0,
      -(P.LS + 0.08),
      0.055,
    );
    shin.add(s);
    shin.add(sole);
    l.add(shin);
    return l;
  }
  const legR = leg(1);
  const legL = leg(-1);
  g.add(legR);
  g.add(legL);

  let aura: THREE.Group | undefined;
  if (cfg.extra === 'aura') {
    aura = new THREE.Group();
    const am = mat('#7ad7ff', { emissive: '#3ab8ff', ei: 1.6, rough: 0.3 });
    for (let i = 0; i < 14; i++) {
      const ang = (i / 14) * Math.PI * 2;
      const p = mesh(new THREE.SphereGeometry(0.028, 8, 6), am, Math.cos(ang) * 0.58, 1.15, Math.sin(ang) * 0.58);
      p.castShadow = false;
      p.userData.phase = ang;
      p.userData.noOutline = true;
      aura.add(p);
    }
    g.add(aura);
  }

  if (toon) {
    const inkM = new THREE.MeshBasicMaterial({ color: 0x0b1020, side: THREE.BackSide });
    const targets: THREE.Mesh[] = [];
    g.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && !o.userData.noOutline) targets.push(o as THREE.Mesh);
    });
    targets.forEach((o) => {
      const ink = new THREE.Mesh(o.geometry, inkM);
      ink.scale.setScalar(1.045);
      ink.castShadow = false;
      ink.userData.noOutline = true;
      o.add(ink);
    });
  }

  g.userData.armL = armL;
  g.userData.armR = armR;
  g.userData.legL = legL;
  g.userData.legR = legR;
  g.userData.head = H;
  g.userData.aura = aura;
  return g;
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
    key.shadow.mapSize.set(1024, 1024);
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
