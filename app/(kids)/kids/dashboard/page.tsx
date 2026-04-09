"use client";

import { useState, useCallback } from "react";
import { mockKidsUser } from "@/mocks/user";
import CompanionSVG, { type CompanionMood } from "@/components/kids/CompanionSVG";
import {
  KidsStatBar,
  KidsButton,
  KidsNavCard,
} from "@/components/kids/ui";

/* ── Mood config ───────────────────────────────────────────────── */
const ALL_MOODS: CompanionMood[] = [
  "idle", "happy", "celebrate", "excited", "love", "cool", "sleepy", "surprised", "sad", "angry",
];

const MOOD_EMOJI: Record<CompanionMood, string> = {
  idle: "😊", happy: "🥳", sad: "😢", celebrate: "🎉",
  excited: "🤩", sleepy: "😴", surprised: "😲",
  love: "🥰", angry: "😠", cool: "😎",
};

const MOOD_LABEL: Record<CompanionMood, string> = {
  idle: "Спокій", happy: "Радість", sad: "Сумно", celebrate: "Свято!",
  excited: "Збуджений", sleepy: "Сонний", surprised: "Здивований",
  love: "Любов", angry: "Злий", cool: "Крутий",
};

const BUBBLES: Record<CompanionMood, string[]> = {
  idle:      ["Привіт! Що сьогодні вивчимо?", "Готовий до уроку?"],
  happy:     ["Ура! Ти справжня зірка!", "Я так радий тебе бачити!"],
  sad:       ["Де ти пропав? Я сумував…", "Один урок — і я щасливий!"],
  celebrate: ["Вітаю! Новий рекорд!", "Ти зробив це! Неймовірно!"],
  excited:   ["Новий урок! Швидше!", "Я готовий! А ти?!"],
  sleepy:    ["Zzz... А? О, урок...", "Може, спочатку кава..."],
  surprised: ["Ти вже тут?!", "Не чекав на тебе так рано!"],
  love:      ["Ти мій найулюбленіший учень!", "Так приємно вчитись разом!"],
  angry:     ["Чому так довго?!", "Урок сам себе не пройде!"],
  cool:      ["Все під контролем.", "Буде легко. Я ж крутий."],
};

function randomBubble(mood: CompanionMood) {
  const list = BUBBLES[mood];
  return list[Math.floor(Math.random() * list.length)];
}

/* ── Static page data ─────────────────────────────────────────── */
const LESSON = {
  unit: 3, unitTitle: "Тварини та природа",
  lessonNum: 10, lessonTitle: "Дикі тварини",
  emoji: "🦁", lessonsCompleted: 9, lessonsTotal: 15, xpReward: 15,
};

const CHALLENGES = [
  { icon: "🔥", label: "Зроби 1 урок",       xp: 50, done: true  },
  { icon: "📝", label: "Вивчи 5 нових слів",  xp: 30, done: false },
  { icon: "⚡", label: "Пройди міні-тест",     xp: 20, done: false },
];

