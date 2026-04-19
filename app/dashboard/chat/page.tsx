'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MOCK_CHAT_THREADS,
  type ChatThread,
} from '@/lib/teacher-mocks';
import { SearchInput, SegmentedControl, type SegmentedControlOption } from '@/components/teacher/ui';
import { MassMessageModal } from '@/components/teacher/MassMessageModal';

/* ─── Types ───────────────────────────────────── */
type TabFilter = 'all' | 'student' | 'parent' | 'group';

interface Message {
  id: string;
  threadId: string;
  fromMe: boolean;
  authorName?: string;
  body: string;
  time: string;
  read: boolean;
  pinned?: boolean;
  replyTo?: { author: string; body: string };
}

const TAB_OPTIONS: ReadonlyArray<SegmentedControlOption<TabFilter>> = [
  { value: 'all',     label: 'Усі' },
  { value: 'student', label: 'Учні' },
  { value: 'parent',  label: 'Батьки' },
  { value: 'group',   label: 'Групи' },
];

const EMOJIS = ['👍', '❤️', '🎉', '🙏', '✅', '📌', '🔥', '🤝'];

/* ─── Seed messages per thread ───────────────── */
const SEED_MESSAGES: Record<string, Message[]> = {
  th1: [
    { id: 'm1', threadId: 'th1', fromMe: false, body: 'Добрий день! Я зробила ДЗ, можна надіслати?', time: '14:10', read: true, authorName: 'Аліса Коваль' },
    { id: 'm2', threadId: 'th1', fromMe: true,  body: 'Так, відправляй сюди або прикріплюй файл.', time: '14:18', read: true },
    { id: 'm3', threadId: 'th1', fromMe: false, body: 'Дякую, готово!', time: '14:32', read: false, authorName: 'Аліса Коваль' },
  ],
  th2: [
    { id: 'm1', threadId: 'th2', fromMe: true,  body: 'Миколо, нагадую — завтра урок о 11:00.', time: '11:55', read: true },
    { id: 'm2', threadId: 'th2', fromMe: false, body: 'До зустрічі завтра', time: '12:10', read: true, authorName: 'Микола' },
  ],
  th3: [
    { id: 'm1', threadId: 'th3', fromMe: false, body: 'Чи зможе Аліса завтра о 19:00?', time: '10:04', read: false, authorName: 'Олена Коваль' },
  ],
  th4: [
    { id: 'm1', threadId: 'th4', fromMe: true,  body: 'Всім привіт! Ось ДЗ на четвер 👇', time: '09:30', read: true, pinned: true },
    { id: 'm2', threadId: 'th4', fromMe: true,  body: 'Ось ДЗ на четвер', time: '09:40', read: true },
    { id: 'm3', threadId: 'th4', fromMe: false, body: 'Прийнято, дякую!', time: '09:48', read: true, authorName: 'Софія' },
  ],
  th5: [
    { id: 'm1', threadId: 'th5', fromMe: false, body: 'Дякую за урок!', time: 'Вт', read: true, authorName: 'Юлія' },
  ],
  th6: [
    { id: 'm1', threadId: 'th6', fromMe: true,  body: 'Тарасе, рахунок за квітень на пошті.', time: 'Пн', read: true },
    { id: 'm2', threadId: 'th6', fromMe: false, body: 'Домовились', time: 'Пн', read: true, authorName: 'Тарас' },
  ],
};

function threadAvatar(thread: ChatThread): React.ReactNode {
  if (thread.photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={thread.photo} alt={thread.title} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />;
  }
  return (
    <span className="w-10 h-10 rounded-full bg-secondary/15 text-secondary-dark text-base font-black flex items-center justify-center flex-shrink-0" aria-hidden>
      🧩
    </span>
  );
}

