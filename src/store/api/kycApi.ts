import { baseApi } from "./baseApi";

export type KycUploadResponse = {
  message?: string;
};

export type VerifyPhoneOtpRequestBody = {
  otpCode: string;
};

export type VerifyPhoneOtpResponse = {
  message?: string;
};

export const kycApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    uploadKyc: build.mutation<KycUploadResponse, FormData>({
      query: (body) => ({
        url: "kyc/upload",
        method: "POST",
        body,
      }),
    }),
    verifyPhoneOtp: build.mutation<VerifyPhoneOtpResponse, VerifyPhoneOtpRequestBody>({
      query: (body) => ({
        url: "profile/phone/verify",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useUploadKycMutation, useVerifyPhoneOtpMutation } = kycApi;
