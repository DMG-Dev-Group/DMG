import { cn } from "@/lib/utils";
import { SectionIndex } from "@/components/ui/hud";

/**
 * Section — cinematic vertical rhythm (brief §3: 100-160px breathing).
 * Optional HUD index marker ([ 01 / NAME ]). Content is width-contained.
 */
export function Section({
  id,
  index,
  label,
  children,
  className,
  containerClassName,
  bleed = false,
}: {
  id?: string;
  index?: string;
  label?: string;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  /** Full-bleed: skip the max-width container (for pinned / 3D stages). */
  bleed?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn("relative py-28 md:py-40", className)}
    >
      {bleed ? (
        children
      ) : (
        <div
          className={cn(
            "mx-auto w-full max-w-[1400px] px-6 md:px-10",
            containerClassName,
          )}
        >
          {(index || label) && (
            <SectionIndex
              index={index ?? "00"}
              label={label ?? ""}
              className="mb-14 md:mb-20"
            />
          )}
          {children}
        </div>
      )}
    </section>
  );
}
