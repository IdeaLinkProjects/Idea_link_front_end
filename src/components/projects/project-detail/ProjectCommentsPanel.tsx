import Link from "next/link";
import { type FormEvent, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Loader2, MoreVertical } from "lucide-react";
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
  if (diffDays < 30) return locale === "am" ? `ከ${diffDays} ቀን በፊት` : `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return locale === "am" ? `ከ${diffMonths} ወር በፊት` : `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;
  const diffYears = Math.floor(diffMonths / 12);
  return locale === "am" ? `ከ${diffYears} ዓመት በፊት` : `${diffYears} year${diffYears === 1 ? "" : "s"} ago`;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function commentInputClass(isDark: boolean): string {
  return `w-full resize-none bg-transparent text-sm outline-none transition placeholder:text-sm ${
    isDark
      ? "border-b border-white/20 text-zinc-100 placeholder:text-zinc-500 focus:border-primary-400"
      : "border-b border-zinc-300 text-zinc-900 placeholder:text-zinc-500 focus:border-primary-600"
  }`;
}

function ytActionBtnClass(isDark: boolean): string {
  return `rounded-full px-3 py-1.5 text-xs font-semibold transition ${
    isDark ? "text-zinc-300 hover:bg-white/10" : "text-zinc-700 hover:bg-zinc-100"
  }`;
}

function ytTextBtnClass(isDark: boolean, enabled: boolean): string {
  return `rounded-full px-4 py-1.5 text-sm font-semibold transition disabled:cursor-not-allowed ${
    enabled
      ? isDark
        ? "text-primary-300 hover:bg-primary-500/10"
        : "text-primary-700 hover:bg-primary-50"
      : isDark
        ? "text-zinc-600"
        : "text-zinc-400"
  }`;
}

type ProjectCommentsPanelProps = {
  campaignId: number;
  locale: Locale;
  isDark: boolean;
  isLoggedIn: boolean;
  t: CommentsCopy;
};

type CommentAvatarProps = {
  user: CampaignComment["user"];
  isDark: boolean;
  size?: "md" | "sm";
  label?: string;
};

