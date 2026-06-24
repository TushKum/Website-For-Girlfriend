import { useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Memory } from '../types/memory';
import { useSafeTexture } from '../hooks/useSafeTexture';
import { useCardVideoTexture } from '../hooks/useCardVideoTexture';
import { useMemoryStore } from '../store/useMemoryStore';
import { pointerState } from '../store/pointerState';
import { getRoundedRectMask, getGlowTexture, getPlayBadgeTexture } from '../utils/textures';
import { CAROUSEL_RADIUS } from './sceneConfig';

/** Polaroid frame + inset photo proportions (classic thick-bottom border). */
const FRAME_W = 1.26;
const FRAME_H = 1.56;
const PHOTO_W = 1.06;
const PHOTO_H = 1.2;
const PHOTO_Y = 0.13; // shift photo up → thicker bottom border

interface PolaroidCardProps {
  memory: Memory;
  index: number;
  total: number;
}

/**
 * PolaroidCard.tsx
 *
 * A single memory as a floating, frosted-glass polaroid sitting on the carousel
 * ring. The translucent white frame (rounded via an alpha mask + alphaTest, so
 * it stays depth-correct with no transparency-sort glitches) reads as frosted
 * glass under the soft rosy light; the photo is inset with a thick bottom
 * border like a real polaroid.
 *
 * Each card is fixed facing radially outward and rides the parent carousel's
 * rotation; it gently bobs, lifts + glows on hover, and opens its full reveal
 * on click (drags are ignored via `pointerState.moved`).
 */
export default function PolaroidCard({ memory, index, total }: PolaroidCardProps) {
  const outerRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.MeshBasicMaterial>(null);

  const hoveredId = useMemoryStore((s) => s.hoveredId);
  const isModalOpen = useMemoryStore((s) => s.selected !== null);
  const setHovered = useMemoryStore((s) => s.setHovered);
  const select = useMemoryStore((s) => s.select);
  const isHovered = hoveredId === memory.id;

  const isVideo = memory.mediaType === 'video';
  const frameMask = useMemo(() => getRoundedRectMask(3, 4), []);
  const glow = useMemo(() => getGlowTexture(), []);
  const playBadge = useMemo(() => getPlayBadgeTexture(), []);

  // Static placement on the ring (faces outward; rides parent rotation).
  const angle = (index / total) * Math.PI * 2;
  const position = useMemo<[number, number, number]>(
    () => [Math.sin(angle) * CAROUSEL_RADIUS, 0, Math.cos(angle) * CAROUSEL_RADIUS],
    [angle],
  );
  const phase = useMemo(() => index * 1.7, [index]);

  useFrame((state, delta) => {
    const inner = innerRef.current;
    if (!inner) return;

    // Gentle bob.
    inner.position.y = Math.sin(state.clock.elapsedTime * 0.6 + phase) * 0.07;

    // Hover lift + scale.
    const target = isHovered && !isModalOpen ? 1.13 : 1;
    const s = THREE.MathUtils.damp(inner.scale.x, target, 9, delta);
    inner.scale.setScalar(s);

    if (glowRef.current) {
      const g = isHovered && !isModalOpen ? 0.85 : 0;
      glowRef.current.opacity = THREE.MathUtils.damp(glowRef.current.opacity, g, 9, delta);
    }
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    if (isModalOpen || pointerState.dragging) return;
    e.stopPropagation();
    setHovered(memory.id);
    document.body.style.cursor = 'pointer';
  };
  const onOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (useMemoryStore.getState().hoveredId === memory.id) setHovered(null);
    document.body.style.cursor = 'auto';
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (isModalOpen || pointerState.moved) return; // ignore the end of a drag
    e.stopPropagation();
    const world = new THREE.Vector3();
    outerRef.current?.getWorldPosition(world);
    select(memory, world);
  };

  return (
    <group ref={outerRef} position={position} rotation={[0, angle, 0]}>
      <group ref={innerRef}>
        {/* Hover glow halo (behind the card). */}
        <mesh position={[0, 0, -0.04]} scale={[FRAME_W * 1.9, FRAME_H * 1.7, 1]} raycast={() => null}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            ref={glowRef}
            map={glow}
            color="#ffd0dc"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        {/* Frosted-glass polaroid frame (also the pointer hit target). */}
        <mesh onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
          <planeGeometry args={[FRAME_W, FRAME_H]} />
          <meshStandardMaterial
            color="#fffafa"
            emissive="#ffdfe6"
            emissiveIntensity={0.18}
            roughness={0.65}
            metalness={0}
            alphaMap={frameMask}
            alphaTest={0.5}
            transparent
            opacity={0.72}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* The photo or video, inset with a thick bottom border. */}
        <mesh position={[0, PHOTO_Y, 0.02]} raycast={() => null}>
          <planeGeometry args={[PHOTO_W, PHOTO_H]} />
          <MediaMaterial memory={memory} />
        </mesh>

        {/* "Play" badge in the lower-right corner of video cards. */}
        {isVideo && (
          <mesh
            position={[PHOTO_W / 2 - 0.19, PHOTO_Y - PHOTO_H / 2 + 0.19, 0.03]}
            raycast={() => null}
          >
            <planeGeometry args={[0.26, 0.26]} />
            <meshBasicMaterial map={playBadge} transparent depthWrite={false} toneMapped={false} />
          </mesh>
        )}

        {/* Tooltip — only for the hovered card. */}
        {isHovered && !isModalOpen && (
          <Html center position={[0, FRAME_H / 2 + 0.22, 0]} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
            <div className="animate-fade-in select-none whitespace-nowrap text-center">
              <p className="font-display text-[14px] font-medium leading-tight text-rose-gold-deep drop-shadow-[0_1px_6px_rgba(255,255,255,0.7)]">
                {memory.title}
              </p>
              <p className="mt-0.5 font-sans text-[9px] uppercase tracking-[0.2em] text-rose-gold/70">
                {memory.date}
              </p>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

/**
 * The inset photo/video material. Split into its own component (and a stable
 * branch on `mediaType`) so each media kind owns its loader hook without
 * violating the rules of hooks — a memory never switches type at runtime.
 */
function MediaMaterial({ memory }: { memory: Memory }) {
  if (memory.mediaType === 'video') return <VideoMaterial url={memory.imageURL} />;
  return <ImageMaterial url={memory.imageURL} />;
}

function ImageMaterial({ url }: { url: string }) {
  const { texture } = useSafeTexture(url);
  return <meshStandardMaterial map={texture} roughness={0.85} metalness={0} side={THREE.DoubleSide} />;
}

function VideoMaterial({ url }: { url: string }) {
  const texture = useCardVideoTexture(url);
  return <meshStandardMaterial map={texture} roughness={0.6} metalness={0} side={THREE.DoubleSide} />;
}
