/**
 * /calendar — particular schedule for parent / student / admin.
 *
 * Renders the shared <Schedule> in read-only mode. BE-scoping
 * (`api::session.session`) handles role visibility:
 *   - student → own sessions (caller is in attendees)
 *   - parent  → sessions where a linked child is in attendees
 *   - admin   → all sessions
 */
'use client';
import { Schedule } from '@/components/schedule/Schedule';

export default function CalendarPage() {
  return <Schedule title="Розклад" editable={false} initialView="week" />;
}
