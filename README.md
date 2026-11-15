# BILLION SHACK — boutique en ligne (streetwear & casual · Lomé · Abidjan)

Site e-commerce « premium », tout en 3D : héros animé au défilement (inspiré du site Kenless) avec le sweat 3D
aux motifs de la marque, section « Plus qu'une boutique, un état d'esprit » avec le sweat 3D qui tourne, collection en grille premium
(filtres, tailles sous chaque article → ajout direct au panier), fiche produit, panier → **commande envoyée sur WhatsApp**.
Fait avec Next.js 16 (export statique), prêt pour Netlify : voir « Mettre le site en ligne » plus bas.

## Les 2 fichiers à modifier

| Fichier | Quoi |
|---|---|
| `lib/store.ts` | Numéro WhatsApp, Snapchat, TikTok, boutiques (adresses + liens Google Maps), phrases livraison/paiement, textes, chiffres, couleurs et motifs du sweat 3D, photo de la section « état d’esprit » |
| `lib/products.ts` | **Tes produits** : nom, catégorie, prix en FCFA, tailles, photo de face + photo de dos, badge (« Nouveau »…), pièce placée en premier |

⚠️ Les 6 produits actuels sont des **exemples** (badge « Exemple », « Prix à venir », images 3D dans `public/produits/exemples/`) :
remplace-les par tes vrais articles.

## Le héros animé en 3D (en haut de la page)

En faisant défiler, comme sur la vidéo Kenless : fond clair avec « BILLION SHACK » en géant et un **sweat en 3D**
aux motifs de la marque devant les lettres (il pivote un peu avec la souris) → les lettres disparaissent, un fond noir monte →
le sweat se retourne et montre le dos (le smiley « BS ») → une **ligne lumineuse monte de bas en haut** et le transforme en
nuage de particules (contours brillants, le smiley reste dessiné en particules) → les particules coulent en nappe, puis **remontent écrire le nom en 3D**,
une traînée « comète » dessine le logo au-dessus → **balayage de gauche à droite** : le texte devient chromé →
le fond noir redescend.

- **Couleurs du sweat 3D** : `hero3d` dans `lib/store.ts` (tissu et fourrure).
- **Motifs du sweat 3D** : voir plus bas « Les motifs de la marque ».
- **Textes** : `heroLines` (phrases en italique) et `stats` (les chiffres : uniquement des faits vrais).
- **Vitesse des étapes** : `lib/hero.ts` (chaque étape = un intervalle entre 0 et 1).
- La 3D (three.js) se charge **après** l'affichage de la page : en attendant, une image du sweat 3D s'affiche
  (`public/hero/sweat-3d.webp`). Si l'appareil ne gère pas la 3D, ou si le téléphone demande « moins d'animations »,
  cette image reste affichée.
- Le sweat 3D est modélisé par le code (`components/hero/hoodie3d.ts`), les lettres 3D viennent de la police
  du site (`components/hero/glyphs.ts`), la scène est dans `components/hero/scene3d.ts`.

## Les motifs de la marque (sur le sweat 3D)

Imprimés sur le sweat 3D partout sur le site (héros, section « état d'esprit », image du hoodie d'exemple),
comme sur le modèle de la marque :

| Fichier (`public/hero/motifs/`) | Où |
|---|---|
| `poitrine.webp` | devant, sur la poitrine : « BILLIONSHACK » en arc (coupé par la fermeture éclair) |
| `poche.webp` | devant, sur la poche kangourou : « Rare authentic limited edition » |
| `dos.webp` | dos, en grand : le smiley avec « BS » |
| `signature.webp` | dos, en bas à gauche : la signature |

- Ces images ont été **découpées dans la maquette** (une image assez petite), puis nettoyées : le rendu est propre
  mais pas aussi fin qu'avec les fichiers d'origine. **Si tu as les fichiers d'origine du designer** (PNG à fond
  transparent, motif blanc/gris), remplace ces 4 fichiers en gardant **les mêmes noms**. Si tes fichiers sont en `.png`,
  change aussi l'extension dans `hero3d.prints` (`lib/store.ts`).
- Pour enlever un motif : mets `""` à sa place dans `hero3d.prints`.
- Taille et position de chaque motif : les 4 lignes `place(...)` à la fin de `components/hero/hoodie3d.ts`
  (x = gauche/droite, y = haut/bas, puis la largeur).
- Les images fixes (`public/hero/sweat-3d.webp`, `public/produits/exemples/hoodie*.webp`) et le film ont été refaits avec les motifs.

## Le film

