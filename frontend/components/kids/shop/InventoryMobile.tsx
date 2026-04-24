'use client';
import { useState } from 'react';
import CharacterAvatar from '@/components/kids/CharacterAvatar';
import { CHARACTERS, type CharacterEmotion } from '@/lib/characters';
import { useKidsState } from '@/lib/use-kids-store';

export interface InvItem {
  id: string;
  emoji: string;
  nameEn: string;
  tab: string;
  price: number;
  levelRequired: string;
  customImageIdle?: string;
}

export interface SlotOffset { top: string; left: string }

export interface InventoryMobileProps {
  outfitItems: InvItem[];
  roomItems: InvItem[];
  ownedIds: Set<string>;
  equippedIds: string[];
  balance: number;
  userLevel: string;
  slotOffset: Record<string, SlotOffset>;
  emotionMeta: { key: CharacterEmotion; label: string; emoji: string }[];
  dressChars: { id: string; nameEn: string; rarity: string; howToGet: string; unlocked: boolean }[];
  rarityMap: Record<string, { text: string; bg: string; border: string }>;
  canUnlock: (userLevel: string, req: string) => boolean;
  onToggleEquip: (id: string) => void;
  onSelectCharacter: (id: string) => void;
  onBuy: (item: InvItem) => void;
  onPlaceInRoom: (id: string) => void;
}

