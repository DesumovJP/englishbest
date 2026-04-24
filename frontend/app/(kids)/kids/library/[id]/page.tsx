'use client';
import type { CSSProperties } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useKidsIdentity } from '@/lib/use-kids-identity';
import { useLibrary } from '@/lib/use-kids-store';
import {
  LIB_CATEGORIES,
  TYPE_ACCENT, TYPE_LABEL, TYPE_SECTION, TYPE_ICON, COVER_BG,
  canAccessLevel,
  type LibTabId,
} from '@/lib/library';
import { KidsPageShell } from '@/components/ui/shells';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export default function LibraryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { level: kidsLevel } = useKidsIdentity();
  const { items, loading } = useLibrary();

  const itemOrUndef = items.find(i => i.slug === id);

  if (loading) {
    return (
      <KidsPageShell>
        <div className="py-10">
          <LoadingState shape="card" rows={1} />
        </div>
      </KidsPageShell>
    );
  }

  if (!itemOrUndef) {
    return (
      <KidsPageShell>
        <EmptyState
          title="Матеріал не знайдено"
          description="Можливо, його прибрали з бібліотеки або посилання застаріло."
          icon={<span aria-hidden>😕</span>}
          action={<Button onClick={() => router.back()}>← Назад</Button>}
        />
      </KidsPageShell>
    );
  }

  const item     = itemOrUndef;
  const accent   = TYPE_ACCENT[item.kind];
  const desc     = item.descriptionShort || 'Цікавий навчальний матеріал для покращення знань англійської мови.';
  const longParas = item.descriptionLong ?? [desc];
  const preview  = item.preview;
  const isLocked = !canAccessLevel(kidsLevel, item.level);

  const counts: Record<LibTabId, number> = {
    all:    items.length,
    book:   items.filter(i => i.kind === 'book').length,
    course: items.filter(i => i.kind === 'course').length,
    video:  items.filter(i => i.kind === 'video').length,
    game:   items.filter(i => i.kind === 'game').length,
  };

  const accentVars = { '--accent': accent, '--cover-bg': COVER_BG[item.kind] } as CSSProperties;

  return (
    <KidsPageShell
      edge
      header={
        <div
          className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-surface-raised pt-[max(14px,env(safe-area-inset-top))] sticky top-0 z-sticky"
        >
          <button
            onClick={() => router.back()}
            aria-label="Назад"
            className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-lg flex-shrink-0 bg-surface-muted text-ink active:scale-90 transition-transform"
          >
            ←
          </button>
          <p className="font-black text-[15px] text-ink">Бібліотека</p>
          <span className="text-sm text-ink-faint" aria-hidden>›</span>
          <p className="font-medium truncate text-sm text-ink-muted">{item.title}</p>
        </div>
      }
    >
      <div className="flex flex-1" style={accentVars}>
        <aside className="hidden md:flex flex-col flex-shrink-0 w-[196px] border-r border-border py-5">
          <p className="px-5 mb-2 font-black uppercase tracking-widest text-[10px] text-ink-faint">Категорія</p>
          {LIB_CATEGORIES.map(cat => {
            const isActive = cat.id !== 'all' && cat.id === item.kind;
            return (
              <button
                key={cat.id}
                onClick={() => router.push('/kids/school')}
                className={[
                  "flex items-center justify-between px-5 py-2.5 text-left transition-colors border-l-[3px]",
                  isActive ? "bg-surface-muted border-ink" : "border-transparent",
                ].join(" ")}
              >
                <span className={["text-[13px]", isActive ? "text-ink font-extrabold" : "text-ink-muted font-medium"].join(" ")}>
                  {cat.label}
                </span>
                <span className="font-medium text-[11px] text-ink-faint">{counts[cat.id]}</span>
              </button>
            );
          })}
        </aside>

        <div className="flex-1 min-w-0">
          <section className="flex gap-8 px-6 md:px-10 py-8 border-b border-border flex-col md:flex-row">
            <div
              className={[
                "flex-shrink-0 rounded-2xl overflow-hidden flex items-center justify-center w-[180px] h-[240px] shadow-card-md text-[90px] bg-[image:var(--cover-bg)] mx-auto md:mx-0",
                isLocked && "grayscale-[0.4]",
              ].filter(Boolean).join(" ")}
              aria-hidden
            >
              {item.iconEmoji}
            </div>

            <div className="flex flex-col gap-3 flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-md px-2.5 py-0.5 font-bold text-[11.5px] bg-[color:var(--accent)]/10 text-[color:var(--accent)] border border-[color:var(--accent)]/25">
                  {TYPE_ICON[item.kind]} {TYPE_LABEL[item.kind]}
                </span>
                <span className="rounded-md px-2.5 py-0.5 font-bold text-[11.5px] bg-surface-muted text-ink border border-border">
                  {item.level}
                </span>
              </div>

              <div>
                <h1 className="font-black leading-tight text-[26px] text-ink tracking-tight">{item.title}</h1>
                <p className="font-medium mt-1 text-[15px] text-ink-muted">{item.titleUa}</p>
                <p className="font-medium mt-0.5 text-[13px] text-ink-faint">{item.subtitle}</p>
              </div>

              <p className="font-medium leading-relaxed text-[14.5px] text-ink">{desc}</p>

              <div className="mt-2">
                {isLocked ? (
                  <div className="inline-flex items-center gap-2 rounded-xl px-5 py-3 bg-surface-muted border-2 border-border">
                    <span className="text-lg" aria-hidden>🔒</span>
                    <span className="font-black text-sm text-ink-faint">Потрібен рівень {item.level}</span>
                  </div>
                ) : (
                  <Button variant="secondary" disabled>Доступ — в розробці</Button>
                )}
              </div>
            </div>
          </section>

          <section className="px-6 md:px-10 py-8 border-b border-border">
            <p className="font-black mb-4 text-[11px] text-ink-faint uppercase tracking-[0.09em]">Про матеріал</p>
            <div className="flex flex-col gap-4 max-w-[680px]">
              {longParas.map((p, i) => (
                <p key={i} className="font-medium text-[15px] text-ink leading-[1.7]">{p}</p>
              ))}
            </div>
          </section>

          {preview && (
            <section className="px-6 md:px-10 py-8 border-b border-border">
              <p className="font-black mb-4 text-[11px] text-ink-faint uppercase tracking-[0.09em]">{preview.title}</p>
              <div className="relative rounded-2xl px-8 py-7 max-w-[680px] bg-paper-card">
                <span className="absolute top-3 left-5 font-black text-[42px] leading-none text-[color:var(--accent)]/20" aria-hidden>“</span>
                <div className="pl-6">
                  {preview.text.split('\n\n').map((para, i) => (
                    <p
                      key={i}
                      className={["font-medium text-[15.5px] text-ink leading-[1.75] font-serif", i > 0 && "mt-3.5"].filter(Boolean).join(" ")}
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="px-6 md:px-10 py-6">
            <p className="font-black mb-4 text-[11px] text-ink-faint uppercase tracking-[0.09em]">Деталі</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '🏅', label: 'Рівень', value: item.level },
                { icon: TYPE_ICON[item.kind], label: 'Тип', value: TYPE_LABEL[item.kind] },
                { icon: '📦', label: 'Обсяг', value: item.subtitle },
                { icon: '💰', label: 'Доступ', value: isLocked ? `Від ${item.level}` : item.price === 0 ? 'Безкоштовно' : `${item.price} монет` },
              ].map(row => (
                <div key={row.label} className="rounded-xl px-4 py-3 bg-surface-muted border-[1.5px] border-border">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[15px]" aria-hidden>{row.icon}</span>
                    <span className="text-[9px] text-ink-faint font-extrabold uppercase tracking-[0.07em]">{row.label}</span>
                  </div>
                  <p className="font-black text-sm text-ink">{row.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="px-6 md:px-10 pb-12">
            <p className="font-black mb-4 text-[11px] text-ink-faint uppercase tracking-[0.09em]">
              {TYPE_SECTION[item.kind]} — ще матеріали
            </p>
            <div className="flex flex-col border-[1.5px] border-border rounded-2xl overflow-hidden">
              {items.filter(i => i.kind === item.kind && i.slug !== item.slug).slice(0, 4).map((rel, idx, arr) => (
                <button
                  key={rel.slug}
                  onClick={() => router.push(`/kids/library/${rel.slug}`)}
                  className={[
                    "flex items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-surface-muted",
                    idx < arr.length - 1 && "border-b border-border",
                  ].filter(Boolean).join(" ")}
                >
                  <div
                    className="flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center w-11 h-[58px] text-[26px]"
                    style={{ background: COVER_BG[rel.kind] }}
                    aria-hidden
                  >
                    {rel.iconEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black leading-tight truncate text-sm text-ink">{rel.title}</p>
                    <p className="font-medium text-xs text-ink-muted">{rel.titleUa}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="rounded-md px-2 py-0.5 font-bold text-[11px] bg-surface-muted text-ink">{rel.level}</span>
                    <span className="text-base text-ink-faint" aria-hidden>›</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </KidsPageShell>
  );
}
