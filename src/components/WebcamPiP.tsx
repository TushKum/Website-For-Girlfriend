import { useEffect, useRef, type RefObject } from 'react';
import { motion } from 'framer-motion';
import { loadOpenCV, applyRomanticBloom } from '../vision/opencv';

interface WebcamPiPProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  /** Only processes frames while true (tracking is live). */
  active: boolean;
}

const W = 260;
const H = 195;

/**
 * WebcamPiP.tsx
 *
 * A small, elegant picture-in-picture of the user in the corner — with a
 * real-time OpenCV.js bloom so even the webcam feed matches the soft, romantic
 * aesthetic. It draws the shared <video> (mirrored, selfie-style) into a tiny
 * offscreen canvas, runs the bloom, and paints the result.
 *
 * OpenCV loads lazily on mount; until (or unless) it's ready, we gracefully
 * fall back to a CSS-blurred, warm-tinted raw frame — so the PiP always looks
 * intentional, never broken. Its render loop is its own rAF, independent of
 * React and of the Three.js loop.
 */
export default function WebcamPiP({ videoRef, active }: WebcamPiPProps) {
  const outRef = useRef<HTMLCanvasElement>(null);
  const tmpRef = useRef<HTMLCanvasElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cvRef = useRef<any>(null);

  useEffect(() => {
    if (!active) return;

    let raf = 0;
    let cancelled = false;

    // Offscreen scratch canvas for the mirrored source frame.
    const tmp = document.createElement('canvas');
    tmp.width = W;
    tmp.height = H;
    tmpRef.current = tmp;
    const tctx = tmp.getContext('2d')!;

    loadOpenCV()
      .then((cv) => {
        if (!cancelled) cvRef.current = cv;
      })
      .catch(() => {
        /* fall back to CSS blur path below */
      });

    const draw = () => {
      const video = videoRef.current;
      const out = outRef.current;
      if (video && out && video.readyState >= 2) {
        // Mirror the source frame (selfie view).
        tctx.save();
        tctx.translate(W, 0);
        tctx.scale(-1, 1);
        tctx.drawImage(video, 0, 0, W, H);
        tctx.restore();

        const octx = out.getContext('2d')!;
        if (cvRef.current) {
          try {
            applyRomanticBloom(cvRef.current, tmp, out);
          } catch {
            octx.drawImage(tmp, 0, 0);
          }
        } else {
          // Graceful fallback: soft blur + warm wash via Canvas filters.
          octx.save();
          octx.filter = 'blur(1.2px) saturate(1.1) brightness(1.06)';
          octx.drawImage(tmp, 0, 0);
          octx.restore();
          octx.fillStyle = 'rgba(255,205,215,0.12)';
          octx.fillRect(0, 0, W, H);
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [active, videoRef]);

  if (!active) return null;

  return (
    <motion.div
      className="pointer-events-none fixed bottom-6 right-6 z-30"
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/60 shadow-[0_18px_50px_-18px_rgba(200,120,140,0.6)] ring-1 ring-rose-gold/20">
        <canvas ref={outRef} width={W} height={H} className="block h-[130px] w-[174px]" />
        {/* Frosted edge + label. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/25 to-transparent" />
        <span className="absolute bottom-1.5 left-2.5 font-display text-[11px] italic text-white drop-shadow-[0_1px_3px_rgba(180,90,110,0.9)]">
          you&nbsp;♡
        </span>
      </div>
    </motion.div>
  );
}
