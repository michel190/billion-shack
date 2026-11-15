"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { easing } from "@/lib/motion";
import { STORE } from "@/lib/store";
import { PH, heroBottomToneAt, heroToneAt, seg } from "@/lib/hero";
import type { HeroScene } from "./hero/scene3d";
import { stillRect } from "./hero/layout";

const WORDS = STORE.name.toUpperCase().split(/\s+/);
const TOTAL = WORDS.join("").length;
// ordre (fixe) dans lequel les lettres géantes disparaissent, comme sur Kenless
const ORDER = [2, 9, 0, 6, 11, 4, 8, 1, 10, 5, 3, 7];

/**
 * Héros animé au défilement (calé sur la vidéo Kenless), en 3D :
 * 1. fond clair, nom géant, le sweat 3D devant les lettres (il suit la souris) ;
 * 2. un fond noir monte, le sweat se retourne et montre le dos ;
 * 3. une ligne lumineuse monte de bas en haut : il devient un nuage de particules ;
 * 4. les particules coulent en nappe puis remontent écrire « BILLION SHACK » en 3D (+ le logo) ;
 * 5. balayage gauche → droite : le texte devient chromé ; puis le fond noir redescend.
 */

function GiantLetter({ ch, i, sp, motionOn, intro }: { ch: string; i: number; sp: MotionValue<number>; motionOn: boolean; intro: boolean }) {
  const span = PH.out[1] - PH.out[0];
  const rank = ORDER.indexOf(i % ORDER.length);
  const a = PH.out[0] + (rank / TOTAL) * span * 0.75;
  const b = a + span * 0.25;
  const opacity = useTransform(sp, [a, b], [1, 0]);
  const filter = useTransform(sp, [a, b], ["blur(0px)", "blur(12px)"]);
  return (
    <span className={`inline-block ${intro ? "overflow-hidden" : ""} pb-[0.02em]`}>
      <motion.span className="inline-block" initial={motionOn ? { y: "105%" } : false} animate={{ y: "0%" }} transition={{ duration: 1.4, delay: 0.1 + i * 0.06, ease: easing.outExpo }}>
        <motion.span className="inline-block" style={motionOn ? { opacity, filter } : undefined}>
          {ch}
        </motion.span>
      </motion.span>
    </span>
  );
}

function Counter({ sp, value, label, sub }: { sp: MotionValue<number>; value: number; label: string; sub: string }) {
  const v = useTransform(sp, [PH.scan[1] - 0.04, PH.hold[1] - 0.02], [0, value]);
  const txt = useTransform(v, (x) => String(Math.round(x)).padStart(2, "0"));
  return (
    <div className="text-right">
      <motion.p className="grot text-[clamp(1.9rem,3.4vw,3.2rem)] leading-none tabular">{txt}</motion.p>
      <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-bone/85 md:text-[11px]">{label}</p>
      <p className="mt-0.5 text-[11px] text-mutd md:text-[12px]">{sub}</p>
    </div>
  );
}

