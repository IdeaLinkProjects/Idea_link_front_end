import type { FetchArgs } from "@reduxjs/toolkit/query";
import {
  clearAuthSessionAndRedirectToLogin,
  getAccessToken,
  hasRawAccessToken,
  isAccessTokenExpired,
} from "@/lib/auth/tokenStorage";

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
 * RTK Query `prepareHeaders` handler: sets `Authorization: Bearer <token>` when a
 * non-expired access token exists. Expired tokens are cleared and never attached.
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
 * Aborts with a synthetic 401 Response when the stored access token is expired.
 */
export function authorizedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (hasRawAccessToken() && isAccessTokenExpired()) {
    clearAuthSessionAndRedirectToLogin();
    return Promise.resolve(
      new Response(JSON.stringify({ message: "Session expired. Please sign in again." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );
  }

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
