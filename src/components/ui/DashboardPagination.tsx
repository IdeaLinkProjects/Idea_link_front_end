type DashboardPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
  isDark?: boolean;
  previousLabel?: string;
  nextLabel?: string;
};

export function DashboardPagination({
  currentPage,
  totalPages,
  onPageChange,
  isDark = false,
  previousLabel = "Previous",
  nextLabel = "Next",
}: DashboardPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(currentPage - 1, 0))}
        disabled={currentPage === 0}
        className={`rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
          isDark ? "bg-white/10 text-zinc-200 hover:bg-white/15" : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
        }`}
      >
        {previousLabel}
      </button>
      <span className={`px-2 text-sm ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
        Page {currentPage + 1} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages - 1))}
        disabled={currentPage >= totalPages - 1}
        className={`rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
          isDark ? "bg-white/10 text-zinc-200 hover:bg-white/15" : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
        }`}
      >
        {nextLabel}
      </button>
    </div>
  );
}
