import type { RegisterFieldError, RegisterFormErrors } from "./validateRegisterForm";

function normalizeApiFieldKey(raw: string): RegisterFieldError | null {
  const k = raw
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");
  const map: Record<string, RegisterFieldError> = {
    firstname: "firstName",
    lastname: "lastName",
    email: "email",
    password: "password",
    confirmpassword: "confirmPassword",
  };
  return map[k] ?? null;
}

/**
 * Maps API error strings like "email: must be a well-formed email address"
 * into field errors. If nothing maps, returns the full message as general.
 */
export function registerApiMessageToFieldErrors(message: string): {
  fieldErrors: RegisterFormErrors;
  generalMessage: string | null;
} {
  const segments = message.split(/,\s*(?=[a-zA-Z][\w\s_-]*\s*:)/);
  const fieldErrors: RegisterFormErrors = {};
  let mappedAny = false;

  for (const segment of segments) {
    const idx = segment.indexOf(":");
    if (idx === -1) continue;
    const key = normalizeApiFieldKey(segment.slice(0, idx));
    const msg = segment.slice(idx + 1).trim();
    if (key && msg) {
      fieldErrors[key] = msg;
      mappedAny = true;
    }
  }

  return {
    fieldErrors,
    generalMessage: mappedAny ? null : message.trim() || null,
  };
}
