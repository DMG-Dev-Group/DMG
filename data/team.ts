/**
 * Os três fundadores da DMG. Conteúdo portado 1:1 de
 * `legacy/damage_group_landing.html` (linhas 159-231).
 *
 * Só D/M/G entram aqui — decisão fechada em docs/0001 §7. Parceiro externo
 * não é integrante e não aparece em seção institucional.
 *
 * As idades foram confirmadas pela DMG em 2026 e **envelhecem sozinhas**: são
 * manutenção anual. Se um dia incomodar, trocar por ano de nascimento resolve
 * de vez. As fotos são as três que o site antigo já usava — `public/images/`
 * guarda variantes (dani/migas/mige/gui/d) que nunca entraram.
 */

export type LadoDoPainel = "direita" | "esquerda" | "dividido";

export type Fundador = {
  id: string;
  /** A letra gigante ao fundo do card — o D, o M e o G de DMG. */
  letra: string;
  nome: string;
  idade: string;
  foto: string;
  /** Card G: a foto original olha para fora do trio; espelhar corrige. */
  espelharFoto?: boolean;
  stack: string[];
  /** Em telas grandes, de que lado do card o painel abre. */
  painel: LadoDoPainel;
};

export const FUNDADORES: Fundador[] = [
  {
    id: "d",
    letra: "D",
    nome: "Daniel",
    idade: "18 anos",
    foto: "/images/dan.png",
    stack: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker"],
    painel: "direita",
  },
  {
    id: "m",
    letra: "M",
    nome: "Miguel",
    idade: "19 anos",
    foto: "/images/migo.png",
    stack: ["Python", "Flutter", "Firebase", "Go", "AWS"],
    // Card do meio: não há lado livre, então nome e stack abrem um para cada lado.
    painel: "dividido",
  },
  {
    id: "g",
    letra: "G",
    nome: "Guilherme",
    idade: "18 anos",
    foto: "/images/guigui.png",
    espelharFoto: true,
    stack: ["Rust", "Next.js", "Redis", "Kubernetes", "GraphQL"],
    painel: "esquerda",
  },
];
