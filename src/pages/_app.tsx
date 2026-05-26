import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { CookieConsentBanner } from "@/components/layout/CookieConsentBanner";
import { AppPreferencesProvider } from "@/context/AppPreferencesContext";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { store } from "@/store";
import ARIAChatButton from "@/components/ui/ARIAChatButton";
import { useGetUserRolesStatusQuery } from "@/store";
import { hasStoredAuthTokens } from "@/lib/auth/tokenStorage";

function ARIAWrapper() {
  const isLoggedIn = hasStoredAuthTokens();
  const { data: userStatus } = useGetUserRolesStatusQuery(undefined, {
    skip: !isLoggedIn,
  });
  if (!userStatus) return null;
  const isInvestor = userStatus.currentRoles.includes("INVESTOR");
  if (!isInvestor) return null;
  return <ARIAChatButton user={{ id: userStatus.userId, role: "INVESTOR" }} />;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <AppPreferencesProvider>
        <WorkspaceProvider>
          <Component {...pageProps} />
          <CookieConsentBanner />
          <ARIAWrapper />
        </WorkspaceProvider>
      </AppPreferencesProvider>
    </Provider>
  );
}