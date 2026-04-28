'use client';

import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { LevelBadge, SearchInput, FilterChips, type FilterChipOption } from '@/components/teacher/ui';
import { fetchLessonsCached } from '@/lib/teacher-library';
import type { LibraryLesson, Level } from '@/lib/types/teacher';

const LEVEL_OPTIONS: ReadonlyArray<FilterChipOption<Level | 'all'>> = [
  { value: 'all', label: 'Усі' },
  { value: 'A0',  label: 'A0' },
  { value: 'A1',  label: 'A1' },
  { value: 'A2',  label: 'A2' },
  { value: 'B1',  label: 'B1' },
  { value: 'B2',  label: 'B2' },
  { value: 'C1',  label: 'C1' },
  { value: 'C2',  label: 'C2' },
];

export interface LessonPickerModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with picked lesson slugs (only the new ones — `excludedSlugs` are deselected). */
  onConfirm: (slugs: string[]) => void;
  /** Slugs already present in the target section — checked + disabled. */
  excludedSlugs?: readonly string[];
  /** documentId of the course we're picking for — used to flag conflicts. */
  currentCourseId?: string;
  /** Pre-filter the list to a specific level. */
  defaultLevel?: Level;
  title?: string;
}

export function LessonPickerModal(props: LessonPickerModalProps) {
  return (
    <Modal isOpen={props.open} onClose={props.onClose} title={props.title ?? 'Додати уроки до юніту'} size="lg">
      <PickerBody {...props} />
    </Modal>
  );
}

function PickerBody({
  onClose,
  onConfirm,
  excludedSlugs = [],
  currentCourseId,
  defaultLevel,
}: LessonPickerModalProps) {
  const [lessons, setLessons] = useState<LibraryLesson[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<Level | 'all'>(defaultLevel ?? 'all');
  const [picked, setPicked] = useState<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;
    fetchLessonsCached()
      .then((rows) => alive && setLessons(rows))
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'failed'));
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!lessons) return [];
    const q = query.trim().toLowerCase();
    return lessons.filter((l) => {
      if (!l.slug) return false;
      if (level !== 'all' && l.level !== level) return false;
      if (q === '') return true;
      const haystack = [l.title, l.topic, l.slug, ...(l.tags ?? [])].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [lessons, query, level]);

  function toggle(slug: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function handleConfirm() {
    onConfirm(Array.from(picked));
    onClose();
  }

  return (
    <div className="flex flex-col gap-3 max-h-[70vh]">
      <div className="flex flex-col gap-2 flex-shrink-0">
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Пошук за назвою, темою, slug-ом, тегом…"
        />
        <FilterChips value={level} onChange={setLevel} options={LEVEL_OPTIONS} />
      </div>

      <div className="flex-1 overflow-y-auto -mx-1 px-1">
        {error && <p className="text-[12.5px] text-danger-dark">{error}</p>}
        {!lessons && !error && (
          <p className="text-[12.5px] text-ink-faint py-6 text-center">Завантаження…</p>
        )}
        {lessons && filtered.length === 0 && (
          <p className="text-[12.5px] text-ink-muted py-6 text-center">Нічого не знайдено</p>
        )}
        {lessons && filtered.length > 0 && (
          <ul className="flex flex-col gap-1">
            {filtered.map((l) => {
              const already = excludedSlugs.includes(l.slug);
              const isPicked = picked.has(l.slug);
              const inOtherCourse =
                l.courseDocumentId && currentCourseId && l.courseDocumentId !== currentCourseId;
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => !already && toggle(l.slug)}
                    disabled={already}
                    className={`w-full text-left flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                      already
                        ? 'border-border bg-surface-muted/40 opacity-60 cursor-not-allowed'
                        : isPicked
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-surface-hover'
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center ${
                        already || isPicked
                          ? 'border-primary bg-primary text-white'
                          : 'border-border'
                      }`}
                      aria-hidden
                    >
                      {(already || isPicked) && (
                        <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 8.5l3 3 7-7" />
                        </svg>
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-ink leading-tight truncate">
                        {l.title}
                      </p>
                      <p className="text-[11px] text-ink-faint mt-0.5 truncate tabular-nums">
                        {l.slug}
                        {l.topic ? ` · ${l.topic}` : ''}
                        {` · ${l.durationMin} хв · ${l.blocksCount} бл.`}
                      </p>
                    </div>
                    <LevelBadge level={l.level} />
                    {already ? (
                      <span className="ios-chip">У юніті</span>
                    ) : inOtherCourse ? (
                      <span
                        className="ios-chip"
                        title={`Уже у курсі: ${l.courseTitle ?? l.courseSlug}`}
                      >
                        В іншому курсі
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 flex-shrink-0 border-t border-border pt-3">
        <p className="text-[12px] text-ink-muted tabular-nums">Обрано: {picked.size}</p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onClose}>
            Скасувати
          </Button>
          <Button onClick={handleConfirm} disabled={picked.size === 0}>
            Додати ({picked.size})
          </Button>
        </div>
      </div>
    </div>
  );
}
