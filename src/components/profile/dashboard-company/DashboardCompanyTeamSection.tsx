import type { TeamMemberDraft } from "@/components/profile/dashboard-company/types";

type Props = {
  isDark: boolean;
  teamMembers: TeamMemberDraft[];
  isLoading?: boolean;
  isCreating?: boolean;
  isUpdating?: boolean;
  deletingMemberId?: number | null;
  updatingMemberId?: number | null;
  errorMessage?: string | null;
  editErrorMessage?: string | null;
  editingMember: TeamMemberDraft | null;
  newMemberName: string;
  newMemberRole: string;
  newMemberEmail: string;
  setNewMemberName: (value: string) => void;
  setNewMemberRole: (value: string) => void;
  setNewMemberEmail: (value: string) => void;
  onEditMemberChange: (value: TeamMemberDraft | null) => void;
  onAddMember: () => void;
  onRemoveMember: (id: number) => void;
  onEditMember: (id: number) => void;
  onCloseEditMember: () => void;
  onSaveMember: () => void;
};

export function DashboardCompanyTeamSection({
  isDark,
  teamMembers,
  isLoading,
  isCreating,
  isUpdating,
  deletingMemberId,
  updatingMemberId,
  errorMessage,
  editErrorMessage,
  editingMember,
  newMemberName,
  newMemberRole,
  newMemberEmail,
  setNewMemberName,
  setNewMemberRole,
  setNewMemberEmail,
  onEditMemberChange,
  onAddMember,
  onRemoveMember,
  onEditMember,
  onCloseEditMember,
  onSaveMember,
}: Props) {
  return (
    <section className={`rounded-3xl border p-6 sm:p-8 ${isDark ? "border-white/10 bg-gradient-to-br from-zinc-900/80 to-zinc-950/90 shadow-xl shadow-black/20" : "border-slate-300 bg-gradient-to-br from-white via-slate-50 to-primary-50/25 shadow-md shadow-slate-200/70"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>Team members</h2>
          <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>Manage members, roles, and contact details.</p>
        </div>
      </div>

      <div className={`mt-5 rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-300 bg-white/85 shadow-sm shadow-slate-200/40"}`}>
        <h3 className={`text-sm font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>Add member</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <input
            type="text"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="Full name"
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <input
            type="text"
            value={newMemberRole}
            onChange={(e) => setNewMemberRole(e.target.value)}
            placeholder="Role"
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <input
            type="email"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>
        <button
          type="button"
          onClick={onAddMember}
          disabled={Boolean(isCreating)}
          className="mt-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCreating ? "Adding..." : "+ Add Member"}
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {isLoading ? <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>Loading team members...</p> : null}
        {errorMessage ? <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p> : null}
        {teamMembers.length ? (
          teamMembers.map((member) => (
            <div key={member.id} className={`rounded-2xl border p-4 transition ${isDark ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]" : "border-slate-300 bg-white/95 hover:bg-slate-50"}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className={`text-sm font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{member.fullName}</p>
                  <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{member.email || "No email"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`text-xs font-semibold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>{member.role || "No role"}</p>
                  {!member.founder ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEditMember(member.id)}
                        className="rounded-xl border border-primary-400 px-3 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-primary-950/30"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveMember(member.id)}
                        disabled={deletingMemberId === member.id}
                        className="inline-flex items-center gap-1 rounded-xl border border-red-400 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-red-950/30"
                        aria-label={`Delete ${member.fullName}`}
                        title="Delete member"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h8" />
                        </svg>
                        {deletingMemberId === member.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className={`text-sm ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>No team members yet.</p>
        )}
      </div>

      {editingMember ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className={`w-full max-w-xl rounded-2xl border p-6 ${isDark ? "border-white/10 bg-zinc-900" : "border-zinc-200 bg-white"}`}>
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>Edit team member</h3>
            <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>Update member info and save changes.</p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                type="text"
                value={editingMember.fullName}
                onChange={(e) => onEditMemberChange({ ...editingMember, fullName: e.target.value })}
                placeholder="Full name"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
              <input
                type="text"
                value={editingMember.role}
                onChange={(e) => onEditMemberChange({ ...editingMember, role: e.target.value })}
                placeholder="Role"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
              <input
                type="email"
                value={editingMember.email}
                onChange={(e) => onEditMemberChange({ ...editingMember, email: e.target.value })}
                placeholder="Email"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
              <input
                type="number"
                value={editingMember.orderIndex}
                onChange={(e) => onEditMemberChange({ ...editingMember, orderIndex: Number(e.target.value) })}
                placeholder="Order index"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
              <input
                type="url"
                value={editingMember.linkedinUrl ?? ""}
                onChange={(e) => onEditMemberChange({ ...editingMember, linkedinUrl: e.target.value })}
                placeholder="LinkedIn URL"
                className="md:col-span-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
              <textarea
                rows={3}
                value={editingMember.bio ?? ""}
                onChange={(e) => onEditMemberChange({ ...editingMember, bio: e.target.value })}
                placeholder="Bio"
                className="md:col-span-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
            {editErrorMessage ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{editErrorMessage}</p> : null}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onCloseEditMember}
                disabled={Boolean(isUpdating) && updatingMemberId === editingMember.id}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold ${isDark ? "border-zinc-600 text-zinc-300 hover:bg-zinc-800" : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"} disabled:cursor-not-allowed disabled:opacity-60`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSaveMember}
                disabled={Boolean(isUpdating) && updatingMemberId === editingMember.id}
                className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {Boolean(isUpdating) && updatingMemberId === editingMember.id ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
