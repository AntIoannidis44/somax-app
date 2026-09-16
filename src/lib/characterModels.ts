import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { CharacterBase } from '../types';

const MODEL_URLS: Record<CharacterBase, string> = {
  male: '/models/characters/Superhero_Male_FullBody.gltf',
  female: '/models/characters/Superhero_Female_FullBody.gltf',
};
const ANIMATIONS_URL = '/models/animations/UAL1_Standard.glb';

// Clip names from Quaternius's Universal Animation Library - shares the base
// characters' skeleton (verified matching joint names), so clips apply with
// no retargeting.
export const CLIPS = {
  idle: 'Idle_Loop',
  run: 'Jog_Fwd_Loop',
  flex: 'Dance_Loop',
} as const;

const loader = new GLTFLoader();

function loadGLTF(url: string): Promise<GLTF> {
  return new Promise((resolve, reject) => loader.load(url, resolve, undefined, reject));
}

const modelCache = new Map<CharacterBase, Promise<THREE.Group>>();
let animationsCache: Promise<THREE.AnimationClip[]> | null = null;

export function loadCharacterTemplate(base: CharacterBase): Promise<THREE.Group> {
  let cached = modelCache.get(base);
  if (!cached) {
    cached = loadGLTF(MODEL_URLS[base]).then((gltf) => {
      gltf.scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });
      return gltf.scene;
    });
    modelCache.set(base, cached);
  }
  return cached;
}

export function loadAnimationClips(): Promise<THREE.AnimationClip[]> {
  if (!animationsCache) {
    animationsCache = loadGLTF(ANIMATIONS_URL).then((gltf) => gltf.animations);
  }
  return animationsCache;
}

export function cloneCharacter(template: THREE.Group): THREE.Group {
  return skeletonClone(template) as THREE.Group;
}
