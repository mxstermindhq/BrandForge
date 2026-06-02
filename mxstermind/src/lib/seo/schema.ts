import { SITE } from "@/config/site";
import type { BreadcrumbItem, FaqItem, SchemaInjectorProps } from "@/types/content";

const ORG_ID = `${SITE.url}/#organization`;
const WEBSITE_ID = `${SITE.url}/#website`;

function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE.url}${normalized}`;
}

function organizationSchema(): Record<string, unknown> {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: "mxstermind",
    url: SITE.url,
    logo: `${SITE.url}/img/logo-mark-512.png`,
    sameAs: [SITE.discord, SITE.telegram],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      url: SITE.discord,
      availableLanguage: ["English"],
    },
  };
}

function breadcrumbSchema(items: readonly BreadcrumbItem[]): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href),
    })),
  };
}

function faqPageSchema(faqs: readonly FaqItem[]): Record<string, unknown> {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

function webSiteSchema(): Record<string, unknown> {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: "mxstermind",
    url: SITE.url,
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/blog/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/** Builds JSON-LD graph for a page type. */
export function buildPageSchema(props: SchemaInjectorProps): Record<string, unknown> {
  const graph: Record<string, unknown>[] = [
    organizationSchema(),
    breadcrumbSchema(props.breadcrumbs),
  ];

  if (props.pageType === "home") {
    graph.push(webSiteSchema());
  }

  if (props.faqs && props.faqs.length > 0) {
    graph.push(faqPageSchema(props.faqs));
  }

  if (props.pageType === "service" && props.serviceName) {
    graph.push({
      "@type": "Service",
      name: props.serviceName,
      description: props.serviceDescription,
      provider: { "@id": ORG_ID },
      areaServed: "Worldwide",
      url: absoluteUrl(props.path),
    });
  }

  if (props.pageType === "portfolio" && props.creativeWork) {
    graph.push({
      "@type": "CreativeWork",
      name: props.creativeWork.name,
      description: props.creativeWork.description,
      url: props.creativeWork.url,
      creator: { "@id": ORG_ID },
    });
  }

  if (props.pageType === "article" && props.article) {
    graph.push({
      "@type": "Article",
      headline: props.article.headline,
      description: props.article.description,
      datePublished: props.article.datePublished,
      url: props.article.url,
      author: {
        "@type": "Organization",
        name: "mxstermind",
        url: SITE.url,
      },
      publisher: { "@id": ORG_ID },
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
