# Strapi Integration Plan

> **Статус:** план на майбутнє. Фронтенд повністю працює на mock-даних.
> Коли буде готовий Strapi + Postgres — замінити тільки `lib/api.ts`. Всі slug/documentId залишаються незмінними.

---

## Архітектура

```
Next.js frontend
    ↓ lib/api.ts  ← єдина точка заміни
Strapi REST API  ←→  Postgres
```

Всі URL в одному місці — `lib/api.ts`. При переході на Strapi змінюються тільки URL, решта коду не чіпається.

---

## Змінні середовища

```env
# .env.local
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-api-token-here
```

---

## Маппінг полів: mock → Strapi

### Courses

| Mock поле | Strapi поле | Примітка |
|---|---|---|
| `documentId` | `documentId` | Авто-генерується Strapi v5 |
| `slug` | `slug` | Поле в Content Type, унікальне |
| `title` | `title` | |
| `level` | `level` | Enum: A1, A2, B1, B2, C1 |
| `price` | `price` | Decimal |
| `teacherSlug` | `teacher.slug` | Relation → Teacher |
| `teacherName` | `teacher.name` | Populate: teacher |
| `thumbnail` | `thumbnail.url` | Media field → Strapi upload |
| `sections[].lessons[]` | `sections.lessons` | Component з repeatable Lessons |
| `tags` | `tags` | JSON або relation |
| `rating` | обчислюється з Reviews | Aggregation на беку |
| `status` | `status` | Enum: available, soldOut, comingSoon |

**Strapi endpoints:**
```
GET /api/courses?filters[slug][$eq]={slug}&populate[sections][populate]=*&populate[teacher]=true
GET /api/courses?populate[sections][populate]=*&populate[teacher]=true
```

---

### Lessons

| Mock поле | Strapi поле | Примітка |
|---|---|---|
| `documentId` | `documentId` | |
| `lessonSlug` | `lessonSlug` | Унікальний slug уроку |
| `courseSlug` | `course.slug` | Relation → Course |
| `title` | `title` | |
| `type` | `type` | Enum: video, quiz, reading |
| `durationMin` | `durationMin` | Integer |
| `content.videoUrl` | `video.url` | Media field |
| `content.transcript` | `transcript` | Rich text або Text |
| `content.exercises[]` | `exercises` | Component: repeatable |
| `exercises[].documentId` | `documentId` | |
| `exercises[].type` | `type` | Enum: mcq |
| `exercises[].question` | `question` | Text |
| `exercises[].options` | `options` | JSON |
| `exercises[].answer` | `answer` | Integer (index) |

**Strapi endpoints:**
```
GET /api/lessons?filters[lessonSlug][$eq]={slug}&filters[course][slug][$eq]={courseSlug}&populate=*
GET /api/lessons?filters[course][slug][$eq]={courseSlug}&populate=*
```

---

### Users / Progress

| Mock поле | Strapi поле | Примітка |
|---|---|---|
| `documentId` | `documentId` | |
| `userSlug` | `username` або окреме поле `slug` | |
| `name` | `name` | |
| `email` | `email` | Strapi auth field |
| `role` | `role.name` | Strapi roles & permissions |
| `level` | `level` | Enum |
| `enrolledCourses[]` | `enrolledCourses` | Many-to-many з Course |
| `progress` | окрема колекція `UserProgress` | |
| `achievements[]` | `achievements` | Relation або JSON |

**Окрема колекція `UserProgress`:**
```
documentId, user (relation), lesson (relation), courseSlug, status, completedAt
```

**Strapi endpoints:**
```
GET  /api/users/me?populate=*
POST /api/user-progresses
GET  /api/user-progresses?filters[user][slug][$eq]={userSlug}&populate=lesson
```

---

### Calendar / Sessions

| Mock поле | Strapi поле | Примітка |
|---|---|---|
| `documentId` | `documentId` | |
| `title` | `title` | |
| `courseSlug` | `course.slug` | Relation → Course |
| `date` | `date` | Date |
| `time` | `time` | Time |
| `duration` | `duration` | Integer (хвилини) |
| `type` | `type` | Enum: group, one-to-one |
| `teacherSlug` | `teacher.slug` | Relation → Teacher |
| `status` | `status` | Enum: upcoming, completed |
| `joinUrl` | `joinUrl` | Text |
| `grade` | `grade` | Integer (0–100) |

**Strapi endpoint:**
```
GET /api/sessions?filters[attendees][slug][$eq]={userSlug}&populate=*&sort=date:asc
```

---

## Як переключити фронтенд

### Крок 1 — Оновити `lib/api.ts`

```ts
const STRAPI = process.env.NEXT_PUBLIC_STRAPI_URL;
const TOKEN  = process.env.STRAPI_API_TOKEN;

function headers() {
  return { Authorization: `Bearer ${TOKEN}` };
}

// БУЛО (mock):
// return fetch(`/api/mock/courses?slug=${courseSlug}`).then(r => r.json());

// СТАЛО (Strapi):
export async function fetchCourseBySlug(courseSlug: string) {
  const res = await fetch(
    `${STRAPI}/api/courses?filters[slug][$eq]=${courseSlug}&populate[sections][populate]=*&populate[teacher]=true`,
    { headers: headers() }
  );
  const { data } = await res.json();
  return normalizeCourse(data[0]);
}
```

### Крок 2 — Адаптери нормалізації

Strapi v5 повертає `{ data: { documentId, ...attributes } }`. Адаптер перетворює в плоский об'єкт:

```ts
function normalizeCourse(raw: any) {
  return {
    documentId:  raw.documentId,
    slug:        raw.slug,
    title:       raw.title,
    level:       raw.level,
    price:       raw.price,
    teacherSlug: raw.teacher?.slug,
    teacherName: raw.teacher?.name,
    thumbnail:   raw.thumbnail?.url ?? '',
    sections:    raw.sections ?? [],
    tags:        raw.tags ?? [],
    rating:      raw.rating ?? 0,
    reviewCount: raw.reviewCount ?? 0,
    status:      raw.status ?? 'available',
  };
}
```

### Крок 3 — Аутентифікація

```
POST /api/auth/local
Body: { identifier: email, password }
→ { jwt, user }
```

JWT зберігати в httpOnly cookie. Передавати в `Authorization: Bearer {jwt}`.

### Крок 4 — `/api/mock/*` routes

Можна або видалити, або залишити як fallback на час міграції.

---

## Checklist переходу

- [ ] Розгорнути Strapi + Postgres (Railway / Render / VPS)
- [ ] Створити Content Types: Course, Lesson, Teacher, Session, UserProgress
- [ ] Заповнити тестові дані (імпортувати з `/mocks/*.json`)
- [ ] Додати `.env.local` зі Strapi URL та API token
- [ ] Оновити `lib/api.ts` — замінити mock URL на Strapi endpoints
- [ ] Написати адаптери нормалізації
- [ ] Налаштувати Strapi Roles & Permissions
- [ ] Налаштувати CORS у Strapi для домену фронтенду
- [ ] Протестувати всі сторінки з реальними даними
- [ ] Видалити `/app/api/mock/*`
