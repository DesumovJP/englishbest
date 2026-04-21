'use client';
import { useEffect, useRef } from 'react';

type ModalWidth = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  width?: ModalWidth;
  bodyClassName?: string;
  children: React.ReactNode;
}

const WIDTH_CLS: Record<ModalWidth, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  width = 'md',
  bodyClassName = 'p-5',
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && focusable && focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Dialog'}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={dialogRef}
        className={`relative z-10 w-full ${WIDTH_CLS[width]} bg-white rounded-[14px] shadow-2xl border border-border max-h-[90vh] flex flex-col overflow-hidden`}
      >
        {(title || subtitle) && (
          <div className="flex items-start justify-between gap-3 px-5 py-3.5 border-b border-border flex-shrink-0">
            <div className="min-w-0">
              {title    && <h2 className="text-[15px] font-semibold text-ink truncate">{title}</h2>}
              {subtitle && <p className="text-[12px] text-ink-muted mt-0.5 truncate">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Закрити"
              className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-surface-muted transition-colors text-ink-muted hover:text-ink flex-shrink-0"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          </div>
        )}
        {!title && !subtitle && (
          <button
            onClick={onClose}
            aria-label="Закрити"
            className="absolute top-3 right-3 z-10 w-7 h-7 rounded-md flex items-center justify-center bg-white/80 backdrop-blur hover:bg-surface-muted transition-colors text-ink-muted hover:text-ink"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        )}
        <div className={`flex-1 overflow-y-auto ${bodyClassName}`}>{children}</div>
      </div>
    </div>
  );
}
