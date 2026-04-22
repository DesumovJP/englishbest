"use client";

/**
 * AddCustomModal
 * Toca Boca-style bottom sheet with 3 tabs:
 *   📦 Add Item  — name EN/UA, category, emoji, price, idle/hover/active images
 *   🏠 Add Room  — name EN/UA, coins required, background image
 *   🐾 Add Character — name EN/UA, fallback animal, per-mood images
 *
 * All data saved to IndexedDB via kids-store.
 */

import { useState, useRef } from "react";
import {
  itemsStore,
  roomsStore,
  charactersStore,
  fileToBase64,
  generateId,
  emitKidsEvent,
  CustomItem,
  CustomRoom,
  CustomCharacter,
  ItemCategory,
  CharacterMood,
  AnimalKind,
} from "@/lib/kids-store";

// ─── Types ─────────────────────────────────────────────────────────────────

type TabId = "item" | "room" | "character";

interface AddCustomModalProps {
  onClose: () => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const ALL_MOODS: { id: CharacterMood; label: string; emoji: string }[] = [
  { id: "happy",       label: "Happy",       emoji: "😊" },
  { id: "excited",     label: "Excited",     emoji: "🤩" },
  { id: "neutral",     label: "Neutral",     emoji: "😐" },
  { id: "thinking",    label: "Thinking",    emoji: "🤔" },
  { id: "surprised",   label: "Surprised",   emoji: "😲" },
  { id: "sleepy",      label: "Sleepy",      emoji: "😴" },
  { id: "proud",       label: "Proud",       emoji: "😎" },
  { id: "sad",         label: "Sad",         emoji: "😢" },
  { id: "confused",    label: "Confused",    emoji: "😵‍💫" },
  { id: "celebrating", label: "Celebrating", emoji: "🥳" },
];

const ANIMALS: { id: AnimalKind; label: string; emoji: string }[] = [
  { id: "fox",     label: "Fox",     emoji: "🦊" },
  { id: "cat",     label: "Cat",     emoji: "🐱" },
  { id: "dragon",  label: "Dragon",  emoji: "🐲" },
  { id: "rabbit",  label: "Rabbit",  emoji: "🐰" },
  { id: "raccoon", label: "Raccoon", emoji: "🦝" },
  { id: "frog",    label: "Frog",    emoji: "🐸" },
];

const CATEGORIES: { id: ItemCategory; label: string; emoji: string }[] = [
  { id: "furniture", label: "Furniture", emoji: "🛋️" },
  { id: "decor",     label: "Decor",     emoji: "🪴" },
  { id: "outfit",    label: "Outfit",    emoji: "👒" },
  { id: "special",   label: "Special",   emoji: "⭐" },
];

// ─── ImageUpload mini-component ────────────────────────────────────────────

function ImageUpload({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | undefined;
  onChange: (dataUrl: string | undefined) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToBase64(file);
    onChange(dataUrl);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-16 h-16 rounded-2xl border-[3px] border-dashed border-kid-border bg-kid-bg flex items-center justify-center overflow-hidden transition-all hover:border-secondary active:scale-95"
      >
        {value ? (
          <img src={value} alt={label} className="w-full h-full object-contain" />
        ) : (
          <span className="text-2xl text-ink-muted">+</span>
        )}
      </button>
      <span className="text-[10px] font-bold text-ink-muted">{label}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/gif,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFile}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="text-[9px] font-bold text-red-400 hover:text-red-600"
        >
          Remove
        </button>
      )}
    </div>
  );
}

// ─── Tab: Add Item ─────────────────────────────────────────────────────────

