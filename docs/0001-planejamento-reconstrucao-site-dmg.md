# 0001 — Planejamento: Reconstrução do site DMG (migração para React + Tailwind + Next.js)

**Status:** ✅ planejamento fechado. Este documento é o brief de execução — a produção em si acontece no Claude Code, não nesta sessão.
**Repositório oficial do projeto (destino final):** `DMG_site` — repo `DMG` no GitHub. É aqui que a stack nova será construída, substituindo o HTML/CSS/JS atual, preservando o histórico do repositório (branch de feature, não repo novo).
**Repositórios doadores de componentes/efeitos (não são a base, só fonte de peças a portar):** `DMG-DEF` (stack/efeitos React) e `CNM` (intro/splash).

---

## 0. Como usar este documento (leia primeiro)

Este é o brief de execução da migração. Regras de trabalho:

1. **Trabalhar dentro do repositório `DMG`** (branch de feature, ex: `feature/migracao-nextjs`) — é ele que vira o site novo. `DMG-DEF` e `CNM` **não são editados**, são só lidos como referência/fonte de código a portar.
2. Sempre que este documento apontar "portar de `DMG-DEF`/X" ou "portar de `CNM`/Y", **ler o arquivo real na fonte** (apêndice no final tem os caminhos exatos com linhas) em vez de reimplementar do zero só pela descrição em prosa — a descrição aqui é um resumo pra orientação, o código fonte é a verdade.
3. Se os repositórios `DMG-DEF` e `CNM` não estiverem anexados/acessíveis no ambiente onde este documento for executado, avisar antes de prosseguir — partes do plano (Serviços, Stack, Climax, Intro) dependem de portar código real de lá, não são só descrição.
4. Toda alteração feita a partir daqui deve ser documentada em `docs/000X-nome-da-mudança.md` (próximo número após este), seguindo o padrão da DMG, e o `docs/GUIA-MANUTENCAO.md` deve ser criado/atualizado incrementalmente conforme cada seção for construída — não deixar para o final.
5. Dúvida de decisão de produto/negócio (preço, texto institucional, comportamento) → perguntar ao usuário antes de assumir. Dúvida técnica de implementação (qual hook usar, como estruturar um componente) → decidir com base no padrão já estabelecido no `DMG-DEF` (é o padrão de qualidade validado pela DMG).

---

## 1. Objetivo

Reconstruir o site institucional da DMG **dentro do repositório `DMG` (pasta `DMG_site`)**, migrando de HTML/CSS/JS puro para **React + Tailwind + Next.js**, mantendo a essência/conteúdo que já existe ali, incorporando efeitos e seções específicas do `DMG-DEF`, portando a intro do projeto `CNM`, e adicionando: seção de Missão/Visão/Valores/Objetivo e um **configurador de orçamento interativo** dentro dos cards de Serviços (o funil principal de captação de projeto).

## 2. Diagnóstico dos repositórios

### `DMG_site` / repo `DMG` (destino final — HTML/CSS/JS hoje)
Arquivo único `damage_group_landing.html` + `css.css` + `script.js`. Ordem atual das seções:

1. **Hero** — headline "Código que causa impacto", canvas 2D com grid de "lajes" que se repelem no mouse + luz vermelha volumétrica (`GridSystem`/`GridTile` em `script.js`, sem Three.js), stats (12+, 100%, ∞).
2. **Carrossel/ticker** de skills (marquee simples) — **será substituído** pelo `StackMarquee` do `DMG-DEF` (ver seção 5).
3. **"O que fazemos"** — grid de 6 cards de serviço (Dev Web, Mobile, APIs, Cloud/DevOps, UI/UX, Consultoria).
4. **Fundadores (D/M/G)** — 3 cards clicáveis (foto + stack pessoal), lógica de "um ativo por vez" já funcionando em `script.js`.
5. **"Quem somos" (texto real)** — bloco com trecho de código estilizado + texto institucional + pills de tecnologia.
6. **"Investimento"** — 5 cards de pacote, clicáveis, abrindo um **modal já funcional** (`packageOverlay`) — a lógica em `script.js` (`packageInfo`, `renderPackageDetails`) é a base direta do configurador novo.
7. **"Portfólio"** — 3 cards de projeto.
8. **CTA "Pronto para causar dano?"** — texto + botões, sem efeito especial hoje.
9. **Footer**.

