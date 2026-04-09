import am from "./am.json";
import en from "./en.json";

export type Locale = "en" | "am";

export const messages = { en, am } as const;
