"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import CharacterAvatar from "@/components/kids/CharacterAvatar";
import type { CharacterEmotion } from "@/lib/characters";
import { useKidsState, useCustomRooms } from "@/lib/use-kids-store";

/* ── Vocabulary shown on character tap ──────────────────────────── */
const VOCAB: { en: string; ua: string }[] = [
  { en: "Bed",      ua: "Ліжко"    },
  { en: "Chair",    ua: "Стілець"  },
  { en: "Desk",     ua: "Парта"    },
  { en: "Window",   ua: "Вікно"    },
  { en: "Bookshelf",ua: "Полиця"   },
  { en: "Lamp",     ua: "Лампа"    },
  { en: "Carpet",   ua: "Килим"    },
  { en: "Wardrobe", ua: "Шафа"     },
  { en: "Plant",    ua: "Рослина"  },
  { en: "Poster",   ua: "Плакат"   },
  { en: "Table",    ua: "Стіл"     },
  { en: "Pillow",   ua: "Подушка"  },
];

/* ── Built-in rooms ─────────────────────────────────────────────── */
const BUILTIN_ROOMS = [
  { id: "bedroom",    nameEn: "Bedroom",     nameUa: "Спальня",         coins: 0,    bg: "url('/kids-room-bg.webp') center center / cover",    emoji: "🛏️" },
  { id: "garden",     nameEn: "Garden",      nameUa: "Садок",           coins: 300,  bg: "linear-gradient(160deg, #a8e063 0%, #56ab2f 100%)",  emoji: "🌿" },
  { id: "castle",     nameEn: "Castle",      nameUa: "Замок",           coins: 800,  bg: "linear-gradient(160deg, #8e9eab 0%, #536976 100%)",  emoji: "🏰" },
  { id: "space",      nameEn: "Space",       nameUa: "Космос",          coins: 1500, bg: "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", emoji: "🚀" },
  { id: "underwater", nameEn: "Underwater",  nameUa: "Підводний світ",  coins: 3000, bg: "linear-gradient(160deg, #005c97 0%, #363795 100%)",  emoji: "🐠" },
];

const EMOTIONS: CharacterEmotion[] = ["idle", "happy", "celebrate", "thinking", "surprised"];

