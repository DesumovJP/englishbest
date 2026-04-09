'use client';
import { useState } from 'react';

/* ─── Типи ───────────────────────────────────── */
type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

interface Prize {
  emoji: string;
  label: string;
  rarity: Rarity;
}

interface Case {
  id: string;
  name: string;
  emoji: string;
  gradient: string;
  cost: number;
  prizes: Prize[];
}

/* ─── Конфіг рідкісності ─────────────────────── */
const RARITY: Record<Rarity, { label: string; color: string; bg: string; glow: string }> = {
  common:    { label: 'Звичайний',   color: 'text-ink-muted',      bg: 'bg-surface-muted', glow: '' },
  rare:      { label: 'Рідкісний',   color: 'text-secondary-dark', bg: 'bg-secondary/8',   glow: 'shadow-[0_0_20px_4px_rgba(59,130,246,0.35)]' },
  epic:      { label: 'Епічний',     color: 'text-purple-dark',    bg: 'bg-purple/8',      glow: 'shadow-[0_0_20px_4px_rgba(139,92,246,0.4)]' },
  legendary: { label: 'Легендарний', color: 'text-accent-dark',    bg: 'bg-accent/8',      glow: 'shadow-[0_0_28px_8px_rgba(245,158,11,0.5)]' },
};

/* ─── Дані кейсів ────────────────────────────── */
const CASES: Case[] = [
  {
    id: 'starter',
    name: 'Стартовий кейс',
    emoji: '📦',
    gradient: 'from-secondary to-secondary-dark',
    cost: 100,
    prizes: [
      { emoji: '⚡', label: '2x XP на 1 день',    rarity: 'rare'      },
      { emoji: '🎨', label: 'Новий аватар',        rarity: 'common'    },
      { emoji: '🔥', label: 'Заморозка стріку',    rarity: 'rare'      },
      { emoji: '💎', label: '500 XP бонус',        rarity: 'epic'      },
      { emoji: '🃏', label: 'Скін профілю',        rarity: 'common'    },
      { emoji: '👑', label: 'Золота рамка',        rarity: 'legendary' },
    ],
  },
  {
    id: 'grammar',
    name: 'Граматичний кейс',
    emoji: '📗',
    gradient: 'from-success to-success-dark',
    cost: 250,
    prizes: [
      { emoji: '📖', label: 'Урок безкоштовно',   rarity: 'epic'      },
      { emoji: '✏️', label: 'Бонус граматики',    rarity: 'common'    },
      { emoji: '🎓', label: 'Диплом A1',           rarity: 'legendary' },
      { emoji: '⭐', label: '1000 XP бонус',       rarity: 'epic'      },
      { emoji: '🎯', label: 'Жетон майстра',       rarity: 'rare'      },
      { emoji: '🃏', label: 'Скін профілю',        rarity: 'common'    },
    ],
  },
  {
    id: 'champion',
    name: 'Чемпіонський кейс',
    emoji: '🏆',
    gradient: 'from-accent to-accent-dark',
    cost: 500,
    prizes: [
      { emoji: '👑', label: 'Корона чемпіона',     rarity: 'legendary' },
      { emoji: '💎', label: '2000 XP бонус',        rarity: 'legendary' },
      { emoji: '🎪', label: 'Ексклюзивний скін',   rarity: 'epic'      },
      { emoji: '⚡', label: '2x XP на тиждень',    rarity: 'epic'      },
      { emoji: '🔥', label: 'Вічний стрік',         rarity: 'rare'      },
      { emoji: '🎖️', label: 'Медаль ліги',         rarity: 'rare'      },
    ],
  },
];

const MY_XP = 1847;

/* ─── Анімаційні стани ───────────────────────── */
type OpenState = 'idle' | 'shaking' | 'reveal';

