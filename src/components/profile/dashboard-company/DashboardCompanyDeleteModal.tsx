type Props = {
  isDark: boolean;
  onCancel: () => void;
  onConfirmDelete: () => void;
};

export function DashboardCompanyDeleteModal({ isDark, onCancel, onConfirmDelete }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className={`w-full max-w-md rounded-2xl border p-6 ${isDark ? "border-white/10 bg-zinc-900" : "border-zinc-200 bg-white"}`}>
        <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>Confirm company deletion</h3>
        <p className={`mt-2 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
          This action is irreversible. Are you sure you want to delete this company?
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold ${isDark ? "border-zinc-600 text-zinc-300 hover:bg-zinc-800" : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"}`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmDelete}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
