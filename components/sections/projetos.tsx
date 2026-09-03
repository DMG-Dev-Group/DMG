"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { projects, STATUS_LABEL, type Project } from "@/data/projects";
import { SectionIndex, HudTag } from "@/components/ui/hud";
import { CanvasBoundary } from "@/components/core/canvas-boundary";
import { projectsScroll } from "@/lib/projects-scroll";
import { use3DPermitido } from "@/lib/use-3d-permitido";

const LaptopCanvas = dynamic(() => import("@/components/core/laptop-canvas"), {
  ssr: false,
});

/** Browser-style device frame holding the project poster. */
function DeviceFrame({ project }: { project: Project }) {
  return (
    <div className="w-full overflow-hidden rounded-[12px] border border-hairline bg-graphite shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
      {/* chrome bar */}
      <div className="flex items-center gap-3 border-b border-hairline bg-carbon px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </div>
        <div className="ml-2 flex-1 truncate rounded-md bg-void/60 px-3 py-1 font-mono text-[11px] tracking-wide text-ash">
          {project.host ?? "dmg.build"}
        </div>
      </div>
      {/* screen — real demo when available, else an elegant poster placeholder */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-void">
        {project.demo ? (
          /\.(mp4|webm)$/.test(project.demo) ? (
            <video
              src={project.demo}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.demo}
              alt={`Demonstração de ${project.nome}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )
        ) : (
          <>
            <div aria-hidden className="absolute inset-0 bloom-red opacity-40" />
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
              <span className="text-3xl font-bold tracking-tight text-bone md:text-5xl">
                {project.nome}
              </span>
              <span className="hud">preview em breve</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProjectInfo({
  project,
  index,
  comIndice = true,
}: {
  project: Project;
  index: number;
  /** No modo fixado o índice já aparece no HUD do palco — não repetir. */
  comIndice?: boolean;
}) {
  const producao = project.status === "producao";
  const badge =
    project.status !== "producao" ? STATUS_LABEL[project.status] : null;

  return (
    <div>
      {comIndice && (
        <SectionIndex
          index={String(index + 1).padStart(2, "0")}
          label={`${projects.length.toString().padStart(2, "0")} · PROJETOS`}
        />
      )}
      <div className="mt-8 flex items-center gap-3">
        <h3 className="text-3xl font-bold tracking-tight text-bone md:text-4xl">
          {project.nome}
        </h3>
        {badge && (
          <span className="clip-corner border border-red/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-red">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-4 max-w-md text-base leading-relaxed text-bone/80">
        {project.tagline}
      </p>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ash">
        <span className="text-red">{"// "}</span>
        {project.papel}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {project.stack.map((s) => (
          <span
            key={s}
            className="rounded-full border border-hairline px-3 py-1 font-mono text-[11px] tracking-wide text-ash"
          >
            {s}
          </span>
        ))}
      </div>

      {project.resultado && (
        <p className="mt-6 max-w-md border-l border-red/50 pl-4 text-sm leading-relaxed text-bone/70">
          {project.resultado}
        </p>
      )}

      {producao && project.url && (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 font-mono text-[13px] uppercase tracking-[0.14em] text-bone transition-colors hover:text-red"
        >
          Ver projeto
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
        </a>
      )}
    </div>
  );
}

export function Projetos() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [mounted, setMounted] = useState(false);
  const [canvasActive, setCanvasActive] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);

  const mode: "3d" | "flat" = use3DPermitido() ? "3d" : "flat";

  useEffect(() => {
    if (mode !== "3d") return;
    gsap.registerPlugin(ScrollTrigger);
    const n = projects.length;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: `+=${n * 150}%`,
        pin: stage.current,
        pinSpacing: true,
        scrub: 1,
        // This pin injects a large spacer; refresh it BEFORE later triggers
        // (climax) so their start/end account for the shift.
        refreshPriority: 1,
        onToggle: (self) => {
          if (self.isActive) setMounted(true);
          setCanvasActive(self.isActive); // pause the laptop render when off-screen
        },
        onUpdate: (self) => {
          projectsScroll.progress = self.progress;
          const i = Math.min(
            n - 1,
            Math.max(0, Math.round(self.progress * (n - 1))),
          );
          if (i !== activeRef.current) {
            activeRef.current = i;
            setActive(i);
          }
        },
      });
    }, section);

    return () => ctx.revert();
  }, [mode]);

  // Fallback: stacked, all visible (mobile / reduced motion).
  if (mode === "flat") {
    return (
      <section id="projetos" className="py-28 md:py-40">
        <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10">
          <div className="flex flex-col gap-24">
            {projects.map((p, i) => (
              <div key={p.id} className="grid gap-10 md:grid-cols-2 md:items-center">
                <DeviceFrame project={p} />
                <ProjectInfo project={p} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={section} id="projetos" className="relative">
      <div ref={stage} className="relative h-[100dvh] w-full overflow-hidden">
        {/* Only surviving chrome: the project index label */}
        <div className="pointer-events-none absolute left-6 top-24 z-10 md:left-10">
          <HudTag>
            <span className="text-red">[ </span>
            {String(active + 1).padStart(2, "0")} /{" "}
            {projects.length.toString().padStart(2, "0")} · PROJETOS
            <span className="text-red"> ]</span>
          </HudTag>
        </div>

        {/* The notebook fills the stage below the fixed nav (so it centers in the
            visible locked area instead of clipping under the header) */}
        <div className="absolute inset-x-0 bottom-0 top-[72px]">
          {mounted && !webglFailed ? (
            <CanvasBoundary onError={() => setWebglFailed(true)}>
              <LaptopCanvas active={canvasActive} />
            </CanvasBoundary>
          ) : (
            <div className="flex h-full items-center justify-center px-6">
              <div className="w-full max-w-3xl">
                <DeviceFrame project={projects[active]} />
              </div>
            </div>
          )}
        </div>

        {/* Ficha do projeto ativo, por cima do palco.
            Sem ela a seção era um vazio: sete telas de scroll mostrando um
            notebook, sem dizer o nome de nenhum projeto, o que a DMG fez nele
            nem para onde clicar. A tela do notebook 3D não é legível a ponto
            de contar essa história sozinha. */}
        <div
          key={projects[active].id}
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-void via-void/85 to-transparent px-6 pb-12 pt-24 motion-safe:animate-[dmg-glitch-in_0.5s_var(--ease-out-expo)_both] md:px-10 lg:inset-y-0 lg:right-auto lg:flex lg:w-[46%] lg:max-w-xl lg:flex-col lg:justify-center lg:bg-none lg:pb-0 lg:pt-0"
        >
          <div className="pointer-events-auto">
            <ProjectInfo project={projects[active]} index={active} comIndice={false} />
          </div>
        </div>
      </div>
    </section>
  );
}
