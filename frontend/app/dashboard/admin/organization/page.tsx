/**
 * Admin · Організація.
 *
 * Org-level settings: name, slug, branding, default locale/timezone,
 * billing identity, integration keys.
 *
 * Status: scaffolded — form lands in a follow-up chunk.
 */
import { DashboardPageShell } from '@/components/ui/shells';
import { WipSection } from '@/components/ui/WipSection';

export default function AdminOrganizationPage() {
  return (
    <DashboardPageShell title="Організація" subtitle="Налаштування школи">
      <WipSection
        title="Сторінка у розробці"
        description="Скоро тут з'явиться форма налаштувань організації — назва, обкладинка, контакти, ключі інтеграцій."
      />
    </DashboardPageShell>
  );
}
