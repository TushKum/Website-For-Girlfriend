import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'framer-motion';
import { useGateStore } from '../store/useGateStore';
import { useVisionStore } from '../store/useVisionStore';

/**
 * LoveDeck.tsx
 *
 * "Reasons I love you" — a swipeable Y2K-brutalist card deck. She flings each
 * card away (drag + velocity, with springy snap-back under the threshold) to
 * reveal the next; the love/skip buttons fling the top card too. Up top, a live
 * "days together" ticker counts every second with flip-style digit rolls. When
 * the deck runs out, a heart-shower finale invites her to replay our moment.
 *
 * Self-contained and pointer-safe: a full-screen panel that never touches the
 * 3D carousel's own drag handling.
 */

/** Day one. Override with VITE_ANNIVERSARY="YYYY-MM-DD" in a .env file. */
const ANNIVERSARY = new Date(
  (import.meta.env.VITE_ANNIVERSARY as string | undefined) ?? '2024-02-14T00:00:00',
);

interface Reason {
  id: number;
  glyph: string;
  text: string;
  tint: string; // tailwind bg utility for the card face
}

const REASONS: Reason[] = [
  { id: 1, glyph: '☀', text: 'The way your laugh turns an ordinary day into the best one I’ve had.', tint: 'bg-peach' },
  { id: 2, glyph: '✦', text: 'How safe the whole world feels the second your hand finds mine.', tint: 'bg-blush' },
  { id: 3, glyph: '♡', text: 'You remember the tiny things — and somehow they’re always the big things.', tint: 'bg-petal' },
  { id: 4, glyph: '✿', text: 'That little crinkle by your eyes a half-second before you smile.', tint: 'bg-champagne' },
  { id: 5, glyph: '★', text: 'You make me want to be softer, braver, and more myself.', tint: 'bg-blush' },
  { id: 6, glyph: '☾', text: 'Late-night talks with you feel exactly like coming home.', tint: 'bg-peach' },
  { id: 7, glyph: '❀', text: 'You believe in me on the days I’ve completely forgotten how to.', tint: 'bg-petal' },
  { id: 8, glyph: '✶', text: 'Every song sounds a little more like us when you’re around.', tint: 'bg-champagne' },
  { id: 9, glyph: '♥', text: 'Loving you is the easiest, happiest thing I get to do.', tint: 'bg-blush' },
];

