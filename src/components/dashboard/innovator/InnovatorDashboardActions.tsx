import Link from "next/link";
import { LayoutGrid, Plus } from "lucide-react";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useFintechTheme } from "./theme";

type InnovatorDashboardActionsProps = {
  createLabel: string;
  manageLabel: string;
};

export function InnovatorDashboardActions({ createLabel, manageLabel }: InnovatorDashboardActionsProps) {
  const { isDark } = useAppPreferences();
  const theme = useFintechTheme(isDark);

  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/dashboard/projects" className={theme.btnGhost}>
        <LayoutGrid className="h-4 w-4" aria-hidden />
        {manageLabel}
      </Link>
      <Link href="/dashboard/projects/new" className={theme.btnPrimary}>
        <Plus className="h-4 w-4" aria-hidden />
        {createLabel}
      </Link>
    </div>
  );
}
