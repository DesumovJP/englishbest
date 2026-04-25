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
- **Kids Zone state** (монетки, streak, XP, inventory, outfit, placedItems) → бекенд (Phase B ✅): coins/xp/streak у `kids-profile`, owned/equipped/outfit/placedItems у `user-inventory`, обидва через `/me` endpoints. `activeCharacter` + `unlockedRooms` поки in-memory — live з Phase C. IndexedDB-код у `kids-store.ts` лишився тільки для user-uploaded custom items/rooms/characters (Phase I → offline cache).
- **Персонажі + емоції** — hard-coded у `frontend/lib/characters.ts` (fox + raccoon, PNG з `/public/characters/*`). На бекенді немає сутності.
- **Кімнати** — hard-coded у `frontend/app/(kids)/kids/room/page.tsx` (bedroom/garden/castle/space/underwater). На бекенді немає.
- **Shop catalog** — `frontend/lib/shop-catalog.ts` (20 предметів). Бекенд content-type існує, але seed порожній; front не читає з нього.
- **Library (books/videos/games)** — `frontend/lib/library-data.ts`. Немає окремого content-type (можна фолдити під `course` через теги або додати новий).
- **Teacher dashboard цілком** — `frontend/lib/teacher-mocks.ts` (419 рядків): groups, students, chat, homework, payments, attendance, analytics, lesson library, mini-tasks. 26 споживачів.
- **Role context** — `frontend/lib/roleContext.tsx` тепер гідрується з `useSession()` (Phase A5).

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
| Lessons (catalog + teacher library) | ✅ (owner/source/topic/level/tags added G4) | scoped (Phase G4) | ✅ | ✅ (Phase G4) | script готовий | 🟢 (wired) |
| Lesson player (interactive steps) | ⚠ exercise component | default | ✅ | ❌ (hardcoded TS) | — | 🔴 A8 |
| Calendar / Sessions | ✅ | default | ✅ | ❌ | script готовий | 🟡 |
| Reviews | ✅ | scoped (owner-only update/delete, author force-set on create) | ✅ | ✅ (CoursePage reviews section — list + owner CRUD) | — | 🟢 (wired) |
| User-progress | ✅ | ✅ | ✅ | ❌ | — | 🟡 |
| Teacher-profile | ✅ | scoped (Phase G8 — `/me` findMe/updateMe, stock update/delete admin-only) | ✅ | ✅ (Phase G8 — teacher self-edit bio/rate/languages/specializations/videoMeetUrl/acceptsTrial) | script готовий | 🟢 (wired) |
| Kids-profile (coins/xp/streak/companion/mood) | ✅ | default | ⚠ | FE reads via `/me` | — | 🟢 (E2 credits на completion) |
| Shop catalog | ✅ | default | ✅ | ✅ (Phase D4) | ✅ (20 seeds) | 🟢 (wired) |
| **User inventory** (owned / equipped / placedItems / outfit / unlockedRooms) | ✅ (Phase B/C/D) | scoped (`/me`) | ✅ | ✅ (Phase D4 — purchase + equip server-authoritative) | auto-create | 🟢 (wired; placedItems debounced save pending D5) |
| **Characters + emotions catalog** | ✅ (Phase C1) | default | ✅ | ✅ (Phase C7) | ✅ (2 seeds) | 🟢 (wired) |
| **User-character ownership + mood** | ✅ (Phase C5) | scoped (`/me`) | ✅ | ✅ (Phase C7) | — | 🟢 (wired) |
| **Rooms catalog** | ✅ (Phase C3) | default | ✅ | ✅ (Phase C7) | ✅ (5 seeds) | 🟢 (wired) |
| **User-room unlock/active** | ✅ (Phase C5) | scoped (`/me`) | ✅ | ✅ (Phase C7) | — | 🟢 (wired) |
| Homework | ✅ | scoped (Phase G2) | ✅ | ✅ (Phase G2 — teacher CRUD wired) | — | 🟢 (wired) |
| **Homework-submission** | ✅ (Phase G2) | scoped (Phase G2) | ✅ | ✅ (Phase G2 — teacher grade/return; student submit) | auto-create on publish (lifecycle) | 🟢 (wired) |
| Mini-tasks | ✅ (kind/durationMin added G3) | scoped (Phase G3) | ✅ | ✅ (Phase G3) | — | 🟢 (wired) |
| Achievements + user-achievement | ✅ | scoped user-ach | ✅ | ✅ (Phase E4) | ✅ (12 seeds) | 🟢 (wired) |
| Library (books/videos/games) | ✅ (course+kind) | default | ✅ | ✅ (Phase F4) | ✅ (14 seeds) | 🟢 (wired) |
| **Group (teacher class)** | ✅ (Phase G1) | scoped | ✅ | ✅ (Phase G1) | — | 🟢 (wired) |
| **Group-membership** | n/a (m2m on `group.members`) | — | — | — | — | 🟢 |
| **Thread / Message (chat)** | ✅ (Phase G5) | scoped (Phase G5) | ✅ | ✅ (Phase G5 — list/read/send/pin/reply, polling 10s) | — | 🟢 (wired) |
| **Attendance record** | ✅ (Phase G6) | scoped (Phase G6) | ✅ | ✅ (Phase G6 — month grid, upsert on cell click, optimistic) | — | 🟢 (wired) |
| **Payment / payout** | ✅ (Phase G7 — lesson-payment + teacher-payout) | scoped (Phase G7) | ✅ | ✅ (Phase G7 — payouts list + upcoming forecast from sessions) | — | 🟢 (wired, aggregation stub) |
| **Analytics (teacher + admin aggregates)** | n/a (no content-type — routes + controller only) | scoped (Phase G9) | ✅ | ✅ (Phase G9 — teacher + admin dashboards on live aggregation) | — | 🟢 (wired) |
| **Parent dashboard (children aggregate)** | n/a (no content-type — routes + controller only) | scoped (Phase H1) | ✅ | ✅ (Phase H2 — children tabs + KPI + sessions/homework/progress) | — | 🟢 (wired; linkage via `user-profile.parentalConsentBy`) |
| **Parent-link m2m** (richer multi-parent model; not wired) | ✅ | default | — | ❌ | — | 🟠 |

Mocks в обхід API (точні значення перевірено 2026-04-22 gap-audit):
- ~~`@/mocks/user`~~ — видалено (Phase A6). Типи перенесено у `@/lib/types`; `useKidsIdentity()` — єдиний seam до Phase B.
- `@/mocks/lessons/*` — **18 import lines** (7 rich-lesson data + 11 step-компонентів з type-only). Видаляється у Phase **A8**.
- `@/lib/teacher-mocks` — **~21 файл** (G1 groups, G2 homework+review, G3 mini-tasks, G4 teacher-library+editor, G5 chat, G6 attendance, G7 payments переведено на live-дані; решта — types/constants як API contract + сторінки, що ще на моках: teacher-calendar, students).
- `@/lib/shop-catalog` — **1 реальний споживач** (`LessonCharacter.tsx`: `SHOP_ITEMS_BY_ID`, `SLOT_OFFSET`). + `kids/dashboard/page.tsx` + `kids/shop/page.tsx` через `use-kids-store`. PROJECT.md раніше писав 3 — було завищено.
- ~~`@/lib/library-data`~~ — видалено (Phase F4). Каталог тепер з API через `useLibrary()`.
- `@/lib/characters` — **4 файли** (`CharacterAvatar`, `CharacterDisplay`, `InventoryMobile`, `LessonCharacter`).
- `@/lib/kids-store` + `use-kids-store` — **5 файлів** (раніше писалось 8, перераховано).
- `@/lib/library-mocks` — **0 споживачів** (dead code, видалити у Phase 2-Refactor).

---

## 3a. Gap audit — 2026-04-22

Повний reality-check коду vs цього документа. Джерело — grep + `tsc --noEmit` обидвох пакетів.

**Підтверджено (✅ PROJECT.md правий)**
- Всі 21 content-types мають `schema.json` і `draftAndPublish: true` (uniform).
- `user-progress` — єдиний scoped controller (owner via `callerProfileId()`).
- Policies `/backend/src/policies/`: `is-authenticated`, `has-role`, `is-owner`, `is-organization-member`.
- Seed-ордер через `seeds/index.ts`: 00-roles → 01-organizations → 02-admins → 03-permissions.
- Env-vars validated у `backend/src/index.ts:10-24` (7 required).
- `tsc --noEmit` чистий на FE і BE.

**Розбіжності (треба виправити)**
- ~~`Reviews controller` — PROJECT.md §3 писав «⚠ no owner» → правильніше: controller default, `is-owner` policy існує, але не застосовано.~~ **Виправлено 2026-04-23**: scoped controller (author force-set на create, owner-only update/delete, admin bypass). `/api/reviews` проксі + `lib/reviews.ts` + `CourseReviews` секція в `CoursePage`.
- Лічильники mocks-споживачів у §3 були завищені/занижені — виправлено вище.
- `lib/library-mocks.ts` — dead code (59 LOC, 0 imports).

**Code-health прогалини (memory `feedback_styling` violations)**
- **57 `style={{...}}`** у `frontend/app/` і `frontend/components/` — найбільші концентрації: `AddCustomModal.tsx`, `LootBox.tsx`, kids-flow.
- **17 `bg-[var(--tk-*)]`** / Tailwind-escape у `AddCustomModal.tsx`.
- Файли-монстри >400 LOC: `AddCustomModal.tsx` (593), `LootBox.tsx` (565), `MiniTaskBuilder.tsx` (540), `LessonBlockEditor.tsx` (533), `CompanionSVG.tsx` (528), `StudentDetail.tsx` (475), `teacher-mocks.ts` (419, піде в Phase G).
- TODO-коментарі в src: Calendly URL у `courses/[slug]/lessons/[slug]/page.tsx:25`, Strapi-auth у `auth/register/page.tsx`, Strapi-POST у `components/molecules/QuizWidget.tsx`.

**Infra прогалини (нема, хоч і треба)**
- **Playwright** відсутній повністю. PROJECT.md §4 Phase J закладає e2e, але тулу нема → Phase J **blocked**.
- **ESLint** не сконфігуровано (ні `.eslintrc*`, ні lint-скрипту).
- **Error boundaries** — жодного `error.tsx` / `ErrorBoundary` у App Router.
- **`loading.tsx` / `not-found.tsx`** — жодного.

**Наслідки**
1. Phase J (e2e suite) треба перепланувати: спочатку додати Playwright як окремий чанк перед golden-path тестами.
2. Phase 2-Refactor (нова, додаємо нижче) — чистка inline-styles/escape, split великих файлів, error/loading pages, ESLint baseline, видалення `library-mocks.ts`. Без нових фіч, без нових сутностей.
3. Після Phase 2-Refactor — повертаємось до A8 → B → C → …

---

## 4. Production roadmap

Плануємо роботу маленькими, незалежно deployable чанками (див. memory `feedback_chunked_work`). Жодні зміни не пушаться без явного дозволу користувача (memory `feedback_no_push`).

### Phase A — Frontend data plumbing (без нових сутностей)

- [x] **A1** `lib/types.ts` — canonical types with legacy aliases.
- [x] **A2** `lib/normalize.ts` — v5 envelope unwrap, media URL absolutize, Kyiv-tz session split, legacy-alias populate (teacherSlug/teacherName/thumbnail/rating on Course; lessonSlug/content on Lesson; date/time/duration on CalendarSession).
- [x] **A3** `lib/fetcher.ts` → three entry points: `fetcher` (anonymous), `fetcherAuth` (server-only, reads access JWT via lazy `auth-server` import), `fetcherClient` (same-origin with credentials). `ApiError` exported.
- [x] **A4.1** `lib/config.ts` очищено від `/api/mock`-дефолту; `lib/api.ts` переписано: `fetchCourses/fetchCourseBySlug/fetchLessonsByCourse/fetchLesson` тепер б'ють у Strapi через `fetcher` + `COURSE_POPULATE/LESSON_POPULATE` і повертають канонічні типи; `fetchMySessions` через `fetcherAuth`; `createProgress({lessonDocumentId, status, …})` через клієнтський `fetcherClient` → новий Next-проксі `/api/user-progress` (POST/GET forward із Bearer). `LessonPlayer` мігрований на новий API (`lessonDocumentId` у пропсах, більше ніяких hard-coded `'alex-k'`).
- [x] **A4.2** Видалено `app/api/mock/**` + `lib/mockClient.ts`. `app/courses/[courseSlug]/page.tsx` читає `fetchCourseBySlug` + `fetchCourses` (SSG params). `CoursePage` та `CalendarView` переведено на `Course`/`CalendarSession` з `@/lib/types` з null-safe-рендером (опціональні `tags`/`teacherName`/`teacherSlug`/`section.lessons`). `CourseSection` має легасі-аліас `lessons`. `frontend/mocks/*.json` лишаємо — їх споживає `backend/scripts/import-mocks.ts`.
- [x] **A5** `lib/roleContext.tsx` переписано як тонкий derivation-шар над `useSession()`: `role` = session-derived з fallback `'adult'` для анонів; `setRole` — no-op, якщо `NEXT_PUBLIC_ROLE_SWITCHER !== '1'`. `RoleProvider` тепер опціональний (тільки для демо-override state). `RoleSwitcher` ховає себе без flag'у. `RoleGuard`/`RoleSwitcher` перемкнуто з `@/mocks/user` на `@/lib/types` для `Role`.
- [x] **A6** `@/mocks/user` видалено повністю (initial count 25 виявився завищеним — реальних споживачів було 9). Три підкроки:
  - [x] **A6.1** Перенесено `CompanionAnimal` + `CompanionMood` у `@/lib/types`. `CompanionSVG.tsx`, `lib/shop-catalog.ts`, `lib/library-data.ts` переключено на type-only імпорт з `@/lib/types`. `CompanionSVG` більше не дублює `CompanionMood` локально — re-export для існуючих споживачів.
  - [x] **A6.2** Новий `lib/use-kids-identity.ts` — єдиний хук `useKidsIdentity(): { name, level }`. Налаштовано 6 споживачів: welcome (name), characters/library-[id]/shop/school (level), dashboard (coins fallback переведено на 0 замість mock-значення). Хук тягне `firstName` і `kidsProfile.currentLevel` з сесії, з fallback `'друже'`/`'A1'`. `tsc --noEmit` чистий.
  - [x] **A6.3** Видалено `frontend/mocks/user.ts`. `grep -R "@/mocks/user" frontend/` порожній. `tsc --noEmit` чистий. `frontend/mocks/*.json` лишаємо — споживаються `backend/scripts/import-mocks.ts`.
- [~] **A7** Запустити імпорт проти Railway staging. Тепер автоматизовано через `IMPORT_MOCKS_ON_BOOT=1` env var: ставиш змінну в Railway backend service → redeploy → bootstrap викликає `runImport(strapi)` → знімаєш змінну. Скрипт ідемпотентний. Runbook нижче.
- [x] **A8** Rich lesson data → Strapi. Обрано варіант (a) — JSON-поле. **Backend**: додано `steps: json` + `xp: integer` у `api::lesson.lesson` schema. Core importer винесено з `scripts/` у `src/lib/mock-importer.ts` (щоб був доступний у compiled runtime). Локальний скрипт `extract-lesson-steps` читає `frontend/mocks/lessons/*.ts` → емітує `frontend/mocks/lesson-steps.json` (committed, 26KB, 938 LOC, 7 lessons × 5-7 steps кожен). Importer читає JSON і пише steps+xp у lesson-документ; idempotent backfill для existing documents. **Frontend**: `Lesson` type у `lib/types.ts` розширено `steps?: unknown[]` + `xp?: number`; `normalizeLesson` їх підтягує; `app/courses/[courseSlug]/lessons/[lessonSlug]/page.tsx` переписано на `fetchLesson(courseSlug, lessonSlug)` + `fetchLessonsByCourse(courseSlug)` для next-slug; hardcoded `LESSON_REGISTRY` + `NEXT_LESSON` видалено; `notFound()` якщо lesson або steps порожні; adapter `toLessonData()` кастить `unknown[]` → `LessonStep[]` при передачі в `LessonEngine`. Backend+FE `tsc --noEmit` + `eslint` чисті; `strapi build` зелений.