export default function KidsRoomPage() {
  const { state, patch } = useKidsState();
  const { rooms: customRooms } = useCustomRooms();

  const coins   = state.coins ?? 0;
  const activeRoomId = state.activeRoomId ?? "bedroom";

  /* Merge built-in + custom rooms */
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
  const allRooms = [...BUILTIN_ROOMS, ...customMapped];

  /* Active room background */
  const activeRoom = allRooms.find(r => r.id === activeRoomId) ?? allRooms[0];

  /* Word bubble on character tap */
  const [vocabIdx, setVocabIdx]   = useState(0);
  const [showBubble, setShowBubble] = useState(false);
  const [emotion, setEmotion]     = useState<CharacterEmotion>("idle");
  const [bounceKey, setBounceKey] = useState(0);

  const handleCharTap = useCallback(() => {
    const next = (vocabIdx + 1) % VOCAB.length;
    setVocabIdx(next);
    setShowBubble(true);
    setEmotion(EMOTIONS[next % EMOTIONS.length]);
    setBounceKey(k => k + 1);
    setTimeout(() => setShowBubble(false), 2800);
  }, [vocabIdx]);

  function canUnlock(roomCoins: number) { return coins >= roomCoins; }

  function selectRoom(roomId: string, roomCoins: number) {
    if (!canUnlock(roomCoins)) return;
    patch({ activeRoomId: roomId });
  }

  return (
    <div
      className="relative w-full h-[100dvh] overflow-hidden select-none"
      style={{ background: activeRoom.bg }}
    >
      {/* Dark overlay for non-bedroom rooms (gradient bgs are already dark) */}
      {activeRoom.id !== "bedroom" && (
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.18)" }} />
      )}

      {/* ── TOP BAR ──────────────────────────────────────────────── */}
      <div
        className="absolute z-30 left-0 right-0 flex items-center gap-2 px-4"
        style={{
          top: "env(safe-area-inset-top, 14px)",
          paddingTop: 4,
        }}
      >
        {/* Back button */}
        <Link
          href="/kids/dashboard"
          className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0 active:scale-90 transition-transform"
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            color: "#374151",
          }}
        >
          ←
        </Link>

        {/* Room name pill */}
        <div
          className="flex-1 h-11 rounded-2xl flex items-center px-3 gap-2"
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
          }}
        >
          <span style={{ fontSize: 18 }}>{activeRoom.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-black leading-none truncate" style={{ fontSize: 13, color: "#1A1A2E" }}>
              {activeRoom.nameEn}
            </p>
            <p className="font-medium leading-none" style={{ fontSize: 9.5, color: "#9CA3AF" }}>
              {activeRoom.nameUa}
            </p>
          </div>
          {/* Coin balance */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <img src="/coin.png" alt="coin" style={{ width: 14, height: 14, objectFit: "contain" }} />
            <span className="font-black" style={{ fontSize: 13, color: "#F59E0B" }}>
              {coins > 9999 ? "9999+" : coins}
            </span>
          </div>
        </div>

        {/* Shop button */}
        <Link
          href="/kids/shop"
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 active:scale-90 transition-transform"
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
          }}
        >
          🛍️
        </Link>
      </div>

      {/* ── CHARACTER — centered ─────────────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center z-10" style={{ paddingBottom: 120 }}>
        <button
          onClick={handleCharTap}
          className="focus:outline-none flex flex-col items-center"
        >
          <div
            key={bounceKey}
            className="animate-bounce-in flex flex-col items-center"
            style={{ transformOrigin: "bottom center" }}
          >
            {/* Word bubble */}
            {showBubble && (
              <div
                className="mb-3 px-4 py-2.5 rounded-2xl relative"
                style={{
                  background: "white",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.22)",
                  minWidth: 130,
                  textAlign: "center",
                }}
              >
                <p className="font-black leading-tight" style={{ fontSize: 16, color: "#1A1A2E" }}>
                  {VOCAB[vocabIdx].en}
                </p>
                <p className="font-bold leading-none mt-0.5" style={{ fontSize: 11, color: "#9CA3AF" }}>
                  {VOCAB[vocabIdx].ua}
                </p>
                <p className="font-black mt-1" style={{ fontSize: 10, color: "#58CC02" }}>
                  +1 слово! ✓
                </p>
                {/* Triangle pointer */}
                <div style={{
                  position: "absolute", bottom: -7, left: "50%", marginLeft: -6,
                  width: 0, height: 0,
                  borderLeft: "6px solid transparent",
                  borderRight: "6px solid transparent",
                  borderTop: "7px solid white",
                }} />
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

          {/* Hint label */}
          {!showBubble && (
            <div
              className="mt-2 px-3 py-1 rounded-full"
              style={{
                background: "rgba(255,255,255,0.72)",
                backdropFilter: "blur(8px)",
              }}
            >
              <p className="font-bold" style={{ fontSize: 10, color: "#6B7280" }}>
                Tap to learn a word
              </p>
            </div>
          )}
        </button>
      </div>

      {/* ── BOTTOM ROOM SELECTOR ─────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 72px)",
        }}
      >
        {/* Section label */}
        <p
          className="px-5 mb-2 font-black"
          style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.1em" }}
        >
          Кімнати
        </p>

        {/* Horizontal scroll */}
        <div
          className="flex gap-3 overflow-x-auto"
          style={{
            paddingLeft: 20,
            paddingRight: 20,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {allRooms.map(room => {
            const unlocked = canUnlock(room.coins);
            const isActive = room.id === activeRoomId;

            return (
              <button
                key={room.id}
                onClick={() => selectRoom(room.id, room.coins)}
                className="flex-shrink-0 active:scale-95 transition-transform"
                style={{ opacity: unlocked ? 1 : 0.55 }}
              >
                <div
                  className="flex flex-col items-center gap-1.5 rounded-2xl px-3 py-2.5"
                  style={{
                    background: isActive
                      ? "rgba(255,255,255,0.94)"
                      : "rgba(255,255,255,0.72)",
                    backdropFilter: "blur(16px)",
                    border: isActive ? "2.5px solid #58CC02" : "2px solid rgba(255,255,255,0.3)",
                    boxShadow: isActive
                      ? "0 4px 0 rgba(88,204,2,0.4), 0 6px 20px rgba(0,0,0,0.18)"
                      : "0 2px 12px rgba(0,0,0,0.12)",
                    minWidth: 80,
                  }}
                >
                  {/* Room emoji or lock */}
                  <span style={{ fontSize: 26 }}>
                    {unlocked ? room.emoji : "🔒"}
                  </span>

                  {/* Room name */}
                  <p
                    className="font-black leading-none text-center"
                    style={{
                      fontSize: 10,
                      color: isActive ? "#1A1A2E" : "#374151",
                      maxWidth: 72,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {room.nameEn}
                  </p>

                  {/* Coins required (if locked) */}
                  {!unlocked && (
                    <div className="flex items-center gap-0.5">
                      <img src="/coin.png" alt="coin" style={{ width: 10, height: 10, objectFit: "contain" }} />
                      <span className="font-black" style={{ fontSize: 9, color: "#F59E0B" }}>
                        {room.coins}
                      </span>
                    </div>
                  )}

                  {/* Active indicator */}
                  {isActive && unlocked && (
                    <div
                      className="rounded-full"
                      style={{ width: 6, height: 6, background: "#58CC02" }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
