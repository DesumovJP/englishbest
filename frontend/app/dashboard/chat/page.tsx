'use client';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  fetchMessages,
  fetchThreads,
  markMessageRead,
  sendMessage,
  togglePinMessage,
  THREAD_KIND_LABELS,
  type Message,
  type Thread,
  type ThreadKind,
} from '@/lib/chat';
import { useSession } from '@/lib/session-context';
import { SearchInput, SegmentedControl, type SegmentedControlOption } from '@/components/teacher/ui';
import { MassMessageModal } from '@/components/teacher/MassMessageModal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

type TabFilter = 'all' | ThreadKind;

const TAB_OPTIONS: ReadonlyArray<SegmentedControlOption<TabFilter>> = [
  { value: 'all',     label: 'Усі' },
  { value: 'student', label: 'Учні' },
  { value: 'parent',  label: 'Батьки' },
  { value: 'group',   label: 'Групи' },
];

const QUICK_EMOJI = ['👍', '🙏', '✅', '🔥', '🎉', '❤️', '🤝', '📌'];
const POLL_MS = 10_000;

function IconBtn({ onClick, label, children, active = false }: { onClick: () => void; label: string; children: React.ReactNode; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${active ? 'border-primary text-ink bg-surface-muted' : 'border-border text-ink-muted hover:text-ink hover:bg-surface-muted/60'}`}
    >
      {children}
    </button>
  );
}

function PinIcon({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6l1 5 3 2v3H5v-3l3-2 1-5z" /><path d="M12 13v8" />
    </svg>
  );
}

function threadAvatar(thread: Thread, myId: string) {
  const other = thread.participants.find((p) => p.documentId !== myId) ?? thread.participants[0];
  return <Avatar name={other?.displayName ?? thread.title} src={other?.avatarUrl ?? null} size="md" />;
}

function formatListTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  const diffDays = Math.round((now.getTime() - d.getTime()) / 86_400_000);
  if (diffDays < 7) return ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][d.getDay()];
  return d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
}

function formatMsgTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
}

interface BubbleProps {
  msg: Message;
  isOwn: boolean;
  onReply: (m: Message) => void;
  onPin: (m: Message) => void;
  replyToSnippet: { author: string; body: string } | null;
}

function Bubble({ msg, isOwn, onReply, onPin, replyToSnippet }: BubbleProps) {
  return (
    <div className={`group flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className="max-w-[80%] flex flex-col gap-1">
        {msg.author && !isOwn && (
          <p className="text-[11px] font-semibold text-ink-muted ml-3">{msg.author.displayName}</p>
        )}
        <div className={`relative px-3.5 py-2 rounded-2xl text-[13px] leading-relaxed ${
          isOwn
            ? 'bg-primary text-white rounded-br-sm'
            : 'bg-surface-raised border border-border text-ink rounded-bl-sm'
        }`}>
          {replyToSnippet && (
            <div className={`mb-1.5 px-2 py-1 rounded-md text-[11px] border-l-2 ${
              isOwn ? 'border-white/50 bg-surface-raised/10 text-white/80' : 'border-primary/40 bg-surface-muted text-ink-muted'
            }`}>
              <p className="font-semibold">{replyToSnippet.author}</p>
              <p className="truncate">{replyToSnippet.body}</p>
            </div>
          )}
          {msg.pinned && (
            <p className={`flex items-center gap-1 text-[10px] font-semibold mb-1 ${isOwn ? 'text-white/80' : 'text-ink-muted'}`}>
              <PinIcon />
              Закріплено
            </p>
          )}
          <p className="whitespace-pre-wrap">{msg.body}</p>
          <div className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 tabular-nums ${isOwn ? 'text-white/70' : 'text-ink-faint'}`}>
            <span>{formatMsgTime(msg.createdAt)}</span>
          </div>
        </div>
        <div className={`flex gap-1 ${isOwn ? 'justify-end' : 'justify-start'} opacity-0 group-hover:opacity-100 transition-opacity`}>
          <button
            type="button"
            onClick={() => onReply(msg)}
            className="text-[10px] px-1.5 py-0.5 rounded-md bg-surface-raised border border-border text-ink-muted hover:text-ink"
          >
            Відповісти
          </button>
          {isOwn && (
            <button
              type="button"
              onClick={() => onPin(msg)}
              className="text-[10px] px-1.5 py-0.5 rounded-md bg-surface-raised border border-border text-ink-muted hover:text-ink"
            >
              {msg.pinned ? 'Відкріпити' : 'Закріпити'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatPageInner() {
  const { session, status } = useSession();
  const myId = session?.profile.documentId ?? '';
  const searchParams = useSearchParams();
  const initialTab = ((): TabFilter => {
    const t = searchParams.get('tab');
    return t === 'student' || t === 'parent' || t === 'group' ? t : 'all';
  })();
  const initialQuery = searchParams.get('q') ?? '';

  const [tab, setTab] = useState<TabFilter>(initialTab);
  const [query, setQuery] = useState(initialQuery);
  const [activeId, setActiveId] = useState<string>('');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messagesByThread, setMessagesByThread] = useState<Record<string, Message[]>>({});
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState('');
  const [threadSearch, setThreadSearch] = useState('');
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showThreadSearch, setShowThreadSearch] = useState(false);
  const [massOpen, setMassOpen] = useState(false);
  const [mobilePane, setMobilePane] = useState<'list' | 'thread'>('list');

  const endRef = useRef<HTMLDivElement>(null);

  const loadThreads = useCallback(
    async (silent = false) => {
      if (!myId) return;
      if (!silent) setLoadingThreads(true);
      try {
        const rows = await fetchThreads(myId);
        setThreads(rows);
        setError(null);
        if (!activeId && rows.length > 0) {
          const q = initialQuery.trim().toLowerCase();
          const matched = q
            ? rows.find(
                (t) =>
                  (initialTab === 'all' || t.kind === initialTab) &&
                  t.title.toLowerCase().includes(q),
              )
            : undefined;
          setActiveId((matched ?? rows[0]).documentId);
        }
      } catch (e) {
        if (!silent) setError(e instanceof Error ? e.message : 'failed');
      } finally {
        if (!silent) setLoadingThreads(false);
      }
    },
    [myId, activeId, initialQuery, initialTab],
  );

  const loadMessages = useCallback(
    async (threadId: string, silent = false) => {
      if (!myId || !threadId) return;
      if (!silent) setLoadingMessages(true);
      try {
        const rows = await fetchMessages(threadId, myId);
        setMessagesByThread((prev) => ({ ...prev, [threadId]: rows }));
      } catch {
        // ignore poll errors — stale data stays visible
      } finally {
        if (!silent) setLoadingMessages(false);
      }
    },
    [myId],
  );

  useEffect(() => {
    if (status !== 'authenticated' || !myId) return;
    void loadThreads();
  }, [status, myId, loadThreads]);

  useEffect(() => {
    if (!activeId) return;
    void loadMessages(activeId);
  }, [activeId, loadMessages]);

  useEffect(() => {
    if (status !== 'authenticated' || !myId) return;
    const t = window.setInterval(() => {
      void loadThreads(true);
      if (activeId) void loadMessages(activeId, true);
    }, POLL_MS);
    return () => window.clearInterval(t);
  }, [status, myId, activeId, loadThreads, loadMessages]);

  const filteredThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return threads
      .filter((t) => tab === 'all' || t.kind === tab)
      .filter((t) => q === '' || t.title.toLowerCase().includes(q));
  }, [threads, tab, query]);

  const active = useMemo(() => threads.find((t) => t.documentId === activeId), [threads, activeId]);
  const activeMessages = useMemo(() => messagesByThread[activeId] ?? [], [messagesByThread, activeId]);

  const messageIndex = useMemo(() => {
    const map = new Map<string, Message>();
    for (const m of activeMessages) map.set(m.documentId, m);
    return map;
  }, [activeMessages]);

  const visibleMessages = useMemo(() => {
    if (!showThreadSearch || threadSearch.trim() === '') return activeMessages;
    const q = threadSearch.toLowerCase();
    return activeMessages.filter((m) => m.body.toLowerCase().includes(q));
  }, [activeMessages, threadSearch, showThreadSearch]);

  const pinned = useMemo(() => activeMessages.filter((m) => m.pinned), [activeMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, activeId]);

  // Mark unread others' messages as read when viewing.
  useEffect(() => {
    if (!myId || !activeId) return;
    const unread = activeMessages.filter((m) => !m.readByMe && m.author?.documentId !== myId);
    if (unread.length === 0) return;
    (async () => {
      for (const m of unread) {
        try {
          await markMessageRead(m.documentId);
        } catch {
          // ignore
        }
      }
      setMessagesByThread((prev) => ({
        ...prev,
        [activeId]: (prev[activeId] ?? []).map((m) =>
          unread.find((u) => u.documentId === m.documentId) ? { ...m, readByMe: true } : m,
        ),
      }));
    })();
  }, [activeId, activeMessages, myId]);

  function pickThread(id: string) {
    setActiveId(id);
    setMobilePane('thread');
    setReplyTarget(null);
    setShowThreadSearch(false);
  }

  async function handleSend(body?: string) {
    const text = (body ?? draft).trim();
    if (text === '' || !activeId) return;
    const temp: Message = {
      documentId: `temp-${Date.now()}`,
      threadId: activeId,
      body: text,
      pinned: false,
      createdAt: new Date().toISOString(),
      author: session
        ? { documentId: myId, displayName: session.profile.displayName ?? session.profile.firstName, avatarUrl: null }
        : null,
      replyToId: replyTarget?.documentId ?? null,
      readByMe: true,
    };
    setMessagesByThread((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] ?? []), temp],
    }));
    setDraft('');
    setReplyTarget(null);
    setShowEmoji(false);
    try {
      await sendMessage(activeId, text, replyTarget?.documentId);
      await loadMessages(activeId, true);
      await loadThreads(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не вдалося надіслати');
      setMessagesByThread((prev) => ({
        ...prev,
        [activeId]: (prev[activeId] ?? []).filter((m) => m.documentId !== temp.documentId),
      }));
    }
  }

  async function togglePin(msg: Message) {
    setMessagesByThread((prev) => ({
      ...prev,
      [activeId]: (prev[activeId] ?? []).map((m) =>
        m.documentId === msg.documentId ? { ...m, pinned: !m.pinned } : m,
      ),
    }));
    try {
      await togglePinMessage(msg.documentId, !msg.pinned);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не вдалося оновити');
      // revert
      setMessagesByThread((prev) => ({
        ...prev,
        [activeId]: (prev[activeId] ?? []).map((m) =>
          m.documentId === msg.documentId ? { ...m, pinned: msg.pinned } : m,
        ),
      }));
    }
  }

  if (status === 'loading') {
    return <p className="p-4 text-[13px] text-ink-muted">Завантаження сесії…</p>;
  }
  if (status !== 'authenticated') {
    return <p className="p-4 text-[13px] text-danger-dark">Потрібно увійти, щоб користуватися чатом.</p>;
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-6rem)] md:h-[calc(100dvh-4rem)] rounded-xl overflow-hidden border border-border bg-surface-raised">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border flex-shrink-0">
        <h1 className="text-[17px] font-semibold text-ink">Чат</h1>
        <Button size="sm" onClick={() => setMassOpen(true)}>Написати всім</Button>
      </div>

      {error && (
        <div className="px-4 py-2 bg-danger/10 border-b border-border text-[12px] text-danger-dark flex-shrink-0">
          {error}
          <button type="button" onClick={() => setError(null)} className="ml-2 underline">закрити</button>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        <aside className={`${mobilePane === 'list' ? 'flex' : 'hidden'} md:flex w-full md:w-72 lg:w-80 flex-shrink-0 border-r border-border bg-surface-raised flex-col`}>
          <div className="px-3 py-3 border-b border-border flex flex-col gap-2.5">
            <SegmentedControl value={tab} onChange={setTab} options={TAB_OPTIONS} label="Тип чату" />
            <SearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Пошук чату…"
              containerClassName="w-full"
            />
          </div>

          <ul className="flex-1 overflow-y-auto">
            {loadingThreads ? (
              <li className="px-4 py-10 text-center text-[12px] text-ink-muted">Завантаження…</li>
            ) : filteredThreads.length === 0 ? (
              <li className="px-4 py-10 text-center text-[12px] text-ink-muted">
                {threads.length === 0 ? 'Поки що немає чатів' : 'Нічого не знайдено'}
              </li>
            ) : (
              filteredThreads.map((t) => {
                const isActive = t.documentId === activeId;
                return (
                  <li key={t.documentId} className="border-t border-border first:border-t-0">
                    <button
                      type="button"
                      onClick={() => pickThread(t.documentId)}
                      className={`w-full flex items-start gap-3 px-3 py-3 text-left transition-colors ${
                        isActive ? 'bg-surface-muted' : 'hover:bg-surface-muted/60'
                      }`}
                    >
                      {threadAvatar(t, myId)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className="text-[13px] font-semibold text-ink truncate">{t.title}</p>
                          <span className="text-[10px] text-ink-faint tabular-nums flex-shrink-0">
                            {formatListTime(t.lastMessageAt)}
                          </span>
                        </div>
                        <p className="text-[12px] text-ink-muted truncate">{t.lastMessageBody ?? '—'}</p>
                      </div>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </aside>

        <section className={`${mobilePane === 'thread' ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-w-0 bg-surface-muted/40`}>
          {active ? (
            <>
              <header className="flex items-center gap-3 px-4 py-2.5 bg-surface-raised border-b border-border flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setMobilePane('list')}
                  className="md:hidden w-9 h-9 rounded-lg border border-border flex items-center justify-center text-ink-muted"
                  aria-label="Назад"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                {threadAvatar(active, myId)}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-ink truncate">{active.title}</p>
                  <p className="text-[11px] text-ink-muted">{THREAD_KIND_LABELS[active.kind]}</p>
                </div>
                <IconBtn onClick={() => { setShowThreadSearch((v) => !v); setThreadSearch(''); }} label="Пошук у чаті" active={showThreadSearch}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
                </IconBtn>
              </header>

              {showThreadSearch && (
                <div className="px-4 py-2 bg-surface-raised border-b border-border flex-shrink-0">
                  <SearchInput
                    value={threadSearch}
                    onChange={(e) => setThreadSearch(e.target.value)}
                    placeholder="Пошук у чаті…"
                    containerClassName="w-full"
                    autoFocus
                  />
                </div>
              )}

              {pinned.length > 0 && (
                <div className="px-4 py-2 bg-surface-raised border-b border-border flex items-center gap-2 flex-shrink-0">
                  <PinIcon className="w-3 h-3 text-ink-muted" />
                  <p className="text-[11px] text-ink-muted truncate">
                    <span className="font-semibold text-ink">Закріплено:</span> {pinned[0].body}
                  </p>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-4 py-4">
                {loadingMessages && activeMessages.length === 0 ? (
                  <p className="text-center text-[12px] text-ink-muted">Завантаження…</p>
                ) : visibleMessages.length === 0 ? (
                  <p className="text-center text-[12px] text-ink-muted">Ще немає повідомлень</p>
                ) : (
                  visibleMessages.map((m) => {
                    const isOwn = m.author?.documentId === myId;
                    const replyTo = m.replyToId ? messageIndex.get(m.replyToId) : null;
                    return (
                      <Bubble
                        key={m.documentId}
                        msg={m}
                        isOwn={isOwn}
                        onReply={setReplyTarget}
                        onPin={togglePin}
                        replyToSnippet={
                          replyTo
                            ? { author: replyTo.author?.displayName ?? 'Користувач', body: replyTo.body }
                            : null
                        }
                      />
                    );
                  })
                )}
                <div ref={endRef} />
              </div>

              {replyTarget && (
                <div className="px-4 py-2 bg-surface-raised border-t border-border flex items-center gap-3 flex-shrink-0">
                  <div className="w-0.5 self-stretch bg-primary rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-ink uppercase tracking-wider">Відповідь</p>
                    <p className="text-[12px] text-ink-muted truncate">{replyTarget.body}</p>
                  </div>
                  <button type="button" onClick={() => setReplyTarget(null)} aria-label="Скасувати" className="w-7 h-7 rounded-md text-ink-muted hover:text-ink hover:bg-surface-muted flex items-center justify-center">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d="M6 6l12 12M18 6l-12 12" /></svg>
                  </button>
                </div>
              )}

              {showEmoji && (
                <div className="px-4 py-2 bg-surface-raised border-t border-border flex flex-wrap gap-1 flex-shrink-0">
                  {QUICK_EMOJI.map((e) => (
                    <button
                      type="button"
                      key={e}
                      onClick={() => setDraft((d) => d + e)}
                      className="w-9 h-9 text-lg rounded-md hover:bg-surface-muted transition-colors"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}

              <div className="px-3 py-2.5 bg-surface-raised border-t border-border flex items-end gap-2 flex-shrink-0">
                <IconBtn onClick={() => window.alert('Прикріплення — у розробці')} label="Прикріпити файл">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12l-8 8a5 5 0 01-7-7l9-9a3.5 3.5 0 015 5l-9 9a2 2 0 01-3-3l8-8" /></svg>
                </IconBtn>
                <IconBtn onClick={() => setShowEmoji((v) => !v)} label="Емодзі" active={showEmoji}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M8 14c1 1.5 2.5 2 4 2s3-.5 4-2" /><circle cx="9" cy="10" r=".6" /><circle cx="15" cy="10" r=".6" /></svg>
                </IconBtn>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder="Напишіть повідомлення…"
                  rows={1}
                  className="flex-1 resize-none px-3 py-2 rounded-lg border border-border text-[13px] text-ink bg-surface-raised focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-[border-color,box-shadow] leading-relaxed max-h-[120px]"
                />
                <Button
                  size="sm"
                  icon
                  onClick={() => void handleSend()}
                  disabled={draft.trim() === ''}
                  aria-label="Надіслати"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M3 12L21 3l-6 18-3.5-7L3 12z" /></svg>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-ink-muted">
              <div>
                <svg className="w-8 h-8 mx-auto text-ink-faint mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><path d="M4 5h16v12H9l-5 4V5z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <p className="text-[13px] font-semibold text-ink">Оберіть чат</p>
              </div>
            </div>
          )}
        </section>
      </div>

      <MassMessageModal open={massOpen} onClose={() => setMassOpen(false)} />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatPageInner />
    </Suspense>
  );
}
