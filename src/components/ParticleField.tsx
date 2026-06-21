import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getDustTexture } from '../utils/textures';

/**
 * ParticleField.tsx
 *
 * A subtle field of glowing amber/gold dust motes drifting lazily through the
 * space behind the globe — the cinematic, magical atmosphere.
 *
 * Implementation notes:
 *  - A single <points> with a BufferGeometry of `COUNT` vertices: one draw
 *    call, GPU-cheap.
 *  - Motes are seeded in a spherical shell *around* the globe so they read as
 *    depth, never as a flat sheet.
 *  - Each mote carries a random phase; every frame we offset its base position
 *    by a small sine bob (organic float, no drift accumulation) and rotate the
 *    whole field almost imperceptibly.
 *  - Additive blending + depthWrite:false makes them glow and avoids any
 *    transparency-sorting artefacts.
 */
const COUNT = 700;

export default function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);

  // Seed positions + per-mote animation data once.
  const { positions, basePositions, phases } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const basePositions = new Float32Array(COUNT * 3);
    const phases = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      // Distribute in a spherical shell (radius 6–16) using rejection-free
      // spherical coordinates so density feels even and volumetric.
      const r = 6 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);

      positions.set([x, y, z], i * 3);
      basePositions.set([x, y, z], i * 3);
      phases[i] = Math.random() * Math.PI * 2;
    }

    return { positions, basePositions, phases };
  }, []);

  const dustTexture = useMemo(() => getDustTexture(), []);

  useFrame((state) => {
    const points = pointsRef.current;
    if (!points) return;

    const t = state.clock.elapsedTime;
    const arr = points.geometry.attributes.position.array as Float32Array;

    // Lazy vertical bob per mote — tiny amplitude, slow frequency.
    for (let i = 0; i < COUNT; i++) {
      const iy = i * 3 + 1;
      arr[iy] = basePositions[iy] + Math.sin(t * 0.25 + phases[i]) * 0.35;
    }
    points.geometry.attributes.position.needsUpdate = true;

    // Whole field rotates almost imperceptibly for parallax depth.
    points.rotation.y = t * 0.012;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={dustTexture}
        color="#ffba6b"
        size={0.22}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}
