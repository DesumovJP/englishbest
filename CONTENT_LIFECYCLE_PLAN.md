# Content Lifecycle — Library Creation, Editing, Publishing, Moderation

**Created:** 2026-04-28
**Status:** Design + roadmap; no schema migrations executed yet.
**Scope:** lessons, courses, vocabulary sets — the three content types in `/dashboard/library`.
**Why now:** the user asked to "thoroughly think through the entire library content creation/edit/publish system, with special attention to vocabulary because I'm not sure it's well-thought-out". This document is the answer.

**Reading order:** §1 (mission) → §2 (current state matrix) → §4 (vocab deep-dive — read this even if you skip the rest) → §6 (approval workflow design) → §12 (phased rollout) → §13 (open decisions, needs your call).

**Companion documents:**
- `ADMIN_PRODUCTION_PLAN.md` — admin-account roadmap; this doc is a *phase* of that one.
- `PROJECT.md` — canonical change log.

---

## 1. Mission

A production-grade content library has three orthogonal axes:

1. **Authorship** — *who* owns the row. Without this, anyone with STAFF role can wreck anyone's content.
2. **Provenance** — *where* it came from. Platform-curated vs. teacher-original vs. teacher-copy-of-platform vs. template stub. Without this, the library can't show "your work" vs "platform shared".
3. **State** — *where in the lifecycle* it sits. Draft → submitted → approved → published. Without this, there is no moderation, no admin oversight, and no way for a teacher to "propose" content the way the user described.

Lessons today have all three. Courses have one and a half. **Vocabulary has none.** This document closes the gap.

---

## 2. Current state matrix

> Source: live audit of `backend/src/api/{lesson,course,vocabulary-set}/**` and `seeds/03-permissions.ts` on 2026-04-28.

| Axis | Lesson | Course | Vocabulary set |
|---|---|---|---|
| **Schema · `owner` (m2o teacher-profile)** | ✅ | ❌ — has `teacher` (m2o) but no enforcement on create | ❌ |
| **Schema · `source` (enum platform/own/copy/template)** | ✅ | ❌ | ❌ |
| **Schema · `reviewStatus` (enum draft/submitted/approved/rejected)** | ❌ | ❌ | ❌ |
| **Schema · `rejectionReason` (text)** | ❌ | ❌ | ❌ |
| **Schema · `reviewedBy` / `reviewedAt`** | ❌ | ❌ | ❌ |
| **Schema · `draftAndPublish`** | ✅ | ✅ | ✅ |
| **Schema · cover/thumbnail media field** | ✅ (`cover`) | ✅ (`coverImage`, `thumbnail`) | ✅ (`coverImage`) — but no FE upload yet |
| **Controller · scoped `find`/`findOne`** | ✅ — own + platform/template visible to teacher; learners see public sources only | ❌ — default controller; STAFF custom but find passes through stock | ❌ — **default Strapi controller, zero scoping** |
| **Controller · `create` enforces owner** | ✅ — `owner = teacherId` forced; `source ∈ {own, copy}` forced | ❌ — STAFF can create courses with any teacher | ❌ — STAFF can create vocab without ownership |
| **Controller · `update` checks owner** | ✅ — owner-only or admin; `source==='platform'` blocks teacher (but admin bypasses) | ❌ — any STAFF can update any course | ❌ — any STAFF can update any vocab |
| **Controller · `delete` checks owner** | ✅ — owner-only or admin; platform delete blocked for teacher | ❌ — STAFF custom delete, no owner check | ❌ — any STAFF can delete any vocab |
| **Controller · custom `publish`/`unpublish`** | ✅ — owner-only or admin | ✅ — STAFF (added 2026-04-28) | ❌ — relies on default Strapi v5 publish flow, not surfaced in FE |
| **Permissions · admin bypass** | ✅ — `if role === 'admin' return super.X()` | ✅ — `STAFF_ROLES` set includes admin | ❌ — no role-aware logic |
| **FE · ownership/source badge in editor** | ✅ — `LESSON_SOURCE_LABELS` + `«Платформа · тільки для читання»` banner | ❌ | ❌ |
| **FE · "submit for review" button** | ❌ | ❌ | ❌ |
| **FE · admin review queue** | ❌ | ❌ | ❌ |
| **FE · publish/unpublish in editor** | ✅ — toggle in actions slot | ✅ — toggle (added 2026-04-28) | ❌ |

