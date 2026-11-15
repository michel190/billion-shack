/* eslint-disable @next/next/no-img-element */
import type { Product } from "@/lib/products";

/** Photo du produit (face ou dos). Sans photo : une case « Photo à venir » (pas de dessin). */
export default function ProductVisual({ p, className = "", side = "front" }: { p: Product; className?: string; uid?: string; side?: "front" | "back" }) {
  const src = side === "back" ? p.imageBack : p.image;
  if (src) {
    return <img src={src} alt={`${p.name}${side === "back" ? " — dos" : ""}`} className={`${className} object-contain`} loading="lazy" decoding="async" />;
  }
  return (
    <span className={`${className} flex items-center justify-center rounded-xl border border-current/20 text-[10px] font-semibold uppercase tracking-[0.16em] opacity-60`}>
      Photo à venir
    </span>
  );
}
