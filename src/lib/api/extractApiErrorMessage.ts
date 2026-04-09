/**
 * Returns a display string from RTK Query / fetchBaseQuery rejections (`data.message`,
 * serialized `error` string) or a standard `Error`. Use `fallbackMessage` for
 * action-specific copy when nothing else is available.
 */
export function extractApiErrorMessage(err: unknown, fallbackMessage: string): string {
  if (typeof err === "object" && err !== null) {
    const data = (err as { data?: unknown }).data;
    if (typeof data === "object" && data !== null && "message" in data) {
      const msg = (data as { message?: unknown }).message;
      if (typeof msg === "string" && msg.trim()) return msg;
    }
    const fetchError = (err as { error?: unknown }).error;
    if (typeof fetchError === "string" && fetchError.trim()) return fetchError;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallbackMessage;
}
