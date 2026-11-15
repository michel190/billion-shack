/**
 * Scène 3D du héros (three.js) :
 *  - le sweat 3D aux motifs de la marque (tourne avec la souris, puis se retourne pour montrer le dos) ;
 *  - un scanner de bas en haut le transforme en nuage de particules (contours brillants,
 *    le smiley du dos reste dessiné en particules) ;
 *  - les particules coulent en nappe horizontale puis remontent écrire « BILLION SHACK » en 3D,
 *    une traînée « comète » dessine le logo au-dessus ;
 *  - un balayage gauche → droite change le texte de particules en texte chromé.
 * Tout dépend de la progression du défilement `p` (étapes dans lib/hero.ts).
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { PH, seg } from "@/lib/hero";
import { buildHoodie, type Hoodie, type HoodiePrints, type ScanUniforms } from "./hoodie3d";
import { GLYPHS } from "./glyphs";
import { CAM_Z, FOV, hoodieLayout } from "./layout";

export interface HeroSceneOptions {
  lite: boolean; // téléphones : moins de détails, moins de particules
  fabric: string;
  fur: string;
  logoDark: string; // logo pour fond sombre (texte blanc)
  logoLight: string; // logo pour fond clair
  prints?: PrintPaths; // motifs imprimés sur le sweat
}

/** Chemins des images des motifs (voir STORE.hero3d.prints). */
export type PrintPaths = Partial<Record<keyof HoodiePrints, string>>;

/** Charge les motifs ; un motif introuvable est simplement ignoré. */
export async function loadPrints(paths?: PrintPaths): Promise<HoodiePrints> {
  const out: HoodiePrints = {};
  if (!paths) return out;
  await Promise.all(
    (Object.keys(paths) as (keyof HoodiePrints)[]).map(async (k) => {
      const src = paths[k];
      if (src) out[k] = await loadImage(src).catch(() => undefined);
    })
  );
  return out;
}

const FLOATS = 17;
const ss = (t: number) => t * t * (3 - 2 * t);

