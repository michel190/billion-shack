"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { easing } from "@/lib/motion";
import { PRODUCTS, formatPrice } from "@/lib/products";
import { STORE } from "@/lib/store";
import { useCart } from "@/lib/cart";
import { buildOrderMessage, whatsappUrl } from "@/lib/whatsapp";
import ProductVisual from "./ProductVisual";

const CLIENT_KEY = "billionshack-client-v1";

/** Panier : articles, coordonnées, puis envoi de la commande sur WhatsApp. */
export default function CartDrawer() {
  const { lines, count, setQty, remove, cartOpen, setCartOpen } = useCart();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [place, setPlace] = useState("");
  const [note, setNote] = useState("");
  const [tried, setTried] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CLIENT_KEY);
      if (raw) {
        const c = JSON.parse(raw) as { name?: string; country?: string; place?: string };
        setName(c.name ?? "");
        setCountry(c.country ?? "");
        setPlace(c.place ?? "");
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCartOpen]);

  const items = lines.map((l) => ({ l, p: PRODUCTS.find((p) => p.id === l.id)! })).filter((x) => x.p);
  const known = items.filter((x) => x.p.price !== null).reduce((a, x) => a + (x.p.price as number) * x.l.qty, 0);
  const hasUnknown = items.some((x) => x.p.price === null);
  const totalLabel = hasUnknown ? (known > 0 ? `${formatPrice(known)} + à confirmer` : "À confirmer") : formatPrice(known);
  const ready = items.length > 0 && name.trim().length > 1 && country.trim().length > 1 && place.trim().length > 1;

  const send = () => {
    if (!ready) {
      setTried(true);
      return;
    }
    try {
      localStorage.setItem(CLIENT_KEY, JSON.stringify({ name, country, place }));
    } catch {
      /* ignore */
    }
    const url = whatsappUrl(buildOrderMessage(lines, { name, country, place, note }));
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <motion.div className="fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: easing.outExpo }}>
          <button aria-label="Fermer le panier" onClick={() => setCartOpen(false)} className="absolute inset-0 bg-night/55 backdrop-blur-[2px]" />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Panier"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.75, ease: easing.outExpo }}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-bone"
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
              <p className="grot text-2xl">
                Panier <span className="text-mut tabular">({count})</span>
              </p>
              <button onClick={() => setCartOpen(false)} className="label p-2 text-mut hover:text-ink">Fermer ✕</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                  <p className="cond text-5xl">Vide</p>
                  <p className="serif mt-2 text-3xl text-accent">pour l&apos;instant.</p>
                  <button onClick={() => { setCartOpen(false); document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" }); }} className="mt-8 rounded-full bg-ink px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-bone hover:bg-accent">
                    Voir la collection
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-ink/10">
                  {items.map(({ l, p }) => (
                    <li key={`${l.id}-${l.size}`} className="flex gap-4 py-5">
                      <div className="flex h-24 w-20 flex-none items-center justify-center rounded-md bg-tile p-2">
                        <ProductVisual p={p} uid={`d-${p.id}-${l.size}`} className="h-full w-full" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-3">
                          <p className="grot text-[15px]">{p.name}</p>
                          <p className={`whitespace-nowrap text-sm tabular ${p.price === null ? "text-mut" : "font-semibold"}`}>{p.price === null ? "À confirmer" : formatPrice(p.price * l.qty)}</p>
                        </div>
                        <p className="mt-0.5 text-[12px] text-mut">Taille {l.size}</p>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <div className="flex items-center rounded-full border border-ink/15">
                            <button onClick={() => setQty(l.id, l.size, l.qty - 1)} className="h-8 w-8" aria-label="Diminuer">−</button>
                            <span className="w-6 text-center text-sm font-semibold tabular">{l.qty}</span>
                            <button onClick={() => setQty(l.id, l.size, l.qty + 1)} className="h-8 w-8" aria-label="Augmenter">+</button>
                          </div>
                          <button onClick={() => remove(l.id, l.size)} className="text-[12px] text-mut underline-offset-4 hover:text-ink hover:underline">Retirer</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-ink/10 px-6 pb-6 pt-5">
                <div className="flex items-baseline justify-between">
                  <p className="label">Total</p>
                  <p className="grot text-xl tabular">{totalLabel}</p>
                </div>
                <div className="mt-4 grid gap-2.5">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ton nom *" autoComplete="name" className={`rounded-md border bg-white/60 px-4 py-3 text-[15px] outline-none transition-colors focus:border-ink ${tried && name.trim().length < 2 ? "border-accent" : "border-ink/15"}`} />
                  <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Ton pays *" autoComplete="country-name" className={`rounded-md border bg-white/60 px-4 py-3 text-[15px] outline-none transition-colors focus:border-ink ${tried && country.trim().length < 2 ? "border-accent" : "border-ink/15"}`} />
                  <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Ta ville et ton quartier *" className={`rounded-md border bg-white/60 px-4 py-3 text-[15px] outline-none transition-colors focus:border-ink ${tried && place.trim().length < 2 ? "border-accent" : "border-ink/15"}`} />
                  <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (facultatif)" className="rounded-md border border-ink/15 bg-white/60 px-4 py-3 text-[15px] outline-none transition-colors focus:border-ink" />
                </div>
                {tried && !ready && <p className="mt-2 text-[12px] font-medium text-accent-dark">Indique ton nom, ton pays, ta ville et ton quartier.</p>}
                <button onClick={send} className="mt-4 flex w-full items-center justify-center gap-3 rounded-full bg-ink px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-bone transition-colors duration-300 hover:bg-accent">
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.1 14.9l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 0 1 12 4z" /></svg>
                  Commander sur WhatsApp
                </button>
                <p className="mt-3 text-center text-[12px] leading-relaxed text-mut">Le message de commande s&apos;ouvre dans WhatsApp, prêt à envoyer. {STORE.payment}.</p>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
