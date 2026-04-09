/**
 * KidsChallengeItem — single row in the "daily challenges" list.
 *
 * States:
 *   done=true   → green check, strikethrough label, green XP badge
 *   done=false  → colored icon border, normal label, muted XP badge
 *
 * Usage:
 *   <KidsChallengeItem icon="🔥" label="Зроби 1 урок" xp={50} done={true} token="accent" />
 */

type ColorToken = 'accent' | 'secondary' | 'purple' | 'success' | 'danger' | 'primary';

interface KidsChallengeItemProps {
  icon: string;
  label: string;
  xp: number;
  done: boolean;
  /** Design token name — maps to CSS var(--color-<token>) */
  token: ColorToken;
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 10L8.5 14.5L16 6.5" stroke="white" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function KidsChallengeItem({
  icon,
  label,
  xp,
  done,
  token,
}: KidsChallengeItemProps) {
  const color     = `var(--color-${token})`;
  const colorDark = `var(--color-${token}-dark)`;

  return (
    <div
      className="flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all"
      style={{
        borderColor: done ? "var(--color-border)" : color,
        background:  done ? "var(--color-surface-muted)" : `color-mix(in srgb, ${color} 8%, transparent)`,
      }}
    >
      {/* Icon / checkmark */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
        style={{
          background: done ? "var(--color-primary)" : "var(--color-surface)",
          border: done ? "none" : `2px solid ${color}`,
        }}
      >
        {done ? <CheckIcon /> : <span>{icon}</span>}
      </div>

      {/* Label */}
      <span
        className="flex-1 text-base font-bold"
        style={{
          color: done ? "var(--color-ink-faint)" : "var(--color-ink)",
          textDecoration: done ? "line-through" : "none",
        }}
      >
        {label}
      </span>

      {/* XP badge */}
      <div
        className="rounded-full px-3 py-1"
        style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}
      >
        <span className="text-sm font-black" style={{ color: colorDark }}>
          +{xp} XP
        </span>
      </div>
    </div>
  );
}
