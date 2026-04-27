/**
 * Kids course detail — radical redesign.
 *
 *   1. Sticky back header (neutral).
 *   2. HERO — full-bleed gradient (course theme), big course emoji,
 *      title, level + audience + lessons-count chips, circular progress
 *      ring, large "Продовжити" CTA, fox stamp.
 *   3. "Що ти навчишся" — checklist parsed from descriptionLong (each
 *      paragraph ≈ one outcome).
 *   4. Vocabulary cards — anchor card big + per-lesson chips inline.
 *   5. Lessons grouped by Unit — each lesson rendered as a tile via
 *      `<LessonTileCard>`; current lesson is highlighted with a pulsing
 *      course-accent ring.
 *
 * Course visuals are admin-editable: `accentColor`, `gradientFrom/To`,
 * `coverImage` flow through `themeForCourse(course)`. No code change
 * required to re-skin a course in production.
 */
'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  fetchCoursesCached,
  fetchLessonsByCourseCached,
  peekCourses,
  peekLessonsByCourse,
} from '@/lib/api';
import {
  fetchMyProgressCached,
  peekMyProgress,
  type UserProgressRow,
} from '@/lib/user-progress';
import {
  fetchVocabularySets,
  peekVocabularySets,
  type VocabularySet,
} from '@/lib/vocabulary';
import type { Course, Lesson } from '@/lib/types';
import { useKidsIdentity } from '@/lib/use-kids-identity';
import { themeForCourse, type CourseTheme } from '@/lib/course-theme';
import { CourseHero } from '@/components/kids/CourseHero';
import { LessonTileCard, type LessonStatus } from '@/components/kids/LessonTileCard';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

