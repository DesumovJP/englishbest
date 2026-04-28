/**
 * Vocabulary-set controller — scoped (mirrors lesson controller).
 *
 * Phase L3 closure of CONTENT_LIFECYCLE_PLAN.md. Replaces the previous
 * 3-line default-controller stub which let any STAFF role mutate any
 * vocab set in the DB.
 *
 * Scoping (mirrors `api::lesson.lesson` semantics):
 *   - admin    — full bypass, sees and mutates any row.
 *   - teacher  — sees own (owner=mine) + public sources (platform,
 *                template). `owner` is forced to caller's teacher-
 *                profile on create; `owner` + `source` are immutable on
 *                update. Cannot edit/delete `source=platform` rows
 *                (must clone first via POST with source='copy').
 *   - learners — sees public sources only.
 *
 * Cloning is handled by the regular `create` action with
 * `source: 'copy'` + `originalVocabularySet: <docId>` in the payload —
 * mirrors the lesson clone flow, no custom action needed.
 *
 * Publish/unpublish lift the row out of Strapi's draft state so kids /
 * public catalogs can see it. Owner-only or admin (same gate as lesson).
 *
 * Audit: delete + publish + unpublish + (future) submit/approve/reject
 * write to `api::audit-log` via `lib/audit.writeAudit`.
 */
import { factories } from '@strapi/strapi';
import { scopedFind } from '../../../lib/scoped-find';
import { writeAudit } from '../../../lib/audit';
import {
  approveContent,
  rejectContent,
  submitContent,
} from '../../../lib/content-moderation';

const VOCAB_UID = 'api::vocabulary-set.vocabulary-set';
const LESSON_UID = 'api::lesson.lesson';
const TEACHER_UID = 'api::teacher-profile.teacher-profile';
const PUBLIC_SOURCES = ['platform', 'template'] as const;
const MAX_WORDS = 200;

interface RawWord {
  word?: unknown;
  translation?: unknown;
  example?: unknown;
  exampleTranslation?: unknown;
  partOfSpeech?: unknown;
}

/**
 * Trim + dedupe + cap word list. Keeps the first occurrence of each
 * `word` (case-insensitive), strips empty rows, hard-caps at MAX_WORDS.
 * Pure function — returns a new array, doesn't touch the caller's payload
 * until the controller writes it back.
 */
function normalizeWords(input: unknown): RawWord[] | null {
  if (input === undefined) return null; // caller didn't include `words`
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const out: RawWord[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') continue;
    const r = raw as RawWord;
    const word = typeof r.word === 'string' ? r.word.trim() : '';
    const translation = typeof r.translation === 'string' ? r.translation.trim() : '';
    if (!word && !translation) continue;
    const key = word.toLowerCase();
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    out.push({
      word,
      translation,
      example: typeof r.example === 'string' ? r.example.trim() : undefined,
      exampleTranslation:
        typeof r.exampleTranslation === 'string' ? r.exampleTranslation.trim() : undefined,
      partOfSpeech:
        typeof r.partOfSpeech === 'string' ? r.partOfSpeech.trim() : undefined,
    });
    if (out.length >= MAX_WORDS) break;
  }
  return out;
}

/**
 * Force vocab.course to match vocab.lesson.course when a lesson is
 * attached — closes the inconsistency described in
 * CONTENT_LIFECYCLE_PLAN.md §4.4. If `lesson` is set in the patch but
 * `course` isn't, derives course; if both are set and disagree, lesson
 * wins (server overrides client to keep the data clean).
 */
async function enforceCourseLessonConsistency(
  strapi: any,
  data: Record<string, unknown>,
): Promise<void> {
  const lessonId = data.lesson;
  if (!lessonId || typeof lessonId !== 'string') return;
  const lesson = await strapi.documents(LESSON_UID).findOne({
    documentId: lessonId,
    populate: { course: { fields: ['documentId'] } },
  });
  const lessonCourseId = (lesson as { course?: { documentId?: string } } | null)
    ?.course?.documentId ?? null;
  if (lessonCourseId) {
    data.course = lessonCourseId;
  }
}

function roleType(ctxUser: any): string {
  return (ctxUser?.role?.type ?? '').toLowerCase();
}

async function callerTeacherProfileId(strapi: any, userId: number | string): Promise<string | null> {
  const [tp] = await strapi.documents(TEACHER_UID).findMany({
    filters: { user: { user: { id: userId } } },
    fields: ['documentId'],
    limit: 1,
  });
  return tp?.documentId ?? null;
}

