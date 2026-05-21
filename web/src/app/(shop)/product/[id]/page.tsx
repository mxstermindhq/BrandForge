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

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await fetchServiceById(id);
  if (!service) notFound();

  const backHref = service.ownerUsername ? `/${encodeURIComponent(service.ownerUsername)}` : "/#browse";
  const backLabel = service.ownerUsername ? `← @${service.ownerUsername}` : "← Browse";

  return <ServicePageClient service={service} backHref={backHref} backLabel={backLabel} />;
}
