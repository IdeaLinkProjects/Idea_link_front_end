type VerificationBadgeProps = {
  verified: boolean;
};

export function VerificationBadge({ verified }: VerificationBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        verified
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
          : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
      }`}
    >
      {verified ? "Verified" : "Pending verification"}
    </span>
  );
}
