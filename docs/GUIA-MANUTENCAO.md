# Guia de manutenção — site DMG

Onde mexer em cada coisa, sem precisar entender o projeto inteiro.

Este guia cresce junto com a migração (ver
[`0002-migracao-nextjs.md`](./0002-migracao-nextjs.md)). Seções marcadas com
⏳ ainda não existem no site.

---

## Rodar o projeto

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build de produção
npm run lint    # eslint
```

Node 20.9+ obrigatório (exigência do Next.js 16). Este projeto usa **Turbopack
por padrão**, em dev e em build — não existe mais a flag `--turbopack`.

## Estrutura

```
app/          layout (fontes, metadata/OG), page (ordem das seções), globals.css
components/
  intro/      splash de abertura (portada do CNM)
  core/       3D: cristal do hero, shards do clímax, notebook dos projetos
  motion/     reveals de scroll (GSAP)
  sections/   uma pasta = uma seção da página
  ui/         section, magnetic-button, hud
data/         conteúdo e preços — texto e número moram aqui, não no JSX
lib/          matemática do orçamento, shaders, stores de scroll, utils
public/       imagens, logo, GIFs dos projetos
legacy/       site antigo em HTML/CSS/JS — só referência, não é servido
docs/         planejamento, log de execução e este guia
```

---

## Trocar cores

Tudo em `app/globals.css`, bloco `@theme`. Mudar `--color-red` ali propaga pro
site inteiro (as classes `bg-void`, `text-bone`, `border-hairline` etc. saem
desses tokens).

| Token | O que é |
|---|---|
| `--color-void` | Preto de fundo. O palco. |
| `--color-carbon` / `--color-graphite` | Superfícies escuras: cards, painéis. |
| `--color-red` | Vermelho neon. CTA, glow, destaque. |
| `--color-red-core` | Vermelho chapado. Logo, blocos do clímax. |
| `--color-bordo` | Vermelho profundo, para gradientes. |
| `--color-bone` / `--color-ash` | Texto primário (branco quebrado) e secundário. |

Regra da marca: **preto é o palco, vermelho é a única luz** — vermelho é
racionado de propósito. Cor nova entra como token, nunca hardcoded no JSX.

## Trocar preços

**Um arquivo só: `data/services.ts`.** Nenhum valor em real deve aparecer em
componente. Estrutura:

| Bloco | O que controla |
|---|---|
| `ITENS` | Cada linha da tabela comercial: nome, escopo incluso, preço-base. |
| `MODULOS` | Os módulos adicionais e seus valores. |
| `MULTIPLICADORES` | Design exclusivo (+35%) e Urgência (+30%). |
| `CATEGORIAS` | Os cards da seção Serviços e quais itens cada um abre. |
| `PLANOS_RECORRENTES` | Planos mensais (Essencial / Plus / Full / hardware). |
| `CONDICOES_COMERCIAIS` | Pagamento, escopo, infra, prazo, garantia. |

Tarefas comuns:

- **Reajustar um preço** → mude o número em `ITENS` ou `MODULOS`. Só isso.
- **Serviço novo** → adicione um objeto em `ITENS` e cite o `id` dele na
  categoria certa, em `CATEGORIAS.itens`.
- **Módulo novo** → adicione em `MODULOS` e cite o `id` na lista `modulos` de
  cada item que deve oferecê-lo. Módulo que nenhum item cita nunca aparece.
- **Cobrar por unidade** → `porUnidade: true` + `unidade: "gateway"`. A tela
  troca o checkbox por um contador.

### Chaves de comportamento

Três constantes no topo do arquivo mudam o funcionamento sem mexer em código:

| Constante | Valor hoje | O que faz |
|---|---|---|
| `COMBINACAO_MULTIPLICADORES` | `"soma"` | `"soma"` = +35% e +30% viram ×1,65. `"composto"` = ×1,755. |
| `RECORRENCIA_NO_CONFIGURADOR` | `"oculta"` | `"obrigatoria"` / `"opcional"` fazem os planos mensais entrarem no fluxo. |
| `CONDICOES_VISIVEIS` | `false` | `true` mostra as condições comerciais como letra miúda. |

As três estão marcadas com `TODO(DMG)` porque aguardam decisão — ver a tabela
de pendências em `0002-migracao-nextjs.md`.

### Onde a conta é feita

`lib/orcamento.ts`, função `calcularOrcamento`. É o **único** lugar do projeto
que faz conta com dinheiro. Se um total sair errado na tela, o problema está
ali, não no componente.

A regra da tabela: multiplicador incide sobre (base + módulos), nunca sobre
linha isolada. Por isso a função calcula subtotal primeiro, acréscimos depois.
Ela também ignora módulo ou multiplicador que o item não oferece — um id
adulterado vindo do navegador não consegue injetar linha no orçamento.

## Mexer na intro / splash

`components/intro/intro-splash.tsx`.

| O quê | Onde |
|---|---|
| Durações (desenho, glow, hold, fade) | objeto `T`, no topo do arquivo |
| Chave do "já viu a intro" | `SEEN_KEY = "dmg_intro_seen"` |
| Prazo do failsafe | `FAILSAFE_MS` (7s) |
| Aparência do traço (cor, espessura, glow) | `app/globals.css`, bloco `#dmg-splash .dmg-path` |
| O desenho do logo | `components/intro/dmg-logo.tsx` |