/* ─── Bubble ──────────────────────────────────── */
function Bubble({
  msg,
  onReply,
  onPin,
}: {
  msg: Message;
  onReply: (m: Message) => void;
  onPin: (m: Message) => void;
}) {
  const isOwn = msg.fromMe;
  return (
    <div className={`group flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className="max-w-[80%] flex flex-col gap-1">
        {msg.authorName && !isOwn && (
          <p className="text-[11px] font-bold text-ink-muted ml-3">{msg.authorName}</p>
        )}
        <div className={`relative px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
          isOwn
            ? 'bg-primary text-white rounded-br-sm'
            : 'bg-white border border-border text-ink rounded-bl-sm'
        }`}>
          {msg.replyTo && (
            <div className={`mb-1.5 px-2 py-1 rounded-lg text-[11px] border-l-2 ${
              isOwn ? 'border-white/60 bg-white/10 text-white/80' : 'border-primary/40 bg-primary/5 text-ink-muted'
            }`}>
              <p className="font-bold">{msg.replyTo.author}</p>
              <p className="truncate">{msg.replyTo.body}</p>
            </div>
          )}
          {msg.pinned && (
            <p className={`text-[10px] font-bold mb-1 ${isOwn ? 'text-white/80' : 'text-primary-dark'}`}>📌 Закріплено</p>
          )}
          <p className="whitespace-pre-wrap">{msg.body}</p>
          <div className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${isOwn ? 'text-white/70' : 'text-ink-muted'}`}>
            <span>{msg.time}</span>
            {isOwn && <span aria-label={msg.read ? 'Прочитано' : 'Надіслано'}>{msg.read ? '✓✓' : '✓'}</span>}
          </div>
        </div>
        <div className={`flex gap-1 ${isOwn ? 'justify-end' : 'justify-start'} opacity-0 group-hover:opacity-100 transition-opacity`}>
          <button
            type="button"
            onClick={() => onReply(msg)}
            className="text-[10px] px-1.5 py-0.5 rounded-md bg-white border border-border text-ink-muted hover:text-ink"
          >
            ↩ Відповісти
          </button>
          <button
            type="button"
            onClick={() => onPin(msg)}
            className="text-[10px] px-1.5 py-0.5 rounded-md bg-white border border-border text-ink-muted hover:text-ink"
          >
            {msg.pinned ? 'Відкріпити' : '📌 Закріпити'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────── */
export default function ChatPage() {
  const [tab, setTab] = useState<TabFilter>('all');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string>(MOCK_CHAT_THREADS[0]?.id ?? '');
  const [messagesByThread, setMessagesByThread] = useState<Record<string, Message[]>>(SEED_MESSAGES);
  const [draft, setDraft] = useState('');
  const [threadSearch, setThreadSearch] = useState('');
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showThreadSearch, setShowThreadSearch] = useState(false);
  const [massOpen, setMassOpen] = useState(false);
  const [mobilePane, setMobilePane] = useState<'list' | 'thread'>('list');

  const endRef = useRef<HTMLDivElement>(null);

  const threads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_CHAT_THREADS
      .filter(t => tab === 'all' || t.kind === tab)
      .filter(t => q === '' || t.title.toLowerCase().includes(q));
  }, [tab, query]);

  const active = useMemo(() => MOCK_CHAT_THREADS.find(t => t.id === activeId), [activeId]);
  const activeMessages = messagesByThread[activeId] ?? [];

  const visibleMessages = useMemo(() => {
    if (!showThreadSearch || threadSearch.trim() === '') return activeMessages;
    const q = threadSearch.toLowerCase();
    return activeMessages.filter(m => m.body.toLowerCase().includes(q));
  }, [activeMessages, threadSearch, showThreadSearch]);

  const pinned = useMemo(() => activeMessages.filter(m => m.pinned), [activeMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, activeId]);

  function pickThread(id: string) {
    setActiveId(id);
    setMobilePane('thread');
    setReplyTarget(null);
    setShowThreadSearch(false);
  }

  function sendMessage(body?: string) {
    const text = (body ?? draft).trim();
    if (text === '') return;
    const msg: Message = {
      id: `m-${Date.now()}`,
      threadId: activeId,
      fromMe: true,
      body: text,
      time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      replyTo: replyTarget ? { author: replyTarget.authorName ?? 'Ви', body: replyTarget.body } : undefined,
    };
    setMessagesByThread(prev => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), msg] }));
    setDraft('');
    setReplyTarget(null);
    setShowEmoji(false);
  }

  function togglePin(msg: Message) {
    setMessagesByThread(prev => ({
      ...prev,
      [activeId]: (prev[activeId] ?? []).map(m => m.id === msg.id ? { ...m, pinned: !m.pinned } : m),
    }));
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-6rem)] md:h-[calc(100dvh-4rem)] rounded-2xl overflow-hidden border border-border shadow-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white border-b border-border flex-shrink-0">
        <h1 className="type-h3 text-ink">Чат</h1>
        <button
          type="button"
          onClick={() => setMassOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white text-xs font-black hover:opacity-90 transition-opacity"
        >
          📨 Написати всім
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Threads panel */}
        <aside className={`${mobilePane === 'list' ? 'flex' : 'hidden'} md:flex w-full md:w-72 lg:w-80 flex-shrink-0 border-r border-border bg-white flex-col`}>
          <div className="px-4 py-3 border-b border-border flex flex-col gap-2.5">
            <SegmentedControl value={tab} onChange={setTab} options={TAB_OPTIONS} label="Тип чату" />
            <SearchInput
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Пошук чату…"
              containerClassName="w-full"
            />
          </div>

          <ul className="flex-1 overflow-y-auto divide-y divide-border">
            {threads.map(t => {
              const isActive = t.id === activeId;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => pickThread(t.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                      isActive
                        ? 'bg-primary/5 border-l-2 border-primary'
                        : 'hover:bg-surface-muted/60 border-l-2 border-transparent'
                    }`}
                  >
                    {threadAvatar(t)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className="text-sm font-bold text-ink truncate flex items-center gap-1">
                          {t.pinned && <span aria-hidden>📌</span>}
                          {t.title}
                        </p>
                        <span className="text-[10px] text-ink-muted flex-shrink-0">{t.lastMessageAt}</span>
                      </div>
                      <p className="text-xs text-ink-muted truncate">{t.lastMessage}</p>
                    </div>
                    {t.unread > 0 && (
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-black text-white">
                        {t.unread}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
            {threads.length === 0 && (
              <li className="px-4 py-10 text-center text-xs text-ink-muted">Немає чатів</li>
            )}
          </ul>
        </aside>

        {/* Thread pane */}
        <section className={`${mobilePane === 'thread' ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-w-0 bg-surface-muted`}>
          {active ? (
            <>
              <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-border flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setMobilePane('list')}
                  className="md:hidden w-9 h-9 rounded-xl border border-border flex items-center justify-center text-ink-muted"
                  aria-label="Назад до списку"
                >
                  ←
                </button>
                {threadAvatar(active)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-ink truncate">{active.title}</p>
                  <p className="text-xs text-ink-muted">
                    {active.kind === 'student' ? 'Чат з учнем' : active.kind === 'parent' ? 'Чат з батьками' : 'Чат групи'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowThreadSearch(v => !v); setThreadSearch(''); }}
                  className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
                  aria-label="Пошук у чаті"
                  title="Пошук у чаті"
                >
                  🔍
                </button>
              </header>

              {showThreadSearch && (
                <div className="px-4 py-2 bg-white border-b border-border flex-shrink-0">
                  <SearchInput
                    value={threadSearch}
                    onChange={e => setThreadSearch(e.target.value)}
                    placeholder="Пошук у чаті…"
                    containerClassName="w-full"
                    autoFocus
                  />
                </div>
              )}

              {pinned.length > 0 && (
                <div className="px-4 py-2 bg-accent/5 border-b border-accent/20 flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs" aria-hidden>📌</span>
                  <p className="text-xs text-ink-muted truncate">
                    <span className="font-bold text-accent-dark">Закріплено:</span> {pinned[0].body}
                  </p>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wide">Сьогодні</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {visibleMessages.map(m => (
                  <Bubble key={m.id} msg={m} onReply={setReplyTarget} onPin={togglePin} />
                ))}
                <div ref={endRef} />
              </div>

              {replyTarget && (
                <div className="px-4 py-2 bg-primary/5 border-t border-primary/20 flex items-center gap-3 flex-shrink-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-primary-dark uppercase tracking-wide">Відповідь</p>
                    <p className="text-xs text-ink-muted truncate">{replyTarget.body}</p>
                  </div>
                  <button type="button" onClick={() => setReplyTarget(null)} aria-label="Скасувати відповідь" className="text-ink-muted hover:text-ink">✕</button>
                </div>
              )}

              {showEmoji && (
                <div className="px-4 py-2 bg-white border-t border-border flex flex-wrap gap-1.5 flex-shrink-0">
                  {EMOJIS.map(e => (
                    <button
                      type="button"
                      key={e}
                      onClick={() => setDraft(d => d + e)}
                      className="w-9 h-9 text-xl rounded-lg hover:bg-surface-muted transition-colors"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}

              <div className="px-3 py-2.5 bg-white border-t border-border flex items-end gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => window.alert('📎 Прикріплення — з бекендом')}
                  className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-ink-muted hover:text-ink"
                  aria-label="Прикріпити"
                  title="Прикріпити файл"
                >
                  📎
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmoji(v => !v)}
                  className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-ink-muted hover:text-ink"
                  aria-label="Емодзі"
                  title="Емодзі"
                >
                  😊
                </button>
                <button
                  type="button"
                  onClick={() => window.alert('🎙 Голосове — з бекендом')}
                  className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-ink-muted hover:text-ink"
                  aria-label="Голосове"
                  title="Голосове повідомлення"
                >
                  🎙
                </button>
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Напишіть повідомлення…"
                  rows={1}
                  className="flex-1 resize-none px-3 py-2 rounded-xl border border-border text-sm text-ink bg-surface-muted focus:outline-none focus:border-primary leading-relaxed max-h-[120px]"
                />
                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={draft.trim() === ''}
                  aria-label="Надіслати"
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ➤
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-ink-muted">
              <div>
                <p className="text-4xl mb-2">💬</p>
                <p className="font-bold">Оберіть чат</p>
              </div>
            </div>
          )}
        </section>
      </div>

      <MassMessageModal open={massOpen} onClose={() => setMassOpen(false)} />
    </div>
  );
}
