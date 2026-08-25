import { ArrowUpRight, ArrowDown } from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { HudTag } from "@/components/ui/hud";
import { HeroCore } from "@/components/core/hero-core";

/**
 * Hero — the core stage + the value prop. Phase 2 mounts the WebGL canvas over
 * the CorePoster (same footprint, no layout shift). Headline is split into lines
 * so Phase 4 can drive a per-line SplitText reveal.
 */
export function Hero() {
  return (
    <section id="top" className="relative min-h-[100dvh] overflow-hidden">
      {/* Core stage — CSS poster + capability-gated WebGL overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center md:justify-end md:pr-[5vw]">
        <HeroCore className="opacity-35 md:opacity-95" />
      </div>

      {/* HUD corner annotations */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 mx-auto max-w-[1400px]"
      >
        <HudTag className="absolute left-6 top-[92px] md:left-10">
          // damage.group
        </HudTag>
        <HudTag className="absolute bottom-10 left-6 md:left-10">
          DMG GROUP • SINCE 2026
        </HudTag>
      </div>

      {/* Content */}
      <div className="relative z-20 mx-auto flex min-h-[100dvh] max-w-[1400px] flex-col justify-center px-6 pt-[72px] md:px-10">
        <div className="max-w-2xl">

          <h1 className="text-5xl font-bold leading-[0.95] tracking-tight text-bone sm:text-6xl md:text-7xl lg:text-[7rem]">
            <span className="block">Nós construímos.</span>
            <span className="block">
              <span className="text-ash">E quebramos </span>
              <span className="glow-red text-red">o padrão.</span>
            </span>
          </h1>

          <p className="mt-8 max-w-md text-base leading-relaxed text-ash md:text-lg">
            Inovações que quebram expectativas. Para quem tem impeto de enxerga o impossível, possível.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <MagneticButton href="#contato" variant="primary">
              Iniciar projeto
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
            </MagneticButton>
            <MagneticButton href="#projetos" variant="ghost">
              Ver projetos
            </MagneticButton>
          </div>
        </div>
      </div>

      {/* Single scroll cue (explicit brief request) */}
      <a
        href="#manifesto"
        aria-label="Rolar para o manifesto"
        className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="hud">role</span>
        <ArrowDown
          className="h-4 w-4 text-red motion-safe:animate-bounce"
          strokeWidth={1.5}
        />
      </a>
    </section>
  );
}
