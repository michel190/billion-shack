"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { easing } from "@/lib/motion";
import { STORE } from "@/lib/store";
import MaskReveal from "./MaskReveal";

/** Le sweat 3D qui tourne lentement (chargé quand la section approche de l'écran). */
function Showcase3D() {
  const box = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const reduced = !!useReducedMotion();
  useEffect(() => {
    const el = box.current;
    const canvas = cv.current;
    if (!el || !canvas) return;
    let sc: import("./hero/showcase3d").Showcase | null = null;
    let raf = 0;
    let alive = true;
    let visible = false;
    let started = false;
    const t0 = performance.now();
    const lite = window.matchMedia("(pointer: coarse)").matches || Math.min(window.innerWidth, window.innerHeight) < 700;
    const dpr = () => Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 1.75);
    let odd = false;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      odd = !odd;
      if (sc && visible && odd) sc.render(reduced ? 0.6 : (now - t0) / 1000); // 30 images/s suffisent pour un tour lent
    };
    const start = async () => {
      started = true;
      try {
        if (!document.createElement("canvas").getContext("webgl")) return;
        const mod = await import("./hero/showcase3d");
        if (!alive) return;
        const made = await mod.createShowcase(canvas, { lite, fabric: STORE.hero3d.fabric, fur: STORE.hero3d.fur, prints: STORE.hero3d.prints }, el.clientWidth, el.clientHeight, dpr());
        if (!alive) return made.dispose();
        sc = made;
        setReady(true);
        raf = requestAnimationFrame(frame);
      } catch {
        /* sans 3D : l'image du sweat 3D reste affichée */
      }
    };
    // chargement un peu avant d'arriver dessus ; dessin seulement quand il est à l'écran
    const near = new IntersectionObserver(([e]) => e.isIntersecting && !started && start(), { rootMargin: "300px" });
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    near.observe(el);
    io.observe(el);
    const ro = new ResizeObserver(() => sc?.setSize(el.clientWidth, el.clientHeight, dpr()));
    ro.observe(el);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      near.disconnect();
      ro.disconnect();
      sc?.dispose();
    };
  }, [reduced]);
  return (
    <div ref={box} className="absolute inset-0">
      {/* image du sweat 3D en attendant (ou si l'appareil ne gère pas la 3D) */}
      <img
        src="/hero/sweat-3d.webp"
        alt={`${STORE.name} — sweat à capuche`}
        width={1116}
        height={1100}
        className="absolute inset-x-0 top-[13%] mx-auto h-[74%] w-auto object-contain transition-opacity duration-700"
        style={{ opacity: ready ? 0 : 1, filter: "contrast(1.08) saturate(.9) sepia(.1) drop-shadow(0 40px 50px rgba(0,0,0,.55))" }}
        loading="lazy"
      />
      <canvas ref={cv} aria-hidden className="absolute inset-0 h-full w-full transition-opacity duration-700" style={{ opacity: ready ? 1 : 0, filter: "contrast(1.06) saturate(.92) sepia(.08)" }} />
    </div>
  );
}

/**
 * « Plus qu'une boutique, un état d'esprit » — bloc bleu nuit + grande photo façon pellicule
 * (inspiré du bloc « MOST WANTED » de Kenless), puis un bandeau qui défile.
 */
