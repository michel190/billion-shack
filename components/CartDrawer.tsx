"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { easing } from "@/lib/motion";
import { PRODUCTS, formatPrice } from "@/lib/products";
import { STORE } from "@/lib/store";
import { useCart } from "@/lib/cart";
import { useDialog } from "@/lib/dialog";
import { buildOrderMessage, whatsappUrl } from "@/lib/whatsapp";
import ProductVisual from "./ProductVisual";

const CLIENT_KEY = "billionshack-client-v1";
// longueurs maximales (le message WhatsApp reste court et lisible)
const MAX = { name: 60, country: 40, place: 120, note: 300 };

/** Panier : articles, coordonnées, puis envoi de la commande sur WhatsApp. */
export default function CartDrawer() {
  const { lines, count, setQty, remove, cartOpen, setCartOpen } = useCart();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [place, setPlace] = useState("");
  const [note, setNote] = useState("");
  const [tried, setTried] = useState(false);
  // lien WhatsApp de la dernière commande ouverte (affiche la confirmation + un lien de secours)
  const [sentUrl, setSentUrl] = useState<string | null>(null);
  const panel = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const countryRef = useRef<HTMLInputElement>(null);
  const placeRef = useRef<HTMLInputElement>(null);

  useDialog(cartOpen, panel, () => setCartOpen(false));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CLIENT_KEY);
      if (raw) {
        const c = JSON.parse(raw) as { name?: unknown; country?: unknown; place?: unknown };
        const s = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : "");
        setName(s(c.name, MAX.name));
        setCountry(s(c.country, MAX.country));
        setPlace(s(c.place, MAX.place));
      }
    } catch {
      /* ignore */
    }
  }, []);

  // la confirmation disparaît si le panier change ou se ferme
  useEffect(() => setSentUrl(null), [lines, cartOpen]);

  const items = lines.map((l) => ({ l, p: PRODUCTS.find((p) => p.id === l.id)! })).filter((x) => x.p);
  const known = items.filter((x) => x.p.price !== null).reduce((a, x) => a + (x.p.price as number) * x.l.qty, 0);
  const hasUnknown = items.some((x) => x.p.price === null);
  const totalLabel = hasUnknown ? (known > 0 ? `${formatPrice(known)} + à confirmer` : "À confirmer") : formatPrice(known);
  const bad = { name: name.trim().length < 2, country: country.trim().length < 2, place: place.trim().length < 2 };
  const ready = items.length > 0 && !bad.name && !bad.country && !bad.place;

  const send = () => {
    if (!ready) {
      setTried(true);
      // place le curseur dans le premier champ à remplir
      (bad.name ? nameRef : bad.country ? countryRef : placeRef).current?.focus();
      return;
    }
    try {
      localStorage.setItem(CLIENT_KEY, JSON.stringify({ name, country, place }));
    } catch {
      /* ignore */
    }
    const url = whatsappUrl(buildOrderMessage(lines, { name, country, place, note }));
    // nouvel onglet ; si le navigateur le bloque, on ouvre WhatsApp dans cet onglet
    const w = window.open(url, "_blank");
    if (w) {
      try {
        w.opener = null;
      } catch {
        /* fenêtre isolée : rien à faire */
      }
    } else {
      window.location.href = url;
    }
    setSentUrl(url);
  };

  const field = (invalid: boolean) =>
    `border-2 bg-white px-4 py-3 text-[15px] outline-none transition-colors focus:border-ink ${tried && invalid ? "border-accent" : "border-ink/25"}`;

  return (
    <AnimatePresence>
      {cartOpen && (
        <motion.div className="fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: easing.outExpo }}>
          <button aria-label="Fermer le panier" tabIndex={-1} onClick={() => setCartOpen(false)} className="absolute inset-0 bg-ink/60" />
          <motion.aside
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="panier-titre"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.75, ease: easing.outExpo }}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-bone"
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
              <h2 id="panier-titre" className="grot text-2xl">
                Panier <span className="text-mut tabular">({count})</span>
              </h2>
              <button data-autofocus onClick={() => setCartOpen(false)} aria-label="Fermer le panier" className="label -mr-2 p-3 text-mut hover:text-ink">
                Fermer ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                  <p className="cond text-5xl">Vide</p>
                  <p className="serif mt-3 text-2xl"><span className="strip strip-orange not-italic">pour l&apos;instant.</span></p>
                  <button
                    onClick={() => {
                      setCartOpen(false);
                      document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="mt-8 bg-ink px-6 py-3.5 text-[12px] font-bold uppercase tracking-[0.14em] text-bone hover:bg-accent hover:text-ink"
                  >
                    Voir la collection
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-ink/10">
                  {items.map(({ l, p }) => (
                    <li key={`${l.id}-${l.size}`} className="flex gap-4 py-5">
                      <div className="flex h-24 w-20 flex-none items-center justify-center border-4 border-white bg-tile p-1 shadow-[0_1px_0_#111]">
                        <ProductVisual p={p} uid={`d-${p.id}-${l.size}`} className="h-full w-full" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-3">
                          <p className="grot text-[15px]">{p.name}</p>
                          <p className={`whitespace-nowrap text-sm tabular ${p.price === null ? "text-mut" : "font-semibold"}`}>{p.price === null ? "À confirmer" : formatPrice(p.price * l.qty)}</p>
                        </div>
                        <p className="mt-0.5 text-[12px] text-mut">Taille {l.size}</p>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <div className="flex items-center border-2 border-ink" role="group" aria-label={`Quantité — ${p.name}, taille ${l.size}`}>
                            <button onClick={() => setQty(l.id, l.size, l.qty - 1)} className="h-10 w-10" aria-label={l.qty === 1 ? `Retirer ${p.name} (taille ${l.size}) du panier` : `Un ${p.name} de moins`}>
                              −
                            </button>
                            <span className="w-6 text-center text-sm font-semibold tabular" aria-live="polite">
                              {l.qty}
                            </span>
                            <button onClick={() => setQty(l.id, l.size, l.qty + 1)} disabled={l.qty >= 99} className="h-10 w-10 disabled:opacity-30" aria-label={`Un ${p.name} de plus`}>
                              +
                            </button>
                          </div>
                          <button onClick={() => remove(l.id, l.size)} aria-label={`Retirer ${p.name} (taille ${l.size}) du panier`} className="-mr-2 p-2 text-[12px] text-mut underline-offset-4 hover:text-ink hover:underline">
                            Retirer
                          </button>
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
                <form
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault();
                    send();
                  }}
                >
                  <div className="mt-4 grid gap-2.5">
                    <input ref={nameRef} value={name} onChange={(e) => setName(e.target.value)} maxLength={MAX.name} placeholder="Ton nom *" aria-label="Ton nom" aria-required="true" aria-invalid={tried && bad.name} aria-describedby={tried && !ready ? "panier-erreur" : undefined} autoComplete="name" className={field(bad.name)} />
                    <input ref={countryRef} value={country} onChange={(e) => setCountry(e.target.value)} maxLength={MAX.country} placeholder="Ton pays *" aria-label="Ton pays" aria-required="true" aria-invalid={tried && bad.country} aria-describedby={tried && !ready ? "panier-erreur" : undefined} autoComplete="country-name" className={field(bad.country)} />
                    <input ref={placeRef} value={place} onChange={(e) => setPlace(e.target.value)} maxLength={MAX.place} placeholder="Ta ville et ton quartier *" aria-label="Ta ville et ton quartier" aria-required="true" aria-invalid={tried && bad.place} aria-describedby={tried && !ready ? "panier-erreur" : undefined} autoComplete="address-level2" className={field(bad.place)} />
                    <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={MAX.note} placeholder="Note (facultatif)" aria-label="Note pour la boutique (facultatif)" className={field(false)} />
                  </div>
                  <p id="panier-erreur" role="alert" className="mt-2 min-h-0 text-[12px] font-medium text-accent-dark">
                    {tried && !ready ? "Indique ton nom, ton pays, ta ville et ton quartier." : ""}
                  </p>
                  <button type="submit" className="mt-3 flex w-full items-center justify-center gap-3 bg-ink px-6 py-4 text-[13px] font-bold uppercase tracking-[0.14em] text-bone shadow-[4px_4px_0_#FF5B14] transition-colors duration-300 hover:bg-accent hover:text-ink">
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                      <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.1 14.9l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 0 1 12 4z" />
                    </svg>
                    Commander sur WhatsApp
                  </button>
                </form>
                <div role="status" aria-live="polite">
                  {sentUrl ? (
                    <p className="mt-4 border-2 border-dashed border-ink px-4 py-3 text-center text-[12px] leading-relaxed text-ink">
                      WhatsApp s&apos;est ouvert avec ta commande : appuie sur <strong>Envoyer</strong> dans WhatsApp pour la confirmer.{" "}
                      <a href={sentUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">
                        Rien ne s&apos;est ouvert ?
                      </a>
                    </p>
                  ) : (
                    <p className="mt-3 text-center text-[12px] leading-relaxed text-mut">Le message de commande s&apos;ouvre dans WhatsApp, prêt à envoyer. {STORE.payment}.</p>
                  )}
                </div>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
