/**
 * localImages.ts
 *
 * Zero-config local photo wiring.
 *
 * Drop your real photos into `src/assets/memories/` named by their memory id
 * (zero-padding optional): `1.jpg`, `01.jpg`, `12.png`, `24.webp`, etc. Vite
 * bundles, content-hashes, and optimizes whatever it finds at build time.
 *
 * Any id *without* a local file gracefully falls back to its remote
 * placeholder URL (see `data/memories.ts`), so the globe always looks complete
 * — fill the folder at your own pace.
 */

// Eagerly import every image in the memories folder. `import: 'default'`
// yields the final hashed asset URL string for each file.
const modules = import.meta.glob(
  '../assets/memories/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true, import: 'default' },
) as Record<string, string>;

// Map each discovered file to its numeric memory id (from the filename).
const byId: Record<number, string> = {};
for (const [path, url] of Object.entries(modules)) {
  const match = path.match(/(\d+)\.[a-zA-Z]+$/);
  if (match) byId[parseInt(match[1], 10)] = url;
}

/** The resolved local asset URL for a memory id, or undefined if none exists. */
export function localImageFor(id: number): string | undefined {
  return byId[id];
}

/** True if the user has added at least one local photo. */
export const hasLocalImages = Object.keys(byId).length > 0;
