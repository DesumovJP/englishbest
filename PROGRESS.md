# EnglishBest — Frontend Progress Tracker

> Оновлюй цей файл після кожної сесії. Єдине джерело правди про стан фронтенду.

---

## Дизайн-система (актуальний стан)

| Токен | Значення |
|-------|----------|
| `--color-primary` | `#52c41a` |
| `--color-primary-dark` | `#389e0d` |
| `--color-primary-light` | `#95de64` |
| `--color-accent` | `#FF9600` |
| `--color-danger` | `#FF4B4B` |
| `--color-ink` | `#1f1f1f` |
| `--color-ink-muted` | `#6b7280` |
| `--color-ink-faint` | `#afafaf` |
| `--color-surface` | `#FAFAF8` ← тепло-кремовий (не чистий білий) |
| `--color-surface-muted` | `#F2F1EE` |
| `--color-border` | `#E3E2DF` |

**Глобальні glass-утиліти** (визначені в `globals.css @layer utilities`):
- `.glass-subtle` / `.glass` / `.glass-strong` / `.glass-input` / `.glass-nav`

**Правила:**
- NO inline styles — тільки Tailwind classes
- Виняток: `style={{ width: \`${n}%\` }}` для progress bars, і SVG-атрибути (fill, stroke)
- Glassmorphism тільки поверх фото/темних фонів (hero, popup)
- Сторінки — СВІТЛА тема (`bg-surface`, `text-ink`)

---

## Сторінки — статус

### ✅ Маркетинг / Онбординг

| Сторінка | Файл | Стан |
|----------|------|------|
| Головна | `app/home/page.tsx` | ✅ Світла тема, повна ширина, всі секції |
| Логін | `app/(onboarding)/login/page.tsx` | ✅ Світла тема, white card |
| Welcome | `app/(onboarding)/welcome/page.tsx` | ✅ Без бейджів і компаньйона |
| Onboarding | `app/(onboarding)/onboarding/page.tsx` | scaffold |
| Placement | `app/(onboarding)/placement/page.tsx` | scaffold |

### ✅ Kids Zone

| Сторінка | Файл | Стан |
|----------|------|------|
| Kids Dashboard | `app/(kids)/kids/dashboard/page.tsx` | ✅ Компаньйон, урок, цілі |
| Kids Room | `app/(kids)/kids/room/page.tsx` | ⚠️ 2D side-view, потребує редизайну під Toca Boca |
| Kids Shop | `app/(kids)/kids/shop/page.tsx` | ✅ Монетки, English challenge при купівлі |
| Kids Achievements | `app/(kids)/kids/achievements/page.tsx` | scaffold |
| Kids Coins | `app/(kids)/kids/coins/page.tsx` | scaffold |

### 📋 Адмін / Вчитель / Учень (dashboard)

| Сторінка | Файл | Стан |
|----------|------|------|
| Dashboard | `app/dashboard/page.tsx` | scaffold |
| Уроки | `app/dashboard/lessons/page.tsx` | scaffold |
| Бібліотека | `app/dashboard/library/page.tsx` | scaffold |
| Календар | `app/dashboard/calendar/page.tsx` | scaffold |
| Профіль | `app/dashboard/profile/page.tsx` | scaffold |
| Учні (admin) | `app/dashboard/students/page.tsx` | scaffold |
| Вчителі (admin) | `app/dashboard/teachers/page.tsx` | scaffold |
| Аналітика (admin) | `app/dashboard/analytics/page.tsx` | scaffold |
| Налаштування (admin) | `app/dashboard/settings/page.tsx` | scaffold |

---

## Компоненти — статус

| Компонент | Файл | Стан |
|-----------|------|------|
| ReviewsSlider | `components/molecules/ReviewsSlider.tsx` | ✅ Стрілки, 8 відгуків, dot pagination, СВІТЛА тема |
| PopupTimer | `components/molecules/PopupTimer.tsx` | ✅ Зелений header + dark glass форма, 25s |
| QuizWidget | `components/molecules/QuizWidget.tsx` | ✅ |
| CompanionSVG | `components/kids/CompanionSVG.tsx` | ✅ 10 настроїв |
| KidsPageHeader / KidsCoinBadge / etc | `components/kids/ui.tsx` | ✅ |

---

## Поточний фокус

→ **Kids Zone — Toca Boca редизайн**
Деталі і чеклист у `KIDS_ZONE.md`

---

## Технічний борг

- [ ] Мок API (`/api/mock/*`) не підключено — дані захардкоджені в компонентах
- [ ] Lesson player не має реального відеоплеєра
- [ ] `app/auth/profile/page.tsx` — має власний Sidebar, не через layout
