import { messages } from "@/locales";
import { emailOk } from "@/lib/register/email";

export type ForgotPasswordPageMessages = (typeof messages)["en"]["forgotPasswordPage"];

export type ForgotPasswordFormErrors = {
  email?: string;
};

export function validateForgotPasswordForm(email: string, t: ForgotPasswordPageMessages): ForgotPasswordFormErrors {
  if (!emailOk(email)) return { email: t.errors.email };
  return {};
}
