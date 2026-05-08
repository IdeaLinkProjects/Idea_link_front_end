import { type FormEvent, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { messages, type Locale } from "@/locales";
import type { CampaignUpdate } from "@/store";
import {
  useCreateCampaignUpdateMutation,
  useDeleteCampaignUpdateMutation,
  useGetCampaignUpdatesQuery,
} from "@/store";

type UpdatesCopy = (typeof messages)["en"]["campaignDetailPage"]["updates"];

type ContentRow = { key: string; value: string };

function sortUpdates(list: CampaignUpdate[]): CampaignUpdate[] {
  return [...list].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    const ta = new Date(a.postedAt).getTime();
    const tb = new Date(b.postedAt).getTime();
    return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
  });
}

function formatPostedAt(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(locale === "am" ? "am-ET" : "en-ET", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function rowsToContent(rows: ContentRow[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const row of rows) {
    const k = row.key.trim();
    if (!k) continue;
    out[k] = row.value;
  }
  return out;
}

type CampaignUpdatesPanelProps = {
  campaignId: number;
  locale: Locale;
  isDark: boolean;
  t: UpdatesCopy;
  errors: (typeof messages)["en"]["campaignDetailPage"]["errors"];
  cancelAction: string;
  confirmDelete: string;
  deleting: string;
};

export function CampaignUpdatesPanel({
  campaignId,
  locale,
  isDark,
  t,
  errors,
  cancelAction,
  confirmDelete,
  deleting,
}: CampaignUpdatesPanelProps) {
  const listQuery = useGetCampaignUpdatesQuery(campaignId);
  const [createUpdate, { isLoading: creating }] = useCreateCampaignUpdateMutation();
  const [deleteUpdate, { isLoading: deletingUpdate }] = useDeleteCampaignUpdateMutation();

  const [composeOpen, setComposeOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [contentRows, setContentRows] = useState<ContentRow[]>([{ key: "", value: "" }]);
  const [notice, setNotice] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [updateToDelete, setUpdateToDelete] = useState<CampaignUpdate | null>(null);

  const cardClass = isDark
    ? "rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-950/90"
    : "rounded-3xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-primary-50/30";

  const inputClass = `w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary-500/40 ${
    isDark ? "border-white/10 bg-black/25 text-zinc-100 placeholder:text-zinc-500" : "border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400"
  }`;

  const labelClass = `mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`;

  const secondaryBtnClass = `rounded-xl border px-4 py-2 text-sm font-semibold transition ${
    isDark ? "border-white/15 text-zinc-100 hover:bg-white/10" : "border-zinc-300 text-zinc-800 hover:bg-zinc-100"
  }`;

  const dangerOutlineClass = `rounded-xl border px-3 py-1.5 text-xs font-semibold ${
    isDark ? "border-red-500/50 text-red-200 hover:bg-red-500/10" : "border-red-300 text-red-700 hover:bg-red-50"
  }`;

  const primaryBtnClass = `rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
    isDark ? "bg-primary-600 hover:bg-primary-500" : "bg-primary-950 hover:bg-primary-900"
  }`;

  const sorted = useMemo(() => sortUpdates(listQuery.data ?? []), [listQuery.data]);

  function resetComposeForm() {
    setTitle("");
    setIsPinned(false);
    setContentRows([{ key: "", value: "" }]);
  }

  function closeCompose() {
    setComposeOpen(false);
    resetComposeForm();
  }

  function addContentRow() {
    setContentRows((prev) => [...prev, { key: "", value: "" }]);
  }

  function removeContentRow(index: number) {
    setContentRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function setRow(index: number, field: keyof ContentRow, value: string) {
    setContentRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setNotice(null);
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setNotice({ tone: "err", text: t.titleRequired });
      return;
    }
    const content = rowsToContent(contentRows);
    try {
      await createUpdate({
        campaignId,
        body: { title: trimmedTitle, content, isPinned },
      }).unwrap();
      setComposeOpen(false);
      resetComposeForm();
      setNotice({ tone: "ok", text: t.createSuccess });
      window.setTimeout(() => setNotice(null), 4000);
    } catch (err) {
      setNotice({ tone: "err", text: extractApiErrorMessage(err, errors.createUpdateFailed) });
    }
  }

  async function handleDeleteConfirmed() {
    if (!updateToDelete) return;
    setNotice(null);
    try {
      await deleteUpdate({ campaignId, updateId: updateToDelete.id }).unwrap();
      setUpdateToDelete(null);
      setNotice({ tone: "ok", text: t.deleteSuccess });
      window.setTimeout(() => setNotice(null), 4000);
    } catch (err) {
      setNotice({ tone: "err", text: extractApiErrorMessage(err, errors.deleteUpdateFailed) });
      setUpdateToDelete(null);
    }
  }

  const contentEntries = (u: CampaignUpdate) =>
    u.content && typeof u.content === "object" ? Object.entries(u.content as Record<string, string>) : [];

  return (
    <div className="space-y-5">
      {notice ? (
        <div
          role="status"
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            notice.tone === "ok"
              ? isDark
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
              : isDark
                ? "border-red-500/40 bg-red-500/10 text-red-200"
                : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {notice.text}
        </div>
      ) : null}

      {!composeOpen ? (
        <div className={`${cardClass} flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5`}>
          <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.addUpdateHint}</p>
          <button type="button" onClick={() => setComposeOpen(true)} className={primaryBtnClass}>
            {t.addUpdate}
          </button>
        </div>
      ) : (
        <section className={`${cardClass} p-5 sm:p-6`}>
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.composeTitle}</h2>
              <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.composeSubtitle}</p>
            </div>
            <button type="button" onClick={closeCompose} className={secondaryBtnClass}>
              {t.cancelCompose}
            </button>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label htmlFor="campaign-update-title" className={labelClass}>
              {t.titleLabel}
            </label>
            <input
              id="campaign-update-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.titlePlaceholder}
              className={inputClass}
              maxLength={500}
            />
          </div>

          <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-zinc-200 bg-white/80"}`}>
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-400 text-primary-600 focus:ring-primary-500"
            />
            <span className={`text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{t.pinnedLabel}</span>
          </label>

          <div>
            <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className={`text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{t.contentHeading}</p>
                <p className={`mt-0.5 text-xs ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>{t.contentHint}</p>
              </div>
              <button type="button" onClick={addContentRow} className={secondaryBtnClass}>
                {t.addField}
              </button>
            </div>
            <div className="space-y-3">
              {contentRows.map((row, index) => (
                <div
                  key={`row-${index}`}
                  className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-black/20" : "border-zinc-200 bg-zinc-50/80"}`}
                >
                  <div className="mb-3 flex justify-between gap-2">
                    <span className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                      {t.fieldGroupLabel.replace("{n}", String(index + 1))}
                    </span>
                    <button type="button" onClick={() => removeContentRow(index)} className={`text-xs font-semibold ${isDark ? "text-red-300 hover:text-red-200" : "text-red-600 hover:text-red-700"}`}>
                      {t.removeField}
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor={`upd-key-${index}`} className={labelClass}>
                        {t.fieldKey}
                      </label>
                      <input id={`upd-key-${index}`} type="text" value={row.key} onChange={(e) => setRow(index, "key", e.target.value)} placeholder={t.fieldKeyPlaceholder} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor={`upd-val-${index}`} className={labelClass}>
                        {t.fieldValue}
                      </label>
                      <input id={`upd-val-${index}`} type="text" value={row.value} onChange={(e) => setRow(index, "value", e.target.value)} placeholder={t.fieldValuePlaceholder} className={inputClass} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition sm:w-auto ${
              isDark ? "bg-primary-600 hover:bg-primary-500 disabled:bg-primary-600/50" : "bg-primary-950 hover:bg-primary-900 disabled:bg-primary-950/50"
            } disabled:cursor-not-allowed`}
          >
            {creating ? t.submitting : t.submit}
          </button>
        </form>
        </section>
      )}

      <section className={`${cardClass} p-5 sm:p-6`}>
        <div className="mb-4">
          <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.listTitle}</h2>
          <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.listSubtitle}</p>
        </div>

        {listQuery.isLoading || listQuery.isFetching ? (
          <div className="space-y-3 animate-pulse">
            <div className={`h-24 rounded-2xl ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />
            <div className={`h-24 rounded-2xl ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />
          </div>
        ) : listQuery.isError ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
            <p className={`text-sm ${isDark ? "text-red-200" : "text-red-800"}`}>{extractApiErrorMessage(listQuery.error, errors.loadUpdatesFailed)}</p>
            <button
              type="button"
              onClick={() => listQuery.refetch()}
              className={`mt-3 text-sm font-semibold underline ${isDark ? "text-primary-300" : "text-primary-700"}`}
            >
              {t.retry}
            </button>
          </div>
        ) : sorted.length === 0 ? (
          <p className={`rounded-2xl border border-dashed px-4 py-8 text-center text-sm ${isDark ? "border-white/15 text-zinc-400" : "border-zinc-300 text-zinc-600"}`}>{t.emptyList}</p>
        ) : (
          <ul className="space-y-4">
            {sorted.map((u) => (
              <li
                key={u.id}
                className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 ${
                  u.isPinned
                    ? isDark
                      ? "border-primary-500/40 bg-gradient-to-br from-primary-950/50 to-zinc-900/80"
                      : "border-primary-200 bg-gradient-to-br from-primary-50 to-white"
                    : isDark
                      ? "border-white/10 bg-white/[0.03]"
                      : "border-zinc-200 bg-white/90"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{u.title}</h3>
                      {u.isPinned ? (
                        <span className="rounded-full bg-primary-600/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">{t.pinnedBadge}</span>
                      ) : null}
                    </div>
                    <p className={`mt-1 text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                      {t.postedLabel}: {formatPostedAt(u.postedAt, locale)}
                    </p>
                  </div>
                  <button type="button" onClick={() => setUpdateToDelete(u)} className={dangerOutlineClass}>
                    {t.delete}
                  </button>
                </div>
                {contentEntries(u).length ? (
                  <dl className={`mt-4 space-y-2 border-t pt-4 ${isDark ? "border-white/10" : "border-zinc-200"}`}>
                    {contentEntries(u).map(([k, v]) => (
                      <div key={k}>
                        <dt className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{k}</dt>
                        <dd className={`mt-0.5 text-sm leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>{v}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className={`mt-3 text-sm italic ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{t.noContentBody}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={updateToDelete != null}
        title={t.confirmDeleteTitle}
        description={t.confirmDeleteBody}
        cancelLabel={cancelAction}
        confirmLabel={confirmDelete}
        submittingLabel={deleting}
        onCancel={() => setUpdateToDelete(null)}
        onConfirm={() => void handleDeleteConfirmed()}
        isDark={isDark}
        variant="danger"
        isSubmitting={deletingUpdate}
      >
        {updateToDelete ? (
          <p className={`text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{updateToDelete.title}</p>
        ) : null}
      </ConfirmDialog>
    </div>
  );
}
