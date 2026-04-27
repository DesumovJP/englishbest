/**
 * Mini-task attempt controller.
 *
 * Scoping:
 *   - admin    — sees/manages everything via factory CRUD.
 *   - teacher  — `find`/`findOne` scoped to attempts on their own authored
 *                tasks; `update` reviews open-ended attempts (sets score +
 *                feedback). Cannot create attempts.
 *   - student  — `submitMine` (POST /me) creates one; `findMine` (GET /me)
 *                lists own attempts. Cannot read/write others.
 *   - parent   — read-only of their child(ren)'s attempts via standard find
 *                (scoped by `user.parentalConsentBy = caller`).
 *
 * Auto-grade map (by `exercise.type` on the populated mini-task):
 *   - mcq, fill-blank, translate, word-order, match-pairs → graded server-side
 *   - other types (theory, image, video, listening prompts, sentence-builder
 *     free-form) → score=null, status='submitted', awaits teacher review.
 *
 * Coin reward: on the FIRST attempt per (user, task) only, awarded coins =
 * floor(task.coinReward * score / 100). Subsequent attempts: 0 coins (so
 * gamification doesn't farm coins on retries). Coins are written to the
 * caller's `kids-profile.totalCoins` if one exists.
 */
import { factories } from '@strapi/strapi';
import { scopedFind } from '../../../lib/scoped-find';
import { awardOnAction } from '../../../lib/rewards';

const ATTEMPT_UID = 'api::mini-task-attempt.mini-task-attempt';
const TASK_UID = 'api::mini-task.mini-task';
const PROFILE_UID = 'api::user-profile.user-profile';
const TEACHER_UID = 'api::teacher-profile.teacher-profile';

function roleType(u: any): string {
  return (u?.role?.type ?? '').toLowerCase();
}

async function callerProfileId(strapi: any, userId: number | string): Promise<string | null> {
  const [p] = await strapi.documents(PROFILE_UID).findMany({
    filters: { user: { id: userId } },
    fields: ['documentId'],
    limit: 1,
  });
  return p?.documentId ?? null;
}

async function callerTeacherProfileId(strapi: any, userId: number | string): Promise<string | null> {
  const [tp] = await strapi.documents(TEACHER_UID).findMany({
    filters: { user: { user: { id: userId } } },
    fields: ['documentId'],
    limit: 1,
  });
  return tp?.documentId ?? null;
}

async function childProfileIds(strapi: any, parentProfileId: string): Promise<string[]> {
  const kids = await strapi.documents(PROFILE_UID).findMany({
    filters: { parentalConsentBy: { documentId: { $eq: parentProfileId } } },
    fields: ['documentId'],
    limit: 200,
  });
  return kids
    .map((k: any) => k.documentId)
    .filter((x: unknown): x is string => typeof x === 'string');
}

/** Lower-case + trim for forgiving string equality. */
function normStr(v: unknown): string {
  return typeof v === 'string' ? v.trim().toLowerCase() : '';
}

interface GradeOutput {
  score: number | null;
  correct: boolean;
}

/**
 * Auto-grade a single answer against a mini-task's `exercise` component.
 * Returns score in [0..100] or null when the exercise is not auto-gradable.
 */
