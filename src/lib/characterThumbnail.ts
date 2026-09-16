import * as THREE from 'three';
import { addLights, buildCharacter, disposeGroup, type CharacterStyle } from './characterBuilder';
import type { CharacterConfig, DisplayMode } from '../types';

export type ThumbnailMode = 'full' | 'portrait';

export function currentStyle(mode: DisplayMode): CharacterStyle {
  return mode === 'character' ? 'toon' : 'real';
}

const HAS_3D = typeof window !== 'undefined' && !!window.WebGLRenderingContext;

let snapR: THREE.WebGLRenderer | null = null;
let snapScene: THREE.Scene | null = null;
let snapCam: THREE.PerspectiveCamera | null = null;
const snapCache = new Map<string, string>();

export function getCharacterSnapshot(cfg: CharacterConfig, mode: ThumbnailMode, style: CharacterStyle): string {
  if (!HAS_3D || !cfg) return '';
  const key = `${style}|${mode}|${JSON.stringify(cfg)}`;
  const cached = snapCache.get(key);
  if (cached) return cached;
  try {
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
    const headY = style === 'toon' ? 1.86 : 1.96;
    if (mode === 'portrait') {
      snapCam!.position.set(0, headY, style === 'toon' ? 2.75 : 2.35);
      snapCam!.lookAt(0, headY - 0.03, 0);
    } else {
      snapCam!.position.set(0, 1.12, 5.6);
      snapCam!.lookAt(0, 1.1, 0);
    }
    const g = buildCharacter(cfg, style);
    g.rotation.y = mode === 'portrait' ? -0.25 : -0.35;
    snapScene!.add(g);
    snapR.render(snapScene!, snapCam!);
    const url = snapR.domElement.toDataURL('image/png');
    snapScene!.remove(g);
    disposeGroup(g);
    snapCache.set(key, url);
    return url;
  } catch {
    return '';
  }
}
