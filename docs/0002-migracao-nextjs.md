# 0002 — Execução: migração do site DMG para Next.js

**Status:** em andamento
**Branch:** `claude/dmg-react-tailwind-nextjs-p5pn3h`
**Plano de origem:** [`0001-planejamento-reconstrucao-site-dmg.md`](./0001-planejamento-reconstrucao-site-dmg.md)

Este documento é o log da execução do plano 0001: o que foi feito, por quê, e o
que ficou pendente. O 0001 não é editado — ele registra o planejamento como foi
fechado. Divergências entre o plano e o que foi construído ficam registradas
aqui, com o motivo.

---

## Correspondência de repositórios

O plano 0001 usa nomes locais de pasta que **não** batem com os nomes dos
repositórios no GitHub. Confirmado com a DMG antes de começar:

| Nome no plano 0001 | Repositório real | Papel |
|---|---|---|
| `DMG_site` | `DMG-Dev-Group/DMG` | **Destino.** É este repo. |
| `DMG-DEF` | `DMG-Dev-Group/DMG-Site` | Doador de stack/efeitos. Somente leitura. |
| `CNM` | `DMG-Dev-Group/CNM` | Doador da intro/splash. Somente leitura. |

O repositório que se *chama* `DMG-Site` é o doador; o que se chama `DMG` é o
destino. Quem pegar esta migração no meio precisa saber disso antes de abrir
qualquer arquivo.

## Decisões tomadas na execução (fora do plano 0001)

| # | Decisão | Motivo |
|---|---|---|
| 1 | O projeto Next.js do doador foi **copiado inteiro** como base, em vez de reconstruído peça a peça | O `DMG-Site` não é uma biblioteca de componentes: é uma landing page da DMG completa e funcionando. Portar arquivo por arquivo seria reescrever à mão código já validado, com risco de perder detalhe de efeito. |
| 2 | Next.js na **raiz** do repo, sem subpasta `DMG_site/` | A pasta `DMG_site/` do plano é nome de pasta local, não estrutura de repositório. |
| 3 | Branch `claude/dmg-react-tailwind-nextjs-p5pn3h` em vez de `feature/migracao-nextjs` | É a branch da sessão de execução. |
| 4 | Site antigo movido para `legacy/`, não apagado | É a fonte de referência da portabilidade do Hero, dos Fundadores e do modal `packageOverlay`. Sai do repo quando a migração fechar. |
| 5 | Intro ganhou **skip por clique/ESC** | A versão completa leva ~7s. Quem chega de busca ou anúncio não deve ser obrigado a esperar. |
| 6 | Preços continuam sendo os da tabela de parceiro, publicados como estão | Risco levantado na análise (a tabela é um documento de parceiro, com valores líquidos da DMG) e reconfirmado pela DMG como decisão consciente. |
| 7 | Supabase e Resend são chamados por `fetch`, sem SDK | É uma inserção e um envio. Os SDKs oficiais acrescentariam duas dependências para o mesmo POST. Trocar depois é reescrever duas funções em `lib/lead-store.ts`. |
| 8 | A seção Contato virou uma faixa discreta | O CTA grande agora é o do clímax, logo acima dela. Duas chamadas de ação em tela cheia seguidas competiriam entre si — e o funil que qualifica o lead é o configurador. |
| 9 | Cadeia do cristal 3D removida (`hero-core`, `core-canvas`, `core-poster`, `crystal`, `damage-scroll`, `lib/damage.ts`, shaders) | Ficou órfã quando o hero voltou a ser o canvas 2D do site real. O clímax usa os *shards*, não o cristal íntegro. ~450 linhas de código morto que só confundiriam quem pegasse o projeto depois; o histórico do git guarda tudo. |

## Progresso por passo do plano (§8)

