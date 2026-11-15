"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { easing } from "@/lib/motion";
import { STORE } from "@/lib/store";
import { useCart } from "@/lib/cart";
import { useDialog } from "@/lib/dialog";

const NAV = [
  { label: "Collection", href: "#collection" },
  { label: "L'esprit", href: "#esprit" },
  { label: "Boutiques", href: "#boutiques" },
  { label: "Questions", href: "#questions" },
];

type Tone = "light" | "dark";

/**
 * Barre d'annonce + en-tête. L'en-tête prend la couleur de ce qui passe dessous :
 * texte et logo foncés sur fond clair, clairs sur fond sombre (sections marquées data-tone).
 */
export default function Masthead() {
  const [tone, setTone] = useState<Tone>("light");
  const [inHero, setInHero] = useState(true);
  const [open, setOpen] = useState(false);
  const { count, setCartOpen } = useCart();
  const reduced = useReducedMotion();
  const menuRef = useRef<HTMLDivElement>(null);
  // menu mobile : Échap le ferme, le clavier reste dedans, l'en-tête reste utilisable
  useDialog(open, menuRef, () => setOpen(false), ["header"]);

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const y = 64; // milieu de l'en-tête
      let t: Tone = "light";
      let hero = false;
      document.querySelectorAll<HTMLElement>("[data-tone]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= y && r.bottom > y) {
          t = el.dataset.tone === "dark" ? "dark" : "light";
          // en-tête transparent seulement tant que le héros occupe tout l'écran
          hero = el.dataset.hero === "1" && r.bottom >= window.innerHeight - 2;
        }
      });
      setTone(t);
      setInHero(hero);
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    window.addEventListener("bs-tone", queue);
    return () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      window.removeEventListener("bs-tone", queue);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const dark = open || tone === "dark";
  const fg = dark ? "text-bone" : "text-ink";
  const bar = dark ? "bg-bone" : "bg-ink";

  return (
    <>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-5 focus:py-3 focus:text-[12px] focus:font-semibold focus:text-bone">
        Aller au contenu
      </a>
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="bg-night2 text-bone">
          <div className="mx-auto flex h-8 max-w-[90rem] items-center justify-center gap-6 px-6 text-[10px] font-semibold uppercase tracking-[0.22em] md:justify-between md:px-12 lg:px-20">
            <span className="hidden text-mutd md:inline">{STORE.cities}</span>
            <span className="md:hidden">{STORE.deliveryShort} · WhatsApp</span>
            <span className="hidden md:inline">{STORE.delivery} · Commande sur WhatsApp</span>
            <a href={STORE.snapchatUrl} target="_blank" rel="noopener noreferrer" className="hidden text-mutd transition-colors hover:text-bone md:inline">
              Snap : {STORE.snapchat}
            </a>
          </div>
          <div className="brand-line h-[2px] w-full" />
        </div>

        <div className={`relative transition-colors duration-500 ${fg}`}>
          <div className="relative mx-auto grid max-w-[90rem] grid-cols-[1fr_auto_1fr] items-center px-6 py-3 md:px-12 md:py-4 lg:px-20">
            <nav className="hidden items-center gap-8 lg:flex" aria-label="Navigation principale">
              {NAV.map((n) => (
                <a key={n.href} href={n.href} className="group relative label">
                  <span className="relative inline-block py-1">
                    {n.label}
                    <span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-current opacity-40 transition-transform duration-500 group-hover:origin-left group-hover:scale-x-100" />
                    <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform delay-[250ms] duration-500 group-hover:scale-x-100" />
                  </span>
                </a>
              ))}
            </nav>
            <button onClick={() => setOpen((v) => !v)} className="hit flex items-center gap-3 justify-self-start lg:hidden" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open}>
              <span className="relative flex h-3 w-6 flex-col justify-between">
                <motion.span animate={{ rotate: open ? 45 : 0, y: open ? 5.5 : 0 }} transition={{ duration: 0.4, ease: easing.outExpo }} className={`h-px w-full transition-colors duration-500 ${bar}`} />
                <motion.span animate={{ rotate: open ? -45 : 0, y: open ? -5.5 : 0 }} transition={{ duration: 0.4, ease: easing.outExpo }} className={`h-px w-full transition-colors duration-500 ${bar}`} />
              </span>
              <span className="label">{open ? "Fermer" : "Menu"}</span>
            </button>

            {/* logo : version claire (texte blanc) ou foncée selon le fond */}
            <a href="#top" className="relative flex items-center gap-1.5 justify-self-center" aria-label={`${STORE.name} — accueil`}>
              <span className="relative block h-9 w-[1.95rem] md:h-10 md:w-[2.2rem]">
                <img src="/marque/sac.png" alt="" width={264} height={304} className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${dark ? "opacity-100" : "opacity-0"}`} />
                <img src="/marque/sac-clair.png" alt="" width={266} height={304} className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${dark ? "opacity-0" : "opacity-100"}`} />
              </span>
              <span className="relative block h-10 w-[5.57rem] md:h-12 md:w-[6.69rem]">
                <img src="/marque/texte.png" alt="" width={408} height={183} className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${dark ? "opacity-100" : "opacity-0"}`} />
                <img src="/marque/texte-encre.png" alt="" width={408} height={183} className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${dark ? "opacity-0" : "opacity-100"}`} />
              </span>
            </a>

            <button onClick={() => setCartOpen(true)} className="hit group relative inline-flex items-center gap-2 justify-self-end label" aria-label={`Ouvrir le panier (${count} article${count > 1 ? "s" : ""})`}>
              <span>Panier</span>
              <span className={`inline-flex h-6 min-w-6 items-center justify-center px-1.5 text-[11px] tracking-normal tabular transition-colors ${count > 0 ? "bg-accent text-ink" : dark ? "bg-white/10" : "bg-ink/10"}`}>{count}</span>
            </button>
          </div>
          {/* fond de l'en-tête : transparent pendant le héros, teinté ensuite */}
          <motion.div
            aria-hidden
            initial={false}
            animate={{ opacity: !inHero || open ? 1 : 0 }}
            transition={{ duration: 0.5, ease: easing.outExpo }}
            className={`absolute inset-0 -z-10 border-b-2 transition-colors duration-500 ${dark ? "border-bone/30 bg-night" : "border-ink bg-bone"}`}
          />
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div ref={menuRef} role="dialog" aria-modal="true" aria-label="Menu" initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: easing.outExpo }} className="fixed inset-0 z-[45] bg-night text-bone lg:hidden">
            <div className="flex h-full flex-col px-6 pb-10 pt-36">
              <nav className="flex flex-1 flex-col justify-center" aria-label="Menu mobile">
                <ul className="flex flex-col gap-2">
                  {NAV.map((n, i) => (
                    <li key={n.href} className="overflow-hidden">
                      <motion.a
                        href={n.href}
                        onClick={() => setOpen(false)}
                        initial={{ y: "110%" }}
                        animate={{ y: "0%" }}
                        exit={{ y: "110%" }}
                        transition={{ duration: 0.9, delay: 0.1 + i * 0.08, ease: easing.outExpo }}
                        className="cond block"
                        style={{ fontSize: "clamp(3.2rem, 16vw, 6rem)", lineHeight: 0.95 }}
                      >
                        {n.label}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </nav>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }} className="flex items-center justify-between border-t border-white/10 pt-6 label text-mutd">
                <span>{STORE.cities}</span>
                <a href={STORE.snapchatUrl} target="_blank" rel="noopener noreferrer" className="text-bone">
                  Snap : {STORE.snapchat}
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
