# Core user flows — production readiness plan

**Ціль:** довести КОЖНУ взаємодію юзера (учень ↔ вчитель ↔ батько ↔ адмін) до production-ready: живі дані, повний CRUD, без моків/placeholder.

**Як використовувати:**
- Канонічний статус модулів — `PROJECT.md §3`.
- Цей файл — **покроковий план** по flows, згрупований за user-facing екранами.
- Кожен step = 1 малий deployable chunk (1-3 файли, ≤200 LOC diff).
- Коли починаєш step → читай цей файл + зачіплені файли → роби → перемикай статус.

**Позначення:**
- `[ ]` — TODO
- `[~]` — в роботі
- `[x]` — готово
- `[skip]` — свідомо відкладено

---

## Роль 1 — УЧЕНЬ (kids)

### 1.1 Дашборд `/kids/dashboard`
- [x] Монети, стрік, XP live через `useKidsState` → `/api/kids-profile`
- [x] Continue lesson widget live (`fetchContinueLesson`)
- [x] Room preview (placed items) live через `useKidsState.placedItems`
- [~] **SHOP_ITEMS_BY_ID константи** — візуальний layer (SVG offset coupling) лишається на FE, не є data gap. `[skip]` — не блокуюче.

### 1.2 Магазин `/kids/shop`
- [x] Каталог речей — live (`useShopItems`)
- [x] Каталог персонажів — live (Phase C1.4 фікс)
- [x] Купівля → списання монет, повернення updated inventory — live
- [ ] **Step 1.2.A:** Тости/анімації після покупки вже є? — перевірити; якщо ні — додати toast "Придбано!" + "Недостатньо монет" для failure path.
- [ ] **Step 1.2.B:** Loot boxes — перевірити, чи відкриття боксу вже дає рандомний предмет з серверу (endpoint для opening). Якщо `random()` на клієнті — винести на BE.

### 1.3 Кімната `/kids/room`
- [x] Placed items рендерять з `state.placedItems` live
- [ ] **Step 1.3.A:** Збереження `placedItems` при drag-and-drop — debounced save (PROJECT.md позначив як "D5 pending"). Треба перевірити.
- [ ] **Step 1.3.B:** Unlock нової кімнати за монети — є кнопка? Кімнати з'являються на /kids/rooms?

### 1.4 Персонажі `/kids/characters`
- [x] Каталог з серверу
- [x] Ownership + dress
- [ ] **Step 1.4.A:** Перевірити, чи зміна вибраного персонажа (active character) зберігається на BE (`/api/user-inventory/me/active-character` чи аналогічний).

### 1.5 Досягнення `/kids/achievements`
- [x] Каталог + earned — live (`useAchievements`)
- [ ] **Step 1.5.A:** Пересвідчитись, що нові досягнення нараховуються (є lifecycle hook / event listener). Якщо тільки на completion уроку — перевірити, що streak/coins/social also trigger.

### 1.6 Монети `/kids/coins`
- [x] Баланс live
- [skip] ~~Історія транзакцій~~ — не потрібна (answered 2026-04-23)

### 1.7 Домашка `/kids/homework` + `/[id]`
- [x] Список (`fetchSubmissions` scoped to own)
- [x] Редагування тексту відповіді
- [x] "Здати" → submitted
- [x] Teacher feedback render після reviewed
- [ ] **Step 1.7.A:** Вкладення (attachments) — форма дозволяє завантажити файли? Якщо ні — додати upload-поле через `/api/upload`.

### 1.8 Урок-player `/courses/[slug]/lessons/[slug]`
- [x] Steps live з `api::lesson.lesson.steps` (JSON)
- [x] Progress writes via `createProgress` → `/api/user-progress`
- [ ] **Step 1.8.A:** Rich-lesson типи (`LessonStep`, `StepTheory` ...) досі живуть в `@/mocks/lessons/types`. Перенести в `lib/types/lesson.ts` + видалити `mocks/lessons/*` (Phase A8 cleanup). `[skip]` — не user-facing, суто refactor.

### 1.9 Школа/Бібліотека `/kids/school` + `/kids/library/[id]`
- [x] Live через `useLibrary`
- [~] `app/library/[programSlug]/page.tsx` (публічна бібліотека програм, не kids) — **MOCK modules** (hardcoded `[{ title: 'Модуль 3', lessons: ['Reading Strategies'...] }]`). Not blocking core interaction.

---

## Роль 2 — ВЧИТЕЛЬ (teacher)