/* ─── Компонент ──────────────────────────────── */
export default function PrizesPage() {
  const [selected, setSelected]     = useState<Case | null>(null);
  const [openState, setOpenState]   = useState<OpenState>('idle');
  const [prize, setPrize]           = useState<Prize | null>(null);

  function openCase(c: Case) {
    if (MY_XP < c.cost) return;
    setSelected(c);
    setOpenState('idle');
    setPrize(null);
  }

  function startOpen() {
    if (!selected) return;
    setOpenState('shaking');
    setTimeout(() => {
      const roll = Math.random();
      const pool = selected.prizes;
      // Weighted: legendary 5%, epic 15%, rare 30%, common 50%
      const weights = pool.map(p =>
        p.rarity === 'legendary' ? 5 : p.rarity === 'epic' ? 15 : p.rarity === 'rare' ? 30 : 50
      );
      const total = weights.reduce((a, b) => a + b, 0);
      let r = roll * total;
      let picked = pool[pool.length - 1];
      for (let i = 0; i < pool.length; i++) {
        r -= weights[i];
        if (r <= 0) { picked = pool[i]; break; }
      }
      setPrize(picked);
      setOpenState('reveal');
    }, 900);
  }

  function close() {
    setSelected(null);
    setOpenState('idle');
    setPrize(null);
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      {/* Шапка */}
      <div>
        <h1 className="text-2xl font-black text-ink">Призи 🏆</h1>
        <p className="text-sm text-ink-muted mt-0.5">
          Відкривай кейси та отримуй нагороди · У тебе <span className="font-black text-primary">{MY_XP.toLocaleString()} XP</span>
        </p>
      </div>

      {/* Кейси */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CASES.map(c => {
          const canOpen = MY_XP >= c.cost;
          return (
            <button
              key={c.id}
              onClick={() => openCase(c)}
              disabled={!canOpen}
              className={`rounded-3xl overflow-hidden text-left transition-all active:scale-95 ${
                canOpen ? 'hover:-translate-y-1 hover:shadow-xl cursor-pointer' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              {/* Градієнтна шапка */}
              <div className={`bg-gradient-to-br ${c.gradient} px-5 pt-6 pb-10 flex flex-col items-center gap-2`}>
                <span className="text-6xl drop-shadow-md">{c.emoji}</span>
                <p className="text-white font-black text-base mt-1">{c.name}</p>
              </div>
              {/* Білий лист */}
              <div className="bg-white rounded-t-3xl -mt-5 px-5 pt-4 pb-5">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {Array.from(new Set(c.prizes.map(p => p.rarity))).map(r => (
                      <span key={r} className={`text-[10px] font-black px-2 py-0.5 rounded-full ${RARITY[r].bg} ${RARITY[r].color}`}>
                        {RARITY[r].label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`mt-3 w-full py-2.5 rounded-xl font-black text-sm text-center ${
                  canOpen
                    ? 'bg-primary text-white'
                    : 'bg-surface-muted text-ink-muted'
                }`}>
                  {canOpen ? `Відкрити · ${c.cost} XP` : `Потрібно ${c.cost} XP`}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Модалка відкриття */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5"
          onClick={openState === 'reveal' ? close : undefined}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-sm w-full flex flex-col items-center gap-5 text-center"
            onClick={e => e.stopPropagation()}
          >
            {openState === 'idle' && (
              <>
                <span className={`text-8xl drop-shadow-lg transition-transform`}>{selected.emoji}</span>
                <div>
                  <p className="font-black text-ink text-xl">{selected.name}</p>
                  <p className="text-sm text-ink-muted mt-1">Натисни щоб відкрити</p>
                </div>
                <button
                  onClick={startOpen}
                  className="w-full py-4 rounded-2xl font-black text-white text-base bg-gradient-to-br from-primary to-primary-dark hover:opacity-90 active:scale-[0.98] transition-all shadow-lg"
                >
                  Відкрити кейс!
                </button>
                <button onClick={close} className="text-sm text-ink-muted hover:text-ink transition-colors">
                  Скасувати
                </button>
              </>
            )}

            {openState === 'shaking' && (
              <>
                <span className="text-8xl animate-bounce">{selected.emoji}</span>
                <p className="font-black text-ink text-lg">Відкриваємо...</p>
              </>
            )}

            {openState === 'reveal' && prize && (
              <>
                <div className={`w-32 h-32 rounded-3xl flex items-center justify-center text-6xl ${RARITY[prize.rarity].bg} ${RARITY[prize.rarity].glow} transition-all`}>
                  {prize.emoji}
                </div>
                <div>
                  <span className={`text-xs font-black px-3 py-1 rounded-full ${RARITY[prize.rarity].bg} ${RARITY[prize.rarity].color}`}>
                    {RARITY[prize.rarity].label}
                  </span>
                  <p className="font-black text-ink text-xl mt-3">{prize.label}</p>
                  <p className="text-sm text-ink-muted mt-1">Нагороду додано до твого профілю!</p>
                </div>
                <button
                  onClick={close}
                  className="w-full py-3.5 rounded-2xl font-black text-white bg-primary hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Забрати!
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
