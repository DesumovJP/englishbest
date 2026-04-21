'use client';
import { useState } from 'react';
import { CalendarGrid } from '@/components/molecules/CalendarGrid';

/* ─── Типи ───────────────────────────────────── */
interface CalEvent {
  id: string;
  date: string;
  time: string;
  title: string;
  teacher: string;
  status: 'upcoming' | 'completed';
  level: string;
  levelColor: string;
}

/* ─── Мок-події ──────────────────────────────── */
const EVENTS: CalEvent[] = [
  { id: '1',  date: '2026-03-28', time: '18:00', title: 'Animals & Colors',       teacher: 'Olga K.',   status: 'completed', level: 'A0', levelColor: 'bg-danger' },
  { id: '2',  date: '2026-03-30', time: '17:00', title: 'Hello & Goodbye',        teacher: 'Olga K.',   status: 'completed', level: 'A0', levelColor: 'bg-danger' },
  { id: '3',  date: '2026-04-01', time: '18:00', title: 'Grammar Review',         teacher: 'Maria S.',  status: 'completed', level: 'A1', levelColor: 'bg-accent' },
  { id: '4',  date: '2026-04-02', time: '18:00', title: 'Present Simple',         teacher: 'Maria S.',  status: 'upcoming',  level: 'A1', levelColor: 'bg-accent' },
  { id: '5',  date: '2026-04-04', time: '17:00', title: 'Food & Drinks',          teacher: 'Maria S.',  status: 'upcoming',  level: 'A1', levelColor: 'bg-accent' },
  { id: '6',  date: '2026-04-06', time: '11:00', title: 'Reading Comprehension',  teacher: 'Dmytro P.', status: 'upcoming',  level: 'B1', levelColor: 'bg-success' },
  { id: '7',  date: '2026-04-09', time: '18:00', title: 'Daily Routines',         teacher: 'Maria S.',  status: 'upcoming',  level: 'A1', levelColor: 'bg-accent' },
  { id: '8',  date: '2026-04-11', time: '17:30', title: 'My House & Family',      teacher: 'Maria S.',  status: 'upcoming',  level: 'A1', levelColor: 'bg-accent' },
  { id: '9',  date: '2026-04-14', time: '18:00', title: 'Business English',       teacher: 'Anna V.',   status: 'upcoming',  level: 'B2', levelColor: 'bg-purple' },
  { id: '10', date: '2026-04-16', time: '17:00', title: 'Present Simple — Тест', teacher: 'Maria S.',  status: 'upcoming',  level: 'A1', levelColor: 'bg-accent' },
  { id: '11', date: '2026-04-23', time: '18:00', title: 'School & Exams',        teacher: 'Dmytro P.', status: 'upcoming',  level: 'B1', levelColor: 'bg-success' },
  { id: '12', date: '2026-04-28', time: '17:00', title: 'Certificates Prep',     teacher: 'Anna V.',   status: 'upcoming',  level: 'B2', levelColor: 'bg-purple' },
];

/* ─── Компонент ──────────────────────────────── */
export default function CalendarPage() {
  const [selected, setSelected] = useState<CalEvent | null>(null);

  const upcomingCount  = EVENTS.filter(e => e.status === 'upcoming').length;
  const completedCount = EVENTS.filter(e => e.status === 'completed').length;

  function eventsForDate(dateStr: string) {
    return EVENTS.filter(e => e.date === dateStr);
  }

  return (
    <div className="flex flex-col gap-5 max-w-4xl">

      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-black text-ink">Календар</h1>
        <p className="text-ink-muted mt-0.5 text-sm">
          <span className="font-semibold text-primary-dark">{upcomingCount} запланованих</span>
          {' · '}{completedCount} завершених
        </p>
      </div>

      {/* Сітка */}
      <CalendarGrid
        initialYear={2026}
        initialMonth={3}
        renderDay={({ dateStr }) => {
          const dayEvents = eventsForDate(dateStr);
          return (
            <>
              {dayEvents.slice(0, 2).map(ev => (
                <button
                  key={ev.id}
                  onClick={() => setSelected(ev)}
                  className={`w-full text-left px-1.5 py-1 rounded-lg text-xs font-bold leading-tight truncate transition-opacity hover:opacity-80 ${
                    ev.status === 'completed' ? 'bg-surface-muted text-ink-muted' : `${ev.levelColor} text-white`
                  }`}
                >
                  {ev.time} {ev.title}
                </button>
              ))}
              {dayEvents.length > 2 && (
                <span className="text-xs text-ink-muted font-semibold">+{dayEvents.length - 2}</span>
              )}
            </>
          );
        }}
        footer={
          <div className="flex items-center gap-4 px-5 py-3 bg-surface-muted flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-ink-muted"><span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />Запланований</div>
            <div className="flex items-center gap-1.5 text-xs text-ink-muted"><span className="w-2.5 h-2.5 rounded-full bg-surface-muted border border-border flex-shrink-0" />Завершений</div>
            <div className="flex items-center gap-1.5 text-xs text-ink-muted"><span className="w-2.5 h-2.5 rounded-full bg-secondary flex-shrink-0" />Сьогодні</div>
          </div>
        }
      />

      {/* Попап */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-5" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${selected.levelColor}`}>{selected.level}</span>
                <h3 className="font-black text-ink text-lg mt-2">{selected.title}</h3>
                <p className="text-sm text-ink-muted">{selected.teacher}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-ink-muted hover:text-ink flex-shrink-0 mt-1">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex flex-col gap-2 text-sm text-ink-muted">
              <div className="flex items-center gap-2"><span>📅</span><span>{selected.date} о {selected.time}</span></div>
              <div className="flex items-center gap-2">
                <span>🟢</span>
                <span className={`font-semibold ${selected.status === 'completed' ? 'text-ink-muted' : 'text-primary-dark'}`}>
                  {selected.status === 'completed' ? 'Завершено' : 'Заплановано'}
                </span>
              </div>
            </div>
            {selected.status === 'upcoming' && (
              <button className="w-full py-3 rounded-xl font-black text-sm bg-gradient-to-br from-primary to-primary-dark text-white hover:opacity-90 transition-opacity">
                Приєднатись до уроку →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
