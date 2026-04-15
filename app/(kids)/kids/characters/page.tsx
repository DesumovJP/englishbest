"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { mockKidsUser } from "@/mocks/user";
import CharacterAvatar from "@/components/kids/CharacterAvatar";
import AddCustomModal from "@/components/kids/AddCustomModal";
import { useCustomCharacters, useKidsState } from "@/lib/use-kids-store";
import { CHARACTERS, type CharacterEmotion } from "@/lib/characters";

type Rarity = "common" | "uncommon" | "rare" | "legendary";

const BUILTIN_CHARS: { id: string; nameEn: string; nameUa: string; rarity: Rarity; howToGet: string; unlocked: boolean }[] = [
  { id: "fox",     nameEn: "Rusty",   nameUa: "Рустік",  rarity: "common",    howToGet: "Starter",       unlocked: true  },
  { id: "raccoon", nameEn: "Rocky",   nameUa: "Роккі",   rarity: "rare",      howToGet: "30-day streak", unlocked: true  },
  { id: "cat",     nameEn: "Luna",    nameUa: "Луна",    rarity: "uncommon",  howToGet: "Silver Box",    unlocked: false },
  { id: "rabbit",  nameEn: "Pearl",   nameUa: "Перлина", rarity: "rare",      howToGet: "Gold Box",      unlocked: false },
  { id: "dragon",  nameEn: "Blaze",   nameUa: "Блейз",   rarity: "legendary", howToGet: "Legendary Box", unlocked: false },
];

const SLOTS = [
  { key: "hat",     label: "Шапка",   emoji: "🎩", options: ["", "🎩", "👑", "🎓", "⛑️", "🪖"] },
  { key: "glasses", label: "Окуляри", emoji: "🕶️", options: ["", "🕶️", "👓"] },
  { key: "scarf",   label: "Шарф",    emoji: "🧣", options: ["", "🧣", "👔"] },
  { key: "bag",     label: "Сумка",   emoji: "🎒", options: ["", "🎒", "👝"] },
] as const;
type SlotKey = typeof SLOTS[number]["key"];

