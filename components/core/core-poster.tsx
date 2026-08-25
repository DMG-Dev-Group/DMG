import { cn } from "@/lib/utils";

/**
 * CorePoster — a faceted crystal rendered in pure CSS. It is the static stand-in
 * for the WebGL core (Phase 2 replaces the interior of the stage) and, per brief
 * §4, the poster served on mobile / save-data / prefers-reduced-motion where the
 * heavy 3D never mounts. No hand-rolled illustration of "content" — this is the
 * brand object itself, a documented signature.
 */

// Pointy-top hexagon — the crystal silhouette.
const HEX = "polygon(50% 0%, 100% 27%, 100% 73%, 50% 100%, 0% 73%, 0% 27%)";
// Facet gradients: dark glass with faint internal planes.
const FACETS =
  "conic-gradient(from 210deg at 50% 42%, #17171c 0deg, #0b0b0d 70deg, #1b1b21 150deg, #08080a 220deg, #17171c 300deg, #0b0b0d 360deg)";

export function CorePoster({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("relative aspect-square w-full max-w-[540px]", className)}
    >
      {/* Red bloom breathing behind the crystal */}
      <div className="absolute inset-[-12%] bloom-red blur-3xl motion-safe:animate-[dmg-pulse_6s_ease-in-out_infinite]" />

      <div className="absolute inset-[9%] motion-safe:animate-[dmg-float_7s_ease-in-out_infinite]">
        <div className="relative h-full w-full">
          {/* Crystal body */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: HEX,
              background: FACETS,
              boxShadow:
                "inset 0 0 72px rgba(255,30,30,0.16), inset 0 3px 0 rgba(255,255,255,0.05)",
            }}
          />
          {/* Top-face specular highlight */}
          <div
            className="absolute inset-0 opacity-60"
            style={{
              clipPath: "polygon(50% 0%, 100% 27%, 50% 52%, 0% 27%)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.12), transparent 80%)",
            }}
          />
          {/* Lower-left facet shade for depth */}
          <div
            className="absolute inset-0 opacity-70"
            style={{
              clipPath: "polygon(0% 27%, 50% 52%, 50% 100%, 0% 73%)",
              background:
                "linear-gradient(120deg, rgba(0,0,0,0.35), transparent 70%)",
            }}
          />
          {/* Incandescent red vein through the core */}
          <div className="absolute left-1/2 top-[16%] h-[68%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-red to-transparent motion-safe:animate-[dmg-vein_5s_ease-in-out_infinite]" />
          {/* Second, thinner vein */}
          <div className="absolute left-[46%] top-[26%] h-[48%] w-px -rotate-[10deg] bg-gradient-to-b from-transparent via-red/60 to-transparent" />
        </div>
      </div>
    </div>
  );
}
