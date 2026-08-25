"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { crystalVertex, crystalFragment } from "@/lib/shaders/crystal-shader";
import { damage } from "@/lib/damage";

/**
 * Crystal — the DMG core. A faceted glass shell driven by a custom damage shader
 * (fracture displacement + dissolve + incandescent crack veins) wrapping a bright
 * inner core that blooms. Idle spin on Y; tilts + drifts toward the pointer.
 * Fracture progress comes from the scroll-driven `damage` store.
 */
export function Crystal() {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const core = useRef<THREE.Mesh>(null);
  const pointer = useRef({ x: 0, y: 0 });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFracture: { value: 0 },
      uMouseDir: { value: new THREE.Vector3(0, 0, 1) },
      uColorDark: { value: new THREE.Color("#0e0e13") },
      uColorRed: { value: new THREE.Color("#ff1e1e") },
    }),
    [],
  );

  // Non-indexed + recomputed normals => every triangle carries its own face
  // normal, so the crystal reads as sharply faceted cut glass, not a smooth ball.
  const geometry = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 1).toNonIndexed();
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = pointer.current;
    const g = group.current;

    if (g) {
      g.rotation.y += delta * 0.12;
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, p.y * 0.28, 3, delta);
      g.rotation.z = THREE.MathUtils.damp(g.rotation.z, -p.x * 0.12, 3, delta);
      g.position.x = THREE.MathUtils.damp(g.position.x, p.x * 0.18, 3, delta);
      g.position.y = THREE.MathUtils.damp(
        g.position.y,
        -p.y * 0.14 + Math.sin(t * 0.8) * 0.06,
        3,
        delta,
      );
    }

    if (mat.current) {
      const u = mat.current.uniforms;
      u.uTime.value = t;
      u.uFracture.value = damage.fracture;
      (u.uMouseDir.value as THREE.Vector3).set(p.x, -p.y, 0.85).normalize();
    }

    if (core.current) {
      const m = core.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 2.3 + Math.sin(t * 2.1) * 0.7 + damage.fracture * 1.6;
    }
  });

  return (
    <group ref={group} scale={1.35}>
      {/* Outer faceted shell — the damage shader */}
      <mesh geometry={geometry}>
        <shaderMaterial
          ref={mat}
          uniforms={uniforms}
          vertexShader={crystalVertex}
          fragmentShader={crystalFragment}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner incandescent core — revealed as the shell dissolves */}
      <mesh ref={core} scale={0.5}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#ff1e1e"
          emissive="#ff1e1e"
          emissiveIntensity={2.3}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
