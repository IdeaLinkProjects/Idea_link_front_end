import Link from "next/link";

type EmptyWalletStateProps = {
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
};

export function EmptyWalletState({ title, description, ctaLabel, href }: EmptyWalletStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">💼</div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">{description}</p>
      <Link
        href={href}
        className="mt-4 inline-flex rounded-lg bg-primary-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-900"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
