/**
 * Admin · Журнал дій (audit log).
 *
 * Read-only timeline of every admin/staff mutation across the platform —
 * who did what, on which entity, when. Backed by `api::audit-log` (already
 * scoped admin-only at the permission layer).
 *
 * Status: scaffolded — full DataTable wiring lives in the next chunk
 * (see ADMIN_PRODUCTION_PLAN.md → Phase 3 · Audit log viewer).
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
        title="Журнал дій — у розробці"
        description="Тут буде хронологічний DataTable аудит-логу: actor (хто), action (що), entityType+entityId (над чим), статус, raw before/after JSON, фільтр за період + actor + action. Backend (`api::audit-log`) і admin-only permission уже на місці — сторінка матеріалізується у Phase 3 з ADMIN_PRODUCTION_PLAN.md."
      />
    </DashboardPageShell>
  );
}
