import * as THREE from 'three';

/**
 * lily.ts
 *
 * A stylised white lily sprite (six soft, blush-tipped petals around a golden
 * centre) for the prayer-pose flower shower. Built once on a canvas and
 * memoised — like the heart assets.
 */

let lilyTex: THREE.CanvasTexture | null = null;

export function lilySpriteTexture(): THREE.CanvasTexture {
  if (lilyTex) return lilyTex;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const c = size / 2;

  ctx.translate(c, c);

  const petalLen = size * 0.42;
  const petalW = size * 0.17;

  // Six radial petals.
  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 3);
    drawPetal(ctx, petalLen, petalW);
    ctx.restore();
  }

  // Golden centre.
  const center = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.1);
  center.addColorStop(0, 'rgba(255,214,120,1)');
  center.addColorStop(0.6, 'rgba(255,190,90,0.95)');
  center.addColorStop(1, 'rgba(255,190,90,0)');
  ctx.fillStyle = center;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.1, 0, Math.PI * 2);
  ctx.fill();

  // A few stamen dots.
  ctx.fillStyle = 'rgba(214,150,60,0.9)';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const r = size * 0.05;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * r, Math.sin(a) * r, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }

  lilyTex = new THREE.CanvasTexture(canvas);
  lilyTex.colorSpace = THREE.SRGBColorSpace;
  lilyTex.needsUpdate = true;
  return lilyTex;
}

/** A single petal pointing "up" (−Y) from the flower centre. */
function drawPetal(ctx: CanvasRenderingContext2D, len: number, w: number): void {
  const grad = ctx.createLinearGradient(0, 0, 0, -len);
  grad.addColorStop(0, 'rgba(255,250,250,1)');
  grad.addColorStop(0.25, 'rgba(255,243,245,0.98)');
  grad.addColorStop(1, 'rgba(255,222,233,0.6)'); // soft blush tip
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(w, -len * 0.5, 0, -len); // right edge to the point
  ctx.quadraticCurveTo(-w, -len * 0.5, 0, 0); // left edge back to centre
  ctx.closePath();
  ctx.fill();
}
