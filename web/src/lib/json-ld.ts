import type { CuratedOperator } from "@/lib/schemas/operator.schema";
import type { OperatorService } from "@/content/operator-media";

const BASE = "https://brandforge.gg";

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BrandForge",
    url: BASE,
    description: "Curated directory of AI-native operators — introduced by mxstermind.",
  };
}

export function personJsonLd(operator: CuratedOperator) {
  const url = `${BASE}/${encodeURIComponent(operator.username)}`;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: operator.name,
    url,
    jobTitle: operator.role,
    description: operator.bio,
    knowsAbout: operator.skills,
  };
}

export function serviceJsonLd(
  service: OperatorService,
  operator: CuratedOperator,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.tagline,
    url: `${BASE}/offer/${encodeURIComponent(service.id)}`,
    provider: {
      "@type": "Person",
      name: operator.name,
      url: `${BASE}/${encodeURIComponent(operator.username)}`,
    },
    offers: {
      "@type": "Offer",
      price: service.price,
      priceCurrency: "USD",
    },
  };
}

export function creativeWorkJsonLd(
  title: string,
  description: string,
  image: string,
  operator: CuratedOperator,
  pieceId: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    description,
    image,
    url: `${BASE}/work/${encodeURIComponent(operator.username)}/${encodeURIComponent(pieceId)}`,
    author: {
      "@type": "Person",
      name: operator.name,
      url: `${BASE}/${encodeURIComponent(operator.username)}`,
    },
  };
}
