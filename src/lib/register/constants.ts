export const REGISTER_ROLE = {
  INNOVATOR: "innovator",
  INVESTOR: "investor",
} as const;

export type RegisterRole = (typeof REGISTER_ROLE)[keyof typeof REGISTER_ROLE];

export const HORIZON = {
  SHORT: "short",
  MEDIUM: "medium",
  LONG: "long",
} as const;

export const RISK_TOLERANCE = {
  CONSERVATIVE: "conservative",
  MODERATE: "moderate",
  AGGRESSIVE: "aggressive",
} as const;

export const PRIOR_INVESTMENT = {
  YES: "yes",
  NO: "no",
} as const;

export const REGISTER_LICENSE_MAX_BYTES = 10 * 1024 * 1024;
