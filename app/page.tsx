"use client";

import { MotionConfig } from "framer-motion";
import { CartProvider } from "@/lib/cart";
import Masthead from "@/components/Masthead";
import HeroSequence from "@/components/HeroSequence";
import Collection from "@/components/Collection";
import EtatDesprit from "@/components/EtatDesprit";
import HowToOrder from "@/components/HowToOrder";
import Shops from "@/components/Shops";
import Brand from "@/components/Brand";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import ProductSheet from "@/components/ProductSheet";
import CartDrawer from "@/components/CartDrawer";
import Overlays from "@/components/Overlays";
import { STORE } from "@/lib/store";

export default function Home() {
  return (
    // reducedMotion="user" : si le téléphone demande moins d'animations, les mouvements sont coupés
    <MotionConfig reducedMotion="user">
    <CartProvider>
      <Masthead />
      <main id="contenu" tabIndex={-1}>
        {/* titre principal de la page (lu par les lecteurs d'écran et Google) ; le grand nom visible est en 3D */}
        <h1 className="sr-only">{STORE.name} — streetwear et casual à Lomé et Abidjan, commande sur WhatsApp</h1>
        <HeroSequence />
        <EtatDesprit />
        <Collection />
        <HowToOrder />
        <Shops />
        <Brand />
        <Faq />
      </main>
      <Footer />
      <ProductSheet />
      <CartDrawer />
      <Overlays />
    </CartProvider>
    </MotionConfig>
  );
}
