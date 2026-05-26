import { ChevronLeft, ChevronRight } from "lucide-react";

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

  const shell = isDark
    ? "border-zinc-800 bg-zinc-900/95 text-zinc-400"
    : "border-zinc-200 bg-white text-zinc-600";
  const btn = isDark
    ? "border-zinc-700 bg-zinc-800 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-700 disabled:opacity-40"
    : "border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-zinc-100 disabled:opacity-40";
  const pageNum = isDark ? "text-white" : "text-zinc-900";

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${shell}`}>
      <span className="text-sm font-medium tabular-nums">
        Page <span className={pageNum}>{currentPage + 1}</span> of <span className={pageNum}>{totalPages}</span>
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(currentPage - 1, 0))}
          disabled={currentPage === 0}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition ${btn}`}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          {previousLabel}
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages - 1))}
          disabled={currentPage >= totalPages - 1}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition ${btn}`}
        >
          {nextLabel}
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
