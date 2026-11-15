import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page introuvable — Billion Shack", robots: { index: false } };

/** Page affichée pour une adresse qui n'existe pas (au lieu de la page blanche par défaut). */
export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-night px-6 text-center text-bone">
      <div className="fixed inset-x-0 top-0 h-[6px] bg-accent" />
      <p className="label text-mutd">Erreur 404</p>
      <h1 className="giant mt-5 text-[clamp(3rem,13vw,8.5rem)]">Introuvable</h1>
      <p className="serif mt-4 text-[clamp(1.6rem,5vw,2.6rem)] text-accent-light">cette page n&apos;existe pas.</p>
      <a href="/" className="mt-10 bg-bone px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink transition-colors duration-300 hover:bg-accent hover:text-ink">
        Retour à la boutique
      </a>
    </main>
  );
}
