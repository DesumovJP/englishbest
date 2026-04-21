'use client';
import { useState } from 'react';
import { Modal } from '@/components/atoms/Modal';
import {
  MOCK_GROUPS,
  MOCK_STUDENTS,
  type Level,
} from '@/lib/teacher-mocks';

interface MassMessageModalProps {
  open: boolean;
  onClose: () => void;
}

type Audience = 'all-students' | 'all-parents' | 'group' | 'level';

const AUDIENCE_OPTIONS: Array<{ value: Audience; label: string }> = [
  { value: 'all-students', label: 'Усім учням'   },
  { value: 'all-parents',  label: 'Усім батькам' },
  { value: 'group',        label: 'Групі'        },
  { value: 'level',        label: 'За рівнем'    },
];

const LEVELS: Level[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1'];

const LABEL_CLS = 'text-[10px] font-semibold text-ink-faint uppercase tracking-wider';

export function MassMessageModal({ open, onClose }: MassMessageModalProps) {
  const [audience, setAudience] = useState<Audience>('all-students');
  const [groupId, setGroupId] = useState('');
  const [level, setLevel] = useState<Level>('A1');
  const [body, setBody] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  function recipientsCount(): number {
    if (audience === 'all-students') return MOCK_STUDENTS.length;
    if (audience === 'all-parents')  return MOCK_STUDENTS.filter(s => s.parentName).length;
    if (audience === 'group')        return MOCK_GROUPS.find(g => g.id === groupId)?.studentIds.length ?? 0;
    if (audience === 'level')        return MOCK_STUDENTS.filter(s => s.level === level).length;
    return 0;
  }

  function send() {
    setToast(`Повідомлення надіслано: ${recipientsCount()} отримувачів`);
    window.setTimeout(() => {
      setToast(null);
      setBody('');
      onClose();
    }, 1500);
  }

  const canSend = body.trim() !== '' && (audience !== 'group' || groupId !== '');

  return (
    <Modal isOpen={open} onClose={onClose} title="Написати всім">
      {toast ? (
        <div className="py-6 text-center">
          <p className="text-[14px] font-semibold text-ink">{toast}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <p className={`${LABEL_CLS} mb-1.5`}>Аудиторія</p>
            <div className="grid grid-cols-2 gap-1.5">
              {AUDIENCE_OPTIONS.map(opt => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setAudience(opt.value)}
                  className={`px-3 h-9 rounded-md border text-[13px] font-medium transition-colors ${
                    audience === opt.value
                      ? 'border-primary bg-surface-muted text-ink'
                      : 'border-border text-ink-muted hover:text-ink hover:border-primary/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {audience === 'group' && (
            <div>
              <p className={`${LABEL_CLS} mb-1.5`}>Група</p>
              <select
                value={groupId}
                onChange={e => setGroupId(e.target.value)}
                className="ios-input"
              >
                <option value="">Обрати групу…</option>
                {MOCK_GROUPS.map(g => (
                  <option key={g.id} value={g.id}>{g.name} · {g.level} · {g.studentIds.length} учнів</option>
                ))}
              </select>
            </div>
          )}

          {audience === 'level' && (
            <div>
              <p className={`${LABEL_CLS} mb-1.5`}>Рівень</p>
              <div className="grid grid-cols-6 gap-1.5">
                {LEVELS.map(l => (
                  <button
                    type="button"
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`h-9 rounded-md border text-[12px] font-semibold tabular-nums transition-colors ${
                      level === l
                        ? 'border-primary bg-surface-muted text-ink'
                        : 'border-border text-ink-muted hover:text-ink hover:border-primary/40'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className={`${LABEL_CLS} mb-1.5`}>Повідомлення</p>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={5}
              placeholder="Ваше повідомлення…"
              className="w-full px-3 py-2.5 rounded-md border border-border bg-white text-[13px] text-ink focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 resize-y"
            />
          </div>

          <div className="flex items-center justify-between gap-2 px-3 h-9 rounded-md bg-surface-muted border border-border text-[12px]">
            <span className="text-ink-muted">Отримувачів</span>
            <span className="font-semibold text-ink tabular-nums">{recipientsCount()}</span>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="ios-btn ios-btn-secondary">
              Скасувати
            </button>
            <button
              type="button"
              onClick={send}
              disabled={!canSend}
              className="ios-btn ios-btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Надіслати
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
