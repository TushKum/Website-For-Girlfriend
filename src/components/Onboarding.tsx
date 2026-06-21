import { AnimatePresence, motion } from 'framer-motion';
import { useVisionStore } from '../store/useVisionStore';

interface OnboardingProps {
  /** Request the camera and begin hand tracking. */
  onAllow: () => void;
  /** Continue with the mouse-only fallback. */
  onSkip: () => void;
}

/**
 * Onboarding.tsx
 *
 * A sleek, non-intrusive welcome that asks (politely) for the camera and shows,
 * with a gently looping animation, how to use your hands to control the scene.
 * It never traps the user: "explore without gestures" is always one tap away,
 * and a denied permission degrades into the same graceful fallback.
 *
 * Visible until the user leaves onboarding (`started`); reflects live `status`
 * for the requesting / denied states.
 */
export default function Onboarding({ onAllow, onSkip }: OnboardingProps) {
  const status = useVisionStore((s) => s.status);
  const started = useVisionStore((s) => s.started);

  const requesting = status === 'requesting';
  const denied = status === 'denied';

  return (
    <AnimatePresence>
      {!started && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Soft scrim so the card reads against the lively scene. */}
          <div className="absolute inset-0 bg-cream/40 backdrop-blur-sm" />

          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/70 bg-white/55 px-9 py-10 text-center shadow-[0_30px_90px_-30px_rgba(200,120,140,0.55)] backdrop-blur-2xl"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <GestureDemo />

            <p className="mt-6 font-sans text-[10px] uppercase tracking-[0.5em] text-rose-gold/80">
              For You
            </p>
            <h1 className="mt-3 font-display text-3xl font-medium leading-tight text-rose-gold-deep">
              Reach out and touch
              <br /> our memories
            </h1>
            <p className="mx-auto mt-4 max-w-xs font-serif text-[17px] leading-relaxed text-[#7c645e]">
              Allow your camera and use your hands — <em>pinch</em> to turn the
              carousel, open your palm to draw it near, and <em>clap</em> to
              release a flurry of hearts.
            </p>

            {denied && (
              <p className="mt-4 font-sans text-xs text-rose-gold-deep/90">
                Camera access was blocked — you can still explore with your mouse.
              </p>
            )}

            <div className="mt-8 flex flex-col items-center gap-3">
              <button
                onClick={onAllow}
                disabled={requesting}
                className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-rose-gold to-petal px-7 py-3.5 font-sans text-sm font-medium tracking-wide text-white shadow-lg shadow-rose-gold/30 transition-all duration-300 hover:shadow-xl hover:shadow-rose-gold/40 disabled:opacity-70"
              >
                {requesting ? 'Waking the camera…' : 'Allow camera & begin'}
              </button>
              <button
                onClick={onSkip}
                className="font-sans text-xs tracking-wide text-[#9a807a] underline-offset-4 transition-colors hover:text-rose-gold-deep hover:underline"
              >
                Explore without gestures
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * A looping illustration of the pinch-and-turn gesture: two soft dots (thumb +
 * index) that come together to pinch while a circular arrow sweeps around them.
 */
function GestureDemo() {
  return (
    <div className="mx-auto flex h-24 w-24 items-center justify-center">
      <svg viewBox="0 0 120 120" className="h-24 w-24">
        {/* Rotating sweep arrow. */}
        <motion.g
          style={{ originX: '60px', originY: '60px' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        >
          <path
            d="M60 18 A42 42 0 0 1 102 60"
            fill="none"
            stroke="#e6b9ad"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M102 60 l-7 -9 l11 1 z" fill="#e6b9ad" />
        </motion.g>

        {/* Thumb dot. */}
        <motion.circle
          cx="48"
          cy="72"
          r="9"
          fill="#c98b7e"
          animate={{ cx: [48, 56, 48], cy: [72, 64, 72] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Index dot. */}
        <motion.circle
          cx="72"
          cy="48"
          r="9"
          fill="#a86a5f"
          animate={{ cx: [72, 60, 72], cy: [48, 60, 48] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Pinch spark. */}
        <motion.circle
          cx="60"
          cy="60"
          r="4"
          fill="#fff"
          animate={{ opacity: [0, 0, 1, 0], scale: [0.5, 0.5, 1.4, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}