La vidéo du héros 3D (sans l'interface du site) est dans la section « La boutique », à côté de Snapchat et TikTok :
`public/film/billion-shack-film.mp4` (+ image d'attente `billion-shack-film.webp`). Elle se lance toute seule,
sans le son, quand on arrive dessus. Pour mettre une autre vidéo, remplace ces deux fichiers (même nom).

## Section « Plus qu'une boutique, un état d'esprit »

Par défaut : le sweat 3D qui tourne lentement, avec un effet pellicule (grain, vignettage).
Pour mettre une photo à la place : mets-la dans `public/hero/` puis `etatImage: "/hero/ma-photo.jpg"` dans `lib/store.ts`.

## Ajouter des photos de produits

- Mets les photos dans `public/produits/` (ex. `hoodie-noir.png`) puis écris `image: "/produits/hoodie-noir.png"` dans `lib/products.ts`.
  Pour le dos : `imageBack: "/produits/hoodie-noir-dos.png"` → la collection affiche face + dos côte à côte,
  et la fiche produit a un bouton « Devant / Dos ».
  Idéal : photo **détourée** (fond transparent, .png) ou sur fond clair uni, format carré ou portrait.

Sans photo, une case « Photo à venir » s'affiche.

## La collection

Grille façon boutique streetwear premium : barre de filtres (catégorie, taille, tri, taille des vignettes) qui reste en haut,
grandes vignettes gris clair (au survol : la photo de dos si elle existe), nom + prix, et les tailles sous chaque article :
**un clic sur une taille ajoute l'article au panier**. Un clic sur la vignette ouvre la fiche produit.

## Logo

Dans `public/marque/` : versions **claires** (texte blanc, pour les fonds sombres : `sac.png`, `texte.png`,
`logo-billion-shack.png`, `logo-slogan.png`) et versions **foncées** (pour les fonds clairs : `sac-clair.png`,
`texte-encre.png`). L'en-tête passe tout seul de l'une à l'autre selon le fond.

## Tester sur ton PC

Il faut **Node.js 20.9 ou plus récent** : vérifie avec `node -v` (sinon, installe la version « LTS » sur nodejs.org).

```powershell
npm install
npm run dev
```
puis ouvrir http://localhost:3000

## Mettre le site en ligne (Netlify, gratuit)

Le site est 100 % statique : `npm run build` crée le dossier **`out`**, c'est lui qu'on met en ligne.
Il contient déjà le fichier `_headers` (les protections du site).

1. Va sur https://app.netlify.com → page **Projects** → **Add new project** → **Deploy manually**.
2. Glisse le dossier **`out`** (celui qui contient `index.html`) dans la zone de dépôt.
3. Renomme le site : **Customize** → **Manage project name and cover image** → `billion-shack`
   → adresse `https://billion-shack.netlify.app` (si le nom est pris, essaie `billionshack`).

### Mettre à jour le site en ligne

1. Modifie le projet et teste avec `npm run dev`.
2. `npm run build` (recrée le dossier `out`).
3. Netlify → ton projet → onglet **Deploys** → glisse le nouveau dossier `out` dans la zone en bas de la page.

### Avec GitHub (mises à jour automatiques)

Mets le projet (sans `node_modules`, `.next` ni `out`) dans un dépôt GitHub, puis Netlify → **Add new project** →
**Import an existing project** → GitHub → le dépôt → **Deploy**. Les réglages sont lus dans `netlify.toml`
(commande `npm run build`, dossier `out`, Node 22). Ensuite, chaque envoi sur GitHub met le site à jour tout seul.

## Sécurité

- Next.js 16 et React 19, versions suivies et corrigées : `npm audit` ne trouve aucune faille.
- Les protections sont dans `public/_headers` (CSP, HTTPS obligatoire, anti-iframe, isolement des fenêtres WhatsApp…) :
  ne supprime pas ce fichier.
- Le site ne contient ni mot de passe ni clé secrète : les commandes partent sur WhatsApp.

## Style

Style **« fanzine photocopié »** : papier `#F3F0E8`, encre `#111111` et **une seule couleur vive**, l'orange `#FF5B14`
(modifiables dans `tailwind.config.js`). Pas de dégradé ni de halo : des aplats, des traits noirs, du grain de photocopieuse,
des bandeaux de titre, du scotch, des autocollants ronds (classes `strip`, `taped`, `sticker`, `halftone` dans `app/globals.css`).
Petit texte orange sur papier : utiliser `text-accent-dark` (lisible) ; l'orange vif sert aux aplats et au texte sur fond noir.
Typographies : Big Shoulders Display (titres) et Courier Prime (texte, façon machine à écrire).
3D : three.js (licence MIT), chargé seulement quand le héros s'affiche.
Les polices sont incluses dans le site (aucune dépendance à Google Fonts) et libres d'usage commercial (OFL).
