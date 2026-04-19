'use client';
import { useState } from 'react';
import { SlideOver } from '@/components/atoms/SlideOver';
import { StudentDetail, type StudentDetailData } from '@/components/molecules/StudentDetail';
import { InfoPopover } from '@/components/atoms/InfoPopover';
import { FilterChips, type FilterChipOption } from '@/components/teacher/ui';
import type { Level } from '@/lib/teacher-mocks';

/* ─── Типи ───────────────────────────────────── */
type StudentStatus = 'active' | 'paused' | 'trial' | 'expired';
type SortKey = 'name' | 'level' | 'lastLesson' | 'nextLesson';

interface Student {
  slug: string;
  name: string;
  photo: string;
  level: string;
  levelOrder: number;   // для сортування A0<A1<A2<B1<B2
  levelColor: string;
  program: string;
  teacher: string;
  lessonsBalance: number;
  moneyBalance: number;
  lastLesson: string;
  lastLessonDate: Date;
  nextLesson: string;
  nextLessonDate: Date | null;
  status: StudentStatus;
}

/* ─── Мок-дані ───────────────────────────────── */
const STUDENTS: Student[] = [
  { slug: 'alisa-k',    name: 'Аліса Коваль',       photo: 'https://randomuser.me/api/portraits/women/11.jpg', level: 'A0', levelOrder: 0, levelColor: 'bg-danger/10 text-danger-dark',   program: 'Стартер для малюків', teacher: 'Olga K.',   lessonsBalance: 12, moneyBalance: 1800, lastLesson: '28 бер 2026', lastLessonDate: new Date('2026-03-28'), nextLesson: '4 квіт 2026',  nextLessonDate: new Date('2026-04-04'), status: 'active' },
  { slug: 'mykola-s',   name: 'Микола Семенченко',  photo: 'https://randomuser.me/api/portraits/men/14.jpg',   level: 'A1', levelOrder: 1, levelColor: 'bg-accent/10 text-accent-dark',   program: 'Базовий рівень',      teacher: 'Maria S.',  lessonsBalance: 8,  moneyBalance: 1200, lastLesson: '30 бер 2026', lastLessonDate: new Date('2026-03-30'), nextLesson: '2 квіт 2026',  nextLessonDate: new Date('2026-04-02'), status: 'active' },
  { slug: 'daryna-p',   name: 'Дарина Петренко',    photo: 'https://randomuser.me/api/portraits/women/24.jpg', level: 'A2', levelOrder: 2, levelColor: 'bg-accent/20 text-accent-dark',   program: 'Передсередній',       teacher: 'Maria S.',  lessonsBalance: 3,  moneyBalance: 450,  lastLesson: '27 бер 2026', lastLessonDate: new Date('2026-03-27'), nextLesson: '9 квіт 2026',  nextLessonDate: new Date('2026-04-09'), status: 'active' },
  { slug: 'ivan-b',     name: 'Іван Бондаренко',    photo: 'https://randomuser.me/api/portraits/men/22.jpg',   level: 'B1', levelOrder: 3, levelColor: 'bg-success/10 text-success-dark', program: 'Середній рівень',     teacher: 'Dmytro P.', lessonsBalance: 0,  moneyBalance: 0,    lastLesson: '14 бер 2026', lastLessonDate: new Date('2026-03-14'), nextLesson: '—',            nextLessonDate: null,                   status: 'expired' },
  { slug: 'sofiia-m',   name: 'Софія Мельник',      photo: 'https://randomuser.me/api/portraits/women/33.jpg', level: 'A1', levelOrder: 1, levelColor: 'bg-accent/10 text-accent-dark',   program: 'Базовий рівень',      teacher: 'Maria S.',  lessonsBalance: 1,  moneyBalance: 150,  lastLesson: '29 бер 2026', lastLessonDate: new Date('2026-03-29'), nextLesson: '5 квіт 2026',  nextLessonDate: new Date('2026-04-05'), status: 'active' },
  { slug: 'artem-v',    name: 'Артем Власенко',     photo: 'https://randomuser.me/api/portraits/men/31.jpg',   level: 'B2', levelOrder: 4, levelColor: 'bg-purple/10 text-purple-dark',   program: 'Впевнений рівень',    teacher: 'Anna V.',   lessonsBalance: 5,  moneyBalance: 750,  lastLesson: '31 бер 2026', lastLessonDate: new Date('2026-03-31'), nextLesson: '7 квіт 2026',  nextLessonDate: new Date('2026-04-07'), status: 'active' },
  { slug: 'kateryna-z', name: 'Катерина Захаренко', photo: 'https://randomuser.me/api/portraits/women/45.jpg', level: 'A0', levelOrder: 0, levelColor: 'bg-danger/10 text-danger-dark',   program: 'Стартер для малюків', teacher: 'Olga K.',   lessonsBalance: 10, moneyBalance: 1500, lastLesson: '30 бер 2026', lastLessonDate: new Date('2026-03-30'), nextLesson: '3 квіт 2026',  nextLessonDate: new Date('2026-04-03'), status: 'trial' },
  { slug: 'pavlo-r',    name: 'Павло Романченко',   photo: 'https://randomuser.me/api/portraits/men/43.jpg',   level: 'A2', levelOrder: 2, levelColor: 'bg-accent/20 text-accent-dark',   program: 'Передсередній',       teacher: 'Dmytro P.', lessonsBalance: 7,  moneyBalance: 1050, lastLesson: '25 бер 2026', lastLessonDate: new Date('2026-03-25'), nextLesson: '—',            nextLessonDate: null,                   status: 'paused' },
  { slug: 'yuliia-h',   name: 'Юлія Гриценко',     photo: 'https://randomuser.me/api/portraits/women/52.jpg', level: 'B1', levelOrder: 3, levelColor: 'bg-success/10 text-success-dark', program: 'Середній рівень',     teacher: 'Dmytro P.', lessonsBalance: 4,  moneyBalance: 600,  lastLesson: '28 бер 2026', lastLessonDate: new Date('2026-03-28'), nextLesson: '6 квіт 2026',  nextLessonDate: new Date('2026-04-06'), status: 'active' },
  { slug: 'vitalii-n',  name: 'Віталій Назаренко',  photo: 'https://randomuser.me/api/portraits/men/55.jpg',   level: 'A1', levelOrder: 1, levelColor: 'bg-accent/10 text-accent-dark',   program: 'Базовий рівень',      teacher: 'Maria S.',  lessonsBalance: 6,  moneyBalance: 900,  lastLesson: '29 бер 2026', lastLessonDate: new Date('2026-03-29'), nextLesson: '4 квіт 2026',  nextLessonDate: new Date('2026-04-04'), status: 'active' },
];

