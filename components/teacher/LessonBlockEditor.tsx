'use client';
import { BLOCK_KIND_ICONS, BLOCK_KIND_LABELS, type LessonBlock } from '@/lib/teacher-mocks';

interface LessonBlockEditorProps {
  block: LessonBlock;
  index: number;
  total: number;
  onChange: (patch: Partial<LessonBlock>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const fieldLabel = 'text-xs font-black text-ink-muted uppercase tracking-wide';
const fieldInput =
  'w-full mt-1.5 px-3 py-2 rounded-xl border border-border bg-white text-sm text-ink focus:outline-none focus:border-primary';

export function LessonBlockEditor({
  block,
  index,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: LessonBlockEditorProps) {
  function confirmDelete() {
    if (window.confirm('Видалити цей блок? Дію неможливо скасувати.')) onDelete();
  }

  return (
    <article className="group bg-white rounded-2xl border border-border overflow-hidden">
      <header className="flex items-center gap-2 px-4 py-2.5 bg-surface-muted border-b border-border">
        <span className="text-lg">{BLOCK_KIND_ICONS[block.kind]}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black text-ink-muted uppercase tracking-wide leading-none">
            Блок {index + 1}
          </p>
          <p className="text-xs font-bold text-ink truncate">{BLOCK_KIND_LABELS[block.kind]}</p>
        </div>
        <div className="flex items-center gap-0.5">
          <ToolbarBtn label="Вгору" disabled={index === 0} onClick={onMoveUp}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn label="Вниз" disabled={index === total - 1} onClick={onMoveDown}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn label="Дублювати" onClick={onDuplicate}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn label="Видалити" onClick={confirmDelete} tone="danger">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            </svg>
          </ToolbarBtn>
        </div>
      </header>

      <div className="p-4 flex flex-col gap-3">
        <BlockFields block={block} onChange={onChange} />
      </div>
    </article>
  );
}

function ToolbarBtn({
  children,
  label,
  onClick,
  disabled,
  tone = 'default',
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
        disabled
          ? 'text-ink-faint cursor-not-allowed'
          : tone === 'danger'
            ? 'text-ink-muted hover:bg-danger/10 hover:text-danger-dark'
            : 'text-ink-muted hover:bg-white hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

function BlockFields({
  block,
  onChange,
}: {
  block: LessonBlock;
  onChange: (patch: Partial<LessonBlock>) => void;
}) {
  switch (block.kind) {
    case 'text':
      return (
        <div>
          <label className={fieldLabel}>Текст</label>
          <textarea
            value={block.body ?? ''}
            onChange={e => onChange({ body: e.target.value })}
            placeholder="Поясни тему простими словами…"
            className={`${fieldInput} min-h-24 resize-y`}
          />
        </div>
      );

    case 'image':
      return (
        <>
          <div>
            <label className={fieldLabel}>URL зображення</label>
            <input
              type="url"
              value={block.mediaUrl ?? ''}
              onChange={e => onChange({ mediaUrl: e.target.value })}
              placeholder="https://…"
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>Підпис (необов'язково)</label>
            <input
              type="text"
              value={block.body ?? ''}
              onChange={e => onChange({ body: e.target.value })}
              placeholder="Що на зображенні?"
              className={fieldInput}
            />
          </div>
        </>
      );

    case 'audio':
    case 'video':
      return (
        <>
          <div>
            <label className={fieldLabel}>Назва</label>
            <input
              type="text"
              value={block.title ?? ''}
              onChange={e => onChange({ title: e.target.value })}
              placeholder={block.kind === 'audio' ? 'Наприклад: Dialogue — At the café' : 'Наприклад: Interview clip'}
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>URL</label>
            <input
              type="url"
              value={block.mediaUrl ?? ''}
              onChange={e => onChange({ mediaUrl: e.target.value })}
              placeholder="https://…"
              className={fieldInput}
            />
          </div>
        </>
      );

    case 'exercise-multiple-choice':
      return (
        <>
          <div>
            <label className={fieldLabel}>Питання</label>
            <input
              type="text"
              value={block.title ?? ''}
              onChange={e => onChange({ title: e.target.value })}
              placeholder="Що означає слово 'brilliant'?"
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>Варіанти (обери правильний)</label>
            <div className="flex flex-col gap-2 mt-1.5">
              {(block.options ?? []).map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next = (block.options ?? []).map((o, j) => ({ ...o, correct: j === i }));
                      onChange({ options: next });
                    }}
                    title={opt.correct ? 'Правильний' : 'Позначити як правильний'}
                    className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center text-sm transition-colors flex-shrink-0 ${
                      opt.correct
                        ? 'border-primary bg-primary text-white'
                        : 'border-border text-ink-faint hover:border-primary/40'
                    }`}
                  >
                    {opt.correct ? '✓' : String.fromCharCode(65 + i)}
                  </button>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={e => {
                      const next = [...(block.options ?? [])];
                      next[i] = { ...next[i], text: e.target.value };
                      onChange({ options: next });
                    }}
                    className="flex-1 h-9 px-3 rounded-xl border border-border bg-white text-sm text-ink focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = (block.options ?? []).filter((_, j) => j !== i);
                      onChange({ options: next });
                    }}
                    disabled={(block.options ?? []).length <= 2}
                    className="w-8 h-8 rounded-xl text-ink-muted hover:bg-danger/10 hover:text-danger-dark disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-muted flex items-center justify-center flex-shrink-0"
                    aria-label="Видалити варіант"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {(block.options ?? []).length < 6 && (
              <button
                type="button"
                onClick={() => onChange({ options: [...(block.options ?? []), { text: '', correct: false }] })}
                className="mt-2 text-xs font-bold text-primary-dark hover:underline"
              >
                + Додати варіант
              </button>
            )}
          </div>
        </>
      );

    case 'exercise-text-input':
      return (
        <>
          <div>
            <label className={fieldLabel}>Питання</label>
            <input
              type="text"
              value={block.title ?? ''}
              onChange={e => onChange({ title: e.target.value })}
              placeholder="Яке слово у пропуску?"
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>Правильна відповідь</label>
            <input
              type="text"
              value={block.correctAnswer ?? ''}
              onChange={e => onChange({ correctAnswer: e.target.value })}
              placeholder="Точна відповідь (регістр не враховується)"
              className={fieldInput}
            />
          </div>
        </>
      );

    case 'exercise-matching':
      return (
        <>
          <div>
            <label className={fieldLabel}>Інструкція</label>
            <input
              type="text"
              value={block.title ?? ''}
              onChange={e => onChange({ title: e.target.value })}
              placeholder="Зістав англійські слова з перекладом"
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>Пари</label>
            <div className="flex flex-col gap-2 mt-1.5">
              {(block.items ?? []).map((it, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={it.left}
                    onChange={e => {
                      const next = [...(block.items ?? [])];
                      next[i] = { ...next[i], left: e.target.value };
                      onChange({ items: next });
                    }}
                    placeholder="Ліворуч"
                    className="flex-1 h-9 px-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-primary"
                  />
                  <span className="text-ink-faint">↔</span>
                  <input
                    type="text"
                    value={it.right}
                    onChange={e => {
                      const next = [...(block.items ?? [])];
                      next[i] = { ...next[i], right: e.target.value };
                      onChange({ items: next });
                    }}
                    placeholder="Праворуч"
                    className="flex-1 h-9 px-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => onChange({ items: (block.items ?? []).filter((_, j) => j !== i) })}
                    disabled={(block.items ?? []).length <= 2}
                    className="w-8 h-8 rounded-xl text-ink-muted hover:bg-danger/10 hover:text-danger-dark disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-muted flex items-center justify-center flex-shrink-0"
                    aria-label="Видалити пару"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => onChange({ items: [...(block.items ?? []), { left: '', right: '' }] })}
              className="mt-2 text-xs font-bold text-primary-dark hover:underline"
            >
              + Додати пару
            </button>
          </div>
        </>
      );

    case 'exercise-word-order':
      return (
        <>
          <div>
            <label className={fieldLabel}>Інструкція</label>
            <input
              type="text"
              value={block.title ?? ''}
              onChange={e => onChange({ title: e.target.value })}
              placeholder="Склади речення з поданих слів"
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>Слова у правильному порядку</label>
            <div className="flex flex-col gap-2 mt-1.5">
              {(block.words ?? []).map((w, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-7 text-right text-xs font-black text-ink-faint">{i + 1}.</span>
                  <input
                    type="text"
                    value={w}
                    onChange={e => {
                      const next = [...(block.words ?? [])];
                      next[i] = e.target.value;
                      onChange({ words: next });
                    }}
                    className="flex-1 h-9 px-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => onChange({ words: (block.words ?? []).filter((_, j) => j !== i) })}
                    disabled={(block.words ?? []).length <= 2}
                    className="w-8 h-8 rounded-xl text-ink-muted hover:bg-danger/10 hover:text-danger-dark disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-muted flex items-center justify-center flex-shrink-0"
                    aria-label="Видалити слово"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => onChange({ words: [...(block.words ?? []), ''] })}
              className="mt-2 text-xs font-bold text-primary-dark hover:underline"
            >
              + Додати слово
            </button>
          </div>
        </>
      );

    case 'exercise-fill-gap':
      return (
        <>
          <div>
            <label className={fieldLabel}>Інструкція</label>
            <input
              type="text"
              value={block.title ?? ''}
              onChange={e => onChange({ title: e.target.value })}
              placeholder="Заповни пропуск"
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>Речення (використай ___ для пропуску)</label>
            <textarea
              value={block.body ?? ''}
              onChange={e => onChange({ body: e.target.value })}
              placeholder="She ___ to school every day."
              className={`${fieldInput} min-h-16 resize-y`}
            />
          </div>
          <div>
            <label className={fieldLabel}>Правильна відповідь</label>
            <input
              type="text"
              value={block.correctAnswer ?? ''}
              onChange={e => onChange({ correctAnswer: e.target.value })}
              placeholder="goes"
              className={fieldInput}
            />
          </div>
        </>
      );

    case 'flashcards':
      return (
        <>
          <div>
            <label className={fieldLabel}>Назва набору</label>
            <input
              type="text"
              value={block.title ?? ''}
              onChange={e => onChange({ title: e.target.value })}
              placeholder="Фрукти"
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>Картки</label>
            <div className="flex flex-col gap-2 mt-1.5">
              {(block.cards ?? []).map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={c.front}
                    onChange={e => {
                      const next = [...(block.cards ?? [])];
                      next[i] = { ...next[i], front: e.target.value };
                      onChange({ cards: next });
                    }}
                    placeholder="Перед"
                    className="flex-1 h-9 px-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-primary"
                  />
                  <span className="text-ink-faint">⇌</span>
                  <input
                    type="text"
                    value={c.back}
                    onChange={e => {
                      const next = [...(block.cards ?? [])];
                      next[i] = { ...next[i], back: e.target.value };
                      onChange({ cards: next });
                    }}
                    placeholder="Зад"
                    className="flex-1 h-9 px-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => onChange({ cards: (block.cards ?? []).filter((_, j) => j !== i) })}
                    disabled={(block.cards ?? []).length <= 1}
                    className="w-8 h-8 rounded-xl text-ink-muted hover:bg-danger/10 hover:text-danger-dark disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-muted flex items-center justify-center flex-shrink-0"
                    aria-label="Видалити картку"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => onChange({ cards: [...(block.cards ?? []), { front: '', back: '' }] })}
              className="mt-2 text-xs font-bold text-primary-dark hover:underline"
            >
              + Додати картку
            </button>
          </div>
        </>
      );

    case 'link':
      return (
        <>
          <div>
            <label className={fieldLabel}>URL</label>
            <input
              type="url"
              value={block.linkUrl ?? ''}
              onChange={e => onChange({ linkUrl: e.target.value })}
              placeholder="https://…"
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>Опис</label>
            <input
              type="text"
              value={block.linkDescription ?? ''}
              onChange={e => onChange({ linkDescription: e.target.value })}
              placeholder="Що знайти за посиланням"
              className={fieldInput}
            />
          </div>
        </>
      );

    case 'teacher-note':
      return (
        <div>
          <label className={fieldLabel}>Нотатка (бачить лише викладач)</label>
          <textarea
            value={block.body ?? ''}
            onChange={e => onChange({ body: e.target.value })}
            placeholder="Нагадування для себе…"
            className={`${fieldInput} min-h-20 resize-y bg-accent/5 border-accent/30`}
          />
        </div>
      );
  }
}
