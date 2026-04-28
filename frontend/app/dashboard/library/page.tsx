/**
 * Teacher dashboard — unified library hub.
 *
 * Single entry point for all teaching materials: courses (containers),
 * lessons (rich block editor), vocabulary sets. Tabs are URL-controlled
 * via `?tab=` so links can deep-link directly to a section.
 *
 * Replaces the old `/dashboard/courses` and `/dashboard/teacher-library`
 * list pages — those now redirect here. Editors at
 * `/dashboard/courses/[id]/edit`, `/dashboard/teacher-library/[id]/edit`,
 * and `/dashboard/vocabulary/[id]/edit` remain reachable as deep-link
 * routes from the corresponding tabs.
 */
'use client';

import Link from 'next/link';
import { Suspense, useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardPageShell } from '@/components/ui/shells';
import { SearchInput } from '@/components/teacher/ui';
import { Button } from '@/components/ui/Button';
import { CreateCourseModal } from '@/components/teacher/CreateCourseModal';
import { CoursesTab } from './_components/CoursesTab';
import { LessonsTab } from './_components/LessonsTab';
import { VocabularyTab } from './_components/VocabularyTab';

type Tab = 'courses' | 'lessons' | 'vocabulary';

const TABS: ReadonlyArray<{ id: Tab; label: string; noun: string }> = [
  { id: 'courses',    label: 'Курси',    noun: 'курсів' },
  { id: 'lessons',    label: 'Уроки',    noun: 'уроків' },
  { id: 'vocabulary', label: 'Словник',  noun: 'словників' },
];

function isTab(v: string | null): v is Tab {
  return v === 'courses' || v === 'lessons' || v === 'vocabulary';
}

export default function LibraryPage() {
  return (
    <Suspense fallback={null}>
      <LibraryHub />
    </Suspense>
  );
}

function LibraryHub() {
  const sp = useSearchParams();
  const router = useRouter();
  const tab: Tab = isTab(sp.get('tab')) ? (sp.get('tab') as Tab) : 'courses';

  const [query, setQuery] = useState('');
  const [createCourseOpen, setCreateCourseOpen] = useState(false);
  const [counts, setCounts] = useState<Record<Tab, number | null>>({
    courses: null,
    lessons: null,
    vocabulary: null,
  });

  const setCountFor = useCallback(
    (id: Tab) => (n: number) => setCounts((c) => (c[id] === n ? c : { ...c, [id]: n })),
    [],
  );

  function selectTab(t: Tab) {
    const next = new URLSearchParams(sp.toString());
    if (t === 'courses') next.delete('tab');
    else next.set('tab', t);
    const qs = next.toString();
    router.replace(`/dashboard/library${qs ? `?${qs}` : ''}`);
  }

  const activeMeta = TABS.find((t) => t.id === tab)!;
  const subtitleParts = TABS
    .filter((t) => counts[t.id] !== null)
    .map((t) => `${counts[t.id]} ${t.noun}`);
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(' · ') : 'Завантаження…';

  return (
    <DashboardPageShell
      title="Бібліотека"
      subtitle={subtitle}
      toolbar={
        <div className="flex flex-col gap-3 w-full">
          <nav role="tablist" className="flex items-center gap-0.5 border-b border-border -mx-1 overflow-x-auto">
            {TABS.map((t) => {
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => selectTab(t.id)}
                  className={`flex items-baseline gap-1.5 px-3 py-2 text-[13px] font-semibold transition-colors -mb-px border-b-2 whitespace-nowrap ${
                    active
                      ? 'text-ink border-ink'
                      : 'text-ink-muted border-transparent hover:text-ink'
                  }`}
                >
                  <span>{t.label}</span>
                  {counts[t.id] !== null && (
                    <span className="text-[11px] font-semibold text-ink-faint tabular-nums">
                      {counts[t.id]}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="flex items-center gap-2 flex-wrap">
            <SearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Пошук у ${activeMeta.label.toLowerCase()}…`}
              containerClassName="flex-1 min-w-[180px] max-w-md"
            />
            {tab === 'courses' && (
              <Button onClick={() => setCreateCourseOpen(true)}>+ Курс</Button>
            )}
            {tab === 'lessons' && (
              <Link
                href="/dashboard/teacher-library/new/edit"
                className="ios-btn ios-btn-primary"
              >
                + Урок
              </Link>
            )}
          </div>
        </div>
      }
    >
      {tab === 'courses' && (
        <CoursesTab query={query} onCount={setCountFor('courses')} />
      )}
      {tab === 'lessons' && (
        <LessonsTab query={query} onCount={setCountFor('lessons')} />
      )}
      {tab === 'vocabulary' && (
        <VocabularyTab query={query} onCount={setCountFor('vocabulary')} />
      )}

      <CreateCourseModal
        open={createCourseOpen}
        onClose={() => setCreateCourseOpen(false)}
      />
    </DashboardPageShell>
  );
}
