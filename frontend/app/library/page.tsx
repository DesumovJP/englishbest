/**
 * /library — публічний каталог програм (kind=course).
 *
 * Дані живі через `fetchCourses({ kind: 'course' })`. Kids мають окремий
 * UI (`/kids/library/[id]`), але той самий API.
 */
'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchCourses } from '@/lib/api';
import type { Course, Level } from '@/lib/types';

type SortKey = 'rating' | 'lessons' | 'reviews';
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'rating',  label: 'Рейтинг' },
  { key: 'lessons', label: 'Уроків' },
  { key: 'reviews', label: 'Відгуків' },
];

const LEVELS: (Level | 'Всі')[] = ['Всі', 'A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const LEVEL_GRADIENT: Record<Level, string> = {
  A0: 'from-primary to-primary-dark',
  A1: 'from-secondary to-secondary-dark',
  A2: 'from-secondary-dark to-secondary',
  B1: 'from-success to-success-dark',
  B2: 'from-purple to-purple-dark',
  C1: 'from-ink to-ink/80',
  C2: 'from-ink to-ink/80',
};

function gradientFor(level?: Level): string {
  return level ? LEVEL_GRADIENT[level] : 'from-primary to-primary-dark';
}

function lessonsCountOf(course: Course): number {
  return course.sections.reduce((sum, s) => sum + (s.lessonSlugs?.length ?? 0), 0);
}

export default function LibraryPage() {
  const [courses,  setCourses]  = useState<Course[] | null>(null);
  const [error,    setError]    = useState<string | null>(null);
  const [level,    setLevel]    = useState<Level | 'Всі'>('Всі');
  const [query,    setQuery]    = useState('');
  const [sortKey,  setSortKey]  = useState<SortKey>('rating');

  useEffect(() => {
    let alive = true;
    fetchCourses({ kind: 'course' })
      .then((rows) => { if (alive) setCourses(rows); })
      .catch((e) => { if (alive) setError(e instanceof Error ? e.message : 'failed'); });
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const rows = courses ?? [];
    return rows
      .filter((p) => {
        const matchLevel = level === 'Всі' || p.level === level;
        const matchQuery = query === '' || p.title.toLowerCase().includes(query.toLowerCase());
        return matchLevel && matchQuery;
      })
      .sort((a, b) => {
        if (sortKey === 'lessons') return lessonsCountOf(b) - lessonsCountOf(a);
        if (sortKey === 'reviews') return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
        return (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0);
      });
  }, [courses, level, query, sortKey]);

  return (
    <div className="flex flex-col gap-5">

      <div>
        <h1 className="text-2xl font-black text-ink">Програми навчання</h1>
        <p className="text-ink-muted mt-0.5 text-sm">Оберіть рівень — ми підберемо вчителя для вашої дитини</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative w-56 flex-shrink-0">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Пошук..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-white text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="h-9 pl-3 pr-8 rounded-xl border border-primary/40 bg-primary/5 text-primary-dark text-xs font-bold focus:outline-none focus:border-primary cursor-pointer appearance-none flex-shrink-0 select-arrow-primary"
        >
          {SORT_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
        <div className="flex items-center gap-1.5 flex-wrap">
          {LEVELS.map((l) => (
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

      {courses === null && !error ? (
        <div className="text-center py-16 text-ink-muted">
          <p className="font-semibold">Завантаження…</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 text-danger">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="font-semibold">Не вдалось завантажити програми</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-ink-muted">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold">Нічого не знайдено</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => {
            const lessonsCount = lessonsCountOf(p);
            const reviews      = p.reviewCount ?? 0;
            const rating       = p.ratingAvg   ?? 0;
            const teacherName  = p.teacher?.displayName ?? '';
            const teacherPhoto = p.teacher?.avatarUrl   ?? '';
            const gradient     = gradientFor(p.level);
            const comingSoon   = p.status === 'comingSoon';

            return (
              <div
                key={p.slug}
                className={`rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 flex flex-col ${comingSoon ? 'opacity-60' : ''}`}
              >
                <div className={`bg-gradient-to-br ${gradient} px-5 pt-6 pb-10 flex flex-col gap-1`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-[0.18em] text-white/70 uppercase">{p.level ?? ''}</span>
                    {reviews > 0 && (
                      <span className="text-[11px] font-black text-white/90">★ {rating.toFixed(1)}</span>
                    )}
                  </div>
                  <h3 className="text-white font-black text-2xl leading-tight mt-3">{p.title}</h3>
                  <p className="text-white/60 text-[11px] font-semibold mt-0.5">
                    {lessonsCount} уроків{reviews > 0 ? ` · ${reviews} відгуків` : ''}
                  </p>
                </div>

                <div className="bg-white rounded-t-3xl -mt-5 flex-1 flex flex-col px-5 pt-5 pb-5 gap-4">
                  {p.description && (
                    <p className="text-sm text-ink-muted leading-relaxed line-clamp-2">{p.description}</p>
                  )}

                  {p.tags && p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {p.tags.map((tag) => (
                        <span key={tag} className="text-[11px] bg-surface-muted text-ink-muted px-3 py-1 rounded-full font-semibold">{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2.5 mt-auto">
                    {teacherPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={teacherPhoto} alt={teacherName} className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-2 ring-border" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-surface-muted flex-shrink-0 ring-2 ring-border" />
                    )}
                    <span className="text-xs font-semibold text-ink-muted flex-1 truncate">{teacherName || '—'}</span>
                    {comingSoon ? (
                      <span className="text-[11px] font-bold text-ink-muted bg-surface-muted px-3 py-1.5 rounded-full">Незабаром</span>
                    ) : (
                      <Link
                        href={`/library/${p.slug}`}
                        className={`text-[11px] font-black px-4 py-1.5 rounded-full bg-gradient-to-br ${gradient} text-white hover:opacity-85 transition-opacity flex-shrink-0`}
                      >
                        Детальніше
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
