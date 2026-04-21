# EnglishBest — Project State & Production Roadmap

> **Статус документа:** єдине джерело правди. Об'єднує архітектуру, поточний стан і план доведення проекту до повної production-ready версії. Оновлюється у тому самому коміті, що й структурні зміни. Попередні `ARCHITECTURE.md` + `PRODUCTION_PLAN.md` поглинуті сюди.

---

## 0. Tracking conventions

- `🟢 Ready` — content-type + scoped controller + frontend wired до реального API + seed/імпорт запускався.
- `🟡 Partial` — існує бекенд, але UI ще читає моки АБО scoping/permissions неповні.
- `🟠 Early` — є схема, але нема контролера/шляху/скоупінгу під продакшн.
- `🔴 Not ready` — відсутній бекенд-ресурс АБО функціонал живе тільки в IndexedDB / in-memory моках.
- `[ ]` / `[x]` — прогрес у чек-лісті; дата зміни в §10.

Ознака продакшн-готовності модуля (усе має бути true):
1. Strapi content-type із seed-ом + імпорт-скриптом.
2. Authz policies + per-resource scoping (`owner`, `teacher`, `assignee`).
3. Frontend читає/пише через `lib/api.ts` з auth-aware fetcher — жодного `@/mocks/*` чи `lib/*-data.ts` у рендерних шляхах.
4. E2E smoke-тест для golden path.
5. Seed-дані достатні, щоб Playwright запустив UI без моків.

---

## 1. Snapshot (станом на 2026-04-21)

**Production деплой**
- Backend (Strapi v5.42): Railway → Postgres.
- Frontend (Next.js 16): Vercel → `BACKEND_URL` через env.
- Auth: register/login/me/refresh/logout wired + httpOnly cookies + Next `proxy.ts`.

**Що вже працює з бекендом**
- Реєстрація/логін/сесія, JWT (15m) + refresh (30d, rotation + reuse detection).
- Content-types + permissions seeded для основного каталогу (courses, lessons, sessions, reviews, achievements, shop-items, homework, mini-tasks, user-progress).
- `user-progress` з owner-scoping на find/findOne/create/update.
- Mock import script (`npm run import-mocks`) готовий (локально перевірено білд, не запускався проти staging).

**Що ще живе в моках / IndexedDB**
- **Kids Zone state** (монетки, streak, XP, активний персонаж/кімната, inventory, outfit, placedItems) → тільки `frontend/lib/kids-store.ts` (IndexedDB на клієнті).
- **Персонажі + емоції** — hard-coded у `frontend/lib/characters.ts` (fox + raccoon, PNG з `/public/characters/*`). На бекенді немає сутності.
- **Кімнати** — hard-coded у `frontend/app/(kids)/kids/room/page.tsx` (bedroom/garden/castle/space/underwater). На бекенді немає.
- **Shop catalog** — `frontend/lib/shop-catalog.ts` (20 предметів). Бекенд content-type існує, але seed порожній; front не читає з нього.
- **Library (books/videos/games)** — `frontend/lib/library-data.ts`. Немає окремого content-type (можна фолдити під `course` через теги або додати новий).
- **Teacher dashboard цілком** — `frontend/lib/teacher-mocks.ts` (419 рядків): groups, students, chat, homework, payments, attendance, analytics, lesson library, mini-tasks. 26 споживачів.
- **Role context** — `frontend/lib/roleContext.tsx` досі читає з `@/mocks/user`.

---

## 2. Architecture

### 2.1 High-level

```
┌────────────────────────────┐        ┌──────────────────────────────┐
│  Next.js 16 (Vercel)       │        │  Strapi v5.42 (Railway)      │
│  ─────────────────────     │        │  ──────────────────────────  │
│  • App Router (RSC + CC)   │  HTTPS │  • Documents API (v5)        │
│  • proxy.ts (auth gate)    │◀──────▶│  • users-permissions plugin  │
│  • route handlers /api/auth│ Bearer │  • custom /api/auth/*        │
│  • session-context (CC)    │  JWT   │  • scoped controllers        │
│  • lib/api.ts  ── TBD      │        │  • refresh-token service     │
└────────────────────────────┘        │  • Postgres (Railway)        │
                                       └──────────────────────────────┘
```

