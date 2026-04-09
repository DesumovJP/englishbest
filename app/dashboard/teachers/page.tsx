'use client';
import { useState } from 'react';
import { SlideOver } from '@/components/atoms/SlideOver';
import { TeacherDetail, type TeacherDetailData } from '@/components/molecules/TeacherDetail';
import { InfoPopover } from '@/components/atoms/InfoPopover';

/* ─── Типи ───────────────────────────────────── */
type TeacherStatus = 'active' | 'vacation' | 'probation' | 'inactive';
type SortKey = 'name' | 'students' | 'lessons' | 'rating';

interface Teacher {
  slug: string;
  name: string;
  photo: string;
  specialization: string[];
  levels: string;
  studentsCount: number;
  lessonsThisMonth: number;
  rating: number;
  reviews: number;
  ratePerLesson: number;
  salaryThisMonth: number;
  pendingSalary: number;
  status: TeacherStatus;
  joinedAt: string;
}

/* ─── Мок-дані ───────────────────────────────── */
const TEACHERS: Teacher[] = [
  { slug: 'olga-k',    name: 'Olga Kovalenko',    photo: 'https://randomuser.me/api/portraits/women/44.jpg', specialization: ['Діти 4–7', 'Ігри', 'Пісні'],         levels: 'A0–A1', studentsCount: 18, lessonsThisMonth: 52, rating: 4.9, reviews: 124, ratePerLesson: 170, salaryThisMonth: 8840,  pendingSalary: 8840,  status: 'active',    joinedAt: 'Вер 2023' },
  { slug: 'maria-s',   name: 'Maria Sydorenko',   photo: 'https://randomuser.me/api/portraits/women/65.jpg', specialization: ['Граматика', 'Розмова', 'Письмо'],    levels: 'A1–A2', studentsCount: 24, lessonsThisMonth: 68, rating: 4.8, reviews: 89,  ratePerLesson: 180, salaryThisMonth: 12240, pendingSalary: 12240, status: 'active',    joinedAt: 'Бер 2022' },
  { slug: 'dmytro-p',  name: 'Dmytro Petrenko',  photo: 'https://randomuser.me/api/portraits/men/32.jpg',   specialization: ['Іспити', 'Вимова'],                  levels: 'B1–B2', studentsCount: 21, lessonsThisMonth: 59, rating: 4.8, reviews: 203, ratePerLesson: 190, salaryThisMonth: 11210, pendingSalary: 11210, status: 'active',    joinedAt: 'Лип 2021' },
  { slug: 'anna-v',    name: 'Anna Vasylenko',    photo: 'https://randomuser.me/api/portraits/women/23.jpg', specialization: ['Бізнес', 'Сертифікати'],             levels: 'B2–C1', studentsCount: 15, lessonsThisMonth: 41, rating: 4.9, reviews: 178, ratePerLesson: 210, salaryThisMonth: 8610,  pendingSalary: 8610,  status: 'active',    joinedAt: 'Жов 2022' },
  { slug: 'iryna-m',   name: 'Iryna Moroz',      photo: 'https://randomuser.me/api/portraits/women/37.jpg', specialization: ['Діти 7–12', 'Читання'],              levels: 'A0–A2', studentsCount: 8,  lessonsThisMonth: 12, rating: 4.6, reviews: 31,  ratePerLesson: 160, salaryThisMonth: 1920,  pendingSalary: 1920,  status: 'probation', joinedAt: 'Бер 2026' },
  { slug: 'serhii-b',  name: 'Serhii Bondarenko', photo: 'https://randomuser.me/api/portraits/men/55.jpg',  specialization: ['Розмова', 'Акцент'],                 levels: 'A2–B2', studentsCount: 0,  lessonsThisMonth: 0,  rating: 0,   reviews: 0,   ratePerLesson: 170, salaryThisMonth: 0,     pendingSalary: 0,     status: 'vacation',  joinedAt: 'Лют 2024' },
];

const STATUS_CONFIG: Record<TeacherStatus, { label: string; cls: string }> = {
  active:    { label: 'Активний',       cls: 'bg-primary/10 text-primary-dark' },
  vacation:  { label: 'Відпустка',      cls: 'bg-secondary/15 text-secondary-dark' },
  probation: { label: 'Випробувальний', cls: 'bg-accent/15 text-accent-dark' },
  inactive:  { label: 'Неактивний',     cls: 'bg-surface-muted text-ink-muted' },
};

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'students', label: 'Учнів' },
  { key: 'lessons',  label: 'Уроків' },
  { key: 'rating',   label: 'Рейтинг' },
  { key: 'name',     label: "За ім'ям" },
];

