"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const STEPS = [
  { href: "/login",      label: "Логін",        emoji: "🔑" },
  { href: "/welcome",    label: "Вітання",       emoji: "👋" },
  { href: "/onboarding", label: "Вікова група",  emoji: "🧒" },
  { href: "/placement",  label: "Тест рівня",    emoji: "📝" },
  { href: "/companion",  label: "Персонаж",      emoji: "🦊" },
];

export default function DemoBar() {
  const pathname = usePathname();

  return (
    <div className="w-full bg-ink text-surface px-4 py-2 flex items-center gap-3 text-xs overflow-x-auto">
      <span className="text-ink-muted whitespace-nowrap font-semibold flex-shrink-0">Демо:</span>
      <div className="flex items-center gap-1 flex-shrink-0">
        {STEPS.map((step, idx) => {
          const active = pathname === step.href;
          const done = STEPS.findIndex(s => s.href === pathname) > idx;
          return (
            <div key={step.href} className="flex items-center gap-1">
              <Link
                href={step.href}
                className={[
                  "flex items-center gap-1 px-2.5 py-1 rounded-full whitespace-nowrap font-semibold transition-colors",
                  active
                    ? "bg-primary text-white"
                    : done
                    ? "text-primary-light hover:text-white"
                    : "text-white/50 hover:text-white",
                ].join(" ")}
              >
                <span>{step.emoji}</span>
                <span className="hidden sm:inline">{step.label}</span>
              </Link>
              {idx < STEPS.length - 1 && (
                <span className="text-white/20">›</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="ml-auto flex-shrink-0">
        <Link
          href="/dashboard"
          className="text-white/50 hover:text-white transition-colors whitespace-nowrap"
        >
          ← Дашборд
        </Link>
      </div>
    </div>
  );
}