### 2.2 Auth data plane

```
<LoginForm>
  └─▶ fetch POST /api/auth/login            (Next route handler — same origin)
        └─▶ fetch POST ${BACKEND_URL}/api/auth/login  (Strapi custom ctrl)
              ├─ users-permissions validate password
              ├─ issueTokenPair(user) → {access(15m), refresh(30d, hashed)}
              └─ 200 { user, profile, tokens }
        └─ set-cookie eb_access + eb_refresh (httpOnly, sameSite=lax,
                                              secure in prod, path=/)
  └─▶ SessionProvider re-hydrates via /api/auth/me
```

Токени:
- `eb_access` (15 хв, httpOnly) — надсилається Next-handlers як `Authorization: Bearer` у бекенд.
- `eb_refresh` (30 днів, httpOnly) — rotation з reuse detection (argon2id + `<profileDocId>.<secret>`).

### 2.3 Frontend стек

- App Router, RSC за замовчуванням; `"use client"` тільки для інтерактивних компонентів.
- Tailwind 4 через `@theme` у `globals.css` (токени `--color-primary`, `--radius-xl`, …). **НЕ** використовуємо inline `style={{}}` на кольори/радіуси (див. memory `feedback_styling`).
- Next 16: `middleware.ts` більше нема — лише `proxy.ts` (експорт — функція `proxy`).
- Session: `<SessionProvider>` у `app/layout.tsx` гідрує `initialSession = await getSession()` (server component → `eb_access` cookie → `${BACKEND_URL}/api/auth/me`).

### 2.4 Backend конвенції

- Strapi v5 envelope: `{ data, meta }`, поля на верхньому рівні `data` (НЕ `attributes`). Nightly check перед рефакторами: `node_modules/@strapi/core/dist/core-api/controller/transform.mjs`.
- Documents API: `strapi.documents('api::foo.foo').findMany/findOne/create/update`.
- Кастомні auth endpoints — у `backend/src/api/auth/*`.
- Permissions — декларативний матрикс у `backend/src/seeds/03-permissions.ts` (idempotent).
- Per-resource scoping — через policies в `backend/src/policies/*` + контролер-оверрайди (приклад: `user-progress.ts`).

### 2.5 Дерево (скорочено)

```
backend/
  src/
    api/
      auth/                       # custom — register/login/me/refresh/logout
      course, lesson, session, review, organization, user-profile,
      kids-profile, adult-profile, teacher-profile, parent-profile, admin-profile,
      shop-item, homework, mini-task, achievement, user-achievement, user-progress,
      parent-link, consent-log, audit-log, refresh-token
    seeds/
      00-roles.ts                 # creates 5 app roles in users-permissions
      01-organizations.ts         # seeds default tenant
      02-admins.ts                # seeds admin account + admin-profile
      03-permissions.ts           # declarative role → action matrix
      index.ts                    # orchestrator, called from bootstrap
    policies/
      is-authenticated.ts         # 401 guard
    bootstrap.ts / register.ts    # loads seeds on boot
  scripts/
    import-mocks.ts               # idempotent mock → Strapi importer (tsx)
  config/
    plugins.ts                    # users-permissions.jwt.expiresIn=15m
    database.ts, server.ts, admin.ts, api.ts
frontend/
  app/
    layout.tsx                    # async, hydrates SessionProvider
    proxy.ts                      # auth gate (Next 16 rename)
    api/auth/{login,register,me,refresh,logout}/route.ts
    (kids)/kids/{dashboard,lessons,shop,room,characters,library,coins,achievements,school}/
    dashboard/{student,teacher,parent,admin,homework,mini-tasks,students,groups,chat,
               attendance,teacher-calendar,teacher-library,payments,profile,analytics,prizes}/
    courses/[courseSlug]/{page.tsx, lessons/[lessonSlug]/page.tsx}
    library/[programSlug]/page.tsx
    auth/{login,register,profile}/page.tsx
  lib/
    auth-config.ts, auth-server.ts, session-context.tsx  # session plumbing
    types.ts                      # canonical domain types (post-normalize)
    api.ts                        # ⚠ STILL HITS /api/mock — rewrite pending
    fetcher.ts                    # ⚠ no auth-aware variant yet
    config.ts                     # API_BASE_URL
    normalize.ts                  # ⚠ TODO — Strapi v5 envelope unwrapper
    roleContext.tsx               # ⚠ reads mock user
    mockClient.ts, teacher-mocks.ts, library-data.ts, shop-catalog.ts,
    characters.ts, kids-store.ts, use-kids-store.ts
  mocks/                          # demo fixtures
  components/
    atoms, kids, lesson, molecules, organisms, teacher, ui
```

