/**
 * Seed: cohort chat threads + messages.
 *
 * Chat transport is short-poll (10s) — there is no websocket; the existing
 * thread+message scoped controllers already serve list / send / pin / read.
 * This seed populates real conversations so every dashboard chat tab shows
 * historical context out-of-the-box:
 *
 *   - 1 student-thread per (teacher, student) pair the teacher works with.
 *   - 1 parent-thread per (teacher, parent) pair where the parent has a kid
 *     studying with that teacher.
 *   - 1 group-thread per teacher group (Олена, Ірина, Андрій).
 *
 * Messages: 4–10 per thread, alternating authors, timestamps relative to
 * "now" so `lastMessageAt` ranks recent threads first in the FE list.
 *
 * Idempotent: matches threads by exact title + participant set; reuses
 * existing rows. Messages match by (thread, author, body) — duplicate body
 * with same author is rare enough to be a safe natural key. Re-running
 * appends only new entries.
 */
import { resolveCohort } from './15-cohort-accounts';

const THREAD_UID = 'api::thread.thread';
const MESSAGE_UID = 'api::message.message';

interface ThreadSpec {
  title: string;
  kind: 'student' | 'parent' | 'group';
  participantTags: string[];
  messages: MessageSpec[];
}

interface MessageSpec {
  authorTag: string;
  body: string;
  /** Hours ago from "now". Positive = past. */
  hoursAgo: number;
  pinned?: boolean;
}

