'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
  updateLesson,
} from '@/lib/teacher-library';
import { SegmentedControl, type SegmentedControlOption } from '@/components/teacher/ui';
import { BlockPicker } from '@/components/teacher/BlockPicker';
import { LessonBlockEditor } from '@/components/teacher/LessonBlockEditor';
import { LessonBlockPreview } from '@/components/teacher/LessonBlockPreview';
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
  const [blocks, setBlocks] = useState<LessonBlock[]>([]);
  const [source, setSource] = useState<LessonSource>('own');
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [picker, setPicker] = useState<{ open: boolean; at: number } | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
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
        setBlocks(detail.blocks);
        setSource(detail.source);
        setSavedAt(new Date());
        setDirty(false);
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
  }, [title, level, topic, durationMin, blocks, loading]);

  const savedLabel = useMemo(() => {
    if (saving) return 'Зберігаю…';
    if (dirty) return 'Незбережені зміни';
    if (!savedAt) return '';
    const secs = Math.max(1, Math.round((Date.now() - savedAt.getTime()) / 1000));
    if (secs < 60) return `Збережено ${secs}с тому`;
    return `Збережено ${Math.round(secs / 60)} хв тому`;
  }, [saving, dirty, savedAt]);

  const save = useCallback(async () => {
    if (readOnly) {
      setToast('Урок тільки для читання — зробіть копію');
      window.setTimeout(() => setToast(null), 1800);
      return;
    }
    if (!title.trim()) {
      setSaveError('Вкажіть назву уроку');
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
          steps: blocks,
          source: 'own',
        });
        setDocId(created.id);
        setSource(created.source);
        setSavedAt(new Date());
        setDirty(false);
        router.replace(`/dashboard/teacher-library/${created.id}/edit`);
      }
      setToast('Збережено');
      window.setTimeout(() => setToast(null), 1500);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'failed');
    } finally {
      setSaving(false);
    }
  }, [docId, title, level, topic, durationMin, blocks, readOnly, router]);

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
    <Link
      href="/dashboard/teacher-library"
      className="inline-flex items-center gap-1 text-[12px] font-semibold text-ink-muted hover:text-ink w-fit"
    >
      ← Бібліотека
    </Link>
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
            <SegmentedControl value={mode} onChange={setMode} options={MODE_OPTIONS} label="Режим" />
            {readOnly ? (
              <Button onClick={cloneAsCopy}>Копіювати</Button>
            ) : (
              <>
                <Button onClick={save} disabled={saving}>
                  {saving ? 'Зберігаю…' : 'Зберегти'}
                </Button>
                {docId && !isNew && (
                  <Button
                    variant="danger"
                    onClick={async () => {
                      if (!window.confirm(`Видалити урок «${title || 'без назви'}»?`)) return;
                      try {
                        await deleteLesson(docId);
                        router.push('/dashboard/teacher-library');
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
              onChange={e => setDurationMin(Number(e.target.value))}
              disabled={readOnly}
              aria-label="Тривалість (хв)"
              className="w-20 tabular-nums"
            />
            <span className="text-[12px] text-ink-muted tabular-nums">{blocks.length} блоків</span>
          </div>
          {saveError && (
            <p className="text-[12px] text-danger-dark">{saveError}</p>
          )}
        </div>

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
            <BlockDivider onClick={() => setPicker({ open: true, at: 0 })} />
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
                />
                <BlockDivider onClick={() => setPicker({ open: true, at: i + 1 })} />
              </div>
            ))}
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

function BlockDivider({ onClick }: { onClick: () => void }) {
  return (
    <div className="relative h-6 flex items-center justify-center group">
      <span className="absolute inset-x-0 h-px bg-border opacity-0 group-hover:opacity-60 transition-opacity" />
      <button
        type="button"
        onClick={onClick}
        className="relative z-10 w-6 h-6 rounded-full bg-surface-raised border border-border text-ink-muted text-[13px] font-semibold hover:border-primary hover:text-ink opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
        aria-label="Додати блок тут"
      >
        +
      </button>
    </div>
  );
}
