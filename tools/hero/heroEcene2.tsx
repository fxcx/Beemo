"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, type RootState } from "@react-three/fiber";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import landTopology from "world-atlas/land-110m.json";

const RADIUS = 1.6;

/* ------------------------------------------------------------------ */
/* Datos: ciudades y rutas                                             */
/* ------------------------------------------------------------------ */

const CITIES = [
  { name: "New York", lat: 40.71, lon: -74.0 },
  { name: "Los Angeles", lat: 34.05, lon: -118.24 },
  { name: "Ciudad de México", lat: 19.43, lon: -99.13 },
  { name: "Bogotá", lat: 4.71, lon: -74.07 },
  { name: "São Paulo", lat: -23.55, lon: -46.63 },
  { name: "Buenos Aires", lat: -34.6, lon: -58.38 },
  { name: "Santiago", lat: -33.45, lon: -70.67 },
  { name: "Londres", lat: 51.5, lon: -0.12 },
  { name: "Madrid", lat: 40.42, lon: -3.7 },
  { name: "París", lat: 48.86, lon: 2.35 },
  { name: "Berlín", lat: 52.52, lon: 13.4 },
  { name: "El Cairo", lat: 30.04, lon: 31.24 },
  { name: "Lagos", lat: 6.52, lon: 3.38 },
  { name: "Johannesburgo", lat: -26.2, lon: 28.05 },
  { name: "Nairobi", lat: -1.29, lon: 36.82 },
  { name: "Dubái", lat: 25.2, lon: 55.27 },
  { name: "Bombay", lat: 19.08, lon: 72.88 },
  { name: "Singapur", lat: 1.35, lon: 103.82 },
  { name: "Tokio", lat: 35.68, lon: 139.69 },
  { name: "Seúl", lat: 37.57, lon: 126.98 },
  { name: "Shanghái", lat: 31.23, lon: 121.47 },
  { name: "Sídney", lat: -33.87, lon: 151.21 },
  { name: "Moscú", lat: 55.75, lon: 37.62 },
  { name: "Toronto", lat: 43.65, lon: -79.38 },
] as const;

// pares de índices de CITIES
const ROUTES: ReadonlyArray<readonly [number, number]> = [
  [5, 8], [5, 4], [5, 0], [6, 4], [0, 7], [0, 1], [2, 0], [3, 8], [23, 7],
  [1, 18], [7, 15], [7, 22], [8, 12], [9, 18], [12, 13], [11, 16], [14, 15],
  [15, 17], [16, 17], [13, 16], [17, 21], [18, 20], [20, 21], [19, 0],
];

const POSTER_WIDTH = 720;
const POSTER_HEIGHT = 320;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function subscribeToPageVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

function getPageVisibilitySnapshot() {
  return document.visibilityState === "visible";
}

function projectCity(index: number) {
  const city = CITIES[index];
  return {
    x: ((city.lon + 180) / 360) * POSTER_WIDTH,
    y: ((90 - city.lat) / 180) * POSTER_HEIGHT,
  };
}

function posterRouteSegments(fromIndex: number, toIndex: number) {
  const from = projectCity(fromIndex);
  const to = projectCity(toIndex);
  const deltaX = to.x - from.x;

  if (Math.abs(deltaX) <= POSTER_WIDTH / 2) {
    return [{ x1: from.x, y1: from.y, x2: to.x, y2: to.y }];
  }

  const unwrappedEndX = deltaX > 0 ? to.x - POSTER_WIDTH : to.x + POSTER_WIDTH;
  const edgeX = unwrappedEndX > from.x ? POSTER_WIDTH : 0;
  const oppositeEdgeX = edgeX === 0 ? POSTER_WIDTH : 0;
  const t = (edgeX - from.x) / (unwrappedEndX - from.x);
  const edgeY = from.y + (to.y - from.y) * t;

  return [
    { x1: from.x, y1: from.y, x2: edgeX, y2: edgeY },
    { x1: oppositeEdgeX, y1: edgeY, x2: to.x, y2: to.y },
  ];
}

