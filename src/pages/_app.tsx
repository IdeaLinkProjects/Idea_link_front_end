import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { CookieConsentBanner } from "@/components/layout/CookieConsentBanner";
import { AppPreferencesProvider } from "@/context/AppPreferencesContext";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { store } from "@/store";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <AppPreferencesProvider>
        <WorkspaceProvider>
          <Component {...pageProps} />
          <CookieConsentBanner />
        </WorkspaceProvider>
      </AppPreferencesProvider>
    </Provider>
  );
}
