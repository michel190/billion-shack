"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { easing } from "@/lib/motion";
import { STORE } from "@/lib/store";
import MaskReveal from "./MaskReveal";

const STEPS = [
  { n: "01", title: "Choisis tes pièces", text: "Parcours la collection, sélectionne ta taille et ajoute au panier." },
  { n: "02", title: "Envoie sur WhatsApp", text: "Le panier prépare ton message : articles, tailles, total et adresse. Tu n'as plus qu'à l'envoyer.", spotlight: true },
  { n: "03", title: "Reçois ta commande", text: `${STORE.delivery}. ${STORE.payment}.` },
];

/** « Comment commander » : index numéroté, une étape mise en avant (règle du skill). */
export default function HowToOrder() {
  const ref = useRef<HTMLElement>(null);
  const reduced = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const numY = useTransform(scrollYProgress, [0, 1], ["18%", "-18%"]);

  return (
    <section id="commander" ref={ref} data-tone="light" className="noise relative overflow-hidden bg-fog px-6 py-20 md:px-12 md:py-32 lg:px-20">
      <div className="relative mx-auto max-w-[90rem]">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-5">
            <p className="label text-mut">— Commander</p>
          </div>
          <div className="md:col-span-7">
            <h2 className="cond text-[clamp(3.2rem,9vw,8.5rem)]">
              <MaskReveal onView>Simple</MaskReveal>
              <MaskReveal onView delay={0.15}>comme 1, 2, 3</MaskReveal>
            </h2>
            <motion.p
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, delay: 0.5, ease: easing.outExpo }}
              className="serif mt-3 text-[clamp(1.8rem,3.4vw,3rem)] text-accent"
            >
              depuis ton téléphone.
            </motion.p>
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:mt-24 md:grid-cols-3 md:gap-6">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={reduced ? false : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 1.1, delay: i * 0.12, ease: easing.outExpo }}
              className={`relative overflow-hidden rounded-2xl p-7 md:p-9 ${s.spotlight ? "noise noise-dark bg-night text-bone" : "border border-ink/10 bg-bone/60"}`}
            >
              {s.spotlight && <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 60% at 100% 0%, rgba(227,41,125,.3), transparent 65%)" }} />}
              <motion.p style={{ y: reduced ? 0 : numY }} className={`giant relative text-[clamp(4.5rem,9vw,8rem)] ${s.spotlight ? "text-accent" : "text-ink/90"}`}>
                {s.n}
              </motion.p>
              <h3 className="grot relative mt-10 text-2xl md:text-[1.7rem]">{s.title}</h3>
              <p className={`relative mt-3 max-w-xs text-[15px] leading-relaxed ${s.spotlight ? "text-mutd" : "text-mut"}`}>{s.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