function AddItemTab({ onDone }: { onDone: () => void }) {
  const [nameEn,    setNameEn]    = useState("");
  const [nameUa,    setNameUa]    = useState("");
  const [category,  setCategory]  = useState<ItemCategory>("furniture");
  const [emoji,     setEmoji]     = useState("🪑");
  const [price,     setPrice]     = useState(50);
  const [imgIdle,   setImgIdle]   = useState<string | undefined>();
  const [imgHover,  setImgHover]  = useState<string | undefined>();
  const [imgActive, setImgActive] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!nameEn.trim()) return;
    setSaving(true);
    const item: CustomItem = {
      id: generateId("item"),
      nameEn: nameEn.trim(),
      nameUa: nameUa.trim() || nameEn.trim(),
      category,
      emojiFallback: emoji,
      price,
      imageIdle:   imgIdle,
      imageHover:  imgHover,
      imageActive: imgActive,
      createdAt: Date.now(),
    };
    await itemsStore.put(item);
    emitKidsEvent("kids:items-changed");
    setSaving(false);
    onDone();
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Name fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-black text-ink-muted mb-1 uppercase tracking-wide">
            Name EN
          </label>
          <input
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="Bed"
            className="w-full rounded-xl border-2 border-kid-border px-3 py-2.5 text-sm font-bold bg-kid-bg focus:border-secondary focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-black text-ink-muted mb-1 uppercase tracking-wide">
            Назва UA
          </label>
          <input
            value={nameUa}
            onChange={(e) => setNameUa(e.target.value)}
            placeholder="Ліжко"
            className="w-full rounded-xl border-2 border-kid-border px-3 py-2.5 text-sm font-bold bg-kid-bg focus:border-secondary focus:outline-none"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-black text-ink-muted mb-2 uppercase tracking-wide">
          Category
        </label>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black border-2 transition-all ${
                category === cat.id
                  ? "border-secondary bg-blue-50 text-secondary"
                  : "border-kid-border bg-kid-bg text-ink-muted"
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Emoji + price */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-black text-ink-muted mb-1 uppercase tracking-wide">
            Emoji fallback
          </label>
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            className="w-full rounded-xl border-2 border-kid-border px-3 py-2.5 text-lg font-bold bg-kid-bg focus:border-secondary focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-black text-ink-muted mb-1 uppercase tracking-wide">
            Price 🪙
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            min={0}
            className="w-full rounded-xl border-2 border-kid-border px-3 py-2.5 text-sm font-bold bg-kid-bg focus:border-secondary focus:outline-none"
          />
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="block text-xs font-black text-ink-muted mb-2 uppercase tracking-wide">
          Images (PNG / GIF)
        </label>
        <div className="flex gap-4 justify-center bg-kid-bg rounded-2xl p-4">
          <ImageUpload label="Idle"   value={imgIdle}   onChange={setImgIdle} />
          <ImageUpload label="Hover"  value={imgHover}  onChange={setImgHover} />
          <ImageUpload label="Active" value={imgActive} onChange={setImgActive} />
        </div>
        <p className="text-[10px] font-bold text-ink-muted text-center mt-1">
          Only Idle is required. Hover/Active are optional.
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={!nameEn.trim() || saving}
        className="tk-btn tk-btn-green w-full disabled:opacity-50"
      >
        {saving ? "Saving…" : "✅ Add Item"}
      </button>
    </div>
  );
}

// ─── Tab: Add Room ─────────────────────────────────────────────────────────

