"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { easing } from "@/lib/motion";

/**
 * Révélation « masque » (signature du style) : le contenu monte depuis 110 %
 * derrière un conteneur overflow-hidden. `onView` = déclenché au défilement.
 */
export default function MaskReveal({
  children,
  delay = 0,
  duration = 1.2,
  onView = false,
  show: showProp,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  onView?: boolean;
  /** Déclencheur donné par la section (prioritaire sur `onView`). */
  show?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  if (reduced) return <span className={`block ${className}`}>{children}</span>;
  const show = showProp ?? (onView ? inView : true);
  return (
    // -mt / pt : la zone visible remonte un peu, pour ne pas couper les accents des capitales (É)
    <span ref={ref} className={`-mt-[0.16em] block overflow-hidden pb-[0.08em] pt-[0.16em] ${className}`}>
      <motion.span
        className="block"
        initial={{ y: "110%" }}
        animate={{ y: show ? "0%" : "110%" }}
        transition={{ duration, delay, ease: easing.outExpo }}
      >
        {children}
      </motion.span>
    </span>
  );
}
