'use client';
import { useState } from 'react';
import { Sidebar } from '@/components/molecules/Sidebar';

/* ─── Мок-дані ───────────────────────────────── */
const USER = {
  name: 'Олексій Карпенко',
  email: 'oleksiy@example.com',
  phone: '+380 97 123 45 67',
  level: 'A1',
  levelColor: 'bg-accent/10 text-accent-dark',
  photo: 'https://randomuser.me/api/portraits/men/32.jpg',
  memberSince: 'Лютий 2026',
  timezone: 'Kyiv (UTC+3)',
  lessonsLeft: 8,
  balance: 1200,
};

const TRANSACTIONS = [
  { id: '1', date: '28 бер 2026', desc: 'Поповнення — 10 уроків', amount: '+₴ 1 500', positive: true },
  { id: '2', date: '15 бер 2026', desc: 'Урок з Maria S.',         amount: '−₴ 150',   positive: false },
  { id: '3', date: '12 бер 2026', desc: 'Урок з Maria S.',         amount: '−₴ 150',   positive: false },
  { id: '4', date: '1 бер 2026',  desc: 'Поповнення — 5 уроків',  amount: '+₴ 750',   positive: true },
  { id: '5', date: '20 лют 2026', desc: 'Урок з Maria S.',         amount: '−₴ 150',   positive: false },
  { id: '6', date: '15 лют 2026', desc: 'Урок з Maria S.',         amount: '−₴ 150',   positive: false },
  { id: '7', date: '1 лют 2026',  desc: 'Поповнення — 5 уроків',  amount: '+₴ 750',   positive: true },
];

const ACHIEVEMENTS = [
  { emoji: '🏆', label: 'Перший урок',   desc: 'Завершено перший урок' },
  { emoji: '🔥', label: '14 днів',       desc: 'Серія занять 14 днів' },
  { emoji: '⭐', label: '300 слів',      desc: 'Вивчено 300 слів' },
  { emoji: '🎓', label: 'A1 рівень',     desc: 'Досягнуто рівень A1' },
];

