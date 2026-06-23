import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Memory } from '../types/memory';

interface MemoryModalProps {
  memory: Memory;
  onClose: () => void;
}

/** Bump the Unsplash crop to a crisper resolution for the full-screen hero. */
const hiRes = (url: string): string =>
  url.replace('w=600&h=800', 'w=1300&h=1700');

/**
 * MemoryModal.tsx
 *
 * The "closer": a breathtaking full-screen reveal for a single memory.
 *
 *  - A dimmed, blurred backdrop (click-anywhere-to-dismiss) drops the globe
 *    back into the dark.
 *  - A high-fidelity glassmorphism panel slides + scales into view.
 *  - Split layout: the crisp memory photo on the left, and an elegant serif
 *    narrative — Title, Date, Location, and the story — on the right.
 *
 * Mount/unmount (and thus the enter/exit animation) is owned by <AnimatePresence>
 * in the parent overlay; this component only describes the two states.
 */
export default function MemoryModal({ memory, onClose }: MemoryModalProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Backdrop — blurs and dims the stage; click to dismiss. */}
      <div
        className="absolute inset-0 bg-[#3a2730]/45 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />

      {/* The brutalist panel. */}
      <motion.div
        className="brutal-card relative flex w-full max-w-5xl flex-col overflow-hidden bg-cream md:h-[78vh] md:max-h-[680px] md:flex-row"
        initial={{ opacity: 0, y: 28, scale: 0.965 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-label={memory.title}
      >
        {/* ── Left: the photograph ───────────────────────────────────── */}
        <div className="relative h-64 w-full overflow-hidden bg-cream md:h-full md:w-1/2">
          {/* Blur-up placeholder shimmer until the hi-res frame paints. */}
          <div
            className={`absolute inset-0 bg-gradient-to-br from-rose-gold/15 to-white/0 transition-opacity duration-700 ${
              imgLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <img
            src={hiRes(memory.imageURL)}
            alt={memory.title}
            onLoad={() => setImgLoaded(true)}
            className={`h-full w-full object-cover transition-all duration-[1200ms] ease-out ${
              imgLoaded ? 'scale-100 opacity-100 blur-0' : 'scale-105 opacity-0 blur-md'
            }`}
            draggable={false}
          />
          {/* Cinematic edge gradient for seamless blend into the glass. */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-white/25" />
        </div>

        {/* ── Right: the narrative ───────────────────────────────────── */}
        <div className="lux-scroll flex w-full flex-col justify-center overflow-y-auto px-8 py-10 md:w-1/2 md:px-12 md:py-14">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.7, ease: 'easeOut' }}
          >
            {/* Date · Location eyebrow. */}
            <p className="inline-block border-4 border-ink bg-blush px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-ink">
              {memory.date}
              <span className="mx-1.5 text-ink/40">/</span>
              {memory.location}
            </p>

            {/* Title. */}
            <h2 className="mt-4 font-grotesk text-4xl font-bold uppercase leading-[0.92] text-ink text-balance md:text-5xl">
              {memory.title}
            </h2>

            {/* Hard divider. */}
            <div className="my-6 h-1 w-20 bg-ink" />

            {/* The story — typed, like a love letter. */}
            <p className="font-mono text-[15px] leading-relaxed text-ink/80 md:text-base">
              {memory.caption}
            </p>
          </motion.div>
        </div>

        {/* ── Close button ───────────────────────────────────────────── */}
        <button
          onClick={onClose}
          aria-label="Close memory"
          className="brutal-card absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center bg-blush text-ink shadow-brutal-sm transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
      </motion.div>
    </motion.div>
  );
}
