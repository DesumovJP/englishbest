import { HTMLAttributes } from 'react';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

const PADDING: Record<CardPadding, string> = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  /** overflow-hidden by default when padding='none', override with className */
  overflow?: boolean;
}

export function Card({
  padding = 'md',
  overflow = false,
  className = '',
  children,
  ...rest
}: CardProps) {
  const overflowCls = (overflow || padding === 'none') ? 'overflow-hidden' : '';
  return (
    <div
      className={`bg-white rounded-2xl border border-border ${overflowCls} ${PADDING[padding]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
