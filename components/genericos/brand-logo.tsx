"use client";
import { configuracion } from "@/utils/configuracion";
import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Logo de Beemo con ícono de hipercubo (teseracto).
 *
 * El teseracto tiene 16 vértices y 32 aristas en 4D. Cada frame se rota en los
 * planos XW y ZW, se proyecta en perspectiva a 3D y se dibuja con Three.js.
 * El nombre queda quieto; solo el ícono se mueve.
 *
 * Instalar:  npm i three   y   npm i -D @types/three
 */

type Props = {
  className?: string;
  /** true para fondos oscuros (ícono y nombre en blanco) */
  inverted?: boolean;
  /** lado del ícono en px */
  size?: number;
  /** velocidad base de la rotación 4D (1 = normal) */
  speed?: number;
  /** ocultar el nombre y mostrar solo el ícono */
  iconOnly?: boolean;
};

const W_DISTANCE = 3.2; // distancia del "ojo" en la cuarta dimensión
const SCALE = 2.0;

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

// 32 aristas: vértices que difieren en exactamente una coordenada
const EDGES: [number, number][] = [];
for (let i = 0; i < 16; i++) {
  for (let b = 0; b < 4; b++) {
    const j = i ^ (1 << b);
    if (j > i) EDGES.push([i, j]);
  }
}

/** Orientación isométrica del espacio 3D: un vértice del cubo queda arriba. */
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

export function BrandLogo3D({
  className = "",
  inverted = false,
  size = 56,
  speed = 1,
  iconOnly = false,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const boostRef = useRef<() => void>(() => {});

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
    const fov = 10;
    const radius = 2.35;
    const camera = new THREE.PerspectiveCamera(fov, 1, 1, 100);
    camera.position.z =
      (radius * 1.15) / Math.tan(THREE.MathUtils.degToRad(fov / 2));

    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f99, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(3, 5, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 1.0);
    rim.position.set(-6, -2, -4);
    scene.add(rim);

    const material = new THREE.MeshStandardMaterial({
      color: inverted ? 0xf5f6f8 : 0x0b0b0c,
      roughness: 0.35,
      metalness: 0.15,
    });
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

    const spinGroup = new THREE.Group(); // giro lento en Y
    const poseGroup = new THREE.Group(); // orientación isométrica
    poseGroup.quaternion.copy(isometricPose());
    poseGroup.add(tesseract);
    spinGroup.add(poseGroup);
    const tiltGroup = new THREE.Group(); // mouse
    tiltGroup.add(spinGroup);
    scene.add(tiltGroup);

    const pts = VERTS.map(() => new THREE.Vector3());
    const fac = new Array<number>(VERTS.length).fill(1);
    const yAxis = new THREE.Vector3(0, 1, 0);
    const dir = new THREE.Vector3();
    const mid = new THREE.Vector3();

    // referencia de grosor: factor de perspectiva con w = 0
    const refFactor = SCALE / W_DISTANCE;

    const project = (phaseA: number, phaseB: number) => {
      const ca = Math.cos(phaseA);
      const sa = Math.sin(phaseA);
      const cb = Math.cos(phaseB);
      const sb = Math.sin(phaseB);
      for (let i = 0; i < VERTS.length; i++) {
        const [x0, y, z0, w0] = VERTS[i];
        // rotación en el plano XW
        const x = x0 * ca - w0 * sa;
        const w1 = x0 * sa + w0 * ca;
        // rotación en el plano ZW
        const z = z0 * cb - w1 * sb;
        const w = z0 * sb + w1 * cb;
        const f = SCALE / (W_DISTANCE - w);
        pts[i].set(x * f, y * f, z * f);
        fac[i] = f;
      }
      EDGES.forEach(([a, b], k) => {
        const pa = pts[a];
        const pb = pts[b];
        dir.subVectors(pb, pa);
        const len = dir.length();
        mid.addVectors(pa, pb).multiplyScalar(0.5);
        const m = edgeMeshes[k];
        m.position.copy(mid);
        m.quaternion.setFromUnitVectors(yAxis, dir.divideScalar(len || 1));
        const s = (0.5 * (fac[a] + fac[b])) / refFactor; // más cerca en w = más grueso
        m.scale.set(s, len, s);
      });
      nodeMeshes.forEach((m, i) => {
        m.position.copy(pts[i]);
        m.scale.setScalar(fac[i] / refFactor);
      });
    };

    // estado de animación
    let phase = 0.62; // pose inicial agradable (cubo dentro de cubo)
    let boost = 0; // 0..1, sube con el hover
    let visible = true;
    let raf = 0;
    let last = performance.now();
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let boostUntil = 0;

    boostRef.current = () => {
      if (reduceMotion) return;
      boostUntil = performance.now() + 1600;
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

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!visible) return;

      const target = now < boostUntil ? 1 : 0;
      boost += (target - boost) * Math.min(dt * 4, 1);
      phase += dt * 0.55 * speed * (1 + boost * 3.5);

      project(phase, phase * 0.62 + 0.8);

      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      spinGroup.rotation.y = phase * 0.22;
      tiltGroup.rotation.set(mouse.y * 0.3, mouse.x * 0.4, 0);

      renderer.render(scene, camera);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(mount);

    if (reduceMotion) {
      project(phase, phase * 0.62 + 0.8);
      renderer.render(scene, camera);
    } else {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      edgeGeo.dispose();
      nodeGeo.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [inverted, size, speed]);

  return (
    <span
      className={`inline-flex items-center gap-2 select-none ${className}`}
      onPointerEnter={() => boostRef.current()}
    >
      <span
        ref={mountRef}
        aria-hidden="true"
        className="inline-block shrink-0"
        style={{ width: size, height: size }}
      />
      {iconOnly ? (
        <span className="sr-only">{configuracion.nameCompany}</span>
      ) : (
        <span
          className={`font-semibold tracking-tight leading-none ${
            inverted ? "text-white" : "text-black"
          }`}
          style={{ fontSize: size * 0.5 }}
        >
          {configuracion.nameCompany}
        </span>
      )}
    </span>
  );
}
