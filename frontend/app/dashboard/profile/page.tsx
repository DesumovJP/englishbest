'use client';
import { useEffect, useState } from 'react';
import { LevelBadge, PageHeader } from '@/components/teacher/ui';

type Role = 'student' | 'teacher' | 'admin' | 'parent';

const ROLE_LABEL: Record<Role, string> = {
  student: 'Учень',
  teacher: 'Вчитель',
  admin:   'Адміністратор',
  parent:  'Батьки',
};

const USERS: Record<Role, {
  name: string;
  email: string;
  phone: string;
  photo: string;
  memberSince: string;
  timezone: string;
  level?: 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  lessonsLeft?: number;
  balance?: number;
  ratePerLesson?: number;
  lessonsThisMonth?: number;
  pendingPayout?: number;
  children?: { name: string; level: 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' }[];
}> = {
  student: {
    name: 'Олексій Карпенко',
    email: 'oleksiy@example.com',
    phone: '+380 97 123 45 67',
    level: 'A1',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    memberSince: 'Лютий 2026',
    timezone: 'Kyiv (UTC+3)',
    lessonsLeft: 8,
    balance: 1200,
  },
  teacher: {
    name: 'Maria Sydorenko',
    email: 'maria.s@englishbest.com',
    phone: '+380 93 555 12 34',
    photo: 'https://randomuser.me/api/portraits/women/65.jpg',
    memberSince: 'Бер 2022',
    timezone: 'Kyiv (UTC+3)',
    ratePerLesson: 180,
    lessonsThisMonth: 42,
    pendingPayout: 7560,
  },
  admin: {
    name: 'Administrator',
    email: 'admin@englishbest.com',
    phone: '+380 67 111 22 33',
    photo: 'https://randomuser.me/api/portraits/men/12.jpg',
    memberSince: 'Січ 2021',
    timezone: 'Kyiv (UTC+3)',
  },
  parent: {
    name: 'Олена Коваль',
    email: 'olena.koval@gmail.com',
    phone: '+38 050 123 45 67',
    photo: 'https://randomuser.me/api/portraits/women/44.jpg',
    memberSince: 'Вер 2023',
    timezone: 'Kyiv (UTC+3)',
    children: [
      { name: 'Аліса Коваль', level: 'A0' },
      { name: 'Максим Коваль', level: 'A2' },
    ],
  },
};

const TRANSACTIONS = [
  { id: '1', date: '28 бер 2026', desc: 'Поповнення — 10 уроків', amount: 1500,  positive: true  },
  { id: '2', date: '15 бер 2026', desc: 'Урок з Maria S.',        amount: -150,  positive: false },
  { id: '3', date: '12 бер 2026', desc: 'Урок з Maria S.',        amount: -150,  positive: false },
  { id: '4', date: '1 бер 2026',  desc: 'Поповнення — 5 уроків',  amount: 750,   positive: true  },
  { id: '5', date: '20 лют 2026', desc: 'Урок з Maria S.',        amount: -150,  positive: false },
  { id: '6', date: '15 лют 2026', desc: 'Урок з Maria S.',        amount: -150,  positive: false },
  { id: '7', date: '1 лют 2026',  desc: 'Поповнення — 5 уроків',  amount: 750,   positive: true  },
];

const ACHIEVEMENTS = [
  { label: 'Перший урок',  desc: 'Завершено перший урок' },
  { label: '14 днів',      desc: 'Серія занять 14 днів' },
  { label: '300 слів',     desc: 'Вивчено 300 слів' },
  { label: 'A1 рівень',    desc: 'Досягнуто рівень A1' },
];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative w-[42px] h-[26px] rounded-full transition-colors flex-shrink-0 ${on ? 'bg-primary' : 'bg-border'}`}
    >
      <span className={`absolute top-[2px] left-[2px] w-[22px] h-[22px] bg-white rounded-full shadow-sm transition-transform ${on ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

function Field({ label, value, type = 'text', onChange }: { label: string; value: string; type?: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-9 px-3 rounded-md border border-border bg-white text-[13px] text-ink focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-[border-color,box-shadow]"
      />
    </div>
  );
}

function SectionCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="ios-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-border">
        <h2 className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function PaymentsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-5" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
          <h2 className="text-[13px] font-semibold text-ink">Історія платежів</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-ink-muted hover:bg-surface-muted transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {TRANSACTIONS.map(t => (
            <div key={t.id} className="flex items-center justify-between gap-4 px-5 py-3 border-t border-border first:border-t-0">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-ink">{t.desc}</p>
                <p className="text-[11px] text-ink-muted tabular-nums">{t.date}</p>
              </div>
              <span className={`text-[13px] font-semibold tabular-nums flex-shrink-0 ${t.positive ? 'text-ink' : 'text-ink-muted'}`}>
                {t.positive ? '+' : '−'}₴{Math.abs(t.amount).toLocaleString('uk-UA')}
              </span>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-border flex-shrink-0">
          <button onClick={onClose} className="ios-btn ios-btn-secondary w-full">Закрити</button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [role, setRole] = useState<Role>('student');
  const user = USERS[role];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = (localStorage.getItem('demo_role') ?? localStorage.getItem('sidebar_role')) as Role | null;
    if (stored && stored in USERS) setRole(stored);
  }, []);

  const [name,     setName]     = useState(user.name);
  const [email,    setEmail]    = useState(user.email);
  const [phone,    setPhone]    = useState(user.phone);
  const [timezone, setTimezone] = useState(user.timezone);
  const [saved,    setSaved]    = useState(false);
  const [showPayments, setShowPayments] = useState(false);

  useEffect(() => {
    setName(user.name); setEmail(user.email); setPhone(user.phone); setTimezone(user.timezone);
  }, [user]);

  const [notifLesson, setNotifLesson] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(true);
  const [notifPromo,  setNotifPromo]  = useState(false);
  const [notifEmail,  setNotifEmail]  = useState(true);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const memberLabel =
    role === 'student' ? `Учень з ${user.memberSince}` :
    role === 'teacher' ? `Викладає з ${user.memberSince}` :
    role === 'parent'  ? `З нами з ${user.memberSince}` :
                         `Адмін з ${user.memberSince}`;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Профіль" subtitle={`${ROLE_LABEL[role]} · особисті дані, сповіщення та акаунт`} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <section className="ios-card p-5 flex items-center gap-5">
          <div className="relative flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user.photo} alt={user.name} className="w-16 h-16 rounded-full object-cover" referrerPolicy="no-referrer" />
            <button className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-opacity" aria-label="Змінити фото">
              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[15px] font-semibold text-ink">{user.name}</h2>
              {user.level && <LevelBadge level={user.level} />}
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted px-2 py-0.5 rounded-md bg-surface-muted">{ROLE_LABEL[role]}</span>
            </div>
            <p className="text-[12px] text-ink-muted mt-0.5">{user.email}</p>
            <p className="text-[11px] text-ink-faint mt-1">{memberLabel}</p>
          </div>
        </section>

        {role === 'student' && (
          <section className="rounded-[14px] bg-primary/[0.06] border border-primary/25 p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-dark/70">Залишок</p>
                <p className="text-[32px] font-semibold text-primary-dark leading-none mt-1 tabular-nums">{user.lessonsLeft}</p>
                <p className="text-[11px] text-ink-muted mt-1">уроків</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-dark/70">Баланс</p>
                <p className="text-[18px] font-semibold text-ink mt-1 tabular-nums">₴{user.balance?.toLocaleString('uk-UA')}</p>
                <button onClick={() => setShowPayments(true)} className="text-[11px] text-ink-muted hover:text-ink underline underline-offset-2 mt-1 transition-colors">
                  Історія
                </button>
              </div>
            </div>
            <button className="ios-btn ios-btn-primary w-full">
              Поповнити баланс
            </button>
          </section>
        )}

        {role === 'teacher' && (
          <section className="rounded-[14px] bg-primary/[0.06] border border-primary/25 p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-dark/70">До виплати</p>
                <p className="text-[26px] font-semibold text-primary-dark leading-none mt-1 tabular-nums">₴{user.pendingPayout?.toLocaleString('uk-UA')}</p>
                <p className="text-[11px] text-ink-muted mt-1 tabular-nums">{user.lessonsThisMonth} уроків цього місяця</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-dark/70">Ставка</p>
                <p className="text-[18px] font-semibold text-ink mt-1 tabular-nums">₴{user.ratePerLesson}</p>
                <p className="text-[11px] text-ink-muted mt-1">за урок</p>
              </div>
            </div>
            <a href="/dashboard/payments" className="ios-btn ios-btn-primary w-full">
              Історія виплат
            </a>
          </section>
        )}

        {role === 'admin' && (
          <section className="ios-card p-5 flex flex-col gap-3">
            <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">Повний доступ</p>
            <div className="flex flex-col gap-2 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Учнів</span>
                <span className="font-semibold text-ink tabular-nums">156</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Вчителів</span>
                <span className="font-semibold text-ink tabular-nums">6</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Програм</span>
                <span className="font-semibold text-ink tabular-nums">8</span>
              </div>
            </div>
          </section>
        )}

        {role === 'parent' && (
          <section className="ios-card p-5 flex flex-col gap-3">
            <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">Мої діти</p>
            <ul className="flex flex-col gap-2">
              {user.children?.map(c => (
                <li key={c.name} className="flex items-center justify-between gap-3">
                  <span className="text-[13px] text-ink truncate">{c.name}</span>
                  <LevelBadge level={c.level} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard
          title="Особисті дані"
          action={
            <button
              onClick={handleSave}
              className={`ios-btn ${saved ? 'ios-btn-secondary' : 'ios-btn-primary'}`}
            >
              {saved ? 'Збережено' : 'Зберегти'}
            </button>
          }
        >
          <div className="flex flex-col gap-4">
            <Field label="Повне ім'я"   value={name}     onChange={setName} />
            <Field label="Email"         value={email}    onChange={setEmail}    type="email" />
            <Field label="Телефон"       value={phone}    onChange={setPhone}    type="tel" />
            <Field label="Часовий пояс"  value={timezone} onChange={setTimezone} />
            {role === 'student' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">Мова навчання</label>
                <select className="h-9 px-3 rounded-md border border-border bg-white text-[13px] text-ink focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-[border-color,box-shadow]">
                  <option>Українська</option>
                  <option>Польська</option>
                  <option>Німецька</option>
                </select>
              </div>
            )}
          </div>
        </SectionCard>

        <div className="flex flex-col gap-4">
          <section className="ios-card overflow-hidden">
            <div className="px-5 py-2.5 border-b border-border">
              <h2 className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">Сповіщення</h2>
            </div>
            <div className="px-5">
              {[
                { label: 'Нагадування про урок',  sub: 'За 30 хвилин до початку',         value: notifLesson, set: setNotifLesson },
                { label: 'Тижневий звіт',         sub: 'Прогрес і статистика за тиждень', value: notifWeekly, set: setNotifWeekly },
                { label: 'Email-розсилка',        sub: 'Поради та нові матеріали',        value: notifEmail,  set: setNotifEmail },
                { label: 'Акції та пропозиції',   sub: 'Знижки та спеціальні пропозиції', value: notifPromo,  set: setNotifPromo },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between gap-4 py-3 border-t border-border first:border-t-0">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink">{item.label}</p>
                    <p className="text-[11px] text-ink-muted mt-0.5">{item.sub}</p>
                  </div>
                  <Toggle on={item.value} onChange={item.set} />
                </div>
              ))}
            </div>
          </section>

          {role === 'student' && (
            <section className="ios-card overflow-hidden">
              <div className="px-5 py-2.5 border-b border-border">
                <h2 className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">Досягнення</h2>
              </div>
              <div className="p-5 grid grid-cols-2 gap-2">
                {ACHIEVEMENTS.map(a => (
                  <div key={a.label} className="px-3 py-2.5 rounded-md border border-border">
                    <p className="text-[12px] font-semibold text-ink truncate">{a.label}</p>
                    <p className="text-[11px] text-ink-muted truncate mt-0.5">{a.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <section className="ios-card overflow-hidden">
        <div className="px-5 py-2.5 border-b border-border">
          <h2 className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">Акаунт</h2>
        </div>
        <div className="px-5">
          <button className="flex items-center justify-between gap-4 w-full py-3 border-t border-border first:border-t-0 text-left hover:bg-surface-muted/40 transition-colors -mx-5 px-5">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-ink">Змінити пароль</p>
              <p className="text-[11px] text-ink-muted mt-0.5">Востаннє змінено: ніколи</p>
            </div>
            <svg className="w-3.5 h-3.5 text-ink-faint flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden><path d="M9 18l6-6-6-6" /></svg>
          </button>
          <div className="py-3 border-t border-border flex flex-col sm:flex-row gap-2">
            <button className="ios-btn ios-btn-secondary">Вийти з акаунту</button>
            <button className="ios-btn ios-btn-secondary text-danger-dark sm:ml-auto">Видалити акаунт</button>
          </div>
        </div>
      </section>

      {showPayments && <PaymentsModal onClose={() => setShowPayments(false)} />}
    </div>
  );
}
