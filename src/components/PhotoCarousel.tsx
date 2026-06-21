import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { MEMORIES } from '../data/memories';
import { handState } from '../store/handState';
import { pointerState } from '../store/pointerState';
import { useMemoryStore } from '../store/useMemoryStore';
import PolaroidCard from './PolaroidCard';

/** Rotation feel. */
const AUTO_SPIN = 0.05; // idle drift (rad/s)
const PINCH_GAIN = 3.6; // hand-sweep → rotation
const MOUSE_GAIN = 0.006; // drag px → rotation
const SPIN_DAMP = 1.6; // how fast inertia settles back to the drift
const DRAG_SLOP = 6; // px before a press counts as a drag (not a click)

/** Open-palm "pull toward me". */
const PULL_Z = 2.4;
const PULL_SCALE = 1.16;

/**
 * PhotoCarousel.tsx
 *
 * The central rotating ring of frosted polaroids and the home of all carousel
 * interaction. A single angular-velocity model unifies every input:
 *
 *  - PINCH-GRAB: while pinching, the ring follows the hand's horizontal sweep;
 *    releasing hands off the last speed as momentum (luxury-bezel inertia).
 *  - MOUSE DRAG: the no-webcam fallback, feeding the exact same velocity model.
 *  - IDLE: velocity eases back to a gentle auto-drift.
 *  - OPEN PALM: the whole ring glides toward the camera and scales up.
 *
 * When a memory modal is open the ring rests, then resumes when it closes.
 */
export default function PhotoCarousel() {
  const groupRef = useRef<THREE.Group>(null);
  const gl = useThree((s) => s.gl);

  const selected = useMemoryStore((s) => s.selected);

  // Rotation state (refs → no re-renders).
  const angVel = useRef(AUTO_SPIN);
  const prevPinchX = useRef<number | null>(null);
  const wasPinching = useRef(false);

  // ── Mouse-drag fallback ────────────────────────────────────────────────
  useEffect(() => {
    const el = gl.domElement;
    let lastX = 0;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      pointerState.dragging = true;
      pointerState.moved = false;
      pointerState.dx = 0;
      lastX = e.clientX;
    };
    const onMove = (e: PointerEvent) => {
      if (!pointerState.dragging) return;
      const mdx = e.clientX - lastX;
      lastX = e.clientX;
      pointerState.dx += mdx;
      if (Math.abs(pointerState.dx) > DRAG_SLOP) pointerState.moved = true;
    };
    const onUp = () => {
      pointerState.dragging = false;
    };

    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const dt = Math.min(delta, 0.05);
    const frozen = selected !== null;

    // ── Open-palm pull + scale ────────────────────────────────────────────
    const pull = !frozen && handState.present && handState.openPalm;
    group.position.z = THREE.MathUtils.damp(group.position.z, pull ? PULL_Z : 0, 4, dt);
    const sc = THREE.MathUtils.damp(group.scale.x, pull ? PULL_SCALE : 1, 4, dt);
    group.scale.setScalar(sc);

    // ── Rotation ─────────────────────────────────────────────────────────
    let rotDelta = 0;
    const pinching = !frozen && handState.present && handState.pinch;

    if (frozen) {
      angVel.current = THREE.MathUtils.damp(angVel.current, 0, 3, dt);
      rotDelta = angVel.current * dt;
      wasPinching.current = false;
    } else if (pinching) {
      // Begin a grab without snapping.
      if (!wasPinching.current) prevPinchX.current = handState.ndcX;
      const dxn = handState.ndcX - (prevPinchX.current ?? handState.ndcX);
      prevPinchX.current = handState.ndcX;
      rotDelta = dxn * PINCH_GAIN;
      angVel.current = rotDelta / Math.max(dt, 1e-3); // carry as momentum
      wasPinching.current = true;
    } else {
      wasPinching.current = false;
      if (pointerState.dragging && pointerState.dx !== 0) {
        rotDelta = pointerState.dx * MOUSE_GAIN;
        angVel.current = rotDelta / Math.max(dt, 1e-3);
      } else {
        // Inertia eases back toward the gentle idle drift.
        angVel.current = THREE.MathUtils.damp(angVel.current, AUTO_SPIN, SPIN_DAMP, dt);
        rotDelta = angVel.current * dt;
      }
      pointerState.dx = 0;
    }

    group.rotation.y += rotDelta;
  });

  return (
    <group ref={groupRef}>
      {MEMORIES.map((memory, i) => (
        <PolaroidCard key={memory.id} memory={memory} index={i} total={MEMORIES.length} />
      ))}
    </group>
  );
}
