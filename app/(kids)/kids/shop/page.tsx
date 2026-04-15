"use client";

import { useState, useRef, Suspense, type CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import { mockKidsUser, type Level } from "@/mocks/user";
import { LootBoxModal, BoxCard } from "@/components/kids/LootBox";
import type { BoxRarity, LootItem } from "@/components/kids/LootBox";
import AddCustomModal from "@/components/kids/AddCustomModal";
import { useCustomItems, useKidsState } from "@/lib/use-kids-store";
import CharacterAvatar from "@/components/kids/CharacterAvatar";
import { CHARACTERS, type CharacterEmotion } from "@/lib/characters";

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

const ITEMS: ShopItem[] = [
  { id: "sofa",       emoji: "🛋️", nameEn: "Sofa",          phonetic: "/ˈsoʊfə/",            nameUa: "Диван",           price: 80,  tab: "furniture", levelRequired: "A1" },
  { id: "wardrobe",   emoji: "🪞",  nameEn: "Wardrobe",      phonetic: "/ˈwɔːrdrōb/",         nameUa: "Шафа",            price: 120, tab: "furniture", levelRequired: "A2", isNew: true },
  { id: "bookshelf",  emoji: "📚", nameEn: "Bookshelf",      phonetic: "/ˈbʊkʃɛlf/",          nameUa: "Книжкова полиця", price: 60,  tab: "furniture", levelRequired: "A1" },
  { id: "armchair",   emoji: "🪑", nameEn: "Armchair",       phonetic: "/ˈɑːrmtʃɛr/",         nameUa: "Крісло",          price: 90,  tab: "furniture", levelRequired: "A1" },
  { id: "desk",       emoji: "🖥️", nameEn: "Desk",           phonetic: "/dɛsk/",              nameUa: "Письмовий стіл",  price: 110, tab: "furniture", levelRequired: "A1" },
  { id: "lamp",       emoji: "🪔", nameEn: "Floor Lamp",     phonetic: "/flɔːr læmp/",        nameUa: "Торшер",          price: 45,  tab: "furniture", levelRequired: "A1" },
  { id: "globe",      emoji: "🌍", nameEn: "Globe",          phonetic: "/ɡloʊb/",             nameUa: "Глобус",          price: 40,  tab: "decor",     levelRequired: "A1" },
  { id: "aquarium",   emoji: "🐠", nameEn: "Aquarium",       phonetic: "/əˈkwɛriəm/",         nameUa: "Акваріум",        price: 150, tab: "decor",     levelRequired: "A2", isNew: true },
  { id: "rainbow",    emoji: "🌈", nameEn: "Rainbow Poster", phonetic: "/ˈreɪnboʊ ˈpoʊstər/", nameUa: "Постер-веселка",  price: 30,  tab: "decor",     levelRequired: "A1" },
  { id: "clock",      emoji: "⏰", nameEn: "Clock",          phonetic: "/klɒk/",              nameUa: "Годинник",        price: 50,  tab: "decor",     levelRequired: "A1" },
  { id: "plant",      emoji: "🪴", nameEn: "Plant",          phonetic: "/plænt/",             nameUa: "Рослина",         price: 35,  tab: "decor",     levelRequired: "A1" },
  { id: "hat",        emoji: "🎩", nameEn: "Top Hat",        phonetic: "/tɒp hæt/",           nameUa: "Циліндр",         price: 70,  tab: "outfit",    levelRequired: "A1" },
  { id: "scarf",      emoji: "🧣", nameEn: "Scarf",          phonetic: "/skɑːrf/",            nameUa: "Шарф",            price: 45,  tab: "outfit",    levelRequired: "A1" },
  { id: "glasses",    emoji: "🕶️", nameEn: "Sunglasses",     phonetic: "/ˈsʌnɡlæsɪz/",       nameUa: "Окуляри",         price: 55,  tab: "outfit",    levelRequired: "A2", isNew: true },
  { id: "crown",      emoji: "👑", nameEn: "Crown",          phonetic: "/kraʊn/",             nameUa: "Корона",          price: 200, tab: "outfit",    levelRequired: "B1" },
  { id: "backpack",   emoji: "🎒", nameEn: "Backpack",       phonetic: "/ˈbækpæk/",          nameUa: "Рюкзак",          price: 65,  tab: "outfit",    levelRequired: "A1" },
  { id: "trophy",     emoji: "🏆", nameEn: "Trophy",         phonetic: "/ˈtroʊfi/",           nameUa: "Кубок",           price: 300, tab: "special",   levelRequired: "A2" },
  { id: "rocket",     emoji: "🚀", nameEn: "Rocket",         phonetic: "/ˈrɒkɪt/",            nameUa: "Ракета",          price: 250, tab: "special",   levelRequired: "B1" },
  { id: "unicorn",    emoji: "🦄", nameEn: "Unicorn",        phonetic: "/ˈjuːnɪkɔːrn/",       nameUa: "Єдиноріг",        price: 500, tab: "special",   levelRequired: "B2" },
  { id: "dragon_egg", emoji: "🥚", nameEn: "Dragon Egg",     phonetic: "/ˈdræɡən ɛɡ/",        nameUa: "Яйце дракона",    price: 400, tab: "special",   levelRequired: "B1" },
];

const BOX_TYPES: BoxRarity[] = ["common", "silver", "gold", "legendary"];

interface BgItem { id: string; nameEn: string; nameUa: string; price: number; bgValue: string; }

const BACKGROUNDS: BgItem[] = [
  { id: "bg_default", nameEn: "Forest Default", nameUa: "Ліс (стандарт)",  price: 0,   bgValue: "url('/kids-dashboard-bg.jpg') center bottom / cover" },
  { id: "bg_sunset",  nameEn: "Sunset Sky",     nameUa: "Захід сонця",     price: 120, bgValue: "linear-gradient(160deg, #FF6B35 0%, #F7C59F 35%, #FFBE76 65%, #FF6B6B 100%)" },
  { id: "bg_ocean",   nameEn: "Deep Ocean",     nameUa: "Глибокий океан",  price: 140, bgValue: "linear-gradient(180deg, #0A2342 0%, #126872 40%, #1B998B 75%, #2EC4B6 100%)" },
  { id: "bg_space",   nameEn: "Space Night",    nameUa: "Космічна ніч",    price: 200, bgValue: "linear-gradient(160deg, #0D0D2B 0%, #1A1A4E 30%, #2D1B69 60%, #11002F 100%)" },
  { id: "bg_candy",   nameEn: "Candy Land",     nameUa: "Країна цукерок",  price: 150, bgValue: "linear-gradient(135deg, #FF9FF3 0%, #FFEAA7 25%, #74B9FF 50%, #A29BFE 75%, #FD79A8 100%)" },
  { id: "bg_forest",  nameEn: "Magic Forest",   nameUa: "Чарівний ліс",    price: 180, bgValue: "linear-gradient(160deg, #0A3D0A 0%, #1B5E20 30%, #2E7D32 55%, #4CAF50 80%, #A5D6A7 100%)" },
  { id: "bg_arctic",  nameEn: "Arctic Snow",    nameUa: "Арктика",         price: 130, bgValue: "linear-gradient(180deg, #B3E5FC 0%, #E1F5FE 40%, #F8FBFF 70%, #FFFFFF 100%)" },
  { id: "bg_volcano", nameEn: "Volcano",        nameUa: "Вулкан",          price: 220, bgValue: "linear-gradient(180deg, #1A0000 0%, #4A0000 25%, #8B1A00 55%, #D32F2F 80%, #FF6B35 100%)" },
  { id: "bg_rainbow", nameEn: "Rainbow Dream",  nameUa: "Веселковий сон",  price: 300, bgValue: "linear-gradient(135deg, #FF0080 0%, #FF8C00 16%, #FFD700 33%, #00CC44 50%, #0088FF 66%, #8800FF 83%, #FF0080 100%)" },
];

const CATEGORIES: { id: TabId; label: string; emoji: string }[] = [
  { id: "all",         label: "All items",     emoji: "🏠" },
  { id: "furniture",   label: "Furniture",     emoji: "🛋️" },
  { id: "decor",       label: "Decor",         emoji: "🌈" },
  { id: "outfit",      label: "Outfit",        emoji: "🎩" },
  { id: "special",     label: "Special",       emoji: "✨" },
  { id: "boxes",       label: "Mystery Boxes", emoji: "🎁" },
  { id: "backgrounds", label: "Backgrounds",   emoji: "🖼️" },
];

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
        <div className="w-full max-w-xs bg-white rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.2)]">
          <div className="relative flex flex-col items-center px-6 pt-6 pb-4 text-center border-b border-gray-100">
            <button onClick={onClose}
              className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">✕</button>
            <div className="text-5xl mb-3">{item.emoji}</div>
            <p className="font-black text-[22px] text-gray-900 -tracking-[0.02em]">{item.nameEn}</p>
            <p className="font-medium italic text-[13px] text-gray-400">{item.phonetic}</p>
            <p className="font-medium text-[13px] text-gray-500">{item.nameUa}</p>
          </div>

          <div className="px-5 py-4 flex flex-col gap-3">
            <p className="text-center font-medium text-xs text-gray-400">Type the English word to unlock</p>
            <div className={shake ? "animate-shake" : ""}>
              <input ref={inputRef} autoFocus type="text" value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={e => e.key === "Enter" && value.trim() && check()}
                placeholder={`Type "${item.nameEn}"…`}
                className={[
                  "w-full px-4 h-12 rounded-xl font-medium focus:outline-none text-[15px] text-gray-900 border-[1.5px]",
                  wrong ? "border-red-500 bg-rose-50" : "border-gray-200 bg-gray-50",
                ].join(" ")} />
            </div>
            {wrong && <p className="text-center font-bold text-xs text-red-500">Not quite — try again!</p>}

            <div className="flex items-center justify-between rounded-xl px-4 py-3 bg-gray-50 border border-gray-100">
              <span className="font-medium text-[13px] text-gray-500">Cost</span>
              <span className="font-black flex items-center gap-1.5 text-[15px] text-gray-900">
                <img src="/coin.png" alt="coin" width={18} height={18} className="object-contain" />
                {item.price}
              </span>
            </div>

            <div className="flex gap-2">
              <button onClick={onClose}
                className="flex-1 rounded-xl font-bold py-3 text-sm bg-gray-100 text-gray-500">
                Cancel
              </button>
              <button onClick={check} disabled={!value.trim()}
                className="flex-1 rounded-xl font-black text-white py-3 text-sm bg-gray-900 active:scale-95 transition-transform disabled:opacity-40">
                Unlock ✓
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ProductCard({ item, isBought, isLocked, canAfford, onBuyClick }: {
  item: ShopItem; isBought: boolean; isLocked: boolean;
  canAfford: boolean; onBuyClick: () => void;
}) {
  return (
    <div className={["group flex flex-col", isLocked ? "opacity-50" : "opacity-100"].join(" ")}>
      <div className={[
        "relative w-full rounded-xl overflow-hidden flex items-center justify-center aspect-square border-[1.5px]",
        isBought ? "bg-green-50 border-green-200" : "bg-gray-100 border-transparent",
      ].join(" ")}>
        {item.isNew && !isBought && !isLocked && (
          <div className="absolute top-2 left-2 rounded-full px-2 py-0.5 bg-gray-900">
            <span className="font-black text-white text-[8px] tracking-[0.08em]">NEW</span>
          </div>
        )}

        {item.customImageIdle ? (
          <img src={item.customImageIdle} alt={item.nameEn}
            className={["w-[70%] h-[70%] object-contain", isLocked && "grayscale"].filter(Boolean).join(" ")} />
        ) : (
          <span className={["text-[clamp(28px,5vw,44px)] leading-none", isLocked && "grayscale"].filter(Boolean).join(" ")}>
            {item.emoji}
          </span>
        )}

        {isBought && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center bg-green-500">
            <span className="font-black text-white text-[10px]">✓</span>
          </div>
        )}

        {!isBought && !isLocked && canAfford && (
          <button
            onClick={onBuyClick}
            className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-[15px] bg-white/95 shadow-[0_2px_8px_rgba(0,0,0,0.12)] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 active:scale-90 transition-all"
            aria-label={`Add ${item.nameEn} to cart`}
          >
            🛒
          </button>
        )}
      </div>

      <div className="mt-2 flex flex-col gap-0.5">
        <p className="font-black leading-tight text-[clamp(11px,1.4vw,14px)] text-gray-900 -tracking-[0.01em]">
          {item.nameEn}
        </p>
        <p className="font-medium italic leading-none text-[clamp(9px,1.1vw,11px)] text-gray-400">{item.phonetic}</p>
        <p className="font-medium leading-none text-[clamp(9px,1.1vw,11px)] text-gray-500">{item.nameUa}</p>

        <div className="flex items-center justify-between mt-1.5">
          <span className={[
            "font-black flex items-center gap-1 text-[clamp(10px,1.2vw,13px)]",
            isLocked ? "text-gray-400" : "text-gray-900",
          ].join(" ")}>
            {isLocked
              ? `🔒 ${item.levelRequired}`
              : <><img src="/coin.png" alt="coin" width={13} height={13} className="object-contain" />{item.price}</>
            }
          </span>
          {!isBought && !isLocked && canAfford && (
            <button
              onClick={onBuyClick}
              className="sm:hidden w-7 h-7 rounded-full flex items-center justify-center text-sm bg-gray-100 active:scale-90 transition-transform"
            >
              🛒
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BgCard({ item, isActive, canAfford, onBuy }: {
  item: BgItem; isActive: boolean; canAfford: boolean; onBuy: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={[
          "relative w-full rounded-2xl overflow-hidden aspect-video border-2",
          isActive
            ? "border-[2.5px] border-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.2)]"
            : "border-transparent shadow-[0_2px_8px_rgba(0,0,0,0.10)]",
        ].join(" ")}
        style={{ background: item.bgValue }}
      >
        {isActive && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center bg-green-500">
            <span className="font-black text-white text-[11px]">✓</span>
          </div>
        )}
        {item.price === 0 && !isActive && (
          <div className="absolute top-2 left-2 rounded-full px-2 py-0.5 bg-black/50">
            <span className="font-black text-white text-[8px] tracking-[0.08em]">FREE</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="font-black text-[13px] text-gray-900 -tracking-[0.01em]">{item.nameEn}</span>
          <span className="font-medium text-[11px] text-gray-500">{item.nameUa}</span>
        </div>

        {isActive ? (
          <span className="font-bold text-[11px] text-green-500">Active</span>
        ) : (
          <button
            onClick={onBuy}
            disabled={!canAfford}
            className={[
              "rounded-xl px-3 py-1.5 font-black text-white text-xs active:scale-95 transition-transform disabled:opacity-40",
              item.price === 0
                ? "bg-green-500 shadow-[0_3px_0_#16A34A]"
                : "bg-gray-900 shadow-[0_3px_0_#0F0F1A]",
            ].join(" ")}
          >
            {item.price === 0
              ? "Set Free"
              : <span className="flex items-center gap-1"><img src="/coin.png" alt="coin" width={12} height={12} className="object-contain" />{item.price}</span>}
          </button>
        )}
      </div>
    </div>
  );
}

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

type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';
type PickerChar = {
  id: string; nameEn: string; nameUa: string;
  rarity: Rarity; howToGet: string; unlocked: boolean;
};

const DRESS_CHARS: PickerChar[] = [
  { id: 'fox',     nameEn: 'Rusty', nameUa: 'Рустік', rarity: 'common',    howToGet: 'Starter',       unlocked: true  },
  { id: 'raccoon', nameEn: 'Rocky', nameUa: 'Роккі',  rarity: 'rare',      howToGet: '30-day streak', unlocked: true  },
  { id: 'cat',     nameEn: 'Luna',  nameUa: 'Луна',   rarity: 'uncommon',  howToGet: 'Silver Box',    unlocked: false },
  { id: 'rabbit',  nameEn: 'Pearl', nameUa: 'Перлина',rarity: 'rare',      howToGet: 'Gold Box',      unlocked: false },
  { id: 'dragon',  nameEn: 'Blaze', nameUa: 'Блейз',  rarity: 'legendary', howToGet: 'Legendary Box', unlocked: false },
];

const RARITY: Record<Rarity, { text: string; bg: string; border: string }> = {
  common:    { text: "text-gray-400",  bg: "bg-gray-50",   border: "border-gray-400"  },
  uncommon:  { text: "text-green-500", bg: "bg-green-50",  border: "border-green-500" },
  rare:      { text: "text-blue-500",  bg: "bg-blue-50",   border: "border-blue-500"  },
  legendary: { text: "text-amber-500", bg: "bg-amber-50",  border: "border-amber-500" },
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
    <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-white">
      {/* Character preview panel */}
      <div className="flex flex-col items-center gap-5 px-6 py-6 md:w-80 flex-shrink-0 overflow-y-auto border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50">
        <div className="text-center">
          <p className="font-black text-[17px] -tracking-[0.02em] text-gray-900">My Character</p>
          <p className="font-bold uppercase tracking-widest text-[9.5px] text-gray-400 mt-0.5">
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
              <div key={id}
                className="absolute pointer-events-none -translate-x-1/2 text-[32px] z-10 drop-shadow-[0_3px_6px_rgba(0,0,0,0.2)]"
                style={{ top: pos.top, left: pos.left }}>
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
                  className="bg-gray-100 border border-gray-200 rounded-[14px] px-2.5 py-1 text-[22px] active:scale-90 transition-transform">
                  {item.emoji}
                </button>
              ) : null;
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-400 font-semibold text-center">Tap an item below to equip</p>
        )}

        {/* Character picker */}
        <div className="w-full flex flex-col gap-2 pt-3 border-t border-gray-100">
          <p className="font-black uppercase tracking-widest text-[9.5px] text-gray-400">Персонаж</p>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {DRESS_CHARS.map(char => {
              const isActive = characterId === char.id;
              const rarity = RARITY[char.rarity];
              return (
                <button
                  key={char.id}
                  onClick={() => char.unlocked && selectCharacter(char.id)}
                  disabled={!char.unlocked}
                  title={char.unlocked ? char.nameEn : `🔒 ${char.howToGet}`}
                  className={[
                    "flex-shrink-0 flex flex-col items-center gap-1 rounded-xl p-1.5 active:scale-95 transition-all w-16 border-2",
                    isActive ? `${rarity.bg} ${rarity.border}` : "bg-white border-gray-100",
                    char.unlocked ? "opacity-100" : "opacity-45",
                  ].join(" ")}
                >
                  <div className={[
                    "w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden",
                    char.unlocked ? rarity.bg : "bg-gray-100 grayscale",
                  ].join(" ")}>
                    {char.unlocked
                      ? <CharacterAvatar characterId={char.id} emotion="idle" size={44} animate={false} />
                      : <span className="text-xl">🔒</span>
                    }
                  </div>
                  <span className={[
                    "font-black text-[9.5px]",
                    isActive ? rarity.text : "text-gray-500",
                  ].join(" ")}>
                    {char.nameEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Emotion preview */}
        <div className="w-full flex flex-col gap-2 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <p className="font-black uppercase tracking-widest text-[9.5px] text-gray-400">Емоції</p>
            <span className="font-bold text-[10px] text-gray-400">{availableEmotions.length} шт.</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {availableEmotions.map(em => {
              const isActive = previewEmotion === em.key;
              return (
                <button
                  key={em.key}
                  onClick={() => setPreviewEmotion(isActive ? 'idle' : em.key)}
                  className={[
                    "flex flex-col items-center gap-0.5 rounded-lg py-1.5 active:scale-90 transition-all border-[1.5px]",
                    isActive ? "bg-blue-50 border-secondary shadow-[0_0_0_2px_rgba(79,156,249,0.18)]" : "bg-white border-gray-100",
                  ].join(" ")}
                >
                  <span className="text-sm leading-none">{em.emoji}</span>
                  <span className={[
                    "font-bold text-[8.5px]",
                    isActive ? "text-secondary" : "text-gray-500",
                  ].join(" ")}>
                    {em.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Items grid */}
      <div className="flex-1 overflow-y-auto p-5 pb-24">
        <div className="flex gap-2 mb-5 p-1 rounded-2xl bg-gray-100">
          <button
            onClick={() => setInvSubTab("character")}
            className={[
              "flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all active:scale-95",
              invSubTab === "character" ? "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]" : "bg-transparent",
            ].join(" ")}
          >
            <span className="text-sm">👤</span>
            <span className={[
              "font-black text-[11px]",
              invSubTab === "character" ? "text-gray-900" : "text-gray-400",
            ].join(" ")}>
              Персонаж ({outfitItems.filter(i => ownedIds.has(i.id)).length})
            </span>
          </button>
          <button
            onClick={() => setInvSubTab("room")}
            className={[
              "flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all active:scale-95",
              invSubTab === "room" ? "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]" : "bg-transparent",
            ].join(" ")}
          >
            <span className="text-sm">🏠</span>
            <span className={[
              "font-black text-[11px]",
              invSubTab === "room" ? "text-gray-900" : "text-gray-400",
            ].join(" ")}>
              Кімната ({roomItems.length})
            </span>
          </button>
        </div>

        {invSubTab === "room" ? (
          <>
            <p className="font-black uppercase tracking-widest mb-4 text-[10px] text-gray-400">Для домівки</p>
            {roomItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <span className="text-5xl opacity-50">🛋️</span>
                <p className="font-bold text-sm text-gray-500">Поки нічого для домівки</p>
                <p className="text-xs text-gray-400">Купи меблі, декор або спеціальні предмети в магазині</p>
              </div>
            ) : (
              <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(100px,1fr))]">
                {roomItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onPlaceItem(item.id)}
                    className="flex flex-col items-center gap-1.5 rounded-2xl p-3 bg-primary/5 border border-primary/15 hover:border-primary/40 active:scale-95 transition-all text-center"
                  >
                    {item.customImageIdle ? (
                      <img src={item.customImageIdle} alt={item.nameEn} width={42} height={42} className="object-contain" />
                    ) : (
                      <span className="text-[34px] leading-none">{item.emoji}</span>
                    )}
                    <p className="font-black leading-tight text-[10px] text-gray-900">{item.nameEn}</p>
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
            <p className="font-black uppercase tracking-widest mb-4 text-[10px] text-gray-400">Outfit &amp; Accessories</p>

            <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(88px,1fr))]">
              {outfitItems.map(item => {
                const isOwned    = ownedIds.has(item.id);
                const isEquipped = equippedIds.includes(item.id);
                const isLocked   = !canUnlock(mockKidsUser.level, item.levelRequired);
                const canAfford  = balance >= item.price;

                return (
                  <div key={item.id}
                    className={[
                      "flex flex-col items-center gap-2 rounded-2xl p-3 cursor-pointer active:scale-95 transition-all select-none border-[1.5px]",
                      isEquipped
                        ? "bg-green-50 border-primary shadow-[0_0_12px_rgba(88,204,2,0.18)]"
                        : isOwned
                          ? "bg-gray-50 border-green-200"
                          : "bg-gray-50 border-gray-100",
                      isLocked ? "opacity-40" : "opacity-100",
                    ].join(" ")}
                    onClick={() => {
                      if (isLocked) return;
                      if (!isOwned) { onBuyItem(item); return; }
                      toggleEquip(item.id);
                    }}
                  >
                    <span className={["text-[30px]", isLocked && "grayscale"].filter(Boolean).join(" ")}>{item.emoji}</span>
                    <p className={[
                      "font-black text-center leading-tight text-[10px] -tracking-[0.01em]",
                      isEquipped ? "text-green-600" : "text-gray-700",
                    ].join(" ")}>
                      {item.nameEn}
                    </p>
                    {isEquipped && (
                      <span className="text-[7.5px] text-green-600 font-extrabold tracking-[0.06em]">EQUIPPED</span>
                    )}
                    {!isOwned && !isLocked && (
                      <div className="flex items-center gap-0.5">
                        <img src="/coin.png" alt="coin" width={10} height={10} className="object-contain" />
                        <span className={["text-[9px] font-bold", canAfford ? "text-amber-500" : "text-red-500"].join(" ")}>
                          {item.price}
                        </span>
                      </div>
                    )}
                    {isLocked && (
                      <span className="text-[9px] text-gray-400 font-bold">🔒 {item.levelRequired}</span>
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
    setToast(ok ? `"${buyItem.nameEn}" — додано в інвентар!` : "Not enough coins");
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
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop */}
        <div className="hidden md:flex flex-col flex-shrink-0 overflow-y-auto w-[200px] border-r border-gray-100">
          <div className="flex items-center gap-2 mx-4 mt-4 mb-2 rounded-xl px-3 py-2.5 bg-amber-50 border-[1.5px] border-amber-200">
            <img src="/coin.png" alt="coin" width={20} height={20} className="object-contain" />
            <div className="flex flex-col leading-none">
              <span className="text-[7.5px] text-amber-600 font-bold uppercase tracking-[0.07em]">Balance</span>
              <span className="font-black text-sm text-amber-800">{balance}</span>
            </div>
            <button onClick={() => setShowAdd(true)}
              className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center font-black text-base bg-gray-100 text-gray-700 active:scale-90 transition-transform">+</button>
          </div>

          <p className="px-5 mt-3 mb-2 font-black uppercase tracking-widest text-[10px] text-gray-400">Category</p>

          {CATEGORIES.map(cat => {
            const isActive = activeTab === cat.id;
            return (
              <button key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={[
                  "flex items-center gap-2.5 px-5 py-2.5 text-left transition-colors active:scale-95 border-l-[3px]",
                  isActive ? "bg-gray-100 border-gray-900" : "bg-transparent border-transparent",
                ].join(" ")}>
                <span className="text-base">{cat.emoji}</span>
                <span className={[
                  "flex-1 text-[13px]",
                  isActive ? "text-gray-900 font-extrabold" : "text-gray-500 font-medium",
                ].join(" ")}>
                  {cat.label}
                </span>
                <span className="font-medium text-[11px] text-gray-400">{counts[cat.id]}</span>
              </button>
            );
          })}

          <div className="mx-5 mt-3 pt-3 border-t border-gray-100">
            <p className="font-black uppercase tracking-widest mb-2 text-[10px] text-gray-400">Моє</p>
            <button
              onClick={() => setActiveTab("character")}
              className={[
                "flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-left transition-all active:scale-95 border-[1.5px]",
                activeTab === "character" ? "bg-purple-50 border-purple-200" : "bg-gray-50 border-gray-100",
              ].join(" ")}>
              <span className="text-lg">🎒</span>
              <span className={[
                "flex-1 text-[13px]",
                activeTab === "character" ? "text-purple-600 font-extrabold" : "text-gray-500 font-medium",
              ].join(" ")}>
                Інвентар
              </span>
              <span className="font-medium text-[11px] text-gray-400">{bought.size}</span>
            </button>
          </div>

          <div className="mx-5 mt-4 pt-4 border-t border-gray-100">
            <p className="font-black uppercase tracking-widest mb-3 text-[10px] text-gray-400">Filter</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={onlyAffordable}
                onChange={e => setOnlyAffordable(e.target.checked)}
                className="w-4 h-4 rounded" />
              <span className="font-medium text-[13px] text-gray-700">Can afford</span>
            </label>
          </div>
        </div>

        {/* Main */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Mobile header */}
          <div className="md:hidden border-b border-gray-100">
            <div className="flex items-center gap-3 px-4 py-2 pt-[env(safe-area-inset-top,8px)]">
              <div className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 bg-amber-50 border-[1.5px] border-amber-200">
                <img src="/coin.png" alt="coin" width={16} height={16} className="object-contain" />
                <span className="font-black text-[13px] text-amber-800">{balance}</span>
              </div>
              <button onClick={() => setShowAdd(true)}
                className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-lg bg-gray-100 text-gray-700 active:scale-90 transition-transform">+</button>
            </div>
            <div className="flex items-center gap-1.5 px-4 pb-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {CATEGORIES.map(cat => {
                const isActive = activeTab === cat.id;
                return (
                  <button key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={[
                      "flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all active:scale-95",
                      isActive ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500",
                    ].join(" ")}>
                    <span className="text-sm">{cat.emoji}</span>
                    <span className="font-bold text-[11px]">{cat.label}</span>
                  </button>
                );
              })}
              <div className="w-px h-5 flex-shrink-0 mx-1 bg-gray-200" />
              <button
                onClick={() => setActiveTab("character")}
                className={[
                  "flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all active:scale-95 border-[1.5px] border-purple-200",
                  activeTab === "character" ? "bg-purple-600 text-white" : "bg-purple-50 text-purple-600",
                ].join(" ")}>
                <span className="text-sm">🎒</span>
                <span className="font-bold text-[11px]">Інвентар ({bought.size})</span>
              </button>
            </div>
          </div>

          {/* Results bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
            <p className="font-medium text-xs text-gray-400">
              {activeTab === "boxes" ? "Mystery Boxes" : activeTab === "backgrounds" ? `${BACKGROUNDS.length} backgrounds` : `${visible.length} items`}
            </p>
            <label className="md:hidden flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={onlyAffordable}
                onChange={e => setOnlyAffordable(e.target.checked)}
                className="w-3.5 h-3.5" />
              <span className="font-medium text-[11px] text-gray-500">Can afford</span>
            </label>
          </div>

          {/* Content */}
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
                <div className="inline-flex items-center gap-2.5 rounded-2xl px-4 py-2.5 self-start bg-green-50 border-[1.5px] border-green-200">
                  <span className="text-lg">🖼️</span>
                  <p className="font-medium text-[13px] text-gray-700">
                    Обери фон — він одразу зміниться на головному екрані
                  </p>
                </div>
                <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))]">
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
                <span className="text-5xl">🎉</span>
                <p className="font-black text-base text-gray-900">All owned!</p>
                <p className="font-medium text-[13px] text-gray-400">You have everything in this category.</p>
              </div>
            ) : (
              <div className="grid gap-x-4 gap-y-6 grid-cols-[repeat(auto-fill,minmax(min(120px,45%),1fr))]">
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

      {buyItem && <BuyModal item={buyItem} onSuccess={handleSuccess} onClose={() => setBuyItem(null)} />}
      {openBox && <LootBoxModal boxType={openBox} balance={balance} onClose={() => setOpenBox(null)} onPurchase={handleBoxPurchase} />}
      {showAdd && <AddCustomModal onClose={() => setShowAdd(false)} />}

      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="rounded-2xl px-5 py-3 font-bold text-white text-[13px] whitespace-nowrap bg-gray-900/90 backdrop-blur-md">
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