const VERT = /* glsl */ `
attribute vec3 aHood; attribute vec3 aHoodN; attribute vec3 aText; attribute vec3 aTextN; attribute vec4 aRand; attribute float aKind;
uniform mat4 uHood;
uniform float uScan, uFlow, uRise, uWipe, uFade, uLogo, uTime, uPx, uSize, uDiskY, uTextBottom, uTextH;
uniform vec3 uComet;
varying float vA; varying vec3 vC;
float sat(float x){ return clamp(x, 0.0, 1.0); }
float sm(float t){ return t * t * (3.0 - 2.0 * t); }
void main(){
  float kind = mod(aKind, 2.0); // 1 = logo (comète), 0 = lettres
  float pr = step(1.5, aKind); // point pris sur un motif imprimé du dos
  vec3 hw = (uHood * vec4(aHood, 1.0)).xyz;
  vec3 hn = normalize(mat3(uHood) * aHoodN);
  float facing = dot(hn, normalize(cameraPosition - hw));
  float rimH = pow(1.0 - abs(facing), 1.6);
  float below = smoothstep(uScan + 0.015, uScan - 0.05, hw.y);
  float line = exp(-pow((hw.y - uScan) / 0.035, 2.0)) * step(hw.y, uScan + 0.03);

  // nappe horizontale
  float f = sm(sat((uFlow - aRand.x * 0.35) / 0.65));
  float ang = atan(hw.z, hw.x) + f * (1.4 + aRand.y * 2.2);
  float R = length(hw.xz) * (1.0 + 2.6 * aRand.z) + 0.15 + aRand.w * 0.5;
  vec3 disk = vec3(cos(ang) * R, uDiskY + (aRand.w - 0.5) * 0.06, sin(ang) * R * 0.45);
  disk.y -= disk.z * 0.28;
  vec3 p = mix(hw, disk, f);

  // montée vers les lettres : le bas d'abord ; la comète (logo) arrive plus tard, en arc
  float lag = kind > 0.5 ? 0.3 + aRand.y * 0.34 : sat((aText.y - uTextBottom) / uTextH) * 0.38 + aRand.y * 0.16;
  float r = sm(sat((uRise - lag) / (kind > 0.5 ? 0.3 : 0.42)));
  float hide = 1.0;
  if (kind > 0.5) {
    vec3 c = uComet + vec3(aRand.z - 0.5, aRand.w - 0.5, 0.0) * 0.12;
    vec3 away = mix(hw, c, f);
    hide = r > 0.0 ? 1.0 : 1.0 - f;
    vec3 ctrl = mix(c, aText, 0.5) + vec3(0.35, 0.25, 0.0);
    p = r > 0.0 ? mix(mix(c, ctrl, r), mix(ctrl, aText, r), r) : away;
  } else {
    p = mix(p, aText, r);
    p.y += sin(3.14159 * r) * 0.22 * (aRand.z - 0.3);
  }
  float fly = sin(3.14159 * f) * (1.0 - r) + sin(3.14159 * r);
  p += vec3(sin(uTime * 1.3 + aRand.x * 40.0), cos(uTime * 1.1 + aRand.y * 40.0), sin(uTime * 0.9 + aRand.z * 40.0)) * 0.025 * fly;
  p += vec3(sin(uTime * 2.0 + aRand.z * 30.0), cos(uTime * 1.7 + aRand.x * 30.0), 0.0) * 0.003;

  // luminosité : contours du sweat, puis contours des lettres
  float rimT = pow(1.0 - abs(dot(normalize(aTextN), normalize(cameraPosition - aText))), 1.4);
  // le motif du dos reste lisible dans le nuage (points plus brillants, côté visible seulement)
  float bCloud = (0.24 + 1.6 * rimH + 1.25 * pr * smoothstep(0.05, 0.45, facing) * (1.0 - 0.6 * f)) * below + 2.4 * line;
  float b = mix(bCloud, kind > 0.5 ? 1.3 : 0.5 + 1.1 * rimT, r);
  // balayage vers le chrome (les lettres déjà balayées n'ont plus de particules)
  float todo = smoothstep(uWipe - 0.06, uWipe + 0.06, aText.x);
  b *= kind > 0.5 ? mix(1.0, 1.0 - uLogo, r) : mix(1.0, todo, smoothstep(0.85, 1.0, r));
  vA = b * max(below, f) * hide * uFade * (0.75 + 0.25 * sin(uTime * 2.6 + aRand.y * 60.0));
  vec4 mv = viewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.55 + aRand.w * 0.9 + 0.5 * fly) * uPx / -mv.z;
  vC = aRand.y < 0.05 ? vec3(1.0, 0.36, 0.08) : (aRand.y > 0.965 ? vec3(1.0, 0.82, 0.62) : vec3(1.0));
}`;

const FRAG = /* glsl */ `
varying float vA; varying vec3 vC;
void main(){
  float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5)) * vA;
  if (a < 0.004) discard;
  gl_FragColor = vec4(vC, a);
}`;

