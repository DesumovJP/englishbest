'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MOCK_LIBRARY,
  LESSON_SOURCE_LABELS,
  type BlockKind,
  type LessonBlock,
  type LibraryLesson,
  type Level,
} from '@/lib/teacher-mocks';
import { SegmentedControl, type SegmentedControlOption } from '@/components/teacher/ui';
import { SlideOver } from '@/components/atoms/SlideOver';
import { BlockPicker } from '@/components/teacher/BlockPicker';
import { LessonBlockEditor } from '@/components/teacher/LessonBlockEditor';
import { LessonBlockPreview } from '@/components/teacher/LessonBlockPreview';

const MODE_OPTIONS: ReadonlyArray<SegmentedControlOption<'edit' | 'preview'>> = [
  { value: 'edit',    label: 'Редагувати' },
  { value: 'preview', label: 'Перегляд' },
];

const LEVEL_OPTIONS: Level[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1'];

interface MockVersion {
  id: string;
  savedAt: string;
  note: string;
}

const MOCK_VERSIONS: MockVersion[] = [
  { id: 'v5', savedAt: '2026-04-18 14:22', note: 'Додано вправу на порядок слів' },
  { id: 'v4', savedAt: '2026-04-15 10:08', note: 'Оновлено флеш-картки' },
  { id: 'v3', savedAt: '2026-04-12 18:44', note: 'Виправлено опечатки' },
  { id: 'v2', savedAt: '2026-04-10 09:15', note: 'Додано аудіо' },
  { id: 'v1', savedAt: '2026-04-05 16:30', note: 'Початкова версія' },
];

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

function seedBlocksFor(lesson: LibraryLesson): LessonBlock[] {
  return [
    { id: 'sb1', kind: 'text', body: `Привіт! Сьогодні ми вчимо: ${lesson.topic}.` },
    {
      id: 'sb2',
      kind: 'exercise-multiple-choice',
      title: 'Обери правильний варіант',
      options: [
        { text: 'Варіант A', correct: false },
        { text: 'Варіант B', correct: true },
        { text: 'Варіант C', correct: false },
        { text: 'Варіант D', correct: false },
      ],
    },
    {
      id: 'sb3',
      kind: 'flashcards',
      title: 'Ключова лексика',
      cards: [
        { front: 'apple', back: 'яблуко' },
        { front: 'bread', back: 'хліб' },
        { front: 'water', back: 'вода' },
      ],
    },
  ];
}

export default function LessonEditorPage() {
  const params = useParams<{ id: string }>();
  const rawId = params?.id ?? 'new';
  const existing = rawId === 'new' ? null : MOCK_LIBRARY.find(l => l.id === rawId) ?? null;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [level, setLevel] = useState<Level>(existing?.level ?? 'A1');
  const [topic, setTopic] = useState(existing?.topic ?? '');
  const [blocks, setBlocks] = useState<LessonBlock[]>(() => (existing ? seedBlocksFor(existing) : []));
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [picker, setPicker] = useState<{ open: boolean; at: number } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(existing ? new Date() : null);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setDirty(true);
  }, [title, level, topic, blocks]);

  /* Auto-save mock — bumps the "saved" timestamp 2s after edits stop. */
  useEffect(() => {
    if (!dirty) return;
    const handle = window.setTimeout(() => {
      setSavedAt(new Date());
      setDirty(false);
    }, 2000);
    return () => window.clearTimeout(handle);
  }, [dirty]);

  const savedLabel = useMemo(() => {
    if (dirty) return 'Зберігаю…';
    if (!savedAt) return '';
    const secs = Math.max(1, Math.round((Date.now() - savedAt.getTime()) / 1000));
    if (secs < 60) return `Збережено ${secs}с тому`;
    return `Збережено ${Math.round(secs / 60)} хв тому`;
  }, [dirty, savedAt]);

  function addBlock(at: number, kind: BlockKind) {
    const b = createEmptyBlock(kind);
    setBlocks(prev => [...prev.slice(0, at), b, ...prev.slice(at)]);
  }

  function patchBlock(index: number, patch: Partial<LessonBlock>) {
    setBlocks(prev => prev.map((b, i) => (i === index ? ({ ...b, ...patch } as LessonBlock) : b)));
  }

  function move(index: number, delta: number) {
    const next = [...blocks];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setBlocks(next);
  }

  function duplicate(index: number) {
    const src = blocks[index];
    const copy: LessonBlock = { ...src, id: `b${Date.now()}${Math.random().toString(36).slice(2, 6)}` };
    setBlocks(prev => [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)]);
  }

  function removeBlock(index: number) {
    setBlocks(prev => prev.filter((_, i) => i !== index));
  }

  function flashToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  }

  function save() {
    setSavedAt(new Date());
    setDirty(false);
    flashToast('💾 Збережено');
  }

  function saveAsTemplate() {
    flashToast('📋 Збережено як шаблон');
  }

  function restoreVersion(v: MockVersion) {
    flashToast(`↻ Відновлено версію від ${v.savedAt}`);
    setHistoryOpen(false);
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <Link href="/dashboard/teacher-library" className="hover:text-primary-dark transition-colors">
            ← Бібліотека
          </Link>
          {existing && (
            <>
              <span>·</span>
              <span>{LESSON_SOURCE_LABELS[existing.source]}</span>
            </>
          )}
          {savedLabel && (
            <>
              <span>·</span>
              <span className={dirty ? 'text-accent-dark' : 'text-ink-faint'}>{savedLabel}</span>
            </>
          )}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Назва уроку"
              className="w-full text-2xl font-black text-ink bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none pb-1"
            />
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={level}
                onChange={e => setLevel(e.target.value as Level)}
                className="h-9 px-3 rounded-xl border border-border bg-white text-sm font-bold text-ink focus:outline-none focus:border-primary"
              >
                {LEVEL_OPTIONS.map(l => (
                  <option key={l} value={l}>Рівень {l}</option>
                ))}
              </select>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="Тема / тег (опціонально)"
                className="h-9 px-3 rounded-xl border border-border bg-white text-sm text-ink focus:outline-none focus:border-primary"
              />
              <span className="text-xs text-ink-muted">· {blocks.length} блоків</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <SegmentedControl value={mode} onChange={setMode} options={MODE_OPTIONS} label="Режим" />
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="h-9 px-3 rounded-xl border border-border text-sm font-bold text-ink-muted hover:text-ink hover:border-primary/40 transition-colors"
            >
              🕓 Версії
            </button>
            <button
              type="button"
              onClick={saveAsTemplate}
              className="h-9 px-3 rounded-xl border border-border text-sm font-bold text-ink-muted hover:text-ink hover:border-primary/40 transition-colors"
            >
              📋 Шаблон
            </button>
            <button
              type="button"
              onClick={save}
              className="h-9 px-4 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white text-sm font-black hover:opacity-90 transition-opacity"
            >
              Зберегти
            </button>
          </div>
        </div>
      </header>

      {blocks.length === 0 ? (
        <button
          type="button"
          onClick={() => setPicker({ open: true, at: 0 })}
          className="w-full py-16 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors flex flex-col items-center gap-2 text-ink-muted"
        >
          <span className="text-3xl">➕</span>
          <p className="font-black text-ink">Почати з першого блоку</p>
          <p className="text-xs">Обери тип: текст, вправа, аудіо, відео…</p>
        </button>
      ) : mode === 'edit' ? (
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
          <div className="rounded-xl px-4 py-2 bg-primary/5 border border-primary/20 text-xs font-bold text-primary-dark">
            👁 Режим попереднього перегляду. Так побачить урок учень.
          </div>
          {blocks.map((b, i) => (
            <LessonBlockPreview key={b.id} block={b} index={i} />
          ))}
        </div>
      )}

      <BlockPicker
        open={picker?.open ?? false}
        onClose={() => setPicker(null)}
        onPick={kind => {
          if (picker) addBlock(picker.at, kind);
        }}
      />

      <SlideOver open={historyOpen} onClose={() => setHistoryOpen(false)} title="Історія версій">
        <div className="flex flex-col divide-y divide-border">
          {MOCK_VERSIONS.map((v, i) => (
            <div key={v.id} className="px-6 py-4 flex items-start gap-3">
              <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${i === 0 ? 'bg-primary' : 'bg-border'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-black text-ink">{v.savedAt}</p>
                  {i === 0 && (
                    <span className="text-[10px] font-black text-primary-dark bg-primary/10 px-2 py-0.5 rounded-md">
                      Поточна
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-muted mt-0.5">{v.note}</p>
              </div>
              <button
                type="button"
                onClick={() => restoreVersion(v)}
                disabled={i === 0}
                className="text-xs font-bold text-primary-dark hover:underline disabled:opacity-30 disabled:no-underline"
              >
                Відновити
              </button>
            </div>
          ))}
        </div>
      </SlideOver>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl bg-ink text-white text-sm font-bold shadow-card-md">
          {toast}
        </div>
      )}

    </div>
  );
}

function BlockDivider({ onClick }: { onClick: () => void }) {
  return (
    <div className="relative h-6 flex items-center justify-center group">
      <span className="absolute inset-x-0 h-px bg-border opacity-0 group-hover:opacity-60 transition-opacity" />
      <button
        type="button"
        onClick={onClick}
        className="relative z-10 w-7 h-7 rounded-full bg-white border border-border text-ink-muted text-sm font-black hover:border-primary hover:text-primary-dark hover:bg-primary/5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
        aria-label="Додати блок тут"
      >
        +
      </button>
    </div>
  );
}
