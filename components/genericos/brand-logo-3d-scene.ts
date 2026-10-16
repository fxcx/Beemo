import * as THREE from "three";
import type {
  BrandLogo3DScene,
  TesseractEdge,
  TesseractVertex,
} from "./brand-logo.types";

const W_DISTANCE = 3.2;
const SCALE = 2;

const VERTICES: TesseractVertex[] = Array.from({ length: 16 }, (_, index) => [
  index & 1 ? 1 : -1,
  index & 2 ? 1 : -1,
  index & 4 ? 1 : -1,
  index & 8 ? 1 : -1,
]);

const EDGES: TesseractEdge[] = [];

for (let index = 0; index < VERTICES.length; index++) {
  for (let bit = 0; bit < 4; bit++) {
    const neighbor = index ^ (1 << bit);
    if (neighbor > index) EDGES.push([index, neighbor]);
  }
}

function createIsometricPose(): THREE.Quaternion {
  const rotation = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(1, 1, 1).normalize(),
    new THREE.Vector3(0, 0, 1),
  );
  const top = new THREE.Vector3(1, 1, -1).applyQuaternion(rotation);
  const roll = Math.PI / 2 - Math.atan2(top.y, top.x);
  const rollRotation = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0, 0, 1),
    roll,
  );

  return rollRotation.multiply(rotation);
}

export function createBrandLogo3DScene(
  mount: HTMLDivElement,
  size: number,
  inverted: boolean,
): BrandLogo3DScene {
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
  const fieldOfView = 10;
  const radius = 2.35;
  const camera = new THREE.PerspectiveCamera(fieldOfView, 1, 1, 100);
  camera.position.z =
    (radius * 1.15) / Math.tan(THREE.MathUtils.degToRad(fieldOfView / 2));

  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f99, 1.1));

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(3, 5, 8);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 1);
  rimLight.position.set(-6, -2, -4);
  scene.add(rimLight);

  const material = new THREE.MeshStandardMaterial({
    color: inverted ? 0xf5f6f8 : 0x0b0b0c,
    roughness: 0.35,
    metalness: 0.15,
  });
  const edgeGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1, 10);
  const nodeGeometry = new THREE.SphereGeometry(0.085, 20, 14);
  const tesseract = new THREE.Group();
  const edgeMeshes = EDGES.map(() => {
    const mesh = new THREE.Mesh(edgeGeometry, material);
    tesseract.add(mesh);
    return mesh;
  });
  const nodeMeshes = VERTICES.map(() => {
    const mesh = new THREE.Mesh(nodeGeometry, material);
    tesseract.add(mesh);
    return mesh;
  });

  const poseGroup = new THREE.Group();
  poseGroup.quaternion.copy(createIsometricPose());
  poseGroup.add(tesseract);

  const spinGroup = new THREE.Group();
  spinGroup.add(poseGroup);

  const tiltGroup = new THREE.Group();
  tiltGroup.add(spinGroup);
  scene.add(tiltGroup);

  const points = VERTICES.map(() => new THREE.Vector3());
  const perspectiveFactors = new Array<number>(VERTICES.length).fill(1);
  const yAxis = new THREE.Vector3(0, 1, 0);
  const direction = new THREE.Vector3();
  const midpoint = new THREE.Vector3();
  const referenceFactor = SCALE / W_DISTANCE;

  const project = (phaseXW: number, phaseZW: number) => {
    const cosXW = Math.cos(phaseXW);
    const sinXW = Math.sin(phaseXW);
    const cosZW = Math.cos(phaseZW);
    const sinZW = Math.sin(phaseZW);

    for (let index = 0; index < VERTICES.length; index++) {
      const [x0, y, z0, w0] = VERTICES[index];
      const x = x0 * cosXW - w0 * sinXW;
      const w1 = x0 * sinXW + w0 * cosXW;
      const z = z0 * cosZW - w1 * sinZW;
      const w = z0 * sinZW + w1 * cosZW;
      const factor = SCALE / (W_DISTANCE - w);

      points[index].set(x * factor, y * factor, z * factor);
      perspectiveFactors[index] = factor;
    }

    EDGES.forEach(([start, end], index) => {
      const startPoint = points[start];
      const endPoint = points[end];
      direction.subVectors(endPoint, startPoint);
      const length = direction.length();
      midpoint.addVectors(startPoint, endPoint).multiplyScalar(0.5);

      const mesh = edgeMeshes[index];
      mesh.position.copy(midpoint);
      mesh.quaternion.setFromUnitVectors(yAxis, direction.divideScalar(length || 1));

      const thickness =
        (0.5 * (perspectiveFactors[start] + perspectiveFactors[end])) /
        referenceFactor;
      mesh.scale.set(thickness, length, thickness);
    });

    nodeMeshes.forEach((mesh, index) => {
      mesh.position.copy(points[index]);
      mesh.scale.setScalar(perspectiveFactors[index] / referenceFactor);
    });
  };

  return {
    render(projectionPhase, spinPhase, tiltX, tiltY) {
      project(projectionPhase, projectionPhase * 0.62 + 0.8);
      spinGroup.rotation.set(spinPhase * 0.72, spinPhase, spinPhase * 0.2);
      tiltGroup.rotation.set(tiltY * 0.3, tiltX * 0.4, 0);
      renderer.render(scene, camera);
    },
    dispose() {
      edgeGeometry.dispose();
      nodeGeometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    },
  };
}
