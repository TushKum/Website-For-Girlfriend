import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemoryStore } from '../store/useMemoryStore';
import { useVisionStore } from '../store/useVisionStore';
import MemoryModal from './MemoryModal';

/**
 * Overlay.tsx
 *
 * The 2D, DOM-side chrome floating above the WebGL stage: a whisper-quiet title,
 * an adaptive "how to explore" hint (gesture wording when the camera is live,
 * mouse wording otherwise), and the memory reveal modal. The container is
 * `pointer-events-none` so it never steals interaction from the scene; only
 * truly interactive children opt back in.
 */
export default function Overlay() {
  const selected = useMemoryStore((s) => s.selected);
  const close = useMemoryStore((s) => s.close);
  const started = useVisionStore((s) => s.started);
  const status = useVisionStore((s) => s.status);
  const isOpen = selected !== null;
  const gestures = status === 'running';

  // Escape closes the open memory.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  const hint = gestures
    ? 'Pinch to turn · Open palm to draw near · Clap for hearts · Pray for lilies'
    : 'Drag to turn · Tap a memory to open it';

  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      {/* Gentle framing: a soft light vignette. */}
      <div className="vignette absolute inset-0" />

      {/* Title — a raw brutalist badge, top-left. Recedes when a memory opens. */}
      <AnimatePresence>
        {started && !isOpen && (
          <motion.header
            className="absolute left-5 top-5"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            <div className="brutal-card bg-cream px-4 py-2.5">
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-rose-gold-deep">
                [ for you ]
              </p>
              <h1 className="font-grotesk text-xl font-bold uppercase leading-[0.9] text-ink md:text-2xl">
                Where Our
                <br /> Story Lives
              </h1>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Explore hint — mono, in a hard-edged bar. */}
      <AnimatePresence>
        {started && !isOpen && (
          <motion.div
            className="absolute inset-x-0 bottom-0 flex justify-center pb-7"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, delay: 0.8 }}
          >
            <motion.p
              className="mx-4 border-4 border-ink bg-cream px-4 py-2 text-center font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink shadow-brutal-sm"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              {hint}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The reveal modal. */}
      <AnimatePresence mode="wait">
        {selected && <MemoryModal key={selected.id} memory={selected} onClose={close} />}
      </AnimatePresence>
    </div>
  );
}