### 2.1 Список учнів `/dashboard/students`
- [x] Таблиця live (`fetchMyStudents`)
- [x] Фільтри, сорт, пошук
- [x] **Step 2.1.A** — Вкладка "Прогрес" у StudentDetail (`fetchStudentProgress` + grouping by course + progress bar) ✓ 2026-04-23
- [~] **Step 2.1.B:** Мок-поля (moneyBalance/joinedAt/streak) — teacher view їх не показує, admin view ще не реалізована. Rolled into **4.2.A** — real aggregation прийде разом з admin student-list.

### 2.2 Домашка `/dashboard/homework` + review
- [x] Create homework modal live
- [x] List live
- [x] Review page (grade/return) live
- [ ] **Step 2.2.A:** Bulk grade / mass return — чи є? Якщо ні — skip. Не core.
- [x] **Step 2.2.B:** Edit published ДЗ — `ManageHomeworksModal` вже живо править title/description/dueAt/status через `updateHomework` (BE scoped owner-only). ✓ verified 2026-04-24
- [x] **Step 2.2.C:** Delete ДЗ — `ManageHomeworksModal` викликає `deleteHomework` (BE scoped owner-only). ✓ verified 2026-04-24

### 2.3 Міні-завдання `/dashboard/mini-tasks`
- [x] List / create / edit / delete live (Phase C1.3 фікс)

### 2.4 Групи `/dashboard/groups`
- [x] List live
- [x] Create group modal
- [x] Chat deep-link + schedule live (P2 фікс)
- [x] **Step 2.4.A:** Edit members — `CreateGroupModal` в edit-mode (prefill + `updateGroup`) через "Редагувати групу" в GroupDetail. ✓ 2026-04-24
- [x] **Step 2.4.B:** Delete group — кнопка "Видалити" в edit-modal (`deleteGroup` + confirm). BE вже owner-scoped. ✓ 2026-04-24

### 2.5 Teacher library `/dashboard/teacher-library`
- [x] List live
- [x] Create lesson modal + editor
- [x] Edit page live
- [x] **Step 2.5.A:** Delete lesson — `deleteLesson` helper + "×" danger button у `LessonRowActions` (owned only). ✓ verified 2026-04-24
- [x] **Step 2.5.B:** Publish/unpublish — BE `api::lesson.lesson.publish/unpublish` (owner-scoped) + FE `publishLesson`/`unpublishLesson` + кнопка Publish/Unpublish у `LessonRowActions` + "Чернетка" badge у grid + list view. ✓ 2026-04-24

### 2.6 Календар `/dashboard/teacher-calendar`
- [x] Тиждень/день live (`fetchSessions`)
- [x] Click → LessonActionSheet (update/cancel/delete)
- [x] "+ Урок" → CreateLessonModal

### 2.7 Відвідуваність `/dashboard/attendance`
- [x] Live (Phase G6)

### 2.8 Чат `/dashboard/chat`
- [x] Live + polling 10s
- [x] Send / pin / reply
- [ ] **Step 2.8.A:** Видалити своє повідомлення — чи є? Якщо BE підтримує — додати UI.
- [ ] **Step 2.8.B:** Attach файл у повідомлення — є?

### 2.9 Оплати `/dashboard/payments`
- [x] Live (Phase G7)

### 2.10 Аналітика `/dashboard/analytics`
- [x] Live teacher + admin aggregate (Phase G9)

### 2.11 Профіль `/dashboard/profile`
- [x] Live edit user-profile + teacher-profile

---

## Роль 3 — БАТЬКО (parent)

### 3.1 Дашборд `/dashboard/parent`
- [x] Live `/api/parent/me/children` (Phase H2)
- [x] KPI + sessions + homework + progress per child
- [ ] **Step 3.1.A:** Parent pays for child lessons — є flow? `/dashboard/payments` для parent-ролі показує що? Треба перевірити.
- [ ] **Step 3.1.B:** Parent листується з teacher свого дитини — через `/dashboard/chat`. Чи threads автоматично створюються? Чи parent може ініціювати розмову?

---

## Роль 4 — АДМІН (admin)

### 4.1 Admin dashboard `/dashboard/admin`
- [x] Live composition (Phase G9)

### 4.2 Список учнів (admin branch)
- [x] **Step 4.2.A:** `GET /api/admin/students` (`api::admin.admin.students`) aggregates all kids/adult profiles + sessions + submissions + teacher names. FE `/dashboard/students` тепер показує адмінам ту саму таблицю + колонку "Вчитель". Seed permission додана, Sidebar admin-nav додана. ✓ 2026-04-24

### 4.3 Керування teacher-profile / courses / lessons
- [~] Admin може через Strapi admin UI. FE CRUD не обов'язковий для MVP. `[skip]` якщо не просили явно.

---

## Cross-cutting gaps

