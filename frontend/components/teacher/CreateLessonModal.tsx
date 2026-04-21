'use client';
import { useEffect, useState } from 'react';
import { Modal } from '@/components/atoms/Modal';
import {
  MOCK_GROUPS,
  MOCK_LIBRARY,
  MOCK_STUDENTS,
  type Level,
  type LessonMode,
} from '@/lib/teacher-mocks';

interface CreateLessonModalProps {
  open: boolean;
  onClose: () => void;
  defaultDate?: string;
  defaultTime?: string;
}

type Target = 'student' | 'group';
type Recurrence = 'none' | 'weekly' | 'custom';

const MODES: Array<{ value: LessonMode; label: string }> = [
  { value: 'individual',    label: '1-на-1' },
  { value: 'pair',          label: 'Пара' },
  { value: 'group',         label: 'Група' },
  { value: 'speaking-club', label: 'Speaking Club' },
];

const LEVELS: Level[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1'];

const fieldLabel = 'text-xs font-black text-ink-muted uppercase tracking-wide';
const fieldInput =
  'w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-white text-sm text-ink focus:outline-none focus:border-primary';

export function CreateLessonModal({ open, onClose, defaultDate, defaultTime }: CreateLessonModalProps) {
  const [target, setTarget] = useState<Target>('student');
  const [targetId, setTargetId] = useState('');
  const [date, setDate] = useState(defaultDate ?? '');
  const [time, setTime] = useState(defaultTime ?? '16:00');
  const [duration, setDuration] = useState(45);
  const [level, setLevel] = useState<Level>('A1');
  const [mode, setMode] = useState<LessonMode>('individual');
  const [lessonRef, setLessonRef] = useState('');
  const [notes, setNotes] = useState('');
  const [recurrence, setRecurrence] = useState<Recurrence>('none');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDate(defaultDate ?? '');
    if (defaultTime) setTime(defaultTime);
  }, [open, defaultDate, defaultTime]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const who =
      target === 'student'
        ? MOCK_STUDENTS.find(s => s.id === targetId)?.name
        : MOCK_GROUPS.find(g => g.id === targetId)?.name;
    setToast(`📅 Створено: ${who ?? '—'} · ${date} ${time}`);
    window.setTimeout(() => {
      setToast(null);
      onClose();
    }, 1300);
  }

  return (
    <Modal isOpen={open} onClose={onClose} title="Новий урок">
      {toast ? (
        <div className="py-8 text-center">
          <p className="text-3xl mb-2">✅</p>
          <p className="font-black text-ink">{toast}</p>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className={fieldLabel}>Кому</label>
            <div className="flex gap-2 mt-1.5">
              {(['student', 'group'] as const).map(t => (
                <button
                  type="button"
                  key={t}
                  onClick={() => { setTarget(t); setTargetId(''); }}
                  className={`flex-1 px-3 py-2 rounded-xl border text-sm font-bold transition-colors ${
                    target === t
                      ? 'border-primary bg-primary/10 text-primary-dark'
                      : 'border-border text-ink-muted hover:border-primary/40'
                  }`}
                >
                  {t === 'student' ? 'Учень' : 'Група'}
                </button>
              ))}
            </div>
            <select
              value={targetId}
              onChange={e => setTargetId(e.target.value)}
              required
              className={fieldInput}
            >
              <option value="">Обрати…</option>
              {(target === 'student' ? MOCK_STUDENTS : MOCK_GROUPS).map(item => (
                <option key={item.id} value={item.id}>{item.name} · {item.level}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="cl-date" className={fieldLabel}>Дата</label>
              <input id="cl-date" type="date" value={date} required onChange={e => setDate(e.target.value)} className={fieldInput} />
            </div>
            <div>
              <label htmlFor="cl-time" className={fieldLabel}>Час</label>
              <input id="cl-time" type="time" value={time} required onChange={e => setTime(e.target.value)} className={fieldInput} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="cl-dur" className={fieldLabel}>Тривалість (хв)</label>
              <input id="cl-dur" type="number" min={15} max={120} step={5} value={duration} onChange={e => setDuration(Number(e.target.value))} className={fieldInput} />
            </div>
            <div>
              <label htmlFor="cl-level" className={fieldLabel}>Рівень</label>
              <select id="cl-level" value={level} onChange={e => setLevel(e.target.value as Level)} className={fieldInput}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={fieldLabel}>Формат</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
              {MODES.map(m => (
                <button
                  type="button"
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={`px-2 py-2 rounded-xl border text-xs font-bold transition-colors ${
                    mode === m.value
                      ? 'border-primary bg-primary/10 text-primary-dark'
                      : 'border-border text-ink-muted hover:border-primary/40'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="cl-ref" className={fieldLabel}>Урок з бібліотеки (опціонально)</label>
            <select id="cl-ref" value={lessonRef} onChange={e => setLessonRef(e.target.value)} className={fieldInput}>
              <option value="">Без шаблону</option>
              {MOCK_LIBRARY.map(l => (
                <option key={l.id} value={l.id}>{l.title} · {l.level}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cl-rec" className={fieldLabel}>Повторення</label>
            <select id="cl-rec" value={recurrence} onChange={e => setRecurrence(e.target.value as Recurrence)} className={fieldInput}>
              <option value="none">Один раз</option>
              <option value="weekly">Щотижня</option>
              <option value="custom">Користувацьке</option>
            </select>
          </div>

          <div>
            <label htmlFor="cl-notes" className={fieldLabel}>Нотатки (внутрішні)</label>
            <textarea
              id="cl-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Матеріали, нагадування…"
              className={`${fieldInput} h-auto min-h-20 py-2 resize-y`}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-bold text-ink-muted hover:text-ink">
              Скасувати
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white text-sm font-black hover:opacity-90 transition-opacity">
              Створити
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