**Testar a versão completa de novo:** abra o console e rode `resetIntro()`. Ele
limpa a flag e recarrega.

**Comportamento:** primeiro acesso vê a animação inteira (~7s); visitas
seguintes veem uma versão curta, sem redesenhar. Clique ou ESC pulam a qualquer
momento. Sem JavaScript, a splash não aparece (um `<noscript>` a esconde) — o
site abre direto, em vez de ficar preso numa tela preta.

**Trocar o logo:** o SVG está inline em `dmg-logo.tsx` porque a animação precisa
medir cada traço com `getTotalLength()`, o que não funciona com `<img>`. Um logo
novo precisa entrar como `<path>` inline, cada um com `className="dmg-path"`.
A ordem dos paths no arquivo é a ordem do stagger (D → M → G). Há uma cópia
estática em `public/dmg-logo.svg` para usos comuns (favicon, OG, rodapé).

## Trocar textos

Cada seção é um componente em `components/sections/`. Texto direto no JSX.
Tom: curto, com autoridade, PT-BR.

## Trocar fotos e imagens

`public/images/` (fotos dos fundadores), `public/projetos/` (mídia do
portfólio). O nome do arquivo é citado no componente ou no `data/` da seção.

## Metadata, OG e domínio

`app/layout.tsx`: título, descrição, keywords, Open Graph e `metadataBase`
(a URL do site). O card de compartilhamento é gerado em
`app/opengraph-image.tsx`.

> ⚠️ `metadataBase` está em `https://damage.group`, herdado do repo doador.
> Confirmar o domínio real antes de publicar — links de OG e imagens absolutas
> saem errados se estiver incorreto.

## ⏳ Chaves de API e variáveis de ambiente

A definir quando o configurador for construído (Supabase + email transacional).
Nenhum segredo entra no repositório: `.env*` está no `.gitignore` e o projeto
vai trazer um `.env.example` com os nomes das variáveis, sem valores.

## Acessibilidade e performance

- Todo o 3D é `dynamic(ssr:false)` + lazy-mount: o chunk pesado (three) fica
  fora do first load, e os canvases pausam quando saem da tela.
- `prefers-reduced-motion` desliga scroll suave, parallax, glitch e o 3D
  pesado, e faz a intro revelar na hora, sem desenhar.
- Alterações de layout precisam continuar valendo no mobile, onde as seções
  empilham e o WebGL pesado não sobe.
