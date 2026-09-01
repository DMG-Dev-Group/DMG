"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Shards } from "./shards";

/**
 * ShardsCanvas — the climax stage (default export for dynamic ssr:false).
 * Transparent so the CSS red bloom and glitch text layer through it.
 */
export default function ShardsCanvas({
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
      camera={{ position: [0, 0, 9], fov: 42 }}
      onCreated={() => onReady?.()}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 6]} intensity={30} color="#ff1e1e" distance={22} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} color="#ffffff" />

      <Suspense fallback={null}>
        <Shards />
      </Suspense>

      <EffectComposer>
        <Bloom
          mipmapBlur
          intensity={1.0}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.3}
          radius={0.75}
        />
      </EffectComposer>
    </Canvas>
  );
}