**Verdict.** Lessons are ~80% production-grade and mostly need approval-workflow on top. Courses are ~50% — the controller scoping was patched in this week (publish/unpublish/delete) but ownership is still missing. **Vocab is at zero on the production-grade axis. Any logged-in teacher can edit or delete any vocab set in the database.** That is the user's instinct, and they are right.

---

## 3. Asymmetry — why it happened, what it costs

The library evolved feature-first. Lessons came first and got the heavyweight treatment because they carry the most editorial weight (rich blocks, exercises, video). Courses were added as containers — sections with slug arrays — and the assumption was that admin/Strapi-admin would author them. Vocab was added late as a quick attach mechanism for kids learning, with the working assumption "every teacher trusts every other teacher".

The cost of that assumption today:

1. A teacher experimenting with the picker can attach the wrong vocab set to a lesson, edit it, and unintentionally rewrite a vocab set owned by another teacher.
2. There's no way to *show* a teacher "your vocab sets" vs "platform shared vocab" — the library has scope filters (`У курсі / В уроці / Без прив'язки`) but no ownership filter. Same word "Numbers 1–10" might exist as platform set + 6 teacher-customized variants and nothing distinguishes them.
3. The user's requested workflow ("teachers propose, admin approves") cannot land on top of vocab without first adding the missing schema fields.
4. The kids learning UX renders any vocab set linked to a published lesson — including draft-state sets that haven't been reviewed.

**Conclusion:** vocab needs the lesson-level treatment before any approval workflow can ship.

---

## 4. Vocabulary — deep dive

### 4.1 Schema audit

Today (`backend/src/api/vocabulary-set/content-types/vocabulary-set/schema.json`):

```json
{
  "kind": "collectionType",
  "options": { "draftAndPublish": true },
  "attributes": {
    "slug":        { "type": "uid", "targetField": "title", "required": true },
    "title":       { "type": "string", "required": true },
    "titleUa":     { "type": "string" },
    "description": { "type": "text" },
    "level":       { "type": "enumeration", "enum": ["A0", "A1", "A2", "B1", "B2", "C1", "C2"] },
    "topic":       { "type": "string" },
    "iconEmoji":   { "type": "string", "maxLength": 8 },
    "words":       { "type": "json", "required": true },
    "course":      { "type": "relation", "relation": "manyToOne", "target": "api::course.course",   "inversedBy": "vocabularySets" },
    "lesson":      { "type": "relation", "relation": "manyToOne", "target": "api::lesson.lesson",   "inversedBy": "vocabularySets" },
    "coverImage":  { "type": "media", "multiple": false, "allowedTypes": ["images"] }
  }
}
```

Missing fundamentals (compared to lesson):
- ❌ `owner` (teacher-profile m2o)
- ❌ `source` (enum)
- ❌ `reviewStatus` (enum)
- ❌ `rejectionReason` (text)
- ❌ `reviewedBy` (m2o user-profile)
- ❌ `reviewedAt` (datetime)
- ❌ `originalVocabularySet` (m2o self — for clone tracking, mirroring `lesson.originalLesson`)

### 4.2 Controller audit

```ts
// backend/src/api/vocabulary-set/controllers/vocabulary-set.ts
export default factories.createCoreController('api::vocabulary-set.vocabulary-set' as any);
```

**Three lines.** Default Strapi core controller, zero scoping. Compare to `api::lesson.lesson.controllers.lesson.ts` (~200 LOC of scoped logic).

Specifically missing:
- `find` does not scope by owner / source — a teacher's `fetchAllVocabSets()` returns every vocab set in the DB, including other teachers' drafts.
- `create` does not force `owner = caller`.
- `update` / `delete` do not check ownership — Strapi RBAC stops at the role layer (STAFF), not the row layer.
- No custom `publish` / `unpublish` actions — the editor we built doesn't surface those (just save + delete).
- No `cloneAsCopy` — teachers can't take a platform vocab set and customize a copy.

### 4.3 Permission audit

```ts
{ action: 'api::vocabulary-set.vocabulary-set.find',     roles: PUBLIC_ALL },
{ action: 'api::vocabulary-set.vocabulary-set.findOne',  roles: PUBLIC_ALL },
{ action: 'api::vocabulary-set.vocabulary-set.create',   roles: STAFF },
{ action: 'api::vocabulary-set.vocabulary-set.update',   roles: STAFF },
{ action: 'api::vocabulary-set.vocabulary-set.delete',   roles: STAFF },
```

`PUBLIC_ALL` for read is correct — anonymous learners need to see vocab. But STAFF for write without per-row owner enforcement = the wild-west problem.

### 4.4 Bidirectional `course` ↔ `lesson` link

Vocab can be:
- **Standalone** — `course=null`, `lesson=null`. Visible to everyone, no scope.
- **Course-scoped** — `course=X`, `lesson=null`. Logically: vocab "for this course". Surfaces on course page.
- **Lesson-scoped** — `lesson=Y`, `course=null`. Logically: vocab "for this lesson". Surfaces on lesson detail.
- **Both** — `course=X`, `lesson=Y`. Should imply `lesson.course === course`, but nothing enforces that — teachers can save vocab linked to course A and lesson under course B.
- **Linked to lesson, lesson belongs to course** — covered by `lesson.course`, but the vocab still sets `course=null`. Inconsistent shape.

This dual-link with no consistency rules is the design flaw at the heart of the user's "I'm not sure" feeling.

**Two ways out:**

**Option α (simplify scope) — vocab attaches to *one* parent.** A vocab set is either lesson-scoped (one `lesson` FK, course derives from `lesson.course`) **or** course-wide (one `course` FK, no lesson link) **or** standalone (both null). Add a server-side check in the controller: `if (lesson && course && course !== lesson.course) reject`. Or simpler: drop the `course` FK on vocab sets that have a `lesson` FK and resolve course transitively.

**Option β (explicit scope enum) — replace dual FK with `scope: enum(standalone, course, lesson)` + `parentId: string`.** Cleaner data model, breaking change.

Recommended: **Option α** with a reflexive trigger that nulls `course` whenever `lesson` is set (always derive course from `lesson.course`). Smaller migration, same data model.

### 4.5 FE current behavior

- `VocabularyTab` (`frontend/app/dashboard/library/_components/VocabularyTab.tsx`): scope filter (Усі / У курсі / В уроці / Без прив'язки) + level filter. **No ownership filter.** No source badge. No "draft / submitted / approved" badge.
- `VocabSetEditorPage` (`frontend/app/dashboard/vocabulary/[id]/edit/page.tsx`): editable to anyone STAFF — same problem as the controller. No publish toggle. No "submit for review" button.
- `LessonVocabularySection` (`frontend/components/teacher/LessonVocabularySection.tsx`): the attach-modal used in lesson + course editor. Lets any STAFF pick any set or create new — no ownership boundary.

### 4.6 Words shape (JSON column)

`words: json, required` — populated as `Array<{word, translation, example?, exampleTranslation?, partOfSpeech?}>`. Works fine but:

- No length limit at schema layer; nothing stops a 50,000-word vocab set.
- No de-duplication; same word can appear twice.
- No localization key — only EN→UA pair; if school adds RU students, no path.

Defer the i18n concern; cap word count at ~200 in controller validation.

### 4.7 Vocab gap closure plan (per-axis)

| Axis | Add |
|---|---|
| Authorship | `owner: teacher-profile m2o` |
| Provenance | `source: enum(platform, own, copy, template)` + `originalVocabularySet: self m2o` |
| State | `reviewStatus`, `rejectionReason`, `reviewedBy`, `reviewedAt` |
| Scoping rule | Server-side: if `lesson` set, force `course=null`; standalone-allowed flag |
| Controller | Replace default with scoped controller mirroring lesson's pattern |
| FE library | Add owner filter ("Мої / Платформа / Шаблони / Чернетки"); source + status chip on each card |
| FE editor | Status badge + Submit/Approve/Reject + Publish toggle + Clone button (for platform) |
| Permissions | Add `submit`, `approve`, `reject` actions to matrix |
| Cover image | Wire upload via existing DO Spaces flow (the AvatarUpload pattern) |
| Word validation | Cap at 200 words/set; trim+lowercase normalization; reject duplicates |

This is the "vocab" half of the unified plan in §5.

---

## 5. Proposed unified model

The endgame is that all three content types (lesson, course, vocab) share the same shape on these three axes:

### 5.1 Authorship

Every row has `owner: teacher-profile`. Backend forces it on create. Admin can edit anyone's; teacher can edit own only. Null-owner rows mean "platform-curated" (admin-created, no specific teacher).

### 5.2 Provenance

`source: enum(platform, own, copy, template)`:
- **platform** — admin-curated, shared across the school. Teachers see it read-only; admin can edit.
- **own** — teacher's original creation.
- **copy** — teacher cloned a platform/template item. Has `originalX` back-pointer.
- **template** — admin-published "starter kit" item; same readability as platform but framed as a starting point ("clone me").

Defaults: teacher-created → `own`; admin-created → `platform` (admin can override to `template`); cloned → `copy`.

### 5.3 State (lifecycle)

`reviewStatus: enum(draft, submitted, approved, rejected)`:
- **draft** — being edited, not visible to learners or admin queue.
- **submitted** — owner submitted for review; visible to admin queue.
- **approved** — admin approved. May or may not be `published` (orthogonal axis).
- **rejected** — admin rejected with reason. Owner sees `rejectionReason`, can edit and resubmit (returns to `draft`).

`reviewStatus` is orthogonal to `publishedAt` (Strapi's draft/publish): a row can be `approved` but unpublished (admin queued for release), or `approved` + `published` (live), or `draft` + `published` (legacy data; should not happen for new content).

**Public read filter:** `reviewStatus === 'approved' && publishedAt IS NOT NULL`.

### 5.4 Visibility cube (lesson example, vocab/course identical)

| Caller | Sees rows where … |
|---|---|
| Anonymous / learner | `reviewStatus='approved' AND publishedAt IS NOT NULL` |
| Teacher | `owner = caller OR (reviewStatus='approved' AND publishedAt IS NOT NULL) OR source IN (platform, template)` |
| Admin | All rows |

---

## 6. Approval workflow — design

### 6.1 State machine

```
            ┌────────────┐
            │   (null)   │  ← row created
            └─────┬──────┘
                  │ default reviewStatus
                  ▼
            ┌────────────┐
            │   DRAFT    │  ← teacher edits autosaves
            └─────┬──────┘
                  │ teacher: "Submit for review"     ┌──────────────────┐
                  ├──────────────────────────────────►│ SUBMITTED         │
                  │                                  └────┬──────────────┘
                  │ admin: "Save as approved"             │ admin reviews
                  │ (direct path, skips review)           │
                  ▼                                       ▼
            ┌────────────┐    admin: "Approve"  ┌──────────────────┐
            │  APPROVED  │◄───────────────────  │ APPROVED          │
            └─────┬──────┘                       └──────────────────┘
                  │ admin/owner: "Reopen for edit"     │ admin: "Reject"
                  │ (any non-trivial edit by teacher)  │ (with reason)
                  │                                    ▼
                  ▼                              ┌──────────────────┐
            (back to DRAFT — needs re-approval)  │   REJECTED       │
                                                  └────┬──────────────┘
                                                       │ owner edits
                                                       ▼
                                                  (back to DRAFT)
