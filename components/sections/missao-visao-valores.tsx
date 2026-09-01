import { Section } from "@/components/ui/section";
import { Reveal, SplitReveal } from "@/components/motion/reveal";

/**
 * Sobre — Missão, Visão, Valores e Objetivo. Seção nova (docs/0001 §5, linha 4).
 *
 * O texto é o rascunho aprovado pela DMG e está sujeito a revisão: mora todo
 * aqui, em constantes, justamente para que reescrever uma frase não exija
 * mexer em layout.
 *
 * Layout editorial de propósito — missão e visão como declarações grandes,
 * valores como lista numerada, objetivo fechando a seção. É a única parte do
 * site em que a DMG fala de si em primeira pessoa; densidade de texto aqui é
 * feature, não bug.
 */

const MISSAO =
  "Transformar ideias em software que funciona de verdade: sistemas, produtos e soluções que resolvem problemas reais, sem meio-termo entre ambição e execução.";

// Quebrado em três para destacar o miolo da frase sem enterrar texto no JSX.
const VISAO = {
  antes: "Ser reconhecida como uma das ",
  destaque: "principais desenvolvedoras de software e tecnologia do país",
  depois:
    ", referência em qualidade técnica, entre as empresas que constroem produtos próprios e atendem clientes que exigem alto padrão.",
};

const VALORES = [
  {
    titulo: "Excelência técnica sem atalho",
    texto: "Cada linha de código e cada decisão de arquitetura importa.",
  },
  {
    titulo: "Responsabilidade total",
    texto:
      "Não terceirizamos o resultado. O problema do cliente é o nosso problema.",
  },
  {
    titulo: "Inovação constante",
    texto: "Buscamos o que ainda não foi feito.",
  },
  {
    titulo: "Transparência",
    texto: "Preço, prazo e escopo claros, sem letra miúda.",
  },
  {
    titulo: "Marca forte",
    texto: "O mesmo padrão do primeiro projeto ao centésimo.",
  },
];

const OBJETIVO =
  "Consolidar a DMG como uma empresa sólida e financeiramente independente, combinando prestação de serviço de alto nível com o desenvolvimento de produtos próprios, construindo uma marca que ultrapassa qualquer projeto individual.";

export function MissaoVisaoValores() {
  return (
    <Section id="sobre" index="01" label="SOBRE">
      {/* Missão — a declaração de abertura, no maior corpo da seção. */}
      <div className="max-w-4xl">
        <p className="hud mb-6">missão</p>
        <SplitReveal
          as="p"
          className="text-3xl font-medium leading-[1.12] tracking-tight text-bone md:text-4xl lg:text-5xl"
        >
          {MISSAO}
        </SplitReveal>
      </div>

      {/* Visão */}
      <div className="mt-24 grid gap-10 border-t border-hairline pt-14 md:mt-32 md:grid-cols-[minmax(0,180px)_1fr] md:gap-16">
        <p className="hud md:pt-2">visão</p>
        <p className="max-w-3xl text-xl leading-relaxed text-ash md:text-2xl">
          {VISAO.antes}
          <span className="text-bone">{VISAO.destaque}</span>
          {VISAO.depois}
        </p>
      </div>

      {/* Valores — numerados, para lerem como um compromisso e não como bullets */}
      <div className="mt-24 border-t border-hairline pt-14 md:mt-32">
        <div className="grid gap-10 md:grid-cols-[minmax(0,180px)_1fr] md:gap-16">
          <p className="hud md:pt-2">valores</p>
          <Reveal selector=".valor" className="grid gap-px bg-hairline">
            {VALORES.map((valor, i) => (
              <div
                key={valor.titulo}
                className="valor group grid gap-2 bg-void py-7 md:grid-cols-[64px_minmax(0,320px)_1fr] md:items-baseline md:gap-8"
              >
                <span className="font-mono text-[11px] tracking-[0.22em] text-red">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-medium tracking-tight text-bone md:text-xl">
                  {valor.titulo}
                </h3>
                <p className="text-base leading-relaxed text-ash">
                  {valor.texto}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>

      {/* Objetivo — fecha a seção com o horizonte de negócio. */}
      <div className="relative mt-24 overflow-hidden rounded-[12px] border border-hairline bg-carbon p-8 md:mt-32 md:p-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bloom-red opacity-60 blur-3xl"
        />
        <div className="relative grid gap-8 md:grid-cols-[minmax(0,180px)_1fr] md:gap-16">
          <p className="hud md:pt-2">objetivo</p>
          <p className="max-w-3xl text-xl leading-relaxed text-bone md:text-2xl">
            {OBJETIVO}
          </p>
        </div>
      </div>
    </Section>
  );
}
