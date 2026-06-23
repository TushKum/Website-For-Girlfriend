import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { lilySpriteTexture } from '../utils/lily';
import { handState } from '../store/handState';

/**
 * LilyShower.tsx
 *
 * While the user holds a prayer pose (palms together, fingers up — see
 * `handEngine`'s prayer detection), white lilies drift gently down from above,
 * tumbling and swaying like falling blossoms. The moment the pose releases,
 * spawning stops and the lilies already in the air finish their fall.
 *
 * A single pooled `InstancedMesh` (one draw call); all motion is plain
 * arithmetic in `useFrame`, no allocations in the hot path. Reads the mutable
 * `handState.praying` flag directly — never React state.
 */
const POOL = 120;
const SPAWN_INTERVAL = 0.13; // seconds between lily spawns while praying
const TOP_Y = 7.5;
const BOTTOM_Y = -8;

interface Petal {
  px: number; py: number; pz: number;
  vy: number; swayAmp: number; swayFreq: number; phase: number;
  size: number; spin: number; rot: number;
  active: boolean;
}

export default function LilyShower() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const cursor = useRef(0);
  const spawnTimer = useRef(0);

  const petals = useMemo<Petal[]>(
    () =>
      Array.from({ length: POOL }, () => ({
        px: 0, py: 0, pz: 0,
        vy: 0, swayAmp: 0, swayFreq: 0, phase: 0,
        size: 0, spin: 0, rot: 0,
        active: false,
      })),
    [],
  );

  // Subtle white→blush tint variety, and park everything off-screen initially.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const tint = new THREE.Color();
    for (let i = 0; i < POOL; i++) {
      tint.setHSL(0.95, 0.18 * Math.random(), 0.92); // near-white, faint blush
      mesh.setColorAt(i, tint);
      dummy.position.set(0, 0, -999);
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [dummy]);

  const spawnOne = () => {
    const p = petals[cursor.current];
    cursor.current = (cursor.current + 1) % POOL;
    p.px = (Math.random() - 0.5) * 20;
    p.py = TOP_Y + Math.random() * 1.5;
    p.pz = -1.5 + Math.random() * 4.5;
    p.vy = -(1.5 + Math.random() * 1.1); // falling
    p.swayAmp = 0.4 + Math.random() * 0.8;
    p.swayFreq = 0.6 + Math.random() * 0.9;
    p.phase = Math.random() * Math.PI * 2;
    p.size = 0.5 + Math.random() * 0.5;
    p.spin = (Math.random() - 0.5) * 1.6;
    p.rot = Math.random() * Math.PI;
    p.active = true;
  };

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    // Spawn while the prayer pose is held.
    if (handState.praying) {
      spawnTimer.current += dt;
      while (spawnTimer.current >= SPAWN_INTERVAL) {
        spawnTimer.current -= SPAWN_INTERVAL;
        spawnOne();
      }
    } else {
      spawnTimer.current = 0;
    }

    for (let i = 0; i < POOL; i++) {
      const p = petals[i];
      if (!p.active) continue;

      p.py += p.vy * dt;
      p.px += Math.sin(t * p.swayFreq + p.phase) * p.swayAmp * dt;
      p.rot += p.spin * dt;

      if (p.py < BOTTOM_Y) {
        p.active = false;
        dummy.position.set(0, 0, -999);
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        continue;
      }

      // Pop in at the top; fade (shrink) out near the bottom.
      const popIn = THREE.MathUtils.smoothstep(TOP_Y + 1.6 - p.py, 0, 1.2);
      const fadeOut = THREE.MathUtils.smoothstep(p.py - BOTTOM_Y, 0, 2);
      const scale = p.size * popIn * fadeOut;

      dummy.position.set(p.px, p.py, p.pz);
      // Gentle 3D flutter as it tumbles.
      dummy.rotation.set(
        Math.sin(t * 1.1 + p.phase) * 0.5,
        Math.cos(t * 0.9 + p.phase) * 0.5,
        p.rot,
      );
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, POOL]} frustumCulled={false}>
      <meshBasicMaterial
        map={lilySpriteTexture()}
        transparent
        opacity={0.96}
        depthWrite={false}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
