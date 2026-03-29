import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { InnovatorLayout } from "@/components/innovator/InnovatorLayout";
import am from "@/locales/am.json";
import en from "@/locales/en.json";

type Locale = "en" | "am";

const messages = { en, am } as const;

type TabKey = "overview" | "updates" | "documents" | "investors" | "messages";

type DocRow = { id: string; name: string; kind: string; sizeLabel: string; objectUrl?: string };
type UpdateEntry = {
  id: string;
  date: string;
  title: string;
  paragraphs?: string[];
  html?: string;
};
type MsgItem = { from: "me" | "them"; text: string; time: string };
type Thread = { id: string; name: string; preview: string; items: MsgItem[] };

function formatEtb(n: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "am" ? "am-ET" : "en-ET", {
    maximumFractionDigits: 0,
  }).format(n);
}

function useLocaleTheme() {
  const [locale] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";
    const s = window.localStorage.getItem("ideal-link-locale");
    return s === "am" || s === "en" ? s : "en";
  });
  const [theme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    const s = window.localStorage.getItem("ideal-link-theme");
    return s === "light" || s === "dark" ? s : "dark";
  });
  return { locale, theme };
}

function RichEditor({
  placeholder,
  editorRef,
  tBold,
  tItalic,
  tBullet,
  isDark,
}: {
  placeholder: string;
  editorRef: React.RefObject<HTMLDivElement | null>;
  tBold: string;
  tItalic: string;
  tBullet: string;
  isDark: boolean;
}) {
  const run = useCallback((cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  }, [editorRef]);

  const barBtn =
    "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition " +
    (isDark ? "bg-white/10 text-zinc-200 hover:bg-white/15" : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200");

  const surface = isDark ? "border-white/15 bg-zinc-900/80 text-zinc-100" : "border-zinc-200 bg-white text-zinc-900";

  return (
    <div className={`rounded-xl border ${surface}`}>
      <div
        className={`flex flex-wrap gap-1 border-b px-2 py-2 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-zinc-50"}`}
        role="toolbar"
        aria-label="Formatting"
      >
        <button type="button" className={barBtn} onMouseDown={(e) => e.preventDefault()} onClick={() => run("bold")}>
          {tBold}
        </button>
        <button type="button" className={barBtn} onMouseDown={(e) => e.preventDefault()} onClick={() => run("italic")}>
          {tItalic}
        </button>
        <button
          type="button"
          className={barBtn}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => run("insertUnorderedList")}
        >
          {tBullet}
        </button>
      </div>
      <div
        ref={editorRef}
        className="min-h-[160px] px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
        contentEditable
        suppressContentEditableWarning
      />
      <p className={`border-t px-3 py-2 text-xs ${isDark ? "border-white/10 text-zinc-500" : "border-zinc-200 text-zinc-500"}`}>
        {placeholder}
      </p>
    </div>
  );
}

function Toast({ message, show }: { message: string; show: boolean }) {
  if (!show || !message) return null;
  return (
    <div
      className="fixed bottom-6 left-1/2 z-[100] max-w-md -translate-x-1/2 rounded-xl border border-emerald-500/40 bg-emerald-950 px-4 py-3 text-center text-sm font-medium text-emerald-100 shadow-lg shadow-black/40"
      role="status"
    >
      {message}
    </div>
  );
}

function TabButton({
  id: tabId,
  selected,
  onSelect,
  children,
  isDark,
}: {
  id: TabKey;
  selected: boolean;
  onSelect: (k: TabKey) => void;
  children: ReactNode;
  isDark: boolean;
}) {
  const base =
    "whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ";
  const on = isDark ? "bg-emerald-900/50 text-emerald-200" : "bg-emerald-100 text-emerald-900";
  const off = isDark ? "text-zinc-400 hover:bg-white/10 hover:text-white" : "text-zinc-600 hover:bg-zinc-100";
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      className={base + (selected ? on : off)}
      onClick={() => onSelect(tabId)}
    >
      {children}
    </button>
  );
}

