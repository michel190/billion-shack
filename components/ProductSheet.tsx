"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { easing } from "@/lib/motion";
import { formatPrice, hasBack } from "@/lib/products";
import { useCart } from "@/lib/cart";
import ProductVisual from "./ProductVisual";

/** Fiche produit : choix de la taille + quantité, puis ajout au panier. */
export default function ProductSheet() {
  const { sheet: p, openSheet, add, setCartOpen } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [tried, setTried] = useState(false);
  const [side, setSide] = useState<"front" | "back">("front");

  useEffect(() => {
    if (p) {
      setSize(p.sizes.length === 1 ? p.sizes[0] : null);
      setQty(1);
      setTried(false);
      setSide("front");
    }
  }, [p]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && openSheet(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSheet]);

  const onAdd = (thenCart: boolean) => {
    if (!p) return;
    if (!size) {
      setTried(true);
      return;
    }
    add(p.id, size, qty);
    openSheet(null);
    if (thenCart) setCartOpen(true);
  };

  return (
    <AnimatePresence>
      {p && (
        <motion.div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: easing.outExpo }}>
          <button aria-label="Fermer" onClick={() => openSheet(null)} className="absolute inset-0 bg-night/55 backdrop-blur-[2px]" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={p.name}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.7, ease: easing.outExpo }}
            className="relative grid max-h-[92svh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-bone md:grid-cols-2 md:rounded-3xl"
          >
            <div className="noise relative flex aspect-square items-center justify-center bg-tile p-[14%] md:aspect-auto md:min-h-[32rem]">
              {p.exemple && <span className="absolute left-4 top-4 rounded-[3px] bg-ink px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-bone">Exemple</span>}
              <ProductVisual p={p} uid={`s-${p.id}`} side={side} className="h-full max-h-[24rem] w-full" />
              {hasBack(p) && (
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1 rounded-full border border-ink/10 bg-bone/90 p-1">
                  {(["front", "back"] as const).map((v) => (
                    <button key={v} onClick={() => setSide(v)} aria-pressed={side === v} className={`rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors ${side === v ? "bg-ink text-bone" : "text-ink"}`}>
                      {v === "front" ? "Devant" : "Dos"}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col p-6 md:p-9">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="label text-mut">{p.category}</p>
                  <h2 className="grot mt-2 text-3xl md:text-4xl">{p.name}</h2>
                </div>
                <button onClick={() => openSheet(null)} className="label -mr-2 -mt-1 p-2 text-mut hover:text-ink" aria-label="Fermer la fiche">
                  ✕
                </button>
              </div>
              <p className={`mt-3 text-lg tabular ${p.price === null ? "text-mut" : "font-semibold"}`}>{formatPrice(p.price)}</p>
              <p className="mt-4 text-[15px] leading-relaxed text-mut">{p.description || (p.exemple ? "Produit d'exemple : les vraies pièces arrivent bientôt." : "")}</p>

              <div className="mt-7">
                <div className="flex items-baseline justify-between">
                  <p className="label">Taille</p>
                  {tried && !size && <p className="text-[12px] font-medium text-accent-dark">Choisis ta taille</p>}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      aria-pressed={size === s}
                      className={`min-w-12 rounded-md border px-3 py-2.5 text-sm font-semibold transition-colors duration-300 ${size === s ? "border-ink bg-ink text-bone" : "border-ink/15 hover:border-ink/50"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <p className="label">Quantité</p>
                <div className="flex items-center rounded-full border border-ink/15">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-10 w-10 text-lg" aria-label="Diminuer">−</button>
                  <span className="w-8 text-center font-semibold tabular">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(99, q + 1))} className="h-10 w-10 text-lg" aria-label="Augmenter">+</button>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-8">
                <button onClick={() => onAdd(false)} className="rounded-full bg-ink px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-bone transition-colors duration-300 hover:bg-accent">
                  Ajouter au panier
                </button>
                <button onClick={() => onAdd(true)} className="rounded-full border border-ink/15 px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 hover:border-ink">
                  Ajouter et voir le panier
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
