"use client";

import { useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { mockKidsUser, type Level } from "@/mocks/user";
import { LootBoxModal, BoxCard } from "@/components/kids/LootBox";
import type { BoxRarity, LootItem } from "@/components/kids/LootBox";
import AddCustomModal from "@/components/kids/AddCustomModal";
import { useCustomItems, useKidsState } from "@/lib/use-kids-store";
import CharacterAvatar from "@/components/kids/CharacterAvatar";
import { CHARACTERS, type CharacterEmotion } from "@/lib/characters";

/* ── Types ─────────────────────────────────────────────────────── */
type TabId = "all" | "furniture" | "decor" | "outfit" | "special" | "boxes" | "backgrounds" | "character";

interface ShopItem {
  id: string;
  emoji: string;
  nameEn: string;
  phonetic: string;
  nameUa: string;
  price: number;
  tab: Exclude<TabId, "all" | "boxes" | "backgrounds" | "character">;
  levelRequired: Level;
  isNew?: boolean;
  isCustom?: boolean;
  customImageIdle?: string;
}

const LEVEL_ORDER: Level[] = ["A1", "A2", "B1", "B2", "C1"];
function canUnlock(userLevel: Level, req: Level) {
  return LEVEL_ORDER.indexOf(userLevel) >= LEVEL_ORDER.indexOf(req);
}

/* ── Catalog data ───────────────────────────────────────────────── */
const ITEMS: ShopItem[] = [
  { id: "sofa",       emoji: "🛋️", nameEn: "Sofa",           phonetic: "/ˈsoʊfə/",            nameUa: "Диван",           price: 80,  tab: "furniture", levelRequired: "A1" },
  { id: "wardrobe",   emoji: "🪞",  nameEn: "Wardrobe",       phonetic: "/ˈwɔːrdrōb/",         nameUa: "Шафа",            price: 120, tab: "furniture", levelRequired: "A2", isNew: true },
  { id: "bookshelf",  emoji: "📚", nameEn: "Bookshelf",       phonetic: "/ˈbʊkʃɛlf/",          nameUa: "Книжкова полиця", price: 60,  tab: "furniture", levelRequired: "A1" },
  { id: "armchair",   emoji: "🪑", nameEn: "Armchair",        phonetic: "/ˈɑːrmtʃɛr/",         nameUa: "Крісло",          price: 90,  tab: "furniture", levelRequired: "A1" },
  { id: "desk",       emoji: "🖥️", nameEn: "Desk",            phonetic: "/dɛsk/",              nameUa: "Письмовий стіл",  price: 110, tab: "furniture", levelRequired: "A1" },
  { id: "lamp",       emoji: "🪔", nameEn: "Floor Lamp",      phonetic: "/flɔːr læmp/",        nameUa: "Торшер",          price: 45,  tab: "furniture", levelRequired: "A1" },
  { id: "globe",      emoji: "🌍", nameEn: "Globe",           phonetic: "/ɡloʊb/",             nameUa: "Глобус",          price: 40,  tab: "decor",     levelRequired: "A1" },
  { id: "aquarium",   emoji: "🐠", nameEn: "Aquarium",        phonetic: "/əˈkwɛriəm/",         nameUa: "Акваріум",        price: 150, tab: "decor",     levelRequired: "A2", isNew: true },
  { id: "rainbow",    emoji: "🌈", nameEn: "Rainbow Poster",  phonetic: "/ˈreɪnboʊ ˈpoʊstər/", nameUa: "Постер-веселка",  price: 30,  tab: "decor",     levelRequired: "A1" },
  { id: "clock",      emoji: "⏰", nameEn: "Clock",           phonetic: "/klɒk/",              nameUa: "Годинник",        price: 50,  tab: "decor",     levelRequired: "A1" },
  { id: "plant",      emoji: "🪴", nameEn: "Plant",           phonetic: "/plænt/",             nameUa: "Рослина",         price: 35,  tab: "decor",     levelRequired: "A1" },
  { id: "hat",        emoji: "🎩", nameEn: "Top Hat",         phonetic: "/tɒp hæt/",           nameUa: "Циліндр",         price: 70,  tab: "outfit",    levelRequired: "A1" },
  { id: "scarf",      emoji: "🧣", nameEn: "Scarf",           phonetic: "/skɑːrf/",            nameUa: "Шарф",            price: 45,  tab: "outfit",    levelRequired: "A1" },
  { id: "glasses",    emoji: "🕶️", nameEn: "Sunglasses",      phonetic: "/ˈsʌnɡlæsɪz/",       nameUa: "Окуляри",         price: 55,  tab: "outfit",    levelRequired: "A2", isNew: true },
  { id: "crown",      emoji: "👑", nameEn: "Crown",           phonetic: "/kraʊn/",             nameUa: "Корона",          price: 200, tab: "outfit",    levelRequired: "B1" },
  { id: "backpack",   emoji: "🎒", nameEn: "Backpack",        phonetic: "/ˈbækpæk/",          nameUa: "Рюкзак",          price: 65,  tab: "outfit",    levelRequired: "A1" },
  { id: "trophy",     emoji: "🏆", nameEn: "Trophy",          phonetic: "/ˈtroʊfi/",           nameUa: "Кубок",           price: 300, tab: "special",   levelRequired: "A2" },
  { id: "rocket",     emoji: "🚀", nameEn: "Rocket",          phonetic: "/ˈrɒkɪt/",            nameUa: "Ракета",          price: 250, tab: "special",   levelRequired: "B1" },
  { id: "unicorn",    emoji: "🦄", nameEn: "Unicorn",         phonetic: "/ˈjuːnɪkɔːrn/",       nameUa: "Єдиноріг",        price: 500, tab: "special",   levelRequired: "B2" },
  { id: "dragon_egg", emoji: "🥚", nameEn: "Dragon Egg",      phonetic: "/ˈdræɡən ɛɡ/",        nameUa: "Яйце дракона",    price: 400, tab: "special",   levelRequired: "B1" },
];

const BOX_TYPES: BoxRarity[] = ["common", "silver", "gold", "legendary"];

/* ── Background items ───────────────────────────────────────────── */
interface BgItem {
  id: string;
  nameEn: string;
  nameUa: string;
  price: number;
  /** CSS background shorthand used as kidsState.roomBackground */
  bgValue: string;
}

const BACKGROUNDS: BgItem[] = [
  {
    id: "bg_default",
    nameEn: "Forest Default",
    nameUa: "Ліс (стандарт)",
    price: 0,
    bgValue: "url('/kids-dashboard-bg.jpg') center bottom / cover",
  },
  {
    id: "bg_sunset",
    nameEn: "Sunset Sky",
    nameUa: "Захід сонця",
    price: 120,
    bgValue: "linear-gradient(160deg, #FF6B35 0%, #F7C59F 35%, #FFBE76 65%, #FF6B6B 100%)",
  },
  {
    id: "bg_ocean",
    nameEn: "Deep Ocean",
    nameUa: "Глибокий океан",
    price: 140,
    bgValue: "linear-gradient(180deg, #0A2342 0%, #126872 40%, #1B998B 75%, #2EC4B6 100%)",
  },
  {
    id: "bg_space",
    nameEn: "Space Night",
    nameUa: "Космічна ніч",
    price: 200,
    bgValue: "linear-gradient(160deg, #0D0D2B 0%, #1A1A4E 30%, #2D1B69 60%, #11002F 100%)",
  },
  {
    id: "bg_candy",
    nameEn: "Candy Land",
    nameUa: "Країна цукерок",
    price: 150,
    bgValue: "linear-gradient(135deg, #FF9FF3 0%, #FFEAA7 25%, #74B9FF 50%, #A29BFE 75%, #FD79A8 100%)",
  },
  {
    id: "bg_forest",
    nameEn: "Magic Forest",
    nameUa: "Чарівний ліс",
    price: 180,
    bgValue: "linear-gradient(160deg, #0A3D0A 0%, #1B5E20 30%, #2E7D32 55%, #4CAF50 80%, #A5D6A7 100%)",
  },
  {
    id: "bg_arctic",
    nameEn: "Arctic Snow",
    nameUa: "Арктика",
    price: 130,
    bgValue: "linear-gradient(180deg, #B3E5FC 0%, #E1F5FE 40%, #F8FBFF 70%, #FFFFFF 100%)",
  },
  {
    id: "bg_volcano",
    nameEn: "Volcano",
    nameUa: "Вулкан",
    price: 220,
    bgValue: "linear-gradient(180deg, #1A0000 0%, #4A0000 25%, #8B1A00 55%, #D32F2F 80%, #FF6B35 100%)",
  },
  {
    id: "bg_rainbow",
    nameEn: "Rainbow Dream",
    nameUa: "Веселковий сон",
    price: 300,
    bgValue: "linear-gradient(135deg, #FF0080 0%, #FF8C00 16%, #FFD700 33%, #00CC44 50%, #0088FF 66%, #8800FF 83%, #FF0080 100%)",
  },
];

/* "character" is NOT a shop category — it's a separate tab, listed apart */
const CATEGORIES: { id: TabId; label: string; emoji: string }[] = [
  { id: "all",         label: "All items",     emoji: "🏠" },
  { id: "furniture",   label: "Furniture",     emoji: "🛋️" },
  { id: "decor",       label: "Decor",         emoji: "🌈" },
  { id: "outfit",      label: "Outfit",        emoji: "🎩" },
  { id: "special",     label: "Special",       emoji: "✨" },
  { id: "boxes",       label: "Mystery Boxes", emoji: "🎁" },
  { id: "backgrounds", label: "Backgrounds",   emoji: "🖼️" },
];

/* ── Buy modal ──────────────────────────────────────────────────── */
function BuyModal({ item, onSuccess, onClose }: {
  item: ShopItem; onSuccess: () => void; onClose: () => void;
}) {
  const [value, setValue] = useState("");
  const [shake, setShake] = useState(false);
  const [wrong, setWrong] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function check() {
    if (value.trim().toLowerCase() === item.nameEn.toLowerCase()) {
      onSuccess();
    } else {
      setWrong(true); setShake(true);
      setTimeout(() => setShake(false), 400);
      setTimeout(() => setWrong(false), 1800);
      setValue(""); inputRef.current?.focus();
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-xs bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>

          {/* Header */}
          <div className="relative flex flex-col items-center px-6 pt-6 pb-4 text-center"
            style={{ borderBottom: "1px solid #F3F4F6" }}>
            <button onClick={onClose}
              className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full"
              style={{ background: "#F3F4F6", color: "#6B7280" }}>✕</button>
            <div className="text-5xl mb-3">{item.emoji}</div>
            {/* Vocabulary display */}
            <p className="font-black" style={{ fontSize: 22, color: "#1A1A2E", letterSpacing: "-0.02em" }}>
              {item.nameEn}
            </p>
            <p className="font-medium italic" style={{ fontSize: 13, color: "#9CA3AF" }}>{item.phonetic}</p>
            <p className="font-medium" style={{ fontSize: 13, color: "#6B7280" }}>{item.nameUa}</p>
          </div>

          {/* Body */}
          <div className="px-5 py-4 flex flex-col gap-3">
            <p className="text-center font-medium" style={{ fontSize: 12, color: "#9CA3AF" }}>
              Type the English word to unlock
            </p>
            <div className={shake ? "animate-shake" : ""}>
              <input ref={inputRef} autoFocus type="text" value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={e => e.key === "Enter" && value.trim() && check()}
                placeholder={`Type "${item.nameEn}"…`}
                className="w-full px-4 rounded-xl font-medium focus:outline-none"
                style={{
                  height: 48, fontSize: 15,
                  border: `1.5px solid ${wrong ? "#EF4444" : "#E5E7EB"}`,
                  background: wrong ? "#FFF1F2" : "#FAFAFA",
                  color: "#1A1A2E",
                }} />
            </div>
            {wrong && (
              <p className="text-center font-bold" style={{ fontSize: 12, color: "#EF4444" }}>
                Not quite — try again!
              </p>
            )}

            {/* Price */}
            <div className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
              <span className="font-medium" style={{ fontSize: 13, color: "#6B7280" }}>Cost</span>
              <span className="font-black flex items-center gap-1.5" style={{ fontSize: 15, color: "#1A1A2E" }}>
                <img src="/coin.png" alt="coin" style={{ width: 18, height: 18, objectFit: "contain" }} />
                {item.price}
              </span>
            </div>

            <div className="flex gap-2">
              <button onClick={onClose}
                className="flex-1 rounded-xl font-bold py-3"
                style={{ fontSize: 14, background: "#F3F4F6", color: "#6B7280" }}>
                Cancel
              </button>
              <button onClick={check} disabled={!value.trim()}
                className="flex-1 rounded-xl font-black text-white py-3 active:scale-95 transition-transform disabled:opacity-40"
                style={{ fontSize: 14, background: "#1A1A2E" }}>
                Unlock ✓
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Product card — catalog style ───────────────────────────────── */
function ProductCard({ item, isBought, isLocked, canAfford, onBuyClick }: {
  item: ShopItem; isBought: boolean; isLocked: boolean;
  canAfford: boolean; onBuyClick: () => void;
}) {
  return (
    <div className="group flex flex-col"
      style={{ opacity: isLocked ? 0.5 : 1 }}>

      {/* Image tile */}
      <div
        className="relative w-full rounded-xl overflow-hidden flex items-center justify-center"
        style={{
          aspectRatio: "1 / 1",
          background: isBought ? "#F0FDF4" : "#F5F5F5",
          border: isBought ? "1.5px solid #BBF7D0" : "1.5px solid transparent",
        }}
      >
        {item.isNew && !isBought && !isLocked && (
          <div className="absolute top-2 left-2 rounded-full px-2 py-0.5"
            style={{ background: "#1A1A2E" }}>
            <span className="font-black text-white" style={{ fontSize: 8, letterSpacing: "0.08em" }}>NEW</span>
          </div>
        )}

        {item.customImageIdle ? (
          <img src={item.customImageIdle} alt={item.nameEn}
            style={{ width: "70%", height: "70%", objectFit: "contain", filter: isLocked ? "grayscale(1)" : "none" }} />
        ) : (
          <span style={{
            fontSize: "clamp(28px, 5vw, 44px)",
            lineHeight: 1,
            filter: isLocked ? "grayscale(1)" : "none",
          }}>
            {item.emoji}
          </span>
        )}

        {isBought && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: "#22C55E" }}>
            <span className="font-black text-white" style={{ fontSize: 10 }}>✓</span>
          </div>
        )}

        {/* Ghost cart — appears on hover, or always on touch */}
        {!isBought && !isLocked && canAfford && (
          <button
            onClick={onBuyClick}
            className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 sm:opacity-0 opacity-100 active:scale-90 transition-all"
            style={{
              background: "rgba(255,255,255,0.95)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              fontSize: 15,
            }}
            aria-label={`Add ${item.nameEn} to cart`}
          >
            🛒
          </button>
        )}
      </div>

      {/* Text — vocabulary hierarchy */}
      <div className="mt-2 flex flex-col gap-0.5">
        <p className="font-black leading-tight" style={{
          fontSize: "clamp(11px, 1.4vw, 14px)",
          color: "#1A1A2E",
          letterSpacing: "-0.01em",
        }}>
          {item.nameEn}
        </p>
        <p className="font-medium italic leading-none" style={{
          fontSize: "clamp(9px, 1.1vw, 11px)",
          color: "#9CA3AF",
        }}>
          {item.phonetic}
        </p>
        <p className="font-medium leading-none" style={{
          fontSize: "clamp(9px, 1.1vw, 11px)",
          color: "#6B7280",
        }}>
          {item.nameUa}
        </p>

        {/* Price row */}
        <div className="flex items-center justify-between mt-1.5">
          <span className="font-black flex items-center gap-1" style={{
            fontSize: "clamp(10px, 1.2vw, 13px)",
            color: isLocked ? "#9CA3AF" : "#1A1A2E",
          }}>
            {isLocked
              ? `🔒 ${item.levelRequired}`
              : <><img src="/coin.png" alt="coin" style={{ width: 13, height: 13, objectFit: "contain" }} />{item.price}</>
            }
          </span>
          {/* Mobile tap-to-buy (sm and below, ghost cart always visible) */}
          {!isBought && !isLocked && canAfford && (
            <button
              onClick={onBuyClick}
              className="sm:hidden w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"
              style={{
                background: "#F3F4F6",
                fontSize: 14,
              }}
            >
              🛒
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Background card ────────────────────────────────────────────── */
function BgCard({ item, isActive, canAfford, onBuy }: {
  item: BgItem; isActive: boolean; canAfford: boolean; onBuy: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {/* Preview — 16:9 */}
      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{
          aspectRatio: "16 / 9",
          background: item.bgValue,
          border: isActive ? "2.5px solid #22C55E" : "2px solid transparent",
          boxShadow: isActive ? "0 0 0 3px rgba(34,197,94,0.2)" : "0 2px 8px rgba(0,0,0,0.10)",
        }}
      >
        {isActive && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "#22C55E" }}>
            <span className="font-black text-white" style={{ fontSize: 11 }}>✓</span>
          </div>
        )}
        {item.price === 0 && !isActive && (
          <div className="absolute top-2 left-2 rounded-full px-2 py-0.5"
            style={{ background: "rgba(0,0,0,0.45)" }}>
            <span className="font-black text-white" style={{ fontSize: 8, letterSpacing: "0.08em" }}>FREE</span>
          </div>
        )}
      </div>

      {/* Info row */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="font-black" style={{ fontSize: 13, color: "#1A1A2E", letterSpacing: "-0.01em" }}>
            {item.nameEn}
          </span>
          <span className="font-medium" style={{ fontSize: 11, color: "#6B7280" }}>
            {item.nameUa}
          </span>
        </div>

        {isActive ? (
          <span className="font-bold" style={{ fontSize: 11, color: "#22C55E" }}>Active</span>
        ) : (
          <button
            onClick={onBuy}
            disabled={!canAfford}
            className="rounded-xl px-3 py-1.5 font-black active:scale-95 transition-transform disabled:opacity-40"
            style={{
              background: item.price === 0 ? "#22C55E" : "#1A1A2E",
              color: "white",
              fontSize: 12,
              boxShadow: item.price === 0 ? "0 3px 0 #16A34A" : "0 3px 0 #0F0F1A",
            }}
          >
            {item.price === 0 ? "Set Free" : <span className="flex items-center gap-1"><img src="/coin.png" alt="coin" style={{ width: 12, height: 12, objectFit: "contain" }} />{item.price}</span>}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── My Character — Roblox-style dressing room ──────────────────── */
const SLOT_OFFSET: Record<string, { top: string; left: string }> = {
  hat:      { top: "-14%", left: "50%" },
  crown:    { top: "-14%", left: "50%" },
  glasses:  { top: "26%",  left: "50%" },
  scarf:    { top: "56%",  left: "50%" },
  backpack: { top: "38%",  left: "105%" },
  trophy:   { top: "38%",  left: "-10%" },
  rocket:   { top: "10%",  left: "-10%" },
};

const EMOTION_META: { key: CharacterEmotion; label: string; emoji: string }[] = [
  { key: 'idle',      label: 'Спокій',  emoji: '🙂' },
  { key: 'happy',     label: 'Радість', emoji: '😄' },
  { key: 'celebrate', label: 'Ура!',    emoji: '🎉' },
  { key: 'thinking',  label: 'Думаю',   emoji: '🤔' },
  { key: 'surprised', label: 'Вау!',    emoji: '😮' },
  { key: 'sleepy',    label: 'Сплю',    emoji: '😴' },
  { key: 'sad',       label: 'Сумно',   emoji: '😢' },
  { key: 'angry',     label: 'Злюсь',   emoji: '😠' },
];

type PickerChar = {
  id: string;
  nameEn: string;
  nameUa: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  howToGet: string;
  unlocked: boolean;
};

const DRESS_CHARS: PickerChar[] = [
  { id: 'fox',     nameEn: 'Rusty', nameUa: 'Рустік', rarity: 'common',    howToGet: 'Starter',       unlocked: true  },
  { id: 'raccoon', nameEn: 'Rocky', nameUa: 'Роккі',  rarity: 'rare',      howToGet: '30-day streak', unlocked: true  },
  { id: 'cat',     nameEn: 'Luna',  nameUa: 'Луна',   rarity: 'uncommon',  howToGet: 'Silver Box',    unlocked: false },
  { id: 'rabbit',  nameEn: 'Pearl', nameUa: 'Перлина',rarity: 'rare',      howToGet: 'Gold Box',      unlocked: false },
  { id: 'dragon',  nameEn: 'Blaze', nameUa: 'Блейз',  rarity: 'legendary', howToGet: 'Legendary Box', unlocked: false },
];

const RARITY_COLOR: Record<string, string> = {
  common: '#9CA3AF', uncommon: '#22C55E', rare: '#4F9CF9', legendary: '#F59E0B',
};
const RARITY_BG: Record<string, string> = {
  common: '#F9FAFB', uncommon: '#F0FDF4', rare: '#EFF6FF', legendary: '#FFFBEB',
};
const RARITY_BORDER: Record<string, string> = {
  common: '#F3F4F6', uncommon: '#BBF7D0', rare: '#BFDBFE', legendary: '#FDE68A',
};

function CharacterDressRoom({ allItems, ownedIds, balance, onBuyItem, onPlaceItem }: {
  allItems: ShopItem[];
  ownedIds: Set<string>;
  balance: number;
  onBuyItem: (item: ShopItem) => void;
  onPlaceItem: (itemId: string) => void;
}) {
  const { state, patch } = useKidsState();
  const characterId = state.activeCharacterId ?? 'fox';
  const equippedIds = state.equippedItemIds ?? [];
  const [previewEmotion, setPreviewEmotion] = useState<CharacterEmotion>('idle');
  const [invSubTab, setInvSubTab] = useState<"character" | "room">("character");
  const outfitItems = allItems.filter(i => i.tab === "outfit" || i.tab === "special");
  const roomItems   = allItems.filter(
    (i) => (i.tab === "furniture" || i.tab === "decor" || i.tab === "special") && ownedIds.has(i.id)
  );

  const charDef = CHARACTERS[characterId];
  const availableEmotions = charDef
    ? EMOTION_META.filter(e => !!charDef.emotions[e.key])
    : EMOTION_META;

  function toggleEquip(id: string) {
    const next = equippedIds.includes(id)
      ? equippedIds.filter((x) => x !== id)
      : [...equippedIds, id];
    patch({ equippedItemIds: next });
  }

  function selectCharacter(id: string) {
    if (id === characterId) return;
    patch({ activeCharacterId: id });
    setPreviewEmotion('idle');
  }

  return (
    <div className="flex flex-col md:flex-row flex-1 overflow-hidden" style={{ background: "white" }}>

      {/* ── Character preview panel ── */}
      <div className="flex flex-col items-center gap-5 px-6 py-6 md:w-80 flex-shrink-0 overflow-y-auto"
        style={{ borderBottom: "1px solid #F3F4F6", borderRight: "1px solid #F3F4F6", background: "#FAFAFA" }}>

        {/* Character name */}
        <div className="text-center">
          <p className="font-black" style={{ fontSize: 17, letterSpacing: "-0.02em", color: "#1A1A2E" }}>My Character</p>
          <p className="font-bold uppercase tracking-widest" style={{ fontSize: 9.5, color: "#9CA3AF", marginTop: 2 }}>
            {characterId} · Level {mockKidsUser.level}
          </p>
        </div>

        {/* Avatar with floating equipped emojis */}
        <div className="relative" key={`${characterId}-${previewEmotion}`}>
          <CharacterAvatar characterId={characterId} emotion={previewEmotion} size={170} animate />
          {equippedIds.map(id => {
            const item = outfitItems.find(i => i.id === id);
            if (!item) return null;
            const pos = SLOT_OFFSET[id] ?? { top: "0%", left: "50%" };
            return (
              <div key={id} className="absolute pointer-events-none -translate-x-1/2"
                style={{ top: pos.top, left: pos.left, fontSize: 32, filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.2))", zIndex: 10 }}>
                {item.emoji}
              </div>
            );
          })}
        </div>

        {/* Equipped strip */}
        {equippedIds.length > 0 ? (
          <div className="flex flex-wrap gap-2 justify-center">
            {equippedIds.map(id => {
              const item = outfitItems.find(i => i.id === id);
              return item ? (
                <button key={id} onClick={() => toggleEquip(id)}
                  title={`Remove ${item.nameEn}`}
                  className="active:scale-90 transition-transform"
                  style={{ background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: 14, padding: "5px 10px", fontSize: 22 }}>
                  {item.emoji}
                </button>
              ) : null;
            })}
          </div>
        ) : (
          <p style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600, textAlign: "center" }}>
            Tap an item below to equip
          </p>
        )}

        {/* ── Character picker ────────────────────────────────── */}
        <div className="w-full flex flex-col gap-2 pt-3" style={{ borderTop: '1px solid #EEF0F3' }}>
          <p className="font-black uppercase tracking-widest" style={{ fontSize: 9.5, color: '#9CA3AF' }}>
            Персонаж
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {DRESS_CHARS.map(char => {
              const isActive = characterId === char.id;
              return (
                <button
                  key={char.id}
                  onClick={() => char.unlocked && selectCharacter(char.id)}
                  disabled={!char.unlocked}
                  title={char.unlocked ? char.nameEn : `🔒 ${char.howToGet}`}
                  className="flex-shrink-0 flex flex-col items-center gap-1 rounded-xl p-1.5 active:scale-95 transition-all"
                  style={{
                    background: isActive ? RARITY_BG[char.rarity] : '#FFFFFF',
                    border: `2px solid ${isActive ? RARITY_COLOR[char.rarity] : '#EEF0F3'}`,
                    opacity: char.unlocked ? 1 : 0.45,
                    width: 64,
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: char.unlocked ? RARITY_BG[char.rarity] : '#F3F4F6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    filter: char.unlocked ? 'none' : 'grayscale(1)',
                    overflow: 'hidden',
                  }}>
                    {char.unlocked
                      ? <CharacterAvatar characterId={char.id} emotion="idle" size={44} animate={false} />
                      : <span style={{ fontSize: 20 }}>🔒</span>
                    }
                  </div>
                  <span className="font-black" style={{
                    fontSize: 9.5,
                    color: isActive ? RARITY_COLOR[char.rarity] : '#6B7280',
                    letterSpacing: '0.02em',
                  }}>
                    {char.nameEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Emotion preview strip ────────────────────────────── */}
        <div className="w-full flex flex-col gap-2 pt-3" style={{ borderTop: '1px solid #EEF0F3' }}>
          <div className="flex items-center justify-between">
            <p className="font-black uppercase tracking-widest" style={{ fontSize: 9.5, color: '#9CA3AF' }}>
              Емоції
            </p>
            <span className="font-bold" style={{ fontSize: 10, color: '#9CA3AF' }}>
              {availableEmotions.length} шт.
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {availableEmotions.map(em => {
              const isActive = previewEmotion === em.key;
              return (
                <button
                  key={em.key}
                  onClick={() => setPreviewEmotion(isActive ? 'idle' : em.key)}
                  className="flex flex-col items-center gap-0.5 rounded-lg py-1.5 active:scale-90 transition-all"
                  style={{
                    background: isActive ? '#EFF6FF' : '#FFFFFF',
                    border: `1.5px solid ${isActive ? '#4F9CF9' : '#EEF0F3'}`,
                    boxShadow: isActive ? '0 0 0 2px rgba(79,156,249,0.18)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 14, lineHeight: 1 }}>{em.emoji}</span>
                  <span className="font-bold" style={{
                    fontSize: 8.5,
                    color: isActive ? '#4F9CF9' : '#6B7280',
                    letterSpacing: '0.02em',
                  }}>
                    {em.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Items grid ── */}
      <div className="flex-1 overflow-y-auto p-5" style={{ paddingBottom: 100 }}>

        {/* Sub-tab switcher: Character / Room */}
        <div className="flex gap-2 mb-5 p-1 rounded-2xl" style={{ background: "#F3F4F6" }}>
          <button
            onClick={() => setInvSubTab("character")}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all active:scale-95"
            style={{
              background: invSubTab === "character" ? "#FFFFFF" : "transparent",
              boxShadow: invSubTab === "character" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            <span style={{ fontSize: 14 }}>👤</span>
            <span className="font-black" style={{
              fontSize: 11,
              color: invSubTab === "character" ? "#1A1A2E" : "#9CA3AF",
              letterSpacing: "0.02em",
            }}>
              Персонаж ({outfitItems.filter(i => ownedIds.has(i.id)).length})
            </span>
          </button>
          <button
            onClick={() => setInvSubTab("room")}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all active:scale-95"
            style={{
              background: invSubTab === "room" ? "#FFFFFF" : "transparent",
              boxShadow: invSubTab === "room" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            <span style={{ fontSize: 14 }}>🏠</span>
            <span className="font-black" style={{
              fontSize: 11,
              color: invSubTab === "room" ? "#1A1A2E" : "#9CA3AF",
              letterSpacing: "0.02em",
            }}>
              Кімната ({roomItems.length})
            </span>
          </button>
        </div>

        {invSubTab === "room" ? (
          <>
            <p className="font-black uppercase tracking-widest mb-4"
              style={{ fontSize: 10, color: "#9CA3AF" }}>Для домівки</p>
            {roomItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <span style={{ fontSize: 48, opacity: 0.5 }}>🛋️</span>
                <p className="font-bold" style={{ fontSize: 14, color: "#6B7280" }}>
                  Поки нічого для домівки
                </p>
                <p style={{ fontSize: 12, color: "#9CA3AF" }}>
                  Купи меблі, декор або спеціальні предмети в магазині
                </p>
              </div>
            ) : (
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))" }}>
                {roomItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onPlaceItem(item.id)}
                    className="flex flex-col items-center gap-1.5 rounded-2xl p-3 bg-primary/5 border border-primary/15 hover:border-primary/40 active:scale-95 transition-all text-center"
                  >
                    {item.customImageIdle ? (
                      <img src={item.customImageIdle} alt={item.nameEn} style={{ width: 42, height: 42, objectFit: "contain" }} />
                    ) : (
                      <span style={{ fontSize: 34, lineHeight: 1 }}>{item.emoji}</span>
                    )}
                    <p className="font-black leading-tight" style={{ fontSize: 10, color: "#1A1A2E" }}>
                      {item.nameEn}
                    </p>
                    <span className="font-black text-[9px] text-primary-dark bg-primary/10 rounded-full px-2 py-0.5">
                      На домівку →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
        <>
        <p className="font-black uppercase tracking-widest mb-4"
          style={{ fontSize: 10, color: "#9CA3AF" }}>Outfit &amp; Accessories</p>

        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))" }}>
          {outfitItems.map(item => {
            const isOwned    = ownedIds.has(item.id);
            const isEquipped = equippedIds.includes(item.id);
            const isLocked   = !canUnlock(mockKidsUser.level, item.levelRequired);
            const canAfford  = balance >= item.price;

            return (
              <div key={item.id}
                className="flex flex-col items-center gap-2 rounded-2xl p-3 cursor-pointer active:scale-95 transition-all select-none"
                style={{
                  background: isEquipped ? "#F0FDF4" : "#F9FAFB",
                  border: isEquipped ? "1.5px solid #58CC02" : isOwned ? "1.5px solid #BBF7D0" : "1.5px solid #F3F4F6",
                  opacity: isLocked ? 0.4 : 1,
                  boxShadow: isEquipped ? "0 0 12px rgba(88,204,2,0.18)" : "none",
                }}
                onClick={() => {
                  if (isLocked) return;
                  if (!isOwned) { onBuyItem(item); return; }
                  toggleEquip(item.id);
                }}
              >
                <span style={{ fontSize: 30, filter: isLocked ? "grayscale(1)" : "none" }}>{item.emoji}</span>
                <p className="font-black text-center leading-tight"
                  style={{ fontSize: 10, color: isEquipped ? "#16A34A" : "#374151", letterSpacing: "-0.01em" }}>
                  {item.nameEn}
                </p>
                {isEquipped && (
                  <span style={{ fontSize: 7.5, color: "#16A34A", fontWeight: 800, letterSpacing: "0.06em" }}>EQUIPPED</span>
                )}
                {!isOwned && !isLocked && (
                  <div className="flex items-center gap-0.5">
                    <img src="/coin.png" alt="coin" style={{ width: 10, height: 10, objectFit: "contain" }} />
                    <span style={{ fontSize: 9, color: canAfford ? "#F59E0B" : "#EF4444", fontWeight: 700 }}>{item.price}</span>
                  </div>
                )}
                {isLocked && (
                  <span style={{ fontSize: 9, color: "#9CA3AF", fontWeight: 700 }}>🔒 {item.levelRequired}</span>
                )}
              </div>
            );
          })}
        </div>
        </>
        )}
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */
function ShopPageInner() {
  const user = mockKidsUser;
  const {
    state: kidsState,
    patch: patchState,
    purchaseItem,
    placeItem,
  } = useKidsState();
  const { items: customItems } = useCustomItems();
  const searchParams = useSearchParams();

  const balance = kidsState.coins ?? user.coins;
  const bought  = new Set(kidsState.ownedItemIds);
  const initTab = (searchParams.get("tab") as TabId | null) ?? "all";
  const [activeTab, setActiveTab] = useState<TabId>(initTab);
  const [toast, setToast]         = useState<string | null>(null);
  const [buyItem, setBuyItem]     = useState<ShopItem | null>(null);
  const [openBox, setOpenBox]     = useState<BoxRarity | null>(null);
  const [showAdd, setShowAdd]     = useState(false);
  const [onlyAffordable, setOnlyAffordable] = useState(false);

  // Merge default + custom
  const allItems: ShopItem[] = [
    ...ITEMS,
    ...customItems.map(ci => ({
      id: ci.id, emoji: ci.emojiFallback,
      nameEn: ci.nameEn, phonetic: "", nameUa: ci.nameUa,
      price: ci.price,
      tab: (ci.category as Exclude<TabId, "all" | "boxes" | "backgrounds" | "character">) ?? "decor",
      levelRequired: "A1" as Level,
      isCustom: true, customImageIdle: ci.imageIdle,
    })),
  ];

  const visible = allItems
    .filter(i => activeTab === "all" || i.tab === activeTab)
    .filter(i => !onlyAffordable || balance >= i.price);

  const counts: Record<TabId, number> = {
    all:         allItems.length,
    furniture:   allItems.filter(i => i.tab === "furniture").length,
    decor:       allItems.filter(i => i.tab === "decor").length,
    outfit:      allItems.filter(i => i.tab === "outfit").length,
    special:     allItems.filter(i => i.tab === "special").length,
    boxes:       BOX_TYPES.length,
    backgrounds: BACKGROUNDS.length,
    character:   allItems.filter(i => i.tab === "outfit" || i.tab === "special").length,
  };

  const activeBg = kidsState.roomBackground ?? "url('/kids-dashboard-bg.jpg') center bottom / cover";

  async function handleBuyBackground(item: BgItem) {
    if (item.price > 0 && balance < item.price) return;
    const newBalance = balance - item.price;
    await patchState({ roomBackground: item.bgValue, coins: Math.max(0, newBalance) });
    setToast(`Room background set to "${item.nameEn}"!`);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSuccess() {
    if (!buyItem) return;
    const ok = await purchaseItem(buyItem.id, buyItem.price);
    if (!ok) {
      setToast("Not enough coins");
    } else {
      setToast(`"${buyItem.nameEn}" — додано в інвентар!`);
    }
    setTimeout(() => setToast(null), 3000);
    setBuyItem(null);
  }

  async function handleBoxPurchase(cost: number, item: LootItem) {
    await patchState({ coins: Math.max(0, (kidsState.coins ?? 0) - cost) });
    setToast(`${item.emoji} ${item.nameUa} — yours!`);
    setTimeout(() => setToast(null), 4000);
  }

  async function handlePlaceFromInventory(itemId: string) {
    await placeItem(itemId);
    setToast("Додано на домівку — торкни «Редагувати» на головному екрані");
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-white">

      {/* ── LAYOUT: sidebar + grid ───────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar — desktop only */}
        <div className="hidden md:flex flex-col flex-shrink-0 overflow-y-auto"
          style={{ width: 200, borderRight: "1px solid #F3F4F6" }}>

          {/* Balance chip in sidebar */}
          <div className="flex items-center gap-2 mx-4 mt-4 mb-2 rounded-xl px-3 py-2.5"
            style={{ background: "#FFFBEB", border: "1.5px solid #FDE68A" }}>
            <img src="/coin.png" alt="coin" style={{ width: 20, height: 20, objectFit: "contain" }} />
            <div className="flex flex-col leading-none">
              <span style={{ fontSize: 7.5, color: "#D97706", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Balance</span>
              <span className="font-black" style={{ fontSize: 14, color: "#92400E" }}>{balance}</span>
            </div>
            <button onClick={() => setShowAdd(true)}
              className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center font-black active:scale-90 transition-transform"
              style={{ background: "#F3F4F6", color: "#374151", fontSize: 16 }}>+</button>
          </div>

          <p className="px-5 mt-3 mb-2 font-black uppercase tracking-widest"
            style={{ fontSize: 10, color: "#9CA3AF" }}>Category</p>

          {CATEGORIES.map(cat => (
            <button key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className="flex items-center gap-2.5 px-5 py-2.5 text-left transition-colors active:scale-95"
              style={{
                background: activeTab === cat.id ? "#F3F4F6" : "transparent",
                borderLeft: activeTab === cat.id ? "3px solid #1A1A2E" : "3px solid transparent",
              }}>
              <span style={{ fontSize: 16 }}>{cat.emoji}</span>
              <span className="font-bold flex-1" style={{
                fontSize: 13,
                color: activeTab === cat.id ? "#1A1A2E" : "#6B7280",
                fontWeight: activeTab === cat.id ? 800 : 500,
              }}>
                {cat.label}
              </span>
              <span className="font-medium" style={{ fontSize: 11, color: "#9CA3AF" }}>
                {counts[cat.id]}
              </span>
            </button>
          ))}

          {/* Inventory — separate section, not a shop category */}
          <div style={{ margin: "12px 20px 0", borderTop: "1px solid #F3F4F6", paddingTop: 12 }}>
            <p className="font-black uppercase tracking-widest mb-2"
              style={{ fontSize: 10, color: "#9CA3AF" }}>Моє</p>
            <button
              onClick={() => setActiveTab("character")}
              className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-left transition-all active:scale-95"
              style={{
                background: activeTab === "character" ? "#F5F0FF" : "#F9FAFB",
                border: activeTab === "character" ? "1.5px solid #DDD6FE" : "1.5px solid #F3F4F6",
              }}>
              <span style={{ fontSize: 18 }}>🎒</span>
              <span className="font-bold flex-1" style={{
                fontSize: 13,
                color: activeTab === "character" ? "#7C3AED" : "#6B7280",
                fontWeight: activeTab === "character" ? 800 : 500,
              }}>
                Інвентар
              </span>
              <span className="font-medium" style={{ fontSize: 11, color: "#9CA3AF" }}>
                {bought.size}
              </span>
            </button>
          </div>

          {/* Filter */}
          <div style={{ margin: "16px 20px 0", borderTop: "1px solid #F3F4F6", paddingTop: 16 }}>
            <p className="font-black uppercase tracking-widest mb-3"
              style={{ fontSize: 10, color: "#9CA3AF" }}>Filter</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={onlyAffordable}
                onChange={e => setOnlyAffordable(e.target.checked)}
                className="w-4 h-4 rounded" />
              <span className="font-medium" style={{ fontSize: 13, color: "#374151" }}>
                Can afford
              </span>
            </label>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* Mobile: balance + category scroll */}
          <div className="md:hidden" style={{ borderBottom: "1px solid #F3F4F6" }}>
            <div className="flex items-center gap-3 px-4 py-2"
              style={{ paddingTop: "env(safe-area-inset-top, 8px)" }}>
              <div className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5"
                style={{ background: "#FFFBEB", border: "1.5px solid #FDE68A" }}>
                <img src="/coin.png" alt="coin" style={{ width: 16, height: 16, objectFit: "contain" }} />
                <span className="font-black" style={{ fontSize: 13, color: "#92400E" }}>{balance}</span>
              </div>
              <button onClick={() => setShowAdd(true)}
                className="w-8 h-8 rounded-xl flex items-center justify-center font-black active:scale-90 transition-transform"
                style={{ background: "#F3F4F6", color: "#374151", fontSize: 18 }}>+</button>
            </div>
            <div className="flex items-center gap-1.5 px-4 pb-3 overflow-x-auto"
              style={{ scrollbarWidth: "none" }}>
              {CATEGORIES.map(cat => (
                <button key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all active:scale-95"
                  style={{
                    background: activeTab === cat.id ? "#1A1A2E" : "#F3F4F6",
                    color: activeTab === cat.id ? "white" : "#6B7280",
                  }}>
                  <span style={{ fontSize: 14 }}>{cat.emoji}</span>
                  <span className="font-bold" style={{ fontSize: 11 }}>{cat.label}</span>
                </button>
              ))}
              {/* My Character — visual separator before this */}
              <div className="w-px h-5 flex-shrink-0" style={{ background: "#E5E7EB", margin: "0 4px" }} />
              <button
                onClick={() => setActiveTab("character")}
                className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all active:scale-95"
                style={{
                  background: activeTab === "character" ? "#7C3AED" : "#F5F0FF",
                  color: activeTab === "character" ? "white" : "#7C3AED",
                  border: "1.5px solid #DDD6FE",
                }}>
                <span style={{ fontSize: 14 }}>🎒</span>
                <span className="font-bold" style={{ fontSize: 11 }}>Інвентар ({bought.size})</span>
              </button>
            </div>
          </div>

          {/* Results bar */}
          <div className="flex items-center justify-between px-4 py-2.5"
            style={{ borderBottom: "1px solid #F3F4F6" }}>
            <p className="font-medium" style={{ fontSize: 12, color: "#9CA3AF" }}>
              {activeTab === "boxes" ? "Mystery Boxes" : activeTab === "backgrounds" ? `${BACKGROUNDS.length} backgrounds` : `${visible.length} items`}
            </p>
            {/* Mobile afford toggle */}
            <label className="md:hidden flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={onlyAffordable}
                onChange={e => setOnlyAffordable(e.target.checked)}
                className="w-3.5 h-3.5" />
              <span className="font-medium" style={{ fontSize: 11, color: "#6B7280" }}>Can afford</span>
            </label>
          </div>

          {/* Grid / Boxes / Backgrounds / Character */}
          <div className={`flex-1 overflow-hidden ${activeTab === "character" ? "flex flex-col" : "overflow-y-auto px-4 pt-4 pb-28"}`}>

            {activeTab === "character" ? (
              <CharacterDressRoom
                allItems={allItems}
                ownedIds={bought}
                balance={balance}
                onBuyItem={item => setBuyItem(item)}
                onPlaceItem={handlePlaceFromInventory}
              />
            ) : activeTab === "backgrounds" ? (
              <div className="flex flex-col gap-5">
                <div className="inline-flex items-center gap-2.5 rounded-2xl px-4 py-2.5 self-start"
                  style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0" }}>
                  <span style={{ fontSize: 18 }}>🖼️</span>
                  <p className="font-medium" style={{ fontSize: 13, color: "#374151" }}>
                    Обери фон — він одразу зміниться на головному екрані
                  </p>
                </div>
                <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))" }}>
                  {BACKGROUNDS.map(item => (
                    <BgCard
                      key={item.id}
                      item={item}
                      isActive={activeBg === item.bgValue}
                      canAfford={item.price === 0 || balance >= item.price}
                      onBuy={() => handleBuyBackground(item)}
                    />
                  ))}
                </div>
              </div>
            ) : activeTab === "boxes" ? (
              <div className="flex flex-col gap-5">
                <div className="inline-flex items-center gap-2.5 rounded-2xl px-4 py-2.5 self-start bg-purple/10 border border-purple/25">
                  <span className="text-lg" aria-hidden>🎁</span>
                  <p className="text-sm font-medium text-ink">
                    Відкрий скриньку — отримай меблі, декор або нового персонажа!
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {BOX_TYPES.map(type => (
                    <BoxCard key={type} type={type} balance={balance} onOpen={t => setOpenBox(t)} />
                  ))}
                </div>
              </div>
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <span style={{ fontSize: 48 }}>🎉</span>
                <p className="font-black" style={{ fontSize: 16, color: "#1A1A2E" }}>All owned!</p>
                <p className="font-medium" style={{ fontSize: 13, color: "#9CA3AF" }}>You have everything in this category.</p>
              </div>
            ) : (
              /* Product grid — 3 cols mobile, 4 md, 5 lg, 6 xl */
              <div className="grid gap-x-4 gap-y-6"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(min(120px, 45%), 1fr))",
                }}>
                {visible.map(item => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    isBought={bought.has(item.id)}
                    isLocked={!canUnlock(user.level, item.levelRequired)}
                    canAfford={balance >= item.price}
                    onBuyClick={() => setBuyItem(item)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {buyItem && (
        <BuyModal item={buyItem} onSuccess={handleSuccess} onClose={() => setBuyItem(null)} />
      )}
      {openBox && (
        <LootBoxModal boxType={openBox} balance={balance} onClose={() => setOpenBox(null)} onPurchase={handleBoxPurchase} />
      )}
      {showAdd && <AddCustomModal onClose={() => setShowAdd(false)} />}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="rounded-2xl px-5 py-3 font-bold text-white whitespace-nowrap"
            style={{ background: "rgba(26,26,46,0.9)", backdropFilter: "blur(8px)", fontSize: 13 }}>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense>
      <ShopPageInner />
    </Suspense>
  );
}
