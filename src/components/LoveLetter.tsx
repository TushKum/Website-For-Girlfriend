import { useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { useGateStore } from '../store/useGateStore';

/**
 * LoveLetter.tsx
 *
 * A sealed Y2K-brutalist envelope. Closed, it bobs and pulses a wax ♥ seal that
 * begs to be tapped. On open: the top flap swings back in 3D, the letter rises
 * up out of the pocket, and its lines unfurl one by one in a handwritten serif.
 * Re-seal to fold it all back in. Pure DOM + Framer Motion — never touches the
 * 3D scene.
 */

/** The letter body — edit these lines to make it yours. */
const LINES = [
  'I’m not always good with words out loud,',
  'so I tucked them in here where they’ll keep.',
  'You are the softest, brightest part of my every day —',
  'the person I think of first and miss the most.',
  'Thank you for being patient, for being warm,',
  'for being unmistakably, wonderfully you.',
  'However far the day takes us, I’m yours.',
];

export default function LoveLetter() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [opened, setOpened] = useState(false);
  const name = useGateStore((s) => s.visitorName);

  const close = () => {
    setOpened(false);
    setPanelOpen(false);
  };

  return (
    <>
      {/* ── Floating opener (right rail, under "Reasons") ───────────────── */}
      <button
        onClick={() => setPanelOpen(true)}
        className="brutal-btn pointer-events-auto fixed right-6 top-[8.5rem] z-30 bg-cream"
        aria-label="Open your love letter"
      >
        <span className="holo-text">✉ Letter</span>
      </button>

      <AnimatePresence>
        {panelOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Dim dot-grid room. */}
            <div
              className="dot-grid absolute inset-0"
              style={{
                background:
                  'radial-gradient(125% 120% at 50% 10%, #ffe9f1 0%, #f6d6e6 50%, #e9c2dc 100%)',
              }}
            />

            <button
              onClick={close}
              aria-label="Close letter"
              className="brutal-card absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center bg-blush text-lg font-bold text-ink shadow-brutal-sm"
            >
              ✕
            </button>

            <div className="relative flex flex-col items-center">
              {/* Heading. */}
              <motion.span
                className="brutal-chip mb-6 rotate-[-2deg] bg-petal text-ink shadow-brutal-sm"
                initial={{ y: -16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                a sealed note
              </motion.span>

              {/* ── The envelope ─────────────────────────────────────────── */}
              <div className="relative" style={{ perspective: 1400 }}>
                <motion.div
                  className="relative h-56 w-[21rem] sm:h-60 sm:w-[24rem]"
                  animate={opened ? { y: 0 } : { y: [0, -7, 0] }}
                  transition={
                    opened
                      ? { duration: 0.3 }
                      : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                  }
                >
                  {/* Envelope back wall. */}
                  <div className="absolute inset-0 border-4 border-ink bg-rose-gold shadow-brutal" />

                  {/* The letter — rises up out of the pocket. */}
                  <motion.div
                    className="absolute left-1/2 top-3 w-[18rem] -translate-x-1/2 sm:w-[21rem]"
                    style={{ zIndex: 10 }}
                    initial={false}
                    animate={
                      opened
                        ? { y: -150, opacity: 1, scale: 1 }
                        : { y: 28, opacity: 0, scale: 0.96 }
                    }
                    transition={{ type: 'spring', stiffness: 120, damping: 18, delay: opened ? 0.28 : 0 }}
                  >
                    <Letter lines={LINES} name={name} show={opened} />
                  </motion.div>

                  {/* Front pocket — a V that hides the letter's lower half. */}
                  <div
                    className="absolute inset-0 z-20 border-4 border-ink bg-petal"
                    style={{ clipPath: 'polygon(0 38%, 50% 78%, 100% 38%, 100% 100%, 0 100%)' }}
                  />

                  {/* Side seams for a crisper folded look. */}
                  <div
                    className="pointer-events-none absolute inset-0 z-20"
                    style={{
                      clipPath: 'polygon(0 0, 50% 42%, 100% 0, 100% 4%, 50% 46%, 0 4%)',
                      background: 'rgba(22,13,17,0.12)',
                    }}
                  />

                  {/* Top flap — swings open in 3D. */}
                  <motion.div
                    className="absolute inset-x-0 top-0 z-30 h-1/2 origin-top border-4 border-ink bg-rose-gold-light"
                    style={{
                      clipPath: 'polygon(0 0, 100% 0, 50% 92%)',
                      transformStyle: 'preserve-3d',
                      backfaceVisibility: 'hidden',
                    }}
                    animate={{ rotateX: opened ? -174 : 0, zIndex: opened ? 5 : 30 }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {/* Wax seal — decorative focal point (the whole envelope is
                        the tap target, so this stays pointer-events-none). */}
                    <AnimatePresence>
                      {!opened && (
                        <motion.div
                          className="pointer-events-none absolute left-1/2 top-[58%] flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-ink bg-rose-gold text-2xl text-cream shadow-brutal-sm"
                          initial={{ scale: 0 }}
                          animate={{ scale: [1, 1.08, 1] }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{
                            scale: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
                          }}
                        >
                          ♥
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Full-cover tap target while sealed — a big, forgiving hit
                      area so a tap anywhere on the envelope opens it (kinder on
                      touch than aiming for the wax seal). */}
                  {!opened && (
                    <button
                      onClick={() => setOpened(true)}
                      aria-label="Break the seal and open the letter"
                      className="absolute inset-0 z-40 cursor-pointer"
                    />
                  )}
                </motion.div>
              </div>

              {/* Caption / controls under the envelope. */}
              <div className="mt-[4.5rem] flex h-12 items-center">
                <AnimatePresence mode="wait">
                  {opened ? (
                    <motion.button
                      key="reseal"
                      onClick={() => setOpened(false)}
                      className="brutal-btn bg-cream"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                    >
                      <span className="holo-text">↺ Seal it back</span>
                    </motion.button>
                  ) : (
                    <motion.p
                      key="hint"
                      className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink/50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      tap the wax seal ♥
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * The letter card — ruled paper with staggered handwritten lines.
 * ───────────────────────────────────────────────────────────────────────── */

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.5 } },
};
const line: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

function Letter({ lines, name, show }: { lines: string[]; name: string; show: boolean }) {
  return (
    <div
      className="border-4 border-ink bg-cream px-6 py-6 shadow-brutal"
      style={{
        backgroundImage:
          'repeating-linear-gradient(transparent, transparent 31px, rgba(201,139,126,0.22) 31px, rgba(201,139,126,0.22) 32px)',
      }}
    >
      <p className="font-serif text-2xl font-semibold italic text-ink">
        Dear {name || 'you'},
      </p>

      <motion.div
        className="mt-3 space-y-[6px]"
        variants={container}
        initial="hidden"
        animate={show ? 'show' : 'hidden'}
      >
        {lines.map((text, i) => (
          <motion.p
            key={i}
            variants={line}
            className="font-serif text-[1.05rem] leading-8 text-ink/85"
          >
            {text}
          </motion.p>
        ))}
      </motion.div>

      <motion.div
        className="mt-4 text-right"
        variants={line}
        initial="hidden"
        animate={show ? 'show' : 'hidden'}
        transition={{ delay: 1.6 }}
      >
        <p className="font-serif text-lg italic text-ink/70">always &amp; all ways,</p>
        <p className="holo-text font-grotesk text-xl font-bold uppercase">me ♥</p>
      </motion.div>
    </div>
  );
}
