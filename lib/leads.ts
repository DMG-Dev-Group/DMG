import { categoriaPorId, itemPorId } from "@/data/services";
import type { Selecao } from "@/lib/orcamento";

/**
 * Contrato do lead — compartilhado entre o formulário e a API.
 *
 * A validação vive aqui, e não só no componente, porque o navegador é do
 * usuário: a mesma função roda no servidor antes de qualquer gravação. O
 * total também é recalculado lá — o que chega do cliente é sugestão, não
 * verdade.
 */

export type Contato = {
  nome: string;
  whatsapp: string;
  email: string;
  empresa: string;
};

export type LeadPayload = {
  categoriaId: string;
  itemId: string | null;
  modulos: { id: string; quantidade: number }[];
  multiplicadores: string[];
  gramas?: number;
  quantidade?: number;
  planoRecorrenteId?: string | null;
  comentario: string;
  contato: Contato;
  consentimento: boolean;
  /** Honeypot: campo escondido que só um bot preenche. */
  website?: string;
};

export type ErrosLead = Partial<Record<keyof Contato | "consentimento" | "categoria", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Só os dígitos: aceita "(51) 99999-9999", "+55 51 99999 9999" etc. */
export const digitos = (v: string) => v.replace(/\D/g, "");

export function validarLead(payload: LeadPayload): ErrosLead {
  const erros: ErrosLead = {};
  const { contato } = payload;

  const nome = contato.nome?.trim() ?? "";
  if (nome.length < 2) erros.nome = "Diz teu nome.";
  else if (nome.length > 120) erros.nome = "Nome longo demais.";

  const email = contato.email?.trim() ?? "";
  if (!email) erros.email = "Precisamos de um email pra responder.";
  else if (!EMAIL.test(email) || email.length > 200)
    erros.email = "Esse email não parece válido.";

  const zap = digitos(contato.whatsapp ?? "");
  if (!zap) erros.whatsapp = "Precisamos de um WhatsApp pra te chamar.";
  else if (zap.length < 10 || zap.length > 15)
    erros.whatsapp = "Número incompleto — inclui o DDD.";

  if ((contato.empresa?.length ?? 0) > 140)
    erros.empresa = "Nome de empresa longo demais.";

  if (!payload.consentimento)
    erros.consentimento = "Precisamos do seu aceite pra guardar seus dados.";

  // A categoria sempre existe; o item pode ser nulo em "sob consulta".
  if (!categoriaPorId(payload.categoriaId)) erros.categoria = "Categoria inválida.";
  else if (payload.itemId && !itemPorId(payload.itemId))
    erros.categoria = "Item inválido.";

  return erros;
}

export const temErro = (erros: ErrosLead) => Object.keys(erros).length > 0;

/** Recorta o payload para o formato que `calcularOrcamento` espera. */
export function selecaoDoPayload(payload: LeadPayload): Selecao | null {
  if (!payload.itemId) return null;
  return {
    itemId: payload.itemId,
    modulos: payload.modulos,
    multiplicadores: payload.multiplicadores,
    gramas: payload.gramas,
    quantidade: payload.quantidade,
    planoRecorrenteId: payload.planoRecorrenteId ?? null,
  };
}

export const LIMITE_COMENTARIO = 2000;
