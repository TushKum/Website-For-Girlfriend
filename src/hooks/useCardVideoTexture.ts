import { useEffect, useState } from 'react';
import * as THREE from 'three';

/**
 * useCardVideoTexture
 *
 * Turns a video URL into a THREE.VideoTexture for a carousel card — muted,
 * looping, and autoplaying so it reads as living, ambient footage on the
 * polaroid. Deliberately Suspense-free (like `useSafeTexture`) so one slow or
 * broken video never blocks the whole scene; three updates the texture from the
 * <video> element every frame automatically.
 *
 * The element is muted + playsInline, which browsers allow to autoplay without
 * a user gesture. It's paused and torn down on unmount.
 */
export function useCardVideoTexture(url: string): THREE.VideoTexture {
  const [texture] = useState(() => {
    const video = document.createElement('video');
    video.src = url;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    const tex = new THREE.VideoTexture(video);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  });

  useEffect(() => {
    const video = texture.image as HTMLVideoElement;
    void video.play().catch(() => {
      /* autoplay can still be refused; the card simply shows the first frame */
    });
    return () => {
      video.pause();
      video.removeAttribute('src');
      video.load();
      texture.dispose();
    };
  }, [texture]);

  return texture;
}
