'use client';
import { useState, type CSSProperties } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockKidsUser } from '@/mocks/user';
import { useKidsState } from '@/lib/use-kids-store';
import {
  LIB_ITEMS, LIB_DESCRIPTIONS, LIB_LONG, LIB_PREVIEWS, LIB_CATEGORIES,
  TYPE_ACCENT, TYPE_LABEL, TYPE_SECTION,
  canAccessLevel,
  type LibTabId,
} from '@/lib/library-data';

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
      <div className="flex h-dvh items-center justify-center flex-col gap-4 bg-white">
        <span className="text-5xl">😕</span>
        <p className="font-black text-lg text-gray-900">Не знайдено</p>
        <button onClick={() => router.back()}
          className="rounded-xl px-6 py-3 font-black text-white bg-blue-500 shadow-[0_3px_0_#1D4ED8]">
          ← Назад
        </button>
      </div>
    );
  }

  const item      = itemOrUndef;
  const accent    = TYPE_ACCENT[item.type];
  const desc      = LIB_DESCRIPTIONS[item.id] ?? 'Цікавий навчальний матеріал для покращення знань англійської мови.';
  const longParas = LIB_LONG[item.id] ?? [desc, 'Цей матеріал входить до навчальної бібліотеки English Kids і був відібраний з урахуванням вікових особливостей і рівня мови. Тексти адаптовані, ключові слова підсвічуються, а складні моменти супроводжуються підказками.', 'Під час роботи з матеріалом ти заробляєш монети та XP, а прогрес зберігається автоматично — можна повернутися до читання чи перегляду будь-коли.'];
  const preview   = LIB_PREVIEWS[item.id];
  const isOwned   = owned.has(item.id);
  const isLocked  = !canAccessLevel(mockKidsUser.level, item.level);
  const balance   = state.coins ?? mockKidsUser.coins;
  const canAfford = balance >= item.price;

  // Dynamic accent color fed to CSS custom properties — kept inline on purpose.
  const accentVars = { '--accent': accent, '--cover-bg': COVER_BG[item.type] } as CSSProperties;

  function handleGet() {
    if (isLocked || isOwned) return;
    if (item.price > 0 && !canAfford) return;
    setOwned(prev => new Set([...prev, item.id]));
    if (item.price > 0) patch({ coins: Math.max(0, balance - item.price) });
  }

  return (
    <div className="flex flex-col h-dvh bg-white" style={accentVars}>
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 flex-shrink-0 py-3.5 border-b border-gray-100 bg-white pt-[max(14px,env(safe-area-inset-top))]">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-lg flex-shrink-0 bg-gray-100 text-gray-700 active:scale-90 transition-transform">
          ←
        </button>
        <p className="font-black text-[15px] text-gray-900">Бібліотека</p>
        <span className="text-sm text-gray-300">›</span>
        <p className="font-medium truncate text-sm text-gray-500">{item.titleEn}</p>
      </div>

      {/* Main (sidebar + content) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="flex flex-col flex-shrink-0 overflow-y-auto bg-white w-[196px] border-r border-gray-100 py-5">
          <p className="px-5 mb-2 font-black uppercase tracking-widest text-[10px] text-gray-400">Категорія</p>
          {LIB_CATEGORIES.map(cat => {
            const isActive = cat.id !== 'all' && cat.id === item.type;
            return (
              <button key={cat.id}
                onClick={() => router.push('/kids/school')}
                className={[
                  "flex items-center justify-between px-5 py-2.5 text-left transition-colors border-l-[3px]",
                  isActive ? "bg-gray-100 border-gray-900" : "bg-transparent border-transparent",
                ].join(" ")}>
                <span className={["text-[13px]", isActive ? "text-gray-900 font-extrabold" : "text-gray-500 font-medium"].join(" ")}>
                  {cat.label}
                </span>
                <span className="font-medium text-[11px] text-gray-400">{COUNTS[cat.id]}</span>
              </button>
            );
          })}
        </div>

        {/* Detail content */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero */}
          <div className="flex gap-8 px-10 py-8 border-b border-gray-100">
            {/* Cover */}
            <div className={[
              "flex-shrink-0 rounded-2xl overflow-hidden flex items-center justify-center w-[180px] h-[240px] shadow-[0_8px_32px_rgba(0,0,0,0.28)] text-[90px] bg-[image:var(--cover-bg)]",
              isLocked && "grayscale-[0.4]",
            ].filter(Boolean).join(" ")}>
              {item.emoji}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-3 flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-md px-2.5 py-0.5 font-bold text-[11.5px] bg-[color:var(--accent)]/10 text-[color:var(--accent)] border border-[color:var(--accent)]/25">
                  {TYPE_ICON[item.type]} {TYPE_LABEL[item.type]}
                </span>
                <span className="rounded-md px-2.5 py-0.5 font-bold text-[11.5px] bg-gray-100 text-gray-700 border border-gray-200">
                  {item.level}
                </span>
              </div>

              <div>
                <h1 className="font-black leading-tight text-[26px] text-gray-900 tracking-tight">
                  {item.titleEn}
                </h1>
                <p className="font-medium mt-1 text-[15px] text-gray-400">{item.titleUa}</p>
                <p className="font-medium mt-0.5 text-[13px] text-gray-300">{item.subtitle}</p>
              </div>

              <p className="font-medium leading-relaxed text-[14.5px] text-gray-700">{desc}</p>

              <div className="mt-2">
                {isLocked ? (
                  <div className="inline-flex items-center gap-2 rounded-xl px-5 py-3 bg-gray-100 border-2 border-gray-200">
                    <span className="text-lg">🔒</span>
                    <span className="font-black text-sm text-gray-400">Потрібен рівень {item.level}</span>
                  </div>
                ) : isOwned ? (
                  <button className="rounded-xl font-black text-white px-8 py-3 text-[15px] bg-[color:var(--accent)] shadow-[0_4px_0_color-mix(in_oklab,var(--accent),black_20%)] active:translate-y-0.5 transition-transform">
                    Відкрити →
                  </button>
                ) : item.price === 0 ? (
                  <button onClick={handleGet}
                    className="rounded-xl font-black text-white px-8 py-3 text-[15px] bg-green-500 shadow-[0_4px_0_#16A34A] active:translate-y-0.5 transition-transform">
                    Отримати безкоштовно ✓
                  </button>
                ) : canAfford ? (
                  <button onClick={handleGet}
                    className="rounded-xl font-black text-white px-8 py-3 text-[15px] bg-[color:var(--accent)] shadow-[0_4px_0_color-mix(in_oklab,var(--accent),black_20%)] active:translate-y-0.5 transition-transform flex items-center gap-2">
                    <img src="/coin.png" alt="coin" width={20} height={20} className="object-contain" />
                    Купити за {item.price} монет
                  </button>
                ) : (
                  <div className="inline-flex flex-col gap-0.5">
                    <div className="inline-flex items-center gap-2 rounded-xl px-5 py-3 bg-orange-50 border-2 border-orange-200">
                      <img src="/coin.png" alt="coin" width={18} height={18} className="object-contain" />
                      <span className="font-black text-sm text-amber-600">Не вистачає монет</span>
                    </div>
                    <p className="font-medium px-2 text-xs text-amber-500">
                      Є {balance} / потрібно {item.price}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Long description */}
          <div className="px-10 py-8 border-b border-gray-100">
            <p className="font-black mb-4 text-[11px] text-gray-400 uppercase tracking-[0.09em]">Про матеріал</p>
            <div className="flex flex-col gap-4 max-w-[680px]">
              {longParas.map((p, i) => (
                <p key={i} className="font-medium text-[15px] text-gray-700 leading-[1.7]">{p}</p>
              ))}
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div className="px-10 py-8 border-b border-gray-100">
              <p className="font-black mb-4 text-[11px] text-gray-400 uppercase tracking-[0.09em]">{preview.title}</p>
              <div className="relative rounded-2xl px-8 py-7 max-w-[680px] bg-[linear-gradient(180deg,#FFFFFF_0%,#FAFAF7_100%)] border border-[#EAE5D8] shadow-[0_2px_10px_rgba(0,0,0,0.04),inset_0_0_0_6px_rgba(255,255,255,0.8)]">
                <span className="absolute top-3 left-5 font-black text-[42px] leading-none text-[color:var(--accent)]/20">“</span>
                <div className="pl-6">
                  {preview.text.split('\n\n').map((para, i) => (
                    <p key={i}
                      className={["font-medium text-[15.5px] text-gray-800 leading-[1.75] font-serif", i > 0 && "mt-3.5"].filter(Boolean).join(" ")}>
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="px-10 py-6">
            <p className="font-black mb-4 text-[11px] text-gray-400 uppercase tracking-[0.09em]">Деталі</p>
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: '🏅', label: 'Рівень', value: item.level },
                { icon: TYPE_ICON[item.type], label: 'Тип', value: TYPE_LABEL[item.type] },
                { icon: '📦', label: 'Обсяг', value: item.subtitle },
                { icon: '💰', label: 'Доступ', value: isOwned ? 'Відкрито' : isLocked ? `Від ${item.level}` : item.price === 0 ? 'Безкоштовно' : `${item.price} монет` },
              ].map(row => (
                <div key={row.label} className="rounded-xl px-4 py-3 bg-gray-50 border-[1.5px] border-gray-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[15px]">{row.icon}</span>
                    <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-[0.07em]">{row.label}</span>
                  </div>
                  <p className="font-black text-sm text-gray-900">{row.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Related */}
          <div className="px-10 pb-12">
            <p className="font-black mb-4 text-[11px] text-gray-400 uppercase tracking-[0.09em]">
              {TYPE_SECTION[item.type]} — ще матеріали
            </p>
            <div className="flex flex-col border-[1.5px] border-gray-100 rounded-2xl overflow-hidden">
              {LIB_ITEMS.filter(i => i.type === item.type && i.id !== item.id).slice(0, 4).map((rel, idx, arr) => (
                <button key={rel.id} onClick={() => router.push(`/kids/library/${rel.id}`)}
                  className={[
                    "flex items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-gray-50",
                    idx < arr.length - 1 && "border-b border-gray-100",
                  ].filter(Boolean).join(" ")}>
                  <div
                    className="flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center w-11 h-[58px] text-[26px]"
                    style={{ background: COVER_BG[rel.type] }}>
                    {rel.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black leading-tight truncate text-sm text-gray-900">{rel.titleEn}</p>
                    <p className="font-medium text-xs text-gray-400">{rel.titleUa}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="rounded-md px-2 py-0.5 font-bold text-[11px] bg-gray-100 text-gray-700">{rel.level}</span>
                    <span className="text-base text-gray-300">›</span>
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
