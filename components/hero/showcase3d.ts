/**
 * Le sweat 3D (avec les motifs de la marque) qui tourne lentement sur lui-même
 * (section « Plus qu'une boutique, un état d'esprit »).
 * Éclairage chaud façon film : lumière principale douce, contre-jours orange vif et orangé.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { buildHoodie, type Hoodie, type HoodiePrints } from "./hoodie3d";

export interface ShowcaseOptions {
  lite: boolean;
  fabric: string;
  fur: string;
  prints?: Partial<Record<keyof HoodiePrints, string>>;
}

async function loadPrints(paths: ShowcaseOptions["prints"]): Promise<HoodiePrints> {
  const out: HoodiePrints = {};
  await Promise.all(
    (Object.keys(paths ?? {}) as (keyof HoodiePrints)[]).map(async (k) => {
      const src = paths?.[k];
      if (!src) return;
      const img = new Image();
      img.src = src;
      out[k] = await img.decode().then(() => img, () => undefined);
    })
  );
  return out;
}

export class Showcase {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  private hoodie: Hoodie;
  private root = new THREE.Group();
  private env: THREE.Texture;
  private baseY = 0;

  constructor(canvas: HTMLCanvasElement, o: ShowcaseOptions, prints: HoodiePrints) {
    const r = new THREE.WebGLRenderer({ canvas, antialias: !o.lite, alpha: true, powerPreference: "high-performance" });
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.setClearColor(0x000000, 0);
    this.renderer = r;
    const pmrem = new THREE.PMREMGenerator(r);
    this.env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    this.scene.environment = this.env;
    this.scene.environmentIntensity = 0.42;

    const key = new THREE.DirectionalLight("#fff1e6", 2.3);
    key.position.set(-3, 3, 5);
    const fill = new THREE.DirectionalLight("#ffe6d6", 0.5);
    fill.position.set(3, 0, 4);
    const rimL = new THREE.DirectionalLight("#ff5b14", 4.2);
    rimL.position.set(-4, 2, -4);
    const rimR = new THREE.DirectionalLight("#ff9a5a", 3.2);
    rimR.position.set(4, 2, -4);
    this.scene.add(key, fill, rimL, rimR);

    this.hoodie = buildHoodie({ color: o.fabric, fur: o.fur, lite: o.lite, scan: { uScan: { value: -100 }, uGlow: { value: 0 } }, prints });
    this.root.add(this.hoodie.group);
    this.scene.add(this.root);
    this.camera.position.set(0, 0, 8);
  }

  setSize(w: number, h: number, dpr: number) {
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    const visH = 2 * 8 * Math.tan(THREE.MathUtils.degToRad(14));
    const visW = visH * this.camera.aspect;
    const s = Math.min((0.74 * visH) / 1.95, (0.8 * visW) / 2.0);
    this.hoodie.group.scale.setScalar(s);
    this.baseY = -0.02 * visH;
  }

  render(t: number) {
    this.root.rotation.y = t * 0.45;
    this.root.position.y = this.baseY + Math.sin(t * 0.9) * 0.03;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.hoodie.dispose();
    this.env.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}

export async function createShowcase(canvas: HTMLCanvasElement, o: ShowcaseOptions, w: number, h: number, dpr: number) {
  const s = new Showcase(canvas, o, await loadPrints(o.prints));
  s.setSize(w, h, dpr);
  return s;
}
