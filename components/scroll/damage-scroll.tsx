"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { damage } from "@/lib/damage";

/**
 * DamageScroll — maps scroll to the core's fracture. As the hero scrolls away
 * the crystal cracks (0 -> ~0.8). Scrubbed with inertia; skipped under reduced
 * motion (the 3D core doesn't mount there anyway). Phase 4 extends this into the
 * full intact -> shatter -> recompose narrative across the page.
 */
export function DamageScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.to(damage, {
        fracture: 0.8,
        ease: "none",
        scrollTrigger: {
          trigger: "#top",
          start: "top top",
          end: "+=120%",
          scrub: 1,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
