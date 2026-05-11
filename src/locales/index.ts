import am from "./am.json";
import en from "./en.json";
import { privacyPage as privacyPageAm } from "./legal/privacy.am";
import { privacyPage as privacyPageEn } from "./legal/privacy.en";

export type Locale = "en" | "am";

export const messages = {
  en: { ...en, privacyPage: privacyPageEn },
  am: { ...am, privacyPage: privacyPageAm },
} as const;
