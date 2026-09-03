"use client";

import Link from "next/link";
import { useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost";

interface MagneticButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  /** Magnetic pull factor (0 = none). */
  strength?: number;
  ariaLabel?: string;
}

const VARIANTS: Record<Variant, string> = {
  // Neon red, chamfered, near-black text (contrast 5.4:1, passes AA).
  primary:
    "clip-corner bg-red text-void hover:shadow-[0_0_44px_var(--color-red-glow)] shadow-[0_0_0_rgba(0,0,0,0)]",
  // Hairline outline that lights up red on hover.
  ghost:
    "clip-corner border border-hairline text-bone hover:border-red/60 hover:text-white hover:shadow-[0_0_28px_rgba(255,30,30,0.16)]",
};

/**
 * Magnetic button — pulls toward the cursor with an rAF lerp applied straight
 * to the element transform (never React state, per perf rules). Collapses to a
 * static button under prefers-reduced-motion. Renders <a> when href is set.
 */
export function MagneticButton({
  children,
  href,
  onClick,
  variant = "primary",
  className,
  strength = 0.32,
  ariaLabel,
}: MagneticButtonProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const innerRef = useRef<HTMLSpanElement | null>(null);
  const raf = useRef(0);
  const cur = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const reduced = useRef(false);

  // O passo da animação vive num ref, não num useCallback: ele reagenda a si
  // mesmo, e um `useCallback` que se referencia por nome é uma leitura antes da
  // declaração — a versão capturada pode ficar velha. Aqui a função é criada
  // uma vez, no efeito, e só lê refs.
  const passo = useRef<() => void>(null);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const animar = () => {
      cur.current.x += (target.current.x - cur.current.x) * 0.15;
      cur.current.y += (target.current.y - cur.current.y) * 0.15;
      const { x, y } = cur.current;
      if (rootRef.current) {
        rootRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
      if (innerRef.current) {
        innerRef.current.style.transform = `translate3d(${x * 0.4}px, ${y * 0.4}px, 0)`;
      }
      const parou =
        Math.abs(target.current.x - x) < 0.1 &&
        Math.abs(target.current.y - y) < 0.1;
      if (parou && target.current.x === 0 && target.current.y === 0) {
        raf.current = 0;
        return;
      }
      raf.current = requestAnimationFrame(animar);
    };
    passo.current = animar;

    return () => cancelAnimationFrame(raf.current);
  }, []);

  const ensureLoop = useCallback(() => {
    if (!raf.current && passo.current) {
      raf.current = requestAnimationFrame(passo.current);
    }
  }, []);

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (reduced.current || !rootRef.current) return;
      const r = rootRef.current.getBoundingClientRect();
      target.current = {
        x: (e.clientX - (r.left + r.width / 2)) * strength,
        y: (e.clientY - (r.top + r.height / 2)) * strength,
      };
      ensureLoop();
    },
    [strength, ensureLoop],
  );

  const onLeave = useCallback(() => {
    target.current = { x: 0, y: 0 };
    ensureLoop();
  }, [ensureLoop]);

  const setRoot = useCallback((node: HTMLElement | null) => {
    rootRef.current = node;
  }, []);

  const classes = cn(
    "group relative inline-flex items-center justify-center gap-2.5 px-7 py-4",
    "font-mono text-[13px] uppercase tracking-[0.14em] leading-none",
    "transition-[box-shadow,border-color,color] duration-300 will-change-transform",
    "active:scale-[0.98]",
    VARIANTS[variant],
    className,
  );

  const content = (
    <span ref={innerRef} className="inline-flex items-center gap-2.5">
      {children}
    </span>
  );

  if (href) {
    return (
      <Link
        ref={setRoot}
        href={href}
        aria-label={ariaLabel}
        onClick={onClick}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={classes}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={setRoot}
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={classes}
    >
      {content}
    </button>
  );
}