### X.1 Персональний `/calendar` (answered 2026-04-23)
- [x] **Step X.1.A:** Переписано `app/calendar/page.tsx` на `fetchSessions()`. BE session controller вже scopes per-role (teacher — свої, student — де він у attendees, parent — через `childProfileIds()` → `parentalConsentBy`, admin — all). ✓ 2026-04-24

### X.2 Бібліотека (answered 2026-04-23)
- [x] **Step X.2.A:** `/library` + `/library/[programSlug]` переписано на живі `fetchCourses({ kind: 'course' })` + `fetchCourseBySlug` + `fetchLessonsByCourse`. Reviews через `<CourseReviews>` (scoped BE). ✓ 2026-04-24

### X.3 Lesson player types cleanup (`@/mocks/lessons/types`)
- [~] 11 файлів досі імпортують types з `mocks/`. Phase A8 сказав "data в API", але types лишились. **Не user-facing** — `[skip]` до окремого refactor-чанку.

---

## ПРІОРИТЕТ — порядок виконання

Сортовано за (core-user-impact × cost). Виконую зверху вниз, синхронно — по одному кроку.

1. **2.1.A** — Teacher бачить прогрес учня по курсах (вкладка "Прогрес" у StudentDetail). `fetchStudentProgress` вже написана — лишилось UI.
2. **2.1.B** — StudentDetail моки (moneyBalance etc.) — прибрати або замінити на real.
3. **X.1.A** — Персональний `/calendar` (kids/adult/teacher/parent shares with child).
4. **X.2.A** — `/library/[programSlug]` на живі дані.
5. **4.2.A** — Admin платформенний student-list.
6. **2.2.B** — Edit published ДЗ.
7. **2.2.C** — Delete ДЗ.
8. **2.5.A + 2.5.B** — Delete + publish teacher lesson.
9. **2.4.A + 2.4.B** — Edit members + delete group.
10. **1.2.A + 1.2.B** — Shop toasts + loot box backend.
11. **1.3.A + 1.3.B** — Room save + unlock.
12. **1.4.A** — Active character save.
13. **1.7.A** — Homework attachments.
14. **3.1.A + 3.1.B** — Parent payments + chat init.
15. **2.8.A + 2.8.B** — Chat delete + attach.

Open questions — **усі закриті 2026-04-23**.

---

## Журнал виконання

_(додається по мірі завершення — дата, step id, посилання на commit)_

- 2026-04-23 — Reviews scoped + UI (skip'нуто як secondary, але вже в коді).
- 2026-04-23 — Mini-task edit (2.3).
- 2026-04-23 — Kids shop live character catalog (1.2).
- 2026-04-23 — Group chat deep-link + live schedule (2.4).
- 2026-04-23 — `fetchStudentProgress` додано в `lib/user-progress.ts` (підготовка до 2.1.A).
- 2026-04-24 — **2.1.A** StudentDetail вкладка "Прогрес" live (`fetchStudentProgress` + ProgressByCourse).
- 2026-04-24 — **X.1.A** `/calendar` live (`fetchSessions`, BE per-role scoped включно parent→children).
- 2026-04-24 — **X.2.A** `/library` + `/library/[programSlug]` live (`fetchCourses({ kind: 'course' })` + `fetchCourseBySlug` + `CourseReviews`).
- 2026-04-24 — **4.2.A** Admin платформенний student-list (BE `api::admin.admin.students` + FE table + Sidebar admin-nav).
- 2026-04-24 — **2.2.B / 2.2.C** verified — `ManageHomeworksModal` вже редагує + видаляє (scoped owner-only на BE).
- 2026-04-24 — **2.5.A / 2.5.B** — Delete уроку verified + Publish/Unpublish live (BE routes + FE кнопка + "Чернетка" badge).
- 2026-04-24 — **2.4.A / 2.4.B** — Group edit members + delete (CreateGroupModal в dual-mode: створення/редагування/видалення).

---

## Що лишилось (pending queue)

Актуальний порядок, нумерація з §"ПРІОРИТЕТ":

10. **1.2.A + 1.2.B** — Shop purchase toasts + loot box на BE (random на сервері).
11. **1.3.A + 1.3.B** — Room drag-save (debounced) + unlock нової кімнати.
12. **1.4.A** — Active character persist на BE.
13. **1.7.A** — Homework attachments upload flow.
14. **3.1.A + 3.1.B** — Parent payments view + chat init з teacher'ом своєї дитини.
15. **2.8.A + 2.8.B** — Chat delete own message + attach файл.

Skip'нуті (не блокуючі core): 1.1 SHOP_ITEMS_BY_ID, 1.5.A achievement triggers audit, 1.8.A lesson type mocks cleanup, 1.9 library programs mock modules, 2.2.A bulk grade, 4.3 admin entity CRUD, X.3 lesson player types.
