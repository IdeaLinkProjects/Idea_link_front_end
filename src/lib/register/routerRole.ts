import type { NextRouter } from "next/router";
import { REGISTER_ROLE, type RegisterRole } from "./constants";

export function registerRoleFromQuery(router: NextRouter): RegisterRole | null {
  if (!router.isReady) return null;
  const raw = router.query.role;
  const s = Array.isArray(raw) ? raw[0] : raw;
  return s === REGISTER_ROLE.INNOVATOR || s === REGISTER_ROLE.INVESTOR ? s : null;
}
