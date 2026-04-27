# Course Catalog — CEFR-aligned production rebuild

> Living document. Tracks two generations of the catalog:
> **v1 (deprecated)** = 14-course CEFR ladder (A0..C2) — solved the
> "no real CEFR" problem but lessons were too thin (5–7 steps each;
> "three pathetic questions" feedback). All 14 v1 courses are
> archived (`status='archived'`).
> **v2 (current)** = 6 deep courses, 3 per band, ~8 lessons each with
> 10–15 substantive steps per lesson. Plus a separate Vocabulary block
> (`vocabulary-set` content type) for spaced word acquisition.
>
> Pair with `REWARDS.md` for the motivation surface.

---

## v2 Strategic principles (current)

1. **Depth over breadth.** Few but rich courses. v1 had 14 thin courses
   (5–7 steps/lesson — "three pathetic questions"). v2 cuts to 6 deep
   courses (3 A-band + 3 B-band) with 8 substantial lessons each.
2. **Lesson size: 10–15 steps.** Real teaching. Per-lesson budget:
   2 theory (intro + grammar deep-dive), 4 mcq (graduated difficulty),
   2 fill-blank, 1–2 match-pairs (vocab anchoring), 1 word-order or
   translate (productive recall), 1 reading every 2–3 lessons (anchored
   passage with comprehension Qs). 10–15 minutes of focused study.
3. **Sequential narrative.** Lesson N builds on N-1 inside a course.
   Course N+1 reuses + extends the grammar/vocab arc from Course N.
   By the end of A-band the kid can introduce themselves, describe
   surroundings, express simple preferences, narrate routine. By the
   end of B-band: tell a story, give an opinion, navigate real life.
4. **Vocabulary as a separate first-class block.** New `vocabulary-set`
   content type — slug, level, topic, words (json: word + translation
   + example + exampleTranslation), optional course relation. Kids
   browse `/kids/vocab` independently OR see "Words for this course"
   on a course page. No more 4-word lists hidden inside a lesson.
5. **Kid-relatable themes throughout.** Even B2 stays grounded
   (technology in their hands, school choices) — not literary
   criticism.
6. **Reward-aware.** Lesson XP stays at 15 (matches `LESSON_XP` in
   `lib/rewards.ts`). Vocabulary completion fires its own small
   reward (5 XP / 5 coins per set) so word-grinding is visible to the
   motivation system.

## v2 catalog (6 courses, 48 lessons total target)

### A-band — Beginner → Pre-Intermediate (3 courses, 24 lessons)

#### `a-foundation` — English Foundation 🌱
Entry point. Hello → introducing self → family → simple objects → basic
present. By the end the kid can hold a 30-second self-intro chat.
- 1. Hello! Names — greetings, "I'm", asking names.
- 2. Where Are You From? — countries, nationalities.
- 3. Numbers & Age — 1–30, "How old", "I'm 8".
- 4. My Family — family vocab + possessives + "this is".
- 5. What's This? — common objects, this/that, articles a/an/the.
- 6. Colors & Sizes — basic descriptors + "It is".
- 7. I Like / I Don't — preferences, food, animals.
- 8. My Day — daily verbs, Present Simple intro.

#### `a-my-world` — My World 🏠
Daily life. Home, school, food, hobbies. Adds Present Continuous
contrast and "there is/are".
- 1. Rooms in My House
- 2. At School
- 3. Food I Eat
- 4. What I Do Every Day (Present Simple deep-dive)
- 5. What I'm Doing Now (Present Continuous + contrast)
- 6. My Hobbies (gerunds: like + V-ing)
- 7. Days, Time, Routines (telling time + frequency adverbs)
- 8. Weekend Plans (going to + present continuous future)

#### `a-people-places` — People & Places 🌍
Description and comparison. Past simple intro. By the end: comparing
places, telling what you did yesterday.
- 1. Describing People (tall/short, kind/funny, has + features)
- 2. Describing Places (in/on/near, "there is", quantifiers)
- 3. Comparing Things (comparative adjectives)
- 4. The Best of All (superlative adjectives)
- 5. Yesterday I… (past simple regular verbs)
- 6. Past Simple — Irregular Verbs (went / saw / ate / had)
- 7. A Day to Remember (past simple in narration + when/while)
- 8. My Town (combining all A-band into a personal description)

### B-band — Intermediate → Upper-Intermediate (3 courses, 24 lessons)

#### `b-stories` — Stories Worth Telling 📚
Past tenses + narrative skills. Telling stories about travel, school,
family.
- 1. Travel Past (past simple revisited; transport vocab)
- 2. While I Was Walking… (past continuous + interruptions)
- 3. Long Before That (past perfect: "had finished")
- 4. Connectors That Tell a Story (when / while / before / after)
- 5. At the Airport (real-life travel scenario)
- 6. Different Cultures (would for hypotheticals; nationalities deep)
- 7. Stories with a Twist (combining all narrative tenses)
- 8. Tell Me Yours (productive: kid writes a 5-sentence story).

#### `b-ideas` — Ideas & Opinions 💡
Modal verbs, conditionals, expressing views, technology, society.
- 1. What I Think (opinion language: I think / believe / agree)
- 2. Should, Must, Have to (modal verbs of obligation)
- 3. Pros and Cons (advantages/disadvantages, however/although)
- 4. If I Have Time… (1st conditional — real future)
- 5. If I Were You… (2nd conditional — hypothetical)
- 6. Tech Around Us (devices + verbs to interact)
- 7. Internet Safely (modal verbs in safety context)
- 8. My Future (will + going to + might)

