"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { mockKidsUser } from "@/mocks/user";
import { LootBoxModal } from "@/components/kids/LootBox";
import type { BoxRarity, LootItem } from "@/components/kids/LootBox";
import CharacterAvatar from "@/components/kids/CharacterAvatar";
import type { CharacterEmotion } from "@/lib/characters";
import { useKidsState } from "@/lib/use-kids-store";
import { HudCard, SpeechBubble, XpBadge, ProgressBar } from "@/components/kids/ui";
import { SHOP_ITEMS_BY_ID, SLOT_OFFSET } from "@/lib/shop-catalog";
import type { PlacedItem } from "@/lib/kids-store";

/* ── Calendar data ───────────────────────────────────────────────── */
type CalEvent = { id: string; date: string; time?: string; emoji: string; title: string; titleUa: string; color: string };
const CAL_EVENTS: CalEvent[] = [
  { id: "c1", date: "2026-04-13", time: "15:00", emoji: "📚", title: "English lesson",    titleUa: "Урок англійської",  color: "#58CC02" },
  { id: "c2", date: "2026-04-15", time: "16:00", emoji: "🎮", title: "Game challenge",    titleUa: "Ігровий челендж",   color: "#4F9CF9" },
  { id: "c3", date: "2026-04-18", time: "15:00", emoji: "🎓", title: "Webinar: Animals",  titleUa: "Вебінар: Тварини",  color: "#F59E0B" },
  { id: "c4", date: "2026-04-20", emoji: "🔥",   title: "Streak milestone",               titleUa: "30 днів поспіль!",  color: "#FF6B35" },
  { id: "c5", date: "2026-04-25", time: "15:00", emoji: "📚", title: "English lesson",    titleUa: "Урок англійської",  color: "#58CC02" },
  { id: "c6", date: "2026-05-01", emoji: "🎁",   title: "Mystery box day",                titleUa: "День сюрпризів",    color: "#A855F7" },
];

const MONTHS_UA = ["Січень","Лютий","Березень","Квітень","Травень","Червень","Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"];
const WEEKDAYS_SHORT_UA = ["Нд","Пн","Вт","Ср","Чт","Пт","Сб"];

