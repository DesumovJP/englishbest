'use client';
import { useState } from 'react';
import { LevelBadge } from '@/components/teacher/ui';
import type { Level } from '@/lib/types/teacher';

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

const STATUS_DOT: Record<ProgramStatus, string> = {
  published: 'ios-dot ios-dot-positive',
  draft:     'ios-dot ios-dot-warn',
  archived:  'ios-dot ios-dot-info',
};

const STATUS_LABEL: Record<ProgramStatus, string> = {
  published: 'Опублікована',
  draft:     'Чернетка',
  archived:  'Архів',
};

type Tab = 'info' | 'edit';

export function ProgramDetail({ program, onClose, onSave, onToggleStatus, onArchive }: ProgramDetailProps) {
  const [tab, setTab] = useState<Tab>('info');

  function handleField(field: keyof ProgramDetailData, value: string | string[] | number) {
    onSave({ ...program, [field]: value });
  }

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-border flex-shrink-0">
        <div className="flex items-start gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] font-semibold text-ink leading-snug">{program.title}</h2>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <LevelBadge level={program.level as Level} />
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-muted">
                <span className={STATUS_DOT[program.status]} aria-hidden />
                {STATUS_LABEL[program.status]}
              </span>
              {program.tags.map(t => (
                <span key={t} className="ios-chip-outline">{t}</span>
              ))}
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Закрити"
              className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Stats row — 3 hairline-divided cells */}
        <div className="ios-card flex items-stretch divide-x divide-border">
          <Stat label="Учнів"   value={program.studentsCount} />
          <Stat label="Уроків"  value={program.lessonsCount} />
          <Stat label="Відгуків" value={program.reviews} />
        </div>

        <p className="text-[11px] text-ink-faint mt-3">
          З {program.createdAt}
          {program.reviews > 0 && ` · ★ ${program.rating.toFixed(1)} (${program.reviews})`}
        </p>

        {/* Author row */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={program.teacherPhoto}
            alt={program.teacherName}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider leading-none mb-0.5">Автор</p>
            <p className="text-[13px] font-medium text-ink truncate">{program.teacherName}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-5 flex-shrink-0">
        {([
          ['info', 'Опис'],
          ['edit', 'Редагувати'],
        ] as const).map(([key, lbl]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-1 py-3 mr-5 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === key ? 'border-primary text-ink' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'info' && (
          <div className="px-5 py-4">
            <p className="text-[13px] text-ink-muted leading-relaxed">{program.description}</p>
          </div>
        )}

        {tab === 'edit' && (
          <div className="px-5 py-4 flex flex-col gap-4">
            <Field label="Назва програми">
              <input
                className="ios-input w-full"
                value={program.title}
                onChange={e => handleField('title', e.target.value)}
              />
            </Field>

            <Field label="Опис">
              <textarea
                className="ios-input w-full py-2 resize-none h-auto min-h-[76px]"
                rows={3}
                value={program.description}
                onChange={e => handleField('description', e.target.value)}
              />
            </Field>

            <Field label="Автор">
              <input
                className="ios-input w-full"
                value={program.teacherName}
                onChange={e => handleField('teacherName', e.target.value)}
              />
            </Field>

            <Field label="Теги (через кому)">
              <input
                className="ios-input w-full"
                value={program.tags.join(', ')}
                onChange={e => handleField('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
              />
            </Field>

            <Field label="Кількість уроків">
              <input
                type="number"
                className="ios-input w-full"
                value={program.lessonsCount}
                onChange={e => handleField('lessonsCount', parseInt(e.target.value) || program.lessonsCount)}
              />
            </Field>

            <div className="flex flex-col gap-2 pt-2 border-t border-border mt-1">
              {program.status !== 'archived' && (
                <button
                  onClick={() => onToggleStatus(program.id)}
                  className="ios-btn ios-btn-secondary w-full"
                >
                  {program.status === 'published' ? 'Зробити чернеткою' : 'Опублікувати'}
                </button>
              )}
              {program.status !== 'archived' && (
                <button
                  onClick={() => onArchive(program.id)}
                  className="ios-btn ios-btn-danger w-full"
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 py-3 px-2 text-center">
      <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider mb-1">{label}</p>
      <p className="text-[18px] font-semibold text-ink tabular-nums">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