### `DMG-DEF` (Next.js 16 + React 19 + TS + Tailwind v4 — doador de componentes)

```
app/            layout.tsx, page.tsx, globals.css (design tokens @theme), opengraph-image.tsx
components/
  core/         Crystal (R3F + shader), hero-core, laptop 3D (notebook dos projetos), shards (climax)
  motion/       reveal.tsx (SplitReveal / Reveal com GSAP)
  scroll/       damage-scroll.tsx (fratura do core no scroll)
  sections/     preloader, hero, manifesto, servicos, stack, projetos, climax, time, contato
  ui/           section.tsx, hud.tsx, magnetic-button.tsx
  nav.tsx, footer.tsx, grain.tsx, scroll-progress.tsx, smooth-scroll.tsx
data/projects.ts
lib/            utils, shaders GLSL, stores de scroll (damage/projects/climax)
```

Dependências relevantes já validadas lá (referência pro que instalar no `DMG_site`): `gsap`, `lenis`, `@react-three/fiber` + `drei` + `postprocessing`, `three`, `lucide-react`, `clsx`/`tailwind-merge`. **`anime.js` não entra** — decidido usar só GSAP, que já cobre scroll/reveal/glitch.

Design tokens (`app/globals.css`, bloco `@theme`) **confirmados como paleta oficial** do site novo: `--color-void` (preto absoluto), `--color-carbon`/`--color-graphite` (superfícies escuras), `--color-red` / `--color-red-core` / `--color-bordo` (vermelho neon → bordô), `--color-bone`/`--color-ash` (branco quebrado/cinza).

### `CNM` (HTML/CSS/JS + Firebase — doador da intro)

Site institucional de outro projeto (Copa Nexus Monospoto) que usa **a própria logo/identidade DMG como splash de abertura** — é essa splash que deve ser portada para o site novo da DMG. Especificação técnica exata (pra o Claude Code portar fielmente):

- **Markup** (`index.html` linhas 18-36): `<div id="splash-screen" class="splash-container">` fixo, cobrindo 100% da viewport, fundo preto, `z-index: 9999`. Dentro dele, um SVG com o **logo DMG vetorizado** (grupos `.letter-d`, `.letter-m`, `.letter-g`, classe comum `.dmg-path` em cada `<path>`) + um `<div class="subtext">development group</div>` abaixo.
- **CSS** (`style.css` ~L1607-1670): `.splash-container` fixed/cobre tudo, `display:flex; justify-content:center; align-items:center`. `.logo-wrapper` e `.dmg-logo` entram com fade+scale via `@keyframes dmgFadeIn` (translateY 8px→0, scale 0.98→1, 1.15s). Cada `.dmg-path` começa com `stroke: #ff0000; fill: transparent; filter: drop-shadow(0 0 0px #ff0000)`. Enquanto a splash está visível, `body:not(.admin-body) main{ display:none }` esconde o conteúdo real.
- **Animação** (`script.js` ~L959-1075, GSAP puro, sem plugin DrawSVG — feito manualmente com `strokeDasharray`/`strokeDashoffset`):
  1. Pra cada `.dmg-path`, calcula `getTotalLength()` e seta `strokeDasharray = length` / `strokeDashoffset = length` (path invisível, "não desenhado").
  2. Timeline GSAP: anima `strokeDashoffset` até `0` (duração 3.5s, `power2.inOut`, `stagger: 0.2` entre as letras D/M/G) — efeito de "traço sendo desenhado".
  3. Sobrepõe um glow: anima `filter: drop-shadow(0 0 8px #FF3333)` nos paths (1.5s, começando 1.5s antes do fim do passo anterior).
  4. Fade-in do subtext "development group" (`opacity`+`y`, 0.9s).
  5. Segura a logo acesa por 1.5s (`holdTime`).
  6. Fade-out de toda a splash (`opacity → 0`, 1s, `power2.inOut`) → `display:none`, libera scroll do body, revela o conteúdo principal.
  - **Primeiro acesso vs. acessos seguintes**: usa `localStorage.getItem('dmg_intro_seen')`. Na primeira visita roda a animação completa (~7-8s no total) e grava a flag; nas visitas seguintes pula direto pro estado final (paths já desenhados, subtext já visível) e só faz um fade rápido de 0.5s + hold de 1s — não repete o "desenho" toda vez.
  - **Fail-safes**: timeout de 7s que força a revelação do conteúdo mesmo se a animação travar; checagem se `window.gsap` existe antes de animar (senão revela na hora); `try/catch` em volta de tudo; `window.resetIntro()` como helper de debug pra limpar a flag e testar de novo.

