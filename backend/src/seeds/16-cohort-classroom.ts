/**
 * Seed: cohort classroom data — relationships, groups, sessions, homework,
 * submissions, attendance, progress, achievements.
 *
 * Depends on 15-cohort-accounts having created the user-profiles.
 *
 * Outputs (all idempotent):
 *   - parentalConsentBy links (8 kids → 8 parents).
 *   - 3 teacher groups, one per teacher, members from the cohort plan.
 *   - Past + upcoming sessions per group (with attendees).
 *   - Attendance records for past sessions.
 *   - 3 homeworks per teacher (varying due dates), each with per-student
 *     submission rows manually transitioned to mixed states (submitted /
 *     reviewed / returned / inProgress / notStarted) so the dashboards show
 *     real graded + pending work.
 *   - User-progress rows for kids (mix of completed / inProgress) on
 *     existing seeded lessons. The user-progress lifecycle awards
 *     coins/xp/streak/achievements automatically — so we DON'T re-stamp
 *     totalCoins/totalXp here; account-level totals come from 15-cohort
 *     plus what the lifecycle adds on completion.
 *
 * Skipped silently when the cohort is missing (i.e. SEED_DEMO_ACCOUNTS=1
 * has not been flipped on). Re-running is safe and only creates rows that
 * don't already exist.
 */
import { resolveCohort } from './15-cohort-accounts';

const PROFILE_UID = 'api::user-profile.user-profile';
const TEACHER_UID = 'api::teacher-profile.teacher-profile';
const GROUP_UID = 'api::group.group';
const SESSION_UID = 'api::session.session';
const ATTENDANCE_UID = 'api::attendance-record.attendance-record';
const HOMEWORK_UID = 'api::homework.homework';
const SUBMISSION_UID = 'api::homework-submission.homework-submission';
const LESSON_UID = 'api::lesson.lesson';
const COURSE_UID = 'api::course.course';
const PROGRESS_UID = 'api::user-progress.user-progress';

interface GroupSpec {
  name: string;
  level: 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  teacherTag: string;
  memberTags: string[];
  scheduleRrule: string;
  meetUrl: string;
  avgAttendance: number;
  avgHomework: number;
}

const GROUPS: GroupSpec[] = [
  {
    name: 'Kids A1 · Олена',
    level: 'A1',
    teacherTag: 'teacher-olena',
    memberTags: ['kid-sofia', 'kid-maksym', 'kid-kateryna', 'kid-bohdan'],
    scheduleRrule: 'FREQ=WEEKLY;BYDAY=TU,TH;BYHOUR=17;BYMINUTE=0',
    meetUrl: 'https://meet.englishbest.app/teacher-olena/kids-a1',
    avgAttendance: 0.92,
    avgHomework: 0.84,
  },
  {
    name: 'Pre-Teen Mix · Ірина',
    level: 'A2',
    teacherTag: 'teacher-iryna',
    memberTags: [
      'kid-yelyzaveta',
      'kid-artem',
      'kid-dariia',
      'kid-ihor',
      'adult-nataliia',
    ],
    scheduleRrule: 'FREQ=WEEKLY;BYDAY=MO,WE;BYHOUR=18;BYMINUTE=30',
    meetUrl: 'https://meet.englishbest.app/teacher-iryna/preteen-mix',
    avgAttendance: 0.88,
    avgHomework: 0.74,
  },
  {
    name: 'Adults · Андрій',
    level: 'B1',
    teacherTag: 'teacher-andriy',
    memberTags: ['adult-yulia', 'adult-oleg', 'adult-volodymyr'],
    scheduleRrule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR;BYHOUR=19;BYMINUTE=30',
    meetUrl: 'https://meet.englishbest.app/teacher-andriy/adults',
    avgAttendance: 0.95,
    avgHomework: 0.91,
  },
];

interface SessionSpec {
  groupName: string;
  title: string;
  /** Days from now (negative = past). */
  daysFromNow: number;
  hour: number;
  minute?: number;
  durationMin: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  type: 'group' | 'one-to-one' | 'trial';
  notes?: string;
  /** Per-attendee attendance. Only used when status === 'completed'. */
  attendance?: Record<
    string,
    'present' | 'absent' | 'late' | 'excused'
  >;
  grade?: number;
  /** Optional per-attendee override; defaults to all group members. */
  attendeeTags?: string[];
}