function CommentAvatar({ user, isDark, size = "md", label }: CommentAvatarProps) {
  const dim = size === "sm" ? "h-6 w-6 text-[10px]" : "h-10 w-10 text-xs";

  if (user.profilePictureUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- profile picture URL from API
      <img
        src={user.profilePictureUrl}
        alt={label ?? ""}
        className={`${dim} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`flex ${dim} shrink-0 items-center justify-center rounded-full font-bold ${
        isDark ? "bg-primary-900/60 text-primary-200" : "bg-primary-100 text-primary-800"
      }`}
      aria-hidden={!label}
      aria-label={label}
    >
      {initials(user.fullName)}
    </div>
  );
}

type CommentActionMenuProps = {
  isDark: boolean;
  t: CommentsCopy;
  onEdit: () => void;
  onDelete: () => void;
};

function CommentActionMenu({ isDark, t, onEdit, onDelete }: CommentActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(ev: MouseEvent) {
      if (ref.current && !ref.current.contains(ev.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`rounded-full p-1.5 transition ${
          isDark ? "text-zinc-400 hover:bg-white/10 hover:text-zinc-200" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
        }`}
        aria-label={t.edit}
        aria-expanded={open}
      >
        <MoreVertical className="h-4 w-4" aria-hidden />
      </button>
      {open ? (
        <div
          role="menu"
          className={`absolute right-0 top-full z-20 mt-1 min-w-[9rem] overflow-hidden rounded-xl border py-1 shadow-lg ${
            isDark ? "border-white/10 bg-zinc-900 ring-1 ring-white/10" : "border-zinc-200 bg-white ring-1 ring-black/5"
          }`}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className={`block w-full px-4 py-2 text-left text-sm transition ${
              isDark ? "text-zinc-200 hover:bg-white/10" : "text-zinc-800 hover:bg-zinc-50"
            }`}
          >
            {t.edit}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className={`block w-full px-4 py-2 text-left text-sm transition ${
              isDark ? "text-red-300 hover:bg-red-500/10" : "text-red-700 hover:bg-red-50"
            }`}
          >
            {t.delete}
          </button>
        </div>
      ) : null}
    </div>
  );
}

type InlineComposerProps = {
  isDark: boolean;
  t: CommentsCopy;
  placeholder: string;
  submitLabel: string;
  cancelLabel: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (ev: FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  avatar: ReactNode;
  autoFocus?: boolean;
};

function InlineComposer({
  isDark,
  t,
  placeholder,
  submitLabel,
  cancelLabel,
  value,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
  avatar,
  autoFocus,
}: InlineComposerProps) {
  const hasText = value.trim().length > 0;

  return (
    <form onSubmit={onSubmit} className="flex gap-3">
      <div className="pt-0.5">{avatar}</div>
      <div className="min-w-0 flex-1">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={1}
          className={`${commentInputClass(isDark)} min-h-[2rem] py-1`}
          disabled={isSubmitting}
          autoFocus={autoFocus}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
          }}
        />
        <div className="mt-2 flex items-center justify-end gap-1">
          <button type="button" onClick={onCancel} disabled={isSubmitting} className={ytActionBtnClass(isDark)}>
            {cancelLabel}
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !hasText}
            className={ytTextBtnClass(isDark, hasText && !isSubmitting)}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                {t.submitting}
              </span>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

type CommentItemProps = {
  comment: CampaignComment;
  campaignId: number;
  locale: Locale;
  isDark: boolean;
  t: CommentsCopy;
  currentUserId: number | null;
  isReply?: boolean;
  onNotice: (tone: "ok" | "err", text: string) => void;
  composeAvatar?: ReactNode;
};

function CommentItem({
  comment,
  campaignId,
  locale,
  isDark,
  t,
  currentUserId,
  isReply = false,
  onNotice,
  composeAvatar,
}: CommentItemProps) {
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
  const displayName = isOwn ? t.youLabel : comment.user.fullName;

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

  const replyAvatar = composeAvatar;

  return (
    <article className="group">
      <div className={`flex gap-3 ${isReply ? "" : "py-1"}`}>
        <div className="pt-0.5">
          <CommentAvatar user={comment.user} isDark={isDark} size={isReply ? "sm" : "md"} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                <span className={`text-[13px] font-semibold leading-tight ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>
                  {displayName}
                </span>
                {comment.user.isInvestor ? (
                  <span
                    className={`rounded px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide ${
                      isDark ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {t.investorBadge}
                  </span>
                ) : null}
                {comment.user.isInnovator ? (
                  <span
                    className={`rounded px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide ${
                      isDark ? "bg-primary-500/15 text-primary-300" : "bg-primary-50 text-primary-700"
                    }`}
                  >
                    {t.innovatorBadge}
                  </span>
                ) : null}
                <span className={`text-xs ${muted}`}>{formatCommentTime(comment.createdAt, locale)}</span>
                {comment.isEdited ? <span className={`text-xs ${muted}`}>({t.editedLabel})</span> : null}
              </div>
            </div>
            {isOwn && !editing ? (
              <CommentActionMenu
                isDark={isDark}
                t={t}
                onEdit={() => {
                  setEditText(comment.comment);
                  setEditing(true);
                }}
                onDelete={() => setConfirmDeleteOpen(true)}
              />
            ) : null}
          </div>

          {editing ? (
            <form onSubmit={(ev) => void handleEdit(ev)} className="mt-2 space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
                className={`${commentInputClass(isDark)} py-1`}
                disabled={updating}
                autoFocus
              />
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setEditText(comment.comment);
                  }}
                  disabled={updating}
                  className={ytActionBtnClass(isDark)}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={updating || !editText.trim()}
                  className={ytTextBtnClass(isDark, Boolean(editText.trim()) && !updating)}
                >
                  {updating ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                      {t.submitting}
                    </span>
                  ) : (
                    t.save
                  )}
                </button>
              </div>
            </form>
          ) : (
            <p className={`mt-1 whitespace-pre-wrap text-sm leading-snug ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
              {comment.comment}
            </p>
          )}

          {!editing && isLoggedIn(currentUserId) ? (
            <div className="mt-1 flex items-center">
              <button type="button" onClick={() => setReplyOpen((v) => !v)} className={ytActionBtnClass(isDark)}>
                {t.reply}
              </button>
            </div>
          ) : null}

          {replyOpen && replyAvatar ? (
            <div className="mt-3">
              <InlineComposer
                isDark={isDark}
                t={t}
                placeholder={t.replyPlaceholder}
                submitLabel={t.submitReply}
                cancelLabel={t.cancelReply}
                value={replyText}
                onChange={setReplyText}
                onSubmit={(ev) => void handleReply(ev)}
                onCancel={() => {
                  setReplyOpen(false);
                  setReplyText("");
                }}
                isSubmitting={creatingReply}
                avatar={replyAvatar}
                autoFocus
              />
            </div>
          ) : null}

          {(comment.replies?.length ?? 0) > 0 ? (
            <div className={`mt-3 space-y-4 ${isReply ? "" : "border-l-2 pl-3"} ${isDark ? "border-white/10" : "border-zinc-200"}`}>
              {(comment.replies ?? []).map((reply) => (
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
                  composeAvatar={composeAvatar}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

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
  const [composeFocused, setComposeFocused] = useState(false);
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

  const totalComments = listQuery.data?.totalElements ?? comments.length;
  const hasMore = listQuery.data != null && !listQuery.data.last;
  const card = projectDetailCardClass(isDark);
  const muted = projectDetailMutedClass(isDark);
  const isInitialLoad = listQuery.isLoading && !listQuery.data;
  const isRefreshing = listQuery.isFetching && !isInitialLoad;

  const onNotice = useCallback((tone: "ok" | "err", text: string) => {
    setNotice({ tone, text });
    window.setTimeout(() => setNotice(null), 2800);
  }, []);

  const composeUser: CampaignComment["user"] = {
    id: currentUserId ?? 0,
    fullName: userStatus?.fullName ?? t.youLabel,
    profilePictureUrl: null,
    isInvestor: userStatus?.currentRoles.includes("INVESTOR") ?? false,
    isInnovator: userStatus?.currentRoles.includes("INNOVATOR") ?? false,
  };

  const composeAvatar = <CommentAvatar user={composeUser} isDark={isDark} size="md" label={composeUser.fullName} />;

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
      setComposeFocused(false);
      setPage(0);
      onNotice("ok", t.createSuccess);
    } catch (err) {
      onNotice("err", extractApiErrorMessage(err, t.createFailed));
    }
  }

  const showComposeActions = composeFocused || composeText.length > 0;

  const composeSection = loggedIn ? (
    <div className="flex gap-3">
      <div className="pt-0.5">{composeAvatar}</div>
      <form onSubmit={(ev) => void handleCompose(ev)} className="min-w-0 flex-1">
        <textarea
          id="campaign-comment-compose"
          value={composeText}
          onChange={(e) => setComposeText(e.target.value)}
          onFocus={() => setComposeFocused(true)}
          placeholder={t.composePlaceholder}
          rows={1}
          className={`${commentInputClass(isDark)} min-h-[2.5rem] py-2`}
          disabled={creating}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
          }}
        />
        {showComposeActions ? (
          <div className="mt-2 flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => {
                setComposeText("");
                setComposeFocused(false);
              }}
              disabled={creating}
              className={ytActionBtnClass(isDark)}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={creating || !composeText.trim()}
              className={ytTextBtnClass(isDark, Boolean(composeText.trim()) && !creating)}
            >
              {creating ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  {t.submitting}
                </span>
              ) : (
                t.submit
              )}
            </button>
          </div>
        ) : null}
      </form>
    </div>
  ) : (
    <div className={`flex flex-col items-start gap-3 rounded-2xl border border-dashed p-5 sm:flex-row sm:items-center sm:justify-between ${card}`}>
      <p className={`text-sm ${muted}`}>{t.signInHint}</p>
      <Link
        href="/login"
        className={`inline-flex shrink-0 items-center rounded-full px-5 py-2 text-sm font-semibold text-white transition ${
          isDark ? "bg-primary-600 hover:bg-primary-500" : "bg-primary-950 hover:bg-primary-900"
        }`}
      >
        {t.signInCta}
      </Link>
    </div>
  );

  if (isInitialLoad) {
    return (
      <div className="mt-8 space-y-6">
        {composeSection}
        <ul className="space-y-6 animate-pulse" aria-busy="true">
          <li className="flex gap-3">
            <div className={`h-10 w-10 shrink-0 rounded-full ${isDark ? "bg-zinc-800/80" : "bg-zinc-200"}`} />
            <div className="flex-1 space-y-2 pt-1">
              <div className={`h-3 w-32 rounded ${isDark ? "bg-zinc-800/80" : "bg-zinc-200"}`} />
              <div className={`h-3 w-full rounded ${isDark ? "bg-zinc-800/60" : "bg-zinc-100"}`} />
              <div className={`h-3 w-4/5 rounded ${isDark ? "bg-zinc-800/60" : "bg-zinc-100"}`} />
            </div>
          </li>
          <li className="flex gap-3">
            <div className={`h-10 w-10 shrink-0 rounded-full ${isDark ? "bg-zinc-800/80" : "bg-zinc-200"}`} />
            <div className="flex-1 space-y-2 pt-1">
              <div className={`h-3 w-28 rounded ${isDark ? "bg-zinc-800/80" : "bg-zinc-200"}`} />
              <div className={`h-3 w-full rounded ${isDark ? "bg-zinc-800/60" : "bg-zinc-100"}`} />
            </div>
          </li>
        </ul>
      </div>
    );
  }

  if (listQuery.isError) {
    return (
      <div className="mt-8 space-y-6">
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
    <div className="mt-8 space-y-6">
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

      {comments.length > 0 ? (
        <p className={`text-sm font-semibold ${isDark ? "text-zinc-200" : "text-zinc-900"}`}>
          {(totalComments === 1 ? t.commentCountOne : t.commentCount).replace("{count}", String(totalComments))}
        </p>
      ) : null}

      {comments.length === 0 ? (
        <p className={`py-8 text-center text-sm ${muted} ${isRefreshing ? "opacity-60" : ""}`}>{t.emptyList}</p>
      ) : (
        <div className={`space-y-5 transition-opacity ${isRefreshing ? "pointer-events-none opacity-60" : ""}`} aria-busy={isRefreshing}>
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
              composeAvatar={composeAvatar}
            />
          ))}
        </div>
      )}

      {hasMore ? (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={listQuery.isFetching}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition disabled:opacity-60 ${ytActionBtnClass(isDark)}`}
          >
            {listQuery.isFetching ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                {t.submitting}
              </span>
            ) : (
              t.loadMore
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}
