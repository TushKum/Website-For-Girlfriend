import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { listCupcakes, addCupcake, type Cupcake } from '../services/db';

/**
 * Cupcake.tsx
 *
 * A standalone sweet little corner for uploading and browsing photos & videos
 * together — "our cupcake collection". Lives as its own floating panel,
 * separate from the poems/paintings gallery. Backed by the same Supabase
 * `cupcakes` table + storage bucket (or localStorage fallback).
 */
export default function CupcakeWidget() {
  const [open, setOpen] = useState(false);
  const [cupcakes, setCupcakes] = useState<Cupcake[]>([]);
  const [loading, setLoading] = useState(false);

  // Upload form state.
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  // Lightbox state.
  const [lightbox, setLightbox] = useState<Cupcake | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listCupcakes()
      .then(setCupcakes)
      .finally(() => setLoading(false));
  }, [open]);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : '');
    setErrorMsg('');
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || uploading) return;
    setUploading(true);
    setErrorMsg('');
    try {
      const item = await addCupcake(title, file);
      setCupcakes((prev) => [item, ...prev]);
      setTitle('');
      setFile(null);
      setPreview('');
      if (fileInput.current) fileInput.current.value = '';
    } catch {
      setErrorMsg('Upload failed — check your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  const closePanel = () => {
    setOpen(false);
    setLightbox(null);
  };

  return (
    <>
      {/* ── Floating opener ─────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        className="brutal-btn pointer-events-auto fixed bottom-[8.5rem] left-6 z-30 bg-cream"
        aria-label="Open our cupcake collection"
      >
        <span className="holo-text">🧁 Cupcake</span>
      </button>

      {/* ── Lightbox ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              className="relative max-h-[90vh] max-w-[92vw]"
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              {lightbox.mediaType === 'image' ? (
                <img
                  src={lightbox.mediaURL}
                  alt={lightbox.title}
                  className="max-h-[85vh] max-w-[90vw] border-4 border-ink object-contain shadow-brutal"
                />
              ) : (
                <video
                  src={lightbox.mediaURL}
                  controls
                  autoPlay
                  className="max-h-[85vh] max-w-[90vw] border-4 border-ink bg-ink/10 shadow-brutal"
                />
              )}
              {lightbox.title && lightbox.title !== 'Untitled' && (
                <p className="mt-2 text-center font-grotesk text-lg font-bold uppercase tracking-wide text-cream">
                  {lightbox.title}
                </p>
              )}
              <button
                onClick={() => setLightbox(null)}
                className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center border-4 border-ink bg-blush font-bold text-ink shadow-brutal-sm"
                aria-label="Close"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main panel ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Sweet bubblegum-peach Y2K room — distinct from the lilac gallery. */}
            <div
              className="brutal-grid absolute inset-0"
              style={{
                background:
                  'radial-gradient(130% 120% at 50% 0%, #fff0f8 0%, #ffd6ea 45%, #ffcae0 78%, #ffc0d8 100%)',
              }}
            />

            <div className="relative mx-auto min-h-full w-full max-w-3xl px-5 py-8 sm:px-8">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="brutal-chip rotate-[-2deg] bg-petal text-ink">
                    our little archive
                  </span>
                  <h2 className="mt-3 font-grotesk text-5xl font-bold uppercase leading-[0.9] text-ink sm:text-7xl">
                    <span className="holo-text">🧁 Cupcake</span>
                  </h2>
                  <p className="mt-2 font-mono text-sm tracking-wide text-ink/60">
                    photos &amp; videos — just ours ✦
                  </p>
                </div>
                <button
                  onClick={closePanel}
                  aria-label="Close cupcake gallery"
                  className="brutal-card flex h-11 w-11 shrink-0 items-center justify-center bg-blush text-lg font-bold text-ink shadow-brutal-sm"
                >
                  ✕
                </button>
              </div>

              {/* ── Upload form ──────────────────────────────────────────── */}
              <form
                onSubmit={submit}
                className="brutal-card mt-7 space-y-3 bg-cream/90 p-5"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink/50">
                  Add a new moment
                </p>

                <input
                  className="brutal-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="give it a sweet name (optional)"
                  maxLength={80}
                />

                <label className="flex cursor-pointer flex-col items-center justify-center gap-1 border-4 border-dashed border-ink bg-white px-4 py-7 font-mono text-sm uppercase tracking-wide text-ink/60 transition-colors hover:bg-petal/30">
                  {file ? (
                    <>
                      <span className="text-2xl">{file.type.startsWith('video/') ? '🎬' : '🖼'}</span>
                      <span className="mt-1 text-ink/80">{file.name}</span>
                      <span className="text-[10px] text-ink/40">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl">＋</span>
                      <span>choose a photo or video</span>
                    </>
                  )}
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/*,video/*"
                    onChange={onPickFile}
                    className="hidden"
                  />
                </label>

                {/* Preview */}
                {preview && file?.type.startsWith('image/') && (
                  <img
                    src={preview}
                    alt="preview"
                    className="max-h-56 w-full border-4 border-ink object-cover"
                  />
                )}
                {preview && file?.type.startsWith('video/') && (
                  <video
                    src={preview}
                    controls
                    className="max-h-56 w-full border-4 border-ink bg-ink/5"
                  />
                )}

                {errorMsg && (
                  <p className="font-mono text-xs text-red-600">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="brutal-btn-rose w-full"
                >
                  {uploading ? 'Sweetening…' : 'Add to cupcake 🧁'}
                </button>
              </form>

              {/* ── Gallery grid ─────────────────────────────────────────── */}
              <div className="mt-8 pb-12">
                {loading && (
                  <p className="py-8 text-center font-mono text-sm text-ink/50">
                    Loading…
                  </p>
                )}
                {!loading && cupcakes.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-5xl">🧁</p>
                    <p className="mt-3 font-mono text-sm text-ink/50">
                      Nothing here yet — upload the first moment ✦
                    </p>
                  </div>
                )}
                {!loading && cupcakes.length > 0 && (
                  <div className="columns-2 gap-4 sm:columns-3">
                    {cupcakes.map((item) => (
                      <motion.figure
                        key={item.id}
                        className="brutal-card mb-4 cursor-pointer overflow-hidden break-inside-avoid bg-cream"
                        whileHover={{ scale: 1.02, rotate: -0.5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        onClick={() => setLightbox(item)}
                      >
                        {item.mediaType === 'image' ? (
                          <img
                            src={item.mediaURL}
                            alt={item.title}
                            loading="lazy"
                            className="w-full border-b-4 border-ink object-cover"
                          />
                        ) : (
                          <div className="relative w-full border-b-4 border-ink bg-ink/10">
                            <video
                              src={item.mediaURL}
                              className="w-full"
                              preload="metadata"
                            />
                            {/* Play icon overlay */}
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/20">
                              <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-cream bg-ink/60 text-lg text-cream">
                                ▶
                              </span>
                            </div>
                          </div>
                        )}

                        <figcaption className="p-3">
                          {item.title && item.title !== 'Untitled' && (
                            <h3 className="font-grotesk text-[13px] font-bold uppercase leading-tight text-ink">
                              {item.title}
                            </h3>
                          )}
                          <p className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-rose-gold-deep">
                            {new Date(item.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </figcaption>
                      </motion.figure>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
