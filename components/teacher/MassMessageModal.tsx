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

const AUDIENCE_OPTIONS: Array<{ value: Audience; label: string; icon: string }> = [
  { value: 'all-students', label: 'Усім учням',   icon: '👥' },
  { value: 'all-parents',  label: 'Усім батькам', icon: '👨‍👩‍👧' },
  { value: 'group',        label: 'Групі',        icon: '🧩' },
  { value: 'level',        label: 'За рівнем',    icon: '🎯' },
];

const LEVELS: Level[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1'];

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
    setToast(`📨 Повідомлення надіслано: ${recipientsCount()} отримувачів`);
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
        <div className="py-8 text-center">
          <p className="text-3xl mb-2">📨</p>
          <p className="font-black text-ink">{toast}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-black text-ink-muted uppercase tracking-wide mb-1.5">Аудиторія</p>
            <div className="grid grid-cols-2 gap-1.5">
              {AUDIENCE_OPTIONS.map(opt => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setAudience(opt.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-bold transition-colors ${
                    audience === opt.value
                      ? 'border-primary bg-primary/10 text-primary-dark'
                      : 'border-border text-ink-muted hover:border-primary/40'
                  }`}
                >
                  <span aria-hidden>{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {audience === 'group' && (
            <div>
              <p className="text-xs font-black text-ink-muted uppercase tracking-wide mb-1.5">Група</p>
              <select
                value={groupId}
                onChange={e => setGroupId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-white text-sm text-ink focus:outline-none focus:border-primary"
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
              <p className="text-xs font-black text-ink-muted uppercase tracking-wide mb-1.5">Рівень</p>
              <div className="grid grid-cols-6 gap-1.5">
                {LEVELS.map(l => (
                  <button
                    type="button"
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`h-10 rounded-xl border text-xs font-black transition-colors ${
                      level === l
                        ? 'border-primary bg-primary/10 text-primary-dark'
                        : 'border-border text-ink-muted hover:border-primary/40'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-black text-ink-muted uppercase tracking-wide mb-1.5">Повідомлення</p>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={5}
              placeholder="Ваше повідомлення…"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-ink focus:outline-none focus:border-primary resize-y"
            />
          </div>

          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-secondary/5 border border-secondary/20 text-xs">
            <span className="text-ink-muted">Отримувачів</span>
            <span className="font-black text-secondary-dark">{recipientsCount()}</span>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-bold text-ink-muted hover:text-ink">
              Скасувати
            </button>
            <button
              type="button"
              onClick={send}
              disabled={!canSend}
              className="px-4 py-2 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white text-sm font-black disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              Надіслати
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
