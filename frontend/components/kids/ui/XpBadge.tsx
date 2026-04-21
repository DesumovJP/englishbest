interface XpBadgeProps {
  amount: number;
  size?: "sm" | "md";
  tone?: "light" | "onDark";
}

export function XpBadge({ amount, size = "md", tone = "light" }: XpBadgeProps) {
  const icon = size === "sm" ? 14 : 18;
  const pad  = size === "sm" ? "px-2 py-1"   : "px-3 py-1.5";
  const text = size === "sm" ? "text-[11px]" : "text-xs";
  const cls  = tone === "onDark"
    ? "bg-white/20 text-white border border-white/25"
    : "bg-accent/10 text-accent-dark border border-accent/25";
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-xl font-black ${pad} ${cls}`}>
      <span className={text}>+{amount}</span>
      <img src="/xp.png" alt="" aria-hidden width={icon} height={icon} className="object-contain" />
    </div>
  );
}
