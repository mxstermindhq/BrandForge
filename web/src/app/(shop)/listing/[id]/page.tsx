import type { Metadata } from "next";
import Link from "next/link";
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

  const backHref = "/marketplace";
  const backLabel = "← Marketplace";

  return <ServicePageClient service={service} backHref={backHref} backLabel={backLabel} />;
}