const SESSIONS: SessionSpec[] = [
  // Olena — past
  {
    groupName: 'Kids A1 · Олена',
    title: 'Hello & Goodbye',
    daysFromNow: -14,
    hour: 17,
    durationMin: 40,
    status: 'completed',
    type: 'group',
    notes: 'Greetings, basic intros, Foxie meets the class.',
    grade: 88,
    attendance: {
      'kid-sofia': 'present',
      'kid-maksym': 'present',
      'kid-kateryna': 'present',
      'kid-bohdan': 'late',
    },
  },
  {
    groupName: 'Kids A1 · Олена',
    title: 'My Family',
    daysFromNow: -10,
    hour: 17,
    durationMin: 40,
    status: 'completed',
    type: 'group',
    grade: 84,
    attendance: {
      'kid-sofia': 'present',
      'kid-maksym': 'absent',
      'kid-kateryna': 'present',
      'kid-bohdan': 'present',
    },
  },
  {
    groupName: 'Kids A1 · Олена',
    title: 'Numbers & Colors',
    daysFromNow: -5,
    hour: 17,
    durationMin: 40,
    status: 'completed',
    type: 'group',
    grade: 91,
    attendance: {
      'kid-sofia': 'present',
      'kid-maksym': 'present',
      'kid-kateryna': 'present',
      'kid-bohdan': 'excused',
    },
  },
  // Olena — upcoming
  {
    groupName: 'Kids A1 · Олена',
    title: 'Daily Routines',
    daysFromNow: 2,
    hour: 17,
    durationMin: 40,
    status: 'scheduled',
    type: 'group',
    notes: 'Розповідаємо про свій ранок англійською.',
  },
  {
    groupName: 'Kids A1 · Олена',
    title: 'Food & Drinks',
    daysFromNow: 5,
    hour: 17,
    durationMin: 40,
    status: 'scheduled',
    type: 'group',
  },
  {
    groupName: 'Kids A1 · Олена',
    title: 'Софія · персональне (review)',
    daysFromNow: 3,
    hour: 18,
    minute: 30,
    durationMin: 30,
    status: 'scheduled',
    type: 'one-to-one',
    attendeeTags: ['kid-sofia'],
    notes: 'Підготовка до батьківської зустрічі.',
  },

  // Iryna — past
  {
    groupName: 'Pre-Teen Mix · Ірина',
    title: 'My Hobbies',
    daysFromNow: -12,
    hour: 18,
    minute: 30,
    durationMin: 45,
    status: 'completed',
    type: 'group',
    grade: 80,
    attendance: {
      'kid-yelyzaveta': 'present',
      'kid-artem': 'present',
      'kid-dariia': 'present',
      'kid-ihor': 'late',
      'adult-nataliia': 'present',
    },
  },
  {
    groupName: 'Pre-Teen Mix · Ірина',
    title: 'Travel Vocab Kickoff',
    daysFromNow: -7,
    hour: 18,
    minute: 30,
    durationMin: 45,
    status: 'completed',
    type: 'group',
    grade: 86,
    attendance: {
      'kid-yelyzaveta': 'present',
      'kid-artem': 'absent',
      'kid-dariia': 'present',
      'kid-ihor': 'present',
      'adult-nataliia': 'present',
    },
  },
  {
    groupName: 'Pre-Teen Mix · Ірина',
    title: 'Past Simple recap',
    daysFromNow: -3,
    hour: 18,
    minute: 30,
    durationMin: 45,
    status: 'completed',
    type: 'group',
    grade: 90,
    attendance: {
      'kid-yelyzaveta': 'present',
      'kid-artem': 'present',
      'kid-dariia': 'present',
      'kid-ihor': 'present',
      'adult-nataliia': 'late',
    },
  },
  // Iryna — upcoming
  {
    groupName: 'Pre-Teen Mix · Ірина',
    title: 'Asking for Directions',
    daysFromNow: 1,
    hour: 18,
    minute: 30,
    durationMin: 45,
    status: 'scheduled',
    type: 'group',
  },
  {
    groupName: 'Pre-Teen Mix · Ірина',
    title: 'Movie Discussion (B1 push)',
    daysFromNow: 4,
    hour: 18,
    minute: 30,
    durationMin: 45,
    status: 'scheduled',
    type: 'group',
  },

  // Andriy — past
  {
    groupName: 'Adults · Андрій',
    title: 'IELTS Speaking Part 1',
    daysFromNow: -11,
    hour: 19,
    minute: 30,
    durationMin: 60,
    status: 'completed',
    type: 'group',
    grade: 82,
    attendance: {
      'adult-yulia': 'present',
      'adult-oleg': 'present',
      'adult-volodymyr': 'late',
    },
  },
  {
    groupName: 'Adults · Андрій',
    title: 'Negotiations: opening moves',
    daysFromNow: -6,
    hour: 19,
    minute: 30,
    durationMin: 60,
    status: 'completed',
    type: 'group',
    grade: 88,
    attendance: {
      'adult-yulia': 'absent',
      'adult-oleg': 'present',
      'adult-volodymyr': 'present',
    },
  },
  {
    groupName: 'Adults · Андрій',
    title: 'Email writing clinic',
    daysFromNow: -2,
    hour: 19,
    minute: 30,
    durationMin: 60,
    status: 'completed',
    type: 'group',
    grade: 92,
    attendance: {
      'adult-yulia': 'present',
      'adult-oleg': 'present',
      'adult-volodymyr': 'present',
    },
  },
  // Andriy — upcoming
  {
    groupName: 'Adults · Андрій',
    title: 'IELTS Writing Task 2 deep-dive',
    daysFromNow: 1,
    hour: 19,
    minute: 30,
    durationMin: 60,
    status: 'scheduled',
    type: 'group',
  },
  {
    groupName: 'Adults · Андрій',
    title: 'Yulia · mock interview',
    daysFromNow: 6,
    hour: 20,
    durationMin: 45,
    status: 'scheduled',
    type: 'one-to-one',
    attendeeTags: ['adult-yulia'],
    notes: 'IELTS speaking mock — full set.',
  },
];