---

## 3. Module status matrix

Легенда колонок: **Schema** (content-type) · **Ctrl** (scoped controller) · **Perms** (seed grants) · **FE wired** (UI читає з бекенду) · **Seed/Import** (є дані).

| Модуль | Schema | Ctrl | Perms | FE wired | Seed | Readiness |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Auth (login/register/me/refresh/logout) | ✅ | ✅ | ✅ | ✅ | n/a | 🟢 |
| Courses catalog | ✅ | default | ✅ | ❌ | script готовий | 🟡 |
| Lessons | ✅ | default | ✅ | ❌ | script готовий | 🟡 |
| Calendar / Sessions | ✅ | default | ✅ | ❌ | script готовий | 🟡 |
| Reviews | ✅ | ⚠ no owner | ✅ | ❌ | — | 🟠 |
| User-progress | ✅ | ✅ | ✅ | ❌ | — | 🟡 |
| Teacher-profile | ✅ | default | ✅ | ❌ | script готовий | 🟡 |
| Kids-profile (coins/xp/streak/companion/mood) | ✅ | default | ⚠ | IndexedDB | — | 🔴 |
| Shop catalog | ✅ | default | ✅ | hard-coded | ❌ | 🟠 |
| **User inventory** (owned / equipped / placedItems / outfit / unlockedRooms) | **❌** | — | — | IndexedDB | — | 🔴 |
| **Characters + emotions catalog** | **❌** | — | — | hard-coded | — | 🔴 |
| **User-character ownership + mood** | **❌** | — | — | IndexedDB | — | 🔴 |
| **Rooms catalog** | **❌** | — | — | hard-coded | — | 🔴 |
| **User-room unlock/active** | **❌** | — | — | IndexedDB | — | 🔴 |
| Homework | ✅ | default | ✅ | ❌ | — | 🔴 |
| **Homework-submission** | **❌** | — | — | mock | — | 🔴 |
| Mini-tasks | ✅ | default | ✅ | ❌ | — | 🔴 |
| Achievements + user-achievement | ✅ | default | ✅ | ❌ | — | 🔴 |
| Library (books/videos/games) | ❌ (або теги на course) | — | — | hard-coded | — | 🔴 |
| **Group (teacher class)** | **❌** | — | — | mock | — | 🔴 |
| **Group-membership** | **❌** | — | — | mock | — | 🔴 |
| **Chat / message** | **❌** | — | — | mock | — | 🔴 |
| **Attendance record** | **❌** | — | — | mock | — | 🔴 |
| **Payment / payout** | **❌** | — | — | mock | — | 🔴 |
| **Parent ↔ child link** (parent-link існує, UI не читає) | ✅ | default | — | ❌ | — | 🟠 |

Mocks в обхід API, які доведеться прибрати (кількість споживачів):
- `@/mocks/user` — 25 файлів.
- `@/lib/teacher-mocks` — 26 файлів.
- `@/lib/shop-catalog` — 3 файли (shop, dashboard placement, character slots).
- `@/lib/library-data` — library pages.
- `@/lib/characters` — 4 файли (CharacterAvatar, kids/room, kids/characters, onboarding).
- `@/lib/kids-store` + `use-kids-store` — kids-zone (8 файлів).

---

## 4. Production roadmap

Плануємо роботу маленькими, незалежно deployable чанками (див. memory `feedback_chunked_work`). Жодні зміни не пушаться без явного дозволу користувача (memory `feedback_no_push`).