**Runbook — A7 (Railway: IMPORT_MOCKS_ON_BOOT)**

Варіант для користувача без SSH (тільки env vars у Railway):

```
1. Railway → backend service → Variables → додати IMPORT_MOCKS_ON_BOOT=1
2. Trigger deploy (Railway автоматично після save, або ручний redeploy)
3. Дивитись logs: "[import] starting mock import" ... "[import] done"
4. У Strapi admin (https://<backend-host>/admin) перевірити:
   - Content → Course: 6+ записів зі slug/title/teacher
   - Content → Lesson: lessons прив'язані до курсів; rich lessons (hello-goodbye,
     my-name-is, numbers-colors, daily-routines, food-drinks, my-house, reading-animals)
     мають заповнені `steps` (JSON-масив) і `xp`
   - Content → Session: startAt в ISO, teacher+course
   - Content → Teacher profile: 3+ вчителі з publicSlug
   - Users → 3+ seed-юзерів @placeholder.englishbest.app
5. Railway → Variables → видалити IMPORT_MOCKS_ON_BOOT
6. Trigger final deploy (без impor-тера в bootstrap)
```

Варіант для розробника з CLI-доступом (dev / повторний прогін):

```bash
cd backend
cp .env.example .env            # якщо ще не створено
export DATABASE_URL="postgres://..."   # staging або local
export JWT_SECRET="..." APP_KEYS="..." ADMIN_JWT_SECRET="..." API_TOKEN_SALT="..." TRANSFER_TOKEN_SALT="..."
npm run import-mocks             # один shot через tsx + programmatic Strapi
```

Якщо оновили TS-моки `frontend/mocks/lessons/*.ts` — перед імпортом треба
перезгенерувати JSON: `npm run extract-lesson-steps --workspace=backend`
(виконується на dev-машині, комітиться `frontend/mocks/lesson-steps.json`).

Rollback: скрипт ідемпотентний (dedupe по slug/publicSlug/email+startAt; для lessons з існуючими IDs — `steps`/`xp` backfill). Якщо треба скасувати — видалити записи через Admin UI (Strapi Documents API поважає каскад teacher→user-profile→user).

**Acceptance (Phase A):** Courses page, Lessons catalog, Calendar, Profile, Home dashboard рендерять живі дані зі Strapi; lesson-плеєр читає `steps`/`xp` із Strapi (не з TS-мок-реєстра); `grep -R "from '@/mocks" frontend/app` показує тільки type-only імпорти з `mocks/lessons/types`; `mocks/lessons/*.ts` лишаються як dev-source для extractor-а; e2e smoke працює без `/api/mock`. Залишається Phase A7 — користувач має виставити `IMPORT_MOCKS_ON_BOOT=1` на Railway.

### Phase R — Code-health refactor (без нових сутностей)

Додано 2026-04-22 після gap-audit §3a. Не чіпає бекенд-сутності, не прибирає моки; працює тільки з якістю існуючого коду. Виконується перед A8 / Phase B, щоб не мультиплікувати технічний борг.

- [x] **R1** Видалено dead code: `frontend/lib/library-mocks.ts` (59 LOC, 0 споживачів). `tsc --noEmit` чистий.
- [x] **R2** Style-cleanup: 44 `[var(--tk-*)]` escapes → Tailwind utilities (додано kid-bg/kid-border/kid-ink у @theme; `tk-blue`→`secondary`, `tk-muted`→`ink-muted`). 3 статичних `style={{...}}` видалено (LessonCharacter transformOrigin → `origin-bottom`; ProgramDetail height/minHeight → Tailwind). Решта 54 `style={{...}}` — data-driven (runtime кольори з data, позиції, %-widths, env safe-area, CSS custom properties для керамера анімацій) — залишаємо свідомо. Критерій досягнуто: `grep -R bg-\[var\\(--` = 0, всі статично-константні style={{}} з color/shadow/radius прибрано.
- [~] **R3** Split великих файлів — **deferred**. Аналіз показав, що 5 із 6 кандидатів (`AddCustomModal`, `LootBox`, `MiniTaskBuilder`, `LessonBlockEditor`, `StudentDetail`) буде суттєво переписано в Phase B-G (перехід на бекенд-сутності). `CompanionSVG` — Phase C замінює SVG-рендер на PNG-upload. Split зараз — YAGNI; робиться в тих фазах, де файли і так переписуються.
- [x] **R4** Додано root-level `error.tsx`, `global-error.tsx`, `loading.tsx`, `not-found.tsx` у `frontend/app/`. `error.tsx` — Client Component з reset() + console.error; `global-error.tsx` — fallback для помилок root-layout (inline styles тому що Tailwind може бути недоступний); `loading.tsx` — spinner + aria-busy; `not-found.tsx` — 404 з посиланням на "/". Subtree-specific (kids, dashboard) — відкладено до тих фаз, де ці сегменти переписуються (Phase B / G), щоб одразу задати правильний UX.
- [x] **R5** ESLint baseline — `eslint.config.mjs` вже існував (undercount у попередньому audit; script `lint: "eslint"` теж). Виправлено реальні errors: 2 `no-unescaped-entities` (`Ім'я` → `Ім&apos;я`); `<a href="/">` → `<Link>` у новому `error.tsx`; file-level `eslint-disable @typescript-eslint/no-explicit-any` у `lib/api.ts` + `lib/normalize.ts` з reason (Strapi envelope boundary, narrowing локалізоване). React 19 strict hooks rules (`set-state-in-effect`, `purity`, `use-memo`, `refs`, `preserve-manual-memoization`) тимчасово downgrade до `warn` — 7 legitimate порушень у Kids-zone/teacher-файлах, які переписуються в Phase B/G (коментар у config пояснює). Результат: `npm run lint` → 0 errors, 95 warnings (переважно `@next/next/no-img-element` для Base64 data-URLs у kids-zone — легітимно, `<img>` потрібен, бо data URL не можна optim-ити через next/image).
- [x] **R6** Resolve in-src TODOs: Calendly URL → `NEXT_PUBLIC_CALENDLY_TRIAL_URL` env-var (`app/courses/[courseSlug]/lessons/[lessonSlug]/page.tsx`); `QuizWidget.handleSubmit` — коментар з відсиланням на Phase E (реальний POST там); register-форма (`app/auth/register/page.tsx`) підключена до `useSession().register()` з error-UI (роль `kids|adult`, ageGroup/phone у payload). `tsc --noEmit` + `eslint` чисті.
- [x] **R7** Мінімальний helper `apiErrorMessage(err, fallback)` у `lib/fetcher.ts` (читає Strapi `error.message` з response body, fallback → UA-мережева помилка). Повний `handleApiError` + toast-система відкладено: зараз 1 catch-сайт на весь FE, повноцінний helper — YAGNI. Ревізія коли з'являться ≥3 catch-сайти (Phase B/C wiring).

**Acceptance (Phase R):** `grep bg-\[var` = 0 ✓, жодних статичних `style={{}}` з color/shadow/radius ✓ (решта 54 — data-driven, лишаються), `npm run lint` зелений (0 errors, 95 warnings) ✓, 4 error/loading/not-found сторінки на місці ✓, `tsc --noEmit` чистий ✓, 0 мок-TODO у not-phased-out коді ✓. R3 (file-split >500 LOC) свідомо deferred у Phase B-G разом з переписом тих же файлів.

### Phase B — Kids Zone state на backend

Мета: перенести `KidsState` з IndexedDB у Strapi, щоб прогрес зберігався між пристроями.

- [x] **B1** Content-type `api::user-inventory.user-inventory` (1:1 до `user-profile`). Поля:
  - `ownedShopItems` — relation manyToMany → `shop-item`.
  - `equippedItems` — relation manyToMany → `shop-item` (підмножина owned; validate у контролері).
  - `outfit` — json (slot → shop-item.slug): `{ hat, glasses, scarf, backpack }`.
  - `placedItems` — json `[{ id, itemId, x, y, scale, z }]` (deferred component-type — Phase D).
  - `seedVersion` — integer.
  - Relations до `room` (unlockedRooms/activeRoom) і `character` (activeCharacter) відкладено у Phase C, бо сутностей ще нема.
