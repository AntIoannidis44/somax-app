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

// index 0/1/2 -> Light/Medium/Dark, the only real baked skin variants that exist.
function skinTextureName(build: BodyBuild, base: CharacterBase, skin: number): string {
  const buildName = build[0].toUpperCase() + build.slice(1);
  const baseName = base[0].toUpperCase() + base.slice(1);
  const tone = ['Light', 'Medium', 'Dark'][Math.max(0, Math.min(2, skin))];
  return `/models/characters/T_${buildName}_${baseName}_${tone}_BaseColor.png`;
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
  attached.castShadow = true;
  attached.receiveShadow = true;
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

  const attachPartsFrom = async (urls: string[]) => {
    const gltfs = await Promise.all(urls.map((u) => loadGLTF(u)));
    gltfs.forEach((g) => {
      findSkinnedMeshes(g.scene).forEach((m) => {
        const attached = attachToSkeleton(m, boneByName);
        if (attached) group.add(attached);
      });
    });
  };

  if (cfg.outfit !== 'none' && OUTFIT_URLS[cfg.outfit]) {
    const parts = OUTFIT_URLS[cfg.outfit][cfg.base];
    await attachPartsFrom(Object.values(parts).filter(Boolean) as string[]);
  }

  if (cfg.hair !== 'none' && HAIR_URLS[cfg.hair]) {
    await attachPartsFrom([HAIR_URLS[cfg.hair]]);
  }

  return { group };
}
