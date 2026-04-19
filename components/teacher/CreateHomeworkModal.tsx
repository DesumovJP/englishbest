'use client';
import { useState } from 'react';
import { Modal } from '@/components/atoms/Modal';
import {
  HOMEWORK_KIND_ICONS,
  HOMEWORK_KIND_LABELS,
  MOCK_GROUPS,
  MOCK_STUDENTS,
  type HomeworkKind,
} from '@/lib/teacher-mocks';

interface CreateHomeworkModalProps {
  open: boolean;
  onClose: () => void;
}

type Target = 'student' | 'group';

const KINDS: HomeworkKind[] = ['library-lesson', 'written', 'file', 'audio', 'video', 'link', 'test'];

const fieldLabel = 'text-xs font-black text-ink-muted uppercase tracking-wide';
const fieldInput =
  'w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-white text-sm text-ink focus:outline-none focus:border-primary';

export function CreateHomeworkModal({ open, onClose }: CreateHomeworkModalProps) {
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<HomeworkKind>('written');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState<Target>('student');
  const [targetId, setTargetId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [coins, setCoins] = useState(20);
  const [bonus, setBonus] = useState(0);
  const [saveTemplate, setSaveTemplate] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const who =
      target === 'student'
        ? MOCK_STUDENTS.find(s => s.id === targetId)?.name
        : MOCK_GROUPS.find(g => g.id === targetId)?.name;
    setToast(`✅ ДЗ "${title}" призначено: ${who ?? '—'}${saveTemplate ? ' (+ збережено як шаблон)' : ''}`);
    window.setTimeout(() => {
      setToast(null);
      onClose();
    }, 1500);
  }

  return (
    <Modal isOpen={open} onClose={onClose} title="Нове домашнє завдання">
      {toast ? (
        <div className="py-8 text-center">
          <p className="text-3xl mb-2">✅</p>
          <p className="font-black text-ink">{toast}</p>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className={fieldLabel} htmlFor="hw-title">Назва</label>
            <input
              id="hw-title"
              type="text"
              value={title}
              required
              onChange={e => setTitle(e.target.value)}
              placeholder="Напр. Present Simple — 10 речень"
              className={fieldInput}
            />
          </div>

          <div>
            <label className={fieldLabel}>Тип</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 mt-1.5">
              {KINDS.map(k => (
                <button
                  type="button"
                  key={k}
                  onClick={() => setKind(k)}
                  className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl border text-[11px] font-bold transition-colors ${
                    kind === k
                      ? 'border-primary bg-primary/10 text-primary-dark'
                      : 'border-border text-ink-muted hover:border-primary/40'
                  }`}
                >
                  <span className="text-base">{HOMEWORK_KIND_ICONS[k]}</span>
                  <span className="text-center leading-tight">{HOMEWORK_KIND_LABELS[k]}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={fieldLabel} htmlFor="hw-desc">Опис</label>
            <textarea
              id="hw-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Що саме зробити, критерії, приклади…"
              className={`${fieldInput} h-auto min-h-20 py-2 resize-y`}
            />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-muted border border-dashed border-border text-xs text-ink-muted">
            <span className="text-lg">📎</span>
            <span>Прикріплення (PDF, аудіо) — додамо з бекендом</span>
          </div>

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

          <div>
            <label className={fieldLabel} htmlFor="hw-dl">Дедлайн</label>
            <input id="hw-dl" type="date" value={deadline} required onChange={e => setDeadline(e.target.value)} className={fieldInput} />
          </div>

          <div>
            <label className={fieldLabel}>Монетки за виконання (5–50)</label>
            <div className="flex items-center gap-3 mt-1.5">
              <input
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

          <div>
            <label className={fieldLabel}>Бонус (0–10)</label>
            <div className="flex items-center gap-3 mt-1.5">
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={bonus}
                onChange={e => setBonus(Number(e.target.value))}
                className="flex-1 accent-accent"
              />
              <span className="w-14 text-right font-black text-accent-dark">+{bonus}</span>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-ink">
            <input
              type="checkbox"
              checked={saveTemplate}
              onChange={e => setSaveTemplate(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            Зберегти як шаблон
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-bold text-ink-muted hover:text-ink">
              Скасувати
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white text-sm font-black hover:opacity-90 transition-opacity">
              Призначити ДЗ
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
