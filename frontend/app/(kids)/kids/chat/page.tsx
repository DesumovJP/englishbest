/**
 * Kids chat page — wraps the shared <ChatPanel> with the kids header on top
 * and reserves space for the fixed KidsFooter below. Skips KidsPageShell on
 * purpose: that shell adds bottom padding for the footer, which would create
 * a visual gap below the composer instead of letting the composer sit flush
 * above the footer like a real messenger.
 */
import { KidsPageHeader } from '@/components/kids/ui';
import { ChatPanel } from '@/components/organisms/ChatPanel';

export const metadata = { title: 'Чат · English Best' };

// Bottom reserve: 64px nav + 6px ring + safe-area inset.
const FOOTER_RESERVE = 'calc(70px + env(safe-area-inset-bottom, 0px))';

export default function KidsChatPage() {
  return (
    <div className="flex flex-col h-svh">
      <KidsPageHeader title="Чат 💬" backHref="/kids/dashboard" />
      <main
        className="flex-1 min-h-0"
        style={{ paddingBottom: FOOTER_RESERVE }}
      >
        <ChatPanel variant="kids" />
      </main>
    </div>
  );
}