### Phase A — Frontend data plumbing (без нових сутностей)

- [x] **A1** `lib/types.ts` — canonical types with legacy aliases.
- [x] **A2** `lib/normalize.ts` — v5 envelope unwrap, media URL absolutize, Kyiv-tz session split, legacy-alias populate (teacherSlug/teacherName/thumbnail/rating on Course; lessonSlug/content on Lesson; date/time/duration on CalendarSession).
- [x] **A3** `lib/fetcher.ts` → three entry points: `fetcher` (anonymous), `fetcherAuth` (server-only, reads access JWT via lazy `auth-server` import), `fetcherClient` (same-origin with credentials). `ApiError` exported.
- [x] **A4.1** `lib/config.ts` очищено від `/api/mock`-дефолту; `lib/api.ts` переписано: `fetchCourses/fetchCourseBySlug/fetchLessonsByCourse/fetchLesson` тепер б'ють у Strapi через `fetcher` + `COURSE_POPULATE/LESSON_POPULATE` і повертають канонічні типи; `fetchMySessions` через `fetcherAuth`; `createProgress({lessonDocumentId, status, …})` через клієнтський `fetcherClient` → новий Next-проксі `/api/user-progress` (POST/GET forward із Bearer). `LessonPlayer` мігрований на новий API (`lessonDocumentId` у пропсах, більше ніяких hard-coded `'alex-k'`).
- [x] **A4.2** Видалено `app/api/mock/**` + `lib/mockClient.ts`. `app/courses/[courseSlug]/page.tsx` читає `fetchCourseBySlug` + `fetchCourses` (SSG params). `CoursePage` та `CalendarView` переведено на `Course`/`CalendarSession` з `@/lib/types` з null-safe-рендером (опціональні `tags`/`teacherName`/`teacherSlug`/`section.lessons`). `CourseSection` має легасі-аліас `lessons`. `frontend/mocks/*.json` лишаємо — їх споживає `backend/scripts/import-mocks.ts`.
- [ ] **A5** `lib/roleContext.tsx` → гідрується з `useSession()`; demo-режим зберігається тільки якщо flag `NEXT_PUBLIC_ROLE_SWITCHER=1`.
- [ ] **A6** Видалити `@/mocks/user` з усіх 25 файлів — замінити на `useSession()` / `fetchUserBySlug` (або seed-дані).
- [ ] **A7** Запустити `npm run import-mocks` проти staging → admin-spot-check → додати розділ у `backend/README.md`.

**Acceptance:** Courses page, Lessons page, Calendar, Profile, Home dashboard рендерять живі дані зі Strapi; `grep -R "from '@/mocks" frontend/` порожній; e2e smoke працює без `/api/mock`.

### Phase B — Kids Zone state на backend

Мета: перенести `KidsState` з IndexedDB у Strapi, щоб прогрес зберігався між пристроями.

- [ ] **B1** Content-type `api::user-inventory.user-inventory` (1:1 до `user-profile`). Поля:
  - `ownedShopItems` — relation manyToMany → `shop-item`.
  - `equippedItems` — relation manyToMany → `shop-item` (підмножина owned; validate у контролері).
  - `outfit` — json (slot → shop-item.slug): `{ hat, glasses, scarf, backpack }`.
  - `placedItems` — json component `[{ placementId, itemSlug, x, y, scale, z }]`.
  - `unlockedRooms` — relation manyToMany → `room` (Phase C).
  - `activeRoom` — relation oneToOne → `room`.
  - `activeCharacter` — relation oneToOne → `character` (Phase C).
  - `seedVersion` — integer.
- [ ] **B2** Kids-profile: endpoint `PATCH /api/kids-profile/me` (scoped self-update) для `totalCoins / totalXp / streakDays / streakLastAt / characterMood`. Перевірка: inc/dec-only для coins (backend validate), щоб клієнт не відкручував собі гроші довільно.
- [ ] **B3** Scoped controller для `user-inventory` (read/update тільки свій; staff — free).
- [ ] **B4** Seed: для існуючих kids-profile створити порожні `user-inventory` через migration-like seed (idempotent).
- [ ] **B5** FE — `lib/kids-store.ts` підмінити на remote-first модель: read від `/api/user-inventory/me`, write через `PATCH`. IndexedDB залишаємо як offline cache (optional, Phase I).

