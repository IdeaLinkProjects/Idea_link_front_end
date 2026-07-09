import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { normalizeApiBaseUrl, prepareAuthorizedApiHeaders } from "@/lib/api/apiClient";
import {
  clearAuthSessionAndRedirectToLogin,
  getAccessToken,
  hasRawAccessToken,
  isAccessTokenExpired,
} from "@/lib/auth/tokenStorage";

const baseUrl = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL ?? "");

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, api) => prepareAuthorizedApiHeaders(headers, api),
});

/**
 * Prevents API calls with an expired access token and forces logout on 401
 * when the request was made with a Bearer token.
 */
const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  if (hasRawAccessToken() && isAccessTokenExpired()) {
    clearAuthSessionAndRedirectToLogin();
    return {
      error: {
        status: 401,
        data: { message: "Session expired. Please sign in again." },
      },
    };
  }

  const hadToken = Boolean(getAccessToken());
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && hadToken) {
    clearAuthSessionAndRedirectToLogin();
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Auth", "Kyc", "Profile", "Notifications", "Wallet"],
  endpoints: () => ({}),
});
