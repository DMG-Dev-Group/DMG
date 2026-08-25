/**
 * Fonte única de verdade dos preços do site — transcrição da Tabela Comercial
 * DMG (Revisão 01). Nenhum valor deve ser escrito em JSX: tudo sai daqui.
 *
 * Como mexer: para reajustar preço, edite o número aqui e mais nada. Para
 * incluir um serviço novo, adicione o item em ITENS e cite o id na categoria.
 * A matemática do orçamento vive em `lib/orcamento.ts`.
 *
 * ⚠️ Os valores da tabela são "líquidos para o parceiro". A DMG decidiu
 * publicá-los como estão (docs/0001 §3, reconfirmado na execução).
 */

// ---------------------------------------------------------------------------
// Multiplicadores — incidem sobre (base + módulos), nunca sobre linha isolada.
// ---------------------------------------------------------------------------

export type Multiplicador = {
  id: string;
  nome: string;
  detalhe: string;
  /** 0.35 = +35% */
  percentual: number;
};

export const MULTIPLICADORES: Multiplicador[] = [
  {
    id: "design-exclusivo",
    nome: "Design exclusivo",
    detalhe: "Layout sob medida, em vez de template",
    percentual: 0.35,
  },
  {
    id: "urgencia",
    nome: "Urgência",
    detalhe: "Prazo abaixo do padrão",
    percentual: 0.3,
  },
];

/**
 * Como dois multiplicadores marcados juntos se combinam.
 * "soma"     → total × (1 + 0.35 + 0.30) = ×1,65
 * "composto" → total × 1,35 × 1,30       = ×1,755
 *
 * TODO(DMG) Q12: pendente de confirmação. "soma" é o padrão até lá — mexe em
 * quanto a DMG cobra, então a troca é de uma linha só.
 */
export const COMBINACAO_MULTIPLICADORES: "soma" | "composto" = "soma";

// ---------------------------------------------------------------------------
// Módulos adicionais (tabela "Módulos adicionais", pág. 2)
// ---------------------------------------------------------------------------

export type Modulo = {
  id: string;
  nome: string;
  valor: number;
  /** Cobrado por unidade → a UI mostra stepper de quantidade, não checkbox. */
  porUnidade?: boolean;
  /** Rótulo do contador, no singular. */
  unidade?: string;
};

export const MODULOS: Modulo[] = [
  {
    id: "secao-extra",
    nome: "Seção extra",
    valor: 150,
    porUnidade: true,
    unidade: "seção",
  },
  {
    id: "pagina-extra",
    nome: "Página extra",
    valor: 300,
    porUnidade: true,
    unidade: "página",
  },
  { id: "login-autenticacao", nome: "Login / autenticação", valor: 500 },
  { id: "painel-administrativo", nome: "Painel administrativo", valor: 1000 },
  {
    id: "gateway-pagamento",
    nome: "Gateway de pagamento",
    valor: 800,
    porUnidade: true,
    unidade: "gateway",
  },
  {
    id: "integracao-api",
    nome: "Integração de API externa",
    valor: 700,
    porUnidade: true,
    unidade: "integração",
  },
  { id: "blog-cms", nome: "Blog / CMS editável", valor: 900 },
  { id: "relatorios-exportacao", nome: "Relatórios + exportação", valor: 800 },
  {
    id: "perfil-usuario-adicional",
    nome: "Perfil de usuário adicional",
    valor: 600,
    porUnidade: true,
    unidade: "perfil",
  },
  { id: "multi-idioma", nome: "Multi-idioma", valor: 700 },
];

// ---------------------------------------------------------------------------
// Itens — cada linha das tabelas "Software" (pág. 1) e "Hardware & Robótica"
// (pág. 2). `preco` diz como o configurador calcula e o que mostra.
// ---------------------------------------------------------------------------

export type Preco =
  /** Piso do escopo mínimo. Exibe "a partir de R$ X". */
  | { tipo: "a-partir-de"; valor: number }
  /** Preço fechado por unidade. Exibe "R$ X / <unidade>". */
  | { tipo: "por-unidade"; valor: number; unidade: string }
  /** setup + (porGrama × gramas). O configurador pede as gramas. */
  | { tipo: "formula-impressao"; setup: number; porGrama: number }
  /** Sem preço de tabela: vai direto ao formulário. */
  | { tipo: "sob-orcamento" };

