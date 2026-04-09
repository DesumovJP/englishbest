### Ультра‑промпт для Claude Code — **Frontend only** (Next.js + Tailwind, Strapi CMS в майбутньому, Postgres — на бекенді; **в фронтенді використовуємо `slug` / `documentId` як ключі, не `id`**)

> **Мета:** згенерувати повний каркас фронтенду навчальної платформи (Next.js) з візуальним мок‑контентом, компонентами, сторінками та мок‑API, щоб UX/візуал можна було тестувати і замінити мок‑дані на Strapi + Postgres пізніше. Стиль — **дитячий, дружній (Duolingo‑like)**, але чистий, без візуального сміття. Фокус — **структура, UX, стани, мок‑дані з `slug`/`documentId`**.

---

### 1. Вимоги та обмеження (вхідні параметри для Claude Code)
- **Фреймворк:** Next.js (app router).
- **CSS:** Tailwind CSS (utility‑first), дизайн‑токени (colors, spacing, radii).
- **Компонентна бібліотека:** створити базові атоми (Button, Card, Icon, Avatar, Badge, Modal, Sidebar, Input, Select).
- **Мок‑дані:** JSON файли у `/mocks` з ключами **`slug`** або **`documentId`** (ніколи `id`).
- **API адаптер:** `lib/api.ts` з функціями, що звертаються до `/api/mock/*` (локальний mock server) і легко замінюються на Strapi endpoints.
- **Mock server:** MSW (Mock Service Worker) або Next.js API routes, щоб фронтенд працював автономно.
- **Accessibility:** semantic HTML, keyboard navigation, aria‑labels.
- **Responsive:** desktop + tablet + mobile (mobile-first).
- **Storybook:** базова конфігурація для ключових компонентів.
- **Тестування:** базові unit tests для компонентів (Jest + React Testing Library).
- **Ключова умова:** всі дані, маршрути та звʼязки використовують `slug`/`documentId` (наприклад `courseSlug`, `lessonSlug`, `userSlug`).

---

### 2. Структура проекту (файлова схема)
```
/app
  /(public)
    /home
      page.tsx
  /dashboard
    layout.tsx
    page.tsx
  /courses
    [courseSlug]
      page.tsx
      /lessons
        [lessonSlug].tsx
  /library
    page.tsx
  /calendar
    page.tsx
  /auth
    login/page.tsx
    register/page.tsx
/components
  /atoms
    Button.tsx
    Input.tsx
    Icon.tsx
    Avatar.tsx
    Modal.tsx
  /molecules
    Sidebar.tsx
    CourseCard.tsx
    LessonPlayer.tsx
    QuizWidget.tsx
  /organisms
    DashboardOverview.tsx
    CoursePage.tsx
    CalendarView.tsx
/lib
  api.ts
  fetcher.ts
  mockClient.ts
/mocks
  users.json
  courses.json
  lessons.json
  quizSamples.json
/public
  /images
  /icons
/styles
  tailwind.css
  tokens.css
/tests
  /components
.storybook
msw
  handlers.ts
  browser.ts
package.json
next.config.js
tsconfig.json
```

---

### 3. Сторінки + компоненти — детальний список з props, стейтами та маршрутами

#### **Головна (/) — маркетинг + квіз**
- **Компоненти:** `Hero`, `CTA`, `QuizWidget` (modal), `CoursePreviewList`, `Testimonials`.
- **Quiz flow (компонент `QuizWidget`)**
  - **Props:** none (local state).
  - **Кроки:** `levelTest` (5 питань), `goals` (select), `schedule` (days/time), `format` (group/one‑to‑one), `age`.
  - **Результат:** `{ recommendedCourseSlug: string, suggestedPlan: string }`.
  - **CTA:** `register` або `bookTrial`.
- **SEO:** meta tags, structured data (JSON‑LD) — але реалізувати як мок.

#### **Dashboard ( /dashboard ) — Мій кабінет**
- **Sidebar (ліва панель)** — `Sidebar` компонент з пунктами:
  - **Dashboard** → `/dashboard`
  - **Library / Shop** → `/library`
  - **Learning** → `/courses` (переходи до конкретних курсів `/courses/[courseSlug]`)
  - **Calendar** → `/calendar`
  - **Profile** → `/auth/profile`
- **DashboardOverview**
  - **Props:** `userSlug`, `progressSummary`.
  - **Блоки:** поточний курс (card), today tasks, quick join live, recent achievements.

