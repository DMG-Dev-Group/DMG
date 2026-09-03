"use client";

import { useEffect } from "react";
import { use3DPermitido } from "@/lib/use-3d-permitido";
import { projects } from "@/data/projects";

/**
 * Aquece os dois chunks pesados de WebGL (o notebook de Projetos, os cacos do
 * Climax) e as demos dos projetos (imagem, gif ou vídeo) assim que o site
 * abre, em vez de deixar cada um ser buscado pela primeira vez só quando a
 * pessoa rola até a seção — que é exatamente o instante em que a experiência
 * trava/pisca. `import()` aqui mira o mesmo módulo que o `dynamic()` de cada
 * seção; o cache de módulos do navegador/bundler garante que, quando a seção
 * realmente montar o componente, o chunk já está pronto — sem nova rede, sem
 * nova compilação. As demos entram pelo cache HTTP do navegador do mesmo
 * jeito — `Image()` pra imagem/gif, `fetch()` pra vídeo (mesma origem, então
 * não esbarra em CORS; um `<video>` não tem equivalente ao `new Image()`).
 *
 * `requestIdleCallback` empurra isso pra depois que o navegador respirar, pra
 * não competir por CPU com a animação da intro logo na abertura.
 */
export function Preload3D() {
  const enable3D = use3DPermitido();

  useEffect(() => {
    if (!enable3D) return;

    const aquecer = () => {
      import("@/components/core/laptop-canvas");
      import("@/components/core/shards-canvas");
      for (const p of projects) {
        if (!p.demo) continue;
        if (/\.(mp4|webm)$/.test(p.demo)) {
          fetch(p.demo).catch(() => {});
        } else {
          const img = new Image();
          img.src = p.demo;
        }
      }
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(aquecer, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }

    const id = window.setTimeout(aquecer, 1500);
    return () => window.clearTimeout(id);
  }, [enable3D]);

  return null;
}
