# EnglishBest — Frontend Build Plan

## Архітектура
- **Framework:** Next.js 16.2.1, App Router
- **Styles:** Tailwind CSS v4 — всі токени в `@theme` в `globals.css`, лише Tailwind-класи в компонентах
- **Дані:** mock JSON у `/mocks`, Next.js Route Handlers у `/app/api/mock/*`
- **Ключове правило:** тільки `slug`/`documentId`, ніколи числовий `id`

## Правила стилів (ОБОВ'ЯЗКОВО)
- Всі дизайн-токени — в `@theme {}` в `app/globals.css`
- В компонентах — тільки Tailwind utility classes: `bg-primary`, `text-ink`, `rounded-xl`
- **Заборонено:** `bg-[var(--color-primary)]`, `style={{ color: '...' }}`, inline styles будь-якого виду

## Мапінг токенів → класи
| Токен | Tailwind клас |
|---|---|
| `--color-primary` | `bg-primary`, `text-primary`, `border-primary` |
| `--color-primary-dark` | `bg-primary-dark`, `text-primary-dark` |
| `--color-primary-light` | `bg-primary-light`, `text-primary-light` |
| `--color-secondary` | `bg-secondary`, `text-secondary` |
| `--color-secondary-dark` | `bg-secondary-dark` |
| `--color-accent` | `bg-accent`, `text-accent` |
| `--color-danger` | `bg-danger`, `text-danger`, `border-danger` |
| `--color-success` | `bg-success` |
| `--color-surface` | `bg-surface` (білий) |
| `--color-surface-muted` | `bg-surface-muted` (сірий фон) |
| `--color-border` | `border-border`, `bg-border` |
| `--color-ink` | `text-ink` (основний текст) |
| `--color-ink-muted` | `text-ink-muted` (сірий текст) |
| `--radius-sm` | `rounded-sm` |
| `--radius-md` | `rounded-md` |
| `--radius-lg` | `rounded-lg` |
| `--radius-xl` | `rounded-xl` |
| `--radius-full` | `rounded-full` |

---

## Кроки та статус

### ✅ Крок 1 — Ініціалізація проекту
- Next.js 16.2.1 + Tailwind v4 + TypeScript

### ✅ Крок 2 — Mock-дані
- `mocks/courses.json`, `lessons.json`, `users.json`, `quizSamples.json`, `calendar.json`

### ✅ Крок 3 — Lib + API routes
- `lib/api.ts`, `lib/fetcher.ts`, `lib/mockClient.ts`
- `app/api/mock/courses`, `lessons`, `users`, `calendar`, `quiz`

### ✅ Крок 4 — Компоненти (scaffold)
- Atoms: Button, Badge, Avatar, Input, Select, Modal, Icon
- Molecules: Sidebar, CourseCard, QuizWidget, LessonPlayer
- Organisms: DashboardOverview, CoursePage, CalendarView

### ✅ Крок 5 — Сторінки (scaffold)
- `/home`, `/dashboard`, `/library`, `/courses/[courseSlug]`
- `/courses/[courseSlug]/lessons/[lessonSlug]`, `/calendar`
- `/auth/login`, `/auth/register`, `/auth/profile`

### ✅ Крок 6 — Рефакторинг стилів → Tailwind theme
- [x] Оновити `globals.css`: `@theme {}` з токенами (--color-primary, --color-ink, --radius-xl тощо)
- [x] Перейменовано: `--color-text` → `--color-ink`, `--color-surface-alt` → `--color-surface-muted`
- [x] Замінено всі `bg-[var(...)]` / `text-[var(...)]` → Tailwind-класи в усіх компонентах і сторінках
- Виняток: `style={{ width: \`${n}%\` }}` в progress bars — допустимо (динамічне значення)

### ✅ Крок 7 — Storybook (базова конфігурація)
- [x] `.storybook/main.ts` — framework: `@storybook/react-vite` (Next.js 16 несумісний з `@storybook/nextjs@8`)
- [x] `.storybook/preview.ts` — імпорт `globals.css`, Tailwind через `viteFinal`
- [x] `@/` alias налаштований через `resolve.alias` у viteFinal
- [x] Stories: Button, Badge, Avatar, Modal, CourseCard
- [x] Скрипти: `npm run storybook`, `npm run build-storybook`
- [x] `storybook build` — успішно ✓

### ✅ Крок 8 — Базові тести
- [x] `jest.config.ts` — через `next/jest`, `@/` alias, `jsdom` env
- [x] `jest.setup.ts` — `@testing-library/jest-dom`
- [x] `__tests__/components/Button.test.tsx` — 7 тестів
- [x] `__tests__/components/Badge.test.tsx` — 7 тестів
- [x] `__tests__/components/CourseCard.test.tsx` — 9 тестів
- [x] `npm test` — 23/23 ✓

### ✅ Крок 9 — Документація інтеграції Strapi
- [x] `docs/strapi-integration.md` — маппінг всіх полів, endpoints, адаптери нормалізації, checklist переходу

---

## Поточне завдання
**Крок 10:** Редизайн головної сторінки — production-ready UI, українська мова, стиль AllRight

### Крок 10 — Редизайн (production-ready)
- [x] 10.1 Дизайн-стиль: Duolingo (зелений #58CC02, білий фон, яскраві акценти)
- [x] 10.2 Hero — УКР заголовок, floating lesson card, streak badge, мікро-статистика
- [x] 10.3 Статистика (10 000+ учнів, 600+ вчителів, 47 країн, 7 років)
- [x] 10.4 Як проходить навчання — 3 кроки
- [x] 10.5 Наш підхід — 4 feature cards (кольорові)
- [x] 10.6 Вчителі — 4 картки
- [x] 10.7 Відгуки батьків — 3 відгуки з рейтингом
- [x] 10.8 Ціни — 3 плани (Старт / Стандарт / Інтенсив), highlighted середній
- [x] 10.9 FAQ — client component з expand/collapse
- [x] 10.10 Фінальний CTA — зелений банер
- [x] 10.11 Footer — 4 колонки, соцмережі
- [ ] 10.12 Інші сторінки — переклад на українську
