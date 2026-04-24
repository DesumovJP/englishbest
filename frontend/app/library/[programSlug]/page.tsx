/**
 * /library/[programSlug] — публічна сторінка програми (kind=course).
 *
 * Live через `fetchCourseBySlug` + `fetchLessonsByCourse`.
 * Reviews — через `<CourseReviews>` (scoped BE, owner-only edit/delete).
 */
'use client';
import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchCourseBySlug, fetchLessonsByCourse } from '@/lib/api';
import { CourseReviews } from '@/components/organisms/CourseReviews';
import type { Course, Lesson, Level } from '@/lib/types';

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

export default function ProgramDetailPage({
  params,
}: {
  params: Promise<{ programSlug: string }>;
}) {
  const { programSlug } = use(params);

  const [course,  setCourse]  = useState<Course | null | undefined>(undefined);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [openSection, setOpenSection] = useState<number | null>(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const c = await fetchCourseBySlug(programSlug).catch(() => null);
      if (!alive) return;
      setCourse(c);
      if (c) {
        const ls = await fetchLessonsByCourse(programSlug).catch(() => []);
        if (alive) setLessons(ls);
      }
    })();
    return () => { alive = false; };
  }, [programSlug]);

  const lessonsBySlug = useMemo(() => {
    const map = new Map<string, Lesson>();
    for (const l of lessons) map.set(l.slug, l);
    return map;
  }, [lessons]);

  if (course === undefined) {
    return (
      <div className="flex flex-col gap-5 max-w-4xl">
        <p className="text-ink-muted text-sm">Завантаження…</p>
      </div>
    );
  }

  if (course === null) notFound();

  const gradient       = gradientFor(course.level);
  const totalLessons   = lessonsCountOf(course);
  const teacherName    = course.teacher?.displayName ?? '';
  const teacherPhoto   = course.teacher?.avatarUrl   ?? '';
  const teacherBio     = course.teacher?.bio         ?? '';
  const rating         = course.ratingAvg ?? 0;
  const reviews        = course.reviewCount ?? 0;
  const durationWeeks  = course.durationWeeks;
  const currency       = course.currency === 'USD' ? '$' : course.currency === 'EUR' ? '€' : '₴';
  const price          = typeof course.price === 'number' ? course.price : 0;

  return (
    <div className="flex flex-col gap-5">

      {/* Hero */}
      <div className="rounded-3xl overflow-hidden shadow-lg">
        <div className={`bg-gradient-to-br ${gradient} px-6 pt-6 pb-14`}>
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/library"
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm font-semibold"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Програми
            </Link>
            <span className="text-[11px] font-black tracking-[0.18em] text-white/70 uppercase">{course.level ?? ''}</span>
          </div>

          <h1 className="text-3xl font-black text-white leading-tight">{course.title}</h1>
          {course.description && (
            <p className="text-white/65 text-sm mt-2 leading-relaxed max-w-lg">{course.description}</p>
          )}

          {course.tags && course.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {course.tags.map((t) => (
                <span key={t} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-black/20 text-white/80 border border-white/15">{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="bg-white rounded-t-3xl -mt-6 px-6 pt-5 pb-5">
          <div className="flex items-center gap-6">
            {[
              { value: totalLessons || '—',                                        label: 'уроків' },
              { value: durationWeeks ?? '—',                                       label: 'тижнів' },
              { value: price > 0 ? `${currency}\u00a0${price}` : '—',              label: 'за курс' },
              { value: reviews > 0 ? `★\u00a0${rating.toFixed(1)}` : '—',          label: reviews > 0 ? `${reviews} відгуків` : 'без відгуків' },
            ].map((m, i, arr) => (
              <div key={i} className={`flex flex-col flex-1 ${i < arr.length - 1 ? 'border-r border-border pr-6' : ''}`}>
                <span className="text-lg font-black text-ink">{m.value}</span>
                <span className="text-[11px] text-ink-muted font-medium">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

        <div className="flex flex-col gap-4">
          {course.description && (
            <div className="bg-white rounded-2xl border border-border p-5">
              <h2 className="font-black text-ink mb-2">Про програму</h2>
              <p className="text-sm text-ink-muted leading-relaxed whitespace-pre-line">{course.description}</p>
            </div>
          )}

          {/* Curriculum */}
          {course.sections.length > 0 && (
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-black text-ink">Програма занять</h2>
              </div>
              <ul className="divide-y divide-border">
                {course.sections.map((sec, i) => {
                  const sectionLessons = (sec.lessonSlugs ?? [])
                    .map((slug) => lessonsBySlug.get(slug))
                    .filter((l): l is Lesson => !!l);
                  const lessonTitles = sectionLessons.length > 0
                    ? sectionLessons.map((l) => l.title)
                    : (sec.lessonSlugs ?? []);

                  return (
                    <li key={sec.slug || i}>
                      <button
                        onClick={() => setOpenSection(openSection === i ? null : i)}
                        className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface-muted/50 transition-colors text-left"
                        aria-expanded={openSection === i}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-surface-muted text-xs font-black text-ink flex items-center justify-center flex-shrink-0">{i + 1}</span>
                          <span className="text-sm font-semibold text-ink">{sec.title}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-xs text-ink-muted">{lessonTitles.length} уроків</span>
                          <svg className={`w-4 h-4 text-ink-muted transition-transform ${openSection === i ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </div>
                      </button>
                      {openSection === i && (
                        <ul className="px-5 pb-3 flex flex-col gap-1">
                          {lessonTitles.length === 0 ? (
                            <li className="py-1.5 text-sm text-ink-muted italic">Поки немає уроків</li>
                          ) : (
                            lessonTitles.map((title, j) => (
                              <li key={j} className="flex items-center gap-3 py-1.5">
                                <span className="w-5 h-5 rounded-full border-2 border-border flex items-center justify-center flex-shrink-0 text-[10px] text-ink-muted font-bold">{j + 1}</span>
                                <span className="text-sm text-ink-muted">{title}</span>
                              </li>
                            ))
                          )}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Reviews */}
          <CourseReviews courseDocumentId={course.documentId} />
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-border p-5 flex flex-col gap-4">
            <div>
              <p className="text-xs font-black text-ink-muted uppercase tracking-wide mb-1">Вартість</p>
              <p className="text-3xl font-black text-ink">
                {price > 0 ? <>{currency}&nbsp;{price.toLocaleString()}</> : '—'}
                {price > 0 && <span className="text-base text-ink-muted font-normal">/курс</span>}
              </p>
            </div>
            <button className={`w-full py-3 rounded-xl bg-gradient-to-br ${gradient} text-white font-black text-sm hover:opacity-90 transition-opacity`}>
              Записатись на пробний урок →
            </button>
            <button className="w-full py-2.5 rounded-xl border-2 border-border text-sm font-bold text-ink hover:bg-surface-muted transition-colors">
              Поставити запитання
            </button>
            <p className="text-xs text-ink-muted text-center">Перший урок безкоштовно</p>
          </div>

          {teacherName && (
            <div className="bg-white rounded-2xl border border-border p-5">
              <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest mb-3">Автор</p>
              <div className="flex items-center gap-3 mb-3">
                {teacherPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={teacherPhoto} alt={teacherName} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-surface-muted flex-shrink-0" />
                )}
                <div>
                  <p className="font-black text-ink">{teacherName}</p>
                  {reviews > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-accent text-sm">★</span>
                      <span className="text-sm font-bold text-ink">{rating.toFixed(1)}</span>
                      <span className="text-xs text-ink-muted">({reviews})</span>
                    </div>
                  )}
                </div>
              </div>
              {teacherBio && (
                <p className="text-xs text-ink-muted leading-relaxed">{teacherBio}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
