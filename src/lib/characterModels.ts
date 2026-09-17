import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { BodyBuild, CharacterBase, CharacterConfig } from '../types';

const BODY_URLS: Record<BodyBuild, Record<CharacterBase, string>> = {
  superhero: {
    male: '/models/characters/Superhero_Male_FullBody.gltf',
    female: '/models/characters/Superhero_Female_FullBody.gltf',
  },
  regular: {
    male: '/models/characters/Regular_Male_FullBody.gltf',
    female: '/models/characters/Regular_Female_FullBody.gltf',
  },
  teen: {
    male: '/models/characters/Teen_Male_FullBody.gltf',
    female: '/models/characters/Teen_Female_FullBody.gltf',
  },
};

// index 0/1/2 -> Light/Medium/Dark complexion. These are pre-composited
// (see public/models/characters/*_Complexion_*.png) from the pack's raw
// Light/Dark textures: a saturation-threshold mask separates the actual
// skin pixels (warm, saturated) from the baked-in default garment (a
// near-neutral grey/black in every variant), so only real skin changes
// tone - the garment always renders in its one fixed dark look, instead
// of shifting color along with the chosen complexion.
function skinTextureName(build: BodyBuild, base: CharacterBase, skin: number): string {
  const buildName = build[0].toUpperCase() + build.slice(1);
  const baseName = base[0].toUpperCase() + base.slice(1);
  const tone = ['Light', 'Medium', 'Dark'][Math.max(0, Math.min(2, skin))];
  return `/models/characters/T_${buildName}_${baseName}_Complexion_${tone}.png`;
}

const ANIMATIONS_URL = '/models/animations/UAL1_Standard.glb';

// Clip names from Quaternius's Universal Animation Library - shares the base
// characters' skeleton (verified matching joint names), so clips apply with
// no retargeting.
export const CLIPS = {
  idle: 'Idle_Loop',
  run: 'Jog_Fwd_Loop',
  flex: 'Dance_Loop',
} as const;

const HAIR_URLS: Record<string, string> = {
  buzzed: '/models/hair/Hair_Buzzed.gltf',
  dreads: '/models/hair/Hair_Dreads.gltf',
  mohawk: '/models/hair/Hair_Mohawk.gltf',
  ponytail: '/models/hair/Hair_Ponytail.gltf',
  simpleParted: '/models/hair/Hair_SimpleParted.gltf',
  slickBack: '/models/hair/Hair_SlickBack.gltf',
  bob: '/models/hair/Hair_Bob.gltf',
  buns: '/models/hair/Hair_Buns.gltf',
  buzzedFemale: '/models/hair/Hair_BuzzedFemale.gltf',
  long: '/models/hair/Hair_Long.gltf',
  longDreads: '/models/hair/Hair_LongDreads.gltf',
  ponytail2: '/models/hair/Hair_Ponytail_2.gltf',
};

type OutfitParts = Partial<Record<'body' | 'legs' | 'arms' | 'feet' | 'hood', string>>;
const OUTFIT_URLS: Record<string, Record<CharacterBase, OutfitParts>> = {
  trainer: {
    male: {
      body: '/models/outfits/peasant/Male_Peasant_Body.gltf',
      legs: '/models/outfits/peasant/Male_Peasant_Legs.gltf',
      arms: '/models/outfits/peasant/Male_Peasant_Arms.gltf',
      feet: '/models/outfits/peasant/Male_Peasant_Feet.gltf',
    },
    female: {
      body: '/models/outfits/peasant/Female_Peasant_Body.gltf',
      legs: '/models/outfits/peasant/Female_Peasant_Legs.gltf',
      arms: '/models/outfits/peasant/Female_Peasant_Arms.gltf',
      feet: '/models/outfits/peasant/Female_Peasant_Feet.gltf',
    },
  },
  ranger: {
    male: {
      body: '/models/outfits/ranger/Male_Ranger_Body.gltf',
      legs: '/models/outfits/ranger/Male_Ranger_Legs.gltf',
      arms: '/models/outfits/ranger/Male_Ranger_Arms.gltf',
      hood: '/models/outfits/ranger/Male_Ranger_Head_Hood.gltf',
    },
    female: {
      body: '/models/outfits/ranger/Female_Ranger_Body.gltf',
      legs: '/models/outfits/ranger/Female_Ranger_Legs.gltf',
      arms: '/models/outfits/ranger/Female_Ranger_Arms.gltf',
      hood: '/models/outfits/ranger/Female_Ranger_Head_Hood.gltf',
    },
  },
};

// Outfits were modeled to fit the Teen build. Corrective uniform scale
// [x, y, z] to approximate a fit on the other builds - tuned empirically
// against screenshots, not exact. Teen itself needs none (omitted = 1,1,1).
const OUTFIT_FIT_SCALE: Partial<Record<BodyBuild, Partial<Record<CharacterBase, THREE.Vector3Tuple>>>> = {
  superhero: {
    male: [1.18, 1.08, 1.18],
    female: [1.2, 1.28, 1.2],
  },
  regular: {
    male: [1.06, 1.03, 1.06],
    female: [1.1, 1.06, 1.1],
  },
};

