'use client';
import { useState, useRef, useEffect } from 'react';

/* ─── Типи ───────────────────────────────────── */
type SenderRole = 'admin' | 'teacher';

interface Message {
  id: string;
  from: SenderRole;
  text: string;
  time: string;
  read: boolean;
}

interface Conversation {
  id: string;
  teacherName: string;
  teacherPhoto: string;
  specialization: string;
  messages: Message[];
}

/* ─── Мок-дані ───────────────────────────────── */
const CONVERSATIONS: Conversation[] = [
  {
    id: 'olga-k',
    teacherName: 'Olga Kovalenko',
    teacherPhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
    specialization: 'Діти 4–7, A0–A1',
    messages: [
      { id: 'm1', from: 'admin',   text: "Ольго, добрий день! Нагадую, що в п\u2019ятницю вебінар для всіх вчителів о 18:00. Участь обов\u2019язкова.",     time: '09:14', read: true },
      { id: 'm2', from: 'teacher', text: 'Добрий день! Зрозуміла, буду. Можу додати нових учнів у розклад на наступний тиждень?',                   time: '09:31', read: true },
      { id: 'm3', from: 'admin',   text: "Так, звичайно. До п\u2019ятниці поточного тижня залишилося три вільних слоти. Бронюйте до 5 учнів на тиждень.", time: '09:45', read: true },
      { id: 'm4', from: 'teacher', text: 'Дякую! Ще питання — чи можна перенести урок з Аліси з вівторка на середу? Батьки просять.',               time: '11:02', read: true },
      { id: 'm5', from: 'admin',   text: 'Зробіть заявку в розкладі, я підтвердю сьогодні до 15:00.',                                              time: '11:08', read: true },
      { id: 'm6', from: 'teacher', text: 'Відправила! Дякую за оперативність 🙏',                                                                   time: '11:10', read: false },
    ],
  },
  {
    id: 'maria-s',
    teacherName: 'Maria Sydorenko',
    teacherPhoto: 'https://randomuser.me/api/portraits/women/65.jpg',
    specialization: 'Граматика, A1–A2',
    messages: [
      { id: 'm1', from: 'teacher', text: 'Адміне, виникла проблема — учень Микола пропустив вже 3 уроки поспіль без попередження. Що робити?',      time: '13:20', read: true },
      { id: 'm2', from: 'admin',   text: "Бачу у системі. Я зв\u2019яжусь з батьками сьогодні. Ви зафіксували пропуски в журналі?",                      time: '13:35', read: true },
      { id: 'm3', from: 'teacher', text: 'Так, всі три уроки позначені як пропущені з причиною «без попередження».',                                 time: '13:37', read: true },
      { id: 'm4', from: 'admin',   text: 'Чудово, дякую. За регламентом після 3 пропусків ми надсилаємо офіційне попередження. Все вже відбувається.', time: '13:50', read: true },
      { id: 'm5', from: 'teacher', text: 'Зрозуміла. Чекаю результатів.',                                                                           time: '13:52', read: true },
    ],
  },
  {
    id: 'dmytro-p',
    teacherName: 'Dmytro Petrenko',
    teacherPhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
    specialization: 'Іспити, B1–B2',
    messages: [
      { id: 'm1', from: 'teacher', text: 'Добрий день! Коли очікувати виплату за березень?',                                                         time: '10:05', read: true },
      { id: 'm2', from: 'admin',   text: 'Дмитре, виплати за березень заплановані на 5 квітня. Загальна сума ₴ 11 210 відповідно до звіту.',          time: '10:22', read: true },
      { id: 'm3', from: 'teacher', text: 'Дякую! Ще одне — можу я взяти 2 додаткові групи в квітні? Є вільний час вранці.',                         time: '10:25', read: true },
      { id: 'm4', from: 'admin',   text: 'Пришліть розклад доступності, я переглянемо яких учнів можемо направити. Поточне навантаження у вас 59 уроків/міс — стежтесь за балансом.', time: '10:40', read: true },
      { id: 'm5', from: 'teacher', text: 'Все зрозуміло, розклад відправлю до кінця дня.',                                                          time: '10:41', read: false },
    ],
  },
  {
    id: 'anna-v',
    teacherName: 'Anna Vasylenko',
    teacherPhoto: 'https://randomuser.me/api/portraits/women/23.jpg',
    specialization: 'Бізнес, B2–C1',
    messages: [
      { id: 'm1', from: 'admin',   text: 'Анно, ваш учень Артем просить сертифікат про проходження програми. Чи готові ви підписати оцінку?',        time: 'Вчора, 16:30', read: true },
      { id: 'm2', from: 'teacher', text: 'Так, рівень учня відповідає B2+. Можу підтвердити. Який формат потрібен?',                                 time: 'Вчора, 17:02', read: true },
      { id: 'm3', from: 'admin',   text: 'PDF з підписом. Надішліть мені оцінку за останні 3 місяці, я оформлю офіційний документ.',                 time: 'Вчора, 17:15', read: true },
      { id: 'm4', from: 'teacher', text: 'Відправляю звіт. Середній бал за квартал — 91%. Відмінний прогрес! 🎉',                                   time: 'Вчора, 17:30', read: false },
    ],
  },
];

/* ─── Допоміжна: аватар з ініціалами (fallback) ─ */
function unread(conv: Conversation) {
  return conv.messages.filter(m => !m.read && m.from === 'teacher').length;
}