function StaticWorldPoster() {
  const cities = CITIES.map((_, index) => projectCity(index));

  return (
    <svg
      className="h-full w-full"
      viewBox={`0 0 ${POSTER_WIDTH} ${POSTER_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <g fill="none" stroke="#3ddc97" strokeOpacity="0.26" strokeWidth="1.4">
        {ROUTES.flatMap(([from, to], index) =>
          posterRouteSegments(from, to).map((segment, segmentIndex) => (
            <line
              key={`${index}-${segmentIndex}`}
              x1={segment.x1}
              y1={segment.y1}
              x2={segment.x2}
              y2={segment.y2}
            />
          )),
        )}
      </g>
      <g fill="#3ddc97">
        {cities.map((city, index) => (
          <circle key={index} cx={city.x} cy={city.y} r="2.7" />
        ))}
      </g>
      <g fill="#ffffff" fillOpacity="0.8">
        {[5, 0, 7, 18, 21].map((index) => (
          <circle key={index} cx={cities[index].x} cy={cities[index].y} r="4.2" />
        ))}
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

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

function latLonToVec3(lat: number, lon: number, r: number) {
  const phi = THREE.MathUtils.degToRad(lat);
  const lam = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(
    r * Math.cos(phi) * Math.sin(lam),
    r * Math.sin(phi),
    r * Math.cos(phi) * Math.cos(lam),
  );
}

/* ------------------------------------------------------------------ */
/* Máscara de tierra (Natural Earth 110m vía world-atlas)              */
/* ------------------------------------------------------------------ */

type GeoNode = {
  type: string;
  features?: GeoNode[];
  geometry?: GeoNode | null;
  geometries?: GeoNode[];
  coordinates?: unknown;
};

function collectPolygons(node: GeoNode, out: number[][][][]) {
  switch (node.type) {
    case "FeatureCollection":
      node.features?.forEach((f) => collectPolygons(f, out));
      break;
    case "Feature":
      if (node.geometry) collectPolygons(node.geometry, out);
      break;
    case "GeometryCollection":
      node.geometries?.forEach((g) => collectPolygons(g, out));
      break;
    case "Polygon":
      out.push(node.coordinates as number[][][]);
      break;
    case "MultiPolygon":
      out.push(...(node.coordinates as number[][][][]));
      break;
  }
}

type LandMask = {
  canvas: HTMLCanvasElement;
  data: Uint8ClampedArray;
  width: number;
  height: number;
};
let cachedMask: LandMask | null = null;

function getLandMask(): LandMask {
  if (cachedMask) return cachedMask;

  const width = 1440;
  const height = 720;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not create the 2D canvas context for the globe land mask.");

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#fff";

  const topology = landTopology as unknown as Topology;
  const land = feature(topology, topology.objects.land) as unknown as GeoNode;
  const polygons: number[][][][] = [];
  collectPolygons(land, polygons);

  for (const polygon of polygons) {
    ctx.beginPath();
    for (const ring of polygon) {
      ring.forEach(([lon, lat], i) => {
        const x = ((lon + 180) / 360) * width;
        const y = ((90 - lat) / 180) * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
    }
    ctx.fill("evenodd");
  }

  cachedMask = { canvas, data: ctx.getImageData(0, 0, width, height).data, width, height };
  return cachedMask;
}

function isLand(mask: LandMask, lat: number, lon: number) {
  const x = Math.min(mask.width - 1, Math.max(0, Math.floor(((lon + 180) / 360) * mask.width)));
  const y = Math.min(mask.height - 1, Math.max(0, Math.floor(((90 - lat) / 180) * mask.height)));
  return mask.data[(y * mask.width + x) * 4] > 127;
}

/* ------------------------------------------------------------------ */
/* Geometrías del globo                                                */
/* ------------------------------------------------------------------ */

function buildGlobeGeometries() {
  const mask = getLandMask();

  // puntos de tierra sobre una esfera de Fibonacci
  const total = 16000;
  const golden = 2.399963229728653;
  const landPositions: number[] = [];
  for (let i = 0; i < total; i++) {
    const y = 1 - (2 * (i + 0.5)) / total;
    const lat = THREE.MathUtils.radToDeg(Math.asin(y));
    const lon = THREE.MathUtils.radToDeg(((i * golden) % (Math.PI * 2)) - Math.PI);
    if (!isLand(mask, lat, lon)) continue;
    const v = latLonToVec3(lat, lon, RADIUS);
    landPositions.push(v.x, v.y, v.z);
  }
  const land = new THREE.BufferGeometry();
  land.setAttribute("position", new THREE.Float32BufferAttribute(landPositions, 3));

  // ciudades
  const cityPositions: number[] = [];
  CITIES.forEach((c) => {
    const v = latLonToVec3(c.lat, c.lon, RADIUS * 1.003);
    cityPositions.push(v.x, v.y, v.z);
  });
  const cities = new THREE.BufferGeometry();
  cities.setAttribute("position", new THREE.Float32BufferAttribute(cityPositions, 3));

  // rutas: arcos de círculo máximo elevados sobre la superficie
  const SEGMENTS = 72;
  const rng = mulberry32(5);
  const pos: number[] = [];
  const aT: number[] = [];
  const aPhase: number[] = [];
  const aSpeed: number[] = [];

  for (const [i, j] of ROUTES) {
    const a = latLonToVec3(CITIES[i].lat, CITIES[i].lon, 1);
    const b = latLonToVec3(CITIES[j].lat, CITIES[j].lon, 1);
    const omega = Math.acos(THREE.MathUtils.clamp(a.dot(b), -1, 1));
    const sinO = Math.sin(omega);
    const lift = 0.05 + 0.24 * (omega / Math.PI);
    const phase = rng();
    const speed = 0.1 + rng() * 0.1;

    const at = (u: number) => {
      const s1 = Math.sin((1 - u) * omega) / sinO;
      const s2 = Math.sin(u * omega) / sinO;
      return a
        .clone()
        .multiplyScalar(s1)
        .addScaledVector(b, s2)
        .multiplyScalar(RADIUS * (1 + lift * Math.sin(Math.PI * u)));
    };

    for (let k = 0; k < SEGMENTS; k++) {
      const u0 = k / SEGMENTS;
      const u1 = (k + 1) / SEGMENTS;
      const p0 = at(u0);
      const p1 = at(u1);
      pos.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z);
      aT.push(u0, u1);
      aPhase.push(phase, phase);
      aSpeed.push(speed, speed);
    }
  }
  const arcs = new THREE.BufferGeometry();
  arcs.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  arcs.setAttribute("aT", new THREE.Float32BufferAttribute(aT, 1));
  arcs.setAttribute("aPhase", new THREE.Float32BufferAttribute(aPhase, 1));
  arcs.setAttribute("aSpeed", new THREE.Float32BufferAttribute(aSpeed, 1));

  return { land, cities, arcs };
}

/* ------------------------------------------------------------------ */
/* Shaders                                                             */
/* ------------------------------------------------------------------ */

const DOT_VERT = /* glsl */ `
  uniform float uSize;
  uniform float uPixelRatio;
  varying float vFacing;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normalize(position));
    float facing = dot(n, normalize(-mv.xyz));
    vFacing = mix(0.08, 1.0, smoothstep(-0.05, 0.45, facing));
    gl_PointSize = uSize * uPixelRatio / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const DOT_FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying float vFacing;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.32, d);
    gl_FragColor = vec4(uColor, a * vFacing);
    #include <colorspace_fragment>
  }
