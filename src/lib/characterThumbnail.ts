import * as THREE from 'three';
import { addLights } from './characterBuilder';
import { cloneCharacter, loadCharacterTemplate } from './characterModels';
import type { CharacterConfig } from '../types';

export type ThumbnailMode = 'full' | 'portrait';

const HAS_3D = typeof window !== 'undefined' && !!window.WebGLRenderingContext;

let snapR: THREE.WebGLRenderer | null = null;
let snapScene: THREE.Scene | null = null;
let snapCam: THREE.PerspectiveCamera | null = null;
const snapCache = new Map<string, string>();
const pending = new Map<string, Promise<string>>();

export function getCharacterSnapshot(cfg: CharacterConfig, mode: ThumbnailMode): Promise<string> {
  if (!HAS_3D || !cfg) return Promise.resolve('');
  const key = `${cfg.base}|${mode}`;
  const cached = snapCache.get(key);
  if (cached) return Promise.resolve(cached);
  const inFlight = pending.get(key);
  if (inFlight) return inFlight;

  const promise = loadCharacterTemplate(cfg.base)
    .then((template) => {
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
      const g = cloneCharacter(template);
      g.rotation.y = mode === 'portrait' ? -0.25 : -0.35;
      snapScene!.add(g);
      snapR.render(snapScene!, snapCam!);
      const url = snapR.domElement.toDataURL('image/png');
      snapScene!.remove(g);
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
