/**
 * Teacher dashboard — course editor.
 *
 * Surfaces three production-grade levers per course:
 *   1. Metadata — title, titleUa, subtitle, description, level, audience.
 *   2. Sections (units) — add / rename / reorder / delete + per-unit
 *      lesson list (picker over the library; chip-list with reorder + remove).
 *   3. Vocabulary attach — VocabularyAttachSection (parent="course").
 *
 * Course CREATE is still done in Strapi admin (rare event); this page
 * handles all the day-to-day editing teachers actually do.
 */
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { DashboardPageShell } from '@/components/ui/shells';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { WipSection } from '@/components/ui/WipSection';
import {
  deleteTeacherCourse,
  fetchTeacherCourse,
  publishCourse,
  unpublishCourse,
  updateCourseMeta,
  updateCourseSections,
  type CourseDetail,
  type CourseSection,
  type Level,
} from '@/lib/teacher-courses';
import { fetchLessonsCached, updateLesson } from '@/lib/teacher-library';
import type { LibraryLesson } from '@/lib/types/teacher';
import { VocabularyAttachSection } from '@/components/teacher/LessonVocabularySection';
import { LessonPickerModal } from '@/components/teacher/LessonPickerModal';

const SECTION_LABEL_CLS =
  'font-bold text-[11px] uppercase tracking-[0.04em] text-ink-muted';

