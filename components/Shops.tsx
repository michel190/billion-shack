"use client";

import { motion, useReducedMotion } from "framer-motion";
import { easing } from "@/lib/motion";
import { STORE } from "@/lib/store";
import MaskReveal from "./MaskReveal";

/** Les deux boutiques (Lomé, Abidjan) avec un lien d'itinéraire. */
export default function Shops() {
  const reduced = !!useReducedMotion();

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
              className="serif mt-4 text-[clamp(1.6rem,3vw,2.6rem)]"
            >
              <span className="strip strip-orange not-italic">passe nous voir.</span>
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
              className="noise noise-dark relative flex min-h-[22rem] flex-col justify-between overflow-hidden bg-night p-7 text-bone md:min-h-[28rem] md:p-10"
            >
              <div className="relative flex items-start justify-between gap-4">
                <span className="sticker h-12 w-12 -rotate-6 text-xl tabular">{String(i + 1).padStart(2, "0")}</span>
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
                  className="group mt-7 inline-flex items-center gap-3 border-2 border-bone py-2 pl-5 pr-2 transition-colors duration-300 hover:border-accent"
                >
                  <span className="label">Itinéraire</span>
                  <span className="flex h-8 w-8 items-center justify-center bg-bone text-ink transition-colors duration-300 group-hover:bg-accent">
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
