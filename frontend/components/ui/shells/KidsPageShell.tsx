import { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface KidsPageShellProps {
  /** Optional header region — typically <KidsPageHeader /> from components/kids/ui. */
  header?: ReactNode;
  /** Optional fixed/absolute background layer (e.g. a room scene, gradient). */
  background?: ReactNode;
  /** Main scrollable content. */
  children?: ReactNode;
  /** When true, removes horizontal page padding — use for edge-to-edge scenes. */
  edge?: boolean;
  className?: string;
  contentClassName?: string;
}

/**
 * Frame for every kids-zone page: sits inside (kids)/layout.tsx (which already
 * applies `.toca` + fixed KidsFooter) and handles:
 *   - bottom padding so content clears the fixed bottom nav (~92px total)
 *   - safe-area insets on mobile
 *   - optional sticky header slot
 *   - optional full-bleed background layer positioned under the content
 *
 * Kids pages should NEVER render their own max-width wrapper — this shell
 * controls the readable measure via `max-w-screen-md` on the content layer.
 */
export function KidsPageShell({
  header,
  background,
  children,
  edge = false,
  className,
  contentClassName,
}: KidsPageShellProps) {
  return (
    <div className={cn("relative min-h-svh flex flex-col", className)}>
      {background && (
        <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          {background}
        </div>
      )}
      {header}
      <main
        className={cn(
          "flex-1 min-w-0 pb-[calc(92px+env(safe-area-inset-bottom,0px))]",
          !edge && "px-4 sm:px-6",
          contentClassName,
        )}
      >
        {children}
      </main>
    </div>
  );
}
