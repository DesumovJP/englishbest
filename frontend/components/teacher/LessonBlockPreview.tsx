'use client';
import { useState } from 'react';
import { BLOCK_KIND_ICONS, type LessonBlock } from '@/lib/teacher-mocks';

interface LessonBlockPreviewProps {
  block: LessonBlock;
  index: number;
}

export function LessonBlockPreview({ block, index }: LessonBlockPreviewProps) {
  return (
    <article className="bg-white rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{BLOCK_KIND_ICONS[block.kind]}</span>
        <span className="text-[10px] font-black text-ink-muted uppercase tracking-wide">
          Блок {index + 1}
        </span>
      </div>
      <Renderer block={block} />
    </article>
  );
}

function Renderer({ block }: { block: LessonBlock }) {
  switch (block.kind) {
    case 'text':
      return (
        <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
          {block.body || <em className="text-ink-faint">порожній текстовий блок</em>}
        </p>
      );

    case 'image':
      return (
        <div className="flex flex-col gap-2">
          <div className="aspect-video rounded-xl bg-surface-muted border border-border flex items-center justify-center overflow-hidden">
            {block.mediaUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={block.mediaUrl} alt={block.body ?? ''} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl opacity-30">🖼️</span>
            )}
          </div>
          {block.body && <p className="text-xs text-ink-muted text-center">{block.body}</p>}
        </div>
      );

    case 'audio':
      return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-muted">
          <span className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-lg flex-shrink-0">
            ▶
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-ink truncate">{block.title || 'Без назви'}</p>
            <p className="text-[11px] text-ink-faint truncate">{block.mediaUrl || 'URL не вказано'}</p>
          </div>
        </div>
      );

    case 'video':
      return (
        <div className="aspect-video rounded-xl bg-ink text-white flex flex-col items-center justify-center gap-2">
          <span className="text-3xl">🎬</span>
          <p className="text-sm font-bold">{block.title || 'Без назви'}</p>
          {block.mediaUrl && <p className="text-[11px] opacity-60 truncate px-4">{block.mediaUrl}</p>}
        </div>
      );

    case 'exercise-multiple-choice':
      return <MultipleChoicePreview block={block} />;

    case 'exercise-text-input':
      return (
        <div>
          <p className="text-sm font-bold text-ink mb-2">{block.title || 'Питання'}</p>
          <input
            type="text"
            disabled
            placeholder="Твоя відповідь…"
            className="w-full h-10 px-3 rounded-xl border border-border bg-surface-muted text-sm text-ink-muted"
          />
          <p className="mt-2 text-[11px] text-ink-faint">
            Правильно: <span className="font-bold text-primary-dark">{block.correctAnswer || '—'}</span>
          </p>
        </div>
      );

    case 'exercise-matching':
      return (
        <div>
          <p className="text-sm font-bold text-ink mb-3">{block.title || 'Зістав пари'}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1.5">
              {(block.items ?? []).map((it, i) => (
                <div key={i} className="px-3 py-2 rounded-lg bg-primary/5 text-sm font-bold text-ink">
                  {it.left || <em className="text-ink-faint">—</em>}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              {(block.items ?? []).map((it, i) => (
                <div key={i} className="px-3 py-2 rounded-lg bg-secondary/5 text-sm text-ink">
                  {it.right || <em className="text-ink-faint">—</em>}
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'exercise-word-order':
      return (
        <div>
          <p className="text-sm font-bold text-ink mb-3">{block.title || 'Склади речення'}</p>
          <div className="flex flex-wrap gap-1.5">
            {[...(block.words ?? [])]
              .sort(() => 0.5 - Math.random())
              .map((w, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-white border border-border text-sm font-bold text-ink shadow-sm">
                  {w || '—'}
                </span>
              ))}
          </div>
          <p className="mt-3 text-[11px] text-ink-faint">
            Правильний порядок:{' '}
            <span className="font-bold text-primary-dark">{(block.words ?? []).join(' ') || '—'}</span>
          </p>
        </div>
      );

    case 'exercise-fill-gap':
      return (
        <div>
          <p className="text-sm font-bold text-ink mb-2">{block.title || 'Заповни пропуск'}</p>
          <p className="text-sm text-ink leading-relaxed">
            {(block.body ?? '').split('___').map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className="inline-block mx-1 px-3 py-0.5 rounded-md bg-primary/10 border-2 border-dashed border-primary/40 text-xs font-bold text-primary-dark">
                    {block.correctAnswer || '?'}
                  </span>
                )}
              </span>
            ))}
          </p>
        </div>
      );

    case 'flashcards':
      return <FlashcardsPreview block={block} />;

    case 'link':
      return (
        <a
          href={block.linkUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
        >
          <span className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary-dark flex items-center justify-center text-lg flex-shrink-0">
            🌐
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-ink truncate">{block.linkDescription || 'Посилання'}</p>
            <p className="text-[11px] text-ink-faint truncate">{block.linkUrl || 'URL не вказано'}</p>
          </div>
        </a>
      );

    case 'teacher-note':
      return (
        <div className="flex gap-3 p-3 rounded-xl bg-accent/10 border border-accent/30">
          <span className="text-lg flex-shrink-0">📌</span>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-accent-dark uppercase tracking-wide mb-0.5">
              Тільки для викладача
            </p>
            <p className="text-sm text-ink whitespace-pre-wrap">
              {block.body || <em className="text-ink-faint">порожня нотатка</em>}
            </p>
          </div>
        </div>
      );
  }
}

function MultipleChoicePreview({ block }: { block: LessonBlock }) {
  const [picked, setPicked] = useState<number | null>(null);
  const correctIndex = (block.options ?? []).findIndex(o => o.correct);

  return (
    <div>
      <p className="text-sm font-bold text-ink mb-3">{block.title || 'Питання'}</p>
      <div className="flex flex-col gap-1.5">
        {(block.options ?? []).map((o, i) => {
          const isPicked = picked === i;
          const isCorrect = i === correctIndex;
          const showResult = picked !== null;
          const state =
            !showResult
              ? 'default'
              : isCorrect
                ? 'correct'
                : isPicked
                  ? 'wrong'
                  : 'default';

          return (
            <button
              key={i}
              type="button"
              onClick={() => setPicked(isPicked ? null : i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm text-left transition-colors ${
                state === 'correct'
                  ? 'bg-primary/10 border-primary text-primary-dark font-bold'
                  : state === 'wrong'
                    ? 'bg-danger/10 border-danger text-danger-dark'
                    : isPicked
                      ? 'bg-secondary/10 border-secondary text-secondary-dark'
                      : 'border-border hover:border-primary/30'
              }`}
            >
              <span className="w-5 text-center font-black text-xs">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{o.text || <em className="text-ink-faint">—</em>}</span>
              {state === 'correct' && <span>✓</span>}
              {state === 'wrong' && <span>✗</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FlashcardsPreview({ block }: { block: LessonBlock }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const cards = block.cards ?? [];
  const card = cards[idx];

  if (!card) {
    return <p className="text-sm text-ink-faint italic">Немає карток</p>;
  }

  return (
    <div>
      {block.title && <p className="text-sm font-bold text-ink mb-3">{block.title}</p>}
      <button
        type="button"
        onClick={() => setFlipped(f => !f)}
        className="w-full min-h-28 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-border hover:border-primary/30 flex items-center justify-center p-4 transition-colors"
      >
        <p className="text-lg font-black text-ink text-center">
          {flipped ? (card.back || '—') : (card.front || '—')}
        </p>
      </button>
      <div className="flex items-center justify-between mt-2.5">
        <button
          type="button"
          onClick={() => { setIdx(i => Math.max(0, i - 1)); setFlipped(false); }}
          disabled={idx === 0}
          className="px-3 py-1 rounded-lg text-xs font-bold text-ink-muted disabled:opacity-30"
        >
          ← Попередня
        </button>
        <span className="text-xs font-bold text-ink-muted">{idx + 1} / {cards.length}</span>
        <button
          type="button"
          onClick={() => { setIdx(i => Math.min(cards.length - 1, i + 1)); setFlipped(false); }}
          disabled={idx === cards.length - 1}
          className="px-3 py-1 rounded-lg text-xs font-bold text-ink-muted disabled:opacity-30"
        >
          Наступна →
        </button>
      </div>
    </div>
  );
}
