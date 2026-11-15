/**
 * Sweat à capuche zippé en 3D, modélisé par le code (pas de fichier 3D à charger) :
 * corps, manches, poignets et bas côtelés, capuche posée dans le dos avec bord en fourrure
 * (doublure sherpa), col en fourrure, fermeture éclair, poches — et les motifs de la marque imprimés
 * (devant : « BILLIONSHACK » + texte de poche ; dos : le smiley « BS » + signature).
 *
 * Toutes les matières partagent un « scanner » : sous la hauteur `uScan` (repère monde),
 * le tissu disparaît, avec une ligne lumineuse juste au-dessus — c'est la dissolution du héros.
 */
import * as THREE from "three";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";

export interface ScanUniforms {
  uScan: { value: number };
  uGlow: { value: number };
}

/** Images des motifs imprimés (déjà chargées). */
export interface HoodiePrints {
  chest?: HTMLImageElement; // devant, sur la poitrine
  pocket?: HTMLImageElement; // devant, à côté de la poche
  back?: HTMLImageElement; // dos, grand motif
  sign?: HTMLImageElement; // dos, en bas
}

export interface HoodieOptions {
  color: string; // couleur du tissu
  fur: string; // couleur de la fourrure
  lite: boolean; // version allégée (téléphones)
  scan: ScanUniforms;
  prints?: HoodiePrints;
}

export interface Hoodie {
  group: THREE.Group;
  /** maillages utilisés pour placer les particules (surface du sweat) */
  surfaces: THREE.Mesh[];
  /** motifs imprimés (userData.print = image du motif) */
  prints: THREE.Mesh[];
  dispose(): void;
}

/* ---------------- outils ---------------- */

export const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Interpolation douce (Catmull-Rom) d'une suite de points [x, valeur]. */
export function spline(keys: [number, number][], x: number): number {
  if (x <= keys[0][0]) return keys[0][1];
  const n = keys.length;
  if (x >= keys[n - 1][0]) return keys[n - 1][1];
  let i = 0;
  while (x > keys[i + 1][0]) i++;
  const [x1, y1] = keys[i];
  const [x2, y2] = keys[i + 1];
  const y0 = i > 0 ? keys[i - 1][1] : y1 - (y2 - y1);
  const y3 = i + 2 < n ? keys[i + 2][1] : y2 + (y2 - y1);
  const t = (x - x1) / (x2 - x1);
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * y1 + (-y0 + y2) * t + (2 * y0 - 5 * y1 + 4 * y2 - y3) * t2 + (-y0 + 3 * y1 - 3 * y2 + y3) * t3);
}

