import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useGateStore, GATE_CODE } from '../store/useGateStore';

/**
 * LoginGate.tsx
 *
 * The neo-brutalist entryway: a thick-bordered, hard-shadowed card over the
 * blush gradient. She writes her name (and the secret word, if one is set) to
 * unlock the experience. Romantic copy, brutalist frame — the fusion that sets
 * the tone for the whole site.
 *
 * Self-contained: no backend needed. The unlock + name persist via
 * `useGateStore`, so she's never asked twice.
 */
export default function LoginGate() {
  const unlock = useGateStore((s) => s.unlock);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Tell me your name first ♥');
      return;
    }
    if (GATE_CODE && code.trim().toLowerCase() !== GATE_CODE.toLowerCase()) {
      setError('That’s not quite the secret word…');
      return;
    }
    unlock(name);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto p-5 py-10 sm:p-8">
      {/* Exposed brutalist grid over the romantic gradient. */}
      <div className="brutal-grid pointer-events-none absolute inset-0" />

      <motion.form
        onSubmit={onSubmit}
        initial={{ y: 36, opacity: 0, rotate: -1.5 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="brutal-card relative w-full max-w-md p-8 sm:p-10"
      >
        {/* Rotated sticker accents. */}
        <span className="brutal-chip absolute -left-3 -top-4 rotate-[-6deg] bg-rose-gold text-cream">
          For you only
        </span>
        <span className="brutal-card absolute -right-4 -top-5 flex h-11 w-11 rotate-[10deg] items-center justify-center bg-blush text-xl shadow-brutal-sm">
          ♥
        </span>

        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-rose-gold-deep">
          [ private · for you only ]
        </p>
        <h1 className="mt-2 font-grotesk text-6xl font-bold uppercase leading-[0.88] text-ink sm:text-7xl">
          Step
          <br /> inside,
          <br /> <span className="holo-text">love</span>{' '}
          <span className="y2k-twinkle inline-block align-top text-2xl text-petal">✦</span>
        </h1>
        <p className="mt-5 font-mono text-xs uppercase leading-relaxed tracking-wide text-ink/70">
          I made something for you.
          <br /> sign your name to open it.
        </p>

        <div className="mt-7 space-y-4">
          <label className="block">
            <span className="mb-1.5 block font-grotesk text-xs font-bold uppercase tracking-widest text-ink/70">
              Your name
            </span>
            <input
              className="brutal-input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="type it here…"
              autoFocus
              maxLength={40}
            />
          </label>

          {GATE_CODE && (
            <label className="block">
              <span className="mb-1.5 block font-grotesk text-xs font-bold uppercase tracking-widest text-ink/70">
                Secret word
              </span>
              <input
                className="brutal-input"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError('');
                }}
                placeholder="you know this one…"
                type="text"
              />
            </label>
          )}
        </div>

        {error && (
          <p className="mt-4 border-3 border-ink bg-rose-gold/20 px-3 py-2 font-mono text-sm text-rose-gold-deep">
            {error}
          </p>
        )}

        <button type="submit" className="brutal-btn-rose mt-7 w-full text-base">
          Unlock&nbsp;♥
        </button>

        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-ink/40">
          made with love, just for you
        </p>
      </motion.form>
    </div>
  );
}
