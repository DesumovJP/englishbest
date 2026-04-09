'use client';
import { useState } from 'react';
import { SlideOver } from '@/components/atoms/SlideOver';
import { ProgramDetail, type ProgramDetailData, type ProgramStatus } from '@/components/molecules/ProgramDetail';

/* ─── Мок-дані ───────────────────────────────── */
const INIT_PROGRAMS: ProgramDetailData[] = [
  { id: 'p1', slug: 'starter-kids',       title: 'Стартер для малюків',      description: 'Перші слова через ігри, пісні та малюнки. Ідеально для дітей 4–7 років.',           level: 'A0', levelColor: 'bg-danger/10 text-danger-dark',     teacherName: 'Olga Kovalenko',  teacherPhoto: 'https://randomuser.me/api/portraits/women/44.jpg', tags: ['Діти 4–7','Ігри','Пісні'],          studentsCount: 18, lessonsCount: 24, rating: 4.9, reviews: 124, status: 'published', createdAt: 'Вер 2023' },
  { id: 'p2', slug: 'elementary-kids',    title: 'Базовий рівень',            description: 'Розмовна англійська, шкільна програма та улюблені теми дитини.',                     level: 'A1', levelColor: 'bg-accent/10 text-accent-dark',     teacherName: 'Maria Sydorenko', teacherPhoto: 'https://randomuser.me/api/portraits/women/65.jpg', tags: ['Діти 7–11','Граматика','Розмова'],   studentsCount: 24, lessonsCount: 36, rating: 4.8, reviews: 89,  status: 'published', createdAt: 'Бер 2022' },
  { id: 'p3', slug: 'pre-intermediate',   title: 'Передсередній рівень',      description: 'Поглиблена граматика, читання та перші навички письма.',                             level: 'A2', levelColor: 'bg-accent/20 text-accent-dark',     teacherName: 'Maria Sydorenko', teacherPhoto: 'https://randomuser.me/api/portraits/women/65.jpg', tags: ['Діти 9–12','Письмо','Читання'],      studentsCount: 15, lessonsCount: 40, rating: 4.7, reviews: 61,  status: 'published', createdAt: 'Лип 2022' },
  { id: 'p4', slug: 'intermediate-teens', title: 'Середній рівень',           description: 'Підготовка до шкільних тестів, складна граматика та вимова.',                       level: 'B1', levelColor: 'bg-success/10 text-success-dark',   teacherName: 'Dmytro Petrenko', teacherPhoto: 'https://randomuser.me/api/portraits/men/32.jpg',   tags: ['Підлітки','Іспити','Вимова'],        studentsCount: 21, lessonsCount: 48, rating: 4.8, reviews: 203, status: 'published', createdAt: 'Лип 2021' },
  { id: 'p5', slug: 'upper-intermediate', title: 'Впевнений рівень',          description: 'Вільна розмова, бізнес-англійська та міжнародні сертифікати.',                      level: 'B2', levelColor: 'bg-purple/10 text-purple-dark',      teacherName: 'Anna Vasylenko',  teacherPhoto: 'https://randomuser.me/api/portraits/women/23.jpg', tags: ['14+','Бізнес','Сертифікати'],        studentsCount: 15, lessonsCount: 52, rating: 4.9, reviews: 178, status: 'published', createdAt: 'Жов 2022' },
  { id: 'p6', slug: 'exam-prep',          title: 'Підготовка до ЗНО / NMT',  description: 'Цільова підготовка до державних іспитів з максимальним балом.',                     level: 'B2', levelColor: 'bg-purple/10 text-purple-dark',      teacherName: 'Anna Vasylenko',  teacherPhoto: 'https://randomuser.me/api/portraits/women/23.jpg', tags: ['Старшокласники','ЗНО','Тести'],      studentsCount: 0,  lessonsCount: 30, rating: 5.0, reviews: 94,  status: 'draft',     createdAt: 'Бер 2026' },
  { id: 'p7', slug: 'toddlers',           title: 'Англійська для малят 2–4',  description: 'Ігрові заняття для найменших: кольори, тварини, перші фрази у форматі гри.',         level: 'A0', levelColor: 'bg-danger/10 text-danger-dark',     teacherName: 'Iryna Moroz',     teacherPhoto: 'https://randomuser.me/api/portraits/women/37.jpg', tags: ['2–4 роки','Ігри','Пісні'],          studentsCount: 3,  lessonsCount: 16, rating: 4.6, reviews: 12,  status: 'draft',     createdAt: 'Лют 2026' },
  { id: 'p8', slug: 'legacy-basics',      title: 'Основи (старий формат)',    description: 'Застарілий курс. Учні переведені на новий формат.',                                 level: 'A1', levelColor: 'bg-accent/10 text-accent-dark',     teacherName: 'Maria Sydorenko', teacherPhoto: 'https://randomuser.me/api/portraits/women/65.jpg', tags: ['Застарілий'],                       studentsCount: 0,  lessonsCount: 20, rating: 4.2, reviews: 30,  status: 'archived',  createdAt: 'Сер 2021' },
];