/* ─── Toggle ──────────────────────────────────── */
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${on ? 'bg-gradient-to-r from-primary to-primary-dark' : 'bg-border'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

/* ─── Field ───────────────────────────────────── */
function Field({ label, value, type = 'text', onChange }: { label: string; value: string; type?: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-black text-ink-muted uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-11 px-4 rounded-xl border border-border bg-white text-sm text-ink font-medium focus:outline-none focus:border-primary transition-colors"
      />
    </div>
  );
}

/* ─── Card ────────────────────────────────────── */
function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="font-black text-ink">{title}</h2>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ─── Модалка історії платежів ────────────────── */
function PaymentsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
        {/* Шапка */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 className="font-black text-ink">Історія платежів</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Список */}
        <div className="overflow-y-auto flex-1 px-6 py-2">
          <div className="flex flex-col divide-y divide-border">
            {TRANSACTIONS.map(t => (
              <div key={t.id} className="flex items-center justify-between gap-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm ${t.positive ? 'bg-primary/10 text-primary-dark' : 'bg-surface-muted text-ink-muted'}`}>
                    {t.positive ? '↑' : '↓'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{t.desc}</p>
                    <p className="text-xs text-ink-muted">{t.date}</p>
                  </div>
                </div>
                <span className={`text-sm font-black flex-shrink-0 ${t.positive ? 'text-primary-dark' : 'text-ink'}`}>
                  {t.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Підвал */}
        <div className="px-6 py-4 border-t border-border flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-surface-muted text-sm font-bold text-ink hover:bg-border transition-colors"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Головний компонент ─────────────────────── */
export default function ProfilePage() {
  const [name,     setName]     = useState(USER.name);
  const [email,    setEmail]    = useState(USER.email);
  const [phone,    setPhone]    = useState(USER.phone);
  const [timezone, setTimezone] = useState(USER.timezone);
  const [saved,    setSaved]    = useState(false);
  const [showPayments, setShowPayments] = useState(false);

  const [notifLesson,  setNotifLesson]  = useState(true);
  const [notifWeekly,  setNotifWeekly]  = useState(true);
  const [notifPromo,   setNotifPromo]   = useState(false);
  const [notifEmail,   setNotifEmail]   = useState(true);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex min-h-screen bg-surface-muted items-start">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 pt-16 md:pt-8 min-w-0 min-h-screen">
        <div className="flex flex-col gap-6">

          {/* Заголовок */}
          <div>
            <h1 className="text-2xl font-black text-ink">Профіль</h1>
            <p className="text-ink-muted mt-0.5 text-sm">Керуйте особистими даними та налаштуваннями</p>
          </div>

          {/* Верхній ряд */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

            {/* Профіль-картка */}
            <div className="bg-white rounded-2xl border border-border p-6 flex items-center gap-5">
              <div className="relative flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={USER.photo} alt={USER.name} className="w-20 h-20 rounded-2xl object-cover" />
                <button className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md hover:opacity-90 transition-opacity">
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="font-black text-ink text-xl">{USER.name}</h2>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${USER.levelColor}`}>{USER.level}</span>
                </div>
                <p className="text-sm text-ink-muted">{USER.email}</p>
                <p className="text-xs text-ink-muted mt-1">Учень з {USER.memberSince}</p>
              </div>
            </div>

            {/* Баланс — відкриває модалку платежів */}
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">Залишок уроків</p>
                  <p className="text-5xl font-black text-white leading-none">{USER.lessonsLeft}</p>
                  <p className="text-white/60 text-sm mt-1">оплачених уроків</p>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">Баланс</p>
                  <p className="text-xl font-black text-white">₴ {USER.balance.toLocaleString()}</p>
                  <button
                    onClick={() => setShowPayments(true)}
                    className="text-xs text-white/70 hover:text-white underline underline-offset-2 mt-1 transition-colors"
                  >
                    Історія →
                  </button>
                </div>
              </div>
              <button className="w-full py-2.5 rounded-xl bg-white text-primary-dark font-black text-sm hover:bg-white/90 transition-colors">
                Поповнити баланс →
              </button>
            </div>
          </div>

          {/* Середній ряд */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Особисті дані */}
            <Card
              title="Особисті дані"
              action={
                <button
                  onClick={handleSave}
                  className={`text-xs font-black px-4 py-2 rounded-xl transition-all ${
                    saved
                      ? 'bg-primary/10 text-primary-dark'
                      : 'bg-gradient-to-br from-primary to-primary-dark text-white hover:opacity-90'
                  }`}
                >
                  {saved ? '✓ Збережено' : 'Зберегти'}
                </button>
              }
            >
              <div className="flex flex-col gap-4">
                <Field label="Повне ім'я"    value={name}     onChange={setName} />
                <Field label="Email"          value={email}    onChange={setEmail}    type="email" />
                <Field label="Телефон"        value={phone}    onChange={setPhone}    type="tel" />
                <Field label="Часовий пояс"   value={timezone} onChange={setTimezone} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-ink-muted uppercase tracking-wide">Мова навчання</label>
                  <select className="h-11 px-4 rounded-xl border border-border bg-white text-sm text-ink font-medium focus:outline-none focus:border-primary transition-colors appearance-none">
                    <option>Українська</option>
                    <option>Польська</option>
                    <option>Німецька</option>
                  </select>
                </div>
              </div>
            </Card>

            <div className="flex flex-col gap-4">
              {/* Сповіщення */}
              <Card title="Сповіщення">
                <div className="flex flex-col gap-4">
                  {[
                    { label: 'Нагадування про урок',    sub: 'За 30 хвилин до початку',        value: notifLesson,  set: setNotifLesson },
                    { label: 'Тижневий звіт',           sub: 'Прогрес і статистика за тиждень', value: notifWeekly,  set: setNotifWeekly },
                    { label: 'Email-розсилка',          sub: 'Поради та нові матеріали',         value: notifEmail,   set: setNotifEmail },
                    { label: 'Акції та пропозиції',     sub: 'Знижки та спеціальні пропозиції', value: notifPromo,   set: setNotifPromo },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink">{item.label}</p>
                        <p className="text-xs text-ink-muted">{item.sub}</p>
                      </div>
                      <Toggle on={item.value} onChange={item.set} />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Досягнення */}
              <Card title="Досягнення">
                <div className="grid grid-cols-2 gap-2">
                  {ACHIEVEMENTS.map(a => (
                    <div key={a.label} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-muted">
                      <span className="text-xl flex-shrink-0">{a.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-ink truncate">{a.label}</p>
                        <p className="text-[10px] text-ink-muted truncate">{a.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Акаунт та безпека */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-black text-ink">Акаунт</h2>
            </div>
            <div className="p-6 flex flex-col gap-3">
              <button className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-border hover:bg-surface-muted transition-colors text-left group">
                <div>
                  <p className="text-sm font-semibold text-ink">Змінити пароль</p>
                  <p className="text-xs text-ink-muted">Востаннє змінено: ніколи</p>
                </div>
                <svg className="w-4 h-4 text-ink-muted group-hover:text-ink transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              <div className="border-t border-border pt-3 flex flex-col gap-2">
                <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-border hover:bg-surface-muted transition-colors text-left text-sm font-semibold text-ink-muted hover:text-ink">
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  Вийти з акаунту
                </button>
                <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-danger/30 hover:bg-danger/5 transition-colors text-left text-sm font-semibold text-danger">
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                  Видалити акаунт
                  <span className="text-xs text-danger/70 font-normal ml-auto">Незворотна дія</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Модалка платежів */}
      {showPayments && <PaymentsModal onClose={() => setShowPayments(false)} />}
    </div>
  );
}
