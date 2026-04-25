/**
 * CreateLessonModal — live-wired session creation.
 *
 * Loads teacher's own students + groups on open, submits via `createSession()`
 * with `status: 'scheduled'`. Group selection expands to the group's member
 * profile IDs. Backend forces `teacher` to the caller's teacher-profile.
 */
'use client';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  createSession,
  combineStartAt,
  type Session,
  type SessionType,
} from '@/lib/sessions';
import { fetchMyStudentsCached, type TeacherStudent } from '@/lib/teacher-students';
import { fetchGroupsCached, type Group as TeacherGroup } from '@/lib/groups';

interface CreateLessonModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (session: Session) => void;
  defaultDate?: string;
  defaultTime?: string;
  defaultTarget?: { type: 'student' | 'group'; id: string };
}

type Target = 'student' | 'group';

const TYPE_OPTIONS: Array<{ value: SessionType; label: string }> = [
  { value: 'one-to-one',   label: '1-на-1' },
  { value: 'group',        label: 'Група' },
  { value: 'trial',        label: 'Пробне' },
  { value: 'consultation', label: 'Консультація' },
];

const fieldLabel = 'text-xs font-black text-ink-muted uppercase tracking-wide';
const fieldInput =
  'w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-white text-sm text-ink focus:outline-none focus:border-primary';

function defaultTypeForTarget(target: Target): SessionType {
  return target === 'group' ? 'group' : 'one-to-one';
}

