'use client';
import { useState } from 'react';
import Link from 'next/link';

/* ─── Мок програм ────────────────────────────── */
const PROGRAMS = [
  {
    slug: 'starter-kids',
    title: 'Стартер для малюків',
    description: 'Перші слова через ігри, пісні та малюнки. Ідеально для дітей 4–7 років.',
    level: 'A0',
    headerGradient: 'from-primary to-primary-dark',
    levelBadge: 'bg-white/20 text-white',
    teacher: { name: 'Olga K.', photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
    tags: ['Діти 4–7', 'Ігри', 'Пісні'],
    rating: 4.9, reviews: 124, lessonsCount: 24,
    status: 'available' as const,
  },
  {
    slug: 'elementary-kids',
    title: 'Базовий рівень',
    description: 'Розмовна англійська, шкільна програма та улюблені теми дитини.',
    level: 'A1',
    headerGradient: 'from-secondary to-secondary-dark',
    levelBadge: 'bg-white/20 text-white',
    teacher: { name: 'Maria S.', photo: 'https://randomuser.me/api/portraits/women/65.jpg' },
    tags: ['Діти 7–11', 'Граматика', 'Розмова'],
    rating: 4.8, reviews: 89, lessonsCount: 36,
    status: 'available' as const,
  },
  {
    slug: 'pre-intermediate',
    title: 'Передсередній рівень',
    description: 'Поглиблена граматика, читання та перші навички письма.',
    level: 'A2',
    headerGradient: 'from-secondary-dark to-secondary',
    levelBadge: 'bg-white/20 text-white',
    teacher: { name: 'Maria S.', photo: 'https://randomuser.me/api/portraits/women/65.jpg' },
    tags: ['Діти 9–12', 'Письмо', 'Читання'],
    rating: 4.7, reviews: 61, lessonsCount: 40,
    status: 'available' as const,
  },
  {
    slug: 'intermediate-teens',
    title: 'Середній рівень',
    description: 'Підготовка до шкільних тестів, складна граматика та вимова.',
    level: 'B1',
    headerGradient: 'from-success to-success-dark',
    levelBadge: 'bg-white/20 text-white',
    teacher: { name: 'Dmytro P.', photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
    tags: ['Підлітки', 'Іспити', 'Вимова'],
    rating: 4.8, reviews: 203, lessonsCount: 48,
    status: 'available' as const,
  },
  {
    slug: 'upper-intermediate',
    title: 'Впевнений рівень',
    description: 'Вільна розмова, бізнес-англійська та міжнародні сертифікати.',
    level: 'B2',
    headerGradient: 'from-purple to-purple-dark',
    levelBadge: 'bg-white/20 text-white',
    teacher: { name: 'Anna V.', photo: 'https://randomuser.me/api/portraits/women/23.jpg' },
    tags: ['14+', 'Бізнес', 'Сертифікати'],
    rating: 4.9, reviews: 178, lessonsCount: 52,
    status: 'available' as const,
  },
  {
    slug: 'exam-prep',
    title: 'Підготовка до ЗНО / NMT',
    description: 'Цільова підготовка до державних іспитів з максимальним балом.',
    level: 'B2',
    headerGradient: 'from-ink to-ink/80',
    levelBadge: 'bg-white/20 text-white',
    teacher: { name: 'Anna V.', photo: 'https://randomuser.me/api/portraits/women/23.jpg' },
    tags: ['Старшокласники', 'ЗНО', 'Тести'],
    rating: 5.0, reviews: 94, lessonsCount: 30,
    status: 'comingSoon' as const,
  },
];

type SortKey = 'rating' | 'lessons' | 'reviews';
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'rating',  label: 'Рейтинг' },
  { key: 'lessons', label: 'Уроків' },
  { key: 'reviews', label: 'Відгуків' },
];

const LEVELS = ['Всі', 'A0', 'A1', 'A2', 'B1', 'B2'];