const LEVELS: Level[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function CourseEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const documentId = params?.id ?? '';

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingMeta, setSavingMeta] = useState(false);
  const [savingSections, setSavingSections] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [draftMeta, setDraftMeta] = useState({
    title: '',
    titleUa: '',
    subtitle: '',
    descriptionShort: '',
    description: '',
    level: 'A1' as Level,
  });
  const [draftSections, setDraftSections] = useState<CourseSection[]>([]);

  const [library, setLibrary] = useState<LibraryLesson[]>([]);
  const [pickerForSection, setPickerForSection] = useState<number | null>(null);

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
        });
        setDraftSections(c.sections);
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'failed'));
    return () => {
      alive = false;
    };
  }, [documentId]);

  useEffect(() => {
    let alive = true;
    fetchLessonsCached()
      .then((rows) => alive && setLibrary(rows))
      .catch(() => {
        /* picker still works on slug-only fallback */
      });
    return () => {
      alive = false;
    };
  }, []);

  const lessonsBySlug = useMemo(() => {
    const map = new Map<string, LibraryLesson>();
    for (const l of library) if (l.slug) map.set(l.slug, l);
    return map;
  }, [library]);

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
      });
      if (updated) setCourse(updated);
      notify('Метадані збережено');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'failed');
    } finally {
      setSavingMeta(false);
    }
  }

  async function handleTogglePublish() {
    if (!course) return;
    setPublishing(true);
    try {
      const updated = course.published
        ? await unpublishCourse(course.documentId)
        : await publishCourse(course.documentId);
      if (updated) setCourse(updated);
      notify(course.published ? 'Знято з публікації' : 'Опубліковано');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'failed');
    } finally {
      setPublishing(false);
    }
  }

  async function handleDelete() {
    if (!course) return;
    if (!window.confirm(`Видалити курс «${course.titleUa || course.title}»?`)) return;
    try {
      await deleteTeacherCourse(course.documentId);
      router.push('/dashboard/library');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Не вдалося видалити';
      notify(`Помилка: ${msg}`);
    }
  }

  async function handleSaveSections() {
    if (!course) return;
    setSavingSections(true);
    // Capture pre-save assignment map so we can diff and propagate the relation
    // write *after* the slug-array save succeeds.
    const oldAssignments = sectionsToAssignmentMap(course.sections);
    const newAssignments = sectionsToAssignmentMap(draftSections);
    try {
      const updated = await updateCourseSections(course.documentId, draftSections);
      if (updated) {
        setCourse(updated);
        setDraftSections(updated.sections);
      }
      await propagateLessonRelations({
        courseId: course.documentId,
        oldAssignments,
        newAssignments,
        lessonsBySlug,
      });
      // Refresh library so courseDocumentId/sectionSlug on lessons reflect
      // the new bindings on next picker open.
      try {
        const fresh = await fetchLessonsCached();
        setLibrary(fresh);
      } catch {
        /* non-fatal — picker still works on stale data */
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

  function addLessonsToSection(sectionIdx: number, slugs: string[]) {
    const fresh = slugs.filter((s) => s && !draftSections[sectionIdx].lessonSlugs.includes(s));
    if (fresh.length === 0) return;
    patchSection(sectionIdx, {
      lessonSlugs: [...draftSections[sectionIdx].lessonSlugs, ...fresh],
    });
  }

  function removeLesson(sectionIdx: number, lessonIdx: number) {
    const next = draftSections[sectionIdx].lessonSlugs.filter((_, i) => i !== lessonIdx);
    patchSection(sectionIdx, { lessonSlugs: next });
  }

  function moveLesson(sectionIdx: number, lessonIdx: number, dir: -1 | 1) {
    const list = draftSections[sectionIdx].lessonSlugs;
    const target = lessonIdx + dir;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[lessonIdx], next[target]] = [next[target], next[lessonIdx]];
    patchSection(sectionIdx, { lessonSlugs: next });
  }

  if (error && !course) {
    return (
      <DashboardPageShell title="Курс">
        <Card variant="surface" padding="md">
          <p className="text-[13px] text-danger-dark">{error}</p>
          <div className="mt-3">
            <Link href="/dashboard/library" className="ios-btn ios-btn-secondary ios-btn-sm">
              ← До бібліотеки
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

  const pickerSection = pickerForSection !== null ? draftSections[pickerForSection] : null;

  return (
    <DashboardPageShell
      title={`Курс · ${course.titleUa || course.title}`}
      subtitle={course.published ? 'Опубліковано' : 'Чернетка'}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={course.published ? 'secondary' : 'primary'}
            onClick={handleTogglePublish}
            disabled={publishing}
          >
            {publishing
              ? '…'
              : course.published
                ? 'Зняти з публікації'
                : 'Опублікувати'}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Видалити
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
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
          </div>
          <div className="mt-3">
            <p className={`${SECTION_LABEL_CLS} mb-1.5`}>Обкладинка курсу</p>
            <WipSection
              title="Завантаження картинки — у розробці"
              description="Тут буде поле вибору файлу-обкладинки. Поки що курс рендериться з дефолтним фоном."
              compact
            />
          </div>
        </Card>

        <Card variant="surface" padding="md">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className={SECTION_LABEL_CLS}>Юніти ({draftSections.length})</p>
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
              Поки немає юнітів. Додай перший — він стане «Юніт 1». Уроки додаватимуться через
              picker з бібліотеки.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {draftSections.map((s, i) => (
              <SectionRow
                key={s.id ?? `${s.slug}-${i}`}
                section={s}
                index={i}
                total={draftSections.length}
                lessonsBySlug={lessonsBySlug}
                onPatch={(p) => patchSection(i, p)}
                onMoveUp={() => moveSection(i, -1)}
                onMoveDown={() => moveSection(i, +1)}
                onDelete={() => deleteSection(i)}
                onOpenPicker={() => setPickerForSection(i)}
                onRemoveLesson={(li) => removeLesson(i, li)}
                onMoveLesson={(li, dir) => moveLesson(i, li, dir)}
              />
            ))}
          </div>
        </Card>

        <VocabularyAttachSection
          parent="course"
          parentDocumentId={course.documentId}
          parentTitle={course.titleUa || course.title}
          parentLevel={course.level}
        />
      </div>

      <LessonPickerModal
        open={pickerForSection !== null}
        onClose={() => setPickerForSection(null)}
        onConfirm={(slugs) => {
          if (pickerForSection !== null) addLessonsToSection(pickerForSection, slugs);
        }}
        excludedSlugs={pickerSection?.lessonSlugs ?? []}
        currentCourseId={course.documentId}
        defaultLevel={course.level ?? undefined}
        title={pickerSection ? `Додати уроки до «${pickerSection.title}»` : undefined}
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-semibold shadow-card-md">
          {toast}
        </div>
      )}
    </DashboardPageShell>
  );
}

interface Assignment {
  sectionSlug: string;
  orderIndex: number;
}

function sectionsToAssignmentMap(sections: readonly CourseSection[]): Map<string, Assignment> {
  const map = new Map<string, Assignment>();
  for (const sec of sections) {
    sec.lessonSlugs.forEach((slug, idx) => {
      if (slug) map.set(slug, { sectionSlug: sec.slug, orderIndex: idx });
    });
  }
  return map;
}

/**
 * Mirrors `course.sections[].lessonSlugs[]` writes onto each owned lesson's
 * `course` + `sectionSlug` + `orderIndex` fields. Platform/template lessons are
 * skipped (teacher cannot edit them; backend would 403). Failures on individual
 * lesson writes are swallowed so a single 403/permission glitch doesn't undo
 * the section save the user just confirmed.
 */
async function propagateLessonRelations(args: {
  courseId: string;
  oldAssignments: Map<string, Assignment>;
  newAssignments: Map<string, Assignment>;
  lessonsBySlug: Map<string, LibraryLesson>;
}): Promise<void> {
  const { courseId, oldAssignments, newAssignments, lessonsBySlug } = args;
  const writes: Array<Promise<unknown>> = [];

  for (const [slug, next] of newAssignments) {
    const lesson = lessonsBySlug.get(slug);
    if (!lesson || (lesson.source !== 'own' && lesson.source !== 'copy')) continue;
    const old = oldAssignments.get(slug);
    const sameAsServer =
      lesson.courseDocumentId === courseId &&
      lesson.sectionSlug === next.sectionSlug &&
      old?.orderIndex === next.orderIndex;
    if (sameAsServer) continue;
    writes.push(
      updateLesson(lesson.id, {
        course: courseId,
        sectionSlug: next.sectionSlug,
        orderIndex: next.orderIndex,
      }).catch(() => undefined),
    );
  }

  for (const [slug] of oldAssignments) {
    if (newAssignments.has(slug)) continue;
    const lesson = lessonsBySlug.get(slug);
    if (!lesson || (lesson.source !== 'own' && lesson.source !== 'copy')) continue;
    if (lesson.courseDocumentId !== courseId) continue;
    writes.push(
      updateLesson(lesson.id, { course: null, sectionSlug: null, orderIndex: null }).catch(
        () => undefined,
      ),
    );
  }

  await Promise.all(writes);
}

function SectionRow({
  section,
  index,
  total,
  lessonsBySlug,
  onPatch,
  onMoveUp,
  onMoveDown,
  onDelete,
  onOpenPicker,
  onRemoveLesson,
  onMoveLesson,
}: {
  section: CourseSection;
  index: number;
  total: number;
  lessonsBySlug: Map<string, LibraryLesson>;
  onPatch: (patch: Partial<CourseSection>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onOpenPicker: () => void;
  onRemoveLesson: (idx: number) => void;
  onMoveLesson: (idx: number, dir: -1 | 1) => void;
}) {
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
        <p className={SECTION_LABEL_CLS}>Уроки ({section.lessonSlugs.length})</p>
        {section.lessonSlugs.length === 0 && (
          <p className="text-[12px] text-ink-faint">
            Без уроків. Натисни «+ урок» — і обери з бібліотеки.
          </p>
        )}
        {section.lessonSlugs.map((slug, i) => {
          const lesson = lessonsBySlug.get(slug);
          return (
            <div
              key={`${slug}-${i}`}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5"
            >
              <span className="font-medium text-[11.5px] text-ink-faint tabular-nums w-6 text-right">
                {i + 1}.
              </span>
              {lesson ? (
                <Link
                  href={`/dashboard/teacher-library/${lesson.id}/edit`}
                  className="flex-1 min-w-0 text-[13px] font-semibold text-ink hover:underline underline-offset-2 truncate"
                >
                  {lesson.title}
                </Link>
              ) : (
                <span
                  className="flex-1 min-w-0 text-[13px] font-semibold text-ink-muted truncate"
                  title={`Урок «${slug}» не знайдено в бібліотеці`}
                >
                  {slug}
                </span>
              )}
              <button
                type="button"
                onClick={() => onMoveLesson(i, -1)}
                disabled={i === 0}
                className="ios-btn ios-btn-ghost ios-btn-sm disabled:opacity-40"
                aria-label="Вище"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => onMoveLesson(i, +1)}
                disabled={i === section.lessonSlugs.length - 1}
                className="ios-btn ios-btn-ghost ios-btn-sm disabled:opacity-40"
                aria-label="Нижче"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => onRemoveLesson(i)}
                className="ios-btn ios-btn-ghost ios-btn-sm text-danger-dark"
                aria-label="Прибрати"
              >
                ✕
              </button>
            </div>
          );
        })}
        <Button
          onClick={onOpenPicker}
          variant="secondary"
          size="sm"
          className="self-start mt-1"
        >
          + урок з бібліотеки
        </Button>
      </div>
    </div>
  );
}
