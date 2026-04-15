'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockKidsUser } from '@/mocks/user';
import { useKidsState } from '@/lib/use-kids-store';
import {
  LIB_ITEMS, LIB_DESCRIPTIONS, LIB_LONG, LIB_PREVIEWS, LIB_CATEGORIES,
  TYPE_ACCENT, TYPE_LABEL, TYPE_SECTION,
  canAccessLevel,
  type LibTabId,
} from '@/lib/library-data';

/* ── Cover gradients (same as catalog) ──────────────────────────── */
const COVER_BG: Record<Exclude<LibTabId, 'all'>, string> = {
  books:   'linear-gradient(160deg, #1e3a5f 0%, #1D4ED8 100%)',
  courses: 'linear-gradient(160deg, #064e3b 0%, #059669 100%)',
  videos:  'linear-gradient(160deg, #3b0764 0%, #7C3AED 100%)',
  games:   'linear-gradient(160deg, #78350f 0%, #D97706 100%)',
};

const TYPE_ICON: Record<string, string> = {
  books: '📚', courses: '🎓', videos: '🎬', games: '🎮',
};

const OWNED_DEFAULT = new Set([
  'caterpillar', 'oxford-1', 'natgeo', 'phonics',
  'grammar-basics', 'peppa', 'bluey', 'simple-songs', 'word-puzzle',
]);

const COUNTS: Record<LibTabId, number> = {
  all:     LIB_ITEMS.length,
  books:   LIB_ITEMS.filter(i => i.type === 'books').length,
  courses: LIB_ITEMS.filter(i => i.type === 'courses').length,
  videos:  LIB_ITEMS.filter(i => i.type === 'videos').length,
  games:   LIB_ITEMS.filter(i => i.type === 'games').length,
};