/** Lit les contours d'un mot (format « M x y L x y Q cx cy x y Z », y vers le haut). */
function wordShapes(d: string): THREE.Shape[] {
  const path = new THREE.ShapePath();
  const tok = d.match(/[MLQCZ]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
  let i = 0;
  const n = () => parseFloat(tok[i++]);
  while (i < tok.length) {
    const c = tok[i++];
    if (c === "M") path.moveTo(n(), n());
    else if (c === "L") path.lineTo(n(), n());
    else if (c === "Q") path.quadraticCurveTo(n(), n(), n(), n());
    else if (c === "C") path.bezierCurveTo(n(), n(), n(), n(), n(), n());
  }
  return path.toShapes();
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = src;
  await img.decode();
  return img;
}

export class HeroScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 60);
  private hoodie!: Hoodie; // construit dans init(), une fois les motifs chargés
  private hoodieRoot = new THREE.Group();
  private scan: ScanUniforms = { uScan: { value: -100 }, uGlow: { value: 0 } };
  private rimL = new THREE.DirectionalLight("#ff9a5a", 0);
  private rimR = new THREE.DirectionalLight("#ff5b14", 0);
  private textGroup = new THREE.Group();
  private chromeMat: THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial;
  private wipePlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), -100);
  private hot = { uWipeX: { value: -100 }, uHot: { value: 0 } };
  private logoDark?: THREE.Mesh;
  private logoLight?: THREE.Mesh;
  private logoImg?: HTMLImageElement;
  private points?: THREE.Points;
  private pmat: THREE.ShaderMaterial;
  private textBox = { left: 0, right: 0, bottom: 0, top: 0, cap: 0 };
  private w = 1;
  private h = 1;
  private dpr = 1;
  private visH = 1;
  private visW = 1;
  private pointer = new THREE.Vector2();
  private yaw = 0;
  private pitch = 0;
  private disposables: { dispose(): void }[] = [];

  constructor(canvas: HTMLCanvasElement, private o: HeroSceneOptions) {
    const r = new THREE.WebGLRenderer({ canvas, antialias: !o.lite, alpha: true, powerPreference: "high-performance" });
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.0;
    r.localClippingEnabled = true;
    r.setClearColor(0x000000, 0);
    this.renderer = r;

    const pmrem = new THREE.PMREMGenerator(r);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    this.scene.environment = env;
    this.scene.environmentIntensity = 0.55;
    this.disposables.push(env);

    this.camera.position.set(0, 0, CAM_Z);
    const key = new THREE.DirectionalLight("#ffffff", 2.4);
    key.position.set(-3, 4, 5);
    const fill = new THREE.DirectionalLight("#e8eaff", 0.8);
    fill.position.set(4, 1, 3);
    const top = new THREE.DirectionalLight("#ffffff", 0.6);
    top.position.set(0, 6, 0);
    this.rimL.position.set(-4, 2, -4);
    this.rimR.position.set(4, 2, -4);
    this.scene.add(key, fill, top, this.rimL, this.rimR);

    this.scene.add(this.hoodieRoot);

    // texte chromé (apparaît derrière le balayage) + reflet « chaud » sur le front du balayage
    const Mat = o.lite ? THREE.MeshStandardMaterial : THREE.MeshPhysicalMaterial;
    const studio = this.studioEnv(r);
    this.disposables.push(studio);
    const chromeParams: THREE.MeshPhysicalMaterialParameters = { color: "#ffffff", metalness: 1, roughness: 0.2, envMap: studio, envMapIntensity: 1.15, clippingPlanes: [this.wipePlane] };
    if (!o.lite) Object.assign(chromeParams, { clearcoat: 0.8, clearcoatRoughness: 0.1 });
    this.chromeMat = new Mat(chromeParams);
    this.chromeMat.onBeforeCompile = (sh) => {
      sh.uniforms.uWipeX = this.hot.uWipeX;
      sh.uniforms.uHot = this.hot.uHot;
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vW;")
        .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvW = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vW;\nuniform float uWipeX;\nuniform float uHot;")
        .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(1.0) * uHot * smoothstep(0.55, 0.0, uWipeX - vW.x) * 1.6;");
    };
    this.disposables.push(this.chromeMat);
    this.scene.add(this.textGroup);

    this.pmat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uHood: { value: new THREE.Matrix4() },
        uScan: this.scan.uScan,
        uFlow: { value: 0 },
        uRise: { value: 0 },
        uWipe: { value: -100 },
        uFade: { value: 0 },
        uLogo: { value: 0 },
        uTime: { value: 0 },
        uPx: { value: 1 },
        uSize: { value: 0.02 },
        uDiskY: { value: 0 },
        uTextBottom: { value: 0 },
        uTextH: { value: 1 },
        uComet: { value: new THREE.Vector3() },
      },
    });
    this.disposables.push(this.pmat);
  }

  /** Reflets du chrome : grand ciel clair, ligne d'horizon sombre, sol gris, deux boîtes à lumière. */
  private studioEnv(r: THREE.WebGLRenderer) {
    const sc = new THREE.Scene();
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(10, 48, 24),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        vertexShader: "varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader:
          "varying vec3 vD; void main(){ float y = vD.y; vec3 top = vec3(0.95, 0.95, 0.98); vec3 hor = vec3(0.07, 0.07, 0.1); vec3 gnd = vec3(0.42, 0.41, 0.46);" +
          " vec3 c = y > 0.0 ? mix(hor, top, smoothstep(0.0, 0.32, y)) : mix(hor, gnd, smoothstep(0.0, -0.4, y));" +
          " c += vec3(0.5) * smoothstep(0.55, 0.95, vD.z) * smoothstep(-0.25, 0.25, y); gl_FragColor = vec4(c, 1.0); }",
      })
    );
    sc.add(sky);
    for (const x of [-4, 4]) {
      const box = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 5), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 3, 3), side: THREE.DoubleSide }));
      box.position.set(x, 3, 5);
      box.lookAt(0, 0, 0);
      sc.add(box);
    }
    const pm = new THREE.PMREMGenerator(r);
    const tex = pm.fromScene(sc, 0.02).texture;
    pm.dispose();
    sc.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      (m.material as THREE.Material | undefined)?.dispose();
    });
    return tex;
  }

  /** Charge le logo et les motifs, construit le sweat, puis place le texte et les particules. */
  async init(w: number, h: number, dpr: number) {
    const [logoImg, lightImg, prints] = await Promise.all([loadImage(this.o.logoDark), loadImage(this.o.logoLight), loadPrints(this.o.prints)]);
    this.logoImg = logoImg;
    this.hoodie = buildHoodie({ color: this.o.fabric, fur: this.o.fur, lite: this.o.lite, scan: this.scan, prints });
    this.hoodieRoot.add(this.hoodie.group);
    const mk = (img: HTMLImageElement) => {
      const t = new THREE.Texture(img);
      t.colorSpace = THREE.SRGBColorSpace;
      t.needsUpdate = true;
      const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false, opacity: 0 });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m);
      this.disposables.push(t, m, mesh.geometry);
      this.scene.add(mesh);
      return mesh;
    };
    this.logoDark = mk(this.logoImg);
    this.logoLight = mk(lightImg);
    this.setSize(w, h, dpr);
  }

  setSize(w: number, h: number, dpr: number) {
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    // sweat : ~60 % de la hauteur (ordinateur), limité par la largeur (téléphone) — voir layout.ts
    const L = hoodieLayout(w, h);
    this.visH = L.visH;
    this.visW = L.visW;
    const portrait = L.portrait;
    this.hoodie.group.scale.setScalar(L.s);
    this.hoodieRoot.position.set(0, L.y, 0);
    this.pmat.uniforms.uPx.value = (h * dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)));
    this.pmat.uniforms.uSize.value = portrait ? 0.022 : 0.02;
    this.buildText(portrait);
    this.buildParticles();
  }

  private buildText(portrait: boolean) {
    this.textGroup.children.slice().forEach((c) => {
      this.textGroup.remove(c);
      (c as THREE.Mesh).geometry?.dispose();
    });
    const words = Object.keys(GLYPHS.words) as (keyof typeof GLYPHS.words)[];
    const widths = words.map((k) => GLYPHS.words[k].w);
    const lineW = portrait ? Math.max(...widths) : widths.reduce((a, b) => a + b, 0) + GLYPHS.space;
    const k = ((portrait ? 0.86 : 0.84) * this.visW) / lineW;
    const cap = GLYPHS.cap * k;
    const depth = 0.32 * GLYPHS.cap;
    const gap = 1.28 * cap;
    const centerY = (portrait ? -0.02 : -0.04) * this.visH;
    let x = -lineW / 2;
    words.forEach((word, i) => {
      const geo = new THREE.ExtrudeGeometry(wordShapes(GLYPHS.words[word].d), {
        depth,
        bevelEnabled: true,
        bevelThickness: 0.05 * GLYPHS.cap,
        bevelSize: 0.03 * GLYPHS.cap,
        bevelSegments: this.o.lite ? 2 : 4,
        curveSegments: this.o.lite ? 5 : 9,
      });
      geo.translate(0, 0, -depth / 2);
      geo.scale(k, k, k);
      const mesh = new THREE.Mesh(geo, this.chromeMat);
      if (portrait) {
        mesh.position.set((-widths[i] / 2) * k, centerY + (i === 0 ? gap / 2 : -gap / 2) - cap / 2, 0);
      } else {
        mesh.position.set(x * k, centerY - cap / 2, 0);
        x += widths[i] + GLYPHS.space;
      }
      this.textGroup.add(mesh);
    });
    this.textGroup.rotation.set(0.16, 0, 0);
    this.textGroup.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(this.textGroup);
    this.textBox = { left: box.min.x, right: box.max.x, bottom: box.min.y, top: box.max.y, cap };
    // logo au-dessus du texte
    const lh = Math.min(1.25 * cap, 0.11 * this.visH);
    const ratio = this.logoImg ? this.logoImg.naturalWidth / this.logoImg.naturalHeight : 0.87;
    for (const m of [this.logoDark, this.logoLight]) {
      if (!m) continue;
      m.scale.set(lh * ratio, lh, 1);
      m.position.set(0, box.max.y + 0.35 * cap + lh / 2, 0.05);
    }
  }

  private buildParticles() {
    if (this.points) {
      this.scene.remove(this.points);
      this.points.geometry.dispose();
    }
    const N = this.o.lite ? 12000 : 26000;
    const NL = this.logoImg ? Math.round(N * 0.07) : 0;
    const backPrints = this.hoodie.prints.filter((m) => m.userData.back);
    const NP = backPrints.length ? Math.round(N * 0.13) : 0;
    const data = new Float32Array(N * FLOATS);
    const pos = new THREE.Vector3();
    const nor = new THREE.Vector3();

    // points sur le sweat (repère du sweat), pondérés par la surface de chaque pièce
    const g = this.hoodie.group;
    const saved = g.scale.x;
    g.scale.setScalar(1);
    g.updateMatrixWorld(true);
    const parts = this.hoodie.surfaces.map((m) => {
      const geo = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
      geo.applyMatrix4(m.matrix);
      let area = 0;
      const p = geo.getAttribute("position");
      const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
      for (let i = 0; i < p.count; i += 3) {
        a.fromBufferAttribute(p, i);
        b.fromBufferAttribute(p, i + 1);
        c.fromBufferAttribute(p, i + 2);
        area += b.sub(a).cross(c.sub(a)).length() / 2;
      }
      const sampler = new MeshSurfaceSampler(new THREE.Mesh(geo)).build();
      return { sampler, area, geo };
    });
    g.scale.setScalar(saved);
    const total = parts.reduce((s, q) => s + q.area, 0);
    const pickPart = () => {
      let r = Math.random() * total;
      for (const q of parts) {
        if ((r -= q.area) <= 0) return q;
      }
      return parts[parts.length - 1];
    };
    const hood: number[] = [];
    for (let i = 0; i < N - NP; i++) {
      pickPart().sampler.sample(pos, nor);
      hood.push(pos.x, pos.y, pos.z, nor.x, nor.y, nor.z, 0);
    }
    parts.forEach((q) => q.geo.dispose());
    if (NP) {
      const uv = new THREE.Vector2();
      const inks = backPrints.map((m) => {
        const img = m.userData.print as HTMLImageElement;
        const cw = 160;
        const chh = Math.max(1, Math.round((cw * img.naturalHeight) / img.naturalWidth));
        const cv = document.createElement("canvas");
        cv.width = cw;
        cv.height = chh;
        const ctx = cv.getContext("2d", { willReadFrequently: true })!;
        ctx.drawImage(img, 0, 0, cw, chh);
        const px = ctx.getImageData(0, 0, cw, chh).data;
        const ink = new Float32Array(cw * chh);
        let sum = 0;
        for (let i = 0; i < cw * chh; i++) {
          ink[i] = (px[i * 4 + 3] / 255) * Math.pow((px[i * 4] + px[i * 4 + 1] + px[i * 4 + 2]) / 765, 1.5);
          sum += ink[i];
        }
        const geo = m.geometry;
        const p = geo.getAttribute("position");
        let area = 0;
        const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
        for (let i = 0; i < p.count; i += 3) {
          a.fromBufferAttribute(p, i);
          b.fromBufferAttribute(p, i + 1);
          c.fromBufferAttribute(p, i + 2);
          area += b.sub(a).cross(c.sub(a)).length() / 2;
        }
        return { sampler: new MeshSurfaceSampler(new THREE.Mesh(geo)).build(), ink, cw, chh, weight: area * (sum / (cw * chh)) };
      });
      const wTotal = inks.reduce((s2, q) => s2 + q.weight, 0) || 1;
      for (let i = 0; i < NP; i++) {
        let r = Math.random() * wTotal;
        const q = inks.find((t) => (r -= t.weight) <= 0) ?? inks[inks.length - 1];
        for (let tries = 0; tries < 60; tries++) {
          q.sampler.sample(pos, nor, undefined, uv);
          const x = Math.min(q.cw - 1, Math.max(0, (uv.x * q.cw) | 0));
          const y = Math.min(q.chh - 1, Math.max(0, ((1 - uv.y) * q.chh) | 0));
          if (Math.random() < q.ink[y * q.cw + x]) break;
        }
        hood.push(pos.x, pos.y, pos.z, nor.x, nor.y, nor.z, 1);
      }
    }

    // points sur les lettres 3D (repère monde)
    const text: number[] = [];
    const tparts = this.textGroup.children.map((m) => {
      const mesh = m as THREE.Mesh;
      const geo = (mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone()).applyMatrix4(mesh.matrixWorld);
      const p = geo.getAttribute("position");
      let area = 0;
      const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
      for (let i = 0; i < p.count; i += 3) {
        a.fromBufferAttribute(p, i);
        b.fromBufferAttribute(p, i + 1);
        c.fromBufferAttribute(p, i + 2);
        area += b.sub(a).cross(c.sub(a)).length() / 2;
      }
      return { sampler: new MeshSurfaceSampler(new THREE.Mesh(geo)).build(), geo, area };
    });
    const tTotal = tparts.reduce((s2, q) => s2 + q.area, 0);
    for (let i = 0; i < N - NL; i++) {
      let r = Math.random() * tTotal;
      const q = tparts.find((t) => (r -= t.area) <= 0) ?? tparts[tparts.length - 1];
      q.sampler.sample(pos, nor);
      text.push(pos.x, pos.y, pos.z, nor.x, nor.y, nor.z, 0);
    }
    tparts.forEach((q) => q.geo.dispose());

    // points du logo (pixels opaques de l'image), placés sur le plan du logo
    if (this.logoImg && this.logoDark) {
      const img = this.logoImg;
      const cw = 120;
      const chh = Math.round((cw * img.naturalHeight) / img.naturalWidth);
      const cv = document.createElement("canvas");
      cv.width = cw;
      cv.height = chh;
      const ctx = cv.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0, cw, chh);
      const px = ctx.getImageData(0, 0, cw, chh).data;
      const opaque: number[] = [];
      for (let i = 0; i < cw * chh; i++) if (px[i * 4 + 3] > 140) opaque.push(i);
      const L = this.logoDark;
      for (let i = 0; i < NL; i++) {
        const k = opaque[(Math.random() * opaque.length) | 0] ?? 0;
        const u = ((k % cw) + Math.random()) / cw - 0.5;
        const v = 0.5 - (((k / cw) | 0) + Math.random()) / chh;
        text.push(L.position.x + u * L.scale.x, L.position.y + v * L.scale.y, L.position.z + (Math.random() - 0.5) * 0.02, 0, 0, 1, 1);
      }
    }

    // départ (sweat) et arrivée (lettres) triés de gauche à droite : trajets plus fluides
    const hi = Array.from({ length: N }, (_, i) => i).sort((a, b) => hood[a * 7] - hood[b * 7]);
    const ti = Array.from({ length: N }, (_, i) => i).sort((a, b) => text[a * 7] - text[b * 7]);
    for (let n = 0; n < N; n++) {
      const a = hi[n] * 7;
      const t = ti[n] * 7;
      const o = n * FLOATS;
      data.set([hood[a], hood[a + 1], hood[a + 2], hood[a + 3], hood[a + 4], hood[a + 5]], o);
      data.set([text[t], text[t + 1], text[t + 2], text[t + 3], text[t + 4], text[t + 5]], o + 6);
      // genre : lettres (0) ou logo (1), + 2 si le point vient d'un motif du dos
      data.set([Math.random(), Math.random(), Math.random(), Math.random(), text[t + 6] + 2 * hood[a + 6]], o + 12);
    }
    const geo = new THREE.BufferGeometry();
    const buf = new THREE.InterleavedBuffer(data, FLOATS);
    geo.setAttribute("aHood", new THREE.InterleavedBufferAttribute(buf, 3, 0));
    geo.setAttribute("aHoodN", new THREE.InterleavedBufferAttribute(buf, 3, 3));
    geo.setAttribute("aText", new THREE.InterleavedBufferAttribute(buf, 3, 6));
    geo.setAttribute("aTextN", new THREE.InterleavedBufferAttribute(buf, 3, 9));
    geo.setAttribute("aRand", new THREE.InterleavedBufferAttribute(buf, 4, 12));
    geo.setAttribute("aKind", new THREE.InterleavedBufferAttribute(buf, 1, 16));
    // « position » factice (three en a besoin pour dessiner)
    geo.setAttribute("position", new THREE.InterleavedBufferAttribute(buf, 3, 6));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);
    this.points = new THREE.Points(geo, this.pmat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 2;
    this.scene.add(this.points);

    const u = this.pmat.uniforms;
    u.uDiskY.value = (this.textBox.bottom + this.textBox.top) / 2;
    u.uTextBottom.value = this.textBox.bottom;
    u.uTextH.value = this.textBox.top - this.textBox.bottom;
    const L = this.logoDark;
    u.uComet.value.set((L?.position.x ?? 0) + 0.32 * this.visW, (L?.position.y ?? 0) + 0.42 * this.visH, 0);
  }

  /** Position de la souris (-1…1), pour faire pivoter un peu le sweat. */
  setPointer(x: number, y: number) {
    this.pointer.set(x, y);
  }

  update(p: number, time: number) {
    const turn = ss(seg(p, PH.turn));
    const panel = seg(p, PH.panel);
    const scanP = seg(p, PH.scan);
    const hold = seg(p, PH.hold);
    const exit = seg(p, PH.exit);
    const wipe = seg(p, PH.wipe);

    // le sweat : suit la souris au début, se retourne, puis continue de tourner doucement
    const idle = (1 - turn) * (0.16 * Math.sin(time * 0.55) + this.pointer.x * 0.35);
    this.yaw += (idle + Math.PI * turn + 0.35 * hold + 0.25 * seg(p, PH.flow) - this.yaw) * 0.12;
    this.pitch += ((1 - turn) * -this.pointer.y * 0.08 - this.pitch) * 0.12;
    this.hoodieRoot.rotation.set(this.pitch, this.yaw, 0);
    this.hoodieRoot.updateMatrixWorld(true);

    // scanner : de sous le bas du sweat jusqu'au-dessus de la capuche
    const box = this.hoodieBounds();
    this.scan.uScan.value = scanP <= 0 ? -100 : box.min - 0.05 + (box.max - box.min + 0.15) * scanP;
    this.scan.uGlow.value = scanP > 0 && scanP < 1 ? 1 : 0;
    this.hoodie.group.visible = scanP < 1;

    // éclairage de contour sur fond sombre
    const dark = panel * (1 - exit);
    this.rimL.intensity = this.rimR.intensity = 3.2 * dark;

    // particules
    const u = this.pmat.uniforms;
    u.uHood.value.copy(this.hoodie.group.matrixWorld);
    u.uFlow.value = seg(p, PH.flow);
    u.uRise.value = seg(p, PH.rise);
    u.uFade.value = scanP > 0 ? 1 : 0;
    u.uLogo.value = seg(p, [PH.rise[1] - 0.02, PH.rise[1] + 0.05]);
    u.uTime.value = time;
    const wx = this.textBox.left - 0.15 + (this.textBox.right - this.textBox.left + 0.3) * wipe;
    u.uWipe.value = wipe > 0 ? wx : -100;
    if (this.points) this.points.visible = scanP > 0 && wipe < 1;

    // texte chromé : visible derrière le front du balayage
    this.wipePlane.constant = wipe > 0 ? wx : -100;
    this.hot.uWipeX.value = wx;
    this.hot.uHot.value = wipe <= 0 ? 0 : wipe < 1 ? 1 : Math.max(0, 1 - (p - PH.wipe[1]) / 0.03);
    this.textGroup.visible = wipe > 0;
    this.textGroup.rotation.y = 0.12 * Math.sin(Math.max(0, p - PH.wipe[1]) * 8);

    // logo : couleur pour fond sombre, puis version pour fond clair quand le fond noir redescend
    const logoIn = seg(p, [PH.rise[1] - 0.02, PH.rise[1] + 0.05]);
    if (this.logoDark && this.logoLight) {
      (this.logoDark.material as THREE.MeshBasicMaterial).opacity = logoIn * (1 - ss(exit));
      (this.logoLight.material as THREE.MeshBasicMaterial).opacity = logoIn * ss(exit);
      this.logoDark.visible = this.logoLight.visible = logoIn > 0;
    }

    this.renderer.render(this.scene, this.camera);
  }

  private bounds = new THREE.Box3();
  private hoodieBounds() {
    this.bounds.setFromObject(this.hoodie.group, false);
    return { min: this.bounds.min.y, max: this.bounds.max.y };
  }

  dispose() {
    this.hoodie?.dispose();
    this.textGroup.children.forEach((c) => (c as THREE.Mesh).geometry?.dispose());
    this.points?.geometry.dispose();
    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}

export async function createHeroScene(canvas: HTMLCanvasElement, o: HeroSceneOptions, w: number, h: number, dpr: number) {
  const s = new HeroScene(canvas, o);
  await s.init(w, h, dpr);
  return s;
}
