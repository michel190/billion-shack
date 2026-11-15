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

export default function Home() {
  return (
    // reducedMotion="user" : si le téléphone demande moins d'animations, les mouvements sont coupés
    <MotionConfig reducedMotion="user">
    <CartProvider>
      <Masthead />
      <main>
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
