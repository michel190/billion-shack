import { STORE } from "./store";
import { PRODUCTS, formatPrice } from "./products";
import type { CartLine } from "./cart";

export interface Customer {
  name: string;
  country: string;
  place: string; // ville et quartier
  note: string;
}

/** Message de commande envoyé sur WhatsApp. */
export function buildOrderMessage(lines: CartLine[], c: Customer): string {
  const rows: string[] = [];
  let total = 0;
  let unknown = false;
  for (const l of lines) {
    const p = PRODUCTS.find((x) => x.id === l.id);
    if (!p) continue;
    if (p.price === null) unknown = true;
    else total += p.price * l.qty;
    const price = p.price === null ? "prix à confirmer" : formatPrice(p.price * l.qty);
    rows.push(`• ${l.qty} × ${p.name} — taille ${l.size} — ${price}`);
  }
  const msg = [
    `Bonjour ${STORE.name} ! Je souhaite commander :`,
    "",
    ...rows,
    "",
    `Total : ${unknown ? (total > 0 ? `${formatPrice(total)} + articles à confirmer` : "à confirmer") : formatPrice(total)}`,
    "",
    `Nom : ${c.name.trim()}`,
    `Livraison : ${c.place.trim()} — ${c.country.trim()}`,
  ];
  if (c.note.trim()) msg.push(`Note : ${c.note.trim()}`);
  return msg.join("\n");
}

export function whatsappUrl(text: string): string {
  return `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`;
}
