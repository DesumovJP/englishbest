'use client';
/**
 * Staff chat page — thin shell that mounts the shared <ChatPanel>. All chat
 * logic lives in components/organisms/ChatPanel.tsx and is also reused by
 * /kids/chat. This wrapper only sets the dashboard-specific outer card.
 */
import { ChatPanel } from '@/components/organisms/ChatPanel';

export default function ChatPage() {
  return (
    <div className="h-[calc(100dvh-6rem)] md:h-[calc(100dvh-4rem)] rounded-xl border border-border bg-surface-raised overflow-hidden">
      <ChatPanel variant="staff" />
    </div>
  );
}
