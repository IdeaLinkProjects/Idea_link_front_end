import type { RegisterRole } from "./constants";

const DEMO_ROLE_KEY = "ideal-link-demo-role";

export function saveDemoUserRole(role: RegisterRole): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_ROLE_KEY, role);
}
