import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { heartSpriteTexture } from '../utils/heart';

/**
 * HeartField.tsx
 *
 * The atmosphere: hundreds of tiny, translucent, glowing hearts drifting gently
 * upward like embers, each pulsing softly in opacity.
 *
 * Performance note — this is the "60fps, don't block the main thread" ethos in
 * miniature: ALL motion and the opacity pulse happen on the GPU in a tiny
 * shader. Each frame we update exactly one uniform (`uTime`); the CPU does no
 * per-particle work at all. Normal (not additive) blending keeps the hearts
 * reading as soft pink shapes over the bright, creamy background rather than
 * blowing out to white.
 */
const COUNT = 260;
const RANGE = 17; // vertical wrap-around span

export default function HeartField() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const start = new Float32Array(COUNT * 3);
    const speed = new Float32Array(COUNT);
    const phase = new Float32Array(COUNT);
    const size = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      start[i * 3 + 0] = (Math.random() - 0.5) * 22; // x
      start[i * 3 + 1] = (Math.random() - 0.5) * RANGE; // y (seed within wrap span)
      start[i * 3 + 2] = -2 - Math.random() * 8; // z (kept behind the carousel)
      speed[i] = 0.4 + Math.random() * 0.9; // rise speed
      phase[i] = Math.random() * Math.PI * 2;
      size[i] = 5 + Math.random() * 11;
    }

    geo.setAttribute('aStart', new THREE.BufferAttribute(start, 3));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    // A dummy position attribute keeps three happy; real positions are derived
    // in the vertex shader from aStart + uTime.
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMap: { value: heartSpriteTexture() },
      uColor: { value: new THREE.Color('#ff9fb6') },
      uRange: { value: RANGE },
    }),
    [],
  );

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
        vertexShader={VERT}
        fragmentShader={FRAG}
      />
    </points>
  );
}

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uRange;
  attribute vec3 aStart;
  attribute float aSpeed;
  attribute float aPhase;
  attribute float aSize;
  varying float vAlpha;

  void main() {
    // Rise and wrap within [-uRange/2, uRange/2]; sway gently on x.
    float y = mod(aStart.y + uTime * aSpeed + uRange * 0.5, uRange) - uRange * 0.5;
    float x = aStart.x + sin(uTime * 0.3 + aPhase) * 0.7;
    vec3 pos = vec3(x, y, aStart.z);

    // Soft per-heart opacity pulse, and a fade near the top/bottom edges so
    // hearts never pop in or out abruptly.
    float pulse = 0.5 + 0.4 * sin(uTime * 1.4 + aPhase);
    float edge = smoothstep(0.0, 2.5, uRange * 0.5 - abs(y));
    vAlpha = pulse * edge * 0.5;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (170.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    gl_FragColor = vec4(uColor, tex.a * vAlpha);
  }
`;
