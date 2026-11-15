/**
 * Étapes du héros animé au défilement (progression de 0 à 1), calées sur la vidéo Kenless.
 * Toutes les animations du héros lisent ces mêmes valeurs :
 * pour accélérer ou ralentir une étape, change-la ici.
 */
export const PH = {
  out: [0.04, 0.14] as const, //      les lettres géantes disparaissent une à une
  panel: [0.08, 0.18] as const, //    le fond noir monte
  turn: [0.18, 0.3] as const, //      le sweat 3D se retourne (face → dos)
  scan: [0.3, 0.4] as const, //       ligne lumineuse de bas en haut : le sweat devient particules
  hold: [0.4, 0.5] as const, //       nuage de particules, texte + chiffres
  flow: [0.5, 0.58] as const, //      les particules coulent en nappe horizontale
  rise: [0.555, 0.68] as const, //    elles remontent et écrivent le nom en 3D (+ comète → logo)
  wipe: [0.74, 0.8] as const, //      balayage gauche → droite : particules → chrome
  exit: [0.86, 0.94] as const, //     le fond noir redescend
};

export const seg = (p: number, [a, b]: readonly [number, number]) => Math.min(1, Math.max(0, (p - a) / (b - a)));

/** Ton (clair/sombre) du haut de l'écran pendant le héros — pour la couleur de l'en-tête. */
export function heroToneAt(p: number): "light" | "dark" {
  return seg(p, PH.panel) > 0.97 && seg(p, PH.exit) < 0.04 ? "dark" : "light";
}

/** Ton du bas de l'écran (barre de raccourcis) : le fond noir y arrive en premier et en repart en dernier. */
export function heroBottomToneAt(p: number): "light" | "dark" {
  return seg(p, PH.panel) > 0.12 && seg(p, PH.exit) < 0.9 ? "dark" : "light";
}
