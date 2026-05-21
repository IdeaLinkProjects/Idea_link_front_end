import { Briefcase, Check, ChevronsUpDown, Lightbulb } from "lucide-react";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useWorkspace, type DashboardWorkspace } from "@/context/WorkspaceContext";
import { cn } from "@/lib/cn";
import { messages } from "@/locales";
import { useGetUserRolesStatusQuery } from "@/store";
import { useEffect, useId, useRef, useState } from "react";

type WorkspaceSwitcherProps = {
  className?: string;
};

type WorkspaceOption = {
  id: DashboardWorkspace;
  label: string;
  badge: string;
  icon: typeof Lightbulb;
  avatarClass: string;
  badgeClass: string;
};

export function WorkspaceSwitcher({ className }: WorkspaceSwitcherProps) {
  const { locale, isDark } = useAppPreferences();
  const { activeWorkspace, setActiveWorkspace } = useWorkspace();
  const { data: roles } = useGetUserRolesStatusQuery();
  const t = messages[locale].commonDashboard;
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const options: WorkspaceOption[] = [
    {
      id: "innovator",
      label: t.workspaceInnovator,
      badge: t.workspaceInnovatorBadge,
      icon: Lightbulb,
      avatarClass: isDark
        ? "bg-primary-500/25 text-primary-300 ring-primary-500/35"
        : "bg-primary-100 text-primary-800 ring-primary-200",
      badgeClass: isDark ? "bg-zinc-800 text-zinc-300" : "bg-zinc-200 text-zinc-700",
    },
    {
      id: "investor",
      label: t.workspaceInvestor,
      badge: t.workspaceInvestorBadge,
      icon: Briefcase,
      avatarClass: isDark
        ? "bg-primary-900/60 text-primary-200 ring-primary-700/40"
        : "bg-primary-200 text-primary-950 ring-primary-300",
      badgeClass: isDark ? "bg-primary-950/80 text-primary-200 ring-1 ring-primary-700/50" : "bg-primary-100 text-primary-900 ring-1 ring-primary-200",
    },
  ];

  const active = options.find((o) => o.id === activeWorkspace) ?? options[0];
  const displayName = roles?.fullName?.trim() || t.userFirstName;
  const triggerLabel = `${displayName} · ${active.label}`;

  const select = (w: DashboardWorkspace) => {
    setActiveWorkspace(w);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const el = rootRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const triggerShell = isDark
    ? "border-white/10 bg-zinc-900/90 hover:border-white/20 hover:bg-zinc-800/90"
    : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50";
  const panelShell = isDark
    ? "border-white/10 bg-zinc-950 shadow-2xl shadow-black/50"
    : "border-zinc-200 bg-white shadow-xl shadow-zinc-300/30";
  const chevronBtn = isDark
    ? "border-white/10 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
    : "border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-200";

  return (
    <div ref={rootRef} className={cn("relative w-full min-w-0 max-w-xs sm:max-w-sm", className)}>
      <div className={cn("flex min-w-0 items-center gap-1 rounded-lg border p-1 transition-colors", triggerShell)}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listId}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1 text-left transition hover:opacity-90 sm:gap-2.5 sm:px-2"
        >
          <span
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-1 sm:h-8 sm:w-8",
              active.avatarClass,
            )}
            aria-hidden
          >
            <active.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-inherit">{triggerLabel}</span>
          <span
            className={cn(
              "hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide sm:inline",
              active.badgeClass,
            )}
          >
            {active.badge}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={t.workspaceOpenMenu}
          className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition sm:h-8 sm:w-8", chevronBtn)}
        >
          <ChevronsUpDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
        </button>
      </div>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={t.workspaceSwitchAria}
          className={cn(
            "absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border py-1.5 transition-opacity duration-200",
            panelShell,
          )}
        >
          {options.map((opt) => {
            const selected = opt.id === activeWorkspace;
            const Icon = opt.icon;
            return (
              <li key={opt.id} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => select(opt.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-2.5 py-2 text-left transition sm:gap-3 sm:px-3",
                    selected
                      ? isDark
                        ? "bg-white/5"
                        : "bg-primary-50/80"
                      : isDark
                        ? "hover:bg-white/10"
                        : "hover:bg-zinc-50",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1",
                      opt.avatarClass,
                    )}
                    aria-hidden
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{opt.label}</span>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", opt.badgeClass)}>
                    {opt.badge}
                  </span>
                  {selected ? (
                    <Check className={cn("h-4 w-4 shrink-0", isDark ? "text-zinc-100" : "text-zinc-900")} aria-hidden />
                  ) : (
                    <span className="h-4 w-4 shrink-0" aria-hidden />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
