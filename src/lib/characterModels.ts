import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { BodyBuild, CharacterBase, CharacterConfig } from '../types';
import { HAIR_COLORS } from '../data/catalog';

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

// index 0/1/2 -> Light/Medium/Dark complexion. Pre-composited by
// scripts/generate_complexion_textures.py (see public/models/characters/
// *_Complexion_*.png) from the pack's single base texture per build: a
// saturation-threshold mask separates real skin pixels (warm, saturated)
// from the baked-in default garment (near-neutral grey/black), then only
// the skin pixels get tinted toward the target tone via a color ratio -
// the garment stays fixed regardless of the chosen complexion.
//
// TEXTURE_VERSION cache-busts these filenames: they're served with a 24h
// Cache-Control (see public/_headers) since they're not content-hashed
// like the JS bundle, so both the CDN edge and every visited browser can
// keep serving pre-fix bytes for up to a day after a real deploy unless
// the URL itself changes. Bump this whenever generate_complexion_textures
// output changes.
const TEXTURE_VERSION = 2;

function skinTextureName(build: BodyBuild, base: CharacterBase, skin: number): string {
  const buildName = build[0].toUpperCase() + build.slice(1);
  const baseName = base[0].toUpperCase() + base.slice(1);
  const tone = ['Light', 'Medium', 'Dark'][Math.max(0, Math.min(2, skin))];
  return `/models/characters/T_${buildName}_${baseName}_Complexion_${tone}.png?v=${TEXTURE_VERSION}`;
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
    female: [1.16, 1.14, 1.16],
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
const textureCache = new Map<string, Promise<THREE.Texture>>();
// Returns a Promise, not a bare Texture: TextureLoader.load() returns
// immediately with the image still loading in the background, which is
// fine for the live animated view (a later frame just picks up the
// loaded texture) but broke the one-shot thumbnail snapshot render -
// it rendered (and permanently cached) a frame captured before the
// texture arrived, showing a flat black silhouette forever.
function loadSkinTexture(url: string): Promise<THREE.Texture> {
  let p = textureCache.get(url);
  if (!p) {
    p = new Promise((resolve, reject) => {
      textureLoader.load(
        url,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.flipY = false;
          resolve(tex);
        },
        undefined,
        reject,
      );
    });
    textureCache.set(url, p);
  }
  return p;
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
//
// The outfit pack ships exactly one mesh per piece per gender, sculpted to
// fit the Teen build's proportions (Teen uses it with zero correction and
// is clean from every angle). Regular/Superhero are bulkier body variants
// this project added beyond what the pack's outfits were made for, so
// their surface pokes through the unmodified outfit mesh in places.
//
// `scale`, if given, first applies a uniform bounding-box-centered scale
// (baked into vertex positions, not the SkinnedMesh transform, since
// scaling the transform directly conflicts with skinning). But a uniform
// scale only approximates the real body's silhouette - wherever the actual
// (non-uniformly bulkier) body surface still pokes past the uniformly
// scaled cloth, the two nearly-coincident surfaces z-fight into a visible
// dashed/zigzag pattern (confirmed: absent on Teen with no scale, present
// at the hip/thigh/calf on scaled builds regardless of bone-weight
// blending, ruling out a skinning-blend cause). Fixed by additionally
// inflating every vertex outward along its own original surface normal by
// a fixed clearance - this guarantees separation from the body regardless
// of local shape mismatches, unlike a linear scale.
const OUTFIT_INFLATE = 0.018;

function attachToSkeleton(
  mesh: THREE.SkinnedMesh,
  boneByName: Map<string, THREE.Bone>,
  scale?: THREE.Vector3Tuple,
): THREE.SkinnedMesh | null {
  const srcSkeleton = mesh.skeleton;
  const bones = srcSkeleton.bones.map((b) => boneByName.get(b.name));
  if (bones.some((b) => !b)) return null;
  let geometry = mesh.geometry;
  if (scale) {
    geometry = geometry.clone();
    geometry.computeVertexNormals();
    // geometry.scale() scales around the geometry's local origin, which
    // for these pieces isn't centered on the piece itself (e.g. the body
    // piece's origin sits near the collar, not its visual center) -
    // scaling around it directly ballooned/skewed pieces outward from
    // that one corner instead of growing evenly. Scale around the
    // piece's own bounding-box center instead, then restore position.
    geometry.computeBoundingBox();
    const center = new THREE.Vector3();
    geometry.boundingBox!.getCenter(center);

    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const normal = geometry.attributes.normal as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    const n = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      n.fromBufferAttribute(normal, i);
      v.sub(center);
      v.x *= scale[0];
      v.y *= scale[1];
      v.z *= scale[2];
      v.add(center);
      v.addScaledVector(n, OUTFIT_INFLATE);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();
  }
  const attached = new THREE.SkinnedMesh(geometry, mesh.material);
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

  // Skin tone: retarget the body's own skin material, identified by
  // material name (MI_{Build}_{Base}) - not mesh name, which isn't
  // consistent across builds. Skips MI_Eyes/MI_Hair_* (eyebrows, eyes).
  //
  // Outfit pieces can *also* carry a small patch of baked-in exposed skin
  // (e.g. the trainer kit's short sleeves leave the forearm/hand modeled
  // as part of the "Arms" mesh, not the body) - textured from the same
  // pack's own fixed reference copy of the base skin, under the same
  // MI_{Build}_{Base} naming as the body's own material. Left alone, that
  // patch stays one fixed tone regardless of the complexion picked,
  // visibly mismatched against the face - so retarget it too wherever it
  // turns up. Match by pattern, not by the current build/base: these
  // outfit files are shared across all three body builds, but the name
  // baked into the file is always the one build it was originally
  // authored against (e.g. every "Arms" piece says MI_Regular_Male even
  // when attached to a Teen or Superhero character) - an exact match
  // against cfg.build only worked for Regular and silently missed the
  // identical bug on Teen/Superhero.
  const SKIN_MATERIAL_RE = /^MI_(Superhero|Regular|Teen)_(Male|Female)$/;
  const skinTex = await loadSkinTexture(skinTextureName(cfg.build, cfg.base, cfg.skin));
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

  const attachPartsFrom = async (urls: string[], scale?: THREE.Vector3Tuple, tint?: string) => {
    const gltfs = await Promise.all(urls.map((u) => loadGLTF(u)));
    gltfs.forEach((g) => {
      findSkinnedMeshes(g.scene).forEach((m) => {
        const isSkinPatch = !!(m.material as THREE.MeshStandardMaterial)?.name?.match(SKIN_MATERIAL_RE);
        // The uniform scale+normal-inflate correction is tuned for garment
        // fabric (legs, torso) being stretched onto a bulkier body - applied
        // to this tiny anatomical hand/wrist patch instead, the same fixed
        // inflate distance is large relative to finger geometry and mangles
        // its normals, making it render washed-out/pale under the stage
        // lighting regardless of its (correctly assigned, correctly dark)
        // texture. Confirmed by direct pixel sampling: the texture data at
        // this mesh's own UV coordinates was already correctly dark even
        // while the rendered screenshot showed it pale - a lighting/normal
        // artifact, not a texture or material bug. Skip the correction for
        // this one piece; it doesn't need to stretch to begin with.
        const attached = attachToSkeleton(m, boneByName, isSkinPatch ? undefined : scale);
        if (!attached) return;
        const mat = attached.material as THREE.MeshStandardMaterial;
        if (mat?.name && SKIN_MATERIAL_RE.test(mat.name) && mat.map) {
          const cloned = mat.clone();
          cloned.map = skinTex;
          attached.material = cloned;
        } else if (tint) {
          // The hair mesh's base texture is a near-neutral grey with no
          // baked-in color (made for tinting), so a material color
          // multiply is enough - no separate texture per color needed,
          // unlike skin tone which had a baked-in garment to protect.
          const cloned = (attached.material as THREE.MeshStandardMaterial).clone();
          cloned.color.set(tint);
          attached.material = cloned;
        }
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
    const idx = Math.max(0, Math.min(HAIR_COLORS.length - 1, cfg.hairColor ?? 0));
    const tint = HAIR_COLORS[idx].hex;
    await attachPartsFrom([HAIR_URLS[cfg.hair]], undefined, tint);
  }

  return { group };
}