const STATUS_CFG: Record<ProgramStatus, { label: string; cls: string }> = {
  published: { label: 'Опублікована', cls: 'bg-primary/10 text-primary-dark' },
  draft:     { label: 'Чернетка',     cls: 'bg-accent/15 text-accent-dark' },
  archived:  { label: 'Архів',        cls: 'bg-surface-muted text-ink-muted' },
};

/* ─── Компонент ──────────────────────────────── */
export default function AdminLibraryPage() {
  const [programs, setPrograms] = useState<ProgramDetailData[]>(INIT_PROGRAMS);
  const [statusFilter, setStatusFilter] = useState<ProgramStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ProgramDetailData | null>(null);

  const filtered = programs.filter(p => {
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchQuery  = query === '' || p.title.toLowerCase().includes(query.toLowerCase());
    return matchStatus && matchQuery;
  });

  const counts = {
    all:       programs.length,
    published: programs.filter(p => p.status === 'published').length,
    draft:     programs.filter(p => p.status === 'draft').length,
    archived:  programs.filter(p => p.status === 'archived').length,
  };

  function handleSave(updated: ProgramDetailData) {
    setPrograms(prev => prev.map(p => p.id === updated.id ? updated : p));
    setSelected(updated);
  }

  function handleToggleStatus(id: string) {
    setPrograms(prev => prev.map(p => {
      if (p.id !== id) return p;
      const next: ProgramStatus = p.status === 'published' ? 'draft' : 'published';
      const updated = { ...p, status: next };
      if (selected?.id === id) setSelected(updated);
      return updated;
    }));
  }

  function handleArchive(id: string) {
    setPrograms(prev => prev.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, status: 'archived' as ProgramStatus };
      if (selected?.id === id) setSelected(updated);
      return updated;
    }));
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Заголовок */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink">Бібліотека</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            {counts.published} опублікованих · {counts.draft} чернеток
          </p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white text-sm font-black hover:opacity-90 transition-opacity flex-shrink-0">
          + Нова програма
        </button>
      </div>

      {/* Пошук + фільтри статусу */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative w-56 flex-shrink-0">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="search"
            placeholder="Пошук..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-white text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(['all', 'published', 'draft', 'archived'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                statusFilter === s
                  ? 'border-primary bg-primary/10 text-primary-dark'
                  : 'border-border text-ink-muted hover:border-primary/40 hover:text-ink bg-white'
              }`}
            >
              {s === 'all' ? `Всі (${counts.all})` : `${STATUS_CFG[s].label} (${counts[s]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Таблиця */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-b border-border bg-surface-muted">
                <th className="text-left px-5 py-3 text-xs font-black text-ink-muted uppercase tracking-wide">Програма</th>
                <th className="text-left px-4 py-3 text-xs font-black text-ink-muted uppercase tracking-wide">Рівень</th>
                <th className="text-left px-4 py-3 text-xs font-black text-ink-muted uppercase tracking-wide">Учнів</th>
                <th className="text-left px-4 py-3 text-xs font-black text-ink-muted uppercase tracking-wide">Статус</th>
                <th className="px-4 py-3 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(p => (
                <tr
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className="hover:bg-surface-muted/50 transition-colors cursor-pointer"
                >
                  {/* Програма */}
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-ink">{p.title}</p>
                    {p.reviews > 0 && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <span className="text-accent text-xs">★</span>
                        <span className="text-xs font-bold text-ink-muted">{p.rating.toFixed(1)}</span>
                        <span className="text-xs text-ink-muted">({p.reviews})</span>
                      </div>
                    )}
                  </td>
                  {/* Рівень */}
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.levelColor}`}>{p.level}</span>
                  </td>
                  {/* Учнів */}
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-semibold text-ink">{p.studentsCount}</span>
                  </td>
                  {/* Статус */}
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_CFG[p.status].cls}`}>
                      {STATUS_CFG[p.status].label}
                    </span>
                  </td>
                  {/* Шеврон */}
                  <td className="px-4 py-3.5 text-right">
                    <svg className="w-4 h-4 text-ink-muted ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-ink-muted">
            <p className="text-3xl mb-2">🔍</p>
            <p className="font-semibold text-sm">Нічого не знайдено</p>
          </div>
        )}
        <div className="px-5 py-3 border-t border-border bg-surface-muted flex items-center justify-between text-xs text-ink-muted">
          <span>Показано {filtered.length} з {programs.length}</span>
          <span>{programs.filter(p => p.status === 'published').reduce((s, p) => s + p.studentsCount, 0)} учнів навчаються</span>
        </div>
      </div>

      {/* Drawer */}
      <SlideOver open={selected !== null} onClose={() => setSelected(null)} width="md">
        {selected && (
          <ProgramDetail
            program={selected}
            onClose={() => setSelected(null)}
            onSave={handleSave}
            onToggleStatus={handleToggleStatus}
            onArchive={handleArchive}
          />
        )}
      </SlideOver>
    </div>
  );
}
