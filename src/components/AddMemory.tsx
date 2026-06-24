import { useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useContentStore } from '../store/useContentStore';

/**
 * AddMemory.tsx
 *
 * Lets her drop a new photo OR video straight onto the main 3D carousel. The
 * file uploads through the shared content store (local-first → Supabase) and
 * the new polaroid pops into the ring the instant it's saved — videos play
 * muted on the card and with sound in the full reveal.
 */
const todayLabel = () =>
  new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });

export default function AddMemory() {
  const addMemory = useContentStore((s) => s.addMemory);

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayLabel());
  const [location, setLocation] = useState('');
  const [caption, setCaption] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [justAdded, setJustAdded] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const isVideo = file?.type.startsWith('video/') ?? false;

  const reset = () => {
    setFile(null);
    setPreview('');
    setTitle('');
    setDate(todayLabel());
    setLocation('');
    setCaption('');
    setError('');
    if (fileInput.current) fileInput.current.value = '';
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : '');
    setError('');
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || saving) return;
    setSaving(true);
    setError('');
    try {
      await addMemory({ title, date, location, caption }, file);
      setJustAdded(true);
      window.setTimeout(() => setJustAdded(false), 2600);
      reset();
    } catch {
      setError('Couldn’t add that one — check the file and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* ── Floating opener (right rail, under "Letter") ────────────────── */}
      <button
        onClick={() => setOpen(true)}
        className="brutal-btn pointer-events-auto fixed right-6 top-[11.75rem] z-30 bg-cream"
        aria-label="Add a photo or video to the carousel"
      >
        <span className="holo-text">✚ Add</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* A fresh mint-blush "studio" room, distinct from the other panels. */}
            <div
              className="brutal-grid absolute inset-0"
              style={{
                background:
                  'radial-gradient(130% 120% at 50% 0%, #fff3f6 0%, #ffe2ea 40%, #e8f3e6 100%)',
              }}
            />

            <div className="relative mx-auto min-h-full w-full max-w-2xl px-5 py-8 sm:px-8">
              {/* Header. */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="brutal-chip rotate-[-2deg] bg-rose-gold text-cream">
                    onto the carousel
                  </span>
                  <h2 className="mt-3 font-grotesk text-4xl font-bold uppercase leading-[0.9] text-ink sm:text-5xl">
                    Add a <span className="holo-text">memory</span>
                  </h2>
                  <p className="mt-2 font-mono text-sm tracking-wide text-ink/60">
                    a photo or a video — it joins the ring instantly ✦
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close add memory"
                  className="brutal-card flex h-11 w-11 shrink-0 items-center justify-center bg-blush text-lg font-bold text-ink shadow-brutal-sm"
                >
                  ✕
                </button>
              </div>

              {/* Form. */}
              <form onSubmit={submit} className="brutal-card mt-7 space-y-3 bg-cream/90 p-5">
                <label className="flex cursor-pointer flex-col items-center justify-center gap-1 border-4 border-dashed border-ink bg-white px-4 py-7 font-mono text-sm uppercase tracking-wide text-ink/60 transition-colors hover:bg-petal/30">
                  {file ? (
                    <>
                      <span className="text-2xl">{isVideo ? '🎬' : '🖼'}</span>
                      <span className="mt-1 text-ink/80">{file.name}</span>
                      <span className="text-[10px] text-ink/40">
                        {(file.size / 1024 / 1024).toFixed(1)} MB · {isVideo ? 'video' : 'photo'}
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

                {/* Preview. */}
                {preview && !isVideo && (
                  <img
                    src={preview}
                    alt="preview"
                    className="max-h-56 w-full border-4 border-ink object-cover"
                  />
                )}
                {preview && isVideo && (
                  <video
                    src={preview}
                    controls
                    muted
                    className="max-h-56 w-full border-4 border-ink bg-ink/5"
                  />
                )}

                <input
                  className="brutal-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="title — e.g. “our first trip”"
                  maxLength={80}
                />
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    className="brutal-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="date"
                    maxLength={40}
                  />
                  <input
                    className="brutal-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="place (optional)"
                    maxLength={60}
                  />
                </div>
                <textarea
                  className="brutal-input min-h-[90px] resize-none leading-relaxed"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="the story behind it (optional)…"
                  maxLength={600}
                />

                {error && <p className="font-mono text-xs text-red-600">{error}</p>}

                <button type="submit" disabled={saving || !file} className="brutal-btn-rose w-full">
                  {saving ? 'Adding…' : 'Add to the carousel ✦'}
                </button>

                <AnimatePresence>
                  {justAdded && (
                    <motion.p
                      className="text-center font-mono text-xs font-bold uppercase tracking-widest text-rose-gold-deep"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      ♥ added — spin the ring to find it
                    </motion.p>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
