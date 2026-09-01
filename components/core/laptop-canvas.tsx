"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { Laptop } from "./laptop";

/**
 * LaptopCanvas — the Projetos stage (default export for dynamic ssr:false).
 * Separate from the hero core canvas; mounts only when the section is capable
 * and in view. ContactShadows grounds the spinning laptop to the "floor".
 */
export default function LaptopCanvas({
  active = true,
  onReady,
}: {
  active?: boolean;
  onReady?: () => void;
}) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.5, 7.4], fov: 34 }}
      onCreated={() => onReady?.()}
    >
      {/* Opaque void — matches the page, so the stage is never a white gap */}
      <color attach="background" args={["#050506"]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 4]} intensity={2} color="#ffffff" />
      <pointLight position={[-4, 1, 3]} intensity={15} color="#ff1e1e" distance={18} />

      <Suspense fallback={null}>
        <Laptop />
      </Suspense>

      <ContactShadows
        position={[0, -1.9, 0]}
        opacity={0.6}
        scale={12}
        blur={2.6}
        far={4}
        color="#000000"
      />
    </Canvas>
  );
}
