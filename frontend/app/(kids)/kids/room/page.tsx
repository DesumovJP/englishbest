"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import CharacterAvatar from "@/components/kids/CharacterAvatar";
import type { CharacterEmotion } from "@/lib/characters";
import { kidsStateStore } from "@/lib/kids-store";
import { useKidsState, useCustomRooms, useRoomCatalog } from "@/lib/use-kids-store";
import { LoadingState } from "@/components/ui/LoadingState";

const VOCAB: { en: string; ua: string }[] = [
  { en: "Bed",       ua: "Ліжко"   },
  { en: "Chair",     ua: "Стілець" },
  { en: "Desk",      ua: "Парта"   },
  { en: "Window",    ua: "Вікно"   },
  { en: "Bookshelf", ua: "Полиця"  },
  { en: "Lamp",      ua: "Лампа"   },
  { en: "Carpet",    ua: "Килим"   },
  { en: "Wardrobe",  ua: "Шафа"    },
  { en: "Plant",     ua: "Рослина" },
  { en: "Poster",    ua: "Плакат"  },
  { en: "Table",     ua: "Стіл"    },
  { en: "Pillow",    ua: "Подушка" },
];

const EMOTIONS: CharacterEmotion[] = ["idle", "happy", "celebrate", "thinking", "surprised"];

type RoomRow = {
  id: string;
  nameEn: string;
  nameUa: string;
  coins: number;
  bg: string;
  emoji: string;
  source: "server" | "custom";
};

