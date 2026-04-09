'use client';
import { useState } from 'react';
import { CalendarGrid, toDateStr, todayStr } from '@/components/molecules/CalendarGrid';

/* ─── Типи ───────────────────────────────────── */
type EventType = 'salary' | 'meeting' | 'webinar' | 'report' | 'event';

interface AdminEvent {
  id: string;
  date: string;
  time?: string;
  title: string;
  type: EventType;
  desc?: string;
  audience?: string;
}

/* ─── Конфіг ─────────────────────────────────── */
const EVENT_CONFIG: Record<EventType, { label: string; emoji: string; color: string; bg: string; dot: string }> = {
  salary:  { label: 'Виплата ЗП',  emoji: '💰', color: 'text-accent-dark',    bg: 'bg-accent/15',    dot: 'bg-accent' },
  meeting: { label: 'Нарада',      emoji: '📋', color: 'text-purple-dark',    bg: 'bg-purple/15',    dot: 'bg-purple' },
  webinar: { label: 'Вебінар',     emoji: '🎓', color: 'text-secondary-dark', bg: 'bg-secondary/15', dot: 'bg-secondary' },
  report:  { label: 'Звіт',        emoji: '📊', color: 'text-success-dark',   bg: 'bg-success/15',   dot: 'bg-success' },
  event:   { label: 'Подія',       emoji: '🎉', color: 'text-danger-dark',    bg: 'bg-danger/15',    dot: 'bg-danger' },
};

const MONTHS = ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'];

function fmtDate(ds: string) {
  const [y, m, d] = ds.split('-');
  return `${d} ${MONTHS[parseInt(m) - 1]} ${y}`;
}

/* ─── Мок-дані ───────────────────────────────── */
const INIT_EVENTS: AdminEvent[] = [
  { id: 'e1', date: '2026-04-05', title: 'Виплата зарплат — квітень',    type: 'salary',  desc: 'Автоматичні виплати на рахунки вчителів. Загальна сума: ₴ 42 820.', audience: 'Всі вчителі' },
  { id: 'e2', date: '2026-04-10', time: '18:00', title: 'Нарада вчителів',           type: 'meeting', desc: 'Обговорення нових стандартів оцінювання та оновлення регламенту.', audience: 'Всі вчителі' },
  { id: 'e3', date: '2026-04-15', title: 'Дедлайн місячного звіту',      type: 'report',  desc: 'Підготувати зведений звіт за березень–квітень для засновників.' },
  { id: 'e4', date: '2026-04-18', time: '18:00', title: 'Вебінар "Гейміфікація уроків"', type: 'webinar', desc: "Запрошений спікер: освітній психолог Іван Лисенко.", audience: 'Всі вчителі' },
  { id: 'e5', date: '2026-04-25', title: '5 років EnglishBest 🎂',       type: 'event',   desc: 'Онлайн-святкування з командою. Подяки, нагороди, плани на рік.' },
  { id: 'e6', date: '2026-04-30', title: 'Закриття квітневого набору',   type: 'report',  desc: 'Останній день прийому нових учнів у квітневі групи.' },
  { id: 'e7', date: '2026-05-05', title: 'Виплата зарплат — травень',    type: 'salary',  desc: 'Виплати за квітень. Очікувана сума: ₴ 44 500.', audience: 'Всі вчителі' },
  { id: 'e8', date: '2026-05-15', time: '10:00', title: 'Нарада: Результати Q1',    type: 'meeting', desc: 'Підсумки першого кварталу, планування Q2, нові цілі по учнях.' },
  { id: 'e9', date: '2026-05-22', time: '19:00', title: 'Вебінар "Вимова для дітей"', type: 'webinar', desc: 'Методичний вебінар для вчителів молодшої групи.', audience: 'Olga K., Iryna M.' },
];

const EMPTY_FORM = { title: '', type: 'meeting' as EventType, time: '', desc: '', audience: '' };

