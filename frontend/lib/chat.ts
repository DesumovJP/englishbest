/**
 * Chat loader / mutator — thread + message endpoints.
 *
 * Transport: polling (10s). Backend scopes by participation.
 * Caller's profile.documentId is passed in by the UI (from useSession) to
 * compute `fromMe` / `unread` locally — the server does not de-duplicate reads.
 */

export type ThreadKind = 'student' | 'parent' | 'group';

export interface ThreadParticipant {
  documentId: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface Thread {
  documentId: string;
  title: string;
  kind: ThreadKind;
  lastMessageBody: string | null;
  lastMessageAt: string | null;
  participants: ThreadParticipant[];
  unread: number;
  pinned: boolean;
}

export interface Message {
  documentId: string;
  threadId: string;
  body: string;
  pinned: boolean;
  createdAt: string;
  author: ThreadParticipant | null;
  replyToId: string | null;
  readByMe: boolean;
}

const KINDS = new Set<ThreadKind>(['student', 'parent', 'group']);

function pickKind(v: unknown): ThreadKind {
  return typeof v === 'string' && KINDS.has(v as ThreadKind) ? (v as ThreadKind) : 'student';
}

function mediaUrl(raw: any): string | null {
  if (!raw) return null;
  const url = typeof raw.url === 'string' ? raw.url : null;
  if (!url) return null;
  return url.startsWith('http') ? url : url;
}

function normalizeParticipant(raw: any): ThreadParticipant | null {
  if (!raw?.documentId) return null;
  const display =
    (typeof raw.displayName === 'string' && raw.displayName.trim()) ||
    [raw.firstName, raw.lastName].filter(Boolean).join(' ').trim() ||
    'Користувач';
  return {
    documentId: String(raw.documentId),
    displayName: display,
    avatarUrl: mediaUrl(raw.avatar),
  };
}

function normalizeThread(raw: any, myId: string): Thread | null {
  if (!raw?.documentId || !raw?.title) return null;
  const participants = Array.isArray(raw.participants)
    ? (raw.participants.map(normalizeParticipant).filter(Boolean) as ThreadParticipant[])
    : [];
  return {
    documentId: String(raw.documentId),
    title: String(raw.title),
    kind: pickKind(raw.kind),
    lastMessageBody: typeof raw.lastMessageBody === 'string' ? raw.lastMessageBody : null,
    lastMessageAt: typeof raw.lastMessageAt === 'string' ? raw.lastMessageAt : null,
    participants,
    unread: 0, // computed client-side after fetchMessages; for list view defaults to 0
    pinned: false,
  };
}

function normalizeMessage(raw: any, myId: string): Message | null {
  if (!raw?.documentId || typeof raw.body !== 'string') return null;
  const author = raw.author ? normalizeParticipant(raw.author) : null;
  const readByIds = Array.isArray(raw.readBy)
    ? raw.readBy.map((r: any) => r?.documentId).filter((x: unknown): x is string => typeof x === 'string')
    : [];
  return {
    documentId: String(raw.documentId),
    threadId:
      raw.thread && typeof raw.thread === 'object' && typeof raw.thread.documentId === 'string'
        ? raw.thread.documentId
        : '',
    body: raw.body,
    pinned: Boolean(raw.pinned),
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : '',
    author,
    replyToId:
      raw.replyTo && typeof raw.replyTo === 'object' && typeof raw.replyTo.documentId === 'string'
        ? raw.replyTo.documentId
        : null,
    readByMe: readByIds.includes(myId),
  };
}

const THREAD_LIST_QUERY =
  'fields[0]=title&fields[1]=kind&fields[2]=lastMessageBody&fields[3]=lastMessageAt' +
  '&populate[participants][fields][0]=documentId&populate[participants][fields][1]=firstName&populate[participants][fields][2]=lastName&populate[participants][fields][3]=displayName' +
  '&populate[participants][populate][avatar][fields][0]=url' +
  '&sort=lastMessageAt:desc&pagination[pageSize]=100';

export async function fetchThreads(myId: string): Promise<Thread[]> {
  const res = await fetch(`/api/threads?${THREAD_LIST_QUERY}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchThreads ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const rows: any[] = Array.isArray(json?.data) ? json.data : [];
  return rows.map((r) => normalizeThread(r, myId)).filter((t): t is Thread => t !== null);
}

const MESSAGE_FIELDS =
  'fields[0]=body&fields[1]=pinned&fields[2]=createdAt' +
  '&populate[author][fields][0]=documentId&populate[author][fields][1]=firstName&populate[author][fields][2]=lastName&populate[author][fields][3]=displayName' +
  '&populate[author][populate][avatar][fields][0]=url' +
  '&populate[readBy][fields][0]=documentId' +
  '&populate[replyTo][fields][0]=documentId' +
  '&populate[thread][fields][0]=documentId';

export async function fetchMessages(threadId: string, myId: string): Promise<Message[]> {
  const q =
    `filters[thread][documentId][$eq]=${encodeURIComponent(threadId)}` +
    `&${MESSAGE_FIELDS}&sort=createdAt:asc&pagination[pageSize]=200`;
  const res = await fetch(`/api/messages?${q}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchMessages ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const rows: any[] = Array.isArray(json?.data) ? json.data : [];
  return rows.map((r) => normalizeMessage(r, myId)).filter((m): m is Message => m !== null);
}

export async function sendMessage(
  threadId: string,
  body: string,
  replyToId?: string,
): Promise<void> {
  const payload: Record<string, unknown> = { thread: threadId, body };
  if (replyToId) payload.replyTo = replyToId;
  const res = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: payload }),
  });
  if (!res.ok) throw new Error(`sendMessage ${res.status}`);
}

export async function togglePinMessage(messageId: string, pinned: boolean): Promise<void> {
  const res = await fetch(`/api/messages/${messageId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { pinned } }),
  });
  if (!res.ok) throw new Error(`togglePinMessage ${res.status}`);
}

export async function markMessageRead(messageId: string): Promise<void> {
  // Server stamps caller into readBy regardless of payload shape.
  const res = await fetch(`/api/messages/${messageId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { readBy: [] } }),
  });
  if (!res.ok) throw new Error(`markMessageRead ${res.status}`);
}

export interface CreateThreadInput {
  title: string;
  kind: ThreadKind;
  participantIds: string[]; // caller added server-side
}

export async function createThread(input: CreateThreadInput): Promise<Thread> {
  const res = await fetch('/api/threads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        title: input.title,
        kind: input.kind,
        participants: input.participantIds,
      },
    }),
  });
  if (!res.ok) throw new Error(`createThread ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const n = normalizeThread(json?.data, '');
  if (!n) throw new Error('createThread: malformed response');
  return n;
}

export const THREAD_KIND_LABELS: Record<ThreadKind, string> = {
  student: 'Чат з учнем',
  parent: 'Чат з батьками',
  group: 'Чат групи',
};
