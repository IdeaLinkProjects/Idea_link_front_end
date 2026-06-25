type CampaignFieldRuleHintProps = {
  isDark: boolean;
  rules: string[];
};

export function CampaignFieldRuleHint({ isDark, rules }: CampaignFieldRuleHintProps) {
  if (rules.length === 0) return null;

  const textClass = isDark ? "text-zinc-500" : "text-zinc-500";

  return (
    <ul className={`mt-1.5 list-disc space-y-0.5 pl-4 text-xs leading-relaxed ${textClass}`}>
      {rules.map((rule) => (
        <li key={rule}>{rule}</li>
      ))}
    </ul>
  );
}
