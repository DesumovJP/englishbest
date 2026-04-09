'use client';
import { useState } from 'react';

/* ─── Типи ───────────────────────────────────── */
export type ProgramStatus = 'published' | 'draft' | 'archived';

export interface ProgramDetailData {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: string;
  levelColor: string;
  teacherName: string;
  teacherPhoto: string;
  tags: string[];
  studentsCount: number;
  lessonsCount: number;
  rating: number;
  reviews: number;
  status: ProgramStatus;
  createdAt: string;
}

interface ProgramDetailProps {
  program: ProgramDetailData;
  onClose?: () => void;
  onSave: (updated: ProgramDetailData) => void;
  onToggleStatus: (id: string) => void;
  onArchive: (id: string) => void;
}

const STATUS_CFG: Record<ProgramStatus, { label: string; cls: string }> = {
  published: { label: 'Опублікована', cls: 'bg-primary/10 text-primary-dark' },
  draft:     { label: 'Чернетка',     cls: 'bg-accent/15 text-accent-dark' },
  archived:  { label: 'Архів',        cls: 'bg-surface-muted text-ink-muted' },
};

type Tab = 'info' | 'edit';

export function ProgramDetail({ program, onClose, onSave, onToggleStatus, onArchive }: ProgramDetailProps) {
  const [tab, setTab] = useState<Tab>('info');
  const { label, cls } = STATUS_CFG[program.status];

  function handleField(field: keyof ProgramDetailData, value: string | string[] | number) {
    onSave({ ...program, [field]: value });
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Профіль ──────────────────────────────── */}
      <div className="px-6 pt-5 pb-4 border-b border-border flex-shrink-0">

        {/* Назва + закрити */}
        <div className="flex items-start gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <p className="font-black text-ink text-lg leading-tight">{program.title}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${program.levelColor}`}>{program.level}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${cls}`}>{label}</span>
              {program.tags.map(t => (
                <span key={t} className="text-xs text-ink-muted px-2 py-0.5 rounded-md bg-surface-muted">{t}</span>
              ))}
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} aria-label="Закрити" className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* 3 метрики */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-muted mb-3">
          <div className="flex-1 text-center">
            <p className="text-[10px] font-black text-ink-muted uppercase tracking-wide mb-0.5">Учнів</p>
            <p className="text-xl font-black text-ink">{program.studentsCount}</p>
          </div>
          <div className="w-px h-10 bg-border flex-shrink-0" />
          <div className="flex-1 text-center">
            <p className="text-[10px] font-black text-ink-muted uppercase tracking-wide mb-0.5">Уроків</p>
            <p className="text-xl font-black text-ink">{program.lessonsCount}</p>
          </div>
          <div className="w-px h-10 bg-border flex-shrink-0" />
          <div className="flex-1 text-center">
            <p className="text-[10px] font-black text-ink-muted uppercase tracking-wide mb-0.5">Відгуків</p>
            <p className="text-xl font-black text-ink">{program.reviews}</p>
          </div>
        </div>

        {/* Вторинна інфо */}
        <p className="text-[11px] text-ink-muted text-center">
          З {program.createdAt}
          {program.reviews > 0 && ` · ★ ${program.rating.toFixed(1)} (${program.reviews} відгуків)`}
        </p>

        {/* Автор */}
        <div className="flex items-center gap-2.5 mt-3 px-3 py-2.5 rounded-xl bg-surface-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={program.teacherPhoto} alt={program.teacherName} className="w-7 h-7 rounded-full object-cover flex-shrink-0" referrerPolicy="no-referrer" />
          <div className="min-w-0">
            <p className="text-[10px] font-black text-ink-muted uppercase tracking-wide leading-none mb-0.5">Автор</p>
            <p className="text-sm font-semibold text-ink truncate">{program.teacherName}</p>
          </div>
        </div>
      </div>

      {/* ── Таби ─────────────────────────────────── */}
      <div className="flex border-b border-border px-6 flex-shrink-0">
        {([
          ['info', 'Опис'],
          ['edit', 'Редагувати'],
        ] as const).map(([key, lbl]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-1 py-3.5 mr-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              tab === key ? 'border-primary text-primary-dark' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>

      {/* ── Вміст ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* Опис */}
        {tab === 'info' && (
          <div className="px-6 py-4">
            <p className="text-sm text-ink-muted leading-relaxed">{program.description}</p>
          </div>
        )}

        {/* Редагування */}
        {tab === 'edit' && (
          <div className="px-6 py-4 flex flex-col gap-4">

            <div>
              <label className="text-xs font-black text-ink-muted uppercase tracking-wide mb-1 block">Назва програми</label>
              <input
                className="w-full h-10 px-3 rounded-xl border border-border text-sm text-ink focus:outline-none focus:border-primary transition-colors"
                value={program.title}
                onChange={e => handleField('title', e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-black text-ink-muted uppercase tracking-wide mb-1 block">Опис</label>
              <textarea
                className="w-full px-3 py-2 rounded-xl border border-border text-sm text-ink focus:outline-none focus:border-primary transition-colors resize-none"
                rows={3}
                value={program.description}
                onChange={e => handleField('description', e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-black text-ink-muted uppercase tracking-wide mb-1 block">Автор</label>
              <input
                className="w-full h-10 px-3 rounded-xl border border-border text-sm text-ink focus:outline-none focus:border-primary transition-colors"
                value={program.teacherName}
                onChange={e => handleField('teacherName', e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-black text-ink-muted uppercase tracking-wide mb-1 block">Теги (через кому)</label>
              <input
                className="w-full h-10 px-3 rounded-xl border border-border text-sm text-ink focus:outline-none focus:border-primary transition-colors"
                value={program.tags.join(', ')}
                onChange={e => handleField('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
              />
            </div>

            <div>
              <label className="text-xs font-black text-ink-muted uppercase tracking-wide mb-1 block">Кількість уроків</label>
              <input
                type="number"
                className="w-full h-10 px-3 rounded-xl border border-border text-sm text-ink focus:outline-none focus:border-primary transition-colors"
                value={program.lessonsCount}
                onChange={e => handleField('lessonsCount', parseInt(e.target.value) || program.lessonsCount)}
              />
            </div>

            {/* Дії */}
            <div className="flex flex-col gap-2 pt-2">
              {program.status !== 'archived' && (
                <button
                  onClick={() => onToggleStatus(program.id)}
                  className="w-full py-2.5 rounded-xl border-2 border-border text-sm font-bold text-ink hover:bg-surface-muted transition-colors"
                >
                  {program.status === 'published' ? '⏸ Зробити чернеткою' : '▶ Опублікувати'}
                </button>
              )}
              {program.status !== 'archived' && (
                <button
                  onClick={() => onArchive(program.id)}
                  className="w-full py-2.5 rounded-xl border-2 border-danger/30 text-sm font-bold text-danger hover:bg-danger/5 transition-colors"
                >
                  Архівувати
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
