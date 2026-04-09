import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AppPreferencesProvider } from "@/context/AppPreferencesContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppPreferencesProvider>
      <Component {...pageProps} />
    </AppPreferencesProvider>
  );
}