interface HomeworkSpec {
  title: string;
  description: string;
  teacherTag: string;
  /** Group name (for display) but assignees taken from explicit list. */
  groupName?: string;
  assigneeTags: string[];
  dueInDays: number;
  /** Optional lesson link by slug. */
  lessonSlug?: string;
  /** Optional course link by slug. */
  courseSlug?: string;
  /**
   * Per-assignee submission state. Defaults to 'notStarted' if missing.
   * 'submitted' = student handed in, awaiting teacher.
   * 'reviewed' = teacher graded, accepted.
   * 'returned' = teacher returned for rework.
   */
  states: Record<
    string,
    {
      status:
        | 'notStarted'
        | 'inProgress'
        | 'submitted'
        | 'reviewed'
        | 'returned'
        | 'overdue';
      score?: number;
      teacherFeedback?: string;
      answers?: Record<string, unknown>;
    }
  >;
}

const HOMEWORKS: HomeworkSpec[] = [
  {
    title: 'Слова уроку Hello & Goodbye',
    description: 'Запиши 8 нових слів і склади з ними діалог на 4 репліки.',
    teacherTag: 'teacher-olena',
    groupName: 'Kids A1 · Олена',
    assigneeTags: ['kid-sofia', 'kid-maksym', 'kid-kateryna', 'kid-bohdan'],
    dueInDays: -2,
    lessonSlug: 'hello-goodbye',
    courseSlug: 'english-kids-starter',
    states: {
      'kid-sofia': {
        status: 'reviewed',
        score: 95,
        teacherFeedback: 'Чудово! Діалог вийшов природним.',
      },
      'kid-maksym': {
        status: 'reviewed',
        score: 80,
        teacherFeedback: 'Добре, звертай увагу на порядок слів.',
      },
      'kid-kateryna': {
        status: 'submitted',
      },
      'kid-bohdan': {
        status: 'returned',
        score: 60,
        teacherFeedback: 'Спробуй ще раз — додай 4 слова з уроку.',
      },
    },
  },
  {
    title: 'Family вокабуляр',
    description: 'Підпиши родичів на сімейному дереві (фото/рисунок).',
    teacherTag: 'teacher-olena',
    groupName: 'Kids A1 · Олена',
    assigneeTags: ['kid-sofia', 'kid-maksym', 'kid-kateryna', 'kid-bohdan'],
    dueInDays: 4,
    lessonSlug: 'my-family',
    courseSlug: 'english-kids-starter',
    states: {
      'kid-sofia': { status: 'inProgress' },
      'kid-maksym': { status: 'notStarted' },
      'kid-kateryna': { status: 'submitted' },
      'kid-bohdan': { status: 'notStarted' },
    },
  },
  {
    title: 'Numbers 1–20: запис голосом',
    description: 'Запиши аудіо як рахуєш від 1 до 20.',
    teacherTag: 'teacher-olena',
    groupName: 'Kids A1 · Олена',
    assigneeTags: ['kid-sofia', 'kid-maksym', 'kid-kateryna'],
    dueInDays: 7,
    lessonSlug: 'numbers-colors',
    courseSlug: 'english-kids-starter',
    states: {
      'kid-sofia': { status: 'notStarted' },
      'kid-maksym': { status: 'notStarted' },
      'kid-kateryna': { status: 'notStarted' },
    },
  },
  {
    title: 'My Hobbies — короткий текст',
    description: 'Напиши 80–120 слів про своє хоббі (5 речень, минулий час).',
    teacherTag: 'teacher-iryna',
    groupName: 'Pre-Teen Mix · Ірина',
    assigneeTags: [
      'kid-yelyzaveta',
      'kid-artem',
      'kid-dariia',
      'kid-ihor',
      'adult-nataliia',
    ],
    dueInDays: -1,
    states: {
      'kid-yelyzaveta': {
        status: 'reviewed',
        score: 92,
        teacherFeedback: 'Дуже добре! Структура чітка.',
      },
      'kid-artem': {
        status: 'overdue',
      },
      'kid-dariia': {
        status: 'submitted',
      },
      'kid-ihor': {
        status: 'reviewed',
        score: 88,
        teacherFeedback: 'Сильна робота для твого рівня.',
      },
      'adult-nataliia': {
        status: 'returned',
        score: 65,
        teacherFeedback:
          'Перепиши, будь ласка, з артиклями a/the — багато пропусків.',
      },
    },
  },
  {
    title: 'Travel role-play prep',
    description: 'Підготуй 6 фраз для діалогу в готелі.',
    teacherTag: 'teacher-iryna',
    groupName: 'Pre-Teen Mix · Ірина',
    assigneeTags: ['kid-yelyzaveta', 'kid-ihor', 'adult-nataliia'],
    dueInDays: 3,
    states: {
      'kid-yelyzaveta': { status: 'inProgress' },
      'kid-ihor': { status: 'notStarted' },
      'adult-nataliia': { status: 'submitted' },
    },
  },
  {
    title: 'IELTS Writing Task 1 — line graph',
    description: 'Опиши графік (150+ слів). Шаблон у бібліотеці уроку.',
    teacherTag: 'teacher-andriy',
    groupName: 'Adults · Андрій',
    assigneeTags: ['adult-yulia', 'adult-oleg', 'adult-volodymyr'],
    dueInDays: -3,
    states: {
      'adult-yulia': {
        status: 'reviewed',
        score: 78,
        teacherFeedback: 'Band 6.5. Працюй над cohesion.',
      },
      'adult-oleg': {
        status: 'reviewed',
        score: 84,
        teacherFeedback: 'Band 7.0 — добре!',
      },
      'adult-volodymyr': {
        status: 'submitted',
      },
    },
  },
  {
    title: 'Email до клієнта (B2)',
    description: 'Напиши формальний лист на 120–150 слів.',
    teacherTag: 'teacher-andriy',
    groupName: 'Adults · Андрій',
    assigneeTags: ['adult-yulia', 'adult-oleg', 'adult-volodymyr'],
    dueInDays: 5,
    states: {
      'adult-yulia': { status: 'notStarted' },
      'adult-oleg': { status: 'inProgress' },
      'adult-volodymyr': { status: 'notStarted' },
    },
  },
];