export type Item = {
  id: string;
  nome: string;
  /** Coluna "escopo incluso" / "detalhe" do PDF, palavra por palavra. */
  escopo: string;
  preco: Preco;
  /** Módulos oferecidos para este item, na ordem de exibição. */
  modulos: string[];
  /** Multiplicadores oferecidos. Vazio = nenhum. */
  multiplicadores: string[];
  /**
   * Pede uma descrição extra antes do orçamento — para itens cujo preço varia
   * com algo que só a pessoa sabe (quantidade e tipo de componente, etc).
   */
  campoLivre?: string;
};

const MULT_SOFTWARE = ["design-exclusivo", "urgencia"];
// TODO(DMG) Q27: "Design exclusivo" não faz sentido em solda/impressão 3D, mas
// "Urgência" faz. Assumido só urgência no hardware — confirmar.
const MULT_HARDWARE = ["urgencia"];

export const ITENS: Item[] = [
  // --- Software -----------------------------------------------------------
  {
    id: "landing-page",
    nome: "Landing page",
    escopo: "1 página, até 4 seções, responsivo, formulário de contato",
    preco: { tipo: "a-partir-de", valor: 500 },
    modulos: ["secao-extra", "integracao-api", "multi-idioma"],
    multiplicadores: MULT_SOFTWARE,
  },
  {
    id: "site-institucional",
    nome: "Site institucional",
    escopo: "Até 5 páginas, responsivo, SEO básico",
    preco: { tipo: "a-partir-de", valor: 2000 },
    modulos: [
      "pagina-extra",
      "blog-cms",
      "login-autenticacao",
      "painel-administrativo",
      "integracao-api",
      "multi-idioma",
    ],
    multiplicadores: MULT_SOFTWARE,
  },
  {
    id: "sistema-interno",
    nome: "Sistema interno / dashboard",
    escopo: "Autenticação, 1 perfil de usuário, CRUDs, painel",
    preco: { tipo: "a-partir-de", valor: 3000 },
    // Login e painel já entram no base — oferecê-los como extra seria cobrar
    // duas vezes pela mesma coisa.
    modulos: [
      "perfil-usuario-adicional",
      "relatorios-exportacao",
      "integracao-api",
      "multi-idioma",
    ],
    multiplicadores: MULT_SOFTWARE,
  },
  {
    id: "ecommerce",
    nome: "E-commerce",
    escopo: "Catálogo até 30 produtos, carrinho, 1 gateway, painel",
    preco: { tipo: "a-partir-de", valor: 5500 },
    // O base já traz 1 gateway e o painel: aqui o gateway é o 2º em diante.
    modulos: [
      "gateway-pagamento",
      "login-autenticacao",
      "blog-cms",
      "relatorios-exportacao",
      "integracao-api",
      "multi-idioma",
    ],
    multiplicadores: MULT_SOFTWARE,
  },
  {
    id: "saas-mvp",
    nome: "SaaS — MVP",
    escopo: "Multi-tenant, planos, billing",
    preco: { tipo: "a-partir-de", valor: 10000 },
    // Multi-tenant já implica autenticação; billing já implica gateway.
    modulos: [
      "perfil-usuario-adicional",
      "relatorios-exportacao",
      "integracao-api",
      "multi-idioma",
    ],
    multiplicadores: MULT_SOFTWARE,
  },

  // --- Hardware & Robótica ------------------------------------------------
  {
    id: "solda-through-hole",
    nome: "Solda through-hole",
    escopo: "Variação conforme quantidade e tipo de componente",
    preco: { tipo: "a-partir-de", valor: 30 },
    modulos: [],
    multiplicadores: MULT_HARDWARE,
    campoLivre: "Quantos componentes, de que tipo? Descreva a placa.",
  },
  {
    id: "solda-smd",
    nome: "Solda SMD",
    escopo: "Variação conforme quantidade e densidade da placa",
    preco: { tipo: "a-partir-de", valor: 100 },
    modulos: [],
    multiplicadores: MULT_HARDWARE,
    campoLivre: "Quantos componentes e qual a densidade da placa?",
  },
  {
    id: "impressao-3d",
    nome: "Impressão 3D",
    escopo: "R$ 25 de setup + R$ 1,50 por grama de material",
    preco: { tipo: "formula-impressao", setup: 25, porGrama: 1.5 },
    modulos: [],
    multiplicadores: MULT_HARDWARE,
  },
  {
    id: "modelagem-3d",
    nome: "Modelagem 3D (peça sob medida)",
    escopo: "Modelagem para fabricação, por peça",
    preco: { tipo: "por-unidade", valor: 50, unidade: "peça" },
    modulos: [],
    multiplicadores: MULT_HARDWARE,
  },
  {
    id: "robo-pequeno-carcaca",
    nome: "Robô pequeno — carcaça",
    escopo: "Estrutura, modelagem e fabricação, sem eletrônica",
    preco: { tipo: "sob-orcamento" },
    modulos: [],
    multiplicadores: [],
  },
  {
    id: "robo-pequeno-completo",
    nome: "Robô pequeno — completo",
    escopo: "Carcaça + eletrônica + firmware, funcional",
    preco: { tipo: "sob-orcamento" },
    modulos: [],
    multiplicadores: [],
  },
  {
    id: "robo-medio-carcaca",
    nome: "Robô médio — carcaça",
    escopo: "Estrutura, modelagem e fabricação, sem eletrônica",
    preco: { tipo: "sob-orcamento" },
    modulos: [],
    multiplicadores: [],
  },
  {
    id: "robo-medio-completo",
    nome: "Robô médio — completo",
    escopo: "Carcaça + eletrônica + firmware, funcional",
    preco: { tipo: "sob-orcamento" },
    modulos: [],
    multiplicadores: [],
  },
];

