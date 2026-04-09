"use client";

import { useState, useRef } from "react";
import { mockKidsUser, type Level } from "@/mocks/user";
import {
  KidsPageHeader,
  KidsCoinBadge,
  KidsTabBar,
  KidsButton,
  KidsToast,
} from "@/components/kids/ui";
import type { KidsTab, KidsButtonVariant } from "@/components/kids/ui";

/* ── Types ─────────────────────────────────────────────────────── */
type TabId = "furniture" | "decor" | "outfit" | "special";

interface ShopItem {
  id: string;
  emoji: string;
  nameEn: string;
  nameUa: string;
  price: number;
  tab: TabId;
  levelRequired: Level;
  hot?: boolean;
}

/* ── Level ordering ─────────────────────────────────────────────── */
const LEVEL_ORDER: Level[] = ["A1", "A2", "B1", "B2", "C1"];
function canUnlock(userLevel: Level, required: Level) {
  return LEVEL_ORDER.indexOf(userLevel) >= LEVEL_ORDER.indexOf(required);
}

/* ── Data ───────────────────────────────────────────────────────── */
const ITEMS: ShopItem[] = [
  { id: "sofa",       emoji: "🛋️", nameEn: "Sofa",          nameUa: "Диван",           price: 80,  tab: "furniture", levelRequired: "A1" },
  { id: "wardrobe",   emoji: "🪞", nameEn: "Wardrobe",       nameUa: "Шафа",            price: 120, tab: "furniture", levelRequired: "A2", hot: true },
  { id: "bookshelf",  emoji: "📚", nameEn: "Bookshelf",      nameUa: "Книжкова полиця", price: 60,  tab: "furniture", levelRequired: "A1" },
  { id: "armchair",   emoji: "🪑", nameEn: "Armchair",       nameUa: "Крісло",          price: 90,  tab: "furniture", levelRequired: "A1" },
  { id: "globe",      emoji: "🌍", nameEn: "Globe",          nameUa: "Глобус",          price: 40,  tab: "decor",     levelRequired: "A1" },
  { id: "aquarium",   emoji: "🐠", nameEn: "Aquarium",       nameUa: "Акваріум",        price: 150, tab: "decor",     levelRequired: "A2", hot: true },
  { id: "rainbow",    emoji: "🌈", nameEn: "Rainbow poster", nameUa: "Постер-веселка",  price: 30,  tab: "decor",     levelRequired: "A1" },
  { id: "clock",      emoji: "⏰", nameEn: "Clock",          nameUa: "Годинник",        price: 50,  tab: "decor",     levelRequired: "A1" },
  { id: "hat",        emoji: "🎩", nameEn: "Top hat",        nameUa: "Циліндр",         price: 70,  tab: "outfit",    levelRequired: "A1" },
  { id: "scarf",      emoji: "🧣", nameEn: "Scarf",          nameUa: "Шарф",            price: 45,  tab: "outfit",    levelRequired: "A1" },
  { id: "glasses",    emoji: "🕶️", nameEn: "Sunglasses",     nameUa: "Окуляри",         price: 55,  tab: "outfit",    levelRequired: "A2", hot: true },
  { id: "crown",      emoji: "👑", nameEn: "Crown",          nameUa: "Корона",          price: 200, tab: "outfit",    levelRequired: "B1" },
  { id: "trophy",     emoji: "🏆", nameEn: "Trophy",         nameUa: "Кубок",           price: 300, tab: "special",   levelRequired: "A2" },
  { id: "rocket",     emoji: "🚀", nameEn: "Rocket",         nameUa: "Ракета",          price: 250, tab: "special",   levelRequired: "B1" },
  { id: "unicorn",    emoji: "🦄", nameEn: "Unicorn",        nameUa: "Єдиноріг",        price: 500, tab: "special",   levelRequired: "B2", hot: true },
  { id: "dragon_egg", emoji: "🥚", nameEn: "Dragon egg",     nameUa: "Яйце дракона",    price: 400, tab: "special",   levelRequired: "B1" },
];

const TAB_VARIANT: Record<TabId, KidsButtonVariant> = {
  furniture: "secondary",
  decor:     "purple",
  outfit:    "accent",
  special:   "danger",
};

