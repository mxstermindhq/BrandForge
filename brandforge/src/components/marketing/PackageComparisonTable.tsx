import { CopyIntakeButton } from "@/components/marketing/CopyIntakeButton";
import { PACKAGE_COMPARISON_ROWS, packageComparisonCopyText } from "@/content/packages-comparison";

const COLUMNS = [
  { key: "blueprint" as const, label: "Blueprint" },
  { key: "automator" as const, label: "Automator" },
  { key: "mvp" as const, label: "MVP Engine" },
  { key: "ai" as const, label: "AI & Community" },
  { key: "enterprise" as const, label: "Full-Stack" },
];

export function PackageComparisonTable(): React.JSX.Element {
  return (
    <section className="border-t border-b1 bg-bg py-16" aria-labelledby="pkg-compare-title">
      <div className="content-wrap">
        <h2 id="pkg-compare-title" className="text-2xl font-bold">
          Compare tiers at a glance
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          Copy the table into Discord or your brief — every row maps to the five packages above.
        </p>
        <div className="mt-6 overflow-x-auto rounded-md border border-b1">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-b1 bg-s1">
                <th scope="col" className="p-3 font-mono text-[10px] uppercase tracking-wider text-muted">
                  Feature
                </th>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className="p-3 font-mono text-[10px] uppercase tracking-wider text-accent-bright"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PACKAGE_COMPARISON_ROWS.map((row) => (
                <tr key={row.feature} className="border-b border-b1 last:border-b-0">
                  <th scope="row" className="p-3 font-semibold text-text">
                    {row.feature}
                  </th>
                  {COLUMNS.map((col) => (
                    <td key={col.key} className="p-3 text-text-secondary">
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <CopyIntakeButton text={packageComparisonCopyText()} label="Copy comparison table" />
        </div>
      </div>
    </section>
  );
}
