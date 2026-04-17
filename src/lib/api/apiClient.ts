import type { FetchArgs } from "@reduxjs/toolkit/query";
import { getAccessToken } from "@/lib/auth/tokenStorage";

/**
 * Central place for default API behavior: Bearer auth, Accept, and JSON vs multipart.
 * Used by RTK Query `fetchBaseQuery` and available for one-off `fetch` calls via `authorizedFetch`.
 */
export function normalizeApiBaseUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
}

function getBodyFromFetchArg(arg: string | FetchArgs): unknown {
  if (typeof arg === "string") return undefined;
  return arg.body;
}

/**
 * RTK Query `prepareHeaders` handler: sets `Authorization: Bearer <token>` when tokens exist,
 * applies `Content-Type: application/json` only when the body is not `FormData` (multipart uploads).
 */
export function prepareAuthorizedApiHeaders(
  headers: Headers,
  api: {
    arg: string | FetchArgs;
  },
): Headers {
  headers.set("Accept", "application/json");
  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const body = getBodyFromFetchArg(api.arg);
  if (!(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
}

/**
 * Same header rules as {@link prepareAuthorizedApiHeaders} for non-RTK `fetch` usage.
 */
export function authorizedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!(init?.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(input, { ...init, headers });
}
