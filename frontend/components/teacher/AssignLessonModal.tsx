'use client';
import { useState } from 'react';
import { Modal } from '@/components/atoms/Modal';
import {
  MOCK_STUDENTS,
  MOCK_GROUPS,
  type LibraryLesson,
} from '@/lib/teacher-mocks';

interface AssignLessonModalProps {
  open: boolean;
  onClose: () => void;
  lesson: LibraryLesson | null;
}

type AssignTarget = 'student' | 'group';
type AssignFormat = 'class' | 'homework';

const LABEL_CLS = 'text-[10px] font-semibold text-ink-faint uppercase tracking-wider';

export function AssignLessonModal({ open, onClose, lesson }: AssignLessonModalProps) {
  const [target, setTarget] = useState<AssignTarget>('student');
  const [targetId, setTargetId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('16:00');
  const [format, setFormat] = useState<AssignFormat>('class');
  const [deadline, setDeadline] = useState('');
  const [coins, setCoins] = useState(20);
  const [toast, setToast] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const who = target === 'student'
      ? MOCK_STUDENTS.find(s => s.id === targetId)?.name
      : MOCK_GROUPS.find(g => g.id === targetId)?.name;
    setToast(`Призначено: ${lesson?.title} → ${who ?? '—'}`);
    setTimeout(() => {
      setToast(null);
      onClose();
    }, 1200);
  }

  return (
    <Modal isOpen={open} onClose={onClose} title={lesson ? `Призначити: ${lesson.title}` : 'Призначити'}>
      {toast ? (
        <div className="py-6 text-center">
          <p className="text-[14px] font-semibold text-ink">{toast}</p>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className={LABEL_CLS}>Кому</label>
            <div className="flex gap-1.5 mt-1.5">
              {(['student', 'group'] as const).map(t => (
                <button
                  type="button"
                  key={t}
                  onClick={() => { setTarget(t); setTargetId(''); }}
                  className={`flex-1 h-9 rounded-md border text-[13px] font-medium transition-colors ${
                    target === t
                      ? 'border-primary bg-surface-muted text-ink'
                      : 'border-border text-ink-muted hover:text-ink hover:border-primary/40'
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
              className="ios-input mt-2"
            >
              <option value="">Обрати…</option>
              {(target === 'student' ? MOCK_STUDENTS : MOCK_GROUPS).map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} · {item.level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLS}>Формат</label>
            <div className="flex gap-1.5 mt-1.5">
              {([
                ['class', 'Класний'],
                ['homework', 'Домашній'],
              ] as const).map(([v, l]) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setFormat(v)}
                  className={`flex-1 h-9 rounded-md border text-[13px] font-medium transition-colors ${
                    format === v
                      ? 'border-primary bg-surface-muted text-ink'
                      : 'border-border text-ink-muted hover:text-ink hover:border-primary/40'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="date" className={LABEL_CLS}>
                {format === 'class' ? 'Дата уроку' : 'Видати'}
              </label>
              <input
                id="date"
                type="date"
                value={date}
                required
                onChange={e => setDate(e.target.value)}
                className="ios-input mt-1.5"
              />
            </div>
            <div>
              <label htmlFor="time" className={LABEL_CLS}>
                {format === 'class' ? 'Час' : 'Дедлайн'}
              </label>
              <input
                id="time"
                type={format === 'class' ? 'time' : 'date'}
                value={format === 'class' ? time : deadline}
                required
                onChange={e => (format === 'class' ? setTime(e.target.value) : setDeadline(e.target.value))}
                className="ios-input mt-1.5"
              />
            </div>
          </div>

          <div>
            <label htmlFor="coins" className={LABEL_CLS}>
              Монетки за виконання (5–50)
            </label>
            <div className="flex items-center gap-3 mt-1.5">
              <input
                id="coins"
                type="range"
                min={5}
                max={50}
                step={5}
                value={coins}
                onChange={e => setCoins(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="w-14 flex items-center justify-end gap-1 text-[13px] font-semibold text-ink tabular-nums">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/coin.png" alt="" className="w-3.5 h-3.5 flex-shrink-0" />
                {coins}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="ios-btn ios-btn-secondary"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="ios-btn ios-btn-primary"
            >
              Призначити
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
