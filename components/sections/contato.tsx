import { MagneticButton } from "@/components/ui/magnetic-button";
import { HudTag } from "@/components/ui/hud";
import { SplitReveal } from "@/components/motion/reveal";

/**
 * Contato — the closing CTA. The core is (conceptually) recomposed and calm; a
 * red bloom breathes behind. Honest CTA: opens the user's mail client (no fake
 * form submission).
 */
export function Contato() {
  return (
    <section id="contato" className="relative overflow-hidden py-32 md:py-48">
      {/* Breathing red bloom */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[90vw] w-[90vw] max-h-[820px] max-w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] motion-safe:animate-[dmg-pulse_6s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,30,30,0.30), rgba(120,12,18,0.10) 45%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto flex max-w-[1400px] flex-col items-center px-6 text-center md:px-10">
        <HudTag className="mb-8">[ contato ]</HudTag>
        <SplitReveal
          as="h2"
          className="max-w-4xl text-balance text-5xl font-bold leading-[0.98] tracking-tight text-bone md:text-7xl lg:text-8xl"
        >
          Vamos construir algo de{" "}
          <span className="glow-red text-white">alto nível.</span>
        </SplitReveal>
        <p className="mt-8 max-w-md text-base leading-relaxed text-ash md:text-lg">
          Conta o que você tem em mente. A gente responde rápido e sem enrolação.
        </p>

        <div className="mt-12">
          <MagneticButton
            href="mailto:dmggroupdev@gmail.com?subject=Projeto%20com%20a%20DMG"
            variant="primary"
          >
            Iniciar conversa
          </MagneticButton>
        </div>

        <a
          href="mailto:dmggroupdev@gmail.com"
          className="mt-8 font-mono text-sm tracking-wide text-ash transition-colors hover:text-bone"
        >
          dmggroupdev@gmail.com
        </a>
      </div>
    </section>
  );
}
