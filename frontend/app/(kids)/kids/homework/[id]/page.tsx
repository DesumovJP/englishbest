"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { KidsPageShell } from "@/components/ui/shells";
import { KidsPageHeader, KidsButton, KidsCard } from "@/components/kids/ui";
import {
  fetchSubmission,
  updateMySubmission,
  type Submission,
  type SubmissionStatus,
} from "@/lib/homework";

function isReadonly(s: SubmissionStatus): boolean {
  return s === "submitted" || s === "reviewed";
}

function statusLabel(s: SubmissionStatus): string {
  switch (s) {
    case "notStarted": return "Новe завдання";
    case "inProgress": return "Ти над цим працюєш";
    case "submitted":  return "Відправлено вчителю ✅";
    case "reviewed":   return "Перевірено ✨";
    case "returned":   return "Повернено на доробку";
    case "overdue":    return "Прострочено";
  }
}

function dueLabel(iso: string | null): string {
  if (!iso) return "без дедлайну";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `до ${d.toLocaleDateString("uk-UA", { day: "numeric", month: "long" })}`;
}

export default function KidsHomeworkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [sub,    setSub]    = useState<Submission | null>(null);
  const [load,   setLoad]   = useState<"loading" | "error" | "ready">("loading");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState<"idle" | "draft" | "submit">("idle");
  const [err,    setErr]    = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchSubmission(id)
      .then((s) => {
        if (!alive) return;
        if (!s) { setLoad("error"); return; }
        setSub(s);
        const existing = s.answers && typeof s.answers === "object" ? (s.answers as Record<string, unknown>).text : "";
        setAnswer(typeof existing === "string" ? existing : "");
        setLoad("ready");
      })
      .catch(() => alive && setLoad("error"));
    return () => { alive = false; };
  }, [id]);

  const readonly = useMemo(() => (sub ? isReadonly(sub.status) : true), [sub]);

  async function persist(nextStatus: "inProgress" | "submitted") {
    if (!sub) return;
    setSaving(nextStatus === "submitted" ? "submit" : "draft");
    setErr(null);
    try {
      const updated = await updateMySubmission(sub.documentId, {
        answers: { text: answer },
        status: nextStatus,
      });
      setSub(updated);
      if (nextStatus === "submitted") {
        router.push("/kids/homework");
      }
    } catch (e) {
      setErr((e as Error).message || "Не вдалося зберегти");
    } finally {
      setSaving("idle");
    }
  }

  return (
    <KidsPageShell
      header={<KidsPageHeader title="Завдання" backHref="/kids/homework" />}
    >
      <div className="max-w-screen-sm mx-auto flex flex-col gap-4 py-4">
        {load === "loading" && (
          <div className="flex justify-center py-16 text-ink-muted text-sm">Завантаження…</div>
        )}

        {load === "error" && (
          <KidsCard variant="default" className="p-6 text-center">
            <p className="font-black text-ink text-base">Завдання не знайдено</p>
            <KidsButton variant="ghost" size="sm" href="/kids/homework" className="mt-4">
              На список
            </KidsButton>
          </KidsCard>
        )}

        {load === "ready" && sub && (
          <>
            {/* Brief */}
            <KidsCard variant="hero" className="p-5">
              <p className="text-primary-dark text-[11px] font-black uppercase tracking-wider">
                {statusLabel(sub.status)}
              </p>
              <h2 className="font-black text-ink text-xl leading-tight mt-1">
                {sub.homework?.title ?? "Без назви"}
              </h2>
              <p className="text-ink-muted text-[12px] font-bold mt-1">
                {dueLabel(sub.homework?.dueAt ?? null)}
              </p>
              {sub.homework?.description && (
                <p className="text-ink text-[13px] mt-3 leading-snug whitespace-pre-wrap">
                  {sub.homework.description}
                </p>
              )}
            </KidsCard>

            {/* Teacher feedback (if reviewed / returned) */}
            {sub.teacherFeedback && (
              <KidsCard variant="flat" className="p-4">
                <p className="text-[11px] font-black uppercase text-ink-faint tracking-wider">
                  Коментар вчителя
                </p>
                <p className="text-ink text-[14px] mt-1 whitespace-pre-wrap">
                  {sub.teacherFeedback}
                </p>
                {sub.score !== null && (
                  <p className="font-black text-primary-dark text-[15px] mt-2">
                    Оцінка: {sub.score}
                  </p>
                )}
              </KidsCard>
            )}

            {/* Answer editor */}
            <KidsCard variant="default" className="p-4">
              <label className="text-[11px] font-black uppercase text-ink-faint tracking-wider">
                Твоя відповідь
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                readOnly={readonly}
                rows={8}
                placeholder="Напиши відповідь тут…"
                className={[
                  "mt-2 w-full rounded-2xl p-3 text-[14px] leading-relaxed outline-none",
                  "bg-surface-muted border-2 border-border",
                  "focus:border-primary focus:bg-surface",
                  readonly && "opacity-80 cursor-not-allowed",
                ].filter(Boolean).join(" ")}
              />

              {err && (
                <p className="text-danger text-[12px] font-bold mt-2">{err}</p>
              )}

              {!readonly && (
                <div className="flex gap-2 mt-3">
                  <KidsButton
                    variant="ghost"
                    size="md"
                    fullWidth
                    onClick={() => persist("inProgress")}
                    disabled={saving !== "idle" || answer.trim().length === 0}
                  >
                    {saving === "draft" ? "Зберігаю…" : "Зберегти чернетку"}
                  </KidsButton>
                  <KidsButton
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={() => persist("submitted")}
                    disabled={saving !== "idle" || answer.trim().length === 0}
                  >
                    {saving === "submit" ? "Відправляю…" : "Здати ✈️"}
                  </KidsButton>
                </div>
              )}

              {readonly && (
                <p className="text-ink-muted text-[12px] font-bold text-center mt-3">
                  {sub.status === "reviewed"
                    ? "Роботу перевірено — зміни вже не можна"
                    : "Роботу надіслано вчителю"}
                </p>
              )}
            </KidsCard>
          </>
        )}
      </div>
    </KidsPageShell>
  );
}
