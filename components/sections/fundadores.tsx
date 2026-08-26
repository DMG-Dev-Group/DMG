"use client";

import { useState } from "react";
import Image from "next/image";
import { Section } from "@/components/ui/section";
import { FUNDADORES, type Fundador } from "@/data/team";
import { cn } from "@/lib/utils";

/**
 * Fundadores — portado do site antigo (`legacy/damage_group_landing.html`
 * 159-231 + `legacy/css.css` 265-465 + a lógica de clique em
 * `legacy/script.js` 189-217). Substitui o `time.tsx` do DMG-DEF, que só
 * tinha monogramas (docs/0001 §5, linha 7).
 *
 * Comportamento original preservado: um card ativo por vez, clicar de novo no
 * ativo fecha tudo, os inativos encolhem e apagam, e o painel de informação do
 * ativo sai para fora do card.
 *
 * O que precisou mudar: no original os cards tinham 550×800px fixos e os
 * painéis eram posicionados fora deles com `left: calc(100% + 16px)`, sem
 * nenhuma media query — no celular isso simplesmente não cabia na tela. Aqui
 * o card é proporcional (11/16, a mesma proporção) e o painel só voa para fora
 * a partir de `lg`; abaixo disso ele abre embaixo do card, empilhado.
 */

function Pills({ stack }: { stack: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {stack.map((t) => (
        <span
          key={t}
          className="border border-red/25 bg-red/[0.08] px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] text-[#c47070] transition-colors hover:border-red hover:text-white"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

const PAINEL_BASE =
  "flex flex-col gap-4 border border-red/30 bg-void/[0.72] p-6 backdrop-blur-[24px]";

/** O painel como ele aparece fora do card, em telas grandes. */
const PAINEL_FLUTUANTE =
  "pointer-events-none absolute top-1/2 z-20 -translate-y-1/2 opacity-0 transition-[opacity,transform] duration-[400ms] lg:flex";

function Identidade({ fundador }: { fundador: Fundador }) {
  return (
    <>
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-red">
        {"// membro"}
      </span>
      <div>
        <h3 className="text-[30px] font-bold leading-none tracking-[-0.05em] text-bone">
          {fundador.nome}
        </h3>
        <span className="mt-2 block font-mono text-[11px] tracking-[0.2em] text-ash">
          {fundador.idade}
        </span>
      </div>
    </>
  );
}

function Stack({ stack }: { stack: string[] }) {
  return (
    <>
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-red">
        Stack
      </span>
      <Pills stack={stack} />
    </>
  );
}

function CardFundador({
  fundador,
  ativo,
  algumAtivo,
  onToggle,
}: {
  fundador: Fundador;
  ativo: boolean;
  algumAtivo: boolean;
  onToggle: () => void;
}) {
  const inativo = algumAtivo && !ativo;
  const dividido = fundador.painel === "dividido";
  const abreNaDireita = fundador.painel === "direita" || dividido;
  const abreNaEsquerda = fundador.painel === "esquerda" || dividido;

  return (
    <div
      className={cn(
        "relative transition-[transform,opacity] duration-[400ms] ease-out",
        ativo && "z-20 lg:scale-[1.12]",
        inativo && "opacity-10 lg:scale-[0.85]",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={ativo}
        aria-label={`${fundador.nome} — ver stack`}
        className={cn(
          "relative flex aspect-[11/16] w-full items-end justify-center overflow-hidden transition-transform duration-[400ms]",
          // O gradiente vermelho→preto é a identidade do card no site antigo.
          "bg-[linear-gradient(to_bottom,#d80510,#080808)]",
          !ativo && "hover:scale-[1.03]",
          ativo && "bg-none",
        )}
      >
        <span
          aria-hidden
          className="absolute left-1/2 top-2 -translate-x-1/2 text-[clamp(120px,18vw,260px)] font-extrabold leading-none text-[#f5c5c5]"
        >
          {fundador.letra}
        </span>
        <Image
          src={fundador.foto}
          alt={fundador.nome}
          fill
          sizes="(max-width: 1024px) 90vw, 30vw"
          className={cn(
            "z-[2] mt-20 object-cover object-top mix-blend-overlay",
            fundador.espelharFoto && "-scale-x-100",
          )}
        />
      </button>

      {/* --- Painéis flutuantes (lg+): saem para fora do card --- */}
      {abreNaEsquerda && (
        <div
          aria-hidden={!ativo}
          className={cn(
            PAINEL_BASE,
            PAINEL_FLUTUANTE,
            "hidden right-[calc(100%+16px)] w-[340px] -translate-x-3",
            ativo && "pointer-events-auto translate-x-0 opacity-100",
          )}
        >
          {dividido ? (
            <Identidade fundador={fundador} />
          ) : (
            <>
              <Identidade fundador={fundador} />
              <span className="h-px w-full bg-red/30" />
              <Stack stack={fundador.stack} />
            </>
          )}
        </div>
      )}

      {abreNaDireita && (
        <div
          aria-hidden={!ativo}
          className={cn(
            PAINEL_BASE,
            PAINEL_FLUTUANTE,
            "hidden left-[calc(100%+16px)] w-[340px] translate-x-3",
            ativo && "pointer-events-auto translate-x-0 opacity-100",
          )}
        >
          {dividido ? (
            <Stack stack={fundador.stack} />
          ) : (
            <>
              <Identidade fundador={fundador} />
              <span className="h-px w-full bg-red/30" />
              <Stack stack={fundador.stack} />
            </>
          )}
        </div>
      )}

      {/* --- Painel empilhado (abaixo de lg): abre embaixo do card --- */}
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-[400ms] lg:hidden",
          ativo ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className={PAINEL_BASE}>
            <Identidade fundador={fundador} />
            <span className="h-px w-full bg-red/30" />
            <Stack stack={fundador.stack} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Fundadores() {
  const [ativo, setAtivo] = useState<string | null>(null);

  return (
    <Section id="fundadores" index="03" label="FUNDADORES">
      <div className="mb-14 max-w-3xl md:mb-20">
        <h2 className="text-4xl font-medium leading-[1.05] tracking-tight text-bone md:text-6xl">
          Os fundadores da DMG<span className="text-red">_</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-10">
        {FUNDADORES.map((f) => (
          <CardFundador
            key={f.id}
            fundador={f}
            ativo={ativo === f.id}
            algumAtivo={ativo !== null}
            // Segundo clique no card ativo fecha tudo, como no site antigo.
            onToggle={() => setAtivo((atual) => (atual === f.id ? null : f.id))}
          />
        ))}
      </div>
    </Section>
  );
}
