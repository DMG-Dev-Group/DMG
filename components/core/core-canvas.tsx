"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Crystal } from "./crystal";

/**
 * CoreCanvas — the WebGL stage (default export for dynamic ssr:false import).
 * DPR capped; frameloop pauses ("never") when the core scrolls out of view.
 * (RGB-split / glitch post FX are added, version-correct, in the Phase 5 climax.)
 */
export default function CoreCanvas({
  active,
  onReady,
}: {
  active: boolean;
  onReady?: () => void;
}) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 0, 5], fov: 38 }}
      onCreated={() => onReady?.()}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 6, 4]} intensity={2.1} color="#cfd6ff" />
      <pointLight position={[-4, -1, 3]} intensity={45} color="#ff1e1e" distance={16} />
      <pointLight position={[0, 2, -5]} intensity={18} color="#ffffff" distance={16} />

      <Suspense fallback={null}>
        <Crystal />
      </Suspense>

      <EffectComposer>
        <Bloom
          mipmapBlur
          intensity={0.8}
          luminanceThreshold={0.62}
          luminanceSmoothing={0.3}
          radius={0.65}
        />
      </EffectComposer>
    </Canvas>
  );
}
