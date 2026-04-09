import { messages } from "@/locales";
import { emailOk } from "@/lib/register/email";

export type LoginPageMessages = (typeof messages)["en"]["loginPage"];

export type LoginFormErrors = Partial<Record<"email" | "password", string>>;

export function validateLoginForm(email: string, password: string, t: LoginPageMessages): LoginFormErrors {
  const e: LoginFormErrors = {};
  if (!emailOk(email)) e.email = t.errors.email;
  if (!password) e.password = t.errors.password;
  return e;
}
