import { useMemo } from 'react';

/**
 * Sparkles.tsx
 *
 * A subtle ambient layer of twinkling Y2K sparkles drifting over the whole
 * screen — the early-2000s "blingee" shimmer. Purely decorative
 * (pointer-events-none), seeded once, animated entirely in CSS.
 */
const COUNT = 18;
const GLYPHS = ['✦', '✧', '★', '✦'];

export default function Sparkles() {
  const stars = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 8 + Math.random() * 16,
        delay: Math.random() * 3,
        glyph: GLYPHS[i % GLYPHS.length],
        color: ['#ffffff', '#ff9ecf', '#b78bff', '#7fd4ff'][i % 4],
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {stars.map((s) => (
        <span
          key={s.id}
          className="y2k-twinkle absolute select-none"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            fontSize: s.size,
            color: s.color,
            animationDelay: `${s.delay}s`,
            textShadow: '0 0 8px rgba(255,150,200,0.7)',
          }}
        >
          {s.glyph}
        </span>
      ))}
    </div>
  );
}
