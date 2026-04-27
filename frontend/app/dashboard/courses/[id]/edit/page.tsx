/**
 * Teacher dashboard — course editor.
 *
 * Surfaces three production-grade levers per course:
 *   1. Metadata — title, titleUa, subtitle, description, level, audience.
 *   2. Sections (units) — add / rename / reorder / delete + per-unit
 *      lesson-slug list (drag-free; explicit "+ урок" buttons).
 *   3. Vocabulary attach — VocabularyAttachSection (parent="course").
 *
 * Course CREATE is still done in Strapi admin (rare event); this page
 * handles all the day-to-day editing teachers actually do.
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { DashboardPageShell } from '@/components/ui/shells';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  fetchTeacherCourse,
  updateCourseMeta,
  updateCourseSections,
  type CourseDetail,
  type CourseSection,
  type Level,
  type CourseAudience,
} from '@/lib/teacher-courses';
import { VocabularyAttachSection } from '@/components/teacher/LessonVocabularySection';

const SECTION_LABEL_CLS =
  'font-bold text-[11px] uppercase tracking-[0.04em] text-ink-muted';

const LEVELS: Level[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const AUDIENCES: CourseAudience[] = ['kids', 'teens', 'adults', 'any'];

export default function CourseEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const documentId = params?.id ?? '';

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingMeta, setSavingMeta] = useState(false);
  const [savingSections, setSavingSections] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Editable mirror — committed on save.
  const [draftMeta, setDraftMeta] = useState({
    title: '',
    titleUa: '',
    subtitle: '',
    descriptionShort: '',
    description: '',
    level: 'A1' as Level,
    audience: 'kids' as CourseAudience,
    iconEmoji: '🎓',
  });
  const [draftSections, setDraftSections] = useState<CourseSection[]>([]);

  useEffect(() => {
    if (!documentId) return;
    let alive = true;
    fetchTeacherCourse(documentId)
      .then((c) => {
        if (!alive || !c) {
          if (alive) setError('Курс не знайдено');
          return;
        }
        setCourse(c);
        setDraftMeta({
          title: c.title,
          titleUa: c.titleUa ?? '',
          subtitle: c.subtitle ?? '',
          descriptionShort: c.descriptionShort ?? '',
          description: c.description ?? '',
          level: c.level ?? 'A1',
          audience: c.audience ?? 'any',
          iconEmoji: c.iconEmoji ?? '🎓',
        });
        setDraftSections(c.sections);
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'failed'));
    return () => {
      alive = false;
    };
  }, [documentId]);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function handleSaveMeta() {
    if (!course) return;
    setSavingMeta(true);
    try {
      const updated = await updateCourseMeta(course.documentId, {
        title: draftMeta.title.trim(),
        titleUa: draftMeta.titleUa.trim() || null,
        subtitle: draftMeta.subtitle.trim() || null,
        descriptionShort: draftMeta.descriptionShort.trim() || null,
        description: draftMeta.description.trim() || null,
        level: draftMeta.level,
        audience: draftMeta.audience,
        iconEmoji: draftMeta.iconEmoji,
      });
      if (updated) setCourse(updated);
      notify('Метадані збережено');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'failed');
    } finally {
      setSavingMeta(false);
    }
  }

  async function handleSaveSections() {
    if (!course) return;
    setSavingSections(true);
    try {
      const updated = await updateCourseSections(course.documentId, draftSections);
      if (updated) {
        setCourse(updated);
        setDraftSections(updated.sections);
      }
      notify('Юніти збережено');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'failed');
    } finally {
      setSavingSections(false);
    }
  }

  function addSection() {
    const next: CourseSection = {
      slug: `${course?.slug ?? 'unit'}-unit-${draftSections.length + 1}`,
      title: `Юніт ${draftSections.length + 1}`,
      order: draftSections.length,
      lessonSlugs: [],
    };
    setDraftSections([...draftSections, next]);
  }

  function patchSection(idx: number, patch: Partial<CourseSection>) {
    setDraftSections(draftSections.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }

  function moveSection(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= draftSections.length) return;
    const next = [...draftSections];
    [next[idx], next[target]] = [next[target], next[idx]];
    setDraftSections(next.map((s, i) => ({ ...s, order: i })));
  }

  function deleteSection(idx: number) {
    if (!confirm('Видалити цей юніт? Прив\'язки уроків будуть втрачені.')) return;
    setDraftSections(draftSections.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i })));
  }

  if (error && !course) {
    return (
      <DashboardPageShell title="Курс">
        <Card variant="surface" padding="md">
          <p className="text-[13px] text-danger-dark">{error}</p>
          <div className="mt-3">
            <Link href="/dashboard/courses" className="ios-btn ios-btn-secondary ios-btn-sm">
              ← До списку курсів
            </Link>
          </div>
        </Card>
      </DashboardPageShell>
    );
  }
  if (!course) {
    return (
      <DashboardPageShell title="Курс">
        <Card variant="surface" padding="md">
          <p className="text-[13px] text-ink-faint">Завантаження…</p>
        </Card>
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell title={`Курс · ${course.titleUa || course.title}`}>
      <div className="flex flex-col gap-4">
        {/* META */}
        <Card variant="surface" padding="md">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className={SECTION_LABEL_CLS}>Метадані</p>
            <Button onClick={handleSaveMeta} disabled={savingMeta} size="sm">
              {savingMeta ? 'Збереження…' : 'Зберегти'}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className={SECTION_LABEL_CLS}>Назва (EN)</span>
              <Input
                value={draftMeta.title}
                onChange={(e) => setDraftMeta({ ...draftMeta, title: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={SECTION_LABEL_CLS}>Назва (UA)</span>
              <Input
                value={draftMeta.titleUa}
                onChange={(e) => setDraftMeta({ ...draftMeta, titleUa: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className={SECTION_LABEL_CLS}>Підзаголовок</span>
              <Input
                value={draftMeta.subtitle}
                onChange={(e) => setDraftMeta({ ...draftMeta, subtitle: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className={SECTION_LABEL_CLS}>Короткий опис</span>
              <Input
                value={draftMeta.descriptionShort}
                onChange={(e) => setDraftMeta({ ...draftMeta, descriptionShort: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className={SECTION_LABEL_CLS}>Повний опис</span>
              <textarea
                value={draftMeta.description}
                onChange={(e) => setDraftMeta({ ...draftMeta, description: e.target.value })}
                rows={3}
                className="ios-input py-2 leading-relaxed"
                style={{ height: 'auto' }}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={SECTION_LABEL_CLS}>Рівень</span>
              <select
                value={draftMeta.level}
                onChange={(e) => setDraftMeta({ ...draftMeta, level: e.target.value as Level })}
                className="ios-input"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className={SECTION_LABEL_CLS}>Аудиторія</span>
              <select
                value={draftMeta.audience}
                onChange={(e) =>
                  setDraftMeta({ ...draftMeta, audience: e.target.value as CourseAudience })
                }
                className="ios-input"
              >
                {AUDIENCES.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 w-32">
              <span className={SECTION_LABEL_CLS}>Емоджі</span>
              <Input
                value={draftMeta.iconEmoji}
                onChange={(e) => setDraftMeta({ ...draftMeta, iconEmoji: e.target.value })}
                maxLength={4}
                className="text-center text-[20px]"
              />
            </label>
          </div>
        </Card>

        {/* SECTIONS / UNITS */}
        <Card variant="surface" padding="md">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className={SECTION_LABEL_CLS}>
              Юніти ({draftSections.length})
            </p>
            <div className="flex gap-2">
              <Button onClick={addSection} variant="secondary" size="sm">
                + Юніт
              </Button>
              <Button onClick={handleSaveSections} disabled={savingSections} size="sm">
                {savingSections ? 'Збереження…' : 'Зберегти юніти'}
              </Button>
            </div>
          </div>

          {draftSections.length === 0 && (
            <p className="text-[12.5px] text-ink-muted">
              Поки немає юнітів. Додай перший — він стане «Юніт 1». Уроки можна
              вписувати по одному slug-у через кнопку «+ урок».
            </p>
          )}

          <div className="flex flex-col gap-3">
            {draftSections.map((s, i) => (
              <SectionRow
                key={s.id ?? `${s.slug}-${i}`}
                section={s}
                index={i}
                total={draftSections.length}
                onPatch={(p) => patchSection(i, p)}
                onMoveUp={() => moveSection(i, -1)}
                onMoveDown={() => moveSection(i, +1)}
                onDelete={() => deleteSection(i)}
              />
            ))}
          </div>
        </Card>

        {/* VOCABULARY */}
        <VocabularyAttachSection
          parent="course"
          parentDocumentId={course.documentId}
          parentTitle={course.titleUa || course.title}
          parentLevel={course.level}
        />
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-semibold shadow-card-md">
          {toast}
        </div>
      )}
    </DashboardPageShell>
  );
}

function SectionRow({
  section,
  index,
  total,
  onPatch,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  section: CourseSection;
  index: number;
  total: number;
  onPatch: (patch: Partial<CourseSection>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  function addLessonSlug() {
    onPatch({ lessonSlugs: [...section.lessonSlugs, ''] });
  }
  function removeLessonAt(i: number) {
    onPatch({ lessonSlugs: section.lessonSlugs.filter((_, idx) => idx !== i) });
  }
  function patchLessonAt(i: number, value: string) {
    onPatch({ lessonSlugs: section.lessonSlugs.map((s, idx) => (idx === i ? value : s)) });
  }

  return (
    <div className="rounded-xl border border-border p-3 bg-surface">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-bold text-[11px] text-ink-faint tabular-nums w-8">
          {String(index + 1).padStart(2, '0')}
        </span>
        <Input
          value={section.title}
          onChange={(e) => onPatch({ title: e.target.value })}
          placeholder="Назва юніту"
          className="flex-1"
        />
        <Input
          value={section.slug}
          onChange={(e) => onPatch({ slug: e.target.value })}
          placeholder="slug"
          className="w-44"
        />
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className="ios-btn ios-btn-ghost ios-btn-sm disabled:opacity-40"
          aria-label="Вище"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="ios-btn ios-btn-ghost ios-btn-sm disabled:opacity-40"
          aria-label="Нижче"
        >
          ↓
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="ios-btn ios-btn-ghost ios-btn-sm text-danger-dark"
        >
          Видалити
        </button>
      </div>

      <div className="pl-10 flex flex-col gap-1.5">
        <p className={SECTION_LABEL_CLS}>Уроки (slug-и, по порядку)</p>
        {section.lessonSlugs.length === 0 && (
          <p className="text-[12px] text-ink-faint">
            Без уроків. Додай перший слаг — наприклад, <code>a-my-world-1-rooms</code>.
          </p>
        )}
        {section.lessonSlugs.map((slug, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="font-medium text-[11.5px] text-ink-faint tabular-nums w-8 text-right">
              {i + 1}.
            </span>
            <Input
              value={slug}
              onChange={(e) => patchLessonAt(i, e.target.value)}
              placeholder="lesson-slug"
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => removeLessonAt(i)}
              className="ios-btn ios-btn-ghost ios-btn-sm text-danger-dark"
              aria-label="Прибрати"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addLessonSlug}
          className="ios-btn ios-btn-secondary ios-btn-sm self-start mt-1"
        >
          + урок
        </button>
      </div>
    </div>
  );
}
