"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

const RADIUS = 1.6;
const SEA_LEVEL = 0.5;

/* ---------- utilidades: ruido y aleatorio determinista ---------- */

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(x: number, y: number, z: number) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

const smooth = (t: number) => t * t * (3 - 2 * t);

function noise3(x: number, y: number, z: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const u = smooth(x - xi);
  const v = smooth(y - yi);
  const w = smooth(z - zi);
  const l = THREE.MathUtils.lerp;
  const c = (a: number, b: number, d: number) => hash(xi + a, yi + b, zi + d);
  return l(
    l(l(c(0, 0, 0), c(1, 0, 0), u), l(c(0, 1, 0), c(1, 1, 0), u), v),
    l(l(c(0, 0, 1), c(1, 0, 1), u), l(c(0, 1, 1), c(1, 1, 1), u), v),
    w,
  );
}

function fbm(x: number, y: number, z: number) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < 4; i++) {
    sum += amp * noise3(x * freq, y * freq, z * freq);
    freq *= 2;
    amp *= 0.5;
  }
  return sum;
}

/* ---------- construcción del planeta ---------- */

type Palette = Record<"deep" | "shallow" | "sand" | "grass" | "forest" | "rock" | "snow", THREE.Color>;

function colorForLevel(level: number, out: THREE.Color, p: Palette) {
  if (level < 0) {
    const t = THREE.MathUtils.clamp(1 + level / 0.15, 0, 1);
    return out.copy(p.deep).lerp(p.shallow, t);
  }
  if (level < 0.025) return out.copy(p.sand);
  if (level < 0.14) return out.copy(p.grass).lerp(p.forest, (level - 0.025) / 0.115);
  if (level < 0.22) return out.copy(p.rock);
  return out.copy(p.snow);
}

function buildPlanet(brand: THREE.Color) {
  const palette: Palette = {
    deep: new THREE.Color("#0a2744"),
    shallow: new THREE.Color("#1b6a94"),
    sand: new THREE.Color("#d8c796"),
    grass: brand.clone().lerp(new THREE.Color("#2e7d4f"), 0.45),
    forest: new THREE.Color("#1f5b43"),
    rock: new THREE.Color("#7b8794"),
    snow: new THREE.Color("#f3f7fb"),
  };

  const geometry = new THREE.IcosahedronGeometry(RADIUS, 10);
  const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
  const levels = new Float32Array(pos.count);
  const n = new THREE.Vector3();
  const p = new THREE.Vector3();

  // 1) desplazar cada vértice según el ruido (tierra sobre el nivel del mar)
  for (let i = 0; i < pos.count; i++) {
    n.fromBufferAttribute(pos, i).normalize();
    const h = fbm(n.x * 1.7 + 11.3, n.y * 1.7 + 4.1, n.z * 1.7 + 7.7);
    const level = h - SEA_LEVEL;
    levels[i] = level;
    p.copy(n).multiplyScalar(RADIUS + Math.max(level, 0) * 0.9);
    pos.setXYZ(i, p.x, p.y, p.z);
  }

  // 2) un color por cara + árboles sobre las caras de pasto
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  const rng = mulberry32(42);
  const up = new THREE.Vector3(0, 1, 0);
  const trees: THREE.Matrix4[] = [];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const d = new THREE.Vector3();

  for (let f = 0; f < pos.count; f += 3) {
    const level = (levels[f] + levels[f + 1] + levels[f + 2]) / 3;
    colorForLevel(level, c, palette);
    for (let k = 0; k < 3; k++) c.toArray(colors, (f + k) * 3);

    if (level > 0.03 && level < 0.19 && trees.length < 70 && rng() < 0.05) {
      a.fromBufferAttribute(pos, f);
      b.fromBufferAttribute(pos, f + 1);
      d.fromBufferAttribute(pos, f + 2);
      const centroid = a.add(b).add(d).multiplyScalar(1 / 3);
      const normal = centroid.clone().normalize();
      const quat = new THREE.Quaternion().setFromUnitVectors(up, normal);
      const s = 0.8 + rng() * 0.7;
      const m = new THREE.Matrix4().compose(
        centroid.clone().addScaledVector(normal, 0.06 * s),
        quat,
        new THREE.Vector3(s, s, s),
      );
      trees.push(m);
    }
  }

  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return { geometry, trees };
}

/* ---------- piezas de la escena ---------- */

function usePointer() {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return pointer;
}

