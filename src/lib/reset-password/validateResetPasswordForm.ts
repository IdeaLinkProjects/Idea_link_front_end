import { messages } from "@/locales";
import type { ResetPasswordFormState } from "./types";

export type ResetPasswordPageMessages = (typeof messages)["en"]["resetPasswordPage"];

export type ResetPasswordFieldError = "password" | "confirmPassword";

export type ResetPasswordFormErrors = Partial<Record<ResetPasswordFieldError, string>>;

export function validateResetPasswordForm(
  form: ResetPasswordFormState,
  t: ResetPasswordPageMessages,
): ResetPasswordFormErrors {
  const e: ResetPasswordFormErrors = {};
  if (form.newPassword.length < 8) e.password = t.errors.password;
  if (!form.confirmPassword) e.confirmPassword = t.errors.confirmPasswordRequired;
  else if (form.confirmPassword !== form.newPassword) e.confirmPassword = t.errors.confirmPassword;
  return e;
}
