"use client";

import { useState, useCallback, useRef } from "react";
import { LootBoxModal } from "@/components/kids/LootBox";
import type { BoxRarity } from "@/components/kids/LootBox";
import CharacterAvatar from "@/components/kids/CharacterAvatar";
import type { CharacterEmotion } from "@/lib/characters";
import { useKidsState } from "@/lib/use-kids-store";
import { HudCard, SpeechBubble } from "@/components/kids/ui";
import { SHOP_ITEMS_BY_ID, SLOT_OFFSET } from "@/lib/shop-catalog";
import type { PlacedItem } from "@/lib/kids-store";
import { ContinueLessonWidget } from "@/components/kids/ContinueLessonWidget";
import { CalendarWidget, CalendarDialog } from "@/components/kids/CalendarWidget";

const EMOTION_CYCLE: CharacterEmotion[] = [
  'idle', 'happy', 'celebrate', 'thinking', 'sleepy', 'surprised', 'sad', 'angry',
];

type Bubble = { en: string; ua: string };

const EMOTION_BUBBLES: Record<CharacterEmotion, Bubble> = {
  idle:      { en: "Ready to learn?",           ua: "Готовий вчитись?" },
  happy:     { en: "You're doing great!",        ua: "Так тримати!" },
  celebrate: { en: "New record! 🎉",             ua: "Новий рекорд!" },
  thinking:  { en: "Hmm… tricky one…",           ua: "Хм… непросто…" },
  sleepy:    { en: "Zzz… Oh! A lesson?",         ua: "Zzz… А? Урок?" },
  surprised: { en: "Wow, you're already here!",  ua: "Ти вже тут?!" },
  sad:       { en: "Come on, let's learn!",      ua: "Давай, ходімо!" },
  angry:     { en: "Lesson won't do itself!",    ua: "Урок сам не пройде!" },
};

function StreakWidget({ streak }: { streak: number }) {
  return (
    <HudCard className="px-2.5 pt-2.5 pb-2 sm:px-3.5 sm:pt-3 sm:pb-2.5">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="text-[16px] sm:text-[22px] leading-none">🔥</span>
        <span className="font-black text-[16px] sm:text-[22px] text-accent-dark leading-none tabular-nums">{streak}</span>
        <span className="font-bold text-[9.5px] sm:text-[11px] text-ink-muted">днів</span>
      </div>
    </HudCard>
  );
}

