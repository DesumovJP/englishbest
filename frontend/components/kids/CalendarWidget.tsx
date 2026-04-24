/**
 * CalendarWidget — "today + upcoming sessions" HUD surface.
 *
 * Mini card for the kids dashboard top-left. Shows the current date, labels
 * the weekday, and lists up to three upcoming live sessions pulled from
 * `fetchSessions`. Tap → `/calendar` full view.
 */
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HudCard } from '@/components/kids/ui';
import { fetchSessions, type Session } from '@/lib/sessions';

const MONTHS_UA = [
  'Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер',
  'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру',
];
const WEEKDAYS_UA = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

function formatSessionTime(startAt: string): string {
  const d = new Date(startAt);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatSessionDay(startAt: string, todayISO: string): string {
  const d = new Date(startAt);
  if (Number.isNaN(d.getTime())) return '';
  const iso = d.toISOString().slice(0, 10);
  if (iso === todayISO) return 'Сьогодні';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())} ${MONTHS_UA[d.getMonth()]}`;
}

export function CalendarWidget() {
  const [sessions, setSessions] = useState<Session[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetchSessions()
      .then(rows => {
        if (!alive) return;
        setSessions(rows);
      })
      .catch(() => {
        if (!alive) return;
        setSessions([]);
      });
    return () => { alive = false; };
  }, []);

  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);
  const dayNum = today.getDate();
  const monthAbbr = MONTHS_UA[today.getMonth()];
  const weekday = WEEKDAYS_UA[today.getDay()];

  const upcoming = (sessions ?? [])
    .filter(s => s.status === 'scheduled' || s.status === 'live')
    .filter(s => !!s.startAt && new Date(s.startAt).getTime() >= Date.now() - 60 * 60 * 1000)
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
    .slice(0, 3);

  return (
    <Link href="/calendar" className="block w-full text-left active:scale-[0.97] transition-transform">
      <HudCard className="p-2.5 sm:p-3.5 overflow-hidden">
        <div className="flex items-center gap-2 sm:gap-2.5 mb-2 sm:mb-2.5">
          <div className="flex flex-col items-center justify-center rounded-lg sm:rounded-xl flex-shrink-0 w-[36px] h-[36px] sm:w-[46px] sm:h-[46px] bg-danger shadow-press-danger">
            <span className="font-black text-white leading-none text-[15px] sm:text-[20px]">{dayNum}</span>
            <span className="font-bold text-white/85 leading-none text-[7px] sm:text-[8px]">{monthAbbr}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black leading-none text-[12px] sm:text-[15px] text-ink">Розклад</p>
            <p className="font-medium text-[9.5px] sm:text-[11px] text-ink-muted mt-0.5 truncate">{weekday}, сьогодні</p>
          </div>
          <span className="text-ink-muted text-sm">›</span>
        </div>

        {sessions === null ? (
          <div className="flex flex-col gap-1.5 [@media(max-height:500px)]:hidden">
            <div className="h-2.5 w-full rounded bg-ink-faint/15 animate-pulse" />
            <div className="h-2.5 w-3/4 rounded bg-ink-faint/15 animate-pulse" />
          </div>
        ) : upcoming.length === 0 ? (
          <p className="font-medium text-[10.5px] sm:text-[11.5px] text-ink-faint [@media(max-height:500px)]:hidden">
            Поки подій немає
          </p>
        ) : (
          <div className="flex flex-col gap-1.5 [@media(max-height:500px)]:hidden">
            {upcoming.map(ev => (
              <div key={ev.documentId} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0 bg-primary" />
                <p className="font-bold truncate text-[11.5px] text-ink flex-1">{ev.title || 'Заняття'}</p>
                <p className="font-bold flex-shrink-0 text-[11px] text-ink-muted">
                  {formatSessionDay(ev.startAt, todayISO)} · {formatSessionTime(ev.startAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </HudCard>
    </Link>
  );
}
