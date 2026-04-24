import { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface AuthPageShellProps {
  /**
   * Optional left-column slot — brand panel, imagery, testimonial.
   * Hidden below `lg` breakpoint to keep mobile focused on the form.
   */
  brand?: ReactNode;
  /** Main form content, rendered centered in the right column. */
  children?: ReactNode;
  /** Maximum width of the right-column form card. Default: "max-w-md". */
  formWidth?: string;
  className?: string;
}

/**
 * Split layout for /auth pages (login, register, profile setup).
 *
 * Two-pane on desktop: brand panel (left) + centered form (right).
 * On mobile the brand collapses and the form takes the full width.
 * Pages compose their own form body using <FormField>/<Input>/etc. —
 * this shell only handles the outer split and centering.
 */
export function AuthPageShell({
  brand,
  children,
  formWidth = "max-w-md",
  className,
}: AuthPageShellProps) {
  return (
    <div className={cn("min-h-svh flex bg-surface-muted", className)}>
      {brand && (
        <aside className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 bg-gradient-to-br from-primary to-primary-dark px-10 py-12 text-white">
          {brand}
        </aside>
      )}
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:px-6">
        <div className={cn("w-full", formWidth)}>{children}</div>
      </main>
    </div>
  );
}
