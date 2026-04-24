'use client';

import { KidsPageShell } from '@/components/ui/shells';
import { KidsPageHeader } from '@/components/kids/ui';
import { LessonTreeSection } from '@/components/kids/LessonTreeSection';
import { useKidsIdentity } from '@/lib/use-kids-identity';

export default function KidsLessonsPage() {
  const { level } = useKidsIdentity();
  return (
    <KidsPageShell
      header={<KidsPageHeader title="Уроки 📚" backHref="/kids/school" />}
    >
      <div className="py-4 px-3 max-w-screen-sm mx-auto">
        <LessonTreeSection level={level} />
      </div>
    </KidsPageShell>
  );
}
