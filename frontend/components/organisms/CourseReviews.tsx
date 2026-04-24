'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  fetchReviewsByCourse,
  createReview,
  updateReview,
  deleteReview,
} from '@/lib/reviews';
import { useSession } from '@/lib/session-context';
import { Button } from '@/components/ui/Button';
import type { Review } from '@/lib/types';

interface CourseReviewsProps {
  courseDocumentId: string;
}

export function CourseReviews({ courseDocumentId }: CourseReviewsProps) {
  const { session, status } = useSession();
  const myProfileId = session?.profile?.documentId;

  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    let alive = true;
    setReviews(null);
    setError(null);
    fetchReviewsByCourse(courseDocumentId)
      .then((rows) => { if (alive) setReviews(rows); })
      .catch((e) => { if (alive) setError(e instanceof Error ? e.message : 'failed'); });
    return () => { alive = false; };
  }, [courseDocumentId]);

  const myReview = useMemo(
    () => (myProfileId && reviews ? reviews.find((r) => r.authorId === myProfileId) ?? null : null),
    [reviews, myProfileId],
  );

  function startEdit(r: Review) {
    setEditingId(r.documentId);
    setRating(r.rating);
    setTitle(r.title ?? '');
    setBody(r.body ?? '');
  }

  function resetForm() {
    setEditingId(null);
    setRating(5);
    setTitle('');
    setBody('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        const saved = await updateReview(editingId, { rating, title, body });
        setReviews((rs) =>
          rs ? rs.map((r) => (r.documentId === saved.documentId ? saved : r)) : [saved],
        );
      } else {
        const saved = await createReview({ courseDocumentId, rating, title, body });
        setReviews((rs) => (rs ? [saved, ...rs.filter((r) => r.documentId !== saved.documentId)] : [saved]));
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Видалити відгук?')) return;
    setDeletingId(id);
    try {
      await deleteReview(id);
      setReviews((rs) => (rs ? rs.filter((r) => r.documentId !== id) : rs));
      if (editingId === id) resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'failed');
    } finally {
      setDeletingId(null);
    }
  }

  const canWrite = status === 'authenticated' && Boolean(myProfileId);
  const editing = Boolean(editingId);
  const hasMineAlready = Boolean(myReview) && !editing;

  return (
    <section aria-labelledby="reviews-heading" className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <h2 id="reviews-heading" className="font-black text-ink">Відгуки</h2>
        {reviews && (
          <span className="text-xs text-ink-muted tabular-nums">{reviews.length} всього</span>
        )}
      </div>

      {canWrite && !hasMineAlready && (
        <form onSubmit={handleSubmit} className="px-6 py-4 border-b border-border flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink-muted">Ваша оцінка</span>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Короткий заголовок (необов'язково)"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
            maxLength={120}
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Розкажіть більше про досвід…"
            rows={3}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm resize-y focus:outline-none focus:border-primary"
            maxLength={2000}
          />
          <div className="flex gap-2">
            <Button type="submit" loading={saving}>
              {editing ? 'Зберегти' : 'Опублікувати'}
            </Button>
            {editing && (
              <Button type="button" variant="secondary" onClick={resetForm} disabled={saving}>
                Скасувати
              </Button>
            )}
          </div>
          {error && <p className="text-xs text-danger-dark">{error}</p>}
        </form>
      )}

      {hasMineAlready && (
        <div className="px-6 py-3 border-b border-border text-xs text-ink-muted">
          Ви вже залишили відгук — можете редагувати або видалити його нижче.
        </div>
      )}

      {reviews === null ? (
        <p className="px-6 py-6 text-sm text-ink-muted">Завантаження…</p>
      ) : reviews.length === 0 ? (
        <p className="px-6 py-6 text-sm text-ink-muted">Поки що жодного відгуку.</p>
      ) : (
        <ul>
          {reviews.map((r) => {
            const mine = myProfileId && r.authorId === myProfileId;
            return (
              <li key={r.documentId} className="px-6 py-4 border-t border-border first:border-t-0 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <StarRow value={r.rating} />
                    <span className="text-xs font-semibold text-ink">{r.authorName ?? 'Анонім'}</span>
                    {r.verified && (
                      <span className="text-[10px] font-semibold text-success-dark bg-success/10 px-1.5 py-0.5 rounded">
                        ✓ Перевірено
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-ink-faint tabular-nums">{formatDate(r.createdAt)}</span>
                </div>
                {r.title && <p className="text-sm font-semibold text-ink">{r.title}</p>}
                {r.body && <p className="text-sm text-ink-muted leading-relaxed whitespace-pre-wrap">{r.body}</p>}
                {mine && (
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="secondary" onClick={() => startEdit(r)} disabled={deletingId === r.documentId}>
                      Редагувати
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      loading={deletingId === r.documentId}
                      onClick={() => handleDelete(r.documentId)}
                    >
                      Видалити
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} зірок`}
          onClick={() => onChange(n)}
          className={`text-lg leading-none ${n <= value ? 'text-accent' : 'text-ink-faint'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function StarRow({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-sm">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= value ? 'text-accent' : 'text-ink-faint'}>★</span>
      ))}
    </span>
  );
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
