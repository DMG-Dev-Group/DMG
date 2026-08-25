import { cn } from "@/lib/utils";

/**
 * HUD system — the technical/engineering annotation layer.
 * Mono labels, coordinates, section indexes, corner brackets. Used as a
 * deliberate, consistent design language (brief §3 / §5), not as generic
 * eyebrows: the index reads as a coordinate marker, one per section.
 */

/** Small mono HUD label. */
export function HudTag({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("hud", className)}>{children}</span>;
}

/** Section index marker: [ 01 / SERVIÇOS ] followed by a hairline rule. */
export function SectionIndex({
  index,
  label,
  className,
}: {
  index: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <span className="hud whitespace-nowrap">
        <span className="text-red">[</span>
        <span className="mx-2 text-bone">{index}</span>
        <span className="text-ash">/ {label}</span>
        <span className="ml-2 text-red">]</span>
      </span>
      <span aria-hidden className="h-px flex-1 bg-hairline" />
    </div>
  );
}

/** Four subtle red corner brackets framing a relative container (HUD frame). */
export function HudFrame({ className }: { className?: string }) {
  const arm = "absolute h-4 w-4 border-red/40";
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-4 md:inset-6", className)}
    >
      <span className={cn(arm, "left-0 top-0 border-l border-t")} />
      <span className={cn(arm, "right-0 top-0 border-r border-t")} />
      <span className={cn(arm, "bottom-0 left-0 border-b border-l")} />
      <span className={cn(arm, "bottom-0 right-0 border-b border-r")} />
    </div>
  );
}
