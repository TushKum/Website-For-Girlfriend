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
    ? 'Pinch to turn · Open palm to draw near · Clap to release hearts'
    : 'Drag to turn · Tap a memory to open it';

  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      {/* Gentle framing: a soft light vignette. */}
      <div className="vignette absolute inset-0" />

      {/* Title — recedes when a memory opens. */}
      <AnimatePresence>
        {started && !isOpen && (
          <motion.header
            className="absolute inset-x-0 top-0 flex flex-col items-center pt-9 text-center"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-rose-gold/70">
              For You
            </p>
            <h1 className="mt-2 font-display text-2xl font-medium tracking-wide text-rose-gold-deep md:text-3xl">
              Where Our Story Lives
            </h1>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Explore hint. */}
      <AnimatePresence>
        {started && !isOpen && (
          <motion.div
            className="absolute inset-x-0 bottom-0 flex justify-center pb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, delay: 0.8 }}
          >
            <motion.p
              className="px-4 text-center font-sans text-[11px] uppercase tracking-[0.28em] text-[#a87f86]"
              animate={{ opacity: [0.5, 0.85, 0.5] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
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
