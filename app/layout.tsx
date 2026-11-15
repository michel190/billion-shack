import type { Metadata, Viewport } from "next";
// Polices hébergées avec le site (aucune dépendance à Google Fonts)
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/inter/index.css";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Billion Shack — Streetwear · Lomé & Abidjan",
  description:
    "Billion Shack : streetwear et casual. Boutiques à Lomé (Adidoadin) et à Abidjan (Angré Djorobité). Commande sur WhatsApp, livraison partout en Afrique et dans le monde.",
  openGraph: {
    title: "Billion Shack — Streetwear · Lomé & Abidjan",
    description: "Commande sur WhatsApp. Livraison partout en Afrique et dans le monde.",
    type: "website",
    locale: "fr_FR",
  },
};

export const viewport: Viewport = {
  themeColor: "#0C081F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
