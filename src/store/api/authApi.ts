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

export type VerifyEmailRequestBody = {
  email: string;
  otpCode: string;
};

export type VerifyEmailUserInfo = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roles: unknown[];
  emailVerified: boolean;
  phoneVerified: boolean;
  fanVerified: boolean;
  kycStatus: string;
  isProfileComplete: boolean;
};

export type VerifyEmailResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshTokenExpiresIn: number;
  userInfo: VerifyEmailUserInfo;
  message: string;
  requiresOtpVerification: boolean | null;
  nextStep: string;
};

export type LoginRequestBody = {
  email: string;
  password: string;
};

/** Login may omit tokens when the account still needs registration or email verification. */
export type LoginResponse = {
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenType?: string;
  expiresIn?: number;
  refreshTokenExpiresIn?: number;
  userInfo?: VerifyEmailUserInfo;
  message?: string;
  requiresOtpVerification?: boolean | null;
  nextStep?: string | null;
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequestBody>({
      query: (body) => ({
        url: "auth/login",
        method: "POST",
        body,
      }),
    }),
    register: build.mutation<unknown, RegisterRequestBody>({
      query: (body) => ({
        url: "auth/register",
        method: "POST",
        body,
      }),
    }),
    verifyEmail: build.mutation<VerifyEmailResponse, VerifyEmailRequestBody>({
      query: (body) => ({
        url: "auth/verify-email",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation, useRegisterMutation, useVerifyEmailMutation } = authApi;
