/**
 * Lighting.tsx
 *
 * Soft, volumetric, shadow-free romance. Nothing harsh ever touches the scene:
 *
 *  - A bright warm AMBIENT wash so the frosted cards never fall into hard dark.
 *  - A HEMISPHERE light (blush sky → peach ground) for that soft, enveloping,
 *    "lit from everywhere" volumetric feel.
 *  - A rosy SPOTLIGHT with maximum penumbra — a delicate, tactile key light
 *    that gives the polaroids dimension without a single sharp shadow edge
 *    (shadows are intentionally left off).
 *  - A cool-cream fill from the opposite side to keep the shadowed sides alive.
 */
export default function Lighting() {
  return (
    <>
      <ambientLight color="#fff1f0" intensity={1.15} />

      <hemisphereLight
        color="#ffd9e0" /* sky: blush */
        groundColor="#ffe6d2" /* ground: warm peach */
        intensity={0.9}
      />

      {/* Rosy, gloriously soft key light. */}
      <spotLight
        color="#ffc8d4"
        intensity={2.4}
        position={[5, 7, 7]}
        angle={0.7}
        penumbra={1}
        distance={50}
        decay={2}
      />

      {/* Gentle cream fill from the lower-left. */}
      <pointLight color="#fff2e8" intensity={0.5} position={[-6, -3, 5]} distance={40} />
    </>
  );
}
