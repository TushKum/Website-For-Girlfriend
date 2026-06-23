import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useVisionStore } from '../store/useVisionStore';
import Lighting from './Lighting';
import HeartField from './HeartField';
import PhotoCarousel from './PhotoCarousel';
import HeartBurst from './HeartBurst';
import LilyShower from './LilyShower';
import HandPointer from './HandPointer';
import { CAMERA_Z } from './sceneConfig';

/**
 * CanvasContainer.tsx
 *
 * The WebGL stage for the gesture-driven experience. The canvas is transparent
 * so the soft blush radial gradient on <body> reads through as the dreamy
 * backdrop; gentle pink fog fades distant hearts into it for depth.
 *
 * Composition (back to front):
 *   Lighting       — soft, shadow-free, rosy.
 *   HeartField     — ambient drifting hearts (GPU-animated).
 *   PhotoCarousel  — the rotating ring of frosted polaroids (gesture + mouse).
 *   HeartBurst     — hearts that erupt from a fast-moving hand / a clap.
 *   LilyShower     — lilies that rain down while a prayer pose is held.
 *   HandPointer    — the glowing orb that tracks the hand.
 *
 * Texture loading is per-card and resilient (`useSafeTexture`), so no <Suspense>
 * boundary is needed and a single failed image never blanks the scene.
 */
export default function CanvasContainer() {
  // A clap/prayer moment freezes the entire scene (render loop paused) while
  // the giant heart/lily takes over the screen.
  const frozen = useVisionStore((s) => s.moment !== null);

  return (
    <Canvas
      frameloop={frozen ? 'never' : 'always'}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      camera={{ position: [0, 0.2, CAMERA_Z], fov: 45, near: 0.1, far: 100 }}
    >
      {/* Soft pink depth fog. */}
      <fog attach="fog" args={['#ffe7ee', 18, 42]} />

      <Lighting />
      <HeartField />
      <PhotoCarousel />
      <HeartBurst />
      <LilyShower />
      <HandPointer />
    </Canvas>
  );
}
