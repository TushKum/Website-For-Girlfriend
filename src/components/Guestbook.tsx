import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGateStore } from '../store/useGateStore';
import { listNotes, addNote, type GuestNote } from '../services/db';

/** Playful, alternating tilts so the notes read as a pinned collage. */
const TILT = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];

/**
 * Guestbook.tsx
 *
 * A neo-brutalist "love notes" board. A floating button opens a board where she
 * pins heartfelt notes that persist (via the local-first `db` layer). Her name
 * from the login gate pre-signs each note.
 */
export default function Guestbook() {
  const visitorName = useGateStore((s) => s.visitorName);
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<GuestNote[]>([]);
  const [name, setName] = useState(visitorName);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) listNotes().then(setNotes);
  }, [open]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || saving) return;
    setSaving(true);
    const note = await addNote(name || visitorName, message);
    setNotes((prev) => [note, ...prev]);
    setMessage('');
    setSaving(false);
  };

  return (
    <>
      {/* Floating opener. */}
      <button
        onClick={() => setOpen(true)}
        className="brutal-btn pointer-events-auto fixed bottom-6 left-6 z-30 bg-cream"
        aria-label="Open the love notes board"
      >
        ♡ Notes
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 py-10 sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden
            />

            <motion.div
              className="brutal-card relative w-full max-w-lg p-7 sm:p-9"
              initial={{ y: 28, opacity: 0, rotate: -1 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="brutal-card absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center bg-blush text-lg font-bold text-ink shadow-brutal-sm"
              >
                ✕
              </button>

              <span className="brutal-chip rotate-[-3deg] bg-rose-gold text-cream">
                Love notes
              </span>
              <h2 className="mt-3 font-grotesk text-4xl font-bold uppercase leading-none text-ink sm:text-5xl">
                Pin me
                <br /> a note
              </h2>

              {/* Compose. */}
              <form onSubmit={onSubmit} className="mt-5 space-y-3">
                <input
                  className="brutal-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="your name"
                  maxLength={40}
                />
                <textarea
                  className="brutal-input min-h-[90px] resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="write something from your heart…"
                  maxLength={400}
                />
                <button type="submit" disabled={saving || !message.trim()} className="brutal-btn-rose w-full">
                  {saving ? 'Pinning…' : 'Pin it ♥'}
                </button>
              </form>

              {/* Board. */}
              <div className="mt-7 max-h-[40vh] space-y-4 overflow-y-auto pr-1">
                {notes.length === 0 ? (
                  <p className="py-6 text-center font-mono text-sm text-ink/50">
                    No notes yet — be the first ♥
                  </p>
                ) : (
                  notes.map((n, i) => (
                    <div
                      key={n.id}
                      className={`brutal-card ${TILT[i % TILT.length]} bg-blush/60 p-4`}
                    >
                      <p className="font-mono text-[15px] leading-relaxed text-ink">{n.message}</p>
                      <p className="mt-2 font-mono text-xs font-bold uppercase tracking-wider text-rose-gold-deep">
                        — {n.name}
                        <span className="ml-2 font-mono font-normal normal-case tracking-normal text-ink/40">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
