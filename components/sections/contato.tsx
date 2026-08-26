import { Mail } from "lucide-react";
import { HudTag } from "@/components/ui/hud";

/**
 * Contato — a saída direta, de propósito discreta (Q22).
 *
 * O CTA grande é o do clímax, logo acima, e o funil principal é o configurador
 * de orçamento. Esta faixa existe para quem não quer montar orçamento nenhum e
 * só quer mandar uma mensagem. Se ela crescer, começa a competir com o
 * configurador — e o configurador é que qualifica o lead.
 *
 * TODO(DMG) Q22b: se houver um WhatsApp oficial da DMG, ele entra aqui ao
 * lado do email.
 */
export function Contato() {
  return (
    <section id="contato" className="border-t border-hairline">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-6 py-14 md:flex-row md:items-center md:justify-between md:px-10">
        <div>
          <HudTag>[ contato ]</HudTag>
          <p className="mt-3 text-lg text-bone">
            Prefere falar direto? Sem formulário, sem orçamento.
          </p>
        </div>

        <a
          href="mailto:dmggroupdev@gmail.com?subject=Projeto%20com%20a%20DMG"
          className="group inline-flex items-center gap-3 font-mono text-sm text-ash transition-colors hover:text-bone"
        >
          <Mail className="h-4 w-4 text-red" strokeWidth={1.6} />
          dmggroupdev@gmail.com
          <span
            aria-hidden
            className="h-px w-8 bg-red transition-all duration-300 group-hover:w-12"
          />
        </a>
      </div>
    </section>
  );
}