export default function KidsRoomPage() {
  const { state, patch } = useKidsState();
  const { rooms: serverRooms } = useRoomCatalog();
  const { rooms: customRooms } = useCustomRooms();

  const coins        = state.coins ?? 0;
  const activeRoomId = state.activeRoomId ?? "bedroom";
  const unlockedIds  = state.unlockedRoomIds ?? [];

  const serverMapped: RoomRow[] = serverRooms.map(r => ({
    id: r.slug,
    nameEn: r.nameEn,
    nameUa: r.nameUa,
    coins: r.coinsRequired,
    bg: r.background,
    emoji: r.iconEmoji,
    source: "server",
  }));
  const customMapped: RoomRow[] = customRooms.map(r => ({
    id: r.id,
    nameEn: r.nameEn,
    nameUa: r.nameUa,
    coins: r.coinsRequired,
    bg: r.backgroundImage
      ? `url('${r.backgroundImage}') center center / cover`
      : "linear-gradient(160deg, var(--color-accent) 0%, var(--color-yellow) 100%)",
    emoji: "🏠",
    source: "custom",
  }));
  const allRooms   = [...serverMapped, ...customMapped];
  const activeRoom = allRooms.find(r => r.id === activeRoomId) ?? allRooms[0];

  const [vocabIdx,   setVocabIdx]   = useState(0);
  const [showBubble, setShowBubble] = useState(false);
  const [emotion,    setEmotion]    = useState<CharacterEmotion>("idle");
  const [bounceKey,  setBounceKey]  = useState(0);
  const [unlocking,  setUnlocking]  = useState<string | null>(null);

  const handleCharTap = useCallback(() => {
    const next = (vocabIdx + 1) % VOCAB.length;
    setVocabIdx(next);
    setShowBubble(true);
    setEmotion(EMOTIONS[next % EMOTIONS.length]);
    setBounceKey(k => k + 1);
    setTimeout(() => setShowBubble(false), 2800);
  }, [vocabIdx]);

  const selectRoom = useCallback(
    async (room: RoomRow) => {
      if (room.id === activeRoomId) return;

      if (room.source === "custom") {
        if (coins < room.coins) return;
        await patch({ activeRoomId: room.id });
        return;
      }

      if (unlockedIds.includes(room.id)) {
        await patch({ activeRoomId: room.id });
        return;
      }
      if (coins < room.coins) return;
      if (unlocking) return;

      setUnlocking(room.id);
      try {
        await kidsStateStore.unlockRoom(room.id);
        await patch({ activeRoomId: room.id });
      } catch (err) {
        console.error("[kids/room] unlock failed", err);
      } finally {
        setUnlocking(null);
      }
    },
    [activeRoomId, coins, patch, unlockedIds, unlocking],
  );

  if (!activeRoom) {
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center bg-surface-muted">
        <LoadingState shape="kids" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden select-none" style={{ background: activeRoom.bg }}>
      {activeRoom.id !== "bedroom" && <div className="absolute inset-0 bg-black/20" aria-hidden />}

      {/* Top bar */}
      <div className="absolute z-sticky left-0 right-0 flex items-center gap-2 px-4 pt-1 top-[env(safe-area-inset-top,14px)]">
        <Link
          href="/kids/dashboard"
          aria-label="Назад"
          className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0 text-ink bg-surface-raised/90 backdrop-blur-md shadow-card active:scale-90 transition-transform"
        >
          ←
        </Link>

        <div className="flex-1 h-11 rounded-2xl flex items-center px-3 gap-2 bg-surface-raised/90 backdrop-blur-md shadow-card">
          <span className="text-lg" aria-hidden>{activeRoom.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-black leading-none truncate text-[13px] text-ink">{activeRoom.nameEn}</p>
            <p className="font-medium leading-none text-[9.5px] text-ink-faint">{activeRoom.nameUa}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/coin.png" alt="" aria-hidden width={14} height={14} className="object-contain" />
            <span className="font-black text-[13px] text-coin tabular-nums">
              {coins > 9999 ? "9999+" : coins}
            </span>
          </div>
        </div>

        <Link
          href="/kids/shop"
          aria-label="Магазин"
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 bg-surface-raised/90 backdrop-blur-md shadow-card active:scale-90 transition-transform"
        >
          🛍️
        </Link>
      </div>

      {/* Character */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pb-[120px]">
        <button onClick={handleCharTap} className="focus:outline-none flex flex-col items-center">
          <div key={bounceKey} className="animate-bounce-in flex flex-col items-center origin-bottom">
            {showBubble && (
              <div className="mb-3 px-4 py-2.5 rounded-2xl relative bg-surface-raised min-w-[130px] text-center shadow-card-md">
                <p className="font-black leading-tight text-base text-ink">{VOCAB[vocabIdx].en}</p>
                <p className="font-bold leading-none mt-0.5 text-[11px] text-ink-faint">{VOCAB[vocabIdx].ua}</p>
                <p className="font-black mt-1 text-[10px] text-primary">+1 слово! ✓</p>
                <div className="absolute left-1/2 -bottom-[7px] -ml-[6px] w-0 h-0 border-x-[6px] border-x-transparent border-t-[7px] border-t-[color:var(--color-surface-raised)]" aria-hidden />
              </div>
            )}

            <div className="active:scale-95 transition-transform">
              <CharacterAvatar
                characterId={state.activeCharacterId ?? "fox"}
                emotion={emotion}
                size={240}
                animate
              />
            </div>
          </div>

          {!showBubble && (
            <div className="mt-2 px-3 py-1 rounded-full bg-surface-raised/75 backdrop-blur-sm">
              <p className="font-bold text-[10px] text-ink-muted">Tap to learn a word</p>
            </div>
          )}
        </button>
      </div>

      {/* Bottom room selector */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-[calc(env(safe-area-inset-bottom,0px)+72px)]">
        <p className="px-5 mb-2 font-black text-[10px] text-white/70 uppercase tracking-[0.1em]">
          Кімнати
        </p>

        <div className="flex gap-3 overflow-x-auto px-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {allRooms.map(room => {
            const isUnlocked = room.source === "custom"
              ? coins >= room.coins
              : unlockedIds.includes(room.id);
            const canAfford   = coins >= room.coins;
            const isActive    = room.id === activeRoomId;
            const isUnlocking = unlocking === room.id;
            const isDisabled  = !isUnlocked && !canAfford;

            return (
              <button
                key={room.id}
                onClick={() => selectRoom(room)}
                disabled={isDisabled || isUnlocking}
                className={[
                  "flex-shrink-0 active:scale-95 transition-transform",
                  isUnlocked || canAfford ? "opacity-100" : "opacity-55",
                ].join(" ")}
              >
                <div className={[
                  "flex flex-col items-center gap-1.5 rounded-2xl px-3 py-2.5 backdrop-blur-lg min-w-[80px] shadow-card",
                  isActive
                    ? "bg-surface-raised/95 border-[2.5px] border-primary"
                    : "bg-surface-raised/75 border-2 border-white/30",
                ].join(" ")}>
                  <span className="text-[26px]" aria-hidden>
                    {isUnlocking ? "⏳" : isUnlocked ? room.emoji : "🔒"}
                  </span>

                  <p className={[
                    "font-black leading-none text-center text-[10px] max-w-[72px] whitespace-nowrap overflow-hidden text-ellipsis",
                    isActive ? "text-ink" : "text-ink-muted",
                  ].join(" ")}>
                    {room.nameEn}
                  </p>

                  {!isUnlocked && (
                    <div className="flex items-center gap-0.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/coin.png" alt="" aria-hidden width={10} height={10} className="object-contain" />
                      <span className="font-black text-[9px] text-coin tabular-nums">{room.coins}</span>
                    </div>
                  )}

                  {isActive && isUnlocked && <div className="rounded-full w-1.5 h-1.5 bg-primary" aria-hidden />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
