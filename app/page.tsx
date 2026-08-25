import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { IntroSplash } from "@/components/intro/intro-splash";
import { Hero } from "@/components/sections/hero";
import { Manifesto } from "@/components/sections/manifesto";
import { Servicos } from "@/components/sections/servicos";
import { Stack, StackMarquee } from "@/components/sections/stack";
import { Projetos } from "@/components/sections/projetos";
import { Climax } from "@/components/sections/climax";
import { Time } from "@/components/sections/time";
import { Contato } from "@/components/sections/contato";
import { DamageScroll } from "@/components/scroll/damage-scroll";

export default function Home() {
  return (
    <>
      <IntroSplash />
      <DamageScroll />
      <Nav />
      <main>
        <Hero />
        <Manifesto />
        <Servicos />
        <Stack />
        <StackMarquee />
        <Projetos />
        <Climax />
        <Time />
        <Contato />
      </main>
      <Footer />
    </>
  );
}
