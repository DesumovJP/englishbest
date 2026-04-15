'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

function getSavedRole(): Role {
  if (typeof window === 'undefined') return 'student';
  // Prefer demo_role set at login, fall back to sidebar_role
  const demo = localStorage.getItem('demo_role');
  if (demo === 'teacher') return 'teacher';
  if (demo === 'admin')   return 'admin';
  if (demo === 'parent')  return 'parent';
  const saved = localStorage.getItem('sidebar_role');
  if (saved === 'student' || saved === 'teacher' || saved === 'admin' || saved === 'parent') return saved;
  return 'student';
}

/* ── Типи ─────────────────────────────────────── */
type Role = 'student' | 'teacher' | 'admin' | 'parent';

interface NavItem {
  label: string;
  href: string;
  emoji: string;
}

interface NavSection {
  group?: string; // якщо є — показати заголовок групи
  items: NavItem[];
}

/* ── Навігація по ролях ───────────────────────── */
const NAV_FLAT: Record<'student' | 'teacher' | 'parent', NavItem[]> = {
  student: [
    { label: 'Дашборд',         href: '/dashboard/student',  emoji: '🏠' },
    { label: 'Мої уроки',       href: '/dashboard/lessons',  emoji: '📅' },
    { label: 'Бібліотека',      href: '/library',             emoji: '📖' },
    { label: 'Календар',        href: '/calendar',            emoji: '📆' },
    { label: 'Дитячий модуль',  href: '/kids/dashboard',     emoji: '🧒' },
  ],
  teacher: [
    { label: 'Дашборд', href: '/dashboard/teacher',  emoji: '🏠' },
    { label: 'Учні',    href: '/dashboard/students', emoji: '👥' },
  ],
  parent: [],
};

const ADMIN_NAV: NavSection[] = [
  {
    group: 'Користувачі',
    items: [
      { label: 'Учні',    href: '/dashboard/students', emoji: '👥' },
      { label: 'Вчителі', href: '/dashboard/teachers', emoji: '👩‍🏫' },
    ],
  },
  {
    group: 'Контент',
    items: [
      { label: 'Бібліотека',   href: '/dashboard/library',        emoji: '📚' },
      { label: 'Конструктор',  href: '/dashboard/course-builder', emoji: '🛠️' },
    ],
  },
  {
    group: 'Система',
    items: [
      { label: 'Календар',      href: '/dashboard/calendar',  emoji: '📅' },
      { label: 'Чат',           href: '/dashboard/chat',      emoji: '💬' },
      { label: 'Налаштування',  href: '/dashboard/settings',  emoji: '⚙️' },
    ],
  },
];

const ROLE_LABELS: Record<Role, string> = {
  student: 'Учень',
  teacher: 'Вчитель',
  admin:   'Адмін',
  parent:  'Батьки',
};

const MOCK_USER = {
  name: 'Олексій К.',
  photo: 'https://randomuser.me/api/portraits/men/32.jpg',
};

/* ── Допоміжний компонент: один пункт меню ────── */
function NavLink({ item, pathname, onClick }: { item: NavItem; pathname: string; onClick: () => void }) {
  const active =
    pathname === item.href ||
    (item.href !== '/dashboard' && pathname.startsWith(item.href));

  return (
    <li>
      <Link
        href={item.href}
        onClick={onClick}
        aria-current={active ? 'page' : undefined}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          active
            ? 'bg-primary/10 text-primary-dark font-bold'
            : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
        }`}
      >
        <span className="text-base w-5 text-center flex-shrink-0">{item.emoji}</span>
        <span>{item.label}</span>
        {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" aria-hidden />}
      </Link>
    </li>
  );
}

/* ── Компонент ────────────────────────────────── */
export function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<Role>(getSavedRole);
  const [mobileOpen, setMobileOpen] = useState(false);

  const close = () => setMobileOpen(false);

  return (
    <>
      {/* Мобільний тогл */}
      <button
        className="fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-md border border-border md:hidden"
        onClick={() => setMobileOpen(o => !o)}
        aria-label={mobileOpen ? 'Закрити меню' : 'Відкрити меню'}
      >
        {mobileOpen ? (
          <svg className="w-5 h-5 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Оверлей мобільний */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={close}
          aria-hidden
        />
      )}

      {/* Sidebar панель */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-60 bg-white border-r border-border flex flex-col transition-transform duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0 md:flex-shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Лого */}
        <div className="px-5 pt-5 pb-4 border-b border-border flex-shrink-0">
          <Link href="/home" className="flex items-center gap-2.5" onClick={close}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-base font-black text-ink">
              English<span className="text-primary">Best</span>
            </span>
          </Link>
        </div>

        {/* Навігація */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto" aria-label="Навігація кабінету">
          {role === 'admin' ? (
            /* Згрупована навігація для адміна */
            <div className="flex flex-col gap-4">
              {ADMIN_NAV.map(section => (
                <div key={section.group}>
                  <p className="type-label text-ink-muted px-3 mb-1">
                    {section.group}
                  </p>
                  <ul className="flex flex-col gap-0.5">
                    {section.items.map(item => (
                      <NavLink key={item.href} item={item} pathname={pathname} onClick={close} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            /* Пласка навігація для учня / вчителя */
            <ul className="flex flex-col gap-0.5">
              {NAV_FLAT[role].map(item => (
                <NavLink key={item.href} item={item} pathname={pathname} onClick={close} />
              ))}
            </ul>
          )}
        </nav>

        {/* Профіль — завжди внизу */}
        <div className="px-3 pb-4 pt-2 border-t border-border flex-shrink-0">
          <Link
            href="/dashboard/profile"
            onClick={close}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-muted transition-colors group"
          >
            <div className="relative flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={MOCK_USER.photo}
                alt={MOCK_USER.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary border-2 border-white rounded-full" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink truncate leading-tight">{MOCK_USER.name}</p>
              <p className="text-xs text-ink-muted leading-tight">{ROLE_LABELS[role]}</p>
            </div>
            <svg className="w-4 h-4 text-ink-muted flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>
      </aside>
    </>
  );
}
