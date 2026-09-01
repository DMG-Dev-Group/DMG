import Link from "next/link";
import { EMAIL, WHATSAPP } from "@/data/contato";

/**
 * Footer — conteúdo do site antigo (`legacy/damage_group_landing.html` 464-475)
 * na estrutura do DMG-DEF, que é mais limpa (docs/0001 §5, linha 12).
 *
 * TODO(DMG): GitHub e LinkedIn ainda apontam para "#" — faltam as URLs reais
 * dos perfis. WhatsApp e email já estão plugados.
 */
const LINKS = [
  { label: "GitHub", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "WhatsApp", href: WHATSAPP.href },
  { label: "Contato", href: `mailto:${EMAIL}` },
];

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-carbon">
      <div className="mx-auto max-w-[1400px] px-6 py-14 md:px-10">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <strong className="block text-base font-bold tracking-[-0.01em] text-red">
              DAMAGE GROUP
            </strong>
            <span className="mt-1 block font-mono text-xs tracking-[0.16em] text-ash">
              DMG · Software Development
            </span>
          </div>

          <nav className="flex flex-wrap gap-7">
            {LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="font-mono text-[12px] uppercase tracking-[0.16em] text-ash transition-colors hover:text-bone"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-hairline pt-6 md:flex-row md:items-center md:justify-between">
          <span className="hud">© 2026 DMG. All rights reserved.</span>
          <span className="hud">controlled damage</span>
        </div>
      </div>
    </footer>
  );
}
