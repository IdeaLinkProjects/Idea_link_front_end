export type ResetPasswordFormState = {
  newPassword: string;
  confirmPassword: string;
};

export function createEmptyResetPasswordForm(): ResetPasswordFormState {
  return { newPassword: "", confirmPassword: "" };
}
