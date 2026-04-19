'use client';
import { InputHTMLAttributes } from 'react';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  containerClassName?: string;
}

export function SearchInput({
  placeholder = 'Пошук...',
  containerClassName = 'w-56',
  className = '',
  ...rest
}: SearchInputProps) {
  return (
    <div className={`relative flex-shrink-0 ${containerClassName}`}>
      <svg
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        aria-hidden
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="search"
        placeholder={placeholder}
        className={`w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-white text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-primary transition-colors ${className}`}
        {...rest}
      />
    </div>
  );
}
