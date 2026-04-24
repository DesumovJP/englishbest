/**
 * ManageHomeworksModal — list teacher's homework parents with inline edit
 * (title/description/dueAt/status) + delete.
 *
 * Loads `fetchHomeworks()` on open. Mutations call `updateHomework` or
 * `deleteHomework`. Assignees are not editable here — changing them would
 * recreate submissions server-side; use CreateHomeworkModal for new ДЗ.
 */
'use client';
import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  deleteHomework,
  fetchHomeworks,
  updateHomework,
  type Homework,
  type HomeworkStatus,
} from '@/lib/homework';

interface ManageHomeworksModalProps {
  open: boolean;
  onClose: () => void;
  onMutated?: () => void;
}

const STATUS_OPTIONS: Array<{ value: HomeworkStatus; label: string }> = [
  { value: 'draft',     label: 'Чернетка' },
  { value: 'published', label: 'Опубліковано' },
  { value: 'closed',    label: 'Закрито' },
  { value: 'archived',  label: 'Архів' },
];

function isoDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

export function ManageHomeworksModal({ open, onClose, onMutated }: ManageHomeworksModalProps) {
  const [items,      setItems]   = useState<Homework[]>([]);
  const [load,       setLoad]    = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [err,        setErr]     = useState<string | null>(null);
  const [expanded,   setExp]     = useState<string | null>(null);
  const [busyId,     setBusyId]  = useState<string | null>(null);

  // per-row edits
  const [title,  setTitle]  = useState('');
  const [desc,   setDesc]   = useState('');
  const [due,    setDue]    = useState('');
  const [status, setStatus] = useState<HomeworkStatus>('published');

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoad('loading');
    fetchHomeworks()
      .then((rows) => {
        if (!alive) return;
        setItems(rows);
        setLoad('ready');
      })
      .catch((e) => {
        if (!alive) return;
        setErr(e instanceof Error ? e.message : 'failed');
        setLoad('error');
      });
    return () => { alive = false; };
  }, [open]);

  function handleOpenRow(hw: Homework) {
    if (expanded === hw.documentId) {
      setExp(null);
      return;
    }
    setExp(hw.documentId);
    setTitle(hw.title);
    setDesc(hw.description);
    setDue(isoDate(hw.dueAt));
    setStatus(hw.status);
  }

  async function saveRow(hw: Homework) {
    setBusyId(hw.documentId);
    setErr(null);
    try {
      const updated = await updateHomework(hw.documentId, {
        title: title.trim(),
        description: desc.trim(),
        dueAt: due ? new Date(`${due}T23:59:59`).toISOString() : null,
        status,
      });
      setItems((prev) => prev.map((h) => (h.documentId === hw.documentId ? updated : h)));
      setExp(null);
      onMutated?.();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Не вдалось зберегти');
    } finally {
      setBusyId(null);
    }
  }

  async function deleteRow(hw: Homework) {
    if (!window.confirm(`Видалити ДЗ «${hw.title}» і всі здачі учнів?`)) return;
    setBusyId(hw.documentId);
    setErr(null);
    try {
      await deleteHomework(hw.documentId);
      setItems((prev) => prev.filter((h) => h.documentId !== hw.documentId));
      if (expanded === hw.documentId) setExp(null);
      onMutated?.();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Не вдалось видалити');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Modal isOpen={open} onClose={onClose} title="Керування ДЗ" width="lg">
      {load === 'loading' && (
        <div className="py-10 text-center text-sm text-ink-muted">Завантаження…</div>
      )}
      {load === 'error' && (
        <div className="py-10 text-center">
          <p className="text-danger-dark text-sm mb-3">{err ?? 'Не вдалося завантажити'}</p>
          <Button variant="secondary" size="sm" onClick={onClose}>Закрити</Button>
        </div>
      )}
      {load === 'ready' && items.length === 0 && (
        <div className="py-10 text-center text-sm text-ink-muted">
          У вас поки немає ДЗ
        </div>
      )}
      {load === 'ready' && items.length > 0 && (
        <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
          {err && <p className="text-sm text-danger-dark">{err}</p>}
          {items.map((hw) => {
            const isOpen = expanded === hw.documentId;
            const isBusy = busyId === hw.documentId;
            return (
              <div key={hw.documentId} className="border border-border rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleOpenRow(hw)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-muted/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-ink truncate">{hw.title}</p>
                    <p className="text-[11px] text-ink-muted tabular-nums">
                      {hw.status} · {hw.assignees.length} учнів{hw.dueAt ? ` · до ${isoDate(hw.dueAt)}` : ''}
                    </p>
                  </div>
                  <span className={`text-ink-faint transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {isOpen && (
                  <div className="px-4 py-3 border-t border-border bg-surface-muted/30 flex flex-col gap-3">
                    <label className="text-xs font-black text-ink-muted uppercase tracking-wide">
                      Назва
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isBusy}
                        className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-white text-sm text-ink focus:outline-none focus:border-primary"
                      />
                    </label>
                    <label className="text-xs font-black text-ink-muted uppercase tracking-wide">
                      Опис
                      <textarea
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        disabled={isBusy}
                        rows={3}
                        className="w-full mt-1.5 px-3 py-2 rounded-xl border border-border bg-white text-sm text-ink focus:outline-none focus:border-primary resize-y"
                      />
                    </label>
                    <div className="flex gap-3 flex-wrap">
                      <label className="text-xs font-black text-ink-muted uppercase tracking-wide flex-1 min-w-[140px]">
                        Дедлайн
                        <input
                          type="date"
                          value={due}
                          onChange={(e) => setDue(e.target.value)}
                          disabled={isBusy}
                          className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-white text-sm text-ink focus:outline-none focus:border-primary"
                        />
                      </label>
                      <label className="text-xs font-black text-ink-muted uppercase tracking-wide flex-1 min-w-[140px]">
                        Статус
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as HomeworkStatus)}
                          disabled={isBusy}
                          className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-white text-sm text-ink focus:outline-none focus:border-primary"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="danger" size="sm" onClick={() => deleteRow(hw)} disabled={isBusy}>
                        Видалити
                      </Button>
                      <Button size="sm" onClick={() => saveRow(hw)} disabled={isBusy}>
                        {isBusy ? 'Зберігаю…' : 'Зберегти'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