/* ─── Компонент ──────────────────────────────── */
export default function TeachersPage() {
  const [query, setQuery]               = useState('');
  const [sortKey, setSortKey]           = useState<SortKey>('students');
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherDetailData | null>(null);

  const totalStudents = TEACHERS.reduce((s, t) => s + t.studentsCount, 0);
  const totalLessons  = TEACHERS.reduce((s, t) => s + t.lessonsThisMonth, 0);
  const totalSalary   = TEACHERS.reduce((s, t) => s + t.pendingSalary, 0);
  const avgRating     = TEACHERS.filter(t => t.rating > 0).reduce((s, t, _, a) => s + t.rating / a.length, 0);

  const sorted = [...TEACHERS]
    .filter(t => query === '' || t.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sortKey === 'name')    return a.name.localeCompare(b.name);
      if (sortKey === 'lessons') return b.lessonsThisMonth - a.lessonsThisMonth;
      if (sortKey === 'rating')  return b.rating - a.rating;
      return b.studentsCount - a.studentsCount;
    });

  return (
    <div className="flex flex-col gap-5">

      {/* Заголовок */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink">Вчителі</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-sm text-ink-muted">{TEACHERS.length} вчителів</span>
            <InfoPopover items={[
              { label: 'Всього вчителів', value: String(TEACHERS.length) },
              { label: 'Активних',        value: String(TEACHERS.filter(t => t.status === 'active').length) },
              { label: 'Середній рейтинг', value: `⭐ ${avgRating.toFixed(1)}` },
              { label: 'До виплати',      value: `₴\u00a0${totalSalary.toLocaleString()}` },
            ]} />
          </div>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white text-sm font-black hover:opacity-90 transition-opacity flex-shrink-0">
          + Запросити вчителя
        </button>
      </div>

      {/* Пошук + сортування */}
      <div className="flex items-center gap-3">
        <div className="relative w-56 flex-shrink-0">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Пошук..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-white text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <select
          value={sortKey}
          onChange={e => setSortKey(e.target.value as SortKey)}
          className="h-9 pl-3 pr-8 rounded-xl border border-primary/40 bg-primary/5 text-primary-dark text-xs font-bold focus:outline-none focus:border-primary cursor-pointer appearance-none select-arrow-primary"
        >
          {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
      </div>

      {/* Таблиця */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-surface-muted">
                <th className="text-left px-5 py-3 text-xs font-black text-ink-muted uppercase tracking-wide">Вчитель</th>
                <th className="text-left px-4 py-3 text-xs font-black text-ink-muted uppercase tracking-wide">Рівні</th>
                <th className="text-left px-4 py-3 text-xs font-black text-ink-muted uppercase tracking-wide">Учнів</th>
                <th className="text-left px-4 py-3 text-xs font-black text-ink-muted uppercase tracking-wide">Уроків/міс</th>
                <th className="text-left px-4 py-3 text-xs font-black text-ink-muted uppercase tracking-wide">ЗП/міс</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map(t => (
                <tr
                  key={t.slug}
                  onClick={() => setSelectedTeacher({
                    slug: t.slug, name: t.name, photo: t.photo,
                    levels: t.levels, specialization: t.specialization,
                    studentsCount: t.studentsCount, lessonsThisMonth: t.lessonsThisMonth,
                    rating: t.rating, reviews: t.reviews,
                    ratePerLesson: t.ratePerLesson, salaryThisMonth: t.salaryThisMonth,
                    pendingSalary: t.pendingSalary,
                    status: STATUS_CONFIG[t.status].label, statusCls: STATUS_CONFIG[t.status].cls,
                    joinedAt: t.joinedAt,
                  })}
                  className="hover:bg-surface-muted/50 transition-colors cursor-pointer"
                >
                  {/* Вчитель */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.photo} alt={t.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink whitespace-nowrap">{t.name}</p>
                        {t.rating > 0 && (
                          <div className="flex items-center gap-0.5 mt-0.5">
                            <span className="text-accent text-xs">★</span>
                            <span className="text-xs font-bold text-ink-muted">{t.rating}</span>
                            <span className="text-xs text-ink-muted">({t.reviews})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* Рівні */}
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-ink-muted">{t.levels}</span>
                  </td>
                  {/* Учнів */}
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-semibold text-ink">{t.studentsCount}</span>
                  </td>
                  {/* Уроків/міс */}
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-semibold text-ink">{t.lessonsThisMonth || '—'}</span>
                  </td>
                  {/* ЗП/міс */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-ink">
                        {t.salaryThisMonth ? `₴ ${t.salaryThisMonth.toLocaleString()}` : '—'}
                      </span>
                      <span className="text-xs text-ink-muted">₴ {t.ratePerLesson}/урок</span>
                    </div>
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
        <div className="px-5 py-3 border-t border-border bg-surface-muted flex items-center justify-between text-xs text-ink-muted">
          <span>Показано {sorted.length} з {TEACHERS.length}</span>
          <span>{totalStudents} учнів · {totalLessons} уроків цього місяця</span>
        </div>
      </div>

      {/* Drawer */}
      <SlideOver open={selectedTeacher !== null} onClose={() => setSelectedTeacher(null)} width="md">
        {selectedTeacher && (
          <TeacherDetail teacher={selectedTeacher} onClose={() => setSelectedTeacher(null)} />
        )}
      </SlideOver>
    </div>
  );
}
