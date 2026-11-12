import * as THREE from 'three';
import { addLights } from './characterBuilder';
import { CLIPS, composeCharacter, fitClipsToCharacter, loadAnimationClips } from './characterModels';
import type { CharacterConfig } from '../types';

export type ThumbnailMode = 'full' | 'portrait' | 'head' | 'torso' | 'legs' | 'feet';

const HAS_3D = typeof window !== 'undefined' && !!window.WebGLRenderingContext;

let snapR: THREE.WebGLRenderer | null = null;
let snapScene: THREE.Scene | null = null;
let snapCam: THREE.PerspectiveCamera | null = null;
const snapCache = new Map<string, string>();
const pending = new Map<string, Promise<string>>();

// Opening the Studio (or switching tabs there) can request a dozen-plus
// thumbnails at once, each for a different, uncached config. composeCharacter()
// clones and re-skins geometry synchronously, and the render()+toDataURL()
// PNG encode after it is also synchronous - with every tile's effect firing
// on mount, several of these full pipelines land in the same microtask burst
// and run back to back with no chance for the browser to paint in between,
// felt as a freeze right when the screen opens. This queue runs only one
// job at a time, each on its own animation frame, so the work is spread out
// instead of landing in one block.
const renderQueue: (() => Promise<void>)[] = [];
let renderQueueRunning = false;
function scheduleRender(job: () => Promise<void>): Promise<void> {
  return new Promise((resolve) => {
    renderQueue.push(() => job().then(resolve));
    if (renderQueueRunning) return;
    renderQueueRunning = true;
    function drain() {
      requestAnimationFrame(async () => {
        const next = renderQueue.shift();
        if (next) await next();
        if (renderQueue.length) drain();
        else renderQueueRunning = false;
      });
    }
    drain();
  });
}

function cfgKey(cfg: CharacterConfig): string {
  return `${cfg.base}|${cfg.build}|${cfg.skin}|${cfg.hair}|${cfg.hairColor}|${cfg.outfit}|${cfg.outfitColor}|${cfg.top ?? ''}|${cfg.bottom ?? ''}|${cfg.shoes ?? ''}|${cfg.legwear ?? ''}|${(cfg.acc ?? []).join(',')}|${cfg.topColor ?? 0}|${cfg.bottomColor ?? 0}|${cfg.shoesColor ?? 0}`;
}

function cacheKey(cfg: CharacterConfig, mode: ThumbnailMode): string {
  return `${cfgKey(cfg)}|${mode}`;
}

// Profile (portrait avatar + full-body hero) and friends' profile cards
// both ask for two different camera modes of the *same* character within
// the same mount - composeCharacter() (clone + re-skin the mesh) is the
// expensive half of a render, and redoing it per mode meant the second
// shot always paid full price again, on top of just waiting its turn in
// the queue below. Shared per exact config, reference-counted so it's
// only kept alive while something's still actively using it - not a
// growing cache of every character anyone's ever previewed.
const composedCache = new Map<string, Promise<{ group: THREE.Group }>>();
const composedRefs = new Map<string, number>();

function acquireComposedGroup(cfg: CharacterConfig): Promise<THREE.Group> {
  const key = cfgKey(cfg);
  let promise = composedCache.get(key);
  if (!promise) {
    promise = (async () => {
      const [{ group }, clips] = await Promise.all([composeCharacter(cfg), loadAnimationClips()]);
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
      return { group };
    })();
    composedCache.set(key, promise);
  }
  composedRefs.set(key, (composedRefs.get(key) ?? 0) + 1);
  return promise.then(({ group }) => group);
}

function releaseComposedGroup(cfg: CharacterConfig) {
  const key = cfgKey(cfg);
  const left = (composedRefs.get(key) ?? 1) - 1;
  if (left <= 0) {
    composedRefs.delete(key);
    composedCache.delete(key);
  } else {
    composedRefs.set(key, left);
  }
}

