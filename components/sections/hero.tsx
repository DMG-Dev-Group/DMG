import { ArrowDown } from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { HudTag } from "@/components/ui/hud";
import { HeroGrid } from "@/components/core/hero-grid";

/**
 * Hero — portado do site antigo sem mexer na copy nem no efeito
 * (docs/0001 §5, linha 3). O grid de lajes com a luz vermelha por baixo é a
 * assinatura da DMG e continua sendo canvas 2D: o cristal 3D do DMG-DEF foi
 * deslocado para o CTA final, onde o peso do WebGL se justifica.
 *
 * Números das stats e copy: `legacy/damage_group_landing.html`, linhas 29-61.
 */

// "12+ projetos entregues" saiu por decisão da DMG. Número que envelhece e
// que ninguém confere só enfraquece os outros dois.
const STATS = [
  { numero: "100%", rotulo: "Foco em resultados" },
  { numero: "∞", rotulo: "Possibilidades de inovação" },
];

export function Hero() {
  return (
    <section id="top" className="relative min-h-[88vh] overflow-hidden">
      <HeroGrid className="absolute inset-0 h-full w-full" />

      {/* Anotações HUD */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 mx-auto max-w-[1400px]"
      >
        <HudTag className="absolute left-6 top-[92px] md:left-10">
          {"// damage.group"}
        </HudTag>
        <HudTag className="absolute bottom-10 left-6 md:left-10">
          DMG GROUP • SINCE 2026
        </HudTag>
      </div>

      <div className="relative z-20 mx-auto flex min-h-[88vh] max-w-[1400px] flex-col justify-center px-6 pb-16 pt-[104px] md:px-10">
        <h1 className="max-w-[800px] text-[clamp(48px,7vw,96px)] font-bold leading-[0.92] tracking-[-0.03em] text-bone">
          Código que
          <span className="block text-red">causa impacto.</span>
        </h1>

        <p className="mt-7 max-w-[480px] text-base leading-[1.7] text-ash">
          Desenvolvemos software que vai além do funcional — construímos
          sistemas robustos, escaláveis e difíceis de ignorar.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <MagneticButton href="#projetos" variant="primary">
            Ver nosso trabalho →
          </MagneticButton>
          <MagneticButton href="#stack" variant="ghost">
            Nossa stack
          </MagneticButton>
        </div>

        <dl className="mt-16 flex flex-wrap gap-12 border-t border-hairline pt-10">
          {STATS.map((s) => (
            <div key={s.rotulo}>
              <dt className="sr-only">{s.rotulo}</dt>
              <dd>
                <span className="block font-mono text-[32px] font-bold leading-none text-bone">
                  {s.numero}
                </span>
                <span className="mt-1.5 block text-xs tracking-[0.04em] text-ash">
                  {s.rotulo}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <a
        href="#sobre"
        aria-label="Rolar para a próxima seção"
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
