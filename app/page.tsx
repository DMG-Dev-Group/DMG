import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { IntroSplash } from "@/components/intro/intro-splash";
import { Hero } from "@/components/sections/hero";
import { MissaoVisaoValores } from "@/components/sections/missao-visao-valores";
import { Servicos } from "@/components/sections/servicos";
import { Fundadores } from "@/components/sections/fundadores";
import { Stack, StackMarquee } from "@/components/sections/stack";
import { Projetos } from "@/components/sections/projetos";
import { Climax } from "@/components/sections/climax";
import { Contato } from "@/components/sections/contato";

/**
 * Ordem das seções — docs/0001 §5.
 * O marquee de skills fica entre "Sobre" e "Serviços", como respiro entre a
 * seção mais densa de texto do site e a mais densa de interação.
 */
export default function Home() {
  return (
    <>
      <IntroSplash />
      <Nav />
      <main>
        <Hero />
        <MissaoVisaoValores />
        <StackMarquee />
        <Servicos />
        <Fundadores />
        <Stack />
        <Projetos />
        <Climax />
        <Contato />
      </main>
      <Footer />
    </>
  );
}