export default function InnovatorProjectManagePage() {
  const router = useRouter();
  const { locale, theme } = useLocaleTheme();
  const d = messages[locale].innovatorProjectManage;
  const isDark = theme === "dark";

  const cardClass = isDark
    ? "border-white/15 bg-white/10 shadow-lg shadow-black/20"
    : "border-zinc-200 bg-white shadow-md shadow-zinc-200/60";

  const [toast, setToast] = useState("");
  const [writeOpen, setWriteOpen] = useState(false);
  const [composeDismissed, setComposeDismissed] = useState(false);

  const activeTab = useMemo((): TabKey => {
    if (!router.isReady) return "overview";
    const q = router.query.tab;
    if (q === "updates" || q === "documents" || q === "investors" || q === "messages" || q === "overview") return q;
    return "overview";
  }, [router.isReady, router.query.tab]);

  const urlWantsComposer =
    Boolean(router.isReady) && router.query.tab === "updates" && router.query.compose === "1";
  const showWritePanel = writeOpen || (urlWantsComposer && !composeDismissed);

  const selectTab = useCallback(
    (k: TabKey) => {
      if (!router.isReady) return;
      const nextQ: Record<string, string | string[] | undefined> = { ...router.query, tab: k };
      if (k !== "updates") {
        delete nextQ.compose;
      }
      void router.replace({ pathname: router.pathname, query: nextQ }, undefined, { shallow: true });
    },
    [router],
  );

  const stripComposeFromUrl = useCallback(() => {
    if (!router.isReady) return;
    const nextQ: Record<string, string | string[] | undefined> = { ...router.query };
    delete nextQ.compose;
    void router.replace({ pathname: router.pathname, query: nextQ }, undefined, { shallow: true });
  }, [router]);

  useEffect(() => {
    if (!toast) return;
    const tmr = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(tmr);
  }, [toast]);

  const pct = d.fundedPercent;
  const raisedStr = formatEtb(d.raisedEtb, locale);
  const goalStr = formatEtb(d.goalEtb, locale);

  const [updates, setUpdates] = useState<UpdateEntry[]>(() =>
    d.updates.initial.map((u, i) => ({
      id: `init-${i}`,
      date: u.date,
      title: u.title,
      paragraphs: u.paragraphs,
    })),
  );

  const editorRef = useRef<HTMLDivElement>(null);

  const [docs, setDocs] = useState<DocRow[]>(() =>
    d.documents.initial.map((f, i) => ({
      id: `doc-init-${i}`,
      name: f.name,
      kind: f.kind,
      sizeLabel: f.sizeLabel,
    })),
  );

  const [threads, setThreads] = useState<Thread[]>(() =>
    d.messages.threads.map((th) => ({
      id: th.id,
      name: th.name,
      preview: th.preview,
      items: th.items.map((m) => ({ ...m, from: m.from as MsgItem["from"] })),
    })),
  );
  const [activeThreadId, setActiveThreadId] = useState(() => d.messages.threads[0]?.id ?? "");
  const [composeText, setComposeText] = useState("");
  const [attachName, setAttachName] = useState<string | null>(null);
  const attachMsgRef = useRef<HTMLInputElement>(null);

  const activeThread = useMemo(() => threads.find((t) => t.id === activeThreadId) ?? threads[0], [threads, activeThreadId]);

  const publishUpdate = useCallback(() => {
    const el = editorRef.current;
    const html = el?.innerHTML?.trim() ?? "";
    const text = el?.innerText?.trim() ?? "";
    if (!text.length) {
      setToast(d.updates.emptyEditor);
      return;
    }
    const titleLine = text.split("\n")[0]?.slice(0, 80) ?? d.projectTitle;
    const dateStr = new Intl.DateTimeFormat(locale === "am" ? "am-ET" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
    setUpdates((prev) => [{ id: `u-${Date.now()}`, date: dateStr, title: titleLine, html }, ...prev]);
    if (el) el.innerHTML = "";
    setWriteOpen(false);
    setComposeDismissed(true);
    stripComposeFromUrl();
    setToast(d.updates.publishedToast);
  }, [d.projectTitle, d.updates.emptyEditor, d.updates.publishedToast, locale, stripComposeFromUrl]);

  const onDocChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files;
      if (!list?.length) return;
      const next: DocRow[] = [];
      for (let i = 0; i < list.length; i++) {
        const file = list[i]!;
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
        let kind = "file";
        if (ext === "pdf") kind = "pdf";
        else if (ext === "doc" || ext === "docx") kind = "doc";
        else if (ext === "jpg" || ext === "jpeg" || ext === "png") kind = "image";
        const url = URL.createObjectURL(file);
        next.push({
          id: `up-${Date.now()}-${i}`,
          name: file.name,
          kind,
          sizeLabel: `${Math.max(1, Math.round(file.size / 1024))} KB`,
          objectUrl: url,
        });
      }
      setDocs((prev) => [...next, ...prev]);
      e.target.value = "";
    },
    [],
  );

  const previewDoc = useCallback((row: DocRow) => {
    if (row.objectUrl) {
      window.open(row.objectUrl, "_blank", "noopener,noreferrer");
      return;
    }
    setToast(locale === "am" ? "ቅድመ እይታ በሙከራ ሞዴል ላይ ለእውነተኛ ፋይሎች ይገናኛል።" : "Preview connects once files are stored (demo).");
  }, [locale]);

  const exportCsv = useCallback(() => {
    const rows = d.investors.rows;
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const header = [d.investors.colName, d.investors.colAmount, d.investors.colEquity, d.investors.colDate];
    const lines = [
      header.join(","),
      ...rows.map(
        (r) =>
          [escape(r.name), r.amountEtb, r.equityPct, escape(r.date)].join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ideal-link-investors-${d.projectTitle.replace(/\s+/g, "-").slice(0, 40)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [d.investors, d.projectTitle]);

  const sendMessage = () => {
    let text = composeText.trim();
    if (attachName) {
      text = text ? `${text}\n\n[${attachName}]` : `[${attachName}]`;
    }
    if (!text || !activeThread) return;
    const timeStr = new Intl.DateTimeFormat(locale === "am" ? "am-ET" : "en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
    setThreads((prev) =>
      prev.map((th) =>
        th.id !== activeThread.id
          ? th
          : {
              ...th,
              preview: text.slice(0, 80),
              items: [...th.items, { from: "me" as const, text, time: timeStr }],
            },
      ),
    );
    setComposeText("");
    setAttachName(null);
  };

  const onComposeKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickGo = useCallback(
    (k: TabKey) => {
      selectTab(k);
      if (k === "updates") {
        setComposeDismissed(false);
        setWriteOpen(true);
      }
    },
    [selectTab],
  );

  const statusBadge = d.statusBadge.replace("{percent}", String(pct));

  return (
    <>
      <Head>
        <title>{d.metaTitle}</title>
      </Head>
      <InnovatorLayout>
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link
                href="/innovator/projects"
                className={`text-sm font-semibold text-emerald-500 hover:text-emerald-400 ${isDark ? "" : "text-emerald-700 hover:text-emerald-800"}`}
              >
                ← {d.backToProjects}
              </Link>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <h1 className={`text-2xl font-bold tracking-tight sm:text-3xl ${isDark ? "text-white" : "text-zinc-900"}`}>
                  {d.projectTitle}
                </h1>
                <span className="w-fit rounded-full border border-emerald-500/50 bg-emerald-950/40 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-300">
                  {statusBadge}
                </span>
              </div>
            </div>
          </div>

          <div
            className={`flex flex-wrap gap-2 rounded-2xl border p-2 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-zinc-50"}`}
            role="tablist"
            aria-label="Project sections"
          >
            <TabButton id="overview" selected={activeTab === "overview"} onSelect={selectTab} isDark={isDark}>
              {d.tabs.overview}
            </TabButton>
            <TabButton id="updates" selected={activeTab === "updates"} onSelect={selectTab} isDark={isDark}>
              {d.tabs.updates}
            </TabButton>
            <TabButton id="documents" selected={activeTab === "documents"} onSelect={selectTab} isDark={isDark}>
              {d.tabs.documents}
            </TabButton>
            <TabButton id="investors" selected={activeTab === "investors"} onSelect={selectTab} isDark={isDark}>
              {d.tabs.investors}
            </TabButton>
            <TabButton id="messages" selected={activeTab === "messages"} onSelect={selectTab} isDark={isDark}>
              {d.tabs.messages}
            </TabButton>
          </div>

          {activeTab === "overview" ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <section className={`rounded-2xl border p-5 ${cardClass}`}>
                <h2 className={`text-sm font-bold uppercase tracking-wide ${isDark ? "text-emerald-400" : "text-emerald-800"}`}>
                  {d.overview.fundingTitle}
                </h2>
                <p className={`mt-2 text-3xl font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>
                  {d.overview.fundedLabel.replace("{pct}", String(pct))}
                </p>
                <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                  {d.overview.raisedGoal.replace("{raised}", raisedStr).replace("{goal}", goalStr)}
                </p>
                <div className={`mt-4 h-3 overflow-hidden rounded-full ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-800 to-emerald-500 transition-[width]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </section>

              <section className={`rounded-2xl border p-5 ${cardClass}`}>
                <h2 className={`text-sm font-bold uppercase tracking-wide ${isDark ? "text-emerald-400" : "text-emerald-800"}`}>
                  {d.overview.countdownTitle}
                </h2>
                <p className={`mt-3 text-2xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
                  {d.overview.daysRemaining.replace("{n}", String(d.daysRemaining))}
                </p>
                <h2 className={`mt-6 text-sm font-bold uppercase tracking-wide ${isDark ? "text-emerald-400" : "text-emerald-800"}`}>
                  {d.overview.investorCountTitle}
                </h2>
                <p className={`mt-2 text-xl font-semibold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
                  {d.overview.investorCountLabel.replace("{n}", String(d.investorCount))}
                </p>
              </section>

              <section className={`rounded-2xl border p-5 lg:col-span-2 ${cardClass}`}>
                <h2 className={`mb-4 text-sm font-bold uppercase tracking-wide ${isDark ? "text-emerald-400" : "text-emerald-800"}`}>
                  {d.overview.milestonesTitle}
                </h2>
                <ol className="grid gap-3 sm:grid-cols-2">
                  {d.milestones.map((m, i) => (
                    <li
                      key={i}
                      className={`flex gap-3 rounded-xl border p-4 ${
                        m.done
                          ? isDark
                            ? "border-emerald-500/30 bg-emerald-950/30"
                            : "border-emerald-200 bg-emerald-50/80"
                          : isDark
                            ? "border-white/10 bg-white/5"
                            : "border-zinc-200 bg-zinc-50"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          m.done ? "bg-emerald-600 text-white" : isDark ? "bg-zinc-700 text-zinc-300" : "bg-zinc-200 text-zinc-600"
                        }`}
                        aria-hidden
                      >
                        {m.done ? "✓" : i + 1}
                      </span>
                      <div>
                        <p className={`font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{m.title}</p>
                        <p className={`mt-1 text-xs font-medium uppercase ${m.done ? "text-emerald-500" : isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                          {m.done ? d.overview.complete : d.overview.pending}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <section className={`rounded-2xl border p-5 lg:col-span-2 ${cardClass}`}>
                <h2 className={`mb-4 text-sm font-bold uppercase tracking-wide ${isDark ? "text-emerald-400" : "text-emerald-800"}`}>
                  {d.overview.quickActionsTitle}
                </h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-600"
                    onClick={() => quickGo("updates")}
                  >
                    {d.overview.actionPostUpdate}
                  </button>
                  <button
                    type="button"
                    className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                      isDark ? "border-white/20 text-white hover:bg-white/10" : "border-zinc-300 text-zinc-900 hover:bg-zinc-50"
                    }`}
                    onClick={() => setToast(d.updates.requestReleaseToast)}
                  >
                    {d.overview.actionRequestRelease}
                  </button>
                  <button
                    type="button"
                    className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                      isDark ? "border-white/20 text-white hover:bg-white/10" : "border-zinc-300 text-zinc-900 hover:bg-zinc-50"
                    }`}
                    onClick={() => quickGo("messages")}
                  >
                    {d.overview.actionMessageInvestors}
                  </button>
                </div>
              </section>
            </div>
          ) : null}

          {activeTab === "updates" ? (
            <div className="space-y-6">
              <section className={`rounded-2xl border p-5 ${cardClass}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{d.updates.writeUpdate}</h2>
                  <button
                    type="button"
                    className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                    onClick={() => {
                      if (showWritePanel) {
                        setWriteOpen(false);
                        setComposeDismissed(true);
                        stripComposeFromUrl();
                      } else {
                        setComposeDismissed(false);
                        setWriteOpen(true);
                      }
                    }}
                  >
                    {showWritePanel ? d.updates.cancel : d.updates.writeUpdate}
                  </button>
                </div>
                {showWritePanel ? (
                  <div className="mt-4 space-y-3">
                    <RichEditor
                      editorRef={editorRef}
                      placeholder={d.updates.editorPlaceholder}
                      tBold={d.updates.bold}
                      tItalic={d.updates.italic}
                      tBullet={d.updates.bulletList}
                      isDark={isDark}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className={`rounded-xl px-4 py-2 text-sm font-semibold ${isDark ? "text-zinc-300 hover:bg-white/10" : "text-zinc-700 hover:bg-zinc-100"}`}
                        onClick={() => {
                          setWriteOpen(false);
                          setComposeDismissed(true);
                          stripComposeFromUrl();
                        }}
                      >
                        {d.updates.cancel}
                      </button>
                      <button
                        type="button"
                        className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                        onClick={publishUpdate}
                      >
                        {d.updates.publish}
                      </button>
                    </div>
                  </div>
                ) : null}
              </section>

              <section className={`rounded-2xl border p-5 ${cardClass}`}>
                <h2 className={`mb-6 text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{d.updates.timelineTitle}</h2>
                <ul className="relative space-y-0">
                  {updates.map((u, idx) => (
                    <li key={u.id} className="flex gap-4 pb-8 last:pb-0">
                      <div className="flex flex-col items-center">
                        <span className={`h-3 w-3 rounded-full ${isDark ? "bg-emerald-400" : "bg-emerald-600"}`} />
                        {idx < updates.length - 1 ? (
                          <span className={`mt-1 w-px flex-1 min-h-[3rem] ${isDark ? "bg-white/15" : "bg-zinc-200"}`} />
                        ) : null}
                      </div>
                      <div className="flex-1 pb-2">
                        <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{u.date}</p>
                        <h3 className={`mt-1 text-base font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{u.title}</h3>
                        {u.paragraphs ? (
                          <div className={`mt-2 space-y-2 text-sm leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                            {u.paragraphs.map((p, j) => (
                              <p key={j}>{p}</p>
                            ))}
                          </div>
                        ) : null}
                        {u.html ? (
                          <div
                            className={`mt-2 max-w-none text-sm leading-relaxed [&_a]:text-emerald-500 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}
                            dangerouslySetInnerHTML={{ __html: u.html }}
                          />
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          ) : null}

          {activeTab === "documents" ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <section className={`rounded-2xl border p-5 ${cardClass}`}>
                <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{d.documents.uploadTitle}</h2>
                <p className={`mt-2 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{d.documents.uploadHint}</p>
                <label
                  className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 transition ${
                    isDark ? "border-white/20 hover:bg-white/5" : "border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  <input
                    type="file"
                    className="sr-only"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
                    multiple
                    onChange={onDocChange}
                  />
                  <span className="text-sm font-semibold text-emerald-500">{d.documents.chooseFiles}</span>
                </label>
              </section>

              <section className={`rounded-2xl border p-5 lg:col-span-2 ${cardClass}`}>
                <h2 className={`mb-4 text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{d.documents.listTitle}</h2>
                {docs.length === 0 ? (
                  <p className={`text-sm ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{d.documents.emptyList}</p>
                ) : (
                  <ul className={isDark ? "divide-y divide-white/10" : "divide-y divide-zinc-200"}>
                    {docs.map((row) => (
                      <li
                        key={row.id}
                        className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl" aria-hidden>
                            {row.kind === "pdf" ? "📄" : row.kind === "image" ? "🖼️" : row.kind === "doc" ? "📝" : "📎"}
                          </span>
                          <div>
                            <p className={`font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{row.name}</p>
                            <p className={`text-xs ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{row.sizeLabel}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                              isDark ? "border-white/20 text-white hover:bg-white/10" : "border-zinc-300 hover:bg-zinc-50"
                            }`}
                            onClick={() => previewDoc(row)}
                          >
                            {d.documents.preview}
                          </button>
                          {row.objectUrl ? (
                            <a
                              href={row.objectUrl}
                              download={row.name}
                              className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-600"
                            >
                              {d.documents.download}
                            </a>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className={`cursor-not-allowed rounded-lg px-3 py-1.5 text-sm font-semibold opacity-50 ${
                                isDark ? "bg-white/10" : "bg-zinc-200"
                              }`}
                            >
                              {d.documents.download}
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          ) : null}

          {activeTab === "investors" ? (
            <section className={`rounded-2xl border p-5 ${cardClass}`}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{d.investors.title}</h2>
                <button
                  type="button"
                  className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                  onClick={exportCsv}
                >
                  {d.investors.exportCsv}
                </button>
              </div>
              <div className={`overflow-x-auto rounded-xl border ${isDark ? "border-white/10" : "border-zinc-200"}`}>
                <table className="w-full min-w-[32rem] text-left text-sm">
                  <thead className={isDark ? "bg-white/10" : "bg-zinc-100"}>
                    <tr>
                      <th className={`px-4 py-3 font-bold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{d.investors.colName}</th>
                      <th className={`px-4 py-3 font-bold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{d.investors.colAmount}</th>
                      <th className={`px-4 py-3 font-bold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{d.investors.colEquity}</th>
                      <th className={`px-4 py-3 font-bold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{d.investors.colDate}</th>
                    </tr>
                  </thead>
                  <tbody className={isDark ? "divide-y divide-white/10" : "divide-y divide-zinc-200"}>
                    {d.investors.rows.map((r, i) => (
                      <tr key={i} className={isDark ? "text-zinc-300" : "text-zinc-700"}>
                        <td className="px-4 py-3 font-medium">{r.name}</td>
                        <td className="px-4 py-3">{formatEtb(r.amountEtb, locale)} ETB</td>
                        <td className="px-4 py-3">{r.equityPct}%</td>
                        <td className="px-4 py-3">{r.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeTab === "messages" ? (
            <div
              className={`grid min-h-[420px] overflow-hidden rounded-2xl border lg:grid-cols-[minmax(0,280px)_1fr] ${cardClass}`}
            >
              <aside className={`border-b lg:border-b-0 lg:border-r ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-zinc-50"}`}>
                <h2 className={`border-b px-4 py-3 text-sm font-bold ${isDark ? "border-white/10 text-white" : "border-zinc-200 text-zinc-900"}`}>
                  {d.messages.title}
                </h2>
                <ul className="max-h-[320px] overflow-y-auto lg:max-h-none">
                  {threads.map((th) => (
                    <li key={th.id}>
                      <button
                        type="button"
                        className={`w-full px-4 py-3 text-left text-sm transition ${
                          th.id === activeThread?.id
                            ? isDark
                              ? "bg-emerald-900/40 text-white"
                              : "bg-emerald-100 text-emerald-950"
                            : isDark
                              ? "text-zinc-300 hover:bg-white/5"
                              : "text-zinc-700 hover:bg-zinc-100"
                        }`}
                        onClick={() => setActiveThreadId(th.id)}
                      >
                        <span className="block font-semibold">{th.name}</span>
                        <span className={`mt-0.5 line-clamp-2 text-xs ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{th.preview}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </aside>
              <div className="flex min-h-0 flex-1 flex-col">
                <div className={`flex-1 space-y-3 overflow-y-auto p-4 ${isDark ? "bg-zinc-950/40" : "bg-white"}`}>
                  {activeThread ? (
                    activeThread.items.map((m, i) => (
                      <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                            m.from === "me"
                              ? "rounded-br-md bg-emerald-700 text-white"
                              : isDark
                                ? "rounded-bl-md bg-white/10 text-zinc-100"
                                : "rounded-bl-md bg-zinc-200 text-zinc-900"
                          }`}
                        >
                          <p className="text-[10px] font-semibold uppercase opacity-80">
                            {m.from === "me" ? d.messages.youLabel : activeThread.name}
                          </p>
                          <p className="mt-1 whitespace-pre-wrap">{m.text}</p>
                          <p className="mt-1 text-[10px] opacity-70">{m.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={`text-sm ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{d.messages.selectThread}</p>
                  )}
                </div>
                <div className={`border-t p-3 ${isDark ? "border-white/10 bg-zinc-900/80" : "border-zinc-200 bg-zinc-50"}`}>
                  {attachName ? (
                    <p className={`mb-2 text-xs font-medium ${isDark ? "text-emerald-400" : "text-emerald-800"}`}>
                      {d.messages.attach}: {attachName}
                      <button type="button" className="ml-2 underline" onClick={() => setAttachName(null)}>
                        {d.messages.removeAttachment}
                      </button>
                    </p>
                  ) : null}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <textarea
                      className={`min-h-[72px] flex-1 resize-none rounded-xl border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 ${
                        isDark ? "border-white/15 bg-zinc-900 text-zinc-100" : "border-zinc-300 bg-white text-zinc-900"
                      }`}
                      placeholder={d.messages.composePlaceholder}
                      value={composeText}
                      onChange={(e) => setComposeText(e.target.value)}
                      onKeyDown={onComposeKey}
                    />
                    <div className="flex shrink-0 flex-col gap-2 sm:w-36">
                      <input
                        ref={attachMsgRef}
                        type="file"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          setAttachName(f ? f.name : null);
                          e.target.value = "";
                        }}
                      />
                      <button
                        type="button"
                        className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                          isDark ? "border-white/20 text-zinc-200 hover:bg-white/10" : "border-zinc-300 text-zinc-800 hover:bg-zinc-100"
                        }`}
                        onClick={() => attachMsgRef.current?.click()}
                      >
                        {d.messages.attach}
                      </button>
                      <button
                        type="button"
                        className="rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                        onClick={sendMessage}
                      >
                        {d.messages.send}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <Toast message={toast} show={Boolean(toast)} />
        </div>
      </InnovatorLayout>
    </>
  );
}