#### **Library / Shop ( /library )**
- **CourseCard**
  - **Props:** `{ title, teacherName, level, price, courseSlug, thumbnail }`
  - **States:** available / soldOut / comingSoon
  - **Actions:** Add to learning (adds to mock user courses), Buy (opens checkout modal).

#### **Course page ( /courses/[courseSlug] )**
- **CoursePage organism**
  - **Sections:** Overview, Curriculum (sections → lessons), Reviews, Teacher card.
  - **Curriculum:** list of sections; each lesson item links to `/courses/[courseSlug]/lessons/[lessonSlug]`.
  - **Use `courseSlug` everywhere** (fetch by slug).

#### **Lesson player ( /courses/[courseSlug]/lessons/[lessonSlug] )**
- **LessonPlayer**
  - **Props:** `{ courseSlug, lessonSlug }`
  - **Components inside:** VideoPlayer, InteractiveExercise, Transcript, Notes, TeacherChat.
  - **States:** notStarted / inProgress / completed / graded.
  - **Local progress:** store in `localStorage` and in mock API `POST /api/mock/progress` with `documentId` or `slug`.

#### **Calendar ( /calendar )**
- **CalendarView**
  - **Props:** `userSlug`
  - **Features:** month/week/day view, join live, reschedule (drag/drop UI optional), show past sessions with grades.
  - **Events use `documentId`** for session identifiers.

---

### 4. Mock‑дані (обовʼязково `slug` / `documentId`) — приклади JSON

#### `mocks/courses.json`
```json
[
  {
    "documentId": "course-english-kids-1",
    "slug": "english-kids-starter",
    "title": "English for Kids — Starter",
    "level": "A1",
    "price": 19.99,
    "teacherSlug": "teacher-olga",
    "thumbnail": "/images/courses/kids-starter.png",
    "sections": [
      { "slug": "basics-1", "title": "Basics 1", "lessons": ["lesson-abc", "lesson-greetings"] }
    ],
    "tags": ["kids", "speaking", "fun"],
    "rating": 4.8
  }
]
```

#### `mocks/lessons.json`
```json
[
  {
    "documentId": "lesson-abc",
    "lessonSlug": "lesson-abc",
    "courseSlug": "english-kids-starter",
    "title": "Alphabet and Sounds",
    "type": "video",
    "durationMin": 8,
    "content": {
      "videoUrl": "/videos/abc.mp4",
      "exercises": [
        { "documentId": "ex-1", "type": "mcq", "question": "Which letter is A?", "options": ["A","B","C"], "answer": 0 }
      ]
    }
  }
]
```

#### `mocks/users.json`
```json
[
  {
    "documentId": "user-alex-001",
    "userSlug": "alex-k",
    "name": "Alex",
    "role": "student",
    "level": "A1",
    "enrolledCourses": ["english-kids-starter"],
    "preferences": { "studyDays": ["Mon","Wed"], "format": "group" }
  }
]
```

---

