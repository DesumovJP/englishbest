import Link from 'next/link';
import { QuizWidget } from '@/components/molecules/QuizWidget';
import { HeroSlider } from '@/components/molecules/HeroSlider';
import { LanguageSwitcher } from '@/components/atoms/LanguageSwitcher';
import { PopupTimer } from '@/components/molecules/PopupTimer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EnglishBest — Онлайн-уроки англійської для дітей',
  description:
    'Індивідуальні онлайн-уроки англійської для дітей. Перший урок безкоштовно. Сертифіковані вчителі.',
};

/* ─── Головний компонент ─────────────────────── */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <PopupTimer />

      {/* ── Навігація ── */}
      <header className="sticky top-0 z-40 bg-white border-b-2 border-surface-muted">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-lg font-black text-ink">
              English<span className="text-primary">Best</span>
            </span>
          </Link>

          <nav aria-label="Навігація" className="hidden md:flex items-center gap-1">
            {[
              { label: 'Як навчаємо', href: '#methodology' },
              { label: 'Формати', href: '#formats' },
              { label: 'Ціни', href: '#pricing' },
              { label: 'Вчителі', href: '#teachers-heading' },
              { label: 'Батькам', href: '#reviews' },
            ].map(item => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-semibold text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors px-3 py-2 rounded-lg"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <div className="w-px h-5 bg-border mx-1 hidden md:block" aria-hidden />
            <Link
              href="/login"
              className="hidden md:block text-sm font-semibold text-ink-muted hover:text-ink px-3 py-2 rounded-lg hover:bg-surface-muted transition-colors"
            >
              Увійти
            </Link>
            <Link
              href="/login"
              className="bg-gradient-to-br from-primary to-primary-dark hover:opacity-90 text-white font-black text-sm px-4 py-2.5 rounded-xl transition-opacity shadow-sm"
            >
              Спробувати безкоштовно
            </Link>
          </div>
        </div>
      </header>

      <main>

        {/* ── Hero ── */}
        <section className="min-h-[calc(100vh-4rem)] flex items-center px-5 py-16 bg-white">
          <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-center">

            {/* Ліва — текст */}
            <div className="flex flex-col gap-6">
              <p className="text-xs font-black text-primary uppercase tracking-widest">
                Онлайн-школа англійської для дітей
              </p>

              <h1 className="text-5xl md:text-[3.5rem] font-black text-ink tracking-tight leading-[1.03]">
                Дитина заговорить<br />
                <span className="text-primary">англійською</span><br />
                вже за місяць
              </h1>

              <p className="text-lg text-ink-muted leading-relaxed max-w-[26rem]">
                Один на один із сертифікованим вчителем. Програма під вік і характер вашої дитини.
              </p>

              <div className="flex flex-col gap-4 mt-1">
                <div className="w-fit">
                  <QuizWidget variant="primary" />
                </div>

                {/* Соціальний доказ */}
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[
                      { id: 12, gender: 'women' },
                      { id: 44, gender: 'women' },
                      { id: 32, gender: 'men' },
                      { id: 65, gender: 'women' },
                    ].map((a, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={a.id}
                        src={`https://randomuser.me/api/portraits/${a.gender}/${a.id}.jpg`}
                        alt=""
                        aria-hidden
                        className={`w-7 h-7 rounded-full border-2 border-white object-cover${i > 0 ? ' -ml-2' : ''}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-ink-muted">
                    <span className="font-bold text-ink">1 200+ батьків</span> вже обрали нас
                  </p>
                </div>
              </div>
            </div>

            {/* Права — слайдер */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md drop-shadow-2xl">
                <HeroSlider />
              </div>
            </div>

          </div>
        </section>

        {/* ── Логотипи партнерів ── */}
        <section aria-label="Партнери" className="py-10 px-5 border-y border-border bg-white">
          <div className="max-w-5xl mx-auto flex flex-col gap-5 items-center">
            <p className="text-xs font-black text-ink-muted uppercase tracking-widest text-center">Нам довіряють</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {[
                'Lingua Kids Academy',
                'Oxford Junior Club',
                'StarEnglish UA',
                'BrightMinds School',
                'KidsLearn Online',
              ].map(name => (
                <span key={name} className="text-sm font-black text-ink-muted/60 tracking-tight whitespace-nowrap">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Як відбувається запис ── */}
        <section className="py-20 px-5 bg-white">
          <div className="max-w-5xl mx-auto flex flex-col gap-12">
            <div>
              <p className="text-xs font-black text-primary uppercase tracking-widest mb-3">Простий старт</p>
              <h2 className="text-3xl md:text-4xl font-black text-ink leading-tight">
                Як відбувається запис
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: '01',
                  emoji: '🎯',
                  title: 'Запис на безкоштовний пробний урок',
                  desc: 'Оберіть зручний час і залиште контакти. Адміністратор зателефонує у зручний для вас час — або напише у месенджер, якщо ви обрали цей варіант.',
                  color: 'bg-purple/5 border-purple/20',
                  numColor: 'text-purple/20',
                },
                {
                  step: '02',
                  emoji: '🤝',
                  title: 'Безкоштовна діагностика',
                  desc: 'Адміністратор проводить вступне заняття, визначає рівень дитини і підбирає програму. Перший урок — ознайомчий і повністю безкоштовний.',
                  color: 'bg-accent/5 border-accent/20',
                  numColor: 'text-accent/20',
                },
                {
                  step: '03',
                  emoji: '📈',
                  title: 'Фідбек і старт навчання',
                  desc: 'Після пробного уроку ви отримуєте зворотній зв\u2019язок, рекомендовану програму та деталі навчання. Підписуємо договір і починаємо!',
                  color: 'bg-primary/5 border-primary/20',
                  numColor: 'text-primary/20',
                },
              ].map(s => (
                <div key={s.step} className={`relative rounded-2xl border-2 p-7 flex flex-col gap-4 ${s.color}`}>
                  <p className={`absolute top-5 right-6 text-5xl font-black leading-none select-none ${s.numColor}`}>
                    {s.step}
                  </p>
                  <span className="text-3xl">{s.emoji}</span>
                  <div>
                    <h3 className="font-black text-ink text-lg leading-snug">{s.title}</h3>
                    <p className="text-sm text-ink-muted mt-2 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Про нас + підхід ── */}
        <section id="methodology" className="py-20 px-5 bg-white">
          <div className="max-w-5xl mx-auto flex flex-col gap-10">

            {/* Заголовок */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="text-xs font-black text-primary uppercase tracking-widest mb-3">Наша методика</p>
                <h2 className="text-3xl md:text-4xl font-black text-ink leading-tight">
                  Ми навчаємо по-іншому
                </h2>
              </div>
              <p className="text-ink-muted max-w-sm text-sm leading-relaxed">
                Онлайн-школа з 2019 року. Без шаблонів — кожен урок будується навколо інтересів вашої дитини.
              </p>
            </div>

            {/* Бенто-сітка */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              {/* Великий зелений блок */}
              <div className="col-span-2 relative overflow-hidden rounded-2xl min-h-[160px] bg-gradient-to-br from-primary to-primary-dark">
                <svg
                  viewBox="0 0 320 140"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute bottom-0 right-0 h-full w-auto opacity-[0.18] pointer-events-none"
                  aria-hidden
                  preserveAspectRatio="xMaxYMax meet"
                >
                  <rect x="0" y="85" width="22" height="55" fill="white" />
                  <rect x="25" y="65" width="18" height="75" fill="white" />
                  <rect x="46" y="78" width="28" height="62" fill="white" />
                  <rect x="82" y="90" width="16" height="50" fill="white" />
                  <rect x="84" y="38" width="12" height="54" fill="white" />
                  <rect x="81" y="54" width="18" height="20" fill="white" />
                  <polygon points="84,38 90,20 96,38" fill="white" />
                  <rect x="98" y="90" width="66" height="50" fill="white" />
                  <rect x="100" y="82" width="5" height="9" fill="white" /><polygon points="100,82 102.5,76 105,82" fill="white" />
                  <rect x="112" y="84" width="5" height="7" fill="white" /><polygon points="112,84 114.5,78 117,84" fill="white" />
                  <rect x="124" y="84" width="5" height="7" fill="white" /><polygon points="124,84 126.5,78 129,84" fill="white" />
                  <rect x="136" y="84" width="5" height="7" fill="white" /><polygon points="136,84 138.5,78 141,84" fill="white" />
                  <rect x="150" y="82" width="5" height="9" fill="white" /><polygon points="150,82 152.5,76 155,82" fill="white" />
                  <rect x="162" y="90" width="92" height="5" fill="white" />
                  <rect x="172" y="50" width="18" height="90" fill="white" />
                  <rect x="169" y="55" width="24" height="14" fill="white" />
                  <polygon points="172,50 181,34 190,50" fill="white" />
                  <polygon points="174,42 181,28 188,42" fill="white" />
                  <rect x="224" y="50" width="18" height="90" fill="white" />
                  <rect x="221" y="55" width="24" height="14" fill="white" />
                  <polygon points="224,50 233,34 242,50" fill="white" />
                  <polygon points="226,42 233,28 240,42" fill="white" />
                  <rect x="190" y="57" width="34" height="5" fill="white" />
                  <line x1="181" y1="62" x2="172" y2="90" stroke="white" strokeWidth="1.5" />
                  <line x1="186" y1="62" x2="179" y2="90" stroke="white" strokeWidth="1.5" />
                  <line x1="194" y1="62" x2="194" y2="90" stroke="white" strokeWidth="1.5" />
                  <line x1="200" y1="62" x2="200" y2="90" stroke="white" strokeWidth="1.5" />
                  <line x1="206" y1="62" x2="206" y2="90" stroke="white" strokeWidth="1.5" />
                  <line x1="212" y1="62" x2="215" y2="90" stroke="white" strokeWidth="1.5" />
                  <line x1="217" y1="62" x2="228" y2="90" stroke="white" strokeWidth="1.5" />
                  <polygon points="268,140 276,10 284,140" fill="white" />
                  <rect x="288" y="78" width="20" height="62" fill="white" />
                  <rect x="290" y="66" width="8" height="74" fill="white" />
                  <rect x="310" y="88" width="10" height="52" fill="white" />
                </svg>

                <div className="relative z-10 p-7 flex flex-col justify-between gap-6 h-full min-h-[160px]">
                  <p className="text-5xl font-black text-white leading-none">1 200+</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center">
                      {[
                        { id: 12, gender: 'women' },
                        { id: 44, gender: 'women' },
                        { id: 32, gender: 'men' },
                        { id: 65, gender: 'women' },
                        { id: 23, gender: 'women' },
                      ].map((a, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={a.id}
                          src={`https://randomuser.me/api/portraits/${a.gender}/${a.id}.jpg`}
                          alt=""
                          aria-hidden
                          className={`w-8 h-8 rounded-full border-2 border-white/40 object-cover ${i > 0 ? '-ml-2' : ''}`}
                        />
                      ))}
                    </div>
                    <div>
                      <p className="text-white font-bold">учнів у 5+ країнах</p>
                      <p className="text-white/60 text-sm mt-0.5">навчаються з нами з 2019 року</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Стат 1 */}
              <div className="bg-surface-muted rounded-2xl p-6 flex flex-col justify-between min-h-[160px]">
                <p className="text-4xl font-black text-ink leading-none">93%</p>
                <p className="text-sm text-ink-muted">учнів продовжують після першого місяця</p>
              </div>

              {/* Стат 2 */}
              <div className="bg-surface-muted rounded-2xl p-6 flex flex-col justify-between min-h-[160px]">
                <p className="text-4xl font-black text-ink leading-none">A0–B2</p>
                <p className="text-sm text-ink-muted">усі рівні — від першого слова до вільної розмови</p>
              </div>

              {/* 7 переваг */}
              {[
                { emoji: '💻', title: 'Власна платформа', text: 'Уроки, домашні завдання та матеріали в одному місці.' },
                { emoji: '🎮', title: 'Навчання через гру', text: 'Квізи та діалоги замість зубрятини.' },
                { emoji: '📊', title: 'Щомісячні звіти', text: 'Детальний звіт про прогрес дитини після кожного місяця.' },
                { emoji: '💬', title: 'Чат із вчителем', text: 'Запитайте вчителя напряму у будь-який момент.' },
                { emoji: '👨‍👩‍👧', title: 'Кабінет батьків', text: 'Реальний доступ до розкладу, оцінок та прогресу.' },
                { emoji: '⏰', title: 'Нагадування', text: 'Повідомлення за 30 хвилин до уроку — не пропустите.' },
                { emoji: '🏆', title: 'Сертифікат рівня', text: 'Офіційний сертифікат після завершення кожного рівня.' },
              ].map(item => (
                <div key={item.title} className="bg-surface-muted rounded-2xl p-5 flex flex-col gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <p className="font-black text-ink text-sm">{item.title}</p>
                    <p className="text-xs text-ink-muted mt-1 leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </section>

        {/* ── Формати навчання ── */}
        <section id="formats" className="py-20 px-5 bg-surface-muted">
          <div className="max-w-5xl mx-auto flex flex-col gap-12">
            <div>
              <p className="text-xs font-black text-primary uppercase tracking-widest mb-3">Формати</p>
              <h2 className="text-3xl md:text-4xl font-black text-ink leading-tight">
                Оберіть формат навчання
              </h2>
              <p className="text-ink-muted mt-3 text-sm max-w-xl leading-relaxed">
                Кожен формат — для різних цілей і можливостей. Можна поєднувати.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                {
                  emoji: '👤',
                  title: 'Індивідуальний',
                  badge: 'Найпопулярніше',
                  badgeColor: 'bg-primary/10 text-primary-dark',
                  color: 'border-primary/20 bg-white',
                  desc: 'Повна увага вчителя — програма, темп і теми підлаштовані під вашу дитину. Найшвидший прогрес.',
                  features: ['Персональна програма', 'Гнучкий розклад', 'Заміна вчителя безкоштовно'],
                },
                {
                  emoji: '👫',
                  title: 'Парний',
                  badge: 'Вдвічі економніше',
                  badgeColor: 'bg-success/10 text-success-dark',
                  color: 'border-success/20 bg-white',
                  desc: 'Навчайтесь разом із другом або братом/сестрою. Атмосфера змагання підвищує мотивацію.',
                  features: ['Вдвічі дешевше за індивідуальний', 'Спільний прогрес', 'Гра та діалоги'],
                },
                {
                  emoji: '👥',
                  title: 'Груповий',
                  badge: '6–8 учнів',
                  badgeColor: 'bg-accent/10 text-accent-dark',
                  color: 'border-accent/20 bg-white',
                  desc: 'До 8 учнів одного рівня. Розмовна практика, командні завдання та жива комунікація.',
                  features: ['Найбільш економний', 'Групова динаміка', 'Фокус на Speaking'],
                },
                {
                  emoji: '☕',
                  title: 'Розмовний клуб',
                  badge: 'Щотижня',
                  badgeColor: 'bg-purple/10 text-purple-dark',
                  color: 'border-purple/20 bg-white',
                  desc: 'Неформальні зустрічі на різні теми. Ідеально для тих, хто хоче практикувати мову в розслабленій атмосфері.',
                  features: ['Різні теми щотижня', 'Оплата за заняття або пакет', 'Від A2 рівня'],
                },
              ].map(f => (
                <div key={f.title} className={`rounded-2xl border-2 p-7 flex flex-col gap-5 ${f.color}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{f.emoji}</span>
                      <h3 className="font-black text-ink text-xl">{f.title}</h3>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${f.badgeColor}`}>
                      {f.badge}
                    </span>
                  </div>
                  <p className="text-sm text-ink-muted leading-relaxed">{f.desc}</p>
                  <ul className="flex flex-col gap-2">
                    {f.features.map(feat => (
                      <li key={feat} className="flex items-center gap-2.5 text-sm text-ink">
                        <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Ціни ── */}
        <section id="pricing" className="py-20 px-5 bg-white">
          <div className="max-w-5xl mx-auto flex flex-col gap-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="text-xs font-black text-primary uppercase tracking-widest mb-3">Прозорі ціни</p>
                <h2 className="text-3xl md:text-4xl font-black text-ink leading-tight">
                  Оберіть свій план
                </h2>
              </div>
              <p className="text-ink-muted text-sm max-w-xs leading-relaxed">
                Усі плани включають перший пробний урок безкоштовно. Жодних прихованих платежів.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  emoji: '👤',
                  title: 'Індивідуальний',
                  highlight: false,
                  price: '₴ 380',
                  per: 'за урок',
                  packages: ['₴ 380 / урок — 1 місяць', '₴ 340 / урок — 3 місяці', '₴ 300 / урок — повний рівень'],
                  cta: 'Записатись',
                },
                {
                  emoji: '👫',
                  title: 'Парний',
                  highlight: true,
                  price: '₴ 220',
                  per: 'за урок / особа',
                  packages: ['Вдвічі економніше за індивідуальний', 'Групи підбираємо ми або приводьте друга', 'Гнучкий розклад'],
                  cta: 'Записатись',
                },
                {
                  emoji: '👥',
                  title: 'Груповий',
                  highlight: false,
                  price: '₴ 150',
                  per: 'за урок / особа',
                  packages: ['До 6–8 учнів одного рівня', 'Фіксований розклад', 'Фокус на розмовній практиці'],
                  cta: 'Записатись',
                },
                {
                  emoji: '☕',
                  title: 'Розмовний клуб',
                  highlight: false,
                  price: '₴ 120',
                  per: 'за заняття',
                  packages: ['Пакет 4 заняття — ₴ 420', 'Пакет 8 занять — ₴ 800', 'Різні теми щотижня'],
                  cta: 'Спробувати',
                },
              ].map(plan => (
                <div
                  key={plan.title}
                  className={[
                    'rounded-2xl border-2 flex flex-col gap-5 overflow-hidden',
                    plan.highlight
                      ? 'border-primary bg-gradient-to-b from-primary/5 to-white'
                      : 'border-border bg-white',
                  ].join(' ')}
                >
                  {plan.highlight && (
                    <div className="bg-primary text-white text-xs font-black text-center py-2 tracking-widest uppercase">
                      Найпопулярніше
                    </div>
                  )}
                  <div className={`flex flex-col gap-5 p-6 ${plan.highlight ? 'pt-4' : ''}`}>
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{plan.emoji}</span>
                      <h3 className="font-black text-ink">{plan.title}</h3>
                    </div>
                    <div>
                      <p className="text-3xl font-black text-ink leading-none">{plan.price}</p>
                      <p className="text-xs text-ink-muted mt-1">{plan.per}</p>
                    </div>
                    <ul className="flex flex-col gap-2.5 flex-1">
                      {plan.packages.map(pkg => (
                        <li key={pkg} className="flex items-start gap-2 text-xs text-ink-muted leading-snug">
                          <span className="text-primary font-bold mt-0.5 flex-shrink-0">✓</span>
                          {pkg}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="#"
                      className={[
                        'block text-center py-3 rounded-xl font-black text-sm transition-colors',
                        plan.highlight
                          ? 'bg-primary hover:bg-primary-dark text-white'
                          : 'border-2 border-primary text-primary hover:bg-primary/5',
                      ].join(' ')}
                    >
                      {plan.cta} →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-ink-muted">
              Маєте питання щодо цін?{' '}
              <span className="text-primary font-bold cursor-pointer hover:underline">
                Напишіть нам — відповімо за 10 хвилин →
              </span>
            </p>
          </div>
        </section>

        {/* ── Вчителі + рівні ── */}
        <section className="py-20 px-5 bg-surface-muted" aria-labelledby="teachers-heading">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12">
              <p className="text-xs font-black text-primary uppercase tracking-widest mb-3">Вчителі</p>
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <h2 id="teachers-heading" className="text-3xl font-black text-ink leading-snug">
                  50+ сертифікованих вчителів —<br className="hidden md:block" /> для кожного рівня свій
                </h2>
                <p className="text-ink-muted text-sm max-w-xs">
                  Від першого слова до B2. Підбираємо вчителя під рівень, вік і характер дитини.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  photo: 'https://randomuser.me/api/portraits/women/44.jpg',
                  name: 'Olga K.',
                  level: 'A0–A1',
                  age: '4–8 років',
                  specialty: 'Пісні, малюнки, тварини. Перші слова через гру.',
                  badge: 'bg-danger/10 text-danger-dark',
                  rating: '4.9',
                },
                {
                  photo: 'https://randomuser.me/api/portraits/women/65.jpg',
                  name: 'Maria S.',
                  level: 'A1–A2',
                  age: '7–11 років',
                  specialty: 'Розмовна англійська, шкільна програма, хобі.',
                  badge: 'bg-accent/10 text-accent-dark',
                  rating: '5.0',
                },
                {
                  photo: 'https://randomuser.me/api/portraits/men/32.jpg',
                  name: 'Dmytro P.',
                  level: 'B1',
                  age: '11–15 років',
                  specialty: 'Підготовка до іспитів, граматика, вимова.',
                  badge: 'bg-success/10 text-success-dark',
                  rating: '4.8',
                },
                {
                  photo: 'https://randomuser.me/api/portraits/women/23.jpg',
                  name: 'Anna V.',
                  level: 'B2+',
                  age: '14+ / дорослі',
                  specialty: 'Business English, сертифікати, вільна розмова.',
                  badge: 'bg-purple/10 text-purple-dark',
                  rating: '4.9',
                },
              ].map(t => (
                <div key={t.name} className="bg-white rounded-2xl p-5 flex flex-col gap-4 border border-border">
                  <div className="flex items-center justify-between">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.photo}
                      alt={t.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${t.badge}`}>{t.level}</span>
                  </div>
                  <div>
                    <p className="font-black text-ink">{t.name}</p>
                    <p className="text-xs text-ink-muted mt-0.5">{t.age} · ★ {t.rating}</p>
                  </div>
                  <p className="text-sm text-ink-muted leading-relaxed flex-1">{t.specialty}</p>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-ink-muted mt-8">
              Не знаєте, з якого рівня почати?{' '}
              <span className="text-primary font-bold cursor-pointer hover:underline">
                Пройдіть безкоштовну діагностику →
              </span>
            </p>
          </div>
        </section>

        {/* ── Відгуки батьків ── */}
        <section id="reviews" className="py-20 px-5 bg-white">
          <div className="max-w-5xl mx-auto flex flex-col gap-12">
            <div>
              <p className="text-xs font-black text-primary uppercase tracking-widest mb-3">Відгуки</p>
              <h2 className="text-3xl md:text-4xl font-black text-ink leading-tight">
                Батьки кажуть про нас
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Олена Коваль',
                  child: 'мама Аліси, 6 років',
                  photo: 'https://randomuser.me/api/portraits/women/12.jpg',
                  rating: 5,
                  text: 'Аліса почала вчитися у Olga K. у вересні. Вже через 2 місяці сама попросила «ще один урок». Вчителька чудово знаходить підхід до дітей — через ігри, пісні та малюнки. Рекомендую всім батькам малюків!',
                },
                {
                  name: 'Дмитро Бондаренко',
                  child: 'тато Миколи, 10 років',
                  photo: 'https://randomuser.me/api/portraits/men/22.jpg',
                  rating: 5,
                  text: 'Микола вже рік займається з Maria S. Результат — здав шкільний тест на 94 бали з 100. Але головне — він перестав боятись говорити англійською. Тепер самостійно дивиться YouTube-блогерів в оригіналі.',
                },
                {
                  name: 'Ірина Захаренко',
                  child: 'мама Катерини, 14 років',
                  photo: 'https://randomuser.me/api/portraits/women/45.jpg',
                  rating: 5,
                  text: 'Катерина готується до складання IELTS. Dmytro P. — неймовірно терплячий і системний. Він пояснює не просто "що", а "чому" — дочка тепер розуміє граматику, а не просто зубрить правила. Дуже задоволені!',
                },
              ].map(r => (
                <div key={r.name} className="bg-surface-muted rounded-2xl p-6 flex flex-col gap-4 border border-border">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <span key={i} className="text-accent text-sm">★</span>
                    ))}
                  </div>
                  <p className="text-sm text-ink leading-relaxed flex-1">&ldquo;{r.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.photo} alt={r.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-ink">{r.name}</p>
                      <p className="text-xs text-ink-muted">{r.child}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Фінальний CTA ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark py-24 px-5">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" aria-hidden />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" aria-hidden />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl pointer-events-none" aria-hidden />

          <div className="relative max-w-xl mx-auto flex flex-col items-center text-center gap-6">
            <div className="text-5xl">🦉</div>

            <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.05]">
              Спробуйте перший урок безкоштовно
            </h2>

            <p className="text-white/75 text-lg leading-relaxed">
              Зателефонуємо у зручний для вас час і підберемо вчителя для вашої дитини.
            </p>

            <div className="w-fit mt-2">
              <QuizWidget variant="white" />
            </div>

            <p className="text-white/50 text-sm">
              Без зобов&rsquo;язань · Скасування в один клік
            </p>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="bg-ink text-white py-12 px-5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-10 justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-black">English<span className="text-primary">Best</span></span>
            </div>
            <p className="text-white/40 text-sm max-w-xs leading-relaxed">
              Онлайн-школа англійської для дітей та підлітків з 2019 року.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-10">
            {[
              { title: 'Навчання', links: ['Вчителі', 'Розклад', 'Ціни'] },
              { title: 'Компанія', links: ['Про нас', 'Блог', 'Вакансії'] },
              { title: 'Підтримка', links: ['Контакти', 'FAQ', 'Умови'] },
            ].map(col => (
              <div key={col.title}>
                <p className="font-black text-xs text-white/40 uppercase tracking-widest mb-4">
                  {col.title}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map(link => (
                    <li key={link}>
                      <Link href="#" className="text-sm text-white/50 hover:text-white transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-5xl mx-auto border-t border-white/10 mt-10 pt-6 flex items-center justify-between">
          <p className="text-white/30 text-xs">© 2026 EnglishBest</p>
          <div className="flex gap-4">
            {['Instagram', 'Facebook', 'TikTok', 'Threads'].map(s => (
              <Link key={s} href="#" className="text-white/30 hover:text-white text-xs transition-colors">
                {s}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
