"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import CharacterAvatar from "@/components/kids/CharacterAvatar";
import type { CharacterEmotion } from "@/lib/characters";
import { useKidsState, useCustomRooms } from "@/lib/use-kids-store";

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

const BUILTIN_ROOMS = [
  { id: "bedroom",    nameEn: "Bedroom",    nameUa: "Спальня",        coins: 0,    bg: "url('/kids-room-bg.webp') center center / cover",                                  emoji: "🛏️" },
  { id: "garden",     nameEn: "Garden",     nameUa: "Садок",          coins: 300,  bg: "linear-gradient(160deg, #a8e063 0%, #56ab2f 100%)",                                emoji: "🌿" },
  { id: "castle",     nameEn: "Castle",     nameUa: "Замок",          coins: 800,  bg: "linear-gradient(160deg, #8e9eab 0%, #536976 100%)",                                emoji: "🏰" },
  { id: "space",      nameEn: "Space",      nameUa: "Космос",         coins: 1500, bg: "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",                   emoji: "🚀" },
  { id: "underwater", nameEn: "Underwater", nameUa: "Підводний світ", coins: 3000, bg: "linear-gradient(160deg, #005c97 0%, #363795 100%)",                                emoji: "🐠" },
];

const EMOTIONS: CharacterEmotion[] = ["idle", "happy", "celebrate", "thinking", "surprised"];

export default function KidsRoomPage() {
  const { state, patch } = useKidsState();
  const { rooms: customRooms } = useCustomRooms();

  const coins        = state.coins ?? 0;
  const activeRoomId = state.activeRoomId ?? "bedroom";

  const customMapped = customRooms.map(r => ({
    id: r.id,
    nameEn: r.nameEn,
    nameUa: r.nameUa,
    coins: r.coinsRequired,
    bg: r.backgroundImage
      ? `url('${r.backgroundImage}') center center / cover`
      : "linear-gradient(160deg, #f7971e 0%, #ffd200 100%)",
    emoji: "🏠",
  }));
  const allRooms   = [...BUILTIN_ROOMS, ...customMapped];
  const activeRoom = allRooms.find(r => r.id === activeRoomId) ?? allRooms[0];

  const [vocabIdx,   setVocabIdx]   = useState(0);
  const [showBubble, setShowBubble] = useState(false);
  const [emotion,    setEmotion]    = useState<CharacterEmotion>("idle");
  const [bounceKey,  setBounceKey]  = useState(0);

  const handleCharTap = useCallback(() => {
    const next = (vocabIdx + 1) % VOCAB.length;
    setVocabIdx(next);
    setShowBubble(true);
    setEmotion(EMOTIONS[next % EMOTIONS.length]);
    setBounceKey(k => k + 1);
    setTimeout(() => setShowBubble(false), 2800);
  }, [vocabIdx]);

  const canUnlock  = (roomCoins: number) => coins >= roomCoins;
  const selectRoom = (roomId: string, roomCoins: number) => {
    if (!canUnlock(roomCoins)) return;
    patch({ activeRoomId: roomId });
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden select-none" style={{ background: activeRoom.bg }}>
      {activeRoom.id !== "bedroom" && <div className="absolute inset-0 bg-black/20" />}

      {/* Top bar */}
      <div className="absolute z-30 left-0 right-0 flex items-center gap-2 px-4 pt-1 top-[env(safe-area-inset-top,14px)]">
        <Link href="/kids/dashboard"
          className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0 text-gray-700 bg-white/90 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.15)] active:scale-90 transition-transform">
          ←
        </Link>

        <div className="flex-1 h-11 rounded-2xl flex items-center px-3 gap-2 bg-white/90 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.12)]">
          <span className="text-lg">{activeRoom.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-black leading-none truncate text-[13px] text-gray-900">{activeRoom.nameEn}</p>
            <p className="font-medium leading-none text-[9.5px] text-gray-400">{activeRoom.nameUa}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <img src="/coin.png" alt="coin" width={14} height={14} className="object-contain" />
            <span className="font-black text-[13px] text-amber-500">
              {coins > 9999 ? "9999+" : coins}
            </span>
          </div>
        </div>

        <Link href="/kids/shop"
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 bg-white/90 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.15)] active:scale-90 transition-transform">
          🛍️
        </Link>
      </div>

      {/* Character */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pb-[120px]">
        <button onClick={handleCharTap} className="focus:outline-none flex flex-col items-center">
          <div key={bounceKey} className="animate-bounce-in flex flex-col items-center origin-bottom">
            {showBubble && (
              <div className="mb-3 px-4 py-2.5 rounded-2xl relative bg-white min-w-[130px] text-center shadow-[0_4px_24px_rgba(0,0,0,0.22)]">
                <p className="font-black leading-tight text-base text-gray-900">{VOCAB[vocabIdx].en}</p>
                <p className="font-bold leading-none mt-0.5 text-[11px] text-gray-400">{VOCAB[vocabIdx].ua}</p>
                <p className="font-black mt-1 text-[10px] text-primary">+1 слово! ✓</p>
                <div className="absolute left-1/2 -bottom-[7px] -ml-[6px] w-0 h-0 border-x-[6px] border-x-transparent border-t-[7px] border-t-white" />
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
            <div className="mt-2 px-3 py-1 rounded-full bg-white/75 backdrop-blur-sm">
              <p className="font-bold text-[10px] text-gray-500">Tap to learn a word</p>
            </div>
          )}
        </button>
      </div>

      {/* Bottom room selector */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-[calc(env(safe-area-inset-bottom,0px)+72px)]">
        <p className="px-5 mb-2 font-black text-[10px] text-white/70 uppercase tracking-[0.1em]">
          Кімнати
        </p>

        <div className="flex gap-3 overflow-x-auto px-5 [scrollbar-width:none] [-ms-overflow-style:none] [&amp;::-webkit-scrollbar]:hidden">
          {allRooms.map(room => {
            const unlocked = canUnlock(room.coins);
            const isActive = room.id === activeRoomId;

            return (
              <button key={room.id} onClick={() => selectRoom(room.id, room.coins)}
                className={[
                  "flex-shrink-0 active:scale-95 transition-transform",
                  unlocked ? "opacity-100" : "opacity-55",
                ].join(" ")}>
                <div className={[
                  "flex flex-col items-center gap-1.5 rounded-2xl px-3 py-2.5 backdrop-blur-lg min-w-[80px]",
                  isActive
                    ? "bg-white/95 border-[2.5px] border-primary shadow-[0_4px_0_rgba(88,204,2,0.4),0_6px_20px_rgba(0,0,0,0.18)]"
                    : "bg-white/75 border-2 border-white/30 shadow-[0_2px_12px_rgba(0,0,0,0.12)]",
                ].join(" ")}>
                  <span className="text-[26px]">{unlocked ? room.emoji : "🔒"}</span>

                  <p className={[
                    "font-black leading-none text-center text-[10px] max-w-[72px] whitespace-nowrap overflow-hidden text-ellipsis",
                    isActive ? "text-gray-900" : "text-gray-700",
                  ].join(" ")}>
                    {room.nameEn}
                  </p>

                  {!unlocked && (
                    <div className="flex items-center gap-0.5">
                      <img src="/coin.png" alt="coin" width={10} height={10} className="object-contain" />
                      <span className="font-black text-[9px] text-amber-500">{room.coins}</span>
                    </div>
                  )}

                  {isActive && unlocked && <div className="rounded-full w-1.5 h-1.5 bg-primary" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
