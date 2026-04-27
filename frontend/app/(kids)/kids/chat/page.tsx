/**
 * Kids chat page — wraps the shared <ChatPanel> in a full-height frame
 * that reserves space for the fixed KidsFooter below. No top navbar:
 * navigation between top-level kids surfaces (Home / School / Homework /
 * Chat / Shop) lives in the bottom KidsFooter.
 */
import { ChatPanel } from '@/components/organisms/ChatPanel';

export const metadata = { title: 'Чат · English Best' };

// Bottom reserve: 64px nav + 6px ring + safe-area inset.
const FOOTER_RESERVE = 'calc(70px + env(safe-area-inset-bottom, 0px))';

export default function KidsChatPage() {
  return (
    <div className="flex flex-col h-svh">
      <main
        className="flex-1 min-h-0"
        style={{ paddingBottom: FOOTER_RESERVE }}
      >
        <ChatPanel variant="kids" />
      </main>
    </div>
  );
}
