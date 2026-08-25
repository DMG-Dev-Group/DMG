"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#manifesto", label: "Manifesto", id: "manifesto" },
  { href: "#servicos", label: "Serviços", id: "servicos" },
  { href: "#stack", label: "Stack", id: "stack" },
  { href: "#projetos", label: "Projetos", id: "projetos" },
  { href: "#time", label: "Time", id: "time" },
];

export function Nav() {
  const [active, setActive] = useState<string>("");

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

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="border-b border-hairline bg-void/70 backdrop-blur-md">
        <nav className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6 md:px-10">
          {/* Wordmark */}
          <Link
            href="#top"
            className="group flex items-center gap-2"
            aria-label="DMG — início"
          >
            <span className="text-xl font-bold tracking-tight text-bone">
              DMG
            </span>
            <span className="mt-0.5 h-1.5 w-1.5 bg-red shadow-[0_0_10px_var(--color-red-glow)] transition-transform duration-300 group-hover:scale-150" />
          </Link>

          {/* Links */}
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

          {/* CTA */}
          <MagneticButton
            href="#contato"
            variant="ghost"
            className="px-5 py-3"
            strength={0.25}
          >
            Contato
          </MagneticButton>
        </nav>
      </div>
    </header>
  );
}
