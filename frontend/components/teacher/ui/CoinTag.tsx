interface CoinTagProps {
  amount: number;
  bonus?: number;
  className?: string;
}

export function CoinTag({ amount, bonus, className = '' }: CoinTagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded border border-border text-ink-muted tabular-nums ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/coin.png" alt="" className="w-3 h-3 flex-shrink-0" />
      {amount}
      {bonus ? <span className="text-[10px] opacity-75">+{bonus}</span> : null}
    </span>
  );
}
