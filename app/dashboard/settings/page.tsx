'use client';
import { useState } from 'react';

/* ─── Toggle ─────────────────────────────────── */
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

/* ─── SettingRow ─────────────────────────────── */
function SettingRow({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 py-4 border-b border-border last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">{label}</p>
        {sub && <p className="text-xs text-ink-muted mt-0.5">{sub}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

/* ─── SectionCard ────────────────────────────── */
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-surface-muted">
        <h2 className="font-black text-ink">{title}</h2>
      </div>
      <div className="px-6">{children}</div>
    </div>
  );
}

/* ─── Головний компонент ─────────────────────── */
export default function SettingsPage() {
  // Ціни
  const [priceA0, setPriceA0] = useState('150');
  const [priceA1, setPriceA1] = useState('150');
  const [priceA2, setPriceA2] = useState('160');
  const [priceB1, setPriceB1] = useState('170');
  const [priceB2, setPriceB2] = useState('185');

  // Налаштування платформи
  const [trialEnabled,     setTrialEnabled]     = useState(true);
  const [autoAssign,       setAutoAssign]       = useState(true);
  const [waitlistEnabled,  setWaitlistEnabled]  = useState(false);
  const [reviewsPublic,    setReviewsPublic]    = useState(true);
  const [smsNotif,         setSmsNotif]         = useState(false);
  const [emailNotif,       setEmailNotif]       = useState(true);
  const [lowBalanceAlert,  setLowBalanceAlert]  = useState(true);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  // Пакети уроків
  const [packages, setPackages] = useState([
    { slug: 'pack-5',   name: '5 уроків',   lessons: 5,  price: 750,  discount: 0,   active: true },
    { slug: 'pack-10',  name: '10 уроків',  lessons: 10, price: 1400, discount: 7,   active: true },
    { slug: 'pack-20',  name: '20 уроків',  lessons: 20, price: 2600, discount: 13,  active: true },
    { slug: 'pack-50',  name: '50 уроків',  lessons: 50, price: 6000, discount: 20,  active: false },
  ]);

  function togglePackage(slug: string) {
    setPackages(prev => prev.map(p => p.slug === slug ? { ...p, active: !p.active } : p));
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Заголовок */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-ink">Налаштування</h1>
          <p className="text-ink-muted mt-0.5 text-sm">Керування платформою EnglishBest</p>
        </div>
        <button
          onClick={handleSave}
          className={`px-4 py-2.5 rounded-xl text-sm font-black transition-all flex-shrink-0 ${
            saved
              ? 'bg-primary/10 text-primary-dark'
              : 'bg-gradient-to-br from-primary to-primary-dark text-white hover:opacity-90'
          }`}
        >
          {saved ? '✓ Збережено' : 'Зберегти зміни'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Ціна уроку за рівнем */}
        <SectionCard title="Ціна уроку (₴/урок)">
          {[
            { label: 'A0 — Стартер для малюків',    val: priceA0, set: setPriceA0 },
            { label: 'A1 — Базовий рівень',          val: priceA1, set: setPriceA1 },
            { label: 'A2 — Передсередній рівень',    val: priceA2, set: setPriceA2 },
            { label: 'B1 — Середній рівень',         val: priceB1, set: setPriceB1 },
            { label: 'B2 — Впевнений / Сертифікати', val: priceB2, set: setPriceB2 },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between gap-4 py-3.5 border-b border-border last:border-0">
              <span className="text-sm font-medium text-ink">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-muted">₴</span>
                <input
                  type="number"
                  value={item.val}
                  onChange={e => item.set(e.target.value)}
                  className="w-20 h-9 px-3 rounded-xl border border-border text-sm text-ink font-black text-right focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          ))}
        </SectionCard>

        {/* Пакети уроків */}
        <SectionCard title="Пакети уроків">
          {packages.map(p => (
            <div key={p.slug} className="flex items-center justify-between gap-4 py-3.5 border-b border-border last:border-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-ink">{p.name}</p>
                  {p.discount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary-dark">
                      -{p.discount}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-muted">₴ {p.price.toLocaleString()} · ₴ {Math.round(p.price / p.lessons)}/урок</p>
              </div>
              <Toggle on={p.active} onChange={() => togglePackage(p.slug)} />
            </div>
          ))}
          <div className="py-3.5">
            <button className="text-xs font-bold text-primary-dark hover:underline">+ Додати пакет</button>
          </div>
        </SectionCard>
      </div>

      {/* Налаштування платформи */}
      <SectionCard title="Платформа">
        <SettingRow
          label="Пробний урок"
          sub="Дозволяє новим учням записатися на 1 безкоштовний урок"
        >
          <Toggle on={trialEnabled} onChange={setTrialEnabled} />
        </SettingRow>
        <SettingRow
          label="Автоматичне призначення вчителя"
          sub="Система сама підбирає вчителя відповідно до рівня та розкладу"
        >
          <Toggle on={autoAssign} onChange={setAutoAssign} />
        </SettingRow>
        <SettingRow
          label="Лист очікування"
          sub="Якщо немає доступних вчителів — додавати в чергу"
        >
          <Toggle on={waitlistEnabled} onChange={setWaitlistEnabled} />
        </SettingRow>
        <SettingRow
          label="Публічні відгуки"
          sub="Відгуки батьків відображаються на головній сторінці"
        >
          <Toggle on={reviewsPublic} onChange={setReviewsPublic} />
        </SettingRow>
      </SectionCard>

      {/* Сповіщення */}
      <SectionCard title="Сповіщення адміністратора">
        <SettingRow
          label="Email-звіти"
          sub="Щотижневий звіт про доходи та учнів на пошту"
        >
          <Toggle on={emailNotif} onChange={setEmailNotif} />
        </SettingRow>
        <SettingRow
          label="SMS-сповіщення"
          sub="Термінові сповіщення про критичні події"
        >
          <Toggle on={smsNotif} onChange={setSmsNotif} />
        </SettingRow>
        <SettingRow
          label="Попередження про низький баланс"
          sub="Сповіщати коли в учня залишилось ≤ 2 уроки"
        >
          <Toggle on={lowBalanceAlert} onChange={setLowBalanceAlert} />
        </SettingRow>
      </SectionCard>

      {/* Виплати вчителям */}
      <SectionCard title="Розрахунки з вчителями">
        <SettingRow
          label="День виплат"
          sub="Автоматична виплата заробітної плати"
        >
          <select className="h-9 px-3 rounded-xl border border-border bg-white text-sm text-ink font-medium focus:outline-none focus:border-primary">
            <option>5-го числа місяця</option>
            <option>10-го числа місяця</option>
            <option>15-го числа місяця</option>
            <option>Вручну</option>
          </select>
        </SettingRow>
        <SettingRow
          label="Спосіб виплат"
          sub="Метод переказу зарплати вчителям"
        >
          <select className="h-9 px-3 rounded-xl border border-border bg-white text-sm text-ink font-medium focus:outline-none focus:border-primary">
            <option>Банківський переказ</option>
            <option>Монобанк</option>
            <option>ПриватБанк</option>
          </select>
        </SettingRow>
        <SettingRow
          label="Мінімальна виплата"
          sub="Виплачувати тільки якщо сума більше"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink-muted">₴</span>
            <input
              type="number"
              defaultValue="500"
              className="w-20 h-9 px-3 rounded-xl border border-border text-sm text-ink font-black text-right focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </SettingRow>
      </SectionCard>

      {/* Небезпечна зона */}
      <div className="rounded-2xl border-2 border-danger/20 bg-danger/5 p-6">
        <h2 className="font-black text-ink mb-4">Небезпечна зона</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="px-4 py-2.5 rounded-xl border-2 border-danger text-danger font-bold text-sm hover:bg-danger hover:text-white transition-colors">
            Очистити тестові дані
          </button>
          <button className="px-4 py-2.5 rounded-xl border-2 border-danger text-danger font-bold text-sm hover:bg-danger hover:text-white transition-colors">
            Скинути налаштування
          </button>
          <button className="px-4 py-2.5 rounded-xl border-2 border-danger text-danger font-bold text-sm hover:bg-danger hover:text-white transition-colors">
            Видалити всі дані
          </button>
        </div>
      </div>
    </div>
  );
}
