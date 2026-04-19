import type { Metadata } from "next";
import { Suspense } from "react";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";
import { RequestDetailClient } from "./_components/RequestDetailClient";
import { fetchRequestForMetadata, requestBudgetSnippet } from "@/lib/metadata-api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const req = await fetchRequestForMetadata(id);
  const title = req?.title || "Request";
  const budget = requestBudgetSnippet(req);
  const budgetBit =
    budget != null && Number.isFinite(budget) ? `Budget $${budget.toLocaleString()}. ` : "";
  return {
    title,
    description: `${title} — ${budgetBit}Open brief on BrandForge.`,
    openGraph: { url: `https://brandforge.gg/requests/${id}` },
  };
}

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<PageRouteLoading title="Loading request" variant="inline" />}>
      <RequestDetailClient id={id} />
    </Suspense>
  );
}