export default function LibraryPage() {
  const [level,   setLevel]   = useState('Всі');
  const [query,   setQuery]   = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rating');

  const filtered = PROGRAMS
    .filter(p => {
      const matchLevel = level === 'Всі' || p.level === level;
      const matchQuery = query === '' || p.title.toLowerCase().includes(query.toLowerCase());
      return matchLevel && matchQuery;
    })
    .sort((a, b) => {
      if (sortKey === 'lessons') return b.lessonsCount - a.lessonsCount;
      if (sortKey === 'reviews') return b.reviews - a.reviews;
      return b.rating - a.rating;
    });

  return (
    <div className="flex flex-col gap-5">

      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-black text-ink">Програми навчання</h1>
        <p className="text-ink-muted mt-0.5 text-sm">Оберіть рівень — ми підберемо вчителя для вашої дитини</p>
      </div>

      {/* Пошук + сортування + рівні */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Пошук */}
        <div className="relative w-56 flex-shrink-0">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Пошук..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-white text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        {/* Сортування */}
        <select
          value={sortKey}
          onChange={e => setSortKey(e.target.value as SortKey)}
          className="h-9 pl-3 pr-8 rounded-xl border border-primary/40 bg-primary/5 text-primary-dark text-xs font-bold focus:outline-none focus:border-primary cursor-pointer appearance-none flex-shrink-0 select-arrow-primary"
        >
          {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
        {/* Рівні */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {LEVELS.map(l => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                level === l
                  ? 'border-primary bg-primary/10 text-primary-dark'
                  : 'border-border text-ink-muted hover:border-primary/40 hover:text-ink bg-white'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Сітка карток */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-ink-muted">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold">Нічого не знайдено</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(p => (
            <div
              key={p.slug}
              className={`rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 flex flex-col ${p.status === 'comingSoon' ? 'opacity-60' : ''}`}
            >
              {/* ── Full-bleed gradient ──────────────── */}
              <div className={`bg-gradient-to-br ${p.headerGradient} px-5 pt-6 pb-10 flex flex-col gap-1`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-[0.18em] text-white/70 uppercase">{p.level}</span>
                  {p.reviews > 0 && (
                    <span className="text-[11px] font-black text-white/90">★ {p.rating}</span>
                  )}
                </div>
                <h3 className="text-white font-black text-2xl leading-tight mt-3">{p.title}</h3>
                <p className="text-white/60 text-[11px] font-semibold mt-0.5">{p.lessonsCount} уроків · {p.reviews} відгуків</p>
              </div>

              {/* ── White sheet rising from bottom ───── */}
              <div className="bg-white rounded-t-3xl -mt-5 flex-1 flex flex-col px-5 pt-5 pb-5 gap-4">
                <p className="text-sm text-ink-muted leading-relaxed line-clamp-2">{p.description}</p>

                <div className="flex flex-wrap gap-1.5">
                  {p.tags.map(tag => (
                    <span key={tag} className="text-[11px] bg-surface-muted text-ink-muted px-3 py-1 rounded-full font-semibold">{tag}</span>
                  ))}
                </div>

                <div className="flex items-center gap-2.5 mt-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.teacher.photo} alt={p.teacher.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-2 ring-border" referrerPolicy="no-referrer" />
                  <span className="text-xs font-semibold text-ink-muted flex-1">{p.teacher.name}</span>
                  {p.status === 'comingSoon' ? (
                    <span className="text-[11px] font-bold text-ink-muted bg-surface-muted px-3 py-1.5 rounded-full">Незабаром</span>
                  ) : (
                    <Link
                      href={`/library/${p.slug}`}
                      className={`text-[11px] font-black px-4 py-1.5 rounded-full bg-gradient-to-br ${p.headerGradient} text-white hover:opacity-85 transition-opacity flex-shrink-0`}
                    >
                      Детальніше
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
