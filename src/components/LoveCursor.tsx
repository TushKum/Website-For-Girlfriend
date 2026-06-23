import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * LoveCursor.tsx
 *
 * A custom Y2K-brutalist pointer. A chunky ink-outlined heart springs after the
 * mouse, grows when it's over anything clickable, and leaves a trail of
 * holographic "love dripples" — little hearts that drip down and fade as the
 * cursor moves. Desktop-only (pointer: fine); it bows out on touch devices and
 * respects prefers-reduced-motion by skipping the drip trail.
 */
interface Drip {
  id: number;
  x: number;
  y: number;
  drift: number;
  size: number;
}

export default function LoveCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [drips, setDrips] = useState<Drip[]>([]);

  // Raw pointer position → springy follow for a weighty, premium feel.
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 600, damping: 28, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 600, damping: 28, mass: 0.5 });

  const lastDrip = useRef({ x: -100, y: -100 });
  const idRef = useRef(0);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine) return; // touch / coarse pointers keep their native behaviour
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setEnabled(true);
    document.documentElement.style.cursor = 'none';

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (reduced) return;

      // Throttle drips by travel distance so fast moves trail, slow ones don't.
      const dx = e.clientX - lastDrip.current.x;
      const dy = e.clientY - lastDrip.current.y;
      if (dx * dx + dy * dy < 26 * 26) return;
      lastDrip.current = { x: e.clientX, y: e.clientY };

      const id = idRef.current++;
      setDrips((prev) => [
        ...prev.slice(-20),
        {
          id,
          x: e.clientX + (Math.random() * 10 - 5),
          y: e.clientY + (Math.random() * 8 - 2),
          drift: Math.random() * 22 - 11,
          size: 11 + Math.random() * 11,
        },
      ]);
    };

    // Grow + tilt over anything interactive.
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      setHovering(!!t?.closest('button, a, input, textarea, label, [role="button"]'));
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      document.documentElement.style.cursor = '';
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {/* ── Love dripples ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {drips.map((d) => (
          <motion.span
            key={d.id}
            className="absolute -ml-2 -mt-2 select-none leading-none will-change-transform"
            style={{ left: d.x, top: d.y, fontSize: d.size }}
            initial={{ opacity: 1, scale: 0.5, y: 0, x: 0, rotate: 0 }}
            animate={{ opacity: 0, scale: 1, y: 38, x: d.drift, rotate: d.drift > 0 ? 20 : -20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.95, ease: 'easeOut' }}
            onAnimationComplete={() => setDrips((prev) => prev.filter((p) => p.id !== d.id))}
          >
            <span className="holo-text">♥</span>
          </motion.span>
        ))}
      </AnimatePresence>

      {/* ── The heart pointer ───────────────────────────────────────────── */}
      <motion.div className="absolute left-0 top-0 will-change-transform" style={{ x: sx, y: sy }}>
        <motion.div
          className="-ml-[14px] -mt-[12px]"
          animate={{ scale: hovering ? 1.7 : 1, rotate: hovering ? -10 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 24 }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" className="block drop-shadow-[2px_2px_0_rgba(22,13,17,0.9)]">
            <path
              d="M12 21s-7.6-4.7-10-9.3C.2 8.5 1.8 4.8 5.3 4.8c2.1 0 3.4 1.2 4 2.4l.8 1.1.8-1.1c.6-1.2 1.9-2.4 4-2.4 3.5 0 5 3.7 3.3 6.9C19.6 16.3 12 21 12 21z"
              fill="#ffc6d5"
              stroke="#160d11"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Y2K gloss highlight. */}
            <ellipse cx="8.6" cy="9.4" rx="1.9" ry="1.2" fill="#fff" opacity="0.85" transform="rotate(-25 8.6 9.4)" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
