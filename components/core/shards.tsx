"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { climaxScroll } from "@/lib/climax-scroll";

const COUNT = 90;

/**
 * PRNG determinístico (mulberry32). Os cacos precisam parecer aleatórios, não
 * *ser* aleatórios: com `Math.random()` no corpo do componente, cada re-render
 * podia redistribuir os 90 fragmentos no meio da animação. Semeado pelo índice,
 * o resultado é idêntico a cada execução — e o cálculo vira função pura, que
 * pode viver fora do render.
 */
function rng(semente: number) {
  let s = semente;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Direção uniforme na esfera — sem isso os cacos se acumulam nos polos. */
function direcaoNaEsfera(r: () => number) {
  const z = r() * 2 - 1;
  const phi = r() * Math.PI * 2;
  const raio = Math.sqrt(1 - z * z);
  return new THREE.Vector3(raio * Math.cos(phi), raio * Math.sin(phi), z);
}

// Calculado uma vez, na carga do módulo: é constante do projeto, não estado.
const CACOS = Array.from({ length: COUNT }, (_, i) => {
  const r = rng(i * 2654435761);
  const dir = direcaoNaEsfera(r);
  return {
    dir,
    start: dir.clone().multiplyScalar(0.3 + r() * 0.5),
    spread: 4 + r() * 7,
    rotAxis: direcaoNaEsfera(r),
    rotSpeed: (r() * 2 - 1) * 3,
    scale: 0.18 + r() * 0.3,
    phase: r() * Math.PI * 2,
  };
});

/**
 * Shards — the core shattering. An InstancedMesh of faceted fragments that start
 * clustered (the intact core) and blast outward + tumble as the climax scroll
 * progresses, glowing hotter in red (Bloom lights them). Reads the shared
 * climaxScroll store each frame; no React re-render.
 */
export function Shards() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);

  const data = CACOS;

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const v = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const p = climaxScroll.progress;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < COUNT; i++) {
      const d = data[i];
      v.copy(d.dir).multiplyScalar(p * d.spread);
      dummy.position.copy(d.start).add(v);
      q.setFromAxisAngle(d.rotAxis, d.phase + t * d.rotSpeed * 0.25 + p * 5);
      dummy.quaternion.copy(q);
      dummy.scale.setScalar(Math.max(0.02, d.scale * (1 - p * 0.35)));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;

    if (mat.current) mat.current.emissiveIntensity = 0.4 + p * 2.6;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]}>
      <tetrahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        ref={mat}
        color="#0e0e12"
        metalness={0.45}
        roughness={0.3}
        emissive="#ff1e1e"
        emissiveIntensity={0.4}
        flatShading
      />
    </instancedMesh>
  );
}