function LootBoxWidget({ coins, onOpen }: { coins: number; onOpen: () => void }) {
  const canAfford = coins >= 50;
  return (
    <button onClick={onOpen} className="w-full text-left">
      <HudCard className="p-2.5 sm:p-3.5 flex flex-col gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mystery-box.png" alt="" aria-hidden
            width={44} height={44}
            className={`w-8 h-8 sm:w-11 sm:h-11 object-contain flex-shrink-0 ${canAfford ? "" : "grayscale opacity-60"}`}
          />
          <div className="flex-1 min-w-0">
            <p className="font-black text-[12px] sm:text-sm text-ink">Mystery Box</p>
            <div className="flex items-center gap-1 mt-0.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/coin.png" alt="" aria-hidden width={12} height={12} className="object-contain" />
              <span className={`font-black text-[11px] sm:text-xs ${canAfford ? "text-accent-dark" : "text-ink-muted"}`}>50</span>
              {!canAfford && <span className="font-medium text-[10px] text-ink-muted">мало</span>}
            </div>
          </div>
        </div>
        <div className={`w-full h-8 sm:h-9 rounded-lg sm:rounded-xl font-black text-white text-[11px] sm:text-xs flex items-center justify-center transition-transform [@media(max-height:500px)]:hidden ${canAfford ? "bg-purple shadow-press-purple active:translate-y-1 active:shadow-none" : "bg-ink-faint/50"}`}>
          {canAfford ? "Відкрити" : "Пізніше"}
        </div>
      </HudCard>
    </button>
  );
}

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
    setDragPos((prev) => {
      const { [d.id]: _discard, ...rest } = prev;
      return rest;
    });
  }

  return (
    <div ref={containerRef} className="absolute inset-0 z-[5] pointer-events-none">
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
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-danger text-white font-black text-[12px] flex items-center justify-center ring-2 ring-white shadow-card-md"
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

export default function KidsDashboardPage() {
  const { state: kidsState, movePlacement, removePlacement, openLootBox } = useKidsState();

  const [emotionIdx, setEmotionIdx] = useState(0);
  const [bubble, setBubble]         = useState<Bubble | null>(null);
  const [bounceKey, setBounceKey]   = useState(0);
  const [openBox, setOpenBox]       = useState<BoxRarity | null>(null);
  const [editMode, setEditMode]     = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const coins   = kidsState.coins ?? 0;
  const streak  = kidsState.streak ?? 0;
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
      <div className={editMode ? "absolute inset-0 z-[15]" : "absolute inset-0 z-[5]"}>
        <PlacedItemsLayer
          items={placedItems}
          editMode={editMode}
          onMove={movePlacement}
          onRemove={removePlacement}
        />
      </div>

      {(placedItems.length > 0 || editMode) && (
        <button
          onClick={() => setEditMode((v) => !v)}
          aria-pressed={editMode}
          aria-label={editMode ? "Готово" : "Пересунути предмети"}
          className={[
            "absolute z-30 rounded-full w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center shadow-card-md transition-colors",
            "bottom-[calc(env(safe-area-inset-bottom,0px)+100px)] right-3 sm:bottom-[calc(env(safe-area-inset-bottom,0px)+78px)] sm:right-[14px]",
            editMode ? "bg-primary text-white" : "bg-surface-raised/95 text-ink border border-border",
          ].join(" ")}
        >
          {editMode ? (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12l5 5L20 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l2.5 2.5M16.5 16.5L19 19M5 19l2.5-2.5M16.5 7.5L19 5" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      )}

      {/* Desktop/tablet HUD — left column */}
      <div className="hidden sm:flex absolute z-20 flex-col gap-2 md:gap-2.5 top-[env(safe-area-inset-top,10px)] md:top-[env(safe-area-inset-top,14px)] left-2 md:left-3 w-[min(185px,42vw)] md:w-[min(210px,46vw)]">
        <CalendarWidget />
        {streak >= 3 && <StreakWidget streak={streak} />}
        <LootBoxWidget coins={coins} onOpen={() => setOpenBox("common")} />
      </div>

      {/* Desktop/tablet HUD — right column: continue-lesson */}
      <div className="hidden sm:flex absolute z-20 flex-col gap-2 md:gap-2.5 top-[env(safe-area-inset-top,10px)] md:top-[env(safe-area-inset-top,14px)] right-2 md:right-3 w-[min(200px,42vw)] md:w-[min(230px,48vw)]">
        <ContinueLessonWidget compact />
      </div>

      {/* Mobile top pills */}
      <div className="sm:hidden absolute z-20 top-[env(safe-area-inset-top,8px)] left-2 right-2 flex gap-1.5">
        <button
          type="button"
          onClick={() => setCalendarOpen(true)}
          className="h-11 rounded-2xl bg-surface-raised/95 backdrop-blur-sm shadow-card-md flex items-center gap-1.5 px-3 active:scale-95 transition-transform"
          aria-label="Розклад"
        >
          <span className="text-[15px] leading-none">📅</span>
          <span className="font-black text-[13px] text-ink leading-none">Розклад</span>
        </button>
        <div className="flex-1 h-11 rounded-2xl bg-surface-raised/95 backdrop-blur-sm shadow-card-md flex items-center gap-1.5 px-3">
          {streak >= 3 && (
            <>
              <span className="text-[16px] leading-none">🔥</span>
              <span className="font-black text-[14px] text-accent-dark leading-none tabular-nums">{streak}</span>
              <span className="font-bold text-[10px] text-ink-muted">днів</span>
              <span className="text-ink-faint mx-1" aria-hidden>·</span>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/coin.png" alt="" aria-hidden width={13} height={13} className="object-contain" />
          <span className="font-black text-[13px] text-coin leading-none tabular-nums">{coins > 9999 ? "9999+" : coins}</span>
        </div>
        <button
          onClick={() => setOpenBox("common")}
          className="h-11 rounded-2xl bg-surface-raised/95 backdrop-blur-sm shadow-card-md flex items-center gap-1 px-2.5 active:scale-95 transition-transform"
          aria-label="Mystery Box"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mystery-box.png" alt="" aria-hidden width={20} height={20} className={`object-contain ${coins >= 50 ? "" : "grayscale opacity-60"}`} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/coin.png" alt="" aria-hidden width={11} height={11} className="object-contain" />
          <span className="font-black text-[12px] text-accent-dark leading-none">50</span>
        </button>
      </div>

      {/* Mobile continue-lesson ribbon — above bottom nav */}
      <div className="sm:hidden absolute z-20 left-2 right-2 bottom-[calc(env(safe-area-inset-bottom,0px)+72px)]">
        <ContinueLessonWidget compact />
      </div>

      {/* Character — centered */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none pb-[60px]">
        <button onClick={handleTap} className="focus:outline-none flex flex-col items-center pointer-events-auto">
          <div key={bounceKey} className="animate-bounce-in flex flex-col items-center origin-bottom">
            {bubble && (
              <div className="mb-3">
                <SpeechBubble text={bubble.en} subtext={bubble.ua} maxWidth={220} />
              </div>
            )}
            <div className="active:scale-95 transition-transform relative tk-animate-float w-[300px] h-[300px] scale-[0.8] sm:scale-[0.65] md:scale-[0.85] lg:scale-100 origin-center">
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
                    className="absolute pointer-events-none -translate-x-1/2 z-20 text-[54px] sm:text-[84px] drop-shadow-[0_4px_8px_rgba(0,0,0,0.22)]"
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

      {openBox && (
        <LootBoxModal
          boxType={openBox}
          balance={coins}
          onClose={() => setOpenBox(null)}
          onOpen={openLootBox}
        />
      )}

      <CalendarDialog open={calendarOpen} onClose={() => setCalendarOpen(false)} />
    </div>
  );
}
