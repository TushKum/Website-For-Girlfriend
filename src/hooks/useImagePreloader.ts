import { useEffect } from 'react';
import { useMemoryStore } from '../store/useMemoryStore';

/**
 * useImagePreloader
 *
 * Warms the browser's image cache for every memory before the globe is
 * revealed, so cards appear fully dressed rather than popping in. Critically,
 * it is *fault-tolerant*: each image resolves whether it loads or errors
 * (`Promise.allSettled`), and a safety timeout guarantees the veil always
 * lifts even if a request hangs. Progress is reported to the store to drive
 * the loading counter.
 *
 *  - `crossOrigin = 'anonymous'` matches THREE.TextureLoader so both share the
 *    same HTTP cache entry — the preload genuinely warms the GL load.
 *
 * @param urls A referentially-stable list of image URLs.
 */
export function useImagePreloader(urls: string[]): void {
  const setReady = useMemoryStore((s) => s.setReady);
  const bumpLoaded = useMemoryStore((s) => s.bumpLoaded);

  useEffect(() => {
    let finished = false;
    const finish = () => {
      if (!finished) {
        finished = true;
        setReady(true);
      }
    };

    const loadOne = (url: string): Promise<void> =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const done = () => {
          bumpLoaded();
          resolve();
        };
        img.onload = done;
        img.onerror = done; // tolerate failures — they degrade gracefully
        img.src = url;
      });

    Promise.allSettled(urls.map(loadOne)).then(finish);

    // Safety net: never let a hung request trap the user on the veil.
    const timeout = window.setTimeout(finish, 9000);
    return () => window.clearTimeout(timeout);
  }, [urls, setReady, bumpLoaded]);
}