#### `b-real-world` — Real-World English 🌐
Formal vs informal, news, present perfect, passive voice, idioms.
- 1. Have You Ever…? (present perfect for experience)
- 2. Just / Already / Yet (present perfect markers)
- 3. News Headlines (present perfect in news)
- 4. Things Get Done (passive voice — present)
- 5. Things That Were Built (passive — past)
- 6. Saying It Politely (formal vs informal register)
- 7. Idioms in Use (everyday idioms with context)
- 8. Real Conversations (combining everything: ordering, asking
  directions, leaving messages).

## Vocabulary block — `vocabulary-set` content type

Separate first-class content, NOT buried inside lessons.

**Schema** (`api::vocabulary-set.vocabulary-set`):
- `slug` (uid, required)
- `title` / `titleUa` / `description`
- `level` (enum A0..C2)
- `topic` (string — "family", "food", "verbs of motion", …)
- `iconEmoji` (max 8 chars)
- `words` (json — array of `{ word, translation, example,
  exampleTranslation, partOfSpeech? }`)
- `course` (relation manyToOne → course, optional — "words for this
  course")

**Routes**:
- GET `/api/vocabulary-sets` — public list (filtered by level / topic).
- GET `/api/vocabulary-sets/:slug` — public single set.

**FE**:
- `/kids/vocab` — listing page; sets grouped by level.
- `/kids/vocab/[slug]` — flashcard player (show word → reveal
  translation → mark "знаю / повторити").
- Course detail page picks up its linked set as "Words for this course".

**Reward integration**: completing a vocab set (every word marked
"знаю" once) fires `awardOnAction({ action:'vocab', sourceKey:
'vocab:<userId>:<slug>', meta: { wordsCount } })` → 5 XP + 5 coins
once per set per kid. New action added to the rewards matrix.

## Migration

- [x] **v1 catalog archived.** All 14 v1 CEFR slugs added to
      `LEGACY_COURSE_SLUGS` so they go to `status='archived'` on next
      seed run.
- [ ] **v2 catalog seeded.** New `lesson-content/cefr-v2/` directory
      with one file per course; orchestrator picks them up via the
      same `COURSE_SEEDS` array.
- [ ] **v2 EXEMPLAR.** First v2 course (`a-foundation`) is FULLY
      written (8 lessons × ~12 steps each) so the next session has a
      template. Other 5 courses are scaffolded with metadata + 1
      sample deep lesson.
- [ ] **Vocabulary CT.** Schema + controller + routes + permissions.
      3 seed sets to validate the pipeline (Family Words, Verbs of
      Motion, Numbers & Time).
- [ ] **FE vocabulary listing.** `/kids/vocab` minimum-viable page
      (read-only, no flashcard player yet).
- [ ] **finish-{level} achievements.** Migrate from per-CEFR-sublevel
      (`finish-a0`..`finish-c2`) to per-band (`finish-a`,
      `finish-b`). Threshold = 24 lessons each.

## Quality bar (v2)

A v2 lesson is "production-ready" when:
1. ≥10 steps with 2 theory blocks (real explanations, not 4-line
   stubs).
2. Theory examples include at least 5 lines of authentic English
   (not lorem).
3. Each MCQ has unambiguously 1 correct option AND a brief
   `explanation` field.
4. `acceptedAnswers` covers ≥5 phrasings for translate steps
   (lowercase, with/without punctuation, common synonyms, contractions).
5. At least one productive step per lesson (translate / word-order)
   so the kid OUTPUTS, not just recognises.
6. Reading step (when present) has ≥3 comprehension Qs.
7. Lesson tells a coherent story — kid leaves knowing one specific
   thing they couldn't do before.

## v1 catalog (archived — for reference only)

> Sections below describe the deprecated 14-course v1 catalog. All v1
> slugs are in `LEGACY_COURSE_SLUGS` and get `status='archived'` on
> next seed run. v2 catalog (above) replaces them.

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
- **2026-04-27** — A2 fully fleshed out. Both A2 courses now have 5
  full lessons (10 total: meals, cooking, food-around-world,
  after-school + frequency adverbs, hobbies + gerunds, weekend plans
  + going-to). `finish-a2` threshold bumped 4 → 10 to match. Both A2
  course subtitles dropped the "долучаємось 2 з 5" phrasing — they're
  no longer shells. Catalog is now: A0 / A1 / A2 fully written
  (40 lessons), B1 / B2 / C1 / C2 still shells (10 sample lessons).
- **2026-04-27** — B1 / B2 / C1 closed out. +7 lessons:
  B1-best-trip (comparatives), B1-different-cultures (would for
  hypotheticals), B1-pros-cons (discourse markers however/although),
  B1-future-job (will vs going-to), B2-volunteering (1st conditional),
  B2-review-movie (-ing/-ed adjectives), C1-convincing-writing
  (firstly/furthermore/therefore). All level-shell subtitles dropped
  the "долучаємось N з M" prefix. `finish-b1=8`, `finish-b2=6`,
  `finish-c1=3` thresholds bumped to match. Catalog is now FULL —
  every CEFR level has its complete lesson count seeded.
