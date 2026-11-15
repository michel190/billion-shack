"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Comportement commun des panneaux (panier, fiche produit, menu) :
 * - à l'ouverture, le focus clavier va dans le panneau (sur l'élément marqué data-autofocus) ;
 * - Tab / Maj+Tab restent dans le panneau, Échap le ferme ;
 * - le reste de la page (en-tête, contenu, pied de page) devient inactif (inert) ;
 * - à la fermeture, le focus revient sur le bouton qui l'avait ouvert.
 * `keep` : éléments de la page à laisser actifs (ex. l'en-tête pour le menu mobile).
 */
export function useDialog(open: boolean, ref: RefObject<HTMLElement | null>, onClose: () => void, keep: string[] = []) {
  const close = useRef(onClose);
  close.current = onClose;
  const keepKey = keep.join(",");

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const keepSel = keepKey ? keepKey.split(",") : [];
    const bg = Array.from(document.querySelectorAll<HTMLElement>("header, main, footer")).filter((e) => !keepSel.some((s) => e.matches(s)));
    bg.forEach((e) => (e.inert = true));
    const items = () => Array.from(ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter((e) => e.getClientRects().length > 0);
    const t = window.setTimeout(() => {
      const target = ref.current?.querySelector<HTMLElement>("[data-autofocus]") ?? items()[0];
      target?.focus({ preventScroll: true });
    }, 40);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
        return;
      }
      if (e.key !== "Tab" || !ref.current) return;
      const f = items();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      const inside = ref.current.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      bg.forEach((e) => (e.inert = false));
      if (prev && document.contains(prev) && !prev.closest("[inert]")) prev.focus({ preventScroll: true });
    };
  }, [open, ref, keepKey]);
}
