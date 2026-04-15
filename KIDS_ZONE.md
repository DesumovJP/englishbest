# Kids Zone — Toca Boca Redesign

> Єдине джерело правди для дитячої зони. Оновлювати після кожної реалізованої фічі.

---

## Концепція (підтверджена)

Орієнтир: **Toca Boca** (Toca Life World)

Механіки:
- Кілька **кімнат**, які відкриваються при накопиченні певної кількості монеток
- **Лут-бокси** (mystery boxes) — відкриваєш і отримуєш випадковий предмет (меблі, декор)
- Колекція **персонажів** — нові персонажі як нагорода за досягнення / бокси
- Система **одягу** для персонажів (шапки, шарфи, окуляри тощо)

Монетки заробляються за:
- Проходження уроків
- Щоденний стрік
- Виконання завдань

---

## Архітектура Kids Zone

```
/kids/dashboard     ← головний екран: компаньон + швидкий доступ
/kids/room          ← інтерактивна кімната (розставляти меблі)
/kids/shop          ← магазин боксів + прямий продаж
/kids/achievements  ← нагороди і бейджі
/kids/coins         ← баланс і транзакції
/kids/characters    ← (НОВА) колекція персонажів + одяг
```

---

## Кімнати — система відкриття

| ID | Назва | Монетки для відкриття | Статус |
|----|-------|-----------------------|--------|
| `bedroom` | Спальня | 0 (стартова) | ✅ є в коді |
| `garden` | Садок | 500 | ⚠️ зараз відкривається за рівнем A1→5, треба замінити |
| `castle` | Замок | 1500 | ⚠️ зараз за рівнем B1→10, треба замінити |
| `space` | Космос | 3000 | 🔲 нова кімната |
| `underwater` | Підводний світ | 5000 | 🔲 нова кімната |

**TODO:** Замінити `unlockedAt: number` (рівень) → `coinsRequired: number` в ROOMS array.

---

## Лут-бокси

### Типи боксів

| Бокс | Ціна | Вміст | Рарність |
|------|------|-------|----------|
| 🎁 Звичайний | 50 монеток | Меблі common, декор | Common |
| 🌟 Срібний | 150 монеток | Меблі + rare декор | Uncommon |
| 💎 Золотий | 400 монеток | Rare предмети + шанс персонажа | Rare |
| 🔮 Легендарний | 1000 монеток | Legendary предмет + персонаж гарантовано | Legendary |

### Механіка відкриття
1. Тап на бокс → анімація "тряски" (shake)
2. Бокс відкривається (bounce-in анімація кришки)
3. Вилітає предмет з частинками (confetti)
4. Показується: emoji + назва + рарність (колоровий badge)
5. Кнопка "До кімнати" або "Відкрити ще"

### Статус
- [ ] Компонент `LootBox` (анімація відкриття)
- [ ] Таблиця шансів для кожного типу
- [ ] Інтеграція в Shop page (вкладка "Бокси")
- [ ] Інтеграція в Dashboard (featured box)

---

## Персонажі

### Поточний стан
- Один компаньон із `mockKidsUser.companion` (name, animal, mood)
- `CompanionSVG` підтримує: owl, cat, fox, dog, rabbit

### Ціль
- **Колекція персонажів** — кожен має ім'я, вид тварини, рідкість
- Персонажі отримуються з боксів або за досягнення
- Один активний компаньйон (можна змінювати)

### Початкова колекція (v1)

| ID | Ім'я | Тварина | Як отримати | Рідкість |
|----|------|---------|-------------|----------|
| `owl_default` | Олів'є | owl | Стартовий | Common |
| `cat_luna` | Луна | cat | Срібний бокс | Uncommon |
| `fox_rusty` | Рустік | fox | Золотий бокс | Rare |
| `dog_buddy` | Бадді | dog | 30-денний стрік | Rare |
| `rabbit_pearl` | Перлина | rabbit | Легендарний бокс | Legendary |

### Статус
- [ ] Сторінка `/kids/characters` — грід персонажів
- [ ] Активний персонаж — зберігати в стані/localStorage
- [ ] Locked state (замазані/сірі) для незібраних

---

## Система одягу

### Слоти

| Слот | Приклади |
|------|----------|
| 👒 Головний убір | Циліндр, Корона, Бейсболка, Вуха кота |
| 🧣 Аксесуар | Шарф, Краватка, Намисто |
| 🕶️ Окуляри | Сонцезахисні, Круглі, Серця |
| 🎒 Спина | Рюкзак, Крила, Плащ |

### Архітектура
- `CompanionSVG` отримує проп `outfit: { hat?: string, accessory?: string, glasses?: string, back?: string }`
- Кожен предмет одягу малюється поверх базового SVG персонажа

