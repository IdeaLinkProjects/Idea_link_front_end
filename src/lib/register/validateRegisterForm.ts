import { messages } from "@/locales";
import { emailOk } from "./email";
import type { RegisterFormState } from "./types";

export type RegisterPageMessages = (typeof messages)["en"]["registerPage"];

export type RegisterFieldError =
  | "email"
  | "password"
  | "firstName"
  | "lastName"
  | "phone"
  | "confirmPassword";

export type RegisterFormErrors = Partial<Record<RegisterFieldError, string>>;

const PHONE_REGEX = /^\+?[0-9]{9,15}$/;

export function validateRegisterForm(form: RegisterFormState, t: RegisterPageMessages): RegisterFormErrors {
  const e: RegisterFormErrors = {};
  if (!form.firstName.trim()) e.firstName = t.errors.firstName;
  if (!form.lastName.trim()) e.lastName = t.errors.lastName;
  if (!emailOk(form.email)) e.email = t.errors.email;
  const phoneDigits = form.phone.replace(/\s/g, "");
  if (!phoneDigits) e.phone = t.errors.phone;
  else if (!PHONE_REGEX.test(phoneDigits)) e.phone = t.errors.phoneInvalid;
  if (form.password.length < 8) e.password = t.errors.password;
  if (!form.confirmPassword) e.confirmPassword = t.errors.confirmPasswordRequired;
  else if (form.confirmPassword !== form.password) e.confirmPassword = t.errors.confirmPassword;
  return e;
}
