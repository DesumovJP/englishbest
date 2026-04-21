'use client';
import { useState } from 'react';

const MONTHS   = ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'];
const WEEKDAYS = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'];

export function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
export function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
export function getFirstDayOfWeek(y: number, m: number) {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1;
}
export function todayStr() {
  const t = new Date();
  return toDateStr(t.getFullYear(), t.getMonth(), t.getDate());
}

export interface DayMeta {
  dateStr: string;
  day: number;
  isToday: boolean;
  isWeekend: boolean;
}

interface CalendarGridProps {
  initialYear?: number;
  initialMonth?: number;
  onMonthChange?: (year: number, month: number) => void;
  onDayClick?: (dateStr: string) => void;
  renderDay: (meta: DayMeta) => React.ReactNode;
  footer?: React.ReactNode;
}

export function CalendarGrid({
  initialYear = new Date().getFullYear(),
  initialMonth = new Date().getMonth(),
  onMonthChange,
  onDayClick,
  renderDay,
  footer,
}: CalendarGridProps) {
  const [year,  setYear]  = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  function prevMonth() {
    const [ny, nm] = month === 0 ? [year - 1, 11] : [year, month - 1];
    setYear(ny); setMonth(nm);
    onMonthChange?.(ny, nm);
  }
  function nextMonth() {
    const [ny, nm] = month === 11 ? [year + 1, 0] : [year, month + 1];
    setYear(ny); setMonth(nm);
    onMonthChange?.(ny, nm);
  }
  function goToday() {
    const t = new Date();
    setYear(t.getFullYear()); setMonth(t.getMonth());
    onMonthChange?.(t.getFullYear(), t.getMonth());
  }

  const daysInMonth  = getDaysInMonth(year, month);
  const firstWeekDay = getFirstDayOfWeek(year, month);
  const today        = todayStr();

  const cells: (number | null)[] = [
    ...Array(firstWeekDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-white rounded-[14px] border border-border overflow-hidden">

      {/* Month header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            aria-label="Попередній місяць"
            className="w-7 h-7 rounded-md flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={nextMonth}
            aria-label="Наступний місяць"
            className="w-7 h-7 rounded-md flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
        <h2 className="text-[14px] font-semibold text-ink tabular-nums">{MONTHS[month]} {year}</h2>
        <button
          onClick={goToday}
          className="text-[11px] font-semibold text-ink-muted hover:text-ink px-2 h-7 rounded-md hover:bg-surface-muted transition-colors"
        >
          Сьогодні
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border bg-surface-muted/30">
        {WEEKDAYS.map(d => (
          <div key={d} className="py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="min-h-[64px] md:min-h-[88px] border-b border-r border-border last:border-r-0 bg-surface-muted/20" />;
          }
          const dateStr  = toDateStr(year, month, day);
          const isToday  = dateStr === today;
          const isWeekend = (idx % 7) >= 5;

          return (
            <div
              key={dateStr}
              onClick={onDayClick ? () => onDayClick(dateStr) : undefined}
              role={onDayClick ? 'button' : undefined}
              tabIndex={onDayClick ? 0 : undefined}
              className={`min-h-[64px] md:min-h-[88px] border-b border-r border-border last:border-r-0 ${
                isWeekend ? 'bg-surface-muted/20' : 'bg-white'
              } ${onDayClick ? 'hover:bg-surface-muted/50 transition-colors cursor-pointer' : ''}`}
            >
              <div className="flex justify-between items-start px-2 pt-1.5">
                <span className={`text-[11px] font-medium tabular-nums ${
                  isToday
                    ? 'w-5 h-5 inline-flex items-center justify-center rounded-full bg-primary text-white'
                    : isWeekend ? 'text-ink-muted' : 'text-ink'
                }`}>
                  {day}
                </span>
              </div>
              <div className="px-1.5 pb-1.5 pt-1 flex flex-col gap-1">
                {renderDay({ dateStr, day, isToday, isWeekend })}
              </div>
            </div>
          );
        })}
      </div>

      {footer && (
        <div className="border-t border-border">{footer}</div>
      )}
    </div>
  );
}
