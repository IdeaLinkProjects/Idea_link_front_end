import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/router";

export type DashboardWorkspace = "innovator" | "investor";

export const WORKSPACE_STORAGE_KEY = "ideal-link-workspace";

function readStoredWorkspace(): DashboardWorkspace | null {
  if (typeof window === "undefined") return null;
  const s = localStorage.getItem(WORKSPACE_STORAGE_KEY);
  return s === "innovator" || s === "investor" ? s : null;
}

function persistWorkspace(value: DashboardWorkspace) {
  try {
    localStorage.setItem(WORKSPACE_STORAGE_KEY, value);
  } catch {
    /* ignore */
  }
}

type WorkspaceContextValue = {
  activeWorkspace: DashboardWorkspace;
  setActiveWorkspace: (value: DashboardWorkspace) => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [activeWorkspace, setActiveWorkspaceState] = useState<DashboardWorkspace>(() => {
    return readStoredWorkspace() ?? "innovator";
  });

  useEffect(() => {
    if (!router.isReady) return;
    if (!router.pathname.startsWith("/dashboard")) return;
    const raw = router.query.workspace;
    const q = Array.isArray(raw) ? raw[0] : raw;
    if (q === "investor" || q === "innovator") {
      setActiveWorkspaceState(q);
      persistWorkspace(q);
    }
  }, [router.isReady, router.pathname, router.query.workspace]);

  const setActiveWorkspace = useCallback(
    (next: DashboardWorkspace) => {
      setActiveWorkspaceState(next);
      persistWorkspace(next);
      if (!router.pathname.startsWith("/dashboard")) return;
      const raw = router.query.workspace;
      const current = Array.isArray(raw) ? raw[0] : raw;
      if (current === next) return;
      void router.replace(
        { pathname: router.pathname, query: { ...router.query, workspace: next } },
        undefined,
        { shallow: true },
      );
    },
    [router],
  );

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      activeWorkspace,
      setActiveWorkspace,
    }),
    [activeWorkspace, setActiveWorkspace],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (ctx == null) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return ctx;
}
