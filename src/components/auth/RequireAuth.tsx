import { useRouter } from "next/router";
import { type ReactNode, useEffect, useState } from "react";
import { enforceValidAuthSession, hasStoredAuthTokens } from "@/lib/auth/tokenStorage";

type RequireAuthProps = {
  children: ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!enforceValidAuthSession() || !hasStoredAuthTokens()) {
      void router.replace("/login");
      return;
    }
    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-100 text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
