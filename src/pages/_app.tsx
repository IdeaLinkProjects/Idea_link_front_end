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

// This component reads the real logged-in investor from the backend
// and passes their real userId + firstName to ARIA
function ARIAWrapper() {
  const isLoggedIn = hasStoredAuthTokens();

  const { data: userStatus } = useGetUserRolesStatusQuery(undefined, {
    skip: !isLoggedIn,
  });

  // Not logged in or API not responded yet
  if (!userStatus) return null;

  // Only show ARIA to investors — hide from innovators
  const isInvestor = userStatus.currentRoles.includes("INVESTOR");
  if (!isInvestor) return null;

  return (
    <ARIAChatButton
      user={{
        id: userStatus.userId,
        role: "INVESTOR",
        firstName: userStatus.fullName?.split(" ")[0] || "",
      }}
    />
  );
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
