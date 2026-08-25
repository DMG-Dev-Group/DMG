"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * SmoothScroll — Lenis inertial scroll synced to the GSAP ticker so ScrollTrigger
 * stays in lockstep with the smoothed scroll position. Disabled entirely under
 * prefers-reduced-motion (native scroll, no hijack).
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    // Recalculate every trigger's start/end AFTER the layout settles — the
    // Projetos pin injects a huge spacer and the sections' triggers (climax etc.)
    // must recompute against it, or their scroll ranges land in the wrong place.
    const refresh = () => ScrollTrigger.refresh();
    const t1 = window.setTimeout(refresh, 400);
    const t2 = window.setTimeout(refresh, 1200);
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  return null;
}