**Acceptance:** Coins/XP/streak/inventory/outfit/placedItems переживають вихід і вхід на інший браузер; IndexedDB порожня на свіжому пристрої = state приходить із бекенду.

### Phase C — Characters + Rooms каталоги

- [ ] **C1** Content-type `api::character.character`:
  - `slug` uid, `nameEn`, `nameUa`, `description`, `rarity` (common/uncommon/rare/legendary), `priceCoins` integer, `levelRequired` enum L(evel).
  - `emotionImages` — component repeatable `{ emotion: enum, image: media }` (підтримує всі 8 емоцій із `lib/characters.ts`).
  - `fallbackEmotion` enum.
- [ ] **C2** Content-type `api::user-character.user-character` (manyToOne → user-profile; manyToOne → character; унікальність пари; `acquiredAt`). Власність персонажа.
- [ ] **C3** Content-type `api::room.room`:
  - `slug`, `nameEn`, `nameUa`, `coinsRequired`, `background` media, `iconEmoji`, `orderIndex`.
- [ ] **C4** Seed: `04-characters.ts` + `05-rooms.ts` — імпортують існуючі fox/raccoon (скопіювати PNG у `backend/public/uploads/characters/`) і 5 rooms.
- [ ] **C5** Permissions: public read для обох каталогів; write — admin.
- [ ] **C6** Endpoints:
  - `POST /api/user-character/purchase { characterSlug }` — перевіряє coins, рівень, створює user-character + списує coins у transaction-like послідовності з compensating cleanup.
  - `POST /api/user-inventory/unlock-room { roomSlug }` — аналогічно.
- [ ] **C7** FE — `lib/characters.ts` → `lib/api.ts::fetchCharacters()` + прибрати hard-coded каталог. Hard-coded кімнати у `kids/room/page.tsx` → server-driven.

**Acceptance:** Adding new character у Strapi admin з'являється в UI без деплою. Купівля персонажа зменшує coins на сервері й фіксується у `user-character`.

### Phase D — Shop flow справжній

- [ ] **D1** Seed: `06-shop-items.ts` — імпортує 20 предметів із `lib/shop-catalog.ts` + завантажує placeholder icons у media.
- [ ] **D2** Endpoint `POST /api/user-inventory/purchase { shopItemSlug }` — coins check + рівень check + списання + додавання до `ownedShopItems` (idempotent: якщо вже owned — 409).
- [ ] **D3** Endpoint `POST /api/user-inventory/equip { shopItemSlug, equip: boolean }`.
- [ ] **D4** FE — `app/(kids)/kids/shop/page.tsx` читає каталог із `/api/shop-items?populate=*`; купівля → `POST /api/user-inventory/purchase` + optimistic UI + rollback on error.
- [ ] **D5** FE — `app/(kids)/kids/room/page.tsx` placements → `PATCH /api/user-inventory/me { placedItems: [...] }` (debounced save).

**Acceptance:** Покупка предмета зменшує coins на сервері; предмет з'являється у іншому браузері; rollback при помилці.

### Phase E — Progress / Achievements / Lessons engine

- [ ] **E1** FE — `postProgress()` (нині моковий) перенаправити на `POST /api/user-progresses` (scoped controller уже існує).
- [ ] **E2** Backend lifecycle `afterCreate/afterUpdate` у `user-progress` — коли `status=completed`:
  - зарахувати coins/xp у `kids-profile` (або `adult-profile`),
  - перевірити streak (`streakLastAt`),
  - evaluate achievements → створити `user-achievement` якщо критерій виконаний.