// ---------------------------------------------------------------------------
// Categorias — os cards da seção Serviços. Título e descrição vêm do
// `servicos.tsx` do DMG-DEF; os itens, do mapeamento de docs/0001 §3.
// ---------------------------------------------------------------------------

export type Categoria = {
  id: string;
  nome: string;
  descricao: string;
  /** Ids de ITENS, na ordem em que aparecem no modal nível 1. */
  itens: string[];
  /** Texto fixo no rodapé do modal — ex.: material de hardware. */
  aviso?: string;
  /** Categoria sem tabela: o card vai direto ao contato. */
  sobConsulta?: boolean;
};

export const CATEGORIAS: Categoria[] = [
  {
    id: "sistemas-web",
    nome: "Sistemas web sob medida",
    descricao:
      "Plataformas internas, portais e soluções de negócio pensadas para operar em produção com arquitetura que escala sem quebrar.",
    itens: ["landing-page", "site-institucional", "sistema-interno"],
  },
  {
    id: "saas",
    nome: "Produtos SaaS",
    descricao:
      "Do MVP ao produto pronto para crescer: multiusuário, billing, gestão e experiência de uso 100% escalável.",
    itens: ["saas-mvp"],
  },
  {
    id: "ecommerce",
    nome: "E-commerce",
    descricao:
      "Lojas digitais com catálogo, checkout, gestão de pedidos e operações projetadas para vender com menos atrito.",
    itens: ["ecommerce"],
  },
  {
    id: "dashboards",
    nome: "Dashboards & dados",
    descricao:
      "Painéis e métricas que transformam informação em decisão em tempo real.",
    // Mesmo item de "Sistemas web sob medida", mesmo preço (docs/0001 §3, Q13).
    itens: ["sistema-interno"],
  },
  {
    id: "robotica",
    nome: "Robótica",
    descricao:
      "Soluções de automação e integração física/digital para otimizar a operação e acelerar processos complexos.",
    itens: [
      "solda-through-hole",
      "solda-smd",
      "impressao-3d",
      "modelagem-3d",
      "robo-pequeno-carcaca",
      "robo-pequeno-completo",
      "robo-medio-carcaca",
      "robo-medio-completo",
    ],
    aviso:
      "Material não incluso. Componentes, filamento e peças são repassados ao custo de compra com acréscimo de 30%, discriminados em linha separada no orçamento final.",
  },
  {
    id: "ia-automacoes",
    nome: "Integração com IA & automações",
    descricao:
      "Fluxos inteligentes, assistentes, automações e integrações que reduzem retrabalho e aumentam eficiência operacional.",
    itens: [],
    sobConsulta: true,
  },
];

