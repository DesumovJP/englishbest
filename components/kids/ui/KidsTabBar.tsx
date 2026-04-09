/**
 * KidsTabBar — horizontally scrollable tab bar for kids pages.
 *
 * Each tab has its own color variant, 3D active shadow, and an optional
 * counter badge (e.g. "2/4 куплено").
 *
 * Tab color is passed via `color` (bg) and `colorDark` (shadow) —
 * these should reference CSS custom property values or use the preset
 * TAB_COLORS map from the consuming page.
 *
 * Usage:
 *   const TABS = [
 *     { id: "furniture", label: "Меблі", emoji: "🛋️",
 *       color: "#1CB0F6", colorDark: "#0e8bc2", colorLight: "#e0f7ff" },
 *   ];
 *   <KidsTabBar tabs={TABS} active="furniture" onSelect={setTab}
 *     getCount={t => `${bought}/${total}`} />
 */

export interface KidsTab {
  id: string;
  label: string;
  emoji: string;
  /** Active background color — should match a design token value */
  color: string;
  /** Shadow color for 3D press — darker shade of color */
  colorDark: string;
  /** Inactive tinted background */
  colorLight: string;
}

interface KidsTabBarProps {
  tabs: KidsTab[];
  active: string;
  onSelect: (id: string) => void;
  /** Optional: return a count label like "2/4" shown inside the tab badge */
  getCount?: (tabId: string) => string;
  className?: string;
}

export function KidsTabBar({
  tabs,
  active,
  onSelect,
  getCount,
  className = "",
}: KidsTabBarProps) {
  return (
    <div className={`flex gap-2 px-4 pb-3 overflow-x-auto ${className}`}>
      {tabs.map((t) => {
        const isActive = active === t.id;
        const count = getCount?.(t.id);
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-sm whitespace-nowrap shrink-0 transition-transform active:translate-y-0.5"
            style={
              isActive
                ? { background: t.color, color: "#fff", boxShadow: `0 4px 0 ${t.colorDark}` }
                : { background: t.colorLight, color: t.colorDark }
            }
          >
            <span className="text-base">{t.emoji}</span>
            <span>{t.label}</span>
            {count && (
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-black leading-none"
                style={
                  isActive
                    ? { background: "rgba(255,255,255,0.3)", color: "#fff" }
                    : { background: "rgba(0,0,0,0.08)", color: t.colorDark }
                }
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
