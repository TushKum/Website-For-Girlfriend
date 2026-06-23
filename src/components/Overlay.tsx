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

      {/* Scattered Y2K stickers + brutalist doodles framing the dashboard. */}
      <AnimatePresence>{started && !isOpen && <DashboardStickers />}</AnimatePresence>

      {/* The reveal modal. */}
      <AnimatePresence mode="wait">
        {selected && <MemoryModal key={selected.id} memory={selected} onClose={close} />}
      </AnimatePresence>
    </div>
  );
}

/**
 * One decorative sticker: a slapped-on, slightly-rotated element that pops in
 * with a spring, then idly bobs. Purely ornamental — never interactive.
 */
function Sticker({
  className,
  rotate,
  delay,
  bob = -6,
  dur = 4.5,
  children,
}: {
  className: string;
  rotate: number;
  delay: number;
  bob?: number;
  dur?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={`absolute ${className}`}
      initial={{ opacity: 0, scale: 0.5, rotate: rotate - 10 }}
      animate={{ opacity: 1, scale: 1, rotate }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.5, delay, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <motion.div
        animate={{ y: [0, bob, 0] }}
        transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/**
 * DashboardStickers — a layer of Y2K-brutalist stickers scattered across the
 * top band and side edges, framing (never covering) the photo carousel. All
 * ornamental, so the layer stays pointer-events-none.
 */
function DashboardStickers() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* EST. stamp. */}
      <Sticker className="left-[21%] top-8" rotate={-7} delay={0.3}>
        <span className="brutal-stamp bg-rose-gold text-cream">✶ est. 2026</span>
      </Sticker>

      {/* Holographic "4 ever" chip. */}
      <Sticker className="left-[31%] top-[4.5rem]" rotate={5} delay={0.45} dur={5.2}>
        <span className="brutal-chip bg-cream shadow-brutal-sm">
          <span className="holo-text">♡ 4 ever ♡</span>
        </span>
      </Sticker>

      {/* "Y2K" holo badge, top-center. */}
      <Sticker className="left-[45%] top-7" rotate={-4} delay={0.6} dur={4.8}>
        <span className="brutal-chip bg-ink">
          <span className="holo-text">✦ y2k ✦</span>
        </span>
      </Sticker>

      {/* "100% US" pixel-square. */}
      <Sticker className="left-[57%] top-6" rotate={6} delay={0.4} dur={5}>
        <div className="brutal-card bg-petal px-3 py-2 text-center leading-none shadow-brutal-sm">
          <p className="font-grotesk text-base font-bold uppercase text-ink">100%</p>
          <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-rose-gold-deep">us</p>
        </div>
      </Sticker>

      {/* Barcode sticker. */}
      <Sticker className="left-[69%] top-[5rem]" rotate={-6} delay={0.55} dur={5.4}>
        <div className="brutal-card bg-cream p-1.5 shadow-brutal-sm">
          <div
            className="h-6 w-16 border-2 border-ink"
            style={{
              background:
                'repeating-linear-gradient(90deg,#160d11 0 2px,#fff 2px 4px,#160d11 4px 5px,#fff 5px 9px,#160d11 9px 11px,#fff 11px 14px)',
            }}
          />
          <p className="mt-1 text-center font-mono text-[7px] uppercase tracking-[0.2em] text-ink">
            ♥ forever
          </p>
        </div>
      </Sticker>

      {/* Star burst, upper-right of the top band. */}
      <Sticker className="left-[80%] top-9" rotate={12} delay={0.7} bob={-9} dur={4.2}>
        <span className="y2k-twinkle inline-block text-4xl text-petal drop-shadow-[2px_2px_0_#160d11]">
          ✦
        </span>
      </Sticker>

      {/* Big heart sticker on the left edge, below the title. */}
      <Sticker className="left-5 top-[25%]" rotate={-12} delay={0.5} dur={5.6}>
        <div className="brutal-card flex h-14 w-14 items-center justify-center bg-blush text-3xl">
          ♥
        </div>
      </Sticker>

      {/* "NO.1" stamp on the right edge, below PLAY. */}
      <Sticker className="right-6 top-[20%]" rotate={9} delay={0.65} dur={4.9}>
        <div className="brutal-card bg-ink px-3 py-2 text-center leading-none shadow-brutal-rose">
          <p className="font-grotesk text-sm font-bold uppercase text-cream">no.1</p>
          <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-petal">girl</p>
        </div>
      </Sticker>

      {/* Loose twinkling sparkles at the edges for extra bling. */}
      <Sticker className="left-[14%] top-[32%]" rotate={0} delay={0.8} bob={-7} dur={3.8}>
        <span className="y2k-twinkle inline-block text-2xl text-rose-gold-light">✧</span>
      </Sticker>
      <Sticker className="right-[11%] top-[33%]" rotate={0} delay={0.9} bob={-7} dur={4.4}>
        <span className="y2k-twinkle inline-block text-2xl text-petal">★</span>
      </Sticker>
      <Sticker className="left-[88%] top-[15%]" rotate={0} delay={1} bob={-6} dur={3.6}>
        <span className="y2k-twinkle inline-block text-xl text-rose-gold">✦</span>
      </Sticker>
    </div>
  );
}
