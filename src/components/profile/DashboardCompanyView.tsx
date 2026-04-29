import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { DashboardProfileCompanyCard } from "@/components/profile/DashboardProfileCompanyCard";
import { DashboardCompanyDeleteModal } from "@/components/profile/dashboard-company/DashboardCompanyDeleteModal";
import { DashboardCompanySettingsSection } from "@/components/profile/dashboard-company/DashboardCompanySettingsSection";
import { DashboardCompanyTabsNav } from "@/components/profile/dashboard-company/DashboardCompanyTabsNav";
import { DashboardCompanyTeamSection } from "@/components/profile/dashboard-company/DashboardCompanyTeamSection";
import { emptyDraft, type CompanyFormDraft, type CompanyTabKey, type TeamMemberDraft } from "@/components/profile/dashboard-company/types";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { messages } from "@/locales";
import { useCreateCompanyTeamMemberMutation, useDeleteCompanyMutation, useDeleteCompanyTeamMemberMutation, useGetCompanyTeamQuery, useGetMyCompanyQuery, useUpdateCompanyMutation, useUpdateCompanyTeamMemberMutation } from "@/store";

function toDraft(source: ReturnType<typeof useGetMyCompanyQuery>["data"]): CompanyFormDraft {
  if (!source) return { ...emptyDraft };
  return {
    name: source.name || "",
    industry: source.industry || "",
    description: source.description || "",
    website: source.website || "",
    incorporationDate: source.incorporationDate || "",
    registrationNumber: source.registrationNumber || "",
    taxIdentificationNumber: source.taxIdentificationNumber || "",
    businessLicenseNumber: source.businessLicenseNumber || "",
    isRegisteredCompany: Boolean(source.isRegisteredCompany),
    logoUrl: source.logoUrl || "",
    coverImageUrl: source.coverImageUrl || "",
    foundedYear: source.foundedYear != null ? String(source.foundedYear) : "",
    headquarters: source.headquarters || "",
    companiesize: source.companiesize || "",
    stage: source.stage || "",
  };
}

