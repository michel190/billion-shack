"use client";

/**
 * Panier : articles (produit + taille + quantité), ouverture du tiroir panier
 * et de la fiche produit. Sauvegardé dans le navigateur (lu APRÈS l'affichage
 * pour éviter tout décalage entre le serveur et le navigateur).
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { PRODUCTS, type Product } from "./products";

/**
 * Relit un panier enregistré dans le navigateur en ne gardant que des lignes valides :
 * produit encore au catalogue, taille proposée pour ce produit, quantité entière de 1 à 99.
 * (Un ancien panier, ou un panier modifié à la main, ne peut ni casser le site ni fausser le message.)
 */
function restoreCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const out: CartLine[] = [];
  for (const x of data.slice(0, 50)) {
    if (!x || typeof x !== "object") continue;
    const { id, size, qty } = x as Record<string, unknown>;
    const p = PRODUCTS.find((pp) => pp.id === id);
    if (!p || typeof size !== "string" || !p.sizes.includes(size)) continue;
    const q = typeof qty === "number" && Number.isFinite(qty) ? Math.min(99, Math.max(0, Math.floor(qty))) : 0;
    if (q < 1) continue;
    const same = out.find((l) => l.id === p.id && l.size === size);
    if (same) same.qty = Math.min(99, same.qty + q);
    else out.push({ id: p.id, size, qty: q });
  }
  return out;
}

export interface CartLine {
  id: string;
  size: string;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  count: number;
  add: (id: string, size: string, qty?: number) => void;
  setQty: (id: string, size: string, qty: number) => void;
  remove: (id: string, size: string) => void;
  clear: () => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  sheet: Product | null;
  openSheet: (p: Product | null) => void;
  toast: string | null;
}

const Ctx = createContext<CartState | null>(null);
const KEY = "billionshack-panier-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [sheet, setSheet] = useState<Product | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    try {
      setLines(restoreCart(localStorage.getItem(KEY)));
    } catch {
      /* stockage indisponible : panier vide */
    }
    setLoaded(true);
    return () => window.clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines, loaded]);

  // bloque le défilement de la page quand un panneau est ouvert
  useEffect(() => {
    const lock = cartOpen || sheet !== null;
    document.body.style.overflow = lock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, sheet]);

  const add = useCallback((id: string, size: string, qty = 1) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.id === id && l.size === size);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: Math.min(99, next[i].qty + qty) };
        return next;
      }
      return [...prev, { id, size, qty }];
    });
    const p = PRODUCTS.find((x) => x.id === id);
    setToast(`${p?.name ?? "Article"} · ${size} — ajouté au panier`);
    // un nouvel ajout relance le délai (le message ne disparaît pas trop tôt)
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const setQty = useCallback((id: string, size: string, qty: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.id === id && l.size === size ? { ...l, qty: Math.max(0, Math.min(99, qty)) } : l))
        .filter((l) => l.qty > 0)
    );
  }, []);

  const remove = useCallback((id: string, size: string) => {
    setLines((prev) => prev.filter((l) => !(l.id === id && l.size === size)));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartState>(
    () => ({
      lines,
      count: lines.reduce((a, l) => a + l.qty, 0),
      add,
      setQty,
      remove,
      clear,
      cartOpen,
      setCartOpen,
      sheet,
      openSheet: setSheet,
      toast,
    }),
    [lines, add, setQty, remove, clear, cartOpen, sheet, toast]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartState {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return c;
}
