/**
 * KidsCoinBadge — coin balance display pill.
 * Uses coin design tokens: bg-coin-bg, border-coin, text-coin.
 *
 * Usage:
 *   <KidsCoinBadge amount={340} />
 *   <KidsCoinBadge amount={340} size="lg" />
 */

interface KidsCoinBadgeProps {
  amount: number;
  size?: "sm" | "md" | "lg";
}

const SIZE: Record<NonNullable<KidsCoinBadgeProps["size"]>, { emoji: string; text: string; pad: string }> = {
  sm: { emoji: "text-lg",  text: "text-base font-black", pad: "px-3 py-1.5" },
  md: { emoji: "text-xl",  text: "text-lg  font-black", pad: "px-4 py-2"   },
  lg: { emoji: "text-2xl", text: "text-xl  font-black", pad: "px-4 py-2"   },
};

export function KidsCoinBadge({ amount, size = "md" }: KidsCoinBadgeProps) {
  const s = SIZE[size];
  return (
    <div className={`flex items-center gap-2 bg-coin-bg border-2 border-coin rounded-2xl ${s.pad}`}>
      <img src="/coin.png" alt="coin" className="leading-none" style={{ width: size === "sm" ? 18 : size === "md" ? 22 : 26, height: size === "sm" ? 18 : size === "md" ? 22 : 26, objectFit: "contain" }} />
      <span className={`${s.text} text-coin`}>{amount}</span>
    </div>
  );
}
