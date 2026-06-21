import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { getPlaceholderTexture } from '../utils/textures';

export type TextureStatus = 'loading' | 'loaded' | 'error';

/** One shared, CORS-enabled loader for every card. */
const loader = new THREE.TextureLoader();
loader.setCrossOrigin('anonymous');

/**
 * useSafeTexture
 *
 * Loads a single image into a THREE.Texture *without ever throwing*. This is
 * the robustness backbone of the experience: a 404, a CORS hiccup, or an
 * offline moment degrades to an elegant placeholder on that one card instead
 * of collapsing the entire globe (the failure mode of a shared <Suspense>).
 *
 *  - Starts on a shared, tasteful placeholder so a card is never blank.
 *  - Swaps to the real photo (correct colour space + anisotropy) on success.
 *  - Keeps the placeholder on failure and reports `status: 'error'`.
 *  - Disposes its own loaded texture on unmount (never the shared placeholder).
 *
 * @returns the texture to render right now, plus its load status.
 */
export function useSafeTexture(url: string): {
  texture: THREE.Texture;
  status: TextureStatus;
} {
  const placeholder = getPlaceholderTexture();
  const [texture, setTexture] = useState<THREE.Texture>(placeholder);
  const [status, setStatus] = useState<TextureStatus>('loading');
  const loadedRef = useRef<THREE.Texture | null>(null);

  useEffect(() => {
    let active = true;
    setStatus('loading');

    loader.load(
      url,
      (tex) => {
        if (!active) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        tex.needsUpdate = true;
        loadedRef.current = tex;
        setTexture(tex);
        setStatus('loaded');
      },
      undefined,
      () => {
        // Graceful failure: keep the elegant placeholder.
        if (active) setStatus('error');
      },
    );

    return () => {
      active = false;
      if (loadedRef.current) {
        loadedRef.current.dispose();
        loadedRef.current = null;
      }
    };
  }, [url]);

  return { texture, status };
}