**Decisão de escopo:** essa splash roda com o **próprio logo DMG** (não precisa desenhar nada novo) — é praticamente plug-and-play, só precisa ser convertida pro padrão React/GSAP do projeto novo (useEffect + refs, ao invés de manipulação direta do DOM), reaproveitando o mesmo SVG (`public/dmg-logo.svg`, a extrair do `CNM/index.html`).

**Pergunta que ainda cabe validar com vocês (não bloqueante, decido com bom senso se não houver resposta):** manter o mesmo comportamento de "completa só no primeiro acesso, curta depois" (via `localStorage`), ou sempre tocar a versão completa? Meu plano é manter o comportamento original do `CNM` (primeiro acesso completo, depois curto) — é a experiência mais equilibrada entre impacto e não cansar quem já visitou.

## 3. Tabela comercial (PDF) — decisão fechada

**Os valores aparecem publicamente exatamente como estão na tabela do PDF** (ex: "Solda a partir de R$ 30", "Site institucional a partir de R$ 2.000"). Mapeamento de categorias:

| Card de Serviço | Alimentado por (PDF) |
|---|---|
| Sistemas web sob medida | Landing page + Site institucional + Sistema interno/dashboard |
| Produtos SaaS | SaaS — MVP |
| E-commerce | E-commerce |
| Dashboards & dados | Sistema interno/dashboard (compartilhado) |
| Robótica | Solda through-hole/SMD, Impressão 3D, Modelagem 3D, Robôs (maioria "sob orçamento") |
| Integração com IA & automações | sem correspondência direta no PDF hoje — fica com CTA "sob consulta" até termos itens de tabela |

Módulos adicionais e multiplicadores (Design exclusivo +35%, Urgência +30%) do PDF entram como **opções dentro do configurador** (seção 4).

## 4. Especificação do configurador de orçamento (a parte central do site)

Fluxo, do clique no card até o lead cair pra DMG:

1. **Card de categoria** (na seção Serviços) — ex: "Robótica", "Sistemas web sob medida". Clique abre um **modal/overlay** (mesmo padrão do `packageOverlay` que já existe e funciona no `DMG_site`, com o visual dos cards do `DMG-DEF`).
2. **Modal nível 1 — itens da categoria**: lista os itens daquela categoria com preço-base (ex: dentro de "Robótica" → Solda through-hole (a partir de R$30), Solda SMD, Impressão 3D, Robô pequeno, Robô médio...).
3. **Modal nível 2 — configurador do item escolhido**:
   - Descrição do item/escopo incluso (texto da coluna "escopo incluso"/"detalhe" do PDF).
   - **Módulos extras** relevantes àquela categoria, como checkboxes com preço próprio (ex: Login/autenticação R$500, Painel administrativo R$1.000) — vindos da tabela "Módulos adicionais".
   - **Multiplicadores** (Design exclusivo +35%, Urgência +30%) como checkboxes que recalculam o total.
   - **Total dinâmico**, atualizado em tempo real conforme a pessoa marca opções.
   - **Campo de descrição livre** — pra pessoa comentar algo específico do projeto dela.
   - **Formulário de contato**: Nome, WhatsApp, Email, Empresa.
4. **Envio**: o formulário vai pra uma **API route do Next.js**, que:
   - Salva o lead num banco (**Supabase** — Postgres gerenciado, já no ecossistema da DMG) com todos os campos: categoria, item, módulos escolhidos, multiplicadores, total calculado, comentário, dados de contato, timestamp.
   - Dispara uma **notificação automática por email pra DMG** assim que o lead entra (decisão fechada — não é Telegram nem WhatsApp API por enquanto).
