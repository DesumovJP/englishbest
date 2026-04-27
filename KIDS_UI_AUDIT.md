# Kids UI Audit — Уроки / Слова / Курс-detail / Слова-detail

> **Створено:** 2026-04-28
> **Статус:** аналіз → узгодження → ітеративна імплементація
> **Принцип:** zero візуального сміття. Легке сприйняття, приємно на вигляд, максимально зручно.

Аналіз стосується 4 екранів kids-зони:

1. `app/(kids)/kids/lessons/page.tsx` — Уроки (карусель)
2. `app/(kids)/kids/vocab/[id]/page.tsx` — Слова детально (`Числа і час`)
3. `app/(kids)/kids/library/[id]/page.tsx` — Курс детально (`Мій світ`)
4. `app/(kids)/kids/school/page.tsx` (вкладка `vocab`) — Слова листинг

---

## 1. Наскрізні проблеми

### 1.1 Конфлікт двох мов одночасно
В системі вже є **дві сформовані мови** (див. `frontend/app/globals.css`):

- **iOS / Notion** (`globals.css:457-653`): `ios-card`, `ios-list`, `ios-row`, `ios-toolbar`, `ios-section-label`, `ios-btn`, `ios-chip`, `ios-seg` — flat surfaces, hairline borders, нейтральні
- **Toca-Boca** (`globals.css:740-1005`): `tk-card`, `tk-btn`, `tk-nav-tile` — bouncy 3D shadow, grosso, ігрова

Сторінки kids **змішують їх ad-hoc**: десь inline `className="rounded-2xl border border-border bg-surface-raised"`, десь `bg-primary text-white shadow-card-sm`, ніде не звертаються до жодної з готових ролей. Тому виглядає як "майже iOS, але з дрібними рандомами". Це і є головне джерело "сміття".

**Рішення:** жорстка межа.
- **kids dashboard** (Уроки / Слова / Бібліотека / Курс-detail / Vocab-detail) — повністю на **iOS-mode** (`ios-list` + `ios-row` + `ios-section-label` + `ios-chip`).
- **Ігрові поверхні** (room / shop / characters / loot-box) — **Toca-Boca** залишається.

### 1.2 Подвійна навігація з'їдає 25% екрану
У `school/page.tsx:213-257` над контентом:

1. Tab-bar `Уроки / Слова / Бібліотека` — 60px
2. Course-pills `Мій світ 0/1` + `Фундамент 0/8` — 50px
3. Course-ribbon з прогресом `English Foundation` — 60px
4. + `Карусель / Список` toggle справа

→ **3 рівні** рекламують один і той же курс. На мобілі — 200+ px марнування ще ДО першого слова контенту.

**Рішення:** один `ios-toolbar` з усім: tab зліва, segment-control справа. Course-switcher і прогрес зливаються в єдиний sticky-ribbon **ПЕРШОЇ карти** (як в `LessonCarouselSection.tsx:776-827` `CourseSwitcher`, але без дублювання в `school/page.tsx`).

### 1.3 "Зелений-зелений-зелений" і випадкові акценти
- **Уроки-карусель:** зелений `Карусель`, зелений `NOW`, зелений border, зелений glow, зелена прогрес-стрічка → чотири джерела одного зеленого в 200×100px.
- **Слова-detail:** жовто-помаранчевий "Тема" + золотий cover + жовтий `Показати всі` → жовтий не закладений в дизайн-систему як kids-accent, з'являється тільки тут і тільки через `paletteFor(slug)`.
- **Курс-detail:** green CTA, green chip `A1`, green icon-bg → той самий `primary` ужитий і як рівень-tag, і як CTA. Втрачається ієрархія.

**Правило (per memory `feedback_kids_ui`):** ОДИН accent на сторінку.
- Зелений = primary CTA + current state.
- Все інше — neutral chips (`ios-chip`).
- Категорійний колір (`paletteFor`) живе **тільки в cover-зоні** thumbnail'у, не виходить у chips/buttons/borders.

### 1.4 Picsum-заглушка в Уроках-каруселі
`LessonCarouselSection.tsx:96` — `picsum.photos/seed/{slug}/400/540`. Кожен урок отримує випадкове stock-фото (друкарські машинки, кактуси…), розмите і затемнене. Це **візуальний шум №1**: дитина бачить рандомний blur замість осмисленого артефакту уроку.

**Рішення:** прибрати picsum. Cover уроку = "тонована листівка кольору курсу + іконка типу уроку":
- великий accent-gradient (як обкладинки в Слова-listing — `paletteFor` уже видає такі)
- центральне `iconEmoji` курсу 96-128px
- title white-bold
- жодних фото

