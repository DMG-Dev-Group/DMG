"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Minus, Plus, X } from "lucide-react";
import {
  itemPorId,
  moduloPorId,
  multiplicadorPorId,
  NOTA_A_PARTIR_DE,
  CONDICOES_VISIVEIS,
  CONDICOES_COMERCIAIS,
  planosDeAluguel,
  type Categoria,
  type Item,
  type Modalidade,
} from "@/data/services";
import { calcularOrcamento, formatarBRL } from "@/lib/orcamento";
import { LIMITE_COMENTARIO, temErro, validarLead, type Contato, type ErrosLead, type LeadPayload } from "@/lib/leads";
import { getLenis } from "@/components/smooth-scroll";
import { cn } from "@/lib/utils";

/**
 * ServiceModal — o configurador de orçamento (docs/0001 §4). Herda o padrão do
 * `packageOverlay` do site antigo: overlay escuro, fecha no ESC, no clique fora
 * e no X.
 *
 * Dois níveis: escolher o item da categoria, depois configurá-lo. O total é
 * recalculado a cada clique por `lib/orcamento.ts`, o mesmo módulo que a API
 * usa no servidor — a tela e o email nunca divergem porque a conta é uma só.
 */

const CONTATO_VAZIO: Contato = { nome: "", whatsapp: "", email: "", empresa: "" };

const rotuloPreco = (item: Item) => {
  switch (item.preco.tipo) {
    case "a-partir-de":
      return `a partir de ${formatarBRL(item.preco.valor)}`;
    case "por-unidade":
      return `${formatarBRL(item.preco.valor)} / ${item.preco.unidade}`;
    case "formula-impressao":
      return `${formatarBRL(item.preco.setup)} + ${formatarBRL(item.preco.porGrama)}/g`;
    case "sob-orcamento":
      return "sob orçamento";
  }
};

function Campo({
  id,
  rotulo,
  erro,
  children,
}: {
  id: string;
  rotulo: string;
  erro?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="hud mb-2 block">
        {rotulo}
      </label>
      {children}
      {erro && (
        <p role="alert" className="mt-1.5 text-xs text-red">
          {erro}
        </p>
      )}
    </div>
  );
}

const INPUT =
  "w-full rounded-[6px] border border-hairline bg-void px-3.5 py-2.5 text-sm text-bone outline-none transition-colors placeholder:text-ash/50 focus:border-red/60";

