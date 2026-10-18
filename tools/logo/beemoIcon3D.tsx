"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Ícono de Beemo: un hipercubo (teseracto) que rota en 4D.
 *
 * - 16 vértices y 32 aristas. Cada frame se rota en los planos XW y ZW y se
 *   proyecta en perspectiva a 3D; se dibuja con Three.js (WebGLRenderer).
 * - Es independiente: no importa nada de tu proyecto. El nombre "Beemo" va aparte.
 *
 * Instalar:  npm i three   y   npm i -D @types/three
 */

export type BeemoIcon3DProps = {
  /** lado del ícono en px */
  size?: number;
  /** color de las aristas y nodos (cualquier color CSS). Por defecto negro. */
  color?: string;
  /** atajo para fondos oscuros: usa un blanco suave si no pasas `color` */
  inverted?: boolean;
  /** velocidad de la rotación 4D (1 = normal, 0 = quieto) */
  speed?: number;
  className?: string;
  /** texto accesible; pasa "" si el nombre ya está escrito al lado */
  label?: string;
};

const W_DISTANCE = 3.2; // distancia del "ojo" en la cuarta dimensión
const SCALE = 2.0;
const BOOST_MS = 1600;

// 16 vértices (±1, ±1, ±1, ±1)
const VERTS: number[][] = [];
for (let i = 0; i < 16; i++) {
  VERTS.push([
    i & 1 ? 1 : -1,
    i & 2 ? 1 : -1,
    i & 4 ? 1 : -1,
    i & 8 ? 1 : -1,
  ]);
}

// 32 aristas: pares de vértices que difieren en una sola coordenada
const EDGES: [number, number][] = [];
for (let i = 0; i < 16; i++) {
  for (let b = 0; b < 4; b++) {
    const j = i ^ (1 << b);
    if (j > i) EDGES.push([i, j]);
  }
}

/** Orientación isométrica: un vértice del cubo queda arriba y la diagonal mira a cámara. */
function isometricPose() {
  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(1, 1, 1).normalize(),
    new THREE.Vector3(0, 0, 1)
  );
  const top = new THREE.Vector3(1, 1, -1).applyQuaternion(q);
  const roll = Math.PI / 2 - Math.atan2(top.y, top.x);
  const qz = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0, 0, 1),
    roll
  );
  return qz.multiply(q);
}

