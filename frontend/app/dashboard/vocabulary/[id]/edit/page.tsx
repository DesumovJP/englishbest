/**
 * Teacher dashboard — vocabulary set editor.
 *
 * Edits a single vocabulary set: title, level, topic, description, and the
 * words list (inline rows: word + translation + optional example +
 * partOfSpeech). Save button writes via PUT; Delete removes the set.
 *
 * Reachable from /dashboard/library?tab=vocabulary card click and from the
 * lesson editor's vocabulary attach modal once we cross-link those.
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { DashboardPageShell } from '@/components/ui/shells';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { MediaPickerCard } from '@/components/ui/MediaPickerCard';
import {
  approveVocabSet,
  deleteVocabSet,
  fetchVocabSet,
  rejectVocabSet,
  submitVocabSet,
  updateVocabSet,
  type VocabSetDetail,
  type VocabWord,
  type Level,
} from '@/lib/teacher-vocabulary';
import { ModerationBanner } from '@/components/teacher/ModerationBanner';
import { useSession } from '@/lib/session-context';

const LEVELS: Level[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const LEVEL_OPTIONS = LEVELS.map((l) => ({ value: l, label: `Рівень ${l}` }));

const SECTION_LABEL_CLS =
  'font-bold text-[11px] uppercase tracking-[0.04em] text-ink-muted';

export default function VocabSetEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const documentId = params?.id ?? '';

  const { session } = useSession();
  const isAdmin = session?.profile?.role === 'admin';
  const callerTeacherProfileId =
    (session?.profile?.teacherProfile as { documentId?: string } | null | undefined)?.documentId ??
    null;

  const [detail, setDetail] = useState<VocabSetDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [titleUa, setTitleUa] = useState('');
  const [level, setLevel] = useState<Level>('A1');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [words, setWords] = useState<VocabWord[]>([]);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [moderating, setModerating] = useState(false);

  useEffect(() => {
    if (!documentId) return;
    let alive = true;
    fetchVocabSet(documentId)
      .then((d) => {
        if (!alive) return;
        if (!d) {
          setLoadError('Словник не знайдено');
          return;
        }
        setDetail(d);
        setTitle(d.title);
        setTitleUa(d.titleUa ?? '');
        setLevel((d.level as Level) ?? 'A1');
        setTopic(d.topic ?? '');
        setDescription(d.description ?? '');
        setWords(d.words);
      })
      .catch((e) => alive && setLoadError(e instanceof Error ? e.message : 'failed'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [documentId]);

  function notify(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  }

  function patchWord(idx: number, patch: Partial<VocabWord>) {
    setWords((prev) => prev.map((w, i) => (i === idx ? { ...w, ...patch } : w)));
  }
  function removeWord(idx: number) {
    setWords((prev) => prev.filter((_, i) => i !== idx));
  }
  function addWord() {
    setWords((prev) => [...prev, { word: '', translation: '' }]);
  }
  function moveWord(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= words.length) return;
    setWords((prev) => {
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const cleanedWords = words
        .map((w) => ({
          word: w.word.trim(),
          translation: w.translation.trim(),
          example: w.example?.trim() || undefined,
          exampleTranslation: w.exampleTranslation?.trim() || undefined,
          partOfSpeech: w.partOfSpeech?.trim() || undefined,
        }))
        .filter((w) => w.word || w.translation);
      const updated = await updateVocabSet(documentId, {
        title: title.trim(),
        titleUa: titleUa.trim() || null,
        level,
        topic: topic.trim() || null,
        description: description.trim() || null,
        words: cleanedWords,
      });
      if (updated) {
        setDetail(updated);
        setWords(updated.words);
      }
      notify('Збережено');
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!detail) return;
    if (!window.confirm(`Видалити словник «${detail.title}»?`)) return;
    try {
      await deleteVocabSet(documentId);
      router.push('/dashboard/library?tab=vocabulary');
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Не вдалося видалити');
    }
  }

  async function handleSubmitForReview() {
    setModerating(true);
    try {
      const fresh = await submitVocabSet(documentId);
      if (fresh) setDetail(fresh);
      notify('Подано на затвердження');
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Не вдалося подати');
    } finally {
      setModerating(false);
    }
  }

  async function handleApprove() {
    setModerating(true);
    try {
      const fresh = await approveVocabSet(documentId);
      if (fresh) setDetail(fresh);
      notify('Затверджено');
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Не вдалося затвердити');
    } finally {
      setModerating(false);
    }
  }

  async function handleReject(reason: string) {
    setModerating(true);
    try {
      const fresh = await rejectVocabSet(documentId, reason);
      if (fresh) setDetail(fresh);
      notify('Відхилено');
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Не вдалося відхилити');
    } finally {
      setModerating(false);
    }
  }

  const backLink = (
    <Link
      href="/dashboard/library?tab=vocabulary"
      className="inline-flex items-center gap-1 text-[12px] font-semibold text-ink-muted hover:text-ink w-fit"
    >
      ← Бібліотека
    </Link>
  );

  if (loading || loadError) {
    return (
      <div className="flex flex-col gap-3">
        {backLink}
        <DashboardPageShell
          title="Словник"
          status={loadError ? 'error' : 'loading'}
          error={loadError ?? undefined}
          onRetry={() => location.reload()}
          loadingShape="card"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {backLink}
      <DashboardPageShell
        title={title.trim() || 'Словник'}
        subtitle={`${words.length} слів${detail?.lessonSlug ? ' · в уроці' : detail?.courseSlug ? ' · у курсі' : ''}`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Зберігаю…' : 'Зберегти'}
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Видалити
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {detail?.reviewStatus && (
            <ModerationBanner
              status={detail.reviewStatus}
              rejectionReason={detail.rejectionReason}
              isAdmin={isAdmin}
              isOwner={
                callerTeacherProfileId !== null &&
                callerTeacherProfileId === detail.ownerDocumentId
              }
              busy={moderating}
              onSubmit={handleSubmitForReview}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}
          <Card variant="surface" padding="md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className={SECTION_LABEL_CLS}>Назва (EN)</span>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1">
                <span className={SECTION_LABEL_CLS}>Назва (UA)</span>
                <Input value={titleUa} onChange={(e) => setTitleUa(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1">
                <span className={SECTION_LABEL_CLS}>Рівень</span>
                <Select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as Level)}
                  options={LEVEL_OPTIONS}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className={SECTION_LABEL_CLS}>Тема</span>
                <Input value={topic} onChange={(e) => setTopic(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className={SECTION_LABEL_CLS}>Опис</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="ios-input py-2 leading-relaxed"
                />
              </label>
            </div>
          </Card>

          <MediaPickerCard
            label="Обкладинка словника"
            hint="Опціонально — показується в картці словника"
            initialUrl={detail?.coverImageUrl ?? null}
            onSaved={async (media) => {
              const updated = await updateVocabSet(documentId, {
                coverImage: media.id,
              });
              if (updated) setDetail(updated);
              notify('Обкладинку оновлено');
            }}
          />

          <Card variant="surface" padding="md">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className={SECTION_LABEL_CLS}>Слова ({words.length})</p>
              <Button onClick={addWord} variant="secondary" size="sm">
                + Слово
              </Button>
            </div>

            {words.length === 0 ? (
              <p className="text-[12.5px] text-ink-muted">
                Поки порожньо. Додай перше слово — англійською + переклад.
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {words.map((w, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-border bg-surface p-2 flex items-center gap-2"
                  >
                    <Input
                      value={w.word}
                      onChange={(e) => patchWord(i, { word: e.target.value })}
                      placeholder="word (EN)"
                      className="flex-1"
                      inputSize="sm"
                    />
                    <Input
                      value={w.translation}
                      onChange={(e) => patchWord(i, { translation: e.target.value })}
                      placeholder="переклад (UA)"
                      className="flex-1"
                      inputSize="sm"
                    />
                    <button
                      type="button"
                      onClick={() => moveWord(i, -1)}
                      disabled={i === 0}
                      className="ios-btn ios-btn-ghost ios-btn-sm disabled:opacity-40"
                      aria-label="Вище"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveWord(i, +1)}
                      disabled={i === words.length - 1}
                      className="ios-btn ios-btn-ghost ios-btn-sm disabled:opacity-40"
                      aria-label="Нижче"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeWord(i)}
                      className="ios-btn ios-btn-ghost ios-btn-sm text-danger-dark"
                      aria-label="Прибрати"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {saveError && (
            <Card variant="surface" padding="md">
              <p className="text-[13px] text-danger-dark">{saveError}</p>
            </Card>
          )}
        </div>
      </DashboardPageShell>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-semibold shadow-card-md">
          {toast}
        </div>
      )}
    </div>
  );
}
