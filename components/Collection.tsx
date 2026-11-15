"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { easing } from "@/lib/motion";
import { CATEGORIES, PRODUCTS, formatPrice, type Product } from "@/lib/products";
import { STORE } from "@/lib/store";
import { useCart } from "@/lib/cart";

/**
 * Collection façon boutique streetwear premium : barre de filtres (catégorie, taille, tri, affichage),
 * grandes vignettes gris clair, nom + prix, et les tailles sous chaque article :
 * un clic sur une taille ajoute l'article au panier. Un clic sur la vignette ouvre la fiche.
 */

type Sort = "nouveautes" | "prix-asc" | "prix-desc";
const SORTS: { v: Sort; l: string }[] = [
  { v: "nouveautes", l: "Nouveautés" },
  { v: "prix-asc", l: "Prix croissant" },
  { v: "prix-desc", l: "Prix décroissant" },
];

function Dropdown<T extends string>({ label, value, options, onChange, align = "center" }: { label: string; value: T; options: { v: T; l: string }[]; onChange: (v: T) => void; align?: "left" | "center" | "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", close);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", close);
    };
  }, [open]);
  const current = options.find((o) => o.v === value);
  const active = value !== options[0].v;
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
        {label}
        {active && <span className="text-mut normal-case tracking-normal">· {current?.l}</span>}
        <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
          <path d="M1 2.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" fill="none" />
        </svg>
      </button>
      <div className={`absolute top-full z-40 mt-3 ${align === "left" ? "left-0" : align === "right" ? "right-0" : "left-1/2 -translate-x-1/2"} md:left-1/2 md:right-auto md:-translate-x-1/2`}>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: easing.outExpo }}
            className="min-w-[11rem] border border-ink/10 bg-bone py-1.5 shadow-[0_24px_50px_-24px_rgba(15,13,26,.35)]"
          >
            {options.map((o) => (
              <li key={o.v}>
                <button
                  onClick={() => {
                    onChange(o.v);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-4 px-4 py-2 text-left text-[12px] transition-colors hover:bg-ink/5 ${o.v === value ? "font-semibold text-ink" : "text-mut"}`}
                >
                  {o.l}
                  {o.v === value && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

function Card({ p, i }: { p: Product; i: number }) {
  const { openSheet, add } = useCart();
  const reduced = useReducedMotion();
  const [picked, setPicked] = useState<string | null>(null);
  const quick = (s: string) => {
    add(p.id, s, 1);
    setPicked(s);
    window.setTimeout(() => setPicked(null), 1400);
  };
  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-6% 0px" }}
      transition={{ duration: 0.9, delay: (i % 3) * 0.08, ease: easing.outExpo }}
    >
      <button onClick={() => openSheet(p)} aria-label={`Voir ${p.name}`} className="group relative block w-full overflow-hidden bg-tile" style={{ aspectRatio: "4 / 5" }}>
        {(p.badge || p.exemple) && (
          <span className="absolute left-3 top-3 z-10 bg-ink px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-bone">{p.badge ?? "Exemple"}</span>
        )}
        {p.image ? (
          <>
            <img
              src={p.image}
              alt={p.name}
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 m-auto h-[70%] w-[80%] object-contain drop-shadow-[0_24px_28px_rgba(15,13,26,.22)] transition-[transform,opacity] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.045] ${p.imageBack ? "group-hover:opacity-0" : ""}`}
            />
            {p.imageBack && (
              <img
                src={p.imageBack}
                alt={`${p.name} — dos`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 m-auto h-[70%] w-[80%] scale-[1.02] object-contain opacity-0 drop-shadow-[0_24px_28px_rgba(15,13,26,.22)] transition-[transform,opacity] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.045] group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold uppercase tracking-[0.16em] text-mut">Photo à venir</span>
        )}
        <span className="absolute bottom-3 right-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/0 transition-colors duration-500 group-hover:text-ink/70">Voir →</span>
      </button>
      <div className="mt-3.5 flex items-start justify-between gap-3">
        <h3 className="text-[12px] font-bold uppercase leading-snug tracking-[0.04em] text-ink">
          {p.name}
          <span className="font-semibold text-mut"> — {p.category}</span>
        </h3>
      </div>
      <p className={`mt-0.5 text-[12px] tabular ${p.price === null ? "text-mut" : "font-semibold text-ink"}`}>{formatPrice(p.price)}</p>
      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label={`Tailles — ${p.name}`}>
        {p.sizes.map((s) => (
          <button
            key={s}
            onClick={() => quick(s)}
            aria-label={`Ajouter ${p.name}, taille ${s}, au panier`}
            className={`h-8 min-w-[2.35rem] border px-2 text-[11px] font-semibold transition-colors duration-300 md:min-w-[2.75rem] ${picked === s ? "border-ink bg-ink text-bone" : "border-ink/15 text-ink hover:border-ink"}`}
          >
            {picked === s ? "✓" : s}
          </button>
        ))}
      </div>
    </motion.article>
  );
}

function ViewIcon({ cols }: { cols: number }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
      {Array.from({ length: cols * cols }).map((_, k) => {
        const s = (14 - (cols - 1) * 2) / cols;
        const x = (k % cols) * (s + 2);
        const y = Math.floor(k / cols) * (s + 2);
        return <rect key={k} x={x} y={y} width={s} height={s} fill="currentColor" />;
      })}
    </svg>
  );
}

export default function Collection() {
  const cats = useMemo(() => CATEGORIES.filter((c) => PRODUCTS.some((p) => p.category === c)), []);
  const sizes = useMemo(() => Array.from(new Set(PRODUCTS.flatMap((p) => p.sizes))), []);
  const [cat, setCat] = useState("tout");
  const [size, setSize] = useState("toutes");
  const [sort, setSort] = useState<Sort>("nouveautes");
  const [dense, setDense] = useState(true); // 3 colonnes (ordinateur) / 2 (téléphone)

  const list = useMemo(() => {
    let l = PRODUCTS.filter((p) => (cat === "tout" || p.category === cat) && (size === "toutes" || p.sizes.includes(size)));
    l = [...l].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    if (sort !== "nouveautes") {
      const dir = sort === "prix-asc" ? 1 : -1;
      l.sort((a, b) => (a.price === null ? 1 : b.price === null ? -1 : (a.price - b.price) * dir));
    }
    return l;
  }, [cat, size, sort]);

  return (
    <section id="collection" data-tone="light" className="bg-bone pb-16 md:pb-24">
      {/* barre de filtres (reste en haut pendant qu'on parcourt les articles) */}
      <div className="sticky top-[6.1rem] z-30 border-y border-ink/10 bg-bone/90 backdrop-blur-md md:top-[7.1rem]">
        <div className="mx-auto flex max-w-[90rem] flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3.5 md:flex-nowrap md:justify-between md:px-12 lg:px-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">
            {STORE.drop} <span className="text-mut">· {list.length} article{list.length > 1 ? "s" : ""}</span>
          </p>
          <div className="order-3 flex w-full items-center gap-6 md:order-2 md:w-auto md:justify-center md:gap-9">
            <Dropdown align="left" label="Catégorie" value={cat} onChange={setCat} options={[{ v: "tout", l: "Tout" }, ...cats.map((c) => ({ v: c, l: c }))]} />
            <Dropdown label="Taille" value={size} onChange={setSize} options={[{ v: "toutes", l: "Toutes" }, ...sizes.map((s) => ({ v: s, l: s }))]} />
            <Dropdown align="right" label="Trier" value={sort} onChange={setSort} options={SORTS.map((s) => ({ v: s.v, l: s.l }))} />
          </div>
          <div className="order-2 ml-auto flex items-center gap-3 text-ink md:order-3 md:ml-0">
            <button onClick={() => setDense(false)} aria-pressed={!dense} aria-label="Grandes vignettes" className={`transition-opacity ${dense ? "opacity-30 hover:opacity-70" : "opacity-100"}`}>
              <ViewIcon cols={1} />
            </button>
            <button onClick={() => setDense(true)} aria-pressed={dense} aria-label="Petites vignettes" className={`transition-opacity ${dense ? "opacity-100" : "opacity-30 hover:opacity-70"}`}>
              <ViewIcon cols={2} />
            </button>
          </div>
        </div>
      </div>

      {/* articles */}
      <div className="mx-auto max-w-[90rem] px-5 pt-10 md:px-12 md:pt-14 lg:px-20">
        {list.length === 0 ? (
          <p className="py-24 text-center text-[13px] text-mut">Aucun article pour ce choix.</p>
        ) : (
          <div className={`grid gap-x-4 gap-y-12 md:gap-x-8 md:gap-y-16 ${dense ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"}`}>
            {list.map((p, i) => (
              <Card key={p.id} p={p} i={i} />
            ))}
          </div>
        )}
      </div>

      <p className="mx-auto mt-16 max-w-[90rem] px-5 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-mut md:mt-20">
        Touche une taille pour ajouter l&apos;article au panier · Commande sur WhatsApp · {STORE.deliveryShort}
      </p>
    </section>
  );
}
