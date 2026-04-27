/**
 * Teacher dashboard — courses list.
 *
 * Lists all courses (any audience) with quick stats: lesson count and
 * vocabulary-set count. Each row links to the course editor where
 * sections (units) and vocabulary attachments can be managed.
 *
 * Course CREATE happens in Strapi admin for now — the editor here covers
 * the day-to-day plumbing (units + vocab) which is what teachers need
 * inline.
 */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DashboardPageShell } from '@/components/ui/shells';
import { Card } from '@/components/ui/Card';
import {
  fetchTeacherCourses,
  type CourseSummary,
} from '@/lib/teacher-courses';

const SECTION_LABEL_CLS =
  'font-bold text-[11px] uppercase tracking-[0.04em] text-ink-muted';

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<CourseSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchTeacherCourses()
      .then((rows) => alive && setCourses(rows))
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'failed'));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <DashboardPageShell title="Курси">
      <Card variant="surface" padding="md">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className={SECTION_LABEL_CLS}>Усі курси</p>
          <p className="font-bold text-[11px] text-ink-faint tabular-nums">
            {courses?.length ?? 0}
          </p>
        </div>

        {error && (
          <p className="text-[12.5px] text-danger-dark">Помилка: {error}</p>
        )}
        {!courses && !error && (
          <p className="text-[12.5px] text-ink-faint">Завантаження…</p>
        )}
        {courses && courses.length === 0 && (
          <p className="text-[12.5px] text-ink-muted">
            Курсів поки немає. Створи перший у Strapi admin — далі юніти і словник
            редагуватимуться тут.
          </p>
        )}
        {courses && courses.length > 0 && (
          <ul className="ios-list">
            {courses.map((c, i) => (
              <li
                key={c.documentId}
                className={i > 0 ? 'border-t border-border' : ''}
              >
                <Link
                  href={`/dashboard/courses/${c.documentId}/edit`}
                  className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-surface-hover"
                >
                  <span aria-hidden className="text-[22px] flex-shrink-0">
                    {c.iconEmoji ?? '🎓'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[14px] text-ink leading-tight truncate">
                      {c.titleUa || c.title}
                    </p>
                    <p className="font-medium text-[11.5px] text-ink-faint mt-0.5 tabular-nums">
                      {c.level ?? '—'} ·{' '}
                      {c.audience ? c.audience : 'будь-яка аудиторія'} · {c.lessonCount}{' '}
                      уроків · {c.vocabSetCount} словників
                    </p>
                  </div>
                  {c.status !== 'available' && (
                    <span className="ios-chip">{c.status}</span>
                  )}
                  <span aria-hidden className="text-ink-faint font-black text-base flex-shrink-0">
                    ›
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </DashboardPageShell>
  );
}
