# Course Catalog — CEFR-aligned production rebuild

> Living document. Replaces the legacy 8-course kids catalog
> (`english-kids-starter`, `caterpillar`, `oxford-1`, `natgeo`, `peppa`,
> `bluey`, `simple-songs`, `word-puzzle`) with a proper A0 → C2
> progression. Pair with `REWARDS.md` for the motivation surface.

---

## Strategic principles

1. **CEFR-first.** Every course declares its level (A0..C2). A kid can't
   reach a B1 course without lower-level prerequisites making sense
   pedagogically.
2. **1–3 courses per level, sloped down with difficulty.** Lower levels
   need MORE volume (kids stay there longer); higher levels are
   short-but-dense. Total: **14 courses, ~55 lessons**.
3. **Kid-relatable themes.** Even at C1, the topic is "critical thinking
   about everyday choices", not literary criticism — this is a kids
   platform first.
4. **Lesson size: 6–8 steps.** Mixed types: 1–2 theory + 2 mcq + 1
   fill-blank + 1 of {word-order, match-pairs, translate}. Tunable per
   lesson but the floor/ceiling is fixed so engagement stays predictable.
5. **No filler.** Every step must teach something testable. No
   "decorative" image / video step unless it's a comprehension prompt.
6. **Reward-aware.** Lesson XP defaults to 15 (matches `LESSON_XP` in
   `lib/rewards.ts`). Per-course difficulty does NOT scale XP — that's
   what level + streak + achievements are for. The mini-task pipeline
   handles bonus content.

## CEFR distribution

| Level | Courses | Avg lessons/course | Total |
|-------|:-------:|:------------------:|:-----:|
| **A0** Pre-A1            | 3 | 5 | 15 |
| **A1** Elementary        | 3 | 5 | 15 |
| **A2** Pre-Intermediate  | 2 | 5 | 10 |
| **B1** Intermediate      | 2 | 4 | 8 |
| **B2** Upper-Int         | 2 | 3 | 6 |
| **C1** Advanced          | 1 | 3 | 3 |
| **C2** Proficient        | 1 | 2 | 2 |
| **Total**                |**14**|—|**59** |

## Course catalog

### A0 — First Steps (3 courses · 15 lessons)

#### `a0-first-words` — First English Words 🌱
*5 lessons · 6–7 steps each*
1. **Hello & Goodbye** — greetings, farewells.
2. **What's Your Name?** — introducing yourself, "I am" / "My name is".
3. **Yes & No** — basic answers, "I like" / "I don't like".
4. **Numbers 1–10** — counting, "How many?".
5. **Colors I Know** — basic colors, "It is blue".

#### `a0-my-body` — My Body 👋
*5 lessons · 6 steps each*
1. **Head, Hands, Feet** — body parts vocabulary.
2. **Touch Your Nose!** — imperatives ("Touch", "Show me").
3. **Big & Small** — adjectives, opposites.
4. **I Can See / I Can Hear** — senses + simple "can".
5. **My Face** — face features, "I have brown eyes".

#### `a0-at-home` — At Home 🏠
*5 lessons · 6 steps each*
1. **Mom, Dad, Family** — family member vocabulary.
2. **My Toys** — toy vocabulary, "I have a…".
3. **Eat & Drink** — food/drink basics, "I want…".
4. **Day & Night** — time-of-day vocabulary, "Good morning/night".
5. **Sleep, Wash, Eat** — daily verbs in present.

### A1 — Elementary (3 courses · 15 lessons)

#### `a1-my-family` — My Family & Me 👨‍👩‍👧
*5 lessons · 7 steps each*
1. **Family Members** — extended family, possessives ("my", "his", "her").
2. **This Is My Mom** — "this is" / "these are" + plurals.
3. **How Old?** — numbers 11–30, "How old is…?".
4. **What She Likes** — third-person singular present simple ("she likes / he plays").
5. **Family Photo** — describing photos, prepositions of place.

#### `a1-around-the-house` — Around the House 🛋️
*5 lessons · 7 steps each*
1. **Rooms in the House** — kitchen / bedroom / bathroom vocabulary.
2. **Where Is It?** — prepositions: in, on, under, next to.
3. **Furniture** — common items, "There is / There are".
4. **My Room** — describing your room, full sentences.
5. **Cleaning Up** — verbs: clean, wash, tidy, throw.

