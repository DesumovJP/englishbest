/**
 * /dashboard/profile — shared profile page for every authenticated role.
 *
 * - All roles: live editing of firstName / lastName / displayName / phone /
 *   dateOfBirth / locale / timezone / marketingOptIn via PATCH /api/user-profile/me.
 * - Teachers: additional TeacherProfileEditor section (bio/rates/specializations)
 *   via PATCH /api/teacher-profile/me.
 * - On save, calls `session.refresh()` so sidebar / greetings pick up new name.
 */
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardPageShell } from '@/components/ui/shells';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { useSession } from '@/lib/session-context';
import {
  fetchMyProfile,
  updateMyProfile,
  type UserProfile,
  type Locale,
} from '@/lib/user-profile';
import {
  fetchMyTeacherProfile,
  updateMyTeacherProfile,
  type TeacherProfile,
} from '@/lib/teacher-profile';

const ROLE_LABEL: Record<UserProfile['role'], string> = {
  kids:    'Учень',
  adult:   'Учень',
  teacher: 'Вчитель',
  admin:   'Адміністратор',
  parent:  'Батьки',
};

const LOCALE_OPTIONS: ReadonlyArray<{ value: Locale; label: string }> = [
  { value: 'uk', label: 'Українська' },
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Русский' },
];

const COMMON_TIMEZONES = [
  'Europe/Kyiv',
  'Europe/Warsaw',
  'Europe/Berlin',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Dubai',
];

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card variant="surface" padding="none" className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-2.5 border-b border-border">
        <h2 className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </Card>
  );
}

