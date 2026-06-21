# Memory Globe — A Constellation of Us

A bespoke, world-class **3D Interactive Memory Globe**: twenty-four memories
float as photo cards on a slowly-turning sphere in a deep, private-gallery
space. Drift through with luxury-bezel inertia, hover to lift a memory into the
light, and touch one to open a cinematic, glassmorphism reveal of the story
behind it.

Built as a premium personal gift.

<!-- Replace with a real screenshot/GIF once deployed. -->
<!-- ![Memory Globe](docs/preview.png) -->

## ✨ Highlights

- **Obsidian → midnight gallery backdrop** with vignette, film-grain, and floating amber dust motes for a cinematic atmosphere.
- **Flawless Fibonacci-sphere distribution** — 24 cards spaced evenly, never clustering at the poles.
- **Outward-facing, slightly-rounded photo cards** lit by a warm rose-gold ambient + a sharp metallic key light for crisp dimension.
- **Buttery auto-rotation** (delta-time) that eases to a stop on hover or while a memory is open.
- **Rich hover dynamics** — the card scales up 15%, lifts along its normal, casts a soft outer glow, and floats a minimalist Title · Date tooltip.
- **Luxury OrbitControls** — heavy damping/inertia, clamped zoom and pitch so the view can never break.
- **Cinematic reveal modal** — the camera lerps to frame the card while a split-screen glassmorphism panel slides in (Framer Motion): photo left, elegant serif story right.
- **Robust by design** — fault-tolerant image preloading and a per-card resilient texture loader: a single broken image degrades to an elegant placeholder instead of ever blanking the scene.
- **Type-safe, modular, heavily documented** throughout.

## 🧰 Tech Stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (strict)
- [Vite 5](https://vitejs.dev/)
- [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) + [@react-three/drei](https://github.com/pmndrs/drei) + [three.js](https://threejs.org/)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Zustand](https://github.com/pmndrs/zustand) for cross-Canvas state

## 🚀 Quick Start

```bash
# install dependencies
npm install

# start the dev server (http://localhost:5173)
npm run dev

# type-check + production build
npm run build

# preview the production build
npm run preview
```

## 🌐 Deploy

This project is a static Vite app. Build it with `npm run build`, then deploy the generated `dist/` folder to any static host such as Vercel, Netlify, GitHub Pages, or an object-storage CDN.

The Vite config uses relative asset paths, so the site works whether it is hosted at the domain root or inside a subpath.

## 💝 Make It Yours — swap in real memories

All content lives in one place: [`src/data/memories.ts`](src/data/memories.ts).
Each of the 24 entries is a plain object:

```ts
{
  id: 1,
  imageURL: 'https://…/your-photo.jpg', // any URL (or /public path)
  title: 'The First Coffee',
  date: '14 February 2023',
  location: 'A corner café, downtown',
  caption: 'Two cups went cold because neither of us wanted to stop talking…',
}
```

Tips:
- **Use your own photos** by dropping them in `public/` and referencing
  `'/my-photo.jpg'`, or by pasting any hosted image URL.
- **Portrait images (≈3:4)** look best — cards are rendered and centre-cropped to that ratio.
- The current placeholders are elegant [Unsplash](https://unsplash.com/) crops; replace each `imageURL` with the real moment.
- Add or remove entries freely — the Fibonacci distribution, layout, and loader all adapt to the array length automatically.

## 🏛️ Architecture

```
src/
├── main.tsx                 # React bootstrap
├── App.tsx                  # Composition root (canvas + overlay + loader)
├── index.css                # Tailwind + the obsidian gallery backdrop
├── types/memory.ts          # Memory / PositionedMemory contracts
├── data/memories.ts         # ← the 24 memories (edit this)
├── store/useMemoryStore.ts  # Zustand store (hover, selection, readiness)
├── hooks/
│   ├── useImagePreloader.ts # Fault-tolerant cache warming + load progress
│   └── useSafeTexture.ts    # Per-card resilient texture (never throws)
├── utils/
│   ├── fibonacciSphere.ts   # Even point distribution on a sphere
│   └── textures.ts          # Canvas-generated mask / glow / dust / placeholder
└── components/
    ├── CanvasContainer.tsx  # <Canvas>, camera, controls, fog
    ├── Lighting.tsx         # Cinematic rose-gold + metallic rig
    ├── ParticleField.tsx    # Floating amber dust motes (<points>)
    ├── PhotoGlobe.tsx       # Distribution + delta-time auto-rotation
    ├── PhotoPlane.tsx       # A single card: orient, hover, tooltip, click
    ├── CameraRig.tsx        # Smooth lerp-to-focus / restore choreography
    ├── MemoryModal.tsx      # Glassmorphism split-screen reveal
    ├── Overlay.tsx          # Title, hint, vignette + modal mount
    ├── LoadingScreen.tsx    # Luxe preloader veil
    └── SceneErrorBoundary.tsx # Graceful fallback if the GL scene fails
```

A few decisions worth knowing:

- **Why Zustand?** Hover/selection state is read and written from *both* sides
  of the `<Canvas>` reconciler boundary; an external store crosses it cleanly
  without context bridging.
- **Rounded cards without transparency glitches.** Corners are clipped by a
  shared rounded-rect `alphaMap` + `alphaTest` on an opaque `MeshStandardMaterial`,
  so cards take real light *and* sort correctly with zero blending artefacts.
- **Resilience over Suspense.** Photos load per-card and never throw, so one
  404 or CORS hiccup can't collapse the globe — it just shows a tasteful
  placeholder on that one card.

> The original cartoon-themed static site is preserved untouched in
> [`legacy/`](legacy/).

## ⚡ Performance Notes

- In-GL textures are requested at a modest size; the reveal modal loads a
  crisper crop separately, so the globe stays light on GPU memory.
- `dpr` is capped at 2, particles are a single draw call, and per-frame work
  uses frame-rate-independent damping.

## 📄 License

MIT — see [LICENSE](LICENSE).
# Website-For-Girlfriend