const THREADS: ThreadSpec[] = [
  // ── Olena ↔ student threads
  {
    title: 'Олена ↔ Софія',
    kind: 'student',
    participantTags: ['teacher-olena', 'kid-sofia'],
    messages: [
      {
        authorTag: 'teacher-olena',
        body: 'Привіт, Софійко! Як настрій перед завтрашнім уроком?',
        hoursAgo: 26,
      },
      {
        authorTag: 'kid-sofia',
        body: 'Привіт! Готова, повторила вчора слова 🦊',
        hoursAgo: 24,
      },
      {
        authorTag: 'teacher-olena',
        body: 'Молодець! Принеси, будь ласка, картки сім\u2019ї.',
        hoursAgo: 23,
      },
      {
        authorTag: 'kid-sofia',
        body: 'Окей! А пісеньку треба знати?',
        hoursAgo: 22,
      },
      {
        authorTag: 'teacher-olena',
        body: 'Тільки приспів — решту проспіваємо разом.',
        hoursAgo: 21,
      },
      {
        authorTag: 'teacher-olena',
        body: 'І не забудь Foxie 🐾',
        hoursAgo: 4,
        pinned: true,
      },
    ],
  },
  {
    title: 'Олена ↔ Максим',
    kind: 'student',
    participantTags: ['teacher-olena', 'kid-maksym'],
    messages: [
      {
        authorTag: 'teacher-olena',
        body: 'Максиме, ти не доробив hw з Hello & Goodbye. Прислати тобі шаблон?',
        hoursAgo: 30,
      },
      {
        authorTag: 'kid-maksym',
        body: 'Так, будь ласка!',
        hoursAgo: 28,
      },
      {
        authorTag: 'teacher-olena',
        body: 'Тримай: hello-goodbye-template.pdf — заповни і скинь у відповідь.',
        hoursAgo: 27,
      },
      {
        authorTag: 'kid-maksym',
        body: 'Окей, до завтра зроблю!',
        hoursAgo: 8,
      },
    ],
  },
  {
    title: 'Олена ↔ Катерина',
    kind: 'student',
    participantTags: ['teacher-olena', 'kid-kateryna'],
    messages: [
      {
        authorTag: 'teacher-olena',
        body: 'Катю, шикарна робота на уроці Numbers & Colors! 🎨',
        hoursAgo: 90,
      },
      {
        authorTag: 'kid-kateryna',
        body: 'Дякую! Можна перейти на A2-вправи?',
        hoursAgo: 88,
      },
      {
        authorTag: 'teacher-olena',
        body: 'Так, додам у бібліотеку — стартуємо з прикметників.',
        hoursAgo: 87,
      },
      {
        authorTag: 'kid-kateryna',
        body: 'Дуже круто, дякую!',
        hoursAgo: 86,
      },
    ],
  },
  {
    title: 'Олена ↔ Богдан',
    kind: 'student',
    participantTags: ['teacher-olena', 'kid-bohdan'],
    messages: [
      {
        authorTag: 'teacher-olena',
        body: 'Богдане, повертаю д/з на доопрацювання — додай 4 слова з уроку.',
        hoursAgo: 14,
      },
      {
        authorTag: 'kid-bohdan',
        body: 'Зрозумів, спробую завтра 🐉',
        hoursAgo: 12,
      },
    ],
  },

  // ── Olena ↔ parent threads
  {
    title: 'Олена ↔ Ольга (мама Софії)',
    kind: 'parent',
    participantTags: ['teacher-olena', 'parent-olha'],
    messages: [
      {
        authorTag: 'parent-olha',
        body: 'Доброго дня! Як проходять заняття у Софії?',
        hoursAgo: 60,
      },
      {
        authorTag: 'teacher-olena',
        body: 'Доброго дня! Софія справляється чудово, коефіцієнт виконання ДЗ — 95%.',
        hoursAgo: 58,
      },
      {
        authorTag: 'parent-olha',
        body: 'Дякую! Чи варто додати індивідуальне заняття?',
        hoursAgo: 56,
      },
      {
        authorTag: 'teacher-olena',
        body: 'Можемо спробувати раз на 2 тижні. Я додала пробне на середу 18:30.',
        hoursAgo: 55,
      },
      {
        authorTag: 'parent-olha',
        body: 'Чудово, домовились!',
        hoursAgo: 54,
      },
    ],
  },
  {
    title: 'Олена ↔ Роман (тато Богдана)',
    kind: 'parent',
    participantTags: ['teacher-olena', 'parent-roman'],
    messages: [
      {
        authorTag: 'parent-roman',
        body: 'Доброго дня! Богдан стривожений завданням, не знає з чого почати.',
        hoursAgo: 18,
      },
      {
        authorTag: 'teacher-olena',
        body: 'Розумію! Спробуйте просто перерахувати 4 нових слова — без речень.',
        hoursAgo: 16,
      },
      {
        authorTag: 'parent-roman',
        body: 'Дякую, спробуємо саме так.',
        hoursAgo: 15,
      },
    ],
  },

  // ── Olena group chat
  {
    title: 'Kids A1 · Олена (група)',
    kind: 'group',
    participantTags: [
      'teacher-olena',
      'kid-sofia',
      'kid-maksym',
      'kid-kateryna',
      'kid-bohdan',
    ],
    messages: [
      {
        authorTag: 'teacher-olena',
        body: 'Команда, нагадую — у вівторок робимо Daily Routines 🌞',
        hoursAgo: 36,
        pinned: true,
      },
      {
        authorTag: 'kid-sofia',
        body: 'Чекаю!',
        hoursAgo: 35,
      },
      {
        authorTag: 'kid-kateryna',
        body: 'А чи можна показати ранкову руту вдома?',
        hoursAgo: 34,
      },
      {
        authorTag: 'teacher-olena',
        body: 'Так, готуй коротке відео 30 сек — і поговоримо в групі!',
        hoursAgo: 33,
      },
      {
        authorTag: 'kid-maksym',
        body: 'Окей!',
        hoursAgo: 32,
      },
      {
        authorTag: 'kid-bohdan',
        body: 'Я з татом запишу 🐉',
        hoursAgo: 30,
      },
    ],
  },

  // ── Iryna ↔ student threads
  {
    title: 'Ірина ↔ Єлизавета',
    kind: 'student',
    participantTags: ['teacher-iryna', 'kid-yelyzaveta'],
    messages: [
      {
        authorTag: 'teacher-iryna',
        body: 'Лізо, твоє есе на My Hobbies — band 7. Чудова структура!',
        hoursAgo: 20,
      },
      {
        authorTag: 'kid-yelyzaveta',
        body: 'Wow! Дякую 😊',
        hoursAgo: 19,
      },
      {
        authorTag: 'teacher-iryna',
        body: 'Готова до Travel role-play на середу?',
        hoursAgo: 18,
      },
      {
        authorTag: 'kid-yelyzaveta',
        body: 'Так, шість фраз вже є 🐰',
        hoursAgo: 17,
      },
    ],
  },
  {
    title: 'Ірина ↔ Артем',
    kind: 'student',
    participantTags: ['teacher-iryna', 'kid-artem'],
    messages: [
      {
        authorTag: 'teacher-iryna',
        body: 'Артем, твоє д/з My Hobbies прострочене. Можеш надіслати сьогодні?',
        hoursAgo: 22,
      },
      {
        authorTag: 'kid-artem',
        body: 'Вибачте, забув! Сьогодні скину.',
        hoursAgo: 9,
      },
    ],
  },
  {
    title: 'Ірина ↔ Дарія',
    kind: 'student',
    participantTags: ['teacher-iryna', 'kid-dariia'],
    messages: [
      {
        authorTag: 'kid-dariia',
        body: 'Доброго дня! Я завантажила есе.',
        hoursAgo: 16,
      },
      {
        authorTag: 'teacher-iryna',
        body: 'Бачу! Гляну сьогодні ввечері.',
        hoursAgo: 15,
      },
    ],
  },
  {
    title: 'Ірина ↔ Ігор',
    kind: 'student',
    participantTags: ['teacher-iryna', 'kid-ihor'],
    messages: [
      {
        authorTag: 'teacher-iryna',
        body: 'Ігорю, я бачу ти вже 22 дні поспіль — це круто!',
        hoursAgo: 5,
      },
      {
        authorTag: 'kid-ihor',
        body: 'Ціль — 30 днів 🎯',
        hoursAgo: 4,
      },
    ],
  },
  {
    title: 'Ірина ↔ Наталія',
    kind: 'student',
    participantTags: ['teacher-iryna', 'adult-nataliia'],
    messages: [
      {
        authorTag: 'teacher-iryna',
        body: 'Наталіє, ваш текст — повертаю на правки. Артиклі a/the.',
        hoursAgo: 14,
      },
      {
        authorTag: 'adult-nataliia',
        body: 'Зрозуміла, перепишу до неділі.',
        hoursAgo: 13,
      },
      {
        authorTag: 'teacher-iryna',
        body: 'Дякую! Ось коротка пам\u2019ятка з артиклями: ...',
        hoursAgo: 12,
      },
    ],
  },

  // ── Iryna ↔ parent threads
  {
    title: 'Ірина ↔ Михайло (тато Єлизавети)',
    kind: 'parent',
    participantTags: ['teacher-iryna', 'parent-mykhailo'],
    messages: [
      {
        authorTag: 'parent-mykhailo',
        body: 'Доброго дня! Дякую за такий деталізований відгук на есе Лізи.',
        hoursAgo: 17,
      },
      {
        authorTag: 'teacher-iryna',
        body: 'Завжди радо! Ліза — один з найсильніших учнів у групі.',
        hoursAgo: 16,
      },
    ],
  },
  {
    title: 'Ірина ↔ Галина (мама Артема)',
    kind: 'parent',
    participantTags: ['teacher-iryna', 'parent-halyna'],
    messages: [
      {
        authorTag: 'teacher-iryna',
        body: 'Галино, нагадую — Артем має прострочене ДЗ My Hobbies.',
        hoursAgo: 21,
      },
      {
        authorTag: 'parent-halyna',
        body: 'Дякую, передам. У нас були гості, він пропустив.',
        hoursAgo: 20,
      },
      {
        authorTag: 'parent-halyna',
        body: 'Він обіцяв сьогодні зробити.',
        hoursAgo: 11,
      },
    ],
  },

  // ── Iryna group
  {
    title: 'Pre-Teen Mix · Ірина (група)',
    kind: 'group',
    participantTags: [
      'teacher-iryna',
      'kid-yelyzaveta',
      'kid-artem',
      'kid-dariia',
      'kid-ihor',
      'adult-nataliia',
    ],
    messages: [
      {
        authorTag: 'teacher-iryna',
        body: 'Усі, на завтра підготуйте 6 фраз для готельного діалогу.',
        hoursAgo: 25,
        pinned: true,
      },
      {
        authorTag: 'kid-ihor',
        body: 'Готово!',
        hoursAgo: 23,
      },
      {
        authorTag: 'kid-yelyzaveta',
        body: 'Я майже, фінішую ввечері.',
        hoursAgo: 21,
      },
      {
        authorTag: 'adult-nataliia',
        body: 'Дякую за пам\u2019ятку — допомагає!',
        hoursAgo: 12,
      },
    ],
  },

  // ── Andriy ↔ student threads
  {
    title: 'Андрій ↔ Юлія',
    kind: 'student',
    participantTags: ['teacher-andriy', 'adult-yulia'],
    messages: [
      {
        authorTag: 'teacher-andriy',
        body: 'Yuliia, your Task 1 — band 6.5. Working on cohesion next.',
        hoursAgo: 70,
      },
      {
        authorTag: 'adult-yulia',
        body: 'Got it. Mock interview готова на наступному тижні?',
        hoursAgo: 68,
      },
      {
        authorTag: 'teacher-andriy',
        body: 'Yes — Tuesday 8 PM, full IELTS speaking.',
        hoursAgo: 67,
      },
      {
        authorTag: 'adult-yulia',
        body: 'Confirmed!',
        hoursAgo: 66,
      },
    ],
  },
  {
    title: 'Андрій ↔ Олег',
    kind: 'student',
    participantTags: ['teacher-andriy', 'adult-oleg'],
    messages: [
      {
        authorTag: 'adult-oleg',
        body: 'Andriy, чи можете перекинути темплейт по emails B2?',
        hoursAgo: 30,
      },
      {
        authorTag: 'teacher-andriy',
        body: 'Звичайно, тримай — formal-email-template.docx у бібліотеці.',
        hoursAgo: 29,
      },
      {
        authorTag: 'adult-oleg',
        body: 'Дяк!',
        hoursAgo: 28,
      },
    ],
  },
  {
    title: 'Андрій ↔ Володимир',
    kind: 'student',
    participantTags: ['teacher-andriy', 'adult-volodymyr'],
    messages: [
      {
        authorTag: 'teacher-andriy',
        body: 'Vlad, чудова робота на email writing clinic. 92!',
        hoursAgo: 48,
      },
      {
        authorTag: 'adult-volodymyr',
        body: 'Thanks! Готовий до C1?',
        hoursAgo: 47,
      },
      {
        authorTag: 'teacher-andriy',
        body: 'Майже — додамо ще 2 теми presentation skills і стартуємо.',
        hoursAgo: 46,
      },
    ],
  },

  // ── Andriy group
  {
    title: 'Adults · Андрій (група)',
    kind: 'group',
    participantTags: [
      'teacher-andriy',
      'adult-yulia',
      'adult-oleg',
      'adult-volodymyr',
    ],
    messages: [
      {
        authorTag: 'teacher-andriy',
        body: 'Sharing the Task 2 deep-dive deck for Monday: link inside.',
        hoursAgo: 40,
        pinned: true,
      },
      {
        authorTag: 'adult-yulia',
        body: 'Thanks!',
        hoursAgo: 39,
      },
      {
        authorTag: 'adult-oleg',
        body: 'Будемо! І я підготую кілька зразків.',
        hoursAgo: 38,
      },
      {
        authorTag: 'adult-volodymyr',
        body: 'See you all on Monday.',
        hoursAgo: 37,
      },
    ],
  },
];