export function DashboardCompanyView() {
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale].companyPage;
  const profileT = messages[locale].dashboardProfilePage;
  const companyQuery = useGetMyCompanyQuery();
  const companyId = companyQuery.data?.id;
  const companyTeamQuery = useGetCompanyTeamQuery(
    { companyId: companyId ?? 0 },
    { skip: typeof companyId !== "number" },
  );
  const [updateCompany, { isLoading: isSaving }] = useUpdateCompanyMutation();
  const [createCompanyTeamMember, { isLoading: isCreatingMember }] = useCreateCompanyTeamMemberMutation();
  const [deleteCompanyTeamMember] = useDeleteCompanyTeamMemberMutation();
  const [updateCompanyTeamMember, { isLoading: isUpdatingMember }] = useUpdateCompanyTeamMemberMutation();
  const [deleteCompany] = useDeleteCompanyMutation();
  const [draft, setDraft] = useState<CompanyFormDraft>(emptyDraft);
  const [isEditing, setIsEditing] = useState(false);
  const [settingsErrorMessage, setSettingsErrorMessage] = useState<string | null>(null);
  const [teamErrorMessage, setTeamErrorMessage] = useState<string | null>(null);
  const [teamEditErrorMessage, setTeamEditErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CompanyTabKey>("overview");
  const [teamMembers, setTeamMembers] = useState<TeamMemberDraft[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [deletingMemberId, setDeletingMemberId] = useState<number | null>(null);
  const [updatingMemberId, setUpdatingMemberId] = useState<number | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMemberDraft | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const cardClass = isDark
    ? "border-white/15 bg-white/10 shadow-lg shadow-black/20"
    : "border-zinc-200 bg-white shadow-md shadow-zinc-200/60";

  const isCompanyNotFound = useMemo(() => {
    if (!companyQuery.isError) return false;
    const raw = companyQuery.error as
      | { status?: number | string; data?: { message?: string; status?: number } }
      | undefined;
    const status = Number(raw?.status ?? raw?.data?.status);
    const message = String(raw?.data?.message ?? "").toLowerCase();
    return status === 400 && message.includes("company not found");
  }, [companyQuery.error, companyQuery.isError]);

  useEffect(() => {
    if (!companyQuery.data) return;
    if (isEditing) return;
    setDraft(toDraft(companyQuery.data));
  }, [companyQuery.data, isEditing]);

  useEffect(() => {
    if (!companyTeamQuery.data) return;
    setTeamMembers(
      companyTeamQuery.data.map((member) => ({
        id: member.id,
        fullName: member.fullName,
        role: member.role,
        email: member.email,
        bio: member.bio,
        linkedinUrl: member.linkedinUrl,
        orderIndex: member.orderIndex,
        founder: member.founder,
      })),
    );
  }, [companyTeamQuery.data]);

  function updateField<K extends keyof CompanyFormDraft>(key: K, value: CompanyFormDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function startEditing() {
    setSettingsErrorMessage(null);
    setSuccessMessage(null);
    setDraft(toDraft(companyQuery.data));
    setIsEditing(true);
  }

  function cancelEditing() {
    setSettingsErrorMessage(null);
    setSuccessMessage(null);
    setDraft(toDraft(companyQuery.data));
    setIsEditing(false);
  }

  async function handleSave(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setSettingsErrorMessage(null);
    setSuccessMessage(null);

    if (!companyQuery.data?.id) {
      setSettingsErrorMessage("Company ID not found. Please reload and try again.");
      return;
    }

    if (!draft.name.trim() || !draft.industry.trim()) {
      setSettingsErrorMessage("Company name and industry are required.");
      return;
    }

    const foundedYearParsed = draft.foundedYear.trim() ? Number(draft.foundedYear) : null;
    if (draft.foundedYear.trim() && (!Number.isFinite(foundedYearParsed) || foundedYearParsed! < 1800)) {
      setSettingsErrorMessage("Founded year must be a valid year.");
      return;
    }

    try {
      await updateCompany({
        companyId: companyQuery.data.id,
        body: {
          name: draft.name.trim(),
          industry: draft.industry.trim(),
          description: draft.description.trim(),
          website: draft.website.trim(),
          incorporationDate: draft.incorporationDate.trim(),
          registrationNumber: draft.registrationNumber.trim(),
          taxIdentificationNumber: draft.taxIdentificationNumber.trim(),
          businessLicenseNumber: draft.businessLicenseNumber.trim(),
          isRegisteredCompany: draft.isRegisteredCompany,
          logoUrl: draft.logoUrl.trim(),
          coverImageUrl: draft.coverImageUrl.trim(),
          foundedYear: foundedYearParsed,
          headquarters: draft.headquarters.trim(),
          companiesize: draft.companiesize.trim(),
          stage: draft.stage.trim(),
        },
      }).unwrap();

      setSuccessMessage("Company profile updated successfully.");
      setIsEditing(false);
    } catch (err) {
      setSettingsErrorMessage(extractApiErrorMessage(err, "Could not update company profile. Please try again."));
    }
  }

  async function handleAddTeamMember() {
    if (!companyId) {
      setTeamErrorMessage("Company ID not found. Please reload and try again.");
      return;
    }
    if (!newMemberName.trim() || !newMemberRole.trim()) {
      setTeamErrorMessage("Member name and role are required.");
      return;
    }
    setTeamErrorMessage(null);
    try {
      await createCompanyTeamMember({
        companyId,
        body: {
          fullName: newMemberName.trim(),
          role: newMemberRole.trim(),
          email: newMemberEmail.trim() || undefined,
        },
      }).unwrap();
      setNewMemberName("");
      setNewMemberRole("");
      setNewMemberEmail("");
    } catch (err) {
      setTeamErrorMessage(extractApiErrorMessage(err, "Could not add team member. Please try again."));
    }
  }

  async function handleRemoveTeamMember(id: number) {
    const targetMember = teamMembers.find((member) => member.id === id);
    if (targetMember?.founder) {
      setTeamErrorMessage("You can't remove the founder.");
      return;
    }

    if (!companyId) {
      setTeamErrorMessage("Company ID not found. Please reload and try again.");
      return;
    }
    setTeamErrorMessage(null);
    setDeletingMemberId(id);
    try {
      await deleteCompanyTeamMember({ companyId, memberId: id }).unwrap();
    } catch (err) {
      setTeamErrorMessage(extractApiErrorMessage(err, "Could not remove team member. Please try again."));
    } finally {
      setDeletingMemberId(null);
    }
  }

  function openEditMember(memberId: number) {
    const targetMember = teamMembers.find((member) => member.id === memberId);
    if (!targetMember) return;
    setTeamErrorMessage(null);
    setTeamEditErrorMessage(null);
    setEditingMember({ ...targetMember });
  }

  function closeEditMember() {
    if (isUpdatingMember) return;
    setTeamEditErrorMessage(null);
    setEditingMember(null);
  }

  async function handleSaveTeamMember() {
    if (!companyId) {
      setTeamEditErrorMessage("Company ID not found. Please reload and try again.");
      return;
    }

    const targetMember = editingMember;
    if (!targetMember) {
      setTeamEditErrorMessage("Team member not found.");
      return;
    }

    if (!targetMember.fullName.trim() || !targetMember.role.trim()) {
      setTeamEditErrorMessage("Member name and role are required.");
      return;
    }

    setTeamEditErrorMessage(null);
    setUpdatingMemberId(targetMember.id);
    try {
      await updateCompanyTeamMember({
        companyId,
        memberId: targetMember.id,
        body: {
          fullName: targetMember.fullName.trim(),
          role: targetMember.role.trim(),
          bio: targetMember.bio ?? "",
          linkedinUrl: targetMember.linkedinUrl ?? "",
          email: targetMember.email?.trim() || "",
          orderIndex: Number.isFinite(targetMember.orderIndex) ? targetMember.orderIndex : 0,
        },
      }).unwrap();
      setTeamEditErrorMessage(null);
      setEditingMember(null);
    } catch (err) {
      setTeamEditErrorMessage(extractApiErrorMessage(err, "Could not update team member. Please try again."));
    } finally {
      setUpdatingMemberId(null);
    }
  }

  async function handleDeleteCompany() {
    if (!companyQuery.data?.id) {
      setShowDeleteConfirm(false);
      setSettingsErrorMessage("Company ID not found. Please reload and try again.");
      return;
    }

    setSettingsErrorMessage(null);
    setShowDeleteConfirm(false);
    setSuccessMessage(null);
    try {
      const res = await deleteCompany({ companyId: companyQuery.data.id }).unwrap();
      setSuccessMessage(res.message ?? "Company deleted successfully.");
      setIsEditing(false);
      setDraft({ ...emptyDraft });
      setTeamMembers([]);
      setActiveTab("overview");
    } catch (err) {
      setSettingsErrorMessage(extractApiErrorMessage(err, "Could not delete company. Please try again."));
    }
  }

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-6 pb-4">
        <div className={`rounded-3xl border px-6 py-7 sm:px-8 ${isDark ? "border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950" : "border-zinc-200 bg-gradient-to-br from-white to-zinc-50"}`}>
          <h1 className={`text-2xl font-bold tracking-tight sm:text-3xl ${isDark ? "text-white" : "text-zinc-900"}`}>{t.title}</h1>
          <p className={`mt-2 text-sm sm:text-base ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.subtitle}</p>
        </div>

        {isCompanyNotFound ? (
          <section className={`rounded-3xl border p-6 sm:p-8 ${isDark ? "border-white/10 bg-gradient-to-br from-zinc-900/80 to-zinc-950/90" : "border-zinc-200 bg-gradient-to-br from-white to-zinc-50"}`}>
            <h2 className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>No company yet</h2>
            <p className={`mt-2 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              You don&apos;t have a company profile yet. Create one to manage team members and settings.
            </p>
            <Link
              href="/dashboard/company/create"
              className="mt-4 inline-flex rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Create your company
            </Link>
          </section>
        ) : (
          <DashboardCompanyTabsNav isDark={isDark} activeTab={activeTab} onTabChange={setActiveTab} />
        )}

        {!isCompanyNotFound && activeTab === "overview" ? (
          <DashboardProfileCompanyCard
            data={companyQuery.data}
            error={companyQuery.isError ? companyQuery.error : undefined}
            isLoading={companyQuery.isLoading || companyQuery.isFetching}
            isDark={isDark}
            cardClass={cardClass}
            t={profileT}
          />
        ) : null}

        {!isCompanyNotFound && activeTab === "team" ? (
          <DashboardCompanyTeamSection
            isDark={isDark}
            teamMembers={teamMembers}
            isLoading={companyTeamQuery.isLoading || companyTeamQuery.isFetching}
            isCreating={isCreatingMember}
            isUpdating={isUpdatingMember}
            deletingMemberId={deletingMemberId}
            updatingMemberId={updatingMemberId}
            errorMessage={
              teamErrorMessage ??
              (companyTeamQuery.isError ? extractApiErrorMessage(companyTeamQuery.error, "Could not load team members.") : null)
            }
            editErrorMessage={teamEditErrorMessage}
            editingMember={editingMember}
            newMemberName={newMemberName}
            newMemberRole={newMemberRole}
            newMemberEmail={newMemberEmail}
            setNewMemberName={setNewMemberName}
            setNewMemberRole={setNewMemberRole}
            setNewMemberEmail={setNewMemberEmail}
            onAddMember={handleAddTeamMember}
            onRemoveMember={handleRemoveTeamMember}
            onEditMember={openEditMember}
            onCloseEditMember={closeEditMember}
            onEditMemberChange={setEditingMember}
            onSaveMember={handleSaveTeamMember}
          />
        ) : null}

        {!isCompanyNotFound && activeTab === "settings" ? (
          <DashboardCompanySettingsSection
            isDark={isDark}
            isEditing={isEditing}
            hasCompany={Boolean(companyQuery.data)}
            draft={draft}
            isSaving={isSaving}
            errorMessage={settingsErrorMessage}
            successMessage={successMessage}
            onStartEditing={startEditing}
            onCancelEditing={cancelEditing}
            onSave={handleSave}
            onShowDeleteConfirm={() => setShowDeleteConfirm(true)}
            onUpdateField={updateField}
          />
        ) : null}
      </div>

      {showDeleteConfirm ? (
        <DashboardCompanyDeleteModal
          isDark={isDark}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirmDelete={handleDeleteCompany}
        />
      ) : null}
    </>
  );
}