// ---------------------------------------------------------------------------
// Recorrência (pág. 3). A tabela diz que todo projeto entregue sai com plano.
// TODO(DMG) Q8: obrigatório no configurador, opcional, ou fora do site?
// Enquanto não há resposta, `RECORRENCIA_NO_CONFIGURADOR` mantém os planos
// fora do fluxo — dado transcrito e pronto, é ligar a flag.
// ---------------------------------------------------------------------------

export const RECORRENCIA_NO_CONFIGURADOR: "obrigatoria" | "opcional" | "oculta" =
  "oculta";

export type PlanoRecorrente = {
  id: string;
  nome: string;
  inclui: string;
  valorMensal: number;
  /** Plano de hardware não se aplica a projeto de software, e vice-versa. */
  escopo: "software" | "hardware";
};

export const PLANOS_RECORRENTES: PlanoRecorrente[] = [
  {
    id: "essencial",
    nome: "Essencial",
    inclui: "Hospedagem, backup, monitoramento e 1h de ajustes",
    valorMensal: 180,
    escopo: "software",
  },
  {
    id: "plus",
    nome: "Plus",
    inclui: "Tudo do Essencial + 3h de ajustes + relatório mensal",
    valorMensal: 400,
    escopo: "software",
  },
  {
    id: "full",
    nome: "Full",
    inclui:
      "Tudo do Plus + 8h + prioridade de atendimento + evolução contínua",
    valorMensal: 800,
    escopo: "software",
  },
  {
    id: "manutencao-hardware",
    nome: "Manutenção hardware",
    inclui: "Revisão periódica e pequenos reparos",
    valorMensal: 120,
    escopo: "hardware",
  },
];

// ---------------------------------------------------------------------------
// Condições comerciais (pág. 3).
// TODO(DMG) Q15: exibir como letra miúda no configurador, ou não publicar?
// `CONDICOES_VISIVEIS` liga/desliga sem mexer no texto.
// ---------------------------------------------------------------------------

export const CONDICOES_VISIVEIS = false;

export const CONDICOES_COMERCIAIS: { item: string; condicao: string }[] = [
  {
    item: "Pagamento",
    condicao:
      "40% na assinatura · 60% na entrega. Projetos longos são divididos em marcos.",
  },
  {
    item: "Escopo",
    condicao:
      "Formalizado por escrito antes do início. Pedido fora do escopo gera orçamento complementar.",
  },
  {
    item: "Infraestrutura",
    condicao:
      "Hospedagem, domínio e licenças por conta do cliente, ou repassados com acréscimo.",
  },
  {
    item: "Prazo",
    condicao:
      "Definido por projeto após fechamento do escopo. Redução de prazo aplica o multiplicador de urgência.",
  },
  {
    item: "Garantia",
    condicao:
      "30 dias de correção de defeitos sem custo após a entrega. Não cobre novas funcionalidades.",
  },
];

/** Nota de rodapé obrigatória sempre que um "a partir de" aparece na tela. */
export const NOTA_A_PARTIR_DE =
  "Valores “a partir de” representam o piso para o escopo mínimo descrito. O valor final é confirmado em proposta formal após o levantamento de requisitos.";

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export const itemPorId = (id: string) => ITENS.find((i) => i.id === id);
export const moduloPorId = (id: string) => MODULOS.find((m) => m.id === id);
export const categoriaPorId = (id: string) =>
  CATEGORIAS.find((c) => c.id === id);
export const multiplicadorPorId = (id: string) =>
  MULTIPLICADORES.find((m) => m.id === id);
