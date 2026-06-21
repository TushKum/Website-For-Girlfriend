import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MEMORIES } from '../data/memories';
import type { PositionedMemory } from '../types/memory';
import { fibonacciSphere } from '../utils/fibonacciSphere';
import { useMemoryStore, selectIsIdle } from '../store/useMemoryStore';
import PhotoPlane from './PhotoPlane';

/** Globe radius — tuned so 24 portrait cards breathe without overlapping. */
export const GLOBE_RADIUS = 3.0;
/** Base gentle spin speed, in radians/second. */
const BASE_SPIN = 0.12;

/**
 * PhotoGlobe.tsx
 *
 * The rotating sphere of memories.
 *
 *  - Distributes all 24 memories across the sphere with the Fibonacci
 *    algorithm, attaching each computed position to its memory.
 *  - Spins gently and continuously on the Y axis using delta-time so the
 *    motion is identical at any frame-rate.
 *  - Eases its spin to a smooth stop whenever the user is hovering a card or
 *    reading a memory, then eases back up when idle — never an abrupt cut.
 */
export default function PhotoGlobe() {
  const groupRef = useRef<THREE.Group>(null);
  /** Current (smoothed) angular velocity — lerped toward the target each frame. */
  const spinRef = useRef(BASE_SPIN);

  const isIdle = useMemoryStore(selectIsIdle);

  // Pair every memory with its Fibonacci-sphere position (computed once).
  const positioned = useMemo<PositionedMemory[]>(() => {
    const points = fibonacciSphere(MEMORIES.length, GLOBE_RADIUS);
    return MEMORIES.map((memory, i) => ({
      ...memory,
      position: [points[i].x, points[i].y, points[i].z],
    }));
  }, []);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    // Ease the spin speed toward its target (full speed when idle, 0 when the
    // user is engaged). Exponential smoothing keeps it buttery.
    const targetSpin = isIdle ? BASE_SPIN : 0;
    spinRef.current = THREE.MathUtils.damp(spinRef.current, targetSpin, 4, delta);

    group.rotation.y += spinRef.current * delta;
  });

  return (
    <group ref={groupRef}>
      {positioned.map((memory) => (
        <PhotoPlane key={memory.id} memory={memory} />
      ))}
    </group>
  );
}
