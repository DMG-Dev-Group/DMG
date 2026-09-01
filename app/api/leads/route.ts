import type { NextRequest } from "next/server";
import { calcularOrcamento } from "@/lib/orcamento";
import {
  selecaoDoPayload,
  temErro,
  validarLead,
  type LeadPayload,
} from "@/lib/leads";
import { gravarLead, notificarDMG } from "@/lib/lead-store";

/**
 * POST /api/leads — recebe o configurador de orçamento.
 *
 * Ordem: honeypot → rate limit → validação → recálculo do total → Supabase →
 * email. O total que chega do navegador é descartado e recalculado aqui, a
 * partir dos ids: ninguém fecha um projeto de R$ 10.000 por R$ 1 mexendo no
 * devtools.
 *
 * Se as duas saídas falharem (serviço fora do ar, chave errada), o pedido
 * responde 502 e o formulário mostra o email direto da DMG — melhor perder o
 * registro automático do que perder o contato.
 */

export const dynamic = "force-dynamic";

// Rate limit de vizinhança: guarda o histórico recente por IP em memória.
// Vale por instância, então é barreira contra flood ingênuo, não contra
// ataque distribuído. Para isso, a barreira certa é na borda (Vercel/WAF).
const JANELA_MS = 10 * 60 * 1000;
const MAX_POR_JANELA = 5;
const historico = new Map<string, number[]>();

function excedeuLimite(ip: string): boolean {
  const agora = Date.now();
  const recentes = (historico.get(ip) ?? []).filter((t) => agora - t < JANELA_MS);
  recentes.push(agora);
  historico.set(ip, recentes);

  // Poda preguiçosa: sem isso o Map cresce para sempre numa instância longeva.
  if (historico.size > 5000) {
    for (const [chave, marcas] of historico) {
      if (marcas.every((t) => agora - t >= JANELA_MS)) historico.delete(chave);
    }
  }

  return recentes.length > MAX_POR_JANELA;
}

function ipDoPedido(req: NextRequest): string {
  const encaminhado = req.headers.get("x-forwarded-for");
  return encaminhado?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "desconhecido";
}

export async function POST(req: NextRequest) {
  let payload: LeadPayload;
  try {
    payload = (await req.json()) as LeadPayload;
  } catch {
    return Response.json({ erro: "Payload inválido." }, { status: 400 });
  }

  // Honeypot: responde 200 para o bot não aprender que foi barrado.
  if (payload.website) return Response.json({ ok: true });

  // Validação ANTES do rate limit, de propósito: quem erra o próprio email
  // três vezes seguidas não pode ficar trancado do lado de fora. Pedido
  // malformado custa um 422 e nada mais — não toca banco nem email —, então
  // só envio bem-formado consome cota.
  const erros = validarLead(payload);
  if (temErro(erros)) return Response.json({ erros }, { status: 422 });

  if (excedeuLimite(ipDoPedido(req))) {
    return Response.json(
      { erro: "Muitos envios seguidos. Tenta de novo daqui a pouco." },
      { status: 429 },
    );
  }

  const selecao = selecaoDoPayload(payload);
  const orcamento = selecao ? calcularOrcamento(selecao) : null;

  // Em paralelo: uma saída não deve esperar a outra para o visitante ver o
  // "recebemos". `allSettled` porque nenhuma das duas pode derrubar a outra.
  const [gravacao, email] = await Promise.allSettled([
    gravarLead(payload, orcamento),
    notificarDMG(payload, orcamento),
  ]);

  const resultado = (r: PromiseSettledResult<{ ok: boolean; detalhe: string }>) =>
    r.status === "fulfilled" ? r.value : { ok: false, detalhe: String(r.reason) };

  const g = resultado(gravacao);
  const e = resultado(email);

  if (!g.ok) console.error("[DMG] lead não gravado:", g.detalhe);
  if (!e.ok) console.error("[DMG] notificação não enviada:", e.detalhe);

  if (!g.ok && !e.ok) {
    return Response.json(
      { erro: "Não conseguimos registrar agora.", contatoDireto: true },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