function Stepper({
  valor,
  onChange,
  rotulo,
}: {
  valor: number;
  onChange: (v: number) => void;
  rotulo: string;
}) {
  const botao =
    "flex h-7 w-7 items-center justify-center border border-hairline text-ash transition-colors hover:border-red/60 hover:text-bone disabled:opacity-30 disabled:hover:border-hairline";
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={botao}
        onClick={() => onChange(Math.max(0, valor - 1))}
        disabled={valor === 0}
        aria-label={`Menos um ${rotulo}`}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-6 text-center font-mono text-sm text-bone" aria-live="polite">
        {valor}
      </span>
      <button
        type="button"
        className={botao}
        onClick={() => onChange(valor + 1)}
        aria-label={`Mais um ${rotulo}`}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ServiceModal({
  categoria,
  onClose,
}: {
  categoria: Categoria | null;
  onClose: () => void;
}) {
  const [itemId, setItemId] = useState<string | null>(null);
  const [modulos, setModulos] = useState<Record<string, number>>({});
  const [multiplicadores, setMultiplicadores] = useState<string[]>([]);
  const [gramas, setGramas] = useState(100);
  const [quantidade, setQuantidade] = useState(1);
  const [modalidade, setModalidade] = useState<Modalidade>("compra");
  const [planoId, setPlanoId] = useState<string | null>(null);
  const [comentario, setComentario] = useState("");
  const [contato, setContato] = useState<Contato>(CONTATO_VAZIO);
  const [consentimento, setConsentimento] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [erros, setErros] = useState<ErrosLead>({});
  const [enviando, setEnviando] = useState(false);
  const [falha, setFalha] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const painel = useRef<HTMLDivElement>(null);
  const aberto = categoria !== null;
  const item = itemId ? itemPorId(itemId) : null;

  // Nota: não há efeito de "limpar o formulário ao abrir". Quem garante estado
  // novo a cada categoria é o `key` no ponto de uso (servicos.tsx), que faz o
  // React remontar o componente — mais barato e mais seguro do que zerar dez
  // useStates dentro de um efeito.

  // Trava o scroll do fundo enquanto o modal está aberto.
  useEffect(() => {
    if (!aberto) return;
    const html = document.documentElement;
    const anterior = html.style.overflow;
    html.style.overflow = "hidden";
    getLenis()?.stop();
    return () => {
      html.style.overflow = anterior;
      getLenis()?.start();
    };
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    painel.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto, onClose]);

  const orcamento = useMemo(() => {
    if (!itemId) return null;
    return calcularOrcamento({
      itemId,
      modulos: Object.entries(modulos)
        .filter(([, q]) => q > 0)
        .map(([id, q]) => ({ id, quantidade: q })),
      multiplicadores,
      gramas,
      quantidade,
      planoRecorrenteId: modalidade === "aluguel" ? planoId : null,
    });
  }, [itemId, modulos, multiplicadores, gramas, quantidade, modalidade, planoId]);

  const enviar = useCallback(async () => {
    if (!categoria) return;

    const payload: LeadPayload = {
      categoriaId: categoria.id,
      itemId,
      modulos: Object.entries(modulos)
        .filter(([, q]) => q > 0)
        .map(([id, q]) => ({ id, quantidade: q })),
      multiplicadores,
      gramas,
      quantidade,
      modalidade,
      planoRecorrenteId: modalidade === "aluguel" ? planoId : null,
      comentario,
      contato,
      consentimento,
      website: honeypot,
    };

    // Valida antes de sair da tela — o servidor valida de novo, mas errar de
    // graça uma ida e volta de rede é ruim pra quem está preenchendo.
    const locais = validarLead(payload);
    if (temErro(locais)) {
      setErros(locais);
      return;
    }

    setErros({});
    setFalha(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const dados = await res.json().catch(() => ({}));

      if (res.ok) {
        setEnviado(true);
      } else if (res.status === 422 && dados.erros) {
        setErros(dados.erros);
      } else {
        setFalha(
          dados.erro ??
            "Não conseguimos enviar agora. Chama a gente em dmggroupdev@gmail.com.",
        );
      }
    } catch {
      setFalha(
        "Sem conexão com o servidor. Chama a gente em dmggroupdev@gmail.com.",
      );
    } finally {
      setEnviando(false);
    }
  }, [categoria, itemId, modulos, multiplicadores, gramas, quantidade, modalidade, planoId, comentario, contato, consentimento, honeypot]);

  if (!categoria) return null;

  const sobConsulta = categoria.sobConsulta || categoria.itens.length === 0;
  const mostrandoConfig = itemId !== null || sobConsulta;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-void/90 p-4 backdrop-blur-sm md:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={painel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Orçamento — ${categoria.nome}`}
        className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col rounded-[12px] border border-hairline bg-carbon outline-none"
      >
        {/* --- Cabeçalho (fixo; o corpo é que rola) --- */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-hairline p-6 md:p-8">
          <div>
            {mostrandoConfig && !sobConsulta && !enviado && (
              <button
                type="button"
                onClick={() => setItemId(null)}
                className="hud mb-3 flex items-center gap-1.5 transition-colors hover:text-bone"
              >
                <ArrowLeft className="h-3 w-3" />
                {categoria.nome}
              </button>
            )}
            <h2 className="text-2xl font-medium tracking-tight text-bone md:text-3xl">
              {enviado ? "Recebemos." : (item?.nome ?? categoria.nome)}
            </h2>
            {!mostrandoConfig && (
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-ash">
                {categoria.descricao}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] border border-hairline text-ash transition-colors hover:border-red/60 hover:text-bone"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* ================= Confirmação ================= */}
          {enviado ? (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red/40 bg-red/10">
                <Check className="h-6 w-6 text-red" />
              </div>
              <p className="mt-6 text-lg text-bone">
                A DMG te chama em breve no WhatsApp que você deixou.
              </p>
              <p className="mt-2 text-sm text-ash">
                Se preferir adiantar, escreve pra{" "}
                <a
                  href="mailto:dmggroupdev@gmail.com"
                  className="text-red underline underline-offset-4"
                >
                  dmggroupdev@gmail.com
                </a>
                .
              </p>
              <button
                type="button"
                onClick={onClose}
                className="clip-corner mt-8 bg-red px-6 py-3 text-sm font-medium text-void"
              >
                Fechar
              </button>
            </div>
          ) : !mostrandoConfig ? (
            /* ================= Nível 1: itens da categoria ================= */
            <ul className="grid gap-px bg-hairline">
              {categoria.itens.map((id) => {
                const it = itemPorId(id);
                if (!it) return null;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => setItemId(id)}
                      className="group flex w-full items-center justify-between gap-6 bg-carbon px-1 py-5 text-left transition-colors hover:bg-graphite"
                    >
                      <span className="min-w-0">
                        <span className="block text-base font-medium text-bone">
                          {it.nome}
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-ash">
                          {it.escopo}
                        </span>
                      </span>
                      <span className="shrink-0 text-right font-mono text-sm text-red">
                        {rotuloPreco(it)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            /* ================= Nível 2: configurador ================= */
            <div className="space-y-8">
              {sobConsulta ? (
                <p className="text-sm leading-relaxed text-ash">
                  Essa frente ainda não tem tabela fechada — cada caso é
                  orçado sob consulta. Conta o que você precisa que a gente
                  responde com um escopo e um valor.
                </p>
              ) : (
                item && (
                  <>
                    <p className="text-sm leading-relaxed text-ash">
                      {item.escopo}
                    </p>

                    {/* Entradas específicas de itens com preço variável */}
                    {item.preco.tipo === "formula-impressao" && (
                      <Campo id="gramas" rotulo="gramas de material">
                        <input
                          id="gramas"
                          type="number"
                          min={0}
                          value={gramas}
                          onChange={(e) => setGramas(Number(e.target.value))}
                          className={INPUT}
                        />
                      </Campo>
                    )}

                    {item.preco.tipo === "por-unidade" && (
                      <Campo id="quantidade" rotulo={`quantidade de ${item.preco.unidade}s`}>
                        <input
                          id="quantidade"
                          type="number"
                          min={1}
                          value={quantidade}
                          onChange={(e) => setQuantidade(Number(e.target.value))}
                          className={INPUT}
                        />
                      </Campo>
                    )}

                    {/* Módulos */}
                    {item.modulos.length > 0 && (
                      <div>
                        <p className="hud mb-4">módulos adicionais</p>
                        <ul className="grid gap-px bg-hairline">
                          {item.modulos.map((mid) => {
                            const m = moduloPorId(mid);
                            if (!m) return null;
                            const qtd = modulos[mid] ?? 0;
                            const marcado = qtd > 0;
                            return (
                              <li
                                key={mid}
                                className="flex items-center justify-between gap-4 bg-carbon py-3.5"
                              >
                                <span className="min-w-0">
                                  <span className="block text-sm text-bone">
                                    {m.nome}
                                  </span>
                                  <span className="font-mono text-xs text-ash">
                                    {formatarBRL(m.valor)}
                                    {m.porUnidade && ` / ${m.unidade}`}
                                  </span>
                                </span>
                                {m.porUnidade ? (
                                  <Stepper
                                    valor={qtd}
                                    rotulo={m.unidade ?? "item"}
                                    onChange={(v) =>
                                      setModulos((atual) => ({ ...atual, [mid]: v }))
                                    }
                                  />
                                ) : (
                                  <button
                                    type="button"
                                    role="checkbox"
                                    aria-checked={marcado}
                                    aria-label={m.nome}
                                    onClick={() =>
                                      setModulos((atual) => ({
                                        ...atual,
                                        [mid]: marcado ? 0 : 1,
                                      }))
                                    }
                                    className={cn(
                                      "flex h-6 w-6 shrink-0 items-center justify-center border transition-colors",
                                      marcado
                                        ? "border-red bg-red text-void"
                                        : "border-hairline hover:border-red/60",
                                    )}
                                  >
                                    {marcado && <Check className="h-3.5 w-3.5" />}
                                  </button>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Multiplicadores */}
                    {item.multiplicadores.length > 0 && (
                      <div>
                        <p className="hud mb-4">condições</p>
                        <ul className="grid gap-px bg-hairline">
                          {item.multiplicadores.map((mid) => {
                            const m = multiplicadorPorId(mid);
                            if (!m) return null;
                            const marcado = multiplicadores.includes(mid);
                            return (
                              <li
                                key={mid}
                                className="flex items-center justify-between gap-4 bg-carbon py-3.5"
                              >
                                <span className="min-w-0">
                                  <span className="block text-sm text-bone">
                                    {m.nome}{" "}
                                    <span className="font-mono text-red">
                                      +{Math.round(m.percentual * 100)}%
                                    </span>
                                  </span>
                                  <span className="text-xs text-ash">{m.detalhe}</span>
                                </span>
                                <button
                                  type="button"
                                  role="checkbox"
                                  aria-checked={marcado}
                                  aria-label={m.nome}
                                  onClick={() =>
                                    setMultiplicadores((atual) =>
                                      marcado
                                        ? atual.filter((x) => x !== mid)
                                        : [...atual, mid],
                                    )
                                  }
                                  className={cn(
                                    "flex h-6 w-6 shrink-0 items-center justify-center border transition-colors",
                                    marcado
                                      ? "border-red bg-red text-void"
                                      : "border-hairline hover:border-red/60",
                                  )}
                                >
                                  {marcado && <Check className="h-3.5 w-3.5" />}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Total — gruda no rodapé do painel enquanto a pessoa
                        percorre os módulos. Ver o número mudar a cada clique é
                        o ponto inteiro do configurador; se ele fica fora da
                        tela, vira um formulário comum. */}
                    {orcamento && (
                      <div className="sticky bottom-0 z-10 rounded-[12px] border border-hairline bg-void p-5 shadow-[0_-12px_32px_rgba(5,5,6,0.9)]">
                        {orcamento.sobOrcamento ? (
                          <p className="text-sm text-ash">
                            Esse item é orçado caso a caso. Descreve abaixo o que
                            você precisa e a DMG responde com o valor.
                          </p>
                        ) : (
                          <>
                            <dl className="space-y-1.5 text-sm">
                              <div className="flex justify-between gap-4">
                                <dt className="text-ash">{orcamento.base.descricao}</dt>
                                <dd className="font-mono text-ash">
                                  {formatarBRL(orcamento.base.valor)}
                                </dd>
                              </div>
                              {[...orcamento.modulos, ...orcamento.acrescimos].map((l) => (
                                <div key={l.descricao} className="flex justify-between gap-4">
                                  <dt className="text-ash">{l.descricao}</dt>
                                  <dd className="font-mono text-ash">
                                    +{formatarBRL(l.valor)}
                                  </dd>
                                </div>
                              ))}
                            </dl>
                            <div className="mt-4 flex items-end justify-between gap-4 border-t border-hairline pt-4">
                              <span className="hud">
                                {orcamento.aPartirDe ? "total a partir de" : "total"}
                              </span>
                              <span
                                aria-live="polite"
                                className="glow-red font-mono text-2xl font-bold text-red"
                              >
                                {formatarBRL(orcamento.total)}
                              </span>
                            </div>
                            {orcamento.aPartirDe && (
                              <p className="mt-3 text-[11px] leading-relaxed text-ash/70">
                                {NOTA_A_PARTIR_DE}
                              </p>
                            )}

                            {/* As duas portas de pagamento. Não é um extra
                                somado ao total: é comprar OU alugar. */}
                            {categoria.permiteAluguel && (
                              <div className="mt-5 border-t border-hairline pt-5">
                                <p className="hud mb-3">como pagar</p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <button
                                    type="button"
                                    onClick={() => setModalidade("compra")}
                                    aria-pressed={modalidade === "compra"}
                                    className={cn(
                                      "rounded-[8px] border p-4 text-left transition-colors",
                                      modalidade === "compra"
                                        ? "border-red bg-red/10"
                                        : "border-hairline hover:border-red/50",
                                    )}
                                  >
                                    <span className="block text-sm text-bone">
                                      Comprar
                                    </span>
                                    <span className="mt-1 block font-mono text-lg text-red">
                                      {formatarBRL(orcamento.total)}
                                    </span>
                                    <span className="mt-1 block text-[11px] leading-relaxed text-ash">
                                      Pagamento do projeto. É seu.
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setModalidade("aluguel")}
                                    aria-pressed={modalidade === "aluguel"}
                                    className={cn(
                                      "rounded-[8px] border p-4 text-left transition-colors",
                                      modalidade === "aluguel"
                                        ? "border-red bg-red/10"
                                        : "border-hairline hover:border-red/50",
                                    )}
                                  >
                                    <span className="block text-sm text-bone">
                                      Alugar
                                    </span>
                                    <span className="mt-1 block font-mono text-lg text-red">
                                      a partir de{" "}
                                      {formatarBRL(
                                        Math.min(
                                          ...planosDeAluguel().map(
                                            (pl) => pl.valorMensal,
                                          ),
                                        ),
                                      )}
                                      /mês
                                    </span>
                                    <span className="mt-1 block text-[11px] leading-relaxed text-ash">
                                      Sem o valor à vista. Escolhe o plano.
                                    </span>
                                  </button>
                                </div>

                                {modalidade === "aluguel" && (
                                  <div className="mt-4">
                                    <ul className="grid gap-px bg-hairline">
                                      {planosDeAluguel().map((pl) => {
                                        const escolhido = planoId === pl.id;
                                        return (
                                          <li key={pl.id}>
                                            <button
                                              type="button"
                                              onClick={() => setPlanoId(pl.id)}
                                              aria-pressed={escolhido}
                                              className={cn(
                                                "flex w-full items-center justify-between gap-4 px-3 py-3.5 text-left transition-colors",
                                                escolhido
                                                  ? "bg-red/10"
                                                  : "bg-void hover:bg-graphite",
                                              )}
                                            >
                                              <span className="min-w-0">
                                                <span className="block text-sm text-bone">
                                                  {pl.nome}
                                                </span>
                                                <span className="block text-[11px] leading-relaxed text-ash">
                                                  {pl.inclui}
                                                </span>
                                              </span>
                                              <span className="shrink-0 font-mono text-sm text-red">
                                                {formatarBRL(pl.valorMensal)}/mês
                                              </span>
                                            </button>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                    {erros.plano && (
                                      <p role="alert" className="mt-2 text-xs text-red">
                                        {erros.plano}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {categoria.aviso && (
                      <p className="border-l-2 border-red/40 pl-4 text-[13px] leading-relaxed text-ash">
                        {categoria.aviso}
                      </p>
                    )}
                  </>
                )
              )}

              {/* --- Comentário + contato --- */}
              <div className="space-y-5 border-t border-hairline pt-8">
                <Campo
                  id="comentario"
                  rotulo={item?.campoLivre ? "sobre a peça" : "algo específico do seu projeto"}
                >
                  <textarea
                    id="comentario"
                    rows={3}
                    maxLength={LIMITE_COMENTARIO}
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder={item?.campoLivre ?? "Opcional — conta o contexto, o prazo, o que já existe."}
                    className={cn(INPUT, "resize-y")}
                  />
                </Campo>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Campo id="nome" rotulo="nome" erro={erros.nome}>
                    <input
                      id="nome"
                      autoComplete="name"
                      value={contato.nome}
                      onChange={(e) => setContato((c) => ({ ...c, nome: e.target.value }))}
                      className={INPUT}
                    />
                  </Campo>
                  <Campo id="whatsapp" rotulo="whatsapp" erro={erros.whatsapp}>
                    <input
                      id="whatsapp"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="(00) 00000-0000"
                      value={contato.whatsapp}
                      onChange={(e) => setContato((c) => ({ ...c, whatsapp: e.target.value }))}
                      className={INPUT}
                    />
                  </Campo>
                  <Campo id="email" rotulo="email" erro={erros.email}>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={contato.email}
                      onChange={(e) => setContato((c) => ({ ...c, email: e.target.value }))}
                      className={INPUT}
                    />
                  </Campo>
                  <Campo id="empresa" rotulo="empresa (opcional)" erro={erros.empresa}>
                    <input
                      id="empresa"
                      autoComplete="organization"
                      value={contato.empresa}
                      onChange={(e) => setContato((c) => ({ ...c, empresa: e.target.value }))}
                      className={INPUT}
                    />
                  </Campo>
                </div>

                {/* Honeypot: invisível para gente, irresistível para bot. */}
                <div aria-hidden className="absolute left-[-9999px] top-0">
                  <label htmlFor="website">Não preencha este campo</label>
                  <input
                    id="website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                <div>
                  <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-ash">
                    <input
                      type="checkbox"
                      checked={consentimento}
                      onChange={(e) => setConsentimento(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-red)]"
                    />
                    <span>
                      Autorizo a DMG a guardar meus dados para responder a este
                      orçamento.{" "}
                      <a
                        href="/privacidade"
                        target="_blank"
                        className="text-red underline underline-offset-4"
                      >
                        Como tratamos seus dados
                      </a>
                      .
                    </span>
                  </label>
                  {erros.consentimento && (
                    <p role="alert" className="mt-1.5 text-xs text-red">
                      {erros.consentimento}
                    </p>
                  )}
                </div>

                {falha && (
                  <p role="alert" className="border-l-2 border-red pl-4 text-sm text-red">
                    {falha}
                  </p>
                )}

                <button
                  type="button"
                  onClick={enviar}
                  disabled={enviando}
                  className="clip-corner w-full bg-red px-6 py-4 text-sm font-medium text-void transition-shadow hover:shadow-[0_0_44px_var(--color-red-glow)] disabled:opacity-60"
                >
                  {enviando
                    ? "Enviando…"
                    : modalidade === "aluguel"
                      ? "Quero alugar"
                      : "Solicitar orçamento"}
                </button>

                {CONDICOES_VISIVEIS && (
                  <dl className="space-y-1.5 border-t border-hairline pt-5 text-[11px] leading-relaxed text-ash/70">
                    {CONDICOES_COMERCIAIS.map((c) => (
                      <div key={c.item} className="flex gap-2">
                        <dt className="shrink-0 text-ash">{c.item}:</dt>
                        <dd>{c.condicao}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
