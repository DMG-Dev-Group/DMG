# 0002 — Execução: migração do site DMG para Next.js

**Status:** construção concluída; aguardando contas de Supabase/Resend e domínio
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
| 10 | No card de fundador **ativo**, a foto continua recortada pelo card | O CSS antigo tinha `.card.active { overflow: visible }` e a foto estourava por cima de tudo. Fica dramático, mas no site antigo isso empurra os painéis de info para fora da tela — dá para ver os textos cortados nas bordas. Contido aqui; é uma linha para reverter, se a DMG preferir o estouro. |
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
| 7. Missão/Visão/Valores/Objetivo | ✅ | `sections/missao-visao-valores.tsx` |
| 8. Configurador de Serviços + API + Supabase + email | ✅ | `ui/service-modal.tsx`, `api/leads/route.ts`, `lib/lead-store.ts` |
| 9. Stack no lugar do "Quem somos"; remover Investimento | ✅ | `sections/stack.tsx`; "Investimento" não voltou |
| 10. CTA final com o efeito de cristal | ✅ | `sections/climax.tsx` |
| 6b. Portfólio | ✅ | `data/projects.ts`, `sections/projetos.tsx` |
| 11. `GUIA-MANUTENCAO.md` completo | ✅ | [`GUIA-MANUTENCAO.md`](./GUIA-MANUTENCAO.md) |

## Pendências que dependem da DMG

O bloco de perguntas foi respondido. O que sobrou:

| Assunto | Situação |
|---|---|
| Domínio / deploy | Não existe deploy ativo hoje. `metadataBase` está em `https://damage.group` como placeholder, marcado com `TODO(DMG)` em `app/layout.tsx`. Trocar antes de publicar. |
| Supabase, Resend e Firebase (Dashboard) | Contas do site criadas e testadas de ponta a ponta pela DMG durante o QA (26/08). Código, SQL, `.env.example` e passo a passo prontos no guia. |
| GitHub e LinkedIn | Os dois links do footer ainda apontam para `#`; faltam as URLs dos perfis. |
| Fotos e vídeos do portfólio | Só Flora Beauty e CNM têm gravação. SANGRE e Tendresse mostram o placeholder "preview em breve". |
| Idades dos fundadores | Confirmadas (18/19/18) e **envelhecem sozinhas** — viram manutenção anual. |

### Respostas que viraram código

| # | Resposta | Onde |
|---|---|---|
| Q6 | Sem deploy ativo; domínio placeholder | `app/layout.tsx` |
| Q7 | Opção (A): código + `.env.example`, contas depois. Notificação para dmggroupdev@gmail.com | `lib/lead-store.ts`, `.env.example` |
| Q8 | Recorrência é **modelo de pagamento alternativo**, não adicional: comprar OU alugar | `data/services.ts` (`permiteAluguel`), `ui/service-modal.tsx` |
| Q12 | Multiplicadores somam (×1,65) | `data/services.ts` |
| Q15 | Condições comerciais como letra miúda | `data/services.ts` (`CONDICOES_VISIVEIS: true`) |
| Q17 | "12+ projetos entregues" removido; grid de 3 para 2 | `sections/hero.tsx` |
| Q18 | Daniel 18, Miguel 19, Guilherme 18; fotos dan/migo/guigui | `data/team.ts` |
| Q21 | Flora Beauty, CNM, SANGRE, Tendresse. AMIRA fora | `data/projects.ts` |
| Q22 | WhatsApp +55 98 7028-6636 na faixa de contato e no footer | `data/contato.ts` |
| Q27 | Só "Urgência" no hardware; "Design exclusivo" não se aplica | `data/services.ts` (`MULT_HARDWARE`) |

## Integração com o Dashboard interno (26/08)

Depois do QA da DMG confirmar Supabase e email funcionando de ponta a ponta,
surgiu um pedido novo: unificar o site com o painel interno da DMG
(`DMG-Dev-Group/Dashboard`, `dmgdev-group` no Firebase) — receber notificação
lá quando um lead chega, e não só no email.

Investigação (só leitura, antes de mexer): o Dashboard já roda em cima de um
padrão de tempo real (`StoreProvider` escutando Firestore via `onSnapshot`) e
o hook de notificações já trazia o comentário *"pedido de contato pelo site...
entra aqui conforme os gatilhos forem implementados"* — a peça estava
desenhada, só faltava a ligação. Decisão: em vez de webhook ou endpoint novo,
o site escreve direto nas coleções que o painel já observa. O Dashboard só
precisou de uma linha a mais na lista de coleções escutadas.

- `lib/dashboard-store.ts` (novo, neste repo): grava em `leads` e `atividades`
  via Firebase Admin, em paralelo com Supabase e email — nenhuma das três
  saídas bloqueia as outras.
- No repo do Dashboard: `types.ts` (tipo `Lead`), `StoreProvider.tsx`
  (`"leads"` na lista de coleções), `useNotificacoes.ts` (leads recentes viram
  notificação), `navItems.ts` (item "Leads" no menu) e duas telas novas —
  `LeadsView`/`LeadsViewClassic`, uma pra cada visual do painel — porque cada
  view do Dashboard já existe em duas peles e não fazia sentido a página de
  leads ser a exceção.

Verificado com a chave de serviço real (não simulada): escrita direta no
Firestore de produção confirmada com leitura de volta; `npm run build` do
Dashboard compilando as duas telas novas (`_auth.leads`) e a rota registrada
certo na árvore de rotas gerada; `tsc --noEmit` e lint limpos nos arquivos
tocados (o lint do Dashboard já tinha ~90 problemas pré-existentes em
arquivos que este trabalho não tocou — não é regressão). Documentos de teste
ficaram no Firestore de propósito, pra DMG ver com os próprios olhos antes de
apagar.

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

`npx eslint .` está **limpo**. Eram 13 erros no scaffold, todos herdados do
doador — regras novas do React Compiler que vieram com o `eslint-config-next`
16 e que aquele repo nunca rodou.

Foram corrigidos na causa, não silenciados: PRNG determinístico no lugar de
`Math.random()` durante o render dos cacos; `useSyncExternalStore` no lugar do
`useEffect` + `setState` que decidia se podia subir WebGL; o loop de rAF do
botão magnético movido para um ref em vez de se referenciar por nome; e
`createElement` trocado por JSX polimórfico no `reveal`.

Cada um foi conferido no navegador antes de entrar — o botão magnético foi
medido antes e depois com o mesmo roteiro e bate dígito a dígito.
