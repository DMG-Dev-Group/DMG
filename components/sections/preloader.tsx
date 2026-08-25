"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

/**
 * Preloader — black screen, mono counter 000 -> 100, then a wipe reveal.
 * Fail-safe by design: a hard timeout always clears it, so a GSAP hiccup can
 * never leave the site covered. Skipped entirely under reduced motion.
 */
export function Preloader() {
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }

    // Safety net: never let the overlay outlive this, whatever happens.
    const failsafe = window.setTimeout(() => setDone(true), 3200);

    const counter = { v: 0 };
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: () => setDone(true) });
      tl.to(counter, {
        v: 100,
        duration: 1.2,
        ease: "power2.inOut",
        onUpdate: () => {
          const v = Math.round(counter.v);
          if (count.current) count.current.textContent = String(v).padStart(3, "0");
          if (bar.current) bar.current.style.transform = `scaleX(${v / 100})`;
        },
      }).to(root.current, {
        yPercent: -100,
        duration: 0.9,
        ease: "power4.inOut",
      }, "+=0.12");
    }, root);

    return () => {
      window.clearTimeout(failsafe);
      ctx.revert();
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={root}
      aria-hidden
      className="fixed inset-0 z-[200] flex flex-col justify-end bg-void px-6 pb-10 md:px-10"
    >
      <div className="flex items-end justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-bone">DMG</span>
          <span className="mt-1 h-1.5 w-1.5 bg-red shadow-[0_0_10px_var(--color-red-glow)]" />
        </div>
        <span
          ref={count}
          className="font-mono text-5xl leading-none tracking-tight text-bone md:text-7xl"
        >
          000
        </span>
      </div>
      {/* Load bar */}
      <div className="mt-6 h-px w-full bg-hairline">
        <span
          ref={bar}
          className="block h-px w-full origin-left scale-x-0 bg-red shadow-[0_0_12px_var(--color-red-glow)]"
        />
      </div>
    </div>
  );
}
