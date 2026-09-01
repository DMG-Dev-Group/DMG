export type ProjectStatus = "producao" | "desenvolvimento" | "em-breve";

export type Project = {
  id: string;
  nome: string;
  tagline: string;
  papel: string; // o que a DMG fez
  stack: string[];
  ano: string;
  resultado?: string; // 1 métrica/entrega concreta
  status: ProjectStatus;
  device: "browser" | "phone" | "laptop";
  /**
   * Demonstração em loop (gif) dentro do device frame. Sem ela, a seção mostra
   * um placeholder com o nome do projeto e "preview em breve" — que é um
   * estado digno, não um buraco. Para plugar: solte o arquivo em
   * `public/projetos/` e aponte aqui.
   */
  demo?: string;
  /** Domínio exibido na barra do device frame. */
  host?: string;
  url?: string;
};

/**
 * Projetos reais da DMG. A ordem aqui é a ordem de aparição no scroll —
 * carro-chefe primeiro. Adicionar projeto = adicionar objeto; a seção é
 * orientada a conteúdo e se ajusta sozinha.
 *
 * Portfólio inventado em site institucional é risco: basta um cliente
 * perceber para queimar a credibilidade inteira. Por isso aqui só entram
 * projetos que existem — os três fictícios do site antigo (NexusOS, VaultPay,
 * CoreLink) ficaram de fora por decisão da DMG.
 *
 * Hoje só Flora Beauty e CNM têm gravação; os outros mostram o placeholder
 * com o nome e "preview em breve".
 */
export const projects: Project[] = [
  {
    id: "flora-beauty",
    nome: "Flora Beauty",
    tagline:
      "E-commerce de perfumes, maquiagem e acessórios — varejo e atacado (B2B com CNPJ).",
    papel: "Full stack: design, frontend, banco e autenticação.",
    stack: [
      "JavaScript (ES modules)",
      "Cloud Firestore",
      "Firebase Auth",
      "Firebase Hosting",
    ],
    ano: "2025",
    resultado:
      "Loja em produção: catálogo, carrinho, checkout e login (e-mail + Google).",
    status: "producao",
    device: "browser",
    demo: "/projetos/flora-beauty.gif",
    host: "flora-5754a.web.app",
    url: "https://flora-5754a.web.app",
  },
  {
    id: "cnm",
    nome: "CNM — Copa Nexus Monospoto",
    tagline:
      "Portal de campeonato de corrida: landing + painel administrativo completo.",
    papel: "Full stack: portal público, dashboard admin e modelagem de dados.",
    stack: ["JavaScript", "Cloud Firestore", "Firebase Hosting"],
    ano: "2026",
    resultado:
      "Classificação calculada automaticamente a partir dos resultados; notícias, calendário, hall da fama e equipes gerenciados pelo admin.",
    status: "producao",
    device: "browser",
    demo: "/projetos/cnm.gif",
    host: "cnm-rose.vercel.app",
    url: "https://cnm-rose.vercel.app",
  },
  {
    id: "sangre-canvas",
    nome: "SANGRE — Component Canvas",
    tagline:
      "Produto próprio: editor visual de páginas (builder no-code) com drag-and-drop.",
    papel: "Produto DMG: arquitetura, editor, biblioteca de seções e exportação.",
    stack: [
      "TanStack Start",
      "React",
      "TypeScript",
      "Radix UI / shadcn",
      "dnd-kit",
      "Vite",
    ],
    ano: "2026",
    resultado: "Canvas com device frames, edição de tipografia, multi-página e export.",
    status: "desenvolvimento",
    device: "laptop",
  },
  {
    id: "tendresse",
    nome: "Tendresse Perfumaria",
    tagline:
      "Site para rede de perfumaria com 26 anos e lojas em São Luís (MA).",
    papel: "Design e desenvolvimento web (em concepção).",
    stack: ["React", "Vite"],
    ano: "2026",
    status: "em-breve",
    device: "browser",
    host: "tendresse.com.br",
  },
];

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  producao: "EM PRODUÇÃO",
  desenvolvimento: "EM DESENVOLVIMENTO",
  "em-breve": "EM BREVE",
};
