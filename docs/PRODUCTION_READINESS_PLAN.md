# EnglishBest — Production Readiness Plan

> **Мета документа.** Вичерпний, forward-safe план переходу з поточного mock-фронтенду
> на продакшн-архітектуру: **Next.js 16 + Strapi v5 + PostgreSQL 16 + Cloudflare R2**.
> Документ спроектовано так, щоб НЕ довелося повторно чіпати схему БД або перекопувати
> бекенд — всі нюанси продумані наперед.
>
> **Статус:** план. Реалізація — по фазах (§10).
> **Автор:** архітектурний аналіз проведено 2026-04-19.
> **Пов'язані документи:** `ARCHITECTURE.md` (поточний стан), `REFACTOR_PLAN.md` (історія рефакторингу), `docs/strapi-integration.md` (старіший драфт, перекривається цим).

---

## Contents

0. [Executive summary](#0-executive-summary)
1. [Тех-стек і обґрунтування](#1-тех-стек-і-обґрунтування)
2. [Повний інвентар ролей і flow](#2-повний-інвентар-ролей-і-flow)
3. [Доменна модель — всі сутності, поля, зв'язки](#3-доменна-модель--всі-сутності-поля-зв'язки)
4. [Strapi content-types — повна схема з JSON-прикладами](#4-strapi-content-types--повна-схема-з-json-прикладами)
5. [API-поверхня: REST, WebSocket, Webhooks, File uploads](#5-api-поверхня-rest-websocket-webhooks-file-uploads)
6. [Auth, ролі, permissions, безпека поля](#6-auth-ролі-permissions-безпека-поля)
7. [Frontend adaptation — перехід Next.js з mock на Strapi](#7-frontend-adaptation--перехід-nextjs-з-mock-на-strapi)
8. [Non-functional: infra, DevOps, observability, GDPR](#8-non-functional-infra-devops-observability-gdpr)
9. [Data migration + seeding + fixtures](#9-data-migration--seeding--fixtures)
10. [Покрокова реалізація — фази з exit criteria](#10-покрокова-реалізація--фази-з-exit-criteria)
11. [Стратегія тестування + QA](#11-стратегія-тестування--qa)
12. [Ризики, відкриті питання, рішення що потребують апруву](#12-ризики-відкриті-питання-рішення-що-потребують-апруву)
13. [Додатки — ER-діаграма, чек-листи, референси](#13-додатки)

---

## 0. Executive summary

### Що маємо зараз

- **Next.js 16 (App Router) + React 19** фронт з повним UI: 50 пререндерованих routes, 5 ролей (`kids | adult | teacher | parent | admin`), повний teacher portal (phases A–I в `REFACTOR_PLAN.md#F7`), kids zone з 9 сторінками, lesson engine з 9 типами кроків, adult dashboard (analytics, payments, prizes, calendar, chat, library).
- **Mock-дані**: `mocks/*.json` + `lib/teacher-mocks.ts` + `lib/library-data.ts` + `lib/kids-store.ts` (IndexedDB для Kids state).
- **Mock API**: `app/api/mock/**` (6 REST endpoints).
- **Точка заміни**: `lib/api.ts` (7 helper functions) + `lib/config.ts` (`API_BASE_URL`).
- **Design system**: Tailwind v4 `@theme` в `globals.css`, zero inline styles.

### Що потрібно додати

- **Strapi v5 backend** (Node.js, документо-базована адмінка).
- **PostgreSQL 16** (primary store).
- **Cloudflare R2** (або S3) для медіа (уроки, аватарки, submitted audio/video, custom assets).
- **Realtime layer** (Socket.IO або Ably) для чату, live-уроків, notifications.
- **Платіжна інтеграція** (Stripe + LiqPay для UA).
- **Email provider** (Resend/Postmark) для transactional email.
- **Sentry + logging + metrics + uptime**.
- **CI/CD + staging + production environments**.

### Центральні forward-safe рішення (запобігають re-seed)

1. **documentId як первинний бізнес-ключ** (Strapi v5 default) — ніколи не тягти `id: number` в API. Це ключова відмінність Strapi 5 від 4: документ має стабільний `documentId` що переживає draft/publish цикли й ре-ейдити.
2. **Soft-delete + draft/publish everywhere** — `deletedAt`, `publishedAt` always present.
3. **UUID для user-generated content** (custom characters, custom items, custom rooms, placed items, chat messages). Клієнт може генерувати id оптимістично.
4. **Dynamic zones для поліморфних блоків**: `LessonBlock` (12 kinds), `ExerciseStep` (9 kinds), `HomeworkSubmission` (7 kinds), `NotificationPayload` — всі реалізуємо як Strapi Dynamic Zone (або Component з discriminator полем якщо обмежень DZ забагато).
5. **i18n через Strapi Internationalization** — локалі `uk` (default), `en`, `ru`. Усі user-facing content types локалізовані з дня 0. Додати четверту локаль = API call, не міграція.
6. **Tenant-ready** — додати `organization` relation (nullable) на критичні сутності (Course, Student, Group, ScheduledLesson, Homework, Payment). Сьогодні всі в "англ.бест", завтра — франчайзі, без re-seed.
7. **Audit log та Event sourcing для критичних дій** — `AuditLog` collection + `DomainEvent` для coins/xp/payments. Ніколи не видаляємо історичні записи.
8. **Окрема таблиця балансів** (`CoinLedger`, `XpLedger`) з append-only записами — баланс = sum. Жодних race condition, жодних "загублених монет".
9. **Версіонування уроків** — `LessonVersion` (1:N до `Lesson`). Teacher редагує нову версію; студенти, яким було assigned попередню, бачать ту версію. Уникає "урок поплив під студентом".
10. **Media-first** — будь-який ресурс (image/audio/video) — це `Media` (Strapi upload). Ніколи не base64 в JSON (на відміну від поточного `lib/kids-store.ts`). Для offline kids — client-side IndexedDB кеш, upload у фоні.
11. **Webhooks для Stripe/LiqPay** — ніколи не покладаємось на redirect як джерело правди.
12. **API versioning** — `/api/v1/...` з дня 0 (Strapi префіксом). Breaking changes → `/api/v2`, старий endpoint deprecated але живий 3 місяці.
13. **Feature flags** (`FeatureFlag` content-type) — прогресивний rollout без redeploy.
14. **Всі гроші — `bigint` копійок/центів** (не `decimal`). Валюта — окреме поле. Уникаємо floating-point болю.
15. **Всі дати — UTC ISO-8601** в API; клієнт конвертує в user timezone.

### Ключовий принцип

> Фронтенд сьогодні вже готовий до backend swap: `lib/api.ts` — єдина точка заміни.
> План тримає цю властивість: міграція — це **додати Strapi + замінити URL-и + нормалізатори**, а не переписувати компоненти. Всі ризикові рішення (схема БД, auth model, permissions) приймаються ДО першого deploy, бо міняти їх після продакшну — дорого.

---

## 1. Тех-стек і обґрунтування

### 1.1. Основний стек

| Шар                    | Вибір                                      | Чому                                                                                          |
|------------------------|--------------------------------------------|-----------------------------------------------------------------------------------------------|
| Frontend framework     | **Next.js 16.2** (App Router, React 19.2)  | Вже в проєкті; SSR/ISR/ISG з коробки; edge-friendly.                                          |
| Frontend styling       | **Tailwind v4** (`@theme`)                 | Вже в проєкті; zero inline styles.                                                            |
| Backend framework      | **Strapi v5** (Node 20 LTS)                | Headless CMS з UI адмінкою (економить 60% CRUD-коду), REST+GraphQL, документо-базований, плагінна система, безкоштовний open-source. |
| Primary DB             | **PostgreSQL 16**                          | Єдиний commercial-grade OSS. Strapi натив. JSONB для flex-полів. FTS для пошуку.              |
| Media storage          | **Cloudflare R2** (S3-compatible, без egress fee) | Дешевше S3 у 3-5х для video/audio. Strapi має готовий провайдер `@strapi/provider-upload-aws-s3`. |
| Cache / queue          | **Redis 7**                                | Session store, rate-limit, BullMQ для фонових задач (email, webhook retries, lootbox rolls).  |
| Realtime               | **Socket.IO** (embedded в Strapi як plugin) АБО **Ably/Pusher** (managed) | Socket.IO — більше коду, дешевше; Ably — платне, zero-ops. **Рекомендація: Ably для Phase 1**, Socket.IO — якщо потрібно $$ різати. |
| Auth core              | Strapi `users-permissions` + JWT           | Натив. Ролі з коробки. Розширимо refresh token + social (Google/Apple).                       |
| Email                  | **Resend** (або Postmark)                  | DX найкращий, deliverability топ.                                                             |
| Payments (UA)          | **LiqPay + WayForPay**                     | Реальні UA-методи (Приват24, моноObank). Картки + Apple/Google Pay.                            |
| Payments (intl)        | **Stripe**                                 | Підписки, invoicing, SCA, Tax. Для майбутнього intl expansion.                                |
| Search                 | **Meilisearch** (self-hosted) АБО Postgres FTS | Для глобального пошуку в бібліотеці. Phase 1 — Postgres trigram; Phase 2 — Meilisearch якщо потрібно фільтрувати >10k items. |
| Observability          | **Sentry** (errors) + **Axiom/Logtail** (logs) + **Grafana Cloud** (metrics) + **Better Stack** (uptime) | Managed, безкоштовні tiers покривають старт.                                                  |
| CI/CD                  | **GitHub Actions** → **Railway** (staging) + **Render/Fly.io** (prod) | Railway для швидкого старту; мігрувати в AWS ECS якщо потрібна conformance.                   |
| Feature flags          | **GrowthBook** (OSS self-host або cloud)   | Альтернатива: власна `FeatureFlag` content-type.                                              |
| Analytics              | **PostHog** (OSS) або Mixpanel             | Product analytics (events, funnels, retention).                                                |
| i18n                   | Strapi Internationalization plugin + `next-intl` на фронті | Натив Strapi; `next-intl` для App Router.                                                     |

### 1.2. Чому Strapi v5 (а не NestJS/Express самописний)

- **Контентна адмінка з коробки** — teachers можуть правити library lesson напряму через admin UI без деплою.
- **Документо-базованість (v5)** — стабільні `documentId`, draft/publish, content versioning.
- **Плагіни** — Users & Permissions, Email, Upload, Internationalization, GraphQL, Documentation (Swagger).
- **TypeScript** — є, але slim порівняно з Nest. Не фатально.
- **REST + GraphQL безкоштовно** — не треба писати руками.
- **Lifecycle hooks** (`beforeCreate`, `afterUpdate`) — бізнес-логіка (xp награди, coin ledger, notifications) без окремого worker.

**Компроміс:** Strapi — "opinionated". Якщо потрібна екзотична логіка (наприклад real-time collaborative editing), треба виносити її в окремий мікросервіс. Для EnglishBest профіль задач — CRUD + gamification + chat — Strapi покриває 90%.

### 1.3. Що НЕ обираємо і чому

- **Supabase** — вендор-лок на Supabase Auth + Postgres RLS. Якщо треба переїхати — боляче. Крім того, немає адмінки для контенту.
- **Firebase** — NoSQL, погано для реляційних даних (зв'язки student↔group↔lesson).
- **Django/Rails** — python/ruby додає runtime complexity; TS end-to-end простіше.
- **Власний NestJS** — 6+ місяців розробки CRUD + адмінки. Не виправдано для MVP→продакшн масштабу.

---

## 2. Повний інвентар ролей і flow

### 2.1. Ролі

| Роль        | ID           | Описання                                         | Ключові сторінки                                                        |
|-------------|--------------|--------------------------------------------------|-------------------------------------------------------------------------|
| Kid         | `kids`       | Дитина 6–12. Gamified UX (Toca).                 | `/kids/dashboard`, `/school`, `/shop`, `/library/[id]`, `/characters`, `/coins`, `/achievements`, `/lessons`, `/room` |
| Adult       | `adult`      | Дорослий учень (підлітки 14+, дорослі).          | `/dashboard`, `/dashboard/lessons`, `/dashboard/calendar`, `/dashboard/library`, `/dashboard/payments`, `/dashboard/profile`, `/dashboard/prizes` |
| Teacher     | `teacher`    | Викладач.                                         | `/dashboard/teacher`, `/teacher-calendar`, `/teacher-library`, `/students`, `/groups`, `/homework`, `/mini-tasks`, `/chat`, `/analytics`, `/attendance` |
| Parent      | `parent`     | Батьки дитини.                                    | `/dashboard/parent`, `/dashboard/chat`, `/dashboard/payments` (дитячого акаунту), `/dashboard/profile` |
| Admin       | `admin`      | Власник/менеджер платформи.                       | `/dashboard/admin`, `/dashboard/teachers`, `/dashboard/library`, `/dashboard/course-builder`, `/dashboard/calendar`, `/dashboard/payments`, `/dashboard/prizes`, `/dashboard/settings`, `/dashboard/profile`, `/dashboard/analytics` |

**Ключова інваріанта:** одна `User` може мати тільки ОДНУ primary роль, але parent може мати зв'язок з kids (`parentDocumentId ↔ childDocumentIds`), teacher — з students (`teacherDocumentId ↔ studentIds`).

### 2.2. Onboarding flow

```
/              ← landing/redirect
  ↓
/home          ← маркетинг
  ↓ CTA
/welcome       ← splash ("Вітаємо")
  ↓
/login         ← email+password або OAuth (Google/Apple)
  │   new user? →
/auth/register ← форма реєстрації (name, email, password, role, optional child link)
  ↓ after login
/onboarding    ← role/level selection (для нового user)
  ↓
/placement     ← 5-question quiz → визначає initial Level + recommended course
  ↓
/dashboard (adult) | /kids/dashboard | /dashboard/teacher | /dashboard/parent | /dashboard/admin
```

**Бекенд-flow:**
1. POST `/api/v1/auth/local/register` (Strapi native) → JWT + user.
2. POST `/api/v1/placement-attempts` → створює `PlacementAttempt`, обраховує level, встановлює `user.level` і `user.recommendedCourseId`.
3. При роботі з kids — parent реєструється першим, дитяча sub-account створюється через UI batka.

### 2.3. Kids flow (Toca Boca gamification)

```
Kid логіниться (або parent switch-profile)
  ↓
/kids/dashboard — персонаж у кімнаті, HUD (coins/streak/xp), HUD buttons (шоп/школа/призи)
  ↓ tap "Школа"
/kids/school — curriculum tree, уроки + lib items
  ↓ tap урок
/courses/[slug]/lessons/[slug] — Lesson engine (9 step types)
  ↓ complete
XP earn → coins earn → streak increment → confetti → notification
  ↓
/kids/shop — купити furniture/decor/outfit/special
  ↓ purchase
coin deduct → ownedItemIds++ → place on dashboard (PlacedItem)
  ↓
/kids/achievements — unlock achievements
  ↓
/kids/coins — transaction history (ledger)
  ↓ loot box open (special event)
/kids/coins (LootBox modal) → animated reveal → award
```

**Forward-safe:** kids-store.ts (IndexedDB) лишається як **offline cache**. Зміни синхронізуються з бекендом через **sync queue** (лежить в IDB, flush при online). Це дозволяє дитині грати в метро без інтернету.

### 2.4. Adult flow

```
/dashboard — прогрес курсу, наступний урок, розклад, homework, notifications
  ↓
/dashboard/lessons — лібрарія доступних (куплених/безкоштовних) уроків
  ↓
/dashboard/calendar — розклад зі Zoom/Meet лінками (joinUrl)
  ↓
/dashboard/chat — чат з teacher
  ↓
/dashboard/library — бібліотека (книги/відео/ігри) — покупка за coins або real money
  ↓
/dashboard/payments — підписка, історія платежів, поповнення coins
  ↓
/dashboard/prizes — нагороди, leaderboard
```

### 2.5. Teacher flow (опорою слугує `docs/teacher-module-plan.md`, секції 1–9 спеки)

```
/dashboard/teacher — Hub: today schedule · pending HW (>10 yellow, >20 red) · at-risk students
  ↓
/teacher-calendar — Day/Week/Month views, create/edit lesson, actions (почати/перенести/скасувати)
  ↓
/teacher-library — 12 block-kind lessons (own/platform/copy/template), editor з blocks, versioning
  ↓
/students — filter by level/status, quick actions (chat, lessons, assign HW)
  ↓
/groups — CRUD груп, привʼязка студентів
  ↓
/homework — create/grade homework, 5 tabs (all/pending/reviewed/returned/overdue)
  ↓
/homework/[id]/review — грейдинг (qual/numeric), coins + bonus, comment
  ↓
/mini-tasks — 6 kinds (quiz/word-of-day/daily/listening/sentence-builder/level-quiz)
  ↓
/chat — з студентами/батьками/групами; reply-quote, pinned, read-receipts
  ↓
/analytics — KPI, 6-month chart, level distribution, honor-roll top-3
  ↓
/attendance — журнал відвідуваності (students/groups × дні), Excel/PDF export
```

### 2.6. Parent flow

```
/dashboard/parent — дашборд з усіма дітьми (якщо >1)
  ↓ select child
Child summary: прогрес · HW статус · оплати · наступний урок
  ↓
/dashboard/chat — з teacher або другим батьком
  ↓
/dashboard/payments — оплати (дитячий акаунт, покупка coins, підписки)
```

### 2.7. Admin flow

```
/dashboard/admin — глобальний overview
  ↓
/dashboard/teachers — CRUD викладачів, призначення груп
/dashboard/students — CRUD студентів, enrollment
/dashboard/library (admin) — глобальна бібліотека курсів/програм
/dashboard/course-builder — дизайнер курсу (sections × lessons)
/dashboard/calendar — глобальний розклад, drag-n-drop bookings
/dashboard/payments — всі транзакції, рахунки, reconciliation
/dashboard/prizes — конфіг нагород/achievements
/dashboard/analytics — платформена аналітика (DAU, ARPU, conversion)
/dashboard/settings — глобальні налаштування, feature flags, branding
```

---

## 3. Доменна модель — всі сутності, поля, зв'язки

> Нижче — **кожна** сутність з фронту + що треба додати для продакшн-бекенду.
> Нотація: `?` — nullable; `[]` — масив; `@relation` — зв'язок; `@enum` — enum.
> Зірочка `*` = індекс. Bold id поля = primary business key (documentId).
>
> **Важливо:** Strapi автогенерує `id` (int), `documentId` (uuid-like), `createdAt`, `updatedAt`, `publishedAt`, `locale`. Ми їх не повторюємо в списку полів, але вони присутні на КОЖНІЙ сутності.

### 3.1. Identity & Profiles

#### 3.1.1. `User` (базова, Strapi users-permissions extended)

```
username       : string* (unique)
email          : string* (unique, indexed)
password       : hash (Strapi native)
confirmed      : boolean
blocked        : boolean
role           : @relation Role (users-permissions native)

— Extensions (наші) —
documentId     : uuid (Strapi v5 native)
slug           : string (unique, URL-safe, auto from name on first save)
fullName       : string
firstName      : string
lastName       : string
phone          : string?
locale         : @enum "uk"|"en"|"ru" (default "uk")
timezone       : string (default "Europe/Kyiv", IANA)
avatar         : @media (single)
birthDate      : date?
gender         : @enum "male"|"female"|"other"|"undisclosed"?
primaryRole    : @enum "kids"|"adult"|"teacher"|"parent"|"admin"  ← дублюємо для швидкого читання без populate

— Gamification (тільки для kids+adult) —
level          : @enum "A0"|"A1"|"A2"|"B1"|"B2"|"C1"|"C2"?
xpTotal        : bigint (default 0)
coinsBalance   : bigint (default 0)  ← derived, синхронізований з CoinLedger
streakCurrent  : int (default 0)
streakBest     : int (default 0)
lastActivityAt : datetime?

— Billing —
stripeCustomerId: string?
balanceUAH     : bigint (default 0)  ← копійки; внутрішній баланс для курсу

— Relations —
kidsProfile    : @relation KidsProfile (one-to-one, nullable)
teacherProfile : @relation TeacherProfile (one-to-one, nullable)
parentProfile  : @relation ParentProfile (one-to-one, nullable)
adminProfile   : @relation AdminProfile (one-to-one, nullable)
adultProfile   : @relation AdultProfile (one-to-one, nullable)
enrollments    : @relation Enrollment []
notifications  : @relation Notification []
devices        : @relation Device []
sessions       : @relation AuthSession []

— Compliance —
gdprConsent    : @component GDPRConsent {acceptedAt, version, ipAddress}
marketingOptIn : boolean (default false)
deletedAt      : datetime?  ← soft-delete, 30-day retention then hard delete
deletionReason : text?
```

**Чому profile-per-role через 1:1 relation:** дозволяє додавати поля (parent-specific, teacher-specific) без роздування `User`. Форма per-role — читається окремо (`populate: { teacherProfile: true }`).

#### 3.1.2. `KidsProfile`

```
user                : @relation User (required, unique)
age                 : int (derived? або duplicate для speed)
companionAnimal     : @enum "fox"|"cat"|"dragon"|"rabbit"|"raccoon"|"frog"
companionName       : string
companionMoodCurrent: @enum CompanionMood
companionLevel      : int (default 1)
activeCharacterId   : string (foreign to Character.documentId)
activeRoomId        : string? (foreign to Room.documentId)
unlockedRoomIds     : string[]
outfit              : @component Outfit { hat?, glasses?, scarf?, bag?, shoes? }
parent              : @relation User? (parent role)
teacher             : @relation User? (assigned teacher)
group               : @relation Group?
allowSocialFeatures : boolean (default false)  ← COPPA: батько має увімкнути
parentalControls    : @component ParentalControls { dailyTimeLimitMin, allowChat, allowShop, allowCustomAssets }
```

#### 3.1.3. `AdultProfile`, `TeacherProfile`, `ParentProfile`, `AdminProfile`

**TeacherProfile:**
```
user              : @relation User
bio               : text?
specializations   : string[] (array: "A1-A2", "kids", "business")
languages         : string[] (speaks)
rating            : decimal (computed, 0-5)
reviewCount       : int
salaryPerLesson   : bigint (копійки)  ← для internal payroll
availability      : @component WeeklyAvailability[] { dayOfWeek, startTime, endTime }
timezoneForCalendar: string
hireDate          : date
contractType      : @enum "full-time"|"part-time"|"freelance"
bankAccount       : string (encrypted at rest)  ← for payroll
ownedLessonsCount : int (derived)
studentsCount     : int (derived)
```

**ParentProfile:**
```
user              : @relation User
children          : @relation User[] (m2m through ParentChildLink)
emergencyContact  : @component EmergencyContact { name, phone, relation }
preferredPayment  : @enum "card"|"google_pay"|"apple_pay"|"monobank"|"liqpay"
```

**AdminProfile:**
```
user              : @relation User
permissions       : string[] (granular: "teachers.manage", "payments.view", "settings.write")
department        : @enum "marketing"|"content"|"ops"|"finance"|"support"
```

**AdultProfile:**
```
user                : @relation User
goal                : @enum "exam"|"work"|"travel"|"hobby"|"kids"  ← для рекомендацій
preferredStudyDays  : string[] (Mon..Sun)
preferredFormat     : @enum "individual"|"group"|"mixed"
hasCompletedPlacement : boolean
placementScore      : int?
onboardingFinishedAt: datetime?
```

#### 3.1.4. `ParentChildLink` (junction для m2m Parent↔Kid)

```
parent             : @relation User (parent role)
child              : @relation User (kids role)
relation           : @enum "mother"|"father"|"guardian"|"grandparent"
isPrimaryGuardian  : boolean
canManagePayments  : boolean
canChatTeacher     : boolean
```

**Чому junction:** легко додати другого батька, бабусю як secondary guardian. Без junction — батько має знати child_ids як масив, що ускладнює permissions.

### 3.2. Учбовий контент

#### 3.2.1. `Course`

```
documentId    : uuid
slug          : string* (unique, URL, transliterated from title)
title         : string (localized: i18n)
subtitle      : string?
description   : richtext (i18n)
level         : @enum Level
ageFrom       : int?
ageTo         : int?
price         : bigint (копійки UAH)
priceMonthly  : bigint? (для підписочної моделі)
currency      : @enum "UAH"|"USD"|"EUR" (default UAH)
thumbnail     : @media
coverImage    : @media?
introVideo    : @media?
teacher       : @relation User (teacher role, primary instructor)
coTeachers    : @relation User[]?
sections      : @relation CourseSection[] (ordered)
tags          : string[]
status        : @enum "draft"|"available"|"comingSoon"|"soldOut"|"archived"
rating        : decimal (computed)
reviewCount   : int (computed)
enrolledCount : int (computed)
lessonsCount  : int (computed)
durationHours : decimal? (sum of lessons)
publishedAt   : datetime?
featured      : boolean (на лендінгу)
```

**Локалізація:** `title`, `subtitle`, `description` — i18n, різні переклади.
**Computed fields:** raiting/reviewCount/enrolledCount/lessonsCount — triggered на lifecycle hook `afterCreate` Review/Enrollment/Lesson.

#### 3.2.2. `CourseSection`

```
documentId    : uuid
course        : @relation Course
slug          : string (unique per course)
title         : string (i18n)
order         : int (0-based)
lessons       : @relation Lesson[] (ordered)
lockedUntilPreviousCompleted : boolean (default true)
```

#### 3.2.3. `Lesson` — ключова сутність. Об'єднуємо два поняття з фронту.

У фронті сьогодні є два типи:
- **`LessonData`** (`mocks/lessons/types.ts`) — engine-facing, має `steps: LessonStep[]` (9 kinds).
- **`LibraryLesson`** (`lib/teacher-mocks.ts`) — teacher-facing, має `blocks` (12 kinds).

**Рішення:** одна сутність `Lesson` з двома Dynamic Zone полями:
- `contentBlocks` — для teacher-library lessons (12 BlockKind).
- `engineSteps` — для студент-engine lessons (9 StepKind).
- Для синхронізації кожного BlockKind ↔ StepKind маємо адаптер на беку (`transformBlocksToSteps(lesson)`). Це дозволяє teacher редагувати через BlockKind UI, а студент отримує engine steps.

```
documentId            : uuid
slug                  : string* (unique)
course                : @relation Course? (nullable — library lessons можуть бути без курсу)
section               : @relation CourseSection?
title                 : string (i18n)
topic                 : string (i18n)
level                 : @enum Level
durationMin           : int
source                : @enum "platform"|"copy"|"own"|"template"
ownerTeacher          : @relation User? (teacher-created lesson)
originalLesson        : @relation Lesson? (якщо source=copy)
hasUpdateFromOriginal : boolean (computed)
contentBlocks         : @dynamicZone LessonBlock_* (12 компонентів — див. §4)
engineSteps           : @dynamicZone LessonStep_* (9 компонентів)
tags                  : string[]
thumbnail             : @media?
coverImage            : @media?
introVideo            : @media?
xpAward               : int (default 10)
coinsAward            : int (default 5)
bonusCoinsThreshold   : decimal? (наприклад 0.9 = 90% правильних → bonus)
bonusCoinsAmount      : int?
isPublished           : boolean (draft/publish)
versionNumber         : int (1-based)  ← автоінкремент при publish
versions              : @relation LessonVersion[]
```

**Чому dynamic zones:** гнучкість додавати нові block/step kinds без міграції.
**Чому `versionNumber`:** teacher редагує lesson → save публікує нову версію, залишаючи попередню доступною для вже assigned homework / enrolled students.

#### 3.2.4. `LessonVersion` (snapshot)

```
documentId  : uuid
lesson      : @relation Lesson
version     : int
snapshot    : json (повний знімок contentBlocks + engineSteps + metadata)
createdBy   : @relation User
publishedAt : datetime
notes       : text? (release notes)
```

#### 3.2.5. `LessonBlock_*` (12 Dynamic Zone components)

Кожний — окремий Strapi Component з шаблоном:

```
text                       — { title, body (richtext) }
image                      — { caption, media (single), altText }
audio                      — { caption, media (single), transcript? }
video                      — { caption, media (single) | youtubeUrl, captionFile? }
exercise-multiple-choice   — { question, options: Component[] {text, correct}, explanation? }
exercise-text-input        — { prompt, answer, acceptedVariants: string[], hint?, caseSensitive }
exercise-matching          — { prompt, pairs: Component[] {left, right}, shuffleRight }
exercise-word-order        — { prompt, translation, words: string[], correctOrder: string[] }
exercise-fill-gap          — { before, after, answer, hint? }
flashcards                 — { title, cards: Component[] {front, back} }
link                       — { title, url, description }
teacher-note               — { body (richtext) } ← внутрішня примітка, не показується студенту
```

#### 3.2.6. `LessonStep_*` (9 engine steps)

```
theory            — { title, body (markdown), examples: Component[] {en, ua}, tip? }
multiple-choice   — { question, options: string[], correctIndex, explanation? }
fill-blank        — { before, after, answer, hint? }
word-order        — { prompt, translation, words: string[], answer: string[] }
match-pairs       — { prompt, pairs: Component[] {left, right} }
translate         — { prompt, sentence, answer, acceptedAnswers: string[] }
image             — { title, media, caption? }
video             — { title, mediaOrUrl, caption? }
reading           — { title, text, vocabulary: Component[] {word, translation}, questions: Component[] ReadingQuestion }
```

**Правило:** `engineSteps` є "compiled" формою `contentBlocks`. При publish teacher-lesson, бек auto-generates `engineSteps` з `contentBlocks` (адаптер детермінований). Teacher також може вручну тюнити engineSteps для складних сценаріїв.

#### 3.2.7. `Enrollment` (студент ↔ курс)

```
documentId       : uuid
student          : @relation User
course           : @relation Course
enrolledAt       : datetime
paidAmount       : bigint (копійки)
paymentMethod    : @enum
status           : @enum "active"|"completed"|"paused"|"cancelled"|"expired"
accessExpiresAt  : datetime?
progress         : decimal (0-1, computed from LessonProgress)
completedAt      : datetime?
certificateIssued: boolean
```

#### 3.2.8. `LessonProgress`

```
documentId    : uuid
student       : @relation User
lesson        : @relation Lesson
course        : @relation Course? (нормалізація для швидких запитів)
status        : @enum "not-started"|"in-progress"|"completed"|"failed"
startedAt     : datetime?
completedAt   : datetime?
correctCount  : int
totalCount    : int
timeSpentSec  : int
attempts      : int
lastStepId    : string?  ← для resume
xpEarned      : int
coinsEarned   : int
```

**Запит "is user X done with lesson Y"** — просто `LessonProgress.findOne({user, lesson})` — O(1).

#### 3.2.9. `Review` (відгук студента про курс/викладача)

```
documentId  : uuid
author      : @relation User
course      : @relation Course?
teacher     : @relation User?
rating      : int (1-5)
body        : text
approved    : boolean
moderatedBy : @relation User?
reply       : text? (teacher response)
```

### 3.3. Розклад, заняття, відвідуваність

#### 3.3.1. `ScheduledLesson` — об'єднання `ScheduledLesson` (teacher-mocks) + `CalendarSession` (mockClient)

```
documentId    : uuid
teacher       : @relation User
student       : @relation User? (1:1 lesson)
group         : @relation Group? (group lesson)
course        : @relation Course?
lessonRef     : @relation Lesson? (матеріал зі library)
date          : date (UTC)
startTime     : time (HH:mm:ss)
durationMin   : int
timezone      : string (IANA, default "Europe/Kyiv")
level         : @enum Level
topic         : string (i18n)
status        : @enum "scheduled"|"in-progress"|"done"|"cancelled"|"no-show"
mode          : @enum "individual"|"pair"|"group"|"speaking-club"|"trial"
joinUrl       : string?  ← Zoom/Meet/власна video
joinProvider  : @enum "zoom"|"meet"|"ejson"|"jitsi"|"other"?
recurrence    : @component RecurrenceRule? { pattern, weekdays, endAt, count }
parentSeries  : @relation ScheduledLesson?  ← для повторюваних
notes         : text?
cancelReason  : string?
cancelledBy   : @relation User?
attendance    : @relation AttendanceRecord[]
lessonReport  : @relation LessonReport?
```

**Recurrence:** зберігаємо "rule" + "material series". При запиті "lessons for date X", generator розгортає "parent" lesson в список instances. Альтернатива — створювати N записів наперед; але це роздуває БД.
**Рекомендація:** гібрид. Зберігаємо 90 днів instances створеними, далі — virtual expansion (як iCal).

#### 3.3.2. `AttendanceRecord`

```
documentId       : uuid
scheduledLesson  : @relation ScheduledLesson
student          : @relation User
status           : @enum "present"|"late"|"absent"|"excused"|"empty"
markedAt         : datetime
markedBy         : @relation User (teacher)
lateMinutes      : int?
notes            : text?
```

#### 3.3.3. `LessonReport` (teacher-написаний після проведення)

```
documentId        : uuid
scheduledLesson   : @relation ScheduledLesson
teacher           : @relation User
summary           : text (що робили)
homeworkAssigned  : @relation Homework[]?
newVocabulary     : string[]
grammarFocus      : string[]
studentParticipation: @enum "excellent"|"good"|"average"|"poor"
nextLessonGoal    : text?
```

#### 3.3.4. `Group`

```
documentId    : uuid
name          : string
level         : @enum Level
teacher       : @relation User
students      : @relation User[] (m2m через GroupMembership)
schedule      : @component WeeklyAvailability[]
maxSize       : int (default 8)
avgAttendance : decimal (computed)
avgHomework   : decimal (computed)
status        : @enum "active"|"paused"|"archived"
startDate     : date
endDate       : date?
```

#### 3.3.5. `GroupMembership`

```
group        : @relation Group
student      : @relation User
joinedAt     : datetime
leftAt       : datetime?
role         : @enum "member"|"captain"  ← опціонально
```

### 3.4. Homework

#### 3.4.1. `Homework` (завдання)

```
documentId          : uuid
teacher             : @relation User
title               : string
description         : text (i18n)
kind                : @enum "library-lesson"|"written"|"file"|"audio"|"video"|"link"|"test"
lessonRef           : @relation Lesson? (якщо kind=library-lesson)
targetKind          : @enum "student"|"group"
targetStudent       : @relation User?
targetGroup         : @relation Group?
assignedAt          : datetime
deadline            : datetime
coins               : int
bonusCoins          : int?
bonusCondition      : @enum "on-time"|"perfect-score"|"excellent-grade"?
coinsReward         : int (computed: actual coins after grading)
attachments         : @media[]
isTemplate          : boolean (for reuse)
parentTemplate      : @relation Homework? (якщо створено з шаблону)
submissions         : @relation HomeworkSubmission[]
```

**Target:** коли `targetKind=group`, при assignedAt бек генерує по одному `HomeworkSubmission` на кожного студента групи. Це дозволяє teacher бачити individual submission status.

#### 3.4.2. `HomeworkSubmission`

```
documentId       : uuid
homework         : @relation Homework
student          : @relation User
status           : @enum "not-started"|"in-progress"|"submitted"|"reviewed"|"returned"|"overdue"
startedAt        : datetime?
submittedAt      : datetime?
content          : @dynamicZone HomeworkContent_* (7 компонентів по kind)
attachments      : @media[]
submissionPreview: string (короткий preview для teacher списку)

— grading —
reviewedBy       : @relation User?
reviewedAt       : datetime?
gradeMode        : @enum "qualitative"|"numeric"?
gradeQualitative : @enum "excellent"|"good"|"needs-improvement"|"fail"?
gradeNumeric     : int? (1-12)
comment          : text?
coinsAwarded     : int
bonusAwarded     : int
```

**HomeworkContent_* компоненти:**
```
library-lesson-progress  — { lessonProgress: @relation LessonProgress }
written-text             — { body (richtext), wordCount }
file-upload              — { file: @media }
audio-recording          — { recording: @media, durationSec }
video-recording          — { recording: @media, durationSec }
link-submission          — { url, comment? }
test-result              — { miniTaskAttempt: @relation MiniTaskAttempt }
```

### 3.5. Mini-tasks

#### 3.5.1. `MiniTask`

```
documentId       : uuid
teacher          : @relation User?  ← null = platform-wide
kind             : @enum "level-quiz"|"quiz"|"daily-challenge"|"word-of-day"|"listening"|"sentence-builder"
title            : string (i18n)
level            : @enum Level
topic            : string
durationMin      : int
coins            : int (1-20)
questionsCount   : int
content          : @dynamicZone MiniTaskContent_*
isTemplate       : boolean
assignedCount    : int (computed)
avgScore         : decimal? (computed)
```

#### 3.5.2. `MiniTaskContent_*` (Dynamic Zone components)

```
quiz              — { questions: Component[] MCQQuestion[] }
word-of-day       — { word, translation, phonetic, example, exercise }
daily-challenge   — { vocabPart, grammarPart, speakingPart }
listening         — { audioUrl: @media, questions: MCQQuestion[] }
sentence-builder  — { sentences: Component[] {words: string[], correctOrder: string[]} }
level-quiz        — { questions: Component[] MCQQuestion[], levelMap: {"0-1": "A1", ...} }
```

#### 3.5.3. `MiniTaskAssignment` (tile → student/group)

```
documentId   : uuid
miniTask     : @relation MiniTask
assignedBy   : @relation User (teacher)
targetKind   : @enum "student"|"group"
targetStudent: @relation User?
targetGroup  : @relation Group?
deadline     : datetime?
assignedAt   : datetime
```

#### 3.5.4. `MiniTaskAttempt`

```
documentId   : uuid
assignment   : @relation MiniTaskAssignment?
student      : @relation User
miniTask     : @relation MiniTask
startedAt    : datetime
completedAt  : datetime?
answers      : json  ← зберігаємо raw answers для re-grade
score        : decimal (0-1)
correctCount : int
totalCount   : int
coinsEarned  : int
xpEarned     : int
```

### 3.6. Комунікація

#### 3.6.1. `ChatThread`

```
documentId      : uuid
kind            : @enum "student"|"parent"|"group"|"teacher-direct"|"broadcast"
title           : string (display name; для group — назва групи)
photo           : @media?
participants    : @relation User[] (m2m через ChatParticipant)
group           : @relation Group? (якщо kind=group)
pinnedByUsers   : string[] (userDocumentIds хто pinned)
lastMessage     : @relation ChatMessage?
lastMessageAt   : datetime?
isArchived      : boolean
metadata        : json?  ← наприклад, source homework id якщо thread стартував з assignment
```

#### 3.6.2. `ChatParticipant`

```
thread       : @relation ChatThread
user         : @relation User
role         : @enum "owner"|"member"|"readonly"
joinedAt     : datetime
leftAt       : datetime?
unreadCount  : int (derived/cached)
lastReadAt   : datetime?
notificationsMuted: boolean
```

#### 3.6.3. `ChatMessage`

```
documentId   : uuid
thread       : @relation ChatThread
author       : @relation User
authorRole   : @enum "teacher"|"student"|"parent"|"admin"|"system"
body         : text (i18n NOT applied — messages raw)
bodyFormat   : @enum "text"|"markdown"|"html"
replyTo      : @relation ChatMessage?
attachments  : @media[]
sentAt       : datetime
editedAt     : datetime?
deletedAt    : datetime? (soft-delete; show "message deleted")
readBy       : @component MessageRead[] { user, readAt }
status       : @enum "sent"|"delivered"|"read"
reactions    : @component Reaction[] { emoji, user }
pinned       : boolean
isSystem     : boolean (automated: "Дз додано", "Студент приєднався")
```

#### 3.6.4. `BroadcastMessage` (mass message)

```
documentId     : uuid
author         : @relation User (teacher/admin)
audience       : @enum "all-students"|"all-parents"|"level"|"group"
audienceLevel  : @enum Level?
audienceGroup  : @relation Group?
body           : text
sentAt         : datetime
recipientCount : int
```

### 3.7. Gamification (coins, xp, streak, achievements, loot boxes)

#### 3.7.1. `CoinLedger` (append-only!)

```
documentId    : uuid
user          : @relation User
delta         : int (може бути negative)
balanceAfter  : bigint
reason        : @enum "lesson-complete"|"homework-grade"|"streak-bonus"|"daily-login"|"shop-purchase"|"refund"|"admin-grant"|"admin-deduct"|"lootbox-open"|"referral"|"achievement"|"mini-task"
referenceKind : @enum "LessonProgress"|"HomeworkSubmission"|"ShopPurchase"|"Manual"|"LootBoxOpen"|"MiniTaskAttempt"|"Achievement"?
referenceId   : string (documentId)?
grantedBy     : @relation User?
notes         : text?
createdAt     : datetime (index)
```

**Принципи:**
- **Append-only.** Ніколи не `UPDATE` і не `DELETE`.
- `user.coinsBalance` = SUM(delta) — триggerиться на each insert. Або materialized view.
- Full audit trail автоматично.
- Refund = новий запис з негативним delta.
- **Rate-limit** — per-user max 100 ledger entries/min, блокувати скрипт-фармінг.

#### 3.7.2. `XpLedger` — аналогічно.

```
documentId    : uuid
user          : @relation User
delta         : int
totalAfter    : bigint
reason        : @enum (same family as CoinLedger)
referenceId   : string?
createdAt     : datetime
```

#### 3.7.3. `StreakHistory`

```
documentId     : uuid
user           : @relation User
date           : date (user timezone, unique per user+date)
activityType   : @enum "lesson"|"homework"|"mini-task"|"chat"
streakOnDate   : int (computed — 1-based)
```

**Логіка:** streak увеличивается на 1 якщо сьогодні є activity, скидається на 0 якщо пропуск дня. Timezone-aware (per user).

#### 3.7.4. `Achievement` (catalog)

```
documentId   : uuid
slug         : string* (unique)
title        : string (i18n)
description  : text (i18n)
icon         : @media
rarity       : @enum "common"|"uncommon"|"rare"|"epic"|"legendary"
coinsReward  : int
xpReward     : int
condition    : json  ← { type: "lessons_completed", count: 10 } | { type: "streak_days", count: 30 } | { type: "level_reached", level: "A2" } | { type: "coins_spent", count: 1000 } etc.
isSecret     : boolean (показується лише після unlock)
availableFrom: datetime?
availableTo  : datetime?
```

#### 3.7.5. `UserAchievement` (unlocked)

```
documentId    : uuid
user          : @relation User
achievement   : @relation Achievement
unlockedAt    : datetime (unique per user+achievement)
coinsGranted  : int
xpGranted     : int
```

#### 3.7.6. `LootBox` (catalog)

```
documentId    : uuid
slug          : string*
name          : string (i18n)
icon          : @media
rarity        : @enum
priceCoins    : int?  ← якщо купується
availableFrom : datetime?
availableTo   : datetime?
drops         : @component LootDrop[] { itemKind, itemId, weight, minCount, maxCount }
```

`itemKind` = `"shop-item"|"character"|"coins"|"xp"|"achievement"|"room"` — discriminator який збігається з колекцією куди кидати.

#### 3.7.7. `LootBoxOpen`

```
documentId     : uuid
user           : @relation User
lootBox        : @relation LootBox
openedAt       : datetime
source         : @enum "purchase"|"reward"|"daily"|"event"
rewardsGranted : @component Reward[] { kind, itemId, count, value }
seed           : string  ← деterminism для re-verify
```

### 3.8. Shop (items, purchases, inventory, placement, outfit)

#### 3.8.1. `ShopItem` (catalog) — унія платформеного + custom

```
documentId     : uuid
slug           : string* (платформний — фіксований slug; custom — uuid)
isCustom       : boolean
creator        : @relation User?  ← для custom
nameEn         : string
nameUa         : string (i18n)
phonetic       : string
emoji          : string?
category       : @enum "furniture"|"decor"|"outfit"|"special"
price          : int (coins)
levelRequired  : @enum Level
imageIdle      : @media? (або @singleMedia для платформних)
imageHover     : @media?
imageActive    : @media?
imageFallback  : string? (emoji)
rarity         : @enum "common"|"uncommon"|"rare"|"legendary"
isNew          : boolean
availableFrom  : datetime?
availableTo    : datetime?
slotOffset     : @component SlotOffset? { top, left }  ← для outfit items
```

**Чому одна колекція:** уникаємо "if-custom-read-from-IDB-else-from-API" — client просто `GET /shop-items?filters[visibleTo][$eq]=me`.
**Custom items:** рядок містить `creator` і `isCustom=true`. Permissions: owner може edit/delete; інші — read-only якщо `isPublic`.

#### 3.8.2. `Inventory` (owned items)

```
user           : @relation User
items          : @relation ShopItem[] (m2m через InventoryEntry)
```

#### 3.8.3. `InventoryEntry`

```
documentId    : uuid
user          : @relation User (indexed)
item          : @relation ShopItem
acquiredAt    : datetime
acquiredVia   : @enum "purchase"|"lootbox"|"gift"|"admin"|"default-seed"
quantity      : int (default 1)  ← для items стеками типу coins
```

#### 3.8.4. `Purchase`

```
documentId    : uuid
user          : @relation User
item          : @relation ShopItem
priceCoins    : int (snapshot at purchase time)
coinLedgerRef : @relation CoinLedger (деduction record)
createdAt     : datetime
```

#### 3.8.5. `PlacedItem` (items on room canvas)

```
documentId    : uuid
user          : @relation User
item          : @relation ShopItem
x             : decimal (0-1 normalized)
y             : decimal (0-1 normalized)
scale         : decimal (default 1)
z             : int (stack order)
roomId        : string? (future: multi-room)
rotation      : decimal (default 0)
```

#### 3.8.6. `Outfit` (equipped items) — embedded в KidsProfile

```
hat       : @relation ShopItem?
glasses   : @relation ShopItem?
scarf     : @relation ShopItem?
bag       : @relation ShopItem?
shoes     : @relation ShopItem?
tail      : @relation ShopItem?
```

### 3.9. Characters (avatars + custom)

#### 3.9.1. `Character` (catalog + custom)

```
documentId         : uuid
slug               : string* (fox/cat/dragon/rabbit/raccoon/frog/custom-uuid)
isCustom           : boolean
creator            : @relation User?
nameEn             : string
nameUa             : string (i18n)
rarity             : @enum "common"|"uncommon"|"rare"|"epic"|"legendary"
description        : text (i18n)
unlockRequirement  : json?  ← {type: "achievement", id: "lesson-master"} | {type: "coins", count: 500} | {type: "lootbox"}
priceCoins         : int?
fallbackAnimal     : @enum "fox"|"cat"|"dragon"|"rabbit"|"raccoon"|"frog"
moodImages         : @component MoodImage[] { mood: @enum CompanionMood, media }
```

### 3.10. Rooms (backgrounds)

#### 3.10.1. `Room` (catalog + custom)

```
documentId       : uuid
slug             : string*
isCustom         : boolean
creator          : @relation User?
nameEn           : string
nameUa           : string (i18n)
coinsRequired    : int?
backgroundImage  : @media?
previewImage     : @media?
rarity           : @enum
unlockRequirement: json?
```

### 3.11. Library (adult library з `LibItem`)

#### 3.11.1. `LibraryItem`

Окрема колекція від `Lesson` — для контенту "розважально-освітнього" (books/videos/games) що не є повноцінним уроком.

```
documentId  : uuid
slug        : string*
emoji       : string?
coverImage  : @media?
titleEn     : string
titleUa     : string (i18n)
subtitle    : string (author/episode count/etc)
type        : @enum "book"|"course"|"video"|"game"
level       : @enum Level
priceCoins  : int (0 = free for all above level)
price       : bigint? (real money for premium)
currency    : @enum?
description : richtext (i18n)
longDescription: richtext[] (paragraphs, i18n)
previewText : text?
externalUrl : string?  ← для 3rd-party games/videos
contentFile : @media?  ← для PDF/epub
isNew       : boolean
publishedAt : datetime?
purchases   : @relation LibraryPurchase[]
```

#### 3.11.2. `LibraryPurchase`

```
documentId    : uuid
user          : @relation User
item          : @relation LibraryItem
priceCoins    : int? (snapshot)
priceMoney    : bigint?
currency      : @enum?
paymentRef    : @relation Payment?
createdAt     : datetime
```

### 3.12. Admin Library (`ProgramDetail`)

Це власне курс з адмін-точки зору. Вирішуємо: `Program` — псевдонім `Course` з UI; Внутрішньо — те саме content type `Course`. На адмінці — фільтр `status ∈ {published, draft, archived}` + агрегація `studentsCount`, `lessonsCount`, `rating`.

### 3.13. Payments

#### 3.13.1. `Payment` (транзакція)

```
documentId     : uuid
user           : @relation User
amount         : bigint (копійки/центи)
currency       : @enum "UAH"|"USD"|"EUR"
kind           : @enum "course-purchase"|"subscription"|"coin-topup"|"library-item"|"gift"|"lesson-pack"|"manual"
status         : @enum "pending"|"processing"|"paid"|"failed"|"refunded"|"cancelled"
provider       : @enum "stripe"|"liqpay"|"wayforpay"|"monobank"|"manual"
providerId     : string?  ← external transaction id
providerStatus : string?
paymentMethod  : @enum "card"|"apple_pay"|"google_pay"|"bank_transfer"|"coins"|"balance"
description    : string
metadata       : json  ← provider-specific payload
refundRef      : @relation Payment?  ← якщо це refund
enrollmentRef  : @relation Enrollment?
libraryPurchaseRef: @relation LibraryPurchase?
subscriptionRef: @relation Subscription?
invoiceRef     : @relation Invoice?
paidAt         : datetime?
refundedAt     : datetime?
failureReason  : string?
idempotencyKey : string (unique)
```

**Idempotency:** при retry не дублюємо платіж. Стандарт Stripe.

#### 3.13.2. `Subscription`

```
documentId    : uuid
user          : @relation User
plan          : @relation Plan
status        : @enum "trialing"|"active"|"past_due"|"cancelled"|"expired"|"paused"
startedAt     : datetime
currentPeriodEnd: datetime
cancelAt      : datetime?
cancelReason  : string?
provider      : @enum
providerSubscriptionId: string
autoRenew     : boolean
metadata      : json
```

#### 3.13.3. `Plan`

```
documentId    : uuid
slug          : string*
title         : string (i18n)
description   : text
priceMonthly  : bigint
priceYearly   : bigint?
currency      : @enum
features      : string[] (list of feature keys)
lessonQuota   : int?  ← uроків/місяць
isPublic      : boolean
sortOrder     : int
```

#### 3.13.4. `Invoice`

```
documentId    : uuid
number        : string (unique, sequential: UA-2026-00123)
user          : @relation User
payment       : @relation Payment
issuedAt      : datetime
dueAt         : datetime?
items         : @component InvoiceItem[] { description, quantity, unitPrice, totalPrice, taxRate }
subtotal      : bigint
tax           : bigint
total         : bigint
currency      : @enum
pdfFile       : @media?
status        : @enum "draft"|"issued"|"paid"|"overdue"|"void"
```

### 3.14. Prizes (leaderboard, nominations)

Prizes на фронті = просто UI для achievements + coin earnings + contests. Переважно переможе через вже створені entities. Додамо:

#### 3.14.1. `Contest`

```
documentId   : uuid
slug         : string*
title        : string (i18n)
description  : richtext
startDate    : datetime
endDate      : datetime
metric       : @enum "xp-earned"|"lessons-completed"|"streak"|"homework-score"|"custom"
scope        : @enum "global"|"group"|"level"|"age"
prizes       : @component ContestPrize[] { rank, rewardKind, rewardId, description }
status       : @enum "upcoming"|"active"|"ended"|"archived"
```

#### 3.14.2. `ContestEntry`

```
user         : @relation User
contest      : @relation Contest
score        : decimal
rank         : int? (computed at end)
awardedPrize : @component ContestPrize?
```

### 3.15. Notifications

#### 3.15.1. `Notification`

```
documentId   : uuid
user         : @relation User (indexed)
kind         : @enum "homework-assigned"|"homework-graded"|"lesson-reminder"|"chat-message"|"achievement"|"payment"|"schedule-change"|"coins-earned"|"system"|"broadcast"
title        : string
body         : string
payload      : json  ← linkable: { targetRoute, targetId }
icon         : string?
priority     : @enum "low"|"normal"|"high"
channels     : string[]  ← ["in-app", "push", "email"]
readAt       : datetime?
createdAt    : datetime (indexed)
expiresAt    : datetime?
source       : @enum "system"|"teacher"|"admin"|"automation"
sourceId     : string?
```

#### 3.15.2. `Device` (push-подписки)

```
documentId   : uuid
user         : @relation User
platform     : @enum "web"|"ios"|"android"
pushToken    : string (FCM/APNs/Web Push)
userAgent    : string?
lastSeenAt   : datetime
locale       : string
timezone     : string
```

### 3.16. Placement + онбординг

#### 3.16.1. `PlacementTest`

```
documentId   : uuid
slug         : string*
version      : int
questions    : @relation PlacementQuestion[]
levelMap     : json  ← { "0-1": { level: "A1", course: "english-kids-starter" }, ... }
isActive     : boolean
```

#### 3.16.2. `PlacementQuestion`

```
documentId    : uuid
test          : @relation PlacementTest
order         : int
question      : string (i18n)
options       : string[] (i18n)
correctIndex  : int
level         : @enum Level  ← "this question tests this level"
```

#### 3.16.3. `PlacementAttempt`

```
documentId    : uuid
user          : @relation User
test          : @relation PlacementTest
answers       : json (array of {questionId, answerIndex, correct})
score         : int
levelAssigned : @enum Level
courseRecommended : @relation Course?
completedAt   : datetime
```

### 3.17. System & internal

#### 3.17.1. `AuditLog`

```
documentId   : uuid
actor        : @relation User? (nullable для system actions)
action       : string  ← "user.create", "homework.grade", "payment.refund"
resourceKind : string  ← content-type id
resourceId   : string
before       : json?   ← snapshot до зміни
after        : json?
ip           : string?
userAgent    : string?
success      : boolean
errorMessage : text?
createdAt    : datetime (indexed)
```

#### 3.17.2. `FeatureFlag`

```
documentId   : uuid
key          : string* (unique)
enabled      : boolean
description  : text
rolloutRules : json  ← { type: "percentage", value: 50 } | { type: "userIds", value: [...] } | { type: "role", value: "teacher" }
```

#### 3.17.3. `Webhook` (outgoing)

```
documentId   : uuid
event        : string
url          : string
secret       : string (encrypted)
active       : boolean
headers      : json
retries      : int (default 3)
lastDelivery : datetime?
lastStatus   : int?
```

#### 3.17.4. `AuthSession` (для refresh-token fan)

```
documentId   : uuid
user         : @relation User
tokenHash    : string (NOT raw)
refreshTokenHash : string
userAgent    : string
ip           : string
expiresAt    : datetime
revokedAt    : datetime?
```

#### 3.17.5. `EmailTemplate`

```
documentId   : uuid
slug         : string*
subject      : string (i18n)
htmlBody     : text (i18n)
textBody     : text (i18n)
variables    : string[]
```

#### 3.17.6. `Settings` (single-type)

```
platformName    : string
supportEmail    : string
supportPhone    : string
defaultLocale   : string
defaultTimezone : string
maintenanceMode : boolean
signupEnabled   : boolean
privacyVersion  : string
termsVersion    : string
```

### 3.18. Review / summary table

Всього: **~45 content types**. З них:
- ~5 single-types (Settings, PlacementTest-active, etc.)
- ~40 collection-types
- ~30 components (Dynamic Zone compositions)

Це не мало, але кожен має чітку відповідальність. **Перевантаження БД немає** — всі relations через foreign keys, JSONB лиш для рідких flex-полів (audit before/after, feature-flag rollout rules, drops, answers).

---

## 4. Strapi content-types — детальні схеми

Цей розділ описує структуру Strapi-проекту, конвенції, приклади `schema.json` для ключових content-types та compoments Dynamic Zone. Мета — мати єдиний, передбачуваний спосіб визначати типи, щоб майбутні зміни не ламали БД і не потребували ресетів.

### 4.1. Layout Strapi-проекту

```
apps/cms/
├─ config/
│  ├─ admin.ts
│  ├─ api.ts
│  ├─ database.ts              # PG connection, SSL for prod
│  ├─ plugins.ts               # users-permissions, i18n, upload (R2), email (Postmark)
│  ├─ middlewares.ts
│  ├─ server.ts                # host, port, url, proxy
│  └─ env/
│     ├─ production/
│     └─ staging/
├─ src/
│  ├─ api/
│  │  ├─ user-profile/          # collection-type
│  │  │  ├─ content-types/user-profile/schema.json
│  │  │  ├─ controllers/user-profile.ts
│  │  │  ├─ routes/user-profile.ts
│  │  │  ├─ services/user-profile.ts
│  │  │  └─ policies/can-edit-self.ts
│  │  ├─ lesson/
│  │  ├─ homework-submission/
│  │  ├─ scheduled-lesson/
│  │  ├─ coin-ledger/
│  │  ├─ ...                    # по 1 директорії на collection-type
│  │  └─ system/                # single-types
│  ├─ components/
│  │  ├─ lesson-block/          # 12 types for teacher blocks DZ
│  │  │  ├─ text.json
│  │  │  ├─ heading.json
│  │  │  ├─ quiz-single.json
│  │  │  ├─ quiz-multi.json
│  │  │  ├─ fill-blank.json
│  │  │  ├─ match-pairs.json
│  │  │  ├─ word-order.json
│  │  │  ├─ translate.json
│  │  │  ├─ image.json
│  │  │  ├─ video.json
│  │  │  ├─ audio.json
│  │  │  └─ divider.json
│  │  ├─ lesson-step/           # 9 types for engine steps DZ
│  │  │  ├─ theory.json
│  │  │  ├─ multiple-choice.json
│  │  │  ├─ fill-blank.json
│  │  │  ├─ word-order.json
│  │  │  ├─ match-pairs.json
│  │  │  ├─ translate.json
│  │  │  ├─ image.json
│  │  │  ├─ video.json
│  │  │  └─ reading.json
│  │  ├─ homework-content/      # 7 types
│  │  ├─ mini-task-payload/     # 6 types
│  │  └─ shared/
│  │     ├─ media-asset.json
│  │     ├─ rich-text.json
│  │     └─ coin-reward.json
│  ├─ extensions/
│  │  └─ users-permissions/     # custom JWT, refresh tokens, role hook
│  │     ├─ strapi-server.ts
│  │     └─ content-types/user/schema.json
│  ├─ policies/
│  │  ├─ is-authenticated.ts
│  │  ├─ is-owner.ts
│  │  ├─ is-teacher-of-student.ts
│  │  ├─ is-parent-of-kid.ts
│  │  └─ has-role.ts
│  ├─ middlewares/
│  │  ├─ audit-log.ts           # write AuditLog on every mutation
│  │  ├─ idempotency.ts         # x-idempotency-key for payments
│  │  ├─ rate-limit.ts
│  │  └─ request-id.ts
│  ├─ hooks/                    # lifecycle hooks
│  │  └─ (per-type в services)
│  ├─ jobs/                     # BullMQ consumers
│  │  ├─ send-notification.ts
│  │  ├─ process-payment-webhook.ts
│  │  ├─ recalculate-streaks.ts
│  │  ├─ refresh-leaderboard.ts
│  │  └─ materialize-recurring-lessons.ts
│  ├─ admin/
│  │  └─ app.tsx                # кастомізація панелі (логотип, locale)
│  └─ index.ts                  # bootstrap: seed roles, permissions, scheduled jobs
└─ database/
   └─ migrations/               # джерелом правди для схеми лишається schema.json,
                                # але ручні data-migrations живуть тут
```

### 4.2. Конвенції (strict)

1. **Naming**: `kebab-case` для UID (`user-profile`, `homework-submission`), `camelCase` для полів, `PascalCase` для component назв у DZ.
2. **Обов'язкові поля на всіх collection-types**:
   - `documentId` (автоматично, Strapi v5)
   - `locale` (якщо i18n enabled)
   - `publishedAt` (draft/publish pattern) — використовуємо лиш де є сенс (Lesson, Program, Prize); для службових (Payment, Submission) draft/publish вимикаємо.
   - `createdBy`, `updatedBy` (автоматично).
3. **Relations**: завжди декларуємо обидві сторони (`oneToMany` + inverse `manyToOne`). Jeder foreign key named `<entity>Id` у раннерах, але в schema.json — `<entity>` (без Id).
4. **i18n**: `localized: true` на людино-читаних полях (`title`, `description`, `body`), **не** на технічних (`slug`, `status`, `kind`).
5. **Unique constraints**: на `slug`, `email`, `phone`, `idempotencyKey`, `(organization, slug)` для context-scoped унікальності.
6. **Enums**: завжди з явним списком значень + `default`.
7. **JSON fields**: тільки де structure потенційно змінюється (audit diff, feature-flag rollout, answer payload). Ніколи як replacement for relation.
8. **Timestamps**: всі ledger/event-style типи (CoinLedger, AuditLog, ClassEvent) мають `createdAt` як event time + default Strapi fields. Ніколи не мутуємо такі рядки — лише append.
9. **Soft delete**: вмикається плагіном на Lesson, Homework, User, Program, Group. Інші (ledger, submission) — незнищенні by design.
10. **Versioning**: вмикаємо plugin `@strapi/plugin-versioning` (або власний content-history) для Lesson + Program. Інші типи versioning не потребують.

### 4.3. Приклади схем

#### 4.3.1. `api::user-profile.user-profile/schema.json`

```json
{
  "kind": "collectionType",
  "collectionName": "user_profiles",
  "info": {
    "singularName": "user-profile",
    "pluralName": "user-profiles",
    "displayName": "User Profile",
    "description": "1:1 profile attached to Strapi users-permissions User"
  },
  "options": {
    "draftAndPublish": false
  },
  "pluginOptions": {
    "i18n": { "localized": false }
  },
  "attributes": {
    "user": {
      "type": "relation",
      "relation": "oneToOne",
      "target": "plugin::users-permissions.user",
      "inversedBy": "profile",
      "required": true
    },
    "organization": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::organization.organization"
    },
    "role": {
      "type": "enumeration",
      "enum": ["kids", "adult", "teacher", "parent", "admin"],
      "required": true
    },
    "firstName": { "type": "string", "required": true },
    "lastName":  { "type": "string" },
    "displayName": { "type": "string" },
    "avatar": { "type": "media", "multiple": false, "allowedTypes": ["images"] },
    "locale": { "type": "enumeration", "enum": ["uk", "en", "ru"], "default": "uk" },
    "timezone": { "type": "string", "default": "Europe/Kyiv" },
    "phone": { "type": "string", "regex": "^\\+?[0-9]{9,15}$" },
    "dateOfBirth": { "type": "date" },
    "level": {
      "type": "enumeration",
      "enum": ["A0", "A1", "A2", "B1", "B2", "C1", "C2"]
    },
    "kidsProfile":    { "type": "relation", "relation": "oneToOne", "target": "api::kids-profile.kids-profile" },
    "adultProfile":   { "type": "relation", "relation": "oneToOne", "target": "api::adult-profile.adult-profile" },
    "teacherProfile": { "type": "relation", "relation": "oneToOne", "target": "api::teacher-profile.teacher-profile" },
    "parentProfile":  { "type": "relation", "relation": "oneToOne", "target": "api::parent-profile.parent-profile" },
    "adminProfile":   { "type": "relation", "relation": "oneToOne", "target": "api::admin-profile.admin-profile" },
    "consentTermsAt":   { "type": "datetime" },
    "consentPrivacyAt": { "type": "datetime" },
    "parentalConsentBy": { "type": "relation", "relation": "manyToOne", "target": "api::user-profile.user-profile" },
    "marketingOptIn":  { "type": "boolean", "default": false },
    "status": {
      "type": "enumeration",
      "enum": ["active", "paused", "archived", "deleted"],
      "default": "active"
    },
    "deletedAt": { "type": "datetime" }
  }
}
```

#### 4.3.2. `api::lesson.lesson/schema.json`

```json
{
  "kind": "collectionType",
  "collectionName": "lessons",
  "info": {
    "singularName": "lesson",
    "pluralName": "lessons",
    "displayName": "Lesson"
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {
    "i18n": { "localized": true }
  },
  "attributes": {
    "slug": {
      "type": "uid",
      "targetField": "title",
      "required": true
    },
    "title":       { "type": "string", "required": true, "pluginOptions": { "i18n": { "localized": true } } },
    "description": { "type": "text",   "pluginOptions": { "i18n": { "localized": true } } },
    "level": {
      "type": "enumeration",
      "enum": ["A0", "A1", "A2", "B1", "B2", "C1", "C2"],
      "required": true
    },
    "cefrSubLevel": { "type": "string", "regex": "^(A[0-2]|B[1-2]|C[1-2])(\\.[0-9])?$" },
    "durationMin": { "type": "integer", "default": 20 },
    "tags":        { "type": "json" },
    "program": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::program.program",
      "inversedBy": "lessons"
    },
    "orderIndex": { "type": "integer", "default": 0 },
    "author": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::user-profile.user-profile"
    },
    "status": {
      "type": "enumeration",
      "enum": ["draft", "ready", "published", "archived"],
      "default": "draft"
    },
    "contentBlocks": {
      "type": "dynamiczone",
      "components": [
        "lesson-block.text",
        "lesson-block.heading",
        "lesson-block.quiz-single",
        "lesson-block.quiz-multi",
        "lesson-block.fill-blank",
        "lesson-block.match-pairs",
        "lesson-block.word-order",
        "lesson-block.translate",
        "lesson-block.image",
        "lesson-block.video",
        "lesson-block.audio",
        "lesson-block.divider"
      ],
      "pluginOptions": { "i18n": { "localized": true } }
    },
    "engineSteps": {
      "type": "dynamiczone",
      "components": [
        "lesson-step.theory",
        "lesson-step.multiple-choice",
        "lesson-step.fill-blank",
        "lesson-step.word-order",
        "lesson-step.match-pairs",
        "lesson-step.translate",
        "lesson-step.image",
        "lesson-step.video",
        "lesson-step.reading"
      ],
      "pluginOptions": { "i18n": { "localized": true } }
    },
    "coverImage":  { "type": "media", "allowedTypes": ["images"], "multiple": false },
    "coinReward":  { "type": "integer", "default": 0 },
    "xpReward":    { "type": "integer", "default": 0 },
    "prerequisites": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::lesson.lesson"
    },
    "versionHash": { "type": "string" },
    "lastPublishedAt": { "type": "datetime" }
  }
}
```

#### 4.3.3. Component `lesson-step/multiple-choice.json`

```json
{
  "collectionName": "components_lesson_step_multiple_choice",
  "info": {
    "displayName": "Multiple choice",
    "icon": "question-circle"
  },
  "options": {},
  "attributes": {
    "prompt": { "type": "text", "required": true, "pluginOptions": { "i18n": { "localized": true } } },
    "options": {
      "type": "json",
      "required": true,
      "description": "[{ id: string, label: string, isCorrect: boolean }]"
    },
    "allowMultiple": { "type": "boolean", "default": false },
    "explanation":   { "type": "text", "pluginOptions": { "i18n": { "localized": true } } },
    "media":         { "type": "component", "repeatable": false, "component": "shared.media-asset" },
    "coinReward":    { "type": "integer", "default": 1 },
    "xpReward":      { "type": "integer", "default": 5 },
    "timeLimitSec":  { "type": "integer" }
  }
}
```

#### 4.3.4. `api::coin-ledger.coin-ledger/schema.json`

Append-only реєстр монет. Баланс = `SUM(amount)` + `balanceAfter` як denormalized кеш для швидкого читання.

```json
{
  "kind": "collectionType",
  "collectionName": "coin_ledger",
  "info": {
    "singularName": "coin-ledger",
    "pluralName": "coin-ledgers",
    "displayName": "Coin Ledger"
  },
  "options": { "draftAndPublish": false },
  "attributes": {
    "user":  { "type": "relation", "relation": "manyToOne", "target": "api::user-profile.user-profile", "required": true },
    "amount": { "type": "biginteger", "required": true },
    "reason": {
      "type": "enumeration",
      "enum": ["lesson_completed","homework_completed","mini_task","daily_streak","shop_purchase","gift_parent","admin_adjust","refund","reward_prize"],
      "required": true
    },
    "sourceType": { "type": "string" },
    "sourceId":   { "type": "string" },
    "balanceAfter": { "type": "biginteger", "required": true },
    "note": { "type": "string" },
    "idempotencyKey": { "type": "string", "unique": true },
    "createdByUser": { "type": "relation", "relation": "manyToOne", "target": "api::user-profile.user-profile" }
  }
}
```

#### 4.3.5. `api::scheduled-lesson.scheduled-lesson/schema.json`

```json
{
  "kind": "collectionType",
  "collectionName": "scheduled_lessons",
  "info": {
    "singularName": "scheduled-lesson",
    "pluralName": "scheduled-lessons",
    "displayName": "Scheduled Lesson"
  },
  "options": { "draftAndPublish": false },
  "attributes": {
    "teacher": { "type": "relation", "relation": "manyToOne", "target": "api::user-profile.user-profile", "required": true },
    "student": { "type": "relation", "relation": "manyToOne", "target": "api::user-profile.user-profile" },
    "group":   { "type": "relation", "relation": "manyToOne", "target": "api::group.group" },
    "lesson":  { "type": "relation", "relation": "manyToOne", "target": "api::lesson.lesson" },
    "startAt": { "type": "datetime", "required": true },
    "endAt":   { "type": "datetime", "required": true },
    "timezone": { "type": "string", "default": "Europe/Kyiv" },
    "status": {
      "type": "enumeration",
      "enum": ["planned","confirmed","in_progress","done","missed","cancelled","rescheduled"],
      "default": "planned"
    },
    "meetingUrl":   { "type": "string" },
    "notesTeacher": { "type": "text" },
    "notesStudent": { "type": "text" },
    "cancelledBy":  { "type": "relation", "relation": "manyToOne", "target": "api::user-profile.user-profile" },
    "cancelReason": { "type": "string" },
    "rescheduledTo": { "type": "relation", "relation": "oneToOne", "target": "api::scheduled-lesson.scheduled-lesson" },
    "recurrenceRule": { "type": "string" },
    "recurrenceParent": { "type": "relation", "relation": "manyToOne", "target": "api::scheduled-lesson.scheduled-lesson" },
    "coinsAwarded": { "type": "integer", "default": 0 },
    "xpAwarded":    { "type": "integer", "default": 0 }
  }
}
```

#### 4.3.6. `api::homework-submission.homework-submission/schema.json`

```json
{
  "kind": "collectionType",
  "collectionName": "homework_submissions",
  "info": {
    "singularName": "homework-submission",
    "pluralName": "homework-submissions",
    "displayName": "Homework Submission"
  },
  "options": { "draftAndPublish": false },
  "attributes": {
    "homework": { "type": "relation", "relation": "manyToOne", "target": "api::homework.homework", "required": true },
    "student":  { "type": "relation", "relation": "manyToOne", "target": "api::user-profile.user-profile", "required": true },
    "status": {
      "type": "enumeration",
      "enum": ["draft","submitted","reviewed","returned"],
      "default": "draft"
    },
    "answers":      { "type": "json", "required": true },
    "attachments":  { "type": "media", "multiple": true, "allowedTypes": ["images","files","audios"] },
    "submittedAt":  { "type": "datetime" },
    "reviewedAt":   { "type": "datetime" },
    "reviewer":     { "type": "relation", "relation": "manyToOne", "target": "api::user-profile.user-profile" },
    "score":        { "type": "integer" },
    "maxScore":     { "type": "integer" },
    "feedback":     { "type": "text" },
    "corrections":  { "type": "json" },
    "coinsAwarded": { "type": "integer", "default": 0 },
    "xpAwarded":    { "type": "integer", "default": 0 }
  }
}
```

#### 4.3.7. `api::payment.payment/schema.json`

```json
{
  "kind": "collectionType",
  "collectionName": "payments",
  "info": {
    "singularName": "payment",
    "pluralName": "payments",
    "displayName": "Payment"
  },
  "options": { "draftAndPublish": false },
  "attributes": {
    "user":       { "type": "relation", "relation": "manyToOne", "target": "api::user-profile.user-profile", "required": true },
    "amount":     { "type": "biginteger", "required": true },
    "currency":   { "type": "string", "default": "UAH" },
    "provider": {
      "type": "enumeration",
      "enum": ["stripe","liqpay","wayforpay","manual"],
      "required": true
    },
    "providerPaymentId": { "type": "string", "unique": true },
    "status": {
      "type": "enumeration",
      "enum": ["pending","authorized","paid","refunded","failed","disputed"],
      "default": "pending"
    },
    "subscription":  { "type": "relation", "relation": "manyToOne", "target": "api::subscription.subscription" },
    "purpose":       { "type": "enumeration", "enum": ["subscription","one_time","refill_coins","refund","manual"] },
    "description":   { "type": "string" },
    "idempotencyKey": { "type": "string", "unique": true, "required": true },
    "failReason":    { "type": "string" },
    "paidAt":        { "type": "datetime" },
    "refundedAt":    { "type": "datetime" },
    "providerData":  { "type": "json" }
  }
}
```

#### 4.3.8. `api::audit-log.audit-log/schema.json`

Append-only. Пишемо з middleware на всі mutation-запити до whitelisted entities.

```json
{
  "kind": "collectionType",
  "collectionName": "audit_logs",
  "info": {
    "singularName": "audit-log",
    "pluralName": "audit-logs",
    "displayName": "Audit Log"
  },
  "options": { "draftAndPublish": false },
  "attributes": {
    "actor":     { "type": "relation", "relation": "manyToOne", "target": "api::user-profile.user-profile" },
    "actorIp":   { "type": "string" },
    "actorUserAgent": { "type": "string" },
    "action":    { "type": "string", "required": true },
    "entityType": { "type": "string", "required": true },
    "entityId":   { "type": "string", "required": true },
    "before":     { "type": "json" },
    "after":      { "type": "json" },
    "requestId":  { "type": "string" },
    "metadata":   { "type": "json" }
  }
}
```

### 4.4. Dynamic Zones — повний каталог

| DZ          | Використовується у                          | Components                                                                                                              |
|-------------|---------------------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| contentBlocks | Lesson (teacher authoring view)           | text, heading, quiz-single, quiz-multi, fill-blank, match-pairs, word-order, translate, image, video, audio, divider    |
| engineSteps   | Lesson (student player view)              | theory, multiple-choice, fill-blank, word-order, match-pairs, translate, image, video, reading                          |
| content       | Homework                                    | writing, translation, vocabulary, reading, listening, video, mixed                                                      |
| payload       | MiniTask                                    | flashcards, quick-quiz, spelling, listening, pronounce, match                                                           |
| rewards       | Prize (випадкові дропи)                    | coins, xp, shop-item, custom-item, character, room-theme, outfit                                                        |
| segments      | MassMessage, Notification audience          | role-is, level-between, program-is, group-is, last-active-before, custom-query                                          |

### 4.5. Shared components

- `shared.media-asset` — `{ media: media, alt: string, caption: text }`
- `shared.coin-reward` — `{ coins: int, xp: int, reason: enum }`
- `shared.rich-text` — markdown content + embeds
- `shared.audio-clip` — `{ media: media, durationSec: int, transcript: text }`
- `shared.address` — `{ line1, line2, city, region, postalCode, country }`

### 4.6. Індекси БД

Окрім автоматичних indices Strapi, додаємо вручну міграцією:

```sql
CREATE INDEX idx_coin_ledger_user_created     ON coin_ledger (user_id, created_at DESC);
CREATE INDEX idx_xp_ledger_user_created       ON xp_ledger   (user_id, created_at DESC);
CREATE INDEX idx_scheduled_teacher_start      ON scheduled_lessons (teacher_id, start_at);
CREATE INDEX idx_scheduled_student_start      ON scheduled_lessons (student_id, start_at) WHERE student_id IS NOT NULL;
CREATE INDEX idx_homework_student_due         ON homework_assignments (student_id, due_at);
CREATE INDEX idx_submission_homework_status   ON homework_submissions (homework_id, status);
CREATE INDEX idx_notifications_recipient_read ON notifications (recipient_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_payments_user_status         ON payments (user_id, status, created_at DESC);
CREATE INDEX idx_audit_entity                 ON audit_logs (entity_type, entity_id, created_at DESC);
CREATE INDEX idx_audit_actor                  ON audit_logs (actor_id, created_at DESC);

-- FTS
CREATE INDEX idx_lesson_search_uk ON lessons USING GIN (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,'')));
CREATE INDEX idx_program_search_uk ON programs USING GIN (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,'')));

-- Unique
CREATE UNIQUE INDEX uniq_payment_idempotency ON payments (idempotency_key);
CREATE UNIQUE INDEX uniq_coin_idempotency    ON coin_ledger (idempotency_key) WHERE idempotency_key IS NOT NULL;
```

### 4.7. Lifecycle hooks (services)

Приклади критичних lifecycle hooks:

- `api::coin-ledger.coin-ledger` — `beforeCreate`: обчислити `balanceAfter = currentBalance + amount`; відкинути, якщо призвело б до balance < 0 для debit-операцій (крім `admin_adjust`).
- `api::homework-submission.homework-submission` — `afterUpdate`: якщо `status` перейшов в `reviewed`, створити CoinLedger (+xp/+coins) та Notification студенту; створити AuditLog.
- `api::payment.payment` — `afterUpdate`: якщо `status` перейшов в `paid`, активувати Subscription, дати бонусні coins (якщо `purpose=refill_coins`), створити Notification.
- `api::scheduled-lesson.scheduled-lesson` — `afterCreate`: створити ClassEvent `created`; розіслати Notification teacher/student; забронювати TeacherSlot.
- `api::user-profile.user-profile` — `afterCreate`: при role=kids — створити дефолтні KidsProfile + Room + стартовий Character; при role=teacher — створити TeacherProfile + дефолтний Availability template.

### 4.8. Валідатори (zod schemas на Strapi + на Next.js)

Zod schemas живуть у **спільній** `packages/shared/src/schemas/`:
- Використовуються на Strapi у policies/middlewares для валідації request body.
- Використовуються на Next.js для форм (react-hook-form + zodResolver).
- Гарантують один format для обидвох сторін.

### 4.9. Повний каталог schemas — інші 35 content-types

Нижче — компактний (але вичерпний) огляд кожного типу: поля + relations + критичні invariants. Формат: `field: type` + опційні маркери (`*` required, `!` unique, `↳` relation, `i18n` локалізоване).

#### 4.9.1. Identity / tenancy

**`api::organization.organization`**
```
documentId      : uuid
name*           : string (i18n)
slug*!          : string
logo            : media
primaryColor    : string         # hex
locale          : enum[uk,en,ru]
timezone        : string default "Europe/Kyiv"
billingEmail    : string
status          : enum[active,suspended,trial]  default "active"
plan↳           : api::plan.plan
trialEndsAt     : datetime
```

**`api::kids-profile.kids-profile`**
```
user↳!*         : user-profile (oneToOne, role=kids)
companionAnimal*: enum[fox,raccoon,owl,bunny,bear,dragon]
companionName   : string default "Friend"
characterMood   : enum[happy,sleepy,excited,curious,proud,tired,playful,focused,celebrating,thinking]
streakDays      : int default 0
streakLastAt    : datetime
totalCoins      : biginteger default 0   # cached, source of truth = ledger
totalXp         : biginteger default 0
hardCurrency    : int default 0          # premium "gems" (future)
ownedItems↳     : shop-item (manyToMany)
ownedCharacters↳: character (manyToMany)
activeCharacter↳: character-instance
activeRoom↳     : room
parentalLink↳   : parent-link (oneToOne)
ageGroup        : enum[2-4,4-7,7-11,11+]
isPin           : string  # 4-digit hashed argon2id
showRealName    : boolean default false
```

**`api::adult-profile.adult-profile`**
```
user↳!*         : user-profile (oneToOne, role=adult)
goal            : enum[exam,travel,career,hobby,school,other]
currentLevel    : enum[A0..C2]
targetLevel     : enum[A0..C2]
weeklyGoalMin   : int default 90
preferredTimes  : json   # [{day:1, from:"19:00", to:"21:00"}]
selfStudyEnabled: boolean default true
totalCoins      : biginteger default 0
totalXp         : biginteger default 0
streakDays      : int default 0
streakLastAt    : datetime
```

**`api::teacher-profile.teacher-profile`**
```
user↳!*         : user-profile (oneToOne, role=teacher)
bio             : text (i18n)
specializations : json   # ['exam-prep','kids','business']
languagesSpoken : json   # ['uk','en','ru']
yearsExperience : int
hourlyRate      : biginteger     # копійки UAH
verified        : boolean default false
verificationDoc : media
maxStudents     : int default 30
acceptsTrial    : boolean default true
videoMeetUrl    : string         # власний Zoom Pro URL
publicSlug!     : uid (target=user.profile.displayName)
rating          : decimal(3,2)   # cached avg
ratingCount     : int default 0
```

**`api::parent-profile.parent-profile`**
```
user↳!*         : user-profile (oneToOne, role=parent)
displayName     : string
preferredContact: enum[email,phone,both]
emergencyPhone  : string
billingAddress  : component shared.address
```

**`api::admin-profile.admin-profile`**
```
user↳!*         : user-profile (oneToOne, role=admin)
permissions     : json   # ['payments','users','content','feature-flags',...]
twoFactorEnabled: boolean default true
ipAllowlist     : json   # ['1.2.3.0/24']
```

**`api::parent-link.parent-link`**  (consent edge між parent ↔ kid)
```
parent↳*        : user-profile (role=parent)
child↳*         : user-profile (role=kids)
relationship    : enum[mother,father,guardian,other]  default "guardian"
canPay          : boolean default true
canViewChat     : boolean default true
canMessageTeacher: boolean default true
consentSignedAt : datetime *
revokedAt       : datetime
```

#### 4.9.2. Auth

**`api::refresh-token.refresh-token`**
```
user↳*          : user-profile
tokenHash*!     : string                  # argon2id
expiresAt*      : datetime
revokedAt       : datetime
deviceId        : string
userAgent       : string
ip              : string
lastUsedAt      : datetime
```

**`api::consent-log.consent-log`**
```
user↳*          : user-profile
type*           : enum[terms,privacy,marketing,cookies-analytics,cookies-marketing,parental]
version*        : string                 # "2026-01-15"
acceptedAt      : datetime
revokedAt       : datetime
ip              : string
userAgent       : string
```

**`api::password-reset-token.password-reset-token`** — стандартний Strapi tokens; не модифікуємо.

#### 4.9.3. Content

**`api::program.program`**
```
documentId      : uuid
slug*!          : uid(targetField=title)
title*          : string (i18n)
description     : text (i18n)
level*          : enum[A0..C2]
levelColor      : string         # hex (deprecated → derive from level)
coverImage      : media
teacher↳        : user-profile (role=teacher)  # primary owner
tags            : json           # ['Діти 7-11','Граматика']
status          : enum[draft,published,archived]  default "draft"
publishedAt     : datetime
ageMin          : int
ageMax          : int
priceUah        : biginteger     # копійки; null = безкоштовно
durationWeeks   : int
lessonsCount    : int default 0  # cached count
studentsCount   : int default 0  # cached count of active enrollments
ratingAvg       : decimal(3,2)
ratingCount     : int default 0
prerequisites↳  : program (manyToMany self)
organization↳   : organization
```

**`api::lesson-version.lesson-version`**
```
lesson↳*        : lesson
versionNumber*  : int
publishedAt     : datetime
createdBy↳      : user-profile
contentSnapshot : json *         # frozen copy of contentBlocks + engineSteps
hash            : string         # sha256 of snapshot for dedup
changeNote      : text
```

**`api::placement-test.placement-test`** (single-type per locale)
```
locale*         : enum[uk,en,ru]
title           : string
description     : text
sections        : json *         # [{level:'A1', items:[{...}]}]
passThreshold   : json           # {A1: 80, A2: 80, ...}
```

**`api::placement-test-attempt.placement-test-attempt`**
```
user↳*          : user-profile
startedAt       : datetime *
finishedAt      : datetime
answers         : json *         # [{itemId, answer}]
detectedLevel   : enum[A0..C2]
recommendedProgram↳: program
score           : json           # {A1: {correct:8, total:10}, ...}
```

#### 4.9.4. Schedule

**`api::availability-template.availability-template`**
```
teacher↳*       : user-profile
weekday*        : enum[mon,tue,wed,thu,fri,sat,sun]
startTime*      : time
endTime*        : time
timezone        : string
slotDurationMin : int default 60
breakBetweenMin : int default 0
effectiveFrom   : date
effectiveTo     : date
```

**`api::teacher-slot.teacher-slot`**  (materialized booking slot)
```
teacher↳*       : user-profile
startAt*        : datetime
endAt*          : datetime
status          : enum[free,reserved,booked,blocked]  default "free"
scheduledLesson↳: scheduled-lesson
```
Unique constraint: `(teacher, startAt)`.

#### 4.9.5. Homework

**`api::homework.homework`** (template)
```
documentId      : uuid
title*          : string (i18n)
description     : text (i18n)
content         : DZ homework-content (writing,translation,vocabulary,reading,listening,video,mixed)
lesson↳         : lesson
author↳*        : user-profile (role=teacher)
defaultDueDays  : int default 7
coinReward      : int default 5
xpReward        : int default 20
maxScore        : int default 100
autoGradable    : boolean default false
```

**`api::homework-assignment.homework-assignment`**
```
homework↳*      : homework
student↳*       : user-profile
assignedBy↳     : user-profile (role=teacher)
group↳          : group
assignedAt      : datetime *
dueAt           : datetime
status          : enum[new,in_progress,submitted,reviewed,returned,overdue]  default "new"
priority        : enum[low,normal,high]  default "normal"
notesTeacher    : text
```

#### 4.9.6. Mini-tasks

**`api::mini-task.mini-task`**
```
documentId      : uuid
title*          : string (i18n)
kind*           : enum[flashcards,quick-quiz,spelling,listening,pronounce,match]
payload         : DZ mini-task-payload
durationMin     : int default 5
coinReward      : int default 2
xpReward        : int default 10
author↳         : user-profile (role=teacher)
public          : boolean default false  # so other teachers can copy
```

**`api::mini-task-assignment.mini-task-assignment`**
```
miniTask↳*      : mini-task
student↳*       : user-profile
assignedBy↳     : user-profile
status          : enum[new,done,skipped]  default "new"
result          : json   # {correct:8, total:10, durationSec:184}
completedAt     : datetime
```

#### 4.9.7. Chat

**`api::chat-thread.chat-thread`**
```
documentId      : uuid
kind            : enum[direct,group,broadcast,parent-teacher]  default "direct"
title           : string         # required for group
group↳          : group          # if kind=group
participants↳   : user-profile (manyToMany, через ChatThreadMembership)
lastMessageAt   : datetime
lastMessagePreview: string
isArchived      : boolean default false
createdBy↳      : user-profile
```

**`api::chat-thread-membership.chat-thread-membership`**
```
thread↳*        : chat-thread
user↳*          : user-profile
role            : enum[member,owner,moderator]  default "member"
joinedAt        : datetime
leftAt          : datetime
muted           : boolean default false
lastReadMessageId: string
unreadCount     : int default 0
```
Unique: `(thread, user)`.

**`api::chat-message.chat-message`**
```
thread↳*        : chat-thread
sender↳*        : user-profile
text            : text
attachments     : media (multiple)
voiceClip       : component shared.audio-clip
replyTo↳        : chat-message
editedAt        : datetime
deletedAt       : datetime
status          : enum[sent,delivered,failed]  default "sent"
clientMessageId : string         # для idempotency / dedup при retry
```
Unique: `(thread, clientMessageId)` for dedup.

**`api::chat-read-receipt.chat-read-receipt`**
```
message↳*       : chat-message
user↳*          : user-profile
readAt          : datetime *
```
Unique: `(message, user)`.

#### 4.9.8. Gamification

**`api::xp-ledger.xp-ledger`** (повний клон CoinLedger зі своїм reason enum)
```
user↳*          : user-profile
amount*         : int           # XP не біг (max 10k/event)
reason*         : enum[lesson_completed,homework_completed,mini_task,daily_streak,perfect_score,review_received,admin_adjust]
sourceType      : string
sourceId        : string
balanceAfter*   : biginteger
idempotencyKey! : string
```

**`api::streak.streak`**
```
user↳!*         : user-profile (oneToOne)
currentDays     : int default 0
longestDays     : int default 0
lastActivityAt  : datetime
freezeTokens    : int default 0   # для "вибач, я хворів" — не ламає streak
freezeUsedAt    : datetime
```

**`api::leaderboard.leaderboard`** (matview-like, оновлюється cron)
```
user↳*          : user-profile
period*         : enum[daily,weekly,monthly,allTime]
periodKey*      : string         # "2026-W16", "2026-04"
xp              : biginteger
coins           : biginteger
lessonsDone     : int
rank            : int
computedAt      : datetime
```
Unique: `(user, period, periodKey)`.

**`api::badge.badge`** (definition)
```
slug*!          : string
title*          : string (i18n)
description     : text (i18n)
icon            : media
tier            : enum[bronze,silver,gold,platinum]
criteria        : json *         # rules engine описує умови
hiddenUntilEarned: boolean default false
```

**`api::badge-award.badge-award`**
```
user↳*          : user-profile
badge↳*         : badge
awardedAt       : datetime *
context         : json
```
Unique: `(user, badge)`.

**`api::achievement.achievement`** (one-time milestones — narrower ніж badge)
```
user↳*          : user-profile
slug*           : string         # "first_lesson_completed"
unlockedAt      : datetime *
context         : json
```
Unique: `(user, slug)`.

#### 4.9.9. Shop

**`api::shop-item.shop-item`**
```
documentId      : uuid
slug*!          : string
title*          : string (i18n)
description     : text (i18n)
category*       : enum[furniture,decor,outfit,special,consumable]
slot            : enum[wall,floor,ceiling,table,head,body,hand,bg,companion]  # depends on category
priceCoins      : biginteger
priceHard       : int            # premium currency
image*          : media
preview         : media
slotOffset      : json           # {x,y,scale} default 0,0,1
rarity          : enum[common,rare,epic,legendary]  default "common"
isCustom        : boolean default false
creator↳        : user-profile   # if isCustom
isLimited       : boolean default false
availableFrom   : datetime
availableTo     : datetime
maxOwnable      : int            # null = unlimited
tags            : json
status          : enum[draft,published,archived]  default "draft"
```

**`api::inventory.inventory`** (per user × shop-item)
```
user↳*          : user-profile
item↳*          : shop-item
quantity        : int default 1
acquiredAt      : datetime *
acquiredVia     : enum[purchase,gift,reward,custom-create,prize]
sourcePurchase↳ : payment
```
Unique: `(user, item)` — quantity++ для repeatable.

#### 4.9.10. Characters

**`api::character.character`** (template — fox, raccoon, etc.)
```
documentId      : uuid
slug*!          : string         # "fox"
name*           : string (i18n)
species         : string
defaultMood     : enum[CharacterMood]
emotions        : component character.emotion (repeatable, max 12)
rarity          : enum[common,rare,epic,legendary]
unlockCriteria  : json           # how to unlock by default (level, achievement)
priceCoins      : biginteger
isCustom        : boolean default false
creator↳        : user-profile
```

`character.emotion` (component): `{ slug:string, label:string i18n, image:media, animation:json }`.

**`api::character-instance.character-instance`** (per-user owned character з кастомізаціями)
```
user↳*          : user-profile
character↳*     : character
nickname        : string
equippedOutfits↳: outfit (manyToMany)
currentMood     : enum[CharacterMood]
unlockedAt      : datetime
isFavorite      : boolean default false
xpLevel         : int default 1   # character "leveling" майбутня механіка
```

**`api::outfit.outfit`** (категоризовані shop-items для одягання)
```
slug*!          : string
shopItem↳       : shop-item
slot            : enum[head,body,hand,accessory,bg]
overrideEmotion : string         # "smile" → custom outfit-specific emotion
compatibleSpecies: json          # ['fox','raccoon'] — empty = all
```

#### 4.9.11. Rooms

**`api::room-theme.room-theme`** (template)
```
slug*!          : string
title*          : string (i18n)
backgroundImage*: media
floorImage      : media
wallImage       : media
ambientSound    : media
defaultZones    : json           # [{slot:'wall', x:0.5, y:0.3}]
priceCoins      : biginteger
unlockLevel     : enum[A0..C2]   # null = always available
```

**`api::room.room`** (per user)
```
user↳*          : user-profile
theme↳*         : room-theme
name            : string default "My room"
isActive        : boolean default false
unlockedAt      : datetime *
sortOrder       : int default 0
```

**`api::placed-item.placed-item`**
```
room↳*          : room
item↳*          : shop-item
x*              : float          # 0..1 normalized
y*              : float          # 0..1 normalized
rotation        : float          # degrees
scale           : float default 1
zIndex          : int default 0
flipped         : boolean default false
placedAt        : datetime
```

#### 4.9.12. Library

**`api::enrollment.enrollment`**
```
student↳*       : user-profile
program↳*       : program
enrolledAt      : datetime *
enrolledBy↳     : user-profile
status          : enum[active,paused,completed,cancelled]  default "active"
progressPercent : int default 0
currentLessonIndex: int default 0
completedLessons↳: lesson (manyToMany)
expectedFinishAt: date
```
Unique: `(student, program)` for active enrollment.

#### 4.9.13. Payments

**`api::plan.plan`**
```
slug*!          : string         # "kids-monthly", "adult-quarterly"
title*          : string (i18n)
description     : text (i18n)
audience        : enum[kids,adult,parent,school]
billingPeriod   : enum[once,month,quarter,half-year,year]
priceUah        : biginteger
priceUsd        : biginteger
trialDays       : int default 0
features        : json (i18n)    # [{key,label,included:bool}]
maxStudents     : int            # for school plans
isActive        : boolean default true
sortOrder       : int default 0
```

**`api::subscription.subscription`**
```
user↳*          : user-profile   # буде owner; для kid — payer parent
beneficiary↳    : user-profile   # власне kid
plan↳*          : plan
status          : enum[trial,active,past_due,paused,cancelled,expired]  default "trial"
currentPeriodStart: datetime
currentPeriodEnd  : datetime
nextChargeAt    : datetime
cancelAtPeriodEnd: boolean default false
provider        : enum[stripe,liqpay,wayforpay,manual]
providerSubId!  : string
```

**`api::invoice.invoice`**
```
subscription↳   : subscription
payment↳        : payment
number*!        : string         # SEQ EB-2026-000001
issuedAt        : datetime *
amount          : biginteger
tax             : biginteger
total           : biginteger
pdfFile         : media
status          : enum[draft,issued,paid,void,refunded]  default "issued"
```

**`api::refund.refund`**
```
payment↳*       : payment
amount*         : biginteger     # may be partial
reason          : enum[customer_request,fraud,duplicate,billing_error,goodwill]
processedAt     : datetime
processedBy↳    : user-profile (role=admin)
providerRefundId!: string
status          : enum[pending,succeeded,failed]
```

**`api::promo-code.promo-code`**
```
code*!          : string
discountType    : enum[percent,fixed]
discountValue   : biginteger
appliesTo       : enum[any,plan]
plan↳           : plan
maxRedemptions  : int
redemptionsCount: int default 0
expiresAt       : datetime
audienceFilter  : json           # restrict до сегмента
isActive        : boolean default true
```

#### 4.9.14. Prizes

**`api::prize-case.prize-case`**
```
slug*!          : string
title*          : string (i18n)
description     : text (i18n)
icon            : media
priceCoins      : biginteger
priceHard       : int
drops           : DZ rewards (coins,xp,shop-item,custom-item,character,room-theme,outfit)
weights         : json *         # [{ component:'shop-item', weight:50 }, ...]
guarantees      : json           # {after:10, ensureRarity:'epic'}
isActive        : boolean default true
unlockLevel     : enum[A0..C2]
```

**`api::prize-drop.prize-drop`** (matérialized drop record)
```
case↳           : prize-case
prizeOpen↳      : prize-open
shopItem↳       : shop-item
character↳      : character
roomTheme↳      : room-theme
coins           : biginteger
xp              : int
rarity          : enum[common,rare,epic,legendary]
```

**`api::prize-open.prize-open`**
```
user↳*          : user-profile
case↳*          : prize-case
openedAt        : datetime *
priceCoinsPaid  : biginteger
priceHardPaid   : int
drops↳          : prize-drop (oneToMany)
clientOpId!     : string         # idempotency
```

#### 4.9.15. Notifications

**`api::notification.notification`**
```
recipient↳*     : user-profile
type*           : enum[lesson_reminder,homework_due,homework_reviewed,chat_message,coin_reward,achievement,system,parent_update,payment_paid,payment_failed]
title*          : string (i18n)
body            : text (i18n)
data            : json           # action route + payload
channels        : json           # ['in-app','push','email','sms']
priority        : enum[low,normal,high,urgent]  default "normal"
readAt          : datetime
sentAt          : datetime
deliveredAt     : datetime
clickedAt       : datetime
expiresAt       : datetime
```

**`api::mass-message.mass-message`**
```
title           : string
body            : text (i18n) *
audience        : DZ segments (role-is, level-between, program-is, group-is, last-active-before, custom-query)
channels        : json *
scheduledAt     : datetime
status          : enum[draft,scheduled,running,completed,cancelled,failed]  default "draft"
sentBy↳         : user-profile
sentCount       : int default 0
errorCount      : int default 0
```

**`api::mass-message-delivery.mass-message-delivery`** (per-recipient row)
```
massMessage↳*   : mass-message
recipient↳*     : user-profile
status          : enum[queued,sent,delivered,failed,opened,clicked]
sentAt          : datetime
deliveredAt     : datetime
errorMessage    : string
```

#### 4.9.16. Attendance

**`api::attendance.attendance`**
```
scheduledLesson↳*: scheduled-lesson
student↳*        : user-profile
status*          : enum[present,late,absent,excused,no_show]
lateMinutes      : int
markedAt         : datetime *
markedBy↳        : user-profile (role=teacher/admin)
note             : text
```
Unique: `(scheduledLesson, student)`.

#### 4.9.17. System

**`api::class-event.class-event`** (event sourcing для класних подій)
```
type*           : enum[lesson_created,lesson_updated,lesson_cancelled,lesson_completed,homework_assigned,homework_submitted,homework_reviewed,coin_awarded,xp_awarded,badge_awarded,enrollment_created,enrollment_completed]
actor↳          : user-profile
subject↳        : user-profile
relatedEntityType: string
relatedEntityId  : string
payload         : json
occurredAt      : datetime *
```
Use case: timeline на сторінці student'а.

**`api::feature-flag.feature-flag`**
```
slug*!          : string
description     : text
enabled         : boolean default false
rolloutPercent  : int default 0   # 0..100
audience        : json            # {roles:['teacher'], orgIds:[...], userIds:[...]}
variants        : json            # {control: 50, treatment: 50}
updatedBy↳      : user-profile
```

**`api::webhook.webhook`** (raw incoming webhook log — для debugging)
```
provider*       : enum[stripe,liqpay,wayforpay,postmark,ably,custom]
eventType       : string
signature       : string
isValid         : boolean
rawPayload      : json *
processed       : boolean default false
processedAt     : datetime
errorMessage    : string
relatedEntity   : string         # e.g. "payment:abcd"
receivedAt      : datetime *
```

### 4.10. Components — повний реєстр

#### Lesson-block (12)

| Slug                       | Поля                                                                                          |
|----------------------------|-----------------------------------------------------------------------------------------------|
| `lesson-block.text`        | body: rich-text(i18n), align: enum[left,center,right]                                         |
| `lesson-block.heading`     | level: enum[h1..h4], text: string(i18n)                                                       |
| `lesson-block.quiz-single` | prompt: text(i18n), options: json, correctIndex: int, explanation: text(i18n), media: shared  |
| `lesson-block.quiz-multi`  | prompt: text(i18n), options: json, correctIndices: json, ...                                  |
| `lesson-block.fill-blank`  | template: text(i18n) — `"I {{verb:am}} happy"`, casing: enum, allowMistakes: int             |
| `lesson-block.match-pairs` | pairs: json [{left, right}], shuffle: bool                                                    |
| `lesson-block.word-order`  | targetSentence: string(i18n), distractors: json                                               |
| `lesson-block.translate`   | source: text(i18n), targetLocale: enum, acceptedAnswers: json                                 |
| `lesson-block.image`       | media: shared.media-asset, layout: enum[full,half,inline]                                     |
| `lesson-block.video`       | media: media, durationSec: int, autoplay: bool                                                |
| `lesson-block.audio`       | media: shared.audio-clip                                                                       |
| `lesson-block.divider`     | style: enum[hairline,thick,dashed]                                                             |

#### Lesson-step (9 — engine для player)

| Slug                          | Спільні: prompt, explanation, coinReward, xpReward, timeLimitSec, media | Специфічні                              |
|-------------------------------|-------------------------------------------------------------------------|------------------------------------------|
| `lesson-step.theory`          | + body: rich-text(i18n)                                                 |                                          |
| `lesson-step.multiple-choice` | + options:json, allowMultiple:bool                                      |                                          |
| `lesson-step.fill-blank`      | + template:string(i18n), correctAnswers:json                            |                                          |
| `lesson-step.word-order`      | + targetSentence, distractors                                           |                                          |
| `lesson-step.match-pairs`     | + pairs                                                                  |                                          |
| `lesson-step.translate`       | + source, targetLocale, acceptedAnswers                                 |                                          |
| `lesson-step.image`           | + tagsExpected:json, captioning:bool                                    |                                          |
| `lesson-step.video`           | + checkpoints: json                                                      |                                          |
| `lesson-step.reading`         | + passage: rich-text(i18n), comprehensionQuestions: json                |                                          |

#### Homework-content (7)

| Slug                            | Поля                                                                |
|---------------------------------|---------------------------------------------------------------------|
| `homework-content.writing`      | prompt:text(i18n), minWords:int, rubric: json                       |
| `homework-content.translation`  | sourceText, targetLocale, acceptedAnswers                           |
| `homework-content.vocabulary`   | words: json [{en,uk,example,audio:media}]                            |
| `homework-content.reading`      | passage:rich-text, questions: json                                   |
| `homework-content.listening`    | audio:media, transcript:text, questions: json                        |
| `homework-content.video`        | video:media, questions: json, requireWatch: bool                     |
| `homework-content.mixed`        | sections: json — посилання на інші компоненти                         |

#### Mini-task-payload (6)

| Slug                          | Поля                                                                 |
|-------------------------------|----------------------------------------------------------------------|
| `mini-task-payload.flashcards`| cards: json [{front, back, audio:media}]                              |
| `mini-task-payload.quick-quiz`| questions: json [{prompt,options,correctIndex}]                       |
| `mini-task-payload.spelling`  | words: json [{word, hint, audio}]                                     |
| `mini-task-payload.listening` | audio: media, transcript, prompts                                     |
| `mini-task-payload.pronounce` | targetWord: string, audioReference: media, scoringStrictness: enum    |
| `mini-task-payload.match`     | pairs: json                                                            |

#### Rewards (DZ для prize-case)

`coins {amount}` · `xp {amount}` · `shop-item {item↳}` · `custom-item {item↳, isCustom}` · `character {character↳}` · `room-theme {theme↳}` · `outfit {outfit↳}`.

#### Segments (DZ для mass-message + notification audience)

| Slug                            | Поля                                                                |
|---------------------------------|---------------------------------------------------------------------|
| `segment.role-is`               | role: enum[kids,adult,teacher,parent]                               |
| `segment.level-between`         | from: enum[A0..C2], to: enum[A0..C2]                                 |
| `segment.program-is`            | program↳ : program                                                   |
| `segment.group-is`              | group↳ : group                                                       |
| `segment.last-active-before`    | datetime                                                             |
| `segment.last-active-after`     | datetime                                                             |
| `segment.subscription-status`   | status: enum                                                         |
| `segment.custom-query`          | jsonQuery: json (admin only, validated)                              |

### 4.11. Permission matrix (final canonical)

| Action / Endpoint                         | Public | Kids | Adult | Teacher | Parent | Admin |
|-------------------------------------------|--------|------|-------|---------|--------|-------|
| GET /programs (published)                 | ✓      | ✓    | ✓     | ✓       | ✓      | ✓     |
| GET /lessons (own enrollments)            | —      | ✓    | ✓     | ✓ (own) | child  | ✓     |
| POST /lessons                             | —      | —    | —     | ✓       | —      | ✓     |
| PUT /lessons/:id                          | —      | —    | —     | author  | —      | ✓     |
| POST /lessons/:id/complete                | —      | self | self  | —       | —      | ✓     |
| GET /scheduled-lessons (own)              | —      | self | self  | own     | child  | ✓     |
| POST /scheduled-lessons                   | —      | —    | —     | ✓       | —      | ✓     |
| GET /homework-submissions                 | —      | self | self  | reviewer| child  | ✓     |
| POST /homework-submissions                | —      | self | self  | —       | —      | ✓     |
| PUT /homework-submissions/:id (review)    | —      | —    | —     | reviewer| —      | ✓     |
| GET /coin-ledger/me                       | —      | ✓    | ✓     | ✓       | child  | ✓     |
| POST /coin-ledger (manual)                | —      | —    | —     | —       | —      | ✓     |
| POST /shop/purchase                       | —      | self | self  | —       | for-kid| ✓     |
| GET /chat/threads                         | —      | participant | participant | participant | participant | ✓ |
| POST /chat/messages                       | —      | thread-member | thread-member | thread-member | thread-member | ✓ |
| POST /mass-messages                       | —      | —    | —     | own students | — | ✓ |
| POST /payments/checkout                   | —      | —    | self  | —       | for-child | ✓ |
| GET /audit-logs                           | —      | —    | —     | own actions | — | ✓ |
| Impersonate                               | —      | —    | —     | —       | —      | ✓ (logged) |
| Feature flags edit                        | —      | —    | —     | —       | —      | ✓     |

---

## 5. API surface

### 5.1. REST (Strapi auto + custom)

Базовий URL: `https://api.englishbest.com/api` (prod), `https://api-staging.englishbest.com/api`.

#### 5.1.1. Публічні (auth required тільки якщо позначено 🔒)

Більшість ендпоінтів Strapi генерує автоматично з content-types:

```
GET    /api/lessons                         🔒  filter: level, program, status
GET    /api/lessons/:documentId             🔒
POST   /api/lessons                         🔒 teacher/admin
PUT    /api/lessons/:documentId             🔒 author/admin
DELETE /api/lessons/:documentId             🔒 author/admin

GET    /api/programs                        (публічне для каталогу)
GET    /api/programs/:documentId/lessons    🔒
POST   /api/programs/:documentId/enroll     🔒 student

GET    /api/homework-assignments            🔒 (scope: user)
GET    /api/homework-submissions            🔒 (scope: user or teacher)
POST   /api/homework-submissions            🔒 student
PUT    /api/homework-submissions/:id        🔒 student (if status=draft) or teacher

GET    /api/scheduled-lessons               🔒 (scope: user)
POST   /api/scheduled-lessons               🔒 teacher/admin
PUT    /api/scheduled-lessons/:id           🔒 teacher/admin
POST   /api/scheduled-lessons/:id/cancel    🔒 teacher/student/admin
POST   /api/scheduled-lessons/:id/reschedule 🔒 teacher/admin

GET    /api/coin-ledger/me                  🔒 student
GET    /api/coin-ledger/:userId             🔒 teacher-of or parent-of or admin
POST   /api/coin-ledger                     🔒 admin (adjustments only)

GET    /api/notifications/me                🔒
PUT    /api/notifications/:id/read          🔒

GET    /api/shop/items                      🔒 student (public read)
POST   /api/shop/purchase                   🔒 student  body: { itemId, quantity }

POST   /api/payments/checkout               🔒 creates checkout session, returns providerUrl
POST   /api/payments/webhook/:provider      (public, HMAC-verified) → queue

POST   /api/upload                          🔒 media
```

#### 5.1.2. Custom endpoints (server-side only logic)

| Route                                             | Method | Purpose                                                              |
|---------------------------------------------------|--------|----------------------------------------------------------------------|
| `/api/auth/register-kid`                          | POST   | створити kid-акаунт під підтвердженим parent consent                 |
| `/api/auth/invite-teacher/accept`                 | POST   | прийняти invite link                                                 |
| `/api/placement-test/start`                       | POST   | створити attempt для поточного user                                  |
| `/api/placement-test/submit`                      | POST   | submit answers → auto-score → assign level + recommended program     |
| `/api/homework/:id/autograde`                     | POST   | queue auto-scoring (objective items)                                 |
| `/api/lessons/:id/complete`                       | POST   | idempotent, кредитить coins/xp, apдейтить streak                     |
| `/api/mini-tasks/:id/complete`                    | POST   | idempotent credit                                                    |
| `/api/characters/:id/equip`                       | POST   | equip/unequip                                                        |
| `/api/rooms/:id/layout`                           | PUT    | bulk update PlacedItem[]                                             |
| `/api/shop/purchase`                              | POST   | atomically debit coins + grant item                                  |
| `/api/prizes/open`                                | POST   | opens a loot box, returns drop                                       |
| `/api/students/:id/timeline`                      | GET    | aggregated feed: lessons + homework + chat + payments (teacher view) |
| `/api/analytics/teacher/me`                       | GET    | precomputed dashboard metrics                                        |
| `/api/analytics/admin/platform`                   | GET    | precomputed admin dashboard                                          |
| `/api/leaderboard`                                | GET    | cached 5 min, pagination                                             |
| `/api/chat/threads/:id/messages`                  | GET    | paginated                                                            |
| `/api/chat/threads/:id/messages`                  | POST   | send; triggers WS broadcast                                          |
| `/api/chat/threads/:id/read`                      | POST   | mark all as read                                                     |
| `/api/mass-messages`                              | POST   | admin creates, server expands audience, queues individual deliveries |
| `/api/gdpr/export/me`                             | POST   | async job → email link                                               |
| `/api/gdpr/delete/me`                             | POST   | async soft-delete + anonymize                                        |

#### 5.1.3. Query conventions

- **Pagination**: `?pagination[page]=1&pagination[pageSize]=25` (default 25, max 100).
- **Filtering**: Strapi qs format: `?filters[status][$eq]=published`.
- **Sorting**: `?sort=startAt:desc`.
- **Populate**: `?populate[lesson][populate]=coverImage` (пояснити явно що populate — 1 level max для публічних, 2-3 для server-side).
- **Locale**: `?locale=uk` (або header `Accept-Language`).
- **Field selection**: `?fields=title,slug,level`.
- **Response shape**:

```json
{
  "data": {
    "documentId": "...",
    "attributes": { ... },
    "meta": { ... }
  },
  "meta": {
    "pagination": { "page": 1, "pageSize": 25, "pageCount": 4, "total": 87 }
  }
}
```

#### 5.1.4. Error format

```json
{
  "error": {
    "status": 422,
    "name": "ValidationError",
    "message": "answers[2].value is required",
    "details": {
      "errors": [
        { "path": ["answers", 2, "value"], "message": "required", "name": "ValidationError" }
      ]
    }
  },
  "requestId": "req_1x8Zj..."
}
```

### 5.2. WebSocket / realtime

**Транспорт**: Ably (managed, presence, channel permissions, webhook). Альтернатива — self-hosted Socket.IO за nginx + redis-adapter.

**Channels**:

| Channel                              | Presence | Use                                                 |
|--------------------------------------|----------|-----------------------------------------------------|
| `user:{userId}`                      | yes      | особисті нотифікації (homework reviewed, message)   |
| `thread:{threadId}`                  | yes      | chat — нові повідомлення + typing + seen            |
| `lesson-live:{scheduledLessonId}`    | yes      | під час онлайн-уроку: presence, shared pointer      |
| `group:{groupId}`                    | yes      | group chat / broadcast                              |
| `admin:alerts`                       | no       | адмін-сповіщення (payment failed, spike in errors)  |
| `leaderboard`                        | no       | push updated top-10 кожні 60с                       |

**Events** (приклади):

```json
// on thread:{id}
{ "type": "message.new", "payload": { "messageId": "...", "fromUserId": "...", "text": "..." } }
{ "type": "message.read", "payload": { "messageId": "...", "readByUserId": "...", "at": "..." } }
{ "type": "typing", "payload": { "userId": "...", "isTyping": true } }

// on user:{id}
{ "type": "notification.new", "payload": { "id": "...", "title": "...", "route": "..." } }
{ "type": "coin.changed", "payload": { "delta": 10, "balance": 1240, "reason": "lesson_completed" } }

// on lesson-live:{id}
{ "type": "participant.join", "payload": { "userId": "...", "role": "teacher" } }
{ "type": "cursor.move", "payload": { "blockIndex": 3, "x": 0.54, "y": 0.21 } }
```

**Security**: Ably tokens issuer — Strapi `/api/realtime/token`. Token має capability per channel (наприклад, student отримує `thread:{own-id}` з `subscribe,presence` але не `publish-history`).

### 5.3. Webhooks (incoming)

| Provider        | Endpoint                                       | Signature                 |
|-----------------|------------------------------------------------|---------------------------|
| Stripe          | `/api/payments/webhook/stripe`                 | `Stripe-Signature` header |
| LiqPay          | `/api/payments/webhook/liqpay`                 | `X-Signature` HMAC        |
| WayForPay       | `/api/payments/webhook/wayforpay`              | MD5 merchantSignature     |
| Postmark        | `/api/email/webhook`                           | HMAC basic auth           |
| Ably            | `/api/realtime/webhook`                        | token                     |
| Ably webhook forwarder (for chat persistence) | — (queue job)    | —                         |

**Pattern**: прийняти, HMAC-перевірити, записати raw payload у `webhook_event` table, відповісти `200` одразу → обробку делегувати job у BullMQ. Це гарантує idempotency (за allowed retries) та ізолює API від падінь downstream.

### 5.4. File uploads

- **Direct-to-R2** через pre-signed PUT URL: клієнт запитує `/api/upload/presign` → CMS повертає URL + fields + finalAssetId → клієнт PUT напряму в R2 → після success викликає `/api/upload/commit` з assetId.
- Малі файли (< 2MB, наприклад, avatar) — через звичайний Strapi `/api/upload` (multipart).
- **Allowed mimes**: images (jpeg/png/webp/avif), audio (mp3/wav/aac), video (mp4/webm), docs (pdf).
- **Max sizes**: image 10MB, audio 25MB, video 200MB (повертаємо 413 при перевищенні з `providerPresign` лімітами).
- **Virus scan**: ClamAV job на hook `afterCreate` для `media` record.
- **Image optimization**: Next/Image + Strapi media responsive formats (thumbnail, small, medium, large); для kids-контенту використовуємо blurred placeholder.

### 5.5. Rate limiting

| Route group                 | Limit                           |
|-----------------------------|---------------------------------|
| `/api/auth/*`               | 10 req/min/IP, 30 req/hour/IP   |
| `/api/payments/checkout`    | 5 req/min/user                  |
| `/api/chat/*/messages POST` | 30 msg/min/user, 3 msg/sec burst |
| `/api/shop/purchase`        | 10 req/min/user                 |
| `/api/upload/presign`       | 60/min/user                     |
| Anonymous read (programs)   | 60/min/IP                       |
| Default authed              | 300/min/user                    |

Redis-based token bucket; 429 відповідь з `Retry-After`.

### 5.6. Versioning

- Header `X-Api-Version: 2026-04-01` (дата у форматі YYYY-MM-DD).
- Сервер вибирає поведінку за найближчою попередньою версією.
- Breaking changes зобовʼязані мати нову дату; всередині одного major semver.
- Next.js фронт завжди шле поточний `X-Api-Version` з `.env`.

---

## 6. Auth, roles & permissions

### 6.1. Identity model

- Один `users-permissions.user` = одна email-адреса. Kids без email — мають parent-verified record з `email = kid-{uuid}@internal.englishbest.com` placeholder або без email, але з `phoneParent` на UserProfile parent'а.
- Розділяємо **Identity** (users-permissions.User: email, password, provider) vs **Profile** (UserProfile: displayName, avatar, role etc).

### 6.2. Token flow

- **Access token**: JWT 15 min TTL, signed HS256 із `JWT_SECRET`, payload includes `sub`, `role`, `orgId`, `tokenVersion`.
- **Refresh token**: 30 days, opaque random, stored hashed (`argon2id`) у `refresh_tokens` table з `userId, tokenHash, expiresAt, revokedAt, deviceId, userAgent, ip`.
- **Rotation**: кожен /refresh call створює новий refresh + invalidates попередній (reuse detection — якщо старий вжив повторно, revoke всі активні для user + alert).
- **Revoke all**: bump `tokenVersion` на user → access tokens invalid при наступній перевірці (claim check).
- **Device limit**: max 5 активних refresh sessions/user.

### 6.3. OAuth / social

- Google (Workspace + personal) — для teacher/adult/parent.
- Apple Sign In — iOS / mobile future.
- Email magic link — альтернатива password для adult/parent (короткі сесії, для convenience).
- Kids — **ніколи** з social login. Тільки parent-created + PIN.

### 6.4. Roles

Strapi users-permissions `Role`:

- `Public` — лише GET публічного: `program` list, `lesson` preview, `landing`.
- `Kids` — доступ до власних lessons, shop (self), rooms (self), characters (self), friend-list (one-way, parent-approved).
- `Adult` — weren lessons/homework, self-study program, chat з teacher, profile edit, payments (self).
- `Teacher` — CRUD Lesson/Homework (own), review submissions, students (of own groups), calendar (own), chat (with assigned students+parents), mass-message (to own students), analytics (own).
- `Parent` — read-only of child activity, chat з teacher, payments (for child), payment history, prize purchases for child.
- `Admin` — повний CRUD, імперсонейт, settings, feature flags, audit log read.

### 6.5. Policies (fine-grained)

Written в `src/policies/`:

- `is-authenticated` — базова.
- `has-role` — `has-role(['teacher','admin'])`.
- `is-owner` — `ctx.state.user.id === entity.userId` (generic).
- `is-teacher-of-student` — перевіряє relation Group→Members через teacher.
- `is-parent-of-kid` — перевіряє ParentLink.
- `is-author` — `entity.author.id === ctx.state.user.id`.
- `is-organization-member` — `entity.organization.id === ctx.state.user.profile.organization.id` (tenant guard).
- `can-impersonate` — `admin` role + flag `impersonation.allowed`.

Застосовуються через `config.policies` у route файлах:

```ts
// src/api/homework-submission/routes/custom.ts
export default {
  routes: [
    {
      method: 'PUT',
      path: '/homework-submissions/:id',
      handler: 'homework-submission.update',
      config: {
        policies: [
          'global::is-authenticated',
          'api::homework-submission.can-edit-submission' // is-owner OR is-teacher-of-student
        ]
      }
    }
  ]
};
```

### 6.6. Field-level security

Sensitive полей, які **ніколи** не видаємо назовні:

- `users-permissions.user.password`, `resetPasswordToken`, `confirmationToken` (Strapi robots це за замовчуванням).
- `user-profile.dateOfBirth` → видаємо лише self, parent-of, teacher-of, admin.
- `user-profile.phone` → self + admin.
- `payment.providerData` → admin only.
- `refresh_tokens.*` — ніколи публічно.

Реалізуємо через controller override або middleware `sanitize-response`:

```ts
// src/api/user-profile/controllers/user-profile.ts
const sanitize = (entity, requester) => {
  const keep = new Set(['id','documentId','firstName','lastName','displayName','avatar','locale','level']);
  if (requester?.id === entity.user?.id) keep.add('phone').add('dateOfBirth').add('email');
  if (requester?.role === 'admin') return entity;
  return Object.fromEntries(Object.entries(entity).filter(([k]) => keep.has(k)));
};
```

### 6.7. COPPA / дитячі дані

- kids < 13 (або < 16 EU) → обов'язковий `parentalConsentBy` на user-profile.
- Дані kids: мінімальний набір (firstName, avatar, level, companion). NO email, NO phone, NO free-text у profile.
- Chat для kids: **curated**, parent може бачити будь-які thread'и.
- Marketing opt-in disabled by default для kids.
- Video/audio recordings — не зберігаємо persistent; live lesson recordings — тільки з teacher+parent consent flag.
- Data export/delete — ініціюється parent на поведінку kid.

### 6.8. CSRF & session

- API — stateless JWT; CSRF не потрібен.
- Admin-панель Strapi — окремий cookie-based session з SameSite=Strict.
- Cookie-based sessions для Next.js server components — HttpOnly + Secure + SameSite=Lax для refresh token (не access), щоб SSR міг видобути access-token в-mid-flight.

### 6.9. Impersonation (admin)

- Admin може на 30 хв увійти як інший user з дозволом через `/api/auth/impersonate/:userId` + reason.
- Створюється окремий token з claim `act: { sub: adminId }` — всі audit log'и записуються під impersonator.
- UI-індикатор в banner: "Ви у режимі імперсонації {name}".

---

## 7. Frontend adaptation — Next.js → Strapi

### 7.1. Шари

```
app/                          # Next.js App Router (existing)
├─ (onboarding)/
├─ (kids)/
├─ dashboard/
├─ api/                       # Next.js route handlers (BFF proxy для auth-sensitive)
│  ├─ auth/[...auth]/route.ts
│  └─ webhook/[provider]/route.ts
lib/
├─ api/                       # NEW: Strapi client
│  ├─ client.ts               # fetch wrapper з auth, retry, error mapping
│  ├─ auth.ts
│  ├─ lessons.ts
│  ├─ homework.ts
│  ├─ scheduled-lessons.ts
│  ├─ payments.ts
│  ├─ realtime.ts             # Ably init
│  └─ ...
├─ hooks/                     # SWR / React Query wrappers
│  ├─ use-me.ts
│  ├─ use-lesson.ts
│  ├─ use-homework.ts
│  └─ ...
├─ auth/
│  ├─ context.tsx             # AuthProvider
│  ├─ guards.tsx              # <RequireRole>, <RequireAuth>
│  └─ tokens.ts               # refresh logic
├─ mocks/                     # KEPT, but only for tests/Storybook
└─ kids-store.ts              # переписується на server API + IDB cache layer
```

### 7.2. Client (`lib/api/client.ts`)

Обов'язки:

1. Base URL з env (`NEXT_PUBLIC_API_URL`).
2. Додати `Authorization: Bearer <accessToken>` з AuthContext.
3. На 401 — спробувати refresh один раз, повторити запит; якщо знову 401 — logout.
4. Content-Type + JSON handling, upload підтримка (FormData).
5. Consistent `ApiError` з `requestId`, `code`, `fieldErrors`.
6. AbortController для cancellations (корисно в useEffect).
7. Трасування: send `X-Client-Trace-Id` (UUID v4) на кожен запит → корелюється з Sentry.

### 7.3. State / data-fetching

- **React Query v5** — перший вибір (кешування, invalidation, optimistic updates, offline).
- SSR — використовуємо `HydrationBoundary` + prefetch на сервері (для SEO сторінок: landing, program catalog).
- Realtime — через Ably + `queryClient.setQueryData` для оновлення в реальному часі (chat, notifications, coin balance).
- Forms — react-hook-form + zodResolver (zod schemas з `packages/shared`).

### 7.4. Auth UX

- Onboarding wizard: email+password → role pick → role-specific fields → consent → placement test (якщо student) → welcome.
- Magic link flow: email → click → `/auth/verify?token=...` → exchange → set cookies.
- "Remember me" → refresh TTL 30d, без — 7d.
- Logout → revoke refresh + clear cookies + `queryClient.clear()`.
- Silent refresh — фоновий, якщо access expires in < 60s.

### 7.5. Міграція сторінок (mock → API)

Жодна сторінка не звертається до `lib/teacher-mocks`, `mocks/*`, `lib/library-mocks` напряму. Замість цього:

| Було                                                           | Стане                                                                                                |
|----------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| `import { MOCK_STUDENTS } from '@/lib/teacher-mocks'`          | `const { data: students } = useStudents({ teacherId })`                                              |
| `import { MOCK_LIBRARY } from '@/lib/teacher-mocks'`           | `const { data: lessons } = useTeacherLibrary({ authorId })`                                          |
| `MOCK_HOMEWORK.filter(h => h.status === 'new')`                | `useHomeworkAssignments({ studentId, status: 'new' })`                                               |
| `LIBRARY_PROGRAMS`                                             | `usePrograms({ status: 'published' })`                                                               |
| `kids-store.getState()`                                        | `useKidsState()` — hydrate з API + IDB для offline cache                                             |
| `localStorage.demo_role`                                       | `user.role` з AuthContext; dev-тумблер для QA лишаємо за feature flag `__DEV_ROLE_SWITCH__`          |

Порядок замін (без одночасного масового переписування):

1. **F8 — Client shim layer**: `lib/data/*` експортує ті ж імена, що раніше (`getStudents()`), але всередині переходить з mock на API feature-flag `USE_API`.
2. **F9 — Migration батчами**: сторінка за сторінкою переводимо з `MOCK_*` на `useX()`. Починаємо з readonly сторінок (teacher analytics), потім mutations.
3. **F10 — Kids subsystem**: заміна `kids-store.ts` на гібридну schema (IDB як offline cache, server як source of truth, queue-замір для коли офлайн).
4. **F11 — видалення mocks**: залишаємо лиш `mocks/` для Storybook / unit-тестів (з чіткою позначкою `@storybook-only`).

### 7.6. Optimistic updates

Обов'язково для:

- Chat — message.send (rollback на помилку + retry button).
- Coin balance — при complete lesson / mini-task.
- Room layout drag & drop — PUT debounced 800ms, optimistic miyi preview.
- Character equip/unequip.
- Homework draft autosave.

Схема через React Query:

```ts
const mutation = useMutation({
  mutationFn: (msg) => api.chat.send(threadId, msg),
  onMutate: async (msg) => {
    await queryClient.cancelQueries({ queryKey: ['thread', threadId] });
    const prev = queryClient.getQueryData(['thread', threadId]);
    queryClient.setQueryData(['thread', threadId], (old) => addOptimistic(old, msg));
    return { prev };
  },
  onError: (_err, _msg, ctx) => queryClient.setQueryData(['thread', threadId], ctx.prev),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['thread', threadId] })
});
```

### 7.7. Error handling UX

- `ApiError` → глобальний toast + inline field errors (for 422).
- 401 → silent refresh; якщо fails — redirect на /login з `?returnTo`.
- 403 → inline `<NoAccess reason=... />` компонент.
- 5xx → toast "Щось пішло не так. Спробуйте ще раз" + Sentry event.
- Offline → banner "Ви offline, зміни збережуться і синхронізуються".

### 7.8. Kids offline contract (special)

- Ігрові дії (place item, equip character, view room) працюють повністю offline.
- Синхронізація фонова:
  - кожна mutation → `kids-store-queue` (IDB queue) з `opId`, `type`, `payload`, `clientTime`.
  - на online → sync-loop відправляє по одному до `/api/kids/sync` з idempotencyKey=opId.
  - server: merge за LWW-per-field з server-time; конфлікти → keep-both for items, last-wins для rooms layout (тому що overlapping drag-drop неминуче).
- Страшна деталь: coin balance — single source of truth server. Offline ми показуємо **очікуваний** balance (optimistic), але на reconnect synchronizaція пересвірює → rollback якщо server відкинув покупку.

### 7.9. SSR vs CSR

| Сторінка                          | Mode      | Why                                    |
|-----------------------------------|-----------|----------------------------------------|
| `/` landing                       | RSC + ISR | SEO, cached                            |
| `/programs`                       | RSC + ISR | SEO                                    |
| `/programs/[slug]`                | RSC + ISR | SEO, revalidate on publish webhook     |
| `/dashboard/*`                    | client    | auth-gated                             |
| `/auth/*`                         | client    | forms, interactive                     |
| `/api/*` route handlers           | server    | webhook + auth callbacks               |
| Kids ігрові сторінки              | client    | canvas/DnD, offline IDB                |

### 7.10. i18n

- `next-intl` з катал.ми `messages/uk.json`, `messages/en.json`, `messages/ru.json`.
- Keys локалізовуються для UI-строк; контент (назви уроків) приходить з Strapi вже локалізованим.
- URL pattern: `/uk/...`, `/en/...`; дефолт uk. Redirect на основі `Accept-Language` при першому заході.

---

## 8. Non-functional: infra, DevOps, observability, security, GDPR

### 8.1. Середовища

| Env         | URL pattern                              | БД                               | R2 bucket                  |
|-------------|------------------------------------------|----------------------------------|----------------------------|
| local       | `http://localhost:3000` + `:1337`        | docker-compose postgres          | minio                      |
| staging     | `https://staging.englishbest.com`        | managed PG (neon/railway), small | `eb-staging-media`         |
| production  | `https://app.englishbest.com`            | managed PG (neon/aws rds), HA    | `eb-prod-media`            |
| preview     | ephemeral per-PR (vercel + PR-db)        | shared preview PG                | `eb-preview-media-${pr}`   |

### 8.2. Інфраструктура

- **Next.js** — Vercel (edge + serverless); альтернатива — Cloudflare Pages + Workers.
- **Strapi** — VPS або managed (Railway, Render, Fly.io); Docker image з pinned Node LTS.
- **PostgreSQL** — Neon (branching), AWS RDS (prod), або Supabase DB (якщо захочемо edge Postgres).
- **Redis** — Upstash (serverless) або managed Redis.
- **Queues** — BullMQ over Redis, worker як окремий процес на тому ж хості що Strapi.
- **Realtime** — Ably (plan scale by MAU).
- **Storage** — Cloudflare R2 (S3 compatible, zero egress, CDN included).
- **Email** — Postmark (transactional) + Mailchimp (marketing).
- **SMS** — Twilio.
- **Monitoring** — Sentry (errors + performance), BetterStack (logs + uptime), Grafana (metrics via Prometheus).
- **CDN** — Vercel Edge / Cloudflare; custom image optimizer через `@vercel/image` або CF Images.

### 8.3. CI/CD

GitHub Actions:

```
.github/workflows/
├─ ci-web.yml                # lint + typecheck + unit test + Storybook build (Next.js)
├─ ci-cms.yml                # lint + typecheck + Strapi schema compile + unit tests
├─ e2e.yml                   # Playwright проти staging
├─ db-migration-check.yml    # на PR — dry-run schema diff vs staging DB
├─ deploy-staging.yml        # on push main → deploy staging
├─ deploy-prod.yml           # manual, з required approvals
└─ nightly.yml               # full E2E, backup integrity check, seeds refresh
```

Pipeline для CMS (обов'язково!):
1. Build Strapi → generate schema migrations → diff vs staging.
2. Якщо diff містить destructive changes (drop column, drop table, enum-remove) — вимагаємо label `breaking-db-change` + ручне approval.
3. Deploy у staging → smoke test → pause → manual promote to prod.
4. Prod deploy → pre-migration snapshot (PG backup) → migrate → warmup → rolling restart.
5. На випадок rollback — zero-downtime revert: deploy попередньої image + restore snapshot (за 15хв max).

### 8.4. Observability

- **Logs**: структуровані JSON, sink — BetterStack. Поля: `requestId`, `userId`, `role`, `path`, `status`, `durationMs`.
- **Metrics** (Prometheus + Grafana): p50/p95/p99 latency per route, error rate, DB pool usage, queue depth, active WS connections, coin ledger TPS, shop-purchase TPS.
- **Tracing**: OpenTelemetry → Grafana Tempo / Honeycomb; trace через Next.js → CMS → DB → external (Stripe, Ably).
- **Alerts**: p95 > 500ms за 10 хв, error rate > 2% за 5 хв, queue depth > 1000, coin ledger errors, payment webhook failures, disk > 80%.
- **Dashboards** (Grafana):
  - Platform health: 4 золотих сигнали.
  - Business: DAU, lesson completions/day, payments revenue/day, signups/day.
  - Payments deep-dive: по провайдерах, failure reasons, refund rate.
  - Chat: active threads, p95 message delivery.

### 8.5. Backup & disaster recovery

- PG: continuous WAL archiving (neon/rds native), PITR до 30 днів. Snapshot щодня → окремий регіон.
- R2: versioning on, lifecycle policy (non-current 90d → delete).
- Redis: не backup (ефемерний); ledger stateful — в PG.
- Quarterly DR drill: restore staging з production snapshot за < 1 год.
- RTO: 1 год, RPO: 5 хв.

### 8.6. Security checklist

- [ ] Secrets — тільки через Vault/Doppler, ніколи в git.
- [ ] Strapi admin — whitelisted IP + MFA для admin users.
- [ ] Rate limiting на всі mutation.
- [ ] CSP заголовки (`script-src 'self' ...`), HSTS, Referrer-Policy.
- [ ] CORS whitelist (app.englishbest.com + localhost у dev).
- [ ] SQL injection — ORM only, ніколи raw string concat.
- [ ] Upload — file-type sniff by magic bytes (не довіряємо mime від клієнта).
- [ ] Dependency audit у CI (`npm audit --audit-level=high`); Snyk / Dependabot.
- [ ] SAST (Semgrep rules for Next.js + Strapi).
- [ ] Secrets rotation: JWT secret, DB password, webhook HMAC — 90 днів.
- [ ] SSO для внутрішніх інструментів (Grafana, Sentry, BetterStack) — через Google Workspace.
- [ ] Incident runbook у `docs/RUNBOOK.md`.
- [ ] Penetration test перед прод-запуском (external vendor) + bug-bounty програма через HackerOne.

### 8.7. GDPR / privacy

- **Data export**: `/api/gdpr/export/me` → job збирає всі дані user'а (profile, lessons, homework, payments, chat) у ZIP → email signed link (24h TTL).
- **Right to erasure**: `/api/gdpr/delete/me` → soft-delete profile (status=deleted, deletedAt=now, PII anonymized); coin/xp ledgers залишаються для аудиту з anonymous `deleted-user-{uuid}`.
- **Consent tracking**: `consentTermsAt`, `consentPrivacyAt` на user-profile; зміна Terms → trigger re-consent modal next login.
- **Cookie banner**: GDPR-compliant, категорії (essential / analytics / marketing) зі збереженням вибору в `consent_log`.
- **DPA** з усіма підрядниками (Strapi Cloud / Railway / Neon / Postmark / Sentry).
- **Data residency**: EU region для PG + R2 (Cloudflare Amsterdam).

### 8.8. Performance budgets

- LCP < 2.5s on 4G for /dashboard.
- API p95 < 300ms.
- Chat message round-trip p95 < 200ms (same region).
- Bundle size first-load JS < 200 KB gz per route.
- Lighthouse a11y score >= 95.
- Image delivery: WebP/AVIF; Lazy-load off-screen.

### 8.9. Feature flags

- Through `feature-flag` content-type (див §3.15) + Strapi admin UI.
- Client — SDK `lib/flags.ts`: читає з `/api/flags` (cached 30s), evaluate per user.
- Приклад: `chat.voice_messages.enabled` — roll out 10% → 50% → 100%.

---

## 9. Data migration, seeding & fixtures

### 9.1. Seed script architecture

Файл `apps/cms/src/seeds/` містить idempotent seeds:

```
seeds/
├─ 00-roles-and-permissions.ts   # Strapi roles + policies
├─ 01-organizations.ts           # default organization
├─ 02-admins.ts                  # bootstrap admin user
├─ 03-programs.ts                # LIBRARY_PROGRAMS (з lib/library-mocks.ts)
├─ 04-lessons.ts                 # MOCK_LIBRARY (з lib/teacher-mocks.ts)
├─ 05-shop-catalog.ts            # SHOP_ITEMS + DEFAULT_CATALOG з lib/shop-catalog.ts
├─ 06-characters.ts              # fox + raccoon з lib/characters.ts
├─ 07-room-themes.ts             # DEFAULT_ROOM_THEMES
├─ 08-prize-cases.ts             # LOOT_BOX_CASES
├─ 09-teachers.ts                # MOCK_TEACHERS (з mocks/user.ts, admin/teachers page)
├─ 10-students-demo.ts           # опціонально, тільки staging
├─ 11-email-templates.ts         # welcome, homework_reviewed, payment_paid тощо
├─ 12-feature-flags.ts           # default flags
└─ 99-verify.ts                  # sanity check (counts, foreign keys, required relations)
```

Кожен seed файл експортує `up(strapi)` + `down(strapi)` — останнє робить безпечний rollback (delete seeded with marker `meta.source: 'seed'`).

CLI:

```bash
# локально
yarn cms seed          # запуск всіх
yarn cms seed 03,04    # вибірково
yarn cms seed:reset    # down всіх
yarn cms seed:verify   # лише 99-verify

# CI (staging deploy)
node ./scripts/seed.js --env=staging --files=00,01,02
```

### 9.2. Mock → Strapi mapping (канонічна таблиця)

| Mock source                                         | Strapi content-type                                                             | Notes                                                                            |
|-----------------------------------------------------|---------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| `lib/library-mocks.ts::LIBRARY_PROGRAMS`            | `api::program.program` (+i18n)                                                  | `teacherName/teacherPhoto` → relation `owner → user-profile`                     |
| `lib/teacher-mocks.ts::MOCK_LIBRARY` (LibraryLesson)| `api::lesson.lesson` з `contentBlocks` DZ                                       | `LessonBlock` → DZ components `lesson-block.*`                                   |
| `lib/teacher-mocks.ts::MOCK_STUDENTS`               | `api::user-profile.user-profile` (role=kids/adult) + `kids-profile`            | `companionAnimal`, `level`, `streakDays`, `ownedItemIds` → KidsProfile fields    |
| `lib/teacher-mocks.ts::MOCK_GROUPS`                 | `api::group.group`                                                              | `studentIds` → manyToMany relation                                               |
| `lib/teacher-mocks.ts::MOCK_SCHEDULE`               | `api::scheduled-lesson.scheduled-lesson`                                        | Зміна: `startAt` ISO datetime замість hour-only                                  |
| `lib/teacher-mocks.ts::MOCK_HOMEWORK`               | `api::homework.homework` + `homework-assignment`                                | 1 homework → N assignments (per student)                                         |
| `lib/teacher-mocks.ts::MOCK_MINI_TASKS`             | `api::mini-task.mini-task` + `mini-task-assignment`                             |                                                                                  |
| `lib/teacher-mocks.ts::MOCK_CHAT_THREADS`           | `api::chat-thread.chat-thread` + `chat-message.chat-message`                    |                                                                                  |
| `mocks/user.ts::TeacherUser`                        | `api::user-profile.user-profile` (role=teacher) + `teacher-profile`            |                                                                                  |
| `mocks/lessons/*`                                   | `api::lesson.lesson.engineSteps` DZ                                             | `LessonStep` → DZ components `lesson-step.*`                                     |
| `lib/shop-catalog.ts::SHOP_ITEMS`                   | `api::shop-item.shop-item`                                                      | `SLOT_OFFSET` → Json field `slotOffsets`                                         |
| `lib/characters.ts::CHARACTERS`                     | `api::character.character` (template=true)                                      | emotions → `character-emotion` component (repeatable)                            |
| `lib/kids-store.ts` CustomItem/CustomRoom/CustomCharacter | Same tables, з `isCustom=true` + `creator` relation                        | local IDB залишається як offline cache                                           |
| `app/dashboard/prizes` моки                         | `api::prize-case.prize-case` + `api::prize-drop.prize-drop`                     |                                                                                  |
| `app/dashboard/payments` моки                       | `api::payment.payment`                                                          |                                                                                  |

### 9.3. Migration script (for future production data)

Коли ми вже в проді і треба додавати нові поля / типи:

```ts
// database/migrations/2026-05-12-add-level-sublevel-to-lessons.ts
import type { Strapi } from '@strapi/strapi';
export async function up({ strapi }: { strapi: Strapi }) {
  // 1) schema зміна вже через schema.json — Strapi автоматично мігрує
  // 2) data backfill:
  const lessons = await strapi.db.query('api::lesson.lesson').findMany({ where: { cefrSubLevel: null } });
  for (const l of lessons) {
    await strapi.db.query('api::lesson.lesson').update({
      where: { id: l.id },
      data: { cefrSubLevel: `${l.level}.1` }
    });
  }
}
export async function down({ strapi }: { strapi: Strapi }) { /* revert */ }
```

Виконання: `yarn cms migrate` (власний CLI — читає `database/migrations/*.ts`, запускає у порядку, трекає через таблицю `_migrations`).

### 9.4. Zero-downtime schema changes rules

1. **Add column** — OK завжди (nullable або з default).
2. **Rename column** — через дві релізи: (a) додати new, dual-write; (b) backfill; (c) читання з new; (d) видалити old.
3. **Drop column** — завжди через depreciation window (2 релізи).
4. **Change enum** — додавати значення можна, видаляти — через двохфазний міграційний план.
5. **Change relation type** (oneToMany→manyToMany) — через нову relation + migration + cutover.
6. **Never** `DROP TABLE` без backup snapshot + 7 днів feature-flagged soft-delete.

---

## 10. Phased rollout

Фаза реалізації бекенду + міграції фронту. Кожна фаза має **exit criteria** — чіткий список, без якого не йдемо далі.

### Phase B0 — Infrastructure scaffold (1 тиждень)

- [ ] GitHub monorepo: `apps/web` (existing Next.js), `apps/cms` (new Strapi), `packages/shared`.
- [ ] Docker-compose для локалки: postgres, redis, minio, cms, web.
- [ ] Vault/Doppler для секретів.
- [ ] CI workflow `ci-cms.yml` + `ci-web.yml` (lint/type/test).
- [ ] Staging environment live: CMS URL + DB.

**Exit**: `yarn dev:all` піднімає локально всю стек; staging health `/api/_health` = 200.

### Phase B1 — Core schemas + auth (1-2 тижні)

- [ ] Content-types: User-profile + role-profiles (5) + Organization + Refresh-token.
- [ ] users-permissions налаштовано: policies, roles, Google OAuth.
- [ ] JWT + refresh rotation + revoke.
- [ ] Seed bootstrap admin + default org + роли.
- [ ] Next.js AuthContext + login/logout/register flow.
- [ ] Policies: is-authenticated, is-owner, has-role, is-organization-member.
- [ ] Audit log middleware.

**Exit**: можна зареєструватись, залогінитись, увідерти refresh, вийти; всі 5 ролей видимі в admin; audit log пише записи.

### Phase B2 — Domain core (2-3 тижні)

- [ ] Content-types: Program, Lesson (+DZ), LessonVersion, Homework (+DZ), HomeworkAssignment, HomeworkSubmission, ScheduledLesson, Group, TeacherSlot, AvailabilityTemplate.
- [ ] Seeds з mock-файлів (03-04, 09, 11).
- [ ] REST custom: /lessons/:id/complete, /homework/:id/autograde.
- [ ] Next.js: `lib/data/shim.ts` з feature-flag `USE_API`, переключаємо 2 readonly сторінки (teacher library, admin library).

**Exit**: teacher в UI бачить реальні свої уроки з Strapi (а не mock); студент може "complete lesson" і coin/xp зараховуються.

### Phase B3 — Gamification (1-2 тижні)

- [ ] Content-types: CoinLedger, XpLedger, Streak, Leaderboard, Badge, Achievement.
- [ ] Lifecycle hooks: coin-ledger.beforeCreate, balance calc.
- [ ] Jobs: recalculate-streaks (cron daily 00:05 UTC), refresh-leaderboard (cron 5min).
- [ ] Next.js: coin balance з server (hook `useCoinBalance`), streak UI.

**Exit**: balance ніколи не йде в мінус; leaderboard стабільно оновлюється; streak-логіка покриває edge cases (TZ, day rollover).

### Phase B4 — Shop + Rooms + Characters (2 тижні)

- [ ] Content-types: ShopItem, Inventory, RoomTheme, Room, PlacedItem, Character, CharacterInstance, Outfit.
- [ ] /shop/purchase (idempotent).
- [ ] /rooms/:id/layout (bulk PUT, debounced).
- [ ] Next.js: переписання `kids-store.ts` на server-first з IDB як offline cache + sync queue.

**Exit**: покупка у shop безпечна від duplicate submit; кімната drag&drop зберігається на сервер; offline edits sync на reconnect.

### Phase B5 — Calendar + Chat + Notifications (2 тижні)

- [ ] Content-types: Notification, ChatThread, ChatMessage, ReadReceipt, MassMessage, Attendance.
- [ ] Ably integration; channel auth via `/api/realtime/token`.
- [ ] Jobs: mass-message expander, notification dispatcher, recurring-lesson materializer.
- [ ] Next.js: realtime hooks, typing indicators, read receipts.

**Exit**: teacher і student можуть обмінюватись повідомленнями; нотифікації приходять при homework reviewed; mass-message доставляється батчем без падіння.

### Phase B6 — Payments (2 тижні)

- [ ] Content-types: Subscription, Plan, Payment, Invoice, Refund, PromoCode.
- [ ] Stripe + LiqPay + WayForPay integration (checkout + webhook).
- [ ] Idempotency guarantees.
- [ ] Next.js: checkout flow, payment history, parent payment for kid.

**Exit**: real payment in staging (test mode) проходить повний життєвий цикл: checkout → authorized → paid → subscription active; refund → subscription cancelled. Webhook dedup на рівні БД.

### Phase B7 — Analytics + Admin tooling (1 тиждень)

- [ ] `/analytics/teacher/me`, `/analytics/admin/platform` — агрегації через materialized views в PG.
- [ ] Admin UI: impersonate, feature flags, manual coin adjust, refund.
- [ ] Sentry, Grafana дашборди, BetterStack.

**Exit**: дашборди показують точні числа; impersonation логується у audit.

### Phase B8 — Hardening + QA (2 тижні)

- [ ] Full E2E pass на staging.
- [ ] Penetration test report.
- [ ] Load test (k6): 500 concurrent users, chat 10 msg/s, payments 1/s — must sustain 15 min.
- [ ] DR drill: restore staging from prod snapshot.
- [ ] GDPR flows: export + delete end-to-end.
- [ ] Privacy policy + terms v1 published.
- [ ] Bug-bounty програма (private beta).

**Exit**: всі checklists signed-off, no P0/P1 bugs open.

### Phase B9 — Production launch (1 тиждень)

- [ ] Domain `app.englishbest.com` live з SSL.
- [ ] Migrations deployed, seeds run for org + admin.
- [ ] Frozen feature-flag snapshot.
- [ ] First internal users onboarded (5 teachers, 20 students).
- [ ] 7-day observation window.

**Exit**: SLO хіт (99.5% uptime, p95<300ms) протягом 7 днів.

### Rollout totals

~13-16 тижнів (бек + фронт + QA). При паралельних streamах (2 бек-розробники + 2 фронт + 1 QA) — можливо стиснути до 10-12.

---

## 11. Testing strategy

### 11.1. Layers

| Layer            | Tool                           | Coverage target                |
|------------------|--------------------------------|--------------------------------|
| Unit (shared)    | Jest 30 (`packages/shared`)    | 90% schemas, utils             |
| Unit (cms)       | Jest + @strapi/testing         | 80% services + policies        |
| Unit (web)       | Jest + React Testing Library   | 70% components                 |
| Integration      | Supertest проти test Strapi    | Всі critical endpoints         |
| E2E              | Playwright                     | 20 user journeys               |
| Visual           | Chromatic (Storybook)          | UI primitives + key pages      |
| Load             | k6                             | Chat, payments, lesson-complete |
| Security         | OWASP ZAP + Semgrep            | CI на кожен PR                 |
| A11y             | axe-core + Lighthouse CI       | >= 95                           |

### 11.2. Critical journeys (Playwright)

1. Kids: register (via parent) → placement test → first lesson complete → coins awarded → shop purchase.
2. Adult: register → email verify → select program → enroll → schedule lesson → complete homework → receive feedback.
3. Teacher: login → create lesson (DZ blocks) → assign homework to group → review submission → send feedback → see it in analytics.
4. Parent: register → add child → pay for subscription → see child timeline → chat with teacher.
5. Admin: impersonate teacher → feature-flag flip → refund payment → verify audit log.
6. Chat: two users exchange 20 messages, read receipts, typing, offline send queued.
7. Payment: Stripe test card → webhook arrival → subscription active.
8. Payment: LiqPay → webhook (HMAC mis-signed) → rejected → retried → accepted.
9. Offline kids: place items → airplane mode → more edits → reconnect → server state merged.
10. GDPR export: request → receive ZIP → delete request → confirm PII anonymized.

### 11.3. Test data strategy

- **Deterministic seeds** для E2E — фіксований dataset `tests/fixtures/e2e-seed.sql` (dump з staging snapshot).
- **Test users per role** з передбачуваними email/password (`kid+e2e@test.com`, `teacher+e2e@test.com`, тощо).
- Тестове середовище робить reset перед кожним test file (fast — через `TRUNCATE` + re-seed).

### 11.4. CI gates

- PR → lint + type + unit (web + cms + shared) + schema diff; якщо fails → merge blocked.
- PR labeled `ready-for-review` → Playwright smoke (5 мін) on preview env.
- Merge to main → staging deploy → full Playwright (30 хв) + load smoke.
- Manual promote to prod → vault signing + approval 2/2.

---

## 12. Risks, open questions, decisions

### 12.1. Риски

| Ризик                                                          | Likelihood | Impact | Mitigation                                                                              |
|----------------------------------------------------------------|------------|--------|-----------------------------------------------------------------------------------------|
| Strapi v5 breaking changes під час розробки                    | Med        | High   | Pin version, upgrade plan; own forks if treatment needed                                |
| Payment webhook missed → subscription stuck pending            | Med        | High   | Cron reconcile (every 15 min) проти provider API                                        |
| Coin ledger integrity bug → negative balance або double-spend  | Low        | Critical | Tests + lifecycle checks + nightly audit job                                          |
| Kids offline merge conflicts (room layout)                     | Med        | Low    | LWW + UI hint "схоже, ти редагував ще десь"                                             |
| DDoS на auth/chat endpoints                                    | Med        | Med    | CF bot management + rate limit + challenge mode                                         |
| GDPR delete request для user з активною subscription           | Low        | High   | Runbook: cancel subscription first → then erase                                         |
| Vendor lock: Vercel pricing spike                              | Low        | Med    | Docker-friendly build; CF Pages/Workers як альтернатива                                 |
| Strapi admin compromise → data exfil                           | Very low   | Critical | MFA + IP whitelist + anomaly alerts + least-privilege admin roles                     |
| Large Dynamic Zone queries повільні                            | Med        | Med    | Populate лише потрібні level-1 components; server composite view для lesson player      |
| Dependency vulnerability у popular npm package                 | High       | Med    | Dependabot + Snyk + weekly audit                                                        |

### 12.2. Відкриті питання (рішення, що потребують підтвердження)

1. **Хостинг CMS**: Railway vs Render vs Fly.io vs VPS self-managed? → `[decision: Railway для MVP, переїзд на VPS при досягненні 10k DAU]`.
2. **Ably vs Socket.IO**: managed vs self-hosted? → `[decision: Ably для фаз B0-B9, evaluate Socket.IO при MAU > 50k з точки зору $$$]`.
3. **Placement test scoring**: простий rules-based чи adaptive IRT? → `[decision: rules-based для MVP (CEFR-aligned), IRT — post-launch]`.
4. **Voice messages у chat**: launch with MVP чи post-launch? → `[decision: post-launch phase B+1]`.
5. **Live lesson video**: власне WebRTC чи інтеграція з Zoom/Meet? → `[decision: інтеграція з Zoom через Pro account у teacherProfile для MVP]`.
6. **Mobile apps**: React Native одразу чи PWA спочатку? → `[decision: PWA для MVP, RN в H2 після ринкової валідації]`.
7. **Multi-tenant поведінка**: у MVP одна default organization чи одразу N? → `[decision: технічно multi-tenant з дня 0, UX — один tenant, перехід — лише конфіг change]`.
8. **Пошук уроків/програм**: PG FTS достатньо чи потрібен Meilisearch? → `[decision: PG FTS для MVP; Meilisearch якщо > 10k програм або складні ranking вимоги]`.
9. **Currency**: приймаємо USD і EUR одразу чи тільки UAH? → `[decision: UAH MVP, USD via Stripe — phase B+1]`.
10. **Audit log retention**: скільки зберігати? → `[decision: 2 роки hot, далі S3 Glacier; GDPR-delete → anonymize actor, керуйте записи]`.

### 12.3. Explicit "don't do" rules

- ❌ Не робимо direct SQL в контролерах — ORM only.
- ❌ Не тримаємо секретів у config/*.ts — тільки `process.env`.
- ❌ Не пишемо в ledger-таблиці з кількох місць — тільки через `services/coin-ledger.ts` API.
- ❌ Не видаляємо content-type без 2-х релізного depreciation.
- ❌ Не публікуємо draft lessons до students без явного `status=published` + `lastPublishedAt` update.
- ❌ Не використовуємо Strapi admin panel для production data edits (крім admin CRUD кого-то конкретного через runbook) — усе через API + audit.
- ❌ Не пишемо data migrations, що тривають > 30 секунд у `afterStart` хуку — такі задачі через окремий job.

---

## 13. Appendices

### 13.1. ER diagram (text form)

```
Organization
  └─< User-profile >─ User (users-permissions)
        ├─ KidsProfile
        ├─ AdultProfile
        ├─ TeacherProfile
        │     ├─< AvailabilityTemplate
        │     └─< TeacherSlot
        ├─ ParentProfile
        │     └─< ParentLink >── User-profile (kid)
        └─ AdminProfile

User-profile (role=student)
  ├─< Enrollment >── Program
  ├─< ScheduledLesson
  ├─< HomeworkAssignment
  │     └─< HomeworkSubmission
  ├─< MiniTaskAssignment
  ├─< CoinLedger
  ├─< XpLedger
  ├─ Streak
  ├─< Badge (via BadgeAward)
  ├─< Inventory
  ├─< Room
  │     └─< PlacedItem
  ├─< CharacterInstance
  │     └─< EquippedOutfit
  ├─< Subscription >── Plan
  │     └─< Payment
  ├─< PrizeOpen >── PrizeCase
  ├─< Notification
  ├─< ChatThreadMembership >── ChatThread
  │                              └─< ChatMessage
  └─< PlacementTestAttempt

Program
  └─< Lesson (orderIndex)
        ├─ contentBlocks DZ (12 kinds)
        ├─ engineSteps DZ (9 kinds)
        ├─< LessonVersion (snapshots)
        └─< Homework (template)

MassMessage
  └─< MassMessageDelivery >── User-profile
```

### 13.2. Content-types checklist

**Identity / tenancy** (6): Organization, User-profile, KidsProfile, AdultProfile, TeacherProfile, ParentProfile, AdminProfile.

**Auth** (3): RefreshToken, ConsentLog, PasswordResetToken.

**Content** (4): Program, Lesson, LessonVersion, PlacementTest.

**Schedule** (3): ScheduledLesson, AvailabilityTemplate, TeacherSlot.

**Homework** (3): Homework, HomeworkAssignment, HomeworkSubmission.

**MiniTasks** (2): MiniTask, MiniTaskAssignment.

**Chat** (3): ChatThread, ChatMessage, ChatReadReceipt.

**Gamification** (6): CoinLedger, XpLedger, Streak, Leaderboard, Badge, Achievement.

**Shop** (2): ShopItem, Inventory.

**Characters** (3): Character, CharacterInstance, Outfit.

**Rooms** (3): RoomTheme, Room, PlacedItem.

**Library** (1): Enrollment.

**Payments** (5): Plan, Subscription, Payment, Invoice, PromoCode.

**Prizes** (3): PrizeCase, PrizeDrop, PrizeOpen.

**Notifications** (2): Notification, MassMessage.

**System** (6): ClassEvent, AuditLog, FeatureFlag, Webhook, EmailTemplate, Settings.

**Total collection-types**: ~45. **Components**: ~30 (DZ kinds).

### 13.3. Environment variables (sample)

```bash
# apps/web (.env.production.local)
NEXT_PUBLIC_API_URL=https://api.englishbest.com
NEXT_PUBLIC_WS_URL=wss://realtime.ably.io
NEXT_PUBLIC_SENTRY_DSN=...
NEXT_PUBLIC_APP_VERSION=$(git rev-parse --short HEAD)
NEXT_PUBLIC_API_VERSION=2026-04-01
# server-only
AUTH_COOKIE_SECRET=...
ABLY_API_KEY_SERVER=...
STRIPE_PUBLIC_KEY=...

# apps/cms (.env.production)
HOST=0.0.0.0
PORT=1337
APP_KEYS=...,...,...,...
API_TOKEN_SALT=...
ADMIN_JWT_SECRET=...
JWT_SECRET=...
TRANSFER_TOKEN_SALT=...
DATABASE_CLIENT=postgres
DATABASE_HOST=...
DATABASE_PORT=5432
DATABASE_NAME=englishbest
DATABASE_USERNAME=...
DATABASE_PASSWORD=...
DATABASE_SSL=true
REDIS_URL=rediss://...
ABLY_API_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
LIQPAY_PUBLIC_KEY=...
LIQPAY_PRIVATE_KEY=...
WAYFORPAY_MERCHANT=...
WAYFORPAY_SECRET=...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=eb-prod-media
R2_PUBLIC_URL=https://media.englishbest.com
POSTMARK_API_KEY=...
SENTRY_DSN=...
JWT_REFRESH_TTL_DAYS=30
JWT_ACCESS_TTL_MIN=15
```

### 13.4. Definition of Done (for each content-type)

Кожна нова content-type вважається готовою лише якщо:
- [ ] schema.json з всіма полями + relations + enums.
- [ ] controllers з sanitize-output.
- [ ] policies для auth + ownership.
- [ ] services з business-logic (no logic у controllers).
- [ ] lifecycle hooks (створення AuditLog, сайд-ефектів у CoinLedger тощо).
- [ ] Indexes міграцією.
- [ ] Seeds (хоча б 1 приклад).
- [ ] Unit tests на services.
- [ ] Integration test на 1 happy path через REST.
- [ ] Strapi admin UI перевірено вручну (create, edit, delete, i18n toggle).
- [ ] REST endpoint доданий у Postman-колекцію (`docs/postman.json`).
- [ ] Zod schema у `packages/shared` з того ж source.
- [ ] Типи згенеровано: `yarn cms ts:generate-types` → commit.
- [ ] Документація в `docs/api.md`.

### 13.5. Runbook skeleton (`docs/RUNBOOK.md`)

```
## Incident playbooks

### 1. Payment webhook storms
### 2. Chat delivery stalled
### 3. Coin ledger drift detected
### 4. Strapi admin compromised
### 5. Database rollback required
### 6. GDPR delete stuck
### 7. CDN cache invalidation emergency
### 8. Ably outage
```

### 13.6. References

- Strapi v5 docs: https://docs.strapi.io/dev-docs/intro
- Next.js 16: `node_modules/next/dist/docs/` (локально) + https://nextjs.org/docs
- React Query: https://tanstack.com/query/latest/docs
- Ably: https://ably.com/docs
- Stripe: https://stripe.com/docs
- LiqPay: https://www.liqpay.ua/documentation
- WayForPay: https://wiki.wayforpay.com
- Postmark: https://postmarkapp.com/developer
- Cloudflare R2: https://developers.cloudflare.com/r2/
- BullMQ: https://docs.bullmq.io
- Sentry: https://docs.sentry.io
- OWASP Top 10: https://owasp.org/Top10/
- GDPR checklist: https://gdpr.eu/checklist/
- COPPA: https://www.ftc.gov/business-guidance/privacy-security/childrens-privacy

### 13.7. Glossary

- **CEFR** — Common European Framework of Reference for Languages (A1-C2).
- **Дропsя** — ймовірнісний reward з loot box.
- **LWW** — Last-Write-Wins конфлікт-резолюшн.
- **DZ** — Dynamic Zone (Strapi polymorphic composition).
- **IDB** — IndexedDB (браузерне сховище).
- **RTO/RPO** — Recovery Time/Point Objective.
- **SLO** — Service Level Objective.
- **HMAC** — Hash-based Message Authentication Code.
- **TS** — toplevel tokens в TypeScript.
- **documentId** — Strapi v5 business key (UUID), не bi-gint id PG.

### 13.8. Final sanity note

> Цей документ не є замороженим. При кожному новому епіку читаємо §3 (domain model) + §4 (schemas) + §12 (risks/decisions), додаємо або редагуємо; `git` зберігає історію. Оновлення структури `MEMORY.md` robot'а — паралельно.

---

## 14. Refinement v2 — 4-role model, homework lifecycle, kids game module

> **Status: CANONICAL.** Цей розділ замінює конфліктуючі частини §2.1, §3.1, §3.2, §3.4, §4.9.1, §4.11 та §6.4. Якщо знайдете розбіжність між цим §14 і попередніми розділами — перевагу має §14.

### 14.1. Account types — фінальна модель (4 ролі)

#### 14.1.1. Чому 4 а не 5

Раніше ми мали 5 ролей: `kids`, `adult`, `teacher`, `parent`, `admin`. На практиці це було помилково: `kids` vs `adult` — це **режим презентації** для одного типу користувача ("учень"), а не окремий тип облікового запису. Колапсуємо у єдиний `student`. Кид / дорослий контент-режим визначається **ageMode** + **uiMode** на профілі.

**Переваги колапсу:**
- Один потік авторизації для всіх учнів (не дві окремі форми реєстрації).
- Один тип «домашнього завдання» з адаптивною презентацією (gamified vs serious).
- Студент-підліток може **переключити режим** (UI Toca Boca → серйозний UI) без створення нового аккаунта.
- Прозоріша permission matrix (4 колонки замість 5).
- Простіше для teacher/parent/admin: один список «учнів».

**Що це не означає:**
- Це **не** означає, що kids та adult бачать однаковий UI. UI route lar розгалуження за `ageMode` (див. §14.4).
- Це **не** означає, що COPPA менш строгий. Навпаки — `isMinor` flag перевіряється скрізь.

#### 14.1.2. Канонічні 4 типи аккаунтів

| Account type | UID enum | Хто це | Як створюється |
|--------------|----------|--------|----------------|
| **Admin**    | `admin`  | Працівники EnglishBest (operations, content, support) | Тільки інший admin створює; MFA обов'язковий. |
| **Teacher**  | `teacher`| Викладачі (full-time + freelance) | Через invite-link від admin або self-apply + admin verification. |
| **Parent**   | `parent` | Батьки/опікуни (платять і моніторять дітей-учнів) | Self-signup; може існувати без дітей, додає їх потім. |
| **Student**  | `student`| **Учень будь-якого віку** (від 4 до 99). UI режим визначається `ageMode`. | Self-signup (>= 13/16 EU) або parent-created (< 13/16). |

> **Anti-pattern, якого уникаємо:** `student` ≠ "тільки дорослі". Дитина-учень — це **той самий `student`** з `ageMode=kids` + `parentLink` обов'язково.

#### 14.1.3. ageMode vs uiMode (важливе розмежування)

- `ageMode: enum[kids, teen, adult]` — **істина про користувача**, обчислюється з `dateOfBirth`. Незмінна без зміни DOB. Визначає COPPA, marketing-можливості, parent-consent vimoga, types of content allowed.
  - `kids`: < 13 років (US COPPA) / < 16 EU (GDPR)
  - `teen`: 13-17 (з parent-consent) або 16-17 EU
  - `adult`: >= 18
- `uiMode: enum[game, classic, auto]` — **preference студента/parent'а** про вигляд UI. Default = `auto` → береться з `ageMode`.
  - `auto + kids` → game (Toca Boca-style, full-screen kids)
  - `auto + teen` → classic + opt-in game
  - `auto + adult` → classic
  - `game (forced)` — підліток / дорослий, який хоче гейміфікацію
  - `classic (forced)` — kid (рідко, але буває для шкільних класів) — потребує parent-confirm

Це поділ кардинально важливий для permission/UX/business: `ageMode` керує юридикою та безпекою, `uiMode` — лише виглядом.

### 14.2. StudentProfile — заміна KidsProfile + AdultProfile

#### 14.2.1. Канонічна schema

```json
{
  "kind": "collectionType",
  "collectionName": "student_profiles",
  "info": {
    "singularName": "student-profile",
    "pluralName": "student-profiles",
    "displayName": "Student Profile",
    "description": "Unified profile for ALL learners (kids, teens, adults). Replaces former KidsProfile + AdultProfile."
  },
  "options": { "draftAndPublish": false },
  "attributes": {
    "user":         { "type": "relation", "relation": "oneToOne", "target": "api::user-profile.user-profile", "required": true },

    "dateOfBirth":  { "type": "date", "required": true },
    "ageMode":      { "type": "enumeration", "enum": ["kids","teen","adult"], "required": true },
    "uiMode":       { "type": "enumeration", "enum": ["game","classic","auto"], "default": "auto" },
    "isMinor":      { "type": "boolean", "default": false },

    "currentLevel": { "type": "enumeration", "enum": ["A0","A1","A2","B1","B2","C1","C2"] },
    "targetLevel":  { "type": "enumeration", "enum": ["A0","A1","A2","B1","B2","C1","C2"] },

    "learningGoal": { "type": "enumeration", "enum": ["school_help","exam","travel","career","hobby","fluency","kids_fun","other"] },
    "weeklyGoalMin":{ "type": "integer", "default": 90 },
    "preferredTimes":{ "type": "json" },
    "selfStudyEnabled":{ "type": "boolean", "default": true },

    "totalCoins":   { "type": "biginteger", "default": 0 },
    "totalXp":      { "type": "biginteger", "default": 0 },
    "streakDays":   { "type": "integer", "default": 0 },
    "streakLastAt": { "type": "datetime" },

    "companionAnimal": { "type": "enumeration", "enum": ["fox","raccoon","owl","bunny","bear","dragon"] },
    "companionName":   { "type": "string" },
    "companionMood":   { "type": "enumeration", "enum": ["happy","sleepy","excited","curious","proud","tired","playful","focused","celebrating","thinking"] },
    "activeCharacter": { "type": "relation", "relation": "oneToOne", "target": "api::character-instance.character-instance" },
    "activeRoom":      { "type": "relation", "relation": "oneToOne", "target": "api::room.room" },
    "ownedItems":      { "type": "relation", "relation": "manyToMany", "target": "api::shop-item.shop-item" },
    "ownedCharacters": { "type": "relation", "relation": "manyToMany", "target": "api::character.character" },

    "parentLinks": { "type": "relation", "relation": "oneToMany", "target": "api::parent-link.parent-link", "mappedBy": "child" },
    "primaryParent": { "type": "relation", "relation": "manyToOne", "target": "api::user-profile.user-profile" },
    "schoolClass":   { "type": "string" },
    "kidPin":        { "type": "string" },

    "energyMax":   { "type": "integer", "default": 5 },
    "energyCurrent": { "type": "integer", "default": 5 },
    "energyRefillAt": { "type": "datetime" },
    "dailyTimeLimitMin": { "type": "integer" },
    "todayPlayedMin":  { "type": "integer", "default": 0 },
    "lastPlayDayKey":  { "type": "string" },
    "freezeTokens": { "type": "integer", "default": 0 },

    "showRealName": { "type": "boolean", "default": false },
    "publicLeaderboardOptOut": { "type": "boolean", "default": false },
    "marketingOptIn":  { "type": "boolean", "default": false },

    "preferredVoice": { "type": "string" },
    "lessonAutoplay": { "type": "boolean", "default": true },
    "captionsEnabled":{ "type": "boolean", "default": false },
    "soundEffectsEnabled": { "type": "boolean", "default": true },

    "primaryProgram": { "type": "relation", "relation": "manyToOne", "target": "api::program.program" }
  }
}
```

#### 14.2.2. Lifecycle hooks для StudentProfile

- `beforeCreate` / `beforeUpdate`:
  - Compute `ageMode` від `dateOfBirth` (kids: <13, teen: 13-17, adult: >=18). Заборонити ручне переписування.
  - Set `isMinor = (ageMode !== 'adult')` — derive, не приймати від клієнта.
  - Якщо `ageMode === 'kids'` → `parentLinks` обов'язково > 0 (інакше throw 422 — "kid profile requires parental link").
  - Якщо `uiMode === 'auto'` → resolve до конкретного значення для returning у API.
- `afterCreate`:
  - При `ageMode === 'kids'` — створити default `Room` з безкоштовною темою, default `CharacterInstance` (fox).
  - Дати стартові 100 coins (CoinLedger reason=`signup_bonus`).
- `afterUpdate`:
  - Якщо `ageMode` змінено з `kids` на `teen` (день народження) → trigger job `onStudentTurnedTeen`: знизити parental restrictions, надіслати notification до parent + student.

#### 14.2.3. Backwards-mapping від попередніх KidsProfile + AdultProfile

| Стара сутність | Нове розташування |
|----------------|-------------------|
| `KidsProfile.companionAnimal` | `student-profile.companionAnimal` |
| `KidsProfile.streakDays` | `student-profile.streakDays` |
| `KidsProfile.ownedItems` | `student-profile.ownedItems` |
| `KidsProfile.kidPin` | `student-profile.kidPin` |
| `KidsProfile.parentalLink` | `student-profile.parentLinks[0]` (через ParentLink) |
| `AdultProfile.goal` | `student-profile.learningGoal` |
| `AdultProfile.weeklyGoalMin` | `student-profile.weeklyGoalMin` |
| `AdultProfile.targetLevel` | `student-profile.targetLevel` |
| `AdultProfile.preferredTimes` | `student-profile.preferredTimes` |

При seed/migration з mocks: автоматично визначаємо `ageMode` за `dateOfBirth`; якщо немає (теоретично) — fallback на `adult` для дорослих або throw для kids.

### 14.3. Homework — повний lifecycle

#### 14.3.1. State machine

```
                                                    ┌────────────────────┐
                                                    │       overdue      │ (auto from cron)
                                                    └────────▲───────────┘
                                                             │ dueAt < now & status=in_progress
                                                             │
   ┌──────────┐        ┌──────────┐        ┌──────────────┐  │   ┌──────────────┐
   │  draft   │──assign►│ assigned │──open──►│ in_progress  ├──┼──►│  submitted   │──review──►┌──────────┐
   │ (teacher)│ (1:N)   │ (student)│         │  (student)   │  │   │ (waits review)│           │ reviewed │
   └──────────┘         └──────────┘         └──────────────┘  │   └──────┬───────┘           └────┬─────┘
                              │                       ▲        │          │ teacher returns       │
                              │                       │        │          ▼ for fixes              │
                              │                       │        │   ┌──────────────┐               │
                              │                       │        │   │   returned   │──resubmit────►│
                              │                       │        │   └──────────────┘               │
                              │                       │        │                                  │
                              │ teacher cancels       │        │                                  ▼
                              ▼                       │        │                          ┌──────────────┐
                         ┌──────────┐                 │        │                          │  completed   │
                         │ cancelled│                 │        │                          └──────────────┘
                         └──────────┘                 │        │
                                                      └────────┘
                                                  resume from overdue
```

#### 14.3.2. Канонічні стани

| Status | Хто бачить | Хто може transition'ити | Side effects on enter |
|--------|------------|--------------------------|------------------------|
| `draft` | teacher (author) | teacher saves new homework template | None |
| `assigned` | student, parent, teacher | teacher creates HomeworkAssignment | Notification(student), Notification(parent), email(opt-in) |
| `in_progress` | student, parent, teacher | student opens for the first time | clientStartedAt timestamp recorded; AnalyticsEvent |
| `submitted` | teacher (action item), parent | student clicks "submit" | Notification(teacher); auto-grader job queued (if autoGradable); SLA timer starts |
| `reviewed` | student, parent, teacher | teacher reviews (sets score+feedback) | CoinLedger credit, XpLedger credit, Notification(student), Notification(parent), Achievement check |
| `returned` | student | teacher returns "needs fixes" (with comments) | Notification(student), counter `returnCount++` |
| `completed` | (all) | system after `reviewed` AND no further action OR teacher marks closed | Final state; no edits allowed |
| `overdue` | student, parent, teacher | cron when `dueAt < now AND status IN (assigned, in_progress, returned)` | Notification(student), Notification(parent); doesn't lock submission, just visual flag |
| `cancelled` | (all) | teacher / admin | Audit; restore freeze if any; no penalty |

#### 14.3.3. Transition rules (формалізовано)

```ts
const ALLOWED: Record<Status, Status[]> = {
  draft:       ['assigned', 'cancelled'],
  assigned:    ['in_progress', 'cancelled', 'overdue'],
  in_progress: ['submitted', 'overdue', 'cancelled'],
  submitted:   ['reviewed', 'returned', 'cancelled'],
  returned:    ['in_progress', 'submitted', 'overdue', 'cancelled'],
  reviewed:    ['completed', 'returned'], // teacher може ще раз reopen
  overdue:     ['in_progress', 'submitted', 'cancelled', 'reviewed'],
  completed:   [], // termenal
  cancelled:   [], // terminal
};
```

Реалізація — `homework-assignment.service.ts::transition(id, newStatus, actor, reason?)`:
1. Load assignment + lock row (`for update`).
2. Check `ALLOWED[current].includes(newStatus)` → інакше 422.
3. Check actor-permission per row у §14.3.4.
4. Apply side effects (idempotent через op key).
5. Write `ClassEvent` (event sourcing).
6. Write `AuditLog`.
7. Return updated entity.

#### 14.3.4. Authorization per transition

| From → To | Хто може | Pre-conditions |
|-----------|----------|----------------|
| draft → assigned | author teacher / admin | template `content` is non-empty, no-zero coinReward+xpReward, students list valid |
| assigned → in_progress | student (self) | none |
| in_progress → submitted | student (self) | answers JSON validates against template schema; required fields present |
| in_progress → in_progress (autosave) | student (self) | quick path; no transition, just `answers` patch |
| submitted → reviewed | reviewer teacher / admin | `score` between 0..maxScore; `feedback` optional but encouraged; if `corrections` present, validate format |
| submitted → returned | reviewer teacher / admin | `feedback` required (>= 5 chars); `correctionPoints` JSON required |
| returned → in_progress | student (self) | none |
| reviewed → completed | system (auto after 7d) or student "Дякую" button | none |
| reviewed → returned | reviewer (within 24h of review) | reason required |
| any → cancelled | teacher (author) / admin | `cancelReason` required; soft state, ledger NOT reverted |
| any → overdue | system cron | `dueAt < now` |

#### 14.3.5. Auto-grading vs manual review

- `homework.autoGradable: boolean` визначається на template:
  - Auto-gradable kinds: `vocabulary`, `quick-quiz`, `match`, `spelling`, `fill-blank`, `word-order` (objective answers).
  - Manual: `writing`, `translation` (вільна форма), `reading.openQuestion`, `listening.shortAnswer`, `video` (якщо містить вільну відповідь).
  - Mixed: якщо хоч один subitem manual → весь homework — manual.
- Submission flow для auto:
  1. Student submit → status `submitted`.
  2. Job `homework-autograde` обчислює score → пише `submission.score`, `corrections` (per item).
  3. Якщо `autoApproveOnPass: true` (per template) і `score >= passThreshold` → автоматичний transition `submitted → reviewed` від `system`-actor; CoinLedger credit.
  4. Інакше → status залишається `submitted`, teacher отримує preview з pre-graded scores і може accept/edit.
- Manual flow: одразу `submitted`, teacher review.

#### 14.3.6. Resubmission rules

- Якщо teacher returns → student edit → submit again. Ці події групуються у **submission attempts**:
  ```
  HomeworkSubmission (canonical)
    └─< HomeworkSubmissionAttempt (1:N)
         { attemptNo, answers, attachments, submittedAt, scoreAtTime, feedbackAtTime }
  ```
- Top-level submission завжди показує **поточний** стан; історія attempts видима в expandable `<History/>` UI.
- При each new attempt — попередня coin/xp credit revoked? **Ні**, не revoke. Замість цього: на фінальний `reviewed` нараховується **різниця** (delta), щоб ніколи не йти у мінус. Це гарантовано через ledger lifecycle hook.

#### 14.3.7. SLA та escalation

- Default SLA: teacher має review submitted homework в межах **48 годин**.
- Overdue review (> 48h):
  - Hour 49: notification до teacher.
  - Hour 72: notification до student з `"Ваш викладач затримується, ми нагадали йому"`.
  - Hour 96: notification до admin / department head; admin може reassign на іншого teacher.
- SLA дашборд для teacher показує "queue health": x submission to review, oldest age.

#### 14.3.8. Bulk operations

- Teacher може bulk-assign template до group / list of students в одному запиті: `POST /api/homework-assignments/bulk` з `{ homeworkId, studentIds[], dueAt }`.
- Bulk grade: для objective items teacher може select N submitted assignments → `POST /api/homework-submissions/bulk-grade` з шаблоном feedback. Виконується job-ом, кожен assignment processed individually з власним audit row.

#### 14.3.9. Visibility per role

| View | Admin | Teacher (assignor) | Teacher (other) | Parent | Student |
|------|-------|--------------------|-----------------|--------|---------|
| Template (Homework) | full | full | view if `public=true` else not | — | — |
| Assignment list per student | full | own assignments | — | own children | self |
| Submission content (answers) | full | full | — | own child | self |
| Score + feedback | full | full | — | own child | self |
| Attempts history | full | full | — | own child (read) | self |
| Bulk-grade | yes | yes | — | — | — |

#### 14.3.10. Edge cases / gotchas

- **Зміна template після assign**: template versioned (`Homework` має `version` + LessonVersion-style snapshot). При assign — snapshot заморожується у `assignment.contentSnapshot` (JSON). Подальша редакція template на існуючі assignments **не впливає**.
- **Student deactivated mid-flight**: assignment залишається `cancelled` з `cancelReason='student_archived'`; coins не повертаються.
- **Teacher fired**: assignments автоматично reassign до `default-reviewer` (admin team) або до co-teacher (configurable per organization).
- **Group homework with one absent member**: assignment не створюється для absent (filtered at bulk-assign time); якщо членство змінилось після assign — старі assignments залишаються, нові не створюються.
- **Plagiarism / copy detection** (post-launch): job `homework-plagiarism-scan` для writing-type, comparing serializeText(answers) cross-student per-homework через trigram similarity; flag вище 70% → ставимо `flag.suspectedPlagiarism=true`, teacher бачить badge.
- **Late submission policy** (per program): можна налаштувати `lateSubmissionPolicy: { allow: true, penaltyPercent: 20, maxDaysLate: 7 }`. Auto-grader множить score на `(1 - penalty)` якщо submitted post-due.
- **Resubmit limits**: default 3 attempts; configurable per homework. Після ліміту student не може submit, лише contact teacher.

### 14.4. Kids Game Module — повна специфікація

#### 14.4.1. Що таке "kids module"

Це **режим UI + специфічні mechanics** для студентів з `ageMode='kids'` (default) або тих, хто свідомо обрав `uiMode='game'`. Не окрема система — той самий backend, інший фронт.

#### 14.4.2. Identifying kids mode

```ts
// lib/kids/mode.ts
export function resolveUiMode(profile: StudentProfile): 'game' | 'classic' {
  if (profile.uiMode === 'game') return 'game';
  if (profile.uiMode === 'classic') return 'classic';
  // auto:
  return profile.ageMode === 'kids' ? 'game' : 'classic';
}
```

URL routing — окремий префікс `/kids/*` для game-mode сторінок:
- `/kids/home` (room view як домашня сторінка)
- `/kids/lesson/[id]` (game-style lesson player)
- `/kids/shop`, `/kids/inventory`, `/kids/character`, `/kids/room`
- `/kids/quests`, `/kids/leaderboard-friends`

Class-mode студент бачить класичні `/dashboard/*` сторінки.

При login — middleware вирішує redirect:
```ts
if (resolveUiMode(profile) === 'game') redirect('/kids/home');
else redirect('/dashboard');
```

Студент може вручну перемкнутися (`<UiModeToggle/>`) — оновлює `student-profile.uiMode` через `PUT /me/student-profile`.

#### 14.4.3. Game loop (canonical)

```
   [Daily login] ─► see room + companion + quests panel
        │
        ▼
   [Daily quest #1: "Complete 1 lesson"] ──► tap ──► Lesson player (gamified)
                                                            │
                                              answers ──► XP + Coins (+streak)
                                                            │
                                                            ▼
   ┌──── animation: companion celebrates ─── coin burst ─── return to room
   │
   ▼
   [Pop-up suggest: spend coins?] ─► Shop ─► purchase item ─► place in room
                                       │
                                       └─► OR open prize-case (loot box) ─► drop animation
                                                                                   │
                                                                                   ▼
                                                                       new item / character / outfit
                                                                                   │
                                                                                   ▼
                                                                          customize character / room
   [Time spent counter increments → if dailyTimeLimitMin reached → soft-stop screen]
```

#### 14.4.4. Currency rules (anti-gambling, COPPA-safe)

- **Soft currency: coins** — заробляється виключно через активність (lessons, homework, quests, streaks). Можна ще придбати "reload pack" — **тільки parent аккаунт може купити coins для дитини** (через parent → payment → recipient = kid). Сам kid НЕ бачить кнопки "buy coins".
- **Hard currency: gems** — **відсутня для kids**. Точка. Це усуває pay-to-win + COPPA-проблеми. Для teen/adult у `uiMode=game` — з parent-consent, явно опціонально.
- **Loot boxes (prize cases)** — дозволені, але:
  - Ціна **виключно у coins** (soft).
  - **Прозорі шанси** (відображаємо drop-rates на UI: "Common 60% / Rare 25% / Epic 10% / Legendary 5%"). Це регуляторна best-practice для дитячих ігор (UK, NL вимагає).
  - **Pity timer**: гарантований Epic+ після 10 відкриттів (видно прогрес-бар "Гарантована перлина через 4 відкриття").
  - **Не можна купити loot box за реальні гроші** ніколи. Тільки за зароблені coins.
  - Аудит-лог: кожен open фіксується для GDPR/transparency.

#### 14.4.5. Energy system

- Призначення: запобігти 4-годинним сесіям; виховує "trickle play".
- `energyCurrent` 0..`energyMax` (default 5).
- 1 lesson = 1 energy. 1 mini-task = 0.2 energy (округл. до 1 за 5 mini-tasks).
- Refill: +1 energy кожні 30 хвилин. `energyRefillAt` оновлюється при completion.
- Energy=0 → UI показує "Твій компаньйон трохи втомився, повернись через 18 хв" (без негативного посилу).
- **Опціонально для parent**: вимкнути energy ("розблокувати безліміт"), тоді `energyMax = 9999`.
- Streak-збереження не залежить від energy — навіть з 0 energy один daily quest безкоштовний (щоб не ламати streak за гроші).

#### 14.4.6. Daily time limit (parental control)

- `student-profile.dailyTimeLimitMin` — set by parent (default null = no limit).
- `todayPlayedMin` — інкрементується client-side (з server-validation: client шле ping кожні 60с, server перераховує).
- При досягненні: soft-stop screen "На сьогодні досить! Молодець." + locked screen 6 годин (parent може override через `parent-app`).
- Day rollover: при `lastPlayDayKey != today (in user TZ)` → `todayPlayedMin = 0`, `lastPlayDayKey = today`.
- Edge case: TZ change — обчислюємо в TZ профілю.

#### 14.4.7. Streaks + freeze tokens

- Streak day = day на якому student завершив >= 1 activity (lesson/homework/mini-task).
- `streakDays` лічить consecutive days; `streakLastAt` — datetime останньої активності.
- Day boundary — TZ профілю (`Europe/Kyiv` default).
- **Freeze tokens** — special items, що "оберігають" streak за пропущений день.
  - Auto-consume: cron 02:00 UTC перевіряє кожного active student; якщо вчора 0 activity АЛЕ `freezeTokens > 0` → `freezeTokens -= 1`, streak зберігається, notification "Ми використали 1 freeze token, щоб зберегти твою серію!".
  - Якщо 0 freeze tokens → streak reset до 0; notification "Серію перервано, але це не страшно. Почнемо знову!".
- Як заробити freeze: 7-day streak milestone дає +1; daily quest dropping rare; shop sells (5 coins each, max 3 в інвентарі).
- Anti-cheat: не можна "купити" відразу багато; cap 3 в inventory.

#### 14.4.8. Daily quests

- Generated cron 00:01 user TZ; persisted у `daily-quest` content-type:
  ```
  user↳, dayKey, quests: json [{slug, kind, target, progress, completed, reward}]
  ```
- 3 quests per day, mix of easy/medium:
  - "Complete 1 lesson" → 5 coins
  - "Do 10 vocab cards" → 8 coins
  - "Visit your room and place 1 item" → 3 coins (зокрема для retention)
  - "Earn 20 XP" → 10 coins
  - "Spell 5 words correctly" → 8 coins + 5 XP
  - Variants weighted by past behavior (рекомендації engine pick'ає те, що student любить)
- Reward immediate at completion + bonus 20 coins якщо всі 3 done.
- Server-side validation: progress increments через actual lesson/homework events (не довіряємо клієнту).

#### 14.4.9. Shop / Inventory / Rooms / Characters mechanics

- **Shop** (`/kids/shop`) — categories: Furniture, Decor, Outfits, Companions, Special.
  - Кожен item має `priceCoins`, `rarity`, preview animation.
  - "Featured today" rotates daily (3 random epic/legendary з 20% discount).
  - Покупка: tap → confirm → coin debit + inventory grant (atomic via `/api/shop/purchase`).
  - Якщо не вистачає coins → show "Заробляй coins у уроках!" з deeplink на доступний quest.

- **Inventory** (`/kids/inventory`) — grid view, filter by category, swipe to "place in room".
- **Room** (`/kids/room`) — Toca Boca-style canvas:
  - Background = `room-theme` image (3 layers: floor, wall, ceiling).
  - Drag&drop items (snap to grid optional).
  - PlacedItem stored з normalized 0..1 coords (resolution-independent).
  - Persist через `PUT /rooms/:id/layout` debounced 800ms.
  - Multi-room: kid може unlock 3 кімнати (default 1, +1 per 30 days streak, +1 за 200 coins).

- **Character** (`/kids/character`):
  - Equip outfits (head/body/hand/bg).
  - Recompose preview live (canvas).
  - Swap active character (з тих, що owned).

- **Visit friends' rooms** (post-launch, з parent-approval):
  - `/kids/friends` — список approved friends.
  - View only (не можна редагувати чужу кімнату).
  - "Reactions" (heart, smile) як єдиний interaction.
  - Friend list managed by parent через `/parent/child/:id/friends`.

#### 14.4.10. Lesson player — kids mode

- Full-screen, no chrome (no nav bar, exit via "X" top-right з confirm).
- Companion присутній у нижньому лівому куті, реагує на відповіді (animations: cheer, encourage, think).
- Speech bubbles для prompts (large text 18-22px, friendly font).
- Audio cue per option / answer.
- "Skip" replaced with "Питати компаньйона" (hint, costs 1 coin).
- Wrong answer → soft animation "Спробуй ще!" (no negative emotion); 2 wrong in a row → optional show explanation.
- Right answer → coin-burst animation, +xp number floats.
- Mid-lesson `pauseScreen` if dailyTimeLimit reached.
- End: confetti + total coins/xp earned + "Поділитися з мамою" button (sends notification до parent).

#### 14.4.11. Audio / pronunciation mechanics

- `mini-task-payload.pronounce` — kid records себе.
- **CRITICAL для COPPA**: запис обробляється **тільки на пристрої** через WebSpeech API + LocalRecognition; НЕ заливається на сервер.
- Server отримує лише **score** (0-100) від client + feature signature (без аудіо). Audio файл — discarded після 5с після scoring.
- Якщо WebSpeech недоступний → mini-task replaced на "tap correct sound" alternative.
- **Disclosure**: at first pronounce-task — modal "Ми не зберігаємо твій голос, лише оцінку".

#### 14.4.12. Social safety

- Kids не бачать список усіх users; не можуть відкрити profile by ID; не можуть free-text chat without curated phrases (для kids).
- Chat for kids — тільки з teacher та parent. **Не з іншими students**.
- Optional friend-to-friend messaging (post-launch) — тільки **canned phrases** ("Молодець!", "Привіт!"), NO free text.
- Leaderboard для kids — показує **аватари** і **first names** + псевдоніми, не emails / real surnames.
- `publicLeaderboardOptOut: true` → ховаємо kid з leaderboard повністю.
- Reporting button — kid може tap "🚩" біля будь-якого UGC (room visit, friend reaction); auto-creates moderation ticket.

#### 14.4.13. Offline-first contract (детально)

- Kids module — повністю функціональний offline:
  - lesson playback, room editing, character swap, inventory browse → all from IDB cache.
  - Coins balance — cached optimistic value; на sync — server verifies.
- Sync:
  - Outbox queue в IDB (`kids-store-queue`).
  - Each mutation → record `{ opId: uuid, type, payload, clientTime, status }`.
  - Online → background sync sends one-by-one; на success → drop record.
  - На conflict (server: 409) → resolution per type:
    - Coin debit conflict (server says: not enough coins) → revert local optimistic balance + show "Ой, схоже не вистачило монеток".
    - Room layout conflict → server LWW; UI показує latest server version + "змінили в іншому пристрої" toast.
    - Item purchase conflict (sold out / removed item) → revert + apologetic message.
- Server idempotency через `Idempotency-Key: <opId>` header → дублікати при retry безпечні.
- Coins **ніколи** earned offline counted as final until server confirms — display "очікує підтвердження" tag поряд з balance during sync.

#### 14.4.14. Parental controls

Окремий розділ у parent app (`/dashboard/parent/child/:id/controls`):

| Control | Default | Effect |
|---------|---------|--------|
| Daily time limit | null (no limit) | Soft-stop UI when reached |
| Energy enabled | true | If false, no energy gating |
| Loot boxes enabled | true | If false, hides prize-cases entirely |
| Friend list | empty | Parent approves each friend addition |
| Chat with teacher | enabled | Parent can mute |
| Marketing emails | false (kids: locked) | — |
| Real name visibility | false (kids: locked) | — |
| Companion reset | — | Allows kid to pick new companion (1/month) |
| Coin reset | — | Admin tool only; parent must request |
| Leaderboard visibility | true | Parent can opt-out |
| Notifications schedule | always | Parent sets quiet hours (e.g. 21:00-08:00) |

Parent action audit-logged. Зміна daily limit прибирається з кешу клієнта на наступному login або через push.

#### 14.4.15. UX тon (повторюємо memory: kids UI no color overload)

- **Один акцентний колір** на скрін (primary green — для CTAs, наприклад "Continue lesson").
- **Full-screen background** + top/bottom bars (як у Toca Boca). NO card stacks.
- **No rainbow nav** — нижня панель монохромна, акцент тільки на active tab.
- **Великі tap-targets** (min 56px). 
- **Animations** — Lottie / CSS, smooth, < 400ms.
- **Sound** — gentle, mixable (volume control + mute always visible).
- **Text** — Ukrainian default, shorter sentences, fontsize 16+ for kids, 14+ for adult.

### 14.5. Updated permission matrix (4-role)

Заміна §4.11. Колонки: Public · Student · Teacher · Parent · Admin.

| Action / Endpoint                         | Public | Student | Teacher | Parent | Admin |
|-------------------------------------------|--------|---------|---------|--------|-------|
| GET /programs (published)                 | ✓      | ✓       | ✓       | ✓      | ✓     |
| GET /lessons (own enrollments)            | —      | self    | own teach| child | ✓     |
| POST /lessons                             | —      | —       | ✓       | —      | ✓     |
| PUT /lessons/:id                          | —      | —       | author  | —      | ✓     |
| POST /lessons/:id/complete                | —      | self    | —       | —      | ✓     |
| GET /scheduled-lessons (own)              | —      | self    | own     | child  | ✓     |
| POST /scheduled-lessons                   | —      | —       | ✓       | —      | ✓     |
| POST /scheduled-lessons/:id/cancel        | —      | self*   | own     | child  | ✓     |
| GET /homework-assignments                 | —      | self    | own assigned | child | ✓ |
| POST /homework-assignments (assign)       | —      | —       | ✓       | —      | ✓     |
| POST /homework-assignments/bulk           | —      | —       | ✓       | —      | ✓     |
| POST /homework-submissions (submit)       | —      | self    | —       | —      | ✓     |
| PUT /homework-submissions/:id (review)    | —      | —       | reviewer| —      | ✓     |
| POST /homework-submissions/:id/return     | —      | —       | reviewer| —      | ✓     |
| GET /coin-ledger/me                       | —      | ✓       | ✓ (own) | child  | ✓     |
| POST /coin-ledger (manual)                | —      | —       | —       | —      | ✓     |
| POST /shop/purchase                       | —      | self    | —       | for-kid| ✓     |
| POST /prizes/open                         | —      | self    | —       | —      | ✓     |
| GET /chat/threads (own)                   | —      | participant | participant | participant | ✓ |
| POST /chat/messages                       | —      | thread-member | thread-member | thread-member | ✓ |
| POST /mass-messages                       | —      | —       | own students | — | ✓ |
| POST /payments/checkout                   | —      | adult-self | — | for-child | ✓ |
| GET /audit-logs                           | —      | —       | own actions | — | ✓ |
| Impersonate                               | —      | —       | —       | —      | ✓ (logged) |
| Feature flags edit                        | —      | —       | —       | —      | ✓     |
| /kids/* (game UI surfaces)                | —      | game-uiMode only | preview only | child preview | ✓ |
| Parental controls (set)                   | —      | —       | —       | own children | ✓ |
| Friend approve                            | —      | —       | —       | own children | ✓ |
| Daily quest list                          | —      | self    | —       | child  | ✓     |

\* Student cancels own scheduled lesson — лише до 24 год до початку (configurable).

### 14.6. Updated rollout impact

Phase B1 (auth) тепер створює лише 4 ролі (`admin`, `teacher`, `parent`, `student`). 
Phase B2 (domain core) — `student-profile` замість двох окремих.
Phase B4 — переіменовано на "Game module + Shop + Rooms + Characters". Не **kids-only** — це game-mode для всіх студентів з ageMode=kids або uiMode=game.
Phase B5 — chat має фільтр "kid → only teacher/parent".
Phase B6 — payments: kid не бачить checkout, parent paying-for-kid flow окремо валідується.

Додаємо **Phase B4.5 — Parental controls** (1 тиждень, після B4): 
- Endpoints `/parent/child/:id/controls/*`.
- UI panel в parent dashboard.
- Audit + rate-limit.

### 14.7. Updated mock → schema mapping

| Mock | New target |
|------|------------|
| `mocks/user.ts::Role` (5 values) | enum 4: `admin/teacher/parent/student` |
| `mocks/user.ts::KidsUser` | `student-profile` з `ageMode='kids'` |
| `mocks/user.ts::AdultUser` | `student-profile` з `ageMode='adult'` |
| `mocks/user.ts::CompanionAnimal` | `student-profile.companionAnimal` |
| `mocks/user.ts::CompanionMood` | `student-profile.companionMood` |
| `lib/teacher-mocks.ts::MOCK_STUDENTS` | `student-profile` (з ageMode resolved by DOB) |
| `lib/teacher-mocks.ts::HomeworkStatus` | enum union: status (8 значень з §14.3.2) |
| Kids store (IDB) state | `student-profile` (server) + IDB cache |

### 14.8. Validation: end-to-end checklist для нової моделі

- [ ] Schema migration: створити `student-profile`, мігрувати дані з `kids-profile`+`adult-profile`, видалити старі таблиці після 2-х релізів.
- [ ] User-profile.role enum — depreciate `kids` & `adult` → mapping до `student`. Через двофазний rename (§9.4 #2).
- [ ] Permissions update у Strapi admin.
- [ ] Frontend routes: redirect '/dashboard/profile' → split based on role; додати middleware для /kids/* перевірок (`uiMode + ageMode`).
- [ ] Lifecycle hooks для StudentProfile (ageMode compute, parental link required для kids).
- [ ] Homework state machine — implementation у `homework-assignment.service.ts` з ALLOWED transition map.
- [ ] Cron jobs: streak rollover, energy refill check, daily quest generator, freeze auto-consume, dailyTimeLimit reset, overdue scanner, SLA escalation.
- [ ] COPPA / kids checkers у controllers: `if (profile.isMinor && payment.payer === profile.user) throw 403`.
- [ ] Parent control endpoints + audit.
- [ ] Loot box transparency UI: drop-rates відображаються перед opening.
- [ ] No-pay для kids: feature-flag перевірка у /kids/shop.
- [ ] WebSpeech recording — privacy disclosure + no-upload guard.
- [ ] Tests: state machine permutations, ageMode boundary day (13th birthday), TZ rollover для streak/quest, freeze auto-consume edge case.

### 14.9. Open questions (from this refinement)

1. **Birthday rollover для ageMode=kids → teen**: автоматично знизити restrictions у північ або потребує parent-confirm? → `[decision: auto-relax при birthday, але send notification до parent з opt-out (24h freeze period)]`.
2. **Teen у kids friend list**: 14-річний може бути friend 11-річного? → `[decision: NO. Friends обмежені до same ageMode або +/-1 рік (not +/-3); strict cross-age block]`.
3. **Coin reset на день народження**: чи переносити баланс при upgrade kids → teen? → `[decision: YES, коіни мігрують 1:1; outfit/character carry over; дитячі-only items залишаються (не expire)]`.
4. **Kids data при GDPR delete від parent**: видалити одразу чи 30 днів grace? → `[decision: 30-day grace, anonymize immediately, full-purge через 30 днів — щоб уникнути accidental delete]`.
5. **Loot box gambling regulation у Україні**: чи треба disclosure prosjet drop-rates у Terms? → `[decision: YES, додати у Terms + UI; legal review перед launch]`.
6. **Energy для adult mode**: вмикаємо чи завжди вимкнено? → `[decision: вимкнено за замовчуванням; opt-in тумблер у settings для тих, хто хоче gamification]`.
7. **Friend system MVP scope**: пускаємо у MVP чи post-launch? → `[decision: post-launch (B+1). MVP — тільки teacher/parent chat]`.

---

---

## 15. Parent dashboard — deep dive

> Покриває все, що бачить і робить parent (опікун) в системі. Mapping до schema → API → UI.

### 15.1. Зона відповідальності parent аккаунта

Parent **не вчиться сам** — він посередник між дитиною та платформою. Його робота:

1. **Зареєструвати дитину** (kid < 13/16 не може реєструватись сам).
2. **Сплатити** (Subscription, refill coins, premium plan).
3. **Моніторити прогрес** (timeline, weekly digest).
4. **Спілкуватися з teacher** (chat, schedule changes).
5. **Приймати рішення про privacy/safety** (friend approval, time limits, marketing opt-in).
6. **Реагувати на nudges** від teacher (e.g. "ваша дитина пропустила 3 заняття поспіль").
7. **Моніторити кілька дітей** (multi-child switcher).

**Чого parent НЕ робить:**
- Не редагує контент уроків.
- Не редагує homework answers за дитину.
- Не міняє coin balance дитини.
- Не бачить chat дитини з teacher без явного дозволу `parentLink.canViewChat=true` (default true, але kid >= 13 може unlock приватність).

### 15.2. ParentLink — canonical schema (refresher)

```
parent↳*           : user-profile (role=parent)
child↳*            : user-profile (role=student)
relationship       : enum[mother,father,guardian,other]  default "guardian"
isPrimary          : boolean default false   # один primary parent на child
canPay             : boolean default true
canViewChat        : boolean default true
canViewHomework    : boolean default true
canMessageTeacher  : boolean default true
canModifyControls  : boolean default true   # parental-controls write access
consentSignedAt    : datetime *             # COPPA/GDPR proof
consentDoc         : media                  # PDF з підписом (optional)
revokedAt          : datetime
status             : enum[pending,active,revoked]  default "pending"
```

**Constraints:**
- `(parent, child)` — unique active link.
- `child.ageMode in ['kids','teen']` AND `parentLinks.count(active)=0` → student-profile lifecycle hook кидає 422 (не дозволяємо kid без parent).
- При `child.ageMode === 'adult'` (день народження): `parentLink.status` лишається `active`, але `canModifyControls` auto-set до `false` (закон більше не дає parent керувати). UI показує: "Ваша дитина повнолітня — ви бачите прогрес, але керування передано їй".

### 15.3. Pending підтвердження (claim flow)

Якщо parent додає **існуючого** student'а (e.g. self-registered teen 13+):
1. Parent шукає за email/phone teen'а у `/parent/add-child`.
2. Створюється `parent-link` зі `status=pending`.
3. Teen отримує notification "Ваш батько/мама хочуть додати вас. Підтвердити?".
4. Teen натискає "Так" → `status=active`, `consentSignedAt=now`, доступи розблоковуються.
5. Якщо teen відхиляє → `status=revoked`. Parent може спробувати повторно через 7 днів (rate limit).

Якщо parent створює **нового** kid (< 13):
1. `/parent/onboard-child` form: ім'я + DOB + companion + level.
2. Створюється `user-profile` з role=student, `student-profile` з ageMode=kids; `parent-link` одразу `active` (parent — creator → consent implicit).
3. Kids login: окремий PIN flow (kid вводить 4-цифровий PIN → запам'ятовує parent).

### 15.4. UI карта parent dashboard

```
/parent
├─ /home                  # огляд по всіх дітях
├─ /child/[id]
│   ├─ /timeline          # стрічка подій
│   ├─ /progress          # графіки рівня, streak, hours
│   ├─ /homework          # дочірня homework + статуси
│   ├─ /schedule          # календар уроків
│   ├─ /payments          # subscriptions + history per child
│   ├─ /controls          # parental controls (§14.4.14)
│   ├─ /friends           # approved/pending friends
│   ├─ /chat              # parent-teacher thread; child-teacher (read-only якщо canViewChat)
│   └─ /reports           # weekly/monthly PDF digest
├─ /payments
│   ├─ /methods           # cards / saved methods
│   ├─ /history           # all payments across all kids
│   └─ /invoices          # downloadable invoices
├─ /add-child             # add existing OR onboard new
├─ /settings              # profile, notifications, locale
└─ /support               # help center + ticket
```

### 15.5. Multi-child switcher

- Header має `<ChildSwitcher>` — dropdown усіх active дітей з avatar + name + level + останньою активністю.
- URL pattern `/parent/child/[id]/...` зберігає вибір через cookie `parent_active_child_id`.
- Дефолтний child — primary (з найбільшою активністю за 30 днів).
- Якщо діти > 5 — switcher стає search modal.
- Aggregate view `/parent/home` — табло на 1-3 children, далі pagination.

### 15.6. Child timeline

Timeline = read-only feed подій по конкретній дитині. Технічно — `GET /api/students/:id/timeline` (з §5.1.2), що агрегує `class-event`, `homework-assignment`, `chat-message` (мета без content якщо canViewChat=false), `payment`, `coin-ledger`, `prize-open`, `badge-award`.

**Item types у feed:**

| Kind                  | Icon | Title example                                  | Meta                          |
|-----------------------|------|-------------------------------------------------|-------------------------------|
| lesson_completed      | ✓    | "Урок 'Past Simple' завершено"                  | +25 XP · +5 coins · 18 хв     |
| homework_assigned     | 📋   | "Нове домашнє: Vocabulary Unit 4"               | до 12 квіт · від Maria S.     |
| homework_submitted    | ↑    | "Здано домашнє: Writing about hobby"            | очікує перевірки              |
| homework_reviewed     | ⭐   | "Перевірено: Writing about hobby — 92/100"      | feedback link                 |
| scheduled_lesson      | 📅   | "Урок з Maria S. сьогодні о 18:00"              | join link                     |
| lesson_cancelled      | ✕    | "Урок 12 квіт скасовано"                        | reason                        |
| coin_awarded          | 🪙   | "+10 coins за streak 7 днів"                    | ledger link                   |
| badge_awarded         | 🏆   | "Отримано бейдж: First Perfect Score"           |                               |
| payment_paid          | 💳   | "Оплачено: Plan Kids Monthly"                   | invoice link                  |
| payment_failed        | ⚠    | "Не вдалося списати — оновіть картку"           | action: update payment method |
| chat_message          | 💬   | "Нове повідомлення від Maria S."                | preview (якщо canViewChat)    |
| friend_request        | 👋   | "Anna хоче додатись у друзі"                    | approve / reject              |
| streak_lost           | 🔥   | "Серія перервана"                               | (теплий tone, no negativity)  |
| level_up              | ⬆    | "Дитина перейшла на A2!"                        | celebrate                     |

**API contract** (`/api/students/:id/timeline`):

```
GET /api/students/:id/timeline?cursor=<>&limit=25&kinds=lesson_completed,homework_*

Response:
{
  data: [
    {
      id: "evt_abc",
      kind: "homework_reviewed",
      occurredAt: "2026-04-18T14:22:00Z",
      title: "Перевірено: Writing about hobby — 92/100",
      meta: { score: 92, maxScore: 100, homeworkId: "...", reviewerId: "..." },
      actorId: "...",
      icon: "star",
      route: "/parent/child/123/homework/456",
      severity: "positive"   // "positive" | "neutral" | "warn" | "celebrate"
    },
    ...
  ],
  meta: { nextCursor: "...", hasMore: true }
}
```

**Server logic:**
- Backed by `class-event` table (event sourcing) — найшвидший шлях.
- Для item types, які не мапляться 1:1 у class-event (e.g. weekly streak summary) — generated server-side via materialized view that gets refreshed by a cron job.
- Pagination — keyset (cursor = `occurredAt|id` base64), не offset.
- Filter `kinds=` для вузьких feeds (e.g. mobile only homework).
- Privacy filter: якщо `canViewChat=false` — chat events виключені, навіть якщо існують.

**UI patterns:**
- Group by day (`Сьогодні`, `Вчора`, `12 квіт`) sticky headers.
- Empty state: "Поки тиша. Як буде активність — побачите тут."
- Pull-to-refresh, infinite scroll.
- Tap item → navigate to deep route per `event.route`.

### 15.7. Payments-for-child

Особливість: parent платить, але **отримувач** — child. Технічно це enforced на рівні Subscription:

```
subscription
  ├─ user (payer)         → parent user-profile
  ├─ beneficiary          → child user-profile
  └─ plan                  → plan
```

**Flow checkout:**

1. Parent у `/parent/child/[id]/payments` → "Subscribe to Kids Monthly".
2. POST `/api/payments/checkout` з body:
   ```json
   {
     "planSlug": "kids-monthly",
     "beneficiaryId": "<child-id>",
     "promoCode": "SCHOOL2026",
     "returnUrl": "/parent/child/123/payments?status={status}"
   }
   ```
3. Server:
   - Validate parent-link `canPay=true`.
   - Validate child role + active status.
   - Create pending `payment` + `subscription` (status=pending).
   - Create Stripe Checkout Session з `metadata.beneficiaryId`.
   - Return `{ providerUrl }`.
4. Parent redirected → pays → returnUrl.
5. Webhook `/api/payments/webhook/stripe` → match by `metadata.beneficiaryId` + `payment.idempotencyKey` → activate Subscription.
6. Notification:
   - Parent: "Підписку активовано для Anna".
   - Child: in-app toast + companion celebration "Ура, твоя підписка активна!".
7. Subscription `currentPeriodEnd` set → cron renew.

**Edge cases:**
- Parent has 3 children, paying for one — ensure subscription **scoped до child**, не parent.
- Parent cancels subscription — child's access expires at `currentPeriodEnd` (no immediate cut). UI попереджає parent: "Anna матиме доступ до 25 травня".
- Child reaches 18 years old:
  - Subscription **залишається** активною (paid until period end).
  - Notification both: "Anna стала повнолітньою. Хочете передати керування підпискою їй?".
  - 30-day grace; якщо передано → `subscription.user = child`, parent перестає платити автоматично, child може add own card.
- Failed renewal:
  - Stripe webhook `invoice.payment_failed` → `subscription.status=past_due`.
  - Notification до parent (3 retry attempts протягом 7 днів).
  - Day 8 без оплати → `status=expired`, child loses access (з 7-day grace на coins/inventory — можна повернути).
- Refund flow: parent contacts support → admin issues refund → Stripe → `payment.status=refunded`, subscription cancelled, audit log.

**Multi-child bundle:**
- Single subscription з `beneficiary` як **array**: для plan kind `family` (e.g. до 3 kids).
- `subscription` table: `beneficiaries: relation manyToMany` (тільки для family plans).
- Per-beneficiary access перевірка: `subscription.beneficiaries.includes(child) && status='active'`.

### 15.8. Friend approval flow

(Friend system — post-launch B+1, але контракт фіксуємо тут.)

**Schema:**

```
friend-request
  ├─ requester↳    : user-profile (role=student)
  ├─ recipient↳    : user-profile (role=student)
  ├─ status        : enum[pending, parent_approval, approved, rejected, blocked]
  ├─ initiatedAt   : datetime
  ├─ respondedAt   : datetime
  ├─ approvedByParent↳ : user-profile (role=parent)  # якщо kid
  └─ rejectionReason : string

friend-link
  ├─ a↳            : user-profile
  ├─ b↳            : user-profile
  ├─ since         : datetime
  ├─ status        : enum[active, muted, removed]
```

**Flow для kid (< 13):**
1. Kid sees suggested friends (algorithm: same group, same level, opted-in to discoverability).
2. Kid taps "+" → `friend-request` created з status `parent_approval`.
3. Parent both sides отримують notification: "Ваша дитина хоче додати в друзі Anna".
4. Both parents мають approve.
5. Якщо обидва approve → status `approved` → `friend-link` created.
6. Якщо хоч один reject → status `rejected`, kids бачать "На жаль, не вдалось".
7. Audit: parental decision logged.

**Flow для teen (13-17):**
- Teen може sent + accept request **сам**, але parent отримує notification (read-only); parent може блокувати конкретний friend через `/parent/child/:id/friends/:friendId/block`.

**Flow для adult:**
- Self-managed; no parent involvement.

**Cross-age block:**
- Kid (8) cannot friend teen (15) → `friend-request` rejected automatically server-side з reason "Age gap exceeds policy".
- Same family (parent links overlap) — exempt (sibling може дружити з молодшим братом).

### 15.9. Teacher ↔ Parent nudges

Teacher може trigger'нути nudge до parent — це проактивна сповіщалка, що з дитиною щось відбувається (positive чи concern).

**Nudge types** (новий schema):

```
parent-nudge
  ├─ child↳            : user-profile (student)
  ├─ teacher↳          : user-profile (teacher) — sender
  ├─ parent↳           : user-profile (parent) — recipient (auto: primary parent of child)
  ├─ kind              : enum[
                            "missed_lessons",          // skipped 2+ in a row
                            "homework_overdue",         // > 3 days late
                            "improvement",              // level up suggestion
                            "behavioral_concern",       // не для kids — для teen+
                            "celebration",              // perfect score / milestone
                            "schedule_change_request",
                            "payment_reminder",         // teacher не може per se — це admin
                            "general"                   // free-form
                         ]
  ├─ severity          : enum[info, positive, warn, urgent]
  ├─ subject           : string (i18n templated)
  ├─ body              : text (teacher writes free-form або uses template)
  ├─ suggestedAction   : enum[reply, schedule_call, no_action_needed]
  ├─ status            : enum[draft, sent, acknowledged, replied, archived]
  ├─ sentAt, acknowledgedAt, repliedAt : datetime
  ├─ replyMessage↳     : chat-message  (якщо parent replied through linked chat)
```

**Templates** (i18n у `email-template`):

- `nudge.missed_lessons` — "Anna пропустила 2 уроки поспіль (12 і 15 квіт). Чи все гаразд? Можемо обговорити."
- `nudge.homework_overdue` — "Домашнє 'Past Simple Practice' прострочене на 4 дні. Чи потрібна допомога?"
- `nudge.celebration` — "🎉 Anna показала чудовий прогрес — 3 'perfect score' поспіль!"
- `nudge.improvement` — "Думаю Anna готова перейти на B1. Хочете обговорити?"

**Flow:**
1. Teacher на `/dashboard/student/[id]` → button "Send nudge to parent" → modal:
   - Pick template OR free-form.
   - Edit before sending.
   - Set severity.
   - Pick action: schedule call slot? reply chat? FYI?
2. Send → POST `/api/parent-nudges`.
3. Parent отримує:
   - Push notification (urgent → high priority sound).
   - Email (для warn/urgent).
   - In-app banner на `/parent/home` "Maria S. написала вам про Anna" + CTA.
4. Parent action:
   - "Acknowledge" → `acknowledgedAt` set.
   - "Reply" → opens chat thread parent↔teacher (creates if not exists).
   - "Schedule call" → opens teacher availability slots (limited to next 7 days).
5. SLA: якщо `urgent` без acknowledge за 24 год → escalation до admin.

**Auto-generated nudges** (no teacher action):
- Cron analyzes daily: students with 2+ missed lessons → auto-create nudge in `draft` for teacher to review/send (not auto-sent — teacher curates message).
- Цей "draft inbox" — це `/dashboard/teacher/nudges` queue, частина teacher dashboard (§16).

### 15.10. Weekly digest

- Email + in-app card, send Sunday 20:00 user TZ.
- Per-child summary (якщо багато дітей — окремий email per child).
- Sections:
  1. **TL;DR** — "Anna мала 4 заняття, 3 ✅ домашніх, 6 годин. Прогрес: A1 → A2 (12%)."
  2. **Достеменні досягнення** — badges, level-up, perfect scores.
  3. **Що варто знати** — missed lessons, overdue HW, payment status.
  4. **Що далі** — наступні уроки, призначені домашні.
  5. **CTAs** — "Поговорити з вчителем", "Оновити підписку".
- Generation: cron job `generate-parent-digest` — для кожного active parent аккаунта з принаймні 1 child з активністю за тиждень.
- Storage: `parent-digest` table з `parent`, `child`, `weekKey`, `payload`, `sentAt`, `openedAt`, `clickedAt` (для analytics open rate).
- Opt-out: setting `notifications.weekly_digest=false` (default true).

### 15.11. Parental controls — runtime evaluation

Controls (з §14.4.14) живуть на `student-profile`, але WRITE-доступ — тільки parent з `parent-link.canModifyControls=true`.

**Endpoint**: `PUT /api/students/:id/controls` (server-side вирішує hwich fields parent може писати):

```ts
// Whitelist of fields parent can write
const PARENT_WRITABLE = new Set([
  'dailyTimeLimitMin',
  'energyMax',
  'soundEffectsEnabled',
  'lessonAutoplay',
  'publicLeaderboardOptOut',
  'preferredVoice',
  'captionsEnabled'
]);

// Plus separate parent-link booleans:
// canViewChat, canViewHomework, canMessageTeacher
```

**Не може writes from parent:**
- `totalCoins`, `totalXp`, `streakDays` (game state).
- `currentLevel`, `targetLevel` (academic).
- `companionAnimal`, `activeCharacter` (kid choice).
- `marketingOptIn`, `consentTermsAt` (audit fields — змінюються через окремі consent flow).

Спроба writes → 403 з deta`{"forbiddenField":"X"}`.

**Cache invalidation:**
- При write → `cache.del('student:controls:{id}')`.
- WS push до active sessions kid'а — `{ type: 'controls.changed', payload: {...} }` → kid client refetches & applies (e.g., daily limit updates immediately).

**Audit:** кожна зміна → `audit-log` з `before`/`after`. Parent UI: "Історія змін налаштувань" — last 50.

### 15.12. Notification preferences (per parent)

Окремий schema `notification-preference`:

```
user↳*           : user-profile (parent or self-managing student)
type*            : enum (з §14.X catalog: lesson_reminder, homework_due, ...)
inApp            : boolean default true
push             : boolean default true
email            : boolean default false
sms              : boolean default false
quietHoursFrom   : time
quietHoursTo     : time
```

UI `/parent/settings/notifications`: matrix table, toggle per type per channel.

Default presets:
- `Important only` — все опціональне OFF, тільки `payment_failed`, `urgent_nudge`, `safety_alert` ON.
- `Standard` — default установка.
- `Everything` — всі типи через всі канали (для перших днів onboarding).

Server при send notification:
1. Load `notification-preference` for `(user, type)`.
2. Filter channels.
3. Check quiet hours (якщо in window — defer до end of window for low-priority, immediate для urgent).
4. Send only до allowed channels.

### 15.13. Edge cases / open questions

**Edge cases:**

| Scenario | Behavior |
|----------|----------|
| Parent ділить parental link з ex-partner; вони сваряться | Each parent independent `parent-link`. `isPrimary` — лише один. Conflicting controls → "last write wins" + audit; UI повідомляє про conflict. |
| Parent помер / зник | Admin може transfer `isPrimary` до іншого active parent через support runbook. |
| Kid турбує parent message-spam | Rate limit на nudges від teacher (max 5/тиждень/parent without acknowledge). |
| Parent не платить, kid grace 7 днів | Coin balance frozen (можна earn, не можна spend); homework/lessons read-only; UI banner "Підписка прострочена". |
| Parent забув PIN до kid аккаунта | Reset через email parent'а (24h cooldown) → новий PIN sent to parent UI. |
| Two parents від різних дітей claim same email | Email unique на `users-permissions.user` — тільки 1 owns; інший має різний email або linking flow. |
| Parent x scope: бачить чужого student'а через bug | Server **завжди** filter за `parent-link.child IN (...)` — defensive, тести покриває. |

**Open questions для §15:**

1. **Bundle plan для multi-child**: family plan з price discount чи лінійний (-20% за 2nd child)? → `[decision: family plan flat — 1 ціна за до 3 children, +30% за кожну наступну]`.
2. **Parent-to-parent візит**: чи може parent A бачити кімнату kid'а parent'а B (для playdate)? → `[decision: NO у MVP. Friend кімнати — лише дитячий-дитячий через social safety]`.
3. **Co-parent invite**: parent A може запросити parent B (мама запрошує татка)? → `[decision: YES. Окремий flow `/parent/child/:id/co-parent/invite` → email link → claim → second active parent-link]`.
4. **Email digest у різних мовах для multi-locale parent**: якщо parent.locale=uk + child.locale=en — який мова digest? → `[decision: digest у parent.locale]`.
5. **Parent dashboard PWA / native app**: окремий app чи спільний? → `[decision: спільний PWA, route-gated]`.
6. **Parent-not-paying**: parent може тільки моніторити, без платіжних прав (e.g. бабуся)? → `[decision: YES. `canPay=false` приховує payment UI повністю; primary parent invites grandparent з обмеженим scope]`.
7. **Anonymized public dashboard**: чи може parent share read-only link на progress дитини (e.g. для бабусі без аккаунта)? → `[decision: post-launch B+1, signed URL з 7-day TTL]`.

---

## 16. Teacher classroom management — deep dive

### 16.1. Зона відповідальності teacher аккаунта

Teacher = центр контенту + взаємодій. Він:

1. **Авторує уроки** (Lesson з contentBlocks DZ + engineSteps DZ).
2. **Авторує домашні** (Homework templates).
3. **Веде групи** (Group), додає/видаляє students.
4. **Планує заняття** (ScheduledLesson, AvailabilityTemplate).
5. **Веде Live-уроки** (відмітка attendance, in-lesson notes).
6. **Перевіряє домашні** (review submissions, leave feedback).
7. **Чатиться** з students та parents.
8. **Відстежує прогрес** (analytics dashboard).
9. **Відправляє nudges** до parents (§15.9).
10. **Створює mini-tasks** для практики поза уроками.

**Чого teacher НЕ робить:**
- Не виставляє ціни за програми (admin / org owner).
- Не видаляє чужі уроки.
- Не імперсонейтить students.
- Не змінює coin balance напряму (тільки через "give bonus" з audit, max 50 coins/тиждень/student).
- Не редагує payments / refunds (admin-only).

### 16.2. TeacherProfile capabilities (refresher + addition)

Розширюємо §4.9.1 `teacher-profile` додатковими полями:

```
canCreatePublicLessons : boolean default false  # лиш verified teachers; admin grants
canMassMessageGroups   : boolean default true
maxConcurrentStudents  : int default 30
acceptingNewStudents   : boolean default true
preferredAgeGroups     : json   # ["kids","teen","adult"]
mainSubject            : enum[general,exam,kids,business,academic]
calendlyUrl            : string                  # external scheduling integration
zoomMeetingTemplate    : json   # default settings для recurring meetings
giveBonusUsedThisWeek  : int default 0          # rate-limit lifecycle hook
giveBonusResetAt       : datetime
weeklyHoursLogged      : int default 0          # for payroll, computed
substituteTeachers↳    : user-profile (manyToMany) # backups
```

### 16.3. Group — повний lifecycle

#### 16.3.1. Schema (детальний)

```
api::group.group
├─ documentId       : uuid
├─ name*            : string
├─ slug!            : uid(targetField=name)
├─ teacher↳*        : user-profile (role=teacher) — primary owner
├─ coTeachers↳      : user-profile (manyToMany, role=teacher)
├─ program↳         : program
├─ level            : enum[A0..C2]
├─ ageMode          : enum[kids,teen,adult,mixed]
├─ kind             : enum[regular, intensive, exam_prep, club, oneShot]
├─ status           : enum[forming, active, paused, completed, archived] default "forming"
├─ maxStudents      : int default 8
├─ minStudents      : int default 2
├─ students↳        : user-profile (manyToMany, через GroupMembership)
├─ schedule         : DZ schedule-rule (weekly, biweekly, custom)
├─ defaultDurationMin: int default 60
├─ defaultMeetingUrl: string
├─ startsAt         : date
├─ endsAt           : date
├─ pricePerStudent  : biginteger          # копійки
├─ priceForGroup    : biginteger          # альтернативна модель — флет з усіх учнів
├─ syllabus↳        : program             # шабл. learn path
├─ enrolledLessons↳ : lesson (ordered manyToMany)
├─ chatThread↳      : chat-thread (kind=group, auto-created)
├─ tags             : json
├─ organization↳    : organization
└─ archivedAt       : datetime

api::group-membership.group-membership
├─ group↳*          : group
├─ student↳*        : user-profile (role=student)
├─ joinedAt         : datetime *
├─ leftAt           : datetime
├─ status           : enum[invited, active, paused, left, removed] default "invited"
├─ role             : enum[student, captain]   # captain — старший в групі (peer support)
├─ inviteToken      : string                   # для self-onboard via link
├─ inviteAcceptedAt : datetime
└─ removalReason    : string
```

Unique: `(group, student)` — один student в групі може бути лише один membership active одночасно.

#### 16.3.2. Group state machine

```
forming ──teacher adds 1 student──► forming
forming ──teacher publishes (>=minStudents)──► active
active ──pause──► paused ──resume──► active
active/paused ──completion (endsAt reached)──► completed
any ──teacher archives──► archived
```

Side-effects on transition:
- `forming → active`:
  - Generate ScheduledLessons за `schedule` rule на наступні 90 днів.
  - Activate `chat-thread.chat-thread` (kind=group).
  - Notification to all members.
  - Reserve TeacherSlots.
- `active → paused`:
  - Cancel future ScheduledLessons (status=cancelled, reason="group_paused").
  - Notification до members.
  - Members зберігають доступ до chat archive + past lessons.
- `paused → active`:
  - Re-materialize ScheduledLessons від today.
  - Notification "Група відновила роботу".
- `* → completed`:
  - Lock chat (read-only).
  - Issue completion certificates (PDF, generated job).
  - Send digest email to each student.
- `* → archived`:
  - Hide from default lists; admin search ще може знайти.
  - Cancel any pending future events.

#### 16.3.3. Adding students to group

3 шляхи:

**A. Direct add (teacher invokes):**
1. `/dashboard/groups/[id]/add-student` — pick from existing students того ж teacher.
2. POST `/api/group-memberships` `{ groupId, studentId, role: 'student' }`.
3. Membership створюється з status=`invited`.
4. Student отримує notification + auto-accept (бо teacher уже manage's його). Якщо student інший — потребує accept.

**B. Self-join via invite link:**
1. Teacher generates invite link → `/api/groups/[id]/invite` returns `{ token, url, expiresAt }`.
2. Link looks like `https://app.englishbest.com/join-group/abc123`.
3. Student clicks → if logged in → auto-create membership; else login flow + then accept.
4. Token can be one-time або multi-use; `maxRedemptions` configurable.

**C. CSV bulk import (admin-assisted):**
1. Teacher uploads CSV з emails / phone numbers.
2. Server matches existing users → creates pending memberships.
3. For non-existent users → sends invite emails з sign-up link + group context.
4. Audit: bulk import logged.

#### 16.3.4. Group removal flow

- Teacher → `/dashboard/groups/[id]/members/[membershipId]` → "Remove from group".
- Modal asks reason (free-text) + "transfer assignments?" (Y/N).
- If Y → unfinished assignments transfer to "individual" assignments (no group); coins/XP залишаються.
- If N → assignments cancelled (status=cancelled, reason="removed_from_group").
- Membership.status=`removed`, `leftAt=now`, `removalReason` saved.
- Notification до student + parent (якщо kid).
- Chat: student loses access to group thread; archive read-only access лишається на 30 днів.

### 16.4. Lesson authoring UX

Це найскладніший teacher flow — потрібен ретельний UX.

#### 16.4.1. Layout

```
/dashboard/teacher-library/[id]/edit
├─ Sidebar (left, 280px)
│   ├─ Lesson meta (title, level, program, status)
│   ├─ Cover image
│   └─ Outline (list of blocks з reorderable drag handle)
├─ Canvas (center, max-width 760px)
│   └─ Block editor (selected block expanded)
└─ Preview panel (right, toggle, 360px)
    ├─ Tabs: Teacher view | Student view (game / classic)
    └─ Live preview iframe
```

#### 16.4.2. Block insertion

- Floating "+" button between blocks (hover).
- Click → menu з 12 block types (з §3.3 / §4.4):
  - **Text** (rich text)
  - **Heading**
  - **Quiz (single)**, **Quiz (multi)**
  - **Fill blank**
  - **Match pairs**
  - **Word order**
  - **Translate**
  - **Image**
  - **Video**
  - **Audio**
  - **Divider**
- Pick → block inserted з default props → expanded for edit.

#### 16.4.3. Per-block editor

Each block type має свій editor component. Спільні елементи:
- "Required" toggle (чи обов'язково для completion).
- "Coin/XP reward" inputs (default per type, можна override).
- "Time limit" optional.
- "Hide from preview" toggle (чернетка блоку).

Specifics per type — зрозуміло з component schema (див §4.4 / §4.10).

#### 16.4.4. Engine steps generation

Після того як teacher створить `contentBlocks`, треба створити `engineSteps` (формат для player).

Дві моделі:
1. **Auto-derive** (default): кнопка "Згенерувати engine steps" → `transformBlocksToSteps(contentBlocks)` → outputs до DZ. Teacher може edit після.
2. **Manual edit**: окремий tab "Engine steps" — teacher draws sequence окремо. Корисно коли player потрібен інший порядок чи різна granularity.

Adapter `transformBlocksToSteps`:
- text/heading/divider → `theory` step з body=concat of texts.
- quiz-single → `multiple-choice` (allowMultiple=false).
- quiz-multi → `multiple-choice` (allowMultiple=true).
- fill-blank → `fill-blank`.
- match-pairs → `match-pairs`.
- word-order → `word-order`.
- translate → `translate`.
- image → `image`.
- video → `video`.
- audio → fold у попередній theory/quiz step (як attached media).

Implementation lives у `packages/shared/src/lesson-adapter.ts` (shared between Strapi seed-time generation і Next.js client preview).

#### 16.4.5. Preview

- "Teacher view" — full content blocks layout (як автор).
- "Student view game" — як kid побачить (full-screen, companion overlay, large text).
- "Student view classic" — як adult побачить.
- Toggle TZ + locale у preview controls.
- Hot-reload — зміни в редакторі applied to preview за < 500ms (debounced patch).

#### 16.4.6. Versioning & publish

- Lesson `status: draft | ready | published | archived`.
- Save → автозбереження кожні 30с + on blur.
- "Publish" → status=published, lesson-version snapshot створюється, lastPublishedAt set, students notified (if assigned).
- "Unpublish" → status=draft, but assigned students still see frozen `contentSnapshot`.
- "View previous versions" → list of `lesson-version` rows з diff modal.
- "Restore version X" → copy snapshot back to current draft.

#### 16.4.7. Collaboration (post-launch)

- Multiple teachers editing same lesson → real-time presence cursor (Yjs / Liveblocks).
- Conflict resolution: CRDT-based.
- For MVP: simple lock — teacher #1 editing → teacher #2 sees "Editing by Maria S., try again later".

### 16.5. Attendance flow

#### 16.5.1. Як teacher відмічає attendance

Кожна `scheduled-lesson` має attached `attendance` records (з §4.9.16) — один на student.

**UI flow (online lesson):**
1. Teacher opens `/dashboard/teacher-calendar/[scheduledLessonId]` за 5 хв до start → "Lesson room" view.
2. Server auto-creates attendance rows для всіх expected students (from group або individual).
3. Default status — `pending` (новий enum value у §4.9.16).
4. Teacher натискає "Start lesson" → status auto-updates: всі pending → `present` (за presence через WS); якщо хтось не joined через 10 хв → залишається `pending`.
5. Teacher може manually adjust per row: present / late / absent / excused.
6. "End lesson" → review pop-up: "Все коректно? Confirm and award coins".
7. Confirm → for each present/late student: lesson_completed event + coin/xp credit.

**UI flow (offline / in-person):**
1. Teacher opens lesson → manual mode toggle on.
2. Tap кожен student → cycle present → late → absent.
3. Save → bulk update.

#### 16.5.2. Status semantics

| Status | Effect | When set |
|--------|--------|----------|
| pending | none | default before lesson |
| present | full coin/xp | teacher confirms або auto-via WS presence |
| late | coin/xp -25% | teacher marks; lateMinutes optional |
| absent | no reward | teacher marks; counts toward "missed lessons" nudge trigger |
| excused | no reward, no penalty toward streak | teacher marks; reason required (illness, vacation) |
| no_show | no reward, AND counts as paid-but-missed (relevant для refund policy) | teacher marks; for paid 1-on-1 |

#### 16.5.3. Auto-rules

- Якщо teacher не закрив lesson за 24 год після `endAt` → cron auto-marks `pending` → `absent` для всіх; notification to teacher "Будь ласка, оновіть attendance for lesson X".
- 3 absent поспіль для одного student → auto-trigger nudge draft до parent (§15.9).
- 5 absent протягом місяця → auto email до admin (suspect ghost subscription).

#### 16.5.4. Bulk export

- Teacher може export CSV attendance per group / per period.
- `GET /api/groups/[id]/attendance.csv?from=...&to=...` returns: student email, dates, statuses.
- Use case: bookkeeping, school reports.

### 16.6. Mass-message templates

Mass-message — broadcast to many students at once (з §4.9.15).

#### 16.6.1. Audience builder UI

- Teacher choose source:
  - "All students of group X"
  - "All my students" (across groups)
  - "Custom segment" — combine 2+ DZ segments (з §4.10):
    - role-is, level-between, program-is, group-is, last-active-before, last-active-after, subscription-status.
- Live preview: "Audience: 23 students" (server computes count async).
- Server limit: max 200 recipients per single send (rate-limit).
- For larger — split into batches via admin escalation.

#### 16.6.2. Composer

- Subject + body (markdown або rich-text).
- Variables: `{{firstName}}`, `{{programName}}`, `{{nextLessonAt}}`, `{{coinsBalance}}`, `{{streakDays}}`.
- Server renders per recipient at delivery time.
- Channels selector: in-app, push, email, sms (sms — admin-only / paid).
- Schedule: send now / schedule for X.

#### 16.6.3. Templates library

Pre-built templates teacher can pick:

| Slug | Use case |
|------|----------|
| `mm.welcome_to_group` | New group started; intro |
| `mm.homework_reminder` | "Don't forget: HW due tomorrow" |
| `mm.lesson_reschedule` | "Перенесли урок на ..."; vars: oldTime, newTime |
| `mm.holiday_break` | "На канікули з 28 квіт по 5 трав" |
| `mm.encouragement` | "Молодець! Прогрес чудовий" |
| `mm.exam_prep_tips` | seasonal — для exam-prep groups |
| `mm.feedback_request` | "Оцініть мою роботу" з link to survey |
| `mm.group_reactivation` | "Раді знову бачити!" — для paused groups |

Custom templates per teacher: save own → reuse.

#### 16.6.4. Delivery pipeline

1. Teacher publishes mass-message → POST `/api/mass-messages`.
2. Server validates audience size (< 200), permissions, content (no banned words).
3. Mass-message stored with status `scheduled`.
4. Cron / job processor `mass-message-expander`:
   - Resolve audience segments → list of recipient user IDs.
   - For each → create `mass-message-delivery` row + queue per-channel job.
5. Per-channel jobs send (in-app via WS push, email via Postmark, push via FCM, sms via Twilio).
6. Aggregate stats updated in real-time на teacher's `/dashboard/mass-messages/[id]` page (sent / delivered / opened / clicked).

#### 16.6.5. Compliance

- All mass-messages auto-include unsubscribe link (for email channel).
- "Educational" tag (legal exempts educational from marketing rules).
- Recipient можна mute teacher через `notification-preference.user_mass_messages_from.{teacherId}=false`.
- Teacher не може bypass mute via mass-message (server filter).

### 16.7. Teacher analytics — formulae

Endpoint: `GET /api/analytics/teacher/me?period=week|month|quarter`

Sections (з канонічними формулами):

#### 16.7.1. Hero metrics

| Metric | Formula | Update |
|--------|---------|--------|
| Active students | count(distinct student where studentMembership.status=active across all my groups) | real-time |
| Lessons taught (period) | count(scheduled-lessons where teacher=me AND status=done AND endAt in [period]) | nightly cron + on-demand |
| Hours taught (period) | sum(durationMin) / 60 для тих самих lessons | same |
| Avg attendance % | avg per lesson(present + late) / total expected × 100 | same |
| Avg homework score | avg(submission.score / submission.maxScore × 100) where reviewed in period | same |
| Avg review SLA hours | avg(reviewedAt - submittedAt in hours) | same |
| Coins awarded (period) | sum(coin-ledger.amount where granted by me OR via my lessons) | same |

#### 16.7.2. Student-level table

Per active student (rows):
- name, level, joinDate, lastActive
- lessons completed (period) / attended %
- HW completed / pending / overdue
- avg HW score
- streak days (current / longest)
- nudges sent
- payment status (paid / past_due / trial)

Sortable, filterable. CSV export.

#### 16.7.3. Cohort retention

- Triangle/cohort table: students за тижнем onboarding × week 1, 2, 4, 8, 12 retention %.
- Computed via materialized view refreshed daily.

#### 16.7.4. Time-series charts

- Lessons per week (12-week trailing).
- HW completion rate per week.
- Coins awarded per week.
- Teacher "load" — hours per day heatmap (24×7).

#### 16.7.5. Performance vs platform avg

- "Your students avg HW score: 82% (platform avg: 78%)".
- Shows where teacher above/below — encourages improvement.
- Privacy: aggregated, не показує individual peer teachers.

#### 16.7.6. Implementation

- Materialized view `mv_teacher_metrics` refresh cron daily 03:00.
- For real-time hero metrics — direct query з indexed tables (fast).
- Cache key per (teacherId, period) → 10 min TTL для важких aggregations.

### 16.8. Mini-tasks creation flow

Mini-task = маленька practice одиниця (5-10 хв, 1 kind: flashcards/quiz/spelling/listening/pronounce/match — див §4.9.6).

#### 16.8.1. Use cases

- "Give Anna 10 vocab cards before next lesson" — quick assignment.
- Daily ambient practice for the whole group.
- Game-mode kids — щоденні quests (some auto-pull from teacher's mini-task pool).

#### 16.8.2. Author flow

`/dashboard/mini-tasks` → "+ New mini-task":
1. Pick kind from 6.
2. Fill payload (e.g. для flashcards — list of 10 cards з front/back/audio).
3. Set duration estimate, coin/xp reward.
4. Privacy: `public=true` → other teachers can copy → builds platform library.
5. Save → assignable.

#### 16.8.3. Assignment

- From `/dashboard/students/[id]` → "Assign mini-task" → pick from own library.
- Bulk assign to group → `POST /api/mini-task-assignments/bulk`.
- Auto-assignment: kids' daily quests (з §14.4.8) auto-pick з teacher's pool, коли `quest.kind` matches mini-task kind.

#### 16.8.4. Completion

- Student opens → completes → `mini-task-assignment.status=done`.
- Score computed client-side для objective kinds, validated server-side for sensitive.
- Coins/xp credited per template reward.
- Teacher sees in analytics "students completing your mini-tasks".

### 16.9. Teacher chat — conduct rules

Teacher має з кожним student/parent окремий thread + group thread per class.

#### 16.9.1. Thread types та автостворення

| Thread kind | Auto-created | Members |
|-------------|--------------|---------|
| `direct` (teacher↔adult-student) | при першому 1-on-1 messaging | teacher, student |
| `parent-teacher` | коли parent додав child + teacher assigned | teacher, primary parent |
| `group` | при створенні group | teacher, all group students |
| `broadcast` | теж per group, але одностороння | teacher only writes; students read |

Для kids — direct thread teacher↔kid auto-created **тільки якщо** parent.canMessageTeacher=true. Інакше parent є посередником.

#### 16.9.2. Office hours

- Teacher може set "office hours" — dropdown TZ-aware: "I respond Mon-Fri 9-18, weekends only urgent".
- Display as banner у chat: "Teacher offline — typically replies in 12h".
- Quiet hours auto-defer notifications.

#### 16.9.3. Canned replies

- Teacher може save quick replies: "Дякую, перевірю до завтра", "Чудово!", "Можемо обговорити на наступному уроці".
- Insert via `/` command у composer.

#### 16.9.4. Moderation

- Teacher може mark message як spam/abuse → reported to admin queue.
- Teacher не може delete student/parent повідомлення (audit integrity); тільки admin.
- Auto-flag: profanity filter (locale-aware) marks message → not blocked, але flagged for admin review.

### 16.10. Schedule & conflicts

#### 16.10.1. AvailabilityTemplate vs concrete slots

- Teacher defines `availability-template` (e.g. "Mon 18-20, Wed 18-20, Sat 10-14").
- Cron `materialize-teacher-slots` runs nightly → creates concrete `teacher-slot` rows for next 60 днів.
- ScheduledLesson booking — picks free slot, marks status=`booked`, links.

#### 16.10.2. Conflict detection

When teacher creates a `scheduled-lesson` manually:
1. Check if `(teacher, startAt..endAt)` overlaps з existing scheduled-lesson for same teacher.
2. Якщо так — повернути 409 з `{conflictingLessonId, suggestedAlternativeSlots: [...]}`.
3. UI propose suggestions (next 3 free slots).

When student/parent requests a slot:
1. Show only free slots (filtered server-side).
2. Optimistic lock — на reservation a slot moves to `reserved` 5-min hold while user confirms.
3. Якщо confirms — `booked`. Якщо TTL expired без confirm — back to `free`.

#### 16.10.3. Reschedule flow

`POST /api/scheduled-lessons/[id]/reschedule`:
1. Permission check: teacher always; student only if > 24h before; admin always.
2. Body: `{ newStartAt, reason }`.
3. Server:
   - Validates new slot free.
   - Creates new ScheduledLesson with same lesson/students/group.
   - Marks original as `rescheduled` з `rescheduledTo=newId`.
   - Releases original `teacher-slot`, books new.
   - Notification to all participants.
4. Audit log + class-event.

#### 16.10.4. Cancellation

`POST /api/scheduled-lessons/[id]/cancel`:
- Permission per §14.5.
- Body: `{ reason, refund?: bool }`.
- Server:
  - status=`cancelled`, cancelledBy, cancelReason set.
  - If refund=true AND lesson was paid → trigger Refund flow (admin-only auto, або просто refund tag for admin to manually process).
  - Release teacher-slot.
  - Notification to all.
  - If recurring child of recurrenceParent — option "cancel only this OR cancel future too".

### 16.11. Edge cases / open questions

**Edge cases:**

| Scenario | Behavior |
|----------|----------|
| Teacher accidentally publishes draft lesson | Versioning history → revert; no harm to assigned lessons (they have frozen snapshot). |
| Teacher leaves platform mid-semester | Admin reassigns groups to substitute via `teacher-profile.substituteTeachers`; pending HW transferred; chat archive preserved. |
| Teacher forgets to mark attendance | Cron auto-marks `absent` after 24h + nudges teacher via push. |
| Mass-message audience too large | Server caps at 200; bigger requires admin escalation. |
| Two teachers want to edit same lesson | MVP: optimistic lock with toast. Post-launch: CRDT collaboration. |
| Teacher tries to give 1000 coin bonus | Hook caps at 50/тиждень/student з explicit reason; admin can grant exceptions. |
| Teacher schedules lesson during student's other group | Server-side conflict detection across student's all schedules → warn teacher with override option. |
| Teacher wants to clone existing lesson for new group | "Duplicate lesson" copies content blocks but not assignments; new lesson goes to draft. |
| Multiple groups with same name | Name not unique; slug-based с suffix `-2`. UI shows `name • program • level` to distinguish. |
| Teacher wants to grade old archived submissions | Archive read-only after 90 days; admin can unlock for case-specific. |

**Open questions:**

1. **Co-teaching reward split**: якщо два teacher вели lesson разом (primary + co-teacher), як ділити hours toward payroll? → `[decision: hours full to primary; co-teacher gets "consultation" log; admin reviews payroll]`.
2. **Group transfer to інший teacher**: дозволяти free-form чи тільки admin? → `[decision: admin-mediated. Teacher initiates request, admin approves, students notified, has 7-day opt-out window]`.
3. **Lesson template marketplace** (post-launch): teacher може sell own lessons на платформу? → `[decision: post-launch B+2; revenue split 70/30]`.
4. **Voice notes у chat**: дозволяти teacher↔parent? → `[decision: YES. Teacher↔kid — NO у MVP (COPPA нюанси з voice storage)]`.
5. **Live lesson recording**: built-in чи external? → `[decision: external (Zoom). MVP не зберігає recordings; post-launch — opt-in зберігання у R2 з 90-day retention]`.
6. **Teacher can see other teachers' analytics?**: → `[decision: NO. Тільки aggregated platform avg, ніколи peer-named]`.

---

## 17. Admin tooling — deep dive

### 17.1. Admin scope

Admin = "operations" + "support" + "platform owner". Він:

1. **Керує користувачами** — view/edit будь-який profile, suspend/unsuspend, reset password, merge accounts.
2. **Імперсонейтить** інших користувачів для troubleshooting.
3. **Обробляє refunds** і payment disputes.
4. **Модерує контент** (chat reports, flagged lessons, abuse).
5. **Керує feature flags**, rollouts, A/B tests.
6. **Тримає content library** (programs, lessons template).
7. **Onboarding нових teachers** (verification, contracts).
8. **Аналізує платформу** — DAU/MAU, MRR, churn, NPS.
9. **Resolve support tickets**.
10. **Налаштовує billing plans, promo codes**.
11. **Аудит** — переглядає audit log, шукає anomalies.

**Чого admin НЕ робить:**
- Не входить у chat як невидимий учасник без імперсонації + audit (privacy violation).
- Не змінює DOB / consent records (immutable except через GDPR-erasure flow).
- Не коригує coin ledger напряму (тільки через `admin_adjust` reason з обов'язковим explanation, audit).

### 17.2. Admin permission tiers

Не всі admins однакові. Розділяємо tiers через `admin-profile.permissions: json[]`:

| Permission slug | Tier | Description |
|-----------------|------|-------------|
| `admin.support` | L1 | View users, send password reset, view tickets, basic moderation |
| `admin.content` | L2 | Edit programs/lessons; publish/unpublish; manage email templates |
| `admin.users` | L2 | Suspend, merge, edit profile fields; reassign teacher↔group |
| `admin.payments` | L3 | Process refunds, manual coin adjustments, payment provider config |
| `admin.platform` | L3 | Feature flags, settings, organizations, rollouts |
| `admin.security` | L4 | View audit log, impersonation, MFA reset, IP allowlist |
| `admin.devops` | L4 | Job queue, system health, manual jobs, replay webhooks |
| `admin.god` | L5 | Everything; only platform founders/CTO; alerts on every login |

Convention: each admin user has explicit list. Default for new admin: `["admin.support"]`.

Hook `before update on admin-profile.permissions`: only `admin.god` admin can grant L4+. Audit log every change.

### 17.3. Impersonation runbook

#### 17.3.1. Triggering

`POST /api/auth/impersonate`:
```json
{
  "userId": "<target>",
  "reason": "User reports cannot complete lesson; investigating",
  "ticketId": "TKT-1234",
  "durationMin": 30
}
```

Permission required: `admin.security`. Returns `accessToken` (short-lived, 30 min max).

#### 17.3.2. Impersonation token shape

JWT з claims:
```json
{
  "sub": "<targetUserId>",
  "act": { "sub": "<adminUserId>", "name": "Anna Admin" },
  "purpose": "impersonation",
  "ticketId": "TKT-1234",
  "exp": "<+30 min>"
}
```

Server enforces:
- Token expiry 30 min strict.
- All audit-log entries during this token: `actor=adminUserId`, but `subject=targetUserId`.
- Sensitive actions (payment refund, password change, etc.) **blocked under impersonation** — admin must use own non-impersonated session.

#### 17.3.3. UX visibility

- Admin браузер shows persistent banner top:
  ```
  🚨 Ви у режимі імперсонації Anna Petrenko (student) — ticket TKT-1234 — exit in 28:42
  [End impersonation] [Extend +15 min (max 1)]
  ```
- Target user has **no visible indicator** in their UI (admin invisible). However:
  - Server emits `class-event` kind=`impersonation_session` стартує/закінчується для audit.
  - User can request "show impersonation history" — `/settings/security` reveals all admin sessions on their account.

#### 17.3.4. Limits & guardrails

- Max 5 active impersonations / admin / day.
- Impersonation of admin user — **forbidden** (admin-on-admin escalation risk); only `admin.god` can.
- Cannot impersonate kids without explicit `child_safety_review=true` flag on ticket.
- Auto-end impersonation на:
  - Token expiry.
  - Admin manual end.
  - Admin logs out of own session.
  - Admin tries restricted action → 403 + force end + alert.

#### 17.3.5. Audit trail

Every impersonation creates `impersonation-session`:
```
admin↳, target↳, ticketId, reason, startedAt, endedAt, endReason: enum[expiry, manual, forced, error], actionsCount: int, ip, userAgent
```

Plus every action through impersonated session has audit-log row з `actor=admin, subject=target, impersonationSessionId=X`.

Дашборд `/admin/security/impersonations` shows all sessions, filterable.

### 17.4. Refund flow

#### 17.4.1. Trigger

Refund може ініціюватися:
- Customer support ticket (admin читає, decides refund).
- Auto-rule (e.g. teacher cancelled lesson < 4h before — auto-prompt admin to refund).
- Chargeback dispute (Stripe webhook → admin notified).

#### 17.4.2. UI flow

`/admin/payments/[paymentId]` → "Refund":
1. Pick mode: full / partial.
2. If partial — enter amount (validation: <= original, >= 1).
3. Reason enum.
4. "Send notification to user?" toggle (default true).
5. Internal note (visible only to admins).
6. Confirm → POST `/api/admin/payments/[id]/refund`.

#### 17.4.3. Server processing

```ts
async function processRefund({ paymentId, amount, reason, notifyUser, internalNote, adminUserId }) {
  return strapi.db.transaction(async (trx) => {
    const payment = await loadPaymentForUpdate(paymentId, trx);
    assert(payment.status === 'paid', 'Only paid payments refundable');
    assert(amount <= payment.amount - payment.refundedTotal, 'Exceeds refundable');

    // 1. Call provider
    const providerRefund = await callProviderRefund(payment.provider, payment.providerPaymentId, amount);
    
    // 2. Create Refund row
    const refund = await createRefund({
      paymentId,
      amount,
      reason,
      processedBy: adminUserId,
      providerRefundId: providerRefund.id,
      status: 'succeeded'
    }, trx);

    // 3. Update payment
    await updatePayment({ id: paymentId, refundedTotal: payment.refundedTotal + amount, status: amount === payment.amount ? 'refunded' : payment.status }, trx);

    // 4. If subscription — cancel or downgrade
    if (payment.subscription) {
      await cancelSubscription(payment.subscription, 'refunded', trx);
    }

    // 5. Audit + notification
    await writeAudit({ action: 'payment.refund', entityType: 'payment', entityId: paymentId, actor: adminUserId, before: { status: payment.status }, after: { status: 'refunded', refundId: refund.id }, metadata: { reason, internalNote } });
    if (notifyUser) await queueNotification({ recipient: payment.user, type: 'payment_refunded', data: { amount, currency: payment.currency } });

    return refund;
  });
}
```

#### 17.4.4. Edge cases

- **Provider refund fails** (e.g. дисат банка) → Refund row status=`failed`, payment залишається `paid`, admin notified to retry.
- **Coins already spent** (refund retroactive): policy = "Не відбираємо вже зароблених/спожитих coins". Subscription скасовується, але кімната + items зберігаються.
- **Multi-child family plan refund**: refund applies до всієї subscription, всі beneficiaries lose access.
- **Currency mismatch**: refund must match original currency (no conversion).
- **Partial refund після часткового спожиття**: pro-rata calculation: `amount = paid * (unusedDays / totalDays)`. Manual override allowed.

### 17.5. Content moderation

#### 17.5.1. Sources of flags

- Auto profanity/abuse filter on chat-message.
- "Report" button on UGC (room visit reaction, friend request, custom-item creator name).
- Auto-flag on lesson content (admin-created keywords list).
- Teacher reports student/parent for abuse.
- Anomaly: 5+ abusive messages in 1h from one user → auto flag + temp mute.

#### 17.5.2. Moderation queue

`/admin/moderation` — Kanban-style:

| Column | Items |
|--------|-------|
| New | unrevied flags, sorted by severity |
| In review | being reviewed by admin (lock 30 min) |
| Action taken | resolved with action |
| Dismissed | false alarm |

Each row: type (chat-message / lesson / room-item / friend-name), source (auto / user-reported), severity, content preview, related users, time.

#### 17.5.3. Actions per type

| Content type | Possible actions |
|--------------|------------------|
| chat-message | dismiss; soft-delete (replace text "Removed by moderator"); permanent delete; warn user; suspend user; ban user |
| lesson (published) | dismiss; unpublish; revert to previous version; ban author |
| custom shop-item / character / room-name | dismiss; remove from inventory + refund coins; ban creator |
| friend-name profanity | dismiss; auto-rename "Player_<random>"; warn user |
| room screenshot (viewable by friends) | dismiss; force-clear placement |

Action triggers:
- `audit-log` row.
- Notification to user (template per action).
- Moderation row → `Action taken` column with note.

#### 17.5.4. Auto-moderation rules (configurable)

`api::moderation-rule.moderation-rule`:
```
slug, name, scope: enum[chat,lesson,custom-name,...]
matcher: json   # { kind: 'regex', pattern: '...' } OR { kind: 'profanity-list', list: 'uk-strong' }
locale: enum
action: enum[flag, soft-delete, hard-delete, warn, suspend]
severity: enum[low, medium, high, critical]
isActive: boolean
```

Cron job re-evaluates new content; existing content re-scanned via job on rule change.

### 17.6. Feature-flag rollout patterns

#### 17.6.1. Schema reuse (з §4.9.17)

Plus rollout-specific fields:

```
feature-flag (extended)
  ├─ slug, description, enabled, rolloutPercent, audience, variants, updatedBy
  ├─ rolloutStrategy : enum[off, percent, audience-only, audience-then-percent]
  ├─ stickyAssignment : boolean default true   # once user gets variant — stays
  ├─ killSwitch       : boolean default false  # emergency disable
  └─ scheduledRollout : json   # [{at: dt, rolloutPercent: 25}, ...]
```

#### 17.6.2. Evaluation logic

```ts
function evaluate(flag, user) {
  if (flag.killSwitch) return { enabled: false, reason: 'kill-switch' };
  if (!flag.enabled) return { enabled: false, reason: 'disabled' };

  if (flag.audience) {
    if (matchAudience(flag.audience, user)) return { enabled: true, variant: pickVariant(flag, user), reason: 'audience' };
    if (flag.rolloutStrategy === 'audience-only') return { enabled: false, reason: 'not-in-audience' };
  }

  // Percent
  const bucket = murmur3(`${flag.slug}:${user.id}`) % 100;
  if (bucket < flag.rolloutPercent) return { enabled: true, variant: pickVariant(flag, user), reason: 'percent' };
  return { enabled: false, reason: 'percent-miss' };
}
```

Sticky: result cached per user in `flag-assignment` table → next evaluation returns same variant.

#### 17.6.3. Rollout patterns

- **Dark launch**: enabled=false, code shipped, admin тестує через `audience.userIds` allowlist.
- **5/25/50/100**: scheduled rollout — 5% Mon, 25% Wed, 50% Fri, 100% next Mon. Cron applies.
- **Canary**: 1% for 24h → metrics check (Sentry error rate < threshold) → scale up.
- **Hold-at-X**: stop scheduled rollout if metric breached.
- **A/B test**: variants `{control: 50, treatment: 50}` + outcome event tracking → analytics dashboard.
- **Geographic**: audience filter за `user.timezone` / IP geolocation.
- **Per-organization**: audience filter `orgIds: [...]` (для tenant-specific betas).

#### 17.6.4. Cleanup process

Flag debt is real. Convention:
- Each flag has `ownerTeam` + `expectedRemoveBy` (date).
- Auto-reminder 30 days before deadline.
- After deadline + 14 days — flag turns red on dashboard, blocks new flag creation by same owner.
- "Tech debt sprint" quarterly to remove obsolete flags from code + DB.

### 17.7. Support ticket queue

#### 17.7.1. Schema

```
api::support-ticket.support-ticket
├─ documentId, slug
├─ requester↳        : user-profile (any role)
├─ subject*          : string
├─ initialMessage*   : text
├─ category*         : enum[payment, lesson, technical, account, abuse, other]
├─ priority          : enum[low, normal, high, urgent]  default "normal"
├─ status            : enum[new, assigned, in_progress, waiting_user, resolved, closed]
├─ assignedTo↳       : user-profile (role=admin)
├─ assignedAt        : datetime
├─ firstResponseAt   : datetime
├─ resolvedAt        : datetime
├─ closedAt          : datetime
├─ resolutionNote    : text
├─ csat              : int (1-5)         # filled by user post-resolution
├─ csatComment       : text
├─ tags              : json
├─ relatedEntities   : json   # [{type:'payment',id:'...'}]
└─ thread↳           : chat-thread (auto-created kind=support)
```

#### 17.7.2. Lifecycle

- User submits via `/support` → ticket created з status=`new`, thread auto-created з admin-bot welcome.
- Admin queue `/admin/support` shows new tickets sorted by priority+age.
- Admin assigns to self (or auto-assign by category routing rules).
- Admin replies in chat thread → user receives notification.
- Status transitions:
  - new → assigned (admin claims).
  - assigned → in_progress (admin sends first reply).
  - in_progress → waiting_user (admin asks for info).
  - waiting_user → in_progress (user replies).
  - in_progress → resolved (admin marks).
  - resolved → closed (auto after 7 days no reply OR user confirms).
  - resolved → in_progress (user replies "not solved").

#### 17.7.3. Auto-routing rules

- Category=`payment` → assign to `admin.payments` group (round-robin available admins).
- Category=`abuse` → urgent priority, assign to `admin.security`.
- Category=`technical` → if user is teacher → senior support; else default.
- Multi-language: route to admin with matching `locale` capability.

#### 17.7.4. Templates / canned responses

Admin same UI as teacher (§16.9.3) — `/` insert canned reply per category.

#### 17.7.5. SLA dashboard

- First response time: target < 4h working hours.
- Resolution time: target < 24h for urgent, < 72h for normal.
- Backlog: open ticket count by age (red > 5 days).
- CSAT: weekly avg.

### 17.8. Admin analytics dashboard

`/admin/analytics`:

#### 17.8.1. Top metrics

- DAU / WAU / MAU by role.
- New signups per day / week.
- Active subscriptions (count, sum MRR).
- Churn rate (monthly).
- ARPU (avg revenue per paying user).
- Lesson completions / day.
- Avg session duration.
- Support ticket backlog.
- Error rate (Sentry).

#### 17.8.2. Cohort analysis

- Retention triangle.
- LTV by cohort.
- Conversion funnel: signup → onboarding complete → first lesson → first payment.

#### 17.8.3. Revenue

- MRR by plan.
- Refund rate.
- Failed payment rate (and reasons).
- Promo code usage.

### 17.9. Edge cases / open questions

| Edge case | Behavior |
|-----------|----------|
| Admin deletes user with active subscription | Block delete; require subscription cancelled first. |
| Two admins editing same lesson at the same time | Lesson version protect; last-write-wins з conflict warning. |
| Admin tries to refund > subscription value | 422 з clear message about how much refundable. |
| Feature flag flips during user mid-action | Sticky assignment ensures user stays in same variant for session. |
| Bot floods support tickets | Rate limit + captcha + flag detection (>5 tickets/hour from same user). |
| Admin role removed mid-session | All access tokens for that user invalidated next request (tokenVersion bump). |

**Open questions:**

1. **Self-service plans pricing edits**: admin може change plan price, як це впливає на existing subscribers? → `[decision: existing subscribers grandfathered, new price applies to new sign-ups]`.
2. **Multi-currency MRR aggregation**: convert all to USD daily? → `[decision: yes, snapshot daily ECB rate; report in primary org currency]`.
3. **Bot suport (LLM)**: чи додавати auto-suggest replies для admin? → `[decision: post-launch B+1, embedded but always require admin send]`.
4. **Teacher verification process**: full KYC? → `[decision: MVP — manual review of self-uploaded diploma + interview; post-launch — Persona/Onfido integration]`.

---

## 18. Notifications taxonomy

### 18.1. Архітектура

```
[Event in domain] ─► NotificationDispatcher ─► resolve recipients ─► load NotificationPreference per recipient
                          │                                                   │
                          ▼                                                   ▼
                    create Notification(s) ◄─────────────────────  filter channels
                          │
                          ├─► in-app push (WS via Ably)  ─► visible badge
                          ├─► push (FCM/APNs)            ─► OS notification
                          ├─► email (Postmark)           ─► template + render
                          └─► sms (Twilio)               ─► (rare, paid, opt-in only)
```

Кожне notification — рядок у `notification` (з §4.9.15) + log запис у `notification-delivery` per channel.

### 18.2. Канонічний event catalog

Структура: `slug` · scope · default channels · severity · template вар.

#### 18.2.1. Account / auth

| Slug | Recipient | Default channels | Severity | Trigger |
|------|-----------|------------------|----------|---------|
| `auth.welcome` | new user | email + in-app | normal | signup complete |
| `auth.email_verify` | self | email | normal | signup, email change |
| `auth.password_reset` | self | email | normal | reset requested |
| `auth.password_changed` | self | email + in-app | high | successful change |
| `auth.new_device_login` | self | email + push | high | unrecognized device |
| `auth.suspicious_activity` | self + admin | email + push (user); email (admin) | urgent | brute force, geo anomaly |
| `auth.account_suspended` | self | email | urgent | admin suspended |
| `auth.account_reactivated` | self | email + in-app | normal | admin restored |

#### 18.2.2. Lessons

| Slug | Recipient | Default channels | Severity | Trigger |
|------|-----------|------------------|----------|---------|
| `lesson.scheduled` | student, parent | in-app + email | normal | new ScheduledLesson |
| `lesson.reminder_24h` | student, parent | push + email | normal | cron 24h before |
| `lesson.reminder_1h` | student, parent | push | normal | cron 1h before |
| `lesson.reminder_5min` | student | push | high | cron 5min before |
| `lesson.starting_now` | student, teacher | push + in-app | urgent | startAt reached |
| `lesson.cancelled` | student, parent | in-app + email + push | high | cancellation |
| `lesson.rescheduled` | student, parent, teacher | in-app + email | high | reschedule |
| `lesson.completed` | student | in-app | normal | finished, coins awarded |
| `lesson.missed_no_attendance` | teacher | in-app | normal | 24h without attendance mark |

#### 18.2.3. Homework

| Slug | Recipient | Default channels | Severity | Trigger |
|------|-----------|------------------|----------|---------|
| `homework.assigned` | student, parent | in-app + push | normal | new HomeworkAssignment |
| `homework.due_soon` | student, parent | push | normal | cron, 24h before due |
| `homework.overdue` | student, parent | in-app + push + email (parent) | high | cron, after dueAt |
| `homework.submitted` | teacher | in-app | normal | student submits |
| `homework.reviewed` | student, parent | in-app + push + email (parent) | normal | teacher reviews |
| `homework.returned` | student, parent | in-app + push | high | teacher returns for fixes |
| `homework.feedback_added` | student | in-app | normal | teacher adds late feedback |

#### 18.2.4. Mini-tasks / quests

| Slug | Recipient | Default channels | Severity | Trigger |
|------|-----------|------------------|----------|---------|
| `quest.daily_ready` | student (kid mode) | in-app | normal | cron 09:00 user TZ |
| `quest.streak_at_risk` | student (kid mode) | push | high | cron 21:00 user TZ if no activity today |
| `quest.streak_lost` | student, parent | in-app | normal | cron 02:00 user TZ next day |
| `quest.freeze_used` | student, parent | in-app | normal | streak save |
| `quest.completed_all_today` | student | in-app | celebration | all 3 quests done |
| `mini_task.assigned` | student | in-app | normal | teacher assigns |

#### 18.2.5. Gamification

| Slug | Recipient | Default channels | Severity | Trigger |
|------|-----------|------------------|----------|---------|
| `coin.awarded` | student | in-app (toast) | normal | any ledger credit |
| `coin.large_award` | student, parent | in-app + push | celebration | >= 50 coins single event |
| `coin.balance_low` | student | in-app banner | low | < 5 coins, optional |
| `xp.level_up` | student, parent | in-app + push + email (parent) | celebration | level transition |
| `badge.awarded` | student, parent | in-app + push | celebration | new badge |
| `streak.milestone_7` | student, parent | in-app + push | celebration | 7-day milestone |
| `streak.milestone_30` | student, parent | in-app + push + email (parent) | celebration | 30-day milestone |
| `leaderboard.weekly_top` | student | in-app | celebration | top-3 weekly |

#### 18.2.6. Shop / inventory / characters / rooms

| Slug | Recipient | Default channels | Severity | Trigger |
|------|-----------|------------------|----------|---------|
| `shop.purchase_success` | student | in-app (toast) | normal | purchase complete |
| `shop.featured_today` | student (kid mode) | in-app | low | daily featured items |
| `prize.drop_received` | student | in-app | celebration | loot box opened |
| `character.unlocked` | student, parent | in-app + push | celebration | new character earned |
| `room.theme_unlocked` | student | in-app + push | celebration | new room theme |

#### 18.2.7. Chat

| Slug | Recipient | Default channels | Severity | Trigger |
|------|-----------|------------------|----------|---------|
| `chat.new_message` | thread members | in-app + push | normal | new message; muted respect |
| `chat.mention` | mentioned user | in-app + push | high | @mention in message |
| `chat.thread_created_with_you` | new participant | in-app + push | normal | added to thread |
| `chat.urgent_from_teacher` | parent, student | in-app + push + email | urgent | teacher marks message urgent |

#### 18.2.8. Payments

| Slug | Recipient | Default channels | Severity | Trigger |
|------|-----------|------------------|----------|---------|
| `payment.paid` | payer (parent) | in-app + email | normal | webhook paid |
| `payment.failed` | payer | in-app + push + email | urgent | webhook failed |
| `payment.refunded` | payer | in-app + email | normal | refund processed |
| `subscription.activated` | payer + beneficiary | in-app + email | normal | subscription start |
| `subscription.renewed` | payer | in-app + email | low | auto-renew success |
| `subscription.expiring_soon` | payer | in-app + push + email | high | cron 3 days before period end if `cancelAtPeriodEnd=true` |
| `subscription.past_due` | payer | in-app + push + email | urgent | grace period started |
| `subscription.expired` | payer + beneficiary | in-app + email | high | grace period ended |
| `invoice.issued` | payer | email + in-app | normal | new invoice |

#### 18.2.9. Parent-specific

| Slug | Recipient | Default channels | Severity | Trigger |
|------|-----------|------------------|----------|---------|
| `parent.nudge_received` | parent | in-app + push + email (urgent) | depends on nudge severity | teacher sends nudge |
| `parent.weekly_digest` | parent | email + in-app | normal | weekly cron |
| `parent.child_added_self` | parent | in-app + push | normal | teen self-added their parent |
| `parent.child_friend_request` | parent | in-app + push | high | kid wants new friend |
| `parent.coparent_invite` | invited parent | email + in-app | normal | primary parent invites coparent |
| `parent.child_birthday_reminder` | parent | email + in-app | low | day-of |
| `parent.controls_changed` | parent | in-app | normal | another parent changed controls |

#### 18.2.10. Teacher-specific

| Slug | Recipient | Default channels | Severity | Trigger |
|------|-----------|------------------|----------|---------|
| `teacher.new_student_assigned` | teacher | in-app + email | normal | admin assigns student |
| `teacher.review_sla_warning` | teacher | in-app + push | high | submitted HW > 36h |
| `teacher.review_sla_breached` | teacher + admin | in-app + push (teacher); email (admin) | urgent | submitted HW > 48h |
| `teacher.payroll_ready` | teacher | email | normal | monthly payroll snapshot |
| `teacher.group_starts_soon` | teacher | in-app + push | normal | new group starts in 3 days |
| `teacher.cancellation_late_by_student` | teacher | in-app | normal | student cancelled < 24h |

#### 18.2.11. Admin / system

| Slug | Recipient | Default channels | Severity | Trigger |
|------|-----------|------------------|----------|---------|
| `admin.payment_dispute` | admins(payments) | in-app + email | urgent | Stripe chargeback |
| `admin.support_ticket_new` | admins(support) | in-app | normal | new ticket |
| `admin.urgent_ticket` | admins(support) | in-app + push + email | urgent | priority=urgent ticket |
| `admin.moderation_queue_growing` | admins(moderation) | in-app | normal | queue > threshold |
| `admin.system_error_spike` | admins(devops) | in-app + email | urgent | error rate >2% |
| `admin.auth_anomaly` | admins(security) | in-app + email | urgent | login anomaly detected |
| `admin.feature_flag_changed` | admins(platform) | in-app | low | flag config update by another admin |
| `admin.gdpr_request` | admins(security) | in-app + email | high | export/delete request |

#### 18.2.12. Maintenance / informational

| Slug | Recipient | Default channels | Severity | Trigger |
|------|-----------|------------------|----------|---------|
| `system.maintenance_window` | all active | in-app + email | normal | scheduled |
| `system.maintenance_starting` | all online | in-app banner | high | 5 min before |
| `system.terms_updated` | all active | email + in-app modal | normal | terms version bump (re-consent) |
| `system.privacy_updated` | all active | email + in-app modal | normal | privacy version bump |
| `system.major_feature_announcement` | all active | in-app + email (opt-in) | low | marketing |
| `system.scheduled_downtime_complete` | all online | in-app | low | post-maintenance |

### 18.3. Template structure (`api::email-template.email-template` reuse)

Кожне notification з email channel має `email-template` з:

```
slug = same as notification slug (e.g. "homework.reviewed")
subject (i18n)
htmlBody (i18n)
textBody (i18n)
variables: ["studentName", "score", "feedback", "actionUrl"]
```

Renderer (Handlebars-style):
```html
<h1>Привіт, {{firstName}}!</h1>
<p>{{teacherName}} перевірив домашнє "{{homeworkTitle}}".</p>
<p>Оцінка: <strong>{{score}}/{{maxScore}}</strong></p>
{{#if feedback}}<blockquote>{{feedback}}</blockquote>{{/if}}
<a href="{{actionUrl}}">Переглянути в додатку</a>
```

Variables resolved by NotificationDispatcher per type — fixed signature per slug.

### 18.4. Push notification specifics

- Service: FCM (Android + Web), APNs (iOS) via wrapper.
- Payload includes `data` для deep-link routing:
  ```json
  {
    "title": "...",
    "body": "...",
    "data": { "route": "/parent/child/123/homework/456", "notifId": "ntf_abc" }
  }
  ```
- Click handler: app opens → deep-link route → mark notification read.
- Silent push для background sync (chat new message → fetch).
- Max 4 unread "summary" notifications per user (collapse newer into "+ N more").

### 18.5. Do-Not-Disturb / quiet hours

- Per user `notification-preference.quietHoursFrom`/`to` (TZ aware).
- During quiet hours:
  - severity `low` / `normal` → defer to end of window.
  - severity `high` → push muted (no sound), still appears.
  - severity `urgent` → always immediate.
  - severity `celebration` → defer (бо це для радості, не зриватиме сон).

### 18.6. Opt-out matrix (default behavior)

| Notification kind | Can opt out? | Default state |
|-------------------|--------------|----------------|
| Auth/security | NO | always on |
| Payment-related | partial (email only) | on |
| Lesson reminders | YES | on |
| Homework | YES | on |
| Quest/streak | YES | on (kids: parent-controlled) |
| Coin/celebration | YES (low priority) | on |
| Marketing | YES | OFF (explicit opt-in only) |
| Weekly digest | YES | on (parent only) |
| Mass-message from teacher | YES (per teacher) | on |
| Admin (system) | NO (essential) | on |

UI for managing: `/settings/notifications` (з §15.12).

### 18.7. Implementation checklist

- [ ] All notification slugs registered in `lib/notifications/catalog.ts` shared package.
- [ ] Each slug has: TypeScript variables interface, default channels, severity, opt-out class.
- [ ] Strapi seed creates default `email-template` for each email-eligible slug у 3 locales (uk, en, ru).
- [ ] Cron jobs for time-triggered (reminders, digest) registered in BullMQ schedule.
- [ ] WS push uses correct Ably channel per recipient (`user:{id}`).
- [ ] Push registration tokens stored in `push-token` table per device.
- [ ] Email tracking pixels for open/click stats.
- [ ] Suppress notifications for soft-deleted users.
- [ ] Aggregation: > 5 of same kind in 1h → collapse into one summary notification.
- [ ] Telemetry: per-notification open/click rate dashboard.

### 18.8. Open questions

1. **Push notifications для kids у dailyTimeLimit hours**: чи показувати "час пограти!" якщо kid в quiet zone? → `[decision: NO. Respect quiet hours навіть для encouragement]`.
2. **Multi-locale notifications для bilingual users**: який мова? → `[decision: profile.locale; override per device locale якщо явно set]`.
3. **Email digest для teacher** (analog to parent weekly): чи додавати? → `[decision: post-launch B+1, opt-in]`.
4. **SMS price**: who pays? → `[decision: free for urgent (auth, payment failed); paid bundles for marketing]`.
5. **Webhook out** для integrations (Zapier-style "коли HW reviewed → send to my CRM"): MVP? → `[decision: post-launch B+2, only enterprise tier]`.

---

## 19. Onboarding flows per role

> Кожен role має різний first-experience. Тут — крок-за-кроком flow з UI screens, server actions, validation, success/failure paths.

### 19.1. Загальні принципи

- **First-mile rule**: max 5 steps до перш value (kid: перший lesson; adult: placement test result; teacher: створений profile; parent: child added).
- **Skip wisely**: optional steps мають "Skip" + "Remind me later".
- **Persistence**: state stored у `onboarding-progress` content-type → user може продовжити з того ж місця після logout.
- **Analytics**: each step emit event (drop-off аналіз).
- **Mobile-first**: всі onboarding screens должны працювати на 375px width.
- **No dead ends**: на кожному step є шлях назад або до support.

#### 19.1.1. Schema

```
api::onboarding-progress.onboarding-progress
├─ user↳!*           : user-profile (oneToOne)
├─ flowSlug*         : enum[student-kid, student-adult, teacher, parent, admin]
├─ currentStep*      : string
├─ completedSteps    : json   # ["pick_role", "verify_email", ...]
├─ data              : json   # accumulated form data
├─ startedAt         : datetime
├─ completedAt       : datetime
├─ abandonedAt       : datetime
└─ deviceFingerprint : string
```

### 19.2. Student-kid (parent-onboarded, kid < 13)

**Premise:** kid не реєструється сам. Parent створює аккаунт, kid потім логиниться через PIN.

#### 19.2.1. Steps

| # | Step (parent UI) | Goal | Server | Time |
|---|------------------|------|--------|------|
| P1 | Parent has account | (parent flow already done; if not — branch to §19.5 first) | — | — |
| P2 | `/parent/add-child` → "Onboard new child" | Trigger kid onboarding | — | 5s |
| P3 | Form: child first name, DOB, language preference | Collect minimum data | validate ageMode=kids; init `onboarding-progress` | 30s |
| P4 | Pick companion animal | Game personalization | save to `data.companionAnimal` | 15s |
| P5 | Set 4-digit PIN | Kid login secret | hash argon2id, save to `data.kidPin` | 15s |
| P6 | Pick avatar / first character | Visual identity | save to `data.activeCharacter` | 15s |
| P7 | Parental controls quick setup (daily limit Y/N, friends OFF default, leaderboard ON) | Set defaults | save to `data.controls` | 30s |
| P8 | Review + Consent (COPPA) | Parental consent for data processing | sign `consent-log` rows for kid: `parental`, `terms` | 20s |
| P9 | Create kid account | All data committed | server creates `users-permissions.user` (placeholder email `kid-{uuid}@internal`), `user-profile` role=student, `student-profile` ageMode=kids, `parent-link` active+isPrimary=true, default `room` + `character-instance`, +100 coins signup bonus | 2s |
| P10 | "Done! Anna can now sign in here:" | Show kid login URL + PIN | display QR code linking to `/kids/login?u=AnnaXX&prefilled=true` | — |

**Total: ~3 хв for parent.**

#### 19.2.2. Kid first-login (separate flow)

| # | Step | Goal |
|---|------|------|
| K1 | Kid taps QR / link → `/kids/login` | Big friendly screen "Hello!" with avatar |
| K2 | Picks own avatar from list (auto-derived from parents who set up) | Login UX замість email |
| K3 | Enters 4-digit PIN | Auth |
| K4 | Server validates → returns kid JWT (short TTL, no refresh — re-login each session) | — |
| K5 | Companion animation: "Привіт! Я твій компаньйон Лис. Хочеш погратися?" | Welcome |
| K6 | Tutorial: 30-sec walkthrough of room (tap items, drag), then encouraged to start first lesson | Hook |
| K7 | First lesson autostart (5-min beginner) | First completion |
| K8 | Lesson done → coin burst, +5 coins → "Давай поставимо нову річ у кімнату!" → directed to shop | Loop hook |

#### 19.2.3. Failure paths

- Parent abandons at P3-P7 → save partial → resume URL in next login.
- Email already exists for kid (rare since placeholder) → suggest alt placeholder.
- PIN repeat / weak (1234, 0000) → block with friendly suggestion.
- Server fail at P9 → show "Try again" with cached form data.

### 19.3. Student-adult (self-signup, ageMode=adult)

**Premise:** adult registers themselves, no parent involvement.

#### 19.3.1. Steps

| # | Step | Goal | Server | Time |
|---|------|------|--------|------|
| A1 | Landing → "Start free trial" CTA | Funnel entry | track signup_intent | — |
| A2 | Email + password OR Google OAuth | Auth identity | create `users-permissions.user`, send verify email | 30s |
| A3 | Verify email (modal: "Check your inbox") | Confirm ownership | confirmationToken redeemed | 1-5 min |
| A4 | Pick role: "I want to learn" / "I'm a teacher" / "I'm a parent" | Role selection | save initial role | 5s |
| A5 | Welcome modal: short pitch (3 slides, swipeable) | Set expectations | track | 30s |
| A6 | Profile basics: first name, DOB, locale, timezone | Personalization | save to `user-profile`; auto-compute ageMode | 30s |
| A7 | Goal selection: school_help / exam / travel / career / hobby / fluency / other | Tailor recommendations | save `learningGoal` | 15s |
| A8 | Current level: self-rate A0-C2 OR "I don't know" | Skip / continue | save `currentLevel` if known | 10s |
| A9 | (If A8 = unknown) Placement test: 8-15 questions adaptive | Determine level | create `placement-test-attempt`, scoring on submit | 5-10 min |
| A10 | Show detected level + recommended program | Suggestion | display 3 program cards | 30s |
| A11 | Pick program / "Browse all" | Enrollment | create `enrollment` to selected program | 15s |
| A12 | Schedule first lesson (optional) | Engagement | calendar UI showing teacher availability | 1-2 min |
| A13 | Subscription: trial offer | Convert to paid | show plans, "Start 7-day free trial" CTA | 30s |
| A14 | (If trial) Add payment method (no charge yet) | Capture intent | Stripe Checkout in setup mode | 1-2 min |
| A15 | Welcome dashboard with onboarding checklist (5 items) | Guided next actions | display `/dashboard` with widgets | — |

**Total: 8-15 min depending on placement test.**

#### 19.3.2. Skip-able steps

- A9 placement test → skip → start at A0 (default).
- A12 schedule lesson → skip → can do later from dashboard.
- A13-A14 trial → skip → free tier (read-only program preview, max 3 lessons).

#### 19.3.3. Failure paths

- A2 password too weak → inline hint.
- A3 email not received in 5 min → resend button (rate-limited 1/30s, max 5 attempts/h).
- A9 placement test bug / refresh → resume from same question (server state).
- A11 program not available in user country → show alternative.
- A14 card declined → continue without payment, retry later button.

#### 19.3.4. Resume logic

- Server tracks `currentStep` in `onboarding-progress`.
- Login during incomplete onboarding → middleware redirects to current step.
- Banner "Завершіть налаштування акаунта" with progress bar `(N/15)`.

### 19.4. Teacher onboarding

**Premise:** teacher може signup self ИЛИ через invite link. Після signup — **manual review** від admin перед activation (verified=false → cannot accept students).

#### 19.4.1. Steps

| # | Step | Goal | Server | Time |
|---|------|------|--------|------|
| T1 | Landing → "Apply as teacher" CTA OR invite link click | Funnel | если invite — pre-fill org context | — |
| T2 | Email + password OR Google OAuth | Identity | create user + role=teacher (status=`pending_verification`) | 30s |
| T3 | Email verify | — | — | 1-5 min |
| T4 | Profile basics: name, photo, locale, timezone | Identity | save | 1 min |
| T5 | Bio (i18n: at least primary locale), languages spoken | Showcase | save to `teacher-profile.bio`, `languagesSpoken` | 2-3 min |
| T6 | Specializations: tags from list (kids, exam, business, etc.) | Routing | save | 30s |
| T7 | Years of experience + main subject | Trust | save | 30s |
| T8 | Upload diploma / certificate PDF (optional but recommended) | Verification doc | upload to `verificationDoc` | 1-2 min |
| T9 | Hourly rate (UAH) | Pricing | save | 15s |
| T10 | Availability template: pick days + hours window | Schedule | save `availability-template` | 2-3 min |
| T11 | Acceptance: T&C for teachers (revenue split, code of conduct) | Legal | sign `consent-log` | 1 min |
| T12 | Submit for review | Pending state | server creates admin notification kind=`admin.teacher_application_new` | 10s |
| T13 | "Application received! We'll review within 48h." | Hold screen | display + email confirmation | — |

**Pending state:** teacher може login, але dashboard показує `<PendingVerificationBanner>` з status update; не може створювати lessons / accept students.

| # | Step (post-approval) | Goal | Server |
|---|----------------------|------|--------|
| T14 | Admin approves → trigger notification | Activation | `teacher-profile.verified=true`, status=`active` |
| T15 | Welcome to teacher dashboard | Activation UX | tour through 5 key features (lessons, groups, calendar, analytics, chat) |
| T16 | Optional: create first lesson now? | Hook | inline editor preview |
| T17 | Optional: import existing materials? | Migration | CSV / Word doc upload (post-launch) |

#### 19.4.2. Invited teacher flow (faster)

Якщо teacher приходить через invite link від admin:
- Skip T1 (direct landing).
- Skip T11 internal sigsavings (legal обмежений лиш до code-of-conduct).
- Skip T12-T13 (auto-verified=true since admin invites).
- Goes directly to T15 after T11.

Reduced flow: T2 → T11 → T15 (under 10 min total).

#### 19.4.3. Rejection path

Якщо admin rejects:
- `teacher-profile.status=`rejected`, `rejectionReason` saved.
- Notification: "Дякуємо, але наразі не можемо прийняти заявку. Причина: ..."
- Account залишається — teacher може re-apply через 30 days (rate limit).
- Diploma/personal docs scheduled for deletion in 90 days (GDPR).

### 19.5. Parent onboarding

**Premise:** parent self-signup, потім додає children.

#### 19.5.1. Steps

| # | Step | Goal | Server | Time |
|---|------|------|--------|------|
| PP1 | Landing → "I'm a parent" branch | Funnel | track | — |
| PP2 | Email + password OR Google | Identity | create user role=parent | 30s |
| PP3 | Verify email | — | — | 1-5 min |
| PP4 | Profile basics: name, locale, phone (optional) | Personalization | save | 1 min |
| PP5 | Welcome modal: "How does it work?" 3 slides | Set expectations | track | 30s |
| PP6 | Add child or skip | Critical step | branch | — |
| PP7a | (If add now) → child onboarding flow §19.2 P3-P9 | First child | as in §19.2 | 3 min |
| PP7b | (If skip) → "We'll remind you" | Soft conversion | set reminder notification 1 day later | — |
| PP8 | Subscription / pricing intro | Convert | show plans relevant to child age | 1-2 min |
| PP9 | Add payment method (optional, can defer) | Setup | Stripe Checkout setup mode | 1-2 min |
| PP10 | Notification preferences quick setup (digest? push?) | Defaults | save preferences | 30s |
| PP11 | Welcome dashboard with checklist | Guided next | display `/parent` | — |

**Total: 5-10 min if adding child immediately; 3 min if deferred.**

#### 19.5.2. Returning parent: add another child

- From `/parent/add-child` → branch into child onboarding (existing teen invite OR new kid creation per §19.2/§15.3).
- No additional account work — reuses existing parent account.

#### 19.5.3. Co-parent invite flow

(Reused from §15.13 #3.)

| # | Step | Action |
|---|------|--------|
| C1 | Primary parent → `/parent/child/[id]/co-parent/invite` | UI form |
| C2 | Enter email + relationship + permissions (canPay, canViewChat etc.) | Form |
| C3 | Server creates `parent-link` status=`pending` for invited email | — |
| C4 | Email sent: "Andriy invites you to join as co-parent for Anna" + claim link | Postmark |
| C5 | Invitee clicks link → if has account → confirm modal; else signup with prefilled context | — |
| C6 | Accept → `parent-link.status=active`, isPrimary=false, permissions inherited from invitation | — |
| C7 | Both parents notified | — |

### 19.6. Admin onboarding

**Premise:** admin створюється тільки іншим admin (з permission `admin.users` + `admin.security`). No public signup.

#### 19.6.1. Steps

| # | Step | Goal | Server |
|---|------|------|--------|
| AD1 | Existing admin → `/admin/users/new-admin` → "Create admin account" | UI | — |
| AD2 | Form: email, name, initial permissions tier (default L1 `admin.support`) | — | validate inviter has `admin.users` |
| AD3 | "Send invite email" | — | create user role=admin status=`pending_invite`, generate one-time onboarding token (24h TTL) |
| AD4 | Invitee receives email "Welcome to EnglishBest admin" + secure link | — | — |
| AD5 | Invitee clicks → set password (strong, 14+ chars, complexity check) | — | hash, save |
| AD6 | MFA setup mandatory (TOTP via authenticator app) | Security | scan QR, verify 6-digit code |
| AD7 | Sign internal NDA + ops policy (pre-loaded PDF) | Legal | sign `consent-log` kind=`admin_policy` |
| AD8 | First login → see admin dashboard with permissions tier displayed | Activation | grant access |
| AD9 | Optional: short tour of admin tools relevant to permission tier | UX | overlay tour |

#### 19.6.2. Permission escalation

- Cannot grant own permissions.
- L1 admin can only grant L1.
- L2 can grant L1, L2.
- L3 can grant L1-L3.
- L4 can grant L1-L4.
- L5 (`admin.god`) can grant anything.
- Granting requires "approver" — двох-крокова: requester admin → approver admin clicks "Approve grant" (within 24h).
- Audit: every grant logged.

#### 19.6.3. Offboarding admin

- Existing admin → `/admin/users/[id]` → "Deactivate".
- Confirm + reason.
- Server:
  - `user-profile.status=archived`.
  - All active sessions invalidated (tokenVersion bump).
  - Permissions cleared.
  - Audit row.
  - Email to ex-admin: "Your access has been revoked. Reason: ..."

### 19.7. Cross-flow concerns

#### 19.7.1. Internationalization

- Onboarding screens i18n: uk (default), en, ru.
- Legal documents (T&C, privacy, COPPA notices) — primary in uk, professional translation to en/ru.
- DOB picker — locale-aware date format.

#### 19.7.2. Accessibility

- Keyboard navigation throughout.
- Screen reader labels on all interactive elements.
- Color contrast WCAG AA.
- Form errors clearly announced.
- "Skip to content" links.

#### 19.7.3. Drop-off mitigation

- Track drop-off per step → identify worst step → A/B alternate copy.
- Email recovery: "We saved your progress. Continue here." sent 1h, 24h, 7d after abandon.
- After 30 days abandon → soft-delete `onboarding-progress`, `users-permissions.user` becomes inactive.

#### 19.7.4. Analytics events (per onboarding step)

- `onboarding.step_started` `{ flow, step }`
- `onboarding.step_completed` `{ flow, step, durationMs }`
- `onboarding.step_skipped` `{ flow, step }`
- `onboarding.step_failed` `{ flow, step, errorCode }`
- `onboarding.flow_completed` `{ flow, totalDurationMs }`
- `onboarding.flow_abandoned` `{ flow, lastStep, durationSinceStartMs }`

Funnel chart in admin analytics: drop-off per step per flow.

#### 19.7.5. Edge cases

| Edge | Behavior |
|------|----------|
| User refreshes mid-step | Resume from `currentStep` after re-login (form data persisted). |
| User opens 2 tabs of onboarding | Server lock — second tab shows "Onboarding open in another tab". |
| User changes locale mid-flow | Re-render screens; data preserved. |
| Email already exists | Login flow suggested with "Forgot password?" link. |
| Kid DOB makes them >= 13 | Auto-switch to teen flow (different consent fields). |
| Invite link expired | Clean error + "Request new invite" CTA. |
| Browser back button mid-step | Confirm "Leave onboarding?" modal. |

### 19.8. Open questions

1. **Адаптивний placement test depth**: 8 vs 15 запитань — adaptive чи fixed? → `[decision: adaptive IRT — start at A1 difficulty, branch up/down based on streak; max 15, min 8]`.
2. **Mandatory phone verify для parent**: для COPPA confidence чи overkill? → `[decision: optional у MVP; mandatory якщо платитиме SMS-payment provider]`.
3. **Free tier limits для adult**: 3 безкоштовні lessons чи 7-day trial з paywall? → `[decision: 7-day full trial з paywall-free access; safe for conversion measurement]`.
4. **Teacher invite from teacher** (referral): дозволити? → `[decision: post-launch, з referral bonus для existing teacher]`.
5. **Couple aanmelding (parent + teacher same email accounts)**: дозволити? → `[decision: allow; same `users-permissions.user` може mати multiple `user-profile` з різними role'ами; UI switcher]`.

---

**Кінець документа v3 (з §15-§19).**




