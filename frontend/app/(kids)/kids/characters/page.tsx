"use client";

import { useState, useEffect } from "react";
import { useKidsIdentity } from "@/lib/use-kids-identity";
import CharacterAvatar from "@/components/kids/CharacterAvatar";
import AddCustomModal from "@/components/kids/AddCustomModal";
import {
  useCustomCharacters,
  useKidsState,
  useCharacterCatalog,
} from "@/lib/use-kids-store";
import { kidsStateStore } from "@/lib/kids-store";
import { getRegisteredCharacter, type CharacterEmotion } from "@/lib/characters";
import { KidsPageShell } from "@/components/ui/shells";
import { KidsPageHeader } from "@/components/kids/ui";
import { LoadingState } from "@/components/ui/LoadingState";

type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

type CharRow = {
  id: string;
  nameEn: string;
  nameUa: string;
  rarity: Rarity;
  priceCoins?: number;
  owned: boolean;
  source: "server" | "custom";
};

const SLOTS = [
  { key: "hat",     label: "Шапка",   emoji: "🎩", options: ["", "🎩", "👑", "🎓", "⛑️", "🪖"] },
  { key: "glasses", label: "Окуляри", emoji: "🕶️", options: ["", "🕶️", "👓"] },
  { key: "scarf",   label: "Шарф",    emoji: "🧣", options: ["", "🧣", "👔"] },
  { key: "bag",     label: "Сумка",   emoji: "🎒", options: ["", "🎒", "👝"] },
] as const;
type SlotKey = typeof SLOTS[number]["key"];

const RARITY: Record<Rarity, { text: string; bg: string; border: string; borderStrong: string; label: string }> = {
  common:    { text: "text-ink-muted",  bg: "bg-surface-muted", border: "border-border",      borderStrong: "border-ink-muted",  label: "Common"    },
  uncommon:  { text: "text-green-600",  bg: "bg-green-50",      border: "border-green-200",   borderStrong: "border-green-500",  label: "Uncommon"  },
  rare:      { text: "text-blue-600",   bg: "bg-blue-50",       border: "border-blue-200",    borderStrong: "border-blue-500",   label: "Rare"      },
  epic:      { text: "text-purple-600", bg: "bg-purple-50",     border: "border-purple-200",  borderStrong: "border-purple-500", label: "Epic"      },
  legendary: { text: "text-coin",       bg: "bg-coin-bg",       border: "border-coin",        borderStrong: "border-coin",       label: "Legendary" },
};