#### `a1-at-school` — At School ✏️
*5 lessons · 7 steps each*
1. **Things in My Bag** — school items vocabulary.
2. **Subjects I Study** — Math, English, Art, etc.
3. **Days of the Week** — Monday → Sunday, "On Monday I…".
4. **My Teacher Says…** — classroom phrases, polite forms.
5. **My Best Friend** — describing people: appearance, character.

### A2 — Pre-Intermediate (2 courses · 10 lessons)

#### `a2-food-and-drinks` — Food & Drinks 🍎
*5 lessons · 7 steps each*
1. **Healthy & Tasty** — fruit / vegetable / sweets vocabulary.
2. **Breakfast, Lunch, Dinner** — meal vocabulary, "I usually have…".
3. **In the Restaurant** — ordering: "I'd like…", "Can I have…?".
4. **Cooking Verbs** — cut, fry, bake, mix.
5. **Food Around the World** — country adjectives ("Italian pizza").

#### `a2-my-day` — My Daily Routine 🕐
*5 lessons · 7 steps each*
1. **Telling Time** — "It's seven o'clock", "half past nine".
2. **Morning Routine** — get up, brush teeth, have breakfast.
3. **After School** — present simple in routines, frequency adverbs.
4. **My Hobbies** — gerund forms ("I like reading"), simple opinions.
5. **Weekend Plans** — present continuous for plans, "I'm going to…".

### B1 — Intermediate (2 courses · 8 lessons)

#### `b1-travel-stories` — Travel Stories ✈️
*4 lessons · 8 steps each*
1. **Past Adventures** — past simple regular + irregular ("I went / I saw").
2. **At the Airport** — travel vocabulary, asking for directions.
3. **My Best Trip Ever** — descriptive writing, comparative adjectives.
4. **Different Cultures** — "would" for hypotheticals, opinions.

