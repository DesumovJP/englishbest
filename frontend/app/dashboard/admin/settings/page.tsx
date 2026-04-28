/**
 * Admin · Налаштування платформи.
 *
 * Cross-org platform-level controls: feature flags, signup mode,
 * default plan, demo-mode toggle, maintenance banner.
 *
 * Status: scaffolded — see ADMIN_PRODUCTION_PLAN.md → Phase 6 ·
 * Platform settings + feature flags.
 */
import { DashboardPageShell } from '@/components/ui/shells';
import { WipSection } from '@/components/ui/WipSection';

export default function AdminSettingsPage() {
  return (
    <DashboardPageShell title="Налаштування" subtitle="Платформенні перемикачі">
      <WipSection
        title="Налаштування платформи — у розробці"
        description="Тут будуть feature-flags (нові модулі, A/B), maintenance-banner, дефолти підписки/плану, режим відкритої реєстрації, керування ролями за замовчуванням. Потребує нового content-type `platform-config` + scoped controller. Phase 6 з ADMIN_PRODUCTION_PLAN.md."
      />
    </DashboardPageShell>
  );
}
