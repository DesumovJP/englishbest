/**
 * KidsLevelBar — XP progress visualised as a level chip + thin progress bar.
 *
 * Visual goal: small, calm, on-the-page-but-not-shouting. Sits in the HUD
 * stack alongside coins / streak. Reward animations live elsewhere
 * (lesson result, mini-task result, achievement modal); this component
 * just reflects the current state.
 *
 * Two layouts:
 *   compact  → single-row pill: [Lv.5  ▰▰▰▱  120/250 XP]
 *   stacked  → two lines: title + bar. Used inside HudCard on dashboard.
 */
import { levelFromXp } from '@/lib/level';

interface KidsLevelBarProps {
  xp: number;
  layout?: 'compact' | 'stacked';
  className?: string;
}

export function KidsLevelBar({ xp, layout = 'stacked', className = '' }: KidsLevelBarProps) {
  const info = levelFromXp(xp);
  const pct = Math.round(info.progress * 100);

  if (layout === 'compact') {
    return (
      <div
        className={`inline-flex items-center gap-2 bg-surface-muted rounded-full pl-2 pr-3 py-1 ${className}`}
        aria-label={`Рівень ${info.level}, ${info.currentInLevel} з ${info.nextThreshold} XP`}
      >
        <span className="font-black text-[11px] text-purple-dark bg-purple/15 rounded-full px-1.5 py-0.5 leading-none">
          Lv.{info.level}
        </span>
        <div className="w-14 h-1.5 rounded-full bg-ink-faint/20 overflow-hidden">
          <div
            className="h-full bg-purple transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[10px] font-bold text-ink-muted tabular-nums">
          {info.currentInLevel}/{info.nextThreshold}
        </span>
      </div>
    );
  }

  return (
    <div className={className} aria-label={`Рівень ${info.level}, ${info.currentInLevel} з ${info.nextThreshold} XP`}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="font-black text-[12px] text-ink leading-none">
          Lv.{info.level}
        </span>
        <span className="text-[10px] font-bold text-ink-muted tabular-nums leading-none">
          {info.currentInLevel}/{info.nextThreshold} XP
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-ink-faint/15 overflow-hidden">
        <div
          className="h-full bg-purple transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
