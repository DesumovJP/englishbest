'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { LESSON_SOURCE_LABELS } from '@/lib/ui/teacher-labels';
import type {
  BlockKind,
  LessonBlock,
  LessonSource,
  Level,
} from '@/lib/types/teacher';
import {
  cloneLesson,
  createLesson,
  deleteLesson,
  fetchLesson,
  publishLesson,
  unpublishLesson,
  updateLesson,
} from '@/lib/teacher-library';
import { fetchTeacherCourse } from '@/lib/teacher-courses';
import { SegmentedControl, type SegmentedControlOption } from '@/components/teacher/ui';
import { BlockPicker } from '@/components/teacher/BlockPicker';
import { LessonBlockEditor } from '@/components/teacher/LessonBlockEditor';
import { LessonBlockPreview } from '@/components/teacher/LessonBlockPreview';
import { LessonVocabularySection } from '@/components/teacher/LessonVocabularySection';
import { DashboardPageShell } from '@/components/ui/shells';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const MODE_OPTIONS: ReadonlyArray<SegmentedControlOption<'edit' | 'preview'>> = [
  { value: 'edit',    label: 'Редагувати' },
  { value: 'preview', label: 'Перегляд' },
];

const LEVEL_OPTIONS: Level[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const LEVEL_SELECT_OPTIONS = LEVEL_OPTIONS.map(l => ({
  value: l,
  label: `Рівень ${l}`,
}));

function createEmptyBlock(kind: BlockKind): LessonBlock {
  const id = `b${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
  switch (kind) {
    case 'text':
    case 'teacher-note':
      return { id, kind, body: '' };
    case 'image':
      return { id, kind, mediaUrl: '', body: '' };
    case 'audio':
    case 'video':
      return { id, kind, title: '', mediaUrl: '' };
    case 'exercise-multiple-choice':
      return {
        id, kind, title: '',
        options: [
          { text: '', correct: true },
          { text: '', correct: false },
          { text: '', correct: false },
          { text: '', correct: false },
        ],
      };
    case 'exercise-text-input':
      return { id, kind, title: '', correctAnswer: '' };
    case 'exercise-matching':
      return { id, kind, title: '', items: [{ left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }] };
    case 'exercise-word-order':
      return { id, kind, title: '', words: ['', '', ''] };
    case 'exercise-fill-gap':
      return { id, kind, title: '', body: '', correctAnswer: '' };
    case 'flashcards':
      return { id, kind, title: '', cards: [{ front: '', back: '' }, { front: '', back: '' }] };
    case 'link':
      return { id, kind, linkUrl: '', linkDescription: '' };
  }
}

function toSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return base || `lesson-${Date.now().toString(36)}`;
}

export default function LessonEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const rawId = params?.id ?? 'new';
  const isNew = rawId === 'new';

  const [docId, setDocId] = useState<string | null>(isNew ? null : rawId);
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState<Level>('A1');
  const [topic, setTopic] = useState('');
  const [durationMin, setDurationMin] = useState<number>(30);
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState('');
  const [blocks, setBlocks] = useState<LessonBlock[]>([]);
  const [source, setSource] = useState<LessonSource>('own');
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [usage, setUsage] = useState<{
    courseDocumentId: string;
    courseTitle: string;
    sectionTitle: string | null;
  } | null>(null);
  const [parentLink, setParentLink] = useState<{
    courseDocumentId: string;
    courseTitle: string | null;
    sectionSlug: string | null;
  } | null>(null);

  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [picker, setPicker] = useState<{ open: boolean; at: number } | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const readOnly = source === 'platform' || source === 'template';

  useEffect(() => {
    if (isNew) return;
    let alive = true;
    (async () => {
      try {
        const detail = await fetchLesson(rawId);
        if (!alive) return;
        if (!detail) {
          setLoadError('Урок не знайдено');
          return;
        }
        setTitle(detail.title);
        setLevel(detail.level);
        setTopic(detail.topic);
        setDurationMin(detail.durationMin);
        setTags(detail.tags ?? []);
        setBlocks(detail.blocks);
        setSource(detail.source);
        setPublished(Boolean(detail.published));
        setSavedAt(new Date());
        setDirty(false);
        if (detail.courseDocumentId) {
          // Set the immediately-available parent link from the lesson payload;
          // the section title is hydrated by a separate effect so a slow/failed
          // course fetch never blocks the editor from going interactive.
          setParentLink({
            courseDocumentId: detail.courseDocumentId,
            courseTitle: detail.courseTitle ?? null,
            sectionSlug: detail.sectionSlug ?? null,
          });
          setUsage({
            courseDocumentId: detail.courseDocumentId,
            courseTitle: detail.courseTitle ?? detail.courseDocumentId,
            sectionTitle: detail.sectionSlug ?? null,
          });
        }
      } catch (e) {
        if (alive) setLoadError(e instanceof Error ? e.message : 'failed');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isNew, rawId]);

  useEffect(() => {
    if (loading) return;
    setDirty(true);
  }, [title, level, topic, durationMin, tags, blocks, loading]);

  // Hydrate the section title for the "У курсі" badge from the parent course.
  // Runs after the lesson load finishes, so a slow course fetch never delays
  // the editor going interactive.
  useEffect(() => {
    if (!parentLink || !parentLink.sectionSlug) return;
    let alive = true;
    (async () => {
      try {
        const course = await fetchTeacherCourse(parentLink.courseDocumentId);
        if (!alive || !course) return;
        const match = course.sections.find((s) => s.slug === parentLink.sectionSlug);
        setUsage({
          courseDocumentId: parentLink.courseDocumentId,
          courseTitle: course.titleUa || course.title || parentLink.courseTitle || parentLink.courseDocumentId,
          sectionTitle: match?.title ?? parentLink.sectionSlug,
        });
      } catch {
        /* keep the slug-only fallback usage already set during load */
      }
    })();
    return () => {
      alive = false;
    };
  }, [parentLink]);

  const savedLabel = useMemo(() => {
    if (saving) return 'Зберігаю…';
    if (dirty) return 'Незбережені зміни';
    if (!savedAt) return '';
    const secs = Math.max(1, Math.round((Date.now() - savedAt.getTime()) / 1000));
    if (secs < 60) return `Збережено ${secs}с тому`;
    return `Збережено ${Math.round(secs / 60)} хв тому`;
  }, [saving, dirty, savedAt]);

  const save = useCallback(async (opts?: { silent?: boolean }) => {
    if (readOnly) {
      if (!opts?.silent) {
        setToast('Урок тільки для читання — зробіть копію');
        window.setTimeout(() => setToast(null), 1800);
      }
      return;
    }
    if (!title.trim()) {
      if (!opts?.silent) setSaveError('Вкажіть назву уроку');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      if (docId) {
        await updateLesson(docId, {
          title: title.trim(),
          level,
          topic,
          durationMin,
          tags,
          steps: blocks,
        });
        setSavedAt(new Date());
        setDirty(false);
      } else {
        const created = await createLesson({
          title: title.trim(),
          slug: toSlug(title),
          level,
          topic,
          durationMin,
          tags,
          steps: blocks,
          source: 'own',
        });
        setDocId(created.id);
        setSource(created.source);
        setPublished(Boolean(created.published));
        setSavedAt(new Date());
        setDirty(false);
        router.replace(`/dashboard/teacher-library/${created.id}/edit`);
      }
      if (!opts?.silent) {
        setToast('Збережено');
        window.setTimeout(() => setToast(null), 1500);
      }
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'failed');
    } finally {
      setSaving(false);
    }
  }, [docId, title, level, topic, durationMin, tags, blocks, readOnly, router]);

  // Keep latest `save` reference so debounced autosave doesn't re-arm on every keystroke.
  const saveRef = useRef(save);
  useEffect(() => { saveRef.current = save; });

  // Debounced autosave: 1.5s after last edit, only when dirty + not loading + not read-only.
  useEffect(() => {
    if (loading || readOnly || !dirty) return;
    if (!title.trim()) return;
    const t = window.setTimeout(() => { void saveRef.current({ silent: true }); }, 1500);
    return () => window.clearTimeout(t);
  }, [dirty, loading, readOnly, title, level, topic, durationMin, tags, blocks]);

  // Cmd/Ctrl+S → save now.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!readOnly) void saveRef.current();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [readOnly]);

  // Block accidental tab close while there are unsaved edits.
  useEffect(() => {
    if (!dirty || readOnly) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty, readOnly]);

  async function togglePublish() {
    if (!docId) return;
    setPublishing(true);
    try {
      if (published) {
        await unpublishLesson(docId);
        setPublished(false);
        setToast('Знято з публікації');
      } else {
        await publishLesson(docId);
        setPublished(true);
        setToast('Опубліковано');
      }
      window.setTimeout(() => setToast(null), 1500);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Не вдалося оновити публікацію');
    } finally {
      setPublishing(false);
    }
  }

  function addTag(raw: string) {
    const t = raw.trim().replace(/^#+/, '').slice(0, 24);
    if (!t) return;
    if (tags.includes(t)) { setTagDraft(''); return; }
    setTags(prev => [...prev, t]);
    setTagDraft('');
  }
  function removeTag(t: string) {
    setTags(prev => prev.filter(x => x !== t));
  }

  async function cloneAsCopy() {
    if (!docId) return;
    try {
      const detail = await fetchLesson(docId);
      if (!detail) throw new Error('lesson gone');
      const copy = await cloneLesson(detail);
      router.push(`/dashboard/teacher-library/${copy.id}/edit`);
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Не вдалося скопіювати');
      window.setTimeout(() => setToast(null), 1800);
    }
  }

  function addBlock(at: number, kind: BlockKind) {
    if (readOnly) return;
    const b = createEmptyBlock(kind);
    setBlocks(prev => [...prev.slice(0, at), b, ...prev.slice(at)]);
  }

  function patchBlock(index: number, patch: Partial<LessonBlock>) {
    if (readOnly) return;
    setBlocks(prev => prev.map((b, i) => (i === index ? ({ ...b, ...patch } as LessonBlock) : b)));
  }

  function move(index: number, delta: number) {
    if (readOnly) return;
    const next = [...blocks];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setBlocks(next);
  }

  // ─── Drag-n-drop reorder ────────────────────────────────────────────────
  // Parent-managed drag state because dividers (drop zones) sit between
  // blocks and need to know which block is being dragged + which gap is
  // currently hovered. Native HTML5 DnD; arrows above remain the keyboard +
  // touch fallback (HTML5 DnD doesn't fire on touchscreens).
  const [dragSrc, setDragSrc] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  function handleDragStart(i: number) {
    setDragSrc(i);
  }
  function handleDragEnd() {
    setDragSrc(null);
    setDragOver(null);
  }
  function handleDropAt(at: number) {
    if (readOnly || dragSrc === null) {
      handleDragEnd();
      return;
    }
    const from = dragSrc;
    // No-op: dropping a block on its own surrounding gaps (immediately above
    // or below it) keeps order unchanged.
    if (at === from || at === from + 1) {
      handleDragEnd();
      return;
    }
    setBlocks(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      const adjusted = from < at ? at - 1 : at;
      next.splice(adjusted, 0, moved);
      return next;
    });
    handleDragEnd();
  }

  function duplicate(index: number) {
    if (readOnly) return;
    const src = blocks[index];
    const copy: LessonBlock = { ...src, id: `b${Date.now()}${Math.random().toString(36).slice(2, 6)}` };
    setBlocks(prev => [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)]);
  }

  function removeBlock(index: number) {
    if (readOnly) return;
    setBlocks(prev => prev.filter((_, i) => i !== index));
  }

  const shellStatus: 'loading' | 'error' | 'ready' =
    loading ? 'loading' : loadError ? 'error' : 'ready';

  const backLink = (
    <div className="flex items-center gap-2 flex-wrap text-[12px]">
      <Link
        href="/dashboard/library?tab=lessons"
        className="inline-flex items-center gap-1 font-semibold text-ink-muted hover:text-ink"
      >
        ← Бібліотека
      </Link>
      {usage && (
        <>
          <span aria-hidden className="text-ink-faint">·</span>
          <span className="text-ink-faint">У курсі:</span>
          <Link
            href={`/dashboard/courses/${usage.courseDocumentId}/edit`}
            className="font-semibold text-ink hover:underline underline-offset-2"
          >
            {usage.courseTitle}
            {usage.sectionTitle ? ` · ${usage.sectionTitle}` : ''}
          </Link>
        </>
      )}
    </div>
  );

  if (shellStatus !== 'ready') {
    return (
      <div className="flex flex-col gap-3">
        {backLink}
        <DashboardPageShell
          title={isNew ? 'Новий урок' : 'Редактор уроку'}
          status={shellStatus}
          error={loadError ?? undefined}
          onRetry={() => location.reload()}
          loadingShape="card"
        />
      </div>
    );
  }

  const subtitleParts = [LESSON_SOURCE_LABELS[source]];
  if (savedLabel) subtitleParts.push(savedLabel);

  return (
    <>
    <div className="flex flex-col gap-3">
      {backLink}
      <DashboardPageShell
        title={title.trim() || (isNew ? 'Новий урок' : 'Редактор уроку')}
        subtitle={
          <span className={dirty || saving ? 'text-ink' : undefined}>
            {subtitleParts.join(' · ')}
          </span>
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {!readOnly && (
              <SegmentedControl value={mode} onChange={setMode} options={MODE_OPTIONS} label="Режим" />
            )}
            {readOnly ? (
              <Button onClick={cloneAsCopy}>Копіювати в мою бібліотеку</Button>
            ) : (
              <>
                {docId && (
                  <Button
                    variant={published ? 'secondary' : 'primary'}
                    onClick={togglePublish}
                    disabled={publishing || saving || dirty}
                    title={dirty ? 'Спершу збережи зміни' : undefined}
                  >
                    {publishing
                      ? '…'
                      : published
                        ? 'Зняти з публікації'
                        : 'Опублікувати'}
                  </Button>
                )}
                <Button onClick={() => save()} disabled={saving || !dirty}>
                  {saving ? 'Зберігаю…' : dirty ? 'Зберегти' : 'Збережено'}
                </Button>
                {docId && !isNew && (
                  <Button
                    variant="danger"
                    onClick={async () => {
                      if (!window.confirm(`Видалити урок «${title || 'без назви'}»?`)) return;
                      try {
                        await deleteLesson(docId);
                        router.push('/dashboard/library?tab=lessons');
                      } catch (e) {
                        setSaveError(e instanceof Error ? e.message : 'Не вдалося видалити');
                      }
                    }}
                  >
                    Видалити
                  </Button>
                )}
              </>
            )}
          </div>
        }
      >
        {readOnly && (
          <Card variant="surface" padding="md" className="mb-3 border-l-4 border-l-primary">
            <p className="text-[13px] font-semibold text-ink mb-1">
              Цей урок — {LESSON_SOURCE_LABELS[source]}, тільки для читання.
            </p>
            <p className="text-[12px] text-ink-muted">
              Щоб редагувати, зробіть власну копію — кнопка «Копіювати в мою бібліотеку»
              у верхньому правому куті.
            </p>
          </Card>
        )}
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={readOnly}
            placeholder="Назва уроку"
            className="w-full text-[22px] font-semibold text-ink bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none pb-1 transition-colors disabled:opacity-60"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              selectSize="sm"
              value={level}
              onChange={e => setLevel(e.target.value as Level)}
              disabled={readOnly}
              options={LEVEL_SELECT_OPTIONS}
              className="w-auto font-semibold"
            />
            <Input
              inputSize="sm"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              disabled={readOnly}
              placeholder="Тема / тег"
              className="w-auto"
            />
            <Input
              inputSize="sm"
              type="number"
              min={1}
              max={600}
              value={durationMin}
              onChange={e => {
                const n = Number(e.target.value);
                if (!Number.isFinite(n)) return;
                setDurationMin(Math.min(600, Math.max(1, Math.round(n))));
              }}
              disabled={readOnly}
              aria-label="Тривалість (хв)"
              className="w-20 tabular-nums"
            />
            <span className="text-[12px] text-ink-muted tabular-nums">{blocks.length} блоків</span>
            {published && (
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-success/15 text-success-dark">
                Опубліковано
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {tags.map(t => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary-dark text-[11px] font-bold"
              >
                #{t}
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="text-primary-dark/60 hover:text-danger-dark"
                    aria-label={`Видалити тег ${t}`}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
            {!readOnly && (
              <input
                type="text"
                value={tagDraft}
                onChange={e => setTagDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag(tagDraft);
                  } else if (e.key === 'Backspace' && !tagDraft && tags.length) {
                    removeTag(tags[tags.length - 1]);
                  }
                }}
                onBlur={() => tagDraft && addTag(tagDraft)}
                placeholder={tags.length ? '+ ще тег' : '+ додати тег'}
                className="text-[11px] font-semibold bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1 py-0.5 w-24"
              />
            )}
          </div>

          {saveError && (
            <p className="text-[12px] text-danger-dark">{saveError}</p>
          )}
        </div>

        <LessonVocabularySection
          lessonDocumentId={docId}
          lessonTitle={title}
          lessonLevel={level}
          readOnly={readOnly}
        />

        {blocks.length === 0 ? (
          readOnly ? (
            <div className="w-full py-14 rounded-xl border border-dashed border-border text-ink-muted text-center text-[13px]">
              Урок не містить блоків
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPicker({ open: true, at: 0 })}
              className="w-full py-14 rounded-xl border border-dashed border-border hover:border-primary/40 hover:bg-surface-muted/40 transition-colors flex flex-col items-center gap-1.5 text-ink-muted"
            >
              <svg className="w-6 h-6 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              <p className="text-[14px] font-semibold text-ink">Почати з першого блоку</p>
              <p className="text-[12px] text-ink-muted">Текст, вправа, аудіо, відео…</p>
            </button>
          )
        ) : mode === 'edit' && !readOnly ? (
          <div className="flex flex-col">
            <BlockDivider
              at={0}
              dragActive={dragSrc !== null}
              isOver={dragOver === 0}
              onClick={() => setPicker({ open: true, at: 0 })}
              onDragOver={setDragOver}
              onDrop={handleDropAt}
            />
            {blocks.map((block, i) => (
              <div key={block.id}>
                <LessonBlockEditor
                  block={block}
                  index={i}
                  total={blocks.length}
                  onChange={patch => patchBlock(i, patch)}
                  onMoveUp={() => move(i, -1)}
                  onMoveDown={() => move(i, +1)}
                  onDuplicate={() => duplicate(i)}
                  onDelete={() => removeBlock(i)}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragging={dragSrc === i}
                />
                <BlockDivider
                  at={i + 1}
                  dragActive={dragSrc !== null}
                  isOver={dragOver === i + 1}
                  onClick={() => setPicker({ open: true, at: i + 1 })}
                  onDragOver={setDragOver}
                  onDrop={handleDropAt}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setPicker({ open: true, at: blocks.length })}
              className="mt-3 w-full py-3.5 rounded-xl border border-dashed border-border hover:border-primary/50 hover:bg-surface-muted/40 transition-colors flex items-center justify-center gap-2 text-ink-muted hover:text-ink"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="text-[13px] font-semibold">Додати блок</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Card variant="surface" padding="sm" className="text-[12px] text-ink-muted">
              Режим попереднього перегляду — так побачить урок учень.
            </Card>
            {blocks.map((b, i) => (
              <LessonBlockPreview key={b.id} block={b} index={i} />
            ))}
          </div>
        )}
      </DashboardPageShell>
    </div>

    <BlockPicker
      open={picker?.open ?? false}
      onClose={() => setPicker(null)}
      onPick={kind => {
        if (picker) addBlock(picker.at, kind);
      }}
    />

    {toast && (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-semibold shadow-card-md">
        {toast}
      </div>
    )}
    </>
  );
}

function BlockDivider({
  at,
  dragActive = false,
  isOver = false,
  onClick,
  onDragOver,
  onDrop,
}: {
  at: number;
  dragActive?: boolean;
  isOver?: boolean;
  onClick: () => void;
  onDragOver?: (at: number) => void;
  onDrop?: (at: number) => void;
}) {
  return (
    <div
      className={`relative flex items-center justify-center group transition-all ${
        dragActive ? 'h-10' : 'h-6'
      }`}
      onDragOver={(e) => {
        if (!onDragOver) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        onDragOver(at);
      }}
      onDrop={(e) => {
        if (!onDrop) return;
        e.preventDefault();
        onDrop(at);
      }}
    >
      <span
        className={`absolute inset-x-0 transition-all ${
          isOver
            ? 'h-1 bg-primary rounded-full opacity-100'
            : 'h-px bg-border opacity-30 group-hover:opacity-70'
        }`}
      />
      <button
        type="button"
        onClick={onClick}
        className={`relative z-10 w-6 h-6 rounded-full bg-surface-raised border text-[13px] font-semibold transition-all ${
          isOver
            ? 'border-primary text-primary scale-110'
            : 'border-border text-ink-muted opacity-60 group-hover:opacity-100 hover:border-primary hover:text-ink'
        }`}
        aria-label="Додати блок тут"
      >
        +
      </button>
    </div>
  );
}
