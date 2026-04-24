/**
 * Message controller.
 *
 * Scoping:
 *   - admin  — bypass.
 *   - others — must be participant of the message's thread for every op.
 *     - find — requires `filters[thread][documentId][$eq]` (caller validates
 *              membership of that thread); also joined to enforce membership.
 *     - findOne — loads entity, checks caller is in thread.participants.
 *     - create — requires `data.thread`; forces `author` = caller; updates
 *                thread.lastMessageAt + lastMessageBody after create.
 *     - update — author-only; may only toggle `pinned` or push caller into
 *                `readBy`.
 *     - delete — author or admin.
 */
import { factories } from '@strapi/strapi';

const MESSAGE_UID = 'api::message.message';
const THREAD_UID = 'api::thread.thread';
const PROFILE_UID = 'api::user-profile.user-profile';
const TEACHER_UID = 'api::teacher-profile.teacher-profile';
const GROUP_UID = 'api::group.group';
const SESSION_UID = 'api::session.session';

type BroadcastAudience = 'all-students' | 'all-parents' | 'group' | 'level';

function roleType(ctxUser: any): string {
  return (ctxUser?.role?.type ?? '').toLowerCase();
}

async function callerProfileId(strapi: any, userId: number | string): Promise<string | null> {
  const [profile] = await strapi.documents(PROFILE_UID).findMany({
    filters: { user: { id: userId } },
    fields: ['documentId'],
    limit: 1,
  });
  return profile?.documentId ?? null;
}

async function callerTeacherProfileId(strapi: any, userId: number | string): Promise<string | null> {
  const [tp] = await strapi.documents(TEACHER_UID).findMany({
    filters: { user: { user: { id: userId } } },
    fields: ['documentId'],
    limit: 1,
  });
  return tp?.documentId ?? null;
}

async function threadParticipantIds(strapi: any, threadDocId: string): Promise<string[]> {
  const thread = await strapi.documents(THREAD_UID).findOne({
    documentId: threadDocId,
    populate: { participants: { fields: ['documentId'] } },
  });
  if (!thread) return [];
  return ((thread as any).participants ?? [])
    .map((p: any) => p?.documentId)
    .filter((x: unknown): x is string => typeof x === 'string');
}

function extractThreadIdFromQuery(query: any): string | null {
  const filters = query?.filters ?? {};
  const node = filters?.thread?.documentId;
  if (typeof node === 'string') return node;
  if (node && typeof node === 'object') {
    if (typeof node.$eq === 'string') return node.$eq;
  }
  if (typeof filters?.thread === 'string') return filters.thread;
  return null;
}