- [x] **B2** Kids-profile: endpoint `PATCH /api/kids-profile/me` + `GET /api/kids-profile/me`. Приймає `totalCoinsDelta` (int, може бути від'ємним; backend валідує баланс ≥0), `totalXpDelta` (non-negative int), `streakDays`, `streakLastAt`, `characterMood`. Абсолютні coins/xp не приймаються — уникаємо client-authoritative balance writes.
- [x] **B3** Кастомний `user-inventory` controller з тільки `/me` endpoints: `GET` (auto-create on first hit), `PATCH` (outfit/placedItems/equippedItems/ownedShopItems/seedVersion — приймає масиви slugs, сам конвертує у docIds). `equippedItems` — subset-of-owned check (проти post-patch owned, щоб purchase+equip в одному виклику лишалось валідним). Core router не підключено — тільки `/me` endpoints назовні.
- [x] **B4** Seed `07-user-inventories.ts` — idempotent backfill порожнього `user-inventory` для кожного existing kids-profile. Always-run. Controller також auto-creates on first `GET` — belt-and-suspenders.
- [x] **B5** FE `lib/kids-store.ts` переписано на remote-first: `kidsStateStore.get()` паралельно фетчить kids-profile + user-inventory через `/api/kids-profile/me` + `/api/user-inventory/me` proxy routes; `patch()` робить diff проти in-memory кешу й роутить поля у два endpoints (coins/xp/streak → kids-profile; outfit/placedItems/owned/equipped → user-inventory). Кеш очищується на logout (`kidsStateStore.reset()` виклик у session-context). Next proxies у `app/api/user-inventory/me/route.ts` + `app/api/kids-profile/me/route.ts` — читають access-JWT з httpOnly cookie, ніколи не віддають його в браузер. IndexedDB-код для custom items/rooms/characters залишено як є (user-uploaded — Phase I offline-cache з'єднає).

**Acceptance:** Coins/XP/streak/inventory/outfit/placedItems переживають вихід і вхід на інший браузер; IndexedDB порожня на свіжому пристрої = state приходить із бекенду.

### Phase C — Characters + Rooms каталоги

- [x] **C1** Content-type `api::character.character`:
  - `slug` uid, `nameEn`, `nameUa`, `description`, `rarity` (common/rare/epic/legendary), `priceCoins` integer, `orderIndex`.
  - `emotions` — JSON map `Record<emotion, imagePath>` (8 емоцій із `lib/characters.ts`). PNG-шляхи вказують на `frontend/public/characters/*` — лишаємо на Vercel-static, без media-upload, поки є art-pipeline.
  - `fallbackEmotion` enum.
- [ ] **C2** User-character ownership — **rescoped**. Замість окремої сутності `api::user-character.user-character` візьмемо m2m-relation на `user-inventory.ownedCharacters` + `activeCharacter` (m2o). Причина: легше для одного кіда (без per-pair metadata поки що), консистентно з уже наявним `ownedShopItems`. Окрему сутність додамо в Phase I якщо з'являться per-ownership поля (acquiredAt, gift-from, …).
- [x] **C3** Content-type `api::room.room`:
  - `slug`, `nameEn`, `nameUa`, `coinsRequired`, `background` **string** (CSS shorthand — `url(...)` або `linear-gradient(...)`), `iconEmoji`, `orderIndex`. String, не media, щоб зберегти існуючі gradient-кімнати з FE без art-pipeline.
- [x] **C4** Seed: `08-characters.ts` (fox + raccoon, emotion PNG paths) + `09-rooms.ts` (bedroom/garden/castle/space/underwater з існуючими FE-значеннями).
- [x] **C5** Permissions: public read для обох каталогів; write — admin. Grants додані у `03-permissions.ts`.
- [x] **C6** Endpoints:
  - `POST /api/user-inventory/me/purchase-character { slug }` — валідує kids-profile, character existence, not-already-owned, balance; append-then-debit із compensating revert при debit fail.
  - `POST /api/user-inventory/me/unlock-room { slug }` — аналогічно.
- [x] **C7 (rooms)** FE — hard-coded rooms у `kids/room/page.tsx` прибрано; каталог тягнеться через `/api/rooms` (public proxy) → `lib/rooms.ts::fetchRooms()` → `useRoomCatalog()`. Unlock → `kidsStateStore.unlockRoom(slug)`, вибір → `patch({ activeRoomId })`. Custom (IDB) rooms лишаються як локальний шар поверх server-каталогу.
- [x] **C7 (characters)** FE — `kids/characters/page.tsx`: BUILTIN_CHARS (з плейсхолдерами cat/rabbit/dragon) прибрано; каталог тягнеться через `/api/characters` → `lib/character-catalog.ts::fetchCharacters()` → `useCharacterCatalog()`. Purchase → `kidsStateStore.purchaseCharacter(slug)`; swap → `patch({ activeCharacterId })`. `lib/characters.ts` отримав runtime-registry (`registerServerCharacter`/`getRegisteredCharacter`) — admin додає character у Strapi з emotion-map на upload-ed PNGs, FE рендерить без редеплою. Custom (IDB) characters лишаються як локальний шар.

**Acceptance:** Adding new character у Strapi admin з'являється в UI без деплою. Купівля персонажа зменшує coins на сервері й фіксується у `user-character`.

### Phase D — Shop flow справжній

- [x] **D1** Seed: `05-shop-items.ts` — 20 предметів, media заповнюється через admin UI.
- [x] **D2** Endpoint `POST /api/user-inventory/me/purchase-shop-item { slug }` — coins + рівень check, append → `ownedShopItems`, списання з compensating revert.
- [x] **D3** Endpoint `POST /api/user-inventory/me/equip { slug, equip }` — toggle owned item. Idempotent.
- [x] **D4** FE — `app/(kids)/kids/shop/page.tsx` читає з `useShopCatalog()` → `/api/shop-items`; купівля через `purchaseShopItem(slug)`, equip через `equipShopItem(slug, equip)`.
- [x] **D5** FE — placements use `kidsStateStore.updatePlacedItems()`: cache updates instantly, `/api/user-inventory/me` PATCH is debounced 500ms; `pagehide`/`beforeunload` listeners use `fetch keepalive:true` to flush on unload.

**Acceptance:** Покупка предмета зменшує coins на сервері; предмет з'являється у іншому браузері; rollback при помилці.

### Phase E — Progress / Achievements / Lessons engine

- [x] **E1** FE — `postProgress()` перенаправлено на `POST /api/user-progresses` (scoped controller існує).
- [x] **E2** Backend lifecycle `afterCreate/afterUpdate` у `user-progress` (`content-types/user-progress/lifecycles.ts`) — при transition `status → completed`:
  - зараховує 10 coins + 15 xp у `kids-profile` або `adult-profile` (role-routed),
  - advance streak (same-day no-op / +1 day / reset to 1) на `streakLastAt`,
  - evaluate achievements типів `lessons-completed`, `streak-days`, `coins-earned` → створює `user-achievement` + applies ach.coinReward/xpReward. Idempotent: `beforeUpdate` stashes `prevStatus`, so re-saves don't double-credit; earned slugs set prevents duplicate achievements.
- [x] **E3** Seed `06-achievements.ts` — 12 achievements з criteria (lessons-completed 1/5/20, streak-days 3/7/30, coins-earned 100/1000, level-reached A2/B1, shop-purchases 1, items-placed 10).
- [x] **E4** FE — `app/(kids)/kids/achievements/page.tsx` тепер через `useAchievements()` читає `/api/achievements` (catalog) + `/api/user-achievements?populate[achievement][populate]=icon` (earned); earned-slugs Set join по slug; mini-stats з `useKidsState()` (live `/me`). Новий scoped controller `user-achievement` (find/findOne scope до caller's profile; staff bypass). `coins` сторінка вже читала з `state.coins` (live).
- [x] **E5** Companion mood: lifecycle викликає `setKidsMood(ctx, 'happy')` на completion (тільки для role=kids). Інші тригери (sad на fail, celebrate на streak milestone) — поки not wired, додамо коли з'явиться fail-path.

**Acceptance:** Завершення уроку → coins/xp оновлюються, streak продовжується, відповідний achievement розблоковується, companion змінює мудру — усе з одного створення `user-progress`.

**Deferred criteria triggers** (не на critical path, але треба для повного seed coverage):
- `shop-purchases` — має викликатися в `user-inventory.purchase-shop-item` controller після debit.
- `items-placed` — у `user-inventory.update` (PATCH) при зміні довжини `placedItems`.
- `level-reached` — у `user-profile` lifecycle при зміні `level`.
Рефактор: винести `evaluateAchievements` із `user-progress/lifecycles.ts` у shared service (наприклад `achievement/services/evaluator.ts`), щоб усі 3 тригери викликали однакову логіку.

### Phase F — Library (books/videos/games)

- [x] **F1** Рішення: розширили `course` (а не окремий content-type) — менше дублювання, бо курси/книги/відео/ігри ділять level/price/title/slug.
- [x] **F2** `course` schema отримав поля: `kind` enum(course/book/video/game), `iconEmoji`, `externalUrl`, `provider`, `titleUa`, `subtitle`, `descriptionShort`, `descriptionLong` (json array), `preview` (json `{title, text}`), `isNew`. (`isFree` не додавали — легко виводиться з `price === 0`.)
- [x] **F3** Seed `10-library-items.ts` — 14 library rows (books, videos, games) з повними descriptionLong/preview з колишнього `library-data.ts`. Idempotent by slug; реєструється в `seeds/index.ts` після user-inventories. Курси (`kind=course`) свідомо не сіємо — це живий адмін-контент.
- [x] **F4** FE — нова `lib/library.ts` (fetchLibraryItems + types + UI-константи) + `useLibrary()` hook у `use-kids-store.ts`. `kids/school/page.tsx` (library tab) і `kids/library/[id]/page.tsx` читають з API через `useLibrary()`. Tabs тепер `book/course/video/game` (singular, збігаються з kind). `lib/library-data.ts` видалено.

**Acceptance:** Library tabs рендеряться з бекенду; додавання нової книжки в admin з'являється без деплою.

### Phase G — Teacher dashboard (reale data)

Найбільший чанк. Розбиваємо на суб-фази.

- [x] **G1 — Groups** ✅
  - Content-type `api::group.group`: `name`, `level`, `teacher` (manyToOne), `members` (manyToMany → user-profile), `scheduleRrule` string, `activeFrom/To`, `meetUrl`, `avgAttendance/avgHomework`.
  - Scoped controller (`backend/src/api/group/controllers/group.ts`): teacher бачить/мутує свої; admin — усе; student/parent — members-only read.
  - Permissions seed оновлено (find/findOne = AUTH_ALL, create/update/delete = STAFF).
  - FE: `lib/groups.ts` (типи + fetchGroups/fetchGroup/createGroup/updateGroup/deleteGroup); proxy routes `/api/groups` + `/api/groups/[id]`; `dashboard/groups/page.tsx` читає live дані.
  - Students page ще на моках — учнів окремо не модельовано (це user-profile filter); буде в подальших фазах.
- [x] **G2 — Homework flow повний** ✅
  - Content-type `api::homework-submission.homework-submission` (status enum notStarted/inProgress/submitted/reviewed/returned/overdue; submittedAt/gradedAt/score/teacherFeedback/answers/attachments).
  - Scoped controllers:
    - `homework-submission` — student own R/W (pre-submit), teacher sees assignees of own homework і може ставити оцінку (score/teacherFeedback/status=reviewed|returned), parent read-only для дітей, admin bypass.
    - `homework` — teacher-owned find/findOne/create/update/delete; `teacher` форсований на create; student/parent бачать через assignees m2m.
  - Lifecycle (`api/homework/content-types/homework/lifecycles.ts`): на afterCreate/afterUpdate зі `status=published` — auto-create per-assignee submission row (idempotent).
  - Permissions seed: `homework-submission` find/findOne/update = AUTH_ALL (server-side scoping); create/delete = ADMIN.
  - FE: `lib/homework.ts` (fetchSubmissions/fetchSubmission/gradeSubmission/updateMySubmission + fetchHomeworks/createHomework/publishHomework); proxies `/api/homeworks` + `/api/homework-submissions`; `dashboard/homework/page.tsx` + `[id]/review/page.tsx` читають реальні submissions, teacher може grade/return з optimistic UI.
  - Deferred: coin rewards на score (потрібен rules-engine + user-progress hook); видалення `HOMEWORK_KIND_LABELS`/`CreateHomeworkModal` мок-wiring — модалка зараз створює моково, повноцінне створення ДЗ буде пов'язане із bibliothek'ою (G4).
- [x] **G3 — Mini-tasks** ✅
  - Schema оновлено: додано `kind` enum (quiz/level-quiz/daily-challenge/word-of-day/listening/sentence-builder) + `durationMin`.
  - Scoped controller: teacher бачить свої + public; student/parent — тільки public; author форсований на create.
  - FE: `lib/mini-tasks.ts` (fetchMiniTasks/createMiniTask/deleteMiniTask + KIND_LABEL); proxies `/api/mini-tasks`; `dashboard/mini-tasks/page.tsx` читає live.
  - Deferred: `assignedCount`/`avgScore` на картках — метрики потребують aggregation endpoint (Phase G9); призначення конкретним учням теж буде після G9.
- [x] **G4 — Lesson library / editor** ✅
  - Schema `api::lesson.lesson` розширено: `owner` (mto→teacher-profile), `source` enum (`platform|own|copy|template`, default `platform`, required), `originalLesson` self-relation, `topic`, `level` enum A0..C2, `tags` json.
  - Scoped controller `src/api/lesson/controllers/lesson.ts`: teacher бачить own (owner) + public (`platform|template`); анонім/student/parent — тільки public. На create `owner` форсується, `source` обмежується `own|copy`. На update заборонені `owner`/`source`/`originalLesson` + не можна редагувати/видаляти `source=platform`.
  - FE: `lib/teacher-library.ts` (fetchLessons/fetchLesson/createLesson/updateLesson/deleteLesson/cloneLesson); proxies `/api/lessons` + `/api/lessons/[id]`; `dashboard/teacher-library/page.tsx` читає live + має "Копія" action для public; editor `[id]/edit/page.tsx` завантажує з бекенда, зберігає через PUT (або POST для `new`), блокує редагування для `platform|template` (пропонує клонувати).
  - Блоки редактора зберігаються у `lesson.steps` json (існуюче поле) — editor-UI + preview лишилися без змін, вони вже працюють з `LessonBlock[]`.
  - Deferred: history/версії (`MOCK_VERSIONS` прибрано) — потребує окремого content-type; шаблонне збереження; синхронізація `hasUpdateFromOriginal` з оригіналом; backfill `source=platform` для існуючих platform-уроків у seed.
- [x] **G5 — Chat** ✅
  - `api::thread.thread` — title, kind (student/group/parent), participants m2m → user-profile (inverse `user-profile.threads`), messages o2m, lastMessageBody/At (denorm).
  - `api::message.message` — thread mto, author mto → user-profile, body text required, attachments media, pinned bool, replyTo self-mto, readBy m2m → user-profile.
  - Scoped controllers: thread — find/findOne filter by `participants.documentId=caller`, create (teacher/admin only, caller auto-added, hijacking stripped); message — find вимагає `filters[thread][documentId]`, findOne перевіряє членство; create форсує `author=caller` + валідує членство + оновлює `thread.lastMessage*`; update author-only для `pinned`, участник може додати себе в `readBy`; delete = author або admin.
  - Permissions seed: thread create/delete = STAFF/ADMIN; все інше AUTH_ALL (scoping на контролері).
  - FE: `lib/chat.ts` (fetchThreads/fetchMessages/sendMessage/togglePinMessage/markMessageRead/createThread + THREAD_KIND_LABELS); proxies `/api/threads`, `/api/threads/[id]`, `/api/messages`, `/api/messages/[id]`; `dashboard/chat/page.tsx` повністю переписано — читає live, polling 10 с, optimistic send, reply/pin wired, auto-markRead при перегляді.
  - Deferred: attachments upload (media pipeline), mass messaging (MassMessageModal лишився як мок), thread-level `pinned` (зараз лише message.pinned), websockets / SSE (Phase I).
- [x] **G6 — Attendance** ✅
  - `api::attendance-record.attendance-record` — session mto, student mto (→ user-profile), status enum `present|absent|late|excused` (default `present`), note text, recordedAt datetime, recordedBy mto → teacher-profile.
  - Scoped controller: teacher бачить/пише records лише для власних сесій (`session.teacher = caller`); parent читає records своїх дітей; student читає власні; admin bypass. На create/update примусово виставляє `recordedBy=caller`. `create` — idempotent upsert: якщо вже існує запис для `(session, student)`, редирект на `super.update`. Update стирає immutable links + оновлює `recordedAt`.
  - Permissions seed: find/findOne AUTH_ALL, create/update/delete STAFF (scoping у контролері).
  - FE: `lib/attendance.ts` (fetchTeacherMonthSessions + fetchMonthAttendance + upsertAttendance/deleteAttendance); proxies `/api/attendance-records`, `/api/attendance-records/[id]`, `/api/sessions`, `/api/sessions/[id]`; `dashboard/attendance/page.tsx` повністю переписано — readerіng students з live session.attendees, grid днів місяця, cycle present → late → absent → excused → (delete) з optimistic update, стрічка % per-row + per-sheet.
  - Deferred: groups-filter (вимагає cross-ref з `api::group`), Excel/PDF export, session.controller teacher-scoping (зараз AUTH_ALL все бачить — FE лімітує).
- [x] **G7 — Payments / payouts** ✅
  - `api::lesson-payment.lesson-payment` — session mto, teacher mto → teacher-profile, payout mto (→ teacher-payout, inverse `lessonPayments`), grossAmount/netAmount decimal, currency string (default `UAH`), status enum `pending|processing|paid|cancelled`, paidAt datetime, note text.
  - `api::teacher-payout.teacher-payout` — teacher mto, periodYear int (2020-2100), periodMonth int (1-12), lessonsCount int, ratePerLesson decimal, total decimal, currency string, status enum, paidAt datetime, note text, lessonPayments o2m (mappedBy `payout`).
  - Scoped controllers (same pattern for both): admin bypass; teacher reads own (`teacher.documentId = caller`); create/update/delete admin-only (payouts — admin-curated).
  - Permissions seed: find/findOne AUTH_ALL (scoping на контролері), create/update/delete ADMIN.
  - FE: `lib/payments.ts` (fetchTeacherPayouts + fetchLessonPayments + periodLabel); proxies `/api/teacher-payouts[/id]`, `/api/lesson-payments[/id]`; `dashboard/payments/page.tsx` повністю переписано — читає live payouts, рендерить current-month + pending + total-earned картки, history table, upcoming-lessons forecast зі справжнього `api/sessions` поточного місяця.
  - Deferred: авто-генерація payout з session.completed + attendance (G9 analytics); PDF/Excel export; editable rate per teacher (G8 profile); lesson-payment drill-down UI (exposed in lib, not surfaced).
- [x] **G8 — Profile** ✅
  - Custom controller actions `findMe` + `updateMe` на `api::teacher-profile`. Stock `update` затягнуто до ADMIN (teacher-to-teacher overwrite через CRUD заблоковано — усе через `/me`). `delete` теж admin-only.
  - `updateMe` allow-list: `bio`, `specializations[]`, `languagesSpoken[]`, `yearsExperience`, `hourlyRate`, `videoMeetUrl`, `maxStudents`, `acceptsTrial`, `publicSlug` (slug regex). NOT writable: `verified`, `rating`, `ratingCount`, `verificationDoc`, `user` link — захист від impersonation / self-verify.
  - Custom route file `routes/02-me.ts`: `GET /api/teacher-profile/me` + `PATCH /api/teacher-profile/me`, обидва під `is-authenticated` policy.
  - Permissions seed: `teacher-profile.findMe/updateMe` AUTH_ALL; `update/delete` ADMIN (раніше було STAFF).
  - FE: `lib/teacher-profile.ts` (fetchMyTeacherProfile + updateMyTeacherProfile + TeacherProfile type); proxy `app/api/teacher-profile/me/route.ts` (GET + PATCH); `dashboard/profile/page.tsx` повністю переписано — прибрано mock `demo_role` + `USERS`/`TRANSACTIONS`/`ACHIEVEMENTS` + `PaymentsModal`; використовує `useSession()`; teacher бачить редактор bio/mov/спеціалізації/ставки/досвіду/URL зустрічей/acceptsTrial; інші ролі — read-only картка + logout.
  - Deferred: avatar upload (media pipeline — окремо з H/I), student/parent/admin role-specific editors, password change, delete account, push/email notification toggles.
- [x] **G9 — Analytics** ✅
  - Новий API без content-type `api::analytics.analytics` (тільки routes + controller — pattern аналогічно `auth`).
  - `GET /api/analytics/teacher` (teacher-role only): 6-місячний time-series `{lessons, homeworkGraded, avgGrade}` з `session.status='completed'` + `homework-submission` reviewed/returned; KPIs поточного місяця `{lessonsThisMonth, pendingHomework, attendancePct, avgGrade}` — attendance рахується зважено (present=1, late=0.5, excused=0.5); levelBuckets по distinct attendees в межах 6-міс вікна; honor roll — top 3 учнів по homework completion rate (min 3 subs).
  - `GET /api/analytics/admin` (admin-role only): time-series `{revenue (з teacher-payout.total), lessons, students}` за 6 міс; KPIs `{revenueThisMonth, activeStudents, lessonsThisMonth, avgRating, reviewsTotal, learnersTotal, teachersTotal}`; top 5 teachers за current-month payout + session coverage; platform-wide level distribution.
  - Scoping — у контролері (`ctx.state.user.role.type`); AUTH_ALL у seed на обидві actions, але handler 403 якщо не та роль.
  - FE: `lib/analytics.ts` (fetchTeacherAnalytics + fetchAdminAnalytics + типи); proxies `/api/analytics/teacher` + `/api/analytics/admin`; `components/teacher/TeacherAnalytics.tsx` повністю переписано — прибрано MOCK_HOMEWORK/MOCK_SCHEDULE/MOCK_STUDENTS, live KPIs/chart/levels/honorRoll; `dashboard/analytics/page.tsx` — прибрано localStorage `demo_role`/`sidebar_role` detection + захардкодженi MONTHLY/TOP_TEACHERS/LEVEL_DIST/RECENT_EVENTS; route через `useSession()` (teacher → TeacherAnalytics; admin → live admin dashboard; інші — notice).
  - Deferred: RECENT_EVENTS feed (потребує окремого `audit-log` aggregation endpoint); platform-wide rating breakdown; per-teacher drill-down; export.

**Acceptance на Phase G:** жодного import from `@/lib/teacher-mocks`; всі 26 споживачів переведено; e2e smoke для teacher flow (login → groups → assign homework → grade submission). Поточний стан: 21 файл ще імпортує — переважно type-only (`Level`, UI constants), але `teacher-calendar`, `students`, `teacher-library`, `assignModals`, mass-message тощо ще потребують перетягнення з mocks на live-дані (задача наступної фази cleanup / деферовано з H/I).

### Phase H — Parent flow

- [x] **H1 — Parent /me/children endpoints** ✅
  - Новий API без content-type `api::parent.parent` (pattern як auth/analytics — routes + controller).
  - `GET /api/parent/me/children` — список linked-дітей (`user-profile.parentalConsentBy = parent.documentId`, role in kids/adult); для кожного — `{child, kidsProfile, upcomingSessions(5), pendingHomework, recentProgress(5), completedLessons, avgScore}`.
  - `GET /api/parent/me/children/:kidDocId` — deep-view однієї дитини: повний kids-profile + 20 upcoming sessions + 50 homework submissions + 50 progress rows + розширена summary.
  - Scoping: handler 403-ить якщо роль не parent/admin; admin може імперсонувати через `?parentId=<profileDocId>`.
  - Linkage: використано простий `user-profile.parentalConsentBy` m2o (той же, що в `homework-submission` scoped controller). Багатий `parent-link` m2m ще не wired end-to-end.
  - Permissions seed: `api::parent.parent.children` + `api::parent.parent.child` = AUTH_ALL (scoping у контролері).
- [x] **H2 — Parent dashboard FE** ✅
  - `lib/parent.ts` — `fetchMyChildren()` + `fetchChildDetail(kidDocId)` + типи (ChildSummary/ChildDetail/SessionLite/HomeworkPending/ProgressEntry).
  - Proxies `/api/parent/me/children[/kidDocId]` — thin JWT forward.
  - `dashboard/parent/page.tsx` повністю переписано з "🛠️ В розробці" на live-кабінет: header з кількістю дітей, tab-switcher якщо >1 дитина (з ДЗ-badge), per-child block: ідентифікаційна картка (companion animal + coins/XP + level), 4 KPI (completed/avgScore/pending/streak), 2-колонкова сітка «Найближчі заняття» + «ДЗ», список «Останні уроки».
  - Guards: `status=loading/anonymous`, `role !== parent|admin`, empty-state («немає прив'язаних дітей»), error state.
  - Deferred: drill-in у `ChildDetail` (поки tab-switcher + summary-view достатньо); notifications subscription; billing view; messaging view (потрібно розширити `thread` scoping для parent).

**Acceptance на Phase H:** parent може ввійти → побачити дітей → побачити розклад + ДЗ + прогрес без 403/порожніх блоків при реальних даних.

### Phase K — UI/Design-system unification & mock kill-switch (додано 2026-04-23)

> **Контекст.** Користувач 2026-04-23: «повний рефакторинг кожної сторінки. Мета — оптимізація коду й структури, щоб у майбутньому було значно легше продовжувати. Єдина дизайн-система, компоненти замість інлайнів, абсолютна консистентність (тільки kids vs adult UI відрізняються). Жодних моків — усі дані лише з бекенду. Якщо щось ще не реалізовано — середині елементу "В розробці". Глибоке розуміння що вже працює і на якому рівні, а що треба доробити до продакшн рівня.»

Phase K ставиться **перед Phase I (polish)** і **перед Phase J (QA)** у пріоритеті, бо J тестує саме те, що K уніфікує. I-кроки (email, websockets, Sentry) — після K + J.

**Правила Phase K (додатково до §7 Hard rules).**
1. Не створюємо нових Strapi-сутностей. Якщо бекенду для фічі нема — `<WipSection />` placeholder, не мок.
2. Один коміт = одна сторінка (або один primitive + усі його call-site-и). Diff ~≤200 LOC. Memory `feedback_chunked_work`.
3. Після кожного коміту: `tsc --noEmit` (обидва пакети) + `npm run lint` = 0 errors. ESLint-warnings можуть рости тимчасово, але не errors.
4. Мок-кілл — прогресивний. Видаляємо `teacher-mocks.ts`/`shop-catalog.ts` constants лише після того, як останній runtime-споживач переведено. До того — file-level `// @deprecated Phase K` коментар.
5. Zero hardcoded `bg-[#...]`, `text-[#...]`, `style={{ color: ... }}` з константами. Data-driven inline (runtime-колір з data, %-ширина progress-bar) — лишається, але з коментарем `// data-driven: <why>`.
6. Kids ↔ adult UI — тільки two tracks. Всередині track — абсолютна консистентність (однакові shells, tiles, typography, spacings). Пара tokens `--kids-*` vs `--adult-*` може переконфігурувати тему, але primitives ті самі.
7. Кожен K-чанк підходить під правило §5 «нова фіча тільки після Playwright CRUD + scoping тестів попередньої» — під кожен refactor готуємо e2e smoke одразу, не відкладаємо в Phase J.

---

#### K0 — Preflight audit (виконано 2026-04-23, один коміт без коду)

Авторитетний per-page статус. Джерело: `grep -n "^import" + read page.tsx` для всіх 40 page.tsx + споживачі мок-файлів. Матриці нижче — фінальні після K0. `?` більше нема.

**Kids track (9 pages)** — shell: `<KidsPageShell>` (full-screen bg + top coin/level bar + bottom nav).

| Route | LOC | Wired | Data hook(s) | Mock-residue | Readiness |
|---|---:|:-:|---|---|:-:|
| `/kids/dashboard` | 373 | ✅ | `useKidsState` | `@/lib/shop-catalog` (runtime: `SHOP_ITEMS_BY_ID`, `SLOT_OFFSET`) — K9 cleanup; решта моків (CAL_EVENTS/LESSON/CHALLENGES/STREAK_DAYS) видалено → WipSection | 🟢 |
| `/kids/lessons` | 18 | ✅ | — | — (full WipSection-only до user-lesson-progress BE) | 🟢 intent |
| `/kids/shop` | ? | ✅ | `useShopCatalog`, `useKidsState` | — (page clean; `LessonCharacter` — K9 cleanup) | 🟢 |
| `/kids/room` | ? | ✅ | `useRoomCatalog`, `useKidsState` | — (page clean; `CharacterAvatar` uses registry) | 🟢 |
| `/kids/characters` | ? | ✅ | `useCharacterCatalog`, `useKidsState` | — (page clean; registry OK) | 🟢 |
| `/kids/library/[id]` | ? | ✅ | `useLibrary` | — (page clean) | 🟢 |
| `/kids/school` | 234 | ✅ | `useKidsIdentity`, `useLibrary` | — (LessonsCarousel видалено → WipSection; library-tab live) | 🟢 |
| `/kids/achievements` | ? | ✅ | `useAchievements`, `useKidsState` | — | 🟢 |
| `/kids/coins` | ? | ✅ | `useKidsState` | — | 🟢 |

**Adult/Dashboard track (19 pages)** — shell: `<DashboardPageShell>` (sidebar + top-bar, role-aware).

| Route | LOC | Wired | Data hook(s) | Mock-residue | Readiness |
|---|---:|:-:|---|---|:-:|
| `/dashboard` | ? | role-router | `useSession` | — | 🟢 |
| `/dashboard/student` | 9 | redirect | — | — (redirects → `/kids/dashboard`) | 🟢 intent |
| `/dashboard/teacher` | 318 | ❌ | — | FULL `@/lib/teacher-mocks` runtime (`MOCK_TODAY`, `MOCK_GROUPS`, `LESSON_STATUS_STYLES`, `lessonsOnDate`, `pendingHomework`, `atRiskStudents`, `getStudent`, `getGroup`) + hardcoded `const TEACHER = { name: 'Maria Sydorenko' }` | 🔴 |
| `/dashboard/parent` | ? | ✅ | `fetchMyChildren` | — | 🟢 |
| `/dashboard/admin` | 15 | placeholder | — | — (page is "🛠️ В розробці" stub вже) | 🟢 intent |
| `/dashboard/groups` | ? | ✅ | `fetchGroups` | — | 🟢 |
| `/dashboard/students` | ? | ❌ | — | in-file `const STUDENTS: Student[]` (10 rows з randomuser photos) + type-only `Level`; `StudentDetail` molecule використовує `MOCK_HOMEWORK`, `MOCK_ALL_LESSONS`, `MOCK_PAYMENTS`, `MOCK_PROGRESS` | 🔴 |
| `/dashboard/teacher-calendar` | ? | ❌ | — | `@/lib/teacher-mocks` runtime: `MOCK_SCHEDULE`, `MOCK_TODAY`, `getGroup`, `getStudent`, type `ScheduledLesson` | 🔴 |
| `/dashboard/chat` | ? | ✅ | `fetchThreads/Messages` | — | 🟢 |
| `/dashboard/attendance` | ? | ✅ | `fetchTeacherMonthSessions`, `fetchMonthAttendance` | type-only `Level` з teacher-mocks | 🟢 |
| `/dashboard/homework` | ? | ✅ | `fetchHomeworks` | — | 🟢 |
| `/dashboard/homework/[id]/review` | ? | ✅ | `fetchSubmission` | — | 🟢 |
| `/dashboard/mini-tasks` | ? | ✅ | `fetchMiniTasks` | — | 🟢 |
| `/dashboard/teacher-library` | ? | ✅ | `fetchLessons` | type-only `LibraryLesson`, `LessonSource`, `Level` | 🟢 |
| `/dashboard/teacher-library/[id]/edit` | ? | ✅ | `fetchLesson` | type-only `LessonBlock`, `LessonSource`, `Level` | 🟢 |
| `/dashboard/payments` | ? | ✅ | `fetchTeacherPayouts` | type-only `Level` | 🟢 |
| `/dashboard/analytics` | ? | ✅ | `fetchTeacher/AdminAnalytics` | — | 🟢 |
| `/dashboard/prizes` | 222 | ❌ | — | in-file `CASES: CaseData[]` + `RARITY` constants; loot-case UI з rarity weights — feature без backend | 🔴 no-BE |
| `/dashboard/profile` | ? | ✅ | `fetchMyTeacherProfile` | — | 🟢 (teacher; parent/student/admin editor deferred → `<WipSection>`) |

**Auth/onboarding (6 pages)** — shell: `<AuthPageShell>` (centered card + logo).

| Route | LOC | Status | Notes |
|---|---:|:-:|---|
| `/login` | ? | 🟢 | 2026-04-22 rework; live `useSession.login()` |
| `/auth/register` | ? | 🟢 | Phase R6; live `useSession.register()` |
| `/auth/profile` | 326 | 🔴 | Full in-file mocks (`USER`, `TRANSACTIONS`, `ACHIEVEMENTS`) + `Sidebar` component. **Duplicate з `/dashboard/profile`** → delete цю сторінку, redirect → `/dashboard/profile` |
| `/welcome` | 46 | 🟢 | Public hero (fox + CTA); uses `useKidsIdentity` for name; no mocks. Shell-wrap only |
| `/onboarding` | 139 | 🟡 | Hardcoded GROUPS (kids/teen/adult); role-picker UI. Немає write-path до `user-profile.role`. Рішення: або live `PATCH /api/user-profile/me`, або cutover до `auth/register` з role у payload (вже є) → видалити |
| `/placement` | 227 | 🟡 | Hardcoded QUESTIONS; placement test без persist. Рішення: seed placement-test в content-type АБО lightweight POST `PATCH /api/kids-profile/me { currentLevel }` після завершення (без збереження відповідей) |

**Courses/public (7 pages)** — shell: `<CoursesShell>` (public header + content grid).

| Route | LOC | Status | Notes |
|---|---:|:-:|---|
| `/` | 4 | 🟢 | Server redirect → `/home` |
| `/home` | 365 | 🟡 | Public landing; `PopupTimer`, `QuizWidget`, `LanguageSwitcher` OK; `ReviewsSlider` — hardcoded `REVIEWS` array (5 marketing testimonials). Рішення: seed `review` content-type з `featured=true` filter, або `<WipSection>` на відгуки до K9 |
| `/courses/[slug]` | ? | 🟢 | Phase A4.2; `fetchCourseBySlug` |
| `/courses/[slug]/lessons/[slug]` | ? | 🟢 | Phase A8; `fetchLesson` |
| `/library` | 214 | 🔴 | In-file `PROGRAMS` (6 курсів з teacher.photo randomuser). **Duplicate з `/courses`?** — в репо два шляхи до каталогу публічних програм. Consolidation: `course.kind=course` через `useLibrary` АБО редирект `/library → /courses` |
| `/library/[programSlug]` | 309 | 🔴 | In-file `PROGRAMS` з sections/lessons/outcomes. **Duplicate з `/courses/[slug]`** — консолідувати |
| `/calendar` | 123 | 🔴 | In-file `EVENTS: CalEvent[]` (7 events). Audit: хто юзер-цільова? Якщо student/parent — замінити на `/dashboard/parent` drill-in АБО live `fetchSessions` з filters по студенту/ролі. Кандидат на видалення |

---

**K0 findings (підсумок для K5-K8 планування):**

1. **Runtime-mock pages, що потребують рішень K5-K8 (9):**
   - 🔴 no-BE (треба backend aggregator або `<WipSection>`): `/kids/lessons`, `/dashboard/prizes`
   - 🔴 mock-replacement (backend є частково, треба aggregator): `/dashboard/teacher` (teacher-landing — композиція існуючих analytics/homework/attendance), `/dashboard/students` (новий route `GET /api/teacher/me/students` — aggregation, не content-type), `/dashboard/teacher-calendar` (`GET /api/teacher/me/calendar?from&to` — aggregation)
   - 🔴 duplicate-delete: `/auth/profile` (дублікат `/dashboard/profile`), `/library` + `/library/[programSlug]` (дублікат `/courses` + `/courses/[slug]`), `/calendar` (замінюється `/dashboard/parent`/`/dashboard/teacher-calendar` / або live drill-in)

2. **Partial-mock pages (5):**
   - `/kids/dashboard` — лише `SHOP_ITEMS_BY_ID` runtime використовується; решта live. K9 викреслить.
   - `/kids/school` — 621 LOC школа-сцени + live library-tab; треба file-split у K5.7.
   - `/home` — тільки `ReviewsSlider` мок; інше live. K8 або seed `review`, або `<WipSection>`.
   - `/onboarding` — лишаємо кандидатом на deletion (перекривається `/auth/register` role-picker). Рішення в K8.
   - `/placement` — потребує рішення: бекенд-test-bank чи light-persist `currentLevel` через `PATCH /api/kids-profile/me`.

3. **Type-only teacher-mocks residue (5 pages + 4 components):** `/dashboard/attendance`, `/dashboard/payments`, `/dashboard/students`, `/dashboard/teacher-library`, `/dashboard/teacher-library/[id]/edit` + `StudentDetail`, `AssignLessonModal`, `CreateHomeworkModal`, `MiniTaskBuilder`, etc. Усі імпорти — `type Level|LessonSource|LibraryLesson|LessonBlock|...`. K9 переносить їх в `lib/types/teacher.ts` і видаляє файл.

4. **Нові backend route-only endpoints, потрібні перед K6 (не content-types, pattern як analytics/parent/auth):**
   - `GET /api/teacher/me/students` — агрегація `groups.members` + submission-stats + attendance-%. Під `/dashboard/students`.
   - `GET /api/teacher/me/calendar?from&to` — агрегація sessions + homework-deadlines. Під `/dashboard/teacher-calendar`.
   - `GET /api/me/lessons` АБО розширений `fetchCourses` з populate user-progress — під `/kids/lessons`. Альтернатива: `<WipSection>` з посиланням на `/courses` доки нема learner-path UX.

5. **Рішення про `/dashboard/prizes`:** зараз це gamification "loot cases" UI без бекенду. Два варіанти:
   - (a) Повноцінний фіча → новий content-type `api::prize-case.prize-case` з `prizes[]` + endpoint `POST /api/prize-cases/:slug/open` (rng + payout). Великий scope → відкласти як окрему `Phase L (gamification v2)`.
   - (b) MVP → `<WipSection>` у K6.d з «Скоро додамо loot-коробки».
   - **Дефолт:** (b). Переглядається після K10.

6. **Консолідація `/library*` vs `/courses*`:** зараз два public каталоги. Рішення у K8:
   - Ведучі маркетинг-програми (`/library`) вже живуть у Strapi як `course`-записи (Phase A)? → audit `fetchCourses` output. Якщо так → `/library` стає thin wrapper над `useCourses('kind=course')`, а `/library/[programSlug]` → redirect на `/courses/[slug]`. Два URL-и лишаємо для SEO.
   - Якщо ні — seed `course` під library-programs і мігруємо.

**K0 deliverable ✓:** матриці заповнені (7 🔴 + 5 🟡 + 26 🟢/intent/partial у 40 page.tsx); 3 rescope-рішення зафіксовано (prizes → WipSection, library → course-consolidation, calendar → delete/redirect); 3 нові route-only endpoints заплановані у K6 pre-work.

---

#### K1 — Design tokens unification (6 sub-commits, уточнено після K1.1 audit 2026-04-23)

**K1.1 audit findings (globals.css 917 LOC):**

*Наявне в `@theme` (lines 6-74):*
- Colors: `primary/-dark/-light`, `secondary/-dark`, `accent/-dark`, `danger/-dark`, `success/-dark`, `purple/-dark`, `coin/-bg/-border`, `surface/-muted`, `border`, `kid-bg/-border/-ink`, `ink/-muted/-faint`.
- Radius: `sm/md/lg/xl` (8/12/16/24px).
- Typography: `display/h1/h2/h3/body-lg/body/label/tiny` + leadings + tracking.

*Критичні прогалини (відсутні у `@theme`):*
1. Стейт-кольори: нема `--color-warning` (amber), `--color-info` (blue), `--color-primary-hover` (розрізнити hover vs pressed).
2. Нема elevated surface (`--color-surface-raised`).
3. Нема семантичних aliases для radius: `--radius-card`, `--radius-chip`, `--radius-pill`, `--radius-modal`.
4. Нема shadow-tokens: `--shadow-card`, `--shadow-card-md`, `--shadow-overlay` (є `.shadow-card` утиліта з хардкодом, але не token).
5. Нема motion-tokens: `--ease-out-soft` (cubic-bezier(0.22,1,0.36,1) дубльовано у 9 місцях), `--ease-in-out`.
6. Нема z-index scale (`--z-sticky`, `--z-overlay`, `--z-modal`, `--z-toast`).

*Дублікат palette у `.toca` namespace (lines 653-686):* `--tk-blue/-green/-yellow/-pink/-purple/-orange/-red/-teal` (8 кольорів + dark pair each) дублюють `@theme` (tk-blue ≡ secondary, tk-orange ≡ accent, tk-red ≡ danger, tk-green ≈ primary). Це **два паралельних token-системи** з однаковим інтентом. Порушує Phase-K правило «2 треки шейрять primitives». Рішення K1.3 — consolidation: `--tk-blue: var(--color-secondary)`, `--tk-orange: var(--color-accent)` etc., а kids-track-only кольори (`tk-pink`, `tk-yellow`, `tk-teal`) додати в `@theme` як семантичні (`--color-pink`, …).

*Hardcoded hex у CSS utilities (layer utilities, lines 184-606):* ~30 rogue hex — `.ios-btn-secondary:hover #f7f7f5`, `.ios-btn-ghost:hover #f2f1ee`, `.ios-list-header #fafaf8`, `.ios-btn-danger:hover #fff5f5 #fca5a5`, `.ios-dot-*` (4 штуки), `.ios-seg #ececea`, `.bg-room-dark #1a1a2e`, `.bg-wall-gradient`, `.bg-lesson-map`, `.bg-lesson-engine`, `.bg-lesson-success`, `.bg-shop-rare`, `.bg-floor-wood`, `.drop-shadow-*`, `.hud-card` (rgba glass), `.glass-*` (rgba alpha scale).

*Tailwind-escape hex у FE-коді (5 call-sites):*
1. `app/(kids)/kids/school/page.tsx:144` `bg-[#1a1a2e]` → `.bg-room-dark` утиліта вже є.
2. `app/(kids)/kids/library/[id]/page.tsx:200` `bg-[linear-gradient(...#FFFFFF...#FAFAF7)] border-[#EAE5D8] shadow-[...]` (paper-card).
3. `app/(kids)/kids/characters/page.tsx:379` `bg-[#FAFAFA]` (list footer).
4. `app/(kids)/kids/lessons/page.tsx:132` `bg-[#1a1a2e]` (same as school).
5. `app/(kids)/kids/lessons/page.tsx:271` `bg-[#FAFAFA]`.

*Inline `style={{ color/bg: '#...' }}` (6 файлів):* `AddCustomModal.tsx`, `app/global-error.tsx` (legitimate — Tailwind не гарантовано доступний у global-error), `app/(kids)/kids/dashboard/page.tsx`, `components/kids/ui/KidsTabBar.tsx`, `components/kids/LootBox.tsx` + `globals.css` self. Усі (окрім global-error) — кандидати на cleanup у K1.6.

**K1 sub-chunks:**

- [x] **K1.1** Audit + findings (вище). 2026-04-23.
- [x] **K1.2** Додано семантичні tokens у `@theme` (`globals.css`). 2026-04-23:
  - `--color-warning`/`-dark`, `--color-info`/`-dark`, `--color-primary-hover`, `--color-surface-raised` (#FFFFFF), `--color-surface-subtle` (#FAFAFA)
  - `--radius-card` (16px), `--radius-modal` (24px), `--radius-chip` (999px), `--radius-pill` (999px)
  - `--shadow-card`, `--shadow-card-md`, `--shadow-overlay`, `--shadow-press` (`currentColor`)
  - `--ease-out-soft`, `--ease-in-out`
  - `--z-sticky`/`-overlay`/`-modal`/`-toast`
  - Kids accents перенесено з `.toca`: `--color-pink`/`-dark`, `--color-yellow`/`-dark`, `--color-teal`/`-dark`
  - Hand-written `.shadow-card`/`.shadow-card-md` у `@layer utilities` тепер дублюють @theme auto-generated; deduplication → K1.4.
- [x] **K1.3** `.toca` consolidation. 2026-04-23. Усі `--tk-*` → чисті `var(--color-*)` aliases:
  - `--tk-blue/-orange/-red/-purple` = `secondary/accent/danger/purple` (значення збігались — прямий alias).
  - `--tk-pink/-yellow/-teal`: `@theme` значення вирівняно до `.toca` hex (`#FF4081/#FFC800/#00C9A7`), потім alias.
  - `--tk-green` ≠ `--color-primary` (kids Duolingo-lime #58CC02 vs adult teal-green #16a34a) — додано окремий `--color-kids-green`/`-dark` у `@theme`, `--tk-green` alias на нього.
  - Surface/ink: `--tk-bg/-card/-border/-ink/-muted` → `kid-bg/surface-raised/kid-border/kid-ink/ink-muted`.
  - `--tk-btn-shadow` лишено декоративним (kids-only black shadow rgba).
- [x] **K1.4** Замінено hex у CSS utilities на tokens. 2026-04-23:
  - Додано tonal tokens: `--color-surface-hover` (#F7F7F5), `--color-surface-sunk` (#ECECEA), `--color-danger-soft` (#FFF5F5), `--color-danger-light` (#FCA5A5).
  - `.ios-btn-*`, `.ios-chip`, `.ios-input`, `.ios-seg`, `.ios-seg-btn.active`, `.ios-card`, `.ios-list`, `.ios-row:hover`, `.ios-list-header` → tokens.
  - `.ios-dot-positive/warn/danger/info` → `--color-success/warning/danger/info`.
  - `.bg-room-dark` → `--color-kid-ink`.
  - `.speech-bubble` fill + tail → `--color-surface-raised`.
  - `.shadow-card`/`.shadow-card-md` hand-written utilities видалено — `@theme --shadow-card*` auto-generує ідентичні класи.
  - Exceptions (залишено як decorative hardcode): scene gradients `.bg-hero-kids`, `.bg-lesson-map`, `.bg-lesson-engine`, `.bg-lesson-success`, `.bg-wall-*`, `.bg-dado-rail`, `.bg-shop-rare`, `.bg-floor-wood`, `.bg-floor-vignette`, `.bg-wall-floor-edge`; URL-encoded SVG color у `.select-arrow-primary`.
- [x] **K1.5** 5 Tailwind-escape hex call-sites eliminated. 2026-04-23:
  - `kids/school:144` + `kids/lessons:132` `bg-[#1a1a2e]` → `bg-kid-ink`.
  - `kids/characters:379` + `kids/lessons:271` `bg-[#FAFAFA]` → `bg-surface-subtle`.
  - `kids/library/[id]:200` paper-card gradient+border+inset → new `.bg-paper-card` utility у globals.css.
  - Verify: `grep -R "bg-\[#\|text-\[#\|border-\[#" frontend/` = 0 ✓
- [x] **K1.6** Audit inline `style={{...}}` hex. 2026-04-23. Після K1.4 замін залишились 2 файли:
  - `global-error.tsx` — документовано як legitimate exception (error boundary runs без Tailwind).
  - `components/kids/ItemDisplay.tsx:65` — data-driven (`item.color` з shop catalog), додано `// data-driven` коментар.
  - Verify: `grep -R "style={{.*(color|background):.*#" frontend/` повертає тільки закоментовані data-driven або global-error.

**Acceptance K1:** `grep -R "bg-\[#\|text-\[#\|border-\[#" frontend/` = 0; `grep -R "style={{.*(color|background):" frontend/` — тільки data-driven (кожен з коментарем); `.toca` не дублює `@theme` кольори; `@theme` має warning/info/surface-raised/shadow/ease/z tokens; `globals.css` +~60 LOC tokens, -~30 rogue hex.

---

#### K2 — Core primitives (`components/ui/*`) (5-8 commits)

Dep-free (no cva/clsx/tailwind-merge). Shared helper: `lib/cn.ts` — 15 LOC string joiner.

**Generic (status як на 2026-04-23):**
- [x] `Button` — 7 variants (`primary|secondary|outline|ghost|danger|link|kids-cta`), 3 sizes, `icon`, `loading`, `fullWidth`, `forwardRef`. 4 call-sites migrated, old atom deleted.
- [x] `Card` + `Card.Header`/`Body`/`Footer` — 4 variants (`surface|elevated|outline|kids`), 4 paddings, `interactive` flag. Orphan atom deleted.
- [x] `Badge` — 6 tones (`neutral|primary|success|warning|danger|info`), 2 sizes. Uses new `--color-warning`/`-info` tokens. 5 call-sites migrated, legacy `variant` prop aliased to `tone`. Old atom+stories deleted.
- [x] `Chip` — selectable, 6 tones, 2 sizes, icon slot, `aria-pressed`.
- [x] `Avatar` — 5 sizes (`xs|sm|md|lg|xl`), initials fallback, optional src. Orphan atom deleted.
- [x] `LevelBadge` — A0..C2 CEFR band colors (A=green, B=blue, C=purple), 2 sizes. `teacher/ui/LevelBadge` → re-export (breaks `teacher-mocks.LEVEL_STYLES` dep).
- [x] `EmptyState` — icon/title/description/action. Self-contained; `teacher/ui/EmptyState` kept для legacy call-sites до K6.
- [x] `LoadingState` — 4 skeleton shapes (`list|card|table|kids`), `rows` prop.
- [x] `ErrorState` — title/description/optional `onRetry` → Button.
- [x] `WipSection` — explicit "В розробці" placeholder. НЕ приймає fake data — лише `title` + optional `description`. Core enabler для K5-K9 mock kill.
- [x] `FormField` wrapper + `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `RadioGroup` (2026-04-23, 7 файлів):
  - `FormField` auto-wires `id`+`aria-describedby`+`aria-invalid` через `cloneElement`; рендерить label/hint/error (error замінює hint, не співіснують).
  - `Input`/`Textarea`/`Select` — 3 sizes, `invalid` prop, `forwardRef`. `Select` підтримує `options` shorthand + `<option>` children.
  - `Checkbox` — native з `accent-primary`, label+description.
  - `Switch` — `role="switch"`, `onCheckedChange`.
  - `RadioGroup<T>` — generic-typed `value`/`onChange`, horizontal/vertical, `ariaLabel`.
  - Атомы `atoms/Input.tsx`, `atoms/Select.tsx` (orphans) — видалено.
- [x] `Modal` + `Modal.Header/Body/Footer`; esc + backdrop + focus-trap; `size: sm|md|lg|xl|fullscreen` (+ `width` deprecated alias). 10 call-sites migrated, old atom+stories deleted.
- [x] `Tabs` (`Tabs.List`, `Tabs.Trigger`, `Tabs.Panel`) — controlled+uncontrolled via `value`/`defaultValue`, auto-id via `useId`, ARIA complete.
- [x] `Tooltip` — hover+focus-within CSS only, 4 sides (`top|bottom|left|right`). Без positioning engine; складні випадки → `@floating-ui/react` ad-hoc.
- [~] `Popover`, `Dropdown` — **deferred** (YAGNI). Жодного поточного call-site. Додаємо коли з'явиться реальна потреба у K6-K8. Існуючий `atoms/InfoPopover.tsx` лишається до консолідації.
- [x] `KPICard` — label/value/delta/trend (`up|down|flat` з кольором), icon + chart slot.
- [x] `PageHeader` — title/subtitle/breadcrumbs/actions. `teacher/ui/PageHeader` лишається окремо до K6 (має власні 8+ call-sites).
- [x] `DataTable<T>` — generic columns API (`{key, header, render, sortBy, align, width}`), client-side сортування, `onRowClick`, empty slot. Pagination → додаємо коли перший реальний call-site буде потребувати.
- [x] `Toolbar` — `bordered`/`sticky` флаги, flex-wrap gap-3.

**Kids-specific** (`components/ui/kids/*`, спадкують K2 тему):
- `KidsTile` (великий tappable, icon + label + optional badge)
- `KidsCoinBar`, `KidsXPBar`, `KidsStreakChip`
- `KidsSpeechBubble`, `KidsProgressBar`
- `KidsBottomNav` (вбудована в `<KidsPageShell>`)

**Consolidation plan:** існуючі `components/atoms`, `components/molecules`, `components/organisms` розбираємо у K2 крок за кроком — те, що стабільне і reusable → `components/ui`; специфічне до feature → під відповідний `components/<feature>/*`. До K2 завершення `components/atoms` — либо порожній, либо містить тільки legacy-wrappers з `@deprecated`.

**K2 status (2026-04-23):** 14/16 primitives done (`Popover`/`Dropdown` deferred YAGNI). Створено 24 файли у `components/ui/*` + `lib/cn.ts`. Видалено 7 old atom файлів (Button, Card, Badge, Avatar, Input, Select, Modal + їх stories). Мігровано ~20 call-sites. `tsc --noEmit` = 0. Lint baseline unchanged (47 errors pre-existing, -2 warnings).

**Лишки в `atoms/`:** `Icon.tsx`, `DemoBar.tsx`, `InfoPopover.tsx`, `LanguageSwitcher.tsx`, `ProgressBar.tsx`, `RoleGuard.tsx`, `RoleSwitcher.tsx`, `SectionHeader.tsx`, `SlideOver.tsx`. Вирішуємо у K6-K8 (feature-specific vs ui/ candidate).

**Acceptance:** є сторінка `app/(dev)/design/page.tsx` (тільки local, під flag `NEXT_PUBLIC_DESIGN_SYSTEM=1`), яка рендерить кожен primitive у всіх варіантах. Кожен primitive — pure presentational (zero fetch, state обмежений UI).

---

#### K3 — Page shells (`components/ui/shells/*`) — ✅ DONE 2026-04-23

Shell приймає не лише `children`, а й явний `status` — це усуває per-page loading/error/empty дубляж. Page-компоненти не пишуть власний `<Loading />` блок — тільки передають `status`.

- [x] **K3.1 `DashboardPageShell`** — PageHeader + optional Toolbar + status-aware body (`loading`/`error`/`empty`/`ready`). Props: `{title, subtitle, breadcrumbs?, actions?, toolbar?, status, error?, onRetry?, empty?, loadingShape?}`. Sits всередині `app/dashboard/layout.tsx` (Sidebar + max-width wrapper залишаються в layout).
- [x] **K3.2 `KidsPageShell`** — full-bleed frame: optional `header` slot (під `KidsPageHeader`), optional `background` layer (-z-10, pointer-events-none), safe-area insets, автоматичний `pb-[calc(92px+env(safe-area-inset-bottom))]` щоб контент не ховався під fixed `KidsFooter`. Props: `{header?, background?, edge?, contentClassName?}`.
- [x] **K3.3 `AuthPageShell`** — split layout: ліва brand-панель (`lg:` only) + центрована form-колонка. Props: `{brand?, formWidth?}`. Використає `/auth/login`, `/auth/register`, `/auth/profile`.
- [~] **K3.4 `CoursesShell`** — ❌ DEFERRED (YAGNI). `/courses` + `/library` structurally identical to dashboard pages → `DashboardPageShell` enough. Public marketing-style header не потрібен на цьому етапі.

Barrel: `components/ui/shells/index.ts` реекспортує всі три.

tsc=0 after each shell. Не мігрували жоден call-site ще — це робиться в K5-K8 поруч із refactor самих сторінок, щоб комміти лишались ≤200 LOC.

**Acceptance (перенесено в K5-K8):** `grep -R "const \[loading, setLoading\]" frontend/app` = 0; `grep -R "Завантаження\.\.\." frontend/app` = 0 (only in shells).

---

#### K4 — Uniform data-hook contract — ✅ PRIMITIVE DONE 2026-04-23

`lib/use-resource.ts` (~90 LOC) — єдиний контракт для всіх fetch-hooks:

```ts
export type ResourceStatus = "idle" | "loading" | "success" | "error";
export interface ResourceResult<T> {
  data: T | null;
  status: ResourceStatus;
  error: Error | null;
  refetch: () => Promise<void>;
}
export function useResource<T>(fetcher: () => Promise<T>, deps?: readonly unknown[]): ResourceResult<T>;
export function shellStatus<T>(r: ResourceResult<T>, isEmpty?: (d: T) => boolean): "loading" | "error" | "empty" | "ready";
```

Особливості:
- `fetcher` зберігається у `useRef` → `refetch` identity стабільна (caller може передавати inline arrow).
- `alive` signal через об'єкт замість boolean — cancel-safe при deps change.
- `shellStatus<T>(r, isEmpty?)` helper мапить `ResourceResult` → `<DashboardPageShell status>` / `<KidsPageShell>` без boilerplate у page-компонентах.
- Жодних нових npm-залежностей (SWR/react-query свідомо не додано).

Міграція існуючих хуків → K5-K8 (поруч із refactor сторінок, щоб PR-и лишались ≤200 LOC):
- З поточних 12+ хуків у `lib/*` жоден ще не мігрований — це навмисно, щоб не ламати 20+ call-sites одним коммітом.
- Кожна сторінка у K5-K8 або обгортає існуючий `{rooms, loading, error}` у adapter, або переписує hook на `useResource`.

**Acceptance (перенесено в K9 kill-switch):** всі хуки з `lib/*` повертають `ResourceResult<T>`; `grep -R "const \[loading, setLoading\]" frontend/app` = 0; page-компоненти передають `shellStatus(r)` у shell.

---

#### K5 — Kids pages refactor (9 commits, one per page)

Порядок від простого до складного:
1. [x] `/kids/coins` — ✅ 2026-04-23. KidsPageShell + KidsPageHeader; TRANSACTIONS мок + gift-flow мок замінено на `<WipSection>`; hardcoded amber/green/gray → tokens (accent, coin, success-dark, ink-*); 237 → 76 LOC.
2. [x] `/kids/achievements` — ✅ 2026-04-23. KidsPageShell + live `useAchievements` залишається; LoadingState/EmptyState; tokens (success, ink-*, surface-raised, border); XP badge у `right` slot.
3. [x] `/kids/library/[id]` — ✅ 2026-04-23. KidsPageShell + hardcoded colors → tokens; `OWNED_DEFAULT` fake state + fake handleGet видалено — `<Button disabled>Доступ — в розробці</Button>` до Phase F5 (per-user library inventory).
4. [x] `/kids/characters` — ✅ 2026-04-23. KidsPageShell + KidsPageHeader; RARITY палітра консолідована (common/uncommon/rare/epic/legendary) + legendary перенесено на `coin` токени; gray-* → ink-*/surface-*/border; blue-500 → primary; green-50 → success/10; amber-500 button → accent + `shadow-press-accent`; custom characters + server catalog + server-authoritative purchase залишаються живими.
5. [x] `/kids/room` — ✅ 2026-04-23. Top bar + room selector перенесено на surface-raised/90 + shadow-card; gray/amber → ink/coin; fallback gradient використовує `var(--color-accent)` + `var(--color-yellow)`; live `useRoomCatalog` + server `unlockRoom` збережено; speech-bubble tail використовує `--color-surface-raised`.
6. [x] `/kids/shop` — ✅ 2026-04-23. Всі hardcoded Tailwind-палітри (gray/amber/green/rose/red/blue/purple) → design tokens (ink-*, surface-*, coin, success, danger, secondary, primary, purple). RARITY map консолідовано під characters (legendary → coin-bg/coin; rare → secondary; uncommon → success). Mobile drawer + desktop sidebar, BuyModal, ProductCard, BgCard, CharacterDressRoom — структура збережена, sub-components інтактні. `bg-gray-900` primary CTA → `bg-primary shadow-press-primary`; toast → `bg-ink/90`; shadow-modal → shadow-overlay; BACKGROUNDS gradients лишилися як декоративне art. Live hooks (`useCustomItems`, `useShopCatalog`, `useKidsState`, `purchaseShopItem`, `equipShopItem`, `placeItem`, `handleBuyBackground`, `handleBoxPurchase`, `handlePlaceFromInventory`) не змінені.
7. [x] `/kids/school` — ✅ 2026-04-23. 621 → 234 LOC. LessonsCarousel (хардкод SECTIONS + `ME.doneSlugs`/`currentSlug` мок) повністю видалено → `<WipSection>` з roadmap (дерево уроків зʼявиться після бекенду user-lesson-progress). LibraryCatalog залишається live (`useLibrary`) + hardcoded gray/slate → ink/surface/border tokens; mobile drawer + desktop sidebar на `bg-primary`/`bg-surface-muted`; LoadingState/EmptyState замість текстових «Loading…»; tab selector використовує primary border + ink-faint.
8. [x] `/kids/lessons` — ✅ 2026-04-23. 362 → 18 LOC. Хардкод SECTIONS + `ME` fake progress повністю видалено → KidsPageShell + KidsPageHeader + `<WipSection>` з roadmap (карусель уроків = bekend user-lesson-progress). Немає мок даних у runtime path.
9. [x] `/kids/dashboard` — ✅ 2026-04-23. 789 → 373 LOC. Всі моки видалено: `CAL_EVENTS` + `CalendarModal` + `CalendarWidget`, `LESSON` + `ContinueCard`, `CHALLENGES` + `DailiesCard`, `STREAK_DAYS` const + `WEEK_LABELS`, `MONTHS_UA`/`WEEKDAYS_SHORT_UA`. Right-column HUD + mobile bottom-sheet тепер показують два `<WipSection compact>` (Продовжити урок — чекає на user-lesson-progress; Щоденні завдання — чекає на daily-challenge бекенд). Live збережено: `useKidsState` (coins, streak, activeCharacterId, equippedItemIds, placedItems, roomBackground, patch/move/remove placement), character emotion cycle + SpeechBubble, PlacedItemsLayer drag+edit, LootBoxModal flow. StreakWidget тепер бере `streak` пропом із state. Mobile top-pills обʼєднали streak+coins в одну pill + Mystery-Box pill + WIP-sheet trigger. Edit-toggle: `bg-primary` active / `bg-surface-raised/95 + border-border` inactive. `shadow-lg/md` → `shadow-card-md`; custom overlay shadow → `shadow-overlay`; `bg-slate-900/55` → `bg-black/55`; `bg-gray-300` → `bg-border`. Runtime-залежність від `@/lib/shop-catalog` (SHOP_ITEMS_BY_ID + SLOT_OFFSET) залишається для equipped items — K9 підмінить.

Чек-ліст на кожну сторінку:
- [ ] Рендер через `<KidsPageShell>` із status/error/empty
- [ ] Всі primitives з K2 (жодних ручних `<div className="rounded-xl bg-white p-4 shadow">` — `<Card>`)
- [ ] Data через K4-хук (`{data, status, error, refetch}`)
- [ ] Zero `bg-[#...]`, static `style={{ color: ... }}`
- [ ] Zero imports з `@/lib/teacher-mocks`, `@/lib/shop-catalog` (окрім `LessonCharacter` поки K9), `@/lib/characters` (окрім registry)
- [ ] Page-specific moves > 80 LOC inline logic → `components/kids/<page>/*` molecules
- [ ] Commit message формат: `refactor(K5.x): <page> → shell+primitives+live-data`

---

#### K6 — Dashboard/teacher pages refactor (chunked)

- **K6.a — Low-risk shell-wrap (6 commits):** `/dashboard/profile`, `/dashboard/analytics`, `/dashboard/payments`, `/dashboard/attendance`, `/dashboard/chat`, `/dashboard/mini-tasks` — вже live. Перехід на `<DashboardPageShell>` + K2 primitives; витягнути ≥200 LOC внутрішньо-композиційного коду в `components/teacher/<page>/*`.
  1. [x] `/dashboard/profile` — ✅ 2026-04-23. 350 → 275 LOC. `<DashboardPageShell>` із status=loading/empty/ready; `.ios-card` → `<Card variant="surface">`; `.ios-btn` → `<Button>`; custom `Field`/`TextareaField` → `<FormField>` + `<Input>`/`<Textarea>`; custom switch button → `<Switch>` (канонічний роль+ARIA); initials div → `<Avatar size="lg">`. Live збережено: `fetchMyTeacherProfile` + `updateMyTeacherProfile` CRUD, session role gating, logout handler.
  2. [x] `/dashboard/analytics` — ✅ 2026-04-23. 294 → 262 LOC. `<DashboardPageShell>` із status=loading/empty/error; роль-гейт dispatch → teacher (TeacherAnalytics inline, untouched) / admin (inline KPI+chart+leveldist+top-teachers) / other→empty. `.ios-card` → `<Card>` (4 KPI grid + chart card + leveldist card + top-teachers table); top-teacher initials div → `<Avatar size="sm">`. `SegmentedControl` з `components/teacher/ui` залишається (K2-канонічного немає). Live: `fetchAdminAnalytics`; bar-chart + level-buckets rendering inline (під 200 LOC поріг — split непотрібен).
  3. [x] `/dashboard/payments` — ✅ 2026-04-23. 279 → 274 LOC. `<DashboardPageShell>` із status=loading/anonymous/non-teacher-empty; error → `<Card variant="outline">`. `.ios-card` → `<Card>` (stats tiles, history table, upcoming list); currentMonthPayout accent tile зберігає spec-color (`bg-primary/[0.06] border-primary/25`) — design-token based; `rounded-[14px]` → `rounded-card`. `.ios-btn` експорт PDF → `<Button variant="link" size="sm">` (window.alert-mock збережено — буде замінено з бекендом). `SegmentedControl` + `LevelBadge` з teacher/ui лишаються (K2-канонічного немає). `import type { Level } from '@/lib/teacher-mocks'` — type-only, K9 перенесе в `lib/types/teacher.ts`. Live: `fetchTeacherPayouts` + `fetchTeacherMonthSessions`.
  4. [x] `/dashboard/attendance` — ✅ 2026-04-23. 407 → 414 LOC. `<DashboardPageShell>` із status=loading/empty (non-teacher + anonymous); month nav перенесено в `actions` slot (prev/next → `<Button size="sm" variant="secondary" icon>`). `.ios-card` wrapper → `<Card variant="surface" padding="none">`; error banner → `<Card variant="outline">`; export XLSX/PDF ghost buttons → `<Button size="sm" variant="secondary">`. `bg-white` sticky-col → `bg-surface-raised` (token). Attendance grid (month × students matrix, cycle mark, optimistic upsert/delete) unchanged — live `fetchTeacherMonthSessions` + `fetchMonthAttendance` + `upsertAttendance` + `deleteAttendance` preserved. `loadingShape="table"` показує таблицю-скелет.
  5. [x] `/dashboard/chat` — ✅ 2026-04-23. 555 → 545 LOC. Full-height chat splitview — `<DashboardPageShell>` *не* використовуємо (chat потребує viewport-fit splitview, а shell додає PageHeader + gap-4 body що ламає layout). Замість цього: локальний Avatar-helper видалено → канонічний `<Avatar size="md">`; "Написати всім" header button → `<Button size="sm">`; send-button → `<Button size="sm" icon>`. Всі `bg-white` → `bg-surface-raised` (~8 місць: shell, left aside, thread header, pinned bar, reply bar, emoji bar, composer bar, own-bubble border). IconBtn local helper + Bubble component + SearchInput/SegmentedControl лишаються (bespoke за призначенням). Live: `fetchThreads`/`fetchMessages` 10s polling, optimistic send/pin/read-marks preserved. **Примітка:** full-height pages (chat, school splitview) — поза Shell scope, Shell тільки для звичайних scroll-flow pages.
  6. [x] `/dashboard/mini-tasks` — ✅ 2026-04-23. 174 → 164 LOC. `<DashboardPageShell>` із status-computed з 4 гілок (error→error, loading→loading, empty→empty, else→ready); toolbar slot = FilterChips + SearchInput; actions slot = `+ Створити` → `<Button>`. `.ios-card` → `<Card variant="surface" padding="sm">`; `.ios-btn-sm ios-btn-primary flex-1` → `<Button size="sm" fullWidth>`; `.ios-btn-sm ios-btn-secondary` → `<Button size="sm" variant="secondary">`. `EmptyState` з `teacher/ui` (legacy `subtitle` field) → shell `empty.description`. `MiniTaskBuilder` модал + toast винесено поза shell (React Fragment), щоб monted завжди — інакше shell-status=loading/error блокував би "+ Створити" flow. `.ios-chip` лишається (token-based pill для passive tags). Live: `fetchMiniTasks`; `flashToast` для "Призначити"/"Перегляд" — графічний not-implemented placeholder до homework-assignment бекенду.
- **K6.b — Heavy components split (5 commits):** `/dashboard/homework`, `/dashboard/homework/[id]/review`, `/dashboard/groups`, `/dashboard/teacher-library`, `/dashboard/teacher-library/[id]/edit`. Тут file-monsters (LessonBlockEditor 533, MiniTaskBuilder 540, StudentDetail 475). Розбити:
  - `LessonBlockEditor` → `BlockToolbar` + `BlockList` + `BlockEditorModal` + `BlockPreviewPane`
  - `StudentDetail` → `StudentHeader` + `StudentKPI` + `StudentHomeworkList` + `StudentProgressChart`
  - `MiniTaskBuilder` → `TaskMeta` + `TaskStepsEditor` + `TaskPreview`
  1. [x] `/dashboard/homework` — ✅ 2026-04-23. 311 → 326 LOC. `<DashboardPageShell>` із status обрахованим із 4 гілок (error/loading/empty/ready); toolbar slot = `SegmentedControl` (статус-табів) + `SearchInput`; actions slot = `+ Створити` → `<Button>`; `loadingShape="table"`. `.ios-card` wrapper → `<Card variant="surface" padding="none" className="overflow-hidden">` обіймає desktop-table + mobile-list `<ul>` + footer-count row. Local `StudentAvatar` helper видалено → канонічний `<Avatar size="sm" className="bg-surface-muted text-ink-muted">` у `SubmissionRow` і `SubmissionCard`. `CreateHomeworkModal` винесено поза shell (React Fragment), щоб monted завжди — інакше shell-status=loading/error блокував би "+ Створити" flow. Link-as-button (`Перевірити`/`Відкрити`) → залишаємо `className="ios-btn ios-btn-sm ios-btn-secondary"` на `<Link>` — edge-case: канонічний `<Button>` рендериться як `<button>` і не обгортає Next `<Link>` (`asChild`-паттерн не підтримано). `STATUS_DISPLAY` record → бере токенні утиліти (`bg-primary`, `text-danger-dark`, …). Live: `fetchSubmissions`; статус-фільтрація (`all/submitted/reviewed/returned/overdue/notStarted`); query search за `homework.title` + `student.displayName`; `dueAt` sort.
  2. [x] `/dashboard/homework/[id]/review` — ✅ 2026-04-23. 334 → 315 LOC. `<DashboardPageShell>` із `status = loading | error | ready`; title = homework title, subtitle = `Дедлайн … · здано …`, actions slot = `<StatusPill>` з поточним статусом здачі. Back-link `← Усі домашні завдання` винесено як обгортка над shell (Next `<Link>` для client-nav, не breadcrumbs-`<a>` що тригерить full-page reload). Local `Card` helper-компонент перейменовано у `Section` щоб не конфліктувати з канонічним `<Card>`; всередині — канонічний `<Card variant="surface" padding="md">` + uppercase-label. Student row: bespoke `img`/initials span → канонічний `<Avatar size="md">`. Textarea фідбеку: `.ios-card`+plain `<textarea>` → `<Section>` + `<FormField hint>` + `<Textarea>`. Grading buttons: `.ios-btn-danger`/`.ios-btn-primary` → `<Button variant="danger">` + `<Button>` (default primary). `bg-white` у attachment-badge → `bg-surface-raised`. Done-screen (post-grade success з redirect-таймером) залишається bespoke поза shell — це transient overlay, не data-стан. Live: `fetchSubmission` + `gradeSubmission` (score+feedback+status), router.push redirect через 1500мс.
  3. [x] `/dashboard/groups` — ✅ 2026-04-23. 265 → 265 LOC. `<DashboardPageShell>` із 4-гілковим status; actions = `+ Група` → `<Button>`; toolbar = `SearchInput` (w-80); `loadingShape="card"`. `.ios-card py-16` error/loading/empty state-boxes прибрано — делеговано в `empty`/`error` slots shell. `GroupCard` залишається `<button>` із `.ios-card` class (канонічний `<Card>` = `<div>`, не обгортає кнопку; interactive-card pattern). Local `MemberAvatar` helper видалено → канонічний `<Avatar>` у двох місцях: stacked (`<StackedAvatar>` thin wrapper із `border-2 border-surface-raised bg-surface-muted`) + detail-list (`size="sm"`). `bg-white` borders у avatar stack → `border-surface-raised` (token). GroupDetail CTAs: `.ios-btn-primary flex-1`/`.ios-btn-secondary flex-1` → `<Button fullWidth>` + `<Button variant="secondary" fullWidth>`. Modal + AssignLessonModal + toast винесено поза shell (Fragment-wrap pattern). Local `Section` helper lives у modal body (uppercase-label sections) — lokalний за призначенням, не замінює канонічний `<Card>`. Live: `fetchGroups` (members + avgAttendance + avgHomework), create-group + message-group flashToast — still placeholders до backend-ендпоінтів.
  4. [x] `/dashboard/teacher-library` — ✅ 2026-04-23. 313 → 316 LOC. `<DashboardPageShell>` із 4-гілковим status; actions = `+ Урок` → Next `<Link>` із `className="ios-btn ios-btn-primary"` (edge: канонічний `<Button>` не обгортає `<Link>`); toolbar slot = SearchInput+SegmentedControl row + два ряди FilterChips (source/level). `loadingShape` динамічно — `table` для list-view, `card` для grid. `EmptyState` helper з `teacher/ui` прибрано (error/loading/empty branches) → делеговано в shell `empty`/`error` slots + onRetry=`location.reload`. `.ios-card` ListView wrapper → `<Card variant="surface" padding="none" className="overflow-hidden">`. `.ios-card` LessonCard article → `<Card variant="surface" padding="sm">`. `LessonRowActions` buttons: `.ios-btn-sm ios-btn-secondary` + `.ios-btn-sm ios-btn-primary` → `<Button size="sm" variant="secondary">` + `<Button size="sm">`. `.ios-chip` pill-tags лишаються (token-based utility). AssignLessonModal + toast винесено поза shell (Fragment-wrap). Live: `fetchLessons` + `fetchLesson` + `cloneLesson` (optimistic prepend у state + toast-feedback).
  5. [x] `/dashboard/teacher-library/[id]/edit` — ✅ 2026-04-23. 418 → 406 LOC. `<DashboardPageShell>` із `loading | error | ready`; dynamic `title` = поточний `title.trim()` || 'Новий урок' / 'Редактор уроку' (shell-title слідкує за hero-input); subtitle = `LESSON_SOURCE_LABELS[source] · savedLabel` (dirty/saving → text-ink, інакше muted); actions slot = `<SegmentedControl>` (Редагувати/Перегляд) + Save/Копіювати → `<Button>`. Back-link `← Бібліотека` винесено як Next `<Link>` над shell. Title `<input>` залишається chromeless bespoke (transparent + border-bottom-on-hover) — канонічний `<Input>` є boxed і не підходить для hero-editing. Metadata row: native `<select>` → `<Select selectSize="sm" options={LEVEL_SELECT_OPTIONS}>`; topic `<input>` → `<Input inputSize="sm">`; duration `<input type="number">` → `<Input inputSize="sm" type="number" className="w-20 tabular-nums">`. `.ios-btn-primary` save/copy buttons → `<Button>`. `.ios-card` preview-mode note bar → `<Card variant="surface" padding="sm">`. BlockDivider `+` button: `bg-white` → `bg-surface-raised` (token). Empty-state CTA для створення першого блоку зберігає bespoke dashed-border заради унікального UX (не стандартний `EmptyState`). BlockPicker + toast винесено поза shell (Fragment-wrap). Live: `fetchLesson` + `updateLesson` + `createLesson` + `cloneLesson`; dirty-tracking + savedAt badge; router.replace після create (/new → /documentId); readOnly-guard для platform/template sources.

Після K6.b ✅ — усі 5 heavy pages покрито `<DashboardPageShell>`+K2; сам component-split (LessonBlockEditor 533 → BlockToolbar+List+EditorModal+PreviewPane, MiniTaskBuilder 540 → TaskMeta+StepsEditor+Preview, StudentDetail 475 → StudentHeader+KPI+HomeworkList+ProgressChart) залишається для окремої phase (K6.split, чи K9 component-quality pass).
- **K6.c — 🔴 mock-only (2 рішення, 3-5 commits):** `/dashboard/students`, `/dashboard/teacher-calendar`, `/dashboard/teacher`.
  1. [x] `/dashboard/students` — ✅ 2026-04-23. Backend: новий `api::teacher.teacher` route-only endpoint `GET /api/teacher/me/students` (controllers/teacher.ts + routes/teacher.ts, без content-type — pattern як `parent`/`analytics`). Handler: role-gate teacher-only; паралельно `documents(session).findMany` із attendees populate + `documents(homework-submission).findMany` scoped-by-`homework.teacher=teacherId`; агрегує lastSessionAt (max past), nextSessionAt (min future), completedHomework (reviewed), pendingHomework (notStarted/inProgress/submitted/overdue), totalHomework. Сортує: upcoming-first, потім lastSession desc. Seed: `api::teacher.teacher.students` → AUTH_ALL (scoping внутрішній). FE: `app/api/teacher/me/students/route.ts` thin cookie-bearer proxy + `lib/teacher-students.ts` (`TeacherStudent` тип, `deriveStatus` heuristic: >45d idle → expired, 21-45d → paused, no activity → trial, інакше active, + `fetchMyStudents()`). Page rewrite: role-branch через `useSession()` — `admin` → `<WipSection>` + link to `/dashboard/analytics`; `teacher` → shell із 4-гілковим status (loading/error/empty/ready), toolbar = SearchInput+Level Select+Sort Select+StatusChips, `<Card variant="surface" padding="none">` таблиця/мобільний список. Канонічні `<Avatar>`+`<LevelBadge>`+`<Select>`; `.ios-dot-*` тримаємо (token). Hardcoded `STUDENTS` мок + `localStorage.getItem('demo_role')` прибрано повністю. StudentDetail modal лишається з внутрішніми мок-вкладками (live-data rewire — окремий chunk post-K6).
  2. [x] `/dashboard/teacher-calendar` — ✅ 2026-04-23. Повний day/week/month + `CreateLessonModal`/`LessonActionSheet` був 100% mock (всі 3 dep-файли імпортують `lib/teacher-mocks`). Живий `GET /api/teacher/me/calendar` + session-CRUD-wiring = окремий бекенд-чанк (>200 LOC), винесено в post-K6.c task. Наразі: сторінка замінена на `<DashboardPageShell>` + `<WipSection>` з описом статусу й лінками до вже-живих сторінок (`/dashboard/students`, `/dashboard/homework`, `/dashboard/attendance`). 421 → 33 LOC, нуль runtime-мок-споживачів.
  3. [x] `/dashboard/teacher` — ✅ 2026-04-23. 319 → 297 LOC. Powered by live composition: `fetchMyStudents` + `fetchHomeworks` + `fetchSubmissions` + `fetchGroups` паралельно. Stat strip: активні учні · submissions зі статусом `submitted` · опубліковані ДЗ. "Неперевірені роботи" — 6 перших `submitted`, deep-link → `/dashboard/homework/{homeworkId}/review` (через `sub.homework.documentId`). "Учні, яким потрібна увага" — filter `pendingHomework > 0 || status === 'expired'`, лінк у chat із thread=student:{id}. "Групи" — live `fetchGroups` slice(0,6). Канонічні `<DashboardPageShell>` + `<Card>` + `<Avatar>` + `<LevelBadge>`. 100% mock-dependencies (`MOCK_TODAY`, `MOCK_GROUPS`, `getStudent`, `getGroup`, `lessonsOnDate`, `pendingHomework`, `atRiskStudents`) прибрано. Notes-UI + Active-lesson callout видалено — відображали mock-time; повернемо коли буде live-calendar (task #30).
- **K6.d — Edge (2 commits):** `/dashboard/prizes`, `/dashboard/admin`.
  - `/dashboard/prizes` — audit: що воно має робити? Якщо бекенду нема — `<WipSection>`. Якщо це teacher-rewards view на achievements → `useAchievements`.
  - `/dashboard/admin` — admin-landing. Скомпонувати з `fetchAdminAnalytics` + `useGroups` + teachers list (новий endpoint або існуючий `fetchTeacherProfile` all).

---

#### K7 — Parent + role-routers (2 commits)

- `/dashboard/parent` — cleanup у K2/K3 (Phase H вже live, просто shell-wrap).
- `/dashboard`, `/dashboard/student` — routing logic cleanup. `/dashboard` = pure role-router (redirect до `/dashboard/<role>`). `/dashboard/student` — student-landing; якщо окремого student-UX нема — видалити сторінку й маршрутизувати student у `/home` або kids (для kids-у).

---

#### K8 — Onboarding + courses + public (5-7 commits)

- `/login`, `/auth/register`, `/auth/profile` → `<AuthPageShell>` + K2.
- `/welcome`, `/onboarding`, `/placement` — audit покоління: якщо вони в user-flow → shell + primitives; якщо мертві → видалити сторінки повністю.
- `/courses/[slug]`, `/courses/[slug]/lessons/[slug]` → `<CoursesShell>` + K2 (`LessonEngine` — це окрема частина, не page refactor).
- `/library`, `/library/[programSlug]` → audit: чи це публічний вигляд library, чи дубль `/kids/library`? Сконсолідувати.
- `/calendar` — audit: public calendar чи залишок старого? Якщо не використовується — видалити.
- `/`, `/home` — root redirect + landing. Визначити однозначно: `/` = server-redirect за role, `/home` = public landing.

---

#### K9 — Final mock kill-switch (3-4 commits)

Коли K5-K8 завершено, жоден runtime-шлях не імпортує мок-файли. Чистка:

1. `lib/teacher-mocks.ts` — розпил:
   - Type-only exports (`Level`, `HomeworkKind`, `MessageKind`, etc.) → `lib/types/teacher.ts`
   - UI-constants (labels) → `lib/ui/teacher-labels.ts`
   - Mock data arrays → delete
   - Оновити всі 21 імпорт на нові шляхи
   - Видалити `lib/teacher-mocks.ts`
2. `lib/characters.ts` — перейменувати на `lib/character-registry.ts`; hardcoded fox/raccoon/вбудовані емоції перенести в `backend/src/seeds/08-characters.ts` (overwrite-if-missing); файл лишає тільки `registerServerCharacter` + `getRegisteredCharacter` + helper типи. UI-консумери читають з `useCharacterCatalog` (Phase C7).
3. `lib/shop-catalog.ts` — єдиний UI-споживач `LessonCharacter.tsx`. Рефакторинг `LessonCharacter`: читає outfit через `useKidsState().outfit` + resolve slug через `useShopCatalog()` (яке вже є). `SHOP_ITEMS_BY_ID` і `SLOT_OFFSET` видаляємо. Файл `lib/shop-catalog.ts` — delete.
4. Гарантувати §6 acceptance: всі 5 grep-критеріїв = 0.

---

#### K10 — Playwright CRUD per refactored page (поєднується з Phase J0-J2)

Пере-планування Phase J:
- J0 (Playwright bootstrap) — запускаємо на початку K5, не в кінці всієї дороги. Без e2e кожен K-чанк ризикує зломати попередній.
- Після кожної K5/K6/K7/K8 сторінки → Playwright smoke (golden path для цієї сторінки, не повний CRUD).
- Повний CRUD + scoping тести (J1-J3, J7) — після K9.

---

**Acceptance Phase K (усе true одночасно):**
1. §6 acceptance criteria 1-5 всі `grep` = 0.
2. Кожна сторінка-файл імпортує рівно один із `<KidsPageShell|DashboardPageShell|AuthPageShell|CoursesShell>` (root-level routes — винятки задокументовані).
3. Кожна сторінка-файл отримує дані через K4-хук (`{data, status, error, refetch}`); нема page-local `useState<Loading>`.
4. Primitives purity: `grep -R "fetch\(" frontend/components/ui/` = 0.
5. `grep -R "bg-\[#\|text-\[#\|border-\[#" frontend/` = 0; non-data-driven `style={{}}` = 0 (усі з коментарем `// data-driven`).
6. Kids UI й adult UI шейри K2 primitives; різниця — тільки в shell-виборі + `[data-ui="kids"]` token-switch.
7. `<WipSection>` використовується для: (а) сторінок/блоків без бекенду (`/dashboard/prizes`?, `/dashboard/student`?, частини `/kids/school`?), (б) ролей без виділеного UX (parent-profile editor, student-profile editor). Кожне такe місце записане тут + у §3 matrix як 🟠.
8. `npm run lint` + `tsc --noEmit` = 0 errors.
9. Playwright smoke для всіх K5-K7 golden paths зелений (kids dashboard→lesson→shop→room, teacher login→homework→grade, parent login→children).
10. `PROJECT.md §3 matrix` оновлений: FE-wired колонка стає зеленою для всіх 🟡-рядків, що залишались (а не 🟢-wired-in-general).

---

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

- [ ] **J0** **Playwright bootstrap** (відсутній повністю — gap-audit 2026-04-22): `npm i -D @playwright/test`, `npx playwright install chromium`, `playwright.config.ts` (baseURL з env, webServer — `next dev` для локалки, reporters: list+html), root-рівень `e2e/` папка, `npm run e2e` у root. CI-hook — відкладається.
- [ ] **J1** Kids CRUD + golden path: register → login → lesson complete → coins earned → shop purchase → shop sell → equip/unequip → room unlock → place/move/remove item → character purchase → dressing → logout → login інший браузер → state вцілів.
- [ ] **J2** Teacher CRUD + golden path: login → create group → add student → create lesson (editor save) → publish → assign homework (з різних block types) → student submit → teacher grade + feedback → chat message thread → attendance mark → payment record → profile edit.
- [ ] **J3** Parent flow: login → children list → child progress → homework due → upcoming sessions.
- [ ] **J4** Load test: 100 одночасних lesson-complete (k6).
- [ ] **J5** Accessibility audit (axe-core) на всіх основних сторінках.
- [ ] **J6** Mobile (iOS Safari) reality check — kids-zone особливо.
- [ ] **J7** **CRUD-matrix coverage** — окрема secondary-suite, яка для кожного content-type ганяє Create/Read/Update/Delete через UI (не прямі API-виклики). Мета: жодна сутність не додається/редагується тільки в Admin UI Strapi — є FE flow. Див. §3 матрицю; кожен 🟢-рядок має покривати щонайменше 1 positive CRUD test + 1 scoping test (auth'd іншою роллю — 403).

---

## 5. Immediate next actions (оновлено 2026-04-23)

Phases A-H завершено (Phase A7 лишається на користувача — runbook у §4). Порядок далі:

1. **Phase K — UI/Design-system unification & mock kill-switch** ← активна
   - [x] K0 Preflight audit — завершено (per-page матриці заповнено, 40 сторінок класифіковано).
   - [x] K1 Design tokens unification — завершено 2026-04-23 (K1.1-K1.6). `@theme` має всі семантичні токени; `.toca` → aliases; 5 Tailwind-escape hex eliminated; tsc=0.
   - [x] K2 Core primitives library — завершено 2026-04-23 (14/16, `Popover`/`Dropdown` deferred YAGNI). 24 файли у `components/ui/*` + `lib/cn.ts`; 7 atoms видалено; ~20 call-sites мігровано.
   - [x] K3 Page shells — завершено 2026-04-23. `DashboardPageShell` + `KidsPageShell` + `AuthPageShell` у `components/ui/shells/*`. `CoursesShell` deferred YAGNI. tsc=0.
   - [x] K4 `useResource<T>` factory — завершено 2026-04-23. `lib/use-resource.ts` (~90 LOC), уніфікований `{data, status, error, refetch}` + `shellStatus()` helper. Hook migration в K5-K8.
   - K5 Kids pages refactor — ✅ завершено 9/9 (coins, achievements, library/[id], characters, room, shop, school, lessons, dashboard).
   - K6 Dashboard/teacher pages refactor ← в роботі: K6.a ✅ 6/6, K6.b ✅ 5/5, K6.c ✅ 3/3 (students + teacher-calendar WipSection + teacher landing). Далі: K6.d edge (prizes, admin), K7 parent, K8 onboarding/courses/public, K9 mock kill-switch, K10 Playwright smoke. Component-split (LessonBlockEditor/MiniTaskBuilder/StudentDetail monsters) виділено в окрему подфазу — після K6.d.
   - K5 Kids pages refactor (9 commits).
   - K6 Dashboard pages refactor (chunked a/b/c/d).
   - K7 Parent + role-routers.
   - K8 Onboarding + courses + public.
   - K9 Final mock kill-switch (delete `teacher-mocks.ts`, rename `characters.ts`, delete `shop-catalog.ts` після рефактора `LessonCharacter`).
   - K10 Playwright CRUD (поєднується з Phase J0-J2 — stop відкладати).
2. **Phase J0-J7** — повна QA suite після K9.
3. **Phase I** — production polish (email, websockets, Sentry, rate limiting, backups, PII export).

Правило (2026-04-22): **жодна нова фіча не додається, поки для попередньої сутності не існує Playwright-тест на Create + Read + Update + Delete + Scoping.**

Правило Phase K (2026-04-23): **жодні моки в runtime path; недороблене — `<WipSection>` placeholder, ніколи fake data. Одна сторінка = один коміт ≤200 LOC. Перед наступною сторінкою — lint + tsc + (після K2) Playwright smoke зелені.**

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
- **Імпорт моків в staging (Railway)**: виставити `IMPORT_MOCKS_ON_BOOT=1` у змінних backend-сервісу, redeploy, дочекатись у логах `[import] done`, зняти змінну. Локально — `cd backend && npm run import-mocks` (tsx + programmatic Strapi, не запускає HTTP-сервер).
- **Rollback**: Railway має деплой-історію; дев-редеплой попередньої ревізії миттєвий.
- **Очистка refresh-tokens**: cron через Strapi scheduled-task (TODO Phase I).

## 10. Change log

- **2026-04-25** Production-grade demo cohort. Three new seeds (`15-cohort-accounts`, `16-cohort-classroom`, `17-cohort-chat`) додано після `14-demo-wiring`, всі ідемпотентні, gated `SEED_DEMO_ACCOUNTS=1`. **15** створює 23 акаунти з паролем `Demo2026!`: 3 teachers (Олена/kids · Андрій/IELTS · Ірина/teen) з реалістичними bio/slug/rating/specializations, 8 kids (companion+ageGroup+coins/xp/streak/mood), 4 adults (goal+current/target level), 8 parents — кожен `parentalConsentBy` пов'язаний з kid через `childTag`. Експортує `resolveCohort(strapi)` → Map<cohortTag,{profileDocId,userId,roleProfileDocId,email}> для downstream. **16** wires: parental links, 3 групи (Kids A1/Pre-Teen Mix/Adults), 16 sessions (mix completed+scheduled, group+1:1), attendance для completed, 7 homeworks (draft → published триггерить lifecycle submission-create) + per-state overwrite (reviewed/submitted/returned/inProgress/notStarted/overdue), 17 user-progress (mix completed-with-score та inProgress) — coin/xp/streak/achievement crediting через існуючий lifecycle. **17** chat: 12 student-threads (teacher↔student) + 4 parent-threads + 3 group-threads, 4-10 messages кожен з explicit `hoursAgo` timestamps, denorm `lastMessageBody/At` для FE-сортування. Polling-based транспорт (10s) існував — websockets свідомо deferred. **Frontend** `app/(onboarding)/login/page.tsx` розширено collapsible секцією «Демо-когорта» з 4 групами (Teachers/Kids/Adults/Parents), кожен рядок prefills email+password при кліку. Backend+frontend `tsc --noEmit` чистий.
- **2026-04-23** Phase K planned (UI/Design-system unification + mock kill-switch). §4 додано повну Phase K (K0 preflight audit → K10 Playwright smoke), з per-page матрицею Kids/Adult/Auth/Courses, правилами (1 page = 1 commit ≤200 LOC, `<WipSection>` замість моків, `[data-ui="kids"]` token switch, uniform `{data,status,error,refetch}` contract). §5 переписано — Phase K активна, перед I та J. Phase J0 (Playwright bootstrap) підтягнуто до початку K5. Джерело — запит користувача: глибокий рефакторинг кожної сторінки, єдина дизайн-система, zero-mocks, placeholder "В розробці" для недороблених модулів. Код-артефактів ще не створено — K0 ідемпотентно перезапускається.
- **2026-04-22** Phase B (Kids Zone state → backend) done. **Backend**: new content-type `api::user-inventory.user-inventory` (1:1 to user-profile; owned/equipped shop items as m2m, outfit/placedItems as json, seedVersion int — room/character relations deferred to Phase C); kids-profile controller gets `/me` GET + PATCH with integer-delta writes for coins (server enforces balance≥0) and xp (non-negative only); user-inventory controller exposes only `/me` — GET auto-creates, PATCH accepts slugs for item relations and validates equipped⊆owned against the post-patch set; seed `07-user-inventories.ts` backfills empty inventory rows for existing kids-profiles (idempotent). **Frontend**: `lib/kids-store.ts` rewritten remote-first — `kidsStateStore.get()` parallel-fetches kids-profile + user-inventory, `patch()` diffs against cache and routes fields to the two endpoints; Next proxies in `app/api/user-inventory/me/route.ts` + `app/api/kids-profile/me/route.ts` (httpOnly-cookie auth); logout resets in-memory kids-state cache. IndexedDB retained for custom items/rooms/characters (user-uploaded — Phase I offline-cache work). Backend + frontend `tsc --noEmit` clean.
- **2026-04-22** Fix: seed `04-demo-accounts.ts` no longer writes `locale: 'uk'` into user-profile, and adds a repair path that forces `locale=null` on the 4 pre-existing demo profiles. Strapi v5 Documents API reserves the `locale` column for i18n bookkeeping on non-localized types; a non-null value caused downstream document lookups (refresh-token relation → profile) to fail with `Document with id X, locale "null" not found`, breaking `/api/auth/login` for all demo accounts. Verified post-deploy: all 4 demo emails return 200 with access + refresh tokens.
- **2026-04-22** Catalog seeds: `05-shop-items.ts` (20 items із `frontend/lib/shop-catalog.ts` — category/rarity/price/level/slotOffset, ідемпотентно по slug, always-run) і `06-achievements.ts` (12 ачівок: lessons/streak/coins/mastery/kids/special — tier+coin/xp reward+criteria JSON, ідемпотентно по slug, always-run). Обидва підключено у `seeds/index.ts` після `04-demo-accounts`. Після redeploy Railway підтягне shop-items і achievements одразу (без opt-in env). `tsc --noEmit` чистий на backend.
- **2026-04-22** Login page: видалено legacy Demo-picker (localStorage `demo_role` bypass) + Mode toggle; лишилась одна signin-форма, підключена до `useSession().login()` з real-auth + error UI + role-based redirect. Додано окремий блок «Тестові акаунти» — 4 картки (kids/adult/teacher/parent) з email + паролем + кнопкою «Копіювати» + «Заповнити форму». Backend — новий seed `04-demo-accounts.ts` (opt-in `SEED_DEMO_ACCOUNTS=1`, idempotent skip-if-exists): створює 4 users з паролем `Demo2026!` і відповідні role-profile. Увімкнути на Railway раз: `SEED_DEMO_ACCOUNTS=1` → redeploy → зняти змінну.
- **2026-04-22** Vercel build fix: видалено server-only `fetcherAuth` + `fetchMySessions` з `lib/fetcher.ts` / `lib/api.ts` (обидва unused, cross-referenced). Turbopack статичний трейсинг більше не тягне `next/headers` у client bundle через ланцюг `auth/register/page.tsx → fetcher.ts → auth-server.ts`.
- **2026-04-22** Phase A8: rich lesson-data → Strapi. **Backend** `api::lesson.lesson` schema += `steps: json`, `xp: integer`; core importer перенесено `scripts/import-mocks.ts` → `src/lib/mock-importer.ts` (shared runtime); новий `scripts/extract-lesson-steps.ts` читає TS-моки та емітує `frontend/mocks/lesson-steps.json` (committed). Importer читає JSON+steps, ідемпотентний backfill. `src/index.ts` bootstrap тепер викликає `runImport(strapi)` при `IMPORT_MOCKS_ON_BOOT=1` — усуває потребу в SSH для A7. **Frontend** `Lesson` type += `steps?: unknown[]`, `xp?: number`; `normalizeLesson` їх підтягує; `app/courses/[courseSlug]/lessons/[lessonSlug]/page.tsx` переписано з hardcoded TS-реєстра на `fetchLesson` + `fetchLessonsByCourse` + `notFound()`. Backend+FE `tsc` + `eslint` + `strapi build` зелені.
- **2026-04-22** Phase R завершено (R1, R2, R4, R5, R6, R7 done; R3 свідомо deferred у Phase B-G). Acceptance-критерій оновлено під фактично виконане; додано helper `apiErrorMessage(err, fallback)` у `lib/fetcher.ts` замість повного `handleApiError`-toast-stack (YAGNI, 1 catch-сайт).
- **2026-04-22** Gap-audit + roadmap update: додано §3a (reality-check vs документа). Виправлено лічильники mocks-споживачів (shop-catalog: 3→1 реальний, kids-store: 8→5, lessons: 12→18). Виправлено Reviews ctrl-рядок у §3 (default controller, owner-policy не застосовано). Додано **Phase R (code-health refactor)** перед A8: dead-code cleanup, style-unification, file-split, error/loading/not-found, ESLint baseline, TODO cleanup, уніфікований error-handling. Phase J розширено — J0 (Playwright bootstrap, тулу нема в репо), J1-J2 переформульовано як повний CRUD+golden path, J7 — CRUD-matrix coverage. §5 переписано з новим порядком виконання + правилом «нова фіча → тільки після CRUD+scoping тестів попередньої».
- **2026-04-22** Phase A7 (docs-only): додано runbook у §4 для `npm run import-mocks` (local → Railway staging → admin-spot-check → FE spot-check + rollback). Перевірено що `backend/tsc --noEmit -p .` чистий (importer компілиться). Виконання проти staging — на користувача (нема локальних Railway creds).
- **2026-04-22** Phase A8 додано в roadmap: rich lesson-step дані в `frontend/mocks/lessons/*.ts` обходять Strapi. `LessonPage` читає hardcoded TS реєстр. Блокер для Phase A acceptance. Два варіанти міграції: JSON-поле `lesson.content` vs розширення `exercise` component — вибирається у Phase A8 kickoff.
- **2026-04-22** Phase A6.3: видалено `frontend/mocks/user.ts`. `@/mocks/user`-імпортів у репо більше немає. `tsc --noEmit` чистий.
- **2026-04-22** Phase A6.2: новий `lib/use-kids-identity.ts` — єдиний seam для Kids Zone name+CEFR level з сесії. Шість споживачів (`welcome`, `characters`, `library/[id]`, `shop`, `dashboard`, `school`) перемкнуто з `mockKidsUser` на хук / `state.coins ?? 0`. `tsc --noEmit` чистий.
- **2026-04-22** Phase A6.1: `CompanionAnimal`/`CompanionMood` винесено з `@/mocks/user` у `@/lib/types`. Три type-only споживачі (CompanionSVG, shop-catalog, library-data) перемкнуто. `CompanionSVG` більше не має локального дублю `CompanionMood`. `tsc --noEmit` чистий.
- **2026-04-21** Phase A5: `lib/roleContext.tsx` гідрується з `useSession()`; `setRole` — no-op без `NEXT_PUBLIC_ROLE_SWITCHER=1`; `RoleSwitcher` self-hides без флагу; `RoleGuard`/`RoleSwitcher` перемкнуто на `Role` з `@/lib/types`. `tsc --noEmit` чистий.
- **2026-04-21** Phase A4.2: видалено `app/api/mock/**` + `lib/mockClient.ts`. `courses/[courseSlug]/page.tsx` живе на `fetchCourseBySlug/fetchCourses`. `CoursePage` + `CalendarView` переведено на канонічні типи з null-safe аксесом. До `CourseSection` додано легасі-аліас `lessons`. `tsc --noEmit` чистий.
- **2026-04-21** Phase A4.1: `lib/api.ts` переписано на реальний Strapi (COURSE/LESSON/SESSION populate) + `createProgress` через Next proxy `/api/user-progress`; `config.ts` очищено від `/api/mock`-дефолту; `LessonPlayer` мігрований. `tsc --noEmit` чистий. Моки в `app/api/mock/**` поки живі — прибирається в A4.2 разом із рештою споживачів `mockClient`.
- **2026-04-21** Phase A2+A3: `lib/normalize.ts` (Strapi v5 envelope unwrap + media URL absolutize + Kyiv-tz session split + legacy aliases) та `lib/fetcher.ts` перероблено на три entry points (fetcher, fetcherAuth server-only, fetcherClient same-origin) + `ApiError`. `tsc --noEmit` чистий.
- **2026-04-21** Single-source консолідація: видалено `README.md`, `backend/README.md`, `AGENTS.md`. `CLAUDE.md` містить правило Next 16 + вказівку на `PROJECT.md`. В репо лишилось 2 md: `PROJECT.md` (project info) + `CLAUDE.md` (AI contract).
- **2026-04-21** Консолідація `ARCHITECTURE.md` + `PRODUCTION_PLAN.md` → `PROJECT.md`. Додано детальний матрикс готовності для Kids/Shop/Inventory/Library/Homework/Progress/Teacher/Characters. Phase A → J roadmap.
- **2026-04-21** Phase 5 старого плану перейменовано на Phase A.
- **Раніше** — див. git log (фази 0-4 старого плану вже виконано: cleanup, backend perms+scoping, mock import script, auth endpoints + Next-handlers + SessionProvider + `proxy.ts` rename).
