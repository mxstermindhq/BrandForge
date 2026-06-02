import { SiteFooter } from "@/components/shell/SiteFooter";
import { SiteHeader } from "@/components/shell/SiteHeader";
import { BreadcrumbNav } from "@/components/content/BreadcrumbNav";
import { SchemaInjector } from "@/components/content/SchemaInjector";
import type { BreadcrumbItem, FaqItem, SchemaInjectorProps, SchemaPageType } from "@/types/content";

type PageShellProps = {
  children: React.ReactNode;
  breadcrumbs: readonly BreadcrumbItem[];
  schemaType?: SchemaPageType;
  path: string;
  faqs?: readonly FaqItem[];
  serviceName?: string;
  serviceDescription?: string;
  creativeWork?: SchemaInjectorProps["creativeWork"];
  article?: SchemaInjectorProps["article"];
  showBreadcrumbs?: boolean;
};

/** Standard marketing page wrapper — header, schema, breadcrumbs, footer. */
export function PageShell({
  children,
  breadcrumbs,
  schemaType = "default",
  path,
  faqs,
  serviceName,
  serviceDescription,
  creativeWork,
  article,
  showBreadcrumbs = true,
}: PageShellProps): React.JSX.Element {
  return (
    <>
      <SchemaInjector
        pageType={schemaType}
        path={path}
        breadcrumbs={breadcrumbs}
        faqs={faqs}
        serviceName={serviceName}
        serviceDescription={serviceDescription}
        creativeWork={creativeWork}
        article={article}
      />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[500] focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:font-bold focus:text-white"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="min-h-[60vh]">
        {showBreadcrumbs ? (
          <div className="content-wrap pt-[100px]">
            <BreadcrumbNav items={breadcrumbs} />
          </div>
        ) : null}
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
