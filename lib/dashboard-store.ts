import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { categoriaPorId, itemPorId } from "@/data/services";
import type { LeadPayload } from "@/lib/leads";
import type { Orcamento } from "@/lib/orcamento";
import type { ResultadoSaida } from "@/lib/lead-store";

/**
 * Ponte pro Firestore do Dashboard (`dmgdev-group`, repo DMG-Dev-Group/Dashboard).
 *
 * O Dashboard já é construído em cima de um padrão de tempo real: seu
 * `StoreProvider` escuta um conjunto fixo de coleções via `onSnapshot`, e o
 * hook `useNotificacoes` já vinha com o comentário "pedido de contato pelo
 * site... entra aqui conforme os gatilhos forem implementados". Este arquivo
 * é esse gatilho — grava direto nas coleções que o painel já observa, sem
 * precisar de webhook, endpoint novo ou polling. O dashboard só precisa
 * aprender a escutar a coleção `leads` (mudança de uma linha no
 * `StoreProvider` de lá).
 *
 * Duas coleções, uma escrita:
 *  - `leads`      — registro completo, fonte pro hook de notificações e pra
 *                    uma tela de leads.
 *  - `atividades` — o mesmo formato que `StoreProvider.log()` já grava
 *                    (`{ tipo, texto, ts }`), então a Timeline da Visão Geral
 *                    mostra o lead na hora, sem eu tocar nessa tela.
 *
 * A Admin SDK ignora as regras do Firestore (elas só valem pro SDK de
 * cliente) — por isso a chave de serviço é tão sensível quanto a
 * SUPABASE_SERVICE_ROLE_KEY e só pode viver no servidor.
 */

let _app: App | null = null;
let _db: Firestore | null = null;

function getDb(): Firestore | null {
  const chave = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!chave) return null;

  if (!_app) {
    // getApps() evita reinicializar em hot-reload do Next.js dev.
    const existente = getApps().find((a) => a.name === "dashboard");
    if (existente) {
      _app = existente;
    } else {
      let serviceAccount: Record<string, string>;
      try {
        serviceAccount = JSON.parse(chave);
      } catch {
        console.error("[DMG] FIREBASE_SERVICE_ACCOUNT_KEY não é um JSON válido");
        return null;
      }
      _app = initializeApp({ credential: cert(serviceAccount) }, "dashboard");
    }
    _db = getFirestore(_app);
  }
  return _db;
}

export async function gravarNoDashboard(
  payload: LeadPayload,
  orcamento: Orcamento | null,
): Promise<ResultadoSaida> {
  const db = getDb();
  if (!db) return { ok: false, detalhe: "dashboard não configurado" };

  const categoria = categoriaPorId(payload.categoriaId);
  const item = payload.itemId ? itemPorId(payload.itemId) : null;
  const comValor = orcamento && !orcamento.sobOrcamento ? orcamento : null;
  const agora = Date.now();

  const lead = {
    nome: payload.contato.nome.trim(),
    whatsapp: payload.contato.whatsapp.trim(),
    email: payload.contato.email.trim(),
    empresa: payload.contato.empresa.trim() || null,
    categoria: categoria?.nome ?? payload.categoriaId,
    item: item?.nome ?? null,
    modalidade: payload.modalidade,
    planoRecorrente: orcamento?.mensal?.descricao ?? null,
    subtotal: comValor?.subtotal ?? null,
    total: comValor?.total ?? null,
    sobOrcamento: orcamento?.sobOrcamento ?? true,
    comentario: payload.comentario.trim() || null,
    modulos: comValor?.modulos ?? [],
    multiplicadores: comValor?.acrescimos ?? [],
    criadoEm: agora,
  };

  const resumoValor = lead.sobOrcamento
    ? "sob orçamento"
    : lead.modalidade === "aluguel"
      ? `aluguel · ${lead.planoRecorrente ?? ""}`
      : `R$ ${new Intl.NumberFormat("pt-BR").format(lead.total ?? 0)}`;

  try {
    // Duas escritas, uma promessa só: se qualquer uma falhar, o try/catch
    // trata como falha única — é o mesmo lead, não faz sentido salvar meio.
    await Promise.all([
      db.collection("leads").add(lead),
      db.collection("atividades").add({
        tipo: "lead",
        texto: `Novo lead — ${lead.nome} — ${lead.categoria}${lead.item ? ` / ${lead.item}` : ""} — ${resumoValor}`,
        ts: agora,
      }),
    ]);
    return { ok: true, detalhe: "gravado" };
  } catch (err) {
    return { ok: false, detalhe: `dashboard: ${String(err)}` };
  }
}
