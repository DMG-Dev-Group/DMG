"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * SplitReveal — per-line entrance driven by GSAP SplitText, fired once on
 * scroll-in. Motivated: it stages a headline so the reader lands on one line at
 * a time. Progressive enhancement: without JS the text renders normally, and
 * under reduced motion nothing animates at all.
 */
export function SplitReveal({
  children,
  className,
  as = "p",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  /**
   * Só tags nativas. O componente entrega um ref para o GSAP medir e animar o
   * elemento — passar um componente de função aqui não garante que o ref chegue
   * a um nó do DOM, e a animação falharia em silêncio.
   */
  as?: keyof React.JSX.IntrinsicElements;
  delay?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;

    gsap.registerPlugin(ScrollTrigger, SplitText);
    let ctx: gsap.Context | undefined;
    let split: SplitText | undefined;

    const run = () => {
      if (!ref.current) return;
      ctx = gsap.context(() => {
        split = new SplitText(el, { type: "lines" });
        gsap.from(split.lines, {
          y: 44,
          opacity: 0,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.06,
          delay,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      }, el);
    };

    // Split after fonts settle so line breaks are measured correctly.
    if (document.fonts?.ready) document.fonts.ready.then(run);
    else run();

    return () => {
      ctx?.revert();
      split?.revert();
    };
  }, [delay]);

  // JSX polimórfico em vez de createElement: mesma saída, e o `ref` é
  // encaminhado como prop normal (React 19) em vez de virar argumento opaco.
  const Tag = as as "p";
  return (
    <Tag ref={ref as React.Ref<HTMLParagraphElement>} className={className}>
      {children}
    </Tag>
  );
}

/**
 * Reveal — staggered entrance for a group (cards, list rows). Animates the
 * direct children unless a selector is given.
 */
export function Reveal({
  children,
  className,
  y = 60,
  stagger = 0.1,
  selector,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  stagger?: number;
  selector?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const targets = selector
        ? el.querySelectorAll(selector)
        : (Array.from(el.children) as HTMLElement[]);
      if (!targets || (targets as HTMLElement[]).length === 0) return;
      gsap.from(targets, {
        y,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger,
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [y, stagger, selector]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
