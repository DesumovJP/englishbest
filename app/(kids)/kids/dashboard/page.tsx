"use client";

import { useState, useCallback } from "react";
import { mockKidsUser } from "@/mocks/user";
import CompanionSVG, { type CompanionMood } from "@/components/kids/CompanionSVG";
import {
  KidsStatBar,
  KidsButton,
  KidsCard,
  KidsChallengeItem,
  KidsNavCard,
  KidsProgressBar,
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
  idle:      ["Привіт! Що сьогодні вивчимо? ✨", "Готовий до уроку? 📚"],
  happy:     ["Ура! Ти справжня зірка! 🌟", "Я так радий тебе бачити! 🔥"],
  sad:       ["Де ти пропав? Я сумував… 🥺", "Один урок — і я щасливий! 💛"],
  celebrate: ["ВІТАЮ! НОВИЙ РЕКОРД! 🏆", "Ти зробив це! Неймовірно! 🎊"],
  excited:   ["ОО! НОВИЙ УРОК! Швидше! ⚡", "Я ГОТОВИЙ! А ТИ?! 🚀"],
  sleepy:    ["Zzz... А? О, урок... 😴", "Може, спочатку кава... ☕"],
  surprised: ["ОМГ! Ти вже тут?! 😲", "Не чекав на тебе так рано! 🎊"],
  love:      ["Ти мій найулюбленіший учень! 💖", "Так приємно вчитись разом! ❤️"],
  angry:     ["ЧОМУ ТАК ДОВГО?! 😤", "Урок сам себе не пройде! 😠"],
  cool:      ["Все під контролем 😎", "Буде легко. Я ж крутий 🕶️"],
};

function randomBubble(mood: CompanionMood) {
  const list = BUBBLES[mood];
  return list[Math.floor(Math.random() * list.length)];
}

/* ── Static page data ─────────────────────────────────────────── */
const CHALLENGES: {
  icon: string; label: string; xp: number; done: boolean;
  token: 'accent' | 'secondary' | 'purple';
}[] = [
  { icon: "🔥", label: "Зроби 1 урок",       xp: 50, done: true,  token: "accent" },
  { icon: "📝", label: "Вивчи 5 нових слів",  xp: 30, done: false, token: "secondary" },
  { icon: "⚡", label: "Пройди міні-тест",     xp: 20, done: false, token: "purple" },
];

/* ── Companion hero panel ─────────────────────────────────────── */
interface CompanionPanelProps {
  name: string;
  animal: string;
  mood: CompanionMood;
  bubble: string;
  bounceKey: number;
  onTap: () => void;
}

function CompanionPanel({ name, animal, mood, bubble, bounceKey, onTap }: CompanionPanelProps) {
  return (
    <KidsCard variant="hero" className="mx-4 mt-4">
      <div className="flex flex-col items-center px-8 py-6 gap-0">
        {/* Greeting */}
        <div className="w-full mb-3">
          <p className="text-sm font-bold text-ink-muted">Привіт,</p>
          <h1 className="text-3xl font-black text-ink">{name} 👋</h1>
        </div>

        {/* Speech bubble */}
        <div className="relative mb-1 max-w-[240px]">
          <div className="bg-surface rounded-2xl px-4 py-3 shadow-card-md">
            <p className="text-sm font-bold text-ink text-center leading-snug">{bubble}</p>
          </div>
          {/* Triangle tail */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-0 h-0"
            style={{
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderTop: "12px solid var(--color-surface)",
            }}
          />
        </div>

        {/* Companion — scaled up, bounces on mood change */}
        <button
          onClick={onTap}
          className="focus:outline-none active:scale-90 transition-transform mt-5"
          aria-label="Змінити настрій"
        >
          <div className="h-60 flex justify-center">
            <div
              key={bounceKey}
              className="animate-bounce-in"
              style={{ transform: "scale(1.85)", transformOrigin: "top center" }}
            >
              <CompanionSVG animal={animal as Parameters<typeof CompanionSVG>[0]["animal"]} mood={mood} />
            </div>
          </div>
        </button>

        {/* Name + mood pill */}
        <p className="font-black text-xl text-ink mt-2">{name}</p>
        <div className="flex items-center gap-1.5 bg-surface/80 rounded-full px-4 py-1.5 mt-2 shadow-card">
          <span className="text-lg">{MOOD_EMOJI[mood]}</span>
          <span className="text-sm font-black text-ink">{MOOD_LABEL[mood]}</span>
        </div>
        <p className="text-[11px] font-semibold text-ink-muted mt-2">
          Натисни щоб змінити настрій
        </p>
      </div>
    </KidsCard>
  );
}

/* ── Right / content panel ────────────────────────────────────── */
interface ContentPanelProps {
  user: typeof mockKidsUser;
  doneCount: number;
}

function ContentPanel({ user, doneCount }: ContentPanelProps) {
  return (
    <div className="flex flex-col flex-1 bg-white">
      {/* Stats bar */}
      <KidsStatBar
        streak={user.streak}
        xp={user.xp}
        level={user.companion.level}
        coins={user.coins}
      />

      {/* XP detail */}
      <div className="px-6 pt-4">
        <KidsProgressBar
          value={user.xp % 1000}
          max={1000}
          height="md"
          labelLeft={`Рівень ${user.companion.level}`}
          labelRight={`${user.xp % 1000} / 1000 XP`}
        />
      </div>

      {/* CTA */}
      <div className="px-6 mt-5">
        <KidsButton variant="primary" size="lg" fullWidth href="/dashboard/lessons">
          ПОЧАТИ УРОК 🎯
        </KidsButton>
      </div>

      {/* Daily challenges */}
      <div className="px-6 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-xl text-ink">Сьогоднішні цілі</h2>
          <div className="rounded-full px-3 py-1 bg-primary/10">
            <span className="text-sm font-black text-primary-dark">
              {doneCount} / {CHALLENGES.length}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          {CHALLENGES.map((c, i) => (
            <KidsChallengeItem key={i} {...c} />
          ))}
        </div>
      </div>

      {/* Nav grid */}
      <div className="px-6 mt-6 pb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <KidsNavCard href="/kids/room"         emoji="🏠" label="Кімната"  color="secondary" />
        <KidsNavCard href="/dashboard/lessons" emoji="📚" label="Уроки"    color="primary"   />
        <KidsNavCard href="/kids/shop"         emoji="🛒" label="Магазин"  color="accent"    />
        <KidsNavCard href="/kids/achievements" emoji="🏆" label="Нагороди" color="danger"    />
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

  const handleCompanionTap = useCallback(() => {
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
    onTap: handleCompanionTap,
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── MOBILE: vertical ── */}
      <div className="flex flex-col md:hidden">
        <CompanionPanel {...companionProps} />
        <ContentPanel user={user} doneCount={doneCount} />
      </div>

      {/* ── DESKTOP: side by side ── */}
      <div className="hidden md:flex min-h-screen">
        {/* Left — sticky companion panel */}
        <div
          className="w-[340px] md:w-[380px] lg:w-[460px] shrink-0 sticky top-0 h-screen overflow-hidden bg-hero-kids"
        >
          <div className="h-full flex flex-col justify-between py-8 px-8">
            <CompanionPanel {...companionProps} />
            <div className="px-0 mt-4">
              <KidsButton variant="primary" size="lg" fullWidth href="/dashboard/lessons">
                ПОЧАТИ УРОК 🎯
              </KidsButton>
            </div>
          </div>
        </div>

        {/* Right — scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <ContentPanel user={user} doneCount={doneCount} />
        </div>
      </div>

    </div>
  );
}