const STATUS_CONFIG: Record<StudentStatus, { label: string; cls: string }> = {
  active:  { label: 'Активний',   cls: 'bg-primary/10 text-primary-dark' },
  paused:  { label: 'Пауза',      cls: 'bg-accent/15 text-accent-dark' },
  trial:   { label: 'Пробний',    cls: 'bg-secondary/15 text-secondary-dark' },
  expired: { label: 'Закінчився', cls: 'bg-danger/10 text-danger' },
};

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'name',       label: "За ім'ям" },
  { key: 'level',      label: 'За рівнем' },
  { key: 'nextLesson', label: 'Наступний урок' },
  { key: 'lastLesson', label: 'Останній урок' },
];

const LEVEL_FILTER_OPTIONS: ReadonlyArray<FilterChipOption<Level | 'all'>> = [
  { value: 'all', label: 'Всі рівні' },
  { value: 'A0',  label: 'A0' },
  { value: 'A1',  label: 'A1' },
  { value: 'A2',  label: 'A2' },
  { value: 'B1',  label: 'B1' },
  { value: 'B2',  label: 'B2' },
];

const STATUS_FILTER_OPTIONS: ReadonlyArray<FilterChipOption<StudentStatus | 'all' | 'low-balance'>> = [
  { value: 'all',         label: 'Усі'        },
  { value: 'active',      label: 'Активні'    },
  { value: 'trial',       label: 'Пробні'     },
  { value: 'paused',      label: 'Пауза'      },
  { value: 'expired',     label: 'Закінчився' },
  { value: 'low-balance', label: '≤ 2 уроків' },
];

/* ─── Статистика ─────────────────────────────── */
function Stat({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <span className="text-sm">
      <span className={`font-black ${danger ? 'text-danger' : 'text-ink'}`}>{value}</span>
      {' '}
      <span className="text-ink-muted">{label}</span>
    </span>
  );
}
function Sep() {
  return <span className="text-border select-none" aria-hidden>·</span>;
}

