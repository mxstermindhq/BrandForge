import Link from "next/link";
import type { BreadcrumbItem } from "@/types/content";

type BreadcrumbNavProps = {
  items: readonly BreadcrumbItem[];
};

/** Visible breadcrumb trail — pairs with BreadcrumbList schema. */
export function BreadcrumbNav({ items }: BreadcrumbNavProps): React.JSX.Element {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-2">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {isLast ? (
                <span className="text-text-secondary" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-accent-bright" data-cursor="hover">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
