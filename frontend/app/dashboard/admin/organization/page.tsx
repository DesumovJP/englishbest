/**
 * Admin · Організація.
 *
 * Org-level settings: name, slug, branding, default locale/timezone,
 * billing identity, integration keys (Calendly, Google Meet, Stripe).
 *
 * Status: scaffolded — see ADMIN_PRODUCTION_PLAN.md → Phase 5 · Org
 * settings UI for the form spec + which fields admin can edit.
 */
import { DashboardPageShell } from '@/components/ui/shells';
import { WipSection } from '@/components/ui/WipSection';

export default function AdminOrganizationPage() {
  return (
    <DashboardPageShell title="Організація" subtitle="Налаштування школи">
      <WipSection
        title="Налаштування організації — у розробці"
        description="Тут буде форма редагування організації: назва, slug, обкладинка, дефолтні локаль і таймзона, контактні дані для рахунків, ключі інтеграцій. Backend `api::organization.organization.update` — `roles: ADMIN` уже seed-нуто. UI приходить у Phase 5 з ADMIN_PRODUCTION_PLAN.md."
      />
    </DashboardPageShell>
  );
}