export default function EtatDesprit() {
  const ref = useRef<HTMLElement>(null);
  // Repère invisible posé sur la zone du titre, EN DEHORS du bloc qui se déplie : le titre apparaît aussi
  // quand on arrive d'un coup sur la section (lien « L'esprit » du menu), pas seulement en défilant.
  const headZone = useRef<HTMLSpanElement>(null);
  const headIn = useInView(headZone, { once: true, margin: "0px 0px -12% 0px" });
  const reduced = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const photoScale = useTransform(scrollYProgress, [0, 1], [1.14, 1]);
  const photoY = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);
  const ticker = `${STORE.name} · Streetwear & casual · ${STORE.delivery} · ${STORE.cities} · Commande sur WhatsApp · `;

  return (
    <section id="esprit" ref={ref} data-tone="light" className="bg-bone pt-3">
      <div className="mx-auto grid max-w-[90rem] gap-3 px-3 md:grid-cols-2">
        <div className="relative flex">
        <span ref={headZone} aria-hidden className="pointer-events-none absolute inset-x-0 top-[30%] h-[40%]" />
        {/* bloc bleu nuit */}
        <motion.div
          initial={reduced ? false : { clipPath: "inset(0 0 100% 0)" }}
          whileInView={{ clipPath: "inset(0 0 0% 0)" }}
          viewport={{ once: true, margin: "-12% 0px" }}
          transition={{ duration: 1.3, ease: easing.outExpo }}
          className="noise noise-dark relative flex min-h-[72svh] w-full flex-col justify-between overflow-hidden bg-night p-6 text-bone md:min-h-[88svh] md:p-10"
        >
          <div className="relative flex items-center justify-between">
            <img src="/marque/texte.png" alt={STORE.name} width={408} height={183} className="h-9 w-auto md:h-11" />
            <span className="label text-mutd">{STORE.cities}</span>
          </div>

          <h2 className="heavy relative text-[clamp(2.7rem,6.4vw,6.6rem)]">
            <MaskReveal show={headIn}>Plus qu&apos;une</MaskReveal>
            <MaskReveal show={headIn} delay={0.08}>boutique,</MaskReveal>
            <MaskReveal show={headIn} delay={0.16}>un état</MaskReveal>
            <MaskReveal show={headIn} delay={0.24}><span className="text-accent">d&apos;esprit.</span></MaskReveal>
          </h2>

          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="serif max-w-[18rem] text-[clamp(1.5rem,2.2vw,2rem)] text-bone/90">{STORE.tagline}.</p>
            <a href="#collection" className="group inline-flex items-center gap-3 self-start bg-bone px-5 py-3.5 text-[12px] font-bold uppercase tracking-[0.14em] text-ink shadow-[4px_4px_0_#FF5B14] transition-colors duration-300 hover:bg-accent md:self-auto">
              Voir la collection
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform duration-500 group-hover:translate-x-1" aria-hidden>
                <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            </a>
          </div>
        </motion.div>
        </div>

        {/* photo scotchée (le sweat 3D tourne dedans) */}
        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-12% 0px" }}
          transition={{ duration: 1.4, delay: 0.15, ease: easing.outExpo }}
          className="taped relative min-h-[72svh] border-[10px] border-white bg-tile shadow-[0_1px_0_#111,0_18px_30px_-20px_rgba(0,0,0,.45)] md:min-h-[88svh] md:rotate-[0.6deg]"
        >
          <div className="absolute inset-0 overflow-hidden">
          <motion.div className="absolute inset-0" style={reduced ? undefined : { scale: photoScale, y: photoY }}>
            {STORE.etatImage ? (
              <img src={STORE.etatImage} alt={`${STORE.name} — l'esprit de la boutique`} className="absolute inset-0 h-full w-full object-cover" style={{ filter: "contrast(1.12) saturate(.8) sepia(.16) brightness(.95)" }} loading="lazy" />
            ) : (
              <div className="absolute inset-0">
                <div aria-hidden className="halftone absolute inset-0 text-ink/10" />
                <Showcase3D />
              </div>
            )}
          </motion.div>
          {/* grain de photocopie */}
          <div aria-hidden className="film-grain pointer-events-none absolute -inset-[60px] opacity-20" />
          </div>
          <p className="label absolute bottom-4 left-4 bg-ink px-2 py-1 text-bone md:bottom-6 md:left-6">{STORE.name} · {STORE.drop}</p>
          <span aria-hidden className="sticker absolute right-4 top-6 h-20 w-20 rotate-12 text-[1.35rem] md:right-6 md:top-8 md:h-24 md:w-24 md:text-[1.6rem]">Drop<br />01</span>
        </motion.div>
      </div>

      {/* bandeau qui défile */}
      <div className="mt-3 overflow-hidden border-y-2 border-ink bg-ink py-3 text-bone" aria-hidden>
        <div className="marquee flex w-max whitespace-nowrap text-[12px] font-bold uppercase tracking-[0.16em]">
          <span className="pr-0">{ticker.repeat(3)}</span>
          <span>{ticker.repeat(3)}</span>
        </div>
      </div>
    </section>
  );
}
