/**
 * Canais de contato oficiais da DMG. Ficam aqui porque aparecem em mais de um
 * lugar (faixa de contato, footer, e o email também no configurador) — número
 * de telefone repetido em três arquivos é como um deles fica desatualizado.
 */

const NUMERO_E164 = "5598970286636";

export const WHATSAPP = {
  /** Como a pessoa lê. */
  exibicao: "+55 98 7028-6636",
  /** Link direto de conversa, já com a mensagem inicial. */
  href: `https://wa.me/${NUMERO_E164}?text=${encodeURIComponent(
    "Olá! Vim pelo site da DMG e quero falar sobre um projeto.",
  )}`,
} as const;

export const EMAIL = "dmggroupdev@gmail.com";
