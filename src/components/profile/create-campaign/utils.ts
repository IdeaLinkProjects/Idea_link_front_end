/** Derive campaign start/end ISO timestamps from duration (days). */
export function datesFromDurationDays(durationDays: number, startFrom?: string | Date | null): {
  startDate: string;
  endDate: string;
} {
  const start = startFrom ? new Date(startFrom) : new Date();
  const safeStart = Number.isNaN(start.getTime()) ? new Date() : start;
  const end = new Date(safeStart.getTime());
  end.setDate(end.getDate() + durationDays);
  return { startDate: safeStart.toISOString(), endDate: end.toISOString() };
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.setAttribute("readonly", "");
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}
