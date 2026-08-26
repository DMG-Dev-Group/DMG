"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  Code2,
  Boxes,
  ShoppingBag,
  LayoutDashboard,
  Bot,
  Workflow,
} from "lucide-react";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { ServiceModal } from "@/components/ui/service-modal";
import { CATEGORIAS, itemPorId, type Categoria } from "@/data/services";
import { formatarBRL } from "@/lib/orcamento";
import { cn } from "@/lib/utils";

/**
 * Serviços — o funil principal do site (docs/0001 §4/§6). Mantém o bento grid
 * do DMG-DEF (tilt no hover + spotlight de cursor) e substitui a antiga seção
 * "O que fazemos" e a seção "Investimento", que virou redundante.
 *
 * Nome, descrição e itens saem de `data/services.ts`. Aqui só mora o que é
 * visual: ícone e tamanho do card no grid.
 */

const ICON = { strokeWidth: 1.4 } as const;

const VISUAL: Record<string, { icon: ReactNode; span: string; destaque?: boolean }> = {
  "sistemas-web": {
    icon: <Code2 {...ICON} className="h-6 w-6" />,
    span: "md:col-span-2 md:row-span-2",
    destaque: true,
  },
  saas: { icon: <Boxes {...ICON} className="h-6 w-6" />, span: "md:col-span-2" },
  ecommerce: { icon: <ShoppingBag {...ICON} className="h-6 w-6" />, span: "md:col-span-1" },
  dashboards: { icon: <LayoutDashboard {...ICON} className="h-6 w-6" />, span: "md:col-span-1" },
  robotica: { icon: <Bot {...ICON} className="h-6 w-6" />, span: "md:col-span-2" },
  "ia-automacoes": { icon: <Workflow {...ICON} className="h-6 w-6" />, span: "md:col-span-2" },
};

/**
 * A âncora de preço do card: o menor valor da categoria que compra algo
 * inteiro. O setup da impressão 3D fica de fora de propósito — R$ 25 sozinho
 * não entrega peça nenhuma, e ancorar a Robótica nele seria propaganda
 * enganosa por tecnicalidade.
 */
function precoDeEntrada(categoria: Categoria): string {
  if (categoria.sobConsulta) return "sob consulta";

  const pisos = categoria.itens
    .map((id) => itemPorId(id)?.preco)
    .filter((p) => p !== undefined)
    .filter((p) => p.tipo === "a-partir-de" || p.tipo === "por-unidade")
    .map((p) => p.valor);

  if (pisos.length === 0) return "sob orçamento";
  return `a partir de ${formatarBRL(Math.min(...pisos))}`;
}

function ServiceCard({
  categoria,
  onOpen,
}: {
  categoria: Categoria;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const visual = VISUAL[categoria.id];

  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 5}deg) rotateY(${(px - 0.5) * 5}deg)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-label={`${categoria.nome} — montar orçamento`}
      className="group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[12px] border border-hairline bg-graphite/60 p-7 text-left transition-[border-color] duration-300 will-change-transform hover:border-red/40"
      style={{ transition: "transform 0.2s ease-out, border-color 0.3s" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(300px circle at var(--mx, 50%) var(--my, 50%), rgba(255,30,30,0.14), transparent 70%)",
        }}
      />
      {visual?.destaque && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bloom-red opacity-70 blur-2xl"
        />
      )}

      <div className="relative flex items-center justify-between">
        <span className="text-red">{visual?.icon}</span>
      </div>

      <div className="relative mt-10">
        <h3
          className={cn(
            "font-medium tracking-tight text-bone",
            visual?.destaque ? "text-2xl md:text-3xl" : "text-xl",
          )}
        >
          {categoria.nome}
        </h3>
        <p
          className={cn(
            "mt-3 leading-relaxed text-ash",
            visual?.destaque ? "max-w-sm text-base" : "text-sm",
          )}
        >
          {categoria.descricao}
        </p>
        <div className="mt-5 flex items-center gap-3">
          <span className="font-mono text-sm text-red">
            {precoDeEntrada(categoria)}
          </span>
          <span className="hud transition-colors group-hover:text-bone">
            montar orçamento →
          </span>
        </div>
      </div>
    </button>
  );
}

export function Servicos() {
  const [aberta, setAberta] = useState<Categoria | null>(null);

  return (
    <>
      <Section id="servicos" index="02" label="SERVIÇOS">
        <div className="mb-14 max-w-3xl md:mb-20">
          <h2 className="text-4xl font-medium leading-[1.05] tracking-tight text-bone md:text-6xl">
            O que a gente constrói.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ash">
            Preço aberto, escopo escrito. Escolhe a frente, monta o orçamento na
            hora e a gente responde com uma proposta formal.
          </p>
        </div>

        <Reveal
          selector=".svc"
          className="grid auto-rows-[minmax(150px,auto)] grid-cols-1 gap-4 md:grid-cols-4"
        >
          {CATEGORIAS.map((c) => (
            <div key={c.id} className={cn("svc h-full", VISUAL[c.id]?.span)}>
              <ServiceCard categoria={c} onOpen={() => setAberta(c)} />
            </div>
          ))}
        </Reveal>
      </Section>

      {/* `key` por categoria: trocar de card remonta o modal com o formulário
          limpo, sem herdar o que foi marcado no anterior. */}
      <ServiceModal
        key={aberta?.id ?? "fechado"}
        categoria={aberta}
        onClose={() => setAberta(null)}
      />
    </>
  );
}
