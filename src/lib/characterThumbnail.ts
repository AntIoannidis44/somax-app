import * as THREE from 'three';
import { addLights } from './characterBuilder';
import { CLIPS, composeCharacter, loadAnimationClips } from './characterModels';
import type { CharacterConfig } from '../types';

export type ThumbnailMode = 'full' | 'portrait';

const HAS_3D = typeof window !== 'undefined' && !!window.WebGLRenderingContext;

let snapR: THREE.WebGLRenderer | null = null;
let snapScene: THREE.Scene | null = null;
let snapCam: THREE.PerspectiveCamera | null = null;
const snapCache = new Map<string, string>();
const pending = new Map<string, Promise<string>>();

function cacheKey(cfg: CharacterConfig, mode: ThumbnailMode): string {
  return `${cfg.base}|${cfg.build}|${cfg.skin}|${cfg.hair}|${cfg.hairColor}|${cfg.outfit}|${mode}`;
}

export function getCharacterSnapshot(cfg: CharacterConfig, mode: ThumbnailMode): Promise<string> {
  if (!HAS_3D || !cfg) return Promise.resolve('');
  const key = cacheKey(cfg, mode);
  const cached = snapCache.get(key);
  if (cached) return Promise.resolve(cached);
  const inFlight = pending.get(key);
  if (inFlight) return inFlight;

  const promise = Promise.all([composeCharacter(cfg), loadAnimationClips()])
    .then(([{ group }, clips]) => {
      // Straight out of composeCharacter, the skeleton sits in its raw
      // bind pose (T-pose: arms out to the sides) - CharacterStage only
      // looks like a natural standing character because it separately
      // drives an AnimationMixer every frame. A thumbnail is a single
      // still render with no mixer, so without this it freezes on the
      // T-pose - wider than a standing pose, which is why it also reads
      // as smaller/lower within a frame sized for a normal stance.
      const idleClip = clips.find((c) => c.name === CLIPS.idle);
      if (idleClip) {
        const mixer = new THREE.AnimationMixer(group);
        mixer.clipAction(idleClip).play();
        // Frame 0 of this clip is a static T-pose reference frame, not the
        // actual idle stance (CharacterStage never shows a T-pose because
        // it always advances by a real, non-zero delta before any frame
        // is ever seen) - step past it into the real loop content.
        mixer.update(0.3);
      }
      if (!snapR) {
        snapR = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
        snapR.setPixelRatio(1);
        snapR.setSize(360, 360);
        snapR.setClearColor(0x000000, 0);
        snapR.outputColorSpace = THREE.SRGBColorSpace;
        snapScene = new THREE.Scene();
        addLights(snapScene, false);
        snapCam = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
      }
      const headY = 1.72;
      if (mode === 'portrait') {
        snapCam!.position.set(0, headY, 1.9);
        snapCam!.lookAt(0, headY - 0.03, 0);
      } else {
        snapCam!.position.set(0, 1.0, 5.0);
        snapCam!.lookAt(0, 1.0, 0);
      }
      group.rotation.y = mode === 'portrait' ? -0.25 : -0.35;
      snapScene!.add(group);
      snapR.render(snapScene!, snapCam!);
      const url = snapR.domElement.toDataURL('image/png');
      snapScene!.remove(group);
      snapCache.set(key, url);
      pending.delete(key);
      return url;
    })
    .catch(() => {
      pending.delete(key);
      return '';
    });
  pending.set(key, promise);
  return promise;
}
