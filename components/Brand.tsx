"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { easing } from "@/lib/motion";
import { STORE } from "@/lib/store";
import MaskReveal from "./MaskReveal";

function Social({ href, label, note }: { href: string; label: string; note?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-6 border-b border-white/12 py-5">
      <span>
        <span className="grot block text-xl md:text-2xl">{label}</span>
        {note && <span className="mt-1 block text-[12px] uppercase tracking-[0.16em] text-accent-light">{note}</span>}
      </span>
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-white/20 transition-colors duration-500 group-hover:border-accent group-hover:bg-accent">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </span>
    </a>
  );
}

/** Le film (vidéo du héros 3D) : se lance tout seul, sans le son, quand il est visible. */
function Film() {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = !!useReducedMotion();
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !reduced) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.25 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduced]);
  return (
    <motion.figure
      initial={reduced ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1.2, ease: easing.outExpo }}
      className="mx-auto w-full max-w-[26rem]"
    >
      <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#07051a] shadow-[0_40px_80px_-40px_rgba(227,41,125,.45)]" style={{ aspectRatio: "720 / 1000" }}>
        <video
          ref={ref}
          className="absolute inset-0 h-full w-full object-cover"
          src="/film/billion-shack-film.mp4"
          poster="/film/billion-shack-film.webp"
          muted
          loop
          playsInline
          preload="none"
          controls={reduced}
          aria-label={`Film ${STORE.name} : le sweat 3D se transforme en particules, puis en nom chromé`}
        />
      </div>
      <figcaption className="mt-4 flex items-center justify-between label text-mutd">
        <span>Le film</span>
        <span>
          {STORE.name} · {STORE.drop}
        </span>
      </figcaption>
    </motion.figure>
  );
}

/** La boutique + réseaux : bandeau lié au défilement, Snapchat (réponse la plus rapide) et TikTok, et le film. */
export default function Brand() {
  const ref = useRef<HTMLElement>(null);
  const reduced = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x1 = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-30%", "0%"]);
  const band = `${STORE.name} · Streetwear · Lomé · Abidjan · `;

  return (
    <section id="marque" ref={ref} data-tone="dark" className="noise noise-dark relative overflow-hidden bg-night py-20 text-bone md:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 45% at 15% 80%, rgba(227,41,125,.16), transparent 70%)" }} />

      <div aria-hidden className="pointer-events-none relative select-none">
        <motion.p style={{ x: reduced ? 0 : x1 }} className="cond whitespace-nowrap text-[clamp(4rem,12vw,11rem)] text-[#1f1940]">
          {band.repeat(4)}
        </motion.p>
        <motion.p style={{ x: reduced ? 0 : x2 }} className="cond -mt-2 whitespace-nowrap text-[clamp(4rem,12vw,11rem)] text-[#18132f]">
          {band.repeat(4)}
        </motion.p>
      </div>

      <div className="relative mx-auto mt-14 grid max-w-[90rem] gap-14 px-6 md:mt-20 md:grid-cols-12 md:items-center md:px-12 lg:px-20">
        <div className="md:col-span-7 lg:col-span-6">
          <p className="label text-mutd">— La boutique</p>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-bone/85 md:text-xl">
            {STORE.about.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </div>
          <h2 className="giant mt-14 text-[clamp(3rem,6.5vw,6rem)]">
            <MaskReveal onView>Suis</MaskReveal>
            <MaskReveal onView delay={0.12}>le drop</MaskReveal>
          </h2>
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: 0.45, ease: easing.outExpo }}
            className="serif mt-3 text-[clamp(1.9rem,3.6vw,3.2rem)] text-accent"
          >
            sur Snap et TikTok.
          </motion.p>
          <div className="mt-8 border-t border-white/12">
            <Social href={STORE.snapchatUrl} label={`Snapchat · ${STORE.snapchat}`} note="Réponse la plus rapide" />
            <Social href={STORE.tiktok} label={`TikTok · ${STORE.tiktokHandle}`} />
          </div>
        </div>
        <div className="md:col-span-5 lg:col-span-5 lg:col-start-8">
          <Film />
        </div>
      </div>
    </section>
  );
}
