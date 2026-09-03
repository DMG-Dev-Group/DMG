import { formatarBRL, type Orcamento } from "@/lib/orcamento";
import { LIMITE_COMENTARIO, type LeadPayload } from "@/lib/leads";
import { categoriaPorId, itemPorId } from "@/data/services";

/**
 * Saídas do lead: gravar no Supabase e avisar a DMG por email.
 *
 * Ambas falam HTTP direto, sem SDK. São uma inserção e um envio — os SDKs
 * oficiais só acrescentariam duas dependências para o mesmo POST. Trocar por
 * `@supabase/supabase-js` e `resend` depois é substituir o corpo destas duas
 * funções, nada mais.
 *
 * Nenhuma das duas derruba o pedido: se o email falhar, o lead já está salvo;
 * se o Supabase falhar, o email ainda avisa a DMG. O que não pode acontecer é
 * o visitante preencher tudo e ver um erro por causa de serviço de terceiro.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const LEAD_EMAIL_TO = process.env.LEAD_EMAIL_TO;
const LEAD_EMAIL_FROM = process.env.LEAD_EMAIL_FROM;

export type ResultadoSaida = { ok: boolean; detalhe: string };

/** Linha da tabela `leads`. O SQL está em docs/GUIA-MANUTENCAO.md. */
function linhaDoLead(payload: LeadPayload, orcamento: Orcamento | null) {
  const categoria = categoriaPorId(payload.categoriaId);
  const item = payload.itemId ? itemPorId(payload.itemId) : null;
  // Item sem preço de tabela grava total nulo, não zero: R$ 0,00 numa planilha
  // de leads parece um orçamento fechado de graça.
  const comValor = orcamento && !orcamento.sobOrcamento ? orcamento : null;

  return {
    categoria_id: payload.categoriaId,
    categoria_nome: categoria?.nome ?? payload.categoriaId,
    item_id: payload.itemId,
    item_nome: item?.nome ?? null,
    modulos: comValor?.modulos ?? [],
    multiplicadores: comValor?.acrescimos ?? [],
    subtotal: comValor?.subtotal ?? null,
    total: comValor?.total ?? null,
    sob_orcamento: orcamento?.sobOrcamento ?? true,
    modalidade: payload.modalidade,
    plano_recorrente: orcamento?.mensal?.descricao ?? null,
    comentario: payload.comentario.slice(0, LIMITE_COMENTARIO),
    nome: payload.contato.nome.trim(),
    whatsapp: payload.contato.whatsapp.trim(),
    email: payload.contato.email.trim(),
    empresa: payload.contato.empresa.trim() || null,
  };
}

export async function gravarLead(
  payload: LeadPayload,
  orcamento: Orcamento | null,
): Promise<ResultadoSaida> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { ok: false, detalhe: "supabase não configurado" };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(linhaDoLead(payload, orcamento)),
    });

    if (!res.ok) {
      return { ok: false, detalhe: `supabase ${res.status}: ${await res.text()}` };
    }
    return { ok: true, detalhe: "gravado" };
  } catch (err) {
    return { ok: false, detalhe: `supabase: ${String(err)}` };
  }
}

const escapar = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function corpoDoEmail(payload: LeadPayload, orcamento: Orcamento | null) {
  const categoria = categoriaPorId(payload.categoriaId);
  const item = payload.itemId ? itemPorId(payload.itemId) : null;

  const linhas: string[] = [];
  const par = (rotulo: string, valor: string) =>
    linhas.push(
      `<tr><td style="padding:4px 16px 4px 0;color:#8a8a93">${rotulo}</td><td style="padding:4px 0"><strong>${escapar(valor)}</strong></td></tr>`,
    );

  par("Nome", payload.contato.nome);
  par("WhatsApp", payload.contato.whatsapp);
  par("Email", payload.contato.email);
  if (payload.contato.empresa) par("Empresa", payload.contato.empresa);
  par("Categoria", categoria?.nome ?? payload.categoriaId);
  if (item) par("Item", item.nome);

  par("Modalidade", payload.modalidade === "aluguel" ? "ALUGUEL (mensal)" : "Compra");

  // O que a pessoa configurou (base + módulos + multiplicadores) aparece
  // sempre, comprando ou alugando — o aluguel só ACRESCENTA a linha do plano
  // no fim. Antes, o caminho de aluguel parava na linha do plano e nunca
  // dizia o que exatamente ela tinha marcado: a DMG via "alugar, R$ 400/mês"
  // sem saber que era um site institucional com blog e 3 páginas extras.
  if (orcamento && !orcamento.sobOrcamento) {
    par("Base", `${orcamento.base.descricao} — ${formatarBRL(orcamento.base.valor)}`);
    for (const m of orcamento.modulos) par("Módulo", `${m.descricao} — ${formatarBRL(m.valor)}`);
    for (const a of orcamento.acrescimos) par("Acréscimo", `${a.descricao} — ${formatarBRL(a.valor)}`);
    par(
      payload.modalidade === "aluguel" ? "Valor de compra equivalente" : "TOTAL",
      `${orcamento.aPartirDe ? "a partir de " : ""}${formatarBRL(orcamento.total)}`,
    );
  } else {
    par("TOTAL", "sob orçamento");
  }

  if (payload.modalidade === "aluguel" && orcamento?.mensal) {
    par(
      "Plano escolhido",
      `${orcamento.mensal.descricao} — ${formatarBRL(orcamento.mensal.valor)}/mês`,
    );
  }

  const comentario = payload.comentario.trim();

  return `<div style="font-family:ui-sans-serif,system-ui,sans-serif;color:#111">
  <h2 style="margin:0 0 16px">Novo lead do configurador</h2>
  <table style="border-collapse:collapse;font-size:14px">${linhas.join("")}</table>
  ${
    comentario
      ? `<p style="margin-top:20px;font-size:14px"><span style="color:#8a8a93">Comentário:</span><br>${escapar(comentario).replace(/\n/g, "<br>")}</p>`
      : ""
  }
  <p style="margin-top:24px;font-size:12px;color:#8a8a93">
    Enviado pelo site da DMG · ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
  </p>
</div>`;
}

export async function notificarDMG(
  payload: LeadPayload,
  orcamento: Orcamento | null,
): Promise<ResultadoSaida> {
  if (!RESEND_API_KEY || !LEAD_EMAIL_TO || !LEAD_EMAIL_FROM) {
    return { ok: false, detalhe: "email não configurado" };
  }

  const categoria = categoriaPorId(payload.categoriaId);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: LEAD_EMAIL_FROM,
        to: [LEAD_EMAIL_TO],
        // Responder o email cai direto no cliente, sem copiar endereço à mão.
        reply_to: payload.contato.email.trim(),
        subject: `[DMG] Lead — ${categoria?.nome ?? payload.categoriaId} — ${payload.contato.nome.trim()}`,
        html: corpoDoEmail(payload, orcamento),
      }),
    });

    if (!res.ok) {
      return { ok: false, detalhe: `resend ${res.status}: ${await res.text()}` };
    }
    return { ok: true, detalhe: "enviado" };
  } catch (err) {
    return { ok: false, detalhe: `resend: ${String(err)}` };
  }
}
