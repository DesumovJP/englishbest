"use client";

import { HTMLAttributes, ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

type Size = "sm" | "md" | "lg" | "xl" | "fullscreen";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  /** Preferred alias for `width`. */
  size?: Size;
  /** @deprecated use `size` */
  width?: Size;
  bodyClassName?: string;
  children: ReactNode;
}

const sizeClasses: Record<Size, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
  fullscreen: "max-w-[100vw] max-h-[100dvh] h-[100dvh] rounded-none",
};

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  size,
  width,
  bodyClassName = "p-5",
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const resolvedSize: Size = size ?? width ?? "md";

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Auto-focus the first focusable on open. Must depend ONLY on isOpen — if we
  // re-run on every render (e.g. from an unstable onClose), the call to
  // focusable[0].focus() yanks focus out of inputs after every keystroke.
  useEffect(() => {
    if (!isOpen) return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    focusable?.[0]?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Dialog"}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={dialogRef}
        className={cn(
          "relative z-10 w-full bg-surface-raised rounded-modal shadow-overlay border border-border max-h-[90vh] flex flex-col overflow-hidden",
          sizeClasses[resolvedSize],
        )}
      >
        {(title || subtitle) && (
          <ModalHeader>
            <div className="min-w-0">
              {title && <h2 className="text-[15px] font-semibold text-ink truncate">{title}</h2>}
              {subtitle && <p className="text-xs text-ink-muted mt-0.5 truncate">{subtitle}</p>}
            </div>
            <CloseButton onClose={onClose} />
          </ModalHeader>
        )}
        {!title && !subtitle && (
          <button
            onClick={onClose}
            aria-label="Закрити"
            className="absolute top-3 right-3 z-10 w-7 h-7 rounded-md flex items-center justify-center bg-surface-raised/80 backdrop-blur hover:bg-surface-muted transition-colors text-ink-muted hover:text-ink"
          >
            <CloseIcon />
          </button>
        )}
        <div className={cn("flex-1 overflow-y-auto", bodyClassName)}>{children}</div>
      </div>
    </div>
  );
}

function ModalHeader({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 px-5 py-3.5 border-b border-border flex-shrink-0",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

function ModalBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 overflow-y-auto p-5", className)} {...rest} />;
}

function ModalFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 px-5 py-3 border-t border-border flex-shrink-0",
        className,
      )}
      {...rest}
    />
  );
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      aria-label="Закрити"
      className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-surface-muted transition-colors text-ink-muted hover:text-ink flex-shrink-0"
    >
      <CloseIcon />
    </button>
  );
}

function CloseIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
      <path d="M6 6l12 12M6 18L18 6" />
    </svg>
  );
}

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
