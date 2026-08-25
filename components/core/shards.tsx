"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { climaxScroll } from "@/lib/climax-scroll";

const COUNT = 90;

/**
 * Shards — the core shattering. An InstancedMesh of faceted fragments that start
 * clustered (the intact core) and blast outward + tumble as the climax scroll
 * progresses, glowing hotter in red (Bloom lights them). Reads the shared
 * climaxScroll store each frame; no React re-render.
 */
export function Shards() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);

  const data = useMemo(
    () =>
      Array.from({ length: COUNT }, () => {
        const dir = new THREE.Vector3().randomDirection();
        return {
          dir,
          start: dir.clone().multiplyScalar(0.3 + Math.random() * 0.5),
          spread: 4 + Math.random() * 7,
          rotAxis: new THREE.Vector3().randomDirection(),
          rotSpeed: (Math.random() * 2 - 1) * 3,
          scale: 0.18 + Math.random() * 0.3,
          phase: Math.random() * Math.PI * 2,
        };
      }),
    [],
  );

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
