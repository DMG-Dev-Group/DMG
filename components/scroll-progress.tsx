"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * ScrollProgress — a thin red line at the very top that fills as you scroll the
 * page. Driven by ScrollTrigger writing scaleX straight to the element (no React
 * state per frame). Hidden under reduced motion (a progress bar isn't essential).
 */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
      },
    });
    return () => st.kill();
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px]"
    >
      <div
        ref={bar}
        className="h-full w-full origin-left scale-x-0 bg-red shadow-[0_0_8px_var(--color-red-glow)]"
      />
    </div>
  );
}