function QuickAction({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="w-8 h-8 rounded-lg border border-border text-sm hover:border-primary/40 hover:bg-primary/5 transition-colors flex items-center justify-center flex-shrink-0"
    >
      {icon}
    </button>
  );
}

function BalanceCell({ lessons, money }: { lessons: number; money: number }) {
  const low = lessons <= 2;
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`text-sm font-semibold ${low ? 'text-danger' : 'text-ink'}`}>
        {lessons} {lessons === 1 ? 'урок' : lessons >= 2 && lessons <= 4 ? 'уроки' : 'уроків'}
      </span>
      <span className="text-xs text-ink-muted">₴ {money.toLocaleString()}</span>
    </div>
  );
}

/* ─── Головний компонент ─────────────────────── */
export default function StudentsPage() {
  const [query, setQuery]               = useState('');
  const [sortKey, setSortKey]           = useState<SortKey>('nextLesson');
  const [levelFilter, setLevelFilter]   = useState<Level | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StudentStatus | 'all' | 'low-balance'>('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentDetailData | null>(null);
  const [isTeacher] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem('sidebar_role') === 'teacher'
  );

  const filtered = STUDENTS
    .filter(s => query === '' || s.name.toLowerCase().includes(query.toLowerCase()))
    .filter(s => levelFilter === 'all' || s.level === levelFilter)
    .filter(s => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'low-balance') return s.lessonsBalance <= 2;
      return s.status === statusFilter;
    })
    .sort((a, b) => {
      if (sortKey === 'name')       return a.name.localeCompare(b.name, 'uk');
      if (sortKey === 'level')      return a.levelOrder - b.levelOrder;
      if (sortKey === 'lastLesson') return b.lastLessonDate.getTime() - a.lastLessonDate.getTime();
      // nextLesson: null (немає) іде в кінець
      if (sortKey === 'nextLesson') {
        if (!a.nextLessonDate && !b.nextLessonDate) return 0;
        if (!a.nextLessonDate) return 1;
        if (!b.nextLessonDate) return -1;
        return a.nextLessonDate.getTime() - b.nextLessonDate.getTime();
      }
      return 0;
    });

  const totalBalance = STUDENTS.reduce((sum, s) => sum + s.moneyBalance, 0);
  const activeCount  = STUDENTS.filter(s => s.status === 'active').length;
  const lowBalance   = STUDENTS.filter(s => s.lessonsBalance <= 2 && s.status === 'active').length;

  return (
    <div className="flex flex-col gap-5">

      {/* Заголовок */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="type-h2 text-ink">{isTeacher ? 'Мої учні' : 'Учні'}</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-sm text-ink-muted">{STUDENTS.length} учнів</span>
            <InfoPopover items={[
              { label: 'Всього учнів',    value: String(STUDENTS.length) },
              { label: 'Активних',        value: String(activeCount) },
              ...(!isTeacher ? [
                { label: 'На рахунках',   value: `₴\u00a0${totalBalance.toLocaleString()}` },
                ...(lowBalance > 0 ? [{ label: 'Низький баланс', value: String(lowBalance), danger: true }] : []),
              ] : []),
            ]} />
          </div>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white text-sm font-black hover:opacity-90 transition-opacity flex-shrink-0">
          + Додати учня
        </button>
      </div>

      {/* Фільтри (тільки вчитель) */}
      {isTeacher && (
        <div className="flex flex-col gap-2">
          <FilterChips value={levelFilter}  onChange={setLevelFilter}  options={LEVEL_FILTER_OPTIONS}  />
          <FilterChips value={statusFilter} onChange={setStatusFilter} options={STATUS_FILTER_OPTIONS} />
        </div>
      )}

      {/* Пошук + сортування */}
      <div className="flex items-center gap-3">
        {/* Компактний пошук */}
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

        {/* Сортування */}
        <div className="flex items-center gap-2">
          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value as SortKey)}
            className="h-9 pl-3 pr-8 rounded-xl border border-primary/40 bg-primary/5 text-primary-dark text-xs font-bold focus:outline-none focus:border-primary cursor-pointer appearance-none select-arrow-primary"
            >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Таблиця */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-border bg-surface-muted">
                <th className="text-left px-5 py-3 type-label text-ink-muted">Учень</th>
                <th className="text-left px-4 py-3 type-label text-ink-muted">Програма</th>
                <th className="text-left px-4 py-3 type-label text-ink-muted">Останній урок</th>
                {!isTeacher && <th className="text-left px-4 py-3 type-label text-ink-muted">Вчитель</th>}
                {!isTeacher && <th className="text-left px-4 py-3 type-label text-ink-muted">Баланс</th>}
                {isTeacher  && <th className="text-left px-4 py-3 type-label text-ink-muted">Наступний урок</th>}
                {isTeacher  && <th className="text-left px-4 py-3 type-label text-ink-muted">Дії</th>}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(s => (
                <tr
                  key={s.slug}
                  onClick={() => setSelectedStudent({
                    slug: s.slug,
                    name: s.name,
                    photo: s.photo,
                    level: s.level,
                    levelColor: s.levelColor,
                    program: s.program,
                    teacher: s.teacher,
                    lessonsBalance: s.lessonsBalance,
                    moneyBalance: s.moneyBalance,
                    lastLesson: s.lastLesson,
                    status: STATUS_CONFIG[s.status].label,
                    statusCls: STATUS_CONFIG[s.status].cls,
                    joinedAt: 'Лютий 2026',
                    streak: 14,
                    totalLessons: 12,
                    parentName: 'Олена Коваль',
                    parentPhone: '+38 050 123 45 67',
                    parentEmail: 'olena.koval@gmail.com',
                  })}
                  className="hover:bg-surface-muted/50 transition-colors cursor-pointer"
                >
                  {/* Учень */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.photo} alt={s.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                      <span className="text-sm font-semibold text-ink whitespace-nowrap">{s.name}</span>
                    </div>
                  </td>
                  {/* Програма + рівень */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${s.levelColor}`}>{s.level}</span>
                      <span className="text-sm text-ink whitespace-nowrap">{s.program}</span>
                    </div>
                  </td>
                  {/* Останній урок */}
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-ink-muted">{s.lastLesson}</span>
                  </td>
                  {/* Вчитель (адмін) */}
                  {!isTeacher && (
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-ink-muted">{s.teacher}</span>
                    </td>
                  )}
                  {/* Баланс (адмін) */}
                  {!isTeacher && (
                    <td className="px-4 py-3.5">
                      <BalanceCell lessons={s.lessonsBalance} money={s.moneyBalance} />
                    </td>
                  )}
                  {/* Наступний урок (вчитель) */}
                  {isTeacher && (
                    <td className="px-4 py-3.5">
                      <span className={`text-sm ${s.nextLessonDate ? 'text-ink font-semibold' : 'text-ink-muted'}`}>
                        {s.nextLesson}
                      </span>
                    </td>
                  )}
                  {/* Швидкі дії (вчитель) */}
                  {isTeacher && (
                    <td className="px-4 py-3.5">
                      <div className="inline-flex items-center gap-1">
                        <QuickAction
                          label="Написати в чат"
                          icon="💬"
                          onClick={e => { e.stopPropagation(); window.alert(`Відкриваю чат з ${s.name}`); }}
                        />
                        <QuickAction
                          label="Уроки"
                          icon="📅"
                          onClick={e => { e.stopPropagation(); window.alert(`Уроки ${s.name}`); }}
                        />
                        <QuickAction
                          label="Призначити ДЗ"
                          icon="✍️"
                          onClick={e => { e.stopPropagation(); window.alert(`Нове ДЗ для ${s.name}`); }}
                        />
                      </div>
                    </td>
                  )}
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
          <div className="py-16 text-center text-ink-muted">
            <p className="text-3xl mb-2">🔍</p>
            <p className="font-semibold">Нічого не знайдено</p>
          </div>
        )}

        <div className="px-5 py-3 border-t border-border bg-surface-muted flex items-center justify-between text-xs text-ink-muted">
          <span>Показано {filtered.length} з {STUDENTS.length}</span>
          <span>Оновлено: 31 бер 2026</span>
        </div>
      </div>

      {/* Деталі учня — SlideOver */}
      <SlideOver
        open={selectedStudent !== null}
        onClose={() => setSelectedStudent(null)}
        width="md"
      >
        {selectedStudent && (
          <StudentDetail
            student={selectedStudent}
            isAdmin={!isTeacher}
            onClose={() => setSelectedStudent(null)}
          />
        )}
      </SlideOver>
    </div>
  );
}
