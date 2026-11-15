"use client";

import { AnimatePresence, motion } from "framer-motion";
import { easing } from "@/lib/motion";
import { useCart } from "@/lib/cart";

/** Petit message « ajouté au panier » + barre panier en bas sur mobile. */
export default function Overlays() {
  const { toast, count, cartOpen, sheet, setCartOpen } = useCart();
  return (
    <>
      <AnimatePresence>
        {toast && !cartOpen && (
          <motion.div
            role="status"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.6, ease: easing.outExpo }}
            className="pointer-events-none fixed inset-x-0 top-32 z-[80] flex justify-center px-6"
          >
            <span className="rounded-full bg-ink px-5 py-3 text-[12px] font-medium text-bone shadow-[0_20px_40px_-20px_rgba(0,0,0,.6)]">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {count > 0 && !cartOpen && !sheet && (
          <motion.div initial={{ y: 90 }} animate={{ y: 0 }} exit={{ y: 90 }} transition={{ duration: 0.6, ease: easing.outExpo }} className="fixed inset-x-0 bottom-0 z-40 p-3 md:hidden">
            <button onClick={() => setCartOpen(true)} className="flex w-full items-center justify-between rounded-full bg-ink px-6 py-4 text-bone shadow-[0_20px_40px_-20px_rgba(0,0,0,.7)]">
              <span className="text-[12px] font-semibold uppercase tracking-[0.16em]">Panier · {count} article{count > 1 ? "s" : ""}</span>
              <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-accent-light">Voir →</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
