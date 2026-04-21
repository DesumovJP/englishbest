'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/teacher/ui';

type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

interface Prize {
  emoji: string;
  label: string;
  rarity: Rarity;
}

interface CaseData {
  id: string;
  name: string;
  description: string;
  cost: number;
  prizes: Prize[];
}

const RARITY: Record<Rarity, { label: string; dot: string; weight: number }> = {
  common:    { label: 'Звичайний',   dot: 'ios-dot-info',     weight: 50 },
  rare:      { label: 'Рідкісний',   dot: 'ios-dot-info',     weight: 30 },
  epic:      { label: 'Епічний',     dot: 'ios-dot-warn',     weight: 15 },
  legendary: { label: 'Легендарний', dot: 'ios-dot-positive', weight: 5  },
};

const CASES: CaseData[] = [
  {
    id: 'starter',
    name: 'Стартовий',
    description: 'Базові нагороди та бонуси',
    cost: 100,
    prizes: [
      { emoji: '⚡', label: '2× XP на 1 день',  rarity: 'rare'      },
      { emoji: '🎨', label: 'Новий аватар',     rarity: 'common'    },
      { emoji: '🔥', label: 'Заморозка стріку', rarity: 'rare'      },
      { emoji: '💎', label: '500 XP бонус',     rarity: 'epic'      },
      { emoji: '🃏', label: 'Скін профілю',     rarity: 'common'    },
      { emoji: '👑', label: 'Золота рамка',     rarity: 'legendary' },
    ],
  },
  {
    id: 'grammar',
    name: 'Граматичний',
    description: 'Методичні та освітні призи',
    cost: 250,
    prizes: [
      { emoji: '📖', label: 'Урок безкоштовно', rarity: 'epic'      },
      { emoji: '✏️', label: 'Бонус граматики',  rarity: 'common'    },
      { emoji: '🎓', label: 'Диплом A1',        rarity: 'legendary' },
      { emoji: '⭐', label: '1000 XP бонус',    rarity: 'epic'      },
      { emoji: '🎯', label: 'Жетон майстра',    rarity: 'rare'      },
      { emoji: '🃏', label: 'Скін профілю',     rarity: 'common'    },
    ],
  },
  {
    id: 'champion',
    name: 'Чемпіонський',
    description: 'Найрідкісніші нагороди',
    cost: 500,
    prizes: [
      { emoji: '👑', label: 'Корона чемпіона',   rarity: 'legendary' },
      { emoji: '💎', label: '2000 XP бонус',     rarity: 'legendary' },
      { emoji: '🎪', label: 'Ексклюзивний скін', rarity: 'epic'      },
      { emoji: '⚡', label: '2× XP на тиждень',  rarity: 'epic'      },
      { emoji: '🔥', label: 'Вічний стрік',      rarity: 'rare'      },
      { emoji: '🎖️', label: 'Медаль ліги',       rarity: 'rare'      },
    ],
  },
];

const MY_XP = 1847;

type OpenState = 'idle' | 'opening' | 'reveal';

export default function PrizesPage() {
  const [selected, setSelected]   = useState<CaseData | null>(null);
  const [openState, setOpenState] = useState<OpenState>('idle');
  const [prize, setPrize]         = useState<Prize | null>(null);

  function openCase(c: CaseData) {
    if (MY_XP < c.cost) return;
    setSelected(c);
    setOpenState('idle');
    setPrize(null);
  }

  function startOpen() {
    if (!selected) return;
    setOpenState('opening');
    setTimeout(() => {
      const pool = selected.prizes;
      const weights = pool.map(p => RARITY[p.rarity].weight);
      const total = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * total;
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
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Призи"
        subtitle={
          <>Відкривай кейси та отримуй нагороди · <span className="font-semibold text-ink tabular-nums">{MY_XP.toLocaleString('uk-UA')} XP</span></>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CASES.map(c => {
          const canOpen = MY_XP >= c.cost;
          const rarities = Array.from(new Set(c.prizes.map(p => p.rarity)));
          return (
            <button
              key={c.id}
              onClick={() => openCase(c)}
              disabled={!canOpen}
              className={`ios-card p-5 text-left flex flex-col gap-3 transition-colors ${
                canOpen ? 'hover:border-primary/30 cursor-pointer' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-ink">{c.name}</p>
                  <p className="text-[12px] text-ink-muted mt-0.5">{c.description}</p>
                </div>
                <span className="text-[13px] font-semibold text-ink tabular-nums flex-shrink-0">{c.cost} XP</span>
              </div>

              <ul className="flex flex-wrap gap-1.5">
                {rarities.map(r => (
                  <li key={r} className="inline-flex items-center gap-1 text-[11px] text-ink-muted">
                    <span className={`ios-dot ${RARITY[r].dot}`} />
                    {RARITY[r].label}
                  </li>
                ))}
              </ul>

              <span className={`mt-1 w-full h-9 rounded-lg font-semibold text-[13px] flex items-center justify-center transition-colors ${
                canOpen ? 'bg-primary text-white' : 'bg-surface-muted text-ink-muted'
              }`}>
                {canOpen ? 'Відкрити' : `Потрібно ${c.cost} XP`}
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-5"
          onClick={openState === 'reveal' ? close : undefined}
        >
          <div
            className="bg-white rounded-xl max-w-sm w-full p-6 flex flex-col items-center gap-5 text-center shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            {openState === 'idle' && (
              <>
                <div className="w-20 h-20 rounded-2xl bg-surface-muted flex items-center justify-center">
                  <svg className="w-9 h-9 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="8" width="18" height="13" rx="1.5" /><path d="M3 12h18" /><path d="M12 8v13" />
                    <path d="M7.5 8a2.5 2.5 0 014.5-1.5A2.5 2.5 0 0116.5 8" />
                  </svg>
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-ink">Кейс {selected.name}</p>
                  <p className="text-[12px] text-ink-muted mt-1 tabular-nums">Вартість: {selected.cost} XP</p>
                </div>
                <div className="flex gap-2 w-full">
                  <button onClick={close} className="ios-btn ios-btn-secondary flex-1">Скасувати</button>
                  <button onClick={startOpen} className="ios-btn ios-btn-primary flex-1">Відкрити</button>
                </div>
              </>
            )}

            {openState === 'opening' && (
              <>
                <div className="w-20 h-20 rounded-2xl bg-surface-muted flex items-center justify-center animate-pulse">
                  <svg className="w-9 h-9 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
                    <rect x="3" y="8" width="18" height="13" rx="1.5" /><path d="M3 12h18" /><path d="M12 8v13" />
                  </svg>
                </div>
                <p className="text-[13px] text-ink-muted">Відкриваємо…</p>
              </>
            )}

            {openState === 'reveal' && prize && (
              <>
                <div className="w-20 h-20 rounded-2xl bg-surface-muted flex items-center justify-center text-[36px]">
                  {prize.emoji}
                </div>
                <div>
                  <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                    <span className={`ios-dot ${RARITY[prize.rarity].dot}`} />
                    {RARITY[prize.rarity].label}
                  </p>
                  <p className="text-[15px] font-semibold text-ink mt-2">{prize.label}</p>
                  <p className="text-[12px] text-ink-muted mt-1">Нагороду додано у твій профіль</p>
                </div>
                <button onClick={close} className="ios-btn ios-btn-primary w-full">Забрати</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
