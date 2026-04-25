/**
 * CreateHomeworkModal — live-wired homework creation.
 *
 * Loads teacher's own students (`/api/teacher/me/students`) + groups
 * (`/api/groups`) once on open. Submits via `createHomework()` with
 * `status: 'published'` — the backend lifecycle auto-creates
 * `homework-submission` rows per assignee. Group selection expands to the
 * group's member user-profile IDs on submit.
 */
'use client';
import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { createHomework, type Homework } from '@/lib/homework';
import { fetchMyStudentsCached, type TeacherStudent } from '@/lib/teacher-students';
import { fetchGroupsCached, type Group as TeacherGroup } from '@/lib/groups';
import { Button } from '@/components/ui/Button';

interface CreateHomeworkModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (homework: Homework) => void;
  defaultTarget?: { type: 'student' | 'group'; id: string };
  defaultLessonId?: string;
  defaultTitle?: string;
}

type Target = 'student' | 'group';

const fieldLabel = 'text-xs font-black text-ink-muted uppercase tracking-wide';
const fieldInput =
  'w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-white text-sm text-ink focus:outline-none focus:border-primary';

export function CreateHomeworkModal({
  open,
  onClose,
  onCreated,
  defaultTarget,
  defaultLessonId,
  defaultTitle,
}: CreateHomeworkModalProps) {
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [groups, setGroups] = useState<TeacherGroup[]>([]);
  const [loadStatus, setLoadStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget]           = useState<Target>('student');
  const [targetId, setTargetId]       = useState('');
  const [deadline, setDeadline]       = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [toast, setToast]             = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoadStatus('loading');
    setError(null);
    if (defaultTitle) setTitle(defaultTitle);
    if (defaultTarget) {
      setTarget(defaultTarget.type);
      setTargetId(defaultTarget.id);
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
    return () => { alive = false; };
  }, [open, defaultTarget, defaultTitle]);

  function resetForm() {
    setTitle(defaultTitle ?? '');
    setDescription('');
    setTarget(defaultTarget?.type ?? 'student');
    setTargetId(defaultTarget?.id ?? '');
    setDeadline('');
    setSubmitting(false);
    setError(null);
    setToast(null);
  }

  function handleClose() {
    if (submitting) return;
    resetForm();
    onClose();
  }

  function computeAssignees(): string[] {
    if (!targetId) return [];
    if (target === 'student') return [targetId];
    const g = groups.find(x => x.documentId === targetId);
    return g ? g.members.map(m => m.documentId) : [];
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const assigneeIds = computeAssignees();
    if (assigneeIds.length === 0) {
      setError('Оберіть отримувача');
      return;
    }
    setSubmitting(true);
    try {
      const hw = await createHomework({
        title: title.trim(),
        description: description.trim() || undefined,
        dueAt: deadline ? new Date(`${deadline}T23:59:59`).toISOString() : null,
        assigneeIds,
        status: 'published',
        lessonId: defaultLessonId,
      });
      onCreated?.(hw);
      setToast(`ДЗ «${hw.title}» опубліковано для ${assigneeIds.length} учн.`);
      window.setTimeout(() => {
        resetForm();
        onClose();
      }, 1400);
    } catch (e: any) {
      setError(e?.message ?? 'Не вдалось створити ДЗ');
      setSubmitting(false);
    }
  }

  const targetOptions =
    target === 'student'
      ? students.map(s => ({ id: s.documentId, label: `${s.displayName}${s.level ? ` · ${s.level}` : ''}` }))
      : groups.map(g => ({ id: g.documentId, label: `${g.name} · ${g.level}` }));

  return (
    <Modal isOpen={open} onClose={handleClose} title="Нове домашнє завдання">
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
            <label className={fieldLabel} htmlFor="hw-title">Назва</label>
            <input
              id="hw-title"
              type="text"
              value={title}
              required
              disabled={submitting}
              onChange={e => setTitle(e.target.value)}
              placeholder="Напр. Present Simple — 10 речень"
              className={fieldInput}
            />
          </div>

          <div>
            <label className={fieldLabel} htmlFor="hw-desc">Опис</label>
            <textarea
              id="hw-desc"
              value={description}
              disabled={submitting}
              onChange={e => setDescription(e.target.value)}
              placeholder="Що саме зробити, критерії, приклади…"
              className={`${fieldInput} h-auto min-h-20 py-2 resize-y`}
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
                  onClick={() => { setTarget(t); setTargetId(''); }}
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
                {groups.find(g => g.documentId === targetId)?.members.length ?? 0} учасник(ів) отримають ДЗ
              </p>
            )}
          </div>

          <div>
            <label className={fieldLabel} htmlFor="hw-dl">Дедлайн</label>
            <input
              id="hw-dl"
              type="date"
              value={deadline}
              required
              disabled={submitting}
              onChange={e => setDeadline(e.target.value)}
              className={fieldInput}
            />
          </div>

          {error && (
            <p className="text-xs text-danger-dark">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleClose} disabled={submitting}>
              Скасувати
            </Button>
            <Button type="submit" size="sm" loading={submitting}>
              Опублікувати
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
