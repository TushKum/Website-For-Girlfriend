import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import Lighting from './Lighting';
import ParticleField from './ParticleField';
import PhotoGlobe from './PhotoGlobe';
import CameraRig from './CameraRig';

/**
 * CanvasContainer.tsx
 *
 * The WebGL stage. Owns the <Canvas>, the camera, the lighting rig, the
 * atmospheric particles, the globe, the orbit controls, and the camera rig.
 *
 * The canvas is transparent so the obsidian→midnight CSS gradient reads through
 * as the gallery backdrop; gentle fog fades distant dust into it. Texture
 * loading is handled per-card by <PhotoPlane>'s resilient `useSafeTexture`
 * (which never throws), so no <Suspense> boundary is needed here — a single
 * failed image degrades to a placeholder instead of blanking the scene.
 */
export default function CanvasContainer() {
  // Shared so both OrbitControls and the CameraRig drive the same instance.
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  return (
    <Canvas
      // Retina-crisp but capped for performance.
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping, // cinematic roll-off
        toneMappingExposure: 1.05,
      }}
      camera={{ position: [0, 0, 8.5], fov: 45, near: 0.1, far: 100 }}
    >
      {/* Gentle depth fog blends the far dust into the dark backdrop. */}
      <fog attach="fog" args={['#0a0a0d', 14, 30]} />

      <Lighting />
      <ParticleField />
      <PhotoGlobe />

      {/* Luxury-bezel feel: heavy inertia, clamped distance, no panning. */}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        enableZoom
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.55}
        zoomSpeed={0.7}
        minDistance={4.5}
        maxDistance={14}
        // Keep the user from flipping fully over the poles (stays composed).
        minPolarAngle={Math.PI * 0.18}
        maxPolarAngle={Math.PI * 0.82}
      />

      <CameraRig controlsRef={controlsRef} />
    </Canvas>
  );
}