function isoMinusHours(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

async function upsertThread(
  strapi: any,
  spec: ThreadSpec,
  participantDocIds: string[],
): Promise<string> {
  const [existing] = await strapi.documents(THREAD_UID).findMany({
    filters: { title: spec.title },
    populate: { participants: { fields: ['documentId'] } },
    limit: 1,
  });
  if (existing) {
    const currentIds: string[] = ((existing as any).participants ?? [])
      .map((p: any) => p?.documentId)
      .filter(Boolean);
    const merged = Array.from(new Set([...currentIds, ...participantDocIds]));
    if (merged.length !== currentIds.length) {
      await strapi.documents(THREAD_UID).update({
        documentId: (existing as any).documentId,
        data: { participants: merged, kind: spec.kind },
      });
    }
    return (existing as any).documentId;
  }
  const created = await strapi.documents(THREAD_UID).create({
    data: {
      title: spec.title,
      kind: spec.kind,
      participants: participantDocIds,
    },
  });
  return created.documentId;
}

async function appendMessages(
  strapi: any,
  threadDocId: string,
  spec: ThreadSpec,
  cohort: Map<string, { profileDocId: string }>,
): Promise<{ created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;
  let lastBody = '';
  let lastIso = '';
  for (const m of spec.messages) {
    const author = cohort.get(m.authorTag);
    if (!author) {
      skipped += 1;
      continue;
    }
    const [existing] = await strapi.documents(MESSAGE_UID).findMany({
      filters: {
        thread: { documentId: { $eq: threadDocId } },
        author: { documentId: { $eq: author.profileDocId } },
        body: { $eq: m.body },
      },
      fields: ['documentId'],
      limit: 1,
    });
    if (existing) {
      lastBody = m.body;
      lastIso = isoMinusHours(m.hoursAgo);
      skipped += 1;
      continue;
    }
    const createdAt = isoMinusHours(m.hoursAgo);
    await strapi.documents(MESSAGE_UID).create({
      data: {
        thread: threadDocId,
        author: author.profileDocId,
        body: m.body,
        pinned: !!m.pinned,
        // Strapi v5 lets us seed createdAt explicitly via `data` for backfill.
        createdAt,
      },
    });
    lastBody = m.body;
    lastIso = createdAt;
    created += 1;
  }
  // Denorm last-message on thread so the FE list view orders by lastMessageAt.
  if (lastBody && lastIso) {
    await strapi.documents(THREAD_UID).update({
      documentId: threadDocId,
      data: { lastMessageBody: lastBody, lastMessageAt: lastIso },
    });
  }
  return { created, skipped };
}

export async function up(strapi: any): Promise<void> {
  const cohort = await resolveCohort(strapi);
  if (cohort.size === 0) {
    strapi.log.info(
      '[seed] cohort-chat: no cohort accounts present — skipping (set SEED_DEMO_ACCOUNTS=1 first)',
    );
    return;
  }

  let threadCount = 0;
  let createdTotal = 0;
  let skippedTotal = 0;

  for (const spec of THREADS) {
    const participantDocIds = spec.participantTags
      .map((tag) => cohort.get(tag)?.profileDocId)
      .filter((id): id is string => !!id);
    if (participantDocIds.length < 2) continue;
    const threadDocId = await upsertThread(strapi, spec, participantDocIds);
    threadCount += 1;
    const r = await appendMessages(strapi, threadDocId, spec, cohort);
    createdTotal += r.created;
    skippedTotal += r.skipped;
  }

  strapi.log.info(
    `[seed] cohort-chat: threads=${threadCount}, messages created=${createdTotal}, skipped=${skippedTotal}`,
  );
}
