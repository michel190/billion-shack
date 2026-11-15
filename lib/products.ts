/**
 * Catalogue BILLION SHACK — le SEUL fichier à modifier pour gérer tes produits.
 *
 * Pour chaque produit :
 *   - name      : nom affiché
 *   - category  : une des catégories ci-dessous
 *   - price     : prix en FCFA (nombre, ex. 15000) — ou null tant que le prix n'est pas fixé
 *   - sizes     : tailles disponibles
 *   - image     : photo dans /public/produits (ex. "/produits/hoodie-noir.png").
 *                 Idéal : photo détourée (fond transparent) ou sur fond clair uni.
 *                 Sans photo, une case « Photo à venir » s'affiche.
 *   - imageBack : photo de DOS (facultatif) — affichée à côté de la face dans la collection
 *   - badge     : petit badge noir sur la vignette (ex. "Nouveau") — facultatif
 *   - featured  : true = pièce placée en premier dans sa rubrique
 *   - exemple   : true = produit d'exemple (badge « Exemple »). Mets false (ou supprime)
 *                 quand tu as rempli tes vrais produits.
 *
 * ⚠️ Les 6 produits ci-dessous sont des EXEMPLES pour la mise en page (images 3D) :
 *    aucun prix ni description n'est inventé. Remplace-les par tes vrais articles.
 */

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number | null;
  sizes: string[];
  description: string;
  image?: string;
  imageBack?: string;
  badge?: string;
  featured?: boolean;
  exemple?: boolean;
}

export const CATEGORIES = ["T-shirts", "Sweats", "Pantalons", "Shorts", "Accessoires"];

const TAILLES = ["S", "M", "L", "XL", "XXL"];
// Images 3D des produits d'exemple (à remplacer par tes vraies photos)
const EX = "/produits/exemples";

export const PRODUCTS: Product[] = [
  { id: "hoodie", name: "Hoodie", category: "Sweats", price: null, sizes: TAILLES, description: "", image: `${EX}/hoodie.webp`, imageBack: `${EX}/hoodie-dos.webp`, featured: true, exemple: true },
  { id: "tshirt-oversize", name: "T-shirt oversize", category: "T-shirts", price: null, sizes: TAILLES, description: "", image: `${EX}/tshirt-oversize.webp`, imageBack: `${EX}/tshirt-oversize-dos.webp`, exemple: true },
  { id: "cargo", name: "Pantalon cargo", category: "Pantalons", price: null, sizes: TAILLES, description: "", image: `${EX}/cargo.webp`, exemple: true },
  { id: "casquette", name: "Casquette", category: "Accessoires", price: null, sizes: ["Taille unique"], description: "", image: `${EX}/casquette.webp`, exemple: true },
  { id: "jogging", name: "Jogging", category: "Pantalons", price: null, sizes: TAILLES, description: "", image: `${EX}/jogging.webp`, exemple: true },
  { id: "short", name: "Short", category: "Shorts", price: null, sizes: TAILLES, description: "", image: `${EX}/short.webp`, exemple: true },
];

/** Une vue de dos existe ? (photo de dos) */
export function hasBack(p: Product): boolean {
  return !!p.imageBack;
}

export function formatPrice(p: number | null): string {
  if (p === null) return "Prix à venir";
  return `${p.toLocaleString("fr-FR").replace(/[\u202f\u00a0]/g, " ")} FCFA`;
}
