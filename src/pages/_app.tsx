import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { AuthSessionWatcher } from "@/components/auth/AuthSessionWatcher";
import { CookieConsentBanner } from "@/components/layout/CookieConsentBanner";
import { AppPreferencesProvider } from "@/context/AppPreferencesContext";
import { WorkspaceProvider, useWorkspace } from "@/context/WorkspaceContext";
import { store } from "@/store";
import ARIAChatButton from "@/components/ui/ARIAChatButton";
import { useGetUserRolesStatusQuery } from "@/store";
import { hasStoredAuthTokens } from "@/lib/auth/tokenStorage";

// This component reads the real logged-in user from the backend
// and passes their real userId + firstName to ARIA/NOVA depending on role/active workspace
function ARIAWrapper() {
  const isLoggedIn = hasStoredAuthTokens();
  const { activeWorkspace } = useWorkspace();

  const { data: userStatus } = useGetUserRolesStatusQuery(undefined, {
    skip: !isLoggedIn,
  });

  // Not logged in or API not responded yet
  if (!userStatus) return null;

  const isInvestor = userStatus.currentRoles.includes("INVESTOR");
  const isInnovator = userStatus.currentRoles.includes("INNOVATOR");

  // Hide if they are neither an investor nor an innovator
  if (!isInvestor && !isInnovator) return null;

  // Dynamically show the chatbot matching their active workspace
  const role = activeWorkspace === "innovator" ? "INNOVATOR" : "INVESTOR";

  return (
    <ARIAChatButton
      user={{
        id: userStatus.userId,
        role,
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
          <AuthSessionWatcher />
          <Component {...pageProps} />
          <CookieConsentBanner />
          <ARIAWrapper />
        </WorkspaceProvider>
      </AppPreferencesProvider>
    </Provider>
  );
}
