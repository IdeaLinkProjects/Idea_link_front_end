import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { messages } from "@/locales";
import {
  useCompleteInnovatorProfileMutation,
  useCreateInnovatorProfileMutation,
  useGetInnovatorProfileQuery,
  useGetUserRolesStatusQuery,
} from "@/store";

type DraftProject = {
  projectName: string;
  outcome: string;
  year: string;
  description: string;
};

const emptyProject: DraftProject = {
  projectName: "",
  outcome: "FAILED",
  year: String(new Date().getFullYear()),
  description: "",
};

export function CompleteInnovatorProfileView() {
  const { locale, isDark } = useAppPreferences();
  const p = messages[locale].dashboardProfilePage;
  const { data: rolesStatus, isLoading: rolesStatusLoading } = useGetUserRolesStatusQuery();
  const profileAlreadyComplete = rolesStatus?.innovatorPrerequisites?.innovatorProfileComplete === true;

  const [createInnovatorProfile, { isLoading: isCreating }] = useCreateInnovatorProfileMutation();
  const [completeInnovatorProfile, { isLoading: isUpdating }] = useCompleteInnovatorProfileMutation();
  const { data: innovatorProfile } = useGetInnovatorProfileQuery(undefined, {
    skip: rolesStatusLoading || !profileAlreadyComplete,
  });

  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState("0");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [companyRole, setCompanyRole] = useState("");
  const [projects, setProjects] = useState<DraftProject[]>([{ ...emptyProject }]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [prefilledFromApi, setPrefilledFromApi] = useState(false);

  useEffect(() => {
    if (!innovatorProfile || prefilledFromApi) return;

    setBio(innovatorProfile.bio ?? "");
    setExperienceYears(String(innovatorProfile.experienceYears ?? 0));
    setLinkedinUrl(innovatorProfile.linkedinUrl ?? "");
    setWebsiteUrl(innovatorProfile.websiteUrl ?? "");
    setCompanyRole(innovatorProfile.companyRole ?? "");

    if (innovatorProfile.previousProjects?.length) {
      setProjects(
        innovatorProfile.previousProjects.map((project) => ({
          projectName: project.projectName ?? "",
          outcome: project.outcome || "FAILED",
          year: String(project.year ?? new Date().getFullYear()),
          description: project.description ?? "",
        })),
      );
    }
    setPrefilledFromApi(true);
  }, [innovatorProfile, prefilledFromApi]);

  function updateProject(index: number, key: keyof DraftProject, value: string) {
    setProjects((prev) => prev.map((project, i) => (i === index ? { ...project, [key]: value } : project)));
  }

  function addProject() {
    setProjects((prev) => [...prev, { ...emptyProject }]);
  }

  function removeProject(index: number) {
    setProjects((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const years = Number(experienceYears);
    if (!Number.isFinite(years) || years < 0) {
      setErrorMessage("Experience years must be a valid number (0 or more).");
      return;
    }
    if (!projects.length) {
      setErrorMessage("Please add at least one previous project.");
      return;
    }

    const mappedProjects = projects.map((project) => ({
      projectName: project.projectName.trim(),
      outcome: project.outcome.trim(),
      year: Number(project.year),
      description: project.description.trim(),
    }));

    const hasInvalidProject = mappedProjects.some(
      (project) => !project.projectName || !project.description || !Number.isFinite(project.year) || project.year < 0 || !project.outcome,
    );
    if (hasInvalidProject) {
      setErrorMessage("Each previous project must have name, outcome, valid year, and description.");
      return;
    }

    const payload = {
      bio: bio.trim(),
      experienceYears: years,
      linkedinUrl: linkedinUrl.trim(),
      websiteUrl: websiteUrl.trim(),
      companyRole: companyRole.trim(),
      previousProjects: mappedProjects,
    };

    try {
      const res = profileAlreadyComplete
        ? await completeInnovatorProfile(payload).unwrap()
        : await createInnovatorProfile(payload).unwrap();

      setSuccessMessage(
        res.message ??
          (profileAlreadyComplete ? "Innovator profile updated successfully." : "Innovator profile created successfully."),
      );
    } catch (err) {
      setErrorMessage(extractApiErrorMessage(err, "Could not save innovator profile. Please try again."));
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-1">
      <Link
        href="/dashboard/profile"
        className={`inline-flex text-sm font-semibold ${isDark ? "text-primary-400 hover:text-primary-300" : "text-primary-700 hover:text-primary-800"}`}
      >
        ← {p.backToProfile}
      </Link>
      <div
        className={`rounded-2xl border p-8 ${isDark ? "border-white/10 bg-zinc-900/50" : "border-zinc-200 bg-white shadow-sm"}`}
      >
        <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{p.completeInnovatorPageTitle}</h1>
        <p className={`mt-2 text-sm leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{p.completeInnovatorPageBody}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="companyRole" className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>
                Company role
              </label>
              <input
                id="companyRole"
                type="text"
                value={companyRole}
                onChange={(e) => setCompanyRole(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
            <div>
              <label htmlFor="experienceYears" className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>
                Experience years
              </label>
              <input
                id="experienceYears"
                type="number"
                min={0}
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="websiteUrl" className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>
                Website URL
              </label>
              <input
                id="websiteUrl"
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
            <div>
              <label htmlFor="linkedinUrl" className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>
                LinkedIn URL
              </label>
              <input
                id="linkedinUrl"
                type="text"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bio" className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div className={`rounded-xl border p-4 ${isDark ? "border-zinc-700 bg-zinc-900/50" : "border-zinc-200 bg-zinc-50/70"}`}>
            <div className="mb-3 flex items-center justify-between">
              <p className={`text-sm font-semibold ${isDark ? "text-zinc-100" : "text-zinc-800"}`}>Previous projects</p>
              <button
                type="button"
                onClick={addProject}
                className="rounded-lg border border-primary-500 px-2.5 py-1 text-xs font-semibold text-primary-600 hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-primary-950/40"
              >
                Add project
              </button>
            </div>

            <div className="space-y-3">
              {projects.map((project, idx) => (
                <div key={`project-${idx}`} className={`rounded-lg border p-3 ${isDark ? "border-zinc-700" : "border-zinc-200"}`}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={project.projectName}
                      onChange={(e) => updateProject(idx, "projectName", e.target.value)}
                      placeholder="Project name"
                      className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                    <select
                      value={project.outcome}
                      onChange={(e) => updateProject(idx, "outcome", e.target.value)}
                      className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    >
                      <option value="FAILED">FAILED</option>
                      <option value="SUCCESS">SUCCESS</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                    </select>
                    <input
                      type="number"
                      min={0}
                      value={project.year}
                      onChange={(e) => updateProject(idx, "year", e.target.value)}
                      placeholder="Year"
                      className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                    <button
                      type="button"
                      onClick={() => removeProject(idx)}
                      disabled={projects.length === 1}
                      className="rounded-lg border border-red-400 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-950/30"
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    value={project.description}
                    onChange={(e) => updateProject(idx, "description", e.target.value)}
                    rows={2}
                    placeholder="Description"
                    className="mt-3 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </div>
              ))}
            </div>
          </div>

          {errorMessage ? <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p> : null}
          {successMessage ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{successMessage}</p> : null}

          <button
            type="submit"
            disabled={isCreating || isUpdating || rolesStatusLoading}
            className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreating || isUpdating
              ? p.savingProfile
              : profileAlreadyComplete
                ? p.saveInnovatorProfileCta
                : p.submitInnovatorProfileCta}
          </button>
        </form>
      </div>
    </div>
  );
}
