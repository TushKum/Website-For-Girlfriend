import { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { heartGeometry } from '../utils/heart';
import { drainBursts } from '../store/handState';
import { ndcToWorldAtZ } from '../vision/coords';
import { HAND_PLANE_Z } from './sceneConfig';

/**
 * HeartBurst.tsx
 *
 * A pool of 3D hearts that erupt from the user's hand when they move it
 * quickly. The hand engine queues burst events (in NDC); here we map each to
 * world space at the hand's depth plane and spray a handful of hearts with
 * randomised upward/outward velocities, buoyancy, spin, and a pop-in/shrink-out
 * life curve.
 *
 * One `InstancedMesh` (single draw call) holds the whole pool; dead hearts are
 * parked at zero scale. All particle integration is plain arithmetic in
 * `useFrame` — no allocations in the hot path.
 */
const POOL = 300;
const PER_BURST = 11;

interface Particle {
  px: number; py: number; pz: number;
  vx: number; vy: number; vz: number;
  age: number; life: number;
  base: number; spin: number; rot: number;
}

export default function HeartBurst() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const camera = useThree((s) => s.camera);

  const geometry = useMemo(() => heartGeometry(), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const scratch = useMemo(() => new THREE.Vector3(), []);
  const cursor = useRef(0);

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: POOL }, () => ({
        px: 0, py: 0, pz: 0, vx: 0, vy: 0, vz: 0,
        age: 0, life: 0, base: 0, spin: 0, rot: 0,
      })),
    [],
  );

  // Seed varied pink tints once, and park every heart out of sight.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const tint = new THREE.Color();
    for (let i = 0; i < POOL; i++) {
      tint.setHSL(0.95 + Math.random() * 0.06, 0.75, 0.72); // soft pinks/roses
      mesh.setColorAt(i, tint);
      dummy.position.set(0, 0, -999);
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [dummy]);

  const spawn = (wx: number, wy: number, wz: number, power = 1) => {
    const count = Math.round(PER_BURST * power);
    for (let k = 0; k < count; k++) {
      const p = particles[cursor.current];
      cursor.current = (cursor.current + 1) % POOL;

      const ang = Math.random() * Math.PI * 2;
      // A clap (power > 1) throws hearts wider and a touch higher.
      const spread = (0.6 + Math.random() * 1.4) * (1 + (power - 1) * 0.35);
      p.px = wx + (Math.random() - 0.5) * 0.3;
      p.py = wy + (Math.random() - 0.5) * 0.3;
      p.pz = wz + (Math.random() - 0.5) * 0.3;
      p.vx = Math.cos(ang) * spread;
      p.vy = 0.8 + Math.random() * 1.6 + (power - 1) * 0.3; // mostly upward
      p.vz = Math.sin(ang) * spread * 0.5;
      p.age = 0;
      p.life = 0.9 + Math.random() * 0.7;
      p.base = 0.14 + Math.random() * 0.16;
      p.spin = (Math.random() - 0.5) * 4;
      p.rot = Math.random() * Math.PI;
    }
  };

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Turn any queued flicks into fresh bursts at the hand's world position.
    const bursts = drainBursts();
    for (const b of bursts) {
      ndcToWorldAtZ(b.x, b.y, camera, HAND_PLANE_Z, scratch);
      spawn(scratch.x, scratch.y, scratch.z, b.power);
    }

    // Integrate every live particle.
    const dt = Math.min(delta, 0.05); // clamp huge frames (tab refocus)
    for (let i = 0; i < POOL; i++) {
      const p = particles[i];
      if (p.age >= p.life) continue;

      p.age += dt;
      if (p.age >= p.life) {
        dummy.position.set(0, 0, -999);
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        continue;
      }

      // Buoyant rise + drag.
      p.vy += 1.4 * dt;
      p.vx *= 0.97;
      p.vz *= 0.97;
      p.px += p.vx * dt;
      p.py += p.vy * dt;
      p.pz += p.vz * dt;
      p.rot += p.spin * dt;

      const t = p.age / p.life;
      const popIn = THREE.MathUtils.smoothstep(t, 0, 0.16);
      const popOut = 1 - THREE.MathUtils.smoothstep(t, 0.55, 1);
      const scale = p.base * popIn * popOut;

      dummy.position.set(p.px, p.py, p.pz);
      dummy.rotation.set(0, 0, p.rot);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, POOL]} frustumCulled={false}>
      <meshBasicMaterial
        transparent
        opacity={0.95}
        depthWrite={false}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
