import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";

// D / M / G — the three founders. Roles/photos are placeholders to personalize.
// TODO: trocar por cargos reais e fotos/silhuetas em /public/time.
const TEAM = [
  { mono: "D", nome: "Daniel", papel: "Sócio-fundador" },
  { mono: "M", nome: "Miguel", papel: "Sócio-fundador" },
  { mono: "G", nome: "Guilherme", papel: "Sócio-fundador" },
];

export function Time() {
  return (
    <Section id="time" index="04" label="TIME">
      <div className="mb-14 max-w-3xl md:mb-20">
        <h2 className="text-4xl font-medium leading-[1.05] tracking-tight text-bone md:text-6xl">
          Três pessoas. <span className="text-ash">Um padrão.</span>
        </h2>
      </div>

      <Reveal className="grid grid-cols-1 gap-px overflow-hidden rounded-[12px] border border-hairline bg-hairline md:grid-cols-3">
        {TEAM.map((m) => (
          <div
            key={m.mono}
            className="group relative flex flex-col justify-between overflow-hidden bg-carbon p-8 md:aspect-[3/4] md:p-10"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bloom-red opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-70"
            />
            <span className="relative select-none text-[7rem] font-bold leading-none tracking-tighter text-graphite transition-colors duration-500 group-hover:text-bone md:text-[10rem]">
              {m.mono}
            </span>
            <div className="relative">
              <p className="text-xl font-medium tracking-tight text-bone">
                {m.nome}
              </p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-ash">
                {m.papel}
              </p>
            </div>
          </div>
        ))}
      </Reveal>
    </Section>
  );
}