function PersonalEditor({
  profile,
  onUpdated,
}: {
  profile: UserProfile;
  onUpdated: (p: UserProfile) => Promise<void>;
}) {
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName]   = useState(profile.lastName ?? '');
  const [displayName, setDisplayName] = useState(profile.displayName ?? '');
  const [phone, setPhone]         = useState(profile.phone ?? '');
  const [dob, setDob]             = useState(profile.dateOfBirth ?? '');
  const [locale, setLocale]       = useState<Locale>(profile.locale);
  const [timezone, setTimezone]   = useState(profile.timezone);
  const [marketingOptIn, setMarketingOptIn] = useState(profile.marketingOptIn);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    setFirstName(profile.firstName);
    setLastName(profile.lastName ?? '');
    setDisplayName(profile.displayName ?? '');
    setPhone(profile.phone ?? '');
    setDob(profile.dateOfBirth ?? '');
    setLocale(profile.locale);
    setTimezone(profile.timezone);
    setMarketingOptIn(profile.marketingOptIn);
  }, [profile]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const fresh = await updateMyProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim() === '' ? null : lastName.trim(),
        displayName: displayName.trim() === '' ? null : displayName.trim(),
        phone: phone.trim() === '' ? null : phone.trim(),
        dateOfBirth: dob.trim() === '' ? null : dob,
        locale,
        timezone,
        marketingOptIn,
      });
      await onUpdated(fresh);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e?.message ?? 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard
      title="Особисті дані"
      action={
        <Button
          size="sm"
          variant={saved ? 'secondary' : 'primary'}
          onClick={handleSave}
          loading={saving}
          disabled={firstName.trim().length === 0}
        >
          {saving ? 'Збереження…' : saved ? 'Збережено' : 'Зберегти'}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {error && (
          <div className="text-[12px] text-danger-dark border border-danger/30 rounded-md px-3 py-2">{error}</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Ім'я">
            <Input value={firstName} onChange={e => setFirstName(e.target.value)} />
          </FormField>
          <FormField label="Прізвище">
            <Input value={lastName} onChange={e => setLastName(e.target.value)} />
          </FormField>
        </div>
        <FormField
          label="Публічне ім'я"
          hint="Відображається іншим користувачам (необов'язково). Якщо порожньо — покажемо «Ім'я Прізвище»."
        >
          <Input
            value={displayName}
            placeholder={`${firstName} ${lastName}`.trim()}
            onChange={e => setDisplayName(e.target.value)}
          />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Телефон">
            <Input
              type="tel"
              value={phone}
              placeholder="+380XXXXXXXXX"
              onChange={e => setPhone(e.target.value)}
            />
          </FormField>
          <FormField label="Дата народження">
            <Input type="date" value={dob} onChange={e => setDob(e.target.value)} />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Мова інтерфейсу">
            <Select
              value={locale}
              onChange={e => setLocale(e.target.value as Locale)}
              options={LOCALE_OPTIONS}
            />
          </FormField>
          <FormField label="Часовий пояс">
            <Select
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              options={
                COMMON_TIMEZONES.includes(timezone)
                  ? COMMON_TIMEZONES.map(tz => ({ value: tz, label: tz }))
                  : [{ value: timezone, label: timezone }, ...COMMON_TIMEZONES.map(tz => ({ value: tz, label: tz }))]
              }
            />
          </FormField>
        </div>
        <div className="flex items-center justify-between gap-4 py-2 border-t border-border">
          <div>
            <p className="text-[13px] font-semibold text-ink">Розсилка</p>
            <p className="text-[11px] text-ink-muted">Отримувати листи про новинки, акції та поради</p>
          </div>
          <Switch
            checked={marketingOptIn}
            onCheckedChange={setMarketingOptIn}
            label="Розсилка"
          />
        </div>
      </div>
    </SectionCard>
  );
}

function TeacherProfileEditor({
  profile,
  onUpdated,
}: {
  profile: TeacherProfile;
  onUpdated: (p: TeacherProfile) => void;
}) {
  const [bio, setBio] = useState(profile.bio ?? '');
  const [languages, setLanguages] = useState(profile.languagesSpoken.join(', '));
  const [specializations, setSpecializations] = useState(profile.specializations.join(', '));
  const [hourlyRate, setHourlyRate] = useState(String(profile.hourlyRate ?? ''));
  const [videoMeetUrl, setVideoMeetUrl] = useState(profile.videoMeetUrl ?? '');
  const [yearsExperience, setYearsExperience] = useState(String(profile.yearsExperience ?? ''));
  const [acceptsTrial, setAcceptsTrial] = useState(profile.acceptsTrial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBio(profile.bio ?? '');
    setLanguages(profile.languagesSpoken.join(', '));
    setSpecializations(profile.specializations.join(', '));
    setHourlyRate(String(profile.hourlyRate ?? ''));
    setVideoMeetUrl(profile.videoMeetUrl ?? '');
    setYearsExperience(String(profile.yearsExperience ?? ''));
    setAcceptsTrial(profile.acceptsTrial);
  }, [profile]);

  function splitCsv(s: string): string[] {
    return s.split(',').map(x => x.trim()).filter(Boolean);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const rate = hourlyRate.trim() === '' ? undefined : Number(hourlyRate);
      const years = yearsExperience.trim() === '' ? undefined : Number(yearsExperience);
      const fresh = await updateMyTeacherProfile({
        bio: bio.trim() === '' ? null : bio,
        languagesSpoken: splitCsv(languages),
        specializations: splitCsv(specializations),
        hourlyRate: rate !== undefined && Number.isFinite(rate) && rate >= 0 ? rate : undefined,
        yearsExperience: years !== undefined && Number.isFinite(years) && years >= 0 ? years : undefined,
        videoMeetUrl: videoMeetUrl.trim() === '' ? null : videoMeetUrl,
        acceptsTrial,
      });
      onUpdated(fresh);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e?.message ?? 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard
      title="Профіль викладача"
      action={
        <Button
          size="sm"
          variant={saved ? 'secondary' : 'primary'}
          onClick={handleSave}
          loading={saving}
        >
          {saving ? 'Збереження…' : saved ? 'Збережено' : 'Зберегти'}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {error && (
          <div className="text-[12px] text-danger-dark border border-danger/30 rounded-md px-3 py-2">{error}</div>
        )}
        <FormField label="Про себе">
          <Textarea
            value={bio}
            placeholder="Коротко про досвід, методику, цільову аудиторію…"
            onChange={e => setBio(e.target.value)}
          />
        </FormField>
        <FormField label="Мови викладання (через кому)">
          <Input
            value={languages}
            placeholder="English, Українська"
            onChange={e => setLanguages(e.target.value)}
          />
        </FormField>
        <FormField label="Спеціалізація (через кому)">
          <Input
            value={specializations}
            placeholder="Business English, IELTS, Speaking"
            onChange={e => setSpecializations(e.target.value)}
          />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Ставка за урок (₴)">
            <Input
              type="number"
              value={hourlyRate}
              placeholder="180"
              onChange={e => setHourlyRate(e.target.value)}
            />
          </FormField>
          <FormField label="Років досвіду">
            <Input
              type="number"
              value={yearsExperience}
              placeholder="5"
              onChange={e => setYearsExperience(e.target.value)}
            />
          </FormField>
        </div>
        <FormField label="Відео-зустрічі (URL)">
          <Input
            type="url"
            value={videoMeetUrl}
            placeholder="https://meet.google.com/…"
            onChange={e => setVideoMeetUrl(e.target.value)}
          />
        </FormField>
        <div className="flex items-center justify-between gap-4 py-2 border-t border-border">
          <div>
            <p className="text-[13px] font-semibold text-ink">Приймаю пробні уроки</p>
            <p className="text-[11px] text-ink-muted">Показувати профіль у каталозі пробних</p>
          </div>
          <Switch
            checked={acceptsTrial}
            onCheckedChange={setAcceptsTrial}
            label="Приймаю пробні уроки"
          />
        </div>
        {profile.publicSlug && (
          <p className="text-[11px] text-ink-muted">Публічний слаг: <code className="font-mono">{profile.publicSlug}</code></p>
        )}
        {profile.verified && (
          <p className="text-[11px] text-primary-dark">✓ Профіль верифіковано</p>
        )}
      </div>
    </SectionCard>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { session, status: sessionStatus, logout, refresh } = useSession();
  const role = session?.profile?.role ?? null;

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  const [profile, setProfile]             = useState<UserProfile | null>(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [reloadKey, setReloadKey]         = useState(0);

  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [tpLoading, setTpLoading]           = useState(false);
  const [tpError, setTpError]               = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus !== 'authenticated') return;
    let alive = true;
    setLoading(true);
    setError(null);
    fetchMyProfile()
      .then(p => { if (alive) setProfile(p); })
      .catch(e => { if (alive) setError(e?.message ?? 'Не вдалось завантажити профіль'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [sessionStatus, reloadKey]);

  useEffect(() => {
    if (role !== 'teacher') { setTeacherProfile(null); return; }
    let alive = true;
    setTpLoading(true);
    setTpError(null);
    fetchMyTeacherProfile()
      .then(p => { if (alive) setTeacherProfile(p); })
      .catch(e => { if (alive) setTpError(e?.message ?? 'Не вдалось завантажити teacher-профіль'); })
      .finally(() => { if (alive) setTpLoading(false); });
    return () => { alive = false; };
  }, [role, reloadKey]);

  async function handlePersonalUpdated(fresh: UserProfile) {
    setProfile(fresh);
    await refresh();
  }

  if (sessionStatus === 'loading') {
    return <DashboardPageShell title="Профіль" subtitle="Завантаження…" status="loading" loadingShape="card" />;
  }

  if (sessionStatus === 'anonymous' || !session) {
    return (
      <DashboardPageShell
        title="Профіль"
        status="empty"
        empty={{ title: 'Потрібно увійти', description: 'Щоб побачити профіль, увійдіть у свій акаунт.' }}
      />
    );
  }

  if (loading && !profile) {
    return <DashboardPageShell title="Профіль" subtitle="Завантаження…" status="loading" loadingShape="card" />;
  }

  if (error || !profile) {
    return (
      <DashboardPageShell
        title="Профіль"
        status="error"
        error={error ?? 'Профіль не знайдено'}
        onRetry={() => setReloadKey(k => k + 1)}
      />
    );
  }

  const fallbackName = `${profile.firstName}${profile.lastName ? ' ' + profile.lastName : ''}`.trim();
  const displayName = profile.displayName ?? (fallbackName.length > 0 ? fallbackName : 'Користувач');

  return (
    <DashboardPageShell
      title="Профіль"
      subtitle={`${ROLE_LABEL[profile.role]} · особисті дані та акаунт`}
    >
      <Card variant="surface" padding="md">
        <div className="flex flex-col gap-4">
          <AvatarUpload
            name={displayName}
            initialUrl={profile.avatarUrl}
            size="lg"
          />
          <div className="border-t border-border pt-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[15px] font-semibold text-ink">{displayName}</h2>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted px-2 py-0.5 rounded-md bg-surface-muted">
                {ROLE_LABEL[profile.role]}
              </span>
            </div>
            <p className="text-[12px] text-ink-muted mt-0.5">{profile.email ?? '—'}</p>
            {profile.organization && (
              <p className="text-[11px] text-ink-faint mt-0.5">{profile.organization.name}</p>
            )}
          </div>
        </div>
      </Card>

      <PersonalEditor profile={profile} onUpdated={handlePersonalUpdated} />

      {role === 'teacher' && (
        tpLoading && !teacherProfile ? (
          <Card variant="surface" padding="md" className="py-10 text-center text-ink-muted text-[13px]">
            Завантаження профілю викладача…
          </Card>
        ) : tpError ? (
          <Card variant="outline" padding="md" className="text-[13px] text-danger-dark border-danger/30">
            {tpError}
          </Card>
        ) : teacherProfile ? (
          <TeacherProfileEditor profile={teacherProfile} onUpdated={setTeacherProfile} />
        ) : (
          <Card variant="surface" padding="md" className="py-10 text-center text-ink-muted text-[13px]">
            Teacher-профіль ще не ініціалізовано.
          </Card>
        )
      )}

      <SectionCard title="Акаунт">
        <div className="flex flex-col gap-3">
          <p className="text-[12px] text-ink-muted">
            Щоб змінити пароль або email, зверніться до адміністратора школи.
          </p>
          <div>
            <Button variant="secondary" onClick={() => void handleLogout()}>
              Вийти з акаунту
            </Button>
          </div>
        </div>
      </SectionCard>
    </DashboardPageShell>
  );
}
