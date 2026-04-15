"use client";

import Link from "next/link";
import { useKidsState } from "@/lib/use-kids-store";

const ACHIEVEMENTS = [
  { id: "first-lesson",   emoji: "🎓", titleEn: "First Lesson",      desc: "Finish your very first lesson",    xp: 100, earned: true  },
  { id: "streak-3",       emoji: "🔥", titleEn: "Hot Streak",        desc: "Learn 3 days in a row",            xp: 50,  earned: true  },
  { id: "streak-7",       emoji: "🔥", titleEn: "On Fire!",          desc: "Learn 7 days in a row",            xp: 150, earned: true  },
  { id: "streak-30",      emoji: "🏅", titleEn: "Iron Will",         desc: "Learn 30 days in a row",           xp: 500, earned: false },
  { id: "vocab-50",       emoji: "📚", titleEn: "Word Collector",    desc: "Learn 50 new words",               xp: 200, earned: true  },
  { id: "vocab-200",      emoji: "📖", titleEn: "Bookworm",          desc: "Learn 200 new words",              xp: 500, earned: false },
  { id: "quiz-perfect",   emoji: "⚡", titleEn: "Perfect Score!",    desc: "Ace a quiz with no mistakes",       xp: 75,  earned: true  },
  { id: "room-decorated", emoji: "🏠", titleEn: "Interior Designer", desc: "Place 5 items in your room",       xp: 100, earned: false },
  { id: "coins-500",      emoji: "💰", titleEn: "Piggy Bank",        desc: "Collect 500 coins",                xp: 50,  earned: false },
  { id: "lessons-10",     emoji: "🌟", titleEn: "Ten Down!",         desc: "Complete 10 lessons",              xp: 300, earned: false },
];

export default function AchievementsPage() {
  const { state } = useKidsState();
  const earned = ACHIEVEMENTS.filter(a => a.earned);

  return (
    <div className="flex flex-col h-dvh bg-gray-50 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b-2 border-gray-100 pt-[max(12px,env(safe-area-inset-top))]">
        <Link href="/kids/dashboard"
          className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg bg-gray-100 text-gray-700 active:scale-90 transition-transform">
          ←
        </Link>
        <span className="font-black text-[17px] text-gray-900">Rewards 🏆</span>
        <div className="flex items-center gap-1 rounded-full px-3 py-1.5 bg-amber-50 border-2 border-amber-200">
          <img src="/xp.png" alt="XP" width={18} height={18} className="object-contain" />
          <span className="font-black text-[13px] text-amber-800">{state.xp ?? 0}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: "🏆", val: earned.length, label: "Earned" },
            { icon: "🔥", val: state.streak ?? 0, label: "Streak" },
            { icon: "xp", val: state.xp ?? 0,     label: "XP" },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center rounded-2xl py-3 bg-white border-2 border-gray-100 shadow-[0_3px_0_#E5E7EB]">
              {s.icon === "xp"
                ? <img src="/xp.png" alt="XP" width={22} height={22} className="object-contain" />
                : <span className="text-[22px]">{s.icon}</span>
              }
              <p className="font-black text-lg text-gray-900">{s.val}</p>
              <p className="font-bold text-[10px] text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Achievement list */}
        <div className="flex flex-col gap-2 pb-24">
          {ACHIEVEMENTS.map(a => (
            <div key={a.id}
              className={[
                "flex items-center gap-3 rounded-2xl px-4 py-3 bg-white border-2",
                a.earned
                  ? "border-green-200 shadow-[0_3px_0_#86EFAC] opacity-100"
                  : "border-gray-100 shadow-[0_3px_0_#E5E7EB] opacity-55",
              ].join(" ")}>
              <div className={[
                "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0",
                a.earned ? "bg-green-50" : "bg-gray-50 grayscale",
              ].join(" ")}>
                {a.earned ? a.emoji : "🔒"}
              </div>

              <div className="flex-1 min-w-0">
                <p className={["font-black leading-tight text-sm", a.earned ? "text-gray-900" : "text-gray-400"].join(" ")}>
                  {a.titleEn}
                </p>
                <p className="font-bold leading-none mt-0.5 text-[11px] text-gray-400">{a.desc}</p>
              </div>

              <div className={[
                "flex-shrink-0 rounded-xl px-2.5 py-1 flex items-center gap-1 border-2",
                a.earned ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200",
              ].join(" ")}>
                <span className={["font-black text-xs", a.earned ? "text-green-600" : "text-gray-400"].join(" ")}>
                  +{a.xp}
                </span>
                <img src="/xp.png" alt="XP" width={14} height={14}
                  className={["object-contain", a.earned ? "opacity-100" : "opacity-50"].join(" ")} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
