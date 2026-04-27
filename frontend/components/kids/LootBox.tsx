'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { LootItem, LootResult } from '@/lib/kids-store';

export type { LootItem } from '@/lib/kids-store';

/* ── Types ─────────────────────────────────────────────────────── */
export type BoxRarity = 'common' | 'silver' | 'gold' | 'legendary';
type BoxState = 'idle' | 'shaking' | 'opening' | 'revealed' | 'duplicate' | 'error';
type ItemRarity = LootItem['rarity'];

/* ── Box config ─────────────────────────────────────────────────── */
export const BOX_CONFIG: Record<BoxRarity, {
  name: string;
  price: number;
  body: string;
  bodyDark: string;
  lid: string;
  lidDark: string;
  ribbon: string;
  bow: string;
  glow: string;
  hint: string;
  stars: string[];
}> = {
  common: {
    name: 'Звичайний',
    price: 50,
    body: '#4f9cf9',
    bodyDark: '#2b6fd4',
    lid: '#2b6fd4',
    lidDark: '#1a4fa3',
    ribbon: '#ffd84d',
    bow: '#ffb800',
    glow: 'rgba(79,156,249,0.55)',
    hint: 'Меблі та декор',
    stars: ['#ffd84d', '#a78bfa', '#4f9cf9'],
  },
  silver: {
    name: 'Срібний',
    price: 150,
    body: '#a78bfa',
    bodyDark: '#7c3aed',
    lid: '#7c3aed',
    lidDark: '#5b21b6',
    ribbon: '#f9a8d4',
    bow: '#ec4899',
    glow: 'rgba(167,139,250,0.6)',
    hint: 'Рідкісний декор і одяг',
    stars: ['#f9a8d4', '#ffd84d', '#a78bfa'],
  },
  gold: {
    name: 'Золотий',
    price: 400,
    body: '#fbbf24',
    bodyDark: '#d97706',
    lid: '#d97706',
    lidDark: '#b45309',
    ribbon: '#fff',
    bow: '#fff',
    glow: 'rgba(251,191,36,0.65)',
    hint: 'Епічні предмети',
    stars: ['#fff', '#fbbf24', '#f97316'],
  },
  legendary: {
    name: 'Легендарний',
    price: 1000,
    body: '#ec4899',
    bodyDark: '#be185d',
    lid: '#be185d',
    lidDark: '#9d174d',
    ribbon: '#a78bfa',
    bow: '#c4b5fd',
    glow: 'rgba(236,72,153,0.7)',
    hint: 'Персонажі + легендарні речі',
    stars: ['#c4b5fd', '#fbbf24', '#ec4899', '#4f9cf9'],
  },
};

/* ── Rarity display ─────────────────────────────────────────────── */
const RARITY: Record<ItemRarity, { label: string; color: string; bg: string; glow: string }> = {
  common:    { label: 'Звичайний',   color: '#6b7280', bg: '#f3f4f6',  glow: 'rgba(107,114,128,0.3)' },
  uncommon:  { label: 'Рідкісний',   color: '#7c3aed', bg: '#f5f3ff',  glow: 'rgba(124,58,237,0.4)'  },
  rare:      { label: 'Рідкий',      color: '#d97706', bg: '#fffbeb',  glow: 'rgba(217,119,6,0.45)'  },
  epic:      { label: 'Епічний',     color: '#dc2626', bg: '#fef2f2',  glow: 'rgba(220,38,38,0.5)'   },
  legendary: { label: 'Легендарний', color: '#be185d', bg: '#fdf2f8',  glow: 'rgba(190,24,93,0.5)'   },
};

/* ── Confetti particle ──────────────────────────────────────────── */
const CONFETTI_COLORS = ['#ffd84d', '#4f9cf9', '#a78bfa', '#ec4899', '#34d399', '#f97316', '#fff'];

