"use client";

import { useEffect, useRef } from "react";

/**
 * HeroGrid — as "lajes" do hero, portadas do site antigo
 * (`legacy/script.js`, classes `GridTile` / `GridSystem`).
 *
 * A ideia: uma laje preta sólida por célula do grid, e por baixo de tudo uma
 * luz vermelha volumétrica presa ao cursor. As lajes se afastam do ponteiro,
 * a luz aparece pela fresta que elas abrem. Canvas 2D puro — nada de Three.js,
 * o efeito não precisa de WebGL e o hero não pode carregar esse peso.
 *
 * A física é a mesma do original, número por número. O que mudou, e por quê:
 *
 *  - Coordenadas do ponteiro. O original somava `window.scrollY` ao mouse e
 *    subtraía de novo só no cálculo da luz, então as lajes passavam a ser
 *    repelidas por um ponto deslocado assim que a página rolava. Aqui a
 *    posição é medida em relação ao canvas (`getBoundingClientRect`), o que
 *    dá certo em qualquer scroll.
 *  - Limite de deslocamento. O original elevava um dos eixos a 2.5; base
 *    negativa com expoente fracionário é `NaN` em JS, e a comparação com NaN
 *    é sempre falsa — na prática o teto nunca era aplicado. Corrigido para o
 *    quadrado, que é o que a fórmula queria dizer.
 *  - Resize refaz o grid (o original só redimensionava o canvas, e a área
 *    nova ficava vazia) e respeita `devicePixelRatio`.
 *  - O loop é cancelado no unmount, e nem começa sob `prefers-reduced-motion`.
 */

const GRID_SIZE = 60;
const REPEL_RADIUS = 280;

// Cores literais: o canvas não enxerga os tokens do @theme. Espelham
// --color-void e a faixa de vermelhos da marca.
const COR_LAJE = "#080808";
const COR_LINHA = "rgba(255, 255, 255, 0.1)";

type Tile = {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
};

function criarTiles(largura: number, altura: number): Tile[] {
  const tiles: Tile[] = [];
  for (let y = 0; y <= altura; y += GRID_SIZE) {
    for (let x = 0; x <= largura; x += GRID_SIZE) {
      tiles.push({ x, y, originX: x, originY: y, vx: 0, vy: 0 });
    }
  }
  return tiles;
}

function atualizarTile(tile: Tile, mouseX: number, mouseY: number) {
  const dx = tile.x - mouseX;
  const dy = tile.y - mouseY;
  const distancia = Math.hypot(dx, dy);

  if (distancia < REPEL_RADIUS) {
    const forca = (1 - distancia / REPEL_RADIUS) * 0.6;
    const angulo = Math.atan2(dy, dx);
    tile.vx += Math.cos(angulo) * forca * 3;
    tile.vy += Math.sin(angulo) * forca * 3;
  }

  tile.x += tile.vx;
  tile.y += tile.vy;

  tile.vx *= 0.8;
  tile.vy *= 0.8;

  // Elástico de volta à posição de origem.
  tile.vx += (tile.originX - tile.x) * 0.04;
  tile.vy += (tile.originY - tile.y) * 0.04;

  // Teto de deslocamento, para nenhuma laje sair voando do grid.
  const desvioX = tile.x - tile.originX;
  const desvioY = tile.y - tile.originY;
  const desvio = Math.hypot(desvioX, desvioY);
  const maximo = GRID_SIZE * 3;
  if (desvio > maximo) {
    const angulo = Math.atan2(desvioY, desvioX);
    tile.x = tile.originX + Math.cos(angulo) * maximo;
    tile.y = tile.originY + Math.sin(angulo) * maximo;
  }
}

function desenharLuz(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  largura: number,
  altura: number,
) {
  // Halo largo: o vermelho volumétrico que vaza entre as lajes.
  const halo = ctx.createRadialGradient(x, y, 0, x, y, REPEL_RADIUS * 1.8);
  halo.addColorStop(0, "rgba(220, 0, 0, 1)");
  halo.addColorStop(0.3, "rgba(150, 0, 0, 0.8)");
  halo.addColorStop(0.6, "rgba(80, 0, 0, 0.4)");
  halo.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, largura, altura);

  // Núcleo neon, mais quente e mais fechado.
  const nucleo = ctx.createRadialGradient(x, y, 0, x, y, REPEL_RADIUS * 0.6);
  nucleo.addColorStop(0, "rgba(255, 0, 50, 1)");
  nucleo.addColorStop(0.3, "rgba(255, 50, 100, 0.8)");
  nucleo.addColorStop(0.6, "rgba(220, 20, 60, 0.4)");
  nucleo.addColorStop(1, "rgba(192, 24, 26, 0)");
  ctx.fillStyle = nucleo;
  ctx.fillRect(0, 0, largura, altura);
}

function desenharTiles(ctx: CanvasRenderingContext2D, tiles: Tile[]) {
  ctx.lineWidth = 1;
  for (const tile of tiles) {
    const x = tile.x - GRID_SIZE / 2;
    const y = tile.y - GRID_SIZE / 2;
    ctx.fillStyle = COR_LAJE;
    ctx.fillRect(x, y, GRID_SIZE, GRID_SIZE);
    ctx.strokeStyle = COR_LINHA;
    ctx.strokeRect(x, y, GRID_SIZE, GRID_SIZE);
  }
}

export function HeroGrid({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let tiles: Tile[] = [];
    let largura = 0;
    let altura = 0;
    let raf = 0;

    // Começa no centro: no primeiro frame ainda não houve movimento do mouse,
    // e a luz encostada no canto superior esquerdo fica esquisita.
    const mouse = { x: 0, y: 0 };
    let mousePosicionado = false;

    const redimensionar = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      largura = rect.width;
      altura = rect.height;
      canvas.width = Math.round(largura * dpr);
      canvas.height = Math.round(altura * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      tiles = criarTiles(largura, altura);
      if (!mousePosicionado) {
        mouse.x = largura / 2;
        mouse.y = altura / 2;
      }
    };

    const desenharFrame = () => {
      ctx.fillStyle = COR_LAJE;
      ctx.fillRect(0, 0, largura, altura);
      desenharLuz(ctx, mouse.x, mouse.y, largura, altura);
      desenharTiles(ctx, tiles);
    };

    redimensionar();

    const semMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (semMovimento) {
      // Um frame só: o grid parado com a luz no centro. Sem loop, sem repulsão.
      desenharFrame();
    } else {
      const onPointerMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mousePosicionado = true;
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });

      const loop = () => {
        for (const tile of tiles) atualizarTile(tile, mouse.x, mouse.y);
        desenharFrame();
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      const observer = new ResizeObserver(redimensionar);
      observer.observe(canvas);

      return () => {
        cancelAnimationFrame(raf);
        observer.disconnect();
        window.removeEventListener("pointermove", onPointerMove);
      };
    }

    const observer = new ResizeObserver(() => {
      redimensionar();
      desenharFrame();
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  return (
    <canvas ref={canvasRef} aria-hidden className={className} />
  );
}
