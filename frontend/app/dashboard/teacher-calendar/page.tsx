/**
 * /dashboard/teacher-calendar — teacher's own calendar, live.
 *
 * Renders the shared <Schedule> with editable=true so the teacher can create
 * sessions and act on them via LessonActionSheet. Same component is used by
 * /calendar (parent/student) in read-only mode.
 */
'use client';
import { Schedule } from '@/components/schedule/Schedule';

export default function TeacherCalendarPage() {
  return <Schedule title="Розклад вчителя" editable initialView="week" />;
}