5. **Confirmação pro usuário**: tela/estado de "recebemos, a DMG te chama em breve" — sem depender de o usuário clicar em nada mais.

### Notificação automática (arquitetura)

Decisão: API própria + banco + **notificação instantânea por email**, sem depender de link `wa.me` manual. Caminho:

- **Agora (MVP):** Next.js Route Handler recebe o POST → grava no Supabase → dispara email transacional pra DMG (ex: via Resend ou SendGrid — o Claude Code decide a ferramenta na hora da implementação, ambos têm free tier suficiente pro volume inicial) com todos os dados do lead formatados.
- **Depois (upgrade opcional, sem refazer o formulário):** se no futuro vocês quiserem, dá pra adicionar WhatsApp Cloud API como canal adicional (não substituto) assim que a verificação do Meta Business estiver pronta — o formulário e o backend não mudam, só se soma um canal de saída.

## 5. Mapa de migração seção a seção

| # | Seção final | Origem do conteúdo | Origem do efeito/UI | Ação |
|---|---|---|---|---|
| 0 | **Intro/Splash** | Logo DMG (SVG) | `CNM` (`index.html`/`script.js`/`style.css`, spec completa na seção 2) | Portar para componente React (ver spec acima) |
| 1 | ~~Preloader técnico do DMG-DEF~~ | — | — | **Substituído pela intro/splash do CNM** (decisão fechada) |
| 2 | Nav | `DMG_site` (labels/CTA) | `DMG-DEF` (`nav.tsx`, já responsivo/IntersectionObserver) | Portar estrutura, ajustar links |
| 3 | **Hero** | `DMG_site` 1:1, sem alteração de copy/efeito | `DMG_site` (canvas 2D grid) reescrito como componente React | `GridSystem`/`GridTile` → componente React (`useRef`+`useEffect`), sem Three.js |
| 4 | **Missão, Visão, Valores + Objetivo** (nova) | Rascunho a escrever (por mim ou pelo Claude Code, com base neste doc + no manifesto do `DMG-DEF`), revisão de vocês depois | Inspiração `assessorialpha.com` | Criar seção nova |
| 5 | Ticker/marquee de skills | — | `DMG-DEF` (`StackMarquee`, componente já pronto e mais bem resolvido) | **Substitui** o ticker atual do `DMG_site` (decisão fechada) |
| 6 | **Serviços** + configurador | PDF (seção 3/4 deste doc) | `DMG-DEF` (`servicos.tsx`, bento grid) + modal novo (configurador) | Substituir 100% a seção atual |
| 7 | Fundadores (D/M/G) | `DMG_site` 1:1 | `DMG_site` (clique único ativo) | Portar sem alterações — **só D/M/G**, Vinicius não é integrante da DMG (parceria externa que usa a conta Claude), não entra em nenhuma seção institucional |
| 8 | **Stack** (substitui "Quem somos" textual) | `DMG-DEF` (`stack.tsx`) | `DMG-DEF` | Portar como está — contagem "3 desenvolvedores" confirmada correta (D/M/G) |
| 9 | ~~Investimento~~ | — | — | **Removido** (redundante com o configurador de Serviços) |
| 10 | Portfólio | `DMG_site` 1:1 por ora | `DMG_site` | Manter; carrossel interativo com preview do site é fase futura |
| 11 | CTA "Pronto para causar dano?" | `DMG_site` (copy/botões) | `DMG-DEF` (`climax.tsx` + `crystal.tsx`/shards + `crystal-shader.ts` + `climax-scroll.ts`) | Fundir copy do `DMG_site` com o efeito visual do `climax.tsx` |
| 12 | Footer | `DMG_site` 1:1 | `DMG-DEF` (`footer.tsx`, estrutura mais limpa) | Portar conteúdo na estrutura nova |

## 6. Estrutura de pastas proposta (dentro do repo `DMG`)