- [ ] **E3** Seed: `07-achievements.ts` — базовий набір (first-lesson, 7-day-streak, 100-words, level-up-A2, …).
- [ ] **E4** FE — `app/(kids)/kids/achievements/page.tsx` читає `/api/user-achievements?populate=achievement`; `coins` сторінка — з `kids-profile.totalCoins`.
- [ ] **E5** Companion mood update: backend обирає `characterMood` за результатами (completed=happy, fail=sad, streak=celebrate…) у тому самому lifecycle.

**Acceptance:** Завершення уроку → coins/xp оновлюються, streak продовжується, відповідний achievement розблоковується, companion змінює мудру — усе з одного створення `user-progress`.

### Phase F — Library (books/videos/games)

- [ ] **F1** Рішення: розширити `course` тегом `kind` enum `(course/book/video/game)` і `license` enum, АБО окремий `library-item` content-type. Рекомендую **розширити course** — менше дублювання, бо UI уже показує level/price/emoji, а звичайні курси теж мають level/price.
- [ ] **F2** Додати поля до `course` schema: `kind` (default `course`), `iconEmoji`, `externalUrl` (для videos/games), `provider` string, `isFree` boolean computed з `price=0`.
- [ ] **F3** Seed `08-library.ts` — імпортує 20 items із `lib/library-data.ts` (kind != 'course') як Course з `kind`.
- [ ] **F4** FE — `app/library/page.tsx`, `app/(kids)/kids/library/[id]/page.tsx` читають `/api/courses?filters[kind][$in]=...&populate=*`. `lib/library-data.ts` видалити.

**Acceptance:** Library tabs рендеряться з бекенду; додавання нової книжки в admin з'являється без деплою.

### Phase G — Teacher dashboard (reale data)

Найбільший чанк. Розбиваємо на суб-фази.

- [ ] **G1 — Groups**
  - Content-type `api::group.group`: `name`, `level`, `teacher` (manyToOne), `members` (manyToMany → user-profile), `scheduleRrule` string, `activeFrom/To`, `meetUrl`.
  - Scoped controller: teachers бачать тільки свої; admin — усе.
  - FE: `dashboard/groups/page.tsx`, `students/page.tsx` — через `fetchGroups/fetchStudents`.
- [ ] **G2 — Homework flow повний**
  - Content-type `api::homework-submission.homework-submission`: `homework` (mto), `student` (mto), `status` (notStarted/inProgress/submitted/reviewed/returned/overdue), `submittedAt`, `gradedAt`, `score`, `teacherFeedback` text, `answers` json, `attachments` media multiple.
  - Scoped ctrl: student бачить/редагує тільки свої (pre-`submittedAt`); teacher — тільки assignees зі своїх homework.
  - Lifecycle: create `homework-submission` автоматично для кожного assignee при `homework.status=published`.
  - FE: `dashboard/homework/page.tsx` + `[id]/review/page.tsx` — читає реальні submissions.
- [ ] **G3 — Mini-tasks** — scoped ctrl (teacher-owned), FE `dashboard/mini-tasks/page.tsx`.
- [ ] **G4 — Lesson library / editor** (`dashboard/teacher-library`) — уже має content-type `lesson`; додати scoping за `teacher` (owner) + `source` enum (`platform|own|copy`). FE editor зберігає через Strapi.
- [ ] **G5 — Chat**
  - `api::thread.thread` (participants m2m → user-profile; `kind` enum student/group/parent).
  - `api::message.message` (thread mto, author mto → user-profile, body text, attachments media, readBy m2m).
  - Scoped: тільки учасники треду.
  - FE `dashboard/chat/page.tsx`. Transport: polling кожні 10 с (MVP). Phase I — websockets.
- [ ] **G6 — Attendance** — `api::attendance-record.attendance-record` (session mto, student mto, status enum present/absent/late, note text). FE `dashboard/attendance`.
- [ ] **G7 — Payments / payouts**
  - `api::lesson-payment.lesson-payment` (session mto, teacher mto, gross/net, currency, status).
  - `api::teacher-payout.teacher-payout` (teacher mto, period, total, status, payoutAt).
  - FE `dashboard/payments/page.tsx`.
