import { type ReactNode, useEffect, useId } from "react";

export type AlertDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  okLabel: string;
  onClose: () => void;
  isDark: boolean;
};

export function AlertDialog({ open, title, description, okLabel, onClose, isDark }: AlertDialogProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const shell = isDark ? "border-white/15 bg-zinc-950 text-zinc-100" : "border-zinc-200 bg-white text-zinc-900";
  const okBtn = isDark
    ? "rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500"
    : "rounded-xl bg-primary-950 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-900";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onClick={onClose}>
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
          <p className={`mt-2 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{description}</p>
        ) : null}
        <div className="mt-5 flex justify-end">
          <button type="button" onClick={onClose} className={okBtn}>
            {okLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