`;

const OCEAN_VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  varying vec2 vUv;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    vUv = uv;
    gl_Position = projectionMatrix * mv;
  }
`;

const OCEAN_FRAG = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uRim;
  uniform vec3 uLand;
  uniform sampler2D uLandMap;
  varying vec3 vN;
  varying vec3 vV;
  varying vec2 vUv;
  void main() {
    float land = texture2D(uLandMap, vec2(fract(vUv.x + 0.5), vUv.y)).r;
    float f = pow(1.0 - clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), 2.6);
    vec3 surface = mix(uBase, uLand, smoothstep(0.35, 0.65, land));
    gl_FragColor = vec4(mix(surface, uRim, f * 0.18), 0.98);
    #include <colorspace_fragment>
  }
`;

const ARC_VERT = /* glsl */ `
  attribute float aT;
  attribute float aPhase;
  attribute float aSpeed;
  varying float vT;
  varying float vPhase;
  varying float vSpeed;
  void main() {
    vT = aT;
    vPhase = aPhase;
    vSpeed = aSpeed;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ARC_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying float vT;
  varying float vPhase;
  varying float vSpeed;
  void main() {
    float head = fract(uTime * vSpeed + vPhase);
    float behind = mod(head - vT + 1.0, 1.0);
    float comet = exp(-behind * 8.0);
    float alpha = 0.1 + 0.9 * comet;
    gl_FragColor = vec4(uColor, alpha);
    #include <colorspace_fragment>
  }
`;

function createDotMaterial(color: THREE.Color) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: color },
      uSize: { value: 16 },
      uPixelRatio: { value: 1 },
    },
    vertexShader: DOT_VERT,
    fragmentShader: DOT_FRAG,
    transparent: true,
    depthWrite: false,
  });
}

/* ------------------------------------------------------------------ */
/* Escena                                                              */
/* ------------------------------------------------------------------ */

function usePointer() {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onBlur = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", onBlur);
    };
  }, []);
  return pointer;
}

function Globe({ brand }: { brand: THREE.Color }) {
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const pointer = usePointer();

  const geometries = useMemo(() => buildGlobeGeometries(), []);
  const landTexture = useMemo(() => {
    const texture = new THREE.CanvasTexture(getLandMask().canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
  const landMaterial = useMemo(() => createDotMaterial(brand), [brand]);
  const cityMaterial = useMemo(() => createDotMaterial(new THREE.Color("#ffffff")), []);
  const oceanMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uBase: { value: new THREE.Color("#07111b") },
          uRim: { value: brand.clone() },
          uLand: { value: brand.clone().multiplyScalar(0.72) },
          uLandMap: { value: landTexture },
        },
        vertexShader: OCEAN_VERT,
        fragmentShader: OCEAN_FRAG,
        transparent: true,
        depthWrite: false,
      }),
    [brand, landTexture],
  );
  const arcMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uColor: { value: brand.clone().lerp(new THREE.Color("#ffffff"), 0.35) } },
        vertexShader: ARC_VERT,
        fragmentShader: ARC_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [brand],
  );

  const frameMaterials = useRef<{
    land: THREE.ShaderMaterial;
    cities: THREE.ShaderMaterial;
    arcs: THREE.ShaderMaterial;
  } | null>(null);

  useEffect(() => {
    const materials = { land: landMaterial, cities: cityMaterial, arcs: arcMaterial };
    frameMaterials.current = materials;

    return () => {
    if (frameMaterials.current === materials) frameMaterials.current = null;
    geometries.land.dispose();
    geometries.cities.dispose();
    geometries.arcs.dispose();
    landMaterial.dispose();
    cityMaterial.dispose();
    oceanMaterial.dispose();
    arcMaterial.dispose();
    landTexture.dispose();
    };
  }, [geometries, landMaterial, cityMaterial, oceanMaterial, arcMaterial, landTexture]);

  useFrame((state, delta) => {
    if (!tilt.current || !spin.current) return;

    const materials = frameMaterials.current;
    if (materials) {
      spin.current.rotation.y += delta * 0.07;
      materials.arcs.uniforms.uTime.value = state.clock.elapsedTime;

      const heightScale = state.size.height / 600;
      const dpr = state.viewport.dpr;
      materials.land.uniforms.uSize.value = heightScale * 21;
      materials.land.uniforms.uPixelRatio.value = dpr;
      materials.cities.uniforms.uSize.value = heightScale * 50;
      materials.cities.uniforms.uPixelRatio.value = dpr;
    }

    const targetX = 0.28 + pointer.current.y * 0.1;
    const targetZ = 0.18 - pointer.current.x * 0.08;
    tilt.current.rotation.x = THREE.MathUtils.damp(tilt.current.rotation.x, targetX, 3, delta);
    tilt.current.rotation.z = THREE.MathUtils.damp(tilt.current.rotation.z, targetZ, 3, delta);
  });

  return (
    <group ref={tilt} rotation={[0.28, 0, 0.18]}>
      <group ref={spin} rotation={[0, -1.0, 0]}>
        <mesh renderOrder={-1}>
          <sphereGeometry args={[RADIUS * 0.985, 64, 64]} />
          <primitive object={oceanMaterial} attach="material" />
        </mesh>
        <points geometry={geometries.land} material={landMaterial} />
        <points geometry={geometries.cities} material={cityMaterial} />
        <lineSegments geometry={geometries.arcs} material={arcMaterial} />
      </group>
      <mesh scale={1.13}>
        <sphereGeometry args={[RADIUS, 48, 48]} />
        <meshBasicMaterial
          color={brand}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function OrbitRing({
  radius,
  tilt,
  speed,
  brand,
}: {
  radius: number;
  tilt: [number, number, number];
  speed: number;
  brand: THREE.Color;
}) {
  const satellite = useRef<THREE.Group>(null);

  const ring = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 200; i++) {
      const a = (i / 200) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: brand, transparent: true, opacity: 0.28 });
    return new THREE.Line(geometry, material);
  }, [radius, brand]);

  useEffect(
    () => () => {
      ring.geometry.dispose();
      (ring.material as THREE.Material).dispose();
    },
    [ring],
  );

  useFrame((_, delta) => {
    if (satellite.current) satellite.current.rotation.y += delta * speed;
  });

  return (
    <group rotation={tilt}>
      <primitive object={ring} />
      <group ref={satellite}>
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshBasicMaterial color={brand} transparent opacity={0.25} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

function Stars() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const rng = mulberry32(7);
    const arr = new Float32Array(600 * 3);
    for (let i = 0; i < 600; i++) {
      const u = rng() * 2 - 1;
      const t = rng() * Math.PI * 2;
      const r = 7 + rng() * 5;
      const s = Math.sqrt(1 - u * u);
      arr.set([r * s * Math.cos(t), r * u, r * s * Math.sin(t)], i * 3);
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.008;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#ffffff" transparent opacity={0.65} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function World({ brand }: { brand: THREE.Color }) {
  const viewportWidth = useThree((state) => state.viewport.width);
  const scale = Math.min(1, viewportWidth / 6.2);

  return (
    <group scale={scale}>
      <Globe brand={brand} />
      <OrbitRing radius={2.35} tilt={[1.15, 0, 0.5]} speed={0.35} brand={brand} />
      <OrbitRing radius={2.65} tilt={[0.35, 0, -0.75]} speed={-0.22} brand={brand} />
    </group>
  );
}

export default function HeroWorldScene2({
  brand = "#3ddc97",
  paused = false,
  reducedMotion = false,
}: {
  brand?: string;
  paused?: boolean;
  reducedMotion?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contextLossCleanupRef = useRef<(() => void) | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );
  const pageVisible = useSyncExternalStore(
    subscribeToPageVisibility,
    getPageVisibilitySnapshot,
    () => true,
  );
  const brandColor = useMemo(() => new THREE.Color(brand), [brand]);
  const showPoster = reducedMotion || prefersReducedMotion || webglFailed;

  const handleCreated = useCallback(({ gl }: RootState) => {
    const canvas = gl.domElement;
    contextLossCleanupRef.current?.();
    const handleContextLost = (event: Event) => {
    event.preventDefault();
    setWebglFailed(true);
    };
    canvas.addEventListener("webglcontextlost", handleContextLost);
    contextLossCleanupRef.current = () => {
    canvas.removeEventListener("webglcontextlost", handleContextLost);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    let observer: IntersectionObserver | null = null;
    if (container && typeof IntersectionObserver !== "undefined") {
    observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsVisible(visible);
        if (visible) setHasBeenVisible(true);
      },
      { rootMargin: "120px" },
    );
    observer.observe(container);
    }

    return () => {
    observer?.disconnect();
    contextLossCleanupRef.current?.();
    contextLossCleanupRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative mt-6 h-64 w-full overflow-hidden rounded-xl bg-[#0a1320] sm:h-80"
      aria-hidden="true"
    >
      {showPoster || !hasBeenVisible ? (
        <StaticWorldPoster />
      ) : (
        <Canvas
          className="h-full w-full"
          dpr={[1, 1.5]}
          camera={{ position: [0, 0.2, 7.2], fov: 38 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          frameloop={paused || !isVisible || !pageVisible ? "never" : "always"}
          fallback={<StaticWorldPoster />}
          onCreated={handleCreated}
        >
          <World brand={brandColor} />
          <Stars />
        </Canvas>
      )}
    </div>
  );
}