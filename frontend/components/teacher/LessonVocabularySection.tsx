/**
 * VocabularyAttachSection — vocab attach/create panel for the editors.
 *
 * Works for both lesson editor (parent="lesson") and course editor
 * (parent="course"). Three actions:
 *   - lists currently-attached sets (with detach button)
 *   - "Прикріпити" → modal with searchable list of all sets
 *   - "Створити" → modal with title + words textarea (auto-attach)
 *
 * All writes go through the staff-write proxy at /api/vocabulary-sets.
 * Disabled when the host has no documentId yet (unsaved draft).
 *
 * Backwards-compat: `LessonVocabularySection` still exported as a thin
 * wrapper so the existing lesson editor doesn't have to change shape.
 */
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  createVocabSet,
  fetchAllVocabSets,
  fetchVocabSetsForParent,
  parseWordsTextarea,
  setVocabSetParent,
  type Level,
  type ParentKind,
  type VocabSetSummary,
} from '@/lib/teacher-vocabulary';

interface Props {
  parent: ParentKind;
  parentDocumentId: string | null;
  /** Used as the default title prefix when creating a new set inline. */
  parentTitle: string;
  parentLevel: Level | null;
  /** When true, hide all action buttons (e.g. for platform/template hosts). */
  readOnly?: boolean;
  /** Override section heading. Defaults to "Словник уроку" / "Словник курсу". */
  heading?: string;
}

const SECTION_LABEL_CLS =
  'font-bold text-[11px] uppercase tracking-[0.04em] text-ink-muted';