- [ ] **G8 — Profile** (`dashboard/profile/page.tsx`) — self-update bio/languages/hourlyRate/videoMeetUrl/avatar → `PATCH /api/teacher-profile/me`.
- [ ] **G9 — Analytics** — derived endpoints `GET /api/analytics/teacher` (агрегат з user-progress + homework-submission + attendance + payments).

**Acceptance на Phase G:** жодного import from `@/lib/teacher-mocks`; всі 26 споживачів переведено; e2e smoke для teacher flow (login → groups → assign homework → grade submission).

### Phase H — Parent flow

- [ ] **H1** Parent-link вже існує (`parent-profile` ↔ kids-profile). Дописати scoped endpoint `GET /api/parent/me/children` + `GET /api/parent/me/children/:kidDocId/progress`.
- [ ] **H2** FE `dashboard/parent/page.tsx` — список дітей із прогресом + календар + homework due.

### Phase I — Production polish

- [ ] **I1** Offline cache для kids-zone: IndexedDB зберігається, але як `stale-while-revalidate`, не як джерело правди.
- [ ] **I2** Kids PIN-login (використовує `kids-profile.pinHash`). Endpoint + PIN-модалка.
- [ ] **I3** Email — Resend/Postmark provider → forgot-password + email confirmation (деферовано з Phase 4 старого плану).
- [ ] **I4** Media: CDN + image optimization (Strapi uploads → R2/S3).
- [ ] **I5** Websockets для chat (socket.io плагін Strapi) замість polling.
- [ ] **I6** Sentry на FE + BE; LogRocket опційно.
- [ ] **I7** Rate limiting на `/api/auth/*` (проти brute force).
- [ ] **I8** Backups — Railway postgres daily snapshot + restore runbook.
- [ ] **I9** PII: consent-log read/export endpoint для GDPR.

### Phase J — QA / Acceptance

- [ ] **J1** Playwright e2e: kids golden path (login → урок → завершення → coins → shop → покупка → room → розставляння → logout/login на іншому пристрої → state зберігся).
- [ ] **J2** Playwright e2e: teacher golden path (login → створити homework → assign → grade submission).
- [ ] **J3** Playwright e2e: parent flow.
- [ ] **J4** Load test: 100 одночасних lesson-complete (k6).
- [ ] **J5** Accessibility audit (axe-core) на всіх основних сторінках.
- [ ] **J6** Mobile (iOS Safari) reality check — kids-zone особливо.

---

## 5. Immediate next actions

1. **Закрити Phase A2-A4** (normalize + fetcher auth-aware + api.ts rewrite). Це розблокує всі наступні чанки. **Не робимо нових сутностей, доки FE не читає існуючі через справжній API.**
2. Поки не запущено `import-mocks` проти staging — Phase A неможливо перевірити end-to-end. Це blocker для A7.
3. Після A — Phase B (inventory entity). Це unlock для C/D/E.

## 6. Acceptance criteria — production ready

Проект вважаємо довершеним, коли одночасно true:
1. `grep -R "from '@/mocks" frontend/` = 0 результатів.
2. `grep -R "from '@/lib/teacher-mocks'" frontend/` = 0 результатів.
3. `grep -R "from '@/lib/library-data'" frontend/` = 0 результатів.
4. `grep -R "from '@/lib/shop-catalog'" frontend/` = 0 результатів.
5. `grep -R "from '@/lib/characters'" frontend/` = тільки в нормалайзері (не в UI).
6. Kids flow: вхід на свіжому пристрої → увесь state (coins, inventory, outfit, rooms) приходить із бекенду.
7. Teacher flow: login → створити homework → студент submit-ить → teacher grade → student бачить feedback.
8. Parent flow: бачить прогрес свого ребенка.
9. `npm run import-mocks` на staging → admin-панель показує повний граф (teachers + courses + lessons + sessions + achievements + shop-items + characters + rooms + library).
10. Playwright smoke suite (J1-J3) зелений.
11. Всі permissions із seed відображають owner-scope для write-операцій.

## 7. Hard rules (carried from memory)