```
DMG_site/                 (repo DMG no GitHub — vira o projeto Next.js)
├── app/
│   ├── layout.tsx         fontes, metadata/OG, smooth scroll
│   ├── page.tsx            ordem das seções
│   ├── globals.css         tokens @theme (herdados do DMG-DEF)
│   └── api/leads/route.ts  Route Handler — recebe o configurador, grava no Supabase, envia email
├── components/
│   ├── intro/                splash portada do CNM (componente React)
│   ├── core/                  3D do CTA final (crystal + shards), portado do DMG-DEF
│   ├── motion/                reveal.tsx (GSAP)
│   ├── sections/                hero, missao-visao-valores, servicos, fundadores, stack, portfolio, cta
│   └── ui/                      section.tsx, magnetic-button.tsx, service-modal.tsx (configurador, novo)
├── data/
│   ├── services.ts              categorias/itens/módulos/multiplicadores — fonte única de verdade dos preços
│   ├── projects.ts               portfólio
│   └── team.ts                   fundadores
├── lib/                          shaders, stores de scroll, utils
├── public/
│   ├── images/                    fotos dos fundadores (já existem em DMG_site/images)
│   └── dmg-logo.svg               extraído do CNM/index.html
└── docs/
    ├── 0001-planejamento-reconstrucao-site-dmg.md   (este arquivo)
    └── GUIA-MANUTENCAO.md                            (a criar durante a produção)
```

Git: manter o histórico do repo `DMG` — a migração acontece em cima do repositório existente (branch de feature, ex: `feature/migracao-nextjs`), não um repo novo.

## 7. Decisões fechadas nesta rodada de planejamento

- ✅ Preços exibidos como estão no PDF, dentro do configurador interativo.
- ✅ UX dos cards: modal/overlay (padrão já existente no `DMG_site`).
- ✅ Paleta: tokens `@theme` do `DMG-DEF`, sem alterações.
- ✅ Backend: Next.js API route + Supabase + **notificação por email** (não Telegram, não WhatsApp por ora).
- ✅ Sem `anime.js` — só GSAP.
- ✅ Ticker de skills substituído pelo `StackMarquee` do `DMG-DEF`.
- ✅ Intro/splash portada do projeto `CNM` (spec técnica completa na seção 2), substituindo o preloader técnico do `DMG-DEF`.
- ✅ Fundadores/Stack ficam só com D/M/G — Vinicius é parceiro externo, não integrante, não entra nessas seções.
- ✅ Repositório final: `DMG_site` (repo `DMG`). `DMG-DEF` e `CNM` são só doadores de peças.
- ✅ Missão/Visão/Valores/Objetivo: rascunho inicial escrito por mim/Claude Code, revisão de vocês depois.

## 8. Próximos passos (execução no Claude Code, não nesta sessão)

1. Abrir branch de migração dentro do repo `DMG` (`feature/migracao-nextjs`).
2. Adicionar o scaffold Next.js + Tailwind + GSAP (espelhando as deps do `DMG-DEF`: `gsap`, `lenis`, `@react-three/fiber`+`drei`+`postprocessing`, `three`, `lucide-react`, `clsx`/`tailwind-merge`).
3. Portar tokens de design (`@theme`) do `DMG-DEF/app/globals.css`.
4. Extrair o SVG do logo DMG de `CNM/index.html` pra `public/dmg-logo.svg` e construir o componente de intro/splash conforme a spec da seção 2.
5. Criar `data/services.ts` com a estrutura de categorias/itens/módulos/multiplicadores do PDF.
6. Portar Hero, Fundadores, Portfólio, Footer 1:1 (conteúdo do `DMG_site` atual, componentizado).
7. Construir a seção nova de Missão/Visão/Valores/Objetivo (rascunho, depois revisão).
8. Construir o configurador de Serviços (modal em 2 níveis + total dinâmico + formulário + API route + Supabase + email).
9. Portar a seção Stack (com `StackMarquee` no lugar do ticker antigo) no lugar do "Quem somos" textual; remover "Investimento".
10. Fundir o CTA final com o efeito de cristal/glitch do `climax.tsx`.
11. `docs/GUIA-MANUTENCAO.md` completo (onde mexer em cada texto, cor, imagem, API key etc.), seguindo o padrão de documentação da DMG.

