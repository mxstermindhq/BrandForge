/**
 * JSON-LD structured data generators for SEO
 * @see https://schema.org/
 */

// Base types
interface JsonLdThing {
  "@context": "https://schema.org";
  "@type": string;
  [key: string]: unknown;
}

// Organization structured data
export interface OrganizationData extends JsonLdThing {
  "@type": "Organization";
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs?: string[];
  foundingDate?: string;
  [key: string]: unknown;
}

// WebSite structured data with SearchAction
export interface WebSiteData extends JsonLdThing {
  "@type": "WebSite";
  name: string;
  url: string;
  potentialAction?: {
    "@type": "SearchAction";
    target: string;
    "query-input": string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// ProfilePage structured data (for Chronicle)
export interface ProfilePageData extends JsonLdThing {
  "@type": "ProfilePage";
  mainEntity: PersonData;
  dateModified?: string;
}

// Person structured data
export interface PersonData extends JsonLdThing {
  "@type": "Person";
  name: string;
  url?: string;
  image?: string;
  description?: string;
  jobTitle?: string;
  knowsAbout?: string[];
  worksFor?: { "@type": "Organization"; name: string };
  alumniOf?: { "@type": "Organization"; name: string }[];
  sameAs?: string[];
}

// Service structured data
export interface ServiceData extends JsonLdThing {
  "@type": "Service";
  name: string;
  provider: PersonData | OrganizationData;
  description?: string;
  url?: string;
  areaServed?: string;
  offers?: {
    "@type": "Offer";
    price?: string;
    priceCurrency?: string;
  };
}

// JobPosting structured data (for briefs/requests)
export interface JobPostingData extends JsonLdThing {
  "@type": "JobPosting";
  title: string;
  description: string;
  datePosted: string;
  hiringOrganization: {
    "@type": "Organization" | "Person";
    name: string;
  };
  jobLocation?: {
    "@type": "Place";
    address: {
      "@type": "PostalAddress";
      addressCountry?: string;
    };
  };
  baseSalary?: {
    "@type": "MonetaryAmount";
    currency: string;
    value: {
      "@type": "QuantitativeValue";
      minValue?: number;
      maxValue?: number;
      unitText: string;
    };
  };
}

// Product structured data (for plans)
export interface ProductData extends JsonLdThing {
  "@type": "Product";
  name: string;
  description: string;
  image?: string;
  offers?: {
    "@type": "Offer";
    price: string;
    priceCurrency: string;
    availability: string;
  };
}

// BreadcrumbList structured data
export interface BreadcrumbListData extends JsonLdThing {
  "@type": "BreadcrumbList";
  itemListElement: {
    "@type": "ListItem";
    position: number;
    name: string;
    item?: string;
    [key: string]: unknown;
  }[];
  [key: string]: unknown;
}

// SoftwareApplication structured data
export interface SoftwareApplicationData extends JsonLdThing {
  "@type": "SoftwareApplication";
  name: string;
  applicationCategory: string;
  operatingSystem: string;
  offers?: {
    "@type": "Offer";
    price: string;
    priceCurrency: string;
  };
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: string;
    ratingCount: string;
  };
}

// Review structured data
export interface ReviewData extends JsonLdThing {
  "@type": "Review";
  author: {
    "@type": "Person";
    name: string;
  };
  reviewRating: {
    "@type": "Rating";
    ratingValue: string;
    bestRating: string;
  };
  reviewBody?: string;
  datePublished?: string;
}

// Helper function to serialize JSON-LD safely
export function serializeJsonLd(data: JsonLdThing): string {
  return JSON.stringify(data);
}

// Generate Organization JSON-LD
export function generateOrganizationJsonLd(): OrganizationData {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BrandForge",
    url: "https://brandforge.gg",
    logo: "https://brandforge.gg/logo.png",
    description:
      "BrandForge is the marketplace and deal OS where specialists list services, buyers post briefs, and negotiations, contracts, and payments stay in one thread.",
    sameAs: [
      "https://twitter.com/BrandForge_gg",
      "https://www.linkedin.com/company/brandforge",
      "https://github.com/brandforge",
    ],
  };
}

