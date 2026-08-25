"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Section } from "@/components/ui/section";

const STACK = [
  "HTML",
  "CSS",
  "JavaScript",
  "Node.js",
  "React",
  "Tailwind",
  "Next.js",
  "TypeScript",
  "Python",
  "GSAP",
  "Three.js",
  "PostgreSQL",
  "Firebase",
  "Firestore",
  "Godot",
  "Figma",
];

// Honest numbers (brief: no fake-precise metrics).
const STATS: { to: number; label: string; suffix?: string }[] = [
  { to: 3, label: "Desenvolvedores com visão" },
  { to: 5, label: "produtos no portfólio" },
  { to: 2, label: "em produção agora" },
  { to: 100, label: "% código próprio, 0 template", suffix: "%" },
];

function Counter({ to, suffix }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = (v: number) =>
      (el.textContent = String(v) + (suffix ?? ""));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      set(to);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const obj = { v: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        v: to,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: () => set(Math.round(obj.v)),
      });
    }, el);
    return () => ctx.revert();
  }, [to, suffix]);

  return (
    <span ref={ref} className="font-mono tabular-nums">
      0{suffix ?? ""}
    </span>
  );
}

export function Stack() {
  return (
    <Section id="stack" index="03" label="STACK">
      <div className="grid gap-12 md:grid-cols-2 md:items-end">
        <h2 className="text-4xl font-medium leading-[1.05] tracking-tight text-bone md:text-6xl">
          Tecnologia que resolve,
          <br />
          <span className="text-ash">sem improviso.</span>
        </h2>
        <p className="max-w-md text-base leading-relaxed text-ash md:text-lg">
          Desenvolvemos a arquitetura ideal para o seu desafio. Uma estrutura preparada para escala e execução focada em resultado para o seu negócio.
        </p>
      </div>

      {/* Stats */}
      <div className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-[12px] border border-hairline bg-hairline md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="bg-carbon p-7">
            <div className="text-5xl font-bold tracking-tight text-bone md:text-6xl">
              <Counter to={s.to} suffix={s.suffix} />
            </div>
            <p className="mt-3 text-sm leading-snug text-ash">{s.label}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/**
 * StackMarquee — the single kinetic marquee on the page (brief §5.5). Rendered
 * full-bleed by the page just below Capacidades. Duplicated track for a seamless
 * loop; static under reduced motion (CSS handles the disable globally).
 */
export function StackMarquee() {
  const row = [...STACK, ...STACK];
  return (
    <div className="relative overflow-hidden border-y border-hairline py-6">
      <div
        className="flex w-max motion-safe:animate-[dmg-marquee_38s_linear_infinite]"
        aria-hidden
      >
        {row.map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-6 whitespace-nowrap px-6 font-mono text-sm uppercase tracking-[0.16em] text-ash"
          >
            {t}
            <span className="h-1 w-1 rounded-full bg-red/70" />
          </span>
        ))}
      </div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-void to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-void to-transparent" />
    </div>
  );
}
