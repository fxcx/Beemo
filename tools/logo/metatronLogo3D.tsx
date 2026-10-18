"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Logo que evoluciona por todas sus formas hasta formar el Cubo de Metatrón.
 *
 *   Punto → Tetraedro → Cubo → Octaedro → Icosaedro → Dodecaedro → Cubo de Metatrón
 *
 * Un mismo grupo de 20 nodos se reparte entre los vértices de cada forma (los que
 * sobran se funden con otro nodo), y las aristas aparecen y desaparecen entre
 * formas. El Cubo de Metatrón son 13 nodos, 78 líneas y 13 círculos. Al llegar ahí
 * el logo queda de frente, plano, como el símbolo clásico.
 *
 * Es independiente: no importa nada de tu proyecto.
 * Instalar:  npm i three   y   npm i -D @types/three
 */

export const METATRON_STAGES = [
  "Punto",
  "Tetraedro",
  "Cubo",
  "Octaedro",
  "Icosaedro",
  "Dodecaedro",
  "Cubo de Metatrón",
] as const;

export type MetatronLogo3DProps = {
  /** lado en px. Para ver bien las 78 líneas del final conviene 96 o más */
  size?: number;
  /** color de líneas, nodos y círculos (cualquier color CSS) */
  color?: string;
  /** atajo para fondos oscuros: usa un blanco suave si no pasas `color` */
  inverted?: boolean;
  /** velocidad de la secuencia (1 = normal) */
  speed?: number;
  /** true: repite sin parar. false: evoluciona una vez y se queda en el Cubo de Metatrón */
  loop?: boolean;
  /**
   * Muestra un instante fijo de la secuencia (en segundos, 0 a METATRON_DURATION).
   * Sirve para un logo estático; ejemplo: METATRON_FINAL_AT deja el Cubo de Metatrón.
   */
  staticAt?: number;
  className?: string;
  /** texto accesible; pasa "" si el nombre ya está escrito al lado */
  label?: string;
  /** se llama cada vez que cambia la forma que se está mostrando */
  onStageChange?: (index: number, name: string) => void;
};

// ───────────────────────── geometría de cada forma ─────────────────────────

type V3 = [number, number, number];
const SLOTS = 20; // nodos disponibles: los 20 vértices del dodecaedro
const PHI = (1 + Math.sqrt(5)) / 2;
const META_R = 0.42; // separación entre círculos del Cubo de Metatrón

const normalize = (pts: V3[]): V3[] => {
  const r = Math.max(...pts.map((p) => Math.hypot(p[0], p[1], p[2])));
  return pts.map((p) => [p[0] / r, p[1] / r, p[2] / r] as V3);
};

