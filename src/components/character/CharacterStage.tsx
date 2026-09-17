import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { addLights } from '../../lib/characterBuilder';
import { CLIPS, composeCharacter, loadAnimationClips } from '../../lib/characterModels';
import { Pedestal } from './Pedestal';
import { useAppStore } from '../../store/useAppStore';
import type { CharacterConfig } from '../../types';

export type StageView = 'arena' | 'studio';
export type StageAnim = 'idle' | 'run';

interface CharacterStageProps {
  view: StageView;
  anim: StageAnim;
}

function Lights() {
  const { scene } = useThree();
  useEffect(() => {
    addLights(scene, true);
  }, [scene]);
  return null;
}

function CameraRig({ view }: { view: StageView }) {
  const { camera } = useThree();
  useEffect(() => {
    if (view === 'arena') {
      camera.position.set(0, 1.75, 8.5);
      camera.lookAt(0, 1.4, 0);
    } else {
      camera.position.set(0, 1.45, 6.1);
      camera.lookAt(0, 1.02, 0);
    }
  }, [view, camera]);
  return null;
}

interface Loaded {
  scene: THREE.Group;
  mixer: THREE.AnimationMixer;
  actions: Partial<Record<keyof typeof CLIPS, THREE.AnimationAction>>;
}

interface CharacterRigProps {
  cfg: CharacterConfig;
  view: StageView;
  anim: StageAnim;
  rotRef: React.MutableRefObject<number>;
  velRef: React.MutableRefObject<number>;
  draggingRef: React.MutableRefObject<boolean>;
  idleTRef: React.MutableRefObject<number>;
  flexUntilRef: React.MutableRefObject<number>;
}

function CharacterRig({ cfg, view, anim, rotRef, velRef, draggingRef, idleTRef, flexUntilRef }: CharacterRigProps) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const timeRef = useRef(0);
  const activeClipRef = useRef<keyof typeof CLIPS | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoaded(null);
    Promise.all([composeCharacter(cfg), loadAnimationClips()]).then(([composed, clips]) => {
      if (cancelled) return;
      const scene = composed.group;
      const mixer = new THREE.AnimationMixer(scene);
      const actions: Loaded['actions'] = {};
      (Object.keys(CLIPS) as (keyof typeof CLIPS)[]).forEach((key) => {
        const clip = clips.find((c) => c.name === CLIPS[key]);
        if (clip) actions[key] = mixer.clipAction(clip);
      });
      activeClipRef.current = null;
      setLoaded({ scene, mixer, actions });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.base, cfg.build, cfg.skin, cfg.hair, cfg.hairColor, cfg.outfit]);

  useFrame((_, delta) => {
    const dt = Math.min(0.05, delta);
    timeRef.current += dt;
    if (!loaded) return;
    const { scene, mixer, actions } = loaded;

    if (!draggingRef.current) {
      rotRef.current += velRef.current;
      velRef.current *= 0.92;
      if (view === 'arena') {
        rotRef.current += (-0.22 - rotRef.current) * Math.min(1, dt * 1.6);
      } else {
        idleTRef.current += dt;
        if (idleTRef.current > 2.2) rotRef.current += dt * 0.28;
      }
    }
    scene.rotation.y = rotRef.current;

    const flexing = flexUntilRef.current > performance.now() / 1000;
    const wantClip: keyof typeof CLIPS = flexing ? 'flex' : anim;
    if (activeClipRef.current !== wantClip) {
      const prev = activeClipRef.current ? actions[activeClipRef.current] : undefined;
      const next = actions[wantClip] ?? actions.idle;
      prev?.fadeOut(0.25);
      next?.reset().fadeIn(0.25).play();
      activeClipRef.current = wantClip;
    }
    mixer.update(dt);
  });

  if (!loaded) return null;
  return <primitive object={loaded.scene} />;
}

export function CharacterStage({ view, anim }: CharacterStageProps) {
  const character = useAppStore((s) => s.character);
  const level = useAppStore((s) => s.progress.level);

  const rotRef = useRef(view === 'arena' ? -0.22 : -0.3);
  const velRef = useRef(0);
  const draggingRef = useRef(false);
  const movedRef = useRef(0);
  const lastXRef = useRef(0);
  const idleTRef = useRef(0);
  const flexUntilRef = useRef(-1);

  if (!character) return null;

  return (
    <div
      className="stage-canvas"
      style={{ position: 'absolute', inset: 0, zIndex: 1 }}
      onPointerDown={(e) => {
        draggingRef.current = true;
        lastXRef.current = e.clientX;
        movedRef.current = 0;
        velRef.current = 0;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!draggingRef.current) return;
        const dx = e.clientX - lastXRef.current;
        lastXRef.current = e.clientX;
        movedRef.current += Math.abs(dx);
        rotRef.current += dx * 0.012;
        velRef.current = dx * 0.012;
        idleTRef.current = 0;
      }}
      onPointerUp={() => {
        if (!draggingRef.current) return;
        draggingRef.current = false;
        if (movedRef.current < 5) flexUntilRef.current = performance.now() / 1000 + 2.4;
      }}
      onPointerCancel={() => {
        draggingRef.current = false;
      }}
    >
      <Canvas
        shadows
        gl={{ alpha: true, antialias: true }}
        camera={{ fov: 27, near: 0.1, far: 60 }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <Lights />
        <CameraRig view={view} />
        <CharacterRig
          cfg={character}
          view={view}
          anim={anim}
          rotRef={rotRef}
          velRef={velRef}
          draggingRef={draggingRef}
          idleTRef={idleTRef}
          flexUntilRef={flexUntilRef}
        />
        <Pedestal level={level} />
      </Canvas>
    </div>
  );
}