export default function LibraryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const { state, patch } = useKidsState();

  const itemOrUndef = LIB_ITEMS.find(i => i.id === id);
  const [owned, setOwned] = useState(OWNED_DEFAULT);

  if (!itemOrUndef) {
    return (
      <div className="flex h-[100dvh] items-center justify-center flex-col gap-4 bg-white">
        <span style={{ fontSize: 48 }}>😕</span>
        <p className="font-black" style={{ fontSize: 18, color: '#1A1A2E' }}>Не знайдено</p>
        <button onClick={() => router.back()}
          className="rounded-xl px-6 py-3 font-black text-white"
          style={{ background: '#4F9CF9', boxShadow: '0 3px 0 #1D4ED8' }}>
          ← Назад
        </button>
      </div>
    );
  }

  const item     = itemOrUndef;
  const accent   = TYPE_ACCENT[item.type];
  const desc     = LIB_DESCRIPTIONS[item.id] ?? 'Цікавий навчальний матеріал для покращення знань англійської мови.';
  const longParas = LIB_LONG[item.id] ?? [desc, 'Цей матеріал входить до навчальної бібліотеки English Kids і був відібраний з урахуванням вікових особливостей і рівня мови. Тексти адаптовані, ключові слова підсвічуються, а складні моменти супроводжуються підказками.', 'Під час роботи з матеріалом ти заробляєш монети та XP, а прогрес зберігається автоматично — можна повернутися до читання чи перегляду будь-коли.'];
  const preview   = LIB_PREVIEWS[item.id];
  const isOwned  = owned.has(item.id);
  const isLocked = !canAccessLevel(mockKidsUser.level, item.level);
  const balance  = state.coins ?? mockKidsUser.coins;
  const canAfford = balance >= item.price;

  function handleGet() {
    if (isLocked || isOwned) return;
    if (item.price > 0 && !canAfford) return;
    setOwned(prev => new Set([...prev, item.id]));
    if (item.price > 0) patch({ coins: Math.max(0, balance - item.price) });
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-white">

      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 flex-shrink-0"
        style={{
          paddingTop: 'env(safe-area-inset-top, 14px)', paddingBottom: 14,
          borderBottom: '1px solid #F3F4F6', background: 'white',
        }}>
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-lg flex-shrink-0 active:scale-90 transition-transform"
          style={{ background: '#F3F4F6', color: '#374151' }}>←</button>
        <p className="font-black" style={{ fontSize: 15, color: '#1A1A2E' }}>Бібліотека</p>
        <span style={{ fontSize: 14, color: '#D1D5DB' }}>›</span>
        <p className="font-medium truncate" style={{ fontSize: 14, color: '#6B7280' }}>{item.titleEn}</p>
      </div>

      {/* ── MAIN (sidebar + content) ─────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <div className="flex flex-col flex-shrink-0 overflow-y-auto bg-white"
          style={{ width: 196, borderRight: '1px solid #F3F4F6', paddingTop: 20, paddingBottom: 20 }}>
          <p className="px-5 mb-2 font-black uppercase tracking-widest" style={{ fontSize: 10, color: '#9CA3AF' }}>
            Категорія
          </p>
          {LIB_CATEGORIES.map(cat => {
            const isActive = cat.id === 'all'
              ? false
              : cat.id === item.type;
            return (
              <button key={cat.id}
                onClick={() => router.push('/kids/school')}
                className="flex items-center justify-between px-5 py-2.5 text-left transition-colors"
                style={{
                  background: isActive ? '#F3F4F6' : 'transparent',
                  borderLeft: isActive ? '3px solid #1A1A2E' : '3px solid transparent',
                }}>
                <span className="font-bold"
                  style={{ fontSize: 13, color: isActive ? '#1A1A2E' : '#6B7280', fontWeight: isActive ? 800 : 500 }}>
                  {cat.label}
                </span>
                <span className="font-medium" style={{ fontSize: 11, color: '#9CA3AF' }}>{COUNTS[cat.id]}</span>
              </button>
            );
          })}
        </div>

        {/* ── Detail content ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* Hero section */}
          <div className="flex gap-8 px-10 py-8" style={{ borderBottom: '1px solid #F3F4F6' }}>

            {/* Large book cover */}
            <div className="flex-shrink-0 rounded-2xl overflow-hidden flex items-center justify-center"
              style={{
                width: 180, height: 240,
                background: COVER_BG[item.type],
                boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
                fontSize: 90,
                filter: isLocked ? 'grayscale(0.4)' : 'none',
              }}>
              {item.emoji}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-3 flex-1 min-w-0 pt-1">
              {/* Type + level */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-md px-2.5 py-0.5 font-bold"
                  style={{ fontSize: 11.5, background: `${accent}15`, color: accent, border: `1px solid ${accent}28` }}>
                  {TYPE_ICON[item.type]} {TYPE_LABEL[item.type]}
                </span>
                <span className="rounded-md px-2.5 py-0.5 font-bold"
                  style={{ fontSize: 11.5, background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}>
                  {item.level}
                </span>
              </div>

              {/* Title */}
              <div>
                <h1 className="font-black leading-tight" style={{ fontSize: 26, color: '#1A1A2E', letterSpacing: '-0.03em' }}>
                  {item.titleEn}
                </h1>
                <p className="font-medium mt-1" style={{ fontSize: 15, color: '#9CA3AF' }}>
                  {item.titleUa}
                </p>
                <p className="font-medium mt-0.5" style={{ fontSize: 13, color: '#C4C4C4' }}>
                  {item.subtitle}
                </p>
              </div>

              {/* Short tagline */}
              <p className="font-medium leading-relaxed" style={{ fontSize: 14.5, color: '#374151', lineHeight: 1.55 }}>
                {desc}
              </p>

              {/* Action */}
              <div className="mt-2">
                {isLocked ? (
                  <div className="inline-flex items-center gap-2 rounded-xl px-5 py-3"
                    style={{ background: '#F3F4F6', border: '2px solid #E5E7EB' }}>
                    <span style={{ fontSize: 18 }}>🔒</span>
                    <span className="font-black" style={{ fontSize: 14, color: '#9CA3AF' }}>Потрібен рівень {item.level}</span>
                  </div>
                ) : isOwned ? (
                  <button className="rounded-xl font-black text-white px-8 py-3 active:translate-y-0.5 transition-transform"
                    style={{ fontSize: 15, background: accent, boxShadow: `0 4px 0 ${accent}cc` }}>
                    Відкрити →
                  </button>
                ) : item.price === 0 ? (
                  <button onClick={handleGet}
                    className="rounded-xl font-black text-white px-8 py-3 active:translate-y-0.5 transition-transform"
                    style={{ fontSize: 15, background: '#22C55E', boxShadow: '0 4px 0 #16A34A' }}>
                    Отримати безкоштовно ✓
                  </button>
                ) : canAfford ? (
                  <button onClick={handleGet}
                    className="rounded-xl font-black text-white px-8 py-3 active:translate-y-0.5 transition-transform flex items-center gap-2"
                    style={{ fontSize: 15, background: accent, boxShadow: `0 4px 0 ${accent}cc` }}>
                    <img src="/coin.png" alt="coin" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                    Купити за {item.price} монет
                  </button>
                ) : (
                  <div className="inline-flex flex-col gap-0.5">
                    <div className="inline-flex items-center gap-2 rounded-xl px-5 py-3"
                      style={{ background: '#FFF7ED', border: '2px solid #FED7AA' }}>
                      <img src="/coin.png" alt="coin" style={{ width: 18, height: 18, objectFit: 'contain' }} />
                      <span className="font-black" style={{ fontSize: 14, color: '#D97706' }}>Не вистачає монет</span>
                    </div>
                    <p className="font-medium px-2" style={{ fontSize: 12, color: '#F59E0B' }}>
                      Є {balance} / потрібно {item.price}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Long description */}
          <div className="px-10 py-8" style={{ borderBottom: '1px solid #F3F4F6' }}>
            <p className="font-black mb-4" style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
              Про матеріал
            </p>
            <div className="flex flex-col gap-4" style={{ maxWidth: 680 }}>
              {longParas.map((p, i) => (
                <p key={i} className="font-medium" style={{ fontSize: 15, color: '#374151', lineHeight: 1.7 }}>
                  {p}
                </p>
              ))}
            </div>
          </div>

          {/* Preview excerpt */}
          {preview && (
            <div className="px-10 py-8" style={{ borderBottom: '1px solid #F3F4F6' }}>
              <p className="font-black mb-4" style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                {preview.title}
              </p>
              <div className="relative rounded-2xl px-8 py-7"
                style={{
                  maxWidth: 680,
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAF7 100%)',
                  border: '1px solid #EAE5D8',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04), inset 0 0 0 6px rgba(255,255,255,0.8)',
                }}>
                <span className="absolute top-3 left-5 font-black" style={{ fontSize: 42, color: `${accent}38`, lineHeight: 1 }}>“</span>
                <div className="pl-6">
                  {preview.text.split('\n\n').map((para, i) => (
                    <p key={i} className="font-medium" style={{ fontSize: 15.5, color: '#1F2937', lineHeight: 1.75, marginTop: i === 0 ? 0 : 14, fontFamily: 'Georgia, serif' }}>
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Details section */}
          <div className="px-10 py-6">
            <p className="font-black mb-4" style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
              Деталі
            </p>
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: '🏅', label: 'Рівень',   value: item.level },
                { icon: TYPE_ICON[item.type], label: 'Тип', value: TYPE_LABEL[item.type] },
                { icon: '📦', label: 'Обсяг',    value: item.subtitle },
                { icon: '💰', label: 'Доступ',   value: isOwned ? 'Відкрито' : isLocked ? `Від ${item.level}` : item.price === 0 ? 'Безкоштовно' : `${item.price} монет` },
              ].map(row => (
                <div key={row.label} className="rounded-xl px-4 py-3"
                  style={{ background: '#F9FAFB', border: '1.5px solid #F3F4F6' }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span style={{ fontSize: 15 }}>{row.icon}</span>
                    <span style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      {row.label}
                    </span>
                  </div>
                  <p className="font-black" style={{ fontSize: 14, color: '#1A1A2E' }}>{row.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* More from same category */}
          <div className="px-10 pb-12">
            <p className="font-black mb-4" style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
              {TYPE_SECTION[item.type]} — ще матеріали
            </p>
            <div className="flex flex-col gap-0" style={{ border: '1.5px solid #F3F4F6', borderRadius: 16, overflow: 'hidden' }}>
              {LIB_ITEMS.filter(i => i.type === item.type && i.id !== item.id).slice(0, 4).map((rel, idx, arr) => (
                <button key={rel.id} onClick={() => router.push(`/kids/library/${rel.id}`)}
                  className="flex items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-[#FAFAFA]"
                  style={{ borderBottom: idx < arr.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <div className="flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
                    style={{ width: 44, height: 58, background: COVER_BG[rel.type], fontSize: 26 }}>
                    {rel.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black leading-tight truncate" style={{ fontSize: 14, color: '#1A1A2E' }}>{rel.titleEn}</p>
                    <p className="font-medium" style={{ fontSize: 12, color: '#9CA3AF' }}>{rel.titleUa}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="rounded-md px-2 py-0.5 font-bold"
                      style={{ fontSize: 11, background: '#F3F4F6', color: '#374151' }}>{rel.level}</span>
                    <span style={{ fontSize: 16, color: '#D1D5DB' }}>›</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
