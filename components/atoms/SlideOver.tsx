'use client';
import { useEffect } from 'react';

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: 'md' | 'lg';
}

export function SlideOver({ open, onClose, title, children, width = 'md' }: SlideOverProps) {
  /* Закрити по Escape */
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  /* Заблокувати скрол body */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const panelWidth = width === 'lg' ? 'max-w-2xl' : 'max-w-lg';

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Панель */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`fixed top-0 right-0 z-50 h-full w-full ${panelWidth} bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Шапка */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
            <h2 className="font-black text-ink text-lg">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Закрити панель"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Контент */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </aside>
    </>
  );
}
