"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { easing } from "@/lib/motion";
import { STORE } from "@/lib/store";
import MaskReveal from "./MaskReveal";

const [LOME, ABIDJAN] = STORE.shops;

const FAQ = [
  { q: "Comment passer commande ?", a: "Ajoute tes articles au panier en choisissant ta taille, puis appuie sur « Commander sur WhatsApp ». Ton message de commande est prêt : il suffit de l'envoyer." },
  { q: "Comment je paie ?", a: "Deux possibilités : paiement à la livraison, ou paiement avant l'envoi. On te confirme les détails sur WhatsApp." },
  { q: "Vous livrez où ?", a: "Partout en Afrique et dans le monde. Indique ton pays, ta ville et ton quartier dans le panier : on te confirme les détails de livraison sur WhatsApp." },
  { q: "Où sont vos boutiques ?", a: `À ${LOME.city} (${LOME.country}) : ${LOME.area}, ${LOME.detail.toLowerCase()}. À ${ABIDJAN.city} (${ABIDJAN.country}) : ${ABIDJAN.area}, ${ABIDJAN.detail}.` },
  { q: "Comment vous joindre le plus vite ?", a: `Sur Snapchat (${STORE.snapchat}) : c'est là qu'on répond le plus vite. Sinon sur WhatsApp au ${STORE.whatsappDisplay}.` },
  { q: "Je ne trouve pas ma taille", a: "Écris-nous sur WhatsApp ou sur Snapchat : on te dit ce qui est disponible." },
];

export default function Faq() {
  const [open, setOpen] = useState<number>(0);
  return (
    <section id="questions" data-tone="light" className="bg-bone px-6 py-20 md:px-12 md:py-32 lg:px-20">
      <div className="mx-auto grid max-w-[90rem] gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="label text-mut">— Questions</p>
          <h2 className="cond mt-5 text-[clamp(3rem,7vw,6rem)]">
            <MaskReveal onView>On te</MaskReveal>
            <MaskReveal onView delay={0.12}>répond</MaskReveal>
          </h2>
        </div>
        <div className="md:col-span-8">
          <ul className="border-t border-ink/12">
            {FAQ.map((f, i) => {
              const isOpen = open === i;
              return (
                <li key={i} className="border-b border-ink/12">
                  <button onClick={() => setOpen(isOpen ? -1 : i)} className="flex w-full items-center gap-5 py-6 text-left md:py-7" aria-expanded={isOpen}>
                    <span className="grot w-8 text-sm text-mut tabular">{String(i + 1).padStart(2, "0")}</span>
                    <span className="grot flex-1 text-[clamp(1.15rem,2.2vw,1.75rem)] leading-tight">{f.q}</span>
                    <span className="relative h-4 w-4 flex-none" aria-hidden>
                      <span className="absolute left-0 top-1/2 h-px w-4 bg-ink" />
                      <motion.span animate={{ rotate: isOpen ? 0 : 90 }} transition={{ duration: 0.5, ease: easing.outExpo }} className="absolute left-0 top-1/2 h-px w-4 bg-ink" />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.8, ease: easing.outExpo }} className="overflow-hidden">
                        <p className="max-w-2xl pb-7 pl-[3.25rem] text-[15px] leading-relaxed text-mut md:text-base">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
