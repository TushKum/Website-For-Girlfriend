import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  listPoems,
  addPoem,
  listPaintings,
  addPainting,
  type Poem,
  type Painting,
} from '../services/db';
type Tab = 'poems' | 'paintings';

/**
 * Gallery.tsx
 *
 * Her own creative corner — a deliberately *different setting* from the pink
 * memory carousel: a full-screen lilac Y2K gallery "room" with its own grid
 * backdrop. Two tabs let her add and browse her **poems** (typed verse) and
 * **paintings** (image uploads). Persists via the local-first `db` layer
 * (poems/paintings tables + the `paintings` storage bucket on Supabase).
 */
export default function Gallery() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('poems');

  const [poems, setPoems] = useState<Poem[]>([]);
  const [paintings, setPaintings] = useState<Painting[]>([]);

  // Poem compose.
  const [pTitle, setPTitle] = useState('');
  const [pBody, setPBody] = useState('');
  const [savingPoem, setSavingPoem] = useState(false);

  // Painting compose.
  const [aTitle, setATitle] = useState('');
  const [aCaption, setACaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    listPoems().then(setPoems);
    listPaintings().then(setPaintings);
  }, [open]);

  const submitPoem = async (e: FormEvent) => {
    e.preventDefault();
    if (!pBody.trim() || savingPoem) return;
    setSavingPoem(true);
    const poem = await addPoem(pTitle, pBody);
    setPoems((prev) => [poem, ...prev]);
    setPTitle('');
    setPBody('');
    setSavingPoem(false);
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : '');
  };

  const submitPainting = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || uploading) return;
    setUploading(true);
    try {
      const painting = await addPainting(aTitle, aCaption, file);
      setPaintings((prev) => [painting, ...prev]);
      setATitle('');
      setACaption('');
      setFile(null);
      setPreview('');
      if (fileInput.current) fileInput.current.value = '';
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* Floating opener (sits above the Notes button). */}
      <button
        onClick={() => setOpen(true)}
        className="brutal-btn pointer-events-auto fixed bottom-[5.25rem] left-6 z-30 bg-cream"
        aria-label="Open her poems & paintings gallery"
      >
        <span className="holo-text">✎ Her Art</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {/* A different "room": lilac → sky Y2K wall with an exposed grid. */}
            <div
              className="brutal-grid absolute inset-0"
              style={{
                background:
                  'radial-gradient(125% 120% at 50% 0%, #f3e8ff 0%, #e7d6ff 45%, #d9ecff 100%)',
              }}
            />

            <div className="relative mx-auto min-h-full w-full max-w-3xl px-5 py-8 sm:px-8">
              {/* Header. */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="brutal-chip rotate-[-3deg] bg-rose-gold text-cream">
                    Her corner
                  </span>
                  <h2 className="mt-3 font-grotesk text-4xl font-bold uppercase leading-[0.9] text-ink sm:text-6xl">
                    <span className="holo-text">Poems</span> &amp;
                    <br /> Paintings
                  </h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close gallery"
                  className="brutal-card flex h-11 w-11 shrink-0 items-center justify-center bg-blush text-lg font-bold text-ink shadow-brutal-sm"
                >
                  ✕
                </button>
              </div>

              {/* Tabs. */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setTab('poems')}
                  className={`brutal-btn ${tab === 'poems' ? 'bg-rose-gold text-cream' : 'bg-cream'}`}
                >
                  ✍ Poems
                </button>
                <button
                  onClick={() => setTab('paintings')}
                  className={`brutal-btn ${tab === 'paintings' ? 'bg-rose-gold text-cream' : 'bg-cream'}`}
                >
                  🖌 Paintings
                </button>
              </div>

              {/* ── Poems ──────────────────────────────────────────────── */}
              {tab === 'poems' && (
                <div className="mt-6">
                  <form onSubmit={submitPoem} className="brutal-card space-y-3 bg-cream/90 p-5">
                    <input
                      className="brutal-input"
                      value={pTitle}
                      onChange={(e) => setPTitle(e.target.value)}
                      placeholder="poem title (optional)"
                      maxLength={80}
                    />
                    <textarea
                      className="brutal-input min-h-[120px] resize-none leading-relaxed"
                      value={pBody}
                      onChange={(e) => setPBody(e.target.value)}
                      placeholder="write her verse here…"
                      maxLength={2000}
                    />
                    <button type="submit" disabled={savingPoem || !pBody.trim()} className="brutal-btn-rose w-full">
                      {savingPoem ? 'Saving…' : 'Add poem ✦'}
                    </button>
                  </form>

                  <div className="mt-6 space-y-5 pb-10">
                    {poems.length === 0 ? (
                      <p className="py-6 text-center font-mono text-sm text-ink/50">
                        No poems yet — write the first verse ✦
                      </p>
                    ) : (
                      poems.map((poem) => (
                        <article key={poem.id} className="brutal-card bg-cream p-5">
                          <h3 className="font-grotesk text-xl font-bold uppercase text-ink">
                            {poem.title}
                          </h3>
                          <p className="mt-2 whitespace-pre-wrap font-mono text-[15px] leading-relaxed text-ink/85">
                            {poem.body}
                          </p>
                          <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-rose-gold-deep">
                            {new Date(poem.createdAt).toLocaleDateString()}
                          </p>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ── Paintings ──────────────────────────────────────────── */}
              {tab === 'paintings' && (
                <div className="mt-6">
                  <form onSubmit={submitPainting} className="brutal-card space-y-3 bg-cream/90 p-5">
                    <input
                      className="brutal-input"
                      value={aTitle}
                      onChange={(e) => setATitle(e.target.value)}
                      placeholder="painting title (optional)"
                      maxLength={80}
                    />
                    <input
                      className="brutal-input"
                      value={aCaption}
                      onChange={(e) => setACaption(e.target.value)}
                      placeholder="a few words about it (optional)"
                      maxLength={160}
                    />

                    <label className="flex cursor-pointer items-center justify-center gap-2 border-4 border-dashed border-ink bg-white px-4 py-6 font-mono text-sm uppercase tracking-wide text-ink/70 transition-colors hover:bg-blush/40">
                      {file ? `📎 ${file.name}` : '＋ choose an image'}
                      <input
                        ref={fileInput}
                        type="file"
                        accept="image/*"
                        onChange={onPickFile}
                        className="hidden"
                      />
                    </label>

                    {preview && (
                      <img
                        src={preview}
                        alt="preview"
                        className="max-h-52 w-full border-4 border-ink object-cover"
                      />
                    )}

                    <button type="submit" disabled={uploading || !file} className="brutal-btn-rose w-full">
                      {uploading ? 'Hanging it up…' : 'Add painting 🖼'}
                    </button>
                  </form>

                  <div className="mt-6 grid grid-cols-1 gap-5 pb-10 sm:grid-cols-2">
                    {paintings.length === 0 ? (
                      <p className="col-span-full py-6 text-center font-mono text-sm text-ink/50">
                        No paintings yet — hang the first ✦
                      </p>
                    ) : (
                      paintings.map((art) => (
                        <figure key={art.id} className="brutal-card overflow-hidden bg-cream">
                          <img
                            src={art.imageURL}
                            alt={art.title}
                            loading="lazy"
                            className="aspect-[4/3] w-full border-b-4 border-ink object-cover"
                          />
                          <figcaption className="p-4">
                            <h3 className="font-grotesk text-lg font-bold uppercase text-ink">
                              {art.title}
                            </h3>
                            {art.caption && (
                              <p className="mt-1 font-mono text-[13px] leading-relaxed text-ink/80">
                                {art.caption}
                              </p>
                            )}
                          </figcaption>
                        </figure>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
