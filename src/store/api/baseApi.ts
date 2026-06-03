import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { normalizeApiBaseUrl, prepareAuthorizedApiHeaders } from "@/lib/api/apiClient";

const baseUrl = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL ?? "");

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, api) => prepareAuthorizedApiHeaders(headers, api),
  }),
  tagTypes: ["Auth", "Kyc", "Profile", "Notifications", "Wallet"],
  endpoints: () => ({}),
});
