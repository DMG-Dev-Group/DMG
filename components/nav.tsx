"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { getLenis } from "@/components/smooth-scroll";
import { cn } from "@/lib/utils";

// Mesma ordem em que as seções aparecem no scroll (app/page.tsx): Sobre
// (Missão/Visão/Valores) -> Serviços -> Stack -> Projetos -> Contato. O CTA
// "Orçamento" leva direto ao configurador, que vive dentro dos cards de
// Serviços — por isso ele fica de fora da lista e vira o botão à parte.
const LINKS = [
  { href: "#sobre", label: "Sobre", id: "sobre" },
  { href: "#servicos", label: "Serviços", id: "servicos" },
  { href: "#stack", label: "Stack", id: "stack" },
  { href: "#projetos", label: "Projetos", id: "projetos" },
  { href: "#contato", label: "Contato", id: "contato" },
];

export function Nav() {
  const [active, setActive] = useState<string>("");
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    const els = LINKS.map((l) => document.getElementById(l.id)).filter(
      Boolean,
    ) as HTMLElement[];
    // A section is "active" while it sits in the middle band of the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Abaixo de `md` a lista de links some (não cabe) e nada a substituía —
  // a pessoa ficava sem como navegar pras seções fora o scroll manual.
  // Mesmo padrão de overlay do ServiceModal/IntroSplash: trava o Lenis,
  // fecha no ESC.
  useEffect(() => {
    if (!menuAberto) return;
    const html = document.documentElement;
    const anterior = html.style.overflow;
    html.style.overflow = "hidden";
    getLenis()?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuAberto(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = anterior;
      getLenis()?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [menuAberto]);

  // Fecha o menu se a tela crescer pra `md` com ele aberto (giro de tela,
  // redimensionar a janela).
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setMenuAberto(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="border-b border-hairline bg-void/70 backdrop-blur-md">
        <nav className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6 md:px-10">
          {/* Wordmark */}
          <Link
            href="#top"
            className="group flex items-center gap-2"
            aria-label="DMG — início"
            onClick={() => setMenuAberto(false)}
          >
            <span className="text-xl font-bold tracking-tight text-bone">
              DMG
            </span>
            <span className="mt-0.5 h-1.5 w-1.5 bg-red shadow-[0_0_10px_var(--color-red-glow)] transition-transform duration-300 group-hover:scale-150" />
          </Link>

          {/* Links (desktop) */}
          <ul className="hidden items-center gap-9 md:flex">
            {LINKS.map((l) => {
              const isActive = active === l.id;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={cn(
                      "relative font-mono text-[12px] uppercase tracking-[0.14em] transition-colors duration-200",
                      isActive ? "text-bone" : "text-ash hover:text-bone",
                    )}
                  >
                    {l.label}
                    <span
                      className={cn(
                        "absolute -bottom-1.5 left-0 h-px bg-red shadow-[0_0_8px_var(--color-red-glow)] transition-all duration-300",
                        isActive ? "w-full opacity-100" : "w-0 opacity-0",
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-3">
            <MagneticButton
              href="#servicos"
              variant="ghost"
              className="hidden px-5 py-3 md:inline-flex"
              strength={0.25}
            >
              Orçamento
            </MagneticButton>

            {/* Gatilho do menu (mobile) */}
            <button
              type="button"
              onClick={() => setMenuAberto((v) => !v)}
              aria-expanded={menuAberto}
              aria-controls="menu-mobile"
              aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
              className="grid h-10 w-10 place-items-center rounded-[6px] border border-hairline text-bone transition-colors hover:border-red/60 md:hidden"
            >
              {menuAberto ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Menu (mobile) — mesma linguagem visual do ServiceModal: fundo
          escurecido, borda hairline, fecha no ESC e no toque fora do painel. */}
      {menuAberto && (
        <div
          className="fixed inset-0 top-[72px] z-30 bg-void/90 backdrop-blur-sm md:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMenuAberto(false);
          }}
        >
          <nav
            id="menu-mobile"
            aria-label="Navegação principal"
            className="border-b border-hairline bg-carbon px-6 py-8"
          >
            <ul className="flex flex-col gap-1">
              {LINKS.map((l) => {
                const isActive = active === l.id;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={() => setMenuAberto(false)}
                      className={cn(
                        "block border-b border-hairline py-4 font-mono text-base uppercase tracking-[0.1em] transition-colors",
                        isActive ? "text-red" : "text-bone",
                      )}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <MagneticButton
              href="#servicos"
              variant="primary"
              className="mt-6 w-full justify-center"
              strength={0}
              onClick={() => setMenuAberto(false)}
            >
              Orçamento
            </MagneticButton>
          </nav>
        </div>
      )}
    </header>
  );
}
