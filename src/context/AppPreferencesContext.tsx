import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import type { Locale } from "@/locales";

export type AppTheme = "dark" | "light";

export const APP_LOCALE_STORAGE_KEY = "ideal-link-locale";
export const APP_THEME_STORAGE_KEY = "ideal-link-theme";

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const s = localStorage.getItem(APP_LOCALE_STORAGE_KEY);
  return s === "am" || s === "en" ? s : "en";
}

function readStoredTheme(): AppTheme {
  if (typeof window === "undefined") return "dark";
  const s = localStorage.getItem(APP_THEME_STORAGE_KEY);
  return s === "light" || s === "dark" ? s : "dark";
}

function applyLocaleToDocument(value: Locale) {
  document.documentElement.setAttribute("lang", value);
  try {
    localStorage.setItem(APP_LOCALE_STORAGE_KEY, value);
  } catch {
    /* ignore quota / private mode */
  }
}

function applyThemeToDocument(value: AppTheme) {
  document.documentElement.setAttribute("data-theme", value);
  try {
    localStorage.setItem(APP_THEME_STORAGE_KEY, value);
  } catch {
    /* ignore */
  }
}

type AppPreferencesContextValue = {
  locale: Locale;
  setLocale: (value: Locale) => void;
  theme: AppTheme;
  setTheme: (value: AppTheme) => void;
  isDark: boolean;
};

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null);

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [theme, setThemeState] = useState<AppTheme>("dark");

  useLayoutEffect(() => {
    const l = readStoredLocale();
    const th = readStoredTheme();
    setLocaleState(l);
    setThemeState(th);
    applyLocaleToDocument(l);
    applyThemeToDocument(th);
  }, []);

  const setLocale = useCallback((value: Locale) => {
    setLocaleState(value);
    applyLocaleToDocument(value);
  }, []);

  const setTheme = useCallback((value: AppTheme) => {
    setThemeState(value);
    applyThemeToDocument(value);
  }, []);

  const value = useMemo<AppPreferencesContextValue>(
    () => ({
      locale,
      setLocale,
      theme,
      setTheme,
      isDark: theme === "dark",
    }),
    [locale, theme, setLocale, setTheme],
  );

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
}

export function useAppPreferences() {
  const ctx = useContext(AppPreferencesContext);
  if (ctx == null) {
    throw new Error("useAppPreferences must be used within AppPreferencesProvider");
  }
  return ctx;
}