function ConfettiParticle({ color, angle, dist, delay, size }: {
  color: string; angle: number; dist: number; delay: number; size: number;
}) {
  const cx = Math.cos(angle) * dist;
  const cy = Math.sin(angle) * dist;
  const cr = (Math.random() * 720 - 360).toFixed(0) + 'deg';

  return (
    <div
      className="absolute rounded-sm pointer-events-none animate-confetti"
      style={{
        width: size, height: size,
        background: color,
        left: '50%', top: '40%',
        marginLeft: -size / 2, marginTop: -size / 2,
        animationDelay: `${delay}ms`,
        animationDuration: `${600 + Math.random() * 300}ms`,
        '--cx': `${cx}px`,
        '--cy': `${cy}px`,
        '--cr': cr,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      } as React.CSSProperties}
    />
  );
}

/* ── Twinkling star ─────────────────────────────────────────────── */
function Star({ color, x, y, delay, size }: {
  color: string; x: number; y: number; delay: number; size: number;
}) {
  return (
    <div
      className="absolute pointer-events-none animate-star-twinkle select-none"
      style={{
        left: `${x}%`, top: `${y}%`,
        animationDelay: `${delay}ms`,
        fontSize: size,
        color,
        lineHeight: 1,
      }}
    >
      ✦
    </div>
  );
}

/* ── Box visual ─────────────────────────────────────────────────── */
function BoxArt({
  cfg, state, onTap,
}: {
  cfg: typeof BOX_CONFIG[BoxRarity];
  state: BoxState;
  onTap: () => void;
}) {
  const isShaking = state === 'shaking';
  const isOpening = state === 'opening' || state === 'revealed';
  const isRevealed = state === 'revealed';

  return (
    <button
      onClick={state === 'idle' ? onTap : undefined}
      className={[
        'relative select-none focus:outline-none w-[180px] h-[210px]',
        state === 'idle' ? 'cursor-pointer active:scale-95' : 'cursor-default',
      ].join(' ')}
      aria-label="Відкрити бокс"
    >
      {/* Glow — dynamic color from cfg.glow, dynamic opacity based on state */}
      <div
        className="absolute inset-[-20px] rounded-full blur-2xl pointer-events-none transition-opacity duration-[400ms]"
        style={{ background: cfg.glow, opacity: isRevealed ? 0.8 : 0.45 }}
      />

      {/* Ground shadow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 blur-md rounded-full pointer-events-none w-[120px] h-[18px] bg-black/20" />

      {/* Mystery box image */}
      <img
        src="/mystery-box.png"
        alt="Mystery Box"
        className={[
          'absolute inset-0 w-full h-full object-contain',
          isShaking ? 'animate-box-shake' : '',
          isOpening ? 'animate-lid-fly' : (!isOpening && !isRevealed ? 'animate-float' : ''),
        ].join(' ')}
        style={{
          filter: `drop-shadow(0 8px 20px ${cfg.glow})`,
          opacity: isRevealed ? 0 : 1,
          transition: isRevealed ? 'opacity 0.2s' : 'none',
          animationDuration: isOpening ? '0.45s' : '3s',
        }}
      />
    </button>
  );
}

/* ── Idle tap hint ──────────────────────────────────────────────── */
function TapHint() {
  return (
    <p className="text-center text-sm font-black text-ink-muted animate-bounce-in [animation-delay:0.3s]">
      👆 Натисни на бокс!
    </p>
  );
}

