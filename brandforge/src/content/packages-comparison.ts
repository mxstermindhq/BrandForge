/** Copy-paste friendly package comparison for /packages/ */
export const PACKAGE_COMPARISON_ROWS = [
  { feature: "Best for", blueprint: "First launch", automator: "Ops automation", mvp: "Product sprints", ai: "Community + AI", enterprise: "Full squad" },
  { feature: "Price", blueprint: "$300–500", automator: "$1.5k–3k/mo", mvp: "$5k/mo", ai: "$7.5k/mo", enterprise: "$10k+/mo" },
  { feature: "Logo + brand kit", blueprint: "✓", automator: "Add-on", mvp: "✓", ai: "✓", enterprise: "✓" },
  { feature: "Landing page", blueprint: "✓", automator: "Add-on", mvp: "✓", ai: "✓", enterprise: "✓" },
  { feature: "n8n / Make workflows", blueprint: "—", automator: "✓", mvp: "Add-on", ai: "Add-on", enterprise: "✓" },
  { feature: "Custom web app / MVP", blueprint: "—", automator: "—", mvp: "✓", ai: "Add-on", enterprise: "✓" },
  { feature: "Discord bots + branding", blueprint: "Basic", automator: "—", mvp: "Add-on", ai: "✓", enterprise: "✓" },
  { feature: "Paid ads + GEO", blueprint: "—", automator: "CRO audits", mvp: "Strategy", ai: "Add-on", enterprise: "✓" },
  { feature: "Typical timeline", blueprint: "1–2 weeks", automator: "Monthly", mvp: "Monthly sprints", ai: "Monthly", enterprise: "Dedicated" },
] as const;

export function packageComparisonCopyText(): string {
  const header = "Feature\tBlueprint\tAutomator\tMVP Engine\tAI & Community\tFull-Stack\n";
  const rows = PACKAGE_COMPARISON_ROWS.map(
    (r) => `${r.feature}\t${r.blueprint}\t${r.automator}\t${r.mvp}\t${r.ai}\t${r.enterprise}`,
  );
  return header + rows.join("\n");
}
