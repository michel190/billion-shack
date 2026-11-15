/**
 * Adresse publique du site. Sur Netlify, la variable URL est fournie automatiquement au moment
 * du build (adresse .netlify.app, ou ton nom de domaine si tu en relies un) : rien à modifier.
 * Elle sert à l'aperçu des liens (WhatsApp, TikTok, Facebook…), au plan du site et à Google.
 */
export const SITE_URL = (process.env.URL || "https://billion-shack.netlify.app").replace(/\/$/, "");
