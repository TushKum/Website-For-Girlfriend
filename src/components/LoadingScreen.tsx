import { AnimatePresence, motion } from 'framer-motion';
import { useMemoryStore } from '../store/useMemoryStore';
import { MEMORIES } from '../data/memories';

/**
 * LoadingScreen.tsx
 *
 * A hushed, luxurious preloader shown over the stage until every photo texture
 * is ready — so the globe is never caught mid-dress with blank cards.
 *
 *  - The counter tracks the store's `loaded` count against the total memories,
 *    fed by the fault-tolerant `useImagePreloader`.
 *  - The store's `isReady` flag is the authoritative dismissal signal, then we
 *    fade the veil away.
 */
export default function LoadingScreen() {
  const loaded = useMemoryStore((s) => s.loaded);
  const isReady = useMemoryStore((s) => s.isReady);

  const pct = isReady
    ? 100
    : Math.min(100, Math.round((loaded / MEMORIES.length) * 100));

  return (
    <AnimatePresence>
      {!isReady && (
        <motion.div
          className="grain fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#ffeef3]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Slowly breathing gold ring. */}
          <motion.div
            className="relative h-16 w-16"
            animate={{ rotate: 360 }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
          >
            <span className="absolute inset-0 rounded-full border border-rose-gold/15" />
            <span className="absolute inset-0 rounded-full border-t border-r border-rose-gold/80" />
          </motion.div>

          <motion.p
            className="mt-8 font-display text-lg tracking-wide text-rose-gold-deep"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Gathering our memories
          </motion.p>

          {/* Hairline progress bar + counter. */}
          <div className="mt-6 h-px w-48 overflow-hidden bg-rose-gold/15">
            <motion.div
              className="h-full bg-gradient-to-r from-rose-gold to-petal"
              initial={{ width: '0%' }}
              animate={{ width: `${pct}%` }}
              transition={{ ease: 'easeOut', duration: 0.4 }}
            />
          </div>
          <p className="mt-3 font-sans text-[11px] uppercase tracking-[0.35em] text-rose-gold/60">
            {pct}%
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
