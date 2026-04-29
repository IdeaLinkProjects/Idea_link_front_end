import type { FormEvent } from "react";
import type { CompanyFormDraft } from "@/components/profile/dashboard-company/types";

type Props = {
  isDark: boolean;
  isEditing: boolean;
  hasCompany: boolean;
  draft: CompanyFormDraft;
  isSaving: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSave: (ev: FormEvent<HTMLFormElement>) => void;
  onShowDeleteConfirm: () => void;
  onUpdateField: <K extends keyof CompanyFormDraft>(key: K, value: CompanyFormDraft[K]) => void;
};

export function DashboardCompanySettingsSection({
  isDark,
  isEditing,
  hasCompany,
  draft,
  isSaving,
  errorMessage,
  successMessage,
  onStartEditing,
  onCancelEditing,
  onSave,
  onShowDeleteConfirm,
  onUpdateField,
}: Props) {
  return (
    <section className={`rounded-3xl border p-6 sm:p-8 ${isDark ? "border-white/10 bg-gradient-to-br from-zinc-900/80 to-zinc-950/90 shadow-xl shadow-black/20" : "border-slate-300 bg-gradient-to-br from-white via-slate-50 to-primary-50/25 shadow-md shadow-slate-200/70"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>Company settings</h2>
          <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            Manage editable company details and sensitive actions.
          </p>
        </div>
        {!isEditing ? (
          <button
            type="button"
            onClick={onStartEditing}
            disabled={!hasCompany}
            className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Edit details
          </button>
        ) : null}
      </div>

      {isEditing ? (
        <form onSubmit={onSave} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-slate-700"}`}>Company name</label>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => onUpdateField("name", e.target.value)}
                placeholder="Company name"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-slate-700"}`}>Industry</label>
              <input
                type="text"
                value={draft.industry}
                onChange={(e) => onUpdateField("industry", e.target.value)}
                placeholder="Industry"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Stage</label>
              <input
                type="text"
                value={draft.stage}
                onChange={(e) => onUpdateField("stage", e.target.value)}
                placeholder="Stage (e.g. Seed)"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Company size</label>
              <input
                type="text"
                value={draft.companiesize}
                onChange={(e) => onUpdateField("companiesize", e.target.value)}
                placeholder="Company size"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Headquarters</label>
              <input
                type="text"
                value={draft.headquarters}
                onChange={(e) => onUpdateField("headquarters", e.target.value)}
                placeholder="Headquarters"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Founded year</label>
              <input
                type="number"
                value={draft.foundedYear}
                onChange={(e) => onUpdateField("foundedYear", e.target.value)}
                placeholder="Founded year"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Website URL</label>
              <input
                type="url"
                value={draft.website}
                onChange={(e) => onUpdateField("website", e.target.value)}
                placeholder="Website URL"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Incorporation date</label>
              <input
                type="date"
                value={draft.incorporationDate}
                onChange={(e) => onUpdateField("incorporationDate", e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Registration number</label>
              <input
                type="text"
                value={draft.registrationNumber}
                onChange={(e) => onUpdateField("registrationNumber", e.target.value)}
                placeholder="Registration number"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Tax identification number</label>
              <input
                type="text"
                value={draft.taxIdentificationNumber}
                onChange={(e) => onUpdateField("taxIdentificationNumber", e.target.value)}
                placeholder="Tax identification number"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Business license number</label>
              <input
                type="text"
                value={draft.businessLicenseNumber}
                onChange={(e) => onUpdateField("businessLicenseNumber", e.target.value)}
                placeholder="Business license number"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
            <div className={`flex items-center rounded-xl border px-3 py-2.5 ${isDark ? "border-zinc-700 bg-zinc-950" : "border-zinc-300 bg-white"}`}>
              <input
                id="isRegisteredCompany"
                type="checkbox"
                checked={draft.isRegisteredCompany}
                onChange={(e) => onUpdateField("isRegisteredCompany", e.target.checked)}
                className="h-4 w-4 accent-primary-600"
              />
              <label htmlFor="isRegisteredCompany" className={`ml-2 text-sm ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                Registered company
              </label>
            </div>
            <div>
              <label className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Logo URL</label>
              <input
                type="url"
                value={draft.logoUrl}
                onChange={(e) => onUpdateField("logoUrl", e.target.value)}
                placeholder="Logo URL"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
            <div className="md:col-span-2">
              <label className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Cover image URL</label>
              <input
                type="url"
                value={draft.coverImageUrl}
                onChange={(e) => onUpdateField("coverImageUrl", e.target.value)}
                placeholder="Cover image URL"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Company description</label>
            <textarea
              rows={4}
              value={draft.description}
              onChange={(e) => onUpdateField("description", e.target.value)}
              placeholder="Company description"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          {errorMessage ? <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p> : null}
          {successMessage ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{successMessage}</p> : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save company profile"}
            </button>
            <button
              type="button"
              onClick={onCancelEditing}
              disabled={isSaving}
              className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${isDark ? "border-zinc-600 text-zinc-300 hover:bg-zinc-800" : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"}`}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-5 space-y-6">
          {errorMessage ? <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p> : null}
          {successMessage ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{successMessage}</p> : null}
          <div className={`rounded-2xl border p-4 ${isDark ? "border-red-500/30 bg-red-500/10" : "border-red-200 bg-red-50/70"}`}>
            <h3 className={`text-sm font-semibold ${isDark ? "text-red-300" : "text-red-700"}`}>Danger zone</h3>
            <p className={`mt-1 text-xs ${isDark ? "text-red-200/90" : "text-red-600"}`}>
              Deleting a company is destructive and should be confirmed.
            </p>
            <button
              type="button"
              onClick={onShowDeleteConfirm}
              className="mt-3 rounded-xl border border-red-400 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              Delete company
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
