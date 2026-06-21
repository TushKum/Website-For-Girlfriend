import { useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { PositionedMemory } from '../types/memory';
import { useMemoryStore } from '../store/useMemoryStore';
import { useSafeTexture } from '../hooks/useSafeTexture';
import { getRoundedRectMask, getGlowTexture } from '../utils/textures';

/** Portrait card proportions (3:4) and the shared geometry footprint. */
const CARD_W = 0.92;
const CARD_H = 1.23;
/** How far a hovered card lifts outward from the sphere, in world units. */
const HOVER_LIFT = 0.55;
/** Hovered scale multiplier — the spec's +15%. */
const HOVER_SCALE = 1.15;

interface PhotoPlaneProps {
  memory: PositionedMemory;
}

/**
 * PhotoPlane.tsx
 *
 * A single memory rendered as a sleek, slightly-rounded 3D photo card sitting
 * on the surface of the globe.
 *
 * Key behaviours:
 *  - ORIENTATION: the card is oriented once so its front face (+Z) points
 *    radially *outward*, computed in the globe group's local space so it
 *    rotates rigidly with the globe (no per-frame world-space lookAt that
 *    would fight the auto-rotation).
 *  - ROUNDED CORNERS: a shared rounded-rect alpha mask + `alphaTest` clips the
 *    corners crisply on an opaque material — true rounded cards, zero
 *    transparency-sorting glitches, and full directional-light shading.
 *  - HOVER: frame-rate-independent damping lerps the card outward along its
 *    normal, scales it to 115%, and fades in a soft additive outer glow, while
 *    a minimalist tooltip (Title + Date) fades in above it.
 *  - CLICK: captures the card's world position (for the camera rig) and opens
 *    the reveal modal via the store.
 */
export default function PhotoPlane({ memory }: PhotoPlaneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const hoveredId = useMemoryStore((s) => s.hoveredId);
  const isModalOpen = useMemoryStore((s) => s.selected !== null);
  const setHovered = useMemoryStore((s) => s.setHovered);
  const select = useMemoryStore((s) => s.select);

  const isHovered = hoveredId === memory.id;

  // ── Base geometry maths (computed once per memory) ─────────────────────
  const basePos = useMemo(
    () => new THREE.Vector3(...memory.position),
    [memory.position],
  );
  /** Outward radial normal — the direction the card lifts on hover. */
  const normal = useMemo(() => basePos.clone().normalize(), [basePos]);

  /**
   * Orientation quaternion: builds an orthonormal basis whose +Z is the
   * outward normal and whose +Y stays as close to world-up as possible, so
   * cards never appear randomly rolled. Computed in local space → rotates with
   * the globe automatically.
   */
  const quaternion = useMemo(() => {
    const z = normal.clone(); // desired forward (+Z) = outward
    // Choose a stable up reference; swap near the poles to avoid degeneracy.
    const upRef =
      Math.abs(z.y) > 0.99 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
    const x = new THREE.Vector3().crossVectors(upRef, z).normalize();
    const y = new THREE.Vector3().crossVectors(z, x).normalize();
    const m = new THREE.Matrix4().makeBasis(x, y, z);
    return new THREE.Quaternion().setFromRotationMatrix(m);
  }, [normal]);

  // ── Textures ───────────────────────────────────────────────────────────
  // Resilient loader: shows an elegant placeholder, swaps to the photo on
  // load, and degrades gracefully (never throws) if the image fails — so one
  // bad URL can never take down the whole globe.
  const { texture: photo } = useSafeTexture(memory.imageURL);

  const mask = useMemo(() => getRoundedRectMask(3, 4), []);

  // ── Per-frame hover damping (frame-rate independent) ───────────────────
  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    // Exponential smoothing factor — buttery and independent of FPS.
    const k = 1 - Math.exp(-9 * delta);

    // Target position: base, lifted outward along the normal while hovered.
    const lift = isHovered && !isModalOpen ? HOVER_LIFT : 0;
    const targetPos = basePos.clone().addScaledVector(normal, lift);
    group.position.lerp(targetPos, k);

    // Target scale.
    const targetScale = isHovered && !isModalOpen ? HOVER_SCALE : 1;
    const s = THREE.MathUtils.damp(group.scale.x, targetScale, 9, delta);
    group.scale.setScalar(s);

    // Glow opacity.
    if (glowMatRef.current) {
      const targetGlow = isHovered && !isModalOpen ? 0.72 : 0;
      glowMatRef.current.opacity = THREE.MathUtils.damp(
        glowMatRef.current.opacity,
        targetGlow,
        9,
        delta,
      );
    }
  });

  // ── Pointer handlers ───────────────────────────────────────────────────
  const onOver = (e: ThreeEvent<PointerEvent>) => {
    if (isModalOpen) return;
    e.stopPropagation();
    setHovered(memory.id);
    document.body.style.cursor = 'pointer';
  };

  const onOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    // Only clear if we're still the hovered card (guards rapid re-entry).
    if (useMemoryStore.getState().hoveredId === memory.id) setHovered(null);
    document.body.style.cursor = 'auto';
  };

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (isModalOpen) return;
    e.stopPropagation();
    const world = new THREE.Vector3();
    groupRef.current?.getWorldPosition(world);
    select(memory, world);
    document.body.style.cursor = 'auto';
  };

  return (
    <group ref={groupRef} position={basePos} quaternion={quaternion}>
      {/* Soft additive outer glow, sitting just behind the card so only its
          halo peeks around the edges on hover. A radial sprite gives a soft
          falloff rather than a hard rectangle. */}
      <mesh position={[0, 0, -0.02]} scale={[CARD_W * 2.1, CARD_H * 1.9, 1]} raycast={() => null}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={glowMatRef}
          map={getGlowTexture()}
          color="#ffd9a8"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* The photo card itself. */}
      <mesh
        onPointerOver={onOver}
        onPointerOut={onOut}
        onClick={onClick}
      >
        <planeGeometry args={[CARD_W, CARD_H]} />
        <meshStandardMaterial
          map={photo}
          alphaMap={mask}
          alphaTest={0.5}
          side={THREE.DoubleSide}
          roughness={0.5}
          metalness={0.12}
        />
      </mesh>

      {/* Minimalist tooltip — only mounted for the hovered card. */}
      {isHovered && !isModalOpen && (
        <Html
          center
          position={[0, CARD_H / 2 + 0.28, 0]}
          zIndexRange={[40, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="animate-fade-in -translate-y-1 select-none whitespace-nowrap text-center">
            <p className="font-display text-[15px] font-medium leading-tight text-champagne drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {memory.title}
            </p>
            <p className="mt-0.5 font-sans text-[10px] uppercase tracking-[0.2em] text-white/55">
              {memory.date}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}
