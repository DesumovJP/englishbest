"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { mockKidsUser } from "@/mocks/user";
import CharacterAvatar from "@/components/kids/CharacterAvatar";
import AddCustomModal from "@/components/kids/AddCustomModal";
import { useCustomCharacters, useKidsState } from "@/lib/use-kids-store";
import { CHARACTERS, type CharacterEmotion } from "@/lib/characters";

/* ── Data ────────────────────────────────────────────────────────── */
const BUILTIN_CHARS = [
  { id: "fox",     nameEn: "Rusty",   nameUa: "Рустік",  rarity: "common"    as const, howToGet: "Starter",       unlocked: true  },
  { id: "raccoon", nameEn: "Rocky",   nameUa: "Роккі",   rarity: "rare"      as const, howToGet: "30-day streak", unlocked: true  },
  { id: "cat",     nameEn: "Luna",    nameUa: "Луна",    rarity: "uncommon"  as const, howToGet: "Silver Box",    unlocked: false },
  { id: "rabbit",  nameEn: "Pearl",   nameUa: "Перлина", rarity: "rare"      as const, howToGet: "Gold Box",      unlocked: false },
  { id: "dragon",  nameEn: "Blaze",   nameUa: "Блейз",   rarity: "legendary" as const, howToGet: "Legendary Box", unlocked: false },
];

const SLOTS = [
  { key: "hat",     label: "Шапка",   emoji: "🎩", options: ["", "🎩", "👑", "🎓", "⛑️", "🪖"] },
  { key: "glasses", label: "Окуляри", emoji: "🕶️", options: ["", "🕶️", "👓"] },
  { key: "scarf",   label: "Шарф",    emoji: "🧣", options: ["", "🧣", "👔"] },
  { key: "bag",     label: "Сумка",   emoji: "🎒", options: ["", "🎒", "👝"] },
] as const;
type SlotKey = typeof SLOTS[number]["key"];

const RARITY_COLOR: Record<string, string> = {
  common: "#9CA3AF", uncommon: "#22C55E", rare: "#4F9CF9", legendary: "#F59E0B",
};
const RARITY_BG: Record<string, string> = {
  common: "#F9FAFB", uncommon: "#F0FDF4", rare: "#EFF6FF", legendary: "#FFFBEB",
};
const RARITY_BORDER: Record<string, string> = {
  common: "#F3F4F6", uncommon: "#BBF7D0", rare: "#BFDBFE", legendary: "#FDE68A",
};
const RARITY_LABEL: Record<string, string> = {
  common: "Common", uncommon: "Uncommon", rare: "Rare", legendary: "Legendary",
};