/* ── Desktop: sticky companion panel ─────────────────────────── */
function CompanionPanel({ name, animal, mood, bubble, bounceKey, onTap }: {
  name: string; animal: string; mood: CompanionMood;
  bubble: string; bounceKey: number; onTap: () => void;
}) {
  return (
    <div className="h-full flex flex-col px-8 py-10">

      {/* Greeting */}
      <div className="shrink-0">
        <p className="text-sm font-bold text-ink-muted/70">Привіт,</p>
        <h1 className="text-3xl font-black text-ink mt-0.5">{name} 👋</h1>
      </div>

      {/* Center: bubble + character together */}
      <div className="flex-1 flex flex-col items-center justify-center">

        {/* Speech bubble — above the character */}
        <div className="relative self-start mb-10">
          <div className="bg-surface rounded-2xl px-4 py-3 shadow-card-md max-w-[220px]">
            <p className="text-sm font-bold text-ink leading-snug">{bubble}</p>
          </div>
          <div
            className="absolute left-6 -bottom-3 w-0 h-0"
            style={{
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderTop: "12px solid var(--color-surface)",
            }}
            aria-hidden
          />
        </div>

        {/* Character — scale on outer, bounce on inner to avoid override conflict */}
        <button
          onClick={onTap}
          className="focus:outline-none transition-transform active:scale-95"
          aria-label="Змінити настрій"
          style={{ width: 240, height: 320, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
        >
          <div style={{ transform: "scale(2.4)", transformOrigin: "bottom center" }}>
            <div key={bounceKey} className="animate-bounce-in">
              <CompanionSVG
                animal={animal as Parameters<typeof CompanionSVG>[0]["animal"]}
                mood={mood}
              />
            </div>
          </div>
        </button>

      </div>

      {/* Mood pill */}
      <div className="shrink-0 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 bg-surface/80 rounded-full px-5 py-2.5 shadow-card">
          <span className="text-xl">{MOOD_EMOJI[mood]}</span>
          <span className="text-sm font-black text-ink">{MOOD_LABEL[mood]}</span>
        </div>
        <p className="text-[11px] font-semibold text-ink-muted mt-2">
          Натисни щоб змінити настрій
        </p>
      </div>

    </div>
  );
}

/* ── Mobile: compact companion banner ────────────────────────── */
function CompanionBanner({ name, animal, mood, bubble, bounceKey, onTap }: {
  name: string; animal: string; mood: CompanionMood;
  bubble: string; bounceKey: number; onTap: () => void;
}) {
  return (
    <div className="bg-hero-kids px-5 pt-6 pb-0 flex items-end gap-4">
      <div className="flex-1 pb-5 min-w-0">
        <p className="text-sm font-bold text-ink-muted">Привіт,</p>
        <h1 className="text-2xl font-black text-ink mt-0.5">{name} 👋</h1>
        <div className="relative mt-3 inline-block max-w-full">
          <div className="bg-surface rounded-2xl px-4 py-2.5 shadow-card-md">
            <p className="text-sm font-bold text-ink leading-snug">{bubble}</p>
          </div>
          <div
            className="absolute -bottom-3 left-6 w-0 h-0"
            style={{
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "10px solid var(--color-surface)",
            }}
            aria-hidden
          />
        </div>
        <div className="flex items-center gap-1.5 mt-5">
          <span className="text-base">{MOOD_EMOJI[mood]}</span>
          <span className="text-xs font-black text-ink-muted">{MOOD_LABEL[mood]}</span>
        </div>
      </div>
      <button
        onClick={onTap}
        className="focus:outline-none active:scale-90 transition-transform shrink-0 flex items-end justify-center"
        style={{ width: 110, height: 130 }}
        aria-label="Змінити настрій"
      >
        <div
          key={bounceKey}
          className="animate-bounce-in"
          style={{ transform: "scale(1.65)", transformOrigin: "bottom center" }}
        >
          <CompanionSVG
            animal={animal as Parameters<typeof CompanionSVG>[0]["animal"]}
            mood={mood}
          />
        </div>
      </button>
    </div>
  );
}

/* ── Main scrollable content ──────────────────────────────────── */
function MainContent({ user, doneCount }: { user: typeof mockKidsUser; doneCount: number }) {
  return (
    <div className="px-6 py-8 flex flex-col gap-8">

      {/* ── Top row: lesson card + daily goals ───── */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-6 items-stretch">

        {/* Lesson card */}
        <div className="bg-surface rounded-3xl p-6 border border-border flex flex-col">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-surface-muted flex items-center justify-center text-4xl shrink-0">
              {LESSON.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="type-label text-ink-muted">
                Юніт {LESSON.unit} · Урок {LESSON.lessonNum}
              </p>
              <h2 className="type-h2 text-ink mt-1">{LESSON.lessonTitle}</h2>
              <p className="text-sm text-ink-muted mt-0.5">{LESSON.unitTitle}</p>
            </div>
            <span className="text-sm font-black text-primary shrink-0">
              +{LESSON.xpReward} XP
            </span>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <span className="type-label text-ink-muted">Прогрес юніту</span>
              <span className="text-xs font-bold text-ink-muted">
                {LESSON.lessonsCompleted}/{LESSON.lessonsTotal}
              </span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: LESSON.lessonsTotal }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full transition-colors ${
                    i < LESSON.lessonsCompleted ? "bg-primary" :
                    i === LESSON.lessonsCompleted ? "bg-primary/25" :
                    "bg-border"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <KidsButton variant="primary" size="lg" fullWidth href="/dashboard/lessons">
              ПРОДОВЖИТИ УРОК 🎯
            </KidsButton>
          </div>
        </div>

        {/* Daily goals */}
        <div className="bg-surface rounded-3xl p-6 border border-border flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="type-h3 text-ink">Щоденні цілі</h2>
            <span className="text-sm font-black text-ink-muted">
              {doneCount}/{CHALLENGES.length}
            </span>
          </div>
          <div className="flex flex-col">
            {CHALLENGES.map((c, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 py-3.5 ${
                  i < CHALLENGES.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${
                  c.done ? "bg-primary" : "bg-surface-muted"
                }`}>
                  {c.done
                    ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : <span>{c.icon}</span>
                  }
                </div>
                <span className={`flex-1 text-sm font-bold ${c.done ? "line-through text-ink-muted" : "text-ink"}`}>
                  {c.label}
                </span>
                <span className={`text-xs font-black ${c.done ? "text-primary" : "text-ink-muted"}`}>
                  +{c.xp}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Navigation grid ───────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-4">
        <KidsNavCard href="/kids/room"         emoji="🏠" label="Кімната"    color="secondary" />
        <KidsNavCard href="/kids/shop"         emoji="🛒" label="Магазин"    color="accent"    />
        <KidsNavCard href="/kids/achievements" emoji="🏆" label="Нагороди"   color="danger"    />
        <KidsNavCard href="/dashboard/lessons" emoji="📚" label="Всі уроки"  color="purple"    />
      </div>

    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */
export default function KidsDashboardPage() {
  const user = mockKidsUser;
  const initMood = user.companion.mood as CompanionMood;
  const [mood, setMood] = useState<CompanionMood>(initMood);
  const [bubble, setBubble] = useState(() => randomBubble(initMood));
  const [bounceKey, setBounceKey] = useState(0);

  const handleTap = useCallback(() => {
    setMood(prev => {
      const next = ALL_MOODS[(ALL_MOODS.indexOf(prev) + 1) % ALL_MOODS.length];
      setBubble(randomBubble(next));
      return next;
    });
    setBounceKey(k => k + 1);
  }, []);

  const doneCount = CHALLENGES.filter(c => c.done).length;

  const companionProps = {
    name: user.companion.name,
    animal: user.companion.animal,
    mood,
    bubble,
    bounceKey,
    onTap: handleTap,
  };

  return (
    <div className="min-h-screen bg-surface-muted">

      {/* ── MOBILE ─────────────────────────────── */}
      <div className="md:hidden flex flex-col">
        <CompanionBanner {...companionProps} />
        <KidsStatBar
          streak={user.streak}
          xp={user.xp}
          level={user.companion.level}
          coins={user.coins}
        />
        <MainContent user={user} doneCount={doneCount} />
      </div>

      {/* ── DESKTOP ────────────────────────────── */}
      <div className="hidden md:flex min-h-screen">

        {/* Left: sticky companion */}
        <div className="w-[360px] lg:w-[420px] shrink-0 sticky top-0 h-screen bg-hero-kids overflow-hidden">
          <CompanionPanel {...companionProps} />
        </div>

        {/* Right: scrollable content */}
        <div className="flex-1 overflow-y-auto flex flex-col min-w-0">
          <KidsStatBar
            streak={user.streak}
            xp={user.xp}
            level={user.companion.level}
            coins={user.coins}
          />
          <MainContent user={user} doneCount={doneCount} />
        </div>

      </div>

    </div>
  );
}