### Статус
- [ ] Розширити `CompanionSVG` для outfit слотів
- [ ] Перший набір: 3-4 предмети на слот
- [ ] UI вибору одягу в `/kids/characters`

---

## Кімната — Технічний план

### Поточний стан (2D side-view)
- Стіна 50% + підлога 50%
- Меблі по одній горизонтальній лінії
- Drag тільки по горизонталі (xPct)
- SVG меблі: BedSVG, DeskSVG, BookshelfSVG, PlantSVG, WindowSVG + ін.

### Ціль: покращена 2D (Toca Boca style, не isometric)
Toca Boca сам по собі НЕ isometric — це flat 2D з паралельною проекцією і depth через Y-позицію.

- Кімната: задня стіна + підлога, кут кімнати (як Habbo, але flat)
- Предмети мають "тінь" для відчуття глибини
- Чим нижче предмет на екрані — тим він "ближче" (більший z-index)
- Drag у 2D (x + y)
- Depth sorting: `zIndex = Math.round(yPct)`

### Пріоритети реалізації
1. **Лут-бокс** — найвища цінність для геймплею
2. **Персонажі** — колекція на Dashboard
3. **Система одягу** — розширення CompanionSVG
4. **Кімната v2** — Y-drag + depth sorting
5. **Нові кімнати** — space, underwater

---

## Checklist (поточний спринт)

- [x] LootBox компонент — `components/kids/LootBox.tsx`
  - [x] Анімований бокс (BoxArt) з кришкою, бантом, стрічками
  - [x] 4 типи: common / silver / gold / legendary
  - [x] State machine: idle → shaking → opening → revealed
  - [x] Confetti burst при reveal
  - [x] Зірки мерехтять в idle
  - [x] RevealCard з рарністю і кнопками
  - [x] BoxCard для грід-відображення в Shop
- [x] Shop: вкладка "Бокси" першою — `app/(kids)/kids/shop/page.tsx`
  - [x] Новий таб "Бокси" з 4 BoxCard
  - [x] Підказка "Як заробити монетки"
  - [x] LootBoxModal відкривається на тап по BoxCard
  - [x] Баланс оновлюється після відкриття
- [x] Dashboard: повний Toca Boca редизайн — `app/(kids)/kids/dashboard/page.tsx`
  - [x] RoomScene: кімната (стіна + підлога + dado rail) замість градієнту
  - [x] Декорації: WindowDecor, ABCPoster, ShelfDecor, AreaRug
  - [x] RoomBox: міні-бокс стоїть у кімнаті, тап → LootBoxModal
  - [x] Білінгвальні бульбашки (EN перший + UA дрібніше)
  - [x] HUDBar: streak / coins / XP горизонтально
  - [x] LessonCard: EN назва уроку, прогрес-бар крапками
  - [x] DailyChallenges: EN + UA, монетки як нагорода
  - [x] NavTiles: Toca Boca квадрати (4 кольори, 3D-тінь, EN+UA)
- [x] Room — `app/(kids)/kids/room/page.tsx` (Сесія 5 redesign)
  - [x] Full-screen `kids-room-bg.webp` background (active room bg applied)
  - [x] Character centered with idle float animation + tap → bounce-in
  - [x] Word bubble: tap → EN word + UA + "+1 слово!" (12 vocab words)
  - [x] Top bar: ← dashboard | room name pill + coins | 🛍️ shop
  - [x] Bottom horizontal room selector: frosted glass cards, 5 rooms
  - [x] Unlock by coins: 0 / 300 / 800 / 1500 / 3000
  - [x] Locked rooms shown at 55% opacity with 🔒 + coin requirement
  - [x] Active room: green border + dot indicator
  - [x] Custom rooms from IndexedDB merged into selector
  - [x] `activeRoomId` added to KidsState
- [x] `/kids/characters` сторінка — колекція персонажів
  - [x] Collection grid (locked/unlocked)
  - [x] Active character selector (persisted in IndexedDB)
  - [x] Outfit customization (hat/glasses/scarf/bag)
  - [x] Mood gallery strip
  - [x] Custom characters shown alongside built-in ones

---

## Phase 2 — Custom Assets & Toca Boca UI ✅

### Foundation
- [x] `lib/kids-store.ts` — IndexedDB CRUD (items / rooms / characters / kidsState), no external deps
- [x] `lib/use-kids-store.ts` — React hooks: `useCustomItems`, `useCustomRooms`, `useCustomCharacters`, `useKidsState`
- [x] Cross-component sync via `CustomEvent` — changes propagate instantly
- [x] `fileToBase64` utility for PNG/GIF uploads