type Level = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
const LEVEL_ORDER: Level[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function canAccessLevel(userLevel: Level, req: Level): boolean {
  return LEVEL_ORDER.indexOf(userLevel) >= LEVEL_ORDER.indexOf(req);
}

interface LessonRow {
  lesson: Lesson;
  status: LessonStatus;
}

interface UnitGroup {
  slug: string;
  title: string;
  rows: LessonRow[];
}

function pickStatuses(lessons: Lesson[], progress: UserProgressRow[]): LessonRow[] {
  const completed = new Set(
    progress
      .filter((r) => r.status === 'completed' && r.lesson?.documentId)
      .map((r) => r.lesson!.documentId),
  );
  const sorted = [...lessons].sort(
    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
  );
  let firstUnfinishedSeen = false;
  return sorted.map((lesson) => {
    if (completed.has(lesson.documentId)) {
      return { lesson, status: 'done' as const };
    }
    if (!firstUnfinishedSeen) {
      firstUnfinishedSeen = true;
      return { lesson, status: 'current' as const };
    }
    return { lesson, status: 'upcoming' as const };
  });
}

function groupBySection(course: Course, rows: LessonRow[]): UnitGroup[] {
  const sections = (course.sections ?? []).slice().sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  if (sections.length === 0) {
    return [{ slug: 'all', title: '', rows }];
  }
  const byLessonSlug = new Map<string, LessonRow>();
  rows.forEach((r) => byLessonSlug.set(r.lesson.slug, r));
  const used = new Set<string>();
  const groups: UnitGroup[] = sections.map((s) => {
    const sectionRows: LessonRow[] = [];
    for (const slug of s.lessonSlugs ?? []) {
      const row = byLessonSlug.get(slug);
      if (row) {
        sectionRows.push(row);
        used.add(slug);
      }
    }
    return { slug: s.slug, title: s.title, rows: sectionRows };
  });
  const orphans = rows.filter((r) => !used.has(r.lesson.slug));
  if (orphans.length > 0) {
    groups.push({ slug: '__orphans', title: 'Інше', rows: orphans });
  }
  return groups.filter((g) => g.rows.length > 0);
}

export default function KidsCourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { level: kidsLevel } = useKidsIdentity();

  const [courses, setCourses] = useState<Course[] | null>(() => peekCourses());
  const [lessons, setLessons] = useState<Lesson[] | null>(() => peekLessonsByCourse(id));
  const [progress, setProgress] = useState<UserProgressRow[] | null>(() => peekMyProgress());
  const [vocabSets, setVocabSets] = useState<VocabularySet[] | null>(() => peekVocabularySets());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetchCoursesCached(),
      fetchLessonsByCourseCached(id),
      fetchMyProgressCached().catch(() => [] as UserProgressRow[]),
      fetchVocabularySets().catch(() => [] as VocabularySet[]),
    ])
      .then(([c, l, p, v]) => {
        if (!alive) return;
        setCourses(c);
        setLessons(l);
        setProgress(p);
        setVocabSets(v);
      })
      .catch((e) => {
        if (!alive) return;
        setError(String((e as Error).message ?? e));
      });
    return () => {
      alive = false;
    };
  }, [id]);

  const course = useMemo(
    () => (courses ?? []).find((c) => c.slug === id) ?? null,
    [courses, id],
  );

  const lessonRows = useMemo(
    () => (lessons && progress ? pickStatuses(lessons, progress) : []),
    [lessons, progress],
  );

  const groups = useMemo(
    () => (course && lessonRows.length > 0 ? groupBySection(course, lessonRows) : []),
    [course, lessonRows],
  );

  const totalLessons = lessons?.length ?? 0;
  const completedCount = lessonRows.filter((r) => r.status === 'done').length;
  const pct = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);
  const nextRow = lessonRows.find((r) => r.status === 'current') ?? null;
  const isComplete = totalLessons > 0 && completedCount === totalLessons;
  const courseLevel = (course?.level ?? 'A1') as Level;
  const isLocked = course ? !canAccessLevel(kidsLevel, courseLevel) : false;
  const loading = courses === null || lessons === null || progress === null;

  const PAGE_BOTTOM_PAD = 'pb-[calc(env(safe-area-inset-bottom,0px)+96px)]';

  if (loading && !course) {
    return (
      <div className={`min-h-[100dvh] bg-surface ${PAGE_BOTTOM_PAD}`}>
        <BackHeader title="Курс" onBack={() => router.back()} />
        <div className="max-w-screen-md mx-auto w-full px-4 py-10">
          <LoadingState shape="card" rows={1} />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={`min-h-[100dvh] bg-surface ${PAGE_BOTTOM_PAD}`}>
        <BackHeader title="Курс" onBack={() => router.back()} />
        <div className="max-w-screen-md mx-auto w-full px-4 py-10">
          <EmptyState
            title="Курс не знайдено"
            description={
              error
                ? 'Не вдалось завантажити курс. Перевір зʼєднання та спробуй ще раз.'
                : 'Можливо, курс було перейменовано чи знято з публікації.'
            }
            icon={<span aria-hidden>😕</span>}
            action={
              <Button onClick={() => router.push('/kids/school')}>← До Школи</Button>
            }
          />
        </div>
      </div>
    );
  }

  const theme = themeForCourse(course);
  const longParas: string[] =
    course.descriptionLong && course.descriptionLong.length > 0
      ? course.descriptionLong
      : course.description
        ? [course.description]
        : course.descriptionShort
          ? [course.descriptionShort]
          : [];

  const courseSets = (vocabSets ?? []).filter((s) => s.courseSlug === course.slug);
  const anchorVocab = courseSets.find((s) => !s.lessonSlug) ?? null;
  const lessonVocabSets = courseSets.filter((s) => s.lessonSlug);
  const eyebrowChips = [
    courseLevel,
    course.audience === 'kids' ? 'Діти' : course.audience ?? null,
    totalLessons > 0 ? `${totalLessons} уроків` : null,
  ].filter(Boolean) as string[];

  return (
    <div className={`min-h-[100dvh] bg-surface ${PAGE_BOTTOM_PAD}`}>
      <BackHeader title={course.titleUa ?? course.title} onBack={() => router.push('/kids/school')} />

      {/* HERO */}
      <div className="px-4 sm:px-6 pt-4">
        <div className="max-w-screen-md mx-auto w-full">
          <CourseHero
            theme={theme}
            eyebrow={eyebrowChips.join(' · ')}
            focalEmoji={course.iconEmoji ?? '🎓'}
            title={course.titleUa ?? course.title}
            subtitle={course.subtitle ?? course.descriptionShort ?? ''}
          >
            <div className="flex items-center gap-4 mt-1">
              <ProgressRing pct={pct} />
              <div className="flex flex-col">
                <p className="font-black text-[24px] tabular-nums leading-none">
                  {completedCount}<span className="text-white/70">/{totalLessons}</span>
                </p>
                <p className="font-bold text-[11px] text-white/80 mt-1 uppercase tracking-widest">
                  завершено
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 flex-wrap">
              {isLocked ? (
                <span className="inline-flex items-center gap-2 rounded-2xl px-4 h-12 bg-white/15 border border-white/25 backdrop-blur-sm font-black text-[13px]">
                  🔒 Потрібен рівень {courseLevel}
                </span>
              ) : isComplete ? (
                <Link
                  href={`/courses/${course.slug}/lessons/${lessonRows[0]?.lesson.slug ?? ''}`}
                  className="inline-flex items-center justify-center gap-2 px-5 h-12 rounded-2xl bg-white font-black text-[15px] shadow-card-md active:translate-y-0.5 active:shadow-card-sm transition-all"
                  style={{ color: theme.accentDark }}
                >
                  Повторити
                </Link>
              ) : nextRow ? (
                <Link
                  href={`/courses/${course.slug}/lessons/${nextRow.lesson.slug}`}
                  className="inline-flex items-center justify-center gap-2 px-5 h-12 rounded-2xl bg-white font-black text-[15px] shadow-card-md active:translate-y-0.5 active:shadow-card-sm transition-all"
                  style={{ color: theme.accentDark }}
                >
                  {completedCount > 0 ? 'Продовжити' : 'Почати курс'}
                  <span aria-hidden>→</span>
                </Link>
              ) : null}
              {anchorVocab && !isLocked && (
                <Link
                  href={`/kids/vocab/${anchorVocab.slug}`}
                  className="inline-flex items-center gap-2 px-4 h-12 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm text-white font-black text-[13px] hover:bg-white/20 transition-colors"
                >
                  Словник <span aria-hidden>→</span>
                </Link>
              )}
            </div>
          </CourseHero>
        </div>
      </div>

      {/* "Що ти навчишся" — bullet outcomes parsed from descriptionLong. */}
      {longParas.length > 0 && (
        <section className="px-4 sm:px-6 py-6">
          <div className="max-w-screen-md mx-auto w-full">
            <SectionLabel>Що ти навчишся</SectionLabel>
            <ul className="mt-3 space-y-2.5">
              {longParas.slice(0, 5).map((p, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center font-black text-[13px] text-white"
                    style={{ background: theme.accent }}
                  >
                    ✓
                  </span>
                  <p className="font-medium text-[14px] text-ink leading-[1.55]">{p}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Vocabulary */}
      {courseSets.length > 0 && (
        <section className="px-4 sm:px-6 py-4">
          <div className="max-w-screen-md mx-auto w-full">
            <SectionLabel>Словник курсу</SectionLabel>
            <div className="mt-3 space-y-2.5">
              {anchorVocab && (
                <Link
                  href={`/kids/vocab/${anchorVocab.slug}`}
                  className="block active:scale-[0.99] transition-transform"
                >
                  <div
                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-white shadow-card-sm"
                    style={{ background: theme.gradient }}
                  >
                    <span aria-hidden className="text-[28px]">{anchorVocab.iconEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[14.5px] leading-tight truncate">
                        {anchorVocab.titleUa}
                      </p>
                      <p className="font-bold text-[11.5px] text-white/85 tabular-nums mt-0.5">
                        Ключові слова курсу · {anchorVocab.words.length} слів
                      </p>
                    </div>
                    <span aria-hidden className="font-black">→</span>
                  </div>
                </Link>
              )}
              {lessonVocabSets.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {lessonVocabSets.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/kids/vocab/${s.slug}`}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-raised border border-border hover:bg-surface-muted transition-colors"
                    >
                      <span aria-hidden>{s.iconEmoji}</span>
                      <span className="font-black text-[12.5px] text-ink truncate max-w-[140px]">
                        {s.titleUa}
                      </span>
                      <span className="font-bold text-[10.5px] text-ink-faint tabular-nums">
                        {s.words.length}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Lessons grouped by Unit */}
      <section className="px-4 sm:px-6 py-4">
        <div className="max-w-screen-md mx-auto w-full">
          <SectionLabel>Уроки</SectionLabel>
          {totalLessons === 0 ? (
            <div className="mt-3">
              <EmptyState
                title="Уроки скоро зʼявляться"
                description="Цей курс ще наповнюється — слідкуй за оновленнями."
              />
            </div>
          ) : (
            <div className="mt-3 space-y-4">
              {groups.map((g) => (
                <Unit key={g.slug} group={g} courseSlug={course.slug} accent={theme.accent} isLocked={isLocked} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const size = 72;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="white"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        className="font-black"
        fontSize="20"
        fill="white"
      >
        {pct}%
      </text>
    </svg>
  );
}

function Unit({
  group,
  courseSlug,
  accent,
  isLocked,
}: {
  group: UnitGroup;
  courseSlug: string;
  accent: string;
  isLocked: boolean;
}) {
  return (
    <div>
      {group.title && (
        <p className="font-black text-[13px] text-ink mb-2 px-1 leading-tight">
          {group.title}
        </p>
      )}
      <div className="space-y-2">
        {group.rows.map((row, idx) => (
          <LessonTileCard
            key={row.lesson.documentId}
            lesson={row.lesson}
            index={idx}
            status={row.status}
            href={`/courses/${courseSlug}/lessons/${row.lesson.slug}`}
            courseAccent={accent}
            isLocked={isLocked}
          />
        ))}
      </div>
    </div>
  );
}

function BackHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="sticky top-0 z-10 border-b border-border bg-surface-raised/95 backdrop-blur-md pt-[max(12px,env(safe-area-inset-top))]">
      <div className="max-w-screen-md mx-auto w-full flex items-center gap-3 px-4 sm:px-6 py-3">
        <button
          onClick={onBack}
          aria-label="Назад"
          className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-lg flex-shrink-0 bg-surface-muted text-ink active:scale-90 transition-transform"
        >
          ←
        </button>
        <p className="font-black text-[14.5px] text-ink truncate">{title}</p>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-black uppercase tracking-widest text-[10.5px] text-ink-faint">
      {children}
    </p>
  );
}
