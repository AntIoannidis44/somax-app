import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type * as THREE from 'three';
import { addLights, buildCharacter, disposeGroup, type CharacterStyle } from '../../lib/characterBuilder';
import { Pedestal } from './Pedestal';
import { useAppStore } from '../../store/useAppStore';
import { currentStyle } from '../../lib/characterThumbnail';
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

interface CharacterRigProps {
  cfg: CharacterConfig;
  style: CharacterStyle;
  view: StageView;
  anim: StageAnim;
  rotRef: React.MutableRefObject<number>;
  velRef: React.MutableRefObject<number>;
  draggingRef: React.MutableRefObject<boolean>;
  idleTRef: React.MutableRefObject<number>;
  jumpTRef: React.MutableRefObject<number>;
}

function CharacterRig({ cfg, style, view, anim, rotRef, velRef, draggingRef, idleTRef, jumpTRef }: CharacterRigProps) {
  const key = `${style}|${JSON.stringify(cfg)}`;
  const group = useMemo(() => buildCharacter(cfg, style), [key]);
  useEffect(() => () => disposeGroup(group), [group]);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    const dt = Math.min(0.05, delta);
    timeRef.current += dt;
    const g = group;

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
    g.rotation.y = rotRef.current;

    let jy = 0;
    let sy = 1;
    if (jumpTRef.current >= 0) {
      jumpTRef.current += dt;
      const p = jumpTRef.current / 0.62;
      if (p >= 1) {
        jumpTRef.current = -1;
      } else {
        jy = Math.sin(p * Math.PI) * 0.42;
        sy = 1 + Math.sin(p * Math.PI) * 0.05;
      }
    }

    const ud = g.userData as Record<string, THREE.Object3D | undefined>;
    if (anim === 'run') {
      const ph = timeRef.current * 7.2;
      const sw = Math.sin(ph) * 0.78;
      if (ud.legL && ud.legR) {
        ud.legL.rotation.x = sw;
        ud.legR.rotation.x = -sw;
      }
      if (ud.armL && ud.armR) {
        ud.armL.rotation.x = -sw * 0.85;
        ud.armR.rotation.x = sw * 0.85;
        ud.armL.rotation.z = -0.3;
        ud.armR.rotation.z = 0.3;
      }
      g.position.y = Math.abs(Math.cos(ph)) * 0.07 + jy;
      g.rotation.x = 0.07;
      if (ud.head) {
        ud.head.rotation.y = Math.sin(timeRef.current * 0.9) * 0.05;
        ud.head.rotation.x = -0.05;
      }
    } else {
      if (ud.legL && ud.legR) {
        ud.legL.rotation.x = 0;
        ud.legR.rotation.x = 0;
      }
      g.position.y = Math.sin(timeRef.current * 2.1) * 0.012 + jy;
      g.rotation.x = 0;
      const sway = Math.sin(timeRef.current * 2.1) * 0.03;
      if (ud.armL && ud.armR) {
        ud.armL.rotation.x = 0;
        ud.armR.rotation.x = 0;
        ud.armL.rotation.z = -0.22 - sway - jy * 0.9;
        ud.armR.rotation.z = 0.22 + sway + jy * 0.9;
      }
      if (ud.head) {
        ud.head.rotation.y = Math.sin(timeRef.current * 0.9) * 0.08;
        ud.head.rotation.x = 0;
      }
    }
    g.scale.set(1 / Math.sqrt(sy), sy, 1 / Math.sqrt(sy));
    if (ud.aura) {
      ud.aura.rotation.y = -timeRef.current * 0.7;
      ud.aura.children.forEach((p) => {
        p.position.y = 1.15 + Math.sin(timeRef.current * 2.4 + (p.userData.phase as number) * 2) * 0.22;
      });
    }
  });

  return <primitive object={group} />;
}

export function CharacterStage({ view, anim }: CharacterStageProps) {
  const character = useAppStore((s) => s.character);
  const displayMode = useAppStore((s) => s.mode);
  const level = useAppStore((s) => s.progress.level);
  const style = currentStyle(displayMode);

  const rotRef = useRef(view === 'arena' ? -0.22 : -0.3);
  const velRef = useRef(0);
  const draggingRef = useRef(false);
  const movedRef = useRef(0);
  const lastXRef = useRef(0);
  const idleTRef = useRef(0);
  const jumpTRef = useRef(-1);

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
        if (movedRef.current < 5) jumpTRef.current = 0;
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
          style={style}
          view={view}
          anim={anim}
          rotRef={rotRef}
          velRef={velRef}
          draggingRef={draggingRef}
          idleTRef={idleTRef}
          jumpTRef={jumpTRef}
        />
        <Pedestal level={level} />
      </Canvas>
    </div>
  );
}