### Toca Boca CSS Layer
- [x] `.toca` wrapper in `globals.css` — full Toca Boca design system, scoped, no conflict with adult UI
- [x] Classes: `.tk-card`, `.tk-btn` (+ color variants), `.tk-nav-tile`, `.tk-badge`, `.tk-progress-*`, `.tk-item-card`, `.tk-character-card`, `.tk-hud`, `.tk-modal-overlay`, `.tk-tab-bar`
- [x] Image state classes: `.tk-img-idle`, `.tk-img-hover`, `.tk-img-active` (CSS-only state switching)
- [x] Animation utilities: `tk-animate-bounce`, `tk-animate-pop`, `tk-animate-float`, etc.
- [x] `app/(kids)/layout.tsx` updated to wrap in `<div className="toca">`

### Smart Display Components
- [x] `components/kids/CharacterDisplay.tsx` — checks IndexedDB for mood image, falls back to CompanionSVG + outfit overlays
- [x] `components/kids/ItemDisplay.tsx` — checks IndexedDB for idle/hover/active images, falls back to emoji

### Admin "+" Interface
- [x] `components/kids/AddCustomModal.tsx` — Toca Boca bottom sheet with 3 tabs:
  - [x] 📦 Add Item — name EN/UA, category, emoji fallback, price, idle/hover/active image uploads
  - [x] 🏠 Add Room — name EN/UA, coins required, background image upload
  - [x] 🐾 Add Character — name EN/UA, fallback animal, per-mood image uploads (10 moods)
- [x] "+" button in Shop header opens the modal

### Page Updates
- [x] Shop — custom items merged with default items per tab, custom images shown, `AddCustomModal` wired
- [x] Characters page — custom characters displayed in collection grid
- [x] Room page — custom rooms added to selector, custom background images applied to wall
- [x] Dashboard — `CharacterDisplay` replaces `CompanionSVG` directly (supports mood images from IndexedDB)
- [x] Nav tiles — "Characters 🐾" tile added (replaces Achievements on main dashboard)

---

## Сесії

### Сесія 5 (2026-04-15) — Room page v2 (game-style)

- Recreated `room/page.tsx` from scratch per Сесія 4 game UI concept
- Full-screen background, character centered, tap-to-learn vocab (12 words)
- Top frosted-glass HUD: ← | room name + emoji | coins | 🛍️
- Bottom horizontal room selector: 5 built-in + custom rooms from IndexedDB
- Added `activeRoomId?: string` to `KidsState`

---

### Сесія 4 (2026-04-12) — Game UI redesign

**Нова концепція UI (підтверджена):**
- Full-screen background images (реальні картинки, не SVG/градієнти)
- Game-like layout: HUD зверху, nav знизу, контент по боках
- Ніяких карток з кольоровими градієнтами, ніякого "вінегрету"
- Макс 1 акцентний колір на екрані

**Dashboard** (`/kids/dashboard`):
- Фон: `/public/kids-dashboard-bg.jpg` (school courtyard)
- Персонаж по центру, float + bounce анімація при tap
- Top HUD: один прозорий pill (streak / coins / XP) + кнопка Characters
- Side buttons: 🎁 loot box (ліворуч), урок-картка (праворуч, collapsed/expanded)
- Bottom nav: 5 іконок (Room / Shop / Lessons / Rewards / Coins)

**Room** (`/kids/room`):
- Фон: `/public/kids-room-bg.webp` (real interior photo)
- Тільки персонаж. Всі SVG-меблі видалені — чиста кімната
- Top bar: ← + монетки + 🛒
- Bottom: горизонтальний scroll selector кімнат

**Shop** (`/kids/shop`):
- h-[100dvh], top bar + content + bottom tabs (Boxes/Furniture/Decor/Outfit/Special)
- Cards: white, тонка border, 1 колір shadow

**Characters** (`/kids/characters`):
- top bar + great preview strip + outfit row + grid

**Achievements** + **Coins**:
- top bar + clean list/cards. Один колір на hero.

---

### Сесія 3 (2026-04-12) — Phase 2 continued
- Achievements page: full Toca Boca redesign, live stats from IndexedDB
- Coins page: full Toca Boca redesign, live balance from IndexedDB
- Dashboard: live stats (coins/streak/xp) from IndexedDB, active character from `kidsState.activeCharacterId`
- Nav tiles: expanded to 6 (3×2 grid) — added Achievements + Coins
- `/kids/characters`: outfit changes persist to IndexedDB

---

### Сесія 1 (2026-04-12)
- Визначено концепцію (Toca Boca)
- Підтверджено: стосується room + dashboard
- Зафіксовано поточний стан всіх kids-сторінок
- Створено цей файл як єдине джерело правди