- **НЕ пушити** до remote під час цього рефакторингу (memory `feedback_no_push`).
- **Маленькі коміти** — довгі правки розбивати на чанки (memory `feedback_chunked_work`).
- **Styling** — усі токени у `@theme` у `globals.css`; `bg-primary` замість `bg-[var(--color-primary)]` (memory `feedback_styling`).
- **Kids UI** — full-screen bg + top/bottom bars; без cards-stacks; не більше 1 акцентного кольору на екран (memory `feedback_kids_ui`).
- **Kids gamification** — Toca Boca model: кімнати розблоковуються за монетки, loot boxes з меблями, collectible+dressable characters (memory `project_kids_gamification`).
- **Next 16** — читати `node_modules/next/dist/docs/` перед структурними змінами (AGENTS.md).

## 8. Env vars

Backend (Railway):
- `DATABASE_URL`, `NODE_ENV=production`, `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `ENCRYPTION_KEY`, `JWT_SECRET`, `JWT_EXPIRES_IN=15m`, `REFRESH_TOKEN_SECRET`, `PUBLIC_URL`.
- Admin seed: `ADMIN_EMAIL`, `ADMIN_PASSWORD` (required перший раз).

Frontend (Vercel):
- `STRAPI_API_URL` (server-side, internal) або `NEXT_PUBLIC_API_BASE_URL` (client-side fallback).
- `NODE_ENV=production` (auto).
- Optional: `NEXT_PUBLIC_USE_MOCK=0`, `NEXT_PUBLIC_ROLE_SWITCHER=0`.

## 9. Runbooks

- **Деплой backend**: push → Railway builds Strapi → on boot викликає `src/bootstrap.ts` → `seeds/index.ts` runs idempotent (roles → orgs → admin → permissions). Повторний запуск безпечний.
- **Імпорт моків в staging**: `cd backend && npm run import-mocks` (використовує `tsx`). Scripts `compileStrapi()` + `createStrapi().load()` — не запускає HTTP-сервер.
- **Rollback**: Railway має деплой-історію; дев-редеплой попередньої ревізії миттєвий.
- **Очистка refresh-tokens**: cron через Strapi scheduled-task (TODO Phase I).

## 10. Change log

- **2026-04-21** Phase A4.2: видалено `app/api/mock/**` + `lib/mockClient.ts`. `courses/[courseSlug]/page.tsx` живе на `fetchCourseBySlug/fetchCourses`. `CoursePage` + `CalendarView` переведено на канонічні типи з null-safe аксесом. До `CourseSection` додано легасі-аліас `lessons`. `tsc --noEmit` чистий.
- **2026-04-21** Phase A4.1: `lib/api.ts` переписано на реальний Strapi (COURSE/LESSON/SESSION populate) + `createProgress` через Next proxy `/api/user-progress`; `config.ts` очищено від `/api/mock`-дефолту; `LessonPlayer` мігрований. `tsc --noEmit` чистий. Моки в `app/api/mock/**` поки живі — прибирається в A4.2 разом із рештою споживачів `mockClient`.
- **2026-04-21** Phase A2+A3: `lib/normalize.ts` (Strapi v5 envelope unwrap + media URL absolutize + Kyiv-tz session split + legacy aliases) та `lib/fetcher.ts` перероблено на три entry points (fetcher, fetcherAuth server-only, fetcherClient same-origin) + `ApiError`. `tsc --noEmit` чистий.
- **2026-04-21** Single-source консолідація: видалено `README.md`, `backend/README.md`, `AGENTS.md`. `CLAUDE.md` містить правило Next 16 + вказівку на `PROJECT.md`. В репо лишилось 2 md: `PROJECT.md` (project info) + `CLAUDE.md` (AI contract).
- **2026-04-21** Консолідація `ARCHITECTURE.md` + `PRODUCTION_PLAN.md` → `PROJECT.md`. Додано детальний матрикс готовності для Kids/Shop/Inventory/Library/Homework/Progress/Teacher/Characters. Phase A → J roadmap.
- **2026-04-21** Phase 5 старого плану перейменовано на Phase A.
- **Раніше** — див. git log (фази 0-4 старого плану вже виконано: cleanup, backend perms+scoping, mock import script, auth endpoints + Next-handlers + SessionProvider + `proxy.ts` rename).
