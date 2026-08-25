import { Section } from "@/components/ui/section";
import { SplitReveal } from "@/components/motion/reveal";

/**
 * Manifesto — editorial, few words, high impact (brief §5.3). Static in Phase 1;
 * Phase 4 adds the per-character/line reveal and ties the core's first fracture
 * to this section entering view.
 */
export function Manifesto() {
  return (
    <Section id="manifesto" index="01" label="MANIFESTO">
      <div className="max-w-4xl">
        <SplitReveal
          as="p"
          className="text-3xl font-medium leading-[1.08] tracking-tight text-red md:text-5xl lg:text-6xl"
        >
          O comum respeita limites.{" "}
          <span className="glow-red text-white">O nosso transforma impossível em possível.</span>
        </SplitReveal>
        <p className="mt-10 max-w-xl text-base leading-relaxed text-ash md:text-lg">
          Três desenvolvedores obcecados por inovação, criação e avanço. Não seguimos o padrão. A gente cria experiências digitais que conectam estratégia, estética e tecnologia para transformar intenção em presença e presença em crescimento. O que fazemos tem impacto real. Nós somos a <span className="glow-red text-red">DMG</span>.
        </p>
      </div>
    </Section>
  );
}
