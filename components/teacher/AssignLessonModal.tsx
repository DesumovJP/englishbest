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
        <div className="py-8 text-center">
          <p className="text-3xl mb-2">✅</p>
          <p className="font-black text-ink">{toast}</p>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-black text-ink-muted uppercase tracking-wide">Кому</label>
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
              className="w-full mt-2 h-10 px-3 rounded-xl border border-border bg-white text-sm text-ink focus:outline-none focus:border-primary"
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
            <label className="text-xs font-black text-ink-muted uppercase tracking-wide">Формат</label>
            <div className="flex gap-2 mt-1.5">
              {([
                ['class', '🏫 Класний'],
                ['homework', '🏠 Домашній'],
              ] as const).map(([v, l]) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setFormat(v)}
                  className={`flex-1 px-3 py-2 rounded-xl border text-sm font-bold transition-colors ${
                    format === v
                      ? 'border-primary bg-primary/10 text-primary-dark'
                      : 'border-border text-ink-muted hover:border-primary/40'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="date" className="text-xs font-black text-ink-muted uppercase tracking-wide">
                {format === 'class' ? 'Дата уроку' : 'Видати'}
              </label>
              <input
                id="date"
                type="date"
                value={date}
                required
                onChange={e => setDate(e.target.value)}
                className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-white text-sm text-ink focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="time" className="text-xs font-black text-ink-muted uppercase tracking-wide">
                {format === 'class' ? 'Час' : 'Дедлайн'}
              </label>
              <input
                id="time"
                type={format === 'class' ? 'time' : 'date'}
                value={format === 'class' ? time : deadline}
                required
                onChange={e => (format === 'class' ? setTime(e.target.value) : setDeadline(e.target.value))}
                className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-white text-sm text-ink focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label htmlFor="coins" className="text-xs font-black text-ink-muted uppercase tracking-wide">
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
              <span className="w-14 text-right font-black text-ink">🪙 {coins}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-bold text-ink-muted hover:text-ink"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-black hover:opacity-90 transition-opacity"
            >
              Призначити
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
