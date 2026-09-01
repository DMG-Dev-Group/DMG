import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Privacidade",
  description:
    "Como a Damage Group trata os dados enviados pelo configurador de orçamento.",
  robots: { index: false, follow: true },
};

/**
 * Página de privacidade — enxuta de propósito. Existe para dar destino ao link
 * do aceite no configurador: quem clica quer saber o que acontece com o número
 * de WhatsApp que acabou de digitar, não ler seis páginas de jurídico.
 *
 * TODO(DMG) Q7: o prazo de guarda e o endereço do encarregado precisam de
 * confirmação de vocês antes de valer como texto oficial.
 */

const BLOCOS = [
  {
    titulo: "O que a gente coleta",
    texto:
      "Só o que você digita no configurador de orçamento: nome, WhatsApp, email, empresa (opcional) e o que você descreve sobre o projeto. Junto disso guardamos a configuração que você montou — categoria, item, módulos e o total calculado.",
  },
  {
    titulo: "Para que usamos",
    texto:
      "Para responder ao seu orçamento e dar seguimento à conversa. Nada mais. Não usamos seus dados para disparo de marketing e não vendemos nem repassamos sua informação para terceiros.",
  },
  {
    titulo: "Onde ficam",
    texto:
      "Num banco de dados gerenciado (Supabase), com acesso restrito aos sócios da DMG. Uma cópia do pedido chega por email para a equipe.",
  },
  {
    titulo: "Seus direitos",
    texto:
      "Você pode pedir a qualquer momento para ver, corrigir ou apagar seus dados, e retirar o consentimento. É só escrever para dmggroupdev@gmail.com — a gente responde e cumpre.",
  },
];

export default function Privacidade() {
  return (
    <>
      <main className="mx-auto min-h-[70vh] max-w-2xl px-6 pb-24 pt-32 md:px-10">
        <Link href="/" className="hud transition-colors hover:text-bone">
          ← voltar para o site
        </Link>

        <h1 className="mt-10 text-4xl font-medium tracking-tight text-bone md:text-5xl">
          Privacidade
        </h1>
        <p className="mt-5 text-base leading-relaxed text-ash">
          A DMG coleta o mínimo necessário para te responder. Em uma página, sem
          letra miúda.
        </p>

        <div className="mt-14 space-y-10">
          {BLOCOS.map((b) => (
            <section key={b.titulo}>
              <h2 className="text-lg font-medium tracking-tight text-bone">
                {b.titulo}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ash">
                {b.texto}
              </p>
            </section>
          ))}
        </div>

        <p className="mt-14 border-t border-hairline pt-6 font-mono text-xs text-ash">
          Damage Group (DMG) · dmggroupdev@gmail.com
        </p>
      </main>
      <Footer />
    </>
  );
}
