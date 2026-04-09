import { baseApi } from "./baseApi";

export type RegisterRequestBody = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export type RegisterErrorBody = {
  message?: string;
  status?: number;
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    register: build.mutation<unknown, RegisterRequestBody>({
      query: (body) => ({
        url: "auth/register",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useRegisterMutation } = authApi;