### 5. API‑адаптери (локальні, легко замінити на Strapi)
- **Файл:** `lib/api.ts`
- **Принцип:** всі fetch виклики використовують `slug`/`documentId` у шляху або query.
- **Приклад функцій (TypeScript):**
```ts
// lib/api.ts
export async function fetchCourseBySlug(courseSlug: string) {
  return fetch(`/api/mock/courses?slug=${encodeURIComponent(courseSlug)}`)
    .then(res => res.json());
}

export async function fetchLesson(courseSlug: string, lessonSlug: string) {
  return fetch(`/api/mock/lessons?courseSlug=${encodeURIComponent(courseSlug)}&lessonSlug=${encodeURIComponent(lessonSlug)}`)
    .then(res => res.json());
}

export async function postProgress(userSlug: string, payload: { lessonSlug: string; status: string; documentId?: string }) {
  return fetch(`/api/mock/users/${encodeURIComponent(userSlug)}/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(r => r.json());
}
```
- **Замінність:** при підключенні Strapi — замінити URL на Strapi REST/GraphQL, але **зберегти** використання `slug`/`documentId` у запитах.

---

### 6. Покрокова реалізація (roadmap для фронтенду) — кожен крок з deliverable та acceptance criteria

1. **Ініціалізація проекту**
   - `npx create-next-app@latest --experimental-app`
   - Встановити Tailwind, TypeScript, ESLint, Prettier.
   - Deliverable: робочий Next.js проект з Tailwind.
   - Acceptance: `npm run dev` відкриває сторінку з Tailwind стилями.

2. **Створити дизайн‑токени та базові атоми**
   - Файли: `styles/tokens.css`, `components/atoms/*`.
   - Deliverable: Button, Input, Modal, Icon.
   - Acceptance: Storybook показує всі атоми.

3. **Реалізувати layout + Sidebar**
   - `app/layout.tsx`, `components/molecules/Sidebar.tsx`.
   - Deliverable: responsive sidebar з пунктами.
   - Acceptance: навігація працює, активний пункт підсвічується.

4. **Мок‑дані + mock API**
   - Додати `/mocks/*.json`, MSW handlers або Next.js API routes `/api/mock/*`.
   - Deliverable: ендпоінти для courses, lessons, users.
   - Acceptance: `fetchCourseBySlug('english-kids-starter')` повертає mock JSON.

5. **Головна сторінка + QuizWidget**
   - Реалізувати `app/home/page.tsx` з `QuizWidget` (modal).
   - Deliverable: інтерактивний квіз, результат повертає `recommendedCourseSlug`.
   - Acceptance: після проходження квізу показується CTA з посиланням на `/courses/[slug]`.

6. **Course list / Library**
   - `app/library/page.tsx`, `CourseCard` компонент.
   - Deliverable: фільтри, сортування, кнопки Buy/Add.
   - Acceptance: додавання курсу в локальний user.enrolledCourses.

7. **Course page + Curriculum**
   - `app/courses/[courseSlug]/page.tsx` + lesson links.
   - Deliverable: відображення секцій та lesson links.
   - Acceptance: клік на lesson відкриває `/courses/[courseSlug]/lessons/[lessonSlug]`.

8. **Lesson player**
   - `components/molecules/LessonPlayer.tsx` з відео, вправами, нотатками.
   - Deliverable: збереження прогресу локально і через `postProgress`.
   - Acceptance: після завершення lesson статус змінюється на `completed`.

9. **Calendar view**
   - `app/calendar/page.tsx` з простим month view.
   - Deliverable: показ майбутніх сесій з join/reschedule кнопками.
   - Acceptance: join відкриває mock live modal.

10. **Storybook + Tests**
    - Налаштувати Storybook, додати stories для ключових компонентів.
    - Написати базові unit tests.
    - Acceptance: `npm run test` проходить, Storybook запускається.

11. **Документація для інтеграції зі Strapi**
    - `docs/strapi-integration.md` з mapping полів (slug ↔ Strapi slug), прикладами запитів.
    - Acceptance: backend dev може підключити Strapi, замінивши `lib/api.ts` на Strapi endpoints.

---

### Додаткові вказівки для Claude Code (як генерувати код)
- **Генеруй TypeScript компоненти** з чіткими prop‑типами.
- **Використовуй app router** (файли `page.tsx`, `layout.tsx`).
- **Всі fetch виклики** — через `lib/api.ts`.
- **Mock data** — зберегти у `/mocks/*.json` і використовувати MSW handlers (`msw/handlers.ts`) для ендпоінтів `/api/mock/*`.
- **Routing:** динамічні маршрути повинні використовувати `[courseSlug]` та `[lessonSlug]`.
- **Не використовуй numeric id** у моках; ключі — `slug` або `documentId`.
- **UI style:** Tailwind + design tokens; кольори — мʼякі, контрастні CTA, великі кнопки, rounded corners.
- **Accessibility:** всі кнопки мають `aria-label`, модальні вікна фокус‑трап.
- **Коментарі в коді:** короткі пояснення, де замінити на Strapi (наприклад `// TODO: replace with Strapi endpoint`).

---

### Developer checklist (швидка перевірка перед handoff)
- [ ] Next.js app + Tailwind встановлені
- [ ] Атоми + молекули + організми створені
- [ ] Mock JSON у `/mocks` з `slug`/`documentId`
- [ ] MSW або API routes для моків працюють
- [ ] `lib/api.ts` містить адаптери з використанням slug
- [ ] Storybook налаштований
- [ ] Unit tests для ключових компонентів
- [ ] Документація: як замінити мок API на Strapi (mapping полів)
- [ ] Accessibility basic checks пройдені

---

## Коротке резюме (що має отримати Claude Code)
1. **Готовий Next.js фронтенд‑каркас** з Tailwind, app router, компонентами, сторінками: Home (quiz), Dashboard, Library, Course page, Lesson player, Calendar.
2. **Мок‑дані** у `/mocks` з `slug`/`documentId`.
3. **Mock API** (MSW або Next API routes) для автономної роботи.
4. **`lib/api.ts`** з fetch‑адаптерами, що використовують `slug`.
5. **Storybook + базові тести**.
6. **Документація** як замінити мок на Strapi + Postgres (mapping полів, endpoints).

---
