import * as THREE from 'three';

/**
 * heart.ts
 *
 * Shared heart assets: a flat heart geometry (for 3D instanced heart bursts)
 * and a soft glowing heart sprite (for the ambient drifting particle field).
 * Both are built once and memoised — hearts are everywhere in this scene, so
 * we never want to rebuild them.
 */

let heartGeo: THREE.ShapeGeometry | null = null;
let heartSprite: THREE.CanvasTexture | null = null;

/**
 * A centred, upright unit heart (≈1 unit tall, point at the bottom) as flat
 * geometry. Built from the classic cubic-bezier heart curve, then normalised:
 * flipped upright, centred on its bounding box, and scaled to unit height.
 */
export function heartGeometry(): THREE.ShapeGeometry {
  if (heartGeo) return heartGeo;

  const s = new THREE.Shape();
  // Canonical heart outline (drawn in an arbitrary unit frame).
  s.moveTo(0, 0);
  s.bezierCurveTo(0, -0.3, -0.5, -0.9, -1, -0.9);
  s.bezierCurveTo(-1.7, -0.9, -1.7, 0.05, -1.7, 0.05);
  s.bezierCurveTo(-1.7, 0.5, -1.25, 1.0, 0, 1.55);
  s.bezierCurveTo(1.25, 1.0, 1.7, 0.5, 1.7, 0.05);
  s.bezierCurveTo(1.7, 0.05, 1.7, -0.9, 1, -0.9);
  s.bezierCurveTo(0.5, -0.9, 0, -0.3, 0, 0);

  const geo = new THREE.ShapeGeometry(s, 24);
  // Flip upright (the curve above is lobes-down), centre, and scale to ~1 tall.
  geo.rotateZ(Math.PI);
  geo.computeBoundingBox();
  const bb = geo.boundingBox!;
  const height = bb.max.y - bb.min.y;
  geo.center();
  geo.scale(1 / height, 1 / height, 1);

  heartGeo = geo;
  return heartGeo;
}

/**
 * A soft, glowing heart sprite on transparency — a filled heart with a feathered
 * radial bloom behind it, for the ambient ember-like particle field.
 */
export function heartSpriteTexture(): THREE.CanvasTexture {
  if (heartSprite) return heartSprite;

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Soft bloom halo (gentle, so it reads as a glow not a blob).
  const bloom = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  bloom.addColorStop(0, 'rgba(255,220,228,0.32)');
  bloom.addColorStop(1, 'rgba(255,220,228,0)');
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, size, size);

  // Crisp heart body — sized to sit comfortably inside the canvas (no clipping).
  ctx.save();
  ctx.translate(size / 2, size * 0.36);
  ctx.scale(size * 0.2, size * 0.2);
  ctx.beginPath();
  // Two lobes + point, drawn directly in canvas space (y down).
  ctx.moveTo(0, 0.35);
  ctx.bezierCurveTo(0, 0.1, -0.5, -0.35, -1, -0.35);
  ctx.bezierCurveTo(-1.7, -0.35, -1.7, 0.5, -1.7, 0.5);
  ctx.bezierCurveTo(-1.7, 0.95, -1.0, 1.45, 0, 1.95);
  ctx.bezierCurveTo(1.0, 1.45, 1.7, 0.95, 1.7, 0.5);
  ctx.bezierCurveTo(1.7, 0.5, 1.7, -0.35, 1, -0.35);
  ctx.bezierCurveTo(0.5, -0.35, 0, 0.1, 0, 0.35);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.fill();
  ctx.restore();

  heartSprite = new THREE.CanvasTexture(canvas);
  heartSprite.colorSpace = THREE.SRGBColorSpace;
  heartSprite.needsUpdate = true;
  return heartSprite;
}