export function InventoryMobile(props: InventoryMobileProps) {
  const {
    outfitItems, roomItems, ownedIds, equippedIds, balance, userLevel,
    slotOffset, emotionMeta, dressChars, rarityMap, canUnlock,
    onToggleEquip, onSelectCharacter, onBuy, onPlaceInRoom,
  } = props;

  const { state } = useKidsState();
  const characterId = state.activeCharacterId ?? 'fox';

  const [emotion, setEmotion] = useState<CharacterEmotion>('idle');
  const [subTab, setSubTab] = useState<'character' | 'room'>('character');
  const [sheetOpen, setSheetOpen] = useState(false);

  const charDef = CHARACTERS[characterId];
  const availableEmotions = charDef
    ? emotionMeta.filter(e => !!charDef.emotions[e.key])
    : emotionMeta;

  const ownedOutfit = outfitItems.filter(i => ownedIds.has(i.id));

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── Hero strip: avatar + equipped chips + settings ───────── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gradient-to-b from-purple-50/60 to-transparent">
        <div className="relative flex-shrink-0" key={`${characterId}-${emotion}`}>
          <CharacterAvatar characterId={characterId} emotion={emotion} size={72} animate />
          {equippedIds.map(id => {
            const item = outfitItems.find(i => i.id === id);
            if (!item) return null;
            const pos = slotOffset[id] ?? { top: '0%', left: '50%' };
            return (
              <div
                key={id}
                className="absolute pointer-events-none -translate-x-1/2 text-[14px] drop-shadow-[0_2px_3px_rgba(0,0,0,0.2)]"
                style={{ top: pos.top, left: pos.left }}
              >
                {item.customImageIdle ? (
                  <img src={item.customImageIdle} alt="" aria-hidden width={22} height={22} className="object-contain" draggable={false} />
                ) : (
                  item.emoji
                )}
              </div>
            );
          })}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <p className="font-black text-[13px] text-gray-900 truncate">
              {dressChars.find(c => c.id === characterId)?.nameEn ?? 'Character'}
            </p>
            <span className="font-bold text-[10px] text-gray-400 uppercase tracking-wider">Lvl {userLevel}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {equippedIds.length === 0 ? (
              <p className="text-[11px] font-semibold text-gray-400">Вибери щось нижче</p>
            ) : (
              equippedIds.map(id => {
                const item = outfitItems.find(i => i.id === id);
                return item ? (
                  <button
                    key={id}
                    onClick={() => onToggleEquip(id)}
                    className="flex-shrink-0 rounded-lg bg-gray-100 border border-gray-200 px-1.5 py-0.5 text-base leading-none active:scale-90 transition-transform flex items-center justify-center"
                    aria-label={`Remove ${item.nameEn}`}
                  >
                    {item.customImageIdle ? (
                      <img src={item.customImageIdle} alt="" aria-hidden width={18} height={18} className="object-contain" draggable={false} />
                    ) : (
                      item.emoji
                    )}
                  </button>
                ) : null;
              })
            )}
          </div>
        </div>

        <button
          onClick={() => setSheetOpen(true)}
          aria-label="Персонаж і емоції"
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center active:scale-90 transition-transform"
        >
          <span className="text-lg">⚙️</span>
        </button>
      </div>

      {/* ── Sub-tabs ──────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex gap-2 px-4 py-2.5 bg-white">
        <button
          onClick={() => setSubTab('character')}
          className={[
            'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 border transition-colors active:scale-95',
            subTab === 'character'
              ? 'bg-gray-900 border-gray-900 text-white'
              : 'bg-white border-gray-200 text-gray-600',
          ].join(' ')}
        >
          <span className="text-sm">👤</span>
          <span className="font-black text-[12px]">Персонаж</span>
          <span className={subTab === 'character' ? 'text-white/70 text-[10px] font-bold' : 'text-gray-400 text-[10px] font-bold'}>
            {ownedOutfit.length}
          </span>
        </button>
        <button
          onClick={() => setSubTab('room')}
          className={[
            'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 border transition-colors active:scale-95',
            subTab === 'room'
              ? 'bg-gray-900 border-gray-900 text-white'
              : 'bg-white border-gray-200 text-gray-600',
          ].join(' ')}
        >
          <span className="text-sm">🏠</span>
          <span className="font-black text-[12px]">Кімната</span>
          <span className={subTab === 'room' ? 'text-white/70 text-[10px] font-bold' : 'text-gray-400 text-[10px] font-bold'}>
            {roomItems.length}
          </span>
        </button>
      </div>

      {/* ── Items grid (scrollable) ───────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pt-2 pb-24">
        {subTab === 'room' ? (
          roomItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <span className="text-4xl opacity-50">🛋️</span>
              <p className="font-bold text-sm text-gray-500">Поки нічого для домівки</p>
              <p className="text-xs text-gray-400">Купи меблі або декор у магазині</p>
            </div>
          ) : (
            <div className="grid gap-2.5 grid-cols-3">
              {roomItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => onPlaceInRoom(item.id)}
                  className="flex flex-col items-center gap-1 rounded-2xl p-2.5 bg-primary/5 border border-primary/15 active:scale-95 transition-all text-center"
                >
                  {item.customImageIdle ? (
                    <img src={item.customImageIdle} alt={item.nameEn} width={36} height={36} className="object-contain" />
                  ) : (
                    <span className="text-[28px] leading-none">{item.emoji}</span>
                  )}
                  <p className="font-black leading-tight text-[10px] text-gray-900 truncate w-full">{item.nameEn}</p>
                  <span className="font-black text-[8.5px] text-primary-dark bg-primary/10 rounded-full px-1.5 py-0.5">
                    На домівку →
                  </span>
                </button>
              ))}
            </div>
          )
        ) : (
          <div className="grid gap-2.5 grid-cols-3">
            {outfitItems.map(item => {
              const isOwned    = ownedIds.has(item.id);
              const isEquipped = equippedIds.includes(item.id);
              const isLocked   = !canUnlock(userLevel, item.levelRequired);
              const canAfford  = balance >= item.price;

              return (
                <button
                  key={item.id}
                  disabled={isLocked}
                  onClick={() => {
                    if (isLocked) return;
                    if (!isOwned) { onBuy(item); return; }
                    onToggleEquip(item.id);
                  }}
                  className={[
                    'flex flex-col items-center gap-1 rounded-2xl p-2.5 active:scale-95 transition-all border-[1.5px] text-center',
                    isEquipped
                      ? 'bg-green-50 border-primary shadow-[0_0_10px_rgba(88,204,2,0.18)]'
                      : isOwned
                        ? 'bg-gray-50 border-green-200'
                        : 'bg-gray-50 border-gray-100',
                    isLocked ? 'opacity-45' : 'opacity-100',
                  ].join(' ')}
                >
                  {item.customImageIdle ? (
                    <img src={item.customImageIdle} alt={item.nameEn} width={32} height={32}
                      className={['object-contain', isLocked && 'grayscale'].filter(Boolean).join(' ')} draggable={false} />
                  ) : (
                    <span className={['text-[26px] leading-none', isLocked && 'grayscale'].filter(Boolean).join(' ')}>
                      {item.emoji}
                    </span>
                  )}
                  <p className={[
                    'font-black leading-tight text-[10px] truncate w-full',
                    isEquipped ? 'text-green-600' : 'text-gray-700',
                  ].join(' ')}>
                    {item.nameEn}
                  </p>
                  {isEquipped ? (
                    <span className="text-[7px] text-green-600 font-extrabold tracking-[0.06em]">EQUIPPED</span>
                  ) : isLocked ? (
                    <span className="text-[8.5px] text-gray-400 font-bold">🔒 {item.levelRequired}</span>
                  ) : !isOwned ? (
                    <span className="flex items-center gap-0.5 leading-none">
                      <img src="/coin.png" alt="" width={9} height={9} className="object-contain" />
                      <span className={['text-[9px] font-bold', canAfford ? 'text-amber-500' : 'text-red-500'].join(' ')}>
                        {item.price}
                      </span>
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Bottom sheet: character & emotion picker ──────────── */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[60] flex items-end" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-slate-900/55 backdrop-blur-[4px]"
            onClick={() => setSheetOpen(false)}
            aria-hidden
          />
          <div className="relative w-full max-h-[85dvh] flex flex-col rounded-t-3xl bg-white shadow-[0_-10px_40px_rgba(15,23,42,0.15)] animate-[slide-up_220ms_ease-out]">
            <div className="flex-shrink-0 flex justify-center pt-2.5 pb-1.5">
              <span className="h-1 w-10 rounded-full bg-gray-300" aria-hidden />
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-2 pb-[env(safe-area-inset-bottom,16px)]">
              <p className="font-black uppercase tracking-widest text-[10px] text-gray-400 mb-2">Персонаж</p>
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {dressChars.map(char => {
                  const isActive = characterId === char.id;
                  const rarity = rarityMap[char.rarity];
                  return (
                    <button
                      key={char.id}
                      onClick={() => char.unlocked && onSelectCharacter(char.id)}
                      disabled={!char.unlocked}
                      className={[
                        'flex-shrink-0 flex flex-col items-center gap-1 rounded-xl p-2 active:scale-95 transition-all w-[68px] border-2',
                        isActive ? `${rarity.bg} ${rarity.border}` : 'bg-white border-gray-100',
                        char.unlocked ? 'opacity-100' : 'opacity-45',
                      ].join(' ')}
                    >
                      <div className={[
                        'w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden',
                        char.unlocked ? rarity.bg : 'bg-gray-100 grayscale',
                      ].join(' ')}>
                        {char.unlocked
                          ? <CharacterAvatar characterId={char.id} emotion="idle" size={44} animate={false} />
                          : <span className="text-xl">🔒</span>
                        }
                      </div>
                      <span className={['font-black text-[10px]', isActive ? rarity.text : 'text-gray-500'].join(' ')}>
                        {char.nameEn}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="font-black uppercase tracking-widest text-[10px] text-gray-400 mb-2">Емоції</p>
              <div className="grid grid-cols-4 gap-1.5 pb-2">
                {availableEmotions.map(em => {
                  const isActive = emotion === em.key;
                  return (
                    <button
                      key={em.key}
                      onClick={() => setEmotion(isActive ? 'idle' : em.key)}
                      className={[
                        'flex flex-col items-center gap-0.5 rounded-xl py-2 active:scale-90 transition-all border-[1.5px]',
                        isActive ? 'bg-blue-50 border-secondary shadow-[0_0_0_2px_rgba(79,156,249,0.18)]' : 'bg-white border-gray-100',
                      ].join(' ')}
                    >
                      <span className="text-base leading-none">{em.emoji}</span>
                      <span className={['font-bold text-[9px]', isActive ? 'text-secondary' : 'text-gray-500'].join(' ')}>
                        {em.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