function lastMsg(conv: Conversation) {
  return conv.messages[conv.messages.length - 1];
}

/* ─── Бульбашка повідомлення ─────────────────── */
function Bubble({ msg, isOwn }: { msg: Message; isOwn: boolean }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
        isOwn
          ? 'bg-primary text-white rounded-br-sm'
          : 'bg-white border border-border text-ink rounded-bl-sm'
      }`}>
        <p>{msg.text}</p>
        <p className={`text-[10px] mt-1 text-right ${isOwn ? 'text-white/60' : 'text-ink-muted'}`}>
          {msg.time}{isOwn && msg.read && ' ✓✓'}
        </p>
      </div>
    </div>
  );
}

/* ─── Головний компонент ─────────────────────── */
export default function ChatPage() {
  const [role, setRole]       = useState<SenderRole>('admin');
  const [convId, setConvId]   = useState<string>(CONVERSATIONS[0].id);
  const [convMap, setConvMap] = useState<Record<string, Conversation>>(() =>
    Object.fromEntries(CONVERSATIONS.map(c => [c.id, c]))
  );
  const [draft, setDraft]     = useState('');
  const messagesEndRef         = useRef<HTMLDivElement>(null);

  const conversations = Object.values(convMap);
  const activeId      = role === 'teacher' ? 'maria-s' : convId;
  const conv          = convMap[activeId];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conv?.messages.length, convId]);

  function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    const msg: Message = {
      id: `m-${Date.now()}`,
      from: role,
      text,
      time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setConvMap(prev => ({
      ...prev,
      [activeId]: { ...prev[activeId], messages: [...prev[activeId].messages, msg] },
    }));
    setDraft('');
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] rounded-2xl overflow-hidden border border-border shadow-sm">

      {/* Role switcher banner */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-border flex-shrink-0">
        <span className="text-xs font-black text-ink-muted uppercase tracking-wide">Перегляд як:</span>
        <div className="flex bg-surface-muted rounded-xl p-1 gap-0.5">
          {(['admin', 'teacher'] as SenderRole[]).map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                role === r ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {r === 'admin' ? '🛡 Адміністратор' : '👩‍🏫 Вчитель (Maria S.)'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 min-h-0">

        {/* ── Ліва панель: список розмов (лише для адміна) ── */}
        {role === 'admin' && (
          <aside className="hidden sm:flex sm:w-56 lg:w-72 flex-shrink-0 border-r border-border bg-white flex-col">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="font-black text-ink text-sm">Чат з вчителями</h2>
              <p className="text-xs text-ink-muted mt-0.5">{conversations.length} розмови</p>
            </div>

            <ul className="flex-1 overflow-y-auto divide-y divide-border">
              {conversations.map(c => {
                const last    = lastMsg(c);
                const unreadN = unread(c);
                const active  = c.id === activeId;

                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setConvId(c.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors ${
                        active ? 'bg-primary/5 border-l-2 border-primary' : 'hover:bg-surface-muted/60 border-l-2 border-transparent'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.teacherPhoto} alt={c.teacherName} className="w-10 h-10 rounded-full object-cover" />
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success border-2 border-white rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className="text-sm font-bold text-ink truncate">{c.teacherName}</p>
                          <span className="text-[10px] text-ink-muted flex-shrink-0">{last.time}</span>
                        </div>
                        <p className="text-xs text-ink-muted truncate">
                          {last.from === 'admin' ? 'Ви: ' : ''}{last.text}
                        </p>
                      </div>
                      {unreadN > 0 && (
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-black text-white">
                          {unreadN}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>
        )}

        {/* ── Права панель: активна розмова ── */}
        <div className="flex-1 flex flex-col min-w-0 bg-surface-muted">

          {/* Хедер розмови */}
          <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-border flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={conv.teacherPhoto} alt={conv.teacherName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-ink">
                {role === 'teacher' ? '🛡 Адміністрація EnglishBest' : conv.teacherName}
              </p>
              <p className="text-xs text-ink-muted">
                {role === 'teacher' ? 'Внутрішній чат платформи' : conv.specialization}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-xs text-ink-muted">Онлайн</span>
            </div>
          </div>

          {/* Повідомлення */}
          <div className="flex-1 overflow-y-auto px-5 py-4">

            {/* Дата-сепаратор */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wide">Сьогодні</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {conv.messages.map(msg => (
              <Bubble
                key={msg.id}
                msg={msg}
                isOwn={msg.from === role}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Поле введення */}
          <div className="px-4 py-3 bg-white border-t border-border flex-shrink-0 flex items-end gap-2">
            {/* Прикріпити файл */}
            <label
              htmlFor="chat-file"
              className="w-10 h-10 rounded-2xl border border-border flex items-center justify-center flex-shrink-0 text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors cursor-pointer"
              title="Прикріпити файл"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.42a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
              <input id="chat-file" type="file" className="sr-only" />
            </label>

            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Напишіть повідомлення… (Enter — надіслати)"
              rows={1}
              className="flex-1 resize-none px-4 py-2.5 rounded-2xl border border-border text-sm text-ink bg-surface-muted focus:outline-none focus:border-primary transition-colors leading-relaxed max-h-[120px]"
            />
            <button
              onClick={sendMessage}
              disabled={!draft.trim()}
              aria-label="Надіслати"
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