function gradeExercise(exercise: any, answer: unknown): GradeOutput {
  const t = exercise?.type;
  if (!t) return { score: null, correct: false };
  const correctAnswer = exercise.answer;

  if (t === 'mcq') {
    // MiniTaskBuilder stores `correctAnswer` as either:
    //   - { correct: <text>, correctIndex: <int> }  ← canonical
    //   - <text>                                     ← shorthand
    //   - <int>                                      ← legacy
    //   - <string[]>                                 ← rare multi-correct
    // The FE submits the option's TEXT (see MiniTaskPlayer.buildAnswer).
    // Normalize both sides to a string and compare.
    if (Array.isArray(correctAnswer)) {
      const a = Array.isArray(answer) ? answer : [answer];
      const ok =
        a.length === correctAnswer.length &&
        correctAnswer.every((x: unknown) => a.includes(x));
      return { score: ok ? 100 : 0, correct: ok };
    }
    let canonical: unknown = correctAnswer;
    if (correctAnswer && typeof correctAnswer === 'object') {
      const o = correctAnswer as { correct?: unknown };
      canonical = o.correct;
    }
    const ok = answer === canonical;
    return { score: ok ? 100 : 0, correct: ok };
  }

  if (t === 'fill-blank' || t === 'translate') {
    const a = normStr(answer);
    if (!a) return { score: 0, correct: false };
    const acceptable = Array.isArray(correctAnswer)
      ? correctAnswer.map(normStr)
      : [normStr(correctAnswer)];
    const ok = acceptable.includes(a);
    return { score: ok ? 100 : 0, correct: ok };
  }

  if (t === 'word-order') {
    const a = Array.isArray(answer) ? answer : [];
    const ca = Array.isArray(correctAnswer) ? correctAnswer : [];
    const ok = a.length === ca.length && a.every((w, i) => w === ca[i]);
    return { score: ok ? 100 : 0, correct: ok };
  }

  if (t === 'match-pairs') {
    const a = Array.isArray(answer) ? answer : [];
    const ca = Array.isArray(correctAnswer) ? correctAnswer : [];
    if (ca.length === 0) return { score: 0, correct: false };
    let hits = 0;
    for (const pair of ca) {
      const left = (pair as any)?.left;
      const right = (pair as any)?.right;
      const found = a.find(
        (x: any) => x?.left === left && x?.right === right,
      );
      if (found) hits += 1;
    }
    const score = Math.round((hits / ca.length) * 100);
    return { score, correct: score === 100 };
  }

  // Info / passive types (word-of-day → theory, listening → reading, plus
  // raw image/video/reading/frame): the learner just needs to consume the
  // content. Auto-mark as complete (score=100) so coins flow on the first
  // submission. Teachers can layer a comprehension question on top by
  // editing the exercise into a closed-form type.
  if (t === 'theory' || t === 'reading' || t === 'image' || t === 'video' || t === 'frame') {
    return { score: 100, correct: true };
  }

  // Anything else — defer to teacher review (score=null, status='submitted').
  return { score: null, correct: false };
}

