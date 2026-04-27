/**
 * Teacher ↔ student relationship helpers.
 *
 * The system has no formal `teacher.students` relation; the de-facto link
 * lives in `session.attendees` — a teacher "teaches" a student if at
 * least one session that the teacher owns lists that student as an
 * attendee. This module wraps the lookup so every controller that needs
 * to gate teacher access (motivationSummary, attempts, achievements,
 * future weekly summaries) reads the same set.
 *
 * Cache: callers usually need the set ONCE per request (one teacher
 * inspecting one student detail). We don't memoise across requests since
 * the membership changes whenever a session is created / cancelled —
 * cheap to recompute on each call.
 */

const SESSION_UID = 'api::session.session';

/** Returns the documentIds of student profiles the teacher has at least
 *  one session with. Empty array when the teacher has no sessions yet. */
export async function teacherStudentIds(
  strapi: any,
  teacherProfileDocumentId: string,
): Promise<string[]> {
  const sessions = await strapi.documents(SESSION_UID).findMany({
    filters: { teacher: { documentId: { $eq: teacherProfileDocumentId } } },
    fields: ['documentId'],
    populate: { attendees: { fields: ['documentId'] } },
    pagination: { pageSize: 500, page: 1 },
  });

  const ids = new Set<string>();
  for (const s of sessions as any[]) {
    for (const a of (s.attendees ?? []) as any[]) {
      if (typeof a?.documentId === 'string') ids.add(a.documentId);
    }
  }
  return Array.from(ids);
}

/** True when the given studentId is in the teacher's student set.
 *  Cheap-path optimisation: empty teacher → always false; same-id
 *  shortcut not needed since teachers and students live in the same
 *  user-profile table but with different roles. */
export async function teacherTeachesStudent(
  strapi: any,
  teacherProfileDocumentId: string,
  studentProfileDocumentId: string,
): Promise<boolean> {
  if (!teacherProfileDocumentId || !studentProfileDocumentId) return false;
  const ids = await teacherStudentIds(strapi, teacherProfileDocumentId);
  return ids.includes(studentProfileDocumentId);
}