export function CreateLessonModal({
  open,
  onClose,
  onCreated,
  defaultDate,
  defaultTime,
  defaultTarget,
}: CreateLessonModalProps) {
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [groups, setGroups] = useState<TeacherGroup[]>([]);
  const [loadStatus, setLoadStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  const [title, setTitle] = useState('');
  const [target, setTarget] = useState<Target>(defaultTarget?.type ?? 'student');
  const [targetId, setTargetId] = useState(defaultTarget?.id ?? '');
  const [date, setDate] = useState(defaultDate ?? '');
  const [time, setTime] = useState(defaultTime ?? '16:00');
  const [duration, setDuration] = useState(45);
  const [type, setType] = useState<SessionType>(defaultTypeForTarget(defaultTarget?.type ?? 'student'));
  const [joinUrl, setJoinUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoadStatus('loading');
    setError(null);
    setDate(defaultDate ?? '');
    if (defaultTime) setTime(defaultTime);
    if (defaultTarget) {
      setTarget(defaultTarget.type);
      setTargetId(defaultTarget.id);
      setType(defaultTypeForTarget(defaultTarget.type));
    }
    Promise.all([fetchMyStudentsCached(), fetchGroupsCached()])
      .then(([st, gr]) => {
        if (!alive) return;
        setStudents(st);
        setGroups(gr);
        setLoadStatus('ready');
      })
      .catch(e => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'failed');
        setLoadStatus('error');
      });
    return () => {
      alive = false;
    };
  }, [open, defaultDate, defaultTime, defaultTarget]);

  const targetOptions = useMemo(() => {
    if (target === 'student') {
      return students.map(s => ({
        id: s.documentId,
        label: `${s.displayName}${s.level ? ` · ${s.level}` : ''}`,
      }));
    }
    return groups.map(g => ({
      id: g.documentId,
      label: `${g.name} · ${g.level}`,
    }));
  }, [target, students, groups]);

  function resetForm() {
    setTitle('');
    setTarget(defaultTarget?.type ?? 'student');
    setTargetId(defaultTarget?.id ?? '');
    setDate(defaultDate ?? '');
    setTime(defaultTime ?? '16:00');
    setDuration(45);
    setType(defaultTypeForTarget(defaultTarget?.type ?? 'student'));
    setJoinUrl('');
    setNotes('');
    setSubmitting(false);
    setError(null);
    setToast(null);
  }

  function handleClose() {
    if (submitting) return;
    resetForm();
    onClose();
  }

  function computeAttendees(): string[] {
    if (!targetId) return [];
    if (target === 'student') return [targetId];
    const g = groups.find(x => x.documentId === targetId);
    return g ? g.members.map(m => m.documentId) : [];
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const attendeeIds = computeAttendees();
    if (attendeeIds.length === 0) {
      setError('Оберіть отримувача');
      return;
    }
    const startAt = combineStartAt(date, time);
    if (!startAt) {
      setError('Невірна дата або час');
      return;
    }
    setSubmitting(true);
    try {
      const session = await createSession({
        title: title.trim() || deriveDefaultTitle(),
        startAt,
        durationMin: duration,
        type,
        status: 'scheduled',
        attendeeIds,
        joinUrl: joinUrl.trim() || null,
        notes: notes.trim() || null,
      });
      onCreated?.(session);
      setToast(`Створено: ${session.title} · ${date} ${time}`);
      window.setTimeout(() => {
        resetForm();
        onClose();
      }, 1300);
    } catch (e: any) {
      setError(e?.message ?? 'Не вдалось створити урок');
      setSubmitting(false);
    }
  }

  function deriveDefaultTitle(): string {
    const who =
      target === 'student'
        ? students.find(s => s.documentId === targetId)?.displayName
        : groups.find(g => g.documentId === targetId)?.name;
    return who ? `Урок · ${who}` : 'Урок';
  }

  return (
    <Modal isOpen={open} onClose={handleClose} title="Новий урок">
      {toast ? (
        <div className="py-10 text-center">
          <p className="text-3xl mb-3">✅</p>
          <p className="font-black text-ink">{toast}</p>
        </div>
      ) : loadStatus === 'loading' ? (
        <div className="py-10 text-center text-ink-muted text-sm">Завантаження учнів і груп…</div>
      ) : loadStatus === 'error' ? (
        <div className="py-10 text-center">
          <p className="text-sm text-danger-dark mb-3">{error ?? 'Помилка завантаження'}</p>
          <Button variant="secondary" size="sm" onClick={handleClose}>Закрити</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className={fieldLabel} htmlFor="cl-title">Назва</label>
            <input
              id="cl-title"
              type="text"
              value={title}
              disabled={submitting}
              onChange={e => setTitle(e.target.value)}
              placeholder="Напр. Present Simple · вступ"
              className={fieldInput}
            />
          </div>

          <div>
            <label className={fieldLabel}>Кому</label>
            <div className="flex gap-2 mt-1.5">
              {(['student', 'group'] as const).map(t => (
                <button
                  type="button"
                  key={t}
                  disabled={submitting}
                  onClick={() => {
                    setTarget(t);
                    setTargetId('');
                    setType(defaultTypeForTarget(t));
                  }}
                  className={`flex-1 px-3 py-2 rounded-xl border text-sm font-bold transition-colors ${
                    target === t
                      ? 'border-primary bg-primary/10 text-primary-dark'
                      : 'border-border text-ink-muted hover:border-primary/40'
                  } disabled:opacity-50`}
                >
                  {t === 'student' ? `Учень (${students.length})` : `Група (${groups.length})`}
                </button>
              ))}
            </div>
            <select
              value={targetId}
              onChange={e => setTargetId(e.target.value)}
              required
              disabled={submitting || targetOptions.length === 0}
              className={fieldInput}
            >
              <option value="">
                {targetOptions.length === 0
                  ? target === 'student' ? 'Немає учнів' : 'Немає груп'
                  : 'Обрати…'}
              </option>
              {targetOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            {target === 'group' && targetId && (
              <p className="mt-1.5 text-[11px] text-ink-muted">
                {groups.find(g => g.documentId === targetId)?.members.length ?? 0} учасник(ів)
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="cl-date" className={fieldLabel}>Дата</label>
              <input
                id="cl-date"
                type="date"
                value={date}
                required
                disabled={submitting}
                onChange={e => setDate(e.target.value)}
                className={fieldInput}
              />
            </div>
            <div>
              <label htmlFor="cl-time" className={fieldLabel}>Час</label>
              <input
                id="cl-time"
                type="time"
                value={time}
                required
                disabled={submitting}
                onChange={e => setTime(e.target.value)}
                className={fieldInput}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="cl-dur" className={fieldLabel}>Тривалість (хв)</label>
              <input
                id="cl-dur"
                type="number"
                min={15}
                max={180}
                step={5}
                value={duration}
                disabled={submitting}
                onChange={e => setDuration(Number(e.target.value) || 45)}
                className={fieldInput}
              />
            </div>
            <div>
              <label htmlFor="cl-type" className={fieldLabel}>Тип</label>
              <select
                id="cl-type"
                value={type}
                disabled={submitting}
                onChange={e => setType(e.target.value as SessionType)}
                className={fieldInput}
              >
                {TYPE_OPTIONS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="cl-join" className={fieldLabel}>Посилання на кімнату (опц.)</label>
            <input
              id="cl-join"
              type="url"
              value={joinUrl}
              disabled={submitting}
              onChange={e => setJoinUrl(e.target.value)}
              placeholder="https://meet…"
              className={fieldInput}
            />
          </div>

          <div>
            <label htmlFor="cl-notes" className={fieldLabel}>Нотатки (внутрішні)</label>
            <textarea
              id="cl-notes"
              value={notes}
              disabled={submitting}
              onChange={e => setNotes(e.target.value)}
              placeholder="Матеріали, нагадування…"
              className={`${fieldInput} h-auto min-h-20 py-2 resize-y`}
            />
          </div>

          {error && <p className="text-xs text-danger-dark">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleClose} disabled={submitting}>
              Скасувати
            </Button>
            <Button type="submit" size="sm" loading={submitting}>
              Створити
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
