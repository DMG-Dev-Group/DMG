"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { DmgLogo } from "./dmg-logo";
import { getLenis } from "@/components/smooth-scroll";

/**
 * IntroSplash — a splash de abertura da DMG, portada do projeto CNM
 * (`script.js` L959-1075 / `style.css` L1607+). Substitui o preloader técnico
 * que vinha do DMG-DEF (decisão fechada, docs/0001 §5).
 *
 * O desenho do traço é DrawSVG feito na mão: mede `getTotalLength()` de cada
 * path, seta `strokeDasharray`/`strokeDashoffset` e anima o offset até zero.
 *
 * Três garantias de que a splash nunca prende o site:
 *  1. failsafe de 7s que revela o conteúdo aconteça o que acontecer;
 *  2. try/catch em volta do timeline — erro de GSAP revela na hora;
 *  3. `<noscript>` no JSX esconde a splash quando não há JS pra removê-la.
 */

declare global {
  interface Window {
    /** Helper de debug — ver `resetIntro` no fim deste arquivo. */
    resetIntro?: () => void;
  }
}

const SEEN_KEY = "dmg_intro_seen";
const FAILSAFE_MS = 7000;

// Durações do CNM, mantidas 1:1 (docs/0001 §2).
const T = {
  draw: 3.5,
  drawStagger: 0.2,
  glow: 1.5,
  subtext: 0.9,
  subtextDelay: 0.2,
  hold: 1.5,
  fade: 1.0,
  glowColor: "#FF3333",
} as const;

function readSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === "true";
  } catch {
    // Modo privado / storage bloqueado: trata como primeiro acesso.
    return false;
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, "true");
  } catch {
    /* storage indisponível — a intro só volta a rodar na próxima visita */
  }
}

export function IntroSplash() {
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const subtext = useRef<HTMLParagraphElement>(null);
  // Guarda o timeline pra que o skip consiga matá-lo no meio.
  const tl = useRef<gsap.core.Timeline | null>(null);
  const finished = useRef(false);

  // Revela o conteúdo. Idempotente: skip, onComplete e failsafe podem chamar.
  const reveal = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    markSeen();
    setDone(true);
  }, []);

  // Trava o scroll enquanto a splash está no ar. Lenis roda por cima do scroll
  // nativo, então `overflow: hidden` sozinho não segura — precisa do stop().
  useEffect(() => {
    if (done) return;
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    getLenis()?.stop();
    return () => {
      html.style.overflow = previous;
      getLenis()?.start();
    };
  }, [done]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reveal();
      return;
    }

    const failsafe = window.setTimeout(() => {
      console.warn("[DMG] Splash timeout — revelando o conteúdo principal.");
      reveal();
    }, FAILSAFE_MS);

    const ctx = gsap.context(() => {
      try {
        const paths = gsap.utils.toArray<SVGPathElement>(".dmg-path");

        // Estado "não desenhado": o traço inteiro vira gap.
        paths.forEach((path) => {
          const length = path.getTotalLength();
          gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length,
            opacity: 1,
          });
        });

        const timeline = gsap.timeline({
          onComplete: () => {
            gsap.to(root.current, {
              opacity: 0,
              duration: T.fade,
              ease: "power2.inOut",
              onComplete: reveal,
            });
          },
        });
        tl.current = timeline;

        if (readSeen()) {
          // Visita seguinte: sem redesenhar. Só um respiro e sai de cena.
          gsap.set(paths, { strokeDashoffset: 0 });
          gsap.set(subtext.current, { opacity: 1, y: 0 });
          timeline.from(root.current, { opacity: 0, duration: 0.5 }).to({}, { duration: 1 });
          return;
        }

        // Primeiro acesso: a animação completa (~7s até o fade).
        timeline
          .to(paths, {
            strokeDashoffset: 0,
            duration: T.draw,
            ease: "power2.inOut",
            stagger: T.drawStagger,
          })
          // O glow entra montado sobre o fim do desenho, não depois dele.
          .to(
            paths,
            {
              filter: `drop-shadow(0 0 8px ${T.glowColor})`,
              duration: T.glow,
              ease: "sine.inOut",
            },
            `-=${T.glow}`,
          )
          .to(
            subtext.current,
            { opacity: 1, y: 0, duration: T.subtext, ease: "power2.out" },
            `+=${T.subtextDelay}`,
          )
          .to({}, { duration: T.hold });
      } catch (err) {
        console.error("[DMG] Erro durante a intro:", err);
        reveal();
      }
    }, root);

    return () => {
      window.clearTimeout(failsafe);
      ctx.revert();
    };
  }, [reveal]);

  // Skip por clique ou ESC — a intro completa tem ~7s e nem todo mundo que
  // chega de anúncio ou busca quer esperar.
  const skip = useCallback(() => {
    if (finished.current) return;
    tl.current?.kill();
    gsap.to(root.current, {
      opacity: 0,
      duration: 0.35,
      ease: "power2.inOut",
      onComplete: reveal,
    });
  }, [reveal]);

  useEffect(() => {
    if (done) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, skip]);

  // Helper de debug do CNM, mantido: `resetIntro()` no console limpa a flag e
  // recarrega, pra testar a versão completa sem trocar de navegador.
  useEffect(() => {
    window.resetIntro = () => {
      try {
        localStorage.removeItem(SEEN_KEY);
      } catch {
        /* nada a limpar */
      }
      location.reload();
    };
    return () => {
      delete window.resetIntro;
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={root}
      id="dmg-splash"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-void"
    >
      {/* Sem JS não há nada que remova a splash — então ela não aparece. */}
      <noscript>
        <style>{`#dmg-splash{display:none}`}</style>
      </noscript>

      <div className="pointer-events-none flex w-4/5 max-w-[600px] flex-col items-center motion-safe:animate-[dmg-fade-in_1.15s_cubic-bezier(.22,.9,.32,1)_.1s_both]">
        <DmgLogo className="h-auto w-full" />
        <p
          ref={subtext}
          className="mt-5 translate-y-[10px] text-[0.8rem] font-light uppercase tracking-[0.6em] text-white/70 opacity-0"
        >
          development group
        </p>
      </div>

      {/* Alvo de skip: cobre a tela inteira, é focável e anuncia o que faz. */}
      <button
        type="button"
        onClick={skip}
        aria-label="Pular introdução"
        className="absolute inset-0 flex cursor-pointer items-end justify-center pb-8"
      >
        <span
          aria-hidden
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash/60"
        >
          clique ou ESC para pular
        </span>
      </button>
    </div>
  );
}
