"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { climaxScroll } from "@/lib/climax-scroll";
import { CanvasBoundary } from "@/components/core/canvas-boundary";
import { HudTag } from "@/components/ui/hud";
import { use3DPermitido } from "@/lib/use-3d-permitido";
import { MagneticButton } from "@/components/ui/magnetic-button";

const ShardsCanvas = dynamic(() => import("@/components/core/shards-canvas"), {
  ssr: false,
});

/**
 * Climax — the "Damage" peak. A tall section with a CSS-sticky stage (NOT a GSAP
 * pin, so it never conflicts with the Projetos pin above it): the core bursts
 * into shards driven by the section's own scroll progress, red bloom swells, and
 * the concept phrase glitches (RGB-split) at the midpoint. On mobile /
 * reduced-motion the shards never mount — the phrase + bloom carry the moment.
 */
export function Climax() {
  const section = useRef<HTMLElement>(null);
  const glitch = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [failed, setFailed] = useState(false);

  const enable3D = use3DPermitido();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onToggle: (self) => {
          if (self.isActive) setMounted(true);
          setActive(self.isActive); // pause the shard render when off-screen
        },
        onUpdate: (self) => {
          climaxScroll.progress = self.progress;
          // glitch intensity ramps 0 -> 1 -> 0 across the section
          const g = Math.sin(self.progress * Math.PI);
          glitch.current?.style.setProperty("--g", g.toFixed(3));
        },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} id="climax" className="relative h-[200vh]">
      <div className="sticky top-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-void">
        {/* Swelling red bloom */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[85vw] w-[85vw] max-h-[860px] max-w-[860px] -translate-x-1/2 -translate-y-1/2 bloom-red blur-3xl"
        />

        {/* Shards (capability-gated) */}
        {enable3D && mounted && !failed && (
          <div className="absolute inset-0">
            <CanvasBoundary onError={() => setFailed(true)}>
              <ShardsCanvas active={active} />
            </CanvasBoundary>
          </div>
        )}

        {/* O CTA final do site antigo, com o glitch RGB por cima
            (docs/0001 §5, linha 11): a copy é a de lá, o efeito é daqui. */}
        <div
          ref={glitch}
          className="relative z-10 flex flex-col items-center px-6 text-center"
        >
          <HudTag className="mb-6">[ controlled damage ]</HudTag>
          <h2
            className="glitch-text text-5xl font-bold leading-[0.95] tracking-tight text-bone md:text-8xl"
            data-text="Pronto para causar dano?"
          >
            Pronto para causar <span className="text-red">dano?</span>
          </h2>
          <p className="mt-7 max-w-md text-base leading-relaxed text-ash md:text-lg">
            Vamos conversar sobre seu próximo projeto. Sem enrolação — direto
            ao ponto.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton href="#servicos" variant="primary">
              Iniciar projeto →
            </MagneticButton>
            <MagneticButton href="#projetos" variant="ghost">
              Ver portfólio
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}
