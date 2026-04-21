"use client";

import { useRole } from "@/lib/roleContext";
import type { Role } from "@/mocks/user";

const ROLES: { value: Role; label: string; emoji: string }[] = [
  { value: "kids",    label: "Дитина",   emoji: "🐣" },
  { value: "adult",   label: "Дорослий", emoji: "🎓" },
  { value: "teacher", label: "Вчитель",  emoji: "👩‍🏫" },
  { value: "parent",  label: "Батьки",   emoji: "👨‍👩‍👧" },
  { value: "admin",   label: "Адмін",    emoji: "⚙️" },
];

/**
 * Demo-only role switcher — floating bar at the bottom of the screen.
 * Wrap your layout with <RoleProvider> and drop <RoleSwitcher /> anywhere.
 */
export default function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-ink text-surface rounded-full px-3 py-2 shadow-xl text-sm">
      <span className="text-ink-muted text-xs mr-2 whitespace-nowrap">Роль (демо):</span>
      {ROLES.map((r) => (
        <button
          key={r.value}
          onClick={() => setRole(r.value)}
          className={[
            "flex items-center gap-1 px-3 py-1 rounded-full transition-colors",
            role === r.value
              ? "bg-primary text-surface font-semibold"
              : "hover:bg-surface/10 text-surface/70",
          ].join(" ")}
        >
          <span>{r.emoji}</span>
          <span className="hidden sm:inline">{r.label}</span>
        </button>
      ))}
    </div>
  );
}
