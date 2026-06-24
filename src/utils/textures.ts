import * as THREE from 'three';

/**
 * Procedurally-generated textures, created once and shared across the scene.
 *
 * Generating these on a <canvas> at runtime keeps the repo asset-free and lets
 * us tune them in code. Each factory is memoised behind a module-level
 * singleton so we never pay to rebuild them per-frame or per-instance.
 */

let roundedMask: THREE.CanvasTexture | null = null;
let glowSprite: THREE.CanvasTexture | null = null;
let dustSprite: THREE.CanvasTexture | null = null;
let placeholder: THREE.CanvasTexture | null = null;
let playBadge: THREE.CanvasTexture | null = null;

/**
 * A white, anti-aliased rounded-rectangle on transparency.
 *
 * Used as the `alphaMap` on each photo so the planes read as sleek, slightly
 * rounded cards instead of hard-cornered rectangles — without needing custom
 * geometry. Paired with `alphaTest` on the material, the corners are clipped
 * crisply with zero transparency-sorting glitches.
 *
 * @param ratioW aspect width  (matches the plane geometry width)
 * @param ratioH aspect height (matches the plane geometry height)
 */
export function getRoundedRectMask(ratioW = 3, ratioH = 4): THREE.CanvasTexture {
  if (roundedMask) return roundedMask;

  const scale = 256;
  const w = ratioW * scale;
  const h = ratioH * scale;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const radius = Math.min(w, h) * 0.12; // gentle, premium corner radius
  ctx.fillStyle = '#ffffff';
  roundedRectPath(ctx, 0, 0, w, h, radius);
  ctx.fill();

  roundedMask = new THREE.CanvasTexture(canvas);
  roundedMask.colorSpace = THREE.NoColorSpace; // a mask is data, not colour
  roundedMask.anisotropy = 4;
  roundedMask.needsUpdate = true;
  return roundedMask;
}

/**
 * A soft, circular radial glow (white core → transparent edge).
 * Rendered with additive blending behind a hovered photo for an outer halo,
 * and re-used as the dust-mote sprite.
 */
export function getGlowTexture(): THREE.CanvasTexture {
  if (glowSprite) return glowSprite;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const g = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2,
  );
  g.addColorStop(0.0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,235,205,0.55)');
  g.addColorStop(0.6, 'rgba(255,186,107,0.18)');
  g.addColorStop(1.0, 'rgba(255,186,107,0)');

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  glowSprite = new THREE.CanvasTexture(canvas);
  glowSprite.colorSpace = THREE.SRGBColorSpace;
  glowSprite.needsUpdate = true;
  return glowSprite;
}

/**
 * A tiny, soft amber dot for the floating dust motes — a tighter falloff than
 * the hover glow so individual particles stay crisp.
 */
export function getDustTexture(): THREE.CanvasTexture {
  if (dustSprite) return dustSprite;

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const g = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2,
  );
  g.addColorStop(0.0, 'rgba(255,244,224,1)');
  g.addColorStop(0.35, 'rgba(255,205,140,0.6)');
  g.addColorStop(1.0, 'rgba(255,186,107,0)');

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  dustSprite = new THREE.CanvasTexture(canvas);
  dustSprite.colorSpace = THREE.SRGBColorSpace;
  dustSprite.needsUpdate = true;
  return dustSprite;
}

/**
 * An elegant, intentional-looking placeholder shown on a card while its photo
 * loads — or permanently, if that one image ever fails. A deep gradient with a
 * soft champagne bloom reads as a tasteful empty frame, never a "broken image".
 * Shared singleton — do not dispose.
 */
export function getPlaceholderTexture(): THREE.CanvasTexture {
  if (placeholder) return placeholder;

  const w = 384;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Vertical obsidian → warm-plum gradient base.
  const base = ctx.createLinearGradient(0, 0, 0, h);
  base.addColorStop(0, '#15151b');
  base.addColorStop(1, '#241a20');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  // Soft champagne bloom, slightly above centre.
  const bloom = ctx.createRadialGradient(w / 2, h * 0.42, 0, w / 2, h * 0.42, w * 0.7);
  bloom.addColorStop(0, 'rgba(255,228,225,0.16)');
  bloom.addColorStop(1, 'rgba(255,228,225,0)');
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, w, h);

  placeholder = new THREE.CanvasTexture(canvas);
  placeholder.colorSpace = THREE.SRGBColorSpace;
  placeholder.needsUpdate = true;
  return placeholder;
}

/**
 * A small "play" badge — a rounded ink chip with a white triangle, drawn on
 * transparency — overlaid in the corner of video cards so they read as footage
 * at a glance (even before the first frame paints). Shared singleton.
 */
export function getPlayBadgeTexture(): THREE.CanvasTexture {
  if (playBadge) return playBadge;

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Soft circular chip.
  ctx.fillStyle = 'rgba(22, 13, 17, 0.78)';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = size * 0.05;
  ctx.strokeStyle = 'rgba(255, 247, 243, 0.92)';
  ctx.stroke();

  // White play triangle, optically centred.
  ctx.fillStyle = '#fff7f3';
  ctx.beginPath();
  ctx.moveTo(size * 0.42, size * 0.32);
  ctx.lineTo(size * 0.42, size * 0.68);
  ctx.lineTo(size * 0.72, size * 0.5);
  ctx.closePath();
  ctx.fill();

  playBadge = new THREE.CanvasTexture(canvas);
  playBadge.colorSpace = THREE.SRGBColorSpace;
  playBadge.needsUpdate = true;
  return playBadge;
}

/** Trace a rounded-rectangle path (helper for the mask). */
function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