| Passo | Estado | Onde |
|---|---|---|
| 1. Branch de migração | ✅ | `claude/dmg-react-tailwind-nextjs-p5pn3h` |
| 2. Scaffold Next.js + Tailwind + GSAP | ✅ | raiz do repo |
| 3. Tokens de design `@theme` | ✅ | `app/globals.css` (vieram com o scaffold) |
| 4. Logo SVG + intro/splash | ✅ | `public/dmg-logo.svg`, `components/intro/` |
| 5. `data/services.ts` | ✅ estrutura pronta, **aguarda revisão da DMG** | `data/services.ts`, `lib/orcamento.ts` |
| 6. Hero, Fundadores, Footer 1:1 | ✅ | `sections/hero.tsx`, `sections/fundadores.tsx`, `footer.tsx` |
| 6b. Portfólio 1:1 | ⛔ **bloqueado na Q21** | ainda o `projetos.tsx` do doador |
| 7. Missão/Visão/Valores/Objetivo | ✅ | `sections/missao-visao-valores.tsx` |
| 8. Configurador de Serviços + API + Supabase + email | ✅ | `ui/service-modal.tsx`, `api/leads/route.ts`, `lib/lead-store.ts` |
| 9. Stack no lugar do "Quem somos"; remover Investimento | ✅ | `sections/stack.tsx`; "Investimento" não voltou |
| 10. CTA final com o efeito de cristal | ✅ | `sections/climax.tsx` |
| 11. `GUIA-MANUTENCAO.md` completo | 🔄 incremental | [`GUIA-MANUTENCAO.md`](./GUIA-MANUTENCAO.md) |

## Pendências que dependem da DMG

Marcadas no código como `TODO(DMG) Qn`. Nenhuma bloqueia o que já foi feito;
todas mudam uma linha de configuração quando a resposta chegar.

| # | Pergunta | Onde está o `TODO` | Assumido até lá |
|---|---|---|---|
| Q6 | Deploy ativo hoje? Domínio real? | `app/layout.tsx` (`metadataBase`) | `https://damage.group`, herdado do doador |
| Q7 | Contas Supabase / email transacional | — | Código + `.env.example`, contas criadas depois |
| Q8 | Recorrência entra no configurador? | `data/services.ts` (`RECORRENCIA_NO_CONFIGURADOR`) | `"oculta"` |
| Q12 | Multiplicadores empilhados: soma ou composto? | `data/services.ts` (`COMBINACAO_MULTIPLICADORES`) | `"soma"` (×1,65) |
| Q15 | Condições comerciais visíveis no site? | `data/services.ts` (`CONDICOES_VISIVEIS`) | `false` |
| Q17b | "12+ projetos entregues" ainda é verdade? | `sections/hero.tsx` | mantido como está |
| Q18 | Idades dos fundadores / quais fotos | — | mantido como está |
| Q21 | Portfólio real ou o atual | — | **bloqueia o passo 6b** — a seção segue com os projetos do doador |
| Q22b | WhatsApp oficial | `sections/contato.tsx`, `footer.tsx` | só email |
| Q27 | "Design exclusivo" se aplica a hardware? | `data/services.ts` (`MULT_HARDWARE`) | só "Urgência" no hardware |

## Verificações feitas

- `npm run build` e `npx tsc --noEmit` limpos a cada commit.
- Intro exercitada no Chromium via Playwright, frame a frame: desenho do
  traço, glow, subtext, remoção, gravação da flag, versão curta na segunda
  visita, skip por clique e por ESC, `prefers-reduced-motion`, ausência de JS
  e destravamento do scroll. Zero erro de console.
- Matemática do orçamento conferida contra a tabela do PDF em 18 casos,
  incluindo integridade referencial dos ids e rejeição de módulo/multiplicador
  que o item não oferece.

### Lint

`npx eslint .` acusa **10 erros**, todos em código herdado do doador que
sobreviveu à migração: `shards`, `reveal`, `climax`, `projetos` e
`magnetic-button`. Eram 13 — `hero` e `servicos` foram reescritos e saíram da
lista, e `hero-core` foi removido.

São regras novas do React Compiler que vieram com o `eslint-config-next` 16 e
que o repo doador nunca rodou (`setState` dentro de efeito, ref lida durante
render, chamada impura no corpo do componente). **Nenhum arquivo escrito nesta
migração acusa erro.**

Ficam para uma passada dedicada no fim: são correções de comportamento em
código que hoje funciona, e cada uma precisa ser conferida no navegador. Não é
trabalho para fazer de passagem no meio de outra coisa.
