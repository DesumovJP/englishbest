/**
 * RewardChip — unified delta pill for coins / XP.
 *
 * Single source of truth for "+10 coins" / "+10 XP" rendering. Uses the
 * actual image assets from `/public/coin.png` and `/public/xp.png` (no
 * emoji) so the look is consistent with the kids HUD, shop, and loot
 * box. All colours come from design tokens (`coin`, `coin-bg`,
 * `coin-border` and the matching `xp` family in globals.css), so the
 * pill respects the global theme.
 *
 * Use this everywhere a delta needs to be shown (mini-task / lesson
 * success modals, achievement rows, reward-event stream). For balance
 * displays (caller's current total), keep using `KidsCoinBadge` /
 * `XpBadge` — those don't carry a +sign.
 */
import type { CSSProperties } from 'react';

type Kind = 'coin' | 'xp';
type Size = 'xs' | 'sm' | 'md' | 'lg';
type Tone = 'light' | 'onDark';

interface RewardChipProps {
  kind: Kind;
  amount: number;
  size?: Size;
  tone?: Tone;
  /** Hide the leading "+" (rare — use for past totals). */
  signed?: boolean;
  className?: string;
  style?: CSSProperties;
}

const ICON: Record<Kind, string> = {
  coin: '/coin.png',
  xp: '/xp.png',
};

const SIZE: Record<Size, { icon: number; pad: string; text: string; gap: string }> = {
  xs: { icon: 12, pad: 'px-1.5 py-0.5',  text: 'text-[11px]',   gap: 'gap-1' },
  sm: { icon: 16, pad: 'px-2.5 py-1',    text: 'text-[12.5px]', gap: 'gap-1.5' },
  md: { icon: 18, pad: 'px-3 py-1.5',    text: 'text-[14px]',   gap: 'gap-1.5' },
  lg: { icon: 22, pad: 'px-3.5 py-2',    text: 'text-[16px]',   gap: 'gap-2' },
};

function paletteFor(kind: Kind, tone: Tone): string {
  if (tone === 'onDark') {
    return 'bg-white/15 text-white border border-white/25';
  }
  return kind === 'coin'
    ? 'bg-coin-bg text-coin border border-coin-border'
    : 'bg-xp-bg text-xp border border-xp-border';
}

export function RewardChip({
  kind,
  amount,
  size = 'sm',
  tone = 'light',
  signed = true,
  className = '',
  style,
}: RewardChipProps) {
  const s = SIZE[size];
  const palette = paletteFor(kind, tone);
  return (
    <span
      className={`inline-flex items-center font-black rounded-full ${s.gap} ${s.pad} ${palette} ${className}`.trim()}
      style={style}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ICON[kind]}
        alt=""
        aria-hidden
        width={s.icon}
        height={s.icon}
        className="object-contain flex-shrink-0"
      />
      <span className={`${s.text} tabular-nums leading-none`}>
        {signed ? `+${amount}` : amount}
      </span>
    </span>
  );
}