export function VocabularyAttachSection({
  parent,
  parentDocumentId,
  parentTitle,
  parentLevel,
  readOnly,
  heading,
}: Props) {
  const [attached, setAttached] = useState<VocabSetSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);

  useEffect(() => {
    if (!parentDocumentId) {
      setAttached([]);
      return;
    }
    let alive = true;
    setLoading(true);
    fetchVocabSetsForParent(parent, parentDocumentId)
      .then((rows) => {
        if (!alive) return;
        setAttached(rows);
        setError(null);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'failed');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [parent, parentDocumentId]);

  const parentLabel = parent === 'lesson' ? 'уроку' : 'курсу';

  async function handleDetach(set: VocabSetSummary) {
    if (!confirm(`Відкріпити «${set.titleUa || set.title}» від цього ${parentLabel}?`)) return;
    try {
      await setVocabSetParent(set.documentId, parent, null);
      setAttached((prev) => (prev ? prev.filter((s) => s.documentId !== set.documentId) : null));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'failed');
    }
  }

  async function handleAttach(set: VocabSetSummary) {
    if (!parentDocumentId) return;
    try {
      await setVocabSetParent(set.documentId, parent, parentDocumentId);
      const next = parent === 'lesson'
        ? { ...set, lessonDocumentId: parentDocumentId, lessonSlug: null }
        : { ...set, courseDocumentId: parentDocumentId, courseSlug: null };
      setAttached((prev) => (prev ? [...prev, next] : [next]));
      setPickerOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'failed');
    }
  }

  async function handleCreate(payload: {
    title: string;
    titleUa: string;
    level: Level;
    iconEmoji: string;
    wordsRaw: string;
  }) {
    if (!parentDocumentId) return;
    const words = parseWordsTextarea(payload.wordsRaw);
    if (words.length === 0) {
      throw new Error('Додай хоча б одне слово у форматі "word — переклад"');
    }
    const created = await createVocabSet({
      title: payload.title,
      titleUa: payload.titleUa || undefined,
      level: payload.level,
      iconEmoji: payload.iconEmoji,
      words,
      lessonDocumentId: parent === 'lesson' ? parentDocumentId : null,
      courseDocumentId: parent === 'course' ? parentDocumentId : null,
    });
    setAttached((prev) => (prev ? [...prev, created] : [created]));
    setCreatorOpen(false);
  }

  const canEdit = !!parentDocumentId && !readOnly;
  const sectionHeading = heading ?? `Словник ${parentLabel}`;

  return (
    <div className="ios-card p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className={SECTION_LABEL_CLS}>{sectionHeading}</p>
        {canEdit && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="ios-btn ios-btn-secondary ios-btn-sm"
            >
              + Прикріпити
            </button>
            <button
              type="button"
              onClick={() => setCreatorOpen(true)}
              className="ios-btn ios-btn-primary ios-btn-sm"
            >
              + Створити
            </button>
          </div>
        )}
      </div>

      {!parentDocumentId && (
        <p className="text-[12.5px] text-ink-muted">
          Збережи {parentLabel}, щоб прикріпити чи створити словник.
        </p>
      )}

      {loading && (
        <p className="text-[12.5px] text-ink-faint">Завантаження…</p>
      )}

      {error && (
        <p className="text-[12.5px] text-danger-dark">Помилка: {error}</p>
      )}

      {parentDocumentId && attached && attached.length === 0 && !loading && (
        <p className="text-[12.5px] text-ink-muted">
          Поки нічого не прикріплено. Прикріпи існуючий словник або створи новий.
        </p>
      )}

      {attached && attached.length > 0 && (
        <ul className="ios-list">
          {attached.map((set, i) => (
            <li
              key={set.documentId}
              className={i > 0 ? 'border-t border-border' : ''}
            >
              <div className="flex items-center gap-3 px-3 py-2.5">
                <span aria-hidden className="text-[20px] flex-shrink-0">
                  {set.iconEmoji ?? '📚'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-[13.5px] text-ink leading-tight truncate">
                    {set.titleUa || set.title}
                  </p>
                  <p className="font-medium text-[11.5px] text-ink-faint mt-0.5 tabular-nums">
                    {set.wordCount} слів{set.level ? ` · ${set.level}` : ''}
                  </p>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleDetach(set)}
                    className="ios-btn ios-btn-ghost ios-btn-sm text-danger-dark"
                  >
                    Відкріпити
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {pickerOpen && (
        <VocabPickerModal
          excludeIds={new Set((attached ?? []).map((s) => s.documentId))}
          onPick={handleAttach}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {creatorOpen && (
        <VocabCreatorModal
          defaultTitle={parentTitle}
          defaultLevel={parentLevel ?? 'A1'}
          onCreate={handleCreate}
          onClose={() => setCreatorOpen(false)}
        />
      )}
    </div>
  );
}

/** Back-compat wrapper for the existing lesson editor call site. */
export function LessonVocabularySection({
  lessonDocumentId,
  lessonTitle,
  lessonLevel,
  readOnly,
}: {
  lessonDocumentId: string | null;
  lessonTitle: string;
  lessonLevel: Level | null;
  readOnly?: boolean;
}) {
  return (
    <VocabularyAttachSection
      parent="lesson"
      parentDocumentId={lessonDocumentId}
      parentTitle={lessonTitle}
      parentLevel={lessonLevel}
      readOnly={readOnly}
    />
  );
}

// ─── Picker modal ────────────────────────────────────────────────────

function VocabPickerModal({
  excludeIds,
  onPick,
  onClose,
}: {
  excludeIds: Set<string>;
  onPick: (set: VocabSetSummary) => void;
  onClose: () => void;
}) {
  const [all, setAll] = useState<VocabSetSummary[] | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchAllVocabSets()
      .then((rows) => alive && setAll(rows))
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'failed'));
    return () => {
      alive = false;
    };
  }, []);

  const visible = useMemo(() => {
    if (!all) return [];
    const q = query.trim().toLowerCase();
    return all
      .filter((s) => !excludeIds.has(s.documentId))
      .filter((s) =>
        q === ''
          ? true
          : `${s.title} ${s.titleUa ?? ''} ${s.slug}`.toLowerCase().includes(q),
      );
  }, [all, query, excludeIds]);

  return (
    <ModalShell title="Прикріпити словник" onClose={onClose}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Пошук за назвою…"
        className="ios-input mb-3"
        autoFocus
      />
      {error && (
        <p className="text-[12.5px] text-danger-dark mb-2">Помилка: {error}</p>
      )}
      {!all && <p className="text-[12.5px] text-ink-faint">Завантаження…</p>}
      {all && visible.length === 0 && (
        <p className="text-[12.5px] text-ink-muted">Нічого не знайдено.</p>
      )}
      {visible.length > 0 && (
        <ul className="ios-list max-h-[50vh] overflow-y-auto">
          {visible.map((set, i) => (
            <li
              key={set.documentId}
              className={i > 0 ? 'border-t border-border' : ''}
            >
              <button
                type="button"
                onClick={() => onPick(set)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-hover transition-colors"
              >
                <span aria-hidden className="text-[20px] flex-shrink-0">
                  {set.iconEmoji ?? '📚'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-[13.5px] text-ink leading-tight truncate">
                    {set.titleUa || set.title}
                  </p>
                  <p className="font-medium text-[11.5px] text-ink-faint mt-0.5 tabular-nums">
                    {set.wordCount} слів{set.level ? ` · ${set.level}` : ''}
                    {set.lessonSlug ? ` · уже в уроку «${set.lessonSlug}»` : ''}
                  </p>
                </div>
                <span aria-hidden className="text-ink-faint font-black text-base">›</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </ModalShell>
  );
}

// ─── Creator modal ───────────────────────────────────────────────────

function VocabCreatorModal({
  defaultTitle,
  defaultLevel,
  onCreate,
  onClose,
}: {
  defaultTitle: string;
  defaultLevel: Level;
  onCreate: (input: {
    title: string;
    titleUa: string;
    level: Level;
    iconEmoji: string;
    wordsRaw: string;
  }) => Promise<void>;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(defaultTitle ? `${defaultTitle} · Words` : '');
  const [titleUa, setTitleUa] = useState('');
  const [level, setLevel] = useState<Level>(defaultLevel);
  const [iconEmoji, setIconEmoji] = useState('📚');
  const [wordsRaw, setWordsRaw] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!title.trim()) {
      setError('Назва обовʼязкова');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onCreate({ title: title.trim(), titleUa: titleUa.trim(), level, iconEmoji, wordsRaw });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalShell title="Новий словник" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className={SECTION_LABEL_CLS}>Назва (English)</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="ios-input"
            placeholder="e.g. Family Words"
            autoFocus
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={SECTION_LABEL_CLS}>Назва (UA)</span>
          <input
            value={titleUa}
            onChange={(e) => setTitleUa(e.target.value)}
            className="ios-input"
            placeholder="напр. Слова про родину"
          />
        </label>
        <div className="flex gap-3">
          <label className="flex flex-col gap-1 flex-1">
            <span className={SECTION_LABEL_CLS}>Рівень</span>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as Level)}
              className="ios-input"
            >
              {(['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as Level[]).map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 w-24">
            <span className={SECTION_LABEL_CLS}>Емоджі</span>
            <input
              value={iconEmoji}
              onChange={(e) => setIconEmoji(e.target.value)}
              className="ios-input text-center text-[20px]"
              maxLength={4}
            />
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className={SECTION_LABEL_CLS}>
            Слова (один на рядок, формат «word — переклад»)
          </span>
          <textarea
            value={wordsRaw}
            onChange={(e) => setWordsRaw(e.target.value)}
            rows={8}
            className="ios-input font-mono text-[13px] py-2 leading-relaxed"
            placeholder={
              'apple — яблуко\nbanana — банан\norange — апельсин'
            }
            style={{ height: 'auto' }}
          />
          <span className="font-medium text-[11px] text-ink-faint">
            {parseWordsTextarea(wordsRaw).length} слів готово
          </span>
        </label>
        {error && (
          <p className="text-[12.5px] text-danger-dark">{error}</p>
        )}
        <div className="flex gap-2 justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="ios-btn ios-btn-secondary"
          >
            Скасувати
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={busy}
            className="ios-btn ios-btn-primary"
          >
            {busy ? 'Створюю…' : 'Створити і прикріпити'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Modal shell ─────────────────────────────────────────────────────

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
      <div className="bg-surface-raised rounded-2xl shadow-overlay w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface-raised border-b border-border px-4 py-3 flex items-center justify-between">
          <p className="font-black text-[14px] text-ink">{title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрити"
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-muted text-ink hover:bg-surface-hover"
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
