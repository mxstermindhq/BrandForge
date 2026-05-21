import Link from "next/link";
import type { ReactNode } from "react";

type ForgePageProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
  narrow?: boolean;
};

export function ForgePage({
  title,
  eyebrow,
  description,
  backHref = "/#browse",
  backLabel = "← Marketplace",
  children,
  narrow,
}: ForgePageProps) {
  return (
    <main className="forge-page">
      <div className={`forge-container forge-page-inner ${narrow ? "forge-page-inner-narrow" : ""}`}>
        <Link href={backHref} className="forge-back-link">
          {backLabel}
        </Link>
        {eyebrow ? <p className="forge-section-eyebrow forge-page-eyebrow">{eyebrow}</p> : null}
        <h1 className="forge-section-title forge-page-title">{title}</h1>
        {description ? <p className="forge-section-desc">{description}</p> : null}
        <div className="forge-page-body">{children}</div>
      </div>
    </main>
  );
}