```

### 6.2 Transitions table

| From → To | Actor | Condition | Side-effects |
|---|---|---|---|
| (null) → DRAFT | any STAFF | row created | autosave, no audit yet |
| DRAFT → SUBMITTED | owner | required fields valid | email/notification to admins (future); audit log |
| DRAFT → APPROVED | admin | direct save | audit log; auto-set `reviewedBy=admin`, `reviewedAt=now` |
| SUBMITTED → APPROVED | admin | — | audit log; same fields |
| SUBMITTED → REJECTED | admin | rejectionReason required | audit log; back to owner with note |
| SUBMITTED → DRAFT | owner | recall before admin acts | audit log |
| REJECTED → DRAFT | owner | first edit | clears rejectionReason; audit log |
| APPROVED → DRAFT | owner OR admin | non-trivial edit by non-admin OR explicit "reopen" | audit log; if non-admin edited → re-review needed |
| any → ARCHIVED | admin | delete | soft-delete sets `deletedAt`; audit log |

### 6.3 What counts as "non-trivial edit" (re-review trigger)

If we tracked every typo as a re-review, admins would drown. Heuristic:

- **Lesson:** any change to `blocks` (steps), or `level`, or `course`/`sectionSlug`. Title/topic/tags don't trigger.
- **Course:** any change to `sections` (units) or attached lessons. Title/level/description don't trigger.
- **Vocab:** any add/remove of a `word` row. Title/level/description don't trigger.

Implementation: hash the relevant subset on the FE, compare on save; backend trusts the FE flag (`reviewSensitive: true`). Optional Phase F refinement.

### 6.4 Admin direct-publish path

Admin sees a different button set in the editor:
- Teacher sees: `Зберегти` (autosave) + `Подати на затвердження` (after meaningful edits).
- Admin sees: `Зберегти` (autosave, sets `reviewStatus='approved'`) + `Опублікувати` (sets `publishedAt`) + `Зняти з публікації` (clears `publishedAt`). No submit/approve buttons — admin owns the workflow shortcut.

The button matrix is owned by the editor's role-aware view-model — single source of truth, swap labels by role.

### 6.5 Notification touchpoints

- Teacher submits → admins notified (email + in-app).
- Admin approves → teacher notified.
- Admin rejects → teacher notified with `rejectionReason` quoted.
- Significant edit on approved by non-admin → admin re-notified.

Defer email integration (no SMTP wired). For MVP, in-app bell + audit log entry — teacher checks bell.

---

## 7. Admin direct-publish path — concrete UX

Two triggers from a fresh admin session:

1. **Admin → Library → Курси → `+ Курс`** → `CreateCourseModal` (existing) → admin gets the new course with `source='platform'` + `owner=null` + `reviewStatus='approved'`. Auto-skipped review. Admin can then edit, attach lessons, publish.

2. **Admin → Library → Уроки → `+ Урок`** → opens lesson editor with `isNew=true`. After autosave: `source='platform'` + `owner=null` (or admin's teacher-profile if they have one) + `reviewStatus='approved'`. Publish in actions slot.

**Implementation:** lesson `create` action gets `if (isAdmin) source = body.source ?? 'platform'`. Same for course/vocab.

**Defaults table:**

| Caller role | Default `source` | Default `reviewStatus` | Default `owner` |
|---|---|---|---|
| Teacher | `own` | `draft` | caller's teacher-profile |
| Admin | `platform` | `approved` | null (or admin's teacher-profile if dual-role) |

Admin can override `source` on create (e.g. create a `template` for teachers to clone).

---

## 8. Schema migration plan

> Migrations land in dedicated chunks: schema → backfill script → controller logic → FE.

### 8.1 Field additions

Add to **lesson, course, vocabulary-set** schemas:

```jsonc
{
  "reviewStatus": {
    "type": "enumeration",
    "enum": ["draft", "submitted", "approved", "rejected"],
    "default": "draft",
    "required": true
  },
  "rejectionReason": { "type": "text" },
  "reviewedBy": {
    "type": "relation",
    "relation": "manyToOne",
    "target": "api::user-profile.user-profile"
  },
  "reviewedAt": { "type": "datetime" }
}
```

Add to **course, vocabulary-set** (lesson already has these):

```jsonc
{
  "owner": {
    "type": "relation",
    "relation": "manyToOne",
    "target": "api::teacher-profile.teacher-profile"
  },
  "source": {
    "type": "enumeration",
    "enum": ["platform", "own", "copy", "template"],
    "default": "own",
    "required": true
  }
}
```

Add to **vocabulary-set** for clone tracking:

```jsonc
{
  "originalVocabularySet": {
    "type": "relation",
    "relation": "manyToOne",
    "target": "api::vocabulary-set.vocabulary-set"
  }
}
```

### 8.2 Backfill script

`backend/scripts/backfill-content-lifecycle.ts` — idempotent. For every existing row:

- `reviewStatus`: set to `'approved'` (everything live today is grandfathered as approved).
- `course.owner`: if `course.teacher` exists → derive its teacher-profile id; else null.
- `course.source`: heuristic — if `slug` matches a seeded slug from `seeds/lesson-content/cefr-v2/*` → `'platform'`, else `'own'`.
- `vocabulary-set.owner`: derive from `vocabulary-set.lesson.owner` if linked, else from `vocabulary-set.course.teacher`, else null.
- `vocabulary-set.source`: heuristic — if seeded → `'platform'`, else `'own'`.

Run order: deploy schema → deploy controller (still permissive) → run backfill → flip controller to enforce → deploy FE.

### 8.3 Migration safety

All field additions are additive (no breaking changes). Strapi v5 auto-migrates the column with the default. Existing rows get the default applied at migration time (not NULL — verified pattern from earlier migrations).

The breaking moment is **flipping vocab controller to enforce ownership**: any teacher's tooling that wrote to vocab they don't own breaks. Mitigation: ship the FE that filters by owner first; let teachers see their own vocab; then flip the BE.

---

## 9. Controller scoping spec

### 9.1 Common helper

`backend/src/lib/content-scope.ts`:

```ts
export interface ContentScopeOpts {
  uid: string;
  ownerField?: string; // 'owner' by default
  sourceField?: string; // 'source' by default
  publicSources?: string[]; // ['platform', 'template'] by default
}

export function buildScopeFilter(role, teacherId, opts: ContentScopeOpts) {
  if (role === 'admin') return null; // no filter, sees all

  const orClauses: any[] = [
    { reviewStatus: { $eq: 'approved' }, publishedAt: { $notNull: true } },
  ];
  if (role === 'teacher' && teacherId) {
    orClauses.push({ [opts.ownerField ?? 'owner']: { documentId: { $eq: teacherId } } });
  }
  orClauses.push({ [opts.sourceField ?? 'source']: { $in: opts.publicSources ?? ['platform', 'template'] } });

  return { $or: orClauses };
}
```

### 9.2 Custom actions per content type

```
POST /api/lessons/:id/submit       → owner
POST /api/lessons/:id/approve      → admin
POST /api/lessons/:id/reject       → admin (body: { reason })

POST /api/courses/:id/submit
POST /api/courses/:id/approve
POST /api/courses/:id/reject

POST /api/vocabulary-sets/:id/submit
POST /api/vocabulary-sets/:id/approve
POST /api/vocabulary-sets/:id/reject
```

Each:
- Validates current state (e.g., can only `approve` if `reviewStatus='submitted'`).
- Sets `reviewedBy`, `reviewedAt`, optionally `rejectionReason`.
- Writes audit-log entry via `writeAudit()` (Phase 2 helper from ADMIN_PRODUCTION_PLAN.md).

### 9.3 Vocab controller specifics

Replace default with scoped controller. Mirror lesson:
- `find` / `findOne` — apply scope filter.
- `create` — force `owner = callerTeacherProfileId`; force `source ∈ {own, copy}` for teacher / `source ∈ {platform, template, own, copy}` for admin.
- `update` — owner-only or admin; `source==='platform'` blocks teacher.
- `delete` — owner-only or admin; platform delete blocked for teacher.
- Custom `clone` — copies a platform/template set into the caller's library as `source='copy'` with `originalVocabularySet` back-pointer.

---

## 10. Frontend UX spec

### 10.1 Library tabs (admin variant)

`/dashboard/library` already has Courses / Lessons / Vocabulary tabs. For admin:
- Add a **"Queue"** sub-filter at hub level: badge count of `reviewStatus='submitted'` items across all three tabs combined.
- Inside each tab: filter chips by status (`Усі / Чернетки / На розгляді / Опубліковано / Відхилено`) and by source (`Усе / Платформа / Власні / Шаблони / Копії`).

### 10.2 Editor — status badge

Top of each editor (lesson, course, vocab):
- Pill: `reviewStatus` colored — `draft=ink-muted`, `submitted=warning`, `approved=success`, `rejected=danger`.
- For rejected: collapsible note with `rejectionReason`.

Reuse `StatusPill` (`components/teacher/ui/StatusPill.tsx`) — already exists, just needs new variants.

### 10.3 Editor — actions slot (role-aware)

Split into two render branches keyed off `(role, reviewStatus, isOwner)`:

**Teacher, owner, draft:** `Зберегти` (autosave) + `Подати на затвердження` (disabled if invalid).
**Teacher, owner, submitted:** read-only mode + `Відкликати` button.
**Teacher, owner, rejected:** edit-allowed; `Зберегти` + `Подати ще раз`.
**Teacher, owner, approved:** edit-allowed; `Зберегти` reopens to draft (teacher acknowledges re-review needed) — or readOnly with explicit "reopen" button. Pick one (see §13 open decisions).
**Teacher, not owner:** read-only; `Копіювати в мою бібліотеку` (vocab/lesson) or no action (course).
**Admin, anything:** edit-allowed; `Зберегти` (auto-approves) + `Опублікувати` / `Зняти з публікації` + `Видалити`.
**Admin, submitted:** above plus `Затвердити` + `Відхилити`.

Encode this in a single `useEditorActions(role, source, status, isOwner)` hook returning `{ actions: ButtonSpec[] }`. Render via `<Button>` from `components/ui/`. **No bespoke buttons.**

### 10.4 Admin review queue page

`/dashboard/admin/review-queue/page.tsx`:
- Tabs at top: `Уроки (N) / Курси (M) / Словник (K)` with badge counts.
- Body: `DataTable` with columns: row preview (avatar + title) | owner | submitted at | level | actions (Open in editor → opens existing editor in admin mode).
- Empty state: `Все затверджено · черга порожня` via `<EmptyState>`.

Reuse: `DashboardPageShell`, `Tabs`, `DataTable`, `Avatar`, `LevelBadge`, `Button`. **No new primitives needed.**

### 10.5 Cards in library

Update `LessonCard` / vocab card / course row:
- Add status pill next to source pill.
- For teacher: show only `Чернетки / На розгляді / Опубліковано` (their own + public).
- For admin: show all states.

---

## 11. Permission matrix updates

Add to `seeds/03-permissions.ts`:

```ts
// Lesson moderation
{ action: 'api::lesson.lesson.submit',  roles: STAFF },
{ action: 'api::lesson.lesson.approve', roles: ADMIN },
{ action: 'api::lesson.lesson.reject',  roles: ADMIN },

// Course moderation
{ action: 'api::course.course.submit',  roles: STAFF },
{ action: 'api::course.course.approve', roles: ADMIN },
{ action: 'api::course.course.reject',  roles: ADMIN },

// Vocab moderation
{ action: 'api::vocabulary-set.vocabulary-set.submit',  roles: STAFF },
{ action: 'api::vocabulary-set.vocabulary-set.approve', roles: ADMIN },
{ action: 'api::vocabulary-set.vocabulary-set.reject',  roles: ADMIN },

// Vocab clone (teachers cloning platform vocab)
{ action: 'api::vocabulary-set.vocabulary-set.clone',   roles: STAFF },
```

Seed is idempotent (skips existing); next deploy adds the missing rows.

---

## 12. Phased rollout

> Phases are independently deployable. Each phase keeps the system in a working state.

### Phase L1 — Schema additions (additive, safe)

- Add `reviewStatus`, `rejectionReason`, `reviewedBy`, `reviewedAt` to lesson, course, vocab schemas.
- Add `owner`, `source` to course + vocab schemas.
- Add `originalVocabularySet` to vocab schema.
- Deploy. Strapi auto-migrates with defaults; existing rows untouched (NULL or default).

### Phase L2 — Backfill

- `backend/scripts/backfill-content-lifecycle.ts` (npm script `backfill-content-lifecycle`).
- Sets `reviewStatus='approved'` on all existing rows.
- Derives `owner` and `source` for course + vocab.
- Run on staging → spot-check → run on prod.

### Phase L3 — Vocab controller scoping

- Replace default vocab controller with scoped one (mirror lesson).
- Add custom `clone` action.
- Deploy.

### Phase L4 — Course controller hardening

- Add owner enforcement on `create` / `update` / `delete`.
- Existing custom controller stays; just adds owner checks.
- Deploy.

### Phase L5 — Approval workflow backend

- Custom actions per content type: `submit`, `approve`, `reject`.
- Audit log integration via Phase 2 helper from ADMIN_PRODUCTION_PLAN.md.
- New permissions in matrix.
- Deploy.

### Phase L6 — Approval workflow FE — editor side

- `useEditorActions(role, source, status, isOwner)` hook.
- Status badges in lesson, course, vocab editors.
- Submit / Approve / Reject buttons wired.
- Deploy.

### Phase L7 — Approval workflow FE — admin queue

- New `/dashboard/admin/review-queue` page.
- Sidebar nav entry under "Платформа" group: `Черга затверджень` (with badge count).
- Deploy.

### Phase L8 — Library filters by status + ownership

- Update library tabs: status filter chips, ownership filter.
- Update card components: show status + source badges consistently.
- Deploy.

### Phase L9 — Vocab cover image upload

- Wire cover image upload via existing DO Spaces flow (reuse the AvatarUpload pattern as `<MediaPickerCard>`).
- Display cover in vocab cards + editor + kids vocab learning view.
- Deploy.

### Phase L10 — Polish

- Word validation in vocab controller (cap 200, dedup, trim).
- Force `course = lesson.course` consistency on vocab.
- Notification bell for status changes (reuses Strapi homework-submission lifecycle pattern).
- Deploy.

### Phase L11 — Email integration (deferred)

- SMTP setup.
- Email on submit (admin) / approve / reject (teacher).
- Defer until SMTP infra is decided.

---

## 13. Open decisions for the user

Before Phase L1 starts, please answer:

1. **Re-review on edit.** When teacher edits an `approved` row, does it always go back to `draft` (re-review required), or only on "significant" edits (heuristic-based)? Recommendation: always — heuristic adds complexity for marginal benefit.

2. **Auto-publish on approve.** When admin clicks `Затвердити`, does the row auto-publish (set `publishedAt`), or does admin always click `Опублікувати` separately? Recommendation: separate click — keeps publishing intentional, supports queued releases.

3. **Vocab standalone.** Keep "no parent" vocab sets, or force every vocab to attach to either a course or a lesson? Standalone makes sense for "general dictionary"; forcing scope makes the data model cleaner. Recommendation: keep standalone but require `level` to be set (so kids vocab pages can filter).

4. **Vocab cover image.** Required or optional? Recommendation: optional, with default emoji-on-tinted-background.

5. **Re-approval direction.** When edit by non-admin reverts an `approved` row, does it go to `draft` (owner re-submits) or `submitted` (skip the recall step)? Recommendation: `draft` — clearer separation between owner-decision and queue-state.

6. **Admin can override `source` on create.** Yes (admin can create `template` for teachers to clone) or no (admin always creates `platform`)? Recommendation: yes — small power, large flexibility.

7. **Vocab clone behavior.** When teacher clones a platform vocab, do words copy verbatim (mutable per-teacher) or stay linked (read-only words, override-only metadata)? Recommendation: copy verbatim — matches lesson clone semantics.

8. **Bulk actions.** Should admin be able to approve/reject N items at once from the queue? Recommendation: ship single-item flow first (Phase L7), bulk in Phase L10.

9. **Word count cap.** Hard cap 200, or just a soft warning? Recommendation: hard 200 in controller, soft warning at 100 in UI.

10. **Notification channel for MVP.** In-app bell only (Phase L7), or both bell + email (defer email to Phase L11)? Recommendation: bell-only for MVP.

---

## 14. Cross-references

- **`ADMIN_PRODUCTION_PLAN.md`** — admin-account roadmap; the moderation workflow is Phase 2.5 inside it.
- **`PROJECT.md` §10** — change log entries.
- **`backend/src/api/lesson/controllers/lesson.ts`** — reference implementation for scoped controllers (mirror this for vocab + course).
- **`backend/src/seeds/03-permissions.ts`** — canonical permission matrix; add new actions here.
- **`frontend/components/ui/`** + **`frontend/components/teacher/ui/`** — component inventory (DataTable, Tabs, Modal, EmptyState, StatusPill, Button — everything we need is already there).
- **`backend/scripts/backfill-lesson-course-relations.ts`** — reference idempotent backfill pattern.