export default function LoveDeck() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const name = useGateStore((s) => s.visitorName);
  const triggerMoment = useVisionStore((s) => s.triggerMoment);

  const finished = index >= REASONS.length;

  // The top card exposes an imperative `flick` so the buttons can sling it.
  const [topHandle, setTopHandle] = useState<CardHandle | null>(null);

  const advance = () => setIndex((i) => i + 1);
  const restart = () => setIndex(0);

  // Reset to the top each time the panel re-opens.
  useEffect(() => {
    if (open) setIndex(0);
  }, [open]);

  const visible = REASONS.slice(index, index + 3);

  return (
    <>
      {/* ── Floating opener (right rail, under the music toggle) ─────────── */}
      <button
        onClick={() => setOpen(true)}
        className="brutal-btn pointer-events-auto fixed right-6 top-[5.25rem] z-30 bg-cream"
        aria-label="Open reasons I love you"
      >
        <span className="holo-text">♡ Reasons</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* A warm sunset "room", distinct from the other panels. */}
            <div
              className="brutal-grid absolute inset-0"
              style={{
                background:
                  'radial-gradient(130% 120% at 50% 0%, #fff0f5 0%, #ffd9c9 42%, #ffc2d6 74%, #f7b6d2 100%)',
              }}
            />

            <div className="relative mx-auto flex min-h-full w-full max-w-xl flex-col px-5 py-7 sm:px-8">
              {/* Header + close. */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="brutal-chip rotate-[-2deg] bg-rose-gold text-cream">
                    just for you
                  </span>
                  <h2 className="mt-3 font-grotesk text-4xl font-bold uppercase leading-[0.88] text-ink sm:text-5xl">
                    Reasons <span className="holo-text">I ♥ you</span>
                  </h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close reasons"
                  className="brutal-card flex h-11 w-11 shrink-0 items-center justify-center bg-blush text-lg font-bold text-ink shadow-brutal-sm"
                >
                  ✕
                </button>
              </div>

              {/* Live "days together" ticker. */}
              <TogetherCounter active={open} />

              {/* ── The deck / finale ──────────────────────────────────── */}
              <div className="relative mt-6 flex flex-1 items-center justify-center">
                {finished ? (
                  <Finale name={name} onReplay={() => triggerMoment('heart')} onRestart={restart} />
                ) : (
                  <div className="relative h-[20rem] w-full max-w-sm sm:h-[22rem]">
                    {visible
                      .map((reason, i) => ({ reason, position: i }))
                      .reverse() // paint deepest first so the top card sits on top
                      .map(({ reason, position }) => (
                        <ReasonCard
                          key={reason.id}
                          ref={position === 0 ? setTopHandle : undefined}
                          reason={reason}
                          position={position}
                          draggable={position === 0}
                          onDone={advance}
                        />
                      ))}
                  </div>
                )}
              </div>

              {/* ── Controls ───────────────────────────────────────────── */}
              {!finished && (
                <div className="mt-5 flex items-center justify-center gap-5 pb-2">
                  <button
                    onClick={() => topHandle?.flick(-1)}
                    aria-label="Skip this one"
                    className="brutal-card flex h-14 w-14 items-center justify-center bg-cream text-2xl text-ink/60 shadow-brutal-sm transition-transform hover:-translate-y-[2px] active:translate-y-[3px]"
                  >
                    ✦
                  </button>

                  <p className="w-20 text-center font-mono text-xs font-bold uppercase tracking-widest text-rose-gold-deep">
                    {index + 1} / {REASONS.length}
                  </p>

                  <button
                    onClick={() => topHandle?.flick(1)}
                    aria-label="Love this one"
                    className="brutal-card flex h-14 w-14 items-center justify-center bg-petal text-2xl text-ink shadow-brutal-sm transition-transform hover:-translate-y-[2px] active:translate-y-[3px]"
                  >
                    ♥
                  </button>
                </div>
              )}

              {!finished && (
                <p className="pb-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40">
                  swipe the card · or tap ♥
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * One swipeable reason card.
 * ───────────────────────────────────────────────────────────────────────── */

interface CardHandle {
  flick: (dir: number) => void;
}

interface ReasonCardProps {
  reason: Reason;
  position: number; // 0 = top of the stack
  draggable: boolean;
  onDone: () => void;
}

const ReasonCard = forwardRef<CardHandle, ReasonCardProps>(function ReasonCard(
  { reason, position, draggable, onDone },
  ref,
) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 260], [-15, 15]);
  const opacity = useTransform(x, [-320, -150, 0, 150, 320], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [30, 130], [0, 1]);
  const skipOpacity = useTransform(x, [-130, -30], [1, 0]);

  // Fling the card off-screen, then advance the deck once it's gone.
  const flick = (dir: number) =>
    animate(x, dir * 720, {
      duration: 0.34,
      ease: [0.4, 0, 0.8, 0.2],
      onComplete: onDone,
    });

  useImperativeHandle(ref, () => ({ flick }), []);

  const handleEnd = (_: unknown, info: PanInfo) => {
    const past = Math.abs(info.offset.x) > 110 || Math.abs(info.velocity.x) > 600;
    if (past) flick(info.offset.x >= 0 ? 1 : -1);
    // Under the threshold, framer's drag constraints spring it back to centre.
  };

  return (
    <motion.div
      className="absolute inset-0"
      style={{ x, rotate, opacity, zIndex: 10 - position }}
      drag={draggable ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={draggable ? handleEnd : undefined}
      initial={{ scale: 0.92, y: 30, opacity: 0 }}
      animate={{ scale: 1 - position * 0.05, y: position * 16, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      whileTap={draggable ? { cursor: 'grabbing' } : undefined}
    >
      <div
        className={`brutal-card-xl flex h-full w-full flex-col justify-between ${reason.tint} p-7 ${
          draggable ? 'cursor-grab' : ''
        }`}
      >
        {/* Drag-feedback stamps. */}
        <div className="flex items-start justify-between">
          <span className="font-grotesk text-5xl leading-none text-ink/80">{reason.glyph}</span>
          {draggable && (
            <>
              <motion.span
                style={{ opacity: likeOpacity }}
                className="brutal-stamp rotate-[10deg] bg-rose-gold text-cream"
              >
                ♥ love
              </motion.span>
              <motion.span
                style={{ opacity: skipOpacity }}
                className="brutal-stamp absolute right-7 rotate-[-10deg] bg-ink text-cream"
              >
                ✦ next
              </motion.span>
            </>
          )}
        </div>

        <p className="font-serif text-[1.7rem] font-medium leading-snug text-ink">
          {reason.text}
        </p>

        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/45">
          reason no. {reason.id}
        </p>
      </div>
    </motion.div>
  );
});

/* ─────────────────────────────────────────────────────────────────────────
 * Live "days together" ticker with flip-style digits.
 * ───────────────────────────────────────────────────────────────────────── */

function TogetherCounter({ active }: { active: boolean }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [active]);

  const { days, hours, mins, secs } = useMemo(() => {
    const total = Math.max(0, Math.floor((now - ANNIVERSARY.getTime()) / 1000));
    return {
      days: Math.floor(total / 86400),
      hours: Math.floor((total % 86400) / 3600),
      mins: Math.floor((total % 3600) / 60),
      secs: total % 60,
    };
  }, [now]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="mt-5 border-4 border-ink bg-cream/85 px-4 py-3 shadow-brutal-sm">
      <p className="text-center font-mono text-[9px] uppercase tracking-[0.3em] text-rose-gold-deep">
        ✶ together for ✶
      </p>
      <div className="mt-2 flex items-stretch justify-center gap-2 sm:gap-3">
        <Unit value={days.toLocaleString()} label="days" wide />
        <Colon />
        <Unit value={pad(hours)} label="hrs" />
        <Colon />
        <Unit value={pad(mins)} label="min" />
        <Colon />
        <Unit value={pad(secs)} label="sec" />
      </div>
    </div>
  );
}

function Unit({ value, label, wide = false }: { value: string; label: string; wide?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex h-10 items-center justify-center overflow-hidden border-3 border-ink bg-ink px-2 ${
          wide ? 'min-w-[3.5rem]' : 'min-w-[2.5rem]'
        }`}
      >
        {/* Keyed (no AnimatePresence) so React keeps exactly one digit node per
            tick — the new value slides up as the old unmounts cleanly, with zero
            risk of stale spans piling up inside the clipped cell. */}
        <motion.span
          key={value}
          className="block font-grotesk text-xl font-bold tabular-nums text-cream"
          initial={{ y: '90%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {value}
        </motion.span>
      </div>
      <span className="mt-1 font-mono text-[8px] uppercase tracking-[0.2em] text-ink/55">
        {label}
      </span>
    </div>
  );
}

function Colon() {
  return (
    <span className="self-center pb-3 font-grotesk text-xl font-bold text-ink/40">:</span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Finale — a heart shower + replay invitation.
 * ───────────────────────────────────────────────────────────────────────── */

function Finale({
  name,
  onReplay,
  onRestart,
}: {
  name: string;
  onReplay: () => void;
  onRestart: () => void;
}) {
  const hearts = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: 6 + Math.random() * 88,
        delay: Math.random() * 0.8,
        size: 16 + Math.random() * 22,
        drift: Math.random() * 40 - 20,
      })),
    [],
  );

  return (
    <motion.div
      className="relative flex w-full max-w-sm flex-col items-center text-center"
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
    >
      {/* Rising hearts. */}
      <div className="pointer-events-none absolute inset-x-0 -top-10 bottom-0 overflow-visible">
        {hearts.map((h) => (
          <motion.span
            key={h.id}
            className="absolute bottom-0 select-none text-petal"
            style={{ left: `${h.left}%`, fontSize: h.size }}
            initial={{ y: 40, opacity: 0, scale: 0.5 }}
            animate={{ y: -260, x: h.drift, opacity: [0, 1, 1, 0], scale: 1, rotate: h.drift }}
            transition={{
              duration: 2.6,
              delay: h.delay,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          >
            ♥
          </motion.span>
        ))}
      </div>

      <div className="relative brutal-card-xl bg-cream px-7 py-9">
        <span className="text-5xl">💌</span>
        <h3 className="mt-4 font-grotesk text-3xl font-bold uppercase leading-[0.9] text-ink">
          …and a<br />
          <span className="holo-text">thousand more</span>
        </h3>
        <p className="mt-4 font-serif text-lg leading-snug text-ink/80">
          There aren’t enough cards in the world{name ? `, ${name}` : ''}. You’re my
          favorite reason for everything.
        </p>

        <div className="mt-7 flex flex-col gap-3">
          <button onClick={onReplay} className="brutal-btn-rose w-full">
            ♥ Shower me with hearts
          </button>
          <button onClick={onRestart} className="brutal-btn w-full bg-cream">
            ↻ Read them again
          </button>
        </div>
      </div>
    </motion.div>
  );
}
