import type { DiscoveryIdeaView, PublicProjectBundle } from "@/lib/campaign/fromMyCampaign";
import type { messages } from "@/locales";

type ProjectDetailCopy = (typeof messages.en)["projectDetail"];

type ProjectHeroSectionProps = {
  isDark: boolean;
  p: ProjectDetailCopy;
  idea: DiscoveryIdeaView;
  bundle: PublicProjectBundle;
  catLabel: string;
};

export function ProjectHeroSection({ isDark, p, idea, bundle, catLabel }: ProjectHeroSectionProps) {
  const chip = isDark
    ? "inline-flex items-center gap-2 rounded-full border border-white/15 bg-zinc-900/90 px-3.5 py-1.5 text-sm font-medium text-zinc-100 shadow-md backdrop-blur-sm"
    : "inline-flex items-center gap-2 rounded-full border border-zinc-200/90 bg-white/95 px-3.5 py-1.5 text-sm font-medium text-zinc-800 shadow-sm backdrop-blur-sm";

  return (
    <div className="mb-8 sm:mb-10">
      <div
        className={`group relative overflow-hidden rounded-3xl border shadow-2xl ${
          isDark ? "border-white/10 shadow-black/50 ring-1 ring-white/[0.07]" : "border-zinc-200/90 shadow-zinc-900/15 ring-1 ring-black/[0.05]"
        }`}
      >
        <div className="relative aspect-[16/11] w-full sm:aspect-[2/1] lg:aspect-[21/9]">
          {/* eslint-disable-next-line @next/next/no-img-element -- campaign hero URLs come from the API */}
          <img src={idea.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent sm:from-black/80 sm:via-black/25" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:p-8">
            <h1 className="max-w-4xl text-2xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md sm:text-4xl lg:text-5xl">
              {idea.name}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={chip}>
                <span className="max-w-[10rem] truncate sm:max-w-xs">{bundle.innovatorName}</span>
                <span className="shrink-0 rounded-full bg-primary-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  {p.verifiedInnovator}
                </span>
              </span>
              <span className={chip}>
                <span aria-hidden className="text-lg">
                  {idea.categoryIcon}
                </span>
                <span>
                  {p.categoryLabel}: <span className="font-semibold">{catLabel || "—"}</span>
                </span>
              </span>
              <span className={chip}>
                <span className="opacity-80">{p.postedLabel}:</span>{" "}
                <span className="font-semibold tabular-nums">{bundle.postedDate}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`mt-6 rounded-2xl border px-5 py-5 sm:px-6 sm:py-6 ${
          isDark ? "border-white/10 bg-zinc-900/40 ring-1 ring-white/[0.05]" : "border-zinc-200/90 bg-white/80 ring-1 ring-black/[0.04] shadow-sm"
        }`}
      >
        <p className={`text-base leading-relaxed sm:text-lg ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>{idea.description}</p>
      </div>
    </div>
  );
}
