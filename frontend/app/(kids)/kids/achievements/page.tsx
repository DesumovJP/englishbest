"use client";

import { useMemo } from "react";
import { useKidsState, useAchievements } from "@/lib/use-kids-store";
import type { AchievementCategory } from "@/lib/achievements";
import { KidsPageShell } from "@/components/ui/shells";
import { KidsPageHeader } from "@/components/kids/ui";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";

const CATEGORY_EMOJI: Record<AchievementCategory, string> = {
  streak: "🔥",
  lessons: "🎓",
  coins: "💰",
  social: "👥",
  kids: "🏠",
  mastery: "🏅",
  special: "⭐",
};

export default function AchievementsPage() {
  const { state } = useKidsState();
  const { catalog, earned, loading } = useAchievements();

  const earnedSlugs = useMemo(() => {
    const set = new Set<string>();
    for (const ua of earned) {
      if (ua.achievement?.slug) set.add(ua.achievement.slug);
    }
    return set;
  }, [earned]);

  const rows = useMemo(
    () =>
      catalog.map((a) => ({
        ...a,
        earned: earnedSlugs.has(a.slug),
      })),
    [catalog, earnedSlugs],
  );

  const earnedCount = rows.filter((r) => r.earned).length;
  const xp = state.xp ?? 0;
  const streak = state.streak ?? 0;

  return (
    <KidsPageShell
      header={
        <KidsPageHeader
          title="Досягнення 🏆"
          backHref="/kids/dashboard"
          right={
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-coin-bg border-2 border-coin">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/xp.png" alt="" aria-hidden width={18} height={18} className="object-contain" />
              <span className="font-black text-[13px] text-coin">{xp}</span>
            </div>
          }
        />
      }
    >
      <div className="py-4 max-w-screen-sm mx-auto flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "🏆", val: earnedCount, label: "Отримано" },
            { icon: "🔥", val: streak,      label: "Streak"   },
            { icon: "xp", val: xp,          label: "XP"       },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center rounded-2xl py-3 bg-surface-raised border-2 border-border shadow-card">
              {s.icon === "xp" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/xp.png" alt="" aria-hidden width={22} height={22} className="object-contain" />
              ) : (
                <span className="text-[22px]" aria-hidden>{s.icon}</span>
              )}
              <p className="font-black text-lg text-ink tabular-nums">{s.val}</p>
              <p className="font-bold text-[10px] text-ink-faint uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <LoadingState shape="list" rows={6} />
        ) : rows.length === 0 ? (
          <EmptyState
            title="Поки немає досягнень"
            description="Проходь уроки й виконуй щоденні завдання — перше досягнення вже близько."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {rows.map(a => (
              <li
                key={a.slug}
                className={[
                  "flex items-center gap-3 rounded-2xl px-4 py-3 bg-surface-raised border-2",
                  a.earned ? "border-success shadow-card" : "border-border opacity-60",
                ].join(" ")}
              >
                <div
                  className={[
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden",
                    a.earned ? "bg-success/10" : "bg-surface-muted grayscale",
                  ].join(" ")}
                  aria-hidden
                >
                  {a.earned
                    ? (a.iconUrl
                        ? /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={a.iconUrl} alt="" className="w-full h-full object-cover" />
                        : <span>{CATEGORY_EMOJI[a.category]}</span>)
                    : "🔒"}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={["font-black leading-tight text-sm", a.earned ? "text-ink" : "text-ink-faint"].join(" ")}>
                    {a.title}
                  </p>
                  <p className="font-bold leading-none mt-0.5 text-[11px] text-ink-faint">{a.description}</p>
                </div>

                <div
                  className={[
                    "flex-shrink-0 rounded-xl px-2.5 py-1 flex items-center gap-1 border-2",
                    a.earned ? "bg-success/10 border-success" : "bg-surface-muted border-border",
                  ].join(" ")}
                >
                  <span className={["font-black text-xs tabular-nums", a.earned ? "text-success-dark" : "text-ink-faint"].join(" ")}>
                    +{a.xpReward}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/xp.png" alt="" aria-hidden width={14} height={14}
                    className={["object-contain", a.earned ? "opacity-100" : "opacity-50"].join(" ")} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </KidsPageShell>
  );
}
