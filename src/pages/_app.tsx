import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { CookieConsentBanner } from "@/components/layout/CookieConsentBanner";
import { AppPreferencesProvider } from "@/context/AppPreferencesContext";
import { store } from "@/store";
import ARIAChatButton from "@/components/ui/ARIAChatButton";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <AppPreferencesProvider>
        <Component {...pageProps} />
        <CookieConsentBanner />
        <ARIAChatButton user={{ id: 1, role: "INVESTOR" }} />
      </AppPreferencesProvider>
    </Provider>
  );
}
