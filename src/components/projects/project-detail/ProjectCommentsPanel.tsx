import Link from "next/link";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Loader2, MessageCircle, Pencil, Reply, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import type { Locale, messages } from "@/locales";
import type { CampaignComment } from "@/store";
import {
  useCreateCampaignCommentMutation,
  useDeleteCampaignCommentMutation,
  useGetCampaignCommentsQuery,
  useGetUserRolesStatusQuery,
  useUpdateCampaignCommentMutation,
} from "@/store";
import { projectDetailCardClass, projectDetailMutedClass } from "./projectDetailClassNames";

type CommentsCopy = (typeof messages)["en"]["projectDetail"]["comments"];

const PAGE_SIZE = 20;

function formatCommentTime(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return locale === "am" ? "አሁን" : "Just now";
  if (diffMins < 60) return locale === "am" ? `ከ${diffMins} ደቂቃ በፊት` : `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return locale === "am" ? `ከ${diffHours} ሰዓት በፊት` : `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return locale === "am" ? `ከ${diffDays} ቀን በፊት` : `${diffDays}d ago`;
  return d.toLocaleDateString(locale === "am" ? "am-ET" : "en-ET", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

type ProjectCommentsPanelProps = {
  campaignId: number;
  locale: Locale;
  isDark: boolean;
  isLoggedIn: boolean;
  t: CommentsCopy;
};

type CommentItemProps = {
  comment: CampaignComment;
  campaignId: number;
  locale: Locale;
  isDark: boolean;
  t: CommentsCopy;
  currentUserId: number | null;
  isReply?: boolean;
  onNotice: (tone: "ok" | "err", text: string) => void;
};

function CommentAvatar({ user, isDark }: { user: CampaignComment["user"]; isDark: boolean }) {
  if (user.profilePictureUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- profile picture URL from API
      <img
        src={user.profilePictureUrl}
        alt=""
        className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white/10"
      />
    );
  }
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
        isDark ? "bg-primary-900/60 text-primary-200 ring-2 ring-primary-500/20" : "bg-primary-100 text-primary-800 ring-2 ring-primary-200/60"
      }`}
      aria-hidden
    >
      {initials(user.fullName)}
    </div>
  );
}

function CommentItem({ comment, campaignId, locale, isDark, t, currentUserId, isReply = false, onNotice }: CommentItemProps) {
  const [createComment, { isLoading: creatingReply }] = useCreateCampaignCommentMutation();
  const [updateComment, { isLoading: updating }] = useUpdateCampaignCommentMutation();
  const [deleteComment, { isLoading: deleting }] = useDeleteCampaignCommentMutation();

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.comment);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const isOwn = currentUserId != null && comment.user.id === currentUserId;
  const muted = projectDetailMutedClass(isDark);
  const card = projectDetailCardClass(isDark);

  const actionBtn = `inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition ${
    isDark ? "text-zinc-400 hover:bg-white/10 hover:text-zinc-200" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
  }`;

  const inputClass = `w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary-500/40 ${
    isDark ? "border-white/10 bg-black/25 text-zinc-100 placeholder:text-zinc-500" : "border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400"
  }`;

  const primaryBtn = `inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
    isDark ? "bg-primary-600 hover:bg-primary-500" : "bg-primary-950 hover:bg-primary-900"
  }`;

  async function handleReply(ev: FormEvent) {
    ev.preventDefault();
    const body = replyText.trim();
    if (!body) {
      onNotice("err", t.bodyRequired);
      return;
    }
    try {
      await createComment({ campaignId, body: { comment: body, parentCommentId: comment.id } }).unwrap();
      setReplyText("");
      setReplyOpen(false);
      onNotice("ok", t.createSuccess);
    } catch (err) {
      onNotice("err", extractApiErrorMessage(err, t.createFailed));
    }
  }

  async function handleEdit(ev: FormEvent) {
    ev.preventDefault();
    const body = editText.trim();
    if (!body) {
      onNotice("err", t.bodyRequired);
      return;
    }
    try {
      await updateComment({ campaignId, commentId: comment.id, body: { comment: body } }).unwrap();
      setEditing(false);
      onNotice("ok", t.updateSuccess);
    } catch (err) {
      onNotice("err", extractApiErrorMessage(err, t.updateFailed));
    }
  }

  async function handleDelete() {
    try {
      await deleteComment({ campaignId, commentId: comment.id }).unwrap();
      setConfirmDeleteOpen(false);
      onNotice("ok", t.deleteSuccess);
    } catch (err) {
      onNotice("err", extractApiErrorMessage(err, t.deleteFailed));
    }
  }

  return (
    <article className={isReply ? "relative pl-4 sm:pl-5" : undefined}>
      {isReply ? (
        <div
          className={`absolute left-0 top-0 h-full w-0.5 rounded-full ${isDark ? "bg-gradient-to-b from-primary-500/40 to-white/10" : "bg-gradient-to-b from-primary-300 to-zinc-200"}`}
          aria-hidden
        />
      ) : null}
      <div className={`group rounded-2xl border p-4 transition sm:p-5 ${card} ${isDark ? "hover:border-white/15" : "hover:border-zinc-300"}`}>
        <div className="flex gap-3">
          <CommentAvatar user={comment.user} isDark={isDark} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className={`text-sm font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>
                {isOwn ? t.youLabel : comment.user.fullName}
              </span>
              {comment.user.isInvestor ? (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${isDark ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-50 text-emerald-700"}`}>
                  {t.investorBadge}
                </span>
              ) : null}
              {comment.user.isInnovator ? (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${isDark ? "bg-primary-500/15 text-primary-300" : "bg-primary-50 text-primary-700"}`}>
                  {t.innovatorBadge}
                </span>
              ) : null}
              <span className={`text-xs ${muted}`}>{formatCommentTime(comment.createdAt, locale)}</span>
              {comment.isEdited ? <span className={`text-xs italic ${muted}`}>{t.editedLabel}</span> : null}
            </div>

            {editing ? (
              <form onSubmit={(ev) => void handleEdit(ev)} className="mt-3 space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={3}
                  className={inputClass}
                  disabled={updating}
                />
                <div className="flex flex-wrap gap-2">
                  <button type="submit" disabled={updating} className={primaryBtn}>
                    {updating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                    {t.save}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setEditText(comment.comment);
                    }}
                    disabled={updating}
                    className={actionBtn}
                  >
                    {t.cancel}
                  </button>
                </div>
              </form>
            ) : (
              <p className={`mt-2 whitespace-pre-wrap text-sm leading-relaxed sm:text-[0.95rem] ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
                {comment.comment}
              </p>
            )}

            {!editing && isLoggedIn(currentUserId) ? (
              <div className="mt-3 flex flex-wrap items-center gap-1 opacity-80 transition group-hover:opacity-100">
                <button type="button" onClick={() => setReplyOpen((v) => !v)} className={actionBtn}>
                  <Reply className="h-3.5 w-3.5" aria-hidden />
                  {t.reply}
                </button>
                {isOwn ? (
                  <>
                    <button type="button" onClick={() => setEditing(true)} className={actionBtn}>
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                      {t.edit}
                    </button>
                    <button type="button" onClick={() => setConfirmDeleteOpen(true)} className={`${actionBtn} ${isDark ? "hover:text-red-300" : "hover:text-red-700"}`}>
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      {t.delete}
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}

            {replyOpen ? (
              <form onSubmit={(ev) => void handleReply(ev)} className="mt-4 space-y-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={t.replyPlaceholder}
                  rows={2}
                  className={inputClass}
                  disabled={creatingReply}
                  autoFocus
                />
                <div className="flex flex-wrap gap-2">
                  <button type="submit" disabled={creatingReply} className={primaryBtn}>
                    {creatingReply ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                    {t.submitReply}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyOpen(false);
                      setReplyText("");
                    }}
                    disabled={creatingReply}
                    className={actionBtn}
                  >
                    {t.cancelReply}
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      </div>

      {comment.replies.length > 0 ? (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              campaignId={campaignId}
              locale={locale}
              isDark={isDark}
              t={t}
              currentUserId={currentUserId}
              isReply
              onNotice={onNotice}
            />
          ))}
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmDeleteOpen}
        title={t.confirmDeleteTitle}
        description={t.confirmDeleteBody}
        cancelLabel={t.cancel}
        confirmLabel={t.delete}
        submittingLabel={t.submitting}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        isDark={isDark}
        variant="danger"
        isSubmitting={deleting}
      />
    </article>
  );
}

function isLoggedIn(currentUserId: number | null): currentUserId is number {
  return currentUserId != null;
}

export function ProjectCommentsPanel({ campaignId, locale, isDark, isLoggedIn: loggedIn, t }: ProjectCommentsPanelProps) {
  const [page, setPage] = useState(0);
  const [composeText, setComposeText] = useState("");
  const [notice, setNotice] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const { data: userStatus } = useGetUserRolesStatusQuery(undefined, { skip: !loggedIn });
  const currentUserId = userStatus?.userId ?? null;

  const listQuery = useGetCampaignCommentsQuery({ campaignId, page, size: PAGE_SIZE });
  const [createComment, { isLoading: creating }] = useCreateCampaignCommentMutation();
  const [comments, setComments] = useState<CampaignComment[]>([]);

  useEffect(() => {
    setPage(0);
    setComments([]);
  }, [campaignId]);

  useEffect(() => {
    const batch = listQuery.data?.content;
    if (!batch) return;
    setComments((prev) => {
      if (page === 0) return batch;
      const seen = new Set(prev.map((c) => c.id));
      const next = batch.filter((c) => !seen.has(c.id));
      return next.length > 0 ? [...prev, ...next] : prev;
    });
  }, [listQuery.data, page]);

  const hasMore = listQuery.data != null && !listQuery.data.last;
  const card = projectDetailCardClass(isDark);
  const muted = projectDetailMutedClass(isDark);
  const isInitialLoad = listQuery.isLoading && !listQuery.data;
  const isRefreshing = listQuery.isFetching && !isInitialLoad;

  const onNotice = useCallback((tone: "ok" | "err", text: string) => {
    setNotice({ tone, text });
    window.setTimeout(() => setNotice(null), 2800);
  }, []);

  const inputClass = `w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary-500/40 ${
    isDark ? "border-white/10 bg-black/25 text-zinc-100 placeholder:text-zinc-500" : "border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400"
  }`;

  const primaryBtn = `inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
    isDark ? "bg-primary-600 hover:bg-primary-500" : "bg-primary-950 hover:bg-primary-900"
  }`;

  async function handleCompose(ev: FormEvent) {
    ev.preventDefault();
    const body = composeText.trim();
    if (!body) {
      onNotice("err", t.bodyRequired);
      return;
    }
    try {
      await createComment({ campaignId, body: { comment: body } }).unwrap();
      setComposeText("");
      setPage(0);
      onNotice("ok", t.createSuccess);
    } catch (err) {
      onNotice("err", extractApiErrorMessage(err, t.createFailed));
    }
  }

  const composeSection = loggedIn ? (
    <form onSubmit={(ev) => void handleCompose(ev)} className={`rounded-2xl border p-4 sm:p-5 ${card}`}>
      <label htmlFor="campaign-comment-compose" className={`mb-2 block text-sm font-semibold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
        {t.submit}
      </label>
      <textarea
        id="campaign-comment-compose"
        value={composeText}
        onChange={(e) => setComposeText(e.target.value)}
        placeholder={t.composePlaceholder}
        rows={3}
        className={inputClass}
        disabled={creating}
      />
      <div className="mt-3 flex justify-end">
        <button type="submit" disabled={creating || !composeText.trim()} className={primaryBtn}>
          {creating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <MessageCircle className="h-4 w-4" aria-hidden />}
          {creating ? t.submitting : t.submit}
        </button>
      </div>
    </form>
  ) : (
    <div className={`flex flex-col items-start gap-3 rounded-2xl border border-dashed p-5 sm:flex-row sm:items-center sm:justify-between ${card}`}>
      <p className={`text-sm ${muted}`}>{t.signInHint}</p>
      <Link
        href="/login"
        className={`inline-flex shrink-0 items-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
          isDark ? "bg-primary-600 hover:bg-primary-500" : "bg-primary-950 hover:bg-primary-900"
        }`}
      >
        {t.signInCta}
      </Link>
    </div>
  );

  if (isInitialLoad) {
    return (
      <div className="mt-8 space-y-5">
        {composeSection}
        <ul className="space-y-4 animate-pulse" aria-busy="true">
          <li className={`h-28 rounded-2xl ${isDark ? "bg-zinc-800/80" : "bg-zinc-200"}`} />
          <li className={`h-28 rounded-2xl ${isDark ? "bg-zinc-800/80" : "bg-zinc-200"}`} />
        </ul>
      </div>
    );
  }

  if (listQuery.isError) {
    return (
      <div className="mt-8 space-y-5">
        {composeSection}
        <div className={`rounded-2xl border p-5 sm:p-6 ${card} ${isDark ? "border-red-500/30 bg-red-500/5" : "border-red-200 bg-red-50"}`}>
          <p className={`text-sm ${isDark ? "text-red-200" : "text-red-800"}`}>{extractApiErrorMessage(listQuery.error, t.loadFailed)}</p>
          <button
            type="button"
            onClick={() => void listQuery.refetch()}
            className={`mt-3 text-sm font-semibold underline ${isDark ? "text-primary-300" : "text-primary-700"}`}
          >
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-5">
      {notice ? (
        <p
          role="status"
          className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
            notice.tone === "ok"
              ? isDark
                ? "bg-emerald-500/15 text-emerald-200"
                : "bg-emerald-50 text-emerald-800"
              : isDark
                ? "bg-red-500/15 text-red-200"
                : "bg-red-50 text-red-800"
          }`}
        >
          {notice.text}
        </p>
      ) : null}

      {composeSection}

      {comments.length === 0 ? (
        <p className={`rounded-2xl border border-dashed px-4 py-10 text-center text-sm ${muted} ${card} ${isRefreshing ? "opacity-60" : ""}`}>
          {t.emptyList}
        </p>
      ) : (
        <div className={`space-y-4 transition-opacity ${isRefreshing ? "pointer-events-none opacity-60" : ""}`} aria-busy={isRefreshing}>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              campaignId={campaignId}
              locale={locale}
              isDark={isDark}
              t={t}
              currentUserId={currentUserId}
              onNotice={onNotice}
            />
          ))}
        </div>
      )}

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={listQuery.isFetching}
            className={`inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
              isDark ? "border-white/15 text-zinc-100 hover:bg-white/10" : "border-zinc-300 text-zinc-800 hover:bg-zinc-100"
            }`}
          >
            {listQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {t.loadMore}
          </button>
        </div>
      ) : null}
    </div>
  );
}