// Portrait is a front-on shoulders-up shot: the camera sits level with the
// head and aims at the upper chest so head and shoulders fill the frame.
// Head: tight close-up for the hair pickers - just the head and hair, no
// torso. Close-ups for the clothing pickers are framed from this body's own
// bones (builds differ in height): chest to hips for tops, waist to ankles
// for bottoms, both feet from slightly above for shoes. Full body centres
// the frame on the whole figure (feet at y=0, top of head ~1.85) so nothing
// is cropped and no empty space sits above it.
function renderGroup(group: THREE.Group, mode: ThumbnailMode): string {
  if (!snapR) {
    // Every real consumer displays this at 170px or smaller (char-card-
    // figure's 132x170 full-body hero is the largest) - 360px backing
    // resolution was paying full antialiased-render + PNG-encode cost for
    // 4x more pixels than anything on screen ever uses, which is most of
    // why a burst of several uncached configs (Home's Unlocks rail asking
    // for 6 at once) read as laggy rather than just queued-and-spread-out.
    snapR = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    snapR.setPixelRatio(1);
    snapR.setSize(240, 240);
    snapR.setClearColor(0x000000, 0);
    snapR.outputColorSpace = THREE.SRGBColorSpace;
    snapScene = new THREE.Scene();
    addLights(snapScene, false);
    snapCam = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
  }
  group.rotation.y = mode === 'full' || mode === 'legs' || mode === 'feet' ? -0.35 : mode === 'torso' ? -0.25 : 0;
  if (mode === 'head') {
    snapCam!.position.set(0, 1.64, 1.1);
    snapCam!.lookAt(0, 1.64, 0);
  } else if (mode === 'torso' || mode === 'legs' || mode === 'feet') {
    group.updateMatrixWorld(true);
    const at = (name: string) => group.getObjectByName(name)?.getWorldPosition(new THREE.Vector3()) ?? new THREE.Vector3();
    const y = (name: string) => at(name).y;
    if (mode === 'torso') {
      const c = (y('neck_01') + y('pelvis')) / 2;
      snapCam!.position.set(0, c + 0.05, 1.75);
      snapCam!.lookAt(0, c, 0);
    } else if (mode === 'legs') {
      const c = (y('pelvis') + y('foot_l')) / 2 - 0.03;
      snapCam!.position.set(0, c + 0.1, 2.65);
      snapCam!.lookAt(0, c, 0);
    } else {
      const c = ['foot_l', 'foot_r', 'ball_l', 'ball_r'].reduce((sum, n) => sum.add(at(n)), new THREE.Vector3()).multiplyScalar(0.25);
      snapCam!.position.set(c.x, 0.66, c.z + 1.8);
      snapCam!.lookAt(c.x, 0.07, c.z + 0.04);
    }
  } else if (mode === 'portrait') {
    snapCam!.position.set(0, 1.4, 1.85);
    snapCam!.lookAt(0, 1.4, 0);
  } else {
    snapCam!.position.set(0, 0.9, 4.5);
    snapCam!.lookAt(0, 0.9, 0);
  }
  snapScene!.add(group);
  snapR.render(snapScene!, snapCam!);
  const url = snapR.domElement.toDataURL('image/png');
  snapScene!.remove(group);
  return url;
}

export function getCharacterSnapshot(cfg: CharacterConfig, mode: ThumbnailMode): Promise<string> {
  if (!HAS_3D || !cfg) return Promise.resolve('');
  const key = cacheKey(cfg, mode);
  const cached = snapCache.get(key);
  if (cached) return Promise.resolve(cached);
  const inFlight = pending.get(key);
  if (inFlight) return inFlight;

  let resolvedUrl = '';
  const promise = scheduleRender(async () => {
    const group = await acquireComposedGroup(cfg);
    try {
      resolvedUrl = renderGroup(group, mode);
      snapCache.set(key, resolvedUrl);
    } finally {
      releaseComposedGroup(cfg);
    }
  })
    .then(() => resolvedUrl)
    .catch(() => '')
    .finally(() => {
      pending.delete(key);
    });
  pending.set(key, promise);
  return promise;
}
