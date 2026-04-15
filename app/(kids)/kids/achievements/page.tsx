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
    <div className="flex flex-col h-[100dvh] bg-[#F9FAFB] overflow-hidden">

      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-white"
        style={{ borderBottom: "2px solid #F3F4F6", paddingTop: "env(safe-area-inset-top, 12px)" }}>
        <Link href="/kids/dashboard"
          className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg active:scale-90 transition-transform"
          style={{ background: "#F3F4F6", color: "#374151" }}>←</Link>
        <span className="font-black" style={{ fontSize: 17, color: "#1A1A2E" }}>Rewards 🏆</span>
        <div className="flex items-center gap-1 rounded-full px-3 py-1.5"
          style={{ background: "#FFFBEB", border: "2px solid #FDE68A" }}>
          <img src="/xp.png" alt="XP" style={{ width: 18, height: 18, objectFit: "contain" }} />
          <span className="font-black" style={{ fontSize: 13, color: "#92400E" }}>{state.xp ?? 0}</span>
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: "🏆", val: earned.length, label: "Earned" },
            { icon: "🔥", val: state.streak ?? 0, label: "Streak" },
            { icon: "xp", val: state.xp ?? 0,     label: "XP" },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center rounded-2xl py-3"
              style={{ background: "white", border: "2px solid #F3F4F6", boxShadow: "0 3px 0 #E5E7EB" }}>
              {s.icon === "xp"
                ? <img src="/xp.png" alt="XP" style={{ width: 22, height: 22, objectFit: "contain" }} />
                : <span style={{ fontSize: 22 }}>{s.icon}</span>
              }
              <p className="font-black" style={{ fontSize: 18, color: "#1A1A2E" }}>{s.val}</p>
              <p className="font-bold" style={{ fontSize: 10, color: "#9CA3AF" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Achievement list */}
        <div className="flex flex-col gap-2 pb-24">
          {ACHIEVEMENTS.map(a => (
            <div key={a.id}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{
                background: "white",
                border: `2px solid ${a.earned ? "#BBF7D0" : "#F3F4F6"}`,
                boxShadow: `0 3px 0 ${a.earned ? "#86EFAC" : "#E5E7EB"}`,
                opacity: a.earned ? 1 : 0.55,
              }}>
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: a.earned ? "#F0FDF4" : "#F9FAFB", filter: a.earned ? "none" : "grayscale(1)" }}>
                {a.earned ? a.emoji : "🔒"}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-black leading-tight" style={{ fontSize: 14, color: a.earned ? "#1A1A2E" : "#9CA3AF" }}>
                  {a.titleEn}
                </p>
                <p className="font-bold leading-none mt-0.5" style={{ fontSize: 11, color: "#9CA3AF" }}>{a.desc}</p>
              </div>

              {/* XP badge */}
              <div className="flex-shrink-0 rounded-xl px-2.5 py-1 flex items-center gap-1"
                style={{
                  background: a.earned ? "#F0FDF4" : "#F9FAFB",
                  border: `2px solid ${a.earned ? "#BBF7D0" : "#E5E7EB"}`,
                }}>
                <span className="font-black" style={{ fontSize: 12, color: a.earned ? "#16A34A" : "#9CA3AF" }}>
                  +{a.xp}
                </span>
                <img src="/xp.png" alt="XP" style={{ width: 14, height: 14, objectFit: "contain", opacity: a.earned ? 1 : 0.5 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