export default factories.createCoreController(ATTEMPT_UID, ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    if (role === 'admin') return (super.find as any)(ctx);

    let scopeFilter: Record<string, unknown>;
    if (role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      if (!teacherId) return ctx.forbidden('no teacher-profile');
      scopeFilter = { task: { author: { documentId: { $eq: teacherId } } } };
    } else if (role === 'parent') {
      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden();
      const kidIds = await childProfileIds(strapi, profileId);
      if (kidIds.length === 0) {
        ctx.body = {
          data: [],
          meta: { pagination: { page: 1, pageSize: 0, pageCount: 0, total: 0 } },
        };
        return;
      }
      scopeFilter = { user: { documentId: { $in: kidIds } } };
    } else {
      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden();
      scopeFilter = { user: { documentId: { $eq: profileId } } };
    }

    return scopedFind(ctx, this, ATTEMPT_UID, scopeFilter, {
      populate: {
        task: {
          fields: ['documentId', 'slug', 'title', 'kind', 'level', 'coinReward'],
        },
        user: {
          fields: ['documentId', 'displayName', 'firstName', 'lastName'],
        },
      },
    });
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    const entity: any = await strapi.documents(ATTEMPT_UID).findOne({
      documentId: ctx.params.id,
      populate: {
        task: { populate: { author: { fields: ['documentId'] } } },
        user: { fields: ['documentId'] },
      },
    });
    if (!entity) return ctx.notFound();

    if (role === 'admin') return (super.findOne as any)(ctx);

    if (role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      const ownerId = entity.task?.author?.documentId ?? null;
      if (!teacherId || ownerId !== teacherId) return ctx.forbidden();
    } else {
      const profileId = await callerProfileId(strapi, user.id);
      const ownerId = entity.user?.documentId ?? null;
      if (!profileId || ownerId !== profileId) return ctx.forbidden();
    }
    return (super.findOne as any)(ctx);
  },

  async findMine(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const profileId = await callerProfileId(strapi, user.id);
    if (!profileId) return ctx.forbidden('no user-profile');
    const attempts = await strapi.documents(ATTEMPT_UID).findMany({
      filters: { user: { documentId: { $eq: profileId } } },
      populate: {
        task: {
          fields: [
            'documentId',
            'slug',
            'title',
            'kind',
            'level',
            'coinReward',
          ],
        },
      },
      sort: { completedAt: 'desc' as any },
      pagination: { pageSize: 200, page: 1 } as any,
    });
    ctx.body = { data: attempts };
  },

  async submitMine(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const profileId = await callerProfileId(strapi, user.id);
    if (!profileId) return ctx.forbidden('no user-profile');

    const data = ((ctx.request.body as any)?.data ?? {}) as Record<string, unknown>;
    const taskId =
      typeof data.task === 'string'
        ? data.task
        : data.task && typeof data.task === 'object' && typeof (data.task as any).documentId === 'string'
          ? (data.task as any).documentId
          : null;
    if (!taskId) return ctx.badRequest('task required');

    const answer = data.answer ?? null;
    const timeSpentSec =
      typeof data.timeSpentSec === 'number' && Number.isFinite(data.timeSpentSec)
        ? Math.max(0, Math.round(data.timeSpentSec))
        : null;

    const task: any = await strapi.documents(TASK_UID).findOne({
      documentId: taskId,
      populate: { exercise: true },
    });
    if (!task) return ctx.notFound('task not found');

    const role = roleType(user);
    if (!task.isPublic && role !== 'admin') {
      return ctx.forbidden('task is not public');
    }

    const { score, correct } = gradeExercise(task.exercise, answer);

    // First-attempt detection — drives whether rewards fire. The rewards
    // service has its own idempotency on the per-(user,task) sourceKey too,
    // so a glitchy retry can't double-credit even if `isFirst` mis-fires.
    const prior = await strapi.documents(ATTEMPT_UID).findMany({
      filters: {
        user: { documentId: { $eq: profileId } },
        task: { documentId: { $eq: taskId } },
      },
      fields: ['documentId'],
      limit: 1,
    });
    const isFirst = prior.length === 0;

    // Bypass `super.create` — its validateInput trips on the `user`
    // relation when the caller (kids/student) lacks `user-profile.find`.
    // Ownership is already enforced (we read `profileId` from the auth
    // session), so it's safe to write through the document service.
    const created = await strapi.documents(ATTEMPT_UID).create({
      data: {
        task: taskId,
        user: profileId,
        answer,
        score,
        correct,
        awardedCoins: 0, // populated below from the rewards service.
        status: score !== null ? 'reviewed' : 'submitted',
        completedAt: new Date().toISOString(),
        timeSpentSec,
      } as any,
    });

    // First passing attempt → fire the rewards pipeline. The attempt is
    // already persisted, so a failure inside the rewards service must NOT
    // 500 the submission (the kid would think their answer was lost). Log
    // and degrade gracefully — the ledger / achievement evaluation will
    // recover on the next earn event.
    let award = null as Awaited<ReturnType<typeof awardOnAction>> | null;
    if (isFirst && score !== null) {
      try {
        award = await awardOnAction(strapi, {
          userProfileId: profileId,
          action: 'minitask',
          sourceKey: `minitask:${profileId}:${taskId}`,
          meta: {
            score,
            coinReward: typeof task.coinReward === 'number' ? task.coinReward : 0,
            taskKind: task.kind,
          },
        });
      } catch (err) {
        strapi.log.error(
          `[mini-task-attempt] reward pipeline failed (user=${profileId}, task=${taskId}): ${(err as Error).message}`,
        );
        award = null;
      }

      if (award?.applied && award.coinsDelta > 0) {
        try {
          await strapi.documents(ATTEMPT_UID).update({
            documentId: (created as any).documentId,
            data: { awardedCoins: award.coinsDelta } as any,
          });
          (created as any).awardedCoins = award.coinsDelta;
        } catch (err) {
          strapi.log.warn(
            `[mini-task-attempt] failed to mirror awardedCoins onto attempt: ${(err as Error).message}`,
          );
        }
      }
    }

    ctx.body = {
      data: {
        ...created,
        awardedCoins: award?.coinsDelta ?? 0,
        score,
        correct,
        isFirstAttempt: isFirst,
        xpDelta: award?.xpDelta ?? 0,
        levelUp: award?.levelUp ?? false,
        level: award?.level ?? null,
        achievementsEarned: award?.achievementsEarned ?? [],
      },
    };
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    if (role !== 'teacher' && role !== 'admin') return ctx.forbidden();

    if (role === 'teacher') {
      const entity: any = await strapi.documents(ATTEMPT_UID).findOne({
        documentId: ctx.params.id,
        populate: { task: { populate: { author: { fields: ['documentId'] } } } },
      });
      if (!entity) return ctx.notFound();
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      const ownerId = entity.task?.author?.documentId ?? null;
      if (!teacherId || ownerId !== teacherId) return ctx.forbidden();

      const data = ((ctx.request.body as any)?.data ?? {}) as Record<string, unknown>;
      // Teachers may only set score / feedback / status — never re-link
      // the attempt to a different task or user.
      const allowed: Record<string, unknown> = { status: 'reviewed' };
      if ('score' in data) allowed.score = data.score;
      if ('teacherFeedback' in data) allowed.teacherFeedback = data.teacherFeedback;
      (ctx.request.body as any).data = allowed;
    }
    return (super.update as any)(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (roleType(user) !== 'admin') return ctx.forbidden();
    return (super.delete as any)(ctx);
  },
}));