function AddRoomTab({ onDone }: { onDone: () => void }) {
  const [nameEn, setNameEn] = useState("");
  const [nameUa, setNameUa] = useState("");
  const [coins,  setCoins]  = useState(500);
  const [bgImg,  setBgImg]  = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!nameEn.trim()) return;
    setSaving(true);
    const room: CustomRoom = {
      id: generateId("room"),
      nameEn: nameEn.trim(),
      nameUa: nameUa.trim() || nameEn.trim(),
      coinsRequired: coins,
      backgroundImage: bgImg,
      createdAt: Date.now(),
    };
    await roomsStore.put(room);
    emitKidsEvent("kids:rooms-changed");
    setSaving(false);
    onDone();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-black text-ink-muted mb-1 uppercase tracking-wide">
            Name EN
          </label>
          <input
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="Library"
            className="w-full rounded-xl border-2 border-kid-border px-3 py-2.5 text-sm font-bold bg-kid-bg focus:border-secondary focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-black text-ink-muted mb-1 uppercase tracking-wide">
            Назва UA
          </label>
          <input
            value={nameUa}
            onChange={(e) => setNameUa(e.target.value)}
            placeholder="Бібліотека"
            className="w-full rounded-xl border-2 border-kid-border px-3 py-2.5 text-sm font-bold bg-kid-bg focus:border-secondary focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-black text-ink-muted mb-1 uppercase tracking-wide">
          Coins to unlock 🪙
        </label>
        <input
          type="number"
          value={coins}
          onChange={(e) => setCoins(Number(e.target.value))}
          min={0}
          className="w-full rounded-xl border-2 border-kid-border px-3 py-2.5 text-sm font-bold bg-kid-bg focus:border-secondary focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-black text-ink-muted mb-2 uppercase tracking-wide">
          Background image
        </label>
        <div className="flex justify-center bg-kid-bg rounded-2xl p-4">
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const el = document.createElement("input");
                el.type = "file";
                el.accept = "image/*";
                el.onchange = async (ev) => {
                  const file = (ev.target as HTMLInputElement).files?.[0];
                  if (file) setBgImg(await fileToBase64(file));
                };
                el.click();
              }}
              className="w-48 h-28 rounded-2xl border-[3px] border-dashed border-kid-border flex items-center justify-center overflow-hidden"
            >
              {bgImg ? (
                <img src={bgImg} alt="bg" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <div className="text-3xl">🏠</div>
                  <p className="text-xs font-bold text-ink-muted mt-1">Tap to upload</p>
                </div>
              )}
            </button>
            {bgImg && (
              <button
                type="button"
                onClick={() => setBgImg(undefined)}
                className="text-xs font-bold text-red-400"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={!nameEn.trim() || saving}
        className="tk-btn tk-btn-purple w-full disabled:opacity-50"
      >
        {saving ? "Saving…" : "🏠 Add Room"}
      </button>
    </div>
  );
}

// ─── Tab: Add Character ─────────────────────────────────────────────────────

