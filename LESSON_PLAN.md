# Lesson Engine — план реалізації

## Концепція
Duolingo-подібний урок: лінійна послідовність кроків.
Флоу: **Теорія → Вправи → Успіх (+ лінк на дзвінок)**

---

## Типи кроків (Step types)

| Тип | Компонент | Опис |
|-----|-----------|------|
| `theory` | `StepTheory` | Текст + приклади + картинка |
| `multiple-choice` | `StepMultipleChoice` | Питання + 4 варіанти, 1 правильний |
| `fill-blank` | `StepFillBlank` | Речення з пропуском, вводити слово |
| `word-order` | `StepWordOrder` | Перетягнути слова в правильний порядок |
| `match-pairs` | `StepMatchPairs` | З'єднати пари (слово ↔ переклад) |
| `translate` | `StepTranslate` | Перекласти речення (вільне введення) |

---

## Структура даних уроку

```ts
// mocks/lessons/[lessonSlug].ts
interface LessonStep {
  id: string
  type: 'theory' | 'multiple-choice' | 'fill-blank' | 'word-order' | 'match-pairs' | 'translate'
  // ...payload залежить від типу
}

interface LessonData {
  slug: string
  title: string
  courseSlug: string
  xp: number         // нагорода в XP
  steps: LessonStep[]
}
```

---

## Файли для створення

### Компоненти уроку (`components/lesson/`)
- [x] `LessonEngine.tsx` — оркеструє кроки, прогрес-бар, стан
- [x] `LessonProgress.tsx` — верхній прогрес-бар + кнопка виходу
- [x] `LessonSuccess.tsx` — екран успіху + лінк на відео-дзвінок
- [x] `StepTheory.tsx` — теоретичний блок
- [x] `StepMultipleChoice.tsx` — вибір відповіді
- [x] `StepFillBlank.tsx` — заповнити пропуск
- [x] `StepWordOrder.tsx` — скласти речення зі слів
- [x] `StepMatchPairs.tsx` — з'єднати пари
- [x] `StepTranslate.tsx` — написати переклад

### Мок-дані (`mocks/lessons/`)
- [x] `food-drinks.ts` — приклад уроку (теорія + 5 вправ)

### Сторінка уроку
- [x] `app/courses/[courseSlug]/lessons/[lessonSlug]/page.tsx`

### Конструктор курсів (адмін)
- [x] `app/dashboard/course-builder/page.tsx`

---

## Course Builder (адмін-конструктор)

Сторінка `/dashboard/course-builder`:
- Ліва панель: список кроків поточного уроку (drag-to-reorder)
- Права панель: форма редагування вибраного кроку
- Палітра типів кроків (кнопки "+ Додати крок")
- Кнопка "Попередній перегляд" → показує LessonEngine з мок-даними
- JSON-експорт (кнопка "Скопіювати JSON")

---

## Статус реалізації

- [x] LESSON_PLAN.md (цей файл)
- [x] Компоненти lesson/ (всі 6 типів + Engine + Progress + Success)
- [x] Мок-дані (mocks/lessons/types.ts + food-drinks.ts)
- [x] Сторінка уроку (app/courses/[courseSlug]/lessons/[lessonSlug]/page.tsx)
- [x] Course Builder (app/dashboard/course-builder/page.tsx)
- [x] CourseLayout спрощено до прохідника (урок full-screen без sidebar)

## Залишилось перевірити / доробити
- [x] Другий мок-урок (my-house.ts)
- [x] CourseLayout → прохідник, lesson full-screen
- [x] Library [programSlug] — sidebar через layout.tsx ✅
- [x] match-pairs редактор у Course Builder
- [x] Кнопка "Переглянути урок" — превью прямо в конструкторі
- [x] StepWordOrder — прибрано мертвий код

## Подальший розвиток (за потреби)
- [ ] Login / Register — редизайн під дизайн-систему
- [ ] Більше мок-уроків
- [ ] Стан прогресу зберігати в localStorage
