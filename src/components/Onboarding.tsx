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
  const error = useVisionStore((s) => s.error);

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
          {/* Brutalist scrim — tight dot-grid + film grain for an HD finish. */}
          <div className="dot-grid grain absolute inset-0 bg-cream/55 backdrop-blur-sm" />

          <motion.div
            className="brutal-card-xl relative w-full max-w-lg"
            initial={{ opacity: 0, y: 28, rotate: -1.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Marquee ticker — the Framer-brutalist signature header band. */}
            <div className="marquee border-b-[5px] border-ink bg-ink py-2">
              <div className="marquee__track font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-cream">
                {Array.from({ length: 2 }).map((_, i) => (
                  <span key={i} className="inline-flex items-center gap-6">
                    <span className="holo-text">Touch our memories</span>
                    <span>✦</span>
                    <span>made for you</span>
                    <span>★</span>
                    <span>pinch · palm · clap · pray</span>
                    <span>✦</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Slapped-on rotated sticker stamp. */}
            <span className="brutal-stamp absolute -right-4 top-16 rotate-[9deg] bg-rose-gold text-cream">
              ✶ 2026
            </span>

            <div className="p-8 sm:p-10">
              <span className="brutal-chip -ml-1 rotate-[-3deg] bg-petal text-ink shadow-brutal-sm">
                How to play
              </span>

              {/* Oversized fluid hero headline — chrome + holo, hard drop shadow. */}
              <h1 className="display-fluid mt-5 font-grotesk font-bold uppercase text-ink">
                <span className="chrome-text">Touch</span>
                <br />
                <span className="holo-text">our</span>
                <br />
                memories
              </h1>

              <div className="mt-6 flex items-center gap-4">
                <div className="shrink-0 border-4 border-ink bg-blush/50 p-1 shadow-brutal-sm">
                  <GestureDemo />
                </div>
                <p className="font-mono text-xs uppercase leading-relaxed tracking-wide text-ink/75">
                  Use your hands — <span className="text-rose-gold-deep">pinch</span> to turn, open
                  palm to pull it near, <span className="text-rose-gold-deep">clap</span> for hearts,
                  <span className="text-rose-gold-deep"> pray</span> for lilies.
                </p>
              </div>

              {denied && (
                <p className="mt-5 border-4 border-ink bg-rose-gold/20 px-3 py-2 font-mono text-xs leading-relaxed text-rose-gold-deep shadow-brutal-sm">
                  {error ?? 'Camera access was blocked.'} Explore with your mouse below.
                </p>
              )}

              <div className="mt-7 flex flex-col gap-3">
                <button onClick={onAllow} disabled={requesting} className="brutal-btn-rose w-full text-base">
                  {requesting ? 'Waking the camera…' : 'Allow camera & begin →'}
                </button>
                <button
                  onClick={onSkip}
                  className="font-mono text-[11px] uppercase tracking-widest text-ink/50 underline-offset-4 transition-colors hover:text-rose-gold-deep hover:underline"
                >
                  Explore without gestures →
                </button>
              </div>
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
