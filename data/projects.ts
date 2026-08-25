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
  /** Clipe curto mudo em loop. TODO: colocar os arquivos em /public/projetos/ */
  videoLoop?: { mp4: string; webm?: string };
  /** Demo real em loop (gif) — mostrado no device frame quando presente. */
  demo?: string;
  /** Frame estático — sempre presente. TODO: exportar de cada projeto. */
  poster: string;
  /** Domínio exibido na barra do device frame. */
  host?: string;
  url?: string;
};

/**
 * Projetos reais da DMG. Ordem = ordem de aparição no scroll (carro-chefe primeiro).
 * Adicionar projeto = adicionar objeto aqui; a seção é orientada a conteúdo.
 *
 * ASSETS: enquanto não houver screen recordings reais, o device frame mostra um
 * poster placeholder elegante. Para plugar o real, basta soltar os arquivos em
 * /public/projetos/ com os nomes abaixo — o componente já usa video + poster.
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
    videoLoop: {
      mp4: "/projetos/flora-beauty.mp4",
      webm: "/projetos/flora-beauty.webm",
    },
    demo: "/projetos/flora-beauty.gif",
    poster: "/projetos/flora-beauty.jpg",
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
    videoLoop: { mp4: "/projetos/cnm.mp4", webm: "/projetos/cnm.webm" },
    demo: "/projetos/cnm.gif",
    poster: "/projetos/cnm.jpg",
    host: "cnm-rose.vercel.app",
    url: "https://cnm-rose.vercel.app",
  },
  {
    id: "amira",
    nome: "AMIRA",
    tagline:
      "Perfumaria árabe premium. Vitrine de luxo: linha Asaad, acessórios e iPhones.",
    papel: "Design e frontend: 3D interativo e animações de scroll.",
    stack: [
      "Next.js 16",
      "TypeScript",
      "Tailwind v4",
      "GSAP + ScrollTrigger",
      "Lenis",
      "Spline (3D)",
    ],
    ano: "2026",
    resultado: "Cena 3D + motion refinado, design minimalista border-driven.",
    status: "desenvolvimento",
    device: "browser",
    poster: "/projetos/amira.jpg",
    host: "amira.com.br",
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
    poster: "/projetos/sangre.jpg",
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
    poster: "/projetos/tendresse.jpg",
    host: "tendresse.com.br",
  },
];

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  producao: "EM PRODUÇÃO",
  desenvolvimento: "EM DESENVOLVIMENTO",
  "em-breve": "EM BREVE",
};