export default function CharactersPage() {
  const { state, patch } = useKidsState();
  const { characters: customChars } = useCustomCharacters();
  const [showAdd, setShowAdd] = useState(false);
  const [activeSlotKey, setActiveSlotKey] = useState<SlotKey | null>(null);
  const [showCharPicker, setShowCharPicker] = useState(false);

  const [outfit, setOutfit] = useState({
    hat:     state.outfit?.hat     ?? "",
    glasses: state.outfit?.glasses ?? "",
    scarf:   state.outfit?.scarf   ?? "",
    bag:     state.outfit?.bag     ?? "",
  });

  useEffect(() => {
    setOutfit({
      hat:     state.outfit?.hat     ?? "",
      glasses: state.outfit?.glasses ?? "",
      scarf:   state.outfit?.scarf   ?? "",
      bag:     state.outfit?.bag     ?? "",
    });
  }, [state.outfit]);

  function setSlot(key: SlotKey, value: string) {
    const next = { ...outfit, [key]: value };
    setOutfit(next);
    patch({ outfit: { hat: next.hat || undefined, glasses: next.glasses || undefined, scarf: next.scarf || undefined, bag: next.bag || undefined } });
    setActiveSlotKey(null);
  }

  const allChars = [
    ...BUILTIN_CHARS,
    ...customChars.map(c => ({
      id: c.id, nameEn: c.nameEn, nameUa: c.nameUa,
      rarity: (c.rarity ?? "common") as "common" | "uncommon" | "rare" | "legendary",
      howToGet: "Custom", unlocked: true,
    })),
  ];

  const activeId   = state.activeCharacterId ?? "fox";
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewEmotion, setPreviewEmotion] = useState<CharacterEmotion>('idle');
  const viewChar   = allChars.find(c => c.id === (previewId ?? activeId)) ?? allChars[0];

  // Reset emotion preview when character changes
  useEffect(() => { setPreviewEmotion('idle'); }, [viewChar.id]);
  const isActive   = viewChar.id === activeId;

  const activeSlot = SLOTS.find(s => s.key === activeSlotKey) ?? null;

  const STATS = [
    { label: "Рівень",  value: mockKidsUser.level, icon: "🏅" },
    { label: "XP",      value: String(state.xp ?? 0), icon: null, useXp: true },
    { label: "Серія",   value: `${state.streak ?? 0}`, icon: "🔥" },
    { label: "Монети",  value: String(state.coins ?? 0), icon: null, useCoin: true },
  ];

  /* ── Emotion meta ────────────────────────────────────────────────── */
  const EMOTION_META: { key: CharacterEmotion; label: string }[] = [
    { key: 'idle',      label: 'Спокій'  },
    { key: 'happy',     label: 'Радість' },
    { key: 'celebrate', label: 'Ура!'    },
    { key: 'thinking',  label: 'Думаю'   },
    { key: 'surprised', label: 'Вау!'    },
    { key: 'sleepy',    label: 'Сплю'    },
    { key: 'sad',       label: 'Сумно'   },
    { key: 'angry',     label: 'Злюсь'   },
  ];

  const charDef = CHARACTERS[viewChar.id];
  const availableEmotions = charDef
    ? EMOTION_META.filter(e => !!charDef.emotions[e.key])
    : EMOTION_META;

  return (
    <div className="flex flex-col h-[100dvh] bg-[#F9FAFB] select-none">

      {/* ── CHARACTER PICKER MODAL ──────────────────────────────────── */}
      {showCharPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={() => setShowCharPicker(false)}
        >
          <div
            className="w-full rounded-t-3xl bg-white overflow-hidden"
            style={{ maxWidth: 480, paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full" style={{ background: '#E5E7EB' }} />
            </div>

            <div className="px-5 pb-1 flex items-center justify-between">
              <p className="font-black" style={{ fontSize: 17, color: '#1A1A2E' }}>Вибери персонажа</p>
              <button
                onClick={() => setShowCharPicker(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center font-black"
                style={{ background: '#F3F4F6', color: '#6B7280', fontSize: 16 }}>✕</button>
            </div>

            <div className="flex gap-4 px-5 pt-4 pb-6 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {allChars.filter(c => ['fox','raccoon'].includes(c.id) || c.unlocked).map(char => {
                const isCurrent = (previewId ?? activeId) === char.id;
                return (
                  <button
                    key={char.id}
                    onClick={() => {
                      if (!char.unlocked) return;
                      setPreviewId(char.id === activeId ? null : char.id);
                      setShowCharPicker(false);
                    }}
                    disabled={!char.unlocked}
                    className="flex-shrink-0 flex flex-col items-center gap-2 active:scale-95 transition-transform"
                    style={{ opacity: char.unlocked ? 1 : 0.4 }}
                  >
                    <div style={{
                      width: 100, height: 120,
                      borderRadius: 22,
                      background: isCurrent ? RARITY_BG[char.rarity] : '#F9FAFB',
                      border: `2.5px solid ${isCurrent ? RARITY_COLOR[char.rarity] : '#E5E7EB'}`,
                      boxShadow: isCurrent ? `0 4px 0 ${RARITY_BORDER[char.rarity]}` : '0 2px 0 #F3F4F6',
                      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative',
                    }}>
                      {isCurrent && (
                        <div className="absolute top-2 left-2 rounded-full px-1.5 py-0.5"
                          style={{ background: RARITY_COLOR[char.rarity] }}>
                          <span style={{ fontSize: 7, color: 'white', fontWeight: 900, letterSpacing: '0.05em' }}>✓</span>
                        </div>
                      )}
                      {char.unlocked
                        ? <CharacterAvatar characterId={char.id} emotion="idle" size={96} animate={false} />
                        : <span style={{ fontSize: 36 }}>🔒</span>
                      }
                    </div>
                    <div className="text-center">
                      <p className="font-black" style={{ fontSize: 13, color: '#1A1A2E' }}>{char.nameEn}</p>
                      <p style={{ fontSize: 10, color: RARITY_COLOR[char.rarity], fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {RARITY_LABEL[char.rarity]}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 bg-white flex-shrink-0"
        style={{
          paddingTop: "env(safe-area-inset-top, 14px)", paddingBottom: 14,
          borderBottom: "2px solid #F3F4F6",
        }}>
        <Link href="/kids/dashboard"
          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 active:scale-90 transition-transform"
          style={{ background: "#F3F4F6", color: "#374151" }}>←</Link>
        <div className="flex-1">
          <p className="font-black" style={{ fontSize: 17, color: "#1A1A2E" }}>Мій персонаж</p>
          <p className="font-medium" style={{ fontSize: 11, color: "#9CA3AF" }}>
            {allChars.filter(c => c.unlocked).length}/{allChars.length} персонажів зібрано
          </p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 active:scale-90 transition-transform text-white"
          style={{ background: "#4F9CF9", boxShadow: "0 3px 0 #1D4ED8" }}>+</button>
      </div>

      {/* ── SCROLLABLE BODY ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-28">

        {/* ── CHARACTER CARD ──────────────────────────────────────── */}
        <div className="mx-4 mt-4 rounded-3xl overflow-hidden bg-white"
          style={{
            boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 0 rgba(0,0,0,0.04)",
            border: `2px solid ${RARITY_BORDER[viewChar.rarity]}`,
          }}>

          {/* Rarity color accent strip */}
          <div className="h-1.5 w-full" style={{ background: RARITY_COLOR[viewChar.rarity] }} />

          <div className="flex items-stretch gap-0">

            {/* LEFT: outfit slots + character doll */}
            <div className="flex items-stretch gap-3 px-4 py-4" style={{ width: "52%" }}>

              {/* Outfit slots column */}
              <div className="flex flex-col justify-center gap-2 flex-shrink-0">
                {SLOTS.map(slot => {
                  const isSelected = activeSlotKey === slot.key;
                  const hasItem = !!outfit[slot.key];
                  return (
                    <button key={slot.key}
                      onClick={() => { setActiveSlotKey(isSelected ? null : slot.key); }}
                      className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
                    >
                      <div style={{
                        width: 44, height: 44,
                        background: isSelected ? "#EFF6FF" : hasItem ? "#F0FDF4" : "#F9FAFB",
                        border: `2px solid ${isSelected ? "#4F9CF9" : hasItem ? "#BBF7D0" : "#E5E7EB"}`,
                        borderRadius: 12,
                        boxShadow: isSelected ? "0 0 0 3px rgba(79,156,249,0.15)" : "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: outfit[slot.key] ? 22 : 16,
                        transition: "all 0.12s",
                      }}>
                        {outfit[slot.key] || <span style={{ fontSize: 14, color: "#D1D5DB" }}>{slot.emoji}</span>}
                      </div>
                      <span style={{ fontSize: 8, color: isSelected ? "#4F9CF9" : "#9CA3AF", fontWeight: 800, letterSpacing: "0.05em" }}>
                        {slot.label.slice(0, 3).toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Character doll — tap opens character picker modal */}
              <button
                onClick={() => { setActiveSlotKey(null); setShowCharPicker(true); }}
                className="relative flex-1 flex items-end justify-center rounded-2xl overflow-hidden active:scale-[0.97] transition-transform"
                style={{
                  background: RARITY_BG[viewChar.rarity],
                  border: `2px solid ${RARITY_BORDER[viewChar.rarity]}`,
                  minHeight: 150,
                }}
              >
                <CharacterAvatar characterId={viewChar.id} emotion={previewEmotion} size={170} animate />
                <div className="absolute top-2 right-2 rounded-md px-1.5 py-0.5"
                  style={{ background: "rgba(0,0,0,0.08)" }}>
                  <span style={{ fontSize: 7.5, color: "#6B7280", fontWeight: 800, letterSpacing: "0.06em" }}>TAP</span>
                </div>
              </button>
            </div>

            {/* RIGHT: name + stats + action */}
            <div className="flex flex-col gap-3 px-4 py-4 flex-1"
              style={{ borderLeft: "1.5px solid #F3F4F6" }}>

              {/* Name + rarity */}
              <div>
                <p className="font-black leading-tight" style={{ fontSize: 20, color: "#1A1A2E", letterSpacing: "-0.02em" }}>
                  {viewChar.nameEn}
                </p>
                <p className="font-medium" style={{ fontSize: 11, color: "#9CA3AF" }}>{viewChar.nameUa}</p>
                <div className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 mt-1"
                  style={{ background: RARITY_BG[viewChar.rarity], border: `1.5px solid ${RARITY_BORDER[viewChar.rarity]}` }}>
                  <span style={{ fontSize: 9, color: RARITY_COLOR[viewChar.rarity], fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    {RARITY_LABEL[viewChar.rarity]}
                  </span>
                </div>
              </div>

              {/* Stats 2×2 */}
              <div className="grid grid-cols-2 gap-2 flex-1">
                {STATS.map(s => (
                  <div key={s.label} className="rounded-xl px-2.5 py-2"
                    style={{ background: "#F9FAFB", border: "1.5px solid #F3F4F6" }}>
                    <div className="flex items-center gap-1 mb-0.5">
                      {s.useCoin
                        ? <img src="/coin.png" alt="coin" style={{ width: 12, height: 12, objectFit: "contain" }} />
                        : s.useXp
                        ? <img src="/xp.png" alt="XP" style={{ width: 12, height: 12, objectFit: "contain" }} />
                        : <span style={{ fontSize: 12 }}>{s.icon}</span>
                      }
                      <span style={{ fontSize: 8, color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {s.label}
                      </span>
                    </div>
                    <p className="font-black leading-none" style={{ fontSize: 18, color: "#1A1A2E" }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Action button */}
              {!viewChar.unlocked ? (
                <div className="rounded-xl py-2.5 text-center"
                  style={{ background: "#F3F4F6", border: "1.5px solid #E5E7EB" }}>
                  <p className="font-black" style={{ fontSize: 11, color: "#9CA3AF" }}>🔒 {viewChar.howToGet}</p>
                </div>
              ) : isActive ? (
                <div className="rounded-xl py-2.5 text-center"
                  style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0" }}>
                  <p className="font-black" style={{ fontSize: 12, color: "#16A34A" }}>✓ Активний</p>
                </div>
              ) : (
                <button onClick={() => patch({ activeCharacterId: viewChar.id })}
                  className="w-full rounded-xl font-black text-white active:translate-y-0.5 transition-transform"
                  style={{ fontSize: 13, padding: "11px 0", background: "#58CC02", boxShadow: "0 3px 0 #389E0D" }}>
                  Обрати →
                </button>
              )}
            </div>
          </div>

          {/* ── Outfit slot picker ── */}
          {activeSlot && (
            <div className="px-4 py-3" style={{ borderTop: "1.5px solid #F3F4F6", background: "#FAFAFA" }}>
              <p className="font-black mb-2.5" style={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.09em" }}>
                {activeSlot.label}: варіанти
              </p>
              <div className="flex gap-2.5 flex-wrap">
                {(activeSlot.options as readonly string[]).map(opt => (
                  <button key={opt || "none"}
                    onClick={() => setSlot(activeSlot.key, opt)}
                    className="active:scale-90 transition-transform"
                    style={{
                      width: 52, height: 52,
                      background: outfit[activeSlot.key] === opt ? "#EFF6FF" : "#F9FAFB",
                      border: `2px solid ${outfit[activeSlot.key] === opt ? "#4F9CF9" : "#E5E7EB"}`,
                      borderRadius: 12,
                      fontSize: opt ? 26 : 16,
                      color: opt ? "inherit" : "#D1D5DB",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                    {opt || "✕"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── EMOTION GALLERY ─────────────────────────────────────── */}
        <div className="mx-4 mt-4 rounded-3xl bg-white overflow-hidden"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1.5px solid #F3F4F6' }}>

          <div className="px-4 pt-4 pb-3 flex items-center justify-between"
            style={{ borderBottom: '1.5px solid #F3F4F6' }}>
            <div>
              <p className="font-black" style={{ fontSize: 14, color: '#1A1A2E' }}>Емоції персонажа</p>
              <p className="font-medium" style={{ fontSize: 11, color: '#9CA3AF' }}>
                Тисни — побачиш реакцію
              </p>
            </div>
            <span className="rounded-full px-2.5 py-1 font-black"
              style={{ fontSize: 11, background: '#F3F4F6', color: '#6B7280' }}>
              {availableEmotions.length} шт.
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto px-4 py-4" style={{ scrollbarWidth: 'none' }}>
            {availableEmotions.map(em => {
              const isActive = previewEmotion === em.key;
              return (
                <button
                  key={em.key}
                  onClick={() => setPreviewEmotion(isActive ? 'idle' : em.key)}
                  className="flex-shrink-0 flex flex-col items-center gap-2 active:scale-90 transition-transform"
                >
                  <div style={{
                    width: 72, height: 72,
                    borderRadius: 20,
                    background: isActive ? '#EFF6FF' : '#F9FAFB',
                    border: `2.5px solid ${isActive ? '#4F9CF9' : '#E5E7EB'}`,
                    boxShadow: isActive ? '0 0 0 3px rgba(79,156,249,0.18)' : '0 2px 0 #F3F4F6',
                    overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.12s',
                  }}>
                    <CharacterAvatar
                      characterId={viewChar.id}
                      emotion={em.key}
                      size={66}
                      animate={false}
                    />
                  </div>
                  <span style={{
                    fontSize: 10,
                    color: isActive ? '#4F9CF9' : '#6B7280',
                    fontWeight: isActive ? 900 : 700,
                    letterSpacing: '0.03em',
                  }}>
                    {em.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── CHARACTER ROSTER ────────────────────────────────────── */}
        <div className="mx-4 mt-4">
          <p className="font-black mb-3" style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.09em" }}>
            Всі персонажі · {allChars.filter(c => c.unlocked).length}/{allChars.length}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {allChars.map(char => {
              const isSelected = (previewId ?? activeId) === char.id;
              return (
                <button key={char.id}
                  onClick={() => char.unlocked && setPreviewId(char.id === activeId ? null : char.id)}
                  disabled={!char.unlocked}
                  className="flex flex-col items-center gap-2 rounded-2xl py-3 px-2 active:scale-95 transition-all"
                  style={{
                    background: isSelected ? RARITY_BG[char.rarity] : "#FFFFFF",
                    border: `2px solid ${isSelected ? RARITY_COLOR[char.rarity] : "#F3F4F6"}`,
                    boxShadow: isSelected ? `0 3px 0 ${RARITY_BORDER[char.rarity]}` : "0 2px 0 #F3F4F6",
                    opacity: char.unlocked ? 1 : 0.45,
                  }}>
                  <div style={{
                    width: 72, height: 72,
                    background: char.unlocked ? RARITY_BG[char.rarity] : "#F9FAFB",
                    borderRadius: 18,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    filter: char.unlocked ? "none" : "grayscale(1)",
                  }}>
                    {char.unlocked
                      ? <CharacterAvatar characterId={char.id} emotion="idle" size={64} animate={false} />
                      : <span style={{ fontSize: 28 }}>🔒</span>
                    }
                  </div>
                  <div className="text-center">
                    <p className="font-black leading-tight" style={{ fontSize: 12, color: "#1A1A2E" }}>{char.nameEn}</p>
                    <p className="font-medium" style={{ fontSize: 10, color: "#9CA3AF" }}>{char.nameUa}</p>
                    <p className="font-bold mt-0.5" style={{ fontSize: 9, color: RARITY_COLOR[char.rarity], textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {RARITY_LABEL[char.rarity]}
                    </p>
                  </div>
                  {!char.unlocked && (
                    <div className="rounded-full px-2 py-0.5" style={{ background: "#F3F4F6" }}>
                      <p className="font-bold" style={{ fontSize: 9, color: "#9CA3AF" }}>{char.howToGet}</p>
                    </div>
                  )}
                  {char.id === activeId && (
                    <div className="rounded-full px-2 py-0.5" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                      <p className="font-black" style={{ fontSize: 9, color: "#16A34A" }}>✓ Active</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {showAdd && <AddCustomModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