const TABS: KidsTab[] = [
  { id: "furniture", label: "Furniture", emoji: "🛋️", color: "var(--color-secondary)", colorDark: "var(--color-secondary-dark)", colorLight: "#e0f7ff" },
  { id: "decor",     label: "Decor",     emoji: "🌈", color: "var(--color-purple)",    colorDark: "var(--color-purple-dark)",    colorLight: "#f5edff" },
  { id: "outfit",    label: "Outfit",    emoji: "🎩", color: "var(--color-accent)",    colorDark: "var(--color-accent-dark)",    colorLight: "#fff4e0" },
  { id: "special",   label: "Special",   emoji: "✨", color: "var(--color-danger)",    colorDark: "var(--color-danger-dark)",    colorLight: "#ffe4e4" },
];

/* ── Buy challenge modal ────────────────────────────────────────── */
function BuyChallenge({
  item,
  variant,
  onSuccess,
  onClose,
}: {
  item: ShopItem;
  variant: KidsButtonVariant;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");
  const [shake, setShake] = useState(false);
  const [wrong, setWrong] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function check() {
    const answer = value.trim().toLowerCase().replace(/\s+/g, " ");
    const correct = item.nameEn.toLowerCase();
    if (answer === correct) {
      onSuccess();
    } else {
      setWrong(true);
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setTimeout(() => setWrong(false), 1800);
      setValue("");
      inputRef.current?.focus();
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-sm animate-pop-in">

          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 text-center border-b border-border">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-muted text-ink-muted hover:text-ink transition-colors"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <span className="text-6xl leading-none block mb-3">{item.emoji}</span>
            <p className="type-label text-ink-muted mb-1">Type in English</p>
            <p className="text-3xl font-black text-ink">{item.nameUa}</p>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <div className={shake ? "animate-shake" : ""}>
              <input
                ref={inputRef}
                autoFocus
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && value.trim()) check(); }}
                placeholder="Type here…"
                className={[
                  "w-full h-13 px-4 rounded-2xl border-2 text-base font-bold text-ink focus:outline-none transition-all",
                  wrong
                    ? "border-danger bg-danger/5 focus:ring-4 focus:ring-danger/15"
                    : "border-border bg-surface-muted focus:border-primary focus:ring-4 focus:ring-primary/10",
                ].join(" ")}
              />
            </div>

            <div className="h-6 flex items-center justify-center mt-1.5">
              {wrong && (
                <p className="text-sm font-black text-danger animate-fade-in-up">
                  Try again!
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 mt-1 mb-5">
              <span className="text-base leading-none">🪙</span>
              <span className="font-black text-base text-coin">{item.price}</span>
              <span className="text-sm text-ink-muted font-bold">will be spent</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 h-12 rounded-2xl border-2 border-border font-black text-sm text-ink-muted hover:border-ink-muted hover:text-ink transition-colors"
              >
                Cancel
              </button>
              <div className="flex-1">
                <KidsButton
                  variant={variant}
                  size="md"
                  fullWidth
                  onClick={check}
                  disabled={!value.trim()}
                  className="h-12 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-y-0"
                >
                  Check ✓
                </KidsButton>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

/* ── Item card ──────────────────────────────────────────────────── */
function ShopItemCard({
  item,
  isBought,
  isLocked,
  canAfford,
  deficit,
  variant,
  onBuyClick,
}: {
  item: ShopItem;
  isBought: boolean;
  isLocked: boolean;
  canAfford: boolean;
  deficit: number;
  variant: KidsButtonVariant;
  onBuyClick: () => void;
}) {
  const isSpecial = item.tab === "special";
  const available = !isBought && !isLocked && canAfford;
  const dimmed = !isBought && (isLocked || !canAfford);

  return (
    <div
      className={[
        "flex flex-col rounded-3xl overflow-hidden shadow-card transition-all",
        isBought        ? "bg-primary/5 border-2 border-primary/30"                         :
        isLocked        ? "bg-surface-muted border-2 border-dashed border-border"           :
        isSpecial       ? "bg-shop-rare border-2 border-coin"                               :
        available       ? "bg-surface border-2 border-border hover:border-primary/30 hover:shadow-card-md hover:-translate-y-0.5" :
                          "bg-surface border-2 border-dashed border-border",
      ].join(" ")}
    >
      {/* Badges */}
      <div className="flex justify-between items-start px-3 pt-3 h-7 shrink-0">
        {item.hot && !isBought && !isLocked
          ? <span className="type-tiny px-2 py-0.5 rounded-full bg-danger text-white">🔥 HOT</span>
          : <span />}
        {isSpecial && !isBought && !isLocked
          ? <span className="type-tiny px-2 py-0.5 rounded-full bg-coin text-white">✨ RARE</span>
          : <span />}
      </div>

      {/* Emoji */}
      <div className="flex justify-center py-5">
        <span className={`text-[68px] leading-none select-none ${dimmed ? "grayscale opacity-40" : ""}`}>
          {item.emoji}
        </span>
      </div>

      {/* Info */}
      <div className="px-4 pb-5 flex flex-col gap-3 flex-1">

        {/* Names — EN first (learning context) */}
        <div className="text-center">
          <p className={`font-black text-base leading-tight ${isLocked ? "text-ink-muted" : "text-ink"}`}>
            {item.nameEn}
          </p>
          <p className="text-xs font-bold text-ink-faint mt-0.5">{item.nameUa}</p>
        </div>

        {/* Price row */}
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-lg leading-none">🪙</span>
          <span className={`font-black text-base ${!dimmed ? "text-coin" : "text-ink-faint"}`}>
            {item.price}
          </span>
        </div>

        {/* Level badge — only when locked */}
        {isLocked && (
          <div className="flex justify-center">
            <span className="type-tiny bg-surface border border-border rounded-full px-3 py-1 text-ink-muted">
              🔒 Needs level {item.levelRequired}
            </span>
          </div>
        )}

        {/* Action */}
        <div className="mt-auto">
          {isBought ? (
            <div className="w-full py-2.5 rounded-2xl text-center font-black text-sm bg-primary/10 text-primary">
              ✅ Bought!
            </div>
          ) : isLocked ? (
            <div className="w-full py-2.5 rounded-2xl text-center font-black text-xs text-ink-faint bg-surface border border-border cursor-not-allowed">
              Keep studying! 📚
            </div>
          ) : !canAfford ? (
            <div className="w-full py-2.5 rounded-2xl text-center font-black text-xs text-ink-faint bg-surface-muted border-2 border-dashed border-border cursor-not-allowed">
              🪙 +{deficit} more
            </div>
          ) : (
            <KidsButton size="sm" fullWidth variant={variant} onClick={onBuyClick}>
              Buy 🛒
            </KidsButton>
          )}
        </div>

      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function ShopPage() {
  const user = mockKidsUser;
  const userLevel = user.level;

  const [activeTabId, setActiveTabId] = useState<TabId>("furniture");
  const [bought, setBought] = useState<Set<string>>(new Set());
  const [balance, setBalance] = useState(user.coins);
  const [toast, setToast] = useState<string | null>(null);
  const [challenging, setChallenging] = useState<ShopItem | null>(null);

  const activeTab = TABS.find(t => t.id === activeTabId)!;
  const visible = ITEMS.filter(i => i.tab === activeTabId);

  function handleSuccess() {
    if (!challenging) return;
    setBought(prev => new Set([...prev, challenging.id]));
    setBalance(b => b - challenging.price);
    setToast(`${challenging.emoji} ${challenging.nameEn} — yours! 🎉`);
    setTimeout(() => setToast(null), 3000);
    setChallenging(null);
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">

      <KidsPageHeader
        title="Shop 🛒"
        subtitle={`${bought.size} / ${ITEMS.length} bought`}
        backHref="/kids/dashboard"
        right={<KidsCoinBadge amount={balance} />}
      />

      {/* Tabs */}
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
      <div className="flex-1 px-4 py-5 md:px-6">

        {/* Section header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-6 rounded-full" style={{ background: activeTab.color }} />
          <p className="font-black text-base text-ink">{activeTab.emoji} {activeTab.label}</p>
          <span className="ml-auto type-tiny text-ink-muted">
            {visible.filter(i => bought.has(i.id)).length}/{visible.length} bought
          </span>
        </div>

        {visible.every(i => bought.has(i.id)) ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-6xl">🎉</span>
            <p className="font-black text-xl text-ink">All bought!</p>
            <p className="text-sm font-bold text-ink-faint">Nothing left in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visible.map(item => {
              const isLocked = !canUnlock(userLevel, item.levelRequired);
              const canAfford = balance >= item.price;
              return (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  isBought={bought.has(item.id)}
                  isLocked={isLocked}
                  canAfford={canAfford}
                  deficit={item.price - balance}
                  variant={TAB_VARIANT[activeTabId]}
                  onBuyClick={() => setChallenging(item)}
                />
              );
            })}
          </div>
        )}

      </div>

      {/* Buy challenge */}
      {challenging && (
        <BuyChallenge
          item={challenging}
          variant={TAB_VARIANT[challenging.tab]}
          onSuccess={handleSuccess}
          onClose={() => setChallenging(null)}
        />
      )}

      <KidsToast message={toast} />

    </div>
  );
}
