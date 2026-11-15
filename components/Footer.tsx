"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { STORE } from "@/lib/store";
import { whatsappUrl } from "@/lib/whatsapp";

/** Pied de page bleu nuit : logo + slogan, contacts, adresses, et le nom géant en bas. */
export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  const reduced = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["40%", "0%"]);

  return (
    <footer ref={ref} data-tone="dark" className="noise noise-dark relative overflow-hidden bg-night text-bone">
      <div className="relative mx-auto max-w-[90rem] px-6 pt-20 md:px-12 md:pt-28 lg:px-20">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <img src="/marque/logo-slogan.png" alt={`${STORE.name} — ${STORE.tagline}`} width={573} height={506} className="h-auto w-[13.5rem] md:w-[16rem]" loading="lazy" />
            <p className="grot mt-10 text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.08]">Une question, une taille, une dispo ?</p>
            <a href={whatsappUrl(`Bonjour ${STORE.name} !`)} target="_blank" rel="noopener noreferrer" className="group mt-7 inline-flex items-center gap-3 rounded-full bg-bone px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink transition-colors duration-300 hover:bg-accent hover:text-bone">
              Écrire sur WhatsApp
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform duration-500 group-hover:translate-x-1" aria-hidden>
                <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </a>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 md:col-span-7 md:grid-cols-3">
            <div>
              <p className="label text-mutd">Boutiques</p>
              <ul className="mt-4 space-y-4 text-sm text-bone/85">
                {STORE.shops.map((s) => (
                  <li key={s.city}>
                    <a href={s.maps} target="_blank" rel="noopener noreferrer" className="hover:text-accent-light">
                      <span className="block font-semibold text-bone">{s.city} · {s.country}</span>
                      <span className="block">{s.area}</span>
                      {s.detail && <span className="block text-mutd">{s.detail}</span>}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label text-mutd">Contact</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a href={whatsappUrl(`Bonjour ${STORE.name} !`)} target="_blank" rel="noopener noreferrer" className="hover:text-accent-light">
                    WhatsApp {STORE.whatsappDisplay}
                  </a>
                </li>
                <li>
                  <a href={STORE.snapchatUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent-light">
                    Snap {STORE.snapchat}
                  </a>
                  <span className="block text-[12px] text-mutd">réponse la plus rapide</span>
                </li>
                <li>
                  <a href={STORE.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-accent-light">
                    TikTok {STORE.tiktokHandle}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="label text-mutd">Le site</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li><a href="#collection" className="hover:text-accent-light">Collection</a></li>
                <li><a href="#esprit" className="hover:text-accent-light">L&apos;esprit</a></li>
                <li><a href="#commander" className="hover:text-accent-light">Commander</a></li>
                <li><a href="#boutiques" className="hover:text-accent-light">Boutiques</a></li>
                <li><a href="#questions" className="hover:text-accent-light">Questions</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 flex flex-col justify-between gap-2 border-t border-white/10 pt-6 text-[11px] uppercase tracking-[0.18em] text-mutd md:flex-row">
          <span>© {STORE.name} — {STORE.cities}</span>
          <span>{STORE.delivery} · Prix en {STORE.currency}</span>
        </div>
      </div>
      <motion.div aria-hidden style={{ y: reduced ? 0 : y }} className="giant pointer-events-none mt-8 flex select-none flex-col items-center text-[#1d1840]">
        <span style={{ fontSize: "min(19.4vw, 21rem)", lineHeight: 0.84 }}>{STORE.name.split(" ")[0]}</span>
        <span style={{ fontSize: "min(19.4vw, 21rem)", lineHeight: 0.84 }}>{STORE.name.split(" ").slice(1).join(" ")}</span>
      </motion.div>
    </footer>
  );
}
