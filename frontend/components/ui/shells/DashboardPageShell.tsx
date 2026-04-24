import { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { PageHeader } from "../PageHeader";
import { Toolbar } from "../Toolbar";
import { LoadingState } from "../LoadingState";
import { ErrorState } from "../ErrorState";
import { EmptyState } from "../EmptyState";

type Status = "loading" | "error" | "empty" | "ready";

interface Crumb {
  label: ReactNode;
  href?: string;
}

interface EmptySlot {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

interface DashboardPageShellProps {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumbs?: readonly Crumb[];
  actions?: ReactNode;
  /** Optional secondary row (search, filters, segmented control). */
  toolbar?: ReactNode;
  /** Render state. "ready" shows children; other states render matching primitive. */
  status?: Status;
  /** Error message surfaced when status="error". */
  error?: string | null;
  onRetry?: () => void;
  empty?: EmptySlot;
  /** Skeleton shape to render while loading. Default: "list". */
  loadingShape?: "list" | "card" | "table";
  children?: ReactNode;
  className?: string;
  /** Extra classes on the content wrapper that holds children / state primitives. */
  bodyClassName?: string;
}

/**
 * Canonical dashboard page layout: header + optional toolbar + state-aware body.
 *
 * Sits *inside* app/dashboard/layout.tsx (which owns Sidebar + max-width wrapper),
 * so this only composes page-level chrome. Pages pass a single `status` prop
 * instead of hand-rolling loading / error / empty branches.
 */
export function DashboardPageShell({
  title,
  subtitle,
  breadcrumbs,
  actions,
  toolbar,
  status = "ready",
  error,
  onRetry,
  empty,
  loadingShape = "list",
  children,
  className,
  bodyClassName,
}: DashboardPageShellProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs}
        actions={actions}
      />
      {toolbar && <Toolbar className="mb-4">{toolbar}</Toolbar>}
      <div className={cn("flex flex-col gap-4", bodyClassName)}>
        {status === "loading" && <LoadingState shape={loadingShape} rows={4} />}
        {status === "error" && (
          <ErrorState description={error ?? undefined} onRetry={onRetry} />
        )}
        {status === "empty" && empty && (
          <EmptyState
            title={empty.title}
            description={empty.description}
            icon={empty.icon}
            action={empty.action}
          />
        )}
        {status === "ready" && children}
      </div>
    </div>
  );
}