// Rarity → Tailwind classes. Single source of truth for all rarity styling.
const RARITY: Record<Rarity, { text: string; bg: string; border: string; borderStrong: string; shadow: string; label: string }> = {
  common:    { text: "text-gray-400",  bg: "bg-gray-50",   border: "border-gray-100",  borderStrong: "border-gray-400",  shadow: "shadow-[0_4px_0_#F3F4F6]", label: "Common"    },
  uncommon:  { text: "text-green-500", bg: "bg-green-50",  border: "border-green-200", borderStrong: "border-green-500", shadow: "shadow-[0_4px_0_#BBF7D0]", label: "Uncommon"  },
  rare:      { text: "text-blue-500",  bg: "bg-blue-50",   border: "border-blue-200",  borderStrong: "border-blue-500",  shadow: "shadow-[0_4px_0_#BFDBFE]", label: "Rare"      },
  legendary: { text: "text-amber-500", bg: "bg-amber-50",  border: "border-amber-200", borderStrong: "border-amber-500", shadow: "shadow-[0_4px_0_#FDE68A]", label: "Legendary" },
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
      rarity: (c.rarity ?? "common") as Rarity,
      howToGet: "Custom", unlocked: true,
    })),
  ];

  const activeId   = state.activeCharacterId ?? "fox";
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewEmotion, setPreviewEmotion] = useState<CharacterEmotion>('idle');
  const viewChar   = allChars.find(c => c.id === (previewId ?? activeId)) ?? allChars[0];

  useEffect(() => { setPreviewEmotion('idle'); }, [viewChar.id]);
  const isActive   = viewChar.id === activeId;

  const activeSlot = SLOTS.find(s => s.key === activeSlotKey) ?? null;

  const STATS = [
    { label: "Рівень",  value: mockKidsUser.level, icon: "🏅" as const },
    { label: "XP",      value: String(state.xp ?? 0), icon: null,   useXp:   true },
    { label: "Серія",   value: `${state.streak ?? 0}`, icon: "🔥" as const },
    { label: "Монети",  value: String(state.coins ?? 0), icon: null, useCoin: true },
  ];

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

  const view = RARITY[viewChar.rarity];

  return (
    <div className="flex flex-col h-dvh bg-gray-50 select-none">
      {/* Character picker modal */}
      {showCharPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45"
          onClick={() => setShowCharPicker(false)}
        >
          <div
            className="w-full max-w-[480px] rounded-t-3xl bg-white overflow-hidden pb-[max(20px,env(safe-area-inset-bottom))]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            <div className="px-5 pb-1 flex items-center justify-between">
              <p className="font-black text-[17px] text-gray-900">Вибери персонажа</p>
              <button
                onClick={() => setShowCharPicker(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center font-black bg-gray-100 text-gray-500 text-base">
                ✕
              </button>
            </div>

            <div className="flex gap-4 px-5 pt-4 pb-6 overflow-x-auto [scrollbar-width:none]">
              {allChars.filter(c => ['fox','raccoon'].includes(c.id) || c.unlocked).map(char => {
                const isCurrent = (previewId ?? activeId) === char.id;
                const r = RARITY[char.rarity];
                return (
                  <button
                    key={char.id}
                    onClick={() => {
                      if (!char.unlocked) return;
                      setPreviewId(char.id === activeId ? null : char.id);
                      setShowCharPicker(false);
                    }}
                    disabled={!char.unlocked}
                    className={[
                      "flex-shrink-0 flex flex-col items-center gap-2 active:scale-95 transition-transform",
                      char.unlocked ? "opacity-100" : "opacity-40",
                    ].join(" ")}
                  >
                    <div className={[
                      "w-[100px] h-[120px] rounded-[22px] border-[2.5px] flex items-end justify-center overflow-hidden relative",
                      isCurrent ? [r.bg, r.borderStrong, r.shadow].join(" ") : "bg-gray-50 border-gray-200 shadow-[0_2px_0_#F3F4F6]",
                    ].join(" ")}>
                      {isCurrent && (
                        <div className={["absolute top-2 left-2 rounded-full px-1.5 py-0.5", r.borderStrong.replace("border-", "bg-")].join(" ")}>
                          <span className="text-[7px] text-white font-black tracking-[0.05em]">✓</span>
                        </div>
                      )}
                      {char.unlocked
                        ? <CharacterAvatar characterId={char.id} emotion="idle" size={96} animate={false} />
                        : <span className="text-4xl">🔒</span>
                      }
                    </div>
                    <div className="text-center">
                      <p className="font-black text-[13px] text-gray-900">{char.nameEn}</p>
                      <p className={["text-[10px] font-bold uppercase tracking-[0.05em]", r.text].join(" ")}>{r.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 bg-white flex-shrink-0 pb-3.5 border-b-2 border-gray-100 pt-[max(14px,env(safe-area-inset-top))]">
        <Link href="/kids/dashboard"
          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 bg-gray-100 text-gray-700 active:scale-90 transition-transform">
          ←
        </Link>
        <div className="flex-1">
          <p className="font-black text-[17px] text-gray-900">Мій персонаж</p>
          <p className="font-medium text-[11px] text-gray-400">
            {allChars.filter(c => c.unlocked).length}/{allChars.length} персонажів зібрано
          </p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 text-white bg-blue-500 shadow-[0_3px_0_#1D4ED8] active:scale-90 transition-transform">
          +
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto pb-28">
        {/* Character card */}
        <div className={[
          "mx-4 mt-4 rounded-3xl overflow-hidden bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)] border-2",
          view.border,
        ].join(" ")}>
          <div className={["h-1.5 w-full", view.borderStrong.replace("border-", "bg-")].join(" ")} />

          <div className="flex items-stretch gap-0">
            {/* LEFT: outfit slots + doll */}
            <div className="flex items-stretch gap-3 px-4 py-4 w-[52%]">
              {/* Slots */}
              <div className="flex flex-col justify-center gap-2 flex-shrink-0">
                {SLOTS.map(slot => {
                  const isSelected = activeSlotKey === slot.key;
                  const hasItem = !!outfit[slot.key];
                  return (
                    <button key={slot.key}
                      onClick={() => setActiveSlotKey(isSelected ? null : slot.key)}
                      className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
                    >
                      <div className={[
                        "w-11 h-11 rounded-xl flex items-center justify-center border-2 transition-all duration-100",
                        hasItem ? "text-[22px]" : "text-base",
                        isSelected
                          ? "bg-blue-50 border-blue-500 shadow-[0_0_0_3px_rgba(79,156,249,0.15)]"
                          : hasItem ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200",
                      ].join(" ")}>
                        {outfit[slot.key] || <span className="text-sm text-gray-300">{slot.emoji}</span>}
                      </div>
                      <span className={[
                        "text-[8px] font-extrabold tracking-[0.05em]",
                        isSelected ? "text-blue-500" : "text-gray-400",
                      ].join(" ")}>
                        {slot.label.slice(0, 3).toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Doll */}
              <button
                onClick={() => { setActiveSlotKey(null); setShowCharPicker(true); }}
                className={[
                  "relative flex-1 flex items-end justify-center rounded-2xl overflow-hidden min-h-[150px] border-2 active:scale-[0.97] transition-transform",
                  view.bg, view.border,
                ].join(" ")}
              >
                <CharacterAvatar characterId={viewChar.id} emotion={previewEmotion} size={170} animate />
                <div className="absolute top-2 right-2 rounded-md px-1.5 py-0.5 bg-black/10">
                  <span className="text-[7.5px] text-gray-500 font-extrabold tracking-[0.06em]">TAP</span>
                </div>
              </button>
            </div>

            {/* RIGHT: info */}
            <div className="flex flex-col gap-3 px-4 py-4 flex-1 border-l-[1.5px] border-gray-100">
              <div>
                <p className="font-black leading-tight text-xl text-gray-900 tracking-tight">{viewChar.nameEn}</p>
                <p className="font-medium text-[11px] text-gray-400">{viewChar.nameUa}</p>
                <div className={[
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 mt-1 border-[1.5px]",
                  view.bg, view.border,
                ].join(" ")}>
                  <span className={["text-[9px] font-extrabold uppercase tracking-[0.07em]", view.text].join(" ")}>
                    {view.label}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 flex-1">
                {STATS.map(s => (
                  <div key={s.label} className="rounded-xl px-2.5 py-2 bg-gray-50 border-[1.5px] border-gray-100">
                    <div className="flex items-center gap-1 mb-0.5">
                      {s.useCoin
                        ? <img src="/coin.png" alt="coin" width={12} height={12} className="object-contain" />
                        : s.useXp
                        ? <img src="/xp.png" alt="XP" width={12} height={12} className="object-contain" />
                        : <span className="text-xs">{s.icon}</span>
                      }
                      <span className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.06em]">{s.label}</span>
                    </div>
                    <p className="font-black leading-none text-lg text-gray-900">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Action */}
              {!viewChar.unlocked ? (
                <div className="rounded-xl py-2.5 text-center bg-gray-100 border-[1.5px] border-gray-200">
                  <p className="font-black text-[11px] text-gray-400">🔒 {viewChar.howToGet}</p>
                </div>
              ) : isActive ? (
                <div className="rounded-xl py-2.5 text-center bg-green-50 border-[1.5px] border-green-200">
                  <p className="font-black text-xs text-green-600">✓ Активний</p>
                </div>
              ) : (
                <button onClick={() => patch({ activeCharacterId: viewChar.id })}
                  className="w-full rounded-xl font-black text-white py-2.5 text-[13px] bg-primary shadow-press-primary active:translate-y-0.5 transition-transform">
                  Обрати →
                </button>
              )}
            </div>
          </div>

          {/* Outfit slot picker */}
          {activeSlot && (
            <div className="px-4 py-3 border-t-[1.5px] border-gray-100 bg-[#FAFAFA]">
              <p className="font-black mb-2.5 text-[10px] text-gray-400 uppercase tracking-[0.09em]">
                {activeSlot.label}: варіанти
              </p>
              <div className="flex gap-2.5 flex-wrap">
                {(activeSlot.options as readonly string[]).map(opt => {
                  const selected = outfit[activeSlot.key] === opt;
                  return (
                    <button key={opt || "none"}
                      onClick={() => setSlot(activeSlot.key, opt)}
                      className={[
                        "w-13 h-13 w-[52px] h-[52px] rounded-xl flex items-center justify-center border-2 active:scale-90 transition-transform",
                        opt ? "text-[26px]" : "text-base text-gray-300",
                        selected ? "bg-blue-50 border-blue-500" : "bg-gray-50 border-gray-200",
                      ].join(" ")}>
                      {opt || "✕"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Emotion gallery */}
        <div className="mx-4 mt-4 rounded-3xl bg-white overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.07)] border-[1.5px] border-gray-100">
          <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b-[1.5px] border-gray-100">
            <div>
              <p className="font-black text-sm text-gray-900">Емоції персонажа</p>
              <p className="font-medium text-[11px] text-gray-400">Тисни — побачиш реакцію</p>
            </div>
            <span className="rounded-full px-2.5 py-1 font-black text-[11px] bg-gray-100 text-gray-500">
              {availableEmotions.length} шт.
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto px-4 py-4 [scrollbar-width:none]">
            {availableEmotions.map(em => {
              const selected = previewEmotion === em.key;
              return (
                <button
                  key={em.key}
                  onClick={() => setPreviewEmotion(selected ? 'idle' : em.key)}
                  className="flex-shrink-0 flex flex-col items-center gap-2 active:scale-90 transition-transform"
                >
                  <div className={[
                    "w-[72px] h-[72px] rounded-[20px] overflow-hidden flex items-center justify-center border-[2.5px] transition-all duration-100",
                    selected
                      ? "bg-blue-50 border-blue-500 shadow-[0_0_0_3px_rgba(79,156,249,0.18)]"
                      : "bg-gray-50 border-gray-200 shadow-[0_2px_0_#F3F4F6]",
                  ].join(" ")}>
                    <CharacterAvatar
                      characterId={viewChar.id}
                      emotion={em.key}
                      size={66}
                      animate={false}
                    />
                  </div>
                  <span className={[
                    "text-[10px] tracking-[0.03em]",
                    selected ? "text-blue-500 font-black" : "text-gray-500 font-bold",
                  ].join(" ")}>
                    {em.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Character roster */}
        <div className="mx-4 mt-4">
          <p className="font-black mb-3 text-[11px] text-gray-400 uppercase tracking-[0.09em]">
            Всі персонажі · {allChars.filter(c => c.unlocked).length}/{allChars.length}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {allChars.map(char => {
              const selected = (previewId ?? activeId) === char.id;
              const r = RARITY[char.rarity];
              return (
                <button key={char.id}
                  onClick={() => char.unlocked && setPreviewId(char.id === activeId ? null : char.id)}
                  disabled={!char.unlocked}
                  className={[
                    "flex flex-col items-center gap-2 rounded-2xl py-3 px-2 border-2 active:scale-95 transition-all",
                    char.unlocked ? "opacity-100" : "opacity-45",
                    selected
                      ? [r.bg, r.borderStrong, "shadow-[0_3px_0_#F3F4F6]"].join(" ")
                      : "bg-white border-gray-100 shadow-[0_2px_0_#F3F4F6]",
                  ].join(" ")}>
                  <div className={[
                    "w-[72px] h-[72px] rounded-[18px] flex items-center justify-center",
                    char.unlocked ? r.bg : "bg-gray-50 grayscale",
                  ].join(" ")}>
                    {char.unlocked
                      ? <CharacterAvatar characterId={char.id} emotion="idle" size={64} animate={false} />
                      : <span className="text-[28px]">🔒</span>
                    }
                  </div>
                  <div className="text-center">
                    <p className="font-black leading-tight text-xs text-gray-900">{char.nameEn}</p>
                    <p className="font-medium text-[10px] text-gray-400">{char.nameUa}</p>
                    <p className={["font-bold mt-0.5 text-[9px] uppercase tracking-[0.05em]", r.text].join(" ")}>{r.label}</p>
                  </div>
                  {!char.unlocked && (
                    <div className="rounded-full px-2 py-0.5 bg-gray-100">
                      <p className="font-bold text-[9px] text-gray-400">{char.howToGet}</p>
                    </div>
                  )}
                  {char.id === activeId && (
                    <div className="rounded-full px-2 py-0.5 bg-green-50 border border-green-200">
                      <p className="font-black text-[9px] text-green-600">✓ Active</p>
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
