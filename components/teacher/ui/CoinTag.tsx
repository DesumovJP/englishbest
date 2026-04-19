interface CoinTagProps {
  amount: number;
  bonus?: number;
  className?: string;
}

export function CoinTag({ amount, bonus, className = '' }: CoinTagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-md bg-coin-bg text-coin border border-coin-border ${className}`}
    >
      <span aria-hidden>🪙</span>
      {amount}
      {bonus ? <span className="text-[10px] font-bold opacity-75">+{bonus}</span> : null}
    </span>
  );
}
