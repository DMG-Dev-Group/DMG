"use client";

import { useSyncExternalStore } from "react";

/**
 * Diz se esta sessão pode carregar as cenas 3D pesadas.
 *
 * Regra do projeto: nada de WebGL sob `prefers-reduced-motion` nem em tela
 * estreita — no celular o custo não se paga e as seções têm fallback próprio.
 *
 * Por que `useSyncExternalStore` e não `useEffect` + `setState`: o servidor não
 * tem como saber a resposta, então o primeiro render precisa assumir "não" e
 * corrigir no cliente. Feito com efeito, isso é um render extra em cascata a
 * cada montagem, logo antes de subir um canvas — e era o padrão duplicado no
 * clímax e nos projetos. Aqui a resposta entra já no primeiro render do
 * cliente, e a assinatura mantém o valor certo se a pessoa girar o aparelho ou
 * mudar a preferência de movimento no meio da visita.
 */

const CONSULTAS = ["(prefers-reduced-motion: reduce)", "(max-width: 768px)"];

function assinar(aoMudar: () => void) {
  const listas = CONSULTAS.map((q) => window.matchMedia(q));
  listas.forEach((l) => l.addEventListener("change", aoMudar));
  return () => listas.forEach((l) => l.removeEventListener("change", aoMudar));
}

function noCliente() {
  return CONSULTAS.every((q) => !window.matchMedia(q).matches);
}

// No servidor a resposta é sempre "não": renderiza o fallback e o cliente
// promove para 3D se for o caso. O contrário causaria hydration mismatch.
const noServidor = () => false;

export function use3DPermitido(): boolean {
  return useSyncExternalStore(assinar, noCliente, noServidor);
}
