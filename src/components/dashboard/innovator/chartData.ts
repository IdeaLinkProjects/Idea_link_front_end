import type { WalletTransaction } from "@/store";

export const CHART_HEIGHT = 200;

export type ChartRange = "1M" | "6M" | "1Y";

const RANGE_DAYS: Record<ChartRange, number> = {
  "1M": 30,
  "6M": 183,
  "1Y": 365,
};

export function filterTransactionsByRange(activities: WalletTransaction[], range: ChartRange): WalletTransaction[] {
  const cutoff = Date.now() - RANGE_DAYS[range] * 24 * 60 * 60 * 1000;
  return activities
    .filter((a) => {
      const t = new Date(a.occurredAt).getTime();
      return !Number.isNaN(t) && t >= cutoff;
    })
    .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
}

export function buildFundingChartSeries(activities: WalletTransaction[]) {
  if (activities.length === 0) return [];

  let cumulative = 0;
  return activities.map((a) => {
    cumulative += Math.max(a.signedAmount, 0);
    return { t: new Date(a.occurredAt).getTime(), v: cumulative };
  });
}

export function mergeUniqueTransactions(...lists: WalletTransaction[][]): WalletTransaction[] {
  const merged = lists.flat();
  return merged.filter((tx, i, arr) => arr.findIndex((x) => x.id === tx.id) === i);
}
