/**
 * Admin · Журнал дій (audit log).
 *
 * Read-only timeline of admin / staff mutations across the platform —
 * who did what, on which entity, when. Backed by `api::audit-log`
 * (admin-only at the permission layer; backend hook in `lib/audit.ts`
 * already writes rows on destructive ops + moderation transitions).
 *
 * Status: scaffolded — full DataTable + filter + JSON-diff viewer
 * lands in a follow-up chunk.
 */
import { DashboardPageShell } from '@/components/ui/shells';
import { WipSection } from '@/components/ui/WipSection';

export default function AdminAuditLogPage() {
  return (
    <DashboardPageShell
      title="Журнал дій"
      subtitle="Хто, що і коли змінив на платформі"
    >
      <WipSection
        title="Сторінка у розробці"
        description="Скоро тут з'явиться повний журнал — кожна дія персоналу з можливістю фільтру за період, користувача й тип об'єкта."
      />
    </DashboardPageShell>
  );
}
