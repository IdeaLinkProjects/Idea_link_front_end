import { type ReactNode, useEffect, useId } from "react";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  cancelLabel: string;
  confirmLabel: string;
  submittingLabel?: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  isDark: boolean;
  /** Red destructive confirm button */
  variant?: "danger" | "neutral";
  isSubmitting?: boolean;
};

export function ConfirmDialog({
  open,
  title,
  description,
  children,
  cancelLabel,
  confirmLabel,
  submittingLabel,
  onCancel,
  onConfirm,
  isDark,
  variant = "danger",
  isSubmitting = false,
}: ConfirmDialogProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape" && !isSubmitting) onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isSubmitting, onCancel]);

  if (!open) return null;

  const shell = isDark ? "border-white/15 bg-zinc-950 text-zinc-100" : "border-zinc-200 bg-white text-zinc-900";
  const cancelBtn = isDark
    ? "rounded-xl border border-zinc-600 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10"
    : "rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50";
  const confirmNeutral = isDark
    ? "rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500 disabled:opacity-60"
    : "rounded-xl bg-primary-950 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-900 disabled:opacity-60";
  const confirmDanger =
    "rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={() => {
        if (!isSubmitting) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`w-full max-w-md rounded-2xl border p-6 shadow-xl ${shell}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id={titleId} className={`text-lg font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>
          {title}
        </h3>
        {description ? (
          <div className={`mt-2 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{description}</div>
        ) : null}
        {children ? <div className="mt-2">{children}</div> : null}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={isSubmitting} className={cancelBtn}>
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={isSubmitting}
            className={variant === "danger" ? confirmDanger : confirmNeutral}
          >
            {isSubmitting ? (submittingLabel ?? confirmLabel) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
