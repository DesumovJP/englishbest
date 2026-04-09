"use client";

import { useState } from "react";
import { mockKidsUser } from "@/mocks/user";
import {
  KidsPageHeader,
  KidsCoinBadge,
  KidsTabBar,
  KidsButton,
  KidsToast,
} from "@/components/kids/ui";
import type { KidsTab } from "@/components/kids/ui";

/* ── Types ─────────────────────────────────────────────────────── */
type TabId = "furniture" | "decor" | "outfit" | "special";

interface ShopItem {
  id: string;
  emoji: string;
  nameEn: string;
  nameUa: string;
  price: number;
  tab: TabId;
  hot?: boolean;
}

/* ── Data ───────────────────────────────────────────────────────── */
const ITEMS: ShopItem[] = [
  { id: "sofa",       emoji: "🛋️", nameEn: "Sofa",          nameUa: "Диван",           price: 80,  tab: "furniture" },
  { id: "wardrobe",   emoji: "🪞", nameEn: "Wardrobe",       nameUa: "Шафа",            price: 120, tab: "furniture", hot: true },
  { id: "bookshelf",  emoji: "📚", nameEn: "Bookshelf",      nameUa: "Книжкова полиця", price: 60,  tab: "furniture" },
  { id: "armchair",   emoji: "🪑", nameEn: "Armchair",       nameUa: "Крісло",          price: 90,  tab: "furniture" },
  { id: "globe",      emoji: "🌍", nameEn: "Globe",          nameUa: "Глобус",          price: 40,  tab: "decor" },
  { id: "aquarium",   emoji: "🐠", nameEn: "Aquarium",       nameUa: "Акваріум",        price: 150, tab: "decor", hot: true },
  { id: "rainbow",    emoji: "🌈", nameEn: "Rainbow poster", nameUa: "Постер",          price: 30,  tab: "decor" },
  { id: "clock",      emoji: "⏰", nameEn: "Clock",          nameUa: "Годинник",        price: 50,  tab: "decor" },
  { id: "hat",        emoji: "🎩", nameEn: "Top hat",        nameUa: "Циліндр",         price: 70,  tab: "outfit" },
  { id: "scarf",      emoji: "🧣", nameEn: "Scarf",          nameUa: "Шарф",            price: 45,  tab: "outfit" },
  { id: "glasses",    emoji: "🕶️", nameEn: "Sunglasses",     nameUa: "Окуляри",         price: 55,  tab: "outfit", hot: true },
  { id: "crown",      emoji: "👑", nameEn: "Crown",          nameUa: "Корона",          price: 200, tab: "outfit" },
  { id: "trophy",     emoji: "🏆", nameEn: "Trophy",         nameUa: "Кубок",           price: 300, tab: "special" },
  { id: "rocket",     emoji: "🚀", nameEn: "Rocket",         nameUa: "Ракета",          price: 250, tab: "special" },
  { id: "unicorn",    emoji: "🦄", nameEn: "Unicorn",        nameUa: "Єдиноріг",        price: 500, tab: "special", hot: true },
  { id: "dragon_egg", emoji: "🥚", nameEn: "Dragon egg",     nameUa: "Яйце дракона",    price: 400, tab: "special" },
];

/**
 * Tab definitions — color values reference design tokens in globals.css.
 * To change the shop palette: update globals.css, not this file.
 */
import type { KidsButtonVariant } from "@/components/kids/ui";

/** Tab → button variant map: ties tab color to a KidsButton design-token variant */
const TAB_VARIANT: Record<TabId, KidsButtonVariant> = {
  furniture: "secondary",
  decor:     "purple",
  outfit:    "accent",
  special:   "danger",
};

const TABS: KidsTab[] = [
  { id: "furniture", label: "Меблі",    emoji: "🛋️", color: "var(--color-secondary)", colorDark: "var(--color-secondary-dark)", colorLight: "#e0f7ff" },
  { id: "decor",     label: "Декор",    emoji: "🌈", color: "var(--color-purple)",    colorDark: "var(--color-purple-dark)",    colorLight: "#f5edff" },
  { id: "outfit",    label: "Одяг",     emoji: "🎩", color: "var(--color-accent)",    colorDark: "var(--color-accent-dark)",    colorLight: "#fff4e0" },
  { id: "special",   label: "Особливі", emoji: "✨", color: "var(--color-danger)",    colorDark: "var(--color-danger-dark)",    colorLight: "#ffe4e4" },
];

/* ── Shop Item Card ─────────────────────────────────────────────── */
interface ShopItemCardProps {
  item: ShopItem;
  isBought: boolean;
  canAfford: boolean;
  deficit: number;
  buyVariant: KidsButtonVariant;
  onBuy: () => void;
}