/* ── Reveal card ────────────────────────────────────────────────── */
function RevealCard({ item, onClose, onOpenAnother, canAfford }: {
  item: LootItem;
  onClose: () => void;
  onOpenAnother: () => void;
  canAfford: boolean;
}) {
  const r = RARITY[item.rarity];

  return (
    <div className="flex flex-col items-center gap-5 animate-fade-in-up [animation-delay:0.3s]">
      {/* Rarity badge — dynamic per-rarity bg/color/glow */}
      <div
        className="px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest animate-bounce-in [animation-delay:0.4s]"
        style={{
          background: r.bg,
          color: r.color,
          boxShadow: `0 0 16px 4px ${r.glow}`,
        }}
      >
        {item.kind === 'character' ? '🎭 Новий персонаж!' : r.label}
      </div>

      {/* Item name */}
      <div className="text-center animate-fade-in-up [animation-delay:0.5s]">
        <p className="text-3xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">{item.nameUa}</p>
        {item.kind === 'character' && (
          <p className="text-sm font-bold text-white/75 mt-1">Тепер він у твоїй колекції!</p>
        )}
      </div>

      {/* Buttons — equal-width pills with consistent typography. The
          previous gradient + 0 4px 0 shadow on the "Ще раз" button looked
          tilted next to the flat "До кімнати" button; now both share the
          same height + radius and only differ in fill (glass for the
          neutral exit, solid rarity-color for the optimistic action). */}
      <div className="flex gap-2.5 w-full max-w-[320px] animate-fade-in-up [animation-delay:0.65s]">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-14 rounded-2xl border-2 border-white/25 bg-white/10 backdrop-blur-md font-black text-[15px] text-white hover:bg-white/15 hover:border-white/40 transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
        >
          <span>До кімнати</span>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
        {canAfford && (
          <button
            type="button"
            onClick={onOpenAnother}
            className="flex-1 h-14 rounded-2xl font-black text-[15px] text-white inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-transform active:translate-y-0.5"
            style={{ background: r.color }}
          >
            <span>Ще раз</span>
            <span aria-hidden>🎁</span>
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Main LootBox Modal ─────────────────────────────────────────── */
interface LootBoxModalProps {
  boxType: BoxRarity;
  balance: number;
  onClose: () => void;
  /**
   * Server call that opens the box. Must debit coins + award the reward
   * atomically. Returns the loot payload, or `null` on network / 4xx /
   * 5xx error. A payload with `item: null` + `duplicate: true` means the
   * user already owns every eligible reward — no debit occurred.
   */
  onOpen: (boxType: BoxRarity) => Promise<LootResult | null>;
}

export function LootBoxModal({ boxType, balance, onClose, onOpen }: LootBoxModalProps) {
  const cfg = BOX_CONFIG[boxType];
  const [state, setState] = useState<BoxState>('idle');
  const [item, setItem] = useState<LootItem | null>(null);
  const [confetti, setConfetti] = useState<Array<{
    id: number; color: string; angle: number; dist: number; delay: number; size: number;
  }>>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Generate stars for idle state
  const stars = useRef(
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      color: cfg.stars[i % cfg.stars.length],
      x: [10, 80, 15, 75, 5, 90][i],
      y: [15, 10, 60, 65, 35, 40][i],
      delay: i * 320,
      size: [10, 14, 10, 12, 8, 12][i],
    }))
  ).current;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && state === 'idle') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [state, onClose]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleTap = useCallback(async () => {
    if (state !== 'idle' || balance < cfg.price) return;

    setState('shaking');

    // Fire the server call in parallel with the shake animation so the
    // minimum box-shake duration masks network latency.
    const minShake = new Promise<void>(resolve => {
      timerRef.current = setTimeout(resolve, 550);
    });
    const serverPromise = onOpen(boxType);
    const [loot] = await Promise.all([serverPromise, minShake]);

    if (!loot) {
      setState('error');
      return;
    }
    if (!loot.item) {
      // Server refunded — nothing un-owned of this rarity remains.
      setState('duplicate');
      return;
    }

    setItem(loot.item);
    setState('opening');

    timerRef.current = setTimeout(() => {
      const particles = Array.from({ length: 28 }, (_, i) => ({
        id: i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        angle: (i / 28) * Math.PI * 2,
        dist: 70 + Math.random() * 80,
        delay: Math.random() * 120,
        size: 6 + Math.random() * 8,
      }));
      setConfetti(particles);
      setState('revealed');
    }, 450);
  }, [state, balance, cfg, boxType, onOpen]);

  const handleOpenAnother = useCallback(() => {
    clearTimeout(timerRef.current);
    setItem(null);
    setConfetti([]);
    setState('idle');
  }, []);

  const canAfford = balance - cfg.price >= cfg.price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
      {/* Close button — available in any non-animating state */}
      {(state === 'idle' || state === 'duplicate' || state === 'error') && (
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
          aria-label="Закрити"
        >
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="flex flex-col items-center gap-8 w-full max-w-sm relative">

        {/* Box name + price */}
        <div className="text-center animate-fade-in-up">
          <p className="text-xs font-black text-white/70 uppercase tracking-widest mb-1">
            {cfg.name} бокс
          </p>
          <div className="flex items-center justify-center gap-1.5">
            <img src="/coin.png" alt="coin" width={24} height={24} className="object-contain" />
            <span className="text-2xl font-black text-white">{cfg.price}</span>
          </div>
        </div>

        {/* Box + stars + confetti */}
        <div className="relative flex items-center justify-center w-[260px] h-[260px]">
          {/* Idle stars */}
          {(state === 'idle' || state === 'duplicate' || state === 'error') && stars.map(s => (
            <Star key={s.id} color={s.color} x={s.x} y={s.y} delay={s.delay} size={s.size} />
          ))}

          {/* Confetti */}
          {confetti.map(p => (
            <ConfettiParticle key={p.id} {...p} />
          ))}

          {/* The box */}
          <BoxArt
            cfg={cfg}
            state={state === 'duplicate' || state === 'error' ? 'idle' : state}
            onTap={handleTap}
          />

          {/* Item emerges from box */}
          {state === 'revealed' && item && (
            <div className="absolute flex items-center justify-center animate-item-emerge pointer-events-none top-[10%] left-1/2 -translate-x-1/2">
              <span
                className="text-[80px] leading-none"
                style={{ filter: `drop-shadow(0 8px 20px ${RARITY[item.rarity].glow})` }}
              >
                {item.emoji}
              </span>
            </div>
          )}
        </div>

        {/* Bottom area */}
        <div className="w-full min-h-[80px] flex flex-col items-center justify-center">
          {state === 'idle' && balance >= cfg.price && <TapHint />}
          {state === 'idle' && balance < cfg.price && (
            <div className="text-center animate-fade-in-up">
              <p className="text-sm font-black text-white/50">Не вистачає монеток</p>
              <p className="text-xs text-white/30 mt-1 flex items-center justify-center gap-1">Потрібно ще <img src="/coin.png" alt="coin" width={11} height={11} className="object-contain" /> {cfg.price - balance}</p>
            </div>
          )}
          {state === 'shaking' && (
            <p className="text-center text-sm font-black text-white/60 animate-pulse">Трясе…</p>
          )}
          {state === 'opening' && (
            <p className="text-center text-sm font-black text-white/60 animate-pulse">Відкривається!</p>
          )}
          {state === 'revealed' && item && (
            <RevealCard
              item={item}
              onClose={onClose}
              onOpenAnother={handleOpenAnother}
              canAfford={canAfford}
            />
          )}
          {state === 'duplicate' && (
            <div className="text-center animate-fade-in-up">
              <p className="text-base font-black text-white">Усе вже у колекції 🎉</p>
              <p className="text-xs text-white/60 mt-1">Монети не списалися. Спробуй інший бокс!</p>
            </div>
          )}
          {state === 'error' && (
            <div className="text-center animate-fade-in-up">
              <p className="text-base font-black text-white">Не вдалось відкрити</p>
              <p className="text-xs text-white/60 mt-1">Перевір з’єднання і спробуй ще раз.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* ── Box card (for shop grid) ───────────────────────────────────── */
interface BoxCardProps {
  type: BoxRarity;
  balance: number;
  onOpen: (type: BoxRarity) => void;
}

const TIER: Record<BoxRarity, {
  panel: string;
  chip: string;
  chipText: string;
  glow: string;
  priceBtn: string;
  tierLabel: string;
}> = {
  common: {
    panel: 'bg-gradient-to-br from-secondary/10 to-secondary/[0.04] border-secondary/25',
    chip: 'bg-secondary/15',
    chipText: 'text-secondary-dark',
    glow: 'bg-secondary/40',
    priceBtn: 'bg-secondary shadow-press-secondary',
    tierLabel: 'Common',
  },
  silver: {
    panel: 'bg-gradient-to-br from-purple/10 to-purple/[0.04] border-purple/25',
    chip: 'bg-purple/15',
    chipText: 'text-purple-dark',
    glow: 'bg-purple/40',
    priceBtn: 'bg-purple shadow-press-purple',
    tierLabel: 'Rare',
  },
  gold: {
    panel: 'bg-gradient-to-br from-accent/12 to-accent/[0.04] border-accent/30',
    chip: 'bg-accent/15',
    chipText: 'text-accent-dark',
    glow: 'bg-accent/45',
    priceBtn: 'bg-accent shadow-press-accent',
    tierLabel: 'Epic',
  },
  legendary: {
    panel: 'bg-gradient-to-br from-danger/12 to-danger/[0.04] border-danger/30',
    chip: 'bg-danger/15',
    chipText: 'text-danger-dark',
    glow: 'bg-danger/45',
    priceBtn: 'bg-danger shadow-press-danger',
    tierLabel: 'Legendary',
  },
};

export function BoxCard({ type, balance, onOpen }: BoxCardProps) {
  const cfg = BOX_CONFIG[type];
  const tier = TIER[type];
  const canAfford = balance >= cfg.price;

  return (
    <button
      type="button"
      onClick={() => canAfford && onOpen(type)}
      disabled={!canAfford}
      className={[
        'group relative flex flex-col items-center text-center rounded-3xl border-2 px-5 pt-6 pb-5 overflow-hidden transition-transform',
        tier.panel,
        canAfford ? 'hover:-translate-y-0.5 active:translate-y-0.5' : 'opacity-75 cursor-not-allowed',
      ].join(' ')}
    >
      {/* Tier chip */}
      <span className={`absolute top-3 left-3 px-2.5 h-6 inline-flex items-center rounded-full text-[10px] font-black uppercase tracking-widest ${tier.chip} ${tier.chipText}`}>
        {tier.tierLabel}
      </span>

      {/* Box art with glow */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        <div className={`absolute inset-2 rounded-full blur-2xl pointer-events-none ${tier.glow}`} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mystery-box.png"
          alt=""
          aria-hidden
          className="relative w-24 h-24 object-contain animate-float drop-shadow-[0_10px_20px_rgba(0,0,0,0.18)] [animation-duration:2.8s]"
        />
      </div>

      {/* Name + hint */}
      <p className="mt-3 font-black text-base text-ink">{cfg.name}</p>
      <p className="text-xs font-medium text-ink-muted mt-0.5 min-h-[16px]">{cfg.hint}</p>

      {/* Price / locked */}
      <div className="mt-4">
        {canAfford ? (
          <span className={`inline-flex items-center gap-1.5 px-4 h-10 rounded-2xl font-black text-sm text-white ${tier.priceBtn} group-active:translate-y-1 group-active:shadow-none transition-transform`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/coin.png" alt="" aria-hidden width={18} height={18} className="object-contain" />
            <span>{cfg.price}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-4 h-10 rounded-2xl font-black text-sm bg-coin-bg border border-coin-border text-coin">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/coin.png" alt="" aria-hidden width={16} height={16} className="object-contain opacity-70" />
            <span>{cfg.price}</span>
            <span className="text-[11px] font-bold text-ink-muted ml-0.5">не вистачає</span>
          </span>
        )}
      </div>
    </button>
  );
}
