import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ServicePageClient } from "@/components/listings/ServicePageClient";
import { fetchServiceById } from "@/lib/fetch-service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const service = await fetchServiceById(id);
  if (!service) return { title: "Listing not found" };
  return {
    title: service.title,
    description: service.tagline,
  };
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await fetchServiceById(id);
  if (!service) notFound();

  return (
    <Suspense
      fallback={
        <main className="forge-page p-12 text-center text-sm text-[var(--forge-text-muted)]">Loading…</main>
      }
    >
      <ServicePageClient service={service} backHref="/marketplace" backLabel="← Marketplace" />
    </Suspense>
  );
}
