'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { Course } from '@/lib/mockClient';

const LEVEL_COLOR: Record<string, string> = {
  A1: 'bg-accent/10 text-accent-dark',
  A2: 'bg-accent/20 text-accent-dark',
  B1: 'bg-success/10 text-success-dark',
  B2: 'bg-purple/10 text-purple-dark',
};

const TEACHER_BIO: Record<string, string> = {
  'teacher-olga':  'Спеціаліст з дитячої освіти, 8 років досвіду з дітьми 4–8 років. CELTA-сертифікат.',
  'teacher-max':   'Досвідчений педагог для підлітків, автор курсів A1–B1. 6 років практики.',
  'teacher-anna':  'DELTA-сертифікований вчитель, підготувала 200+ студентів до IELTS/FCE.',
};

const TAG_LABEL: Record<string, string> = {
  kids:     'Діти',
  teens:    'Підлітки',
  adults:   'Дорослі',
  speaking: 'Розмова',
  grammar:  'Граматика',
  writing:  'Письмо',
  business: 'Бізнес',
  fun:      'Ігри',
};

interface CoursePageProps {
  course: Course;
}

export function CoursePage({ course }: CoursePageProps) {
  const [openSection, setOpenSection] = useState<string | null>(course.sections[0]?.slug ?? null);

  const levelCls = LEVEL_COLOR[course.level] ?? 'bg-surface-muted text-ink-muted';

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">

      {/* Хлібні крихти */}
      <nav className="flex items-center gap-2 text-sm text-ink-muted" aria-label="Навігація">
        <Link href="/library" className="hover:text-ink transition-colors">Програми навчання</Link>
        <span aria-hidden>›</span>
        <span className="text-ink font-semibold">{course.title}</span>
      </nav>

      {/* Hero */}
      <div className="bg-lesson-success rounded-2xl p-7 text-white">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex flex-col gap-2.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${levelCls}`}>
                {course.level}
              </span>
              {course.tags.map(tag => (
                <span key={tag} className="px-2.5 py-1 rounded-full bg-white/15 text-xs font-semibold text-white/90">
                  {TAG_LABEL[tag] ?? tag}
                </span>
              ))}
            </div>
            <h1 className="text-2xl font-black text-white leading-snug">{course.title}</h1>
            <p className="text-white/70 text-sm leading-relaxed">{course.description}</p>
            <div className="flex items-center gap-4 text-sm text-white/70 mt-1">
              <span className="flex items-center gap-1.5">
                <span className="text-accent">★</span>
                <span className="font-bold text-white">{course.rating}</span>
                <span>({course.reviewCount} відгуків)</span>
              </span>
              <span>👩‍🏫 {course.teacherName}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-3xl font-black text-accent">${course.price}</p>
              <p className="text-white/50 text-xs">/урок</p>
            </div>
            <Link
              href="/dashboard"
              className="bg-accent hover:opacity-90 text-ink font-black text-sm px-5 py-2.5 rounded-xl transition-opacity whitespace-nowrap"
            >
              Записатись →
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

        {/* Ліво: програма + опис */}
        <div className="flex flex-col gap-5">

          {/* Програма занять */}
          <section aria-labelledby="curriculum-heading" className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 id="curriculum-heading" className="font-black text-ink">Програма занять</h2>
            </div>
            <ul className="divide-y divide-border">
              {course.sections.map(section => (
                <li key={section.slug}>
                  <button
                    onClick={() => setOpenSection(openSection === section.slug ? null : section.slug)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-4 hover:bg-surface-muted/50 transition-colors text-left"
                    aria-expanded={openSection === section.slug}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-surface-muted text-xs font-black text-ink flex items-center justify-center flex-shrink-0">
                        {course.sections.indexOf(section) + 1}
                      </span>
                      <span className="text-sm font-semibold text-ink">{section.title}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-ink-muted">{section.lessons.length} уроків</span>
                      <svg
                        className={`w-4 h-4 text-ink-muted transition-transform ${openSection === section.slug ? 'rotate-180' : ''}`}
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </button>
                  {openSection === section.slug && (
                    <ul className="px-6 pb-3 flex flex-col gap-1">
                      {section.lessons.map((lessonSlug, j) => (
                        <li key={lessonSlug}>
                          <Link
                            href={`/courses/${course.slug}/lessons/${lessonSlug}`}
                            className="flex items-center gap-3 py-2 hover:text-primary transition-colors group"
                            aria-label={`Відкрити урок ${lessonSlug}`}
                          >
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-[11px] font-black text-primary flex items-center justify-center flex-shrink-0">
                              {j + 1}
                            </span>
                            <span className="text-sm text-ink-muted group-hover:text-ink capitalize">
                              {lessonSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </span>
                            <svg className="w-3.5 h-3.5 ml-auto text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                              <path d="M9 18l6-6-6-6" />
                            </svg>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Право: вчитель + CTA */}
        <div className="flex flex-col gap-4">

          {/* CTA */}
          <div className="bg-white rounded-2xl border border-border p-5 flex flex-col gap-3">
            <p className="text-3xl font-black text-ink">
              ${course.price}<span className="text-base text-ink-muted font-normal">/урок</span>
            </p>
            <Link
              href="/dashboard"
              className="block w-full py-3 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white font-black text-sm text-center hover:opacity-90 transition-opacity"
            >
              Записатись на пробний урок →
            </Link>
            <p className="text-xs text-ink-muted text-center">Перший урок безкоштовно</p>
          </div>

          {/* Вчитель */}
          <section aria-labelledby="teacher-heading" className="bg-white rounded-2xl border border-border p-5">
            <h2 id="teacher-heading" className="text-xs font-black text-ink-muted uppercase tracking-wide mb-3">Вчитель курсу</h2>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                {course.teacherName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-black text-ink">{course.teacherName}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-accent text-sm">★</span>
                  <span className="text-sm font-bold text-ink">{course.rating}</span>
                  <span className="text-xs text-ink-muted">({course.reviewCount})</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              {TEACHER_BIO[course.teacherSlug] ?? 'Сертифікований вчитель з досвідом роботи з дітьми та підлітками.'}
            </p>
          </section>

          {/* Метрики */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <p className="text-xs font-black text-ink-muted uppercase tracking-wide mb-3">Деталі курсу</p>
            <ul className="flex flex-col gap-2.5">
              {[
                { label: 'Рівень', value: course.level },
                { label: 'Рейтинг', value: `★ ${course.rating} (${course.reviewCount})` },
                { label: 'Уроків', value: `${course.sections.reduce((n, s) => n + s.lessons.length, 0)}` },
                { label: 'Формат', value: 'Один на один' },
              ].map(item => (
                <li key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-ink-muted">{item.label}</span>
                  <span className="font-semibold text-ink">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
