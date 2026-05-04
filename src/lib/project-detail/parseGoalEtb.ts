/** Parse a human goal string from mock discovery data (e.g. "500k ETB") into a numeric ETB amount. */
export function parseGoalEtb(goalStr: string): number {
  const s = goalStr.replace(/,/g, "").toLowerCase();
  const num = parseFloat(s.replace(/[^\d.]/g, ""));
  if (Number.isNaN(num) || num <= 0) return 500_000;
  if (s.includes("m") || s.includes("ሚሊዮን")) return Math.round(num * 1_000_000);
  if (s.includes("k") || s.includes("ሺህ")) return Math.round(num * 1_000);
  if (num < 500) return Math.round(num * 1_000);
  return Math.round(num);
}
