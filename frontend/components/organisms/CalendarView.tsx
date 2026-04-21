'use client';
import { useState } from 'react';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/atoms/Modal';
import type { CalendarSession } from '@/lib/mockClient';

interface CalendarViewProps {
  userSlug: string;
  sessions: CalendarSession[];
}

export function CalendarView({ sessions }: CalendarViewProps) {
  const [view, setView] = useState<'month' | 'week'>('month');
  const [joinModal, setJoinModal] = useState<CalendarSession | null>(null);

  const upcoming = sessions.filter(s => s.status === 'upcoming');
  const past = sessions.filter(s => s.status === 'completed');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-ink">Calendar</h1>
        <div className="flex gap-2 bg-surface-muted p-1 rounded-md">
          {(['month', 'week'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-sm text-sm font-semibold capitalize transition-colors ${
                view === v ? 'bg-white shadow text-ink' : 'text-ink-muted'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming sessions */}
      <section aria-labelledby="upcoming-heading">
        <h2 id="upcoming-heading" className="text-lg font-bold text-ink mb-3">Upcoming Sessions</h2>
        {upcoming.length === 0 ? (
          <p className="text-ink-muted">No upcoming sessions scheduled.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {upcoming.map(session => (
              <div
                key={session.documentId}
                className="bg-white rounded-lg p-4 border border-border flex items-center justify-between gap-4 flex-wrap"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={session.type === 'group' ? 'info' : 'success'}>
                      {session.type === 'group' ? '👥 Group' : '👤 1-on-1'}
                    </Badge>
                    <span className="font-bold text-ink">{session.title}</span>
                  </div>
                  <p className="text-sm text-ink-muted">
                    📅 {session.date} at {session.time} · {session.duration} min
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setJoinModal(session)}
                  aria-label={`Join session ${session.title}`}
                >
                  🎥 Join
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past sessions */}
      <section aria-labelledby="past-heading">
        <h2 id="past-heading" className="text-lg font-bold text-ink mb-3">Past Sessions</h2>
        {past.length === 0 ? (
          <p className="text-ink-muted">No past sessions.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {past.map(session => (
              <div
                key={session.documentId}
                className="bg-surface-muted rounded-lg p-4 border border-border flex items-center justify-between gap-4 flex-wrap opacity-80"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-ink">{session.title}</span>
                  <p className="text-sm text-ink-muted">📅 {session.date} at {session.time}</p>
                </div>
                {session.grade !== undefined && (
                  <Badge variant="success">Grade: {session.grade}%</Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Join modal */}
      <Modal isOpen={!!joinModal} onClose={() => setJoinModal(null)} title="Join Live Lesson">
        {joinModal && (
          <div className="flex flex-col gap-4 text-center">
            <p className="text-5xl">🎥</p>
            <h3 className="text-xl font-bold">{joinModal.title}</h3>
            <p className="text-ink-muted">{joinModal.date} at {joinModal.time} · {joinModal.duration} min</p>
            <Button size="lg" onClick={() => setJoinModal(null)} aria-label="Enter classroom">
              Enter Classroom →
            </Button>
            <button
              onClick={() => setJoinModal(null)}
              className="text-sm text-ink-muted hover:underline"
            >
              Reschedule
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
