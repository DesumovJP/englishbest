/**
 * Admin · Налаштування платформи.
 *
 * Cross-org platform-level controls: feature flags, signup mode,
 * default plan, demo-mode toggle, maintenance banner.
 *
 * Status: scaffolded — controls land in a follow-up chunk.
 */
import { DashboardPageShell } from '@/components/ui/shells';
import { WipSection } from '@/components/ui/WipSection';

export default function AdminSettingsPage() {
  return (
    <DashboardPageShell title="Налаштування" subtitle="Платформенні перемикачі">
      <WipSection
        title="Сторінка у розробці"
        description="Скоро тут будуть платформенні перемикачі — режим реєстрації, дефолтні налаштування, технічні банери."
      />
    </DashboardPageShell>
  );
}
