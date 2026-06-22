import type { ReactNode } from "react";
import clsx from "clsx";
import { AtSign, Globe } from "lucide-react";
import Link from "next/link";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";

const SECTION_X = "px-8 sm:px-12 lg:px-16";

function SocialIcon({ children, href, label }: { children: ReactNode; href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-primary-800 transition hover:bg-primary-100 hover:text-primary-900 dark:text-primary-300 dark:hover:bg-primary-900/40"
    >
      {children}
    </a>
  );
}

export function PublicSiteFooter() {
  const { locale, isDark } = useAppPreferences();
  const f = messages[locale].footer;
  const year = new Date().getFullYear();

  const linkClass = clsx(
    "text-sm transition",
    isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-primary-900",
  );
  const headingClass = clsx(
    "text-xs font-bold uppercase tracking-wider",
    isDark ? "text-primary-400" : "text-primary-800",
  );

  return (
    <footer className="mt-auto">
      {/* Risk disclaimer */}
      <div
        className={clsx(
          "border-t",
          isDark ? "border-white/10 bg-zinc-950" : "border-zinc-200 bg-white",
        )}
      >
        <p
          className={clsx(
            SECTION_X,
            "mx-auto max-w-screen-2xl py-6 text-center text-xs leading-relaxed",
            isDark ? "text-zinc-500" : "text-zinc-500",
          )}
        >
          {f.disclaimer}
        </p>
      </div>

      {/* Main footer */}
      <div className={clsx(isDark ? "bg-primary-950/30" : "bg-[#f0f4f1]")}>
        <div className={clsx(SECTION_X, "mx-auto max-w-screen-2xl py-14")}>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link
                href="/"
                className={clsx(
                  "text-xl font-extrabold tracking-tight",
                  isDark ? "text-primary-300" : "text-primary-800",
                )}
              >
                IdealLink
              </Link>
              <p className={clsx("mt-3 max-w-xs text-sm leading-relaxed", isDark ? "text-zinc-400" : "text-zinc-600")}>
                {f.tagline}
              </p>
              <div className="mt-5 flex items-center gap-2">
                <SocialIcon href="https://idealink.et" label="IdealLink website">
                  <Globe className="h-4 w-4" aria-hidden />
                </SocialIcon>
                <SocialIcon href="mailto:hello@idealink.et" label="Email IdealLink">
                  <AtSign className="h-4 w-4" aria-hidden />
                </SocialIcon>
                <SocialIcon href="https://twitter.com" label="IdealLink social">
                  <span className="text-sm font-bold" aria-hidden>
                    𝕏
                  </span>
                </SocialIcon>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className={headingClass}>{f.productHeading}</h3>
              <ul className="mt-4 space-y-2.5">
                {f.productLinks.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className={headingClass}>{f.companyHeading}</h3>
              <ul className="mt-4 space-y-2.5">
                {f.companyLinks.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className={headingClass}>{f.legalHeading}</h3>
              <ul className="mt-4 space-y-2.5">
                {f.legalLinks.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className={clsx(
              "mt-12 border-t pt-8 text-center text-xs",
              isDark ? "border-white/10 text-zinc-500" : "border-zinc-300/60 text-zinc-500",
            )}
          >
            {f.copyright.replace("{year}", String(year))}
          </div>
        </div>
      </div>
    </footer>
  );
}
