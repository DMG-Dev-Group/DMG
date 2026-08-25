"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CorePoster } from "./core-poster";
import { CanvasBoundary } from "./canvas-boundary";

// Heavy WebGL chunk — never in the first load, never on the server (protects LCP).
const CoreCanvas = dynamic(() => import("./core-canvas"), { ssr: false });

/**
 * HeroCore — the core stage. Renders the CSS poster as the base and, only on
 * capable devices, mounts the WebGL canvas (deferred to a dynamic chunk that
 * loads after hydration). The IntersectionObserver pauses the frameloop when the
 * core scrolls out of view. On mobile / save-data / reduced-motion the canvas
 * never mounts: the poster is the experience (brief §4).
 */
export function HeroCore({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [enable3D, setEnable3D] = useState(false);
  const [mounted, setMounted] = useState(false); // capable -> mount the canvas
  const [active, setActive] = useState(true); // in view -> render (default on: hero is above the fold)
  const [ready, setReady] = useState(false); // GL created -> fade the poster out

  // Capability gate.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const narrow = window.matchMedia("(max-width: 768px)").matches;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    const saveData = nav.connection?.saveData === true;
    setEnable3D(!reduce && !saveData && !(coarse && narrow));
  }, []);

  // Mount when capable; observe to pause the frameloop off-screen.
  useEffect(() => {
    if (!enable3D) return;
    setMounted(true);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.05, rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enable3D]);

  return (
    <div
      ref={ref}
      className={cn("relative aspect-square w-full max-w-[540px]", className)}
    >
      <CorePoster
        className={cn(
          "absolute inset-0 h-full w-full max-w-none transition-opacity duration-700",
          ready ? "opacity-0" : "opacity-100",
        )}
      />
      {enable3D && mounted && (
        <div className="absolute inset-0">
          <CanvasBoundary onError={() => setReady(false)}>
            <CoreCanvas active={active} onReady={() => setReady(true)} />
          </CanvasBoundary>
        </div>
      )}
    </div>
  );
}