function Planet({ brand, reducedMotion }: { brand: THREE.Color; reducedMotion: boolean }) {
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const treesRef = useRef<THREE.InstancedMesh>(null);
  const pointer = usePointer();
  const { geometry, trees } = useMemo(() => buildPlanet(brand), [brand]);

  useLayoutEffect(() => {
    const mesh = treesRef.current;
    if (!mesh) return;
    trees.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
  }, [trees]);

  useFrame((state, delta) => {
    if (!tilt.current || !spin.current) return;
    if (!reducedMotion) {
      spin.current.rotation.y += delta * 0.1;
      tilt.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.05;
    }
    const targetX = 0.32 + pointer.current.y * 0.12;
    const targetZ = 0.2 - pointer.current.x * 0.1;
    tilt.current.rotation.x = THREE.MathUtils.damp(tilt.current.rotation.x, targetX, 3, delta);
    tilt.current.rotation.z = THREE.MathUtils.damp(tilt.current.rotation.z, targetZ, 3, delta);
  });

  return (
    <group ref={tilt} rotation={[0.32, 0, 0.2]}>
      <group ref={spin}>
        <mesh geometry={geometry}>
          <meshStandardMaterial vertexColors flatShading roughness={0.9} metalness={0} />
        </mesh>
        <instancedMesh ref={treesRef} args={[undefined, undefined, trees.length]}>
          <coneGeometry args={[0.035, 0.13, 5]} />
          <meshStandardMaterial color="#1f5b43" flatShading roughness={1} />
        </instancedMesh>
      </group>

      {/* atmósfera */}
      <mesh scale={1.14}>
        <sphereGeometry args={[RADIUS, 48, 48]} />
        <meshBasicMaterial
          color={brand}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function Cloud({
  tilt,
  speed,
  phase,
  scale,
  reducedMotion,
}: {
  tilt: [number, number, number];
  speed: number;
  phase: number;
  scale: number;
  reducedMotion: boolean;
}) {
  const orbit = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (orbit.current && !reducedMotion) orbit.current.rotation.y += delta * speed;
  });

  return (
    <group rotation={tilt}>
      <group ref={orbit} rotation={[0, phase, 0]}>
        <group position={[RADIUS + 0.38, 0, 0]} scale={scale}>
          <mesh>
            <icosahedronGeometry args={[0.16, 0]} />
            <meshStandardMaterial color="#ffffff" flatShading roughness={1} />
          </mesh>
          <mesh position={[0.14, -0.03, 0.05]} scale={0.75}>
            <icosahedronGeometry args={[0.16, 0]} />
            <meshStandardMaterial color="#ffffff" flatShading roughness={1} />
          </mesh>
          <mesh position={[-0.15, -0.04, -0.04]} scale={0.65}>
            <icosahedronGeometry args={[0.16, 0]} />
            <meshStandardMaterial color="#ffffff" flatShading roughness={1} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function Clouds({ reducedMotion }: { reducedMotion: boolean }) {
  const clouds = useMemo(() => {
    const rng = mulberry32(9);
    return Array.from({ length: 7 }, () => ({
      tilt: [(rng() - 0.5) * 1.4, 0, (rng() - 0.5) * 1.4] as [number, number, number],
      speed: 0.05 + rng() * 0.09,
      phase: rng() * Math.PI * 2,
      scale: 0.8 + rng() * 0.7,
    }));
  }, []);

  return (
    <>
      {clouds.map((cloud, i) => (
        <Cloud key={i} {...cloud} reducedMotion={reducedMotion} />
      ))}
    </>
  );
}

function Moon({ brand, reducedMotion }: { brand: THREE.Color; reducedMotion: boolean }) {
  const orbit = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (orbit.current && !reducedMotion) orbit.current.rotation.y += delta * 0.22;
  });

  return (
    <group rotation={[0.55, 0, -0.3]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.9, 0.004, 6, 180]} />
        <meshBasicMaterial color={brand} transparent opacity={0.35} />
      </mesh>
      <group ref={orbit}>
        <mesh position={[2.9, 0, 0]}>
          <icosahedronGeometry args={[0.2, 1]} />
          <meshStandardMaterial color="#cfd8e3" flatShading roughness={1} />
        </mesh>
      </group>
    </group>
  );
}

function Stars({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const rng = mulberry32(7);
    const arr = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      const u = rng() * 2 - 1;
      const t = rng() * Math.PI * 2;
      const r = 7 + rng() * 5;
      const s = Math.sqrt(1 - u * u);
      arr.set([r * s * Math.cos(t), r * u, r * s * Math.sin(t)], i * 3);
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (ref.current && !reducedMotion) ref.current.rotation.y += delta * 0.01;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#ffffff" transparent opacity={0.7} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function World({ brand, reducedMotion }: { brand: THREE.Color; reducedMotion: boolean }) {
  // reduce el mundo en pantallas angostas para que quepa la luna
  const viewportWidth = useThree((state) => state.viewport.width);
  const scale = Math.min(1, viewportWidth / 6.4);

  return (
    <group scale={scale}>
      <Planet brand={brand} reducedMotion={reducedMotion} />
      <Clouds reducedMotion={reducedMotion} />
      <Moon brand={brand} reducedMotion={reducedMotion} />
    </group>
  );
}

/* ---------- escena exportada ---------- */

export default function HeroWorldScene({
  brand = "#3ddc97",
  paused = false,
  reducedMotion = false,
}: {
  brand?: string;
  paused?: boolean;
  reducedMotion?: boolean;
}) {
  const brandColor = useMemo(() => new THREE.Color(brand), [brand]);

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.2, 7.2], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={paused ? "never" : "always"}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 3, 5]} intensity={2.4} />
      <directionalLight position={[-5, -1, -4]} intensity={1.2} color={brandColor} />
      <World brand={brandColor} reducedMotion={reducedMotion} />
      <Stars reducedMotion={reducedMotion} />
    </Canvas>
  );
}