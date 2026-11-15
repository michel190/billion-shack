"use client";

import { motion, useReducedMotion } from "framer-motion";
import { easing } from "@/lib/motion";
import { STORE } from "@/lib/store";
import MaskReveal from "./MaskReveal";

/** Les deux boutiques (Lomé, Abidjan) avec un lien d'itinéraire. */
export default function Shops() {
  const reduced = !!useReducedMotion();
  const glows = [
    "radial-gradient(ellipse 70% 60% at 0% 0%, rgba(85,138,252,.28), transparent 65%), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(227,41,125,.22), transparent 70%)",
    "radial-gradient(ellipse 70% 60% at 100% 0%, rgba(227,41,125,.28), transparent 65%), radial-gradient(ellipse 60% 50% at 0% 100%, rgba(255,165,22,.16), transparent 70%)",
  ];

  return (
    <section id="boutiques" data-tone="light" className="bg-bone px-6 py-20 md:px-12 md:py-32 lg:px-20">
      <div className="mx-auto max-w-[90rem]">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-5">
            <p className="label text-mut">— Boutiques</p>
          </div>
          <div className="md:col-span-7">
            <h2 className="cond text-[clamp(3.2rem,9vw,8.5rem)]">
              <MaskReveal onView>Deux adresses</MaskReveal>
            </h2>
            <motion.p
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, delay: 0.4, ease: easing.outExpo }}
              className="serif mt-3 text-[clamp(1.8rem,3.4vw,3rem)] text-accent"
            >
              passe nous voir.
            </motion.p>
          </div>
        </div>

        <div className="mt-14 grid gap-4 md:mt-20 md:grid-cols-2 md:gap-6">
          {STORE.shops.map((s, i) => (
            <motion.article
              key={s.city}
              initial={reduced ? false : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 1.1, delay: i * 0.12, ease: easing.outExpo }}
              className="noise noise-dark relative flex min-h-[22rem] flex-col justify-between overflow-hidden rounded-[1.5rem] bg-night p-7 text-bone md:min-h-[28rem] md:p-10"
            >
              <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glows[i % 2] }} />
              <div className="relative flex items-start justify-between gap-4">
                <span className="grot text-sm text-mutd tabular">{String(i + 1).padStart(2, "0")}</span>
                <span className="label text-mutd">{s.country}</span>
              </div>
              <div className="relative">
                <h3 className="giant text-[clamp(2.6rem,6vw,5.8rem)]">{s.city}</h3>
                <p className="grot mt-5 text-xl md:text-2xl">{s.area}</p>
                {s.detail && <p className="mt-1 text-[15px] text-mutd">{s.detail}</p>}
                <a
                  href={s.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-7 inline-flex items-center gap-3 rounded-full border border-white/20 py-2.5 pl-5 pr-2.5 transition-colors duration-500 hover:border-accent"
                >
                  <span className="label">Itinéraire</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bone text-ink transition-colors duration-500 group-hover:bg-accent group-hover:text-bone">
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                  </span>
                </a>
              </div>
            </motion.article>
          ))}
        </div>

        <p className="mt-10 text-center text-[13px] text-mut md:text-left">
          Pas à côté ? {STORE.delivery}.
        </p>
      </div>
    </section>
  );
}
