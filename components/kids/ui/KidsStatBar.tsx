/**
 * KidsStatBar — top stats bar with streak, XP progress and coins.
 * Used at the top of the kids dashboard (sticky).
 *
 * Usage:
 *   <KidsStatBar streak={7} xp={1240} xpMax={1000} level={3} coins={340} />
 */

interface KidsStatBarProps {
  streak: number;
  xp: number;
  xpMax?: number;
  level: number;
  coins: number;
}

export function KidsStatBar({
  streak,
  xp,
  xpMax = 1000,
  level,
  coins,
}: KidsStatBarProps) {
  const xpThisLevel = xp % xpMax;
  const pct = Math.min((xpThisLevel / xpMax) * 100, 100);

  return (
    <div className="sticky top-0 z-10 bg-surface border-b-2 border-border px-5 py-3 flex items-center gap-3">
      {/* Streak */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-2xl leading-none">🔥</span>
        <span className="font-black text-base text-accent">{streak}</span>
      </div>

      {/* XP bar */}
      <div className="flex-1 flex items-center gap-2">
        <span className="text-[11px] font-black text-ink-faint shrink-0">
          Рів.{level}
        </span>
        <div className="flex-1 h-3.5 rounded-full overflow-hidden bg-border">
          <div
            className="h-full rounded-full bg-xp-bar transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[11px] font-black text-ink-faint shrink-0 whitespace-nowrap">
          {xpThisLevel} XP
        </span>
      </div>

      {/* Coins */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-2xl leading-none">🪙</span>
        <span className="font-black text-base text-coin">{coins}</span>
      </div>
    </div>
  );
}