/** Grille (u autour, v en hauteur) → géométrie avec normales, UV et couleurs (ombrage d'occlusion). */
export function gridGeometry(U: number, V: number, closedU: boolean, at: (i: number, j: number) => { p: THREE.Vector3; ao: number }, flip = false) {
  const cols = closedU ? U : U + 1;
  const pos = new Float32Array(cols * (V + 1) * 3);
  const col = new Float32Array(cols * (V + 1) * 3);
  const uv = new Float32Array(cols * (V + 1) * 2);
  for (let j = 0; j <= V; j++) {
    for (let i = 0; i < cols; i++) {
      const k = j * cols + i;
      const { p, ao } = at(i, j);
      pos[k * 3] = p.x;
      pos[k * 3 + 1] = p.y;
      pos[k * 3 + 2] = p.z;
      col[k * 3] = col[k * 3 + 1] = col[k * 3 + 2] = ao;
      uv[k * 2] = i / U;
      uv[k * 2 + 1] = j / V;
    }
  }
  const idx: number[] = [];
  for (let j = 0; j < V; j++) {
    for (let i = 0; i < U; i++) {
      const a = j * cols + i;
      const b = j * cols + ((i + 1) % cols);
      const c = (j + 1) * cols + i;
      const d = (j + 1) * cols + ((i + 1) % cols);
      if (flip) idx.push(a, c, b, b, c, d);
      else idx.push(a, b, c, b, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Ajoute le « scanner » (dissolution de bas en haut) à une matière three.js. */
export function addScan<T extends THREE.Material>(m: T, scan: ScanUniforms, key: string): T {
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uScan = scan.uScan;
    sh.uniforms.uGlow = scan.uGlow;
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vScanW;")
      .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvScanW = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vScanW;\nuniform float uScan;\nuniform float uGlow;")
      .replace("#include <clipping_planes_fragment>", "#include <clipping_planes_fragment>\nif (vScanW.y < uScan) discard;")
      .replace(
        "#include <emissivemap_fragment>",
        "#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(1.0, 0.97, 1.0) * uGlow * (smoothstep(uScan + 0.07, uScan, vScanW.y) * 3.0);"
      );
  };
  m.customProgramCacheKey = () => `scan-${key}`;
  return m;
}

/** Petite texture de relief (maille du molleton) pour casser l'aspect lisse. */
export function knitNormalMap(): THREE.Texture {
  const S = 128;
  const h = new Float32Array(S * S);
  for (let i = 0; i < S * S; i++) h[i] = Math.random();
  // flou léger, puis côtes fines horizontales
  const b = new Float32Array(S * S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      let s = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += h[((y + dy + S) % S) * S + ((x + dx + S) % S)];
      b[y * S + x] = s / 9;
    }
  const data = new Uint8Array(S * S * 4);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const dx = b[y * S + ((x + 1) % S)] - b[y * S + ((x - 1 + S) % S)];
      const dy = b[((y + 1) % S) * S + x] - b[((y - 1 + S) % S) * S + x];
      const n = new THREE.Vector3(-dx * 1.5, -dy * 1.5, 1).normalize();
      const k = (y * S + x) * 4;
      data[k] = (n.x * 0.5 + 0.5) * 255;
      data[k + 1] = (n.y * 0.5 + 0.5) * 255;
      data[k + 2] = (n.z * 0.5 + 0.5) * 255;
      data[k + 3] = 255;
    }
  const t = new THREE.DataTexture(data, S, S, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(14, 14);
  t.needsUpdate = true;
  return t;
}

/** Texture de poils (points clairs) pour la fourrure en couches. */
function furMask(): THREE.Texture {
  const S = 256;
  const C = 64; // touffes : bruit grossier + fin
  const coarse = new Float32Array(C * C).map(() => Math.random());
  const data = new Uint8Array(S * S * 4);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const c = coarse[((y >> 2) % C) * C + ((x >> 2) % C)];
      const v = Math.min(1, 0.65 * c + 0.45 * Math.random()) * 255;
      const i = y * S + x;
      data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = v;
      data[i * 4 + 3] = 255;
    }
  const t = new THREE.DataTexture(data, S, S, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
}

/* ---------------- silhouette du corps ---------------- */

const W_KEYS: [number, number][] = [[-0.86, 0.61], [-0.45, 0.625], [0.05, 0.645], [0.42, 0.66], [0.56, 0.645], [0.66, 0.53], [0.74, 0.36], [0.8, 0.235]];
const D_KEYS: [number, number][] = [[-0.86, 0.3], [-0.45, 0.31], [0.05, 0.33], [0.42, 0.335], [0.56, 0.31], [0.66, 0.27], [0.74, 0.215], [0.8, 0.175]];
const Y_BOT = -0.86;
const Y_TOP = 0.8;
const EXP = 2.5;

/** Point de la coupe du corps à la hauteur y, angle u (0 = côté droit, π/2 = devant). */
function ring(y: number, u: number, w = spline(W_KEYS, y), d = spline(D_KEYS, y), ex = EXP) {
  const c = Math.cos(u);
  const s = Math.sin(u);
  const x = w * Math.sign(c) * Math.pow(Math.abs(c), 2 / ex);
  const z = d * Math.sign(s) * Math.pow(Math.abs(s), 2 / ex);
  return { x, z };
}

/** Profondeur du dos (z < 0) à la position x, hauteur y — pour poser la capuche dessus. */
function backZ(x: number, y: number) {
  const w = spline(W_KEYS, y);
  const d = spline(D_KEYS, y);
  const r = Math.min(0.999, Math.abs(x) / w);
  return -d * Math.pow(1 - Math.pow(r, EXP), 1 / EXP);
}

/** Contour de la capuche posée sur le dos. */
const HOOD = { half: 0.33, top: 0.83, tip: 0.4 };
const hoodTop = (x: number) => HOOD.top - 0.06 * Math.pow(x / HOOD.half, 2);
const hoodBottom = (x: number) => HOOD.tip + (hoodTop(x) - 0.03 - HOOD.tip) * Math.pow(Math.min(1, Math.abs(x) / HOOD.half), 1.6);

export function buildHoodie(o: HoodieOptions): Hoodie {
  const group = new THREE.Group();
  const disposables: { dispose(): void }[] = [];
  const surfaces: THREE.Mesh[] = [];
  const knit = knitNormalMap();
  disposables.push(knit);

  const Fabric = o.lite ? THREE.MeshStandardMaterial : THREE.MeshPhysicalMaterial;
  const fabricParams: THREE.MeshPhysicalMaterialParameters = {
    color: new THREE.Color(o.color),
    roughness: 0.9,
    metalness: 0,
    vertexColors: true,
    normalMap: knit,
    normalScale: new THREE.Vector2(0.14, 0.14),
  };
  if (!o.lite) Object.assign(fabricParams, { sheen: 0.55, sheenRoughness: 0.5, sheenColor: new THREE.Color("#3e3b4a") });
  const fabric = addScan(new Fabric(fabricParams), o.scan, "fabric");
  const fabric2 = addScan(new Fabric({ ...fabricParams, side: THREE.DoubleSide }), o.scan, "fabric2");
  const metal = addScan(new THREE.MeshStandardMaterial({ color: "#8d8996", metalness: 1, roughness: 0.42 }), o.scan, "metal");
  const inside = addScan(new THREE.MeshStandardMaterial({ color: "#070609", roughness: 1 }), o.scan, "inside");
  disposables.push(fabric, fabric2, metal, inside);

  const add = (g: THREE.BufferGeometry, m: THREE.Material, sample = true) => {
    const mesh = new THREE.Mesh(g, m);
    group.add(mesh);
    disposables.push(g);
    if (sample) surfaces.push(mesh);
    return mesh;
  };

  /* ---- corps ---- */
  const U = o.lite ? 120 : 180;
  const V = o.lite ? 90 : 140;
  // poche kangourou coupée en deux par la fermeture (comme le modèle de la marque) :
  // couture du haut, ouverture arrondie pour la main, puis bord jusqu'à la bande du bas
  const POCKET: [number, number][] = [[0, -0.27], [0.2, -0.27], [0.248, -0.285], [0.29, -0.36], [0.33, -0.47], [0.366, -0.58], [0.393, -0.68], [0.385, -0.77], [0.365, -0.85]];
  const pocketLine: [number, number][] = [];
  for (let k = 0; k < POCKET.length - 1; k++) {
    for (let q = 0; q < 6; q++) {
      const t = q / 6;
      const a = POCKET[Math.max(0, k - 1)], b = POCKET[k], c = POCKET[k + 1], d = POCKET[Math.min(POCKET.length - 1, k + 2)];
      const cr = (i: 0 | 1) => 0.5 * (2 * b[i] + (-a[i] + c[i]) * t + (2 * a[i] - 5 * b[i] + 4 * c[i] - d[i]) * t * t + (-a[i] + 3 * b[i] - 3 * c[i] + d[i]) * t * t * t);
      pocketLine.push([cr(0), cr(1)]);
    }
  }
  pocketLine.push(POCKET[POCKET.length - 1]);
  const pocket = (x: number, y: number) => {
    if (y > -0.2 || y < -0.9) return { seam: 0, inside: 0 };
    const px = Math.abs(x);
    let best = 1e9;
    for (let k = 0; k < pocketLine.length - 1; k++) {
      const [ax, ay] = pocketLine[k];
      const [bx, by] = pocketLine[k + 1];
      const t = Math.min(1, Math.max(0, ((px - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2 || 1)));
      const dx = px - (ax + t * (bx - ax));
      const dy = y - (ay + t * (by - ay));
      best = Math.min(best, dx * dx + dy * dy);
    }
    // largeur de la poche à cette hauteur (pour savoir si on est sur le rabat)
    let edge = 0;
    for (let k = 0; k < pocketLine.length - 1; k++) {
      const [ax, ay] = pocketLine[k];
      const [bx, by] = pocketLine[k + 1];
      if ((y <= ay && y >= by) || (y >= ay && y <= by)) edge = Math.max(edge, ax + ((y - ay) / (by - ay || 1)) * (bx - ax));
    }
    const inside = y < -0.27 ? smooth(edge + 0.01, edge - 0.02, px) : 0;
    return { seam: Math.exp(-best / (0.011 * 0.011)), inside };
  };
  const body = gridGeometry(U, V, true, (i, j) => {
    const u = (i / U) * Math.PI * 2;
    const y0 = Y_BOT + (Y_TOP - Y_BOT) * (j / V);
    const s = Math.sin(u);
    const front = Math.max(0, s);
    // encolure plus basse devant (ouverture de la fermeture)
    const y = y0 - 0.135 * smooth(0.6, 0.8, y0) * Math.pow(front, 3);
    let { x, z } = ring(y0, u);
    const t = (y0 - Y_BOT) / (Y_TOP - Y_BOT);
    // plis : grands plis souples + plis des aisselles
    let n = 0.009 * Math.sin(6 * u + 1.3 + 2 * y0) * (0.35 + 0.65 * (1 - t)) + 0.006 * Math.sin(11 * u - 3 * y0);
    const armpit = Math.exp(-Math.pow((Math.abs(x) - 0.5 + (y0 - 0.32) * 0.6) / 0.05, 2)) * smooth(0.0, 0.3, y0) * (1 - smooth(0.42, 0.55, y0));
    n -= 0.016 * armpit;
    let pk = { seam: 0, inside: 0 };
    if (front > 0.3) {
      pk = pocket(x, y);
      n += 0.004 * pk.inside - 0.01 * pk.seam; // la poche est un peu en relief, couture creusée
      n -= 0.006 * Math.exp(-Math.pow(x / 0.014, 2)); // creux de la fermeture
    }
    n -= 0.012 * smooth(-0.74, -0.86, y0); // le bas resserré par la bande côtelée
    const len = Math.hypot(x, z) || 1;
    x += (x / len) * n;
    z += (z / len) * n;
    // ombrage d'occlusion : côtés sous les bras, sous le col, bas
    let ao = 1;
    ao *= 1 - 0.32 * smooth(0.72, 1, Math.abs(Math.cos(u))) * smooth(-0.7, 0.2, y0) * (1 - smooth(0.5, 0.62, y0));
    ao *= 1 - 0.28 * smooth(0.64, 0.8, y0);
    ao *= 1 - 0.25 * armpit;
    ao *= 1 - 0.3 * pk.seam;
    if (s < 0) {
      // ombre de la capuche sur le dos
      const ax = Math.abs(x);
      const inside = ax < HOOD.half && y0 > hoodBottom(x) - 0.06 && y0 < hoodTop(x);
      if (inside) ao *= 0.72;
    }
    return { p: new THREE.Vector3(x, y, z), ao };
  }, true);
  const bodyMesh = add(body, fabric);

  /* ---- bande côtelée du bas ---- */
  const HU = o.lite ? 480 : 720;
  const hem = gridGeometry(HU, 10, true, (i, j) => {
    const u = (i / HU) * Math.PI * 2;
    const y = -1.0 + 0.145 * (j / 10);
    const w = 0.585 + 0.01 * (j / 10);
    const d = 0.288 + 0.008 * (j / 10);
    let { x, z } = ring(-0.86, u, w, d);
    const rib = 0.0042 * Math.cos(u * 170);
    const len = Math.hypot(x, z) || 1;
    x += (x / len) * rib;
    z += (z / len) * rib;
    return { p: new THREE.Vector3(x, y, z), ao: 0.78 + 0.12 * (j / 10) };
  }, true);
  add(hem, fabric);
  // fond du vêtement (intérieur sombre, vu par le bas)
  const bottomCap = new THREE.CircleGeometry(1, 48);
  bottomCap.rotateX(Math.PI / 2);
  bottomCap.scale(0.58, 1, 0.285);
  bottomCap.translate(0, -0.995, 0);
  add(bottomCap, inside, false);

  /* ---- manches + poignets ---- */
  for (const side of [-1, 1]) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.47 * side, 0.47, -0.01),
      new THREE.Vector3(0.665 * side, 0.39, 0.0),
      new THREE.Vector3(0.795 * side, 0.1, 0.03),
      new THREE.Vector3(0.83 * side, -0.26, 0.06),
      new THREE.Vector3(0.815 * side, -0.6, 0.08),
    ]);
    const SA = o.lite ? 70 : 110;
    const SR = o.lite ? 36 : 54;
    const Z = new THREE.Vector3(0, 0, 1);
    const frame = (t: number) => {
      const c = curve.getPointAt(t);
      const T = curve.getTangentAt(t);
      const B = Z.clone().sub(T.clone().multiplyScalar(T.dot(Z))).normalize();
      const N = new THREE.Vector3().crossVectors(B, T).normalize();
      return { c, T, B, N };
    };
    const sleeve = gridGeometry(SR, SA, true, (i, j) => {
      const t = j / SA;
      const th = (i / SR) * Math.PI * 2;
      const { c, B, N } = frame(t);
      const r0 = spline([[0, 0.165], [0.2, 0.162], [0.6, 0.152], [1, 0.143]], t);
      const elbow = 0.007 * Math.sin(t * 22 + th) * Math.exp(-Math.pow((t - 0.55) / 0.16, 2)) + 0.005 * Math.sin(3 * th + t * 4);
      const gather = 0.007 * Math.sin(th * 5 + 1) * smooth(0.78, 1, t);
      const r = r0 + elbow + gather;
      const cx = Math.cos(th);
      const p = c.clone().addScaledVector(N, r * cx).addScaledVector(B, r * 0.88 * Math.sin(th));
      // côté intérieur (vers le corps) plus sombre
      const inner = -side * cx * Math.sign(N.x || 1);
      let ao = 1 - 0.3 * smooth(0, 1, inner);
      ao *= 1 - 0.25 * (1 - smooth(0.05, 0.3, t));
      return { p, ao };
    });
    add(sleeve, fabric);
    // poignet côtelé
    const end = frame(1);
    const CU = o.lite ? 200 : 300;
    const cuff = gridGeometry(CU, 8, true, (i, j) => {
      const th = (i / CU) * Math.PI * 2;
      const k = j / 8;
      const r = 0.142 - 0.01 * k + 0.0038 * Math.cos(th * 56);
      const c = end.c.clone().addScaledVector(end.T, 0.17 * k);
      return { p: c.addScaledVector(end.N, r * Math.cos(th)).addScaledVector(end.B, r * 0.88 * Math.sin(th)), ao: 0.8 + 0.1 * k };
    });
    add(cuff, fabric);
    const hole = new THREE.CircleGeometry(1, 32);
    const m = new THREE.Matrix4().makeBasis(end.N, end.B, end.T);
    hole.scale(0.128, 0.128 * 0.88, 1);
    hole.applyMatrix4(m);
    hole.translate(end.c.x + end.T.x * 0.168, end.c.y + end.T.y * 0.168, end.c.z + end.T.z * 0.168);
    add(hole, inside, false);
  }

  /* ---- capuche posée dans le dos ---- */
  const HA = o.lite ? 40 : 60;
  const HB = o.lite ? 40 : 60;
  const hood = gridGeometry(HA, HB, false, (i, j) => {
    const a = i / HA;
    const b = j / HB;
    const x = (2 * a - 1) * HOOD.half;
    const y = hoodTop(x) + (hoodBottom(x) - hoodTop(x)) * b;
    const mid = 1 - Math.pow(2 * a - 1, 2);
    let thick = 0.028 + 0.075 * mid * Math.pow(Math.sin(Math.PI * Math.min(1, b * 1.15)), 0.6) + 0.06 * Math.pow(1 - b, 2);
    thick -= 0.006 * Math.exp(-Math.pow((a - 0.5) / 0.012, 2)); // couture centrale
    const z = backZ(x, Math.min(0.79, y)) - thick;
    let ao = 1 - 0.18 * b;
    ao *= 1 - 0.25 * Math.pow(Math.abs(2 * a - 1), 3);
    return { p: new THREE.Vector3(x, y, z), ao };
  });
  add(hood, fabric2);
  // bord roulé de la capuche (côtés + pointe)
  const edgePts: THREE.Vector3[] = [];
  for (let k = 0; k <= 40; k++) {
    const a = k / 40;
    const x = (2 * a - 1) * HOOD.half * 0.995;
    const y = hoodBottom(x);
    edgePts.push(new THREE.Vector3(x, y, backZ(x, Math.min(0.79, y)) - 0.03));
  }
  const edge = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(edgePts), 120, 0.016, 10, false);
  add(edge, fabric);

  /* ---- fourrure : col (devant) et bord de la capuche (dos) ---- */
  const collarPts: THREE.Vector3[] = [];
  for (let k = 0; k < 64; k++) {
    const f = (k / 64) * Math.PI * 2;
    const s = Math.sin(f);
    collarPts.push(new THREE.Vector3(0.262 * Math.cos(f), 0.81 - 0.142 * Math.pow(Math.max(0, s), 2.2), 0.195 * s - 0.01));
  }
  const collarCurve = new THREE.CatmullRomCurve3(collarPts, true);
  const rimPts: THREE.Vector3[] = [];
  for (let k = 0; k <= 30; k++) {
    const x = (k / 30 - 0.5) * 2 * HOOD.half * 1.02;
    rimPts.push(new THREE.Vector3(x, hoodTop(x) + 0.015, backZ(x, 0.78) - 0.075 - 0.03 * (1 - Math.pow(x / HOOD.half, 2))));
  }
  const rimCurve = new THREE.CatmullRomCurve3(rimPts);
  const furTubes: [THREE.Curve<THREE.Vector3>, number, boolean][] = [
    [collarCurve, 0.068, true],
    [rimCurve, 0.05, false],
  ];
  const mask = furMask();
  disposables.push(mask);
  const shells = o.lite ? 6 : 10;
  for (const [curve, radius, closed] of furTubes) {
    const base = new THREE.TubeGeometry(curve, closed ? 160 : 90, radius, 18, closed);
    const baseMat = addScan(new THREE.MeshStandardMaterial({ color: new THREE.Color(o.fur).multiplyScalar(0.62), roughness: 1 }), o.scan, "furbase");
    disposables.push(baseMat);
    add(base, baseMat);
    for (let k = 1; k <= shells; k++) {
      const f = k / shells;
      const g = base.clone();
      const p = g.getAttribute("position");
      const nrm = g.getAttribute("normal");
      for (let v = 0; v < p.count; v++) {
        p.setXYZ(v, p.getX(v) + nrm.getX(v) * 0.042 * f, p.getY(v) + nrm.getY(v) * 0.042 * f, p.getZ(v) + nrm.getZ(v) * 0.042 * f);
      }
      const uv = g.getAttribute("uv");
      for (let v = 0; v < uv.count; v++) uv.setXY(v, uv.getX(v) * (closed ? 26 : 16), uv.getY(v) * 3);
      const c = new THREE.Color(o.fur).multiplyScalar(0.62 + 0.38 * f);
      const mat = addScan(
        new THREE.MeshStandardMaterial({ color: c, roughness: 1, alphaMap: mask, alphaTest: 0.25 + 0.7 * f, side: THREE.DoubleSide }),
        o.scan,
        `fur${k}`
      );
      disposables.push(mat);
      add(g, mat, k === shells);
    }
  }
  // creux du cou
  const neck = new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  neck.rotateX(Math.PI);
  neck.scale(0.215, 0.16, 0.16);
  neck.translate(0, 0.79, -0.01);
  add(neck, inside, false);

  /* ---- fermeture éclair + curseur ---- */
  const ZN = 420;
  const zipPos: number[] = [];
  const zipIdx: number[] = [];
  for (let k = 0; k <= ZN; k++) {
    const y = -0.995 + (0.66 + 0.995) * (k / ZN);
    const d = y < -0.86 ? 0.296 : spline(D_KEYS, y);
    const tooth = (k % 2) * 0.0024;
    const z = d + 0.0035 + tooth;
    zipPos.push(-0.016, y, z, 0.016, y, z, -0.016, y, z - 0.006, 0.016, y, z - 0.006);
    if (k < ZN) {
      const a = k * 4;
      zipIdx.push(a, a + 1, a + 4, a + 1, a + 5, a + 4); // dessus
      zipIdx.push(a + 2, a, a + 6, a, a + 4, a + 6); // côté gauche
      zipIdx.push(a + 1, a + 3, a + 5, a + 3, a + 7, a + 5); // côté droit
    }
  }
  const zip = new THREE.BufferGeometry();
  zip.setAttribute("position", new THREE.Float32BufferAttribute(zipPos, 3));
  zip.setIndex(zipIdx);
  zip.computeVertexNormals();
  add(zip, metal);
  const slider = new THREE.BoxGeometry(0.036, 0.05, 0.014);
  slider.translate(0, 0.6, spline(D_KEYS, 0.6) + 0.012);
  add(slider, metal);
  const tab = new THREE.BoxGeometry(0.024, 0.075, 0.007);
  tab.translate(0, 0.54, spline(D_KEYS, 0.54) + 0.02);
  add(tab, metal);

  /* ---- motifs de la marque, imprimés sur le tissu (décalcomanies qui épousent les plis) ---- */
  const prints: THREE.Mesh[] = [];
  const bpos = body.getAttribute("position") as THREE.BufferAttribute;
  const bidx = body.getIndex()!;
  const place = (img: HTMLImageElement | undefined, x: number, y: number, w: number, back: boolean) => {
    if (!img || !img.naturalWidth) return;
    const h = (w * img.naturalHeight) / img.naturalWidth;
    // seulement les triangles du corps sous le motif (bien plus rapide que tout le corps)
    const keep: number[] = [];
    for (let t = 0; t < bidx.count; t += 3) {
      for (let k = 0; k < 3; k++) {
        const v = bidx.getX(t + k);
        const vz = bpos.getZ(v);
        if (Math.abs(bpos.getX(v) - x) < w / 2 + 0.04 && Math.abs(bpos.getY(v) - y) < h / 2 + 0.04 && (back ? vz < 0 : vz > 0)) {
          keep.push(bidx.getX(t), bidx.getX(t + 1), bidx.getX(t + 2));
          break;
        }
      }
    }
    const part = new THREE.BufferGeometry();
    part.setAttribute("position", bpos);
    part.setAttribute("normal", body.getAttribute("normal"));
    part.setIndex(keep);
    const z = back ? backZ(x, y) : -backZ(x, y);
    const geo = new DecalGeometry(new THREE.Mesh(part), new THREE.Vector3(x, y, z), new THREE.Euler(0, back ? Math.PI : 0, 0), new THREE.Vector3(w, h, 0.3));
    const tex = new THREE.Texture(img);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    // encre sérigraphiée : mate, un peu moins blanche qu'un blanc pur pour garder le grain du tissu
    const mat = addScan(
      new THREE.MeshStandardMaterial({ map: tex, color: "#d9d6db", transparent: true, alphaTest: 0.02, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, roughness: 0.78, metalness: 0, normalMap: knit, normalScale: new THREE.Vector2(0.1, 0.1) }),
      o.scan,
      "print"
    );
    const m = new THREE.Mesh(geo, mat);
    m.renderOrder = 1;
    m.userData.print = img;
    m.userData.back = back;
    group.add(m);
    prints.push(m);
    disposables.push(geo, tex, mat);
  };
  // emplacements comme sur le modèle de la marque
  place(o.prints?.chest, 0, 0.31, 0.95, false); // « BILLIONSHACK » sur la poitrine
  place(o.prints?.pocket, -0.175, -0.635, 0.26, false); // « Rare authentic limited edition » sur la poche
  place(o.prints?.back, 0, -0.2, 1.06, true); // le smiley « BS » en grand dans le dos
  place(o.prints?.sign, 0.36, -0.765, 0.28, true); // la signature en bas du dos

  return {
    group,
    surfaces,
    prints,
    dispose() {
      disposables.forEach((d) => d.dispose());
    },
  };
}