export default function CharactersPage() {
  const { state, patch } = useKidsState();
  const { characters: serverChars, loading: charsLoading } = useCharacterCatalog();
  const { characters: customChars } = useCustomCharacters();
  const { level: kidsLevel } = useKidsIdentity();
  const [showAdd, setShowAdd] = useState(false);
  const [activeSlotKey, setActiveSlotKey] = useState<SlotKey | null>(null);
  const [showCharPicker, setShowCharPicker] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

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

  const ownedIds = state.ownedCharacterIds ?? [];
  const coins    = state.coins ?? 0;

  const serverRows: CharRow[] = serverChars.map(c => ({
    id: c.slug,
    nameEn: c.nameEn,
    nameUa: c.nameUa,
    rarity: c.rarity,
    priceCoins: c.priceCoins,
    owned: ownedIds.includes(c.slug) || c.priceCoins === 0,
    source: "server",
  }));
  const customRows: CharRow[] = customChars.map(c => ({
    id: c.id,
    nameEn: c.nameEn,
    nameUa: c.nameUa,
    rarity: (c.rarity ?? "common") as Rarity,
    owned: true,
    source: "custom",
  }));
  const allChars = [...serverRows, ...customRows];

  const activeId   = state.activeCharacterId ?? "fox";
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewEmotion, setPreviewEmotion] = useState<CharacterEmotion>("idle");
  const viewChar   = allChars.find(c => c.id === (previewId ?? activeId)) ?? allChars[0];

  useEffect(() => { if (viewChar) setPreviewEmotion("idle"); }, [viewChar?.id]);

  async function selectCharacter(row: CharRow): Promise<void> {
    if (row.id === activeId) return;
    if (row.owned) {
      await patch({ activeCharacterId: row.id });
      return;
    }
    if (row.source !== "server" || row.priceCoins == null) return;
    if (coins < row.priceCoins) return;
    if (purchasing) return;

    setPurchasing(row.id);
    setPurchaseError(null);
    try {
      await kidsStateStore.purchaseCharacter(row.id);
      await patch({ activeCharacterId: row.id });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setPurchaseError(msg);
      console.error("[kids/characters] purchase failed", err);
    } finally {
      setPurchasing(null);
    }
  }

  if (charsLoading && allChars.length === 0) {
    return (
      <KidsPageShell header={<KidsPageHeader title="Мій персонаж" backHref="/kids/dashboard" />}>
        <div className="py-10"><LoadingState shape="card" rows={3} /></div>
      </KidsPageShell>
    );
  }
  if (!viewChar) return null;

  const isActive   = viewChar.id === activeId;
  const activeSlot = SLOTS.find(s => s.key === activeSlotKey) ?? null;
  const view       = RARITY[viewChar.rarity];

  const STATS = [
    { label: "Рівень", value: kidsLevel,               icon: "🏅" as const },
    { label: "XP",     value: String(state.xp ?? 0),     useXp:   true },
    { label: "Серія",  value: `${state.streak ?? 0}`,    icon: "🔥" as const },
    { label: "Монети", value: String(state.coins ?? 0),  useCoin: true },
  ];

  const EMOTION_META: { key: CharacterEmotion; label: string }[] = [
    { key: "idle",      label: "Спокій"  },
    { key: "happy",     label: "Радість" },
    { key: "celebrate", label: "Ура!"    },
    { key: "thinking",  label: "Думаю"   },
    { key: "surprised", label: "Вау!"    },
    { key: "sleepy",    label: "Сплю"    },
    { key: "sad",       label: "Сумно"   },
    { key: "angry",     label: "Злюсь"   },
  ];

  const charDef = getRegisteredCharacter(viewChar.id);
  const availableEmotions = charDef
    ? EMOTION_META.filter(e => !!charDef.emotions[e.key])
    : EMOTION_META;

  const canAffordView = viewChar.priceCoins != null && coins >= viewChar.priceCoins;
  const isPurchasingView = purchasing === viewChar.id;
  const ownedCount = allChars.filter(c => c.owned).length;

  return (
    <KidsPageShell
      header={
        <KidsPageHeader
          title="Мій персонаж"
          subtitle={`${ownedCount}/${allChars.length} персонажів зібрано`}
          backHref="/kids/dashboard"
          right={
            <button
              onClick={() => setShowAdd(true)}
              aria-label="Додати власного персонажа"
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg text-white bg-primary shadow-press-primary active:scale-90 transition-transform"
            >
              +
            </button>
          }
        />
      }
    >
      {/* Character picker bottom sheet */}
      {showCharPicker && (
        <div className="fixed inset-0 z-modal flex items-end justify-center bg-black/45" onClick={() => setShowCharPicker(false)}>
          <div
            className="w-full max-w-[480px] rounded-t-3xl bg-surface-raised overflow-hidden pb-[max(20px,env(safe-area-inset-bottom))]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 rounded-full bg-border" /></div>
            <div className="px-5 pb-1 flex items-center justify-between">
              <p className="font-black text-[17px] text-ink">Вибери персонажа</p>
              <button
                onClick={() => setShowCharPicker(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center font-black bg-surface-muted text-ink-muted text-base"
                aria-label="Закрити"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-4 px-5 pt-4 pb-6 overflow-x-auto [scrollbar-width:none]">
              {allChars.filter(c => c.owned).map(char => {
                const isCurrent = (previewId ?? activeId) === char.id;
                const r = RARITY[char.rarity];
                return (
                  <button
                    key={char.id}
                    onClick={() => { setPreviewId(char.id === activeId ? null : char.id); setShowCharPicker(false); }}
                    className="flex-shrink-0 flex flex-col items-center gap-2 active:scale-95 transition-transform"
                  >
                    <div className={[
                      "w-[100px] h-[120px] rounded-[22px] border-[2.5px] flex items-end justify-center overflow-hidden shadow-card",
                      isCurrent ? `${r.bg} ${r.borderStrong}` : "bg-surface-muted border-border",
                    ].join(" ")}>
                      <CharacterAvatar characterId={char.id} emotion="idle" size={96} animate={false} />
                    </div>
                    <div className="text-center">
                      <p className="font-black text-[13px] text-ink">{char.nameEn}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-[0.05em] ${r.text}`}>{r.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="pb-4 max-w-screen-md mx-auto flex flex-col gap-4 pt-4">
        {/* Character card */}
        <div className={`rounded-3xl overflow-hidden bg-surface-raised shadow-card-md border-2 ${view.border}`}>
          <div className={`h-1.5 w-full ${view.borderStrong.replace("border-", "bg-")}`} />

          <div className="flex items-stretch gap-0">
            <div className="flex items-stretch gap-3 px-4 py-4 w-[52%]">
              <div className="flex flex-col justify-center gap-2 flex-shrink-0">
                {SLOTS.map(slot => {
                  const isSelected = activeSlotKey === slot.key;
                  const hasItem = !!outfit[slot.key];
                  return (
                    <button
                      key={slot.key}
                      onClick={() => setActiveSlotKey(isSelected ? null : slot.key)}
                      className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
                    >
                      <div className={[
                        "w-11 h-11 rounded-xl flex items-center justify-center border-2 transition-all duration-100",
                        hasItem ? "text-[22px]" : "text-base",
                        isSelected
                          ? "bg-primary/10 border-primary"
                          : hasItem ? "bg-success/10 border-success/30" : "bg-surface-muted border-border",
                      ].join(" ")}>
                        {outfit[slot.key] || <span className="text-sm text-ink-faint">{slot.emoji}</span>}
                      </div>
                      <span className={`text-[8px] font-extrabold tracking-[0.05em] ${isSelected ? "text-primary" : "text-ink-faint"}`}>
                        {slot.label.slice(0, 3).toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => { setActiveSlotKey(null); setShowCharPicker(true); }}
                className={`relative flex-1 flex items-end justify-center rounded-2xl overflow-hidden min-h-[150px] border-2 active:scale-[0.97] transition-transform ${view.bg} ${view.border}`}
              >
                <CharacterAvatar characterId={viewChar.id} emotion={previewEmotion} size={170} animate />
                <div className="absolute top-2 right-2 rounded-md px-1.5 py-0.5 bg-black/10">
                  <span className="text-[7.5px] text-ink-muted font-extrabold tracking-[0.06em]">TAP</span>
                </div>
              </button>
            </div>

            <div className="flex flex-col gap-3 px-4 py-4 flex-1 border-l-[1.5px] border-border">
              <div>
                <p className="font-black leading-tight text-xl text-ink tracking-tight">{viewChar.nameEn}</p>
                <p className="font-medium text-[11px] text-ink-faint">{viewChar.nameUa}</p>
                <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 mt-1 border-[1.5px] ${view.bg} ${view.border}`}>
                  <span className={`text-[9px] font-extrabold uppercase tracking-[0.07em] ${view.text}`}>{view.label}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 flex-1">
                {STATS.map(s => (
                  <div key={s.label} className="rounded-xl px-2.5 py-2 bg-surface-muted border-[1.5px] border-border">
                    <div className="flex items-center gap-1 mb-0.5">
                      {s.useCoin ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src="/coin.png" alt="" aria-hidden width={12} height={12} className="object-contain" />
                      ) : s.useXp ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src="/xp.png" alt="" aria-hidden width={12} height={12} className="object-contain" />
                      ) : (
                        <span className="text-xs" aria-hidden>{s.icon}</span>
                      )}
                      <span className="text-[8px] text-ink-faint font-bold uppercase tracking-[0.06em]">{s.label}</span>
                    </div>
                    <p className="font-black leading-none text-lg text-ink tabular-nums">{s.value}</p>
                  </div>
                ))}
              </div>

              {!viewChar.owned ? (
                <button
                  onClick={() => selectCharacter(viewChar)}
                  disabled={!canAffordView || isPurchasingView}
                  className={[
                    "w-full rounded-xl font-black text-white py-2.5 text-[13px] transition-transform",
                    canAffordView && !isPurchasingView
                      ? "bg-accent shadow-press-accent active:translate-y-0.5"
                      : "bg-surface-muted text-ink-faint",
                  ].join(" ")}
                >
                  {isPurchasingView
                    ? "Купуємо…"
                    : canAffordView
                    ? `Купити за ${viewChar.priceCoins ?? 0} 🪙`
                    : `Потрібно ${viewChar.priceCoins ?? 0} 🪙`}
                </button>
              ) : isActive ? (
                <div className="rounded-xl py-2.5 text-center bg-success/10 border-[1.5px] border-success/30">
                  <p className="font-black text-xs text-success-dark">✓ Активний</p>
                </div>
              ) : (
                <button
                  onClick={() => selectCharacter(viewChar)}
                  className="w-full rounded-xl font-black text-white py-2.5 text-[13px] bg-primary shadow-press-primary active:translate-y-0.5 transition-transform"
                >
                  Обрати →
                </button>
              )}

              {purchaseError && purchasing === null && (
                <p className="text-[10px] font-bold text-danger-dark text-center">{purchaseError}</p>
              )}
            </div>
          </div>

          {activeSlot && (
            <div className="px-4 py-3 border-t-[1.5px] border-border bg-surface-subtle">
              <p className="font-black mb-2.5 text-[10px] text-ink-faint uppercase tracking-[0.09em]">
                {activeSlot.label}: варіанти
              </p>
              <div className="flex gap-2.5 flex-wrap">
                {(activeSlot.options as readonly string[]).map(opt => {
                  const selected = outfit[activeSlot.key] === opt;
                  return (
                    <button
                      key={opt || "none"}
                      onClick={() => setSlot(activeSlot.key, opt)}
                      className={[
                        "w-[52px] h-[52px] rounded-xl flex items-center justify-center border-2 active:scale-90 transition-transform",
                        opt ? "text-[26px]" : "text-base text-ink-faint",
                        selected ? "bg-primary/10 border-primary" : "bg-surface-muted border-border",
                      ].join(" ")}
                    >
                      {opt || "✕"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Emotion gallery */}
        <div className="rounded-3xl bg-surface-raised overflow-hidden shadow-card border-[1.5px] border-border">
          <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b-[1.5px] border-border">
            <div>
              <p className="font-black text-sm text-ink">Емоції персонажа</p>
              <p className="font-medium text-[11px] text-ink-faint">Тисни — побачиш реакцію</p>
            </div>
            <span className="rounded-full px-2.5 py-1 font-black text-[11px] bg-surface-muted text-ink-muted">
              {availableEmotions.length} шт.
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto px-4 py-4 [scrollbar-width:none]">
            {availableEmotions.map(em => {
              const selected = previewEmotion === em.key;
              return (
                <button
                  key={em.key}
                  onClick={() => setPreviewEmotion(selected ? "idle" : em.key)}
                  className="flex-shrink-0 flex flex-col items-center gap-2 active:scale-90 transition-transform"
                >
                  <div className={[
                    "w-[72px] h-[72px] rounded-[20px] overflow-hidden flex items-center justify-center border-[2.5px] transition-all duration-100",
                    selected ? "bg-primary/10 border-primary" : "bg-surface-muted border-border",
                  ].join(" ")}>
                    <CharacterAvatar characterId={viewChar.id} emotion={em.key} size={66} animate={false} />
                  </div>
                  <span className={["text-[10px] tracking-[0.03em]", selected ? "text-primary font-black" : "text-ink-muted font-bold"].join(" ")}>
                    {em.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Character roster */}
        <div>
          <p className="font-black mb-3 text-[11px] text-ink-faint uppercase tracking-[0.09em]">
            Всі персонажі · {ownedCount}/{allChars.length}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {allChars.map(char => {
              const selected = (previewId ?? activeId) === char.id;
              const r = RARITY[char.rarity];
              return (
                <button
                  key={char.id}
                  onClick={() => setPreviewId(char.id === activeId ? null : char.id)}
                  className={[
                    "flex flex-col items-center gap-2 rounded-2xl py-3 px-2 border-2 active:scale-95 transition-all",
                    char.owned ? "opacity-100" : "opacity-75",
                    selected
                      ? `${r.bg} ${r.borderStrong} shadow-card`
                      : "bg-surface-raised border-border shadow-card",
                  ].join(" ")}
                >
                  <div className={`w-[72px] h-[72px] rounded-[18px] flex items-center justify-center relative ${char.owned ? r.bg : "bg-surface-muted"}`}>
                    <CharacterAvatar characterId={char.id} emotion="idle" size={64} animate={false} />
                    {!char.owned && (
                      <div className="absolute inset-0 rounded-[18px] bg-white/55 flex items-center justify-center">
                        <span className="text-[24px]" aria-hidden>🔒</span>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="font-black leading-tight text-xs text-ink">{char.nameEn}</p>
                    <p className="font-medium text-[10px] text-ink-faint">{char.nameUa}</p>
                    <p className={`font-bold mt-0.5 text-[9px] uppercase tracking-[0.05em] ${r.text}`}>{r.label}</p>
                  </div>
                  {!char.owned && char.priceCoins != null && (
                    <div className="rounded-full px-2 py-0.5 bg-coin-bg border border-coin flex items-center gap-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/coin.png" alt="" aria-hidden width={8} height={8} className="object-contain" />
                      <p className="font-black text-[9px] text-coin tabular-nums">{char.priceCoins}</p>
                    </div>
                  )}
                  {char.id === activeId && (
                    <div className="rounded-full px-2 py-0.5 bg-success/10 border border-success/30">
                      <p className="font-black text-[9px] text-success-dark">✓ Active</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {showAdd && <AddCustomModal onClose={() => setShowAdd(false)} />}
    </KidsPageShell>
  );
}