const signs = [-1, 1];
const tetra: V3[] = normalize([
  [1, 1, 1],
  [1, -1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
]);
const cubeV: V3[] = [];
for (const x of signs) for (const y of signs) for (const z of signs) cubeV.push([x, y, z]);
const cube = normalize(cubeV);
const octa: V3[] = [
  [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
];
const icosaV: V3[] = [];
for (const a of signs)
  for (const b of signs) icosaV.push([0, a, b * PHI], [a, b * PHI, 0], [b * PHI, 0, a]);
const icosa = normalize(icosaV);
const dodecaV: V3[] = [...cubeV];
for (const a of signs)
  for (const b of signs)
    dodecaV.push([0, a / PHI, b * PHI], [a / PHI, b * PHI, 0], [b * PHI, 0, a / PHI]);
const dodeca = normalize(dodecaV);
// Cubo de Metatrón: centro, 6 círculos alrededor y 6 más en las mismas direcciones
const metatron: V3[] = [[0, 0, 0]];
for (const k of [1, 2]) {
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 3;
    metatron.push([Math.cos(a) * META_R * k, Math.sin(a) * META_R * k, 0]);
  }
}

type ShapeDef = { verts: V3[]; allPairs: boolean; flat: number };
const DEFS: ShapeDef[] = [
  { verts: [[0, 0, 0]], allPairs: false, flat: 0 }, // Punto
  { verts: tetra, allPairs: false, flat: 0 },
  { verts: cube, allPairs: false, flat: 0 },
  { verts: octa, allPairs: false, flat: 0 },
  { verts: icosa, allPairs: false, flat: 0 },
  { verts: dodeca, allPairs: false, flat: 0 },
  { verts: metatron, allPairs: true, flat: 1 }, // Cubo de Metatrón
];
const META = DEFS.length - 1;

type Shape = {
  pos: Float32Array; // SLOTS * 3
  prim: Float32Array; // 1 si el nodo es un vértice de la forma, 0 si se funde con otro
  edges: Set<number>; // índices dentro del pool de aristas
  flat: number;
  slotOfVertex: number[];
};

type Built = { shapes: Shape[]; poolA: number[]; poolB: number[] };
let cache: Built | null = null;

/** Reparte los nodos entre los vértices de cada forma eligiendo siempre el más cercano. */
function build(): Built {
  if (cache) return cache;
  const poolKey = new Map<number, number>();
  const poolA: number[] = [];
  const poolB: number[] = [];
  let prev = new Float32Array(SLOTS * 3);
  const shapes: Shape[] = DEFS.map((def) => {
    const k = def.verts.length;
    const cand: { s: number; v: number; d: number }[] = [];
    for (let s = 0; s < SLOTS; s++)
      for (let v = 0; v < k; v++)
        cand.push({
          s,
          v,
          d: Math.hypot(
            prev[s * 3] - def.verts[v][0],
            prev[s * 3 + 1] - def.verts[v][1],
            prev[s * 3 + 2] - def.verts[v][2]
          ),
        });
    cand.sort((a, b) => a.d - b.d || a.s - b.s || a.v - b.v);
    const slotOfVertex = new Array<number>(k).fill(-1);
    const used = new Array<boolean>(SLOTS).fill(false);
    let claimed = 0;
    for (const c of cand) {
      if (used[c.s] || slotOfVertex[c.v] >= 0) continue;
      used[c.s] = true;
      slotOfVertex[c.v] = c.s;
      if (++claimed === k) break;
    }
    const pos = new Float32Array(SLOTS * 3);
    const prim = new Float32Array(SLOTS);
    for (let v = 0; v < k; v++) {
      const s = slotOfVertex[v];
      pos.set(def.verts[v], s * 3);
      prim[s] = 1;
    }
    for (let s = 0; s < SLOTS; s++) {
      if (used[s]) continue;
      let best = 0;
      let bd = Infinity;
      for (let v = 0; v < k; v++) {
        const d = Math.hypot(
          prev[s * 3] - def.verts[v][0],
          prev[s * 3 + 1] - def.verts[v][1],
          prev[s * 3 + 2] - def.verts[v][2]
        );
        if (d < bd) {
          bd = d;
          best = v;
        }
      }
      pos.set(def.verts[best], s * 3);
    }

    // aristas: los pares de vértices más cercanos entre sí (o todos, en Metatrón)
    const edges = new Set<number>();
    if (k > 1) {
      let min = Infinity;
      for (let i = 0; i < k; i++)
        for (let j = i + 1; j < k; j++)
          min = Math.min(
            min,
            Math.hypot(
              def.verts[i][0] - def.verts[j][0],
              def.verts[i][1] - def.verts[j][1],
              def.verts[i][2] - def.verts[j][2]
            )
          );
      for (let i = 0; i < k; i++)
        for (let j = i + 1; j < k; j++) {
          const d = Math.hypot(
            def.verts[i][0] - def.verts[j][0],
            def.verts[i][1] - def.verts[j][1],
            def.verts[i][2] - def.verts[j][2]
          );
          if (!def.allPairs && d > min * 1.001) continue;
          const a = Math.min(slotOfVertex[i], slotOfVertex[j]);
          const b = Math.max(slotOfVertex[i], slotOfVertex[j]);
          const key = a * SLOTS + b;
          let idx = poolKey.get(key);
          if (idx === undefined) {
            idx = poolA.length;
            poolKey.set(key, idx);
            poolA.push(a);
            poolB.push(b);
          }
          edges.add(idx);
        }
    }
    prev = pos;
    return { pos, prim, edges, flat: def.flat, slotOfVertex };
  });
  cache = { shapes, poolA, poolB };
  return cache;
}

// ───────────────────────────── línea de tiempo ─────────────────────────────

// segundos de transformación (m) y de pausa (h) en cada forma
const SEGMENTS = [
  { m: 1.6, h: 0.6 }, // Punto → Tetraedro
  { m: 1.4, h: 0.8 }, // → Cubo
  { m: 1.4, h: 0.8 }, // → Octaedro
  { m: 1.5, h: 0.8 }, // → Icosaedro
  { m: 1.5, h: 0.9 }, // → Dodecaedro
  { m: 2.0, h: 3.5 }, // → Cubo de Metatrón
  { m: 1.6, h: 0.3 }, // → Punto (vuelve a empezar)
];
const STARTS: number[] = [];
let acc = 0;
for (const s of SEGMENTS) {
  STARTS.push(acc);
  acc += s.m + s.h;
}
/** duración total de un ciclo, en segundos */
export const METATRON_DURATION = acc;
/** instante en que el Cubo de Metatrón ya está completo y de frente */
export const METATRON_FINAL_AT = STARTS[META - 1] + SEGMENTS[META - 1].m + 1.2;
const STOP_AT = STARTS[META - 1] + SEGMENTS[META - 1].m; // fin de la forma, para loop={false}

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

// ───────────────────────────── componente ─────────────────────────────

const EDGE_R = 0.02;
const NODE_R = 0.06;
const RING_R = 0.012;
const FRAME_RADIUS = 1.34; // radio que debe entrar en el cuadro

export function MetatronLogo3D({
  size = 120,
  color,
  inverted = false,
  speed = 1,
  loop = true,
  staticAt,
  className = "",
  label = "Cubo de Metatrón",
  onStageChange,
}: MetatronLogo3DProps) {
  const mountRef = useRef<HTMLSpanElement>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const redrawRef = useRef<() => void>(() => {});
  const boostUntilRef = useRef(0);
  const restartRef = useRef(false);
  const propsRef = useRef({ speed, loop, staticAt, onStageChange });
  propsRef.current = { speed, loop, staticAt, onStageChange };

  const resolvedColor = color ?? (inverted ? "#f5f6f8" : "#0b0b0c");

  useEffect(() => {
    materialRef.current?.color.set(resolvedColor);
    redrawRef.current();
  }, [resolvedColor]);

  useEffect(() => {
    redrawRef.current();
  }, [staticAt]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const { shapes, poolA, poolB } = build();
    const E = poolA.length;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const fov = 10;
    const camera = new THREE.PerspectiveCamera(fov, 1, 1, 100);
    camera.position.z =
      (FRAME_RADIUS * 1.08) / Math.tan(THREE.MathUtils.degToRad(fov / 2));

    // Desde r155 las luces usan unidades físicas, por eso las intensidades son altas.
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f99, 2.6));
    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(3, 5, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 1.6);
    rim.position.set(-6, -2, -4);
    scene.add(rim);

    const material = new THREE.MeshStandardMaterial({
      color: resolvedColor,
      roughness: 0.35,
      metalness: 0.15,
    });
    materialRef.current = material;

    const edgeGeo = new THREE.CylinderGeometry(EDGE_R, EDGE_R, 1, 8);
    const nodeGeo = new THREE.SphereGeometry(NODE_R, 18, 12);
    const ringGeo = new THREE.TorusGeometry(META_R, RING_R, 8, 64);
    const edgeMesh = new THREE.InstancedMesh(edgeGeo, material, Math.max(E, 1));
    const nodeMesh = new THREE.InstancedMesh(nodeGeo, material, SLOTS);
    const ringMesh = new THREE.InstancedMesh(ringGeo, material, DEFS[META].verts.length);
    for (const m of [edgeMesh, nodeMesh, ringMesh]) m.frustumCulled = false;

    const orient = new THREE.Group(); // orientación de la secuencia
    orient.add(edgeMesh, nodeMesh, ringMesh);
    const tilt = new THREE.Group(); // sigue levemente al mouse
    tilt.add(orient);
    scene.add(tilt);

    const P = Array.from({ length: SLOTS }, () => new THREE.Vector3());
    const dummy = new THREE.Object3D();
    const yAxis = new THREE.Vector3(0, 1, 0);
    const dir = new THREE.Vector3();
    const qSpin = new THREE.Quaternion();
    const qId = new THREE.Quaternion();
    const euler = new THREE.Euler();
    const ringSlots = shapes[META].slotOfVertex;
    const EPS = 1e-4;

    let stage = -1;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    /** Dibuja la secuencia en el instante t (segundos dentro del ciclo). */
    const apply = (t: number) => {
      // qué tramo es
      let i = SEGMENTS.length - 1;
      for (let n = 0; n < SEGMENTS.length; n++) {
        if (t < STARTS[n] + SEGMENTS[n].m + SEGMENTS[n].h) {
          i = n;
          break;
        }
      }
      const local = t - STARTS[i];
      const morphing = local < SEGMENTS[i].m;
      const u = morphing ? Math.max(local, 0) / SEGMENTS[i].m : 1;
      const p = easeInOutCubic(u);
      const to = (i + 1) % DEFS.length;
      const A = morphing ? shapes[i] : shapes[to];
      const B = shapes[to];
      const fromIdx = morphing ? i : to;

      // nodos
      for (let s = 0; s < SLOTS; s++) {
        const x = A.pos[s * 3] + (B.pos[s * 3] - A.pos[s * 3]) * p;
        const y = A.pos[s * 3 + 1] + (B.pos[s * 3 + 1] - A.pos[s * 3 + 1]) * p;
        const z = A.pos[s * 3 + 2] + (B.pos[s * 3 + 2] - A.pos[s * 3 + 2]) * p;
        P[s].set(x, y, z);
        const sc = A.prim[s] + (B.prim[s] - A.prim[s]) * p;
        dummy.position.set(x, y, z);
        dummy.quaternion.identity();
        dummy.scale.setScalar(Math.max(sc, EPS));
        dummy.updateMatrix();
        nodeMesh.setMatrixAt(s, dummy.matrix);
      }
      nodeMesh.instanceMatrix.needsUpdate = true;

      // aristas: las que se van se afinan primero, las que llegan crecen al final
      for (let e = 0; e < E; e++) {
        const inA = A.edges.has(e);
        const inB = B.edges.has(e);
        const w =
          inA && inB ? 1 : inA ? 1 - smoothstep(0, 0.45, u) : inB ? smoothstep(0.55, 1, u) : 0;
        const pa = P[poolA[e]];
        const pb = P[poolB[e]];
        dir.subVectors(pb, pa);
        const len = dir.length();
        dummy.position.addVectors(pa, pb).multiplyScalar(0.5);
        dummy.quaternion.setFromUnitVectors(yAxis, dir.divideScalar(len || 1));
        dummy.scale.set(Math.max(w, EPS), Math.max(len, EPS), Math.max(w, EPS));
        dummy.updateMatrix();
        edgeMesh.setMatrixAt(e, dummy.matrix);
      }
      edgeMesh.instanceMatrix.needsUpdate = true;

      // 13 círculos: aparecen al final del camino hacia Metatrón y se van al salir
      let ringW = 0;
      if (to === META) ringW = morphing ? smoothstep(0.7, 1, u) : 1;
      else if (fromIdx === META) ringW = 1 - smoothstep(0, 0.35, u);
      for (let r = 0; r < ringSlots.length; r++) {
        dummy.position.copy(P[ringSlots[r]]);
        dummy.quaternion.identity();
        dummy.scale.setScalar(Math.max(ringW, EPS));
        dummy.updateMatrix();
        ringMesh.setMatrixAt(r, dummy.matrix);
      }
      ringMesh.instanceMatrix.needsUpdate = true;

      // orientación: gira libre, pero queda de frente cuando la forma es plana
      const flat = A.flat + (B.flat - A.flat) * p;
      euler.set(0.38 + 0.12 * Math.sin(t * 0.35), t * 0.55, 0);
      qSpin.setFromEuler(euler);
      qSpin.slerp(qId, flat);
      orient.quaternion.copy(qSpin);

      const now = u >= 0.5 ? to : fromIdx;
      if (now !== stage) {
        stage = now;
        propsRef.current.onStageChange?.(now, METATRON_STAGES[now]);
      }
    };

    const draw = () => {
      tilt.rotation.set(mouse.y * 0.22, mouse.x * 0.3, 0);
      renderer.render(scene, camera);
    };

    let time = 0;
    let boost = 0;
    let visible = true;
    let lastNow = 0;

    const staticTime = () => {
      const s = propsRef.current.staticAt;
      if (s !== undefined) return s;
      return reduceMotion ? METATRON_FINAL_AT : undefined;
    };

    redrawRef.current = () => {
      const st = staticTime();
      if (st !== undefined) {
        apply(st);
        draw();
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / Math.max(window.innerWidth, 1);
      const dy = (e.clientY - (r.top + r.height / 2)) / Math.max(window.innerHeight, 1);
      mouse.tx = THREE.MathUtils.clamp(dx * 2.2, -1, 1);
      mouse.ty = THREE.MathUtils.clamp(dy * 2.2, -1, 1);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(mount);

    const st0 = staticTime();
    if (st0 !== undefined) {
      apply(st0);
      draw();
    } else {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      renderer.setAnimationLoop((now: number) => {
        const dt = Math.min((now - lastNow) / 1000, 0.05);
        lastNow = now;
        if (!visible) return;
        const { speed: sp, loop: lp } = propsRef.current;

        if (restartRef.current) {
          restartRef.current = false;
          time = 0;
        }
        const target = now < boostUntilRef.current ? 1 : 0;
        boost += (target - boost) * Math.min(dt * 4, 1);
        time += dt * sp * (1 + boost * 2);

        let t: number;
        if (lp) {
          time %= METATRON_DURATION;
          t = time;
        } else {
          time = Math.min(time, STOP_AT + 1.2);
          t = time;
        }
        mouse.x += (mouse.tx - mouse.x) * 0.06;
        mouse.y += (mouse.ty - mouse.y) * 0.06;
        apply(t);
        draw();
      });
    }

    return () => {
      renderer.setAnimationLoop(null);
      io.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      redrawRef.current = () => {};
      // Three.js no libera la memoria de la GPU solo: hay que hacerlo a mano.
      edgeGeo.dispose();
      nodeGeo.dispose();
      ringGeo.dispose();
      edgeMesh.dispose();
      nodeMesh.dispose();
      ringMesh.dispose();
      material.dispose();
      materialRef.current = null;
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
    // `resolvedColor` y `staticAt` se aplican en sus propios efectos, sin reconstruir la escena.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  return (
    <span
      ref={mountRef}
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      className={`inline-block shrink-0 ${className}`}
      style={{ width: size, height: size }}
      onPointerEnter={() => {
        if (propsRef.current.staticAt !== undefined) return;
        if (propsRef.current.loop) boostUntilRef.current = performance.now() + 1200;
        else restartRef.current = true; // sin loop, el mouse reinicia la evolución
      }}
    />
  );
}