import {
  COMBINACAO_MULTIPLICADORES,
  itemPorId,
  moduloPorId,
  multiplicadorPorId,
  PLANOS_RECORRENTES,
  type Item,
} from "@/data/services";

/**
 * A matemática do configurador de orçamento, isolada da UI.
 *
 * Regra da tabela comercial: os multiplicadores incidem sobre (base + módulos),
 * nunca sobre uma linha isolada. Por isso o cálculo é sempre subtotal primeiro,
 * acréscimos depois.
 *
 * Este é o único lugar do projeto que faz conta com dinheiro — se um total
 * aparecer errado na tela, é aqui que se procura, não no componente.
 */

export type SelecaoModulo = {
  id: string;
  /** Sempre ≥ 1. Módulos de checkbox são quantidade 1. */
  quantidade: number;
};

export type Selecao = {
  itemId: string;
  modulos: SelecaoModulo[];
  multiplicadores: string[];
  /** Impressão 3D: gramas de material. */
  gramas?: number;
  /** Itens cobrados por unidade (ex.: modelagem 3D por peça). */
  quantidade?: number;
  planoRecorrenteId?: string | null;
};

export type LinhaOrcamento = {
  descricao: string;
  valor: number;
};

export type Orcamento = {
  /** Item sem preço de tabela: a tela pula o total e vai ao formulário. */
  sobOrcamento: boolean;
  /** Se o preço-base é um piso — a tela precisa dizer "a partir de". */
  aPartirDe: boolean;
  base: LinhaOrcamento;
  modulos: LinhaOrcamento[];
  subtotal: number;
  acrescimos: LinhaOrcamento[];
  total: number;
  /** Plano recorrente escolhido, se houver. */
  mensal: LinhaOrcamento | null;
};

/** Centavos, não float. Evita 1.5 × 37 virar 55.499999999999996. */
const centavos = (v: number) => Math.round(v * 100) / 100;

const ORCAMENTO_VAZIO: Orcamento = {
  sobOrcamento: true,
  aPartirDe: false,
  base: { descricao: "Sob orçamento", valor: 0 },
  modulos: [],
  subtotal: 0,
  acrescimos: [],
  total: 0,
  mensal: null,
};

function calcularBase(
  item: Item,
  selecao: Selecao,
): { linha: LinhaOrcamento; aPartirDe: boolean } | null {
  switch (item.preco.tipo) {
    case "a-partir-de":
      return {
        linha: { descricao: item.nome, valor: item.preco.valor },
        aPartirDe: true,
      };

    case "por-unidade": {
      const qtd = Math.max(1, Math.floor(selecao.quantidade ?? 1));
      return {
        linha: {
          descricao: `${item.nome} — ${qtd} ${item.preco.unidade}${qtd > 1 ? "s" : ""}`,
          valor: centavos(item.preco.valor * qtd),
        },
        aPartirDe: false,
      };
    }

    case "formula-impressao": {
      const gramas = Math.max(0, selecao.gramas ?? 0);
      return {
        linha: {
          descricao: `${item.nome} — setup + ${gramas} g de material`,
          valor: centavos(item.preco.setup + item.preco.porGrama * gramas),
        },
        aPartirDe: false,
      };
    }

    case "sob-orcamento":
      return null;
  }
}

export function calcularOrcamento(selecao: Selecao): Orcamento {
  const item = itemPorId(selecao.itemId);
  if (!item) return ORCAMENTO_VAZIO;

  const base = calcularBase(item, selecao);
  if (!base) return ORCAMENTO_VAZIO;

  // Só entram módulos que o item de fato oferece — um id solto vindo do
  // cliente não pode injetar linha nenhuma no orçamento.
  const modulos: LinhaOrcamento[] = [];
  for (const escolha of selecao.modulos) {
    if (!item.modulos.includes(escolha.id)) continue;
    const modulo = moduloPorId(escolha.id);
    if (!modulo) continue;

    const qtd = modulo.porUnidade
      ? Math.max(1, Math.floor(escolha.quantidade))
      : 1;
    modulos.push({
      descricao:
        modulo.porUnidade && qtd > 1 ? `${modulo.nome} × ${qtd}` : modulo.nome,
      valor: centavos(modulo.valor * qtd),
    });
  }

  const subtotal = centavos(
    base.linha.valor + modulos.reduce((s, m) => s + m.valor, 0),
  );

  // Mesma disciplina: multiplicador que o item não oferece é ignorado.
  const aplicados = selecao.multiplicadores
    .filter((id) => item.multiplicadores.includes(id))
    .map(multiplicadorPorId)
    .filter((m) => m !== undefined);

  let total = subtotal;
  const acrescimos: LinhaOrcamento[] = [];

  if (aplicados.length > 0) {
    if (COMBINACAO_MULTIPLICADORES === "soma") {
      // Cada acréscimo incide sobre o subtotal original.
      for (const m of aplicados) {
        const valor = centavos(subtotal * m.percentual);
        acrescimos.push({
          descricao: `${m.nome} (+${Math.round(m.percentual * 100)}%)`,
          valor,
        });
      }
      total = centavos(subtotal + acrescimos.reduce((s, a) => s + a.valor, 0));
    } else {
      // Composto: cada acréscimo incide sobre o total já acrescido.
      let corrente = subtotal;
      for (const m of aplicados) {
        const valor = centavos(corrente * m.percentual);
        acrescimos.push({
          descricao: `${m.nome} (+${Math.round(m.percentual * 100)}%)`,
          valor,
        });
        corrente = centavos(corrente + valor);
      }
      total = corrente;
    }
  }

  const plano = selecao.planoRecorrenteId
    ? PLANOS_RECORRENTES.find((p) => p.id === selecao.planoRecorrenteId)
    : undefined;

  return {
    sobOrcamento: false,
    aPartirDe: base.aPartirDe,
    base: base.linha,
    modulos,
    subtotal,
    acrescimos,
    total,
    mensal: plano
      ? { descricao: `Plano ${plano.nome}`, valor: plano.valorMensal }
      : null,
  };
}

const BRL_INTEIRO = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const BRL_CENTAVOS = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

/** A tabela é escrita em reais cheios; centavos só aparecem quando existem. */
export function formatarBRL(valor: number): string {
  return Number.isInteger(valor)
    ? BRL_INTEIRO.format(valor)
    : BRL_CENTAVOS.format(valor);
}
