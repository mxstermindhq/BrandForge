"use client";

import type { ReactNode } from "react";

interface JsonLdThing {
  "@context": "https://schema.org";
  "@type": string;
  [key: string]: unknown;
}

function serializeJsonLd(data: JsonLdThing): string {
  return JSON.stringify(data);
}

interface JsonLdScriptProps {
  data: JsonLdThing | JsonLdThing[];
}

/**
 * Renders JSON-LD structured data scripts for SEO
 * Usage: Place in your page component's JSX
 */
export function JsonLdScript({ data }: JsonLdScriptProps): ReactNode {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(item) }}
        />
      ))}
    </>
  );
}
