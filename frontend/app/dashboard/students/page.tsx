'use client';
import { useState } from 'react';
import { Modal } from '@/components/atoms/Modal';
import { StudentDetail, type StudentDetailData } from '@/components/molecules/StudentDetail';
import { FilterChips, LevelBadge, PageHeader, SearchInput, type FilterChipOption } from '@/components/teacher/ui';
import type { Level } from '@/lib/teacher-mocks';

type StudentStatus = 'active' | 'paused' | 'trial' | 'expired';
type SortKey = 'name' | 'level' | 'lastLesson' | 'nextLesson';

interface Student {
  slug: string;
  name: string;
  photo: string;
  level: string;
  levelOrder: number;
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

const STUDENTS: Student[] = [
  { slug: 'alisa-k',    name: 'Аліса Коваль',       photo: 'https://randomuser.me/api/portraits/women/11.jpg', level: 'A0', levelOrder: 0, program: 'Стартер для малюків', teacher: 'Olga K.',   lessonsBalance: 12, moneyBalance: 1800, lastLesson: '28 бер', lastLessonDate: new Date('2026-03-28'), nextLesson: '4 квіт',  nextLessonDate: new Date('2026-04-04'), status: 'active' },
  { slug: 'mykola-s',   name: 'Микола Семенченко',  photo: 'https://randomuser.me/api/portraits/men/14.jpg',   level: 'A1', levelOrder: 1, program: 'Базовий рівень',      teacher: 'Maria S.',  lessonsBalance: 8,  moneyBalance: 1200, lastLesson: '30 бер', lastLessonDate: new Date('2026-03-30'), nextLesson: '2 квіт',  nextLessonDate: new Date('2026-04-02'), status: 'active' },
  { slug: 'daryna-p',   name: 'Дарина Петренко',    photo: 'https://randomuser.me/api/portraits/women/24.jpg', level: 'A2', levelOrder: 2, program: 'Передсередній',       teacher: 'Maria S.',  lessonsBalance: 3,  moneyBalance: 450,  lastLesson: '27 бер', lastLessonDate: new Date('2026-03-27'), nextLesson: '9 квіт',  nextLessonDate: new Date('2026-04-09'), status: 'active' },
  { slug: 'ivan-b',     name: 'Іван Бондаренко',    photo: 'https://randomuser.me/api/portraits/men/22.jpg',   level: 'B1', levelOrder: 3, program: 'Середній рівень',     teacher: 'Dmytro P.', lessonsBalance: 0,  moneyBalance: 0,    lastLesson: '14 бер', lastLessonDate: new Date('2026-03-14'), nextLesson: '—',       nextLessonDate: null,                   status: 'expired' },
  { slug: 'sofiia-m',   name: 'Софія Мельник',      photo: 'https://randomuser.me/api/portraits/women/33.jpg', level: 'A1', levelOrder: 1, program: 'Базовий рівень',      teacher: 'Maria S.',  lessonsBalance: 1,  moneyBalance: 150,  lastLesson: '29 бер', lastLessonDate: new Date('2026-03-29'), nextLesson: '5 квіт',  nextLessonDate: new Date('2026-04-05'), status: 'active' },
  { slug: 'artem-v',    name: 'Артем Власенко',     photo: 'https://randomuser.me/api/portraits/men/31.jpg',   level: 'B2', levelOrder: 4, program: 'Впевнений рівень',    teacher: 'Anna V.',   lessonsBalance: 5,  moneyBalance: 750,  lastLesson: '31 бер', lastLessonDate: new Date('2026-03-31'), nextLesson: '7 квіт',  nextLessonDate: new Date('2026-04-07'), status: 'active' },
  { slug: 'kateryna-z', name: 'Катерина Захаренко', photo: 'https://randomuser.me/api/portraits/women/45.jpg', level: 'A0', levelOrder: 0, program: 'Стартер для малюків', teacher: 'Olga K.',   lessonsBalance: 10, moneyBalance: 1500, lastLesson: '30 бер', lastLessonDate: new Date('2026-03-30'), nextLesson: '3 квіт',  nextLessonDate: new Date('2026-04-03'), status: 'trial' },
  { slug: 'pavlo-r',    name: 'Павло Романченко',   photo: 'https://randomuser.me/api/portraits/men/43.jpg',   level: 'A2', levelOrder: 2, program: 'Передсередній',       teacher: 'Dmytro P.', lessonsBalance: 7,  moneyBalance: 1050, lastLesson: '25 бер', lastLessonDate: new Date('2026-03-25'), nextLesson: '—',       nextLessonDate: null,                   status: 'paused' },
  { slug: 'yuliia-h',   name: 'Юлія Гриценко',      photo: 'https://randomuser.me/api/portraits/women/52.jpg', level: 'B1', levelOrder: 3, program: 'Середній рівень',     teacher: 'Dmytro P.', lessonsBalance: 4,  moneyBalance: 600,  lastLesson: '28 бер', lastLessonDate: new Date('2026-03-28'), nextLesson: '6 квіт',  nextLessonDate: new Date('2026-04-06'), status: 'active' },
  { slug: 'vitalii-n',  name: 'Віталій Назаренко',  photo: 'https://randomuser.me/api/portraits/men/55.jpg',   level: 'A1', levelOrder: 1, program: 'Базовий рівень',      teacher: 'Maria S.',  lessonsBalance: 6,  moneyBalance: 900,  lastLesson: '29 бер', lastLessonDate: new Date('2026-03-29'), nextLesson: '4 квіт',  nextLessonDate: new Date('2026-04-04'), status: 'active' },
];

const STATUS_CONFIG: Record<StudentStatus, { label: string; dot: string }> = {
  active:  { label: 'Активний',   dot: 'ios-dot-positive' },
  paused:  { label: 'Пауза',      dot: 'ios-dot-warn' },
  trial:   { label: 'Пробний',    dot: 'ios-dot-info' },
  expired: { label: 'Закінчився', dot: 'ios-dot-danger' },
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

export default function StudentsPage() {
  const [query, setQuery]               = useState('');
  const [sortKey, setSortKey]           = useState<SortKey>('nextLesson');
  const [levelFilter, setLevelFilter]   = useState<Level | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StudentStatus | 'all' | 'low-balance'>('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentDetailData | null>(null);
  const [isTeacher] = useState(() =>
    typeof window !== 'undefined' && (localStorage.getItem('demo_role') === 'teacher' || localStorage.getItem('sidebar_role') === 'teacher')
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
      if (sortKey === 'nextLesson') {
        if (!a.nextLessonDate && !b.nextLessonDate) return 0;
        if (!a.nextLessonDate) return 1;
        if (!b.nextLessonDate) return -1;
        return a.nextLessonDate.getTime() - b.nextLessonDate.getTime();
      }
      return 0;
    });

  const activeCount  = STUDENTS.filter(s => s.status === 'active').length;
  const lowBalance   = STUDENTS.filter(s => s.lessonsBalance <= 2 && s.status === 'active').length;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={isTeacher ? 'Мої учні' : 'Учні'}
        subtitle={`${STUDENTS.length} · ${activeCount} активних${lowBalance > 0 ? ` · ${lowBalance} з низьким балансом` : ''}`}
        action={
          <button className="ios-btn ios-btn-primary">+ Додати учня</button>
        }
      />

      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <SearchInput
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Пошук учнів..."
          containerClassName="flex-1 min-w-0 sm:flex-none sm:w-64"
        />
        <select
          value={levelFilter}
          onChange={e => setLevelFilter(e.target.value as Level | 'all')}
          className="h-9 pl-3 pr-8 rounded-md border border-border bg-white text-[13px] font-semibold text-ink focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 cursor-pointer appearance-none transition-[border-color,box-shadow]"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236b7280\' stroke-width=\'2\' stroke-linecap=\'round\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
          }}
        >
          {LEVEL_FILTER_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={sortKey}
          onChange={e => setSortKey(e.target.value as SortKey)}
          className="h-9 pl-3 pr-8 rounded-md border border-border bg-white text-[13px] font-semibold text-ink focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 cursor-pointer appearance-none transition-[border-color,box-shadow]"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236b7280\' stroke-width=\'2\' stroke-linecap=\'round\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
          }}
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>
      </div>
      <FilterChips value={statusFilter} onChange={setStatusFilter} options={STATUS_FILTER_OPTIONS} />

      {filtered.length === 0 ? (
        <div className="ios-card py-16 text-center">
          <p className="text-[14px] font-semibold text-ink">Нічого не знайдено</p>
          <p className="text-[13px] text-ink-muted mt-1">Спробуй інший запит або фільтр</p>
        </div>
      ) : (
        <div className="ios-card overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Учень</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Програма</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Останній</th>
                  {!isTeacher && <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Вчитель</th>}
                  {!isTeacher && <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Баланс</th>}
                  {isTeacher  && <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Наступний</th>}
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Статус</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr
                    key={s.slug}
                    onClick={() => setSelectedStudent({
                      slug: s.slug,
                      name: s.name,
                      photo: s.photo,
                      level: s.level,
                      program: s.program,
                      teacher: s.teacher,
                      lessonsBalance: s.lessonsBalance,
                      moneyBalance: s.moneyBalance,
                      lastLesson: s.lastLesson,
                      status: STATUS_CONFIG[s.status].label,
                      statusDot: STATUS_CONFIG[s.status].dot,
                      joinedAt: 'Лютий 2026',
                      streak: 14,
                      totalLessons: 12,
                      parentName: 'Олена Коваль',
                      parentPhone: '+38 050 123 45 67',
                      parentEmail: 'olena.koval@gmail.com',
                    })}
                    className="border-t border-border hover:bg-surface-muted/50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s.photo} alt={s.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                        <span className="text-[13px] font-semibold text-ink">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <LevelBadge level={s.level as Level} />
                        <span className="text-[13px] text-ink-muted">{s.program}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] text-ink-muted tabular-nums">{s.lastLesson}</span>
                    </td>
                    {!isTeacher && (
                      <td className="px-4 py-3">
                        <span className="text-[13px] text-ink-muted">{s.teacher}</span>
                      </td>
                    )}
                    {!isTeacher && (
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className={`text-[13px] font-semibold tabular-nums ${s.lessonsBalance <= 2 ? 'text-danger-dark' : 'text-ink'}`}>
                            {s.lessonsBalance} {s.lessonsBalance === 1 ? 'урок' : s.lessonsBalance >= 2 && s.lessonsBalance <= 4 ? 'уроки' : 'уроків'}
                          </span>
                          <span className="text-[11px] text-ink-faint tabular-nums">₴ {s.moneyBalance.toLocaleString()}</span>
                        </div>
                      </td>
                    )}
                    {isTeacher && (
                      <td className="px-4 py-3">
                        <span className={`text-[13px] tabular-nums ${s.nextLessonDate ? 'text-ink font-semibold' : 'text-ink-faint'}`}>
                          {s.nextLesson}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted">
                        <span className={`ios-dot ${STATUS_CONFIG[s.status].dot}`} />
                        {STATUS_CONFIG[s.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <svg className="w-3.5 h-3.5 text-ink-faint ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <ul className="md:hidden">
            {filtered.map(s => (
              <li
                key={s.slug}
                onClick={() => setSelectedStudent({
                  slug: s.slug, name: s.name, photo: s.photo, level: s.level,
                  program: s.program, teacher: s.teacher, lessonsBalance: s.lessonsBalance,
                  moneyBalance: s.moneyBalance, lastLesson: s.lastLesson,
                  status: STATUS_CONFIG[s.status].label,
                  statusDot: STATUS_CONFIG[s.status].dot,
                  joinedAt: 'Лютий 2026', streak: 14, totalLessons: 12,
                  parentName: 'Олена Коваль', parentPhone: '+38 050 123 45 67', parentEmail: 'olena.koval@gmail.com',
                })}
                className="border-t border-border first:border-t-0 px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-surface-muted/50 transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.photo} alt={s.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-semibold text-ink truncate">{s.name}</p>
                    <LevelBadge level={s.level as Level} />
                  </div>
                  <p className="text-[12px] text-ink-muted truncate">{s.program}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-muted">
                      <span className={`ios-dot ${STATUS_CONFIG[s.status].dot}`} />
                      {STATUS_CONFIG[s.status].label}
                    </span>
                    <span className="text-[11px] text-ink-faint tabular-nums">{s.nextLesson}</span>
                  </div>
                </div>
                <svg className="w-3.5 h-3.5 text-ink-faint flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
              </li>
            ))}
          </ul>

          <div className="px-5 py-2.5 border-t border-border bg-surface-muted/50 flex items-center justify-between text-[11px] text-ink-muted tabular-nums">
            <span>Показано {filtered.length} з {STUDENTS.length}</span>
            <span>Оновлено: 31 бер</span>
          </div>
        </div>
      )}

      <Modal
        isOpen={selectedStudent !== null}
        onClose={() => setSelectedStudent(null)}
        width="lg"
        bodyClassName="p-0"
      >
        {selectedStudent && (
          <StudentDetail student={selectedStudent} isAdmin={!isTeacher} />
        )}
      </Modal>
    </div>
  );
}