// Generate WebSite JSON-LD with search
export function generateWebSiteJsonLd(): WebSiteData {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BrandForge",
    url: "https://brandforge.gg",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://brandforge.gg/marketplace?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
}

// Generate Person/Profile JSON-LD
export function generatePersonJsonLd(params: {
  name: string;
  username: string;
  bio?: string;
  avatarUrl?: string;
  skills?: string[];
  tier?: string;
  dealsCount?: number;
  rating?: number;
  location?: string;
  website?: string;
  linkedIn?: string;
  twitter?: string;
}): PersonData {
  const sameAs: string[] = [];
  if (params.linkedIn) sameAs.push(params.linkedIn);
  if (params.twitter) sameAs.push(`https://twitter.com/${params.twitter}`);
  if (params.website) sameAs.push(params.website);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: params.name,
    url: `https://brandforge.gg/u/${encodeURIComponent(params.username)}`,
    image: params.avatarUrl,
    description: params.bio,
    jobTitle: params.tier ? `${params.tier} Specialist` : "Specialist",
    knowsAbout: params.skills,
    worksFor: { "@type": "Organization", name: "BrandForge" },
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };
}

// Generate ProfilePage JSON-LD
export function generateProfilePageJsonLd(params: {
  name: string;
  username: string;
  bio?: string;
  avatarUrl?: string;
  skills?: string[];
  tier?: string;
  updatedAt?: string;
}): ProfilePageData {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: generatePersonJsonLd(params),
    dateModified: params.updatedAt,
  };
}

// Generate Service JSON-LD
export function generateServiceJsonLd(params: {
  title: string;
  description: string;
  providerName: string;
  providerUsername: string;
  price?: number;
  currency?: string;
  category?: string;
  url?: string;
}): ServiceData {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: params.title,
    description: params.description,
    url: params.url || `https://brandforge.gg/services/${params.title.toLowerCase().replace(/\s+/g, "-")}`,
    provider: generatePersonJsonLd({
      name: params.providerName,
      username: params.providerUsername,
    }),
    ...(params.price && {
      offers: {
        "@type": "Offer",
        price: String(params.price),
        priceCurrency: params.currency || "USD",
      },
    }),
  };
}

// Generate JobPosting JSON-LD for briefs
export function generateJobPostingJsonLd(params: {
  title: string;
  description: string;
  postedAt: string;
  clientName: string;
  budgetMin?: number;
  budgetMax?: number;
  currency?: string;
  location?: string;
  category?: string;
}): JobPostingData {
  const result: JobPostingData = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: params.title,
    description: params.description,
    datePosted: params.postedAt,
    hiringOrganization: {
      "@type": "Person",
      name: params.clientName,
    },
  };

  if (params.budgetMin || params.budgetMax) {
    result.baseSalary = {
      "@type": "MonetaryAmount",
      currency: params.currency || "USD",
      value: {
        "@type": "QuantitativeValue",
        minValue: params.budgetMin,
        maxValue: params.budgetMax,
        unitText: "PROJECT",
      },
    };
  }

  if (params.location) {
    result.jobLocation = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: params.location,
      },
    };
  }

  return result;
}

// Generate BreadcrumbList JSON-LD
export function generateBreadcrumbJsonLd(
  items: { name: string; url?: string }[]
): BreadcrumbListData {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Generate SoftwareApplication JSON-LD
export function generateSoftwareApplicationJsonLd(): SoftwareApplicationData {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "BrandForge",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

// Helper to serialize JSON-LD for manual script injection
export function getJsonLdScriptHtml(data: JsonLdThing | JsonLdThing[]): string {
  const items = Array.isArray(data) ? data : [data];
  return items
    .map(
      (item, index) =>
        `<script type="application/ld+json">${serializeJsonLd(item)}</script>`
    )
    .join("\n");
}
