import { baseApi } from "./baseApi";

export type NotificationsListParams = {
  page: number;
  size: number;
};

export type UserNotification = {
  id: number;
  title: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string;
  actionUrl?: string | null;
};

export type NotificationsPageResponse = {
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: UserNotification[];
  number: number;
  empty: boolean;
};

export type UnreadCountResponse = {
  count: number;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v != null && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function pickNumber(obj: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "") {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

function pickString(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string") return v;
  }
  return "";
}

function pickBool(obj: Record<string, unknown>, ...keys: string[]): boolean {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "boolean") return v;
  }
  return false;
}

/** Maps common Spring / Jackson shapes into a stable client model. */
export function normalizeNotification(raw: unknown): UserNotification | null {
  const o = asRecord(raw);
  if (!o) return null;
  const id = pickNumber(o, "id", "notificationId");
  if (id == null) return null;
  const title = pickString(o, "title", "subject", "summary") || "—";
  const message =
    pickString(o, "message", "body", "content", "description", "text") || pickString(o, "title", "subject") || "";
  const createdAt = pickString(o, "createdAt", "created_at", "timestamp", "sentAt", "date");
  const type = pickString(o, "type", "category", "notificationType", "kind") || "SYSTEM";
  const read = pickBool(o, "read", "isRead", "readFlag", "seen");
  const actionUrl = pickString(o, "actionUrl", "action_url", "link", "deepLink", "url") || null;
  return {
    id,
    title,
    message,
    read,
    type,
    createdAt: createdAt || new Date(0).toISOString(),
    actionUrl: actionUrl || null,
  };
}

function normalizePage(raw: unknown): NotificationsPageResponse {
  const root = asRecord(raw);
  const page = root ?? {};
  const inner = asRecord(page.data) ?? asRecord(page.result) ?? page;
  const contentRaw = inner.content ?? inner.items ?? inner.notifications ?? page.content;
  const arr = Array.isArray(contentRaw) ? contentRaw : [];
  const content = arr.map(normalizeNotification).filter((n): n is UserNotification => n != null);

  const size = pickNumber(inner, "size", "pageSize") ?? 10;
  const number = pickNumber(inner, "number", "page") ?? 0;
  const totalElements = pickNumber(inner, "totalElements", "total_elements") ?? content.length;
  const rawTotalPages = pickNumber(inner, "totalPages", "total_pages");
  const totalPages =
    rawTotalPages ?? (size > 0 ? Math.max(0, Math.ceil(totalElements / size)) : 0);
  const first = typeof inner.first === "boolean" ? inner.first : number <= 0;
  const last = typeof inner.last === "boolean" ? inner.last : totalPages <= 0 ? true : number >= totalPages - 1;
  const empty = content.length === 0;

  return {
    totalElements,
    totalPages,
    numberOfElements: content.length,
    first,
    last,
    size,
    content,
    number,
    empty,
  };
}

function normalizeUnreadCount(raw: unknown): UnreadCountResponse {
  const o = asRecord(raw);
  if (!o) return { count: 0 };
  const c = pickNumber(o, "count", "unreadCount", "unread");
  return { count: c ?? 0 };
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUnreadNotificationCount: build.query<UnreadCountResponse, void>({
      query: () => ({
        url: "notifications/unread/count",
        method: "GET",
      }),
      transformResponse: normalizeUnreadCount,
      providesTags: [{ type: "Notifications", id: "UNREAD_COUNT" }],
    }),
    getNotifications: build.query<NotificationsPageResponse, NotificationsListParams>({
      query: ({ page, size }) => ({
        url: "notifications",
        method: "GET",
        params: { page, size },
      }),
      transformResponse: normalizePage,
      providesTags: [{ type: "Notifications", id: "LIST" }],
    }),
    markNotificationRead: build.mutation<void, number>({
      query: (notificationId) => ({
        url: `notifications/${notificationId}/read`,
        method: "PUT",
      }),
      invalidatesTags: [{ type: "Notifications", id: "UNREAD_COUNT" }, { type: "Notifications", id: "LIST" }],
    }),
    markAllNotificationsRead: build.mutation<void, void>({
      query: () => ({
        url: "notifications/read-all",
        method: "PUT",
      }),
      invalidatesTags: [{ type: "Notifications", id: "UNREAD_COUNT" }, { type: "Notifications", id: "LIST" }],
    }),
    deleteNotification: build.mutation<void, number>({
      query: (notificationId) => ({
        url: `notifications/${notificationId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Notifications", id: "UNREAD_COUNT" }, { type: "Notifications", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUnreadNotificationCountQuery,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} = notificationsApi;
