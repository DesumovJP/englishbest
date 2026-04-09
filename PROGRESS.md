# EnglishBest — Frontend Progress Tracker

> Оновлюй цей файл після кожного спринту. Слугує єдиним джерелом правди про стан фронтенду.

## Бренд / Дизайн-система

| Токен | Значення |
|-------|----------|
| `--color-primary` | `#52c41a` (теплий Ant Design green) |
| `--color-primary-dark` | `#389e0d` |
| `--color-primary-light` | `#95de64` |
| `--color-accent` | `#FF9600` |
| `--color-danger` | `#FF4B4B` |
| `--color-ink` | `#1f1f1f` |
| `--color-ink-muted` | `#6b7280` |
| `--color-surface` | `#FFFFFF` |
| `--color-surface-muted` | `#F7F7F7` |
| `--color-border` | `#E5E5E5` |

**Правила:**
- NO inline styles — тільки Tailwind classes (виняток: `style={{ width: \`${n}%\` }}` для progress bars)
- NO слово "Курс/Курси" — використовувати "Програма/Уроки/Навчання"
- Платформа призначає вчителя (користувач не обирає)
- 100% Ukrainian UI
- Avatars: `randomuser.me` portraits через `<img>` tag

---

## Сторінки — статус

### ✅ Виконано

| Сторінка | Файл | Примітки |
|----------|------|----------|
| Головна (маркетинг) | `app/home/page.tsx` | Hero (split-grid), HeroSlider, методика, вчителі, FAQ, CTA, footer |
| Dashboard | `app/dashboard/page.tsx` | Next lesson card, статистика, upcoming lessons, досягнення |
| Мої уроки | `app/dashboard/lessons/page.tsx` | Секції+уроки, прогрес-бар, тест-ворота, mock-модал |
| Бібліотека | `app/library/page.tsx` | Програми навчання, фільтр рівнів, пошук, картки |
| Календар | `app/calendar/page.tsx` | Реальна сітка місяця, події, попап деталей |
| Профіль | `app/auth/profile/page.tsx` | Баланс, налаштування, транзакції, безпека |
| Учні (teacher/admin) | `app/dashboard/students/page.tsx` | Таблиця з балансом уроків + ₴, фільтри, пошук |
| Виплати (teacher) | `app/dashboard/payments/page.tsx` | Зведення ЗП, таблиця виплат, майбутні уроки |
| Вчителі (admin) | `app/dashboard/teachers/page.tsx` | Таблиця з ЗП/міс + до виплати, сортування |
| Аналітика (admin) | `app/dashboard/analytics/page.tsx` | KPI, бар-чарт, розподіл рівнів, топ вчителі |
| Налаштування (admin) | `app/dashboard/settings/page.tsx` | Ціни, пакети, платформа, виплати вчителям |
| Course page | `app/courses/[courseSlug]/page.tsx` | |
| Lesson player | `app/courses/[courseSlug]/lessons/[lessonSlug]/page.tsx` | |
| Login | `app/auth/login/page.tsx` | |
| Register | `app/auth/register/page.tsx` | |

### 🔲 В черзі / Не розпочато

| Сторінка | Пріоритет | Нотатки |
|----------|-----------|---------|
| Lesson player (повний) | High | Відео + вправи + нотатки + TeacherChat |
| Teacher view (dashboard) | Medium | Sidebar role=teacher, учні, розклад |
| Admin view | Low | Аналітика, керування |
| Login/Register (редизайн) | Medium | Поточний стан невідомий |

---

## Компоненти — статус

### ✅ Atoms / Molecules / Organisms

| Компонент | Файл | Статус |
|-----------|------|--------|
| Sidebar | `components/molecules/Sidebar.tsx` | ✅ Role switcher (student/teacher/admin), sticky full-height |
| HeroSlider | `components/molecules/HeroSlider.tsx` | ✅ Auto-advance 4.5s, colored shadows per slide |
| QuizWidget | `components/molecules/QuizWidget.tsx` | ✅ Variants: outline / primary / white |
| FAQ | `components/molecules/FAQ.tsx` | ✅ Accordion, client component |
| LanguageSwitcher | `components/atoms/LanguageSwitcher.tsx` | ✅ 🇺🇦 UA / 🇩🇪 DE / 🇵🇱 PL |

---

## Layouts

| Layout | Файл | Включає |
|--------|------|---------|
| Dashboard layout | `app/dashboard/layout.tsx` | Sidebar + main |
| Library layout | `app/library/layout.tsx` | Sidebar + main |
| Calendar layout | `app/calendar/layout.tsx` | Sidebar + main |
| Profile | `app/auth/profile/page.tsx` | Sidebar вбудований у page (не layout) |

---

## Правила маршрутизації та даних

- Використовувати `slug` або `documentId` (НІКОЛИ numeric `id`)
- Динамічні маршрути: `[courseSlug]`, `[lessonSlug]`
- Мок-дані зберігати у `/mocks/*.json`

---

## Відомі технічні борги

- [ ] Profile page має власний `<Sidebar />` замість layout — винести в `app/auth/layout.tsx`
- [ ] Lesson player не має реального відеоплеєра та вправ
- [ ] Мок API (`/api/mock/*`) не підключено — дані захардкоджені в компонентах
- [ ] `lib/api.ts` не створено
- [ ] MSW handlers не налаштовано
- [ ] Storybook не налаштовано
- [ ] Unit tests відсутні

---

## Сесія 2 (2026-03-31)

Реалізовано:
- Sidebar з role switcher (student/teacher/admin), sticky full-height
- Dashboard page (next lesson, stats, upcoming, achievements)
- Lessons page (секції, прогрес, тест-ворота)
- Library page (програми, фільтр, пошук)
- Calendar page (місячна сітка, події, попап)
- Profile page (баланс, форма, сповіщення, транзакції, безпека)
- LanguageSwitcher у navbar
- HeroSlider: colored shadows, teacher avatars
- QuizWidget variant="white"
- Бренд-колір оновлено до #52c41a