export default factories.createCoreController(VOCAB_UID as any, ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    const role = roleType(user);

    if (role === 'admin') return (super.find as any)(ctx);

    let scopeFilter: Record<string, unknown>;
    if (user && role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      if (!teacherId) return ctx.forbidden('no teacher-profile');
      scopeFilter = {
        $or: [
          { owner: { documentId: { $eq: teacherId } } },
          { source: { $in: PUBLIC_SOURCES as unknown as string[] } },
          // Orphans (no owner — pre-backfill seed data, or admin-created
          // without an owner) fall through as visible. They behave like
          // platform content for this caller. Tighten later via a
          // dedicated «adopt orphan» flow once backfill is verified.
          { owner: { $null: true } },
        ],
      };
    } else {
      scopeFilter = {
        $or: [
          { source: { $in: PUBLIC_SOURCES as unknown as string[] } },
          { owner: { $null: true } },
        ],
      };
    }
    return scopedFind(ctx, this, VOCAB_UID as any, scopeFilter);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    const role = roleType(user);

    const entity = await (strapi as any).documents(VOCAB_UID).findOne({
      documentId: ctx.params.id,
      populate: { owner: true },
    });
    if (!entity) return ctx.notFound();

    if (role === 'admin') return (super.findOne as any)(ctx);

    const source = (entity as any).source;
    const ownerId = (entity as any).owner?.documentId ?? null;
    const isOrphan = ownerId === null;
    const isPublic = (PUBLIC_SOURCES as readonly string[]).includes(source);

    if (user && role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      const mine = teacherId && ownerId === teacherId;
      // Orphan rows visible to staff during the migration window
      // (mirrors the find-scope above).
      if (!mine && !isPublic && !isOrphan) return ctx.forbidden();
    } else {
      if (!isPublic && !isOrphan) return ctx.forbidden();
    }
    return (super.findOne as any)(ctx);
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    if (role !== 'teacher' && role !== 'admin') return ctx.forbidden();

    ctx.request.body = ctx.request.body || {};
    const data = ((ctx.request.body as any).data ?? {}) as Record<string, unknown>;

    // Word normalization — applied to teacher + admin equally so the
    // data shape stays consistent regardless of caller.
    const cleanedWords = normalizeWords(data.words);
    if (cleanedWords !== null) data.words = cleanedWords;

    // Force course to match lesson's course when the set is lesson-scoped.
    await enforceCourseLessonConsistency(strapi, data);

    if (role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      if (!teacherId) return ctx.forbidden('no teacher-profile');

      // Teachers can only mark new sets as their own ('own') or as
      // copies of platform/template sets ('copy'). Anything else gets
      // coerced to 'own' so a teacher can't fabricate platform content.
      const requestedSource = typeof data.source === 'string' ? data.source : 'own';
      const source = requestedSource === 'copy' ? 'copy' : 'own';

      data.owner = teacherId;
      data.source = source;
    }
    (ctx.request.body as any).data = data;
    // Admin: trust the rest of the payload (admin may legitimately create
    // platform/template-source sets and own them or leave owner null).
    return (super.create as any)(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    if (role !== 'teacher' && role !== 'admin') return ctx.forbidden();

    if (role === 'teacher') {
      const existing = await (strapi as any).documents(VOCAB_UID).findOne({
        documentId: ctx.params.id,
        populate: { owner: true },
      });
      if (!existing) return ctx.notFound();
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      const ownerId = (existing as any).owner?.documentId ?? null;
      if (!teacherId || ownerId !== teacherId) return ctx.forbidden();
      if ((existing as any).source === 'platform') {
        return ctx.forbidden('platform vocab is read-only — clone first');
      }

      const data = (ctx.request.body as any)?.data ?? {};
      delete data.owner;
      delete data.source;
      delete data.originalVocabularySet;
      (ctx.request.body as any).data = data;
    }

    // Apply normalization on update too — words may have been edited.
    const data = ((ctx.request.body as any).data ?? {}) as Record<string, unknown>;
    const cleanedWords = normalizeWords(data.words);
    if (cleanedWords !== null) data.words = cleanedWords;
    await enforceCourseLessonConsistency(strapi, data);
    (ctx.request.body as any).data = data;
    return (super.update as any)(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    if (role !== 'teacher' && role !== 'admin') return ctx.forbidden();

    const existing = await (strapi as any).documents(VOCAB_UID).findOne({
      documentId: ctx.params.id,
      populate: { owner: true },
    });
    if (!existing) return ctx.notFound();

    if (role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      const ownerId = (existing as any).owner?.documentId ?? null;
      if (!teacherId || ownerId !== teacherId) return ctx.forbidden();
      if ((existing as any).source === 'platform') {
        return ctx.forbidden('cannot delete platform vocab');
      }
    }
    const result = await (super.delete as any)(ctx);
    await writeAudit(strapi, ctx, {
      action: 'delete',
      entityType: VOCAB_UID,
      entityId: ctx.params.id,
      before: existing,
    });
    return result;
  },

  async publish(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    if (role !== 'teacher' && role !== 'admin') return ctx.forbidden();

    const existing = await (strapi as any).documents(VOCAB_UID).findOne({
      documentId: ctx.params.id,
      populate: { owner: true },
    });
    if (!existing) return ctx.notFound();

    if (role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      const ownerId = (existing as any).owner?.documentId ?? null;
      if (!teacherId || ownerId !== teacherId) return ctx.forbidden();
      if ((existing as any).source === 'platform') {
        return ctx.forbidden('platform vocab is managed by admin');
      }
    }

    await (strapi as any).documents(VOCAB_UID).publish({ documentId: ctx.params.id });
    const fresh = await (strapi as any).documents(VOCAB_UID).findOne({
      documentId: ctx.params.id,
      populate: { owner: true },
    });
    await writeAudit(strapi, ctx, {
      action: 'publish',
      entityType: VOCAB_UID,
      entityId: ctx.params.id,
      before: existing,
      after: fresh,
    });
    return { data: fresh };
  },

  async unpublish(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    if (role !== 'teacher' && role !== 'admin') return ctx.forbidden();

    const existing = await (strapi as any).documents(VOCAB_UID).findOne({
      documentId: ctx.params.id,
      populate: { owner: true },
    });
    if (!existing) return ctx.notFound();

    if (role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      const ownerId = (existing as any).owner?.documentId ?? null;
      if (!teacherId || ownerId !== teacherId) return ctx.forbidden();
      if ((existing as any).source === 'platform') {
        return ctx.forbidden('platform vocab is managed by admin');
      }
    }

    await (strapi as any).documents(VOCAB_UID).unpublish({ documentId: ctx.params.id });
    const fresh = await (strapi as any).documents(VOCAB_UID).findOne({
      documentId: ctx.params.id,
      populate: { owner: true },
      status: 'draft',
    });
    await writeAudit(strapi, ctx, {
      action: 'unpublish',
      entityType: VOCAB_UID,
      entityId: ctx.params.id,
      before: existing,
      after: fresh,
    });
    return { data: fresh };
  },

  async submit(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    if (role !== 'teacher' && role !== 'admin') return ctx.forbidden();

    const existing = await (strapi as any).documents(VOCAB_UID).findOne({
      documentId: ctx.params.id,
      populate: { owner: true },
    });
    if (!existing) return ctx.notFound();

    return submitContent({
      strapi,
      ctx,
      uid: VOCAB_UID,
      existing: existing as any,
      callerTeacherProfileId: await callerTeacherProfileId(strapi, user.id),
      isAdmin: role === 'admin',
    });
  },

  async approve(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (roleType(user) !== 'admin') return ctx.forbidden();

    const existing = await (strapi as any).documents(VOCAB_UID).findOne({
      documentId: ctx.params.id,
      populate: { owner: true },
    });
    if (!existing) return ctx.notFound();

    return approveContent({
      strapi,
      ctx,
      uid: VOCAB_UID,
      existing: existing as any,
      isAdmin: true,
    });
  },

  async reject(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (roleType(user) !== 'admin') return ctx.forbidden();

    const existing = await (strapi as any).documents(VOCAB_UID).findOne({
      documentId: ctx.params.id,
      populate: { owner: true },
    });
    if (!existing) return ctx.notFound();

    const reason = ((ctx.request.body as any)?.data?.reason ?? '') as string;
    return rejectContent({
      strapi,
      ctx,
      uid: VOCAB_UID,
      existing: existing as any,
      isAdmin: true,
      reason,
    });
  },
}));
