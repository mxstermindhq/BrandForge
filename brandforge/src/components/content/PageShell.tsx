import { SiteFooter } from "@/components/shell/SiteFooter";
import { ContactActionBar } from "@/components/shell/ContactActionBar";
import { StaticSiteHeader } from "@/components/shell/StaticSiteHeader";
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
      <StaticSiteHeader />
      <ContactActionBar />
      <main id="main" className="min-h-[60vh]">
        {showBreadcrumbs ? (
          <div className="content-wrap pt-[148px]">
            <BreadcrumbNav items={breadcrumbs} />
          </div>
        ) : null}
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
