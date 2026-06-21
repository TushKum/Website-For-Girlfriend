import { useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useMemoryStore } from '../store/useMemoryStore';

/** How far in front of a focused card the camera settles (world units). */
const FOCUS_GAP = 3.6;
/** Smoothing rate for the camera move — low = weighty and cinematic. */
const LERP_LAMBDA = 3.2;
/** When this close to the restore target we hand control back to the user. */
const SETTLE_EPS = 0.02;

interface CameraRigProps {
  controlsRef: RefObject<OrbitControlsImpl | null>;
}

/**
 * CameraRig.tsx
 *
 * Owns the cinematic camera choreography for the memory reveal.
 *
 *  - On SELECT: remembers the user's current viewpoint, disables OrbitControls,
 *    and gently lerps the camera to frame the chosen card head-on (looking
 *    straight down its outward normal).
 *  - On CLOSE: lerps the camera back to exactly where the user was, then hands
 *    control cleanly back to OrbitControls and lets the globe resume spinning.
 *
 * It never fights OrbitControls: while animating, controls are disabled and we
 * drive `camera.position` + `controls.target` ourselves, calling `update()` so
 * the controls' internal state stays in perfect sync for a seamless handoff.
 */
export default function CameraRig({ controlsRef }: CameraRigProps) {
  const camera = useThree((s) => s.camera);

  const selected = useMemoryStore((s) => s.selected);
  const focusPoint = useMemoryStore((s) => s.focusPoint);

  // Animation bookkeeping.
  const prevSelectedRef = useRef<boolean>(false);
  const savedPos = useRef(new THREE.Vector3());
  const savedTarget = useRef(new THREE.Vector3());
  const returning = useRef(false);

  // Scratch vectors (avoid per-frame allocation).
  const desiredPos = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    const isSelected = selected !== null && focusPoint !== null;
    const justSelected = isSelected && !prevSelectedRef.current;
    const justClosed = !isSelected && prevSelectedRef.current;

    // ── Transition: browsing → focused ──────────────────────────────────
    if (justSelected) {
      savedPos.current.copy(camera.position);
      savedTarget.current.copy(controls.target);
      controls.enabled = false;
      returning.current = false;
    }

    // ── Transition: focused → browsing (begin restore) ──────────────────
    if (justClosed) {
      returning.current = true;
      controls.enabled = false;
    }

    const k = 1 - Math.exp(-LERP_LAMBDA * delta);

    if (isSelected && focusPoint) {
      // Frame the card: sit along its outward radial, looking back at it.
      const dir = desiredPos.current.copy(focusPoint).normalize();
      desiredPos.current
        .copy(dir)
        .multiplyScalar(focusPoint.length() + FOCUS_GAP);
      desiredTarget.current.copy(focusPoint);

      camera.position.lerp(desiredPos.current, k);
      controls.target.lerp(desiredTarget.current, k);
      controls.update();
    } else if (returning.current) {
      // Glide back to the user's saved viewpoint.
      camera.position.lerp(savedPos.current, k);
      controls.target.lerp(savedTarget.current, k);
      controls.update();

      // Settled? Snap precisely and return control to the user.
      if (
        camera.position.distanceToSquared(savedPos.current) < SETTLE_EPS * SETTLE_EPS &&
        controls.target.distanceToSquared(savedTarget.current) < SETTLE_EPS * SETTLE_EPS
      ) {
        camera.position.copy(savedPos.current);
        controls.target.copy(savedTarget.current);
        controls.update();
        controls.enabled = true;
        returning.current = false;
      }
    }

    prevSelectedRef.current = isSelected;
  });

  return null;
}
