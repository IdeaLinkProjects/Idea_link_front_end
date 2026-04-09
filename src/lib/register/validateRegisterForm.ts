import { messages } from "@/locales";
import { REGISTER_LICENSE_MAX_BYTES, REGISTER_ROLE, type RegisterRole } from "./constants";
import { emailOk } from "./email";
import type { RegisterFormState } from "./types";

export type RegisterPageMessages = (typeof messages)["en"]["registerPage"];

export type RegisterFieldError =
  | "email"
  | "password"
  | "fullName"
  | "nationalId"
  | "terms"
  | "license"
  | "risk";

export type RegisterFormErrors = Partial<Record<RegisterFieldError, string>>;

export function validateRegisterForm(
  form: RegisterFormState,
  role: RegisterRole | null,
  t: RegisterPageMessages,
): RegisterFormErrors {
  const e: RegisterFormErrors = {};
  if (!emailOk(form.email)) e.email = t.errors.email;
  if (form.password.length < 8) e.password = t.errors.password;
  if (!form.fullName.trim()) e.fullName = t.errors.fullName;
  if (!form.nationalId.trim()) e.nationalId = t.errors.nationalId;
  if (!form.terms) e.terms = t.errors.terms;
  if (role === REGISTER_ROLE.INNOVATOR) {
    if (!form.licenseFile) e.license = t.errors.license;
    else if (form.licenseFile.size > REGISTER_LICENSE_MAX_BYTES) e.license = t.errors.licenseSize;
  }
  if (role === REGISTER_ROLE.INVESTOR) {
    if (!form.horizon || !form.tolerance || !form.priorInvest) e.risk = t.errors.risk;
  }
  return e;
}