#### `b1-tech-around-us` — Technology Around Us 💻
*4 lessons · 8 steps each*
1. **Devices We Use** — modern device vocabulary.
2. **Internet Safely** — modal verbs (should, must, mustn't).
3. **Pros and Cons** — expressing balanced opinions.
4. **My Future Job** — predicting future ("will" + "going to").

### B2 — Upper-Intermediate (2 courses · 6 lessons)

#### `b2-news-society` — News & Society 📰
*3 lessons · 8 steps each*
1. **Reading News Headlines** — present perfect for current events.
2. **Climate & Environment** — passive voice, vocabulary.
3. **Volunteering** — discussing causes, conditional sentences.

#### `b2-books-movies` — Books & Movies 📚
*3 lessons · 8 steps each*
1. **Telling Stories** — narrative tenses (past simple/continuous/perfect).
2. **Reviewing a Movie** — opinion language, advanced adjectives.
3. **What If…?** — second/third conditional.

### C1 — Advanced (1 course · 3 lessons)

#### `c1-critical-thinking` — Critical Thinking 🧠
*3 lessons · 8 steps each*
1. **Spotting Arguments** — fact vs opinion, hedging language.
2. **Logical Fallacies** — common reasoning mistakes (in plain English).
3. **Convincing Writing** — discourse markers, formal register.

### C2 — Proficient (1 course · 2 lessons)

#### `c2-idioms-nuance` — Idioms & Nuance ✨
*2 lessons · 8 steps each*
1. **Everyday Idioms** — "break a leg", "a piece of cake", etc.
2. **Subtle Differences** — almost-synonyms, register, irony.

---

## Step-type budget per lesson (engagement design)

For a typical 7-step lesson the recommended mix is:

| Step type | Count | Why |
|-----------|:-----:|-----|
| theory | 1 | Sets up the new vocab/grammar. |
| multiple-choice | 2 | Quick wins, low cognitive load. |
| fill-blank | 1 | Active recall of just-learned form. |
| match-pairs | 1 | Vocabulary anchoring. |
| word-order or translate | 1 | Productive recall (output). |
| reading | 0–1 | Only on lessons that anchor a story. |

A 6-step lesson drops the reading or one mcq; an 8-step lesson adds a
second translate or a second match-pairs.

## Migration plan

- [x] **Phase 1** — Strategic plan locked (this document).
- [x] **Phase 2** — New `lesson-content/cefr/` directory: 3 A0 files,
      1 bundled A1 file, 1 bundled higher-levels file (A2..C2 shells).
      Orchestrator (`11-real-lessons.ts`) registers the catalog through
      the existing `COURSE_SEEDS` array — no new orchestrator needed.
- [x] **Phase 3** — Archival logic: legacy slugs are listed in
      `LEGACY_COURSE_SLUGS`; the orchestrator's new `archiveLegacyCourses`
      step walks them and flips `status='archived'`. Idempotent.
- [x] **Phase 4** — `level-lessons` criterion type added to the rewards
      engine (`lib/rewards.ts`). 7 `finish-{level}` achievements seeded
      (A0..C2) with thresholds matching the current seeded lesson count.
- [ ] **Phase 5** — QA: every lesson renders in `LessonEngine` for kids
      and `/courses/[slug]/lessons/[slug]` for adults; lesson completion
      writes user-progress; reward pipeline fires (15 XP / 10 coins per
      finish, achievement on level-complete). Manual verification needed
      after deploy.

## Quality bar

A lesson is "production-ready" when:
1. All steps load without console errors in `LessonEngine`.
2. Every MCQ has exactly 1 unambiguously correct option.
3. Every fill-blank `answer` matches what a B1 author considers the
   single most-common phrasing; `acceptedAnswers` covers obvious typos.
4. Every translate accepts at least 4 phrasings (lowercase, with/without
   trailing punctuation, common synonym swap).
5. Theory examples are real English (not placeholder).
6. Vocabulary lists in `reading` steps are translated correctly into
   Ukrainian (not machine-translated literal calques).
7. Lesson `xp` ≤ 15 (matches `LESSON_XP`); per-step rewards happen
   automatically through user-progress lifecycle.

## What's deferred to future sessions

This catalog has 59 lesson slots. Realistic per-session output is
~20–25 fully-written lessons of production quality. So the rollout
plan is:

- **Session 1 (this commit)** — A0 catalog (3 courses, 15 lessons) +
  A1 catalog (3 courses, 15 lessons) fully written. A2..C2 seeded as
  course shells (course exists with metadata, but lessons are stubs:
  title + 1–2 sample steps). Kids see the full ladder; teachers can
  fill in the remaining lessons via the `/dashboard/teacher-library`
  editor without touching seeds.
- **Future sessions** — flesh out A2..C2 lessons until every shell has
  full content. Each future commit writes one full course (~5 lessons)
  so the rollout stays reviewable.

## Working notes

- **2026-04-27** — Strategic plan locked. Audit confirmed the system is
  fully BE-driven (no runtime mock imports); migration is data-only.
  Old kids-themed seeds (caterpillar / peppa / bluey / etc.) get
  archived rather than deleted to preserve user-progress integrity.
- **2026-04-27** — Catalog rolled out. 14 CEFR courses seeded
  (A0×3, A1×3, A2×2, B1×2, B2×2, C1×1, C2×1). 30 lessons fully written
  for A0+A1 (foundation tier). 16 sample lessons across A2..C2 shells
  so the ladder is browseable from day one. Legacy 8 themed courses
  archived. Engine extended with `level-lessons` criterion + 7
  `finish-{A0..C2}` achievements seeded. Tier-gold/platinum rewards
  align with the level — finishing C2 gives the biggest bonus
  (1000 coins + 1000 XP) since it's the longest journey.
- **2026-04-27** — CRITICAL fix: kids `LessonEngine` was never calling
  `createProgress` on completion. The reward pipeline (coins / XP /
  streak / achievements) never fired from a kids course finish — only
  from mini-tasks / homework grading / attendance. Now LessonEngine
  takes `lessonDocumentId` + `courseDocumentId` props (passed from
  the route), calls `createProgress({ status: 'completed' })` on the
  last step, and emits `kids:server-state-stale` so the HUD refreshes
  with the new totals. This unlocks the entire CEFR catalog as a real
  reward source — finishing 15 A0 lessons now actually fires the
  `finish-a0` achievement instead of being purely cosmetic.
