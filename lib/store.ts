/**
 * Réglages de la boutique BILLION SHACK — tout ce qui est propre à la boutique est ici.
 *
 * ⚠️ À VÉRIFIER avant la mise en ligne :
 *   - whatsapp : numéro qui reçoit les commandes, au format international SANS « + » ni espaces.
 *   - shops / maps : pour un lien d'itinéraire exact, ouvre ta boutique dans Google Maps
 *     → « Partager » → « Copier le lien », puis colle ce lien à la place de `maps`.
 *   - hero3d : couleurs du sweat 3D (tissu et fourrure) et motifs de la marque imprimés dessus
 *     (images dans public/hero/motifs/ ; mets "" pour enlever un motif).
 *   - etatImage : la photo de la section « Plus qu'une boutique, un état d'esprit »
 *     (effet pellicule ajouté automatiquement).
 */

const maps = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export const STORE = {
  name: "Billion Shack",
  // Slogan du logo (écrit comme sur ton logo)
  tagline: "Soit le plus drip et le plus stylé",
  // Numéro qui reçoit les commandes (format international, sans + ni espaces)
  whatsapp: "22896073951",
  whatsappDisplay: "+228 96 07 39 51",
  // Snapchat : là où tu réponds le plus vite
  snapchat: "Obedfitskii",
  snapchatUrl: "https://www.snapchat.com/add/obedfitskii",
  tiktok: "https://www.tiktok.com/@_ob_ed_",
  tiktokHandle: "@_ob_ed_",
  currency: "FCFA",
  cities: "Lomé · Abidjan",
  delivery: "Livraison partout en Afrique et dans le monde",
  deliveryShort: "Livraison Afrique & monde",
  payment: "Paiement à la livraison ou avant l'envoi",
  // Sweat 3D du héros : couleur du tissu et de la fourrure (doublure)
  hero3d: {
    fabric: "#141317",
    fur: "#ece8ee",
    prints: {
      chest: "/hero/motifs/poitrine.webp", // devant : « BILLIONSHACK »
      pocket: "/hero/motifs/poche.webp", // devant, sur la poche : « Rare authentic limited edition »
      back: "/hero/motifs/dos.webp", // dos : le smiley « BS »
      sign: "/hero/motifs/signature.webp", // dos, en bas : la signature
    },
  },
  etatImage: "" as string, //     ex. "/hero/etat-d-esprit.jpg"
  // Phrases du héros (écriture fine en italique)
  heroLines: {
    first: ["Soit le plus drip,", "et le plus stylé."],
    second: ["Ce qui arrive", "entre tes mains."],
  },
  // Chiffres du héros : uniquement des faits vrais
  stats: [
    { value: 2, label: "Boutiques", sub: "Lomé · Abidjan" },
    { value: 54, label: "Pays d'Afrique", sub: "+ le reste du monde" },
    { value: 1, label: "Message WhatsApp", sub: "pour commander" },
  ],
  // Étiquette de la collection en cours (en haut de la planche Collection)
  drop: "Drop 01",
  // Les boutiques
  shops: [
    {
      city: "Lomé",
      country: "Togo",
      area: "Adidoadin",
      detail: "À côté du restaurant La Weed",
      maps: maps("Adidoadin, Lomé, Togo"),
    },
    {
      city: "Abidjan",
      country: "Côte d'Ivoire",
      area: "Angré Djorobité",
      detail: "Cocody",
      maps: maps("Angré Djorobité, Cocody, Abidjan"),
    },
  ],
  // Texte « La boutique » — remplace-le par ton histoire si tu veux
  about: [
    "Billion Shack, c'est une boutique de streetwear et de casual, à Lomé et à Abidjan.",
    "Commande depuis ton téléphone, sur WhatsApp : nous livrons partout en Afrique et dans le monde.",
  ],
};
