"use client";

import { useRef, type ReactNode } from "react";
import {
  Code2,
  Boxes,
  ShoppingBag,
  LayoutDashboard,
  Bot,
  Workflow,
} from "lucide-react";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type Service = {
  icon: ReactNode;
  title: string;
  desc: string;
  span: string;
  feature?: boolean;
};

const ICON = { strokeWidth: 1.4 } as const;

const SERVICES: Service[] = [
  {
    icon: <Code2 {...ICON} className="h-6 w-6" />,
    title: "Sistemas web sob medida",
    desc: "Plataformas internas, portais e soluções de negócio pensadas para operar em produção com arquitetura que escala sem quebrar.",
    span: "md:col-span-2 md:row-span-2",
    feature: true,
  },
  {
    icon: <Boxes {...ICON} className="h-6 w-6" />,
    title: "Produtos SaaS",
    desc: "Do MVP ao produto pronto para crescer: multiusuário, billing, gestão e experiência de uso 100% escalável.",
    span: "md:col-span-2",
  },
  {
    icon: <ShoppingBag {...ICON} className="h-6 w-6" />,
    title: "E-commerce",
    desc: "Lojas digitais com catálogo, checkout, gestão de pedidos e operações projetadas para vender com menos atrito.",
    span: "md:col-span-1",
  },
  {
    icon: <LayoutDashboard {...ICON} className="h-6 w-6" />,
    title: "Dashboards & dados",
    desc: "Painéis e métricas que transformam informação em decisão em tempo real.",
    span: "md:col-span-1",
  },
  {
    icon: <Bot {...ICON} className="h-6 w-6" />,
    title: "Robótica",
    desc: "Soluções de automação e integração física/digital para otimizar a operação e acelerar processos complexos.",
    span: "md:col-span-2",
  },
  {
    icon: <Workflow {...ICON} className="h-6 w-6" />,
    title: "Integração com IA & automações",
    desc: "Fluxos inteligentes, assistentes, automações e integrações que reduzem retrabalho e aumentam eficiência operacional.",
    span: "md:col-span-2",
  },
];

function ServiceCard({ service }: { service: Service }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    // subtle 3D tilt
    el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 5}deg) rotateY(${(px - 0.5) * 5}deg)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn(
        "group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[12px] border border-hairline bg-graphite/60 p-7 transition-[border-color] duration-300 will-change-transform hover:border-red/40",
      )}
      style={{ transition: "transform 0.2s ease-out, border-color 0.3s" }}
    >
      {/* Cursor spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(300px circle at var(--mx, 50%) var(--my, 50%), rgba(255,30,30,0.14), transparent 70%)",
        }}
      />
      {/* Feature-tile red bloom for visual variation */}
      {service.feature && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bloom-red blur-2xl opacity-70"
        />
      )}

      <div className="relative flex items-center justify-between">
        <span className="text-red">{service.icon}</span>
      </div>
      <div className="relative mt-10">
        <h3
          className={cn(
            "font-medium tracking-tight text-bone",
            service.feature ? "text-2xl md:text-3xl" : "text-xl",
          )}
        >
          {service.title}
        </h3>
        <p
          className={cn(
            "mt-3 text-ash leading-relaxed",
            service.feature ? "max-w-sm text-base" : "text-sm",
          )}
        >
          {service.desc}
        </p>
      </div>
    </div>
  );
}

export function Servicos() {
  return (
    <Section id="servicos" index="02" label="SERVIÇOS">
      <div className="mb-14 max-w-3xl md:mb-20">
        <h2 className="text-4xl font-medium leading-[1.05] tracking-tight text-bone md:text-6xl">
          O que a gente constrói.
        </h2>
      </div>
      <Reveal
        selector=".svc"
        className="grid auto-rows-[minmax(150px,auto)] grid-cols-1 gap-4 md:grid-cols-4"
      >
        {SERVICES.map((s) => (
          <div key={s.title} className={cn("svc h-full", s.span)}>
            <ServiceCard service={s} />
          </div>
        ))}
      </Reveal>
    </Section>
  );
}
