'use client';
import { useState } from 'react';
import { Modal } from '@/components/atoms/Modal';
import {
  LESSON_STATUS_STYLES,
  getGroup,
  getStudent,
  type ScheduledLesson,
} from '@/lib/teacher-mocks';

interface LessonActionSheetProps {
  lesson: ScheduledLesson | null;
  onClose: () => void;
}

type PendingAction =
  | { kind: 'cancel' }
  | { kind: 'reschedule' }
  | { kind: 'note' }
  | null;

const fieldLabel = 'text-xs font-black text-ink-muted uppercase tracking-wide';
const fieldInput =
  'w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-white text-sm text-ink focus:outline-none focus:border-primary';

export function LessonActionSheet({ lesson, onClose }: LessonActionSheetProps) {
  const [pending, setPending] = useState<PendingAction>(null);
  const [reason, setReason] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [note, setNote] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  if (!lesson) return null;

  const student = lesson.studentId ? getStudent(lesson.studentId) : undefined;
  const group = lesson.groupId ? getGroup(lesson.groupId) : undefined;
  const subjectName = student?.name ?? group?.name ?? '—';
  const status = LESSON_STATUS_STYLES[lesson.status];

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => {
      setToast(null);
      setPending(null);
      onClose();
    }, 1200);
  }

  function commitCancel() {
    if (!reason.trim()) return;
    flash(`❌ Скасовано: ${reason}`);
  }
  function commitReschedule() {
    if (!newDate || !newTime) return;
    flash(`📆 Перенесено на ${newDate} ${newTime}`);
  }
  function commitNote() {
    if (!note.trim()) return;
    flash('📝 Нотатку збережено');
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={`${lesson.time} · ${subjectName}`}>
      {toast ? (
        <div className="py-6 text-center">
          <p className="text-3xl mb-2">✅</p>
          <p className="font-black text-ink">{toast}</p>
        </div>
      ) : pending?.kind === 'cancel' ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink">Вкажи причину скасування:</p>
          <textarea
            autoFocus
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Наприклад: учень захворів"
            className={`${fieldInput} h-auto min-h-24 py-2 resize-y`}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setPending(null)} className="px-4 py-2 rounded-xl text-sm font-bold text-ink-muted hover:text-ink">
              Назад
            </button>
            <button
              onClick={commitCancel}
              disabled={!reason.trim()}
              className="px-4 py-2 rounded-xl bg-danger text-white text-sm font-black hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              Скасувати урок
            </button>
          </div>
        </div>
      ) : pending?.kind === 'reschedule' ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={fieldLabel}>Нова дата</label>
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className={fieldInput} />
            </div>
            <div>
              <label className={fieldLabel}>Новий час</label>
              <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className={fieldInput} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setPending(null)} className="px-4 py-2 rounded-xl text-sm font-bold text-ink-muted hover:text-ink">
              Назад
            </button>
            <button
              onClick={commitReschedule}
              disabled={!newDate || !newTime}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-black hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              Перенести
            </button>
          </div>
        </div>
      ) : pending?.kind === 'note' ? (
        <div className="flex flex-col gap-3">
          <textarea
            autoFocus
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Що важливо пам'ятати про цей урок…"
            className={`${fieldInput} h-auto min-h-28 py-2 resize-y`}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setPending(null)} className="px-4 py-2 rounded-xl text-sm font-bold text-ink-muted hover:text-ink">
              Назад
            </button>
            <button
              onClick={commitNote}
              disabled={!note.trim()}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-black hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              Зберегти
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${status.cls}`}>{status.label}</span>
            <span className="text-xs text-ink-muted">
              {lesson.date} · {lesson.duration} хв · {lesson.level} · {lesson.topic}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <ActionBtn
              icon="▶"
              label="Почати"
              hint="Відкрити кімнату"
              disabled={lesson.status === 'done' || lesson.status === 'cancelled'}
              onClick={() => flash('📹 Перехід у кімнату…')}
            />
            <ActionBtn
              icon="✓"
              label="Провести"
              hint="Позначити як проведений"
              disabled={lesson.status === 'done'}
              onClick={() => flash('✅ Позначено як проведено')}
            />
            {group && (
              <ActionBtn
                icon="📋"
                label="Відвідуваність"
                hint="Журнал групи"
                onClick={() => flash('Відкриваю журнал…')}
              />
            )}
            <ActionBtn
              icon="✍️"
              label="Призначити ДЗ"
              onClick={() => flash('Створюю ДЗ…')}
            />
            <ActionBtn
              icon="📝"
              label="Нотатка"
              onClick={() => setPending({ kind: 'note' })}
            />
            <ActionBtn
              icon="📆"
              label="Перенести"
              disabled={lesson.status === 'done'}
              onClick={() => setPending({ kind: 'reschedule' })}
            />
            <ActionBtn
              icon="❌"
              label="Скасувати"
              tone="danger"
              disabled={lesson.status === 'done' || lesson.status === 'cancelled'}
              onClick={() => setPending({ kind: 'cancel' })}
            />
          </div>

          {lesson.cancelReason && (
            <p className="text-xs text-danger-dark bg-danger/10 rounded-lg px-3 py-2">
              Причина скасування: {lesson.cancelReason}
            </p>
          )}
          {lesson.notes && (
            <p className="text-xs text-ink bg-surface-muted rounded-lg px-3 py-2">
              <span className="font-bold">Нотатка:</span> {lesson.notes}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}

function ActionBtn({
  icon,
  label,
  hint,
  onClick,
  disabled,
  tone = 'default',
}: {
  icon: string;
  label: string;
  hint?: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`text-left px-3 py-2.5 rounded-xl border transition-colors ${
        disabled
          ? 'border-border/50 text-ink-faint cursor-not-allowed'
          : tone === 'danger'
            ? 'border-border text-danger-dark hover:bg-danger/10 hover:border-danger/30'
            : 'border-border text-ink hover:border-primary/40 hover:bg-primary/5'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="text-sm font-black">{label}</span>
      </div>
      {hint && <p className="text-[11px] text-ink-muted mt-0.5">{hint}</p>}
    </button>
  );
}
