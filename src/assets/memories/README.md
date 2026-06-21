# Your memory photos go here 💝

Drop your real photos into this folder, named by their **memory id** (matching
the `id` in [`src/data/memories.ts`](../../data/memories.ts)).

## Naming

| Memory id | Acceptable filenames |
| --------- | -------------------- |
| 1         | `1.jpg`, `01.jpg`, `1.png`, `01.webp` … |
| 12        | `12.jpg`, `12.png`, `12.webp` … |
| 24        | `24.jpg`, `24.webp` … |

- Supported formats: **jpg, jpeg, png, webp, avif** (any case).
- Zero-padding is optional (`1.jpg` and `01.jpg` both map to memory 1).
- Any id **without** a file here automatically uses its elegant remote
  placeholder, so the globe always looks finished — fill this in at your pace.

## Tips

- **Portrait, ~3:4** ratio looks best (cards are centre-cropped to 3:4).
- Aim for **1000–1600px** on the long edge — crisp without being huge. Vite
  hashes and bundles each file automatically.
- Then edit the matching `title`, `date`, `location`, and `caption` in
  `src/data/memories.ts`.

That's it — no code changes needed. Vite auto-discovers whatever you add here
(see [`src/utils/localImages.ts`](../../utils/localImages.ts)).
