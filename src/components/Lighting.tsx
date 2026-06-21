/**
 * Lighting.tsx
 *
 * A deliberately cinematic lighting rig — the opposite of flat studio light.
 *
 *  - A warm AMBIENT wash with a rose-gold / champagne tint lifts the shadows
 *    so the dark scene never reads as muddy.
 *  - A sharp white DIRECTIONAL key light rakes across the photo planes from
 *    upper-right, giving the rounded cards crisp, dimensional edges and a
 *    subtle metallic specular roll-off (the materials carry a touch of
 *    metalness for exactly this).
 *  - A cool, low-intensity rim light from behind separates the globe from the
 *    obsidian background and adds depth.
 */
export default function Lighting() {
  return (
    <>
      {/* Warm ambient base — champagne / rose-gold, soft. */}
      <ambientLight color="#ffe4e1" intensity={0.6} />

      {/* Sharp metallic key light. Casts the crisp dimension across planes. */}
      <directionalLight
        color="#ffffff"
        intensity={1.5}
        position={[5, 6, 8]}
      />

      {/* Warm champagne fill from the lower-left to round out the shadows. */}
      <pointLight
        color="#ffd9b3"
        intensity={0.5}
        distance={40}
        position={[-8, -4, 4]}
      />

      {/* Cool rim light from behind for separation against the dark. */}
      <directionalLight
        color="#9fb6ff"
        intensity={0.35}
        position={[-6, 2, -10]}
      />
    </>
  );
}
