/**
 * Cadrage du sweat 3D dans le héros (partagé par la scène 3D et l'image fixe affichée
 * pendant le chargement — ainsi l'image tombe pile sous le sweat 3D).
 * Ce fichier n'importe pas three.js : il reste léger.
 */
export const FOV = 30;
export const CAM_Z = 9;

/** Zone (repère du sweat) couverte par l'image fixe /hero/sweat-3d.webp (rendu du sweat 3D). */
export const STILL_BOX = { x0: -1.0002, x1: 1.0057, y0: -1.02, y1: 0.9569 };

export function hoodieLayout(w: number, h: number) {
  const visH = 2 * CAM_Z * Math.tan(((FOV / 2) * Math.PI) / 180);
  const visW = visH * (w / h);
  const portrait = w / h < 0.95;
  const s = Math.min(((portrait ? 0.46 : 0.6) * visH) / 1.9, (0.84 * visW) / 2.0);
  const y = (portrait ? -0.035 : -0.05) * visH;
  return { visH, visW, portrait, s, y };
}

/** Rectangle (en pixels de la scène) où placer l'image fixe du sweat. */
export function stillRect(w: number, h: number) {
  const L = hoodieLayout(w, h);
  const k = h / L.visH;
  const left = w / 2 + STILL_BOX.x0 * L.s * k;
  const right = w / 2 + STILL_BOX.x1 * L.s * k;
  const top = h / 2 - (STILL_BOX.y1 * L.s + L.y) * k;
  const bottom = h / 2 - (STILL_BOX.y0 * L.s + L.y) * k;
  return { left, top, width: right - left, height: bottom - top };
}