---

## Apêndice — Referências diretas de arquivo (ler antes de reimplementar)

### Fonte: `DMG_site` (repo `DMG` — conteúdo a portar 1:1)
- `damage_group_landing.html` — todas as seções atuais (estrutura completa referenciada na seção 2 deste doc)
- `css.css`, `script.js` — estilos e comportamento atuais, incluindo o modal `packageOverlay`/`packageInfo`/`renderPackageDetails` (base direta do configurador de Serviços) e a lógica de clique único nos cards de fundadores
- `images/*.png` — fotos dos fundadores (dan.png, migo.png, guigui.png, e variantes dani/gui/migas/mige)

### Fonte: `DMG-DEF` (referência de stack/efeitos — não editar, só ler)
- `package.json` — dependências a replicar no `DMG` (`gsap`, `lenis`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `three`, `lucide-react`, `clsx`, `tailwind-merge`, Tailwind v4, TypeScript)
- `app/globals.css` — bloco `@theme` com os design tokens oficiais (void/carbon/graphite/red/red-core/bordo/bone/ash), utilities (`glow-red`, `clip-corner`, `hud`, `bloom-red`), keyframes (`dmg-glitch-in`, `dmg-marquee`, `dmg-pulse`) e o glitch RGB-split (`.glitch-text`)
- `app/layout.tsx` — padrão de fontes (`next/font`: Space Grotesk + Geist Mono), metadata/OG, composição de `SmoothScroll`/`ScrollProgress`/`Grain`
- `app/page.tsx` — padrão de composição de seções na página
- `components/sections/servicos.tsx` — bento grid de serviços (base visual dos cards de categoria, incluindo o tilt 3D no hover e o spotlight de cursor)
- `components/sections/stack.tsx` — seção Stack completa + `StackMarquee` (substitui o ticker antigo)
- `components/sections/climax.tsx` + `components/core/crystal.tsx` + `lib/shaders/crystal-shader.ts` + `lib/climax-scroll.ts` — efeito de cristal explodindo em shards + glitch de texto, a portar pro CTA final
- `components/nav.tsx`, `components/footer.tsx` — estrutura de nav (com `IntersectionObserver` pra link ativo) e footer
- `components/ui/section.tsx`, `components/ui/magnetic-button.tsx` — wrapper de seção com índice/label HUD, botão magnético
- `components/motion/reveal.tsx` — `SplitReveal`/`Reveal` (GSAP + SplitText) pros reveals de scroll
- `data/projects.ts` — padrão de estrutura de dados de portfólio (referência pra `team.ts`/`services.ts` novos)

### Fonte: `CNM` (referência da intro/splash — não editar, só ler)
- `index.html` linhas 18-36 — markup da splash: `#splash-screen`, SVG do logo DMG (`.letter-d`/`.letter-m`/`.letter-g`, cada `<path class="dmg-path">`) + `.subtext`
- `script.js` linhas 959-1075 — toda a lógica GSAP da animação (draw do stroke, glow, hold, fade-out, gate de primeiro acesso via `localStorage['dmg_intro_seen']`, timeout de segurança de 7s, `window.resetIntro()`)
- `style.css` linhas 1607-1670+ (bloco "Container da Splash Screen" em diante) — todo o CSS da splash (`.splash-container`, `.logo-wrapper`, `.dmg-logo`, `@keyframes dmgFadeIn`, `.dmg-path`, `.subtext`)

**Se o ambiente de execução não tiver o repo `CNM` anexado**, extrair manualmente esses três trechos antes de começar (o SVG do logo em especial precisa ser copiado por inteiro — é longo, várias centenas de linhas de `path`) e salvar como `DMG_site/public/dmg-logo.svg` + notas de referência, em vez de tentar recriar a animação sem o código original.

---

*Nota: uma cópia anterior e desatualizada deste arquivo ficou em `DMG-DEF/docs/` por um engano de rota inicial (achei que o `DMG-DEF` seria a base do projeto). Esta versão, em `DMG_site/docs/`, é a canônica.*
