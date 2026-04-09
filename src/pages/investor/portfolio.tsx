import Head from "next/head";
import Link from "next/link";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useEffect, useMemo, useState } from "react";
import { InvestorLayout } from "@/components/investor/InvestorLayout";
import { type Locale, messages } from "@/locales";

type RowStatus = "funding" | "active" | "completed";
type SortKey = "name" | "category" | "amountEtb" | "equityPct" | "status" | "currentValueEtb";
type FilterStatus = "all" | RowStatus;

function formatEtb(n: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "am" ? "am-ET" : "en-ET", { maximumFractionDigits: 0 }).format(n);
}

function statusOrder(s: RowStatus): number {
  if (s === "funding") return 0;
  if (s === "active") return 1;
  return 2;
}

export default function InvestorPortfolioPage() {
  const { locale, isDark } = useAppPreferences();

  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  const t = messages[locale].investorDashboard;
  const ip = messages[locale].investorPortfolio;
  const cardClass = isDark
    ? "border-white/15 bg-white/10 shadow-lg shadow-black/20"
    : "border-zinc-200 bg-white shadow-md shadow-zinc-200/60";
  const muted = isDark ? "text-zinc-400" : "text-zinc-600";

  const rows = useMemo(() => {
    let list = [...ip.rows];
    if (filter !== "all") {
      list = list.filter((r) => r.status === filter);
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "status") {
        cmp = statusOrder(a.status as RowStatus) - statusOrder(b.status as RowStatus);
      } else if (sortKey === "name" || sortKey === "category") {
        cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
      } else {
        cmp = (a[sortKey] as number) - (b[sortKey] as number);
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [ip.rows, filter, sortKey, sortAsc]);

  const detail = selectedId ? ip.details[selectedId as keyof typeof ip.details] : undefined;
  const selectedRow = selectedId ? ip.rows.find((r) => r.id === selectedId) : undefined;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((v) => !v);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const statusLabel = (s: string) => {
    if (s === "funding") return ip.statusFunding;
    if (s === "active") return ip.statusActive;
    return ip.statusCompleted;
  };

  const statusPill = (s: string) => {
    if (s === "funding") {
      return isDark
        ? "border-blue-400/40 bg-blue-950/50 text-blue-300"
        : "border-blue-200 bg-blue-50 text-blue-800";
    }
    if (s === "active") {
      return isDark
        ? "border-emerald-500/40 bg-emerald-950/50 text-emerald-300"
        : "border-emerald-200 bg-emerald-50 text-emerald-900";
    }
    return isDark ? "border-amber-500/40 bg-amber-950/40 text-amber-200" : "border-amber-200 bg-amber-50 text-amber-900";
  };

  const exportCsv = () => {
    const header = [ip.colProject, ip.colCategory, ip.colAmount, ip.colEquity, ip.colStatus, ip.colValue];
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          escape(r.name),
          escape(r.category),
          r.amountEtb,
          r.equityPct,
          escape(statusLabel(r.status)),
          r.currentValueEtb,
        ].join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ideal-link-portfolio.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortHead = ({ col, label }: { col: SortKey; label: string }) => (
    <th scope="col" className="px-3 py-3 text-left">
      <button
        type="button"
        onClick={() => toggleSort(col)}
        className={`inline-flex items-center gap-1 font-bold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}
        aria-label={ip.sortAria.replace("{column}", label)}
      >
        {label}
        {sortKey === col ? <span className="text-emerald-500">{sortAsc ? "↑" : "↓"}</span> : null}
      </button>
    </th>
  );

  return (
    <>
      <Head>
        <title>{t.portfolioMetaTitle}</title>
      </Head>
      <InvestorLayout>
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.portfolioPageTitle}</h1>
              <p className={`mt-1 text-sm ${muted}`}>{ip.pageSubtitle}</p>
            </div>
            <button
              type="button"
              onClick={exportCsv}
              className="rounded-xl border border-emerald-600/50 px-4 py-2.5 text-sm font-semibold text-emerald-500 transition hover:bg-emerald-950/30"
            >
              {ip.exportCsv}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: ip.totalInvestedLabel, value: `${formatEtb(ip.summary.totalInvestedEtb, locale)} ETB` },
              {
                label: ip.activeInvestmentsLabel,
                value: `${ip.summary.activeCount} ${ip.projectsUnit}`,
              },
              { label: ip.avgFundingLabel, value: `${ip.summary.avgFundedPct}%` },
            ].map((s) => (
              <div
                key={s.label}
                className={`rounded-2xl border p-5 ${isDark ? "border-emerald-500/30 bg-gradient-to-br from-emerald-950/50 to-zinc-900/80" : "border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white"}`}
              >
                <p className={`text-sm font-medium ${isDark ? "text-emerald-400/90" : "text-emerald-800"}`}>{s.label}</p>
                <p className={`mt-2 text-2xl font-extrabold tabular-nums ${isDark ? "text-white" : "text-zinc-900"}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className={`rounded-2xl border p-6 ${cardClass}`}>
            <h2 className={`text-sm font-bold uppercase tracking-wide text-emerald-500`}>{ip.diversificationTitle}</h2>
            <div className="mt-4 flex h-4 w-full overflow-hidden rounded-full">
              {ip.diversification.map((seg) => (
                <div
                  key={seg.category}
                  className="h-full min-w-[4px] transition-all"
                  style={{ width: `${seg.percent}%`, backgroundColor: seg.color }}
                  title={`${seg.category}: ${seg.percent}%`}
                />
              ))}
            </div>
            <ul className={`mt-4 flex flex-wrap gap-4 text-sm ${muted}`}>
              {ip.diversification.map((seg) => (
                <li key={seg.category} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
                  <span>
                    {seg.category} ({seg.percent}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`rounded-2xl border p-6 ${cardClass}`}>
            <h2 className={`text-sm font-bold uppercase tracking-wide text-emerald-500`}>{ip.metricsTitle}</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div>
                <p className={`text-xs font-semibold uppercase ${muted}`}>{ip.successRateLabel}</p>
                <p className="mt-1 text-3xl font-extrabold text-emerald-500">{ip.performance.successRatePct}%</p>
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase ${muted}`}>{ip.avgReturnLabel}</p>
                <p className="mt-1 text-3xl font-extrabold text-emerald-500">+{ip.performance.avgSimulatedReturnPct}%</p>
              </div>
              <div className="md:col-span-1">
                <p className={`text-xs font-semibold uppercase ${muted}`}>{ip.riskBreakdownTitle}</p>
                <ul className="mt-3 space-y-2">
                  {ip.performance.riskBreakdown.map((r) => (
                    <li key={r.level}>
                      <div className="flex justify-between text-xs font-medium">
                        <span>{r.level}</span>
                        <span className="tabular-nums">{r.percent}%</span>
                      </div>
                      <div className={`mt-1 h-2 overflow-hidden rounded-full ${isDark ? "bg-zinc-800" : "bg-zinc-100"}`}>
                        <div className="h-full rounded-full bg-emerald-600" style={{ width: `${r.percent}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border ${cardClass} overflow-hidden`}>
            <div className={`flex flex-wrap items-center gap-2 border-b px-4 py-3 ${isDark ? "border-white/10" : "border-zinc-200"}`}>
              <span className={`text-sm font-semibold ${muted}`}>{ip.filterLabel}:</span>
              {(["all", "funding", "active", "completed"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    filter === f
                      ? isDark
                        ? "bg-emerald-900/50 text-emerald-200"
                        : "bg-emerald-100 text-emerald-900"
                      : isDark
                        ? "text-zinc-400 hover:bg-white/10"
                        : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {f === "all" ? ip.filterAll : f === "funding" ? ip.filterFunding : f === "active" ? ip.filterActive : ip.filterCompleted}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[56rem] text-left text-sm">
                <thead className={isDark ? "bg-white/5" : "bg-zinc-50"}>
                  <tr>
                    <SortHead col="name" label={ip.colProject} />
                    <SortHead col="category" label={ip.colCategory} />
                    <SortHead col="amountEtb" label={ip.colAmount} />
                    <SortHead col="equityPct" label={ip.colEquity} />
                    <SortHead col="status" label={ip.colStatus} />
                    <SortHead col="currentValueEtb" label={ip.colValue} />
                    <th scope="col" className="px-3 py-3 font-bold">
                      {ip.colActions}
                    </th>
                  </tr>
                </thead>
                <tbody className={isDark ? "divide-y divide-white/10" : "divide-y divide-zinc-200"}>
                  {rows.map((r) => (
                    <tr key={r.id} className={isDark ? "hover:bg-white/5" : "hover:bg-zinc-50"}>
                      <td className={`px-3 py-3 font-medium ${isDark ? "text-white" : "text-zinc-900"}`}>{r.name}</td>
                      <td className={`px-3 py-3 ${muted}`}>{r.category}</td>
                      <td className="px-3 py-3 font-mono tabular-nums">{formatEtb(r.amountEtb, locale)}</td>
                      <td className="px-3 py-3 font-mono tabular-nums">{r.equityPct.toFixed(2)}%</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${statusPill(r.status)}`}>
                          {statusLabel(r.status)}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono tabular-nums text-emerald-500">{formatEtb(r.currentValueEtb, locale)}</td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedId(r.id)}
                          className="text-sm font-semibold text-emerald-500 hover:underline"
                        >
                          {ip.actionDetails}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {selectedId && selectedRow && detail ? (
          <div
            className="fixed inset-0 z-[60] flex justify-end bg-black/50"
            role="dialog"
            aria-modal
            aria-labelledby="portfolio-detail-title"
            onClick={() => setSelectedId(null)}
          >
            <div
              className={`relative z-10 flex h-full w-full max-w-lg flex-col border-l shadow-2xl ${isDark ? "border-white/10 bg-zinc-950" : "border-zinc-200 bg-white"}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`flex items-center justify-between border-b px-4 py-4 ${isDark ? "border-white/10" : "border-zinc-200"}`}>
                <h2 id="portfolio-detail-title" className="text-lg font-bold">
                  {ip.detailTitle}
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${isDark ? "hover:bg-white/10" : "hover:bg-zinc-100"}`}
                >
                  {ip.closePanel}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-6">
                <p className={`text-sm font-semibold text-emerald-500`}>{selectedRow.name}</p>
                <p className={`mt-1 text-xs ${muted}`}>
                  {formatEtb(selectedRow.amountEtb, locale)} ETB · {selectedRow.equityPct.toFixed(2)}% · {statusLabel(selectedRow.status)}
                </p>

                <section className="mt-8">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-emerald-500">{ip.perfTimeline}</h3>
                  <ul className="mt-3 space-y-3">
                    {detail.timeline.map((ev, i) => (
                      <li key={i} className={`flex gap-3 border-l-2 pl-3 ${ev.tone === "positive" ? "border-emerald-500" : "border-zinc-500"}`}>
                        <div>
                          <p className={`text-xs font-semibold ${muted}`}>{ev.date}</p>
                          <p className="text-sm font-medium">{ev.label}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="mt-8">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-emerald-500">{ip.updatesTitle}</h3>
                  <ul className="mt-3 space-y-4">
                    {detail.updates.map((u, i) => (
                      <li key={i} className={`rounded-xl border p-3 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-zinc-50"}`}>
                        <p className="text-xs text-emerald-500">{u.date}</p>
                        <p className="mt-1 font-semibold">{u.title}</p>
                        <p className={`mt-1 text-sm ${muted}`}>{u.body}</p>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="mt-8">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-emerald-500">{ip.commTitle}</h3>
                  <ul className="mt-3 space-y-3">
                    {detail.messages.map((m, i) => (
                      <li
                        key={i}
                        className={`rounded-xl border px-3 py-2 text-sm ${m.from === "you" ? (isDark ? "border-emerald-500/30 bg-emerald-950/30" : "border-emerald-200 bg-emerald-50") : isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-zinc-50"}`}
                      >
                        <p className="text-xs font-bold text-emerald-500">{m.from === "you" ? ip.you : ip.innovator}</p>
                        <p className="mt-1">{m.text}</p>
                        <p className={`mt-1 text-xs ${muted}`}>{m.time}</p>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className={`mt-8 rounded-xl border p-4 ${isDark ? "border-emerald-500/30 bg-emerald-950/20" : "border-emerald-200 bg-emerald-50"}`}>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-emerald-600">{ip.simReturnsTitle}</h3>
                  <p className="mt-2 text-2xl font-extrabold text-emerald-500">
                    {ip.simReturnPct.replace("{pct}", String(detail.simulatedReturnPct))}
                  </p>
                  <p className={`mt-2 text-xs leading-relaxed ${muted}`}>{ip.simReturnsBody}</p>
                </section>

                <div className="mt-8 flex flex-col gap-2">
                  <Link
                    href={`/projects/${selectedRow.projectSlug}`}
                    className="rounded-xl bg-emerald-700 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-600"
                  >
                    {ip.viewProject}
                  </Link>
                  <Link
                    href="/investor/messages"
                    className={`rounded-xl border py-3 text-center text-sm font-semibold ${isDark ? "border-white/20 hover:bg-white/10" : "border-zinc-300 hover:bg-zinc-100"}`}
                  >
                    {ip.messageInnovator}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </InvestorLayout>
    </>
  );
}
