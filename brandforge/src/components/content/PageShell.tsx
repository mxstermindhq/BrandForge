import { ForgeHeader } from "@/components/shell/ForgeHeader";
import { ForgeFooter } from "@/components/shell/ForgeFooter";
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
  reviews?: SchemaInjectorProps["reviews"];
  products?: SchemaInjectorProps["products"];
  howTo?: SchemaInjectorProps["howTo"];
  showBreadcrumbs?: boolean;
};

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
  reviews,
  products,
  howTo,
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
        reviews={reviews}
        products={products}
        howTo={howTo}
      />
      <ForgeHeader />
      <main id="main" className="min-h-[60vh] pt-16">
        {showBreadcrumbs ? (
          <div className="content-wrap pt-4">
            <BreadcrumbNav items={breadcrumbs} />
          </div>
        ) : null}
        {children}
      </main>
      <ForgeFooter />
    </>
  );
}