### 1.5 Бідна типографія/мікротипографія
- "1 уроків" в Курс-detail (`library/[id]/page.tsx:288`) — без плюралізації.
- `натисни` в Vocab-detail на кожному рядку — повторює одне й те ж 18 разів = шум.
- Skeleton-bar там, де ховається переклад → читається як "loading", а не "приховано". Користувач думає, що сторінка не догрузилась.

---

## 2. Page-by-page план

### 2.1 `kids/school` (Уроки + Слова + Бібліотека) — об'єднаний shell
- **Один тулбар** в стилі `ios-toolbar`: таби зліва, segment-control справа, hairline-bottom. 56px на мобілі, 64px на desktop.
- **Course chips прибрати окремим рядком.** Активний курс показується тільки на ribbon першого ряду карусельного контенту.
- Перемикання курсів — через `CourseSwitcher` (вже існує — `LessonCarouselSection.tsx:776`), просто прибрати дублюючий рядок з `school/page.tsx`.

### 2.2 `kids/lessons` карусель — повний redesign cover
- **Прибрати picsum.photos.**
- **Cover** = радіальний/лінійний градієнт course-accent + центральне emoji типу уроку 64px + назва уроку 22-26px white.
- **Скоротити "статусні маркери"** з 4 до 1: тільки рамка current accent. `NOW`, `✓`, glow — або одне, або жодного. Залишаю тільки accent-рамку + маленький `▶` icon знизу для current, ✓-чіп для done.
- **Адаптив:** на мобілі 1 карта в фокусі = 70vw, бічні peek по 8% з кожного боку. На desktop — 30vw, peek 20%.
- **Прогрес-ribbon** → з `bg-surface-muted border-b` робимо `glass-subtle` overlay поверх першого ряду карт (як iOS App Store): не з'їдає висоту, ховається при scroll.

### 2.3 `kids/vocab/[id]` (Слова детально) — у єдиній мові з Бібліотекою
**Поточний стан:**
- Hero з cover 140-180px + chips + бажтини кнопки → виглядає як landing.
- Список слів — кожен рядок iOS-row, але `натисни` × N і skeleton-bar = шум.

**План:**
- **Hero компактний** як у `library/[id]`: cover 64-72px (НЕ 180px), title H1, line з chips `Тема · A1 · 18 слів`, опис 2 рядки. Висота hero ~120px замість ~280px.
- **`Показати всі / Приховати`** → `ios-btn-secondary` справа в headerі секції "СЛОВА", не у hero. Counter `1/18 відкрито` — справа від section-label, дрібно.
- **Word-row:** лівий номер (моно, 16px ink-faint), word (font-black 16px), part-of-speech як `ios-chip` справа. Translation **не показуємо** доки не натиснуть → замість grey-bar просто **відсутність** translation і дрібний `›` справа. При expand — translation під word, example відступом 20px з border-left accent.
- **Без 18 повторюваних "натисни".** Підказка одна — над списком: "Натисни на слово, щоб побачити переклад".

### 2.4 `kids/library/[id]` (Курс-detail "Мій світ")
- **Hero ще більш компактний:** 56px icon у `bg-primary/10` + title + sub + chips одним рядком. Зараз 88px з іконкою + 2 рядка лейблів = розкидано.
- **Додати hero strip** на 100% width 120px заввишки з course-accent gradient + emoji 96px з боку — як на App Store details. Це єдина "емоція" на сторінці; решта — iOS-list rows.
- **Прогрес-блок** переробити: track + counter + дрібний "наст. урок: Rooms in My House" → одна композиція замість трьох окремих.
- **Lessons section** — `ios-list` (вже частково так, перевірити що використовує токени, а не inline borders/radii).
- **Плюралізація:** "1 уроків" → "1 урок", "2 уроки", "5 уроків" (utility функція).

### 2.5 `kids/school` Слова tab → **візуальна копія Бібліотеки**
Зараз `VocabularySection.tsx` уже зроблений як клон `LibraryCatalog`. Що поправити:

- **Cover thumbnail:** переключити з `linear-gradient` (поточний darker→accent) на той самий **book-cover** style, що Library (`COVER_BG[item.kind]` в `library.ts`). Book-thumbs Бібліотеки виглядають як обкладинки книжок — додати такий же варіант для vocab-сетів. Тоді обидві колонки візуально невідрізнювані за плиткою.
- **Type-chip:** Бібліотека → `Книга / Курс / Відео / Гра`; Vocab → `Тема / Курс / Урок`. Уніфікувати: однакові radius, padding, font-size, accent-tinting.
- **Прибрати yellow-on-yellow** на "Тема" — використати neutral `ios-chip`.

---

## 3. Адаптивність (mobile-first)

Всі 4 сторінки мають жити в одному responsive-контракті:

| Breakpoint | Layout |
|---|---|
| `<640px` | Single column, max-width 100%, padding `px-3 py-4`, тулбар sticky-top |
| `640-1024` | Single column, `max-w-screen-sm mx-auto`, padding `px-4 py-5` |
| `≥1024` | Бібліотека/Слова — sidebar 196px + main; Курс/Vocab-detail — `max-w-screen-md mx-auto`, hero розкладається icon-left + meta-right; Карусель — фокусна карта `clamp(280px, 30vw, 380px)` |

Зараз різні сторінки мають різні `max-w-*`:
- `lessons/page.tsx:14` — `screen-sm`
- `vocab/[id]/page.tsx:163` — `screen-md`
- `school/page.tsx:213` — full-width

Треба впорядкувати.

---

## 4. Дизайн-контракт (узагальнено)

**Поверхні:** `bg-surface-raised` (білий), `bg-surface-muted` (sub-page), `bg-surface-sunk` (сегмент-track). Все на `border-border` hairline. Без shadow на cards у dashboard-зоні.

**Радіуси:** 14px (`ios-card` / `ios-list`), 10-12px (buttons/inputs), 999px (chips/pills). Жодних `rounded-2xl/3xl/[28px]` для каталог-цілей.

**Типографія:** `type-h1` / `type-h2` / `type-h3` / `type-body` / `type-label` (вже існують у `globals.css:341-401`). Замість inline `font-black text-[15px]` — semantic class.

**Кольори:**
- 1 accent на сторінку (зелений primary)
- chips — neutral by default (`ios-chip`), кольоровий variant тільки якщо несе сигнал
- категорійний colour (`paletteFor`) — лише в cover thumbnail, нікуди не виходить

**Іконки/emoji:** одна лінія використання — emoji в cover (больші, без backdrop), маленькі emoji в section-label (`📚`, `🎓`, `📝`). Без декоративних emoji в title-зоні рядків.

**Стани:**
- current — accent-рамка + accent-fill в number-dot
- done — `success` (зелений) `✓` без border
- upcoming — neutral, без візуальних сигналів

---

## 5. План імплементації — 3 ітерації

Розбито на короткі коміти (per memory `feedback_chunked_work`), кожен виконується незалежно з можливістю переглянути в браузері.

### Iter-1 — Vocab-detail (`vocab/[id]/page.tsx`)
**Виграш:** найочевидніший. Сторінка зараз read-heavy, найбільше виграє від декомпресії.
- Hero компактний (120px замість 280)
- Замість skeleton-bar для прихованих перекладів — просто відсутність + `›`
- Підказка "натисни" одна над списком
- Кнопки `Показати всі/Приховати` → секція-header
- Список слів на `ios-list` + `ios-row` стилі

### Iter-2 — Карусель (`LessonCarouselSection.tsx`) + School-toolbar
- Прибрати picsum
- Cover = course-accent gradient + lesson-type emoji + title (на чистому фоні без фото)
- Один статус-маркер замість чотирьох
- Об'єднати tabs+segment+course-switcher в один тулбар у `school/page.tsx`
- Course-pills прибрати з окремого рядка

### Iter-3 — Course-detail (`library/[id]/page.tsx`) + Vocab-listing виправлення
- Hero strip 120px з accent-gradient + emoji 96px
- Hero meta компактний один рядок
- Об'єднана прогрес-композиція
- Lessons на `ios-list`
- Плюралізація `n уроків` → `n урок/уроки/уроків`
- VocabularySection — cover у book-cover style, type-chip у neutral `ios-chip`

---

## 6. Open questions (потребують підтвердження)

1. **Жорстка межа iOS / Toca-Boca** — kids dashboard повністю переходить на iOS-mode, Toca залишається тільки в ігровій зоні (room/shop/characters/loot-box). ✅ / ❌?
2. **Cover-стратегія для каруселі** — accent-gradient + emoji замість picsum. ✅ / ❌? Якщо потім хочемо ілюстрації — то як окремий етап.
3. **Порядок ітерацій** — Iter-1 = Vocab-detail. ✅ / ❌? Або кращий стартовий екран інший?

---

## 7. Файли, які торкнемо

```
frontend/app/(kids)/kids/school/page.tsx           ← toolbar, course-pills
frontend/app/(kids)/kids/vocab/[id]/page.tsx       ← Iter-1 cover
frontend/app/(kids)/kids/library/[id]/page.tsx     ← Iter-3 hero strip
frontend/components/kids/LessonCarouselSection.tsx ← prog cover, picsum kill
frontend/components/kids/VocabularySection.tsx     ← chip уніфікація
frontend/lib/library.ts                            ← COVER_BG для vocab
frontend/lib/vocabulary.ts                         ← можливо додати covertype
```

Без правок `globals.css` — все необхідне (`ios-*`, `tk-*`, `type-*`, токени) уже є.
