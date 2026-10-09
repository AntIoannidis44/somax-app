import * as THREE from 'three';
import { addLights } from './characterBuilder';
import { CLIPS, composeCharacter, fitClipsToCharacter, loadAnimationClips } from './characterModels';
import type { CharacterConfig } from '../types';

export type ThumbnailMode = 'full' | 'portrait' | 'head';

const HAS_3D = typeof window !== 'undefined' && !!window.WebGLRenderingContext;

let snapR: THREE.WebGLRenderer | null = null;
let snapScene: THREE.Scene | null = null;
let snapCam: THREE.PerspectiveCamera | null = null;
const snapCache = new Map<string, string>();
const pending = new Map<string, Promise<string>>();

function cacheKey(cfg: CharacterConfig, mode: ThumbnailMode): string {
  return `${cfg.base}|${cfg.build}|${cfg.skin}|${cfg.hair}|${cfg.hairColor}|${cfg.outfit}|${cfg.outfitColor}|${cfg.top ?? ''}|${cfg.bottom ?? ''}|${cfg.shoes ?? ''}|${mode}`;
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
      const idleClip = fitClipsToCharacter(clips, group).find((c) => c.name === CLIPS.idle);
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
      // Portrait is a front-on shoulders-up shot: the camera sits level with
      // the head and aims at the upper chest so head and shoulders fill the frame.
      // Head: tight close-up for the hair pickers - just the head and hair, no torso.
      if (mode === 'head') {
        snapCam!.position.set(0, 1.64, 1.1);
        snapCam!.lookAt(0, 1.64, 0);
      } else if (mode === 'portrait') {
        snapCam!.position.set(0, 1.4, 1.85);
        snapCam!.lookAt(0, 1.4, 0);
      } else {
        // Full body: centre the frame on the whole figure (feet at y=0, top of
        // head ~1.85) so nothing is cropped and no empty space sits above it.
        snapCam!.position.set(0, 0.9, 4.5);
        snapCam!.lookAt(0, 0.9, 0);
      }
      group.rotation.y = mode === 'full' ? -0.35 : 0;
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
