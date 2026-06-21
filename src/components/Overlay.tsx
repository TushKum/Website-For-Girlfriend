import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemoryStore } from '../store/useMemoryStore';
import MemoryModal from './MemoryModal';

/**
 * Overlay.tsx
 *
 * All the 2D, DOM-side chrome that floats above the WebGL stage:
 *  - a refined vignette + film-grain finish over the whole frame,
 *  - a whisper-quiet title and a gentle "how to explore" hint that recede
 *    while a memory is open,
 *  - and the memory reveal modal, whose enter/exit is governed here via
 *    <AnimatePresence>.
 *
 * The container is `pointer-events-none` so it never steals interaction from
 * the canvas; only genuinely interactive children opt back in.
 */
export default function Overlay() {
  const selected = useMemoryStore((s) => s.selected);
  const close = useMemoryStore((s) => s.close);
  const isReady = useMemoryStore((s) => s.isReady);
  const isOpen = selected !== null;

  // Escape closes the open memory.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      {/* Gallery vignette + grain finish. */}
      <div className="vignette grain absolute inset-0" />

      {/* Title — recedes when a memory opens. */}
      <AnimatePresence>
        {isReady && !isOpen && (
          <motion.header
            className="absolute inset-x-0 top-0 flex flex-col items-center pt-10 text-center"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          >
            <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-white/40">
              For You
            </p>
            <h1 className="mt-3 font-display text-2xl font-medium tracking-wide text-champagne/90 md:text-3xl">
              A Constellation of Us
            </h1>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Explore hint — recedes when a memory opens. */}
      <AnimatePresence>
        {isReady && !isOpen && (
          <motion.div
            className="absolute inset-x-0 bottom-0 flex justify-center pb-9"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, delay: 1 }}
          >
            <motion.p
              className="font-sans text-[11px] uppercase tracking-[0.3em] text-white/35"
              animate={{ opacity: [0.35, 0.7, 0.35] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              Drag to explore · Touch a memory to open
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The reveal modal. */}
      <AnimatePresence mode="wait">
        {selected && (
          <MemoryModal key={selected.id} memory={selected} onClose={close} />
        )}
      </AnimatePresence>
    </div>
  );
}