export function BeemoIcon3D({
  size = 56,
  color,
  inverted = false,
  speed = 1,
  className = "",
  label = "Beemo",
}: BeemoIcon3DProps) {
  const mountRef = useRef<HTMLSpanElement>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const speedRef = useRef(speed);
  const boostUntilRef = useRef(0);

  const resolvedColor = color ?? (inverted ? "#f5f6f8" : "#0b0b0c");

  // Los valores que cambian seguido van por ref para no reconstruir la escena.
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    materialRef.current?.color.set(resolvedColor);
  }, [resolvedColor]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

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

    // Cámara de campo angosto: casi ortográfica, para que se lea como logo plano.
    const fov = 10;
    const radius = 2.35; // radio máximo de la proyección
    const camera = new THREE.PerspectiveCamera(fov, 1, 1, 100);
    camera.position.z =
      (radius * 1.15) / Math.tan(THREE.MathUtils.degToRad(fov / 2));

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

    const edgeGeo = new THREE.CylinderGeometry(0.03, 0.03, 1, 10);
    const nodeGeo = new THREE.SphereGeometry(0.085, 20, 14);

    const tesseract = new THREE.Group();
    const edgeMeshes = EDGES.map(() => {
      const m = new THREE.Mesh(edgeGeo, material);
      tesseract.add(m);
      return m;
    });
    const nodeMeshes = VERTS.map(() => {
      const m = new THREE.Mesh(nodeGeo, material);
      tesseract.add(m);
      return m;
    });

    const poseGroup = new THREE.Group(); // orientación isométrica
    poseGroup.quaternion.copy(isometricPose());
    poseGroup.add(tesseract);
    const spinGroup = new THREE.Group(); // giro lento en Y
    spinGroup.add(poseGroup);
    const tiltGroup = new THREE.Group(); // sigue al mouse
    tiltGroup.add(spinGroup);
    scene.add(tiltGroup);

    const pts = VERTS.map(() => new THREE.Vector3());
    const fac = new Array<number>(VERTS.length).fill(1);
    const yAxis = new THREE.Vector3(0, 1, 0);
    const dir = new THREE.Vector3();
    const mid = new THREE.Vector3();
    const refFactor = SCALE / W_DISTANCE; // factor de perspectiva con w = 0

    const project = (phaseA: number, phaseB: number) => {
      const ca = Math.cos(phaseA);
      const sa = Math.sin(phaseA);
      const cb = Math.cos(phaseB);
      const sb = Math.sin(phaseB);
      for (let i = 0; i < VERTS.length; i++) {
        const [x0, y, z0, w0] = VERTS[i];
        const x = x0 * ca - w0 * sa; // rotación en el plano XW
        const w1 = x0 * sa + w0 * ca;
        const z = z0 * cb - w1 * sb; // rotación en el plano ZW
        const w = z0 * sb + w1 * cb;
        const f = SCALE / (W_DISTANCE - w);
        pts[i].set(x * f, y * f, z * f);
        fac[i] = f;
      }
      EDGES.forEach(([a, b], k) => {
        dir.subVectors(pts[b], pts[a]);
        const len = dir.length();
        mid.addVectors(pts[a], pts[b]).multiplyScalar(0.5);
        const m = edgeMeshes[k];
        m.position.copy(mid);
        m.quaternion.setFromUnitVectors(yAxis, dir.divideScalar(len || 1));
        // lo más cercano en la 4.ª dimensión se ve más grueso
        const s = (0.5 * (fac[a] + fac[b])) / refFactor;
        m.scale.set(s, len, s);
      });
      nodeMeshes.forEach((m, i) => {
        m.position.copy(pts[i]);
        m.scale.setScalar(fac[i] / refFactor);
      });
    };

    let phase = 0.62; // pose inicial: un cubo dentro de otro
    let boost = 0; // 0..1, sube cuando el mouse pasa por encima
    let visible = true;
    let lastTime = 0;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    const update = () => {
      project(phase, phase * 0.62 + 0.8);
      spinGroup.rotation.y = phase * 0.22;
      tiltGroup.rotation.set(mouse.y * 0.3, mouse.x * 0.4, 0);
    };

    const onPointerMove = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect();
      const dx =
        (e.clientX - (r.left + r.width / 2)) / Math.max(window.innerWidth, 1);
      const dy =
        (e.clientY - (r.top + r.height / 2)) / Math.max(window.innerHeight, 1);
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

    update();
    if (reduceMotion) {
      renderer.render(scene, camera); // pose fija
    } else {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      renderer.setAnimationLoop((now: number) => {
        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        if (!visible) return;

        const target = now < boostUntilRef.current ? 1 : 0;
        boost += (target - boost) * Math.min(dt * 4, 1);
        phase += dt * 0.55 * speedRef.current * (1 + boost * 3.5);
        mouse.x += (mouse.tx - mouse.x) * 0.06;
        mouse.y += (mouse.ty - mouse.y) * 0.06;

        update();
        renderer.render(scene, camera);
      });
    }

    return () => {
      renderer.setAnimationLoop(null);
      io.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      // Three.js no libera la memoria de la GPU solo: hay que hacerlo a mano.
      edgeGeo.dispose();
      nodeGeo.dispose();
      material.dispose();
      materialRef.current = null;
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
    // `resolvedColor` se aplica en su propio efecto para no reconstruir la escena.
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
        boostUntilRef.current = performance.now() + BOOST_MS;
      }}
    />
  );
}