export default function HeroSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const toneRef = useRef<"light" | "dark">("light");

  const prefersReduced = useReducedMotion();
  const [reduced, setReduced] = useState(false); // lu après l'affichage (même rendu serveur / navigateur)
  const [intro, setIntro] = useState(true);
  const [ready3d, setReady3d] = useState(false);
  const [failed3d, setFailed3d] = useState(false);
  const [bottomDark, setBottomDark] = useState(false);
  const [still, setStill] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const motionOn = !reduced;
  const flat = reduced || failed3d; // sans 3D : image du sweat

  useEffect(() => setReduced(!!prefersReduced), [prefersReduced]);
  // image fixe du sweat 3D : placée exactement là où le sweat 3D va apparaître
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const place = () => setStill(stillRect(stage.clientWidth, stage.clientHeight));
    place();
    const ro = new ResizeObserver(place);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const t = window.setTimeout(() => setIntro(false), 2400);
    return () => window.clearTimeout(t);
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const sp = useSpring(scrollYProgress, { stiffness: 160, damping: 34, mass: 0.45, restDelta: 0.0004 });

  // fond noir : monte, reste, puis redescend
  const panelY = useTransform(sp, [PH.panel[0], PH.panel[1], PH.exit[0], PH.exit[1]], ["100%", "0%", "0%", "100%"]);
  const radius = useTransform(sp, [PH.panel[0], PH.panel[1], PH.exit[0], PH.exit[1]], [44, 0, 0, 44]);
  const glow = useTransform(sp, [PH.panel[1] - 0.04, PH.panel[1], PH.scan[1], PH.flow[0] + 0.03], [0, 1, 1, 0]);

  // sweat en image (seulement sans 3D)
  const flatOp = useTransform(sp, [PH.scan[0], PH.scan[1]], [1, 0]);

  // textes et chiffres
  const t1 = useTransform(sp, [PH.scan[0] + 0.03, PH.hold[0], PH.flow[0] + 0.01, PH.flow[0] + 0.05], [0, 1, 1, 0]);
  const t1y = useTransform(sp, [PH.scan[0] + 0.03, PH.hold[0]], [26, 0]);
  const t2 = useTransform(sp, [PH.rise[1] - 0.03, PH.rise[1] + 0.02, PH.exit[0] - 0.02, PH.exit[0] + 0.02], [0, 1, 1, 0]);
  const t2y = useTransform(sp, [PH.rise[1] - 0.03, PH.rise[1] + 0.02], [26, 0]);
  const infoOp = useTransform(sp, [0, PH.out[0] + 0.03], [1, 0]);

  useMotionValueEvent(sp, "change", (v) => {
    const t = heroToneAt(v);
    if (t !== toneRef.current && sectionRef.current) {
      toneRef.current = t;
      sectionRef.current.dataset.tone = t;
      window.dispatchEvent(new Event("bs-tone"));
    }
    const b = heroBottomToneAt(v) === "dark";
    if (b !== bottomDark) setBottomDark(b);
  });

  // scène 3D (chargée après l'affichage de la page)
  useEffect(() => {
    if (reduced) return;
    const stage = stageRef.current;
    const canvas = glRef.current;
    const section = sectionRef.current;
    if (!stage || !canvas || !section) return;
    let scene: HeroScene | null = null;
    let alive = true;
    let raf = 0;
    let visible = true;
    const lite = window.matchMedia("(pointer: coarse)").matches || Math.min(window.innerWidth, window.innerHeight) < 700;
    const hq = new URLSearchParams(window.location.search).has("hq"); // pleine définition (pour filmer l'aperçu)
    const dprOf = () => Math.min(window.devicePixelRatio || 1, hq ? 3 : lite ? 1.5 : 1.75);
    let W = stage.clientWidth;
    let H = stage.clientHeight;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (scene && visible) scene.update(sp.get(), now / 1000);
    };

    (async () => {
      try {
        const test = document.createElement("canvas").getContext("webgl2") || document.createElement("canvas").getContext("webgl");
        if (!test) throw new Error("pas de WebGL");
        const mod = await import("./hero/scene3d");
        if (!alive) return;
        scene = await mod.createHeroScene(
          canvas,
          { lite, fabric: STORE.hero3d.fabric, fur: STORE.hero3d.fur, prints: STORE.hero3d.prints, logoDark: "/marque/sac.png", logoLight: "/marque/sac-clair.png" },
          W,
          H,
          dprOf()
        );
        if (!alive) {
          scene.dispose();
          return;
        }
        setReady3d(true);
        raf = requestAnimationFrame(frame);
      } catch {
        if (alive) setFailed3d(true);
      }
    })();

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "120px" });
    io.observe(section);

    let t = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        if (!scene || (stage.clientWidth === W && stage.clientHeight === H)) return;
        W = stage.clientWidth;
        H = stage.clientHeight;
        scene.setSize(W, H, dprOf());
      }, 200);
    });
    ro.observe(stage);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !scene) return;
      scene.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.clearTimeout(t);
      window.removeEventListener("pointermove", onMove);
      scene?.dispose();
    };
  }, [reduced, sp]);

  const pill = bottomDark
    ? { wrap: "border-white/15 bg-night/55 text-bone shadow-[0_18px_40px_-22px_rgba(0,0,0,.8)]", link: "hover:bg-white/10", cta: "bg-bone text-ink hover:bg-accent hover:text-bone" }
    : { wrap: "border-ink/10 bg-bone/90 text-ink shadow-[0_18px_40px_-22px_rgba(15,13,26,.45)]", link: "hover:bg-ink/5", cta: "bg-ink text-bone hover:bg-accent" };

  return (
    <section id="top" ref={sectionRef} data-tone="light" data-hero="1" className={`relative ${reduced ? "h-[100svh]" : "h-[520vh] supports-[height:100svh]:h-[520svh]"}`}>
      <div ref={stageRef} className="noise sticky top-0 isolate h-screen overflow-hidden bg-fog supports-[height:100svh]:h-[100svh]">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 55%, rgba(255,255,255,.7), transparent 70%)" }} />

        {/* 1 · nom géant */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[15svh] z-0 flex select-none flex-col items-center text-ink md:top-[50%] md:-translate-y-1/2">
          <span className="giant flex flex-col items-center" style={{ fontSize: "min(19.4vw, 31svh)", lineHeight: 0.84 }}>
            {WORDS.map((w, wi) => (
              <span key={w} className="flex">
                {w.split("").map((ch, ci) => {
                  const i = WORDS.slice(0, wi).join("").length + ci;
                  return <GiantLetter key={ci} ch={ch} i={i} sp={sp} motionOn={motionOn} intro={intro} />;
                })}
              </span>
            ))}
          </span>
        </div>

        {/* 2 · fond noir qui monte puis redescend */}
        <motion.div
          aria-hidden
          className="noise noise-dark absolute inset-0 z-10 bg-night"
          style={reduced ? { y: "100%" } : { y: panelY, borderTopLeftRadius: radius, borderTopRightRadius: radius }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[15]"
          style={{ opacity: reduced ? 0 : glow, background: "radial-gradient(ellipse 34% 42% at 50% 52%, rgba(227,41,125,.26), transparent 70%), radial-gradient(ellipse 50% 40% at 30% 30%, rgba(85,138,252,.16), transparent 70%)" }}
        />

        {/* 3 · le sweat : en 3D… */}
        {!reduced && (
          <motion.canvas
            ref={glRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 h-full w-full"
            initial={{ opacity: 0, y: 40 }}
            animate={ready3d ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 1.4, ease: easing.outExpo }}
          />
        )}
        {/* … en image pendant le chargement de la 3D, ou si la 3D n'est pas possible / moins d'animations demandé */}
        <div
          className="pointer-events-none absolute z-20"
          style={still ? { left: still.left, top: still.top, width: still.width, height: still.height } : { left: "50%", top: "25svh", height: "61svh", aspectRatio: "1116 / 1100", translate: "-50% 0" }}
        >
          <motion.div
            className="h-full w-full"
            initial={motionOn ? { opacity: 0, y: 40 } : false}
            animate={{ opacity: ready3d && !flat ? 0 : 1, y: 0 }}
            transition={{ duration: ready3d ? 0.9 : 1.2, delay: ready3d ? 0.25 : 0.3, ease: easing.outExpo }}
          >
            <motion.img src="/hero/sweat-3d.webp" alt={`${STORE.name} — sweat à capuche`} width={1116} height={1100} className="h-full w-full object-contain" style={reduced ? undefined : { opacity: flatOp }} />
          </motion.div>
        </div>

        {/* textes de la partie sombre */}
        {!reduced && (
          <>
            <motion.div className="pointer-events-none absolute left-6 top-[15svh] z-40 text-bone md:left-12 md:top-[19svh] lg:left-20" style={{ opacity: t1, y: t1y }}>
              <p className="serif text-[clamp(2.1rem,3.6vw,3.6rem)]">
                {STORE.heroLines.first[0]}
                <br />
                {STORE.heroLines.first[1]}
              </p>
              <p className="mt-5 hidden max-w-[17rem] text-[13px] leading-relaxed text-mutd md:block">{STORE.about[0]}</p>
            </motion.div>
            <motion.div className="pointer-events-none absolute inset-x-6 bottom-[13svh] z-40 flex justify-between gap-3 text-bone md:inset-x-auto md:bottom-auto md:right-12 md:top-[34svh] md:flex-col md:gap-7 lg:right-20" style={{ opacity: t1 }}>
              {STORE.stats.map((s) => (
                <Counter key={s.label} sp={sp} value={s.value} label={s.label} sub={s.sub} />
              ))}
            </motion.div>
            <motion.div className="pointer-events-none absolute left-6 top-[15svh] z-40 text-bone md:left-12 md:top-[16svh] lg:left-20" style={{ opacity: t2, y: t2y }}>
              <p className="serif text-[clamp(2.1rem,3.6vw,3.6rem)]">
                {STORE.heroLines.second[0]}
                <br />
                {STORE.heroLines.second[1]}
              </p>
            </motion.div>
            <motion.p className="pointer-events-none absolute bottom-[14svh] right-6 z-40 hidden max-w-[16rem] text-right text-[13px] leading-relaxed text-mutd md:right-12 md:block lg:right-20" style={{ opacity: t2 }}>
              {STORE.delivery}. Commande sur WhatsApp, en quelques secondes.
            </motion.p>
          </>
        )}

        {/* barre du bas : infos + raccourcis */}
        <div className="absolute inset-x-0 bottom-0 z-50">
          <div className="mx-auto grid max-w-[90rem] items-end gap-5 px-6 pb-6 md:grid-cols-[1fr_auto_1fr] md:px-12 md:pb-8 lg:px-20">
            <motion.div style={{ opacity: reduced ? 1 : infoOp }} className="hidden md:block">
              <motion.div initial={motionOn ? { opacity: 0, y: 16 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.1, ease: easing.outExpo }}>
                <p className="label text-ink">Streetwear & casual</p>
                <p className="mt-1 text-[13px] text-mut">Boutiques à {STORE.cities}</p>
              </motion.div>
            </motion.div>

            <motion.nav
              initial={motionOn ? { opacity: 0, y: 24 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 1.0, ease: easing.outExpo }}
              aria-label="Raccourcis"
              className={`mx-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-full border p-1.5 backdrop-blur transition-colors duration-500 scrollbar-none ${pill.wrap}`}
            >
              {[
                ["Collection", "#collection"],
                ["Boutiques", "#boutiques"],
                ["Livraison", "#commander"],
              ].map(([l, h]) => (
                <a key={h} href={h} className={`${l === "Boutiques" ? "hidden sm:inline-block" : ""} whitespace-nowrap rounded-full px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors duration-300 sm:px-4 sm:text-[11px] sm:tracking-[0.16em] ${pill.link}`}>
                  {l}
                </a>
              ))}
              <a href="#collection" className={`whitespace-nowrap rounded-full px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors duration-300 sm:px-5 sm:text-[11px] sm:tracking-[0.16em] ${pill.cta}`}>
                Commander
              </a>
            </motion.nav>

            <motion.div style={{ opacity: reduced ? 1 : infoOp }} className="hidden text-right md:block">
              <motion.div initial={motionOn ? { opacity: 0, y: 16 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.2, ease: easing.outExpo }}>
                <p className="text-[13px] text-mut">{STORE.deliveryShort}</p>
                <a href="#collection" className="group relative mt-1 inline-block label text-ink">
                  Voir la collection
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-left bg-ink transition-transform duration-500 group-hover:origin-right group-hover:scale-x-0" />
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-accent transition-transform delay-[250ms] duration-500 group-hover:origin-left group-hover:scale-x-100" />
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