function CalendarModal({ onClose }: { onClose: () => void }) {
  const today = new Date();
  const [year, setYear]     = useState(today.getFullYear());
  const [month, setMonth]   = useState(today.getMonth());
  const [selected, setSelected] = useState<string>(today.toISOString().slice(0, 10));

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset      = (firstDay + 6) % 7;
  const todayStr    = today.toISOString().slice(0, 10);

  function dateStr(d: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  function eventsOn(d: number) {
    return CAL_EVENTS.filter(e => e.date === dateStr(d));
  }

  const selectedEvents = CAL_EVENTS.filter(e => e.date === selected);
  const upcoming = CAL_EVENTS
    .filter(e => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  const eventsToShow = selectedEvents.length > 0 ? selectedEvents : upcoming;
  const eventsLabel  = selectedEvents.length > 0
    ? `Події · ${Number(selected.slice(8))} ${MONTHS_UA[Number(selected.slice(5, 7)) - 1].toLowerCase()}`
    : "Найближчі події";

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/55 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Розклад"
    >
      <div
        className="w-full max-w-5xl max-h-[92dvh] bg-white rounded-[28px] shadow-2xl shadow-black/30 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ───────────────────────────────────────────── */}
        <header className="flex items-center justify-between px-7 py-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-xl" aria-hidden>📅</div>
            <div>
              <h2 className="font-black text-ink text-xl tracking-tight leading-none">Розклад</h2>
              <p className="text-xs text-ink-muted font-semibold mt-1">Заняття та події</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрити"
            className="w-10 h-10 rounded-xl bg-surface-muted hover:bg-border flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* ── Body ─────────────────────────────────────────────── */}
        <div className="flex flex-1 min-h-0 flex-col md:flex-row">

          {/* Calendar column */}
          <section className="flex flex-col flex-1 min-w-0 p-6 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={prevMonth}
                aria-label="Попередній місяць"
                className="w-10 h-10 rounded-xl bg-surface-muted hover:bg-border text-ink-muted hover:text-ink flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <p className="font-black text-ink text-lg tracking-tight">
                {MONTHS_UA[month]} {year}
              </p>
              <button
                onClick={nextMonth}
                aria-label="Наступний місяць"
                className="w-10 h-10 rounded-xl bg-surface-muted hover:bg-border text-ink-muted hover:text-ink flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {["Пн","Вт","Ср","Чт","Пт","Сб","Нд"].map(d => (
                <p key={d} className="text-center type-label text-ink-faint">{d}</p>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d         = i + 1;
                const ds        = dateStr(d);
                const evs       = eventsOn(d);
                const isToday   = ds === todayStr;
                const isSelected = ds === selected;
                const hasEvent  = evs.length > 0;
                return (
                  <button
                    key={d}
                    onClick={() => setSelected(ds)}
                    aria-pressed={isSelected}
                    aria-label={hasEvent ? `${d} — ${evs.length} подій` : String(d)}
                    className={[
                      "relative aspect-square flex items-center justify-center rounded-xl text-base font-bold transition-all",
                      isSelected
                        ? "bg-primary text-white shadow-press-primary"
                        : isToday
                          ? "bg-primary/10 text-primary-dark ring-1 ring-primary/40"
                          : hasEvent
                            ? "bg-surface-muted text-ink hover:bg-border/60"
                            : "text-ink hover:bg-surface-muted",
                    ].join(" ")}
                  >
                    <span className="leading-none">{d}</span>
                    {hasEvent && (
                      <span
                        aria-hidden
                        className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-accent ring-2 ring-white font-black text-white leading-none text-[10px]"
                      >
                        {evs.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Events column */}
          <aside className="flex flex-col flex-shrink-0 md:w-[360px] md:border-l border-t md:border-t-0 border-border bg-surface-muted/40 min-h-0">
            <div className="px-6 py-4 border-b border-border flex-shrink-0">
              <p className="type-label text-ink-muted">{eventsLabel}</p>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2.5">
              {eventsToShow.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                  <span className="text-3xl" aria-hidden>🗓️</span>
                  <p className="text-sm font-bold text-ink-muted">Подій немає</p>
                </div>
              )}
              {eventsToShow.map(ev => (
                <div
                  key={ev.id}
                  className="flex items-center gap-3 rounded-2xl bg-white border border-border px-4 py-3"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                    style={{ background: `${ev.color}18`, color: ev.color }}
                  >
                    {ev.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-ink truncate">{ev.titleUa}</p>
                    <p className="text-xs text-ink-muted truncate">{ev.title}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[11px] font-bold text-ink-muted leading-none">
                      {ev.date.slice(5).replace("-", ".")}
                    </p>
                    {ev.time && (
                      <p className="font-black text-sm mt-1 leading-none" style={{ color: ev.color }}>{ev.time}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ── Data ────────────────────────────────────────────────────────── */
const EMOTION_CYCLE: CharacterEmotion[] = [
  'idle', 'happy', 'celebrate', 'thinking', 'sleepy', 'surprised', 'sad', 'angry',
];

type Bubble = { en: string; ua: string };

const EMOTION_BUBBLES: Record<CharacterEmotion, Bubble> = {
  idle:      { en: "Ready to learn?",          ua: "Готовий вчитись?" },
  happy:     { en: "You're doing great!",       ua: "Так тримати!" },
  celebrate: { en: "New record! 🎉",            ua: "Новий рекорд!" },
  thinking:  { en: "Hmm… tricky one…",          ua: "Хм… непросто…" },
  sleepy:    { en: "Zzz… Oh! A lesson?",        ua: "Zzz… А? Урок?" },
  surprised: { en: "Wow, you're already here!", ua: "Ти вже тут?!" },
  sad:       { en: "Come on, let's learn!",     ua: "Давай, ходімо!" },
  angry:     { en: "Lesson won't do itself!",   ua: "Урок сам не пройде!" },
};

const LESSON = {
  unit: 3, lessonNum: 10, lessonTitle: "Wild Animals",
  titleUa: "Дикі тварини", emoji: "🦁",
  lessonsCompleted: 9, lessonsTotal: 15, xpReward: 15,
  slug: "food-listening",
};

const CHALLENGES = [
  { icon: "🔥", en: "Complete 1 lesson", ua: "Пройди 1 урок",   coins: 10,  done: true  },
  { icon: "📝", en: "Learn 5 new words", ua: "Вивчи 5 слів",    coins: 15,  done: false },
  { icon: "⚡",  en: "Pass a mini-quiz",  ua: "Мінітест",        coins: 20,  done: false },
];

const STREAK_DAYS = 23;

/* ── Calendar widget (mini) ─────────────────────────────────────── */
function CalendarWidget({ onOpen }: { onOpen: () => void }) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const nextEvents = CAL_EVENTS
    .filter(e => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const weekday = WEEKDAYS_SHORT_UA[today.getDay()];
  const dayNum  = today.getDate();
  const monthAbbr = MONTHS_UA[today.getMonth()].slice(0, 3);

  return (
    <button onClick={onOpen} className="w-full text-left active:scale-[0.97] transition-transform">
      <HudCard className="p-3.5 overflow-hidden">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="flex flex-col items-center justify-center rounded-xl flex-shrink-0 w-[46px] h-[46px] bg-danger shadow-press-danger">
            <span className="font-black text-white leading-none text-[20px]">{dayNum}</span>
            <span className="font-bold text-white/85 leading-none text-[8px]">{monthAbbr}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black leading-none text-[15px] text-ink">Розклад</p>
            <p className="font-medium text-[11px] text-ink-muted mt-0.5">{weekday}, сьогодні</p>
          </div>
          <span className="text-ink-muted text-sm">›</span>
        </div>
        {nextEvents.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {nextEvents.map(ev => (
              <div key={ev.id} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ev.color }} />
                <p className="font-bold truncate text-[11.5px] text-ink">{ev.title}</p>
                {ev.time && <p className="font-bold flex-shrink-0 text-[11px]" style={{ color: ev.color }}>{ev.time}</p>}
              </div>
            ))}
          </div>
        )}
      </HudCard>
    </button>
  );
}

/* ── Streak widget ──────────────────────────────────────────────── */
const WEEK_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
function StreakWidget({ onOpenCal }: { onOpenCal: () => void }) {
  const done = [true, true, true, true, true, true, false];
  return (
    <button onClick={onOpenCal} className="w-full active:scale-[0.97] transition-transform">
      <HudCard className="px-3.5 pt-3 pb-2.5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[22px] leading-none">🔥</span>
          <span className="font-black text-[22px] text-accent-dark leading-none">{STREAK_DAYS}</span>
          <span className="font-bold text-[11px] text-ink-muted">днів</span>
        </div>
        <div className="flex gap-1">
          {WEEK_LABELS.map((label, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
              <div className={`w-full rounded-md h-1.5 ${done[i] ? "bg-accent-dark" : "bg-ink-faint/20"}`} />
              <span className={`text-[7.5px] font-bold ${done[i] ? "text-accent-dark" : "text-ink-faint"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </HudCard>
    </button>
  );
}

/* ── Loot box widget ────────────────────────────────────────────── */
function LootBoxWidget({ coins, onOpen }: { coins: number; onOpen: () => void }) {
  const canAfford = coins >= 50;
  return (
    <button onClick={onOpen} className="w-full text-left">
      <HudCard className="p-3.5 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <img
            src="/mystery-box.png" alt="" aria-hidden
            width={44} height={44}
            className={`object-contain flex-shrink-0 ${canAfford ? "" : "grayscale opacity-60"}`}
          />
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm text-ink">Mystery Box</p>
            <div className="flex items-center gap-1 mt-0.5">
              <img src="/coin.png" alt="" aria-hidden width={12} height={12} className="object-contain" />
              <span className={`font-black text-xs ${canAfford ? "text-accent-dark" : "text-ink-muted"}`}>50</span>
              {!canAfford && <span className="font-medium text-[10px] text-ink-muted">мало</span>}
            </div>
          </div>
        </div>
        <div className={`w-full h-9 rounded-xl font-black text-white text-xs flex items-center justify-center transition-transform ${canAfford ? "bg-purple shadow-press-purple active:translate-y-1 active:shadow-none" : "bg-ink-faint/50"}`}>
          {canAfford ? "Відкрити" : "Пізніше"}
        </div>
      </HudCard>
    </button>
  );
}

/* ── Continue lesson card ───────────────────────────────────────── */
function ContinueCard() {
  return (
    <HudCard className="overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-primary">
        <span className="text-[28px]">{LESSON.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-black text-white truncate leading-tight text-[15px]">
            {LESSON.lessonTitle}
          </p>
          <p className="font-bold leading-none text-[11px] text-white/65">
            Unit {LESSON.unit} · Lesson {LESSON.lessonNum}
          </p>
        </div>
        <XpBadge amount={LESSON.xpReward} size="sm" tone="onDark" />
      </div>

      <div className="px-4 py-3">
        <ProgressBar
          current={LESSON.lessonsCompleted}
          total={LESSON.lessonsTotal}
          tone="primary"
          size="md"
          showCount
          className="mb-3"
        />

        <Link
          href={`/courses/english-kids-starter/lessons/${LESSON.slug}`}
          className="flex items-center justify-center w-full rounded-xl font-black text-white text-[15px] py-3 bg-primary shadow-press-primary active:translate-y-1 active:shadow-none transition-transform">
          CONTINUE →
        </Link>
      </div>
    </HudCard>
  );
}

/* ── Daily challenges card ──────────────────────────────────────── */
function DailiesCard({ onOpenBox }: { onOpenBox: () => void }) {
  const [done, setDone] = useState<boolean[]>(CHALLENGES.map(c => c.done));
  const doneCount = done.filter(Boolean).length;
  const allDone = doneCount === CHALLENGES.length;

  return (
    <HudCard className="overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <p className="font-black text-[13px] text-ink">Щоденні завдання</p>
        <div className="flex items-center gap-1.5">
          {CHALLENGES.map((_, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full ${done[i] ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>
      </div>

      <div className="px-4 py-2 flex flex-col gap-1">
        {CHALLENGES.map((c, i) => (
          <button key={i} onClick={() => setDone(prev => { const n = [...prev]; n[i] = !n[i]; return n; })}
            className="flex items-center gap-2.5 py-2 active:scale-[0.98] transition-transform text-left w-full">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${done[i] ? "bg-primary" : "bg-surface-muted border-[1.5px] border-border"}`}>
              {done[i]
                ? <span className="font-black text-white text-xs">✓</span>
                : <span className="text-[13px]">{c.icon}</span>}
            </div>
            <p className={`flex-1 font-bold leading-none text-[13px] ${done[i] ? "text-ink-muted line-through" : "text-ink"}`}>
              {c.ua}
            </p>
            <span className="font-black flex items-center gap-0.5 flex-shrink-0 text-xs text-accent-dark">
              +{c.coins}
              <img src="/coin.png" alt="" aria-hidden width={12} height={12} className="object-contain" />
            </span>
          </button>
        ))}
      </div>

      <div
        className={[
          "mx-4 mb-4 rounded-xl flex flex-col gap-2.5 p-3 transition-all",
          allDone
            ? "bg-gradient-to-br from-purple to-purple-dark"
            : "bg-surface-muted border-[1.5px] border-dashed border-border",
        ].join(" ")}>
        <div className="flex items-center gap-2.5">
          <img
            src="/mystery-box.png" alt="" aria-hidden
            width={32} height={32}
            className={`object-contain flex-shrink-0 ${allDone ? "" : "grayscale opacity-40"}`}
          />
          <div className="flex-1 min-w-0 text-left">
            <p className={`font-black text-xs ${allDone ? "text-white" : "text-ink-muted"}`}>
              {allDone ? "Отримай Mystery Box! 🎉" : `Ще ${CHALLENGES.length - doneCount} завдань`}
            </p>
            <p className={`font-medium text-[10px] ${allDone ? "text-white/70" : "text-ink-faint"}`}>
              {allDone ? "Нагорода твоя" : "Нагорода за всі завдання"}
            </p>
          </div>
        </div>
        {allDone && (
          <button
            onClick={onOpenBox}
            className="w-full h-9 rounded-lg bg-white text-purple-dark font-black text-xs flex items-center justify-center active:translate-y-0.5 transition-transform">
            Відкрити
          </button>
        )}
      </div>
    </HudCard>
  );
}

/* ── Placed-items canvas ────────────────────────────────────────── */
/**
 * Renders items the user has placed on their home. In edit mode each placement
 * is draggable via native pointer events and can be deleted. Position is
 * persisted as 0..1 normalized coords so the layout survives viewport changes.
 */
function PlacedItemsLayer({
  items,
  editMode,
  onMove,
  onRemove,
}: {
  items: PlacedItem[];
  editMode: boolean;
  onMove: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Transient per-drag positions so we don't persist on every pointermove.
  const [dragPos, setDragPos] = useState<Record<string, { x: number; y: number }>>({});
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>, p: PlacedItem) {
    if (!editMode || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = p.x * rect.width;
    const cy = p.y * rect.height;
    dragRef.current = {
      id: p.id,
      offsetX: e.clientX - (rect.left + cx),
      offsetY: e.clientY - (rect.top + cy),
    };
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = dragRef.current;
    if (!d || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left - d.offsetX) / rect.width;
    const ny = (e.clientY - rect.top - d.offsetY) / rect.height;
    setDragPos((prev) => ({
      ...prev,
      [d.id]: {
        x: Math.max(0.02, Math.min(0.98, nx)),
        y: Math.max(0.05, Math.min(0.95, ny)),
      },
    }));
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const d = dragRef.current;
    if (!d) return;
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    const final = dragPos[d.id];
    if (final) {
      onMove(d.id, final.x, final.y);
    }
    dragRef.current = null;
    // Clear transient position after persist so the store becomes source of truth.
    setDragPos((prev) => {
      const { [d.id]: _discard, ...rest } = prev;
      return rest;
    });
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-[5] pointer-events-none"
    >
      {items.map((p) => {
        const catalog = SHOP_ITEMS_BY_ID[p.itemId];
        const pos = dragPos[p.id] ?? { x: p.x, y: p.y };
        const scale = p.scale ?? 1;

        return (
          <div
            key={p.id}
            onPointerDown={(e) => handlePointerDown(e, p)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={[
              "absolute -translate-x-1/2 -translate-y-1/2 select-none leading-none",
              editMode
                ? "cursor-grab active:cursor-grabbing pointer-events-auto touch-none drop-shadow-[0_0_0_2px_rgba(79,156,249,0.6)]"
                : "pointer-events-none touch-auto drop-shadow-[0_6px_10px_rgba(0,0,0,0.25)]",
            ].join(" ")}
            style={{
              left: `${pos.x * 100}%`,
              top: `${pos.y * 100}%`,
              fontSize: `${64 * scale}px`,
            }}
          >
            <span aria-hidden>{catalog?.emoji ?? "❔"}</span>
            {editMode && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(p.id);
                }}
                aria-label="Видалити"
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-danger text-white font-black text-[12px] flex items-center justify-center ring-2 ring-white shadow-md"
              >
                ✕
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */
export default function KidsDashboardPage() {
  const user = mockKidsUser;
  const { state: kidsState, patch: patchState, movePlacement, removePlacement } = useKidsState();

  const [emotionIdx, setEmotionIdx] = useState(0);
  const [bubble, setBubble]         = useState<Bubble | null>(null);
  const [bounceKey, setBounceKey]   = useState(0);
  const [openBox, setOpenBox]       = useState<BoxRarity | null>(null);
  const [showCal, setShowCal]       = useState(false);
  const [editMode, setEditMode]     = useState(false);

  const coins   = kidsState.coins ?? user.coins;
  const emotion = EMOTION_CYCLE[emotionIdx];

  const handleTap = useCallback(() => {
    setEmotionIdx(prev => {
      const next = (prev + 1) % EMOTION_CYCLE.length;
      setBubble(EMOTION_BUBBLES[EMOTION_CYCLE[next]]);
      setTimeout(() => setBubble(null), 2500);
      return next;
    });
    setBounceKey(k => k + 1);
  }, []);

  const handleBoxPurchase = useCallback(async (_cost: number, _item: LootItem) => {
    await patchState({ coins: Math.max(0, coins - _cost) });
  }, [patchState, coins]);

  const placedItems = kidsState.placedItems ?? [];

  const bgStyle = kidsState.roomBackground
    ? { background: kidsState.roomBackground }
    : undefined;

  return (
    <div
      className={[
        "relative w-full h-[100dvh] overflow-hidden select-none",
        !bgStyle && "bg-[url('/kids-dashboard-bg.jpg')] bg-cover bg-[center_bottom]",
      ].filter(Boolean).join(" ")}
      style={bgStyle}
    >
      {/* ── Placed items — raised above character in edit mode so they're draggable ── */}
      <div className={editMode ? "absolute inset-0 z-[15]" : "absolute inset-0 z-[5]"}>
        <PlacedItemsLayer
          items={placedItems}
          editMode={editMode}
          onMove={movePlacement}
          onRemove={removePlacement}
        />
      </div>

      {/* ── Edit toggle ─────────────────────────────────────────── */}
      {(placedItems.length > 0 || editMode) && (
        <button
          onClick={() => setEditMode((v) => !v)}
          aria-pressed={editMode}
          className={[
            "absolute z-30 rounded-full px-3.5 h-9 flex items-center gap-1.5 font-black text-xs shadow-lg transition-colors",
            "bottom-[calc(env(safe-area-inset-bottom,0px)+78px)] right-[14px]",
            editMode ? "bg-primary text-white" : "bg-white/90 text-ink border border-black/5",
          ].join(" ")}
        >
          {editMode ? "Готово ✓" : "Посунути щось ✎"}
        </button>
      )}

      {/* ── LEFT COLUMN HUD ─────────────────────────────────────── */}
      <div className="absolute z-20 flex flex-col gap-2.5 top-[env(safe-area-inset-top,14px)] left-3 w-[min(185px,44vw)]">
        <CalendarWidget onOpen={() => setShowCal(true)} />
        <StreakWidget onOpenCal={() => setShowCal(true)} />
        <LootBoxWidget coins={coins} onOpen={() => setOpenBox("common")} />
      </div>

      {/* ── RIGHT COLUMN HUD ────────────────────────────────────── */}
      <div className="absolute z-20 flex flex-col gap-2.5 top-[env(safe-area-inset-top,14px)] right-3 w-[min(210px,50vw)]">
        <ContinueCard />
        <DailiesCard onOpenBox={() => setOpenBox("common")} />
      </div>

      {/* ── CHARACTER — centered ────────────────────────────────── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none pb-[60px]">

        <button onClick={handleTap} className="focus:outline-none flex flex-col items-center pointer-events-auto">
          {/* Bubble + character bounce together as one unit */}
          <div key={bounceKey} className="animate-bounce-in flex flex-col items-center origin-bottom">
            {bubble && (
              <div className="mb-3">
                <SpeechBubble text={bubble.en} subtext={bubble.ua} maxWidth={220} />
              </div>
            )}
            <div className="active:scale-95 transition-transform relative tk-animate-float w-[300px] h-[300px]">
              <CharacterAvatar
                characterId={kidsState.activeCharacterId || "fox"}
                emotion={emotion}
                size={300}
                animate={false}
              />
              {(kidsState.equippedItemIds ?? []).map((id) => {
                const item = SHOP_ITEMS_BY_ID[id];
                if (!item) return null;
                const pos = SLOT_OFFSET[id] ?? { top: "0%", left: "50%" };
                return (
                  <div
                    key={id}
                    className="absolute pointer-events-none -translate-x-1/2 z-20 text-[84px] drop-shadow-[0_4px_8px_rgba(0,0,0,0.22)]"
                    style={{ top: pos.top, left: pos.left }}
                  >
                    {item.emoji}
                  </div>
                );
              })}
            </div>
          </div>
        </button>
      </div>

      {/* Loot box modal */}
      {openBox && (
        <LootBoxModal
          boxType={openBox}
          balance={coins}
          onClose={() => setOpenBox(null)}
          onPurchase={handleBoxPurchase}
        />
      )}

      {/* Calendar modal */}
      {showCal && <CalendarModal onClose={() => setShowCal(false)} />}
    </div>
  );
}