function ShopItemCard({
  item,
  isBought,
  canAfford,
  deficit,
  buyVariant,
  onBuy,
}: ShopItemCardProps) {
  const isSpecial = item.tab === "special";

  return (
    <div
      className={[
        "flex flex-col rounded-3xl overflow-hidden transition-transform hover:scale-[1.02] shadow-card",
        isBought  ? "bg-primary/5 border-2 border-primary/30" :
        isSpecial ? "border-2 border-coin bg-shop-rare"       :
                    "bg-surface border-2 border-border",
      ].join(" ")}
    >
      {/* Badges */}
      <div className="flex justify-between items-start px-3 pt-3 min-h-[28px]">
        {item.hot && !isBought
          ? <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-danger text-white">🔥 HOT</span>
          : <span />}
        {isSpecial && !isBought
          ? <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-coin text-white">✨ RARE</span>
          : <span />}
      </div>

      {/* Emoji */}
      <div className="flex justify-center py-4">
        <span
          className={`text-[72px] leading-none select-none ${!isBought && !canAfford ? "grayscale-[60%] opacity-60" : ""}`}
        >
          {item.emoji}
        </span>
      </div>

      {/* Info */}
      <div className="px-4 pb-4 flex flex-col gap-2">
        <div className="text-center">
          <p className="font-black text-sm text-ink leading-tight">{item.nameUa}</p>
          <p className="text-xs font-bold text-ink-faint">{item.nameEn}</p>
        </div>

        <div className="flex items-center justify-center gap-1.5">
          <span className="text-lg leading-none">🪙</span>
          <span className="font-black text-base text-coin">{item.price}</span>
        </div>

        {/* Action button */}
        {isBought ? (
          <div className="w-full py-2.5 rounded-2xl text-center font-black text-sm bg-primary/10 text-primary">
            ✅ Куплено!
          </div>
        ) : canAfford ? (
          <KidsButton size="sm" fullWidth variant={buyVariant} onClick={onBuy}>
            Купити
          </KidsButton>
        ) : (
          <div className="w-full py-2.5 rounded-2xl text-center font-black text-xs text-ink-faint bg-surface-muted border-2 border-dashed border-border cursor-not-allowed">
            🔒 Ще {deficit} 🪙
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function ShopPage() {
  const user = mockKidsUser;
  const [activeTabId, setActiveTabId] = useState<TabId>("furniture");
  const [bought, setBought] = useState<Set<string>>(new Set());
  const [balance, setBalance] = useState(user.coins);
  const [toast, setToast] = useState<string | null>(null);

  const activeTab = TABS.find(t => t.id === activeTabId)!;
  const visible = ITEMS.filter(i => i.tab === activeTabId);

  function handleBuy(item: ShopItem) {
    if (bought.has(item.id) || balance < item.price) return;
    setBought(prev => new Set([...prev, item.id]));
    setBalance(b => b - item.price);
    setToast(`${item.emoji} ${item.nameUa} тепер твоє! 🎉`);
    setTimeout(() => setToast(null), 2500);
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">

      <KidsPageHeader
        title="🛒 Магазин"
        subtitle={`Куплено ${bought.size} з ${ITEMS.length}`}
        backHref="/kids/dashboard"
        right={<KidsCoinBadge amount={balance} />}
      />

      {/* Tab bar */}
      <div className="bg-surface border-b-2 border-border">
        <KidsTabBar
          tabs={TABS}
          active={activeTabId}
          onSelect={id => setActiveTabId(id as TabId)}
          getCount={id => {
            const total = ITEMS.filter(i => i.tab === id).length;
            const done  = ITEMS.filter(i => i.tab === id && bought.has(i.id)).length;
            return `${done}/${total}`;
          }}
          className="pt-3"
        />
      </div>

      {/* Grid */}
      <div className="flex-1 px-4 py-5 md:px-6 lg:px-8">
        {/* Section label */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-6 rounded-full" style={{ background: activeTab.color }} />
          <p className="font-black text-base text-ink">{activeTab.emoji} {activeTab.label}</p>
        </div>

        {visible.every(i => bought.has(i.id)) ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-6xl">🎉</span>
            <p className="font-black text-xl text-ink">Все куплено!</p>
            <p className="text-sm font-bold text-ink-faint">У цій категорії більше нічого немає</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visible.map(item => (
              <ShopItemCard
                key={item.id}
                item={item}
                isBought={bought.has(item.id)}
                canAfford={balance >= item.price}
                deficit={item.price - balance}
                buyVariant={TAB_VARIANT[activeTabId]}
                onBuy={() => handleBuy(item)}
              />
            ))}
          </div>
        )}
      </div>

      <KidsToast message={toast} />
    </div>
  );
}