/* ─── Компонент ──────────────────────────────── */
export default function AdminCalendarPage() {
  const [events, setEvents] = useState<AdminEvent[]>(INIT_EVENTS);
  const [detail, setDetail] = useState<AdminEvent | null>(null);
  const [addDate, setAddDate] = useState<string | null>(null);
  const [form, setForm]     = useState(EMPTY_FORM);
  const [calYear,  setCalYear]  = useState(2026);
  const [calMonth, setCalMonth] = useState(3);

  const monthStr    = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
  const monthEvents = events.filter(e => e.date.startsWith(monthStr));

  const upcoming = [...events]
    .filter(e => e.date >= toDateStr(calYear, calMonth, 1))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  function eventsForDate(dateStr: string) {
    return events.filter(e => e.date === dateStr);
  }

  function saveEvent() {
    if (!form.title.trim() || !addDate) return;
    setEvents(prev => [...prev, {
      id: `ev-${Date.now()}`,
      date: addDate,
      time: form.time || undefined,
      title: form.title,
      type: form.type,
      desc: form.desc || undefined,
      audience: form.audience || undefined,
    }]);
    setAddDate(null);
  }

  function deleteEvent(id: string) {
    setEvents(prev => prev.filter(e => e.id !== id));
    setDetail(null);
  }

  return (
    <div className="flex flex-col gap-5 max-w-4xl">

      {/* Заголовок */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink">Адмін-календар</h1>
          <p className="text-ink-muted mt-0.5 text-sm">
            {monthEvents.length} подій у {MONTHS[calMonth].toLowerCase()}
          </p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white text-sm font-black hover:opacity-90 transition-opacity">
          + Нова подія
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">

        {/* Сітка */}
        <CalendarGrid
          initialYear={2026}
          initialMonth={3}
          onMonthChange={(y, m) => { setCalYear(y); setCalMonth(m); }}
          onDayClick={ds => { setAddDate(ds); setForm(EMPTY_FORM); }}
          renderDay={({ dateStr }) => {
            const dayEvs = eventsForDate(dateStr);
            return (
              <>
                {dayEvs.slice(0, 2).map(ev => {
                  const cfg = EVENT_CONFIG[ev.type];
                  return (
                    <button
                      key={ev.id}
                      onClick={e => { e.stopPropagation(); setDetail(ev); }}
                      className={`w-full text-left px-1.5 py-1 rounded-lg text-[10px] font-bold leading-tight truncate hover:opacity-80 transition-opacity ${cfg.bg} ${cfg.color}`}
                    >
                      {cfg.emoji} {ev.title}
                    </button>
                  );
                })}
                {dayEvs.length > 2 && (
                  <span className="text-[10px] text-ink-muted font-semibold">+{dayEvs.length - 2}</span>
                )}
              </>
            );
          }}
          footer={
            <div className="flex items-center gap-4 px-5 py-3 bg-surface-muted flex-wrap">
              {Object.entries(EVENT_CONFIG).map(([, cfg]) => (
                <div key={cfg.label} className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  {cfg.emoji} {cfg.label}
                </div>
              ))}
              <span className="text-[10px] text-ink-muted ml-auto">Натисни день → додати подію</span>
            </div>
          }
        />

        {/* Права колонка */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-black text-ink-muted uppercase tracking-wide">Найближчі події</p>
          </div>
          <ul className="divide-y divide-border">
            {upcoming.length === 0 && (
              <li className="px-4 py-8 text-center text-ink-muted text-sm">Немає подій</li>
            )}
            {upcoming.map(ev => {
              const cfg = EVENT_CONFIG[ev.type];
              return (
                <li key={ev.id}>
                  <button
                    onClick={() => setDetail(ev)}
                    className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-surface-muted/50 transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${cfg.bg}`}>{cfg.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-ink leading-tight truncate">{ev.title}</p>
                      <p className="text-xs text-ink-muted mt-0.5">{fmtDate(ev.date)}{ev.time ? ` · ${ev.time}` : ''}</p>
                    </div>
                    <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${cfg.dot}`} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Модал: деталі */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-5" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${EVENT_CONFIG[detail.type].bg}`}>{EVENT_CONFIG[detail.type].emoji}</div>
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-wide ${EVENT_CONFIG[detail.type].color}`}>{EVENT_CONFIG[detail.type].label}</span>
                  <h3 className="font-black text-ink text-base leading-tight">{detail.title}</h3>
                </div>
              </div>
              <button onClick={() => setDetail(null)} className="text-ink-muted hover:text-ink flex-shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="flex flex-col gap-2 text-sm text-ink-muted">
              <div className="flex items-center gap-2"><span>📅</span><span>{fmtDate(detail.date)}{detail.time ? ` о ${detail.time}` : ''}</span></div>
              {detail.audience && <div className="flex items-center gap-2"><span>👥</span><span>{detail.audience}</span></div>}
              {detail.desc && <p className="text-ink leading-relaxed bg-surface-muted rounded-xl px-3 py-2 mt-1 text-xs">{detail.desc}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => deleteEvent(detail.id)} className="flex-1 py-2.5 rounded-xl border-2 border-danger/30 text-danger text-sm font-bold hover:bg-danger/5 transition-colors">Видалити</button>
              <button onClick={() => setDetail(null)} className="flex-1 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white text-sm font-black hover:opacity-90 transition-opacity">Закрити</button>
            </div>
          </div>
        </div>
      )}

      {/* Модал: додати */}
      {addDate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-5" onClick={() => setAddDate(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-ink">Нова подія · {fmtDate(addDate)}</h3>
              <button onClick={() => setAddDate(null)} className="text-ink-muted hover:text-ink">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-black text-ink-muted uppercase tracking-wide mb-1 block">Назва *</label>
                <input className="w-full h-10 px-3 rounded-xl border border-border text-sm text-ink focus:outline-none focus:border-primary transition-colors" placeholder="Назва події…" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-ink-muted uppercase tracking-wide mb-1 block">Тип</label>
                  <select className="w-full h-10 px-3 rounded-xl border border-border text-sm text-ink focus:outline-none focus:border-primary transition-colors" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as EventType }))}>
                    {(Object.entries(EVENT_CONFIG) as [EventType, typeof EVENT_CONFIG[EventType]][]).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.emoji} {cfg.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-ink-muted uppercase tracking-wide mb-1 block">Час</label>
                  <input type="time" className="w-full h-10 px-3 rounded-xl border border-border text-sm text-ink focus:outline-none focus:border-primary transition-colors" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs font-black text-ink-muted uppercase tracking-wide mb-1 block">Аудиторія</label>
                <input className="w-full h-10 px-3 rounded-xl border border-border text-sm text-ink focus:outline-none focus:border-primary transition-colors" placeholder="напр. Всі вчителі" value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-black text-ink-muted uppercase tracking-wide mb-1 block">Опис</label>
                <textarea className="w-full px-3 py-2 rounded-xl border border-border text-sm text-ink focus:outline-none focus:border-primary transition-colors resize-none" rows={2} placeholder="Деталі події…" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setAddDate(null)} className="flex-1 py-2.5 rounded-xl border-2 border-border text-sm font-bold text-ink hover:bg-surface-muted transition-colors">Скасувати</button>
              <button onClick={saveEvent} disabled={!form.title.trim()} className="flex-1 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white text-sm font-black hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">Додати</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