const loader = new GLTFLoader();
const gltfCache = new Map<string, Promise<GLTF>>();
function loadGLTF(url: string): Promise<GLTF> {
  let p = gltfCache.get(url);
  if (!p) {
    p = new Promise((resolve, reject) => loader.load(url, resolve, undefined, reject));
    gltfCache.set(url, p);
  }
  return p;
}

const textureLoader = new THREE.TextureLoader();
const textureCache = new Map<string, THREE.Texture>();
function loadSkinTexture(url: string): THREE.Texture {
  let tex = textureCache.get(url);
  if (!tex) {
    tex = textureLoader.load(url);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = false;
    textureCache.set(url, tex);
  }
  return tex;
}

export function loadAnimationClips(): Promise<THREE.AnimationClip[]> {
  return loadGLTF(ANIMATIONS_URL).then((g) => g.animations);
}

function findSkinnedMeshes(root: THREE.Object3D): THREE.SkinnedMesh[] {
  const out: THREE.SkinnedMesh[] = [];
  root.traverse((o) => {
    if ((o as THREE.SkinnedMesh).isSkinnedMesh) out.push(o as THREE.SkinnedMesh);
  });
  return out;
}

// Rebuilds `mesh` bound to the master skeleton's bones (matched by name) so
// it deforms in lockstep with the body's animation. Works because outfits
// and hair share the exact same rig family/bind pose as the base bodies
// (verified: identical joint names and counts across all these packs).
function attachToSkeleton(mesh: THREE.SkinnedMesh, boneByName: Map<string, THREE.Bone>): THREE.SkinnedMesh | null {
  const srcSkeleton = mesh.skeleton;
  const bones = srcSkeleton.bones.map((b) => boneByName.get(b.name));
  if (bones.some((b) => !b)) return null;
  const attached = new THREE.SkinnedMesh(mesh.geometry, mesh.material);
  // Skip shadow casting on hair/outfit overlays - the body underneath
  // already casts a similar silhouette, so this saves real shadow-pass
  // draw calls (a known mobile GPU cost) for little visible difference.
  attached.castShadow = false;
  attached.receiveShadow = false;
  const skeleton = new THREE.Skeleton(bones as THREE.Bone[], srcSkeleton.boneInverses);
  attached.bind(skeleton, mesh.bindMatrix);
  return attached;
}

export interface ComposedCharacter {
  group: THREE.Group;
}

export async function composeCharacter(cfg: CharacterConfig): Promise<ComposedCharacter> {
  const bodyGltf = await loadGLTF(BODY_URLS[cfg.build][cfg.base]);
  const bodyScene = skeletonClone(bodyGltf.scene) as THREE.Group;

  const bodySkinned = findSkinnedMeshes(bodyScene);
  bodySkinned.forEach((m) => {
    m.castShadow = true;
    m.receiveShadow = true;
  });

  const boneByName = new Map<string, THREE.Bone>();
  bodySkinned[0]?.skeleton.bones.forEach((b) => boneByName.set(b.name, b));

  const group = new THREE.Group();
  group.add(bodyScene);

  // Skin tone: retarget only the body's own skin material, identified by
  // material name (MI_{Build}_{Base}) - not mesh name, which isn't
  // consistent across builds. Skips MI_Eyes/MI_Hair_* (eyebrows, eyes).
  const skinTex = loadSkinTexture(skinTextureName(cfg.build, cfg.base, cfg.skin));
  bodySkinned.forEach((m) => {
    const mat = m.material as THREE.MeshStandardMaterial;
    const name = mat?.name || '';
    if (name.startsWith('MI_Eyes') || name.startsWith('MI_Hair')) return;
    if (mat?.map) {
      const cloned = mat.clone() as THREE.MeshStandardMaterial;
      cloned.map = skinTex;
      m.material = cloned;
    }
  });

  const attachPartsFrom = async (urls: string[], scale?: THREE.Vector3Tuple) => {
    const gltfs = await Promise.all(urls.map((u) => loadGLTF(u)));
    gltfs.forEach((g) => {
      findSkinnedMeshes(g.scene).forEach((m) => {
        const attached = attachToSkeleton(m, boneByName);
        if (!attached) return;
        if (scale) attached.scale.set(...scale);
        group.add(attached);
      });
    });
  };

  if (cfg.outfit !== 'none' && OUTFIT_URLS[cfg.outfit]) {
    const parts = OUTFIT_URLS[cfg.outfit][cfg.base];
    // The outfit was modeled to fit the Teen build. Approximate a fit on
    // the other builds with a corrective uniform scale - imperfect (no
    // per-region control), but meaningfully reduces clipping.
    const scale = OUTFIT_FIT_SCALE[cfg.build]?.[cfg.base];
    await attachPartsFrom(Object.values(parts).filter(Boolean) as string[], scale);
  }

  if (cfg.hair !== 'none' && HAIR_URLS[cfg.hair]) {
    await attachPartsFrom([HAIR_URLS[cfg.hair]]);
  }

  return { group };
}
