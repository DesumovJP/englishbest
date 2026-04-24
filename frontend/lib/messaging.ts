/**
 * Messaging loaders / mutators.
 *
 * `broadcastMessage` posts to teacher-only `POST /api/messages/broadcast`.
 * Recipients are resolved server-side (never trust the client).
 */

export type BroadcastAudience = 'all-students' | 'all-parents' | 'group' | 'level';

export interface BroadcastInput {
  audience: BroadcastAudience;
  body: string;
  groupId?: string;
  level?: string;
}

export interface BroadcastResult {
  count: number;
  threadIds: string[];
  messageIds: string[];
}

export async function broadcastMessage(input: BroadcastInput): Promise<BroadcastResult> {
  const res = await fetch('/api/messages/broadcast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    let detail = '';
    try {
      const j = await res.json();
      detail = j?.error?.message ?? '';
    } catch {}
    throw new Error(detail || `broadcastMessage ${res.status}`);
  }
  const json = await res.json().catch(() => ({}));
  const data = json?.data ?? {};
  return {
    count: typeof data.count === 'number' ? data.count : 0,
    threadIds: Array.isArray(data.threadIds) ? data.threadIds : [],
    messageIds: Array.isArray(data.messageIds) ? data.messageIds : [],
  };
}
