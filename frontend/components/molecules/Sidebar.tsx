'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSession } from '@/lib/session-context';

type Role = 'student' | 'teacher' | 'admin' | 'parent';

type SessionRole = 'kids' | 'adult' | 'teacher' | 'parent' | 'admin';

function mapRole(r: SessionRole | undefined | null): Role {
  if (r === 'teacher' || r === 'admin' || r === 'parent') return r;
  return 'student';
}

function initialsOf(name: string | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase() || '?';
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavSection {
  group?: string;
  items: NavItem[];
}

/* ── Monochrome line icons (stroke 1.6, currentColor) ─────────────────── */
const ICON_PROPS = {
  className: 'w-[18px] h-[18px]',
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const I = {
  home: <svg {...ICON_PROPS}><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /></svg>,
  calendar: <svg {...ICON_PROPS}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>,
  analytics: <svg {...ICON_PROPS}><path d="M4 20V10M10 20V4M16 20v-6M22 20H2" /></svg>,
  users: <svg {...ICON_PROPS}><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5" /><circle cx="17" cy="9" r="2.5" /><path d="M15 19c0-2 2-3.5 4-3.5 1.7 0 3 1 3 2.5" /></svg>,
  groups: <svg {...ICON_PROPS}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>,
  attendance: <svg {...ICON_PROPS}><path d="M9 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7l4-4Z" /><path d="M8 12l2 2 4-4" /></svg>,
  library: <svg {...ICON_PROPS}><path d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14M4 19a2 2 0 0 0 2 2h14M4 19l2-2h14" /></svg>,
  homework: <svg {...ICON_PROPS}><path d="M4 4h12l4 4v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" /><path d="M16 4v4h4M8 13h8M8 17h6" /></svg>,
  mini: <svg {...ICON_PROPS}><path d="M12 3v9l6 3" /><circle cx="12" cy="12" r="9" /></svg>,
  chat: <svg {...ICON_PROPS}><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1Z" /></svg>,
  kid: <svg {...ICON_PROPS}><circle cx="12" cy="8" r="4" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></svg>,
  book: <svg {...ICON_PROPS}><path d="M4 6a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V6Z" /><path d="M4 20a2 2 0 0 1 2-2h12" /></svg>,
};

const NAV_FLAT: Record<'student' | 'parent' | 'admin', NavItem[]> = {
  student: [
    { label: 'Дашборд',        href: '/dashboard/student', icon: I.home },
    { label: 'Мої уроки',      href: '/kids/school',       icon: I.calendar },
    { label: 'Бібліотека',     href: '/library',           icon: I.book },
    { label: 'Календар',       href: '/calendar',          icon: I.calendar },
    { label: 'Дитячий модуль', href: '/kids/dashboard',    icon: I.kid },
  ],
  parent: [
    { label: 'Дашборд',   href: '/dashboard/parent', icon: I.home },
    { label: 'Календар',  href: '/calendar',         icon: I.calendar },
    { label: 'Чат',       href: '/dashboard/chat',   icon: I.chat },
  ],
  admin: [
    { label: 'Дашборд',    href: '/dashboard/admin',     icon: I.home },
    { label: 'Аналітика',  href: '/dashboard/analytics', icon: I.analytics },
    { label: 'Учні',       href: '/dashboard/students',  icon: I.users },
    { label: 'Бібліотека', href: '/library',             icon: I.book },
    { label: 'Календар',   href: '/calendar',            icon: I.calendar },
  ],
};

const TEACHER_NAV: NavSection[] = [
  {
    group: 'Огляд',
    items: [
      { label: 'Дашборд',   href: '/dashboard/teacher',          icon: I.home },
      { label: 'Розклад',   href: '/dashboard/teacher-calendar', icon: I.calendar },
      { label: 'Аналітика', href: '/dashboard/analytics',        icon: I.analytics },
    ],
  },
  {
    group: 'Учні',
    items: [
      { label: 'Учні',           href: '/dashboard/students',   icon: I.users },
      { label: 'Групи',          href: '/dashboard/groups',     icon: I.groups },
      { label: 'Відвідуваність', href: '/dashboard/attendance', icon: I.attendance },
    ],
  },
  {
    group: 'Навчання',
    items: [
      { label: 'Бібліотека',       href: '/dashboard/library',    icon: I.library },
      { label: 'Домашні завдання', href: '/dashboard/homework',   icon: I.homework },
      { label: 'Міні-завдання',    href: '/dashboard/mini-tasks', icon: I.mini },
    ],
  },
  {
    group: 'Комунікація',
    items: [
      { label: 'Чат', href: '/dashboard/chat', icon: I.chat },
    ],
  },
];

const ROLE_LABELS: Record<Role, string> = {
  student: 'Учень',
  teacher: 'Вчитель',
  admin:   'Адмін',
  parent:  'Батьки',
};

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
        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
          active
            ? 'bg-surface-muted text-ink'
            : 'text-ink-muted hover:bg-surface-muted/70 hover:text-ink'
        }`}
      >
        <span className={`flex-shrink-0 ${active ? 'text-ink' : 'text-ink-faint'}`}>{item.icon}</span>
        <span className="truncate">{item.label}</span>
      </Link>
    </li>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { session } = useSession();
  const role = mapRole(session?.profile?.role as SessionRole | undefined);
  const name =
    session?.profile?.firstName ??
    session?.profile?.displayName ??
    session?.user?.email ??
    '';
  const [mobileOpen, setMobileOpen] = useState(false);

  const close = () => setMobileOpen(false);

  return (
    <>
      <button
        className="fixed top-3 left-3 z-50 w-9 h-9 bg-white rounded-lg border border-border flex items-center justify-center md:hidden print:hidden"
        onClick={() => setMobileOpen(o => !o)}
        aria-label={mobileOpen ? 'Закрити меню' : 'Відкрити меню'}
      >
        {mobileOpen ? (
          <svg className="w-4 h-4 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={close}
          aria-hidden
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-60 bg-white border-r border-border flex flex-col transition-transform duration-200 md:sticky md:top-0 md:h-dvh md:translate-x-0 md:flex-shrink-0 print:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-4 pt-4 pb-3 flex-shrink-0">
          <Link href="/home" className="flex items-center gap-2" onClick={close}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/characters/fox/idle.png" alt="" className="w-8 h-8 object-contain flex-shrink-0" />
            <span className="text-[14px] font-semibold text-ink tracking-tight">English<span className="text-ink-muted font-medium">Best</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-3 pb-2 overflow-y-auto" aria-label="Навігація кабінету">
          {role === 'teacher' ? (
            <div className="flex flex-col gap-5">
              {TEACHER_NAV.map(section => (
                <div key={section.group}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint px-2.5 mb-1.5">
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
            <ul className="flex flex-col gap-0.5">
              {NAV_FLAT[role].map(item => (
                <NavLink key={item.href} item={item} pathname={pathname} onClick={close} />
              ))}
            </ul>
          )}
        </nav>

        <div className="px-3 pb-3 pt-2 border-t border-border flex-shrink-0">
          <Link
            href="/dashboard/profile"
            onClick={close}
            className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-surface-muted transition-colors group"
          >
            <div
              aria-hidden
              className="w-7 h-7 rounded-full bg-surface-muted text-ink-muted flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
            >
              {initialsOf(name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-ink truncate leading-tight">{name || '—'}</p>
              <p className="text-[11px] text-ink-muted leading-tight">{ROLE_LABELS[role]}</p>
            </div>
            <svg className="w-3.5 h-3.5 text-ink-faint flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>
      </aside>
    </>
  );
}