export default factories.createCoreController(MESSAGE_UID, ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    if (role === 'admin') return (super.find as any)(ctx);

    const profileId = await callerProfileId(strapi, user.id);
    if (!profileId) return ctx.forbidden('no user-profile');

    const threadId = extractThreadIdFromQuery(ctx.query);
    if (!threadId) return ctx.badRequest('filters[thread][documentId] is required');

    const participants = await threadParticipantIds(strapi, threadId);
    if (!participants.includes(profileId)) return ctx.forbidden();

    return (super.find as any)(ctx);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    const entity = await strapi.documents(MESSAGE_UID).findOne({
      documentId: ctx.params.id,
      populate: { thread: { populate: { participants: { fields: ['documentId'] } } } },
    });
    if (!entity) return ctx.notFound();

    if (role === 'admin') return (super.findOne as any)(ctx);

    const profileId = await callerProfileId(strapi, user.id);
    if (!profileId) return ctx.forbidden();
    const ids: string[] = ((entity as any).thread?.participants ?? [])
      .map((p: any) => p?.documentId)
      .filter(Boolean);
    if (!ids.includes(profileId)) return ctx.forbidden();
    return (super.findOne as any)(ctx);
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    const data = ((ctx.request.body as any)?.data ?? {}) as Record<string, unknown>;
    const threadId =
      typeof data.thread === 'string'
        ? data.thread
        : data.thread && typeof data.thread === 'object' && typeof (data.thread as any).documentId === 'string'
          ? (data.thread as any).documentId
          : null;
    if (!threadId) return ctx.badRequest('data.thread is required');
    if (typeof data.body !== 'string' || data.body.trim() === '') {
      return ctx.badRequest('data.body required');
    }

    const profileId = await callerProfileId(strapi, user.id);
    if (!profileId) return ctx.forbidden('no user-profile');

    if (role !== 'admin') {
      const participants = await threadParticipantIds(strapi, threadId);
      if (!participants.includes(profileId)) return ctx.forbidden();
    }

    data.thread = threadId;
    data.author = profileId;
    delete data.readBy;
    delete data.pinned;
    (ctx.request.body as any).data = data;

    const result = await (super.create as any)(ctx);

    // Denormalize lastMessage* on thread.
    const bodyPreview = data.body.toString().slice(0, 280);
    try {
      await strapi.documents(THREAD_UID).update({
        documentId: threadId,
        data: {
          lastMessageAt: new Date().toISOString(),
          lastMessageBody: bodyPreview,
        },
      });
    } catch (err) {
      strapi.log.warn(`[message.create] failed to update thread.lastMessage*: ${(err as Error).message}`);
    }
    return result;
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    const entity = await strapi.documents(MESSAGE_UID).findOne({
      documentId: ctx.params.id,
      populate: {
        author: { fields: ['documentId'] },
        thread: { populate: { participants: { fields: ['documentId'] } } },
      },
    });
    if (!entity) return ctx.notFound();

    if (role === 'admin') return (super.update as any)(ctx);

    const profileId = await callerProfileId(strapi, user.id);
    if (!profileId) return ctx.forbidden();

    const participants: string[] = ((entity as any).thread?.participants ?? [])
      .map((p: any) => p?.documentId)
      .filter(Boolean);
    if (!participants.includes(profileId)) return ctx.forbidden();

    const authorId = (entity as any).author?.documentId ?? null;
    const data = ((ctx.request.body as any)?.data ?? {}) as Record<string, unknown>;

    // readBy: caller may add themselves only (connect).
    if ('readBy' in data) {
      data.readBy = { connect: [profileId] };
    }
    // pinned: only author.
    if ('pinned' in data) {
      if (authorId !== profileId) {
        delete data.pinned;
      } else {
        data.pinned = Boolean(data.pinned);
      }
    }
    // Nothing else may change.
    for (const k of Object.keys(data)) {
      if (k !== 'readBy' && k !== 'pinned') delete data[k];
    }
    (ctx.request.body as any).data = data;
    return (super.update as any)(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    if (role === 'admin') return (super.delete as any)(ctx);

    const entity = await strapi.documents(MESSAGE_UID).findOne({
      documentId: ctx.params.id,
      populate: { author: { fields: ['documentId'] } },
    });
    if (!entity) return ctx.notFound();
    const profileId = await callerProfileId(strapi, user.id);
    if (!profileId || (entity as any).author?.documentId !== profileId) return ctx.forbidden();
    return (super.delete as any)(ctx);
  },

  /**
   * POST /messages/broadcast
   *
   * Teacher-only. Resolves recipient user-profiles server-side (never trust
   * client for recipient list), upserts a 1:1 thread between the teacher and
   * each recipient, then posts the same body into every thread. Threads with
   * `kind: 'parent'` for parent audience, `'student'` otherwise.
   */
  async broadcast(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (roleType(user) !== 'teacher') return ctx.forbidden('teacher role required');

    const body = ((ctx.request.body as any) ?? {}) as Record<string, unknown>;
    const audience = (body.audience as BroadcastAudience) ?? null;
    const text = typeof body.body === 'string' ? body.body.trim() : '';
    const groupId = typeof body.groupId === 'string' ? body.groupId : null;
    const level = typeof body.level === 'string' ? body.level : null;

    if (!audience) return ctx.badRequest('audience required');
    if (!text) return ctx.badRequest('body required');
    if (audience === 'group' && !groupId) return ctx.badRequest('groupId required for group audience');
    if (audience === 'level' && !level) return ctx.badRequest('level required for level audience');
    const LEVEL_ENUM = new Set(['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
    if (audience === 'level' && level && !LEVEL_ENUM.has(level)) {
      return ctx.badRequest('invalid level');
    }

    const teacherProfileId = await callerProfileId(strapi, user.id);
    if (!teacherProfileId) return ctx.forbidden('no user-profile');

    const teacherTpId = await callerTeacherProfileId(strapi, user.id);
    if (!teacherTpId) return ctx.forbidden('no teacher-profile');

    // Discover students the teacher actually teaches (attendees across sessions).
    const mySessions = await strapi.documents(SESSION_UID).findMany({
      filters: { teacher: { documentId: { $eq: teacherTpId } } },
      fields: ['documentId'],
      populate: {
        attendees: {
          fields: ['documentId', 'role'],
          populate: { parentalConsentBy: { fields: ['documentId'] } },
        },
      },
      pagination: { pageSize: 500, page: 1 },
    });

    type Row = { id: string; role: string | null; parentId: string | null };
    const seen = new Map<string, Row>();
    for (const s of mySessions as any[]) {
      for (const a of (s.attendees ?? []) as any[]) {
        if (!a?.documentId || seen.has(a.documentId)) continue;
        seen.set(a.documentId, {
          id: String(a.documentId),
          role: typeof a.role === 'string' ? a.role : null,
          parentId: a?.parentalConsentBy?.documentId ?? null,
        });
      }
    }
    const studentRows = Array.from(seen.values());

    // Resolve recipients per audience.
    let recipientIds: string[] = [];
    let threadKind: 'student' | 'parent' | 'group' = 'student';

    if (audience === 'all-students') {
      recipientIds = studentRows.map(s => s.id);
      threadKind = 'student';
    } else if (audience === 'all-parents') {
      recipientIds = Array.from(
        new Set(studentRows.map(s => s.parentId).filter((x): x is string => typeof x === 'string')),
      );
      threadKind = 'parent';
    } else if (audience === 'group') {
      const group = await strapi.documents(GROUP_UID).findOne({
        documentId: groupId!,
        populate: { members: { fields: ['documentId'] }, teacher: { fields: ['documentId'] } },
      });
      if (!group) return ctx.notFound('group');
      if ((group as any).teacher?.documentId !== teacherTpId) return ctx.forbidden('not your group');
      recipientIds = ((group as any).members ?? [])
        .map((m: any) => m?.documentId)
        .filter((x: unknown): x is string => typeof x === 'string');
      threadKind = 'student';
    } else if (audience === 'level') {
      recipientIds = studentRows
        .filter(s => !!s.id)
        .map(s => s.id);
      // Filter by fetching level on-demand — studentRows didn't capture level, re-query to be safe.
      const profiles = await strapi.documents(PROFILE_UID).findMany({
        filters: {
          documentId: { $in: recipientIds },
          level: { $eq: level as 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' },
        },
        fields: ['documentId'],
        pagination: { pageSize: 500, page: 1 },
      });
      recipientIds = (profiles as any[])
        .map(p => p?.documentId)
        .filter((x: unknown): x is string => typeof x === 'string');
      threadKind = 'student';
    }

    // Drop teacher self (defensive) + duplicates.
    recipientIds = Array.from(new Set(recipientIds.filter(id => id && id !== teacherProfileId)));
    if (recipientIds.length === 0) {
      return ctx.send({ data: { count: 0, threadIds: [], messageIds: [] } });
    }

    // Fetch existing 1:1 threads between teacher and each recipient in one pass.
    const existingThreads = await strapi.documents(THREAD_UID).findMany({
      filters: {
        kind: { $eq: threadKind },
        participants: { documentId: { $eq: teacherProfileId } },
      },
      fields: ['documentId', 'title'],
      populate: { participants: { fields: ['documentId', 'displayName', 'firstName', 'lastName'] } },
      pagination: { pageSize: 1000, page: 1 },
    });

    const teacherRecipThread = new Map<string, string>();
    for (const t of existingThreads as any[]) {
      const parts = ((t.participants ?? []) as any[])
        .map(p => p?.documentId)
        .filter((x: unknown): x is string => typeof x === 'string');
      if (parts.length !== 2) continue;
      const other = parts.find(p => p !== teacherProfileId);
      if (other) teacherRecipThread.set(other, t.documentId);
    }

    // Fetch display names for recipients we need to create threads for.
    const needsThread = recipientIds.filter(r => !teacherRecipThread.has(r));
    const recipProfiles = needsThread.length
      ? await strapi.documents(PROFILE_UID).findMany({
          filters: { documentId: { $in: needsThread } },
          fields: ['documentId', 'displayName', 'firstName', 'lastName'],
          pagination: { pageSize: 500, page: 1 },
        })
      : [];
    const nameById = new Map<string, string>();
    for (const p of recipProfiles as any[]) {
      if (!p?.documentId) continue;
      const display =
        typeof p.displayName === 'string' && p.displayName
          ? p.displayName
          : `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || '—';
      nameById.set(p.documentId, display);
    }

    const createdThreadIds: string[] = [];
    const createdMessageIds: string[] = [];
    const nowIso = new Date().toISOString();
    const bodyPreview = text.slice(0, 280);

    for (const recipientId of recipientIds) {
      let threadId = teacherRecipThread.get(recipientId) ?? null;
      if (!threadId) {
        const title = nameById.get(recipientId) ?? 'Повідомлення';
        const t = await strapi.documents(THREAD_UID).create({
          data: {
            title,
            kind: threadKind,
            participants: [teacherProfileId, recipientId],
            lastMessageAt: nowIso,
            lastMessageBody: bodyPreview,
          } as any,
        });
        threadId = String((t as any).documentId);
        createdThreadIds.push(threadId);
      }

      const m = await strapi.documents(MESSAGE_UID).create({
        data: {
          thread: threadId,
          author: teacherProfileId,
          body: text,
        } as any,
      });
      createdMessageIds.push(String((m as any).documentId));

      try {
        await strapi.documents(THREAD_UID).update({
          documentId: threadId,
          data: { lastMessageAt: nowIso, lastMessageBody: bodyPreview } as any,
        });
      } catch (err) {
        strapi.log.warn(`[message.broadcast] thread.lastMessage* update failed: ${(err as Error).message}`);
      }
    }

    return ctx.send({
      data: {
        count: createdMessageIds.length,
        threadIds: createdThreadIds,
        messageIds: createdMessageIds,
      },
    });
  },
}));