interface ProgressSpec {
  studentTag: string;
  lessonSlug: string;
  courseSlug: string;
  status: 'completed' | 'inProgress';
  score?: number;
  daysAgo?: number;
}

const PROGRESS: ProgressSpec[] = [
  // Sofia — solid A1 progress
  {
    studentTag: 'kid-sofia',
    lessonSlug: 'hello-goodbye',
    courseSlug: 'english-kids-starter',
    status: 'completed',
    score: 95,
    daysAgo: 12,
  },
  {
    studentTag: 'kid-sofia',
    lessonSlug: 'my-name-is',
    courseSlug: 'english-kids-starter',
    status: 'completed',
    score: 90,
    daysAgo: 9,
  },
  {
    studentTag: 'kid-sofia',
    lessonSlug: 'numbers-colors',
    courseSlug: 'english-kids-starter',
    status: 'inProgress',
    daysAgo: 1,
  },
  // Maksym — slower
  {
    studentTag: 'kid-maksym',
    lessonSlug: 'hello-goodbye',
    courseSlug: 'english-kids-starter',
    status: 'completed',
    score: 80,
    daysAgo: 11,
  },
  {
    studentTag: 'kid-maksym',
    lessonSlug: 'my-name-is',
    courseSlug: 'english-kids-starter',
    status: 'inProgress',
    daysAgo: 4,
  },
  // Kateryna — A2 leader
  {
    studentTag: 'kid-kateryna',
    lessonSlug: 'hello-goodbye',
    courseSlug: 'english-kids-starter',
    status: 'completed',
    score: 100,
    daysAgo: 14,
  },
  {
    studentTag: 'kid-kateryna',
    lessonSlug: 'my-name-is',
    courseSlug: 'english-kids-starter',
    status: 'completed',
    score: 95,
    daysAgo: 12,
  },
  {
    studentTag: 'kid-kateryna',
    lessonSlug: 'numbers-colors',
    courseSlug: 'english-kids-starter',
    status: 'completed',
    score: 92,
    daysAgo: 8,
  },
  {
    studentTag: 'kid-kateryna',
    lessonSlug: 'my-family',
    courseSlug: 'english-kids-starter',
    status: 'completed',
    score: 88,
    daysAgo: 4,
  },
  // Bohdan — beginner
  {
    studentTag: 'kid-bohdan',
    lessonSlug: 'hello-goodbye',
    courseSlug: 'english-kids-starter',
    status: 'inProgress',
    daysAgo: 2,
  },
  // Yelyzaveta
  {
    studentTag: 'kid-yelyzaveta',
    lessonSlug: 'peppa-muddy-puddles',
    courseSlug: 'peppa',
    status: 'completed',
    score: 92,
    daysAgo: 10,
  },
  {
    studentTag: 'kid-yelyzaveta',
    lessonSlug: 'peppa-mr-dinosaur',
    courseSlug: 'peppa',
    status: 'completed',
    score: 95,
    daysAgo: 6,
  },
  // Artem
  {
    studentTag: 'kid-artem',
    lessonSlug: 'peppa-muddy-puddles',
    courseSlug: 'peppa',
    status: 'completed',
    score: 76,
    daysAgo: 8,
  },
  // Dariia
  {
    studentTag: 'kid-dariia',
    lessonSlug: 'hello-goodbye',
    courseSlug: 'english-kids-starter',
    status: 'completed',
    score: 87,
    daysAgo: 7,
  },
  {
    studentTag: 'kid-dariia',
    lessonSlug: 'my-name-is',
    courseSlug: 'english-kids-starter',
    status: 'completed',
    score: 90,
    daysAgo: 3,
  },
  // Ihor
  {
    studentTag: 'kid-ihor',
    lessonSlug: 'oxford1-biff-chip-kipper',
    courseSlug: 'oxford-1',
    status: 'completed',
    score: 96,
    daysAgo: 9,
  },
  {
    studentTag: 'kid-ihor',
    lessonSlug: 'oxford1-the-dragon',
    courseSlug: 'oxford-1',
    status: 'completed',
    score: 92,
    daysAgo: 4,
  },
];