function AddCharacterTab({ onDone }: { onDone: () => void }) {
  const [nameEn,  setNameEn]  = useState("");
  const [nameUa,  setNameUa]  = useState("");
  const [animal,  setAnimal]  = useState<AnimalKind>("fox");
  const [rarity,  setRarity]  = useState<CustomCharacter["rarity"]>("common");
  const [moodImgs, setMoodImgs] = useState<Partial<Record<CharacterMood, string>>>({});
  const [saving, setSaving] = useState(false);

  function setMoodImg(mood: CharacterMood, val: string | undefined) {
    setMoodImgs((prev) => {
      const next = { ...prev };
      if (val) next[mood] = val;
      else delete next[mood];
      return next;
    });
  }

  async function handleSave() {
    if (!nameEn.trim()) return;
    setSaving(true);
    const char: CustomCharacter = {
      id: generateId("char"),
      nameEn: nameEn.trim(),
      nameUa: nameUa.trim() || nameEn.trim(),
      animalFallback: animal,
      rarity,
      moodImages: moodImgs,
      createdAt: Date.now(),
    };
    await charactersStore.put(char);
    emitKidsEvent("kids:characters-changed");
    setSaving(false);
    onDone();
  }

  const RARITIES: Array<{ id: CustomCharacter["rarity"]; label: string; color: string }> = [
    { id: "common",    label: "Common",    color: "#9ca3af" },
    { id: "uncommon",  label: "Uncommon",  color: "#16a34a" },
    { id: "rare",      label: "Rare",      color: "#2563eb" },
    { id: "legendary", label: "Legendary", color: "#d97706" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-black text-ink-muted mb-1 uppercase tracking-wide">
            Name EN
          </label>
          <input
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="Luna"
            className="w-full rounded-xl border-2 border-kid-border px-3 py-2.5 text-sm font-bold bg-kid-bg focus:border-secondary focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-black text-ink-muted mb-1 uppercase tracking-wide">
            Ім&apos;я UA
          </label>
          <input
            value={nameUa}
            onChange={(e) => setNameUa(e.target.value)}
            placeholder="Луна"
            className="w-full rounded-xl border-2 border-kid-border px-3 py-2.5 text-sm font-bold bg-kid-bg focus:border-secondary focus:outline-none"
          />
        </div>
      </div>

      {/* Animal fallback */}
      <div>
        <label className="block text-xs font-black text-ink-muted mb-2 uppercase tracking-wide">
          SVG Fallback
        </label>
        <div className="flex gap-2 flex-wrap">
          {ANIMALS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAnimal(a.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black border-2 transition-all ${
                animal === a.id
                  ? "border-secondary bg-blue-50 text-secondary"
                  : "border-kid-border bg-kid-bg text-ink-muted"
              }`}
            >
              {a.emoji} {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rarity */}
      <div>
        <label className="block text-xs font-black text-ink-muted mb-2 uppercase tracking-wide">
          Rarity
        </label>
        <div className="flex gap-2 flex-wrap">
          {RARITIES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRarity(r.id)}
              className={`px-3 py-2 rounded-xl text-xs font-black border-2 transition-all ${
                rarity === r.id ? "text-white" : "bg-kid-bg text-ink-muted"
              }`}
              style={{
                borderColor: rarity === r.id ? r.color : undefined,
                background: rarity === r.id ? r.color : undefined,
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Per-mood images */}
      <div>
        <label className="block text-xs font-black text-ink-muted mb-2 uppercase tracking-wide">
          Images per mood (PNG / GIF)
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 bg-kid-bg rounded-2xl p-4">
          {ALL_MOODS.map((m) => (
            <div key={m.id} className="flex flex-col items-center gap-1">
              <span className="text-lg">{m.emoji}</span>
              <ImageUpload
                label={m.label}
                value={moodImgs[m.id]}
                onChange={(val) => setMoodImg(m.id, val)}
              />
            </div>
          ))}
        </div>
        <p className="text-[10px] font-bold text-ink-muted text-center mt-1">
          Leave empty to use SVG fallback for that mood.
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={!nameEn.trim() || saving}
        className="tk-btn tk-btn-pink w-full disabled:opacity-50"
      >
        {saving ? "Saving…" : "🐾 Add Character"}
      </button>
    </div>
  );
}

// ─── Main Modal ─────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; emoji: string; color: string }[] = [
  { id: "item",      label: "Item",      emoji: "📦", color: "#1CB0F6" },
  { id: "room",      label: "Room",      emoji: "🏠", color: "#CE82FF" },
  { id: "character", label: "Character", emoji: "🐾", color: "#FF4081" },
];

export default function AddCustomModal({ onClose }: AddCustomModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("item");

  return (
    <div className="tk-modal-overlay" onClick={onClose}>
      <div
        className="tk-modal-sheet w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h2 className="text-xl font-black text-kid-ink">Add Custom ✨</h2>
            <p className="text-xs font-bold text-ink-muted">
              Saved locally — works on prod
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-kid-bg border-2 border-kid-border flex items-center justify-center text-ink-muted font-black text-lg hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Tab bar */}
        <div className="px-5 pb-3">
          <div className="tk-tab-bar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`tk-tab ${activeTab === tab.id ? "active" : ""}`}
                style={
                  activeTab === tab.id
                    ? { background: tab.color }
                    : undefined
                }
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.emoji} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="px-5 pb-6">
          {activeTab === "item"      && <AddItemTab      onDone={onClose} />}
          {activeTab === "room"      && <AddRoomTab      onDone={onClose} />}
          {activeTab === "character" && <AddCharacterTab onDone={onClose} />}
        </div>
      </div>
    </div>
  );
}
