import type { Metadata, Viewport } from "next";
// Polices hébergées avec le site (aucune dépendance à Google Fonts)
// titres : Big Shoulders Display ; texte : Courier Prime (machine à écrire)
import "@fontsource/big-shoulders-display/700";
import "@fontsource/big-shoulders-display/800";
import "@fontsource/big-shoulders-display/900";
import "@fontsource/courier-prime/400.css";
import "@fontsource/courier-prime/400-italic.css";
import "@fontsource/courier-prime/700.css";
import "./globals.css";
import { STORE } from "@/lib/store";
import { SITE_URL } from "@/lib/site";

const TITLE = "Billion Shack — Streetwear · Lomé & Abidjan";
const DESCRIPTION =
  "Billion Shack : streetwear et casual. Boutiques à Lomé (Adidoadin) et à Abidjan (Angré Djorobité). Commande sur WhatsApp, livraison partout en Afrique et dans le monde.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  // aperçu du lien quand on le partage (WhatsApp, Facebook, TikTok, X…)
  openGraph: {
    title: TITLE,
    description: "Commande sur WhatsApp. Livraison partout en Afrique et dans le monde.",
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: STORE.name,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Billion Shack — sweat 3D et logo de la boutique" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/og.jpg"] },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
};

// fiche de la boutique pour Google (deux adresses, réseaux, contact WhatsApp)
const COUNTRY: Record<string, string> = { Togo: "TG", "Côte d'Ivoire": "CI" };
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  name: STORE.name,
  slogan: STORE.tagline,
  description: DESCRIPTION,
  url: SITE_URL,
  image: `${SITE_URL}/og.jpg`,
  logo: `${SITE_URL}/marque/logo-billion-shack.png`,
  telephone: STORE.whatsappDisplay.replace(/\s/g, ""),
  currenciesAccepted: "XOF",
  sameAs: [STORE.tiktok, STORE.snapchatUrl],
  department: STORE.shops.map((s) => ({
    "@type": "ClothingStore",
    name: `${STORE.name} ${s.city}`,
    address: { "@type": "PostalAddress", streetAddress: `${s.area} — ${s.detail}`, addressLocality: s.city, addressCountry: COUNTRY[s.country] ?? s.country },
    hasMap: s.maps,
  })),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {children}
        {/* « < » échappé : le texte ne peut jamais fermer la balise script */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c") }} />
      </body>
    </html>
  );
}