function startAtISO(daysFromNow: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

async function findCourseDocId(strapi: any, slug: string): Promise<string | null> {
  const [c] = await strapi.documents(COURSE_UID).findMany({
    filters: { slug },
    fields: ['documentId'],
    limit: 1,
    status: 'published',
  });
  return c?.documentId ?? null;
}

async function findLessonDocId(strapi: any, slug: string): Promise<string | null> {
  const [l] = await strapi.documents(LESSON_UID).findMany({
    filters: { slug },
    fields: ['documentId'],
    limit: 1,
    status: 'published',
  });
  return l?.documentId ?? null;
}

async function findTeacherProfileDocId(
  strapi: any,
  userProfileDocId: string,
): Promise<string | null> {
  // teacher-profile.user → user-profile (1:1 via .user).
  const [p] = await strapi.documents(TEACHER_UID).findMany({
    filters: { user: { documentId: { $eq: userProfileDocId } } },
    fields: ['documentId'],
    limit: 1,
  });
  return p?.documentId ?? null;
}

async function linkParents(
  strapi: any,
  cohort: Map<string, { profileDocId: string }>,
  links: Array<{ kidTag: string; parentTag: string }>,
): Promise<{ linked: number; skipped: number }> {
  let linked = 0;
  let skipped = 0;
  for (const { kidTag, parentTag } of links) {
    const kid = cohort.get(kidTag);
    const parent = cohort.get(parentTag);
    if (!kid || !parent) {
      skipped += 1;
      continue;
    }
    const current = await strapi.documents(PROFILE_UID).findOne({
      documentId: kid.profileDocId,
      populate: { parentalConsentBy: { fields: ['documentId'] } },
    });
    const currentParent =
      (current as any)?.parentalConsentBy?.documentId ?? null;
    if (currentParent === parent.profileDocId) {
      skipped += 1;
      continue;
    }
    await strapi.documents(PROFILE_UID).update({
      documentId: kid.profileDocId,
      data: { parentalConsentBy: parent.profileDocId },
    });
    linked += 1;
  }
  return { linked, skipped };
}

async function upsertGroup(
  strapi: any,
  spec: GroupSpec,
  teacherProfileDocId: string,
  memberProfileDocIds: string[],
): Promise<string> {
  const [existing] = await strapi.documents(GROUP_UID).findMany({
    filters: { name: spec.name },
    populate: {
      teacher: { fields: ['documentId'] },
      members: { fields: ['documentId'] },
    },
    limit: 1,
  });
  if (existing) {
    const currentMembers: string[] = ((existing as any).members ?? [])
      .map((m: any) => m?.documentId)
      .filter(Boolean);
    const merged = Array.from(new Set([...currentMembers, ...memberProfileDocIds]));
    const teacherMismatch =
      (existing as any).teacher?.documentId !== teacherProfileDocId;
    const membersDiffer =
      merged.length !== currentMembers.length ||
      merged.some((m) => !currentMembers.includes(m));
    if (teacherMismatch || membersDiffer) {
      await strapi.documents(GROUP_UID).update({
        documentId: (existing as any).documentId,
        data: {
          teacher: teacherProfileDocId,
          members: merged,
          level: spec.level,
          scheduleRrule: spec.scheduleRrule,
          meetUrl: spec.meetUrl,
          avgAttendance: spec.avgAttendance,
          avgHomework: spec.avgHomework,
        },
      });
    }
    return (existing as any).documentId;
  }

  const created = await strapi.documents(GROUP_UID).create({
    data: {
      name: spec.name,
      level: spec.level,
      teacher: teacherProfileDocId,
      members: memberProfileDocIds,
      scheduleRrule: spec.scheduleRrule,
      meetUrl: spec.meetUrl,
      avgAttendance: spec.avgAttendance,
      avgHomework: spec.avgHomework,
      activeFrom: new Date().toISOString().slice(0, 10),
    },
  });
  return created.documentId;
}

async function upsertSession(
  strapi: any,
  spec: SessionSpec,
  teacherProfileDocId: string,
  attendeeProfileDocIds: string[],
): Promise<string | null> {
  const startAt = startAtISO(spec.daysFromNow, spec.hour, spec.minute ?? 0);
  const day = startAt.slice(0, 10);
  const dayStart = `${day}T00:00:00.000Z`;
  const dayEnd = new Date(new Date(startAt).getTime() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const [existing] = await strapi.documents(SESSION_UID).findMany({
    filters: {
      title: spec.title,
      startAt: { $gte: dayStart, $lt: `${dayEnd}T00:00:00.000Z` },
    },
    populate: {
      teacher: { fields: ['documentId'] },
      attendees: { fields: ['documentId'] },
    },
    limit: 1,
  });
  if (existing) {
    const currentAttendeeIds: string[] = ((existing as any).attendees ?? [])
      .map((a: any) => a?.documentId)
      .filter(Boolean);
    const mergedAttendees = Array.from(
      new Set([...currentAttendeeIds, ...attendeeProfileDocIds]),
    );
    const teacherMismatch =
      (existing as any).teacher?.documentId !== teacherProfileDocId;
    const attendeesDiffer =
      mergedAttendees.length !== currentAttendeeIds.length;
    const statusDiffers = (existing as any).status !== spec.status;
    if (teacherMismatch || attendeesDiffer || statusDiffers) {
      await strapi.documents(SESSION_UID).update({
        documentId: (existing as any).documentId,
        data: {
          teacher: teacherProfileDocId,
          attendees: mergedAttendees,
          status: spec.status,
          ...(spec.grade != null ? { grade: spec.grade } : {}),
        },
      });
    }
    return (existing as any).documentId;
  }

  const created = await strapi.documents(SESSION_UID).create({
    data: {
      title: spec.title,
      startAt,
      durationMin: spec.durationMin,
      type: spec.type,
      status: spec.status,
      teacher: teacherProfileDocId,
      attendees: attendeeProfileDocIds,
      notes: spec.notes,
      ...(spec.grade != null ? { grade: spec.grade } : {}),
    },
  });
  return created.documentId;
}

async function upsertAttendance(
  strapi: any,
  sessionDocId: string,
  studentProfileDocId: string,
  status: 'present' | 'absent' | 'late' | 'excused',
  recordedByDocId: string,
): Promise<'created' | 'updated' | 'skipped'> {
  const [existing] = await strapi.documents(ATTENDANCE_UID).findMany({
    filters: {
      session: { documentId: { $eq: sessionDocId } },
      student: { documentId: { $eq: studentProfileDocId } },
    },
    fields: ['documentId', 'status'],
    limit: 1,
  });
  if (existing) {
    if ((existing as any).status === status) return 'skipped';
    await strapi.documents(ATTENDANCE_UID).update({
      documentId: (existing as any).documentId,
      data: { status, recordedAt: new Date().toISOString() },
    });
    return 'updated';
  }
  await strapi.documents(ATTENDANCE_UID).create({
    data: {
      session: sessionDocId,
      student: studentProfileDocId,
      status,
      recordedAt: new Date().toISOString(),
      recordedBy: recordedByDocId,
    },
  });
  return 'created';
}

async function upsertHomework(
  strapi: any,
  hw: HomeworkSpec,
  teacherProfileDocId: string,
  assigneeProfileDocIds: string[],
): Promise<string> {
  const [existing] = await strapi.documents(HOMEWORK_UID).findMany({
    filters: { title: hw.title },
    populate: {
      teacher: { fields: ['documentId'] },
      assignees: { fields: ['documentId'] },
    },
    limit: 1,
  });
  if (existing) {
    const currentAssignees: string[] = ((existing as any).assignees ?? [])
      .map((a: any) => a?.documentId)
      .filter(Boolean);
    const merged = Array.from(
      new Set([...currentAssignees, ...assigneeProfileDocIds]),
    );
    if (
      (existing as any).teacher?.documentId !== teacherProfileDocId ||
      merged.length !== currentAssignees.length
    ) {
      await strapi.documents(HOMEWORK_UID).update({
        documentId: (existing as any).documentId,
        data: {
          teacher: teacherProfileDocId,
          assignees: merged,
          status: 'published',
        },
      });
    }
    return (existing as any).documentId;
  }

  const lessonId = hw.lessonSlug
    ? await findLessonDocId(strapi, hw.lessonSlug)
    : null;
  const courseId = hw.courseSlug
    ? await findCourseDocId(strapi, hw.courseSlug)
    : null;
  const dueAt = new Date(
    Date.now() + hw.dueInDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  // Create as draft so the lifecycle's afterUpdate creates submissions
  // when we publish below.
  const draft = await strapi.documents(HOMEWORK_UID).create({
    data: {
      title: hw.title,
      description: hw.description,
      teacher: teacherProfileDocId,
      assignees: assigneeProfileDocIds,
      lesson: lessonId ?? undefined,
      course: courseId ?? undefined,
      dueAt,
      status: 'draft',
    },
  });
  await strapi.documents(HOMEWORK_UID).update({
    documentId: draft.documentId,
    data: { status: 'published' },
  });
  return draft.documentId;
}

async function applySubmissionStates(
  strapi: any,
  homeworkDocId: string,
  hw: HomeworkSpec,
  cohort: Map<string, { profileDocId: string }>,
): Promise<{ updated: number; skipped: number }> {
  let updated = 0;
  let skipped = 0;
  for (const [tag, state] of Object.entries(hw.states)) {
    const student = cohort.get(tag);
    if (!student) {
      skipped += 1;
      continue;
    }
    const [sub] = await strapi.documents(SUBMISSION_UID).findMany({
      filters: {
        homework: { documentId: { $eq: homeworkDocId } },
        student: { documentId: { $eq: student.profileDocId } },
      },
      fields: ['documentId', 'status'],
      limit: 1,
    });
    if (!sub) {
      skipped += 1;
      continue;
    }
    if ((sub as any).status === state.status) {
      // Still re-write feedback/score on idempotent runs so seed updates
      // propagate.
      if (state.score != null || state.teacherFeedback) {
        await strapi.documents(SUBMISSION_UID).update({
          documentId: (sub as any).documentId,
          data: {
            ...(state.score != null ? { score: state.score } : {}),
            ...(state.teacherFeedback
              ? { teacherFeedback: state.teacherFeedback }
              : {}),
            ...(state.answers ? { answers: state.answers } : {}),
          },
        });
      }
      skipped += 1;
      continue;
    }
    const now = new Date().toISOString();
    const data: Record<string, unknown> = { status: state.status };
    if (state.status === 'submitted') {
      data.submittedAt = now;
    }
    if (state.status === 'reviewed' || state.status === 'returned') {
      data.submittedAt = now;
      data.gradedAt = now;
    }
    if (state.score != null) data.score = state.score;
    if (state.teacherFeedback) data.teacherFeedback = state.teacherFeedback;
    if (state.answers) data.answers = state.answers;
    await strapi.documents(SUBMISSION_UID).update({
      documentId: (sub as any).documentId,
      data,
    });
    updated += 1;
  }
  return { updated, skipped };
}

async function upsertProgress(
  strapi: any,
  spec: ProgressSpec,
  cohort: Map<string, { profileDocId: string }>,
): Promise<'created' | 'updated' | 'skipped'> {
  const student = cohort.get(spec.studentTag);
  if (!student) return 'skipped';
  const lessonId = await findLessonDocId(strapi, spec.lessonSlug);
  const courseId = await findCourseDocId(strapi, spec.courseSlug);
  if (!lessonId) return 'skipped';

  const completedAt = new Date(
    Date.now() - (spec.daysAgo ?? 0) * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [existing] = await strapi.documents(PROGRESS_UID).findMany({
    filters: {
      user: { documentId: { $eq: student.profileDocId } },
      lesson: { documentId: { $eq: lessonId } },
    },
    fields: ['documentId', 'status'],
    limit: 1,
  });

  if (existing) {
    if ((existing as any).status === spec.status) return 'skipped';
    await strapi.documents(PROGRESS_UID).update({
      documentId: (existing as any).documentId,
      data: {
        status: spec.status,
        ...(spec.score != null ? { score: spec.score } : {}),
        ...(spec.status === 'completed' ? { completedAt } : {}),
        lastAttemptAt: completedAt,
      },
    });
    return 'updated';
  }

  await strapi.documents(PROGRESS_UID).create({
    data: {
      user: student.profileDocId,
      lesson: lessonId,
      course: courseId ?? undefined,
      status: spec.status,
      ...(spec.score != null ? { score: spec.score } : {}),
      ...(spec.status === 'completed' ? { completedAt } : {}),
      lastAttemptAt: completedAt,
      attempts: 1,
    },
  });
  return 'created';
}

export async function up(strapi: any): Promise<void> {
  const cohort = await resolveCohort(strapi);
  if (cohort.size === 0) {
    strapi.log.info(
      '[seed] cohort-classroom: no cohort accounts present — skipping (set SEED_DEMO_ACCOUNTS=1 first)',
    );
    return;
  }

  // 1. Parental links — kid → parent.
  const parentLinks = [
    { kidTag: 'kid-sofia', parentTag: 'parent-olha' },
    { kidTag: 'kid-maksym', parentTag: 'parent-iryna-l' },
    { kidTag: 'kid-kateryna', parentTag: 'parent-vira' },
    { kidTag: 'kid-bohdan', parentTag: 'parent-roman' },
    { kidTag: 'kid-yelyzaveta', parentTag: 'parent-mykhailo' },
    { kidTag: 'kid-artem', parentTag: 'parent-halyna' },
    { kidTag: 'kid-dariia', parentTag: 'parent-tetiana' },
    { kidTag: 'kid-ihor', parentTag: 'parent-larysa' },
  ];
  const linkRes = await linkParents(strapi, cohort, parentLinks);
  strapi.log.info(
    `[seed] cohort-classroom: parent-links linked=${linkRes.linked}, skipped=${linkRes.skipped}`,
  );

  // 2. Groups (need teacher-profile docId via the user-profile lookup).
  const teacherProfileMap = new Map<string, string>();
  for (const tag of ['teacher-olena', 'teacher-andriy', 'teacher-iryna']) {
    const t = cohort.get(tag);
    if (!t) continue;
    const teacherProfileDocId = await findTeacherProfileDocId(
      strapi,
      t.profileDocId,
    );
    if (teacherProfileDocId) teacherProfileMap.set(tag, teacherProfileDocId);
  }

  const groupByName = new Map<string, string>(); // name → groupDocId
  for (const spec of GROUPS) {
    const teacherProfileDocId = teacherProfileMap.get(spec.teacherTag);
    if (!teacherProfileDocId) continue;
    const memberDocIds = spec.memberTags
      .map((tag) => cohort.get(tag)?.profileDocId)
      .filter((id): id is string => !!id);
    const docId = await upsertGroup(
      strapi,
      spec,
      teacherProfileDocId,
      memberDocIds,
    );
    groupByName.set(spec.name, docId);
  }
  strapi.log.info(`[seed] cohort-classroom: groups upserted=${groupByName.size}`);

  // 3. Sessions + per-session attendance.
  let sessionsCreated = 0;
  let attendanceWrites = 0;
  for (const sess of SESSIONS) {
    const group = GROUPS.find((g) => g.name === sess.groupName);
    if (!group) continue;
    const teacherProfileDocId = teacherProfileMap.get(group.teacherTag);
    if (!teacherProfileDocId) continue;
    const attendeeTags = sess.attendeeTags ?? group.memberTags;
    const attendeeDocIds = attendeeTags
      .map((tag) => cohort.get(tag)?.profileDocId)
      .filter((id): id is string => !!id);
    const sessionDocId = await upsertSession(
      strapi,
      sess,
      teacherProfileDocId,
      attendeeDocIds,
    );
    if (!sessionDocId) continue;
    sessionsCreated += 1;
    if (sess.status === 'completed' && sess.attendance) {
      for (const [tag, status] of Object.entries(sess.attendance)) {
        const studentDocId = cohort.get(tag)?.profileDocId;
        if (!studentDocId) continue;
        const r = await upsertAttendance(
          strapi,
          sessionDocId,
          studentDocId,
          status,
          teacherProfileDocId,
        );
        if (r !== 'skipped') attendanceWrites += 1;
      }
    }
  }
  strapi.log.info(
    `[seed] cohort-classroom: sessions=${sessionsCreated}, attendance writes=${attendanceWrites}`,
  );

  // 4. Homework + submissions in mixed states.
  let hwCount = 0;
  let subUpdates = 0;
  for (const hw of HOMEWORKS) {
    const teacherProfileDocId = teacherProfileMap.get(hw.teacherTag);
    if (!teacherProfileDocId) continue;
    const assigneeDocIds = hw.assigneeTags
      .map((tag) => cohort.get(tag)?.profileDocId)
      .filter((id): id is string => !!id);
    const hwDocId = await upsertHomework(
      strapi,
      hw,
      teacherProfileDocId,
      assigneeDocIds,
    );
    hwCount += 1;
    const r = await applySubmissionStates(strapi, hwDocId, hw, cohort);
    subUpdates += r.updated;
  }
  strapi.log.info(
    `[seed] cohort-classroom: homework=${hwCount}, submission state updates=${subUpdates}`,
  );

  // 5. User-progress (lifecycle awards coins/xp/streak/achievements automatically).
  let progressCreated = 0;
  let progressUpdated = 0;
  for (const p of PROGRESS) {
    const r = await upsertProgress(strapi, p, cohort);
    if (r === 'created') progressCreated += 1;
    else if (r === 'updated') progressUpdated += 1;
  }
  strapi.log.info(
    `[seed] cohort-classroom: progress created=${progressCreated}, updated=${progressUpdated}`,
  );
}
