import Link from 'next/link';
import { QuizWidget } from '@/components/molecules/QuizWidget';
import { LanguageSwitcher } from '@/components/atoms/LanguageSwitcher';
import { PopupTimer } from '@/components/molecules/PopupTimer';
import { ReviewsSlider } from '@/components/molecules/ReviewsSlider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EnglishBest — Онлайн-уроки англійської для дітей',
  description:
    'Індивідуальні онлайн-уроки англійської для дітей. Перший урок безкоштовно. Сертифіковані вчителі.',
};

const G = 'px-4 sm:px-6 lg:px-10 xl:px-16';
const W = 'max-w-6xl mx-auto w-full';

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-surface">
      <PopupTimer />

      {/* ── Навігація ── */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border">
        <div className={`${G} ${W} h-16 flex items-center justify-between`}>
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
              { label: 'Формати та ціни', href: '#formats' },
              { label: 'Вчителі', href: '#formats' },
              { label: 'Батькам', href: '#reviews' },
            ].map(item => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-semibold text-ink-muted hover:text-ink transition-colors px-3 py-2 rounded-lg hover:bg-surface-muted"
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
              className="bg-primary hover:brightness-110 text-white font-black text-sm px-4 py-2.5 rounded-xl transition-[filter]"
              style={{ boxShadow: '0 3px 0 var(--color-primary-dark)' }}
            >
              Спробувати безкоштовно
            </Link>
          </div>
        </div>
      </header>

      <main>

        {/* ── Hero ── */}
        <section className="relative min-h-[calc(100dvh-4rem)] flex items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&h=1080&fit=crop&q=85"
            alt="" aria-hidden
            className="absolute inset-0 w-full h-full object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/45 via-black/55 to-black/85" />

          <div className="relative z-10 flex flex-col items-center text-center px-4 py-24 w-full max-w-2xl mx-auto gap-5">
            <span className="inline-flex items-center gap-2 px-3 h-8 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-light animate-pulse" />
              <span className="text-xs font-black text-white/85 tracking-widest uppercase">Онлайн-школа для дітей</span>
            </span>
            <h1 className="text-5xl md:text-[4rem] font-black text-white leading-[1.05] tracking-tight">
              Дитина заговорить<br />
              <span className="text-primary-light">англійською</span><br />
              вже за місяць
            </h1>
            <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-sm">
              Сертифікований вчитель. Програма під вік і характер вашої дитини.
            </p>
            <div className="flex flex-col items-center gap-5 mt-2 w-full">
              <div className="w-fit"><QuizWidget variant="white" /></div>
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex">
                    {[{ id: 12, gender: 'women' }, { id: 44, gender: 'women' }, { id: 32, gender: 'men' }, { id: 65, gender: 'women' }].map((a, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={a.id} src={`https://randomuser.me/api/portraits/${a.gender}/${a.id}.jpg`} alt="" aria-hidden
                        className={`w-7 h-7 rounded-full border-2 border-white/40 object-cover${i > 0 ? ' -ml-2' : ''}`} />
                    ))}
                  </div>
                  <p className="text-sm text-white/60">
                    <span className="font-bold text-white">1 200+ батьків</span>
                  </p>
                </div>
                <span className="hidden sm:block w-px h-5 bg-white/20" aria-hidden />
                <div className="flex items-center gap-1.5">
                  <span className="flex text-accent text-sm tracking-tight" aria-hidden>★★★★★</span>
                  <p className="text-sm text-white/60"><span className="font-bold text-white">4.9</span> · 380+ відгуків</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Партнери ── */}
        <section aria-label="Партнери" className={`py-10 border-y border-border bg-surface ${G}`}>
          <div className={`${W} flex flex-col gap-5 items-center`}>
            <p className="type-label text-ink-muted text-center">Нам довіряють</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
              {['Lingua Kids Academy', 'Oxford Junior Club', 'StarEnglish UA', 'BrightMinds School', 'KidsLearn Online'].map(name => (
                <span key={name} className="text-sm font-black text-ink-faint tracking-tight whitespace-nowrap">{name}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Як відбувається запис ── */}
        <section className={`py-20 bg-surface-muted ${G}`}>
          <div className={`${W} flex flex-col gap-12`}>
            <div>
              <p className="type-label text-primary mb-3">Простий старт</p>
              <h2 className="type-h1 text-ink">Як відбувається запис</h2>
            </div>
            <ol className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { step: '01', title: 'Залишіть заявку', sub: 'Передзвонимо протягом години і узгодимо час.', panel: 'bg-purple/5 border-purple/20', dot: 'bg-purple text-white' },
                { step: '02', title: 'Пробний урок безкоштовно', sub: 'Вчитель визначає рівень і підбирає програму.', panel: 'bg-accent/5 border-accent/20', dot: 'bg-accent text-white' },
                { step: '03', title: 'Починаємо', sub: 'Отримуєте розклад, план і доступ до платформи.', panel: 'bg-primary/5 border-primary/20', dot: 'bg-primary text-white' },
              ].map(s => (
                <li key={s.step} className={`relative rounded-2xl border p-7 pt-10 flex flex-col gap-3 min-h-[180px] ${s.panel}`}>
                  <span className={`absolute -top-4 left-7 w-9 h-9 rounded-full font-black text-xs flex items-center justify-center shadow-card ${s.dot}`}>{s.step}</span>
                  <h3 className="type-h3 text-ink">{s.title}</h3>
                  <p className="text-sm text-ink-muted leading-snug">{s.sub}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Методика ── */}
        <section id="methodology" className={`py-20 bg-surface ${G}`}>
          <div className={`${W} flex flex-col gap-10`}>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="type-label text-primary mb-3">Наша методика</p>
                <h2 className="type-h1 text-ink">Ми навчаємо по-іншому</h2>
              </div>
              <p className="text-ink-muted max-w-sm text-sm leading-relaxed">
                Структуровані програми, живі вчителі та регулярна практика — замість зазубрювання правил.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Зелений великий блок */}
              <div className="col-span-2 relative overflow-hidden rounded-2xl min-h-[200px] bg-gradient-to-br from-primary to-primary-dark">
                <svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 right-0 h-full w-auto opacity-[0.15] pointer-events-none" aria-hidden preserveAspectRatio="xMaxYMax meet">
                  <rect x="0" y="85" width="22" height="55" fill="white" /><rect x="25" y="65" width="18" height="75" fill="white" />
                  <rect x="46" y="78" width="28" height="62" fill="white" /><rect x="82" y="90" width="16" height="50" fill="white" />
                  <rect x="84" y="38" width="12" height="54" fill="white" /><polygon points="84,38 90,20 96,38" fill="white" />
                  <rect x="98" y="90" width="66" height="50" fill="white" /><rect x="172" y="50" width="18" height="90" fill="white" />
                  <polygon points="172,50 181,34 190,50" fill="white" /><rect x="224" y="50" width="18" height="90" fill="white" />
                  <polygon points="224,50 233,34 242,50" fill="white" /><polygon points="268,140 276,10 284,140" fill="white" />
                  <rect x="288" y="78" width="20" height="62" fill="white" />
                </svg>
                <div className="relative z-10 p-7 flex flex-col justify-between gap-6 h-full min-h-[200px]">
                  <p className="text-5xl font-black text-white leading-none">1 200+</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center">
                      {[{ id: 12, gender: 'women' }, { id: 44, gender: 'women' }, { id: 32, gender: 'men' }, { id: 65, gender: 'women' }, { id: 23, gender: 'women' }].map((a, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={a.id} src={`https://randomuser.me/api/portraits/${a.gender}/${a.id}.jpg`} alt="" aria-hidden
                          className={`w-8 h-8 rounded-full border-2 border-white/40 object-cover ${i > 0 ? '-ml-2' : ''}`} />
                      ))}
                    </div>
                    <div>
                      <p className="text-white font-bold">учнів у 5+ країнах</p>
                      <p className="text-white/60 text-sm mt-0.5">навчаються з нами з 2019 року</p>
                    </div>
                  </div>
                </div>
              </div>

              {[
                { title: 'Урок — про те, що цікаво', sub: 'Minecraft, футбол, TikTok — все стає приводом говорити англійською.' },
                { title: 'Вчитель підібраний, не призначений', sub: 'Не хто вільний у розкладі — а хто підходить саме вашій дитині.' },
                { title: 'Батьки у курсі після кожного уроку', sub: 'Короткий звіт у застосунку — без зайвих дзвінків і питань.' },
                { title: 'Спробуйте без ризику', sub: 'Перший урок безкоштовний. Не підійде — жодних зобов\'язань.' },
              ].map(item => (
                <div key={item.title} className="bg-surface-muted border border-border rounded-2xl p-6 flex flex-col justify-between min-h-[200px]">
                  <p className="font-black text-ink leading-snug">{item.title}</p>
                  <p className="text-sm text-ink-muted leading-snug mt-3">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Формати + Ціни ── */}
        <section id="formats" className={`py-20 bg-surface-muted ${G}`}>
          <div className={`${W}`}>
            <div className="flex flex-col lg:flex-row gap-10 items-start">

              {/* Ліво: заголовок + список форматів */}
              <div className="flex-1 flex flex-col gap-6">
                <div>
                  <p className="type-label text-primary mb-3">Формати та ціни</p>
                  <h2 className="type-h1 text-ink">Оберіть формат навчання</h2>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=120&h=120&fit=crop&q=80', label: 'Індивідуальний', sub: 'Максимальний прогрес — без компромісів', price: '₴ 380', per: 'за урок', highlight: false },
                    { img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=120&h=120&fit=crop&q=80', label: 'Парний', sub: 'Вдвічі дешевше — вдвічі веселіше', price: '₴ 220', per: 'за урок / особа', highlight: true, badge: 'Топ' },
                    { img: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=120&h=120&fit=crop&q=80', label: 'Груповий', sub: 'Жива атмосфера і командна динаміка', price: '₴ 150', per: 'за урок / особа', highlight: false },
                    { img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=120&h=120&fit=crop&q=80', label: 'Розмовний клуб', sub: 'Говоріть вільно — без страху', price: '₴ 120', per: 'за заняття', highlight: false },
                  ].map(f => (
                    <div key={f.label} className={['flex items-center gap-4 px-4 py-3 rounded-2xl', f.highlight ? 'bg-primary/5 ring-1 ring-primary/25' : 'bg-surface border border-border'].join(' ')}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.img} alt="" aria-hidden className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-black text-ink text-sm">{f.label}</p>
                          {f.badge && <span className="text-[10px] font-black bg-primary text-white px-1.5 py-0.5 rounded-md leading-none">{f.badge}</span>}
                        </div>
                        <p className="text-xs text-ink-muted mt-0.5 truncate">{f.sub}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-black text-ink text-sm leading-none">{f.price}</p>
                        <p className="text-[10px] text-ink-muted mt-0.5">{f.per}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Право — вчителі */}
              <div className="flex-1 flex flex-col gap-6">
                <div>
                  <p className="type-label text-primary mb-3">Наші вчителі</p>
                  <h2 className="type-h1 text-ink">50+ педагогів</h2>
                  <p className="text-ink-muted text-sm leading-relaxed mt-2 max-w-xs">
                    Кожен проходить відбір і пробні уроки перед тим, як потрапити до команди.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[{ id: 44, gender: 'women' }, { id: 65, gender: 'women' }, { id: 32, gender: 'men' }, { id: 23, gender: 'women' }, { id: 12, gender: 'men' }, { id: 55, gender: 'men' }].map((a, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={a.id} src={`https://randomuser.me/api/portraits/${a.gender}/${a.id}.jpg`} alt="" aria-hidden
                        className={`w-10 h-10 rounded-full border-2 border-surface-muted object-cover${i > 0 ? ' -ml-2.5' : ''}`} />
                    ))}
                  </div>
                  <p className="text-sm text-ink-muted">і ще 44+</p>
                </div>
                <ul className="flex flex-col gap-3">
                  {[
                    { icon: '🎓', text: 'CELTA / TEFL сертифікація або вища педагогічна освіта' },
                    { icon: '⏱', text: 'Від 3 до 15 років досвіду викладання дітям' },
                    { icon: '🎯', text: 'Підбираємо під характер і темп дитини, а не за розкладом' },
                    { icon: '🔄', text: 'Безкоштовна заміна, якщо вчитель не підійшов — без питань' },
                  ].map(item => (
                    <li key={item.text} className="flex items-start gap-3">
                      <span className="text-base leading-none mt-0.5">{item.icon}</span>
                      <p className="text-sm text-ink-muted leading-snug">{item.text}</p>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* ── Відгуки ── */}
        <section id="reviews" className={`py-20 bg-surface ${G}`}>
          <div className={`${W}`}><ReviewsSlider /></div>
        </section>

        {/* ── Фінальний CTA ── */}
        <section className={`relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark py-24 ${G}`}>
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-[520px] h-[520px] rounded-full bg-white/10 blur-3xl" />
          </div>
          <div className={`${W} relative flex flex-col items-center text-center gap-8`}>
            <div>
              <p className="type-label text-white/60 tracking-widest mb-4">Почніть сьогодні</p>
              <h2 className="type-h1 text-white max-w-2xl">Спробуйте перший урок безкоштовно</h2>
              <p className="text-white/75 text-lg leading-relaxed max-w-md mx-auto mt-4">
                Зателефонуємо у зручний для вас час і підберемо вчителя для вашої дитини.
              </p>
            </div>

            <div className="w-fit"><QuizWidget variant="white" /></div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className={`bg-ink py-12 ${G}`}>
        <div className={`${W} flex flex-col md:flex-row gap-10 justify-between`}>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-black text-white">English<span className="text-primary-light">Best</span></span>
            </div>
            <p className="text-white/30 text-sm max-w-xs leading-relaxed">
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
                <p className="type-label text-white/30 mb-4">{col.title}</p>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map(link => (
                    <li key={link}>
                      <Link href="#" className="text-sm text-white/40 hover:text-white transition-colors">{link}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className={`${W} border-t border-white/10 mt-10 pt-6 flex items-center justify-between`}>
          <p className="text-white/25 text-xs">© 2026 EnglishBest</p>
          <div className="flex gap-4">
            {['Instagram', 'Facebook', 'TikTok', 'Threads'].map(s => (
              <Link key={s} href="#" className="text-white/25 hover:text-white text-xs transition-colors">{s}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
