import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useVisionStore } from '../store/useVisionStore';

/** How long the giant heart/lily holds the screen (ms). */
const HOLD_MS = 2800;

/** Fixed sparkle positions (%), each with its own twinkle delay. */
const SPARKLES = [
  { x: 14, y: 22, s: 28, d: 0 },
  { x: 82, y: 18, s: 22, d: 0.4 },
  { x: 24, y: 74, s: 20, d: 0.8 },
  { x: 76, y: 70, s: 30, d: 0.2 },
  { x: 50, y: 12, s: 18, d: 0.6 },
  { x: 90, y: 46, s: 16, d: 1.0 },
  { x: 8, y: 50, s: 18, d: 1.2 },
  { x: 60, y: 86, s: 22, d: 0.5 },
];

/**
 * MomentOverlay.tsx
 *
 * The show-stopper. When the user claps (heart) or holds a prayer pose (lily),
 * the 3D scene freezes (see CanvasContainer's frameloop) and a giant, glossy
 * Y2K heart or lily blooms across the screen — chrome sheen, holographic text,
 * twinkling sparkles — then gently bows out.
 */
export default function MomentOverlay() {
  const moment = useVisionStore((s) => s.moment);
  const momentId = useVisionStore((s) => s.momentId);
  const clearMoment = useVisionStore((s) => s.clearMoment);

  // Auto-dismiss after the hold; re-runs on every trigger via momentId.
  useEffect(() => {
    if (!moment) return;
    const t = window.setTimeout(clearMoment, HOLD_MS);
    return () => window.clearTimeout(t);
  }, [moment, momentId, clearMoment]);

  const isHeart = moment === 'heart';
  const label = isHeart ? 'I ♥ YOU' : 'FOREVER';

  return (
    <AnimatePresence mode="wait">
      {moment && (
        <motion.div
          key={momentId}
          className="pointer-events-none fixed inset-0 z-[55] flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Holographic Y2K wash that dims + blurs the frozen scene. */}
          <div
            className="absolute inset-0 backdrop-blur-[3px]"
            style={{
              background:
                'radial-gradient(120% 120% at 50% 45%, rgba(255,180,214,0.45) 0%, rgba(183,139,255,0.35) 45%, rgba(127,212,255,0.30) 100%)',
            }}
          />

          {/* Sparkles. */}
          {SPARKLES.map((sp, i) => (
            <span
              key={i}
              className="y2k-twinkle absolute select-none"
              style={{
                left: `${sp.x}%`,
                top: `${sp.y}%`,
                fontSize: sp.s,
                animationDelay: `${sp.d}s`,
                color: '#fff',
                textShadow: '0 0 10px rgba(255,120,190,0.9)',
              }}
            >
              ✦
            </span>
          ))}

          {/* The giant graphic. */}
          <motion.div
            initial={{ scale: 0.3, rotate: -12, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 13, opacity: { duration: 0.25 } }}
            className="relative drop-shadow-[0_20px_40px_rgba(190,40,120,0.45)]"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              className="h-[52vmin] w-[52vmin]"
            >
              {isHeart ? <GlossyHeart /> : <GlossyLily />}
            </motion.div>
          </motion.div>

          {/* Holographic blingee caption. */}
          <motion.p
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="holo-text mt-[3vmin] font-grotesk text-5xl font-bold uppercase tracking-tight sm:text-6xl"
            style={{ WebkitTextStroke: '2px rgba(255,255,255,0.7)' }}
          >
            {label}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** A glossy Y2K heart — radial candy gradient + a chrome rim + gloss highlight. */
function GlossyHeart() {
  return (
    <svg viewBox="0 0 32 29.6" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="moment-heart" cx="38%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#fff2f8" />
          <stop offset="32%" stopColor="#ff8cc6" />
          <stop offset="66%" stopColor="#ff2d95" />
          <stop offset="100%" stopColor="#c0146f" />
        </radialGradient>
      </defs>
      <path
        d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4 c0,9.4,9.5,11.9,16,21.2c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z"
        fill="url(#moment-heart)"
        stroke="#ffffff"
        strokeWidth="1.1"
      />
      {/* Gloss highlight. */}
      <ellipse cx="10" cy="8" rx="4.4" ry="2.8" fill="#ffffff" opacity="0.6" transform="rotate(-28 10 8)" />
    </svg>
  );
}

/** A glossy Y2K lily — six chrome-sheen petals around a golden sparkle centre. */
function GlossyLily() {
  return (
    <svg viewBox="-50 -50 100 100" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="moment-petal" x1="0" y1="-44" x2="0" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#fff0f6" />
          <stop offset="100%" stopColor="#ffc6df" />
        </linearGradient>
        <radialGradient id="moment-center" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe9a8" />
          <stop offset="60%" stopColor="#ffc24d" />
          <stop offset="100%" stopColor="#e69500" />
        </radialGradient>
      </defs>
      {/* Two offset rings of fat petals for a lush, full bloom. */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={`a${i}`}
          d="M0 8 Q 26 -16 0 -48 Q -26 -16 0 8 Z"
          fill="url(#moment-petal)"
          stroke="#ffffff"
          strokeWidth="1.4"
          transform={`rotate(${i * 60})`}
        />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={`b${i}`}
          d="M0 6 Q 18 -12 0 -36 Q -18 -12 0 6 Z"
          fill="url(#moment-petal)"
          stroke="#ffffff"
          strokeWidth="1.2"
          transform={`rotate(${i * 60 + 30})`}
          opacity="0.92"
        />
      ))}
      <circle r="11" fill="url(#moment-center)" stroke="#ffffff" strokeWidth="1.2" />
    </svg>
  );
}
