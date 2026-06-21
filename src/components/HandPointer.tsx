import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { handState } from '../store/handState';
import { ndcToWorldAtZ } from '../vision/coords';
import { getGlowTexture } from '../utils/textures';
import { HAND_PLANE_Z } from './sceneConfig';

/**
 * HandPointer.tsx
 *
 * A soft, glowing rose-gold orb that tracks the user's hand in 3D space — the
 * tactile feedback that says "the scene feels you". It reads the mutable
 * `handState` every frame (never React state), maps the hand's NDC position to
 * world space at the interaction depth, fades in/out with hand presence, and
 * tightens + brightens as the user pinches.
 */
export default function HandPointer() {
  const spriteRef = useRef<THREE.Sprite>(null);
  const matRef = useRef<THREE.SpriteMaterial>(null);
  const camera = useThree((s) => s.camera);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const glow = useMemo(() => getGlowTexture(), []);

  useFrame((_, delta) => {
    const sprite = spriteRef.current;
    const mat = matRef.current;
    if (!sprite || !mat) return;

    const k = 1 - Math.exp(-12 * delta);

    if (handState.present) {
      ndcToWorldAtZ(handState.ndcX, handState.ndcY, camera, HAND_PLANE_Z, pos);
      sprite.position.lerp(pos, 0.4);
    }

    // Fade with presence; tighten + brighten with pinch.
    const targetOpacity = handState.present ? (handState.pinch ? 0.95 : 0.6) : 0;
    mat.opacity = THREE.MathUtils.damp(mat.opacity, targetOpacity, 12, delta);

    const targetScale = handState.present
      ? (handState.pinch ? 0.55 : 0.9) + handState.pinchStrength * 0.15
      : 0.4;
    const s = THREE.MathUtils.lerp(sprite.scale.x, targetScale, k);
    sprite.scale.setScalar(s);
  });

  return (
    <sprite ref={spriteRef} scale={0.6}>
      <spriteMaterial
        ref={matRef}
        map={glow}
        color="#ffc8b0"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </sprite>
  );
}
