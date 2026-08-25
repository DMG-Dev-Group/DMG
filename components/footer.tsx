import Link from "next/link";

// TODO: preencher com os perfis reais da DMG.
const SOCIAL = [
  { label: "Instagram", href: "#" },
  { label: "GitHub", href: "#" },
  { label: "LinkedIn", href: "#" },
];

export function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto max-w-[1400px] px-6 py-14 md:px-10">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-bone">
                DMG
              </span>
              <span className="mt-0.5 h-1.5 w-1.5 bg-red shadow-[0_0_10px_var(--color-red-glow)]" />
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ash">
              Damage Group. Software de alto padrão. Dano controlado.
            </p>
          </div>

          <nav className="flex gap-8">
            {SOCIAL.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="font-mono text-[12px] uppercase tracking-[0.16em] text-ash transition-colors hover:text-bone"
              >
                {s.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-hairline pt-6 md:flex-row md:items-center md:justify-between">
          <span className="hud">© 2026 damage group</span>
          <span className="hud">controlled damage</span>
        </div>
      </div>
    </footer>
  );
}
